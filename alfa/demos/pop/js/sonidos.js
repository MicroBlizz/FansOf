// Fans of Pop · SONIDOS: los efectos hechos en Yoshi (snd/*.mp3, preparados con herramientas/comfyui/pop/preparar.py) y, mientras
// no estén, unos de repuesto con tone y noise del motor de core. El pop lleva un tono distinto cada vez (como el juguete de verdad)
// y además vibra el móvil (ppVibra). Sin música en el prototipo: el pop-it es calma.
'use strict';
const PP_SND = { buf: {}, pedidos: false };
const PP_ARCHIVOS = ['pop', 'unpop', 'rescate', 'sala', 'dano', 'victoria', 'derrota'];
function ppCargaSonidos() {
  if (PP_SND.pedidos || !AC) return;
  PP_SND.pedidos = true;
  for (const n of PP_ARCHIVOS) {
    fetch('snd/' + n + '.mp3').then(r => (r.ok ? r.arrayBuffer() : Promise.reject())).then(b => AC.decodeAudioData(b)).then(d => { PP_SND.buf[n] = d; }).catch(() => { /* aún no está: suena el de repuesto */ });
  }
}
function ppArchivo(n, vol = 0.7, vel = 1) {
  const b = PP_SND.buf[n]; if (!b || !AC || sonidoApagado()) return false;
  const s = AC.createBufferSource(), g = AC.createGain(); s.buffer = b; s.playbackRate.value = vel; g.gain.value = vol;
  s.connect(g); g.connect(master); s.start();
  return true;
}
function ppVibra(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* sin vibración */ } }
Object.assign(SFX, {
  ppPop: (n = 0) => {
    const vel = 0.9 + ((n * 7) % 5) * 0.06;   // cada burbuja suena un poco distinta
    if (!ppArchivo('pop', 0.8, vel)) { tone(420 * vel, 160 * vel, 0.09, 'sine', 0.32); noise(0.05, 0.12, 2200, 'bandpass'); }
  },
  ppUnpop: (n = 0) => { const vel = 0.95 + ((n * 3) % 4) * 0.04; if (!ppArchivo('unpop', 0.45, vel)) tone(180 * vel, 320 * vel, 0.07, 'sine', 0.14); },
  ppRescate: () => { if (!ppArchivo('rescate', 0.7)) [659, 880, 1175, 1568].forEach((f, i) => tone(f, f * 1.02, 0.14, 'triangle', 0.07, i * 0.06)); },
  ppSala: () => { if (!ppArchivo('sala', 0.7)) [523, 659, 784, 1046].forEach((f, i) => tone(f, f, 0.16, 'triangle', 0.08, i * 0.08)); },
  ppDano: () => { if (!ppArchivo('dano', 0.8)) { tone(200, 70, 0.22, 'triangle', 0.16); noise(0.14, 0.1, 400); } },
  ppVictoria: () => { if (!ppArchivo('victoria', 0.8)) [523, 659, 784, 1046, 784, 1046, 1318].forEach((f, i) => tone(f, f, 0.18, 'square', 0.06, i * 0.1)); },
  ppDerrota: () => { if (!ppArchivo('derrota', 0.8)) [392, 349, 311, 262].forEach((f, i) => tone(f, f * 0.98, 0.3, 'triangle', 0.09, i * 0.22)); },
  ppPista: () => { tone(1200, 1800, 0.08, 'sine', 0.05); tone(1800, 1800, 0.1, 'sine', 0.05, 0.08); },
  ppCura: () => [523, 659, 784].forEach((f, i) => tone(f, f, 0.12, 'sine', 0.06, i * 0.05)),
  ppNodo: () => { tone(700, 900, 0.06, 'square', 0.05); },
});
Object.assign(THROTTLE, { ppPop: 25, ppUnpop: 25 });
