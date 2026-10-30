// Fans of Karts (prototipo) · FOTOS DE MODELOS: los karts y los objetos se montan con piezas sencillas en 3D (bolas, cajas y conos)
// y se les hace una «foto» de pocos píxeles desde cada ángulo, con tres tonos por pieza y contorno oscuro. Así salen con el aspecto
// de los muñecos pre-renderizados de las consolas portátiles, y un mismo modelo vale para todos los giros y todos los tamaños.
//
// Una pieza:  { t: 'esf' | 'caja' | 'cono', c: [x, y, z], r: [...], g: [giro z, giro x, giro y] en grados, m: 'material', parte: n }
//   esf  → r = [radio x, radio y, radio z]            (bola o huevo)
//   caja → r = [medio ancho, medio largo, medio alto]
//   cono → r = [radio abajo, radio arriba, media altura]   (con los dos radios iguales es un cilindro; el eje es su z)
// El modelo mira hacia +y, la derecha es +x y arriba es +z. Las piezas con la misma `parte` no se separan con una línea.
'use strict';

const RAD = Math.PI / 180;
const LUZ_FOTO = (() => { const l = [-0.5, 0.68, 0.54], n = Math.hypot(...l); return l.map(v => v / n); })();   // arriba a la izquierda, algo de frente
let NLX = 0, NLY = 0, NLZ = 0;   // la normal de la última pieza tocada (en sus propias coordenadas)

// ---------- dónde corta un rayo a cada tipo de pieza (devuelve la distancia, o -1 si no la toca) ----------
function cortaEsf(p, ox, oy, oz, dx, dy, dz) {
  const a = p.r[0], b = p.r[1], c = p.r[2];
  const qx = ox / a, qy = oy / b, qz = oz / c, ex = dx / a, ey = dy / b, ez = dz / c;
  const A = ex * ex + ey * ey + ez * ez, B = qx * ex + qy * ey + qz * ez, C = qx * qx + qy * qy + qz * qz - 1;
  const D = B * B - A * C;
  if (D < 0) return -1;
  const t = (-B - Math.sqrt(D)) / A;
  NLX = (ox + t * dx) / (a * a); NLY = (oy + t * dy) / (b * b); NLZ = (oz + t * dz) / (c * c);
  return t;
}
function cortaCaja(p, ox, oy, oz, dx, dy, dz) {
  let t0 = -1e9, t1 = 1e9, eje = 0, signo = 1, a, b, s;
  const rx = p.r[0], ry = p.r[1], rz = p.r[2];
  if (dx > 1e-9 || dx < -1e-9) {
    a = (-rx - ox) / dx; b = (rx - ox) / dx; s = -1;
    if (a > b) { const x = a; a = b; b = x; s = 1; }
    t0 = a; signo = s; t1 = b;
  } else if (ox > rx || ox < -rx) return -1;
  if (dy > 1e-9 || dy < -1e-9) {
    a = (-ry - oy) / dy; b = (ry - oy) / dy; s = -1;
    if (a > b) { const x = a; a = b; b = x; s = 1; }
    if (a > t0) { t0 = a; eje = 1; signo = s; }
    if (b < t1) t1 = b;
    if (t0 > t1) return -1;
  } else if (oy > ry || oy < -ry) return -1;
  if (dz > 1e-9 || dz < -1e-9) {
    a = (-rz - oz) / dz; b = (rz - oz) / dz; s = -1;
    if (a > b) { const x = a; a = b; b = x; s = 1; }
    if (a > t0) { t0 = a; eje = 2; signo = s; }
    if (b < t1) t1 = b;
    if (t0 > t1) return -1;
  } else if (oz > rz || oz < -rz) return -1;
  NLX = eje === 0 ? signo : 0; NLY = eje === 1 ? signo : 0; NLZ = eje === 2 ? signo : 0;
  return t0;
}
function cortaCono(p, ox, oy, oz, dx, dy, dz) {
  const h = p.r[2], rm = (p.r[0] + p.r[1]) / 2, k = (p.r[1] - p.r[0]) / (2 * h);
  let mejor = 1e9, nx = 0, ny = 0, nz = 0;
  const ro = rm + k * oz, A = dx * dx + dy * dy - k * k * dz * dz, B = ox * dx + oy * dy - k * dz * ro, C = ox * ox + oy * oy - ro * ro;
  if (A > 1e-9 || A < -1e-9) {
    const D = B * B - A * C;
    if (D >= 0) {
      const q = Math.sqrt(D);
      let t = (-B - q) / A, z = oz + t * dz, rz = rm + k * z;
      if (z >= -h && z <= h && rz >= 0) { mejor = t; nx = ox + t * dx; ny = oy + t * dy; nz = -k * rz; }
      t = (-B + q) / A; z = oz + t * dz; rz = rm + k * z;
      if (t < mejor && z >= -h && z <= h && rz >= 0) { mejor = t; nx = ox + t * dx; ny = oy + t * dy; nz = -k * rz; }
    }
  }
  if (dz > 1e-9 || dz < -1e-9) {
    let t = (h - oz) / dz, x = ox + t * dx, y = oy + t * dy, rz = rm + k * h;
    if (t < mejor && x * x + y * y <= rz * rz) { mejor = t; nx = 0; ny = 0; nz = 1; }
    t = (-h - oz) / dz; x = ox + t * dx; y = oy + t * dy; rz = rm - k * h;
    if (t < mejor && x * x + y * y <= rz * rz) { mejor = t; nx = 0; ny = 0; nz = -1; }
  }
  if (mejor > 1e8) return -1;
  NLX = nx; NLY = ny; NLZ = nz;
  return mejor;
}
const CORTA = { esf: cortaEsf, caja: cortaCaja, cono: cortaCono };

