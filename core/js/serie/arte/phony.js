// Fans Of · Arte: los dibujos de Phony (cada uno se dibuja en el suelo, con el origen bajo los pies y la altura en y negativa)
'use strict';
Object.assign(ART, {
  presi(c) {
    shape(c, rr(-9, -19, 7.5, 18, 2.4), '#1e293b', 1.6); shape(c, rr(1.5, -19, 7.5, 18, 2.4), '#1e293b', 1.6);
    shape(c, el(-5.6, -1.4, 6, 2.6), '#0f172a', 1.4); shape(c, el(5.6, -1.4, 6, 2.6), '#0f172a', 1.4);
    shape(c, el(0, -30, 15, 14.5), '#1e3a8a', 2);
    shape(c, poly(-6, -44, 6, -44, 0, -31), '#fff6ea', 1.4);
    shape(c, poly(-1.8, -42, 1.8, -42, 3, -29, 0, -24, -3, -29), '#ffcb3d', 1.3);
    shape(c, rr(-19, -38, 6.5, 15, 3), '#1e3a8a', 1.6); shape(c, el(-15.8, -22, 3.4, 3.4), '#e8b894', 1.3);
    shape(c, rr(11, -40, 6.5, 13, 3), '#1e3a8a', 1.6);
    c.save(); c.translate(19, -42); c.rotate(-0.25); shape(c, rr(-9, -6, 18, 12, 2), '#334155', 1.6); c.fillStyle = '#ffcb3d'; c.fillRect(-6.5, 0.5, 5, 2.6); otxt(c, '9,99', 2.5, -2.4, 5.2, '#fff6ea'); c.restore();
    shape(c, el(0, -52, 10.5, 10.5), '#e8b894', 2);
    shape(c, c2 => { c2.moveTo(-10.5, -52); c2.quadraticCurveTo(-11, -64, 0, -63.5); c2.quadraticCurveTo(11, -64, 10.5, -52); c2.quadraticCurveTo(9, -57, 0, -58); c2.quadraticCurveTo(-9, -57, -10.5, -52); c2.closePath(); }, '#d1d5db', 1.6);
    shape(c, el(-4, -53, 3.3, 3.1), '#e0f2fe', 1.2); shape(c, el(4, -53, 3.3, 3.1), '#e0f2fe', 1.2); line(c, [-0.8, -53, 0.8, -53], OL, 1.2); dot(c, -4, -52.6, 1.1, OL); dot(c, 4, -52.6, 1.1, OL);
    line(c, [-4.2, -46.2, 0, -45, 4.2, -46.2], OL, 1.5);
  },
  sp_cobro(c) { spBg(c, 'd'); c.save(); c.translate(0, -22); c.rotate(-0.2); shape(c, rr(-15, -9, 30, 19, 3), '#334155', 2); shape(c, rr(-15, -5, 30, 4, 0), '#0f172a', 0); shape(c, rr(-11, 3, 8, 4, 1), '#ffcb3d', 1); c.restore(); otxt(c, '9,99€', 2, -38, 7.6, '#ffe06a'); },
  /* ---------- v0.9.13: Phony y su PayStation (rival de la campaña 2) ---------- */
  descargabot(c) {
    line(c, [-9, -16, -13, -10], OL, 2.6); line(c, [-9, -16, -13, -10], '#cbd5e1', 1.2);
    line(c, [9, -16, 13, -10], OL, 2.6); line(c, [9, -16, 13, -10], '#cbd5e1', 1.2);
    shape(c, rr(-10, -32, 20, 28, 8), '#eef2f7');
    shape(c, rr(-7, -29, 14, 9, 2.4), '#111827', 1.3);
    dot(c, -3, -24.6, 1.6, '#3b82f6'); dot(c, 3, -24.6, 1.6, '#3b82f6');
    shape(c, rr(-7.4, -17, 14.8, 4.6, 2), '#1f2937', 1.2);
    c.fillStyle = '#3b82f6'; c.fillRect(-6.6, -16.2, 13.2 * 0.92, 3);
    txt(c, '99%', 0, -9.4, 4.6, '#1d4ed8');
    line(c, [0, -32, 0, -36], OL, 1.6);
    shape(c, poly(-2.6, -42, 2.6, -42, 2.6, -39.4, 4.6, -39.4, 0, -35, -4.6, -39.4, -2.6, -39.4), '#3b82f6', 1.1);
  },
  licenciabot(c) {
    c.save(); c.translate(14, -20); c.rotate(0.2);
    shape(c, rr(-5, -8, 10, 14, 1), '#fff', 1.4); line(c, [-3, -5, 3, -5], '#9ca3af', 0.9); line(c, [-3, -2.6, 3, -2.6], '#9ca3af', 0.9); line(c, [-3, -0.2, 1.4, -0.2], '#9ca3af', 0.9); dot(c, 2, 3, 1.8, '#dc2626');
    c.restore();
    shape(c, rr(-11, -30, 22, 26, 5), '#1e3a8a');
    shape(c, rr(-8, -26, 16, 10, 2.4), '#111827', 1.3);
    dot(c, -3.4, -21.2, 1.6, '#60a5fa'); dot(c, 3.4, -21.2, 1.6, '#60a5fa');
    line(c, [-3, -18, 3, -18], '#60a5fa', 1);
    shape(c, rr(-11, -10, 22, 3.6, 1.2), '#172554', 1.1);
    shape(c, el(10.6, -18, 3, 3), '#3b82f6', 1.3);
    shape(c, rr(-6, -33, 12, 3, 1), '#ffcb3d', 1.2); shape(c, rr(-6, -45, 12, 3, 1), '#ffcb3d', 1.2);
    shape(c, c => { c.moveTo(-4.6, -42); c.lineTo(4.6, -42); c.lineTo(0.8, -37.6); c.lineTo(4.6, -33); c.lineTo(-4.6, -33); c.lineTo(-0.8, -37.6); c.closePath(); }, 'rgba(200,230,255,.6)', 1.2);
    shape(c, poly(-3, -33, 3, -33, 0, -35.8), '#f59e0b', 0); dot(c, 0, -39.6, 0.8, '#f59e0b');
  },
  plusbot(c) {
    c.save(); c.translate(15, -22); c.rotate(-0.3); shape(c, rr(-6, -4, 12, 8, 1.4), '#ffcb3d', 1.3); c.fillStyle = '#b45309'; c.fillRect(-6, -1.8, 12, 1.6); c.restore();
    line(c, [9, -22, 12, -22], OL, 2.4);
    shape(c, el(0, -24, 12, 11.5), '#0ea5e9');
    shape(c, rr(-7.4, -32, 14.8, 6.6, 3.2), '#e0f2fe', 1.3);
    dot(c, -3, -28.7, 1.4, OL); dot(c, 3.4, -28.7, 1.4, OL);
    shape(c, el(0, -18.4, 5, 4.8), '#fff', 1.2);
    c.fillStyle = '#0284c7'; c.fillRect(-1.1, -21.6, 2.2, 6.4); c.fillRect(-3.2, -19.5, 6.4, 2.2);
    line(c, [-9, -16, -12, -11], OL, 1); shape(c, rr(-20, -11, 14, 6.6, 1.6), '#fff', 1.2); txt(c, '9,99', -13, -7.5, 4.6, '#dc2626');
    c.beginPath(); c.ellipse(0, -38, 7, 2, 0, 0, Math.PI * 2); c.strokeStyle = OL; c.lineWidth = 3; c.stroke(); c.strokeStyle = '#7dd3fc'; c.lineWidth = 1.5; c.stroke();
  },
  cobradlc(c) {
    line(c, [13, -22, 21, -18], OL, 3); line(c, [13, -22, 21, -18], '#94a3b8', 1.6);
    shape(c, rr(18, -26, 8, 11, 1.6), '#1f2937', 1.3); shape(c, rr(19.4, -24.6, 5.2, 3.6, 0.8), '#7be04a', 0);
    shape(c, c => { c.moveTo(-15, -4); c.lineTo(-15, -26); c.lineTo(15, -26); c.lineTo(17, -4); c.closePath(); }, '#64748b');
    shape(c, rr(-16, -10, 33, 6, 1.6), '#475569', 1.4);
    dot(c, 0.5, -7, 1.2, '#ffcb3d');
    for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) shape(c, rr(-12 + j * 5.6, -23 + i * 4.4, 4, 3, 0.8), j === 3 ? '#f87171' : '#e2e8f0', 0.8);
    shape(c, rr(-11, -42, 22, 15, 3), '#334155');
    shape(c, rr(-8, -39, 16, 9, 2), '#111827', 1.2);
    txt(c, '€', -3.6, -34, 6.6, '#7be04a'); txt(c, '€', 3.6, -34, 6.6, '#7be04a');
    line(c, [-6.4, -38, -1.6, -37], '#7be04a', 1.1); line(c, [6.4, -38, 1.6, -37], '#7be04a', 1.1);
    shape(c, rr(-5, -49, 8, 8, 0.6), '#fff', 1.1); line(c, [-3.4, -46.6, 1.4, -46.6], '#9ca3af', 0.8); line(c, [-3.4, -44.6, 1.4, -44.6], '#9ca3af', 0.8);
  },
  servidorbot(c) {
    c.lineWidth = 3.4; c.strokeStyle = OL; c.beginPath(); c.moveTo(-16, -40); c.quadraticCurveTo(-26, -30, -22, -16); c.moveTo(16, -40); c.quadraticCurveTo(26, -30, 22, -16); c.stroke();
    c.lineWidth = 1.8; c.strokeStyle = '#facc15'; c.beginPath(); c.moveTo(-16, -40); c.quadraticCurveTo(-26, -30, -22, -16); c.stroke(); c.strokeStyle = '#3b82f6'; c.beginPath(); c.moveTo(16, -40); c.quadraticCurveTo(26, -30, 22, -16); c.stroke();
    shape(c, rr(-25, -17, 6, 5, 1), '#9ca3af', 1.2); shape(c, rr(19, -17, 6, 5, 1), '#9ca3af', 1.2);
    shape(c, rr(-17, -56, 34, 52, 3), '#1f2937');
    for (let i = 0; i < 6; i++) { const y = -52 + i * 7.6; shape(c, rr(-13, y, 26, 5.4, 1), '#111827', 1); for (let j = 0; j < 4; j++) { c.fillStyle = ['#22c55e', '#3b82f6', '#22c55e', '#f59e0b'][(i + j) % 4]; c.fillRect(-11 + j * 3.2, y + 1.8, 1.8, 1.8); } c.fillStyle = 'rgba(160,180,220,.35)'; c.fillRect(3, y + 2, 8, 1.2); }
    shape(c, el(-5, -48.6, 3, 2.6), '#fff', 1.1); shape(c, el(5, -48.6, 3, 2.6), '#fff', 1.1); dot(c, -4.2, -48.4, 1.2, '#ef4444'); dot(c, 5.8, -48.4, 1.2, '#ef4444');
    line(c, [-8, -52.4, -2.6, -51], OL, 1.4); line(c, [8, -52.4, 2.6, -51], OL, 1.4);
    c.save(); c.translate(0, -27); c.rotate(-0.08); shape(c, rr(-16, -4.6, 32, 9.2, 1.4), '#facc15', 1.4); c.fillStyle = OL; for (let i = -14; i < 16; i += 5) { c.beginPath(); c.moveTo(i, 4.6); c.lineTo(i + 3, -4.6); c.lineTo(i + 5, -4.6); c.lineTo(i + 2, 4.6); c.closePath(); c.fill(); } c.restore();
    shape(c, rr(-5, -60, 10, 4, 1), '#374151', 1.2);
    shape(c, c => { c.moveTo(-4.4, -60); c.quadraticCurveTo(-4.4, -66, 0, -66); c.quadraticCurveTo(4.4, -66, 4.4, -60); c.closePath(); }, '#ef4444', 1.3);
    dot(c, -1.4, -62.6, 1, 'rgba(255,255,255,.8)');
  },
  remasterbot(c) {
    shape(c, el(-20, -26, 5, 8, 0.2), '#8b8b8b');
    shape(c, rr(-18, -44, 36, 38, 7), '#8b8b8b');
    c.save(); c.beginPath(); rrPath(c, -18, -44, 36, 38, 7); c.clip();
    c.fillStyle = '#e11d48'; c.fillRect(0, -50, 30, 50);
    c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(4, -41, 3.4, 28);
    c.fillStyle = '#a16207'; for (const [x, y] of [[-12, -36], [-8, -20], [-14, -14]]) { c.beginPath(); c.arc(x, y, 2.2, 0, Math.PI * 2); c.fill(); }
    c.restore();
    shape(c, rr(-18, -44, 36, 38, 7), null, 2.2);
    line(c, [16, -26, 26, -40], OL, 3.4); line(c, [16, -26, 26, -40], '#a16207', 1.8); shape(c, rr(22, -48, 8, 9, 1.4), '#e11d48', 1.3);
    shape(c, el(16, -24, 4, 4), '#e11d48', 1.3);
    shape(c, rr(-12, -58, 24, 15, 4), '#8b8b8b');
    c.save(); c.beginPath(); rrPath(c, -12, -58, 24, 15, 4); c.clip(); c.fillStyle = '#e11d48'; c.fillRect(0, -60, 14, 18); c.restore();
    shape(c, rr(-12, -58, 24, 15, 4), null, 2);
    dot(c, -5, -51, 2, '#fde047'); dot(c, 5, -51, 2, '#fde047');
    c.save(); c.translate(-8, -28); c.rotate(-0.2); shape(c, rr(-8, -4.4, 16, 8.8, 1.4), '#fff', 1.3); txt(c, '70 €', 0, 0.4, 5.8, '#dc2626'); c.restore();
  },
  y_tower(c) {
    shape(c, rr(-20, -8, 40, 8, 2), '#1f2937');
    shape(c, rr(-15, -72, 30, 65, 5), '#334155');
    shape(c, rr(-15, -72, 5, 65, 2), '#475569', 0); line(c, [-10, -70, -10, -10], '#94a3b8', 1);
    shape(c, rr(-15, -72, 30, 65, 5), null, 2.2);
    shape(c, rr(-9, -64, 18, 11, 2), '#0f172a', 1.4); txt(c, '€', -3, -58.4, 8, '#ffcb3d'); txt(c, '€', 4, -58.4, 8, '#ffcb3d');
    shape(c, rr(-3, -46, 6, 14, 2), '#111827', 1.4); line(c, [0, -44, 0, -34], '#ffcb3d', 1.6);
    shape(c, rr(-10, -26, 14, 3, 1), '#94a3b8', 1); line(c, [-12, -30, 5, -20], '#dc2626', 1.6);
    shape(c, rr(-11, -16, 22, 4, 1.4), '#ffcb3d', 1.2);
    shape(c, el(0, -80, 9, 7), '#111827');
    shape(c, el(4.6, -80, 4, 4), '#ffcb3d', 1.3); dot(c, 5.4, -81, 1.3, '#fff7d6');
    line(c, [-4, -86, -7, -93], OL, 1.6); dot(c, -7.2, -93.6, 1.8, '#ffcb3d');
  },
  y_base(c) {
    shape(c, rr(-58, -10, 116, 11, 3), '#1f2937');
    shape(c, rr(-52, -66, 104, 57, 7), '#334155');
    shape(c, rr(-52, -66, 104, 9, 4), '#475569', 0); line(c, [-48, -57, 48, -57], '#94a3b8', 1.2);
    shape(c, rr(-52, -66, 104, 57, 7), null, 2.2);
    line(c, [-52, -15, 52, -15], '#ffcb3d', 2.4);
    shape(c, rr(-14, -36, 28, 22, 3), '#0f172a', 1.8); line(c, [0, -36, 0, -15], '#ffcb3d', 1.2);
    shape(c, rr(-46, -50, 28, 4, 1.4), '#94a3b8', 1.2);
    line(c, [-48, -56, -16, -41], '#dc2626', 2.4);
    c.save(); c.translate(-31, -27); c.rotate(-0.1); shape(c, rr(-17, -5, 34, 10, 2), '#fff', 1.4); txt(c, 'SIN LECTOR', 0, 0.5, 6, '#dc2626'); c.restore();
    shape(c, rr(22, -52, 24, 30, 3), '#0f172a', 1.6); shape(c, rr(32, -48, 4, 12, 1.4), '#111827', 1.1); line(c, [34, -47, 34, -37], '#ffcb3d', 1.6);
    txt(c, 'PAGA AQUÍ', 34, -28, 4.6, '#ffcb3d');
    shape(c, rr(-34, -98, 68, 24, 5), '#111827', 2);
    txt(c, 'PHONY', 0, -86, 14, '#ffcb3d');
    line(c, [-28, -78.6, 28, -78.6], '#dc2626', 1.6);
    line(c, [-20, -74, -20, -66], OL, 2.6); line(c, [20, -74, 20, -66], OL, 2.6);
    line(c, [0, -98, 0, -114], OL, 3); shape(c, el(0, -118, 4.4, 4.4), '#ffcb3d', 1.4);
    for (const [x, y] of [[-46, -88], [44, -94]]) { shape(c, el(x, y, 5.4, 5.4), '#ffcb3d', 1.4); txt(c, '€', x, y + 0.4, 6.4, '#a16207'); }
  },
});
