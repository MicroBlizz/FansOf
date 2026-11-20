// Tiny Fans · dominio · BECARIO: el becario y su batería (gasto por tiempo, batería roja, pilas, frenado por la tela, lanzado por el
// pisotón). Puro: sin reloj ni pantalla. Dueño: N3 (dominio de la expedición).
// ARCHIVO-INTERFAZ: lo deja N1 vacío pero cargable; su dueño lo rellena sin cambiar los nombres que expone. Contrato: docs/guia/juegos/tiny/README.md.
'use strict';
TN.Becario = class Becario {
  static nuevo(reglas) { return new Becario(); }
};
