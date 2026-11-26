// Fans of Pop · RENDIMIENTO, las reglas (dominio puro, tarea #339): qué cuenta como «estar jugando» para medir los fps y qué hacer
// con el medidor de core al cambiar de pantalla, de tablero o de momento. Un resumen por cada momento de cada nivel, duelo o memoria
// (sin empezar, jugando, victoria, derrota o fin), para ver si la bajada es del tablero o de la pantalla del final; fuera de ellos no se mide.
'use strict';
const PP_REND_REGLAS = (() => {
  const PANTALLAS = Object.freeze(['sala', 'duelo', 'memoria']);
  const FINES = Object.freeze(['gana', 'pierde', 'fin']);
  // el momento de la partida: `fin` ('gana', 'pierde' o 'fin', la memoria, que no se gana ni se pierde) o, sin él, si ya se ha tocado
  const momento = ({ fin, empezado }) => (FINES.includes(fin) ? fin : empezado ? 'juega' : 'espera');
  // lo que se está jugando: la pantalla, su tablero (otro tablero es otra partida) y el momento; null en portada, camino o sin tablero
  const enJuego = (pantalla, tablero, cuando = 'juega') => (PANTALLAS.includes(pantalla) && tablero ? { pantalla, tablero, momento: cuando } : null);
  const misma = (a, b) => a.pantalla === b.pantalla && a.tablero === b.tablero && a.momento === b.momento;
  // qué hacer al pasar de `antes` a `ahora`: 'sigue', 'empieza', 'para' o 'cambia' (parar el resumen de antes y empezar otro)
  function paso(antes, ahora) {
    if (!antes) return ahora ? 'empieza' : 'sigue';
    if (!ahora) return 'para';
    return misma(antes, ahora) ? 'sigue' : 'cambia';
  }
  return { PANTALLAS, FINES, momento, enJuego, paso };
})();
