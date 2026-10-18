// Fans Of Decks · Dibujo: los personajes de la serie en miniatura (drawVector, de core) y los iconos de los trámites y directivas, en lienzos pequeños con caché.
'use strict';
const DC_CACHE = {};
// Un lienzo con el personaje `key` de `alto` puntos de alto (el dibujo se hace a la escala del aparato, nítido).
function dcSprite(key, alto, ancho) {
  ancho = ancho || Math.round(alto * 1.1);
  const id = key + ':' + alto + ':' + ancho;
  if (!DC_CACHE[id]) {
    const r = Math.min(2, window.devicePixelRatio || 1), c = document.createElement('canvas');
    c.width = Math.round(ancho * r); c.height = Math.round(alto * r); c.style.width = ancho + 'px'; c.style.height = alto + 'px'; c.className = 'dc-sprite';
    const x = c.getContext('2d'); x.scale(r, r);
    if (ART[key]) drawVector(x, key, ancho / 2, alto * 0.94, alto * 0.86);
    DC_CACHE[id] = c;
  }
  return DC_CACHE[id].cloneNode ? dcClona(DC_CACHE[id]) : DC_CACHE[id];
}
function dcClona(c) { const n = document.createElement('canvas'); n.width = c.width; n.height = c.height; n.style.cssText = c.style.cssText; n.className = c.className; n.getContext('2d').drawImage(c, 0, 0); return n; }
// El icono de una carta sin dibujo propio: dos letras sobre un redondel del color de la rareza.
function dcIcono(letras, rar, alto) {
  const R = RARITY[rar] || RARITY.basic, d = document.createElement('div');
  d.className = 'dc-icono'; d.style.setProperty('--c1', R[1]); d.style.setProperty('--c2', R[2]); d.style.width = d.style.height = alto + 'px'; d.style.fontSize = Math.round(alto * 0.42) + 'px';
  d.textContent = letras;
  return d;
}
// El dibujo de una carta: su unidad o su icono.
function dcArteCarta(carta, alto) { const D = DC_CARTAS[carta.id]; return D.arte && ART[D.arte] ? dcSprite(D.arte, alto) : dcIcono(D.ic || '??', D.rar, alto); }
// La intención de un rival: letra del tipo de jugada y su color.
const DC_INTENCION = {
  ataque: ['!', '#ff4b5c', 'Va a atacar'], defensa: ['◆', '#6fc4ff', 'Se va a defender'], cura: ['+', '#7be04a', 'Va a curar a los suyos'],
  refuerzo: ['+1', '#ffcb3d', 'Va a llamar a refuerzos'], spam: ['@', '#d43cff', 'Te va a mandar Spam'], fuerza: ['↑', '#ff9a3c', 'Se va a potenciar'], debil: ['↓', '#cdb9ea', 'Te va a debilitar'],
};
// El arte de la portada: CrazyBunny con unos becarios detrás.
function dcPortadaArte(cv) {
  const x = cv.getContext('2d'), r = Math.min(2, window.devicePixelRatio || 1);
  cv.width = 300 * r; cv.height = 160 * r; cv.style.width = '300px'; cv.style.height = '160px'; x.scale(r, r);
  for (const [k, px, h] of [['becario', 60, 54], ['starbot', 238, 60], ['becario', 258, 50]]) drawVector(x, k, px, 150, h);
  drawVector(x, 'bunny', 150, 156, 118);
}

