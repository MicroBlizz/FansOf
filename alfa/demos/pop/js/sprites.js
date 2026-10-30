// Fans of Pop · SPRITES: carga el pixel art de Yoshi (img/*.png, reducido a píxeles gordos con herramientas/comfyui/pop/preparar.py)
// y lo dibuja a escala entera y sin suavizar. Si un dibujo aún no está, el juego pinta su versión de repuesto (ver pintar.js):
// los slimes se pintan como gelatinas de su color con ojos, así el prototipo se puede probar sin esperar a Yoshi.
'use strict';
const PP_IMG = {};
const PP_LISTA_IMG = [...PP_SLIME_IDS.map(k => 'sl-' + k), 'fondo-jardin', 'fondo-jefe', 'tablero', 'n-sala', 'n-elite', 'n-descanso', 'n-jefe', 'i-vida', 'i-mov', 'i-estrella',
  ...['rosa', 'melocoton', 'amarillo', 'menta', 'cielo', 'lila'].flatMap(k => ['b-' + k + '-arriba', 'b-' + k + '-abajo'])];
function ppCargaImagenes() {
  for (const k of PP_LISTA_IMG) {
    const im = new Image();
    im.onload = () => { PP_IMG[k] = im; };
    im.src = 'img/' + k + '.png?v=' + (typeof VERSION !== 'undefined' ? VERSION : '0');
  }
}
const ppTieneImg = k => !!PP_IMG[k];
// dibuja un sprite con su esquina (x, y) a escala entera s. Devuelve [ancho, alto] dibujados, o null si no está.
function ppDibuja(c, k, x, y, s = 4) {
  const im = PP_IMG[k]; if (!im) return null;
  const w = im.width * s, h = im.height * s;
  c.imageSmoothingEnabled = false;
  c.drawImage(im, Math.round(x), Math.round(y), w, h);
  return [w, h];
}
// centrado en (cx, cy), ajustado a que quepa en `lado` píxeles (escala entera si es posible)
function ppDibujaEn(c, k, cx, cy, lado, exacto = false) {
  const im = PP_IMG[k]; if (!im) return null;
  let s = lado / Math.max(im.width, im.height); if (s >= 2 && !exacto) s = Math.floor(s);   // entero si cabe x2 o más; si no, el tamaño que toque
  return ppDibuja(c, k, cx - im.width * s / 2, cy - im.height * s / 2, s);
}
// un sprite en un lienzo pequeño (para las ventanas en HTML)
function ppMiniatura(k, lado = 72) {
  const cv = document.createElement('canvas');
  cv.width = lado; cv.height = lado; cv.style.width = lado + 'px'; cv.style.height = lado + 'px'; cv.style.imageRendering = 'pixelated';
  const c = cv.getContext('2d');
  if (!ppDibujaEn(c, k, lado / 2, lado / 2, lado) && k.startsWith('sl-')) ppSlimeRepuesto(c, k.slice(3), lado / 2, lado / 2, lado * 0.42, 0, 1);
  return cv;
}
