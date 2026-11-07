// Fans of Panic · Enemigos: el Inspector (el jefe del mundo) rebota dentro de lo tapado y mata si toca el trazo o al cúter;
// sus hijos (con el Jefe furioso) son bolas pequeñas que rebotan igual; los becarios-robot de Microblizz corren por el borde
// de lo destapado y matan si te pillan. Se miden en casillas. Los dibujos son de Yoshi (js/sprites.js).
'use strict';

const JEFE = { x: 30, y: 40, vx: 10, vy: 8, r: 5, vel: 10, congelaT: 0, tipo: 'cangrejo', giro: 0 };
const HIJOS = [];
const BECARIOS = []; BECARIOS.huelga = false;
const DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];

function nuevoJefe(nivel, M) {
  const a = Math.random() * Math.PI * 2;
  JEFE.x = TAB.cols / 2; JEFE.y = TAB.filas * 0.45; JEFE.r = nivel.tam / 2;
  JEFE.vel = nivel.jefe; JEFE.vx = Math.cos(a) * JEFE.vel; JEFE.vy = Math.sin(a) * JEFE.vel;
  JEFE.congelaT = 0; JEFE.tipo = M.jefe.tipo; JEFE.giro = 0;
  HIJOS.length = 0;
}

function nuevosHijos(n) {
  for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, vel = JEFE.vel * 0.7; HIJOS.push({ x: JEFE.x, y: JEFE.y, r: 1.6, vel, vx: Math.cos(a) * vel, vy: Math.sin(a) * vel }); }
}

// ¿cabe una bola de radio r en (x, y)? (todo lo que toca tiene que estar tapado)
function bolaCabe(x, y, r) {
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6, px = Math.floor(x + Math.cos(a) * r), py = Math.floor(y + Math.sin(a) * r);
    if (celda(px, py) !== TAPADA) return false;
  }
  return true;
}

// una bola que rebota dentro de lo tapado (el jefe o un hijo)
function avanzaBola(b, dt) {
  const nx = b.x + b.vx * dt, ny = b.y + b.vy * dt;
  if (bolaCabe(nx, ny, b.r)) { b.x = nx; b.y = ny; return; }
  const ex = bolaCabe(nx, b.y, b.r), ey = bolaCabe(b.x, ny, b.r);
  if (ex) b.x = nx; else b.vx = -b.vx;
  if (ey) b.y = ny; else b.vy = -b.vy;
  const a = (!ex && !ey) ? Math.random() * Math.PI * 2 : Math.atan2(b.vy, b.vx) + (Math.random() - 0.5) * 0.6;   // un poco de azar al rebotar
  b.vx = Math.cos(a) * b.vel; b.vy = Math.sin(a) * b.vel;
}

function avanzaJefe(dt) {
  if (JEFE.congelaT > 0) { JEFE.congelaT -= dt; return; }
  JEFE.giro += dt * (Math.abs(JEFE.vx) + Math.abs(JEFE.vy)) * 0.1;
  avanzaBola(JEFE, dt);
  for (const h of HIJOS) avanzaBola(h, dt);
}

// ¿toca una bola el trazo o al cúter mientras traza?
function bolaToca(b) {
  const r = b.r + 0.5, x0 = Math.floor(b.x - r), x1 = Math.ceil(b.x + r), y0 = Math.floor(b.y - r), y1 = Math.ceil(b.y + r);
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    if (!enTablero(x, y)) continue;
    const dx = x + 0.5 - b.x, dy = y + 0.5 - b.y;
    if (dx * dx + dy * dy > r * r) continue;
    if (TAB.cel[idx(x, y)] === TRAZO) return true;
    if (CUR.trazando && x === CUR.x && y === CUR.y) return true;
  }
  return false;
}
const jefeToca = () => JUEGO.fantasmaT <= 0 && (bolaToca(JEFE) || HIJOS.some(bolaToca));

// si al cerrar un corte una bola se queda sobre lo destapado, se recoloca en lo tapado más cercano
function recolocaBola(b) {
  if (bolaCabe(b.x, b.y, b.r)) return;
  let mejor = null, md = 1e9;
  for (let y = 1; y < TAB.filas - 1; y += 2) for (let x = 1; x < TAB.cols - 1; x += 2) {
    if (TAB.cel[idx(x, y)] !== TAPADA) continue;
    const d = (x - b.x) ** 2 + (y - b.y) ** 2;
    if (d < md) { md = d; mejor = [x + 0.5, y + 0.5]; }
  }
  if (mejor) { b.x = mejor[0]; b.y = mejor[1]; }
}
const recolocaJefe = () => recolocaBola(JEFE);
const recolocaHijos = () => HIJOS.forEach(recolocaBola);

