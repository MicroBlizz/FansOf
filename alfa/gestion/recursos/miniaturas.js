// Fans Of · RECURSOS · miniatura de una tira de lonchas (galería local y pestaña Recursos de /gestion): en vez de la tira (una raya larga), la pila ya
// montada, girada un poco y ampliada un número entero de veces, pintada con LONCHAS (lonchas.js, aquí al lado). La primera postura.
// Guía: docs/guia/herramientas/galeria.md
'use strict';
const MINIATURAS = (() => {
  const OP = { K: 0.72, alto: 1, borde: false, sombra: 0.3 }, GIRO = 0.5, LADO = 180;
  async function monta(lienzo, png, json) {
    const r = await fetch(json);
    if (!r.ok) throw new Error('json ' + r.status);
    const meta = await r.json(), im = new Image(); im.src = png; await im.decode();
    const hojas = Array.from({ length: meta.lonchas }, (_, z) => {
      const c = document.createElement('canvas'); c.width = meta.ancho; c.height = meta.fondo; c.getContext('2d').drawImage(im, -z * meta.ancho, 0); return c;
    });
    const sombra = document.createElement('canvas'); sombra.width = meta.ancho; sombra.height = meta.fondo;
    const pila = { hojas, sombra, an: meta.ancho, la: meta.fondo }, s = LONCHAS.sprite(pila, GIRO, { ...OP, alto: meta.alto > 0 ? meta.alto / meta.lonchas : 1 });
    lienzo.width = s.cv.width; lienzo.height = s.cv.height; lienzo.getContext('2d').drawImage(s.cv, 0, 0);
    const veces = Math.max(1, Math.floor(LADO / Math.max(s.cv.width, s.cv.height)));
    Object.assign(lienzo.style, { width: s.cv.width * veces + 'px', height: s.cv.height * veces + 'px' });
  }
  // un lienzo que se pinta cuando llegan la tira y su json; si no se puede, se queda vacío y lo dice en su título
  function lonchas(png, json) {
    const lienzo = document.createElement('canvas'); lienzo.className = 'tira';
    monta(lienzo, png, json).catch(e => { lienzo.title = 'Sin miniatura: ' + e.message; });
    return lienzo;
  }
  return { lonchas };
})();
