// Fans of Karts · PUENTES: una pista que pasa por encima de otra (de momento, en el cruce del ocho del tutorial). El suelo de la consola
// es un plano, así que el puente es un truco en tres partes:
//  1. el tramo de arriba sube y baja (el horizonte se mueve, como en las cuestas) y en el cruce se pinta como un puente de tablas;
//  2. quien va por abajo ve el puente pasar por encima (una estructura de pie, como los arcos) y el suelo del paso, en sombra;
//  3. los karts de un piso y del otro no chocan en el cruce; desde abajo, los de arriba se ven subidos al puente, y desde arriba los
//     de abajo no se ven (van por debajo).
// El suelo del cruce tiene dos versiones (la de arriba y la de abajo) y se pone la del piso por el que vaya el jugador.
// def.puente = { arriba: [u0, u1] (el tramo que sube), abajo: [u0, u1] (el tramo que pasa por debajo), centro: u, alto, radio }
'use strict';

// la estructura que se ve desde abajo: dos pilares de piedra, el tablero de madera con su barandilla y una franja naranja
function modeloPuente(m) {
  const p = [], mats = { piedra: { c: '#a8a0b8', s: '#6e6680', l: '#d0c8e0' }, madera: { c: '#c98a4b', s: '#8b5530', l: '#e0a868' }, oscuro: '#5a3a20', naranja: { c: '#ff8a1f', plano: true }, blanco: { c: '#f4f4f8', plano: true } };
  for (const s of [-1, 1]) p.push(BLOQUE([s * m, 0, 11], [3.4, 3.4, 11], 'piedra'), BLOQUE([s * m, 0, 0.8], [4.4, 4.4, 0.8], 'piedra', { parte: 2 }), BLOQUE([s * m, 0, 21], [4.2, 4.2, 1], 'piedra', { parte: 2 }));
  p.push(BLOQUE([0, 0, 24], [m + 5, 5.5, 2.2], 'madera', { parte: 3 }), BLOQUE([0, 0, 21.6], [m + 5, 5, 0.5], 'oscuro', { parte: 3 }));
  for (let x = -m - 3; x <= m + 3; x += 5) p.push(BLOQUE([x, -5, 27.8], [0.4, 0.4, 1.8], 'blanco', { parte: 4 }));
  p.push(BLOQUE([0, -5, 29.4], [m + 4, 0.35, 0.4], 'madera', { parte: 4 }), PL([0, -5.6, 24], [m + 4.5, 0.1, 0.7], 'naranja'));
  return { medio: m + 9, alto: 31, mats, piezas: p };
}
COSAS.puenteTutorial = modeloPuente(54);
// las rampas de tierra que suben al puente (vistas desde abajo): un talud con hierba arriba y la franja naranja, de varias alturas
function modeloTalud(h) {
  const mats = { tierra: { c: '#a8784a', s: '#6e4a2a', l: '#c99a68' }, hierba: { c: '#5cbf4a', s: '#3f8a32', l: '#8ad870' }, naranja: { c: '#ff8a1f', plano: true } };
  return { medio: 36, alto: h + 3, mats, piezas: [BLOQUE([0, 0, h / 2], [32, 6, h / 2], 'tierra'), BLOQUE([0, 0, h + 0.8], [33, 6.5, 0.9], 'hierba', { parte: 2 }), PL([0, -6.6, h - 1.2], [32.5, 0.1, 0.6], 'naranja')] };
}
const ALTOS_TALUD = [4, 8, 12, 16, 20, 23];
for (const h of ALTOS_TALUD) COSAS['talud' + h] = modeloTalud(h);
// cuánto ha subido el tramo de arriba en este punto (0 al pie de la rampa, 1 en el tablero): plano encima del cruce (unas 64 unidades a
// cada lado del centro) y en cuesta recta hasta el suelo al final del tramo, como un talud
function perfilPuente(P, f) {
  const B = P.puente; if (!B || !enTramoF(f, B.fa0, B.fa1)) return 0;
  const fc = B.fc, lado = f >= fc ? (B.fa1 - fc + 1) % 1 : (fc - B.fa0 + 1) % 1, d = Math.min(Math.abs(f - fc), 1 - Math.abs(f - fc)) * P.largo, L = lado * P.largo;
  return limita((L - d) / Math.max(1, L - 64), 0, 1);
}

