// Fans of Rumble: Tácticas · MAQUETA (píxeles): un pincel que pinta píxel a píxel en un lienzo pequeño (con tramas, como el pixel art
// hecho a mano), las ayudas de imagen (ampliar sin emborronar, desenfocar por zonas, brillos de luz) y la perspectiva del suelo.
'use strict';

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + 0.5) / 16);
const trama = (x, y) => BAYER[((y & 3) << 2) | (x & 3)];
const azarFijo = (x, y = 0, s = 0) => { let h = Math.imul(x ^ 0x9e3779b9, 374761393) ^ Math.imul(y + s * 7919, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

function lienzo(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; }
function rgbDe(hex) { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
const u32 = (r, g, b, a = 255) => ((a << 24) | (b << 16) | (g << 8) | r) >>> 0;
const u32De = (hex, a = 255) => { const [r, g, b] = rgbDe(hex); return u32(r, g, b, a); };
const rampa = (...hex) => hex.map(h => u32De(h));
// el tono de una rampa (de la sombra a la luz) para una luz de 0 a 1, con trama: las medias tintas salen a cuadritos
function tono(r, luz, x, y) {
  const n = r.length - 1, v = Math.min(1, Math.max(0, luz)) * n; let i = Math.floor(v);
  if (v - i > trama(x, y)) i++;
  return r[Math.min(n, i)];
}

/* ---------- el pincel ---------- */
class Pincel {
  constructor(w, h) {
    this.w = w; this.h = h; this.c = lienzo(w, h); this.ctx = this.c.getContext('2d');
    this.img = this.ctx.createImageData(w, h); this.d = new Uint32Array(this.img.data.buffer);
  }
  px(x, y, c) { x = Math.floor(x); y = Math.floor(y); if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.d[y * this.w + x] = c; }
  lee(x, y) { return this.d[y * this.w + x]; }
  rect(x, y, w, h, c) {
    const x0 = Math.max(0, Math.floor(x)), y0 = Math.max(0, Math.floor(y)), x1 = Math.min(this.w, Math.floor(x + w)), y1 = Math.min(this.h, Math.floor(y + h));
    if (x1 <= x0) return; for (let j = y0; j < y1; j++) this.d.fill(c, j * this.w + x0, j * this.w + x1);
  }
  // degradado vertical con trama entre varios colores
  degradado(x, y, w, h, hexes) {
    const r = rampa(...hexes);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.px(x + i, y + j, tono(r, j / Math.max(1, h - 1), x + i, y + j));
  }
  // relleno de un polígono [x, y, x, y…]; c es un color o una función (x, y) → color
  poli(p, c) {
    let y0 = Infinity, y1 = -Infinity; for (let i = 1; i < p.length; i += 2) { y0 = Math.min(y0, p[i]); y1 = Math.max(y1, p[i]); }
    for (let y = Math.max(0, Math.floor(y0)); y <= Math.min(this.h - 1, Math.ceil(y1)); y++) {
      const cy = y + 0.5, xs = [];
      for (let i = 0, n = p.length / 2; i < n; i++) {
        const ax = p[i * 2], ay = p[i * 2 + 1], bx = p[((i + 1) % n) * 2], by = p[((i + 1) % n) * 2 + 1];
        if ((ay <= cy && by > cy) || (by <= cy && ay > cy)) xs.push(ax + (cy - ay) / (by - ay) * (bx - ax));
      }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.max(0, Math.round(xs[k])); x < Math.min(this.w, Math.round(xs[k + 1])); x++) this.px(x, y, typeof c === 'function' ? c(x, y) : c);
    }
  }
  elipse(cx, cy, rx, ry, c) {
    for (let j = -ry; j <= ry; j++) {
      const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (j * j) / (ry * ry + 0.0001))));
      for (let i = -w; i <= w; i++) this.px(cx + i, cy + j, typeof c === 'function' ? c(cx + i, cy + j, i / (rx || 1), j / (ry || 1)) : c);
    }
  }
  linea(x0, y0, x1, y1, c) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy;
    for (;;) { this.px(x0, y0, c); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
  }
  // aclara (f > 1) u oscurece (f < 1) lo que ya hay pintado; con trama, para que no se note un borde recto
  luz(x, y, w, h, f, borde = 0) {
    for (let j = Math.max(0, y); j < Math.min(this.h, y + h); j++) for (let i = Math.max(0, x); i < Math.min(this.w, x + w); i++) {
      if (borde && (i - x < borde || x + w - 1 - i < borde) && trama(i, j) < 0.5) continue;
      const v = this.d[j * this.w + i], k = f;
      const r = Math.min(255, (v & 255) * k), g = Math.min(255, ((v >> 8) & 255) * k), b = Math.min(255, ((v >> 16) & 255) * k);
      this.d[j * this.w + i] = u32(r, g, b, (v >>> 24) & 255);
    }
  }
  // un texto pequeño sin suavizar (cada píxel, o está o no está)
  texto(s, x, y, tam, c, fuente = FONT_D) {
    const t = lienzo(this.w, this.h), tx = t.getContext('2d');
    tx.font = tam + 'px ' + fuente; tx.textAlign = 'center'; tx.textBaseline = 'middle'; tx.fillStyle = '#fff'; tx.fillText(s, x, y);
    const d = tx.getImageData(0, 0, t.width, t.height).data;
    for (let i = 0; i < this.w * this.h; i++) if (d[i * 4 + 3] > 120) this.d[i] = c;
  }
  fin() { this.ctx.putImageData(this.img, 0, 0); return this.c; }
}

