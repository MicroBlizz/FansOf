// Fans of Vikings · SONIDOS: los efectos propios (hechos con tone y noise del motor de core, sin archivos) y qué música suena.
// Las canciones son las de la serie (core/js/serie/canciones.js): la de los Animales Locos en la aldea, la de los gamers en los
// asaltos, la del jefe contra el Ejecutivo y las sintonías de ganar o perder.
'use strict';
Object.assign(SFX, {
  vkPon: () => { tone(330, 495, 0.08, 'triangle', 0.08); noise(0.05, 0.04, 2400, 'bandpass'); },
  vkListo: () => [660, 880].forEach((f, i) => tone(f, f, 0.1, 'square', 0.04, i * 0.06)),
  vkNoVale: () => tone(220, 160, 0.12, 'square', 0.05),
  vkMoneda: () => { tone(988, 988, 0.05, 'square', 0.05); tone(1318, 1318, 0.12, 'square', 0.05, 0.05); },
  vkCura: () => [523, 659, 784].forEach((f, i) => tone(f, f * 1.01, 0.14, 'sine', 0.07, i * 0.05)),
  vkEquipa: () => { noise(0.08, 0.08, 3500, 'highpass'); tone(400, 800, 0.12, 'triangle', 0.07); },
  vkGolpe: () => { noise(0.1, 0.12, 700); tone(180, 70, 0.12, 'square', 0.07); },
  vkFlecha: () => { noise(0.12, 0.06, 4000, 'bandpass'); tone(900, 1500, 0.08, 'triangle', 0.04); },
  vkMagia: () => { tone(500, 1400, 0.22, 'sawtooth', 0.04); noise(0.2, 0.05, 6000, 'highpass'); },
  vkProvocar: () => { tone(200, 260, 0.16, 'sawtooth', 0.06); tone(260, 200, 0.16, 'sawtooth', 0.05, 0.14); },
  vkCae: () => { tone(400, 90, 0.35, 'triangle', 0.08); noise(0.2, 0.06, 500, 'lowpass', 0.15); },
  vkOleada: () => [392, 523, 659].forEach((f, i) => tone(f, f, 0.16, 'square', 0.05, i * 0.08)),
  vkNivel: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, f, 0.18, 'triangle', 0.08, i * 0.08)),
  vkMision: () => { [784, 988, 1318].forEach((f, i) => tone(f, f, 0.14, 'triangle', 0.07, i * 0.06)); noise(0.3, 0.04, 7000, 'highpass', 0.1); },
});
Object.assign(THROTTLE, { vkGolpe: 40, vkListo: 80, vkMoneda: 30, vkCae: 60 });

// la música que debe sonar: el bucle la pone en cuanto el audio arranca (el navegador espera al primer toque) y no corta las sintonías
const VK_MUS = { quiere: 'animales' };
function vkMusica(nombre) { VK_MUS.quiere = nombre && TRACKS[nombre] ? nombre : 'animales'; }
function vkSintonia(nombre) { if (typeof AC !== 'undefined' && AC && M.bus && TRACKS[nombre]) musicSet(nombre); }
function vkMusicaBucle() {
  if (typeof AC === 'undefined' || !AC || !M.bus) return;
  if (M.trk && M.trk.once) return;
  if (M.name !== VK_MUS.quiere) musicSet(VK_MUS.quiere);
  M.tmT = 1;
}
