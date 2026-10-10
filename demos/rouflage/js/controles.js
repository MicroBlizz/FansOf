// Fans of Rouflage (prototipo) · CONTROLES. Móvil: arrastrar en cualquier parte mueve (sale una palanca bajo el dedo) y, de cazador,
// un toque corto dispara a ese punto. Ordenador: WASD o flechas para andar, el ratón apunta la linterna y dispara, F pinta,
// Espacio congela, Q silba (las mismas teclas que el juego en el que se inspira). En el taller, el dedo o el ratón pintan.
'use strict';

const ENTRADA = { teclas: new Set(), toques: new Map(), palanca: null, raton: null, tactil: false };
const jugando = () => (J.fase === 'prep' || J.fase === 'caza') && !J.pausa && J.yo && !J.yo.fuera;

// hacia dónde quiere andar el jugador: [x, y] entre -1 y 1
function vectorMueve() {
  const k = ENTRADA.teclas; let x = 0, y = 0;
  if (k.has('ArrowLeft') || k.has('KeyA')) x -= 1; if (k.has('ArrowRight') || k.has('KeyD')) x += 1;
  if (k.has('ArrowUp') || k.has('KeyW')) y -= 1; if (k.has('ArrowDown') || k.has('KeyS')) y += 1;
  if (x || y) { const n = Math.hypot(x, y); return [x / n, y / n]; }
  const p = ENTRADA.palanca;
  if (p) { const dx = p.x - p.x0, dy = p.y - p.y0, d = Math.hypot(dx, dy); if (d > 9) { const f = Math.min(1, d / 44); return [dx / d * f, dy / d * f]; } }
  return [0, 0];
}

cv.addEventListener('pointerdown', ev => {
  ev.preventDefault();
  if (ev.pointerType !== 'mouse') ENTRADA.tactil = true; else if (ENTRADA.tactil && ev.movementX !== undefined) ENTRADA.tactil = false;
  if (TALLER.abierto) { try { cv.setPointerCapture(ev.pointerId); } catch (_) { /* da igual */ } tallerAbajo(ev); return; }
  if (!jugando()) return;
  if (ev.pointerType === 'mouse') { ENTRADA.raton = [ev.clientX, ev.clientY]; if (ev.button === 0 && J.yo.clase === 'cazador') { const [x, y] = aMundo(ev.clientX, ev.clientY); disparaJugador(x, y, 4); } return; }
  try { cv.setPointerCapture(ev.pointerId); } catch (_) { /* da igual */ }
  ENTRADA.toques.set(ev.pointerId, { x0: ev.clientX, y0: ev.clientY, x: ev.clientX, y: ev.clientY, t0: performance.now(), palanca: false });
});
cv.addEventListener('pointermove', ev => {
  if (ev.pointerType === 'mouse') ENTRADA.raton = [ev.clientX, ev.clientY];
  if (TALLER.abierto) { tallerMueve(ev); return; }
  const t = ENTRADA.toques.get(ev.pointerId); if (!t) return;
  t.x = ev.clientX; t.y = ev.clientY;
  if (!t.palanca && !ENTRADA.palanca && Math.hypot(t.x - t.x0, t.y - t.y0) > 10) { t.palanca = true; ENTRADA.palanca = t; }
});
function sueltaPuntero(ev) {
  if (TALLER.abierto) { tallerArriba(ev); return; }
  const t = ENTRADA.toques.get(ev.pointerId); if (!t) return;
  ENTRADA.toques.delete(ev.pointerId);
  if (t === ENTRADA.palanca) ENTRADA.palanca = null;
  else if (ev.type === 'pointerup' && !t.palanca && performance.now() - t.t0 < 380 && Math.hypot(t.x - t.x0, t.y - t.y0) < 12 && jugando() && J.yo.clase === 'cazador') {
    const [x, y] = aMundo(t.x, t.y); disparaJugador(x, y, 9);
  }
}
cv.addEventListener('pointerup', sueltaPuntero);
cv.addEventListener('pointercancel', sueltaPuntero);
cv.addEventListener('pointerleave', ev => { if (ev.pointerType === 'mouse') { ENTRADA.raton = null; if (TALLER.abierto && !TALLER.trazo) TALLER.puntero = null; } });
cv.addEventListener('contextmenu', ev => ev.preventDefault());

