// Fans of Roguelite (prototipo) · Pincel de píxeles: cada fotograma se dibuja con formas (óvalos, polígonos, trazos) píxel a píxel,
// con tres tonos por pieza (luz arriba a la izquierda, base y sombra abajo a la derecha) y contorno: oscuro por fuera y del color
// de la pieza por dentro, como el pixel art hecho a mano. Las poses se dibujan de nuevo en cada fotograma (nada de estirar imágenes).
'use strict';

const OL = '#20102c';   // el contorno de todos los dibujos (el mismo que el juego)

// colores: '#rrggbb' → número para ImageData, y mezclas
const RGBA_CACHE = new Map();
function rgba(hex) {
  let v = RGBA_CACHE.get(hex);
  if (v !== undefined) return v;
  const n = parseInt(hex.slice(1, 7), 16);
  v = ((255 << 24) | ((n & 255) << 16) | (((n >> 8) & 255) << 8) | (n >> 16)) >>> 0;
  RGBA_CACHE.set(hex, v);
  return v;
}
function mezcla(a, b, t) {
  const x = parseInt(a.slice(1, 7), 16), y = parseInt(b.slice(1, 7), 16);
  const c = s => Math.round(((x >> s) & 255) * (1 - t) + ((y >> s) & 255) * t);
  return '#' + ((1 << 24) | (c(16) << 16) | (c(8) << 8) | c(0)).toString(16).slice(1);
}
// una paleta de pieza: base, sombra, luz y contorno de dentro
const pal = (b, s, l, o) => ({ b, s, l, o });
const tintaPal = (p, f) => pal(f(p.b), f(p.s), f(p.l), f(p.o));

// formas: funciones (x, y) → ¿dentro? El origen está en los pies y la y crece hacia abajo (lo de arriba es negativo), como el arte del juego
const F = {
  ov: (cx, cy, rx, ry, a = 0) => {
    const c = Math.cos(a), s = Math.sin(a);
    return (x, y) => { const dx = x - cx, dy = y - cy, u = (dx * c + dy * s) / rx, v = (-dx * s + dy * c) / ry; return u * u + v * v <= 1; };
  },
  re: (x, y, w, h) => (px, py) => px >= x && px < x + w && py >= y && py < y + h,
  rr: (x, y, w, h, r) => (px, py) => {
    if (px < x || px >= x + w || py < y || py >= y + h) return false;
    const qx = Math.max(x + r - px, 0, px - (x + w - r)), qy = Math.max(y + r - py, 0, py - (y + h - r));
    return qx * qx + qy * qy <= r * r;
  },
  pol: (...p) => (x, y) => {
    let d = false;
    for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
      const xi = p[i], yi = p[i + 1], xj = p[j], yj = p[j + 1];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) d = !d;
    }
    return d;
  },
  // trazo grueso de (x1, y1) a (x2, y2), que adelgaza de r1 a r2 (zanahorias, brazos, orejas)
  tr: (x1, y1, x2, y2, r1, r2 = r1) => {
    const dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy || 1;
    return (x, y) => {
      const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / l2));
      const ex = x - (x1 + dx * t), ey = y - (y1 + dy * t), r = r1 + (r2 - r1) * t;
      return ex * ex + ey * ey <= r * r;
    };
  },
  un: (...fs) => (x, y) => { for (const f of fs) if (f(x, y)) return true; return false; },
  menos: (a, b) => (x, y) => a(x, y) && !b(x, y),
  y: (a, b) => (x, y) => a(x, y) && b(x, y),
  // gira la forma «a» radianes alrededor de (px, py)
  gira: (f, a, px, py) => { const c = Math.cos(-a), s = Math.sin(-a); return (x, y) => { const dx = x - px, dy = y - py; return f(px + dx * c - dy * s, py + dx * s + dy * c); }; },
  mueve: (f, dx, dy) => (x, y) => f(x - dx, y - dy),
};
// gira un punto (para colocar detalles sobre una pieza girada)
function giraP(x, y, a, px, py) { const c = Math.cos(a), s = Math.sin(a), dx = x - px, dy = y - py; return [px + dx * c - dy * s, py + dx * s + dy * c]; }

