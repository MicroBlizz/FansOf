// Fans of Pop · ATRÁS, la regla: qué hace el botón atrás del móvil según lo que hay en pantalla (tarea 446, Pepins 27-11-2026; ADR 242).
// Ventana abierta: la pausa (o su «¿Salir del nivel?») sigue jugando, nuestra pregunta de salir se cierra, una con X hace lo de su X
// y una sin X no hace nada (nunca acepta nada por ti). Sin ventana: en un nivel, duelo o Memoria, la pausa de siempre; en el camino,
// a la portada; en la raid, la cierra como su X; en la portada, «¿Salir de Fans of Pop?». Con la presentación de un mundo, la cortinilla de un jefe o el nivel ya
// acabado (ganado o sin toques, mientras llega su ventana), nada.
// Dominio puro: recibe una foto de la pantalla y devuelve el nombre de lo que toca. Lo conecta js/atras.js.
'use strict';
const PP_ATRAS_REGLA = (() => {
  const JUGANDO = new Set(['sala', 'duelo', 'memoria']);
  // e: { pantalla, ventana, pausa, pregunta (nuestra «¿Salir?»), conX, encima (presentación o cortinilla), fin (nivel acabado) }
  function que(e) {
    if (e.ventana) {
      if (e.pregunta) return 'cierra';
      if (e.pausa) return 'sigue';
      return e.conX ? 'x' : 'nada';
    }
    if (e.encima || e.fin) return 'nada';
    if (JUGANDO.has(e.pantalla)) return 'pausa';
    if (e.pantalla === 'mapa') return 'portada';
    if (e.pantalla === 'raid') return 'raid';
    if (e.pantalla === 'titulo') return 'pregunta';
    return 'nada';
  }
  return Object.freeze({ que });
})();
if (typeof module !== 'undefined') module.exports = PP_ATRAS_REGLA;
