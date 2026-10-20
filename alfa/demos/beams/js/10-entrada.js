// Fans of Beams · Entrada: opciones guardadas (teclas, mando, táctil, pantalla), teclado, mando, palanca y botones táctiles, pantalla completa y vibración.
// (Se carga por orden desde index.html: todos los archivos comparten ámbito global.)
'use strict';
// ---------- opciones guardadas: controles, táctil, pantalla y sonido ----------
const OPC_CLAVE = 'fobeams-opciones';
const ACCIONES = [['arr', 'Arriba'], ['abj', 'Abajo'], ['izq', 'Izquierda'], ['der', 'Derecha'], ['disp', 'Disparar'], ['capt', 'Bola de captura'], ['rayo', 'Super rayo'], ['pausa', 'Pausa']];
const DEF = {
  teclas: { arr: ['ArrowUp', 'w'], abj: ['ArrowDown', 's'], izq: ['ArrowLeft', 'a'], der: ['ArrowRight', 'd'], disp: ['z', ' '], capt: ['x', null], rayo: ['c', null], pausa: ['p', 'Escape'] },
  pad: { disp: 0, capt: 2, rayo: 3, pausa: 9 },   // mando estándar: A, X, Y, Start (el movimiento va con el stick y la cruceta)
  tactil: { modo: 'auto', auto: true, escala: 1, opac: 0.6, vib: true, pos: { stick: [0.13, 0.7], disp: [0.9, 0.74], capt: [0.78, 0.86], rayo: [0.8, 0.6], pausa: [0.3, 0.07] } },
  pant: { cal: 'auto', bloom: true, sacudida: true, suave: false, mus: 0.5, vol: 0.8, fps: false }
};
const clona = o => JSON.parse(JSON.stringify(o));
let OPC = clona(DEF);
try { const g = JSON.parse(localStorage.getItem(OPC_CLAVE) || 'null'); if (g) { for (const k in DEF) if (g[k]) OPC[k] = Object.assign(OPC[k], g[k]); if (g.tactil && g.tactil.pos) OPC.tactil.pos = Object.assign(clona(DEF.tactil.pos), g.tactil.pos); } } catch (e) { /* sin almacenamiento */ }
function guardaOpc() { try { localStorage.setItem(OPC_CLAVE, JSON.stringify(OPC)); } catch (e) { /* vale hasta cerrar */ } if (typeof AC !== 'undefined' && AC) applyVolume(); fijaCal(); }
const ENAPP = !!window.Capacitor;
const NOM_PAD = ['A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT', 'SELECT', 'START', 'L3', 'R3', 'ARRIBA', 'ABAJO', 'IZQ.', 'DCHA.', 'HOME'];
const nombrePad = i => i == null ? '—' : 'BOTÓN ' + (NOM_PAD[i] || i);
function nombreTecla(k) { if (!k) return '—'; const m = { ' ': 'ESPACIO', ArrowUp: 'FLECHA ARR.', ArrowDown: 'FLECHA ABA.', ArrowLeft: 'FLECHA IZQ.', ArrowRight: 'FLECHA DER.', Escape: 'ESC', Enter: 'ENTER', Shift: 'SHIFT', Control: 'CTRL', Alt: 'ALT', Tab: 'TAB', Backspace: 'RETROC.' }; return m[k] || k.toUpperCase(); }

