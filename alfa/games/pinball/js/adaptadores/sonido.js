// Fans of Pinball · adaptador · SONIDO Y VIBRACIÓN (MOVIL.md, apartado 5): efectos hechos por código con el altavoz de core (tone y noise,
// sin archivos), con freno por efecto (muchos choques no saturan) y el tono que sube con el combo (★3: +1 semitono por paso, tope 12);
// el golpe fuerte lleva su sonido grave. Vibración con navigator.vibrate dentro de try, una cada 60 ms como mucho (★6), y los dos
// interruptores guardados en la partida (opciones.sonido y opciones.vibracion). Al ocultarse la página, el audio se suspende.
// Las cuatro funciones sueltas del final son las que pide por su nombre el motor de sonido de core (como en Tiny).
'use strict';
PB.creaSonido = ({ sesion, reglas, jugo }) => {
  const puede = () => typeof tone === 'function' && typeof noise === 'function' && typeof AC !== 'undefined' && AC;
  const st = n => Math.pow(2, Math.min(jugo.combo.semitonoTope, n) / 12);
  // cada sonido: (semitonos) → llamadas a tone(f0, f1, s, onda, vol, retraso) y noise(s, vol, frecuencia, filtro, retraso)
  const SONIDOS = {
    golpe: k => tone(520 * st(k), 700 * st(k), 0.05, 'square', 0.12),
    fuerte: () => { tone(140, 60, 0.16, 'sawtooth', 0.26); noise(0.08, 0.25, 500, 'lowpass'); },
    pala: () => tone(180, 120, 0.04, 'square', 0.1),
    seta: k => tone(880 * st(k), 1320 * st(k), 0.06, 'triangle', 0.14),
    rompe: k => { noise(0.08, 0.2, 1400, 'bandpass'); tone(400 * st(k), 200 * st(k), 0.07, 'square', 0.1); },
    cofre: () => { [784, 988, 1175, 1568].forEach((f, i) => tone(f, f, 0.08, 'triangle', 0.16, i * 0.05)); },
    vence: k => { noise(0.1, 0.22, 900, 'lowpass'); tone(330 * st(k), 110, 0.14, 'sawtooth', 0.14); },
    pierde: () => { [392, 330, 262].forEach((f, i) => tone(f, f * 0.9, 0.14, 'sawtooth', 0.16, i * 0.11)); },
    caos: () => { [262, 330, 392, 523, 659].forEach((f, i) => tone(f, f * 1.02, 0.1, 'square', 0.16, i * 0.05)); noise(0.3, 0.15, 3000, 'highpass'); },
    escalera: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, f, 0.12, 'triangle', 0.18, i * 0.07)); },
    abierta: () => { tone(300, 600, 0.2, 'square', 0.14); tone(600, 900, 0.2, 'square', 0.12, 0.15); },
    explosion: () => { noise(0.3, 0.35, 300, 'lowpass'); tone(90, 40, 0.3, 'sine', 0.3); },
    aviso: () => { tone(880, 880, 0.08, 'square', 0.14); tone(880, 880, 0.08, 'square', 0.14, 0.15); },
    hielo: () => { noise(0.15, 0.2, 4000, 'highpass'); tone(1200, 600, 0.15, 'sine', 0.14); },
    jefe: () => { tone(110, 55, 0.6, 'sawtooth', 0.26); noise(0.5, 0.3, 200, 'lowpass'); },
    mejora: () => { tone(659, 988, 0.14, 'triangle', 0.2); tone(988, 1319, 0.16, 'triangle', 0.16, 0.1); },
    boton: () => tone(520, 620, 0.06, 'square', 0.12),
    ficha: () => tone(1320, 1760, 0.05, 'triangle', 0.1),
    pelos: () => tone(200, 800, 0.5, 'sine', 0.2),
    fin: () => { [523, 392, 330, 262].forEach((f, i) => tone(f, f, 0.18, 'triangle', 0.18, i * 0.14)); },
  };
  const ultimo = {};
  let ultimaVibra = 0;
  const op = () => sesion.datos.opciones;
  function guarda(cambio) { Object.assign(op(), cambio); sesion.guarda(); if (typeof applyVolume === 'function') applyVolume(); }
  const yo = {
    toca(nombre, semitonos = 0) {
      const f = SONIDOS[nombre], ahora = performance.now();
      if (!f || !op().sonido || !puede() || ahora - (ultimo[nombre] || 0) < (reglas.freno[nombre] || 0)) return false;
      ultimo[nombre] = ahora;
      f(semitonos);
      return true;
    },
    vibra(patron) {
      const ahora = performance.now();
      if (!op().vibracion || ahora - ultimaVibra < jugo.vibra.minimo) return;
      ultimaVibra = ahora;
      try { if (navigator.vibrate) navigator.vibrate(patron); } catch (e) { /* el navegador no deja vibrar: se juega igual */ }
    },
    get apagado() { return !op().sonido; },
    get sinVibrar() { return !op().vibracion; },
    alterna() { guarda({ sonido: !op().sonido }); },
    alternaVibrar() { guarda({ vibracion: !op().vibracion }); },
    // el primer toque de la página despierta el audio (no en click: MOVIL.md)
    despierta() { if (typeof audioInit === 'function') audioInit(); },
    suspende() { if (puede() && AC.state === 'running') AC.suspend().catch(() => null); },
    reanuda() { if (puede() && AC.state === 'suspended') AC.resume().catch(() => null); },
  };
  return yo;
};
function sonidoApagado() { return Boolean(PB.sonido && PB.sonido.apagado); }
function volGeneral() { return sonidoApagado() ? 0 : AJUSTES.sonido.volumen; }
function volMusica() { return 0; }
function musicUpdate() { /* el prototipo no tiene música */ }
