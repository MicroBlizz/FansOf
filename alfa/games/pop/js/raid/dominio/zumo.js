// Fans of Pop · RAID, el «zumo» de reventar (dominio puro, tarea 448, nodo n4): la RACHA de toques seguidos y lo que suena y se ve con ella.
// Una racha = toques buenos con menos de `ventanaMs` entre uno y el siguiente. Estado = { n, t } (cuántos lleva y cuándo fue el último, en ms).
// El reloj entra por parámetro. Nada de PP_CFG ni DOM.
'use strict';
const PP_RAID_ZUMO = (() => {
  const VENTANA_MS = 1400;
  // la escala del plop: cada toque de la racha sube un escalón (pentatónica, dos octavas) y luego se queda arriba
  const ESCALA = Object.freeze([1, 1.125, 1.25, 1.5, 1.667, 2, 2.25, 2.5, 3, 3.333, 4]);
  const HITOS = Object.freeze([5, 10, 20, 30, 50, 75, 100]);
  const nueva = () => Object.freeze({ n: 0, t: -Infinity });

  // un toque bueno a la hora `ahora`: la racha sigue si llega a tiempo; si no, empieza en 1
  function toque(e, ahora, ventanaMs = VENTANA_MS) {
    return Object.freeze({ n: ahora - e.t <= ventanaMs ? e.n + 1 : 1, t: ahora });
  }
  // cuánto lleva la racha AHORA (0 si ya se pasó el tiempo)
  const viva = (e, ahora, ventanaMs = VENTANA_MS) => (ahora - e.t <= ventanaMs ? e.n : 0);
  // lo que le queda de vida, de 1 (recién tocada) a 0 (se acabó): para la barrita del letrero
  const resto = (e, ahora, ventanaMs = VENTANA_MS) => Math.max(0, Math.min(1, 1 - (ahora - e.t) / ventanaMs));
  // la nota del plop del toque número n de la racha (multiplica la frecuencia base)
  const nota = n => ESCALA[Math.min(ESCALA.length - 1, Math.max(0, n - 1))];
  // ¿este número de racha merece fiesta (chat, CEO, letrero grande)?
  const esHito = n => HITOS.includes(n);

  return Object.freeze({ VENTANA_MS, nueva, toque, viva, resto, nota, esHito });
})();
if (typeof module !== 'undefined') module.exports = PP_RAID_ZUMO;
