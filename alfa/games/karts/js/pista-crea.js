// Fans of Karts (prototipo) · CONSTRUIR UNA PISTA: de unos pocos puntos (la línea central) saca todo lo que el juego necesita:
//   · la VÍA: un punto cada 8 unidades con su dirección y su ancho (la siguen los rivales y sirve para saber por dónde va cada uno)
//   · el CAMPO: para cada punto del mapa, a qué distancia está de la vía y cuál es su trozo más cercano
//   · el SUELO (sup): qué se pisa en cada punto (asfalto, hierba, muro, vacío, turbo…)
//   · el DIBUJO (tex): el mapa de 1024 × 1024 que luego se ve tumbado, pintado punto a punto con pocos colores
// Cada pista (pista-*.js) da sus puntos, sus tramos especiales, sus colores y sus adornos; aquí está lo común.
'use strict';

const TM = 1024, TM2 = TM * TM;      // lado del mapa (1 punto = 1 unidad de pista)
const PASO_VIA = 8;
// qué se pisa
const S_PISTA = 0, S_BORDILLO = 1, S_LENTO = 2, S_MURO = 3, S_VACIO = 4, S_TURBO = 5, S_CHARCO = 6, S_BARRO = 7, S_RAMPA = 8, S_FUERA = 9, S_ATAJO = 10;
const S_HIELO = 11, S_CORRIENTE = 12;      // hielo (se resbala sin parar) y corriente (olas, agua, escaleras mecánicas: empuja hacia un lado)
const S_PUENTE = 13;                       // un atajo estrecho por encima del vacío (o de la lava): se corre normal, pero sin barandilla
// S_ATAJO (10) es un atajo por terreno malo: frena, salvo con turbo
const ES_MURO = s => s === S_MURO || s === S_FUERA;

// curva suave y cerrada que pasa por todos los puntos (Catmull-Rom), troceada cada `paso` unidades
function curvaCerrada(pts, paso) {
  const n = pts.length, fino = [];
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i + n - 1) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    for (let k = 0; k < 48; k++) {
      const t = k / 48, t2 = t * t, t3 = t2 * t;
      fino.push([
        0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)]);
    }
  }
  // a pasos iguales: primero la longitud total, luego se reparte para que el último paso cierre justo
  let largo = 0; const acum = [0];
  for (let i = 0; i < fino.length; i++) { const a = fino[i], b = fino[(i + 1) % fino.length]; largo += Math.hypot(b[0] - a[0], b[1] - a[1]); acum.push(largo); }
  const cuantos = Math.round(largo / paso), sal = [];
  let j = 0;
  for (let k = 0; k < cuantos; k++) {
    const s = (k / cuantos) * largo;
    while (acum[j + 1] < s) j++;
    const a = fino[j], b = fino[(j + 1) % fino.length], t = (s - acum[j]) / ((acum[j + 1] - acum[j]) || 1);
    sal.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
  }
  // en qué fracción de la vuelta cae cada punto de control (para colocar cosas diciendo «entre el punto 3 y el 4»)
  return { pts: sal, largo, fp: pts.map((_, i) => acum[i * 48] / largo) };
}

// el valor de una propiedad (ancho, margen…) en la fracción f de la vuelta: el de la pista, salvo en los tramos que lo cambian
// (cada tramo entra y sale poco a poco para que el ancho no pegue saltos)
function enTramo(def, clave, f, base) {
  let v = base;
  for (const t of def.tramos || []) {
    if (t[clave] === undefined) continue;
    const de = t.de, a = t.a, g = t.suave === undefined ? 0.012 : t.suave;
    let dentro = 0;
    const ff = a >= de ? f : (f < a + g ? f + 1 : f), aa = a >= de ? a : a + 1;
    if (ff >= de - g && ff <= aa + g) dentro = Math.min(1, (ff - (de - g)) / (g || 1e-9), (aa + g - ff) / (g || 1e-9));
    if (dentro > 0) v = typeof t[clave] === 'number' ? v + (t[clave] - v) * suave(Math.min(1, dentro)) : (dentro >= 0.5 ? t[clave] : v);
  }
  return v;
}

