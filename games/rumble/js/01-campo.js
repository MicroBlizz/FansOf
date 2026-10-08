// Fans of Rumble · El campo: sus medidas (río, puentes, límites, zonas), el tiempo y el CAOS de la partida, las torres y la dificultad, los caminos y el fondo pintado (los colores de cada facción, THEMES, están en core/js/serie/arte/fondos.js)
'use strict';
// medidas del campo (540 × 960: W, H y RES siguen en core/js/serie/config.js)
const TRAY_Y = 790;
const FIELD_DY = 40;   // v0.9.11: el campo se dibuja 40 px más abajo para que la base enemiga no quede bajo el marcador
const RIVER = { y: 420, top: 401, bottom: 439 };
const BRIDGES = [110, 430];   // v0.9.19: los campos de jefe pueden cambiar cuántos puentes hay y dónde (ver 17a-campos.js)
const BASE_BRIDGES = [110, 430];
let RIVER_OPEN = false;      // v0.9.19: río helado: se puede cruzar por cualquier sitio
let BRIDGE_STYLE = null;     // v0.9.19: colores de los puentes (null = madera)
const BRIDGE_HALF = 27;
const BOUNDS = { x0: 18, x1: 522, y0: 58, y1: 782 };   // v0.9.82: el campo es simétrico respecto al río (y' = 840 - y): los dos lados, y PvP y PvE, tienen lo mismo
const ZONE = { p: { y0: 452, y1: 738 }, e: { y0: 102, y1: 388 } };
// el tiempo y el CAOS de la partida, los edificios y la dificultad: se añaden a CFG
Object.assign(CFG, {
  matchTime: 240,          // 4:00
  doubleAt: 60,            // último minuto: CAOS x2
  chaosStart: 5,
  chaosMax: 10,
  chaosEvery: 2.8,         // segundos por punto de CAOS
  structs: {
    tower: { hp: 1000, dmg: 20, cd: 0.9, range: 130, r: 24 },
    base:  { hp: 1800, dmg: 28, cd: 1.1, range: 100, r: 46 },
  },
  diff: {
    easy:   { aiIncome: 0.8, think: [1.3, 2.3], bossCd: 20, stun: 2.0, despido: 28 },
    normal: { aiIncome: 1.25, think: [0.5, 1.0], bossCd: 14, stun: 2.5, despido: 40 },
    ceo:    { aiIncome: 1.45, think: [0.35, 0.8], bossCd: 11, stun: 2.8, despido: 48 },   // v0.9.71: partida rápida CEO (más la ruleta de cada partida: js/10c-rapida-ceo.js)
  },
});
const PATHS = [[[270, 644], [110, 575], [110, 265], [270, 196]]];
PATHS.push(PATHS[0].map(([a, b]) => [W - a, b]));
function distToSeg(px, py, ax, ay, bx, by) { const dx = bx - ax, dy = by - ay; const t = clamp(((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy), 0, 1); return Math.hypot(px - (ax + dx * t), py - (ay + dy * t)); }
function nearPath(x, y, m) { for (const p of PATHS) for (let i = 0; i < p.length - 1; i++) if (distToSeg(x, y, p[i][0], p[i][1], p[i + 1][0], p[i + 1][1]) < m) return true; return false; }
const STRUCT_SPOTS = [[110, 575, 34], [430, 575, 34], [270, 644, 62], [110, 265, 34], [430, 265, 34], [270, 196, 70]];
function freeSpot(x, y, m = 32) {
  if (nearPath(x, y, m)) return false;
  if (y > RIVER.top - 14 && y < RIVER.bottom + 14) return false;
  for (const [sx, sy, sr] of STRUCT_SPOTS) if (Math.hypot(x - sx, y - sy) < sr + 14) return false;
  return true;
}
function buildBG(fac = 'animales', plaza = 'mb') {
  const undead = fac === 'nomuertos', TH = THEMES[fac] || THEMES.animales, ph = plaza === 'ph', ia = plaza === 'ia';   // v0.9.23: plaza de IAhorro
  const cv = document.createElement('canvas'); cv.width = W * BG_RES; cv.height = H * BG_RES;
  const c = cv.getContext('2d'); c.scale(BG_RES, BG_RES); c.lineJoin = 'round'; c.lineCap = 'round';
  const R = mulberry32(37), r = (a, b) => a + R() * (b - a);
  let g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#a7a77a'); g.addColorStop(0.2, '#9fae69'); g.addColorStop(0.33, '#84b452');
  if (undead) { g.addColorStop(0.43, '#6a9a52'); g.addColorStop(0.5, '#587f4c'); g.addColorStop(0.7, '#4c6e47'); g.addColorStop(1, '#3d5a40'); }
  else { g.addColorStop(0.43, TH.grad[0]); g.addColorStop(0.6, TH.grad[1]); g.addColorStop(1, TH.grad[2]); }
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  for (let y = 60; y < H; y += 44) { c.fillStyle = 'rgba(255,255,255,0.05)'; c.fillRect(0, y, W, 22); }
  for (let i = 0; i < 26; i++) { c.fillStyle = `rgba(176,160,96,${r(0.12, 0.3)})`; c.beginPath(); c.ellipse(r(0, W), r(220, 395), r(14, 42), r(8, 18), r(0, 3), 0, Math.PI * 2); c.fill(); }
  const greens = TH.greens;
  c.lineWidth = 1.2;
  for (let i = 0; i < 2800; i++) {
    const px = r(0, W), py = r(60, 800);
    c.strokeStyle = py < RIVER.y ? (R() < 0.5 ? '#8c9a55' : '#6f9a45') : greens[(R() * greens.length) | 0];
    c.globalAlpha = r(0.35, 0.75); c.beginPath(); c.moveTo(px, py); c.lineTo(px + r(-1.5, 1.5), py - r(2.5, 5.5)); c.stroke();
  }
  c.globalAlpha = 1;
  // Microblizz corporate plaza eating the meadow
  const edge = px => 200 + Math.sin(px * 0.045) * 8 + Math.sin(px * 0.13) * 4 + (Math.abs(px - 270) < 120 ? 34 * Math.cos(((px - 270) / 120) * Math.PI / 2) : 0);
  c.save(); c.beginPath(); c.moveTo(0, 0); c.lineTo(W, 0); for (let px = W; px >= 0; px -= 6) c.lineTo(px, edge(px)); c.closePath();
  c.fillStyle = ia ? '#3d4f5c' : ph ? '#5b6475' : '#a9b1bf'; c.fill(); c.clip();
  c.strokeStyle = ia ? 'rgba(34,227,255,.25)' : ph ? 'rgba(255,203,61,.22)' : 'rgba(70,80,100,.22)'; c.lineWidth = 1; c.beginPath();
  for (let px = 0; px <= W; px += 26) { c.moveTo(px, 0); c.lineTo(px, 270); }
  for (let py = 0; py <= 270; py += 26) { c.moveTo(0, py); c.lineTo(W, py); }
  c.stroke();
  for (let i = 0; i < 34; i++) { c.fillStyle = `rgba(60,70,95,${r(0.05, 0.13)})`; c.fillRect(Math.floor(r(0, 21)) * 26, Math.floor(r(0, 10)) * 26, 26, 26); }
  c.strokeStyle = 'rgba(30,36,54,.5)'; c.lineWidth = 2.4;
  for (let i = 0; i < 5; i++) { const sx = r(20, 520); c.beginPath(); c.moveTo(sx, 50); c.bezierCurveTo(sx + r(-80, 80), 120, sx + r(-80, 80), 170, sx + r(-60, 60), 250); c.stroke(); }
  c.restore();
  c.beginPath(); for (let px = 0; px <= W; px += 6) { px ? c.lineTo(px, edge(px)) : c.moveTo(px, edge(px)); } c.strokeStyle = ia ? '#22e3ff' : ph ? '#ffcb3d' : '#7d8597'; c.lineWidth = 3; c.stroke();
  if (ia) for (let i = 0; i < 26; i++) { const px = r(20, 520), py = r(70, 190); if (Math.abs(px - 270) < 70 && py > 120) continue; c.fillStyle = R() < 0.5 ? 'rgba(125,243,255,.55)' : 'rgba(255,255,255,.35)'; c.font = '9px monospace'; c.fillText(R() < 0.5 ? '0' : '1', px, py); }   // ceros y unos por el suelo
  if (ph) for (let i = 0; i < 18; i++) { const px = r(20, 520), py = r(70, 190); if (Math.abs(px - 270) < 70 && py > 120) continue; c.save(); c.translate(px, py); c.rotate(r(-0.6, 0.6)); c.fillStyle = 'rgba(229,231,235,.75)'; c.beginPath(); c.arc(0, 0, 4, 0, Math.PI * 2); c.fill(); c.strokeStyle = 'rgba(32,16,44,.7)'; c.lineWidth = 1; c.stroke(); c.fillStyle = 'rgba(32,16,44,.7)'; c.beginPath(); c.arc(0, 0, 1, 0, Math.PI * 2); c.fill(); c.restore(); }   // discos tirados por el suelo
  // dusk sky + skyline behind HQ
  const sky = c.createLinearGradient(0, 0, 0, 62); sky.addColorStop(0, '#24133a'); sky.addColorStop(1, '#5b4a80');
  c.fillStyle = sky; c.fillRect(0, 0, W, 62);
  let bx = -10;
  while (bx < W) { const bw = r(34, 64), bh = r(26, 58); c.fillStyle = ia ? '#16222c' : ph ? '#2a3140' : '#41506f'; c.fillRect(bx, 62 - bh, bw, bh); c.strokeStyle = OL; c.lineWidth = 1.5; c.strokeRect(bx, 62 - bh, bw, bh);
    c.fillStyle = ia ? 'rgba(125,243,255,.6)' : ph ? 'rgba(255,203,61,.6)' : 'rgba(255,230,140,.55)'; for (let wy = 62 - bh + 6; wy < 56; wy += 9) for (let wx = bx + 5; wx < bx + bw - 6; wx += 9) if (R() < 0.45) c.fillRect(wx, wy, 4, 4);
    bx += bw + 2; }
  c.fillStyle = '#5a6582'; c.fillRect(0, 60, W, 5);
  // dirt lanes
  for (const p of PATHS) {
    c.beginPath(); p.forEach(([a, b], i) => (i ? c.lineTo(a, b) : c.moveTo(a, b))); c.strokeStyle = 'rgba(115,80,42,.55)'; c.lineWidth = 50; c.stroke();
    c.beginPath(); p.forEach(([a, b], i) => (i ? c.lineTo(a, b) : c.moveTo(a, b))); c.strokeStyle = '#d9b77e'; c.lineWidth = 40; c.stroke();
    for (let i = 0; i < p.length - 1; i++) {
      const [ax, ay] = p[i], [bx2, by] = p[i + 1]; const L = Math.hypot(bx2 - ax, by - ay); const nx = -(by - ay) / L, ny = (bx2 - ax) / L;
      for (let k = 0; k < L / 7; k++) { const t = R(), o = r(-16, 16); c.fillStyle = R() < 0.5 ? '#b8935e' : '#ead3a3'; c.beginPath(); c.ellipse(ax + (bx2 - ax) * t + nx * o, ay + (by - ay) * t + ny * o, r(1, 2.4), r(0.8, 1.6), 0, 0, Math.PI * 2); c.fill(); }
    }
  }
  // river
  c.fillStyle = '#5b3d24'; c.fillRect(0, RIVER.top - 6, W, RIVER.bottom - RIVER.top + 12);
  const rg = c.createLinearGradient(0, RIVER.top, 0, RIVER.bottom); rg.addColorStop(0, '#1f7f9c'); rg.addColorStop(0.5, '#3cc0cf'); rg.addColorStop(1, '#238aa6');
  c.fillStyle = rg; c.fillRect(0, RIVER.top, W, RIVER.bottom - RIVER.top);
  for (const by of [RIVER.top - 3, RIVER.bottom + 3]) { let px = -6; while (px < W + 6) { c.beginPath(); c.ellipse(px, by + r(-1, 1), r(5, 9), r(3, 5), 0, 0, Math.PI * 2); c.fillStyle = R() < 0.5 ? '#8e8a86' : '#a39e97'; c.fill(); c.lineWidth = 1.2; c.strokeStyle = '#4a3a30'; c.stroke(); px += r(10, 17); } }
  // flowers & mushrooms (meadow side), tombstones & boxes (corporate side)
  const fcols = ['#ffffff', '#ffd84d', '#ff8fb1', '#b98cff'];
  for (let i = 0; i < 90; i++) {
    const px = r(26, W - 26), py = r(250, 785); if (!freeSpot(px, py)) continue;
    if (!undead && fac !== 'animales' && py > RIVER.y && decor(c, fac, px, py, R, r)) continue;
    if (undead && py > RIVER.y) {
      const k = R();
      if (k < 0.45) { dot(c, px, py, 2.6, 'rgba(94,242,160,.25)'); dot(c, px, py, 1.2, '#7dffb8'); }
      else if (k < 0.75) { line(c, [px - 4, py - 1, px + 4, py + 1], OL, 3); line(c, [px - 4, py - 1, px + 4, py + 1], '#e8e2d0', 1.6); dot(c, px - 4.4, py - 1.4, 1.5, '#e8e2d0'); dot(c, px + 4.4, py + 1.4, 1.5, '#e8e2d0'); }
      else { shape(c, rr(px - 1.6, py - 6, 3.2, 6, 0.8), '#f3e6cc', 1); shape(c, el(px, py - 7.6, 1.2, 2), '#5ef2a0', 0); }
      continue;
    }
    const col = fcols[(R() * 4) | 0]; for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2; dot(c, px + Math.cos(a) * 2.3, py + Math.sin(a) * 2.3, 1.7, col); } dot(c, px, py, 1.3, '#ffb020');
  }
  for (let i = 0; i < 9; i++) { const px = R() < 0.5 ? r(28, 70) : r(470, 512), py = r(470, 780); if (!freeSpot(px, py)) continue;
    const cap = TH.cap;
    shape(c, rr(px - 2.2, py - 7, 4.4, 7, 1.5), '#f3e6cc', 1.3); shape(c, c => { c.moveTo(px - 7, py - 6); c.quadraticCurveTo(px, py - 16, px + 7, py - 6); c.closePath(); }, cap, 1.4); dot(c, px - 2.5, py - 9, 1.2, TH.capDot); dot(c, px + 2, py - 10.5, 1, TH.capDot); }
  if (!undead && fac !== 'animales') for (let i = 0; i < 10; i++) { const px = R() < 0.5 ? r(30, 90) : r(450, 510), py = r(470, 780); if (!freeSpot(px, py, 30)) continue; bigDecor(c, fac, px, py, R, r); }
  if (undead) for (let i = 0; i < 10; i++) { const px = R() < 0.5 ? r(30, 90) : r(450, 510), py = r(470, 780); if (!freeSpot(px, py, 30)) continue;
    line(c, [px, py, px, py - 14], OL, 4); line(c, [px - 5, py - 10, px + 5, py - 10], OL, 4); line(c, [px, py, px, py - 14], '#7a5a3a', 2.2); line(c, [px - 5, py - 10, px + 5, py - 10], '#7a5a3a', 2.2);
    shape(c, el(px, py + 1, 8, 2.4), 'rgba(40,60,40,.5)', 0); }
  for (let i = 0; i < 14; i++) { const px = R() < 0.5 ? r(30, 82) : r(458, 510), py = r(215, 385); if (!freeSpot(px, py, 30)) continue;
    shape(c, c => { c.moveTo(px - 7, py); c.lineTo(px - 7, py - 9); c.arc(px, py - 9, 7, Math.PI, 0); c.lineTo(px + 7, py); c.closePath(); }, '#b9bfcc', 1.6);
    c.fillStyle = OL; c.font = '6px ' + FONT_D; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('RIP', px, py - 8);
    shape(c, el(px, py + 1, 9, 2.5), 'rgba(90,120,50,.6)', 0); }
  for (const [px, py] of [[196, 238], [352, 240], [400, 214]]) { shape(c, rr(px - 9, py - 11, 18, 11, 1.5), '#c9955a', 1.5); shape(c, poly(px - 9, py - 11, px - 5, py - 15, px + 13, py - 15, px + 9, py - 11), '#ddb07a', 1.3); line(c, [px, py - 11, px, py], '#e8d2a0', 2); }
  // hedges on both sides
  for (let y = 70; y < 800; y += 21) {
    for (const side of [0, 1]) {
      const px = side ? W - r(-4, 8) : r(-4, 8); const cold = y < RIVER.y;
      for (let k = 0; k < 3; k++) { const ox = r(-7, 7), oy = r(-6, 6), rad = r(9, 14);
        c.beginPath(); c.arc(px + ox, y + oy, rad, 0, Math.PI * 2); c.fillStyle = cold ? '#5d7f3c' : TH.hedge[0]; c.fill(); c.lineWidth = 1.5; c.strokeStyle = OL; c.stroke();
        c.beginPath(); c.arc(px + ox - rad * 0.3, y + oy - rad * 0.3, rad * 0.45, 0, Math.PI * 2); c.fillStyle = cold ? '#77964f' : TH.hedge[1]; c.fill(); }
    }
  }
  paintLight(c);
  return cv;
}
// small props scattered on your half (true = drawn)
function decor(c, fac, px, py, R, r) {
  const k = R();
  if (fac === 'streamers') {
    if (k < 0.35) { const col = ['#ff3df0', '#22e3ff', '#a855f7', '#ffe14d'][(R() * 4) | 0]; dot(c, px, py, 4, col + '44'); dot(c, px, py, 1.8, col); return true; }
    if (k < 0.5) { shape(c, rr(px - 2.4, py - 6, 4.8, 6, 1), '#7be04a', 1.1); line(c, [px - 2, py - 4.4, px + 2, py - 4.4], '#1f2937', 0.8); return true; }
    if (k < 0.62) { c.beginPath(); c.moveTo(px - 10, py); c.bezierCurveTo(px - 4, py - 5, px + 2, py + 5, px + 10, py - 1); c.strokeStyle = 'rgba(30,20,40,.55)'; c.lineWidth = 1.6; c.stroke(); return true; }
    return false;
  }
  if (fac === 'heroes') {
    if (k < 0.3) { shape(c, el(px, py, 2.6, 2.6), '#ffcb3d', 1.1); line(c, [px - 0.8, py - 1, px + 0.8, py + 1], '#ca8a04', 0.8); return true; }
    if (k < 0.45) { shape(c, el(px, py, 3.6, 1.6, -0.4), '#4d7c0f', 0.9); shape(c, el(px + 4, py - 1.6, 3.2, 1.4, 0.5), '#65a30d', 0.9); return true; }
    if (k < 0.55) { shape(c, rr(px - 6, py - 3, 12, 4, 1.4), '#f5f3ee', 1.1); return true; }
    return false;
  }
  if (fac === 'ciber') {
    if (k < 0.32) { const L = r(10, 22), dir = R() < 0.5 ? 1 : -1; c.beginPath(); c.moveTo(px, py); c.lineTo(px + L * dir, py); c.lineTo(px + L * dir + 5 * dir, py - 5); c.strokeStyle = 'rgba(34,227,255,.55)'; c.lineWidth = 1.4; c.stroke(); dot(c, px, py, 1.6, '#22e3ff'); dot(c, px + L * dir + 5 * dir, py - 5, 1.6, '#ff3df0'); return true; }
    if (k < 0.45) { shape(c, rr(px - 6, py - 4, 12, 8, 1.4), '#5a6b70', 1.1); dot(c, px - 4, py - 2, 0.7, OL); dot(c, px + 4, py + 2, 0.7, OL); return true; }
    if (k < 0.55) { dot(c, px, py, 6, 'rgba(255,61,240,.18)'); dot(c, px, py, 2.4, 'rgba(255,61,240,.5)'); return true; }
    return false;
  }
  if (fac === 'gamer') {
    if (k < 0.22) { shape(c, rr(px - 2.2, py - 6, 4.4, 6, 1), '#a3e635', 1.1); line(c, [px - 1.8, py - 4.6, px + 1.8, py - 4.6], '#14532d', 0.8); return true; }
    if (k < 0.36) { c.beginPath(); c.moveTo(px - 10, py); c.bezierCurveTo(px - 4, py - 6, px + 2, py + 5, px + 10, py - 1); c.strokeStyle = 'rgba(20,20,40,.6)'; c.lineWidth = 1.6; c.stroke(); dot(c, px + 10, py - 1, 1.4, '#22e3ff'); return true; }
    if (k < 0.46) { shape(c, poly(px - 5, py + 2, px + 5, py + 2, px, py - 7), '#fbbf24', 1.1); dot(c, px - 1, py - 1, 1, '#dc2626'); dot(c, px + 1.4, py + 0.4, 1, '#dc2626'); return true; }
    return false;
  }
  if (fac === 'olvidados') {
    if (k < 0.22) { shape(c, rr(px - 4, py - 4, 8, 8, 0.8), '#1e3a8a', 1); shape(c, rr(px - 2, py - 4, 4, 2.6, 0.4), '#cbd5e1', 0); shape(c, rr(px - 2.6, py + 0.6, 5.2, 3, 0.4), '#fff', 0); return true; }
    if (k < 0.36) { shape(c, rr(px - 5, py - 4, 10, 7, 1), '#6b7280', 1); shape(c, rr(px - 3.6, py - 3, 7.2, 3, 0.6), '#d6cfc0', 0); return true; }
    if (k < 0.5) { dot(c, px, py, 3, 'rgba(214,207,192,.35)'); dot(c, px + 3, py - 1, 2, 'rgba(214,207,192,.3)'); return true; }
    return false;
  }
  if (fac === 'pop') {
    if (k < 0.24) { for (const [ox, oy] of [[0, 0], [2.4, -1], [1, 2]]) dot(c, px + ox, py + oy, 1.9, '#fff7e0'); dot(c, px + 1, py, 0.8, '#fbbf24'); return true; }
    if (k < 0.36) { c.save(); c.translate(px, py); c.rotate(R() - 0.5); shape(c, rr(-5, -2.6, 10, 5.2, 0.8), '#dc2626', 0.9); line(c, [-2, -2.6, -2, 2.6], '#fecaca', 0.8); c.restore(); return true; }
    if (k < 0.46) { shape(c, c => starPath(c, px, py, 3.4, 1.5), '#ffcb3d', 0.9); return true; }
    return false;
  }
  if (fac === 'memes') {
    if (k < 0.3) { shape(c, el(px, py, 3.6, 3.6), '#ffe14d', 1.1); dot(c, px - 1.3, py - 0.8, 0.6, OL); dot(c, px + 1.3, py - 0.8, 0.6, OL); c.beginPath(); c.arc(px, py + 0.4, 1.6, 0.2, Math.PI - 0.2); c.strokeStyle = OL; c.lineWidth = 0.7; c.stroke(); return true; }
    if (k < 0.42) { c.save(); c.globalAlpha = 0.5; txt(c, pick(['LOL', 'XD', 'GG', '+1']), px, py, 7, '#ffffff'); c.restore(); return true; }
    return false;
  }
  return false;
}
function bigDecor(c, fac, px, py, R, r) {
  if (fac === 'streamers') { shape(c, rr(px - 5, py - 12, 10, 12, 2), '#4c1d95', 1.4); shape(c, el(px, py - 5, 3.4, 3.4), '#2b2d3a', 1); dot(c, px, py - 10, 1.2, '#22e3ff'); shape(c, el(px, py + 1, 8, 2.4), 'rgba(30,60,30,.4)', 0); }
  else if (fac === 'heroes') { shape(c, rr(px - 5, py - 14, 10, 14, 1.4), '#f5f3ee', 1.4); line(c, [px - 2, py - 13, px - 2, py - 1], '#cfcac0', 0.9); line(c, [px + 2, py - 13, px + 2, py - 1], '#cfcac0', 0.9); shape(c, poly(px - 6, py - 14, px - 2, py - 18, px + 3, py - 15, px + 6, py - 17, px + 6, py - 14), '#e7e5df', 1.2); shape(c, el(px, py + 1, 9, 2.4), 'rgba(60,80,30,.45)', 0); }
  else if (fac === 'ciber') { line(c, [px, py, px, py - 18], OL, 3.6); line(c, [px, py, px, py - 18], '#6b7280', 2); dot(c, px, py - 19, 2.4, R() < 0.5 ? '#22e3ff' : '#ff3df0'); dot(c, px, py - 19, 6, 'rgba(34,227,255,.18)'); shape(c, el(px, py + 1, 6, 2), 'rgba(20,40,40,.45)', 0); }
  else if (fac === 'gamer') { shape(c, rr(px - 5, py - 18, 10, 12, 3), '#dc2626', 1.4); shape(c, rr(px - 3, py - 15, 6, 4, 1.2), '#111827', 0); shape(c, rr(px - 6, py - 7, 12, 4, 1.4), '#1f2937', 1.2); line(c, [px, py - 3, px, py], OL, 2); shape(c, el(px, py + 1, 8, 2.4), 'rgba(20,40,30,.4)', 0); }
  else if (fac === 'olvidados') { shape(c, rr(px - 8, py - 9, 16, 9, 1), '#b98a55', 1.3); shape(c, rr(px - 5, py - 16, 11, 7, 1), '#c9955a', 1.3); line(c, [px - 8, py - 5, px + 8, py - 5], '#8a6a3a', 0.9); shape(c, el(px, py + 1, 10, 2.4), 'rgba(60,50,30,.45)', 0); }
  else if (fac === 'pop') { line(c, [px - 5, py, px, py - 12], OL, 2); line(c, [px + 5, py, px, py - 12], OL, 2); line(c, [px, py, px, py - 12], OL, 2); c.save(); c.translate(px, py - 15); c.rotate(-0.4); shape(c, rr(-5, -4, 9, 8, 2), '#1f2937', 1.3); shape(c, el(4.6, 0, 1.8, 3.6), '#fff7d6', 1); c.restore(); shape(c, el(px, py + 1, 7, 2.2), 'rgba(30,60,30,.4)', 0); }
  else if (fac === 'memes') { shape(c, rr(px - 7, py - 12, 14, 11, 2), '#e7dcc4', 1.4); shape(c, rr(px - 5, py - 10.5, 10, 7, 1.4), '#1e3a8a', 1); dot(c, px - 2, py - 7.5, 0.8, '#7be04a'); dot(c, px + 2, py - 7.5, 0.8, '#7be04a'); shape(c, el(px, py + 1, 9, 2.4), 'rgba(30,60,30,.4)', 0); }
}
function buildBridges() {   // v0.9.19: con BRIDGE_STYLE se cambian los colores (piedra, metal, galleta, oro…)
  const cv = document.createElement('canvas'); cv.width = W * BG_RES; cv.height = H * BG_RES;
  const c = cv.getContext('2d'); c.scale(BG_RES, BG_RES);
  const S2 = BRIDGE_STYLE || { deck: '#a8703f', plank: '#7d4f2a', rail: '#6e4424', post: '#5a361b' };
  for (const bx of BRIDGES) {
    const L = bx - 34, T = RIVER.top - 12, B = RIVER.bottom + 12, Wd = 68;
    c.fillStyle = 'rgba(10,40,50,.35)'; c.fillRect(L + 5, T + 6, Wd, B - T);
    c.fillStyle = S2.deck; c.strokeStyle = OL; c.lineWidth = 2; c.beginPath(); c.rect(L, T, Wd, B - T); c.fill(); c.stroke();
    c.strokeStyle = S2.plank; c.lineWidth = 1.2; for (let y = T + 6; y < B; y += 7) { c.beginPath(); c.moveTo(L + 6, y); c.lineTo(L + Wd - 6, y); c.stroke(); }
    if (S2.dots) { c.fillStyle = S2.dots; for (let y = T + 9; y < B - 4; y += 9) for (let x = L + 14; x < L + Wd - 10; x += 12) { c.beginPath(); c.arc(x, y, 1.6, 0, Math.PI * 2); c.fill(); } }
    for (const rx of [L, L + Wd - 6]) {
      c.fillStyle = S2.rail; c.fillRect(rx, T - 2, 6, B - T + 4); c.strokeStyle = OL; c.lineWidth = 1.6; c.strokeRect(rx, T - 2, 6, B - T + 4);
      for (const py of [T - 3, (T + B) / 2, B - 3]) { c.fillStyle = S2.post; c.fillRect(rx - 1.5, py - 3.5, 9, 7); c.strokeRect(rx - 1.5, py - 3.5, 9, 7); }
    }
  }
  return cv;
}

