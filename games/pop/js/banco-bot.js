// Fans of Pop · PRUEBA DE RENDIMIENTO, el jugador automático (dominio puro, tarea 404): dado el estado de un tablero, qué burbuja toca
// el bot. Sin azar, reloj ni DOM. Lo mueve js/banco-juego.js.
'use strict';
const PP_BANCO_BOT = (() => {
  const levantadas = (e, fila) => {
    const r = [];
    for (let i = 0; i < e.up.length; i++) if (e.mask[i] && e.up[i] && (fila === null || Math.floor(i / e.n) === fila)) r.push(i);
    return r;
  };
  // e = { n, mask, up, sol (los toques que lo resuelven), turnos (duelo o nivel por turnos: una sola fila), fila (la del turno, o null), pierde }
  // · normal: un toque de la solución; `pierde`: uno de fuera, para gastar los toques sin resolver (si no hay, cualquiera).
  // · por turnos: la primera levantada de la fila del turno (o de la primera fila con alguna).
  // Devuelve el índice o -1 si no hay nada que tocar.
  function eligeToque(e) {
    const hay = levantadas(e, e.turnos ? e.fila : null);
    if (!hay.length) return -1;
    if (e.turnos) return hay[0];
    const sol = new Set(e.sol || []);
    if (e.pierde) return hay.find(i => !sol.has(i)) ?? hay[0];
    return hay.find(i => sol.has(i)) ?? hay[0];
  }
  // ¿se puede seguir tocando un nivel normal sin resolverlo? Si solo queda el último toque, hay que volver a entrar
  const sinUltimo = sol => (sol ? sol.length : 0) > 1;
  return Object.freeze({ eligeToque, sinUltimo });
})();
if (typeof module !== 'undefined') module.exports = PP_BANCO_BOT;
