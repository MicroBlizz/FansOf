// Fans of Pop · PRUEBA DE RENDIMIENTO, la partida de usar y tirar (tarea 404; adaptador): con ?banco=1&nube=0 cambia la clave de la
// partida de AJUSTES por la de usar y tirar (js/banco-url.js) y la borra, antes de que core cargue la partida (va en `antes`, tras
// js/ajustes.js). Fuera del modo banco no hace nada: la partida real del jugador no se toca nunca.
'use strict';
const PP_BANCO_PARTIDA = (() => {
  const busqueda = location.search;
  AJUSTES.guardado = PP_BANCO_URL.claveGuardado(AJUSTES.guardado, busqueda);
  const borrada = PP_BANCO_URL.borraPartida(busqueda, () => localStorage);
  return Object.freeze({ clave: AJUSTES.guardado, borrada });
})();
