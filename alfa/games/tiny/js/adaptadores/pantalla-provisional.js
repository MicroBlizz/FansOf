// Tiny Fans · adaptador · PANTALLA PROVISIONAL: el andamio del esqueleto. Hace una pantalla mínima (el nombre del juego, el de la
// pantalla y un botón para ir a cada una de las otras) para que el juego se pueda abrir y recorrer antes de que existan las de verdad.
// Cada pantalla de verdad sustituye a la suya en su archivo; cuando no quede ninguna provisional, este archivo se borra (cierre).
// Dueño: N1 (arquitectura).
'use strict';
TN.pantallaProvisional = (id, opciones = {}) => {
  let caja = null, pasos = 0;
  const boton = otra => TN.crea('button', { type: 'button', className: 'tn-boton' + (otra === 'expedicion' ? ' tn-principal' : ''),
    textContent: tr(TN.textos.pantallas[otra] || otra), onclick: () => TN.pantallas.ve(otra) });
  return {
    id, joystick: !!opciones.joystick, enPartida: !!opciones.enPartida,
    entra() {
      pasos = 0;
      caja = TN.crea('section', { className: 'tn-provisional' },
        TN.crea('h1', { className: 'tn-titulo', textContent: tr(TN.textos.juego) }),
        TN.crea('p', { className: 'tn-sello', textContent: tr(TN.textos.pantallas[id] || id) }),
        TN.crea('p', { textContent: tr('Prototipo en obras: esta pantalla aún no está hecha.') }),
        TN.crea('nav', { className: 'tn-fila' }, ...TN.pantallas.ids().filter(otra => otra !== id).map(boton)));
      TN.capa().append(caja);
    },
    sale() { if (caja) caja.remove(); caja = null; },
    paso() { pasos += 1; },
    pinta() {},
    estado: () => ({ provisional: true, pasos }),
  };
};