const KEYS = {}, FIJA = {}, KH = {}, PH = {}, TH = {}, PREV = {}, PU = {}, PAD = { mx: 0, my: 0, hay: false, prev: [] }, TV = { x: 0, y: 0 };
let ESPERA = null;   // casilla de controles esperando una tecla o un botón: { tipo: 'tecla' | 'pad', id, n }
const normaliza = e => e.key.length === 1 ? e.key.toLowerCase() : e.key;
function asignaTecla(k) {
  const { id, n } = ESPERA; ESPERA = null;
  if (k === 'Escape') return;
  if (k === 'Delete' || k === 'Backspace') { OPC.teclas[id][n] = null; guardaOpc(); return; }
  for (const a of ACCIONES) OPC.teclas[a[0]] = OPC.teclas[a[0]].map(t => t === k ? null : t);   // una tecla, una sola acción
  OPC.teclas[id][n] = k; guardaOpc();
}
function asignaPad(i) {
  const { id } = ESPERA; ESPERA = null;
  for (const a in OPC.pad) if (OPC.pad[a] === i) OPC.pad[a] = null;
  OPC.pad[id] = i; guardaOpc();
}
addEventListener('keydown', e => {
  const k = normaliza(e); if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Tab'].includes(e.key)) e.preventDefault();
  audioInit();
  if (ESPERA) {
    if (ESPERA.tipo === 'tecla') { asignaTecla(k); e.preventDefault(); return; }
    if (k === 'Escape') ESPERA = null; else if (k === 'Delete' || k === 'Backspace') { OPC.pad[ESPERA.id] = null; ESPERA = null; guardaOpc(); }
    return;
  }
  if (!KEYS[k]) FIJA[k] = true; KEYS[k] = true;
});
addEventListener('keyup', e => { KEYS[normaliza(e)] = false; });
addEventListener('blur', () => { for (const k in KEYS) KEYS[k] = false; for (const k in TH) TH[k] = false; TOQ.clear(); });
function leePad() {
  const gps = navigator.getGamepads ? navigator.getGamepads() : []; let mx = 0, my = 0, hay = false; const ahora = [];
  for (const a of ACCIONES) PH[a[0]] = false;
  for (const g of gps) {
    if (!g || !g.connected) continue; hay = true;
    for (const a of ACCIONES) { const b = OPC.pad[a[0]]; if (b != null && g.buttons[b] && g.buttons[b].pressed) PH[a[0]] = true; }
    const ax = g.axes[0] || 0, ay = g.axes[1] || 0; if (Math.hypot(ax, ay) > 0.22) { mx += ax; my += ay; }
    const bp = i => g.buttons[i] && g.buttons[i].pressed; if (bp(14)) mx -= 1; if (bp(15)) mx += 1; if (bp(12)) my -= 1; if (bp(13)) my += 1;
    for (let i = 0; i < g.buttons.length; i++) if (g.buttons[i].pressed) ahora[i] = true;
  }
  if (ESPERA && ESPERA.tipo === 'pad') for (let i = 0; i < ahora.length; i++) if (ahora[i] && !PAD.prev[i]) { asignaPad(i); break; }
  PAD.prev = ahora; PAD.hay = hay; PAD.mx = clamp(mx, -1, 1); PAD.my = clamp(my, -1, 1);
  if (PAD.mx < -0.5) PH.izq = true; if (PAD.mx > 0.5) PH.der = true; if (PAD.my < -0.5) PH.arr = true; if (PAD.my > 0.5) PH.abj = true;   // en los menús, el stick equivale a las flechas
}
function refresca() {   // una vez por cuadro: junta teclado, mando y táctil en acciones
  leePad();
  for (const a of ACCIONES) { const id = a[0]; KH[id] = OPC.teclas[id].some(k => k && KEYS[k]); const on = !!(KH[id] || PH[id] || TH[id]); if (on && !PREV[id]) PU[id] = true; PREV[id] = on; }
  TV.x = TV.y = 0;
  for (const t of TOQ.values()) if (t.tipo === 'stick') { const R = 70 * OPC.tactil.escala, dx = t.x - t.cx, dy = t.y - t.cy, d = Math.hypot(dx, dy), m = clamp((d / R - 0.15) / 0.85, 0, 1); if (d > 0) { TV.x = dx / d * m; TV.y = dy / d * m; } }
}
const act = id => PREV[id];

