// Fans of Dark · la mazmorra: salas y pasillos al azar (con semilla), quién vive en cada sala, dónde hay cofres y portales.
'use strict';
function dkRng(semilla) {   // mulberry32: con la misma semilla sale el mismo mapa (hará falta para el PvP)
  let a = semilla >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function dkMapa(rng, forma = { salas: 11, min: 6, max: 10, vueltas: 3 }) {
  const w = DK_MW, h = DK_MH, t = new Uint8Array(w * h), salas = [];
  const tallar = (x0, y0, x1, y1) => { for (let y = Math.max(1, y0); y <= Math.min(h - 2, y1); y++) for (let x = Math.max(1, x0); x <= Math.min(w - 2, x1); x++) t[y * w + x] = 1; };
  const tam = () => forma.min + Math.floor(rng() * (forma.max - forma.min + 1));
  for (let i = 0; i < 400 && salas.length < forma.salas; i++) {
    const sw = tam(), sh = tam(), x = 2 + Math.floor(rng() * (w - sw - 4)), y = 2 + Math.floor(rng() * (h - sh - 4));
    if (salas.some(s => x < s.x + s.w + 3 && x + sw + 3 > s.x && y < s.y + s.h + 3 && y + sh + 3 > s.y)) continue;
    salas.push({ x, y, w: sw, h: sh, cx: Math.floor(x + sw / 2), cy: Math.floor(y + sh / 2) });
    tallar(x, y, x + sw - 1, y + sh - 1);
  }
  const pasillo = (a, b) => {   // en L, de dos casillas de ancho
    const horizontalPrimero = rng() < 0.5;
    if (horizontalPrimero) { tallar(Math.min(a.cx, b.cx), a.cy, Math.max(a.cx, b.cx) + 1, a.cy + 1); tallar(b.cx, Math.min(a.cy, b.cy), b.cx + 1, Math.max(a.cy, b.cy) + 1); }
    else { tallar(a.cx, Math.min(a.cy, b.cy), a.cx + 1, Math.max(a.cy, b.cy) + 1); tallar(Math.min(a.cx, b.cx), b.cy, Math.max(a.cx, b.cx) + 1, b.cy + 1); }
  };
  const dist = (a, b) => Math.hypot(a.cx - b.cx, a.cy - b.cy);
  const unidas = [salas[0]], faltan = salas.slice(1);
  while (faltan.length) {   // cada sala se une a la más cercana de las ya unidas
    let mejor = null;
    for (const f of faltan) for (const u of unidas) { const d = dist(f, u); if (!mejor || d < mejor.d) mejor = { f, u, d }; }
    pasillo(mejor.u, mejor.f); unidas.push(mejor.f); faltan.splice(faltan.indexOf(mejor.f), 1);
  }
  for (let i = 0; i < forma.vueltas; i++) pasillo(salas[Math.floor(rng() * salas.length)], salas[Math.floor(rng() * salas.length)]);   // vueltas, para no ir por un solo camino
  return { w, h, t, salas };
}

// Quién está dónde. Devuelve el mapa con inicio, jefe, portales, cofres y monstruos puestos.
function dkNivel(semilla, forma) {
  const rng = dkRng(semilla), m = dkMapa(rng, forma), s = m.salas;
  m.rng = rng;
  const inicio = s[Math.floor(rng() * s.length)];
  const lejos = [...s].filter(x => x !== inicio).sort((a, b) => Math.hypot(b.cx - inicio.cx, b.cy - inicio.cy) - Math.hypot(a.cx - inicio.cx, a.cy - inicio.cy));
  const jefe = lejos[0];
  const resto = lejos.slice(1).sort(() => rng() - 0.5).filter(x => Math.hypot(x.cx - inicio.cx, x.cy - inicio.cy) > 8);
  const portales = [...resto.slice(0, 3)];
  m.inicio = inicio; m.jefe = jefe; m.portales = portales;
  for (const x of s) {
    const d = Math.hypot(x.cx - inicio.cx, x.cy - inicio.cy);
    x.prof = x === inicio ? -1 : x === jefe ? 3 : Math.min(2, Math.floor(d / 11));
  }
  m.props = [];   // decorado por sala (qué cosa y dónde); lo dibuja decorado.js y aquí solo estorban al andar
  for (const x of s) for (let i = 0, n = 1 + Math.floor(rng() * 3); i < n; i++) {
    const px = x.x + 1 + Math.floor(rng() * (x.w - 2)) + 0.5, py = x.y + 1 + Math.floor(rng() * (x.h - 2)) + 0.5;
    if (Math.abs(px - x.cx - 0.5) < 1.5 && Math.abs(py - x.cy - 0.5) < 1.5) continue;   // el centro queda libre (pasillos y antorcha)
    m.props.push({ x: px, y: py, n: i, giro: rng() * 6.28 });
  }
  return m;
}
const dkSuelo = (m, cx, cy) => cx >= 0 && cy >= 0 && cx < m.w && cy < m.h && m.t[cy * m.w + cx] === 1;
// ¿se ve de A a B sin paredes de por medio? (coordenadas en casillas; se mira cada cuarto de casilla)
function dkVista(m, x0, y0, x1, y1) {
  const d = Math.hypot(x1 - x0, y1 - y0), n = Math.ceil(d * 4);
  for (let i = 1; i < n; i++) { const f = i / n; if (!dkSuelo(m, Math.floor(x0 + (x1 - x0) * f), Math.floor(y0 + (y1 - y0) * f))) return false; }
  return true;
}
// mover un círculo de radio r por el mapa sin atravesar paredes (cada eje por separado: así se desliza por ellas)
function dkMover(m, p, dx, dy, r) {
  const libre = (x, y) => dkSuelo(m, Math.floor(x - r), Math.floor(y - r)) && dkSuelo(m, Math.floor(x + r), Math.floor(y - r)) && dkSuelo(m, Math.floor(x - r), Math.floor(y + r)) && dkSuelo(m, Math.floor(x + r), Math.floor(y + r));
  if (libre(p.x + dx, p.y)) p.x += dx;
  if (libre(p.x, p.y + dy)) p.y += dy;
  for (const o of m.props || []) {   // el decorado también estorba: se empuja hacia fuera
    const d = Math.hypot(p.x - o.x, p.y - o.y), min = r + DK_PROP_R; if (d < min && d > 0.001) { p.x += (p.x - o.x) / d * (min - d); p.y += (p.y - o.y) / d * (min - d); }
  }
}
const DK_PROP_R = 0.35;   // radio con el que estorba cada cosa del decorado
