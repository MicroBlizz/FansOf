// Fans of Rouflage (prototipo) · LOS MUEBLES: mesas, máquinas, cajas… dibujados con código. Cada tipo dice lo que ocupa en el suelo
// (w de ancho y d de fondo: ahí no se puede pisar) y lo que levanta (h). Se dibujan con el origen en el centro de su base y la altura
// hacia arriba (y negativa). Los que tienen `pared` son altos y van pegados a la pared de arriba, así nadie se esconde entero detrás;
// los demás son bajos a propósito: detrás de ellos siempre asoma media alubia.
'use strict';

// un cajón visto desde arriba y de frente: la tapa (de fondo d) y, debajo, el frente (de alto h)
function cajon(c, w, d, h, tapa, frente, r = 3, x = 0, y = 0) {
  forma(c, caja(x - w / 2, y - h - d, w, d + 3, r), tapa);
  forma(c, caja(x - w / 2, y - h, w, h, r), frente);
}
const LUCES = ['#59e07a', '#39d5e8', '#ff4b5c', '#f2c230'];

const TIPOS_MUEBLE = {
  mesa: { w: 64, d: 34, h: 16, pinta(c) {
    forma(c, ovalo(0, -8, 15, 6), '#3d4a70'); forma(c, caja(-5, -32, 10, 25, 2), '#4f5f86');
    forma(c, ovalo(0, -31, 33, 17), '#4f86a8'); forma(c, ovalo(0, -35, 33, 17), '#8fc6e0');
    c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 3; c.beginPath(); c.ellipse(0, -35, 25, 11, 0, Math.PI * 1.05, Math.PI * 1.45); c.stroke();
    forma(c, caja(-21, -43, 19, 11, 2), '#f1e6cc', 2); forma(c, ovalo(11, -34, 5.5, 4.2), '#fff6ea', 2); punto(c, 11, -34.4, 2.8, '#7a4b2a');
  } },
  escritorio: { w: 78, d: 30, h: 22, tope: 62, pinta(c, m) {
    cajon(c, 78, 30, 22, '#d2a676', '#a87a4e');
    forma(c, caja(-33, -17, 26, 12, 2), '#8f6540', 2); forma(c, caja(7, -17, 26, 12, 2), '#8f6540', 2); raya(c, [-24, -11, -16, -11], '#e9c46a', 2.5); raya(c, [16, -11, 24, -11], '#e9c46a', 2.5);
    // el monitor (bajito), el teclado y la taza
    forma(c, caja(-3, -44, 6, 8, 1), '#3d4063', 2); forma(c, caja(-15, -61, 30, 20, 3), '#2a2f55', 2.5);
    const v = m.v || 0;
    c.fillStyle = ['#2e8bff', '#191430', '#2f7a4a'][v]; c.fillRect(-12, -58, 24, 14);
    if (v === 0) { punto(c, -5, -53, 1.6, '#fff'); punto(c, 5, -53, 1.6, '#fff'); c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.beginPath(); c.arc(0, -46, 4, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); }
    else if (v === 1) raya(c, [-10, -55, -4, -52, 1, -54, 9, -47], '#ff4b5c', 2);
    else { c.fillStyle = '#fff6ea'; c.fillRect(-9, -56, 5, 7); c.fillRect(-2, -54, 5, 7); c.fillRect(5, -52, 5, 7); }
    forma(c, caja(-14, -34, 22, 7, 1.5), '#e8e6df', 2); forma(c, ovalo(24, -36, 4.5, 3.6), '#ff7a1a', 2);
    forma(c, caja(-36, -41, 13, 16, 1), '#f4f1e6', 1.8);
  } },
  silla: { w: 22, d: 16, h: 18, pinta(c) {
    forma(c, ovalo(0, -5, 10, 4.5), '#2a2f55', 2.5); forma(c, caja(-2.5, -15, 5, 10, 1), '#3d4063', 2);
    forma(c, caja(-11, -22, 22, 9, 4), '#5a6fc0', 2.5); forma(c, caja(-10, -35, 20, 15, 5), '#6f84d6', 2.5);
  } },
  expendedora: { w: 44, d: 22, h: 54, pared: true, pinta(c, m) {
    const col = ['#e0484f', '#3a7de0', '#8b3dff'][m.v || 0];
    cajon(c, 44, 22, 54, tono(col, 0.3), col, 4);
    forma(c, caja(-17, -48, 22, 30, 2), '#12162b', 2.5);
    for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) { c.fillStyle = LUCES[(i + j * 2 + (m.v || 0)) % 4]; c.fillRect(-15 + i * 6.6, -45 + j * 9.4, 4.6, 6); }
    forma(c, caja(8, -48, 10, 20, 2), tono(col, -0.3), 2); punto(c, 13, -43, 2, '#f2c230'); c.fillStyle = OL; c.fillRect(10.5, -37, 5, 2); c.fillRect(10.5, -33, 5, 2);
    forma(c, caja(-17, -14, 35, 8, 2), '#12162b', 2.5);
    c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillRect(-15, -46, 3, 26);
  } },
  archivador: { w: 36, d: 20, h: 44, pared: true, pinta(c) {
    cajon(c, 36, 20, 44, '#a9b6ae', '#84928b', 3);
    for (let k = 0; k < 3; k++) { forma(c, caja(-14, -41 + k * 13.4, 28, 11, 1.5), '#96a49d', 2); raya(c, [-5, -35.5 + k * 13.4, 5, -35.5 + k * 13.4], OL, 2.5); }
  } },
  estanteria: { w: 90, d: 22, h: 50, pared: true, pinta(c) {
    cajon(c, 90, 22, 50, '#6a7090', '#4a5068', 3);
    for (let k = 0; k < 2; k++) {
      forma(c, caja(-40, -46 + k * 23, 80, 18, 1.5), '#2c3050', 2.5);
      const cosas = [['#dcae68', 15, 13], ['#e0484f', 9, 15], ['#dcae68', 13, 11], ['#3a7de0', 10, 14], ['#7ee04a', 8, 10], ['#dcae68', 12, 13]];
      let x = -37; for (let i = 0; i < 6; i++) { const [col, w, h] = cosas[(i + k * 2) % 6]; forma(c, caja(x, -28 + k * 23 - h, w, h, 1), col, 1.8); x += w + 1.6; if (x > 28) break; }
    }
  } },
  rack: { w: 40, d: 22, h: 54, pared: true, pinta(c, m) {
    cajon(c, 40, 22, 54, '#3a4270', '#232a4c', 3);
    for (let j = 0; j < 5; j++) {
      forma(c, caja(-16, -50 + j * 9.6, 32, 7, 1.5), '#161a30', 1.8);
      for (let i = 0; i < 4; i++) { c.fillStyle = hash2(i, j, 131 + (m.v || 0)) > 0.4 ? LUCES[(i + j + (m.v || 0)) % 3] : '#2f3766'; c.fillRect(-13 + i * 5, -48 + j * 9.6, 3, 3); }
      c.fillStyle = '#4c5887'; c.fillRect(8, -48 + j * 9.6, 6, 3);
    }
    c.strokeStyle = '#4c5887'; c.lineWidth = 2; c.beginPath(); for (let i = 0; i < 4; i++) { c.moveTo(-12 + i * 8, -70); c.lineTo(-12 + i * 8, -60); } c.stroke();
  } },
  planta: { w: 22, d: 14, h: 30, pinta(c) {
    for (const [a, l, col] of [[-1.0, 26, '#3c8f3d'], [1.0, 25, '#3c8f3d'], [-0.45, 30, '#4fae4a'], [0.5, 29, '#4fae4a'], [0, 32, '#6cc95a']]) {
      c.save(); c.translate(0, -15); c.rotate(a); forma(c, ovalo(0, -l / 2, 5.5, l / 2), col, 2.5); raya(c, [0, -3, 0, -l + 5], 'rgba(32,16,44,0.3)', 1.2); c.restore();
    }
    forma(c, poli(-10, -16, 10, -16, 7.5, 0, -7.5, 0), '#c96f3b'); forma(c, caja(-11.5, -19, 23, 6, 2), '#e08a52', 2.5);
  } },
  caja: { w: 44, d: 30, h: 22, pinta(c, m) {
    cajon(c, 44, 30, 22, '#dcae68', '#b98743');
    raya(c, [-22, -11, 22, -11], '#8f6530', 2); raya(c, [-8, -22, -8, 0], '#8f6530', 2); raya(c, [8, -22, 8, 0], '#8f6530', 2);
    c.save(); c.translate(0, -37); c.rotate(-0.16);
    c.strokeStyle = '#c0392b'; c.lineWidth = 2; c.strokeRect(-16, -6.5, 32, 13); rotulo(c, ['MMO', 'DLC', '2.0'][(m.v || 0) % 3], 0, 1, 10, '#c0392b');
    c.restore();
  } },
  bidon: { w: 24, d: 16, h: 22, pinta(c, m) {
    const col = ['#3a6fd0', '#39b8c8', '#f2c230'][(m.v || 0) % 3];
    forma(c, c => { c.moveTo(-12, -30); c.lineTo(-12, -7); c.quadraticCurveTo(0, 2, 12, -7); c.lineTo(12, -30); c.closePath(); }, col);
    c.fillStyle = tono(col, -0.28); c.fillRect(-10.5, -22, 21, 4); c.fillRect(-10.5, -12, 21, 4);
    forma(c, ovalo(0, -30, 12, 7), tono(col, 0.28)); punto(c, 4, -31, 2.2, OL);
  } },
  banco: { w: 70, d: 20, h: 14, pinta(c) {
    forma(c, caja(-31, -8, 6, 8, 1), '#3d4063', 2.5); forma(c, caja(25, -8, 6, 8, 1), '#3d4063', 2.5);
    cajon(c, 70, 20, 8, '#a48cdc', '#6f58a8', 4, 0, -6);
    raya(c, [-12, -31, -12, -17], 'rgba(32,16,44,0.3)', 2); raya(c, [12, -31, 12, -17], 'rgba(32,16,44,0.3)', 2);
  } },
  vitrina: { w: 48, d: 26, h: 24, pinta(c, m) {
    cajon(c, 48, 26, 12, '#7d6a55', '#5e4e3f');
    forma(c, caja(-9, -9, 18, 6, 1), '#e3b55a', 1.8);
    forma(c, caja(-18, -50, 36, 28, 4), 'rgba(170,225,245,0.42)', 2.5);
    const col = ['#ff7a1a', '#2e8bff', '#7ee04a', '#d43cff'][(m.v || 0) % 4];
    forma(c, caja(-9, -44, 18, 19, 2), '#3d4063', 2); c.fillStyle = col; c.fillRect(-6.5, -41, 13, 8); c.fillStyle = '#1b1e36'; c.fillRect(-5, -30, 10, 3);
    c.fillStyle = 'rgba(255,255,255,0.6)'; c.fillRect(-15, -47, 3, 20);
  } },
  lapida: { w: 30, d: 12, h: 24, pinta(c, m) {
    forma(c, c => { c.moveTo(-14, 0); c.lineTo(-14, -24); c.quadraticCurveTo(-14, -36, 0, -36); c.quadraticCurveTo(14, -36, 14, -24); c.lineTo(14, 0); c.closePath(); }, '#8b93a3');
    c.fillStyle = 'rgba(32,16,44,0.18)'; c.fillRect(8, -28, 5, 27);
    const [l1, l2] = EPITAFIOS[(m.v || 0) % EPITAFIOS.length].map(tr);
    rotuloJusto(c, l1, -1, -24, 6.5, 21, '#2f3444'); rotuloJusto(c, l2, -1, -15, 6.5, 21, '#2f3444');
    punto(c, -9, -2, 2.6, '#f3dfe8'); punto(c, -5, -4, 2.6, '#ff9bb0'); punto(c, 9, -2, 2.4, '#f2c230');
  } },
  fotocopiadora: { w: 42, d: 26, h: 20, pinta(c) {
    forma(c, caja(-33, -14, 14, 4, 1), '#f4f1e6', 2);
    cajon(c, 42, 26, 20, '#e9e3d3', '#c9c2b0');
    forma(c, caja(-17, -43, 34, 16, 2), '#8a8fa6', 2); c.fillStyle = '#7ee04a'; c.fillRect(-13, -15, 16, 3); punto(c, 13, -13, 2.4, '#ff4b5c');
  } },
  // la barra de Lola, la del café
  barra: { w: 120, d: 26, h: 22, pared: true, tope: 64, pinta(c) {
    cajon(c, 120, 26, 22, '#d9a76c', '#8a5a34', 4);
    for (let x = -54; x < 54; x += 18) { c.fillStyle = (x / 18) & 1 ? '#ff7a1a' : '#fff6ea'; c.fillRect(x, -19, 18, 16); }
    c.strokeStyle = OL; c.lineWidth = 2.5; c.strokeRect(-54, -19, 108, 16);
    forma(c, caja(-52, -58, 24, 22, 3), '#3d4063'); forma(c, caja(-48, -54, 16, 8, 1.5), '#12162b', 2); punto(c, -33, -42, 2.2, '#ff4b5c'); forma(c, caja(-45, -42, 8, 5, 1), '#fff6ea', 1.8);
    for (let k = 0; k < 3; k++) forma(c, caja(-6 + k * 2, -42 - k * 5, 12, 6, 1.5), '#fff6ea', 2);
    forma(c, c => { c.moveTo(22, -34); c.lineTo(22, -44); c.quadraticCurveTo(36, -60, 50, -44); c.lineTo(50, -34); c.closePath(); }, 'rgba(170,225,245,0.5)', 2.5);
    forma(c, caja(27, -43, 18, 8, 3), '#e08a52', 2); forma(c, caja(19, -36, 34, 5, 2), '#e9e3d3', 2);
  } },
  extintor: { w: 12, d: 8, h: 18, senuelo: true, pinta(c) {
    forma(c, caja(-5.5, -22, 11, 22, 3.5), '#e0484f', 2.5); forma(c, caja(-3, -27, 6, 6, 1.5), '#2a2f55', 2);
    raya(c, [3, -25, 8, -22, 7, -15], OL, 2.5); c.fillStyle = '#fff6ea'; c.fillRect(-3.5, -15, 7, 5);
  } },
  papelera: { w: 16, d: 12, h: 14, senuelo: true, pinta(c) {
    forma(c, poli(-8, -22, 8, -22, 6, 0, -6, 0), '#8a8fa6', 2.5); forma(c, ovalo(0, -22, 8, 3.6), '#5a5f7a', 2.5);
    forma(c, ovalo(-1, -25, 4.5, 3.5), '#f4f1e6', 2); raya(c, [-3, -16, -2, -3], 'rgba(32,16,44,0.35)', 1.5); raya(c, [3, -16, 2, -3], 'rgba(32,16,44,0.35)', 1.5);
  } },
  carretilla: { w: 50, d: 34, h: 20, pinta(c) {
    forma(c, caja(-25, -8, 50, 8, 1), '#8f6530'); c.fillStyle = OL; c.fillRect(-15, -6, 8, 6); c.fillRect(7, -6, 8, 6);
    forma(c, caja(-25, -40, 50, 34, 2), '#b98743');
    cajon(c, 42, 26, 14, '#e9d7b0', '#c9b382', 2, 0, -8);
    raya(c, [0, -50, 0, -8], '#3a7de0', 4); raya(c, [-21, -15, 21, -15], '#3a7de0', 3);
  } },
  // el cartón del Empleado del Mes: una alubia de mentira (más de un becario le ha disparado)
  maniqui: { w: 30, d: 8, h: 46, pared: true, senuelo: true, pinta(c) {
    forma(c, poli(-12, 0, 12, 0, 6, -10, -6, -10), '#a8905f', 2.5);
    c.save(); c.translate(0, -3); c.scale(0.92, 0.92);
    c.beginPath(); trazaAlubia(c); c.fillStyle = '#dcc79c'; c.fill(); c.lineWidth = 3.2; c.strokeStyle = OL; c.stroke();
    forma(c, caja(-10, -39, 22, 13, 6), '#b9a077', 2.5); punto(c, -3, -33, 2, OL); punto(c, 6, -33, 2, OL);
    c.strokeStyle = OL; c.lineWidth = 2; c.beginPath(); c.arc(1.5, -21, 6, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke();
    forma(c, c => starPath(c, -9, -12, 6, 2.8), '#ffcb3d', 2);
    c.restore();
  } },
  servidor: { w: 44, d: 26, h: 22, pinta(c, m) {
    cajon(c, 44, 26, 22, '#3a4270', '#232a4c');
    for (let j = 0; j < 2; j++) { forma(c, caja(-18, -19 + j * 9, 36, 7, 1.5), '#161a30', 1.8); for (let i = 0; i < 5; i++) { c.fillStyle = hash2(i, j, 141 + (m.v || 0)) > 0.35 ? LUCES[(i + j + (m.v || 0)) % 3] : '#2f3766'; c.fillRect(-15 + i * 5, -17 + j * 9, 3, 3); } }
    c.strokeStyle = '#4c5887'; c.lineWidth = 2; c.beginPath(); for (let i = 0; i < 5; i++) { c.moveTo(-14 + i * 7, -43); c.lineTo(-14 + i * 7, -29); } c.stroke();
  } },
  // la mesa del jefe de Recursos Humanos, con el sello
  mesajefe: { w: 100, d: 34, h: 22, pinta(c) {
    cajon(c, 100, 34, 22, '#7a4f33', '#5a3a26', 4);
    forma(c, caja(-22, -16, 44, 11, 2), '#e3b55a', 2); rotulo(c, 'RR. HH.', 0, -9.5, 8, OL);
    forma(c, caja(-42, -50, 20, 24, 1), '#f4f1e6', 2); forma(c, caja(-36, -46, 20, 24, 1), '#f4f1e6', 2);
    c.strokeStyle = 'rgba(32,16,44,0.35)'; c.lineWidth = 1.2; c.beginPath(); for (let k = 0; k < 4; k++) { c.moveTo(-32, -41 + k * 4.4); c.lineTo(-20, -41 + k * 4.4); } c.stroke();
    forma(c, caja(16, -39, 22, 10, 2), '#c0392b', 2.5); forma(c, caja(23, -48, 8, 10, 2), '#3d2a1c', 2);
    forma(c, ovalo(-2, -37, 5, 4), '#fff6ea', 2); punto(c, -2, -37.4, 2.6, '#7a4b2a');
  } },
  cono: { w: 14, d: 10, h: 16, senuelo: true, pinta(c) {
    forma(c, caja(-9, -5, 18, 5, 1.5), '#e8731a', 2.5); forma(c, poli(-6, -5, 6, -5, 1.6, -26, -1.6, -26), '#ff8a2e', 2.5);
    c.fillStyle = '#fff6ea'; c.beginPath(); c.moveTo(-4.4, -12); c.lineTo(4.4, -12); c.lineTo(3.3, -17); c.lineTo(-3.3, -17); c.closePath(); c.fill();
  } },
  fuente: { w: 20, d: 16, h: 30, pared: true, tope: 64, pinta(c) {
    cajon(c, 20, 16, 30, '#e9e6f2', '#c9c5da', 3);
    forma(c, caja(-6, -22, 12, 8, 1.5), '#12162b', 2); punto(c, -3, -9, 1.8, '#2e8bff'); punto(c, 3, -9, 1.8, '#ff4b5c');
    forma(c, caja(-7.5, -62, 15, 20, 5), 'rgba(90,170,255,0.75)', 2.5); c.fillStyle = 'rgba(255,255,255,0.6)'; c.fillRect(-4.5, -58, 2.5, 12);
  } },
};
function starPath(c, x, y, r1, r2, n = 5) { c.moveTo(x, y - r1); for (let i = 1; i < n * 2; i++) { const a = -Math.PI / 2 + (i * Math.PI) / n, r = i % 2 ? r2 : r1; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } c.closePath(); }

