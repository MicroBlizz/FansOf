// Fans of Island · LA LONA (la de Fans of Recruit, demos/recruit/js/lona.js, con los lavados de acuarela al final): utilidades para pintar fondos y efectos píxel a píxel. Tramas de puntos
// (el «degradado» de las recreativas: dos colores mezclados a cuadritos), franjas, ruido, rayas y un número al azar que
// siempre sale igual con la misma semilla, para que el decorado no cambie de una vez a otra.
'use strict';

function lienzoNuevo(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; }
// número «al azar» de 0 a 1, siempre el mismo para la misma semilla
function hash(n) {
  n = Math.imul((n | 0) ^ 0x9e3779b9, 0x85ebca6b); n ^= n >>> 13;
  n = Math.imul(n, 0xc2b2ae35); n ^= n >>> 16;
  return (n >>> 0) / 4294967296;
}
const hash2 = (x, y, s = 0) => hash(Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1274126177));
// ruido suave, para manchas grandes: de 0 a 1 y cambia poco a poco; e = tamaño de la mancha en píxeles
function ruidoSuave(x, y, e, s = 0) {
  const X = x / e, Y = y / e, i = Math.floor(X), j = Math.floor(Y), u = X - i, v = Y - j, a = u * u * (3 - 2 * u), b = v * v * (3 - 2 * v);
  return (hash2(i, j, s) * (1 - a) + hash2(i + 1, j, s) * a) * (1 - b) + (hash2(i, j + 1, s) * (1 - a) + hash2(i + 1, j + 1, s) * a) * b;
}
// la trama de puntos de 4 × 4: cuánto hay que pasar en cada píxel para que se pinte (0 a 1)
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const bayer = (i, j) => (BAYER[(j & 3) * 4 + (i & 3)] + 0.5) / 16;

