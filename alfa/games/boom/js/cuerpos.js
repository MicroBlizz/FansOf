// Fans of Boom · CUERPOS: el dibujo de cada móvil, uno por facción (la furgoneta de JunkCoon, el ataúd con ruedas, la antena orbital…).
// Se dibuja ya colocado: (0, 0) son los pies, mirando a la derecha e inclinado con la cuesta. El cañón lo pone pintar.js encima. Solo dibujo.
'use strict';
const CUERPOS = (() => {
  const T = 6.2832;
  const borde = c => { c.lineWidth = 3; c.strokeStyle = OL; c.lineJoin = 'round'; };
  const caja = (c, x, y, w, h, r, col) => { c.fillStyle = col; c.beginPath(); rrPath(c, x, y, w, h, r); c.fill(); c.stroke(); };
  const bola = (c, x, y, r, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, T); c.fill(); c.stroke(); };
  const ruedas = (c, xs, r, col, t) => xs.forEach(x => { bola(c, x, -r, r, col); c.fillStyle = OL; c.fillRect(x - 1, -r - r * 0.6, 2, r * 1.2); });
  const orugas = (c, col) => { caja(c, -25, -10, 50, 11, 5.5, col); c.fillStyle = '#a99ac4'; for (let i = -16; i <= 16; i += 11) { c.beginPath(); c.arc(i, -4.5, 3.4, 0, T); c.fill(); } };
  const bandera = (c, x, y, E) => {   // el banderín del equipo: así se ve de qué lado es cada uno
    c.fillStyle = OL; c.fillRect(x - 1, y - 18, 2.5, 18);
    c.fillStyle = E.color; c.beginPath(); c.moveTo(x + 1, y - 18); c.lineTo(x + 13, y - 14); c.lineTo(x + 1, y - 10); c.closePath(); c.fill(); c.stroke();
  };
  const ojo = (c, x, y, r, col) => { c.fillStyle = '#fff'; c.beginPath(); c.arc(x, y, r, 0, T); c.fill(); c.stroke(); c.fillStyle = col || OL; c.beginPath(); c.arc(x + r * 0.3, y, r * 0.5, 0, T); c.fill(); };

  const D = {
    tapacubos(c, k, E) {   // furgoneta oxidada con el mapache al volante y la cola por la ventana
      ruedas(c, [-15, 15], 7, '#3a3a44');
      caja(c, -26, -32, 50, 22, 6, k[0]);
      c.fillStyle = '#6b4a2e'; c.beginPath(); c.arc(-14, -20, 4, 0, T); c.arc(4, -15, 3, 0, T); c.fill();   // óxido
      caja(c, 6, -29, 15, 10, 3, '#bfe8ff');
      bola(c, 14, -24, 5, k[1]); c.fillStyle = OL; c.fillRect(10, -26, 8, 2.6);   // el antifaz del mapache
      c.save(); c.translate(-26, -24); c.rotate(-0.5); caja(c, -14, -4, 16, 8, 4, k[1]); c.fillStyle = OL; c.fillRect(-10, -4, 3, 8); c.fillRect(-4, -4, 3, 8); c.restore();
      bandera(c, -20, -32, E);
    },
    ataud(c, k, E, t) {   // ataúd con ruedas de carro y dos velas
      ruedas(c, [-16, 16], 8, '#6b4a2e');
      c.fillStyle = k[0]; c.beginPath(); c.moveTo(-26, -16); c.lineTo(-18, -30); c.lineTo(20, -30); c.lineTo(27, -16); c.lineTo(20, -9); c.lineTo(-18, -9); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = k[1]; c.fillRect(-2, -27, 4, 16); c.fillRect(-7, -22, 14, 4);   // la cruz
      for (const x of [-15, 14]) {
        caja(c, x - 2.5, -40, 5, 10, 1.5, '#f4ecd8');
        c.fillStyle = Math.sin(t * 14 + x) > 0 ? k[2] : '#ffe96b'; c.beginPath(); c.ellipse(x, -44, 2.4, 3.6, 0, 0, T); c.fill();
      }
      bandera(c, -22, -24, E);
    },
    antena(c, k, E, t) {   // plataforma con una parabólica y luces de neón
      orugas(c, '#1a2030');
      caja(c, -22, -24, 44, 15, 6, k[0]);
      c.fillStyle = Math.sin(t * 8) > 0 ? k[1] : k[2]; for (let i = -14; i <= 14; i += 9) c.fillRect(i - 2, -19, 4, 3);
      c.save(); c.translate(-12, -26); c.rotate(-0.6);
      c.fillStyle = '#d8e4f0'; c.beginPath(); c.arc(0, -8, 11, 0.2, Math.PI - 0.2); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = OL; c.fillRect(-1, -8, 2.5, -10); bola(c, 0.3, -19, 2.6, k[1]); c.restore();
      bandera(c, 18, -24, E);
    },
    gatotanque(c, k, E, t) {   // un gato gordísimo montado en orugas, con cara de meme
      orugas(c, '#5b3d8a');
      c.fillStyle = k[0]; c.beginPath(); c.ellipse(0, -21, 24, 14, 0, 0, T); c.fill(); c.stroke();
      for (const s of [-1, 1]) { c.fillStyle = k[0]; c.beginPath(); c.moveTo(s * 8 + 4, -31); c.lineTo(s * 14 + 4, -42); c.lineTo(s * 18 + 4, -29); c.fill(); c.stroke(); }
      c.fillStyle = '#e8a92a'; c.fillRect(-14, -30, 4, 6); c.fillRect(-6, -32, 4, 6);   // rayas
      ojo(c, 8, -24, 4); ojo(c, 18, -24, 4);
      c.strokeStyle = OL; c.lineWidth = 2; c.beginPath(); c.moveTo(10, -16); c.quadraticCurveTo(13, -13, 16, -16); c.stroke();
      c.fillStyle = k[1]; c.beginPath(); c.arc(13, -18, 1.8, 0, T); c.fill();
      borde(c); bandera(c, -22, -26, E);
    },
    carroza(c, k, E, t) {   // carroza con pantalla de directo y focos
      ruedas(c, [-16, 16], 7, '#2a2a3a');
      caja(c, -26, -24, 52, 15, 5, k[0]);
      caja(c, -14, -42, 28, 18, 3, OL);
      c.fillStyle = k[1]; c.fillRect(-11, -39, 22, 12);
      c.fillStyle = Math.sin(t * 5) > 0 ? '#ff4b5c' : '#fff'; c.beginPath(); c.arc(-7, -35, 2.4, 0, T); c.fill();   // el puntito de EN DIRECTO
      c.fillStyle = k[2]; for (const x of [-20, 20]) { c.beginPath(); c.arc(x, -27, 3.5, 0, T); c.fill(); c.stroke(); }
      bandera(c, 22, -42, E);
    },
    carro(c, k, E) {   // carro griego de bronce con un escudo redondo y un caballo de bronce delante
      ruedas(c, [-12], 11, k[0]);
      c.fillStyle = k[0]; c.beginPath(); c.moveTo(-24, -12); c.lineTo(-24, -30); c.quadraticCurveTo(-8, -36, 6, -24); c.lineTo(6, -12); c.closePath(); c.fill(); c.stroke();
      bola(c, -12, -22, 7, k[1]); bola(c, -12, -22, 2.5, k[2]);
      c.fillStyle = '#b08a2a'; c.beginPath(); c.moveTo(6, -14); c.lineTo(22, -18); c.lineTo(26, -32); c.lineTo(20, -36); c.lineTo(14, -24); c.lineTo(6, -22); c.closePath(); c.fill(); c.stroke();   // el caballo
      c.fillStyle = k[1]; c.fillRect(17, -38, 3, 6);
      c.fillStyle = OL; c.fillRect(14, -14, 2.5, 14); c.fillRect(22, -14, 2.5, 14);
      bandera(c, -22, -30, E);
    },
    silla(c, k, E, t) {   // silla gamer con orugas y luces RGB
      orugas(c, '#1a1a24');
      caja(c, -16, -20, 34, 9, 4, k[0]);
      caja(c, -20, -46, 12, 30, 5, k[0]);   // el respaldo
      c.fillStyle = `hsl(${(t * 160) % 360},90%,60%)`; c.fillRect(-17, -42, 6, 22); c.fillRect(-12, -17, 26, 3);
      caja(c, 6, -30, 14, 5, 2.5, k[1]);   // el reposabrazos
      bandera(c, 0, -20, E);
    },
    drakkar(c, k, E) {   // barco vikingo de píxeles, con vela de rayas y cabeza de dragón
      ruedas(c, [-14, 14], 6, '#3a2a20');
      c.fillStyle = k[0]; c.beginPath(); c.moveTo(-28, -24); c.lineTo(-20, -10); c.lineTo(20, -10); c.lineTo(28, -24); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#e8e0c8'; for (let x = -16; x <= 12; x += 9) { c.beginPath(); c.arc(x, -17, 3.4, 0, T); c.fill(); c.stroke(); }   // escudos
      c.fillStyle = OL; c.fillRect(-2, -48, 3, 26);
      for (let i = 0; i < 4; i++) { c.fillStyle = i % 2 ? k[2] : k[1]; c.fillRect(-14, -46 + i * 5, 26, 5); }
      c.strokeRect(-14, -46, 26, 20);
      c.fillStyle = '#5e8a3a'; c.fillRect(26, -34, 6, 10); c.fillRect(30, -36, 6, 5); c.strokeRect(26, -34, 6, 10);   // la cabeza de dragón, en píxeles
      bandera(c, -24, -26, E);
    },
    grua(c, k, E, t) {   // grúa de rodaje con su cámara y un foco
      ruedas(c, [-16, 16], 7, '#2a2a2a');
      caja(c, -24, -20, 48, 11, 4, k[0]);
      c.fillStyle = k[1]; c.save(); c.translate(-14, -20); c.rotate(-0.7); c.fillRect(0, -3, 34, 6); c.strokeRect(0, -3, 34, 6); c.restore();
      caja(c, 6, -48, 16, 11, 3, OL); bola(c, 24, -43, 4, '#5b5f66');   // la cámara
      c.fillStyle = k[2]; c.beginPath(); c.arc(10, -51, 2, 0, T); c.fill();
      c.fillStyle = 'rgba(255,240,170,.35)'; c.beginPath(); c.moveTo(-20, -24); c.lineTo(-34, -48); c.lineTo(-16, -50); c.closePath(); c.fill();
      bola(c, -20, -26, 4, '#ffe96b');
      bandera(c, -22, -20, E);
    },
  };
  // dibuja el cuerpo; si el móvil no tiene dibujo propio, el genérico (orugas y caja con el color del equipo)
  function pinta(c, m, E, t) {
    borde(c);
    const f = D[m.def.id];
    if (f) return f(c, m.def.colores, E, t);
    orugas(c, '#3a2a4a'); caja(c, -20, -25, 40, 17, 7, E.color);
  }
  return { pinta };
})();
