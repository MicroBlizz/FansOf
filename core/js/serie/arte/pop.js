// Fans Of · Arte: los dibujos de Pop (cada uno se dibuja en el suelo, con el origen bajo los pies y la altura en y negativa)
'use strict';
Object.assign(ART, {
  paparazzi(c) {
    shape(c, c => { c.moveTo(-11, -26); c.quadraticCurveTo(-13, -10, -10, -4); c.lineTo(10, -4); c.quadraticCurveTo(13, -10, 11, -26); c.quadraticCurveTo(0, -29, -11, -26); c.closePath(); }, '#78716c');
    for (const y of [-21, -14]) { shape(c, rr(-9, y, 6, 4.4, 1), '#57534e', 1); shape(c, rr(3, y, 6, 4.4, 1), '#57534e', 1); }
    shape(c, el(0, -33, 7.8, 7.6), '#f1c9a5', 1.8);
    dot(c, -2.6, -33.6, 1.2, OL);
    c.beginPath(); c.moveTo(-3.6, -28.8); c.quadraticCurveTo(0, -27, 3.4, -29.4); c.strokeStyle = OL; c.lineWidth = 1.3; c.stroke();
    shape(c, c => { c.moveTo(-8, -36); c.quadraticCurveTo(-8, -43, 0, -43); c.quadraticCurveTo(8, -43, 8, -36); c.closePath(); }, '#e63946', 1.8);
    shape(c, rr(-13, -37.4, 12, 3, 1.4), '#b0213a', 1.4);
    shape(c, rr(1, -40, 16, 12, 2.4), '#1f2937', 2);
    shape(c, el(9, -34, 4.4, 4.4), '#334155', 1.6); shape(c, el(9, -34, 2.4, 2.4), '#63cfe0', 0);
    shape(c, rr(4, -46, 9, 6, 1.4), '#e5e7eb', 1.6); shape(c, rr(5.6, -44.6, 5.8, 3.2, 0.8), '#fffbe0', 0);
    c.globalAlpha = 0.5; for (const a of [-0.9, -0.4, 0.1]) line(c, [8.5 + Math.cos(a) * 6, -43 + Math.sin(a) * 6, 8.5 + Math.cos(a) * 11, -43 + Math.sin(a) * 11], '#ffe14d', 1.6); c.globalAlpha = 1;
  },
  sp_taquilla(c) { spBg(c, 'd'); c.beginPath(); starPath(c, 0, -23, 19, 10, 9); c.fillStyle = '#ff7a1a'; c.fill(); c.lineWidth = 2; c.strokeStyle = OL; c.stroke(); c.beginPath(); starPath(c, 0, -23, 11, 6, 9); c.fillStyle = '#ffe14d'; c.fill(); shape(c, rr(-13, -9, 26, 6, 1.4), '#1f2937', 1.6); for (let x = -11; x <= 9; x += 5) shape(c, rr(x, -7.6, 3, 3.2, 0.6), '#fff6ea', 0); },
  sp_maquillaje(c) { spBg(c, 'h'); shape(c, el(-4, -16, 11, 6), '#ff9ab8', 2); shape(c, el(-4, -17.6, 8.4, 3.6), '#ffd6e4', 1.2); c.save(); c.translate(6, -26); c.rotate(0.5); shape(c, rr(-2, -2, 4, 15, 1.4), '#5b3a1c', 1.4); shape(c, rr(-2.6, -6, 5.2, 5, 1), '#cbd5e1', 1.2); shape(c, c => { c.moveTo(-3.4, -6); c.quadraticCurveTo(0, -17, 3.4, -6); c.closePath(); }, '#ffcfdd', 1.4); c.restore(); for (const [x, y] of [[-14, -34], [13, -40]]) { c.beginPath(); starPath(c, x, y, 3, 1.2, 4); c.fillStyle = '#fff6ea'; c.fill(); } },
  sp_remake(c) { spBg(c, 'c'); shape(c, rr(-14, -26, 28, 17, 2), '#1f2937', 2); c.save(); c.translate(-14, -27); c.rotate(-0.28); shape(c, rr(0, -6, 28, 6, 1.4), '#fff6ea', 1.8); for (let x = 3; x < 26; x += 7) shape(c, poly(x, -6, x + 3.4, -6, x + 1, 0, x - 2.4, 0), OL, 0); c.restore(); otxt(c, '2', 0, -17.4, 12, '#ff9ab8'); shape(c, rr(4, -42, 15, 8, 2), '#ffcb3d', 1.4); otxt(c, '70€', 11.5, -37.8, 6.2, OL); },
  /* ---------- v0.9.13: Cultura Pop ---------- */
  directora(c) {
    shape(c, c => { c.moveTo(-12, -32); c.quadraticCurveTo(-16, -16, -13, -4); c.quadraticCurveTo(0, 0, 13, -4); c.quadraticCurveTo(16, -16, 12, -32); c.quadraticCurveTo(0, -36, -12, -32); c.closePath(); }, '#d97706');
    shape(c, poly(-4, -33, 0, -20, 4, -33), '#fff6ea', 1.2);
    line(c, [0, -20, 0, -6], '#b45309', 1.2);
    shape(c, el(-13, -20, 4.4, 8, 0.3), '#d97706');
    c.save(); c.translate(-16, -12); c.rotate(-0.25);
    shape(c, rr(-7, -4, 14, 9, 1), '#1f2937', 1.4); shape(c, poly(-7, -4, -6, -9, 7, -9, 7, -4), '#f5f5f4', 1.3);
    c.fillStyle = OL; for (const x of [-4, 0, 4]) { c.beginPath(); c.moveTo(x, -9); c.lineTo(x + 2, -9); c.lineTo(x + 1, -4); c.lineTo(x - 1, -4); c.closePath(); c.fill(); }
    line(c, [-5, 1, 5, 1], '#f5f5f4', 0.9);
    c.restore();
    shape(c, c => { c.moveTo(-8, -34); c.quadraticCurveTo(0, -29, 8, -34); c.lineTo(7, -30.6); c.quadraticCurveTo(0, -26, -7, -30.6); c.closePath(); }, '#dc2626', 1.4);
    shape(c, c => { c.moveTo(-6, -31); c.lineTo(-10, -18); c.lineTo(-5.6, -19); c.lineTo(-3, -30); c.closePath(); }, '#dc2626', 1.3);
    shape(c, el(13, -24, 4.4, 7, -0.6), '#d97706');
    shape(c, c => { c.moveTo(14, -30); c.lineTo(27, -36); c.lineTo(27, -22); c.lineTo(14, -26); c.closePath(); }, '#f5f5f4', 1.6);
    shape(c, el(27, -29, 2.6, 7), '#e5e7eb', 1.4); line(c, [18.4, -31.8, 18.4, -24.8], '#dc2626', 1.4);
    shape(c, el(14.5, -27, 3.2, 3.2), '#f1c27d', 1.3);
    shape(c, el(0, -42, 9, 8.8), '#f1c27d');
    shape(c, c => { c.moveTo(-9.6, -43); c.quadraticCurveTo(-11, -34, -6, -33.6); c.lineTo(-6.4, -43); c.closePath(); }, '#d1d5db', 1.3);
    shape(c, rr(-7, -45, 6.2, 4, 1.4), '#111827', 1.1); shape(c, rr(1.4, -45, 6.2, 4, 1.4), '#111827', 1.1); line(c, [-0.8, -44, 1.4, -44], OL, 1);
    c.beginPath(); c.arc(1, -38.6, 2.4, 0.2, Math.PI - 0.2); c.strokeStyle = OL; c.lineWidth = 1.3; c.stroke();
    shape(c, c => { c.moveTo(-10, -47); c.quadraticCurveTo(-8, -55, 2, -54.6); c.quadraticCurveTo(12, -54, 11, -47.6); c.quadraticCurveTo(0, -45, -10, -47); c.closePath(); }, '#1f2937', 1.6);
    line(c, [1, -54.6, 2, -57.6], OL, 1.8);
  },
  extras(c) {
    line(c, [7, -8, 13, -22], OL, 3.4); line(c, [7, -8, 13, -22], '#d6b07a', 1.8);
    shape(c, c => { c.moveTo(-7, -17); c.lineTo(7, -17); c.lineTo(8, -3); c.quadraticCurveTo(0, -1, -8, -3); c.closePath(); }, '#9ca3af');
    shape(c, rr(-5.8, -14.6, 11.6, 4.8, 1), '#fff', 0.9); c.fillStyle = OL; c.font = '3.6px ' + FONT_D; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('EXTRA', 0, -12);
    shape(c, el(7.6, -9, 2.4, 2.4), '#f1c27d', 1.2);
    shape(c, el(0, -22, 6.4, 6), '#f1c27d');
    dot(c, -2, -22.4, 1, OL); dot(c, 3, -22.4, 1, OL);
    line(c, [-1, -19.4, 2.6, -19.6], OL, 1);
    shape(c, c => { c.moveTo(-6.6, -24); c.quadraticCurveTo(-6.6, -30.6, 0, -30.6); c.quadraticCurveTo(6.6, -30.6, 6.6, -24); c.closePath(); }, '#d6b07a', 1.4);
    shape(c, c => { c.moveTo(-5, -30); c.quadraticCurveTo(0, -36, 5, -30); c.lineTo(3, -29); c.quadraticCurveTo(0, -32, -3, -29); c.closePath(); }, '#dc2626', 1.2);
  },
  doble(c) {
    shape(c, c => { c.moveTo(-9, -28); c.quadraticCurveTo(-12, -16, -9, -4); c.quadraticCurveTo(0, -1, 9, -4); c.quadraticCurveTo(12, -16, 9, -28); c.quadraticCurveTo(0, -31, -9, -28); c.closePath(); }, '#f5f5f4');
    shape(c, rr(-9, -9, 18, 5, 1.6), '#1e3a8a', 1.2);
    shape(c, el(-11, -20, 4.6, 7.6, 0.2), '#e0a872'); shape(c, el(-12, -12.4, 3.4, 3.4), '#e0a872', 1.3);
    shape(c, el(11.6, -21, 4.6, 7, -0.5), '#e0a872'); shape(c, el(14, -27, 3.4, 3.4), '#e0a872', 1.3);
    shape(c, el(-5, -2.6, 3, 2), '#1f2937', 1); shape(c, el(5, -2.6, 3, 2), '#1f2937', 1);
    shape(c, el(0.5, -35, 7.6, 7.2), '#e0a872');
    shape(c, rr(-7.6, -40.6, 16.2, 3.6, 1.4), '#dc2626', 1.3);
    shape(c, poly(-7.4, -39.4, -13, -37, -12, -42), '#dc2626', 1.2);
    shape(c, rr(-4.6, -37, 11, 3.2, 1.4), '#111827', 1); line(c, [-3, -36.4, 0, -36.4], 'rgba(255,255,255,.6)', 0.8);
    c.beginPath(); c.moveTo(-1, -31.4); c.lineTo(4.6, -31.8); c.strokeStyle = OL; c.lineWidth = 1.2; c.stroke();
    shape(c, rr(3.6, -34.6, 4.4, 2, 0.8), '#fcd9b6', 0.8);
  },
  heroe(c) {
    shape(c, c => { c.moveTo(-6, -36); c.quadraticCurveTo(-20, -28, -22, -10); c.quadraticCurveTo(-16, -13, -13, -8); c.quadraticCurveTo(-9, -14, -5, -10); c.lineTo(4, -32); c.closePath(); }, '#dc2626');
    c.fillStyle = 'rgba(255,255,255,.75)'; for (const [x, y] of [[-15, -24], [-10, -18], [-17, -15], [-9, -27]]) { c.beginPath(); c.arc(x, y, 1.3, 0, Math.PI * 2); c.fill(); }
    shape(c, rr(-7, -11, 6, 9, 2), '#2563eb'); shape(c, rr(1, -11, 6, 9, 2), '#2563eb');
    shape(c, el(-4, -2.4, 3.6, 2.4), '#dc2626', 1.2); shape(c, el(4, -2.4, 3.6, 2.4), '#dc2626', 1.2);
    shape(c, c => { c.moveTo(-8, -34); c.lineTo(8, -34); c.lineTo(9, -10); c.quadraticCurveTo(0, -7, -9, -10); c.closePath(); }, '#2563eb');
    shape(c, rr(-9, -16, 18, 4, 1.4), '#facc15', 1.2);
    shape(c, el(0, -26, 6.4, 5.2), '#facc15', 1.3); txt(c, '2x1', 0, -25.6, 5.4, '#dc2626');
    shape(c, el(11, -32, 7, 3.6, -0.2), '#2563eb'); shape(c, el(18, -33.6, 3.6, 3.4), '#dc2626', 1.4);
    shape(c, el(0, -42, 7.6, 7.4), '#f1c27d');
    shape(c, rr(-7.2, -45.6, 14.4, 4.4, 2), '#111827', 1.2);
    dot(c, -3, -43.4, 1.1, '#fff'); dot(c, 3.4, -43.4, 1.1, '#fff');
    c.beginPath(); c.arc(0.6, -38.8, 2.4, 0.2, Math.PI - 0.2); c.strokeStyle = OL; c.lineWidth = 1.2; c.stroke();
    shape(c, c => { c.moveTo(-7, -46); c.quadraticCurveTo(-4, -54, 6, -51); c.quadraticCurveTo(2, -50, 1, -48); c.quadraticCurveTo(-2, -50, -7, -46); c.closePath(); }, '#1f2937', 1.3);
  },
  detective(c) {
    shape(c, c => { c.moveTo(-9, -30); c.quadraticCurveTo(-13, -15, -12, -2); c.lineTo(11, -2); c.quadraticCurveTo(12, -15, 9, -30); c.quadraticCurveTo(0, -33, -9, -30); c.closePath(); }, '#c8a97e');
    line(c, [0, -30, -1, -3], '#a8875a', 1.4);
    shape(c, rr(-11, -16, 22, 3.6, 1.2), '#8a6a42', 1.2);
    shape(c, poly(-6, -31, 0, -24, 6, -31), '#e5e7eb', 1.1); shape(c, poly(-1.4, -27, 1.4, -27, 0.8, -22, -0.8, -22), '#7c2d12', 0.8);
    shape(c, el(10, -22, 3.8, 7, -0.5), '#c8a97e');
    line(c, [13, -26, 17, -31], OL, 2.6); line(c, [13, -26, 17, -31], '#8a5a33', 1.3);
    c.beginPath(); c.arc(19.6, -34.6, 5.2, 0, Math.PI * 2); c.fillStyle = 'rgba(190,230,255,.55)'; c.fill(); c.lineWidth = 2.6; c.strokeStyle = OL; c.stroke(); c.lineWidth = 1.2; c.strokeStyle = '#d1d5db'; c.stroke();
    shape(c, el(12.6, -25.4, 2.6, 2.6), '#f1c27d', 1.2);
    shape(c, el(0.5, -37, 7, 6.8), '#f1c27d');
    shape(c, el(4, -35.6, 2.4, 2.2), '#e8a07a', 1);
    dot(c, -1, -38, 1.1, OL); line(c, [-3.4, -40, 0.6, -39.4], OL, 1.3);
    shape(c, el(0.5, -42, 11, 2.6), '#5b4636', 1.4);
    shape(c, c => { c.moveTo(-6, -42); c.quadraticCurveTo(-6.4, -50, 0.5, -50); c.quadraticCurveTo(7.4, -50, 7, -42); c.closePath(); }, '#5b4636', 1.4);
    line(c, [-6, -43.6, 7, -43.6], '#1f2937', 1.6);
  },
  spoiler(c) {
    shape(c, c => { c.moveTo(-9, -28); c.quadraticCurveTo(-12, -15, -10, -3); c.quadraticCurveTo(0, 0, 10, -3); c.quadraticCurveTo(12, -15, 9, -28); c.quadraticCurveTo(0, -31, -9, -28); c.closePath(); }, '#16a34a');
    shape(c, rr(-6, -14, 12, 5, 2), '#15803d', 1.1);
    line(c, [-2, -28, -2.6, -21], '#e5e7eb', 1); line(c, [2, -28, 2.6, -21], '#e5e7eb', 1);
    c.save(); c.translate(15, -30); c.rotate(0.15);
    shape(c, rr(-8, -10, 16, 20, 1), '#f5f0e1', 1.4);
    c.fillStyle = '#dc2626'; c.font = '5.2px ' + FONT_D; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('¡FINAL!', 0, -5.6);
    c.fillStyle = '#9ca3af'; for (let y = -2; y < 8; y += 2.4) c.fillRect(-6, y, 12, 1);
    c.restore();
    shape(c, el(9, -22, 3.6, 6.6, -0.5), '#16a34a'); shape(c, el(9.6, -28, 2.8, 2.8), '#f1c27d', 1.2);
    shape(c, el(0, -36, 7.6, 7.2), '#f1c27d');
    shape(c, c => { c.moveTo(-8, -36); c.quadraticCurveTo(-9, -46, 0, -45.6); c.quadraticCurveTo(9, -46, 8, -36); c.quadraticCurveTo(4, -41, 0, -40.6); c.quadraticCurveTo(-4, -41, -8, -36); c.closePath(); }, '#16a34a', 1.5);
    dot(c, -2.6, -37.4, 1.2, OL); dot(c, 3, -37.4, 1.2, OL);
    shape(c, el(0.4, -32.6, 2.6, 2.2), '#7f1d1d', 1.1);
    line(c, [-11, -40, -14, -42], OL, 1.2); line(c, [-11.6, -36, -15, -36], OL, 1.2);
  },
  kaiju(c) {
    shape(c, c => { c.moveTo(-14, -12); c.quadraticCurveTo(-34, -10, -40, -2); c.quadraticCurveTo(-28, -3, -12, -4); c.closePath(); }, '#7c3aed');
    shape(c, el(-9, -5, 7, 5), '#6d28d9'); shape(c, el(9, -5, 7, 5), '#6d28d9');
    shape(c, c => { c.moveTo(-17, -6); c.quadraticCurveTo(-22, -36, -8, -48); c.quadraticCurveTo(8, -54, 15, -40); c.quadraticCurveTo(22, -24, 17, -6); c.quadraticCurveTo(0, 0, -17, -6); c.closePath(); }, '#8b5cf6');
    shape(c, el(3, -22, 10, 14), '#ddd6fe', 0);
    c.strokeStyle = '#c4b5fd'; c.lineWidth = 1.2; c.beginPath(); for (let y = -32; y < -10; y += 5) { c.moveTo(-5, y); c.quadraticCurveTo(3, y + 2, 11, y); } c.stroke();
    line(c, [3, -44, 3, -10], '#facc15', 2); c.strokeStyle = '#a16207'; c.lineWidth = 0.8; c.beginPath(); for (let y = -42; y < -11; y += 2.4) { c.moveTo(1.6, y); c.lineTo(4.4, y); } c.stroke();
    shape(c, rr(1.2, -46, 3.6, 5, 1), '#facc15', 1.1);
    for (const [x, y, sz] of [[-16, -30, 6], [-15, -40, 6.6], [-9, -49, 6.6]]) shape(c, poly(x, y, x - sz, y - sz * 0.4, x - sz * 0.2, y + sz * 0.7), '#f472b6', 1.4);
    shape(c, el(17, -28, 5, 3, -0.4), '#8b5cf6'); shape(c, el(15, -20, 4.6, 2.8, 0.3), '#8b5cf6');
    shape(c, el(8, -54, 12, 10), '#8b5cf6');
    shape(c, el(14, -51, 7, 5), '#a78bfa', 1.4);
    dot(c, 15.6, -52, 0.9, OL); dot(c, 18.6, -52, 0.9, OL);
    shape(c, el(4, -59, 4.6, 4.6), '#fff', 1.3); shape(c, el(12, -60, 4, 4), '#fff', 1.3);
    dot(c, 5, -58.4, 1.8, OL); dot(c, 13, -59.4, 1.6, OL);
    c.beginPath(); c.moveTo(10, -47); c.quadraticCurveTo(14, -45, 19, -47.6); c.strokeStyle = OL; c.lineWidth = 1.3; c.stroke();
    shape(c, poly(12, -46.6, 13.4, -44.4, 14.6, -46.4), '#fff', 0.9);
  },
  k_tower(c) {
    shape(c, rr(-20, -8, 40, 8, 2), '#374151');
    const lx = y => 14 - ((-6 - y) * 8) / 54;
    c.lineCap = 'round';
    c.strokeStyle = OL; c.lineWidth = 3.4; c.beginPath(); c.moveTo(-14, -6); c.lineTo(-6, -60); c.moveTo(14, -6); c.lineTo(6, -60); c.stroke();
    c.strokeStyle = '#9ca3af'; c.lineWidth = 1.8; c.stroke();
    c.strokeStyle = '#6b7280'; c.lineWidth = 1.2; c.beginPath(); for (let i = 0; i < 5; i++) { const ya = -6 - i * 10.8, yb = ya - 10.8, xa = lx(ya), xb = lx(yb); c.moveTo(-xa, ya); c.lineTo(xb, yb); c.moveTo(xa, ya); c.lineTo(-xb, yb); } c.stroke();
    shape(c, el(0, -61, 8, 3), '#4b5563', 1.4);
    c.save(); c.translate(0, -68); c.rotate(-0.35);
    shape(c, rr(-12, -9, 22, 18, 4), '#1f2937');
    line(c, [-8, -9, -8, 9], '#374151', 1.2); line(c, [-3, -9, -3, 9], '#374151', 1.2);
    shape(c, el(10, 0, 4, 9.4), '#fff7d6', 1.6);
    shape(c, el(10, 0, 2.2, 6), '#ffe14d', 0);
    c.restore();
    shape(c, c => starPath(c, -12, -38, 4.6, 2), '#ffcb3d', 1.1);
  },
  k_base(c) {
    shape(c, rr(-58, -9, 116, 10, 3), '#7f1d1d');
    shape(c, c => { c.moveTo(-50, -8); c.lineTo(-50, -54); c.quadraticCurveTo(0, -84, 50, -54); c.lineTo(50, -8); c.closePath(); }, '#e7dcc4');
    c.strokeStyle = '#cbbd9e'; c.lineWidth = 1.2; c.beginPath(); for (let x = -40; x <= 40; x += 10) { c.moveTo(x, -10); c.lineTo(x, -56 - (1 - Math.abs(x) / 50) * 12); } c.stroke();
    shape(c, el(-33, -40, 8, 8), '#1f2937', 1.6); txt(c, '7', -33, -39.4, 10, '#ffcb3d');
    shape(c, rr(-15, -38, 30, 30, 2), '#475569', 1.8);
    c.strokeStyle = '#64748b'; c.lineWidth = 1.2; c.beginPath(); for (let y = -34; y < -9; y += 4) { c.moveTo(-13, y); c.lineTo(13, y); } c.stroke();
    shape(c, el(27, -44, 4.6, 4.6), '#dc2626', 1.4); dot(c, 26, -45, 1.4, '#fecaca');
    shape(c, rr(-38, -100, 76, 26, 4), '#1f2937', 2);
    shape(c, rr(-33, -95, 66, 16, 2), '#fde68a', 1.4);
    txt(c, 'ESTRENO', 0, -86.6, 11, '#b91c1c');
    for (let i = 0; i < 13; i++) { dot(c, -34 + i * 5.66, -98.6, 1.4, '#fff7d6'); dot(c, -34 + i * 5.66, -75.8, 1.4, '#fff7d6'); }
    line(c, [-26, -74, -26, -62], OL, 2.6); line(c, [26, -74, 26, -62], OL, 2.6);
    shape(c, c => starPath(c, -46, -104, 6, 2.6), '#ffcb3d', 1.4); shape(c, c => starPath(c, 46, -106, 5, 2.2), '#ffcb3d', 1.4);
  },
});
