// Fans of Tactics Advance (prototipo) · ARRANQUE: traduce la página, pone la pantalla a escala (píxeles nítidos), el bucle y los
// botones de los escenarios.
'use strict';

traducePagina();
const mc = cv.getContext('2d');
// la pantalla de 240 × 160 se amplía un número entero de veces (lo más cerca del ancho que hay) para que cada píxel sea cuadrado
function ajusta() {
  const dpr = Math.min(3, window.devicePixelRatio || 1), ancho = Math.max(240, cv.parentElement.clientWidth - 12);
  const escala = Math.max(1, Math.round((ancho * dpr) / LW));
  cv.width = LW * escala; cv.height = LH * escala;
  const css = Math.min(ancho, (LW * escala) / dpr);
  cv.style.width = css + 'px'; cv.style.height = (css * LH) / LW + 'px';
  mc.imageSmoothingEnabled = false;
}
let RELOJ = 0, ultimo = 0;
function fotograma(ahora) {
  const dt = Math.min(0.05, (ahora - ultimo) / 1000 || 0); ultimo = ahora;
  RELOJ += dt;
  actualiza(dt);
  pinta(RELOJ);
  mc.imageSmoothingEnabled = false;
  mc.drawImage(lo, 0, 0, cv.width, cv.height);
  requestAnimationFrame(fotograma);
}
const bC = document.getElementById('b-cem'), bO = document.getElementById('b-ofi'), bR = document.getElementById('b-otra');
function elige(n) { empieza(n); bC.setAttribute('aria-pressed', n === 'cementerio'); bO.setAttribute('aria-pressed', n === 'oficinas'); }
bC.addEventListener('click', () => elige('cementerio'));
bO.addEventListener('click', () => elige('oficinas'));
bR.addEventListener('click', () => elige(NOMBRE_ESC));
window.addEventListener('resize', ajusta);
ajusta(); elige('cementerio');
document.getElementById('carga').hidden = true;
requestAnimationFrame(t => { ultimo = t; fotograma(t); });
