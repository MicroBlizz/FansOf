// Fans Of · MEDIDOR DE ANUNCIOS (tienda): la oferta «Sin anuncios» de un juego (ADR 123, docs/guia/core/anuncios.md). Quien la compra
// recibe al momento los premios de los anuncios, con el mismo tope de cada día, y tiene siempre el nivel de anuncios máximo.
// El juego coloca el bloque en su tienda y pone su producto y su precio; el derecho comprado se llama igual en todos: 'sin-anuncios'.
// Sin globales: todo entra por puertos.
//   oferta      { producto: '<juego>_sin_anuncios', precio: 6.99 }, de los ajustes del juego
//   derechos    lo comprado en la cuenta, como DERECHOS.crea (tiene, llega)
//   comprar     como MONEDAS.compraReal(titulo, html, alComprar, producto): en desarrollo es una compra de prueba
//   sePuede()   ¿se puede comprar aquí? (MEDIDOR_ANUNCIOS.sePuedeComprar vale): donde no, el bloque no sale
//   idioma()    el idioma de la pantalla, para escribir el precio
'use strict';
MEDIDOR_ANUNCIOS.DERECHO = 'sin-anuncios';
// solo donde de verdad se puede comprar: la app (Google Play), la web con el pago abierto o el modo desarrollo (compra de prueba).
// En otro sitio, un botón con euros solo llevaría a «aún no está a la venta»
MEDIDOR_ANUNCIOS.sePuedeComprar = () => (typeof NUCLEO !== 'undefined' && !!NUCLEO.desarrollo)
  || (typeof PAGOS !== 'undefined' && PAGOS.disponible()) || (typeof PAGOS_WEB !== 'undefined' && PAGOS_WEB.disponible());
MEDIDOR_ANUNCIOS.creaTienda = ({ oferta, derechos, comprar, sePuede, idioma = () => 'es' }) => {
  const texto = (t, d) => (typeof tr === 'function' ? tr(t, d) : t);
  const DERECHO = MEDIDOR_ANUNCIOS.DERECHO;
  const euros = v => (idioma() === 'en' ? '€' + v.toFixed(2) : v.toFixed(2).replace('.', ',') + ' €');
  const comprado = () => derechos.tiene(DERECHO);
  const QUE_DA = 'Los premios de los anuncios te llegan al momento, sin verlos, y tu nivel de anuncios es siempre el máximo. El tope de cada día sigue igual.';
  // el bloque de la tienda: comprado, dice que ya lo tiene; si no, el botón con el precio (data-med-an-compra), solo donde se puede comprar.
  // atributos: lo que el juego necesite añadir al botón para enterarse del toque (por ejemplo 'data-acc="sin-anuncios"')
  function html(atributos = '') {
    if (!comprado() && !sePuede()) return '';
    const derecha = comprado() ? `<em>${texto('Ya lo tienes')}</em>` : `<button type="button" class="med-an-compra" data-med-an-compra${atributos ? ' ' + atributos : ''}>${euros(oferta.precio)}</button>`;
    return `<div class="med-an-oferta${comprado() ? ' tuya' : ''}"><div><b>${texto('Sin anuncios')}</b> <span class="med-an-siempre">${texto('PARA SIEMPRE')}</span>`
      + `<p>${texto(QUE_DA)}</p></div>${derecha}</div>`;
  }
  // abre la compra; al terminar apunta el derecho y avisa con el resultado. No hace nada si ya lo tiene o si aquí no se puede comprar
  function compra(alComprar = () => {}) {
    if (comprado() || !sePuede()) return false;
    const cuerpo = `${texto('Sin anuncios')}<span class="big">${texto('PARA SIEMPRE')}</span><b>${euros(oferta.precio)}</b><small>${texto(QUE_DA)}</small>`;
    comprar(texto('¿COMPRAR?'), cuerpo, r => { derechos.llega(r, DERECHO); alComprar(r); }, oferta.producto);
    return true;
  }
  return { html, compra, comprado, euros };
};
