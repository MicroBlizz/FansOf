// Fans of Pop · RAID, la cámara (dominio puro, tarea 448, nodo n4): las cuentas para mirar un tablero de 512x512 burbujas por una ventana del móvil.
// · cámara = { x, y, z }: (x, y) es el punto del tablero (en burbujas, con decimales) que queda en el centro de la ventana; z = píxeles por burbuja.
// · vista  = { x, y, w, h }: la ventana en píxeles de diseño. · zona = { x, y, lado }: el trozo del tablero que se puede mirar (todo, o el bloque
//   de la raid de prueba). Nada se cambia en el sitio: cada función devuelve una cámara nueva. Sin reloj, azar, DOM ni PP_CFG.
'use strict';
const PP_RAID_CAMARA = (() => {
  const TROZO = 32, TROZOS_LADO = 16, LADO = 512;
  const entre = (v, a, b) => Math.min(b, Math.max(a, v));

  // el zoom más lejano: la zona entera cabe a lo ancho y a lo alto
  const zMin = (vista, zona) => Math.min(vista.w, vista.h) / zona.lado;
  // centra un eje: si la ventana ve más que la zona, al centro de la zona; si no, sin salirse
  function eje(c, medio, desde, lado) {
    if (medio * 2 >= lado) return desde + lado / 2;
    return entre(c, desde + medio, desde + lado - medio);
  }
  // deja la cámara dentro de lo permitido: zoom entre el más lejano y zMax, y sin enseñar nada de fuera de la zona si se puede evitar
  function limita(cam, vista, zona, zMax) {
    const z = entre(cam.z, zMin(vista, zona), Math.max(zMax, zMin(vista, zona)));
    return Object.freeze({
      x: eje(cam.x, vista.w / z / 2, zona.x, zona.lado),
      y: eje(cam.y, vista.h / z / 2, zona.y, zona.lado),
      z,
    });
  }
  // la cámara que enseña la zona entera
  const entera = (vista, zona) => Object.freeze({ x: zona.x + zona.lado / 2, y: zona.y + zona.lado / 2, z: zMin(vista, zona) });
  // arrastrar: el dedo se mueve (dx, dy) píxeles y el tablero le sigue
  const mueve = (cam, dx, dy) => Object.freeze({ x: cam.x - dx / cam.z, y: cam.y - dy / cam.z, z: cam.z });
  // del píxel (px, py) de la pantalla al punto del tablero (con decimales)
  function aTablero(cam, vista, px, py) {
    return [cam.x + (px - vista.x - vista.w / 2) / cam.z, cam.y + (py - vista.y - vista.h / 2) / cam.z];
  }
  // del punto del tablero al píxel de la pantalla
  function aPantalla(cam, vista, bx, by) {
    return [vista.x + vista.w / 2 + (bx - cam.x) * cam.z, vista.y + vista.h / 2 + (by - cam.y) * cam.z];
  }
  // la burbuja que hay bajo el píxel: [x, y] enteros, o null si cae fuera de la zona o de la ventana
  function celdaEn(cam, vista, zona, px, py) {
    if (px < vista.x || py < vista.y || px >= vista.x + vista.w || py >= vista.y + vista.h) return null;
    const [bx, by] = aTablero(cam, vista, px, py);
    const x = Math.floor(bx), y = Math.floor(by);
    if (x < zona.x || y < zona.y || x >= zona.x + zona.lado || y >= zona.y + zona.lado) return null;
    return [x, y];
  }
  // cambia el zoom a `z` dejando quieto el punto del tablero que hay bajo el píxel (px, py): acercar donde se toca o se pellizca
  function zoomEn(cam, vista, px, py, z) {
    const [bx, by] = aTablero(cam, vista, px, py);
    return Object.freeze({ x: bx - (px - vista.x - vista.w / 2) / z, y: by - (py - vista.y - vista.h / 2) / z, z });
  }
  // las burbujas a la vista, recortadas a la zona: { x0, y0, x1, y1 } con x1 e y1 sin incluir
  function visibles(cam, vista, zona) {
    const mw = vista.w / cam.z / 2, mh = vista.h / cam.z / 2;
    return Object.freeze({
      x0: entre(Math.floor(cam.x - mw), zona.x, zona.x + zona.lado),
      y0: entre(Math.floor(cam.y - mh), zona.y, zona.y + zona.lado),
      x1: entre(Math.ceil(cam.x + mw), zona.x, zona.x + zona.lado),
      y1: entre(Math.ceil(cam.y + mh), zona.y, zona.y + zona.lado),
    });
  }
  // los trozos de 32x32 que pisa un rectángulo de burbujas, de menor a mayor
  function trozos(r) {
    const ids = [];
    if (r.x1 <= r.x0 || r.y1 <= r.y0) return ids;
    for (let ty = r.y0 >> 5; ty <= (r.y1 - 1) >> 5; ty++) for (let tx = r.x0 >> 5; tx <= (r.x1 - 1) >> 5; tx++) ids.push(ty * TROZOS_LADO + tx);
    return ids;
  }
  // los trozos de una zona entera
  const trozosDeZona = zona => trozos({ x0: zona.x, y0: zona.y, x1: zona.x + zona.lado, y1: zona.y + zona.lado });
  // un paso de una cámara a otra (k de 0 a 1), para los acercamientos animados
  const mezcla = (a, b, k) => Object.freeze({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, z: a.z * Math.pow(b.z / a.z, k) });

  return Object.freeze({ TROZO, LADO, zMin, limita, entera, mueve, aTablero, aPantalla, celdaEn, zoomEn, visibles, trozos, trozosDeZona, mezcla });
})();
if (typeof module !== 'undefined') module.exports = PP_RAID_CAMARA;
