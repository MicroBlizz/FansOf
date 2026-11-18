// Fans of Spy · ADAPTADORES · Los dibujos en plano, hechos por código en un lienzo 2D con trazo negro gordo (aire de cómic): la
// ilustración de cada carta (120 x 84) y las caras (64 x 64) de la barra de turnos (CrazyBunny, el Becario, el vigilante y la cámara) y de Lola.
// Son provisionales: el arte de verdad lo hará Yoshi cuando el prototipo guste. SPY.iconos.carta(lienzo, id) y .cara(lienzo, tipo).
'use strict';
var SPY = globalThis.SPY || (globalThis.SPY = {});
(function (S) {
  const TINTA = '#11131c', BLANCO = '#f4f1ea', NARANJA = '#ff8a2a', CARTON = '#c9935a', ROJO = '#e5484d', AMARILLO = '#ffd23f', AZUL = '#3fa2ff', VERDE = '#3ddc84', METAL = '#eef1f5';
  let g = null;

  const pluma = (ancho = 5) => { g.lineWidth = ancho; g.strokeStyle = TINTA; g.lineJoin = 'round'; g.lineCap = 'round'; };
  const pinta = (color) => { if (color) { g.fillStyle = color; g.fill(); } g.stroke(); };
  // Un rectángulo de esquinas redondas (rectas en los navegadores que aún no saben redondearlas).
  function caja(x, y, w, h, r, color) { g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); pinta(color); }
  function bola(x, y, rx, ry, color, giro = 0) { g.beginPath(); g.ellipse(x, y, rx, ry, giro, 0, Math.PI * 2); pinta(color); }
  function forma(puntos, color, cierra = true) { g.beginPath(); puntos.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); if (cierra) g.closePath(); pinta(color); }
  const raya = (x0, y0, x1, y1) => forma([[x0, y0], [x1, y1]], null, false);
  // Una estrella de golpe: picos largos y cortos alrededor de un punto.
  function estrella(x, y, r, color, picos = 8) {
    const p = [];
    for (let i = 0; i < picos * 2; i++) { const a = i / (picos * 2) * Math.PI * 2, k = i % 2 ? r * 0.5 : r; p.push([x + Math.cos(a) * k, y + Math.sin(a) * k]); }
    forma(p, color);
  }
  function vaho(x, y) { for (const dx of [-9, 0, 9]) { g.beginPath(); g.moveTo(x + dx, y); g.quadraticCurveTo(x + dx - 6, y - 8, x + dx, y - 16); g.stroke(); } }
  function taza(x, y, color) { forma([[x - 16, y - 20], [x + 16, y - 20], [x + 12, y + 20], [x - 12, y + 20]], color); caja(x - 18, y - 26, 36, 8, 3, '#6b3f1d'); }
  function zanahoria(x, y, k) { forma([[x - 14 * k, y - 10 * k], [x + 14 * k, y - 10 * k], [x, y + 34 * k]], NARANJA); forma([[x - 8 * k, y - 10 * k], [x - 12 * k, y - 26 * k], [x, y - 14 * k], [x + 12 * k, y - 26 * k], [x + 8 * k, y - 10 * k]], VERDE); }

  const CARTAS = {
    puntillas() { for (const [x, y] of [[44, 54], [76, 34]]) { bola(x, y, 10, 17, BLANCO, 0.25); for (const d of [-9, 0, 9]) bola(x + d + 5, y - 23, 3.5, 4.5, BLANCO); } },
    carrera() { bola(66, 46, 30, 15, NARANJA, -0.2); caja(70, 26, 22, 16, 5, BLANCO); pluma(4); for (const y of [30, 46, 62]) raya(8, y, 30, y); },
    caja() { for (const x of [48, 70]) bola(x, 22, 6, 16, BLANCO, (x - 59) / 60); caja(30, 30, 60, 44, 4, CARTON); caja(52, 30, 16, 44, 0, '#ecd2a6'); },
    golpe() { caja(70, 8, 40, 68, 2, '#51628f'); pluma(3); for (const y of [30, 52]) raya(70, y, 110, y); raya(90, 8, 90, 30); raya(84, 52, 84, 76); pluma(); estrella(52, 42, 28, AMARILLO); },
    cafe() { pluma(4); vaho(60, 22); pluma(); taza(60, 50, BLANCO); },
    grapadora() { forma([[20, 60], [100, 60], [104, 72], [20, 72]], '#51628f'); forma([[18, 54], [22, 40], [96, 22], [104, 34], [30, 58]], ROJO); bola(26, 56, 6, 6, AMARILLO); },
    lanzapelotas() { forma([[14, 58], [70, 30], [80, 50], [24, 76]], '#51628f'); caja(8, 56, 22, 22, 4, TINTA); bola(96, 28, 13, 13, AMARILLO); pluma(4); raya(74, 20, 84, 24); raya(78, 44, 88, 42); },
    maquina() { taza(60, 46, BLANCO); pluma(7); g.strokeStyle = VERDE; raya(60, 34, 60, 56); raya(49, 45, 71, 45); },
    descanso() { bola(60, 44, 28, 28, BLANCO); pluma(6); raya(60, 44, 60, 26); raya(60, 44, 74, 50); pluma(); bola(36, 16, 8, 8, AMARILLO); bola(84, 16, 8, 8, AMARILLO); },
    agenda() { caja(34, 10, 56, 66, 5, AZUL); caja(44, 22, 36, 14, 3, BLANCO); pluma(4); for (const y of [20, 34, 48, 62]) raya(28, y, 40, y); },
    plano() { forma([[16, 20], [44, 12], [76, 22], [104, 12], [104, 64], [76, 74], [44, 64], [16, 72]], BLANCO); pluma(3); raya(44, 12, 44, 64); raya(76, 22, 76, 74); pluma(5); g.strokeStyle = ROJO; g.setLineDash([7, 7]); forma([[26, 56], [50, 38], [70, 52], [94, 30]], null, false); g.setLineDash([]); },
    carro() { forma([[24, 22], [96, 22], [88, 56], [32, 56]], CARTON); caja(46, 12, 28, 14, 3, BLANCO); for (const x of [40, 80]) bola(x, 66, 9, 9, TINTA); pluma(4); raya(96, 22, 110, 12); },
    zanahoriazo() { estrella(40, 46, 30, AMARILLO); g.save(); g.translate(72, 34); g.rotate(0.6); zanahoria(0, 0, 1.15); g.restore(); },
  };

  // La cabeza de un Becario: con gorra si es el vigilante.
  function robot(gorra) {
    raya(32, 8, 32, 18); bola(32, 7, 4, 4, AZUL);
    caja(10, 18, 44, 34, 8, METAL); caja(15, 26, 34, 15, 5, '#0c1020');
    g.fillStyle = AZUL; g.fillRect(20, 30, 8, 7); g.fillRect(36, 30, 8, 7);
    if (gorra) { caja(8, 12, 48, 11, 4, '#1b2a5c'); caja(26, 14, 12, 6, 2, AMARILLO); }
  }
  const CARAS = {
    agente() { for (const x of [22, 42]) bola(x, 16, 6, 15, BLANCO, (x - 32) / 40); bola(32, 40, 21, 18, BLANCO); caja(11, 32, 42, 11, 4, '#ff7a1a'); bola(32, 49, 3, 2.5, '#ff8fa3'); },
    becario: () => robot(false),
    vigilante: () => robot(true),
    // Lola, con los cascos y el micro de la radio
    lola() {
      bola(32, 30, 23, 24, '#c2410c'); bola(32, 36, 16, 17, '#ffd9b3');
      forma([[14, 30], [20, 14], [34, 10], [46, 14], [50, 30], [42, 22], [28, 24], [20, 22]], '#c2410c');
      pluma(4); g.beginPath(); g.arc(32, 28, 25, Math.PI * 1.08, Math.PI * 1.92); g.stroke();
      pluma(); caja(3, 26, 10, 17, 4, AMARILLO); caja(51, 26, 10, 17, 4, AMARILLO);
      pluma(3); forma([[8, 43], [10, 52], [22, 53]], null, false); bola(24, 53, 3.5, 3, TINTA);
      g.fillStyle = TINTA; g.fillRect(24, 33, 4, 6); g.fillRect(36, 33, 4, 6);
      pluma(3); g.beginPath(); g.arc(32, 42, 6, Math.PI * 0.15, Math.PI * 0.85); g.stroke();
    },
    camara() { caja(12, 22, 34, 22, 5, METAL); forma([[46, 26], [58, 20], [58, 46], [46, 40]], '#0c1020'); bola(20, 30, 3.5, 3.5, ROJO); raya(26, 44, 26, 56); raya(16, 56, 36, 56); },
  };

  function dibuja(lienzo, tabla, id, ancho, alto) {
    lienzo.width = ancho; lienzo.height = alto;
    g = lienzo.getContext('2d');
    g.clearRect(0, 0, ancho, alto);
    pluma();
    if (tabla[id]) tabla[id]();
  }
  S.iconos = Object.freeze({ carta: (lienzo, id) => dibuja(lienzo, CARTAS, id, 120, 84), cara: (lienzo, tipo) => dibuja(lienzo, CARAS, tipo, 64, 64) });
})(SPY);
