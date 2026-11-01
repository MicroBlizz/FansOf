// Fans of Chef · Sonido: el altavoz, el motor de música y las canciones son los de la serie (core/js/sistema/sonido.js y
// core/js/serie/canciones.js). Aquí lo que ese motor pide a cada juego (volumen y silencio), los efectos propios (todo chip) y qué
// canción suena: la de espera en la portada, «olvidados» en el sótano, «memes» en la cantina.
'use strict';

function musicUpdate() { /* la canción la elige vigilaMusica (más abajo) */ }
const sonidoApagado = () => !SAVE.efectos && !SAVE.musica;
const volGeneral = () => 1;
const volMusica = () => SAVE.musica;
const v = x => x * SAVE.efectos;

const SONIDO = {
  cuchillo: () => noise(0.06, v(0.07), 3000, 'highpass'),
  sarten: () => { tone(900, 500, 0.12, 'square', v(0.08)); noise(0.08, v(0.06), 2200, 'bandpass'); },
  golpeEnemigo: () => tone(500, 300, 0.04, 'square', v(0.04)),
  muere: () => { tone(400, 100, 0.12, 'square', v(0.04)); noise(0.1, v(0.05), 1200); },
  explota: () => { noise(0.35, v(0.14), 400); tone(120, 40, 0.3, 'sawtooth', v(0.1)); },
  mecha: () => [880, 1100, 1320].forEach((f, i) => tone(f, f, 0.05, 'square', v(0.04), i * 0.2)),
  embiste: () => tone(160, 90, 0.25, 'sawtooth', v(0.06)),
  salta: () => tone(300, 600, 0.1, 'triangle', v(0.04)),
  herido: () => { tone(300, 80, 0.2, 'sawtooth', v(0.1)); noise(0.1, v(0.08), 500); },
  coge: () => tone(1200, 1700, 0.05, 'triangle', v(0.04)),
  cofre: () => [660, 880, 1100, 1320].forEach((f, i) => tone(f, f * 1.01, 0.1, 'triangle', v(0.07), i * 0.07)),
  montacargas: () => { tone(90, 140, 0.9, 'sawtooth', v(0.06)); noise(0.9, v(0.03), 300); },
  campana: () => { tone(1568, 1568, 0.25, 'triangle', v(0.07)); tone(2093, 2093, 0.3, 'triangle', v(0.05), 0.12); },
  cocina: () => noise(0.5, v(0.05), 1800, 'bandpass'),
  servido: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, f, 0.1, 'square', v(0.06), i * 0.07)),
  no: () => tone(200, 150, 0.12, 'square', v(0.06)),
  boton: () => tone(700, 900, 0.05, 'triangle', v(0.06)),
  aviso: () => [880, 880].forEach((f, i) => tone(f, f, 0.1, 'square', v(0.06), i * 0.18)),
  oro: () => [1046, 1318, 1568].forEach((f, i) => tone(f, f, 0.08, 'triangle', v(0.06), i * 0.06)),
  pierde: () => { tone(220, 60, 0.6, 'sawtooth', v(0.12)); noise(0.3, v(0.1), 700); },
};

function vigilaMusica() {
  if (!AC || !M.bus) return;
  if (M.trk && M.trk.once) return;
  const f = JORNADA.fase;
  const quiero = f === 'portada' ? 'menu' : f === 'caza' || f === 'subiendo' ? 'olvidados' : 'memes';
  if (M.name !== quiero) musicSet(quiero);
  M.tmT = 1;
}
