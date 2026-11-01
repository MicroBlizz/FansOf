// Fans of Chef · ESCENARIO: pintar el sótano con volumen, al estilo de Diablo 2 en pixel art. Los muros tienen cara (la pared de piedra
// que se ve de frente cuando hay suelo debajo) y tapa (lo que se ve desde arriba); el suelo mezcla dos losas y lleva grietas, escombros y
// charcos; el decorado (columnas, barriles, huesos, verjas, antorchas) va a la lista que se ordena por los pies. Usa los PNG de Yoshi si
// están (suelo_piedra, suelo_var, muro_cara, muro_tapa, columna, barril, huesos, charco, escombros, verja...) y si no, dibuja por código.
'use strict';

const ALTO_CARA = 30;   // la cara de un muro se ve más alta que una casilla: asoma por encima
const hash2 = (x, y, s = 0) => { let h = (x * 374761393 + y * 668265263 + s * 982451653) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

// --- losas del suelo: cada casilla elige una de las dos texturas y un trozo distinto de ella, para que no se note la repetición ---
const LOSAS = {};
function losa(ctx, nombre, k) {
  const clave = nombre + k; if (LOSAS[clave]) return LOSAS[clave];
  const c = document.createElement('canvas'); c.width = c.height = CAS; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  const im = IMG[nombre];
  if (im) { const n = Math.max(1, Math.floor(im.width / CAS)), sx = (k % n) * CAS, sy = (Math.floor(k / n) % n) * CAS; g.drawImage(im, sx, sy, CAS, CAS, 0, 0, CAS, CAS); }
  else {   // por código: losas de piedra marrón con junta oscura y algún desconchón
    const r = mulberry32(k + 11);
    g.fillStyle = PALETA.U; g.fillRect(0, 0, CAS, CAS);
    g.fillStyle = ['#4a3018', '#44301a', '#3f2a15', '#4d3420'][k % 4]; g.fillRect(1, 1, CAS - 2, CAS - 2);
    g.fillStyle = '#5a3d20'; g.fillRect(1, 1, CAS - 2, 1); g.fillRect(1, 1, 1, CAS - 2);
    g.fillStyle = '#2d1c0c'; for (let i = 0; i < 3; i++) g.fillRect(2 + Math.floor(r() * 20), 2 + Math.floor(r() * 20), 1 + Math.floor(r() * 3), 1);
    if (r() < 0.35) { g.fillStyle = PALETA.U; let x = 2 + Math.floor(r() * 10), y = 2; for (let i = 0; i < 9; i++) { g.fillRect(x, y, 1, 2); y += 2; x += Math.floor(r() * 3) - 1; } }   // una grieta
    if (r() < 0.3) { g.fillStyle = '#6a4a28'; g.fillRect(Math.floor(r() * 18), Math.floor(r() * 18), 2, 2); }   // una piedrecita clara
  }
  LOSAS[clave] = c; return c;
}
function pintaLosa(ctx, cx, cy, x, y) {
  const h = hash2(cx, cy), nombre = IMG.suelo_var && h < 0.3 ? 'suelo_var' : 'suelo_piedra';
  ctx.drawImage(losa(ctx, nombre, Math.floor(hash2(cx, cy, 1) * 16)), x, y);
}
// el patrón de suelo para los fondos (portada y cantina)
let SUELO_PAT = null;
function patronSuelo(ctx) {
  if (SUELO_PAT) return SUELO_PAT;
  const c = document.createElement('canvas'); c.width = c.height = CAS * 4; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) g.drawImage(losa(g, 'suelo_piedra', i + j * 4), i * CAS, j * CAS);
  SUELO_PAT = ctx.createPattern(c, 'repeat'); return SUELO_PAT;
}

