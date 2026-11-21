// Fans of Island · IS: el único objeto global del juego (aparte de AJUSTES y de lo que core pide por su nombre: SAVE y los cuatro ganchos
// del sonido, en adaptadores/guardado.js). Cada archivo cuelga de él sus piezas (IS.ruido, IS.creaNivel, IS.creaSesion, IS.creaVista…)
// y guarda lo suyo dentro de un bloque { }, sin soltar variables globales. Capas (docs/calidad/ARQUITECTURA.md): dominio/ (reglas puras,
// sin reloj ni pantalla), aplicacion/ (la sesión) y adaptadores/ (pantalla, mandos, arte, dibujo, guardado, arranque). Detalle en
// docs/guia/juegos/island/README.md. Se carga el primero de los del juego, después de ajustes.js.
'use strict';
const IS = {};
// un resultado de dominio: lo que ha salido bien, o un error con nombre (nunca una excepción por una regla incumplida)
IS.ok = valor => ({ ok: true, valor });
IS.error = (error, datos) => ({ ok: false, error, datos });
IS.arte = {};   // las piezas dibujadas (adaptadores/arte-*.js): PIEZA, PILAS_C, PILAS_B, PILAS_OLA, NUBE…
