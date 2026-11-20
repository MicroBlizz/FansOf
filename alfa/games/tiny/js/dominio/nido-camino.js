// Tiny Fans · dominio · NIDO · CAMINO: la regla de que siempre hay un camino de la entrada al almacén (las trampas y las puertas se
// pisan; las paredes no). La usa también el asalto para moverse. Puro. Dueño: N5 (dominio del nido).
// ARCHIVO-INTERFAZ: lo deja N1 vacío pero cargable; su dueño lo rellena sin cambiar los nombres que expone. Contrato: docs/guia/juegos/tiny/README.md.
'use strict';
TN.camino = {
  // ¿se llega de una casilla a otra? ocupadas: lista de { col, fila } que no se pueden pisar
  hay(columnas, filas, desde, hasta, ocupadas) { return true; },
};