// --- muros: la tapa (desde arriba) y la cara (de frente, cuando hay suelo debajo) ---
function pintaTapa(ctx, x, y, cx, cy) {
  if (IMG.muro_tapa) { const im = IMG.muro_tapa, n = Math.max(1, Math.floor(im.width / CAS)), k = Math.floor(hash2(cx, cy, 2) * n * n); ctx.drawImage(im, (k % n) * CAS, Math.floor(k / n) * CAS, CAS, CAS, x, y, CAS, CAS); return; }
  caja(ctx, x, y, CAS, CAS, '#3b3430'); caja(ctx, x, y, CAS, 1, '#4a423c'); caja(ctx, x, y, 1, CAS, '#4a423c');
  if (hash2(cx, cy, 3) < 0.4) caja(ctx, x + 4 + Math.floor(hash2(cx, cy, 4) * 12), y + 3 + Math.floor(hash2(cx, cy, 5) * 14), 1, 5, '#2a2420');
}
function pintaCara(ctx, x, y, cx, cy) {   // la pared de piedra: ocupa la casilla y asoma ALTO_CARA - CAS por encima
  const y0 = y - (ALTO_CARA - CAS);
  if (IMG.muro_cara) { const im = IMG.muro_cara, n = Math.max(1, Math.floor(im.width / CAS)), k = Math.floor(hash2(cx, cy, 6) * n); ctx.drawImage(im, (k % n) * CAS, 0, CAS, Math.min(im.height, ALTO_CARA), x, y0, CAS, ALTO_CARA); }
  else {
    caja(ctx, x, y0, CAS, ALTO_CARA, '#6e635a');
    for (let f = 0; f < 3; f++) {
      const fy = y0 + f * 10, des = f % 2 ? CAS / 2 : 0;
      caja(ctx, x, fy, CAS, 1, '#2a2420'); caja(ctx, x + ((des + 1) % CAS), fy + 1, 1, 9, '#2a2420'); caja(ctx, x + 1, fy + 1, CAS - 2, 1, '#8c7f74');
      if (hash2(cx, cy, 7 + f) < 0.3) caja(ctx, x + 2 + ((des + 3) % 12), fy + 4, 3, 2, '#5a4f47');   // un ladrillo desconchado
    }
    if (hash2(cx, cy, 10) < 0.25) caja(ctx, x + Math.floor(hash2(cx, cy, 11) * 18), y0 + ALTO_CARA - 6, 5, 4, '#3f5a2a');   // musgo abajo
  }
  caja(ctx, x, y0, CAS, 2, '#1a1512');   // la arista con la tapa
  caja(ctx, x, y + CAS - 1, CAS, 1, '#120d0a');   // el zócalo
}
const pisable = c => c === 1 || c === 3 || c === 4 || c >= 5;
const esCara = (cx, cy) => casilla(cx, cy) === 2 && pisable(casilla(cx, cy + 1));

