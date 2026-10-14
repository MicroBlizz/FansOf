// Fans of Ratkov · FORMAS de los objetos para la mochila Tetris: cuántas casillas ocupa cada cosa y con qué forma (X = casilla llena),
// cómo se gira y cómo se dibuja la pieza (las casillas del color de su rareza y encima el objeto con su contorno). Lo que no sale aquí
// ocupa una sola casilla. Las armas se dibujan solas a partir de su forma; el resto usa su icono en grande o un dibujo propio.
'use strict';
const FORMAS = {
  tuberia: ['XXX'], cables: ['.XX', 'XX.'], placa: ['XX', 'XX'],
  disco: ['X', 'X'], documentos: ['XX'], figura: ['.X.', 'XXX'], mando: ['XX'], grafica: ['XXX', 'XX.'], muestra: ['X', 'X'],
  botiquin: ['XX', 'XX'], te: ['X', 'X'],
  pistola: ['XX', 'X.'], metralleta: ['XXX', '.X.'], escopeta: ['XXXX', '.X..'], fusil: ['XXXXX', '.X.X.'], franco: ['XXXXX', '.X..X'],
  silenciador: ['XX'], canon: ['XXX'], mira: ['XX'], cargador: ['X', 'X'], culata: ['XX', 'X.'],
  'chaleco-l': ['XX', 'XX'], 'chaleco-p': ['XXX', 'XXX'], casco: ['XX', 'XX'],
  'mochila-p': ['XX', 'XX'], 'mochila-m': ['XX', 'XX', 'XX'], 'mochila-g': ['XXX', 'XXX', 'XXX'],
  palanca: ['XXX'], 'an-lag': ['XX'], 'an-hitbox': ['XX', 'XX'],
};
// las casillas de una forma girada rot veces (90° cada vez), con su ancho y alto
const FORMA_CACHE = {};
function formaDe(id, rot = 0) {
  const k = id + '|' + (rot % 4); if (FORMA_CACHE[k]) return FORMA_CACHE[k];
  const f = FORMAS[id] || ['X']; let c = [], w = f[0].length, h = f.length;
  f.forEach((fila, y) => [...fila].forEach((ch, x) => { if (ch === 'X') c.push([x, y]); }));
  for (let i = 0; i < rot % 4; i++) { c = c.map(([x, y]) => [h - 1 - y, x]); [w, h] = [h, w]; }
  return (FORMA_CACHE[k] = { c, w, h });
}
const celdasDe = id => formaDe(id).c.length;

// las mochilas: ancho por alto (sin mochila, lo que cabe en las manos). JunkCoon lleva una fila más
const DIM_MOCHILA = { '': { w: 3, h: 2 }, 'mochila-p': { w: 4, h: 4 }, 'mochila-m': { w: 5, h: 5 }, 'mochila-g': { w: 6, h: 7 } };
const DIM_RINONERA = { w: 2, h: 2 };
// los contenedores y los cuerpos: 5 x 3 (crecen hacia abajo si no cabe todo)
function dimContenedor() { return { w: 5, h: 3 }; }

