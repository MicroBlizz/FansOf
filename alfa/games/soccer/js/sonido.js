// Fans of Soccer · Sonido: usa el altavoz de la serie (tone, noise, SFX, play y applyVolume de core/js/sistema/sonido.js), sin archivos.
// Aquí están el volumen del jugador (cuatro niveles: alto, medio, bajo y silencio; lo guarda principal.js), las notas sueltas
// de los menús y los efectos propios del fútbol (chute, barrida, golpes, pitidos del árbitro y la red), que principal.js toca
// con play('nombre'). Sin música todavía (paso A4 de la hoja de ruta).
'use strict';
var SOCCER = globalThis.SOCCER || (globalThis.SOCCER = {});
(function (S) {
  const NIVELES = [1, 0.6, 0.3, 0];
  const SN = S.sonido = { nivel: 0, niveles: NIVELES.length };

  SN.volumen = () => NIVELES[SN.nivel];
  const avisar = () => { if (typeof applyVolume === 'function') applyVolume(); };
  // El nivel guardado: si no es uno de los cuatro, se queda el alto.
  SN.poner = (i) => { SN.nivel = Number.isInteger(i) && i >= 0 && i < NIVELES.length ? i : 0; avisar(); };
  SN.siguiente = () => { SN.poner((SN.nivel + 1) % NIVELES.length); return SN.nivel; };

  const listo = () => typeof AC !== 'undefined' && AC && SN.volumen() > 0;
  // Una nota: f hercios durante `dura` segundos; `sube` multiplica el tono al final (0.5 = baja una octava).
  SN.nota = (f, dura, tipo, sube, retraso) => {
    if (!listo()) return;
    tone(f, sube ? f * sube : f, dura, tipo || 'square', 0.1, retraso || 0);
  };

  // Silbato de árbitro: un trino rápido entre dos tonos agudos más el soplido. `dura` en segundos, `desde` es el retraso.
  function silbato(dura, desde) {
    const paso = 0.03, n = Math.round(dura / paso);
    for (let k = 0; k < n; k++) { const f = k % 2 ? 3000 : 2750; tone(f, f, paso + 0.01, 'square', 0.035, desde + k * paso); }
    noise(dura, 0.03, 5000, 'highpass', desde);
  }
  // Golpe de cuerpo contra cuerpo o contra el suelo: `fuerza` de 0 a 1 sube el volumen y lo hace más grave.
  function cuerpo(fuerza, desde) {
    noise(0.1 + fuerza * 0.12, 0.18 + fuerza * 0.2, 520 - fuerza * 200, 'lowpass', desde);
    tone(150 - fuerza * 40, 50, 0.1 + fuerza * 0.12, 'sine', 0.2 + fuerza * 0.15, desde);
  }

  // Los efectos del fútbol, en el registro de la serie (como hacen Karts, Nova o Pop).
  SN.efectos = {
    chute: (fuerza = 0.6) => { noise(0.07, 0.2 + fuerza * 0.2, 650); tone(190, 55, 0.12, 'sine', 0.22 + fuerza * 0.15); },
    supertiro: () => { SFX.chute(1); tone(120, 720, 0.7, 'sawtooth', 0.07); noise(0.6, 0.08, 1800, 'bandpass', 0.05); },
    pase: () => { noise(0.04, 0.12, 900); tone(260, 140, 0.06, 'sine', 0.14); },
    barrida: () => { noise(0.34, 0.16, 1800, 'bandpass'); noise(0.26, 0.07, 4200, 'highpass', 0.04); },
    empujon: () => cuerpo(0.2, 0),
    derribo: () => cuerpo(0.6, 0),
    ko: () => { cuerpo(1, 0); [1568, 1319, 1047].forEach((f, i) => tone(f, f * 0.9, 0.09, 'triangle', 0.06, 0.18 + i * 0.09)); },
    silbato: () => silbato(0.35, 0),
    descanso: () => { silbato(0.25, 0); silbato(0.45, 0.35); },
    final: () => { silbato(0.25, 0); silbato(0.25, 0.35); silbato(0.7, 0.7); },
    red: () => { noise(0.45, 0.2, 3500, 'highpass'); noise(0.22, 0.28, 300); tone(95, 45, 0.28, 'sine', 0.28); },
    gol: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, f, 0.18, 'square', 0.08, 0.25 + i * 0.11)),
  };
  if (typeof SFX === 'object') Object.assign(SFX, SN.efectos);
  if (typeof THROTTLE === 'object') Object.assign(THROTTLE, { chute: 60, pase: 50, barrida: 120, empujon: 60, derribo: 60, ko: 200, red: 400 });
})(SOCCER);

// lo que pide el motor de sonido de la serie
function sonidoApagado() { return SOCCER.sonido.volumen() === 0; }
function volGeneral() { return SOCCER.sonido.volumen(); }
function volMusica() { return 0; }
function musicUpdate() { /* Soccer no tiene música todavía */ }
