// Fans Of Paperwork · adaptador · MEJORAS DE PAGO (ADR 125): qué mejoras tiene compradas la cuenta y cómo se compran.
// Lo que hay comprado lo lleva core (DERECHOS, core/js/sistema/derechos.js): la cuenta manda, con una copia en este navegador que NO
// se borra con cada versión como la partida (clave <clave del juego>-mejoras) y las compras de prueba aparte, solo en modo desarrollo.
// Aquí queda lo de Paperwork: qué claves son suyas y qué producto es cada oferta. Cobra core: MONEDAS.compraReal.
// También guarda el «Sin anuncios» del medidor de anuncios (ADR 123), que vende el bloque de core (MEDIDOR_ANUNCIOS.creaTienda) con `tiene` y `llega`.
// Puertos: los de DERECHOS (almacenamiento, clave, cuenta, juego, desarrollo, alCambiar(claves), enLinea()) y
// comprar(titulo, html, alComprar, producto).
'use strict';
PW.creaMejorasPago = ({ comprar, ...puertos }) => {
  const M = PW.AJ.mejoras, ES_MEJORA = /^mejora:/, SIN_ANUNCIOS = 'sin-anuncios';   // el derecho de core: MEDIDOR_ANUNCIOS.DERECHO
  const derechos = DERECHOS.crea({ ...puertos, vale: c => ES_MEJORA.test(c) || c === SIN_ANUNCIOS });
  // comprar una de las ofertas ('turno', 'taquilla' o 'pack'); titulo y html los pone la pantalla (ya traducidos)
  function compra(id, titulo, html, alComprar = () => {}) {
    const m = M[id];
    if (!m) return;
    comprar(titulo, html, r => { derechos.llega(r, m.clave); alComprar(r); }, m.producto);
  }
  return { claves: derechos.claves, tiene: derechos.tiene, llega: derechos.llega, refresca: derechos.refresca, compra, olvidaPruebas: derechos.olvidaPruebas };
};
