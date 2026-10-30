// Fans of Karts · LA CAPA QUE GIRA CON EL JUEGO: con «Jugar en: horizontal» y el móvil de pie (o «vertical» con el móvil tumbado) el
// lienzo se pinta girado un cuarto de vuelta (principal.js: GIRADA). Las pantallas en HTML (menú principal, tienda, pase, salas online,
// monedero, caos, mensajes rápidos y la ventana de cuenta) van todas dentro de esta capa, que gira igual; así se ven del mismo lado
// que el juego. Lo que va «fijo» dentro de ella se coloca respecto a la capa (porque está girada), no respecto a la pantalla.
'use strict';

const CAPA = document.createElement('div'); CAPA.id = 'kt-capa'; document.body.appendChild(CAPA);
const EN_CAPA = '.kt-scr, .kt-modal, #kt-menu, #kt-charla, #kt-monedero, #fok-energia, #fok-cuenta, #scr-confirm';
let CAPA_GIRO = '';
function giraCapa() {
  for (const e of document.querySelectorAll('body > :is(' + EN_CAPA + ')')) CAPA.appendChild(e);      // las que se crean después también entran
  const w = window.innerWidth, h = window.innerHeight, k = GIRADA + '|' + w + '|' + h;
  if (k === CAPA_GIRO) return;
  CAPA_GIRO = k;
  const s = CAPA.style; CAPA.classList.toggle('girada', !!GIRADA);
  if (GIRADA === 90) Object.assign(s, { left: w + 'px', top: '0px', width: h + 'px', height: w + 'px', transform: 'rotate(90deg)' });
  else if (GIRADA === 270) Object.assign(s, { left: '0px', top: h + 'px', width: h + 'px', height: w + 'px', transform: 'rotate(-90deg)' });
  else Object.assign(s, { left: '0px', top: '0px', width: w + 'px', height: h + 'px', transform: 'none' });
}
// dónde está el dibujo del juego dentro de la capa (en píxeles de CSS): para colocar encima el menú principal
function rectoJuego() { return { x: OX / DPR, y: OY / DPR, w: PW * ESC / DPR, h: PH * ESC / DPR }; }

// ---------- arrastrar con el dedo cuando está girada: el navegador no sabe desplazar una caja girada, así que se hace a mano ----------
// (el dedo se mueve en la pantalla; se pasa a los ejes de la capa y se mueve lo que tenga barra: la lista hacia arriba y abajo, las pestañas a los lados)
const ARRASTRE = { x: 0, y: 0, movido: false };
const desplazable = (e, eje) => {
  for (let n = e; n && n !== CAPA; n = n.parentElement) {
    const cs = getComputedStyle(n), ov = eje === 'y' ? cs.overflowY : cs.overflowX;
    if ((ov === 'auto' || ov === 'scroll') && (eje === 'y' ? n.scrollHeight > n.clientHeight : n.scrollWidth > n.clientWidth)) return n;
  }
  return null;
};
CAPA.addEventListener('touchstart', e => { const t = e.touches[0]; ARRASTRE.x = t.clientX; ARRASTRE.y = t.clientY; ARRASTRE.movido = false; ARRASTRE.ini = e.target; }, { passive: true });
CAPA.addEventListener('touchmove', e => {
  if (!GIRADA) return;
  const t = e.touches[0], dx = t.clientX - ARRASTRE.x, dy = t.clientY - ARRASTRE.y;
  ARRASTRE.x = t.clientX; ARRASTRE.y = t.clientY;
  // en los ejes de la capa: girada 90° su «abajo» es la izquierda de la pantalla y su «derecha» es abajo (270°: al revés)
  const ly = GIRADA === 90 ? -dx : dx, lx = GIRADA === 90 ? dy : -dy;
  const caja = Math.abs(ly) >= Math.abs(lx) ? desplazable(ARRASTRE.ini, 'y') : desplazable(ARRASTRE.ini, 'x');
  if (caja) { if (Math.abs(ly) >= Math.abs(lx)) caja.scrollTop -= ly; else caja.scrollLeft -= lx; }
  if (Math.abs(dx) + Math.abs(dy) > 1) ARRASTRE.movido = true;
  e.preventDefault();
}, { passive: false });
// un arrastre no cuenta como toque en un botón
CAPA.addEventListener('click', e => { if (GIRADA && ARRASTRE.movido) { e.stopPropagation(); e.preventDefault(); ARRASTRE.movido = false; } }, true);
