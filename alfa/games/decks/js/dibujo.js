// Fans Of Decks · Dibujo: los personajes de la serie en miniatura (drawVector, de core) y los iconos de las tácticas, en lienzos pequeños con caché.
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
// El icono de una táctica sin dibujo propio: dos letras sobre un redondel del color de la rareza.
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
