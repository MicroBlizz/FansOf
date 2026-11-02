// Fans of Shelter · PINCEL DE PÍXELES: cada sprite se escribe como filas de letras (una letra = un color de la paleta, '.' = nada)
// y se pinta una sola vez en un lienzo pequeño; después se copia tal cual, sin suavizar, como un cartucho de 16 bits.
// Un sprite se pide con spr('nombre') y se pinta con pintaSpr(ctx, 'nombre', x, y, opciones).
'use strict';

// la paleta de la demo (16-bit: pocos colores, bien separados). Cada letra es un color.
const PALETA = {
  K: '#1a1226',   // tinta: el contorno de todo
  W: '#ffffff', w: '#e4def0', x: '#c3bbd6', C: '#f5e6c8', c: '#dcc9a0',   // blancos (y sus dos sombras) y crema (CrazyBunny)
  P: '#ff8fc0', p: '#ffc3dc', p2: '#e0609a',  // rosa (oreja, colorete) y su sombra
  V: '#8a2bff',                               // violeta del ojo en espiral
  Y: '#ffd23f', y: '#c7901a', Y2: '#fff0a0', R: '#ff3b3b', r: '#ff9a9a',   // oro de la corona (sombra, luz) y la piedra roja
  O: '#ff8a1f', o: '#c75a0a', L: '#ffb866',   // zanahoria: naranja, naranja oscuro, luz
  G: '#4cbf4a', g: '#2a8a35', H: '#86e05e', H2: '#c8ff9a', G2: '#3aa33f',   // verdes: hierba, hoja oscura, hoja clara, brillo, hierba oscura
  B: '#8b5a2b', b: '#5a3a1a', T: '#c89058', u: '#3a2410',   // maderas y tierra
  S: '#9aa0ad', s: '#5d6270', t: '#d3d7e0',   // piedra: base, sombra, luz
  I: '#e0b86a', i: '#8c7030',                 // mena de hierro (vetas)
  A: '#3d7bd6', a: '#2558a8', Z: '#8fc4ff',   // agua
  M: '#5d3f8a', m: '#3a2660', v: '#8a66c0',   // morados de la noche y de los murciélagos
  E: '#59c24a', e: '#2b7a27', E2: '#9cf07a',  // verde goblin
  F: '#ff5a1f', f: '#ffd166',                 // fuego
  Q: '#6ee7ff', q: '#1fa3c7',                 // cristal de experiencia, orbe
  N: '#2a2a3a', n: '#4a4a5e',                 // grises oscuros (hueso sombra, hierro)
  D: '#8b1e3f',                               // rojo oscuro (boca, interruptor)
};
// las letras de dos caracteres (p2, Y2, H2, G2, E2) se escriben en los sprites con un solo símbolo:
const PALETA_ALIAS = { '2': 'p2', '3': 'Y2', '4': 'H2', '5': 'G2', '6': 'E2' };

const SPR_DEF = {};        // nombre → filas de texto
const SPR_CACHE = new Map();

// registra sprites: def('nombre', ['...filas...'])
function def(nombre, filas) { SPR_DEF[nombre] = filas; }

// EL ARTE DE YOSHI: los PNG de img/ (generados en ComfyUI y preparados con herramientas/comfyui/shelter_sprites.py) mandan sobre el
// dibujo por código. Se cargan todos al arrancar (cargaImagenes); un nombre con imagen usa la imagen, y si no la hay, sus filas de letras.
// Alias: un fotograma sin imagen propia toma la de otro (los dos pasos de andar comparten imagen: la animación la hace el juego).
const IMG = {};
const IMG_LISTA = ['bunny_abajo', 'bunny_abajo_1', 'bunny_arriba', 'bunny_lado', 'bunny_lado_1', 'zanahoria', 'zanahoria_fuego', 'orbe', 'cristal', 'goblin', 'esqueleto', 'murci', 'jefe',
  'mesa', 'hoguera', 'cofre', 'cofre_abierto', 'bloque', 'interruptor', 'interruptor_on', 'puerta', 'trampa', 'torreta', 'arbol', 'tocon', 'roca', 'mena',
  'ico_madera', 'ico_piedra', 'ico_hierro', 'ico_corazon', 'suelo_hierba', 'suelo_tierra', 'suelo_agua', 'suelo_roca', 'escena', 'refugio_2', 'refugio_3', 'refugio_4', 'refugio_5'];
