// Fans of Tactics Advance (prototipo) · ARRANQUE: traduce la página, pone el lienzo a escala (píxeles nítidos), el bucle y los botones.
'use strict';

traducePagina();
const cv = document.getElementById('cv'), mc = cv.getContext('2d');
let ESCALA = 3;
// la pantalla de 240 × 160 se amplía un número entero de veces (lo más cerca del ancho que hay) para que cada píxel sea cuadrado
function ajusta() {
  const dpr = Math.min(3, window.devicePixelRatio || 1), ancho = Math.max(240, cv.parentElement.clientWidth - 12);
  ESCALA = Math.max(1, Math.round((ancho * dpr) / LW));
  cv.width = LW * ESCALA; cv.height = LH * ESCALA;
  const css = Math.min(ancho, (LW * ESCALA) / dpr);
  cv.style.width = css + 'px'; cv.style.height = (css * LH) / LW + 'px';
  mc.imageSmoothingEnabled = false;
}
let T = 0, pausa = false, ultimo = 0;
const barraT = document.getElementById('barra');
function fotograma(ahora) {
  const dt = Math.min(0.05, (ahora - ultimo) / 1000 || 0); ultimo = ahora;
  if (!pausa) { T = (T + dt) % BUCLE; barraT.value = T.toFixed(2); }
  pinta(T);
  mc.imageSmoothingEnabled = false;
  mc.drawImage(lo, 0, 0, cv.width, cv.height);
  requestAnimationFrame(fotograma);
}
const bC = document.getElementById('b-cem'), bO = document.getElementById('b-ofi'), bP = document.getElementById('b-pausa');
function elige(n) { preparaEscena(n); T = 0; bC.setAttribute('aria-pressed', n === 'cementerio'); bO.setAttribute('aria-pressed', n === 'oficinas'); }
function pon(p) { pausa = p; bP.textContent = tr(pausa ? 'Seguir' : 'Pausa'); }
bC.addEventListener('click', () => elige('cementerio'));
bO.addEventListener('click', () => elige('oficinas'));
bP.addEventListener('click', () => pon(!pausa));
barraT.addEventListener('input', () => { pon(true); T = parseFloat(barraT.value); });
window.addEventListener('resize', ajusta);
ajusta(); elige('cementerio');
try { if (matchMedia('(prefers-reduced-motion: reduce)').matches) { T = 7.2; barraT.value = T; pon(true); } } catch (_) { /* sin preferencia */ }
document.getElementById('carga').hidden = true;
requestAnimationFrame(t => { ultimo = t; fotograma(t); });
