// Fans of Rumble · Dibujo (4/4): partículas y fantasmas
'use strict';

function drawPart(p) {
  const k = Math.max(0, p.life / p.max);
  switch (p.type) {
    case 'body': {   // v0.9.15: se desploma hacia atrás
      const sp = SPR[p.key]; if (!sp) break; const f = Math.min(1, (1 - k) * 2.4), e = 1 - (1 - f) * (1 - f) * (1 - f);
      ctx.save(); ctx.globalAlpha = Math.min(1, k * 2.4) * 0.92; ctx.translate(p.x - p.face * e * 4, p.y); ctx.rotate(-p.face * e * 1.4); ctx.scale(p.face * p.ms * (1 + 0.06 * e), p.ms * (1 - 0.12 * e));
      ctx.drawImage(p.cor ? corruptOf(p.key) : sp.c, -sp.ax, -sp.ay, sp.wd, sp.ht); ctx.restore(); break;
    }
    case 'dust': ctx.globalAlpha = k * 0.8; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y - p.z, p.size * (1.5 - 0.5 * k), 0, Math.PI * 2); ctx.fill(); break;
    case 'smoke': ctx.globalAlpha = k * 0.4; ctx.fillStyle = '#5f6170'; ctx.beginPath(); ctx.arc(p.x, p.y - p.z, p.size * (1.7 - 0.7 * k), 0, Math.PI * 2); ctx.fill(); break;
    case 'cone': { const r = lerp(p.r1, p.r0, k); ctx.globalAlpha = k; ctx.strokeStyle = p.color; ctx.lineWidth = p.lw * k + 1; ctx.beginPath(); ctx.arc(p.x, p.y, r, p.a - HEAL_CONE / 2, p.a + HEAL_CONE / 2); ctx.stroke(); break; }
    case 'ring': { const r = lerp(p.r1, p.r0, k); ctx.globalAlpha = k; ctx.strokeStyle = p.color; ctx.lineWidth = p.lw * k + 1; ctx.beginPath(); ctx.ellipse(p.x, p.y, r, p.circ ? r : r * 0.42, 0, 0, Math.PI * 2); ctx.stroke(); break; }
    case 'spark': ctx.globalAlpha = k; ctx.strokeStyle = p.color; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(p.x, p.y - p.z); ctx.lineTo(p.x - p.vx * 0.03, p.y - p.z - p.vy * 0.03 + p.vz * 0.03); ctx.stroke(); break;
    case 'chip': ctx.globalAlpha = Math.min(1, k * 2.5); ctx.save(); ctx.translate(p.x, p.y - p.z); ctx.rotate(p.rot); ctx.fillStyle = p.color; ctx.fillRect(-p.size / 2, -p.size * 0.35, p.size, p.size * 0.7); ctx.lineWidth = 1; ctx.strokeStyle = OL; ctx.strokeRect(-p.size / 2, -p.size * 0.35, p.size, p.size * 0.7); ctx.restore(); break;
    case 'gear': ctx.globalAlpha = Math.min(1, k * 2.5); ctx.save(); ctx.translate(p.x, p.y - p.z); ctx.rotate(p.rot);
      ctx.setLineDash([2, 2]); ctx.lineWidth = 3; ctx.strokeStyle = '#6e7890'; ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#b8c1d3'; ctx.beginPath(); ctx.arc(0, 0, p.size * 0.75, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = OL; ctx.beginPath(); ctx.arc(0, 0, p.size * 0.25, 0, Math.PI * 2); ctx.fill(); ctx.restore(); break;
    case 'ghost': { ctx.globalAlpha = k * 0.85; const gx = p.x + Math.sin(p.life * 6) * 3, gy = p.y - p.z;
      ctx.beginPath(); ctx.ellipse(gx, gy - 14, 6, 2, 0, 0, Math.PI * 2); ctx.strokeStyle = '#ffcb3d'; ctx.lineWidth = 1.8; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(gx - 6, gy + 6); ctx.lineTo(gx - 6, gy - 3); ctx.arc(gx, gy - 3, 6, Math.PI, 0); ctx.lineTo(gx + 6, gy + 6); ctx.lineTo(gx + 3, gy + 3.5); ctx.lineTo(gx, gy + 6); ctx.lineTo(gx - 3, gy + 3.5); ctx.closePath();
      ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.lineWidth = 1.4; ctx.strokeStyle = OL; ctx.stroke();
      ctx.fillStyle = OL; ctx.beginPath(); ctx.arc(gx - 2.2, gy - 3, 1, 0, Math.PI * 2); ctx.arc(gx + 2.2, gy - 3, 1, 0, Math.PI * 2); ctx.fill(); break; }
    case 'quip': {   // bocadillo con la frase de despedida
      const a = Math.min(1, (1 - k) * 10, k * 4); ctx.globalAlpha = a;
      ctx.font = `800 12.5px "Baloo 2", "Trebuchet MS", system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const tw = ctx.measureText(p.txt).width + 16, bx = clamp(p.x, tw / 2 + 4, W - tw / 2 - 4), by = p.y - p.z;
      ctx.fillStyle = '#ffffff'; ctx.strokeStyle = OL; ctx.lineWidth = 2;
      ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(bx - tw / 2, by - 11, tw, 22, 9); else ctx.rect(bx - tw / 2, by - 11, tw, 22);
      ctx.moveTo(p.x - 4, by + 11); ctx.lineTo(p.x, by + 18); ctx.lineTo(p.x + 4, by + 11);
      ctx.fill(); ctx.stroke(); ctx.fillStyle = '#ffffff'; ctx.fillRect(p.x - 3, by + 9, 6, 3);
      ctx.fillStyle = OL; ctx.fillText(tr(p.txt), bx, by + 1); ctx.globalAlpha = 1; break;
    }
    case 'stamp': { const age = 1 - k; const sc = age < 0.15 ? lerp(2.2, 1, age / 0.15) : 1; ctx.globalAlpha = Math.min(1, k * 2.5); ctx.save(); ctx.translate(p.x, p.y - p.z); ctx.rotate(-0.15); ctx.scale(sc, sc);
      ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillRect(-36, -9, 72, 18); ctx.strokeStyle = p.color; ctx.lineWidth = 2.2; ctx.strokeRect(-36, -9, 72, 18);
      ctx.fillStyle = p.color; ctx.font = '13px ' + FONT_D; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(tr(p.txt), 0, 1.5); ctx.restore(); break; }
    case 'grave': {
      const age = p.max - p.life, pop = Math.min(1, age / 0.18), fade = Math.min(1, p.life / 0.3);
      ctx.globalAlpha = fade; ctx.save(); ctx.translate(p.x, p.y); ctx.scale(pop, pop);
      const g = ctx.createRadialGradient(0, -8, 0, 0, -8, 18); g.addColorStop(0, 'rgba(94,242,160,.5)'); g.addColorStop(1, 'rgba(94,242,160,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -8, 18, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-7, 0); ctx.lineTo(-7, -10); ctx.arc(0, -10, 7, Math.PI, 0); ctx.lineTo(7, 0); ctx.closePath(); ctx.fillStyle = '#9a99ad'; ctx.fill(); ctx.lineWidth = 1.8; ctx.strokeStyle = OL; ctx.stroke();
      ctx.fillStyle = OL; ctx.fillRect(-0.8, -14, 1.6, 8); ctx.fillRect(-3, -11.5, 6, 1.6);
      ctx.restore(); break; }
    case 'plus': { ctx.globalAlpha = Math.min(1, k * 2); const px = p.x, py = p.y - p.z; ctx.fillStyle = OL; ctx.fillRect(px - 1.9, py - 5.4, 3.8, 10.8); ctx.fillRect(px - 5.4, py - 1.9, 10.8, 3.8); ctx.fillStyle = '#8cf05a'; ctx.fillRect(px - 0.9, py - 4.4, 1.8, 8.8); ctx.fillRect(px - 4.4, py - 0.9, 8.8, 1.8); break; }
    case 'zap': {   // rayo en cadena de ThunderGod
      ctx.globalAlpha = Math.min(1, k * 1.6); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const R = mulberry32((p.seed + Math.floor(G.t * 30)) | 0); const pts = [];
      for (let i = 0; i < p.pts.length - 1; i++) { const [ax, ay, az] = p.pts[i], [bx, by, bz] = p.pts[i + 1]; for (let j = 0; j < 6; j++) { const t = j / 6, jx = j ? (R() - 0.5) * 12 : 0, jy = j ? (R() - 0.5) * 12 : 0; pts.push([lerp(ax, bx, t) + jx, lerp(ay - az, by - bz, t) + jy]); } }
      const last = p.pts[p.pts.length - 1]; pts.push([last[0], last[1] - last[2]]);
      for (const [w, c] of [[7, 'rgba(255,225,77,.45)'], [3.2, '#ffe14d'], [1.4, '#ffffff']]) { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); pts.forEach(([a, b], i) => (i ? ctx.lineTo(a, b) : ctx.moveTo(a, b))); ctx.stroke(); }
      break; }
    case 'beam': { ctx.globalAlpha = k; ctx.lineCap = 'round'; ctx.setLineDash([5, 4]); ctx.lineDashOffset = -G.t * 60; ctx.strokeStyle = p.color; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(p.x0, p.y0 - p.z0); ctx.lineTo(p.x1, p.y1 - p.z1); ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0; break; }
    case 'note': { ctx.globalAlpha = Math.min(1, k * 2); const px = p.x, py = p.y - p.z; ctx.beginPath(); ctx.ellipse(px - 1.5, py + 3, 3, 2.2, -0.4, 0, Math.PI * 2); ctx.fillStyle = p.col; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = OL; ctx.stroke(); ctx.fillStyle = OL; ctx.fillRect(px + 1, py - 6, 1.4, 9); break; }
    case 'card': {   // carta viral de MemeLord
      const age = p.max - p.life, sc = Math.min(1, age / 0.15) * 1.1, flip = Math.cos(Math.min(1, age / 0.35) * Math.PI);
      ctx.globalAlpha = Math.min(1, k * 3); ctx.save(); ctx.translate(p.x, p.y - p.z - age * 14); ctx.scale(sc * Math.abs(flip), sc);
      ctx.beginPath(); rrPath(ctx, -10, -13, 20, 26, 3); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = OL; ctx.stroke();
      if (flip > 0) { ctx.fillStyle = '#22c55e'; ctx.fillRect(-7, -10, 14, 20); txt(ctx, '?', 0, 1, 12, '#fff'); }
      else {
        const col = { heal: '#bbf7d0', stun: '#fef08a', fire: '#fed7aa', dogs: '#fde7c0' }[p.k]; ctx.fillStyle = col; ctx.fillRect(-7, -10, 14, 20);
        if (p.k === 'heal') { ctx.fillStyle = '#16a34a'; ctx.fillRect(-1.6, -6, 3.2, 12); ctx.fillRect(-6, -1.6, 12, 3.2); }
        else if (p.k === 'stun') { ctx.beginPath(); starPath(ctx, 0, 0, 7, 3); ctx.fillStyle = '#facc15'; ctx.fill(); ctx.lineWidth = 1.2; ctx.stroke(); }
        else if (p.k === 'fire') { ctx.scale(1.3, 1.3); ctx.beginPath(); ctx.moveTo(0, -6); ctx.bezierCurveTo(2, -3, 5, -1, 5, 2); ctx.arc(0, 2, 5, 0, Math.PI); ctx.bezierCurveTo(-5, -1, -2, -2, 0, -6); ctx.fillStyle = '#ff7a1a'; ctx.fill(); ctx.lineWidth = 1; ctx.stroke(); }
        else { const sp = SPR.suchdog; ctx.drawImage(sp.c, -sp.ax * 0.42, -sp.ay * 0.42 + 9, sp.wd * 0.42, sp.ht * 0.42); }
      }
      ctx.restore(); break; }
    case 'impact': { const a = 1 - k, r = p.size * (0.45 + a * 0.85); ctx.globalAlpha = Math.min(1, k * 1.6); ctx.save(); ctx.translate(p.x, p.y - p.z); ctx.rotate(p.rot);
      ctx.beginPath(); starPath(ctx, 0, 0, r, r * 0.34, 4); ctx.fillStyle = p.color; ctx.fill();
      ctx.beginPath(); ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.restore(); break; }
    case 'flash': { const r = p.size * (0.55 + (1 - k) * 0.6), fy = p.y - p.z, g = ctx.createRadialGradient(p.x, fy, 0, p.x, fy, r);
      g.addColorStop(0, `rgba(255,255,245,${0.8 * k})`); g.addColorStop(0.35, `rgba(${p.rgb},${0.5 * k})`); g.addColorStop(1, `rgba(${p.rgb},0)`);
      ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, fy, r, 0, Math.PI * 2); ctx.fill(); break; }
    case 'slash': { const a = 1 - k, a0 = p.ang - 0.95, a1 = a0 + 1.9 * Math.min(1, a * 2.2); ctx.save(); ctx.translate(p.x, p.y - p.z); ctx.scale(1, 0.62); ctx.lineCap = 'round'; ctx.globalAlpha = Math.min(1, k * 2);
      ctx.beginPath(); ctx.arc(0, 0, p.size, Math.max(a0, a1 - 1.3), a1);
      const W2 = p.w || 1; ctx.strokeStyle = 'rgba(32,16,44,.55)'; ctx.lineWidth = (8 * k + 2) * W2; ctx.stroke(); ctx.strokeStyle = p.color; ctx.lineWidth = (5.5 * k + 1) * W2; ctx.stroke(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = (2.2 * k + 0.5) * W2; ctx.stroke();
      ctx.globalAlpha = Math.min(1, k * 2) * 0.35; ctx.beginPath(); ctx.arc(0, 0, p.size * 0.78, Math.max(a0, a1 - 1.1), a1); ctx.strokeStyle = p.color; ctx.lineWidth = (3 * k + 1) * W2; ctx.stroke(); ctx.restore(); break; }
    case 'hitline': { const a = 1 - k, r1 = p.r0 + p.len * (0.35 + a * 0.9), r0 = p.r0 + p.len * a * 0.85; ctx.globalAlpha = Math.min(1, k * 2); ctx.strokeStyle = p.color; ctx.lineCap = 'round'; ctx.lineWidth = 2.6 * k + 0.6;   // v0.9.24
      ctx.beginPath(); ctx.moveTo(p.x + Math.cos(p.a) * r0, p.y - p.z + Math.sin(p.a) * r0 * 0.75); ctx.lineTo(p.x + Math.cos(p.a) * r1, p.y - p.z + Math.sin(p.a) * r1 * 0.75); ctx.stroke(); break; }
    case 'clapper': {   // v0.9.13: claqueta de cine
      const age = p.max - p.life, pop = Math.min(1, age / 0.15), shut = Math.min(1, age / 0.35), a = -0.55 * (1 - shut);
      ctx.globalAlpha = Math.min(1, k * 3); ctx.save(); ctx.translate(p.x, p.y - p.z - age * 8); ctx.scale(pop, pop); ctx.lineWidth = 1.6; ctx.strokeStyle = OL;
      ctx.beginPath(); rrPath(ctx, -9, -2, 18, 12, 1.4); ctx.fillStyle = '#2b2d3a'; ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.fillRect(-7, 2, 14, 1.4); ctx.fillRect(-7, 5.4, 10, 1.4);
      ctx.save(); ctx.translate(-9, -2); ctx.rotate(a); ctx.beginPath(); ctx.rect(0, -4.4, 18, 4.4); ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke();
      ctx.fillStyle = OL; for (const sx of [2, 7, 12]) { ctx.beginPath(); ctx.moveTo(sx, -4.4); ctx.lineTo(sx + 2.6, -4.4); ctx.lineTo(sx + 1, 0); ctx.lineTo(sx - 1.6, 0); ctx.closePath(); ctx.fill(); }
      ctx.restore(); ctx.restore(); break; }
    case 'conf': ctx.globalAlpha = 1; ctx.save(); ctx.translate(p.x, p.y - p.z); ctx.rotate(p.rot); ctx.fillStyle = p.color; ctx.fillRect(-3.5, -2, 7, 4); ctx.restore(); break;
    case 'env': { if (p.t < 0) break; ctx.globalAlpha = 1; ctx.save(); ctx.translate(p.x, p.y - p.z); ctx.rotate(p.rot + Math.sin(G.t * 10) * 0.15);
      if (p.k === 'lic') {   // v0.9.13: licencia revocada (Phony)
        ctx.fillStyle = '#ffffff'; ctx.strokeStyle = OL; ctx.lineWidth = 1.5; ctx.beginPath(); rrPath(ctx, -8, -5.5, 16, 11, 1.6); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ffcb3d'; ctx.fillRect(-6, -3.6, 4, 3); ctx.fillStyle = '#9ca3af'; ctx.fillRect(-1, -3.4, 6, 1); ctx.fillRect(-1, -1.4, 6, 1);
        ctx.beginPath(); ctx.moveTo(-6, 1); ctx.lineTo(6, 4.6); ctx.moveTo(6, 1); ctx.lineTo(-6, 4.6); ctx.lineWidth = 1.8; ctx.strokeStyle = '#ff3348'; ctx.stroke(); ctx.restore(); break;
      }
      ctx.fillStyle = '#ffffff'; ctx.strokeStyle = OL; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.rect(-8, -5.5, 16, 11); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-8, -5.5); ctx.lineTo(0, 1); ctx.lineTo(8, -5.5); ctx.stroke(); ctx.fillStyle = '#ff3348'; ctx.beginPath(); ctx.arc(0, 1.5, 2, 0, Math.PI * 2); ctx.fill(); ctx.restore(); break; }
  }
  ctx.globalAlpha = 1;
}
function drawNum(n) {
  const k = n.life / n.max; const age = n.max - n.life; const sc = age < 0.1 ? lerp(n.tx ? 1.3 : 1.6, 1, age / 0.1) : 1;
  let x = n.x, tw = 0;
  if (n.tx) { ctx.font = `${n.size}px ${FONT_D}`; tw = ctx.measureText(n.txt).width + 16; x = clamp(x, tw / 2 + 4, W - tw / 2 - 4); }
  ctx.globalAlpha = Math.min(1, k * (n.tx ? 5 : 3.5)); ctx.save(); ctx.translate(x, n.y - n.z); ctx.scale(sc, sc);
  if (n.tx) { const th = n.size + 9; ctx.fillStyle = 'rgba(20,10,32,.74)'; ctx.beginPath(); rrPath(ctx, -tw / 2, -th / 2 - 1, tw, th, th / 2); ctx.fill(); }
  text(n.txt, 0, 0, n.size, n.color); ctx.restore(); ctx.globalAlpha = 1;
}
function drawGhost() {
  const key = (input.dragging && input.card) || input.selected; const g = input.ghost; if (!key || !g) return;
  if ((g.fy == null ? g.y : g.fy) >= TRAY_Y - 4) return;   // con el dedo sobre las cartas se cancela
  if (isSpell(key)) {   // v0.9.15: el hechizo cae en el sitio exacto, en cualquier parte del campo
    const C = CFG.cards[key], D = C.spell, x = clamp(g.x, BOUNDS.x0, BOUNDS.x1), y = clamp(g.y, BOUNDS.y0, BOUNDS.y1), rich = S.p.chaos >= C.cost;
    ctx.save(); glowArea(ctx, x, y, D.r, rich ? D.col || '#ffffff' : '#ff4b5c', 1.1 + 0.15 * Math.sin(G.t * 6), 1);   // v0.9.72: brillo, sin rayas
    ctx.globalAlpha = rich ? 0.95 : 0.45; drawSpellBit(ctx, D.fx, x, y - 22 + Math.sin(G.t * 4) * 3, 0, D.col, 2.6);
    ctx.globalAlpha = 1; if (!rich) text(`Faltan ${Math.ceil(C.cost - S.p.chaos)} de CAOS`, clamp(x, 90, W - 90), y - D.r - 14, 13, '#ff8a96');
    ctx.restore(); return;
  }
  const sp = snapSpot('p', g.x, g.y), x = sp.x, y = sp.y;
  const card = CFG.cards[key]; const ok = true, rich = S.p.chaos >= card.cost, can = canDeploy('p', key); const good = rich && can;
  ctx.save();
  if (Math.hypot(g.x - x, g.y - y) > 8) { ctx.globalAlpha = 0.45; ctx.lineCap = 'round'; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(g.x, g.y); ctx.lineTo(x, y); ctx.stroke(); ctx.globalAlpha = 1; }
  glowArea(ctx, x, y + 1, 40, good ? '#ffffff' : '#ff4b5c', 1.6, 0.4);   // v0.9.72: brillo en el suelo, sin rayas
  ctx.globalAlpha = good ? 0.82 : 0.42;
  for (let i = 0; i < card.count; i++) { const ox = card.count > 1 ? (i - (card.count - 1) / 2) * 22 : 0, oy = card.count > 1 ? (i % 2) * 6 : 0; const s = SPR[key]; ctx.drawImage(s.c, x + ox - s.ax, y + oy - s.ay, s.wd, s.ht); }
  ctx.globalAlpha = 1;
  if (good) { const bx = laneBridge(x < W / 2 ? 0 : 1); const b = (G.t * 1.8) % 1; for (let i = 0; i < 3; i++) { const yy = RIVER.bottom + 10 - i * 15 - b * 15; ctx.globalAlpha = Math.max(0, 0.95 - i * 0.28); ctx.beginPath(); ctx.moveTo(bx - 12, yy + 6); ctx.lineTo(bx, yy - 4); ctx.lineTo(bx + 12, yy + 6); ctx.lineWidth = 6; ctx.strokeStyle = OL; ctx.stroke(); ctx.lineWidth = 3.4; ctx.strokeStyle = '#fff'; ctx.stroke(); } ctx.globalAlpha = 1; }
  else { const msg = !can ? (S.p.leaderCd > 0 ? `Vuelve en ${Math.ceil(S.p.leaderCd)} s` : 'Ya está en el campo') : !ok ? 'Aquí no: solo tu lado' : `Faltan ${Math.ceil(card.cost - S.p.chaos)} de CAOS`; text(msg, clamp(x, 90, W - 90), y - TYPES[key].top - 20, 17, '#ffb3bc'); }
  ctx.restore();
}

