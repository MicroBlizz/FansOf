// Fans of Tactics Advance (prototipo) · CONTROLES: tocar o hacer clic (personajes, casillas, menús y botones), arrastrar para
// mover la cámara, pasar el ratón por encima (cursor y menú) y Esc para volver. También la pista de debajo de la pantalla.
'use strict';

const cv = document.getElementById('cv');
function aLo(ev) { const r = cv.getBoundingClientRect(); return [(ev.clientX - r.left) / r.width * LW, (ev.clientY - r.top) / r.height * LH]; }

// qué hay debajo de un punto de la pantalla: primero los personajes (los de delante ganan), luego la casilla
function unidadEnPantalla(x, y) {
  const lista = vivos().slice().sort((a, b) => (b.fx + b.fy) - (a.fx + a.fy));
  for (const u of lista) { const [px, py] = pantalla(u.fx, u.fy, u.fh); if (x >= px - 9 && x <= px + 9 && y >= py - (u.tipo === 'conejo' ? 34 : 28) && y <= py + 3) return u; }
  return null;
}
function casillaEnPantalla(x, y) {
  for (let d = 2 * (N - 1); d >= 0; d--) for (let gx = N - 1; gx >= 0; gx--) {
    const gy = d - gx; if (gy < 0 || gy >= N) continue;
    const X = CAM.x + wx(gx, gy) + 16, Y = CAM.y + wy(gx, gy, altura(gx, gy)) + 8 + (esAgua(gx, gy) ? BAJA_AGUA : 0);
    if (Math.abs(x - X) / 16 + Math.abs(y - Y) / 8 <= 1) return [gx, gy];
  }
  return null;
}
function filaTocada(items, g, x, y) { if (!items || !dentro(g, x, y)) return -2; return g.filas.findIndex(f => dentro(f, x, y)); }

function toca(x, y) {
  if (J.fin) { if (dentro(geoOtraVez(), x, y)) empieza(NOMBRE_ESC); return; }
  if (J.ocupado || J.fase !== 'jugador') return;
  if (J.sub) {
    const i = filaTocada(J.sub, geoSub(J.sub, MENU_X, SUB_Y), x, y);
    if (i >= 0) { if (J.sub[i].ok) J.sub[i].f(); return; }
    if (i === -1) return;
    J.sub = null; return;
  }
  if (J.menu) {
    const i = filaTocada(J.menu, geoMenu(J.menu, MENU_X, MENU_Y), x, y);
    if (i >= 0) { if (J.menu[i].ok) J.menu[i].f(); return; }
    if (i === -1) return;
  }
  if (J.boton && dentro(geoBoton(J.boton.t, MENU_X, BOTON_Y), x, y)) { J.boton.f(); return; }
  const u = unidadEnPantalla(x, y), c = casillaEnPantalla(x, y);
  if (c) J.cursor = c;
  const enCasilla = u || (c ? unidadEn(c[0], c[1]) : null);
  if (J.modo === 'mover') {
    if (u && u.eq === 'a' && u !== J.sel && !u.hecho) return selecciona(u);
    if (c && J.marcas.azul.has(c.join(','))) return ejecutaMover(J.sel, c);
    return volver();
  }
  if (J.modo === 'atacar') {
    const o = enCasilla && J.objetivos.includes(enCasilla) ? enCasilla : null;
    if (o) { if (J.previa && J.previa.o === o) return ejecutaAtaque(J.sel, o, J.tec); return apunta(o); }
    return volver();
  }
  if (enCasilla && enCasilla.eq === 'a' && !enCasilla.hecho) return selecciona(enCasilla);
  if (enCasilla) { if (enCasilla.eq === 'e') J.fichaE = enCasilla; else J.fichaA = enCasilla; return; }
  deselecciona();
}
// con ratón: el cursor sigue a la casilla, la manita al menú, y al pasar por un objetivo se ve el acierto y el daño
function pasa(x, y) {
  if (J.ocupado || J.fase !== 'jugador') return;
  if (J.sub) { const i = filaTocada(J.sub, geoSub(J.sub, MENU_X, SUB_Y), x, y); if (i >= 0 && J.sub[i].ok) J.subActivo = i; }
  if (J.menu) { const i = filaTocada(J.menu, geoMenu(J.menu, MENU_X, MENU_Y), x, y); if (i >= 0 && J.menu[i].ok) J.menuActivo = i; }
  const c = casillaEnPantalla(x, y);
  if (c) J.cursor = c;
  if (J.modo === 'atacar') { const o = unidadEnPantalla(x, y) || (c ? unidadEn(c[0], c[1]) : null); if (o && J.objetivos.includes(o) && (!J.previa || J.previa.o !== o)) apunta(o); }
}

cv.addEventListener('pointerdown', ev => {
  const [x, y] = aLo(ev);
  J.toque = { x, y, cx: ev.clientX, cy: ev.clientY, arrastra: false, pan: [...J.pan], escala: LW / cv.getBoundingClientRect().width };
  try { cv.setPointerCapture(ev.pointerId); } catch (_) { /* sin captura */ }
});
cv.addEventListener('pointermove', ev => {
  const [x, y] = aLo(ev), T = J.toque;
  if (T) {
    const dx = ev.clientX - T.cx, dy = ev.clientY - T.cy;
    if (!T.arrastra && Math.hypot(dx, dy) > 8) T.arrastra = true;
    if (T.arrastra && !J.fin) J.pan = [Math.max(-140, Math.min(140, T.pan[0] + dx * T.escala)), Math.max(-90, Math.min(90, T.pan[1] + dy * T.escala))];
  } else if (ev.pointerType === 'mouse') pasa(x, y);
});
cv.addEventListener('pointerup', ev => {
  const T = J.toque; J.toque = null;
  if (T && !T.arrastra) { const [x, y] = aLo(ev); toca(x, y); }
});
cv.addEventListener('pointercancel', () => { J.toque = null; });
cv.addEventListener('contextmenu', ev => { ev.preventDefault(); if (!J.ocupado && J.fase === 'jugador') volver(); });
window.addEventListener('keydown', ev => { if ((ev.key === 'Escape' || ev.key === 'Backspace') && !J.ocupado && J.fase === 'jugador') { ev.preventDefault(); volver(); } });

// la pista de debajo de la pantalla: qué se puede hacer ahora
const pista = document.getElementById('pista');
let PISTA = '';
function actualizaPista() {
  let t;
  if (J.fase === 'fin') t = 'Pulsa «Otra vez» para jugar de nuevo.';
  else if (J.fase === 'enemigo') t = 'Le toca a Microblizz…';
  else if (J.modo === 'mover') t = 'Toca una casilla azul para moverte.';
  else if (J.modo === 'atacar') t = 'Toca un enemigo en la zona roja y vuelve a tocarlo para confirmar.';
  else if (J.modo === 'menu') t = 'Elige qué hace: moverse, atacar, una técnica o esperar.';
  else t = 'Toca a CrazyBunny o a EpicChampion para darle órdenes. Arrastra para mover la cámara.';
  if (t !== PISTA) { PISTA = t; pista.textContent = tr(t); }
}
