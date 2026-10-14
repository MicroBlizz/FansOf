// Fans of Rouflage (prototipo) · LOS SUELOS: un dibujo geométrico por sala, con «ruido» (baldosas gastadas, manchas, rejillas) para
// que camuflarse tenga gracia. Todo va alineado a la cuadrícula del mundo y usa azar repetible: el mapa se pinta varias veces
// (en pantalla, para leer colores y ampliado al pintarse) y tiene que salir siempre igual. Cada dibujo recibe la zona y el trozo
// que hay que pintar (R), y solo recorre las baldosas de ese trozo.
'use strict';

// de qué baldosa a qué baldosa (de lado T) hay que pintar: [i0, i1, j0, j1]
function rango(z, R, T) {
  return [Math.floor(Math.max(z.px, R.x0) / T), Math.ceil(Math.min(z.px + z.pw, R.x1) / T), Math.floor(Math.max(z.py, R.y0) / T), Math.ceil(Math.min(z.py + z.ph, R.y1) / T)];
}
// franjas de peligro (amarillo y azul oscuro en diagonal) dentro de un rectángulo
function peligro(c, x, y, w, h, paso = 20) {
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  c.fillStyle = '#f2c230'; c.fillRect(x, y, w, h);
  c.fillStyle = '#262b4a';
  const k0 = Math.floor((x - y - h) / paso) - 1, k1 = Math.ceil((x + w - y) / paso) + 1;
  for (let k = k0; k <= k1; k++) if (k & 1) { const b = k * paso; c.beginPath(); c.moveTo(b + y, y); c.lineTo(b + paso + y, y); c.lineTo(b + paso + y + h, y + h); c.lineTo(b + y + h, y + h); c.closePath(); c.fill(); }
  c.restore();
}
// una mancha irregular (aceite, café): varios óvalos pegados
function mancha(c, x, y, r, color, s) {
  c.fillStyle = color;
  for (let k = 0; k < 5; k++) { const a = hash2(k, s, 3) * TAU, d = hash2(k, s, 4) * r * 0.6, q = r * (0.45 + hash2(k, s, 5) * 0.5); c.beginPath(); c.ellipse(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.7, q, q * 0.7, a, 0, TAU); c.fill(); }
}

