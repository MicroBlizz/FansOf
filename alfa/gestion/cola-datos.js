// Fans Of · /gestion, pestaña COLA: lee GitHub y guarda en este navegador lo que ya no cambia, para que cada refresco pida lo mínimo. Gemelo de herramientas/cola-actions/hooks/datos.ts.
// Lo guardado (localStorage, «fansof.gestion.cola.*»): los runs terminados por id con su intento (un run relanzado vuelve a la cola con el mismo id y otro intento: lo activo
// manda y se sobreescribe al acabar), el historial antiguo que falta por bajar, el runner de cada workflow, las duraciones, los recursos y la última foto para enseñarla al abrir.
// Cada refresco: la cola (en curso y en cola), los terminados desde el más nuevo hasta topar con lo ya guardado, los que estaban activos y ya no (uno a uno), un trozo del
// historial antiguo y los jobs solo de lo que está en curso. «Releer todo» lo vuelve a leer entero y sobreescribe por id sin borrar lo demás.
// HISTORIAL COMPARTIDO (servidor/106-gestion-cola.sql, ADR 021): con sesión de /gestion, cada refresco baja de Supabase lo que han subido los demás (desde la
// última vez) y sube lo que ha cambiado aquí; así Pepins y Arkioner ven lo mismo y lo que GitHub borra a los 90 días se queda. Guía: docs/guia/herramientas/cola-actions.md.
'use strict';
const COLA_DATOS = (() => {
  const { MUESTRAS, USD, ETIQUETA, leerTitulo, tipoDeTitulo, etiquetaWf, esGenerar, flujoDe, duracionRun, duracionPaso, cadencias, mediaCadencia } = COLA_MEDIDA;
  const P = 'fansof.gestion.cola.';
  // las claves que «Borrar lo guardado» quita (el token y el límite semanal son ajustes y se quedan)
  const K = { runs: P + 'runs', hist: P + 'historial', activos: P + 'activos', carriles: P + 'carriles', durs: P + 'duraciones-2', recs: P + 'recursos', plan: P + 'plan', foto: P + 'foto', sync: P + 'sync' };
  const LOTE = 10;          // llamadas a la vez
  const PAGINA = 50;        // terminados por página al buscar los nuevos
  const MAX_PAGINAS = 5;    // páginas de nuevos por refresco (si hay más, siguen en el próximo)
  const MAX_TROZOS = 60;    // trozos de 100 del historial al releer todo
  const MAX_NUEVAS = 60;    // duraciones por refresco (releer todo: MAX_RELEER)
  const MAX_RELEER = 300;
  const MAX_JOBS = 40;      // jobs de trabajos activos por refresco
  const DIA = 864e5;        // GitHub borra los artefactos al día: más viejos no se piden
  const ms = s => s ? Date.parse(s) : NaN;
  const carrilDe = L => L.includes('self-hosted') ? (L.find(l => l !== 'self-hosted') || 'self-hosted') : 'github';
  async function enLotes(lista, n, f) { for (let i = 0; i < lista.length; i += n) await Promise.all(lista.slice(i, i + n).map(f)); }
  // de cada run se guarda solo lo que se usa
  const CAMPOS = ['id', 'run_attempt', 'path', 'workflow_id', 'name', 'display_title', 'conclusion', 'created_at', 'run_started_at', 'updated_at'];
  // quién lo lanzó: actor (quien creó el run) y triggering_actor (quien lanzó este intento; cambia al relanzar). De GitHub viene el usuario entero: se guarda su login
  const QUIEN = ['actor', 'triggering_actor'], login = x => typeof x === 'string' ? x : x && x.login || null;
  const corto = r => Object.fromEntries([...CAMPOS.map(k => [k, r[k]]), ...QUIEN.map(k => [k, login(r[k])])]);

  const SOLAPE = 5 * 60e3;   // al bajar del servidor «desde la última vez», 5 min de margen por lo que otro guardaba a la vez
  const TROZO = 1000;        // runs por llamada al subir

  /**
   * Lee GitHub y devuelve la foto de la cola. `gh(ruta)` llama a la API; `prever(parte, n)` va fijando el plan de la barra de avance; `todo`: releer todo.
   * `servidor`: { leer(desde), guardar(runs, carriles) } para el historial compartido, o null (sin sesión de /gestion: solo este navegador).
   */
  async function actualizar({ gh, prever, leer, guardar, todo, servidor }) {
    const ahora = Date.now();
    const runs = leer(K.runs, {}), hist = leer(K.hist, {}), carriles = leer(K.carriles, {}), cache = leer(K.durs, {}), gs = leer(K.recs, {}), sync = leer(K.sync, {});
    const cambiados = new Set(), carrilesNuevos = {}, avisos = [];
    let leidoMin = Infinity;   // el más viejo leído en este refresco (al releer, el historial sigue desde ahí)
    // guarda un run terminado (sobreescribe por id); true si ya estaba igual (mismo intento y misma hora de fin)
    const meter = r => {
      const v = runs[r.id], igual = !!v && v.run_attempt === r.run_attempt && v.updated_at === r.updated_at;
      runs[r.id] = corto(r); leidoMin = Math.min(leidoMin, ms(r.created_at) || Infinity);
      if (!igual) cambiados.add(String(r.id));
      return igual;
    };
    const nota = (r, bytes) => { const lt = leerTitulo(String(r.display_title || 'recurso')); gs[r.id] = { titulo: lt.titulo, tt: lt.tipo, bytes, fin: ms(r.updated_at) }; };
    const aprende = (path, c) => { if (path && c && carriles[path] !== c) { carriles[path] = c; carrilesNuevos[path] = c; } };

    // 0. Historial compartido: lo que han subido los demás desde la última vez (un intento más nuevo o una hora de fin posterior manda; duración y tamaño, si aquí faltan).
    const habia = Object.keys(runs).length;
    if (servidor) {
      try {
        prever('servidor', 2);
        const d = await servidor.leer(sync.desde ? new Date(Date.parse(sync.desde) - SOLAPE).toISOString() : null);
        (d.runs || []).forEach(({ run: r, dur, bytes }) => {
          const v = runs[r.id], nuevo = !v || r.run_attempt > v.run_attempt || (r.run_attempt === v.run_attempt && ms(r.updated_at) > ms(v.updated_at));
          if (nuevo) { runs[r.id] = corto(r); if (v) { delete cache[r.id]; delete gs[r.id]; } }
          if (dur != null && cache[r.id] === undefined) cache[r.id] = dur;
          if (bytes != null && gs[r.id] === undefined && esGenerar(r) && r.conclusion === 'success') nota(r, bytes);
        });
        Object.entries(d.carriles || {}).forEach(([k, v]) => { carriles[k] = v; });
        if (!sync.desde && !habia) sync.subido = true;   // empezar de cero bajándolo todo: no hay nada propio que subir
        sync.desde = d.ahora;
      } catch (e) { avisos.push('No pude leer el historial compartido (' + e.message + '); sigo con lo de este navegador.'); }
    }

    // 1. La cola: lo activo manda sobre lo guardado.
    const activos = [...(await gh('/actions/runs?status=in_progress&per_page=30')).workflow_runs, ...(await gh('/actions/runs?status=queued&per_page=100')).workflow_runs];
    const vivos = new Set(activos.map(r => String(r.id)));

    // 2. Terminados nuevos: desde el más nuevo hasta topar con lo ya guardado (como mucho MAX_PAGINAS).
    for (let p = 1; ; p++) {
      prever('paginas', p);
      const d = (await gh('/actions/runs?status=completed&per_page=' + PAGINA + '&page=' + p)).workflow_runs;
      let visto = false;
      d.forEach(r => { if (meter(r)) visto = true; });
      if (d.length < PAGINA || (visto && !todo) || p >= MAX_PAGINAS) break;
    }
    // Los que estaban activos y ya no: si lo guardado no es de ese intento (un relanzado que acabó lejos de la página 1), se piden uno a uno.
    const antes = leer(K.activos, {});
    const sueltos = Object.entries(antes).filter(([id, a]) => !vivos.has(id) && !(runs[id] && runs[id].run_attempt >= a));
    prever('sueltos', sueltos.length);
    await enLotes(sueltos, LOTE, async ([id]) => { try { const r = await gh('/actions/runs/' + id); if (r.status === 'completed') meter(r); } catch (e) { /* borrado: nada que guardar */ } });
    guardar(K.activos, Object.fromEntries(activos.map(r => [r.id, r.run_attempt])));

    // 3. Historial antiguo: trozos de 100 más viejos que lo guardado (por fecha, que no se mueve como las páginas); uno por refresco. Al releer, todos, desde lo leído ahora.
    if (todo) hist.completo = false;
    for (let i = 0; !hist.completo && i < (todo ? MAX_TROZOS : 1); i++) {
      const viejo = todo ? leidoMin : Math.min(...Object.values(runs).map(r => ms(r.created_at)).filter(x => !isNaN(x)));
      if (!isFinite(viejo)) break;
      prever('historial', i + 1);
      const d = (await gh('/actions/runs?status=completed&per_page=100&created=' + encodeURIComponent('<' + new Date(viejo).toISOString()))).workflow_runs;
      d.forEach(meter);
      if (d.length < 100) hist.completo = true;
    }
    guardar(K.runs, runs); guardar(K.hist, hist);
    const hechos = Object.values(runs).filter(r => !vivos.has(String(r.id))).sort((a, b) => ms(b.updated_at) - ms(a.updated_at));

    // 4. Medias: últimos MUESTRAS correctos de cada workflow; «Generar recurso», cadencia por tipo (cola-medida.js). Al releer se recalculan todas.
    const porWf = {};
    for (const r of hechos) if (r.conclusion === 'success' && !esGenerar(r)) { const a = porWf[r.workflow_id] || (porWf[r.workflow_id] = []); if (a.length < MUESTRAS) a.push(r); }
    const mira = todo ? {} : cache;
    const faltan = [...Object.values(porWf).flat().filter(r => mira[r.id] === undefined), ...cadencias(hechos, mira).piden], nuevas = faltan.slice(0, todo ? MAX_RELEER : MAX_NUEVAS);
    prever('jobs', nuevas.length);
    await enLotes(nuevas, LOTE, async r => {
      const j = (await gh('/actions/runs/' + r.id + '/jobs?per_page=50')).jobs, L = j.flatMap(x => x.labels || []);
      cache[r.id] = (esGenerar(r) ? duracionPaso(j) : duracionRun(j)) || 0; cambiados.add(String(r.id));
      if (L.length) aprende(r.path, carrilDe(L));
    });
    const muestras = cadencias(hechos, cache).muestras;
    const usados = new Set([...Object.values(porWf).flat(), ...hechos.filter(esGenerar)].map(r => String(r.id)));
    Object.keys(cache).forEach(k => { if (!usados.has(k)) delete cache[k]; }); guardar(K.durs, cache);
    const medias = {}, media = d => ({ seg: Math.round(d.reduce((a, b) => a + b, 0) / d.length), n: d.length });
    for (const rs of Object.values(porWf)) { const d = rs.map(r => cache[r.id]).filter(x => x > 0); if (d.length) medias[etiquetaWf(rs[0])] = media(d); }
    Object.entries(muestras).forEach(([f, d]) => { if (d.length) medias[f] = mediaCadencia(d); });
    const todas = Object.values(muestras).flat(), generar = hechos.find(esGenerar);
    if (generar && todas.length) medias[etiquetaWf(generar)] = mediaCadencia(todas);   // de reserva, para un tipo sin muestras

    // 5. Recursos terminados: tamaño del artefacto (solo si tiene menos de un día; si no, ya no está) y tipo del título (sin tipo: imagen).
    const sinVer = hechos.filter(r => esGenerar(r) && r.conclusion === 'success' && (gs[r.id] === undefined || (todo && ahora - ms(r.updated_at) < DIA)));
    const conArtefacto = sinVer.filter(r => ahora - ms(r.updated_at) < DIA).slice(0, todo ? Infinity : 10);
    sinVer.forEach(r => cambiados.add(String(r.id)));
    sinVer.filter(r => ahora - ms(r.updated_at) >= DIA).forEach(r => nota(r, 0));
    prever('artefactos', conArtefacto.length);
    await enLotes(conArtefacto, LOTE, async r => nota(r, (await gh('/actions/runs/' + r.id + '/artifacts')).artifacts.filter(x => !x.expired).reduce((t, x) => t + x.size_in_bytes, 0)));
    guardar(K.recs, gs);
    const recursos = Object.entries(gs).map(([id, v]) => { const p = leerTitulo(v.titulo), t = tipoDeTitulo(p.tipo || v.tt, v.bytes) || 'imagen'; return { id, ...v, titulo: p.titulo, tipo: ETIQUETA[t], usd: USD[t] }; }).sort((a, b) => b.fin - a.fin);

    // 6. Trabajos: jobs solo de lo que está en curso (para saber desde cuándo corre) y de lo que va a un workflow del que no se sabe el runner; el resto, el runner guardado.
    const piden = activos.filter(r => r.status === 'in_progress' || todo || !carriles[r.path]).slice(0, MAX_JOBS), jobs = {};
    prever('activos', piden.length);
    await enLotes(piden, LOTE, async r => {
      const j = (await gh('/actions/runs/' + r.id + '/jobs?per_page=50')).jobs, L = j.flatMap(x => x.labels || []);
      jobs[r.id] = j;
      if (L.length) aprende(r.path, carrilDe(L));
    });
    guardar(K.carriles, carriles);
    // Historial compartido: se sube lo que ha cambiado aquí (todo, la primera vez o al releer), en trozos.
    if (servidor) {
      // lo cambiado ahora más lo que no se pudo subir la vez anterior (sync.pendientes)
      const ids = (todo || !sync.subido) ? Object.keys(runs) : [...new Set([...cambiados, ...(sync.pendientes || [])])].filter(id => runs[id]);
      const lote = ids.map(id => ({ run: runs[id], dur: cache[id] ?? null, bytes: gs[id] ? gs[id].bytes : null }));
      try {
        if (lote.length || Object.keys(carrilesNuevos).length) for (let i = 0; i < Math.max(1, lote.length); i += TROZO) await servidor.guardar(lote.slice(i, i + TROZO), i ? null : carrilesNuevos);
        sync.subido = true; sync.pendientes = [];
      } catch (e) { sync.pendientes = ids; avisos.push('No pude subir al historial compartido (' + e.message + '); se reintenta en el próximo refresco.'); }
    }
    guardar(K.sync, sync);
    const trabajos = [];
    let extra = 0;
    activos.forEach(r => {
      const j = jobs[r.id], carril = j && j.length ? carrilDe(j.flatMap(x => x.labels || [])) : carriles[r.path];
      if (!carril) { extra++; return; }
      const flujo = flujoDe(r), arr = (j || []).map(x => ms(x.started_at)).filter(x => !isNaN(x));
      trabajos.push({ id: r.id, creado: ms(r.created_at), nombre: esGenerar(r) ? leerTitulo(String(r.display_title || flujo)).titulo : flujo, flujo, enCurso: r.status === 'in_progress',
        carril, media: (medias[flujo] || medias[etiquetaWf(r)] || { seg: null }).seg, gen: esGenerar(r), arranque: arr.length ? Math.min(...arr) : null, ref: r.head_branch + ' · ' + String(r.head_sha).slice(0, 7) });
    });
    // La GPU hace un «Generar recurso» detrás de otro: solo el primero en curso está en ella, desde que acabó el último (o desde que arrancó, si es después); los demás en curso esperan su media entera.
    const finGen = Math.max(0, ...hechos.filter(esGenerar).map(r => ms(r.updated_at)));
    trabajos.filter(t => t.gen && t.enCurso).sort((a, b) => (a.arranque || Infinity) - (b.arranque || Infinity))
      .forEach((t, i) => { t.arranque = i === 0 && t.arranque ? Math.max(finGen, t.arranque) : null; });
    trabajos.sort((a, b) => a.enCurso === b.enCurso ? a.id - b.id : a.enCurso ? -1 : 1);

    // 7. Runners: si el token no puede leerlos, se dan por encendidos.
    let online = null, aviso = '';
    try { online = new Set((await gh('/actions/runners?per_page=100')).runners.filter(r => r.status === 'online').flatMap(r => r.labels.map(l => l.name))); }
    catch (e) { aviso = 'No puedo ver los runners (el token necesita Administration: lectura). Los doy por encendidos.'; }
    aviso = [aviso, ...avisos].filter(Boolean).join(' ');
    const ids = [...new Set(trabajos.map(t => t.carril))];
    if (online) online.forEach(l => { if (l.startsWith('yoshi') && !ids.includes(l)) ids.push(l); });
    const ultimoFin = {};   // por carril, cuándo acabó su último trabajo (hechos va de más nuevo a más viejo)
    hechos.forEach(r => { const c = carriles[r.path]; if (c && !ultimoFin[c]) ultimoFin[c] = ms(r.updated_at); });
    const vivo = id => COLA_CONTROL.encendido({ enLinea: online ? online.has(id) : null, enCurso: trabajos.some(t => t.carril === id && t.enCurso), ultimoFin: ultimoFin[id] || 0 }, ahora);
    const carrilesSnap = ids.map(id => ({ id, etiqueta: id === 'github' ? 'GitHub (ubuntu)' : id, alojado: id === 'github', encendido: id === 'github' ? true : vivo(id) }))
      .sort((a, b) => Number(a.alojado) - Number(b.alojado) || a.id.localeCompare(b.id));
    const snap = { trabajos, extra, carriles: carrilesSnap, medias, recursos, fallidas: COLA_CONTROL.fallidas(hechos, ahora), actualizado: ahora, pendientes: faltan.length - nuevas.length, aviso,
      guardados: hechos.length, historialCompleto: !!hist.completo, compartido: !!servidor && !avisos.length };
    guardar(K.foto, snap);
    return snap;
  }

  /** Borra todo lo guardado de la cola (no el token ni el límite semanal). */
  const borrar = () => { try { Object.values(K).forEach(k => localStorage.removeItem(k)); } catch (e) { /* sin almacenamiento: nada que borrar */ } };

  return { actualizar, borrar, K };
})();
