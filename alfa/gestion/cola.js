// Fans Of · /gestion: la pestaña COLA. La cola de GitHub Actions de FansOf-dev con el tiempo estimado de cada trabajo, en tres vistas (lista, carriles por runner y resumen).
// La estimación usa la duración media de ejecución de cada workflow (los últimos 20 runs correctos, de que el job arranca en el runner a que acaba: sin la espera), así que si un runner está apagado
// su cola no corre: se enseña como «+X al encender». Debajo, lo que habrían costado con Claude los recursos de Generar recurso ya terminados (tokens y euros, a ojo, por el tamaño del artefacto).
// No usa el servidor: lee la API de GitHub desde el navegador con un token fino de solo lectura que cada admin pega una vez (queda en el localStorage de ese navegador). Gemelo del mod de Claude herramientas/cola-actions/ (docs/guia/herramientas/cola-actions.md).
// Usa lo de gestion/index.html: esc() y $(); y GESTION_NAV (nav.js).
'use strict';
(() => {
  const REPO = 'MicroBlizz/FansOf-dev', API = 'https://api.github.com/repos/' + REPO;
  const CLAVE = 'fansof.gestion.githubToken', DURS = 'fansof.gestion.cola.duraciones', RECS = 'fansof.gestion.cola.recursos';
  const MUESTRAS = 20, MAX_NUEVAS = 60, CADA = 5 * 60e3, ENFRIA = 30e3;
  const BYTES_POR_TOKEN = 1000, PRECIO = 30, CAMBIO = 1;   // a ojo, con la tarifa de una API de imágenes: ~1.056 tokens de salida por una imagen de 1024×1024 (~1 MB comprimida) a ~30 USD el millón; 1 € = 1 $
  let snap = null, vista = 'a', hasta = 0, cargando = false, ultimo = 0;
  const pan = document.createElement('div'); pan.id = 'pan-cola'; pan.hidden = true;
  $('pan-config').parentNode.appendChild(pan);

  const leer = (k, def) => { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch (e) { return def; } };
  const guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento: se recalcula */ } };
  const token = () => { try { return localStorage.getItem(CLAVE) || ''; } catch (e) { return ''; } };
  const fmt = s => { s = Math.round(s); if (s < 60) return s + ' s'; const m = Math.floor(s / 60); if (m < 60) return m + ' min' + (s % 60 && m < 20 ? ' ' + (s % 60) + ' s' : ''); return Math.floor(m / 60) + ' h ' + (m % 60) + ' min'; };
  const hora = ms => { const d = new Date(ms); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
  const eur = usd => (usd / CAMBIO).toFixed(2).replace('.', ',') + ' €';
  const ktok = t => t >= 1000 ? (t / 1000).toFixed(t >= 10000 ? 0 : 1) + 'k' : String(t);
  const tam = b => b >= 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB';
  const ms = s => s ? Date.parse(s) : NaN;

  // ----- datos -----
  async function gh(ruta) {
    const r = await fetch(API + ruta, { headers: { Authorization: 'Bearer ' + token(), Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' } });
    if (!r.ok) throw new Error(ruta.split('?')[0] + ' → ' + r.status);
    return r.json();
  }
  // El `name` de un run es su run-name («Generar: Logo»), no el del workflow: el workflow se identifica por su archivo.
  const etiquetaWf = r => { const f = String(r.path || '').split('/').pop().replace(/\.ya?ml$/, '').replace(/-/g, ' '); return f ? f[0].toUpperCase() + f.slice(1) : String(r.name); };
  const esGenerar = r => String(r.path || '').endsWith('generar-recurso.yml');
  const carrilDe = L => L.includes('self-hosted') ? (L.find(l => l !== 'self-hosted') || 'self-hosted') : 'github';
  function duracionRun(jobs) {
    const ok = jobs.filter(j => j.conclusion === 'success' && j.started_at && j.completed_at); if (!ok.length) return null;
    return Math.max(1, Math.round((Math.max(...ok.map(j => ms(j.completed_at))) - Math.min(...ok.map(j => ms(j.started_at)))) / 1000));
  }
  async function enLotes(lista, n, f) { for (let i = 0; i < lista.length; i += n) await Promise.all(lista.slice(i, i + n).map(f)); }

  async function actualizar() {
    const ahora = Date.now();
    const hechos = (await gh('/actions/runs?status=completed&per_page=100')).workflow_runs;
    const porWf = {};
    for (const r of hechos) if (r.conclusion === 'success') { const a = porWf[r.workflow_id] || (porWf[r.workflow_id] = []); if (a.length < MUESTRAS) a.push(r); }
    const cache = leer(DURS, {}), faltan = Object.values(porWf).flat().filter(r => cache[r.id] === undefined), nuevas = faltan.slice(0, MAX_NUEVAS);
    await enLotes(nuevas, 5, async r => { cache[r.id] = duracionRun((await gh('/actions/runs/' + r.id + '/jobs?per_page=50')).jobs) || 0; });
    const vivos = new Set(Object.values(porWf).flat().map(r => String(r.id)));
    Object.keys(cache).forEach(k => { if (!vivos.has(k)) delete cache[k]; }); guardar(DURS, cache);
    const medias = {};
    for (const runs of Object.values(porWf)) { const d = runs.map(r => cache[r.id]).filter(x => x > 0); if (d.length) medias[etiquetaWf(runs[0])] = { seg: Math.round(d.reduce((a, b) => a + b, 0) / d.length), n: d.length }; }
    // Recursos terminados: el tamaño del artefacto se guarda porque GitHub lo borra al día.
    const gs = leer(RECS, {});
    await enLotes(hechos.filter(r => esGenerar(r) && r.conclusion === 'success' && gs[r.id] === undefined).slice(0, 10), 5, async r => {
      const a = (await gh('/actions/runs/' + r.id + '/artifacts')).artifacts;
      gs[r.id] = { titulo: String(r.display_title || 'recurso').replace(/^Generar:\s*/, ''), bytes: a.filter(x => !x.expired).reduce((t, x) => t + x.size_in_bytes, 0), fin: ms(r.updated_at) };
    });
    guardar(RECS, gs);
    const recursos = Object.entries(gs).map(([id, v]) => ({ id, ...v, tokens: Math.round(v.bytes / BYTES_POR_TOKEN) })).sort((a, b) => b.fin - a.fin);
    // Cola: en curso y en cola, con sus jobs para saber el runner.
    const activos = [...(await gh('/actions/runs?status=in_progress&per_page=30')).workflow_runs, ...(await gh('/actions/runs?status=queued&per_page=100')).workflow_runs];
    const trabajos = []; let extra = 0;
    await enLotes(activos.slice(0, 40), 5, async r => {
      const jobs = (await gh('/actions/runs/' + r.id + '/jobs?per_page=50')).jobs, flujo = etiquetaWf(r), arr = jobs.map(j => ms(j.started_at)).filter(x => !isNaN(x));
      trabajos.push({ id: r.id, nombre: esGenerar(r) ? String(r.display_title || flujo).replace(/^Generar:\s*/, '') : flujo, flujo, enCurso: r.status === 'in_progress',
        carril: carrilDe(jobs.flatMap(j => j.labels || [])), media: medias[flujo] ? medias[flujo].seg : null, arranque: arr.length ? Math.min(...arr) : null, ref: r.head_branch + ' · ' + String(r.head_sha).slice(0, 7) });
    });
    extra = Math.max(0, activos.length - 40);
    trabajos.sort((a, b) => a.enCurso === b.enCurso ? a.id - b.id : a.enCurso ? -1 : 1);
    let online = null, aviso = '';
    try { online = new Set((await gh('/actions/runners?per_page=50')).runners.filter(r => r.status === 'online').flatMap(r => r.labels.map(l => l.name))); }
    catch (e) { aviso = 'No puedo ver los runners (el token necesita Administration: lectura). Los doy por encendidos.'; }
    const ids = [...new Set(trabajos.map(t => t.carril))];
    if (online) online.forEach(l => { if (l.startsWith('yoshi') && !ids.includes(l)) ids.push(l); });
    const carriles = ids.map(id => ({ id, etiqueta: id === 'github' ? 'GitHub (ubuntu)' : id, alojado: id === 'github', encendido: id === 'github' ? true : online ? online.has(id) : null }))
      .sort((a, b) => Number(a.alojado) - Number(b.alojado) || a.id.localeCompare(b.id));
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
  function vistaC(F, ahora) {
    const vivos = snap.carriles.filter(c => c.encendido !== false && !c.alojado);
    const fin = Math.max(0, ...vivos.map(c => F.filter(f => f.t.carril === c.id).reduce((a, f) => a + (f.resta || 0), 0)));
    const ret = F.filter(f => f.apagado), segRet = ret.reduce((a, f) => a + (f.resta || 0), 0), por = {};
    F.forEach(f => { const x = por[f.t.flujo] || (por[f.t.flujo] = { n: 0, seg: 0, media: f.t.media, off: false }); x.n++; x.seg += f.resta || 0; x.off = x.off || f.apagado; });
    const max = Math.max(1, ...Object.values(por).map(x => x.seg));
    return `<div class="caja"><div class="cl-gran">${fin ? 'La cola activa termina en ~' + fmt(fin) : 'Nada en marcha'}</div><div class="meta">${fin ? 'sobre las ' + hora(ahora + fin * 1000) + ' · sin contar espera' : 'los runners están apagados o la cola está vacía'}</div>`
      + (ret.length ? `<p class="aviso">${ret.length} trabajos retenidos (${fmt(segRet)} de ejecución). La estimación empieza a contar cuando el runner arranque.</p>` : '')
      + Object.entries(por).map(([n, x]) => `<div class="cl-fila"><b>${esc(n)}</b><div class="cl-barra"><i style="width:${Math.round(100 * x.seg / max)}%;${x.off ? 'background:var(--clara)' : ''}"></i></div><span class="meta">${x.n} × media ${x.media === null ? '—' : fmt(x.media)}</span></div>`).join('') + '</div>';
  }
  function pieRecursos() {
    if (!snap.recursos.length) return '';
    const usd = t => t * PRECIO / 1e6, total = snap.recursos.reduce((a, r) => a + r.tokens, 0);
    return `<div class="caja"><b>Recursos terminados · lo que habría costado generarlos con una API de pago (aprox.)</b>`
      + snap.recursos.slice(0, 5).map(r => `<div class="cl-fila cl-rec"><span>${esc(r.titulo)}</span><span class="meta">${r.bytes ? tam(r.bytes) : 'caducado'}</span><span class="meta">${r.bytes ? '~' + ktok(r.tokens) + ' tokens · ~' + eur(usd(r.tokens)) : '—'}</span></div>`).join('')
      + `<div class="meta">Total de ${snap.recursos.length} recursos: ~${ktok(total)} tokens · ~${eur(usd(total))}. Cálculo: bytes del artefacto ÷ ${BYTES_POR_TOKEN} (≈1.056 tokens por imagen de ~1 MB) por ${PRECIO} $ el millón de tokens de salida, tarifa de una API de imágenes (1 € = ${CAMBIO} $). Claude no genera imágenes: es una referencia, no un coste real.</div></div>`;
  }

  // ----- pantalla -----
  const estilo = document.createElement('style');
  estilo.textContent = `.cl-bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.cl-bar button.on{background:var(--acento);color:var(--acento-texto);border-color:var(--acento);font-weight:600}
    .cl-gran{font-size:26px;font-weight:700;margin-bottom:4px}.cl-fila{display:grid;grid-template-columns:minmax(120px,1.2fr) 3fr auto;gap:10px;align-items:center;padding:4px 0}.cl-rec{grid-template-columns:1fr auto auto}
    .cl-barra{height:12px;border:1px solid var(--linea);border-radius:6px;overflow:hidden;background:var(--bg)}.cl-barra i{display:block;height:100%;background:var(--debil)}
    .cl-lane{display:grid;gap:4px;margin-bottom:12px}.cl-strip{display:flex;min-height:48px;border:2px solid var(--texto);border-radius:8px;overflow:hidden}.cl-strip.off{background:repeating-linear-gradient(45deg,var(--bg) 0 8px,var(--panel) 8px 16px)}
    .cl-b{display:flex;flex-direction:column;justify-content:center;padding:0 8px;border-right:2px solid var(--texto);font-size:12px;font-weight:600;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;background:var(--panel);min-width:0}.cl-b:last-child{border-right:0}
    .cl-b.run{background:var(--ok-fondo);color:var(--ok)}.cl-b small{font:11px var(--mono);font-weight:400;color:var(--suave)}.estado.esp{background:var(--debil-fondo);color:var(--debil)}`;
  document.head.appendChild(estilo);
  function pinta() {
    const t = token(), ahora = Date.now();
    const cab = `<div class="caja ayuda"><b>Cola de Actions.</b> Lo que espera y corre en GitHub Actions de FansOf-dev, con el tiempo que le queda según la media de cada workflow (sin contar la espera). Si un runner está apagado, su cola no corre. Se refresca solo cada 5 minutos mientras está abierta.</div>`;
    const clave = t ? '' : `<form class="caja" id="cl-clave"><label>Token de GitHub (solo lectura)<input type="password" id="cl-tok" autocomplete="off" placeholder="github_pat_…"></label>
      <div class="meta">Se crea en GitHub › Settings › Developer settings › Fine-grained tokens: solo el repo ${REPO}, permisos de solo lectura en <b>Actions</b> y <b>Administration</b> (este para saber si yoshi está encendido). Queda en este navegador y no sale de aquí hacia ningún sitio salvo api.github.com.</div>
      <div class="accion"><button type="submit" class="fuerte">Guardar token</button></div></form>`;
    let cuerpo = '';
    if (t && snap) {
      const F = calcular(ahora);
      cuerpo = `<div class="cl-bar">` + [['a', 'A · Lista'], ['b', 'B · Carriles'], ['c', 'C · Resumen']].map(([v, n]) => `<button type="button" data-v="${v}" class="${vista === v ? 'on' : ''}">${n}</button>`).join('')
        + `<button type="button" id="cl-ref">Refrescar</button><button type="button" class="enlace" id="cl-olvida">Olvidar token</button></div>`
        + (snap.aviso ? `<p class="aviso">${esc(snap.aviso)}</p>` : '') + '<div class="lista">' + (vista === 'a' ? vistaA(F, ahora) : vista === 'b' ? vistaB(F, ahora) : vistaC(F, ahora)) + '</div>' + pieRecursos()
        + `<div class="meta">Actualizado hace ${fmt((ahora - snap.actualizado) / 1000)}${snap.pendientes > 0 ? ' · calculando medias (' + snap.pendientes + ' pendientes)' : ''}</div>`;
    } else if (t) cuerpo = `<div class="vacio"><b>${cargando ? 'Leyendo la cola…' : 'Sin datos todavía'}</b></div>`;
    pan.innerHTML = cab + clave + `<div class="aviso" id="cl-aviso" role="alert"></div>` + cuerpo;
  }
  async function cargar(fuerza) {
    if (!token() || cargando) { pinta(); return; }
    if (!fuerza && snap && Date.now() - ultimo < CADA) { pinta(); return; }
    cargando = true; pinta();
    try { snap = await actualizar(); ultimo = Date.now(); pinta(); }
    catch (e) { pinta(); $('cl-aviso').textContent = /→ (401|403|404)/.test(e.message) ? 'GitHub no acepta el token (' + e.message + '). Revisa que no haya caducado y que sea de este repo.' : 'No pude leer GitHub: ' + e.message; }
    cargando = false;
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
  pan.onsubmit = ev => {
    ev.preventDefault(); const v = $('cl-tok').value.trim(); if (!v) return;
    try { localStorage.setItem(CLAVE, v); } catch (e) { $('cl-aviso').textContent = 'Este navegador no deja guardar el token.'; return; }
    cargar(true);
  };
  setInterval(() => { if (!pan.hidden && !document.hidden && token()) { if (Date.now() - ultimo >= CADA) cargar(true); else if (snap) pinta(); } }, ENFRIA);
  GESTION_NAV.seccion({ id: 'cola', pan: 'pan-cola', etiqueta: 'Cola', orden: 7, cargar: () => cargar(false) });
})();
