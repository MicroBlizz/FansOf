// Fans of Rouflage (prototipo) · AJUSTES: el nombre del juego para core (la cuenta, el caos primordial del PvP) y la partida (SAVE) que core sube a la
// nube con la cuenta. De momento la partida solo guarda la canción del menú; el PvP y lo que venga se apunta aquí. Se carga antes de lo común (NUCLEO.juego, en index.html).
// Las cifras de las reglas del juego (tiempos, cartas, linternas…) no son esto: están en REGLAS, al principio de entes.js.
'use strict';
const AJUSTES = { id: 'rouflage', guardado: 'rouflage-partida' };
const SAVE = Object.assign({ menuMus: null }, (() => { try { return JSON.parse(localStorage.getItem(AJUSTES.guardado) || '{}'); } catch (_) { return {}; } })());
function guardaPartida() { try { localStorage.setItem(AJUSTES.guardado, JSON.stringify(SAVE)); } catch (_) { /* sin guardar */ } CUENTA.cambio(); }
// core pregunta si se está jugando (esconde la pestaña de feedback y los avisos): fuera del título y del final
function enPartida() { return typeof J !== 'undefined' && J.fase !== 'titulo' && !J.finMostrado; }
