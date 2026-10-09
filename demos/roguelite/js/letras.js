// Fans of Roguelite (prototipo) · La letra de píxeles: 7 de alto, en mayúsculas, con tildes, ñ, ¿ y ¡. Se escribe con contorno
// oscuro y sombra debajo, como los letreros de los juegos de 16 bits. Cada texto se dibuja una vez y se guarda.
'use strict';

const LETRA = {
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
  C: ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'],
  D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  G: ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.###.'],
  H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  I: ['###', '.#.', '.#.', '.#.', '.#.', '.#.', '###'],
  J: ['..###', '...#.', '...#.', '...#.', '#..#.', '#..#.', '.##..'],
  K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
  N: ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  Q: ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  V: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  W: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#'],
  X: ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
  Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  Z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
  0: ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'],
  1: ['.#.', '##.', '.#.', '.#.', '.#.', '.#.', '###'],
  2: ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
  3: ['####.', '....#', '....#', '.###.', '....#', '....#', '####.'],
  4: ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
  5: ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  6: ['.###.', '#....', '#....', '####.', '#...#', '#...#', '.###.'],
  7: ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'],
  8: ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
  9: ['.###.', '#...#', '#...#', '.####', '....#', '....#', '.###.'],
  ' ': ['..', '..', '..', '..', '..', '..', '..'],
  '.': ['.', '.', '.', '.', '.', '.', '#'],
  ',': ['..', '..', '..', '..', '..', '.#', '#.'],
  '!': ['#', '#', '#', '#', '#', '.', '#'],
  '¡': ['#', '.', '#', '#', '#', '#', '#'],
  '?': ['.###.', '#...#', '....#', '...#.', '..#..', '.....', '..#..'],
  '¿': ['..#..', '.....', '..#..', '.#...', '#....', '#...#', '.###.'],
  ':': ['.', '.', '#', '.', '.', '#', '.'],
  ';': ['..', '..', '.#', '..', '..', '.#', '#.'],
  '-': ['...', '...', '...', '###', '...', '...', '...'],
  '+': ['...', '...', '.#.', '###', '.#.', '...', '...'],
  '=': ['...', '...', '###', '...', '###', '...', '...'],
  '%': ['##..#', '##.#.', '...#.', '..#..', '.#...', '.#.##', '#..##'],
  '/': ['....#', '...#.', '...#.', '..#..', '.#...', '.#...', '#....'],
  '(': ['.#', '#.', '#.', '#.', '#.', '#.', '.#'],
  ')': ['#.', '.#', '.#', '.#', '.#', '.#', '#.'],
  '«': ['....', '....', '.#.#', '#.#.', '.#.#', '....', '....'],
  '»': ['....', '....', '#.#.', '.#.#', '#.#.', '....', '....'],
  '"': ['#.#', '#.#', '...', '...', '...', '...', '...'],
  "'": ['#', '#', '.', '.', '.', '.', '.'],
  '·': ['.', '.', '.', '#', '.', '.', '.'],
  '€': ['..###', '.#...', '####.', '.#...', '####.', '.#...', '..###'],
  '>': ['#..', '.#.', '..#', '..#', '..#', '.#.', '#..'],
  '<': ['..#', '.#.', '#..', '#..', '#..', '.#.', '..#'],
  '*': ['.....', '#.#.#', '.###.', '#####', '.###.', '#.#.#', '.....'],
};
// letras con tilde: la letra base y la marca encima (filas -2 y -1)
const TILDES = { 'Á': ['A', 'agudo'], 'É': ['E', 'agudo'], 'Í': ['I', 'agudo'], 'Ó': ['O', 'agudo'], 'Ú': ['U', 'agudo'], 'Ü': ['U', 'dieresis'], 'Ñ': ['N', 'virgulilla'], 'À': ['A', 'grave'], 'Ç': ['C', 'cedilla'] };
// cada marca: [fila, columna desde el centro]; las filas -2 y -1 van encima de la letra y la 7 y la 8, debajo
const MARCAS = { agudo: [[-2, 1], [-1, 0]], grave: [[-2, -1], [-1, 0]], dieresis: [[-1, -1], [-1, 1]], virgulilla: [[-1, -2], [-2, -1], [-2, 0], [-1, 1], [-2, 2]], cedilla: [[7, 0], [8, -1]] };
for (const [t, [base, marca]] of Object.entries(TILDES)) {
  const g = LETRA[base], w = g[0].length, mid = Math.floor(w / 2);
  LETRA[t] = g.map(f => f);
  LETRA[t].marca = MARCAS[marca].map(([r, c]) => [r, mid + c]);
}

