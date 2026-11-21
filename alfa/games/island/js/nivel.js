// Fans of Island · EL NIVEL y su física: 78 columnas de isla con huecos de agua, puentes, islas flotantes, enemigos, zanahorias y
// la bandera; y lo que dice dónde está el suelo (sueloDe), las paredes (mueveX) y la caída (cae).
'use strict';
// Cada columna: s = altura del suelo en bloques (-1 = agua), pila = bloques encima (r roca, c caja), v = variante del dibujo
const COLS = 78, INICIO = 2, META = 72;
const NIV = Array.from({ length: COLS }, (_, i) => ({ s: 0, pila: [], v: Math.floor(ruido(i, 1, 2) * 3) }));
const PLAT = [], ZANAS0 = [], ENEM0 = [], ATRAS = [], DELANTE = [], DECO = [], ROCAS_MAR = [];
const CANG0 = [9, 33, 50, 67];
const R_J = 10, R_E = 12, MAR = -40, Z_OCULTO = MAR - 40, Z_ASOMA = MAR - 7;
const PECES0 = [{ c: 19, y: CARRIL }, { c: 42.5, y: CARRIL }, { c: 57, y: CARRIL }, { c: 30, y: D - 4 }, { c: 61, y: D - 4 }];   // en los huecos y delante de los puentes
(() => {
  const tierra = (a, b, s) => { for (let c = a; c <= b; c++) NIV[c].s = s; };
  const apila = (c, ...t) => { NIV[c].pila = t; };
  const plat = (a, b, z, tipo) => PLAT.push({ a, b, z, tipo, x0: a * T + (tipo === 'isleta' ? 5 : 0), x1: (b + 1) * T - (tipo === 'isleta' ? 5 : 0) });
  const zana = (c, z) => ZANAS0.push({ x: (c + 0.5) * T, z });
  const enemigo = c => ENEM0.push(c);
  apila(12, 'c'); zana(5, 12); zana(6, 12); zana(12, 46);
  tierra(18, 19, -1);
  tierra(20, 25, 1); zana(22, 100); enemigo(24);
  apila(26, 'r'); apila(27, 'r', 'r');
  tierra(28, 31, -1); plat(28, 31, 0, 'tabla'); zana(30, 12);
  enemigo(35); zana(33, 12); plat(37, 39, 64, 'isleta'); zana(38, 76);
  tierra(41, 43, -1); zana(42, 60);
  tierra(44, 51, 1); enemigo(47); enemigo(50);
  tierra(52, 53, 1); apila(53, 'c');
  plat(55, 56, 64, 'isleta'); plat(58, 59, 104, 'isleta'); zana(59, 116);
  tierra(56, 57, -1);
  tierra(60, 61, -1); plat(60, 61, 0, 'tabla');
  enemigo(65); zana(67, 12); zana(68, 12);
  for (const c of [1, 5, 8, 14, 23, 25, 34, 39, 46, 50, 57, 63, 66, 71, 75]) ATRAS.push({ c, giro: ruido(c, 2, 3) * 6.28, tipo: ruido(c, 3, 4) < 0.5 ? 0 : 1, y: 4 + Math.floor(ruido(c, 5, 6) * 10) });
  for (const c of [4, 15, 21, 36, 49, 64, 70]) DELANTE.push({ c, giro: ruido(c, 4, 5) * 6.28 });
  for (const c of [6, 20, 47, 64]) ROCAS_MAR.push({ x: (c + 0.5) * T, y: D + 12 });
})();
// detalles del suelo (siempre los mismos)
function decoraColumna(c) {
  if (NIV[c].s < 0) { if (ruido(c, 9, 9) < 0.5) ROCAS_MAR.push({ x: (c + ruido(c, 9, 8)) * T, y: D + 10 }); return; }
  for (let k = 0; k < 3; k++) {
    const n = ruido(c, k, 13), x = (c + ruido(c, k, 14)) * T;
    if (n < 0.35) DECO.push({ t: 'mata', x, y: 38 + Math.floor(ruido(c, k, 15) * 12), giro: 0 });
    else if (n < 0.45) DECO.push({ t: 'flor', x, y: 14 + Math.floor(ruido(c, k, 16) * 8), giro: ruido(c, k, 17) * 6 });
    else if (n < 0.52) DECO.push({ t: 'estrella', x, y: D - 3, giro: ruido(c, k, 18) * 6 });
    else if (n < 0.6) DECO.push({ t: 'concha', x, y: D - 2, giro: ruido(c, k, 19) * 6 });
  }
}
for (let c = 0; c < COLS; c++) decoraColumna(c);

// ---- física ----
const G = 1350, V_SALTO = 520, V_MAX = 135;
const arribaSuelo = c => (c < 0 || c >= COLS || NIV[c].s < 0) ? -Infinity : NIV[c].s * T;
const arribaCol = c => (c < 0 || c >= COLS || NIV[c].s < 0) ? -Infinity : (NIV[c].s + NIV[c].pila.length) * T;
function sueloDe(o, R) {
  let s = -Infinity;
  const c0 = Math.floor((o.x - R + 1) / T), c1 = Math.floor((o.x + R - 1) / T);
  for (let c = c0; c <= c1; c++) s = Math.max(s, arribaCol(c));
  for (const p of PLAT) if (o.x + R > p.x0 && o.x - R < p.x1 && p.z <= o.z + 0.5) s = Math.max(s, p.z);
  return s;
}
function mueveX(o, dx, R) {           // devuelve true si choca con una pared
  if (!dx) return false;
  let nx = Math.max(R, Math.min(COLS * T - R, o.x + dx)), choca = nx !== o.x + dx;
  const c = Math.floor((dx > 0 ? nx + R - 0.01 : nx - R) / T);
  if (arribaCol(c) > o.z + 3) { nx = dx > 0 ? c * T - R : (c + 1) * T + R; choca = true; }
  o.x = nx; return choca;
}
function cae(o, dt, factor, R) {       // 'aire', 'aterriza' o 'suelo'
  const s = sueloDe(o, R);
  if (o.z > s || o.vz > 0) {
    o.vz -= G * factor * dt; o.z += o.vz * dt;
    if (o.vz <= 0 && o.z <= s) { o.z = s; o.vz = 0; return 'aterriza'; }
    return 'aire';
  }
  o.z = s; return 'suelo';
}
