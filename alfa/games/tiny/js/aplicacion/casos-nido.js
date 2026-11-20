// Tiny Fans · aplicación · CASOS DE USO DEL NIDO: colocar, quitar y mover piezas y leer el almacén. Cargan el nido de la partida, piden
// al dominio, anuncian los eventos y guardan. Puertos: { reglas, sesion, reloj, eventos }. Dueño: N10 (pantalla del nido).
// ARCHIVO-INTERFAZ: lo deja N1 vacío pero cargable; su dueño lo rellena sin cambiar los nombres que expone. Contrato: docs/guia/juegos/tiny/README.md.
'use strict';
TN.creaCasosNido = ({ reglas, sesion, reloj, eventos }) => ({
  get nido() { return null; },
  coloca(pieza, col, fila) { return TN.error('pieza-desconocida'); },
  quita(col, fila) { return TN.error('casilla-vacia'); },
  mueve(col, fila, aCol, aFila) { return TN.error('casilla-vacia'); },
});
