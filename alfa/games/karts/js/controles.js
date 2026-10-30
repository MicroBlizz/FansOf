// Fans of Karts (prototipo) · LOS MANDOS: teclado, dedos y mando de consola, todos a la vez (vale el último que se toque).
//   Teclado: flechas o WASD (girar, acelerar, frenar) · Espacio o Mayús = bote y derrape · X, C o Intro = usar objeto · Esc o P = pausa
//   Dedos: botones en pantalla (◀ ▶ a la izquierda; DERRAPE, OBJETO y FRENO a la derecha). El kart acelera solo. Varios dedos a la vez.
//   Mando: palanca o cruceta · A acelera · B o gatillo derecho derrapa · X o gatillo izquierdo usa el objeto · Start pausa
// En los menús: tocar o hacer clic, o flechas e Intro. ENT es lo que está apretado ahora; PULSOS, lo que se acaba de apretar.
'use strict';

const ENT = { izq: false, der: false, gas: false, freno: false, derrapa: false, ejeX: 0, tactil: false, autoGas: false,
  get salida() { return this.gas || this.derrapa; } };
const PULSOS = { salta: false, usa: false, pausa: false };
const UI = { toque: null, tecla: null };          // para los menús: dónde se ha tocado (en píxeles del juego) y qué tecla de menú se ha pulsado
const TECLAS = { ArrowLeft: 'izq', KeyA: 'izq', ArrowRight: 'der', KeyD: 'der', ArrowUp: 'gas', KeyW: 'gas', ArrowDown: 'freno', KeyS: 'freno',
  Space: 'derrapa', ShiftLeft: 'derrapa', ShiftRight: 'derrapa', KeyZ: 'derrapa', KeyX: 'usa', KeyC: 'usa', Enter: 'usa', ControlLeft: 'usa', Escape: 'pausa', KeyP: 'pausa' };
const TECLAS_MENU = { ArrowLeft: 'izq', KeyA: 'izq', ArrowRight: 'der', KeyD: 'der', ArrowUp: 'arr', KeyW: 'arr', ArrowDown: 'aba', KeyS: 'aba', Enter: 'ok', Space: 'ok', KeyX: 'ok', Escape: 'atras', Backspace: 'atras' };
const TEC = { izq: false, der: false, gas: false, freno: false, derrapa: false };     // lo que aprieta el teclado
const DEDO = { izq: false, der: false, freno: false, derrapa: false };                // lo que aprietan los dedos
const MAN = { izq: false, der: false, gas: false, freno: false, derrapa: false, usa: false, pausa: false, ok: false, eje: 0 };   // y el mando

function juntaMandos() {
  ENT.izq = TEC.izq || DEDO.izq || MAN.izq; ENT.der = TEC.der || DEDO.der || MAN.der;
  ENT.gas = TEC.gas || MAN.gas; ENT.freno = TEC.freno || DEDO.freno || MAN.freno; ENT.derrapa = TEC.derrapa || DEDO.derrapa || MAN.derrapa; ENT.ejeX = MAN.eje;
}
window.addEventListener('keydown', e => {
  if (e.target && e.target.tagName === 'INPUT') { if (e.code === 'Escape') UI.tecla = 'atras'; return; }      // escribiendo (el código de la sala): las teclas son del cuadro
  if (e.repeat) { if (TECLAS[e.code] || TECLAS_MENU[e.code]) e.preventDefault(); return; }
  const t = TECLAS[e.code], m = TECLAS_MENU[e.code];
  if (t || m) e.preventDefault();
  if (m) UI.tecla = m;
  if (!t) return;
  if (ENT.tactil) { ENT.tactil = false; ENT.autoGas = AJUSTES.autoGas === 'si'; ajusta(); }
  if (t === 'usa') PULSOS.usa = true; else if (t === 'pausa') PULSOS.pausa = true;
  else { if (t === 'derrapa' && !TEC.derrapa) PULSOS.salta = true; TEC[t] = true; juntaMandos(); }
});
window.addEventListener('keyup', e => { const t = TECLAS[e.code]; if (t && t in TEC) { TEC[t] = false; juntaMandos(); } });
window.addEventListener('blur', () => { for (const k in TEC) TEC[k] = false; for (const k in DEDO) DEDO[k] = false; DEDOS.clear(); juntaMandos(); });

