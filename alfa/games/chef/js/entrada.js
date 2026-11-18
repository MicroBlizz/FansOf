// Fans of Chef · ENTRADA: dos formas de jugar, que se cambian en la portada (SAVE.control) y valen para el sótano y la cantina.
//  · 'tocar' (por defecto en el móvil): tocas donde quieres ir y el cocinero va solo; tocar un bicho es ir a por él (ataca solo al tenerlo a
//    mano), tocar el montacargas es subir y, en la cantina, tocar una estación es ir y usarla. Un botón SARTÉN (mantener) para bloquear.
//  · 'palanca' (por defecto en el PC): WASD / flechas o la palanca fija visible abajo a la izquierda, y dos botones grandes abajo a la derecha:
//    ATACAR (o COGER en la cantina; J, espacio) y BLOQUEAR (o CORTAR; K, shift). El ataque apunta solo al bicho más cercano.
// El teclado funciona siempre. Resume todo en ENTRADA.dir, ENTRADA.ataquePulsa (un fotograma), ENTRADA.bloqueo y ENTRADA.destino.
// Con una ventana abierta (portada, mañana, cierre) los toques van a ENTRADA.toques para la pantalla.
'use strict';

const ENTRADA = {
  dir: { x: 0, y: 0 }, ataquePulsa: 0, bloqueo: 0, escPulsa: 0,
  teclas: {}, toques: [], tactil: false,
  palanca: { activa: false, id: -1, x0: 0, y0: 0, x: 0, y: 0 },
  dedoBoton: {},                                                   // id del dedo → 'ataque' | 'bloqueo'
  destino: null,                                                   // modo tocar: { x, y } del mundo (o null)
  toqueMundo: null,                                                // modo tocar: el último toque en el mundo, para que el juego decida qué es
  ventana: () => false,                                            // ¿hay una ventana abierta? (lo pone pantalla-2.js)
  botones: { ataque: null, bloqueo: null },                        // las cajas de los botones en pantalla (las pone pintaMandos)
};
const TECLAS = { KeyW: 'arriba', ArrowUp: 'arriba', KeyS: 'abajo', ArrowDown: 'abajo', KeyA: 'izq', ArrowLeft: 'izq', KeyD: 'der', ArrowRight: 'der',
  KeyJ: 'ataque', Space: 'ataque', Enter: 'ataque', KeyK: 'bloqueo', ShiftLeft: 'bloqueo', ShiftRight: 'bloqueo' };
const esMovil = () => (window.matchMedia && matchMedia('(pointer: coarse)').matches) || 'ontouchstart' in window;
const modoControl = () => SAVE.control || (esMovil() ? 'tocar' : 'palanca');

function entradaTecla(ev, abajo) {
  if (ev.target && /INPUT|TEXTAREA|SELECT/.test(ev.target.tagName)) return;
  if (abajo && !ev.repeat && ev.code === 'Escape') { ENTRADA.escPulsa = 1; ev.preventDefault(); return; }
  const k = TECLAS[ev.code]; if (!k) return;
  if (abajo && !ev.repeat && k === 'ataque') { ENTRADA.ataquePulsa = 1; if (ENTRADA.ventana()) ENTRADA.toques.push({ tecla: 'accion' }); }
  if (abajo && !ev.repeat && ENTRADA.ventana() && k !== 'ataque') ENTRADA.toques.push({ tecla: k });
  if (abajo && (k === 'arriba' || k === 'abajo' || k === 'izq' || k === 'der')) ENTRADA.destino = null;   // el teclado manda sobre el toque
  ENTRADA.teclas[k] = abajo ? 1 : 0;
  ev.preventDefault();
}
// cada fotograma: junta teclado y palanca
function resumeEntrada() {
  const t = ENTRADA.teclas, p = ENTRADA.palanca;
  let x = (t.der ? 1 : 0) - (t.izq ? 1 : 0), y = (t.abajo ? 1 : 0) - (t.arriba ? 1 : 0);
  if (p.activa) {
    const dx = p.x - p.x0, dy = p.y - p.y0, d = Math.hypot(dx, dy);
    if (d > 3) { const f = Math.min(1, d / 22); x = dx / d * f; y = dy / d * f; }
  }
  const d = Math.hypot(x, y); if (d > 1) { x /= d; y /= d; }
  ENTRADA.dir.x = x; ENTRADA.dir.y = y;
  ENTRADA.bloqueo = t.bloqueo || Object.values(ENTRADA.dedoBoton).includes('bloqueo') ? 1 : 0;
}
function finEntrada() { ENTRADA.ataquePulsa = 0; ENTRADA.escPulsa = 0; ENTRADA.toqueMundo = null; }

