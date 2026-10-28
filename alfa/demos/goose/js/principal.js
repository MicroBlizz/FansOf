// Fans of Goose · Arranque y bucle: el mundo mide 200 de ancho y TODO se dibuja en un canvas pequeño (2 píxeles por unidad,
// 400 de ancho) que el navegador amplía sin suavizar (image-rendering: pixelated): así todo es pixel art del mismo tamaño
// (personajes, iconos, casillas, efectos y letras) y el móvil pinta pocos píxeles. Recoge el dedo (palanca flotante, dos
// toques = Impulso), el ratón y el teclado (flechas o WASD, espacio = Impulso, P o Esc = pausa).
'use strict';

const PIXELES = 2;   // píxeles de verdad por unidad del mundo (el tamaño del pixel art)
const PAN = { W: 200, H: 400, k: PIXELES };
const ENTRADA = { mx: 0, my: 0, palanca: false, px: 0, py: 0, id: null, botonDown: false, bx: 0, by: 0, ultimoToque: 0, ux: 0, uy: 0, teclas: {} };
const cv = document.getElementById('juego');
G = cv.getContext('2d', { alpha: false });
G.imageSmoothingEnabled = false;

function ajusta() {
  const r = document.getElementById('caja').getBoundingClientRect();
  const W = CFG.W, H = Math.max(340, Math.min(440, Math.round(r.height / r.width * W)));
  const css = Math.min(r.width / W, r.height / H);
  PAN.W = W; PAN.H = H; PAN.k = PIXELES;
  cv.width = Math.round(W * PAN.k); cv.height = Math.round(H * PAN.k);
  cv.style.width = Math.round(W * css) + 'px'; cv.style.height = Math.round(H * css) + 'px';
  preparaSprites(); preparaFondo(); preparaJardin(); preparaSuelos(); preparaAdornosCasillas(); preparaRejilla(H);
}

// --- el dedo ---
const punto = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * PAN.W / r.width, (e.clientY - r.top) * PAN.H / r.height]; };
function botonEn(x, y) { for (let i = BOTONES.length - 1; i >= 0; i--) { const b = BOTONES[i]; if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return b; } return null; }
function bajaDedo(e) {
  audioInit(); e.preventDefault();
  const [x, y] = punto(e), E = ENTRADA, J = JUEGO;
  E.botonDown = true; E.bx = x; E.by = y; E.bBoton = botonEn(x, y);
  if (J.modo === 'juego') {
    // dos toques seguidos: Impulso
    const ahora = performance.now();
    if (ahora - E.ultimoToque < 300 && Math.hypot(x - E.ux, y - E.uy) < 40 && usaImpulso()) { E.ultimoToque = 0; return; }
    E.ultimoToque = ahora; E.ux = x; E.uy = y;
    if (!E.bBoton && E.id === null) { E.id = e.pointerId; E.palanca = true; E.px = x; E.py = y; E.mx = 0; E.my = 0; try { cv.setPointerCapture(e.pointerId); } catch (_) { /* da igual */ } }
  }
}
function mueveDedo(e) {
  const E = ENTRADA; if (e.pointerId !== E.id || !E.palanca) return;
  const [x, y] = punto(e); let dx = x - E.px, dy = y - E.py; const d = Math.hypot(dx, dy), R = 22;
  if (d > R) { E.px += dx / d * (d - R); E.py += dy / d * (d - R); dx = x - E.px; dy = y - E.py; }   // la palanca te sigue si te pasas
  E.mx = dx / R; E.my = dy / R;
}
function sueltaDedo(e) {
  const E = ENTRADA, [x, y] = punto(e);
  if (e.pointerId === E.id) { E.id = null; E.palanca = false; E.mx = 0; E.my = 0; }
  if (E.botonDown) {
    const b = botonEn(x, y);
    // los botones se rehacen en cada fotograma: vale si se suelta en el mismo sitio donde se tocó
    const mismo = b && E.bBoton && b.x === E.bBoton.x && b.y === E.bBoton.y && b.w === E.bBoton.w && b.h === E.bBoton.h;
    if (mismo) b.accion();
    else if (JUEGO.modo === 'cofre') cierraCofre();
  }
  E.botonDown = false;
}
cv.addEventListener('pointerdown', bajaDedo);
cv.addEventListener('pointermove', mueveDedo);
cv.addEventListener('pointerup', sueltaDedo);
cv.addEventListener('pointercancel', e => { if (e.pointerId === ENTRADA.id) { ENTRADA.id = null; ENTRADA.palanca = false; ENTRADA.mx = ENTRADA.my = 0; } ENTRADA.botonDown = false; });

