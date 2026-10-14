// Fans of Crush · SONIDOS: los efectos propios del juego (hechos con tone y noise del motor de core) y qué música toca en cada pantalla.
// Las canciones son las de la serie (core/js/serie/canciones.js): la de ascensor de Microblizz en el mapa, la de cada facción en los niveles
// y la de SurvivalBot para el jefe de RRHH.
'use strict';
// escala que sube con cada oleada de una misma jugada (cuanto más larga la cadena, más agudo)
const CR_NOTAS = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26, 28];
const crNota = n => 523.25 * Math.pow(2, CR_NOTAS[Math.min(CR_NOTAS.length - 1, n)] / 12);
Object.assign(SFX, {
  crCambio: () => { noise(0.07, 0.05, 2600, 'bandpass'); tone(420, 620, 0.08, 'triangle', 0.05); },
  crNoVale: () => { tone(230, 170, 0.12, 'square', 0.06); tone(170, 150, 0.12, 'square', 0.05, 0.08); },
  crPop: (ola = 1) => { const f = crNota(ola - 1); tone(f, f * 1.5, 0.11, 'triangle', 0.1); tone(f * 2, f * 2, 0.06, 'sine', 0.04, 0.03); noise(0.05, 0.05, 3800, 'highpass'); },
  crCae: () => tone(180, 120, 0.05, 'sine', 0.05),
  crNace: () => { tone(660, 1320, 0.16, 'triangle', 0.08); tone(990, 1980, 0.18, 'sine', 0.05, 0.06); noise(0.12, 0.05, 6000, 'highpass', 0.04); },
  crCohete: () => { noise(0.35, 0.18, 1600, 'bandpass'); tone(260, 1400, 0.28, 'sawtooth', 0.05); tone(700, 2200, 0.22, 'triangle', 0.05, 0.05); },
  crBoom: () => { noise(0.65, 0.42, 520); tone(110, 38, 0.5, 'sine', 0.42); noise(0.2, 0.12, 2400, 'bandpass', 0.05); },
  crLaser: () => { tone(1800, 300, 0.35, 'sawtooth', 0.05); tone(2400, 600, 0.3, 'square', 0.03, 0.05); [0, 0.09, 0.18].forEach((d, i) => tone(660 * (i + 1), 660 * (i + 1), 0.16, 'triangle', 0.05, d)); },
  crRayito: () => tone(1500, 900, 0.06, 'square', 0.025),
  crMega: () => { noise(1.1, 0.4, 700); tone(80, 30, 0.9, 'sine', 0.45); [523, 659, 784, 1046].forEach((f, i) => tone(f, f, 0.3, 'square', 0.05, 0.15 + i * 0.06)); },
  crHielo: () => { noise(0.14, 0.14, 5200, 'highpass'); tone(1800, 1200, 0.08, 'sine', 0.05); },
  crRompe: () => { noise(0.3, 0.2, 4200, 'highpass'); tone(900, 300, 0.2, 'square', 0.05); tone(1400, 2800, 0.12, 'sine', 0.04, 0.1); },
  crCinta: () => { noise(0.12, 0.1, 2000, 'bandpass'); tone(300, 160, 0.08, 'sawtooth', 0.03); },
  crRescate: () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, f, 0.14, 'triangle', 0.08, i * 0.07)),
  crEstrella: (n = 0) => { const f = 784 * Math.pow(2, n * 4 / 12); tone(f, f * 2, 0.28, 'triangle', 0.12); noise(0.25, 0.06, 7000, 'highpass'); },
  crCombo: (n = 2) => { const f = crNota(Math.min(10, n + 2)); tone(f, f, 0.12, 'square', 0.06); tone(f * 1.5, f * 1.5, 0.18, 'square', 0.05, 0.08); },
  crHoras: () => { [392, 494, 587, 784].forEach((f, i) => tone(f, f, 0.18, 'sawtooth', 0.06, i * 0.09)); noise(0.4, 0.08, 3000, 'bandpass', 0.3); },
  crTic: (n = 0) => tone(880 + n * 30, 1320 + n * 30, 0.06, 'square', 0.04),
  crJefeAy: () => { tone(300, 120, 0.18, 'square', 0.06); noise(0.1, 0.08, 1800, 'bandpass'); },
  crJefeAtaca: () => { tone(500, 500, 0.08, 'square', 0.06); tone(500, 500, 0.08, 'square', 0.06, 0.12); tone(220, 110, 0.5, 'sawtooth', 0.07, 0.25); },
  crCongela: () => { tone(2200, 1400, 0.25, 'sine', 0.05); noise(0.25, 0.08, 6000, 'highpass'); },
  crMartillo: () => { noise(0.2, 0.3, 900); tone(160, 60, 0.2, 'square', 0.12); },
  crCafe: () => { tone(523, 784, 0.12, 'triangle', 0.08); tone(784, 1046, 0.16, 'triangle', 0.08, 0.1); noise(0.3, 0.05, 900, 'lowpass', 0.05); },
  crBaraja: () => { for (let i = 0; i < 8; i++) noise(0.05, 0.08, 2000 + i * 300, 'bandpass', i * 0.05); },
  crBien: () => [659, 784, 988].forEach((f, i) => tone(f, f, 0.1, 'triangle', 0.06, i * 0.05)),
  crMoneda: () => { tone(1318, 1318, 0.06, 'square', 0.04); tone(1760, 1760, 0.12, 'square', 0.04, 0.06); },
  crPocos: () => { tone(880, 880, 0.08, 'square', 0.06); tone(660, 660, 0.12, 'square', 0.06, 0.1); },
});
Object.assign(THROTTLE, { crCae: 60, crPop: 45, crRayito: 35, crHielo: 60, crCinta: 60, crTic: 30, crJefeAy: 90, crMoneda: 50, crCambio: 60 });

// la música que debe sonar: el bucle la pone en cuanto el audio arranca (el navegador espera al primer toque) y no corta las sintonías de final
const CR_MUS = { quiere: 'menu', prisa: false };
function crMusica(nombre) { CR_MUS.quiere = nombre && TRACKS[nombre] ? nombre : 'menu'; }
function crSintonia(nombre) { if (AC && M.bus && TRACKS[nombre]) { musicSet(nombre); } }
function crMusicaBucle() {
  if (!AC || !M.bus) return;
  if (M.trk && M.trk.once) return;   // una sintonía (ganar o perder) suena entera; después core pone la del menú
  if (M.name !== CR_MUS.quiere) musicSet(CR_MUS.quiere);
  M.tmT = CR_MUS.prisa ? 1.12 : 1;
}
