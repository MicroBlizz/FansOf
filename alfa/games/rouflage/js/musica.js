// Fans of Rouflage · MÚSICA PROPIA: las canciones del juego, escritas como partituras para el motor de la serie (core/js/serie/canciones.js
// explica el formato: 16 pasos por compás, grados de la escala, «-» alarga, «.» calla). Estilo de dibujos animados: un escondite de
// puntillas, cómico, nada de terror. Todo se crea con código, sin archivos de sonido.
'use strict';
(() => {
  const mk = d => { d.sc = SCALES[d.scale]; d.L = d.lead.seq.map(mseq); d.B = d.bass ? mseq(d.bass.seq) : []; d.A = d.arp ? d.arp.seq.split(' ') : null; return d; };
  Object.assign(TRACKS, {
    // TÍTULO: vibráfono con swing, el cartel de un dibujo animado de detectives torpes
    rfTitulo: mk({
      bpm: 104, tonic: 50, scale: 'maj', prog: [0, 5, 3, 4], swing: 0.18, dv: 0.6,
      pad: { wave: 'triangle', vol: 0.26, lp: 1400, att: 0.2 },
      bass: { wave: 'sine', vol: 0.55, seq: 'r . . . f . . . r . . . o . f .' },
      drums: { k: 'x.......x.......', h: '..x...x...x...x.', o: '..............x.' },
      lead: { wave: 'sine', bell: true, vol: 0.34, gate: 0.8, min: 0.5, oct: 7, up: 0, seq: [
        '4 . . 2 . 4 . . 5 . 4 . 2 . . .',
        '2 . . 0 . 2 . . 4 . 2 . 0 . . .',
        '3 . . 1 . 3 . . 5 - - . 3 . . .',
        '4 . 5 . 6 . 5 . 4 - - . . . . .'] } }),
    // TALLER (pintarse): ukelele alegre, pinceladas rápidas y despreocupadas
    rfTaller: mk({
      bpm: 118, tonic: 52, scale: 'maj', prog: [0, 3, 4, 0], dv: 0.7,
      pad: { wave: 'triangle', vol: 0.18, lp: 1800, att: 0.05 },
      bass: { wave: 'triangle', vol: 0.5, seq: 'r . . . r . o . f . . . f . o .' },
      drums: { k: 'x.......x.......', h: 'x.x.x.x.x.x.x.x.', o: '......x.......x.' },
      arp: { wave: 'square', vol: 0.06, lp: 2600, oct: 7, gate: 0.35, seq: '0 . 1 2 . 1 2 3 0 . 1 2 . 3 2 1' },
      lead: { wave: 'triangle', vol: 0.24, gate: 0.55, lp: 3200, oct: 7, up: 0, seq: [
        '4 . 4 . 5 . 4 . 2 - - . 0 . 2 .',
        '3 . 3 . 4 . 3 . 1 - - . 0 . . .',
        '4 . 5 . 7 - - . 5 . 4 . 2 . 4 .',
        '2 . 1 . 0 - - . . . 2 . 4 . . .'] } }),
    // CAZA: de puntillas tras el cazador (pizzicato, bajo que anda, escobillas), con cara de no haber roto un plato
    rfCaza: mk({
      bpm: 96, tonic: 45, scale: 'min', prog: [0, 0, 3, 4], swing: 0.26, dv: 0.55,
      pad: { wave: 'triangle', vol: 0.14, lp: 900, att: 0.3 },
      bass: { wave: 'triangle', vol: 0.62, lp: 700, seq: 'r . . r . . f . o . . o . . f .' },
      drums: { h: 'x.x.x.x.x.x.x.x.', s: '............x...', o: '......x.........' },
      lead: { wave: 'sine', vol: 0.26, gate: 0.45, oct: 7, up: 0, att: 0.004, seq: [
        '4 5 - . . . 4 5 - . . . 0 . 1 .',
        '2 3 - . . . 2 3 - . . . 4 - - .',
        '5 - . 4 . 3 . 2 . 3 . 4 . . . .',
        '0 . . . 1 2 . . 3 - - . 2 . 0 .'] } }),
    // RECTA FINAL: la misma persecución, pero ya corriendo (bombo, bajo cuadrado y más prisa)
    rfRecta: mk({
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
    // VICTORIA: fanfarria corta de dibujos animados; luego vuelve el título
    rfWin: mk({
      bpm: 132, tonic: 50, scale: 'maj', prog: [0, 3, 0], dv: 0.9, once: true, next: 'rfTitulo',
      pad: { wave: 'triangle', vol: 0.3, lp: 1800, att: 0.03 },
      bass: { wave: 'triangle', vol: 0.6, seq: 'r . . . r . . . f . . . r . . .' },
      drums: { k: 'x...x...x...x...', c: 'x.......x.......', h: '..x...x...x...x.' },
      lead: { wave: 'sine', bell: true, vol: 0.36, gate: 0.9, min: 0.3, oct: 7, up: 0, seq: [
        '0 . 2 . 4 . 7 - - . 4 . 7 - - .',
        '5 . 4 . 2 . 5 - - . 4 . 2 . . .',
        '0 . 4 . 7 - - - - - - - - - - -'] } }),
    // LAS BACKROOMS · TALLER: escala de tonos enteros (la de los sueños en los dibujos animados), un piano de juguete que gotea en pasillos vacíos
    rfBkTaller: mk({
      bpm: 86, tonic: 52, scale: 'wt', prog: [0, 0, 1, 0], dv: 0.5,
      pad: { wave: 'triangle', vol: 0.3, lp: 900, att: 0.8 },
      bass: { wave: 'sine', vol: 0.5, seq: 'r . . . . . . . r . . . . . f .' },
      drums: { h: 'x.......x.......', o: '............x...' },
      lead: { wave: 'sine', bell: true, vol: 0.3, gate: 1.2, min: 0.7, oct: 6, up: 0, seq: [
        '0 . . . 2 . . . 4 . . . 2 . . .',
        '3 . . . 1 . . . . . . . 5 . . .',
        '4 . . 2 . . 0 . . . 3 . . . . .',
        '1 . . . . . 2 . . . . . 0 . . .'] } }),
    // LAS BACKROOMS · CAZA: un órgano desafinado que anda de puntillas por pasillos que se repiten; inquietante pero de dibujos animados
    rfBkCaza: mk({
      bpm: 100, tonic: 43, scale: 'hmin', prog: [0, 0, 3, 5], swing: 0.22, dv: 0.5,
      pad: { wave: 'sawtooth', vol: 0.12, lp: 600, att: 0.5 },
      bass: { wave: 'square', vol: 0.4, lp: 480, seq: 'r . . r . . o . r . . r . . f .' },
      drums: { h: 'x.x.x.x.x.x.x.x.', t: '......x.........', s: '............x...' },
      lead: { wave: 'sawtooth', vol: 0.15, det: 18, lp: 1500, gate: 0.5, oct: 7, up: 0, att: 0.02, seq: [
        '0 . 1 . 0 . -1 . 0 - - . . . 3 2',
        '1 . 2 . 1 . 0 . -1 - - . . . . .',
        '3 . 4 . 3 . 2 . 1 . 0 . -1 . 0 .',
        '0 . . . 7 - - . 6 . 5 . 4 . 3 .'] } }),
    // LAS BACKROOMS · RECTA FINAL: el mismo órgano, pero corriendo por los pasillos
    rfBkRecta: mk({
      bpm: 126, tonic: 43, scale: 'hmin', prog: [0, 0, 3, 5], swing: 0.14, dv: 0.85,
      pad: { wave: 'sawtooth', vol: 0.12, lp: 800, att: 0.08 },
      bass: { wave: 'square', vol: 0.42, lp: 600, seq: 'r . r . r . o . r . r . r . f .' },
      drums: { k: 'x...x...x...x...', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' },
      arp: { wave: 'square', vol: 0.06, lp: 2600, oct: 7, gate: 0.3, seq: '0 . 1 . 2 . 1 . 0 . 1 . 3 . 1 .' },
      lead: { wave: 'sawtooth', vol: 0.16, det: 12, lp: 2200, gate: 0.5, oct: 7, up: 0, seq: [
        '0 . 1 . 0 . -1 . 0 - - . . . 3 2',
        '1 . 2 . 1 . 0 . -1 - - . . . . .',
        '3 . 4 . 3 . 2 . 1 . 0 . -1 . 0 .',
        '0 . . . 7 - - . 6 . 5 . 4 . 3 .'] } }),
    // DERROTA: el trombón del «uah uah uaaah»; luego vuelve el título
    rfLose: mk({
      bpm: 84, tonic: 45, scale: 'min', prog: [0, 0], dv: 0.8, once: true, next: 'rfTitulo',
      pad: { wave: 'triangle', vol: 0.2, lp: 900, att: 0.3 },
      drums: { t: '........x.......' },
      lead: { wave: 'sawtooth', vol: 0.2, det: 14, lp: 1100, gate: 0.95, oct: 0, up: 0, att: 0.08, seq: [
        '4 - - - 3 - - - 2 - - - 1 - - -',
        '0 - - - - - - - - - - - . . . .'] } }),
  });
})();

// la canción que debe sonar ahora; las cortas (victoria, derrota) suenan una vez y luego sigue la del título
// PARA COMPARAR (temporal): con el sonido viejo, cada canción nueva se cambia por la que sonaba antes (las del Rumble)
const MUSICA_VIEJA = { rfTitulo: 'menu', rfTaller: 'menu', rfCaza: 'boss0', rfRecta: 'boss0', rfWin: 'win', rfLose: 'lose', rfBkTaller: 'menu', rfBkCaza: 'boss0', rfBkRecta: 'boss0' };
// el tema de cada fase según el mapa: cada mapa trae su `musica: { taller, caza, recta }` (mapa-*.js); si no, los de la estación
const MUSICA_BASE = { taller: 'rfTaller', caza: 'rfCaza', recta: 'rfRecta' };
const temaDe = fase => (typeof MAPA_ACT !== 'undefined' && MAPA_ACT && MAPA_ACT.musica && MAPA_ACT.musica[fase]) || MUSICA_BASE[fase];
let MUSICA = null, MUSICA_PEDIDA = null;
function musica(pedida) {
  MUSICA_PEDIDA = pedida;
  const n = AUDIO.viejo ? MUSICA_VIEJA[pedida] || pedida : pedida, T = TRACKS[n];
  if (typeof J !== 'undefined' && J.fase === 'caza') M.tmT = AUDIO.viejo && J.recta ? 1.2 : 1;      // antes la recta final solo aceleraba la canción del jefe
  MUSICA = T && T.once ? T.next || null : n;
  if (AC && M.bus && M.name !== n) musicSet(n);
}
// cada fotograma: si el audio ya está en marcha (hace falta un primer toque) y no suena lo que toca, se pone
function vigilaMusica() {
  if (!AC || !M.bus || (M.trk && M.trk.once)) return;
  if (M.name !== MUSICA) musicSet(MUSICA);
}