let PISTA = null;   // la pista en juego
// Construye la pista `def`. Devuelve { def, via, largo, campoD, campoI, sup, tex, mips, mini, ... }
function creaPista(def) {
  const t0 = performance.now();
  INV_P = null;
  // def.invertida: la pista se corre al revés (los mismos puntos, del último al primero). Todo lo que la pista coloca (adornos,
  // turbos, tramos…) sigue escrito en el sentido de siempre y sale en el mismo sitio del mapa: enVia lo da la vuelta mientras se coloca.
  const inv = !!def.invertida;
  const { pts, largo, fp } = curvaCerrada(inv ? [def.puntos[0], ...def.puntos.slice(1).reverse()] : def.puntos, PASO_VIA), N = pts.length;
  const fpU = inv ? curvaCerrada(def.puntos, PASO_VIA).fp : fp;
  // de «punto de control + trozo hasta el siguiente» (3.5 = a medio camino entre el punto 3 y el 4) a fracción de la vuelta
  const fU = u => { const n = fpU.length, k = Math.floor(u), i = ((k % n) + n) % n, a = fpU[i], b = i === n - 1 ? 1 : fpU[i + 1]; return (a + (b - a) * (u - k)) % 1; };
  for (const t of def.tramos || []) if (t.deU !== undefined) { t.de = fU(t.deU); t.a = fU(t.aU); }
  // al revés, los tramos van de su final a su principio y lo de la izquierda pasa a la derecha
  const TD = !inv ? def : { tramos: (def.tramos || []).map(t => {
    const c = {}; for (const k in t) c[k.replace('Izq', '\0').replace('Der', 'Izq').replace('\0', 'Der')] = t[k];
    c.de = (2 - t.a) % 1; c.a = (2 - t.de) % 1; return c;
  }) };
  const conBarandilla = def.borde === 'vacio' && dificultad().barandilla;      // en el nivel fácil, las pistas sin borde llevan barandilla
  // la vía: posición, dirección, ancho, márgenes (lo que hay de hierba a cada lado antes del borde) y qué borde hay a cada lado
  const via = pts.map((p, i) => {
    const a = pts[(i + N - 1) % N], b = pts[(i + 1) % N], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, f = i / N;
    const mg = enTramo(TD, 'margen', f, def.margen === undefined ? 44 : def.margen), bd = conBarandilla ? 'muro' : enTramo(TD, 'borde', f, def.borde || 'muro');
    return {
      x: p[0], y: p[1], tx: (b[0] - a[0]) / l, ty: (b[1] - a[1]) / l, f, ancho: enTramo(TD, 'ancho', f, def.ancho || 64),
      mi: enTramo(TD, 'margenIzq', f, mg), md: enTramo(TD, 'margenDer', f, mg), bi: enTramo(TD, 'bordeIzq', f, bd), bdr: enTramo(TD, 'bordeDer', f, bd),
      tipo: enTramo(TD, 'tipo', f, ''),
    };
  });
  for (let i = 0; i < N; i++) { const v = via[i], w = via[(i + 1) % N]; v.ang = Math.atan2(v.ty, v.tx); v.curva = difAng(v.ang, Math.atan2(w.ty, w.tx)) / PASO_VIA; }
  // ---------- el campo: distancia a la vía y trozo más cercano ----------
  const campoD = new Float32Array(TM2).fill(1e9), campoI = new Uint16Array(TM2);
  for (let i = 0; i < N; i++) {
    const a = via[i], b = via[(i + 1) % N], R = a.ancho / 2 + Math.max(a.mi, a.md) + 22;
    const x0 = Math.max(0, Math.floor(Math.min(a.x, b.x) - R)), x1 = Math.min(TM - 1, Math.ceil(Math.max(a.x, b.x) + R));
    const y0 = Math.max(0, Math.floor(Math.min(a.y, b.y) - R)), y1 = Math.min(TM - 1, Math.ceil(Math.max(a.y, b.y) + R));
    const dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy || 1;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const t = limita(((x + 0.5 - a.x) * dx + (y + 0.5 - a.y) * dy) / l2, 0, 1), ex = x + 0.5 - a.x - dx * t, ey = y + 0.5 - a.y - dy * t, d = ex * ex + ey * ey, k = y * TM + x;
      if (d < campoD[k]) { campoD[k] = d; campoI[k] = i; }
    }
  }
  // ---------- qué se pisa y de qué color, punto a punto ----------
  const sup = new Uint8Array(TM2).fill(S_FUERA), tex = new Uint32Array(TM2), T = def.tema;
  const alVacio = def.borde === 'vacio' && !conBarandilla;      // pistas en el aire: lo de lejos también es vacío (por si llegas por un puente)
  const P = { def, via, largo, N, campoD, campoI, sup, tex, f: fU, monedas: [], regalos: [], corrientes: [] };
  for (let y = 0; y < TM; y++) for (let x = 0; x < TM; x++) {
    const k = y * TM + x, d2 = campoD[k];
    if (d2 > 1e8) { tex[k] = T.fuera(x, y, 999, 0, 0, null); if (alVacio) sup[k] = S_VACIO; continue; }
    const i = campoI[k], v = via[i], d = Math.sqrt(d2), m = d - v.ancho / 2;          // m: lo que falta para el borde de la pista (negativo = dentro)
    const lado = (x + 0.5 - v.x) * v.ty - (y + 0.5 - v.y) * v.tx > 0 ? -1 : 1;        // -1 = a la izquierda de la marcha, 1 = a la derecha
    const mg = lado < 0 ? v.mi : v.md, bd = lado < 0 ? v.bi : v.bdr;
    let s;
    if (m < 0) s = S_PISTA;
    else if (m < (T.bordillo === 0 ? 0 : 5) && mg > 0) s = S_BORDILLO;
    else if (m < mg) s = S_LENTO;
    else if (bd === 'vacio') s = S_VACIO;
    else if (m < mg + 7) s = S_MURO;
    else s = alVacio ? S_VACIO : S_FUERA;
    sup[k] = s;
    tex[k] = s === S_PISTA ? T.pista(x, y, m, i, lado, v) : s === S_BORDILLO ? T.bordillo(x, y, m, i, lado, v) : s === S_LENTO ? T.lento(x, y, m, i, lado, v)
      : s === S_MURO ? T.muro(x, y, m - mg, i, lado, v) : s === S_VACIO ? T.vacio(x, y, m - mg, i, lado, v) : T.fuera(x, y, m - mg, i, lado, v);
  }
  // ---------- adornos y zonas especiales de cada pista (turbos, charcos, atajos, rayas…), la salida y la parrilla ----------
  INV_P = inv ? P : null;
  if (def.pinta) def.pinta(P);
  for (const a of def.atajos || []) atajoEn(P, ...a);
  INV_P = null;
  pintaSalida(P);
  // ---------- versiones a la mitad y a la cuarta parte (para lo lejano, que si no parpadea) ----------
  P.mips = [tex, mitad(tex, TM), null]; P.mips[2] = mitad(P.mips[1], TM / 2);
  P.mini = miniMapa(P);
  INV_P = inv ? P : null;
  try { P.cosas = def.cosas ? def.cosas(P) : []; } finally { INV_P = null; }
  const m0 = enVia(P, 0);
  P.cosas.push({ x: m0.x, y: m0.y, fig: figCosa('arco'), r: 0, dmin: CAM_ATRAS + 9 });   // el arco de meta
  creaCielo(P);
  P.niebla = u32(def.cielo.niebla); P.nieblaFilas = def.cielo.filas || 11; P.lejosA = u32(def.lejos[0]); P.lejosB = u32(def.lejos[1]);
  P.ms = Math.round(performance.now() - t0);
  return P;
}
function mitad(src, lado) {
  const m = lado / 2, d = new Uint32Array(m * m);
  for (let y = 0; y < m; y++) for (let x = 0; x < m; x++) {
    const k = (y * 2) * lado + x * 2, a = src[k], b = src[k + 1], c = src[k + lado], e = src[k + lado + 1];
    d[y * m + x] = ((255 << 24) | ((((a >> 16) & 255) + ((b >> 16) & 255) + ((c >> 16) & 255) + ((e >> 16) & 255)) >> 2 << 16)
      | ((((a >> 8) & 255) + ((b >> 8) & 255) + ((c >> 8) & 255) + ((e >> 8) & 255)) >> 2 << 8) | (((a & 255) + (b & 255) + (c & 255) + (e & 255)) >> 2)) >>> 0;
  }
  return d;
}

