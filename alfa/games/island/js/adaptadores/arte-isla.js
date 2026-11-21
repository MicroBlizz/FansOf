// Fans of Island · adaptadores/arte-isla: ARTE DEL TERRENO en lonchas: los bloques (hierba, arena, base mojada, roca, caja), los puentes y
// las islas flotantes. Todo va a IS.arte.PIEZA; la caché de cada plataforma, a IS.arte.PLAT (un Map: el nivel no guarda dibujos).
// La vegetación y los detalles están en arte-vegetacion.js y las olas en arte-olas.js.
'use strict';
{
const { ruido } = IS;
const { T, D } = IS.MEDIDAS;
const { pila, quieta } = IS.Lonchas;
const FLORES = ['#ff6f91', '#ffd23f', '#ffffff', '#ff9a3c'];
const PIEZA = {}, PLAT = new Map();   // PLAT: plataforma del nivel → su dibujo
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
const GRIETAS = [[10, 10, 11, 24], [11, 21, 17, 17], [22, 22, 5, 16], [3, 9, 8, 8]];   // [x0, x1, z0, z1] de cada raya oscura de la roca
const grietaRoca = (x, z) => GRIETAS.some(([x0, x1, z0, z1]) => x >= x0 && x <= x1 && z >= z0 && z <= z1);
function rocaRecortada(x, y, z) {   // fuera del bloque: los bordes de arriba y abajo y las esquinas redondeadas
  if (y < 6 || y > D - 5) return true;
  const ex = Math.min(x, T - 1 - x), ez = Math.min(z, T - 1 - z);
  return ex < 4 && ez < 4 && (4 - ex) ** 2 + (4 - ez) ** 2 > 16;
}
function colorRoca(x, y, z) {
  if (z >= T - 2) return ruido(x >> 1, y >> 1, 21) < 0.4 ? (z === T - 1 ? '#6fcf5a' : '#4fae45') : '#e3b98a';
  if (grietaRoca(x, z)) return '#6b4630';
  if (x < 3 || z > T - 5) return '#e3b98a';
  if (x > T - 4 || z < 4) return '#8a5c3c';
  return ruido(x, z, 23) < 0.12 ? '#b98b62' : '#c99a6e';
}
function pilaRoca() {
  return pila(T, D, T, (z, x, y) => (rocaRecortada(x, y, z) ? null : colorRoca(x, y, z)));
}
const cajaFuera = (x, y, z) => y < 12 || y > D - 9 || x < 1 || x > T - 2 || z > T - 2;
const tapaCaja = (x, y) => ((x % 7 === 0) ? '#a0683a' : (ruido(x, y, 41) < 0.1 ? '#d8a070' : '#e0aa78'));
function marcoCaja(x, z) {   // el borde de madera, con sus clavos en las esquinas; null en el centro
  if (!(x <= 3 || x >= T - 4 || z <= 2 || z >= T - 5)) return null;
  return ((x === 2 || x === T - 3) && (z === 1 || z === T - 4)) ? '#5e3a1e' : '#9a6236';
}
function colorCaja(x, y, z) {
  if (z === T - 2) return tapaCaja(x, y);
  const marco = marcoCaja(x, z); if (marco) return marco;
  if (Math.abs((x - 4) - (z - 3)) < 1.6) return '#c48a52';
  return ((z - 3) % 6 === 0) ? '#a0683a' : '#d8a070';
}
function pilaCaja() {
  return pila(T, D, T, (z, x, y) => (cajaFuera(x, y, z) ? null : colorCaja(x, y, z)));
}
function pilaTabla(n) {         // puente de tablas, de n bloques de largo
  return pila(n * T, 24, 6, (z, x, y) => {
    if (x % 8 === 7) return z >= 2 ? null : '#5e3a1e';
    if (z === 5) return (y === 0 || y === 23) ? '#f2d9a0' : (ruido(x, y, 51) < 0.12 ? '#c48a52' : '#e0aa78');
    return z < 2 ? '#7a4a26' : '#b77c45';
  });
}
function cimaIsleta(x, y, pos) {   // la hierba de arriba de la isla flotante, con alguna flor
  if (ruido(x >> 1, Math.floor(y / 3), 61 + pos) < 0.05) return FLORES[Math.floor(ruido(x, y, 62) * 4)];
  return ruido(x, y, 63 + pos) < 0.2 ? '#8cdc64' : '#5cc04e';
}
function fondoIsleta(x, y, AN, FO, AL) {   // a qué altura empieza por abajo la isla en este punto (su panza), o null si ahí no hay isla
  const dy = (y + 0.5 - FO / 2) / (FO / 2);
  const ex = Math.min(1, (x + 1) / 12, (AN - x) / 12);
  const f = ex - dy * dy;
  return f <= 0 ? null : AL - 5 - 16 * Math.sqrt(f);
}
function pilaIsleta(n) {        // isla flotante de n bloques de largo, en una sola pieza
  const AL = 22, FO = 36, AN = n * T, pos = n % 3;
  return pila(AN, FO, AL, (z, x, y) => {
    const fondo = fondoIsleta(x, y, AN, FO, AL);
    if (fondo === null || z < fondo) return null;
    if (z === AL - 1) return cimaIsleta(x, y, pos);
    if (z >= AL - 4) return z === AL - 4 ? '#1f6e2e' : '#2c8a38';
    if (z < fondo + 3) return '#8a5a3a';
    return arena(x, z, pos);
  });
}
IS.TAREAS.push(() => {
  PIEZA.hierba = [0, 1, 2].map(v => quieta(pilaHierba(v), false));
  PIEZA.arena = [0, 1, 2].map(v => quieta(pilaArena(v), false));
  PIEZA.base = quieta(pilaBase(), false);
});
IS.TAREAS.push(nivel => {
  PIEZA.r = quieta(pilaRoca(), true);
  PIEZA.c = quieta(pilaCaja(), true);
  for (const p of nivel.PLAT) { const n = p.b - p.a + 1; PLAT.set(p, quieta(p.tipo === 'tabla' ? pilaTabla(n) : pilaIsleta(n), true)); }
});
IS.arte.PIEZA = PIEZA; IS.arte.PLAT = PLAT;
}
