// Fans of Pinball · PB: el único objeto global del juego. Cada archivo cuelga de él sus piezas (PB.Partida, PB.geo, PB.creaBucle…)
// en vez de soltar variables globales. Capas (docs/calidad/ARQUITECTURA.md): dominio/ (las reglas y la física, puras), aplicacion/
// (el bucle), adaptadores/ (pantalla, entrada, sonido, ganchos de prueba) y principal.js (la composición). Se carga el primero de
// todos (antes que los ajustes) para que cada tema de AJUSTES pueda congelarse. Especificación: docs/pinball/PROTOTIPO.md.
'use strict';
const PB = {};
// un resultado de dominio: lo que ha salido bien, o un error con nombre (nunca una excepción por una regla incumplida)
PB.ok = valor => ({ ok: true, valor });
PB.error = (error, datos) => ({ ok: false, error, datos });
// congela un dato y todo lo que lleva dentro (los temas de AJUSTES): quien lo quiera distinto se hace una copia
PB.congela = dato => {
  if (dato && typeof dato === 'object' && !Object.isFrozen(dato)) {
    Object.freeze(dato);
    for (const k of Object.keys(dato)) PB.congela(dato[k]);
  }
  return dato;
};
