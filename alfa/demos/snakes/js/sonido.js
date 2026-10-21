// Fans of Snakes · Sonido: el altavoz, el motor de música y las canciones son los de la serie (core/js/sistema/sonido.js y
// core/js/serie/canciones.js). Aquí está lo que ese motor pide a cada juego (volumen y silencio), los efectos propios y
// qué canción suena: la de espera de Microblizz en la portada, «gamer» en la partida (más deprisa en el Frenesí) y la de
// perder al final. En el modo retro la música se calla y los efectos son un solo pitido cuadrado, como el móvil antiguo.
'use strict';

// lo que pide el motor de la serie
function musicUpdate() { /* la canción la elige vigilaMusica (más abajo) */ }
const sonidoApagado = () => !SAVE.efectos && !SAVE.musica;
const volGeneral = () => 1;
const volMusica = () => (typeof esRetro === 'function' && esRetro()) ? 0 : SAVE.musica;
const v = x => x * SAVE.efectos;   // los efectos, con su volumen

// el pitido único del modo retro
const pitido = (f = 1200, d = 0.06, delay = 0) => tone(f, f, d, 'square', v(0.05), delay);

const SONIDO = {
  come: () => esRetro() ? pitido() : tone(660, 990, 0.08, 'square', v(0.06)),
  come_oro: () => esRetro() ? pitido(1500) : [880, 1320, 1760].forEach((f, i) => tone(f, f, 0.07, 'square', v(0.05), i * 0.05)),
  uy: () => { if (esRetro()) { pitido(400, 0.04); return; } tone(300, 900, 0.12, 'sawtooth', v(0.05)); noise(0.06, v(0.04), 2500, 'bandpass'); },
  gira: () => esRetro() ? null : tone(520, 480, 0.03, 'triangle', v(0.02)),
  frenesi: () => [392, 523, 659, 784, 1046, 1318, 1568].forEach((f, i) => tone(f, f * 1.01, 0.12, 'square', v(0.07), i * 0.05)),
  fin_frenesi: () => [784, 659, 523].forEach((f, i) => tone(f, f * 0.98, 0.14, 'triangle', v(0.06), i * 0.1)),
  corte: n => { for (let i = 0; i < Math.min(12, n); i++) tone(900 + i * 90, 1400 + i * 90, 0.05, 'square', v(0.05), i * 0.035); noise(0.15, v(0.1), 1500); },
  muere: () => { if (esRetro()) { [900, 700, 500, 300].forEach((f, i) => pitido(f, 0.12, i * 0.14)); return; } tone(220, 60, 0.5, 'sawtooth', v(0.12)); noise(0.3, v(0.12), 700); },
  boton: () => tone(700, 900, 0.05, 'triangle', v(0.06)),
  locura: tipo => tipo === 'retro' ? [1200, 1200, 1600].forEach((f, i) => pitido(f, 0.08, i * 0.1)) : [600, 450, 600, 450].forEach((f, i) => tone(f, f, 0.08, 'triangle', v(0.06), i * 0.07)),
  locura_fin: () => tone(1000, 1400, 0.1, 'triangle', v(0.05)),
};

// cada fotograma: qué canción toca y a qué velocidad (el audio arranca con el primer toque)
let finSonado = false;
function vigilaMusica() {
  if (!AC || !M.bus) return;
  const J = JUEGO;
  if (J.modo === 'fin') { if (!finSonado && J.tFin > 0.3) { finSonado = true; musicSet('lose'); } return; }
  finSonado = false;
  if (M.trk && M.trk.once) return;
  const quiero = J.modo === 'menu' ? 'menu' : 'gamer';
  if (M.name !== quiero) musicSet(quiero);
  M.tmT = J.modo === 'menu' ? 1 : esFrenesi() ? 1.35 : 1 + Math.min(0.15, (J.serp.length - 4) * 0.004);
}
