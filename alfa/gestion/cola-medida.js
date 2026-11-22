// Fans Of · /gestion, pestaña COLA: cómo se mide cada trabajo. Tipo y precio de referencia de cada recurso (gemelo de herramientas/cola-actions/hooks/precios.ts) y la medida de
// los workflows: duración de un run y, para «Generar recurso», la cadencia de la GPU de Yoshi por tipo de pedido (gemelo de herramientas/cola-actions/hooks/medida.ts).
// Funciones puras sobre lo que devuelve la API de GitHub; las usa cola.js. Guía: docs/guia/herramientas/cola-actions.md.
'use strict';
const COLA_MEDIDA = (() => {
  const MUESTRAS = 20, MIN_FIABLE = 3;   // MIN_FIABLE: con menos muestras de su tipo, una media de «Generar recurso» no se enseña (un solo vídeo de 50 min no sirve de media)   // runs correctos por workflow (y por tipo en Generar recurso) que forman la media
  const ms = s => s ? Date.parse(s) : NaN;
  // Lo que costaría generar cada tipo con una API de pago (USD por recurso): tabla de referencia que dio Gemini el 29-10-2026, sin verificar (se corrige aquí). Gemelo de herramientas/cola-actions/hooks/precios.ts.
  const USD = { imagen: 0.04, cancion: 0.08, efecto: 0.002 * 4, video: 0.03 * 5, modelo3d: 0.2 };
  const ETIQUETA = { imagen: 'imagen', cancion: 'canción', efecto: 'efecto de sonido', video: 'vídeo', modelo3d: 'modelo 3D' };
  const EFECTO_MAX_BYTES = 400 * 1024;   // un MP3 V0 de ~4 s pesa ~120 KB y una canción de 30 s ~900 KB
  // Un lote de Yoshi (N imágenes del mismo workflow en un run) lleva «×N» y, si ya hay megapíxeles, «~7 min» (estimación del run entero) dentro de los corchetes.
  const MINUTOS_IMAGEN_LOTE = 0.4;   // estimación por unidades de una imagen en lote, en minutos (gemelo de MINUTOS_IMAGEN_LOTE en herramientas/comfyui/encolado/tope_cola.py)
  const LOTES_COMPARADOS = 5;        // últimos lotes terminados con los que se compara el tiempo real con las estimaciones
  function leerTitulo(t) {   // «Generar [imagen]: Logo» (o «Generar [imagen ×20 · ~7 min]: x», o el antiguo «Generar: Logo») -> tipo, variantes, estimado (min) y título
    const m = /^Generar(?:\s*\[([^\]]*)\])?:\s*/.exec(t);
    if (!m) return { titulo: t, tipo: null, variantes: 1, estimado: null };
    const dentro = m[1] || '', v = /×\s*(\d+)/.exec(dentro), e = /~\s*(\d+(?:[.,]\d+)?)\s*min/.exec(dentro);
    const tipo = dentro.split(/[×·]/)[0].trim().toLowerCase();
    return { titulo: t.slice(m[0].length), tipo: tipo && tipo !== 'recurso' ? tipo : null, variantes: v ? Math.max(1, Number(v[1])) : 1, estimado: e ? Number(e[1].replace(',', '.')) : null };
  }
  // Un run de «Generar recurso» con variantes > 1 es un lote; el título de otro workflow no cuenta.
  const variantesDe = r => esGenerar(r) ? leerTitulo(String(r.display_title || '')).variantes : 1;
  function tipoDeTitulo(tipo, bytes) {   // el tipo que puso encolar.py en el título; el audio se parte por tamaño
    if (tipo === 'imagen') return 'imagen';
    if (tipo === 'video') return 'video';
    if (tipo === '3d') return 'modelo3d';
    if (tipo === 'audio') return bytes > 0 && bytes < EFECTO_MAX_BYTES ? 'efecto' : 'cancion';
    return null;
  }
  // El `name` de un run es su run-name («Generar [imagen]: Logo»), no el del workflow: el workflow se identifica por su archivo.
  const etiquetaWf = r => { const f = String(r.path || '').split('/').pop().replace(/\.ya?ml$/, '').replace(/-/g, ' '); return f ? f[0].toUpperCase() + f.slice(1) : String(r.name); };
  const esGenerar = r => String(r.path || '').endsWith('generar-recurso.yml');
  /** El carril (runner) de un trabajo por las etiquetas de su runs-on: 'github' si son de GitHub (ubuntu-…, windows-…, macos-…) y si no la de Yoshi.
   *  Desde el ADR 172 los workflows de Yoshi piden solo su etiqueta (`yoshi-smoke-test`), sin `self-hosted`: no basta con buscar `self-hosted`. */
  const ALOJADA = /^(ubuntu|windows|macos)-/;
  function carrilDe(L) {
    const propia = L.find(l => l !== 'self-hosted' && !ALOJADA.test(l));
    return propia || (L.includes('self-hosted') ? 'self-hosted' : 'github');
  }
  function duracionRun(jobs) {
    const ok = jobs.filter(j => j.conclusion === 'success' && j.started_at && j.completed_at); if (!ok.length) return null;
    return Math.max(1, Math.round((Math.max(...ok.map(j => ms(j.completed_at))) - Math.min(...ok.map(j => ms(j.started_at)))) / 1000));
  }
  // «Generar recurso» se mide por tipo de pedido: «Generar recurso · video»; sin tipo en el título (pedidos antiguos o a mano) cuenta como imagen. El workflow a secas es la media de todos los tipos, de reserva.
  // Un lote (variantes > 1) tiene su propio flujo, «Generar recurso · imagen en lote» (o «<tipo> en lote»), cuya media es por pieza.
  function flujoDe(r) {
    const f = etiquetaWf(r); if (!esGenerar(r)) return f;
    const t = leerTitulo(String(r.display_title || ''));
    return f + ' · ' + ((t.tipo || 'imagen') + (t.variantes > 1 ? ' en lote' : ''));
  }
  function duracionPaso(jobs) {   // el paso «Generar con ComfyUI» del primer job (lo que ocupó la GPU si no esperaba a nadie); sin él, la duración del run
    const p = ((jobs[0] || {}).steps || []).find(s => s.name === 'Generar con ComfyUI' && s.conclusion === 'success' && s.started_at && s.completed_at);
    return p ? Math.max(1, Math.round((ms(p.completed_at) - ms(p.started_at)) / 1000)) : duracionRun(jobs);
  }
  // Cadencia de «Generar recurso»: la GPU va de uno en uno (cola de ComfyUI) aunque haya varios runners, así que la duración de un job incluye lo que esperó a los de delante.
  // Cada run correcto da una muestra: si entró en cola antes de que acabara el anterior (acabaron seguidos), la separación entre sus updated_at; si no esperaba a nadie, su paso (caché).
  const entra = r => Math.max(ms(r.created_at), ms(r.run_started_at) || 0);   // al crearlo o, si se relanzó, al relanzarlo (created_at es el del primer intento)
  const generados = hechos => hechos.filter(r => esGenerar(r) && (r.conclusion === 'success' || r.conclusion === 'failure')).sort((a, b) => ms(a.updated_at) - ms(b.updated_at));
  // Lo que tardó el run gen[i] (segundos): la separación con el anterior si esperaba, su paso (caché) si no; { pide: true } si falta el paso; {} si no hay dato.
  function segundosDe(gen, i, cache) {
    const r = gen[i], prev = gen[i - 1];
    if (prev && entra(r) < ms(prev.updated_at)) return { seg: Math.max(1, Math.round((ms(r.updated_at) - ms(prev.updated_at)) / 1000)) };
    if (cache[r.id] === undefined) return { pide: true };
    return cache[r.id] > 0 ? { seg: cache[r.id] } : {};
  }
  const porPieza = (seg, n) => n > 1 ? Math.max(1, Math.round(seg / n)) : seg;   // la muestra de un lote es por imagen
  function cadencias(hechos, cache) {
    const gen = generados(hechos), muestras = {}, piden = [];
    for (let i = gen.length - 1; i >= 0; i--) {
      const r = gen[i]; if (r.conclusion !== 'success') continue;
      const m = muestras[flujoDe(r)] || (muestras[flujoDe(r)] = []); if (m.length >= MUESTRAS) continue;
      const s = segundosDe(gen, i, cache);
      if (s.pide) piden.push(r); else if (s.seg) m.push(porPieza(s.seg, variantesDe(r)));
    }
    return { muestras, piden };
  }
  const media = d => Math.round(d.reduce((a, b) => a + b, 0) / d.length);
  // Piezas entregadas por un run de «Generar recurso»: las de un lote en success son todas sus variantes. Un lote acabado en failure entrega las buenas (sube el artefacto), y
  // cuántas fallaron solo lo dice su run de reintento («Generar [imagen ×K …]: Repetir <run_id>: …», encolar.py repetir): entregadas = variantes − K. Sin run de reintento
  // terminado no se sabe cuántas fallaron y no cuenta (como un suelto fallido). `reintentos` es el mapa de reintentos(hechos).
  function reintentos(hechos) {   // id del run repetido -> variantes de su último reintento
    const m = {};
    hechos.filter(esGenerar).sort((a, b) => ms(a.created_at) - ms(b.created_at)).forEach(r => {
      const t = leerTitulo(String(r.display_title || '')), x = /^Repetir (\d+):/.exec(t.titulo);
      if (x) m[x[1]] = t.variantes;
    });
    return m;
  }
  function entregadas(r, reint) {
    const n = variantesDe(r);
    if (r.conclusion === 'success') return n;
    return r.conclusion === 'failure' && n > 1 && reint[r.id] !== undefined ? Math.max(0, n - reint[r.id]) : 0;
  }
  // Raros: más del triple de la mediana y 10 min por encima es que la GPU hizo otra cosa (un intento fallido relanzado, un cambio de modelo, el runner apagado).
  const tope = d => { const med = [...d].sort((a, b) => a - b)[Math.floor(d.length / 2)]; return Math.max(3 * med, med + 600); };
  function lotesImagen(hechos, cache) {   // los últimos LOTES_COMPARADOS lotes de imagen en success con duración: { seg, v, est }
    const gen = generados(hechos), l = [];
    for (let i = gen.length - 1; i >= 0 && l.length < LOTES_COMPARADOS; i--) {
      const r = gen[i], t = leerTitulo(String(r.display_title || '')), s = r.conclusion === 'success' && t.variantes > 1 && (t.tipo || 'imagen') === 'imagen' ? segundosDe(gen, i, cache) : {};
      if (s.seg) l.push({ seg: s.seg, v: t.variantes, est: t.estimado });
    }
    return l;
  }
  const suma = (l, f) => l.reduce((a, x) => a + f(x), 0);
  /** Con los últimos lotes de imagen terminados bien y con duración (sin los raros, como mediaCadencia): el tiempo real por imagen frente a las dos estimaciones por imagen, por unidades (0,4 min) y por megapíxeles
   *  (ponderada: Σ estimado × 60 / Σ variantes, de los lotes que traen «~M min»; ese minuto va redondeado hacia arriba; null si ninguno). { n, real, unidades, megapixeles } en segundos, o null sin lotes medidos. */
  function compararLotes(hechos, cache) {
    const l0 = lotesImagen(hechos, cache); if (!l0.length) return null;
    const lim = tope(l0.map(x => x.seg / x.v)), l = l0.filter(x => x.seg / x.v <= lim), e = l.filter(x => x.est !== null);
    return { n: l.length, real: Math.round(suma(l, x => x.seg) / suma(l, x => x.v)), unidades: Math.round(MINUTOS_IMAGEN_LOTE * 60), megapixeles: e.length ? Math.round(suma(e, x => x.est * 60) / suma(e, x => x.v)) : null };
  }
  /** Lo que se estima que tarda un pedido de «Generar recurso»: variantes × la media por imagen del lote (o la media del tipo si es suelto); null sin media fiable. */
  const tiempoDe = (m, variantes) => { const s = mediaFiable(m); return s === null ? null : s * (variantes > 1 ? variantes : 1); };
  /** Un recurso terminado a partir de lo guardado: un lote cuenta como sus variantes (n recursos de imagen y n veces su precio). */
  function recursoDe(id, v) {
    const p = leerTitulo(v.titulo), t = tipoDeTitulo(p.tipo || v.tt, v.bytes) || 'imagen', n = Math.max(v.variantes || 1, p.variantes);
    return { id, ...v, titulo: p.titulo, tipo: ETIQUETA[t], n, usd: USD[t] * n };
  }
  /** La media de un pedido de «Generar recurso»: la de su tipo si tiene al menos MIN_FIABLE muestras; si no, sin media (no se presta la de otro tipo, que sería de imágenes). `m`: { seg, n } o undefined. */
  function mediaFiable(m) { return m && m.n >= MIN_FIABLE ? m.seg : null; }
  /** Lo que dice el panel cuando no hay media: con pocas muestras del tipo, cuántas hay. */
  const sinMedia = t => t.gen ? 'sin media fiable (' + (t.muestras || 0) + (t.muestras === 1 ? ' muestra' : ' muestras') + ')' : 'sin media';
  function mediaCadencia(d) {   // sin los saltos raros: más del triple de la mediana y 10 min por encima es que la GPU hizo otra cosa (un intento fallido relanzado, un cambio de modelo, el runner apagado)
    const lim = tope(d), ok = d.filter(x => x <= lim);
    return { seg: media(ok), n: ok.length };
  }
  return { MUESTRAS, USD, ETIQUETA, MINUTOS_IMAGEN_LOTE, leerTitulo, variantesDe, tiempoDe, recursoDe, compararLotes, reintentos, entregadas, tipoDeTitulo, etiquetaWf, esGenerar, flujoDe, mediaFiable, sinMedia, carrilDe, duracionRun, duracionPaso, cadencias, mediaCadencia };
})();