// ---------- dedos (y ratón): cada dedo aprieta el botón que tiene debajo, y puede resbalar de uno a otro sin levantarse ----------
const DEDOS = new Map();      // id del dedo → id del botón (o '' si no toca ninguno)
function botonEn(x, y) { for (const b of BOT) if (x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h && !(inclLista() && (b.id === 'izq' || b.id === 'der'))) return b.id; return ''; }
// de un punto de la ventana a un punto de la pantalla tal como la pinta el juego (que puede estar girada un cuarto de vuelta: Opciones → Jugar en)
function aLogico(cx, cy) {
  const r = cv.getBoundingClientRect(), px = (cx - r.left) * DPR, py = (cy - r.top) * DPR;
  return GIRADA === 90 ? [py, cv.width - px] : GIRADA === 270 ? [cv.height - py, px] : [px, py];
}
function dedosAlDia() {
  for (const k in DEDO) DEDO[k] = false;
  for (const b of DEDOS.values()) if (b in DEDO) DEDO[b] = true;
  juntaMandos();
}
function alTocar(e, abajo) {
  if (abajo) gestoDirecto.pantalla = PANT.id;      // en qué pantalla empezó el toque (ver gestoDirecto)
  if (e.pointerType === 'touch' && !ENT.tactil) { ENT.tactil = true; ENT.autoGas = AJUSTES.autoGas !== 'no'; ajusta(); }
  const [x, y] = aLogico(e.clientX, e.clientY);
  const enCarrera = PANT.id === 'carrera' && !PANT.pausa, b = enCarrera && ENT.tactil ? botonEn(x, y) : '', antes = DEDOS.get(e.pointerId);
  if (abajo || DEDOS.has(e.pointerId)) DEDOS.set(e.pointerId, b);
  if (b !== antes) {
    if (b === 'derrapa') PULSOS.salta = true;
    if (b === 'usa' && abajo) PULSOS.usa = true;
  }
  if (abajo && !b) {       // fuera de los botones: en los menús es un toque; en carrera, usar el objeto (o la pausa, arriba a la derecha)
    const gx = (x - OX) / ESC, gy = (y - OY) / ESC;
    if (!enCarrera) UI.toque = { x: gx, y: gy };
    else if (gx >= PW - HM - 18 && gx < PW - HM + 6 && gy >= -4 && gy < 18) PULSOS.pausa = true;
    else if (gx >= 0 && gx < PW && gy >= 0 && gy < PH) PULSOS.usa = true;
  }
  dedosAlDia();
}
function preparaDedos() {
  cv.addEventListener('pointerdown', e => { e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (_) { /* da igual */ } alTocar(e, true); });
  cv.addEventListener('pointermove', e => { if (DEDOS.has(e.pointerId)) alTocar(e, false); });
  const suelta = e => { DEDOS.delete(e.pointerId); dedosAlDia(); };
  cv.addEventListener('pointerup', suelta); cv.addEventListener('pointercancel', suelta);
  // fuera de las pantallas en HTML (tienda, pase, premios, cuenta…) el dedo no hace scroll ni zoom; dentro sí, y sus botones reciben el toque
  const enHtml = e => e.target !== cv && e.target.closest && !!e.target.closest('.kt-scr, .kt-modal, #fok-cuenta, #scr-confirm, #kt-monedero, #fok-energia, #kt-charla, #kt-menu');
  for (const ev of ['touchstart', 'touchmove', 'gesturestart', 'contextmenu', 'dblclick']) document.addEventListener(ev, e => { if (!enHtml(e) || ev === 'contextmenu') e.preventDefault(); }, { passive: false });
  // en algunos móviles el sonido solo arranca con estos gestos; y lo que el navegador solo deja hacer «dentro de un toque»
  // (pedir permiso para el giroscopio, la ventana de instalar, la pantalla completa) se hace aquí mismo, no en el fotograma siguiente
  for (const ev of ['touchend', 'click']) document.addEventListener(ev, e => { audioInit(); gestoDirecto(e); }, { capture: true });
}
// los botones de menú con «acción directa» (PANT.directas) se atienden dentro del propio gesto del dedo o del ratón
function gestoDirecto(e) {
  if (AJUSTES.giro && INCL.estado === 'no') inclActiva();          // el giroscopio guardado de otra visita: se vuelve a encender al primer toque
  const t = e.changedTouches ? e.changedTouches[0] : e, ahora = performance.now();
  if (!t || (e.type === 'click' && ahora - gestoDirecto.dedo < 700)) return;      // el clic que algunos navegadores mandan después del dedo no cuenta dos veces
  if (e.type === 'touchend') gestoDirecto.dedo = ahora;
  if (gestoDirecto.pantalla !== PANT.id) return;      // el toque abrió otra pantalla: lo que haya ahora debajo del dedo no se pulsa
  const [x, y] = aLogico(t.clientX, t.clientY), gx = (x - OX) / ESC, gy = (y - OY) / ESC;
  for (let i = 0; i < PANT.directas.length; i++) {
    const f = PANT.directas[i]; if (!f) continue;
    const a = PANT.rects[i * 4], b = PANT.rects[i * 4 + 1];
    if (gx >= a - 1 && gx < a + PANT.rects[i * 4 + 2] + 1 && gy >= b - 1 && gy < b + PANT.rects[i * 4 + 3] + 1) { f(); break; }
  }
}

