// Fans Of · Arte: los dibujos de Gamer (cada uno se dibuja en el suelo, con el origen bajo los pies y la altura en y negativa)
'use strict';
Object.assign(ART, {
  campero(c) {
    for (const [x, y, r, col] of [[-10, -12, 8, '#4d7c0f'], [10, -12, 8, '#4d7c0f'], [0, -10, 9, '#3f6212'], [-9, -24, 9, '#65a30d'], [9, -24, 9, '#4d7c0f'], [0, -32, 10, '#65a30d'], [-6, -38, 6, '#4d7c0f'], [7, -38, 6, '#3f6212']]) shape(c, el(x, y, r, r * 0.92), col, 1.8);
    for (const [x, y] of [[-12, -18], [12, -30], [-4, -42], [6, -16], [-2, -26]]) line(c, [x, y, x + 2, y - 4], '#a3e635', 1.3);
    shape(c, rr(-7, -30, 14, 5.6, 2.6), '#1f2937', 1.4);
    shape(c, el(-3.2, -27.4, 2, 1.6), '#fff', 0); shape(c, el(3.2, -27.4, 2, 1.6), '#fff', 0);
    dot(c, -2.6, -27.3, 1, OL); dot(c, 3.8, -27.3, 1, OL);
    line(c, [13, -18, 22, -24], OL, 3.4); line(c, [13, -18, 22, -24], '#9ca3af', 1.8);
    line(c, [19, -21, 21, -18], OL, 2);
  },
  sp_critico(c) { spBg(c, 'd'); c.beginPath(); starPath(c, 0, -24, 18, 8, 8); c.fillStyle = '#ffe14d'; c.fill(); c.lineWidth = 1.8; c.strokeStyle = OL; c.stroke(); c.save(); c.translate(0, -24); c.rotate(0.75); shape(c, poly(-2, -15, 2, -15, 2.6, 6, 0, 9, -2.6, 6), '#e5e7eb', 1.6); shape(c, rr(-6, 5, 12, 3, 1.2), '#7b2cbf', 1.4); shape(c, rr(-1.6, 8, 3.2, 6, 1), '#5b3a1c', 1.2); c.restore(); otxt(c, 'CRIT', 0, -6, 7, '#e63946'); },
  sp_review(c) { spBg(c, 'c'); for (let i = 0; i < 5; i++) { c.beginPath(); starPath(c, -16 + i * 8, -26, 4.6, 2, 5); c.fillStyle = i ? '#3e2363' : '#ffe14d'; c.fill(); c.lineWidth = 1.2; c.strokeStyle = OL; c.stroke(); } otxt(c, '1/10', 0, -10, 10, '#ff4b5c'); otxt(c, 'NO COMPRAR', 0, -40, 6.5, '#fff6ea'); },
  sp_energetica(c) { spBg(c, 'h'); shape(c, rr(-9, -38, 18, 29, 3), '#22c55e', 2.2); shape(c, rr(-9, -38, 18, 4, 1.6), '#cbd5e1', 1.4); shape(c, rr(-9, -13, 18, 4, 1.6), '#cbd5e1', 1.4); shape(c, poly(1, -32, -5, -22, -1, -22, -3, -14, 5, -25, 1, -25, 3, -32), '#ffe14d', 1.2); },
  sp_ping(c) { spBg(c, 'c'); for (const [r, a] of [[16, 1], [11, 1], [6, 1]]) { c.beginPath(); c.arc(0, -12, r, Math.PI * 1.22, Math.PI * 1.78); c.lineWidth = 5; c.strokeStyle = OL; c.stroke(); c.lineWidth = 2.8; c.strokeStyle = '#ff4b5c'; c.stroke(); } dot(c, 0, -12, 2.6, OL); dot(c, 0, -12, 1.6, '#ff4b5c'); otxt(c, '999', 0, -36, 9, '#fff6ea'); },
  /* ---------- v0.9.13: Comunidad Gamer ---------- */
  progamer(c) {
    c.save(); c.translate(18, -30); c.rotate(0.45);
    shape(c, rr(-3, -2, 6, 8, 1.4), '#1f2937', 1.3);
    shape(c, rr(-5, -30, 10, 28, 2), '#111827', 1.6);
    ['#ff3348', '#ffcb3d', '#7be04a', '#22e3ff', '#a855f7', '#ff3df0'].forEach((col, i) => { c.fillStyle = col; c.fillRect(-3.4, -27.6 + i * 4.3, 2.6, 2.6); c.fillRect(0.6, -27.6 + i * 4.3, 2.6, 2.6); });
    c.restore();
    shape(c, c => { c.moveTo(-12, -33); c.quadraticCurveTo(-16, -17, -13, -4); c.quadraticCurveTo(0, 0, 13, -4); c.quadraticCurveTo(16, -17, 12, -33); c.quadraticCurveTo(0, -37, -12, -33); c.closePath(); }, '#111827');
    c.save(); c.beginPath(); c.moveTo(-12, -33); c.quadraticCurveTo(-16, -17, -13, -4); c.quadraticCurveTo(0, 0, 13, -4); c.quadraticCurveTo(16, -17, 12, -33); c.quadraticCurveTo(0, -37, -12, -33); c.closePath(); c.clip();
    c.fillStyle = '#22c55e'; c.beginPath(); c.moveTo(-16, -27); c.lineTo(16, -15); c.lineTo(16, -10); c.lineTo(-16, -22); c.closePath(); c.fill(); c.restore();
    txt(c, '1', 1, -27, 8, '#fff');
    shape(c, rr(-13, -9, 26, 4, 1.4), '#22c55e', 1.3);
    shape(c, rr(-12.6, -15.6, 5, 8, 1.4), '#a3e635', 1.2);
    shape(c, el(-13.6, -22, 4.4, 8, 0.25), '#111827'); shape(c, el(-14.6, -14.6, 3.2, 3.2), '#f1c27d', 1.3);
    shape(c, el(13.6, -25, 4.4, 7, -0.6), '#111827'); shape(c, el(16.4, -29.6, 3.4, 3.4), '#f1c27d', 1.3);
    shape(c, el(0, -43, 9, 8.6), '#f1c27d');
    shape(c, poly(-9, -45, -10, -52, -5, -49, -4, -55, 0, -50, 3, -56, 5, -50, 9, -53, 9, -45, 0, -49), '#7c3aed', 1.5);
    c.beginPath(); c.arc(0, -43, 10.4, Math.PI * 1.05, Math.PI * 1.95); c.strokeStyle = OL; c.lineWidth = 4; c.stroke(); c.strokeStyle = '#22c55e'; c.lineWidth = 2.2; c.stroke();
    shape(c, rr(-12, -47, 5, 9, 2), '#1f2937', 1.4); shape(c, rr(7, -47, 5, 9, 2), '#1f2937', 1.4);
    c.beginPath(); c.moveTo(9, -40); c.quadraticCurveTo(8, -35, 3, -35.4); c.strokeStyle = OL; c.lineWidth = 1.4; c.stroke(); dot(c, 3, -35.4, 1.3, '#22c55e');
    dot(c, -3, -43.4, 1.4, OL); dot(c, 3.6, -43.4, 1.4, OL);
    line(c, [-5.6, -46, -1, -45.4], OL, 1.4); line(c, [6, -46, 1.6, -45.4], OL, 1.4);
    line(c, [-1, -38.6, 2.6, -38.8], OL, 1.2);
  },
  noobs(c) {
    shape(c, c => { c.moveTo(-7, -17); c.lineTo(7, -17); c.lineTo(8, -3); c.quadraticCurveTo(0, -1, -8, -3); c.closePath(); }, '#f97316');
    shape(c, rr(-4, -14.6, 8, 8, 1), '#fff', 1); c.fillStyle = '#dc2626'; c.fillRect(-2, -13, 1.8, 5.4); c.fillRect(-2, -9.4, 4.2, 1.8);
    shape(c, el(8, -9, 2.4, 2.4), '#f1c27d', 1.2); shape(c, el(-8, -9, 2.4, 2.4), '#f1c27d', 1.2);
    shape(c, el(0, -22, 6.6, 6.2), '#f1c27d');
    shape(c, el(-2.4, -22.6, 1.8, 2), '#fff', 1); shape(c, el(2.8, -22.6, 1.8, 2), '#fff', 1);
    dot(c, -2, -22.4, 0.9, OL); dot(c, 3.2, -22.4, 0.9, OL);
    shape(c, el(0.4, -18.6, 1.6, 1.2), '#7f1d1d', 0.9);
    shape(c, c => { c.moveTo(-6.6, -24); c.quadraticCurveTo(-6.6, -31, 0, -31); c.quadraticCurveTo(6.6, -31, 6.6, -24); c.closePath(); }, '#3b82f6', 0);
    shape(c, c => { c.moveTo(-6.6, -24); c.quadraticCurveTo(-6.6, -31, 0, -31); c.lineTo(0, -24); c.closePath(); }, '#ef4444', 0);
    shape(c, c => { c.moveTo(-6.6, -24); c.quadraticCurveTo(-6.6, -31, 0, -31); c.quadraticCurveTo(6.6, -31, 6.6, -24); c.closePath(); }, null, 1.4);
    line(c, [0, -31, 0, -34], OL, 1.2);
    shape(c, el(-3.6, -34.4, 3.6, 1.2), '#ffcb3d', 1); shape(c, el(3.6, -34.4, 3.6, 1.2), '#22c55e', 1);
  },
  speedrunner(c) {
    line(c, [-20, -24, -12, -24], 'rgba(255,255,255,.85)', 1.6); line(c, [-22, -16, -13, -16], 'rgba(255,255,255,.85)', 1.6); line(c, [-18, -8, -11, -8], 'rgba(255,255,255,.85)', 1.6);
    shape(c, el(-8.6, -18, 3.4, 6, 0.8), '#16a34a');
    shape(c, c => { c.moveTo(-6, -28); c.quadraticCurveTo(-10, -16, -8, -4); c.quadraticCurveTo(0, -1, 8, -4); c.quadraticCurveTo(10, -18, 6, -28); c.quadraticCurveTo(0, -31, -6, -28); c.closePath(); }, '#16a34a');
    line(c, [-5, -26, -6, -6], '#fff', 1.4); line(c, [5, -26, 6, -6], '#fff', 1.4);
    shape(c, el(9, -20, 3.6, 6.4, -0.8), '#16a34a');
    shape(c, el(14.6, -24, 4, 4), '#e5e7eb', 1.4); line(c, [14.6, -24, 14.6, -26.4], OL, 1); line(c, [14.6, -24, 16.4, -24], OL, 1); shape(c, rr(13.6, -29.6, 2, 2, 0.5), '#9ca3af', 0.8);
    shape(c, el(1.6, -33.6, 7, 6.6), '#e0a872');
    shape(c, c => { c.moveTo(-5.4, -38); c.quadraticCurveTo(-4, -43, 3, -42); c.quadraticCurveTo(9, -41, 8.6, -37.6); c.closePath(); }, '#78350f', 1.3);
    shape(c, rr(-5.4, -37.6, 14, 3, 1.2), '#dc2626', 1.2);
    shape(c, poly(-5, -36.4, -10, -34, -9.6, -38.4), '#dc2626', 1);
    dot(c, 0.6, -33.4, 1.1, OL); dot(c, 5.4, -33.4, 1.1, OL);
    c.beginPath(); c.arc(3.4, -30.6, 1.8, 0.2, Math.PI - 0.2); c.strokeStyle = OL; c.lineWidth = 1.1; c.stroke();
  },
  modder(c) {
    line(c, [10, -16, 18, -32], OL, 3.6); line(c, [10, -16, 18, -32], '#9ca3af', 2);
    shape(c, el(19, -34, 4, 4), '#9ca3af', 1.4); shape(c, rr(17.4, -39.4, 3.2, 4, 0.6), '#1f2937', 0);
    shape(c, rr(-15, -30, 8, 20, 2), '#4b5563');
    shape(c, c => { c.moveTo(-9, -29); c.quadraticCurveTo(-12, -15, -10, -3); c.quadraticCurveTo(0, 0, 10, -3); c.quadraticCurveTo(12, -15, 9, -29); c.quadraticCurveTo(0, -32, -9, -29); c.closePath(); }, '#0d9488');
    txt(c, '{ }', 0, -17, 6.4, '#ccfbf1');
    shape(c, el(10, -18, 3, 3), '#e0a872', 1.3);
    shape(c, el(0, -37, 7.6, 7.2), '#e0a872');
    shape(c, poly(-8, -39, -9, -45, -4, -43, -2, -47, 2, -44, 6, -47, 7, -42, 8.6, -39, 0, -42), '#57534e', 1.3);
    c.beginPath(); c.arc(-3, -37.6, 2.8, 0, Math.PI * 2); c.moveTo(6.6, -37.6); c.arc(3.8, -37.6, 2.8, 0, Math.PI * 2); c.fillStyle = 'rgba(220,240,255,.7)'; c.fill(); c.lineWidth = 1.4; c.strokeStyle = OL; c.stroke();
    dot(c, -3, -37.4, 0.9, OL); dot(c, 3.8, -37.4, 0.9, OL);
    c.beginPath(); c.arc(0.6, -33.2, 1.8, 0.2, Math.PI - 0.2); c.strokeStyle = OL; c.lineWidth = 1.1; c.stroke();
  },
  coleccionista(c) {
    shape(c, rr(-17, -34, 12, 26, 3), '#92400e');
    for (const [x, y, col] of [[-18, -42, '#2563eb'], [-14, -45, '#dc2626'], [-10, -41, '#16a34a']]) shape(c, rr(x, y, 5, 11, 0.8), col, 1.2);
    shape(c, c => { c.moveTo(-8, -28); c.quadraticCurveTo(-11, -15, -9, -3); c.quadraticCurveTo(0, 0, 9, -3); c.quadraticCurveTo(11, -15, 8, -28); c.quadraticCurveTo(0, -31, -8, -28); c.closePath(); }, '#f59e0b');
    shape(c, el(0, -16, 4.6, 4.6), '#e5e7eb', 1.2); dot(c, 0, -16, 1.2, OL);
    shape(c, rr(-9, -31, 3.4, 22, 1.2), '#78350f', 1);
    shape(c, el(10, -22, 3.6, 6.6, -0.6), '#f59e0b');
    shape(c, el(15, -28, 6, 6), '#e5e7eb', 1.5);
    c.beginPath(); c.arc(15, -28, 4.2, -0.6, 0.9); c.strokeStyle = '#ff8fd0'; c.lineWidth = 1.2; c.stroke(); c.beginPath(); c.arc(15, -28, 4.2, 2.4, 3.6); c.strokeStyle = '#7dd3fc'; c.stroke();
    dot(c, 15, -28, 1.5, OL);
    shape(c, el(0, -36, 7.4, 7), '#f1c27d');
    shape(c, rr(-5.6, -38.6, 11.6, 3.4, 1.2), 'rgba(220,240,255,.7)', 1.2); line(c, [0.2, -38.4, 0.2, -35.4], OL, 1);
    dot(c, -2.6, -37, 0.9, OL); dot(c, 3.2, -37, 0.9, OL);
    c.beginPath(); c.arc(0.6, -32.6, 1.8, 0.2, Math.PI - 0.2); c.strokeStyle = OL; c.lineWidth = 1.1; c.stroke();
    shape(c, c => { c.moveTo(-7, -39); c.quadraticCurveTo(-6, -46, 0, -45.6); c.quadraticCurveTo(7, -46, 7.4, -39); c.closePath(); }, '#1d4ed8', 1.4);
    shape(c, rr(4, -40.6, 9, 2.6, 1.2), '#1d4ed8', 1.2);
  },
  ragequitter(c) {
    shape(c, rr(-15, -44, 12, 30, 4), '#dc2626'); shape(c, rr(-13, -40, 8, 6, 2), '#111827', 1);
    shape(c, c => { c.moveTo(-10, -32); c.quadraticCurveTo(-14, -17, -11, -3); c.quadraticCurveTo(0, 0, 11, -3); c.quadraticCurveTo(14, -17, 10, -32); c.quadraticCurveTo(0, -35, -10, -32); c.closePath(); }, '#4b5563');
    shape(c, rr(-6, -24, 12, 7, 2), '#374151', 1.1);
    shape(c, el(12, -22, 4, 6.6, -0.6), '#4b5563');
    c.save(); c.translate(17, -28); c.rotate(0.3);
    shape(c, c => { c.moveTo(-6, -2); c.quadraticCurveTo(-7, 4, -3, 4); c.lineTo(-1, 1); c.lineTo(-0.4, -3); c.closePath(); }, '#1f2937', 1.2);
    shape(c, c => { c.moveTo(1, -3); c.lineTo(1.6, 1); c.lineTo(3.6, 4); c.quadraticCurveTo(7, 4, 6, -2); c.closePath(); }, '#1f2937', 1.2);
    dot(c, -3.4, -0.4, 0.9, '#ff3348'); dot(c, 3.6, -0.4, 0.9, '#22e3ff');
    c.restore();
    c.beginPath(); c.arc(0, -30, 8, 0.2, Math.PI - 0.2); c.strokeStyle = OL; c.lineWidth = 3.4; c.stroke(); c.strokeStyle = '#9ca3af'; c.lineWidth = 1.6; c.stroke();
    shape(c, el(0.5, -40, 8.6, 8.2), '#f87171');
    shape(c, poly(-8, -43, -7, -49, -3, -47, 0, -50, 3, -47, 7, -49, 9, -43, 0.5, -46), '#1f2937', 1.3);
    line(c, [-5, -44, -0.6, -42.4], OL, 1.8); line(c, [7, -44, 2.6, -42.4], OL, 1.8);
    dot(c, -2.4, -40.6, 1.3, OL); dot(c, 4, -40.6, 1.3, OL);
    shape(c, rr(-3.4, -36.4, 8, 3.4, 1.2), '#fff', 1.1); line(c, [-3.4, -34.7, 4.6, -34.7], OL, 0.8);
    for (const [x, y] of [[-9, -52], [10, -53]]) { c.beginPath(); c.moveTo(x, y + 4); c.quadraticCurveTo(x - 3, y, x, y - 3); c.quadraticCurveTo(x + 3, y - 6, x, y - 9); c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 2; c.stroke(); }
  },
  recreativa(c) {
    line(c, [-15, -34, -24, -22], OL, 4); line(c, [-15, -34, -24, -22], '#7c3aed', 2.2); shape(c, el(-24.6, -20.6, 4, 4), '#f1c27d', 1.4);
    line(c, [15, -34, 24, -26], OL, 4); line(c, [15, -34, 24, -26], '#7c3aed', 2.2); shape(c, el(24.6, -25, 4, 4), '#f1c27d', 1.4);
    shape(c, c => { c.moveTo(-16, -4); c.lineTo(-16, -40); c.lineTo(-13, -62); c.lineTo(13, -62); c.lineTo(16, -40); c.lineTo(16, -4); c.closePath(); }, '#7c3aed');
    shape(c, rr(-14, -68, 28, 8, 2), '#1f2937', 1.6);
    txt(c, 'ARCADE', 0, -63.6, 6.4, '#ffe14d');
    shape(c, rr(-11, -57, 22, 17, 2), '#111827', 1.6);
    c.fillStyle = '#7be04a'; c.fillRect(-7, -53, 4, 4); c.fillRect(3, -53, 4, 4); c.fillRect(-6, -46, 12, 2); c.fillRect(-7, -48, 2, 2); c.fillRect(5, -48, 2, 2);
    shape(c, c => { c.moveTo(-17, -40); c.lineTo(17, -40); c.lineTo(19, -33); c.lineTo(-19, -33); c.closePath(); }, '#4c1d95', 1.6);
    line(c, [-8, -37, -9, -42], OL, 1.6); dot(c, -9.2, -42.6, 2, '#ef4444');
    dot(c, 3, -36.4, 1.6, '#ffcb3d'); dot(c, 7.4, -36.4, 1.6, '#22e3ff'); dot(c, 11.8, -36.4, 1.6, '#7be04a');
    shape(c, rr(-5, -27, 10, 12, 1.4), '#1f2937', 1.4); shape(c, rr(-1, -24, 2, 6, 0.6), '#ffcb3d', 0);
    txt(c, 'INSERT COIN', 0, -9.4, 4, '#ffe14d');
  },
  g_tower(c) {
    shape(c, rr(-20, -8, 40, 8, 2), '#1f2937');
    shape(c, rr(-15, -70, 30, 63, 3), '#111827');
    shape(c, rr(-12, -66, 18, 55, 2), 'rgba(120,200,255,.18)', 1.2);
    for (const [y, col] of [[-56, '#ff3df0'], [-40, '#22e3ff'], [-24, '#7be04a']]) { c.beginPath(); c.arc(-3, y, 6, 0, Math.PI * 2); c.strokeStyle = col; c.lineWidth = 2; c.stroke(); c.beginPath(); for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + 0.4; c.moveTo(-3, y); c.lineTo(-3 + Math.cos(a) * 5, y + Math.sin(a) * 5); } c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1.1; c.stroke(); }
    shape(c, rr(8, -66, 5, 30, 1.4), '#1f2937', 1); dot(c, 10.5, -62, 1.2, '#7be04a'); dot(c, 10.5, -58, 1.2, '#ffcb3d');
    shape(c, rr(-9, -82, 18, 11, 4), '#e5e7eb');
    shape(c, el(0, -76.6, 3.6, 3.6), '#111827', 1.2); dot(c, 1, -77.6, 1.2, '#22e3ff');
    dot(c, 6, -79.6, 1, '#ff3348');
  },
  g_base(c) {
    shape(c, rr(-58, -9, 116, 10, 3), '#1f2937');
    shape(c, rr(-50, -60, 100, 52, 3), '#312e81');
    c.strokeStyle = '#4338ca'; c.lineWidth = 1.2; c.beginPath(); for (let x = -40; x < 50; x += 10) { c.moveTo(x, -58); c.lineTo(x, -10); } c.stroke();
    shape(c, poly(-56, -58, 0, -88, 56, -58), '#4c1d95', 2.2);
    line(c, [-50, -58, 50, -58], '#22e3ff', 2);
    shape(c, rr(-26, -84, 52, 26, 3), '#111827', 2);
    const g = c.createLinearGradient(0, -80, 0, -62); g.addColorStop(0, '#7c3aed'); g.addColorStop(1, '#22d3ee');
    shape(c, rr(-22, -80, 44, 18, 2), g, 1.2);
    txt(c, 'GG', 0, -70.6, 14, '#fff');
    shape(c, rr(-13, -34, 26, 26, 3), '#111827', 1.8); line(c, [0, -34, 0, -8], '#22e3ff', 1.2);
    for (const x of [-36, 36]) { shape(c, rr(x - 10, -24, 20, 3, 1), '#6b7280', 1.2); shape(c, rr(x - 7, -36, 14, 10, 1.6), '#1f2937', 1.3); shape(c, rr(x - 5.6, -34.6, 11.2, 7, 1), x < 0 ? '#22e3ff' : '#ff3df0', 0); line(c, [x, -26, x, -24], OL, 1.4); }
    shape(c, rr(-14, -100, 28, 13, 3), '#22c55e', 1.6); txt(c, 'LAN', 0, -93, 10, '#052e16');
    line(c, [0, -87, 0, -84], OL, 2);
  },
});
