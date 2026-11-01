// Fans of Chef · MAPA: el sótano de la jornada son salas hechas a mano (PLANTILLAS) que se colocan en otro orden cada día, unidas por
// puertas. La primera sala tiene el montacargas (entrada y salida) y la última, un cofre. Casillas: 1 suelo, 2 muro, 3 caja, 5 columna y
// 6 barril (bloquean), 4 reja, 7 huesos, 8 charco y 9 escombros (decorado, se pisa). Pintarlo está en escenario.js; los bichos, en enemigos.js.
'use strict';

const SALA_W = 13, SALA_H = 9;   // casillas de una sala (sin contar los muros compartidos)
const MAPA = { w: 0, h: 0, t: [], salas: [], montacargas: null, cofre: null, antorchas: [], verjas: [] };
const LETRA_CAS = { '.': 1, 'e': 1, '#': 3, 'r': 4, 'c': 5, 'b': 6, 'h': 7, 'p': 8, 'x': 9 };

// cada plantilla: 9 filas de 13 letras. '.' suelo, 'e' sitio donde nace un bicho, y las letras de LETRA_CAS (# caja, c columna, b barril, r reja, h huesos, p charco, x escombros)
const PLANTILLAS = [
  ['.............', '.h.........x.', '....e...e....', '.............', '......r......', '.............', '....e...e....', '.p...........', '.............'],
  ['.............', '.bb.......bb.', '.b....e....b.', '.............', '...e..h..e...', '.............', '.b....e....b.', '.bb.......bb.', '.............'],
  ['.............', '.....e.......', '....###.p....', '.............', '.e....r....e.', '.............', '....x.###....', '.......e.....', '.............'],
  ['.............', '.e.........e.', '.............', '...c.....c...', '...h..e..p...', '...c.....c...', '.............', '.e.........e.', '.............'],
  ['.............', '......c......', '..e...#...e..', '......c......', '.....x.......', '......c......', '..e...#...e..', '......c......', '.............'],
  ['.............', '.r.........r.', '....e...e....', '.h...........', '.....bbb.....', '...........x.', '....e...e....', '.r....p....r.', '.............'],
];

const casilla = (cx, cy) => (cx < 0 || cy < 0 || cx >= MAPA.w || cy >= MAPA.h) ? 2 : MAPA.t[cy * MAPA.w + cx];
const bloquea = (cx, cy) => { const c = casilla(cx, cy); return c === 2 || c === 3 || c === 5 || c === 6 || c === 0; };
// ¿la caja (px, py, w, h) choca con algo que bloquea?
function chocaCaja(px, py, w, h) {
  const x0 = Math.floor(px / CAS), y0 = Math.floor(py / CAS), x1 = Math.floor((px + w - 1) / CAS), y1 = Math.floor((py + h - 1) / CAS);
  for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) if (bloquea(cx, cy)) return true;
  return false;
}

