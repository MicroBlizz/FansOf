// Fans Of · Arte (base): las ayudas de dibujo y los objetos vacíos ART y BOX, que rellenan los archivos de cada facción
'use strict';
/* =========================================================
   ART: every character and building is drawn in code
   (origin = ground point under the feet, up is negative y)
   ========================================================= */
function shape(c, build, fill, lw = 2.2) {
  c.beginPath(); build(c);
  if (fill) { c.fillStyle = fill; c.fill(); }
  if (lw) { c.lineWidth = lw; c.strokeStyle = OL; c.stroke(); }
}
const el = (x, y, rx, ry, rot = 0) => c => c.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
const rr = (x, y, w, h, r) => c => rrPath(c, x, y, w, h, r);
const poly = (...p) => c => { c.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]); c.closePath(); };
function line(c, p, color, lw) { c.beginPath(); c.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]); c.strokeStyle = color; c.lineWidth = lw; c.stroke(); }
function dot(c, x, y, r, color) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = color; c.fill(); }
function heartPath(c, x, y, s) { c.moveTo(x, y + s * 0.9); c.bezierCurveTo(x - s * 1.7, y - s * 0.1, x - s * 0.8, y - s * 1.4, x, y - s * 0.45); c.bezierCurveTo(x + s * 0.8, y - s * 1.4, x + s * 1.7, y - s * 0.1, x, y + s * 0.9); c.closePath(); }
function txt(c, s, x, y, size, color) { c.fillStyle = color; c.font = size + 'px ' + FONT_D; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function starPath(c, x, y, r1, r2, n = 5) { c.moveTo(x, y - r1); for (let i = 1; i < n * 2; i++) { const a = -Math.PI / 2 + (i * Math.PI) / n; const r = i % 2 ? r2 : r1; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } c.closePath(); }

// v0.9.15: fondo redondo de los iconos de hechizo: naranja (daño), verde (cura) o morado (loco)
function otxt(c, t, x, y, size, color) { c.font = size + 'px ' + FONT_D; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.lineWidth = Math.max(2, size * 0.32); c.strokeStyle = OL; c.strokeText(t, x, y); c.fillStyle = color; c.fillText(t, x, y); }
function spBg(c, k) { const C = { d: ['#ffd08a', '#ff7a1a'], h: ['#d6ffc2', '#3fa62a'], c: ['#f0c8ff', '#8b3dff'] }[k]; const g = c.createRadialGradient(-5, -29, 3, 0, -22, 23); g.addColorStop(0, C[0]); g.addColorStop(1, C[1]); c.beginPath(); c.arc(0, -22, 21, 0, Math.PI * 2); c.fillStyle = g; c.fill(); c.lineWidth = 2.2; c.strokeStyle = OL; c.stroke(); c.beginPath(); c.arc(0, -22, 17.5, Math.PI * 1.1, Math.PI * 1.5); c.lineWidth = 2.4; c.strokeStyle = 'rgba(255,255,255,.45)'; c.stroke(); }
const ART = {};
const BOX = {};