// ---------- quién va por arriba ----------
const enTramoF = (f, a, b) => (a <= b ? f >= a && f <= b : f >= a || f <= b);
function capaDe(P, k) {
  const B = P.puente; if (!B || !k) return 'abajo';
  const f = ((k.idx % P.N) + P.N) % P.N / P.N;
  return enTramoF(f, B.fa0, B.fa1) ? 'arriba' : 'abajo';
}
const cercaPuente = (P, k) => Math.hypot(k.x - P.puente.c.x, k.y - P.puente.c.y) < P.puente.radio;
// la altura de más del tramo de arriba (para el horizonte): sube y baja en una curva suave
function alturaPuente(P, f) {
  const B = P.puente; if (!B || !enTramoF(f, B.fa0, B.fa1)) return 0;
  let t = (f - B.fa0 + 1) % 1, L = (B.fa1 - B.fa0 + 1) % 1; t /= L;
  return B.alto * Math.sin(Math.PI * t) ** 2;
}

// ---------- el suelo del cruce, en sus dos versiones ----------
function preparaPuente(P) {
  const def = P.def.puente; if (!def) return;
  const B = P.puente = { fa0: P.f(def.arriba[0]), fa1: P.f(def.arriba[1]), fb0: P.f(def.abajo[0]), fb1: P.f(def.abajo[1]), alto: def.alto || 12, radio: def.radio || 70, capa: null };
  B.c = enVia(P, P.f(def.centro)); B.fc = P.f(def.centro);
  const T = P.def.tema, R = B.radio + 10, x0 = Math.max(0, Math.floor(B.c.x - R)), y0 = Math.max(0, Math.floor(B.c.y - R)), x1 = Math.min(TM - 1, Math.ceil(B.c.x + R)), y1 = Math.min(TM - 1, Math.ceil(B.c.y + R));
  B.caja = { x0, y0, x1, y1 };
  const n = (x1 - x0 + 1) * (y1 - y0 + 1); B.orig = new Uint32Array(n); B.arriba = new Uint32Array(n); B.abajo = new Uint32Array(n);
  // lo más cerca de cada tramo: índice de la vía y distancia al centro de la pista
  const tramo = (fa, fb) => P.via.map((v, i) => i).filter(i => enTramoF(i / P.N, fa, fb));
  const IA = tramo(B.fa0, B.fa1), IB = tramo(B.fb0, B.fb1);
  const cerca = (x, y, lista) => { let m = 1e9, mi = 0; for (const i of lista) { const v = P.via[i], d = (v.x - x) ** 2 + (v.y - y) ** 2; if (d < m) { m = d; mi = i; } } return [Math.sqrt(m), mi]; };
  const [tabla1, tabla2, junta, rojo, blanco] = C32('#c98a4b', '#b47a40', '#7a4a24', '#e63946', '#f4f4f8');
  const sombra = c => { const r = (c & 255) * 0.62, g = ((c >> 8) & 255) * 0.62, b = ((c >> 16) & 255) * 0.62; return ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0; };
  let o = 0;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++, o++) {
    const k = y * TM + x, t = P.tex[k]; B.orig[o] = t; B.arriba[o] = t; B.abajo[o] = t;
    if (Math.hypot(x - B.c.x, y - B.c.y) > R) continue;
    const [da, ia] = cerca(x + 0.5, y + 0.5, IA), [db, ib] = cerca(x + 0.5, y + 0.5, IB), va = P.via[ia], vb = P.via[ib], ma = da - va.ancho / 2, mb = db - vb.ancho / 2;
    // arriba: el tablero (tablas cruzadas a la marcha) con barandilla roja y blanca a los lados
    if (ma < 0 && db < vb.ancho / 2 + 12) {
      const a = (x + 0.5 - va.x) * va.tx + (y + 0.5 - va.y) * va.ty + ia * PASO_VIA;
      B.arriba[o] = ma > -3 ? ((Math.floor(a / 3) & 1) ? rojo : blanco) : (Math.floor(a) % 4 === 0 ? junta : (Math.floor(a / 4) & 1) ? tabla1 : tabla2);
    }
    // abajo: la pista de abajo sigue entera (en la sombra del puente) y lo de arriba no se ve
    if (mb < 0) { const p = T.pista(x, y, mb, ib, 1, vb); B.abajo[o] = da < va.ancho / 2 + 8 ? sombra(p) : p; }
    else if (ma < 0 && mb < 7) B.abajo[o] = sombra(T.muro ? T.muro(x, y, mb, ib, 1, vb) : t);
  }
  B.capa = null; ponCapaPuente(P, 'abajo');
}
// poner en el mapa el suelo del piso del jugador (y rehacer las copias pequeñas de esa zona)
function ponCapaPuente(P, capa) {
  const B = P.puente; if (!B || B.capa === capa) return;
  B.capa = capa;
  const { x0, y0, x1, y1 } = B.caja, src = capa === 'arriba' ? B.arriba : B.abajo, w = x1 - x0 + 1;
  for (let y = y0; y <= y1; y++) P.tex.set(src.subarray((y - y0) * w, (y - y0 + 1) * w), y * TM + x0);
  for (let nivel = 1; nivel <= 2; nivel++) {
    const d = P.mips[nivel], s = P.mips[nivel - 1], L = TM >> nivel, Ls = L * 2;
    for (let y = y0 >> nivel; y <= y1 >> nivel; y++) for (let x = x0 >> nivel; x <= x1 >> nivel; x++) {
      const k = (y * 2) * Ls + x * 2, a = s[k], b = s[k + 1], c = s[k + Ls], e = s[k + Ls + 1];
      d[y * L + x] = ((255 << 24) | ((((a >> 16) & 255) + ((b >> 16) & 255) + ((c >> 16) & 255) + ((e >> 16) & 255)) >> 2 << 16)
        | ((((a >> 8) & 255) + ((b >> 8) & 255) + ((c >> 8) & 255) + ((e >> 8) & 255)) >> 2 << 8) | (((a & 255) + (b & 255) + (c & 255) + (e & 255)) >> 2)) >>> 0;
    }
  }
}

