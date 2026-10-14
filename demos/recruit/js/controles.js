// Fans of Recruit · LOS MANDOS: teclado en el ordenador y, en el móvil, una palanca que aparece donde pones el pulgar izquierdo
// y cuatro botones a la derecha (disparo, salto, zanahoria bomba y CAOS). Cada paso del juego lee aquí hacia dónde se
// empuja, qué botones están apretados y cuáles se acaban de apretar.
'use strict';

const MANDO = { x: 0, y: 0, fuego: false, salto: false, bomba: false, caos: false, pausa: false, ok: false, p: {}, antes: {}, tactil: false, toque: null };
const TECLA = {};                                                       // lo que está apretado en el teclado
const PULSO = {};                                                       // lo apretado desde el último paso, aunque ya se haya soltado (así no se pierde un toque muy corto)
const BOTON = { fuego: false, salto: false, bomba: false, caos: false, pausa: false };   // lo que está apretado en la pantalla
const PALANCA = { on: false, cx: 0, cy: 0, dx: 0, dy: 0 };
const DEDOS = new Map();                                                // cada dedo que toca: qué está haciendo
const MAPA_TECLAS = { ArrowLeft: 'izq', KeyA: 'izq', ArrowRight: 'der', KeyD: 'der', ArrowUp: 'arr', KeyW: 'arr', ArrowDown: 'aba', KeyS: 'aba',
  KeyZ: 'fuego', KeyJ: 'fuego', KeyX: 'salto', KeyK: 'salto', Space: 'salto', KeyC: 'bomba', KeyL: 'bomba', KeyV: 'caos', KeyI: 'caos', Escape: 'pausa', KeyP: 'pausa', Enter: 'ok' };

