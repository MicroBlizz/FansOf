// Fans Of · VOLUMEN: cuánto suenan los efectos y la música, cada uno por su lado (ADR 037). Lo comparten los juegos que guardan dos números en su partida:
// `vol` (efectos) y `mus` (música), de 0 a 1. Funciones puras sobre esa partida: sin DOM, sin reloj y sin azar.
//   VOLUMEN.crear({ musicaBase })  →  { general(s), musica(s), apagado(s), migra(s) }
//     musicaBase: lo que suena la música del juego con la barra a la mitad, multiplicado por dos (cada juego tiene su mezcla)
//     general(s) / musica(s)   lo que piden volGeneral() y volMusica() del motor de sonido (core/js/sistema/sonido.js)
//     apagado(s)               true si las dos barras están a cero (sonidoApagado())
//     migra(s)                 pasa una partida antigua (`muted` y `musica`) a las dos barras y la devuelve
// Las barras de Opciones las pone OPCIONES.sonido (core/js/sistema/opciones-comunes.js). Efectos por defecto 1; música por defecto 0,5.
'use strict';
const VOLUMEN = (() => {
  const VOL_DEFECTO = 1, MUS_DEFECTO = 0.5;
  const limita = (v, d) => (typeof v === 'number' && isFinite(v) ? Math.min(1, Math.max(0, v)) : d);
  function crear({ musicaBase }) {
    return {
      general: s => limita(s.vol, VOL_DEFECTO),
      musica: s => musicaBase * limita(s.mus, MUS_DEFECTO),
      apagado: s => limita(s.vol, VOL_DEFECTO) === 0 && limita(s.mus, MUS_DEFECTO) === 0,
      migra(s) {
        if (s.muted) { s.vol = 0; s.mus = 0; }
        if (s.musica === false) s.mus = 0;
        delete s.muted; delete s.musica;
        s.vol = limita(s.vol, VOL_DEFECTO); s.mus = limita(s.mus, MUS_DEFECTO);
        return s;
      },
    };
  }
  return { crear, VOL_DEFECTO, MUS_DEFECTO };
})();
