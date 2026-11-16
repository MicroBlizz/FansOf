// Fans Of Paperwork · adaptador · MEJORAS DE PAGO (ADR 125): qué mejoras tiene compradas la cuenta y cómo se compran.
// Lo que hay comprado lo lleva core (DERECHOS, core/js/sistema/derechos.js): la cuenta manda, con una copia en este navegador que NO
// se borra con cada versión como la partida (clave <clave del juego>-mejoras) y las compras de prueba aparte, solo en modo desarrollo.
// Aquí queda lo de Paperwork: qué claves son suyas y qué producto es cada oferta. Cobra core: MONEDAS.compraReal.
// Puertos: los de DERECHOS (almacenamiento, clave, cuenta, juego, desarrollo, alCambiar(claves), enLinea()) y
// comprar(titulo, html, alComprar, producto).
'use strict';
PW.creaMejorasPago = ({ comprar, ...puertos }) => {
  const M = PW.AJ.mejoras, ES_MEJORA = /^mejora:/;
  const derechos = DERECHOS.crea({ ...puertos, vale: c => ES_MEJORA.test(c) });
  // comprar una de las ofertas ('turno', 'taquilla' o 'pack'); titulo y html los pone la pantalla (ya traducidos)
  function compra(id, titulo, html, alComprar = () => {}) {
    const m = M[id];
    if (!m) return;
    comprar(titulo, html, r => { derechos.llega(r, m.clave); alComprar(r); }, m.producto);
  }
  return { claves: derechos.claves, refresca: derechos.refresca, compra, olvidaPruebas: derechos.olvidaPruebas };
};
