// Fans of Nova · MÚSICA PROPIA: las canciones del juego, escritas como partituras para el motor de la serie (core/js/serie/canciones.js
// explica el formato: 16 pasos por compás, grados de la escala, «-» alarga, «.» calla). Espacio de neón: sintetizadores, campanas lejanas
// y mucho bajo. Todo se crea con código, sin archivos de sonido. Los finales (nvVictoria, nvDerrota) suenan una vez y vuelve nvMenu.
'use strict';
(() => {
  const mk = d => { d.sc = SCALES[d.scale]; d.L = d.lead.seq.map(mseq); d.B = d.bass ? mseq(d.bass.seq) : []; d.A = d.arp ? d.arp.seq.split(' ') : null; return d; };
  Object.assign(TRACKS, {
    // GALAXIA / MENÚS: flotando entre estrellas, campanas y un latido lento
    nvMenu: mk({
      bpm: 86, tonic: 45, scale: 'min', prog: [0, 5, 3, 4], dv: 0.5,
      pad: { wave: 'sawtooth', vol: 0.2, lp: 900, att: 0.6 },
      bass: { wave: 'sine', vol: 0.55, seq: 'r - - - - - - - o . . . f . . .' },
      drums: { k: 'x.......x.......', h: '..x...x...x...x.' },
      arp: { wave: 'sine', vol: 0.07, lp: 2600, oct: 14, gate: 0.6, seq: '0 . 1 . 2 . 1 . 0 . 1 . 3 . 2 .' },
      lead: { wave: 'sine', bell: true, vol: 0.3, gate: 1.4, min: 1.0, oct: 7, up: 0, seq: [
        '4 . . . 2 . . . 0 . . . 2 . 4 .',
        '5 . . . 4 . . . 2 . . . 4 . . .',
        '3 . . . 5 . . . 4 . . . 2 . 0 .',
        '2 . . . 4 . . . 6 . . . 4 - . .'] } }),
    // MISIÓN: el combate, ritmo constante y arpegio de nave en marcha
    nvMision: mk({
      bpm: 122, tonic: 43, scale: 'min', prog: [0, 0, 5, 3, 0, 0, 6, 4], dv: 0.9,
      pad: { wave: 'sawtooth', vol: 0.14, lp: 1100, att: 0.08 },
      bass: { wave: 'sawtooth', vol: 0.5, lp: 650, oct: 0, seq: 'r . r r . r . r r . r r . r o .' },
      drums: { k: 'x...x...x...x...', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' },
      arp: { wave: 'square', vol: 0.07, lp: 3000, oct: 7, gate: 0.4, seq: '0 1 2 1 0 1 2 3 0 1 2 1 2 3 2 3' },
      lead: { wave: 'sawtooth', vol: 0.17, det: 8, lp: 2600, gate: 0.8, oct: 7, up: 7, seq: [
        '4 . . 2 . 4 . 5 . . 4 - . 2 . .',
        '5 . . 4 . 2 . 4 . . 2 - . 0 . .',
        '4 . . 5 . 7 . 5 . . 4 - . 2 . .',
        '3 . 4 . 2 . 4 . 0 - - . . . . .'] } }),
    // JEFE: más rápido y más oscuro, escala frigia y bombo doble
    nvJefe: mk({
      bpm: 146, tonic: 40, scale: 'phr', prog: [0, 1, 0, 6], dv: 1, crash: true,
      pad: { wave: 'sawtooth', vol: 0.18, lp: 800, att: 0.1 },
      bass: { wave: 'sawtooth', vol: 0.5, lp: 700, oct: 0, seq: 'r r . r r . r r . r r . r . r r' },
      drums: { k: 'x.x.x.x.x.xxx.x.', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' },
      arp: { wave: 'triangle', vol: 0.08, lp: 3000, oct: 14, gate: 0.4, seq: '3 2 1 0 3 2 1 0 3 2 1 0 2 1 0 1' },
      lead: { wave: 'sawtooth', vol: 0.2, det: 12, lp: 2800, gate: 0.85, oct: 14, up: 0, seq: [
        '0 . 0 . 1 - 0 . . . 3 - 1 . 0 .',
        '1 . 1 . 2 - 1 . . . 4 - 2 . 1 .',
        '0 . 0 . 1 - 0 . . . 5 - 3 . 1 .',
        '6 . 6 . 5 - 6 . . . 4 - 3 - 2 .'] } }),
    // ESTACIÓN: respiro entre misiones, tienda de ascensor espacial
    nvEstacion: mk({
      bpm: 96, tonic: 48, scale: 'maj', prog: [0, 3, 4, 0], seven: true, swing: 0.1, dv: 0.5,
      pad: { wave: 'triangle', vol: 0.3, lp: 1500, att: 0.3 },
      bass: { wave: 'sine', vol: 0.5, seq: 'r . . . . . f . . . r . . . f .' },
      drums: { k: 'x.......x.......', h: '..x...x...x...x.' },
      lead: { wave: 'sine', bell: true, vol: 0.32, gate: 0.9, min: 0.8, oct: 7, up: 0, seq: [
        '4 . . . 2 . 4 . 6 . . . 4 . . .',
        '5 . . . 4 . 2 . 4 . . . 2 . . .',
        '3 . . . 4 . 5 . 4 . 3 . 1 . . .',
        '4 . . . 6 . 5 . 3 . . . 4 . . .'] } }),
    // FINALES: suenan una vez y vuelve el menú
    nvVictoria: mk({
      bpm: 128, tonic: 48, scale: 'maj', prog: [0, 3, 0], dv: 1, once: true, next: 'nvMenu',
      pad: { wave: 'sawtooth', vol: 0.18, lp: 2500, att: 0.04 },
      bass: { wave: 'triangle', vol: 0.6, seq: 'r . . . . . . . r . . . . . . .' },
      drums: { k: 'x...x...x...x...', s: '..x...x...x.x.xx' },
      lead: { wave: 'square', vol: 0.2, det: 6, lp: 4000, gate: 0.9, oct: 7, up: 0, seq: [
        '0 . 2 . 4 . 7 - - - . . 4 . 7 .',
        '3 . 5 . 7 . 10 - - - . . 7 . 10 .',
        '7 - - - 4 - 7 - 9 - - - 11 - - -'] } }),
    nvDerrota: mk({
      bpm: 72, tonic: 45, scale: 'min', prog: [0, 0], dv: 1, once: true, next: 'nvMenu',
      pad: { wave: 'sawtooth', vol: 0.18, lp: 600, att: 0.2 },
      bass: { wave: 'triangle', vol: 0.6, oct: 0, seq: 'r - - - - - - - - - - - - - - -' },
      drums: { k: 'x...............' },
      lead: { wave: 'sawtooth', vol: 0.18, lp: 1200, gate: 0.95, oct: 7, up: 0, seq: [
        '4 - - - 3 - - - 2 - - - 1 - - -',
        '0 - - - - - - - - - - - - - - -'] } }),
  });
})();
