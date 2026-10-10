// Fans of Roguelite · Arranque y bucle: la pantalla se dibuja a baja resolución (unos 196 píxeles de ancho) y se
// amplía a un número entero de veces para que cada píxel se vea nítido y cuadrado. También recoge los toques y el teclado.
'use strict';

const PAN = { W: 196, H: 400, k: 1 };
const cv = document.getElementById('juego'), g = cv.getContext('2d');
const buf = document.createElement('canvas');
let bctx = buf.getContext('2d');

function ajusta() {
  const dpr = window.devicePixelRatio || 1, caja = document.getElementById('caja').getBoundingClientRect();
  const dw = Math.floor(caja.width * dpr), dh = Math.floor(caja.height * dpr);
  const k = Math.max(1, Math.floor(Math.min(dw / 180, dh / 330)));
  const H_ = Math.max(330, Math.min(470, Math.floor(dh / k)));
  const W_ = Math.max(180, Math.min(216, Math.floor(dw / k), Math.floor(H_ * 0.62)));
  PAN.W = W_; PAN.H = H_; PAN.k = k;
  buf.width = W_; buf.height = H_; bctx = buf.getContext('2d');
  cv.width = W_ * k; cv.height = H_ * k;
  cv.style.width = (W_ * k / dpr) + 'px'; cv.style.height = (H_ * k / dpr) + 'px';
  g.imageSmoothingEnabled = false;
  if (VIAJE.modo === 'menu') { CONEJO.x = Math.round(W_ * 0.22); if (PROP) PROP.wx = Math.round(W_ * 0.68); MENU.ent && (MENU.ent.x = Math.round(W_ * 0.7)); }
  else if (!RIVAL) CONEJO.x = POS.conejo();
}

function dibuja() {
  const b = bctx, W = PAN.W, alto = PAN.H;
  BOTONES = [];
  b.fillStyle = COL.fondo; b.fillRect(0, 0, W, alto);
  // jugando: arriba del todo el mapa del camino, debajo la vida y luego la barra del directo (botones y chat), aparte de la
  // escena para que nada tape el pixel art. El chat enseña 2 frases (1 en pantallas bajas). Si el panel de abajo necesita
  // sitio para que sus textos quepan enteros, la escena se recorta (poco a poco): primero el suelo de abajo y después el
  // cielo de arriba (para elegir, hasta 64 de cielo: el conejo y lo que hay en el suelo se siguen viendo)
  const jugando = VIAJE.modo !== 'menu' && !!VIAJE.plan;
  MAPA.h = jugando ? ALTO_MAPA : 0;
  BARRA.chat = !GUARDA.chatOff;
  BARRA.lineas = alto >= 380 ? 2 : 1;
  BARRA.h = VIAJE.modo !== 'menu' ? (BARRA.chat ? 19 + BARRA.lineas * 9 : 18) : 0;
  const M = MAPA.h, B = M + BARRA.h, falta = B ? B + PANEL_Y + altoPanel(W) - alto : PANEL_Y + altoMenu() - alto;
  const obj = Math.max(0, Math.min(B ? 24 + (PANEL.modo === 'log' ? 18 : 64) : 24, falta));
  ESC.v += (obj - ESC.v) * 0.22; if (Math.abs(obj - ESC.v) < 0.6) ESC.v = obj;
  const vis = Math.round(ESC.v), rAbajo = Math.min(24, vis), rArriba = vis - rAbajo, dE = B - rArriba, dp = B - vis, dpObj = B - obj;
  const i0 = BOTONES.length;
  ESC.corte = rArriba;
  DESPL = M;
  if (BARRA.h) { b.save(); b.translate(0, M); pintaBarra(b); b.restore(); }
  for (let i = i0; i < BOTONES.length; i++) BOTONES[i].y += M;
  // la escena (bajada dE)
  const i1 = BOTONES.length;
  b.save(); b.translate(0, dE);
  b.save(); b.beginPath(); b.rect(0, ESC.Y + rArriba, W, ESC.H - rArriba - rAbajo); b.clip();
  b.translate(TEMBLOR.x, TEMBLOR.y);
  pintaFondo(b, VIAJE.mx, RELOJ.t, W);
  pintaPersonajes(b, VIAJE.mx);
  pintaFx(b, 'abajo');
  pintaDelante(b, VIAJE.mx, W);
  barraRival(b);
  b.restore();
  b.save(); b.translate(TEMBLOR.x, TEMBLOR.y); pintaFx(b, 'arriba'); b.restore();
  DESPL = dE; pintaEscenaUI(b);
  b.restore();
  const i2 = BOTONES.length;
  // el panel (bajado lo que baja la escena, menos los recortes); se reparte con el sitio que tendrá al acabar de subir
  PAN.H = alto - Math.min(dp, dpObj); DESPL = dp;
  b.save(); b.translate(0, dp); pintaPanel(b); b.restore();
  const i3 = BOTONES.length;
  PAN.H = alto;
  b.save(); b.translate(0, dE); pintaFx(b, 'monedas'); b.restore();
  DESPL = 0;
  for (let i = i1; i < i2; i++) BOTONES[i].y += dE;
  for (let i = i2; i < i3; i++) BOTONES[i].y += dp;
  // la vida (bajada lo que ocupa el mapa) y el mapa arriba del todo
  const i4 = BOTONES.length;
  DESPL = M; b.save(); b.translate(0, M); pintaHud(b); b.restore(); DESPL = 0;
  for (let i = i4; i < BOTONES.length; i++) BOTONES[i].y += M;
  if (M) pintaMapa(b);
  MONEDERO[1] += M - dE;   // las monedas vuelan con la escena bajada: su destino, en las mismas medidas
  g.drawImage(buf, 0, 0, cv.width, cv.height);
}

let ultimo = performance.now();
function fotograma(ahora) {
  const real = Math.min(0.1, Math.max(0, (ahora - ultimo) / 1000)); ultimo = ahora;
  const dt = avanzaReloj(real);
  avanzaViaje(dt);
  avanzaPersonajes(dt, real);
  avanzaFx(dt, real);
  dibuja();
  requestAnimationFrame(fotograma);
}

function arranca() {
  cargaGuarda(); RELOJ.vel = GUARDA.vel > 1 ? 2 : 1;
  ajusta();
  creaHeroe(); creaArdilla(); creaEnemigos(); creaEnemigos2(); creaEnemigos3(); creaEfectos(); creaProps(); creaIconos(); creaIconos2(); creaIconosMapa();
  volverMadriguera();
  document.getElementById('carga').hidden = true;
  cv.addEventListener('pointerdown', e => {
    sonidoInicia();
    const r = cv.getBoundingClientRect();
    toque((e.clientX - r.left) * PAN.W / r.width, (e.clientY - r.top) * PAN.H / r.height);
    e.preventDefault();
  });
  window.addEventListener('keydown', e => tecla(e.key));
  window.addEventListener('resize', ajusta);
  requestAnimationFrame(fotograma);
}
arranca();
