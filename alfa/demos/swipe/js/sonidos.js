// Fans of Swipe · SONIDOS: los efectos hechos en Yoshi (snd/*.mp3, preparados con herramientas/comfyui/swipe/preparar.py)
// y, mientras no estén, unos de repuesto hechos con tone y noise del motor de core. La música es la de la serie
// (core/js/serie/canciones.js): la de espera del ascensor en la portada, la de los Animales Locos subiendo y la de jefe con el CEO.
'use strict';
const SW_SND = { buf: {}, pedidos: false };
const SW_ARCHIVOS = ['swipe', 'golpe', 'escudo', 'moneda', 'cofre', 'reliquia', 'muerte', 'dano'];
function swCargaSonidos() {
  if (SW_SND.pedidos || !AC) return;
  SW_SND.pedidos = true;
  for (const n of SW_ARCHIVOS) {
    fetch('snd/' + n + '.mp3').then(r => (r.ok ? r.arrayBuffer() : Promise.reject())).then(b => AC.decodeAudioData(b)).then(d => { SW_SND.buf[n] = d; }).catch(() => { /* aún no está: suena el de repuesto */ });
  }
}
function swArchivo(n, vol = 0.7, vel = 1) {
  const b = SW_SND.buf[n]; if (!b || !AC || sonidoApagado()) return false;
  const s = AC.createBufferSource(), g = AC.createGain(); s.buffer = b; s.playbackRate.value = vel; g.gain.value = vol;
  s.connect(g); g.connect(master); s.start();
  return true;
}
Object.assign(SFX, {
  swSwipe: () => { if (!swArchivo('swipe', 0.5, rand(0.95, 1.1))) noise(0.12, 0.08, 2600, 'bandpass'); },
  swGolpe: () => { if (!swArchivo('golpe', 0.8, rand(0.9, 1.1))) { noise(0.1, 0.16, 700); tone(180, 70, 0.12, 'square', 0.08); } },
  swEscudo: () => { if (!swArchivo('escudo', 0.6)) { tone(900, 1200, 0.08, 'triangle', 0.06); noise(0.15, 0.05, 6000, 'highpass'); } },
  swMoneda: () => { if (!swArchivo('moneda', 0.5)) { tone(988, 988, 0.06, 'square', 0.05); tone(1318, 1318, 0.12, 'square', 0.05, 0.06); } },
  swCofre: () => { if (!swArchivo('cofre', 0.7)) [523, 659, 784, 1046].forEach((f, i) => tone(f, f, 0.14, 'triangle', 0.07, i * 0.07)); },
  swReliquia: () => { if (!swArchivo('reliquia', 0.7)) [659, 880, 1175, 1568].forEach((f, i) => tone(f, f * 1.01, 0.18, 'sine', 0.06, i * 0.06)); },
  swMuerte: () => { if (!swArchivo('muerte', 0.8)) { noise(0.4, 0.15, 1200, 'bandpass'); tone(400, 60, 0.4, 'sawtooth', 0.06); } },
  swDano: () => { if (!swArchivo('dano', 0.8)) { tone(160, 60, 0.2, 'triangle', 0.14); noise(0.12, 0.1, 400); } },
  swCura: () => [523, 659, 784].forEach((f, i) => tone(f, f, 0.12, 'sine', 0.06, i * 0.05)),
  swCaos: () => { tone(300, 900, 0.18, 'sawtooth', 0.04); noise(0.15, 0.05, 3000, 'bandpass', 0.05); },
  swNoVale: () => tone(220, 160, 0.14, 'square', 0.05),
  swCombo: () => [784, 988, 1318, 1568].forEach((f, i) => tone(f, f, 0.1, 'square', 0.05, i * 0.05)),
  swHielo: () => { tone(1800, 2400, 0.2, 'sine', 0.05); noise(0.3, 0.06, 8000, 'highpass'); },
  swFrenesi: () => { noise(0.5, 0.2, 900); tone(110, 55, 0.5, 'sawtooth', 0.12); [523, 659, 784, 1046, 1318, 1568].forEach((f, i) => tone(f, f * 1.02, 0.12, 'square', 0.06, 0.08 + i * 0.045)); noise(0.6, 0.08, 6000, 'highpass', 0.1); },
  swAvivar: () => { tone(700, 1400, 0.08, 'square', 0.04); noise(0.1, 0.06, 2500, 'bandpass'); },
  swApaga: () => { noise(0.5, 0.08, 1500); tone(400, 150, 0.4, 'triangle', 0.05); },
  swTic: () => tone(1400, 1400, 0.03, 'square', 0.04),
  swPiso: () => { tone(392, 392, 0.1, 'triangle', 0.07); tone(523, 523, 0.16, 'triangle', 0.07, 0.1); },
});
Object.assign(THROTTLE, { swGolpe: 40, swSwipe: 40, swMoneda: 30 });

// la música que debe sonar: el bucle la pone en cuanto el audio arranca (el navegador espera al primer toque) y no corta las sintonías de final
const SW_MUS = { quiere: 'menu' };
function swMusica(nombre) { SW_MUS.quiere = nombre && TRACKS[nombre] ? nombre : 'menu'; }
function swSintonia(nombre) { if (AC && M.bus && TRACKS[nombre]) musicSet(nombre); }
function swMusicaBucle() {
  if (!AC || !M.bus) return;
  swCargaSonidos();
  if (M.trk && M.trk.once) return;
  if (M.name !== SW_MUS.quiere) musicSet(SW_MUS.quiere);
  M.tmT = SW_FX.frenesi ? 1.3 : 1;   // con el frenesí la música va más deprisa
}