// recorre los píxeles de una zona: fn(i, j, colorDeAhora) devuelve el color nuevo (número de rgba()) o nada para dejarlo
function pixeles(ctx, x, y, w, h, fn) {
  const W = ctx.canvas.width, H = ctx.canvas.height;
  const x0 = Math.max(0, Math.round(x)), y0 = Math.max(0, Math.round(y)), x1 = Math.min(W, Math.round(x + w)), y1 = Math.min(H, Math.round(y + h));
  if (x1 <= x0 || y1 <= y0) return;
  const id = ctx.getImageData(x0, y0, x1 - x0, y1 - y0), d = new Uint32Array(id.data.buffer), bw = x1 - x0;
  for (let j = y0; j < y1; j++) for (let i = x0; i < x1; i++) { const k = (j - y0) * bw + (i - x0), c = fn(i, j, d[k]); if (c !== undefined) d[k] = c; }
  ctx.putImageData(id, x0, y0);
}
function rect(ctx, x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
// franjas de arriba abajo que pasan de un color al siguiente con trama de puntos. o.curva: > 1 aprieta los colores abajo;
// o.zona: qué parte de cada franja lleva trama (1 = toda; 0.4 = franja lisa y un poco de trama al final, más limpio)
function franjas(ctx, x, y, w, h, colores, o = {}) {
  const C = colores.map(rgba), n = C.length - 1, curva = o.curva || 1, zona = o.zona || 1, y0 = Math.round(y);
  pixeles(ctx, x, y, w, h, (i, j) => {
    const t = Math.pow(Math.min(1, Math.max(0, (j - y0) / Math.max(1, h - 1))), curva) * n, a = Math.min(n - 1, Math.floor(t));
    return bayer(i, j) < (t - a - (1 - zona)) / zona ? C[a + 1] : C[a];
  });
}
// pinta «color» a puntos: cuanto de 0 a 1 (o una función (i, j) → 0 a 1). dentro: forma del pincel (opcional) que lo recorta
function trama(ctx, x, y, w, h, color, cuanto, dentro) {
  const c = rgba(color), fn = typeof cuanto === 'function' ? cuanto : () => cuanto;
  pixeles(ctx, x, y, w, h, (i, j, v) => ((v >>> 24) && (!dentro || dentro(i + 0.5, j + 0.5) < 0) && bayer(i, j) < fn(i, j) ? c : undefined));
}
// motas sueltas de un color (polvo, moqueta, desconchones). densidad de 0 a 1
function motas(ctx, x, y, w, h, color, densidad, semilla = 1) {
  const c = rgba(color);
  pixeles(ctx, x, y, w, h, (i, j, v) => ((v >>> 24) && hash2(i, j, semilla) < densidad ? c : undefined));
}
// raya de 1 píxel
function rayaPx(ctx, x1, y1, x2, y2, color) {
  let i = Math.round(x1), j = Math.round(y1);
  const i2 = Math.round(x2), j2 = Math.round(y2), dx = Math.abs(i2 - i), dy = -Math.abs(j2 - j), sx = i < i2 ? 1 : -1, sy = j < j2 ? 1 : -1;
  let e = dx + dy;
  ctx.fillStyle = color;
  for (;;) {
    ctx.fillRect(i, j, 1, 1);
    if (i === i2 && j === j2) break;
    const e2 = 2 * e;
    if (e2 >= dy) { e += dy; i += sx; }
    if (e2 <= dx) { e += dx; j += sy; }
  }
}
// figuras de píxel para efectos (siempre en píxeles enteros)
function circuloPx(ctx, cx, cy, r, color) {
  ctx.fillStyle = color; cx = Math.round(cx); cy = Math.round(cy);
  for (let dy = -r; dy <= r; dy++) { const dx = Math.floor(Math.sqrt(Math.max(0, r * r - dy * dy + r * 0.8))); ctx.fillRect(cx - dx, cy + dy, dx * 2 + 1, 1); }
}
function anilloPx(ctx, cx, cy, r, g, color) {
  ctx.fillStyle = color; cx = Math.round(cx); cy = Math.round(cy);
  const r2 = Math.max(0, r - g);
  for (let dy = -r; dy <= r; dy++) {
    const ext = Math.floor(Math.sqrt(Math.max(0, r * r - dy * dy + r * 0.8))), int = Math.abs(dy) <= r2 ? Math.floor(Math.sqrt(Math.max(0, r2 * r2 - dy * dy + r2 * 0.8))) : -1;
    if (int < 0) ctx.fillRect(cx - ext, cy + dy, ext * 2 + 1, 1);
    else { ctx.fillRect(cx - ext, cy + dy, ext - int, 1); ctx.fillRect(cx + int + 1, cy + dy, ext - int, 1); }
  }
}
function ovaloPx(ctx, cx, cy, rx, ry, color) {
  ctx.fillStyle = color; cx = Math.round(cx); cy = Math.round(cy);
  for (let dy = -ry; dy <= ry; dy++) { const dx = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / ((ry + 0.4) * (ry + 0.4))))); ctx.fillRect(cx - dx, cy + dy, dx * 2 + 1, 1); }
}
// la sombra de alguien en el suelo: un óvalo liso y oscuro
function sombraSuelo(ctx, cx, cy, rx, ry, color = '#1a2330') { ovaloPx(ctx, cx, cy, rx, Math.max(1, ry - 1), color); }
// un dibujo visto de lejos o a contraluz: todos sus colores se van hacia «hacia» (t de 0 a 1). Devuelve otro dibujo
function apagaSpr(s, hacia, t) {
  const c = lienzoNuevo(s.w, s.h), g = c.getContext('2d');
  g.drawImage(s.c, 0, 0);
  const id = g.getImageData(0, 0, s.w, s.h), d = id.data, n = parseInt(hacia.slice(1, 7), 16), R = n >> 16, G = (n >> 8) & 255, B = n & 255;
  for (let k = 0; k < d.length; k += 4) if (d[k + 3]) { d[k] += (R - d[k]) * t; d[k + 1] += (G - d[k + 1]) * t; d[k + 2] += (B - d[k + 2]) * t; }
  g.putImageData(id, 0, 0);
  return Object.assign({}, s, { c });
}
// el resplandor de una explosión en el canto de un dibujo: la línea del borde que mira hacia dx (-1 = izquierda, 1 = derecha)
// se pinta de «color». Devuelve otro dibujo
function luzCanto(s, color, dx) {
  const c = lienzoNuevo(s.w, s.h), g = c.getContext('2d');
  g.drawImage(s.c, 0, 0);
  const id = g.getImageData(0, 0, s.w, s.h), d = id.data, o = new Uint8ClampedArray(d), n = parseInt(color.slice(1, 7), 16), R = n >> 16, G = (n >> 8) & 255, B = n & 255;
  const hay = (i, j) => i >= 0 && i < s.w && o[(j * s.w + i) * 4 + 3] > 0;
  for (let j = 0; j < s.h; j++) for (let i = 0; i < s.w; i++) {
    if (!hay(i, j)) continue;
    const k = (j * s.w + i) * 4, t = !hay(i + dx, j) ? 1 : 0;
    if (t) { d[k] += (R - d[k]) * t; d[k + 1] += (G - d[k + 1]) * t; d[k + 2] += (B - d[k + 2]) * t; }
  }
  g.putImageData(id, 0, 0);
  return Object.assign({}, s, { c });
}

