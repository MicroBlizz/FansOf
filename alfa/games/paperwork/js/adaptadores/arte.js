// Fans Of Paperwork · adaptador · ARTE: las imágenes del juego (img/), hechas en Yoshi: los bloques de cada material, el fondo de cada zona, la
// Trituradora y los iconos. Se piden al arrancar; mientras no han llegado (o si falta alguna) se devuelve null y la escena dibuja su repuesto.
// Los personajes no son imágenes: son los dibujos de core (ART, core/js/serie/arte), con personaje(ctx, clave, x, y, escala).
'use strict';
PW.arte = (() => {
  const cache = {};
  function img(ruta) {
    if (cache[ruta] !== undefined) return cache[ruta] && cache[ruta].complete && cache[ruta].naturalWidth ? cache[ruta] : null;
    const im = new Image();
    im.onerror = () => { cache[ruta] = false; };
    im.src = ruta;
    cache[ruta] = im;
    return null;
  }
  const bloque = m => img(`img/bloque-${PW.MATERIALES[m].id}.png`);
  const fondo = z => img(`img/fondo-${PW.ZONAS[z].fondo}.jpg`);
  const trituradora = () => img('img/trituradora.png');
  const icono = id => img(`img/icono-${id}.png`);
  // un personaje de la serie dibujado con su contorno, con los pies en (x, y)
  function personaje(ctx, clave, x, y, escala, giro = 0) {
    if (typeof ART === 'undefined' || !ART[clave]) return false;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(giro);
    ctx.scale(escala, escala);
    ctx.lineJoin = 'round';
    ART[clave](ctx);
    ctx.restore();
    return true;
  }
  // pide todo lo fijo de una vez, para que esté al empezar a jugar
  function precarga() {
    PW.MATERIALES.forEach((m, i) => bloque(i));
    PW.ZONAS.forEach((z, i) => fondo(i));
    trituradora();
  }
  return { bloque, fondo, trituradora, icono, personaje, precarga };
})();
