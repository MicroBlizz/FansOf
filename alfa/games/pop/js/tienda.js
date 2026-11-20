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
// un PRECIO en perlas con sus euros debajo («≈ 0,89 €», tarea #177: las perlas son dinero de verdad). Solo para lo que se paga; los
// saldos y los premios en perlas van con ppPerlasHtml. Los euros, a lo más caro (js/precios.js)
function ppPerlasPrecioHtml(n, px = 30) {
  const e = PP_PRECIOS.enEuros(n, PP_CFG.packs);
  return e === null ? ppPerlasHtml(n, px) : `<span class="pp-precio-e">${ppPerlasHtml(n, px)}<small class="pp-euros">≈ ${PP_PRECIOS.formato(e)}</small></span>`;
}
// un botón que se paga con perlas (si no llegan, ofrece el pack más pequeño que llega y, al comprarlo, paga; tarea #187,
// js/tienda-venta.js). `vuelta`: la ventana de la que vienes, que se vuelve a abrir al decir «Ahora no» o VOLVER. Sin ella, un
// nivel parado sin toques se quedaba bloqueado. `motivo`: el del servidor para ese gasto (seguir, vidas, hueco; js/perlas-libro.js).
function ppBotonPerlas(texto, precio, clase, f, vuelta = null, motivo = null) {
  const paga = () => { if (ppPerlas(-precio, motivo)) f(); else ppFaltanPerlas(precio, paga, vuelta); };
  const b = ppBoton('', clase, paga);
  b.innerHTML = `${texto} · ${ppPerlasPrecioHtml(precio, 28)}`;
  return b;
}
/* ---------- sin toques: seguir ---------- */
// la pregunta con las burbujas que quedan, en singular si es una (tarea #135)
const ppTextoQuedan = n => (n === 1 ? tr('¡Te queda 1 burbuja! ¿Sigues?') : tr('¡Te quedan {n} burbujas! ¿Sigues?', { n }));
// T.parado ya está puesto (partida.js); el corazón aún no se ha perdido.
function ppOfreceSeguir(T) {
  const quedan = T.up.reduce((a, v, i) => a + (T.mask[i] && v > 0 ? 1 : 0), 0);
  const precio = PP_CFG.perlas.seguir;   // fijo: no sube en el mismo intento (tarea #186)
  // con racha, una línea suave con lo que te da (sin avisar de pérdidas, tarea #186): js/victoria-panel.js
  const racha = (SAVE.racha || 0) > 0 ? ppVicAvisoRacha() : '';
  const t = ppAbre(`<h2>${tr('¡Sin toques!')}</h2><p class="pp-sub">${ppTextoQuedan(quedan)}</p>${racha}<p class="pp-sub">${tr('Tienes:')} ${ppPerlasHtml(SAVE.perlas || 0, 26)}</p>`);
  const sigue = n => { ppCierra(); T.limite += n; T.parado = false; ppFlota(tr('+{n} toques', { n }), 270, 240, '#3a8ee6'); play('ppPremio'); };
  t.appendChild(ppBotonPerlas(tr('+{n} TOQUES', { n: PP_CFG.perlas.toquesSeguir }), precio, 'pp-btn', () => sigue(PP_CFG.perlas.toquesSeguir), () => ppOfreceSeguir(T), 'seguir'));
  ppBotonPackSinToques(t, T, sigue);   // tarea #187: Martillo + Bomba + 3 toques por euros (js/tienda-venta.js)
  if (ppHayAnuncios() && !T.anuncio) t.appendChild(ppBoton(tr('VER ANUNCIO: +{n} TOQUES', { n: PP_CFG.anuncio.toques }), 'pp-btn2 pp-verde', () => { T.anuncio = true; ppVerAnuncio('pop-toques', () => sigue(PP_CFG.anuncio.toques), () => ppOfreceSeguir(T)); }));
  t.appendChild(ppBoton(tr('Rendirse'), 'pp-btn2 pp-azul', () => { ppCierra(); T.hecho = true; ppSinToques(); }));
}
/* ---------- sin corazones ---------- */
function ppBotonesSinCorazones(t, alLlenar, vuelta = null) {
  t.appendChild(ppBotonPrecio(tr('LLENAR'), PP_CFG.precioVidas, 'pp-btn', () => { if (ppLlenaVidas()) alLlenar(); }));
  t.appendChild(ppBotonPerlas(tr('LLENAR'), PP_CFG.perlas.vidas, 'pp-btn2 pp-rosa', () => { SAVE.vidas = PP_CFG.vida; SAVE.vidaT = Date.now(); ppGuarda(); alLlenar(); }, vuelta, 'vidas'));
  if (ppHayAnuncios() && ppAnunciosHoy() < PP_CFG.anuncio.vidasDia)
    t.appendChild(ppBoton(tr('VER ANUNCIO: +1 CORAZÓN ({n} hoy)', { n: PP_CFG.anuncio.vidasDia - ppAnunciosHoy() }), 'pp-btn2 pp-verde', () => ppVerAnuncio('pop-vida', () => { SAVE.anunciosHoy++; ppSumaVida(1); alLlenar(); })));
}
/* ---------- la tienda (con pestañas, como Candy Crush) ---------- */
// OFERTAS (pack de bienvenida, la de atasco, la hucha y el pase) · PERLAS (los paquetes con euros) · AYUDAS (con perlas, sueltas o
// de 3 en 3 más baratas) · BANDEJAS (las bonitas, con monedas). `vuelta`: la ventana a la que vuelve VOLVER (null: solo se cierra).
let PP_TIENDA_VUELTA = null, PP_TIENDA_PESTANA = 'ofertas';
function ppTienda(vuelta, pestana) {
  ppTutorial('tienda');
  if (vuelta !== undefined) PP_TIENDA_VUELTA = vuelta;   // sin decir nada (al cambiar de pestaña) se mantiene
  if (pestana) PP_TIENDA_PESTANA = pestana;
  const t = ppAbre(`<h2>${tr('Tienda')}</h2><p class="pp-sub">${tr('Tienes:')} ${ppPerlasHtml(SAVE.perlas || 0, 28)} · ${ppMonedasHtml(SAVE.monedas, 28)}</p>`, true);
  const tabs = document.createElement('div'); tabs.className = 'pp-tabs';
  for (const [k, txt] of [['ofertas', tr('Ofertas')], ['perlas', tr('Perlas')], ['ayudas', tr('Ayudas')], ['bandejas', tr('Bandejas')]]) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'pp-tab' + (PP_TIENDA_PESTANA === k ? ' pp-on' : '') + (k === 'perlas' ? ' pp-tab-perlas' : ''); b.textContent = txt;
    if (k === 'perlas') b.insertAdjacentHTML('afterbegin', ppIcono('i-perla', 20, '#ffd1ec'));   // la que más se compra, en dorado (tarea #187)
    b.onclick = () => { play('select'); ppTienda(undefined, k); }; tabs.appendChild(b);
  }
  t.appendChild(tabs);
  const caja = document.createElement('div'); caja.className = 'pp-packs'; t.appendChild(caja);
  const tarjeta = (html, f, clase = '') => { const b = document.createElement('button'); b.type = 'button'; b.className = 'pp-pack ' + clase; b.innerHTML = html; b.onclick = () => { play('select'); f(); }; caja.appendChild(b); return b; };
  (PP_TIENDA_PESTANAS[PP_TIENDA_PESTANA] || ppTiendaOfertas)(tarjeta);   // lo de cada pestaña: js/tienda-venta.js (tarea #187)
  t.appendChild(ppBoton(tr('VOLVER'), 'pp-btn2 pp-azul', () => { const v = PP_TIENDA_VUELTA; PP_TIENDA_VUELTA = null; ppCierra(); if (v) v(); }));
}
// `alAcabar`: lo que se hace cuando llegan las perlas (por defecto, repintar la tienda; tarea #187: «comprar solo lo que falta»)
function ppCompraPack(p, alAcabar = () => ppTienda()) {
  if (ppCompraDePrueba()) { ppPerlas(p.perlas); play('ppPremio'); alAcabar(); return; }   // panel DEV (js/dev.js): sin cobrar
  if (typeof MONEDAS === 'undefined') return;
  MONEDAS.compraReal(tr('{n} perlas', { n: p.perlas }), `<p>${tr('{n} perlas por {p}.', { n: p.perlas, p: p.precio })}</p>`, r => {
    if (r && r.real) { PP_SRV.arranca().then(alAcabar); return; }   // la de verdad la entrega el servidor: se le pide el saldo
    ppPerlas(p.perlas); play('ppPremio'); alAcabar();   // compra de prueba (desarrollo)
  }, p.id);
}
