// Fans of Shelter · IMÁGENES Y PINCEL: todo el arte son PNG de img/, generados en Yoshi desde el boceto de Daniel (hojas de sprites por temas
// y texturas de suelo; herramientas/comfyui/shelter_piezas.py y shelter_wang.py). Aquí se cargan al arrancar y se pintan sin suavizar.
// Un sprite se pide con spr('nombre') y se pinta con pintaSpr(ctx, 'nombre', x, y, opciones). PALETA son los colores del marcador y los efectos.
'use strict';

const PALETA = {
  K: '#1a1226', W: '#ffffff', w: '#e4def0',                 // tinta y blancos
  Y: '#ffd23f', Y2: '#fff0a0', R: '#ff3b3b', O: '#ff8a1f',  // oro, rojo, naranja
  G: '#4cbf4a', g: '#2a8a35', H: '#86e05e',                             // verdes
  B: '#8b5a2b', b: '#5a3a1a', T: '#c89058', u: '#3a2410',   // maderas
  S: '#9aa0ad', s: '#5d6270', t: '#d3d7e0',                 // piedra
  M: '#5d3f8a', m: '#3a2660', v: '#8a66c0',                 // morados de la noche
  E: '#59c24a', F: '#ff5a1f', f: '#ffd166',                 // goblin y fuego
  Q: '#6ee7ff', N: '#2a2a3a',                               // cristal y gris oscuro
};

// los PNG de img/ que usa el juego (sin la extensión)
const IMG_LISTA = ['bunny_abajo', 'bunny_arriba', 'bunny_lado', 'zanahoria', 'zanahoria_fuego', 'orbe', 'fuego_bola', 'cristal',
  'goblin', 'esqueleto', 'murci', 'jefe', 'arbol', 'pino', 'tocon', 'roca', 'mena',
  'mesa', 'hoguera', 'cofre', 'cofre_abierto', 'bloque', 'interruptor', 'interruptor_on', 'puerta', 'trampa', 'torreta',
  'refugio_1', 'refugio_2', 'refugio_3', 'refugio_4', 'refugio_5',
  'ico_madera', 'ico_piedra', 'ico_hierro', 'ico_cristal', 'ico_corazon', 'ico_corazon_vacio',
  'wang_hierba', 'wang_tierra', 'wang_agua', 'wang_mascaras'];
// los fotogramas que el juego pide y que comparten imagen (la animación de andar es un bote; el fuego, partículas)
const IMG_ALIAS = { bunny_abajo_0: 'bunny_abajo', bunny_abajo_1: 'bunny_abajo', bunny_arriba_0: 'bunny_arriba', bunny_arriba_1: 'bunny_arriba',
  bunny_lado_0: 'bunny_lado', bunny_lado_1: 'bunny_lado', goblin_0: 'goblin', goblin_1: 'goblin', esqueleto_0: 'esqueleto', esqueleto_1: 'esqueleto',
  murci_0: 'murci', murci_1: 'murci', jefe_0: 'jefe', jefe_1: 'jefe', hoguera_0: 'hoguera', hoguera_1: 'hoguera',
  cofre_0: 'cofre', cofre_1: 'cofre_abierto', interruptor_0: 'interruptor', interruptor_1: 'interruptor_on' };

const IMG = {};
function cargaImagenes() {
  return Promise.all(IMG_LISTA.map(n => new Promise(res => {
    const im = new Image();
    im.onload = () => { IMG[n] = im; res(); };
    im.onerror = () => { console.error('Falta la imagen img/' + n + '.png'); res(); };
    im.src = 'img/' + n + '.png?v=' + NUCLEO.version;
  })));
}
const imagenDe = nombre => IMG[IMG_ALIAS[nombre] || nombre] || null;
const hayImagen = nombre => !!imagenDe(nombre);

// el lienzo del sprite (se prepara la primera vez). espejo: volteado
const SPR_CACHE = new Map();
function spr(nombre, espejo) {
  const clave = nombre + (espejo ? '|e' : '');
  let c = SPR_CACHE.get(clave);
  if (c) return c;
  const im = imagenDe(nombre);
  if (!im) return null;
  c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  if (espejo) { g.translate(im.width, 0); g.scale(-1, 1); }
  g.drawImage(im, 0, 0);
  SPR_CACHE.set(clave, c);
  return c;
}

// pinta el sprite con su esquina de arriba a la izquierda en (x, y), en píxeles enteros.
// o.espejo: mirando al otro lado · o.blanco: todo blanco (destello de golpe) · o.alpha: transparencia · o.ancla: 'pies' o 'centro'
function pintaSpr(ctx, nombre, x, y, o = {}) {
  const c = spr(nombre, o.espejo); if (!c) return;
  if (o.ancla === 'pies') { x -= c.width / 2; y -= c.height; }
  else if (o.ancla === 'centro') { x -= c.width / 2; y -= c.height / 2; }
  x = Math.round(x); y = Math.round(y);
  if (o.alpha !== undefined) { ctx.save(); ctx.globalAlpha = o.alpha; }
  ctx.drawImage(o.blanco ? sprBlanco(c, nombre + (o.espejo ? '|e' : '')) : c, x, y);
  if (o.alpha !== undefined) ctx.restore();
}

// la silueta blanca del sprite (cuando algo recibe un golpe, o CrazyBunny detrás de un árbol)
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
function cajaMarco(ctx, x, y, w, h, fondo, borde = PALETA.K) { caja(ctx, x, y, w, h, borde); caja(ctx, x + 1, y + 1, w - 2, h - 2, fondo); }
// número «al azar» de 0 a 1, siempre el mismo para la misma semilla (para que el suelo no cambie)
function hash(n) {
  n = Math.imul((n | 0) ^ 0x9e3779b9, 0x85ebca6b); n ^= n >>> 13;
  n = Math.imul(n, 0xc2b2ae35); n ^= n >>> 16;
  return (n >>> 0) / 4294967296;
}
const hash2 = (x, y, s = 0) => hash(Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1274126177));
// (rand, pick, clamp, lerp y dist vienen de core/js/sistema/utiles.js)
