// Fans of Merge · SONIDOS: los efectos propios (hechos con tone y noise del motor de core, sin archivos) y qué música suena.
// Las canciones son las de la serie (core/js/serie/canciones.js): la del menú en la portada, la de los Animales Locos
// (la familia de CrazyBunny) en la partida y las sintonías de ganar o perder al acabar.
'use strict';
const MG_NOTAS = [0, 2, 4, 7, 9, 12, 14, 16, 19];
const mgNota = n => 392 * Math.pow(2, MG_NOTAS[Math.min(MG_NOTAS.length - 1, n)] / 12);
Object.assign(SFX, {
  mgPon: () => { tone(300, 180, 0.08, 'sine', 0.12); noise(0.06, 0.05, 900); },
  mgJunta: (i = 0) => { const f = mgNota(i + 2); tone(f, f * 1.5, 0.14, 'triangle', 0.1); tone(f * 2, f * 2, 0.1, 'sine', 0.05, 0.05); noise(0.08, 0.04, 5200, 'highpass'); },
  mgSemilla: () => [784, 988, 1318, 1568].forEach((f, i) => tone(f, f * 1.02, 0.12, 'sine', 0.06, i * 0.04)),
  mgZorro: () => { tone(520, 760, 0.07, 'square', 0.04); tone(760, 420, 0.1, 'square', 0.04, 0.07); },
  mgCuervo: () => { noise(0.12, 0.08, 1400, 'bandpass'); tone(700, 500, 0.12, 'sawtooth', 0.04); },
  mgDuerme: () => { tone(500, 300, 0.4, 'sine', 0.07); tone(300, 200, 0.5, 'sine', 0.05, 0.3); },
  mgTopo: () => { noise(0.25, 0.14, 500); tone(200, 90, 0.2, 'triangle', 0.1); },
  mgRayo: () => { tone(1500, 300, 0.3, 'sawtooth', 0.05); noise(0.3, 0.12, 2400, 'bandpass'); },
  mgNoVale: () => { tone(230, 170, 0.12, 'square', 0.05); },
  mgCofre: () => { [659, 784, 988, 1318].forEach((f, i) => tone(f, f, 0.14, 'triangle', 0.08, i * 0.06)); noise(0.4, 0.05, 7000, 'highpass', 0.1); },
  mgReserva: () => { tone(440, 660, 0.08, 'triangle', 0.07); },
  mgCarga: () => [523, 784, 1046].forEach((f, i) => tone(f, f, 0.16, 'square', 0.05, i * 0.08)),
  mgEvento: () => { tone(392, 392, 0.12, 'triangle', 0.08); tone(523, 523, 0.18, 'triangle', 0.08, 0.12); },
  mgRecord: () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, f, 0.14, 'triangle', 0.08, i * 0.07)),
  mgFin: () => { tone(392, 196, 0.6, 'triangle', 0.1); },
  mgCarta: () => { noise(0.08, 0.06, 3000, 'bandpass'); tone(600, 900, 0.1, 'triangle', 0.06); },
});
Object.assign(THROTTLE, { mgPon: 40, mgJunta: 30, mgZorro: 60, mgDuerme: 120 });

// la música que debe sonar: el bucle la pone en cuanto el audio arranca (el navegador espera al primer toque) y no corta las sintonías de final
const MG_MUS = { quiere: 'menu' };
function mgMusica(nombre) { MG_MUS.quiere = nombre && TRACKS[nombre] ? nombre : 'menu'; }
function mgSintonia(nombre) { if (AC && M.bus && TRACKS[nombre]) musicSet(nombre); }
function mgMusicaBucle() {
  if (!AC || !M.bus) return;
  if (M.trk && M.trk.once) return;
  if (M.name !== MG_MUS.quiere) musicSet(MG_MUS.quiere);
  M.tmT = 1;
}
