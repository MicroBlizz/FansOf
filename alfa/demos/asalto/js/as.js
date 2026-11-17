// Fans of Asalto · AS: el único objeto global del juego. Cada archivo cuelga de él sus piezas (AS.altar, AS.Partida, AS.casos, AS.pinta…)
// en vez de soltar variables globales; principal.js las compone al arrancar. Capas (docs/calidad/ARQUITECTURA.md): dominio/ (las reglas,
// puras: sin reloj, sin azar propio, sin pantalla), aplicacion/ (los casos de uso), adaptadores/ (pantalla, dibujo, luces, sonido y la
// partida guardada) y principal.js (la composición).
'use strict';
const AS = {};
// un resultado de dominio: lo que ha salido bien, o un error con nombre (nunca una excepción por una regla incumplida)
AS.ok = valor => ({ ok: true, valor });
AS.error = (error, datos) => ({ ok: false, error, datos });
