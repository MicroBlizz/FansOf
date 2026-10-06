// Fans Of · Arte: los dibujos de Microblizz (cada uno se dibuja en el suelo, con el origen bajo los pies y la altura en y negativa)
'use strict';
Object.assign(ART, {
  // v0.9.15: retratos del CEO de Microblizz y del Presidente de Phony (Modo Jefe)
  ceo(c) {
    shape(c, rr(-9, -19, 7.5, 18, 2.4), '#2b2d3a', 1.6); shape(c, rr(1.5, -19, 7.5, 18, 2.4), '#2b2d3a', 1.6);
    shape(c, el(-5.6, -1.4, 6, 2.6), '#111827', 1.4); shape(c, el(5.6, -1.4, 6, 2.6), '#111827', 1.4);
    shape(c, el(0, -30, 15.5, 15), '#5b6170', 2);
    shape(c, poly(-6, -44, 6, -44, 0, -31), '#fff6ea', 1.4);
    shape(c, poly(-1.8, -42, 1.8, -42, 3, -29, 0, -24, -3, -29), '#e63946', 1.3);
    shape(c, rr(-19, -38, 6.5, 15, 3), '#5b6170', 1.6); shape(c, el(-15.8, -22, 3.4, 3.4), '#f2c7a5', 1.3);
    shape(c, rr(11, -36, 6.5, 13, 3), '#5b6170', 1.6);
    shape(c, rr(9, -24, 17, 13, 2.6), '#7a4d1c', 1.8); line(c, [14, -24, 14, -27, 21, -27, 21, -24], OL, 1.5); otxt(c, '$', 17.5, -17.4, 9, '#9ef07a');
    shape(c, el(0, -52, 10.5, 10.5), '#f2c7a5', 2);
    shape(c, c2 => { c2.moveTo(-10.5, -53); c2.quadraticCurveTo(-9, -65, 2, -63.5); c2.quadraticCurveTo(11, -62, 10.5, -53); c2.quadraticCurveTo(5, -58, -10.5, -53); c2.closePath(); }, '#3b2a1a', 1.6);
    shape(c, rr(-8.6, -55.5, 7.4, 4.6, 1.6), '#111827', 1.1); shape(c, rr(1.2, -55.5, 7.4, 4.6, 1.6), '#111827', 1.1); line(c, [-1.2, -53.6, 1.2, -53.6], '#111827', 1.3);
    line(c, [-4.4, -46.6, 0, -44.6, 4.4, -46.6], OL, 1.5);
  },
  sp_despido(c) { spBg(c, 'd'); for (const [x, y, rot] of [[-6, -16, -0.3], [6, -28, 0.25]]) { c.save(); c.translate(x, y); c.rotate(rot); shape(c, rr(-11, -7, 22, 14, 1.6), '#fff6ea', 1.8); line(c, [-11, -7, 0, 1, 11, -7], OL, 1.4); shape(c, el(0, 1, 3, 3), '#e63946', 1); c.restore(); } otxt(c, 'FUERA', 0, -40, 7.4, '#fff6ea'); },
  becario(c) {
    shape(c, el(-11.5, -11, 2.7, 2.7), '#aab4c4', 1.4);
    shape(c, rr(-10.5, -25, 21, 22, 4), '#aab4c4');
    shape(c, rr(-8.5, -24, 17, 3.2, 1.4), '#d7dee9', 0);
    shape(c, rr(-7.6, -21, 15.2, 9.4, 2.6), '#1b4fc4', 1.6);
    line(c, [-5.2, -16.8, -2, -16.8], '#e8f1ff', 1.5); line(c, [2, -16.8, 5.2, -16.8], '#e8f1ff', 1.5);
    c.beginPath(); c.arc(-3.6, -15.6, 1.6, 0.2, Math.PI - 0.2); c.moveTo(5.2, -15.1); c.arc(3.6, -15.6, 1.6, 0.2, Math.PI - 0.2); c.strokeStyle = 'rgba(232,241,255,.6)'; c.lineWidth = 0.9; c.stroke();
    line(c, [-1.4, -13.4, 1.4, -13.4], '#e8f1ff', 1);
    shape(c, c => { c.moveTo(9.3, -23.5); c.quadraticCurveTo(11.8, -20, 9.3, -19); c.quadraticCurveTo(7, -20, 9.3, -23.5); c.closePath(); }, '#8fd3ff', 1);
    line(c, [0, -25, 0, -31], OL, 1.6); shape(c, el(0, -32.2, 2.3, 2.3), '#ff4b5c', 1.4);
    c.beginPath(); c.moveTo(-5.5, -12); c.lineTo(0, -7.6); c.lineTo(5.5, -12); c.strokeStyle = '#ff4b5c'; c.lineWidth = 1.3; c.stroke();
    shape(c, rr(-3.4, -8.2, 6.8, 5.4, 1), '#fff', 1.1);
    c.fillStyle = '#2e8bff'; c.fillRect(-2.8, -7.6, 5.6, 1.5);
    shape(c, el(11.6, -10.5, 2.7, 2.7), '#aab4c4', 1.4);
    shape(c, rr(10.5, -17.5, 6.4, 7, 1.3), '#fff', 1.4);
    c.beginPath(); c.arc(17.2, -14, 1.9, -1.3, 1.3); c.strokeStyle = OL; c.lineWidth = 1.3; c.stroke();
    c.beginPath(); c.moveTo(12.6, -19.5); c.quadraticCurveTo(11.2, -21.5, 12.8, -23.2); c.moveTo(15, -19.5); c.quadraticCurveTo(13.6, -21.5, 15.2, -23.2); c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 1; c.stroke();
  },
  starbot(c) {
    shape(c, rr(-5, -10, 10, 4.5, 1.6), '#2a3858', 1.4);
    shape(c, el(0, -17.5, 10, 9.5), '#34466e');
    shape(c, c => starPath(c, 0, -16, 3.6, 1.6), '#c8b65a', 1);
    shape(c, el(-11, -23.5, 6.6, 4.7, -0.25), '#4d6496');
    shape(c, el(11, -23.5, 6.6, 4.7, 0.25), '#4d6496');
    c.strokeStyle = 'rgba(235,240,250,.8)'; c.lineWidth = 0.6; c.beginPath();
    for (let i = 0; i < 5; i++) { const a = -0.1 + i * 0.32; c.moveTo(-17, -27); c.lineTo(-17 + Math.cos(a) * 9, -27 + Math.sin(a) * 9); }
    for (const rad of [4, 7]) { for (let i = 0; i < 5; i++) { const a = -0.1 + i * 0.32; const px = -17 + Math.cos(a) * rad, py = -27 + Math.sin(a) * rad; i ? c.lineTo(px, py) : c.moveTo(px, py); } }
    c.stroke();
    shape(c, rr(11, -20, 10.5, 6.2, 2), '#2a3858', 1.6);
    shape(c, el(21.3, -16.9, 1.7, 3), '#33e0ff', 1.1);
    shape(c, el(0, -31, 8.6, 8.2), '#4d6496');
    shape(c, el(0, -31, 6.6, 3.5), '#33e0ff', 1.4);
    c.beginPath(); c.ellipse(-2.4, -32.2, 2, 0.9, -0.2, 0, Math.PI * 2); c.fillStyle = 'rgba(255,255,255,.85)'; c.fill();
    line(c, [4, -38.5, 6.5, -43], OL, 1.4); dot(c, 6.6, -43.6, 1.8, '#ffcb3d');
  },
  fallen(c) {
    shape(c, c => { c.moveTo(1, -50); c.bezierCurveTo(-9, -59, -23, -52, -21, -34); c.bezierCurveTo(-18, -41, -11, -46, -3, -45); c.closePath(); }, '#c94a4a');
    shape(c, poly(15.5, -19, 15.5, -34, 17, -36.5, 18, -33.5, 19.5, -36, 19.5, -19), '#d6dceb', 1.4);
    shape(c, rr(12.5, -20, 10, 3.2, 1.2), '#6b4a2e', 1.4);
    shape(c, el(0, -17, 15, 14.5), '#8d9cc0');
    shape(c, el(-6, -21, 5, 4, -0.3), 'rgba(255,255,255,.25)', 0);
    shape(c, rr(-13, -11, 26, 4.2, 1.6), '#5b6787', 1.4);
    shape(c, el(0, -39, 12.5, 12), '#aeb9d6');
    line(c, [0, -51, 0, -43], OL, 1.4);
    shape(c, rr(-8.2, -41.4, 16.4, 4, 1.6), '#2a1020', 1.4);
    c.fillStyle = '#ff3b3b'; c.fillRect(-6.6, -40.4, 13.2, 2);
    line(c, [4, -30, 5.5, -27.2], OL, 1); line(c, [13, -30, 11.5, -27.2], OL, 1);
    shape(c, rr(2.5, -27.2, 13, 8, 1.2), '#ffcb3d', 0);
    c.save(); c.beginPath(); rrPath(c, 2.5, -27.2, 13, 8, 1.2); c.clip(); c.strokeStyle = OL; c.lineWidth = 1.6;
    for (let i = -2; i < 6; i++) { c.beginPath(); c.moveTo(2.5 + i * 4, -19); c.lineTo(2.5 + i * 4 + 8, -27.5); c.stroke(); }
    c.restore();
    shape(c, rr(2.5, -27.2, 13, 8, 1.2), null, 1.4);
    shape(c, c => { c.moveTo(-19, -29); c.lineTo(-2, -29); c.lineTo(-2, -14.5); c.quadraticCurveTo(-4, -4, -10.5, -1); c.quadraticCurveTo(-17, -4, -19, -14.5); c.closePath(); }, '#c9cfe0');
    shape(c, c => starPath(c, -10.5, -17, 5, 2.2), 'rgba(120,130,160,.55)', 0);
    c.beginPath(); c.moveTo(-6, -29); c.lineTo(-8.5, -23); c.lineTo(-5.5, -19); c.lineTo(-9, -12); c.lineTo(-7, -7); c.strokeStyle = '#3e4459'; c.lineWidth = 1.2; c.stroke();
  },
  e_tower(c) {
    shape(c, c => { c.moveTo(-23, -7); c.lineTo(23, -7); c.lineTo(23, -1); c.quadraticCurveTo(0, 6, -23, -1); c.closePath(); }, '#4b556b');
    shape(c, rr(-18, -66, 36, 62, 3), '#26314d');
    shape(c, poly(-18, -66, -12, -72, 23, -72, 18, -66), '#3c4b72', 1.6);
    shape(c, poly(18, -66, 23, -72, 23, -9, 18, -4), '#1c2440', 1.6);
    const leds = ['#33e0ff', '#7be04a', '#2e8bff'];
    for (let i = 0; i < 6; i++) {
      const y = -61 + i * 9.4;
      shape(c, rr(-14, y, 28, 6.4, 1.2), '#18203a', 1);
      for (let j = 0; j < 3; j++) { c.fillStyle = leds[(i + j) % 3]; c.fillRect(-11.5 + j * 4, y + 2.2, 2.4, 2); }
      c.strokeStyle = 'rgba(160,180,220,.35)'; c.lineWidth = 0.8; c.beginPath(); for (let v = 3; v < 11; v += 2) { c.moveTo(v, y + 1.5); c.lineTo(v, y + 5); } c.stroke();
    }
    shape(c, rr(-8, -15, 16, 6.5, 1.5), '#2e8bff', 1.2);
    line(c, [-4, -11.7, 4, -11.7], '#fff', 1); line(c, [0, -14, 0, -9.4], '#fff', 1);
    line(c, [4, -72, 4, -80], OL, 1.8);
    shape(c, el(4, -84, 9.5, 4.5, -0.4), '#c3cbe0', 1.6);
    shape(c, el(4, -84, 2, 1.2, -0.4), '#7d889e', 0);
    shape(c, el(-8, -75.5, 3.6, 3.6), '#33e0ff', 1.4);
  },
  e_base(c) {
    const g = c.createLinearGradient(0, -80, 0, 0); g.addColorStop(0, '#3a7de0'); g.addColorStop(1, '#1d3f8a');
    shape(c, rr(-52, -80, 104, 80, 4), g);
    shape(c, poly(52, -80, 60, -88, 60, -8, 52, 0), '#16306b', 1.8);
    shape(c, poly(-52, -80, -44, -88, 60, -88, 52, -80), '#5b8fe6', 1.8);
    c.strokeStyle = 'rgba(190,220,255,.35)'; c.lineWidth = 1; c.beginPath();
    for (let x = -39; x <= 40; x += 13) { c.moveTo(x, -77); c.lineTo(x, -38); }
    for (let y = -70; y <= -40; y += 10) { c.moveTo(-50, y); c.lineTo(50, y); }
    c.stroke();
    c.fillStyle = 'rgba(255,240,170,.5)'; for (const [wx, wy] of [[-33, -66], [-7, -56], [19, -66], [32, -46], [-20, -46]]) c.fillRect(wx, wy, 11, 8);
    shape(c, rr(-13, -21, 26, 21, 2), '#0e1a3a', 1.6);
    line(c, [0, -21, 0, 0], '#3a7de0', 1.2);
    shape(c, rr(-43, -36, 86, 13, 3), '#0f1d44', 1.6);
    c.fillStyle = '#e8f1ff'; c.font = '10px ' + FONT_D; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('MICROBLIZZ', 0, -29);
    shape(c, rr(-34, -104, 68, 22, 8), '#7d889e');
    shape(c, rr(-7, -100, 14, 10, 2), '#5a6378', 1.2);
    shape(c, rr(-24, -136, 48, 34, 9), '#9aa5ba');
    line(c, [-14, -136, -18, -146], OL, 1.8); dot(c, -18.5, -147, 2.4, '#ff3348');
    line(c, [14, -136, 17, -143], OL, 1.8); dot(c, 17.2, -144, 2, '#c3cbe0');
    shape(c, rr(-14, -111, 28, 7, 2), '#5a6378', 1.4);
    c.strokeStyle = OL; c.lineWidth = 0.9; c.beginPath(); for (let x = -9; x <= 9; x += 4.5) { c.moveTo(x, -110); c.lineTo(x, -105); } c.stroke();
    shape(c, el(-9, -121, 7.5, 7.5), '#2a0d14', 1.6); shape(c, el(-9, -121, 4.5, 4.5), '#ff3348', 0); dot(c, -10.5, -122.5, 1.3, '#ffd0d4');
    shape(c, rr(3, -127, 15, 12, 2), '#f1e3c6', 1.4);
    line(c, [6, -124, 15, -118], '#b89a6e', 1.2); line(c, [15, -124, 6, -118], '#b89a6e', 1.2);
    c.save(); c.translate(0, -93); c.rotate(-0.12);
    c.strokeStyle = '#ff3348'; c.lineWidth = 1.4; c.strokeRect(-21, -5, 42, 10);
    c.fillStyle = '#ff3348'; c.font = '7.5px ' + FONT_D; c.fillText(tr('CANCELADO'), 0, 0.8);
    c.restore();
  },
  e_rubble(c) {
    shape(c, el(0, -3, 23, 8), '#4b556b');
    shape(c, poly(-16, -3, -16, -22, -8, -26, -2, -18, 4, -24, 10, -16, 16, -20, 16, -3), '#26314d');
    shape(c, rr(4, -10, 19, 8, 2), '#3c4b72', 1.6);
    shape(c, el(-18, -4, 8, 3.5, 0.3), '#c3cbe0', 1.4);
    c.fillStyle = '#33e0ff'; c.fillRect(-10, -15, 2.4, 2); c.fillStyle = '#7be04a'; c.fillRect(-5, -12, 2.4, 2);
  },
  /* ---------- bots nuevos de Microblizz ---------- */
  cajabotin(c) {
    shape(c, el(-17.5, -5, 2.6, 2.6), '#ffcb3d', 1.1); shape(c, el(18, -4, 2.6, 2.6), '#ffcb3d', 1.1);
    shape(c, rr(-15, -21, 30, 18, 3), '#2e5bb8');
    c.strokeStyle = '#1d3f8a'; c.lineWidth = 1; c.beginPath(); for (const xx of [-8, 8]) { c.moveTo(xx, -20); c.lineTo(xx, -4); } c.stroke();
    line(c, [-15, -12, 15, -12], '#ffcb3d', 2);
    shape(c, rr(-3.6, -16, 7.2, 8, 1.5), '#ffcb3d', 1.3); txt(c, '?', 0, -11.6, 6.4, '#1d3f8a');
    shape(c, c => { c.moveTo(-14, -21); c.lineTo(14, -21); c.lineTo(13, -26); c.lineTo(-13, -26); c.closePath(); }, '#2a0d14', 0);
    for (let i = -12.5; i < 12; i += 5) { shape(c, poly(i, -21.4, i + 2.5, -24.6, i + 5, -21.4), '#fff', 1); shape(c, poly(i, -26, i + 2.5, -22.8, i + 5, -26), '#fff', 1); }
    shape(c, c => { c.moveTo(-16, -26); c.quadraticCurveTo(-15, -40, 0, -40.5); c.quadraticCurveTo(15, -40, 16, -26); c.closePath(); }, '#3a7de0');
    line(c, [-16, -26.5, 16, -26.5], '#ffcb3d', 2.4);
    shape(c, el(-5.2, -33, 3.2, 3.4), '#fff', 1.2); shape(c, el(5.2, -33, 3.2, 3.4), '#fff', 1.2);
    dot(c, -4.4, -32.6, 1.6, '#ff3348'); dot(c, 6, -32.6, 1.6, '#ff3348');
    line(c, [-8.6, -37.4, -2.6, -35.6], OL, 1.4); line(c, [8.6, -37.4, 2.6, -35.6], OL, 1.4);
  },
  soportebot(c) {
    shape(c, c => { rrPath(c, 10, -46, 17, 10, 3); }, '#fff', 1.4); shape(c, poly(13, -36.5, 12, -33, 16.5, -36.5), '#fff', 1.2);
    txt(c, '¿OFF/ON?', 18.5, -40.8, 3.6, '#1d3f8a');
    line(c, [9, -19, 15, -15], OL, 2.8); line(c, [9, -19, 15, -15], '#aab4c4', 1.4);
    shape(c, c => { c.moveTo(14, -18); c.lineTo(18, -17); c.lineTo(17, -15); c.lineTo(19, -13); c.lineTo(17, -11.4); c.lineTo(15, -14); c.closePath(); }, '#d1d5db', 1.1);
    line(c, [-9, -19, -14, -14], OL, 2.8); line(c, [-9, -19, -14, -14], '#aab4c4', 1.4); shape(c, el(-14.6, -13.4, 2.2, 2.2), '#7be04a', 1.1);
    shape(c, el(0, -18, 11, 10.5), '#4d6496');
    shape(c, el(0, -17.5, 6.2, 6.2), '#33e0ff', 1.3);
    c.beginPath(); c.arc(0, -17, 3.2, -Math.PI / 2 + 0.7, -Math.PI / 2 - 0.7 + Math.PI * 2); c.strokeStyle = '#1d3f8a'; c.lineWidth = 1.5; c.stroke(); line(c, [0, -21.4, 0, -17.6], '#1d3f8a', 1.5);
    shape(c, el(0, -33, 8.6, 7.6), '#aab4c4');
    shape(c, rr(-6.4, -36, 12.8, 6.4, 2), '#1b4fc4', 1.3);
    line(c, [-4.4, -33.4, -1.6, -33.4], '#e8f1ff', 1.3); line(c, [1.6, -33.4, 4.4, -33.4], '#e8f1ff', 1.3);
    c.beginPath(); c.arc(0, -34, 9.6, Math.PI * 1.1, Math.PI * 1.9); c.strokeStyle = OL; c.lineWidth = 3.2; c.stroke(); c.strokeStyle = '#1f2937'; c.lineWidth = 1.8; c.stroke();
    shape(c, rr(-11.4, -37, 4, 6.4, 1.6), '#1f2937', 1.2); shape(c, rr(7.4, -37, 4, 6.4, 1.6), '#1f2937', 1.2);
    c.beginPath(); c.moveTo(9.4, -31); c.quadraticCurveTo(8, -27, 3.4, -28); c.strokeStyle = OL; c.lineWidth = 1.4; c.stroke(); dot(c, 3, -28, 1.2, '#ff3348');
  },
  parchebot(c) {
    shape(c, el(-20, -24, 5.8, 10.5, 0.2), '#5b6578'); shape(c, el(20, -24, 5.8, 10.5, -0.2), '#5b6578');
    shape(c, el(-21.5, -13.6, 4.6, 4.2), '#7d889e', 1.5); shape(c, el(21.5, -13.6, 4.6, 4.2), '#7d889e', 1.5);
    shape(c, rr(-17, -41, 34, 37, 7), '#7d889e');
    shape(c, rr(-11, -34, 22, 13, 3), '#1b4fc4', 1.4); txt(c, '80 GB', 0, -27.4, 6.4, '#e8f1ff');
    c.fillStyle = 'rgba(232,241,255,.35)'; c.fillRect(-9, -22.6, 18 * 0.62, 1.6);
    for (const [bx, by, br] of [[-9, -12, -0.5], [10, -37, 0.6], [9, -9, 0.3]]) {
      c.save(); c.translate(bx, by); c.rotate(br); shape(c, rr(-7, -2.4, 14, 4.8, 2.4), '#f2c9a0', 1.2); shape(c, rr(-2.4, -2.4, 4.8, 4.8, 0.8), '#e3b088', 0); dot(c, -1, -0.8, 0.5, '#c99766'); dot(c, 1, 0.8, 0.5, '#c99766'); c.restore();
    }
    shape(c, rr(-10, -55, 20, 15, 4), '#9aa5ba');
    shape(c, rr(-7, -51, 14, 6, 2), '#2a0d14', 1.2);
    for (let i = 0; i < 3; i++) dot(c, -3.6 + i * 3.6, -48, 1.2, '#ff3348');
    line(c, [4, -55, 6, -62], OL, 1.6); shape(c, el(6.2, -63, 2.4, 2.4), '#ffcb3d', 1.1);
  },
  x_rubble(c) {
    shape(c, el(0, -3, 23, 8), '#6b7280');
    shape(c, poly(-17, -3, -15, -15, -9, -12, -4, -20, 2, -13, 8, -18, 13, -11, 17, -14, 17, -3), '#9ca3af');
    shape(c, rr(-25, -8, 12, 7, 1.5), '#d1d5db', 1.5); shape(c, rr(11, -7, 14, 6, 1.5), '#d1d5db', 1.5);
    dot(c, -4, -6, 1.6, '#ff3df0'); dot(c, 5, -8, 1.6, '#22e3ff'); dot(c, 0, -3, 1.6, '#ffcb3d');
  },
});
