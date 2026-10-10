// Fans of Tactics Advance (prototipo) · CONTROLES: tocar o hacer clic (pantallas, ventanas, personajes y casillas), arrastrar
// para mover la cámara, pellizcar con dos dedos o la rueda del ratón para el zoom, pasar el ratón por encima, y el teclado
// (flechas, Intro, Esc y + / −). Cada toque se mira en los dos lienzos: el de las ventanas y el del mundo.
'use strict';

const cv = document.getElementById('cv');
// de un punto de la pantalla del navegador a píxeles de las ventanas (ui) y del mundo
function puntos(ev) {
  const r = cv.getBoundingClientRect(), x = (ev.clientX - r.left) * DPR, y = (ev.clientY - r.top) * DPR;
  return { ux: x / ESC_UI, uy: y / ESC_UI, mx: x / ESC_MUNDO, my: y / ESC_MUNDO };
}

// qué hay debajo de un punto del mundo: primero los personajes (los de delante ganan), luego la casilla
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
const botonPeq = (x, y) => BOTONES_PEQ.find((_, i) => dentro(geoPeq(i), x, y));

function toca(p) {
  if (J.fase === 'intro') return tocaIntro(p.ux, p.uy);
  if (PANT) return tocaPantalla(p.ux, p.uy);
  if (J.fase === 'titulo') { play('go'); return menuPrincipal(); }
  if (TUT && tocaLola(p.ux, p.uy)) return;
  if (J.fase === 'fin') return;
  const { ux, uy, mx, my } = p;
  const peq = botonPeq(ux, uy);
  if (peq === 'pausa') return pausa();
  if (peq) return zoom(peq === 'mas' ? 1 : -1);
  if (J.ocupado || J.fase !== 'jugador') return;
  if (J.sub) {
    const i = filaTocada(J.sub, geoSub(J.sub, MENU_X(), SUB_Y()), ux, uy);
    if (i >= 0) { if (J.sub[i].ok) { play('select'); J.sub[i].f(); } else play('deny'); return; }
    if (i === -1) return;
    J.sub = null; return;
  }
  if (J.menu) {
    const i = filaTocada(J.menu, geoMenu(J.menu, MENU_X(), MENU_Y()), ux, uy);
    if (i >= 0) { if (J.menu[i].ok) J.menu[i].f(); else play('deny'); return; }
    if (i === -1) return;
  }
  if (J.boton && dentro(geoBoton(J.boton.t, MENU_X(), BOTON_Y()), ux, uy)) { play('select'); J.boton.f(); return; }
  const u = unidadEnPantalla(mx, my), c = casillaEnPantalla(mx, my);
  if (c) J.cursor = c;
  const enCasilla = u || (c ? unidadEn(c[0], c[1]) : null);
  if (J.modo === 'mover') {
    if (u && u.eq === 'a' && u !== J.sel && !u.hecho && dejaTut('elegir')) return selecciona(u);
    if (c && J.marcas.azul.has(c.join(',')) && dejaTut('casilla', c)) return ejecutaMover(J.sel, c);
    return volver();
  }
  if (J.modo === 'atacar') {
    const o = enCasilla && J.objetivos.includes(enCasilla) && dejaTut('objetivo') ? enCasilla : null;
    if (o) { if (J.previa && J.previa.o === o) return ejecutaAtaque(J.sel, o, J.tec); return apunta(o); }
    return volver();
  }
  if (enCasilla && enCasilla.eq === 'a' && !enCasilla.hecho) { if (dejaTut('elegir')) selecciona(enCasilla); return; }
  if (enCasilla) { if (enCasilla.eq === 'e') J.fichaE = enCasilla; else J.fichaA = enCasilla; return; }
  if (dejaTut('volver')) deselecciona();
}
// con ratón: el cursor sigue a la casilla, la manita a los menús, y al pasar por un objetivo se ve el acierto y el daño
function pasa(p) {
  if (J.fase === 'intro') return;
  if (PANT) return pasaPantalla(p.ux, p.uy);
  if (J.ocupado || J.fase !== 'jugador') return;
  const { ux, uy, mx, my } = p;
  if (J.sub) { const i = filaTocada(J.sub, geoSub(J.sub, MENU_X(), SUB_Y()), ux, uy); if (i >= 0 && J.sub[i].ok) J.subActivo = i; }
  if (J.menu) { const i = filaTocada(J.menu, geoMenu(J.menu, MENU_X(), MENU_Y()), ux, uy); if (i >= 0 && J.menu[i].ok) J.menuActivo = i; }
  const c = casillaEnPantalla(mx, my);
  if (c) J.cursor = c;
  if (J.modo === 'atacar' && dejaTut('objetivo')) { const o = unidadEnPantalla(mx, my) || (c ? unidadEn(c[0], c[1]) : null); if (o && J.objetivos.includes(o) && (!J.previa || J.previa.o !== o)) apunta(o); }
}

