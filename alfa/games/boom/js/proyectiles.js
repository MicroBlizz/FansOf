// Fans of Boom · PROYECTILES: cómo se ve el tiro de cada móvil (la forma la dice cada tiro en ajustes.js). Solo dibujo.
'use strict';
const PROYECTIL_FORMAS = (() => {
  const borde = c => { c.lineWidth = 3; c.strokeStyle = OL; c.lineJoin = 'round'; };
  return {
    bola(c, x, y) { c.fillStyle = OL; c.beginPath(); c.arc(x, y, 7.5, 0, 6.2832); c.fill(); c.fillStyle = '#ffcb3d'; c.beginPath(); c.arc(x - 1, y - 1, 5, 0, 6.2832); c.fill(); },
    hueso(c, x, y, a, t) {   // un hueso que da vueltas
      c.save(); c.translate(x, y); c.rotate(t * 12); borde(c); c.fillStyle = '#f4ecd8';
      c.beginPath(); rrPath(c, -9, -3, 18, 6, 3); c.fill(); c.stroke();
      for (const s of [-1, 1]) for (const d of [-1, 1]) { c.beginPath(); c.arc(s * 9, d * 3.5, 3.6, 0, 6.2832); c.fill(); c.stroke(); }
      c.restore();
    },
    laser(c, x, y, a) {   // un rayo alargado en la dirección del vuelo, con brillo
      c.save(); c.translate(x, y); c.rotate(a);
      c.fillStyle = 'rgba(124,240,255,.35)'; c.beginPath(); rrPath(c, -18, -7, 30, 14, 7); c.fill();
      borde(c); c.fillStyle = '#7cf0ff'; c.beginPath(); rrPath(c, -14, -3.5, 22, 7, 3.5); c.fill(); c.stroke();
      c.fillStyle = '#fff'; c.fillRect(-8, -1, 12, 2); c.restore();
    },
    pelo(c, x, y, a, t) {   // una bola de pelo amarilla, despeinada
      c.save(); c.translate(x, y); c.rotate(t * 5); borde(c); c.fillStyle = '#ffd24a';
      c.beginPath(); for (let i = 0; i < 14; i++) { const r = i % 2 ? 6 : 9, b = i / 14 * 6.2832; c.lineTo(Math.cos(b) * r, Math.sin(b) * r); } c.closePath(); c.fill(); c.stroke(); c.restore();
    },
    disco(c, x, y, a, t) {   // un disco de chatarra que gira plano (de ahí que el viento lo lleve)
      c.save(); c.translate(x, y); c.scale(1, 0.45 + 0.25 * Math.abs(Math.sin(t * 9))); borde(c);
      c.fillStyle = '#9aa0a8'; c.beginPath(); c.arc(0, 0, 11, 0, 6.2832); c.fill(); c.stroke();
      c.fillStyle = '#5b5f66'; c.beginPath(); c.arc(0, 0, 4, 0, 6.2832); c.fill(); c.restore();
    },
    misil(c, x, y, a, t) {   // un misil con aletas y llama
      c.save(); c.translate(x, y); c.rotate(a);
      c.fillStyle = Math.sin(t * 40) > 0 ? '#ffcb3d' : '#ff7a1a'; c.beginPath(); c.moveTo(-10, -3); c.lineTo(-19 - Math.random() * 4, 0); c.lineTo(-10, 3); c.fill();
      borde(c); c.fillStyle = '#c87a3a'; c.beginPath(); c.moveTo(-10, -4); c.lineTo(6, -4); c.lineTo(12, 0); c.lineTo(6, 4); c.lineTo(-10, 4); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#5b3d8a'; c.beginPath(); c.moveTo(-10, -4); c.lineTo(-14, -9); c.lineTo(-6, -4); c.closePath(); c.moveTo(-10, 4); c.lineTo(-14, 9); c.lineTo(-6, 4); c.closePath(); c.fill(); c.stroke();
      c.restore();
    },
  };
})();
