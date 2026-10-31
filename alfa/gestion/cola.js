// Fans Of · /gestion: la pestaña COLA. La cola de GitHub Actions de FansOf-dev con el tiempo estimado de cada trabajo, en tres vistas (lista, carriles por runner y resumen).
// La estimación usa la duración media de ejecución de cada workflow (los últimos 20 runs correctos, de que el job arranca en el runner a que acaba: sin la espera); «Generar recurso», la cadencia de
// la GPU de Yoshi por tipo de pedido (imagen, video, audio, 3d; ver cadencias()). Si un runner está apagado
// su cola no corre: se enseña como «+X al encender». Debajo, lo que habría costado generar con una API de pago los recursos de Generar recurso ya terminados, por tipo (imagen, canción, efecto, vídeo, 3D) y en euros.
// No usa el servidor: lee la API de GitHub desde el navegador con un token fino de solo lectura que cada admin pega una vez (queda en el localStorage de ese navegador). Gemelo del mod de Claude herramientas/cola-actions/ (docs/guia/herramientas/cola-actions.md).
// Usa lo de gestion/index.html: esc() y $(); GESTION_NAV (nav.js) y COLA_MEDIDA (cola-medida.js: tipos, precios y cómo se mide cada workflow).
'use strict';
(() => {
  const { MUESTRAS, USD, ETIQUETA, tipoDe, leerTitulo, tipoDeTitulo, etiquetaWf, esGenerar, flujoDe, duracionRun, duracionPaso, cadencias, mediaCadencia } = COLA_MEDIDA;
  const REPO = 'MicroBlizz/FansOf-dev', API = 'https://api.github.com/repos/' + REPO;
  const CLAVE = 'fansof.gestion.githubToken', DURS = 'fansof.gestion.cola.duraciones-2', RECS = 'fansof.gestion.cola.recursos', PREC = 'fansof.gestion.cola.precision', LIM = 'fansof.gestion.cola.limite';
  const MAX_NUEVAS = 60, CADA = 5 * 60e3, ENFRIA = 30e3;
  const CAMBIO = 1, PRECIO_CLAUDE = 20;   // 1 € = 1 $; 20 USD por millón de tokens de salida de Claude Opus 5.5 (oct. 2026), para pasar el coste de cada recurso a tokens
  try { localStorage.removeItem('fansof.gestion.cola.duraciones'); } catch (e) { /* las de antes de la cadencia (-2) */ }
  let snap = null, vista = 'a', hasta = 0, cargando = false, ultimo = 0;
  // Avance del refresco, para la barra de encima de «Refrescar»: llamadas a GitHub hechas frente a las previstas (el plan; cada parte se fija al saberse y hasta entonces vale la del refresco anterior).
  const PLAN = 'fansof.gestion.cola.plan';
  let avance = null;
  const pan = document.createElement('div'); pan.id = 'pan-cola'; pan.hidden = true;
  $('pan-config').parentNode.appendChild(pan);

  const leer = (k, def) => { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch (e) { return def; } };
  const guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento: se recalcula */ } };
  const precision = () => leer(PREC, false) === true;   // precisión media: comprobar los archivos de cada recurso (más lento); apagada, todo cuenta como imagen
  const limite = () => Math.max(0, Number(leer(LIM, 0)) || 0);   // límite semanal de referencia en tokens (opcional; la web no puede leer el de Claude)
  const token = () => { try { return localStorage.getItem(CLAVE) || ''; } catch (e) { return ''; } };
  const fmt = s => { s = Math.round(s); if (s < 60) return s + ' s'; const m = Math.floor(s / 60); if (m < 60) return m + ' min' + (s % 60 && m < 20 ? ' ' + (s % 60) + ' s' : ''); return Math.floor(m / 60) + ' h ' + (m % 60) + ' min'; };
  const hora = ms => { const d = new Date(ms); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
  const eur = usd => (usd / CAMBIO).toFixed(2).replace('.', ',') + ' €';
  const ktok = t => t >= 1000 ? (t / 1000).toFixed(t >= 10000 ? 0 : 1) + 'k' : String(t);
  const tam = b => b >= 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB';
  const ms = s => s ? Date.parse(s) : NaN;

  // ----- datos -----
  function pintaAvance() {
    const el = $('cl-prog'); if (!el || !avance) return;
    const prev = Math.max(Object.values(avance.plan).reduce((a, b) => a + b, 0), avance.hechas + 1);
    const falta = avance.hechas ? (Date.now() - avance.desde) / 1000 / avance.hechas * (prev - avance.hechas) : null;
    el.querySelector('b').style.width = Math.min(100, Math.round(100 * avance.hechas / prev)) + '%';
    $('cl-prog-txt').textContent = avance.hechas + '/' + prev + (falta === null ? '' : ' · faltan ~' + fmt(Math.max(1, falta)));
  }
  const prever = (parte, n) => { if (avance) { avance.plan[parte] = n; pintaAvance(); } };
  const barraAvance = () => cargando ? `<span class="cl-prog-txt" id="cl-prog-txt">leyendo…</span><i class="cl-prog" id="cl-prog"><b></b></i>` : '';
  async function gh(ruta) {
    try { return await pedir(ruta); } finally { if (avance) { avance.hechas++; pintaAvance(); } }
  }
  async function pedir(ruta) {
    const r = await fetch(API + ruta, { headers: { Authorization: 'Bearer ' + token(), Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' } });
    if (!r.ok) throw new Error(ruta.split('?')[0] + ' → ' + r.status);
    return r.json();
  }
  const carrilDe = L => L.includes('self-hosted') ? (L.find(l => l !== 'self-hosted') || 'self-hosted') : 'github';
  async function enLotes(lista, n, f) { for (let i = 0; i < lista.length; i += n) await Promise.all(lista.slice(i, i + n).map(f)); }

  async function actualizar() {
    const ahora = Date.now(), antes = leer(PLAN, {});
    avance = { hechas: 0, desde: ahora, plan: { fijas: 4, jobs: antes.jobs || 0, artefactos: antes.artefactos || 0, commits: antes.commits || 0, activos: antes.activos || 0 } };
    const hechos = (await gh('/actions/runs?status=completed&per_page=100')).workflow_runs;
    const porWf = {};
    for (const r of hechos) if (r.conclusion === 'success' && !esGenerar(r)) { const a = porWf[r.workflow_id] || (porWf[r.workflow_id] = []); if (a.length < MUESTRAS) a.push(r); }
    const cache = leer(DURS, {}), faltan = [...Object.values(porWf).flat().filter(r => cache[r.id] === undefined), ...cadencias(hechos, cache).piden], nuevas = faltan.slice(0, MAX_NUEVAS);
    prever('jobs', nuevas.length);
    await enLotes(nuevas, 5, async r => { const j = (await gh('/actions/runs/' + r.id + '/jobs?per_page=50')).jobs; cache[r.id] = (esGenerar(r) ? duracionPaso(j) : duracionRun(j)) || 0; });
    const muestras = cadencias(hechos, cache).muestras;
    const vivos = new Set([...Object.values(porWf).flat(), ...hechos.filter(esGenerar)].map(r => String(r.id)));
    Object.keys(cache).forEach(k => { if (!vivos.has(k)) delete cache[k]; }); guardar(DURS, cache);
    const medias = {};
    const media = d => ({ seg: Math.round(d.reduce((a, b) => a + b, 0) / d.length), n: d.length });
    for (const runs of Object.values(porWf)) { const d = runs.map(r => cache[r.id]).filter(x => x > 0); if (d.length) medias[etiquetaWf(runs[0])] = media(d); }
    Object.entries(muestras).forEach(([f, d]) => { if (d.length) medias[f] = mediaCadencia(d); });
    const todas = Object.values(muestras).flat(), generar = hechos.find(esGenerar);
    if (generar && todas.length) medias[etiquetaWf(generar)] = mediaCadencia(todas);   // de reserva, para un tipo sin muestras
    // Recursos terminados: el tamaño del artefacto se guarda porque GitHub lo borra al día; el tipo sale del título («Generar [imagen]: Logo»); si no lo dice (pedidos antiguos), de la extensión de lo que el pedido dejó en la rama `recursos` (un commit «Pedido <id>: salida y modelos»).
    const gs = leer(RECS, {}), sinVer = hechos.filter(r => esGenerar(r) && r.conclusion === 'success' && gs[r.id] === undefined).slice(0, 10);
    prever('artefactos', sinVer.length);
    await enLotes(sinVer, 5, async r => {
      const a = (await gh('/actions/runs/' + r.id + '/artifacts')).artifacts;
      const lt = leerTitulo(String(r.display_title || 'recurso'));
      gs[r.id] = { titulo: lt.titulo, tt: lt.tipo, bytes: a.filter(x => !x.expired).reduce((t, x) => t + x.size_in_bytes, 0), fin: ms(r.updated_at) };
    });
    const sinTipo = Object.entries(gs).filter(([, v]) => v.exts === undefined && !tipoDeTitulo(leerTitulo(v.titulo).tipo || v.tt, v.bytes)).slice(0, 10);
    prever('commits', precision() && sinTipo.length ? 1 + sinTipo.length : 0);
    if (precision() && sinTipo.length) {
      try {
        const sha = {};
        for (const c of await gh('/commits?sha=recursos&per_page=100')) { const m = /^Pedido (\d+):/.exec(c.commit.message); if (m) sha[m[1]] = c.sha; }
        await enLotes(sinTipo, 5, async ([id, v]) => {
          if (!sha[id]) return;
          v.exts = ((await gh('/commits/' + sha[id])).files || []).filter(x => String(x.filename).startsWith('salida/')).map(x => String(x.filename).split('.').pop().toLowerCase());
        });
      } catch (e) { /* sin permiso de Contents o sin la rama: se queda sin tipo y usa el precio de imagen */ }
    }
    guardar(RECS, gs);
    const recursos = Object.entries(gs).map(([id, v]) => { const p = leerTitulo(v.titulo), t = tipoDeTitulo(p.tipo || v.tt, v.bytes) || (precision() ? tipoDe(v.exts, v.bytes) : null); return { id, ...v, titulo: p.titulo, tipo: t ? ETIQUETA[t] : precision() ? '?' : 'imagen', usd: USD[t || 'imagen'] }; }).sort((a, b) => b.fin - a.fin);
    // Cola: en curso y en cola, con sus jobs para saber el runner.
    const activos = [...(await gh('/actions/runs?status=in_progress&per_page=30')).workflow_runs, ...(await gh('/actions/runs?status=queued&per_page=100')).workflow_runs];
    const trabajos = []; let extra = 0;
    prever('activos', Math.min(40, activos.length));
    await enLotes(activos.slice(0, 40), 5, async r => {
      const jobs = (await gh('/actions/runs/' + r.id + '/jobs?per_page=50')).jobs, flujo = flujoDe(r), arr = jobs.map(j => ms(j.started_at)).filter(x => !isNaN(x));
      trabajos.push({ id: r.id, nombre: esGenerar(r) ? leerTitulo(String(r.display_title || flujo)).titulo : flujo, flujo, enCurso: r.status === 'in_progress',
        carril: carrilDe(jobs.flatMap(j => j.labels || [])), media: (medias[flujo] || medias[etiquetaWf(r)] || { seg: null }).seg, gen: esGenerar(r), arranque: arr.length ? Math.min(...arr) : null, ref: r.head_branch + ' · ' + String(r.head_sha).slice(0, 7) });
    });
    extra = Math.max(0, activos.length - 40);
    // La GPU hace un «Generar recurso» detrás de otro: solo el primero en curso está en ella, desde que acabó el último (o desde que arrancó, si es después); los demás en curso esperan su media entera.
    const finGen = Math.max(0, ...hechos.filter(esGenerar).map(r => ms(r.updated_at)));
    trabajos.filter(t => t.gen && t.enCurso).sort((a, b) => (a.arranque || Infinity) - (b.arranque || Infinity))
      .forEach((t, i) => { t.arranque = i === 0 && t.arranque ? Math.max(finGen, t.arranque) : null; });
    trabajos.sort((a, b) => a.enCurso === b.enCurso ? a.id - b.id : a.enCurso ? -1 : 1);
    let online = null, aviso = '';
    try { online = new Set((await gh('/actions/runners?per_page=50')).runners.filter(r => r.status === 'online').flatMap(r => r.labels.map(l => l.name))); }
    catch (e) { aviso = 'No puedo ver los runners (el token necesita Administration: lectura). Los doy por encendidos.'; }
    const ids = [...new Set(trabajos.map(t => t.carril))];
    if (online) online.forEach(l => { if (l.startsWith('yoshi') && !ids.includes(l)) ids.push(l); });
    const carriles = ids.map(id => ({ id, etiqueta: id === 'github' ? 'GitHub (ubuntu)' : id, alojado: id === 'github', encendido: id === 'github' ? true : online ? online.has(id) : null }))
      .sort((a, b) => Number(a.alojado) - Number(b.alojado) || a.id.localeCompare(b.id));
    guardar(PLAN, avance.plan);
    return { trabajos, extra, carriles, medias, recursos, actualizado: ahora, pendientes: faltan.length - nuevas.length, aviso };
  }

  // ----- cálculo y vistas -----
  function calcular(ahora) {
    const acum = {};
    return snap.trabajos.map(t => {
      const resta = t.media === null ? null : t.enCurso && t.arranque ? Math.max(5, t.media - Math.round((ahora - t.arranque) / 1000)) : t.media;
      acum[t.carril] = (acum[t.carril] || 0) + (resta || 0);
      const c = snap.carriles.find(x => x.id === t.carril);
      return { t, resta, apagado: !!c && c.encendido === false, acum: resta === null ? null : acum[t.carril] };
    });
  }
  const estado = f => f.apagado ? [f.t.enCurso ? 'pausada' : 'retenida', 'si'] : f.t.enCurso ? ['en curso', ''] : ['en cola', 'esp'];
  const eta = (f, ahora) => f.acum === null ? 'sin media' : f.apagado ? '+' + fmt(f.acum) + ' al encender' : 'en ' + fmt(f.acum) + ' · ' + hora(ahora + f.acum * 1000);
  function vistaA(F, ahora) {
    if (!F.length) return '<div class="vacio"><b>La cola está vacía</b>No hay trabajos en curso ni esperando.</div>';
    return F.map(f => { const [txt, cls] = estado(f);
      return `<article class="cuenta"><div class="cab"><span class="estado ${cls}">${txt}</span><span class="codigo">${esc(f.t.nombre)}</span><span class="meta">${esc(f.t.flujo)} · ${esc(f.t.carril)} · ${esc(f.t.ref)}</span></div>
        <div class="meta">media ${f.t.media === null ? '—' : fmt(f.t.media)} · <b>${esc(eta(f, ahora))}</b></div></article>`; }).join('')
      + (snap.extra ? `<div class="meta">Y ${snap.extra} trabajos más en cola que no se calculan aquí.</div>` : '');
  }
  function vistaB(F, ahora) {
    return snap.carriles.map(c => {
      const js = F.filter(f => f.t.carril === c.id), tot = js.reduce((a, f) => a + (f.resta || 0), 0), off = c.encendido === false;
      const bloques = js.length ? js.map(f => `<div class="cl-b${f.t.enCurso && !off ? ' run' : ''}" style="flex:${Math.max(1, f.resta || 1)} 1 ${f.t.enCurso ? 70 : 52}px" title="${esc(f.t.nombre)}">${esc(f.t.nombre)}<small>${f.resta === null ? '—' : fmt(f.resta)}</small></div>`).join('') : '<div class="cl-b"><small>libre</small></div>';
      return `<section class="cl-lane"><div class="cab"><b>${esc(c.etiqueta)}</b><span class="estado ${off ? 'si' : ''}">${off ? 'apagado · reloj detenido' : 'encendido'}</span><span class="meta">${fmt(tot)} de trabajo</span></div>
        <div class="cl-strip${off ? ' off' : ''}">${bloques}</div><div class="meta">${off ? 'al encender → +' + fmt(tot) : 'ahora → termina ' + hora(ahora + tot * 1000)}</div></section>`;
    }).join('');
  }
  // Resumen por workflow; «Generar recurso» con su acumulado y, debajo, el de cada tipo (imagen, vídeo…), que es como se mide (flujo «Generar recurso · video»).
  const NOMBRE_TIPO = { imagen: 'imagen', video: 'vídeo', audio: 'audio', '3d': '3D' };
  function agrupar(F) {
    const gs = {};
    F.forEach(f => {
      const [wf, tipo] = f.t.flujo.split(' · '), g = gs[wf] || (gs[wf] = { nombre: wf, n: 0, seg: 0, media: f.t.media, off: false, tipos: {} });
      g.n++; g.seg += f.resta || 0; g.off = g.off || f.apagado;
      if (!f.t.gen) return;
      const k = tipo || 'sin tipo', x = g.tipos[k] || (g.tipos[k] = { nombre: NOMBRE_TIPO[k] || k, n: 0, seg: 0, media: f.t.media, off: false });
      x.n++; x.seg += f.resta || 0; x.off = x.off || f.apagado;
    });
    return Object.values(gs).map(g => { const t = Object.values(g.tipos).sort((a, b) => b.seg - a.seg); return { ...g, tipos: t.some(x => x.nombre !== 'sin tipo') ? t : [] }; }).sort((a, b) => b.seg - a.seg);
  }
  function vistaC(F, ahora) {
    const vivos = snap.carriles.filter(c => c.encendido !== false && !c.alojado);
    const fin = Math.max(0, ...vivos.map(c => F.filter(f => f.t.carril === c.id).reduce((a, f) => a + (f.resta || 0), 0)));
    const ret = F.filter(f => f.apagado), segRet = ret.reduce((a, f) => a + (f.resta || 0), 0);
    const grupos = agrupar(F), max = Math.max(1, ...grupos.map(g => g.seg));
    const fila = (x, nombre, sub) => `<div class="cl-fila${sub ? ' cl-sub' : ''}"><b>${esc(nombre)}</b><div class="cl-barra"><i style="width:${Math.round(100 * x.seg / max)}%;${x.off ? 'background:var(--clara)' : ''}"></i></div><span class="meta">${x.n} × ${x.media === null ? 'media —' : 'media ' + fmt(x.media)} · <b>${fmt(x.seg)}</b></span></div>`;
    return `<div class="caja"><div class="cl-gran">${fin ? 'La cola activa termina en ~' + fmt(fin) : 'Nada en marcha'}</div><div class="meta">${fin ? 'sobre las ' + hora(ahora + fin * 1000) + ' · sin contar espera' : 'los runners están apagados o la cola está vacía'}</div>`
      + (ret.length ? `<p class="aviso">${ret.length} trabajos retenidos (${fmt(segRet)} de ejecución). La estimación empieza a contar cuando el runner arranque.</p>` : '')
      + grupos.map(g => g.tipos.length ? `<div class="cl-fila"><b>${esc(g.nombre)}</b><div class="cl-barra"><i style="width:${Math.round(100 * g.seg / max)}%;${g.off ? 'background:var(--clara)' : ''}"></i></div><span class="meta">${g.n} trabajos · <b>${fmt(g.seg)}</b></span></div>` + g.tipos.map(x => fila(x, x.nombre, true)).join('') : fila(g, g.nombre)).join('') + '</div>';
  }
  function pieRecursos() {
    if (!snap.recursos.length) return '';
    const lim = limite(), tok = usd => Math.round(usd * 1e6 / PRECIO_CLAUDE), total = snap.recursos.reduce((a, r) => a + r.usd, 0);
    const sem = usd => lim ? ' · ~' + (tok(usd) / lim * 100 < 10 ? (tok(usd) / lim * 100).toFixed(1) : Math.round(tok(usd) / lim * 100)) + '% semanal' : '';
    return `<div class="caja"><b>Recursos terminados · lo que habría costado generarlos con una API de pago (aprox.)</b>`
      + snap.recursos.slice(0, 5).map(r => `<div class="cl-fila cl-rec"><span>${esc(r.titulo)}</span><span class="meta">${esc(r.tipo)} · ${r.bytes ? tam(r.bytes) : 'caducado'}</span><span class="meta">~${ktok(tok(r.usd))} tokens · ~${eur(r.usd)}${sem(r.usd)}</span></div>`).join('')
      + `<div class="meta">Total de ${snap.recursos.length} recursos: ~${ktok(tok(total))} tokens · ~${eur(total)}${sem(total)}. Los tokens son los de salida de Claude que costarían lo mismo (${PRECIO_CLAUDE} $ el millón). Precios de referencia por tipo (arriba en cola.js, tabla de Gemini del 29-10-2026, sin verificar). El tipo sale del título de cada pedido. ${precision() ? 'Los pedidos antiguos, sin tipo en el título, se tipan por la extensión.' : 'Los pedidos antiguos, sin tipo en el título, cuentan como imagen (la precisión media los tipa por la extensión).'} No distingue texto de edición de imagen ni los tres vídeos. Claude no genera estos recursos: es una referencia, no un coste real.</div></div>`;
  }

  // ----- pantalla -----
  const estilo = document.createElement('style');
  estilo.textContent = `.cl-bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.cl-bar button.on{background:var(--acento);color:var(--acento-texto);border-color:var(--acento);font-weight:600}
    .cl-op{display:flex;gap:6px;align-items:center;font-size:13px;color:var(--suave)}.cl-gran{font-size:26px;font-weight:700;margin-bottom:4px}.cl-fila{display:grid;grid-template-columns:minmax(120px,1.2fr) 3fr auto;gap:10px;align-items:center;padding:4px 0}.cl-rec{grid-template-columns:1fr auto auto}
    .cl-sub>b{padding-left:1.2em;font-weight:500}.cl-barra{height:12px;border:1px solid var(--linea);border-radius:6px;overflow:hidden;background:var(--bg)}.cl-barra i{display:block;height:100%;background:var(--debil)}
    .cl-lane{display:grid;gap:4px;margin-bottom:12px}.cl-strip{display:flex;min-height:48px;border:2px solid var(--texto);border-radius:8px;overflow:hidden}.cl-strip.off{background:repeating-linear-gradient(45deg,var(--bg) 0 8px,var(--panel) 8px 16px)}
    .cl-b{display:flex;flex-direction:column;justify-content:center;padding:0 8px;border-right:2px solid var(--texto);font-size:12px;font-weight:600;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;background:var(--panel);min-width:0}.cl-b:last-child{border-right:0}
    .cl-b.run{background:var(--ok-fondo);color:var(--ok)}.cl-b small{font:11px var(--mono);font-weight:400;color:var(--suave)}.estado.esp{background:var(--debil-fondo);color:var(--debil)}
    .cl-refr{display:inline-flex;flex-direction:column;gap:3px;align-items:stretch;min-width:7em}.cl-prog-txt{font:11px var(--mono);color:var(--suave);text-align:center;white-space:nowrap}
    .cl-prog{display:block;height:6px;border:1px solid var(--texto);border-radius:4px;overflow:hidden;background:var(--bg)}.cl-prog b{display:block;height:100%;width:0;background:var(--acento);transition:width .3s}`;
  document.head.appendChild(estilo);
  function pinta() {
    const t = token(), ahora = Date.now();
    const cab = `<div class="caja ayuda"><b>Cola de Actions.</b> Lo que espera y corre en GitHub Actions de FansOf-dev, con el tiempo que le queda según la media de cada workflow (sin contar la espera; Generar recurso, por tipo y con la cadencia de la GPU de Yoshi). Si un runner está apagado, su cola no corre. Se refresca solo cada 5 minutos mientras está abierta.</div>`;
    const clave = t ? '' : `<form class="caja" id="cl-clave"><label>Token de GitHub (solo lectura)<input type="password" id="cl-tok" autocomplete="off" placeholder="github_pat_…"></label>
      <div class="meta">Se crea en GitHub › Settings › Developer settings › Fine-grained tokens: solo el repo ${REPO}, permisos de solo lectura en <b>Actions</b> y <b>Administration</b> (para saber si yoshi está encendido); si activas la precisión media, también <b>Contents</b> (para saber de qué tipo es cada recurso). Queda en este navegador y no sale de aquí hacia ningún sitio salvo api.github.com.</div>
      <div class="accion"><button type="submit" class="fuerte">Guardar token</button></div></form>`;
    let cuerpo = '';
    if (t && snap) {
      const F = calcular(ahora);
      cuerpo = `<div class="cl-bar">` + [['a', 'A · Lista'], ['b', 'B · Carriles'], ['c', 'C · Resumen']].map(([v, n]) => `<button type="button" data-v="${v}" class="${vista === v ? 'on' : ''}">${n}</button>`).join('')
        + `<span class="cl-refr">${barraAvance()}<button type="button" id="cl-ref">Refrescar</button></span><button type="button" class="enlace" id="cl-olvida">Olvidar token</button></div>`
        + `<div class="cl-bar"><label class="cl-op"><input type="checkbox" id="cl-prec"${precision() ? ' checked' : ''}> Precisión media: comprobar los archivos de cada recurso (más lento; pide el permiso Contents)</label><label class="cl-op">Límite semanal de referencia (tokens, opcional) <input type="number" id="cl-lim" min="0" step="1000" value="${limite() || ''}" style="width:9em"></label></div>`
        + (snap.aviso ? `<p class="aviso">${esc(snap.aviso)}</p>` : '') + '<div class="lista">' + (vista === 'a' ? vistaA(F, ahora) : vista === 'b' ? vistaB(F, ahora) : vistaC(F, ahora)) + '</div>' + pieRecursos()
        + `<div class="meta">Actualizado hace ${fmt((ahora - snap.actualizado) / 1000)}${snap.pendientes > 0 ? ' · calculando medias (' + snap.pendientes + ' pendientes)' : ''}</div>`;
    } else if (t) cuerpo = `<div class="vacio"><b>${cargando ? 'Leyendo la cola…' : 'Sin datos todavía'}</b>${cargando ? `<span class="cl-refr">${barraAvance()}</span>` : ''}</div>`;
    pan.innerHTML = cab + clave + `<div class="aviso" id="cl-aviso" role="alert"></div>` + cuerpo;
    pintaAvance();
  }
  async function cargar(fuerza) {
    if (!token() || cargando) { pinta(); return; }
    if (!fuerza && snap && Date.now() - ultimo < CADA) { pinta(); return; }
    cargando = true; pinta();
    let fallo = null;
    try { snap = await actualizar(); ultimo = Date.now(); } catch (e) { fallo = e; }
    cargando = false; avance = null; pinta();
    if (fallo) $('cl-aviso').textContent = /→ (401|403|404)/.test(fallo.message) ? 'GitHub no acepta el token (' + fallo.message + '). Revisa que no haya caducado y que sea de este repo.' : 'No pude leer GitHub: ' + fallo.message;
  }
  pan.onclick = ev => {
    const b = ev.target.closest('button'); if (!b) return;
    if (b.dataset.v) { vista = b.dataset.v; pinta(); }
    else if (b.id === 'cl-olvida') { try { localStorage.removeItem(CLAVE); } catch (e) { /* nada */ } snap = null; pinta(); }
    else if (b.id === 'cl-ref') {
      const falta = Math.ceil((hasta - Date.now()) / 1000);
      if (falta > 0) { $('cl-aviso').textContent = 'Espera ' + falta + ' s para volver a refrescar.'; return; }
      hasta = Date.now() + ENFRIA; cargar(true);
    }
  };
  pan.onchange = ev => {
    if (ev.target.id === 'cl-prec') { guardar(PREC, ev.target.checked); cargar(true); }
    else if (ev.target.id === 'cl-lim') { guardar(LIM, Number(ev.target.value) || 0); pinta(); }
  };
  pan.onsubmit = ev => {
    ev.preventDefault(); const v = $('cl-tok').value.trim(); if (!v) return;
    try { localStorage.setItem(CLAVE, v); } catch (e) { $('cl-aviso').textContent = 'Este navegador no deja guardar el token.'; return; }
    cargar(true);
  };
  setInterval(() => { if (!pan.hidden && !document.hidden && token()) { if (Date.now() - ultimo >= CADA) cargar(true); else if (snap) pinta(); } }, ENFRIA);
  GESTION_NAV.seccion({ id: 'cola', pan: 'pan-cola', etiqueta: 'Cola', orden: 7, cargar: () => cargar(false) });
})();
