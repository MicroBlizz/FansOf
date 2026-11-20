// Fans of Rally · MÚSICA: canciones reaprovechadas de otros juegos del repo (las pidió así Pepins, 20-11-2026), copiadas aquí con otro
// nombre para que Rally no dependa de los archivos de esos juegos. Están escritas como partituras para el motor de la serie
// (core/js/serie/canciones.js explica el formato). De dónde sale cada una:
//   raTitulo   = rfTitulo de Rouflage (games/rouflage/js/musica.js): el menú
//   raDesierto = rfRecta de Rouflage: el tramo del desierto
//   raMontana  = nvMision de Nova (games/nova/js/musica.js): el tramo de montaña
//   raGana / raPierde = win / lose de core, pero al acabar vuelven a raTitulo (los de core vuelven a «menu» y miran SAVE, que aquí no hay)
// El bosque usa «animales» y la contrarreloj «gamer», que ya están en core y no hace falta copiarlas.
'use strict';
(() => {
  const mk = d => { d.sc = SCALES[d.scale]; d.L = d.lead.seq.map(mseq); d.B = d.bass ? mseq(d.bass.seq) : []; d.A = d.arp ? d.arp.seq.split(' ') : null; return d; };
  Object.assign(TRACKS, {
    raTitulo: mk({
      bpm: 104, tonic: 50, scale: 'maj', prog: [0, 5, 3, 4], swing: 0.18, dv: 0.6,
      pad: { wave: 'triangle', vol: 0.26, lp: 1400, att: 0.2 },
      bass: { wave: 'sine', vol: 0.55, seq: 'r . . . f . . . r . . . o . f .' },
      drums: { k: 'x.......x.......', h: '..x...x...x...x.', o: '..............x.' },
      lead: { wave: 'sine', bell: true, vol: 0.34, gate: 0.8, min: 0.5, oct: 7, up: 0, seq: [
        '4 . . 2 . 4 . . 5 . 4 . 2 . . .',
        '2 . . 0 . 2 . . 4 . 2 . 0 . . .',
        '3 . . 1 . 3 . . 5 - - . 3 . . .',
        '4 . 5 . 6 . 5 . 4 - - . . . . .'] } }),
    raDesierto: mk({
      bpm: 122, tonic: 45, scale: 'min', prog: [0, 0, 3, 4], swing: 0.16, dv: 0.85,
      pad: { wave: 'sawtooth', vol: 0.12, lp: 900, att: 0.08 },
      bass: { wave: 'square', vol: 0.4, lp: 650, seq: 'r . r . r . f . o . o . r . f .' },
      drums: { k: 'x...x...x...x...', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' },
      arp: { wave: 'square', vol: 0.06, lp: 2800, oct: 7, gate: 0.3, seq: '0 . 2 . 0 . 2 . 1 . 2 . 3 . 2 .' },
      lead: { wave: 'square', vol: 0.17, gate: 0.5, lp: 2600, oct: 7, up: 0, seq: [
        '4 5 - . . . 4 5 - . . . 0 . 1 .',
        '2 3 - . . . 2 3 - . . . 4 - - .',
        '5 - . 4 . 3 . 2 . 3 . 4 . . . .',
        '0 . . . 1 2 . . 3 - - . 2 . 0 .'] } }),
    raMontana: mk({
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
    raGana: mk({
      bpm: 132, tonic: 48, scale: 'maj', prog: [0, 3, 0], dv: 1, once: true, next: 'raTitulo',
      pad: { wave: 'sawtooth', vol: 0.18, lp: 2500, att: 0.04 },
      bass: { wave: 'triangle', vol: 0.6, seq: 'r . . . . . . . r . . . . . . .' },
      drums: { k: 'x...x...x...x...', s: '..x...x...x.x.xx' },
      lead: { wave: 'square', vol: 0.22, det: 6, lp: 4000, gate: 0.9, oct: 7, up: 0, seq: [
        '0 . 2 . 4 . 7 - - - . . 4 . 7 .',
        '3 . 5 . 7 . 10 - - - . . 7 . 10 .',
        '7 - - - 4 - 7 - 9 - - - 11 - - -'] } }),
    raPierde: mk({
      bpm: 76, tonic: 45, scale: 'min', prog: [0, 0], dv: 1, once: true, next: 'raTitulo',
      pad: { wave: 'sawtooth', vol: 0.18, lp: 600, att: 0.2 },
      bass: { wave: 'triangle', vol: 0.6, oct: 0, seq: 'r - - - - - - - - - - - - - - -' },
      drums: { k: 'x...............' },
      lead: { wave: 'sawtooth', vol: 0.2, lp: 1200, gate: 0.95, oct: 7, up: 0, seq: [
        '4 - - - 3 - - - 2 - - - 1 - - -',
        '0 - - - - - - - - - - - - - - -'] } }),
  });
})();
