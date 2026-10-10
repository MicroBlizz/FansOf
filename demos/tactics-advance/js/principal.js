// Fans of Tactics Advance (prototipo) · ARRANQUE: la pantalla completa, el tamaño del píxel (el de las ventanas y el del mundo,
// que cambia con el zoom; siempre números enteros para que cada píxel sea cuadrado), el bucle y el menú principal.
'use strict';

traducePagina();
const mc = cv.getContext('2d');
let DPR = 1, ESC_UI = 3, ESC_MUNDO = 3, ZOOM = 1;
const zoomMin = () => Math.max(1, Math.ceil(ESC_UI * 0.5)), zoomMax = () => ESC_UI * 2 + 1;
function ajusta() {
  DPR = Math.min(3, window.devicePixelRatio || 1);
  const w = Math.max(240, window.innerWidth), h = Math.max(160, window.innerHeight);
  cv.width = Math.round(w * DPR); cv.height = Math.round(h * DPR);
  cv.style.width = w + 'px'; cv.style.height = h + 'px';
  // las ventanas: el píxel más grande con el que caben 200 × 170 píxeles del juego
  ESC_UI = Math.max(1, Math.floor(Math.min(cv.width / 200, cv.height / 170)));
  UW = Math.ceil(cv.width / ESC_UI); UH = Math.ceil(cv.height / ESC_UI);
  uo.width = UW; uo.height = UH;
  aplicaZoom(Math.round(ESC_UI * ZOOM));
}
// el mundo: cuántos píxeles de pantalla mide cada píxel del juego (más = más cerca)
function aplicaZoom(e) {
  const antes = [centroX(), centroY()];
  ESC_MUNDO = Math.max(zoomMin(), Math.min(zoomMax(), e));
  LW = Math.ceil(cv.width / ESC_MUNDO); LH = Math.ceil(cv.height / ESC_MUNDO);
  lo.width = LW; lo.height = LH;
  CAMB.x += centroX() - antes[0]; CAMB.y += centroY() - antes[1];
}
const puedeZoom = d => (d > 0 ? ESC_MUNDO < zoomMax() : ESC_MUNDO > zoomMin());
function zoom(d) { if (!puedeZoom(d)) return; aplicaZoom(ESC_MUNDO + d); ZOOM = ESC_MUNDO / ESC_UI; }
function ponZoom(z) { ZOOM = Math.max(zoomMin() / ESC_UI, Math.min(zoomMax() / ESC_UI, z)); const e = Math.round(ESC_UI * ZOOM); if (e !== ESC_MUNDO) aplicaZoom(e); }

let RELOJ = 0, ultimo = 0;
function fotograma(ahora) {
  const dt = Math.min(0.05, (ahora - ultimo) / 1000 || 0); ultimo = ahora;
  RELOJ += dt;
  actualiza(dt, RELOJ);
  pinta(RELOJ);
  uc.clearRect(0, 0, UW, UH);
  if (J.fase !== 'titulo') pintaUI(RELOJ);
  if (PANT) pintaPantalla(RELOJ);
  mc.imageSmoothingEnabled = false;
  mc.drawImage(lo, 0, 0, LW * ESC_MUNDO, LH * ESC_MUNDO);
  mc.drawImage(uo, 0, 0, UW * ESC_UI, UH * ESC_UI);
  requestAnimationFrame(fotograma);
}
window.addEventListener('resize', ajusta);
ajusta();
menuPrincipal();
document.getElementById('carga').hidden = true;
requestAnimationFrame(t => { ultimo = t; fotograma(t); });
