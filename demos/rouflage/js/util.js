// Fans of Rouflage (prototipo) · UTILIDADES: números, azar repetible, colores, lienzos y las ayudas de dibujo (formas con contorno).
'use strict';

const TAU = Math.PI * 2;
const OL = '#20102c';   // el contorno de todos los dibujos, el mismo que en el resto de la serie
const limita = (v, a, b) => (v < a ? a : v > b ? b : v);
const entre = (a, b, t) => a + (b - a) * t;
const lejos = (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay);
const suaviza = t => t * t * (3 - 2 * t);
// lo que hay que girar para ir del ángulo a al b por el camino corto (entre -PI y PI)
const giro = (a, b) => { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; };
// el motor de sonido de la serie usa estas dos; el juego también
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[(Math.random() * a.length) | 0];
const baraja = a => { for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };

// azar repetible: siempre el mismo número para la misma casilla y semilla (el mapa se pinta varias veces y tiene que salir idéntico)
function hash2(x, y, s = 0) {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1442695041)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/* ---------- colores ---------- */
function hexRgb(h) {
  const n = parseInt(h.slice(1), 16);
  return h.length === 4 ? [((n >> 8) & 15) * 17, ((n >> 4) & 15) * 17, (n & 15) * 17] : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const rgbHex = (r, g, b) => '#' + ((1 << 24) | (limita(Math.round(r), 0, 255) << 16) | (limita(Math.round(g), 0, 255) << 8) | limita(Math.round(b), 0, 255)).toString(16).slice(1);
// un color más claro (t > 0, hacia el blanco) o más oscuro (t < 0, hacia el contorno)
function tono(hex, t) {
  const [r, g, b] = hexRgb(hex), [R, G, B] = t > 0 ? [255, 255, 255] : [32, 16, 44], k = Math.abs(t);
  return rgbHex(r + (R - r) * k, g + (G - g) * k, b + (B - b) * k);
}
// lo distintos que se ven dos colores: 0 si son iguales y unos 765 como mucho. Es la fórmula «redmean»:
// casi tan fiel al ojo como las de laboratorio y muy barata, así que se puede usar píxel a píxel.
function difColor(r1, g1, b1, r2, g2, b2) {
  const rm = (r1 + r2) / 2, dr = r1 - r2, dg = g1 - g2, db = b1 - b2;
  return Math.sqrt((2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db);
}

/* ---------- lienzos ---------- */
// un lienzo fuera de pantalla; con `leer`, pensado para leerle los píxeles a menudo (cuentagotas, medir el camuflaje)
function lienzo(w, h, leer) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h));
  return [c, c.getContext('2d', leer ? { willReadFrequently: true } : undefined)];
}
function rrPath(c, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r);
  c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  c.lineTo(x + r, y + h); c.quadraticCurveTo(x, y + h, x, y + h - r);
  c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y); c.closePath();
}

/* ---------- dibujo: una forma con su relleno y su contorno grueso, como en el resto de la serie ---------- */
function forma(c, traza, relleno, lw = 3, borde = OL) {
  c.beginPath(); traza(c);
  if (relleno) { c.fillStyle = relleno; c.fill(); }
  if (lw) { c.lineWidth = lw; c.strokeStyle = borde; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); }
}
const caja = (x, y, w, h, r = 0) => c => (r ? rrPath(c, x, y, w, h, r) : c.rect(x, y, w, h));
const ovalo = (x, y, rx, ry, rot = 0) => c => c.ellipse(x, y, rx, ry, rot, 0, TAU);
const poli = (...p) => c => { c.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]); c.closePath(); };
function raya(c, p, color, lw) {
  c.beginPath(); c.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]);
  c.strokeStyle = color; c.lineWidth = lw; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke();
}
function punto(c, x, y, r, color) { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = color; c.fill(); }
// un texto con la letra gorda de la serie, centrado; con `borde`, lleva contorno
const LETRA_GORDA = '"Luckiest Guy", "Arial Black", Impact, sans-serif', LETRA_UI = '"Baloo 2", "Trebuchet MS", system-ui, sans-serif';
function rotulo(c, s, x, y, tam, color, borde, letra = LETRA_GORDA) {
  c.font = (letra === LETRA_UI ? '800 ' : '') + tam + 'px ' + letra; c.textAlign = 'center'; c.textBaseline = 'middle';
  if (borde) { c.lineJoin = 'round'; c.lineWidth = Math.max(2, tam * 0.28); c.strokeStyle = borde; c.strokeText(s, x, y); }
  c.fillStyle = color; c.fillText(s, x, y);
}
