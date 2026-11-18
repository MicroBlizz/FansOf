// Fans of Goose · Sonido: el altavoz, el motor de música y las canciones son los de la serie (core/js/sistema/sonido.js y
// core/js/serie/canciones.js): en la portada suena «nomuertos» (gótico, caja de música), en la partida «heroes» (marcha épica, que
// se acelera con el Impulso y la Prisa), con la Oca Madre «boss» y al acabar los jingles de ganar o perder. Los efectos son de código.
'use strict';

// lo que pide el motor de la serie
function musicUpdate() { /* la canción la elige vigilaMusica */ }
const sonidoApagado = () => !SAVE.efectos && !SAVE.musica;
const volGeneral = () => 1;
const volMusica = () => SAVE.musica * 0.8;
const v = x => x * SAVE.efectos;

// no más de un sonido igual cada X ms (con 200 ocas muriendo a la vez, si no, es ruido)
const ULT = {};
const cada = (k, ms) => { const a = performance.now(); if (ULT[k] && a - ULT[k] < ms) return false; ULT[k] = a; return true; };

const SONIDO = {
  boton: () => tone(700, 900, 0.05, 'triangle', v(0.06)),
  latigo: n => { if (!cada('lat', 60)) return; noise(0.08, v(0.09), 3200, 'highpass'); tone(1400, 300, 0.07, 'sawtooth', v(0.03)); if (n > 3) tone(180, 90, 0.1, 'sine', v(0.08)); },
  zas: () => { if (cada('zas', 90)) noise(0.06, v(0.04), 4000, 'highpass'); },
  corte: () => { if (cada('cor', 50)) tone(2200, 1600, 0.04, 'triangle', v(0.03)); },
  lanza: () => { if (cada('lan', 80)) tone(500, 900, 0.08, 'sine', v(0.04)); },
  explota: () => { if (!cada('exp', 70)) return; noise(0.3, v(0.14), 600); tone(120, 50, 0.25, 'sine', v(0.12)); },
  explotita: () => { if (cada('exq', 60)) noise(0.12, v(0.06), 900); },
  dadoArma: () => { if (cada('dar', 80)) tone(900, 1200, 0.04, 'square', v(0.03)); },
  rebote: () => { if (cada('reb', 50)) tone(1300, 900, 0.04, 'square', v(0.03)); },
  muere: () => { if (!cada('mue', 35)) return; tone(700 + Math.random() * 300, 220, 0.09, 'square', v(0.035)); noise(0.05, v(0.03), 2500, 'bandpass'); },
  muereGorda: () => { tone(400, 60, 0.4, 'sawtooth', v(0.09)); noise(0.35, v(0.12), 500); },
  herido: () => { if (!cada('her', 120)) return; tone(220, 110, 0.15, 'square', v(0.08)); noise(0.1, v(0.08), 1200); },
  muereYo: () => { [440, 330, 247, 165].forEach((f, i) => tone(f, f * 0.95, 0.3, 'sawtooth', v(0.08), i * 0.18)); noise(0.6, v(0.1), 400); },
  // la pluma sube de tono si las coges seguidas: cada cadena suena como una escala que no acaba
  pluma: c => { if (!cada('plu', 28)) return; const f = 880 * Math.pow(2, (c % 12) / 12) * (c >= 12 ? 2 : 1); tone(f, f * 1.01, 0.06, 'sine', v(0.05)); tone(f * 2, f * 2, 0.04, 'triangle', v(0.015)); },
  moneda: () => { if (!cada('mon', 40)) return; tone(1568, 1568, 0.05, 'square', v(0.04)); tone(2093, 2093, 0.12, 'square', v(0.04), 0.05); },
  cura: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, f, 0.1, 'sine', v(0.07), i * 0.06)),
  iman: () => tone(300, 1800, 0.5, 'sine', v(0.07)),
  impulsoListo: () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, f, 0.08, 'triangle', v(0.07), i * 0.05)),
  nivel: () => { [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, f * 1.01, 0.14, 'square', v(0.06), i * 0.06)); noise(0.2, v(0.05), 5000, 'highpass'); },
  elige: evo => { (evo ? [523, 659, 784, 1046, 1318, 1568, 2093] : [784, 988, 1318]).forEach((f, i) => tone(f, f, 0.12, 'triangle', v(0.07), i * 0.05)); },
  evolucion: () => { [261, 392, 523, 784, 1046].forEach((f, i) => tone(f, f * 1.5, 0.5, 'sawtooth', v(0.05), i * 0.08)); noise(0.8, v(0.08), 3000, 'bandpass'); },
  cofre: () => { [392, 440, 494, 523, 587, 659, 698, 784].forEach((f, i) => tone(f, f, 0.08, 'square', v(0.05), i * 0.09)); noise(0.3, v(0.05), 4000, 'highpass', 0.75); },
  premio: i => tone(1046 + i * 130, 1318 + i * 130, 0.14, 'triangle', v(0.07)),
  hito: n => { [659, 880, 1175, 1568].slice(0, 2 + Math.min(2, n)).forEach((f, i) => tone(f, f, 0.12, 'square', v(0.06), i * 0.07)); },
  casilla: () => [659, 988].forEach((f, i) => tone(f, f, 0.1, 'triangle', v(0.06), i * 0.08)),
  empieza: () => { tone(110, 55, 0.8, 'sawtooth', v(0.08)); [392, 523, 659].forEach((f, i) => tone(f, f, 0.2, 'triangle', v(0.06), 0.2 + i * 0.12)); },
  cae: () => tone(900, 80, 0.6, 'sine', v(0.1)),
  vuelve: () => tone(200, 700, 0.2, 'triangle', v(0.07)),
  oca: () => { [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, f * 1.02, 0.18, 'square', v(0.06), i * 0.04)); noise(0.5, v(0.07), 2000, 'bandpass'); tone(200, 1200, 0.6, 'sawtooth', v(0.04)); },
  aterriza: () => { noise(0.3, v(0.14), 500); tone(140, 50, 0.25, 'sine', v(0.14)); },
  pozo: () => { tone(300, 70, 0.9, 'sawtooth', v(0.08)); noise(0.8, v(0.08), 300); },
  posada: () => [392, 494, 587, 784].forEach((f, i) => tone(f, f, 0.3, 'sine', v(0.07), i * 0.12)),
  muerte: () => { [196, 185, 175, 165].forEach((f, i) => tone(f, f * 0.9, 0.4, 'sawtooth', v(0.09), i * 0.15)); noise(0.7, v(0.1), 300); },
  dadoRueda: () => { for (let i = 0; i < 6; i++) noise(0.04, v(0.07), 1800 + i * 200, 'bandpass', i * 0.12); },
  dadoTic: () => { if (cada('dtic', 70)) tone(1700, 1500, 0.02, 'square', v(0.025)); },
  dadoBueno: seis => { (seis ? [523, 659, 784, 1046, 1318, 1568] : [659, 784, 1046]).forEach((f, i) => tone(f, f, 0.14, 'square', v(0.07), i * 0.06)); },
  dadoMalo: () => { [330, 311, 294, 277].forEach((f, i) => tone(f, f, 0.16, 'sawtooth', v(0.06), i * 0.1)); },
  dadoFin: () => tone(800, 500, 0.12, 'triangle', v(0.04)),
  bandada: () => { for (let i = 0; i < 4; i++) tone(900 - i * 60, 700 - i * 60, 0.12, 'square', v(0.03), i * 0.08); },
  jefe: () => { [110, 104, 98].forEach((f, i) => tone(f, f, 0.7, 'sawtooth', v(0.1), i * 0.5)); noise(1.5, v(0.1), 250); },
  jefeTiro: () => { if (cada('jt', 150)) tone(600, 300, 0.12, 'square', v(0.04)); },
  jefeCarga: () => tone(150, 900, 0.5, 'sawtooth', v(0.08)),
  victoria: () => { [523, 659, 784, 1046, 784, 1046, 1318, 1568].forEach((f, i) => tone(f, f, 0.22, 'square', v(0.07), i * 0.12)); },
};

// qué canción suena
let finSonado = false;
function vigilaMusica() {
  if (!AC || !M.bus) return;
  const J = JUEGO;
  if (J.modo === 'fin') { if (!finSonado && J.fin && J.fin.t > 0.3) { finSonado = true; musicSet(J.fin.gana ? 'win' : 'lose'); } return; }
  finSonado = false;
  if (M.trk && M.trk.once) return;
  const quiero = !enPartida() ? 'nomuertos' : J.jefe ? 'boss' : 'heroes';
  if (M.name !== quiero) musicSet(quiero);
  M.tmT = !enPartida() ? 0.9 : J.modo !== 'juego' ? 0.8 : J.salto > 0 ? 1.4 : multiVel() > 1 ? 1.25 : J.impaciente ? 1.15 : 1;
}
