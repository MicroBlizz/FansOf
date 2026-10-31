// Fans Of · /gestion: la pestaña COLA. La cola de GitHub Actions de FansOf-dev con el tiempo estimado de cada trabajo, en tres vistas (lista, carriles por runner y resumen).
// La estimación usa la duración media de ejecución de cada workflow (los últimos 20 runs correctos, de que el job arranca en el runner a que acaba: sin la espera); «Generar recurso», la cadencia de
// la GPU de Yoshi por tipo de pedido (imagen, video, audio, 3d; ver cadencias()). Si un runner está apagado
// su cola no corre: se enseña como «+X al encender». Debajo, lo que habría costado generar con una API de pago los recursos de Generar recurso ya terminados, por tipo (imagen, canción, efecto, vídeo, 3D) y en euros.
// No usa el servidor: lee la API de GitHub desde el navegador con un token fino de solo lectura que cada admin pega una vez (queda en el localStorage de ese navegador). Gemelo del mod de Claude herramientas/cola-actions/ (docs/guia/herramientas/cola-actions.md).
// Al abrir enseña la última foto guardada (con su fecha) y refresca por detrás; «Releer todo» vuelve a leer GitHub entero y «Borrar lo guardado» empieza de cero.
// Usa lo de gestion/index.html: esc() y $(); GESTION_NAV (nav.js) y COLA_DATOS (cola-datos.js: qué se lee de GitHub y qué se guarda en el navegador).
'use strict';
(() => {
  const REPO = 'MicroBlizz/FansOf-dev', API = 'https://api.github.com/repos/' + REPO;
  const CLAVE = 'fansof.gestion.githubToken', LIM = 'fansof.gestion.cola.limite';
  const CADA = 5 * 60e3, ENFRIA = 30e3;
  const CAMBIO = 1, PRECIO_CLAUDE = 20;   // 1 € = 1 $; 20 USD por millón de tokens de salida de Claude Opus 5.5 (oct. 2026), para pasar el coste de cada recurso a tokens
  try { ['fansof.gestion.cola.duraciones', 'fansof.gestion.cola.precision'].forEach(k => localStorage.removeItem(k)); } catch (e) { /* lo de antes de la cadencia (-2) y la casilla de precisión, ya quitada */ }
  let snap = null, vista = 'a', hasta = 0, cargando = false, ultimo = 0, confirmaBorrar = false;
  // Avance del refresco, para la barra de encima de «Refrescar»: llamadas a GitHub hechas frente a las previstas (el plan; cada parte se fija al saberse y hasta entonces vale la del refresco anterior).
  const PLAN = COLA_DATOS.K.plan;
  let avance = null;
  const pan = document.createElement('div'); pan.id = 'pan-cola'; pan.hidden = true;
  $('pan-config').parentNode.appendChild(pan);

  const leer = (k, def) => { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch (e) { return def; } };
  snap = leer(COLA_DATOS.K.foto, null);   // la última foto: se enseña al abrir, con su fecha, mientras se refresca
  if (snap) ultimo = snap.actualizado || 0;
  const guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento: se recalcula */ } };
  const LIM_DEFECTO = 1250000;   // límite semanal de referencia por defecto, en tokens (la web no puede leer el de Claude); vaciar el campo lo quita
  const limite = () => Math.max(0, Number(leer(LIM, LIM_DEFECTO)) || 0);
  const token = () => { try { return localStorage.getItem(CLAVE) || ''; } catch (e) { return ''; } };
  const fmt = s => { s = Math.round(s); if (s < 60) return s + ' s'; const m = Math.floor(s / 60); if (m < 60) return m + ' min' + (s % 60 && m < 20 ? ' ' + (s % 60) + ' s' : ''); return Math.floor(m / 60) + ' h ' + (m % 60) + ' min'; };
  const hora = ms => { const d = new Date(ms); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
  const eur = usd => (usd / CAMBIO).toFixed(2).replace('.', ',') + ' €';
  const ktok = t => t >= 1000 ? (t / 1000).toFixed(t >= 10000 ? 0 : 1) + 'k' : String(t);
  const tam = b => b >= 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB';
  const fecha = ms => { const d = new Date(ms); return 'las ' + hora(ms) + ' del ' + String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0'); };

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
  async function actualizar(todo) {
    const antes = leer(PLAN, {});
    avance = { hechas: 0, desde: Date.now(), plan: { fijas: 4, paginas: antes.paginas || 1, sueltos: antes.sueltos || 0, historial: antes.historial || 0, jobs: antes.jobs || 0, artefactos: antes.artefactos || 0, activos: antes.activos || 0 } };
    const r = await COLA_DATOS.actualizar({ gh, prever, leer, guardar, todo });
    guardar(PLAN, avance.plan);
    return r;
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
  // Con lo que queda en la cola (n, seg) va lo ya terminado de cada tipo (hechos y su coste de referencia, usd). Canción y efecto son «audio»; lo que no tiene tipo, imagen.
  const TIPO_DE_ETIQUETA = { imagen: 'imagen', 'vídeo': 'video', 'canción': 'audio', 'efecto de sonido': 'audio', 'modelo 3D': '3d' };
  function agrupar(F, recursos) {
    const gs = {}, nuevo = (nombre, media) => ({ nombre, n: 0, seg: 0, media, off: false, hechos: 0, usd: 0 });
    const grupo = (wf, media) => gs[wf] || (gs[wf] = { ...nuevo(wf, media), tipos: {} });
    const tipo = (g, k, media) => g.tipos[k] || (g.tipos[k] = nuevo(NOMBRE_TIPO[k] || k, media));
    const suma = (x, f) => { x.n++; x.seg += f.resta || 0; x.off = x.off || f.apagado; };
    F.forEach(f => { const [wf, t] = f.t.flujo.split(' · '), g = grupo(wf, f.t.media); suma(g, f); if (t) suma(tipo(g, t, f.t.media), f); });
    recursos.forEach(r => { const g = grupo('Generar recurso', null), x = tipo(g, TIPO_DE_ETIQUETA[r.tipo] || 'imagen', null); g.hechos++; x.hechos++; g.usd += r.usd; x.usd += r.usd; });
    const orden = (a, b) => b.seg - a.seg || b.usd - a.usd;
    return Object.values(gs).map(g => ({ ...g, tipos: Object.values(g.tipos).sort(orden) })).sort(orden);
  }
  function vistaC(F, ahora) {
    const vivos = snap.carriles.filter(c => c.encendido !== false && !c.alojado);
    const fin = Math.max(0, ...vivos.map(c => F.filter(f => f.t.carril === c.id).reduce((a, f) => a + (f.resta || 0), 0)));
    const ret = F.filter(f => f.apagado), segRet = ret.reduce((a, f) => a + (f.resta || 0), 0);
    // Una tabla: en cola (cuántos, lo que falta y lo que tarda cada uno) y hecho (cuántos y su coste de referencia). «Generar recurso» va en negrita con sus tipos debajo.
    const grupos = agrupar(F, snap.recursos), lim = limite(), conSem = lim > 0 && snap.recursos.length > 0, hayHechos = snap.recursos.length > 0;
    const pct = usd => { const p = tok(usd) / lim * 100; return (p < 10 ? p.toFixed(1).replace('.', ',') : Math.round(p)) + ' %'; };
    const fila = (x, cls, media) => `<tr class="${cls}"><td>${esc(x.nombre)}</td><td>${x.n || ''}</td><td>${x.n ? fmt(x.seg) : ''}</td><td class="cl-suave">${media && x.n && x.media !== null ? fmt(x.media) : ''}</td>`
      + (hayHechos ? `<td>${x.hechos || ''}</td><td>${x.hechos ? eur(x.usd) : ''}</td>${conSem ? `<td>${x.hechos ? pct(x.usd) : ''}</td>` : ''}` : '') + '</tr>';
    const tabla = `<table class="tabla cl-res"><thead><tr><th></th><th>En cola</th><th>Falta</th><th>Cada uno</th>${hayHechos ? `<th>Hechos</th><th>Coste</th>${conSem ? '<th>Semanal</th>' : ''}` : ''}</tr></thead><tbody>`
      + grupos.map(g => g.tipos.length ? fila(g, 'cl-tot', false) + g.tipos.map(x => fila(x, 'cl-sub', true)).join('') : fila(g, '', true)).join('') + '</tbody></table>';
    return `<div class="caja"><div class="cl-gran">${fin ? 'La cola activa termina en ~' + fmt(fin) : 'Nada en marcha'}</div><div class="meta">${fin ? 'sobre las ' + hora(ahora + fin * 1000) + ' · sin contar espera' : 'los runners están apagados o la cola está vacía'}</div>`
      + (ret.length ? `<p class="aviso">${ret.length} trabajos retenidos (${fmt(segRet)} de ejecución). La estimación empieza a contar cuando el runner arranque.</p>` : '')
      + tabla
      + (hayHechos ? `<div class="meta">Coste: lo que habría costado con una API de pago (aprox.).${conSem ? '' : ' Para ver el % semanal, pon arriba el «Límite semanal de referencia (tokens)»: esta pestaña no puede leer tu límite de Claude.'}</div>` : '') + '</div>';
  }
  const tok = usd => Math.round(usd * 1e6 / PRECIO_CLAUDE);
  const sem = usd => { const lim = limite(), p = lim ? tok(usd) / lim * 100 : 0; return lim ? ' · ~' + (p < 10 ? p.toFixed(1) : Math.round(p)) + '% semanal' : ''; };
  function pieRecursos() {
    if (!snap.recursos.length) return '';
    const total = snap.recursos.reduce((a, r) => a + r.usd, 0);
    return `<div class="caja"><b>Recursos terminados · lo que habría costado generarlos con una API de pago (aprox.)</b>`
      + snap.recursos.slice(0, 5).map(r => `<div class="cl-fila cl-rec"><span>${esc(r.titulo)}</span><span class="meta">${esc(r.tipo)} · ${r.bytes ? tam(r.bytes) : 'caducado'}</span><span class="meta">~${ktok(tok(r.usd))} tokens · ~${eur(r.usd)}${sem(r.usd)}</span></div>`).join('')
      + `<div class="meta">Total de ${snap.recursos.length} recursos: ~${ktok(tok(total))} tokens · ~${eur(total)}${sem(total)}. Los tokens son los de salida de Claude que costarían lo mismo (${PRECIO_CLAUDE} $ el millón). Precios de referencia por tipo (arriba en cola.js, tabla de Gemini del 29-10-2026, sin verificar). El tipo sale del título de cada pedido. Los pedidos antiguos, sin tipo en el título, cuentan como imagen. No distingue texto de edición de imagen ni los tres vídeos. Claude no genera estos recursos: es una referencia, no un coste real.</div></div>`;
  }

  // ----- pantalla -----
  const estilo = document.createElement('style');
  estilo.textContent = `.cl-bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.cl-bar button.on{background:var(--acento);color:var(--acento-texto);border-color:var(--acento);font-weight:600}
    .cl-op{display:flex;gap:6px;align-items:center;font-size:13px;color:var(--suave)}.cl-gran{font-size:26px;font-weight:700;margin-bottom:4px}.cl-fila{display:grid;grid-template-columns:minmax(120px,1.2fr) 3fr auto;gap:10px;align-items:center;padding:4px 0}.cl-rec{grid-template-columns:1fr auto auto}
    .cl-res{margin:12px 0 6px}.cl-res td,.cl-res th{padding:6px 10px}.cl-res .cl-tot td{font-weight:700}.cl-res .cl-sub td:first-child{padding-left:1.6em}.cl-res .cl-suave{color:var(--suave)}.cl-barra{height:12px;border:1px solid var(--linea);border-radius:6px;overflow:hidden;background:var(--bg)}.cl-barra i{display:block;height:100%;background:var(--debil)}
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
      <div class="meta">Se crea en GitHub › Settings › Developer settings › Fine-grained tokens: solo el repo ${REPO}, permisos de solo lectura en <b>Actions</b> y <b>Administration</b> (para saber si yoshi está encendido). Queda en este navegador y no sale de aquí hacia ningún sitio salvo api.github.com.</div>
      <div class="accion"><button type="submit" class="fuerte">Guardar token</button></div></form>`;
    let cuerpo = '';
    if (t && snap) {
      const F = calcular(ahora);
      cuerpo = `<div class="cl-bar">` + [['a', 'A · Lista'], ['b', 'B · Carriles'], ['c', 'C · Resumen']].map(([v, n]) => `<button type="button" data-v="${v}" class="${vista === v ? 'on' : ''}">${n}</button>`).join('')
        + `<span class="cl-refr">${barraAvance()}<button type="button" id="cl-ref">Refrescar</button></span><button type="button" id="cl-todo" title="Vuelve a leer GitHub entero y sobreescribe lo guardado por id, sin borrar lo demás">Releer todo</button>`
        + `<button type="button" class="enlace" id="cl-borra">Borrar lo guardado</button><button type="button" class="enlace" id="cl-olvida">Olvidar token</button></div>`
        + (confirmaBorrar ? `<p class="aviso">¿Borrar todo lo guardado de la cola en este navegador (runs, medias, recursos y la última foto)? El token y el límite se quedan. Después se vuelve a leer desde cero. <button type="button" class="fuerte" id="cl-borra-si">Sí, borrar</button> <button type="button" id="cl-borra-no">No</button></p>` : '')
        + `<div class="cl-bar"><label class="cl-op">Límite semanal de referencia (tokens, opcional) <input type="number" id="cl-lim" min="0" step="1000" value="${limite() || ''}" style="width:9em"></label></div>`
        + (snap.aviso ? `<p class="aviso">${esc(snap.aviso)}</p>` : '') + '<div class="lista">' + (vista === 'a' ? vistaA(F, ahora) : vista === 'b' ? vistaB(F, ahora) : vistaC(F, ahora)) + '</div>' + pieRecursos()
        + `<div class="meta">Datos de <b>${fecha(snap.actualizado)}</b> (hace ${fmt(Math.max(0, (ahora - snap.actualizado) / 1000))})${cargando ? ' · leyendo GitHub…' : ''}${snap.pendientes > 0 ? ' · calculando medias (' + snap.pendientes + ' pendientes)' : ''}`
        + `${snap.guardados ? ' · ' + snap.guardados + ' runs terminados guardados' + (snap.historialCompleto ? '' : ' (bajando el historial)') : ''}</div>`;
    } else if (t) cuerpo = `<div class="vacio"><b>${cargando ? 'Leyendo la cola…' : 'Sin datos todavía'}</b>${cargando ? `<span class="cl-refr">${barraAvance()}</span>` : ''}</div>`;
    pan.innerHTML = cab + clave + `<div class="aviso" id="cl-aviso" role="alert"></div>` + cuerpo;
    pintaAvance();
  }
  async function cargar(fuerza, todo) {
    if (!token() || cargando) { pinta(); return; }
    if (!fuerza && snap && Date.now() - ultimo < CADA) { pinta(); return; }
    cargando = true; pinta();
    let fallo = null;
    try { snap = await actualizar(!!todo); ultimo = Date.now(); } catch (e) { fallo = e; }
    cargando = false; avance = null; pinta();
    if (fallo) $('cl-aviso').textContent = /→ (401|403|404)/.test(fallo.message) ? 'GitHub no acepta el token (' + fallo.message + '). Revisa que no haya caducado y que sea de este repo.' : 'No pude leer GitHub: ' + fallo.message;
  }
  pan.onclick = ev => {
    const b = ev.target.closest('button'); if (!b) return;
    if (b.dataset.v) { vista = b.dataset.v; pinta(); }
    else if (b.id === 'cl-olvida') { try { localStorage.removeItem(CLAVE); } catch (e) { /* nada */ } snap = null; pinta(); }
    else if (b.id === 'cl-ref' || b.id === 'cl-todo') {
      const falta = Math.ceil((hasta - Date.now()) / 1000);
      if (falta > 0) { $('cl-aviso').textContent = 'Espera ' + falta + ' s para volver a refrescar.'; return; }
      hasta = Date.now() + ENFRIA; cargar(true, b.id === 'cl-todo');
    }
    else if (b.id === 'cl-borra' || b.id === 'cl-borra-no') { confirmaBorrar = b.id === 'cl-borra'; pinta(); }
    else if (b.id === 'cl-borra-si') { confirmaBorrar = false; if (cargando) return; COLA_DATOS.borrar(); snap = null; ultimo = 0; cargar(true); }
  };
  pan.onchange = ev => {
    if (ev.target.id === 'cl-lim') { guardar(LIM, Number(ev.target.value) || 0); pinta(); }
  };
  pan.onsubmit = ev => {
    ev.preventDefault(); const v = $('cl-tok').value.trim(); if (!v) return;
    try { localStorage.setItem(CLAVE, v); } catch (e) { $('cl-aviso').textContent = 'Este navegador no deja guardar el token.'; return; }
    cargar(true);
  };
  setInterval(() => { if (!pan.hidden && !document.hidden && token()) { if (Date.now() - ultimo >= CADA) cargar(true); else if (snap) pinta(); } }, ENFRIA);
  GESTION_NAV.seccion({ id: 'cola', pan: 'pan-cola', etiqueta: 'Cola', orden: 7, cargar: () => cargar(false) });
})();
