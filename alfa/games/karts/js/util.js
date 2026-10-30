// Fans of Karts (prototipo) · UTILIDADES: el tamaño de la pantalla del juego, cuentas sueltas (ángulos, límites, azar con semilla)
// y colores. Los colores se escriben '#rrggbb' y se guardan como un número de 32 bits listo para escribir en la pantalla.
'use strict';

const PW = 240, PH = 160;            // la pantalla del juego: la de una consola portátil de 2001
const TAU = Math.PI * 2;
const OLK = '#1c1028';   // (OL es el de core/js/sistema/utiles.js; aquí el contorno es más oscuro)                // el contorno más oscuro (el de todos los juegos de Fans Of)

const limita = (v, a, b) => (v < a ? a : v > b ? b : v);
const entre = (a, b, t) => a + (b - a) * t;
const suave = t => t * t * (3 - 2 * t);
// de un ángulo a otro por el camino corto (resultado entre -π y π)
function difAng(a, b) { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; else if (d < -Math.PI) d += TAU; return d; }
const acerca = (v, meta, paso) => (v < meta ? Math.min(meta, v + paso) : Math.max(meta, v - paso));

// azar con semilla (para que cada pista salga siempre igual) y un «ruido» fijo por casilla
function azarDe(semilla) {
  let a = semilla >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function ruido(x, y) { let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
const azar = (a, b) => a + Math.random() * (b - a);
const elige = l => l[(Math.random() * l.length) | 0];

// ---------- colores ----------
const U32_CACHE = new Map();
// '#rrggbb' → número ABGR (el orden en que la pantalla guarda cada punto)
function u32(hex) {
  let v = U32_CACHE.get(hex);
  if (v !== undefined) return v;
  const n = parseInt(hex.slice(1, 7), 16);
  v = ((255 << 24) | ((n & 255) << 16) | (((n >> 8) & 255) << 8) | (n >> 16)) >>> 0;
  U32_CACHE.set(hex, v);
  return v;
}
function mezcla(a, b, t) {
  const x = parseInt(a.slice(1, 7), 16), y = parseInt(b.slice(1, 7), 16);
  const c = s => Math.round(((x >> s) & 255) * (1 - t) + ((y >> s) & 255) * t);
  return '#' + ((1 << 24) | (c(16) << 16) | (c(8) << 8) | c(0)).toString(16).slice(1);
}
// mezcla de dos números ABGR (t de 0 a 256)
function mezcla32(a, b, t) {
  const u = 256 - t;
  return ((255 << 24) | ((((a >> 16) & 255) * u + ((b >> 16) & 255) * t) >> 8 << 16) | ((((a >> 8) & 255) * u + ((b >> 8) & 255) * t) >> 8 << 8) | (((a & 255) * u + (b & 255) * t) >> 8)) >>> 0;
}
// los tres tonos de una pieza a partir de su color: la sombra tira a morado frío y la luz a amarillo cálido, como en el pixel art
function tonos(base, fuerza = 1) {
  return [mezcla(mezcla(base, '#2a1450', 0.46 * fuerza), '#000010', 0.08), base, mezcla(base, '#fff6d8', 0.42 * fuerza)];
}

// un lienzo pequeño donde dibujar (sin suavizado: cada punto, un cuadradito)
function lienzo(w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  return [c, x];
}
// trama de Bayer de 4 × 4: para degradados con puntitos, como en las consolas de pocos colores
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