// dónde están los botones en la pantalla del juego (en sus píxeles)
function geoMandos() {
  const W = J.W, H = J.H;
  return { fuego: { x: W - 34, y: H - 40, r: 18 }, salto: { x: W - 88, y: H - 26, r: 15 }, bomba: { x: W - 94, y: H - 74, r: 13 }, caos: { x: W - 40, y: H - 94, r: 13 }, pausa: { x: Math.round(W / 2) + 36, y: 13, r: 8 } };
}
function botonEn(x, y) {
  const G = geoMandos();
  let mejor = null, d0 = 1e9;
  for (const k in G) { const d = Math.hypot(x - G[k].x, y - G[k].y) - G[k].r; if (d < 7 && d < d0) { d0 = d; mejor = k; } }
  return mejor;
}
// de la pantalla del navegador a los píxeles del juego
function aJuego(e) { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * J.W / r.width, (e.clientY - r.top) * J.H / r.height]; }
function dedoBaja(e) {
  const [x, y] = aJuego(e);
  opcionAlToque(x, y);
  if (e.pointerType !== 'mouse') MANDO.tactil = true;
  MANDO.toque = { x, y };
  if (e.pointerType === 'mouse' && J.estado === 'juego' && !OPC.on) { const b = e.button === 2 ? 'bomba' : 'fuego'; DEDOS.set(e.pointerId, { b, raton: true }); BOTON[b] = true; PULSO[b] = true; return; }
  if (J.estado !== 'juego' || !MANDO.tactil) return;
  const b = botonEn(x, y);
  if (b) { DEDOS.set(e.pointerId, { b }); BOTON[b] = true; PULSO[b] = true; }
  else if (x < J.W * 0.55 && !PALANCA.on) {
    PALANCA.on = true; PALANCA.cx = Math.max(30, Math.min(J.W * 0.5, x)); PALANCA.cy = Math.max(J.H * 0.4, Math.min(J.H - 28, y)); PALANCA.dx = PALANCA.dy = 0;
    DEDOS.set(e.pointerId, { palanca: true });
  }
}
function dedoMueve(e) {
  const d = DEDOS.get(e.pointerId);
  if (!d || d.raton) return;
  const [x, y] = aJuego(e);
  if (d.palanca) {
    let dx = x - PALANCA.cx, dy = y - PALANCA.cy;
    const l = Math.hypot(dx, dy), R = 22;
    if (l > R) { PALANCA.cx += dx * (l - R) / l; PALANCA.cy += dy * (l - R) / l; dx *= R / l; dy *= R / l; }   // la palanca sigue al dedo
    PALANCA.dx = dx / R; PALANCA.dy = dy / R;
  } else {
    const b = botonEn(x, y);   // se puede resbalar de un botón a otro sin levantar el dedo
    if (b !== d.b) { if (d.b) BOTON[d.b] = false; d.b = b; if (b) BOTON[b] = true; }
  }
}
function dedoSube(e) {
  const d = DEDOS.get(e.pointerId);
  if (!d) return;
  if (d.palanca) { PALANCA.on = false; PALANCA.dx = PALANCA.dy = 0; } else if (d.b) BOTON[d.b] = false;
  DEDOS.delete(e.pointerId);
}
function sueltaTodo() { DEDOS.clear(); PALANCA.on = false; PALANCA.dx = PALANCA.dy = 0; for (const k in BOTON) BOTON[k] = false; for (const k in TECLA) TECLA[k] = false; for (const k in PULSO) PULSO[k] = false; }
function iniciaMandos() {
  cv.addEventListener('pointerdown', e => { e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (_) { /* da igual */ } dedoBaja(e); });
  cv.addEventListener('pointermove', e => { e.preventDefault(); dedoMueve(e); });
  for (const n of ['pointerup', 'pointercancel', 'lostpointercapture']) cv.addEventListener(n, dedoSube);
  cv.addEventListener('contextmenu', e => e.preventDefault());
  window.addEventListener('keydown', e => { if (teclaParaControles(e)) return; const k = MAPA_TECLAS[e.code]; if (!k) return; if (!e.repeat) { TECLA[k] = true; PULSO[k] = true; if (k === 'ok' || k === 'fuego' || k === 'salto') opcionAlToque(); } e.preventDefault(); });
  window.addEventListener('keyup', e => { const k = MAPA_TECLAS[e.code]; if (k) TECLA[k] = false; });
  window.addEventListener('blur', sueltaTodo);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { sueltaTodo(); if (J.estado === 'juego') pausa(true); } });
}
// se llama una vez en cada paso del juego: deja en MANDO lo que hay ahora y, en MANDO.p, lo recién apretado
function leeMando() {
  leeMandoConsola();
  const m = MANDO, zona = 0.3, on = k => !!(TECLA[k] || PULSO[k] || PAD.b[k]);
  m.x = (on('der') ? 1 : 0) - (on('izq') ? 1 : 0) || PAD.x || (PALANCA.dx > zona ? 1 : PALANCA.dx < -zona ? -1 : 0);
  m.y = (on('aba') ? 1 : 0) - (on('arr') ? 1 : 0) || PAD.y || (PALANCA.dy > 0.55 ? 1 : PALANCA.dy < -0.55 ? -1 : 0);
  for (const k of ['fuego', 'salto', 'bomba', 'caos', 'pausa']) { const v = on(k) || BOTON[k]; m.p[k] = v && !m.antes[k]; m.antes[k] = v; m[k] = v; }
  m.ok = on('ok');
  for (const k in PULSO) PULSO[k] = false;
}
// los mandos del móvil, medio transparentes. Solo salen si se ha tocado la pantalla con el dedo
function pintaMandos(g) {
  if (!MANDO.tactil || J.estado !== 'juego') return;
  if (!ICONOS.cara) creaIconos();
  const G = geoMandos(), boton = (k, tinta, dibuja, apagado) => {
    const { x, y, r } = G[k], on = BOTON[k];
    g.globalAlpha = on ? 0.5 : 0.3; circuloPx(g, x, y, r, '#0c1220');
    g.globalAlpha = apagado ? 0.12 : on ? 0.6 : 0.3; circuloPx(g, x, y, r - 2, tinta);
    g.globalAlpha = apagado ? 0.3 : 0.8; anilloPx(g, x, y, r, 1, '#f4f6ff');
    g.globalAlpha = apagado ? 0.35 : 0.95; dibuja(x, y); g.globalAlpha = 1;
  };
  // la palanca: donde está el pulgar o, si no, en su sitio de descanso
  const px = PALANCA.on ? Math.round(PALANCA.cx) : 44, py = PALANCA.on ? Math.round(PALANCA.cy) : J.H - 44, dx = Math.round(PALANCA.dx * 14), dy = Math.round(PALANCA.dy * 14);
  g.globalAlpha = 0.26; circuloPx(g, px, py, 24, '#0c1220');
  g.globalAlpha = 0.55; anilloPx(g, px, py, 24, 1, '#f4f6ff');
  g.globalAlpha = 0.45;
  for (const [ax, ay, w, h] of [[-19, -1, 1, 3], [-18, -2, 1, 5], [18, -1, 1, 3], [17, -2, 1, 5], [-1, -19, 3, 1], [-2, -18, 5, 1], [-1, 18, 3, 1], [-2, 17, 5, 1]]) rect(g, px + ax, py + ay, w, h, '#f4f6ff');
  g.globalAlpha = 0.5; circuloPx(g, px + dx, py + dy, 11, '#f4f6ff'); g.globalAlpha = 0.7; anilloPx(g, px + dx, py + dy, 11, 1, '#ffffff'); circuloPx(g, px + dx - 3, py + dy - 4, 2, '#ffffff');
  g.globalAlpha = 1;
  boton('fuego', '#ff9a1c', (x, y) => { pintaSpr(g, SPR.bala, x - 7, y); rect(g, x - 10, y - 4, 3, 1, '#ffd83c'); rect(g, x - 11, y + 4, 4, 1, '#ffd83c'); });
  boton('salto', '#58d6f0', (x, y) => { for (let k = 0; k < 5; k++) rect(g, x - k, y - 5 + k, k * 2 + 1, 1, '#f4f6ff'); rect(g, x - 1, y, 3, 5, '#f4f6ff'); });
  boton('bomba', '#8cdc64', (x, y) => pintaSpr(g, ICONOS.bomba, x, y + 7), JG.bombas <= 0 && !JG.mecha);
  boton('caos', '#b47aff', (x, y) => pintaSpr(g, ICONOS.caos, x, y), J.caos < 10);
  boton('pausa', '#8490a4', (x, y) => { rect(g, x - 3, y - 3, 2, 7, '#f4f6ff'); rect(g, x + 1, y - 3, 2, 7, '#f4f6ff'); });
}