// construye el sótano de la jornada: `n` salas en un camino que avanza hacia la derecha con desvíos arriba y abajo
function construyeMapa(n, rng) {
  const celdas = [{ x: 0, y: 1 }];
  const ocupada = (x, y) => celdas.some(c => c.x === x && c.y === y);
  while (celdas.length < n) {
    const u = celdas[celdas.length - 1];
    const opciones = [{ x: u.x + 1, y: u.y }, { x: u.x + 1, y: u.y }, { x: u.x, y: u.y - 1 }, { x: u.x, y: u.y + 1 }].filter(c => c.y >= 0 && c.y <= 2 && !ocupada(c.x, c.y));
    if (!opciones.length) { celdas.push({ x: u.x + 1, y: u.y }); continue; }
    celdas.push(opciones[Math.floor(rng() * opciones.length)]);
  }
  const maxX = Math.max(...celdas.map(c => c.x)), maxY = Math.max(...celdas.map(c => c.y));
  MAPA.w = (maxX + 1) * (SALA_W + 1) + 1; MAPA.h = (maxY + 1) * (SALA_H + 1) + 1;
  MAPA.t = new Array(MAPA.w * MAPA.h).fill(0);
  MAPA.salas = []; MAPA.antorchas = []; MAPA.verjas = [];
  const pon = (cx, cy, v) => { MAPA.t[cy * MAPA.w + cx] = v; };
  const orden = [...PLANTILLAS.keys()].sort(() => rng() - 0.5);
  celdas.forEach((c, i) => {
    const ox = c.x * (SALA_W + 1) + 1, oy = c.y * (SALA_H + 1) + 1;
    const plantilla = i === 0 ? PLANTILLAS[0] : PLANTILLAS[orden[i % orden.length]];
    const sala = { i, ox, oy, nacen: [], visitada: i === 0 };
    for (let cy = -1; cy <= SALA_H; cy++) for (let cx = -1; cx <= SALA_W; cx++) {
      const X = ox + cx, Y = oy + cy;
      if (cx < 0 || cy < 0 || cx >= SALA_W || cy >= SALA_H) { if (casilla(X, Y) === 0) pon(X, Y, 2); continue; }
      const l = plantilla[cy][cx];
      let v = LETRA_CAS[l] || 1;
      if (v === 1 && l === '.' && cy > 0 && cy < SALA_H - 1 && cx > 0 && cx < SALA_W - 1 && rng() < 0.05) v = [7, 8, 9, 9][Math.floor(rng() * 4)];   // algo de suciedad suelta
      pon(X, Y, v);
      if (l === 'e' && i > 0) sala.nacen.push({ x: (X + 0.5) * CAS, y: (Y + 0.8) * CAS });
    }
    MAPA.salas.push(sala);
    // antorchas en el muro de arriba y, en algunas salas, una verja (celda) en ese muro
    MAPA.antorchas.push({ x: (ox + 3) * CAS, y: oy * CAS - 2 }, { x: (ox + SALA_W - 3) * CAS, y: oy * CAS - 2 });
    if (i > 0 && rng() < 0.6) MAPA.verjas.push({ x: (ox + 2 + Math.floor(rng() * (SALA_W - 4)) + 0.5) * CAS, y: oy * CAS });
  });
  // las puertas: tres casillas de hueco en el muro que comparten dos salas seguidas del camino
  for (let i = 1; i < celdas.length; i++) {
    const a = celdas[i - 1], b = celdas[i];
    const ax = a.x * (SALA_W + 1) + 1, ay = a.y * (SALA_H + 1) + 1;
    if (b.x > a.x) for (let k = -1; k <= 1; k++) pon(ax + SALA_W, ay + Math.floor(SALA_H / 2) + k, 1);
    else if (b.y > a.y) for (let k = -1; k <= 1; k++) pon(ax + Math.floor(SALA_W / 2) + k, ay + SALA_H, 1);
    else for (let k = -1; k <= 1; k++) pon(ax + Math.floor(SALA_W / 2) + k, ay - 1, 1);
  }
  const s0 = MAPA.salas[0], sn = MAPA.salas[MAPA.salas.length - 1];
  MAPA.montacargas = { x: (s0.ox + SALA_W / 2) * CAS, y: s0.oy * CAS + 2 };
  MAPA.cofre = { x: (sn.ox + SALA_W / 2) * CAS, y: (sn.oy + SALA_H / 2 + 0.9) * CAS, abierto: false };
  return { x: MAPA.montacargas.x, y: MAPA.montacargas.y + 44 };   // donde aparece el cocinero
}
// la sala en la que cae un punto (o null si está en un muro)
function salaEn(x, y) {
  const cx = Math.floor(x / CAS), cy = Math.floor(y / CAS);
  return MAPA.salas.find(s => cx >= s.ox && cx < s.ox + SALA_W && cy >= s.oy && cy < s.oy + SALA_H) || null;
}
