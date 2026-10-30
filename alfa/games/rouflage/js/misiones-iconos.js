// Fans of Rouflage · LOS DIBUJOS DE LAS MISIONES Y LOGROS: cada uno es una insignia (medalla redonda para las misiones, con borde de sello
// para los logros) del color de su dificultad o de su metal (bronce, plata, oro), con brillo, y encima el dibujo de lo que pide, con el
// contorno grueso y los colores del juego. pintaInsignia(c, w, ico, tono, estado): estado 'lista' (brilla), 'cobrada' o 'bloqueada' (gris).
'use strict';
const TONOS_MIS = {
  facil: ['#9df07a', '#3fae2a'], media: ['#ffd37a', '#f08a1a'], dificil: ['#e29bff', '#8a3ad8'],
  bronce: ['#f3b67a', '#a8602a'], plata: ['#f1f4fa', '#9aa6bc'], oro: ['#ffe58a', '#e0a11f'],
  fija: ['#fff09a', '#f0a81a'], semana: ['#9ff0ff', '#2a9ab8'], secreto: ['#7d8aa8', '#2f3750'],
};
function pintaInsignia(c, w, ico, tono, estado) {
  const [claro, oscuro] = TONOS_MIS[tono] || TONOS_MIS.media, R = 29, logro = ['bronce', 'plata', 'oro', 'secreto'].includes(tono);
  c.save(); c.scale(w / 64, w / 64); c.lineJoin = 'round'; c.lineCap = 'round';
  if (estado === 'lista') {      // un halo detrás, para que se vea que se puede cobrar
    const g = c.createRadialGradient(32, 32, 20, 32, 32, 34); g.addColorStop(0, 'rgba(255,240,150,.9)'); g.addColorStop(1, 'rgba(255,240,150,0)');
    c.fillStyle = g; c.beginPath(); c.arc(32, 32, 34, 0, TAU); c.fill();
  }
  // la medalla: sello dentado (logros) o redonda (misiones), con su degradado, un aro claro dentro y el brillo de arriba
  const borde = () => { c.beginPath(); if (logro) for (let k = 0; k <= 32; k++) { const a = k / 32 * TAU, r = k % 2 ? R - 2.6 : R + 1; c.lineTo(32 + Math.cos(a) * r, 33 + Math.sin(a) * r); } else c.arc(32, 33, R, 0, TAU); c.closePath(); };
  borde(); c.fillStyle = OL; c.fill();
  c.save(); c.translate(0, -1.5); borde(); const gr = c.createLinearGradient(0, 4, 0, 62); gr.addColorStop(0, claro); gr.addColorStop(1, oscuro); c.fillStyle = gr; c.fill(); c.lineWidth = 3.4; c.strokeStyle = OL; c.stroke(); c.restore();
  c.beginPath(); c.arc(32, 31.5, R - 6.5, 0, TAU); c.fillStyle = 'rgba(255,255,255,.18)'; c.fill(); c.lineWidth = 1.6; c.strokeStyle = 'rgba(255,255,255,.55)'; c.stroke();
  c.save(); c.beginPath(); c.arc(32, 31.5, R - 2, 0, TAU); c.clip(); c.beginPath(); c.ellipse(26, 14, 22, 9, -0.25, 0, TAU); c.fillStyle = 'rgba(255,255,255,.28)'; c.fill(); c.restore();
  // el dibujo, con su sombra
  c.save(); c.translate(32, 32.5); c.globalAlpha = 0.35; c.translate(1.5, 2.5); DIBUJOS_MIS[ico] && DIBUJOS_MIS[ico](c, true); c.restore();
  c.save(); c.translate(32, 32.5); DIBUJOS_MIS[ico] && DIBUJOS_MIS[ico](c, false); c.restore();
  if (estado === 'lista') for (const [x, y, r] of [[10, 12, 3.4], [54, 18, 2.6], [50, 52, 2.2]]) chispa(c, x, y, r);
  if (estado === 'bloqueada' || estado === 'cobrada') {      // en gris (bloqueada: con candado)
    c.globalCompositeOperation = 'saturation'; borde(); c.fillStyle = '#888'; c.fill(); c.globalCompositeOperation = 'source-over';
    if (estado === 'bloqueada') { c.fillStyle = 'rgba(20,10,40,.25)'; borde(); c.fill(); candado(c, 48, 50); }
  }
  c.restore();
}
const chispa = (c, x, y, r) => { c.beginPath(); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, rr2 = k % 2 ? r * 0.32 : r; c.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); } c.closePath(); c.fillStyle = '#fff'; c.fill(); };
function candado(c, x, y) {
  c.lineWidth = 3; c.strokeStyle = OL; c.beginPath(); c.arc(x, y - 6, 4.6, Math.PI, 0); c.stroke(); c.lineWidth = 1.6; c.strokeStyle = '#c9cfdc'; c.stroke();
  c.beginPath(); c.roundRect(x - 7, y - 6, 14, 11, 2.5); c.fillStyle = '#ffcb3d'; c.fill(); c.lineWidth = 2.6; c.strokeStyle = OL; c.stroke(); c.fillStyle = OL; c.fillRect(x - 1, y - 3, 2, 4);
}

