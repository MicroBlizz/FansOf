// Fans Of · Arte: los dibujos de Animales (cada uno se dibuja en el suelo, con el origen bajo los pies y la altura en y negativa)
'use strict';
Object.assign(ART, {
  /* ---------- v0.9.15: mata-sanadores del gashapón de cartas (uno por facción) ---------- */
  huron(c) {
    shape(c, c => { c.moveTo(-5, -9); c.bezierCurveTo(-21, -7, -27, -20, -20, -29); c.bezierCurveTo(-17, -24, -12, -18, -3, -15); c.closePath(); }, '#9a6634');
    shape(c, c => { c.moveTo(-20, -29); c.bezierCurveTo(-24, -32, -26, -27, -23, -24); c.quadraticCurveTo(-21, -27, -20, -29); c.closePath(); }, '#2b1622', 1.4);
    line(c, [-9, -4, 10, -41], OL, 4.4); line(c, [-9, -4, 10, -41], '#e5e7eb', 2.2);
    line(c, [6, -33, 11, -44], OL, 4); line(c, [6, -33, 11, -44], '#7b2cbf', 2.2); line(c, [3, -32, 9, -35], OL, 2.2);
    shape(c, el(0, -12, 11, 12), '#9a6634');
    shape(c, el(0, -10, 6.5, 8), '#f3dfc0', 0);
    shape(c, el(-11, -14, 3, 4.4, 0.5), '#9a6634', 1.6); shape(c, el(11, -15, 3, 4.4, -0.5), '#9a6634', 1.6);
    shape(c, el(0, -30, 11.5, 9.5), '#9a6634');
    shape(c, el(-8.5, -38, 3.4, 3.4), '#9a6634', 1.6); shape(c, el(8.5, -38, 3.4, 3.4), '#9a6634', 1.6);
    shape(c, el(-8.5, -38, 1.6, 1.6), '#f3b8c8', 0); shape(c, el(8.5, -38, 1.6, 1.6), '#f3b8c8', 0);
    shape(c, el(0, -26.5, 6.4, 4.2), '#f3dfc0', 0);
    shape(c, rr(-11.6, -33.4, 23.2, 6, 3), '#2b1622', 1.6);
    shape(c, el(-4.6, -30.4, 2.6, 1.4), '#fff', 0); shape(c, el(4.6, -30.4, 2.6, 1.4), '#fff', 0);
    dot(c, -4, -30.3, 1, OL); dot(c, 5.2, -30.3, 1, OL);
    line(c, [-7.6, -32.6, -2, -31.2], OL, 1.2); line(c, [2, -31.2, 7.6, -32.6], OL, 1.2);
    shape(c, el(0, -26.6, 1.7, 1.2), '#2b1622', 0);
    shape(c, rr(-11, -37.4, 22, 3.4, 1.4), '#e63946', 1.4);
    shape(c, c => { c.moveTo(-11, -36.4); c.quadraticCurveTo(-17, -39, -20, -35); c.quadraticCurveTo(-16, -36, -11, -34.4); c.closePath(); }, '#e63946', 1.3);
    shape(c, c => { c.moveTo(-11, -35.4); c.quadraticCurveTo(-16, -33, -18, -29); c.quadraticCurveTo(-14, -32, -11, -34); c.closePath(); }, '#e63946', 1.3);
  },
  /* ---------- v0.9.15: hechizos del gashapón de cartas (icono de cada carta) ---------- */
  sp_bellotas(c) { spBg(c, 'd'); for (const [x, y, r] of [[-6, -32, 6], [2, -35, 7.5], [9, -31, 5.6]]) shape(c, el(x, y, r, r * 0.8), '#f5f3ff', 1.8); shape(c, rr(-11, -33, 25, 6, 3), '#f5f3ff', 0); for (const [x, y] of [[-8, -16], [2, -11], [10, -19]]) { shape(c, el(x, y + 1.5, 3.8, 4.4), '#9a6a33', 1.4); shape(c, el(x, y - 2.2, 4.6, 2.2), '#5b3a1c', 1.4); line(c, [x, y - 4.6, x + 1, y - 6.6], OL, 1.2); } },
  sp_botiquin(c) { spBg(c, 'h'); shape(c, c => { c.moveTo(-5, -33); c.quadraticCurveTo(-5, -38, 0, -38); c.quadraticCurveTo(5, -38, 5, -33); }, null, 2.6); line(c, [-5, -33, -5, -30], OL, 2.6); line(c, [5, -33, 5, -30], OL, 2.6); shape(c, rr(-15, -31, 30, 21, 4), '#fff6ea', 2.2); shape(c, poly(-2.6, -28, 2.6, -28, 2.6, -23, 7.6, -23, 7.6, -18, 2.6, -18, 2.6, -13, -2.6, -13, -2.6, -18, -7.6, -18, -7.6, -23, -2.6, -23), '#2f9e3a', 1.4); shape(c, c => { c.moveTo(9, -31); c.quadraticCurveTo(17, -38, 18, -30); c.quadraticCurveTo(14, -29, 9, -31); c.closePath(); }, '#7be04a', 1.3); },
  sp_pulgas(c) { spBg(c, 'c'); for (const [x, y, s] of [[-5, -20, 1], [8, -30, 0.7]]) { c.save(); c.translate(x, y); c.scale(s, s); for (const a of [-1, 0, 1]) { line(c, [a * 3, 4, a * 7 - 2, 11], OL, 1.6); } shape(c, el(0, 0, 8, 6.4), '#8b5530', 2); shape(c, el(-6, -5, 4.6, 4), '#a86b3c', 1.8); shape(c, el(-7.4, -6, 1.6, 1.8), '#fff', 0.8); dot(c, -7.6, -5.8, 0.8, OL); line(c, [-9, -8, -12, -13], OL, 1.2); line(c, [-7, -9, -8, -14], OL, 1.2); c.restore(); } line(c, [-14, -34, -10, -38], '#fff6ea', 1.6); line(c, [-16, -29, -11, -30], '#fff6ea', 1.6); },
  squirrel(c) {
    shape(c, c => { c.moveTo(3, -8); c.bezierCurveTo(20, -6, 27, -24, 19, -36); c.bezierCurveTo(13, -45, 1, -44, 1, -36); c.bezierCurveTo(1, -30, 8, -29, 11, -31); c.bezierCurveTo(14, -24, 11, -15, 1, -15); c.closePath(); }, '#c45a22');
    c.beginPath(); c.moveTo(8, -12); c.bezierCurveTo(19, -13, 21, -27, 15, -35); c.strokeStyle = '#f0a065'; c.lineWidth = 2.6; c.stroke();
    shape(c, el(0, -9, 9.5, 9), '#b14d1c');
    shape(c, el(0, -7.5, 5.6, 6), '#f6d7a7', 0);
    shape(c, el(0, -10.5, 3.4, 3.6), '#9a6a33', 1.5);
    shape(c, el(0, -13.4, 4, 1.9), '#5b3a1c', 1.5);
    shape(c, el(-4.6, -10.5, 2.4, 2.1), '#b14d1c', 1.4);
    shape(c, el(4.6, -10.5, 2.4, 2.1), '#b14d1c', 1.4);
    shape(c, poly(-8, -25, -9.5, -35.5, -2.5, -29), '#b14d1c', 2);
    shape(c, poly(8, -25, 9.5, -35.5, 2.5, -29), '#b14d1c', 2);
    shape(c, poly(-7.4, -27.2, -8.3, -32.6, -4.4, -28.9), '#ff9bb0', 0);
    shape(c, poly(7.4, -27.2, 8.3, -32.6, 4.4, -28.9), '#ff9bb0', 0);
    shape(c, el(0, -21.5, 10, 9.2), '#b14d1c');
    shape(c, el(0, -17.8, 6.2, 4.3), '#f6d7a7', 0);
    shape(c, el(-3.9, -23, 4.1, 4.3), '#fff', 1.5);
    shape(c, el(4.3, -23.6, 3.1, 3.3), '#fff', 1.5);
    dot(c, -2.6, -22.1, 1.7, OL); dot(c, 5.2, -24.7, 1.15, OL); dot(c, -2.1, -22.7, 0.55, '#fff');
    shape(c, el(0, -19.4, 1.8, 1.25), '#3a1a12', 0);
    shape(c, rr(-1.9, -17.9, 3.8, 3.6, 0.9), '#fff', 1.1);
    line(c, [0, -17.9, 0, -14.4], OL, 0.8);
    shape(c, el(-7.2, -18.6, 2.1, 1.2), 'rgba(255,110,140,.5)', 0);
    shape(c, el(7.2, -18.6, 2.1, 1.2), 'rgba(255,110,140,.5)', 0);
  },
  fox(c) {
    shape(c, c => { c.moveTo(-3, -6); c.bezierCurveTo(-20, -4, -28, -18, -22, -32); c.bezierCurveTo(-18, -40, -9, -38, -10, -30); c.bezierCurveTo(-11, -22, -6, -16, -2, -14); c.closePath(); }, '#e8702a');
    shape(c, c => { c.moveTo(-22, -32); c.bezierCurveTo(-18, -40, -9, -38, -10, -30); c.bezierCurveTo(-14, -28.5, -19, -28.5, -22, -32); c.closePath(); }, '#fff4e6', 1.5);
    shape(c, el(0, -10, 10, 10), '#e8702a');
    shape(c, el(0, -8.5, 6, 7), '#fff4e6', 0);
    shape(c, el(-7, -11.5, 2.6, 3.4, 0.35), '#c9561c', 1.4);
    shape(c, el(7, -11.5, 2.6, 3.4, -0.35), '#c9561c', 1.4);
    shape(c, poly(-10, -29, -12.5, -45, -2, -35), '#e8702a', 2);
    shape(c, poly(10, -29, 12.5, -45, 2, -35), '#e8702a', 2);
    shape(c, poly(-11.4, -40.2, -12.5, -45, -8.4, -41.6), '#2b1622', 0);
    shape(c, poly(11.4, -40.2, 12.5, -45, 8.4, -41.6), '#2b1622', 0);
    shape(c, c => { c.moveTo(-12, -27); c.quadraticCurveTo(-13, -38, 0, -38.5); c.quadraticCurveTo(13, -38, 12, -27); c.lineTo(15.5, -21); c.lineTo(9, -20.5); c.quadraticCurveTo(0, -15, -9, -20.5); c.lineTo(-15.5, -21); c.closePath(); }, '#e8702a');
    shape(c, c => { c.moveTo(-8.5, -21.5); c.quadraticCurveTo(0, -30, 8.5, -21.5); c.quadraticCurveTo(0, -16.2, -8.5, -21.5); c.closePath(); }, '#fff4e6', 0);
    shape(c, poly(11, -29.5, 19.5, -33.5, 18, -27.8), '#6a22a8', 1.4);
    shape(c, poly(11, -27.6, 19, -25, 15.8, -22.8), '#6a22a8', 1.4);
    shape(c, rr(-12.6, -31.6, 25.2, 6.6, 3.2), '#7b2cbf', 1.8);
    shape(c, el(-5, -28.3, 3, 1.7), '#fff', 0); shape(c, el(5, -28.3, 3, 1.7), '#fff', 0);
    dot(c, -4, -28.1, 1.2, OL); dot(c, 6, -28.1, 1.2, OL);
    line(c, [-8, -29.5, -2, -29.7], OL, 1.3); line(c, [2, -29.7, 8, -29.5], OL, 1.3);
    shape(c, el(0, -23.6, 1.9, 1.35), '#2b1622', 0);
    c.beginPath(); c.moveTo(-3, -20.6); c.quadraticCurveTo(1, -18.8, 4.2, -21.8); c.strokeStyle = OL; c.lineWidth = 1.3; c.stroke();
  },
  bunny(c) {
    shape(c, c => { c.moveTo(-12, -30); c.lineTo(12, -30); c.lineTo(20, -3); c.quadraticCurveTo(0, 1.5, -20, -3); c.closePath(); }, '#ff7a1a');
    c.save(); c.translate(15, -19); c.rotate(0.5);
    shape(c, c => { c.moveTo(-1, -27); c.quadraticCurveTo(-8, -39, -3, -41); c.quadraticCurveTo(0, -33, 1, -28); c.closePath(); }, '#5cc23a', 1.5);
    shape(c, c => { c.moveTo(1, -27); c.quadraticCurveTo(7, -37, 3, -40); c.quadraticCurveTo(-1, -33, -1, -28); c.closePath(); }, '#47a82f', 1.5);
    shape(c, c => { c.moveTo(-6.5, -26); c.quadraticCurveTo(0, -30, 6.5, -26); c.lineTo(1.3, 2); c.quadraticCurveTo(0, 4, -1.3, 2); c.closePath(); }, '#ff8a1f');
    line(c, [-4.5, -18, -1, -17.2], '#c45a12', 1.2); line(c, [1, -11, 3.4, -11.6], '#c45a12', 1.2); line(c, [-3, -5, -0.6, -4.6], '#c45a12', 1.2);
    c.restore();
    shape(c, el(0, -14, 13.5, 13), '#f7f3ff');
    shape(c, el(0, -12, 8, 8.5), '#ffe0ee', 0);
    shape(c, el(-12, -16, 3.4, 4.6, 0.5), '#f7f3ff', 1.8);
    shape(c, el(13, -18.5, 3.8, 4.6, -0.5), '#f7f3ff', 1.8);
    shape(c, el(-6.5, -57, 4.8, 13, -0.12), '#f7f3ff');
    shape(c, el(-6.6, -56, 2.2, 9, -0.12), '#ffb3cf', 0);
    shape(c, el(7.2, -51.5, 4.6, 8, 0.25), '#f7f3ff');
    shape(c, el(14.6, -59.5, 4.2, 8, 1.15), '#f7f3ff');
    shape(c, el(14.6, -59.5, 1.8, 5.2, 1.15), '#ffb3cf', 0);
    shape(c, el(7.2, -51.5, 2, 5, 0.25), '#ffb3cf', 0);
    shape(c, el(0, -35, 14.5, 13.5), '#f7f3ff');
    c.save(); c.translate(-2, -48); c.rotate(-0.22);
    shape(c, poly(-7, 1, -7, -5, -3.5, -2, 0, -7, 3.5, -2, 7, -5, 7, 1), '#ffcb3d', 1.6);
    dot(c, 0, -1, 1.1, '#ff4b5c');
    c.restore();
    shape(c, el(-6, -36, 5, 5.2), '#fff', 1.6);
    c.beginPath(); for (let a = 0; a < 4.2 * Math.PI; a += 0.25) { const q = 0.33 * a; c.lineTo(-6 + Math.cos(a) * q, -36 + Math.sin(a) * q); } c.strokeStyle = '#8a2bff'; c.lineWidth = 1.2; c.stroke();
    shape(c, el(6.5, -37, 5.8, 6.2), '#fff', 1.6);
    dot(c, 7.8, -36.2, 1.6, OL);
    shape(c, c => { c.moveTo(-7.5, -29); c.quadraticCurveTo(0, -20.5, 7.5, -29); c.quadraticCurveTo(0, -26.8, -7.5, -29); c.closePath(); }, '#5a1530', 1.5);
    shape(c, rr(-2.7, -28.4, 2.5, 3.2, 0.6), '#fff', 1);
    shape(c, rr(0.2, -28.4, 2.5, 3.2, 0.6), '#fff', 1);
    shape(c, poly(-1.6, -31.6, 1.6, -31.6, 0, -30), '#ff7aa8', 1);
    shape(c, el(-10, -29.5, 2.4, 1.4), 'rgba(255,110,160,.5)', 0);
    shape(c, el(10.5, -30, 2.4, 1.4), 'rgba(255,110,160,.5)', 0);
  },
  beaver(c) {
    shape(c, el(-12, -5, 9, 4.6, -0.35), '#6b4a2e');
    c.save(); c.beginPath(); c.ellipse(-12, -5, 9, 4.6, -0.35, 0, Math.PI * 2); c.clip();
    c.strokeStyle = '#4e3420'; c.lineWidth = 0.8; c.beginPath();
    for (let i = -3; i <= 3; i++) { c.moveTo(-18 + i * 3, -11); c.lineTo(-8 + i * 3, 1); c.moveTo(-18 + i * 3, 1); c.lineTo(-8 + i * 3, -11); }
    c.stroke(); c.restore();
    shape(c, el(0, -10, 10, 10), '#8a5a33');
    shape(c, el(0, -8, 6, 6.5), '#c79a6b', 0);
    for (const dx of [-3.6, 0, 3.6]) shape(c, rr(dx - 1.7, -18, 3.4, 11, 1), '#e2463b', 1.2);
    shape(c, rr(-6, -14, 12, 2.4, 0.8), '#f1e3c6', 1);
    c.beginPath(); c.moveTo(0, -18); c.quadraticCurveTo(0.5, -21, 3, -22.5); c.strokeStyle = OL; c.lineWidth = 1.2; c.stroke();
    shape(c, el(-8.5, -11.5, 2.6, 2.4), '#8a5a33', 1.4); shape(c, el(8.5, -11.5, 2.6, 2.4), '#8a5a33', 1.4);
    shape(c, el(-7, -31, 2.8, 2.8), '#8a5a33', 1.6); shape(c, el(7, -31, 2.8, 2.8), '#8a5a33', 1.6);
    shape(c, el(0, -25, 9.2, 8.6), '#8a5a33');
    shape(c, el(0, -21.5, 5.8, 3.9), '#c79a6b', 0);
    shape(c, el(-3.6, -26.6, 2.7, 2.9), '#fff', 1.3); shape(c, el(3.6, -26.6, 2.7, 2.9), '#fff', 1.3);
    dot(c, -3.2, -26.2, 1.2, OL); dot(c, 4, -26.2, 1.2, OL);
    shape(c, el(0, -23.4, 2.1, 1.4), '#3a1a12', 0);
    shape(c, rr(-2.7, -21, 5.4, 5.2, 1), '#fff7d6', 1.2); line(c, [0, -21, 0, -15.8], OL, 0.8);
    shape(c, c => { c.moveTo(-8.6, -30.5); c.quadraticCurveTo(-8.6, -38.6, 0, -39); c.quadraticCurveTo(8.6, -38.6, 8.6, -30.5); c.closePath(); }, '#ffcb3d', 1.8);
    line(c, [0, -38.4, 0, -31.6], '#f2a81f', 1.8);
    shape(c, rr(-11, -31.6, 22, 2.8, 1.2), '#f2a81f', 1.4);
  },
  meercat(c) {
    shape(c, c => { c.moveTo(-3, -25); c.quadraticCurveTo(-17, -36, -21, -22); c.quadraticCurveTo(-15, -23, -13, -17); c.quadraticCurveTo(-9, -21, -3, -19); c.closePath(); }, '#ffffff', 1.6);
    shape(c, c => { c.moveTo(3, -25); c.quadraticCurveTo(17, -36, 21, -22); c.quadraticCurveTo(15, -23, 13, -17); c.quadraticCurveTo(9, -21, 3, -19); c.closePath(); }, '#ffffff', 1.6);
    line(c, [-15, -28, -11, -22.5], '#d6def0', 1); line(c, [15, -28, 11, -22.5], '#d6def0', 1);
    c.beginPath(); c.moveTo(4, -3); c.quadraticCurveTo(12, -2, 13, -9); c.strokeStyle = OL; c.lineWidth = 4.2; c.stroke(); c.strokeStyle = '#c99d66'; c.lineWidth = 2.4; c.stroke();
    line(c, [10, -2, 12.5, -34], OL, 3.6); line(c, [10, -2, 12.5, -34], '#ffcb3d', 1.8);
    shape(c, el(12.8, -36.5, 3.4, 3.4), '#7be04a', 1.4);
    line(c, [11.3, -36.5, 14.3, -36.5], '#fff', 1); line(c, [12.8, -38, 12.8, -35], '#fff', 1);
    shape(c, el(0, -11.5, 7.4, 11.5), '#d9b07a');
    shape(c, el(0, -10.5, 4.4, 8.4), '#f3dcb2', 0);
    c.fillStyle = '#ff4b5c'; c.fillRect(-0.9, -14, 1.8, 5.6); c.fillRect(-2.8, -12.1, 5.6, 1.8);
    shape(c, el(-6, -17, 2.2, 4, 0.3), '#d9b07a', 1.3); shape(c, el(9.6, -17, 2.4, 2.6), '#d9b07a', 1.3);
    shape(c, el(-6.8, -30.5, 2, 2.4), '#5b3a26', 1.2); shape(c, el(6.8, -30.5, 2, 2.4), '#5b3a26', 1.2);
    shape(c, el(0, -28.5, 7.6, 7.2), '#d9b07a');
    shape(c, el(0, -24.6, 4.2, 3), '#ecca95', 0);
    shape(c, el(-3.3, -29.2, 2.6, 2.2, -0.35), '#5b3a26', 0); shape(c, el(3.3, -29.2, 2.6, 2.2, 0.35), '#5b3a26', 0);
    dot(c, -3.1, -29.2, 1.25, '#fff'); dot(c, 3.1, -29.2, 1.25, '#fff'); dot(c, -2.9, -29, 0.6, OL); dot(c, 3.3, -29, 0.6, OL);
    shape(c, el(0, -25.2, 1.6, 1.1), '#2b1622', 0);
    c.beginPath(); c.arc(0, -23.4, 1.6, 0.3, Math.PI - 0.3); c.strokeStyle = OL; c.lineWidth = 0.9; c.stroke();
    shape(c, rr(-4.6, -37.6, 9.2, 4.2, 1.2), '#ffffff', 1.4);
    c.fillStyle = '#ff4b5c'; c.fillRect(-0.7, -37, 1.4, 3); c.fillRect(-1.5, -36.2, 3, 1.4);
    c.beginPath(); c.ellipse(0, -42, 6.5, 1.9, 0, 0, Math.PI * 2); c.strokeStyle = OL; c.lineWidth = 3; c.stroke(); c.strokeStyle = '#ffcb3d'; c.lineWidth = 1.6; c.stroke();
  },
  junkcoon(c) {
    const tail = c => { c.moveTo(4, -7); c.bezierCurveTo(16, -5, 25, -14, 22, -27); c.bezierCurveTo(20, -32, 14, -31, 14.5, -26); c.bezierCurveTo(16, -19, 11, -13, 3, -13.5); c.closePath(); };
    shape(c, tail, '#8d8f99', 0);
    c.save(); c.beginPath(); tail(c); c.clip(); c.strokeStyle = '#3b3d47'; c.lineWidth = 2.6;
    for (const [a, b, x2, y2] of [[9, -15, 15, -6], [15, -18, 23, -14], [16, -23, 24, -22], [14, -28, 22, -31]]) { c.beginPath(); c.moveTo(a, b); c.lineTo(x2, y2); c.stroke(); }
    c.restore(); shape(c, tail, null, 2.2);
    shape(c, el(0, -10.5, 10.5, 10), '#8d8f99');
    shape(c, el(0, -9, 6.4, 6.8), '#c9cbd3', 0);
    shape(c, c => { c.moveTo(-15, -6); c.quadraticCurveTo(-19, -14, -13, -19); c.lineTo(-11, -21); c.lineTo(-9, -19); c.quadraticCurveTo(-4, -14, -8, -6); c.quadraticCurveTo(-11.5, -4, -15, -6); c.closePath(); }, '#2a2e3a');
    line(c, [-12.8, -20.3, -9.8, -20.3], '#ffcb3d', 1.8);
    c.beginPath(); c.moveTo(-11, -21.5); c.quadraticCurveTo(-12, -25, -9, -26.5); c.strokeStyle = OL; c.lineWidth = 1.1; c.stroke();
    shape(c, el(-12.4, -12.5, 1.6, 2.6, 0.3), 'rgba(255,255,255,.3)', 0);
    shape(c, el(-8.6, -11.5, 2.6, 2.6), '#8d8f99', 1.3); shape(c, el(9.5, -12, 2.6, 2.6), '#8d8f99', 1.3);
    shape(c, poly(-10, -31, -9, -39, -3.5, -34), '#8d8f99', 1.8); shape(c, poly(10, -31, 9, -39, 3.5, -34), '#8d8f99', 1.8);
    shape(c, poly(-8.8, -32.5, -8.4, -36.6, -5.6, -34), '#ff9bb0', 0); shape(c, poly(8.8, -32.5, 8.4, -36.6, 5.6, -34), '#ff9bb0', 0);
    shape(c, el(0, -27, 11, 9.4), '#8d8f99');
    shape(c, el(0, -23.4, 7.2, 5), '#eceef2', 0);
    shape(c, c => { c.moveTo(-11, -29); c.quadraticCurveTo(-6, -33.5, 0, -29.6); c.quadraticCurveTo(6, -33.5, 11, -29); c.quadraticCurveTo(6, -24.6, 0, -27); c.quadraticCurveTo(-6, -24.6, -11, -29); c.closePath(); }, '#2b2d3a', 0);
    shape(c, el(-4.6, -29.2, 2.5, 2.5), '#fff', 1); shape(c, el(4.6, -29.4, 2.9, 3.1), '#fff', 1);
    dot(c, -4, -29, 1.1, OL); dot(c, 5.5, -30, 1.2, OL);
    shape(c, el(0, -24.6, 1.9, 1.3), '#2b1622', 0);
    shape(c, c => { c.moveTo(-5, -21.6); c.quadraticCurveTo(0, -17.4, 5.5, -22.4); c.quadraticCurveTo(0, -20.2, -5, -21.6); c.closePath(); }, '#5a1530', 1.1);
    c.fillStyle = '#fff'; c.fillRect(-1.8, -21.2, 1.6, 1.4); c.fillRect(1.2, -21.4, 1.6, 1.4);
    line(c, [-10.5, -33.6, 10.5, -33.6], '#5b3a26', 1.6);
    shape(c, el(-4, -34, 2.8, 2.6), '#ff9a3c', 1.3); shape(c, el(4, -34, 2.8, 2.6), '#ff9a3c', 1.3);
  },
  mechavaca(c) {
    shape(c, rr(-21, -44, 8, 15, 3), '#b84f86'); shape(c, rr(13, -44, 8, 15, 3), '#b84f86');
    shape(c, poly(-13, -46, -17, -54, -9, -48), '#ff8fc8', 1.6); shape(c, poly(13, -46, 17, -54, 9, -48), '#ff8fc8', 1.6);
    shape(c, rr(-19, -48, 38, 42, 14), '#ff8fc8');
    shape(c, rr(-16, -20, 32, 6, 2), '#ffffff', 1.2);
    shape(c, el(-10, -12, 3.4, 2.4, 0.3), '#2b2d3a', 0); shape(c, el(9, -10, 2.6, 2), '#2b2d3a', 0);
    shape(c, el(-12, -40, 2.2, 3.4, -0.3), 'rgba(255,255,255,.35)', 0);
    shape(c, rr(-28, -36, 10, 17, 4), '#ff8fc8'); shape(c, rr(-27, -21, 8, 5, 1.5), '#3b3d47', 1.4);
    shape(c, rr(18, -36, 10, 17, 4), '#ff8fc8'); shape(c, rr(19, -21, 8, 5, 1.5), '#3b3d47', 1.4);
    shape(c, el(0, -38, 11.5, 8.5), '#9fe3ff', 1.8);
    c.save(); c.beginPath(); c.ellipse(0, -38, 11.5, 8.5, 0, 0, Math.PI * 2); c.clip();
    shape(c, poly(-6, -42, -9.5, -47, -4, -44), '#f3e6cc', 1); shape(c, poly(6, -42, 9.5, -47, 4, -44), '#f3e6cc', 1);
    shape(c, el(0, -37, 7.4, 6.6), '#ffffff', 1.4);
    shape(c, el(-3.8, -39.6, 2.6, 2, 0.4), '#2b2d3a', 0);
    dot(c, -2.6, -37.8, 1.1, OL); dot(c, 2.8, -37.8, 1.1, OL);
    shape(c, el(0, -33.8, 4.6, 2.8), '#ffb3cf', 1.1);
    dot(c, -1.5, -33.8, 0.7, OL); dot(c, 1.5, -33.8, 0.7, OL);
    c.beginPath(); c.arc(0, -37, 8.2, Math.PI * 1.08, Math.PI * 1.92); c.strokeStyle = '#ff4fa3'; c.lineWidth = 1.6; c.stroke();
    c.restore();
    c.beginPath(); c.ellipse(-5, -41.5, 3, 1.4, -0.4, 0, Math.PI * 2); c.fillStyle = 'rgba(255,255,255,.65)'; c.fill();
  },
  vaca(c) {
    shape(c, el(0, -9, 9, 9), '#ffffff');
    shape(c, el(-4, -11, 3, 2.4, 0.4), '#2b2d3a', 0); shape(c, el(4.5, -6, 2.4, 2), '#2b2d3a', 0);
    shape(c, rr(8, -13.4, 7.4, 3.4, 1), '#ff4fa3', 1.2);
    shape(c, el(8.6, -11, 2.4, 2.4), '#ffffff', 1.3); shape(c, el(-8.6, -11, 2.4, 2.4), '#ffffff', 1.3);
    shape(c, poly(-5, -27, -8, -33, -2.4, -29), '#f3e6cc', 1.3); shape(c, poly(5, -27, 8, -33, 2.4, -29), '#f3e6cc', 1.3);
    shape(c, el(-10, -24, 3.4, 1.8, 0.3), '#ffffff', 1.3); shape(c, el(10, -24, 3.4, 1.8, -0.3), '#ffffff', 1.3);
    shape(c, el(0, -22, 8.6, 8), '#ffffff');
    shape(c, el(-3.4, -25, 2.8, 2.2, 0.4), '#2b2d3a', 0);
    dot(c, -2.8, -23, 1.2, OL); dot(c, 3, -23, 1.2, OL);
    shape(c, el(0, -18.2, 5.6, 3.4), '#ffb3cf', 1.2); dot(c, -1.8, -18.2, 0.8, OL); dot(c, 1.8, -18.2, 0.8, OL);
    c.beginPath(); c.arc(0, -22, 9.6, Math.PI * 1.1, Math.PI * 1.9); c.strokeStyle = OL; c.lineWidth = 3; c.stroke(); c.strokeStyle = '#ff4fa3'; c.lineWidth = 1.6; c.stroke();
    shape(c, el(-9.2, -21, 1.8, 2.8), '#ff4fa3', 1.2); shape(c, el(9.2, -21, 1.8, 2.8), '#ff4fa3', 1.2);
  },
  p_tower(c) {
    shape(c, c => { c.moveTo(-20, -52); c.lineTo(-20, -2); c.quadraticCurveTo(0, 7, 20, -2); c.lineTo(20, -52); c.closePath(); }, '#8b5530');
    c.strokeStyle = '#6c3f22'; c.lineWidth = 1.6;
    for (const lx of [-13, -6, 1, 8, 15]) { c.beginPath(); c.moveTo(lx, -50); c.quadraticCurveTo(lx + 1.5, -26, lx, -2 + Math.abs(lx) * -0.12); c.stroke(); }
    shape(c, el(-14, -3, 7, 4), '#5aa83a', 1.4); shape(c, el(12, -2, 8, 4), '#5aa83a', 1.4); shape(c, el(-2, 0, 6, 3), '#6cc048', 1.2);
    shape(c, el(0, -52, 22, 8), '#d39a5f');
    c.strokeStyle = '#a8723f'; c.lineWidth = 1; c.beginPath(); c.ellipse(0, -52, 15, 5.4, 0, 0, Math.PI * 2); c.stroke(); c.beginPath(); c.ellipse(0, -52, 8, 2.9, 0, 0, Math.PI * 2); c.stroke();
    c.lineCap = 'round';
    line(c, [0, -54, 0, -64], OL, 5); line(c, [0, -64, -6.5, -72], OL, 5); line(c, [0, -64, 6.5, -72], OL, 5);
    line(c, [0, -54, 0, -64], '#a0683a', 2.8); line(c, [0, -64, -6.5, -72], '#a0683a', 2.8); line(c, [0, -64, 6.5, -72], '#a0683a', 2.8);
    c.beginPath(); c.moveTo(-6.5, -72); c.quadraticCurveTo(0, -65, 6.5, -72); c.strokeStyle = '#ff4b5c'; c.lineWidth = 1.5; c.stroke();
    shape(c, el(0, -67.5, 2.6, 2.6), '#9a6a33', 1.2);
    line(c, [15, -54, 15, -85], OL, 3.4); line(c, [15, -54, 15, -85], '#e8d2b0', 1.6);
    shape(c, poly(15, -85, 29, -80.5, 15, -75), '#ff7a1a', 1.6);
  },
  p_base(c) {
    shape(c, el(-40, -6, 12, 7, 0.3), '#6e4226'); shape(c, el(40, -6, 12, 7, -0.3), '#6e4226');
    shape(c, el(-20, 1, 10, 5), '#6e4226'); shape(c, el(22, 1, 10, 5), '#6e4226');
    shape(c, c => { c.moveTo(-44, -66); c.lineTo(-46, -6); c.quadraticCurveTo(0, 10, 46, -6); c.lineTo(44, -66); c.closePath(); }, '#7d4a28');
    c.strokeStyle = '#5e351c'; c.lineWidth = 1.8;
    for (const lx of [-38, -30, -20, 20, 31, 39]) { c.beginPath(); c.moveTo(lx, -62); c.quadraticCurveTo(lx + 2, -34, lx, -6); c.stroke(); }
    shape(c, el(0, -66, 45, 13), '#d7a066');
    c.strokeStyle = '#a6703c'; c.lineWidth = 1.2; for (const q of [34, 22, 10]) { c.beginPath(); c.ellipse(0, -66, q, q * 0.29, 0, 0, Math.PI * 2); c.stroke(); }
    for (let i = 0; i < 9; i++) { const a = Math.PI * (0.1 + i * 0.1); shape(c, el(Math.cos(a) * -42, -66 + Math.sin(a) * 11, 6, 3.6), '#5aa83a', 1.2); }
    shape(c, c => { c.moveTo(-15, -3); c.lineTo(-15, -24); c.arc(0, -24, 15, Math.PI, 0); c.lineTo(15, -3); c.quadraticCurveTo(0, 1, -15, -3); c.closePath(); }, '#d7a066');
    shape(c, c => { c.moveTo(-10.5, -2.5); c.lineTo(-10.5, -24); c.arc(0, -24, 10.5, Math.PI, 0); c.lineTo(10.5, -2.5); c.closePath(); }, '#3a1d10', 1.4);
    dot(c, 6, -13, 1.6, '#ffcb3d');
    for (const wx of [-28, 28]) { shape(c, el(wx, -40, 7.5, 7.5), '#ffd36b'); line(c, [wx - 7, -40, wx + 7, -40], OL, 1.4); line(c, [wx, -47, wx, -33], OL, 1.4); }
    line(c, [30, -66, 30, -106], OL, 3.6); line(c, [30, -66, 30, -106], '#e8d2b0', 1.8);
    shape(c, c => { c.moveTo(30, -106); c.lineTo(54, -100); c.lineTo(47, -93); c.lineTo(54, -86); c.lineTo(30, -84); c.closePath(); }, '#ff7a1a');
    shape(c, el(37.5, -96, 2, 5, -0.2), '#fff', 1.1); shape(c, el(42.5, -96, 2, 5, 0.2), '#fff', 1.1);
  },
  p_rubble(c) {
    shape(c, el(0, -3, 23, 8), '#6e4226');
    shape(c, c => { c.moveTo(-18, -4); c.lineTo(-18, -14); c.lineTo(-12, -18); c.lineTo(-7, -12); c.lineTo(-2, -20); c.lineTo(4, -13); c.lineTo(9, -17); c.lineTo(18, -10); c.lineTo(18, -4); c.quadraticCurveTo(0, 4, -18, -4); c.closePath(); }, '#8b5530');
    shape(c, rr(-26, -8, 16, 6, 3), '#a0683a', 1.6); shape(c, el(-26, -5, 2.4, 3), '#d39a5f', 1.2);
    shape(c, rr(9, -6, 18, 6, 3), '#a0683a', 1.6); shape(c, el(27, -3, 2.4, 3), '#d39a5f', 1.2);
    shape(c, poly(-4, 4, 10, 1, 4, 7), '#ff7a1a', 1.4);
  },
});