const SUELOS = {
  // Cafetería: damero de baldosas de 40 con alguna gastada y el emblema de Microblizz en el centro
  damero(c, z, R) {
    const [i0, i1, j0, j1] = rango(z, R, 40);
    for (let j = j0; j < j1; j++) for (let i = i0; i < i1; i++) {
      const h = hash2(i, j, 11);
      let col = (i + j) & 1 ? '#5fb7a6' : '#f1e6cc';
      if (h < 0.1) col = tono(col, -0.09); else if (h > 0.93) col = tono(col, 0.22);
      c.fillStyle = col; c.fillRect(i * 40, j * 40, 40, 40);
      if (h > 0.4 && h < 0.46) { c.fillStyle = 'rgba(32,16,44,0.16)'; c.fillRect(i * 40 + 6, j * 40 + 6, 9, 9); }      // una esquina desconchada
    }
    c.strokeStyle = 'rgba(32,16,44,0.2)'; c.lineWidth = 1.5; c.beginPath();
    for (let i = i0; i <= i1; i++) { c.moveTo(i * 40, j0 * 40); c.lineTo(i * 40, j1 * 40); }
    for (let j = j0; j <= j1; j++) { c.moveTo(i0 * 40, j * 40); c.lineTo(i1 * 40, j * 40); }
    c.stroke();
    // el emblema: aro, las siglas y cuatro ventanitas
    const ex = z.px + z.pw / 2, ey = z.py + z.ph / 2 + 20;
    forma(c, ovalo(ex, ey, 76, 76), '#2c5f8a', 3);
    forma(c, ovalo(ex, ey, 62, 62), '#f1e6cc', 2.5);
    c.fillStyle = '#3a7de0'; for (const [dx, dy] of [[-26, -26], [2, -26], [-26, 2], [2, 2]]) c.fillRect(ex + dx, ey + dy, 24, 24);
    c.fillStyle = '#1d3f8a'; c.fillRect(ex + 2, ey + 2, 24, 24);
    c.strokeStyle = OL; c.lineWidth = 2.5; for (const [dx, dy] of [[-26, -26], [2, -26], [-26, 2], [2, 2]]) c.strokeRect(ex + dx, ey + dy, 24, 24);
    c.save(); c.translate(ex, ey);
    const letras = 'MICROBLIZZ · MICROBLIZZ · ';
    c.font = '11px ' + LETRA_GORDA; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#f1e6cc';
    for (let k = 0; k < letras.length; k++) { c.save(); c.rotate((k / letras.length) * TAU); c.fillText(letras[k], 0, -68.5); c.restore(); }
    c.restore();
  },

  // Oficinas: moqueta de rombos (dos azules sobre el fondo) con rayitas claras en diagonal
  moqueta(c, z, R) {
    c.fillStyle = '#4d5f93'; c.fillRect(z.px, z.py, z.pw, z.ph);
    const [i0, i1, j0, j1] = rango(z, R, 40);
    for (let j = j0 - 1; j <= j1; j++) for (let i = i0 - 1; i <= i1; i++) {
      const x = i * 40 + 20, y = j * 40 + 20, h = hash2(i, j, 21);
      c.fillStyle = (i + j) & 1 ? (h < 0.12 ? '#6f84c2' : '#6176b2') : (h < 0.12 ? '#34416f' : '#3d4b80');
      c.beginPath(); c.moveTo(x, y - 20); c.lineTo(x + 20, y); c.lineTo(x, y + 20); c.lineTo(x - 20, y); c.closePath(); c.fill();
    }
    c.strokeStyle = 'rgba(200,214,255,0.3)'; c.lineWidth = 1.5; c.beginPath();
    for (let j = j0 - 1; j <= j1; j++) for (let i = i0 - 1; i <= i1; i++) { const x = i * 40, y = j * 40; c.moveTo(x + 10, y + 10); c.lineTo(x + 30, y + 30); c.moveTo(x + 30, y + 10); c.lineTo(x + 10, y + 30); }
    c.stroke();
    c.fillStyle = '#e9c46a'; for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) c.fillRect(i * 40 - 2, j * 40 - 2, 4, 4);
  },

  // La Nube: chapa oscura en triángulos de dos tonos (un molinillo), con remaches, tiras de luz, rejillas y dos pasillos de franjas de peligro
  placas(c, z, R) {
    const [i0, i1, j0, j1] = rango(z, R, 40), A = '#293152', B = '#3d4975';
    for (let j = j0; j < j1; j++) for (let i = i0; i < i1; i++) {
      const x = i * 40, y = j * 40, h = hash2(i, j, 31), gira = (i + j) & 1;
      c.fillStyle = A; c.fillRect(x, y, 40, 40);
      c.fillStyle = h < 0.12 ? '#4a5788' : B;
      c.beginPath(); if (gira) { c.moveTo(x, y); c.lineTo(x + 40, y); c.lineTo(x, y + 40); } else { c.moveTo(x, y); c.lineTo(x + 40, y); c.lineTo(x + 40, y + 40); } c.closePath(); c.fill();
      if (h > 0.9) {   // una rejilla
        forma(c, caja(x + 4, y + 6, 32, 28, 3), '#161a30', 2.5);
        c.strokeStyle = '#5a6699'; c.lineWidth = 2.5; c.beginPath(); for (let k = 0; k < 3; k++) { c.moveTo(x + 9, y + 13 + k * 7); c.lineTo(x + 31, y + 13 + k * 7); } c.stroke();
      } else if (h > 0.5 && h < 0.53) mancha(c, x + 20, y + 22, 20, 'rgba(12,10,28,0.45)', i * 7 + j);
    }
    c.strokeStyle = '#1a1f38'; c.lineWidth = 2; c.beginPath();
    for (let i = i0; i <= i1; i++) if (i % 2 === 0) { c.moveTo(i * 40, j0 * 40); c.lineTo(i * 40, j1 * 40); }
    for (let j = j0; j <= j1; j++) if (j % 2 === 0) { c.moveTo(i0 * 40, j * 40); c.lineTo(i1 * 40, j * 40); }
    c.stroke();
    c.fillStyle = '#5a6699'; for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) if (i % 2 === 0 && j % 2 === 0) { c.beginPath(); c.arc(i * 40, j * 40, 2.6, 0, TAU); c.fill(); }
    // tiras de luz cada cuatro baldosas
    for (let j = j0; j <= j1; j++) if (j % 4 === 2) {
      c.fillStyle = '#12162b'; c.fillRect(z.px, j * 40 - 4.5, z.pw, 9);
      c.fillStyle = '#39d5e8'; for (let x = Math.floor(Math.max(z.px, R.x0) / 24) * 24; x < Math.min(z.px + z.pw, R.x1); x += 24) c.fillRect(x + 4, j * 40 - 2, 16, 4);
    }
    // los pasillos marcados: uno a lo ancho y otro a lo alto
    peligro(c, z.px, z.py + 196, z.pw, 24); peligro(c, z.px + 296, z.py, 24, z.ph);
    c.strokeStyle = OL; c.lineWidth = 2; c.strokeRect(z.px - 2, z.py + 196, z.pw + 4, 24); c.strokeRect(z.px + 296, z.py - 2, 24, z.ph + 4);
  },

  // Pasillo: dos carriles de flechas (uno hacia cada lado), raya naranja en medio y bordes oscuros
  flechas(c, z, R) {
    c.fillStyle = '#cfc9e6'; c.fillRect(z.px, z.py, z.pw, z.ph);
    const [i0, i1] = rango(z, R, 40), my = z.py + z.ph / 2, alto = z.ph / 2 - 12;
    for (let i = i0 - 1; i <= i1; i++) {
      const x = i * 40, h = hash2(i, 0, 41);
      c.fillStyle = h < 0.15 ? '#9790bd' : '#aaa3cc';
      // arriba, hacia la derecha; abajo, hacia la izquierda
      c.beginPath(); c.moveTo(x, z.py + 8); c.lineTo(x + 12, z.py + 8); c.lineTo(x + 30, z.py + 8 + alto / 2); c.lineTo(x + 12, z.py + 8 + alto); c.lineTo(x, z.py + 8 + alto); c.lineTo(x + 18, z.py + 8 + alto / 2); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(x + 30, my + 4); c.lineTo(x + 18, my + 4); c.lineTo(x, my + 4 + alto / 2); c.lineTo(x + 18, my + 4 + alto); c.lineTo(x + 30, my + 4 + alto); c.lineTo(x + 12, my + 4 + alto / 2); c.closePath(); c.fill();
    }
    c.fillStyle = '#ff9a3c'; for (let i = i0 - 1; i <= i1; i++) c.fillRect(i * 40 + 6, my - 2.5, 22, 5);
    c.fillStyle = '#8e86b5'; c.fillRect(z.px, z.py, z.pw, 5); c.fillRect(z.px, z.py + z.ph - 5, z.pw, 5);
  },

  // Recursos Humanos: alfombra granate en zigzag de dos tonos, con una raya dorada, y el sello de DESPEDIDO en el suelo
  rombos(c, z, R) {
    c.fillStyle = '#8d3a54'; c.fillRect(z.px, z.py, z.pw, z.ph);
    const [i0, i1] = rango(z, R, 40), j0 = Math.floor(Math.max(z.py, R.y0) / 30) - 1, j1 = Math.ceil(Math.min(z.py + z.ph, R.y1) / 30) + 1;
    for (let j = j0; j <= j1; j++) {
      if (j & 1) continue;
      const y = j * 30;
      c.fillStyle = '#63213a'; c.beginPath(); c.moveTo((i0 - 1) * 40, y);
      for (let i = i0 - 1; i <= i1; i++) { c.lineTo(i * 40 + 20, y + 12); c.lineTo(i * 40 + 40, y); }
      for (let i = i1; i >= i0 - 1; i--) { c.lineTo(i * 40 + 40, y + 30); c.lineTo(i * 40 + 20, y + 42); c.lineTo(i * 40, y + 30); }
      c.closePath(); c.fill();
      if (j % 4 === 0) { c.strokeStyle = '#e3b55a'; c.lineWidth = 2; c.beginPath(); c.moveTo((i0 - 1) * 40, y + 15); for (let i = i0 - 1; i <= i1; i++) { c.lineTo(i * 40 + 20, y + 27); c.lineTo(i * 40 + 40, y + 15); } c.stroke(); }
    }
    // el sello, torcido, en mitad de la sala
    c.save(); c.translate(z.px + z.pw / 2, z.py + z.ph * 0.66); c.rotate(-0.2);
    c.strokeStyle = '#f6d7d0'; c.lineWidth = 5; c.beginPath(); c.ellipse(0, 0, 84, 50, 0, 0, TAU); c.stroke();
    c.lineWidth = 2; c.beginPath(); c.ellipse(0, 0, 74, 41, 0, 0, TAU); c.stroke();
    rotulo(c, tr('DESPEDIDO'), 0, 2, 25, '#f6d7d0');
    c.restore();
  },

  // Almacén: hormigón con losas, motas, rayas amarillas de carga, un paso de cebra y manchas de aceite
  hormigon(c, z, R) {
    c.fillStyle = '#6f6e6a'; c.fillRect(z.px, z.py, z.pw, z.ph);
    // losas de 60 × 40 a matajunta, cada una de un gris (claro, medio u oscuro), con sus motas
    const j0 = Math.floor(Math.max(z.py, R.y0) / 40), j1 = Math.ceil(Math.min(z.py + z.ph, R.y1) / 40);
    for (let j = j0; j < j1; j++) {
      const corre = j & 1 ? 30 : 0, i0 = Math.floor((Math.max(z.px, R.x0) - corre) / 60), i1 = Math.ceil((Math.min(z.px + z.pw, R.x1) - corre) / 60);
      for (let i = i0; i < i1; i++) {
        const x = i * 60 + corre, y = j * 40, h = hash2(i, j, 51);
        c.fillStyle = h < 0.42 ? '#a3a29d' : h < 0.78 ? '#87867f' : '#b9b8b2'; c.fillRect(x + 1, y + 1, 58, 38);
        c.fillStyle = h < 0.42 ? '#8f8e89' : '#9d9c96';
        for (let k = 0; k < 4; k++) c.fillRect(x + 4 + Math.floor(hash2(i * 9 + k, j, 52) * 50), y + 4 + Math.floor(hash2(i * 9 + k, j, 53) * 30), 3, 3);
      }
    }
    // zona de carga: marco amarillo con franjas en dos esquinas y un paso de cebra hacia la puerta
    c.strokeStyle = '#f2c230'; c.lineWidth = 7; c.strokeRect(z.px + 70, z.py + 190, z.pw - 110, z.ph - 290);
    peligro(c, z.px + 150, z.py + 170, 100, 20, 16); peligro(c, z.px + 110, z.py + z.ph - 110, 20, 60, 16);
    c.fillStyle = '#eceae2'; for (let k = 0; k < 4; k++) c.fillRect(z.px + 6, z.py + 86 + k * 18, 52, 9);
    // la flecha grande que señala la salida de arriba
    c.fillStyle = '#f2c230'; c.beginPath(); const ax = z.px + 140, ay = z.py + 60;
    c.moveTo(ax, ay - 34); c.lineTo(ax + 26, ay - 2); c.lineTo(ax + 10, ay - 2); c.lineTo(ax + 10, ay + 34); c.lineTo(ax - 10, ay + 34); c.lineTo(ax - 10, ay - 2); c.lineTo(ax - 26, ay - 2); c.closePath(); c.fill();
    mancha(c, z.px + 210, z.py + 330, 26, 'rgba(40,36,52,0.5)', 5); mancha(c, z.px + 96, z.py + 448, 18, 'rgba(40,36,52,0.42)', 9); mancha(c, z.px + 236, z.py + 106, 15, 'rgba(40,36,52,0.4)', 13);
  },

  // Juegos cerrados: mosaico de hexágonos en tres verdes, con alguno cubierto de musgo o rajado
  hexagonos(c, z, R) {
    c.fillStyle = '#27443a'; c.fillRect(z.px, z.py, z.pw, z.ph);
    const RX = 14, DX = RX * Math.sqrt(3), DY = RX * 1.5;
    const j0 = Math.floor(Math.max(z.py, R.y0) / DY) - 1, j1 = Math.ceil(Math.min(z.py + z.ph, R.y1) / DY) + 1;
    const i0 = Math.floor(Math.max(z.px, R.x0) / DX) - 1, i1 = Math.ceil(Math.min(z.px + z.pw, R.x1) / DX) + 1;
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const x = i * DX + (j & 1 ? DX / 2 : 0), y = j * DY, h = hash2(i, j, 61);
      c.fillStyle = h < 0.06 ? '#86a95c' : h < 0.1 ? '#2b4a40' : h < 0.42 ? '#3f6f5f' : h < 0.74 ? '#4b8572' : '#356052';
      c.beginPath();
      for (let k = 0; k < 6; k++) { const a = (k / 6) * TAU + Math.PI / 6; c.lineTo(x + Math.cos(a) * (RX - 1.2), y + Math.sin(a) * (RX - 1.2)); }
      c.closePath(); c.fill();
      if (h > 0.1 && h < 0.14) raya(c, [x - 6, y - 5, x - 1, y, x - 4, y + 6], '#27443a', 1.5);   // una raja
    }
  },

  // Pasos entre salas: chapa con remaches y franjas de peligro en las dos bocas
  umbral(c, z) {
    c.fillStyle = '#757b9c'; c.fillRect(z.px, z.py, z.pw, z.ph);
    const horizontal = celdaEn(z.px - 4, z.py + z.ph / 2) === SUELO || celdaEn(z.px + z.pw + 4, z.py + z.ph / 2) === SUELO;
    c.strokeStyle = '#5a6083'; c.lineWidth = 2; c.beginPath();
    if (horizontal) for (let y = z.py + 20; y < z.py + z.ph; y += 20) { c.moveTo(z.px, y); c.lineTo(z.px + z.pw, y); }
    else for (let x = z.px + 20; x < z.px + z.pw; x += 20) { c.moveTo(x, z.py); c.lineTo(x, z.py + z.ph); }
    c.stroke();
    if (horizontal) { peligro(c, z.px, z.py, 10, z.ph, 14); peligro(c, z.px + z.pw - 10, z.py, 10, z.ph, 14); }
    else { peligro(c, z.px, z.py, z.pw, 10, 14); peligro(c, z.px, z.py + z.ph - 10, z.pw, 10, 14); }
  },
};

