// Fans of Rouflage · EL ZOOM DEL CAZADOR: de becario se puede acercar la cámara para mirar de cerca (o alejarla un poco). Pellizco con dos dedos,
// rueda del ratón, teclas + y −, o el botón de la lupa de la esquina, que pasa por tres niveles. El pellizco no dispara. Se recuerda en
// este navegador (rouflage-zoom-cazador). zoomJuego() (dibujo.js) lo multiplica.
'use strict';

const ZOOMC = { f: 1, min: 0.8, max: 2.2, niveles: [1, 1.4, 1.85], pinza: null };
try { const g = parseFloat(localStorage.getItem('rouflage-zoom-cazador')); if (g >= ZOOMC.min && g <= ZOOMC.max) ZOOMC.f = g; } catch (_) { /* sin guardar */ }

const zoomCazadorVale = () => J.fase !== 'titulo' && J.fase !== 'paseo' && J.modo === 'cazador' && !!J.yo && !TALLER.abierto;
function zoomCazadorPon(f) {
  ZOOMC.f = limita(f, ZOOMC.min, ZOOMC.max);
  try { localStorage.setItem('rouflage-zoom-cazador', ZOOMC.f.toFixed(2)); } catch (_) { /* sin guardar */ }
  const b = E('b-zoom'); if (b) b.classList.toggle('puesto', ZOOMC.f > 1.05);
}
// el botón de la lupa: 1 → 1,4 → 1,85 → 1
function zoomCazadorBoton() {
  const i = ZOOMC.niveles.findIndex(n => n > ZOOMC.f + 0.05);
  zoomCazadorPon(i < 0 ? ZOOMC.niveles[0] : ZOOMC.niveles[i]); play('select');
}
// el pellizco: lo llaman los controles con los dos dedos que hay en pantalla. Devuelve true si el gesto es del zoom
function zoomCazadorPinza(toques) {
  if (!zoomCazadorVale() || toques.size < 2) { ZOOMC.pinza = null; return false; }
  const [a, b] = Array.from(toques.values()), d = Math.hypot(a.x - b.x, a.y - b.y);
  if (!ZOOMC.pinza) ZOOMC.pinza = { d0: Math.max(20, d), f0: ZOOMC.f };
  else zoomCazadorPon(ZOOMC.pinza.f0 * d / ZOOMC.pinza.d0);
  return true;
}
cv.addEventListener('wheel', ev => { if (!zoomCazadorVale()) return; ev.preventDefault(); zoomCazadorPon(ZOOMC.f * Math.exp(-ev.deltaY * 0.0012)); }, { passive: false });
window.addEventListener('keydown', ev => {
  if (!zoomCazadorVale() || ev.repeat) return;
  if (ev.code === 'Equal' || ev.code === 'NumpadAdd' || ev.key === '+') zoomCazadorPon(ZOOMC.f * 1.15);
  else if (ev.code === 'Minus' || ev.code === 'NumpadSubtract' || ev.key === '-') zoomCazadorPon(ZOOMC.f / 1.15);
});
function preparaZoomCazador() { botonAccion(E('b-zoom'), zoomCazadorBoton); zoomCazadorPon(ZOOMC.f); }
