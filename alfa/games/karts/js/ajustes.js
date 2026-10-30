// Fans of Karts (prototipo) · AJUSTES: el nombre del juego para core (la partida en la nube), los ajustes que se guardan en este
// navegador (sonido, música, acelerar solo, nivel, giroscopio, cómo se coge el móvil y de qué salen los objetos) y la partida (SAVE), que core sube a la nube con la cuenta (core/js/sistema/cuenta.js).
// Se carga antes de lo común (NUCLEO.juego, en index.html).
'use strict';
const AJUSTES = { id: 'karts', guardado: 'fok-partida', mudo: false, sinMusica: false, autoGas: 'auto', dificultad: 0, giro: false, pantalla: 'auto', envoltorio: 'regalo', calidad: 'hd' };
try { Object.assign(AJUSTES, JSON.parse(localStorage.getItem('fok-ajustes') || '{}')); } catch (_) { /* sin guardar */ }
function guardaAjustes() { try { localStorage.setItem('fok-ajustes', JSON.stringify({ mudo: AJUSTES.mudo, sinMusica: AJUSTES.sinMusica, autoGas: AJUSTES.autoGas, dificultad: AJUSTES.dificultad, giro: AJUSTES.giro, pantalla: AJUSTES.pantalla, envoltorio: AJUSTES.envoltorio, calidad: AJUSTES.calidad })); } catch (_) { /* sin guardar */ } }
// la partida: lo que se guarda con la cuenta (de momento, la canción del menú; el PvP y lo que venga se apunta aquí)
const SAVE = Object.assign({ menuMus: 'menu' }, (() => { try { return JSON.parse(localStorage.getItem(AJUSTES.guardado) || '{}'); } catch (_) { return {}; } })());
function guardaPartida() { try { localStorage.setItem(AJUSTES.guardado, JSON.stringify(SAVE)); } catch (_) { /* sin guardar */ } CUENTA.cambio(); }
// de qué salen los objetos de la pista (Opciones → Objetos): de regalos con lazo o de cápsulas de gashapon. Solo cambia el dibujo.
const envoltorio = () => (AJUSTES.envoltorio === 'gashapon' ? 'gashapon' : 'regalo');
