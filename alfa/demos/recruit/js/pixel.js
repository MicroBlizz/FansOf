// Fans of Recruit · PINCEL DE PÍXELES de recreativa. Cada dibujo se hace con formas (óvalos, cajas, polígonos, trazos) que se
// rellenan píxel a píxel. Cada pieza tiene volumen: la luz viene de arriba a la izquierda y el pincel reparte los 6 tonos de su
// material (contorno, sombra honda, sombra, base, luz y brillo) en franjas limpias, sin degradados, como se pintaba a mano.
// Una pieza que se pinta encima de otra le hace sombra. Basado en el pincel de Fans of Roguelite (demos/roguelite/js/pixel.js).
'use strict';

/* ---------- colores ---------- */
const RGBA_CACHE = new Map();
// '#rrggbb' → número para ImageData
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
const TINTA = '#0e0b1a';   // lo más oscuro del juego: hacia aquí se oscurece el contorno que da al vacío

// Un material: sus 6 tonos, del más oscuro al más claro → [contorno, sombra honda, sombra, base, luz, brillo].
// o.mate: sin brillo (tela, pelo, cartón). o.pulido: brillo más ancho (metal, cristal).
// o.fuera: cuánto se oscurece la línea que da al vacío (0.8: los personajes llevan lo más oscuro de la pantalla; los fondos,
// casi nada, para que no compitan con ellos).
function material(c, o = {}) {
  return { c, n: c.map(rgba), fuera: rgba(mezcla(c[0], TINTA, o.fuera === undefined ? 0.8 : o.fuera)), cortes: o.pulido ? CORTES_PULIDO : o.mate ? CORTES_MATE : CORTES, o };
}
// el mismo material visto de lejos: sus tonos se van hacia el color del aire (t de 0 a 1)
function apagado(M, hacia, t) { return material(M.c.map(c => mezcla(c, hacia, t)), Object.assign({}, M.o, { fuera: 0.05 })); }
// dónde cambia de tono según cuánta luz recibe el punto (de -1 a 1): sombra honda | sombra | base | luz | brillo
const CORTES = [0.0, 0.4, 0.82, 0.965], CORTES_MATE = [0.0, 0.4, 0.84, 2], CORTES_PULIDO = [0.05, 0.42, 0.78, 0.94];
// de dónde viene la luz: de arriba a la izquierda y un poco de frente
const LUZ = (() => { const v = [-0.5, -0.62, 0.6], l = Math.hypot(...v); return v.map(x => x / l); })();

/* ---------- formas ----------
   Cada forma es una función (x, y) → distancia al borde (negativa dentro). Así el pincel sabe cuánto de «dentro» está cada
   píxel y puede redondear la luz. El origen está en los pies y la y crece hacia abajo (lo de arriba es negativo).
   .bb es la caja que la contiene [x0, y0, x1, y1], para no mirar píxeles de más. */
