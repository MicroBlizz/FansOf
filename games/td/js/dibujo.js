// Fans of TD · Dibujo: el fondo del campo, las torres, los enemigos, los disparos y el tablero
'use strict';

function buildTDBackground(fac) {
  const TH = THEMES[fac] || THEMES.animales;
  const c0 = document.createElement('canvas'); c0.width = W * BG_RES; c0.height = H * BG_RES;
  const c = c0.getContext('2d'); c.scale(BG_RES, BG_RES); c.lineJoin = 'round'; c.lineCap = 'round';
  const R = mulberry32(37), r = (a, b) => a + R() * (b - a);
  let g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#9fae69'); g.addColorStop(0.25, TH.grad[0]); g.addColorStop(0.6, TH.grad[1]); g.addColorStop(1, TH.grad[2]);
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  for (let y = 60; y < H; y += 44) { c.fillStyle = 'rgba(255,255,255,0.05)'; c.fillRect(0, y, W, 22); }
  c.lineWidth = 1.2;
  for (let i = 0; i < 3000; i++) { const px = r(0, W), py = r(60, 800); c.strokeStyle = TH.greens[(R() * TH.greens.length) | 0]; c.globalAlpha = r(0.35, 0.75); c.beginPath(); c.moveTo(px, py); c.lineTo(px + r(-1.5, 1.5), py - r(2.5, 5.5)); c.stroke(); }
  c.globalAlpha = 1;
  // la plaza de Microblizz se come el prado alrededor de la sede
  const edge = px => 146 + Math.sin(px * 0.045) * 6 + Math.sin(px * 0.13) * 3 + (Math.abs(px - 270) < 130 ? 22 * Math.cos(((px - 270) / 130) * Math.PI / 2) : 0);
  c.save(); c.beginPath(); c.moveTo(0, 0); c.lineTo(W, 0); for (let px = W; px >= 0; px -= 6) c.lineTo(px, edge(px)); c.closePath(); c.fillStyle = '#a9b1bf'; c.fill(); c.clip();
  c.strokeStyle = 'rgba(70,80,100,.22)'; c.lineWidth = 1; c.beginPath(); for (let px = 0; px <= W; px += 26) { c.moveTo(px, 0); c.lineTo(px, 240); } for (let py = 0; py <= 240; py += 26) { c.moveTo(0, py); c.lineTo(W, py); } c.stroke();
  for (let i = 0; i < 30; i++) { c.fillStyle = `rgba(60,70,95,${r(0.05, 0.13)})`; c.fillRect(Math.floor(r(0, 21)) * 26, Math.floor(r(0, 9)) * 26, 26, 26); }
  c.restore();
  c.beginPath(); for (let px = 0; px <= W; px += 6) px ? c.lineTo(px, edge(px)) : c.moveTo(px, edge(px)); c.strokeStyle = '#7d8597'; c.lineWidth = 3; c.stroke();
  const sky = c.createLinearGradient(0, 0, 0, 62); sky.addColorStop(0, '#24133a'); sky.addColorStop(1, '#5b4a80'); c.fillStyle = sky; c.fillRect(0, 0, W, 62);
  let bx = -10; while (bx < W) { const bw = r(34, 64), bh = r(26, 58); c.fillStyle = '#41506f'; c.fillRect(bx, 62 - bh, bw, bh); c.strokeStyle = OL; c.lineWidth = 1.5; c.strokeRect(bx, 62 - bh, bw, bh); c.fillStyle = 'rgba(255,230,140,.55)'; for (let wy = 62 - bh + 6; wy < 56; wy += 9) for (let wx = bx + 5; wx < bx + bw - 6; wx += 9) if (R() < 0.45) c.fillRect(wx, wy, 4, 4); bx += bw + 2; }
  c.fillStyle = '#5a6582'; c.fillRect(0, 60, W, 5);
  // la explanada de tierra: todo el ancho de la pantalla es camino, y lo cierras tú con torres
  const top = GY - 8;
  c.fillStyle = 'rgba(115,80,42,.55)'; c.fillRect(0, top - 5, W, GY1 - top + 10);
  c.fillStyle = '#d9b77e'; c.fillRect(0, top, W, GY1 - top);
  for (let i = 0; i < NCELL; i++) if (((i % COLS) + ((i / COLS) | 0)) % 2) { c.fillStyle = 'rgba(150,105,55,.10)'; c.fillRect(ccx(i) - CELL / 2, ccy(i) - CELL / 2, CELL, CELL); }
  for (let k = 0; k < 2600; k++) { c.fillStyle = R() < 0.5 ? '#b8935e' : '#ead3a3'; c.beginPath(); c.ellipse(r(0, W), r(top, GY1), r(1, 2.4), r(0.8, 1.6), 0, 0, Math.PI * 2); c.fill(); }
  for (let k = 0; k < 40; k++) { const px = r(8, W - 8), py = r(top + 6, GY1 - 6); shape(c, el(px, py, r(2.5, 4.5), r(2, 3)), '#a88a62', 1.1); }
  // la entrada de Microblizz y el sendero hasta La Madriguera
  const gw = (GRID.gate + 0.5) * CELL;
  c.fillStyle = '#d9b77e'; c.fillRect(HQ.x - gw, top - 30, gw * 2, 34);
  c.beginPath(); c.moveTo(DEN.x - gw, GY1 - 2); c.lineTo(DEN.x + gw, GY1 - 2); c.lineTo(DEN.x + gw * 0.8, GY1 + 40); c.lineTo(DEN.x - gw * 0.8, GY1 + 40); c.closePath(); c.fillStyle = 'rgba(115,80,42,.55)'; c.fill();
  c.fillStyle = '#d9b77e'; c.fillRect(DEN.x - gw + 4, GY1 - 4, gw * 2 - 8, 38);
  // flores y setas en la hierba de abajo
  const fcols = ['#ffffff', '#ffd84d', '#ff8fb1', '#b98cff'];
  for (let i = 0; i < 40; i++) { const px = r(10, W - 10), py = r(GY1 + 12, 790); if (Math.abs(px - DEN.x) < gw + 6) continue; const col = fcols[(R() * 4) | 0]; for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2; dot(c, px + Math.cos(a) * 2.3, py + Math.sin(a) * 2.3, 1.7, col); } dot(c, px, py, 1.3, '#ffb020'); }
  for (let i = 0; i < 6; i++) { const px = r(20, W - 20), py = r(GY1 + 22, 785); if (Math.abs(px - DEN.x) < gw + 14) continue; shape(c, rr(px - 2.2, py - 7, 4.4, 7, 1.5), '#f3e6cc', 1.3); shape(c, c2 => { c2.moveTo(px - 7, py - 6); c2.quadraticCurveTo(px, py - 16, px + 7, py - 6); c2.closePath(); }, TH.cap, 1.4); dot(c, px - 2.5, py - 9, 1.2, TH.capDot); dot(c, px + 2, py - 10.5, 1, TH.capDot); }
  paintLight(c);
  return c0;
}
function drawSpr(key, x, y, sc, face, o = {}) {
  const s = SPR[key]; if (!s) return; const T = TYPES[key];
  ctx.save(); ctx.globalAlpha = o.alpha == null ? 1 : o.alpha; ctx.translate(x, y); if (o.ang) ctx.rotate(o.ang * face); ctx.scale(face * sc * (o.sx || 1), sc * (o.sy || 1));
  ctx.drawImage(s.c, -s.ax, -s.ay, s.wd, s.ht);
  if (T && T.foot && CFG.units[key]) { const r = CFG.units[key].r, l = o.walk != null ? Math.sin(o.walk) * 2.2 : 0; for (const [fx, lift] of [[-0.4, Math.max(0, l)], [0.4, Math.max(0, -l)]]) { ctx.beginPath(); ctx.ellipse(fx * r, -1 - lift, r * 0.3, r * 0.19, 0, 0, Math.PI * 2); ctx.fillStyle = T.foot; ctx.fill(); ctx.lineWidth = 1.6; ctx.strokeStyle = OL; ctx.stroke(); } }
  if (o.flash > 0) { ctx.globalAlpha = o.flash; ctx.drawImage(s.w, -s.ax, -s.ay, s.wd, s.ht); }
  if (o.grey) { ctx.globalAlpha = 0.55; ctx.drawImage(s.g || s.w, -s.ax, -s.ay, s.wd, s.ht); }
  ctx.restore();
}
function drawStump(x, y, t) {
  ctx.fillStyle = 'rgba(20,10,30,.3)'; ctx.beginPath(); ctx.ellipse(x, y + 3, TOWER_R + 3, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x, y + 2, TOWER_R, 7.5, 0, 0, Math.PI); ctx.lineTo(x - TOWER_R, y - 3); ctx.closePath(); ctx.fillStyle = '#7a4d1c'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = OL; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(x, y - 3, TOWER_R, 7.5, 0, 0, Math.PI * 2); ctx.fillStyle = '#d9a35e'; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(x, y - 3, TOWER_R * 0.55, 4, 0, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(122,77,28,.6)'; ctx.lineWidth = 1.2; ctx.stroke();
  if (t && t.lvl > 1) for (let i = 0; i < t.lvl - 1; i++) { ctx.save(); ctx.translate(x + (i - (t.lvl - 2) / 2) * (t.lvl > 3 ? 9 : 14), y + 7); ctx.beginPath(); starPath(ctx, 0, 0, 5.5, 2.4); ctx.fillStyle = '#ffcb3d'; ctx.fill(); ctx.lineWidth = 1.4; ctx.strokeStyle = OL; ctx.stroke(); ctx.restore(); }
}
const TSCALE = { bunny: 0.82, mechavaca: 0.82, junkcoon: 0.95 };
const tscale = k => TSCALE[k] || (CFG.units[k].r >= 21 ? 0.8 : CFG.units[k].r >= 18 ? 0.86 : 1);
// las cartas que en el original sacan varias unidades se dibujan como un grupito en la peana
function drawUnits(k, x, y, sc, face, o, n) {
  if (n === 2) { drawSpr(k, x - 8, y - 1, sc * 0.82, face, o); drawSpr(k, x + 8, y + 2, sc * 0.82, face, o); }
  else if (n === 3) { drawSpr(k, x - 10, y - 3, sc * 0.72, face, o); drawSpr(k, x + 10, y - 2, sc * 0.72, face, o); drawSpr(k, x, y + 3, sc * 0.72, face, o); }
  else drawSpr(k, x, y, sc, face, o);
}
// proyectiles de las razas: [color, radio, forma]
const SHOTS = { shadow: ['#9b6bff', 5], frost: ['#9fe8ff', 5], wave: ['#e6dcff', 6, 'ring'], clip: ['#ff5ea8', 4], arrow: ['#ffe9a8', 2.5, 'line'], venom: ['#8fe36a', 5], bullet: ['#ffe14d', 2.5, 'line'], code: ['#7dffb0', 4],
  snipe: ['#ff5ea8', 3, 'line'], shell: ['#5a6582', 6], card: ['#fff6ea', 5, 'rect'], gif: ['#ffb347', 4, 'rect'], note: ['#c58cff', 5], disc: ['#cfd6e6', 6, 'ring'], paper: ['#f3e6cc', 5, 'rect'], missile: ['#ff7a1a', 5],
  skull: ['#f3ecd8', 7], drone: ['#8fc2ff', 7], coin: ['#ffcb3d', 6], dog: ['#f0b35a', 7] };
function drawTower(t) {
  const D = tdef(t), sc = tscale(t.k) * (t.mut.scale || 1);
  // RABIA: brillo naranja que crece con los aliados cercanos (como en el original)
  if (t.rage > 0 && !SAVE.noBadges) { const k = t.rage / TD.rage.max, pulse = 0.85 + 0.15 * Math.sin(G.t * 8 + t.id), R = TOWER_R * (1.5 + k * 0.8); const g = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, R); g.addColorStop(0, `rgba(255,120,40,${(0.25 + 0.4 * k) * pulse})`); g.addColorStop(1, 'rgba(255,60,20,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(t.x, t.y, R, R * 0.5, 0, 0, Math.PI * 2); ctx.fill(); }
  if (D.aura && t.stunT <= 0) { ctx.save(); ctx.globalAlpha = 0.3 + 0.1 * Math.sin(G.t * 3); ctx.strokeStyle = '#9ef07a'; ctx.lineWidth = 2; ctx.setLineDash([6, 6]); ctx.lineDashOffset = -G.t * 12; ctx.beginPath(); const ar = D.aura.r || rangeOf(t); ctx.ellipse(t.x, t.y, ar, ar * 0.92, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
  if (t.hasteT > 0) { ctx.save(); ctx.globalAlpha = 0.6; ctx.strokeStyle = '#ffcb3d'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(t.x, t.y, TOWER_R + 4, 10, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
  drawStump(t.x, t.y, t);
  if (t.jump) return;   // el conejo está en el aire: se dibuja aparte
  let sx = 1, sy = 1, ang = 0, x = t.x, z = 0;
  if (t.dropT > 0) { const k = t.dropT / 0.35; z = k * k * 60; }
  if (t.atkT > 0) { const k = Math.sin((t.atkT / 0.22) * Math.PI); ang = 0.25 * k; sx = 1 + 0.12 * k; sy = 1 - 0.08 * k; x += t.face * 3 * k; }
  else { const br = Math.sin(G.t * 3 + t.id * 1.7) * 0.025; sy = 1 + br; sx = 1 - br * 0.6; }
  const o = { sx, sy, ang, grey: t.stunT > 0 };
  drawUnits(t.k, x, t.y - 3 - z, sc, t.face, o, D.n);
  if (t.stunT > 0) { otxt(ctx, (t.stunTxt || '¡DESPEDIDO!').replace(/[¡!]/g, ''), t.x, t.y - 62, 11, '#fff6ea'); for (let i = 0; i < 3; i++) { const a = G.t * 4 + i * 2.1; dot(ctx, t.x + Math.cos(a) * 14, t.y - 50 + Math.sin(a) * 4, 2.4, '#ffcb3d'); } }
}
function drawBunnyJump(t) {
  const J = t.jump, k = Math.min(1, J.t / 0.45), back = J.t > 0.7 ? Math.min(1, (J.t - 0.7) / 0.45) : 0;
  let x, y, z;
  if (!J.hit) { x = lerp(J.x0, J.x1, k); y = lerp(J.y0, J.y1, k); z = Math.sin(k * Math.PI) * 120; }
  else if (back > 0) { x = lerp(J.x1, J.x0, back); y = lerp(J.y1, J.y0, back); z = Math.sin(back * Math.PI) * 90; }
  else { x = J.x1; y = J.y1; z = 0; }
  ctx.fillStyle = 'rgba(20,10,30,.25)'; ctx.beginPath(); ctx.ellipse(x, y, 18, 7, 0, 0, Math.PI * 2); ctx.fill();
  drawSpr('bunny', x, y - z, 0.82, t.face, { ang: !J.hit ? k * 0.6 : 0 });
}
function drawFoe(f) {
  ctx.fillStyle = 'rgba(20,10,30,.3)'; ctx.beginPath(); ctx.ellipse(f.x, f.y + 1, f.r * 1.05, f.r * 0.42, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#3d9bff'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.ellipse(f.x, f.y + 1, f.r * 0.95, f.r * 0.4, 0, 0, Math.PI * 2); ctx.stroke();
  if (f.slowT > 0) { ctx.strokeStyle = '#a3c464'; ctx.lineWidth = 3; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.ellipse(f.x, f.y + 1, f.r * 1.25, f.r * 0.5, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); }
  if (f.markT > 0) { ctx.strokeStyle = '#ff4b5c'; ctx.lineWidth = 2; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.ellipse(f.x, f.y + 1, f.r * 1.5, f.r * 0.62, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); }
  const T = TYPES[f.art] || {}, moving = f.stunT <= 0, z = moving ? Math.abs(Math.sin(f.walk)) * 2.4 * (f.r / 14) : 0;
  const ang = moving ? 0.05 + Math.sin(f.walk) * 0.06 : Math.sin(G.t * 11 + f.id) * 0.07;
  if (f.fog > 0) ctx.globalAlpha = 0.45;
  const lg = f.lunge > 0 ? Math.sin((f.lunge / 0.25) * Math.PI) * 6 : 0;
  drawSpr(f.art, f.x + f.face * lg, f.y - z - (T.hover ? 4 + Math.sin(G.t * 4 + f.id) * 1.5 : 0), f.sc, f.face, { ang, walk: moving ? f.walk : null, flash: f.hitT > 0 ? (f.hitT / 0.12) * 0.9 : 0 });
  if (f.stunT > 0) for (let i = 0; i < 3; i++) { const a = G.t * 5 + i * 2.1; dot(ctx, f.x + Math.cos(a) * 12, f.y - topOf(f) - 6 + Math.sin(a) * 3, 2.2, '#ffcb3d'); }
  ctx.globalAlpha = 1;
  if (f.mutCol && !SAVE.noBadges) dot(ctx, f.x, f.y - topOf(f) - 3, 3.2, f.mutCol);
  if (f.ulvl > 1 && !SAVE.noBadges) for (let i = 0; i < f.ulvl - 1; i++) { ctx.beginPath(); starPath(ctx, f.x + (i - (f.ulvl - 2) / 2) * 9, f.y - topOf(f) - 16, 4.6, 2); ctx.fillStyle = '#ffcb3d'; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = OL; ctx.stroke(); }
  if (f.sh > 0) { ctx.strokeStyle = 'rgba(95,227,255,.85)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(f.x, f.y - topOf(f) * 0.45, f.r * 1.25, topOf(f) * 0.62, 0, 0, Math.PI * 2); ctx.stroke(); }
  if (f.hp < f.maxHp && !FOES[f.k].boss) { const w = Math.max(24, f.r * 2.2), y = f.y - topOf(f) - 8; ctx.fillStyle = OL; ctx.fillRect(f.x - w / 2 - 1.5, y - 1.5, w + 3, 7); ctx.fillStyle = '#173d8f'; ctx.fillRect(f.x - w / 2, y, w, 4); ctx.fillStyle = '#2e8bff'; ctx.fillRect(f.x - w / 2, y, w * Math.max(0, f.hp / f.maxHp), 4); }
}
function drawProj(p) {
  const S = SHOTS[p.kind];
  if (S) {
    const [col, r, shp] = S; ctx.save(); ctx.translate(p.x, p.y);
    if (shp === 'line') { ctx.rotate(p.ang || 0); line(ctx, [-r * 3, 0, r * 2, 0], OL, r + 3); line(ctx, [-r * 3, 0, r * 2, 0], col, r); }
    else if (shp === 'rect') { ctx.rotate(p.rot || 0); shape(ctx, rr(-r, -r * 0.75, r * 2, r * 1.5, 1.5), col, 1.4); }
    else if (shp === 'ring') { ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.lineWidth = 5; ctx.strokeStyle = OL; ctx.stroke(); ctx.lineWidth = 2.6; ctx.strokeStyle = col; ctx.stroke(); }
    else { dot(ctx, 0, 0, r + 1.6, OL); dot(ctx, 0, 0, r, col); dot(ctx, -r * 0.3, -r * 0.3, r * 0.35, 'rgba(255,255,255,.7)'); }
    ctx.restore(); return;
  }
  ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot || 0);
  if (p.kind === 'nut') { shape(ctx, el(0, 1, 4, 4.6), '#a0612b', 1.4); shape(ctx, el(0, -2.5, 4.6, 2.4), '#5a3a20', 1.2); }
  else if (p.kind === 'dyn') { shape(ctx, rr(-3.2, -7, 6.4, 14, 1.6), '#e2463b', 1.4); line(ctx, [0, -7, 2, -11], OL, 1.4); dot(ctx, 2.2, -11.5, 2 + Math.random() * 1.5, '#ffd34d'); }
  else if (p.kind === 'trash') { shape(ctx, el(0, 0, 7, 6.5), '#3b4252', 1.6); shape(ctx, poly(-2, -6, 2, -6, 3, -10, -3, -10), '#3b4252', 1.2); dot(ctx, -2, -1, 1.6, 'rgba(255,255,255,.35)'); }
  else if (p.kind === 'letter') { ctx.rotate(-(p.rot || 0) + Math.sin(p.t * 20) * 0.3); shape(ctx, rr(-8, -5.5, 16, 11, 1.5), '#fff6ea', 1.4); line(ctx, [-8, -5, 0, 1, 8, -5], OL, 1.2); }
  ctx.restore();
  if (p.kind === 'letter') { const k = Math.min(1, p.t / p.dur); p.x = lerp(p.x, p.tx, k * 0.25); p.y = lerp(p.y, p.ty, k * 0.25); }
}
function draw() {
  const V = G.vs;
  if (V && G.screen === 'play' && V.view === 'ai') { saveBoard(V.me); loadBoard(V.ai, 'ai'); drawBoard(); loadBoard(V.me, 'me'); }
  else drawBoard();
}
function drawBoard() {
  ctx.setTransform(SCALE * DPR, 0, 0, SCALE * DPR, 0, 0);
  if (G.screen !== 'play' || !BG) { ctx.fillStyle = '#150b21'; ctx.fillRect(0, 0, W, H); if (BG) ctx.drawImage(BG, 0, 0, W, H); return; }
  const sh = G.shake || 0; if (sh) ctx.translate(rand(-sh, sh) * 0.4, rand(-sh, sh) * 0.4);
  ctx.drawImage(G.vs ? bgOf(G.fac) : BG, 0, 0, W, H);
  // la sede de Microblizz arriba y La Madriguera abajo (arte del original)
  drawSpr(FACTIONS[G.efac].skin + '_base', HQ.x, HQ.y - 6, 0.62, 1);
  // mientras eliges dónde poner una torre: las casillas, la casilla elegida y cómo quedaría el camino
  const gh = G.place && G.ghost;
  if (G.place) {
    ctx.save(); ctx.strokeStyle = 'rgba(90,58,32,.28)'; ctx.lineWidth = 1; ctx.beginPath();
    for (let c = 0; c <= COLS; c++) { ctx.moveTo(GX + c * CELL, GY); ctx.lineTo(GX + c * CELL, GY1); }
    for (let r = 0; r <= ROWS; r++) { ctx.moveTo(GX, GY + r * CELL); ctx.lineTo(GX + COLS * CELL, GY + r * CELL); }
    ctx.stroke(); ctx.restore();
  }
  if (gh) { ctx.fillStyle = G.ghost.ok ? 'rgba(255,255,255,.28)' : 'rgba(255,75,92,.35)'; ctx.fillRect(G.ghost.x - CELL / 2, G.ghost.y - CELL / 2 - 6, CELL, CELL); }
  drawRoute(gh && G.ghost.route ? G.ghost.route : G.route, gh && G.ghost.route ? '#ffcb3d' : 'rgba(255,246,234,.75)');
  // lo que hay que pintar ordenado por altura
  const list = [...G.towers.map(t => ({ y: t.y, f: () => drawTower(t) })), ...G.foes.map(f => ({ y: f.y, f: () => drawFoe(f) })), { y: DEN.y - 70, f: () => drawDen() }];
  list.sort((a, b) => a.y - b.y); for (const e of list) e.f();
  // rango de la torre elegida o de la que vas a poner
  const rs = G.sel || (G.ghost && G.place ? { x: G.ghost.x, y: G.ghost.y, ghost: true } : null);
  if (rs) {
    const R = rs.ghost ? TOWERS[G.fac][G.place].range : rangeOf(rs), ok = rs.ghost ? G.ghost.ok : true;
    ctx.save(); ctx.fillStyle = ok ? 'rgba(255,255,255,.14)' : 'rgba(255,75,92,.18)'; ctx.strokeStyle = ok ? 'rgba(255,255,255,.85)' : 'rgba(255,75,92,.9)'; ctx.lineWidth = 2; ctx.setLineDash([8, 6]);
    ctx.beginPath(); ctx.ellipse(rs.x, rs.y, R, R * 0.92, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();
    if (rs.ghost) { ctx.globalAlpha = 0.75; drawStump(rs.x, rs.y); drawUnits(G.place, rs.x, rs.y - 3, tscale(G.place), 1, {}, TOWERS[G.fac][G.place].n); ctx.globalAlpha = 1; }
  }
  for (const t of G.towers) if (t.jump) drawBunnyJump(t);
  for (const p of G.projs) drawProj(p);
  for (const q of G.parts) {
    const k = q.t / q.life;
    if (q.kind === 'ring') { ctx.globalAlpha = 1 - k; ctx.strokeStyle = q.col; ctx.lineWidth = 4 * (1 - k) + 1; ctx.beginPath(); ctx.ellipse(q.x, q.y, q.r * (0.4 + 0.6 * k), q.r * (0.4 + 0.6 * k) * 0.55, 0, 0, Math.PI * 2); ctx.stroke(); }
    else if (q.kind === 'bolt') { ctx.globalAlpha = 1 - k; const dx = q.x2 - q.x, dy = q.y2 - q.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L; ctx.beginPath(); ctx.moveTo(q.x, q.y); for (let i = 1; i < 4; i++) { const o = Math.sin(q.x * 0.7 + i * 2.3 + q.y) * 7; ctx.lineTo(q.x + dx * i / 4 + nx * o, q.y + dy * i / 4 + ny * o); } ctx.lineTo(q.x2, q.y2); ctx.lineJoin = 'round'; ctx.strokeStyle = OL; ctx.lineWidth = 6; ctx.stroke(); ctx.strokeStyle = q.col; ctx.lineWidth = 3; ctx.stroke(); }
    else if (q.kind === 'slash') { ctx.globalAlpha = 1 - k; ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.a); ctx.strokeStyle = OL; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, q.r, -2.4, -0.6); ctx.stroke(); ctx.strokeStyle = q.col; ctx.lineWidth = 3; ctx.stroke(); ctx.restore(); }
    else { ctx.globalAlpha = 1 - k * 0.7; dot(ctx, q.x, q.y, q.r * (1 - k * 0.5), q.col); }
    ctx.globalAlpha = 1;
  }
  for (const n of G.nums) { ctx.globalAlpha = Math.min(1, (n.life - n.t) * 4); const s = n.big ? n.size * (n.t < 0.12 ? 0.6 + n.t * 3.3 : 1) : n.size; otxt(ctx, n.s, n.x, n.y, s, n.col); ctx.globalAlpha = 1; }
  if (G.boss) { const f = G.boss, w = 300, x = (W - w) / 2, y = 82; ctx.fillStyle = OL; ctx.fillRect(x - 3, y - 3, w + 6, 16); ctx.fillStyle = '#4a1020'; ctx.fillRect(x, y, w, 10); ctx.fillStyle = '#ff4b5c'; ctx.fillRect(x, y, w * Math.max(0, f.hp / f.maxHp), 10); otxt(ctx, foeName(f.k), W / 2, y + 26, 15, '#fff6ea'); }
}
function drawDen() {
  drawSpr(FACTIONS[G.fac].skin + '_base', DEN.x, DEN.y + 14, 0.72, 1, { flash: G.denHitT > 0 ? G.denHitT * 3 : 0 });
  // vida de La Madriguera
  const w = 120, x = DEN.x - w / 2, y = DEN.y + 22, k = Math.min(1, G.lives / TD.baseHp);
  ctx.fillStyle = OL; ctx.fillRect(x - 2, y - 2, w + 4, 11); ctx.fillStyle = '#4a1020'; ctx.fillRect(x, y, w, 7);
  ctx.fillStyle = k > 0.5 ? '#6fd36a' : k > 0.25 ? '#ffcb3d' : '#ff4b5c'; ctx.fillRect(x, y, w * k, 7);
  if (G.fac === 'ciber') { ctx.fillStyle = OL; ctx.fillRect(x - 2, y - 9, w + 4, 8); ctx.fillStyle = '#123a52'; ctx.fillRect(x, y - 7, w, 4); ctx.fillStyle = '#5fe3ff'; ctx.fillRect(x, y - 7, w * (G.shield / PASSIVES.ciber.amt), 4); }
}
// el camino más corto que seguirán los enemigos, con flechitas que avanzan
function drawRoute(route, col) {
  if (!route || route.length < 2) return;
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.setLineDash([2, 9]); ctx.lineDashOffset = -G.t * 22; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(HQ.x, GY - 14); for (const i of route) ctx.lineTo(ccx(i), ccy(i)); ctx.lineTo(DEN.x, GY1 + 10); ctx.stroke(); ctx.restore();
}

/* =========================================================
   INTERFAZ
   ========================================================= */
function showScreen(id) { if (id !== null) { $('#btn-mode').hidden = true; $('#btn-wave').hidden = true; hidePanel(); } for (const s of document.querySelectorAll('.screen')) s.hidden = s.id !== id; $('#hud').hidden = $('#tray').hidden = id !== null; }
function portrait(cnv, key, h, flip = 1) {
  const k = 3; cnv.width = cnv.clientWidth * k || 180; cnv.height = cnv.clientHeight * k || 180;
  const c = cnv.getContext('2d'); c.scale(k, k); const cw = cnv.width / k, ch = cnv.height / k;
  drawVector(c, key, cw / 2, ch - 4, h || ch * 0.8, flip);
}
