// Fans of Roguelite (prototipo) · Sonido de 8 bits hecho con código: golpes, monedas, láser, sirena, fanfarria y una
// musiquilla para el camino y otra para el jefe. Empieza al primer toque (los navegadores no dejan sonar antes).
'use strict';

const SON = { ctx: null, on: true, master: null, musica: null, paso: 0, siguiente: 0, temp: null };
try { SON.on = localStorage.getItem('fansof-roguelite-sonido') !== '0'; } catch (e) { /* sin guardar */ }

function sonidoInicia() {
  if (SON.ctx) { if (SON.ctx.state === 'suspended') SON.ctx.resume(); return; }
  try {
    SON.ctx = new (window.AudioContext || window.webkitAudioContext)();
    SON.master = SON.ctx.createGain(); SON.master.gain.value = SON.on ? 0.5 : 0; SON.master.connect(SON.ctx.destination);
    SON.ruido = SON.ctx.createBuffer(1, SON.ctx.sampleRate, SON.ctx.sampleRate);
    const d = SON.ruido.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    SON.temp = setInterval(tocaMusica, 40);
  } catch (e) { SON.ctx = null; }
}
function sonidoCambia() {
  SON.on = !SON.on;
  try { localStorage.setItem('fansof-roguelite-sonido', SON.on ? '1' : '0'); } catch (e) { /* sin guardar */ }
  if (SON.master) SON.master.gain.value = SON.on ? 0.5 : 0;
}
function tono(f0, f1, dur, tipo = 'square', vol = 0.15, cuando = 0) {
  const c = SON.ctx; if (!c) return;
  const t = c.currentTime + cuando, o = c.createOscillator(), g = c.createGain();
  o.type = tipo; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); g.connect(SON.master); o.start(t); o.stop(t + dur + 0.02);
}
function ruido(dur, vol = 0.2, frec = 2000, cuando = 0, tipo = 'lowpass') {
  const c = SON.ctx; if (!c) return;
  const t = c.currentTime + cuando, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
  s.buffer = SON.ruido; f.type = tipo; f.frequency.value = frec;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  s.connect(f); f.connect(g); g.connect(SON.master); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
}
const SONIDOS = {
  golpe: () => { ruido(0.09, 0.35, 1800); tono(240, 80, 0.1, 'square', 0.18); },
  critico: () => { ruido(0.16, 0.45, 3000); tono(520, 90, 0.18, 'square', 0.2); tono(1040, 300, 0.12, 'square', 0.08); },
  herida: () => { ruido(0.1, 0.3, 1200); tono(300, 60, 0.16, 'sawtooth', 0.14); },
  zas: () => ruido(0.1, 0.18, 5000, 0, 'highpass'),
  carga: () => tono(180, 420, 0.12, 'triangle', 0.14),
  cargaLaser: () => tono(300, 1600, 0.28, 'sawtooth', 0.06),
  laser: () => { tono(1800, 200, 0.22, 'sawtooth', 0.1); tono(900, 120, 0.22, 'square', 0.06); },
  salto: () => tono(260, 1100, 0.28, 'square', 0.12),
  cae: () => tono(1200, 200, 0.14, 'square', 0.1),
  boom: () => { ruido(0.6, 0.5, 600); tono(140, 30, 0.5, 'square', 0.2); },
  moneda: () => { tono(988, 988, 0.05, 'square', 0.08); tono(1319, 1319, 0.14, 'square', 0.08, 0.05); },
  nivel: () => [523, 659, 784, 1047].forEach((f, i) => tono(f, f, 0.12, 'square', 0.1, i * 0.08)),
  elige: () => { tono(660, 660, 0.05, 'square', 0.1); tono(990, 990, 0.08, 'square', 0.1, 0.05); },
  toque: () => tono(880, 700, 0.04, 'square', 0.06),
  paso: () => ruido(0.03, 0.04, 700),
  mordisco: () => { ruido(0.05, 0.3, 2500); ruido(0.05, 0.3, 2500, 0.07); },
  rasca: () => ruido(0.05, 0.12, 4000, 0, 'highpass'),
  bloqueo: () => { tono(880, 880, 0.08, 'triangle', 0.15); tono(1760, 1760, 0.16, 'triangle', 0.1, 0.06); },
  sirena: () => { for (let i = 0; i < 2; i++) { tono(600, 900, 0.22, 'square', 0.08, i * 0.44); tono(900, 600, 0.22, 'square', 0.08, i * 0.44 + 0.22); } },
  silbido: () => tono(1500, 400, 0.4, 'sine', 0.08),
  alerta: () => { tono(1200, 1200, 0.05, 'square', 0.08); tono(1600, 1600, 0.08, 'square', 0.08, 0.06); },
  voz: () => { for (let i = 0; i < 4; i++) tono(300 + Math.random() * 300, 200 + Math.random() * 200, 0.05, 'square', 0.05, i * 0.07); },
  caida: () => tono(700, 90, 0.5, 'square', 0.1),
  victoria: () => [523, 523, 523, 659, 784, 659, 784, 1047].forEach((f, i) => tono(f, f, i === 7 ? 0.5 : 0.11, 'square', 0.1, [0, 0.12, 0.24, 0.36, 0.6, 0.84, 0.96, 1.08][i])),
  derrota: () => [392, 370, 349, 330].forEach((f, i) => tono(f, f * 0.98, 0.3, 'square', 0.1, i * 0.3)),
  dia: () => [784, 988, 1175].forEach((f, i) => tono(f, f, 0.1, 'triangle', 0.12, i * 0.09)),
};
function sonido(n) { if (SON.ctx && SON.on && SONIDOS[n]) SONIDOS[n](); }

// la música: 32 corcheas que se repiten (melodía, bajo y platillo)
const PISTAS = {
  viaje: { bpm: 138, mel: [72, 0, 76, 0, 79, 0, 76, 0, 74, 0, 77, 0, 81, 0, 77, 0, 76, 0, 79, 0, 84, 0, 79, 0, 77, 76, 74, 72, 74, 0, 0, 0], bajo: [48, 55, 50, 57, 52, 59, 53, 55] },
  jefe: { bpm: 156, mel: [69, 0, 72, 0, 76, 0, 72, 0, 71, 0, 74, 0, 77, 0, 74, 0, 69, 72, 76, 81, 80, 0, 76, 0, 77, 76, 74, 71, 72, 0, 71, 0], bajo: [45, 52, 47, 54, 45, 52, 44, 52] },
};
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
function musica(n) { SON.musica = n; SON.paso = 0; if (SON.ctx) SON.siguiente = SON.ctx.currentTime + 0.05; }
function tocaMusica() {
  const c = SON.ctx, P = PISTAS[SON.musica];
  if (!c || !P || !SON.on) return;
  const corchea = 60 / P.bpm / 2;
  if (SON.siguiente < c.currentTime) SON.siguiente = c.currentTime + 0.02;
  while (SON.siguiente < c.currentTime + 0.12) {
    const i = SON.paso % 32, cuando = SON.siguiente - c.currentTime, m = P.mel[i];
    if (m) tono(hz(m), hz(m), corchea * 0.9, 'square', 0.035, cuando);
    if (i % 4 === 0) tono(hz(P.bajo[(i / 4) | 0]), hz(P.bajo[(i / 4) | 0]), corchea * 3.6, 'triangle', 0.09, cuando);
    if (i % 2 === 1) ruido(0.03, 0.03, 8000, cuando, 'highpass');
    SON.paso++; SON.siguiente += corchea;
  }
}