// los dibujos, centrados en 0,0 y de unos 34 de lado. `sombra`: solo la silueta en oscuro (para la sombra de detrás)
const DIBUJOS_MIS = (() => {
  let S = false;
  const f = (c, col, lw = 2.6) => { c.fillStyle = S ? OL : col; c.fill(); if (!S) { c.lineWidth = lw; c.strokeStyle = OL; c.stroke(); } };
  const st = (c, col, lw) => { c.lineWidth = lw; c.strokeStyle = S ? OL : col; c.stroke(); };
  const brillo = (c, pts) => { if (S) return; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.lineWidth = 2; c.strokeStyle = 'rgba(255,255,255,.75)'; c.stroke(); };
  const rr = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect(x, y, w, h, r); };
  const circ = (c, x, y, r) => { c.beginPath(); c.arc(x, y, r, 0, TAU); };
  const galleta = (c, col) => {      // la galleta del juego, de frente, saludando
    c.beginPath(); c.arc(0, -9, 8.5, 0, TAU); c.moveTo(-6, -2); c.lineTo(6, -2); c.lineTo(8, 13); c.lineTo(-8, 13); c.closePath(); f(c, col);
    c.beginPath(); c.moveTo(-6, 0); c.lineTo(-13, 6); st(c, OL, 6.5); c.beginPath(); c.moveTo(-6, 0); c.lineTo(-13, 6); st(c, col, 3.6);
    c.beginPath(); c.moveTo(6, 0); c.lineTo(13, -8); st(c, OL, 6.5); c.beginPath(); c.moveTo(6, 0); c.lineTo(13, -8); st(c, col, 3.6);
    if (!S) { c.fillStyle = OL; circ(c, -3, -10, 1.4); c.fill(); circ(c, 3, -10, 1.4); c.fill(); c.beginPath(); c.arc(0, -7.5, 2.6, 0.2, Math.PI - 0.2); c.lineWidth = 1.4; c.strokeStyle = OL; c.stroke(); c.fillStyle = 'rgba(255,110,150,.6)'; circ(c, -5.5, -7, 1.6); c.fill(); circ(c, 5.5, -7, 1.6); c.fill(); }
  };
  const D = {
    partida(c) { galleta(c, '#f4e3c8'); if (!S) { c.save(); c.translate(10, 9); c.beginPath(); c.arc(0, 0, 6.5, 0, TAU); c.fillStyle = '#ff7a1a'; c.fill(); c.lineWidth = 2.2; c.strokeStyle = OL; c.stroke(); c.beginPath(); c.moveTo(-2, -3.4); c.lineTo(3.6, 0); c.lineTo(-2, 3.4); c.closePath(); c.fillStyle = '#fff6ea'; c.fill(); c.restore(); } },
    silbido(c) {      // el silbato, con el cordón y las ondas
      c.beginPath(); c.moveTo(-15, -6); c.lineTo(4, -6); c.arc(6, 4, 10, -Math.PI / 2, Math.PI * 1.5); c.lineTo(-15, 4); c.closePath(); f(c, '#ffcb3d');
      circ(c, 6, 4, 4); f(c, '#e0a11f', 2); brillo(c, [-12, -3, 0, -3]);
      c.beginPath(); c.moveTo(-15, 4); c.quadraticCurveTo(-18, 14, -8, 15); st(c, '#ff4b5c', 2.2);
      if (!S) for (const r of [6, 11]) { c.beginPath(); c.arc(-15, -12, r, -2.4, -1.4); c.lineWidth = 2.4; c.strokeStyle = '#fff6ea'; c.stroke(); }
    },
    humo(c) {      // la granada y su nube
      c.beginPath(); c.arc(-6, 2, 8, Math.PI * 0.5, Math.PI * 1.5); c.arc(1, -7, 9.5, Math.PI, Math.PI * 1.95); c.arc(10, 0, 8, Math.PI * 1.4, Math.PI * 0.5); c.closePath(); f(c, '#dfe5f0');
      brillo(c, [-6, -6, 0, -12]);
      circ(c, 6, 10, 7.5); f(c, '#4b6a3a'); rr(c, 3, 1, 6, 4, 1.5); f(c, '#9aa6bc', 2); c.beginPath(); c.moveTo(9, 2); c.quadraticCurveTo(15, -1, 14, 5); st(c, OL, 2);
      if (!S) { c.beginPath(); c.moveTo(1, 9); c.lineTo(11, 9); c.moveTo(1, 13); c.lineTo(11, 13); c.lineWidth = 1.4; c.strokeStyle = 'rgba(0,0,0,.35)'; c.stroke(); }
    },
    foto(c) {      // la cámara con el flash
      rr(c, -16, -8, 32, 22, 5); f(c, '#39a0e8'); rr(c, -9, -13, 10, 6, 2); f(c, '#39a0e8'); rr(c, 8, -11, 6, 4, 1.5); f(c, '#fff6ea', 2);
      circ(c, 0, 3, 8.5); f(c, '#20283c'); circ(c, 0, 3, 5); f(c, '#7fd3ff', 2); if (!S) { c.fillStyle = '#fff'; circ(c, -2, 1, 1.8); c.fill(); }
      brillo(c, [-13, -5, -7, -5]); if (!S) chispa(c, 15, -15, 5);
    },
    sello(c) {      // el sello de DESPEDIDO con su tinta
      if (!S) { c.save(); c.translate(1, 11); c.rotate(-0.12); rr(c, -15, -5, 30, 10, 2); c.fillStyle = 'rgba(255,75,92,.25)'; c.fill(); c.lineWidth = 2; c.strokeStyle = '#ff4b5c'; c.stroke(); c.fillStyle = '#ff4b5c'; c.font = '700 6px ' + LETRA_GORDA; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(tr('DESPEDIDO'), 0, 0.5); c.restore(); }
      rr(c, -4.5, -17, 9, 12, 4); f(c, '#b45cff'); rr(c, -12, -6, 24, 7, 3); f(c, '#8a3ad8'); rr(c, -11, 1, 22, 4, 1.5); f(c, '#ff4b5c', 2); brillo(c, [-2, -14, -2, -9]);
    },
    copa(c) {      // el trofeo con su estrella
      c.beginPath(); c.moveTo(-11, -15); c.lineTo(11, -15); c.quadraticCurveTo(11, 4, 0, 5); c.quadraticCurveTo(-11, 4, -11, -15); c.closePath(); f(c, '#ffcb3d');
      c.beginPath(); c.moveTo(-11, -11); c.quadraticCurveTo(-19, -10, -14, -2); c.moveTo(11, -11); c.quadraticCurveTo(19, -10, 14, -2); st(c, OL, 2.8);
      rr(c, -3, 5, 6, 6, 1); f(c, '#e0a11f', 2); rr(c, -9, 11, 18, 6, 2); f(c, '#e0a11f', 2.4);
      brillo(c, [-7, -12, -7, -3]);
      if (!S) { c.save(); c.translate(0, -6); c.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 2.2 : 5; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fillStyle = '#fff6ea'; c.fill(); c.restore(); }
    },
    papeles(c) {      // la linterna del becario y el pincel del colado, cruzados
      c.save(); c.rotate(-0.7); rr(c, -3.5, -16, 7, 22, 2); f(c, '#3a7de0'); rr(c, -6, -20, 12, 7, 2); f(c, '#c9cfdc', 2.2); if (!S) { c.beginPath(); c.moveTo(-6, -21); c.lineTo(-11, -33); c.lineTo(11, -33); c.lineTo(6, -21); c.closePath(); c.fillStyle = 'rgba(255,236,150,.45)'; c.fill(); } c.restore();
      c.save(); c.rotate(0.7); rr(c, -2.5, -4, 5, 20, 2); f(c, '#b4703a', 2.2); rr(c, -4, -9, 8, 6, 1); f(c, '#c9cfdc', 2); c.beginPath(); c.moveTo(-4, -9); c.quadraticCurveTo(-4.5, -17, 0, -20); c.quadraticCurveTo(4.5, -17, 4, -9); c.closePath(); f(c, '#7ee04a', 2.2); c.restore();
    },
    red(c) {      // el mundo y la señal
      circ(c, -2, 3, 13); f(c, '#39d5e8');
      if (!S) { c.save(); circ(c, -2, 3, 13); c.clip(); c.fillStyle = '#7ee04a'; c.beginPath(); c.ellipse(-8, -1, 6, 4, 0.4, 0, TAU); c.fill(); c.beginPath(); c.ellipse(4, 9, 6, 3.6, -0.3, 0, TAU); c.fill(); c.restore(); circ(c, -2, 3, 13); c.lineWidth = 2.6; c.strokeStyle = OL; c.stroke(); }
      brillo(c, [-10, -4, -6, -8]);
      if (!S) for (const r of [5, 9.5]) { c.beginPath(); c.arc(11, -9, r, -Math.PI * 0.85, -Math.PI * 0.15); c.lineWidth = 2.6; c.strokeStyle = OL; c.stroke(); c.lineWidth = 1.4; c.strokeStyle = '#fff6ea'; c.stroke(); }
      if (!S) { circ(c, 11, -9, 2.2); c.fillStyle = '#fff6ea'; c.fill(); }
    },
    mapa(c) {      // el plano con el camino y la X
      c.beginPath(); c.moveTo(-16, -11); c.lineTo(-6, -14); c.lineTo(6, -11); c.lineTo(16, -14); c.lineTo(16, 12); c.lineTo(6, 15); c.lineTo(-6, 12); c.lineTo(-16, 15); c.closePath(); f(c, '#ffe07a');
      if (!S) { c.fillStyle = 'rgba(0,0,0,.08)'; c.beginPath(); c.moveTo(-6, -14); c.lineTo(6, -11); c.lineTo(6, 15); c.lineTo(-6, 12); c.closePath(); c.fill(); c.beginPath(); c.moveTo(-6, -14); c.lineTo(-6, 12); c.moveTo(6, -11); c.lineTo(6, 15); c.lineWidth = 1.6; c.strokeStyle = OL; c.stroke();
        c.setLineDash([2.5, 2.5]); c.beginPath(); c.moveTo(-12, 9); c.quadraticCurveTo(-4, -4, 7, -2); c.lineWidth = 1.8; c.strokeStyle = '#3a7de0'; c.stroke(); c.setLineDash([]);
        c.lineWidth = 3.2; c.strokeStyle = '#ff4b5c'; c.beginPath(); c.moveTo(8, -7); c.lineTo(13, -2); c.moveTo(13, -7); c.lineTo(8, -2); c.stroke(); }
    },
    fantasma(c) {      // el fantasma diciendo «¡buuu!»
      c.beginPath(); c.moveTo(-11, 14); c.lineTo(-11, -2); c.arc(0, -3, 11, Math.PI, 0); c.lineTo(11, 14); for (let k = 0; k < 4; k++) c.quadraticCurveTo(11 - k * 5.5 - 2.75, 10 + (k % 2) * 4, 11 - (k + 1) * 5.5, 14); c.closePath(); f(c, '#eef6ff');
      brillo(c, [-7, -6, -5, -10]);
      if (!S) { c.fillStyle = OL; c.beginPath(); c.ellipse(-4, -3, 2, 2.8, 0, 0, TAU); c.fill(); c.beginPath(); c.ellipse(4, -3, 2, 2.8, 0, 0, TAU); c.fill(); c.beginPath(); c.ellipse(0, 4, 2.4, 3.2, 0, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,110,150,.55)'; c.beginPath(); c.ellipse(-7.5, 2, 2, 1.2, 0, 0, TAU); c.fill(); c.beginPath(); c.ellipse(7.5, 2, 2, 1.2, 0, 0, TAU); c.fill(); }
    },
    ojo(c) {      // el ojo del becario y la gota de sudor de quien está delante
      c.beginPath(); c.moveTo(-17, 0); c.quadraticCurveTo(0, -16, 17, 0); c.quadraticCurveTo(0, 16, -17, 0); c.closePath(); f(c, '#fff6ea');
      circ(c, 0, 0, 7.5); f(c, '#39a0e8', 2.2); circ(c, 0, 0, 3.4); if (!S) { c.fillStyle = OL; c.fill(); c.fillStyle = '#fff'; circ(c, -2.2, -2.4, 1.6); c.fill(); }
      if (!S) for (const k of [-10, -4, 3, 9]) { c.beginPath(); c.moveTo(k, -8 + Math.abs(k) * 0.25); c.lineTo(k * 1.15, -13 + Math.abs(k) * 0.25); c.lineWidth = 2; c.strokeStyle = OL; c.stroke(); }
      c.beginPath(); c.moveTo(14, 6); c.quadraticCurveTo(19, 12, 14, 15); c.quadraticCurveTo(9, 12, 14, 6); c.closePath(); f(c, '#8fd3ff', 2);
    },
    escudo(c) {
      c.beginPath(); c.moveTo(0, -16); c.lineTo(14, -10); c.quadraticCurveTo(14, 8, 0, 16); c.quadraticCurveTo(-14, 8, -14, -10); c.closePath(); f(c, '#7ee04a');
      if (!S) { c.beginPath(); c.moveTo(0, -16); c.lineTo(0, 16); c.quadraticCurveTo(14, 8, 14, -10); c.closePath(); c.fillStyle = 'rgba(0,0,0,.12)'; c.fill(); }
      brillo(c, [-9, -8, -9, 1]);
      c.beginPath(); c.moveTo(-6, 0); c.lineTo(-1, 5); c.lineTo(7, -5); st(c, OL, 5.4); c.beginPath(); c.moveTo(-6, 0); c.lineTo(-1, 5); c.lineTo(7, -5); st(c, '#fff6ea', 2.6);
    },
    pincel(c) {      // el pincel y su salpicadura de colores
      if (!S) for (const [x, y, r, col] of [[-10, 10, 6, '#39d5e8'], [-3, 13, 3.6, '#ff6fb5'], [-14, 2, 3, '#ffcb3d']]) { circ(c, x, y, r); c.fillStyle = col; c.fill(); c.lineWidth = 2; c.strokeStyle = OL; c.stroke(); }
      c.save(); c.translate(3, -1); c.rotate(0.75); rr(c, -3, -1, 6, 19, 2.4); f(c, '#b4703a'); rr(c, -4.5, -6, 9, 6, 1); f(c, '#c9cfdc', 2.2);
      c.beginPath(); c.moveTo(-4.5, -6); c.quadraticCurveTo(-5, -15, 0, -18); c.quadraticCurveTo(5, -15, 4.5, -6); c.closePath(); f(c, '#ff4b5c'); brillo(c, [-1.5, -13, -1.5, -8]); c.restore();
    },
    reloj(c) {      // el cronómetro
      rr(c, -3.5, -18, 7, 5, 1.5); f(c, '#c9cfdc', 2.2); c.beginPath(); c.moveTo(9, -12); c.lineTo(12, -15); st(c, OL, 3);
      circ(c, 0, 2, 14); f(c, '#ff4b5c'); circ(c, 0, 2, 10); f(c, '#fff6ea', 2.2);
      if (!S) { for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; c.beginPath(); c.moveTo(Math.cos(a) * 8, 2 + Math.sin(a) * 8); c.lineTo(Math.cos(a) * 9.4, 2 + Math.sin(a) * 9.4); c.lineWidth = 1.2; c.strokeStyle = OL; c.stroke(); }
        c.beginPath(); c.moveTo(0, 2); c.lineTo(0, -5); c.moveTo(0, 2); c.lineTo(5, 4); c.lineWidth = 2.2; c.strokeStyle = OL; c.stroke(); c.beginPath(); c.moveTo(0, 2); c.arc(0, 2, 9, -Math.PI / 2, -Math.PI / 2 + 1.1); c.closePath(); c.fillStyle = 'rgba(255,75,92,.3)'; c.fill(); }
      brillo(c, [-9, -6, -5, -9]);
    },
    // ---- los nuevos (24-10-2026): misiones semanales, logros nuevos y secretos ----
    postura(c) {      // la galleta en estrella, con su escarcha de congelada
      c.beginPath(); c.arc(0, -10, 7.5, 0, TAU); c.moveTo(-5, -3); c.lineTo(5, -3); c.lineTo(7, 9); c.lineTo(-7, 9); c.closePath(); f(c, '#f4e3c8');
      for (const [x0, y0, x1, y1] of [[-5, -1, -15, -9], [5, -1, 15, -9], [-4, 8, -11, 16], [4, 8, 11, 16]]) { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); st(c, OL, 6.2); c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); st(c, '#f4e3c8', 3.4); }
      if (!S) { c.fillStyle = OL; circ(c, -2.6, -11, 1.3); c.fill(); circ(c, 2.6, -11, 1.3); c.fill(); for (const [x, y, r] of [[13, -14, 3.2], [-13, 13, 2.6]]) chispa(c, x, y, r); c.fillStyle = 'rgba(159,232,255,.45)'; c.beginPath(); c.arc(0, -10, 7.5, Math.PI, TAU); c.fill(); }
    },
    regalo(c) {      // la caja del premio diario con su lazo
      rr(c, -14, -4, 28, 19, 3); f(c, '#ff4b5c'); rr(c, -16, -10, 32, 8, 2.5); f(c, '#ff6f7c');
      rr(c, -3.5, -10, 7, 25, 1); f(c, '#ffcb3d', 2.2);
      c.beginPath(); c.moveTo(0, -10); c.bezierCurveTo(-14, -22, -16, -8, 0, -10); c.moveTo(0, -10); c.bezierCurveTo(14, -22, 16, -8, 0, -10); f(c, '#ffcb3d', 2.4);
      brillo(c, [-12, -7, -6, -7]);
    },
    linterna(c) {      // la linterna del becario con su haz
      if (!S) { c.beginPath(); c.moveTo(6, -6); c.lineTo(18, -16); c.lineTo(18, 6); c.closePath(); c.fillStyle = 'rgba(255,240,150,.55)'; c.fill(); }
      c.save(); c.rotate(-0.35); rr(c, -16, -4, 20, 9, 3); f(c, '#3a7de0'); rr(c, 3, -7, 7, 15, 2); f(c, '#c9cfdc', 2.4); if (!S) { c.fillStyle = '#fff6a0'; c.fillRect(8, -5, 2, 11); } brillo(c, [-13, -2, -2, -2]); c.restore();
    },
    rayo(c) {      // el rayo de los talentos
      c.beginPath(); c.moveTo(4, -17); c.lineTo(-10, 2); c.lineTo(-1, 2); c.lineTo(-5, 17); c.lineTo(10, -3); c.lineTo(1, -3); c.closePath(); f(c, '#ffcb3d', 2.8);
      brillo(c, [2, -12, -5, -1]);
    },
    estrella(c) {      // la estrella del Empleado del día / del mes
      c.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 7.5 : 17; c.lineTo(Math.cos(a) * r, 1 + Math.sin(a) * r); } c.closePath(); f(c, '#ffcb3d', 3);
      brillo(c, [-6, -4, -1, -10]); if (!S) { c.fillStyle = OL; circ(c, -3.5, 1, 1.4); c.fill(); circ(c, 3.5, 1, 1.4); c.fill(); c.beginPath(); c.arc(0, 3.5, 3, 0.2, Math.PI - 0.2); c.lineWidth = 1.6; c.strokeStyle = OL; c.stroke(); }
    },
    amigos(c) {      // dos galletas juntas
      c.save(); c.translate(-7, 2); c.scale(0.78, 0.78); galleta(c, '#cfe8ff'); c.restore();
      c.save(); c.translate(7, 1); c.scale(0.82, 0.82); galleta(c, '#f4e3c8'); c.restore();
    },
    calendario(c) {      // la hoja del calendario con la marca
      rr(c, -14, -12, 28, 27, 4); f(c, '#fff6ea'); rr(c, -14, -12, 28, 8, 3); f(c, '#ff4b5c');
      for (const x of [-7, 7]) { rr(c, x - 1.6, -16, 3.2, 7, 1.5); f(c, '#c9cfdc', 1.8); }
      if (!S) { c.fillStyle = 'rgba(29,37,54,.25)'; for (let j = 0; j < 3; j++) for (let i = 0; i < 4; i++) c.fillRect(-10 + i * 6, -1 + j * 5, 3.4, 3); }
      c.beginPath(); c.moveTo(-3, 6); c.lineTo(1, 10); c.lineTo(10, -1); st(c, OL, 5); c.beginPath(); c.moveTo(-3, 6); c.lineTo(1, 10); c.lineTo(10, -1); st(c, '#7ee04a', 2.8);
    },
    pegatina(c) {      // una pegatina con la esquina levantada
      c.beginPath(); c.moveTo(-14, -14); c.lineTo(14, -14); c.lineTo(14, 5); c.lineTo(5, 14); c.lineTo(-14, 14); c.closePath(); f(c, '#fff6ea', 3);
      c.beginPath(); c.moveTo(14, 5); c.lineTo(5, 5); c.lineTo(5, 14); c.closePath(); f(c, '#c9cfdc', 2.4);
      if (!S) { c.fillStyle = '#ff6fb5'; circ(c, -3, -3, 7); c.fill(); c.fillStyle = OL; circ(c, -5.5, -4.5, 1.3); c.fill(); circ(c, -0.5, -4.5, 1.3); c.fill(); c.beginPath(); c.arc(-3, -2, 2.6, 0.2, Math.PI - 0.2); c.lineWidth = 1.5; c.strokeStyle = OL; c.stroke(); }
    },
    percha(c) {      // la percha del armario con una camiseta
      c.beginPath(); c.moveTo(0, -9); c.lineTo(0, -12); c.arc(3, -12, 3, Math.PI, Math.PI * 1.9); st(c, OL, 2.8);
      c.beginPath(); c.moveTo(-15, -2); c.lineTo(-7, -9); c.lineTo(7, -9); c.lineTo(15, -2); c.lineTo(11, 3); c.lineTo(8, 1); c.lineTo(8, 15); c.lineTo(-8, 15); c.lineTo(-8, 1); c.lineTo(-11, 3); c.closePath(); f(c, '#39d5e8');
      if (!S) { c.beginPath(); c.moveTo(-3, -9); c.quadraticCurveTo(0, -5, 3, -9); c.lineWidth = 2; c.strokeStyle = OL; c.stroke(); } brillo(c, [-5, -5, -5, 9]);
    },
    pase(c) {      // el ticket del pase de temporada
      c.beginPath(); c.moveTo(-16, -10); c.lineTo(16, -10); c.lineTo(16, -3); c.arc(16, 1, 4, -Math.PI / 2, Math.PI / 2, true); c.lineTo(16, 10); c.lineTo(-16, 10); c.lineTo(-16, 5); c.arc(-16, 1, 4, Math.PI / 2, -Math.PI / 2, true); c.closePath(); f(c, '#ffcb3d');
      if (!S) { c.setLineDash([2.5, 2.5]); c.beginPath(); c.moveTo(7, -8); c.lineTo(7, 8); c.lineWidth = 1.6; c.strokeStyle = OL; c.stroke(); c.setLineDash([]); c.font = '11px "Luckiest Guy", "Arial Black", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = OL; c.fillText('40', -4, 1); }
      brillo(c, [-12, -6, 3, -6]);
    },
    luna(c) {      // la luna del turno de noche, con sus Z
      c.beginPath(); c.arc(-2, 2, 14, 0.9, Math.PI * 1.75); c.arc(5, -3, 10, Math.PI * 1.6, 0.95, true); c.closePath(); f(c, '#ffe58a');
      brillo(c, [-10, -4, -8, 6]); if (!S) { c.font = '900 9px sans-serif'; c.fillStyle = '#fff6ea'; c.fillText('z', 9, -9); c.font = '900 7px sans-serif'; c.fillText('z', 14, -14); }
    },
    coche(c) {      // el coche del jefe en el aire, con los chorros de abajo
      if (!S) for (const x of [-9, 9]) { c.beginPath(); c.moveTo(x - 3, 9); c.lineTo(x, 17); c.lineTo(x + 3, 9); c.fillStyle = '#bff3ff'; c.fill(); }
      c.beginPath(); c.moveTo(-17, 4); c.lineTo(-15, -3); c.lineTo(-8, -5); c.lineTo(-4, -12); c.lineTo(7, -12); c.lineTo(11, -5); c.lineTo(16, -3); c.lineTo(17, 4); c.quadraticCurveTo(17, 8, 13, 8); c.lineTo(-13, 8); c.quadraticCurveTo(-17, 8, -17, 4); c.closePath(); f(c, '#ff4b5c');
      rr(c, -2.5, -10, 8, 5, 1.5); f(c, '#9fe8ff', 2); circ(c, -10, 8, 4); f(c, '#20283c', 2.2); circ(c, 10, 8, 4); f(c, '#20283c', 2.2); brillo(c, [-13, -1, -6, -3]);
    },
    secreto(c) {      // el interrogante de un logro secreto aún sin descubrir
      if (!S) { c.font = '30px "Luckiest Guy", "Arial Black", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 5; c.strokeStyle = OL; c.strokeText('?', 0, 2); c.fillStyle = '#fff6ea'; c.fillText('?', 0, 2); }
      else { c.font = '30px "Luckiest Guy", "Arial Black", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = OL; c.fillText('?', 0, 2); }
    },
  };
  const out = {};
  for (const k in D) out[k] = (c, sombra) => { S = sombra; try { D[k](c); } finally { S = false; } };
  return out;
})();
