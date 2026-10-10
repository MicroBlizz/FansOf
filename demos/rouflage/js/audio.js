// Fans of Rouflage (prototipo) · SONIDO: usa el motor de sonido y las canciones de la serie (core/js/sistema/sonido.js y
// core/js/serie/canciones.js, los mismos que Fans of Rumble; todo se crea con código, sin archivos, y aquí no se cambian). Este archivo
// pone lo que ese motor pide a cada juego (volumen y silencio), la canción de cada momento y los efectos propios de este juego.
'use strict';

const SAVE = { menuMus: null };   // el motor lo mira al acabar las canciones cortas (victoria y derrota)
const AUDIO = { mudo: false, sinMusica: false };
try { AUDIO.mudo = localStorage.getItem('rouflage-mudo') === '1'; AUDIO.sinMusica = localStorage.getItem('rouflage-sin-musica') === '1'; } catch (_) { /* sin guardar */ }
const sonidoApagado = () => AUDIO.mudo;
const volGeneral = () => (AUDIO.mudo ? 0 : 0.55);
const volMusica = () => (AUDIO.sinMusica ? 0 : 0.5);

// efectos propios: pintar, coger un color, congelarse, silbar, el sello de despido y el apagón
Object.assign(SFX, {
  pincel: () => noise(0.09, 0.045, 2600, 'bandpass'),
  gota: () => { tone(880, 1500, 0.07, 'sine', 0.09); tone(1500, 1900, 0.06, 'sine', 0.05, 0.06); },
  cubo: () => { noise(0.22, 0.12, 900); tone(300, 160, 0.2, 'sine', 0.1); },
  congela: () => { [1318, 1568, 2093].forEach((f, i) => tone(f, f, 0.16, 'sine', 0.07, i * 0.05)); noise(0.2, 0.05, 6000, 'highpass'); },
  silbido: (v = 1) => { tone(1500, 2300, 0.16, 'sine', 0.13 * v); tone(2300, 1700, 0.22, 'sine', 0.12 * v, 0.17); },
  disparo: (v = 1) => { noise(0.08, 0.22 * v, 1800, 'bandpass'); tone(520, 150, 0.14, 'square', 0.07 * v); },
  luces: () => { tone(420, 60, 0.7, 'sawtooth', 0.07); noise(0.5, 0.08, 500); },
  latido: (v = 1) => { tone(72, 46, 0.12, 'sine', 0.34 * v); tone(64, 42, 0.12, 'sine', 0.24 * v, 0.17); },
});
Object.assign(THROTTLE, { pincel: 70, silbido: 110, disparo: 80, latido: 280 });

// la canción que debe sonar ahora; las cortas (victoria, derrota) suenan una vez y luego sigue la del menú
let MUSICA = null;
function musica(n) {
  const T = TRACKS[n];
  MUSICA = T && T.once ? T.next || null : n;
  if (AC && M.bus) musicSet(n);
}
// cada fotograma: si el audio ya está en marcha (hace falta un primer toque) y no suena lo que toca, se pone
function vigilaMusica() {
  if (!AC || !M.bus || (M.trk && M.trk.once)) return;
  if (M.name !== MUSICA) musicSet(MUSICA);
}
function cambiaSonido() { AUDIO.mudo = !AUDIO.mudo; try { localStorage.setItem('rouflage-mudo', AUDIO.mudo ? '1' : '0'); } catch (_) { /* sin guardar */ } applyVolume(); if (!AUDIO.mudo) { audioInit(); play('select'); } }
function cambiaMusica() { AUDIO.sinMusica = !AUDIO.sinMusica; try { localStorage.setItem('rouflage-sin-musica', AUDIO.sinMusica ? '1' : '0'); } catch (_) { /* sin guardar */ } applyVolume(); play('select'); }
