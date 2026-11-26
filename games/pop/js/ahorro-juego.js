// Fans of Pop · lo que baja «Ahorro de batería» (AHORRO de core, ADR 218; tarea #363): la densidad del lienzo (ppAjusta, js/principal.js),
// el fondo sin figuras ni burbujitas flotando (ppPintaFondo, js/pintar.js) y la mitad de las partículas pintadas (ppPintaEfectos).
// Todo en caliente: al cambiarlo, el lienzo se rehace con la densidad nueva y lo demás se mira en cada fotograma.
'use strict';
const PP_AHORRO = (() => {
  const activo = () => typeof AHORRO !== 'undefined' && AHORRO.activo();
  return Object.freeze({
    densidad: dpr => (typeof AHORRO !== 'undefined' ? AHORRO.densidad(dpr) : dpr),
    flotantes: () => !activo(),               // ¿se pintan las figuras y burbujitas que suben por el fondo?
    pasoParticulas: () => (activo() ? 2 : 1), // se pinta una de cada `paso` partículas
  });
})();