// El pincel de un fotograma. w × h píxeles; (ox, oy) es donde caen los pies. t: { sx, sy } aplasta o estira desde los pies,
// inc inclina (lo de arriba se va hacia delante), espejo mira a la izquierda.
class Pincel {
  constructor(w, h, ox, oy, t = {}) {
    this.w = w; this.h = h; this.ox = ox; this.oy = oy;
    this.sx = t.sx || 1; this.sy = t.sy || 1; this.inc = t.inc || 0; this.esp = t.espejo ? -1 : 1;
    this.col = new Uint32Array(w * h); this.due = new Int16Array(w * h).fill(-1); this.lin = new Uint8Array(w * h);
    this.m = new Uint8Array(w * h); this.pals = [];
  }
  // rellena this.m con la forma; devuelve si ha caído algún píxel
  mascara(f) {
    const { w, h, ox, oy, sx, sy, inc, esp, m } = this;
    let algo = false;
    for (let j = 0; j < h; j++) {
      const Y = j + 0.5 - oy, y = Y / sy;
      for (let i = 0; i < w; i++) {
        const X = i + 0.5 - ox, x = (esp * X + inc * Y) / sx;
        const d = f(x, y) ? 1 : 0;
        m[j * w + i] = d; if (d) algo = true;
      }
    }
    return algo;
  }
  // una pieza con sus tres tonos y su contorno. o: { sombra: grosor (0 = sin), luz: false, linea: false }
  parte(f, p, o = {}) {
    if (!this.mascara(f)) return;
    const { w, h, m } = this, id = this.pals.push(p) - 1;
    const sh = o.sombra === undefined ? 2 : o.sombra, luz = o.luz !== false, lin = o.linea !== false;
    const en = (i, j) => i >= 0 && j >= 0 && i < w && j < h && m[j * w + i] === 1;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const k = j * w + i;
      if (!m[k]) continue;
      let c = p.b, L = 0;
      if (lin && (!en(i - 1, j) || !en(i + 1, j) || !en(i, j - 1) || !en(i, j + 1))) { c = p.o; L = 1; }
      else if (sh && (!en(i + sh, j + sh) || !en(i, j + sh + 1))) c = p.s;
      else if (luz && (!en(i - 2, j - 2) || (o.luz === 2 && !en(i - 3, j - 2)))) c = p.l;
      this.col[k] = rgba(c); this.due[k] = id; this.lin[k] = L;
    }
  }
  // un detalle de un solo color, sin sombra ni contorno (ojos, bocas, brillos)
  plano(f, color) {
    if (!this.mascara(f)) return;
    const v = rgba(color), id = this.pals.push(null) - 1;
    for (let k = 0; k < this.m.length; k++) if (this.m[k]) { this.col[k] = v; this.due[k] = id; this.lin[k] = 0; }
  }
  // un píxel suelto en coordenadas del dibujo
  px(x, y, color) {
    const Y = y * this.sy, X = this.esp * (x * this.sx - this.inc * Y);
    const i = Math.floor(X + this.ox), j = Math.floor(Y + this.oy);
    if (i < 0 || j < 0 || i >= this.w || j >= this.h) return;
    const k = j * this.w + i;
    this.col[k] = rgba(color); if (this.due[k] < 0) this.due[k] = this.pals.push(null) - 1; this.lin[k] = 0;
  }
  // texto pequeño pintado en la pieza (letreros); usa la letra de letras.js
  letrero(txt, x, y, color) {
    let cx = x;
    for (const ch of txt) {
      const g = LETRA[ch] || LETRA['?'];
      g.forEach((fila, r) => { for (let c = 0; c < fila.length; c++) if (fila[c] === '#') this.px(cx + c + 0.5, y + r + 0.5, color); });
      cx += g[0].length + 1;
    }
  }
  // termina: el contorno que da al vacío se pinta oscuro (o «fuera»; null = del color de cada pieza); el que separa piezas, del color de la pieza
  lienzo(fuera = OL) {
    const { w, h, due, lin, col } = this;
    const a = document.createElement('canvas'); a.width = w; a.height = h;
    const b = document.createElement('canvas'); b.width = w; b.height = h;
    const ia = a.getContext('2d').createImageData(w, h), ib = b.getContext('2d').createImageData(w, h);
    const da = new Uint32Array(ia.data.buffer), db = new Uint32Array(ib.data.buffer);
    const vacio = (i, j) => i < 0 || j < 0 || i >= w || j >= h || due[j * w + i] < 0;
    const ol = fuera ? rgba(fuera) : 0, blanco = rgba('#ffffff');
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const k = j * w + i;
      if (due[k] < 0) continue;
      const borde = lin[k] && (vacio(i - 1, j) || vacio(i + 1, j) || vacio(i, j - 1) || vacio(i, j + 1));
      da[k] = borde && ol ? ol : col[k];
      db[k] = borde ? (ol || col[k]) : blanco;
    }
    a.getContext('2d').putImageData(ia, 0, 0); b.getContext('2d').putImageData(ib, 0, 0);
    return { c: a, b, ox: this.ox, oy: this.oy, w, h };
  }
}

