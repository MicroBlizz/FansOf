// Tiny Fans · dominio · BOTÍN Y MOCHILA: los materiales del suelo y la mochila de 8 huecos de 10 (lo que no cabe se queda en el suelo).
// TN.Mochila se usa también en el asalto. Puro. Dueño: N3 (dominio de la expedición).
// ARCHIVO-INTERFAZ: lo deja N1 vacío pero cargable; su dueño lo rellena sin cambiar los nombres que expone. Contrato: docs/guia/juegos/tiny/README.md.
'use strict';
TN.Mochila = class Mochila {
  static nueva(reglas) { return new Mochila(); }
  // Resultado: ok(mochila) o error('mochila-invalida'). huecos: [{ material, cantidad }]
  static desdeHuecos(reglas, huecos) { return TN.ok(new Mochila()); }
  // mete lo que quepa; valor: cuánto ha entrado (0 si está llena)
  mete(material, cantidad) { return TN.ok(0); }
  get huecos() { return []; }
  get unidades() { return 0; }
  // { material: cantidad } con todo lo que lleva
  get botin() { return {}; }
};
