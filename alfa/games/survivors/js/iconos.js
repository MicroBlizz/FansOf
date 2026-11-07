// Fans of Survivors · Iconos dibujados (pintados por Yoshi): sustituyen a los emojis en armas, mejoras, efectos, cofres y botones.
// Cada icono es img/iconos/<id>.png; los pide herramientas/comfyui/survivors/pedidos.py. Mientras uno no exista, se dibuja una bolita de color.
'use strict';

const ICONO = (() => {
  const RUTA = 'img/iconos/', cache = new Map();
  // la imagen de un icono (se carga una vez y se reutiliza)
  function imagen(id) {
    let im = cache.get(id);
    if (!im) { im = new Image(); im.decoding = 'async'; im.src = RUTA + id + '.png'; cache.set(id, im); }
    return im;
  }
  const lista = im => im.complete && im.naturalWidth > 0;
  // dibuja el icono en el canvas, centrado en (x, y), de lado `tam`; si aún no está, una bolita del color `col`
  function dibuja(c, id, x, y, tam, ang = 0, espejo = 1, col = '#ffcb3d') {
    if (!id) return;
    const im = imagen(id);
    c.save(); c.translate(x, y); if (ang) c.rotate(ang); if (espejo < 0) c.scale(-1, 1);
    if (lista(im)) c.drawImage(im, -tam / 2, -tam / 2, tam, tam);
    else { c.fillStyle = col; c.strokeStyle = '#20102c'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, tam * 0.3, 0, Math.PI * 2); c.fill(); c.stroke(); }
    c.restore();
  }
  // un <img> para la interfaz (cartas, cofres, botones)
  function elemento(id, clase = 'ico') {
    const e = document.createElement('img'); e.className = clase; e.alt = ''; e.draggable = false; e.src = RUTA + id + '.png'; return e;
  }
  const html = (id, clase = 'ico') => `<img class="${clase}" src="${RUTA}${id}.png" alt="" draggable="false">`;
  return Object.freeze({ dibuja, elemento, html, imagen });
})();
