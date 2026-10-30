// Fans Of Decks · Fondos de cada tipo de cita, dibujados en canvas con el estilo de la serie (formas planas, contorno grueso), al aire de los escenarios de Rouflage:
// la sala de reuniones, la sala de dirección, el despacho del jefe, la cafetería, el almacén del Economato y el despacho del correo. dcPonFondo(seccion, tipo) lo coloca detrás.
// Se dibuja en un espacio de 540×960 y se escala al escenario; la mitad de abajo se oscurece para que las cartas se lean.
'use strict';
const DC_FONDOS = {};
const DCF_OL = '#20102c';
function dcfRect(c, x, y, w, h, fill, lw) { c.fillStyle = fill; c.fillRect(x, y, w, h); if (lw) { c.lineWidth = lw; c.strokeStyle = DCF_OL; c.strokeRect(x, y, w, h); } }
function dcfPoli(c, pts, fill, lw) { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fillStyle = fill; c.fill(); if (lw) { c.lineWidth = lw; c.strokeStyle = DCF_OL; c.stroke(); } }
function dcfElipse(c, x, y, rx, ry, fill, lw) { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fillStyle = fill; c.fill(); if (lw) { c.lineWidth = lw; c.strokeStyle = DCF_OL; c.stroke(); } }
function dcfRaya(c, x1, y1, x2, y2, color, lw) { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.strokeStyle = color; c.lineWidth = lw; c.lineCap = 'round'; c.stroke(); }
// Pared y suelo con perspectiva: la línea del suelo a `h` y el zócalo. Devuelve nada; el resto se pinta encima.
function dcfSala(c, pared, suelo, zocalo, h) {
  dcfRect(c, 0, 0, 540, h, pared);
  dcfRect(c, 0, h, 540, 960 - h, suelo);
  dcfRect(c, 0, h - 14, 540, 14, zocalo, 3);
  // las tablas o baldosas del suelo en perspectiva
  c.strokeStyle = 'rgba(32,16,44,0.25)'; c.lineWidth = 2;
  for (let i = -3; i <= 9; i++) { c.beginPath(); c.moveTo(i * 90, h); c.lineTo(270 + (i * 90 - 270) * 2.4, 960); c.stroke(); }
  for (let k = 0; k < 6; k++) { const y = h + 18 * k * (k + 1) / 1.4; c.beginPath(); c.moveTo(0, y); c.lineTo(540, y); c.stroke(); }
}
function dcfVentana(c, x, y, w, h, noche) {
  dcfRect(c, x, y, w, h, noche ? '#1a1f4a' : '#9fd8ff', 5);
  if (noche) { for (let i = 0; i < 7; i++) { const bw = 14 + (i * 7) % 20, bh = 30 + (i * 23) % 60; dcfRect(c, x + 8 + i * (w - 20) / 7, y + h - bh - 6, bw, bh, '#2b2f66'); for (let j = 0; j < 3; j++) dcfRect(c, x + 11 + i * (w - 20) / 7, y + h - bh + 4 + j * 12, 4, 5, (i + j) % 3 ? '#ffe9a8' : '#2b2f66'); } }
  else { dcfElipse(c, x + w * 0.3, y + h * 0.35, 26, 12, '#fff'); dcfElipse(c, x + w * 0.72, y + h * 0.55, 32, 13, '#fff'); for (let i = 0; i < 5; i++) dcfRect(c, x + 6 + i * (w - 12) / 5, y + h - 30 - (i * 13) % 30, (w - 12) / 5 - 6, 40, '#6fa6cf'); }
  dcfRaya(c, x + w / 2, y, x + w / 2, y + h, DCF_OL, 4); dcfRaya(c, x, y + h / 2, x + w, y + h / 2, DCF_OL, 4);
}
function dcfPlanta(c, x, y, s) { dcfPoli(c, [[x - 14 * s, y], [x + 14 * s, y], [x + 10 * s, y + 26 * s], [x - 10 * s, y + 26 * s]], '#b8602a', 3); for (let i = -2; i <= 2; i++) dcfElipse(c, x + i * 9 * s, y - 14 * s - Math.abs(i) * 4 * s, 9 * s, 16 * s, i % 2 ? '#2f8a1c' : '#4caf2a', 3); }
function dcfSilla(c, x, y, s, color) { dcfRect(c, x - 16 * s, y - 40 * s, 32 * s, 30 * s, color, 3); dcfRect(c, x - 18 * s, y - 12 * s, 36 * s, 10 * s, color, 3); dcfRaya(c, x, y - 2 * s, x, y + 14 * s, DCF_OL, 4); dcfRaya(c, x - 14 * s, y + 16 * s, x + 14 * s, y + 16 * s, DCF_OL, 4); }
function dcfMesa(c, x, y, w, d, color, patas) {
  dcfPoli(c, [[x - w / 2 + 30, y - d], [x + w / 2 - 30, y - d], [x + w / 2, y], [x - w / 2, y]], color, 4);
  dcfRect(c, x - w / 2, y, w, 10, color, 3);
  if (patas) { dcfRect(c, x - w / 2 + 12, y + 10, 10, 50, '#5a3a22', 3); dcfRect(c, x + w / 2 - 22, y + 10, 10, 50, '#5a3a22', 3); }
}
// ---------- los escenarios ----------
const DC_ESCENAS = {
  // la sala de reuniones: pizarra blanca con garabatos, ventana, mesa larga y sillas
  sala(c) {
    dcfSala(c, '#8fa3c7', '#6d5a8a', '#4a3a6a', 430);
    dcfVentana(c, 330, 60, 170, 150, false);
    dcfRect(c, 40, 70, 230, 140, '#f3efe6', 5); dcfRect(c, 40, 200, 230, 12, '#c9c1b2', 3);
    for (let i = 0; i < 4; i++) dcfRaya(c, 60, 100 + i * 24, 60 + 80 + (i * 37) % 90, 100 + i * 24, ['#d43cff', '#ff7a1a', '#1d5fc9', '#2f8a1c'][i], 4);
    dcfPoli(c, [[190, 185], [215, 150], [235, 170], [255, 120]], 'rgba(0,0,0,0)', 0); c.strokeStyle = '#ff4b5c'; c.lineWidth = 4; c.stroke();
    dcfPlanta(c, 505, 400, 1.1);
    for (let i = 0; i < 4; i++) dcfSilla(c, 95 + i * 118, 395, 0.9, '#3b2a5a');
    dcfMesa(c, 270, 445, 440, 36, '#a86a3a', false);
  },
  // la sala de dirección: paneles de madera, retrato, alfombra roja y butacas
  elite(c) {
    dcfSala(c, '#6b3f2a', '#3a2a4a', '#2a1a2a', 430);
    for (let i = 0; i < 5; i++) dcfRect(c, 20 + i * 104, 40, 84, 340, '#7d4a30', 3);
    dcfRect(c, 200, 70, 140, 170, '#d9b24a', 6); dcfRect(c, 214, 84, 112, 142, '#1e1430', 3);
    dcfElipse(c, 270, 150, 26, 30, '#f2d3b0', 3); dcfRect(c, 236, 180, 68, 46, '#2a1a4a', 3); dcfRaya(c, 250, 120, 290, 120, DCF_OL, 5);
    dcfPoli(c, [[60, 440], [480, 440], [540, 700], [0, 700]], '#9c1c2a', 0); dcfPoli(c, [[80, 440], [460, 440], [510, 700], [30, 700]], '#b8232f', 0);
    for (let i = 0; i < 3; i++) dcfSilla(c, 140 + i * 130, 400, 1, '#5a1a1a');
    dcfMesa(c, 270, 445, 460, 40, '#4a2a16', false);
  },
  // el despacho del jefe: noche, ventanal, escritorio enorme, trofeo y lucecita roja
  jefe(c) {
    dcfSala(c, '#2b2340', '#1f1630', '#140c20', 430);
    dcfVentana(c, 60, 40, 420, 240, true);
    c.fillStyle = 'rgba(255,75,92,0.12)'; c.fillRect(0, 0, 540, 430);
    dcfMesa(c, 270, 450, 480, 50, '#3a2214', false);
    dcfRect(c, 80, 410, 60, 36, '#2a1a4a', 3); dcfRect(c, 86, 416, 48, 22, '#5aaeff', 2);   // un portátil encendido
    dcfRect(c, 400, 392, 18, 44, '#ffcb3d', 3); dcfElipse(c, 409, 388, 16, 12, '#ffcb3d', 3); dcfRect(c, 394, 436, 30, 8, '#8a6a12', 3);   // el trofeo
    dcfRect(c, 200, 418, 140, 22, '#e8dcc0', 3); dcfRaya(c, 215, 429, 325, 429, DCF_OL, 3);   // la placa con el nombre
    dcfElipse(c, 505, 60, 6, 6, '#ff4b5c', 0); c.fillStyle = 'rgba(255,75,92,0.35)'; c.beginPath(); c.arc(505, 60, 16, 0, Math.PI * 2); c.fill();
  },
  // la cafetería de oficina: mostrador, cafetera, taburetes, máquina de vending y una planta
  pausa(c) {
    dcfSala(c, '#e8c89a', '#c98a4a', '#8a4a1c', 430);
    for (let y = 60; y < 400; y += 40) for (let x = (y / 40) % 2 ? 0 : 30; x < 540; x += 60) dcfRect(c, x, y, 56, 36, y % 80 ? '#f0d6ad' : '#e3bf8d');
    dcfRect(c, 390, 120, 120, 300, '#d43cff', 5); dcfRect(c, 402, 134, 96, 180, '#2a1040', 3);
    for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) dcfRect(c, 410 + i * 30, 142 + j * 56, 22, 44, ['#ff7a1a', '#ffcb3d', '#7be04a', '#5aaeff'][(i + j) % 4], 2);
    dcfRect(c, 402, 326, 96, 30, '#3a2060', 3);
    dcfRect(c, 30, 330, 320, 110, '#5a3a22', 4); dcfRect(c, 20, 318, 340, 20, '#8a5a32', 4);
    dcfRect(c, 60, 250, 90, 70, '#3a3a4a', 4); dcfRect(c, 70, 262, 70, 24, '#5aaeff', 2); dcfRect(c, 88, 290, 34, 26, '#f3efe6', 3);   // la cafetera y su taza
    for (let i = 0; i < 4; i++) { dcfRect(c, 190 + i * 36, 296, 26, 22, ['#ff4b5c', '#7be04a', '#ffcb3d', '#f3a6ff'][i], 3); dcfRaya(c, 216 + i * 36, 300, 222 + i * 36, 312, DCF_OL, 3); }
    dcfPlanta(c, 370, 400, 0.9);
    for (let i = 0; i < 3; i++) { dcfElipse(c, 90 + i * 110, 466, 30, 10, '#ff7a1a', 3); dcfRaya(c, 90 + i * 110, 476, 90 + i * 110, 520, DCF_OL, 5); }
  },
  // el almacén de Lola: estanterías metálicas con cajas, etiquetas de precio y una bombilla
  economato(c) {
    dcfSala(c, '#6a6a7a', '#4a4a5a', '#2a2a3a', 430);
    dcfRaya(c, 270, 0, 270, 70, DCF_OL, 4); dcfElipse(c, 270, 90, 20, 24, '#ffe9a8', 4); c.fillStyle = 'rgba(255,233,168,0.12)'; c.beginPath(); c.arc(270, 90, 150, 0, Math.PI * 2); c.fill();
    for (const x of [30, 300]) {
      for (let j = 0; j < 3; j++) { dcfRect(c, x, 150 + j * 95, 210, 12, '#9aa0b4', 3); }
      dcfRect(c, x, 140, 10, 300, '#7a8094', 3); dcfRect(c, x + 200, 140, 10, 300, '#7a8094', 3);
      for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) { const w = 46 + ((i + j * 3) % 3) * 10, h = 40 + ((i * 2 + j) % 3) * 12, bx = x + 16 + i * 62; dcfRect(c, bx, 150 + j * 95 - h, w, h, (i + j) % 2 ? '#c98a4a' : '#b8713a', 3); dcfRaya(c, bx + w / 2, 150 + j * 95 - h, bx + w / 2, 150 + j * 95, '#8a5a32', 4); if ((i + j) % 3 === 0) { dcfRect(c, bx + 6, 150 + j * 95 - h + 8, 22, 14, '#ffcb3d', 2); } }
    }
    dcfRect(c, 160, 350, 220, 90, '#8a5a32', 4); dcfRect(c, 150, 340, 240, 18, '#a86a3a', 4);
    dcfRect(c, 190, 300, 60, 40, '#3a3a4a', 3); dcfRect(c, 196, 306, 48, 20, '#7be04a', 2);   // la caja registradora
    dcfRect(c, 290, 310, 70, 30, '#f3efe6', 3); dcfRaya(c, 300, 325, 350, 325, '#ff4b5c', 4);   // el cartel de ofertas
  },
  // el despacho del correo: mesa con monitor y sobre, lámpara, pósits en la pared y el ficus
  correo(c) {
    dcfSala(c, '#a7b8c9', '#7a6a9a', '#4a3a6a', 430);
    dcfRect(c, 50, 50, 300, 200, '#d8cfbf', 5);
    const colores = ['#ffcb3d', '#f3a6ff', '#7be04a', '#5aaeff', '#ff7a1a'];
    for (let i = 0; i < 10; i++) { const x = 70 + (i % 5) * 54, y = 70 + Math.floor(i / 5) * 80; c.save(); c.translate(x + 20, y + 20); c.rotate(((i * 7) % 5 - 2) * 0.08); dcfRect(c, -20, -20, 40, 40, colores[i % 5], 2); dcfRaya(c, -12, -6, 12, -6, DCF_OL, 2); dcfRaya(c, -12, 4, 8, 4, DCF_OL, 2); c.restore(); }
    dcfVentana(c, 390, 60, 120, 140, false);
    dcfMesa(c, 270, 445, 440, 30, '#c9a070', false);
    dcfRect(c, 150, 300, 160, 110, '#2a2a3a', 5); dcfRect(c, 160, 310, 140, 90, '#1d5fc9', 2);
    dcfRect(c, 195, 330, 70, 50, '#f3efe6', 3); dcfPoli(c, [[195, 330], [230, 360], [265, 330]], '#f3efe6', 3);   // el sobre en pantalla
    dcfRect(c, 215, 410, 30, 20, '#2a2a3a', 3); dcfRect(c, 190, 428, 80, 10, '#2a2a3a', 3);
    dcfRaya(c, 420, 420, 420, 330, DCF_OL, 6); dcfPoli(c, [[380, 330], [460, 330], [440, 290], [400, 290]], '#ffcb3d', 4);   // la lámpara
    dcfPlanta(c, 60, 405, 1);
  },
};
// El lienzo de un escenario al tamaño del escenario, con la mitad de abajo oscurecida (caché por tipo y tamaño).
function dcFondo(tipo, w, h) {
  const id = tipo + ':' + w + 'x' + h;
  if (!DC_FONDOS[id]) {
    const r = Math.min(2, window.devicePixelRatio || 1), cv = document.createElement('canvas');
    cv.width = Math.round(w * r); cv.height = Math.round(h * r); cv.className = 'dc-fondo';
    const c = cv.getContext('2d'); c.scale(r, r); c.scale(w / 540, h / 960);
    (DC_ESCENAS[tipo] || DC_ESCENAS.sala)(c);
    const g = c.createLinearGradient(0, 0, 0, 960); g.addColorStop(0, 'rgba(18,10,30,0.35)'); g.addColorStop(0.42, 'rgba(18,10,30,0.45)'); g.addColorStop(0.62, 'rgba(18,10,30,0.88)'); g.addColorStop(1, 'rgba(18,10,30,0.97)');
    c.fillStyle = g; c.fillRect(0, 0, 540, 960);
    DC_FONDOS[id] = cv;
  }
  return DC_FONDOS[id];
}
// Pone el fondo `tipo` detrás de la sección (o lo quita si tipo es null). Los tramos de reunión se traducen a su sala.
const DC_FONDO_TRAMO = { facil: 'sala', normal: 'sala', elite: 'elite', minijefe: 'elite', jefe: 'jefe', pausa: 'pausa', economato: 'economato', correo: 'correo' };
function dcPonFondo(seccion, tipo) {
  const viejo = seccion.querySelector(':scope > .dc-fondo'); if (viejo) viejo.remove();
  if (!tipo) return;
  const st = document.getElementById('stage'), w = st.clientWidth || 540, h = st.clientHeight || 960;
  const cv = dcFondo(DC_FONDO_TRAMO[tipo] || tipo, w, h), n = document.createElement('canvas');
  n.width = cv.width; n.height = cv.height; n.className = 'dc-fondo' + (seccion.id === 'dc-combate' ? '' : ' dc-fondo-tenue'); n.getContext('2d').drawImage(cv, 0, 0);
  seccion.prepend(n);
}
