// Fans Of · Arte: los dibujos de Héroes (cada uno se dibuja en el suelo, con el origen bajo los pies y la altura en y negativa)
'use strict';
Object.assign(ART, {
  arpia(c) {
    for (const sx of [-1, 1]) {
      c.save(); c.scale(sx, 1);
      shape(c, c => { c.moveTo(6, -26); c.quadraticCurveTo(22, -40, 28, -30); c.quadraticCurveTo(24, -28, 26, -22); c.quadraticCurveTo(21, -22, 21, -16); c.quadraticCurveTo(15, -18, 7, -16); c.closePath(); }, '#9a6634');
      line(c, [12, -26, 22, -30], '#6b4423', 1.2); line(c, [12, -22, 20, -22], '#6b4423', 1.2);
      c.restore();
    }
    line(c, [-4, -8, -6, -1], OL, 3.4); line(c, [-4, -8, -6, -1], '#ffb04f', 1.8);
    line(c, [4, -8, 6, -1], OL, 3.4); line(c, [4, -8, 6, -1], '#ffb04f', 1.8);
    for (const [x, d] of [[-6, -1], [6, 1]]) { line(c, [x, -1, x - 3 * d, 1], OL, 1.6); line(c, [x, -1, x + 2 * d, 1.4], OL, 1.6); }
    shape(c, c => { c.moveTo(-8, -24); c.quadraticCurveTo(-10, -10, -5, -7); c.lineTo(5, -7); c.quadraticCurveTo(10, -10, 8, -24); c.quadraticCurveTo(0, -27, -8, -24); c.closePath(); }, '#b5793c');
    line(c, [-5, -15, 5, -15], '#8a5a2b', 1.2); line(c, [-5, -11, 5, -11], '#8a5a2b', 1.2);
    shape(c, c => { c.moveTo(-10, -30); c.quadraticCurveTo(-14, -48, 0, -47); c.quadraticCurveTo(14, -48, 10, -30); c.quadraticCurveTo(12, -22, 7, -24); c.quadraticCurveTo(0, -20, -7, -24); c.quadraticCurveTo(-12, -22, -10, -30); c.closePath(); }, '#4a2f6b');
    shape(c, el(0, -33, 7.4, 8), '#f4d2b0', 1.8);
    line(c, [-5.4, -37, -1.6, -35.2], OL, 1.6); line(c, [5.4, -37, 1.6, -35.2], OL, 1.6);
    shape(c, el(-3, -33.4, 1.6, 1.8), '#ffcb3d', 1); shape(c, el(3, -33.4, 1.6, 1.8), '#ffcb3d', 1);
    shape(c, poly(-1.8, -30.8, 1.8, -30.8, 0, -28), '#ffb04f', 1.1);
    shape(c, c => { c.moveTo(-9, -40); c.quadraticCurveTo(-4, -45, 0, -41); c.quadraticCurveTo(4, -46, 9, -40); c.quadraticCurveTo(5, -42, 0, -39); c.quadraticCurveTo(-5, -42, -9, -40); c.closePath(); }, '#4a2f6b', 0);
  },
  sp_rayo(c) { spBg(c, 'd'); for (const [x, y, r] of [[-7, -36, 6], [1, -38.5, 7], [8, -35.5, 5.4]]) shape(c, el(x, y, r, r * 0.75), '#cbd5e1', 1.6); shape(c, poly(2, -34, -7, -20, -1, -20, -5, -6, 9, -24, 2, -24, 6, -34), '#ffe14d', 1.8); },
  sp_ambrosia(c) { spBg(c, 'h'); shape(c, c => { c.moveTo(-11, -35); c.lineTo(11, -35); c.quadraticCurveTo(11, -22, 2, -20); c.lineTo(2, -13); c.lineTo(7, -10); c.lineTo(-7, -10); c.lineTo(-2, -13); c.lineTo(-2, -20); c.quadraticCurveTo(-11, -22, -11, -35); c.closePath(); }, '#ffcb3d', 2); shape(c, el(0, -34.6, 11, 2.6), '#fff1c9', 1.4); shape(c, el(0, -28, 3.2, 3.2), '#ff5fa8', 1.2); for (const [x, y] of [[-13, -40], [13, -42], [15, -24]]) { c.beginPath(); starPath(c, x, y, 3.2, 1.3, 4); c.fillStyle = '#fff6ea'; c.fill(); } },
  sp_nerfeo(c) { spBg(c, 'c'); shape(c, poly(-6, -40, 6, -40, 6, -24, 12, -24, 0, -10, -12, -24, -6, -24), '#63cfe0', 2); otxt(c, '-40%', 0, -31, 7.4, OL); },
  /* ---------- Héroes ---------- */
  epicchampion(c) {
    shape(c, c => { c.moveTo(-11, -38); c.lineTo(11, -38); c.lineTo(20, -3); c.quadraticCurveTo(0, 2, -20, -3); c.closePath(); }, '#2563eb');
    c.save(); c.translate(17, -27); c.rotate(0.32);
    shape(c, poly(-2.2, -2, -2.6, -34, 0, -40, 2.6, -34, 2.2, -2), '#eef2f7', 1.5);
    line(c, [0, -34, 0, -4], '#9ca3af', 1);
    shape(c, rr(-7.4, -3, 14.8, 3.8, 1.4), '#ffcb3d', 1.4);
    shape(c, rr(-1.7, 0.6, 3.4, 8, 1), '#7c2d12', 1.2); dot(c, 0, 10, 2.2, '#ffcb3d');
    c.restore();
    shape(c, c => { c.moveTo(-13, -38); c.quadraticCurveTo(-16, -18, -13, -4); c.quadraticCurveTo(0, 0, 13, -4); c.quadraticCurveTo(16, -18, 13, -38); c.quadraticCurveTo(0, -42, -13, -38); c.closePath(); }, '#facc15');
    line(c, [0, -38, 0, -19], '#ca8a04', 1.4);
    shape(c, c => starPath(c, 0, -29, 4.2, 1.9), '#fff7d6', 1);
    shape(c, rr(-13.4, -17, 26.8, 4.2, 1.2), '#7c2d12', 1.3); shape(c, rr(-2.6, -17.6, 5.2, 5.2, 1), '#ffcb3d', 1.1);
    shape(c, el(-13, -37, 7.2, 5, -0.2), '#eab308'); shape(c, el(13, -37, 7.2, 5, 0.2), '#eab308');
    shape(c, el(16.4, -24.6, 3.8, 3.8), '#f1c27d', 1.4);
    shape(c, el(-16.5, -21, 10, 11.4), '#2563eb');
    shape(c, el(-16.5, -21, 7, 8.2), '#facc15', 1.4);
    shape(c, c => starPath(c, -16.5, -21, 4.2, 1.9), '#2563eb', 1);
    shape(c, el(0, -50, 9.6, 9.4), '#f1c27d');
    dot(c, -3.2, -49.4, 1.5, OL); dot(c, 4, -49.4, 1.5, OL); dot(c, -2.8, -49.9, 0.5, '#fff'); dot(c, 4.4, -49.9, 0.5, '#fff');
    c.beginPath(); c.arc(0.6, -46, 3.2, 0.3, Math.PI - 0.3); c.strokeStyle = OL; c.lineWidth = 1.4; c.stroke();
    shape(c, c => { c.moveTo(-10.4, -49); c.quadraticCurveTo(-10.8, -61.5, 0, -61.6); c.quadraticCurveTo(10.8, -61.5, 10.4, -49); c.lineTo(8, -49); c.lineTo(8, -53.6); c.lineTo(-8, -53.6); c.lineTo(-8, -49); c.closePath(); }, '#facc15', 1.6);
    line(c, [-8, -57.4, 8, -57.4], '#ca8a04', 1.2);
    shape(c, c => { c.moveTo(-3, -60.6); c.quadraticCurveTo(-5, -71, 9, -72); c.quadraticCurveTo(3, -68, 5.2, -61); c.closePath(); }, '#ef4444', 1.5);
  },
  cupidarcher(c) {
    shape(c, c => { c.moveTo(-4, -26); c.quadraticCurveTo(-18, -38, -23, -25); c.quadraticCurveTo(-17, -25, -15.5, -20); c.quadraticCurveTo(-10, -23, -4, -19.5); c.closePath(); }, '#fff', 1.6);
    line(c, [-16.5, -29, -12, -22.5], '#dbe3f0', 1); line(c, [-20, -26, -15, -22], '#dbe3f0', 1);
    shape(c, el(-4.2, -3.8, 2.7, 3.3, 0.25), '#fbcfe8', 1.4); shape(c, el(3.6, -3.4, 2.7, 3.3, -0.2), '#fbcfe8', 1.4);
    shape(c, el(0, -13.5, 8.6, 9), '#fbcfe8');
    shape(c, c => { c.moveTo(-8.4, -12); c.quadraticCurveTo(0, -8, 8.4, -12); c.quadraticCurveTo(7, -4.4, 0, -4.4); c.quadraticCurveTo(-7, -4.4, -8.4, -12); c.closePath(); }, '#fff', 1.4);
    c.beginPath(); c.arc(9, -18, 10, -1.1, 1.1); c.strokeStyle = OL; c.lineWidth = 3.8; c.stroke(); c.strokeStyle = '#ffcb3d'; c.lineWidth = 2; c.stroke();
    line(c, [13.5, -26.9, 13.5, -9.1], '#fff', 0.9);
    line(c, [4, -18, 21, -18], OL, 2.6); line(c, [4, -18, 21, -18], '#fde68a', 1.3);
    shape(c, poly(4, -18, 1.5, -20.6, 1.5, -15.4), '#f472b6', 1);
    shape(c, c => { c.save(); c.translate(23.4, -18); c.rotate(-Math.PI / 2); heartPath(c, 0, 0, 2.6); c.restore(); }, '#ff3d7a', 1.2);
    shape(c, el(9.4, -17.2, 2.9, 2.9), '#fbcfe8', 1.3);
    shape(c, el(0, -28, 8, 7.6), '#fbcfe8');
    for (const [hx, hy] of [[-6.4, -32.6], [-2.4, -35.2], [2.6, -35.2], [6.4, -32.6]]) shape(c, el(hx, hy, 3, 2.8), '#fcd34d', 1.3);
    dot(c, -2.4, -27.6, 1.25, OL); dot(c, 3.2, -27.6, 1.25, OL); dot(c, -2.1, -28.1, 0.45, '#fff'); dot(c, 3.5, -28.1, 0.45, '#fff');
    c.beginPath(); c.arc(0.4, -25.4, 1.8, 0.3, Math.PI - 0.3); c.strokeStyle = OL; c.lineWidth = 1; c.stroke();
    shape(c, el(-5.4, -25.2, 1.8, 1.1), 'rgba(255,90,140,.55)', 0); shape(c, el(6, -25.2, 1.8, 1.1), 'rgba(255,90,140,.55)', 0);
    c.beginPath(); c.ellipse(0, -39.6, 6.4, 1.9, 0, 0, Math.PI * 2); c.strokeStyle = OL; c.lineWidth = 3; c.stroke(); c.strokeStyle = '#ffcb3d'; c.lineWidth = 1.6; c.stroke();
  },
  hoplite(c) {
    line(c, [11, -2, 13.5, -47], OL, 3.4); line(c, [11, -2, 13.5, -47], '#8a5a33', 1.7);
    shape(c, poly(11.8, -45.5, 13.6, -54, 15.4, -45.8), '#e5e7eb', 1.3);
    shape(c, c => { c.moveTo(-7, -21); c.lineTo(7, -21); c.lineTo(9, -3); c.lineTo(5, -5); c.lineTo(2, -3); c.lineTo(-1, -5); c.lineTo(-4, -3); c.lineTo(-9, -3); c.closePath(); }, '#dc2626');
    shape(c, rr(-7.6, -21.5, 15.2, 9.5, 2.4), '#d97706', 1.4);
    shape(c, el(11.8, -18.6, 2.7, 2.7), '#e0a872', 1.3);
    shape(c, el(0.5, -27, 7, 6.6), '#e0a872');
    dot(c, 4, -27.4, 1.15, OL);
    shape(c, c => { c.moveTo(-7.4, -24.5); c.quadraticCurveTo(-8, -35.4, 0.5, -35.4); c.quadraticCurveTo(7.8, -35.4, 8, -29.5); c.lineTo(1.8, -29.5); c.lineTo(1.8, -24); c.lineTo(-2, -21.6); c.lineTo(-7.4, -21.6); c.closePath(); }, '#d97706', 1.5);
    line(c, [-6, -30, 1, -30], '#fbbf24', 1);
    shape(c, c => { c.moveTo(-8.6, -31); c.quadraticCurveTo(-7, -40.6, 5, -38.6); c.quadraticCurveTo(0, -36, -1.4, -33.6); c.closePath(); }, '#dc2626', 1.4);
    shape(c, el(-5.6, -13, 8.6, 9.6), '#b45309');
    shape(c, el(-5.6, -13, 6.3, 7.2), '#f59e0b', 1.2);
    shape(c, c => starPath(c, -5.6, -13, 3.4, 1.5), '#b45309', 0.9);
  },
  shieldmaiden(c) {
    shape(c, el(-8.4, -24, 2.6, 7.4, 0.25), '#fcd34d', 1.4);
    shape(c, c => { c.moveTo(-9, -30); c.lineTo(9, -30); c.lineTo(12, -3); c.quadraticCurveTo(0, 0, -12, -3); c.closePath(); }, '#3b82f6');
    shape(c, rr(-9.4, -30.5, 18.8, 13, 3.4), '#9ca3af', 1.4);
    c.strokeStyle = '#6b7280'; c.lineWidth = 0.8; c.beginPath(); for (let yy = -28; yy < -19; yy += 2.6) for (let xx = -7.5; xx < 8; xx += 2.6) { c.moveTo(xx + 1.1, yy); c.arc(xx, yy, 1.1, 0, Math.PI); } c.stroke();
    shape(c, rr(-10, -18.5, 20, 3.4, 1.2), '#7c2d12', 1.2); dot(c, 0, -16.8, 1.3, '#ffcb3d');
    shape(c, el(-11, -21, 3.4, 7, 0.3), '#9ca3af'); shape(c, el(-12, -14.4, 2.8, 2.8), '#f1c27d', 1.3);
    shape(c, el(0, -37, 8.4, 8), '#f1c27d');
    shape(c, c => { c.moveTo(-8.6, -37); c.quadraticCurveTo(-10, -30, -6, -27); c.quadraticCurveTo(-5.6, -32, -6.2, -35); c.closePath(); }, '#fcd34d', 1.3);
    shape(c, el(7.6, -28.6, 2.4, 5, -0.15), '#fcd34d', 1.3); line(c, [6.4, -31, 8.8, -30], '#e0a92a', 0.9); line(c, [6.4, -28, 8.8, -27], '#e0a92a', 0.9);
    dot(c, -2.6, -36.4, 1.3, OL); dot(c, 3.6, -36.4, 1.3, OL);
    line(c, [-4.6, -39, -1, -38.2], OL, 1.2); line(c, [5.6, -39, 2, -38.2], OL, 1.2);
    c.beginPath(); c.moveTo(-1.6, -32.4); c.lineTo(3, -32.6); c.strokeStyle = OL; c.lineWidth = 1.2; c.stroke();
    shape(c, c => { c.moveTo(-9, -38); c.quadraticCurveTo(-9.4, -47, 0, -47.2); c.quadraticCurveTo(9.4, -47, 9, -38); c.closePath(); }, '#9ca3af', 1.6);
    line(c, [0, -47, 0, -38.6], '#6b7280', 1.2);
    shape(c, c => { c.moveTo(-8.6, -42); c.quadraticCurveTo(-16, -45, -18, -52); c.quadraticCurveTo(-13, -49, -11, -50); c.quadraticCurveTo(-12, -46, -7.6, -44.6); c.closePath(); }, '#fff', 1.4);
    shape(c, c => { c.moveTo(8.6, -42); c.quadraticCurveTo(16, -45, 18, -52); c.quadraticCurveTo(13, -49, 11, -50); c.quadraticCurveTo(12, -46, 7.6, -44.6); c.closePath(); }, '#fff', 1.4);
    shape(c, el(9.5, -18, 11, 12), '#a16207');
    c.save(); c.beginPath(); c.ellipse(9.5, -18, 11, 12, 0, 0, Math.PI * 2); c.clip(); c.strokeStyle = '#7c4a12'; c.lineWidth = 1.1; c.beginPath(); for (const xx of [3, 7.5, 12, 16.5]) { c.moveTo(xx, -31); c.lineTo(xx, -5); } c.stroke(); c.restore();
    c.beginPath(); c.ellipse(9.5, -18, 9.6, 10.6, 0, 0, Math.PI * 2); c.strokeStyle = '#9ca3af'; c.lineWidth = 2; c.stroke();
    shape(c, el(9.5, -18, 3.4, 3.6), '#d1d5db', 1.3);
    shape(c, el(-2.4, -18.6, 2.8, 2.8), '#f1c27d', 1.3);
  },
  thundergod(c) {
    const cl = [[-11, -6, 8, 5], [0, -5, 10, 6], [11, -6, 8, 5], [-5, -10, 7, 5.4], [6, -10.5, 7, 5.4]];
    for (const [x, y, rx, ry] of cl) { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.strokeStyle = OL; c.lineWidth = 4.4; c.stroke(); }
    for (const [x, y, rx, ry] of cl) shape(c, el(x, y, rx, ry), '#eef2f7', 0);
    for (const [x, y, rx] of [[-4, -11, 4], [7, -11.6, 3.6]]) shape(c, el(x, y, rx, 2), '#fff', 0);
    shape(c, c => { c.moveTo(-10, -35); c.lineTo(10, -35); c.lineTo(12, -11); c.quadraticCurveTo(0, -8, -12, -11); c.closePath(); }, '#f5f5f4');
    shape(c, poly(-10, -34, -4.6, -35, 10.6, -13, 5.4, -11.2), '#2563eb', 1.2);
    shape(c, el(-12.5, -24, 4, 7.6, 0.2), '#f1c27d'); shape(c, el(-13.2, -16.6, 3, 3), '#f1c27d', 1.3);
    shape(c, el(13, -37, 3.8, 7.4, -0.5), '#f1c27d');
    shape(c, poly(13.5, -63, 21, -63, 17, -55, 22.5, -55, 11.5, -40, 15, -50.6, 10, -50.6), '#ffe14d', 1.4);
    shape(c, el(16, -45, 3.2, 3.2), '#f1c27d', 1.3);
    shape(c, el(0, -42, 8, 7.6), '#f1c27d');
    shape(c, c => { c.moveTo(-8.2, -43); c.quadraticCurveTo(-9, -51.5, 0, -51.4); c.quadraticCurveTo(9, -51.5, 8.2, -43); c.quadraticCurveTo(5, -47, 0, -47); c.quadraticCurveTo(-5, -47, -8.2, -43); c.closePath(); }, '#e5e7eb', 1.5);
    shape(c, c => { c.moveTo(-8, -41); c.quadraticCurveTo(-9.5, -29, 0, -26); c.quadraticCurveTo(9.5, -29, 8, -41); c.quadraticCurveTo(4.5, -37.2, 0.5, -38.4); c.quadraticCurveTo(-4, -37.2, -8, -41); c.closePath(); }, '#f5f5f4', 1.5);
    line(c, [-3, -35, -1, -31], '#d1d5db', 1); line(c, [3, -35, 2, -31], '#d1d5db', 1);
    line(c, [-5.4, -45, -1.4, -43.6], OL, 1.8); line(c, [6, -45, 2, -43.6], OL, 1.8);
    dot(c, -2.8, -42, 1.3, '#22e3ff'); dot(c, 3.6, -42, 1.3, '#22e3ff');
    shape(c, el(0.4, -39.6, 2.6, 1.4), '#f5f5f4', 1);
    for (let i = 0; i < 5; i++) { const a = Math.PI * (1.15 + i * 0.17); shape(c, el(Math.cos(a) * 8.4, -44 + Math.sin(a) * 6.4, 2, 1, a + Math.PI / 2), '#ffcb3d', 0.9); }
  },
  medusa(c) {
    shape(c, c => { c.moveTo(-8, -26); c.lineTo(8, -26); c.lineTo(11, -3); c.quadraticCurveTo(0, 0, -11, -3); c.closePath(); }, '#a855f7');
    shape(c, poly(-8, -25, -3, -26, 9, -6, 4, -4), '#ffcb3d', 1.1);
    shape(c, el(-10, -17, 3, 6.5, 0.25), '#86efac'); shape(c, el(-11, -11.4, 2.5, 2.5), '#86efac', 1.3);
    const snakes = [[-6, -38, -13, -44, -10, -50], [-2, -40, -5, -48, 0, -51], [2.5, -40, 4, -48, 9, -50], [6, -37, 12, -42, 13, -48], [-7.4, -33, -14, -35, -16, -40]];
    for (const [x0, y0, x1, y1, x2, y2] of snakes) { c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x1, y1, x2, y2); c.strokeStyle = OL; c.lineWidth = 4.4; c.stroke(); c.strokeStyle = '#16a34a'; c.lineWidth = 2.4; c.stroke(); shape(c, el(x2, y2, 2.6, 2), '#22c55e', 1.3); dot(c, x2 + 0.8, y2 - 0.6, 0.6, '#ffe14d'); }
    shape(c, el(0, -33, 7.8, 7.4), '#86efac');
    shape(c, rr(-6.8, -35.6, 6.2, 3.8, 1.4), '#111827', 1.1); shape(c, rr(1.2, -35.6, 6.2, 3.8, 1.4), '#111827', 1.1); line(c, [-0.6, -34.6, 1.2, -34.6], OL, 1);
    line(c, [-5.4, -35, -3, -35], '#a855f7', 0.9); line(c, [2.6, -35, 5, -35], '#a855f7', 0.9);
    shape(c, c => { c.moveTo(-2.2, -29.4); c.quadraticCurveTo(1, -27.6, 3.6, -29.8); c.quadraticCurveTo(1, -28.8, -2.2, -29.4); c.closePath(); }, '#be123c', 1);
    shape(c, el(10, -23, 3, 6, -0.6), '#86efac'); shape(c, el(12.6, -28, 2.6, 2.6), '#86efac', 1.3);
  },
  minotaur(c) {
    line(c, [12, -6, 21, -50], OL, 4.6); line(c, [12, -6, 21, -50], '#7c4a1e', 2.6);
    c.save(); c.translate(20.4, -46); c.rotate(0.2);
    shape(c, c => { c.moveTo(0, -3); c.quadraticCurveTo(10, -13, 13.5, -2); c.quadraticCurveTo(10, 9, 0, 3); c.closePath(); }, '#d1d5db', 1.6);
    shape(c, c => { c.moveTo(0, -3); c.quadraticCurveTo(-10, -13, -13.5, -2); c.quadraticCurveTo(-10, 9, 0, 3); c.closePath(); }, '#d1d5db', 1.6);
    c.restore();
    shape(c, c => { c.moveTo(-15, -38); c.quadraticCurveTo(-20.5, -20, -15.5, -4); c.quadraticCurveTo(0, 0, 15.5, -4); c.quadraticCurveTo(20.5, -20, 15, -38); c.quadraticCurveTo(0, -44, -15, -38); c.closePath(); }, '#92400e');
    shape(c, el(0, -27, 9, 8), '#b45309', 0);
    line(c, [-12, -38, 12, -10], OL, 4); line(c, [-12, -38, 12, -10], '#3b2a1e', 2.4);
    shape(c, rr(-12.5, -12.5, 25, 8, 2), '#3b2a1e', 1.5);
    shape(c, el(-17.5, -24, 6, 11, 0.2), '#92400e'); shape(c, el(-18.5, -13.4, 4.4, 4.4), '#7c2d12', 1.5);
    shape(c, el(15.5, -21, 5.6, 10, -0.3), '#92400e'); shape(c, el(13.8, -13.6, 4.6, 4.6), '#7c2d12', 1.5);
    shape(c, c => { c.moveTo(-7, -52); c.quadraticCurveTo(-17, -52, -19, -61); c.quadraticCurveTo(-13, -57, -8, -57.4); c.closePath(); }, '#f5f0dc', 1.5);
    shape(c, c => { c.moveTo(7, -52); c.quadraticCurveTo(17, -52, 19, -61); c.quadraticCurveTo(13, -57, 8, -57.4); c.closePath(); }, '#f5f0dc', 1.5);
    shape(c, el(-10, -49, 3.4, 2, -0.4), '#7c2d12', 1.3); shape(c, el(10, -49, 3.4, 2, 0.4), '#7c2d12', 1.3);
    shape(c, el(0, -47, 9.6, 9), '#7c2d12');
    shape(c, el(2.6, -41.4, 7.2, 5), '#d6a77a');
    dot(c, 0.4, -41.6, 1.1, OL); dot(c, 5, -41.6, 1.1, OL);
    c.beginPath(); c.arc(2.6, -38, 2.6, 0.2, Math.PI - 0.2); c.strokeStyle = OL; c.lineWidth = 2.2; c.stroke(); c.strokeStyle = '#ffcb3d'; c.lineWidth = 1.2; c.stroke();
    shape(c, el(-3.4, -49.6, 2.2, 2), '#fff', 1); shape(c, el(4, -49.6, 2.2, 2), '#fff', 1);
    dot(c, -2.8, -49.4, 1, '#dc2626'); dot(c, 4.6, -49.4, 1, '#dc2626');
    line(c, [-6, -52.4, -1.2, -51], OL, 1.8); line(c, [7, -52.4, 2.2, -51], OL, 1.8);
  },
  h_tower(c) {
    shape(c, rr(-19, -9, 38, 9, 2), '#d6d3cb');
    shape(c, rr(-16, -15, 32, 7, 2), '#e7e5df');
    shape(c, rr(-11, -74, 22, 60, 2), '#f5f3ee');
    c.strokeStyle = '#cfcac0'; c.lineWidth = 1.4; c.beginPath(); for (const xx of [-6, -1.5, 3, 7.5]) { c.moveTo(xx, -72); c.lineTo(xx, -16); } c.stroke();
    shape(c, rr(-11, -74, 22, 60, 2), null, 2.2);
    shape(c, rr(-17, -82, 34, 8, 3), '#f5f3ee');
    for (const sx of [-1, 1]) { shape(c, el(sx * 15, -76, 4.2, 4.2), '#f5f3ee', 1.6); c.beginPath(); c.arc(sx * 15, -76, 1.8, 0, Math.PI * 1.6); c.strokeStyle = OL; c.lineWidth = 1; c.stroke(); }
    shape(c, c => { c.moveTo(-14, -83); c.lineTo(14, -83); c.lineTo(10, -91); c.lineTo(-10, -91); c.closePath(); }, '#ffcb3d', 1.6);
    line(c, [-12, -87, 12, -87], '#ca8a04', 1.2);
    shape(c, c => { c.moveTo(-8, -91); c.quadraticCurveTo(-11, -98, -4, -104); c.quadraticCurveTo(-3, -98, 0, -97); c.quadraticCurveTo(0, -105, 5, -108); c.quadraticCurveTo(4, -100, 8, -97); c.quadraticCurveTo(11, -94, 8, -91); c.closePath(); }, '#ff9f1c', 1.6);
    shape(c, c => { c.moveTo(-4, -91); c.quadraticCurveTo(-5, -97, 0, -100); c.quadraticCurveTo(1, -96, 4, -94); c.quadraticCurveTo(5.4, -92, 4, -91); c.closePath(); }, '#ffe8a3', 0);
    shape(c, el(-12, -2, 6, 3), '#6aa83a', 1.2); shape(c, el(13, -2, 6.6, 3), '#6aa83a', 1.2);
  },
  h_base(c) {
    shape(c, rr(-58, -10, 116, 11, 2), '#cfcac0');
    shape(c, rr(-52, -17, 104, 8, 2), '#e7e5df');
    shape(c, rr(-44, -62, 88, 46, 2), '#b9b2a4');
    shape(c, c => { c.moveTo(-12, -17); c.lineTo(-12, -40); c.arc(0, -40, 12, Math.PI, 0); c.lineTo(12, -17); c.closePath(); }, '#2a1a10', 1.6);
    shape(c, c => { c.moveTo(-8, -17); c.lineTo(-8, -39); c.arc(0, -39, 8, Math.PI, 0); c.lineTo(8, -17); c.closePath(); }, '#ff9f1c', 0);
    shape(c, c => { c.moveTo(-5, -17); c.lineTo(-5, -34); c.arc(0, -34, 5, Math.PI, 0); c.lineTo(5, -17); c.closePath(); }, '#ffe8a3', 0);
    for (const cx of [-42, -26, 26, 42]) {
      shape(c, rr(cx - 5.5, -64, 11, 47, 1.5), '#f5f3ee');
      c.strokeStyle = '#cfcac0'; c.lineWidth = 1; c.beginPath(); c.moveTo(cx - 2, -62); c.lineTo(cx - 2, -19); c.moveTo(cx + 2, -62); c.lineTo(cx + 2, -19); c.stroke();
      shape(c, rr(cx - 5.5, -64, 11, 47, 1.5), null, 1.8);
      shape(c, rr(cx - 7.5, -67, 15, 4, 1.4), '#f5f3ee', 1.5);
    }
    shape(c, rr(-54, -76, 108, 10, 2), '#f5f3ee');
    c.fillStyle = '#ffcb3d'; for (let x = -50; x < 50; x += 8) c.fillRect(x, -72.6, 4, 3);
    shape(c, poly(-58, -76, 0, -102, 58, -76), '#f5f3ee', 2.2);
    shape(c, poly(-44, -79, 0, -97, 44, -79), '#e7e5df', 0);
    shape(c, c => starPath(c, 0, -86, 7, 3), '#ffcb3d', 1.4);
    shape(c, el(0, -104, 5, 4), '#ffcb3d', 1.4);
    shape(c, poly(-4, -106, -13, -112, -8, -104), '#ffcb3d', 1.3); shape(c, poly(4, -106, 13, -112, 8, -104), '#ffcb3d', 1.3);
    shape(c, el(0, -110, 3.4, 3.4), '#ffcb3d', 1.3);
    for (const sx of [-1, 1]) { shape(c, el(sx * 54, -6, 6, 3), '#6aa83a', 1.2); }
  },
});
