// Fans of Rumble · Campaña 3, el dibujo: las cajas, los creadores y los bots de IAhorro (los datos están en 05b-creadores-datos.js)
'use strict';

/* ---------- arte ---------- */
Object.assign(BOX, {
  iahorro: [64, 74, 32, 68], promptbot: [40, 44, 20, 40], copiapega: [58, 56, 28, 50], alucinador: [56, 54, 28, 48], dronia: [60, 52, 30, 46], granjaserv: [78, 80, 39, 74], clonador: [76, 72, 38, 66],
  indie: [86, 84, 42, 78], jam: [40, 44, 20, 40], tester: [60, 58, 30, 52], pixelartista: [60, 56, 30, 50], compositora: [62, 58, 30, 52], disenadora: [62, 58, 30, 52], prototipo: [84, 82, 42, 76], freelance: [60, 56, 30, 50],
  sp_sustituir: [56, 54, 28, 50], sp_portfolio: [56, 54, 28, 50], sp_gamejam: [56, 54, 28, 50], sp_creditos: [56, 54, 28, 50],
  i_tower: [70, 100, 35, 94], i_base: [130, 132, 65, 124], r_tower: [70, 94, 35, 88], r_base: [124, 116, 62, 108],
});
const SKIN_C = '#f1c27d', SKIN_D = '#c68642', SKIN_M = '#e0a872';
function cdev(c, body, skin, hair, opts = {}) {   // un creador: cuerpo, cabeza y pelo
  shape(c, c => { c.moveTo(-8, -28); c.quadraticCurveTo(-11, -15, -9, -3); c.quadraticCurveTo(0, 0, 9, -3); c.quadraticCurveTo(11, -15, 8, -28); c.quadraticCurveTo(0, -31, -8, -28); c.closePath(); }, body);
  shape(c, el(0, -36, 7.4, 7), skin);
  if (hair) shape(c, c => { c.moveTo(-7.4, -37); c.quadraticCurveTo(-7, -45, 0, -45); c.quadraticCurveTo(7.6, -45, 7.4, -37); c.quadraticCurveTo(2, -41, -7.4, -37); c.closePath(); }, hair, 1.4);
  if (opts.glasses) { c.beginPath(); c.arc(-3, -36.6, 2.6, 0, Math.PI * 2); c.moveTo(6.4, -36.6); c.arc(3.8, -36.6, 2.6, 0, Math.PI * 2); c.fillStyle = 'rgba(220,240,255,.7)'; c.fill(); c.lineWidth = 1.3; c.strokeStyle = OL; c.stroke(); }
  dot(c, -2.8, -36.4, 0.95, OL); dot(c, 3.6, -36.4, 0.95, OL);
  c.beginPath(); c.arc(0.4, -33, 1.8, 0.2, Math.PI - 0.2); c.strokeStyle = OL; c.lineWidth = 1.1; c.stroke();
}
function screenHead(c, x, y, w, h, face) {   // cabeza de pantalla de los bots de IAhorro
  shape(c, rr(x - w / 2, y - h / 2, w, h, 3), '#1e293b', 1.8);
  shape(c, rr(x - w / 2 + 2, y - h / 2 + 2, w - 4, h - 4, 2), '#0e7490', 0);
  c.fillStyle = '#7df3ff'; c.font = Math.round(h * 0.5) + 'px ' + FONT_D; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(face || '•‿•', x, y + 1);
}
Object.assign(ART, {
  // retrato de IAhorro (Modo Jefe): un núcleo con un ojo y una corbata
  iahorro(c) {
    shape(c, el(0, -4, 20, 5), '#0f172a', 1.4);
    shape(c, rr(-17, -48, 34, 44, 9), '#1e293b', 2.2);
    shape(c, rr(-13, -44, 26, 26, 6), '#0e7490', 1.4);
    const g = c.createRadialGradient(0, -31, 1, 0, -31, 11); g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, '#7df3ff'); g.addColorStop(1, 'rgba(34,227,255,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, -31, 11, 0, Math.PI * 2); c.fill();
    dot(c, 0, -31, 3.4, '#0f172a'); dot(c, 1, -32, 1.1, '#fff');
    shape(c, poly(-4, -16, 4, -16, 2.4, -7, 0, -4, -2.4, -7), '#22e3ff', 1.4);
    otxt(c, 'IA', 0, -56, 11, '#7df3ff'); line(c, [-14, -60, -20, -66], '#7df3ff', 1.6); line(c, [14, -60, 20, -66], '#7df3ff', 1.6);
    for (const x of [-12, 12]) { c.fillStyle = '#ffcb3d'; c.font = '7px ' + FONT_D; c.fillText('€', x, -10); }
  },
  promptbot(c) {
    shape(c, rr(-6, -16, 12, 14, 3), '#475569'); line(c, [-4, -2, -4, 0], OL, 2.4); line(c, [4, -2, 4, 0], OL, 2.4);
    screenHead(c, 0, -24, 15, 11, '>_');
    line(c, [0, -30, 0, -34], OL, 1.2); dot(c, 0, -35, 1.6, '#22e3ff');
    shape(c, rr(-5, -13, 10, 3, 1), '#22e3ff', 0.8);
  },
  copiapega(c) {
    shape(c, rr(-9, -30, 18, 27, 4), '#334155');
    for (const [x, y, r] of [[13, -22, 0.2], [17, -26, -0.1]]) { c.save(); c.translate(x, y); c.rotate(r); shape(c, rr(-5, -6, 10, 12, 1.2), '#e2e8f0', 1.2); line(c, [-3, -3, 3, -3], OL, 0.9); line(c, [-3, 0, 3, 0], OL, 0.9); c.restore(); }
    otxt(c, 'Ctrl', 0, -20, 5.5, '#7df3ff'); otxt(c, 'C+V', 0, -13, 5.5, '#7df3ff');
    screenHead(c, 0, -38, 18, 13, '©©');
  },
  alucinador(c) {
    shape(c, el(0, -6, 12, 3.4), 'rgba(34,227,255,.35)', 0);
    shape(c, el(0, -24, 13, 12), '#334155');
    screenHead(c, 0, -26, 18, 12, '?‿?');
    for (const [x, y] of [[-15, -38], [14, -40], [0, -44]]) otxt(c, '?', x, y, 8, '#ffcb3d');
    line(c, [-11, -14, -15, -10], OL, 2); line(c, [11, -14, 15, -10], OL, 2);
  },
  dronia(c) {
    shape(c, el(0, -6, 16, 3.6), 'rgba(34,227,255,.3)', 0);
    for (const x of [-16, 16]) { line(c, [x * 0.6, -24, x, -28], OL, 2); shape(c, el(x, -29, 7, 1.8), '#94a3b8', 1.2); }
    shape(c, rr(-12, -28, 24, 14, 4), '#1e293b');
    shape(c, rr(-9, -26, 18, 10, 2), '#0e7490', 1);
    otxt(c, '▶', 0, -21, 7, '#fff6ea');
    otxt(c, '#CONTENIDO', 0, -36, 5, '#7df3ff');
  },
  granjaserv(c) {
    shape(c, rr(-20, -60, 40, 58, 4), '#1e293b', 2.4);
    for (let i = 0; i < 6; i++) { shape(c, rr(-16, -56 + i * 9, 32, 6, 1.4), '#334155', 1); dot(c, -12, -53 + i * 9, 1.3, i % 2 ? '#22e3ff' : '#7be04a'); dot(c, -8, -53 + i * 9, 1.3, '#22e3ff'); line(c, [0, -53 + i * 9, 12, -53 + i * 9], '#64748b', 1); }
    shape(c, el(-14, -2, 6, 2.6), '#0f172a', 1.2); shape(c, el(14, -2, 6, 2.6), '#0f172a', 1.2);
    otxt(c, 'IA', 0, -66, 8, '#7df3ff');
    for (const x of [-8, 6]) { c.globalAlpha = 0.5; line(c, [x, -64, x + 3, -72, x - 1, -78], '#cbd5e1', 1.2); c.globalAlpha = 1; }
  },
  clonador(c) {
    shape(c, rr(-18, -46, 36, 42, 6), '#334155', 2.4);
    shape(c, rr(-14, -42, 28, 18, 3), '#0e7490', 1.4);
    for (const x of [-7, 0, 7]) { shape(c, el(x, -33, 3.2, 4), '#7df3ff', 0.9); dot(c, x, -33, 1, OL); }
    otxt(c, 'x3000', 0, -16, 6.5, '#ffcb3d');
    line(c, [-18, -24, -26, -20], OL, 3.2); line(c, [18, -24, 26, -20], OL, 3.2);
    shape(c, el(-26, -19, 4, 4), '#94a3b8', 1.2); shape(c, el(26, -19, 4, 4), '#94a3b8', 1.2);
    shape(c, rr(-14, -6, 9, 6, 1.6), '#1e293b', 1.4); shape(c, rr(5, -6, 9, 6, 1.6), '#1e293b', 1.4);
    line(c, [0, -46, 0, -54], OL, 1.6); dot(c, 0, -56, 2.2, '#22e3ff');
  },
  indie(c) {
    shape(c, rr(9, -26, 9, 11, 2), '#fff6ea', 1.4); line(c, [18, -23, 21, -23, 21, -17, 18, -17], OL, 1.6); otxt(c, '☕', 13.5, -21, 5, '#7a4a22');
    for (const x of [14, 17]) { c.globalAlpha = 0.6; line(c, [x, -28, x + 1.5, -32, x, -36], '#e2e8f0', 1.1); c.globalAlpha = 1; }
    shape(c, c => { c.moveTo(-10, -32); c.quadraticCurveTo(-13, -16, -11, -3); c.quadraticCurveTo(0, 0, 11, -3); c.quadraticCurveTo(13, -16, 10, -32); c.quadraticCurveTo(0, -35, -10, -32); c.closePath(); }, '#7c3aed');
    shape(c, rr(-7, -24, 14, 10, 2), '#a78bfa', 1.2); otxt(c, '</>', 0, -19, 5.5, '#fff6ea');
    line(c, [-6, -30, -9, -36], '#a78bfa', 2.4);
    shape(c, rr(-21, -22, 15, 9, 1.6), '#1f2937', 1.6);
    for (let i = 0; i < 4; i++) dot(c, -18.5 + i * 3.4, -19, 0.9, ['#ff9a3c', '#22e3ff', '#7be04a', '#ff3df0'][i]);
    shape(c, el(0, -42, 9, 8.6), SKIN_M);
    shape(c, c => { c.moveTo(-9, -43); c.quadraticCurveTo(-10, -53, 0, -53); c.quadraticCurveTo(10, -53, 9.4, -43); c.quadraticCurveTo(4, -47, -9, -43); c.closePath(); }, '#7a3b16', 1.4);
    shape(c, el(-9.6, -40, 3, 5), '#7a3b16', 1.2);
    shape(c, c => { c.arc(0, -43, 10.6, Math.PI * 1.05, Math.PI * 1.95); }, null, 2.6); shape(c, el(-10.4, -42, 2.6, 3.4), '#1f2937', 1.2); shape(c, el(10.4, -42, 2.6, 3.4), '#1f2937', 1.2);
    dot(c, -3.2, -42, 1.1, OL); dot(c, 3.6, -42, 1.1, OL);
    c.beginPath(); c.arc(0.4, -38.4, 2.2, 0.2, Math.PI - 0.2); c.strokeStyle = OL; c.lineWidth = 1.2; c.stroke();
  },
  jam(c) {
    shape(c, c => { c.moveTo(-7, -17); c.lineTo(7, -17); c.lineTo(8, -3); c.quadraticCurveTo(0, -1, -8, -3); c.closePath(); }, '#ff9a3c');
    otxt(c, '48h', 0, -10, 5, '#fff6ea');
    shape(c, el(0, -22, 6.6, 6.2), SKIN_C);
    shape(c, c => { c.moveTo(-6.6, -23); c.quadraticCurveTo(-6, -30, 0, -30); c.quadraticCurveTo(6.6, -30, 6.6, -23); c.quadraticCurveTo(2, -26, -6.6, -23); c.closePath(); }, '#3b2a1e', 1.2);
    dot(c, -2.4, -22, 0.9, OL); dot(c, 2.8, -22, 0.9, OL);
    c.beginPath(); c.arc(0.3, -19.4, 1.4, 0.2, Math.PI - 0.2); c.strokeStyle = OL; c.lineWidth = 1; c.stroke();
    shape(c, rr(7, -14, 5, 6, 1), '#fff6ea', 1);
  },
  tester(c) {
    shape(c, rr(-18, -32, 11, 24, 3), '#facc15'); otxt(c, '!', -12.5, -20, 9, '#1f2937');
    cdev(c, '#16a34a', SKIN_D, '#1f2937', { glasses: true });
    otxt(c, 'QA', 0, -17, 7, '#fff6ea');
    shape(c, el(12, -24, 6.4, 6.4), 'rgba(220,240,255,.55)', 1.8); line(c, [16.4, -19.6, 21, -14], OL, 2.6);
    otxt(c, '🐞', 12, -24, 5, '#dc2626');
  },
  pixelartista(c) {
    shape(c, rr(9, -40, 3, 22, 1), '#a16207', 1); for (const [x, y, col] of [[11, -44, '#ff5f6d'], [14, -40, '#3fd0e8'], [8, -38, '#ffcb3d']]) shape(c, rr(x - 2, y - 2, 4, 4, 0.4), col, 0.8);
    cdev(c, '#0ea5e9', SKIN_C, '#be185d');
    for (let i = 0; i < 9; i++) { c.fillStyle = ['#ff5f6d', '#ffcb3d', '#7be04a', '#3fd0e8'][i % 4]; c.fillRect(-6 + (i % 3) * 4, -22 + Math.floor(i / 3) * 4, 3.4, 3.4); }
    shape(c, c => { c.moveTo(-8.6, -42); c.quadraticCurveTo(0, -50, 8.6, -42); c.lineTo(6, -40); c.quadraticCurveTo(0, -45, -6, -40); c.closePath(); }, '#dc2626', 1.2);
  },
  compositora(c) {
    cdev(c, '#1f2937', SKIN_M, '#facc15');
    shape(c, el(-12, -20, 5, 7, -0.4), '#a16207', 1.6); line(c, [-12, -26, -6, -42], OL, 2); line(c, [-8, -20, -16, -20], '#fde68a', 0.8);
    for (const [x, y] of [[12, -44], [17, -36]]) { otxt(c, '♪', x, y, 9, '#ff9ef0'); }
    shape(c, c => { c.arc(0, -37, 9, Math.PI * 1.05, Math.PI * 1.95); }, null, 2.2); shape(c, el(-9, -36, 2.4, 3.2), '#ff3df0', 1); shape(c, el(9, -36, 2.4, 3.2), '#ff3df0', 1);
  },
  disenadora(c) {
    shape(c, rr(10, -34, 12, 16, 1.6), '#fff6ea', 1.4);
    for (let i = 0; i < 3; i++) line(c, [12, -30 + i * 4, 20, -30 + i * 4], '#93c5fd', 0.9);
    shape(c, rr(13, -27, 3, 3, 0.4), '#7be04a', 0.6); shape(c, rr(17, -23, 3, 3, 0.4), '#ff5f6d', 0.6);
    cdev(c, '#f59e0b', SKIN_D, '#111827');
    shape(c, rr(-5, -24, 10, 8, 1.4), '#fde68a', 1); line(c, [-3, -18, 0, -22, 3, -19], OL, 1);
    shape(c, el(-8, -44, 4.6, 3.4), '#111827', 1.2);
  },
  prototipo(c) {
    shape(c, rr(-20, -58, 40, 46, 8), '#9ca3af', 2.4);
    for (const [x1, y1, x2, y2] of [[-20, -44, 20, -36], [-14, -58, -6, -12]]) { c.globalAlpha = 0.85; line(c, [x1, y1, x2, y2], '#d6d3d1', 6); c.globalAlpha = 1; line(c, [x1, y1, x2, y2], 'rgba(120,113,108,.6)', 1); }
    shape(c, rr(-13, -54, 26, 16, 4), '#1f2937', 1.6);
    shape(c, el(-6, -46, 3.4, 3.8), '#7be04a', 1); shape(c, el(6, -46, 3.4, 3.8), '#7be04a', 1); dot(c, -6, -46, 1.2, OL); dot(c, 6, -46, 1.2, OL);
    otxt(c, 'v0.1', 0, -26, 7, '#ff9a3c');
    line(c, [-20, -40, -28, -30], OL, 4); line(c, [20, -40, 28, -30], OL, 4); shape(c, el(-28, -29, 5, 5), '#9ca3af', 1.4); shape(c, el(28, -29, 5, 5), '#9ca3af', 1.4);
    shape(c, rr(-15, -12, 11, 11, 2), '#78716c', 1.6); shape(c, rr(4, -12, 11, 11, 2), '#78716c', 1.6);
    line(c, [0, -58, 2, -66], OL, 1.6); dot(c, 2.4, -68, 2.2, '#ff9a3c');
  },
  freelance(c) {
    line(c, [-20, -24, -12, -24], 'rgba(255,255,255,.8)', 1.6); line(c, [-22, -16, -13, -16], 'rgba(255,255,255,.8)', 1.6);
    cdev(c, '#475569', SKIN_C, '#57534e');
    shape(c, rr(-16, -24, 10, 14, 2), '#92400e', 1.4); line(c, [-13, -24, -13, -27, -9, -27, -9, -24], OL, 1.2);
    shape(c, rr(6, -22, 14, 9, 1.6), '#1f2937', 1.4); shape(c, rr(7.6, -21, 10.6, 6, 1), '#0ea5e9', 0);
    otxt(c, '€/h', 0, -15, 5, '#fde68a');
  },
  sp_sustituir(c) { spBg(c, 'd'); screenHead(c, 0, -26, 26, 20, '◉_◉'); otxt(c, 'TU SITIO', 0, -10, 6.5, '#fff6ea'); line(c, [-14, -40, 14, -12], '#ff4b5c', 2.6); },
  sp_portfolio(c) { spBg(c, 'd'); for (const [x, y, r] of [[-7, -18, -0.25], [6, -30, 0.2]]) { c.save(); c.translate(x, y); c.rotate(r); shape(c, rr(-11, -8, 22, 16, 2), '#fde68a', 1.6); shape(c, rr(-8, -5, 7, 7, 1), '#7be04a', 0.8); line(c, [1, -4, 8, -4], OL, 1); line(c, [1, 0, 7, 0], OL, 1); c.restore(); } },
  sp_gamejam(c) { spBg(c, 'h'); shape(c, poly(-14, -14, 14, -14, 0, -40), '#fbbf24', 2); for (const [x, y] of [[-4, -22], [4, -24], [0, -30]]) dot(c, x, y, 2.4, '#dc2626'); otxt(c, '48h', 0, -8, 8, '#fff6ea'); },
  sp_creditos(c) { spBg(c, 'c'); shape(c, rr(-14, -42, 28, 34, 3), '#111827', 1.8); for (let i = 0; i < 5; i++) line(c, [-8 + (i % 2) * 2, -36 + i * 6, 8 - (i % 2) * 3, -36 + i * 6], '#fff6ea', 1.4); otxt(c, 'FIN', 0, -12, 7, '#ffe06a'); },
  // edificios de IAhorro: servidores con un ojo
  i_tower(c) {
    shape(c, rr(-20, -8, 40, 8, 2), '#0f172a');
    shape(c, rr(-15, -78, 30, 71, 5), '#1e293b');
    for (let i = 0; i < 6; i++) { shape(c, rr(-11, -72 + i * 10, 22, 6, 1.4), '#334155', 1); dot(c, -7, -69 + i * 10, 1.2, i % 2 ? '#22e3ff' : '#7be04a'); }
    shape(c, rr(-15, -78, 30, 71, 5), null, 2.2);
    shape(c, el(0, -86, 10, 8), '#0f172a');
    const g = c.createRadialGradient(0, -86, 1, 0, -86, 7); g.addColorStop(0, '#fff'); g.addColorStop(0.5, '#22e3ff'); g.addColorStop(1, '#0e7490'); c.fillStyle = g; c.beginPath(); c.arc(0, -86, 6, 0, Math.PI * 2); c.fill();
    dot(c, 0, -86, 2.2, '#0f172a');
  },
  i_base(c) {
    shape(c, rr(-58, -10, 116, 11, 3), '#0f172a');
    shape(c, rr(-52, -70, 104, 61, 7), '#1e293b');
    for (let r2 = 0; r2 < 5; r2++) for (let k = 0; k < 4; k++) { shape(c, rr(-46 + k * 24, -64 + r2 * 11, 20, 7, 1.4), '#334155', 1); dot(c, -42 + k * 24, -60.5 + r2 * 11, 1.2, (r2 + k) % 3 ? '#22e3ff' : '#7be04a'); }
    shape(c, rr(-52, -70, 104, 61, 7), null, 2.2);
    shape(c, rr(-16, -36, 32, 26, 3), '#0f172a', 1.8); otxt(c, 'CERRADO', 0, -22, 6, '#ff4b5c');
    shape(c, rr(-36, -104, 72, 28, 6), '#0f172a', 2);
    otxt(c, 'IAhorro', 0, -90, 13, '#7df3ff');
    line(c, [-24, -76, -24, -70], OL, 2.6); line(c, [24, -76, 24, -70], OL, 2.6);
    shape(c, el(0, -116, 12, 10), '#0f172a', 2);
    const g = c.createRadialGradient(0, -116, 1, 0, -116, 9); g.addColorStop(0, '#fff'); g.addColorStop(0.5, '#22e3ff'); g.addColorStop(1, '#0e7490'); c.fillStyle = g; c.beginPath(); c.arc(0, -116, 8, 0, Math.PI * 2); c.fill();
    dot(c, 0, -116, 3, '#0f172a');
    for (const [x, y] of [[-46, -88], [44, -94]]) { c.save(); c.translate(x, y); c.rotate(x < 0 ? -0.2 : 0.2); shape(c, rr(-11, -6, 22, 12, 2), '#fff6ea', 1.2); otxt(c, x < 0 ? '-300' : 'AHORRO', 0, 0.5, 5, '#dc2626'); c.restore(); }
  },
  // edificios de Los Creadores: un garaje-estudio con carteles hechos a mano
  r_tower(c) {
    shape(c, rr(-20, -8, 40, 8, 2), '#57534e');
    shape(c, rr(-14, -66, 28, 59, 4), '#d6a96a');
    for (let i = 0; i < 5; i++) line(c, [-14, -56 + i * 11, 14, -56 + i * 11], '#a16207', 1);
    shape(c, rr(-14, -66, 28, 59, 4), null, 2.2);
    shape(c, rr(-10, -60, 20, 14, 2), '#1f2937', 1.4); otxt(c, '</>', 0, -53, 6, '#7be04a');
    shape(c, poly(-18, -66, 18, -66, 0, -82), '#7c3aed', 2);
    dot(c, 0, -74, 2.4, '#ff9a3c');
  },
  r_base(c) {
    shape(c, rr(-56, -10, 112, 11, 3), '#57534e');
    shape(c, rr(-50, -62, 100, 53, 6), '#d6a96a');
    for (let i = 0; i < 5; i++) line(c, [-50, -52 + i * 10, 50, -52 + i * 10], '#a16207', 1);
    shape(c, rr(-50, -62, 100, 53, 6), null, 2.2);
    shape(c, poly(-58, -60, 58, -60, 0, -92), '#7c3aed', 2.2);
    shape(c, rr(-18, -40, 36, 31, 3), '#78716c', 1.8); for (let i = 0; i < 4; i++) line(c, [-18, -33 + i * 7, 18, -33 + i * 7], '#57534e', 1.2);
    c.save(); c.translate(-34, -40); c.rotate(-0.12); shape(c, rr(-13, -7, 26, 14, 2), '#fff6ea', 1.4); otxt(c, 'HECHO', 0, -2, 5, '#7c3aed'); otxt(c, 'A MANO', 0, 4, 5, '#7c3aed'); c.restore();
    shape(c, rr(26, -48, 16, 12, 1.6), '#1f2937', 1.4); otxt(c, '♥', 34, -42, 7, '#ff5f6d');
    otxt(c, 'INDIE', 0, -70, 10, '#ffe06a');
  },
});
