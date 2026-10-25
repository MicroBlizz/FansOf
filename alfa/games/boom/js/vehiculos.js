// Fans of Boom · VEHÍCULOS: el cuerpo dibujado de cada móvil (cada uno distinto, con los colores de su equipo). Solo dibujo.
// Se pinta con el origen en los pies, mirando a la derecha (el que llama ya lo gira y lo apoya en la cuesta). El cañón lo pinta pintar.js
// aparte desde el punto (0, -14), así que cada cuerpo deja ahí su torreta.
'use strict';
const VEHICULOS = (() => {
  const ruedas = (c, xs, y, r, col) => { for (const x of xs) { c.fillStyle = col || '#3a2a4a'; c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.fill(); c.stroke(); c.fillStyle = '#a99ac4'; c.beginPath(); c.arc(x, y, r * 0.38, 0, 6.2832); c.fill(); } };
  const caja = (c, x, y, w, h, r, col) => { c.fillStyle = col; c.beginPath(); rrPath(c, x, y, w, h, r); c.fill(); c.stroke(); };
  const cuerpos = {
    mechavaca(c, E, d) {   // tanque cuadrado con manchas, cuernos y un ubre-depósito
      c.fillStyle = '#3a2a4a'; c.beginPath(); rrPath(c, -26, -10, 52, 11, 5.5); c.fill(); c.stroke();
      c.fillStyle = '#a99ac4'; for (let i = -17; i <= 17; i += 11) { c.beginPath(); c.arc(i, -4.5, 3.4, 0, 6.2832); c.fill(); }
      caja(c, -22, -26, 44, 18, 7, E.color);
      c.fillStyle = '#f4f4f4'; for (const [x, y, r] of [[-12, -20, 4.5], [4, -16, 3.5], [14, -22, 4]]) { c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.fill(); }
      c.fillStyle = '#fff'; c.beginPath(); c.moveTo(-18, -25); c.lineTo(-25, -34); c.lineTo(-13, -26); c.moveTo(-6, -26); c.lineTo(-2, -35); c.lineTo(2, -26); c.fill(); c.stroke();
      c.fillStyle = '#ffb3c8'; c.beginPath(); c.ellipse(15, -4, 7, 4, 0, 0, 6.2832); c.fill(); c.stroke();
    },
    skeletoncrew(c, E, d) {   // carreta de huesos con una calavera de proa
      c.fillStyle = '#e8e0c8'; c.beginPath(); rrPath(c, -24, -9, 48, 7, 3.5); c.fill(); c.stroke();
      for (const x of [-18, -6, 6, 18]) { c.beginPath(); c.arc(x, -3, 3, 0, 6.2832); c.fill(); c.stroke(); }
      caja(c, -20, -24, 34, 16, 5, E.color);
      c.fillStyle = '#f4ecd8'; c.beginPath(); c.arc(17, -17, 9, 0, 6.2832); c.fill(); c.stroke();
      c.fillStyle = '#20102c'; c.beginPath(); c.arc(14, -19, 2.4, 0, 6.2832); c.arc(20, -19, 2.4, 0, 6.2832); c.fill(); c.fillRect(15, -14, 4, 3);
      ruedas(c, [-14, 10], -4, 5, '#f4ecd8');
    },
    neonsniper(c, E, d, t) {   // moto-cápsula baja con un riel largo y luz de neón
      c.fillStyle = 'rgba(124,240,255,.3)'; c.beginPath(); c.ellipse(0, -6, 30, 12, 0, 0, 6.2832); c.fill();
      caja(c, -26, -14, 50, 10, 5, '#2a1f4a');
      caja(c, -17, -24, 30, 12, 6, E.color);
      c.fillStyle = '#7cf0ff'; c.fillRect(-12, -20, 18, 3); c.fillRect(-24, -9, 44, 2);
      ruedas(c, [-17, 16], -5, 7, '#20102c');
      c.strokeStyle = '#7cf0ff'; c.lineWidth = 2; c.beginPath(); c.arc(-17, -5, 9 + Math.sin(t * 8), 0, 6.2832); c.stroke(); c.lineWidth = 3; c.strokeStyle = OL;
    },
    chonkcat(c, E, d) {   // un gato enorme y redondo sobre cuatro ruedas, con orejas y bigotes
      c.fillStyle = '#ffd24a'; c.beginPath(); c.ellipse(0, -15, 25, 15, 0, 0, 6.2832); c.fill(); c.stroke();
      c.fillStyle = E.color; c.beginPath(); c.ellipse(-3, -9, 17, 8, 0, 0, 6.2832); c.fill();
      c.fillStyle = '#ffd24a'; c.beginPath(); c.moveTo(8, -26); c.lineTo(11, -37); c.lineTo(18, -27); c.moveTo(-4, -28); c.lineTo(-5, -38); c.lineTo(3, -29); c.fill(); c.stroke();
      c.fillStyle = '#20102c'; c.beginPath(); c.arc(14, -19, 1.8, 0, 6.2832); c.arc(5, -19, 1.8, 0, 6.2832); c.fill();
      c.lineWidth = 1.5; c.beginPath(); c.moveTo(20, -14); c.lineTo(28, -16); c.moveTo(20, -12); c.lineTo(28, -11); c.stroke(); c.lineWidth = 3;
      ruedas(c, [-17, 17], -3, 5);
    },
    junkcoon(c, E, d) {   // carro de chatarra con la cara de mapache sobre el capó y un disco por rueda
      caja(c, -25, -14, 50, 10, 3, '#6a7078');
      caja(c, -16, -26, 28, 13, 4, E.color);
      c.fillStyle = '#9aa0a8'; c.beginPath(); c.moveTo(14, -26); c.lineTo(20, -35); c.lineTo(22, -26); c.fill(); c.stroke();
      c.fillStyle = '#20102c'; c.fillRect(7, -21, 14, 6); c.fillStyle = '#fff'; c.beginPath(); c.arc(11, -18, 1.8, 0, 6.2832); c.arc(17, -18, 1.8, 0, 6.2832); c.fill();
      c.fillStyle = '#c0c4cc'; c.fillRect(-23, -22, 5, 8); c.strokeRect(-23, -22, 5, 8);
      ruedas(c, [-17, 0, 17], -4, 5.5, '#9aa0a8');
    },
    boombeaver(c, E, d) {   // un tronco con ruedas, dientes grandes y la cola plana detrás
      c.fillStyle = '#7a4a22'; c.beginPath(); rrPath(c, -25, -22, 46, 18, 8); c.fill(); c.stroke();
      c.strokeStyle = '#a56a38'; c.lineWidth = 2; for (const x of [-16, -4, 8]) { c.beginPath(); c.moveTo(x, -20); c.lineTo(x + 2, -7); c.stroke(); } c.strokeStyle = OL; c.lineWidth = 3;
      c.fillStyle = '#b86f33'; c.beginPath(); c.ellipse(-29, -9, 9, 6, 0.3, 0, 6.2832); c.fill(); c.stroke();
      c.fillStyle = E.color; c.fillRect(-12, -18, 14, 4);
      c.fillStyle = '#fff'; c.fillRect(16, -14, 4, 7); c.fillRect(21, -14, 4, 7); c.strokeRect(16, -14, 4, 7); c.strokeRect(21, -14, 4, 7);
      ruedas(c, [-14, 8], -4, 5, '#5b3d8a');
    },
    cybermarine(c, E, d, t) {   // módulo de combate con una antena parabólica que gira (el satélite)
      caja(c, -22, -12, 44, 9, 4, '#2a1f4a');
      caja(c, -17, -25, 30, 14, 6, E.color);
      c.fillStyle = '#58e0a0'; c.fillRect(-12, -21, 20, 4);
      c.save(); c.translate(-14, -25); c.rotate(Math.sin(t * 2) * 0.5 - 0.5);
      c.fillStyle = '#e8f4ff'; c.beginPath(); c.arc(0, -6, 8, 0.2, 3.34); c.closePath(); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(0, -6); c.lineTo(0, -1); c.stroke(); c.restore();
      ruedas(c, [-14, 0, 14], -4, 4.5);
    },
  };
  function dibuja(c, m, E, t) {   // el cuerpo del móvil m; los que no tienen el suyo usan el de MechaVaca
    c.lineJoin = 'round'; c.lineWidth = 3; c.strokeStyle = OL;
    (cuerpos[m.def.id] || cuerpos.mechavaca)(c, E, m.def, t);
    c.fillStyle = m.def.acento; c.fillRect(-2, -1, 4, 2);
  }
  return { dibuja };
})();
