// Fans of Snakes · Tablero: la cuadrícula de casillas, dónde cae en pantalla, y cómo se pintan el fondo, la serpiente,
// las manzanas y los ítems locos. Las reglas (moverse, comer, morir) están en js/partida.js; esto solo mide y pinta.
'use strict';

const COLS = 14, ROWS = 22;                 // casillas del tablero
const TAB = { x0: 0, y0: 36, c: 14, w: 0, h: 0 };   // dónde cae el tablero en el mundo (c = lado de la casilla)

// el tablero ocupa todo el ancho; arriba queda el marcador (36) y abajo lo que sobre
function calculaTablero(W, H) {
  TAB.c = Math.floor((W - 6) / COLS * 10) / 10;
  TAB.w = TAB.c * COLS; TAB.h = TAB.c * ROWS;
  TAB.x0 = (W - TAB.w) / 2;
  TAB.y0 = 36 + Math.max(0, (H - 36 - 22 - TAB.h) / 2);
}

// centro de una casilla en el mundo
const cx = c => TAB.x0 + (c + 0.5) * TAB.c;
const cy = r => TAB.y0 + (r + 0.5) * TAB.c;
const mismaCasilla = (a, b) => a[0] === b[0] && a[1] === b[1];

// la lista de casillas ocupadas (serpiente, manzanas e ítems) para no poner nada encima
function casillaLibre() {
  const ocupadas = new Set();
  for (const s of JUEGO.serp) ocupadas.add(s[0] + ',' + s[1]);
  for (const m of JUEGO.manzanas) ocupadas.add(m[0] + ',' + m[1]);
  for (const it of JUEGO.items) ocupadas.add(it.c + ',' + it.r);
  if (ocupadas.size >= COLS * ROWS - 2) return null;
  for (let i = 0; i < 200; i++) {
    const c = Math.floor(Math.random() * COLS), r = Math.floor(Math.random() * ROWS);
    if (!ocupadas.has(c + ',' + r)) return [c, r];
  }
  return null;
}

// ---------- pintar ----------

function pintaFondo(retro) {
  const { x0, y0, w, h, c } = TAB;
  if (retro) {   // pantalla de un solo color, con el borde grueso de la carcasa
    G.fillStyle = RETRO.fondo; G.fillRect(x0 - 3, y0 - 3, w + 6, h + 6);
    G.fillStyle = RETRO.tinta; G.fillRect(x0 - 3, y0 - 3, w + 6, 2); G.fillRect(x0 - 3, y0 + h + 1, w + 6, 2);
    G.fillRect(x0 - 3, y0 - 3, 2, h + 6); G.fillRect(x0 + w + 1, y0 - 3, 2, h + 6);
    return;
  }
  const fr = esFrenesi(), t = JUEGO.t;
  caja(x0 - 3, y0 - 3, w + 6, h + 6, 5, fr ? `hsl(${(t * 120) % 360} 70% 10%)` : '#0b1f14', fr ? arcoiris(0, t, 60) : '#2a4a36', 2);
  G.strokeStyle = fr ? `hsl(${(t * 120 + 180) % 360} 80% 28%)` : '#153a24'; G.lineWidth = 0.6;
  G.beginPath();
  for (let i = 1; i < COLS; i++) { G.moveTo(x0 + i * c, y0); G.lineTo(x0 + i * c, y0 + h); }
  for (let j = 1; j < ROWS; j++) { G.moveTo(x0, y0 + j * c); G.lineTo(x0 + w, y0 + j * c); }
  G.stroke();
}

function pintaManzanas(retro) {
  const c = TAB.c;
  for (const m of JUEGO.manzanas) {
    const x = cx(m[0]), y = cy(m[1]);
    if (retro) {   // una manzana de 5 píxeles gordos
      const p = c / 5; G.fillStyle = RETRO.tinta;
      G.fillRect(x - p * 1.5, y - p * 2, p, p); G.fillRect(x - p * 2, y - p, p, p); G.fillRect(x, y - p, p, p);
      G.fillRect(x - p * 1.5, y, p, p); G.fillRect(x - p * 2, y + p, p, p); G.fillRect(x, y + p, p, p);
      continue;
    }
    const oro = esFrenesi(), r = c * 0.36 + Math.sin(JUEGO.t * 6 + m[0]) * 0.4;
    circulo(x, y + 0.5, r, oro ? '#ffd54a' : '#ff4d4d', '#06110a', 1.2);
    circulo(x - r * 0.35, y - r * 0.25, r * 0.25, oro ? '#fff2b0' : '#ff9d9d', null);
    G.fillStyle = '#3ddc84'; G.fillRect(x - 0.8, y - r - 2.5, 1.6, 2.5);
  }
}

function pintaItems(retro) {
  const c = TAB.c;
  for (const it of JUEGO.items) {
    const x = cx(it.c), y = cy(it.r), lat = c * 0.8, rebote = Math.sin(JUEGO.t * 5 + it.r) * 0.8;
    if (retro) { G.fillStyle = RETRO.tinta; G.fillRect(x - lat / 2, y - lat / 2, lat, lat); G.fillStyle = RETRO.fondo; G.fillRect(x - 1, y - 3, 2, 4); G.fillRect(x - 1, y + 2, 2, 1); continue; }
    caja(x - lat / 2, y - lat / 2 + rebote, lat, lat, 3, '#ffd54a', '#06110a', 1.2);
    letra('?', x, y + 0.6 + rebote, c * 0.75, '#06110a', 'center', null, 0);
  }
}

function pintaSerpiente(retro) {
  const S = JUEGO.serp, c = TAB.c, fr = esFrenesi(), t = JUEGO.t;
  if (retro) {   // cuadrados macizos, sin redondear, con un hueco de un píxel entre ellos
    G.fillStyle = RETRO.tinta; const g = Math.max(1, c * 0.1);
    for (const s of S) G.fillRect(cx(s[0]) - c / 2 + g / 2, cy(s[1]) - c / 2 + g / 2, c - g, c - g);
    return;
  }
  for (let i = S.length - 1; i >= 1; i--) {
    const s = S[i], k = 1 - i / S.length * 0.35, lat = c * (0.86 - (i / S.length) * 0.18);
    const col = fr ? arcoiris(i, t) : `hsl(140 70% ${28 + k * 22}%)`;
    caja(cx(s[0]) - lat / 2, cy(s[1]) - lat / 2, lat, lat, 3, col, '#06110a', 1);
  }
  // la cabeza: más grande, con ojos que miran hacia donde va
  const h = S[0], lat = c * 0.96, x = cx(h[0]), y = cy(h[1]), [dx, dy] = JUEGO.dir;
  caja(x - lat / 2, y - lat / 2, lat, lat, 4, fr ? '#ffffff' : '#9cff6b', '#06110a', 1.4);
  const ox = dy !== 0 ? 2.6 : 0, oy = dx !== 0 ? 2.6 : 0, ax = dx * 1.8, ay = dy * 1.8;
  for (const sg of [1, -1]) {
    circulo(x + ax + ox * sg, y + ay + oy * sg, 1.9, '#fff', '#06110a', 0.8);
    circulo(x + ax * 1.4 + ox * sg, y + ay * 1.4 + oy * sg, 0.9, '#06110a', null);
  }
  if (JUEGO.uyT > 0) {   // el ¡Uy! del roce: un brillo alrededor de la cabeza
    G.globalAlpha = Math.min(1, JUEGO.uyT * 4); circulo(x, y, lat * 0.9, null, '#fff', 1.5); G.globalAlpha = 1;
  }
}