const ALTO_LETRA = 7, LINEA = 10;
const limpiaTexto = s => String(s).toUpperCase().replace(/…/g, '...').replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/—|–/g, '-');
const anchoLetra = ch => (LETRA[ch] || LETRA['?'])[0].length;
function anchoTexto(s, esc = 1) {
  s = limpiaTexto(s);
  let w = 0;
  for (const ch of s) w += anchoLetra(ch) + 1;
  return Math.max(0, w - 1) * esc;
}
// parte un texto en líneas que caben en «ancho» píxeles
function envuelve(s, ancho, esc = 1) {
  const out = [];
  for (const parrafo of String(s).split('\n')) {
    let linea = '';
    for (const pal of parrafo.split(' ')) {
      const prueba = linea ? linea + ' ' + pal : pal;
      if (anchoTexto(prueba, esc) <= ancho || !linea) linea = prueba;
      else { out.push(linea); linea = pal; }
    }
    out.push(linea);
  }
  return out;
}

// dibuja el texto en un lienzo propio (con borde y sombra) y lo guarda
const TEXTO_CACHE = new Map();
function lienzoTexto(s, color, esc, borde, color2) {
  const clave = s + '|' + color + '|' + esc + '|' + borde + '|' + (color2 || '');
  let c = TEXTO_CACHE.get(clave);
  if (c) return c;
  if (TEXTO_CACHE.size > 600) TEXTO_CACHE.clear();
  const t = limpiaTexto(s), pad = borde ? 2 : 0;
  const oy = pad + 2 * esc + 1;   // sitio para las tildes
  const w = anchoTexto(t, esc) + pad * 2 + 1, h = oy + ALTO_LETRA * esc + 2 * esc + pad + 2;
  c = document.createElement('canvas'); c.width = Math.max(1, w); c.height = h;
  const g = c.getContext('2d');
  const pix = [];
  let x = 0;
  for (const ch of t) {
    const gl = LETRA[ch] || LETRA['?'];
    gl.forEach((fila, r) => { for (let k = 0; k < fila.length; k++) if (fila[k] === '#') pix.push([x + k, r]); });
    if (gl.marca) for (const [r, k] of gl.marca) pix.push([x + k, r]);
    x += gl[0].length + 1;
  }
  const cuadro = (px, py, col) => { g.fillStyle = col; g.fillRect(pad + px * esc, oy + py * esc, esc, esc); };
  if (borde) {
    g.fillStyle = borde;
    for (const [px, py] of pix) {
      const X = pad + px * esc, Y = oy + py * esc;
      g.fillRect(X - 1, Y - 1, esc + 2, esc + 2);
      g.fillRect(X - 1, Y + esc + 1, esc + 2, 1);   // la sombra de debajo
    }
  }
  for (const [px, py] of pix) cuadro(px, py, color2 && py * 2 >= ALTO_LETRA ? color2 : color);
  c.ox = pad; c.oy = oy;
  TEXTO_CACHE.set(clave, c);
  return c;
}
// escribe en (x, y) = esquina de arriba de la letra. o: { c, esc, borde, alin: 'izq' | 'centro' | 'der', c2, hasta (letras visibles) }
function escribe(ctx, s, x, y, o = {}) {
  const esc = o.esc || 1, color = o.c || '#fff6ea', borde = o.borde === undefined ? OL : o.borde;
  const c = lienzoTexto(s, color, esc, borde, o.c2);
  const w = anchoTexto(s, esc);
  let X = Math.round(x);
  if (o.alin === 'centro') X = Math.round(x - w / 2); else if (o.alin === 'der') X = Math.round(x - w);
  const Y = Math.round(y);
  if (o.hasta !== undefined) {   // efecto máquina de escribir: solo las primeras letras
    const vis = anchoTexto(limpiaTexto(s).slice(0, o.hasta), esc) + (o.hasta > 0 ? 2 : 0);
    if (vis <= 0) return w;
    ctx.drawImage(c, 0, 0, Math.min(c.width, vis + c.ox), c.height, X - c.ox, Y - c.oy, Math.min(c.width, vis + c.ox), c.height);
    return w;
  }
  ctx.drawImage(c, X - c.ox, Y - c.oy);
  return w;
}
