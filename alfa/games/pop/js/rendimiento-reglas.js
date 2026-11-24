// Fans of Pop · RENDIMIENTO, las reglas (dominio puro, tarea #339): qué cuenta como «estar jugando» para medir los fps y qué hacer
// con el medidor de core al cambiar de pantalla o de tablero. Un resumen por nivel, duelo o memoria; fuera de ellos no se mide.
'use strict';
const PP_REND_REGLAS = (() => {
  const PANTALLAS = Object.freeze(['sala', 'duelo', 'memoria']);
  // lo que se está jugando: la pantalla y su tablero (otro tablero es otra partida); null en portada, camino o sin tablero
  const enJuego = (pantalla, tablero) => (PANTALLAS.includes(pantalla) && tablero ? { pantalla, tablero } : null);
  const misma = (a, b) => a.pantalla === b.pantalla && a.tablero === b.tablero;
  // qué hacer al pasar de `antes` a `ahora`: 'sigue', 'empieza', 'para' o 'cambia' (parar el resumen de antes y empezar otro)
  function paso(antes, ahora) {
    if (!antes) return ahora ? 'empieza' : 'sigue';
    if (!ahora) return 'para';
    return misma(antes, ahora) ? 'sigue' : 'cambia';
  }
  return { PANTALLAS, enJuego, paso };
})();
