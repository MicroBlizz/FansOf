// Fans Of · Arte: los dibujos de Memes (cada uno se dibuja en el suelo, con el origen bajo los pies y la altura en y negativa)
'use strict';
Object.assign(ART, {
  clickbait(c) {
    line(c, [-5, -10, -6, -1], OL, 3.4); line(c, [5, -10, 6, -1], OL, 3.4);
    line(c, [-14, -24, -19, -16], OL, 3.4); line(c, [14, -24, 19, -30], OL, 3.4);
    shape(c, rr(-16, -42, 32, 32, 3), '#fff6ea', 2.2);
    shape(c, rr(-13.4, -39.4, 26.8, 26.8, 1.6), '#ffe14d', 1.2);
    shape(c, el(-3, -27, 7.6, 8.2), '#f1c9a5', 1.6);
    shape(c, el(-5.6, -29, 2.2, 2.6), '#fff', 1); shape(c, el(-0.4, -29, 2.2, 2.6), '#fff', 1);
    dot(c, -5.6, -28.6, 1, OL); dot(c, -0.4, -28.6, 1, OL);
    shape(c, el(-3, -23.2, 2, 2.6), '#5a1530', 1.1);
    c.beginPath(); c.arc(-3, -27, 11, 0, Math.PI * 2); c.lineWidth = 3.4; c.strokeStyle = OL; c.stroke(); c.lineWidth = 1.8; c.strokeStyle = '#ff3348'; c.stroke();
    c.save(); c.translate(9, -19); c.rotate(-0.7);
    shape(c, poly(-1.6, 0, 1.6, 0, 1.6, -7, 4, -7, 0, -12, -4, -7, -1.6, -7), '#ff3348', 1.3);
    c.restore();
    txt(c, '!!!', 8, -35, 7, '#ff3348');
  },
  sp_gatos(c) { spBg(c, 'd'); for (const [x, y, s] of [[-6, -22, 1], [9, -34, 0.55], [-12, -37, 0.45]]) { c.save(); c.translate(x, y); c.scale(s, s); shape(c, poly(-9, -4, -8, -14, -2, -8), '#ffb04f', 1.8); shape(c, poly(9, -4, 8, -14, 2, -8), '#ffb04f', 1.8); shape(c, el(0, 0, 11, 9), '#ffb04f', 2); line(c, [-6.4, -3.2, -2.4, -1.6], OL, 1.6); line(c, [6.4, -3.2, 2.4, -1.6], OL, 1.6); dot(c, -4, 0.6, 1.4, OL); dot(c, 4, 0.6, 1.4, OL); shape(c, poly(-1.4, 3, 1.4, 3, 0, 4.6), '#ff7aa8', 0.8); c.restore(); } },
  sp_likes(c) { spBg(c, 'h'); shape(c, c => { c.moveTo(0, -11); c.bezierCurveTo(-18, -22, -14, -40, 0, -32); c.bezierCurveTo(14, -40, 18, -22, 0, -11); c.closePath(); }, '#ff5fa8', 2.2); shape(c, el(-6, -29, 3, 2, -0.6), 'rgba(255,255,255,.6)', 0); otxt(c, '+999', 0, -6, 7.2, '#fff6ea'); },
  sp_confusion(c) { spBg(c, 'c'); c.beginPath(); for (let a = 0; a < 5.4 * Math.PI; a += 0.2) { const q = 0.85 * a; c.lineTo(Math.cos(a) * q, -22 + Math.sin(a) * q); } c.lineWidth = 4; c.strokeStyle = OL; c.stroke(); c.lineWidth = 2.2; c.strokeStyle = '#ff3df0'; c.stroke(); otxt(c, '?', -13, -36, 11, '#fff6ea'); otxt(c, '?', 14, -10, 9, '#fff6ea'); },
  /* ---------- Memes ---------- */
  memelord(c) {
    shape(c, c => { c.moveTo(-11, -36); c.lineTo(11, -36); c.lineTo(19, -3); c.quadraticCurveTo(0, 2, -19, -3); c.closePath(); }, '#16a34a');
    shape(c, c => { c.moveTo(-12, -36); c.quadraticCurveTo(-15, -16, -13.5, -3); c.quadraticCurveTo(0, 0, 13.5, -3); c.quadraticCurveTo(15, -16, 12, -36); c.quadraticCurveTo(0, -39, -12, -36); c.closePath(); }, '#7c3aed');
    line(c, [0, -36, 0, -3], '#ffcb3d', 1.8);
    for (const yy of [-28, -20, -12]) dot(c, 0, yy, 1.5, '#ffe14d');
    shape(c, el(-6, -26, 3.6, 3.6), '#ffe14d', 1.2); dot(c, -7.2, -26.8, 0.6, OL); dot(c, -4.8, -26.8, 0.6, OL); c.beginPath(); c.arc(-6, -25.8, 1.8, 0.2, Math.PI - 0.2); c.strokeStyle = OL; c.lineWidth = 0.8; c.stroke();
    shape(c, el(-14.5, -23, 4, 8, 0.25), '#7c3aed'); shape(c, el(-15.6, -15.6, 3.2, 3.2), '#f1c27d', 1.4);
    shape(c, el(13.5, -33, 4, 8, -0.6), '#7c3aed');
    c.save(); c.translate(19, -45); c.rotate(0.25);
    shape(c, rr(-5.4, -7.4, 10.8, 14.8, 1.8), '#fff', 1.4); shape(c, rr(-3.8, -5.8, 7.6, 11.6, 1.2), '#22c55e', 1);
    txt(c, '?', 0, 0.4, 8, '#fff');
    c.restore();
    shape(c, el(16.6, -39, 3.2, 3.2), '#f1c27d', 1.4);
    shape(c, el(0, -44, 9.2, 8.8), '#f1c27d');
    c.fillStyle = OL; c.fillRect(-8.4, -47.8, 17.4, 1.4); c.fillRect(-7.4, -46.6, 6.4, 3.2); c.fillRect(1.4, -46.6, 6.4, 3.2); c.fillRect(-6.4, -43.4, 4.2, 1.2); c.fillRect(2.4, -43.4, 4.2, 1.2);
    c.fillStyle = '#fff'; c.fillRect(-6.4, -46, 1.2, 1.2); c.fillRect(2.4, -46, 1.2, 1.2);
    c.beginPath(); c.moveTo(-2.4, -39.4); c.quadraticCurveTo(1.4, -37.2, 4.8, -40); c.strokeStyle = OL; c.lineWidth = 1.3; c.stroke();
    shape(c, el(0, -51.4, 14, 3), '#27272a', 1.6);
    shape(c, c => { c.moveTo(-8.4, -52); c.quadraticCurveTo(-9, -62.5, -2, -61.6); c.lineTo(0, -59.4); c.lineTo(2, -61.6); c.quadraticCurveTo(9, -62.5, 8.4, -52); c.closePath(); }, '#27272a', 1.6);
    shape(c, rr(-8.4, -55.4, 16.8, 3, 1), '#ffcb3d', 1);
  },
  suchdog(c) {
    c.beginPath(); c.arc(-9.5, -18.5, 4.6, 0.6, Math.PI * 1.85); c.strokeStyle = OL; c.lineWidth = 5.6; c.stroke(); c.strokeStyle = '#e8a04a'; c.lineWidth = 3.4; c.stroke();
    dot(c, -6, -22.8, 1.7, '#fff7ea');
    shape(c, el(0, -11, 10, 8.6), '#e8a04a');
    shape(c, el(3.4, -9.6, 5.6, 6.4), '#fff7ea', 0);
    shape(c, el(3.5, -24, 9, 8), '#e8a04a');
    shape(c, poly(-2.6, -28.6, -2, -37, 3.6, -30.6), '#e8a04a', 1.6); shape(c, poly(5.4, -30.8, 10, -37.2, 11.4, -27.6), '#e8a04a', 1.6);
    shape(c, poly(-1.6, -30, -1.4, -34.4, 1.6, -30.8), '#fff7ea', 0); shape(c, poly(7, -31, 9.6, -34.6, 10.2, -29.4), '#fff7ea', 0);
    shape(c, el(7.4, -20.4, 6, 4.2), '#fff7ea', 0);
    shape(c, el(11.6, -21.6, 3.6, 2.6), '#fff7ea', 1.2); dot(c, 14.4, -22.4, 1.5, OL);
    shape(c, el(3, -25.6, 2.4, 2), '#fff', 1); dot(c, 4.3, -25.6, 1, OL);
    shape(c, el(8.6, -25.6, 2.2, 1.9), '#fff', 1); dot(c, 9.8, -25.6, 0.9, OL);
    dot(c, 2.4, -28.6, 1.1, '#fff7ea'); dot(c, 8.4, -28.6, 1, '#fff7ea');
    c.beginPath(); c.moveTo(9.6, -19.4); c.quadraticCurveTo(11.6, -17.6, 13.6, -19.4); c.strokeStyle = OL; c.lineWidth = 1; c.stroke();
  },
  gifblaster(c) {
    shape(c, rr(-7, -19, 14, 16, 3.4), '#f97316');
    shape(c, el(-8.6, -12, 2.6, 5, 0.25), '#f97316');
    shape(c, rr(3, -17, 19, 6.4, 2.6), '#8b5cf6'); shape(c, rr(6, -12, 3.6, 5, 1), '#6d28d9', 1.2);
    shape(c, el(22.4, -13.8, 2.6, 3.6), '#ffe14d', 1.3); line(c, [8, -15.6, 18, -15.6], '#c4b5fd', 1);
    shape(c, el(5, -13, 2.6, 2.6), '#e5e7eb', 1.2);
    shape(c, rr(-3, -21.6, 6, 3.4, 1), '#9ca3af', 1.2);
    shape(c, rr(-14.5, -36, 7, 12, 2), '#d1d5db', 1.5);
    shape(c, rr(-11.5, -39, 23, 19, 3.4), '#e5e7eb');
    shape(c, rr(-8.6, -36.4, 17, 13.6, 2.8), '#1e3a8a', 1.4);
    c.fillStyle = '#7be04a'; c.fillRect(-5, -33.4, 2.2, 3); c.fillRect(2.6, -33.4, 2.2, 3);
    c.beginPath(); c.arc(-0.2, -28.6, 3.4, 0.15, Math.PI - 0.15); c.closePath(); c.fill();
    dot(c, 7, -21.8, 0.9, '#ff3348');
    line(c, [-3, -39, -7, -46], OL, 1.6); line(c, [3, -39, 7, -46], OL, 1.6); dot(c, -7.2, -46.6, 1.6, '#ff3df0'); dot(c, 7.2, -46.6, 1.6, '#22e3ff');
  },
  synthcat(c) {
    c.beginPath(); c.moveTo(-6, -6); c.quadraticCurveTo(-17, -6, -15, -20); c.strokeStyle = OL; c.lineWidth = 5; c.stroke(); c.strokeStyle = '#f59e0b'; c.lineWidth = 3; c.stroke();
    shape(c, el(0, -12, 8.6, 9), '#f59e0b');
    line(c, [-6, -16, -3, -14], '#d97706', 1.4); line(c, [-7, -11, -4, -10], '#d97706', 1.4);
    shape(c, el(0, -26.5, 9, 8), '#f59e0b');
    shape(c, poly(-8, -29, -7, -38, -2, -32.5), '#f59e0b', 1.6); shape(c, poly(2, -32.5, 7, -38, 8, -29), '#f59e0b', 1.6);
    shape(c, poly(-6.6, -30.6, -6.2, -35.4, -3.6, -32.6), '#f9a8d4', 0); shape(c, poly(3.6, -32.6, 6.2, -35.4, 6.6, -30.6), '#f9a8d4', 0);
    line(c, [-2, -33, -1, -30.6], '#d97706', 1.2); line(c, [2, -33, 1, -30.6], '#d97706', 1.2);
    shape(c, poly(-7.6, -29.6, 8, -29.6, 6.6, -25.6, 1.2, -25.6, 0, -27, -1.2, -25.6, -6.2, -25.6), '#111827', 1.1);
    line(c, [-6.4, -28.6, -1.6, -28.6], '#ff3df0', 0.9); line(c, [1.6, -28.6, 6.4, -28.6], '#22e3ff', 0.9);
    shape(c, poly(-0.9, -24.6, 0.9, -24.6, 0, -23.6), '#f472b6', 0);
    c.beginPath(); c.moveTo(-2, -22.4); c.quadraticCurveTo(-1, -21.4, 0, -22.4); c.quadraticCurveTo(1, -21.4, 2, -22.4); c.strokeStyle = OL; c.lineWidth = 0.9; c.stroke();
    line(c, [-5, -23.6, -11, -24.6], OL, 0.6); line(c, [-5, -22.8, -11, -22], OL, 0.6); line(c, [5, -23.6, 11, -24.6], OL, 0.6); line(c, [5, -22.8, 11, -22], OL, 0.6);
    c.save(); c.translate(3, -13); c.rotate(-0.35);
    shape(c, rr(-14, -4.5, 26, 9, 3), '#ec4899');
    shape(c, rr(-10, -2.6, 15, 5, 1), '#fff', 1); c.fillStyle = OL; for (let i = 1; i < 6; i++) c.fillRect(-10 + i * 2.5, -2.6, 0.7, 3);
    shape(c, rr(12, -2.4, 12, 4.4, 1.6), '#ec4899', 1.4); dot(c, 22.4, -0.2, 1.4, '#22e3ff');
    dot(c, -12, 0, 1.3, '#22e3ff');
    c.restore();
    shape(c, el(-3.4, -15.4, 2.6, 2.4), '#f59e0b', 1.2); shape(c, el(4, -18, 2.6, 2.4), '#f59e0b', 1.2);
  },
  trollbot(c) {
    shape(c, rr(-14, -33, 28, 29, 6.4), '#6b7280');
    shape(c, rr(-8, -27, 16, 12, 3), '#4b5563', 1.4);
    dot(c, -4, -21, 1.8, '#ff3348'); dot(c, 0.4, -21, 1.8, '#ffe14d'); dot(c, 4.8, -21, 1.8, '#7be04a');
    shape(c, el(-15.4, -19, 4.4, 8, 0.4), '#6b7280'); shape(c, el(-12, -13.2, 3.4, 3.4), '#9ca3af', 1.3);
    shape(c, rr(12, -27, 12, 5.4, 2.4), '#6b7280'); shape(c, rr(22.6, -26.4, 5, 2.4, 1.2), '#9ca3af', 1.1);
    shape(c, rr(-12.5, -51, 25, 19, 5), '#9ca3af');
    shape(c, rr(-9.6, -48, 19.2, 13, 3), '#111827', 1.3);
    c.beginPath(); c.moveTo(-7.6, -42.4); c.quadraticCurveTo(0, -33.4, 7.6, -42.4); c.quadraticCurveTo(0, -39.4, -7.6, -42.4); c.closePath(); c.fillStyle = '#e5e7eb'; c.fill();
    c.strokeStyle = '#111827'; c.lineWidth = 0.7; c.beginPath(); for (let xx = -5; xx <= 5; xx += 2.5) { c.moveTo(xx, -42); c.lineTo(xx, -38); } c.stroke();
    c.beginPath(); c.arc(-4, -44, 2, Math.PI * 1.1, Math.PI * 1.9); c.moveTo(6, -44); c.arc(4, -44, 2, Math.PI * 1.1, Math.PI * 1.9); c.strokeStyle = '#7be04a'; c.lineWidth = 1.4; c.stroke();
    line(c, [8, -51, 10, -59], OL, 1.6);
    shape(c, rr(10, -61.5, 12, 6.4, 1), '#ff3348', 1.2); txt(c, 'LOL', 16, -58.2, 4.6, '#fff');
  },
  stonks(c) {
    line(c, [12, -14, 15.5, -42], OL, 3.4); line(c, [12, -14, 15.5, -42], '#8a5a33', 1.8);
    shape(c, rr(6, -55, 22, 15, 2), '#fff', 1.5);
    c.strokeStyle = '#d1d5db'; c.lineWidth = 0.6; c.beginPath(); for (let xx = 10; xx < 28; xx += 4) { c.moveTo(xx, -54); c.lineTo(xx, -41); } c.stroke();
    c.beginPath(); c.moveTo(8, -43); c.lineTo(13, -47); c.lineTo(16, -45); c.lineTo(24, -52); c.strokeStyle = '#16a34a'; c.lineWidth = 2; c.stroke();
    shape(c, poly(21, -53.4, 26, -54, 25.2, -49), '#16a34a', 0);
    shape(c, c => { c.moveTo(-10, -26); c.quadraticCurveTo(-12, -12, -10.5, -3); c.quadraticCurveTo(0, 0, 10.5, -3); c.quadraticCurveTo(12, -12, 10, -26); c.quadraticCurveTo(0, -28.5, -10, -26); c.closePath(); }, '#1e3a8a');
    shape(c, poly(-4, -26.6, 4, -26.6, 0, -18), '#fff', 1.2);
    shape(c, poly(-1.4, -25, 1.4, -25, 2, -13, 0, -10.6, -2, -13), '#dc2626', 1.1);
    shape(c, el(-11, -16, 3.4, 7, 0.2), '#1e3a8a'); shape(c, el(-11.6, -9.4, 2.8, 2.8), '#f1c27d', 1.3);
    shape(c, el(10.5, -18, 3.4, 6, -0.4), '#1e3a8a'); shape(c, el(12.4, -14, 2.8, 2.8), '#f1c27d', 1.3);
    shape(c, el(0, -35.5, 8.6, 9.6), '#f5d0b0');
    shape(c, el(-3.6, -40.6, 3, 2, -0.4), 'rgba(255,255,255,.7)', 0);
    shape(c, el(-8.8, -34, 1.6, 2.6), '#f5d0b0', 1.2);
    dot(c, 1.6, -35.6, 1.1, OL); dot(c, 6, -35.6, 1.1, OL);
    line(c, [-0.4, -38.6, 3, -38.2], OL, 1); line(c, [4.6, -38.2, 7.6, -38.6], OL, 1);
    shape(c, el(4.4, -32.4, 1.4, 1.2), '#e8b494', 0.8);
    line(c, [1.4, -29.6, 6.6, -29.8], OL, 1.1);
  },
  chonkcat(c) {
    shape(c, c => { c.moveTo(-24, -6); c.quadraticCurveTo(-34, -2, -30, 4); c.quadraticCurveTo(-10, 5, 8, 3); c.quadraticCurveTo(-12, 1, -22, -2); c.closePath(); }, '#ea8a2a', 1.8);
    shape(c, c => { c.moveTo(-24, -4); c.quadraticCurveTo(-29, -30, -11, -38); c.quadraticCurveTo(6, -44, 18, -36); c.quadraticCurveTo(28, -26, 24, -4); c.quadraticCurveTo(0, 2, -24, -4); c.closePath(); }, '#f59e0b');
    c.strokeStyle = '#d97706'; c.lineWidth = 2.4; for (const [sx, sy] of [[-20, -24], [-17, -32], [-21, -15]]) { c.beginPath(); c.moveTo(sx, sy); c.quadraticCurveTo(sx + 5, sy + 1, sx + 7, sy - 2); c.stroke(); }
    shape(c, el(7, -13, 13, 10), '#fde7c0', 0);
    shape(c, el(4, -3, 5.4, 3.6), '#fde7c0', 1.5); shape(c, el(15.5, -3, 5.4, 3.6), '#fde7c0', 1.5);
    line(c, [3, -4.6, 3, -1.8], OL, 0.8); line(c, [5.4, -4.6, 5.4, -1.8], OL, 0.8); line(c, [14.5, -4.6, 14.5, -1.8], OL, 0.8); line(c, [17, -4.6, 17, -1.8], OL, 0.8);
    shape(c, poly(-5.4, -44, -4.4, -56, 2.6, -48.6), '#f59e0b', 1.8); shape(c, poly(10.4, -48.6, 17.4, -56, 18.2, -43.6), '#f59e0b', 1.8);
    shape(c, poly(-4, -46, -3.6, -52.4, 0.6, -48.4), '#f9a8d4', 0); shape(c, poly(12.2, -48.4, 16.4, -52.4, 16.6, -45.6), '#f9a8d4', 0);
    shape(c, el(6.5, -40, 13.5, 11), '#f59e0b');
    c.strokeStyle = '#d97706'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(4, -50); c.lineTo(4.5, -46); c.moveTo(6.5, -51); c.lineTo(6.5, -46.4); c.moveTo(9, -50); c.lineTo(8.5, -46); c.stroke();
    shape(c, el(1.6, -40.6, 3.2, 2.6), '#fff7d6', 1.1); shape(c, el(11.6, -40.6, 3.2, 2.6), '#fff7d6', 1.1);
    dot(c, 2.4, -40, 1.3, OL); dot(c, 12.4, -40, 1.3, OL);
    shape(c, c => { c.moveTo(-1.8, -41.6); c.lineTo(5, -42.6); c.lineTo(5, -44); c.lineTo(-1.8, -43.6); c.closePath(); }, '#f59e0b', 0);
    shape(c, c => { c.moveTo(8.2, -42.6); c.lineTo(15, -41.6); c.lineTo(15, -43.6); c.lineTo(8.2, -44); c.closePath(); }, '#f59e0b', 0);
    line(c, [-1.8, -42, 5, -42.8], OL, 1.3); line(c, [8.2, -42.8, 15, -42], OL, 1.3);
    shape(c, el(6.6, -34.6, 5, 3.4), '#fde7c0', 0);
    shape(c, poly(5.2, -36.8, 8, -36.8, 6.6, -35.2), '#f472b6', 0.9);
    c.beginPath(); c.moveTo(4.4, -33.6); c.quadraticCurveTo(5.5, -32.4, 6.6, -33.6); c.quadraticCurveTo(7.7, -32.4, 8.8, -33.6); c.strokeStyle = OL; c.lineWidth = 1; c.stroke();
    line(c, [0, -35, -8, -36.4], OL, 0.7); line(c, [0, -34, -8, -33], OL, 0.7); line(c, [13, -35, 21, -36.4], OL, 0.7); line(c, [13, -34, 21, -33], OL, 0.7);
  },
  m_tower(c) {
    shape(c, rr(-20, -30, 40, 29, 4), '#e7dcc4');
    shape(c, rr(-15, -26, 30, 19, 3), '#1e3a8a', 1.4);
    dot(c, -5, -20, 1.6, '#ffe14d'); dot(c, 5, -20, 1.6, '#ffe14d'); c.beginPath(); c.arc(0, -16, 4.4, 0.2, Math.PI - 0.2); c.strokeStyle = '#ffe14d'; c.lineWidth = 1.6; c.stroke();
    dot(c, 15.5, -4.5, 1.2, '#7be04a');
    shape(c, rr(-16, -54, 32, 25, 4), '#c4b5fd');
    shape(c, rr(-12, -50.5, 24, 17.5, 3), '#111827', 1.4);
    txt(c, 'XD', 0, -41.6, 9, '#7be04a');
    shape(c, rr(-13, -74, 26, 21, 4), '#fda4af');
    shape(c, rr(-9.5, -71, 19, 15, 3), '#ffe14d', 1.4);
    c.beginPath(); c.arc(-3.6, -65.6, 1.8, Math.PI * 1.1, Math.PI * 1.9); c.moveTo(5.4, -65.6); c.arc(3.6, -65.6, 1.8, Math.PI * 1.1, Math.PI * 1.9); c.strokeStyle = OL; c.lineWidth = 1.2; c.stroke();
    shape(c, c => { c.moveTo(-5, -62.6); c.quadraticCurveTo(0, -56, 5, -62.6); c.closePath(); }, '#5a1530', 1);
    shape(c, el(-8, -64, 1.4, 2.2), '#60a5fa', 0.8); shape(c, el(8, -64, 1.4, 2.2), '#60a5fa', 0.8);
    shape(c, poly(-7, -74, 0, -90, 7, -74), '#22e3ff', 1.6);
    line(c, [-4, -79, 4, -78], '#ff3df0', 1.4); line(c, [-2, -84, 2.6, -83.4], '#ffe14d', 1.4);
    dot(c, 0, -90.6, 2.4, '#ff3df0');
  },
  m_base(c) {
    shape(c, rr(-54, -9, 108, 11, 4), '#9ca3af');
    shape(c, rr(-46, -70, 92, 63, 6), '#e7dcc4');
    shape(c, rr(-38, -62, 34, 5, 1.5), '#9ca3af', 1.3); shape(c, rr(-38, -54, 34, 5, 1.5), '#9ca3af', 1.3);
    line(c, [-34, -59.5, -10, -59.5], OL, 1.2);
    shape(c, el(30, -58, 5, 5), '#d1d5db', 1.5); dot(c, 30, -58, 2, '#7be04a');
    c.strokeStyle = '#b9ac90'; c.lineWidth = 1.4; c.beginPath(); for (let y = -44; y < -14; y += 5) { c.moveTo(20, y); c.lineTo(40, y); } c.stroke();
    shape(c, c => { c.moveTo(-14, -7); c.lineTo(-14, -30); c.arc(0, -30, 14, Math.PI, 0); c.lineTo(14, -7); c.closePath(); }, '#6d28d9', 1.8);
    shape(c, rr(-10, -24, 20, 17, 2), '#a78bfa', 1.2); dot(c, 6, -15, 1.4, '#ffe14d');
    shape(c, el(-30, -30, 8, 8), '#ffe14d', 1.6); dot(c, -32.6, -32, 1.2, OL); dot(c, -27.4, -32, 1.2, OL); c.beginPath(); c.arc(-30, -29, 4, 0.2, Math.PI - 0.2); c.closePath(); c.fillStyle = '#5a1530'; c.fill(); c.strokeStyle = OL; c.lineWidth = 1; c.stroke();
    shape(c, c => { rrPath(c, -34, -110, 68, 30, 12); }, '#fff', 2);
    shape(c, poly(-6, -81, -12, -70, 4, -81), '#fff', 0); line(c, [-6, -81, -12, -70, 4, -81.4], OL, 2);
    txt(c, 'LOL', 0, -94, 18, '#7c3aed');
    shape(c, poly(36, -64, 36, -86, 50, -74, 43, -73, 47, -66, 44, -64.6, 40.4, -71.4), '#fff', 1.6);
  },
});
