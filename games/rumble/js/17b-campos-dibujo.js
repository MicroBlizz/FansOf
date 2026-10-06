// Fans of Rumble · Campos (2/2): el dibujo del río y de las zonas del suelo
'use strict';

/* ---------- dibujo ---------- */
// el río (sustituye al agua) y las zonas del suelo; va debajo de las unidades. Devuelve true si el campo es especial.
function terrainGround() {
  const T = TR.on && G.state !== 'title' ? TR.on : null; if (!T) return false;
  const c = ctx, t = G.t, top = RIVER.top, bot = RIVER.bottom;
  if (T.ground) { c.save(); c.globalAlpha = T.ground[1]; c.fillStyle = T.ground[0]; c.fillRect(0, 0, W, H); c.restore(); }   // el suelo cambia de color
  if (T.tint) { c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = T.tint[0]; c.fillRect(0, 0, W, H); c.globalCompositeOperation = 'source-over'; if (T.tint[1]) { c.globalAlpha = T.tint[1]; c.fillStyle = '#000'; c.fillRect(0, 0, W, H); } c.restore(); }
  c.save();
  if (T.river.rainbow) {   // río arcoíris
    const cols = ['#ff5f6d', '#ffb04f', '#ffe06a', '#7be04a', '#3fd0e8', '#8b5cf6'], hh = (bot - top) / cols.length;
    cols.forEach((col, i) => { c.fillStyle = col; c.fillRect(0, top + i * hh, W, hh + 0.5); });
  } else {
    const [e, m, ctr] = T.river.c, g = c.createLinearGradient(0, top, 0, bot);
    g.addColorStop(0, e); g.addColorStop(0.3, m); g.addColorStop(0.5, ctr); g.addColorStop(0.7, m); g.addColorStop(1, e);
    c.fillStyle = g; c.fillRect(0, top, W, bot - top);
  }
  if (T.glow) for (const [y0, dir] of [[top - 16, 1], [bot, -1]]) { const gg = c.createLinearGradient(0, y0, 0, y0 + 16); gg.addColorStop(dir > 0 ? 0 : 1, 'rgba(255,110,20,0)'); gg.addColorStop(dir > 0 ? 1 : 0, 'rgba(255,110,20,.45)'); c.fillStyle = gg; c.fillRect(0, y0, W, 16); }
  c.beginPath(); c.rect(0, top, W, bot - top); c.clip();
  riverFloats(T.river.float, top, bot, t);
  c.restore();
  // túnel: la boca a cada lado del río (el techo se dibuja encima de las unidades)
  for (const z of TR.zones) drawZone(z, t);
  for (const f of TR.falls) if (!f.done) {   // sombra que avisa de lo que va a caer
    const k = 1 - f.t / f.max, F = T.fall, r = F.r * (0.4 + 0.6 * k);
    c.save(); c.globalAlpha = 0.25 + 0.35 * k; c.fillStyle = '#140a1e'; c.beginPath(); c.ellipse(f.x, f.y, r, r * 0.55, 0, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 0.6 + 0.4 * Math.sin(t * 20); c.strokeStyle = '#ffe06a'; c.lineWidth = 2.5; c.setLineDash([6, 5]); c.beginPath(); c.ellipse(f.x, f.y, F.r, F.r * 0.55, 0, 0, Math.PI * 2); c.stroke(); c.restore();
  }
  return true;
}
function riverFloats(kind, top, bot, t) {
  const c = ctx, mid = (top + bot) / 2;
  const lane = (i, sp) => ((i * 83 + t * sp) % (W + 120)) - 60;
  switch (kind) {
    case 'crust': c.fillStyle = 'rgba(70,14,4,.55)'; for (let i = 0; i < 9; i++) { c.beginPath(); c.ellipse(lane(i, 7 + (i % 3) * 3), top + 8 + (i % 3) * 11, 16 + (i % 4) * 6, 4 + (i % 2) * 2, 0, 0, Math.PI * 2); c.fill(); }
      c.fillStyle = '#fff3b0'; for (let i = 0; i < 10; i++) { const k = (t * 0.7 + i * 0.37) % 1, x = (i * 61 + Math.floor(t * 0.7 + i * 0.37) * 97) % W; c.globalAlpha = Math.sin(k * Math.PI) * 0.9; c.beginPath(); c.arc(x, top + 7 + ((i * 13) % 24), 1.5 + k * 3.5, 0, Math.PI * 2); c.fill(); } break;
    case 'foam': c.fillStyle = 'rgba(255,240,215,.75)'; for (let i = 0; i < 12; i++) { const x = lane(i, 12 + (i % 3) * 4), y = top + 6 + (i % 4) * 8; c.beginPath(); c.ellipse(x, y, 10 + (i % 3) * 4, 3, 0, 0, Math.PI * 2); c.fill(); } break;
    case 'slime': for (let i = 0; i < 12; i++) { const k = (t * 0.5 + i * 0.29) % 1, x = (i * 71 + Math.floor(t * 0.5 + i * 0.29) * 113) % W; c.globalAlpha = Math.sin(k * Math.PI); c.fillStyle = '#c8ffb0'; c.beginPath(); c.arc(x, top + 6 + (i * 7) % 26, 2 + k * 4, 0, Math.PI * 2); c.fill(); }
      c.globalAlpha = 0.5; c.fillStyle = '#e8fff0'; for (let i = 0; i < 6; i++) { const x = lane(i, 9); c.font = '13px sans-serif'; c.fillText('☠', x, mid + 5); } break;
    case 'emoji': c.font = '15px sans-serif'; c.textAlign = 'center'; for (let i = 0; i < 12; i++) { c.globalAlpha = 0.9; c.fillText(['❤', '😂', '🔥', 'GG', '👍', '💜'][i % 6], lane(i, 22 + (i % 3) * 6), top + 13 + (i % 3) * 10); } break;
    case 'ice': c.strokeStyle = 'rgba(120,170,210,.8)'; c.lineWidth = 1.4; for (let i = 0; i < 14; i++) { const x = (i * 41) % W; c.beginPath(); c.moveTo(x, top + 4); c.lineTo(x + 12, mid); c.lineTo(x + 3, bot - 4); c.moveTo(x + 12, mid); c.lineTo(x + 26, mid - 6); c.stroke(); }
      c.fillStyle = 'rgba(255,255,255,.8)'; for (let i = 0; i < 8; i++) { const k = (t * 0.4 + i * 0.3) % 1; c.globalAlpha = Math.sin(k * Math.PI); c.beginPath(); c.arc((i * 67 + 20) % W, top + 6 + (i * 11) % 26, 2, 0, Math.PI * 2); c.fill(); } break;
    case 'candy': for (let i = 0; i < 12; i++) { const x = lane(i, 10 + (i % 3) * 3), y = top + 8 + (i % 3) * 10; c.save(); c.translate(x, y); c.rotate(t * (i % 2 ? 1 : -1) + i);
      if (i % 3 === 0) { c.fillStyle = '#ff6fb0'; c.beginPath(); c.arc(0, 0, 5, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 1.6; c.beginPath(); c.arc(0, 0, 3, 0, Math.PI); c.stroke(); }
      else if (i % 3 === 1) { c.fillStyle = '#7df3ff'; c.fillRect(-6, -2.5, 12, 5); c.fillStyle = '#fff'; c.fillRect(-2, -2.5, 4, 5); }
      else { c.fillStyle = '#ffe06a'; c.beginPath(); c.moveTo(0, -5); c.lineTo(5, 4); c.lineTo(-5, 4); c.closePath(); c.fill(); }
      c.restore(); } break;
    case 'coin': for (let i = 0; i < 16; i++) { const x = lane(i, 14 + (i % 4) * 3), y = top + 6 + (i % 4) * 8, w = Math.abs(Math.cos(t * 3 + i)) * 5 + 1; c.fillStyle = '#ffe06a'; c.strokeStyle = '#7a5310'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(x, y, w, 5, 0, 0, Math.PI * 2); c.fill(); c.stroke(); } break;
    case 'cart': for (let i = 0; i < 9; i++) { const x = lane(i, 9 + (i % 3) * 3), y = top + 9 + (i % 3) * 10; c.save(); c.translate(x, y); c.rotate(Math.sin(t + i) * 0.3); c.fillStyle = ['#8a8f9a', '#5d6b7a', '#a8703f'][i % 3]; c.fillRect(-8, -5, 16, 10); c.fillStyle = '#ffe06a'; c.fillRect(-5, -3, 10, 4); c.strokeStyle = '#20102c'; c.lineWidth = 1; c.strokeRect(-8, -5, 16, 10); c.restore(); } break;
    case 'cd': for (let i = 0; i < 11; i++) { const x = lane(i, 11 + (i % 3) * 4), y = top + 9 + (i % 3) * 10, s = 0.6 + 0.4 * Math.abs(Math.sin(t * 1.5 + i));
      c.save(); c.translate(x, y); c.scale(1, s * 0.55); const cg = c.createLinearGradient(-8, -8, 8, 8); cg.addColorStop(0, '#e0e7ff'); cg.addColorStop(0.35, '#ff9ef0'); cg.addColorStop(0.6, '#7df3ff'); cg.addColorStop(1, '#ffe06a');
      c.fillStyle = cg; c.beginPath(); c.arc(0, 0, 8, 0, Math.PI * 2); c.fill(); c.fillStyle = '#1d2b5c'; c.beginPath(); c.arc(0, 0, 2, 0, Math.PI * 2); c.fill(); c.restore(); } break;
    case 'drink': for (let i = 0; i < 14; i++) { const k = (t * 0.9 + i * 0.21) % 1, x = (i * 53 + Math.floor(t * 0.9 + i * 0.21) * 89) % W; c.globalAlpha = Math.sin(k * Math.PI); c.fillStyle = '#eaffb0'; c.beginPath(); c.arc(x, bot - 4 - k * (bot - top - 8), 1.6 + k * 1.5, 0, Math.PI * 2); c.fill(); }
      c.globalAlpha = 0.9; for (let i = 0; i < 4; i++) { const x = lane(i * 2, 12); c.fillStyle = '#d43cff'; c.fillRect(x - 4, mid - 7, 8, 14); c.fillStyle = '#b6ff3a'; c.fillRect(x - 4, mid - 2, 8, 4); } break;
    case 'rainbow': c.fillStyle = 'rgba(255,255,255,.85)'; for (let i = 0; i < 10; i++) { const k = (t * 0.6 + i * 0.31) % 1; c.globalAlpha = Math.sin(k * Math.PI); const x = (i * 59 + 13) % W, y = top + 5 + (i * 9) % 28; c.beginPath(); c.moveTo(x, y - 4); c.lineTo(x + 1.5, y - 1.5); c.lineTo(x + 4, y); c.lineTo(x + 1.5, y + 1.5); c.lineTo(x, y + 4); c.lineTo(x - 1.5, y + 1.5); c.lineTo(x - 4, y); c.lineTo(x - 1.5, y - 1.5); c.fill(); } break;
    case 'binary': c.font = '11px monospace'; c.textAlign = 'center'; for (let i = 0; i < 26; i++) { const x = lane(i, 16 + (i % 4) * 5), y = top + 9 + (i % 4) * 8; c.globalAlpha = 0.55 + 0.45 * Math.sin(t * 3 + i); c.fillStyle = i % 5 ? '#7df3ff' : '#ffffff'; c.fillText((i * 7 + Math.floor(t * 2)) % 3 ? '1' : '0', x, y); } break;   // v0.9.23: río de datos
    case 'card': for (let i = 0; i < 10; i++) { const x = lane(i, 10 + (i % 3) * 4), y = top + 9 + (i % 3) * 10; c.save(); c.translate(x, y); c.rotate(Math.sin(t * 0.8 + i) * 0.25); c.fillStyle = i % 2 ? '#ffe06a' : '#c0c8ff'; c.fillRect(-9, -5.5, 18, 11); c.fillStyle = '#20102c'; c.fillRect(-9, -3, 18, 2.5); c.fillStyle = '#d4a017'; c.fillRect(-6, 1, 4, 3); c.restore(); } break;
  }
  c.globalAlpha = 1; c.textAlign = 'left';
}
function drawZone(z, t) {
  const c = ctx, fade = z.life === Infinity ? 1 : Math.min(1, z.life / 1.2, (z.max - z.life) / 0.3 + 0.2), R = mulberry32(Math.floor(z.seed));
  c.save(); c.translate(z.x, z.y); c.globalAlpha = fade;
  const blob = (sx, sy, fill) => { c.fillStyle = fill; c.beginPath(); for (let i = 0; i <= 12; i++) { const a = (i / 12) * Math.PI * 2, rr = 0.82 + R() * 0.3; i ? c.lineTo(Math.cos(a) * sx * rr, Math.sin(a) * sy * rr) : c.moveTo(Math.cos(a) * sx * rr, Math.sin(a) * sy * rr); } c.closePath(); c.fill(); };
  const rx = z.rx, ry = z.ry;
  switch (z.art) {
    case 'lava': { c.fillStyle = 'rgba(40,10,4,.85)'; c.beginPath(); c.ellipse(0, 2, rx * 1.18, ry * 1.25, 0, 0, Math.PI * 2); c.fill();
      const p = 1 + Math.sin(t * 3 + z.seed) * 0.05, rg = c.createRadialGradient(0, 0, 2, 0, 0, rx); rg.addColorStop(0, '#fff3b0'); rg.addColorStop(0.35, '#ffb02e'); rg.addColorStop(0.8, '#e2420f'); rg.addColorStop(1, '#8c1a08');
      c.fillStyle = rg; c.beginPath(); c.ellipse(0, 0, rx * p, ry * p, 0, 0, Math.PI * 2); c.fill(); break; }
    case 'coffee': blob(rx, ry, 'rgba(92,52,22,.85)'); c.fillStyle = 'rgba(255,240,215,.5)'; c.beginPath(); c.ellipse(-rx * 0.3, -ry * 0.25, rx * 0.3, ry * 0.2, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#fff'; c.globalAlpha = fade * (0.5 + 0.5 * Math.sin(t * 4 + z.seed)); c.fillRect(rx * 0.2, -ry * 0.4, 3, 3); break;
    case 'grave': c.fillStyle = 'rgba(40,30,30,.7)'; c.beginPath(); c.ellipse(0, 2, rx, ry, 0, 0, Math.PI * 2); c.fill();
      c.strokeStyle = '#7be04a'; c.lineWidth = 2.4; c.lineCap = 'round'; for (let i = -1; i <= 1; i++) { const x = i * rx * 0.5, s = Math.sin(t * 3 + i * 2 + z.seed) * 3; c.beginPath(); c.moveTo(x, 4); c.lineTo(x + s, -7); c.moveTo(x + s, -7); c.lineTo(x + s - 3, -11); c.moveTo(x + s, -7); c.lineTo(x + s + 3, -11); c.stroke(); } break;
    case 'cable': c.lineWidth = 3; c.lineCap = 'round'; ['#20102c', '#ff4b5c', '#3fd0e8'].forEach((col, j) => { c.strokeStyle = col; c.beginPath(); for (let i = 0; i <= 10; i++) { const x = -rx + (2 * rx * i) / 10, y = Math.sin(i * 1.3 + j * 2 + z.seed) * ry * 0.6 + (j - 1) * 4; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); }); break;
    case 'snow': blob(rx, ry, 'rgba(255,255,255,.95)'); c.fillStyle = 'rgba(180,210,235,.7)'; c.beginPath(); c.ellipse(rx * 0.2, ry * 0.3, rx * 0.5, ry * 0.3, 0, 0, Math.PI * 2); c.fill(); break;
    case 'gum': blob(rx, ry, 'rgba(255,111,176,.88)'); c.strokeStyle = 'rgba(255,200,230,.9)'; c.lineWidth = 2; for (let i = 0; i < 3; i++) { const b = 3 + ((t * 0.8 + i * 0.33 + z.seed) % 1) * 7; c.beginPath(); c.arc((i - 1) * rx * 0.45, -2, b, 0, Math.PI * 2); c.stroke(); } break;
    case 'bricks': { const cols = ['#ff4b5c', '#3fd0e8', '#ffcb3d', '#7be04a', '#d43cff']; for (let i = 0; i < 9; i++) { const x = (R() * 2 - 1) * rx * 0.85, y = (R() * 2 - 1) * ry * 0.75; c.save(); c.translate(x, y); c.rotate(R() * 3); c.fillStyle = cols[i % 5]; c.fillRect(-5, -3, 10, 6); c.fillStyle = 'rgba(255,255,255,.55)'; c.fillRect(-3, -2, 2, 2); c.fillRect(1, -2, 2, 2); c.strokeStyle = '#20102c'; c.lineWidth = 1; c.strokeRect(-5, -3, 10, 6); c.restore(); } break; }
    case 'trap': c.fillStyle = '#c99a62'; c.strokeStyle = '#20102c'; c.lineWidth = 1.6; c.fillRect(-rx * 0.6, -ry * 0.5, rx * 1.2, ry); c.strokeRect(-rx * 0.6, -ry * 0.5, rx * 1.2, ry); c.strokeStyle = '#b4bccb'; c.lineWidth = 2; c.beginPath(); c.rect(-rx * 0.45, -ry * 0.35, rx * 0.9, ry * 0.7); c.stroke(); c.fillStyle = '#ffe06a'; c.beginPath(); c.moveTo(0, -3); c.lineTo(6, 3); c.lineTo(-6, 3); c.closePath(); c.fill(); break;
    case 'shards': for (let i = 0; i < 8; i++) { const x = (R() * 2 - 1) * rx * 0.85, y = (R() * 2 - 1) * ry * 0.7; c.save(); c.translate(x, y); c.rotate(R() * 6); const cg = c.createLinearGradient(-5, 0, 5, 0); cg.addColorStop(0, '#e0e7ff'); cg.addColorStop(0.5, '#ff9ef0'); cg.addColorStop(1, '#7df3ff'); c.fillStyle = cg; c.beginPath(); c.moveTo(0, -6); c.lineTo(5, 4); c.lineTo(-4, 3); c.closePath(); c.fill(); c.restore(); } break;
    case 'boost': c.fillStyle = 'rgba(20,10,34,.8)'; c.fillRect(-rx, -ry * 0.8, rx * 2, ry * 1.6); for (let i = 0; i < 3; i++) { const h = (t * 120 + i * 120) % 360; c.strokeStyle = `hsl(${h},100%,60%)`; c.lineWidth = 3; const x = -rx * 0.5 + i * rx * 0.5; c.beginPath(); c.moveTo(x - 6, -ry * 0.5); c.lineTo(x, 0); c.lineTo(x - 6, ry * 0.5); c.stroke(); } c.strokeStyle = `hsl(${(t * 90) % 360},100%,65%)`; c.lineWidth = 2; c.strokeRect(-rx, -ry * 0.8, rx * 2, ry * 1.6); break;
    case 'paint': blob(rx, ry, ['#ff5f6d', '#3fd0e8', '#ffcb3d'][Math.floor(z.seed) % 3]); c.fillStyle = 'rgba(255,255,255,.4)'; c.beginPath(); c.ellipse(-rx * 0.3, -ry * 0.3, rx * 0.25, ry * 0.2, 0, 0, Math.PI * 2); c.fill(); break;
    case 'makeup': blob(rx, ry, 'rgba(255,190,220,.75)'); c.font = '15px sans-serif'; c.textAlign = 'center'; c.globalAlpha = fade * (0.7 + 0.3 * Math.sin(t * 3)); c.fillText('✨', 0, 5); break;
    case 'marble': { const mg = c.createLinearGradient(-rx, -ry, rx, ry); mg.addColorStop(0, 'rgba(255,255,255,.9)'); mg.addColorStop(0.5, 'rgba(210,215,240,.9)'); mg.addColorStop(1, 'rgba(255,255,255,.9)'); c.fillStyle = mg; c.fillRect(-rx, -ry * 0.75, rx * 2, ry * 1.5); c.strokeStyle = 'rgba(160,160,200,.7)'; c.lineWidth = 1; c.beginPath(); c.moveTo(-rx * 0.8, -ry * 0.3); c.quadraticCurveTo(0, ry * 0.4, rx * 0.8, -ry * 0.1); c.stroke(); const s = (t * 0.7 + z.seed) % 1; c.globalAlpha = fade * Math.sin(s * Math.PI) * 0.9; c.fillStyle = '#fff'; c.fillRect(-rx + s * rx * 2, -ry * 0.75, 4, ry * 1.5); break; }
  }
  c.restore();
}
// encima de las unidades: el techo del túnel, lo que cae y chispas
function terrainAir() {
  const T = TR.on && G.state !== 'title' ? TR.on : null; if (!T) return;
  const c = ctx, t = G.t;
  c.save();
  if (T.glow) for (let i = 0; i < 14; i++) { const k = (t * 0.45 + i * 0.173) % 1, x = (i * 41 + Math.floor(t * 0.45 + i * 0.173) * 131) % W, y = RIVER.y + 10 - k * 70; c.globalAlpha = (1 - k) * 0.8; c.fillStyle = i % 2 ? '#ffd23f' : '#ff6a1a'; c.beginPath(); c.arc(x + Math.sin(t * 3 + i) * 4, y, 1.6, 0, Math.PI * 2); c.fill(); }
  c.globalAlpha = 1;
  if (T.weather) for (let i = 0; i < 40; i++) {   // nieve, confeti, virutas…
    const sp = 18 + (i % 5) * 7, y = ((i * 97 + t * sp) % (H - 60)) + 30, x = ((i * 53 + Math.sin(t * 0.8 + i) * 14) % W + W) % W, w = T.weather;
    if (w === 'snow') { c.globalAlpha = 0.85; c.fillStyle = '#fff'; c.beginPath(); c.arc(x, y, 1.6 + (i % 3) * 0.8, 0, Math.PI * 2); c.fill(); }
    else if (w === 'confetti' || w === 'sprinkles') { c.globalAlpha = 0.8; c.fillStyle = ['#ff5f6d', '#ffcb3d', '#7be04a', '#3fd0e8', '#d43cff', '#ff9ef0'][i % 6]; c.save(); c.translate(x, y); c.rotate(t * 3 + i); w === 'sprinkles' ? c.fillRect(-3, -1, 6, 2) : c.fillRect(-2.5, -1.5, 5, 3); c.restore(); }
    else if (w === 'dust' && i % 2) { c.globalAlpha = 0.35; c.fillStyle = '#d8d0c0'; c.beginPath(); c.arc(x, y, 1.4, 0, Math.PI * 2); c.fill(); }
    else if (w === 'paper' && i % 4 === 0) { c.globalAlpha = 0.7; c.fillStyle = '#fff6ea'; c.save(); c.translate(x, y); c.rotate(Math.sin(t * 2 + i)); c.fillRect(-4, -3, 8, 6); c.restore(); }
    else if (w === 'pixels' && i % 2) { c.globalAlpha = 0.6; c.fillStyle = `hsl(${(i * 40 + t * 60) % 360},100%,60%)`; c.fillRect(Math.round(x), Math.round(y), 3, 3); }
  }
  c.globalAlpha = 1;
  if (T.tunnel != null) {   // techo del túnel: tapa a las unidades que van por dentro
    const x = T.tunnel, y0 = RIVER.top - 46, y1 = RIVER.bottom + 46, w = 46, busy = units.filter(u => u.alive && inTunnel(u));
    c.fillStyle = 'rgba(20,10,30,.35)'; c.beginPath(); c.ellipse(x + 4, y1 - 2, w + 6, 10, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#5d5850'; c.strokeStyle = OL; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x - w, y1); c.lineTo(x - w, y0 + 14); c.quadraticCurveTo(x - w, y0, x - w + 14, y0); c.lineTo(x + w - 14, y0); c.quadraticCurveTo(x + w, y0, x + w, y0 + 14); c.lineTo(x + w, y1); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#7d7870'; for (let r2 = 0; r2 < 6; r2++) for (let k = 0; k < 4; k++) { const bx = x - w + 6 + k * 22 + (r2 % 2) * 10, by = y0 + 6 + r2 * 19; if (bx + 18 > x + w) continue; c.fillRect(bx, by, 18, 14); }
    for (const [yy, up] of [[y0 + 12, true], [y1 - 4, false]]) { c.fillStyle = '#140a1e'; c.beginPath(); c.ellipse(x, yy, 22, 12, 0, up ? Math.PI : 0, up ? Math.PI * 2 : Math.PI); c.fill(); }
    c.font = '16px "Luckiest Guy", Impact, sans-serif'; c.textAlign = 'center'; c.lineWidth = 4; c.strokeStyle = OL; c.strokeText(tr('TÚNEL'), x, RIVER.y + 6); c.fillStyle = '#ffe06a'; c.fillText(tr('TÚNEL'), x, RIVER.y + 6);
    if (busy.length) {   // pelea dentro: polvo y «?» que se escapan
      for (let i = 0; i < 3; i++) { const k = (t * 1.3 + i * 0.33) % 1; c.globalAlpha = 1 - k; c.fillStyle = '#e8dcc8'; c.beginPath(); c.arc(x + (i - 1) * 18, y0 - k * 18, 4 + k * 6, 0, Math.PI * 2); c.fill(); }
      c.globalAlpha = 0.6 + 0.4 * Math.sin(t * 6); c.strokeText(tr(busy.length + ' DENTRO'), x, y0 - 6); c.fillStyle = '#fff'; c.fillText(tr(busy.length + ' DENTRO'), x, y0 - 6);
    }
    c.globalAlpha = 1;
  }
  const F = T.fall;
  if (F) for (const f of TR.falls) {
    if (!f.done) { const k = 1 - f.t / f.max; if (k > 0.45) { const z = (1 - (k - 0.45) / 0.55) * 260; drawFaller(F.art, f.x, f.y - z, t, 1); } }
    else if (f.boom > 0) { c.globalAlpha = f.boom * 2; c.strokeStyle = '#fff6ea'; c.lineWidth = 3; c.beginPath(); c.ellipse(f.x, f.y, F.r * (1.4 - f.boom), F.r * 0.55 * (1.4 - f.boom), 0, 0, Math.PI * 2); c.stroke(); drawFaller(F.art, f.x, f.y, t, f.boom * 2); c.globalAlpha = 1; }
  }
  c.restore(); c.textAlign = 'left';
}
function drawFaller(art, x, y, t, a) {
  const c = ctx; c.save(); c.translate(x, y); c.globalAlpha = Math.min(1, a); c.strokeStyle = OL; c.lineWidth = 2;
  switch (art) {
    case 'meteor': { const g = c.createLinearGradient(0, -40, 0, 0); g.addColorStop(0, 'rgba(255,120,20,0)'); g.addColorStop(1, 'rgba(255,170,40,.9)'); c.fillStyle = g; c.beginPath(); c.moveTo(-8, -6); c.lineTo(0, -46); c.lineTo(8, -6); c.fill(); c.fillStyle = '#5a2010'; c.beginPath(); c.arc(0, -4, 10, 0, Math.PI * 2); c.fill(); c.stroke(); c.fillStyle = '#ffb02e'; c.beginPath(); c.arc(-3, -6, 4, 0, Math.PI * 2); c.fill(); break; }
    case 'paper': c.rotate(Math.sin(t * 6) * 0.4); c.fillStyle = '#fff6ea'; c.fillRect(-12, -16, 24, 16); c.strokeRect(-12, -16, 24, 16); c.fillStyle = '#ff4b5c'; c.font = '7px "Luckiest Guy", Impact, sans-serif'; c.textAlign = 'center'; c.fillText('DESPIDO', 0, -6); break;
    case 'spot': c.fillStyle = '#3b4450'; c.beginPath(); c.moveTo(-9, -18); c.lineTo(9, -18); c.lineTo(13, -2); c.lineTo(-13, -2); c.closePath(); c.fill(); c.stroke(); c.fillStyle = '#fff3b0'; c.beginPath(); c.ellipse(0, -2, 12, 4, 0, 0, Math.PI * 2); c.fill(); break;
    case 'snowball': c.fillStyle = '#ffffff'; c.beginPath(); c.arc(0, -10, 12, 0, Math.PI * 2); c.fill(); c.stroke(); c.fillStyle = '#cfe4f5'; c.beginPath(); c.arc(4, -6, 5, 0, Math.PI * 2); c.fill(); break;
    case 'gumball': { c.fillStyle = ['#ff6fb0', '#7df3ff', '#ffe06a'][Math.floor(x) % 3]; c.beginPath(); c.arc(0, -11, 12, 0, Math.PI * 2); c.fill(); c.stroke(); c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.arc(-4, -15, 3.5, 0, Math.PI * 2); c.fill(); break; }
    case 'slide': c.rotate(Math.sin(t * 5) * 0.3); c.fillStyle = '#ffffff'; c.fillRect(-16, -22, 32, 22); c.strokeRect(-16, -22, 32, 22); c.fillStyle = '#3fd0e8'; c.fillRect(-11, -8, 5, 6); c.fillStyle = '#ffcb3d'; c.fillRect(-4, -12, 5, 10); c.fillStyle = '#ff4b5c'; c.fillRect(3, -16, 5, 14); c.fillStyle = '#20102c'; c.fillRect(-12, -19, 18, 2); break;
    case 'box': c.fillStyle = '#c99a62'; c.fillRect(-12, -22, 24, 20); c.strokeRect(-12, -22, 24, 20); c.strokeStyle = '#8a5f30'; c.beginPath(); c.moveTo(-12, -14); c.lineTo(12, -14); c.stroke(); break;
    case 'disc': { c.rotate(t * 8); const g = c.createLinearGradient(-9, -9, 9, 9); g.addColorStop(0, '#e0e7ff'); g.addColorStop(0.4, '#ff9ef0'); g.addColorStop(0.7, '#7df3ff'); g.addColorStop(1, '#ffe06a'); c.fillStyle = g; c.beginPath(); c.arc(0, -8, 10, 0, Math.PI * 2); c.fill(); c.stroke(); c.fillStyle = '#20102c'; c.beginPath(); c.arc(0, -8, 2.5, 0, Math.PI * 2); c.fill(); break; }
    case 'lag': c.font = '18px "Luckiest Guy", Impact, sans-serif'; c.textAlign = 'center'; c.lineWidth = 4; c.strokeText('LAG', 0, -6); c.fillStyle = '#ff4b5c'; c.fillText('LAG', 0, -6); c.fillStyle = 'rgba(255,75,92,.5)'; for (let i = 0; i < 4; i++) c.fillRect(-20 + i * 11, -26 + (i % 2) * 4, 8, 3); break;
    case 'bill': c.rotate(Math.sin(t * 7) * 0.35); c.fillStyle = '#fff6ea'; c.fillRect(-10, -24, 20, 24); c.strokeRect(-10, -24, 20, 24); c.fillStyle = '#20102c'; for (let i = 0; i < 4; i++) c.fillRect(-6, -19 + i * 4, 12 - (i % 2) * 4, 1.6); c.fillStyle = '#ff4b5c'; c.fillRect(-6, -5, 12, 3); break;
  }
  c.restore();
}
