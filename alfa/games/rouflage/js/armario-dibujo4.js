// Fans of Rouflage · ARMARIO (dibujo, 4): los papeles (la «piel» de la galleta) de los personajes del Rumble que faltaban. Cada uno es un
// color de fondo (COLOR_PAPEL) y, si lleva dibujo, una función que pinta sobre la galleta recortada (PAPEL; el cuerpo está más o menos entre
// x -14..14 e y -53..-6). Se añaden a las tablas de ARD.
'use strict';
(() => {
  const { shape, el, poly, line, dot, starPath, COLOR_PAPEL, PAPEL } = ARD;
  const motas = (c, col, pts, r) => { for (const [x, y] of pts) dot(c, x, y, r, col); };
  Object.assign(COLOR_PAPEL, {
    marine: '#2f6fe0', hacker: '#14532d', neon: '#111827', speedrun: '#ef4444', ragequit: '#b91c1c', recre: '#6d28d9', cupido: '#fbcfe8', escudo: '#cbd5e1',
    trueno: '#fde047', minotauro: '#7c4a2a', meme: '#f97316', synth: '#c026d3', stonks: '#16a34a', chonk: '#fb923c', hueso: '#f5f5f4', zombi: '#84cc16',
    espectro: '#e0f2fe', vikingo: '#a16207', directora: '#18181b', detective: '#a8a29e', paparazzi: '#fafafa', streamer: '#9146ff', martillo: '#475569', mecha: '#f472b6',
  });
  Object.assign(PAPEL, {
    marine: c => { c.fillStyle = '#1d4ed8'; c.fillRect(-30, -22, 60, 4); shape(c, poly(-6, -34, 6, -34, 0, -24), '#22e3ff', 1); },
    hacker: c => { c.fillStyle = '#4ade80'; c.font = '700 6px monospace'; c.textAlign = 'center'; for (let k = 0; k < 6; k++) for (let j = 0; j < 4; j++) c.fillText((k * 3 + j * 5) % 2 ? '1' : '0', -9 + j * 6, -46 + k * 7); },
    neon: c => { line(c, [-30, -36, 30, -36], '#22e3ff', 1.8); line(c, [-30, -20, 30, -20], '#ff3df0', 1.8); line(c, [-8, -52, -8, -6], 'rgba(34,227,255,.5)', 1); },
    speedrun: c => { line(c, [-30, -30, 30, -30], '#fff', 3); line(c, [-30, -21, 30, -21], '#fff', 3); },
    ragequit: c => { line(c, [-3, -52, 0, -44, -5, -39, -1, -32], '#450a0a', 1.4); line(c, [6, -26, 2, -20, 7, -14], '#450a0a', 1.2); },
    recre: c => { c.fillStyle = '#22e3ff'; for (const [x, y] of [[-8, -40], [4, -40], [-4, -34], [-8, -28], [4, -28], [-12, -22], [8, -22]]) c.fillRect(x, y, 4, 4); line(c, [-30, -16, 30, -16], '#a78bfa', 1.4); },
    escudo: c => { line(c, [0, -52, 0, -6], '#94a3b8', 1.6); line(c, [-30, -30, 30, -30], '#94a3b8', 1.6); shape(c, g => starPath(g, 0, -30, 5, 2, 5), '#2563eb', 1); },
    trueno: c => { shape(c, poly(3, -50, -6, -32, -1, -32, -5, -12, 7, -34, 1.6, -34, 6, -50), '#38bdf8', 1.2); },
    minotauro: c => { for (const y of [-40, -28, -16]) { c.beginPath(); c.moveTo(-30, y); c.quadraticCurveTo(0, y + 4, 30, y); c.strokeStyle = 'rgba(60,30,10,.5)'; c.lineWidth = 1.5; c.stroke(); } },
    meme: c => { c.fillStyle = '#fff'; c.font = '700 14px Arial Black, sans-serif'; c.textAlign = 'center'; c.strokeStyle = '#18181b'; c.lineWidth = 2.4; c.strokeText('?', 0, -22); c.fillText('?', 0, -22); },
    synth: c => { shape(c, g => g.arc(0, -22, 8, Math.PI, 0), '#fde047', 0); for (const y of [-20, -16, -12]) line(c, [-30, y, 30, y], '#22e3ff', 1.1); },
    stonks: c => { line(c, [-12, -12, -6, -24, -1, -18, 5, -34, 11, -28], '#fff', 2); shape(c, poly(8, -38, 14, -30, 8, -32), '#fff', 0); },
    chonk: c => { for (const x of [-10, -3, 4, 11]) line(c, [x, -48, x - 2, -8], '#9a3412', 2.2); },
    hueso: c => { for (const y of [-38, -30, -22, -14]) { c.beginPath(); c.arc(0, y, 11, Math.PI * 0.12, Math.PI * 0.88); c.strokeStyle = '#a8a29e'; c.lineWidth = 2; c.stroke(); } line(c, [0, -44, 0, -10], '#a8a29e', 2); },
    zombi: c => { shape(c, el(-7, -30, 4, 3.4), '#bef264', 0); line(c, [4, -40, 10, -32], '#365314', 1.2); for (const k of [0, 2, 4]) line(c, [3 + k, -42, 6 + k, -34], '#365314', 0.9); motas(c, '#4d7c0f', [[8, -18], [-6, -14]], 2); },
    espectro: c => { c.save(); c.globalAlpha = 0.7; for (const [x, y] of [[-6, -38], [6, -22], [-4, -14]]) { c.beginPath(); c.moveTo(x - 6, y); c.quadraticCurveTo(x, y - 6, x + 6, y); c.strokeStyle = '#7dd3fc'; c.lineWidth = 1.6; c.stroke(); } c.restore(); },
    vikingo: c => { c.fillStyle = '#713f12'; for (let x = -16; x < 16; x += 4) { c.beginPath(); c.moveTo(x, -34); c.lineTo(x + 2, -29); c.lineTo(x + 4, -34); c.fill(); } line(c, [-30, -25, 30, -25], '#451a03', 2.4); dot(c, 0, -25, 2.4, '#fbbf24'); },
    directora: c => { shape(c, g => starPath(g, 0, -30, 6, 2.6, 5), '#ffcb3d', 1); line(c, [-30, -16, 30, -16], '#ffcb3d', 1.2); },
    detective: c => { line(c, [0, -34, 0, -6], '#57534e', 1.4); motas(c, '#44403c', [[-3, -30], [-3, -22], [-3, -14]], 1.4); shape(c, poly(-6, -34, 0, -28, -6, -26), '#78716c', 1); shape(c, poly(6, -34, 0, -28, 6, -26), '#78716c', 1); },
    paparazzi: c => { for (const [x, y] of [[-8, -40], [7, -28], [-5, -16]]) { line(c, [x - 4, y, x + 4, y], '#facc15', 1.6); line(c, [x, y - 4, x, y + 4], '#facc15', 1.6); } },
    streamer: c => { motas(c, '#e9d5ff', [[-6, -36], [0, -36], [6, -36]], 1.3); line(c, [-9, -26, 8, -26], '#e9d5ff', 1.6); line(c, [-9, -20, 4, -20], '#e9d5ff', 1.6); dot(c, 8, -46, 2, '#ef4444'); },
    martillo: c => { c.beginPath(); c.arc(0, -30, 8, 0, Math.PI * 2); c.strokeStyle = '#ef4444'; c.lineWidth = 2; c.stroke(); line(c, [-5.6, -35.6, 5.6, -24.4], '#ef4444', 2); },
    mecha: c => { shape(c, el(-7, -38, 5, 4), '#18181b', 0); shape(c, el(7, -24, 5.4, 4.4), '#18181b', 0); shape(c, el(-5, -14, 3.6, 3), '#18181b', 0); },
  });
  // los corazones de CupidArcher
  PAPEL.cupido = c => { for (const [x, y, s] of [[-6, -36, 1], [6, -26, 0.8], [-3, -16, 0.7]]) shape(c, g => { g.moveTo(x, y + 4 * s); g.bezierCurveTo(x - 8 * s, y - 2 * s, x - 3 * s, y - 8 * s, x, y - 3 * s); g.bezierCurveTo(x + 3 * s, y - 8 * s, x + 8 * s, y - 2 * s, x, y + 4 * s); g.closePath(); }, '#ff4b5c', 1); };
})();