// dibuja un fotograma con los pies en (x, y); blanco = destello de golpe
function pintaSpr(ctx, s, x, y, blanco) {
  if (!s) return;
  ctx.drawImage(blanco ? s.b : s.c, Math.round(x) - s.ox, Math.round(y) - s.oy);
}

// figuras de píxel para efectos y fondos (siempre en píxeles enteros)
function circuloPx(ctx, cx, cy, r, color) {
  ctx.fillStyle = color; cx = Math.round(cx); cy = Math.round(cy);
  for (let dy = -r; dy <= r; dy++) { const dx = Math.floor(Math.sqrt(r * r - dy * dy + r * 0.8)); ctx.fillRect(cx - dx, cy + dy, dx * 2 + 1, 1); }
}
function anilloPx(ctx, cx, cy, r, g, color) {
  ctx.fillStyle = color; cx = Math.round(cx); cy = Math.round(cy);
  const r2 = Math.max(0, r - g);
  for (let dy = -r; dy <= r; dy++) {
    const ext = Math.floor(Math.sqrt(Math.max(0, r * r - dy * dy + r * 0.8)));
    const int = Math.abs(dy) <= r2 ? Math.floor(Math.sqrt(Math.max(0, r2 * r2 - dy * dy + r2 * 0.8))) : -1;
    if (int < 0) ctx.fillRect(cx - ext, cy + dy, ext * 2 + 1, 1);
    else { ctx.fillRect(cx - ext, cy + dy, ext - int, 1); ctx.fillRect(cx + int + 1, cy + dy, ext - int, 1); }
  }
}
function ovaloPx(ctx, cx, cy, rx, ry, color) {
  ctx.fillStyle = color; cx = Math.round(cx); cy = Math.round(cy);
  for (let dy = -ry; dy <= ry; dy++) { const dx = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / ((ry + 0.4) * (ry + 0.4))))); ctx.fillRect(cx - dx, cy + dy, dx * 2 + 1, 1); }
}
// trama de puntos (sombras y luces a cuadros, como se hacía a mano)
function tramaPx(ctx, x, y, w, h, color, fase = 0) {
  ctx.fillStyle = color;
  for (let j = 0; j < h; j++) for (let i = (j + fase) & 1; i < w; i += 2) ctx.fillRect(x + i, y + j, 1, 1);
}
// cuántos píxeles enteros
const ent = Math.round;
