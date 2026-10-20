// Fans of Karts · LA LETRA DEL JUEGO: la de los botones de Fans of Rumble (Luckiest Guy, gorda y con contorno) para títulos, cifras y
// etiquetas, y Baloo 2 para las frases largas (escribeLineas). Se pinta en el lienzo grande de los menús (suelo.js), así se ve nítida.
// La letra de píxeles de antes (letras.js: escribePx, miniPx) queda para lo que es dibujo del mundo: las letras amarillas de KARTS,
// los carteles de las pistas y las fotos de la tienda (conLetraPixel). Las coordenadas son las de siempre (240 × 160) y (x, y) sigue
// siendo arriba a la izquierda de las mayúsculas, así no cambia nada de dónde va cada texto.
'use strict';

let LETRA_NUEVA = true, LETRA_CUERPO = false;
// pinta con la letra de píxeles lo que haga f (carteles, fotos, el título)
function conLetraPixel(f) { const a = LETRA_NUEVA; LETRA_NUEVA = false; try { return f(); } finally { LETRA_NUEVA = a; } }
const FAM_TITULO = '"Luckiest Guy", "Arial Black", Impact, sans-serif', FAM_CUERPO = '"Baloo 2", "Trebuchet MS", sans-serif';
// tamaño de la letra para que sus mayúsculas midan lo mismo que las de píxeles (7 de alto la normal, 5 la pequeña)
const tamLetra = (esc, cuerpo) => (cuerpo ? 10.6 : 9.4) * esc;
const TAM_MINI = 7.2;
const fuenteDe = (px, cuerpo) => (cuerpo ? '800 ' : '400 ') + px.toFixed(2) + 'px ' + (cuerpo ? FAM_CUERPO : FAM_TITULO);
const [, MEDIDOR] = lienzo(4, 4);
function midePx(t, px, cuerpo) { MEDIDOR.font = fuenteDe(px, cuerpo); return MEDIDOR.measureText(t).width; }

function anchoTexto(t, esc = 1) { return LETRA_NUEVA ? midePx(String(t), tamLetra(esc, LETRA_CUERPO), LETRA_CUERPO) : anchoTextoPx(t, esc); }
function anchoMini(t) { return LETRA_NUEVA ? midePx(String(t).toUpperCase(), TAM_MINI, false) : anchoMiniPx(t); }

// una línea de texto: contorno (borde) o sombra abajo a la derecha, y el color encima
function pintaLetra(ctx, t, x, y, px, cap, color, sombra, borde, al, cuerpo) {
  ctx.save();
  ctx.font = fuenteDe(px, cuerpo); ctx.textBaseline = 'alphabetic'; ctx.textAlign = al === 'der' ? 'right' : al === 'centro' ? 'center' : 'left';
  ctx.lineJoin = 'round'; ctx.miterLimit = 2;
  const by = y + cap;
  if (borde) { ctx.strokeStyle = borde; ctx.lineWidth = Math.max(1.2, px * 0.2); ctx.strokeText(t, x, by); }
  else if (sombra) {
    const d = Math.max(0.6, px * 0.09);
    ctx.fillStyle = sombra; ctx.fillText(t, x + d, by + d);
    ctx.strokeStyle = sombra; ctx.lineWidth = Math.max(0.8, px * 0.12); ctx.strokeText(t, x, by);
  }
  ctx.fillStyle = color; ctx.fillText(t, x, by);
  ctx.restore();
}
function escribe(ctx, t, x, y, color = '#ffffff', sombra = '#1c1028', al = 'izq', esc = 1, borde = null) {
  if (!LETRA_NUEVA) { escribePx(ctx, t, x, y, color, sombra, al, esc, borde); return; }
  const px = tamLetra(esc, LETRA_CUERPO);
  pintaLetra(ctx, String(t), x, y, px, 7 * esc, color, sombra, borde, al, LETRA_CUERPO);
}
// la pequeña (etiquetas y cifras): siempre en mayúsculas, como antes
function mini(ctx, t, x, y, color = '#ffffff', sombra = null, al = 'izq') {
  if (!LETRA_NUEVA) { miniPx(ctx, t, x, y, color, sombra, al); return; }
  pintaLetra(ctx, String(t).toUpperCase(), x, y, TAM_MINI, 5, color, sombra, null, al, false);
}
