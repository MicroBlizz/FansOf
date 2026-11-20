// Tiny Fans · dominio · NIDO · RECETAS: qué cuesta cada pieza, si el almacén lo paga y qué devuelve al quitarla. Puro.
// Dueño: N5 (dominio del nido).
// ARCHIVO-INTERFAZ: lo deja N1 vacío pero cargable; su dueño lo rellena sin cambiar los nombres que expone. Contrato: docs/guia/juegos/tiny/README.md.
'use strict';
TN.recetas = {
  // lo que falta para pagar esa pieza con ese almacén: {} si llega, o { material: cuánto falta }
  falta(reglas, pieza, almacen) { return {}; },
};
