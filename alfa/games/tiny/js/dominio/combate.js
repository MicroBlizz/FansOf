// Tiny Fans · dominio · COMBATE: la grapadora dispara sola al bicho más cercano dentro de su alcance, con lo que añaden las mejoras.
// Puro. Dueño: N3 (dominio de la expedición).
// ARCHIVO-INTERFAZ: lo deja N1 vacío pero cargable; su dueño lo rellena sin cambiar los nombres que expone. Contrato: docs/guia/juegos/tiny/README.md.
'use strict';
TN.combate = {
  // el bicho al que dispararía desde (x, z), o null: de una lista [{ id, x, z }]
  objetivo(reglas, x, z, bichos) { return null; },
};
