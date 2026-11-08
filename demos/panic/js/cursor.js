// Fans of Panic · El cúter: se mueve casilla a casilla por lo destapado y, al entrar en lo tapado, va dejando TRAZO. Al volver a
// lo destapado, el trazo se cierra (js/tablero.js). Si se para a medio trazo, arde la mecha desde el principio del trazo.
'use strict';

const CUR = { x: 0, y: 0, dir: null, pend: null, acum: 0, trazando: false, trail: [], quieto: 0, ultimo: [0, 1] };

function colocaCursor() {
  CUR.x = Math.floor(TAB.cols / 2); CUR.y = TAB.filas - 1; CUR.dir = null; CUR.pend = null; CUR.acum = 0;
  CUR.trazando = false; CUR.trail = []; CUR.quieto = 0; CUR.ultimo = [0, -1];
}

function pideDir(d) {
  if (JUEGO.modo !== 'juego') return;
  const act = CUR.dir;
  if (act && act[0] === d[0] && act[1] === d[1]) return;
  CUR.pend = d; SONIDO.gira();
}
function paraCursor() { CUR.pend = null; CUR.dir = null; }

const velCursor = () => (JUEGO.rapidoT > 0 ? AJUSTES.velCursorRapido : AJUSTES.velCursor);

function avanzaCursor(dt) {
  if (CUR.pend) { CUR.dir = CUR.pend; CUR.pend = null; }
  if (!CUR.dir) { quietoCursor(dt); return; }
  CUR.acum += dt * velCursor();
  while (CUR.acum >= 1) { CUR.acum -= 1; if (!pasoCursor()) { CUR.dir = null; CUR.acum = 0; break; } }
  if (CUR.dir) { CUR.quieto = 0; JUEGO.mechaT = 0; JUEGO.mecha = null; }
  else quietoCursor(dt);
}

// un paso del cúter; false si no puede seguir
function pasoCursor() {
  const [dx, dy] = CUR.dir, nx = CUR.x + dx, ny = CUR.y + dy;
  if (!enTablero(nx, ny)) return false;
  const sig = TAB.cel[idx(nx, ny)];
  if (sig === TRAZO) return false;
  CUR.ultimo = CUR.dir;
  if (sig === TAPADA) {
    if (!CUR.trazando) { CUR.trazando = true; CUR.trail = []; }
    TAB.cel[idx(nx, ny)] = TRAZO; CUR.trail.push(idx(nx, ny));
    CUR.x = nx; CUR.y = ny;
    return true;
  }
  CUR.x = nx; CUR.y = ny;
  if (CUR.trazando) { CUR.trazando = false; cierraCorte(); }
  return true;
}

// parado: si hay trazo a medias, la mecha
function quietoCursor(dt) {
  if (!CUR.trazando) return;
  CUR.quieto += dt;
  if (CUR.quieto < AJUSTES.mecha) return;
  const J = JUEGO;
  if (!J.mecha) { J.mecha = { i: 0, x: 0, y: 0, acum: 0 }; SONIDO.mecha(); }
  J.mechaT = 1; J.mecha.acum += dt * AJUSTES.velMecha;
  while (J.mecha.acum >= 1) {
    J.mecha.acum -= 1; J.mecha.i++;
    if (J.mecha.i >= CUR.trail.length) { muere('mecha'); return; }
    if (J.mecha.i % 3 === 0) SONIDO.mecha();
  }
  const c = CUR.trail[Math.min(J.mecha.i, CUR.trail.length - 1)];
  J.mecha.x = c % TAB.cols; J.mecha.y = (c - J.mecha.x) / TAB.cols;
}

// pintar el cúter (sprite de Yoshi, girado hacia donde va; mientras no esté, un disco)
function pintaCursor(t) {
  const { x0, y0, c } = TAB, px = x0 + (CUR.x + 0.5) * c, py = y0 + (CUR.y + 0.5) * c;
  const alto = c * 2.6 * AJUSTES.escala + (CUR.trazando ? Math.sin(t * 30) * 1.5 : 0);
  if (JUEGO.escudo) circulo(px, py, alto * 0.7, 'rgba(95,242,255,.25)', COL.cian, 1.5);
  if (JUEGO.fantasmaT > 0) G.globalAlpha = 0.5 + Math.sin(t * 10) * 0.2;
  pintaSprite('cuter', px, py, alto, Math.atan2(CUR.ultimo[1], CUR.ultimo[0]) + Math.PI / 2, CUR.trazando ? COL.oro : COL.rosa, '');
  G.globalAlpha = 1;
}
