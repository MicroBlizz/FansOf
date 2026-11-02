// Fans of Nova · DIBUJO DE UN ENEMIGO: su cuerpo (el arte final con nvSpriteEnemigo, o el dibujo provisional de su tipo), el anillo de
// peligro, lo que se ve de sus estados y su rótulo. Solo lee el estado de la partida; lo llama nvDibujaMundo (dibujo.js).
'use strict';
function nvDibujaEnemigo(c, e, S) {
  const r = e.r;
  c.save(); c.translate(e.x, e.y);
  if (e.calor > 3) { c.beginPath(); c.arc(0, 0, r + 5, 0, 6.283); c.fillStyle = 'rgba(255,75,75,' + Math.min(0.5, e.calor / 200 + 0.05) + ')'; c.fill(); }
  c.lineWidth = 2.5; c.strokeStyle = '#1a0f2e'; c.fillStyle = e.flash > 0 ? '#ffffff' : e.d.color;
  const arte = nvSpriteEnemigo(c, e, S);
  if (!arte) {   // sin arte final: el dibujo provisional de cada tipo y sus armas en los anclajes
    (NV_CUERPOS[e.tipo] || nvCuerpoLapida)(c, e, S, r);
    if (e.armas) for (const w of e.armas) { c.beginPath(); c.arc(w.ax * r, w.ay * r, r * { S: 0.13, M: 0.2, L: 0.3 }[w.tam], 0, 6.283); c.fillStyle = '#ff6b6b'; c.fill(); c.lineWidth = 1.5; c.strokeStyle = '#1a0f2e'; c.stroke(); }
  }
  if (!e.d.pasivo && !e.d.nido && !e.d.jefe) nvAnilloPeligro(c, e, S, r);
  nvDibujaEstadosEnemigo(c, e, r);
  nvRotuloEnemigo(c, e, r);
  c.restore();
}
// Dibujos provisionales (sin arte final), por tipo de enemigo; ya trasladados a su centro
const NV_CUERPOS = {
  asteroide(c, e, S, r) {   // roca irregular
    c.rotate(e.ang); c.beginPath();
    for (let k = 0; k < 9; k++) { const a = k * 0.698, q = r * (0.78 + 0.28 * Math.sin(k * 2.3 + e.forma * 9)); c[k ? 'lineTo' : 'moveTo'](Math.cos(a) * q, Math.sin(a) * q); }
    c.closePath(); c.fillStyle = e.flash > 0 ? '#fff' : '#7b7f9c'; c.fill(); c.stroke();
    c.fillStyle = 'rgba(30,25,60,.45)'; c.beginPath(); c.arc(-r * 0.25, -r * 0.1, r * 0.22, 0, 6.283); c.arc(r * 0.3, r * 0.25, r * 0.15, 0, 6.283); c.fill();
  },
  nido(c, e, S, r) {   // nido de huesos que late
    const lat = 1 + 0.05 * Math.sin(S.t * 5 + e.fase);
    c.scale(lat, lat); c.beginPath(); c.arc(0, 0, r, 0, 6.283); c.fillStyle = e.flash > 0 ? '#fff' : '#3d7a3a'; c.fill(); c.stroke();
    c.fillStyle = '#d8e6c8'; for (let k = 0; k < 6; k++) { const a = k * 1.047 + e.fase; c.beginPath(); c.moveTo(Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5); c.lineTo(Math.cos(a + 0.18) * r * 1.2, Math.sin(a + 0.18) * r * 1.2); c.lineTo(Math.cos(a - 0.18) * r * 1.2, Math.sin(a - 0.18) * r * 1.2); c.fill(); c.stroke(); }
    c.fillStyle = '#9bff8a'; c.beginPath(); c.arc(0, 0, r * 0.3, 0, 6.283); c.fill(); c.stroke();
  },
  rastrero(c, e, S, r) {   // cráneo con patas
    c.beginPath(); c.arc(0, 0, r, 0, 6.283); c.fill(); c.stroke();
    c.fillStyle = '#1a0f2e'; c.beginPath(); c.arc(-r * 0.35, -r * 0.1, r * 0.22, 0, 6.283); c.arc(r * 0.35, -r * 0.1, r * 0.22, 0, 6.283); c.fill();
  },
  fusilero(c, e, S, r) {   // nave de huesos en flecha
    const a = Math.atan2(S.nave.y - e.y, S.nave.x - e.x) + 1.5708; c.rotate(a);
    c.beginPath(); c.moveTo(0, -r * 1.2); c.lineTo(r, r); c.lineTo(0, r * 0.5); c.lineTo(-r, r); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#1a0f2e'; c.fillRect(-r * 0.3, -r * 0.2, r * 0.6, r * 0.3);
  },
};
function nvCuerpoLapida(c, e, S, r) {   // sepulturero y jefe: lápida / corona de huesos
  const d = e.d;
  c.beginPath(); for (let k = 0; k < 8; k++) { const a = k * 0.785 + 0.39; c[k ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#1a0f2e'; c.beginPath(); c.arc(-r * 0.3, -r * 0.1, r * 0.2, 0, 6.283); c.arc(r * 0.3, -r * 0.1, r * 0.2, 0, 6.283); c.fill();
  if (d.capitan) { c.fillStyle = '#ffd93d'; c.font = '800 ' + r * 0.7 + 'px Baloo 2, sans-serif'; c.textAlign = 'center'; c.fillText(String(e.rango), 0, r * 0.62); }
  if (d.jefe) { c.fillStyle = '#ffd93d'; for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(k * r * 0.3 - 6, -r * 0.95); c.lineTo(k * r * 0.3, -r * 1.3); c.lineTo(k * r * 0.3 + 6, -r * 0.95); c.fill(); } }
}
// Anillo de peligro según su rango frente al tuyo: rojo = huye, naranja = cuidado, amarillo = parecido, verde = presa
function nvAnilloPeligro(c, e, S, r) {
  const df = e.rango - S.nave.rango, col = df >= 4 ? '#ff3b3b' : df >= 2 ? '#ff9a3c' : df >= -1 ? '#ffe066' : '#6bff8a';
  c.beginPath(); c.arc(0, 0, r + 4, 0, 6.283); c.lineWidth = df >= 4 ? 4 : 2.5; c.strokeStyle = col; c.globalAlpha = df >= 4 ? 0.55 + 0.4 * Math.sin(S.t * 8) : 0.75; c.stroke(); c.globalAlpha = 1;
  if (e.d.capitan) return;
  c.fillStyle = col; c.font = '800 ' + Math.max(11, r * 0.5) + 'px Baloo 2, sans-serif'; c.textAlign = 'center'; c.lineWidth = 3; c.strokeStyle = '#1a0f2e'; c.strokeText(String(e.rango), 0, -r - 8); c.fillText(String(e.rango), 0, -r - 8);
}
// Lo que se ve de sus estados: escudo, grietas, retícula, casco al rojo, apagón y aro de interferencia
function nvDibujaEstadosEnemigo(c, e, r) {
  if (e.esc > 0 && !(e.est.escudoCaido > 0)) { c.beginPath(); c.arc(0, 0, r + 6, 0, 6.283); c.lineWidth = 3; c.strokeStyle = 'rgba(120,190,255,' + (0.3 + 0.6 * e.esc / e.escMax) + ')'; c.stroke(); }
  if (e.est.brecha > 0) { c.strokeStyle = '#ff9a3c'; c.lineWidth = 2; c.beginPath(); c.moveTo(-r * 0.5, -r * 0.6); c.lineTo(0, 0); c.lineTo(r * 0.4, r * 0.5); c.stroke(); }
  if (e.est.marcado > 0) { c.strokeStyle = '#ffd93d'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, r + 9, 0, 6.283); c.moveTo(-r - 14, 0); c.lineTo(r + 14, 0); c.moveTo(0, -r - 14); c.lineTo(0, r + 14); c.stroke(); }
  if (e.calor > 3) { const g = c.createRadialGradient(0, 0, 0, 0, 0, r); const q = Math.min(0.75, e.calor / 130); g.addColorStop(0, 'rgba(255,60,40,' + q + ')'); g.addColorStop(1, 'rgba(255,60,40,' + q * 0.35 + ')'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, r * 0.95, 0, 6.283); c.fill(); }   // brillo rojo del casco según el calor acumulado
  if (e.est.apagon > 0) { c.fillStyle = 'rgba(180,107,255,.45)'; c.beginPath(); c.arc(0, 0, r, 0, 6.283); c.fill(); }
  if (e.est.interferido > 0) { c.save(); c.setLineDash([6, 5]); c.lineDashOffset = -(e.fase || 0) * 20; c.strokeStyle = 'rgba(180,107,255,.85)'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, r + 12, 0, 6.283); c.stroke(); c.restore(); }
}
// El nombre del capitán y la barra de vida (si está herido, o siempre en jefes y capitanes)
function nvRotuloEnemigo(c, e, r) {
  const d = e.d;
  if (d.capitan) { c.fillStyle = '#fff'; c.font = '800 13px Baloo 2, sans-serif'; c.textAlign = 'center'; c.lineWidth = 3; c.strokeText(tr(d.nombre) + ' ' + e.rango, 0, -r - 20); c.fillText(tr(d.nombre) + ' ' + e.rango, 0, -r - 20); }
  if (e.hp < e.hpMax || d.jefe || d.capitan) { c.fillStyle = '#1a0f2e'; c.fillRect(-r, -r - 12, 2 * r, 5); c.fillStyle = d.jefe ? '#ff4b9a' : '#ff6b6b'; c.fillRect(-r, -r - 12, 2 * r * Math.max(0, e.hp / e.hpMax), 5); }
}
