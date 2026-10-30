// Fans of Rumble · Opciones → Colores del juego: la paleta clásica (morado y dorado) o Taberna, Neón y Pergamino.
// Se guarda en SAVE.paleta y se aplica con html[data-paleta]; los colores de cada una están en css/paletas.css.
'use strict';
const PALETAS = { '': '#150b21', taberna: '#0e2626', neon: '#12141c', pergamino: '#f3ead7' };   // el color de la barra del navegador en cada una
function paletaActual() { return SAVE && Object.prototype.hasOwnProperty.call(PALETAS, SAVE.paleta || '') ? SAVE.paleta || '' : ''; }
function aplicarPaleta() {
  const p = paletaActual(), raiz = document.documentElement;
  if (p) raiz.dataset.paleta = p; else delete raiz.dataset.paleta;
  const meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.content = PALETAS[p];
  document.querySelectorAll('#pal-opts .pal-opt').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.paleta === p)));
}
document.querySelectorAll('#pal-opts .pal-opt').forEach(b => b.addEventListener('click', () => {
  const p = b.dataset.paleta || '';
  if (p === paletaActual()) return;
  if (p) SAVE.paleta = p; else delete SAVE.paleta;
  saveGame(); play('select'); aplicarPaleta();
}));
// al abrir Opciones, y después de cargar un código o de borrar la partida (el SAVE cambia entero)
['#btn-options', '#btn-import', '#btn-reset'].forEach(s => { const b = $(s); if (b) b.addEventListener('click', aplicarPaleta); });
aplicarPaleta();
