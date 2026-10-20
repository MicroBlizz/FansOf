// Fans of Jump · El reto del día y el fantasma del récord.
// · Reto del día: el río sale de una semilla con la fecha, así que ese día es el mismo para todo el mundo; se guarda tu
//   mejor marca de hoy (GUARDA.reto) y su fantasma. Sin tutorial. Prepara las carreras PvP (PLAN-JUMP.md).
// · Fantasma: se apunta dónde caes en cada salto (la huella) y, si es récord, se guarda; en la siguiente partida un conejito
//   lila transparente repite tu mejor partida a tu lado (en el reto, tu mejor de hoy).
'use strict';

const RETO = { activo: false };
const FANTASMA = { huella: [], t0: 0 };
function semillaDe(txt) { let h = 2166136261; for (const ch of txt) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return h >>> 0; }
function azarFijo(a) { return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
// antes de hacer el río: en el reto, el azar del día
function preparaAzar() { rnd = RETO.activo ? azarFijo(semillaDe('fansof-jump-' + hoy())) : Math.random; }
const retoDeHoy = () => GUARDA.reto && GUARDA.reto.dia === hoy() ? GUARDA.reto : null;
function empiezaReto() { RETO.activo = true; nuevaPartida('listo'); SONIDO.boton(); }
function vuelveAlMenu() { RETO.activo = false; nuevaPartida('menu'); SONIDO.boton(); }

/* ---------- la huella y el fantasma ---------- */
function empiezaHuella() { const c = JUEGO.conejo; FANTASMA.huella = [[0, Math.round(c.x), Math.round(c.wy)]]; FANTASMA.t0 = JUEGO.t; }
function apuntaHuella(x, wy) { if (FANTASMA.huella.length < 800) FANTASMA.huella.push([Math.round((JUEGO.t - FANTASMA.t0) * 100) / 100, Math.round(x), Math.round(wy)]); }
// al acabar: guarda la huella si es récord (o el mejor del reto de hoy)
function cierraRetoYHuella(record) {
  const J = JUEGO;
  if (RETO.activo) {
    const r = retoDeHoy();
    if (!r || J.puntos > r.mejor) { GUARDA.reto = { dia: hoy(), mejor: J.puntos, fantasma: FANTASMA.huella }; J.recordReto = true; }
  } else if (record) GUARDA.fantasma = FANTASMA.huella;
}
const huellaFantasma = () => RETO.activo ? (retoDeHoy() || {}).fantasma : GUARDA.fantasma;
// dónde va el fantasma ahora: espera en cada tronco y salta justo a tiempo de caer cuando cayó
function posFantasma() {
  const h = huellaFantasma(), J = JUEGO;
  if (!h || h.length < 2 || (J.modo !== 'juego' && J.modo !== 'casi')) return null;
  const tt = J.t - FANTASMA.t0;
  let i = 0; while (i < h.length - 1 && h[i + 1][0] <= tt) i++;
  if (i >= h.length - 1) { const f = h[h.length - 1], se = tt - f[0]; return se > 1 ? null : { x: f[1], wy: f[2], z: 0, alfa: 1 - se }; }
  const a = h[i], b = h[i + 1], d = Math.hypot(b[1] - a[1], b[2] - a[2]), T = Math.min(b[0] - a[0], 0.32 + d / 380), sale = b[0] - T;
  if (tt < sale) return { x: a[1], wy: a[2], z: 0, alfa: 1 };
  const k = (tt - sale) / T;
  return { x: a[1] + (b[1] - a[1]) * k, wy: a[2] + (b[2] - a[2]) * k, z: Math.sin(Math.PI * k) * (6 + d * 0.14), alfa: 1 };
}
function pintaFantasma() {
  const p = posFantasma(); if (!p) return;
  const y = pantY(p.wy); if (y < -40 || y > PAN.H + 20) return;
  const antes = G.globalAlpha;
  G.globalAlpha = 0.38 * p.alfa;
  spriteConejo(p.z > 1 ? 'salto2' : 'quieto0', p.x, y - p.z, TAM_CONEJO, 0, 1, 1, '#cdb6f7', '#b49ae8');
  G.globalAlpha = 0.8 * p.alfa;
  letras(RETO.activo ? tr('Tu mejor de hoy') : tr('Tu récord'), p.x, y - p.z - 38, 6, '#ffffff', { borde: PASTEL.lilaO, bw: 2, peso: 700 });
  G.globalAlpha = antes;
}
