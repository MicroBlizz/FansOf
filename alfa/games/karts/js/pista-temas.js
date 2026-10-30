// Fans of Karts (prototipo) · AYUDAS PARA LAS PISTAS: lo que comparten las tres (pista-oficinas, pista-cementerio y pista-nube):
// el cielo (dos tiras de 1024 × el alto del horizonte, pintadas a cuadraditos), las flechas de turbo, las manchas (charcos, barro),
// las rampas y los huecos, y colocar monedas, regalos, adornos y carteles. Las posiciones se dan con `u`: el punto de control
// de la pista más el trozo hasta el siguiente (3.5 = a medio camino entre el punto 3 y el 4).
'use strict';

const PISTAS = [];
// con qué nombre se guardan los récords y fantasmas de una pista: si se le da la vuelta, los de antes ya no valen
const claveCrono = d => (d.invertida ? d.id + '-inv' : d.id);
const C32 = (...h) => h.map(u32);

// ---------- el cielo ----------
// colores: de arriba abajo, mezclados con puntitos. `atras` y `delante` pintan encima con el pincel (sin suavizar: solo rectángulos).
function creaCielo(P) {
  const d = P.def.cielo, [, xa] = lienzo(CIELO_W, HZ), [, xb] = lienzo(CIELO_W, HZ);
  const img = xa.createImageData(CIELO_W, HZ), px = new Uint32Array(img.data.buffer), c = d.colores.map(u32), n = c.length - 1;
  for (let y = 0; y < HZ; y++) {
    const g = (y / (HZ - 1)) * n, i = Math.min(n - 1, g | 0), f = (g - i) * 16;
    for (let x = 0; x < CIELO_W; x++) px[y * CIELO_W + x] = BAYER[((y & 3) << 2) | (x & 3)] < f ? c[i + 1] : c[i];
  }
  xa.putImageData(img, 0, 0);
  if (d.atras) d.atras(xa, azarDe(d.semilla || 7));
  if (d.delante) d.delante(xb, azarDe((d.semilla || 7) + 1));
  P.cieloA = new Uint32Array(xa.getImageData(0, 0, CIELO_W, HZ).data.buffer);
  const b = new Uint32Array(xb.getImageData(0, 0, CIELO_W, HZ).data.buffer);
  for (let i = 0; i < b.length; i++) b[i] = (b[i] >>> 24) < 128 ? 0 : (b[i] | 0xff000000) >>> 0;
  P.cieloB = b;
}
// rectángulos y elipses de píxeles; si se salen por un lado de la tira, siguen por el otro (el cielo da la vuelta entera)
function rectPx(x, a, b, w, h, col) { x.fillStyle = col; for (const d of [-CIELO_W, 0, CIELO_W]) x.fillRect(Math.round(a + d), Math.round(b), Math.round(w), Math.round(h)); }
function elipsePx(x, cx, cy, rx, ry, col) {
  x.fillStyle = col;
  for (let j = -ry; j <= ry; j++) {
    const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (j * j) / (ry * ry + 0.01))));
    if (w > 0) for (const d of [-CIELO_W, 0, CIELO_W]) x.fillRect(Math.round(cx - w + d), Math.round(cy + j), w * 2, 1);
  }
}
function nubePx(x, cx, cy, w, col, sombra) {
  const h = Math.max(2, Math.round(w * 0.22));
  if (sombra) elipsePx(x, cx, cy + 1, w, h, sombra);
  elipsePx(x, cx, cy, w, h, col); elipsePx(x, cx - w * 0.45, cy - h * 0.7, w * 0.42, h, col); elipsePx(x, cx + w * 0.3, cy - h * 0.9, w * 0.5, h * 1.2, col);
}
// un monte o un tejado: un triángulo de escalones
function montePx(x, cx, base, medio, alto, col) { x.fillStyle = col; for (let j = 0; j < alto; j++) { const w = Math.round(medio * (j + 1) / alto); for (const d of [-CIELO_W, 0, CIELO_W]) x.fillRect(Math.round(cx - w + d), Math.round(base - alto + j), w * 2, 1); } }

