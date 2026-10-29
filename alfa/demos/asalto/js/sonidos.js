// Fans of Asalto · SONIDOS: los efectos propios (hechos con tone y noise del motor de core, sin archivos) y qué música suena.
// Las canciones son las de la serie (core/js/serie/canciones.js): la del menú en la portada, la de los Animales Locos en la tienda
// y el mapa, la de los jefes contra el jefe del piso y las sintonías de ganar o perder.
'use strict';
Object.assign(SFX, {
  asCompra: () => { tone(520, 780, 0.08, 'triangle', 0.08); tone(1040, 1040, 0.06, 'sine', 0.05, 0.06); },
  asSube: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, f, 0.1, 'triangle', 0.07, i * 0.05)),
  asRefresca: () => { noise(0.12, 0.06, 2600, 'bandpass'); tone(400, 700, 0.1, 'sine', 0.05); },
  asNoVale: () => { tone(230, 170, 0.12, 'square', 0.05); },
  asEspada: () => { noise(0.06, 0.07, 3800, 'highpass'); tone(260, 140, 0.06, 'square', 0.04); },
  asFlecha: () => { noise(0.08, 0.04, 6000, 'highpass'); tone(900, 1400, 0.05, 'sine', 0.03); },
  asMagia: () => { tone(700, 1200, 0.16, 'sine', 0.05); tone(1400, 900, 0.12, 'triangle', 0.03, 0.05); },
  asBomba: () => { noise(0.35, 0.14, 420); tone(140, 50, 0.3, 'triangle', 0.1); },
  asCura: () => [784, 988, 1318].forEach((f, i) => tone(f, f * 1.02, 0.1, 'sine', 0.04, i * 0.05)),
  asMuere: () => { tone(330, 110, 0.25, 'square', 0.05); noise(0.15, 0.05, 800); },
  asEscudo: () => { tone(600, 900, 0.12, 'triangle', 0.05); tone(900, 900, 0.1, 'sine', 0.04, 0.08); },
  asCofre: () => { [659, 784, 988, 1318].forEach((f, i) => tone(f, f, 0.14, 'triangle', 0.08, i * 0.06)); noise(0.4, 0.05, 7000, 'highpass', 0.1); },
  asPaso: () => { tone(330, 300, 0.05, 'triangle', 0.05); },
  asLucha: () => { [392, 392, 523].forEach((f, i) => tone(f, f, 0.1, 'square', 0.06, i * 0.1)); noise(0.3, 0.06, 1800, 'bandpass', 0.2); },
});
Object.assign(THROTTLE, { asEspada: 45, asFlecha: 45, asMagia: 60, asBomba: 80, asCura: 90, asMuere: 60, asEscudo: 150 });

// la música que debe sonar: el bucle la pone en cuanto el audio arranca (el navegador espera al primer toque) y no corta las sintonías
const AS_MUS = { quiere: 'menu' };
function asMusica(nombre) { AS_MUS.quiere = nombre && TRACKS[nombre] ? nombre : 'menu'; }
function asSintonia(nombre) { if (AC && M.bus && TRACKS[nombre]) musicSet(nombre); }
function asMusicaBucle() {
  if (!AC || !M.bus) return;
  if (M.trk && M.trk.once) return;
  if (M.name !== AS_MUS.quiere) musicSet(AS_MUS.quiere);
  M.tmT = 1;
}