/* ---------- ayudas de imagen ---------- */
// amplía un dibujo de píxeles por un número entero sin suavizar: todos los píxeles salen iguales y nítidos
function ampliar(src, n) {
  const a = lienzo(src.width * n, src.height * n), x = a.getContext('2d');
  x.imageSmoothingEnabled = false; x.drawImage(src, 0, 0, a.width, a.height);
  return a;
}
// ¿sabe el navegador desenfocar en el canvas? (se prueba de verdad: algunos aceptan la orden y no hacen nada)
const FILTRO = (() => {
  try { const c = lienzo(5, 5), x = c.getContext('2d'); x.filter = 'blur(1px)'; x.fillStyle = '#fff'; x.fillRect(2, 2, 1, 1); return x.getImageData(1, 2, 1, 1).data[3] > 0; }
  catch (e) { return false; }
})();
// copia desenfocada (r en píxeles del lienzo). Sin filter: se reduce y se amplía suavizando, dos veces
function desenfocar(src, r) {
  const out = lienzo(src.width, src.height), x = out.getContext('2d');
  if (r <= 0) { x.drawImage(src, 0, 0); return out; }
  if (FILTRO) { x.filter = `blur(${r}px)`; x.drawImage(src, 0, 0); x.filter = 'none'; return out; }
  let cur = src;
  for (const f of [r * 0.8, r * 1.6]) {
    const s = lienzo(src.width / Math.max(1.5, f), src.height / Math.max(1.5, f)), sx = s.getContext('2d');
    sx.imageSmoothingQuality = 'high'; sx.drawImage(cur, 0, 0, s.width, s.height);
    const b = lienzo(src.width, src.height), bx = b.getContext('2d'); bx.imageSmoothingQuality = 'high'; bx.drawImage(s, 0, 0, b.width, b.height); cur = b;
  }
  x.drawImage(cur, 0, 0); return out;
}
// pinta src sobre dst solo donde dice un degradado vertical: paradas = [[y de 0 a 1, opacidad], …]
function conMascara(dst, src, paradas) {
  const t = lienzo(dst.width, dst.height), x = t.getContext('2d');
  x.drawImage(src, 0, 0, t.width, t.height); x.globalCompositeOperation = 'destination-in';
  const g = x.createLinearGradient(0, 0, 0, t.height); for (const [y, a] of paradas) g.addColorStop(Math.min(1, Math.max(0, y)), `rgba(0,0,0,${a})`);
  x.fillStyle = g; x.fillRect(0, 0, t.width, t.height);
  dst.getContext('2d').drawImage(t, 0, 0);
}
// brillos de luz ya hechos (se pintan con 'lighter', que suma luz): uno suave y otro como un disco desenfocado
const BRILLOS = {};
function brillo(col, disco = false) {
  const id = col + (disco ? 'd' : ''); if (BRILLOS[id]) return BRILLOS[id];
  const c = lienzo(64, 64), x = c.getContext('2d'), [r, g, b] = rgbDe(col), k = (a) => `rgba(${r},${g},${b},${a})`;
  const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  if (disco) { gr.addColorStop(0, k(0.5)); gr.addColorStop(0.7, k(0.42)); gr.addColorStop(0.86, k(0.28)); gr.addColorStop(1, k(0)); }
  else { gr.addColorStop(0, k(1)); gr.addColorStop(0.22, k(0.55)); gr.addColorStop(0.55, k(0.16)); gr.addColorStop(1, k(0)); }
  x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
  return (BRILLOS[id] = c);
}
function pintaBrillo(c, col, x, y, r, a, disco = false, ry = r) {
  if (a <= 0) return; const prev = c.globalAlpha; c.globalAlpha = a; c.drawImage(brillo(col, disco), x - r, y - ry, r * 2, ry * 2); c.globalAlpha = prev;
}

