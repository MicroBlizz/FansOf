// Fans of Asalto · ADAPTADORES · Los sonidos: los efectos propios, hechos con tone y noise del motor de core (sin archivos), y qué
// música suena en cada momento (las canciones de la serie, core/js/serie/canciones.js). AS.suena(nombre) toca un efecto.
'use strict';
AS.suena = (() => {
  const sube = (notas, tipo, vol, paso) => notas.forEach((f, i) => tone(f, f, 0.1, tipo || 'triangle', vol || 0.07, i * (paso || 0.05)));
  Object.assign(SFX, {
    asClic: () => { tone(520, 620, 0.05, 'triangle', 0.06); },
    asNoVale: () => { tone(230, 170, 0.12, 'square', 0.05); },
    asGira: () => { noise(0.05, 0.03, 3200, 'bandpass'); },
    asPara: n => { tone(300 + n * 90, 280 + n * 90, 0.07, 'square', 0.06); noise(0.05, 0.05, 1800, 'lowpass'); },
    asLinea: n => sube([523, 659, 784, 1046].map(f => f * (1 + n * 0.12)), 'triangle', 0.08),
    asInvoca: () => { tone(300, 900, 0.22, 'sine', 0.07); noise(0.2, 0.04, 6000, 'highpass', 0.05); tone(1318, 1318, 0.12, 'triangle', 0.06, 0.2); },
    asEmpuja: () => { noise(0.1, 0.07, 900, 'lowpass'); tone(200, 260, 0.08, 'square', 0.05); },
    asAbsorbe: () => { tone(400, 1200, 0.25, 'sine', 0.07); sube([784, 988, 1318], 'triangle', 0.06, 0.07); },
    asAsciende: () => { sube([523, 659, 784, 1046, 1318, 1568], 'triangle', 0.09, 0.07); noise(0.5, 0.05, 7000, 'highpass', 0.1); },
    asPremio: n => { sube([659, 784, 988, 1318], 'square', 0.06, 0.06); tone(1568 + n * 100, 1568 + n * 100, 0.2, 'triangle', 0.08, 0.26); },
    asGordo: () => { for (let i = 0; i < 12; i++) tone(523 * Math.pow(1.122, i), 523 * Math.pow(1.122, i), 0.12, 'triangle', 0.08, i * 0.06); noise(0.9, 0.06, 8000, 'highpass', 0.2); },
    asMoneda: () => { tone(1200, 1700, 0.05, 'square', 0.04); tone(1800, 1800, 0.06, 'triangle', 0.04, 0.04); },
    asEspada: () => { noise(0.06, 0.07, 3800, 'highpass'); tone(260, 140, 0.06, 'square', 0.04); },
    asFlecha: () => { noise(0.08, 0.04, 6000, 'highpass'); tone(900, 1400, 0.05, 'sine', 0.03); },
    asMagia: () => { tone(700, 1200, 0.16, 'sine', 0.05); tone(1400, 900, 0.12, 'triangle', 0.03, 0.05); },
    asBomba: () => { noise(0.35, 0.14, 420); tone(140, 50, 0.3, 'triangle', 0.1); },
    asCura: () => sube([784, 988, 1318], 'sine', 0.04),
    asCritico: () => { noise(0.1, 0.1, 2400, 'bandpass'); tone(880, 440, 0.12, 'square', 0.06); },
    asMuere: () => { tone(330, 110, 0.25, 'square', 0.05); noise(0.15, 0.05, 800); },
    asEscudo: () => { tone(600, 900, 0.12, 'triangle', 0.05); tone(900, 900, 0.1, 'sine', 0.04, 0.08); },
    asCruza: () => { tone(180, 90, 0.4, 'sawtooth', 0.09); noise(0.3, 0.08, 500); },
    asCofre: () => { sube([659, 784, 988, 1318], 'triangle', 0.08, 0.06); noise(0.4, 0.05, 7000, 'highpass', 0.1); },
    asLucha: () => { [392, 392, 523].forEach((f, i) => tone(f, f, 0.1, 'square', 0.06, i * 0.1)); noise(0.3, 0.06, 1800, 'bandpass', 0.2); },
    asCarga: () => { tone(294, 294, 0.12, 'sawtooth', 0.05); tone(392, 392, 0.22, 'sawtooth', 0.06, 0.12); noise(0.15, 0.04, 1200, 'bandpass', 0.1); },
    asAviso: () => { tone(880, 880, 0.08, 'square', 0.05); tone(880, 880, 0.08, 'square', 0.05, 0.14); },
    asCae: () => { noise(0.45, 0.16, 300); tone(110, 40, 0.4, 'triangle', 0.12); },
    asJefe: () => { tone(70, 50, 1.1, 'sawtooth', 0.12); noise(0.9, 0.1, 240); tone(140, 100, 0.8, 'square', 0.05, 0.2); },
    asCasi: () => { tone(523, 523, 0.07, 'triangle', 0.06); tone(659, 659, 0.07, 'triangle', 0.06, 0.07); tone(700, 520, 0.16, 'triangle', 0.06, 0.14); },
    asRacha: n => sube([659, 784, 988, 1175].map(f => f * (1 + Math.min(n, 6) * 0.06)), 'square', 0.05, 0.045),
    asMision: () => { sube([523, 659, 784, 1046, 1318], 'triangle', 0.08, 0.06); tone(1568, 1568, 0.25, 'sine', 0.06, 0.32); },
    asCombo: n => { tone(500 + Math.min(n, 10) * 70, 700 + Math.min(n, 10) * 70, 0.07, 'square', 0.05); },
    asFuria: () => { tone(200, 600, 0.3, 'sawtooth', 0.08); noise(0.3, 0.08, 1400, 'bandpass'); },
  });
  Object.assign(THROTTLE, { asEspada: 45, asFlecha: 45, asMagia: 60, asBomba: 80, asCura: 90, asMuere: 60, asEscudo: 150, asCritico: 80, asMoneda: 40, asGira: 60, asCombo: 50 });

  const MUS = { quiere: 'menu' };
  const suena = (nombre, ...a) => { play('as' + nombre[0].toUpperCase() + nombre.slice(1), ...a); };
  // la música que debe sonar: el bucle la pone en cuanto el audio arranca (el navegador espera al primer toque) y no corta las sintonías
  suena.musica = nombre => { MUS.quiere = nombre && TRACKS[nombre] ? nombre : 'menu'; };
  suena.sintonia = nombre => { if (AC && M.bus && TRACKS[nombre]) musicSet(nombre); };
  suena.bucle = () => {
    if (!AC || !M.bus || (M.trk && M.trk.once)) return;
    if (M.name !== MUS.quiere) musicSet(MUS.quiere);
    M.tmT = 1;
  };
  return suena;
})();