// ---------- ayudas para colocar y pintar cosas sobre la pista ----------
// un punto de la vía: f = fracción de la vuelta (0 a 1), lado = unidades a la derecha (negativo, a la izquierda), av = unidades hacia delante
let INV_P = null;      // la pista invertida que se está colocando ahora (ver creaPista)
function enVia(P, f, lado = 0, av = 0) {
  if (INV_P === P) { f = 1 - f; lado = -lado; av = -av; }
  const n = P.N, g = (((f % 1) + 1) % 1) * n, i = Math.floor(g) % n, t = g - Math.floor(g), a = P.via[i], b = P.via[(i + 1) % n];
  const tx = a.tx + (b.tx - a.tx) * t, ty = a.ty + (b.ty - a.ty) * t, l = Math.hypot(tx, ty) || 1;
  const x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t;
  return { x: x - (ty / l) * lado + (tx / l) * av, y: y + (tx / l) * lado + (ty / l) * av, ang: Math.atan2(ty, tx), i, ancho: a.ancho };
}
// pinta con el pincel normal del navegador en un lienzo aparte y lo pasa al mapa con bordes limpios: `color(x, y, r, g, b)` decide el color
// de cada punto pintado (por defecto, el que se usó) y `tipo` cambia lo que se pisa ahí (si se da). `solo(s)` limita a ciertos suelos.
// Con `en` (un punto) y `r` solo se mira un cuadrado alrededor de ese punto, que es mucho más rápido que repasar el mapa entero.
let SELLO = null;
function sello(P, dibuja, { tipo, color, solo, en, r } = {}) {
  if (!SELLO) { const c = document.createElement('canvas'); c.width = c.height = TM; SELLO = [c, c.getContext('2d', { willReadFrequently: true })]; }
  const [, x] = SELLO;
  let x0 = 0, y0 = 0, w = TM, h = TM;
  if (en) {
    x0 = limita(Math.floor(en.x - r), 0, TM - 1); y0 = limita(Math.floor(en.y - r), 0, TM - 1);
    w = Math.min(TM, Math.ceil(en.x + r)) - x0; h = Math.min(TM, Math.ceil(en.y + r)) - y0;
    if (w <= 0 || h <= 0) return;
  }
  x.clearRect(x0, y0, w, h); x.save(); x.beginPath(); x.rect(x0, y0, w, h); x.clip(); dibuja(x); x.restore();
  const d = x.getImageData(x0, y0, w, h).data;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const q = (j * w + i) * 4;
    if (d[q + 3] < 128) continue;
    const k = (y0 + j) * TM + x0 + i;
    if (solo && !solo(P.sup[k], k)) continue;
    const c = color ? color(x0 + i, y0 + j, d[q], d[q + 1], d[q + 2]) : ((255 << 24) | (d[q + 2] << 16) | (d[q + 1] << 8) | d[q]) >>> 0;
    if (c) P.tex[k] = c;
    if (tipo !== undefined) P.sup[k] = tipo;
  }
}
// una figura girada y colocada en un punto de la vía (para dibujar flechas, rayas o letras siguiendo la pista)
function enPunto(x, p, dibuja) { x.save(); x.translate(p.x, p.y); x.rotate(p.ang); dibuja(x); x.restore(); }

