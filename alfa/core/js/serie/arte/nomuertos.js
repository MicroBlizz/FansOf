// Fans Of · Arte: los dibujos de No muertos (cada uno se dibuja en el suelo, con el origen bajo los pies y la altura en y negativa)
'use strict';
Object.assign(ART, {
  sombra(c) {
    shape(c, c => { c.moveTo(-14, -8); c.quadraticCurveTo(-17, -26, -12, -38); c.quadraticCurveTo(0, -50, 12, -38); c.quadraticCurveTo(17, -26, 14, -8); c.lineTo(9, -2); c.lineTo(5, -7); c.lineTo(0, 0); c.lineTo(-5, -7); c.lineTo(-9, -2); c.closePath(); }, '#3b1d5c');
    shape(c, c => { c.moveTo(-9, -12); c.quadraticCurveTo(-11, -26, -8, -34); c.quadraticCurveTo(0, -42, 8, -34); c.quadraticCurveTo(11, -26, 9, -12); c.quadraticCurveTo(0, -8, -9, -12); c.closePath(); }, '#24103a', 0);
    shape(c, c => { c.moveTo(-9, -24); c.quadraticCurveTo(0, -42, 9, -24); c.quadraticCurveTo(0, -20, -9, -24); c.closePath(); }, '#0e0618', 1.6);
    shape(c, el(-3.6, -28, 2.2, 1.5, 0.2), '#7dffb8', 0); shape(c, el(3.6, -28, 2.2, 1.5, -0.2), '#7dffb8', 0);
    c.globalAlpha = 0.35; dot(c, -3.6, -28, 4.2, '#7dffb8'); dot(c, 3.6, -28, 4.2, '#7dffb8'); c.globalAlpha = 1;
    for (const sx of [-1, 1]) {
      c.save(); c.translate(sx * 13, -20); c.scale(sx, 1);
      shape(c, c => { c.moveTo(0, -3); c.quadraticCurveTo(7, -2, 8, 5); c.lineTo(5, 3); c.lineTo(4.4, 7); c.lineTo(2, 3.6); c.lineTo(0, 6); c.closePath(); }, '#3b1d5c', 1.6);
      line(c, [5, 3, 9, 8], '#d9c8ff', 1.4); line(c, [2.4, 4, 4, 9], '#d9c8ff', 1.4);
      c.restore();
    }
  },
  sp_lapidas(c) { spBg(c, 'd'); shape(c, c => { c.moveTo(-11, -9); c.lineTo(-11, -28); c.quadraticCurveTo(-11, -40, 0, -40); c.quadraticCurveTo(11, -40, 11, -28); c.lineTo(11, -9); c.closePath(); }, '#b9bfcc', 2.2); otxt(c, 'RIP', 0, -26, 9, OL); line(c, [3, -38, 1, -33, 5, -30], OL, 1.2); shape(c, rr(-14, -11, 28, 4, 1.6), '#6b7280', 1.6); line(c, [-16, -38, -13, -42], '#fff6ea', 1.6); line(c, [15, -40, 13, -44], '#fff6ea', 1.6); },
  sp_formol(c) { spBg(c, 'h'); shape(c, c => { c.moveTo(-4, -38); c.lineTo(4, -38); c.lineTo(4, -30); c.quadraticCurveTo(13, -26, 12, -17); c.quadraticCurveTo(11, -8, 0, -8); c.quadraticCurveTo(-11, -8, -12, -17); c.quadraticCurveTo(-13, -26, -4, -30); c.closePath(); }, '#e5fff1', 2.2); shape(c, c => { c.moveTo(-11.6, -19); c.quadraticCurveTo(0, -23, 11.6, -19); c.quadraticCurveTo(11, -9, 0, -9); c.quadraticCurveTo(-11, -9, -11.6, -19); c.closePath(); }, '#7dffb8', 0); shape(c, rr(-5, -43, 10, 6, 1.6), '#a86b3c', 1.6); for (const [x, y, r] of [[-4, -15, 1.8], [3, -18, 1.3], [5, -13, 1]]) shape(c, el(x, y, r, r), '#e5fff1', 0.8); },
  sp_eternas(c) { spBg(c, 'c'); shape(c, el(0, -23, 14, 14), '#fff6ea', 2.4); for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; line(c, [Math.cos(a) * 11, -23 + Math.sin(a) * 11, Math.cos(a) * 12.6, -23 + Math.sin(a) * 12.6], OL, 1.2); } line(c, [0, -23, -1, -32], OL, 2); line(c, [0, -23, 6, -21], OL, 2); dot(c, 0, -23, 1.6, '#7d5fff'); otxt(c, 'Zz', 12, -38, 9, '#fff6ea'); },
  sp_crunch(c) { spBg(c, 'c'); shape(c, rr(-12, -34, 20, 22, 3), '#fff6ea', 2.2); shape(c, rr(-10, -32, 16, 6, 1.5), '#5a361b', 1.2); line(c, [8, -30, 13, -30, 13, -20, 8, -20], OL, 2.2); for (let i = 0; i < 3; i++) line(c, [-6 + i * 5, -40, -8 + i * 5, -46, -5 + i * 5, -50], '#fff6ea', 1.4); otxt(c, '24/7', 0, -6, 9, '#ff8a3d'); },
  necrolord(c) {
    line(c, [15, -2, 18, -58], OL, 4.2); line(c, [15, -2, 18, -58], '#5a4630', 2.2);
    shape(c, el(18, -61, 5, 4.6), '#efeadf', 1.5); dot(c, 16.3, -61.6, 1.3, '#5ef2d0'); dot(c, 19.7, -61.6, 1.3, '#5ef2d0');
    shape(c, poly(14, -63, 13, -68, 16, -65), '#8d9cc0', 1.1); shape(c, poly(22, -63, 23, -68, 20, -65), '#8d9cc0', 1.1);
    shape(c, c => { c.moveTo(-10, -36); c.lineTo(10, -36); c.lineTo(16, -2); c.quadraticCurveTo(0, 2, -16, -2); c.closePath(); }, '#3b2457');
    shape(c, poly(-4, -34, 4, -34, 6, -1, -6, -1), '#2a1840', 1.2);
    c.beginPath(); c.moveTo(-15.5, -4); c.quadraticCurveTo(0, 0, 15.5, -4); c.strokeStyle = '#5ef2d0'; c.lineWidth = 1.8; c.stroke();
    shape(c, rr(-10, -22, 20, 3.6, 1.2), '#5c6d8a', 1.2); dot(c, 0, -20.2, 1.9, '#efeadf');
    shape(c, el(14.5, -26, 3, 3), '#efeadf', 1.3); shape(c, el(-13, -24, 2.8, 3), '#efeadf', 1.3);
    shape(c, el(-11, -36, 7, 4.6, -0.2), '#5c6d8a'); shape(c, el(11, -36, 7, 4.6, 0.2), '#5c6d8a');
    shape(c, poly(-14, -38.5, -19, -46, -10, -40.5), '#8d9cc0', 1.3); shape(c, poly(14, -38.5, 19, -46, 10, -40.5), '#8d9cc0', 1.3);
    shape(c, el(0, -44, 8.6, 8.4), '#efeadf');
    shape(c, rr(-5, -38.5, 10, 5, 1.5), '#efeadf', 1.4);
    line(c, [-2.5, -38.5, -2.5, -34], OL, 0.8); line(c, [0, -38.5, 0, -34], OL, 0.8); line(c, [2.5, -38.5, 2.5, -34], OL, 0.8);
    shape(c, el(-3.4, -44.6, 2.6, 2.8), '#1a1022', 0); shape(c, el(3.4, -44.6, 2.6, 2.8), '#1a1022', 0);
    dot(c, -3.4, -44.6, 1.25, '#5ef2d0'); dot(c, 3.4, -44.6, 1.25, '#5ef2d0');
    shape(c, poly(-0.9, -41, 0.9, -41, 0, -39.6), '#1a1022', 0);
    shape(c, c => { c.moveTo(-8, -49); c.lineTo(-9, -58); c.lineTo(-5, -53); c.lineTo(-3, -62); c.lineTo(0, -54); c.lineTo(3, -62); c.lineTo(5, -53); c.lineTo(9, -58); c.lineTo(8, -49); c.quadraticCurveTo(0, -47, -8, -49); c.closePath(); }, '#4a5677', 1.6);
    dot(c, 0, -51, 1.5, '#5ef2d0');
  },
  skeleton(c) {
    line(c, [6, -8, 10.5, -20], OL, 3.8); line(c, [6, -8, 10.5, -20], '#efeadf', 2); shape(c, el(11, -21.4, 2.6, 2.6), '#efeadf', 1.2);
    shape(c, el(0, -9, 6, 7), '#efeadf');
    line(c, [0, -15, 0, -3], OL, 1); line(c, [-4, -11.5, 4, -11.5], OL, 0.9); line(c, [-4.6, -8.8, 4.6, -8.8], OL, 0.9); line(c, [-3.8, -6, 3.8, -6], OL, 0.9);
    line(c, [-5, -12, -8.5, -6], OL, 2.6); line(c, [-5, -12, -8.5, -6], '#efeadf', 1.2);
    shape(c, el(0, -20, 6.6, 6.2), '#efeadf');
    shape(c, rr(-3.6, -16.2, 7.2, 3.4, 1), '#efeadf', 1.1); line(c, [-1.2, -16.2, -1.2, -12.8], OL, 0.6); line(c, [1.2, -16.2, 1.2, -12.8], OL, 0.6);
    shape(c, el(-2.4, -20.6, 1.8, 2), '#1a1022', 0); shape(c, el(2.4, -20.6, 1.8, 2), '#1a1022', 0);
    dot(c, -2.4, -20.6, 0.75, '#5ef2d0'); dot(c, 2.4, -20.6, 0.75, '#5ef2d0');
    shape(c, c => { c.moveTo(-6.6, -22); c.quadraticCurveTo(0, -29.5, 6.6, -22); c.quadraticCurveTo(0, -24.2, -6.6, -22); c.closePath(); }, '#e2463b', 1.3);
    shape(c, poly(5.4, -23, 10, -25.4, 9, -21), '#e2463b', 1.1);
  },
  zombie(c) {
    shape(c, el(-10, -15, 5, 2.6, 0.2), '#8fbf6a', 1.4); shape(c, el(10, -15, 5, 2.6, -0.2), '#8fbf6a', 1.4);
    shape(c, c => { c.moveTo(-8.5, -21); c.lineTo(8.5, -21); c.lineTo(8.5, -4); c.lineTo(6, -2); c.lineTo(4, -4.5); c.lineTo(1, -2); c.lineTo(-2, -4.5); c.lineTo(-5, -2); c.lineTo(-8.5, -4); c.closePath(); }, '#bcd3e8');
    shape(c, poly(-1.4, -20.5, 1.4, -20.5, 2.4, -9.5, 0, -7, -2.4, -9.5), '#e2463b', 1.1);
    shape(c, rr(2.6, -15.5, 5.4, 4.2, 0.8), '#fff', 1); c.fillStyle = '#2e8bff'; c.fillRect(3, -15.1, 4.6, 1.3);
    shape(c, el(-12.5, -14.5, 2.2, 2.2), '#8fbf6a', 1.2); shape(c, el(12.5, -14.5, 2.2, 2.2), '#8fbf6a', 1.2);
    shape(c, el(0, -27, 8, 7.6), '#8fbf6a');
    shape(c, c => { c.moveTo(-8, -29); c.quadraticCurveTo(-7, -36, 0, -35.5); c.quadraticCurveTo(7, -36, 8, -29); c.lineTo(5, -31); c.lineTo(3, -29.5); c.lineTo(0, -31.5); c.lineTo(-3, -29.5); c.lineTo(-5, -31); c.closePath(); }, '#4a3a2a', 1.4);
    shape(c, el(-3.2, -27, 2.4, 2.4), '#fffbe0', 1.1); shape(c, el(3.4, -27.4, 1.8, 1.8), '#fffbe0', 1.1);
    dot(c, -3, -26.8, 0.9, OL); dot(c, 3.6, -27.2, 0.7, OL);
    c.strokeStyle = '#6b4e8a'; c.lineWidth = 1; c.beginPath(); c.arc(-3.2, -25.2, 2.4, 0.4, Math.PI - 0.4); c.stroke(); c.beginPath(); c.arc(3.4, -25.6, 1.9, 0.4, Math.PI - 0.4); c.stroke();
    shape(c, el(0, -22.2, 2.2, 1.6), '#3a1a22', 1);
    line(c, [4.8, -24.6, 6.8, -22.4], OL, 0.8); line(c, [5.2, -22.6, 6.4, -24.4], OL, 0.6);
  },
  ghostmage(c) {
    shape(c, c => { c.moveTo(-10, -30); c.quadraticCurveTo(-11, -14, -8, -6); c.quadraticCurveTo(-6, -1, -3, -5); c.quadraticCurveTo(0, 0, 3, -5); c.quadraticCurveTo(6, -1, 8, -6); c.quadraticCurveTo(11, -14, 10, -30); c.closePath(); }, 'rgba(190,240,235,.93)');
    shape(c, rr(-9.6, -26, 19.2, 4, 1.5), '#6a3fb0', 1.2);
    shape(c, rr(-17, -22, 8, 10, 1.2), '#6a3fb0', 1.3); line(c, [-13, -22, -13, -12], '#ffcb3d', 1.1);
    shape(c, el(13, -20, 3.6, 3.6), '#9ff0ff', 1.2); dot(c, 13, -20, 1.5, '#ffffff');
    shape(c, el(0, -33, 9, 8.5), 'rgba(205,246,240,.97)');
    shape(c, el(-3.4, -33, 1.8, 2.6), '#1a1022', 0); shape(c, el(3.4, -33, 1.8, 2.6), '#1a1022', 0);
    dot(c, -3.4, -33.4, 0.8, '#5ef2d0'); dot(c, 3.4, -33.4, 0.8, '#5ef2d0');
    shape(c, el(0, -28.8, 1.4, 1.8), '#1a1022', 0);
    shape(c, c => { c.moveTo(-10, -38.5); c.quadraticCurveTo(-4, -46, -2, -57); c.quadraticCurveTo(3, -50, 6, -46); c.quadraticCurveTo(8, -42, 10, -38.5); c.closePath(); }, '#6a3fb0', 1.8);
    shape(c, el(0, -38.6, 12.5, 2.8), '#5a32a0', 1.6);
    shape(c, c => starPath(c, 1.5, -45, 2.6, 1.1), '#ffcb3d', 0.8);
  },
  banshee(c) {
    shape(c, c => { c.moveTo(-8, -40); c.quadraticCurveTo(-18, -30, -15, -10); c.quadraticCurveTo(-12, -14, -10, -12); c.quadraticCurveTo(-8, -24, -6, -30); c.closePath(); }, '#e9ecf7', 1.6);
    shape(c, c => { c.moveTo(8, -40); c.quadraticCurveTo(18, -30, 15, -10); c.quadraticCurveTo(12, -14, 10, -12); c.quadraticCurveTo(8, -24, 6, -30); c.closePath(); }, '#e9ecf7', 1.6);
    shape(c, c => { c.moveTo(-8, -26); c.quadraticCurveTo(-11, -12, -9, -4); c.lineTo(-6, -7); c.lineTo(-3, -2); c.lineTo(0, -6); c.lineTo(3, -2); c.lineTo(6, -7); c.lineTo(9, -4); c.quadraticCurveTo(11, -12, 8, -26); c.closePath(); }, 'rgba(214,200,245,.95)');
    line(c, [-5, -20, 5, -20], '#a68fd8', 1.2);
    shape(c, el(-6.5, -27.6, 2.4, 2.4), '#d6d0ee', 1.2); shape(c, el(6.5, -27.6, 2.4, 2.4), '#d6d0ee', 1.2);
    shape(c, el(0, -34, 7.6, 7.6), '#e3def5');
    shape(c, c => { c.moveTo(-8, -35); c.quadraticCurveTo(-7, -43.5, 0, -43); c.quadraticCurveTo(7, -43.5, 8, -35); c.quadraticCurveTo(4, -39, 0, -38); c.quadraticCurveTo(-4, -39, -8, -35); c.closePath(); }, '#ffffff', 1.4);
    shape(c, el(-3, -34.5, 1.6, 2), '#5ef2d0', 0.8); shape(c, el(3, -34.5, 1.6, 2), '#5ef2d0', 0.8);
    shape(c, el(0, -30.2, 2, 2.8), '#2a1030', 1);
  },
  skullknight(c) {
    shape(c, c => { c.moveTo(-11, -34); c.lineTo(11, -34); c.lineTo(15, -4); c.lineTo(10, -7); c.lineTo(6, -3); c.lineTo(2, -7); c.lineTo(-2, -3); c.lineTo(-6, -7); c.lineTo(-10, -3); c.lineTo(-15, -4); c.closePath(); }, '#24304f');
    shape(c, poly(14.5, -14, 15.5, -50, 18, -54, 20.5, -50, 21.5, -14), '#9fe3ff', 1.5);
    line(c, [18, -48, 18, -18], '#5ef2d0', 1.2);
    shape(c, rr(12, -15, 12, 3.4, 1.2), '#4a5677', 1.4); shape(c, rr(16.4, -12, 3.2, 7, 1), '#3b2a1e', 1.2);
    shape(c, el(0, -18, 12.5, 13), '#4a5677');
    shape(c, el(0, -19, 6.4, 7.4), '#5c6d8a', 0);
    shape(c, poly(0, -24, 2.6, -19, 0, -14, -2.6, -19), '#5ef2d0', 0.8);
    shape(c, rr(-11, -9, 22, 3.4, 1.2), '#2f3a5c', 1.2);
    shape(c, el(-12, -29, 6.4, 4.6, -0.2), '#5c6d8a'); shape(c, el(12, -29, 6.4, 4.6, 0.2), '#5c6d8a');
    shape(c, el(-12.5, -15, 2.8, 3), '#efeadf', 1.2);
    shape(c, c => { c.moveTo(-7.5, -42); c.quadraticCurveTo(-15, -45, -15, -53); c.quadraticCurveTo(-11, -47, -5.5, -46.5); c.closePath(); }, '#d9d2c2', 1.4);
    shape(c, c => { c.moveTo(7.5, -42); c.quadraticCurveTo(15, -45, 15, -53); c.quadraticCurveTo(11, -47, 5.5, -46.5); c.closePath(); }, '#d9d2c2', 1.4);
    shape(c, el(0, -39, 9, 8.6), '#efeadf');
    shape(c, c => { c.moveTo(-9.2, -39); c.quadraticCurveTo(-9, -48.5, 0, -48.6); c.quadraticCurveTo(9, -48.5, 9.2, -39); c.lineTo(5, -41); c.lineTo(0, -38.5); c.lineTo(-5, -41); c.closePath(); }, '#2f3a5c', 1.6);
    shape(c, el(-3.3, -37.4, 2.2, 2), '#1a1022', 0); shape(c, el(3.3, -37.4, 2.2, 2), '#1a1022', 0);
    dot(c, -3.3, -37.4, 1.1, '#5ef2d0'); dot(c, 3.3, -37.4, 1.1, '#5ef2d0');
    shape(c, rr(-4, -34.6, 8, 3, 1), '#efeadf', 1.1); line(c, [-1.3, -34.6, -1.3, -31.6], OL, 0.6); line(c, [1.3, -34.6, 1.3, -31.6], OL, 0.6);
  },
  stitchbrute(c) {
    c.beginPath(); c.arc(-24, -12, 4.2, 0.2, Math.PI * 1.4); c.strokeStyle = OL; c.lineWidth = 3.6; c.stroke(); c.strokeStyle = '#c9cfe0'; c.lineWidth = 1.8; c.stroke();
    shape(c, el(-20, -22, 6, 8.4, 0.35), '#9cb88a');
    shape(c, rr(21, -42, 13, 11, 1.5), '#c9cfe0', 1.4); shape(c, rr(24.6, -32, 3.4, 9, 1), '#5a3a20', 1.2);
    shape(c, el(20, -24, 6, 8.4, -0.35), '#9cb88a');
    shape(c, el(0, -22, 20, 19), '#9cb88a');
    shape(c, poly(4, -36, 15, -31, 13, -22, 3, -25), '#c6a4c9', 1.2);
    shape(c, el(-7, -14, 7, 5, 0.2), '#b5cfa4', 0);
    c.strokeStyle = OL; c.lineWidth = 1.1; c.beginPath(); c.moveTo(-15, -27); c.lineTo(11, -12);
    for (let i = 0; i <= 6; i++) { const x = -15 + i * 4.3, y = -27 + i * 2.5; c.moveTo(x - 1.4, y + 2.2); c.lineTo(x + 1.4, y - 2.2); }
    c.stroke();
    dot(c, -10, -6, 1.6, '#7be04a'); dot(c, 6, -5, 1.2, '#7be04a');
    shape(c, el(0, -42, 8.4, 7.4), '#9cb88a');
    line(c, [-6, -47, 5, -48.4], OL, 1); line(c, [-3, -49.2, -2.4, -45.6], OL, 0.8); line(c, [1.6, -49.6, 2.2, -46], OL, 0.8);
    shape(c, el(-3, -42.8, 2.8, 3), '#fffbe0', 1.1); dot(c, -2.6, -42.6, 1.1, OL);
    shape(c, el(3.6, -42.4, 1.5, 1.5), '#fffbe0', 1); dot(c, 3.7, -42.4, 0.6, OL);
    shape(c, c => { c.moveTo(-4, -38.4); c.lineTo(-2, -36.6); c.lineTo(0, -38); c.lineTo(2, -36.6); c.lineTo(4, -38.4); c.quadraticCurveTo(0, -35, -4, -38.4); c.closePath(); }, '#3a1a22', 1);
    c.fillStyle = '#fff'; c.fillRect(-0.6, -38.2, 1.3, 1.4);
  },
  u_tower(c) {
    shape(c, c => { c.moveTo(-16, -56); c.lineTo(-19, -2); c.quadraticCurveTo(0, 6, 19, -2); c.lineTo(16, -56); c.closePath(); }, '#6b6a7d');
    c.strokeStyle = '#55546a'; c.lineWidth = 1.2; c.beginPath();
    for (let y = -48; y < -4; y += 9) { c.moveTo(-17, y); c.lineTo(17, y); }
    for (let y = -52, r = 0; y < -6; y += 9, r++) for (let x = r % 2 ? -10 : -4; x < 16; x += 12) { c.moveTo(x, y); c.lineTo(x, y + 9); }
    c.stroke();
    shape(c, el(-12, -3, 6, 3.4), '#3f5c40', 1.2); shape(c, el(10, -2, 7, 3.6), '#3f5c40', 1.2);
    line(c, [-8, -32, 8, -18], OL, 4.2); line(c, [-8, -32, 8, -18], '#efeadf', 2.2); line(c, [8, -32, -8, -18], OL, 4.2); line(c, [8, -32, -8, -18], '#efeadf', 2.2);
    shape(c, el(0, -25, 4.8, 4.6), '#efeadf', 1.3); dot(c, -1.7, -25.4, 1.1, '#1a1022'); dot(c, 1.7, -25.4, 1.1, '#1a1022');
    shape(c, c => { c.moveTo(-20, -58); c.lineTo(20, -58); c.quadraticCurveTo(16, -50, 0, -50); c.quadraticCurveTo(-16, -50, -20, -58); c.closePath(); }, '#4a4960');
    shape(c, el(0, -58, 20, 5), '#2a2938', 1.6);
    shape(c, c => { c.moveTo(-10, -58); c.quadraticCurveTo(-12, -68, -4, -76); c.quadraticCurveTo(-4, -70, 0, -68); c.quadraticCurveTo(1, -78, 6, -82); c.quadraticCurveTo(5, -72, 9, -68); c.quadraticCurveTo(13, -63, 10, -58); c.closePath(); }, '#5ef2a0', 1.6);
    shape(c, c => { c.moveTo(-4, -58); c.quadraticCurveTo(-5, -65, 0, -70); c.quadraticCurveTo(1, -64, 4, -62); c.quadraticCurveTo(6, -60, 4, -58); c.closePath(); }, '#d4ffe6', 0);
  },
  u_base(c) {
    shape(c, c => { c.moveTo(-50, -7); c.lineTo(50, -7); c.lineTo(52, 0); c.quadraticCurveTo(0, 8, -52, 0); c.closePath(); }, '#5a596e');
    shape(c, rr(-43, -68, 86, 62, 3), '#7d7c92');
    c.strokeStyle = '#68677e'; c.lineWidth = 1.1; c.beginPath(); for (let y = -60; y < -8; y += 9) { c.moveTo(-42, y); c.lineTo(42, y); } c.stroke();
    for (const x of [-35, -21, 21, 35]) shape(c, rr(x - 3.6, -64, 7.2, 58, 1.5), '#a3a2b8', 1.4);
    shape(c, poly(-49, -67, 0, -98, 49, -67), '#5a596e', 2);
    shape(c, poly(-38, -70, 0, -92, 38, -70), '#6b6a7d', 0);
    shape(c, el(0, -79, 6.2, 5.8), '#efeadf', 1.4); dot(c, -2.2, -79.6, 1.4, '#5ef2d0'); dot(c, 2.2, -79.6, 1.4, '#5ef2d0');
    shape(c, c => { c.moveTo(-12.5, -7); c.lineTo(-12.5, -31); c.arc(0, -31, 12.5, Math.PI, 0); c.lineTo(12.5, -7); c.closePath(); }, '#141020', 1.8);
    shape(c, c => { c.moveTo(-8, -7); c.lineTo(-8, -29); c.arc(0, -29, 8, Math.PI, 0); c.lineTo(8, -7); c.closePath(); }, '#1f4a38', 0);
    line(c, [0, -98, 0, -116], OL, 3.6); line(c, [0, -98, 0, -116], '#c9c3b0', 1.8);
    shape(c, poly(0, -116, 21, -112, 15, -107, 21, -102, 0, -103), '#6a3fb0', 1.6);
    dot(c, 9, -109, 2.2, '#efeadf');
    for (const x of [-21, 21]) { shape(c, rr(x - 2, -15, 4, 8, 1), '#f3e6cc', 1); shape(c, el(x, -17.5, 1.6, 2.6), '#5ef2a0', 0.8); }
  },
  u_rubble(c) {
    shape(c, el(0, -3, 23, 8), '#5a596e');
    shape(c, poly(-17, -3, -16, -16, -10, -12, -6, -20, 0, -13, 6, -18, 12, -11, 17, -14, 17, -3), '#6b6a7d');
    shape(c, rr(-25, -8, 12, 7, 1.5), '#7d7c92', 1.5); shape(c, rr(11, -7, 14, 6, 1.5), '#7d7c92', 1.5);
    line(c, [-6, -2, 6, -6], OL, 3.4); line(c, [-6, -2, 6, -6], '#efeadf', 1.8);
    shape(c, el(3, -10, 3.8, 3.4), '#efeadf', 1.2);
  },
});
