// Fans Of · /gestion: la pestaña REPORTES DE PRUEBA. Lo que mandan los probadores con el botón «!» mientras juegan (core/js/sistema/reporte-prueba.js):
// su nota, dónde estaban y cómo iba el juego, los últimos 60 s de recorrido (una traza por segundo) y una captura pequeña. Se filtra por juego y estado.
// Datos: gestion_reportes_prueba(token, juego, estado, días), gestion_reporte_prueba_captura(token, id) y gestion_reporte_prueba_estado(token, id, estado),
// servidor/98-reportes-prueba.sql. Usa lo de gestion/index.html: rpc(), leerToken(), esc(), fecha(), textoError() y $().
'use strict';
(() => {
  let L = [];
  const sinFuncion = e => /does not exist|PGRST202|404/.test(String(e.message));
  const ESTADO = { pendiente: 'pendiente', visto: 'visto', hecho: 'hecho', descartado: 'descartado' };
  const num = v => (typeof v === 'number' ? v : v == null ? '-' : String(v));
  // la traza: un dibujo sencillo del recorrido (x, z) con el color por fps, para ver por dónde iba y dónde caían los fps
  function trazaSvg(tr) {
    if (!Array.isArray(tr) || tr.length < 2) return '';
    const xs = tr.map(p => p.x), zs = tr.map(p => p.z), x0 = Math.min(...xs), x1 = Math.max(...xs), z0 = Math.min(...zs), z1 = Math.max(...zs);
    const w = 220, h = 120, esc = Math.min((w - 10) / Math.max(1, x1 - x0), (h - 10) / Math.max(1, z1 - z0));
    const px = p => (5 + (p.x - x0) * esc).toFixed(1), pz = p => (5 + (p.z - z0) * esc).toFixed(1);
    const col = f => f >= 50 ? '#7ee04a' : f >= 30 ? '#ffcb3d' : '#ff4b5c';
    let s = `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" style="background:#1a1426;border-radius:6px" aria-label="recorrido">`;
    for (let i = 1; i < tr.length; i++) s += `<line x1="${px(tr[i - 1])}" y1="${pz(tr[i - 1])}" x2="${px(tr[i])}" y2="${pz(tr[i])}" stroke="${col(tr[i].fps)}" stroke-width="2"/>`;
    const u = tr[tr.length - 1]; s += `<circle cx="${px(u)}" cy="${pz(u)}" r="4" fill="#fff6ea"/></svg>`;
    return s;
  }
  function datosHtml(d) {
    if (!d || typeof d !== 'object') return '';
    const partes = [];
    if (d.zona != null || d.x != null) partes.push(`<b>Dónde:</b> ${esc(d.zona || '?')} (${num(d.x)}, ${num(d.z)}, alt ${num(d.y)})`);
    if (d.v != null) partes.push(`<b>Coche:</b> ${num(d.v)} m/s en ${esc(d.suelo || '?')}`);
    if (d.fps != null) partes.push(`<b>Va:</b> ${num(d.fps)} fps · ${num(d.dibujos)} dibujos · ${d.tris != null ? Math.round(d.tris / 1000) + 'k tri' : ''} · res ×${num(d.res)} · ${num(d.trozos)} trozos`);
    if (d.evento || d.busqueda || d.pasajero) partes.push(`<b>Partida:</b> ${d.evento ? 'evento ' + esc(d.evento) : 'libre'} · búsqueda ${num(d.busqueda)}${d.pasajero ? ' · con pasajero' : ''}`);
    if (d.aparato) partes.push(`<b>Aparato:</b> ${num(d.aparato.ancho)}×${num(d.aparato.alto)} dpr ${num(d.aparato.dpr)} · ${num(d.aparato.nucleos)} núcleos · ${esc(String(d.aparato.ua || '').slice(0, 90))}`);
    const otros = Object.keys(d).filter(k => !['zona', 'x', 'y', 'z', 'ang', 'v', 'suelo', 'fps', 'dibujos', 'tris', 'res', 'trozos', 'evento', 'busqueda', 'pasajero', 'aparato', 'traza'].includes(k));
    if (otros.length) partes.push(`<b>Más:</b> ${esc(JSON.stringify(Object.fromEntries(otros.map(k => [k, d[k]]))).slice(0, 400))}`);
    return partes.map(p => `<div class="meta">${p}</div>`).join('') + (d.traza ? `<details><summary>Recorrido (últimos ${d.traza.length} s; verde ≥ 50 fps, amarillo ≥ 30, rojo menos)</summary>${trazaSvg(d.traza)}</details>` : '');
  }
  function pinta() {
    $('rp-lista').innerHTML = L.length ? L.map(r => `<article class="cuenta ${r.estado === 'pendiente' ? '' : 'apagado'}" data-id="${r.id}">
      <div class="cab"><span class="codigo">#${r.id}</span><span class="estado">${esc(r.juego)} ${esc(r.version)}${r.alfa ? ' (alfa)' : ''} · ${esc(r.plataforma)}</span><span class="estado">${esc(r.nombre || r.usuario_corto)}</span><span class="estado">${fecha(r.creado)}</span><span class="estado">${esc(ESTADO[r.estado] || r.estado)}${r.resuelto_por ? ' por ' + esc(r.resuelto_por) : ''}</span></div>
      <div><b>${esc(r.texto)}</b></div>
      ${datosHtml(r.datos)}
      <div class="rp-captura"></div>
      <div class="cab">${r.con_captura ? `<button type="button" data-ver="${r.id}">Ver captura</button>` : '<span class="meta">Sin captura</span>'}<button type="button" data-estado="visto" data-id="${r.id}">Visto</button><button type="button" class="fuerte" data-estado="hecho" data-id="${r.id}">Hecho</button><button type="button" data-estado="descartado" data-id="${r.id}">Descartar</button></div>
    </article>`).join('') : '<div class="meta">No hay reportes con ese filtro.</div>';
  }
  async function cargar() {
    $('rp-aviso').textContent = '';
    try {
      const r = await rpc('gestion_reportes_prueba', { p_token: leerToken(), p_juego: $('rp-juego').value || null, p_estado: $('rp-estado').value || null, p_dias: 90 });
      L = r.reportes || [];
      const juegos = [...new Set(L.map(x => x.juego))].sort(), sel = $('rp-juego'), actual = sel.value;
      for (const j of juegos) if (![...sel.options].some(o => o.value === j)) { const o = document.createElement('option'); o.value = j; o.textContent = j; sel.appendChild(o); }
      sel.value = actual; pinta();
      $('t-pruebas').textContent = 'Reportes de prueba' + (r.pendientes ? ' (' + r.pendientes + ')' : '');
    } catch (e) { $('rp-aviso').textContent = sinFuncion(e) ? 'Falta aplicar servidor/98-reportes-prueba.sql en Supabase.' : textoError(e); }
  }
  $('rp-lista').addEventListener('click', async ev => {
    const b = ev.target.closest('button'); if (!b) return;
    if (b.dataset.ver) {
      b.disabled = true;
      try { const r = await rpc('gestion_reporte_prueba_captura', { p_token: leerToken(), p_id: Number(b.dataset.ver) }); const c = b.closest('article').querySelector('.rp-captura'); c.innerHTML = r.captura ? `<img src="${r.captura}" alt="captura" style="max-width:100%;border-radius:6px;border:1px solid var(--linea)">` : '<span class="meta">Sin captura</span>'; b.remove(); }
      catch (e) { $('rp-aviso').textContent = textoError(e); b.disabled = false; }
      return;
    }
    if (b.dataset.estado) {
      try { await rpc('gestion_reporte_prueba_estado', { p_token: leerToken(), p_id: Number(b.dataset.id), p_estado: b.dataset.estado }); await cargar(); }
      catch (e) { $('rp-aviso').textContent = textoError(e); }
    }
  });
  $('rp-recargar').onclick = cargar; $('rp-juego').onchange = cargar; $('rp-estado').onchange = cargar;
  const tabs = () => [...document.querySelectorAll('#tabs button')].map(b => b.id).filter(id => id !== 't-pruebas');
  function mostrar(si) {
    $('pan-pruebas').hidden = !si; $('t-pruebas').classList.toggle('activa', si);
    if (si) { document.querySelectorAll('#vista-panel > div[id^="pan-"]').forEach(p => { if (p.id !== 'pan-pruebas') p.hidden = true; }); tabs().forEach(t => $(t).classList.remove('activa')); cargar(); }
  }
  $('t-pruebas').onclick = () => mostrar(true);
  tabs().forEach(t => $(t).addEventListener('click', () => { $('pan-pruebas').hidden = true; $('t-pruebas').classList.remove('activa'); }));
  $('menu').addEventListener('click', () => { $('pan-pruebas').hidden = true; $('t-pruebas').classList.remove('activa'); });
})();
