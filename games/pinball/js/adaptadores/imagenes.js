// Fans of Pinball · adaptador · IMÁGENES: carga y decodifica, antes de jugar, todos los PNG de AJUSTES.arte.imagenes y las posturas ya hechas (MOVIL.md, apartado 3:
// nada se decodifica a mitad de partida). carga() da una promesa con { nombre: Image }; una imagen que falta se queda como un hueco de 1 px
// (y se dice en la consola) para que el juego no se caiga si Yoshi aún no la ha entregado.
'use strict';
PB.cargaImagenes = arte => {
  const una = (nombre, archivo) => new Promise(listo => {
    const img = new Image();
    img.onload = () => (img.decode ? img.decode().catch(() => null) : Promise.resolve()).then(() => listo([nombre, img]));
    img.onerror = () => { console.warn('Fans of Pinball: falta la imagen ' + archivo); listo([nombre, PB.hueco()]); };
    img.src = arte.carpeta + archivo;
  });
  // las posturas cómicas que ya existen (AJUSTES.arte.posturasHechas) se guardan como 'postura:<nombre>'
  const posturas = arte.posturasHechas.map(n => ['postura:' + n, 'ovillo-' + n + '.png']);
  return Promise.all(Object.entries(arte.imagenes).concat(posturas).map(([n, a]) => una(n, a))).then(pares => Object.fromEntries(pares));
};
// un lienzo vacío (transparente) de 1x1: lo que se pinta cuando falta una imagen
PB.hueco = () => PB.lienzoNuevo(1, 1);
PB.lienzoNuevo = (w, h) => {
  const c = document.createElement('canvas');
  c.width = Math.max(1, w); c.height = Math.max(1, h);
  return c;
};