function pintaSuelo(ctx, cam) {
  const x0 = Math.max(0, Math.floor(cam.x / CAS)), y0 = Math.max(0, Math.floor(cam.y / CAS) - 1);
  const x1 = Math.min(MAPA.w - 1, Math.ceil((cam.x + cam.w) / CAS)), y1 = Math.min(MAPA.h - 1, Math.ceil((cam.y + cam.h) / CAS) + 1);
  ctx.imageSmoothingEnabled = false;
  // 1) el suelo y las tapas
  for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) {
    const c = casilla(cx, cy), x = cx * CAS - cam.x, y = cy * CAS - cam.y;
    if (c === 0) { caja(ctx, x, y, CAS, CAS, '#0e0905'); continue; }
    if (c === 2) { if (!esCara(cx, cy)) pintaTapa(ctx, x, y, cx, cy); continue; }
    pintaLosa(ctx, cx, cy, x, y);
    // sombra: debajo de una cara de muro y a la derecha de un muro lateral (la luz viene de la izquierda arriba)
    if (casilla(cx, cy - 1) === 2) { ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(x, y, CAS, 6); ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(x, y + 6, CAS, 5); }
    if (casilla(cx - 1, cy) === 2) { ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(x, y, 5, CAS); }
    if (c === 4) pintaSpr(ctx, 'reja', x + CAS / 2, y + CAS);
    else if (c === 8) pintaSpr(ctx, 'charco', x + CAS / 2, y + CAS, { t: PAN.t });
    else if (c === 9) pintaSpr(ctx, 'escombros', x + CAS / 2, y + CAS);
    else if (c === 7) pintaSpr(ctx, 'huesos', x + CAS / 2, y + CAS);
  }
  // 2) las caras de los muros (encima del suelo de arriba, porque asoman)
  for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) if (esCara(cx, cy)) pintaCara(ctx, cx * CAS - cam.x, cy * CAS - cam.y, cx, cy);
  // 3) la arista de los muros laterales: una línea de sombra donde la tapa toca el suelo
  for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) if (casilla(cx, cy) === 2 && !esCara(cx, cy)) {
    const x = cx * CAS - cam.x, y = cy * CAS - cam.y;
    if (pisable(casilla(cx + 1, cy))) caja(ctx, x + CAS - 1, y, 1, CAS, '#1a1512');
    if (pisable(casilla(cx - 1, cy))) caja(ctx, x, y, 1, CAS, '#1a1512');
    if (pisable(casilla(cx, cy - 1))) caja(ctx, x, y, CAS, 1, '#1a1512');
  }
  for (const v of MAPA.verjas) pintaSpr(ctx, 'verja', v.x - cam.x, v.y - cam.y + CAS - 1);   // las celdas, en la cara del muro de arriba
}
// lo del sótano que tiene altura (cajas, columnas, barriles, cofre, montacargas, antorchas): va a la lista que se ordena por los pies
function cosasConAltura(cam) {
  const lista = [];
  const x0 = Math.max(0, Math.floor(cam.x / CAS) - 1), y0 = Math.max(0, Math.floor(cam.y / CAS) - 3);
  const x1 = Math.min(MAPA.w - 1, Math.ceil((cam.x + cam.w) / CAS)), y1 = Math.min(MAPA.h - 1, Math.ceil((cam.y + cam.h) / CAS));
  for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) {
    const c = casilla(cx, cy); if (c !== 3 && c !== 5 && c !== 6) continue;
    const px = cx * CAS - cam.x, py = cy * CAS - cam.y, pies = (cy + 1) * CAS;
    if (c === 3) lista.push({ y: pies, pinta: g => { cajaMarco(g, px + 1, py - 6, CAS - 2, CAS + 5, PALETA.B); caja(g, px + 3, py - 4, CAS - 6, 1, PALETA.T); caja(g, px + 2, py + CAS / 2 - 2, CAS - 4, 1, PALETA.b); } });
    else lista.push({ y: pies, pinta: g => pintaSpr(g, c === 5 ? 'columna' : 'barril', px + CAS / 2, pies - cam.y) });
  }
  const m = MAPA.montacargas, co = MAPA.cofre;
  lista.push({ y: m.y, pinta: g => pintaSpr(g, 'montacargas', m.x - cam.x, m.y - cam.y, { listo: JORNADA.objetivosHechos() }) });
  if (!co.abierto) lista.push({ y: co.y, pinta: g => pintaSpr(g, 'cofre', co.x - cam.x, co.y - cam.y) });
  for (const a of MAPA.antorchas) lista.push({ y: a.y, pinta: g => pintaSpr(g, 'antorcha', a.x - cam.x, a.y - cam.y, { t: PAN.t }) });
  return lista;
}
// una fila de muro con cara para los fondos (portada y cantina)
function pintaMuroFondo(ctx, W) { for (let x = 0, i = 0; x < W; x += CAS, i++) { pintaTapa(ctx, x, 0, i, 0); pintaCara(ctx, x, CAS, i, 1); } }
