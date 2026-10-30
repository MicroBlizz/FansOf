// Fans of Rouflage · LA BARRERA DE LOS BECARIOS EN MI ESCENARIO (pedido por Daniel el 25-10-2026: «he podido ir a la sala de los cazadores y
// esconderme ahí; se tiene que cerrar su puerta como en el juego normal»). En los mapas de siempre, la sala de espera tiene UNA puerta (PUERTA,
// mapa-datos.js) que se cierra al empezar y se abre cuando empieza la caza. En un escenario hecho por el jugador la sala puede tener varias
// salidas, así que aquí se cierran TODAS: cada casilla de suelo pegada por fuera a la sala de espera es barrera mientras PUERTA.cerrada (el mismo
// estado que la puerta de siempre, partida.js). Se juntan en tramos para dibujarlas como la barrera de Recursos Humanos (dos postes y el haz rojo).
// En la sala con amigos (fase 'sala') y en las visitas no hay barrera: ahí se pasea libre.
// · barrerasDe(M, z): los tramos alrededor de la zona z del mundo M (mapaDeEscenario las guarda en el mapa como `barreras`).
// · cargaDatosMapa (mapa-datos.js) las deja en BARRERAS; chocaCaja, rayo y celdaLibre (mapa.js) las miran; pintaEscena (dibujo.js) las pinta.
'use strict';

function barrerasDe(M, z) {
  if (!z) return [];
  const suelo = (i, j) => i >= 0 && j >= 0 && i < M.MW && j < M.MH && M.grid[j * M.MW + i] === SUELO, out = [];
  // arriba y abajo: tramos en horizontal (se pasa en vertical); izquierda y derecha: tramos en vertical
  for (const j of [z.y - 1, z.y + z.h]) {
    let i0 = null;
    for (let i = z.x; i <= z.x + z.w; i++) {
      const s = i < z.x + z.w && suelo(i, j);
      if (s && i0 === null) i0 = i;
      if (!s && i0 !== null) { out.push({ x: i0 * CEL, y: j * CEL, w: (i - i0) * CEL, h: CEL, hor: true }); i0 = null; }
    }
  }
  for (const i of [z.x - 1, z.x + z.w]) {
    let j0 = null;
    for (let j = z.y; j <= z.y + z.h; j++) {
      const s = j < z.y + z.h && suelo(i, j);
      if (s && j0 === null) j0 = j;
      if (!s && j0 !== null) { out.push({ x: i * CEL, y: j0 * CEL, w: CEL, h: (j - j0) * CEL, hor: false }); j0 = null; }
    }
  }
  return out;
}
// ¿está cerrada ahora? Como la puerta de siempre, salvo en la sala con amigos y en las visitas
const barreraCerrada = () => BARRERAS.length > 0 && PUERTA.cerrada && J.fase !== 'sala';
const enBarreraCaja = (x0, y0, x1, y1) => { for (const b of BARRERAS) if (x0 < b.x + b.w && x1 > b.x && y0 < b.y + b.h && y1 > b.y) return true; return false; };
const enBarreraCelda = (i, j) => { const x = i * CEL + CEL / 2, y = j * CEL + CEL / 2; for (const b of BARRERAS) if (x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h) return true; return false; };

// el dibujo: dos postes en los extremos del tramo y el haz rojo entre ellos, que se apaga al abrirse
function pintaBarrera(c, t, b) {
  const a = 1 - PUERTA.abierta;
  if (J.fase === 'sala' || a <= 0.02) return;
  const p0 = b.hor ? [b.x + 5, b.y + b.h / 2] : [b.x + b.w / 2, b.y + 6], p1 = b.hor ? [b.x + b.w - 5, b.y + b.h / 2] : [b.x + b.w / 2, b.y + b.h - 4];
  c.globalAlpha = a * (0.75 + Math.sin(t * 9) * 0.1);
  for (const d of [-6, 0, 6]) {
    const q = b.hor ? [p0[0], p0[1] + d, p1[0], p1[1] + d] : [p0[0] + d, p0[1], p1[0] + d, p1[1]];
    raya(c, q, '#ff4b5c', 4.5); raya(c, q, '#ffd0d4', 1.4);
  }
  c.globalAlpha = 1;
  for (const [x, y] of [p0, p1]) { forma(c, caja(x - 9, y - 9, 18, 14, 3), '#3d4063', 3); punto(c, x, y - 3, 2.4, a > 0.5 ? '#ff4b5c' : '#7ee04a'); }
}