// ---------- preparar un modelo: cada pieza con su giro ya calculado y los colores de cada material ----------
function preparaModelo(piezas, mats) {
  const nombres = Object.keys(mats), paleta = [], plano = [], brillo = [];
  for (const n of nombres) {
    const m = typeof mats[n] === 'string' ? { c: mats[n] } : mats[n], t = tonos(m.c, m.fuerza === undefined ? 1 : m.fuerza);
    paleta.push([u32(m.s || t[0]), u32(m.c), u32(m.l || t[2]), u32(m.b || mezcla(m.l || t[2], '#ffffff', 0.7)), u32(mezcla(m.s || t[0], OLK, 0.6))]);
    plano.push(!!m.plano); brillo.push(!!m.brillo);
  }
  const lista = piezas.map((p, i) => {
    const g = p.g || [0, 0, 0], cz = Math.cos(g[0] * RAD), sz = Math.sin(g[0] * RAD), cx = Math.cos(g[1] * RAD), sx = Math.sin(g[1] * RAD), cy = Math.cos(g[2] * RAD), sy = Math.sin(g[2] * RAD);
    const R = [cz * cy - sz * sx * sy, -sz * cx, cz * sy + sz * sx * cy, sz * cy + cz * sx * sy, cz * cx, sz * sy - cz * sx * cy, -cx * sy, sx, cx * cy];
    const mi = nombres.indexOf(p.m);
    if (mi < 0) throw new Error('material desconocido: ' + p.m);
    const e = p.t === 'cono' ? [Math.max(p.r[0], p.r[1]), Math.max(p.r[0], p.r[1]), p.r[2]] : p.r;
    return { t: p.t, c: p.c, r: p.r, e, R, mi, corta: CORTA[p.t], parte: p.parte === undefined ? 1000 + i : p.parte, liso: !!p.liso };
  });
  return { lista, paleta, plano, brillo };
}