// la línea de salida (a cuadros), las casillas de la parrilla y las posiciones de salida de los 8 karts
function pintaSalida(P) {
  const p0 = enVia(P, 0), w = P.via[0].ancho, B = u32('#f4f4f8'), Nn = u32('#22212c');
  sello(P, x => enPunto(x, p0, x => { x.fillStyle = '#fff'; x.fillRect(-4, -w / 2, 8, w); }), {
    solo: s => s === S_PISTA, en: p0, r: w,
    color: (px, py) => { const dx = px + 0.5 - p0.x, dy = py + 0.5 - p0.y, c = Math.cos(p0.ang), s = Math.sin(p0.ang), u = dx * c + dy * s, v = -dx * s + dy * c; return ((Math.floor((u + 4) / 4) + Math.floor((v + 400) / 4)) & 1) ? B : Nn; },
  });
  P.parrilla = [];
  for (let k = 0; k < 8; k++) {
    const atras = 16 + k * 13, lado = (k % 2 ? 1 : -1) * w * 0.2, g = enVia(P, -atras / P.largo, lado);
    P.parrilla.push(g);
    sello(P, x => enPunto(x, g, x => { x.strokeStyle = '#f4f4f8'; x.lineWidth = 1.6; x.beginPath(); x.moveTo(-2, -6.5); x.lineTo(5.5, -6.5); x.lineTo(5.5, 6.5); x.lineTo(-2, 6.5); x.stroke(); }), { solo: s => s === S_PISTA, en: g, r: 14 });
  }
}