const conCaja = (f, x0, y0, x1, y1) => { f.bb = [x0, y0, x1, y1]; return f; };
const unirCajas = fs => { let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity; for (const f of fs) { a = Math.min(a, f.bb[0]); b = Math.min(b, f.bb[1]); c = Math.max(c, f.bb[2]); d = Math.max(d, f.bb[3]); } return [a, b, c, d]; };
const F = {
  // óvalo de radios rx, ry girado «a» radianes
  ov(cx, cy, rx, ry, a = 0) {
    const c = Math.cos(a), s = Math.sin(a), R = Math.max(rx, ry), m = Math.min(rx, ry);
    return conCaja((x, y) => {
      const dx = x - cx, dy = y - cy, u = dx * c + dy * s, v = -dx * s + dy * c;
      const k0 = Math.hypot(u / rx, v / ry), k1 = Math.hypot(u / (rx * rx), v / (ry * ry));
      return k1 < 1e-6 ? -m : k0 * (k0 - 1) / k1;
    }, cx - R, cy - R, cx + R, cy + R);
  },
  // caja (x, y, ancho, alto) con las esquinas redondeadas r
  rr(x, y, w, h, r = 0) {
    const cx = x + w / 2, cy = y + h / 2, hx = w / 2 - r, hy = h / 2 - r;
    return conCaja((px, py) => {
      const qx = Math.abs(px - cx) - hx, qy = Math.abs(py - cy) - hy;
      return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
    }, x, y, x + w, y + h);
  },
  // polígono: F.pol(x1, y1, x2, y2, …)
  pol(...p) {
    const n = p.length / 2;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (let i = 0; i < n; i++) { x0 = Math.min(x0, p[2 * i]); x1 = Math.max(x1, p[2 * i]); y0 = Math.min(y0, p[2 * i + 1]); y1 = Math.max(y1, p[2 * i + 1]); }
    return conCaja((x, y) => {
      let d = Infinity, s = 1;
      for (let i = 0, j = n - 1; i < n; j = i, i++) {
        const xi = p[2 * i], yi = p[2 * i + 1], ex = p[2 * j] - xi, ey = p[2 * j + 1] - yi, wx = x - xi, wy = y - yi;
        const t = Math.max(0, Math.min(1, (wx * ex + wy * ey) / (ex * ex + ey * ey || 1))), bx = wx - ex * t, by = wy - ey * t;
        d = Math.min(d, bx * bx + by * by);
        const c1 = y >= yi, c2 = y < p[2 * j + 1], c3 = ex * wy > ey * wx;
        if ((c1 && c2 && c3) || (!c1 && !c2 && !c3)) s = -s;
      }
      return s * Math.sqrt(d);
    }, x0, y0, x1, y1);
  },
  // trazo grueso de (x1, y1) a (x2, y2) que adelgaza de r1 a r2 (brazos, patas, orejas, cañones)
  tr(x1, y1, x2, y2, r1, r2 = r1) {
    const dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy || 1, R = Math.max(r1, r2);
    return conCaja((x, y) => {
      const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / l2));
      return Math.hypot(x - (x1 + dx * t), y - (y1 + dy * t)) - (r1 + (r2 - r1) * t);
    }, Math.min(x1, x2) - R, Math.min(y1, y2) - R, Math.max(x1, x2) + R, Math.max(y1, y2) + R);
  },
  // unir (cada una con su bulto), fundir (unión suave, como una sola pieza de barro), quitar y cruzar
  un: (...fs) => conCaja((x, y) => { let d = Infinity; for (const f of fs) { const v = f(x, y); if (v < d) d = v; } return d; }, ...unirCajas(fs)),
  fun: (k, ...fs) => conCaja((x, y) => {
    let d = fs[0](x, y);
    for (let i = 1; i < fs.length; i++) { const b = fs[i](x, y), h = Math.max(k - Math.abs(d - b), 0) / k; d = Math.min(d, b) - h * h * k * 0.25; }
    return d;
  }, ...unirCajas(fs).map((v, i) => v + (i < 2 ? -k : k))),
  menos: (a, b) => conCaja((x, y) => Math.max(a(x, y), -b(x, y)), ...a.bb),
  y: (a, b) => conCaja((x, y) => Math.max(a(x, y), b(x, y)), Math.max(a.bb[0], b.bb[0]), Math.max(a.bb[1], b.bb[1]), Math.min(a.bb[2], b.bb[2]), Math.min(a.bb[3], b.bb[3])),
  // engorda (o adelgaza, con n negativo) una forma n píxeles
  gordo: (f, n) => conCaja((x, y) => f(x, y) - n, f.bb[0] - n, f.bb[1] - n, f.bb[2] + n, f.bb[3] + n),
  // gira la forma «a» radianes alrededor de (px, py)
  gira(f, a, px, py) {
    const c = Math.cos(-a), s = Math.sin(-a), c2 = Math.cos(a), s2 = Math.sin(a), [x0, y0, x1, y1] = f.bb;
    const xs = [], ys = [];
    for (const [x, y] of [[x0, y0], [x1, y0], [x0, y1], [x1, y1]]) { xs.push(px + (x - px) * c2 - (y - py) * s2); ys.push(py + (x - px) * s2 + (y - py) * c2); }
    return conCaja((x, y) => { const dx = x - px, dy = y - py; return f(px + dx * c - dy * s, py + dx * s + dy * c); }, Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys));
  },
  mueve: (f, dx, dy) => conCaja((x, y) => f(x - dx, y - dy), f.bb[0] + dx, f.bb[1] + dy, f.bb[2] + dx, f.bb[3] + dy),
  // cinta: una tira que sigue los puntos [[x, y], …] con la mitad de ancho «anchos» en cada uno (capas, colas, cintas).
  // picos: cuántos picos tiene el final (0 = recto); hondo: cuánto se meten
  cinta(pts, anchos, picos = 0, hondo = 2) {
    const P = [], A = [], n = pts.length;
    // se suaviza la línea (curva de Catmull-Rom) para que no haga esquinas
    for (let i = 0; i < n - 1; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[i], c = pts[i + 1], d = pts[Math.min(n - 1, i + 2)];
      for (let k = 0; k < 4; k++) {
        const t = k / 4, t2 = t * t, t3 = t2 * t;
        P.push([0.5 * (2 * b[0] + (c[0] - a[0]) * t + (2 * a[0] - 5 * b[0] + 4 * c[0] - d[0]) * t2 + (3 * b[0] - a[0] - 3 * c[0] + d[0]) * t3),
          0.5 * (2 * b[1] + (c[1] - a[1]) * t + (2 * a[1] - 5 * b[1] + 4 * c[1] - d[1]) * t2 + (3 * b[1] - a[1] - 3 * c[1] + d[1]) * t3)]);
        A.push(anchos[i] + (anchos[i + 1] - anchos[i]) * t);
      }
    }
    P.push(pts[n - 1]); A.push(anchos[n - 1]);
    const izq = [], der = [], m = P.length;
    let nx = 0, ny = 0, tx = 0, ty = 0;
    for (let i = 0; i < m; i++) {
      const a = P[Math.max(0, i - 1)], b = P[Math.min(m - 1, i + 1)], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      tx = (b[0] - a[0]) / l; ty = (b[1] - a[1]) / l; nx = -ty; ny = tx;
      izq.push(P[i][0] + nx * A[i], P[i][1] + ny * A[i]); der.unshift(P[i][0] - nx * A[i], P[i][1] - ny * A[i]);
    }
    // los picos del final: de un borde al otro, entrando y saliendo
    const fin = [], e = P[m - 1], w = A[m - 1];
    for (let k = 1; k < picos * 2; k++) { const u = 1 - k / picos, d = k % 2 ? hondo : 0; fin.push(e[0] + nx * w * u - tx * d, e[1] + ny * w * u - ty * d); }
    return F.pol(...izq, ...fin, ...der);
  },
};
// gira un punto (para colocar detalles sobre una pieza girada)
function giraP(x, y, a, px, py) { const c = Math.cos(a), s = Math.sin(a), dx = x - px, dy = y - py; return [px + dx * c - dy * s, py + dx * s + dy * c]; }

