// Tiny Fans · adaptador · ELECCIÓN DE MEJORA: tres tarjetas grandes al llenar la barra de voltios. Solo aceptan un dedo que se haya
// levantado antes (el que lleva el joystick no elige sin querer) y esperan medio segundo antes de dejarse pulsar.
'use strict';
TN.hudMejoras = (() => {
  let caja = null;
  const DICE = { 'grapa-doble': 'Una grapa más por disparo', 'punta-afilada': 'Cada grapa hace más daño', 'cafe-cargado': 'Corres más deprisa', 'pila-repuesto': 'La batería dura más' };
  return {
    abre(oferta, niveles, alElegir) {
      this.cierra();
      const desde = performance.now() + 500;
      const tarjeta = id => TN.crea('button', { type: 'button', className: 'tn-mejora',
        onclick: () => { if (performance.now() >= desde) alElegir(id); } },
      TN.iconos.nodo(id, 54), TN.crea('b', { textContent: tr(TN.textos.mejoras[id] || id) }), TN.crea('small', { textContent: tr(DICE[id] || '') }),
      TN.crea('em', { textContent: tr('Nivel {n}', { n: (niveles[id] || 0) + 1 }) }));
      caja = TN.crea('div', { className: 'tn-ventana tn-mejoras' }, TN.crea('h2', { className: 'tn-titulo', textContent: tr('¡Mejora!') }), ...oferta.map(tarjeta));
      TN.capa().append(caja);
    },
    cierra() { if (caja) caja.remove(); caja = null; },
    get abierta() { return !!caja; },
  };
})();
