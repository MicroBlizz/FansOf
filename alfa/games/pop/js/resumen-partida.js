// Fans of Pop · el resumen de una partida para la ventana «¿QUÉ PARTIDA QUIERES?» de core (core/js/sistema/cuenta.js, tarea 408).
// Pop tiene su propia partida: sin esto la tabla de esa ventana salía vacía y no había forma de saber cuál era cuál.
// Puro: recibe una partida (la de aquí o la de la nube, quizá a medias o de una versión vieja) y da [[texto en español, número], …].
'use strict';
const PP_RESUMEN_PARTIDA = (() => {
  const num = v => (typeof v === 'number' && isFinite(v) ? v : 0);
  // SAVE.mejor: el récord de estrellas por nivel; 'd' delante = difícil y 'p' = pesadilla (js/monedero.js, js/ranking.js)
  function niveles(mejor) {
    let pasados = 0, estrellas = 0;
    for (const k of Object.keys(mejor && typeof mejor === 'object' ? mejor : {})) {
      estrellas += num(mejor[k]);
      if (k[0] !== 'd' && k[0] !== 'p') pasados++;
    }
    return { pasados, estrellas };
  }
  function filas(s) {
    const p = s && typeof s === 'object' ? s : {}, n = niveles(p.mejor);
    return [['Niveles pasados', n.pasados], ['Estrellas de los niveles', n.estrellas], ['Monedas', num(p.monedas)], ['Perlas', num(p.perlas)], ['Corazones', num(p.vidas)]];
  }
  return Object.freeze({ filas });
})();
// el gancho que busca core (cuenta.js): un juego con su propia partida define resumenPartida(s)
function resumenPartida(s) { return PP_RESUMEN_PARTIDA.filas(s); }