/* ---------- el pincel de un fotograma ----------
   w × h píxeles; (ox, oy) es donde caen los pies. t: { sx, sy } aplasta o estira desde los pies, inc inclina (lo de arriba se
   va hacia delante) y espejo mira a la izquierda. De cada píxel se guarda su material y su tono (0 a 5), así que después se
   puede aclarar u oscurecer una zona (pliegues, sombras, juntas de chapa) sin salirse de los colores del material. */
class Pincel {
  constructor(w, h, ox, oy, t = {}) {
    this.w = w; this.h = h; this.ox = ox; this.oy = oy;
    this.sx = t.sx || 1; this.sy = t.sy || 1; this.inc = t.inc || 0; this.esp = t.espejo ? -1 : 1;
    const n = w * h;
    this.mat = new Int16Array(n).fill(-1);   // material de cada píxel (-1 vacío, -2 color fijo)
    this.niv = new Uint8Array(n);            // su tono (0 = línea)
    this.fijo = new Uint32Array(n);          // su color, si es fijo
    this.pieza = new Int16Array(n);          // qué pieza lo pintó
    this.mats = []; this.np = 0;
  }
  // del dibujo a la rejilla y al revés
  aRejilla(x, y) { const Y = y * this.sy, X = this.esp * (x * this.sx - this.inc * Y); return [X + this.ox, Y + this.oy]; }
  // la distancia de la forma en cada píxel de su caja; devuelve null si no cae ninguno dentro
  _campo(f) {
    const { w, h, ox, oy, sx, sy, inc, esp } = this, b = f.bb || [-ox, -oy, w - ox, h - oy];
    let i0 = Infinity, j0 = Infinity, i1 = -Infinity, j1 = -Infinity;
    for (const [x, y] of [[b[0], b[1]], [b[2], b[1]], [b[0], b[3]], [b[2], b[3]]]) { const [i, j] = this.aRejilla(x, y); i0 = Math.min(i0, i); i1 = Math.max(i1, i); j0 = Math.min(j0, j); j1 = Math.max(j1, j); }
    i0 = Math.max(0, Math.floor(i0) - 2); j0 = Math.max(0, Math.floor(j0) - 2); i1 = Math.min(w - 1, Math.ceil(i1) + 2); j1 = Math.min(h - 1, Math.ceil(j1) + 2);
    const bw = i1 - i0 + 1, bh = j1 - j0 + 1;
    if (bw <= 0 || bh <= 0) return null;
    const sd = new Float32Array(bw * bh);
    let algo = false;
    for (let j = 0; j < bh; j++) {
      const Y = j0 + j + 0.5 - oy, y = Y / sy;
      for (let i = 0; i < bw; i++) {
        const X = i0 + i + 0.5 - ox, v = f((esp * X + inc * Y) / sx, y);
        sd[j * bw + i] = v; if (v < 0) algo = true;
      }
    }
    return algo ? { sd, i0, j0, bw, bh } : null;
  }
  _mat(M) { let i = this.mats.indexOf(M); if (i < 0) i = this.mats.push(M) - 1; return i; }
  /* una pieza con volumen. o:
       r        radio del canto redondeado en píxeles (por defecto 4; 0 = pieza plana con la luz de su material)
       linea    false = sin línea de contorno
       sombra   cuántos píxeles de sombra echa sobre lo que tiene debajo (por defecto 2; 0 = ninguna)
       plano    tono fijo (1 a 5) en vez de volumen
       canto    con plano: [luz, sombra] = cuánto se aclara el borde de arriba y de la izquierda y cuánto se oscurece el de
                abajo y de la derecha (1 = [1, -1]); así se pintan paredes, mesas y chapas
       sobre    true = solo pinta donde ya hay dibujo */
  parte(f, M, o = {}) {
    const C = this._campo(f);
    if (!C) return 0;
    const { sd, i0, j0, bw, bh } = C, { w } = this, m = this._mat(M), id = ++this.np;
    const R = o.r === undefined ? 4 : o.r, lin = o.linea !== false, cortes = o.cortes || M.cortes;
    const dentro = (i, j) => i >= 0 && j >= 0 && i < bw && j < bh && sd[j * bw + i] < 0;
    const val = (i, j) => sd[Math.max(0, Math.min(bh - 1, j)) * bw + Math.max(0, Math.min(bw - 1, i))];
    for (let j = 0; j < bh; j++) for (let i = 0; i < bw; i++) {
      const d = sd[j * bw + i];
      if (d >= 0) continue;
      const k = (j0 + j) * w + i0 + i;
      if (o.sobre && this.mat[k] === -1) continue;
      let nv;
      if (lin && (!dentro(i - 1, j) || !dentro(i + 1, j) || !dentro(i, j - 1) || !dentro(i, j + 1))) nv = 0;
      else if (o.plano) {
        nv = o.plano;
        if (o.canto) {
          const [ca, cb] = o.canto === 1 ? [1, -1] : o.canto, q = lin ? 1 : 0;
          if (!dentro(i + 1 + q, j) || !dentro(i, j + 1 + q)) nv += cb;
          else if (!dentro(i - 1 - q, j) || !dentro(i, j - 1 - q)) nv += ca;
          nv = Math.max(1, Math.min(5, nv));
        }
      } else {
        const gx = val(i + 1, j) - val(i - 1, j), gy = val(i, j + 1) - val(i, j - 1), gl = Math.hypot(gx, gy) || 1;
        const lat = R > 0 ? Math.max(0, 1 - (-d - 0.5) / R) : 0, nz = Math.sqrt(1 - lat * lat);
        const lam = (gx / gl * LUZ[0] + gy / gl * LUZ[1]) * lat + nz * LUZ[2];
        nv = lam >= cortes[3] ? 5 : lam >= cortes[2] ? 4 : lam >= cortes[1] ? 3 : lam >= cortes[0] ? 2 : 1;
      }
      this.mat[k] = m; this.niv[k] = nv; this.pieza[k] = id; this.fijo[k] = 0;
    }
    // la sombra que echa sobre las piezas de debajo (hacia abajo a la derecha)
    const sh = o.sombra === undefined ? 2 : o.sombra;
    if (sh) for (let j = 0; j < bh + sh; j++) for (let i = 0; i < bw + sh; i++) {
      if (dentro(i, j)) continue;
      let toca = false;
      for (let q = 1; q <= sh && !toca; q++) toca = dentro(i - q, j - q) || dentro(i - q + 1, j - q);
      if (!toca) continue;
      const I = i0 + i, J = j0 + j;
      if (I >= w || J >= this.h) continue;
      const k = J * w + I;
      if (this.mat[k] >= 0 && this.pieza[k] !== id && this.niv[k] > 1) this.niv[k]--;
    }
    return id;
  }
  // aclara (n positivo) u oscurece (n negativo) lo que ya está pintado dentro de la forma. solo: pieza o lista de piezas.
  // si: función (i, j, distancia al borde) → ¿se cambia este píxel? (para tramas de puntos, ruido y degradados a mano)
  tono(f, n, solo, si) {
    const C = this._campo(f);
    if (!C) return;
    const { sd, i0, j0, bw, bh } = C, piezas = solo === undefined || solo === null ? null : [].concat(solo);
    for (let j = 0; j < bh; j++) for (let i = 0; i < bw; i++) {
      if (sd[j * bw + i] >= 0) continue;
      const k = (j0 + j) * this.w + i0 + i;
      if (this.mat[k] < 0 || this.niv[k] === 0 || (piezas && !piezas.includes(this.pieza[k]))) continue;
      if (si && !si(i0 + i, j0 + j, -sd[j * bw + i])) continue;
      this.niv[k] = Math.max(1, Math.min(5, this.niv[k] + n));
    }
  }
  // abre un hueco: borra lo pintado dentro de la forma (ventanas, agujeros, mordiscos)
  hueco(f) {
    const C = this._campo(f);
    if (!C) return;
    const { sd, i0, j0, bw, bh } = C;
    for (let j = 0; j < bh; j++) for (let i = 0; i < bw; i++) if (sd[j * bw + i] < 0) this.mat[(j0 + j) * this.w + i0 + i] = -1;
  }
  // un detalle de un solo color, sin volumen (ojos, bocas, luces). o.sobre: solo donde ya hay dibujo
  plano(f, color, o = {}) {
    const C = this._campo(f);
    if (!C) return 0;
    const { sd, i0, j0, bw, bh } = C, v = rgba(color), id = ++this.np;
    for (let j = 0; j < bh; j++) for (let i = 0; i < bw; i++) {
      if (sd[j * bw + i] >= 0) continue;
      const k = (j0 + j) * this.w + i0 + i;
      if (o.sobre && this.mat[k] === -1) continue;
      this.mat[k] = -2; this.fijo[k] = v; this.pieza[k] = id; this.niv[k] = 3;
    }
    return id;
  }
  _k(x, y) {
    const [X, Y] = this.aRejilla(x, y), i = Math.floor(X), j = Math.floor(Y);
    return i < 0 || j < 0 || i >= this.w || j >= this.h ? -1 : j * this.w + i;
  }
  // un píxel suelto de un color
  px(x, y, color) { const k = this._k(x, y); if (k < 0) return; this.mat[k] = -2; this.fijo[k] = rgba(color); this.niv[k] = 3; }
  // un píxel suelto de un material con su tono
  pxm(x, y, M, nv) { const k = this._k(x, y); if (k < 0) return; this.mat[k] = this._mat(M); this.niv[k] = nv; this.fijo[k] = 0; }
  // cambia el tono de un píxel ya pintado (n: cuánto; fijo = true lo pone tal cual)
  tonoPx(x, y, n, fijo) { const k = this._k(x, y); if (k < 0 || this.mat[k] < 0) return; this.niv[k] = fijo ? n : Math.max(1, Math.min(5, this.niv[k] + n)); }
  // línea de 1 píxel de (x1, y1) a (x2, y2): con color, de ese color; sin color, es una junta (oscurece 2 tonos lo que haya)
  raya(x1, y1, x2, y2, color, n = -2) {
    const [a, b] = this.aRejilla(x1, y1), [c, d] = this.aRejilla(x2, y2);
    let i = Math.floor(a), j = Math.floor(b);
    const i2 = Math.floor(c), j2 = Math.floor(d), dx = Math.abs(i2 - i), dy = -Math.abs(j2 - j), sx = i < i2 ? 1 : -1, sy = j < j2 ? 1 : -1;
    let e = dx + dy;
    const v = color ? rgba(color) : 0;
    for (;;) {
      if (i >= 0 && j >= 0 && i < this.w && j < this.h) {
        const k = j * this.w + i;
        if (v) { this.mat[k] = -2; this.fijo[k] = v; this.niv[k] = 3; }
        else if (this.mat[k] >= 0 && this.niv[k] > 0) this.niv[k] = Math.max(1, Math.min(5, this.niv[k] + n));
      }
      if (i === i2 && j === j2) break;
      const e2 = 2 * e;
      if (e2 >= dy) { e += dy; i += sx; }
      if (e2 <= dx) { e += dx; j += sy; }
    }
  }
  // remache: un punto de luz con su sombrita debajo
  remache(x, y) { this.tonoPx(x, y, 5, true); this.tonoPx(x + this.esp, y + 1, -1); }
  // texto pintado en la pieza, centrado en cx; usa las letras de letras.js ('normal', con sus tildes, o 'mini'). Se lee bien
  // aunque el dibujo esté en espejo. Con color, de ese color; sin color, cambia el tono de lo que haya (n) como un grabado
  letrero(txt, cx, y, color, fuente = 'normal', n = -2) {
    const t = preparaTexto(txt, fuente), W = anchoTexto(txt, 1, fuente);
    let u = 0;
    const pon = (c, r) => { const x = cx + this.esp * (u + c - W / 2 + 0.5); if (color) this.px(x, y + r + 0.5, color); else this.tonoPx(x, y + r + 0.5, n); };
    for (const ch of t) {
      const g = glifo(ch, fuente);
      g.forEach((fila, r) => { for (let c = 0; c < fila.length; c++) if (fila[c] === '#') pon(c, r); });
      if (g.marca) for (const [r, c] of g.marca) pon(c, r);
      u += g[0].length + 1;
    }
  }
  // termina el dibujo. Devuelve { c: lienzo, b: el mismo en blanco (destello de golpe), ox, oy, w, h }
  lienzo() {
    const { w, h, mat, niv, fijo, mats } = this;
    const a = document.createElement('canvas'); a.width = w; a.height = h;
    const b = document.createElement('canvas'); b.width = w; b.height = h;
    const ia = a.getContext('2d').createImageData(w, h), ib = b.getContext('2d').createImageData(w, h);
    const da = new Uint32Array(ia.data.buffer), db = new Uint32Array(ib.data.buffer), blanco = rgba('#ffffff');
    const vacio = (i, j) => i < 0 || j < 0 || i >= w || j >= h || mat[j * w + i] === -1;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const k = j * w + i, m = mat[k];
      if (m === -1) continue;
      if (m === -2) { da[k] = fijo[k]; db[k] = blanco; continue; }
      const M = mats[m];
      // la línea que da al vacío por abajo o por la derecha es más oscura; por arriba y por la izquierda le da la luz
      const borde = niv[k] === 0 && (vacio(i + 1, j) || vacio(i, j + 1) || vacio(i - 1, j) || vacio(i, j - 1));
      da[k] = borde ? M.fuera : M.n[niv[k]];
      db[k] = borde ? M.fuera : blanco;
    }
    a.getContext('2d').putImageData(ia, 0, 0); b.getContext('2d').putImageData(ib, 0, 0);
    return { c: a, b, ox: this.ox, oy: this.oy, w, h };
  }
}

// un punto del dibujo (la boca del arma), tal como queda cuando el fotograma se estira o se inclina con t = { sx, sy, inc }
function bocaDeformada(b, t) { const Y = b[1] * (t.sy || 1); return [b[0] * (t.sx || 1) - (t.inc || 0) * Y, Y]; }
// dibuja un fotograma con los pies en (x, y). espejo: mirando a la izquierda. blanco: destello de golpe
function pintaSpr(ctx, s, x, y, espejo, blanco) {
  if (!s) return;
  const img = blanco ? s.b : s.c;
  x = Math.round(x); y = Math.round(y);
  if (!espejo) { ctx.drawImage(img, x - s.ox, y - s.oy); return; }
  ctx.save(); ctx.translate(x, 0); ctx.scale(-1, 1); ctx.drawImage(img, -s.ox, y - s.oy); ctx.restore();
}
