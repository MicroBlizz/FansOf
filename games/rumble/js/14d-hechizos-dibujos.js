// Fans of Rumble · Lo que cae del cielo en cada hechizo (v0.9.72). Antes bajaba la carta del hechizo como una bola;
// ahora cada hechizo hace llover lo suyo (bellotas, monedas, pociones, relojes…) y los «gordos» (martillo, espada, sello y bomba)
// caen como un solo objeto grande. Los dibuja drawSpellBit; quién llueve y quién cae solo lo decide updateSpells (14a-hechizos.js).
'use strict';
const FX_SOLO = ['bolt', 'laser'];                    // tienen su propio rayo: no llueve nada
const FX_GORDO = ['hammer', 'sword', 'stamp', 'boom'];   // cae uno grande y golpea
// s: tamaño (1 = pequeño, como las bellotas de siempre)
function drawSpellBit(c, fx, x, y, rot, col, s) {
  s = s || 1;
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); c.lineWidth = s > 2 ? 1.1 : 1.4; c.strokeStyle = OL; c.lineJoin = 'round';
  const fill = (f) => { c.fillStyle = f; c.fill(); c.stroke(); };
  const rect = (x0, y0, w, h, f) => { c.beginPath(); c.rect(x0, y0, w, h); fill(f); };
  const circ = (cx, cy, r, f) => { c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); fill(f); };
  switch (fx) {
    case 'acorn': c.beginPath(); c.ellipse(0, 1.4, 3.8, 4.2, 0, 0, Math.PI * 2); fill('#9a6a33'); c.beginPath(); c.ellipse(0, -2.4, 4.4, 2.1, 0, 0, Math.PI * 2); fill('#5b3a1c'); break;
    case 'tomb': c.beginPath(); c.moveTo(-5, 6); c.lineTo(-5, -2); c.arc(0, -2, 5, Math.PI, 0); c.lineTo(5, 6); c.closePath(); fill('#b9bfcc'); break;
    case 'coin': circ(0, 0, 4.6, '#ffcb3d'); c.fillStyle = '#c47f10'; c.fillRect(-0.8, -2.4, 1.6, 4.8); break;
    case 'cat': c.beginPath(); c.ellipse(0, 1, 5.6, 4.6, 0, 0, Math.PI * 2); c.moveTo(-5, -1); c.lineTo(-4, -6); c.lineTo(-1, -3); c.moveTo(5, -1); c.lineTo(4, -6); c.lineTo(1, -3); fill('#ffb04f'); break;
    case 'cart': rect(-4.5, -5.5, 9, 11, '#9ca3af'); c.fillStyle = '#ffe06a'; c.fillRect(-3, -4, 6, 4.4); break;
    case 'letter': rect(-5.5, -3.6, 11, 7.2, '#fff6ea'); c.beginPath(); c.moveTo(-5.5, -3.6); c.lineTo(0, 0.6); c.lineTo(5.5, -3.6); c.stroke(); break;
    case 'card9': rect(-6, -4, 12, 8, '#334155'); c.fillStyle = '#ffcb3d'; c.fillRect(-4, 0.5, 3.6, 2); break;
    case 'heart': c.beginPath(); c.moveTo(0, 4); c.bezierCurveTo(-7, -1, -4, -7, 0, -3); c.bezierCurveTo(4, -7, 7, -1, 0, 4); fill(col || '#ff5fa8'); break;
    case 'leaf': c.beginPath(); c.ellipse(0, 0, 5, 2.4, 0.6, 0, Math.PI * 2); fill('#7be04a'); c.beginPath(); c.moveTo(-3.5, -2.2); c.lineTo(3.5, 2.2); c.stroke(); break;
    case 'flea': c.beginPath(); c.ellipse(0, 0, 2.6, 2, 0, 0, Math.PI * 2); fill('#8b5530'); break;
    case 'potion': rect(-1.3, -6.5, 2.6, 3, '#e8d9b8'); circ(0, 1, 4.4, col || '#7dffb8'); c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(-2.4, -1, 1.4, 2.2); break;
    case 'clock': circ(0, 0, 5, '#fff6ea'); c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -3.4); c.moveTo(0, 0); c.lineTo(2.6, 1); c.stroke(); break;
    case 'sandwich': rect(-6, -3.6, 12, 2.6, '#e8b56a'); rect(-6.4, -1, 12.8, 1.6, '#7be04a'); rect(-6, 0.6, 12, 2.6, '#e8b56a'); break;
    case 'can': rect(-3.2, -5, 6.4, 10, col || '#7be04a'); c.fillStyle = '#fff6ea'; c.fillRect(-3.2, -1, 6.4, 2); break;
    case 'chip': rect(-4, -4, 8, 8, '#334155'); c.beginPath(); for (const p of [-2, 0, 2]) { c.moveTo(-6, p); c.lineTo(-4, p); c.moveTo(4, p); c.lineTo(6, p); } c.stroke(); c.fillStyle = col || '#7df3ff'; c.fillRect(-1.6, -1.6, 3.2, 3.2); break;
    case 'bar': rect(-7, -2.6, 14, 5.2, '#fff6ea'); c.fillStyle = col || '#7be04a'; c.fillRect(-6, -1.6, 7, 3.2); break;
    case 'arrow': c.beginPath(); c.moveTo(0, -6); c.lineTo(0, 2); c.lineWidth *= 1.6; c.stroke(); c.lineWidth /= 1.6; c.beginPath(); c.moveTo(0, 7); c.lineTo(-3.8, 1.5); c.lineTo(3.8, 1.5); c.closePath(); fill(col || '#ff6b6b'); break;
    case 'swirl': c.beginPath(); for (let i = 0; i <= 40; i++) { const a = i * 0.42, r = 0.2 + i * 0.14; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.lineWidth *= 1.8; c.strokeStyle = col || '#c084fc'; c.stroke(); break;
    case 'wifi': c.lineCap = 'round'; c.strokeStyle = col || '#7df3ff'; for (const r of [2.5, 5.2, 8]) { c.beginPath(); c.arc(0, 4, r, -Math.PI * 0.78, -Math.PI * 0.22); c.lineWidth = 2; c.stroke(); } c.beginPath(); c.arc(0, 4, 1.2, 0, Math.PI * 2); c.fillStyle = col || '#7df3ff'; c.fill(); break;
    case 'patch': c.beginPath(); rrPath(c, -6.5, -2.6, 13, 5.2, 2.6); fill('#fde68a'); c.fillStyle = '#e0a96a'; c.fillRect(-2, -1.6, 4, 3.2); break;
    case 'brush': c.beginPath(); c.moveTo(-5, 5); c.lineTo(1, -1); c.lineWidth *= 2.2; c.strokeStyle = '#8b5530'; c.stroke(); c.lineWidth /= 2.2; c.strokeStyle = OL; c.beginPath(); c.ellipse(3, -3, 3.2, 2, -0.8, 0, Math.PI * 2); fill(col || '#ff9ab8'); break;
    case 'clap': rect(-6, -1.5, 12, 7, '#2a2333'); c.save(); c.translate(-6, -1.5); c.rotate(-0.35); rect(0, -3, 12, 3, '#fff6ea'); c.fillStyle = '#2a2333'; for (const p of [1.5, 5.5, 9.5]) c.fillRect(p, -3, 2, 3); c.restore(); break;
    case 'goblet': c.beginPath(); c.moveTo(-4.5, -5); c.lineTo(4.5, -5); c.quadraticCurveTo(4.5, 1, 0, 1.5); c.quadraticCurveTo(-4.5, 1, -4.5, -5); fill('#ffd166'); rect(-0.8, 1.5, 1.6, 3, '#ffd166'); c.beginPath(); c.ellipse(0, 5, 3.4, 1.3, 0, 0, Math.PI * 2); fill('#ffd166'); break;
    case 'hammer': rect(-1.1, -2, 2.2, 10, '#8b5530'); c.beginPath(); rrPath(c, -6, -6.5, 12, 5, 1.4); fill(col || '#ff6b6b'); c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(-4.5, -5.6, 9, 1.2); break;
    case 'sword': c.beginPath(); c.moveTo(0, -9); c.lineTo(1.6, -7); c.lineTo(1.6, 2.4); c.lineTo(-1.6, 2.4); c.lineTo(-1.6, -7); c.closePath(); fill('#dfe7f2'); rect(-4.4, 2.4, 8.8, 1.9, '#ffcb3d'); rect(-1, 4.3, 2, 3.8, '#8b5530'); break;
    case 'stamp': c.beginPath(); c.ellipse(0, -6, 2.6, 1.6, 0, 0, Math.PI * 2); fill('#8b5530'); rect(-1.2, -5, 2.4, 4, '#8b5530'); rect(-5.5, -1, 11, 3, '#5b3a1c'); rect(-6.5, 2, 13, 2.6, col || '#ff4b5c'); break;
    case 'boom': circ(0, 1, 5, '#2a2333'); c.beginPath(); c.moveTo(2.6, -3); c.quadraticCurveTo(5, -6, 3, -8); c.stroke(); circ(3, -8.4, 1.4, '#ffcb3d'); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.arc(-1.8, -1, 1.6, 0, Math.PI * 2); c.fill(); break;
    case 'bolt': c.beginPath(); c.moveTo(1.5, -7); c.lineTo(-3, 0.5); c.lineTo(0, 0.5); c.lineTo(-1.5, 7); c.lineTo(3.5, -1); c.lineTo(0.5, -1); c.closePath(); fill('#ffe14d'); break;
    case 'laser': c.beginPath(); c.arc(0, 0, 5, 0, Math.PI * 2); c.strokeStyle = col || '#7df3ff'; c.lineWidth = 1.8; c.stroke(); c.beginPath(); c.moveTo(-7, 0); c.lineTo(7, 0); c.moveTo(0, -7); c.lineTo(0, 7); c.stroke(); break;
    default: circ(0, 0, 4, col || '#ffffff');
  }
  c.restore();
}
