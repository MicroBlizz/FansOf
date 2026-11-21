// Fans of Rally · adaptador · SONIDO Y MÚSICA: los efectos, hechos por código con el motor de core (tone y noise: sin archivos), el
// motor del coche (dos osciladores que suben de tono con la velocidad) y qué canción toca en cada pantalla (js/musica.js dice de qué
// juego sale cada una). Todo provisional hasta que lo haga Yoshi. Las funciones sueltas del final son las que pide core por su nombre.
'use strict';
RA.sonido = (() => {
  const puede = () => typeof tone === 'function' && typeof AC !== 'undefined' && AC;
  const SONIDOS = {
    boton: () => tone(520, 620, 0.05, 'square', 0.1),
    cuenta: () => tone(660, 660, 0.18, 'square', 0.16),
    salida: () => tone(1320, 1320, 0.45, 'square', 0.18),
    control: () => { [784, 988, 1319].forEach((f, i) => tone(f, f, 0.1, 'triangle', 0.18, i * 0.07)); },
    vuelta: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, f, 0.1, 'square', 0.13, i * 0.06)); },
    copiloto: () => tone(900, 1100, 0.05, 'triangle', 0.08),
    choque: () => { noise(0.18, 0.25, 500); tone(120, 60, 0.15, 'sawtooth', 0.14); },
    roce: () => { noise(0.08, 0.14, 1400, 'bandpass'); tone(220, 160, 0.06, 'square', 0.06); },
    derrape: () => noise(0.12, 0.06, 2600, 'bandpass'),
    tierra: () => noise(0.1, 0.05, 700, 'lowpass'),
    meta: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, f, 0.14, 'triangle', 0.18, i * 0.09)); },
    sinTiempo: () => { [392, 330, 262, 196].forEach((f, i) => tone(f, f * 0.9, 0.22, 'sawtooth', 0.16, i * 0.17)); },
  };
  let motor = null;
  function arrancaMotor() {
    if (!puede() || motor) return;
    const a = AC.createOscillator(), b = AC.createOscillator(), f = AC.createBiquadFilter(), g = AC.createGain();
    a.type = 'sawtooth'; b.type = 'square'; b.detune.value = 12; f.type = 'lowpass'; f.frequency.value = 520; g.gain.value = 0.045;
    a.connect(f); b.connect(f); f.connect(g); g.connect(master); a.start(); b.start();
    motor = { a, b, f, g };
  }
  // la velocidad en km/h y si el gas está pisado: el tono sube por marchas (cada marcha vuelve a bajar un poco)
  function motorA(kmh, gas) {
    if (!motor) return;
    const marcha = Math.min(5, Math.floor(kmh / 42)), dentro = (kmh - marcha * 42) / 42, hz = 46 + marcha * 9 + dentro * 55 + (gas ? 6 : 0);
    const t = AC.currentTime;
    motor.a.frequency.setTargetAtTime(hz, t, 0.05); motor.b.frequency.setTargetAtTime(hz * 0.5, t, 0.05);
    motor.g.gain.setTargetAtTime(gas ? 0.05 : 0.03, t, 0.1);
  }
  function paraMotor() {
    if (!motor) return;
    const m = motor; motor = null;
    m.g.gain.setTargetAtTime(0, AC.currentTime, 0.05);
    setTimeout(() => { try { m.a.stop(); m.b.stop(); m.g.disconnect(); } catch (e) { console.error(e); } }, 300);
  }
  const ultimo = {};
  function suena(nombre, cadaMs = 0) {
    if (!puede() || !SONIDOS[nombre]) return;
    const ahora = performance.now();
    if (cadaMs && ahora - (ultimo[nombre] || 0) < cadaMs) return;
    ultimo[nombre] = ahora; SONIDOS[nombre]();
  }
  return { suena, arrancaMotor, motorA, paraMotor, nombres: () => Object.keys(SONIDOS) };
})();

// la canción que quiere cada pantalla: la pone pantallas.js con RA.musica.quiere('…')
RA.musica = (() => {
  let quiere = 'raTitulo';
  return {
    quiere(n) { quiere = n; },
    // un final que suena una vez (raGana, raPierde) y luego vuelve solo la del menú
    jingle(n) { quiere = 'raTitulo'; if (typeof AC !== 'undefined' && AC && M.bus && TRACKS[n]) musicSet(n); },
    get actual() { return quiere; },
  };
})();
function sonidoApagado() { return false; }
function volGeneral() { return 1; }
function volMusica() { return 0.32; }
// qué canción toca: la llama principal.js cada poco
function musicUpdate() {
  if (typeof AC === 'undefined' || !AC || !M.bus || typeof TRACKS === 'undefined') return;
  const quiere = RA.musica.actual;
  if (M.name !== quiere && TRACKS[quiere] && !(M.trk && M.trk.once)) musicSet(quiere);
}
