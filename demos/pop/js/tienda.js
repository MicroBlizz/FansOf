// Fans of Pop · TIENDA (fase 3, 30-10-2026: «la monetización de Candy Crush»): las PERLAS, la moneda de pago (como sus lingotes
// de oro), y los ANUNCIOS con premio. Todo voluntario y a precio fijo; nada con azar se paga (ADR 004).
// · Sin toques: ver un anuncio (+3 toques, una vez por intento), +5 toques con perlas (cada vez más caro) o rendirse (−1 corazón).
// · Sin corazones: el reloj, llenarlos con monedas o con perlas, o ver un anuncio (+1 corazón, 3 al día).
// · La tienda de perlas: los paquetes con euros pasan por la ventana de compra de core (MONEDAS.compraReal: Google Play en la app,
//   Paddle en la web cuando se abra; hasta que existan los productos, avisa de que llegarán con la app). Los anuncios los pone la
//   capa común (ANUNCIOS.ver: AdMob, H5 o el nuestro de reserva); como en Swipe, de momento solo en la alfa y en desarrollo.
'use strict';
const ppHayAnuncios = () => !!(typeof NUCLEO !== 'undefined' && (NUCLEO.alfa || NUCLEO.desarrollo)) && typeof ANUNCIOS !== 'undefined';
const ppHoy = () => new Date().toISOString().slice(0, 10);
function ppAnunciosHoy() { if (SAVE.anuncioDia !== ppHoy()) { SAVE.anuncioDia = ppHoy(); SAVE.anunciosHoy = 0; } return SAVE.anunciosHoy; }
// ver un anuncio y, si se ha visto entero, dar el premio
function ppVerAnuncio(sitio, premio, siNo) {
  ANUNCIOS.ver(sitio).then(r => { if (r && r.visto) premio(); else if (siNo) siNo(); }).catch(() => { if (siNo) siNo(); });
}
const ppPerlasHtml = (n, px = 30) => `<span class="pp-precio">${ppIcono('i-perla', px, '#ffd1ec')}${n}</span>`;
// un botón que se paga con perlas (si no llegan, abre la tienda en vez de pagar). `vuelta`: la ventana de la que vienes, que la
// tienda vuelve a abrir al pulsar VOLVER (con las perlas ya compradas). Sin ella, un nivel parado sin toques se quedaba bloqueado.
function ppBotonPerlas(texto, precio, clase, f, vuelta = null) {
  const b = ppBoton('', clase, () => { if ((SAVE.perlas || 0) >= precio) { SAVE.perlas -= precio; ppGuarda(); f(); } else ppTienda(vuelta); });
  b.innerHTML = `${texto} · ${ppPerlasHtml(precio, 28)}`;
  return b;
}
/* ---------- sin toques: seguir ---------- */
// T.parado ya está puesto (partida.js); el corazón aún no se ha perdido. `T.seguido`: cuántas veces se ha pagado en este intento.
function ppOfreceSeguir(T) {
  const quedan = T.up.reduce((a, v, i) => a + (T.mask[i] && v > 0 ? 1 : 0), 0);
  const precio = PP_CFG.perlas.seguir[Math.min(T.seguido || 0, PP_CFG.perlas.seguir.length - 1)];
  const t = ppAbre(`<h2>${tr('¡Sin toques!')}</h2><p class="pp-sub">${tr('¡Te quedan {n} burbujas! ¿Sigues?', { n: quedan })}</p><p class="pp-sub">${tr('Tienes:')} ${ppPerlasHtml(SAVE.perlas || 0, 26)}</p>`);
  const sigue = n => { ppCierra(); T.limite += n; T.parado = false; T.seguido = (T.seguido || 0) + 1; ppFlota(tr('+{n} toques', { n }), 270, 240, '#3a8ee6'); play('ppPremio'); };
  t.appendChild(ppBotonPerlas(tr('+{n} TOQUES', { n: PP_CFG.perlas.toquesSeguir }), precio, 'pp-btn', () => sigue(PP_CFG.perlas.toquesSeguir), () => ppOfreceSeguir(T)));
  if (ppHayAnuncios() && !T.anuncio) t.appendChild(ppBoton(tr('VER ANUNCIO: +{n} TOQUES', { n: PP_CFG.anuncio.toques }), 'pp-btn2 pp-verde', () => { T.anuncio = true; ppVerAnuncio('pop-toques', () => sigue(PP_CFG.anuncio.toques), () => ppOfreceSeguir(T)); }));
  t.appendChild(ppBoton(tr('Rendirse'), 'pp-btn2 pp-azul', () => { ppCierra(); T.hecho = true; ppSinToques(); }));
}
/* ---------- sin corazones ---------- */
function ppBotonesSinCorazones(t, alLlenar, vuelta = null) {
  t.appendChild(ppBotonPrecio(tr('LLENAR'), PP_CFG.precioVidas, 'pp-btn', () => { if (ppLlenaVidas()) alLlenar(); }));
  t.appendChild(ppBotonPerlas(tr('LLENAR'), PP_CFG.perlas.vidas, 'pp-btn2 pp-rosa', () => { SAVE.vidas = PP_CFG.vida; SAVE.vidaT = Date.now(); ppGuarda(); alLlenar(); }, vuelta));
  if (ppHayAnuncios() && ppAnunciosHoy() < PP_CFG.anuncio.vidasDia)
    t.appendChild(ppBoton(tr('VER ANUNCIO: +1 CORAZÓN ({n} hoy)', { n: PP_CFG.anuncio.vidasDia - ppAnunciosHoy() }), 'pp-btn2 pp-verde', () => ppVerAnuncio('pop-vida', () => { SAVE.anunciosHoy++; ppSumaVida(1); alLlenar(); })));
}
/* ---------- la tienda de perlas ---------- */
let PP_TIENDA_VUELTA = null;   // la ventana a la que vuelve VOLVER (o null: solo se cierra)
function ppTienda(vuelta) {
  if (vuelta !== undefined) PP_TIENDA_VUELTA = vuelta;
  const t = ppAbre(`<h2>${tr('Perlas')}</h2>${ppIcono('i-perlas', 110, '#ffd1ec')}<p class="pp-sub">${tr('Las perlas sirven para seguir cuando te quedas sin toques, llenar los corazones y hacer sitio en el equipo.')}</p>
    <p class="pp-sub">${tr('Tienes:')} ${ppPerlasHtml(SAVE.perlas || 0, 28)} · ${ppMonedasHtml(SAVE.monedas, 28)}</p>`, true);
  const rejilla = document.createElement('div'); rejilla.className = 'pp-packs'; t.appendChild(rejilla);
  for (const p of PP_CFG.packs) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'pp-pack';
    b.innerHTML = `${p.extra ? `<i>${p.extra}</i>` : ''}${ppPerlasHtml(p.perlas, 34)}<b>${p.precio}</b>`;
    b.onclick = () => { play('select'); ppCompraPack(p); };
    rejilla.appendChild(b);
  }
  t.appendChild(ppBoton(tr('VOLVER'), 'pp-btn2 pp-azul', () => { const v = PP_TIENDA_VUELTA; PP_TIENDA_VUELTA = null; ppCierra(); if (v) v(); }));
}
function ppCompraPack(p) {
  if (typeof MONEDAS === 'undefined') return;
  MONEDAS.compraReal(tr('{n} perlas', { n: p.perlas }), `<p>${tr('{n} perlas por {p}.', { n: p.perlas, p: p.precio })}</p>`, r => {
    if (r && r.real) { ppTienda(); return; }   // la de verdad la entrega el servidor (el saldo ya llega con la partida)
    SAVE.perlas = (SAVE.perlas || 0) + p.perlas; ppGuarda(); play('ppPremio'); ppTienda();   // compra de prueba (desarrollo)
  }, p.id);
}
