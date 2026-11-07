// Fans of Panic · Enemigos: el Inspector (el jefe del mundo) rebota dentro de lo tapado y mata si toca el trazo o al cúter;
// los becarios-robot de Microblizz corren por el borde de lo destapado y matan si te pillan. Se miden en casillas.
'use strict';

const JEFE = { x: 30, y: 40, vx: 10, vy: 8, r: 5, congelaT: 0, enfado: 0, tipo: 'cangrejo', col: '#f00' };
const BECARIOS = [];
const DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];

function nuevoJefe(nivel, M) {
  const a = Math.random() * Math.PI * 2;
  JEFE.x = TAB.cols / 2; JEFE.y = TAB.filas * 0.45; JEFE.r = nivel.tam / 2;
  JEFE.vel = nivel.jefe; JEFE.vx = Math.cos(a) * JEFE.vel; JEFE.vy = Math.sin(a) * JEFE.vel;
  JEFE.congelaT = 0; JEFE.enfado = 0; JEFE.tipo = M.jefe.tipo; JEFE.col = M.jefe.color; JEFE.giro = 0;
}

// ¿cabe el jefe en (x, y)? (todo lo que toca su círculo tiene que estar tapado)
function jefeCabe(x, y) {
  const r = JEFE.r;
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6, px = Math.floor(x + Math.cos(a) * r), py = Math.floor(y + Math.sin(a) * r);
    if (celda(px, py) !== TAPADA) return false;
  }
  return true;
}

function avanzaJefe(dt) {
  if (JEFE.congelaT > 0) { JEFE.congelaT -= dt; return; }
  JEFE.giro += dt * (Math.abs(JEFE.vx) + Math.abs(JEFE.vy)) * 0.1;
  const nx = JEFE.x + JEFE.vx * dt, ny = JEFE.y + JEFE.vy * dt;
  if (jefeCabe(nx, ny)) { JEFE.x = nx; JEFE.y = ny; return; }
  const ex = jefeCabe(nx, JEFE.y), ey = jefeCabe(JEFE.x, ny);
  if (ex) JEFE.x = nx; else JEFE.vx = -JEFE.vx;
  if (ey) JEFE.y = ny; else JEFE.vy = -JEFE.vy;
  if (!ex && !ey) { const a = Math.random() * Math.PI * 2; JEFE.vx = Math.cos(a) * JEFE.vel; JEFE.vy = Math.sin(a) * JEFE.vel; }
  if (!ex || !ey) { JEFE.enfado = 0.25; rebotaAzar(); }
}

// al rebotar, un poco de azar para que no sea predecible del todo
function rebotaAzar() {
  const a = Math.atan2(JEFE.vy, JEFE.vx) + (Math.random() - 0.5) * 0.6;
  JEFE.vx = Math.cos(a) * JEFE.vel; JEFE.vy = Math.sin(a) * JEFE.vel;
}

// ¿toca el jefe el trazo o al cúter mientras traza?
function jefeToca() {
  const r = JEFE.r + 0.5, x0 = Math.floor(JEFE.x - r), x1 = Math.ceil(JEFE.x + r), y0 = Math.floor(JEFE.y - r), y1 = Math.ceil(JEFE.y + r);
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    if (!enTablero(x, y)) continue;
    const dx = x + 0.5 - JEFE.x, dy = y + 0.5 - JEFE.y;
    if (dx * dx + dy * dy > r * r) continue;
    if (TAB.cel[idx(x, y)] === TRAZO) return true;
    if (CUR.trazando && x === CUR.x && y === CUR.y) return true;
  }
  return false;
}

// si al cerrar un corte el jefe se queda sobre lo destapado, se recoloca en lo tapado más cercano
function recolocaJefe() {
  if (jefeCabe(JEFE.x, JEFE.y)) return;
  let mejor = null, md = 1e9;
  for (let y = 1; y < TAB.filas - 1; y += 2) for (let x = 1; x < TAB.cols - 1; x += 2) {
    if (TAB.cel[idx(x, y)] !== TAPADA) continue;
    const d = (x - JEFE.x) ** 2 + (y - JEFE.y) ** 2;
    if (d < md) { md = d; mejor = [x + 0.5, y + 0.5]; }
  }
  if (mejor) { JEFE.x = mejor[0]; JEFE.y = mejor[1]; }
}

// ---------- becarios ----------
function nuevosBecarios(n, vel) {
  BECARIOS.length = 0;
  for (let i = 0; i < n; i++) BECARIOS.push({ x: i % 2 ? TAB.cols - 1 : 0, y: Math.floor(i / 2) % 2 ? TAB.filas - 1 : 0, d: i % 2 ? 1 : 2, acum: -i * 0.7, vel, t: Math.random() * 6 });
}

