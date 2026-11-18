// Fans of Zombies · LOS MENÚS CABEN EN LA PANTALLA (adaptador): la tele, la ficha de evacuación, el cartel, la pausa, la galería y el mapa
// están pensados para PC y miden lo mismo siempre. Si la pantalla es más pequeña (el móvil tumbado), cada uno se encoge lo justo para
// caber entero, sin cambiar su aspecto: se le pone la variable CSS --zb-k (la escala) y el CSS la añade a su transform.
// Se recalcula al girar o cambiar el tamaño y cada vez que se pinta un menú nuevo en #zb, #zb-capa o #zb-mapa.
'use strict';
const ENCAJE_MARGEN = 8;   // px libres alrededor de cada menú
// [selector, de quién copia la escala (la nota amarilla va con la tele)]
const ENCAJE_PANELES = [['.zb-tele'], ['.zb-ficha'], ['.zb-cartel'], ['.zb-pausa'], ['.zb-galeria'], ['.zm-marco'], ['.zb-nota', '.zb-tele']];

// cuánto hay que encoger un panel de w x h para que quepa (1 = no se encoge)
function escalaEncaje(w, h, W, H) {
  if (!w || !h) return 1;
  return Math.min(1, (W - ENCAJE_MARGEN * 2) / w, (H - ENCAJE_MARGEN * 2) / h);
}
function encajaPaneles() {
  const W = window.innerWidth, H = window.innerHeight, k = {};
  for (const [sel, de] of ENCAJE_PANELES) {
    for (const n of document.querySelectorAll(sel)) {
      k[sel] = de ? (k[de] || 1) : escalaEncaje(n.offsetWidth, n.offsetHeight, W, H);   // offsetWidth no cuenta la escala ya puesta
      n.style.setProperty('--zb-k', String(k[sel]));
    }
  }
}
function preparaEncaje() {
  const obs = new MutationObserver(encajaPaneles);
  for (const id of ['zb', 'zb-capa', 'zb-mapa']) obs.observe(el(id), { childList: true });
  window.addEventListener('resize', encajaPaneles);
  encajaPaneles();
}
