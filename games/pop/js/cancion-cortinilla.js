// Fans of Pop · SINTONÍA DE LA CORTINILLA (ADR 100, tarea #42): la presentación de la cortinilla de los duelos. Suena UNA vez (no es música de combate
// ni va en bucle): dos compases de 8 bits, unos 3 s, que acompañan a la animación; una llamada que sube, el golpe con el «VS» y un remate largo cuando
// sale el botón. Como el resto de la música de la serie es una partitura que toca el motor de core (core/js/serie/canciones.js), no un archivo.
'use strict';
(() => {
  const mk = d => { d.sc = SCALES[d.scale]; d.L = d.lead.seq.map(mseq); d.B = d.bass ? mseq(d.bass.seq) : []; d.A = d.arp ? d.arp.seq.split(' ') : null; return d; };
  Object.assign(TRACKS, {
    popCortinilla: mk({
      bpm: 152, tonic: 57, scale: 'min', prog: [0, 4], once: true, dv: 1, crash: true,
      bass: { wave: 'square', vol: 0.36, lp: 700, seq: 'r . r . r . r . r r . r o - - -' },
      drums: { k: 'x...x...x.x.x...', s: '....x.......x...', h: 'x.x.x.x.x.x.....' },
      lead: { wave: 'square', vol: 0.2, lp: 3600, gate: 0.85, min: 0.06, oct: 7, up: 0, seq: [
        '7 7 . 7 9 . 11 . 14 - - - 11 . 14 .',
        '15 - - . 15 15 . 15 16 . 16 . 18 - - -'] } }),
  });
})();
