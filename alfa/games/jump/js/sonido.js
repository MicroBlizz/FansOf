// Fans of Jump · Sonido: el altavoz, el motor de música y las canciones son los de la serie (core/js/sistema/sonido.js y
// core/js/serie/canciones.js, que core carga antes; todo se crea con código, sin archivos). Aquí está lo que ese motor pide a
// cada juego (volumen y silencio), los efectos propios del juego (con tone y noise del motor) y qué canción suena:
// la de los Animales Locos, más deprisa con la racha y en la Fiebre arcoíris, más en cada nivel de la fiesta; al final, la de ganar o la de perder.
'use strict';

// lo que pide el motor de la serie
// al acabar las canciones cortas (ganar, perder) vuelve SAVE.menuMus: la de los Animales Locos (js/guardado.js)
function musicUpdate() { /* la canción la elige vigilaMusica (más abajo) */ }
const sonidoApagado = () => !GUARDA.efectos && !GUARDA.musica;
const volGeneral = () => 1;
const volMusica = () => GUARDA.musica;
const v = x => x * GUARDA.efectos;   // los efectos, con su volumen

const SONIDO = {
  salto: () => tone(220, 520, 0.16, 'square', v(0.08)),
  cae: () => { tone(160, 70, 0.12, 'triangle', v(0.2)); noise(0.08, v(0.08), 500); },
  perfecto: () => { tone(660, 660, 0.07, 'square', v(0.07)); tone(990, 990, 0.1, 'square', v(0.07), 0.07); },
  zana: () => tone(880, 1320, 0.08, 'square', v(0.06)),
  rescate: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, f, 0.09, 'square', v(0.07), i * 0.07)),
  uy: () => tone(400, 160, 0.25, 'sawtooth', v(0.07)),
  racha: () => [660, 880, 1100].forEach((f, i) => tone(f, f * 1.02, 0.08, 'triangle', v(0.07), i * 0.05)),
  fiebre: () => [523, 659, 784, 988, 1175, 1568].forEach((f, i) => tone(f, f, 0.1, 'square', v(0.06), i * 0.06)),
  meta: () => [784, 988, 1175].forEach((f, i) => tone(f, f, 0.16, 'triangle', v(0.09), i * 0.09)),
  boton: () => tone(700, 900, 0.05, 'triangle', v(0.06)),
  compra: () => [880, 1320].forEach((f, i) => tone(f, f, 0.08, 'square', v(0.06), i * 0.07)),
  clonk: () => { tone(880, 440, 0.12, 'square', v(0.07)); tone(1320, 660, 0.18, 'triangle', v(0.06), 0.03); },
  crac: () => { noise(0.18, v(0.18), 1800); tone(240, 90, 0.2, 'sawtooth', v(0.06)); },
  boing: () => [330, 494, 660].forEach((f, i) => tone(f, f * 1.25, 0.09, 'triangle', v(0.07), i * 0.06)),
  dron: () => { tone(140, 180, 0.5, 'sawtooth', v(0.03)); tone(150, 120, 0.5, 'sawtooth', v(0.03), 0.5); },
  // la fiesta de la Fiebre: una fanfarria que sube más alto en cada nivel y la gente vitoreando (ruido que sube y baja)
  fiesta: n => { [523, 659, 784, 1046, 1318].slice(0, 2 + n).forEach((f, i) => tone(f * (1 + n * 0.06), f * (1 + n * 0.06), 0.12, 'square', v(0.06), i * 0.06)); for (let i = 0; i < 3; i++) noise(0.25, v(0.05 + n * 0.01), 2600 + i * 500, 'bandpass', i * 0.12); },
  pum: () => { noise(0.12, v(0.06), 1200); tone(900, 1500, 0.08, 'triangle', v(0.03), 0.05); },
  chof: () => { noise(0.5, v(0.25), 600); tone(200, 50, 0.4, 'sine', v(0.15)); },
};

// cada fotograma: qué canción toca y a qué velocidad (el audio arranca con el primer toque)
let finSonado = false;
function vigilaMusica() {
  if (!AC || !M.bus) return;
  const J = JUEGO;
  if (J.modo === 'fin') {
    if (!finSonado && J.tFin > 0.4) { finSonado = true; musicSet(J.fin.record ? 'win' : 'lose'); }
    return;
  }
  finSonado = false;
  if (M.trk && M.trk.once) return;
  if (M.name !== 'animales') musicSet('animales');
  M.tmT = J.modo === 'menu' ? 0.9 : J.fiebre > 0 ? 1.24 + (FIESTA.nivel - 1) * 0.07 : 1 + Math.min(0.2, J.racha * 0.02);   // la fiesta, cada vez más frenética
}
