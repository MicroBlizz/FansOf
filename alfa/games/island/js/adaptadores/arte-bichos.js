// Fans of Island · adaptadores/arte-bichos: ARTE DE LOS BICHOS en lonchas: la gaviota que tira cocos, el coco, el cangrejo que anda de lado y la MechaVaca
// (una vaca en un mecha rosa con botas cohete) que vuela al fondo de vez en cuando. Cuelgan de IS.arte.
'use strict';
{
const { TAREAS, ruido } = IS;
const { dentro, dist2Seg, pila } = IS.Lonchas;
// ================= Gaviota y coco =================
const POSE_GAV = { arriba: { a: 1 }, medio: { a: 0.2 }, abajo: { a: -0.8 } };
const GAV_C = { cx: 29, cy: 15 };
function puntaAla(t, y, yb) {   // la punta negra del ala, con su rayita blanca
  return (t > 0.86 && y > yb + 1.5 && y < yb + 3) ? '#ffffff' : '#2a2f3a';
}
function gaviotaAlas(pose) {
  const { cx, cy } = GAV_C;
  return (z, x, y) => {
    const dx = Math.abs(x - cx); if (dx < 3.5 || dx > 28) return null;
    const t = (dx - 3.5) / 24.5, zw = 11 + t * pose.a * 9;
    if (Math.abs(z - zw) > 1.3) return null;
    const yf = cy + 5 - t * 5, yb = cy - 6 + t * 3;
    if (y < yb || y > yf) return null;
    if (t > 0.78) return puntaAla(t, y, yb);
    if (y > yf - 1.6) return '#ffffff';
    return z > zw ? '#aab6c4' : '#7d8a9c';
  };
}
function gaviotaCola(z, x, y) {
  const { cx, cy } = GAV_C;
  if (y < cy - 15 || y > cy - 7 || Math.abs(z - 11.5) > 1.2) return null;
  if (Math.abs(x - cx) > 2 + (cy - 7 - y) * 0.45) return null;
  return y < cy - 13 ? '#2a2f3a' : '#e6edf3';
}
function gaviota(pose) {
  const { cx, cy } = GAV_C;
  const pico = (z, x, y) => dist2Seg(x, y, z, [cx, cy + 13, 13], [cx, cy + 17.5, 12]) <= 1.6 ? (y > cy + 16.3 ? '#ff8a2a' : '#ffc531') : null;
  const ojos = (z, x, y) => { for (const l of [-1, 1]) if (dentro(x - (cx + l * 3.1), y - (cy + 11.5), z - 14.3, 1.25, 1.25, 1.25)) return '#2a1830'; return null; };
  const cabeza = (z, x, y) => dentro(x - cx, y - (cy + 10), z - 13, 4.3, 4.6, 4.2) ? (z > 14 ? '#ffffff' : '#eef3f7') : null;
  const cuerpo = (z, x, y) => dentro(x - cx, y - (cy + 1), z - 11, 5, 10, 4.8) ? (z < 9 ? '#d9e2ea' : '#ffffff') : null;
  const patas = (z, x, y) => { for (const l of [-1, 1]) if (dentro(x - (cx + l * 1.8), y - (cy - 6), z - 6.2, 1.2, 2.3, 1.1)) return '#ff8a2a'; return null; };
  const piezas = [pico, ojos, cabeza, gaviotaAlas(pose), gaviotaCola, cuerpo, patas];
  return (z, x, y) => { for (const f of piezas) { const c = f(z + 0.5, x + 0.5, y + 0.5); if (c) return c; } return null; };
}
const PILAS_GAV = {};
for (const n in POSE_GAV) TAREAS.push(() => { PILAS_GAV[n] = pila(58, 34, 24, gaviota(POSE_GAV[n])); });
function cocoCara(dx, dy, dz) {
  if (!(dy > 3 && dz > 0.5 && dz < 3.2)) return false;
  return (Math.abs(dx - 1.8) < 1 && dz > 1.8) || (Math.abs(dx + 1.8) < 1 && dz > 1.8) || (Math.abs(dx) < 1 && dz < 1.8);
}
const PILA_COCO = pila(14, 14, 10, (z, x, y) => {
  const dx = x + 0.5 - 7, dy = y + 0.5 - 7, dz = z + 0.5 - 5;
  if (!dentro(dx, dy, dz, 6.6, 6.6, 4.8)) return null;
  if (cocoCara(dx, dy, dz)) return '#2a1830';
  if (ruido(x, y, z) < 0.22) return '#5e3a1e';
  return dz > 2 ? '#b77c45' : (dz > -2 ? '#8a5a32' : '#6b4428');
});

// ================= Cangrejo: camina de lado, mirando a la cámara =================
const POSE_CANG = { paso1: { paso: 1, pinza: 0 }, paso2: { paso: -1, pinza: 1 } };
const CANG_C = { cx: 18, cy: 13 };
function cangrejoOjos(z, x, y) {
  const { cx, cy } = CANG_C;
  for (const l of [-1, 1]) {
    if (dentro(x - (cx + l * 4), y - (cy + 4.5), z - 17.5, 2.1, 2.1, 2.1)) return (y > cy + 5.6 && Math.abs(z - 17.4) < 1.1 && Math.abs(x - (cx + l * 4)) < 1.2) ? '#2a1830' : '#ffffff';
    if (dist2Seg(x, y, z, [cx + l * 3.5, cy + 3, 10], [cx + l * 4, cy + 4.3, 16]) <= 0.9) return '#d23a2a';
  }
  return null;
}
function cangrejoPinzas(pose) {
  const { cx, cy } = CANG_C;
  return (z, x, y) => {
    for (const l of [-1, 1]) {
      const pcx = cx + l * 13.5, pcy = cy + 7, pcz = 8 + pose.pinza * 2;
      if (dentro(x - pcx, y - pcy, z - pcz, 4.6, 4.2, 3.8)) {
        if (y > pcy + 0.8 && Math.abs(z - pcz) < (pose.pinza ? 1.5 : 0.45)) return null;
        return z > pcz + 1.2 ? '#ff8a6a' : (z < pcz - 1.5 ? '#c83a2a' : '#ff5a4a');
      }
      if (dist2Seg(x, y, z, [cx + l * 8, cy + 3, 7], [cx + l * 12, cy + 6, 8]) <= 3.2) return '#ff5a4a';
    }
    return null;
  };
}
function cangrejoVientre(dx, dy, dz) {   // la boca y la tripa clara de abajo
  if (dy > 7.2 && Math.abs(dx) < 2 && Math.abs(dz + 1) < 0.7) return '#5a1530';
  return (dy > 5 && dz < -0.5) ? '#ffd0a8' : null;
}
function cangrejoCuerpo(z, x, y) {
  const { cx, cy } = CANG_C;
  const dx = x - cx, dy = y - cy, dz = z - 8.5;
  if (!dentro(dx, dy, dz, 11, 8, 5.6)) return null;
  const vientre = cangrejoVientre(dx, dy, dz); if (vientre) return vientre;
  if (dz > 2.6 && ruido(x >> 1, y >> 1, 91) < 0.15) return '#ffb3a0';
  return dz > 2 ? '#ff8a6a' : (dz < -2.5 ? '#c83a2a' : '#ff5a4a');
}
function cangrejoPatas(pose) {
  const { cx, cy } = CANG_C;
  return (z, x, y) => {
    for (const l of [-1, 1]) for (let k = 0; k < 3; k++) {
      const m = ((k + (l > 0 ? 1 : 0)) % 2 ? 1 : -1) * pose.paso * 1.6;
      if (dist2Seg(x, y, z, [cx + l * 9, cy - 3 + k * 3, 7], [cx + l * 15.5, cy - 4 + k * 3.5 + m, 0.6]) <= 1.3) return '#c83a2a';
    }
    return null;
  };
}
function cangrejo(pose) {
  const piezas = [cangrejoOjos, cangrejoPinzas(pose), cangrejoCuerpo, cangrejoPatas(pose)];
  return (z, x, y) => { for (const f of piezas) { const c = f(z + 0.5, x + 0.5, y + 0.5); if (c) return c; } return null; };
}
const PILAS_CANG = {};
for (const n in POSE_CANG) TAREAS.push(() => { PILAS_CANG[n] = pila(36, 26, 21, cangrejo(POSE_CANG[n])); });

// ================= MechaVaca =================
const MV = { cx: 20, cy: 16, rosa: '#ff7eb6', rosaL: '#ffb0d4', rosaO: '#d2508a', gris: '#8c95a6', grisO: '#5b6474', crema: '#fff1cf', luz: '#ffe56e' };
function mvFuego(llama) {
  return (z, x, y) => {
    if (z > 8) return null;
    for (const l of [-1, 1]) {
      const largo = llama ? 9 : 6, t = (8.5 - z) / largo; if (t > 1) continue;
      const r = 3.2 * (1 - t) + 0.4, d = Math.hypot(x - (MV.cx + l * 6), y - MV.cy);
      if (d <= r) return d < r * 0.4 ? '#fff6a0' : (d < r * 0.75 ? '#ffc531' : '#ff6a2a');
    }
    return null;
  };
}
function mvBrazos(z, x, y) {
  const { cx, cy } = MV;
  for (const l of [-1, 1]) {
    if (dentro(x - (cx + l * 15), y - (cy + 5), z - 18, 3.6, 3.6, 3.6)) return z > 19 ? MV.gris : MV.grisO;
    if (dentro(x - (cx + l * 12), y - cy, z - 27, 3.4, 3.4, 3.4)) return MV.gris;
    if (dist2Seg(x, y, z, [cx + l * 12, cy, 27], [cx + l * 15, cy + 5, 18]) <= 7.8) return z > 24 ? MV.rosaL : MV.rosa;
  }
  return null;
}
function mvCaraVaca(dx, dy, dz) {
  if (dy > 3.4 && dz < -0.4) return (dz < -1.4 && dz > -2.8 && Math.abs(Math.abs(dx) - 1.6) < 0.7) ? '#c84a7a' : '#ffb3cf';
  if (dy > 3 && dz > 0.7 && dz < 2.5 && Math.abs(Math.abs(dx) - 2.4) < 0.9) return '#2a1830';
  return null;
}
function mvVaca(z, x, y) {
  const { cx, cy } = MV;
  const dx = x - cx, dy = y - (cy + 2), dz = z - 38;
  for (const l of [-1, 1]) {
    if (dist2Seg(x, y, z, [cx + l * 3.6, cy + 1, 41.5], [cx + l * 6.8, cy + 1, 45]) <= 1.7) return '#f6e8cc';
    if (dentro(x - (cx + l * 7), y - (cy + 1.5), z - 39.5, 2.6, 1.5, 1.3)) return y > cy + 2.2 ? '#ffb3cf' : '#ffffff';
  }
  if (!dentro(dx, dy, dz, 6, 5.6, 5.2)) return null;
  const cara = mvCaraVaca(dx, dy, dz); if (cara) return cara;
  if (ruido(Math.floor(x / 3), Math.floor(y / 3), Math.floor(z / 3)) < 0.3) return '#2a1830';
  return dz > 2 ? '#ffffff' : '#eef3f7';
}
function mvEscotilla(z, x, y) {
  if (z < 30 || z > 33) return null;
  const r = Math.hypot(x - MV.cx, y - (MV.cy + 1));
  return (r > 5.4 && r < 8.6) ? (z > 32 ? MV.gris : MV.grisO) : null;
}
function mvCuerpo(z, x, y) {
  const dx = x - MV.cx, dy = y - MV.cy, dz = z - 24;
  if (!dentro(dx, dy, dz, 12, 10, 9)) return null;
  if (dy > 7 && Math.abs(dx) < 4.5 && dz > -5 && dz < 3) return (dx * dx + (dz + 1) ** 2 < 2.3) ? MV.luz : MV.crema;
  return dz > 4 ? MV.rosaL : (dz < -4 ? MV.rosaO : MV.rosa);
}
const mvBotas = (z, x, y) => { for (const l of [-1, 1]) if (dentro(x - (MV.cx + l * 6), y - MV.cy, z - 11, 4, 4.6, 3)) return z > 11.5 ? MV.gris : MV.grisO; return null; };
const mvPiernas = (z, x, y) => { for (const l of [-1, 1]) if (z > 13 && z < 18 && (x - (MV.cx + l * 6)) ** 2 + (y - MV.cy) ** 2 < 6.5) return MV.rosaO; return null; };
function mechavaca(llama) {
  const piezas = [mvVaca, mvEscotilla, mvBrazos, mvCuerpo, mvPiernas, mvBotas, mvFuego(llama)], E = 1.05;
  return (z, x, y) => { const zz = (z + 0.5) / E, xx = (x + 0.5) / E, yy = (y + 0.5) / E; for (const f of piezas) { const c = f(zz, xx, yy); if (c) return c; } return null; };
}
const PILAS_MV = [];
TAREAS.push(() => { PILAS_MV[0] = pila(42, 34, 49, mechavaca(0)); });
TAREAS.push(() => { PILAS_MV[1] = pila(42, 34, 49, mechavaca(1)); });
Object.assign(IS.arte, { PILAS_GAV, PILA_COCO, PILAS_CANG, PILAS_MV });
}