// ---------- engancharlo a lo que ya hay ----------
for (const def of PISTAS) {
  if (!def.puente) continue;
  const original = def.cosas;
  def.cosas = P => {
    preparaPuente(P);
    const l = original ? original(P) : [];
    const c = P.puente.c; l.push({ x: c.x, y: c.y, fig: figCosa('puenteTutorial'), r: 0, dmin: CAM_ATRAS + 9, soloAbajo: true });
    // las rampas a los dos lados: trozos de talud por el tramo de arriba, cada uno de la altura que lleva la pista ahí
    const B = P.puente, d = P.def.puente;
    for (let u = d.arriba[0] + 0.15; u < d.arriba[1] - 0.1; u += 0.1) {
      const f = P.f(u), p = enVia(P, f);
      if (Math.hypot(p.x - c.x, p.y - c.y) < 58) continue;      // en el cruce ya está el puente
      const h = 26 * perfilPuente(P, f) - 3, alto = ALTOS_TALUD.reduce((m, a) => (Math.abs(a - h) < Math.abs(m - h) ? a : m), ALTOS_TALUD[0]);
      if (h < 2) continue;
      l.push({ x: p.x, y: p.y, fig: figCosa('talud' + alto), r: 0, dmin: CAM_ATRAS + 9, soloAbajo: true });
    }
    return l;
  };
}
// los karts de pisos distintos no chocan en el cruce
const chocanKartsSinPuente = chocanKarts;
chocanKarts = (a, b) => { const P = PISTA; if (P && P.puente && cercaPuente(P, a) && cercaPuente(P, b) && capaDe(P, a) !== capaDe(P, b)) return; chocanKartsSinPuente(a, b); };
// antes de pintar: el suelo del piso del jugador. Lo que está en el otro piso se pinta (o no) según desde dónde se mire
let CAPA_VISTA = 'abajo';
function puenteAntesDePintar(P, yo) {
  if (!P.puente) { CAPA_VISTA = 'abajo'; return; }
  CAPA_VISTA = yo ? capaDe(P, yo) : 'abajo';
  ponCapaPuente(P, CAPA_VISTA);
}
// cuánto hay que subir (o si hay que esconder) un kart: null = no se ve; número = unidades de más
// visto desde abajo, el de arriba va subido a la rampa o al tablero (hasta 26 de alto), sin saltos; visto desde arriba, el de abajo
// no se ve mientras pasa por debajo del puente
function alzaPuente(k) {
  const P = PISTA; if (!P || !P.puente) return 0;
  const c = capaDe(P, k);
  if (c === CAPA_VISTA) return 0;
  if (c === 'arriba') return 26 * perfilPuente(P, ((k.idx % P.N) + P.N) % P.N / P.N);
  return cercaPuente(P, k) ? null : 0;
}
