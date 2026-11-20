// Fans of Toys · TY: el único objeto global del juego. Cada archivo cuelga de él sus piezas (TY.Partida, TY.Mercado, TY.pantallas…) en vez
// de soltar variables globales; principal.js las compone al arrancar. Capas (docs/calidad/ARQUITECTURA.md): datos/ (qué juguetes, mejoras
// y noticias hay), dominio/ (las reglas, puras), aplicacion/ (la sesión y los récords) y adaptadores/ (pantalla, dibujos, sonido, guardado).
// Se carga el primero de todos, antes que los ajustes. Contrato: docs/guia/juegos/toys/README.md.
'use strict';
const TY = {};
// un resultado de dominio: lo que ha salido bien, o un error con nombre (nunca una excepción por una regla incumplida)
TY.ok = valor => ({ ok: true, valor });
TY.error = (error, datos) => ({ ok: false, error, datos });
// congela un dato y todo lo que lleva dentro: quien lo quiera distinto se hace una copia
TY.congela = dato => {
  if (dato && typeof dato === 'object' && !Object.isFrozen(dato)) {
    Object.freeze(dato);
    for (const k of Object.keys(dato)) TY.congela(dato[k]);
  }
  return dato;
};
