// Fans of Wings · Sonido: los mp3 de Yoshi que hay (audio/) si cargan; lo demás, pitidos sintetizados. Y la vibración del móvil.
'use strict';
var WINGS = globalThis.WINGS || (globalThis.WINGS = {});
(function (A) {
  const S = A.sonido = {}, AUDIO = {};
  let AC = null;

  S.cargar = function () {
    for (const n of ['misil', 'explosion']) {
      const a = new Audio(); a.preload = 'auto';
      a.addEventListener('canplaythrough', () => { AUDIO[n] = a; }, { once: true });
      a.addEventListener('error', () => { AUDIO[n] = null; });
      a.src = 'audio/' + n + '.mp3';
    }
  };
  const pita = S.pita = function (f, dura, tipo, sube, vol) {
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      const o = AC.createOscillator(), v = AC.createGain(), t = AC.currentTime;
      o.type = tipo || 'square'; o.frequency.setValueAtTime(f, t);
      if (sube) o.frequency.exponentialRampToValueAtTime(f * sube, t + dura);
      v.gain.setValueAtTime(vol || 0.1, t); v.gain.exponentialRampToValueAtTime(0.001, t + dura);
      o.connect(v).connect(AC.destination); o.start(t); o.stop(t + dura);
    } catch (err) { console.warn('Wings: sin sonido', err); }
  };
  const SINTE = {
    ametralladora: () => pita(900, 0.05, 'square', 0.4, 0.05),
    misil: () => pita(200, 0.5, 'sawtooth', 4, 0.1),
    explosion: () => { pita(90, 0.5, 'sawtooth', 0.3, 0.14); pita(50, 0.6, 'square', 0.5, 0.1); },
    fijado: () => { pita(1200, 0.08, 'square'); setTimeout(() => pita(1500, 0.1, 'square'), 110); },
    impacto: () => pita(300, 0.08, 'square', 0.6, 0.07),
    toque: () => pita(520, 0.06, 'square'),
    camara: () => pita(700, 0.08, 'triangle', 1.5),
    alarma: () => { for (let i = 0; i < 3; i++) setTimeout(() => pita(660, 0.18, 'square', 0.75, 0.1), i * 220); },
    fanfarria: () => [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => pita(f, 0.2, 'square'), i * 120)),
    premio: () => [660, 880, 1100].forEach((f, i) => setTimeout(() => pita(f, 0.08, 'square'), i * 70)),
    premioSuelto: () => pita(880, 0.1, 'triangle', 1.3),
    error: () => pita(160, 0.2, 'sawtooth', 0.6, 0.08),
  };
  S.sonar = function (n, vol) {
    const a = AUDIO[n];
    if (a) { try { const c = a.cloneNode(); c.volume = vol || 0.5; c.play().catch(() => {}); return; } catch (err) { console.warn('Wings: sin audio', err); } }
    if (SINTE[n]) SINTE[n]();
  };
  S.vibrar = function (ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (err) { console.warn('Wings: sin vibración', err); } };
})(WINGS);
