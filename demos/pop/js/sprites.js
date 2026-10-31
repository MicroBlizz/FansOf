// Fans of Pop · SPRITES: carga el pixel art de Yoshi (img/*.png, reducido a píxeles gordos con herramientas/comfyui/pop/preparar.py)
// y lo dibuja a escala entera y sin suavizar. Si un dibujo aún no está, el juego pinta su versión de repuesto (ver pintar.js):
// los slimes se pintan como gelatinas de su color con ojos, así el prototipo se puede probar sin esperar a Yoshi.
'use strict';
const PP_IMG = {};
// ESTILO (Daniel, 30-10-2026): opción «PIXEL ART: SÍ/NO» en la portada y la pausa (SAVE.pixel). Sin pixel art (lo normal) los
// dibujos salen de img-liso/ en grande y se pintan suaves; con pixel art, de img/ (reducidos a píxeles gordos) y sin suavizar.
let PP_LISO = !SAVE.pixel;
function ppCambiaEstilo() {
  SAVE.pixel = !SAVE.pixel; ppGuarda(); PP_LISO = !SAVE.pixel;
  for (const k of Object.keys(PP_IMG)) delete PP_IMG[k];   // mientras llegan los otros dibujos se ve el repuesto un instante
  ppCargaImagenes();
}
const ppTextoEstilo = () => (SAVE.pixel ? tr('PIXEL ART: SÍ') : tr('PIXEL ART: NO'));
const PP_FLOTANTES = ['unicornio', 'arcoiris', 'capibara', 'gatito', 'conejito', 'osito', 'pato', 'piruleta', 'caramelo', 'cupcake', 'donut', 'nube', 'corazon', 'helado'].map(k => 'f-' + k);
const PP_LISTA_IMG = [...PP_FLOTANTES, ...PP_SLIME_IDS.map(k => 'sl-' + k), 'fondo-jardin', 'fondo-pasteleria', 'fondo-heladeria', 'fondo-playa', 'fondo-feria', 'fondo-nubes', 'fondo-jefe', 'tablero', 'i-copo', 'i-concha', 'i-cereza', 'i-martillo', 'i-bomba', 'i-toques3', 'i-deshacer', 'i-pista', 'i-hucha', 'i-infinito', 'i-pase', 'i-racha', 'i-regalo', 'i-vida', 'i-mano', 'i-estrella', 'i-moneda', 'i-cofre', 'i-perla', 'i-perlas', 'logo-pop',
  ...['rosa', 'melocoton', 'amarillo', 'menta', 'cielo', 'lila'].flatMap(k => ['b-' + k + '-arriba', 'b-' + k + '-abajo', 'b-' + k + '-doble'])];
// devuelve una promesa que se cumple cuando han llegado todos (o han fallado): la portada no se enseña hasta entonces, para que no se
// vean un momento los dibujos de repuesto del primer boceto (Daniel, 31-10-2026)
function ppCargaImagenes() {
  let faltan = PP_LISTA_IMG.length, listo;
  const promesa = new Promise(ok => { listo = ok; });
  const una = () => { if (--faltan <= 0) listo(); };
  for (const k of PP_LISTA_IMG) {
    const im = new Image();
    const liso = PP_LISO;
    im.onload = () => { if (liso === PP_LISO) PP_IMG[k] = /^b-.*-abajo$/.test(k) && !liso ? ppHundida(im) : im; una(); };   // las lisas ya vienen hundidas (preparar_liso.py)
    im.onerror = una;
    im.src = (PP_LISO ? 'img-liso/' : 'img/') + k + '.png?v=' + (typeof VERSION !== 'undefined' ? VERSION : '0');
  }
  return promesa;
}
// la burbuja reventada tiene que verse HUNDIDA de un vistazo (si no, un niño no distingue cuáles faltan): se oscurece entera
// y lleva una sombra por dentro arriba a la izquierda y luz abajo a la derecha, como un hueco en la silicona
function ppHundida(im) {
  const cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height;
  const c = cv.getContext('2d'), w = im.width, h = im.height; c.imageSmoothingEnabled = false;
  c.drawImage(im, 0, 0);
  c.globalCompositeOperation = 'source-atop';
  c.fillStyle = 'rgba(90, 30, 90, 0.28)'; c.fillRect(0, 0, w, h);
  const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, 'rgba(60, 10, 60, 0.55)'); g.addColorStop(0.55, 'rgba(60, 10, 60, 0)'); g.addColorStop(1, 'rgba(255, 255, 255, 0.35)');
  c.fillStyle = g; c.beginPath(); c.arc(w / 2, h / 2, w * 0.36, 0, Math.PI * 2); c.fill();
  return cv;
}
const ppTieneImg = k => !!PP_IMG[k];
// dibuja un sprite con su esquina (x, y) a escala entera s. Devuelve [ancho, alto] dibujados, o null si no está.
function ppDibuja(c, k, x, y, s = 4) {
  const im = PP_IMG[k]; if (!im) return null;
  const w = im.width * s, h = im.height * s;
  c.imageSmoothingEnabled = PP_LISO; if (PP_LISO) c.imageSmoothingQuality = 'high';
  c.drawImage(im, Math.round(x), Math.round(y), w, h);
  return [w, h];
}
// centrado en (cx, cy), ajustado a que quepa en `lado` píxeles (escala entera si es posible)
function ppDibujaEn(c, k, cx, cy, lado, exacto = false) {
  const im = PP_IMG[k]; if (!im) return null;
  let s = lado / Math.max(im.width, im.height); if (s >= 2 && !exacto && !PP_LISO) s = Math.floor(s);   // entero si cabe x2 o más; si no, el tamaño que toque
  return ppDibuja(c, k, cx - im.width * s / 2, cy - im.height * s / 2, s);
}
// un sprite en un lienzo pequeño (para las ventanas en HTML)
function ppMiniatura(k, lado = 72) {
  const cv = document.createElement('canvas');
  cv.width = lado; cv.height = lado; cv.style.width = lado + 'px'; cv.style.height = lado + 'px'; cv.style.imageRendering = PP_LISO ? 'auto' : 'pixelated';
  const c = cv.getContext('2d');
  if (!ppDibujaEn(c, k, lado / 2, lado / 2, lado) && k.startsWith('sl-')) ppSlimeRepuesto(c, k.slice(3), lado / 2, lado / 2, lado * 0.42, 0, 1);
  return cv;
}
