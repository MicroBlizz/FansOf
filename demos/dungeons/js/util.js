// Fans of Dungeons · Utilidades: números al azar con semilla (mulberry32, repetible), ayudas de listas y de rejilla.
// Todo lo que decide la mazmorra usa el generador con semilla; lo que solo se ve (chispas) usa Math.random.
'use strict';

const TAU = Math.PI * 2;

// generador repetible: con la misma semilla salen los mismos números
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
// un juego de dados atado a una semilla: entre(a, b) entero incluidos, elige(lista), baraja(lista), prob(p)
function dados(sem) {
  const f = mulberry32(sem);
  const d = {
    f,
    entre: (a, b) => a + Math.floor(f() * (b - a + 1)),
    elige: l => l[Math.floor(f() * l.length)],
    prob: p => f() < p,
    baraja: l => { const o = l.slice(); for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(f() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; } return o; },
    // elige una clave según pesos { a: 3, b: 1 }
    pesado: pesos => {
      let total = 0; for (const k in pesos) total += pesos[k];
      let r = f() * total;
      for (const k in pesos) { r -= pesos[k]; if (r < 0) return k; }
      return Object.keys(pesos)[0];
    },
  };
  return d;
}
// dados sin semilla, para lo que no tiene que repetirse (combate, chispas)
const D = dados(Math.floor(Math.random() * 2147483647));

const limita = (v, a, b) => v < a ? a : v > b ? b : v;
const suave = (a, b, t) => a + (b - a) * t;
// pasos entre dos casillas (sin diagonales) y distancia «de rey» (con ellas)
const pasos = (ax, ay, bx, by) => Math.abs(ax - bx) + Math.abs(ay - by);
const rey = (ax, ay, bx, by) => Math.max(Math.abs(ax - bx), Math.abs(ay - by));
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const DIRS8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
const clave = (x, y) => y * 1000 + x;

// casillas de la línea recta entre dos puntos (sin el primero, con el último): sirve para la visión y los disparos
function linea(x0, y0, x1, y1) {
  const out = [];
  let dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, e = dx + dy;
  let x = x0, y = y0;
  for (let n = 0; n < 200; n++) {
    if (x === x1 && y === y1) break;
    const e2 = 2 * e;
    if (e2 >= dy) { e += dy; x += sx; }
    if (e2 <= dx) { e += dx; y += sy; }
    out.push([x, y]);
  }
  return out;
}
// rellena una plantilla: fmt('Planta {n}', { n: 3 })
function fmt(s, v) { return s.replace(/\{(\w+)\}/g, (m, k) => v[k] === undefined ? m : v[k]); }