/* ---------- la perspectiva de la maqueta (igual en todos los mundos) ---------- */
const PW = 270, PH = 480;                          // el decorado en píxeles: cada uno ocupa 2 × 2 de la escena de 540 × 960
const PARED_Y = 172;                               // donde el fondo toca el suelo (en píxeles del decorado)
const HOR = -200, KX = 20, KZ = 19267, PCX = 135;  // la cámara: el horizonte queda muy arriba, así el suelo se ve casi desde arriba
const V_PARED = KZ / (PARED_Y - HOR);
const uDe = X => (X - PCX) * KX / (PARED_Y - HOR);                                         // de una x del fondo a baldosas
const sueloXY = (u, v) => { const den = KZ / v; return [PCX + u * den / KX, den + HOR]; };   // de baldosas a píxeles
// pinta el suelo: col(u, v, X, Y, du, dv, s) da el color de cada píxel (u: de lado a lado; s: distancia a la pared)
function pintaSuelo(p, col) {
  for (let Y = PARED_Y; Y < PH; Y++) {
    const den = Y - HOR, v = KZ / den, du = KX / den, dv = KZ / (den * den);
    for (let X = 0; X < PW; X++) p.px(X, Y, col((X - PCX) * du, v, X, Y, du, dv, V_PARED - v));
  }
}
// un ventanal con ciudad: o = { x, w, y, h, cielo: [colores], lejos, cerca, bordeCerca, luces: [colores], marco: rampa, sol }
function ventanal(p, o) {
  const x0 = o.x, x1 = o.x + o.w, y0 = o.y, y1 = o.y + o.h;
  p.rect(x0 - 3, y0 - 3, o.w + 6, o.h + 6, u32De('#0a030c'));
  p.degradado(x0, y0, o.w, o.h, o.cielo);
  if (o.estrellas) for (let i = 0; i < o.w * o.h / 90; i++) { const sx = x0 + Math.floor(azarFijo(i, x0) * o.w), sy = y0 + Math.floor(azarFijo(x0, i) * o.h * 0.5); p.px(sx, sy, azarFijo(i, 9) < 0.3 ? u32De('#ffffff') : u32De('#9aa8ff')); }
  if (o.sol) {
    const [sx, sy, r, cols] = o.sol;
    p.elipse(sx, sy, r, r, (x, y, i, j) => { const d = Math.hypot(i, j); return d < 0.55 ? u32De(cols[0]) : d < 0.82 ? u32De(cols[1]) : (d < 0.95 || trama(x, y) > 0.5) ? u32De(cols[2]) : u32De(cols[3]); });
  }
  for (let x = x0; x < x1; x++) {
    const h = 18 + Math.floor(azarFijo(Math.floor(x / 5), 3 + x0) * 26);
    for (let y = y1 - h; y < y1; y++) p.px(x, y, (y - (y1 - h)) < 1 ? u32De(o.bordeLejos) : u32De(o.lejos));
  }
  let bx = x0;
  while (bx < x1) {
    const bw = 7 + Math.floor(azarFijo(bx, 9) * 9), h = 26 + Math.floor(azarFijo(bx, 5) * 50), top = y1 - h;
    for (let x = bx; x < Math.min(x1, bx + bw); x++) for (let y = top; y < y1; y++) {
      let c = u32De(o.cerca);
      if (x === bx) c = u32De(o.bordeCerca);
      if (y > top + 2 && (x - bx) % 3 === 1 && (y - top) % 4 === 1 && x < bx + bw - 1 && azarFijo(x, y) < 0.42) c = u32De(azarFijo(y, x) < 0.8 ? o.luces[0] : o.luces[1]);
      p.px(x, y, c);
    }
    if (azarFijo(bx, 2) < 0.35) p.linea(bx + 2, top - 1, bx + 2, top - 6, u32De(o.cerca));
    bx += bw + (azarFijo(bx, 7) < 0.3 ? 2 : 0);
  }
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {   // brillo del cristal
    const k = ((x - x0) + (y - y0) * 0.7) % 52; if (k < 3 || (k > 7 && k < 8.5)) { const c = p.lee(x, y); p.px(x, y, u32(Math.min(255, (c & 255) * 1.22 + 10), Math.min(255, ((c >> 8) & 255) * 1.22 + 10), Math.min(255, ((c >> 16) & 255) * 1.22 + 10))); }
  }
  const M = o.marco, mx = x0 + Math.floor(o.w / 2) - 1;
  p.rect(mx, y0, 3, o.h, u32De('#12050d')); p.rect(mx, y0, 1, o.h, M[2]);
  p.rect(x0, y0 + 34, o.w, 3, u32De('#12050d')); p.rect(x0, y0 + 34, o.w, 1, M[2]);
  for (let x = x0 - 1; x <= x1; x++) { p.px(x, y0 - 1, M[3]); p.px(x, y1, M[1]); }
  for (let y = y0 - 1; y <= y1; y++) { p.px(x0 - 1, y, M[3]); p.px(x1, y, M[1]); }
  p.rect(x0 - 4, y1 + 2, o.w + 8, 3, M[2]); p.rect(x0 - 4, y1 + 2, o.w + 8, 1, M[4]); p.rect(x0 - 4, y1 + 5, o.w + 8, 1, M[0]);
}
// una hoja: rombo alargado desde (x, y) en el ángulo a, con la mitad que mira a la luz más clara y el nervio oscuro
function hoja(p, r, x, y, a, largo, ancho, luz) {
  const ca = Math.cos(a), sa = Math.sin(a), mx = x + ca * largo * 0.45, my = y + sa * largo * 0.45, px = -sa * ancho, py = ca * ancho;
  const tx = x + ca * largo, ty = y + sa * largo;
  p.poli([x, y, mx + px, my + py, tx, ty], (X, Y) => tono(r, luz + 0.12, X, Y));
  p.poli([x, y, mx - px, my - py, tx, ty], (X, Y) => tono(r, luz - 0.18, X, Y));
  p.linea(x, y, x + ca * largo * 0.8, y + sa * largo * 0.8, r[0]);
}
// planta en maceta (maceta del color de la rampa m)
function planta(p, x0, base, hojas, m) {
  p.linea(x0 + 10, base - 18, x0 + 9, base - 58, u32De('#3a2410')); p.linea(x0 + 11, base - 18, x0 + 12, base - 46, u32De('#5a3a18'));
  for (let i = 0; i < 13; i++) {
    const y = base - 26 - (i % 7) * 8 - azarFijo(i, 2) * 6, a = (i % 2 ? -0.5 : -2.6) + (azarFijo(i, 4) - 0.5) * 0.9;
    hoja(p, hojas, x0 + 10, y, a, 12 + azarFijo(i, 5) * 6, 4.5, Math.cos(a) < 0 ? 0.62 : 0.4);
  }
  p.poli([x0 + 1, base - 18, x0 + 19, base - 18, x0 + 16, base, x0 + 4, base], (x, y) => tono(m, 0.4 + (x < x0 + 6 ? 0.25 : 0) - (y - base + 18) * 0.012, x, y));
  p.rect(x0, base - 20, 21, 3, m[4]); p.rect(x0, base - 17, 21, 1, m[1]);
}
