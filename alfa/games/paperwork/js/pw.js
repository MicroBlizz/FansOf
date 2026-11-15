// Fans Of Paperwork · PW: el único objeto global del juego. Cada archivo cuelga de él sus piezas (PW.AJ, PW.Planta, PW.casos…) en vez de
// soltar variables globales; principal.js las compone al arrancar. Capas (docs/calidad/ARQUITECTURA.md): dominio/ (las reglas, puras:
// sin reloj, sin azar propio, sin guardado ni DOM), aplicacion/ (los casos de uso y el motor), adaptadores/ (pantalla, guardado, reloj,
// sonido) y principal.js (la composición). Diseño: docs/paperwork/PLAN.md y ADR 113.
'use strict';
const PW = {};
// un resultado de dominio: lo que ha salido bien, o un error con nombre (nunca una excepción por una regla incumplida)
PW.ok = valor => ({ ok: true, valor });
PW.error = (error, datos) => ({ ok: false, error, datos });
