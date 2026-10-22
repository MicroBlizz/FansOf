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

// la geometría de los mandos táctiles (en píxeles del lienzo); el tamaño se cambia en Opciones
function geoMandos() {
  const W = J.W, H = J.H, k = AJUSTES.mandos || 1, r = 16 * k, m = 6 * k;
  return {
    entrar: { x: W - m - r - 2, y: H - m - r - 2, r: r + 2, texto: 'E' },
    accion: { x: W - m - r * 3 - 10, y: H - m - r - 10, r, texto: 'A' },
    claxon: { x: W - m - r - 8, y: H - m - r * 3 - 10, r: r * 0.75, texto: 'H' },
    pausa: { x: W - 12, y: 10, r: 9, texto: '||' },
  };
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
  if (x < J.W * 0.55 && MANDO.palanca.id === null) { MANDO.palanca.id = ev.pointerId; MANDO.palanca.x0 = x; MANDO.palanca.y0 = y; MANDO.palanca.dx = 0; MANDO.palanca.dy = 0; }
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
  o.acel = tecla('arriba') ? 1 : tecla('abajo') ? -1 : 0;
  o.giro = (tecla('derecha') ? 1 : 0) - (tecla('izquierda') ? 1 : 0);
  const accion = tecla('accion') || !!MANDO.pulsados.accion;
  o.freno = enCoche && accion;
  o.disparo = !enCoche && accion;
  o.entrar = !!MANDO.pulso.entrar;
  o.claxon = tecla('claxon') || !!MANDO.pulsados.claxon;
  MANDO.pulso.entrar = false;
}