function avanzaBecarios(dt) {
  if (JEFE.congelaT > 0) return;
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
  const dx = Math.sign(mejor[0] - b.x), dy = Math.sign(mejor[1] - b.y);
  if (Math.abs(mejor[0] - b.x) >= Math.abs(mejor[1] - b.y)) b.x += dx; else b.y += dy;
}

const becarioPilla = () => BECARIOS.some(b => b.x === CUR.x && b.y === CUR.y);

// ---------- pintar ----------
function pintaJefe(t) {
  const { x0, y0, c } = TAB, px = x0 + JEFE.x * c, py = y0 + JEFE.y * c, r = JEFE.r * c;
  const helado = JEFE.congelaT > 0;
  G.save(); G.translate(px, py);
  if (helado) { G.globalAlpha = 0.9; }
  const col = helado ? '#9fe8ff' : JEFE.col;
  circulo(0, 3, r, 'rgba(0,0,0,.35)', null);
  G.rotate(Math.sin(JEFE.giro) * 0.15);
  // cuerpo según el tipo (provisional, hasta que Yoshi pinte cada jefe)
  if (JEFE.tipo === 'cangrejo') pintaCangrejo(r, col, t);
  else { circulo(0, 0, r, col, COL.tinta, 3); pintaOjos(r); }
  G.restore();
  if (helado) letra(tr('¡CONGELADO!'), px, py - r - 10, 12, COL.cian);
}

function pintaOjos(r) {
  circulo(-r * 0.35, -r * 0.2, r * 0.22, COL.blanco, COL.tinta, 2); circulo(r * 0.35, -r * 0.2, r * 0.22, COL.blanco, COL.tinta, 2);
  circulo(-r * 0.3, -r * 0.18, r * 0.1, COL.tinta, null); circulo(r * 0.4, -r * 0.18, r * 0.1, COL.tinta, null);
  G.beginPath(); G.moveTo(-r * 0.35, r * 0.3); G.lineTo(r * 0.35, r * 0.3); G.strokeStyle = COL.tinta; G.lineWidth = 2.5; G.stroke();
}

function pintaCangrejo(r, col, t) {
  const p = Math.sin(t * 8) * 0.3;
  for (const s of [-1, 1]) {   // pinzas
    G.save(); G.translate(s * r * 0.9, -r * 0.5); G.rotate(s * (0.4 + p));
    circulo(0, 0, r * 0.42, col, COL.tinta, 3);
    G.fillStyle = COL.panel; G.beginPath(); G.moveTo(0, 0); G.arc(0, 0, r * 0.42, s > 0 ? -0.5 : Math.PI - 0.1, s > 0 ? 0.5 : Math.PI + 0.9); G.closePath(); G.fill();
    G.restore();
    for (let i = 0; i < 3; i++) { G.beginPath(); G.moveTo(s * r * 0.6, r * (0.1 + i * 0.25)); G.lineTo(s * r * 1.25, r * (0.3 + i * 0.3) + Math.sin(t * 10 + i) * 2); G.strokeStyle = COL.tinta; G.lineWidth = 3; G.stroke(); }
  }
  G.beginPath(); G.ellipse(0, 0, r, r * 0.8, 0, 0, Math.PI * 2); G.fillStyle = col; G.fill(); G.strokeStyle = COL.tinta; G.lineWidth = 3; G.stroke();
  caja(-r * 0.12, -r * 0.1, r * 0.24, r * 0.6, 3, '#2d4bd6', COL.tinta, 1.5);   // la corbata del inspector
  pintaOjos(r);
}

function pintaBecarios(t) {
  const { x0, y0, c } = TAB;
  for (const b of BECARIOS) {
    const px = x0 + (b.x + 0.5) * c, py = y0 + (b.y + 0.5) * c, r = c * 0.9;
    G.save(); G.translate(px, py + Math.sin(b.t * 12) * 1.5);
    caja(-r, -r, r * 2, r * 2, 3, JEFE.congelaT > 0 ? '#9fe8ff' : '#c0c7d4', COL.tinta, 2);
    G.fillStyle = '#ff3b3b'; G.fillRect(-r * 0.55, -r * 0.4, r * 1.1, r * 0.45);   // la visera roja
    G.fillStyle = COL.tinta; G.fillRect(-r * 0.6, r * 0.3, r * 1.2, r * 0.2);
    G.beginPath(); G.moveTo(0, -r); G.lineTo(0, -r - 4); G.strokeStyle = COL.tinta; G.lineWidth = 2; G.stroke(); circulo(0, -r - 5, 2, '#ff3b3b', COL.tinta, 1);
    G.restore();
  }
}