const IMG_ALIAS = { bunny_abajo_0: 'bunny_abajo', bunny_arriba_0: 'bunny_arriba', bunny_arriba_1: 'bunny_arriba', bunny_lado_0: 'bunny_lado', goblin_0: 'goblin', goblin_1: 'goblin', esqueleto_0: 'esqueleto', esqueleto_1: 'esqueleto',
  murci_0: 'murci', murci_1: 'murci', jefe_0: 'jefe', jefe_1: 'jefe', hoguera_0: 'hoguera', hoguera_1: 'hoguera', cofre_0: 'cofre', cofre_1: 'cofre_abierto',
  interruptor_0: 'interruptor', interruptor_1: 'interruptor_on', fuego_bola: 'orbe' };
function cargaImagenes() {
  return Promise.all(IMG_LISTA.map(n => new Promise(res => {
    const im = new Image();
    im.onload = () => { IMG[n] = im; res(); };
    im.onerror = () => res();   // sin imagen: se dibuja por código
    im.src = 'img/' + n + '.png?v=' + (NUCLEO.version || '0');
  })));
}
const hayImagen = nombre => !!IMG[IMG_ALIAS[nombre] || nombre];
// un fotograma de andar sin imagen propia: la del paso 0 (el bote lo pone el juego)
function imagenDe(nombre) { return IMG[IMG_ALIAS[nombre] || nombre] || (/_1$/.test(nombre) ? IMG[IMG_ALIAS[nombre.replace(/_1$/, '_0')] || nombre.replace(/_1$/, '')] : null); }

// el lienzo del sprite (pintado la primera vez). espejo: volteado horizontalmente
function spr(nombre, espejo) {
  const clave = nombre + (espejo ? '|e' : '');
  let c = SPR_CACHE.get(clave);
  if (c) return c;
  const im = imagenDe(nombre);
  if (im) {
    c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
    const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
    if (espejo) { g.translate(im.width, 0); g.scale(-1, 1); }
    g.drawImage(im, 0, 0);
    SPR_CACHE.set(clave, c);
    return c;
  }
  const filas = SPR_DEF[nombre];
  if (!filas) { console.error('Sprite sin definir: ' + nombre); return null; }
  const h = filas.length, w = Math.max(...filas.map(f => f.length));
  c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  for (let j = 0; j < h; j++) for (let i = 0; i < filas[j].length; i++) {
    const ch = filas[j][i]; if (ch === '.' || ch === ' ') continue;
    g.fillStyle = PALETA[PALETA_ALIAS[ch] || ch] || '#ff00ff';
    g.fillRect(espejo ? w - 1 - i : i, j, 1, 1);
  }
  SPR_CACHE.set(clave, c);
  return c;
}

// pinta el sprite con su esquina de arriba a la izquierda en (x, y), en píxeles enteros.
// o.espejo: mirando al otro lado · o.blanco: todo blanco (destello de golpe) · o.alpha: transparencia · o.ancla: 'pies' (x, y = centro de los pies)
function pintaSpr(ctx, nombre, x, y, o = {}) {
  const c = spr(nombre, o.espejo); if (!c) return;
  if (o.ancla === 'pies') { x -= c.width / 2; y -= c.height; }
  else if (o.ancla === 'centro') { x -= c.width / 2; y -= c.height / 2; }
  x = Math.round(x); y = Math.round(y);
  if (o.alpha !== undefined) { ctx.save(); ctx.globalAlpha = o.alpha; }
  if (o.blanco) ctx.drawImage(sprBlanco(c, nombre + (o.espejo ? '|e' : '')), x, y);
  else ctx.drawImage(c, x, y);
  if (o.alpha !== undefined) ctx.restore();
}

// la silueta blanca del sprite (cuando algo recibe un golpe)
const BLANCO_CACHE = new Map();
function sprBlanco(c, clave) {
  let b = BLANCO_CACHE.get(clave); if (b) return b;
  b = document.createElement('canvas'); b.width = c.width; b.height = c.height;
  const g = b.getContext('2d');
  g.drawImage(c, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = '#ffffff'; g.fillRect(0, 0, b.width, b.height);
  BLANCO_CACHE.set(clave, b);
  return b;
}

// un rectángulo de píxeles enteros
function caja(ctx, x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
// caja con contorno de tinta (ventanas y botones)
function cajaMarco(ctx, x, y, w, h, fondo, borde = PALETA.K) {
  caja(ctx, x, y, w, h, borde); caja(ctx, x + 1, y + 1, w - 2, h - 2, fondo);
}
// número «al azar» de 0 a 1, siempre el mismo para la misma semilla (para que el decorado no cambie)
function hash(n) {
  n = Math.imul((n | 0) ^ 0x9e3779b9, 0x85ebca6b); n ^= n >>> 13;
  n = Math.imul(n, 0xc2b2ae35); n ^= n >>> 16;
  return (n >>> 0) / 4294967296;
}
const hash2 = (x, y, s = 0) => hash(Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1274126177));
// (rand, pick, clamp, lerp y dist vienen de core/js/sistema/utiles.js)
