// Fans Of Pets · PT: el único objeto global del juego. Cada archivo cuelga de él sus piezas (PT.Bebe, PT.casos, PT.pantallas…) en vez de
// soltar variables globales; principal.js las compone al arrancar. Capas (docs/calidad/ARQUITECTURA.md): dominio/ (las reglas, puras),
// aplicacion/ (los casos de uso), adaptadores/ (pantalla, dibujo, partida guardada, reloj, sonido) y principal.js (la composición).
'use strict';
const PT = {};
// un resultado de dominio: lo que ha salido bien, o un error con nombre (nunca una excepción por una regla incumplida)
PT.ok = valor => ({ ok: true, valor });
PT.error = (error, datos) => ({ ok: false, error, datos });
