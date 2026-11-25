// Fans of Pop · MEMORIA, LOS INSTRUMENTOS (tarea #141 fase 1): cada mundo suena con el suyo, hecho por código como la caja de música
// de siempre (js/sonidos.js): solo ondas suaves (seno y triángulo) con su envolvente, cortas y bonitas. Cada instrumento es una lista de
// parciales [multiplo de la nota, volumen, duración (s), onda] más su ataque, un deslizamiento de tono al empezar (`desliza`, el
// golpe del tambor o el pellizco del koto), un vibrato (`vib`, Hz de vaivén) y un filtro de graves (`filtro`, Hz). Qué instrumento
// tiene cada mundo lo dice PP_CFG.memoria.instrumentos.
'use strict';
const PP_INSTRUMENTOS = Object.freeze({
  // Jardín: la caja de música de siempre (la misma mezcla que ppCampana(f, 0, 0.13, 0.55))
  cajita: Object.freeze({ nombre: 'Caja de música', ataque: 0.006, parciales: [[1, 1, 0.55, 'sine'], [2, 0.35, 0.31, 'sine'], [3, 0.08, 0.21, 'sine']] }),
  // Pastelería: xilófono, seco y brillante (el 4.º armónico de la madera)
  xilofono: Object.freeze({ nombre: 'Xilófono', ataque: 0.003, parciales: [[1, 1, 0.28, 'sine'], [3.93, 0.3, 0.09, 'sine'], [9.2, 0.06, 0.04, 'sine']] }),
  // Heladería: campanillas, con armónicos de campana (no enteros) que tintinean
  campanillas: Object.freeze({ nombre: 'Campanillas', ataque: 0.004, parciales: [[1, 0.8, 0.7, 'sine'], [2.76, 0.35, 0.4, 'sine'], [5.4, 0.12, 0.2, 'sine']] }),
  // Playa: tambor de acero, que empieza un pelín alto y cae a su nota
  tambor: Object.freeze({ nombre: 'Tambor de acero', ataque: 0.005, desliza: 1.03, parciales: [[1, 1, 0.45, 'triangle'], [2, 0.4, 0.3, 'sine'], [3, 0.18, 0.18, 'sine']] }),
  // Feria: organillo, sostenido y con vaivén
  organillo: Object.freeze({ nombre: 'Organillo', ataque: 0.02, vib: 5, parciales: [[1, 0.8, 0.36, 'sine'], [2, 0.45, 0.36, 'sine'], [3, 0.25, 0.34, 'sine'], [4, 0.12, 0.3, 'sine']] }),
  // Reino de las nubes: arpa, pulsada y larga
  arpa: Object.freeze({ nombre: 'Arpa', ataque: 0.004, filtro: 3200, parciales: [[1, 1, 0.8, 'triangle'], [2, 0.3, 0.45, 'sine']] }),
  // Bosque de hadas: flauta, de entrada suave y con un poco de vibrato
  flauta: Object.freeze({ nombre: 'Flauta', ataque: 0.05, vib: 6, parciales: [[1, 1, 0.42, 'sine'], [2, 0.12, 0.35, 'sine']] }),
  // Fondo del mar: marimba, de madera grave y redonda (una octava más abajo)
  marimba: Object.freeze({ nombre: 'Marimba', ataque: 0.004, parciales: [[0.5, 1, 0.42, 'sine'], [2, 0.2, 0.1, 'sine']] }),
  // Jardín de cerezos: koto, un pellizco de cuerda que sube un poquito al soltar
  koto: Object.freeze({ nombre: 'Koto', ataque: 0.003, desliza: 0.985, filtro: 2600, parciales: [[1, 1, 0.6, 'triangle'], [3, 0.2, 0.2, 'sine']] }),
  // Espacio: sintetizador suave, dos ondas un poco desafinadas
  sinte: Object.freeze({ nombre: 'Sintetizador', ataque: 0.015, filtro: 2200, parciales: [[1, 0.7, 0.45, 'triangle'], [1.006, 0.7, 0.45, 'triangle'], [2, 0.15, 0.3, 'sine']] }),
});
// toca la nota f (Hz) con el instrumento id, al volumen vol
function ppInstrumento(id, f, vol = 0.13) {
  if (!AC || sonidoApagado()) return;
  const I = PP_INSTRUMENTOS[id] || PP_INSTRUMENTOS.cajita, t = AC.currentTime + 0.01;
  let out = ppSalida(1);
  if (I.filtro) { const fl = AC.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = I.filtro; fl.connect(out); out = fl; }
  for (const [m, v, d, onda] of I.parciales) ppParcial(out, I, f * m, vol * v, d, onda, t);
}
// un parcial: una onda con su ataque, su caída y, si el instrumento lo pide, su deslizamiento y su vibrato
function ppParcial(out, I, f, v, d, onda, t) {
  const o = AC.createOscillator(), g = AC.createGain(); o.type = onda;
  o.frequency.setValueAtTime(f * (I.desliza || 1), t); o.frequency.exponentialRampToValueAtTime(f, t + 0.05);
  if (I.vib) { const l = AC.createOscillator(), lg = AC.createGain(); l.frequency.value = I.vib; lg.gain.value = f * 0.006; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + d + 0.05); }
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + I.ataque); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g); g.connect(out); o.start(t); o.stop(t + d + 0.02);
}