// --- el teclado (para probar en el ordenador) ---
addEventListener('keydown', e => {
  ENTRADA.teclas[e.code] = true; audioInit();
  if (e.code === 'Space') { e.preventDefault(); if (JUEGO.modo === 'juego') usaImpulso(); else if (JUEGO.modo === 'cofre') cierraCofre(); }
  if (e.code === 'KeyP' || e.code === 'Escape') { if (JUEGO.modo === 'juego') pausa(); else if (JUEGO.modo === 'pausa') JUEGO.modo = 'juego'; }
  if (JUEGO.modo === 'cartas' && /^Digit[1-4]$/.test(e.code)) eligeCarta(+e.code.slice(5) - 1);
});
addEventListener('keyup', e => { ENTRADA.teclas[e.code] = false; });
function leeTeclado() {
  const T = ENTRADA.teclas; if (ENTRADA.palanca) return;
  const x = (T.ArrowRight || T.KeyD ? 1 : 0) - (T.ArrowLeft || T.KeyA ? 1 : 0), y = (T.ArrowDown || T.KeyS ? 1 : 0) - (T.ArrowUp || T.KeyW ? 1 : 0);
  if (!x && !y) { if (ENTRADA.teclado) { ENTRADA.teclado = false; ENTRADA.mx = ENTRADA.my = 0; } return; }   // sin teclas, manda el dedo
  const d = Math.hypot(x, y); ENTRADA.mx = x / d; ENTRADA.my = y / d; ENTRADA.teclado = true;
}

// si te vas de la app, pausa
document.addEventListener('visibilitychange', () => { if (document.hidden) pausa(); });

// --- el bucle ---
let ultimo = performance.now();
function fotograma(ahora) {
  requestAnimationFrame(fotograma);
  const dt = Math.min(0.05, Math.max(0, (ahora - ultimo) / 1000)); ultimo = ahora;
  const J = JUEGO;
  leeTeclado();
  BOTONES.length = 0;
  G.setTransform(PAN.k, 0, 0, PAN.k, 0, 0);
  G.imageSmoothingEnabled = false;
  if (J.modo === 'portada') { pintaPortada(dt); }
  else if (J.modo === 'tienda') { pintaTienda(); }
  else if (J.modo === 'opciones' && J.opcionesDe === 'portada') { pintaOpciones(); }
  else if (J.modo === 'amigos') { pintaAmigos(); }
  else if (J.modo === 'sala') { pintaSala(); }
  else {
    if (J.modo === 'juego') avanzaPartida(dt);
    else if (J.modo === 'fin' || J.modo === 'cofre' || J.modo === 'cartas') avanzaEfectos(dt * (J.modo === 'fin' ? 1 : 0.15));
    pintaVacio(); pintaMundo(); pintaEncima();
    if (J.modo !== 'fin') pintaHud();
    if (J.modo === 'juego') pintaPalanca();
    else if (J.modo === 'cartas') pintaCartas(dt);
    else if (J.modo === 'cofre') pintaCofre(dt);
    else if (J.modo === 'pausa') pintaPausa();
    else if (J.modo === 'opciones') pintaOpciones();
    else if (J.modo === 'fin') pintaFin(dt);
  }
  vigilaMusica();
}

async function arranca() {
  cargaGuarda();
  await cargaImagenes();
  ajusta();
  addEventListener('resize', () => { clearTimeout(arranca.t); arranca.t = setTimeout(ajusta, 150); });
  try { await Promise.race([Promise.all([document.fonts.load('700 20px "Pixelify Sans"'), document.fonts.load('400 20px "Pirata One"')]), new Promise(r => setTimeout(r, 1500))]); } catch (e) { /* sin letra propia */ }
  ajusta();   // otra vez, ya con las letras cargadas
  document.getElementById('carga').hidden = true;
  miraEnlaceSala();
  requestAnimationFrame(fotograma);
}
arranca();
