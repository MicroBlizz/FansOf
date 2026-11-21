// Fans of Shelter · Sonido: el altavoz, el motor de música y las canciones son los de la serie (core/js/sistema/sonido.js y
// core/js/serie/canciones.js). Aquí lo que ese motor pide a cada juego (volumen y silencio), los efectos propios (todo chip de 16 bits)
// y qué canción suena: la de espera en la portada, «animales» de día, «nomuertos» de noche, «boss» con el jefe y «lose» al caer.
'use strict';

function musicUpdate() { /* la canción la elige vigilaMusica (más abajo) */ }
const sonidoApagado = () => !SAVE.efectos && !SAVE.musica;
const volGeneral = () => 1;
const volMusica = () => SAVE.musica;
const v = x => x * SAVE.efectos;

const SONIDO = {
  golpe: madera => madera ? noise(0.07, v(0.08), 900, 'bandpass') : tone(180, 120, 0.06, 'square', v(0.06)),
  cae: () => { [520, 660, 880].forEach((f, i) => tone(f, f, 0.08, 'square', v(0.05), i * 0.06)); noise(0.12, v(0.06), 600); },
  empuja: () => { tone(120, 90, 0.18, 'sawtooth', v(0.05)); noise(0.18, v(0.05), 300); },
  puerta: () => [330, 440, 550, 660].forEach((f, i) => tone(f, f, 0.12, 'square', v(0.06), i * 0.1)),
  cofre: () => [660, 880, 1100, 1320].forEach((f, i) => tone(f, f * 1.01, 0.1, 'triangle', v(0.07), i * 0.07)),
  craftea: () => { tone(440, 660, 0.08, 'square', v(0.05)); tone(880, 1320, 0.1, 'square', v(0.05), 0.09); },
  no: () => tone(200, 150, 0.12, 'square', v(0.06)),
  boton: () => tone(700, 900, 0.05, 'triangle', v(0.06)),
  esquiva: () => noise(0.08, v(0.05), 2500, 'highpass'),
  herido: () => { tone(300, 80, 0.2, 'sawtooth', v(0.1)); noise(0.1, v(0.08), 500); },
  golpeEnemigo: () => tone(500, 300, 0.04, 'square', v(0.03)),
  muere: () => { tone(400, 100, 0.12, 'square', v(0.04)); noise(0.08, v(0.04), 1800); },
  cristal: () => tone(1400, 1900, 0.05, 'triangle', v(0.03)),
  fuego: () => noise(0.1, v(0.05), 1200, 'bandpass'),
  torreta: () => tone(900, 500, 0.04, 'square', v(0.03)),
  nivel: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, f, 0.1, 'square', v(0.07), i * 0.07)),
  noche: () => { [220, 196, 174, 146].forEach((f, i) => tone(f, f * 0.98, 0.3, 'sawtooth', v(0.07), i * 0.25)); },
  amanece: () => [392, 523, 659, 784, 1046].forEach((f, i) => tone(f, f, 0.14, 'triangle', v(0.06), i * 0.1)),
  jefe: () => { for (let i = 0; i < 4; i++) { tone(90, 60, 0.25, 'sawtooth', v(0.1), i * 0.3); noise(0.1, v(0.08), 300, 'lowpass', i * 0.3); } },
  jefeMuere: () => [1046, 880, 1046, 1318, 1568].forEach((f, i) => tone(f, f, 0.14, 'square', v(0.07), i * 0.09)),
  pierde: () => { tone(220, 60, 0.6, 'sawtooth', v(0.12)); noise(0.3, v(0.1), 700); },
};

let finSonado = false;
function vigilaMusica() {
  if (!AC || !M.bus) return;
  if (NOCHE.fase === 'fin') { if (!finSonado) { finSonado = true; musicSet('lose'); } return; }
  finSonado = false;
  if (M.trk && M.trk.once) return;
  const quiero = NOCHE.fase === 'portada' ? 'menu' : NOCHE.fase === 'noche' ? (NOCHE.jefe && !NOCHE.jefeVencido ? 'boss' : 'nomuertos') : 'animales';
  if (M.name !== quiero) musicSet(quiero);
  M.tmT = 1;
}
