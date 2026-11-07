// Fans of Panic · Tablero: la rejilla de casillas del panel. Cada casilla está TAPADA (0), DESTAPADA (1) o es TRAZO (2, la línea
// que vas cortando). El borde exterior empieza destapado: por ahí se mueve el cúter. Al cerrar un trazo, se destapa todo lo que
// quede sin el Inspector dentro (relleno desde su casilla). La silueta (SIL) es la parte de la ilustración que cuenta para el porcentaje.
'use strict';

const TAB = { x0: 0, y0: 0, w: 360, h: 480, cols: 60, filas: 80, c: 6, cel: null, sil: null, total: 0 };
const TAPADA = 0, DESTAPADA = 1, TRAZO = 2;

function calculaTablero(W, H) {
  TAB.x0 = 0; TAB.y0 = 66; TAB.w = W; TAB.c = W / TAB.cols;
  TAB.filas = Math.max(60, Math.min(90, Math.floor((H - 66 - 92) / TAB.c)));
  TAB.h = TAB.filas * TAB.c;
}

const idx = (x, y) => y * TAB.cols + x;
const enTablero = (x, y) => x >= 0 && y >= 0 && x < TAB.cols && y < TAB.filas;
const celda = (x, y) => (enTablero(x, y) ? TAB.cel[idx(x, y)] : DESTAPADA);   // fuera del tablero cuenta como destapado (es el marco)

// un tablero nuevo: todo tapado menos el marco, y la silueta (un óvalo centrado, mientras Yoshi no dé la forma de verdad)
function nuevoTablero() {
  const n = TAB.cols * TAB.filas;
  TAB.cel = new Uint8Array(n); TAB.sil = new Uint8Array(n); TAB.total = 0;
  const cx = (TAB.cols - 1) / 2, cy = (TAB.filas - 1) / 2, rx = TAB.cols * 0.36, ry = TAB.filas * 0.4;
  for (let y = 0; y < TAB.filas; y++) for (let x = 0; x < TAB.cols; x++) {
    const i = idx(x, y);
    if (x === 0 || y === 0 || x === TAB.cols - 1 || y === TAB.filas - 1) TAB.cel[i] = DESTAPADA;
    const dx = (x - cx) / rx, dy = (y - cy) / ry;
    if (dx * dx + dy * dy <= 1) { TAB.sil[i] = 1; TAB.total++; }
  }
}

// parte destapada de la silueta (0..1) y casillas tapadas en total
function porcentaje() {
  let d = 0;
  for (let i = 0; i < TAB.cel.length; i++) if (TAB.sil[i] && TAB.cel[i] === DESTAPADA) d++;
  return d / TAB.total;
}
function tapadasTotal() { let n = 0; for (let i = 0; i < TAB.cel.length; i++) if (TAB.cel[i] === TAPADA) n++; return n; }

// relleno desde una casilla: marca en `vis` todas las casillas TAPADAS conectadas (por los cuatro lados). Devuelve cuántas.
function rellena(x0, y0, vis) {
  if (celda(x0, y0) !== TAPADA) return 0;
  const pila = [idx(x0, y0)]; vis[pila[0]] = 1; let n = 0;
  while (pila.length) {
    const i = pila.pop(); n++;
    const x = i % TAB.cols, y = (i - x) / TAB.cols;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (!enTablero(nx, ny)) continue;
      const j = idx(nx, ny);
      if (!vis[j] && TAB.cel[j] === TAPADA) { vis[j] = 1; pila.push(j); }
    }
  }
  return n;
}

// cerrar un trazo: todo lo tapado que NO alcance el Inspector se destapa, y el trazo también. Devuelve las casillas destapadas
// y, de ellas, cuántas de la silueta.
function cierraTrazo(jx, jy) {
  const vis = new Uint8Array(TAB.cel.length);
  rellena(jx, jy, vis);   // lo que queda del lado del jefe
  let n = 0, sil = 0;
  for (let i = 0; i < TAB.cel.length; i++) {
    if (TAB.cel[i] === TRAZO || (TAB.cel[i] === TAPADA && !vis[i])) { TAB.cel[i] = DESTAPADA; n++; if (TAB.sil[i]) sil++; }
  }
  return { n, sil };
}

// borrar un trazo a medias (al morir): vuelve a tapado
function borraTrazo() { for (let i = 0; i < TAB.cel.length; i++) if (TAB.cel[i] === TRAZO) TAB.cel[i] = TAPADA; }

// casillas tapadas que alcanza el jefe (para saber si está ATRAPADO)
function libresDelJefe(jx, jy) { return rellena(jx, jy, new Uint8Array(TAB.cel.length)); }

// ¿es una casilla destapada con alguna tapada al lado? (el borde por el que corren los becarios)
function esBorde(x, y) {
  if (celda(x, y) !== DESTAPADA) return false;
  return celda(x + 1, y) !== DESTAPADA || celda(x - 1, y) !== DESTAPADA || celda(x, y + 1) !== DESTAPADA || celda(x, y - 1) !== DESTAPADA;
}

// ---------- pintar ----------
// la ilustración solo se ve por las casillas destapadas; el resto es el panel gris. Se pinta por filas de casillas seguidas.
function pintaTablero(t) {
  const { x0, y0, w, h, c } = TAB;
  pintaPanel(x0, y0, w, h, t);
  if (!ILUS.lienzo) return;
  G.save(); G.beginPath();
  for (let y = 0; y < TAB.filas; y++) {
    let desde = -1;
    for (let x = 0; x <= TAB.cols; x++) {
      const d = x < TAB.cols && TAB.cel[idx(x, y)] === DESTAPADA;
      if (d && desde < 0) desde = x;
      else if (!d && desde >= 0) { G.rect(x0 + desde * c, y0 + y * c, (x - desde) * c, c); desde = -1; }
    }
  }
  G.clip(); G.drawImage(ILUS.lienzo, x0, y0, w, h); G.restore();
  pintaTrazo(t);
}

// el trazo que vas cortando: una línea viva que cambia de color según el peligro
function pintaTrazo(t) {
  const { x0, y0, c } = TAB, J = JUEGO;
  const col = J.mechaT > 0 ? '#ff3b3b' : J.peligro ? COL.oro : COL.blanco;
  G.fillStyle = col; G.shadowColor = col; G.shadowBlur = 6;
  for (let i = 0; i < TAB.cel.length; i++) if (TAB.cel[i] === TRAZO) { const x = i % TAB.cols, y = (i - x) / TAB.cols; G.fillRect(x0 + x * c + 1, y0 + y * c + 1, c - 2, c - 2); }
  G.shadowBlur = 0;
  if (J.mechaT > 0 && J.mecha) { const m = J.mecha; circulo(x0 + (m.x + 0.5) * c, y0 + (m.y + 0.5) * c, c * 0.9 + Math.sin(t * 40) * 1.5, '#ffb347', COL.tinta, 1.5); }
}
