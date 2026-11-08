// Fans of Auto · LOS MANDOS: el teclado y la pantalla táctil se convierten en las mismas ÓRDENES para la simulación (mover,
// acelerar, girar, freno de mano, disparar, entrar o salir del coche, claxon). En el móvil hay una palanca que aparece donde
// pones el pulgar izquierdo y botones a la derecha: al conducir, la palanca dice hacia dónde quieres ir y el coche gira solo.
// Teclado: cada acción tiene su tecla y se puede cambiar en Opciones → Teclas (se guarda en el navegador).
'use strict';

const MANDO = { teclas: new Set(), tactil: false, pulso: {}, toque: null, palanca: { id: null, x0: 0, y0: 0, dx: 0, dy: 0 }, botones: {}, pulsados: {}, ultimaTecla: null };
const ORDENES = { j1: Object.assign({}, ORDEN_VACIA) };

// las acciones del teclado y sus teclas de serie (dos por acción); AJUSTES.teclas guarda las cambiadas
const ACCIONES = [
  ['arriba', 'Arriba / acelerar', ['ArrowUp', 'KeyW']], ['abajo', 'Abajo / frenar', ['ArrowDown', 'KeyS']],
  ['izquierda', 'Izquierda', ['ArrowLeft', 'KeyA']], ['derecha', 'Derecha', ['ArrowRight', 'KeyD']],
  ['accion', 'Disparar / freno de mano', ['Space', 'KeyJ']], ['entrar', 'Entrar o salir del coche', ['Enter', 'KeyE']],
  ['claxon', 'Claxon', ['KeyH', 'KeyK']], ['pausa', 'Pausa', ['Escape', 'KeyP']],
];
function teclasDe(accion) { const a = ACCIONES.find(a => a[0] === accion); const c = AJUSTES.teclas && AJUSTES.teclas[accion]; return c && c.length ? c : a[2]; }
function ponTecla(accion, code) {
  AJUSTES.teclas = AJUSTES.teclas || {};
  // una tecla solo puede estar en una acción
  for (const a of ACCIONES) { const t = teclasDe(a[0]).filter(k => k !== code); if (t.length !== teclasDe(a[0]).length) AJUSTES.teclas[a[0]] = t.length ? t : [a[2][0] === code ? a[2][1] : a[2][0]]; }
  AJUSTES.teclas[accion] = [code, ...teclasDe(accion).filter(k => k !== code)].slice(0, 2);
  guardaAjustes();
}
function teclasDeSerie() { AJUSTES.teclas = {}; guardaAjustes(); }
const NOMBRE_TECLA = { ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', Space: 'ESPACIO', Enter: 'ENTRAR', Escape: 'ESC', ShiftLeft: 'MAYÚS', ShiftRight: 'MAYÚS D', ControlLeft: 'CTRL', AltLeft: 'ALT', Tab: 'TAB', Backspace: 'RETROCESO' };
function nombreTecla(code) { if (NOMBRE_TECLA[code]) return NOMBRE_TECLA[code]; if (code.startsWith('Key')) return code.slice(3); if (code.startsWith('Digit')) return code.slice(5); if (code.startsWith('Numpad')) return 'NUM ' + code.slice(6); return code.toUpperCase(); }
const tecla = accion => teclasDe(accion).some(k => MANDO.teclas.has(k));

// la geometría de los mandos táctiles (en píxeles del lienzo); el tamaño se cambia en Opciones. Vale en vertical y en
// horizontal. Conduciendo con «botones»: IZQ y DER abajo a la izquierda y ACELERAR grande a la derecha (como en el vídeo que
// eligió Daniel), con FRENO/atrás y SALIR encima; con la «palanca» no hay IZQ ni DER. A pie: palanca, TIRO y ENTRAR.
function geoMandos() {
  const W = J.W, H = J.H, k = AJUSTES.mandos || 1, j = S && S.jugadores[0], enCoche = !!(j && j.coche !== null);
  const botones = enCoche && AJUSTES.mandoCoche !== 'palanca';
  const g = { pausa: { x: W - 12, y: 28, r: 9, texto: '||' } };
  if (botones) {
    g.izq = { x: 26 * k, y: H - 28 * k, r: 19 * k, texto: '<' };
    g.der = { x: 72 * k, y: H - 28 * k, r: 19 * k, texto: '>' };
    g.acel = { x: W - 30 * k, y: H - 30 * k, r: 25 * k, texto: 'GAS' };
    g.freno = { x: W - 78 * k, y: H - 24 * k, r: 14 * k, texto: 'FRENO' };
    g.entrar = { x: W - 30 * k, y: H - 78 * k, r: 14 * k, texto: 'SALIR' };
    g.claxon = { x: W - 72 * k, y: H - 62 * k, r: 11 * k, texto: 'PI' };
  } else if (enCoche) {
    g.entrar = { x: W - 24 * k, y: H - 24 * k, r: 18 * k, texto: 'SALIR' };
    g.freno = { x: W - 66 * k, y: H - 30 * k, r: 16 * k, texto: 'FRENO' };
    g.claxon = { x: W - 30 * k, y: H - 64 * k, r: 12 * k, texto: 'PI' };
  } else {
    g.entrar = { x: W - 24 * k, y: H - 24 * k, r: 18 * k, texto: 'ENTRAR' };
    g.accion = { x: W - 66 * k, y: H - 30 * k, r: 16 * k, texto: 'TIRO' };
  }
  return g;
}
function botonEn(x, y) {
  const g = geoMandos();
  for (const k in g) { const b = g[k]; if (Math.hypot(x - b.x, y - b.y) <= b.r + 6) return k; }
  return null;
}
function aJuego(ev) {
  const r = cv.getBoundingClientRect();
  return [(ev.clientX - r.left) * (cv.width / r.width), (ev.clientY - r.top) * (cv.height / r.height)];
}
function dedoBaja(ev) {
  if (ev.pointerType === 'mouse' && ev.button !== 0) return;
  ev.preventDefault();
  try { cv.setPointerCapture(ev.pointerId); } catch (_) { /* da igual */ }
  const [x, y] = aJuego(ev);
  MANDO.toque = { x, y };
  if (ev.pointerType !== 'mouse') MANDO.tactil = true;
  if (J.estado !== 'juego' || S.pausa) return;
  const b = botonEn(x, y);
  if (b) { MANDO.botones[ev.pointerId] = b; MANDO.pulsados[b] = true; if (b === 'entrar' || b === 'pausa') MANDO.pulso[b] = true; return; }
  const g = geoMandos();
  if (!g.izq && x < J.W * 0.55 && MANDO.palanca.id === null) { MANDO.palanca.id = ev.pointerId; MANDO.palanca.x0 = x; MANDO.palanca.y0 = y; MANDO.palanca.dx = 0; MANDO.palanca.dy = 0; }
}
function dedoMueve(ev) {
  if (MANDO.palanca.id !== ev.pointerId) return;
  const [x, y] = aJuego(ev), R = 22 * (AJUSTES.mandos || 1);
  let dx = x - MANDO.palanca.x0, dy = y - MANDO.palanca.y0;
  const m = Math.hypot(dx, dy);
  if (m > R) { dx = dx / m * R; dy = dy / m * R; MANDO.palanca.x0 = x - dx; MANDO.palanca.y0 = y - dy; }   // la palanca te sigue el dedo
  MANDO.palanca.dx = dx / R; MANDO.palanca.dy = dy / R;
}
function dedoSube(ev) {
  if (MANDO.palanca.id === ev.pointerId) { MANDO.palanca.id = null; MANDO.palanca.dx = 0; MANDO.palanca.dy = 0; }
  const b = MANDO.botones[ev.pointerId];
  if (b) { delete MANDO.botones[ev.pointerId]; MANDO.pulsados[b] = Object.values(MANDO.botones).includes(b); }
}
function sueltaTodo() { MANDO.teclas.clear(); MANDO.palanca.id = null; MANDO.palanca.dx = 0; MANDO.palanca.dy = 0; MANDO.botones = {}; MANDO.pulsados = {}; }
function iniciaMandos() {
  cv.addEventListener('pointerdown', dedoBaja);
  cv.addEventListener('pointermove', dedoMueve);
  cv.addEventListener('pointerup', dedoSube);
  cv.addEventListener('pointercancel', dedoSube);
  cv.addEventListener('contextmenu', e => e.preventDefault());
  window.addEventListener('keydown', e => {
    if (e.repeat) return;
    MANDO.teclas.add(e.code); MANDO.ultimaTecla = e.code;
    if (teclasDe('entrar').includes(e.code)) MANDO.pulso.entrar = true;
    if (teclasDe('pausa').includes(e.code)) MANDO.pulso.pausa = true;
    if (['Enter', 'Space', 'KeyE'].includes(e.code) || teclasDe('accion').includes(e.code)) MANDO.pulso.ok = true;
    if (['Escape', 'Backspace', 'KeyQ'].includes(e.code)) MANDO.pulso.atras = true;
    if (teclasDe('arriba').includes(e.code)) MANDO.pulso.arriba = true;
    if (teclasDe('abajo').includes(e.code)) MANDO.pulso.abajo = true;
    if (teclasDe('izquierda').includes(e.code)) MANDO.pulso.izquierda = true;
    if (teclasDe('derecha').includes(e.code)) MANDO.pulso.derecha = true;
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', e => MANDO.teclas.delete(e.code));
  window.addEventListener('blur', sueltaTodo);
}
// las órdenes del jugador 1 para este paso
function leeMando() {
  const o = ORDENES.j1, j = S ? S.jugadores[0] : null, enCoche = !!(j && j.coche !== null);
  let mx = 0, my = 0;
  if (tecla('izquierda')) mx -= 1; if (tecla('derecha')) mx += 1;
  if (tecla('arriba')) my -= 1; if (tecla('abajo')) my += 1;
  o.palanca = false;
  if (MANDO.palanca.id !== null) { mx = MANDO.palanca.dx; my = MANDO.palanca.dy; o.palanca = enCoche; }
  o.mx = mx; o.my = my;
  const P = MANDO.pulsados;
  o.acel = tecla('arriba') || P.acel ? 1 : tecla('abajo') || P.freno ? -1 : 0;
  o.giro = (tecla('derecha') || P.der ? 1 : 0) - (tecla('izquierda') || P.izq ? 1 : 0);
  const accion = tecla('accion') || !!P.accion;
  o.freno = enCoche && (accion || !!P.freno);
  o.disparo = !enCoche && accion;
  o.entrar = !!MANDO.pulso.entrar;
  o.claxon = tecla('claxon') || !!P.claxon;
  MANDO.pulso.entrar = false;
}
