// Fans of Panic · Sprites: todos los dibujos del juego los pinta Yoshi (/encolar-recurso, pedidos en herramientas/comfyui/panic/)
// y viven en img/<nombre>.png con el fondo ya quitado. Aquí se cargan y se pintan centrados; mientras uno no exista, se pinta un
// disco liso del color que toque (solo para poder jugar: no es arte del juego).
'use strict';

const SPR = { cache: {} };

function sprite(nombre) {
  if (!(nombre in SPR.cache)) {
    const im = new Image(); SPR.cache[nombre] = null;
    im.onload = () => { SPR.cache[nombre] = im; };
    im.src = `img/${nombre}.png?v=1`;
  }
  return SPR.cache[nombre];
}

// pinta el sprite centrado en (x, y) con `alto` de alto (el ancho sigue la proporción), girado `rot` radianes;
// si no está, un disco del color `col` con una letra encima. Devuelve si había sprite.
function pintaSprite(nombre, x, y, alto, rot = 0, col = COL.gris, letraProv = '') {
  const im = sprite(nombre);
  G.save(); G.translate(x, y); G.rotate(rot);
  if (im) G.drawImage(im, -alto * im.width / im.height / 2, -alto / 2, alto * im.width / im.height, alto);
  else { circulo(0, 0, alto / 2, col, COL.tinta, 2); if (letraProv) letra(letraProv, 0, 1, alto * 0.5, COL.tinta, 'center', null, 0); }
  G.restore();
  return !!im;
}

// las que conviene tener cargadas antes de empezar un nivel
function precargaSprites() {
  for (const n of ['cuter', 'becario', 'cangrejo', 'fotocopiadora', 'flamenco', 'mancuerna', 'dragon', 'kraken', 'hijo', 'lola',
    'obj-hielo', 'obj-escudo', 'obj-tijera', 'obj-bomba', 'obj-fantasma', 'obj-iman', 'obj-doble', 'obj-lola', 'obj-locura',
    'corazon', 'ficha', 'estrella', 'anuncio']) sprite(n);
}
