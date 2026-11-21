// Fans of Pop · las BANDEJAS DE LUJO (tarea #187): tres bandejas con euros a precio fijo (las de PP_BANDEJAS con `euros`), sin
// azar y solo estéticas. Aquí van su tarjeta de la tienda y su compra; la tienda (js/tienda.js) las pinta en la pestaña Bandejas.
// Los productos (`producto`) son PROVISIONALES, como los packs: aún no existen en Play ni en el servidor.
'use strict';
const ppEsBandejaLujo = B => !!(B && B.euros && B.producto);
// la tarjeta: la muestra, el nombre, la etiqueta «DE LUJO» y el precio en euros
function ppTarjetaBandejaLujoHtml(B) {
  return `${ppBandejaMuestra(B.id, 56)}<span>${tr(B.nombre)}</span><small>${tr('DE LUJO')}</small><b>${B.euros}</b>`;
}
// la compra con euros (ppCompraEuros, js/ofertas.js). La de prueba (panel DEV) la da aquí mismo; la de verdad la entrega el
// servidor, y al volver solo se guarda y se llama a alAcabar. `alAcabar` (opcional): repintar la tienda, por ejemplo.
function ppCompraBandejaLujo(B, alAcabar) {
  const html = `<p>${ppBandejaMuestra(B.id, 40)} ${tr(B.nombre)} · ${B.euros}</p>`;
  ppCompraEuros(tr('Bandeja {b}', { b: tr(B.nombre) }), html, B.producto, () => {
    SAVE.bandejas = Object.assign(SAVE.bandejas || {}, { [B.id]: true });
    SAVE.bandeja = B.id; ppGuarda();
    if (alAcabar) alAcabar();
  }, alAcabar);
}
