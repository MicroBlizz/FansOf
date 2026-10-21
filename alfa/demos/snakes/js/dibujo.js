// Fans of Snakes · Dibujo: ayudas para pintar en el canvas (cajas redondeadas, letra con borde, botones).
// G es el pincel (lo crea js/principal.js). Todo se mide en el mundo de 200 de ancho.
'use strict';

let G = null;

// caja redondeada; fill o stroke pueden ser null
function caja(x, y, w, h, r, fill, stroke, lw = 1.5) {
  G.beginPath();
  G.moveTo(x + r, y); G.arcTo(x + w, y, x + w, y + h, r); G.arcTo(x + w, y + h, x, y + h, r);
  G.arcTo(x, y + h, x, y, r); G.arcTo(x, y, x + w, y, r); G.closePath();
  if (fill) { G.fillStyle = fill; G.fill(); }
  if (stroke) { G.strokeStyle = stroke; G.lineWidth = lw; G.stroke(); }
}

// letra con borde (Baloo 2); alin: 'left' | 'center' | 'right'
function letra(txt, x, y, tam, color = '#fff', alin = 'center', borde = '#06110a', lw = 3, peso = 800) {
  G.font = `${peso} ${tam}px "Baloo 2", system-ui, sans-serif`;
  G.textAlign = alin; G.textBaseline = 'middle'; G.lineJoin = 'round';
  if (borde && lw > 0) { G.lineWidth = lw; G.strokeStyle = borde; G.strokeText(txt, x, y); }
  G.fillStyle = color; G.fillText(txt, x, y);
}

// letra sin borde y en monoespaciada: para el marcador y el modo retro
function letraMono(txt, x, y, tam, color, alin = 'center', peso = 700) {
  G.font = `${peso} ${tam}px ui-monospace, Menlo, Consolas, monospace`;
  G.textAlign = alin; G.textBaseline = 'middle';
  G.fillStyle = color; G.fillText(txt, x, y);
}

// un botón grande con su sombra; devuelve su rectángulo para el dedo
function boton(txt, x, y, w, h, col = '#3ddc84', colTxt = '#06110a') {
  caja(x, y + 3, w, h, 8, '#06110a', null);
  caja(x, y, w, h, 8, col, '#06110a', 2);
  letra(txt, x + w / 2, y + h / 2 + 1, 13, colTxt, 'center', null, 0);
  return { x, y, w, h };
}

const dentro = (r, px, py) => r && px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;

// un círculo (manzana, moneda…)
function circulo(x, y, r, fill, stroke, lw = 1.5) {
  G.beginPath(); G.arc(x, y, r, 0, Math.PI * 2);
  if (fill) { G.fillStyle = fill; G.fill(); }
  if (stroke) { G.strokeStyle = stroke; G.lineWidth = lw; G.stroke(); }
}

// el tono del arcoíris del Frenesí, según el segmento y el tiempo
const arcoiris = (i, t, l = 55) => `hsl(${(i * 18 + t * 240) % 360} 95% ${l}%)`;
