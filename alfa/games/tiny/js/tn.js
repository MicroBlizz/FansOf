// Tiny Fans · TN: el único objeto global del juego. Cada archivo cuelga de él sus piezas (TN.Expedicion, TN.pantallas, TN.vista…) en vez de
// soltar variables globales; principal.js las compone al arrancar. Capas (docs/calidad/ARQUITECTURA.md): dominio/ (las reglas, puras),
// aplicacion/ (los casos de uso), adaptadores/ (pantalla, 3D, sonido, partida guardada, reloj) y principal.js (la composición).
// Se carga el primero de todos (antes que los ajustes) para que cada tema de AJUSTES pueda congelarse. Contrato: docs/guia/juegos/tiny/README.md.
'use strict';
const TN = {};
// un resultado de dominio: lo que ha salido bien, o un error con nombre (nunca una excepción por una regla incumplida)
TN.ok = valor => ({ ok: true, valor });
TN.error = (error, datos) => ({ ok: false, error, datos });
// congela un dato y todo lo que lleva dentro (los temas de AJUSTES): quien lo quiera distinto se hace una copia
TN.congela = dato => {
  if (dato && typeof dato === 'object' && !Object.isFrozen(dato)) {
    Object.freeze(dato);
    for (const k of Object.keys(dato)) TN.congela(dato[k]);
  }
  return dato;
};
