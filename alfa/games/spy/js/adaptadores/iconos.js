// Fans of Spy · ADAPTADORES · Las caras de la barra de turnos (CrazyBunny, el Becario, el vigilante y la cámara) y la de Lola.
// Son ilustraciones de Yoshi (img/caras/, webp con fondo transparente), recortadas a la cabeza cuando el dibujo es de cuerpo entero.
// Hasta que llega la imagen (o si no llega) se ven las de repuesto, hechas por código en un lienzo 2D con trazo negro gordo.
// Las ilustraciones de las cartas también son suyas (img/cartas/). SPY.iconos.cara(lienzo, tipo).
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

  // Las ilustraciones de Yoshi. Recorte: la parte del dibujo (en fracciones de su ancho) que se ve dentro del círculo.
  const RECORTE = { agente: [0.19, 0.0, 0.62], becario: [0.19, 0.0, 0.62], vigilante: [0.19, 0.0, 0.62], camara: [0.05, 0.05, 0.9], lola: [0.05, 0.05, 0.9] };
  const IMAGEN = {}, PINTADOS = new Map();   // tipo -> imagen lista; lienzo -> tipo (para repintar los que esperaban)
  function carga(tipo) {
    const img = new Image();
    img.onload = () => {
      IMAGEN[tipo] = img;
      for (const [lienzo, t] of PINTADOS) { if (!lienzo.isConnected) PINTADOS.delete(lienzo); else if (t === tipo) dibuja(lienzo, t); }   // los que ya no están en pantalla se olvidan
    };
    img.onerror = () => { IMAGEN[tipo] = null; };   // sin imagen: se queda la de código
    img.src = 'img/caras/' + tipo + '.webp?v=' + SPY.AJ.version;
  }
  for (const t of Object.keys(RECORTE)) carga(t);

  function dibuja(lienzo, tipo) {
    const ancho = 96;
    lienzo.width = ancho; lienzo.height = ancho;
    g = lienzo.getContext('2d');
    g.clearRect(0, 0, ancho, ancho);
    const img = IMAGEN[tipo];
    if (img) { const r = RECORTE[tipo], lado = r[2] * img.naturalWidth; g.drawImage(img, r[0] * img.naturalWidth, r[1] * img.naturalHeight, lado, lado, 0, 0, ancho, ancho); return; }
    g.save(); g.scale(ancho / 64, ancho / 64);
    pluma();
    if (CARAS[tipo]) CARAS[tipo]();
    g.restore();
  }
  S.iconos = Object.freeze({ cara: (lienzo, tipo) => { PINTADOS.set(lienzo, tipo); dibuja(lienzo, tipo); } });
})(SPY);
