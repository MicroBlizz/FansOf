// Fans Of · Arte: los dibujos de Olvidados (cada uno se dibuja en el suelo, con el origen bajo los pies y la altura en y negativa)
'use strict';
Object.assign(ART, {
  espia(c) {
    shape(c, c => { c.moveTo(-11, -28); c.quadraticCurveTo(-15, -12, -12, -4); c.lineTo(12, -4); c.quadraticCurveTo(15, -12, 11, -28); c.quadraticCurveTo(0, -31, -11, -28); c.closePath(); }, '#c8a46e');
    line(c, [0, -28, 0, -5], '#a07f4c', 1.4); line(c, [-11, -16, 11, -16], '#8a6a3c', 2.4);
    shape(c, rr(-1.6, -17.6, 3.2, 3.2, 0.6), '#ffcb3d', 1);
    shape(c, poly(-6, -28, 0, -20, 6, -28, 3, -29, 0, -25, -3, -29), '#9a7a48', 1.3);
    shape(c, el(0, -34, 7.6, 7.4), '#f1c9a5', 1.8);
    shape(c, rr(-7.4, -36.6, 6.4, 3.4, 1.2), '#111827', 1.2); shape(c, rr(1, -36.6, 6.4, 3.4, 1.2), '#111827', 1.2);
    line(c, [-1, -35.2, 1, -35.2], OL, 1.2);
    shape(c, c => { c.moveTo(-5, -30.4); c.quadraticCurveTo(0, -32, 5, -30.4); c.quadraticCurveTo(0, -29.4, -5, -30.4); c.closePath(); }, '#5b3a1c', 1);
    shape(c, el(0, -40.4, 14, 3), '#4b5563', 1.8);
    shape(c, c => { c.moveTo(-8, -40); c.quadraticCurveTo(-8, -49, 0, -49); c.quadraticCurveTo(8, -49, 8, -40); c.closePath(); }, '#4b5563', 1.8);
    shape(c, rr(-8, -43, 16, 2.6, 1), '#1f2937', 0);
    c.save(); c.translate(12, -10); c.rotate(-0.25);
    shape(c, rr(-5, -6, 10, 8, 1.4), '#fff6ea', 1.4);
    txt(c, 'X', 0, -2, 7, '#e63946');
    c.restore();
  },
  sp_cartuchos(c) { spBg(c, 'd'); for (const [x, y, rot] of [[-5, -18, -0.25], [6, -26, 0.3]]) { c.save(); c.translate(x, y); c.rotate(rot); shape(c, c => { c.moveTo(-8, -10); c.lineTo(8, -10); c.lineTo(8, 9); c.lineTo(6, 11); c.lineTo(-6, 11); c.lineTo(-8, 9); c.closePath(); }, '#9ca3af', 1.8); shape(c, rr(-5.6, -7, 11.2, 9, 1.2), '#ffe06a', 1.2); for (const xx of [-5, -2, 1, 4]) line(c, [xx, 8, xx, 10], '#facc15', 1.2); c.restore(); } },
  sp_parchefan(c) { spBg(c, 'h'); c.save(); c.translate(0, -23); c.rotate(-0.7); shape(c, rr(-17, -6, 34, 12, 5), '#fde68a', 2); shape(c, rr(-6, -6, 12, 12, 1.6), '#f5d58a', 1.2); for (const [x, y] of [[-12, -2], [-12, 2], [12, -2], [12, 2]]) dot(c, x, y, 0.9, '#c49a3c'); c.restore(); shape(c, c => { c.moveTo(-2.4, -23); c.bezierCurveTo(-2.4, -26, 0, -26.6, 0, -24.4); c.bezierCurveTo(0, -26.6, 2.4, -26, 2.4, -23); c.quadraticCurveTo(2.4, -21, 0, -19.6); c.quadraticCurveTo(-2.4, -21, -2.4, -23); c.closePath(); }, '#ff5fa8', 1); },
  sp_cancelado(c) { spBg(c, 'c'); shape(c, c => { c.moveTo(-11, -36); c.lineTo(11, -36); c.lineTo(11, -12); c.lineTo(8, -9); c.lineTo(-8, -9); c.lineTo(-11, -12); c.closePath(); }, '#9aa3a0', 2); shape(c, rr(-8, -32, 16, 12, 1.4), '#c9cfc6', 1.2); c.save(); c.translate(0, -22); c.rotate(-0.35); shape(c, rr(-15, -5, 30, 10, 2), 'rgba(230,57,70,.9)', 1.6); otxt(c, 'CANCEL', 0, 0.4, 7.2, '#fff6ea'); c.restore(); },
  /* ---------- v0.9.13: Olvidados (los juegos cancelados del sótano de Microblizz) ---------- */
  vikingo(c) {
    shape(c, el(-15, -25, 11, 12), '#a8672f');
    c.save(); c.beginPath(); c.ellipse(-15, -25, 11, 12, 0, 0, Math.PI * 2); c.clip(); c.strokeStyle = '#7c4a1e'; c.lineWidth = 1.2; c.beginPath(); for (const xx of [-22, -17.5, -13, -8.5]) { c.moveTo(xx, -38); c.lineTo(xx, -12); } c.stroke(); c.restore();
    c.beginPath(); c.ellipse(-15, -25, 9.6, 10.6, 0, 0, Math.PI * 2); c.strokeStyle = '#9ca3af'; c.lineWidth = 2; c.stroke();
    shape(c, el(-15, -25, 3.4, 3.6), '#d1d5db', 1.3);
    line(c, [13, -8, 19, -46], OL, 4.4); line(c, [13, -8, 19, -46], '#8a5a33', 2.4);
    c.save(); c.translate(18.6, -42); c.rotate(0.15);
    shape(c, c => { c.moveTo(0, -4); c.quadraticCurveTo(12, -9, 13, 2); c.quadraticCurveTo(8, 6, 0, 3); c.closePath(); }, '#d1d5db', 1.6);
    line(c, [3, -2, 10, -3], '#9ca3af', 1);
    c.restore();
    shape(c, c => { c.moveTo(-13, -34); c.quadraticCurveTo(-18, -18, -14, -4); c.quadraticCurveTo(0, 1, 14, -4); c.quadraticCurveTo(18, -18, 13, -34); c.quadraticCurveTo(0, -39, -13, -34); c.closePath(); }, '#7c4a1e');
    shape(c, c => { c.moveTo(-14, -33); c.quadraticCurveTo(0, -27, 14, -33); c.quadraticCurveTo(12, -39, 0, -39); c.quadraticCurveTo(-12, -39, -14, -33); c.closePath(); }, '#d6c4a8', 1.6);
    shape(c, rr(-14, -14, 28, 4.6, 1.6), '#3b2a1e', 1.4); shape(c, rr(-3, -15, 6, 6.4, 1.2), '#ffcb3d', 1.2);
    shape(c, el(14, -22, 4.6, 8, -0.4), '#7c4a1e'); shape(c, el(15.5, -16, 3.8, 3.8), '#f2c29b', 1.4);
    shape(c, el(1, -44, 10.5, 10), '#f2c29b');
    shape(c, c => { c.moveTo(-9, -44); c.quadraticCurveTo(-11, -30, -4, -26); c.lineTo(-1, -21); c.lineTo(2, -26); c.quadraticCurveTo(11, -30, 11, -44); c.quadraticCurveTo(6, -37, 1, -38); c.quadraticCurveTo(-4, -37, -9, -44); c.closePath(); }, '#e2572b', 1.6);
    line(c, [-1, -32, -1, -25], '#b8401c', 1); line(c, [4, -33, 3.6, -27], '#b8401c', 1);
    shape(c, el(3.6, -42, 3, 2.6), '#e8a07a', 1.2);
    dot(c, -2, -45.5, 1.4, OL); dot(c, 6.8, -45.5, 1.4, OL);
    line(c, [-4.6, -48.6, -0.6, -47.6], OL, 1.6); line(c, [9, -48.6, 5, -47.6], OL, 1.6);
    shape(c, c => { c.moveTo(-3, -38.6); c.quadraticCurveTo(3.6, -41, 10, -38.6); c.quadraticCurveTo(3.6, -37, -3, -38.6); c.closePath(); }, '#e2572b', 1.1);
    shape(c, c => { c.moveTo(-10, -47); c.quadraticCurveTo(-10, -59, 1, -59); c.quadraticCurveTo(12, -59, 12, -47); c.closePath(); }, '#aab4c4', 1.8);
    line(c, [-10, -47.4, 12, -47.4], '#7d889e', 2); line(c, [1, -59, 1, -48], '#7d889e', 1.2);
    shape(c, c => { c.moveTo(-8, -53); c.quadraticCurveTo(-17, -54, -18, -63); c.quadraticCurveTo(-13, -59, -9, -58); c.closePath(); }, '#f5f0dc', 1.5);
    shape(c, c => { c.moveTo(10, -53); c.quadraticCurveTo(19, -54, 20, -63); c.quadraticCurveTo(15, -59, 11, -58); c.closePath(); }, '#f5f0dc', 1.5);
  },
  vikingsquad(c) {
    line(c, [9, -10, 16, -30], OL, 3.6); line(c, [9, -10, 16, -30], '#e5e7eb', 1.8); line(c, [7, -13, 12, -11], OL, 2.6); line(c, [7, -13, 12, -11], '#8a5a33', 1.2);
    shape(c, c => { c.moveTo(-8, -20); c.quadraticCurveTo(-11, -10, -9, -3); c.quadraticCurveTo(0, 0, 9, -3); c.quadraticCurveTo(11, -10, 8, -20); c.quadraticCurveTo(0, -23, -8, -20); c.closePath(); }, '#3b5b8a');
    shape(c, rr(-9, -9, 18, 3.4, 1.2), '#3b2a1e', 1.2);
    shape(c, el(9.5, -11.5, 2.8, 2.8), '#f2c29b', 1.3);
    shape(c, el(-8, -12, 7, 7.4), '#c2410c');
    c.beginPath(); c.ellipse(-8, -12, 5.6, 6, 0, 0, Math.PI * 2); c.strokeStyle = '#fcd34d'; c.lineWidth = 1.4; c.stroke(); dot(c, -8, -12, 1.8, '#fcd34d');
    shape(c, el(1, -26, 7.2, 6.8), '#f2c29b');
    shape(c, c => { c.moveTo(-6, -26); c.quadraticCurveTo(-7, -16, 1, -14); c.quadraticCurveTo(9, -16, 8, -26); c.quadraticCurveTo(4, -21.6, 1, -22.4); c.quadraticCurveTo(-2, -21.6, -6, -26); c.closePath(); }, '#f2c94c', 1.4);
    dot(c, -1.4, -27.6, 1.1, OL); dot(c, 4.6, -27.6, 1.1, OL); shape(c, el(2, -24.6, 2, 1.6), '#e8a07a', 1);
    shape(c, c => { c.moveTo(-6.6, -28.6); c.quadraticCurveTo(-6.6, -37, 1, -37); c.quadraticCurveTo(8.6, -37, 8.6, -28.6); c.closePath(); }, '#aab4c4', 1.6);
    line(c, [-6.6, -28.8, 8.6, -28.8], '#7d889e', 1.6);
    shape(c, c => { c.moveTo(-5, -32); c.quadraticCurveTo(-11, -32, -12, -39); c.quadraticCurveTo(-8.6, -36.4, -5.6, -36); c.closePath(); }, '#f5f0dc', 1.2);
    shape(c, c => { c.moveTo(7, -32); c.quadraticCurveTo(13, -32, 14, -39); c.quadraticCurveTo(10.6, -36.4, 7.6, -36); c.closePath(); }, '#f5f0dc', 1.2);
  },
  swarmbug(c) {
    c.strokeStyle = OL; c.lineWidth = 2.2; c.lineCap = 'round';
    for (const [x0, x1] of [[-7, -12], [-1, -4], [5, 4]]) { c.beginPath(); c.moveTo(x0, -7); c.lineTo(x1, -1); c.stroke(); }
    shape(c, el(-5, -10, 8, 6.4, -0.15), '#6d28d9');
    line(c, [-9, -14.6, -7.4, -6], '#8b5cf6', 1.2); line(c, [-4.4, -15.8, -3, -5], '#8b5cf6', 1.2);
    shape(c, el(4, -11, 5.6, 5.2), '#7c3aed');
    shape(c, el(9, -12.5, 4.6, 4.2), '#8b5cf6');
    shape(c, c => { c.moveTo(12, -11); c.quadraticCurveTo(17, -12, 16, -7); c.quadraticCurveTo(14.6, -9.4, 12, -9.6); c.closePath(); }, '#f5f0dc', 1.1);
    dot(c, 10, -14, 1.5, '#a3ff7a'); dot(c, 12.2, -13, 1.1, '#a3ff7a');
    shape(c, poly(-9, -15, -7, -21, -4, -16), '#c4b5fd', 1.2); shape(c, poly(-3, -16, 0, -22, 2, -15.6), '#c4b5fd', 1.2);
    line(c, [9, -16, 7, -21], OL, 1.2); line(c, [11, -16, 12, -21], OL, 1.2);
  },
  retromarine(c) {
    shape(c, rr(-15, -36, 8, 22, 2.4), '#365314');
    shape(c, rr(-10, -32, 20, 27, 5), '#4d7c0f');
    shape(c, rr(-7, -28, 14, 10, 3), '#65a30d', 1.3);
    line(c, [-6, -23, 6, -23], '#a3e635', 1.2);
    shape(c, rr(-10, -9, 20, 4.4, 1.6), '#365314', 1.3);
    shape(c, el(-11, -30, 6.6, 5.4, -0.2), '#65a30d'); shape(c, el(11, -30, 6.6, 5.4, 0.2), '#65a30d');
    shape(c, rr(2, -22, 22, 6, 2), '#374151');
    shape(c, rr(22, -21, 6, 3.6, 1), '#1f2937', 1.2);
    shape(c, rr(8, -17, 4, 6, 1), '#1f2937', 1.2);
    dot(c, 18, -19, 1.1, '#fb923c');
    shape(c, el(4, -18, 3.6, 3.6), '#4d7c0f', 1.3);
    shape(c, rr(-8.5, -47, 17, 16, 7), '#4d7c0f');
    shape(c, rr(-2, -43, 11, 6.4, 3), '#fb923c', 1.4);
    line(c, [0, -41, 7, -41], 'rgba(255,255,255,.8)', 1.1);
    line(c, [-5, -47, -7, -52], OL, 1.6); dot(c, -7.2, -52.6, 1.8, '#a3e635');
  },
  ghostagent(c) {
    shape(c, rr(0, -23, 30, 3.6, 1.4), '#1f2937');
    shape(c, rr(8, -27, 9, 4, 1.4), '#374151', 1.2); dot(c, 16, -25, 1.2, '#22e3ff');
    shape(c, rr(4, -21, 4, 6, 1), '#1f2937', 1.2);
    shape(c, c => { c.moveTo(-8, -32); c.quadraticCurveTo(-14, -16, -12, -3); c.quadraticCurveTo(0, 0, 10, -3); c.quadraticCurveTo(11, -18, 8, -32); c.quadraticCurveTo(0, -35, -8, -32); c.closePath(); }, '#374151');
    line(c, [-3, -30, -5, -5], '#4b5563', 1.4);
    shape(c, rr(-8.4, -14, 17, 3.4, 1.2), '#111827', 1.2);
    shape(c, el(6, -20, 3, 3), '#4b5563', 1.3);
    shape(c, c => { c.moveTo(-9, -32); c.quadraticCurveTo(-11, -46, 0, -46); c.quadraticCurveTo(10, -46, 9, -32); c.quadraticCurveTo(0, -29, -9, -32); c.closePath(); }, '#4b5563');
    shape(c, el(1.4, -36.5, 6.4, 6), '#1f2937', 1.3);
    shape(c, rr(-2.6, -39.4, 10.4, 4.4, 2), '#0e7490', 1.2);
    dot(c, 0.4, -37.2, 1.4, '#22e3ff'); dot(c, 5, -37.2, 1.4, '#22e3ff');
    line(c, [-1, -40.6, 6.6, -40.6], 'rgba(255,255,255,.5)', 0.8);
  },
  rockracer(c) {
    line(c, [-15, -14, -18, -24], OL, 2.6); shape(c, rr(-24, -27, 12, 4, 1.4), '#dc2626', 1.4);
    shape(c, c => { c.moveTo(-20, -6); c.lineTo(-20, -14); c.quadraticCurveTo(-12, -18, -4, -17); c.lineTo(4, -21); c.quadraticCurveTo(10, -21, 13, -15); c.lineTo(22, -12); c.quadraticCurveTo(25, -9, 22, -6); c.closePath(); }, '#dc2626');
    line(c, [-19, -11, 21, -9], '#fff', 2.2);
    shape(c, el(3, -20, 5.6, 5), '#fcd34d', 1.4);
    shape(c, rr(2, -22, 6, 3, 1.2), '#1f2937', 1);
    shape(c, rr(-12, -24, 13, 5.6, 2), '#4b5563', 1.4);
    shape(c, poly(1, -24, 6, -21.2, 1, -18.4), '#ff8a1f', 1.1);
    for (const wx of [-12, 13]) { shape(c, el(wx, -6, 6, 6), '#1f2937', 1.8); shape(c, el(wx, -6, 2.6, 2.6), '#9ca3af', 1); }
    shape(c, el(-8, -12.5, 3.4, 3), '#fff', 1); txt(c, '7', -8, -12.3, 4.4, OL);
    shape(c, poly(-20, -9, -26, -11, -24, -8, -27, -6, -20, -7), '#ffb347', 1);
  },
  titanbeta(c) {
    shape(c, rr(-15, -16, 11, 15, 3), '#57534e'); shape(c, rr(4, -16, 11, 15, 3), '#57534e');
    shape(c, rr(-21, -52, 42, 40, 8), '#78716c');
    c.strokeStyle = '#57534e'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-21, -38); c.lineTo(-8, -38); c.lineTo(-8, -52); c.moveTo(6, -52); c.lineTo(6, -30); c.lineTo(21, -30); c.moveTo(-21, -22); c.lineTo(4, -22); c.stroke();
    c.beginPath(); c.moveTo(-2, -48); c.lineTo(2, -42); c.lineTo(-1, -37); c.lineTo(3, -31); c.strokeStyle = '#ffb347'; c.lineWidth = 1.8; c.stroke();
    c.save(); c.translate(-10, -29); c.rotate(-0.18); shape(c, rr(-9.5, -4.4, 19, 8.8, 1.6), '#ffe14d', 1.4); txt(c, 'BETA', 0, 0.4, 6.4, '#b91c1c'); c.restore();
    shape(c, rr(-30, -50, 11, 30, 5), '#78716c'); shape(c, el(-25, -18, 7, 6), '#57534e');
    shape(c, rr(19, -50, 11, 30, 5), '#78716c'); shape(c, el(25, -18, 7, 6), '#57534e');
    shape(c, rr(-11, -66, 22, 16, 4), '#a8a29e');
    shape(c, rr(-8, -61, 16, 5, 2), '#1c1917', 1.2);
    dot(c, -4, -58.5, 1.8, '#ff7a1a'); dot(c, 4, -58.5, 1.8, '#ff7a1a');
    shape(c, el(-17, -52, 6, 2.6), '#65a30d', 1.2); shape(c, el(14, -66, 5, 2.2), '#65a30d', 1.2);
  },
  o_tower(c) {
    shape(c, rr(-21, -8, 42, 8, 2), '#6b5a45');
    for (const [x, y, w, h, col, t] of [[-19, -30, 38, 22, '#b45309', 'CANCELADO'], [-16, -50, 32, 20, '#7c3aed', 'BETA'], [-17, -66, 34, 16, '#0e7490', '?']]) {
      shape(c, rr(x, y, w, h, 2), col); shape(c, rr(x + 3, y + 3, w - 6, h * 0.42, 1.4), 'rgba(255,255,255,.22)', 0);
      txt(c, t, x + w / 2, y + h * 0.7, t.length > 4 ? 5.6 : 7, '#fff6ea');
    }
    c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(-19, -30); c.lineTo(-12, -30); c.moveTo(-19, -30); c.lineTo(-19, -23); c.moveTo(-19, -26.5); c.quadraticCurveTo(-16, -27, -15.5, -30); c.stroke();
    shape(c, rr(-14, -88, 28, 22, 4), '#d6cfc0');
    shape(c, rr(-10, -84, 20, 14, 3), '#1f2937', 1.4);
    dot(c, -4, -78, 1.8, '#ff9a3c'); dot(c, 4, -78, 1.8, '#ff9a3c');
    shape(c, rr(-5, -66.6, 10, 3, 1), '#a8a29e', 1.2);
  },
  o_base(c) {
    shape(c, rr(-56, -9, 112, 10, 3), '#6b5a45');
    shape(c, rr(-48, -66, 96, 58, 3), '#8a7a63');
    c.strokeStyle = '#75664f'; c.lineWidth = 1.2; c.beginPath(); for (let x = -44; x < 48; x += 8) { c.moveTo(x, -64); c.lineTo(x, -10); } c.stroke();
    shape(c, c => { c.moveTo(-54, -64); c.quadraticCurveTo(0, -102, 54, -64); c.closePath(); }, '#9ca3af');
    c.strokeStyle = '#7d8597'; c.lineWidth = 1.2; c.beginPath(); for (let i = -4; i <= 4; i++) { c.moveTo(i * 11, -64); c.lineTo(i * 6, -82 + Math.abs(i) * 2.2); } c.stroke();
    shape(c, rr(-17, -40, 34, 32, 2), '#4b4237', 1.8);
    c.strokeStyle = '#6b5a45'; c.lineWidth = 1.2; c.beginPath(); for (let y = -36; y < -9; y += 4) { c.moveTo(-15, y); c.lineTo(15, y); } c.stroke();
    shape(c, rr(-30, -60, 60, 13, 2), '#2a2118', 1.6);
    txt(c, 'ALMACÉN', 0, -53, 8.6, '#ffcb3d');
    for (const [x, y, sz] of [[-40, -9, 13], [-27, -9, 10], [-38, -22, 10], [30, -9, 13], [41, -9, 10]]) { shape(c, rr(x - sz / 2, y - sz, sz, sz, 1), '#c9955a', 1.4); line(c, [x - sz / 2, y - sz * 0.55, x + sz / 2, y - sz * 0.55], '#a0703c', 1); }
    c.save(); c.translate(31, -16); c.rotate(-0.2); c.strokeStyle = '#dc2626'; c.lineWidth = 1; c.strokeRect(-8, -2.6, 16, 5.2); c.fillStyle = '#dc2626'; c.font = '3.8px ' + FONT_D; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('CANCELADO', 0, 0.3); c.restore();
    line(c, [30, -76, 30, -106], OL, 3.4); line(c, [30, -76, 30, -106], '#d6cfc0', 1.6);
    shape(c, poly(30, -106, 50, -101, 30, -94), '#a16207', 1.5);
    txt(c, '?', 37, -100, 6.4, '#fff6ea');
  },
});
