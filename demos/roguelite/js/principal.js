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
  // jugando, la barra del directo (botones, mapa y chat) va aparte, entre la vida y la escena: nada tapa el pixel art.
  // En pantallas bajas, la barra va sin chat y, si hace falta sitio para el panel, se recorta un poco el suelo de abajo
  BARRA.chat = alto >= 345 && !GUARDA.chatOff;
  BARRA.h = VIAJE.modo !== 'menu' ? (BARRA.chat ? 52 : 33) : 0;
  const B = BARRA.h, recorte = B ? Math.max(0, Math.min(24, B + PANEL_Y + 140 - alto)) : 0, dp = B - recorte;
  if (B) pintaBarra(b);
  // la escena (bajada B)
  const i1 = BOTONES.length;
  b.save(); b.translate(0, B);
  b.save(); b.beginPath(); b.rect(0, ESC.Y, W, ESC.H - recorte); b.clip();
  b.translate(TEMBLOR.x, TEMBLOR.y);
  pintaFondo(b, VIAJE.mx, RELOJ.t, W);
  pintaPersonajes(b, VIAJE.mx);
  pintaFx(b, 'abajo');
  pintaDelante(b, VIAJE.mx, W);
  barraRival(b);
  b.restore();
  b.save(); b.translate(TEMBLOR.x, TEMBLOR.y); pintaFx(b, 'arriba'); b.restore();
  DESPL = B; pintaEscenaUI(b);
  b.restore();
  const i2 = BOTONES.length;
  // el panel (bajado lo que baja la escena, menos el recorte)
  PAN.H = alto - dp; DESPL = dp;
  b.save(); b.translate(0, dp); pintaPanel(b); b.restore();
  const i3 = BOTONES.length;
  PAN.H = alto;
  b.save(); b.translate(0, B); pintaFx(b, 'monedas'); b.restore();
  DESPL = 0;
  for (let i = i1; i < i2; i++) BOTONES[i].y += B;
  for (let i = i2; i < i3; i++) BOTONES[i].y += dp;
  pintaHud(b);
  MONEDERO[1] -= B;   // las monedas vuelan con la escena bajada: su destino, subido lo mismo
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
  creaHeroe(); creaArdilla(); creaEnemigos(); creaEnemigos2(); creaEnemigos3(); creaEfectos(); creaProps(); creaIconos(); creaIconos2();
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
