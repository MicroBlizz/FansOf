// Fans of Panic · Sonido: el altavoz, el motor de música y las canciones son los de la serie (core/js/sistema/sonido.js y
// core/js/serie/canciones.js). Aquí, lo que ese motor pide a cada juego (volumen y silencio), los efectos propios y qué canción
// suena: la de espera de Microblizz en la portada, «gamer» en el nivel (más deprisa con la Tijera) y ganar o perder al final.
'use strict';

function musicUpdate() { /* la canción la elige vigilaMusica (más abajo) */ }
const sonidoApagado = () => !SAVE.efectos && !SAVE.musica;
const volGeneral = () => 1;
const volMusica = () => SAVE.musica;
const v = x => x * SAVE.efectos;

const SONIDO = {
  boton: () => tone(700, 900, 0.05, 'triangle', v(0.06)),
  gira: () => tone(500, 460, 0.03, 'triangle', v(0.02)),
  corte: n => { for (let i = 0; i < Math.min(10, 3 + n); i++) tone(700 + i * 110, 1200 + i * 110, 0.05, 'square', v(0.05), i * 0.03); noise(0.12, v(0.08), 1800); },
  combo: n => tone(600 + n * 120, 800 + n * 120, 0.08, 'triangle', v(0.06), 0.04),
  grande: () => { [392, 523, 659, 784, 1046].forEach((f, i) => tone(f, f * 1.01, 0.14, 'square', v(0.07), i * 0.05)); noise(0.3, v(0.1), 900); },
  mecha: () => noise(0.05, v(0.04), 3000, 'bandpass'),
  muere: () => { tone(220, 60, 0.5, 'sawtooth', v(0.12)); noise(0.3, v(0.12), 700); },
  objeto: () => [660, 880, 1320].forEach((f, i) => tone(f, f, 0.08, 'triangle', v(0.06), i * 0.05)),
  congela: () => tone(1200, 300, 0.4, 'sine', v(0.08)),
  escudo: () => { tone(200, 600, 0.15, 'square', v(0.08)); noise(0.12, v(0.08), 900); },
  becario: () => { tone(300, 900, 0.12, 'sawtooth', v(0.05)); },
  atrapado: () => [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, f, 0.1, 'square', v(0.07), i * 0.06)),
  gana: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, f, 0.14, 'triangle', v(0.08), i * 0.1)),
  tic: () => tone(1500, 1500, 0.03, 'square', v(0.03)),
  fantasma: () => tone(900, 300, 0.3, 'sine', v(0.08)),
  locura: mala => (mala ? [600, 450, 600, 450] : [450, 600, 750]).forEach((f, i) => tone(f, f, 0.08, 'triangle', v(0.06), i * 0.07)),
};

// cada fotograma: qué canción toca y a qué velocidad (el audio arranca con el primer toque)
let finSonado = false;
function vigilaMusica() {
  if (!AC || !M.bus) return;
  const J = JUEGO;
  if (J.modo === 'fin') { if (!finSonado && J.tFin > 0.3) { finSonado = true; musicSet(J.fin.gana ? 'win' : 'lose'); } return; }
  finSonado = false;
  if (M.trk && M.trk.once) return;
  const menu = !enPartida(), quiero = menu ? 'menu' : 'gamer';
  if (M.name !== quiero) musicSet(quiero);
  M.tmT = menu ? 1 : J.rapidoT > 0 ? 1.3 : J.tiempo < 10 ? 1.15 : 1;
}
