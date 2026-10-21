// Fans Of · /gestion: el MENÚ de arriba. «Global» es lo de siempre (Cuentas, Comentarios, Roles y el Rendimiento de todos los juegos); cada juego tiene su panel
// con sus detalles: rendimiento propio, un acceso a sus comentarios y, si el juego lo trae, su sección (GESTION_JUEGOS en decks.js, por ejemplo).
// Para añadir una sección de un juego: GESTION_JUEGOS.<id> = async cont => { ...rellena el elemento cont... } en un archivo nuevo cargado después de este.
// Usa lo de gestion/index.html: rpc(), leerToken(), esc(), fmt(), fecha(), textoError() y $().
'use strict';
const GESTION_JUEGOS = {};
(() => {
  const JUEGOS = [['rumble', 'Rumble'], ['td', 'TD'], ['survivors', 'Survivors'], ['decks', 'Decks'], ['tacticas', 'Tácticas'], ['nova', 'Nova'], ['crush', 'Crush'], ['ratkov', 'Ratkov'], ['rouflage', 'Rouflage']];
  const PANES = ['pan-cuentas', 'pan-votos', 'pan-roles', 'pan-reportes', 'pan-rend', 'pan-juego'], TABS = ['t-cuentas', 't-votos', 't-roles', 't-reportes', 't-rend'];
  let actual = 'global', R = null;
  const tabla = (cab, filas) => `<div class="tabla-caja"><table class="tabla"><thead><tr>${cab.map(c => `<th>${c}</th>`).join('')}</tr></thead><tbody>${filas.map(f => `<tr>${f.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const filaRend = x => [esc(x.juego || ''), esc(x.version), esc(x.plataforma) + (x.alfa ? ' · alfa' : ''), fmt(x.partidas), x.fps_medio, x.fps_p1_medio, x.p10_fps_medio, x.fps_min_peor, fmt(Math.round((x.segundos || 0) / 60)) + ' min'];
  const CAB_REND = ['Juego', 'Versión', 'Plataforma', 'Partidas', 'fps medio', 'fps 1 % peor', 'fps (10 % peores)', 'fps mínimo', 'Tiempo'];
  async function cargaRend() {
    if (!R) { try { R = (await rpc('gestion_rendimiento', { p_token: leerToken() })).filas || []; } catch (e) { return { error: /Could not find the function|PGRST202/.test(String(e.message)) ? 'La función de rendimiento aún no está aplicada en el servidor.' : textoError(e) }; } }
    return { filas: R };
  }
  async function pintaRend() {
    $('rend-aviso').textContent = ''; const r = await cargaRend();
    if (r.error) { $('rend-aviso').textContent = r.error; return; }
    $('rend-tabla').innerHTML = r.filas.length ? tabla(CAB_REND, r.filas.map(filaRend)) : '<div class="vacio"><b>Aún no hay datos de rendimiento</b>Aparecerán cuando los juegos manden sus primeras partidas.</div>';
  }
  async function pintaJuego(id, nombre) {
    const c = $('pan-juego'); c.innerHTML = `<div class="caja"><b style="font-size:18px">${esc(nombre)}</b><div class="meta">Detalle de este juego. El resumen de toda la web está en «Global».</div></div>`
      + '<div class="caja"><b>Comentarios</b><div class="filtros" style="margin-top:8px"><button id="j-coment" type="button">Ver los comentarios de este juego</button></div></div>'
      + (id === 'rouflage' ? '<div class="caja"><b>Reportes</b><div class="filtros" style="margin-top:8px"><button id="j-reportes" type="button">Ver los reportes de Rouflage</button></div></div>' : '')
      + '<div class="caja"><b>Rendimiento</b><div class="aviso" id="j-aviso" role="alert"></div><div id="j-rend" style="margin-top:8px"></div></div><div id="j-propio"></div>';
    if ($('j-reportes')) $('j-reportes').onclick = () => { menu('global'); $('t-reportes').click(); };
    $('j-coment').onclick = () => { menu('global'); $('t-votos').click(); const s = $('v-juego'); if (s) { s.value = id; s.dispatchEvent(new Event('change')); } };
    const r = await cargaRend();
    if (r.error) $('j-aviso').textContent = r.error;
    else { const L = r.filas.filter(x => x.juego === id); $('j-rend').innerHTML = L.length ? tabla(CAB_REND.slice(1), L.map(x => filaRend(x).slice(1))) : '<div class="vacio"><b>Sin datos de rendimiento</b>Este juego aún no ha mandado partidas.</div>'; }
    if (GESTION_JUEGOS[id]) { const cont = $('j-propio'); cont.innerHTML = '<div class="caja ayuda">Cargando…</div>'; try { await GESTION_JUEGOS[id](cont); } catch (e) { cont.innerHTML = `<div class="caja aviso">${esc(textoError(e))}</div>`; } }
  }
  function menu(id) {
    actual = id; const global = id === 'global';
    document.querySelectorAll('#menu button[data-j]').forEach(b => b.classList.toggle('activa', b.dataset.j === id));
    $('tabs').hidden = !global;
    if (global) { const t = TABS.find(x => $(x).classList.contains('activa')) || 't-cuentas'; $('pan-juego').hidden = true; $(t).click(); }
    else { PANES.forEach(p => { $(p).hidden = p !== 'pan-juego'; }); const j = JUEGOS.find(x => x[0] === id); pintaJuego(id, j ? j[1] : id); }
  }
  function rend(on) {
    $('pan-rend').hidden = !on; if (on) { ['pan-cuentas', 'pan-votos', 'pan-roles', 'pan-reportes'].forEach(p => { $(p).hidden = true; }); pintaRend(); }
    TABS.forEach(t => $(t).classList.toggle('activa', t === 't-rend' ? on : (!on && $(t).classList.contains('activa'))));
  }
  $('t-rend').onclick = () => rend(true);
  for (const t of ['t-cuentas', 't-votos', 't-roles', 't-reportes']) $(t).addEventListener('click', () => { $('pan-rend').hidden = true; $('pan-juego').hidden = true; $('t-rend').classList.remove('activa'); });
  $('menu').innerHTML = '<button type="button" class="activa" data-j="global">Global</button><span class="sep"></span>' + JUEGOS.map(([id, n]) => `<button type="button" data-j="${id}">${esc(n)}</button>`).join('');
  $('menu').onclick = ev => { const b = ev.target.closest('button[data-j]'); if (b) menu(b.dataset.j); };
  $('salir').addEventListener('click', () => { R = null; menu('global'); });
  $('recargar').addEventListener('click', () => { R = null; });
})();
