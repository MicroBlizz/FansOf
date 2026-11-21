// Fans of Island · adaptadores/partida: LA PARTIDA (IS.creaPartida): arma la sesión (aplicacion/sesion.js) con el nivel, el azar de verdad,
// los mandos y las pantallas (marcador, final, vibración), el sonido de core y las salpicaduras de la vista (adaptadores/dibujo.js),
// y deja empezar una partida nueva con la cámara y las partículas de la vista al día. Devuelve { sesion, vista, nueva, empieza }.
'use strict';
IS.creaPartida = ({ lienzo, mandos, pantallas }) => {
  const nivel = IS.creaNivel(), fisica = IS.creaFisica(nivel);
  const sesion = IS.creaSesion({
    nivel, fisica, azar: Math.random, mandos: mandos.lee,
    lienzo: { get vw() { return lienzo.vw; }, cH: IS.arte.C_H, bH: IS.arte.B_H },
    puertos: { sonido: IS.fuera.play, marcador: pantallas.marcador, vibra: pantallas.vibra, final: pantallas.final,
      salpica: (x, y, z, n, col) => vista.salpica(x, y, z, n, col) },
  });
  const vista = IS.creaVista(sesion, lienzo);
  return {
    sesion, vista,
    nueva() { sesion.nueva(); vista.reinicia(); },
    empieza() { sesion.empieza(); vista.reinicia(); },
  };
};
