// Fans Of · /gestion: la pestaña REPORTES DE ROUFLAGE. Los jugadores reportan el escenario pintado a mano que vieron en una sala con amigos
// (games/rouflage/js/sala-votos.js); aquí se ve la COPIA EXACTA de lo que vieron, dibujada (una vista sencilla: la sala, la pintura tal cual y
// los muebles como marcas con su nombre), y se decide: Descartar, Banear 7 días, Banear para siempre o Borrar escenario (retira ese dibujo).
// Datos: gestion_reportes(token, estado, días), gestion_reporte_resolver(token, id, acción, días) y gestion_desbanear(token, usuario), servidor/60-rouflage-votos.sql.
// Usa lo de gestion/index.html: rpc(), leerToken(), esc(), fmt(), fecha(), textoError() y $().
'use strict';
(() => {
  let D = null;
  const otras = ['t-cuentas', 't-votos', 't-roles'], paneles = ['pan-cuentas', 'pan-votos', 'pan-roles'];
  const MOTIVO = { dibujo: 'Dibujo inapropiado', nombre: 'Nombre ofensivo', otro: 'Otra cosa' };
  const ESTADO = { pendiente: 'pendiente', descartado: 'descartado', baneado: 'baneado', borrado: 'escenario borrado' };
  // el color de la pared y del suelo de cada escenario (games/rouflage/js/escenario-datos.js), solo para orientarse
  const COLORES = { oficina: ['#6d7fa8', '#4b5878'], cafeteria: ['#cfd8dc', '#9aa4a8'], rrhh: ['#8a6a4a', '#b9a07a'], almacen: ['#7a7f88', '#8d8a82'], parking: ['#595d6a', '#3a3c44'],
    terraza: ['#8a6a5a', '#b88f6a'], jardin: ['#4f8a3e', '#5aa04a'], caseta: ['#9a7a4a', '#7a5a3a'], nube: ['#3a4a6a', '#5a6a8a'], hotel: ['#7a4a3a', '#6a2a3a'],
    cloacas: ['#5a3a30', '#4a4038'], vestibulo: ['#6a4a2a', '#d8d0c0'], cumple: ['#e8a0c0', '#f0e080'], bombas: ['#5a5a50', '#3a3a38'], archivo: ['#7a7a70', '#a09a8a'], backrooms: ['#d8c870', '#c8b860'] };
  const A64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  // la pintura en texto «r,w,h,colores,tiradas» (escenario-pinta.js: pinturaDecodifica), sin depender del juego
  function pintura(txt) {
    const q = String(txt || '').split(','); if (q.length < 5) return null;
    const r = +q[0], w = +q[1], h = +q[2]; if (!(r > 0 && w > 0 && h > 0 && w * h <= 400000)) return null;
    const pal = q[3].split('.').filter(x => /^[0-9a-f]{6}$/i.test(x)).map(x => '#' + x), cel = new Uint8Array(w * h), s = q[4];
    let i = 0, j = 0;
    while (j < s.length && i < cel.length) {
      const v = A64.indexOf(s[j++]); let n = 0, sh = 0, d;
      do { d = A64.indexOf(s[j++]); if (d < 0) break; n |= (d & 31) << sh; sh += 5; } while (d & 32);
      if (d < 0) break;
      cel.fill(v > pal.length ? 0 : v, i, Math.min(cel.length, i + n + 1)); i += n + 1;
    }
    return { r, w, h, pal, cel };
  }
  function dibuja(cv, d) {
    const g = cv.getContext('2d'), W = 520, H = 540, X0 = 20, Y0 = 20, PY = 100;
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height);
    const k = cv.width / W; g.scale(k, k);
    if (!d || typeof d !== 'object') { g.fillStyle = '#2a2a3a'; g.fillRect(0, 0, W, H); g.fillStyle = '#fff'; g.font = '20px system-ui'; g.fillText('Sin copia del escenario', 140, 270); return; }
    const [pared, suelo] = COLORES[d.e] || ['#556', '#445'];
    g.fillStyle = '#20102c'; g.fillRect(0, 0, W, H);
    g.fillStyle = pared; g.fillRect(X0, Y0, W - 2 * X0, PY - Y0);
    g.fillStyle = suelo; g.fillRect(X0, PY, W - 2 * X0, H - Y0 - PY);
    const p = d.p ? pintura(d.p) : null;
    if (p) {
      const c = document.createElement('canvas'); c.width = p.w; c.height = p.h;
      const cg = c.getContext('2d'), img = cg.createImageData(p.w, p.h), rgb = p.pal.map(x => [1, 3, 5].map(i => parseInt(x.slice(i, i + 2), 16)));
      for (let i = 0; i < p.cel.length; i++) { const v = p.cel[i]; if (!v || !rgb[v - 1]) continue; const o = i * 4; img.data[o] = rgb[v - 1][0]; img.data[o + 1] = rgb[v - 1][1]; img.data[o + 2] = rgb[v - 1][2]; img.data[o + 3] = 255; }
      cg.putImageData(img, 0, 0); g.imageSmoothingEnabled = false; g.drawImage(c, X0, Y0, p.w * p.r, p.h * p.r);
    }
    for (const m of Array.isArray(d.m) ? d.m.slice(0, 60) : []) {      // los muebles (son del catálogo: no los dibuja nadie a mano), como marcas
      if (!Array.isArray(m)) continue;
      const x = +m[1] || 0, y = +m[2] || 0;
      g.fillStyle = 'rgba(255,255,255,.55)'; g.strokeStyle = '#20102c'; g.lineWidth = 2.5;
      g.beginPath(); g.arc(x, y - 8, 9, 0, Math.PI * 2); g.fill(); g.stroke();
      g.fillStyle = '#20102c'; g.font = 'bold 11px system-ui'; g.textAlign = 'center'; g.fillText(String(m[0]).slice(0, 14), x, y + 12);
    }
    g.textAlign = 'start';
  }
  function tarjeta(r) {
    const pend = r.estado === 'pendiente';
    const quien = r.dueno_email ? esc(r.dueno_email) : 'cuenta ' + esc(r.dueno_corto);
    const ban = r.baneado ? `<span class="estado si">baneado ${r.baneado === 'siempre' ? 'para siempre' : 'hasta ' + fecha(r.baneado)}</span>` : '';
    return `<article class="cuenta${pend ? ' marcada' : ''}" data-id="${r.id}">
      <div class="cab"><span class="codigo">${esc(r.nombre || r.dueno_nombre || '?')}</span><span class="estado${pend ? ' si' : ''}">${esc(ESTADO[r.estado] || r.estado)}</span>${ban}
        <span class="puntos${r.personas >= 3 ? ' alta' : ''}">${fmt(r.personas)} ${r.personas === 1 ? 'persona' : 'personas'}</span></div>
      <div class="meta"><b>${esc(MOTIVO[r.motivo] || r.motivo)}</b>${r.texto ? ' · «' + esc(r.texto) + '»' : ''}</div>
      <div class="meta">Dueño: ${quien}${r.dueno_nombre && r.dueno_nombre !== r.nombre ? ' (ahora se llama ' + esc(r.dueno_nombre) + ')' : ''} · ${fmt(r.megusta)} me gusta · ${fmt(r.nogusta)} no me gusta${r.oculto ? ' · <b>oculto ahora</b>' : ''}</div>
      <div class="meta">Reportado ${fecha(r.creado)} por ${r.quien_email ? esc(r.quien_email) : 'cuenta ' + esc(r.quien_corto)}${r.resuelto ? ' · resuelto ' + fecha(r.resuelto) + ' por ' + esc(r.resuelto_por || '') : ''}</div>
      <canvas class="rf-esc" width="520" height="540" aria-label="Copia del escenario reportado"></canvas>
      <details><summary>Datos del escenario</summary><pre>${esc(JSON.stringify(r.escenario))}</pre></details>
      ${pend ? `<div class="accion"><button data-a="descartar">Descartar</button><button class="peligro" data-a="borrar_escenario">Borrar escenario</button>
        <button class="peligro" data-a="banear" data-d="7">Banear 7 días</button><button class="peligro" data-a="banear" data-d="0">Banear para siempre</button></div>` : ''}
    </article>`;
  }
  function pinta() {
    if (!D) return;
    const L = D.reportes || [], B = D.baneados || [];
    $('rf-resumen').innerHTML = [[D.pendientes, 'reportes pendientes'], [B.length, 'baneados ahora']].map(([n, t]) => `<div><b>${fmt(n)}</b><span>${t}</span></div>`).join('');
    $('rf-lista').innerHTML = L.length ? L.map(tarjeta).join('') : `<div class="vacio"><b>Nada que revisar</b>Cuando alguien reporte un escenario de Rouflage, aparecerá aquí con la copia de lo que vio.</div>`;
    $('rf-lista').querySelectorAll('article').forEach((a, i) => dibuja(a.querySelector('canvas'), L[i].escenario));
    $('rf-baneados').innerHTML = B.length ? '<h2 style="font-size:15px;margin:8px 0 0">Baneados</h2>' + B.map(b => `<article class="cuenta"><div class="cab"><span class="codigo">${esc(b.nombre || b.corto)}</span>
        <span class="estado si">${b.hasta ? 'hasta ' + fecha(b.hasta) : 'para siempre'}</span><span class="meta">${esc(b.email || 'cuenta ' + b.corto)} · ${esc(b.motivo || '')} · ${esc(b.quien || '')} · ${fecha(b.creado)}</span></div>
        <div class="accion"><button data-u="${esc(b.usuario)}">Quitar el baneo</button></div></article>`).join('') : '';
  }
  async function cargar() {
    $('rf-aviso').textContent = '';
    try { D = await rpc('gestion_reportes', { p_token: leerToken(), p_estado: $('rf-estado').value, p_dias: 30 }); pinta(); }
    catch (e) { $('rf-aviso').textContent = /does not exist|PGRST202|404/.test(String(e.message)) ? 'Los reportes de Rouflage aún no están activados en el servidor (servidor/60-rouflage-votos.sql).' : textoError(e); }
  }
  function mostrar(si) {
    $('pan-reportes').hidden = !si; $('t-reportes').classList.toggle('activa', si);
    if (si) { paneles.forEach(p => { $(p).hidden = true; }); otras.forEach(t => $(t).classList.remove('activa')); cargar(); }
  }
  $('t-reportes').onclick = () => mostrar(true);
  otras.forEach(t => $(t).addEventListener('click', () => mostrar(false)));
  $('rf-estado').onchange = cargar; $('rf-recargar').onclick = cargar;
  $('rf-lista').onclick = async ev => {
    const b = ev.target.closest('button[data-a]'); if (!b) return;
    const a = b.closest('article'), acc = b.dataset.a, dias = b.dataset.d != null ? Number(b.dataset.d) : null;
    const pregunta = acc === 'banear' ? (dias ? '¿Banear 7 días a este jugador? No podrá enseñar su escenario ni crear salas con amigos.' : '¿Banear PARA SIEMPRE a este jugador?')
      : acc === 'borrar_escenario' ? '¿Retirar este dibujo? No podrá volver a subirlo tal cual.' : '';
    if (pregunta && !confirm(pregunta)) return;
    a.querySelectorAll('button').forEach(x => { x.disabled = true; });
    try { await rpc('gestion_reporte_resolver', { p_token: leerToken(), p_id: Number(a.dataset.id), p_accion: acc, p_dias: dias }); await cargar(); }
    catch (e) { $('rf-aviso').textContent = textoError(e); a.querySelectorAll('button').forEach(x => { x.disabled = false; }); }
  };
  $('rf-baneados').onclick = async ev => {
    const b = ev.target.closest('button[data-u]'); if (!b || !confirm('¿Quitar el baneo?')) return;
    b.disabled = true;
    try { await rpc('gestion_desbanear', { p_token: leerToken(), p_usuario: b.dataset.u }); await cargar(); } catch (e) { $('rf-aviso').textContent = textoError(e); b.disabled = false; }
  };
  $('salir').addEventListener('click', () => { D = null; mostrar(false); });
})();
