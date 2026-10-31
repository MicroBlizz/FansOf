// Fans Of · /gestion, pestaña COLA: cómo se mide cada trabajo. Tipo y precio de referencia de cada recurso (gemelo de herramientas/cola-actions/hooks/precios.ts) y la medida de
// los workflows: duración de un run y, para «Generar recurso», la cadencia de la GPU de Yoshi por tipo de pedido (gemelo de herramientas/cola-actions/hooks/datos.ts).
// Funciones puras sobre lo que devuelve la API de GitHub; las usa cola.js. Guía: docs/guia/herramientas/cola-actions.md.
'use strict';
const COLA_MEDIDA = (() => {
  const MUESTRAS = 20;   // runs correctos por workflow (y por tipo en Generar recurso) que forman la media
  const ms = s => s ? Date.parse(s) : NaN;
  // Lo que costaría generar cada tipo con una API de pago (USD por recurso): tabla de referencia que dio Gemini el 29-10-2026, sin verificar (se corrige aquí). Gemelo de herramientas/cola-actions/hooks/precios.ts.
  const USD = { imagen: 0.04, cancion: 0.08, efecto: 0.002 * 4, video: 0.03 * 5, modelo3d: 0.2 };
  const ETIQUETA = { imagen: 'imagen', cancion: 'canción', efecto: 'efecto de sonido', video: 'vídeo', modelo3d: 'modelo 3D' };
  const EFECTO_MAX_BYTES = 400 * 1024;   // un MP3 V0 de ~4 s pesa ~120 KB y una canción de 30 s ~900 KB
  function tipoDe(exts, bytes) {   // por las extensiones de la salida; la extensión solo da cuatro familias (no separa texto/edición de imagen ni los tres vídeos)
    if (!exts || !exts.length) return null;
    const tiene = (...e) => exts.some(x => e.includes(x));
    if (tiene('mp4', 'webm', 'mov', 'mkv')) return 'video';
    if (tiene('glb', 'gltf', 'obj', 'fbx', 'blend')) return 'modelo3d';
    if (tiene('mp3', 'wav', 'ogg', 'flac')) return bytes > 0 && bytes < EFECTO_MAX_BYTES ? 'efecto' : 'cancion';
    return 'imagen';
  }
  function leerTitulo(t) {   // «Generar [imagen]: Logo» (o el antiguo «Generar: Logo») -> tipo y título
    const m = /^Generar(?:\s*\[([^\]]*)\])?:\s*/.exec(t);
    if (!m) return { titulo: t, tipo: null };
    const tipo = (m[1] || '').trim().toLowerCase();
    return { titulo: t.slice(m[0].length), tipo: tipo && tipo !== 'recurso' ? tipo : null };
  }
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
  function duracionRun(jobs) {
    const ok = jobs.filter(j => j.conclusion === 'success' && j.started_at && j.completed_at); if (!ok.length) return null;
    return Math.max(1, Math.round((Math.max(...ok.map(j => ms(j.completed_at))) - Math.min(...ok.map(j => ms(j.started_at)))) / 1000));
  }
  // «Generar recurso» se mide por tipo de pedido: «Generar recurso · video»; sin tipo en el título, el workflow a secas (que es también la media de todos los tipos, de reserva).
  const flujoDe = r => { const f = etiquetaWf(r); if (!esGenerar(r)) return f; const t = leerTitulo(String(r.display_title || '')).tipo; return t ? f + ' · ' + t : f; };
  function duracionPaso(jobs) {   // el paso «Generar con ComfyUI» del primer job (lo que ocupó la GPU si no esperaba a nadie); sin él, la duración del run
    const p = ((jobs[0] || {}).steps || []).find(s => s.name === 'Generar con ComfyUI' && s.conclusion === 'success' && s.started_at && s.completed_at);
    return p ? Math.max(1, Math.round((ms(p.completed_at) - ms(p.started_at)) / 1000)) : duracionRun(jobs);
  }
  // Cadencia de «Generar recurso»: la GPU va de uno en uno (cola de ComfyUI) aunque haya varios runners, así que la duración de un job incluye lo que esperó a los de delante.
  // Cada run correcto da una muestra: si entró en cola antes de que acabara el anterior (acabaron seguidos), la separación entre sus updated_at; si no esperaba a nadie, su paso (caché).
  const entra = r => Math.max(ms(r.created_at), ms(r.run_started_at) || 0);   // al crearlo o, si se relanzó, al relanzarlo (created_at es el del primer intento)
  function cadencias(hechos, cache) {
    const gen = hechos.filter(r => esGenerar(r) && (r.conclusion === 'success' || r.conclusion === 'failure')).sort((a, b) => ms(a.updated_at) - ms(b.updated_at));
    const muestras = {}, piden = [];
    for (let i = gen.length - 1; i >= 0; i--) {
      const r = gen[i]; if (r.conclusion !== 'success') continue;
      const m = muestras[flujoDe(r)] || (muestras[flujoDe(r)] = []); if (m.length >= MUESTRAS) continue;
      const prev = gen[i - 1];
      if (prev && entra(r) < ms(prev.updated_at)) m.push(Math.max(1, Math.round((ms(r.updated_at) - ms(prev.updated_at)) / 1000)));
      else if (cache[r.id] === undefined) piden.push(r);
      else if (cache[r.id] > 0) m.push(cache[r.id]);
    }
    return { muestras, piden };
  }
  function mediaCadencia(d) {   // sin los saltos raros: más del triple de la mediana y 10 min por encima es que la GPU hizo otra cosa (un intento fallido relanzado, un cambio de modelo, el runner apagado)
    const o = [...d].sort((a, b) => a - b), med = o[Math.floor(o.length / 2)], ok = d.filter(x => x <= Math.max(3 * med, med + 600));
    return { seg: Math.round(ok.reduce((a, b) => a + b, 0) / ok.length), n: ok.length };
  }
  return { MUESTRAS, USD, ETIQUETA, tipoDe, leerTitulo, tipoDeTitulo, etiquetaWf, esGenerar, flujoDe, duracionRun, duracionPaso, cadencias, mediaCadencia };
})();
