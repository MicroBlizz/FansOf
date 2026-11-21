// Fans of Pop · CORAZONES ENTRE AMIGOS, qué se ve en cada caso (dominio; tarea #96, ADR 150): según lo que contesta el servidor, qué aviso
// y qué botones salen al abrir un enlace de corazón, y qué pasa al pulsar RECOGER en el buzón. Funciones puras: devuelven nombres
// (de aviso, de botón, de estado), nunca textos; los textos y el dibujo están en js/pantalla-corazones-enlace.js y js/pantalla-buzon.js.
'use strict';
const PP_CORAZONES_VISTA = Object.freeze((() => {
  // los casos del enlace que traen un aviso propio (puede no lo lleva: solo el botón REGALAR)
  const CON_AVISO = Object.freeze(['propio', 'ya_hoy', 'tope', 'no_existe', 'sin_red', 'servidor', 'sin_sesion', 'cerrado']);
  const nuevaEnPop = mejor => !mejor || typeof mejor !== 'object' || Object.keys(mejor).length === 0;
  // la ventana del enlace para un caso de reglas.caso(): { aviso, regalar, pedir, seguir }; seguir es 'jugar' si quien abre no ha jugado nunca
  function enlace(caso, mejor) {
    return Object.freeze({
      aviso: CON_AVISO.includes(caso) ? caso : null,
      regalar: caso === 'puede',
      pedir: caso === 'propio',
      seguir: nuevaEnPop(mejor) ? 'jugar' : 'volver',
    });
  }
  // el estado del botón del buzón: 'vacio' (nada que recoger), 'lleno' (no cabe nada: no se llama al servidor) o 'recoge'.
  // Cuántos caben lo dice la regla del buzón (reglas = PP_CORAZONES_REGLAS: caben y aRecoger), no se repite aquí.
  function buzon(reglas, pendientes, vidas, max, infinitas) {
    if (typeof pendientes !== 'number' || !(pendientes >= 1)) return 'vacio';
    return reglas.aRecoger(pendientes, vidas, max, infinitas) > 0 ? 'recoge' : 'lleno';
  }
  return { enlace, buzon, nuevaEnPop };
})());
if (typeof module !== 'undefined') module.exports = PP_CORAZONES_VISTA;
