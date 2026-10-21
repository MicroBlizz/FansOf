// Fans of Auto · LA LONA: ayudas para dibujar píxel a píxel en lienzos pequeños (cada sprite y cada trozo de suelo se pinta
// una vez con estas funciones y luego solo se pega). También el azar con semilla, para que una partida se pueda repetir igual
// en dos ordenadores (lo que hará falta el día del multijugador).
'use strict';

function lienzoNuevo(w, h) {
  const c = document.createElement('canvas'); c.width = Math.max(1, w | 0); c.height = Math.max(1, h | 0);
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  return [c, g];
}
// azar con semilla (mulberry32): mismo número de partida, misma ciudad
function Azar(semilla) {
  let a = semilla >>> 0;
  const f = () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  f.entre = (x, y) => x + f() * (y - x);
  f.entero = (x, y) => Math.floor(x + f() * (y - x + 1));
  f.elige = arr => arr[Math.floor(f() * arr.length)];
  f.semilla = () => a;
  return f;
}
// una cadena de píxeles: filas de letras, cada letra un color de la paleta ('.' = nada)
function pixeles(g, filas, pal, x0 = 0, y0 = 0, esc = 1) {
  filas.forEach((fila, y) => { for (let x = 0; x < fila.length; x++) { const c = pal[fila[x]]; if (c) { g.fillStyle = c; g.fillRect(x0 + x * esc, y0 + y * esc, esc, esc); } } });
}
// la misma cadena, pero espejada de izquierda a derecha
const espejo = filas => filas.map(f => [...f].reverse().join(''));
function rect(g, x, y, w, h, c) { g.fillStyle = c; g.fillRect(x, y, w, h); }
// motas de un color repartidas al azar (para texturas de suelo y tejados)
function motas(g, x, y, w, h, c, n, az) { g.fillStyle = c; for (let i = 0; i < n; i++) g.fillRect(x + Math.floor(az() * w), y + Math.floor(az() * h), 1, 1); }
// mezcla dos colores hex (t de 0 a 1)
function mezcla(a, b, t) {
  const p = s => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
  const A = p(a), B = p(b), r = A.map((v, i) => Math.round(v + (B[i] - v) * t));
  return '#' + r.map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
}
const oscuro = (c, t = 0.35) => mezcla(c, '#000000', t);
const claro = (c, t = 0.3) => mezcla(c, '#ffffff', t);
