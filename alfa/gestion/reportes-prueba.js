// Fans Of · /gestion: REPORTES DE PRUEBA, una pestaña dentro de cada juego.
//
// Lo que mandan los probadores con el botón «!» (core/js/sistema/reporte-prueba.js): su nota, dónde estaban y cómo iba el juego,
// los últimos 60 s de recorrido y una captura. Cada reporte tiene una conversación corta: quien lo arregla cuenta qué hizo y quien
// prueba, lo que ve. El flujo: pendiente → Visto (quien arregla cree que está) → Hecho (quien prueba lo confirma) o Reabrir con un
// comentario (vuelve a pendiente). Hecho y Descartado se borran solos 3 días después (servidor/100), con su conversación y captura.
// Datos (servidor/98, 99 y 100): gestion_reportes_prueba, gestion_reporte_prueba_captura, gestion_reporte_prueba_estado,
// gestion_reporte_prueba_comentar. Usa lo de gestion/index.html: rpc(), leerToken(), esc(), fecha(), textoError() y $().
'use strict';
(() => {
  let juegoActual = null;
  let reportes = [];
  const ESTADOS = { pendiente: 'pendiente', visto: 'visto', hecho: 'hecho', descartado: 'descartado' };
  const DIAS_HASTA_BORRAR = 3;
  function estadoTexto(r) {
    const texto = ESTADOS[r.estado] || r.estado;
    if (!r.resuelto) return texto;
    const quedan = Math.max(0, DIAS_HASTA_BORRAR - (Date.now() - new Date(r.resuelto).getTime()) / 86400000);
    return `${texto}${r.resuelto_por ? ' por ' + r.resuelto_por : ''} · se borra en ${quedan < 1 ? 'menos de un día' : Math.ceil(quedan) + ' días'}`;
  }
  const COLOR_FPS = fps => (fps >= 50 ? '#7ee04a' : fps >= 30 ? '#ffcb3d' : '#ff4b5c');
  const numero = v => (typeof v === 'number' ? v : v == null ? '-' : String(v));
  const faltaSql = e => /does not exist|PGRST202|404/.test(String(e.message));

  // --- cómo se pinta un reporte
  // el recorrido (x, z) con el color por fps; sin posiciones (juegos que solo apuntan fps), una tira de fps
  function trazaSvg(traza) {
    if (!Array.isArray(traza) || traza.length < 2) return '';
    const ancho = 220, alto = 120;
    let svg = `<svg viewBox="0 0 ${ancho} ${alto}" width="${ancho}" height="${alto}" style="background:#1a1426;border-radius:6px" aria-label="recorrido">`;
    if (traza.every(p => p.x == null)) {
      const paso = ancho / traza.length;
      traza.forEach((p, i) => { const h = Math.min(alto, (p.fps || 0) * 1.5); svg += `<rect x="${(i * paso).toFixed(1)}" y="${alto - h}" width="${paso.toFixed(1)}" height="${h}" fill="${COLOR_FPS(p.fps)}"/>`; });
      return svg + '</svg>';
    }
    const xs = traza.map(p => p.x), zs = traza.map(p => p.z), x0 = Math.min(...xs), z0 = Math.min(...zs);
    const escala = Math.min((ancho - 10) / Math.max(1, Math.max(...xs) - x0), (alto - 10) / Math.max(1, Math.max(...zs) - z0));
    const px = p => (5 + (p.x - x0) * escala).toFixed(1), pz = p => (5 + (p.z - z0) * escala).toFixed(1);
    for (let i = 1; i < traza.length; i++) svg += `<line x1="${px(traza[i - 1])}" y1="${pz(traza[i - 1])}" x2="${px(traza[i])}" y2="${pz(traza[i])}" stroke="${COLOR_FPS(traza[i].fps)}" stroke-width="2"/>`;
    const ultimo = traza[traza.length - 1];
    return svg + `<circle cx="${px(ultimo)}" cy="${pz(ultimo)}" r="4" fill="#fff6ea"/></svg>`;
  }
  function datosHtml(d) {
    if (!d || typeof d !== 'object') return '';
    const lineas = [];
    if (d.zona != null || d.x != null) lineas.push(`<b>Dónde:</b> ${esc(d.zona || '?')} (${numero(d.x)}, ${numero(d.z)}, alt ${numero(d.y)})`);
    if (d.v != null) lineas.push(`<b>Coche:</b> ${numero(d.v)} m/s en ${esc(d.suelo || '?')}`);
    if (d.fps != null) lineas.push(`<b>Va:</b> ${numero(d.fps)} fps · ${numero(d.dibujos)} dibujos · ${d.tris != null ? Math.round(d.tris / 1000) + 'k tri' : ''} · res ×${numero(d.res)} · ${numero(d.trozos)} trozos`);
    if (d.evento || d.busqueda || d.pasajero) lineas.push(`<b>Partida:</b> ${d.evento ? 'evento ' + esc(d.evento) : 'libre'} · búsqueda ${numero(d.busqueda)}${d.pasajero ? ' · con pasajero' : ''}`);
    if (d.aparato) {
      const a = d.aparato;
      lineas.push(`<b>Aparato:</b> ${numero(a.ancho)}×${numero(a.alto)} dpr ${numero(a.dpr)} · ${numero(a.nucleos)} núcleos${a.gpu ? ' · ' + esc(a.gpu) : ''} · ${esc(String(a.ua || '').slice(0, 90))}`);
    }
    const conocidos = ['zona', 'x', 'y', 'z', 'ang', 'v', 'suelo', 'fps', 'dibujos', 'tris', 'res', 'trozos', 'evento', 'busqueda', 'pasajero', 'aparato', 'traza'];
    const otros = Object.keys(d).filter(k => !conocidos.includes(k));
    if (otros.length) lineas.push(`<b>Más:</b> ${esc(JSON.stringify(Object.fromEntries(otros.map(k => [k, d[k]]))).slice(0, 400))}`);
    const recorrido = d.traza ? `<details><summary>Últimos ${d.traza.length} s (verde ≥ 50 fps, amarillo ≥ 30, rojo menos)</summary>${trazaSvg(d.traza)}</details>` : '';
    return lineas.map(l => `<div class="meta">${l}</div>`).join('') + recorrido;
  }
  function conversacionHtml(r) {
    const mensajes = (r.comentarios || []).map(c => `<div class="meta"><b>${esc(c.autor)}</b> · ${fecha(c.creado)}<br>${esc(c.texto)}</div>`).join('');
    return `<div class="rp-conversacion">${mensajes}
      <textarea class="rp-comentario" rows="2" maxlength="2000" placeholder="Comentario: qué hiciste o qué ves al probarlo"></textarea>
      <div class="cab"><button type="button" data-comentar="${r.id}">Comentar</button><button type="button" data-reabrir="${r.id}">Reabrir con el comentario</button></div></div>`;
  }
  function reporteHtml(r) {
    const cabecera = `<span class="codigo">#${r.id}</span><span class="estado">${esc(r.version)}${r.alfa ? ' (alfa)' : ''} · ${esc(r.plataforma)}</span>`
      + `<span class="estado">${esc(r.nombre || r.usuario_corto)}</span><span class="estado">${fecha(r.creado)}</span><span class="estado">${esc(estadoTexto(r))}</span>`;
    const botones = (r.con_captura ? `<button type="button" data-ver="${r.id}">Ver captura</button>` : '<span class="meta">Sin captura</span>')
      + `<button type="button" data-estado="visto" data-id="${r.id}">Visto</button>`
      + `<button type="button" class="fuerte" data-estado="hecho" data-id="${r.id}" title="Confirmado: se borra en 3 días">Hecho</button>`
      + `<button type="button" data-estado="descartado" data-id="${r.id}" title="Se borra en 3 días">Descartar</button>`;
    return `<article class="cuenta ${r.estado === 'pendiente' ? '' : 'apagado'}" data-id="${r.id}">
      <div class="cab">${cabecera}</div>
      <div><b>${esc(r.texto)}</b></div>
      ${datosHtml(r.datos)}
      <div class="rp-captura"></div>
      ${conversacionHtml(r)}
      <div class="cab">${botones}</div>
    </article>`;
  }
  function pinta() {
    $('rp-lista').innerHTML = reportes.length ? reportes.map(reporteHtml).join('') : '<div class="meta">No hay reportes con ese filtro.</div>';
  }

  // --- datos
  async function cargar(juego) {
    if (juego) juegoActual = juego;
    $('rp-aviso').textContent = '';
    try {
      const r = await rpc('gestion_reportes_prueba', { p_token: leerToken(), p_juego: juegoActual, p_estado: $('rp-estado').value || null, p_dias: 90 });
      reportes = r.reportes || [];
      pinta();
      GESTION_NAV.etiqueta('pruebas', 'Reportes de prueba' + (r.pendientes ? ' (' + r.pendientes + ')' : ''), juegoActual);
    } catch (e) { $('rp-aviso').textContent = faltaSql(e) ? 'Falta aplicar servidor/99 y 100 (reportes de prueba) en Supabase.' : textoError(e); }
  }
  async function verCaptura(boton) {
    boton.disabled = true;
    try {
      const r = await rpc('gestion_reporte_prueba_captura', { p_token: leerToken(), p_id: Number(boton.dataset.ver) });
      const sitio = boton.closest('article').querySelector('.rp-captura');
      sitio.innerHTML = r.captura ? `<img src="${r.captura}" alt="captura" style="max-width:100%;border-radius:6px;border:1px solid var(--linea)">` : '<span class="meta">Sin captura</span>';
      boton.remove();
    } catch (e) { $('rp-aviso').textContent = textoError(e); boton.disabled = false; }
  }
  async function cambiaEstado(boton) {
    await rpc('gestion_reporte_prueba_estado', { p_token: leerToken(), p_id: Number(boton.dataset.id), p_estado: boton.dataset.estado });
    await cargar();
  }
  async function comenta(boton, reabrir) {
    const id = Number(reabrir ? boton.dataset.reabrir : boton.dataset.comentar);
    const texto = boton.closest('article').querySelector('.rp-comentario').value.trim();
    if (!texto) { $('rp-aviso').textContent = 'Escribe el comentario primero.'; return; }
    await rpc('gestion_reporte_prueba_comentar', { p_token: leerToken(), p_id: id, p_texto: texto, p_reabrir: reabrir });
    await cargar();
  }

  $('rp-lista').addEventListener('click', async ev => {
    const b = ev.target.closest('button'); if (!b) return;
    try {
      if (b.dataset.ver) await verCaptura(b);
      else if (b.dataset.estado) await cambiaEstado(b);
      else if (b.dataset.comentar) await comenta(b, false);
      else if (b.dataset.reabrir) await comenta(b, true);
    } catch (e) { $('rp-aviso').textContent = textoError(e); }
  });
  $('rp-recargar').onclick = () => cargar();
  $('rp-estado').onchange = () => cargar();
  // una pestaña en cada juego (todas usan el mismo panel)
  for (const [id] of GESTION_NAV.JUEGOS) GESTION_NAV.seccion({ id: 'pruebas', pan: 'pan-pruebas', juego: id, etiqueta: 'Reportes de prueba', orden: 1, cargar });
})();
