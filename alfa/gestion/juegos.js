// Fans Of · /gestion: la pestaña RENDIMIENTO de Global y la pestaña RESUMEN de cada juego (nav.js pone el menú y las pestañas). El resumen de un juego trae su rendimiento,
// un acceso a sus comentarios y, si el juego lo trae, su sección (GESTION_JUEGOS en decks.js, por ejemplo). Lo exclusivo de un juego que necesite su propia pestaña
// se apunta con GESTION_NAV.seccion({ juego: '<id>', ... }) en su archivo (ver nav.js).
// Para añadir una sección de un juego: GESTION_JUEGOS.<id> = async cont => { ...rellena el elemento cont... } en un archivo nuevo cargado después de este.
// Usa lo de gestion/index.html: rpc(), leerToken(), esc(), fmt(), fecha(), textoError() y $().
'use strict';
const GESTION_JUEGOS = {};
(() => {
  let R = null;
  const tabla = (cab, filas) => `<div class="tabla-caja"><table class="tabla"><thead><tr>${cab.map(c => `<th>${c}</th>`).join('')}</tr></thead><tbody>${filas.map(f => `<tr>${f.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const filaRend = x => [esc(x.juego || ''), esc(x.version), (x.app ? 'app Android' : esc(x.plataforma)) + (x.alfa ? ' · alfa' : ''), fmt(x.partidas), x.fps_medio, x.fps_p1_medio, x.p10_fps_medio, x.fps_min_peor, fmt(Math.round((x.segundos || 0) / 60)) + ' min'];
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
      + '<div class="caja"><b>Rendimiento</b><div class="aviso" id="j-aviso" role="alert"></div><div id="j-rend" style="margin-top:8px"></div></div><div id="j-propio"></div>';
    $('j-coment').onclick = () => { GESTION_NAV.ir('global', 'votos'); const s = $('v-juego'); if (s) { s.value = id; s.dispatchEvent(new Event('change')); } };
    const r = await cargaRend();
    if (r.error) $('j-aviso').textContent = r.error;
    else { const L = r.filas.filter(x => x.juego === id); $('j-rend').innerHTML = L.length ? tabla(CAB_REND.slice(1), L.map(x => filaRend(x).slice(1))) : '<div class="vacio"><b>Sin datos de rendimiento</b>Este juego aún no ha mandado partidas.</div>'; }
    if (GESTION_JUEGOS[id]) { const cont = $('j-propio'); cont.innerHTML = '<div class="caja ayuda">Cargando…</div>'; try { await GESTION_JUEGOS[id](cont); } catch (e) { cont.innerHTML = `<div class="caja aviso">${esc(textoError(e))}</div>`; } }
  }
  GESTION_NAV.seccion({ id: 'rend', pan: 'pan-rend', etiqueta: 'Rendimiento', orden: 4, cargar: pintaRend });
  for (const [id, nombre] of GESTION_NAV.JUEGOS) GESTION_NAV.seccion({ id: 'resumen', pan: 'pan-juego', juego: id, etiqueta: 'Resumen', orden: 0, cargar: () => pintaJuego(id, nombre) });
  $('salir').addEventListener('click', () => { R = null; });
  $('recargar').addEventListener('click', () => { R = null; });
})();
