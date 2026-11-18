// Fans of Snakes · Muros y tema del tablero. Los muros son casillas que matan como la pared (el Escudo rebota en ellos; el
// Portal no los atraviesa). Se ponen con un DIBUJO (lista de abajo) al empezar la partida (js/modos.js) y, en el VS, el
// rival te los lanza de uno en uno. El TEMA son los colores del tablero: el de cada mundo (js/mundos.js) o el de siempre.
'use strict';

const TEMA_BASE = { fondo: '#0b1f14', rejilla: '#153a24', borde: '#2a4a36', muro: '#5b6b62', muroLuz: '#8fa39a' };
let TEMA = TEMA_BASE;

const esMuro = n => JUEGO.muros.has(n[0] + ',' + n[1]);
function ponMuro(c, r) { if (c >= 0 && c < COLS && r >= 0 && r < ROWS) JUEGO.muros.add(c + ',' + r); }
// los dibujos están hechos para 20 filas; en un tablero más alto cada fila del dibujo se estira a las que le tocan
let ESTIRA = false;
function ponMuroDibujo(c, r) {
  if (!ESTIRA) { ponMuro(c, r); return; }
  const k = ROWS / 20, a = Math.floor(r * k), b = Math.max(a, Math.floor((r + 1) * k) - 1);
  for (let rr = a; rr <= b; rr++) if (rr !== filaSalida()) ponMuro(c, rr);
}
function ponDibujo(nombre) { ESTIRA = true; DIBUJOS_MUROS[nombre](); ESTIRA = false; }

// los dibujos de muros, para 14 x 20 (se estiran si hay más filas; la serpiente sale en la fila 10, columnas 2 a 5, hacia la
// derecha: se deja libre)
const DIBUJOS_MUROS = {
  ninguno: () => {},
  esquinas: () => { for (const [c, r] of [[1, 1], [12, 1], [1, 18], [12, 18]]) for (let i = 0; i < 3; i++) { ponMuroDibujo(c + (c < 7 ? i : -i), r); ponMuroDibujo(c, r + (r < 10 ? i : -i)); } },
  barras: () => { for (let c = 3; c <= 10; c++) { ponMuroDibujo(c, 5); ponMuroDibujo(c, 15); } },
  escritorios: () => { for (const [c, r] of [[2, 3], [9, 3], [2, 15], [9, 15], [5, 6], [6, 13]]) for (let i = 0; i < 3; i++) ponMuroDibujo(c + i, r); },
  cruz: () => { for (let r = 2; r <= 17; r++) if (r < 8 || r > 12) ponMuroDibujo(7, r); for (let c = 1; c <= 12; c++) if (c < 5 || c > 9) ponMuroDibujo(c, 4), ponMuroDibujo(c, 16); },
  columnas: () => { for (const c of [3, 7, 11]) for (let r = 2; r <= 17; r++) if (r !== 9 && r !== 10 && r !== 11 && r % 5 !== 0) ponMuroDibujo(c, r); },
  marco: () => { for (let c = 2; c <= 11; c++) { if (c < 6 || c > 8) { ponMuroDibujo(c, 2); ponMuroDibujo(c, 17); } } for (let r = 2; r <= 17; r++) { if (r < 8 || r > 12) { ponMuroDibujo(1, r); ponMuroDibujo(12, r); } } },
  zigzag: () => { for (let i = 0; i < 6; i++) { ponMuroDibujo(2 + i, 3 + i); ponMuroDibujo(11 - i, 13 + i); } for (let c = 9; c <= 12; c++) ponMuroDibujo(c, 6); for (let c = 1; c <= 4; c++) ponMuroDibujo(c, 15); },
  laberinto: () => { for (let c = 0; c <= 9; c++) ponMuroDibujo(c, 4); for (let c = 4; c <= 13; c++) ponMuroDibujo(c, 15); for (let r = 6; r <= 8; r++) ponMuroDibujo(10, r); for (let r = 12; r <= 13; r++) ponMuroDibujo(3, r); },
};

// muros al azar (Reto diario): unos cuantos tramos sueltos lejos de la salida
function murosAlAzar(n) {
  for (let i = 0; i < n; i++) {
    const largo = 2 + azarEntero(3), vert = azar() < 0.5;
    let c = azarEntero(COLS), r = azarEntero(20);   // en el espacio de 20 filas de los dibujos
    if (Math.abs(r - 10) <= 1) r = r < 10 ? r - 3 : r + 3;
    for (let k = 0; k < largo; k++) { const rr = vert ? r + k : r; if (Math.abs(rr - 10) > 1) ponMuroDibujo(vert ? c : c + k, rr); }   // la fila de salida, libre
  }
}

// en el VS: un muro donde no moleste de golpe (lejos de la cabeza y libre)
function muroDeAtaque() {
  const h = JUEGO.serp[0];
  for (let i = 0; i < 40; i++) {
    const p = casillaLibre(); if (!p) return null;
    if (Math.abs(p[0] - h[0]) + Math.abs(p[1] - h[1]) >= 4) { ponMuro(p[0], p[1]); return p; }
  }
  return null;
}

function pintaMuros(retro) {
  const c = TAB.c;
  for (const k of JUEGO.muros) {
    const [mc, mr] = k.split(',').map(Number), x = cx(mc) - c / 2, y = cy(mr) - c / 2;
    if (retro) { G.fillStyle = RETRO.tinta; G.fillRect(x + 1, y + 1, c - 2, c - 2); G.fillStyle = RETRO.fondo; G.fillRect(x + c / 2 - 1, y + c / 2 - 1, 2, 2); continue; }
    caja(x + 0.5, y + 0.5, c - 1, c - 1, 2, TEMA.muro, '#06110a', 1);
    G.fillStyle = TEMA.muroLuz; G.fillRect(x + 2, y + 2, c - 5, 1.5);   // el brillo de arriba
    G.strokeStyle = 'rgba(6,17,10,0.45)'; G.lineWidth = 0.8; G.beginPath(); G.moveTo(x + 1, y + c / 2); G.lineTo(x + c - 1, y + c / 2); G.stroke();   // la junta de los ladrillos
  }
}
