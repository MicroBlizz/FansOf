// Fans Of Mining · MN: el único objeto global del juego. Cada archivo cuelga de él sus piezas (MN.AJ, MN.Planta, MN.casos…) en vez de
// soltar variables globales; principal.js las compone al arrancar. Capas (docs/calidad/ARQUITECTURA.md): dominio/ (las reglas, puras:
// sin reloj, sin azar propio, sin guardado ni DOM), aplicacion/ (los casos de uso y el motor), adaptadores/ (pantalla, guardado, reloj,
// sonido) y principal.js (la composición). Diseño: docs/mining/PLAN.md y ADR 113.
'use strict';
const MN = {};
// un resultado de dominio: lo que ha salido bien, o un error con nombre (nunca una excepción por una regla incumplida)
MN.ok = valor => ({ ok: true, valor });
MN.error = (error, datos) => ({ ok: false, error, datos });
