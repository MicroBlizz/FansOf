// Fans of Island · IS: el único objeto global del juego. Cada archivo cuelga de él sus piezas (IS.ruido, IS.creaNivel, IS.creaFisica…)
// en vez de soltar variables globales. Capas (docs/calidad/ARQUITECTURA.md): dominio/ (el nivel y su física: puras, sin reloj ni
// pantalla). El resto del juego sigue por ahora en globales y se ordena en los pasos siguientes (docs/island/MIGRACION.md).
// Se carga el primero de los del juego, después de ajustes.js.
'use strict';
const IS = {};
// un resultado de dominio: lo que ha salido bien, o un error con nombre (nunca una excepción por una regla incumplida)
IS.ok = valor => ({ ok: true, valor });
IS.error = (error, datos) => ({ ok: false, error, datos });