// ---------- sobre la pista ----------
// flechas de turbo: quien las pisa sale disparado
function turboEn(P, u, lado = 0, ancho = 22, largo = 30) {
  const p = enVia(P, P.f(u), lado), [A, B, Cn] = C32('#ff8a1f', '#ffe14d', '#b3360a'), c = Math.cos(p.ang), s = Math.sin(p.ang);
  sello(P, x => enPunto(x, p, x => { x.fillStyle = '#fff'; x.fillRect(-largo / 2, -ancho / 2, largo, ancho); }), {
    tipo: S_TURBO, en: p, r: largo, solo: t => t === S_PISTA || t === S_ATAJO,
    color: (px, py) => { const dx = px + 0.5 - p.x, dy = py + 0.5 - p.y, a = dx * c + dy * s, l = -dx * s + dy * c; return Math.abs(l) > ancho / 2 - 1.5 ? Cn : (((a + Math.abs(l) * 0.9 + 400) / 5) & 1) ? A : B; },
  });
}
// una mancha de bordes irregulares (charco de café, barro, aceite…): `tipo` dice qué se pisa
function manchaEn(P, u, lado, rx, ry, tipo, colores, semilla = 1) {
  const p = enVia(P, P.f(u), lado), az = azarDe(semilla * 7919 + 13), [c1, c2, c3] = colores.map(u32);
  const bolas = [[0, 0, rx, ry]];
  for (let i = 0; i < 5; i++) bolas.push([(az() - 0.5) * rx * 1.5, (az() - 0.5) * ry * 1.5, rx * (0.3 + az() * 0.4), ry * (0.3 + az() * 0.4)]);
  sello(P, x => enPunto(x, p, x => { x.fillStyle = '#fff'; for (const [a, b, r1, r2] of bolas) { x.beginPath(); x.ellipse(a, b, r1, r2, 0, 0, TAU); x.fill(); } }), {
    tipo, en: p, r: Math.max(rx, ry) * 2 + 4, solo: t => t === S_PISTA,
    color: (px, py) => { const r = ruido(px >> 1, py >> 1); return r < 0.18 ? c3 : r < 0.55 ? c2 : c1; },
  });
}
// rampa: una franja a rayas de lado a lado; quien la pisa con velocidad, salta
function rampaEn(P, u, largo = 12) {
  const p = enVia(P, P.f(u)), w = p.ancho + 4, [A, B] = C32('#ffe14d', '#22212c'), c = Math.cos(p.ang), s = Math.sin(p.ang);
  sello(P, x => enPunto(x, p, x => { x.fillStyle = '#fff'; x.fillRect(-largo / 2, -w / 2, largo, w); }), {
    tipo: S_RAMPA, en: p, r: w, solo: t => t === S_PISTA || t === S_BORDILLO,
    color: (px, py) => { const dx = px + 0.5 - p.x, dy = py + 0.5 - p.y, a = dx * c + dy * s, l = -dx * s + dy * c; return (((a + l + 800) / 4) & 1) ? A : B; },
  });
}
// hueco: un trozo de pista que falta (hay que saltarlo desde una rampa)
function huecoEn(P, u, largo) {
  const p = enVia(P, P.f(u)), w = p.ancho + 60, T = P.def.tema;
  // solo en lo que pertenece a este trozo de pista: si no, en una curva el hueco se comería la pista de antes de la rampa
  const cerca = Math.ceil(largo / 2 / PASO_VIA) + 3, N = P.N;
  sello(P, x => enPunto(x, p, x => { x.fillStyle = '#fff'; x.fillRect(-largo / 2, -w / 2, largo, w); }), { tipo: S_VACIO, en: p, r: w, color: (px, py) => T.vacio(px, py, 12, 0, 0, null),
    solo: (s, k) => { const d = Math.abs(P.campoI[k] - p.i); return Math.min(d, N - d) <= cerca; } });
}
// una fila de monedas a lo largo de la pista y una fila de regalos de lado a lado
function monedasEn(P, u, n = 5, lado = 0, paso = 13, deriva = 0) {
  const f0 = P.f(u);
  for (let i = 0; i < n; i++) { const p = enVia(P, f0 + (i * paso) / P.largo, lado + deriva * i); P.monedas.push({ x: p.x, y: p.y, t: 0, fase: i * 0.8 }); }
}
function regalosEn(P, u, n = 4) {
  const f = P.f(u), w = enVia(P, f).ancho * 0.7;
  for (let i = 0; i < n; i++) { const p = enVia(P, f, -w / 2 + (w * i) / (n - 1)); P.regalos.push({ x: p.x, y: p.y, t: 0, col: i % 3, fase: i * 1.3 }); }
}
// un adorno junto a la pista: `fuera` unidades más allá del borde (negativo = a la izquierda de la marcha). Los adornos son sólidos.
function adorno(P, lista, id, u, fuera, o = {}) {
  const f = P.f(u), lado = Math.sign(fuera) * (enVia(P, f).ancho / 2 + Math.abs(fuera)), p = enVia(P, f, lado);
  if (estorbaAtajo(P, p) || enOtraPista(P, p)) return;
  lista.push({ x: p.x, y: p.y, fig: figCosa(id), r: o.r === undefined ? 3.4 : o.r, flota: o.flota || 0, fase: (p.x * 0.37 + p.y * 0.11) % TAU });
}
function cartelEn(P, lista, lineasTxt, u, fuera, fondo, tinta) {
  const f = P.f(u), lado = Math.sign(fuera) * (enVia(P, f).ancho / 2 + Math.abs(fuera)), p = enVia(P, f, lado);
  if (estorbaAtajo(P, p) || enOtraPista(P, p)) return;
  lista.push({ x: p.x, y: p.y, cartel: cartelDe(lineasTxt.map(tr), fondo, tinta), r: 1.6 });
}
// ¿cae este punto sobre la pista (la de otro tramo, en las pistas que se cruzan o pasan muy cerca)? Ahí no se planta nada
const enOtraPista = (P, p) => { const s = supEn(P, p.x, p.y); return s === S_PISTA || s === S_BORDILLO || s === S_TURBO || s === S_RAMPA; };
// ---------- tramas de suelo ----------
// de una lista de colores, uno al azar pero siempre el mismo en cada punto (para que el suelo tenga grano)
const grano = (cols, paso = 0) => (x, y) => cols[(ruido(x >> paso, y >> paso) * cols.length) | 0];