// el mapa pequeño del marcador: la pista en claro con borde oscuro (un punto por cada `esc` unidades)
function miniMapa(P) {
  const L = 44, esc = TM / L, [c, x] = lienzo(L, L), img = x.createImageData(L, L), px = new Uint32Array(img.data.buffer), hay = new Uint8Array(L * L);
  for (const v of P.via) for (let q = -1; q <= 1; q++) {
    const mx = Math.floor((v.x - v.ty * q * v.ancho * 0.3) / esc), my = Math.floor((v.y + v.tx * q * v.ancho * 0.3) / esc);
    if (mx >= 0 && my >= 0 && mx < L && my < L) hay[my * L + mx] = 1;
  }
  const claro = u32('#f4f4f8'), borde = u32('#1c1028');
  for (let y = 0; y < L; y++) for (let xx = 0; xx < L; xx++) {
    const k = y * L + xx;
    if (hay[k]) px[k] = claro;
    else if ((xx > 0 && hay[k - 1]) || (xx < L - 1 && hay[k + 1]) || (y > 0 && hay[k - L]) || (y < L - 1 && hay[k + L])) px[k] = borde;
  }
  x.putImageData(img, 0, 0);
  return { c, L, esc };
}
// por dónde va un punto del mapa: el trozo de vía más cercano y la fracción dentro de él (para ordenar a los karts con finura)
function avanceEn(P, x, y) {
  const xi = limita(x | 0, 0, TM - 1), yi = limita(y | 0, 0, TM - 1), i = P.campoI[yi * TM + xi], a = P.via[i], b = P.via[(i + 1) % P.N];
  const dx = b.x - a.x, dy = b.y - a.y, t = limita(((x - a.x) * dx + (y - a.y) * dy) / (dx * dx + dy * dy || 1), 0, 1);
  return i + t;
}
const supEn = (P, x, y) => (x < 0 || y < 0 || x >= TM || y >= TM ? S_FUERA : P.sup[(y | 0) * TM + (x | 0)]);