// ---------- iconos dibujados (nada de emojis): trazo grueso del color del contorno de la serie ----------
// Cada uno es el interior de un <svg viewBox="0 0 24 24">; dcSvg(nombre, clase) lo envuelve. Los colores van por currentColor y por la variable --ic.
const DC_SVG = {
  ataque: '<path d="M4 20l9-9M13 11l5-6 2 2-6 5zM4 20l-1-3 3 1z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 10l1 1" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
  defensa: '<path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M12 7v10" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
  cura: '<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>',
  refuerzo: '<circle cx="9" cy="8" r="3.2" fill="none" stroke="currentColor" stroke-width="2.3"/><path d="M3.5 19c0-3.5 2.5-5.5 5.5-5.5s5.5 2 5.5 5.5" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/><path d="M17 8v6M14 11h6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
  spam: '<rect x="3" y="5" width="18" height="14" rx="2.5" fill="none" stroke="currentColor" stroke-width="2.3"/><path d="M4 7l8 6 8-6" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linejoin="round"/>',
  fuerza: '<path d="M12 19V6M6 12l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>',
  debil: '<path d="M12 5v13M6 12l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>',
  aturdido: '<path d="M6 8h6l-6 8h6M14 5h4l-4 5h4" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>',
  reunion: '<circle cx="8" cy="8" r="3" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="16" cy="8" r="3" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M2.5 19c0-3 2.3-5 5.5-5 1.6 0 3 .5 4 1.4M11 20c0-3.3 2.2-5.5 5-5.5s5 2.2 5 5.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
  elite: '<path d="M4 18h16M5 18l-1-9 5 3 3-6 3 6 5-3-1 9" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linejoin="round" stroke-linecap="round"/>',
  jefe: '<rect x="4" y="5" width="16" height="12" rx="3" fill="none" stroke="currentColor" stroke-width="2.3"/><circle cx="9" cy="11" r="1.6" fill="currentColor"/><circle cx="15" cy="11" r="1.6" fill="currentColor"/><path d="M12 2v3M8 20h8" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/>',
  correo: '<rect x="3" y="5" width="18" height="14" rx="2.5" fill="none" stroke="currentColor" stroke-width="2.3"/><path d="M4 7l8 6 8-6" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linejoin="round"/>',
  pausa: '<path d="M5 8h11v6a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5zM16 10h2a2.5 2.5 0 0 1 0 5h-2" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linejoin="round"/><path d="M8 3.5c0 1.5 1.5 1.5 1.5 3M11.5 3.5c0 1.5 1.5 1.5 1.5 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  economato: '<path d="M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linejoin="round"/>',
  mazo: '<rect x="4" y="6" width="11" height="15" rx="2" fill="none" stroke="currentColor" stroke-width="2.2" transform="rotate(-8 9.5 13.5)"/><rect x="10" y="4" width="11" height="15" rx="2" fill="none" stroke="currentColor" stroke-width="2.2" transform="rotate(8 15.5 11.5)"/>',
  nominas: '<rect x="3" y="6" width="18" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="12" cy="12" r="2.8" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M6 9.5h.01M18 14.5h.01" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>',
  vida: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linejoin="round"/>',
  caos: '<path d="M12 12m-1 0a1 1 0 1 0 2 0 3 3 0 1 0-6 0 5 5 0 1 0 10 0 7 7 0 1 0-14 0 9 9 0 1 0 18 0" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
  reloj: '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2.3"/><path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/>',
  info: '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2.3"/><path d="M12 11v5M12 8v.5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>',
  atras: '<path d="M14 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>',
  salto: '<path d="M5 18c2-6 5-9 7-9s5 3 7 9M12 9V4M9 6l3-3 3 3" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>',
  merienda: '<path d="M4 11h16l-1.5 8h-13zM7 11c0-3 2-5 5-5s5 2 5 5" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linejoin="round"/>',
};
function dcSvg(nombre, cls) { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true'); s.setAttribute('class', 'dc-svg' + (cls ? ' ' + cls : '')); s.innerHTML = DC_SVG[nombre] || ''; return s; }
// El icono de un tipo de cita de la agenda.
const DC_ICONO_NODO = { facil: 'reunion', normal: 'reunion', elite: 'elite', minijefe: 'elite', jefe: 'jefe', correo: 'correo', pausa: 'pausa', economato: 'economato' };