// ---------- becarios ----------
function nuevosBecarios(n, vel) {
  BECARIOS.length = 0; BECARIOS.huelga = false;
  for (let i = 0; i < n; i++) BECARIOS.push({ x: i % 2 ? TAB.cols - 1 : 0, y: Math.floor(i / 2) % 2 ? TAB.filas - 1 : 0, d: i % 2 ? 1 : 2, acum: -i * 0.7, vel, t: Math.random() * 6 });
}

function avanzaBecarios(dt) {
  if (JEFE.congelaT > 0 || BECARIOS.huelga) return;
  for (const b of BECARIOS) {
    b.t += dt; b.acum += dt * b.vel;
    while (b.acum >= 1) { b.acum -= 1; pasoBecario(b); }
  }
}

// un paso por el borde: sigue recto si puede, si no gira; solo da la vuelta en un callejón
function pasoBecario(b) {
  if (!esBorde(b.x, b.y)) { acercaBorde(b); return; }
  const orden = [b.d, (b.d + 1) % 4, (b.d + 3) % 4, (b.d + 2) % 4];
  if (Math.random() < 0.15) [orden[1], orden[2]] = [orden[2], orden[1]];
  for (const d of orden) {
    const nx = b.x + DIRS[d][0], ny = b.y + DIRS[d][1];
    if (enTablero(nx, ny) && esBorde(nx, ny)) { b.x = nx; b.y = ny; b.d = d; return; }
  }
}

// un becario que se ha quedado lejos del borde (tras un corte) camina por lo destapado hacia el borde más cercano
function acercaBorde(b) {
  let mejor = null, md = 1e9;
  for (let y = 0; y < TAB.filas; y++) for (let x = 0; x < TAB.cols; x++) {
    if (!esBorde(x, y)) continue;
    const d = (x - b.x) ** 2 + (y - b.y) ** 2;
    if (d < md) { md = d; mejor = [x, y]; }
  }
  if (!mejor) return;
  if (Math.abs(mejor[0] - b.x) >= Math.abs(mejor[1] - b.y)) b.x += Math.sign(mejor[0] - b.x); else b.y += Math.sign(mejor[1] - b.y);
}

const becarioPilla = () => !BECARIOS.huelga && BECARIOS.some(b => b.x === CUR.x && b.y === CUR.y);

// ---------- pintar (sprites de Yoshi; mientras no estén, un disco) ----------
function pintaJefe(t) {
  const { x0, y0, c } = TAB, px = x0 + JEFE.x * c, py = y0 + JEFE.y * c, r = JEFE.r * c * AJUSTES.escala;
  const helado = JEFE.congelaT > 0;
  circulo(px, py + 3, r * 0.9, 'rgba(0,0,0,.3)', null);
  if (helado) G.globalAlpha = 0.85;
  pintaSprite(JEFE.tipo, px, py, r * 2, Math.sin(JEFE.giro) * 0.15, helado ? '#9fe8ff' : MUNDOS[JUEGO.mundo].jefe.color, 'J');
  G.globalAlpha = 1;
  if (helado) letra(tr('¡CONGELADO!'), px, py - r - 10, 12, COL.cian);
  for (const h of HIJOS) pintaSprite('hijo', x0 + h.x * c, y0 + h.y * c, h.r * c * 2 * AJUSTES.escala, t * 4, '#ff6b4a', 'h');
}

function pintaBecarios(t) {
  const { x0, y0, c } = TAB, alto = c * 2.2 * AJUSTES.escala;
  for (const b of BECARIOS) {
    const px = x0 + (b.x + 0.5) * c, py = y0 + (b.y + 0.5) * c + (BECARIOS.huelga ? 0 : Math.sin(b.t * 12) * 1.5);
    if (JEFE.congelaT > 0 || BECARIOS.huelga) G.globalAlpha = 0.7;
    pintaSprite('becario', px, py, alto, 0, '#c0c7d4', 'b');
    G.globalAlpha = 1;
    if (BECARIOS.huelga) letra('zZ', px + alto * 0.5, py - alto * 0.6 + Math.sin(t * 3) * 2, 9, COL.blanco);
  }
}