const dentroDe = (q, b) => b && q.x >= b.x && q.x <= b.x + b.w && q.y >= b.y && q.y <= b.y + b.h;
function dedoBaja(id, x, y, W, H) {
  if (ENTRADA.ventana()) { ENTRADA.toques.push({ x, y }); return; }
  ENTRADA.tactil = esMovil();
  const B = ENTRADA.botones;
  if (dentroDe({ x, y }, B.ataque)) { ENTRADA.ataquePulsa = 1; ENTRADA.dedoBoton[id] = 'ataque'; return; }
  if (dentroDe({ x, y }, B.bloqueo)) { ENTRADA.dedoBoton[id] = 'bloqueo'; return; }
  if (modoControl() === 'tocar') { ENTRADA.toqueMundo = { x: x + CAM.x, y: y + CAM.y }; return; }
  // palanca fija: se agarra en la mitad izquierda (si se toca fuera de la base, la base salta bajo el dedo)
  const p = ENTRADA.palanca;
  if (!p.activa && x < W * 0.55) { const b = basePalanca(W, H); p.activa = true; p.id = id; const lejos = Math.hypot(x - b.x, y - b.y) > 34; p.x0 = lejos ? x : b.x; p.y0 = lejos ? y : b.y; p.x = x; p.y = y; }
}
function dedoMueve(id, x, y) { const p = ENTRADA.palanca; if (p.activa && p.id === id) { p.x = x; p.y = y; } }
function dedoSube(id) { const p = ENTRADA.palanca; if (p.activa && p.id === id) p.activa = false; delete ENTRADA.dedoBoton[id]; }
function sueltaTodo() { ENTRADA.teclas = {}; ENTRADA.palanca.activa = false; ENTRADA.dedoBoton = {}; ENTRADA.destino = null; }

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

// --- los mandos en pantalla ---
const basePalanca = (W, H) => ({ x: 46, y: H - 64 });
function botonRedondo(ctx, cx, cy, r, color, icono, txt, pulsado) {
  ctx.globalAlpha = 0.85;
  circulo(ctx, cx, cy + 2, r + 1, PALETA.K); circulo(ctx, cx, cy, r + 1, PALETA.K); circulo(ctx, cx, cy, r, pulsado ? PALETA.Y : color); circulo(ctx, cx - r * 0.3, cy - r * 0.35, Math.round(r * 0.25), 'rgba(255,255,255,0.25)');
  ctx.globalAlpha = 1;
  if (icono) pintaSpr(ctx, icono, cx, cy + 8);
  letraCabe(ctx, txt, cx, cy + r + 10, r * 2 + 16, PALETA.W, 'center', 7);
}
function pintaMandos(ctx, W, H) {
  const B = ENTRADA.botones, cantina = JORNADA.fase === 'servicio', modo = modoControl();
  B.ataque = B.bloqueo = null;
  if (!ENTRADA.tactil) return;   // en el PC, con teclado, no hacen falta
  const pulsadoA = Object.values(ENTRADA.dedoBoton).includes('ataque'), pulsadoB = ENTRADA.bloqueo;
  if (modo === 'palanca') {
    const b = basePalanca(W, H), p = ENTRADA.palanca, ox = p.activa ? p.x0 : b.x, oy = p.activa ? p.y0 : b.y;
    ctx.globalAlpha = 0.35; circulo(ctx, ox, oy, 26, PALETA.K); ctx.globalAlpha = 0.55; anillo(ctx, ox, oy, 26, PALETA.W); ctx.globalAlpha = 1;
    const dx = p.activa ? p.x - p.x0 : 0, dy = p.activa ? p.y - p.y0 : 0, d = Math.hypot(dx, dy), f = Math.min(1, d / 22);
    const kx = ox + (d ? dx / d * 22 * f : 0), ky = oy + (d ? dy / d * 22 * f : 0);
    circulo(ctx, kx, ky, 12, PALETA.K); circulo(ctx, kx, ky, 11, PALETA.w); circulo(ctx, kx - 3, ky - 3, 3, PALETA.W);
    const r = 20;
    B.ataque = { x: W - 28 - r - 8, y: H - 56 - r - 8, w: r * 2 + 16, h: r * 2 + 16 };
    B.bloqueo = { x: W - 80 - r - 8, y: H - 34 - r - 8, w: r * 2 + 16, h: r * 2 + 16 };
    botonRedondo(ctx, W - 28, H - 56, r, PALETA.R, cantina ? null : 'ico_cuchillo', cantina ? tr('COGER') : tr('ATACAR'), pulsadoA);
    botonRedondo(ctx, W - 80, H - 34, r - 2, PALETA.B, cantina ? 'ico_cuchillo' : 'ico_sarten', cantina ? tr('CORTAR') : tr('BLOQUEAR'), pulsadoB);
  } else {
    // modo tocar: solo el botón de la sartén (en el sótano); el destino se marca en el suelo
    if (!cantina) { const r = 18; B.bloqueo = { x: W - 30 - r - 8, y: H - 52 - r - 8, w: r * 2 + 16, h: r * 2 + 16 }; botonRedondo(ctx, W - 30, H - 52, r, PALETA.B, 'ico_sarten', tr('SARTÉN'), pulsadoB); }
    if (ENTRADA.destino) { const x = ENTRADA.destino.x - CAM.x, y = ENTRADA.destino.y - CAM.y, a = 0.5 + Math.sin(PAN.t * 10) * 0.3; ctx.globalAlpha = a; anillo(ctx, x, y, 6, PALETA.Y); anillo(ctx, x, y, 3, PALETA.Y); ctx.globalAlpha = 1; }
  }
}
