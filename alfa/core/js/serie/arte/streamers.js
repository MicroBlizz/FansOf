// Fans Of · Arte: los dibujos de Streamers (cada uno se dibuja en el suelo, con el origen bajo los pies y la altura en y negativa)
'use strict';
Object.assign(ART, {
  hater(c) {
    shape(c, c => { c.moveTo(-12, -24); c.quadraticCurveTo(-13, -8, -10, -4); c.lineTo(10, -4); c.quadraticCurveTo(13, -8, 12, -24); c.quadraticCurveTo(0, -28, -12, -24); c.closePath(); }, '#6b7280');
    shape(c, rr(-5, -14, 10, 5, 2), '#4b5563', 1.2);
    line(c, [-3, -24, -2, -17], '#e5e7eb', 1.2); line(c, [3, -24, 2, -17], '#e5e7eb', 1.2);
    shape(c, c => { c.moveTo(-12, -30); c.quadraticCurveTo(-13, -46, 0, -46); c.quadraticCurveTo(13, -46, 12, -30); c.quadraticCurveTo(12, -23, 0, -23); c.quadraticCurveTo(-12, -23, -12, -30); c.closePath(); }, '#6b7280');
    shape(c, el(0, -32, 8.4, 7.8), '#f1c9a5', 1.8);
    line(c, [-6, -36.6, -1.6, -34.4], OL, 1.8); line(c, [6, -36.6, 1.6, -34.4], OL, 1.8);
    dot(c, -3.6, -32.6, 1.2, OL); dot(c, 3.6, -32.6, 1.2, OL);
    c.beginPath(); c.moveTo(-3.2, -27.6); c.quadraticCurveTo(0, -29.6, 3.2, -27.6); c.strokeStyle = OL; c.lineWidth = 1.4; c.stroke();
    line(c, [12, -18, 16, -26], OL, 3.6); line(c, [12, -18, 16, -26], '#f1c9a5', 2);
    line(c, [17, -24, 17, -40], OL, 3.2); line(c, [17, -24, 17, -40], '#8a5a33', 1.8);
    c.save(); c.translate(15, -41); c.rotate(0.08);
    shape(c, rr(-13, -10, 26, 12, 2.4), '#fff6ea', 1.8);
    txt(c, 'BUUU', 0, -3.6, 8, '#e63946');
    c.restore();
  },
  sp_donaciones(c) { spBg(c, 'd'); for (const [x, y] of [[-8, -12], [-8, -16], [-8, -20], [6, -12], [6, -16]]) { shape(c, el(x, y, 8, 3.4), '#ffcb3d', 1.6); } shape(c, el(-8, -24, 8, 3.4), '#ffe06a', 1.6); shape(c, el(6, -20, 8, 3.4), '#ffe06a', 1.6); shape(c, c => { c.moveTo(4, -32); c.bezierCurveTo(4, -36, 9, -36, 9, -32); c.bezierCurveTo(9, -36, 14, -36, 14, -32); c.quadraticCurveTo(14, -28, 9, -24.6); c.quadraticCurveTo(4, -28, 4, -32); c.closePath(); }, '#ff5fa8', 1.4); },
  sp_merienda(c) { spBg(c, 'h'); shape(c, rr(-15, -16, 30, 6, 3), '#e0a050', 2); shape(c, c => { c.moveTo(-15, -18); for (let x = -15; x <= 15; x += 5) c.quadraticCurveTo(x + 2.5, -22, x + 5, -18); c.lineTo(15, -16); c.lineTo(-15, -16); c.closePath(); }, '#7be04a', 1.4); shape(c, rr(-13, -21, 26, 3, 1.4), '#ff5a3c', 1.2); shape(c, rr(-14, -24, 28, 3.4, 1.4), '#ffe06a', 1.2); shape(c, c => { c.moveTo(-15, -24); c.quadraticCurveTo(-15, -36, 0, -36); c.quadraticCurveTo(15, -36, 15, -24); c.closePath(); }, '#e0a050', 2); for (const [x, y] of [[-6, -30], [0, -32], [6, -30]]) dot(c, x, y, 0.9, '#fff6ea'); },
  sp_baneo(c) { spBg(c, 'c'); c.save(); c.translate(0, -24); c.rotate(-0.6); line(c, [0, 2, 0, 18], OL, 5); line(c, [0, 2, 0, 18], '#8a5a33', 3); shape(c, rr(-12, -9, 24, 12, 2.6), '#9ca3af', 2.2); shape(c, rr(-12, -9, 5, 12, 1.6), '#6b7280', 0); otxt(c, 'BAN', 1.6, -3, 8.6, '#e63946'); c.restore(); },
  /* ---------- Streamers ---------- */
  twitchking(c) {
    shape(c, c => { c.moveTo(-11, -36); c.lineTo(11, -36); c.lineTo(19, -3); c.quadraticCurveTo(0, 2, -19, -3); c.closePath(); }, '#e11d74');
    c.beginPath(); c.moveTo(-18, -5.5); c.quadraticCurveTo(0, -1, 18, -5.5); c.strokeStyle = '#ffcb3d'; c.lineWidth = 2; c.stroke();
    line(c, [15, -12, 19.5, -47], OL, 3.8); line(c, [15, -12, 19.5, -47], '#ffcb3d', 2);
    shape(c, c => { c.moveTo(16, -48); c.lineTo(14.5, -44); c.lineTo(19.5, -47.6); c.closePath(); }, '#a855f7', 1.4);
    shape(c, rr(11.5, -59, 17, 12, 4.5), '#a855f7', 1.6);
    shape(c, c => heartPath(c, 20, -53.2, 3), '#fff', 0);
    shape(c, c => { c.moveTo(-12, -35); c.quadraticCurveTo(-15, -16, -13, -4); c.quadraticCurveTo(0, -1, 13, -4); c.quadraticCurveTo(15, -16, 12, -35); c.quadraticCurveTo(0, -39, -12, -35); c.closePath(); }, '#8b5cf6');
    line(c, [-3, -33, -3.6, -27], '#f5f3ff', 1.2); line(c, [3, -33, 3.6, -27], '#f5f3ff', 1.2);
    shape(c, c => { c.moveTo(-8, -7.5); c.lineTo(-6, -14.5); c.lineTo(6, -14.5); c.lineTo(8, -7.5); c.closePath(); }, '#7c3aed', 1.3);
    shape(c, rr(-7.5, -25, 15, 6.6, 2), '#ff3348', 1.4); txt(c, 'LIVE', 0.3, -21.4, 5.4, '#fff');
    shape(c, el(-15, -28, 4.2, 8, 0.7), '#8b5cf6'); shape(c, el(-20, -34.5, 3.4, 3.4), '#f1c27d', 1.4);
    shape(c, el(13.5, -22, 4.2, 7.5, -0.4), '#8b5cf6'); shape(c, el(16, -16, 3.4, 3.4), '#f1c27d', 1.4);
    shape(c, el(0, -44, 10.5, 10), '#f1c27d');
    shape(c, c => { c.moveTo(-10.6, -45); c.quadraticCurveTo(-11, -55.5, -1, -55.5); c.quadraticCurveTo(9.5, -56, 10.7, -46); c.quadraticCurveTo(6, -50.5, 2, -49); c.quadraticCurveTo(-3, -51.5, -6.5, -48); c.quadraticCurveTo(-8.6, -47, -10.6, -45); c.closePath(); }, '#5b3a26', 1.6);
    c.beginPath(); c.moveTo(-6.4, -44); c.quadraticCurveTo(-4, -46.4, -1.6, -44); c.strokeStyle = OL; c.lineWidth = 1.4; c.stroke();
    dot(c, 4, -44.4, 1.6, OL); dot(c, 4.5, -45, 0.5, '#fff');
    shape(c, c => { c.moveTo(-4.4, -39.8); c.quadraticCurveTo(0.6, -34.6, 5.8, -40.2); c.quadraticCurveTo(0.6, -38.4, -4.4, -39.8); c.closePath(); }, '#fff', 1.2);
    shape(c, el(-7.6, -40.6, 2.2, 1.3), 'rgba(255,110,140,.45)', 0); shape(c, el(8, -41, 2.2, 1.3), 'rgba(255,110,140,.45)', 0);
    c.beginPath(); c.arc(0, -45, 12, Math.PI * 1.08, Math.PI * 1.92); c.strokeStyle = OL; c.lineWidth = 4.6; c.stroke(); c.strokeStyle = '#2b2d3a'; c.lineWidth = 2.6; c.stroke();
    shape(c, rr(-14.2, -49.5, 5.6, 10, 2.4), '#2b2d3a', 1.6); shape(c, rr(8.6, -49.5, 5.6, 10, 2.4), '#2b2d3a', 1.6);
    dot(c, -11.4, -44.5, 1.6, '#22e3ff'); dot(c, 11.4, -44.5, 1.6, '#22e3ff');
    c.beginPath(); c.moveTo(11.4, -40); c.quadraticCurveTo(10, -35.6, 5, -36.4); c.strokeStyle = OL; c.lineWidth = 2.6; c.stroke(); c.strokeStyle = '#2b2d3a'; c.lineWidth = 1.2; c.stroke();
    dot(c, 4.6, -36.4, 1.8, OL);
    shape(c, poly(-7.5, -54, -9, -62, -4.2, -58, 0, -64, 4.2, -58, 9, -62, 7.5, -54), '#ffcb3d', 1.6);
    dot(c, 0, -57.6, 1.3, '#ff3348');
  },
  subswarm(c) {
    line(c, [-6, -12, -10, -22], OL, 3.8); line(c, [-6, -12, -10, -22], '#e0a872', 2);
    shape(c, c => { c.moveTo(-6.5, -21); c.lineTo(-15, -22); c.lineTo(-14.6, -29.5); c.lineTo(-12.8, -29.8); c.lineTo(-12.6, -36.4); c.quadraticCurveTo(-11, -38.6, -9.4, -36.2); c.lineTo(-9.6, -29.6); c.lineTo(-7.2, -29.2); c.closePath(); }, '#d946ef', 1.6);
    txt(c, '#1', -11, -25.2, 4.6, '#fff');
    shape(c, c => { c.moveTo(-7, -15); c.lineTo(7, -15); c.lineTo(8, -3); c.quadraticCurveTo(0, -1, -8, -3); c.closePath(); }, '#8b5cf6');
    shape(c, c => heartPath(c, 0, -9, 2.6), '#f5d0fe', 0.9);
    shape(c, el(8, -9, 2.2, 4, -0.3), '#8b5cf6', 1.4); shape(c, el(8.6, -5.6, 1.8, 1.8), '#e0a872', 1.1);
    shape(c, el(0, -21.5, 7, 6.6), '#e0a872');
    shape(c, c => { c.moveTo(-7.2, -22.5); c.quadraticCurveTo(-7, -29.6, 0, -29.6); c.quadraticCurveTo(7, -29.6, 7.2, -22.5); c.closePath(); }, '#22d3ee', 1.6);
    shape(c, c => { c.moveTo(4, -23.4); c.lineTo(11.4, -22.8); c.quadraticCurveTo(11.4, -21, 6, -21.4); c.closePath(); }, '#0891b2', 1.3);
    dot(c, -2, -20.4, 1.2, OL); dot(c, 3, -20.4, 1.2, OL); dot(c, -1.7, -20.8, 0.45, '#fff'); dot(c, 3.3, -20.8, 0.45, '#fff');
    shape(c, c => { c.moveTo(-1.8, -17.4); c.quadraticCurveTo(0.6, -14.2, 3.2, -17.4); c.closePath(); }, '#5a1530', 1);
  },
  hypebeast(c) {
    shape(c, c => { c.moveTo(-10, -24); c.quadraticCurveTo(-12.5, -12, -10.5, -3); c.quadraticCurveTo(0, 0, 10.5, -3); c.quadraticCurveTo(12.5, -12, 10, -24); c.quadraticCurveTo(0, -27, -10, -24); c.closePath(); }, '#f97316');
    shape(c, poly(1.4, -21, -3.6, -13, -0.4, -13, -1.8, -7, 4.2, -15, 0.8, -15, 2.8, -21), '#ffe14d', 1.1);
    shape(c, el(-11, -15, 3.4, 6.5, 0.2), '#f97316'); shape(c, el(-11.6, -9, 2.6, 2.6), '#c68642', 1.3);
    shape(c, el(11, -18, 3.4, 6, -0.8), '#f97316');
    shape(c, rr(13, -28, 6.4, 10, 1.6), '#7be04a', 1.4); line(c, [13.6, -25.4, 18.8, -25.4], '#1f2937', 1); shape(c, poly(14.6, -23.6, 17.6, -23.6, 15.4, -20, 16.4, -22), '#1f2937', 0);
    shape(c, el(14.8, -19.6, 2.7, 2.7), '#c68642', 1.3);
    shape(c, el(0, -31, 8.4, 8), '#c68642');
    shape(c, c => { c.moveTo(-8.6, -32); c.quadraticCurveTo(-8.2, -40.6, 0, -40.6); c.quadraticCurveTo(8.2, -40.6, 8.6, -32); c.closePath(); }, '#111827', 1.6);
    shape(c, c => { c.moveTo(-6, -35.5); c.lineTo(-13.8, -34.4); c.quadraticCurveTo(-14, -32.2, -7.6, -32.6); c.closePath(); }, '#111827', 1.4);
    dot(c, 1, -38.4, 1.3, '#f97316');
    shape(c, rr(-6.4, -33.8, 14, 4.2, 1.6), '#111827', 1.2);
    line(c, [-4.6, -32.8, -2, -32.8], '#f472b6', 1); line(c, [2.4, -32.8, 5, -32.8], '#f472b6', 1);
    shape(c, c => { c.moveTo(-2.4, -27.4); c.quadraticCurveTo(1, -24.2, 4.6, -27.8); c.closePath(); }, '#fff', 1.1);
    c.beginPath(); c.arc(0, -24.5, 5.5, 0.35, Math.PI - 0.35); c.strokeStyle = OL; c.lineWidth = 2.8; c.stroke(); c.strokeStyle = '#ffcb3d'; c.lineWidth = 1.4; c.stroke();
  },
  viralbot(c) {
    line(c, [-1.5, -31, -1.5, -38], OL, 2.4);
    shape(c, el(-1.5, -39, 13, 2.2), 'rgba(205,215,235,.92)', 1.4); dot(c, -1.5, -39, 1.8, '#ff3348');
    line(c, [-8, -12, -10, -8], OL, 2); line(c, [4, -12, 6, -8], OL, 2); line(c, [-12.5, -8, -6.5, -8], OL, 2.2); line(c, [3.5, -8, 9.5, -8], OL, 2.2);
    shape(c, rr(-13, -31, 23, 19, 4.5), '#4b4b66');
    shape(c, rr(-11, -29, 9, 5, 1.6), '#ff3348', 1.1); txt(c, 'REC', -6.5, -26.3, 3.8, '#fff');
    shape(c, rr(-10.5, -22.5, 12, 8, 2.2), '#22e3ff', 1.2);
    dot(c, -7.2, -19.6, 1.1, OL); dot(c, -2.4, -19.6, 1.1, OL);
    c.beginPath(); c.arc(-4.8, -18.2, 1.8, 0.25, Math.PI - 0.25); c.strokeStyle = OL; c.lineWidth = 0.9; c.stroke();
    shape(c, rr(8.5, -28.5, 6, 14, 2), '#2b2d3a', 1.4);
    shape(c, el(15, -21.5, 6.2, 6.8), '#1f2937');
    shape(c, el(15.6, -21.5, 4.2, 4.6), '#8b5cf6', 1.2); dot(c, 15.8, -21.4, 1.8, '#1a1022');
    dot(c, 14.2, -23.3, 1.4, 'rgba(255,255,255,.9)');
  },
  snackmom(c) {
    shape(c, c => { c.moveTo(-8, -26); c.lineTo(8, -26); c.lineTo(12, -3); c.quadraticCurveTo(0, 0, -12, -3); c.closePath(); }, '#60a5fa');
    for (const [px, py] of [[-8.5, -8], [9, -7], [-6.6, -16], [7, -18]]) dot(c, px, py, 1.1, '#e0f2fe');
    shape(c, c => { c.moveTo(-6, -23); c.lineTo(6, -23); c.lineTo(8, -5); c.quadraticCurveTo(0, -3, -8, -5); c.closePath(); }, '#fff', 1.4);
    shape(c, c => heartPath(c, 0, -12.5, 2.6), '#fda4af', 1);
    shape(c, el(-10, -16, 3, 5.5, 0.3), '#60a5fa'); shape(c, el(-10.8, -11, 2.4, 2.4), '#f1c27d', 1.3);
    shape(c, el(9.5, -19, 3.2, 5.5, -0.9), '#60a5fa');
    shape(c, el(17, -24, 9.4, 2.6), '#d1d5db', 1.5);
    shape(c, poly(10.5, -25.6, 14.6, -31.4, 18.6, -25.6), '#fde68a', 1.2); line(c, [11.6, -26.6, 17.6, -26.6], '#7be04a', 1.4);
    shape(c, el(21.6, -27.4, 2.8, 2.1), '#d97706', 1.1); dot(c, 21, -27.8, 0.55, OL); dot(c, 22.4, -27, 0.55, OL);
    shape(c, el(13, -21.4, 2.6, 2.6), '#f1c27d', 1.3);
    shape(c, el(0, -32.5, 8, 7.6), '#f1c27d');
    shape(c, el(0, -43.6, 4.8, 3.8), '#9ca3af', 1.5);
    shape(c, c => { c.moveTo(-8.3, -33); c.quadraticCurveTo(-9, -41.6, 0, -41.6); c.quadraticCurveTo(9, -41.6, 8.3, -33); c.quadraticCurveTo(4, -37.6, 0, -37); c.quadraticCurveTo(-4, -37.6, -8.3, -33); c.closePath(); }, '#9ca3af', 1.5);
    shape(c, rr(-7, -41.4, 4.2, 2.6, 1), '#f472b6', 1); shape(c, rr(3, -41.8, 4.2, 2.6, 1), '#f472b6', 1);
    c.strokeStyle = OL; c.lineWidth = 1.1; c.beginPath(); c.arc(-3.2, -32.4, 2.5, 0, Math.PI * 2); c.moveTo(5.8, -32.4); c.arc(3.3, -32.4, 2.5, 0, Math.PI * 2); c.moveTo(-0.7, -32.6); c.lineTo(0.8, -32.6); c.stroke();
    c.lineWidth = 0.9; c.beginPath(); c.arc(-3.2, -31.8, 1.1, Math.PI * 1.15, Math.PI * 1.85); c.moveTo(4.4, -31.8); c.arc(3.3, -31.8, 1.1, Math.PI * 1.15, Math.PI * 1.85); c.stroke();
    c.beginPath(); c.arc(0.2, -28.8, 2.4, 0.3, Math.PI - 0.3); c.lineWidth = 1.1; c.stroke();
    shape(c, el(-6, -29.2, 1.8, 1.1), 'rgba(255,110,140,.5)', 0); shape(c, el(6.4, -29.2, 1.8, 1.1), 'rgba(255,110,140,.5)', 0);
  },
  hypetrain(c) {
    shape(c, el(12, -46, 5.4, 4.2), '#f5f3ff', 1.4); shape(c, el(5, -51.5, 4.4, 3.6), '#f5f3ff', 1.3); shape(c, el(-1.5, -55, 3.2, 2.7), '#f5f3ff', 1.2);
    shape(c, c => heartPath(c, 12, -46.4, 2.2), '#f472b6', 0);
    shape(c, rr(-27, -37, 18, 32, 2.4), '#7c3aed');
    shape(c, rr(-30.5, -41.5, 25, 5.6, 2.2), '#4c1d95', 1.6);
    shape(c, rr(-24, -33, 12, 9.5, 1.6), '#a5f3fc', 1.4);
    shape(c, rr(-11, -27, 34, 21, 8.5), '#8b5cf6');
    line(c, [-2, -26.6, -2, -6.4], '#ffcb3d', 1.8); line(c, [8, -26.6, 8, -6.4], '#ffcb3d', 1.8);
    txt(c, 'HYPE', -18.4, -17.5, 4.6, '#ffe14d');
    shape(c, el(1, -27.5, 4, 3), '#ffcb3d', 1.3);
    shape(c, poly(11, -26, 10, -38, 20, -38, 19, -26), '#4c1d95');
    shape(c, rr(8.4, -41.5, 13.2, 4.4, 1.6), '#ffcb3d', 1.4);
    shape(c, el(24, -16.5, 8.4, 10), '#e5e7eb');
    shape(c, el(22.4, -20, 2.2, 2.8), '#fff', 1.1); shape(c, el(27.2, -20, 2, 2.6), '#fff', 1.1);
    dot(c, 23, -19.6, 1.1, OL); dot(c, 27.6, -19.6, 1, OL);
    shape(c, c => { c.moveTo(19.6, -14.5); c.quadraticCurveTo(24.6, -8.6, 30, -14.8); c.quadraticCurveTo(24.6, -12.6, 19.6, -14.5); c.closePath(); }, '#5a1530', 1.2);
    shape(c, poly(26, -8.5, 35, -2.5, 21, -2.5), '#ff3348', 1.5);
    for (const wx of [-19, -5, 11]) { shape(c, el(wx, -6, 6.3, 6.3), '#2b2d3a'); shape(c, el(wx, -6, 2.7, 2.7), '#ffcb3d', 1.2); }
    line(c, [-19, -6, 11, -6], OL, 3.2); line(c, [-19, -6, 11, -6], '#c4b5fd', 1.6);
  },
  banhammer(c) {
    line(c, [8, -18, 22, -56], OL, 5.2); line(c, [8, -18, 22, -56], '#8a5a33', 3.2);
    c.save(); c.translate(23, -61); c.rotate(0.35);
    shape(c, rr(-14, -8, 28, 15, 3), '#6b7280');
    shape(c, rr(-16, -9.5, 4.4, 18, 1.6), '#4b5563', 1.6); shape(c, rr(11.6, -9.5, 4.4, 18, 1.6), '#4b5563', 1.6);
    txt(c, 'BAN', 0, 0.4, 9, '#ff3348');
    c.restore();
    shape(c, c => { c.moveTo(-16, -40); c.quadraticCurveTo(-21, -22, -15.5, -4); c.quadraticCurveTo(0, 0, 15.5, -4); c.quadraticCurveTo(21, -22, 16, -40); c.quadraticCurveTo(0, -45, -16, -40); c.closePath(); }, '#16a34a');
    shape(c, el(0, -17, 9, 10), '#22c55e', 0);
    shape(c, c => { c.moveTo(-6, -35); c.lineTo(6, -35); c.lineTo(6, -29); c.quadraticCurveTo(0, -23, -6, -29); c.closePath(); }, '#fff', 1.3);
    line(c, [0, -33.6, 0, -26.4], '#16a34a', 1.5); line(c, [-2.3, -31.2, 2.3, -31.2], '#16a34a', 1.3);
    shape(c, el(-18.5, -25, 5.6, 11, 0.25), '#16a34a'); shape(c, el(-20.5, -14.5, 4.4, 4.4), '#e0a872', 1.5);
    shape(c, el(14.5, -29, 5.6, 9.5, -0.7), '#16a34a'); shape(c, el(10.4, -21.6, 4.8, 4.8), '#e0a872', 1.5);
    shape(c, el(0, -50, 10, 9.6), '#e0a872');
    shape(c, c => { c.moveTo(-10, -51.5); c.quadraticCurveTo(-10, -60.5, 0, -60.5); c.quadraticCurveTo(10, -60.5, 10, -51.5); c.quadraticCurveTo(5, -55.5, 0, -55.5); c.quadraticCurveTo(-5, -55.5, -10, -51.5); c.closePath(); }, '#3b2a1e', 1.5);
    line(c, [-6.8, -53.4, -1.8, -51.4], OL, 2); line(c, [7.4, -53.4, 2.4, -51.4], OL, 2);
    dot(c, -3.6, -49.4, 1.4, OL); dot(c, 4.2, -49.4, 1.4, OL);
    c.beginPath(); c.moveTo(-3.6, -43.4); c.quadraticCurveTo(0.3, -46, 4.2, -43.4); c.strokeStyle = OL; c.lineWidth = 1.5; c.stroke();
    c.fillStyle = 'rgba(59,42,30,.35)'; for (let i = 0; i < 9; i++) c.fillRect(-6 + (i % 5) * 3, -45 + Math.floor(i / 5) * 2.2, 0.9, 0.9);
    c.beginPath(); c.arc(0, -51, 11.4, Math.PI * 1.1, Math.PI * 1.9); c.strokeStyle = OL; c.lineWidth = 3.6; c.stroke(); c.strokeStyle = '#1f2937'; c.lineWidth = 2; c.stroke();
    shape(c, rr(-13, -54, 4.6, 8, 2), '#1f2937', 1.4);
  },
  /* ---------- edificios de las facciones nuevas ---------- */
  s_tower(c) {
    shape(c, c => { c.moveTo(-18, -28); c.lineTo(18, -28); c.lineTo(19.5, -2); c.quadraticCurveTo(0, 5, -19.5, -2); c.closePath(); }, '#4c1d95');
    shape(c, el(0, -15, 9.5, 9.5), '#2b2d3a', 1.6); shape(c, el(0, -15, 4.4, 4.4), '#6d28d9', 1.3); dot(c, 0, -15, 1.5, '#c4b5fd');
    shape(c, el(-12.5, -6, 3, 3), '#2b2d3a', 1.2); shape(c, el(12.5, -6, 3, 3), '#2b2d3a', 1.2);
    c.beginPath(); c.moveTo(-19, -3); c.quadraticCurveTo(0, 3.6, 19, -3); c.strokeStyle = '#22e3ff'; c.lineWidth = 1.8; c.stroke();
    shape(c, el(0, -28, 18, 4.8), '#6d28d9');
    line(c, [-8, -28, -14, -36], OL, 3.4); line(c, [8, -28, 14, -36], OL, 3.4); line(c, [-8, -28, -14, -36], '#9ca3af', 1.6); line(c, [8, -28, 14, -36], '#9ca3af', 1.6);
    line(c, [0, -29, 0, -56], OL, 4.6); line(c, [0, -29, 0, -56], '#9ca3af', 2.6);
    c.beginPath(); c.arc(0, -70, 16, 0, Math.PI * 2); c.strokeStyle = OL; c.lineWidth = 9.4; c.stroke(); c.strokeStyle = '#f5d0fe'; c.lineWidth = 6.2; c.stroke(); c.strokeStyle = '#fff'; c.lineWidth = 2.6; c.stroke();
    line(c, [0, -54, 0, -62], OL, 2.4);
    shape(c, rr(-4.6, -78, 9.2, 16, 2), '#111827', 1.5); shape(c, rr(-3.4, -76.6, 6.8, 12.8, 1.2), '#a855f7', 0);
    shape(c, c => heartPath(c, 0, -70, 2.2), '#fff', 0); dot(c, 2.2, -75, 0.9, '#ff3348');
  },
  s_base(c) {
    shape(c, rr(-52, -9, 104, 11, 4), '#2b2d3a');
    shape(c, rr(-45, -62, 90, 55, 6), '#6d28d9');
    c.strokeStyle = '#7c3aed'; c.lineWidth = 1.2; c.beginPath(); for (let y = -54; y < -10; y += 8) { c.moveTo(-43, y); c.lineTo(43, y); } c.stroke();
    line(c, [-44, -14, 44, -14], '#ff3df0', 2); line(c, [-44, -58, 44, -58], '#22e3ff', 2);
    shape(c, c => { c.moveTo(-12, -7); c.lineTo(-12, -28); c.arc(0, -28, 12, Math.PI, 0); c.lineTo(12, -7); c.closePath(); }, '#1a1022', 1.8);
    shape(c, c => { c.moveTo(-8, -7); c.lineTo(-8, -27); c.arc(0, -27, 8, Math.PI, 0); c.lineTo(8, -7); c.closePath(); }, '#3b1d6e', 0);
    for (const wx of [-30, 30]) { shape(c, rr(wx - 9, -46, 18, 13, 2.4), '#111827', 1.5); shape(c, c => heartPath(c, wx, -39.6, 3), wx < 0 ? '#f472b6' : '#22e3ff', 0); }
    shape(c, rr(-6, -68, 12, 8, 1.6), '#2b2d3a', 1.4);
    shape(c, rr(-38, -106, 76, 40, 5), '#111827');
    const g = c.createLinearGradient(0, -102, 0, -70); g.addColorStop(0, '#7c3aed'); g.addColorStop(1, '#22d3ee');
    shape(c, rr(-34, -102, 68, 32, 3), g, 1.4);
    shape(c, rr(-31, -99, 16, 7, 2), '#ff3348', 1.2); txt(c, 'LIVE', -23, -95.2, 5.6, '#fff');
    for (const [yy, w] of [[-88, 22], [-82, 30], [-76, 18]]) { shape(c, rr(6, yy - 2, w, 4.2, 2), 'rgba(255,255,255,.85)', 0); dot(c, 3, yy, 1.8, '#ffe14d'); }
    shape(c, c => heartPath(c, -22, -80, 6), '#f472b6', 1.4);
    shape(c, c => heartPath(c, -11, -86, 3.4), '#fde68a', 1.1);
  },
});