// ---------- mando de consola ----------
function mando() {
  const g = navigator.getGamepads ? [...navigator.getGamepads()].find(Boolean) : null;
  if (!g) { if (MAN.gas || MAN.izq || MAN.der || MAN.eje) { for (const k in MAN) MAN[k] = k === 'eje' ? 0 : false; juntaMandos(); } return; }
  const b = i => !!(g.buttons[i] && g.buttons[i].pressed), x = g.axes[0] || 0;
  MAN.eje = Math.abs(x) > 0.25 ? x : 0; MAN.izq = b(14); MAN.der = b(15); MAN.gas = b(0); MAN.freno = b(6) || b(13);
  const d = b(1) || b(5) || b(7), u = b(2) || b(3) || b(4), p = b(9), ok = b(0);
  if (d && !MAN.derrapa) PULSOS.salta = true;
  if (u && !MAN.usa) PULSOS.usa = true;
  if (p && !MAN.pausa) PULSOS.pausa = true;
  if (ok && !MAN.ok) UI.tecla = 'ok';
  // en los menús: cruceta o palanca para moverse (también arriba y abajo) y B para volver
  const y = g.axes[1] || 0, izq = MAN.izq || x < -0.6, der = MAN.der || x > 0.6, arr = b(12) || y < -0.6, aba = b(13) || y > 0.6, atras = b(1) && (PANT.id !== 'carrera' || PANT.pausa);
  if (izq && !MAN.izqAntes) UI.tecla = 'izq'; if (der && !MAN.derAntes) UI.tecla = 'der';
  if (arr && !MAN.arrAntes) UI.tecla = 'arr'; if (aba && !MAN.abaAntes) UI.tecla = 'aba'; if (atras && !MAN.atrasAntes) UI.tecla = 'atras';
  MAN.izqAntes = izq; MAN.derAntes = der; MAN.arrAntes = arr; MAN.abaAntes = aba; MAN.atrasAntes = atras;
  MAN.derrapa = d; MAN.usa = u; MAN.pausa = p; MAN.ok = ok;
  juntaMandos();
}
gestoDirecto.dedo = -9999; gestoDirecto.pantalla = '';
// los mandos del jugador para este paso de la carrera
function leeMandos(k) {
  const c = k.c;
  c.giro = ENT.ejeX || (ENT.der ? 1 : 0) - (ENT.izq ? 1 : 0) || (inclLista() ? inclValor() : 0);
  if (CARRERA.espejo) c.giro = -c.giro;      // en el espejo la pantalla va volteada: el volante, también
  c.freno = ENT.freno; c.gas = ENT.autoGas ? !ENT.freno : ENT.gas; c.derrapa = ENT.derrapa;
  c.salta = PULSOS.salta; c.usa = PULSOS.usa;
  PULSOS.salta = false; PULSOS.usa = false;
}
