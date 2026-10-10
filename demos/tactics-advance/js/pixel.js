// Fans of Tactics Advance (prototipo) · PINCEL DE PÍXELES: cada dibujo se hace con formas (óvalos, polígonos, trazos) rellenas píxel a
// píxel, con tres tonos por pieza (luz arriba a la izquierda, base y sombra abajo a la derecha) y contorno de color, como el
// pixel art de la Game Boy Advance. Basado en el pincel de Fans of Roguelite (demos/roguelite/js/pixel.js).
'use strict';

const OL = '#1c1028';   // el contorno más oscuro (el de todos los juegos de Fans Of)

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
// paleta de una pieza: base, sombra, luz y contorno
const pal = (b, s, l, o) => ({ b, s, l, o });

// formas: funciones (x, y) → ¿dentro?  El origen está en los pies; lo de arriba es negativo.
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
  gira: (f, a, px, py) => { const c = Math.cos(-a), s = Math.sin(-a); return (x, y) => { const dx = x - px, dy = y - py; return f(px + dx * c - dy * s, py + dx * s + dy * c); }; },
  mueve: (f, dx, dy) => (x, y) => f(x - dx, y - dy),
};
function giraP(x, y, a, px, py) { const c = Math.cos(a), s = Math.sin(a), dx = x - px, dy = y - py; return [px + dx * c - dy * s, py + dx * s + dy * c]; }

// Un fotograma de w × h píxeles; (ox, oy) es donde caen los pies. t: { sx, sy, esc } estira desde los pies; espejo mira a la izquierda.
class Pincel {
  constructor(w, h, ox, oy, t = {}) {
    this.w = w; this.h = h; this.ox = ox; this.oy = oy;
    const e = t.esc || 1;
    this.sx = (t.sx || 1) * e; this.sy = (t.sy || 1) * e; this.esp = t.espejo ? -1 : 1;
    this.col = new Uint32Array(w * h); this.due = new Int16Array(w * h).fill(-1); this.lin = new Uint8Array(w * h);
    this.borde = []; this.m = new Uint8Array(w * h);
  }
  mascara(f) {
    const { w, h, ox, oy, sx, sy, esp, m } = this;
    let algo = false;
    for (let j = 0; j < h; j++) {
      const y = (j + 0.5 - oy) / sy;
      for (let i = 0; i < w; i++) {
        const x = (esp * (i + 0.5 - ox)) / sx;
        const d = f(x, y) ? 1 : 0;
        m[j * w + i] = d; if (d) algo = true;
      }
    }
    return algo;
  }
  // una pieza: o = { sombra: grosor (0 = sin), luz: grosor (0 = sin), linea: false, brillo: [x, y] }
  parte(f, p, o = {}) {
    if (!this.mascara(f)) return;
    const { w, h, m } = this, id = this.borde.push(p.o) - 1;
    const sh = o.sombra === undefined ? 2 : o.sombra, lz = o.luz === undefined ? 1 : o.luz, lin = o.linea !== false;
    const en = (i, j) => i >= 0 && j >= 0 && i < w && j < h && m[j * w + i] === 1;
    const dl = this.esp;   // la luz viene de arriba a la izquierda también en espejo
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const k = j * w + i;
      if (!m[k]) continue;
      let c = p.b, L = 0;
      if (lin && (!en(i - 1, j) || !en(i + 1, j) || !en(i, j - 1) || !en(i, j + 1))) { c = p.o; L = 1; }
      else if (sh && (!en(i + sh, j + sh) || !en(i, j + sh + 1))) c = p.s;
      else if (lz && (!en(i - lz - 1, j - lz - 1) || !en(i - 1, j - lz - 1))) c = p.l;
      this.col[k] = rgba(c); this.due[k] = id; this.lin[k] = L;
    }
    if (o.brillo) this.px(o.brillo[0], o.brillo[1], '#ffffff');
  }
  // un detalle de un solo color, sin sombra ni contorno (ojos, bocas, brillos)
  plano(f, color) {
    if (!this.mascara(f)) return;
    const v = rgba(color), id = this.borde.push(null) - 1;
    for (let k = 0; k < this.m.length; k++) if (this.m[k]) { this.col[k] = v; this.due[k] = id; this.lin[k] = 0; }
  }
  // un dibujo hecho a mano (filas de letras) con su esquina arriba a la izquierda en (x, y); col: letra → color
  sello(x, y, filas, col) {
    filas.forEach((f, j) => { for (let i = 0; i < f.length; i++) { const c = col[f[i]]; if (c) this.px(x + i + 0.5, y + j + 0.5, c); } });
  }
  px(x, y, color) {
    const i = Math.floor(this.esp * x * this.sx + this.ox), j = Math.floor(y * this.sy + this.oy);
    if (i < 0 || j < 0 || i >= this.w || j >= this.h) return;
    const k = j * this.w + i;
    this.col[k] = rgba(color); if (this.due[k] < 0) this.due[k] = this.borde.push(null) - 1; this.lin[k] = 0;
  }
  // termina: el contorno que da al vacío se oscurece (color de la pieza mezclado con el contorno general)
  lienzo() {
    const { w, h, due, lin, col, borde } = this;
    const a = document.createElement('canvas'); a.width = w; a.height = h;
    const b = document.createElement('canvas'); b.width = w; b.height = h;
    const ia = a.getContext('2d').createImageData(w, h), ib = b.getContext('2d').createImageData(w, h);
    const da = new Uint32Array(ia.data.buffer), db = new Uint32Array(ib.data.buffer);
    const vacio = (i, j) => i < 0 || j < 0 || i >= w || j >= h || due[j * w + i] < 0;
    const blanco = rgba('#ffffff'), cache = new Map();
    const fuera = id => { let v = cache.get(id); if (v === undefined) { const o = borde[id]; v = rgba(o ? mezcla(o, OL, 0.6) : OL); cache.set(id, v); } return v; };
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const k = j * w + i;
      if (due[k] < 0) continue;
      const exterior = lin[k] && (vacio(i - 1, j) || vacio(i + 1, j) || vacio(i, j - 1) || vacio(i, j + 1));
      da[k] = exterior ? fuera(due[k]) : col[k];
      db[k] = blanco;
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

// trama de Bayer 4×4 para degradados de consola
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const bayer = (i, j) => (BAYER[(j & 3) * 4 + (i & 3)] + 0.5) / 16;
function hash(a, b, c = 0) { let n = (a * 374761393 + b * 668265263 + c * 1442695041) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; }
