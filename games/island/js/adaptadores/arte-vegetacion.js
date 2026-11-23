// Fans of Island · adaptadores/arte-vegetacion: ARTE DE LA VEGETACIÓN en lonchas: las palmeras (tronco, cocos y hojas), los arbustos y los
// detalles del suelo (matas, hibiscos, estrellas, conchas y rocas en el mar). Todo va a IS.arte.PIEZA (lo crea arte-isla.js).
'use strict';
{
const { ruido, TAREAS } = IS;
const { dentro, pila } = IS.Lonchas;
const { PIEZA } = IS.arte;
// ---- palmeras: tronco, cocos y hojas ----
function hojaDeFronda(k, ang, r, z, CO) {   // el color de la hoja k de la copa en ese punto, o null si ahí no pasa
  const a = k * Math.PI * 2 / 9 + 0.3 + (k % 2) * 0.17;
  let df = ang - a; df = Math.atan2(Math.sin(df), Math.cos(df));
  const largo = r * Math.cos(df); if (largo <= 0) return null;
  const lado = r * Math.abs(Math.sin(df)), w = 4.4 * (1 - largo / 28) + 0.9;
  const zf = CO + 6 + largo * 0.45 - (largo / 13) ** 2 * 10;
  if (lado >= w || Math.abs(z - zf) >= 1.8) return null;
  if (lado > w * 0.55 && Math.floor(largo) % 3 === 0) return null;
  if (lado < 0.7) return '#2c8a38';
  return z > zf ? (largo > 20 ? '#b6e86a' : '#8cdc64') : (lado > w * 0.5 ? '#3fa83f' : '#52b846');
}
function palmeraHoja(px, py, z, cx0, cy0, CO) {
  const dx = px - cx0, dy = py - cy0, r = Math.hypot(dx, dy);
  if (r > 27) return null;
  const ang = Math.atan2(dy, dx);
  for (let k = 0; k < 9; k++) { const c = hojaDeFronda(k, ang, r, z, CO); if (c) return c; }
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
TAREAS.push(() => { PIEZA.palmeras = [pilaPalmera(0)]; });
TAREAS.push(() => { PIEZA.palmeras[1] = pilaPalmera(1); PIEZA.arbusto = pilaArbusto(); });
TAREAS.push(() => {
  PIEZA.mata = pilaMata(); PIEZA.flor = pilaFlor(); PIEZA.estrella = pilaEstrella(); PIEZA.concha = pilaConcha(); PIEZA.rocaMar = pilaRocaMar();
});
}
