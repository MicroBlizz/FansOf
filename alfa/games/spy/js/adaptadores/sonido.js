// Fans of Spy · ADAPTADORES · Los sonidos y la música. Los efectos y la música son los archivos de Yoshi (snd/, mp3); cada efecto tiene además
// una versión de código (tone y noise del motor de core) que suena si el archivo aún no ha llegado o no se pudo leer: nunca se queda mudo.
// SPY.suena(nombre) toca un efecto. SPY.musica.actualiza() arranca, sube, baja o para la música según el ajuste y si la pestaña se ve.
// El audio arranca con el primer toque del jugador (lo pide el navegador).
'use strict';
SPY.suena = (() => {
  const sube = (notas, tipo, vol, paso) => notas.forEach((f, i) => tone(f, f, 0.12, tipo, vol, i * paso));
  // de código: el repuesto de cada efecto
  const REPUESTO = {
    spyPaso: () => { noise(0.04, 0.035, 900, 'lowpass'); },
    spyPuntillas: () => { tone(900, 700, 0.03, 'sine', 0.012); },
    spyPasoRobot: () => { tone(180, 140, 0.05, 'square', 0.02); },
    spyPatinete: () => { noise(0.09, 0.02, 2600, 'bandpass'); },
    spyCarta: () => { noise(0.05, 0.04, 4200, 'highpass'); tone(660, 880, 0.06, 'triangle', 0.04); },
    spyElige: () => { tone(520, 620, 0.05, 'triangle', 0.05); },
    spyNoVale: () => { tone(230, 170, 0.12, 'square', 0.04); },
    spySospecha: () => { tone(520, 740, 0.12, 'triangle', 0.06); tone(740, 740, 0.1, 'triangle', 0.05, 0.14); },
    spyAlerta: () => { for (let i = 0; i < 3; i++) tone(880, 660, 0.14, 'square', 0.07, i * 0.16); },
    spyCalma: () => { tone(660, 440, 0.2, 'sine', 0.05); tone(440, 330, 0.25, 'sine', 0.05, 0.15); },
    spyRuido: () => { noise(0.18, 0.08, 500, 'lowpass'); },
    spyToc: () => { tone(160, 120, 0.06, 'square', 0.08); tone(160, 120, 0.06, 'square', 0.08, 0.12); },
    spyCaja: () => { noise(0.14, 0.08, 700, 'lowpass'); tone(200, 120, 0.1, 'triangle', 0.05, 0.05); },
    spyDeja: () => { tone(700, 500, 0.06, 'sine', 0.05); },
    spySorbo: () => { noise(0.25, 0.03, 3000, 'bandpass'); },
    spyDerriba: () => { noise(0.2, 0.1, 400, 'lowpass'); tone(300, 90, 0.25, 'square', 0.06); },
    spyEsconde: () => { noise(0.2, 0.04, 1500, 'bandpass'); tone(400, 600, 0.12, 'sine', 0.04, 0.1); },
    spyDisparo: () => { tone(900, 300, 0.12, 'sawtooth', 0.06); },
    spyGolpe: () => { noise(0.12, 0.12, 900, 'lowpass'); tone(200, 80, 0.15, 'square', 0.08); },
    spyCura: () => sube([523, 659, 784], 'sine', 0.05, 0.07),
    spyBaraja: () => { for (let i = 0; i < 4; i++) noise(0.04, 0.04, 4000, 'highpass', i * 0.06); },
    spySecreto: () => sube([784, 988, 1175, 1568], 'triangle', 0.06, 0.07),
    spyVictoria: () => sube([523, 659, 784, 1046, 1318], 'triangle', 0.08, 0.11),
    spyCaido: () => sube([392, 330, 262, 196], 'sawtooth', 0.06, 0.16),
    spyRebobina: () => { tone(300, 1200, 0.35, 'sawtooth', 0.04); },
  };
  // el volumen de cada archivo respecto al altavoz común (los pasos, más flojos que un aviso)
  const VOL = { spyPaso: 0.5, spyPuntillas: 0.4, spyPasoRobot: 0.55, spyPatinete: 0.5, spyElige: 0.7, spyCarta: 0.8 };
  const ARCHIVOS = Object.keys(REPUESTO);
  const url = (n) => 'snd/' + n.toLowerCase() + '.mp3?v=' + SPY.AJ.version;
  for (const n of ARCHIVOS) {
    SONIDO_ARCHIVO.registra(n, url(n));
    SFX[n] = () => { if (!SONIDO_ARCHIVO.toca(n, { vol: VOL[n] || 0.9 })) REPUESTO[n](); };
  }
  Object.assign(THROTTLE, { spyPaso: 60, spyPuntillas: 60, spyPasoRobot: 70, spyPatinete: 90 });
  return (nombre) => { play(nombre); };
})();

// La música de sigilo: un mp3 en bucle. Suena en la partida y en los menús, a lo que diga el ajuste de música; se calla con la pestaña oculta.
SPY.musica = (() => {
  let audio = null, pedida = false;
  function crea() {
    audio = new Audio();
    audio.loop = true; audio.preload = 'auto';
    audio.addEventListener('error', () => { audio = null; pedida = true; });   // sin archivo, sin música: no se reintenta
    audio.src = 'snd/musica.mp3?v=' + SPY.AJ.version;
  }
  function actualiza() {
    if (pedida && !audio) return;
    const vol = Math.min(1, volMusica());
    const debeSonar = !sonidoApagado() && vol > 0 && !document.hidden;
    if (!audio) { if (!debeSonar) return; crea(); }
    audio.volume = vol;
    if (debeSonar && audio.paused) audio.play().catch(() => { /* aún sin toque del jugador: el siguiente lo intenta */ });
    else if (!debeSonar && !audio.paused) audio.pause();
  }
  document.addEventListener('visibilitychange', actualiza);
  for (const ev of ['pointerdown', 'keydown']) document.addEventListener(ev, actualiza, { capture: true });
  return { actualiza };
})();