let FOTO_Z = new Float32Array(0), FOTO_ID = new Int16Array(0), FOTO_PARTE = new Int16Array(0);
// La foto: o = { w, h, ax, ay (dónde cae el punto [0,0,0] del modelo), esc (píxeles por unidad), giro (0 = visto por detrás, en radianes),
// incl (cuánto se mira desde arriba, en radianes), muestras (2 = cada píxel se decide con 4 puntos), contorno, lineas }
// Devuelve los colores (un número por píxel; 0 = transparente).
function fotoModelo(mod, o) {
  const n = o.muestras || 2, W = o.w * n, H = o.h * n, esc = o.esc * n, ax = o.ax * n, ay = o.ay * n, K = 400;
  const sr = Math.sin(o.giro), cr = Math.cos(o.giro), sp = Math.sin(o.incl), cp = Math.cos(o.incl);
  const V = [sr * cp, cr * cp, -sp], Rr = [cr, -sr, 0], U = [sr * sp, cr * sp, cp];
  if (FOTO_Z.length < W * H) { FOTO_Z = new Float32Array(W * H); FOTO_ID = new Int16Array(W * H); FOTO_PARTE = new Int16Array(W * H); }
  const zb = FOTO_Z, id = FOTO_ID, pa = FOTO_PARTE;
  zb.fill(1e9, 0, W * H); id.fill(-1, 0, W * H);
  for (const p of mod.lista) {
    const R = p.R, c = p.c;
    // la cámara, vista desde la pieza (cada vector pasado a las coordenadas de la pieza)
    const d0 = V[0] * R[0] + V[1] * R[3] + V[2] * R[6], d1 = V[0] * R[1] + V[1] * R[4] + V[2] * R[7], d2 = V[0] * R[2] + V[1] * R[5] + V[2] * R[8];
    const r0 = Rr[0] * R[0] + Rr[1] * R[3], r1 = Rr[0] * R[1] + Rr[1] * R[4], r2 = Rr[0] * R[2] + Rr[1] * R[5];
    const u0 = U[0] * R[0] + U[1] * R[3] + U[2] * R[6], u1 = U[0] * R[1] + U[1] * R[4] + U[2] * R[7], u2 = U[0] * R[2] + U[1] * R[5] + U[2] * R[8];
    // el trozo de foto que ocupa: su centro y lo que se extiende a lo ancho y a lo alto
    const px = c[0] * Rr[0] + c[1] * Rr[1], py = c[0] * U[0] + c[1] * U[1] + c[2] * U[2];
    const ea = p.e[0], eb = p.e[1], ec = p.e[2];
    const mw = p.t === 'esf' ? Math.sqrt(ea * ea * r0 * r0 + eb * eb * r1 * r1 + ec * ec * r2 * r2) : ea * Math.abs(r0) + eb * Math.abs(r1) + ec * Math.abs(r2);
    const mh = p.t === 'esf' ? Math.sqrt(ea * ea * u0 * u0 + eb * eb * u1 * u1 + ec * ec * u2 * u2) : ea * Math.abs(u0) + eb * Math.abs(u1) + ec * Math.abs(u2);
    const i0 = Math.max(0, Math.floor(ax + (px - mw) * esc)), i1 = Math.min(W - 1, Math.ceil(ax + (px + mw) * esc));
    const j0 = Math.max(0, Math.floor(ay - (py + mh) * esc)), j1 = Math.min(H - 1, Math.ceil(ay - (py - mh) * esc));
    if (i0 > i1 || j0 > j1) continue;
    const cl0 = c[0] * R[0] + c[1] * R[3] + c[2] * R[6], cl1 = c[0] * R[1] + c[1] * R[4] + c[2] * R[7], cl2 = c[0] * R[2] + c[1] * R[5] + c[2] * R[8];
    const bx = -d0 * K - cl0, by = -d1 * K - cl1, bz = -d2 * K - cl2;
    const plano = mod.plano[p.mi], brillo = mod.brillo[p.mi], corta = p.corta, base = p.mi * 4, parte = p.parte, uLuz = p.liso ? 0.72 : 0.6, uSombra = p.liso ? -0.2 : 0.1;
    // la luz, pasada también a las coordenadas de la pieza (así cada punto solo necesita una cuenta)
    const lmx = Rr[0] * LUZ_FOTO[0] + U[0] * LUZ_FOTO[1] - V[0] * LUZ_FOTO[2], lmy = Rr[1] * LUZ_FOTO[0] + U[1] * LUZ_FOTO[1] - V[1] * LUZ_FOTO[2], lmz = U[2] * LUZ_FOTO[1] - V[2] * LUZ_FOTO[2];
    const l0 = lmx * R[0] + lmy * R[3] + lmz * R[6], l1 = lmx * R[1] + lmy * R[4] + lmz * R[7], l2 = lmx * R[2] + lmy * R[5] + lmz * R[8];
    for (let j = j0; j <= j1; j++) {
      const Y = (ay - (j + 0.5)) / esc, fx = bx + u0 * Y, fy = by + u1 * Y, fz = bz + u2 * Y;
      for (let i = i0; i <= i1; i++) {
        const X = (i + 0.5 - ax) / esc;
        const t = corta(p, fx + r0 * X, fy + r1 * X, fz + r2 * X, d0, d1, d2);
        const k = j * W + i;
        if (t < 0 || t >= zb[k]) continue;
        zb[k] = t;
        let tono = 1;
        if (!plano) {
          const luz = (NLX * l0 + NLY * l1 + NLZ * l2) / (Math.sqrt(NLX * NLX + NLY * NLY + NLZ * NLZ) || 1);
          tono = luz > uLuz ? (brillo && luz > 0.9 ? 3 : 2) : luz > uSombra ? 1 : 0;
        }
        id[k] = base + tono; pa[k] = parte;
      }
    }
  }
  // de las muestras a los píxeles: se queda el color que más se repite si al menos la mitad de la casilla está tapada
  const w = o.w, h = o.h, col = new Int16Array(w * h).fill(-1), prof = new Float32Array(w * h), parte = new Int16Array(w * h);
  const minimo = n === 1 ? 1 : n === 2 ? 2 : 4, votos = new Int16Array(n * n), cuenta = new Uint8Array(n * n);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    let llenos = 0, distintos = 0;
    for (let b = 0; b < n; b++) for (let a = 0; a < n; a++) {
      const k = (j * n + b) * W + i * n + a, v = id[k];
      if (v < 0) continue;
      llenos++;
      let q = 0; while (q < distintos && votos[q] !== v) q++;
      if (q === distintos) { votos[q] = v; cuenta[q] = 0; distintos++; }
      cuenta[q]++;
    }
    if (llenos < minimo) continue;
    let m = 0; for (let q = 1; q < distintos; q++) if (cuenta[q] > cuenta[m]) m = q;
    const v = votos[m]; let z = 1e9, pt = 0;
    for (let b = 0; b < n; b++) for (let a = 0; a < n; a++) { const k = (j * n + b) * W + i * n + a; if (id[k] === v && zb[k] < z) { z = zb[k]; pt = pa[k]; } }
    col[j * w + i] = v; prof[j * w + i] = z; parte[j * w + i] = pt;
  }
  // líneas entre piezas: donde una pieza tapa a otra que queda bastante más lejos, el borde de la de detrás se oscurece
  const sal = new Uint32Array(w * h), umbral = o.lineas === undefined ? 2.2 : o.lineas;
  for (let k = 0; k < w * h; k++) if (col[k] >= 0) sal[k] = mod.paleta[col[k] >> 2][col[k] & 3];
  if (umbral > 0) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const k = j * w + i; if (col[k] < 0) continue;
      const z = prof[k] - umbral, pt = parte[k];
      if ((i > 0 && col[k - 1] >= 0 && parte[k - 1] !== pt && prof[k - 1] < z) || (i < w - 1 && col[k + 1] >= 0 && parte[k + 1] !== pt && prof[k + 1] < z)
        || (j > 0 && col[k - w] >= 0 && parte[k - w] !== pt && prof[k - w] < z) || (j < h - 1 && col[k + w] >= 0 && parte[k + w] !== pt && prof[k + w] < z)) sal[k] = mod.paleta[col[k] >> 2][(col[k] & 3) === 0 ? 4 : 0];
    }
  }
  // contorno: un píxel oscuro (con algo del color de la pieza) alrededor de la silueta
  if (o.contorno !== false) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const k = j * w + i; if (col[k] >= 0) continue;
      const q = i > 0 && col[k - 1] >= 0 ? k - 1 : i < w - 1 && col[k + 1] >= 0 ? k + 1 : j > 0 && col[k - w] >= 0 ? k - w : j < h - 1 && col[k + w] >= 0 ? k + w : -1;
      if (q >= 0) sal[k] = mod.paleta[col[q] >> 2][4];
    }
  }
  return sal;
}

