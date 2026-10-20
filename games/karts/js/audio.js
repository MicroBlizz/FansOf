// Fans of Karts (prototipo) · SONIDO: usa el motor de sonido y las canciones de la serie (core/js/sistema/sonido.js y
// core/js/serie/canciones.js, los mismos que Fans of Rumble; todo se crea con código, sin archivos). Aquí está lo que ese motor pide a
// cada juego (volumen y silencio), los efectos propios de las carreras, el ruido del motor del kart (dos osciladores que suben de tono
// con la velocidad) y qué canción suena en cada momento. Los ajustes que se guardan están en js/ajustes.js.
'use strict';

// SAVE (la canción del menú, que el motor mira al acabar las cortas) y AJUSTES están en js/ajustes.js
const sonidoApagado = () => AJUSTES.mudo;
const volGeneral = () => (AJUSTES.mudo ? 0 : 0.55);
const volMusica = () => (AJUSTES.sinMusica ? 0 : 0.25);
// rand y pick (que el motor de sonido usa) vienen de core/js/sistema/utiles.js

Object.assign(SFX, {
  moneda: () => { tone(988, 988, 0.06, 'square', 0.05); tone(1319, 1319, 0.16, 'square', 0.05, 0.06); },
  ruleta: () => { for (let i = 0; i < 9; i++) tone(520 + (i % 3) * 140, 0, 0.05, 'square', 0.04, i * 0.13); },
  premio: () => { tone(784, 784, 0.08, 'triangle', 0.09); tone(1175, 1175, 0.2, 'triangle', 0.09, 0.08); },
  turbo: () => { noise(0.5, 0.2, 1400, 'bandpass'); tone(180, 620, 0.45, 'sawtooth', 0.08); },
  miniturbo: () => { tone(420, 1100, 0.2, 'square', 0.07); noise(0.2, 0.1, 2600, 'highpass'); },
  chispa: (n = 1) => tone(n === 2 ? 1500 : 1100, n === 2 ? 1900 : 1400, 0.09, 'square', 0.05),
  bote: () => tone(260, 520, 0.09, 'triangle', 0.09),
  aterriza: () => { noise(0.12, 0.16, 500); tone(140, 70, 0.1, 'sine', 0.16); },
  choque: () => { noise(0.14, 0.26, 700); tone(110, 55, 0.14, 'sine', 0.22); },
  golpe: () => { noise(0.08, 0.16, 1500, 'bandpass'); tone(200, 120, 0.08, 'square', 0.06); },
  resbala: () => { tone(900, 300, 0.4, 'sine', 0.08); noise(0.3, 0.06, 3000, 'highpass'); },
  trompo: () => { tone(700, 180, 0.55, 'sawtooth', 0.08); noise(0.4, 0.14, 900); },
  nerfeado: () => { tone(620, 130, 0.5, 'square', 0.07); tone(310, 65, 0.5, 'square', 0.05, 0.05); },
  caida: () => tone(880, 110, 0.8, 'triangle', 0.12),
});
Object.assign(THROTTLE, { moneda: 40, choque: 160, golpe: 140, chispa: 60, turbo: 250, bote: 80 });

// la canción que debe sonar ahora; las cortas (victoria, derrota) suenan una vez y luego sigue la del menú
let MUSICA = null;
function musica(n) {
  const T = TRACKS[n];
  MUSICA = T && T.once ? T.next === 'menu' ? SAVE.menuMus : T.next || null : n;
  if (AC && M.bus) musicSet(n);
}
// cada fotograma: si el audio ya está en marcha (hace falta un primer toque) y no suena lo que toca, se pone
function vigilaMusica() {
  if (!AC || !M.bus || (M.trk && M.trk.once)) return;
  if (M.name !== MUSICA) musicSet(MUSICA);
}
function cambiaSonido() { AJUSTES.mudo = !AJUSTES.mudo; guardaAjustes(); applyVolume(); if (!AJUSTES.mudo) { audioInit(); play('select'); } }
function cambiaMusica() { AJUSTES.sinMusica = !AJUSTES.sinMusica; guardaAjustes(); applyVolume(); play('select'); }

// ---------- el motor del kart: un zumbido que sube con la velocidad (y un silbido de neumático al derrapar) ----------
const MOTOR = { o1: null, o2: null, f: null, g: null, r: null, rg: null };
function motorSuena(k, activo) {
  if (!AC || !master) return;
  if (!MOTOR.o1) {
    try {
      MOTOR.o1 = AC.createOscillator(); MOTOR.o2 = AC.createOscillator(); MOTOR.f = AC.createBiquadFilter(); MOTOR.g = AC.createGain();
      MOTOR.o1.type = 'sawtooth'; MOTOR.o2.type = 'square'; MOTOR.o2.detune.value = 9; MOTOR.f.type = 'lowpass'; MOTOR.g.gain.value = 0;
      MOTOR.o1.connect(MOTOR.f); MOTOR.o2.connect(MOTOR.f); MOTOR.f.connect(MOTOR.g); MOTOR.g.connect(master); MOTOR.o1.start(); MOTOR.o2.start();
      MOTOR.r = AC.createBufferSource(); MOTOR.r.buffer = noiseBuf; MOTOR.r.loop = true; const rf = AC.createBiquadFilter(); rf.type = 'bandpass'; rf.frequency.value = 2600; rf.Q.value = 3;
      MOTOR.rg = AC.createGain(); MOTOR.rg.gain.value = 0; MOTOR.r.connect(rf); rf.connect(MOTOR.rg); MOTOR.rg.connect(master); MOTOR.r.start();
    } catch (e) { MOTOR.o1 = null; return; }
  }
  const t = AC.currentTime;
  if (!activo || !k || sonidoApagado()) { MOTOR.g.gain.setTargetAtTime(0, t, 0.05); MOTOR.rg.gain.setTargetAtTime(0, t, 0.05); return; }
  const vr = Math.min(1.4, Math.abs(k.v) / k.vmax), f = 52 + 120 * vr + (k.tTurbo > 0 ? 34 : 0) + (k.z > 0 ? 22 : 0);
  MOTOR.o1.frequency.setTargetAtTime(f, t, 0.05); MOTOR.o2.frequency.setTargetAtTime(f * 0.5, t, 0.05);
  MOTOR.f.frequency.setTargetAtTime(420 + 1500 * vr, t, 0.08);
  MOTOR.g.gain.setTargetAtTime(k.estado === 'cae' ? 0 : 0.035 + 0.045 * Math.min(1, vr), t, 0.08);
  MOTOR.rg.gain.setTargetAtTime(k.derrape || k.tResbala > 0 ? 0.05 : k.suelo === S_LENTO && k.v > 30 ? 0.02 : 0, t, 0.04);
}
