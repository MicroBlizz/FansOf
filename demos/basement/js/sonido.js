// Fans of Basement · Sonido: el altavoz, el motor de música y las canciones son los de la serie (core/js/sistema/sonido.js y
// core/js/serie/canciones.js). Aquí lo que ese motor pide a cada juego (volumen y silencio), los efectos propios (chip de 16 bits)
// y qué canción suena: el jazz de ascensor de Microblizz en la mesa, «ciber» al bajar, la del robot de oficina en la CRUNCH ZONE,
// la de los jefes cuando sale uno
// y la de ganar o perder al acabar.
'use strict';

function musicUpdate() { /* la canción la elige basMusica (más abajo) */ }
const sonidoApagado = () => !SAVE.efectos && !SAVE.musica;
const volGeneral = () => 1;
const volMusica = () => SAVE.musica * 0.7;
const basV = (x) => x * SAVE.efectos;

const BAS_SONIDO = {
  disparo: () => tone(1300, 900, 0.03, 'square', basV(0.025)),
  impacto: () => tone(420, 260, 0.04, 'square', basV(0.03)),
  baja: () => { tone(500, 140, 0.1, 'square', basV(0.05)); noise(0.07, basV(0.04), 1800); },
  divide: () => { tone(800, 1200, 0.06, 'triangle', basV(0.05)); tone(800, 500, 0.06, 'triangle', basV(0.05), 0.05); },
  recoge: () => tone(1200, 1700, 0.05, 'triangle', basV(0.04)),
  cafe: () => [660, 880, 1100].forEach((f, i) => tone(f, f, 0.07, 'triangle', basV(0.06), i * 0.05)),
  golpe: () => { tone(300, 80, 0.18, 'sawtooth', basV(0.09)); noise(0.1, basV(0.07), 500); },
  frenado: () => tone(200, 120, 0.3, 'sine', basV(0.07)),
  cajaLlena: () => [440, 330].forEach((f, i) => tone(f, f, 0.12, 'square', basV(0.06), i * 0.12)),
  planta: () => tone(880, 880, 0.08, 'sine', basV(0.05)),
  zona: () => [523, 659, 784].forEach((f, i) => tone(f, f, 0.12, 'square', basV(0.06), i * 0.1)),
  cafeBajo: () => { for (let i = 0; i < 3; i++) tone(660, 500, 0.15, 'square', basV(0.07), i * 0.22); },
  ascensorLlamado: () => [988, 784].forEach((f, i) => tone(f, f, 0.25, 'sine', basV(0.08), i * 0.3)),
  boton: () => tone(700, 900, 0.05, 'triangle', basV(0.06)),
  compra: () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, f, 0.08, 'square', basV(0.06), i * 0.06)),
  no: () => tone(200, 150, 0.12, 'square', basV(0.06)),
  jefe: () => { for (let i = 0; i < 4; i++) { tone(90, 60, 0.25, 'sawtooth', basV(0.1), i * 0.3); noise(0.1, basV(0.08), 300, 'lowpass', i * 0.3); } },
  jefeVencido: () => [1046, 880, 1046, 1318, 1568].forEach((f, i) => tone(f, f, 0.14, 'square', basV(0.07), i * 0.09)),
  ataqueJefe: () => tone(260, 180, 0.12, 'square', basV(0.05)),
  rescate: () => [523, 784, 1046].forEach((f, i) => tone(f, f, 0.1, 'triangle', basV(0.07), i * 0.08)),
  tiembla: () => { for (let i = 0; i < 6; i++) noise(0.05, basV(0.06), 900, 'bandpass', i * 0.13); },
};
// Los efectos de Yoshi que usa Fans of Swipe (snd/, copiados de Swipe) para lo que más se oye; lo demás, sintetizado.
const BAS_MP3 = { recoge: 'moneda', impacto: 'golpe', golpe: 'dano', baja: 'muerte', compra: 'cofre', jefeVencido: 'reliquia', bloqueado: 'escudo' };
const BAS_AUDIO = {}, BAS_ULTIMO = {};
function basCargaSonidos() {
  for (const f of new Set(Object.values(BAS_MP3))) {
    const a = new Audio(); a.preload = 'auto';
    a.addEventListener('canplaythrough', () => { BAS_AUDIO[f] = a; }, { once: true });
    a.addEventListener('error', () => { BAS_AUDIO[f] = null; });
    a.src = 'snd/' + f + '.mp3';
  }
}
function basMp3(n) {
  const a = BAS_AUDIO[BAS_MP3[n]], ahora = performance.now();
  if (!a || !SAVE.efectos || ahora - (BAS_ULTIMO[n] || 0) < 70) return !!a;
  BAS_ULTIMO[n] = ahora;
  const c = a.cloneNode(); c.volume = 0.45; c.play().catch(() => {});
  return true;
}
function basSuena(n) { try { if (!basMp3(n) && BAS_SONIDO[n]) BAS_SONIDO[n](); } catch (e) { console.warn('Basement: sin sonido', e); } }

let basFinSonado = null;
// modo = 'portada' | 'mesa' | 'bajada' | 'resultado'; e = la bajada en curso (si hay)
function basMusica(modo, e) {
  if (typeof AC === 'undefined' || !AC || !M.bus) return;
  if (modo === 'resultado') {
    if (basFinSonado !== e) { basFinSonado = e; musicSet(e.fin === 'ascensor' ? 'win' : 'lose'); }
    return;
  }
  if (M.trk && M.trk.once) return;
  const quiero = modo !== 'bajada' ? 'menu' : e.jefe ? 'boss' : e.zona.crunch ? 'boss0' : 'ciber';
  if (M.name !== quiero) musicSet(quiero);
  M.tmT = 1;
}