// manchas y trastos pintados en el suelo (no se chocan con nada): x, y, tipo
const PEGATINAS = [
  [706, 300, 'cafe'], [1012, 482, 'cafe'], [938, 150, 'cafe'], [612, 196, 'papel'],
  [182, 300, 'papel'], [312, 452, 'papel'], [420, 180, 'cafe'], [90, 450, 'papel'], [470, 330, 'papel'],
  [640, 770, 'tiza'], [1104, 760, 'papel'], [246, 800, 'papel'], [86, 1060, 'cafe'],
  [690, 1050, 'papel'], [1060, 1016, 'flor'], [1100, 1100, 'flor'], [596, 1010, 'flor'],
];
function pintaPegatina(c, x, y, tipo, s) {
  if (tipo === 'cafe') { mancha(c, x, y, 13, 'rgba(92,52,24,0.45)', s); c.strokeStyle = 'rgba(92,52,24,0.5)'; c.lineWidth = 2; c.beginPath(); c.arc(x + 14, y - 8, 7, 0, TAU); c.stroke(); }
  else if (tipo === 'papel') {
    c.save(); c.translate(x, y); c.rotate(hash2(s, 1, 71) * 3 - 1.5);
    forma(c, caja(-9, -12, 18, 24, 1), '#f4f1e6', 1.5);
    c.strokeStyle = 'rgba(32,16,44,0.35)'; c.lineWidth = 1.2; c.beginPath(); for (let k = 0; k < 4; k++) { c.moveTo(-6, -7 + k * 4.5); c.lineTo(k === 3 ? 1 : 6, -7 + k * 4.5); } c.stroke();
    c.restore();
  } else if (tipo === 'tiza') {   // la silueta de tiza del último despedido
    c.save(); c.translate(x, y); c.rotate(-0.5);
    c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 2.5; c.setLineDash([7, 4]); c.beginPath(); trazaAlubia(c); c.stroke(); c.setLineDash([]);
    c.restore();
  } else if (tipo === 'flor') {
    for (let k = 0; k < 5; k++) { const a = (k / 5) * TAU; punto(c, x + Math.cos(a) * 4.5, y + Math.sin(a) * 4.5, 3.4, '#f3dfe8'); }
    punto(c, x, y, 2.6, '#f2c230');
  }
}
