// Fans of Rouflage · MÚSICA DE LOS MAPAS: los temas de taller, caza y recta final de cada mapa (el parking, las cloacas, los jardines,
// la urbanización y el hotel; los de la estación y las Backrooms están en musica.js). Mismo formato que core/js/serie/canciones.js y el
// mismo espíritu de dibujos animados: cada mapa con su instrumento y su chiste. Cada mapa los pide en su `musica: { taller, caza, recta }`.
'use strict';
(() => {
  // dos escalas más, solo para estos temas: dórica (la de las comedias de vecinos) y mixolidia (la del country)
  Object.assign(SCALES, { dor: [0, 2, 3, 5, 7, 9, 10], mix: [0, 2, 4, 5, 7, 9, 10] });
  const mk = d => { d.sc = SCALES[d.scale]; d.L = d.lead.seq.map(mseq); d.B = d.bass ? mseq(d.bass.seq) : []; d.A = d.arp ? d.arp.seq.split(' ') : null; return d; };
  Object.assign(TRACKS, {
    /* ---------- EL PARKING: serie de policías de los setenta, bajo con wah y teclado funky ---------- */
    rfPkTaller: mk({
      bpm: 96, tonic: 45, scale: 'dor', prog: [0, 3, 0, 3], swing: 0.12, dv: 0.6,
      pad: { wave: 'triangle', vol: 0.18, lp: 900, att: 0.3 },
      bass: { wave: 'sawtooth', vol: 0.36, lp: 500, seq: 'r . . r . . . . r . o . . . f .' },
      drums: { k: 'x.......x.......', h: '..x...x...x...x.' },
      lead: { wave: 'sine', bell: true, vol: 0.28, gate: 1, min: 0.5, oct: 7, up: 0, seq: [
        '4 . . . . . 2 . . . 4 . . . . .',
        '5 . . . . . 4 . . . 2 . . . . .',
        '4 . . . . . 6 . . . 5 . . . 4 .',
        '2 . . . . . . . 0 . . . . . . .'] } }),
    rfPkCaza: mk({
      bpm: 104, tonic: 43, scale: 'dor', prog: [0, 0, 3, 4], swing: 0.16, dv: 0.75,
      pad: { wave: 'sawtooth', vol: 0.1, lp: 700, att: 0.2 },
      bass: { wave: 'sawtooth', vol: 0.42, lp: 600, seq: 'r . . r . r . . r . . o . r f .' },
      drums: { k: 'x.....x...x.....', s: '....x.......x...', h: 'x.xxx.x.x.xxx.x.' },
      arp: { wave: 'square', vol: 0.05, lp: 2200, oct: 7, gate: 0.25, seq: '. . 0 . . 1 . . . . 2 . . 1 . .' },
      lead: { wave: 'square', vol: 0.15, gate: 0.4, lp: 1800, oct: 7, up: 0, seq: [
        '0 . . 2 . . 3 . 4 . . . 3 2 . .',
        '0 . . 2 . . 3 . 6 . 5 . 4 . . .',
        '7 . . 6 . . 4 . 3 . . . 2 . 0 .',
        '4 . 4 . 3 . 2 . 0 - - . . . . .'] } }),
    rfPkRecta: mk({
      bpm: 132, tonic: 43, scale: 'dor', prog: [0, 0, 3, 4], swing: 0.08, dv: 0.9, crash: true,
      pad: { wave: 'sawtooth', vol: 0.12, lp: 900, att: 0.05 },
      bass: { wave: 'sawtooth', vol: 0.44, lp: 700, seq: 'r . r r . r . r r . o . r . f .' },
      drums: { k: 'x...x...x...x...', s: '....x.......x.xx', h: 'x.x.x.x.x.x.x.x.' },
      arp: { wave: 'square', vol: 0.06, lp: 2600, oct: 7, gate: 0.25, seq: '0 . 1 . 2 . 1 . 0 . 1 . 2 . 3 .' },
      lead: { wave: 'square', vol: 0.16, gate: 0.4, lp: 2400, oct: 7, up: 0, seq: [
        '0 . . 2 . . 3 . 4 . . . 3 2 . .',
        '0 . . 2 . . 3 . 6 . 5 . 4 . . .',
        '7 . . 6 . . 4 . 3 . . . 2 . 0 .',
        '4 . 4 . 3 . 2 . 0 - - . . . . .'] } }),

    /* ---------- LAS CLOACAS: una tuba que chapotea, gotas y un poco de niebla ---------- */
    rfClTaller: mk({
      bpm: 80, tonic: 43, scale: 'phr', prog: [0, 0, 1, 0], dv: 0.5,
      pad: { wave: 'triangle', vol: 0.26, lp: 600, att: 0.8 },
      bass: { wave: 'sine', vol: 0.55, seq: 'r . . . . . . . r . . . . . . .' },
      drums: { o: '......x.........', h: '..........x.....' },
      lead: { wave: 'sine', bell: true, vol: 0.26, gate: 0.6, min: 0.4, oct: 14, up: 0, seq: [
        '4 . . . . . . . . . 2 . . . . .',
        '. . . . 3 . . . . . . . 1 . . .',
        '4 . . . . . 5 . . . . . . . . .',
        '. . 2 . . . . . 0 . . . . . . .'] } }),
    rfClCaza: mk({
      bpm: 92, tonic: 43, scale: 'phr', prog: [0, 0, 1, 5], swing: 0.24, dv: 0.6,
      pad: { wave: 'triangle', vol: 0.14, lp: 600, att: 0.4 },
      bass: { wave: 'triangle', vol: 0.56, lp: 600, seq: 'r . . . f . . . r . . . o . . .' },
      drums: { k: 'x.......x.......', h: '..x...x...x...x.', t: '..............x.' },
      lead: { wave: 'square', vol: 0.18, gate: 0.6, lp: 700, oct: 0, up: 0, att: 0.03, seq: [
        '7 . . 8 7 . . . 4 . . . 5 . 4 .',
        '7 . . 8 7 . . . 9 - - . 8 . 7 .',
        '4 . 5 . 4 . 3 . 1 . . . 0 . 1 .',
        '0 . . . 4 . . . 7 - - - . . . .'] } }),
    rfClRecta: mk({
      bpm: 120, tonic: 43, scale: 'phr', prog: [0, 0, 1, 5], swing: 0.14, dv: 0.85,
      pad: { wave: 'sawtooth', vol: 0.1, lp: 700, att: 0.08 },
      bass: { wave: 'square', vol: 0.4, lp: 500, seq: 'r . r . f . r . r . r . o . f .' },
      drums: { k: 'x...x...x...x...', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' },
      lead: { wave: 'square', vol: 0.18, gate: 0.5, lp: 900, oct: 0, up: 7, att: 0.02, seq: [
        '7 . . 8 7 . . . 4 . . . 5 . 4 .',
        '7 . . 8 7 . . . 9 - - . 8 . 7 .',
        '4 . 5 . 4 . 3 . 1 . . . 0 . 1 .',
        '0 . . . 4 . . . 7 - - - . . . .'] } }),

    /* ---------- LOS JARDINES: flauta y pájaros de noche; la caza, un gnomo de jardín de puntillas ---------- */
    rfJdTaller: mk({
      bpm: 100, tonic: 55, scale: 'maj', prog: [0, 3, 4, 0], swing: 0.1, dv: 0.5,
      pad: { wave: 'triangle', vol: 0.22, lp: 1600, att: 0.4 },
      bass: { wave: 'triangle', vol: 0.45, seq: 'r . . . . . f . r . . . . . f .' },
      drums: { h: '..x.......x.....' },
      arp: { wave: 'sine', vol: 0.08, oct: 7, gate: 0.4, seq: '0 . 2 . 1 . 2 . 0 . 2 . 1 . 3 .' },
      lead: { wave: 'triangle', vol: 0.24, gate: 0.85, lp: 3600, oct: 7, up: 0, att: 0.04, seq: [
        '4 . . 5 4 . 2 . 4 - - . . . . .',
        '3 . . 4 3 . 1 . 3 - - . . . . .',
        '4 . 5 . 7 . 8 . 7 - - . 5 . 4 .',
        '2 . 4 . 0 - - . 9 8 9 . . . . .'] } }),
    rfJdCaza: mk({
      bpm: 108, tonic: 50, scale: 'maj', prog: [0, 4, 3, 4], swing: 0.22, dv: 0.6,
      pad: { wave: 'triangle', vol: 0.12, lp: 1200, att: 0.2 },
      bass: { wave: 'triangle', vol: 0.55, seq: 'r . . . f . . . r . . . f . o .' },
      drums: { h: 'x...x...x...x...', s: '............x...', o: '..............x.' },
      lead: { wave: 'sine', vol: 0.24, gate: 0.4, oct: 7, up: 0, att: 0.004, seq: [
        '0 . 4 . 7 . . . 6 . 4 . . . . .',
        '1 . 4 . 6 . . . 5 . 4 . . . . .',
        '7 . 6 . 5 . 4 . 3 . 2 . . . . .',
        '4 . . 3 . . 2 . . 1 . . 0 . . .'] } }),
    rfJdRecta: mk({
      bpm: 138, tonic: 50, scale: 'mix', prog: [0, 6, 3, 0], dv: 0.9,
      pad: { wave: 'triangle', vol: 0.12, lp: 1600, att: 0.04 },
      bass: { wave: 'triangle', vol: 0.55, seq: 'r . f . r . f . r . f . r . o .' },
      drums: { k: 'x...x...x...x...', s: '..x...x...x...x.', h: 'xxxxxxxxxxxxxxxx' },
      arp: { wave: 'square', vol: 0.05, lp: 2800, oct: 7, gate: 0.25, seq: '0 1 2 1 0 1 2 1 0 1 2 1 0 1 2 3' },
      lead: { wave: 'triangle', vol: 0.24, gate: 0.6, lp: 3800, oct: 7, up: 0, seq: [
        '0 . 2 . 4 . 2 . 4 . 5 . 4 . 2 .',
        '6 . 5 . 4 . 2 . 0 . 2 . 4 - - .',
        '3 . 4 . 5 . 6 . 7 . 6 . 5 . 4 .',
        '4 . 2 . 0 . 2 . 0 - - . . . . .'] } }),

    /* ---------- LA URBANIZACIÓN: sintonía de comedia de vecinos; la caza, el vecino cotilla espiando tras la cortina ---------- */
    rfRsTaller: mk({
      bpm: 112, tonic: 53, scale: 'maj', prog: [0, 5, 1, 4], seven: true, swing: 0.14, dv: 0.6,
      pad: { wave: 'triangle', vol: 0.24, lp: 1600, att: 0.1 },
      bass: { wave: 'sine', vol: 0.55, seq: 'r . . . f . . . r . . . f . o .' },
      drums: { k: 'x.......x.......', s: '....x.......x...', h: '..x...x...x...x.' },
      lead: { wave: 'sine', vol: 0.26, gate: 0.6, oct: 7, up: 0, att: 0.02, seq: [
        '4 . 5 . 6 - - . 4 . . . 2 . . .',
        '5 . 4 . 2 - - . 0 . . . 2 . . .',
        '3 . 4 . 5 - - . 3 . 1 . 3 . . .',
        '4 . . . 2 . . . 4 . 5 . 7 - - .'] } }),
    rfRsCaza: mk({
      bpm: 98, tonic: 50, scale: 'dor', prog: [0, 3, 0, 4], swing: 0.24, dv: 0.55,
      pad: { wave: 'triangle', vol: 0.14, lp: 900, att: 0.3 },
      bass: { wave: 'triangle', vol: 0.6, lp: 700, seq: 'r . o . r . o . r . o . f . o .' },
      drums: { h: 'x.x.x.x.x.x.x.x.', s: '....x.......x...' },
      lead: { wave: 'sine', bell: true, vol: 0.26, gate: 0.5, min: 0.25, oct: 7, up: 0, seq: [
        '0 . . . 2 . . 3 . . 2 . . . . .',
        '0 . . . 2 . . 3 . . 4 . . . . .',
        '5 . . 4 . . 3 . . 2 . . 1 . . .',
        '2 . 2 . . . 0 . . . . . . . . .'] } }),
    rfRsRecta: mk({
      bpm: 128, tonic: 50, scale: 'dor', prog: [0, 3, 0, 4], swing: 0.12, dv: 0.85,
      pad: { wave: 'square', vol: 0.1, lp: 1200, att: 0.05 },
      bass: { wave: 'square', vol: 0.38, lp: 650, seq: 'r . o . r . o . r . o . f . o .' },
      drums: { k: 'x...x...x...x...', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' },
      lead: { wave: 'square', vol: 0.16, gate: 0.5, lp: 2600, oct: 7, up: 0, seq: [
        '0 . . . 2 . . 3 . . 2 . . . . .',
        '0 . . . 2 . . 3 . . 4 . . . . .',
        '5 . . 4 . . 3 . . 2 . . 1 . . .',
        '2 . 2 . . . 0 . . . . . . . . .'] } }),

    /* ---------- EL HOTEL: música de ascensor de lujo; la caza, un jazz de puntillas por el pasillo con el carrito de la limpieza ---------- */
    rfHtTaller: mk({
      bpm: 88, tonic: 51, scale: 'maj', prog: [0, 5, 1, 4], seven: true, swing: 0.16, dv: 0.45,
      pad: { wave: 'sine', vol: 0.3, lp: 1400, att: 0.5 },
      bass: { wave: 'sine', vol: 0.5, seq: 'r . . . . . f . r . . . o . . .' },
      drums: { h: '..x...x...x...x.', o: '..............x.' },
      arp: { wave: 'sine', vol: 0.07, oct: 7, gate: 0.6, seq: '0 . 1 . 2 . 3 . 2 . 1 . 0 . . .' },
      lead: { wave: 'sine', bell: true, vol: 0.3, gate: 1, min: 0.8, oct: 7, up: 0, seq: [
        '6 . . . 4 . . . 2 . . . 4 . . .',
        '5 . . . 3 . . . 1 . . . . . . .',
        '3 . . . 5 . . . 7 . . . 6 . . .',
        '4 . . . 6 . 5 . 4 - - . . . . .'] } }),
    rfHtCaza: mk({
      bpm: 100, tonic: 46, scale: 'dor', prog: [0, 3, 1, 4], seven: true, swing: 0.3, dv: 0.5,
      pad: { wave: 'triangle', vol: 0.2, lp: 1100, att: 0.2 },
      bass: { wave: 'triangle', vol: 0.6, seq: 'r . f . o . f . r . f . o . r .' },
      drums: { h: 'x.x.x.x.x.x.x.x.', o: '......x.......x.' },
      lead: { wave: 'sine', bell: true, vol: 0.27, gate: 0.6, min: 0.3, oct: 7, up: 0, seq: [
        '4 . . 3 . . 2 . . . 0 . . . . .',
        '3 . . 2 . . 1 . . . 3 - - . . .',
        '4 . 5 . 6 . 7 . 6 . 4 . . . . .',
        '2 . . 1 . . 0 . . . . . . . . .'] } }),
    rfHtRecta: mk({
      bpm: 132, tonic: 46, scale: 'dor', prog: [0, 3, 1, 4], seven: true, swing: 0.2, dv: 0.85,
      pad: { wave: 'triangle', vol: 0.16, lp: 1400, att: 0.05 },
      bass: { wave: 'triangle', vol: 0.62, seq: 'r . f . o . f . r . f . o . r .' },
      drums: { k: 'x.......x.......', s: '....x.......x.xx', h: 'x.x.x.x.x.x.x.x.' },
      lead: { wave: 'square', vol: 0.15, gate: 0.5, lp: 2600, oct: 7, up: 0, seq: [
        '4 . . 3 . . 2 . . . 0 . . . . .',
        '3 . . 2 . . 1 . . . 3 - - . . .',
        '4 . 5 . 6 . 7 . 6 . 4 . . . . .',
        '2 . . 1 . . 0 . . . . . . . . .'] } }),
  });
  // PARA COMPARAR (temporal): con el sonido antiguo, estos temas también se cambian por los de antes
  for (const k of ['Pk', 'Cl', 'Jd', 'Rs', 'Ht']) Object.assign(MUSICA_VIEJA, { ['rf' + k + 'Taller']: 'menu', ['rf' + k + 'Caza']: 'boss0', ['rf' + k + 'Recta']: 'boss0' });
})();
