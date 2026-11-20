// Tiny Fans · dominio · MAPA: el suelo de la parada. Con los datos de reglas.mapa dice en qué anillo cae un punto, si está en el nido,
// si choca con un mueble o con el borde y dónde queda tras moverse. Puro. Dueño: N3 (dominio de la expedición).
// ARCHIVO-INTERFAZ: lo deja N1 vacío pero cargable; su dueño lo rellena sin cambiar los nombres que expone. Contrato: docs/guia/juegos/tiny/README.md.
'use strict';
TN.mapa = {
  // 0 (cerca), 1 (en medio) o 2 (lejos)
  anillo(reglas, x, z) { return 0; },
  enNido(reglas, x, z) { return false; },
  // dónde queda algo de ese radio que quiere ir de (x, z) a (ax, az) sin atravesar muebles ni salirse: { x, z }
  mueve(reglas, x, z, ax, az, radio) { return { x: ax, z: az }; },
};