// táctil: palanca flotante a la izquierda y botones a la derecha; arrastrar para colocarlos (opciones > táctil)
const TOQ = new Map(); let TACTIL = false;
try { TACTIL = matchMedia('(pointer:coarse)').matches; } catch (e) { /* sin matchMedia */ }
const mostrarTactil = () => OPC.tactil.modo === 'si' || (OPC.tactil.modo === 'auto' && TACTIL);
const autoFuego = () => mostrarTactil() && OPC.tactil.auto;
function botonesT() {
  const T = OPC.tactil, e = T.escala, o = {};
  for (const id of ['stick', 'disp', 'capt', 'rayo', 'pausa']) o[id] = { x: T.pos[id][0] * W, y: T.pos[id][1] * H, r: (id === 'stick' ? 72 : id === 'disp' ? 52 : id === 'pausa' ? 26 : 42) * e };
  return o;
}
function ptr(e) { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H }; }
cv.addEventListener('contextmenu', e => e.preventDefault());
cv.addEventListener('pointerdown', e => {
  e.preventDefault(); audioInit(); if (e.pointerType === 'touch') TACTIL = true;
  const p = ptr(e); try { cv.setPointerCapture(e.pointerId); } catch (x) { /* sin captura */ }
  if (S.estado === 'editaT') {   // arrastrar un botón
    const B = botonesT(); let mejor = null, dm = 1e9; for (const id in B) { const d = Math.hypot(p.x - B[id].x, p.y - B[id].y); if (d < B[id].r * 1.3 && d < dm) { dm = d; mejor = id; } }
    if (mejor) TOQ.set(e.pointerId, { tipo: 'arrastra', id: mejor }); else tocaUI(p); return;
  }
  if (S.estado === 'jugando' && mostrarTactil()) {
    const B = botonesT();
    for (const id of ['capt', 'rayo', 'disp', 'pausa']) { if (id === 'disp' && OPC.tactil.auto) continue; const b = B[id]; if (Math.hypot(p.x - b.x, p.y - b.y) < b.r * 1.25) { TOQ.set(e.pointerId, { tipo: 'btn', id }); TH[id] = true; return; } }
    if (p.x < W * 0.55) TOQ.set(e.pointerId, { tipo: 'stick', cx: p.x, cy: p.y, x: p.x, y: p.y });
    return;
  }
  tocaUI(p);
});
cv.addEventListener('pointermove', e => {
  const t = TOQ.get(e.pointerId); if (!t) return; const p = ptr(e);
  if (t.tipo === 'stick') { t.x = p.x; t.y = p.y; const R = 72 * OPC.tactil.escala * 1.4, dx = t.x - t.cx, dy = t.y - t.cy, d = Math.hypot(dx, dy); if (d > R) { t.cx += dx / d * (d - R); t.cy += dy / d * (d - R); } }
  else if (t.tipo === 'arrastra') OPC.tactil.pos[t.id] = [clamp(p.x / W, 0.05, 0.95), clamp(p.y / H, 0.08, 0.94)];
});
function suelta(e) {
  const t = TOQ.get(e.pointerId);
  if (t) { if (t.tipo === 'btn') TH[t.id] = false; if (t.tipo === 'arrastra') guardaOpc(); TOQ.delete(e.pointerId); }
  if (e.pointerType === 'touch') pantallaCompleta(false);
}
cv.addEventListener('pointerup', suelta); cv.addEventListener('pointercancel', suelta);
function tocaUI(p) {
  UI.teclado = false;
  if ((S.estado === 'fin' || S.estado === 'victoria') && S.fin > 0.8) { volverMenu(); return; }
  for (let i = UI.prev.length - 1; i >= 0; i--) { const h = UI.prev[i]; if (p.x >= h.x && p.x <= h.x + h.w && p.y >= h.y && p.y <= h.y + h.h) { h.fn(); return; } }
}
let fsPedida = false;
function pantallaCompleta(forzar) {   // en el navegador del móvil: pantalla completa y horizontal (en la app ya viene así)
  if (ENAPP) return; const d = document, el = d.documentElement;
  try { if (!d.fullscreenElement && (forzar || !fsPedida) && el.requestFullscreen) { fsPedida = true; const pr = el.requestFullscreen(); if (pr && pr.then) pr.then(() => { try { screen.orientation.lock('landscape').catch(() => {}); } catch (x) { /* sin bloqueo */ } }).catch(() => {}); } } catch (x) { /* no se puede */ }
}
let wake = null;
function pantallaEncendida() { try { if (navigator.wakeLock && !wake) navigator.wakeLock.request('screen').then(w => { wake = w; w.addEventListener('release', () => { wake = null; }); }).catch(() => {}); } catch (x) { /* sin wake lock */ } }
function vib(ms) { try { if (OPC.tactil.vib && navigator.vibrate) navigator.vibrate(ms); } catch (x) { /* sin vibración */ } }
