// Fans of Swipe · SPRITES: carga el pixel art (pintado en Yoshi y reducido a píxeles gordos con
// herramientas/comfyui/swipe/preparar.py) y lo dibuja siempre a escala entera y sin suavizar, para que el píxel se vea limpio.
// Si un dibujo aún no está, se pinta un hueco discreto en su sitio y el juego sigue siendo jugable.
'use strict';
const SW_IMG = {};
// qué marco lleva cada tipo de carta (img/carta-<marco>.png)
const SW_MARCO = { accion: 'combate', evento: 'evento', tienda: 'tienda', descanso: 'descanso', reliquia: 'reliquia', inicio: 'reliquia', premio: 'nueva', botin: 'botin', cruce: 'camino', piso: 'camino', liberada: 'reliquia' };
const SW_MARCOS_TODOS = [...new Set(Object.values(SW_MARCO))].map(m => 'carta-' + m);
const SW_LISTA_IMG = [
  'manos', 'carta', ...Object.values(SW_MARCOS_TODOS), 'fondo-vestibulo', 'fondo-oficinas', 'fondo-servidores', 'fondo-azotea', 'fondo-tiendas', 'fondo-lan', 'fondo-estudios', 'fondo-sede', 'n-jefe2',
  ...Object.keys(SW_ENEMIGOS),
  ...SW_EVENTOS.map(e => e.arte), 'ev-descanso', 'ev-tienda', 'ev-tesoro', 'ev-cruce',
  ...Object.values(SW_NODOS).map(n => n.icono),
  'a-golpe', 'a-escudo', 'a-cura', 'a-caos', 'a-salto', 'a-fuego', 'a-veneno', 'a-hielo',
  'i-vida', 'i-oro', 'i-caos', 'i-escudo', 'i-espada', 'i-flecha',
  ...Object.keys(SW_RELIQUIAS),
];
function swCargaImagenes() {
  for (const k of new Set(SW_LISTA_IMG)) {
    const im = new Image();
    im.onload = () => { SW_IMG[k] = im; };
    im.src = 'img/' + k + '.png?v=' + (typeof VERSION !== 'undefined' ? VERSION : '0');
  }
}
const swTiene = k => !!SW_IMG[k];
// dibuja un sprite con su esquina (x, y) a escala entera s. Devuelve [ancho, alto] dibujados.
function swDibuja(c, k, x, y, s = 4, voltea = false) {
  const im = SW_IMG[k];
  if (!im) return swHueco(c, x, y, 16 * s, 16 * s, s);
  const w = im.width * s, h = im.height * s;
  c.imageSmoothingEnabled = false;
  if (voltea) { c.save(); c.translate(Math.round(x + w), Math.round(y)); c.scale(-1, 1); c.drawImage(im, 0, 0, w, h); c.restore(); }
  else c.drawImage(im, Math.round(x), Math.round(y), w, h);
  return [w, h];
}
// centrado en (cx, cy)
function swDibujaC(c, k, cx, cy, s = 4, voltea = false) {
  const im = SW_IMG[k]; const w = (im ? im.width : 16) * s, h = (im ? im.height : 16) * s;
  swDibuja(c, k, cx - w / 2, cy - h / 2, s, voltea);
  return [w, h];
}
// apoyado sobre (cx, base)
function swDibujaPie(c, k, cx, base, s = 4) {
  const im = SW_IMG[k]; const w = (im ? im.width : 16) * s, h = (im ? im.height : 20) * s;
  swDibuja(c, k, cx - w / 2, base - h, s);
  return [w, h];
}
function swTam(k, s = 1) { const im = SW_IMG[k]; return im ? [im.width * s, im.height * s] : [16 * s, 16 * s]; }
// el hueco mientras llega el dibujo: un recuadro de píxeles a cuadros, sin pretender ser el dibujo
function swHueco(c, x, y, w, h, s) {
  c.save(); c.globalAlpha = 0.35;
  for (let j = 0; j < h; j += s * 2) for (let i = 0; i < w; i += s * 2) { c.fillStyle = ((i + j) / (s * 2)) % 2 ? '#1b1030' : '#3a2a55'; c.fillRect(x + i, y + j, s * 2, s * 2); }
  c.restore();
  return [w, h];
}
// un sprite en un lienzo pequeño (para las ventanas en HTML: reliquias, cartas)
function swMiniatura(k, s = 3) {
  const [w, h] = swTam(k, s), cv = document.createElement('canvas');
  cv.width = w; cv.height = h; cv.style.width = w + 'px'; cv.style.height = h + 'px'; cv.style.imageRendering = 'pixelated';
  swDibuja(cv.getContext('2d'), k, 0, 0, s);
  return cv;
}
