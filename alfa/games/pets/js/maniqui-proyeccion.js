// Fans Of Pets · MANIQUÍ 3D: la PROYECCIÓN del dibujo sobre las piezas (docs/pets/animacion-2d.md). Cuentas sobre los píxeles del dibujo
// (RGBA, lado × lado) y sobre el mapa de qué pieza se ve delante en cada píxel (ids, uno por píxel, 0 = ninguna). Con ellos sale la
// textura de cada pieza: su trozo del dibujo (alfa 255), lo que tapa otra pieza y se ve al moverse (128: se pinta de su color) y nada
// fuera del dibujo (0: no se pinta), salvo una franja fina del color de la línea alrededor de la silueta, para que al girar una pieza lo
// que asoma por el lado salga como contorno y no como hueco. Sin three.js ni DOM.
'use strict';
PT.maniquiProyeccion = (() => {
  const DENTRO = 128;   // un píxel del dibujo es de la criatura si su alfa pasa de aquí
  const VECINOS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  // cuánto se aleja cada píxel de la silueta del dibujo: 1 dentro, 2…ancho+1 en la franja de fuera, 0 más lejos
  function franja(rgba, lado, ancho) {
    const d = new Uint8Array(lado * lado);
    let frente = [];
    for (let i = 0; i < lado * lado; i++) if (rgba[i * 4 + 3] > DENTRO) { d[i] = 1; frente.push(i); }
    for (let paso = 2; paso <= ancho + 1 && frente.length; paso++) frente = crece(d, frente, lado, paso);
    return d;
  }
  function crece(d, frente, lado, paso) {
    const sig = [];
    for (const i of frente) {
      const x = i % lado, y = (i / lado) | 0;
      for (const [a, b] of VECINOS) {
        const u = x + a, v = y + b;
        if (u < 0 || v < 0 || u >= lado || v >= lado || d[v * lado + u]) continue;
        d[v * lado + u] = paso; sig.push(v * lado + u);
      }
    }
    return sig;
  }
  // ¿es de esta pieza el píxel? Lo es si se ve delante, o si está a 3 px de ella y no se ve ninguna (para no dejar rendijas)
  function esSuyo(ids, lado, x, y, id) {
    const aqui = ids[y * lado + x];
    if (aqui !== 0) return aqui === id;
    return (x + 3 < lado && ids[y * lado + x + 3] === id) || (x >= 3 && ids[y * lado + x - 3] === id) ||
      (y + 3 < lado && ids[(y + 3) * lado + x] === id) || (y >= 3 && ids[(y - 3) * lado + x] === id);
  }
  const pon = (sal, i, r, g, b) => { sal[i] = r; sal[i + 1] = g; sal[i + 2] = b; sal[i + 3] = 255; };
  // la textura de una pieza (RGBA, lado × lado): ver arriba. linea = [r, g, b] del contorno
  function textura({ rgba, ids, cerca, lado, id, linea }) {
    const sal = new Uint8ClampedArray(lado * lado * 4);
    for (let y = 0; y < lado; y++) for (let x = 0; x < lado; x++) {
      const i = y * lado + x, suyo = esSuyo(ids, lado, x, y, id);
      if (cerca[i] === 1) { if (suyo) pon(sal, i * 4, rgba[i * 4], rgba[i * 4 + 1], rgba[i * 4 + 2]); else sal[i * 4 + 3] = 128; }
      else if (cerca[i] > 1 && ids[i] === id) pon(sal, i * 4, linea[0], linea[1], linea[2]);
    }
    return sal;
  }
  // ¿cae (x, y) dentro de alguna de las elipses [cx, cy, rx, ry]?
  const enElipse = (lista, x, y) => lista.some(([cx, cy, rx, ry]) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1);
  // el dibujo sin los ojos (para que la capa de ojos pueda parpadear): en su sitio, el color de fondo que se diga (el antifaz, la piel)
  function sinOjos(rgba, lado, ojos, fondo) {
    const sal = new Uint8ClampedArray(rgba);
    for (let y = 0; y < lado; y++) for (let x = 0; x < lado; x++) if (enElipse(ojos, x, y)) pon(sal, (y * lado + x) * 4, fondo[0], fondo[1], fondo[2]);
    return sal;
  }
  // solo los ojos del dibujo (el resto transparente)
  function soloOjos(rgba, lado, ojos) {
    const sal = new Uint8ClampedArray(rgba.length);
    for (let y = 0; y < lado; y++) for (let x = 0; x < lado; x++) {
      const i = (y * lado + x) * 4;
      if (enElipse(ojos, x, y)) pon(sal, i, rgba[i], rgba[i + 1], rgba[i + 2]);
    }
    return sal;
  }
  return { franja, textura, sinOjos, soloOjos, enElipse };
})();
