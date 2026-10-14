// Fans of Rumble · Habilidades locas: su dibujo en la batalla (la lógica está en 06h-habilidades-locas.js). Solo lee el estado: no cambia la partida.
// locasSuelo() y locasAire() las llama render() (07a-escena.js) junto a los hechizos; locaPose() y locaEncima() las llama drawUnit() (07b-unidades.js).
'use strict';
// las caritas de los que se quedan mirando el baile (dibujadas, para que salgan aunque el móvil no tenga emojis): risa, ojos de corazón, estrellas y alucinado
function locaCarita(x, y, n) {
  shape(ctx, el(x, y, 8, 8), '#ffd23f', 1.8);
  if (n === 0) { for (const s of [-1, 1]) line(ctx, [x + s * 4.5, y - 1.5, x + s * 2.5, y - 3.5, x + s * 0.8, y - 1.5], OL, 1.3); shape(ctx, c => { c.arc(x, y + 1.5, 4, 0, Math.PI); c.closePath(); }, '#e63946', 1.2); }
  else if (n === 1) { for (const s of [-1, 1]) shape(ctx, c => heartPath(c, x + s * 3.2, y - 1.5, 1.7), '#ff3d6e', 0); line(ctx, [x - 3, y + 3.5, x, y + 5, x + 3, y + 3.5], OL, 1.3); }
  else if (n === 2) { for (const s of [-1, 1]) shape(ctx, c => starPath(c, x + s * 3.3, y - 1.5, 2.6, 1.1), '#fff6ea', 0.8); shape(ctx, el(x, y + 3.6, 2.6, 1.6), OL, 0); }
  else { for (const s of [-1, 1]) shape(ctx, el(x + s * 3.2, y - 2, 1.9, 2.4), '#fff6ea', 1); shape(ctx, el(x, y + 3.5, 2, 2.6), OL, 0); }
}
function locaRotulo(s, x, y, size, col) {   // texto con borde, traducido
  ctx.font = `${size}px ${FONT_D}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  s = tr(s); ctx.lineWidth = Math.max(2.5, size / 3.5); ctx.strokeStyle = OL; ctx.strokeText(s, x, y); ctx.fillStyle = col; ctx.fillText(s, x, y);
}
// cómo se mueve el cuerpo: transparente (Clipping), parpadeo (Lag), baile (emotes) y el estirón al transformarse (Modo Súper)
function locaPose(u) {
  const P = { a: 1, ang: 0, sx: 1, sy: 1, z: 0 };
  if (u.clipT > 0) P.a = 0.5 + Math.sin(G.t * 30 + u.id) * 0.1;
  if (u.lagFx > 0) P.a *= Math.random() < 0.5 ? 0.3 : 1;
  if (u.bailaT > 0) { const k = G.t * 16; let c = Math.cos(k); if (Math.abs(c) < 0.15) c = c < 0 ? -0.15 : 0.15; P.sx = c; P.z = Math.abs(Math.sin(k)) * 6; }
  if (u.superT > 0) { const k = Math.min(1, (G.t - (u.superIni || 0)) / 0.35), pop = k < 1 ? 1 + Math.sin(k * Math.PI) * 0.28 : 1 + Math.sin(G.t * 10) * 0.03; P.sx *= pop; P.sy *= pop; }
  return P;
}
// encima del cuerpo: pelo de punta y chispas (Modo Súper), contorno dorado (Modo Dios), cuadrícula verde (Clipping), monedas (Pay to Win)
function locaEncima(u, x, yb, T, ms) {
  const top = T.top * ms, r = Math.max(u.r, 10);
  if (u.superT > 0) {
    ctx.save(); ctx.translate(x, yb - top + 4); ctx.beginPath();
    const n = 7; for (let i = 0; i <= n; i++) { const a = Math.PI + (i / n) * Math.PI, rr2 = i % 2 ? 9 : 20 + Math.sin(G.t * 12 + i) * 2; ctx.lineTo(Math.cos(a) * r * 0.9 * (i % 2 ? 0.8 : 1), Math.sin(a) * rr2); }
    ctx.closePath(); ctx.fillStyle = '#ffe14d'; ctx.globalAlpha = 0.95; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = OL; ctx.stroke(); ctx.restore();
    for (let i = 0; i < 3; i++) { ctx.globalAlpha = Math.random(); ctx.fillStyle = Math.random() < 0.5 ? '#fff6a8' : '#ffcb3d'; ctx.beginPath(); ctx.arc(x + (Math.random() - 0.5) * r * 2.6, yb - Math.random() * top * 1.2, 1.2 + Math.random() * 1.6, 0, Math.PI * 2); ctx.fill(); }
    ctx.globalAlpha = 1;
  }
  if (u.godT > 0) {
    ctx.save(); ctx.globalAlpha = 0.55 + Math.sin(G.t * 12) * 0.25; ctx.strokeStyle = '#ffe14d'; ctx.lineWidth = 2.5; ctx.shadowColor = '#ffcb3d'; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.ellipse(x, yb - top * 0.48, r * 1.35, top * 0.62, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    if (Math.floor(G.t * 4) % 2 === 0) locaRotulo('GOD MODE', x, yb - top - 14, 9, '#ffe14d');
  }
  if (u.clipT > 0) {
    ctx.save(); ctx.beginPath(); ctx.rect(x - r * 1.4, yb - top - 4, r * 2.8, top + 6); ctx.clip(); ctx.strokeStyle = 'rgba(123,224,74,.75)'; ctx.lineWidth = 1;
    const off = (G.t * 18) % 6; for (let gx = -r * 1.4 - 6 + off; gx < r * 1.4; gx += 6) { ctx.beginPath(); ctx.moveTo(x + gx, yb - top - 4); ctx.lineTo(x + gx, yb + 2); ctx.stroke(); }
    for (let gy = -top - 4 + off; gy < 2; gy += 6) { ctx.beginPath(); ctx.moveTo(x - r * 1.4, yb + gy); ctx.lineTo(x + r * 1.4, yb + gy); ctx.stroke(); }
    ctx.restore();
  }
  if (u.p2wFx > 0) { ctx.globalAlpha = Math.min(1, u.p2wFx * 3); locaRotulo('$$$', x + 10, yb - top - 6 - (0.35 - u.p2wFx) * 40, 11, '#ffcb3d'); ctx.globalAlpha = 1; }
}
function locasSuelo() {
  if (!LOCAS) return;
  for (const q of LOCAS.cupulas) {   // Bullet Time: una cúpula azulada que se desvanece
    const a = q.t < 0.2 ? q.t / 0.2 : Math.max(0, 1 - Math.max(0, q.t - q.dur) / 0.4), k = Math.min(1, q.t / 0.2);
    ctx.save(); ctx.globalAlpha = 0.9 * a; ctx.fillStyle = 'rgba(120,190,255,.16)'; ctx.strokeStyle = 'rgba(160,215,255,.9)'; ctx.lineWidth = 2; ctx.setLineDash([6, 5]); ctx.lineDashOffset = -G.t * 20;
    ctx.beginPath(); ctx.ellipse(q.x, q.y, q.r * k, q.r * 0.55 * k, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.setLineDash([]);
    for (let i = 0; i < 10; i++) { const an = i * 0.63 + G.t * 0.4, rr2 = (q.r * 0.3 + ((G.t * 30 + i * 17) % (q.r * 0.6))) * k; ctx.beginPath(); ctx.moveTo(q.x + Math.cos(an) * rr2, q.y + Math.sin(an) * rr2 * 0.55); ctx.lineTo(q.x + Math.cos(an) * (rr2 + 10), q.y + Math.sin(an) * (rr2 + 10) * 0.55); ctx.strokeStyle = 'rgba(200,230,255,.7)'; ctx.lineWidth = 1.5; ctx.stroke(); }
    ctx.restore();
  }
  for (const m of LOCAS.manos) {   // la sombra de la mano del CEO crece antes del golpe
    const k = Math.min(1, m.t / 0.75), a = m.t < 1.05 ? 0.15 + 0.4 * k : Math.max(0, 0.55 - (m.t - 1.05) * 1.2);
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#140a1e'; ctx.beginPath(); ctx.ellipse(m.x, m.y, 20 + 46 * k, 8 + 18 * k, 0, 0, Math.PI * 2); ctx.fill();
    if (m.t < 0.75) { ctx.globalAlpha = 0.5 + Math.sin(G.t * 20) * 0.3; ctx.strokeStyle = '#ff4b5c'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(m.x, m.y, 66, 26, 0, 0, Math.PI * 2); ctx.stroke(); }
    ctx.restore();
  }
  for (const u of units) {
    if (!u.alive || !u.loca) continue;
    if (u.superT > 0) { const p = 0.5 + Math.sin(G.t * 9 + u.id) * 0.2, g = ctx.createRadialGradient(u.x, u.y, 2, u.x, u.y, u.r * 2.6); g.addColorStop(0, `rgba(255,225,77,${p})`); g.addColorStop(1, 'rgba(255,225,77,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(u.x, u.y, u.r * 2.6, u.r * 1.2, 0, 0, Math.PI * 2); ctx.fill(); }
    if (u.godT > 0) { ctx.save(); ctx.globalAlpha = 0.4; ctx.fillStyle = '#ffe14d'; ctx.beginPath(); ctx.ellipse(u.x, u.y, u.r * 1.8, u.r * 0.7, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
  }
  for (const c of LOCAS.cajas) if (!c.cogida) { ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = '#140a1e'; ctx.beginPath(); ctx.ellipse(c.x, c.y, 11, 4.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
}
function locaMano(x, y) {   // la mano del CEO, con su manga de traje y su gemelo dorado (y = la palma toca el suelo)
  shape(ctx, rr(x - 22, y - 150, 44, 104, 6), '#2b2d42', 3); shape(ctx, rr(x - 28, y - 56, 56, 15, 5), '#fff6ea', 3); dot(ctx, x + 14, y - 49, 3.4, '#ffcb3d');
  shape(ctx, el(x, y - 26, 30, 22), '#f2c79a', 3);
  for (let i = 0; i < 4; i++) shape(ctx, rr(x - 27 + i * 14, y - 18, 12, 22, 6), '#f2c79a', 2.6);
  shape(ctx, el(x - 32, y - 32, 9, 13), '#f2c79a', 2.6);
}
function locasAire() {
  if (!LOCAS) return;
  for (const m of LOCAS.manos) {
    let off = null;
    if (m.t >= 0.45 && m.t < 0.75) off = 340 * (1 - Math.pow((m.t - 0.45) / 0.3, 2));
    else if (m.t >= 0.75 && m.t < 1.05) off = 0;
    else if (m.t >= 1.05) off = 340 * Math.pow((m.t - 1.05) / 0.45, 2);
    if (off != null) locaMano(m.x, m.y - off);
  }
  for (const b of LOCAS.cuerpos) {   // el ragdoll volando y girando
    const s = SPR[b.type], T = TYPES[b.type]; if (!s) continue;
    const k = Math.min(1, b.t / b.dur), px = b.x0 + (b.x1 - b.x0) * k, py = b.y0 + (b.y1 - b.y0) * k, z = Math.sin(k * Math.PI) * 90, top = T.top * b.ms;
    ctx.save(); ctx.globalAlpha = b.t <= b.dur ? 1 : Math.max(0, 1 - (b.t - b.dur) / 0.45); ctx.translate(px, py - z - top / 2);
    ctx.rotate(k * Math.PI * 3 * (b.face || 1)); const sq = b.t > b.dur ? 1 + Math.min(0.4, (b.t - b.dur) * 2) : 1; ctx.scale((b.face || 1) * b.ms * sq, b.ms / sq);
    ctx.drawImage(s.c, -s.ax, -s.ay + T.top / 2, s.wd, s.ht); ctx.restore();
  }
  for (const c of LOCAS.cajas) {   // la lootbox: cae, bota, brilla; al cogerla se abre con rayos
    const z = c.t < 0.5 ? Math.abs(Math.cos(c.t * 9)) * 40 * (1 - c.t / 0.5) : 0, y = c.y - z;
    if (c.cogida) {
      const k = (c.t - c.tc) / 0.8; ctx.save(); ctx.globalAlpha = 1 - k; ctx.translate(c.x, c.y - 10); ctx.rotate(G.t); ctx.fillStyle = '#ffcb3d';
      for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a - 0.12) * 50 * k + 8, Math.sin(a - 0.12) * 50 * k); ctx.lineTo(Math.cos(a + 0.12) * 50 * k, Math.sin(a + 0.12) * 50 * k + 8); ctx.closePath(); ctx.fill(); }
      ctx.restore(); continue;
    }
    const fade = c.t > c.vida - 1.5 ? (Math.floor(G.t * 8) % 2 ? 0.4 : 1) : 1;
    ctx.save(); ctx.globalAlpha = fade; const g = 0.5 + Math.sin(G.t * 6) * 0.3;
    ctx.shadowColor = '#ffcb3d'; ctx.shadowBlur = 10 * g; shape(ctx, rr(c.x - 10, y - 18, 20, 16, 3), '#a855f7', 2.4); ctx.shadowBlur = 0;
    shape(ctx, rr(c.x - 11.5, y - 22, 23, 6, 2.5), '#7b22ff', 2.2); line(ctx, [c.x, y - 22, c.x, y - 2], '#ffcb3d', 2.2); locaRotulo('?', c.x, y - 9, 10, '#fff6ea'); ctx.restore();
  }
  for (const q of LOCAS.glitches) {   // Wallhack: píxeles verdes donde estaba y donde aparece, y un rastro
    const a = 1 - q.t / 0.7; ctx.save(); ctx.globalAlpha = a;
    ctx.strokeStyle = 'rgba(123,224,74,.7)'; ctx.lineWidth = 2; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(q.x0, q.y0 - 12); ctx.lineTo(q.x1, q.y1 - 12); ctx.stroke(); ctx.setLineDash([]);
    for (const [px, py] of [[q.x0, q.y0], [q.x1, q.y1]]) for (let i = 0; i < 9; i++) { const sx = Math.sin(i * 12.9 + q.x0) * 16, sy = Math.cos(i * 7.3 + q.y1) * 18 - 14 - q.t * 20; ctx.fillStyle = i % 3 ? '#7be04a' : '#d9ffbf'; ctx.fillRect(px + sx, py + sy, 4, 4); }
    ctx.restore();
  }
  for (const f of LOCAS.fantasmas) {   // Lag: el fantasma con interferencias donde estaba
    const s = SPR[f.type]; if (!s) continue; const a = 1 - f.t / 0.6;
    for (const [dx, col] of [[-3, 'rgba(255,75,92,1)'], [3, 'rgba(34,227,255,1)']]) { ctx.save(); ctx.globalAlpha = 0.35 * a; ctx.translate(f.x + dx + (Math.random() - 0.5) * 4, f.y); ctx.scale((f.face || 1) * f.ms, f.ms); ctx.drawImage(s.w || s.c, -s.ax, -s.ay, s.wd, s.ht); ctx.restore(); }
    ctx.save(); ctx.globalAlpha = 0.5 * a; ctx.translate(f.x, f.y); ctx.scale((f.face || 1) * f.ms, f.ms); ctx.drawImage(s.c, -s.ax, -s.ay, s.wd, s.ht); ctx.restore();
  }
  for (const p of LOCAS.pings) {   // Ping 999: una barra de carga encima del que va a recibir el golpe
    const o = p.o; if (!o.alive) continue; const y = o.y - topOf(o) - 16;
    ctx.fillStyle = OL; ctx.fillRect(o.x - 14, y - 3, 28, 6); ctx.fillStyle = '#7df3ff'; ctx.fillRect(o.x - 13, y - 2, 26 * Math.min(1, p.t), 4);
  }
  for (const u of units) {
    if (!u.alive) continue;
    if (u.stunT > 0 && u.stunKind === 'emote') locaCarita(u.x, u.y - topOf(u) - 13 + Math.sin(G.t * 8 + u.id) * 2, u.emoteN || 0);
    if (u.bailaT > 0) for (let i = 0; i < 2; i++) { const a = G.t * 4 + i * Math.PI; locaRotulo(i ? '♫' : '♪', u.x + Math.cos(a) * u.r * 1.8, u.y - topOf(u) * 0.7 + Math.sin(a * 1.3) * 8, 12, i ? '#ff9be6' : '#7df3ff'); }
  }
}
