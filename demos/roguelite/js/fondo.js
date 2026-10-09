// Fans of Roguelite (prototipo) · El paisaje: cielo a franjas con tramas (cambia cada día, de la mañana a la noche roja del jefe),
// montañas, la torre de Microblizz que se acerca día a día, colinas con árboles, el camino y los carteles. Cada capa se mueve
// a su velocidad (las de lejos, más despacio) para dar profundidad.
'use strict';

const ESC = { Y: 24, H: 172 };          // dónde va la escena dentro de la pantalla (debajo del marcador)
const SUELO = ESC.Y + 138;              // la línea de los pies
const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
const hash = (x, y = 0, s = 0) => { let h = Math.imul(x ^ 0x9e3779b9, 374761393) ^ Math.imul(y + s * 7919, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

const DIA_LUZ = [
  { cielo: ['#3b5bdb', '#4c7cf0', '#5fa0ff', '#80c4ff', '#a8e0ff', '#d6f4ff', '#fff3c4'], tinte: '#ffe8b0', k: 0.06, sol: 'manana' },
  { cielo: ['#2f6fe0', '#3d86f2', '#4f9cff', '#6cb6ff', '#93d0ff', '#bfe6ff', '#e9f9ff'], tinte: '#ffffff', k: 0, sol: 'mediodia' },
  { cielo: ['#4a5fd6', '#6a74e8', '#8f86f0', '#c49af0', '#f0b2d4', '#ffd0b0', '#ffe9a8'], tinte: '#ffb070', k: 0.12, sol: 'tarde' },
  { cielo: ['#2a1b5e', '#4b2580', '#7a2e93', '#b8399a', '#ec5a8a', '#ff8a5c', '#ffc85a'], tinte: '#ff6a8a', k: 0.2, sol: 'ocaso' },
  { cielo: ['#160d3a', '#271a5e', '#3b2580', '#5b2f93', '#8a3a9a', '#c4508a', '#ff7a6a'], tinte: '#5a3aa0', k: 0.34, sol: 'luna' },
  { cielo: ['#0b0618', '#160a2a', '#22103d', '#331552', '#4a1a5c', '#6a1f5a', '#a02a4a'], tinte: '#2a1050', k: 0.46, sol: 'roja' },
];

function lienzoNuevo(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
// imagen píxel a píxel: f(x, y) → color o null
function imagen(w, h, f) {
  const c = lienzoNuevo(w, h), g = c.getContext('2d'), id = g.createImageData(w, h), d = new Uint32Array(id.data.buffer);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const col = f(x, y); if (col) d[y * w + x] = rgba(col); }
  g.putImageData(id, 0, 0);
  return c;
}
// tramas de 4×4 (para fundidos, sombras y focos): TRAMA[n] tapa n de cada 16 píxeles
const TRAMA_CACHE = new Map();
function trama(n, color) {
  const clave = n + color;
  let t = TRAMA_CACHE.get(clave);
  if (!t) { const c = imagen(4, 4, (x, y) => BAYER[y][x] < n ? color : null); t = c; TRAMA_CACHE.set(clave, t); }
  return t;
}
function rellenaTrama(ctx, x, y, w, h, n, color) {
  if (n <= 0) return;
  if (n >= 16) { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); return; }
  ctx.fillStyle = ctx.createPattern(trama(n, color), 'repeat'); ctx.fillRect(x, y, w, h);
}

/* ---------- cada día se pinta su paisaje (con su luz) ---------- */
const FONDO = { dia: -1 };
function preparaFondo(d) {
  const L = DIA_LUZ[d], ti = c => L.k ? mezcla(c, L.tinte, L.k) : c, hz = L.cielo[5];
  FONDO.dia = d; FONDO.L = L; FONDO.ti = ti;
  // cielo a franjas, con trama entre una y otra
  const alto = SUELO - ESC.Y - 18, n = L.cielo.length;
  const cielo = imagen(256, ESC.H, (x, y) => {
    const t = Math.min(n - 0.001, (y / alto) * n), i = Math.floor(t), fr = t - i;
    const sig = Math.min(n - 1, i + 1), u = Math.max(0, (fr - 0.55) / 0.45);
    return BAYER[y & 3][x & 3] / 16 < u * u ? L.cielo[sig] : L.cielo[i];
  });
  const g = cielo.getContext('2d');
  if (d >= 4) for (let k = 0; k < 70; k++) { const x = Math.floor(hash(k, 1, d) * 256), y = Math.floor(hash(k, 2, d) * 90); g.fillStyle = hash(k, 3) > 0.7 ? '#fff6ea' : '#b8a8e8'; g.fillRect(x, y, 1, 1); }
  pintaSol(g, L.sol);
  FONDO.cielo = cielo;
  // montañas lejanas (tira que se repite)
  const lejos = mezcla(ti('#6a7fd0'), hz, 0.45), lejosL = mezcla(ti('#a2b4f4'), hz, 0.35), lejosS = mezcla(ti('#4b5aa8'), hz, 0.4);
  const alt = x => 26 + 9 * Math.sin((x / 256) * Math.PI * 4 + 0.5) + 6 * Math.sin((x / 256) * Math.PI * 10 + 1.3) + 3 * Math.sin((x / 256) * Math.PI * 22);
  FONDO.montes = imagen(256, 48, (x, y) => {
    const top = 48 - Math.round(alt(x)); if (y < top) return null;
    const sube = alt(x) > alt(x - 1);
    if (y === top) return lejosL;
    if (!sube && y < top + 4 && BAYER[y & 3][x & 3] < 10) return lejosS;
    if (sube && y < top + 3) return mezcla(lejos, lejosL, 0.5);
    return lejos;
  });
  FONDO.torre = torreDe(d, ti, hz);
  FONDO.colinas = colinasDe(d, ti, hz);
  FONDO.suelo = sueloDe(ti);
  FONDO.delante = delanteDe(ti);
  FONDO.nubes = [0, 1, 2].map(i => nubeDe(i, L, ti));
  FONDO.props = {};
  FONDO.cosas = [];
  FONDO.sigProp = 40;
  FONDO.nubesPos = [0, 1, 2, 3].map(i => ({ x: hash(i, 5, d) * 300, y: ESC.Y + 6 + Math.floor(hash(i, 6, d) * 46), n: i % 3, v: 2 + hash(i, 7) * 3 }));
}

function pintaSol(g, tipo) {
  const W = 256;
  if (tipo === 'manana') { anilloPx(g, 52, 30, 13, 2, '#fff8d8'); circuloPx(g, 52, 30, 9, '#fff3a0'); circuloPx(g, 50, 28, 5, '#ffffff'); }
  if (tipo === 'mediodia') { anilloPx(g, 190, 18, 12, 1, '#ffffff'); circuloPx(g, 190, 18, 8, '#fffbe0'); }
  if (tipo === 'tarde') { anilloPx(g, 180, 52, 14, 2, '#ffe2a8'); circuloPx(g, 180, 52, 10, '#ffd070'); circuloPx(g, 178, 50, 5, '#fff3c0'); }
  if (tipo === 'ocaso') {   // el sol grande con rayas, como en las portadas de los 80
    const cx = 128, cy = 84, r = 26;
    for (let dy = -r; dy <= r; dy++) {
      const y = cy + dy, raya = dy > 2 && ((dy + 40) % 6) < Math.min(4, 1 + Math.floor(dy / 6));
      if (raya) continue;
      const dx = Math.floor(Math.sqrt(r * r - dy * dy));
      g.fillStyle = dy < -12 ? '#fff3a0' : dy < -2 ? '#ffd24a' : dy < 10 ? '#ffa040' : '#ff6a6a';
      g.fillRect(cx - dx, y, dx * 2 + 1, 1);
    }
  }
  if (tipo === 'luna') { circuloPx(g, 64, 30, 9, '#fff1d6'); circuloPx(g, 68, 27, 8, '#3b2580'); }
  if (tipo === 'roja') { anilloPx(g, 70, 36, 17, 2, '#6a1f3a'); circuloPx(g, 70, 36, 13, '#ff5a5a'); circuloPx(g, 66, 32, 4, '#ff8a8a'); circuloPx(g, 76, 40, 2, '#c43a4a'); circuloPx(g, 64, 42, 2, '#c43a4a'); }
}

// la sede de Microblizz a lo lejos: cada día un poco más grande
function torreDe(d, ti, hz) {
  const h = [34, 42, 52, 64, 78, 96][d], w = Math.round(h * 0.42), lejos = 0.5 - d * 0.08;
  const cuerpo = mezcla(ti('#24346e'), hz, lejos), luz = mezcla(ti('#3d5aa8'), hz, lejos), borde = mezcla('#141c3e', hz, lejos * 0.8);
  const c = lienzoNuevo(w + 8, h + 14), g = c.getContext('2d');
  const x0 = 4, y0 = 14;
  g.fillStyle = borde; g.fillRect(x0 - 1, y0 - 1, w + 2, h + 1);
  g.fillStyle = cuerpo; g.fillRect(x0, y0, w, h);
  g.fillStyle = luz; g.fillRect(x0, y0, 2, h);
  const cw = Math.max(4, Math.floor(w / 3));
  g.fillStyle = borde; g.fillRect(x0 + cw - 1, y0 - 9, w - cw * 2 + 2, 10);
  g.fillStyle = cuerpo; g.fillRect(x0 + cw, y0 - 8, w - cw * 2, 9);
  g.fillStyle = borde; g.fillRect(x0 + Math.floor(w / 2), 0, 1, y0 - 8);
  const noche = d >= 4;
  for (let y = y0 + 6; y < y0 + h - 3; y += 4) for (let x = x0 + 3; x < x0 + w - 3; x += 3) {
    const v = hash(x, y, d);
    g.fillStyle = v < (noche ? 0.65 : 0.3) ? (noche ? '#ffe08a' : mezcla('#ffe08a', hz, lejos)) : mezcla('#16306b', hz, lejos);
    g.fillRect(x, y, 2, 2);
  }
  if (h >= 50) { g.fillStyle = '#0f1d44'; g.fillRect(x0 + 2, y0 + 1, w - 4, 9); const t = lienzoTexto('MB', noche ? '#ff5a6a' : '#e8f1ff', 1, null); g.drawImage(t, Math.round(x0 + w / 2 - anchoTexto('MB') / 2) - t.ox, y0 + 2 - t.oy); }
  c.punta = [x0 + Math.floor(w / 2), 0];
  return c;
}

function arbolDe(tipo, ti, lejos, hz) {
  const m = c => mezcla(ti(c), hz, lejos);
  const p = new Pincel(24, 28, 12, 27);
  const tronco = pal(m('#8a5a3a'), m('#5a3a20'), m('#b07a50'), m('#3a2010'));
  if (tipo === 0) {
    p.parte(F.re(-1.5, -7, 3, 7), tronco, { sombra: 1 });
    p.parte(F.un(F.ov(0, -15, 7.5, 6.5), F.ov(-4.5, -10.5, 5, 4.5), F.ov(4.5, -10.5, 5, 4.5)), pal(m('#4cb04a'), m('#2e7a3a'), m('#8fe060'), m('#1d4a26')), { sombra: 3, luz: 2 });
  } else {
    p.parte(F.re(-1, -5, 2, 5), tronco, { sombra: 0 });
    p.parte(F.un(F.pol(0, -24, 6, -14, -6, -14), F.pol(0, -19, 8, -8, -8, -8), F.pol(0, -13, 9, -4, -9, -4)), pal(m('#2f8a5a'), m('#1d5a40'), m('#5cc27a'), m('#103a2a')), { sombra: 2 });
  }
  return p.lienzo(null);
}
function colinasDe(d, ti, hz) {
  const w = 384, h = 64, c = lienzoNuevo(w, h), g = c.getContext('2d');
  const hb = x => 34 + 9 * Math.sin((x / w) * Math.PI * 4 + 0.5) + 5 * Math.sin((x / w) * Math.PI * 10 + 1.2);
  const hf = x => 20 + 7 * Math.sin((x / w) * Math.PI * 6 + 2) + 4 * Math.sin((x / w) * Math.PI * 14);
  const atras = mezcla(ti('#5aa86a'), hz, 0.32), atrasL = mezcla(ti('#8fd28a'), hz, 0.3);
  const delante = mezcla(ti('#3e9a48'), hz, 0.12), delanteL = mezcla(ti('#7ad05a'), hz, 0.1), delanteS = mezcla(ti('#2e7a3a'), hz, 0.12);
  const pinta = (f, base, alto, sombra) => {
    for (let x = 0; x < w; x++) {
      const top = h - Math.round(f(x));
      g.fillStyle = alto; g.fillRect(x, top, 1, 1);
      g.fillStyle = base; g.fillRect(x, top + 1, 1, h - top);
      if (sombra && f(x) < f(x - 1)) { g.fillStyle = sombra; for (let y = top + 1; y < top + 5; y++) if (BAYER[y & 3][x & 3] < 8) g.fillRect(x, y, 1, 1); }
    }
  };
  pinta(hb, atras, atrasL, null);
  const lejosA = [arbolDe(0, ti, 0.35, hz), arbolDe(1, ti, 0.35, hz)], cercaA = [arbolDe(0, ti, 0.1, hz), arbolDe(1, ti, 0.1, hz)];
  const planta = (lista, f, n, s, dy) => {
    for (let i = 0; i < n; i++) {
      const x = Math.floor((i / n) * w + hash(i, s, d) * (w / n) * 0.7), t = lista[hash(i, s + 1) > 0.55 ? 1 : 0];
      for (const off of [-w, 0, w]) g.drawImage(t.c, x + off - 12, h - Math.round(f(x)) + dy - 27);
    }
  };
  planta(lejosA, hb, 9, 11, 4);
  pinta(hf, delante, delanteL, delanteS);
  planta(cercaA, hf, 7, 21, 5);
  return c;
}

// el suelo: hierba de atrás, camino de tierra, hierba de delante y el corte de tierra (tira de 64 que se repite)
function sueloDe(ti) {
  const C = { hb: ti('#5cc23a'), hs: ti('#3a8a2e'), hl: ti('#a8ec5c'), cam: ti('#e0b07a'), camS: ti('#c08a50'), camL: ti('#f6dcb0'), pie: ti('#a87040'),
    tierra: ti('#8a5a3a'), tierraS: ti('#6e4430'), tierraL: ti('#a8724a'), piedra: ti('#5a4a6a'), piedraL: ti('#8a7a9a') };
  return imagen(64, ESC.Y + ESC.H - (SUELO - 10), (x, y) => {
    const v = hash(x, y, 3), bl = Math.floor(hash(x, 0, 9) * 4);
    if (y < 4) return y >= 4 - bl && (x % 3) !== 1 ? (y === 4 - bl ? C.hl : C.hb) : null;
    if (y < 8) return y === 4 ? C.hl : y === 7 && BAYER[y & 3][x & 3] < 8 ? C.hs : C.hb;
    if (y < 24) {
      if (y === 8) return C.camS;
      if (y === 9 && BAYER[1][x & 3] < 8) return C.camS;
      if ((y === 14 || y === 19) && hash(x >> 2, y) > 0.25) return C.camS;
      if ((y === 15 || y === 20) && hash(x >> 2, y - 1) > 0.25 && v > 0.5) return C.camL;
      const pq = hash(x >> 1, y >> 1, 7);
      if (pq > 0.965) return (y & 1) ? C.pie : C.camL;
      if (y >= 22 && hash(x, 1, 4) < (y - 21) * 0.25) return C.hb;
      return C.cam;
    }
    if (y < 28) return y === 24 ? C.hl : y === 27 ? C.hs : C.hb;
    if (y === 28) return C.tierraS;
    if (y === 33 || y === 39) return v > 0.3 ? C.tierraL : C.tierra;
    const pd = hash(x >> 1, y >> 1, 11);
    if (pd > 0.93) return (x & 1) ? C.piedra : C.piedraL;
    if (y > 29 && hash(x, y >> 2, 13) > 0.96) return C.tierraS;
    return BAYER[y & 3][x & 3] < 3 ? C.tierraS : C.tierra;
  });
}
// hierbas y flores de delante (pasan más deprisa que el camino)
function delanteDe(ti) {
  const c = lienzoNuevo(160, 14), g = c.getContext('2d');
  for (let i = 0; i < 26; i++) {
    const x = Math.floor(hash(i, 1, 2) * 160), alto = 4 + Math.floor(hash(i, 2, 2) * 9);
    for (let k = -2; k <= 2; k++) {
      const a = alto - Math.abs(k) * 2 - (k & 1); if (a <= 0) continue;
      for (let y = 0; y < a; y++) { g.fillStyle = y === a - 1 ? ti('#a8ec5c') : y < 2 ? ti('#1d5a26') : ti('#3a8a2e'); g.fillRect((x + k + Math.round((y / a) * k * 0.6) + 160) % 160, 13 - y, 1, 1); }
    }
    if (hash(i, 4, 2) > 0.6) { const fy = 13 - alto - 1, col = hash(i, 5) > 0.5 ? '#ff7aa8' : '#ffcb3d'; g.fillStyle = OL; g.fillRect(x - 1, fy - 1, 3, 3); g.fillStyle = col; g.fillRect(x - 1, fy, 3, 1); g.fillRect(x, fy - 1, 1, 3); g.fillStyle = '#fff6ea'; g.fillRect(x, fy, 1, 1); }
  }
  return c;
}
function nubeDe(i, L, ti) {
  const p = new Pincel(48, 22, 24, 20);
  const base = mezcla(ti('#ffffff'), L.cielo[4], L.k > 0.3 ? 0.55 : 0.12);
  const pl = pal(base, mezcla(base, L.cielo[2], 0.35), mezcla(base, '#ffffff', 0.6), mezcla(base, L.cielo[1], 0.45));
  const f = [F.un(F.ov(0, -8, 11, 7), F.ov(-11, -4, 8, 4.5), F.ov(11, -4, 9, 5), F.ov(4, -12, 7, 6)), F.un(F.ov(0, -6, 9, 5.5), F.ov(-9, -3, 6, 3.5), F.ov(8, -3, 7, 3.5)), F.un(F.ov(-3, -5, 14, 4), F.ov(5, -8, 7, 4.5))][i];
  p.parte(F.y(f, F.re(-30, -30, 60, 29)), pl, { sombra: 3, luz: 2 });
  return p.lienzo(null);
}

/* ---------- cosas del camino: arbustos, flores, vallas, farolas, rocas y carteles de Microblizz ---------- */
const ESLOGANES = [['MICROBLIZZ', 'TE QUIERE'], ['JUGAR ES', 'TRABAJAR'], ['¡OFERTA!', 'CAJAS DE BOTÍN'], ['SE BUSCAN', 'BECARIOS'], ['TUS DATOS', 'NOS ENCANTAN'], ['PRÓXIMAMENTE', 'MÁS ANUNCIOS']];
function propDe(tipo, v) {
  const clave = tipo + v;
  if (FONDO.props[clave]) return FONDO.props[clave];
  const ti = FONDO.ti, T = c => ti(c);
  let s;
  if (tipo === 'arbusto') { const p = new Pincel(26, 14, 13, 13); p.parte(F.y(F.un(F.ov(0, -5, 8, 5.5), F.ov(-6, -3, 5, 3.6), F.ov(6, -3, 5.5, 3.6)), F.re(-20, -20, 40, 20)), pal(T('#4cb04a'), T('#2e7a3a'), T('#8fe060'), T('#1d4a26')), { sombra: 2, luz: 2 }); if (v) for (const [x, y] of [[-3, -7], [3, -5], [-6, -3]]) { p.px(x, y, T('#ff5c8a')); p.px(x + 1, y, T('#ffd6e8')); } s = p.lienzo(); }
  if (tipo === 'flores') { const p = new Pincel(14, 10, 7, 9); p.parte(F.y(F.ov(0, -1, 6, 2.5), F.re(-9, -9, 18, 8)), pal(T('#3e9a48'), T('#2e7a3a'), T('#7ad05a'), T('#1d4a26')), { sombra: 0 }); for (const [x, y, c] of [[-3, -4, '#ff7aa8'], [1, -6, '#ffcb3d'], [4, -3, '#b98aff']]) { p.plano(F.tr(x, y, x, -1, 0.5), T('#2e7a3a')); p.plano(F.ov(x, y, 1.4, 1.4), T(c)); p.px(x, y, '#fff6ea'); } s = p.lienzo(); }
  if (tipo === 'roca') { const p = new Pincel(14, 9, 7, 8); p.parte(F.y(F.ov(0, -2, 6, 4.5), F.re(-9, -9, 18, 8)), pal(T('#8a7a9a'), T('#5a4a6a'), T('#b8aac8'), T('#3a2a4a')), { sombra: 2 }); s = p.lienzo(); }
  if (tipo === 'valla') { const p = new Pincel(30, 14, 15, 13); const mad = pal(T('#c8874a'), T('#8f5428'), T('#e8b07a'), T('#4a2a14')); p.parte(F.un(F.re(-13, -8, 26, 2), F.re(-13, -4, 26, 2)), mad, { sombra: 0 }); for (const x of [-12, 0, 11]) p.parte(F.pol(x - 1.5, 0, x + 1.5, 0, x + 1.5, -10, x, -11.5, x - 1.5, -10), mad, { sombra: 1 }); s = p.lienzo(); }
  if (tipo === 'farola') { const p = new Pincel(12, 36, 6, 35); const hierro = pal(T('#3a4258'), T('#232838'), T('#5b6680'), '#10131f'); p.parte(F.re(-1, -28, 2, 28), hierro, { sombra: 0 }); p.parte(F.re(-2.5, -3, 5, 3), hierro, { sombra: 0 }); p.parte(F.pol(-4, -28, 4, -28, 2.5, -33, -2.5, -33), hierro, { sombra: 1 }); p.plano(F.re(-2, -31, 4, 3), FONDO.dia >= 4 ? '#fff3a0' : T('#c8f0ff')); s = p.lienzo(); s.luz = [0, -30]; }
  if (tipo === 'cartel') {
    const [l1, l2] = ESLOGANES[v % ESLOGANES.length].map(tr), ancho = Math.max(anchoTexto(l1), anchoTexto(l2)) + 10, w = ancho + 8;
    const p = new Pincel(w, 40, Math.floor(w / 2), 39), mad = pal(T('#5a6378'), T('#3a4256'), T('#7d8aa3'), '#20263a');
    for (const x of [-ancho / 2 + 5, ancho / 2 - 7]) p.parte(F.re(x, -14, 2, 14), mad, { sombra: 0 });
    p.parte(F.re(-ancho / 2, -36, ancho, 23), pal(T('#c3cbe0'), T('#7d889e'), T('#eef2fa'), '#3a4262'), { sombra: 1 });
    p.plano(F.re(-ancho / 2 + 2, -34, ancho - 4, 19), T('#fff6ea'));
    p.plano(F.re(-ancho / 2 + 2, -34, ancho - 4, 2), T('#2e8bff'));
    letreroRecto(p, l1, 0, -31, T('#1d3f8a')); letreroRecto(p, l2, 0, -23, T('#e63946'));
    s = p.lienzo();
  }
  FONDO.props[clave] = s;
  return s;
}
// pone cosas por delante del camino según se avanza
function avanzaProps(mx, W) {
  while (FONDO.sigProp < mx + W + 60) {
    const x = FONDO.sigProp, r = hash(Math.floor(x), 1, FONDO.dia);
    let tipo = r < 0.3 ? 'arbusto' : r < 0.52 ? 'flores' : r < 0.64 ? 'valla' : r < 0.74 ? 'roca' : r < 0.88 ? 'cartel' : 'farola';
    if (!FONDO.cosas.some(c => c.tipo === 'cartel') && x > mx + 90) tipo = 'cartel';
    FONDO.cosas.push({ tipo, x, v: Math.floor(hash(Math.floor(x), 2, FONDO.dia) * 12) });
    FONDO.sigProp += tipo === 'cartel' ? 90 : 26 + Math.floor(hash(Math.floor(x), 3) * 40);
  }
  FONDO.cosas = FONDO.cosas.filter(c => c.x > mx - 80);
}

// dibuja una tira que se repite, desplazada según el avance
function tira(ctx, img, desp, y, W) {
  const w = img.width; let x = -(((Math.floor(desp) % w) + w) % w);
  for (; x < W; x += w) ctx.drawImage(img, x, y);
}

// dibuja todo el paisaje de detrás de los personajes. mx = cuánto se ha andado; t = tiempo (para lo que se mueve solo)
function pintaFondo(ctx, mx, t, W) {
  const L = FONDO.L, d = FONDO.dia;
  ctx.drawImage(FONDO.cielo, Math.floor((W - 256) / 2), ESC.Y);
  if (d >= 4) for (let k = 0; k < 8; k++) if (Math.sin(t * 3 + k * 1.7) > 0.6) { ctx.fillStyle = '#ffffff'; const x = Math.floor(hash(k, 8, d) * W), y = ESC.Y + 4 + Math.floor(hash(k, 9, d) * 70); ctx.fillRect(x, y, 1, 1); ctx.fillStyle = '#b8a8e8'; ctx.fillRect(x - 1, y, 1, 1); ctx.fillRect(x + 1, y, 1, 1); ctx.fillRect(x, y - 1, 1, 1); ctx.fillRect(x, y + 1, 1, 1); }
  for (const n of FONDO.nubesPos) { const x = ((n.x - mx * 0.06 - t * n.v) % (W + 60) + W + 60) % (W + 60) - 50; ctx.drawImage(FONDO.nubes[n.n].c, Math.round(x), n.y); }
  // la torre de Microblizz, casi quieta (está lejísimos)
  const T = FONDO.torre, tx = Math.round(W * 0.8 - d * 6 - T.width / 2 - mx * 0.015), ty = SUELO - 30 - T.height;
  if (d === 5) focos(ctx, tx + T.punta[0], ty + T.punta[1] + 10, t, W);
  ctx.drawImage(T, tx, ty);
  if (Math.sin(t * 4) > 0) { ctx.fillStyle = '#ff3348'; ctx.fillRect(tx + T.punta[0] - 1, ty, 3, 2); ctx.fillStyle = '#ffd0d4'; ctx.fillRect(tx + T.punta[0], ty, 1, 1); }
  tira(ctx, FONDO.montes, mx * 0.12, SUELO - 66, W);
  tira(ctx, FONDO.colinas, mx * 0.35, SUELO - 70, W);
  tira(ctx, FONDO.suelo, mx, SUELO - 10, W);
  for (const c of FONDO.cosas) {
    const s = propDe(c.tipo, c.v), x = Math.round(c.x - mx);
    if (x < -60 || x > W + 60) continue;
    const y = c.tipo === 'flores' || c.tipo === 'roca' ? SUELO - 4 : SUELO - 6;
    if (s.luz && d >= 4) { const lx = x - s.ox + s.luz[0] + s.ox, ly = y + s.luz[1]; for (let r = 9; r >= 3; r -= 3) { ctx.save(); ctx.beginPath(); ctx.rect(lx - r, ly - r, r * 2, r * 2); ctx.clip(); rellenaTrama(ctx, lx - r, ly - r, r * 2, r * 2, r > 6 ? 3 : 6, '#fff3a0'); ctx.restore(); } }
    pintaSpr(ctx, s, x, y);
  }
}
function pintaDelante(ctx, mx, W) { tira(ctx, FONDO.delante, mx * 1.35, ESC.Y + ESC.H - 14, W); }

// los focos de la sede la noche del jefe (franjas con trama que barren el cielo)
function focos(ctx, x, y, t, W) {
  for (const [fase, col] of [[0, '#fff3a0'], [2.4, '#ffd0e8']]) {
    const a = -Math.PI / 2 + Math.sin(t * 0.7 + fase) * 0.7, largo = 140;
    const ex = x + Math.cos(a) * largo, ey = y + Math.sin(a) * largo;
    for (let yy = Math.max(ESC.Y, Math.floor(Math.min(y, ey))); yy <= y; yy++) {
      const k = (y - yy) / (y - ey || 1); if (k < 0 || k > 1) continue;
      const cx = x + (ex - x) * k, ancho = 1 + k * 16;
      ctx.fillStyle = ctx.createPattern(trama(k < 0.3 ? 6 : 4, col), 'repeat');
      ctx.fillRect(Math.round(cx - ancho / 2), yy, Math.round(ancho), 1);
    }
  }
}
