// Fans of Rouflage (prototipo) · AJUSTES: el nombre del juego para core (la cuenta, el caos primordial del PvP) y la partida (SAVE) que core sube a la
// nube con la cuenta. De momento la partida solo guarda la canción del menú; el PvP y lo que venga se apunta aquí. Se carga antes de lo común (NUCLEO.juego, en index.html).
// Las cifras de las reglas del juego (tiempos, cartas, linternas…) no son esto: están en REGLAS, al principio de entes.js.
'use strict';
const AJUSTES = { id: 'rouflage', guardado: 'rouflage-partida' };
// Las dos monedas de la serie (PLAN-MONEDAS.md, core/js/sistema/monedas.js) con los nombres de aquí: Gotas = la ganada (solo jugando), Acciones = la comprada
// (con euros o cambiando Gotas, 5 por Acción, nunca al revés). La tienda y el armario son propios (tienda.js, armario-precios.js): esto solo da nombres, ratio y saldos a core.
AJUSTES.monedas = {
  ganada: { id: 'gotas', nombre: 'Gotas', nombre_en: 'Drops', icono: () => '' }, comprada: { id: 'acciones', nombre: 'Acciones', nombre_en: 'Shares', icono: () => '' },
  ratio: 5, cambio: 5,   // 5 Gotas = 1 Acción (TIENDA.canje, un pelín mejor en los paquetes grandes); aquí no hay azar pagado, así que el cambio no sale caro a propósito
  leer: cual => (cual === 'comprada' ? SAVE.acciones : SAVE.gotas) || 0,
  escribir: (cual, n) => { SAVE[cual === 'comprada' ? 'acciones' : 'gotas'] = n; guardaPartida(); },
};
const SAVE = Object.assign({ menuMus: null }, (() => { try { return JSON.parse(localStorage.getItem(AJUSTES.guardado) || '{}'); } catch (_) { return {}; } })());
function guardaPartida() { try { localStorage.setItem(AJUSTES.guardado, JSON.stringify(SAVE)); } catch (_) { /* sin guardar */ } CUENTA.cambio(); }
// core pregunta si se está jugando (esconde la pestaña de feedback y los avisos): fuera del título y del final
function enPartida() { return typeof J !== 'undefined' && J.fase !== 'titulo' && !J.finMostrado; }
