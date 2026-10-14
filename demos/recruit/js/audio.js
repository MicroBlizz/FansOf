// Fans of Recruit · SONIDO: usa el motor de sonido y las canciones de la serie (core/js/sistema/sonido.js y
// core/js/serie/canciones.js, los mismos que Fans of Rumble; todo se crea con código, sin archivos). Aquí está lo que ese
// motor pide a cada juego (volumen y silencio), los efectos propios de este juego y la canción que toca en cada momento.
'use strict';

const SAVE = { menuMus: null };   // el motor lo mira al acabar las canciones cortas (victoria y derrota)
const AJUSTES = { mudo: false, sinMusica: false, record: 0 };
try { const a = JSON.parse(localStorage.getItem('fansof-recruit') || '{}'); Object.assign(AJUSTES, { mudo: !!a.mudo, sinMusica: !!a.sinMusica, record: a.record | 0 }); if (a.teclas && typeof a.teclas === 'object') AJUSTES.teclas = a.teclas; } catch (_) { /* sin guardar */ }
function guardaAjustes() { try { localStorage.setItem('fansof-recruit', JSON.stringify(AJUSTES)); } catch (_) { /* sin guardar */ } }
const sonidoApagado = () => AJUSTES.mudo;
const volGeneral = () => (AJUSTES.mudo ? 0 : 0.55);
const volMusica = () => (AJUSTES.sinMusica ? 0 : 0.5);
// el motor usa estas dos para algunos efectos
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[(Math.random() * a.length) | 0];

// los efectos de este juego (se suman a los de la serie)
Object.assign(SFX, {
  pistola: () => { noise(0.05, 0.1, 2600, 'bandpass'); tone(520, 180, 0.07, 'square', 0.05); },
  ametralladora: () => { noise(0.045, 0.12, 3400, 'bandpass'); tone(300, 110, 0.05, 'square', 0.045); },
  grapa: () => { tone(900, 500, 0.05, 'square', 0.04); noise(0.03, 0.05, 5000, 'highpass'); },
  golpe: () => { noise(0.05, 0.12, 1800, 'bandpass'); tone(200, 120, 0.05, 'square', 0.05); },
  moneda: () => { tone(988, 988, 0.05, 'square', 0.045); tone(1319, 1319, 0.12, 'square', 0.045, 0.05); },
  premio: () => [523, 784, 1046].forEach((f, i) => tone(f, f, 0.09, 'triangle', 0.08, i * 0.06)),
  fan: () => [659, 784, 988, 1319].forEach((f, i) => tone(f, f, 0.1, 'triangle', 0.07, i * 0.07)),
  bomba: () => tone(500, 240, 0.16, 'triangle', 0.07),
  caida: () => { tone(700, 90, 0.5, 'square', 0.08); noise(0.2, 0.12, 900); },
  paso: () => noise(0.03, 0.03, 700),
  salto: () => tone(300, 640, 0.12, 'square', 0.035),
  aterriza: () => { noise(0.08, 0.1, 500); tone(140, 70, 0.08, 'sine', 0.1); },
  alarma: () => { for (let i = 0; i < 3; i++) { tone(620, 880, 0.2, 'square', 0.06, i * 0.42); tone(880, 620, 0.2, 'square', 0.06, i * 0.42 + 0.21); } },
  caos: () => { tone(160, 900, 0.5, 'sawtooth', 0.08); tone(240, 1350, 0.5, 'square', 0.05, 0.05); noise(0.5, 0.2, 1200); },
  rotulo: () => { tone(440, 440, 0.1, 'square', 0.06); tone(660, 660, 0.1, 'square', 0.06, 0.1); tone(880, 880, 0.2, 'square', 0.06, 0.2); },
});
Object.assign(THROTTLE, { pistola: 60, ametralladora: 55, grapa: 80, golpe: 45, moneda: 60, paso: 120, boom: 90 });

// la canción que debe sonar ahora; las cortas (victoria, derrota) suenan una vez
let MUSICA = null;
function musica(n) {
  const T = n && TRACKS[n];
  MUSICA = T && T.once ? null : n;
  if (AC && M.bus) musicSet(n);
}
// cada fotograma: si el audio ya está en marcha (hace falta un primer toque) y no suena lo que toca, se pone
function vigilaMusica() {
  if (!AC || !M.bus || (M.trk && M.trk.once)) return;
  if (M.name !== MUSICA) musicSet(MUSICA);
}
function cambiaSonido() { AJUSTES.mudo = !AJUSTES.mudo; guardaAjustes(); applyVolume(); if (!AJUSTES.mudo) { audioInit(); play('select'); } }
function cambiaMusica() { AJUSTES.sinMusica = !AJUSTES.sinMusica; guardaAjustes(); applyVolume(); play('select'); }
