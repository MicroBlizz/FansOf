// Fans of Dungeons · SONIDO: usa el motor de sonido y las canciones de la serie (core/js/sistema/sonido.js y
// core/js/serie/canciones.js, los mismos que Fans of Rumble y Fans of Recruit; todo hecho con código, sin archivos). Aquí está
// lo que ese motor pide a cada juego (volumen y silencio), los efectos propios de la mazmorra y la canción de cada momento.
'use strict';

const SAVE = { menuMus: 'menu' };   // el motor lo mira al acabar las canciones cortas (victoria y derrota)
const SON = { on: true, musica: true };
const sonidoApagado = () => !SON.on;
const volGeneral = () => (SON.on ? 0.55 : 0);
const volMusica = () => (SON.musica ? 0.225 : 0);
// el motor usa estas dos para algunos efectos
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[(Math.random() * a.length) | 0];

function sonidoInicia() { audioInit(); }
function sonidoCambia(on) { SON.on = on; applyVolume(); if (on) audioInit(); }
function musicaCambia(on) { SON.musica = on; applyVolume(); }
const tono = (f0, f1, dur, tipo = 'square', vol = 0.15, cuando = 0) => tone(f0, f1, dur, tipo, vol, cuando);
const ruido = (dur, vol = 0.2, frec = 2000, cuando = 0, tipo = 'lowpass') => noise(dur, vol, frec, tipo, cuando);

// los efectos de la mazmorra: secos y graves
const SONIDOS = {
  paso: () => ruido(0.05, 0.05, 500),
  golpe: () => { tono(180, 70, 0.12, 'square', 0.12); ruido(0.08, 0.14, 900); },
  golpeEnemigo: () => { tono(130, 55, 0.14, 'sawtooth', 0.11); ruido(0.08, 0.1, 600); },
  disparo: () => { tono(700, 200, 0.12, 'sawtooth', 0.09); ruido(0.05, 0.08, 2600, 0, 'bandpass'); },
  dano: () => { tono(240, 90, 0.2, 'square', 0.12); ruido(0.12, 0.18, 500); },
  muerte: () => { tono(300, 35, 0.9, 'sawtooth', 0.14); ruido(0.6, 0.25, 400); ruido(0.4, 0.2, 250, 0.25); },
  explosion: () => { ruido(0.4, 0.3, 600); tono(110, 28, 0.4, 'sawtooth', 0.14); },
  explosionGrande: () => { ruido(0.8, 0.38, 450); tono(80, 22, 0.8, 'sawtooth', 0.18); tono(55, 20, 1, 'sine', 0.25, 0.1); },
  moneda: () => { tono(988, 988, 0.05, 'square', 0.05); tono(1319, 1319, 0.1, 'square', 0.05, 0.05); },
  coger: () => tono(400, 700, 0.1, 'square', 0.06),
  cofre: () => [392, 523, 659].forEach((f, i) => tono(f, f, 0.12, 'triangle', 0.08, i * 0.08)),
  puerta: () => { ruido(0.25, 0.14, 300); tono(90, 60, 0.25, 'sawtooth', 0.06); },
  escalera: () => { for (let i = 0; i < 5; i++) tono(220 + i * 70, 230 + i * 70, 0.1, 'triangle', 0.08, i * 0.08); },
  nivel: () => [392, 494, 587, 784].forEach((f, i) => tono(f, f, 0.14, 'square', 0.07, i * 0.07)),
  error: () => tono(160, 120, 0.15, 'square', 0.07),
  beber: () => { tono(260, 520, 0.08, 'sine', 0.1); tono(420, 700, 0.1, 'sine', 0.08, 0.1); },
  equipar: () => { ruido(0.08, 0.1, 1200); tono(400, 260, 0.1, 'square', 0.06, 0.05); },
  trampa: () => { tono(600, 150, 0.2, 'sawtooth', 0.1); ruido(0.15, 0.18, 1200); },
  curar: () => { tono(500, 800, 0.15, 'sine', 0.07); tono(700, 1000, 0.2, 'sine', 0.05, 0.1); },
  invocar: () => { tono(80, 400, 0.35, 'sawtooth', 0.09); ruido(0.25, 0.08, 2000); },
  jefe: () => { tono(70, 50, 0.6, 'sawtooth', 0.16); tono(140, 90, 0.5, 'square', 0.08, 0.1); },
  escudo: () => tono(1200, 700, 0.08, 'sine', 0.07),
  rotulo: () => tono(330, 440, 0.1, 'square', 0.05),
};
const ULTIMO_SON = {};
function sonido(n) {
  if (!AC || !SON.on || !SONIDOS[n]) return;
  const ahora = performance.now();
  if (ULTIMO_SON[n] && ahora - ULTIMO_SON[n] < 40) return;   // no se amontonan
  ULTIMO_SON[n] = ahora;
  SONIDOS[n]();
}

// la canción que toca ahora: la del menú en las pantallas; en la torre, una por zona; con un jefe cerca, la de jefe
const MUSICA_ZONA = { oficinas: 'olvidados', cementerio: 'nomuertos', foro: 'ciber', azotea: 'boss' };
let MUSICA = null;
function musica(n) { const T = n && TRACKS[n]; MUSICA = T && T.once ? null : n; if (AC && M.bus) musicSet(n); }
function musicaQueToca() {
  if (J.modo === 'fin') return null;
  if (J.modo === 'victoria') return null;
  if (!J.mapa || !J.heroe || (J.modo !== 'juego' && J.modo !== 'panel')) return 'menu';
  const jefe = J.enemigos.find(e => e.jefe && e.despierto);
  if (jefe) return J.planta >= PLANTA_FINAL ? 'boss11' : 'boss' + Math.min(10, Math.floor(J.planta / 4) * 3);
  return MUSICA_ZONA[J.mapa.zona] || 'menu';
}
// cada fotograma: si el audio ya está en marcha (hace falta un primer toque) y no suena lo que toca, se pone
function vigilaMusica() {
  const quiere = musicaQueToca();
  if (quiere !== MUSICA) { MUSICA = quiere; if (J.modo === 'fin') musica('lose'); else if (J.modo === 'victoria') musica('win'); }
  if (!AC || !M.bus || (M.trk && M.trk.once)) return;
  if (M.name !== MUSICA) musicSet(MUSICA);
}
