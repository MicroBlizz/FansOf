// Fans of Snakes · Arranque y bucle: el mundo mide 200 de ancho y el canvas va a la resolución real de la pantalla (con la
// densidad de píxeles del móvil). Recoge el dedo (o el ratón) y se lo pasa a js/entrada.js.
'use strict';

const PAN = { W: 200, H: 400, k: 1 };
const cv = document.getElementById('juego');
G = cv.getContext('2d');

function ajusta() {
  const dpr = Math.min(3, window.devicePixelRatio || 1), r = document.getElementById('caja').getBoundingClientRect();
  const W = 200, H = Math.max(360, Math.min(440, Math.round(r.height / r.width * W)));
  const css = Math.min(r.width / W, r.height / H);
  PAN.W = W; PAN.H = H; PAN.k = css * dpr;
  cv.width = Math.round(W * PAN.k); cv.height = Math.round(H * PAN.k);
  cv.style.width = Math.round(W * css) + 'px'; cv.style.height = Math.round(H * css) + 'px';
  calculaTablero(W, H);
}

let ultimo = performance.now();
function fotograma(ahora) {
  const dt = Math.min(0.05, Math.max(0, (ahora - ultimo) / 1000)); ultimo = ahora;
  avanzaJuego(dt);
  vigilaMusica();
  G.setTransform(PAN.k, 0, 0, PAN.k, 0, 0);
  G.imageSmoothingEnabled = !esRetro();
  pintaTodo(PAN.W, PAN.H, dt);
  requestAnimationFrame(fotograma);
}

async function arranca() {
  cargaGuarda();
  ajusta();
  try { await Promise.race([document.fonts.load('800 20px "Baloo 2"'), new Promise(r => setTimeout(r, 1500))]); } catch (e) { /* sin letra propia */ }
  document.getElementById('carga').hidden = true;
  const punto = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * PAN.W / r.width, (e.clientY - r.top) * PAN.H / r.height]; };
  cv.addEventListener('pointerdown', e => { audioInit(); cv.setPointerCapture(e.pointerId); dedoBaja(...punto(e)); e.preventDefault(); });
  cv.addEventListener('pointermove', e => { if (DEDO.activo) dedoMueve(...punto(e)); });
  cv.addEventListener('pointerup', e => dedoSube(...punto(e)));
  cv.addEventListener('pointercancel', () => { DEDO.activo = false; sueltaPalanca(); });
  window.addEventListener('resize', ajusta);
  setTimeout(subePendiente, 4000);   // lo que no esté aún en el ranking mundial (js/ranking.js)
  requestAnimationFrame(fotograma);
}
arranca();