/* ---------- dedos y ratón: tocar, arrastrar y pellizcar ---------- */
const DEDOS = new Map();
let PELLIZCO = null;
const separacion = () => { const [a, b] = [...DEDOS.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };
cv.addEventListener('pointerdown', ev => {
  DEDOS.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
  try { cv.setPointerCapture(ev.pointerId); } catch (_) { /* sin captura */ }
  if (DEDOS.size === 2) { PELLIZCO = { d: separacion(), z: ZOOM }; J.toque = null; return; }
  if (DEDOS.size === 1) J.toque = { cx: ev.clientX, cy: ev.clientY, arrastra: false, pan: [...J.pan] };
});
cv.addEventListener('pointermove', ev => {
  if (DEDOS.has(ev.pointerId)) DEDOS.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
  if (PELLIZCO && DEDOS.size === 2) { ponZoom(PELLIZCO.z * separacion() / Math.max(10, PELLIZCO.d)); return; }
  const T = J.toque;
  if (T) {
    const dx = ev.clientX - T.cx, dy = ev.clientY - T.cy;
    if (!T.arrastra && Math.hypot(dx, dy) > 8) T.arrastra = true;
    if (T.arrastra && !PANT && J.fase !== 'titulo') { const k = DPR / ESC_MUNDO; J.pan = [Math.max(-180, Math.min(180, T.pan[0] + dx * k)), Math.max(-120, Math.min(120, T.pan[1] + dy * k))]; }
  } else if (ev.pointerType === 'mouse' && !DEDOS.size) pasa(puntos(ev));
});
function suelta(ev, vale) {
  DEDOS.delete(ev.pointerId);
  if (PELLIZCO) { if (!DEDOS.size) PELLIZCO = null; J.toque = null; return; }
  const T = J.toque; J.toque = null;
  if (vale && T && !T.arrastra) toca(puntos(ev));
}
cv.addEventListener('pointerup', ev => suelta(ev, true));
cv.addEventListener('pointercancel', ev => suelta(ev, false));
cv.addEventListener('wheel', ev => { ev.preventDefault(); if (!PANT) zoom(ev.deltaY < 0 ? 1 : -1); }, { passive: false });
cv.addEventListener('contextmenu', ev => { ev.preventDefault(); if (!PANT && !J.ocupado && J.fase === 'jugador') volver(); });
window.addEventListener('keydown', ev => {
  if (J.fase === 'intro') { if (ev.key === 'Escape') terminaIntro(); else if (ev.key === 'Enter' || ev.key === ' ') avanzaIntro(); return; }
  if (PANT) { if (teclaPantalla(ev.key)) ev.preventDefault(); return; }
  if (J.fase === 'titulo') { if (ev.key === 'Enter' || ev.key === ' ') menuPrincipal(); return; }
  if (TUT && (ev.key === 'Enter' || ev.key === ' ')) { valeTut(); return; }
  if (ev.key === '+' || ev.key === '=') return zoom(1);
  if (ev.key === '-') return zoom(-1);
  if (ev.key === 'Escape' && J.fase === 'jugador' && !J.ocupado && !J.sel) { ev.preventDefault(); return pausa(); }
  if ((ev.key === 'Escape' || ev.key === 'Backspace') && !J.ocupado && J.fase === 'jugador') { ev.preventDefault(); volver(); }
});

// la pista de arriba a la izquierda: qué se puede hacer ahora (corta, que cabe en la pantalla)
function actualizaPista() {
  let t = '';
  if (TUT) t = '';
  else if (J.fase === 'enemigo') t = 'Le toca a Microblizz…';
  else if (J.fase === 'jugador') t = J.modo === 'mover' ? 'Elige una casilla azul' : J.modo === 'atacar' ? 'Toca dos veces al objetivo' : J.modo === 'menu' ? 'Elige una orden' : 'Toca a uno de los tuyos';
  J.pista = t ? tr(t) : '';
}
