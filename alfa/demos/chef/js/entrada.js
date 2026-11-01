// Fans of Chef · ENTRADA: en el móvil, arrastrar el dedo por la izquierda es la palanca (anda hacia donde arrastras) y en la esquina
// derecha hay dos botones pintados: CUCHILLO (toque) y SARTÉN (mantener). En el PC: WASD o flechas, J o espacio para el cuchillo y
// K o shift para la sartén. Resume todo en ENTRADA.dir, ENTRADA.ataquePulsa (solo el fotograma en que se aprieta) y ENTRADA.bloqueo.
// Cuando hay una ventana abierta (portada, cantina, cierre), los toques van a la cola ENTRADA.toques para que la pantalla los lea.
'use strict';

const ENTRADA = {
  dir: { x: 0, y: 0 }, ataquePulsa: 0, bloqueo: 0, escPulsa: 0,
  teclas: {}, toques: [], tactil: false,
  palanca: { activa: false, id: -1, x0: 0, y0: 0, x: 0, y: 0 },
  dedoSarten: -1,                                                  // el dedo que mantiene la sartén
  ventana: () => false,                                            // ¿hay una ventana abierta? (lo pone pantalla-2.js)
  botones: { cuchillo: null, sarten: null },                       // las cajas de los dos botones (las pone pintaMandos)
};
const TECLAS = { KeyW: 'arriba', ArrowUp: 'arriba', KeyS: 'abajo', ArrowDown: 'abajo', KeyA: 'izq', ArrowLeft: 'izq', KeyD: 'der', ArrowRight: 'der',
  KeyJ: 'ataque', Space: 'ataque', Enter: 'ataque', KeyK: 'bloqueo', ShiftLeft: 'bloqueo', ShiftRight: 'bloqueo' };

function entradaTecla(ev, abajo) {
  if (ev.target && /INPUT|TEXTAREA|SELECT/.test(ev.target.tagName)) return;
  if (abajo && !ev.repeat && ev.code === 'Escape') { ENTRADA.escPulsa = 1; ev.preventDefault(); return; }
  const k = TECLAS[ev.code]; if (!k) return;
  if (abajo && !ev.repeat && k === 'ataque') { ENTRADA.ataquePulsa = 1; if (ENTRADA.ventana()) ENTRADA.toques.push({ tecla: 'accion' }); }
  if (abajo && !ev.repeat && ENTRADA.ventana() && k !== 'ataque') ENTRADA.toques.push({ tecla: k });
  ENTRADA.teclas[k] = abajo ? 1 : 0;
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
  ENTRADA.bloqueo = t.bloqueo || ENTRADA.dedoSarten >= 0 ? 1 : 0;
}
function finEntrada() { ENTRADA.ataquePulsa = 0; ENTRADA.escPulsa = 0; }

const dentroDe = (q, b) => b && q.x >= b.x && q.x <= b.x + b.w && q.y >= b.y && q.y <= b.y + b.h;
function dedoBaja(id, x, y) {
  if (ENTRADA.ventana()) { ENTRADA.toques.push({ x, y }); return; }
  ENTRADA.tactil = true;
  const B = ENTRADA.botones;
  if (dentroDe({ x, y }, B.cuchillo)) { ENTRADA.ataquePulsa = 1; return; }
  if (dentroDe({ x, y }, B.sarten)) { ENTRADA.dedoSarten = id; return; }
  const p = ENTRADA.palanca;
  if (!p.activa) { p.activa = true; p.id = id; p.x0 = p.x = x; p.y0 = p.y = y; }
}
function dedoMueve(id, x, y) { const p = ENTRADA.palanca; if (p.activa && p.id === id) { p.x = x; p.y = y; } }
function dedoSube(id) {
  const p = ENTRADA.palanca;
  if (p.activa && p.id === id) p.activa = false;
  if (ENTRADA.dedoSarten === id) ENTRADA.dedoSarten = -1;
}
function sueltaTodo() { ENTRADA.teclas = {}; ENTRADA.palanca.activa = false; ENTRADA.dedoSarten = -1; }

function entradaArranca(cv, aPixel) {
  window.addEventListener('keydown', e => entradaTecla(e, true));
  window.addEventListener('keyup', e => entradaTecla(e, false));
  window.addEventListener('blur', sueltaTodo);
  cv.addEventListener('pointerdown', e => { audioInit(); cv.setPointerCapture(e.pointerId); const [x, y] = aPixel(e); dedoBaja(e.pointerId, x, y); e.preventDefault(); });
  cv.addEventListener('pointermove', e => { const [x, y] = aPixel(e); dedoMueve(e.pointerId, x, y); });
  cv.addEventListener('pointerup', e => dedoSube(e.pointerId));
  cv.addEventListener('pointercancel', e => dedoSube(e.pointerId));
  cv.addEventListener('contextmenu', e => e.preventDefault());
}
// la palanca bajo el dedo y, en el móvil, los dos botones de la esquina (cuchillo y sartén)
function pintaMandos(ctx, W, H) {
  const p = ENTRADA.palanca;
  if (p.activa) {
    ctx.globalAlpha = 0.35; anillo(ctx, p.x0, p.y0, 18, PALETA.W); ctx.globalAlpha = 0.6;
    const dx = p.x - p.x0, dy = p.y - p.y0, d = Math.hypot(dx, dy), f = Math.min(1, d / 18);
    circulo(ctx, p.x0 + (d ? dx / d * 18 * f : 0), p.y0 + (d ? dy / d * 18 * f : 0), 5, PALETA.W); ctx.globalAlpha = 1;
  }
  if (!ENTRADA.tactil) { ENTRADA.botones.cuchillo = ENTRADA.botones.sarten = null; return; }
  const r = 17, cx1 = W - 24, cx2 = W - 64, cy = H - 26;
  ENTRADA.botones.cuchillo = { x: cx1 - r - 4, y: cy - r - 4, w: r * 2 + 8, h: r * 2 + 8 };
  ENTRADA.botones.sarten = { x: cx2 - r - 4, y: cy - r - 4, w: r * 2 + 8, h: r * 2 + 8 };
  ctx.globalAlpha = 0.75;
  circulo(ctx, cx1, cy, r + 1, PALETA.K); circulo(ctx, cx1, cy, r, J.cuchilloT > 0 ? PALETA.s : PALETA.B); pintaSpr(ctx, 'ico_cuchillo', cx1, cy + 8);
  circulo(ctx, cx2, cy, r + 1, PALETA.K); circulo(ctx, cx2, cy, r, ENTRADA.bloqueo ? PALETA.Y : PALETA.B); pintaSpr(ctx, 'ico_sarten', cx2, cy + 8);
  ctx.globalAlpha = 1;
}