// cada mueble recibe sus medidas y su caja de dibujo (en el mundo): lo que tapa y la zona donde no se pisa
for (const m of MUEBLES) {
  const T = TIPOS_MUEBLE[m.t]; if (!T) throw new Error('Mueble desconocido: ' + m.t);
  m.T = T; m.clave = m.t + ':' + (m.v || 0);
  m.pisa = { x0: m.x - T.w / 2, y0: m.y - T.d, x1: m.x + T.w / 2, y1: m.y };            // donde no se puede andar
  m.ox = T.w / 2 + 14; m.oy = (T.tope || T.d + T.h) + 6;                                  // del origen a la esquina de su dibujo
  m.dib = { x0: m.x - m.ox, y0: m.y - m.oy, w: m.ox * 2, h: m.oy + 8 };                   // la caja de su dibujo
}
// la sombra que un mueble deja en el suelo (se pinta con el suelo, no con el mueble)
function sombraMueble(c, m) { c.fillStyle = 'rgba(24,12,40,0.24)'; c.beginPath(); rrPath(c, m.pisa.x0 - 3, m.pisa.y0 + 4, m.T.w + 6, m.T.d + 1, 7); c.fill(); }
function pintaMueble(c, m) { c.save(); c.translate(m.x, m.y); m.T.pinta(c, m); c.restore(); }
