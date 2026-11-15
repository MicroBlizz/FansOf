// Fans Of Sótano · SO: el único objeto global del juego. Cada archivo cuelga de él sus piezas (SO.AJ, SO.Planta, SO.casos…) en vez de
// soltar variables globales; principal.js las compone al arrancar. Capas (docs/calidad/ARQUITECTURA.md): dominio/ (las reglas, puras:
// sin reloj, sin azar propio, sin guardado ni DOM), aplicacion/ (los casos de uso y el motor), adaptadores/ (pantalla, guardado, reloj,
// sonido) y principal.js (la composición). Diseño: docs/sotano/PLAN.md y ADR 113.
'use strict';
const SO = {};
// un resultado de dominio: lo que ha salido bien, o un error con nombre (nunca una excepción por una regla incumplida)
SO.ok = valor => ({ ok: true, valor });
SO.error = (error, datos) => ({ ok: false, error, datos });
