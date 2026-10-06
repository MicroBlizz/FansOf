// Fans of Rumble · Dibujo (3/4): edificios, barras de vida y proyectiles
'use strict';

function drawStruct(s) {
  if (s.hidden) return;
  const key = s.alive ? s.skin + '_' + s.role : (SPR[s.skin + '_rubble'] ? s.skin + '_rubble' : 'x_rubble'); const sp = SPR[key];
  const sc = s.alive ? 1 : (s.r / 24) * 0.95;
  let sx = 1, sy = 1; if (s.hitT > 0) { const k = s.hitT / 0.12; sx = 1 + 0.03 * k; sy = 1 - 0.03 * k; } if (s.recoil > 0) sy *= 1 - s.recoil * 0.2;
  ctx.save(); ctx.translate(s.x, s.y); ctx.scale(sc * sx, sc * sy);
  ctx.drawImage(s.corrupt ? corruptOf(key) : sp.c, -sp.ax, -sp.ay, sp.wd, sp.ht);
  if (s.alive && s.hitT > 0) { ctx.globalAlpha = (s.hitT / 0.12) * 0.55; ctx.drawImage(sp.w, -sp.ax, -sp.ay, sp.wd, sp.ht); ctx.globalAlpha = 1; }
  ctx.restore();
  if (!s.alive) return;
  if (s.skin === 'y' && s.role === 'base') {   // v0.9.13: la luz de la PayStation
    const ph2 = S && S.e.phase2 && s.team === 'e', r = (10 + (0.6 + 0.4 * Math.sin(G.t * 4)) * 5) * (s.castT > 0 ? 1.9 : 1) * (ph2 ? 1.3 : 1), ex = s.x, ey = s.y - 118;
    const g = ctx.createRadialGradient(ex, ey, 0, ex, ey, r); g.addColorStop(0, ph2 ? 'rgba(255,90,90,.95)' : 'rgba(255,220,110,.95)'); g.addColorStop(1, 'rgba(255,180,40,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ex, ey, r, 0, Math.PI * 2); ctx.fill();
  }
  if (s.team === 'e' && s.role === 'base' && G.bossOn && s.skin !== 'e' && s.skin !== 'y' && s.skin !== 'i') {   // jefe corrupto: aura roja
    const r = 40 + 6 * Math.sin(G.t * 4) + (s.castT > 0 ? 18 : 0), cy = s.y - TOPS[s.skin + '_base'] * 0.55;
    const g = ctx.createRadialGradient(s.x, cy, 0, s.x, cy, r * 1.4); g.addColorStop(0, 'rgba(255,40,80,.28)'); g.addColorStop(1, 'rgba(255,40,80,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(s.x, cy, r * 1.4, 0, Math.PI * 2); ctx.fill();
  }
  if (s.skin === 'e' && s.role === 'base') {
    const ex = s.x - 9, ey = s.y - 121; const ph2 = S && S.e.phase2;
    const r = (11 + (0.6 + 0.4 * Math.sin(G.t * 4)) * 5) * (s.castT > 0 ? 1.9 : 1) * (ph2 ? 1.3 : 1);
    const g = ctx.createRadialGradient(ex, ey, 0, ex, ey, r); g.addColorStop(0, 'rgba(255,90,100,.95)'); g.addColorStop(1, 'rgba(255,40,60,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ex, ey, r, 0, Math.PI * 2); ctx.fill();
    if (ph2) { ctx.globalAlpha = 0.25 + 0.15 * Math.sin(G.t * 8); ctx.strokeStyle = '#ff3348'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(s.x, s.y - 118, 34, 26, 0, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; }
  }
  if (s.skin === 'e' && s.role === 'tower') {
    for (let i = 0; i < 6; i++) if (Math.sin(G.t * 6 + i * 13.7 + s.x) > 0.55) { ctx.fillStyle = '#ffffff'; ctx.fillRect(s.x - 11.5 + ((i * 7) % 3) * 4, s.y - 61 + i * 9.4 + 2.2, 2.4, 2); }
  }
  const gl = SKINS[s.skin].glow && SKINS[s.skin].glow[s.role];
  if (gl && s.hackedT <= 0) {
    const fx = s.x + gl[0], fy = s.y - gl[1], r = gl[2] * (0.85 + 0.15 * Math.sin(G.t * 9 + s.x));
    const g = ctx.createRadialGradient(fx, fy, 0, fx, fy, r); g.addColorStop(0, `rgba(${gl[3]},.5)`); g.addColorStop(1, `rgba(${gl[3]},0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(fx, fy, r, 0, Math.PI * 2); ctx.fill();
  }
  if (s.hackedT > 0) {   // hackeada por HackerKid
    const top = TOPS[s.skin + '_' + s.role];
    ctx.save(); ctx.globalAlpha = 0.55 + 0.3 * Math.sin(G.t * 30); ctx.fillStyle = '#7be04a';
    for (let i = 0; i < 7; i++) ctx.fillRect(s.x - 24 + ((i * 37 + Math.floor(G.t * 20) * 13) % 48), s.y - top * ((i * 0.17 + G.t * 1.7) % 1), 5 + (i % 3) * 5, 2);
    ctx.restore();
    text('</>', s.x, s.y - top - 34 + Math.sin(G.t * 8) * 2, 14, '#7be04a');
  }
}
function bar(x, y, w, frac, team, h) {
  ctx.fillStyle = 'rgba(20,10,32,.88)'; ctx.beginPath(); rrPath(ctx, x - w / 2 - 2, y - 2, w + 4, h + 4, 3.5); ctx.fill();
  if (frac > 0) { ctx.fillStyle = team === 'p' ? '#ffb02e' : '#4aa3ff'; ctx.beginPath(); rrPath(ctx, x - w / 2, y, Math.max(2.5, w * frac), h, 2); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(x - w / 2 + 1, y + 1, Math.max(0, w * frac - 2), h * 0.35); }
}
function text(str, x, y, size, color) {
  ctx.font = `${size}px ${FONT_D}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(2.5, size * 0.3); ctx.strokeStyle = OL; ctx.strokeText(str, x, y); ctx.fillStyle = color; ctx.fillText(str, x, y);
}
function drawBars(e) {
  if (e.kind === 'struct') {
    if (!e.alive) return;
    const isBase = e.role === 'base', w = isBase ? 92 : 58, h = isBase ? 10 : 8;
    const y = e.team === 'e' && isBase ? e.y + 26 : e.y - TOPS[e.skin + '_' + e.role] - 14;
    bar(e.x, y, w, e.hp / e.maxHp, e.team, h);
    ctx.font = `${isBase ? 10 : 9}px ${FONT_D}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.fillText(Math.ceil(e.hp), e.x, y + h / 2 + 1);
    if (isBase) text(e.team === 'e' ? G.ebaseName : FACTIONS[G.faction].base, e.x, e.team === 'e' ? y + 22 : y - 11, 12, e.team === 'e' ? '#cfe4ff' : '#ffe2c4');
    return;
  }
  const u = e; if (u.deployT > 0) return;
  const y = u.y - (u.z || 0) - topOf(u) - 9;
  const bw = clamp(u.r * 2.3, 26, 46);
  if (u.hp < u.maxHp || isLeader(u.type) || (u.shieldMax && u.shield < u.shieldMax)) {
    bar(u.x, y, bw, u.hp / u.maxHp, u.team, 5);
    if (u.shield > 0) { ctx.fillStyle = 'rgba(20,10,32,.88)'; ctx.fillRect(u.x - bw / 2 - 1, y - 5, bw + 2, 4.4); ctx.fillStyle = '#7df3ff'; ctx.fillRect(u.x - bw / 2, y - 4, bw * u.shield / u.shieldMax, 2.4); }
  }
  if (u.stunT > 0 && u.stunKind === 'daze') {
    for (let i = 0; i < 3; i++) { const a = G.t * 6 + (i * Math.PI * 2) / 3; ctx.save(); ctx.translate(u.x + Math.cos(a) * 10, y - 6 + Math.sin(a) * 3.5); ctx.beginPath(); starPath(ctx, 0, 0, 4, 1.7); ctx.fillStyle = '#ffcb3d'; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = OL; ctx.stroke(); ctx.restore(); }
    return;
  }
  if (u.stunT > 0 && u.stunKind === 'stone') { if (u.stoneTxt) text(u.stoneTxt, u.x, y - 12, 10, '#d1d5db'); return; }
  if (u.banT > 0) { text('BANEADO', u.x, y - 10, 11, '#d8b4fe'); return; }   // v0.9.15
  if (u.stunT > 0 && u.stunKind === 'update') {   // v0.9.15: Actualización obligatoria
    const k = 1 - Math.max(0, u.stunT) / 3, bw2 = 34; ctx.fillStyle = OL; ctx.fillRect(u.x - bw2 / 2 - 1.5, y - 17.5, bw2 + 3, 8); ctx.fillStyle = '#0f172a'; ctx.fillRect(u.x - bw2 / 2, y - 16, bw2, 5); ctx.fillStyle = '#22e3ff'; ctx.fillRect(u.x - bw2 / 2, y - 16, bw2 * Math.min(0.99, 0.02 + k * 0.4), 5);
    text('1/47', u.x, y - 23, 9, '#7df3ff'); return;
  }
  if (u.stunT > 0 && u.stunKind === 'lag') { text('LAG', u.x, y - 12 + Math.sin(G.t * 20 + u.id) * 1.5, 12, '#ff4b5c'); return; }
  if (u.disarmT > 0) { for (let i = 0; i < 3; i++) { const a = G.t * 9 + i * 2.1; ctx.fillStyle = '#5b3a1c'; ctx.beginPath(); ctx.arc(u.x + Math.cos(a) * 9, y - 4 + Math.sin(a * 1.7) * 5, 1.6, 0, Math.PI * 2); ctx.fill(); } }
  if (u.confT > 0) text('?', u.x + Math.sin(G.t * 6 + u.id) * 6, y - 12, 13, '#ff7af0');
  if (u.zombT > 0) text('Zz', u.x + 10, y - 10 + Math.sin(G.t * 3) * 2, 10, '#b9a8ff');
  if (u.markT > 0) { const mx = u.x + bw / 2 + 8, my = y - 6; ctx.save(); ctx.lineWidth = 3.4; ctx.strokeStyle = OL; ctx.beginPath(); ctx.arc(mx, my, 4, 0, Math.PI * 2); ctx.moveTo(mx + 3, my + 3); ctx.lineTo(mx + 6.5, my + 6.5); ctx.stroke(); ctx.lineWidth = 1.6; ctx.strokeStyle = '#ffe14d'; ctx.stroke(); ctx.restore(); }   // marcado por el Detective
  if (u.olvT > 0 && u.olvOn) text('?', u.x - bw / 2 - 8, y + 2, 13, '#ecc98f');   // las torres aún no se acuerdan
  if (u.d.life && u.d.life - (u.lifeT || 0) < 6) { const rem = Math.ceil(u.d.life - (u.lifeT || 0)); text(rem + ' s', u.x, y - 10, 11, '#ff8a8a'); }   // licencia a punto de caducar
  if (u.rage > 0 && !u.jump && !SAVE.noBadges) { const fx = u.x + bw / 2 + 7, fy = y + 1; flame(fx, fy, 1 + u.rage * 0.06); text(String(u.rage), fx + 8, fy + 2, 10, '#ffcb3d'); }
  if (facOf(u.team) === 'heroes' && S[u.team].xpLvl > 0 && !SAVE.noBadges) { const fx = u.x + bw / 2 + 7, fy = y + 2; ctx.beginPath(); starPath(ctx, fx, fy, 5.4, 2.5); ctx.fillStyle = '#ffcb3d'; ctx.fill(); ctx.lineWidth = 1.3; ctx.strokeStyle = OL; ctx.stroke(); text(String(S[u.team].xpLvl), fx + 8, fy + 1, 10, '#ffe9a8'); }
  if (u.ab && !SAVE.noBadges) {   // habilidad del gashapón: chapita con su color de rareza (v0.9.22: se puede quitar en Opciones)
    const A = ABILITIES[u.ab], R = RARITY[A.rar], fx = u.x - bw / 2 - 8, fy = y + 2;
    ctx.beginPath(); ctx.arc(fx, fy, 6.4, 0, Math.PI * 2); ctx.fillStyle = R[2]; ctx.fill(); ctx.lineWidth = 1.6; ctx.strokeStyle = OL; ctx.stroke();
    ctx.beginPath(); ctx.arc(fx, fy, 4.4, 0, Math.PI * 2); ctx.fillStyle = R[1]; ctx.fill();
    ctx.font = '6.5px ' + FONT_D; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = OL; ctx.fillText(A.ic, fx, fy + 0.6);
  }
  if (u.labelT > 0) { ctx.globalAlpha = Math.min(1, u.labelT * 2); text((cardDef(u.type) || { name: '' }).name + (u.sequel ? ' 2' : '') + (u.lvl > 1 ? ' · Nv ' + u.lvl : ''), u.x, y - 9, 12, u.corrupt ? '#f0b8ff' : '#d6e8ff'); ctx.globalAlpha = 1; }
  if (u.stunT > 0 && u.stunKind === 'net') {   // v0.9.13: sin conexión (jefes de Phony)
    ctx.save(); ctx.translate(u.x, y - 14 + Math.sin(G.t * 6 + u.id) * 1.5); ctx.lineCap = 'round';
    for (const [r, w] of [[9, 4.6], [5.6, 4.6]]) { ctx.beginPath(); ctx.arc(0, 4, r, Math.PI * 1.22, Math.PI * 1.78); ctx.lineWidth = w; ctx.strokeStyle = OL; ctx.stroke(); ctx.lineWidth = 2.2; ctx.strokeStyle = '#a9c8ff'; ctx.stroke(); }
    ctx.beginPath(); ctx.arc(0, 3.4, 2, 0, Math.PI * 2); ctx.fillStyle = '#a9c8ff'; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = OL; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-8, -6); ctx.lineTo(8, 6); ctx.lineWidth = 4.4; ctx.strokeStyle = OL; ctx.stroke(); ctx.lineWidth = 2.4; ctx.strokeStyle = '#ff3348'; ctx.stroke(); ctx.restore();
    return;
  }
  if (u.stunT > 0) {
    ctx.save(); ctx.translate(u.x, y - 15 + Math.sin(G.t * 6 + u.id) * 1.5);
    ctx.beginPath(); ctx.moveTo(-7, 6); ctx.lineTo(-7, -2); ctx.arc(0, -2, 7, Math.PI, 0); ctx.lineTo(7, 6); ctx.closePath();
    ctx.fillStyle = '#b9bfcc'; ctx.fill(); ctx.lineWidth = 1.8; ctx.strokeStyle = OL; ctx.stroke();
    ctx.fillStyle = OL; ctx.font = '7px ' + FONT_D; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('RIP', 0, 1); ctx.restore();
  }
}
function flame(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(0, -6.5); ctx.bezierCurveTo(1.2, -3.2, 4.6, -1.6, 4.6, 1.8); ctx.arc(0, 1.8, 4.6, 0, Math.PI); ctx.bezierCurveTo(-4.6, -0.2, -3.2, -1.2, -2.2, -2.8); ctx.bezierCurveTo(-1.8, -1.4, -1, -0.8, -0.3, -0.6); ctx.bezierCurveTo(-0.8, -2.8, -1.1, -4.4, 0, -6.5); ctx.closePath();
  ctx.fillStyle = '#ffcb3d'; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = OL; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 2.6, 2.3, 0, Math.PI * 2); ctx.fillStyle = '#ff5a2a'; ctx.fill();
  ctx.restore();
}
function drawProj(p) {
  const X = p.x, Y = p.y - p.z;
  if (p.kind === 'trash') {
    ctx.globalAlpha = 0.25; ctx.fillStyle = '#140a1e'; ctx.beginPath(); ctx.ellipse(p.x, p.y, 5, 2.2, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    ctx.save(); ctx.translate(X, Y); ctx.rotate(G.t * 9); ctx.lineWidth = 1.4; ctx.strokeStyle = OL;
    ctx.beginPath(); ctx.moveTo(-4.5, 4.5); ctx.quadraticCurveTo(-7, -2, -1.5, -5); ctx.lineTo(0, -6.5); ctx.lineTo(1.5, -5); ctx.quadraticCurveTo(7, -2, 4.5, 4.5); ctx.quadraticCurveTo(0, 7, -4.5, 4.5); ctx.closePath(); ctx.fillStyle = '#2a2e3a'; ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffcb3d'; ctx.fillRect(-1.6, -6, 3.2, 1.6);
    ctx.fillStyle = '#ffd34d'; ctx.beginPath(); ctx.arc(1.5, -9, 1.6 + Math.random() * 1.4, 0, Math.PI * 2); ctx.fill();
    ctx.restore(); return;
  }
  if (p.kind === 'acorn' || p.kind === 'carrot') {
    ctx.globalAlpha = 0.25; ctx.fillStyle = '#140a1e'; ctx.beginPath(); ctx.ellipse(p.x, p.y, 4, 1.8, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    ctx.save(); ctx.translate(X, Y); ctx.rotate(G.t * 14); ctx.lineWidth = 1.4; ctx.strokeStyle = OL;
    if (p.kind === 'acorn') { ctx.beginPath(); ctx.ellipse(0, 1, 3.6, 4, 0, 0, Math.PI * 2); ctx.fillStyle = '#9a6a33'; ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.ellipse(0, -2.4, 4.2, 2, 0, 0, Math.PI * 2); ctx.fillStyle = '#5b3a1c'; ctx.fill(); ctx.stroke(); }
    else { ctx.beginPath(); ctx.moveTo(-3.5, -6); ctx.lineTo(3.5, -6); ctx.lineTo(0, 8); ctx.closePath(); ctx.fillStyle = '#ff8a1f'; ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.ellipse(0, -8, 3, 2.4, 0, 0, Math.PI * 2); ctx.fillStyle = '#5cc23a'; ctx.fill(); ctx.stroke(); }
    ctx.restore(); return;
  }
  const ORB = { plasma: ['#a98bff', 'rgba(120,90,255,0)', 9], shadow: ['#9a5cff', 'rgba(60,200,150,0)', 10], frost: ['#9ff0ff', 'rgba(120,220,255,0)', 9], soulfire: ['#5ef2a0', 'rgba(40,200,120,0)', 11], venom: ['#7be04a', 'rgba(60,200,60,0)', 9], fireball: ['#ff8a1f', 'rgba(255,60,20,0)', 15] }[p.kind];
  if (ORB) {
    if (p.kind === 'soulfire' || p.kind === 'fireball') { ctx.globalAlpha = 0.25; ctx.fillStyle = '#140a1e'; ctx.beginPath(); ctx.ellipse(p.x, p.y, 4, 1.8, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; if (Math.random() < 0.6) parts.push({ type: 'dust', x: p.x, y: p.y, z: p.z, vx: 0, vy: 0, vz: 10, g: 0, life: 0.3, max: 0.3, size: 3, color: p.kind === 'fireball' ? '#ffb347' : '#7dffb8' }); }
    const g = ctx.createRadialGradient(X, Y, 0, X, Y, ORB[2]); g.addColorStop(0, '#ffffff'); g.addColorStop(0.4, ORB[0]); g.addColorStop(1, ORB[1]);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(X, Y, ORB[2], 0, Math.PI * 2); ctx.fill(); return;
  }
  const ang = Math.atan2((p.ty - p.sy) * 0.85, p.tx - p.sx);
  if (p.kind === 'pixel') { ctx.save(); ctx.translate(X, Y); ctx.fillStyle = 'rgba(255,154,60,.45)'; ctx.fillRect(-6, -6, 12, 12); ctx.fillStyle = '#ff9a3c'; ctx.fillRect(-4, -4, 8, 8); ctx.fillStyle = '#fff3c4'; ctx.fillRect(-2, -2, 4, 4); ctx.restore(); return; }
  if (p.kind === 'popcorn') {
    ctx.globalAlpha = 0.25; ctx.fillStyle = '#140a1e'; ctx.beginPath(); ctx.ellipse(p.x, p.y, 4, 1.8, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    ctx.save(); ctx.translate(X, Y); ctx.rotate(G.t * 6); ctx.lineWidth = 1.2; ctx.strokeStyle = OL;
    for (const [ox, oy, r] of [[0, 0, 3.4], [3.2, -2, 2.6], [-3, -1.6, 2.6], [0.6, 3, 2.4]]) { ctx.beginPath(); ctx.arc(ox, oy, r, 0, Math.PI * 2); ctx.fillStyle = '#fff7e0'; ctx.fill(); ctx.stroke(); }
    ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(0.6, 0.4, 1.2, 0, Math.PI * 2); ctx.fill(); ctx.restore(); return;
  }
  if (p.kind === 'missile') {
    if (Math.random() < 0.7) parts.push({ type: 'dust', x: p.x, y: p.y, z: p.z, vx: 0, vy: 0, vz: 6, g: 0, life: 0.35, max: 0.35, size: 2.6, color: '#d1d5db' });
    ctx.save(); ctx.translate(X, Y); ctx.rotate(ang); ctx.lineWidth = 1.4; ctx.strokeStyle = OL;
    ctx.fillStyle = '#ffb347'; ctx.beginPath(); ctx.moveTo(-7, -2); ctx.lineTo(-12 - Math.random() * 4, 0); ctx.lineTo(-7, 2); ctx.closePath(); ctx.fill();
    ctx.beginPath(); rrPath(ctx, -7, -2.6, 11, 5.2, 2); ctx.fillStyle = '#e5e7eb'; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(4, -2.6); ctx.lineTo(8, 0); ctx.lineTo(4, 2.6); ctx.closePath(); ctx.fillStyle = '#dc2626'; ctx.fill(); ctx.stroke(); ctx.restore(); return;
  }
  if (p.kind === 'disc') {
    ctx.save(); ctx.translate(X, Y); ctx.scale(1, 0.75); ctx.rotate(G.t * 18); ctx.lineWidth = 1.4; ctx.strokeStyle = OL;
    ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fillStyle = '#e5e7eb'; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 4.2, -0.6, 0.9); ctx.strokeStyle = '#ff8fd0'; ctx.lineWidth = 1.2; ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 4.2, 2.4, 3.8); ctx.strokeStyle = '#7dd3fc'; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 1.5, 0, Math.PI * 2); ctx.fillStyle = OL; ctx.fill(); ctx.restore(); return;
  }
  if (p.kind === 'contract' || p.kind === 'paper') {
    ctx.save(); ctx.translate(X, Y); ctx.rotate(G.t * 9); ctx.lineWidth = 1.3; ctx.strokeStyle = OL;
    ctx.beginPath(); rrPath(ctx, -4.5, -6, 9, 12, 1); ctx.fillStyle = p.kind === 'paper' ? '#f5f0e1' : '#ffffff'; ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#9ca3af'; ctx.fillRect(-3, -3.6, 6, 1); ctx.fillRect(-3, -1.4, 6, 1); ctx.fillRect(-3, 0.8, 4, 1);
    if (p.kind === 'contract') { ctx.beginPath(); ctx.arc(2, 3.6, 1.6, 0, Math.PI * 2); ctx.fillStyle = '#dc2626'; ctx.fill(); } else { ctx.fillStyle = '#dc2626'; ctx.fillRect(-3, -5.4, 6, 1.2); }
    ctx.restore(); return;
  }
  if (p.kind === 'shell') {
    ctx.globalAlpha = 0.25; ctx.fillStyle = '#140a1e'; ctx.beginPath(); ctx.ellipse(p.x, p.y, 5, 2.2, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.arc(X, Y, 5, 0, Math.PI * 2); ctx.fillStyle = '#374151'; ctx.fill(); ctx.lineWidth = 1.6; ctx.strokeStyle = OL; ctx.stroke();
    ctx.fillStyle = '#ffd34d'; ctx.beginPath(); ctx.arc(X + 2, Y - 5, 1.6 + Math.random() * 1.4, 0, Math.PI * 2); ctx.fill(); return;
  }
  if (p.kind === 'heart' || p.kind === 'meme' || p.kind === 'clip' || p.kind === 'card' || p.kind === 'gif' || p.kind === 'note' || p.kind === 'code') {
    ctx.save(); ctx.translate(X, Y); ctx.lineWidth = 1.4; ctx.strokeStyle = OL;
    if (p.kind === 'heart') { const sc = 1 + 0.15 * Math.sin(G.t * 20); ctx.scale(sc, sc); ctx.beginPath(); heartPath(ctx, 0, 0, 5); ctx.fillStyle = '#ff5fa8'; ctx.fill(); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.arc(-2, -2, 1.3, 0, Math.PI * 2); ctx.fill(); }
    else if (p.kind === 'meme') { ctx.rotate(G.t * 8); ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fillStyle = '#ffe14d'; ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(-2.2, -1.4, 1.2, Math.PI, 0); ctx.moveTo(3.4, -1.4); ctx.arc(2.2, -1.4, 1.2, Math.PI, 0); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 1, 3, 0, Math.PI); ctx.closePath(); ctx.fillStyle = '#5a1530'; ctx.fill(); ctx.fillStyle = '#60a5fa'; ctx.fillRect(-5.4, 0, 1.4, 2.6); ctx.fillRect(4, 0, 1.4, 2.6); }
    else if (p.kind === 'clip') { ctx.rotate(G.t * 10); ctx.fillStyle = '#1f2937'; ctx.fillRect(-6, -4.5, 12, 9); ctx.strokeRect(-6, -4.5, 12, 9); ctx.fillStyle = '#c4b5fd'; ctx.fillRect(-4, -2.6, 8, 5.2); ctx.fillStyle = '#fff'; for (const xx of [-5, -2, 1, 4]) { ctx.fillRect(xx, -4, 1.2, 1); ctx.fillRect(xx, 3, 1.2, 1); } }
    else if (p.kind === 'card') { ctx.scale(Math.cos(G.t * 14), 1); ctx.beginPath(); rrPath(ctx, -4.5, -6, 9, 12, 1.6); ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke(); ctx.fillStyle = '#22c55e'; ctx.fillRect(-3, -4.4, 6, 8.8); }
    else if (p.kind === 'gif') { ctx.rotate(Math.sin(G.t * 12) * 0.3); ctx.beginPath(); rrPath(ctx, -8, -5, 16, 10, 2.4); ctx.fillStyle = ['#ff3df0', '#22e3ff', '#ffe14d'][Math.floor(G.t * 10) % 3]; ctx.fill(); ctx.stroke(); txt(ctx, 'GIF', 0, 0.6, 6.4, OL); }
    else if (p.kind === 'note') { ctx.translate(0, Math.sin(G.t * 16 + p.sx) * 3); const col = p.sx % 2 > 1 ? '#22e3ff' : '#ff8fd0'; ctx.beginPath(); ctx.ellipse(-1.5, 3, 3.4, 2.5, -0.4, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill(); ctx.stroke(); ctx.fillStyle = OL; ctx.fillRect(1.2, -7, 1.6, 10); ctx.beginPath(); ctx.moveTo(2.8, -7); ctx.quadraticCurveTo(7, -5, 5.6, -1); ctx.lineWidth = 1.8; ctx.stroke(); }
    else { ctx.lineJoin = 'round'; ctx.font = '10px ' + FONT_D; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 3; ctx.strokeText('</>', 0, 0); ctx.fillStyle = '#7be04a'; ctx.fillText('</>', 0, 0); }
    ctx.restore(); return;
  }
  if (p.kind === 'arrow') {
    ctx.save(); ctx.translate(X, Y); ctx.rotate(ang); ctx.lineCap = 'round';
    ctx.strokeStyle = OL; ctx.lineWidth = 3.2; ctx.beginPath(); ctx.moveTo(-11, 0); ctx.lineTo(4, 0); ctx.stroke();
    ctx.strokeStyle = '#fde68a'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-11, 0); ctx.lineTo(4, 0); ctx.stroke();
    ctx.fillStyle = '#f472b6'; ctx.beginPath(); ctx.moveTo(-11, 0); ctx.lineTo(-14, -3); ctx.lineTo(-14, 3); ctx.closePath(); ctx.fill();
    ctx.translate(6.5, 0); ctx.rotate(-Math.PI / 2); ctx.beginPath(); heartPath(ctx, 0, 0, 3); ctx.fillStyle = '#ff3d7a'; ctx.fill(); ctx.lineWidth = 1.2; ctx.stroke();
    ctx.restore(); return;
  }
  if (p.kind === 'wave') {
    const a = Math.atan2(p.ty - p.sy, p.tx - p.sx);
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) { ctx.globalAlpha = 0.9 - i * 0.25; ctx.strokeStyle = OL; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(X - Math.cos(a) * i * 6, Y - Math.sin(a) * i * 6, 7 - i, a - 0.9, a + 0.9); ctx.stroke(); ctx.strokeStyle = '#e6dcff'; ctx.lineWidth = 2.2; ctx.stroke(); }
    ctx.globalAlpha = 1; return;
  }
  // rayos rectos: [color, largo, grosor]
  const B = { laser: ['#33e0ff', 20, 7], eyelaser: ['#ff3348', 20, 7], neon: ['#ff3df0', 20, 7], bolt: ['#ffd23f', 18, 8], bullet: ['#ffd23f', 10, 5], snipe: ['#ff3df0', 40, 6], payray: ['#ffcb3d', 20, 7], rgb: [['#ff3df0', '#22e3ff', '#7be04a', '#ffe14d'][Math.floor(G.t * 12) % 4], 20, 7] }[p.kind] || ['#ff3348', 20, 7];
  const dx = p.tx - p.sx, dy = (p.ty - p.z) - (p.sy - p.sz), d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
  ctx.lineCap = 'round'; ctx.strokeStyle = B[0]; ctx.globalAlpha = 0.45; ctx.lineWidth = B[2];
  ctx.beginPath(); ctx.moveTo(X - ux * B[1], Y - uy * B[1]); ctx.lineTo(X, Y); ctx.stroke();
  ctx.globalAlpha = 1; ctx.lineWidth = B[2] * 0.37; ctx.strokeStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(X - ux * B[1] * 0.8, Y - uy * B[1] * 0.8); ctx.lineTo(X, Y); ctx.stroke();
  if (p.kind === 'bolt') { ctx.strokeStyle = '#ffe14d'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(X, Y); for (let i = 1; i < 4; i++) ctx.lineTo(X - ux * i * 6 + rand(-3, 3), Y - uy * i * 6 + rand(-3, 3)); ctx.stroke(); }
}