// ---------- una figura: un modelo fotografiado desde `angs` ángulos y a varios tamaños (cada tamaño, una tira de fotos) ----------
// def = { piezas, mats, medio (media anchura, en unidades), alto (por encima del suelo), bajo (por debajo), angs, incl }
// Los tamaños van bajando poco a poco (RAZON_NIVEL): de lejos se usa una foto más pequeña en vez de encoger la grande, y así
// los contornos no se rompen.
const RAZON_NIVEL = 0.88, EXTRA_FOTO = 6;      // EXTRA_FOTO: tamaños más grandes que el de siempre (para la imagen HD)
class Figura {
  constructor(def) {
    this.def = def; this.mod = preparaModelo(def.piezas, def.mats);
    this.angs = def.angs || 1; this.incl = (def.incl === undefined ? 20 : def.incl) * RAD;
    this.niveles = [];
  }
  // la tira de fotos de un tamaño: esc = píxeles por unidad. Se puede hacer de golpe (tira) o poco a poco, una foto cada vez
  // (empieza y luego sigue hasta que devuelva true), para repartir el trabajo entre fotogramas.
  empieza(esc) {
    const d = this.def, w = 2 * Math.ceil(d.medio * esc) + 2, arriba = Math.ceil(d.alto * esc) + 1, h = arriba + Math.ceil((d.bajo || 0) * esc) + 1;
    const [c, x] = lienzo(w * this.angs, h);
    return { c, w, h, ax: w / 2, ay: arriba, esc, x, img: x.createImageData(w * this.angs, h), hechas: 0 };
  }
  sigue(t) {
    const d = this.def, w = t.w, h = t.h, a = t.hechas, px = new Uint32Array(t.img.data.buffer);
    const f = fotoModelo(this.mod, { w, h, ax: t.ax, ay: t.ay, esc: t.esc, giro: (a / this.angs) * TAU + (d.giro0 || 0), incl: this.incl, muestras: t.esc < 1.2 ? 3 : 2, contorno: d.contorno, lineas: t.esc < 1.6 ? 0 : d.lineas });
    for (let j = 0; j < h; j++) px.set(f.subarray(j * w, j * w + w), j * w * this.angs + a * w);
    if (++t.hechas < this.angs) return false;
    t.x.putImageData(t.img, 0, 0); t.x = null; t.img = null;
    return true;
  }
  tira(esc) { const t = this.empieza(esc); while (!this.sigue(t)) { /* una foto más */ } return t; }
  // el tamaño que más se acerca a `esc` (píxeles por unidad); `base` es el del nivel 0
  // (los niveles se guardan desplazados EXTRA_FOTO: el hueco 0 es el más grande de la HD; el EXTRA_FOTO, el de siempre)
  // Las grandes de la HD no se hacen de golpe (tardan): se piden a la cola de fotos y, mientras, se amplía la mayor que ya haya.
  nivel(esc, base) {
    const k = limita(Math.round(Math.log(esc / base) / Math.log(RAZON_NIVEL)), CAL === 2 ? -EXTRA_FOTO : 0, 26), i = k + EXTRA_FOTO;
    if (this.niveles[i]) return this.niveles[i];
    if (k < 0) {
      if (!this.pedidas) this.pedidas = new Set();
      if (!this.pedidas.has(k)) { this.pedidas.add(k); COLA_FOTOS.push([this, k, base * Math.pow(RAZON_NIVEL, k)]); }
      for (let j = i + 1; j <= EXTRA_FOTO; j++) if (this.niveles[j]) return this.niveles[j];
    }
    return (this.niveles[i] = this.tira(base * Math.pow(RAZON_NIVEL, k)));
  }
  listo(k) { return !!this.niveles[k + EXTRA_FOTO]; }
  // pinta la figura con el punto del suelo en (x, y); ang = giro respecto a la cámara (0 = de espaldas)
  pinta(ctx, x, y, esc, base, ang) {
    const t = this.nivel(esc, base), a = ((Math.round((ang / TAU) * this.angs) % this.angs) + this.angs) % this.angs;
    if (esc > t.esc * 1.06) {   // más cerca que la foto que hay: se amplía
      const f = esc / t.esc, w = Math.round(t.w * f), h = Math.round(t.h * f);
      ctx.drawImage(t.c, a * t.w, 0, t.w, t.h, Math.round(x - t.ax * f), Math.round(y - t.ay * f), w, h);
    } else ctx.drawImage(t.c, a * t.w, 0, t.w, t.h, Math.round(x - t.ax), Math.round(y - t.ay), t.w, t.h);
  }
}
