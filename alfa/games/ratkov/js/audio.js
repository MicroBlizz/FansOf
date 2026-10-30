// Fans of Ratkov · SONIDO: usa el motor de sonido y las canciones de la serie (core/js/sistema/sonido.js y core/js/serie/canciones.js;
// todo se crea con código, sin archivos). Aquí está lo que ese motor pide al juego (volumen y silencio), los efectos propios
// (cada arma suena distinta, recargar, registrar, la anomalía…), el viento que sube cuando llega la ventisca y qué canción suena.
'use strict';
const sonidoApagado = () => AJUSTES.mudo;
const volGeneral = () => (AJUSTES.mudo ? 0 : 0.55);
const volMusica = () => (AJUSTES.sinMusica ? 0 : 0.21);

Object.assign(SFX, {
  pistola: (v = 1) => { noise(0.07, 0.16 * v, 2200, 'bandpass'); tone(420, 120, 0.06, 'square', 0.05 * v); },
  metralleta: (v = 1) => { noise(0.05, 0.12 * v, 2600, 'bandpass'); tone(300, 110, 0.04, 'square', 0.04 * v); },
  escopeta: (v = 1) => { noise(0.22, 0.32 * v, 900); tone(140, 50, 0.18, 'sine', 0.22 * v); },
  fusil: (v = 1) => { noise(0.08, 0.2 * v, 1600, 'bandpass'); tone(220, 70, 0.08, 'sawtooth', 0.06 * v); },
  franco: (v = 1) => { noise(0.3, 0.3 * v, 1200); tone(1600, 160, 0.25, 'sawtooth', 0.06 * v); },
  silencio: () => { noise(0.05, 0.05, 4200, 'highpass'); },
  enemigo: () => noise(0.06, 0.07, 1800, 'bandpass'),
  minigun: () => { noise(0.04, 0.08, 2000, 'bandpass'); tone(160, 120, 0.04, 'square', 0.03); },
  vacio: () => tone(900, 900, 0.03, 'square', 0.05),
  recarga: () => { noise(0.05, 0.1, 3000, 'highpass'); noise(0.06, 0.1, 2400, 'highpass', 0.22); tone(500, 700, 0.05, 'square', 0.04, 0.3); },
  registra: () => { noise(0.08, 0.06, 1400, 'bandpass'); noise(0.08, 0.05, 1100, 'bandpass', 0.12); },
  aparece: () => tone(720, 960, 0.06, 'triangle', 0.05),
  coge: () => { tone(520, 780, 0.06, 'triangle', 0.07); noise(0.04, 0.05, 2000, 'bandpass'); },
  raro: () => { tone(1600, 1600, 0.06, 'square', 0.04); tone(1200, 1200, 0.06, 'square', 0.04, 0.07); tone(1900, 1900, 0.1, 'square', 0.04, 0.14); },
  impacto: () => noise(0.05, 0.08, 2600, 'bandpass'),
  carne: () => { noise(0.07, 0.12, 700); tone(160, 90, 0.06, 'sine', 0.1); },
  metal: () => { noise(0.05, 0.08, 4200, 'highpass'); tone(1800, 1400, 0.05, 'square', 0.03); },
  dolor: () => { noise(0.1, 0.18, 500); tone(240, 120, 0.12, 'sawtooth', 0.06); },
  esquiva: () => noise(0.14, 0.1, 1800, 'bandpass'),
  cura: () => { tone(500, 760, 0.16, 'sine', 0.06); tone(760, 1020, 0.18, 'sine', 0.05, 0.1); },
  bebe: () => { tone(300, 260, 0.1, 'sine', 0.06); tone(280, 240, 0.1, 'sine', 0.06, 0.14); },
  lanza: () => tone(500, 260, 0.15, 'triangle', 0.06),
  explota: () => { noise(0.8, 0.5, 520); tone(90, 32, 0.6, 'sine', 0.45); },
  lag: () => { for (let i = 0; i < 6; i++) tone(entre(200, 1800), 0, 0.03, 'square', 0.05, i * 0.035); },
  cuelgue: () => { tone(880, 880, 0.12, 'square', 0.06); tone(660, 660, 0.12, 'square', 0.06, 0.15); tone(440, 440, 0.3, 'square', 0.06, 0.3); },
  alarma: () => { tone(620, 620, 0.3, 'sawtooth', 0.05); tone(460, 460, 0.3, 'sawtooth', 0.05, 0.35); },
  salida: () => [392, 523, 659, 784].forEach((f, i) => tone(f, f, 0.2, 'triangle', 0.08, i * 0.1)),
  puerta: () => { noise(0.25, 0.12, 600); tone(140, 100, 0.25, 'square', 0.04); },
  compra: () => { tone(988, 988, 0.06, 'square', 0.05); tone(1319, 1319, 0.14, 'square', 0.05, 0.06); },
  fabrica: () => { noise(0.1, 0.08, 2500, 'bandpass'); noise(0.1, 0.08, 1500, 'bandpass', 0.12); tone(700, 1050, 0.14, 'triangle', 0.06, 0.26); },
  alerta: () => { tone(880, 1320, 0.08, 'square', 0.04); },
  bocina: () => { tone(98, 94, 1.1, 'sawtooth', 0.07); tone(147, 141, 1.1, 'sawtooth', 0.05); tone(98, 94, 0.7, 'sawtooth', 0.06, 1.3); },
});
Object.assign(THROTTLE, { metralleta: 50, fusil: 60, minigun: 45, enemigo: 60, impacto: 40, carne: 50, metal: 50, dolor: 200, registra: 300, aparece: 90, vacio: 200, alerta: 400 });