/* ---------- ACUARELA de píxeles (propio de Island) ----------
   lavado: una forma f (del pincel F, en píxeles del lienzo) pintada con 3 tonos [sombra, base, luz] a manchas suaves con grano de
   papel, el borde irregular (sangra) y el pigmento acumulado en el canto (más oscuro). o.luzArriba: cuánto más clara queda la parte
   de arriba (0 a 1); o.sangra: píxeles que se desborda; o.escala: tamaño de las manchas; o.canto: ancho del canto oscuro.
   s es la semilla: el mismo lavado sale siempre igual. */
function lavado(ctx, f, tonos, s = 0, o = {}) {
  const C = tonos.map(rgba), [x0, y0, x1, y1] = f.bb, sangra = o.sangra === undefined ? 3 : o.sangra, canto = o.canto === undefined ? 1.2 : o.canto;
  const escala = o.escala || 10, luzArriba = o.luzArriba || 0, alto = Math.max(1, y1 - y0);
  pixeles(ctx, x0 - sangra - 1, y0 - sangra - 1, x1 - x0 + 2 * sangra + 2, y1 - y0 + 2 * sangra + 2, (i, j) => {
    const d = f(i + 0.5, j + 0.5) + (ruidoSuave(i, j, 6, s + 1) - 0.5) * sangra * 2;
    if (d >= 0) return;
    let v = ruidoSuave(i, j, escala, s) * 0.65 + ruidoSuave(i, j, escala * 2.6, s + 2) * 0.35;
    v = v * (1 - luzArriba) + (1 - (j - y0) / alto) * luzArriba;
    const u = Math.max(0, Math.min(1.999, v * 2)), b = Math.floor(u), fr = u - b;
    let t = (hash2(i, j, s + 5) * 0.85 + bayer(i, j) * 0.15) < fr ? b + 1 : b;   // grano de papel: trama al azar, con un poco de orden
    if (-d < canto) t = Math.max(0, t - 1);              // el pigmento se junta en el borde
    if (-d < 0.6 && bayer(i, j) < 0.7) t = 0;             // y la línea del canto, casi entera
    return C[Math.min(2, t)];
  });
}
// un grano de papel por encima de todo lo pintado en esa zona: píxeles sueltos un poco más claros
function papel(ctx, x, y, w, h, densidad = 0.06, semilla = 99) {
  pixeles(ctx, x, y, w, h, (i, j, v) => {
    if (!(v >>> 24) || hash2(i, j, semilla) > densidad) return;
    const r = Math.min(255, (v & 255) + 14), g = Math.min(255, ((v >> 8) & 255) + 14), b = Math.min(255, ((v >> 16) & 255) + 14);
    return ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0;
  });
}
// el contorno negro gordo de un dibujo del pincel (lo que lo separa del paisaje de acuarela): un píxel de negro alrededor de todo
function contornoNegro(s, color = '#1a1410') {
  const c = lienzoNuevo(s.w + 2, s.h + 2), g = c.getContext('2d');
  g.drawImage(s.c, 1, 1);
  const id = g.getImageData(0, 0, c.width, c.height), d = new Uint32Array(id.data.buffer), w = c.width, h = c.height, o = new Uint32Array(d), n = rgba(color);
  const hay = (i, j) => i >= 0 && j >= 0 && i < w && j < h && (o[j * w + i] >>> 24) > 0;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (!hay(i, j) && (hay(i - 1, j) || hay(i + 1, j) || hay(i, j - 1) || hay(i, j + 1))) d[j * w + i] = n;
  g.putImageData(id, 0, 0);
  const b = lienzoNuevo(c.width, c.height); b.getContext('2d').drawImage(s.b, 1, 1);
  return { c, b, ox: s.ox + 1, oy: s.oy + 1, w, h };
}
