// Tiny Fans · dominio · NIDO · RECETAS: qué cuesta cada pieza, si el almacén lo paga, cómo se paga y qué devuelve al quitarla.
// Puro: trabaja con copias de { material: cantidad }. Dueño: N3 (reglas).
'use strict';
TN.recetas = {
  // lo que falta para pagar esa pieza con ese almacén: {} si llega, o { material: cuánto falta }
  falta(reglas, pieza, almacen) {
    const cuesta = reglas.nido.piezas[pieza].cuesta, falta = {};
    for (const m of Object.keys(cuesta)) if ((almacen[m] || 0) < cuesta[m]) falta[m] = cuesta[m] - (almacen[m] || 0);
    return falta;
  },
  // el almacén tras pagar (copia; no mira si llega: antes se pregunta falta())
  paga(reglas, pieza, almacen) {
    const cuesta = reglas.nido.piezas[pieza].cuesta, queda = { ...almacen };
    for (const m of Object.keys(cuesta)) queda[m] = (queda[m] || 0) - cuesta[m];
    return queda;
  },
  // el almacén tras quitar la pieza (devuelve la parte de lo que costó que digan las reglas, redondeando hacia abajo)
  devuelve(reglas, pieza, almacen) {
    const cuesta = reglas.nido.piezas[pieza].cuesta, queda = { ...almacen };
    for (const m of Object.keys(cuesta)) queda[m] = (queda[m] || 0) + Math.floor(cuesta[m] * reglas.nido.devuelve);
    return queda;
  },
};
