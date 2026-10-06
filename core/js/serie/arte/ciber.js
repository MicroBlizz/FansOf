// Fans Of · Arte: los dibujos de Ciber (cada uno se dibuja en el suelo, con el origen bajo los pies y la altura en y negativa)
'use strict';
Object.assign(ART, {
  dron(c) {
    line(c, [-6, -20, -18, -30], OL, 3.4); line(c, [6, -20, 18, -30], OL, 3.4);
    line(c, [-6, -20, -18, -30], '#475569', 1.8); line(c, [6, -20, 18, -30], '#475569', 1.8);
    shape(c, el(-18, -31, 9, 2.4), 'rgba(200,230,255,.85)', 1.4); shape(c, el(18, -31, 9, 2.4), 'rgba(200,230,255,.85)', 1.4);
    dot(c, -18, -31, 1.6, OL); dot(c, 18, -31, 1.6, OL);
    shape(c, c => { c.moveTo(-12, -20); c.quadraticCurveTo(-12, -32, 0, -32); c.quadraticCurveTo(12, -32, 12, -20); c.quadraticCurveTo(12, -10, 0, -9); c.quadraticCurveTo(-12, -10, -12, -20); c.closePath(); }, '#334155');
    shape(c, c => { c.moveTo(-9, -22); c.quadraticCurveTo(0, -30, 9, -22); c.quadraticCurveTo(0, -25, -9, -22); c.closePath(); }, '#64748b', 0);
    shape(c, el(0, -18, 6, 5), '#0f172a', 1.6);
    shape(c, el(0, -18, 3.4, 3), '#ff3348', 0); dot(c, 1, -19, 1, '#ffd2d8');
    line(c, [-10, -12, -14, -5], OL, 2.4); line(c, [10, -12, 14, -5], OL, 2.4);
    line(c, [-14, -5, -11, -3], OL, 2); line(c, [14, -5, 11, -3], OL, 2);
    shape(c, poly(-4, -9, 4, -9, 0, -4), '#22e3ff', 1.2);
  },
  sp_orbital(c) { spBg(c, 'd'); c.globalAlpha = 0.8; shape(c, poly(-3, -30, 3, -30, 8, -6, -8, -6), '#7df3ff', 0); c.globalAlpha = 1; line(c, [0, -30, 0, -7], '#e0faff', 1.6); shape(c, el(0, -7, 10, 3), '#22e3ff', 1.4); shape(c, rr(-4, -40, 8, 9, 2), '#cbd5e1', 1.8); shape(c, rr(-15, -38, 9, 5, 1), '#2563eb', 1.4); shape(c, rr(6, -38, 9, 5, 1), '#2563eb', 1.4); line(c, [-6, -35.6, -4, -35.6], OL, 1.4); line(c, [4, -35.6, 6, -35.6], OL, 1.4); },
  sp_nanobots(c) { spBg(c, 'h'); shape(c, rr(-11, -33, 22, 22, 3), '#166534', 2); for (const y of [-29, -24, -19, -14]) { line(c, [-14, y, -11, y], OL, 1.6); line(c, [11, y, 14, y], OL, 1.6); } shape(c, rr(-6, -28, 12, 12, 2), '#4ade80', 1.4); c.save(); c.translate(3, -20); c.rotate(-0.8); shape(c, rr(-2, -3, 4, 16, 1.6), '#cbd5e1', 1.4); shape(c, c => { c.arc(0, -5, 5, Math.PI * 0.2, Math.PI * 1.8); c.lineTo(0, -5); c.closePath(); }, '#cbd5e1', 1.4); c.restore(); },
  sp_update(c) { spBg(c, 'c'); c.beginPath(); c.arc(0, -31, 7, -0.4, Math.PI * 1.4); c.lineWidth = 4; c.strokeStyle = OL; c.stroke(); c.lineWidth = 2.4; c.strokeStyle = '#22e3ff'; c.stroke(); shape(c, rr(-15, -19, 30, 8, 3), '#0f172a', 2); shape(c, rr(-13.6, -17.6, 12, 5.2, 2), '#22e3ff', 0); otxt(c, '1/47', 0, -8, 7, '#fff6ea'); },
  /* ---------- Ciberpunks ---------- */
  cybermarine(c) {
    shape(c, rr(-19, -46, 10, 26, 3), '#374151');
    dot(c, -14, -40, 1.6, '#ff3df0'); dot(c, -14, -34, 1.6, '#22e3ff');
    shape(c, rr(-14, -41, 28, 37, 7), '#4b5563');
    shape(c, rr(-10, -38, 20, 14, 4), '#6b7280', 1.4);
    line(c, [-8, -30, 8, -30], '#22e3ff', 1.6);
    shape(c, rr(-12, -9, 24, 5, 2), '#374151', 1.4);
    shape(c, el(-14, -38.5, 8.4, 6, -0.2), '#0e7490'); shape(c, el(14, -38.5, 8.4, 6, 0.2), '#0e7490');
    line(c, [-19, -38, -9, -40], '#22e3ff', 1.2); line(c, [19, -38, 9, -40], '#22e3ff', 1.2);
    shape(c, rr(0, -27, 28, 7, 2.4), '#1f2937');
    shape(c, rr(27, -25.8, 9, 3.6, 1.2), '#374151', 1.3);
    shape(c, rr(9, -21, 4.6, 7, 1.2), '#1f2937', 1.3);
    shape(c, rr(14, -31, 9, 4, 1.4), '#374151', 1.3); dot(c, 22, -29, 1.2, '#ff3df0');
    line(c, [3, -23.5, 24, -23.5], '#ff3df0', 1.2);
    shape(c, el(4, -22, 4.6, 4.6), '#4b5563', 1.4);
    shape(c, rr(-10, -61, 20, 19, 8), '#4b5563');
    shape(c, rr(-4, -55, 14.5, 6.4, 3.2), '#22e3ff', 1.4);
    line(c, [-1.5, -53.4, 7, -53.4], 'rgba(255,255,255,.85)', 1.2);
    line(c, [-7, -60, -9.5, -68], OL, 1.8); dot(c, -9.6, -68.6, 2, '#ff3df0');
  },
  drone(c) {
    line(c, [-12, -19, 12, -19], OL, 3); line(c, [-12, -19, 12, -19], '#9ca3af', 1.6);
    shape(c, el(-12.5, -21, 6.4, 1.8), 'rgba(205,225,245,.9)', 1.2); shape(c, el(12.5, -21, 6.4, 1.8), 'rgba(205,225,245,.9)', 1.2);
    shape(c, rr(-1, -11, 9, 2.6, 1), '#1f2937', 1.1);
    shape(c, el(0, -15, 7.4, 6.2), '#4b5563');
    shape(c, el(2.4, -15, 3.6, 3.6), '#111827', 1.2); dot(c, 3, -15, 1.9, '#22e3ff'); dot(c, 2.4, -15.8, 0.6, '#fff');
    line(c, [-3, -21, -4, -24], OL, 1.2); dot(c, -4, -24.3, 1.1, '#ff3df0');
  },
  nanobot(c) {
    line(c, [-6, -9, -9.5, -5.5], OL, 2); line(c, [6, -9, 9.5, -5.5], OL, 2);
    shape(c, el(0, -10, 7, 7), '#cbd5e1');
    shape(c, rr(-4.6, -14, 9.6, 6, 2), '#1f2937', 1.2);
    dot(c, 1.6, -11, 1.9, '#22e3ff'); dot(c, 1.2, -11.6, 0.6, '#fff');
    line(c, [-3, -5.5, 3, -5.5], '#ff3df0', 1.2);
    line(c, [0, -17, 1.4, -21], OL, 1.4); dot(c, 1.5, -21.6, 1.7, '#ff3df0');
  },
  cyberninja(c) {
    shape(c, c => { c.moveTo(-3, -27); c.quadraticCurveTo(-14, -29, -21, -23); c.quadraticCurveTo(-14, -23.4, -10, -21.4); c.quadraticCurveTo(-15, -18, -18, -13); c.quadraticCurveTo(-8, -17, -2, -23); c.closePath(); }, '#ff3df0', 1.5);
    c.save(); c.globalAlpha = 0.35; line(c, [9, -15, 27, -38], '#22e3ff', 6); c.restore();
    line(c, [9, -15, 27, -38], OL, 3.8); line(c, [9, -15, 27, -38], '#a5f3fc', 2); line(c, [10, -16.4, 26.4, -37.2], '#fff', 0.7);
    line(c, [5.6, -10.6, 9.6, -15.6], OL, 3.4); line(c, [5.6, -10.6, 9.6, -15.6], '#ff3df0', 1.6);
    shape(c, c => { c.moveTo(-7, -24); c.lineTo(7, -24); c.lineTo(9, -3); c.quadraticCurveTo(0, 0, -9, -3); c.closePath(); }, '#1f2937');
    line(c, [-7.6, -12, 7.6, -12], '#ff3df0', 1.6);
    line(c, [-1, -24, 4, -12], '#374151', 1.4);
    shape(c, el(-8.5, -16, 2.8, 6, 0.3), '#1f2937'); shape(c, el(7, -14, 2.8, 2.8), '#374151', 1.3);
    shape(c, el(0, -31, 7.6, 7.2), '#1f2937');
    shape(c, rr(-1, -34.2, 9.4, 3.8, 1.8), '#22e3ff', 1.2);
    line(c, [0.4, -33, 7, -33], '#fff', 0.8);
    shape(c, c => { c.moveTo(-7, -33); c.quadraticCurveTo(-13, -35, -15, -31); c.quadraticCurveTo(-12, -32, -7, -30.4); c.closePath(); }, '#ff3df0', 1.2);
  },
  techdroid(c) {
    line(c, [8, -21, 15.5, -25], OL, 2.8); line(c, [8, -21, 15.5, -25], '#9ca3af', 1.4);
    shape(c, c => { c.moveTo(14.5, -28.5); c.lineTo(18.5, -27.5); c.lineTo(17.4, -25.4); c.lineTo(19.6, -23.6); c.lineTo(17.4, -21.6); c.lineTo(15, -24); c.closePath(); }, '#d1d5db', 1.2);
    line(c, [-8, -19, -13, -15], OL, 2.8); line(c, [-8, -19, -13, -15], '#9ca3af', 1.4); shape(c, el(-13.6, -14.4, 2.2, 2.2), '#7be04a', 1.1);
    shape(c, rr(-10, -31, 20, 21, 8), '#eef2f7');
    shape(c, rr(-6, -27, 12, 9.6, 2), '#1f2937', 1.2);
    c.fillStyle = '#7be04a'; c.fillRect(-1.1, -25.6, 2.2, 7); c.fillRect(-3.5, -23.2, 7, 2.2);
    line(c, [-8, -12.5, 8, -12.5], '#22e3ff', 1.4);
    shape(c, c => { c.moveTo(-8.2, -31); c.quadraticCurveTo(-8.2, -40, 0, -40.4); c.quadraticCurveTo(8.2, -40, 8.2, -31); c.closePath(); }, '#22d3ee', 1.6);
    dot(c, 2.6, -34.6, 2.4, '#1f2937'); dot(c, 3.2, -35.2, 0.8, '#fff');
    shape(c, el(-3.6, -37, 2, 1, -0.5), 'rgba(255,255,255,.7)', 0);
  },
  hackerkid(c) {
    shape(c, c => { c.moveTo(-8, -22); c.quadraticCurveTo(-10, -10, -8.5, -3); c.quadraticCurveTo(0, 0, 8.5, -3); c.quadraticCurveTo(10, -10, 8, -22); c.quadraticCurveTo(0, -25, -8, -22); c.closePath(); }, '#374151');
    line(c, [-2, -21, -2.4, -15], '#9ca3af', 1); line(c, [2, -21, 2.4, -15], '#9ca3af', 1);
    shape(c, el(-9, -14, 2.6, 5.4, 0.25), '#374151');
    shape(c, poly(3, -12, 19, -12, 21, -9, 1, -9), '#9ca3af', 1.3);
    shape(c, poly(4.4, -12, 7, -26, 22, -26, 18.6, -12), '#1f2937', 1.4);
    shape(c, c => heartPath(c, 13.6, -19.2, 2.4), '#7be04a', 0.9);
    shape(c, el(5, -12.4, 2.5, 2.5), '#e0a872', 1.2);
    shape(c, el(0, -29, 9, 8.6), '#374151');
    shape(c, el(2, -28, 6, 5.8), '#e0a872', 1.3);
    shape(c, rr(-2.6, -31, 4.8, 3.2, 1), '#a3ff7a', 1); shape(c, rr(3.2, -31, 4.8, 3.2, 1), '#a3ff7a', 1);
    line(c, [2.2, -29.4, 3.2, -29.4], OL, 0.9);
    c.beginPath(); c.moveTo(0.6, -25.2); c.quadraticCurveTo(3, -24, 5, -25.8); c.strokeStyle = OL; c.lineWidth = 1; c.stroke();
    shape(c, c => { c.moveTo(-1.6, -33.4); c.quadraticCurveTo(2, -36, 6.4, -33.6); c.quadraticCurveTo(2, -34.4, -1.6, -33.4); c.closePath(); }, '#5b3a26', 0);
  },
  neonsniper(c) {
    shape(c, c => { c.moveTo(-8, -26); c.lineTo(8, -26); c.lineTo(11, -3); c.lineTo(3, -5.5); c.lineTo(-11, -3); c.closePath(); }, '#312e81');
    line(c, [-10.6, -4, 10.6, -4], '#22e3ff', 1.2);
    shape(c, rr(-8, -23, 33, 4.6, 1.6), '#1f2937');
    line(c, [24, -21, 35, -21], OL, 2.8); line(c, [24, -21, 35, -21], '#4b5563', 1.4);
    shape(c, poly(-8, -23, -14, -20, -13, -15, -6, -18.6), '#1f2937', 1.4);
    shape(c, rr(5, -29, 12, 4, 1.6), '#374151', 1.3); shape(c, el(17, -27, 1.6, 2), '#ff3df0', 1);
    line(c, [-6, -21.6, 22, -21.6], '#ff3df0', 1);
    shape(c, el(-3, -19, 3, 3), '#c68642', 1.3); shape(c, el(11, -18.6, 2.8, 2.8), '#c68642', 1.3);
    shape(c, c => { c.moveTo(-8.2, -29); c.quadraticCurveTo(-9.4, -40, 0, -40.4); c.quadraticCurveTo(9.4, -40, 8.2, -29); c.closePath(); }, '#312e81');
    shape(c, el(1.5, -31, 6, 5.6), '#c68642', 1.3);
    shape(c, rr(0, -33.6, 9.4, 3.4, 1.6), '#ff3df0', 1.2); line(c, [1.4, -32.4, 7.6, -32.4], '#fff', 0.8);
    shape(c, c => { c.moveTo(-5, -36); c.quadraticCurveTo(2, -38, 6, -35); c.quadraticCurveTo(1, -35.4, -2, -33); c.closePath(); }, '#c084fc', 1);
  },
  siegemech(c) {
    shape(c, rr(-12.5, -17, 8.5, 15, 2), '#374151'); shape(c, rr(4, -17, 8.5, 15, 2), '#374151');
    shape(c, rr(-14.5, -21, 29, 6, 2), '#1f2937', 1.6);
    shape(c, rr(-24, -55, 13, 13, 2.4), '#4b5563');
    for (const [mx, my] of [[-20.5, -51.5], [-15, -51.5], [-20.5, -46], [-15, -46]]) dot(c, mx, my, 1.8, '#ff3348');
    shape(c, rr(-18, -45, 36, 26, 6), '#6b7280');
    c.save(); c.beginPath(); rrPath(c, -18, -25, 36, 6, 2); c.clip(); c.fillStyle = '#ffcb3d'; c.fillRect(-18, -25, 36, 6); c.fillStyle = '#1f2937'; for (let i = -20; i < 20; i += 6) { c.beginPath(); c.moveTo(i, -19); c.lineTo(i + 3, -25); c.lineTo(i + 6, -25); c.lineTo(i + 3, -19); c.closePath(); c.fill(); } c.restore();
    shape(c, rr(-18, -45, 36, 26, 6), null, 2.2);
    shape(c, rr(2, -41, 13, 10, 3), '#22e3ff', 1.5); shape(c, el(7, -35, 3, 3), '#1f2937', 0); line(c, [4, -39.4, 9, -39.4], 'rgba(255,255,255,.8)', 1);
    shape(c, el(-21, -30, 4.6, 8, 0.2), '#4b5563');
    shape(c, rr(-6, -58, 27, 10, 3.4), '#4b5563');
    shape(c, rr(20, -57, 15, 7.6, 2), '#374151', 1.5); shape(c, rr(33, -58.2, 4, 10, 1.4), '#1f2937', 1.3);
    line(c, [-3, -53, 18, -53], '#22e3ff', 1.2);
    line(c, [8, -58, 6, -66], OL, 1.6); dot(c, 5.8, -66.6, 1.8, '#ff3df0');
  },
  c_tower(c) {
    shape(c, c => { c.moveTo(-21, -2); c.lineTo(-16, -30); c.lineTo(16, -30); c.lineTo(21, -2); c.quadraticCurveTo(0, 5, -21, -2); c.closePath(); }, '#374151');
    c.strokeStyle = '#22e3ff'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-12, -6); c.lineTo(-10, -18); c.lineTo(-4, -22); c.moveTo(12, -6); c.lineTo(10, -16); c.lineTo(4, -20); c.stroke();
    dot(c, -4, -22, 1.6, '#22e3ff'); dot(c, 4, -20, 1.6, '#22e3ff');
    shape(c, rr(-7, -21, 14, 9, 2), '#1f2937', 1.4); dot(c, -2.4, -16.4, 1.2, '#ff3df0'); dot(c, 2.4, -16.4, 1.2, '#7be04a');
    shape(c, rr(-9, -46, 18, 17, 2), '#4b5563');
    line(c, [-9, -37, 9, -37], '#ff3df0', 1.4);
    shape(c, el(0, -46, 15, 4.6), '#1f2937', 1.6);
    shape(c, rr(-14, -64, 28, 18, 7), '#6b7280');
    shape(c, rr(10, -61, 22, 6.4, 2), '#374151', 1.5); shape(c, rr(30, -62, 4, 8.4, 1.2), '#1f2937', 1.3);
    line(c, [12, -57.8, 29, -57.8], '#22e3ff', 1.2);
    shape(c, el(-4, -55, 5.4, 5.4), '#111827', 1.4); dot(c, -3.4, -55, 2.8, '#22e3ff'); dot(c, -4.4, -56, 0.9, '#fff');
    line(c, [-8, -64, -10, -77], OL, 1.8); dot(c, -10.2, -77.6, 2.2, '#ff3df0');
  },
  c_base(c) {
    shape(c, rr(-60, -8, 120, 10, 3), '#1f2937');
    shape(c, c => { c.moveTo(-56, -6); c.lineTo(-56, -26); c.quadraticCurveTo(-54, -72, 0, -74); c.quadraticCurveTo(54, -72, 56, -26); c.lineTo(56, -6); c.closePath(); }, '#4b5563');
    c.save(); c.beginPath(); c.moveTo(-56, -6); c.lineTo(-56, -26); c.quadraticCurveTo(-54, -72, 0, -74); c.quadraticCurveTo(54, -72, 56, -26); c.lineTo(56, -6); c.closePath(); c.clip();
    c.strokeStyle = '#374151'; c.lineWidth = 1.4; c.beginPath(); for (let y = -66; y < -6; y += 10) { c.moveTo(-60, y); c.lineTo(60, y); } for (const xx of [-36, -18, 18, 36]) { c.moveTo(xx, -80); c.lineTo(xx, 0); } c.stroke();
    c.restore();
    c.beginPath(); c.moveTo(-50, -24); c.quadraticCurveTo(-48, -64, 0, -66); c.quadraticCurveTo(48, -64, 50, -24); c.strokeStyle = '#22e3ff'; c.lineWidth = 2; c.stroke();
    shape(c, rr(-17, -38, 34, 32, 3), '#1f2937', 2);
    c.save(); c.beginPath(); c.rect(-14, -35, 28, 26); c.clip(); c.fillStyle = '#ffcb3d'; c.fillRect(-14, -35, 28, 26); c.fillStyle = '#1f2937'; for (let i = -40; i < 20; i += 8) { c.beginPath(); c.moveTo(i, -9); c.lineTo(i + 14, -35); c.lineTo(i + 18, -35); c.lineTo(i + 4, -9); c.closePath(); c.fill(); } c.restore();
    shape(c, rr(-14, -35, 28, 26, 2), null, 1.6);
    shape(c, rr(-36, -58, 72, 12, 3), '#111827', 1.6);
    txt(c, 'BÚNKER', 0, -51.6, 8, '#ff3df0');
    for (const wx of [-40, 40]) { shape(c, rr(wx - 6, -36, 12, 8, 2), '#111827', 1.4); line(c, [wx - 4, -32, wx + 4, -32], '#22e3ff', 1.6); }
    line(c, [-20, -72, -22, -104], OL, 2.4); line(c, [-20, -72, -22, -104], '#9ca3af', 1.2); dot(c, -22, -105, 2.6, '#ff3df0');
    line(c, [18, -73, 22, -84], OL, 2.6);
    shape(c, c => { c.moveTo(10, -92); c.quadraticCurveTo(22, -78, 36, -86); c.quadraticCurveTo(26, -90, 10, -92); c.closePath(); }, '#d1d5db', 1.6);
    line(c, [22, -86, 28, -94], OL, 1.4); dot(c, 28.4, -94.6, 1.6, '#22e3ff');
  },
});