/* ---------- el dibujo de una pieza (16 píxeles por casilla) ---------- */
const RAR_PIEZA = [['#262b33', '#3b4350'], ['#1f3326', '#3d6b47'], ['#1f2c42', '#3d5f8f'], ['#2f2342', '#6a4a96'], ['#3f3216', '#b08a2a']];
const PIEZA_CACHE = {};
// un arma a partir de su forma: el cuerpo a lo largo de la fila de arriba, la empuñadura bajo la primera casilla de abajo y el cargador bajo la segunda
function arteArma(a, id, f) {
  const W = f[0].length * 16, abajo = [...(f[1] || '')].map((ch, x) => (ch === 'X' ? x : -1)).filter(x => x >= 0);
  const madera = ['fusil', 'escopeta', 'franco'].includes(id), m = '#3a3f47', l = '#5c6670', mad = '#6e4a2e';
  if (madera) { a.fillStyle = mad; a.fillRect(2, 5, 14, 7); a.fillRect(2, 5, 4, 9); }
  a.fillStyle = m; a.fillRect(madera ? 16 : 3, 4, W * 0.55, 8); a.fillStyle = l; a.fillRect(madera ? 16 : 3, 4, W * 0.55, 2);
  a.fillStyle = '#2b313a'; a.fillRect(W * 0.55, 7, W * 0.45 - 2, 3); a.fillRect(W - 6, 4, 2, 3);
  if (id === 'franco') { a.fillStyle = '#22252b'; a.fillRect(24, 0, 20, 4); a.fillStyle = '#6ad8ff'; a.fillRect(26, 1, 2, 2); }
  if (abajo[0] != null) { const x = abajo[0] * 16 + 4; a.fillStyle = '#5a3a24'; a.fillRect(x, 12, 7, 14); a.fillStyle = '#2b313a'; a.fillRect(x + 7, 12, 5, 3); }
  if (abajo[1] != null) { const x = abajo[1] * 16 + 3; a.fillStyle = id === 'fusil' ? '#c27a2a' : '#2b313a'; a.fillRect(x, 12, 9, 8); a.fillRect(x + 2, 19, 9, 8); }
}
function lienzoPieza(id, rot = 0) {
  const k = id + '|' + (rot % 4); if (PIEZA_CACHE[k]) return PIEZA_CACHE[k];
  const f = FORMAS[id] || ['X'], base = formaDe(id), W = base.w * 16, H = base.h * 16, D = OBJ[id] || { r: 0 };
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
  const [fondo, borde] = RAR_PIEZA[Math.min(4, D.r || 0)];
  for (const [x, y] of base.c) { g.fillStyle = borde; g.fillRect(x * 16, y * 16, 16, 16); g.fillStyle = fondo; g.fillRect(x * 16 + 1, y * 16 + 1, 14, 14); }
  for (const [x, y] of base.c) {
    if (base.c.some(([a, b]) => a === x + 1 && b === y)) { g.fillStyle = fondo; g.fillRect(x * 16 + 15, y * 16 + 1, 2, 14); }
    if (base.c.some(([a, b]) => a === x && b === y + 1)) { g.fillStyle = fondo; g.fillRect(x * 16 + 1, y * 16 + 15, 14, 2); }
  }
  // el objeto: las armas, dibujadas a su medida; el resto, su icono lo más grande que quepa, centrado
  const art = document.createElement('canvas'); art.width = W; art.height = H; const a = art.getContext('2d');
  if (ARMAS[id] && f.length > 1) arteArma(a, id, f);
  else {
    const ic = iconoLienzo(id), esc = Math.max(1, Math.floor(Math.min(W, H) / 16));
    a.imageSmoothingEnabled = false; a.drawImage(ic, 1, 1, 16, 16, Math.round((W - 16 * esc) / 2), Math.round((H - 16 * esc) / 2), 16 * esc, 16 * esc);
    // que no se salga de sus casillas (las formas con huecos)
    const m = document.createElement('canvas'); m.width = W; m.height = H; const mg = m.getContext('2d'); mg.fillStyle = '#000'; for (const [x, y] of base.c) mg.fillRect(x * 16, y * 16, 16, 16);
    a.globalCompositeOperation = 'destination-in'; a.drawImage(m, 0, 0); a.globalCompositeOperation = 'source-over';
  }
  if (ARMAS[id] && f.length > 1) {
    const s = document.createElement('canvas'); s.width = W; s.height = H; const sg = s.getContext('2d');
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) sg.drawImage(art, dx, dy);
    sg.globalCompositeOperation = 'source-in'; sg.fillStyle = CONTORNO; sg.fillRect(0, 0, W, H); g.drawImage(s, 0, 0);
  }
  g.drawImage(art, 0, 0);
  // girado
  let out = cv;
  if (rot % 4) {
    out = document.createElement('canvas'); const t = rot % 2 === 1; out.width = t ? H : W; out.height = t ? W : H;
    const o = out.getContext('2d'); o.translate(out.width / 2, out.height / 2); o.rotate(rot * Math.PI / 2); o.drawImage(cv, -W / 2, -H / 2);
  }
  return (PIEZA_CACHE[k] = out);
}
