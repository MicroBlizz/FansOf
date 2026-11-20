// Tiny Fans · dominio · NIDO: el agregado del nido propio. La rejilla con sus piezas, el almacén de materiales, las recetas, el tope de
// trampas y la regla del camino. Sabe guardarse y cargarse (su JSON va dentro de la partida). Puro. Dueño: N5 (dominio del nido).
// ARCHIVO-INTERFAZ: lo deja N1 vacío pero cargable; su dueño lo rellena sin cambiar los nombres que expone. Contrato: docs/guia/juegos/tiny/README.md.
'use strict';
TN.Nido = class Nido {
  static nuevo(reglas) { return new Nido(); }
  // Resultado: ok(nido) o error('nido-invalido'). json: lo que dio aJson() (null: un nido nuevo)
  static desdeJson(reglas, json) { return TN.ok(new Nido()); }
  aJson() { return { piezas: [], almacen: {} }; }
  // [{ pieza, col, fila }] y { material: cantidad }, en copia
  get piezas() { return []; }
  get almacen() { return {}; }
  // guardar botín en el almacén ({ material: cantidad }). Resultado: ok(almacen)
  guarda(botin) { return TN.ok({}); }
  // Resultado: ok(eventos) o error('fuera-de-rejilla' | 'casilla-ocupada' | 'pieza-desconocida' | 'sin-materiales' | 'tope-de-trampas' | 'camino-tapiado')
  coloca(pieza, col, fila) { return TN.error('pieza-desconocida'); }
  // Resultado: ok(eventos) o error('fuera-de-rejilla' | 'casilla-vacia' | 'almacen-fijo')
  quita(col, fila) { return TN.error('casilla-vacia'); }
  // Resultado: ok(eventos) o los errores de quitar y de colocar
  mueve(col, fila, aCol, aFila) { return TN.error('casilla-vacia'); }
};
