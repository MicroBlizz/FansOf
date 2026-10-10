// Fans of Tactics Advance (prototipo) · SONIDO: usa el motor de sonido y las canciones de la serie (core/js/sistema/sonido.js y
// core/js/serie/canciones.js, los mismos que Fans of Rumble y Tácticas; todo se crea con código, sin archivos). Aquí está lo
// que ese motor pide a cada juego (volumen y silencio), la canción que toca en cada momento y los interruptores de Opciones.
'use strict';

const SAVE = { menuMus: null };   // el motor lo mira al acabar las canciones cortas (victoria y derrota)
const AUDIO = { mudo: false, sinMusica: false };
try { AUDIO.mudo = localStorage.getItem('fota-mudo') === '1'; AUDIO.sinMusica = localStorage.getItem('fota-sin-musica') === '1'; } catch (_) { /* sin guardar */ }
const sonidoApagado = () => AUDIO.mudo;
const volGeneral = () => (AUDIO.mudo ? 0 : 0.55);
const volMusica = () => (AUDIO.sinMusica ? 0 : 0.6);
// el motor usa estas dos para algunos efectos
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[(Math.random() * a.length) | 0];

// la canción que debe sonar ahora; las cortas (victoria, derrota) suenan una vez y luego siguen con la del menú
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
const musicaBatalla = () => (TUT ? 'animales' : NOMBRE_ESC === 'oficinas' ? 'boss0' : 'boss1');
function cambiaSonido() { AUDIO.mudo = !AUDIO.mudo; try { localStorage.setItem('fota-mudo', AUDIO.mudo ? '1' : '0'); } catch (_) { /* sin guardar */ } applyVolume(); if (!AUDIO.mudo) { audioInit(); play('select'); } }
function cambiaMusica() { AUDIO.sinMusica = !AUDIO.sinMusica; try { localStorage.setItem('fota-sin-musica', AUDIO.sinMusica ? '1' : '0'); } catch (_) { /* sin guardar */ } applyVolume(); play('select'); }
