// Fans of Chef · MAPA: el sótano de la jornada son salas hechas a mano (PLANTILLAS) que se colocan en otro orden cada día, unidas por
// puertas. La primera sala tiene el montacargas (entrada y salida) y la última, un cofre. Casillas: 1 suelo, 2 muro, 3 estorbo (una caja
// o un barril que bloquea), 4 reja del suelo (decorado). Lo demás del sótano (bichos, botín) vive en enemigos.js y jornada.js.
'use strict';

const SALA_W = 13, SALA_H = 9;   // casillas de una sala (sin contar los muros compartidos)
const MAPA = { w: 0, h: 0, t: [], salas: [], montacargas: null, cofre: null, antorchas: [] };

// cada plantilla: 9 filas de 13 letras. '.' suelo, '#' estorbo, 'r' reja, 'e' sitio donde nace un bicho
const PLANTILLAS = [
  ['.............', '.............', '....e...e....', '.............', '......r......', '.............', '....e...e....', '.............', '.............'],
  ['.............', '.##.......##.', '.#....e....#.', '.............', '...e.....e...', '.............', '.#....e....#.', '.##.......##.', '.............'],
  ['.............', '.....e.......', '....###......', '.............', '.e....r....e.', '.............', '......###....', '.......e.....', '.............'],
  ['.............', '.e.........e.', '.............', '...#.....#...', '...#..e..#...', '...#.....#...', '.............', '.e.........e.', '.............'],
  ['.............', '......#......', '..e...#...e..', '......#......', '.............', '......#......', '..e...#...e..', '......#......', '.............'],
  ['.............', '.r.........r.', '....e...e....', '.............', '.....###.....', '.............', '....e...e....', '.r.........r.', '.............'],
];

const casilla = (cx, cy) => (cx < 0 || cy < 0 || cx >= MAPA.w || cy >= MAPA.h) ? 2 : MAPA.t[cy * MAPA.w + cx];
const bloquea = (cx, cy) => { const c = casilla(cx, cy); return c === 2 || c === 3 || c === 0; };
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
  MAPA.salas = []; MAPA.antorchas = [];
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
      pon(X, Y, l === '#' ? 3 : l === 'r' ? 4 : 1);
      if (l === 'e' && i > 0) sala.nacen.push({ x: (X + 0.5) * CAS, y: (Y + 0.8) * CAS });
    }
    MAPA.salas.push(sala);
    // antorchas en el muro de arriba
    MAPA.antorchas.push({ x: (ox + 3) * CAS, y: oy * CAS - 2 }, { x: (ox + SALA_W - 3) * CAS, y: oy * CAS - 2 });
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

// --- pintar el sótano: suelo de piedra con grietas, muros de ladrillo, estorbos, rejas y antorchas ---
let SUELO_PAT = null, MURO_PAT = null;
function patronSuelo(ctx) {
  if (SUELO_PAT) return SUELO_PAT;
  const c = document.createElement('canvas'); c.width = c.height = CAS * 2; const g = c.getContext('2d');
  if (IMG.suelo_piedra) { g.drawImage(IMG.suelo_piedra, 0, 0, c.width, c.height); }
  else {
    g.fillStyle = PALETA.u; g.fillRect(0, 0, c.width, c.height);
    const r = mulberry32(7);
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { g.fillStyle = r() < 0.5 ? '#4a3018' : '#432c16'; g.fillRect(i * CAS + 1, j * CAS + 1, CAS - 2, CAS - 2); g.fillStyle = '#5a3d20'; g.fillRect(i * CAS + 1, j * CAS + 1, CAS - 2, 1); }
    g.fillStyle = PALETA.U; for (let i = 0; i < 14; i++) g.fillRect(Math.floor(r() * c.width), Math.floor(r() * c.height), 1 + Math.floor(r() * 3), 1);
  }
  SUELO_PAT = ctx.createPattern(c, 'repeat'); return SUELO_PAT;
}
function pintaMuro(ctx, x, y) {
  if (IMG.suelo_muro) { ctx.drawImage(IMG.suelo_muro, 0, 0, IMG.suelo_muro.width, IMG.suelo_muro.height, x, y, CAS, CAS); return; }
  caja(ctx, x, y, CAS, CAS, PALETA.s);
  for (let f = 0; f < 2; f++) { const des = f ? CAS / 2 : 0; caja(ctx, x, y + f * CAS / 2, CAS, 1, PALETA.K); caja(ctx, x + ((des + 1) % CAS), y + f * CAS / 2 + 1, 1, CAS / 2 - 1, PALETA.K); caja(ctx, x + 1, y + f * CAS / 2 + 1, CAS - 2, 1, PALETA.t); }
}
function pintaSuelo(ctx, cam, t) {
  const x0 = Math.max(0, Math.floor(cam.x / CAS)), y0 = Math.max(0, Math.floor(cam.y / CAS));
  const x1 = Math.min(MAPA.w - 1, Math.ceil((cam.x + cam.w) / CAS)), y1 = Math.min(MAPA.h - 1, Math.ceil((cam.y + cam.h) / CAS));
  ctx.save(); ctx.translate(-cam.x, -cam.y);
  ctx.fillStyle = patronSuelo(ctx); ctx.fillRect(x0 * CAS, y0 * CAS, (x1 - x0 + 1) * CAS, (y1 - y0 + 1) * CAS);
  ctx.restore();
  for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) {
    const c = casilla(cx, cy), x = cx * CAS - cam.x, y = cy * CAS - cam.y;
    if (c === 0) caja(ctx, x, y, CAS, CAS, '#0e0905');
    else if (c === 2) pintaMuro(ctx, x, y);
    else if (c === 4) pintaSpr(ctx, 'reja', x + CAS / 2, y + CAS);
  }
  void t;
}
// lo del sótano que tiene altura (estorbos, cofre, montacargas, antorchas): va a la lista que se ordena por los pies
function cosasConAltura(cam) {
  const lista = [];
  const x0 = Math.max(0, Math.floor(cam.x / CAS) - 1), y0 = Math.max(0, Math.floor(cam.y / CAS) - 2);
  const x1 = Math.min(MAPA.w - 1, Math.ceil((cam.x + cam.w) / CAS)), y1 = Math.min(MAPA.h - 1, Math.ceil((cam.y + cam.h) / CAS));
  for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) if (casilla(cx, cy) === 3) {
    const px = cx * CAS - cam.x, py = cy * CAS - cam.y;
    lista.push({ y: (cy + 1) * CAS, pinta: c => { cajaMarco(c, px + 1, py - 4, CAS - 2, CAS + 3, PALETA.B); caja(c, px + 3, py - 2, CAS - 6, 1, PALETA.T); caja(c, px + 2, py + CAS / 2, CAS - 4, 1, PALETA.b); } });
  }
  const m = MAPA.montacargas, co = MAPA.cofre;
  lista.push({ y: m.y, pinta: c => pintaSpr(c, 'montacargas', m.x - cam.x, m.y - cam.y, { listo: JORNADA.objetivosHechos() }) });
  if (!co.abierto) lista.push({ y: co.y, pinta: c => pintaSpr(c, 'cofre', co.x - cam.x, co.y - cam.y) });
  for (const a of MAPA.antorchas) lista.push({ y: a.y, pinta: c => pintaSpr(c, 'antorcha', a.x - cam.x, a.y - cam.y, { t: PAN.t }) });
  return lista;
}
