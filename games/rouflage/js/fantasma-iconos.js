// Fans of Rouflage · LOS DIBUJOS DE LOS PODERES DEL FANTASMA (fantasma-poder.js): uno por poder, con el contorno grueso y los colores del juego, en el mismo
// formato que los de las misiones y los talentos (DIBUJOS_MIS: centrados en 0,0, de unos 34 de lado; `sombra` pinta solo la silueta oscura de detrás).
// Van con la clave 'fp_<id>': la medalla de la pantalla de TALENTOS (pintaInsignia, tono 'fantasma') y pintaPoderIcono para el botón PODER de la partida.
'use strict';
TONOS_MIS.fantasma = ['#e6f4ff', '#6f9ad6'];
(() => {
  let S = false;
  const f = (c, col, lw = 2.6) => { c.fillStyle = S ? OL : col; c.fill(); if (!S) { c.lineWidth = lw; c.strokeStyle = OL; c.stroke(); } };
  const st = (c, col, lw) => { c.lineWidth = lw; c.strokeStyle = S ? OL : col; c.stroke(); };
  const linea = (c, col, lw, ...p) => { c.beginPath(); c.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]); st(c, OL, lw + 3); c.beginPath(); c.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]); st(c, col, lw); };
  const brillo = (c, ...p) => { if (S) return; c.beginPath(); c.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]); c.lineWidth = 2; c.strokeStyle = 'rgba(255,255,255,.75)'; c.stroke(); };
  const circ = (c, x, y, r) => { c.beginPath(); c.arc(x, y, r, 0, TAU); };
  const rr = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect(x, y, w, h, r); };
  const letra = (c, s, x, y, tam, col) => { if (S) return; c.font = '400 ' + tam + 'px ' + LETRA_GORDA; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 3; c.strokeStyle = OL; c.strokeText(s, x, y); c.fillStyle = col; c.fillText(s, x, y); };
  // un fantasmita (el de la misión del fantasma, más pequeño), con los brazos arriba
  const fantasmita = (c, x, y, k) => {
    c.save(); c.translate(x, y); c.scale(k, k);
    c.beginPath(); c.moveTo(-11, 14); c.lineTo(-11, -2); c.arc(0, -3, 11, Math.PI, 0); c.lineTo(11, 14); for (let i = 0; i < 4; i++) c.quadraticCurveTo(11 - i * 5.5 - 2.75, 10 + (i % 2) * 4, 11 - (i + 1) * 5.5, 14); c.closePath(); f(c, '#eef6ff', 2.6 / k);
    if (!S) { c.fillStyle = OL; c.beginPath(); c.ellipse(-4, -3, 2, 2.8, 0, 0, TAU); c.fill(); c.beginPath(); c.ellipse(4, -3, 2, 2.8, 0, 0, TAU); c.fill(); c.beginPath(); c.ellipse(0, 4, 2.2, 3, 0, 0, TAU); c.fill(); }
    c.restore();
  };
  // una linterna de becario tumbada (cuerpo gris, cabeza y cristal)
  const linterna = (c, x, y, ang, cristal) => {
    c.save(); c.translate(x, y); c.rotate(ang);
    rr(c, -13, -4.5, 15, 9, 2.5); f(c, '#5d6a8a');
    c.beginPath(); c.moveTo(2, -6.5); c.lineTo(8, -8.5); c.lineTo(8, 8.5); c.lineTo(2, 6.5); c.closePath(); f(c, '#c9d2e2', 2.4);
    c.beginPath(); c.ellipse(8, 0, 2, 8, 0, 0, TAU); f(c, cristal, 2);
    if (!S) { c.fillStyle = '#ff4b5c'; rr(c, -7, -6.5, 4, 2.5, 1); c.fill(); }
    brillo(c, -10, -1.5, -1, -1.5);
    c.restore();
  };
  const D = {
    fp_apagon(c) {      // la linterna apagada: el cristal oscuro, un hilo de humo y el rayo tachado
      linterna(c, -3, 4, -0.35, '#3d4063');
      if (!S) { c.setLineDash([2.5, 3]); c.beginPath(); c.moveTo(6, -4); c.lineTo(17, -12); c.moveTo(7, 2); c.lineTo(17, 0); c.lineWidth = 2; c.strokeStyle = 'rgba(255,240,170,.5)'; c.stroke(); c.setLineDash([]); }
      c.beginPath(); c.moveTo(4, -10); c.quadraticCurveTo(1, -14, 4, -17); st(c, S ? OL : '#b9c6dc', 2);
      linea(c, '#ff4b5c', 3, -15, -15, 15, 15);
    },
    fp_silbido(c) {      // el silbido falso: un fantasmita silbando y las ondas
      fantasmita(c, -5, 2, 0.85);
      if (!S) for (const r of [6, 10, 14]) { c.beginPath(); c.arc(4, 4, r, -0.9, 0.5); c.lineWidth = 2.4; c.strokeStyle = '#ffcb3d'; c.stroke(); }
      letra(c, '?', 13, -11, 12, '#ffcb3d');
    },
    fp_mano(c) {      // la mano fría: una mano azulada con escarcha
      c.beginPath(); c.moveTo(-7, 14); c.lineTo(-8, 1); c.lineTo(-11, -6); c.quadraticCurveTo(-11, -9, -8, -8); c.lineTo(-5, -2); c.lineTo(-6, -14); c.quadraticCurveTo(-4, -17, -2, -14);
      c.lineTo(-1, -4); c.lineTo(0, -16); c.quadraticCurveTo(2, -19, 4, -16); c.lineTo(4, -4); c.lineTo(6, -14); c.quadraticCurveTo(8, -16, 10, -13); c.lineTo(9, -2); c.lineTo(10, 8); c.quadraticCurveTo(9, 14, 5, 15); c.closePath(); f(c, '#9fd0ff');
      brillo(c, -4, 9, -5, -1);
      if (!S) for (const [x, y, r] of [[14, -14, 3.4], [-15, 10, 2.6], [15, 6, 2.2]]) chispa(c, x, y, r);
    },
    fp_retoque(c) {      // el retoque: un pincel con pintura verde y el brillo de bien hecho
      c.save(); c.rotate(0.75);
      rr(c, -3, -4, 6, 20, 2.5); f(c, '#c98a4a');
      rr(c, -4, -9, 8, 6, 1.5); f(c, '#c9d2e2', 2.2);
      c.beginPath(); c.moveTo(-4, -9); c.quadraticCurveTo(-5, -16, 0, -20); c.quadraticCurveTo(5, -16, 4, -9); c.closePath(); f(c, '#7ee04a', 2.4);
      brillo(c, -1, 0, -1, 12);
      c.restore();
      c.beginPath(); c.moveTo(-15, 9); c.quadraticCurveTo(-9, 4, -3, 9); c.quadraticCurveTo(-8, 13, -15, 9); f(c, '#7ee04a', 2.2);
      if (!S) { chispa(c, 12, -12, 4.2); chispa(c, 15, 4, 2.6); }
    },
    fp_vaho(c) {      // el vaho: una nube fría con sus rayas de aire
      const nube = () => { c.beginPath(); for (const [x, y, r] of [[-7, 4, 7], [1, 0, 9], [9, 5, 6.5], [-1, 8, 6], [5, 9, 5]]) { c.moveTo(x + r, y); c.arc(x, y, r, 0, TAU); } };
      nube(); if (S) { c.fillStyle = OL; c.fill(); } else { c.lineWidth = 5.6; c.strokeStyle = OL; c.stroke(); nube(); c.fillStyle = '#e6f2ff'; c.fill(); }
      brillo(c, -3, -5, 3, -7);
      if (!S) for (const [y, l] of [[-12, 8], [-16, 12], [-8, 5]]) { c.beginPath(); c.moveTo(-16, y); c.lineTo(-16 + l, y); c.lineWidth = 2.2; c.strokeStyle = '#9fd0ff'; c.stroke(); }
      if (!S) chispa(c, 14, -10, 3);
    },
    fp_charco(c) {      // el charco de pintura con sus gotas
      c.beginPath(); for (let i = 0; i <= 14; i++) { const a = i / 14 * TAU, r = 15 * (1 + 0.15 * Math.sin(a * 3) + 0.08 * Math.sin(a * 5)); c.lineTo(Math.cos(a) * r, 6 + Math.sin(a) * r * 0.55); } c.closePath(); f(c, '#39d5e8', 2.8);
      if (!S) { c.beginPath(); c.ellipse(-5, 3, 5, 1.6, -0.2, 0, TAU); c.fillStyle = 'rgba(255,255,255,.6)'; c.fill(); }
      for (const [x, y, r] of [[-8, -10, 3], [3, -14, 2.4], [11, -8, 2]]) { c.beginPath(); c.moveTo(x, y - r * 2); c.quadraticCurveTo(x + r * 1.2, y, x, y + r); c.quadraticCurveTo(x - r * 1.2, y, x, y - r * 2); f(c, '#39d5e8', 2); }
    },
    fp_susto(c) {      // el susto: el fantasmita diciendo ¡buuu! y la exclamación
      fantasmita(c, -2, 3, 1);
      letra(c, '!', 13, -12, 15, '#ff4b5c');
      if (!S) for (const [x1, y1, x2, y2] of [[-15, -12, -11, -8], [-17, -3, -12, -3]]) { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.lineWidth = 2.2; c.strokeStyle = '#ffcb3d'; c.stroke(); }
    },
    fp_portazo(c) {      // el portazo: la puerta con su pomo y las rayas del golpe
      rr(c, -9, -15, 16, 30, 2); f(c, '#c98a4a', 2.8);
      rr(c, -6, -12, 10, 10, 1.5); f(c, '#b07438', 1.8); rr(c, -6, 1, 10, 10, 1.5); f(c, '#b07438', 1.8);
      circ(c, 4, 0, 1.8); f(c, '#ffcb3d', 1.6);
      brillo(c, -6.5, -10, -6.5, -5);
      if (!S) for (const [x1, y1, x2, y2] of [[11, -12, 17, -16], [12, -3, 18, -3], [11, 6, 17, 10]]) { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.lineWidth = 2.6; c.strokeStyle = '#ffcb3d'; c.stroke(); }
    },
    fp_avisar(c) {      // la baliza del becario: el rombo con su exclamación y la onda
      if (!S) { c.beginPath(); c.ellipse(0, 12, 14, 5, 0, 0, TAU); c.lineWidth = 2.4; c.strokeStyle = '#7fe8ff'; c.stroke(); }
      c.beginPath(); c.moveTo(0, -17); c.lineTo(12, -3); c.lineTo(0, 11); c.lineTo(-12, -3); c.closePath(); f(c, '#7fe8ff', 2.8);
      if (!S) { c.fillStyle = OL; c.fillRect(-1.8, -11, 3.6, 9); c.fillRect(-1.8, 0, 3.6, 3.6); }
      brillo(c, -7, -4, -1, -11);
    },
    fp_soplo(c) {      // el soplo: remolinos de aire que se llevan las gotas de pintura
      if (!S) { c.lineWidth = 2.8; c.strokeStyle = OL; }
      for (const [y, r] of [[-6, 6], [5, 5]]) {
        c.beginPath(); c.moveTo(-16, y); c.lineTo(2, y); c.arc(2, y - r, r, Math.PI / 2, -Math.PI * 0.9, true); st(c, OL, 5.5);
        c.beginPath(); c.moveTo(-16, y); c.lineTo(2, y); c.arc(2, y - r, r, Math.PI / 2, -Math.PI * 0.9, true); st(c, '#e6f2ff', 2.6);
      }
      for (const [x, y, r, col] of [[12, -10, 2.8, '#ff7a1a'], [15, 2, 2.2, '#7ee04a'], [11, 12, 2.6, '#ff5fa8']]) { circ(c, x, y, r); f(c, col, 1.8); }
    },
    fp_foco(c) {      // el foco: una bombilla grande encendida con sus rayos
      if (!S) for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; c.beginPath(); c.moveTo(Math.cos(a) * 13, -3 + Math.sin(a) * 13); c.lineTo(Math.cos(a) * 17.5, -3 + Math.sin(a) * 17.5); c.lineWidth = 2.6; c.strokeStyle = '#ffe07a'; c.stroke(); }
      c.beginPath(); c.arc(0, -4, 9.5, Math.PI * 0.8, Math.PI * 0.2); c.lineTo(4, 8); c.lineTo(-4, 8); c.closePath(); f(c, '#ffe07a', 2.8);
      rr(c, -5, 8, 10, 6, 2); f(c, '#9aa6bc', 2.2);
      if (!S) { c.beginPath(); c.moveTo(-3, 2); c.lineTo(-1.5, -4); c.lineTo(1.5, 2); c.lineTo(3, -4); c.lineWidth = 1.6; c.strokeStyle = '#e8731a'; c.stroke(); }
      brillo(c, -6, -7, -3, -10);
    },
  };
  for (const k in D) { const g = D[k]; DIBUJOS_MIS[k] = (c, sombra) => { S = !!sombra; c.save(); c.lineJoin = 'round'; c.lineCap = 'round'; g(c); c.restore(); S = false; }; }
})();
// el dibujo de un poder suelto (el botón PODER): con su sombra, escalado a w
function pintaPoderIcono(c, w, id) {
  const g = DIBUJOS_MIS['fp_' + id]; if (!g) return;
  c.save(); c.scale(w / 40, w / 40); c.translate(20, 20.5);
  c.save(); c.globalAlpha = 0.4; c.translate(1.2, 2.2); g(c, true); c.restore();
  g(c, false);
  c.restore();
}
