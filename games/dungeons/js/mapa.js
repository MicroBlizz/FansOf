// Fans of Dungeons · El mapa de una planta: una rejilla de casillas (muro, suelo, puerta, escalera, mueble…), lo que se ha
// visto de ella y las trampas escondidas. Las funciones de aquí las usan el generador, la visión, el camino y el pintado.
'use strict';

const CASILLA = { MURO: 0, SUELO: 1, PUERTA: 2, PUERTA_ABIERTA: 3, LLEGADA: 4, SUBIDA: 5, MUEBLE: 6, PUESTO: 7, MAQUINA: 8, CAFETERA: 9, PUERTA_CERRADA: 10, ALFOMBRA: 11, ALFOMBRA2: 12, ALTAR: 13, ROMPIBLE: 14, JAULA: 15, ATRIL: 16, REJA: 17 };
const PASABLE = new Set([CASILLA.SUELO, CASILLA.PUERTA_ABIERTA, CASILLA.LLEGADA, CASILLA.SUBIDA, CASILLA.ALFOMBRA, CASILLA.ALFOMBRA2]);
const OPACO = new Set([CASILLA.MURO, CASILLA.PUERTA, CASILLA.PUERTA_CERRADA, CASILLA.MUEBLE, CASILLA.MAQUINA, CASILLA.PUESTO, CASILLA.CAFETERA, CASILLA.ALTAR]);

function nuevoMapa(w, h, zona, planta) {
  return {
    w, h, zona, planta,
    t: new Uint8Array(w * h),            // la casilla (CASILLA.*)
    v: new Uint8Array(w * h),            // variante de dibujo (suelos, muebles)
    vis: new Uint8Array(w * h),          // 0 nunca vista, 1 recordada, 2 a la vista
    salas: [],                           // { x, y, w, h, cx, cy, tipo }
    trampas: new Map(),                  // clave(x, y) → { tipo, vista }
    llegada: null, salida: null,         // { x, y }
    usado: {},                           // cosas de un solo uso (cafetera)
  };
}
const dentroM = (m, x, y) => x >= 0 && y >= 0 && x < m.w && y < m.h;
const enM = (m, x, y) => dentroM(m, x, y) ? m.t[y * m.w + x] : CASILLA.MURO;
const ponM = (m, x, y, t) => { if (dentroM(m, x, y)) m.t[y * m.w + x] = t; };
const pasableM = (m, x, y) => PASABLE.has(enM(m, x, y));
const opacoM = (m, x, y) => OPACO.has(enM(m, x, y));
const visM = (m, x, y) => dentroM(m, x, y) ? m.vis[y * m.w + x] : 0;
// rellena un rectángulo
function rellenaM(m, x, y, w, h, t) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) ponM(m, i, j, t); }
// la sala en la que cae una casilla (o null)
function salaEn(m, x, y) { for (const s of m.salas) if (x >= s.x && y >= s.y && x < s.x + s.w && y < s.y + s.h) return s; return null; }
// casillas de suelo de una sala (las que tienen la casilla pedida), para repartir cosas
function suelosDe(m, s, filtro) {
  const out = [];
  for (let j = s.y; j < s.y + s.h; j++) for (let i = s.x; i < s.x + s.w; i++) if (enM(m, i, j) === CASILLA.SUELO && (!filtro || filtro(i, j))) out.push([i, j]);
  return out;
}
// cuántas casillas pasables hay alrededor (para no tapar pasillos con muebles)
function pasablesAlrededor(m, x, y) { let n = 0; for (const [dx, dy] of DIRS) if (pasableM(m, x + dx, y + dy)) n++; return n; }

// distancias a pie desde (x0, y0) por las casillas pasables: Int16Array con -1 donde no se llega. bloquea(x, y) corta el paso
function campoM(m, origenes, max = 9999, bloquea) {
  const d = new Int16Array(m.w * m.h).fill(-1), cola = [];
  for (const [x, y] of origenes) if (dentroM(m, x, y)) { d[y * m.w + x] = 0; cola.push(x, y); }
  for (let i = 0; i < cola.length; i += 2) {
    const x = cola[i], y = cola[i + 1], k = d[y * m.w + x];
    if (k >= max) continue;
    for (const [dx, dy] of DIRS) {
      const nx = x + dx, ny = y + dy;
      if (!dentroM(m, nx, ny) || d[ny * m.w + nx] >= 0) continue;
      const t = enM(m, nx, ny);
      if (!PASABLE.has(t) && t !== CASILLA.PUERTA) continue;   // las puertas cerradas se abren al pasar
      if (bloquea && bloquea(nx, ny)) continue;
      d[ny * m.w + nx] = k + 1; cola.push(nx, ny);
    }
  }
  return d;
}
// el camino de (x0, y0) a (x1, y1): lista de [x, y] sin el origen (vacía si no se llega)
function caminoM(m, x0, y0, x1, y1, bloquea, max = 400) {
  const d = campoM(m, [[x1, y1]], max, bloquea ? (x, y) => !(x === x0 && y === y0) && bloquea(x, y) : null);   // el origen nunca se bloquea (ahí está quien anda)
  if (d[y0 * m.w + x0] < 0) return [];
  const out = []; let x = x0, y = y0;
  while (x !== x1 || y !== y1) {
    let mejor = null, mk = d[y * m.w + x];
    for (const [dx, dy] of DIRS) { const nx = x + dx, ny = y + dy; if (dentroM(m, nx, ny) && d[ny * m.w + nx] >= 0 && d[ny * m.w + nx] < mk) { mk = d[ny * m.w + nx]; mejor = [nx, ny]; } }
    if (!mejor) break;
    out.push(mejor); x = mejor[0]; y = mejor[1];
    if (out.length > max) break;
  }
  return out;
}
// el plano en letras, para mirarlo sin el juego (# muro, . suelo, + puerta, > subida, < llegada, M mueble, T tienda)
function planoM(m) {
  const L = { [CASILLA.MURO]: '#', [CASILLA.SUELO]: '.', [CASILLA.PUERTA]: '+', [CASILLA.PUERTA_ABIERTA]: '/', [CASILLA.LLEGADA]: '<', [CASILLA.SUBIDA]: '>', [CASILLA.MUEBLE]: 'M', [CASILLA.PUESTO]: 'T', [CASILLA.MAQUINA]: 'P', [CASILLA.CAFETERA]: 'C', [CASILLA.PUERTA_CERRADA]: 'X', [CASILLA.ALFOMBRA]: ',', [CASILLA.ALFOMBRA2]: ';', [CASILLA.ALTAR]: 'A', [CASILLA.ROMPIBLE]: 'R', [CASILLA.JAULA]: 'J', [CASILLA.ATRIL]: 'L', [CASILLA.REJA]: '|' };
  const filas = [];
  for (let j = 0; j < m.h; j++) { let s = ''; for (let i = 0; i < m.w; i++) s += L[m.t[j * m.w + i]] || '?'; filas.push(s); }
  return filas.join('\n');
}
