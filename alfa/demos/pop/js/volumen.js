// Fans of Pop · VOLUMEN: cuánto suenan los efectos y la música, cada uno por su lado (dos barras en Opciones y en la pausa).
// Funciones puras sobre la partida guardada (`save.vol` efectos y `save.mus` música, de 0 a 1): sin DOM, sin reloj y sin azar.
// Las lee guardado.js para el motor de sonido de core (volGeneral, volMusica). La música base va a 0,15 con la barra a la mitad.
'use strict';
const PP_VOL = (() => {
  const MUSICA_BASE = 0.3, VOL_DEFECTO = 1, MUS_DEFECTO = 0.5;
  const limita = (v, d) => (typeof v === 'number' && isFinite(v) ? Math.min(1, Math.max(0, v)) : d);
  return {
    VOL_DEFECTO, MUS_DEFECTO,
    general: s => limita(s.vol, VOL_DEFECTO),
    musica: s => MUSICA_BASE * limita(s.mus, MUS_DEFECTO),
    apagado: s => limita(s.vol, VOL_DEFECTO) === 0 && limita(s.mus, MUS_DEFECTO) === 0,
    // las partidas antiguas tenían un solo interruptor (`muted`): silenciado pasa a las dos barras a cero
    migra(s) {
      if (s.muted) { s.vol = 0; s.mus = 0; }
      delete s.muted;
      s.vol = limita(s.vol, VOL_DEFECTO); s.mus = limita(s.mus, MUS_DEFECTO);
      return s;
    },
  };
})();
