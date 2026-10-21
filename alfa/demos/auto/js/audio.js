// Fans of Auto · SONIDO: usa el motor de sonido y las canciones de la serie (core/js/sistema/sonido.js y
// core/js/serie/canciones.js, todo hecho con código, sin archivos). Aquí está lo que ese motor pide a cada juego (volumen y
// silencio), los efectos propios de este juego (motor, claxon, sirena, choques) y la canción que suena en cada momento.
'use strict';

const SAVE = { menuMus: null };   // el motor lo mira al acabar las canciones cortas
// los ajustes: sonido, música, detalle de los gráficos (bajo = menos coches, gente y sombras, para móviles flojos),
// tamaño de los mandos táctiles, mostrar los mandos en PC y las teclas cambiadas
const AJUSTES = { mudo: false, sinMusica: false, detalle: 'normal', mandos: 1, teclas: {}, sombras: true };
try { const a = JSON.parse(localStorage.getItem('fansof-auto-ajustes') || '{}'); Object.assign(AJUSTES, { mudo: !!a.mudo, sinMusica: !!a.sinMusica, detalle: a.detalle === 'bajo' ? 'bajo' : 'normal', mandos: [0.8, 1, 1.25].includes(a.mandos) ? a.mandos : 1, teclas: a.teclas && typeof a.teclas === 'object' ? a.teclas : {} }); } catch (_) { /* sin guardar */ }
function guardaAjustes() { try { localStorage.setItem('fansof-auto-ajustes', JSON.stringify(AJUSTES)); } catch (_) { /* sin guardar */ } }
const sonidoApagado = () => AJUSTES.mudo;
const volGeneral = () => (AJUSTES.mudo ? 0 : 0.55);
const volMusica = () => (AJUSTES.sinMusica ? 0 : 0.22);
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[(Math.random() * a.length) | 0];

// los efectos de este juego (se suman a los de la serie)
Object.assign(SFX, {
  pistola: () => { noise(0.05, 0.1, 2600, 'bandpass'); tone(520, 180, 0.07, 'square', 0.05); },
  golpe: () => { noise(0.05, 0.12, 1800, 'bandpass'); tone(200, 120, 0.05, 'square', 0.05); },
  choque: (v = 1) => { noise(0.12, 0.18 * v, 700); tone(140, 50, 0.12, 'square', 0.08 * v); },
  chapa: () => { noise(0.08, 0.1, 2200, 'bandpass'); tone(380, 200, 0.06, 'square', 0.03); },
  claxon: () => { tone(392, 392, 0.2, 'sawtooth', 0.05); tone(494, 494, 0.22, 'sawtooth', 0.045, 0.02); },
  sirena: () => { tone(620, 880, 0.3, 'square', 0.035); tone(880, 620, 0.3, 'square', 0.035, 0.3); },
  puerta: () => { noise(0.05, 0.1, 900); tone(240, 160, 0.06, 'square', 0.04); },
  arranque: () => { tone(90, 160, 0.3, 'sawtooth', 0.05); noise(0.2, 0.05, 400); },
  derrape: () => noise(0.12, 0.07, 1500, 'bandpass'),
  moneda: () => { tone(988, 988, 0.05, 'square', 0.045); tone(1319, 1319, 0.12, 'square', 0.045, 0.05); },
  telefono: () => { for (let i = 0; i < 4; i++) tone(1200, 1200, 0.05, 'square', 0.04, i * 0.09); },
  mision: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, f, 0.12, 'triangle', 0.08, i * 0.08)),
  fallo: () => [392, 349, 294].forEach((f, i) => tone(f, f * 0.97, 0.3, 'sawtooth', 0.07, i * 0.25)),
  martillo: () => { noise(0.1, 0.2, 500); tone(110, 50, 0.2, 'square', 0.1); },
  guardado: () => [659, 784, 988, 1319].forEach((f, i) => tone(f, f, 0.1, 'triangle', 0.07, i * 0.07)),
  respeto: () => { tone(440, 660, 0.12, 'square', 0.05); tone(660, 880, 0.14, 'square', 0.05, 0.1); },
});
Object.assign(THROTTLE, { pistola: 60, golpe: 45, choque: 120, chapa: 90, claxon: 400, sirena: 650, derrape: 150, moneda: 60, martillo: 200 });

// la canción que debe sonar ahora; las cortas (victoria, derrota) suenan una vez
let MUSICA = null;
function musica(n) {
  const T = n && TRACKS[n];
  MUSICA = T && T.once ? null : n;
  if (AC && M.bus) musicSet(n);
}
function vigilaMusica() {
  if (!AC || !M.bus || (M.trk && M.trk.once)) return;
  if (M.name !== MUSICA) musicSet(MUSICA);
}
function cambiaSonido() { AJUSTES.mudo = !AJUSTES.mudo; guardaAjustes(); applyVolume(); if (!AJUSTES.mudo) { audioInit(); play('select'); } }
function cambiaMusica() { AJUSTES.sinMusica = !AJUSTES.sinMusica; guardaAjustes(); applyVolume(); play('select'); }
