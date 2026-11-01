// Fans of Shelter · ENTRADA: el dedo (palanca virtual a la izquierda, botón de acción a la derecha) y el teclado (WASD o flechas, y
// espacio / E para la acción). Resume todo en ENTRADA.dir (−1 a 1 en cada eje) y ENTRADA.accionPulsa (solo el fotograma en que se aprieta).
// Cuando hay una ventana abierta (portada, crafteo, mejoras, fin), los toques van a la cola ENTRADA.toques para que la pantalla los lea.
'use strict';

const ENTRADA = {
  dir: { x: 0, y: 0 }, accion: 0, accionPulsa: 0, escPulsa: 0,
  teclas: {}, toques: [],
  palanca: { activa: false, id: -1, x0: 0, y0: 0, x: 0, y: 0 },   // dónde se posó el dedo y dónde está ahora
  botonAccion: { x: 0, y: 0, r: 14 },                              // lo coloca la pantalla (abajo a la derecha)
  ventana: () => false,                                            // ¿hay una ventana abierta? (lo pone pantalla.js)
};
const TECLAS = { KeyW: 'arriba', ArrowUp: 'arriba', KeyS: 'abajo', ArrowDown: 'abajo', KeyA: 'izq', ArrowLeft: 'izq', KeyD: 'der', ArrowRight: 'der', Space: 'accion', KeyE: 'accion', Enter: 'accion', KeyK: 'accion' };

function entradaTecla(ev, abajo) {
  if (ev.target && /INPUT|TEXTAREA|SELECT/.test(ev.target.tagName)) return;
  if (abajo && !ev.repeat && ev.code === 'Escape') { ENTRADA.escPulsa = 1; ev.preventDefault(); return; }
  const k = TECLAS[ev.code]; if (!k) return;
  if (abajo && !ev.repeat && k === 'accion') ENTRADA.accionPulsa = 1;
  ENTRADA.teclas[k] = abajo ? 1 : 0;
  if (abajo && k === 'accion' && ENTRADA.ventana()) ENTRADA.toques.push({ tecla: 'accion' });
  if (abajo && !ev.repeat && ENTRADA.ventana() && k !== 'accion') ENTRADA.toques.push({ tecla: k });
  ev.preventDefault();
}
// cada fotograma: junta teclado y palanca
function resumeEntrada() {
  const t = ENTRADA.teclas, p = ENTRADA.palanca;
  let x = (t.der ? 1 : 0) - (t.izq ? 1 : 0), y = (t.abajo ? 1 : 0) - (t.arriba ? 1 : 0);
  if (p.activa) {
    const dx = p.x - p.x0, dy = p.y - p.y0, d = Math.hypot(dx, dy);
    if (d > 4) { const f = Math.min(1, d / 18); x = dx / d * f; y = dy / d * f; }
  }
  const d = Math.hypot(x, y); if (d > 1) { x /= d; y /= d; }
  ENTRADA.dir.x = x; ENTRADA.dir.y = y;
  ENTRADA.accion = t.accion ? 1 : 0;
}
function finEntrada() { ENTRADA.accionPulsa = 0; ENTRADA.escPulsa = 0; }

function dedoBaja(id, x, y, W, H) {
  if (ENTRADA.ventana()) { ENTRADA.toques.push({ x, y }); return; }
  const b = ENTRADA.botonAccion;
  if (Math.hypot(x - b.x, y - b.y) <= b.r + 6 || (x > W * 0.62 && y > H * 0.55)) { ENTRADA.accionPulsa = 1; ENTRADA.teclas.accion = 1; ENTRADA.accionId = id; return; }
  const p = ENTRADA.palanca;
  if (!p.activa) { p.activa = true; p.id = id; p.x0 = p.x = x; p.y0 = p.y = y; }
}
function dedoMueve(id, x, y) { const p = ENTRADA.palanca; if (p.activa && p.id === id) { p.x = x; p.y = y; } }
function dedoSube(id) {
  const p = ENTRADA.palanca;
  if (p.activa && p.id === id) p.activa = false;
  if (ENTRADA.accionId === id) { ENTRADA.teclas.accion = 0; ENTRADA.accionId = -1; }
}
function sueltaTodo() { ENTRADA.teclas = {}; ENTRADA.palanca.activa = false; }

function entradaArranca(cv, aPixel) {
  window.addEventListener('keydown', e => entradaTecla(e, true));
  window.addEventListener('keyup', e => entradaTecla(e, false));
  window.addEventListener('blur', sueltaTodo);
  cv.addEventListener('pointerdown', e => { audioInit(); cv.setPointerCapture(e.pointerId); const [x, y, W, H] = aPixel(e); dedoBaja(e.pointerId, x, y, W, H); e.preventDefault(); });
  cv.addEventListener('pointermove', e => { const [x, y] = aPixel(e); dedoMueve(e.pointerId, x, y); });
  cv.addEventListener('pointerup', e => dedoSube(e.pointerId));
  cv.addEventListener('pointercancel', e => dedoSube(e.pointerId));
  cv.addEventListener('contextmenu', e => e.preventDefault());
}
// pinta la palanca y el botón de acción (solo cuando se juega con el dedo)
function pintaMandos(ctx, W, H) {
  const p = ENTRADA.palanca, b = ENTRADA.botonAccion;
  if (p.activa) {
    ctx.globalAlpha = 0.5; anillo(ctx, p.x0, p.y0, 18, PALETA.W); ctx.globalAlpha = 0.8;
    const dx = p.x - p.x0, dy = p.y - p.y0, d = Math.hypot(dx, dy), f = Math.min(1, d / 18);
    circulo(ctx, p.x0 + (d ? dx / d * 18 * f : 0), p.y0 + (d ? dy / d * 18 * f : 0), 6, PALETA.W); ctx.globalAlpha = 1;
  }
  if (ENTRADA.tactil) {
    ctx.globalAlpha = ENTRADA.teclas.accion ? 0.9 : 0.55;
    circulo(ctx, b.x, b.y, b.r, PALETA.K); circulo(ctx, b.x, b.y, b.r - 2, PALETA.O); circulo(ctx, b.x - 1, b.y - 1, b.r - 5, PALETA.L);
    ctx.globalAlpha = 1;
    letra(ctx, 'A', b.x, b.y + 4, PALETA.K, 'center', 8, false);
  }
}
function circulo(ctx, cx, cy, r, color) {
  ctx.fillStyle = color; cx = Math.round(cx); cy = Math.round(cy);
  for (let dy = -r; dy <= r; dy++) { const dx = Math.floor(Math.sqrt(Math.max(0, r * r - dy * dy))); ctx.fillRect(cx - dx, cy + dy, dx * 2 + 1, 1); }
}
function anillo(ctx, cx, cy, r, color) {
  ctx.fillStyle = color; cx = Math.round(cx); cy = Math.round(cy);
  for (let a = 0; a < 64; a++) ctx.fillRect(Math.round(cx + Math.cos(a / 64 * 6.283) * r), Math.round(cy + Math.sin(a / 64 * 6.283) * r), 1, 1);
}
