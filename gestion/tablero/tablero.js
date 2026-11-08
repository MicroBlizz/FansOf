// Fans Of · /gestion, pestaña TABLERO: el único objeto global del tablero. Cada archivo cuelga de él sus piezas (TABLERO.Tarea, TABLERO.casos…)
// en vez de soltar variables globales; principal.js las compone al abrir la pestaña. Capas (docs/calidad/ARQUITECTURA.md): dominio/ (las reglas,
// puras), aplicacion/ (los casos de uso), adaptadores/ (el servidor y la pantalla) y principal.js (la composición). Guía: docs/gestion/TABLERO.md.
'use strict';
const TABLERO = {};
// un resultado de dominio: lo que ha salido bien, o un error con nombre (nunca una excepción por una regla incumplida)
TABLERO.ok = valor => ({ ok: true, valor });
TABLERO.error = (error, datos) => ({ ok: false, error, datos });