window.addEventListener('keydown', ev => {
  if (ev.repeat || ev.ctrlKey && ev.code !== 'KeyZ' || ev.metaKey && ev.code !== 'KeyZ' || ev.altKey) return;
  ENTRADA.teclas.add(ev.code);
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(ev.code) && !ev.target.closest('button, a')) ev.preventDefault();
  if (TALLER.abierto) {
    switch (ev.code) {
      case 'KeyF': case 'Enter': case 'Escape': cierraTaller(); play('select'); break;
      case 'KeyI': tallerHerramienta('gota'); break;
      case 'KeyR': tallerRellena(); break;
      case 'KeyZ': tallerDeshace(); break;
      case 'KeyC': tallerCalco(); break;
      case 'Digit1': case 'Digit2': case 'Digit3': tallerRadio(+ev.code.slice(-1) - 1); break;
      case 'Space': cierraTaller(); accionCongelar(); break;
    }
    return;
  }
  switch (ev.code) {
    case 'KeyF': accionPintar(); break;
    case 'Space': if (!ev.target.closest('button, a')) accionCongelar(); break;
    case 'KeyQ': case 'Digit1': accionSilbar(); break;
    case 'Enter': if (!ev.target.closest('button, a')) accionListo(); break;
    case 'Escape': case 'KeyP': accionPausa(); break;
  }
});
window.addEventListener('keyup', ev => ENTRADA.teclas.delete(ev.code));
window.addEventListener('blur', () => { ENTRADA.teclas.clear(); ENTRADA.palanca = null; ENTRADA.toques.clear(); });

// cada fotograma: lleva al jugador a donde quiere ir y apunta su linterna
function controlaJugador(dt) {
  const yo = J.yo; if (!yo || yo.fuera) return;
  let [mx, my] = jugando() && !TALLER.abierto ? vectorMueve() : [0, 0];
  if (yo.congelado) {
    // congelado no se anda, pero un empujón sostenido de la palanca (o de las teclas) rompe el hielo: así se puede salir corriendo a tiempo
    if (Math.hypot(mx, my) > 0.6) { yo.tRompe = (yo.tRompe || 0) + dt; if (yo.tRompe > 0.22) { descongela(yo); yo.tRompe = 0; play('pop'); refrescaHud(true); } } else yo.tRompe = 0;
    if (yo.congelado) mx = my = 0;
  }
  yo.vx = mx; yo.vy = my;
  if (yo.clase !== 'cazador') return;
  yo.tApunta = Math.max(0, (yo.tApunta || 0) - dt);
  if (ENTRADA.raton && !ENTRADA.tactil) {          // con ratón, la linterna sigue al cursor
    const [x, y] = aMundo(ENTRADA.raton[0], ENTRADA.raton[1]); giraHacia(yo, Math.atan2(y - (yo.y - 6), x - yo.x), dt, 16);
    if (!(mx || my)) yo.mira = Math.cos(yo.dir) >= 0 ? 1 : -1;
  } else if (yo.tApunta <= 0 && (mx || my)) giraHacia(yo, Math.atan2(my, mx), dt, 9);   // con el dedo, hacia donde andas
}

// el jugador dispara (de cazador) a un punto del mundo
function disparaJugador(x, y, margen) {
  const yo = J.yo; if (J.fase !== 'caza' || !yo || yo.clase !== 'cazador' || yo.balas <= 0) return;
  if (yo.enfria > 0) { play('deny'); return; }
  const ox = yo.x, oy = yo.y - 6;
  if (lejos(ox, oy, x, y) > AJUSTES.alcance) { pista(tr('Demasiado lejos: acércate más'), 1.6); play('deny'); return; }
  // se dispara al suelo: si has tocado una pared de frente, cuenta el suelo que tiene al pie
  let sy = y; while (celdaEn(x, sy) === CARA) sy += CEL;
  if (celdaEn(x, sy) !== SUELO || !seVen(ox, oy, x, Math.min(sy, Math.max(y, Math.floor(sy / CEL) * CEL + 3)))) { pista(tr('Ahí no llegas: hay un muro en medio'), 1.6); play('deny'); return; }
  yo.dir = Math.atan2(y - oy, x - ox); yo.mira = Math.cos(yo.dir) >= 0 ? 1 : -1; yo.tApunta = 0.7;
  fxDisparo(yo, x, y);
  const k = J.camaleones.find(k => !k.fuera && dentroDeAlubia(k, x, y, margen));
  if (k) { despide(k, yo); yo.balas = Math.min(AJUSTES.balas, yo.balas + 1); yo.enfria = AJUSTES.enfria * 0.7; return; }
  fxMancha(x, y);
  // a quien va corriendo se le puede disparar sin gastar carta
  if (J.camaleones.some(k => !k.fuera && k.hielo < 0.85 && (k.moviendo || k.movido > 0) && lejos(k.x, k.y - 24, x, y) < 60)) { yo.enfria = AJUSTES.enfria * 0.7; play('gun'); return; }
  yo.balas--; yo.ciego = AJUSTES.ciego; yo.enfria = AJUSTES.enfriaFallo; J.cuenta.fallos++; CAM.tiembla = 0.18; play('clank'); play('deny');
  const m = MUEBLES.find(m => m.T.senuelo && x > m.dib.x0 + 8 && x < m.dib.x0 + m.dib.w - 8 && y > m.dib.y0 && y < m.y + 2);
  if (m) { J.cuenta.senuelos++; avisa(tr('Has despedido a {b}. Despido improcedente.').replace('{b}', tr(NOMBRE_SENUELO[m.t])), 'malo'); }
  else avisa(tr('Ahí no había nadie. Despido improcedente: pierdes una carta.'), 'malo');
}
