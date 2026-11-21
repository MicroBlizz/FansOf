// Fans of Island · ARTE DE LA ISLA en lonchas: los bloques (hierba, arena, base mojada, roca, caja), los puentes, las islas flotantes,
// las palmeras, los arbustos y los detalles del suelo (matas, hibiscos, estrellas, conchas y rocas en el mar). Todo va a PIEZA,
// salvo las olas de delante (PILAS_OLA).
'use strict';
const FLORES = ['#ff6f91', '#ffd23f', '#ffffff', '#ff9a3c'];
const PIEZA = {};
function arena(x, z, v) {       // la cara de arena: franjas, conchas y piedrecitas
  const n = ruido(x + v * 57, z, 11);
  if (n < 0.012) return '#fff3dc';
  if (n < 0.03) return '#c98a5a';
  if (z % 8 === 0 && ruido(x >> 2, z, v + 3) < 0.7) return '#d9a55a';
  return (z >> 3) % 2 ? '#f2c879' : '#ecbd6a';
}
function hierbaArriba(x, y, v) {
  if (ruido(x >> 1, Math.floor(y / 3), 7 + v) < 0.05) return FLORES[Math.floor(ruido(x >> 1, Math.floor(y / 3), 9 + v) * 4)];
  const n = ruido(x, y, 3 + v);
  return n < 0.15 ? '#8cdc64' : (n < 0.6 ? '#5cc04e' : '#52b846');
}
function pilaHierba(v) {        // bloque de arriba de la isla: hierba con flores y borde que gotea
  return pila(T, D, T, (z, x, y) => {
    if (z === T - 1) return hierbaArriba(x, y, v);
    const labio = 3 + Math.floor(ruido(x, 0, 5 + v) * 3) + (ruido(x >> 2, 0, 6 + v) < 0.3 ? 3 : 0);
    const prof = T - 1 - z;
    if (prof <= labio) return prof === 1 ? '#52b846' : (prof === labio ? '#1f6e2e' : '#2c8a38');
    return arena(x, z, v);
  });
}
const pilaArena = v => pila(T, D, T, (z, x) => arena(x, z, v));
function pilaBase() {           // lo que queda bajo el agua: arena mojada y algas
  return pila(T, D, T, (z, x) => {
    if (z < 12 && ruido(x, z, 31) < 0.18) return '#3f8f6a';
    if (ruido(x, z, 33) < 0.04) return '#8a5a3a';
    return (z >> 3) % 2 ? '#c9955a' : '#b98450';
  });
}
const grietaRoca = (x, z) => (x === 10 && z > 10 && z < 25) || (z === 17 && x > 10 && x < 22) || (x === 22 && z > 4 && z < 17) || (z === 8 && x > 2 && x < 10);
function pilaRoca() {
  return pila(T, D, T, (z, x, y) => {
    if (y < 6 || y > D - 5) return null;
    const ex = Math.min(x, T - 1 - x), ez = Math.min(z, T - 1 - z);
    if (ex < 4 && ez < 4 && (4 - ex) ** 2 + (4 - ez) ** 2 > 16) return null;
    if (z >= T - 2) return ruido(x >> 1, y >> 1, 21) < 0.4 ? (z === T - 1 ? '#6fcf5a' : '#4fae45') : '#e3b98a';
    if (grietaRoca(x, z)) return '#6b4630';
    if (x < 3 || z > T - 5) return '#e3b98a';
    if (x > T - 4 || z < 4) return '#8a5c3c';
    return ruido(x, z, 23) < 0.12 ? '#b98b62' : '#c99a6e';
  });
}
function pilaCaja() {
  return pila(T, D, T, (z, x, y) => {
    if (y < 12 || y > D - 9 || x < 1 || x > T - 2 || z > T - 2) return null;
    if (z === T - 2) return (x % 7 === 0) ? '#a0683a' : (ruido(x, y, 41) < 0.1 ? '#d8a070' : '#e0aa78');
    const bx = x <= 3 || x >= T - 4, bz = z <= 2 || z >= T - 5;
    if (bx || bz) return ((x === 2 || x === T - 3) && (z === 1 || z === T - 4)) ? '#5e3a1e' : '#9a6236';
    if (Math.abs((x - 4) - (z - 3)) < 1.6) return '#c48a52';
    return ((z - 3) % 6 === 0) ? '#a0683a' : '#d8a070';
  });
}
function pilaTabla(n) {         // puente de tablas, de n bloques de largo
  return pila(n * T, 24, 6, (z, x, y) => {
    if (x % 8 === 7) return z >= 2 ? null : '#5e3a1e';
    if (z === 5) return (y === 0 || y === 23) ? '#f2d9a0' : (ruido(x, y, 51) < 0.12 ? '#c48a52' : '#e0aa78');
    return z < 2 ? '#7a4a26' : '#b77c45';
  });
}
function pilaIsleta(n) {        // isla flotante de n bloques de largo, en una sola pieza
  const AL = 22, FO = 36, AN = n * T, pos = n % 3;
  return pila(AN, FO, AL, (z, x, y) => {
    const dy = (y + 0.5 - FO / 2) / (FO / 2);
    const ex = Math.min(1, (x + 1) / 12, (AN - x) / 12);
    const f = ex - dy * dy; if (f <= 0) return null;
    const fondo = AL - 5 - 16 * Math.sqrt(f);
    if (z < fondo) return null;
    if (z === AL - 1) {
      if (ruido(x >> 1, Math.floor(y / 3), 61 + pos) < 0.05) return FLORES[Math.floor(ruido(x, y, 62) * 4)];
      return ruido(x, y, 63 + pos) < 0.2 ? '#8cdc64' : '#5cc04e';
    }
    if (z >= AL - 4) return z === AL - 4 ? '#1f6e2e' : '#2c8a38';
    if (z < fondo + 3) return '#8a5a3a';
    return arena(x, z, pos);
  });
}
// ---- palmeras: tronco, cocos y hojas ----
function palmeraHoja(px, py, z, cx0, cy0, CO) {
  const dx = px - cx0, dy = py - cy0, r = Math.hypot(dx, dy);
  if (r > 27) return null;
  const ang = Math.atan2(dy, dx), N = 9;
  for (let k = 0; k < N; k++) {
    const a = k * Math.PI * 2 / N + 0.3 + (k % 2) * 0.17;
    let df = ang - a; df = Math.atan2(Math.sin(df), Math.cos(df));
    const largo = r * Math.cos(df); if (largo <= 0) continue;
    const lado = r * Math.abs(Math.sin(df)), w = 4.4 * (1 - largo / 28) + 0.9;
    const zf = CO + 6 + largo * 0.45 - (largo / 13) ** 2 * 10;
    if (lado < w && Math.abs(z - zf) < 1.8) {
      if (lado > w * 0.55 && Math.floor(largo) % 3 === 0) continue;
      if (lado < 0.7) return '#2c8a38';
      return z > zf ? (largo > 20 ? '#b6e86a' : '#8cdc64') : (lado > w * 0.5 ? '#3fa83f' : '#52b846');
    }
  }
  return null;
}
function palmeraTronco(px, py, z, cxz, by) {
  const r = 4.2 - z * 0.014 + (z < 6 ? (6 - z) * 0.35 : 0), dx = px - cxz, dy = py - by;
  if (dx * dx + dy * dy > r * r) return null;
  if (z % 5 === 0) return '#7a4a26';
  return dx < -1.4 ? '#e0b080' : (dx > 1.6 ? '#8a5a32' : '#b77c45');
}
function pilaPalmera(tipo) {     // 0: alta y curvada, 1: más baja e inclinada
  const AL = tipo ? 104 : 132, CO = AL - 16, bx = 30, by = 26, curva = tipo ? 13 : 8;
  const ox = z => bx + (tipo ? (z / AL) ** 1.6 * curva : Math.sin(z / AL * 2.4) * curva);
  const cx0 = ox(CO), cy0 = by;
  return pila(64, 52, AL, (z, x, y) => {
    const px = x + 0.5, py = y + 0.5;
    if (z < CO + 2) { const t = palmeraTronco(px, py, z, ox(z), by); if (t) return t; }
    for (let k = 0; k < 4; k++) {
      const a = k * 1.6 + 0.5;
      if (dentro(px - (cx0 + Math.cos(a) * 3), py - (cy0 + Math.sin(a) * 3), z - (CO - 3 - (k & 1) * 2), 2.7, 2.7, 2.7)) return z > CO - 3 ? '#a0683a' : '#5e3a1e';
    }
    return palmeraHoja(px, py, z, cx0, cy0, CO);
  });
}
// ---- vegetación y detalles ----
function pilaArbusto() {
  const bolas = [[9, 11, 6, 6.5], [19, 11, 7, 7.5], [25, 11, 5, 5]];
  return pila(30, 22, 15, (z, x, y) => {
    for (const [bx, by, bz, r] of bolas) {
      const dx = x + 0.5 - bx, dy = y + 0.5 - by, dz = z + 0.5 - bz;
      if (dx * dx + dy * dy + dz * dz > r * r) continue;
      if (dz > r * 0.45 && ruido(x, y, z) < 0.06) return '#ff6f91';
      return dz > r * 0.35 ? '#8cdc64' : (dz > -r * 0.3 ? '#52b846' : '#2c8a38');
    }
    return null;
  });
}
function pilaMata() {            // mata de hierba alta
  return pila(14, 8, 9, (z, x, y) => {
    for (let k = 0; k < 5; k++) {
      const bx = 2 + k * 2.5 + (z * (k - 2)) * 0.18, by = 4 + (k % 2) - 0.5;
      if (Math.abs(x + 0.5 - bx) < 0.9 && Math.abs(y + 0.5 - by) < 1.2 && z < 9 - Math.abs(k - 2)) return z > 5 ? '#8cdc64' : (z > 2 ? '#52b846' : '#2c8a38');
    }
    return null;
  });
}
function pilaFlor() {             // hibisco
  return pila(16, 12, 15, (z, x, y) => {
    const px = x + 0.5, py = y + 0.5;
    for (const [fx, fy, fz] of [[5, 6, 11], [11, 5, 13]]) {
      const dx = px - fx, dy = py - fy, dz = z + 0.5 - fz;
      if (dx * dx + dy * dy + dz * dz < 3.2) return '#ffd23f';
      if (dentro(dx, dy, dz, 3.6, 3.6, 1.6)) return dz > 0 ? '#ff6f91' : '#e0446e';
    }
    if (dentro(px - 8, py - 6, z + 0.5 - 5, 6.5, 5, 5.5)) return z > 6 ? '#5cc04e' : '#2c8a38';
    return null;
  });
}
function pilaEstrella() {
  return pila(12, 12, 3, (z, x, y) => {
    const dx = x + 0.5 - 6, dy = y + 0.5 - 6, r = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
    const R0 = 2 + 3.6 * Math.max(0, Math.cos(a * 5 / 2) ** 8 > 0.2 ? 1 : 0.35) * (Math.abs(Math.cos(a * 2.5)));
    if (r > Math.max(2.2, R0) || z > (r < 2 ? 2 : 1)) return null;
    return z === 2 ? '#ffe56e' : (ruido(x, y, 81) < 0.25 ? '#fff6e0' : '#ff8a2a');
  });
}
function pilaConcha() {
  return pila(8, 6, 4, (z, x, y) => {
    const dx = x + 0.5 - 4, dy = y + 0.5 - 3;
    if (!dentro(dx, dy, z + 0.5, 3.8, 2.8, 3.4)) return null;
    return (Math.round(dx * 1.2) & 1) ? '#ffd6c2' : '#fff6e0';
  });
}
function pilaRocaMar() {
  return pila(28, 18, 26, (z, x, y) => {
    const dx = x + 0.5 - 14, dy = y + 0.5 - 9, dz = z + 0.5;
    const a = dentro(dx + 3, dy, dz, 10, 8, 22), b = dentro(dx - 6, dy + 1, dz, 7, 7, 15);
    if (!a && !b) return null;
    if (z > (a ? 19 : 12) && ruido(x >> 1, y >> 1, 71) < 0.7) return '#5cc04e';
    if (ruido(x, z, 73) < 0.08) return '#5d5268';
    return dx < -4 ? '#b8aec6' : (dx > 5 ? '#6f6680' : '#8f86a0');
  });
}
TAREAS.push(() => {
  PIEZA.hierba = [0, 1, 2].map(v => quieta(pilaHierba(v), false));
  PIEZA.arena = [0, 1, 2].map(v => quieta(pilaArena(v), false));
  PIEZA.base = quieta(pilaBase(), false);
});
TAREAS.push(() => {
  PIEZA.r = quieta(pilaRoca(), true);
  PIEZA.c = quieta(pilaCaja(), true);
  for (const p of PLAT) { const n = p.b - p.a + 1; p.q = quieta(p.tipo === 'tabla' ? pilaTabla(n) : pilaIsleta(n), true); }
});
TAREAS.push(() => { PIEZA.palmeras = [pilaPalmera(0)]; });
TAREAS.push(() => { PIEZA.palmeras[1] = pilaPalmera(1); PIEZA.arbusto = pilaArbusto(); });
TAREAS.push(() => {
  PIEZA.mata = pilaMata(); PIEZA.flor = pilaFlor(); PIEZA.estrella = pilaEstrella(); PIEZA.concha = pilaConcha(); PIEZA.rocaMar = pilaRocaMar();
});
// las olas de delante (camino A, por código): una cresta alargada con espuma blanca arriba, sin contorno (Pepins, 21-11-2026); 3 variantes
const OLA = { an: 44, fo: 12, al: 10 }, PILAS_OLA = [];
function colorOla(z, h, y, x, v) {
  if (z >= h - 1.2) return ruido(x, y, v + 7) < 0.8 ? '#ffffff' : '#dff4ff';
  if (z >= h - 2.4) return ruido(x, y, v + 3) < 0.55 ? '#bfeaff' : '#ffffff';
  if (y < OLA.fo / 2) return '#7cc6ee';
  return z < 3 ? '#2a7fc0' : '#3f9ad8';
}
function pilaOla(v) {
  return pila(OLA.an, OLA.fo, OLA.al, (z, x, y) => {
    const fin = Math.sin(Math.PI * (x + 0.5) / OLA.an) ** 0.6, cuerpo = Math.sin(Math.PI * (y + 0.5) / OLA.fo);
    const h = OLA.al * fin * cuerpo * (0.75 + 0.25 * Math.sin(x * 0.45 + v * 2));
    return z < h ? colorOla(z, h, y, x, v) : null;
  });
}
TAREAS.push(() => { for (let v = 0; v < 3; v++) PILAS_OLA.push(quieta(pilaOla(v), false)); });