// la canción que debe sonar ahora (las cortas suenan una vez y sigue la del refugio)
let MUSICA = null;
function musica(n) {
  const T = TRACKS[n];
  MUSICA = T && T.once ? T.next === 'menu' ? SAVE.menuMus : T.next || null : n;
  if (AC && M.bus) musicSet(n);
}
function vigilaMusica() {
  if (!AC || !M.bus || (M.trk && M.trk.once)) return;
  if (M.name !== MUSICA) musicSet(MUSICA);
}
function cambiaSonido() { AJUSTES.mudo = !AJUSTES.mudo; guardaAjustes(); applyVolume(); if (!AJUSTES.mudo) { audioInit(); play('select'); } }
function cambiaMusica() { AJUSTES.sinMusica = !AJUSTES.sinMusica; guardaAjustes(); applyVolume(); play('select'); }

// ---------- el viento: un ruido que sopla siempre bajito y ruge cuando llega la ventisca ----------
const VIENTO = { s: null, g: null, f: null };
function vientoSuena(fuerza) {
  if (!AC || !master || !noiseBuf) return;
  if (!VIENTO.s) {
    try {
      VIENTO.s = AC.createBufferSource(); VIENTO.s.buffer = noiseBuf; VIENTO.s.loop = true;
      VIENTO.f = AC.createBiquadFilter(); VIENTO.f.type = 'bandpass'; VIENTO.f.Q.value = 0.7; VIENTO.f.frequency.value = 500;
      VIENTO.g = AC.createGain(); VIENTO.g.gain.value = 0; VIENTO.s.connect(VIENTO.f); VIENTO.f.connect(VIENTO.g); VIENTO.g.connect(master); VIENTO.s.start();
    } catch (e) { VIENTO.s = null; return; }
  }
  const t = AC.currentTime, f = sonidoApagado() ? 0 : fuerza;
  VIENTO.g.gain.setTargetAtTime(0.012 + 0.11 * f, t, 0.4);
  VIENTO.f.frequency.setTargetAtTime(380 + 900 * f + Math.sin(t * 0.7) * 120, t, 0.3);
}
function vientoCalla() { if (VIENTO.g && AC) VIENTO.g.gain.setTargetAtTime(0, AC.currentTime, 0.2); }
