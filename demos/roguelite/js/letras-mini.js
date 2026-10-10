// Fans of Roguelite · La letra pequeña (5 de alto) para el chat del directo: ocupa la mitad que la normal y se lee igual.
// Sin tildes encima (no caben): la Á se escribe como A; la Ñ lleva su rayita. También sirve para explicaciones que no caben.
'use strict';

const MINI = {
  A: ['.#.', '#.#', '###', '#.#', '#.#'], B: ['##.', '#.#', '##.', '#.#', '##.'], C: ['.##', '#..', '#..', '#..', '.##'], D: ['##.', '#.#', '#.#', '#.#', '##.'],
  E: ['###', '#..', '##.', '#..', '###'], F: ['###', '#..', '##.', '#..', '#..'], G: ['.##', '#..', '#.#', '#.#', '.##'], H: ['#.#', '#.#', '###', '#.#', '#.#'],
  I: ['###', '.#.', '.#.', '.#.', '###'], J: ['..#', '..#', '..#', '#.#', '.#.'], K: ['#.#', '#.#', '##.', '#.#', '#.#'], L: ['#..', '#..', '#..', '#..', '###'],
  M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'], N: ['#..#', '##.#', '#.##', '#..#', '#..#'], Ñ: ['####', '#..#', '##.#', '#.##', '#..#'], O: ['.#.', '#.#', '#.#', '#.#', '.#.'],
  P: ['##.', '#.#', '##.', '#..', '#..'], Q: ['.#.', '#.#', '#.#', '##.', '.##'], R: ['##.', '#.#', '##.', '#.#', '#.#'], S: ['.##', '#..', '.#.', '..#', '##.'],
  T: ['###', '.#.', '.#.', '.#.', '.#.'], U: ['#.#', '#.#', '#.#', '#.#', '###'], V: ['#.#', '#.#', '#.#', '#.#', '.#.'], W: ['#...#', '#...#', '#.#.#', '##.##', '#...#'],
  X: ['#.#', '#.#', '.#.', '#.#', '#.#'], Y: ['#.#', '#.#', '.#.', '.#.', '.#.'], Z: ['###', '..#', '.#.', '#..', '###'],
  0: ['###', '#.#', '#.#', '#.#', '###'], 1: ['.#.', '##.', '.#.', '.#.', '###'], 2: ['##.', '..#', '.#.', '#..', '###'], 3: ['##.', '..#', '.#.', '..#', '##.'],
  4: ['#.#', '#.#', '###', '..#', '..#'], 5: ['###', '#..', '##.', '..#', '##.'], 6: ['.##', '#..', '###', '#.#', '###'], 7: ['###', '..#', '.#.', '.#.', '.#.'],
  8: ['###', '#.#', '###', '#.#', '###'], 9: ['###', '#.#', '###', '..#', '##.'],
  ' ': ['..', '..', '..', '..', '..'], '.': ['.', '.', '.', '.', '#'], ',': ['.', '.', '.', '#', '#'], ':': ['.', '#', '.', '#', '.'], ';': ['.', '#', '.', '#', '#'],
  '!': ['#', '#', '#', '.', '#'], '¡': ['#', '.', '#', '#', '#'], '?': ['##.', '..#', '.#.', '...', '.#.'], '¿': ['.#.', '...', '.#.', '#..', '.##'],
  '-': ['...', '...', '###', '...', '...'], '+': ['...', '.#.', '###', '.#.', '...'], '%': ['#.#', '..#', '.#.', '#..', '#.#'], '/': ['..#', '..#', '.#.', '#..', '#..'],
  '(': ['.#', '#.', '#.', '#.', '.#'], ')': ['#.', '.#', '.#', '.#', '#.'], '«': ['....', '.#.#', '#.#.', '.#.#', '....'], '»': ['....', '#.#.', '.#.#', '#.#.', '....'],
  '"': ['#.#', '#.#', '...', '...', '...'], "'": ['#', '#', '.', '.', '.'], '_': ['...', '...', '...', '...', '###'], '*': ['...', '#.#', '.#.', '#.#', '...'],
  '#': ['#.#', '###', '#.#', '###', '#.#'], '$': ['.##', '##.', '.#.', '.##', '##.'], '€': ['.##', '##.', '#..', '##.', '.##'], '=': ['...', '###', '...', '###', '...'],
};
const QUITA_TILDE = { Á: 'A', É: 'E', Í: 'I', Ó: 'O', Ú: 'U', Ü: 'U', À: 'A', È: 'E', Ò: 'O', Ç: 'C' };
const limpiaMini = s => [...limpiaTexto(s)].map(ch => QUITA_TILDE[ch] || ch).join('');
const glifoMini = ch => MINI[ch] || MINI['?'];
function anchoMini(s) { let w = 0; for (const ch of limpiaMini(s)) w += glifoMini(ch)[0].length + 1; return Math.max(0, w - 1); }
// escribe en pequeño en (x, y) = esquina de arriba; devuelve el ancho
const MINI_CACHE = new Map();
function escribeMini(ctx, s, x, y, color) {
  const clave = s + '|' + color;
  let c = MINI_CACHE.get(clave);
  if (!c) {
    if (MINI_CACHE.size > 300) MINI_CACHE.clear();
    const t = limpiaMini(s);
    c = document.createElement('canvas'); c.width = Math.max(1, anchoMini(s) + 1); c.height = 6;
    const g = c.getContext('2d');
    let px = 0;
    for (const ch of t) {
      const gl = glifoMini(ch);
      gl.forEach((fila, r) => { for (let k = 0; k < fila.length; k++) if (fila[k] === '#') { g.fillStyle = OL; g.fillRect(px + k + 1, r + 1, 1, 1); } });
      gl.forEach((fila, r) => { for (let k = 0; k < fila.length; k++) if (fila[k] === '#') { g.fillStyle = color; g.fillRect(px + k, r, 1, 1); } });
      px += gl[0].length + 1;
    }
    MINI_CACHE.set(clave, c);
  }
  ctx.drawImage(c, Math.round(x), Math.round(y));
  return c.width - 1;
}
// parte un texto en líneas que caben en «ancho» (la primera puede ser más corta: «primera»), como envuelve()
function envuelveMini(s, ancho, primera = ancho) {
  const out = [];
  let linea = '';
  for (const pal of String(s).split(/\s+/).filter(Boolean)) {
    const prueba = linea ? linea + ' ' + pal : pal, cabe = out.length ? ancho : primera;
    if (anchoMini(prueba) <= cabe || !linea) linea = prueba;
    else { out.push(linea); linea = pal; }
  }
  if (linea) out.push(linea);
  return out;
}
