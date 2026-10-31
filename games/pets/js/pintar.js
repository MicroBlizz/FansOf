// Fans Of Pets · PINTAR: los dibujos PROVISIONALES del prototipo, con formas simples, el contorno grueso y los colores de core: la oficina de fondo
// (con ventana de día o de noche), Lola, el huevo y el bebé (un blob redondo del color de su facción con ojos grandes). El arte kawaii llegará aparte.
'use strict';
const PT_TINTA = '#20102c';
function ptAclara(hex, f) {   // mezcla un color con blanco (f > 0) o con negro (f < 0)
  const n = parseInt(hex.slice(1), 16), c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => Math.round(f > 0 ? v + (255 - v) * f : v * (1 + f)));
  return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
}
function ptTrazo(ctx, ancho = 6) { ctx.lineWidth = ancho; ctx.strokeStyle = PT_TINTA; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; }

// el fondo: pared, ventana (día o noche según su horario) y la mesa
function ptPintaOficina(ctx, W, H, dia) {
  ctx.fillStyle = dia ? '#3e2363' : '#1c1030'; ctx.fillRect(0, 0, W, H);
  const vx = 300, vy = 130, vw = 180, vh = 150;
  ctx.fillStyle = dia ? '#7fd4ff' : '#101a3c'; ctx.fillRect(vx, vy, vw, vh);
  if (dia) { ctx.fillStyle = '#ffe680'; ctx.beginPath(); ctx.arc(vx + 130, vy + 50, 24, 0, 7); ctx.fill(); }
  else { ctx.fillStyle = '#fff6ea'; ctx.beginPath(); ctx.arc(vx + 130, vy + 50, 20, 0, 7); ctx.fill(); ctx.fillStyle = '#101a3c'; ctx.beginPath(); ctx.arc(vx + 142, vy + 42, 17, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff6ea'; for (const [a, b] of [[30, 30], [70, 100], [150, 120], [50, 70]]) ctx.fillRect(vx + a, vy + b, 3, 3); }
  ptTrazo(ctx); ctx.strokeRect(vx, vy, vw, vh); ctx.beginPath(); ctx.moveTo(vx + vw / 2, vy); ctx.lineTo(vx + vw / 2, vy + vh); ctx.stroke();
  ctx.fillStyle = '#8b5530'; ctx.fillRect(-10, 600, W + 20, 40); ptTrazo(ctx); ctx.strokeRect(-10, 600, W + 20, 40);
  ctx.fillStyle = '#6b3f22'; ctx.fillRect(-10, 640, W + 20, H - 640);
}

// Lola: cara redonda, moño, gafas y su placa
function ptPintaLola(ctx, x, y, s, t) {
  const b = Math.sin(t * 2) * 3;
  ctx.save(); ctx.translate(x, y + b); ctx.scale(s, s);
  ptTrazo(ctx);
  ctx.fillStyle = '#7c3aed'; ctx.beginPath(); ctx.ellipse(0, 120, 110, 70, 0, Math.PI, 0); ctx.fill(); ctx.stroke();   // la chaqueta
  ctx.fillStyle = '#5a2a1a'; ctx.beginPath(); ctx.arc(0, -75, 32, 0, 7); ctx.fill(); ctx.stroke();                     // el moño
  ctx.fillStyle = '#ffd7b0'; ctx.beginPath(); ctx.arc(0, 0, 72, 0, 7); ctx.fill(); ctx.stroke();                       // la cara
  ctx.fillStyle = '#5a2a1a'; ctx.beginPath(); ctx.ellipse(0, -48, 70, 30, 0, Math.PI, 0); ctx.fill();                  // el pelo
  ctx.fillStyle = '#fff'; for (const sx of [-26, 26]) { ctx.beginPath(); ctx.arc(sx, 4, 18, 0, 7); ctx.fill(); ctx.stroke(); }
  ctx.fillStyle = PT_TINTA; for (const sx of [-26, 26]) { ctx.beginPath(); ctx.arc(sx, 6, 6, 0, 7); ctx.fill(); }
  ctx.beginPath(); ctx.moveTo(-8, 4); ctx.lineTo(8, 4); ctx.stroke();                                                    // el puente de las gafas
  ctx.beginPath(); ctx.moveTo(-18, 40); ctx.quadraticCurveTo(0, 48, 18, 40); ctx.stroke();                               // media sonrisa de entrevista
  ctx.fillStyle = '#fff6ea'; ctx.fillRect(30, 90, 56, 24); ptTrazo(ctx, 3); ctx.strokeRect(30, 90, 56, 24);
  ctx.fillStyle = PT_TINTA; ctx.font = '800 15px "Baloo 2", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('LOLA', 58, 103);
  ctx.restore();
}

// un huevo: el color de su facción, con manchas; wob mueve el huevo (al tocarlo) y bufanda lo abriga
function ptPintaHuevo(ctx, x, y, r, color, t, { wob = 0, bufanda = false, grieta = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 18) * 0.18 * wob);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(0, r * 1.25, r * 0.85, r * 0.2, 0, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, 0, r * 0.82, r * 1.12, 0, 0, 7);
  const g = ctx.createLinearGradient(-r, -r, r, r); g.addColorStop(0, ptAclara(color, 0.45)); g.addColorStop(1, color); ctx.fillStyle = g; ctx.fill();
  ptTrazo(ctx, Math.max(3, r / 12)); ctx.stroke();
  ctx.fillStyle = ptAclara(color, -0.25); for (const [a, b, c] of [[-0.35, -0.4, 0.16], [0.3, 0.1, 0.12], [-0.15, 0.55, 0.1]]) { ctx.beginPath(); ctx.arc(a * r, b * r, c * r, 0, 7); ctx.fill(); }
  ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.ellipse(-0.35 * r, -0.65 * r, 0.12 * r, 0.22 * r, -0.4, 0, 7); ctx.fill();
  if (grieta > 0) { ptTrazo(ctx, Math.max(2, r / 20)); ctx.beginPath(); ctx.moveTo(-0.5 * r, -0.1 * r); for (let i = 1; i <= 6; i++) ctx.lineTo(-0.5 * r + i * 0.17 * r, (i % 2 ? -0.25 : -0.05) * r); ctx.globalAlpha = grieta; ctx.stroke(); ctx.globalAlpha = 1; }
  if (bufanda) { ctx.fillStyle = '#ff4b5c'; ctx.beginPath(); ctx.ellipse(0, 0.3 * r, 0.8 * r, 0.16 * r, 0, 0, 7); ctx.fill(); ptTrazo(ctx, Math.max(3, r / 14)); ctx.stroke();
    ctx.beginPath(); ctx.rect(0.3 * r, 0.35 * r, 0.18 * r, 0.5 * r); ctx.fill(); ctx.stroke(); }
  ctx.restore();
}

// el bebé: un blob redondo del color de su facción, con ojos grandes. e: { dormida, triste, anim, at } (anim: el cuidado que se está viendo)
function ptPintaBebe(ctx, x, y, r, color, t, e) {
  const a = e.anim && t - e.at < 1.4 ? e.anim : '', p = a ? (t - e.at) / 1.4 : 0;
  const resp = e.dormida ? Math.sin(t * 1.6) * 0.04 : Math.sin(t * 3) * 0.03, salto = a && !e.dormida ? Math.abs(Math.sin(p * Math.PI * 3)) * 26 * (1 - p) : 0;
  ctx.save(); ctx.translate(x, y - salto);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(0, r * 0.95 + salto, r * (0.9 - salto / 200), r * 0.18, 0, 0, 7); ctx.fill();
  ctx.scale(1 + resp, 1 - resp);
  ctx.beginPath(); ctx.moveTo(-r, r * 0.55); ctx.bezierCurveTo(-r * 1.15, -r * 0.9, r * 1.15, -r * 0.9, r, r * 0.55); ctx.quadraticCurveTo(0, r * 1.05, -r, r * 0.55);
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.4, r * 0.1, 0, 0, r * 1.2); g.addColorStop(0, ptAclara(color, 0.5)); g.addColorStop(1, color); ctx.fillStyle = g; ctx.fill();
  ptTrazo(ctx, 7); ctx.stroke();
  ctx.fillStyle = 'rgba(255,120,150,0.45)'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * r * 0.55, r * 0.22, r * 0.14, r * 0.08, 0, 0, 7); ctx.fill(); }
  ptTrazo(ctx, 6);
  if (e.dormida) {   // ojos cerrados
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * r * 0.33, -r * 0.05, r * 0.16, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke(); }
  } else {
    const parpadeo = (t % 4) < 0.12 ? 0.15 : 1;
    for (const s of [-1, 1]) {
      ctx.save(); ctx.translate(s * r * 0.33, -r * 0.08); ctx.scale(1, parpadeo);
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(0, 0, r * 0.22, r * 0.27, 0, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = PT_TINTA; ctx.beginPath(); ctx.ellipse(r * 0.03, r * 0.04, r * 0.13, r * 0.17, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(r * 0.08, -r * 0.05, r * 0.05, 0, 7); ctx.fill();
      ctx.restore();
    }
  }
  // la boca: contenta, triste, comiendo o dormida
  ctx.beginPath();
  if (a === 'comer' || a === 'beber') { ctx.fillStyle = '#7a1f3d'; ctx.ellipse(0, r * 0.32, r * 0.1, r * 0.08 * (1 + Math.sin(t * 20)), 0, 0, 7); ctx.fill(); ctx.stroke(); }
  else if (e.dormida) { ctx.ellipse(0, r * 0.32, r * 0.05, r * 0.04, 0, 0, 7); ctx.stroke(); }
  else if (e.triste) { ctx.arc(0, r * 0.45, r * 0.14, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke(); }
  else { ctx.arc(0, r * 0.22, r * 0.14, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke(); }
  ctx.restore();
  ptPintaEfecto(ctx, x, y - salto, r, t, e, a, p);
}
// lo que acompaña a cada cuidado: migas, gotas, burbujas o zetas
function ptPintaEfecto(ctx, x, y, r, t, e, a, p) {
  ctx.save(); ptTrazo(ctx, 3);
  if (a === 'comer') for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? '#ffb347' : '#d39a5f'; ctx.beginPath(); ctx.arc(x - 60 + i * 24, y + r * 0.3 - 80 * (1 - p) + (i % 3) * 8, 7, 0, 7); ctx.fill(); ctx.stroke(); }
  if (a === 'beber') for (let i = 0; i < 5; i++) { const yy = y - r - 20 + ((p * 160 + i * 30) % 120); ctx.fillStyle = '#5ec8ff'; ctx.beginPath(); ctx.moveTo(x - 70 + i * 35, yy - 12); ctx.quadraticCurveTo(x - 60 + i * 35, yy + 8, x - 70 + i * 35, yy + 8); ctx.quadraticCurveTo(x - 80 + i * 35, yy + 8, x - 70 + i * 35, yy - 12); ctx.fill(); ctx.stroke(); }
  if (a === 'banar') for (let i = 0; i < 9; i++) { const ang = i * 0.7 + p * 2, d = r * (0.9 + 0.5 * p); ctx.fillStyle = 'rgba(220,245,255,0.75)'; ctx.beginPath(); ctx.arc(x + Math.cos(ang) * d, y - r * 0.2 + Math.sin(ang) * d * 0.7 - p * 40, 8 + (i % 3) * 5, 0, 7); ctx.fill(); ctx.stroke(); }
  if (e.dormida) {
    ctx.fillStyle = '#fff6ea'; ctx.textAlign = 'center'; ctx.lineWidth = 5;
    for (let i = 0; i < 3; i++) { const f = (t * 0.5 + i / 3) % 1; ctx.font = `800 ${22 + i * 8}px "Baloo 2", sans-serif`; ctx.globalAlpha = 1 - f;
      ctx.strokeText('Z', x + r * 0.7 + f * 50, y - r * 0.6 - f * 90); ctx.fillText('Z', x + r * 0.7 + f * 50, y - r * 0.6 - f * 90); }
    ctx.globalAlpha = 1;
  }
  if (e.triste && !e.dormida) { ctx.fillStyle = '#5ec8ff'; ctx.beginPath(); ctx.arc(x - r * 0.45, y + ((t * 40) % 30), 6, 0, 7); ctx.fill(); ctx.stroke(); }
  ctx.restore();
}
