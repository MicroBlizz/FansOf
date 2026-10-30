// Fans Of Taxi · REJILLA: el suelo de un trozo del mundo (256 m) como una rejilla de alturas, con el hueco de las trincheras.
// La usan la pantalla (trozos.js, para dibujarlo) y la física (fisica/formas.js, para pisarlo): las dos ven el mismo suelo, y se
// calcula una sola vez por trozo. Dominio puro: sin DOM ni three.
'use strict';
const REJILLA = (() => {
  const M = TAXI.mundo;

  // { divisiones, lado (metros de cada celda), alto[k], hueco[k] } con k = ix + iz * (divisiones + 1)
  function deTrozo(t) {
    if (t.rejilla) return t.rejilla;
    // donde hay bocas de túnel la rejilla es más fina, para que el hueco que se quita encaje con las paredes de la trinchera
    const conTrinchera = t.aristas.some(e => e.tipo === 'rampa');
    const R = conTrinchera ? M.resSueloTrinchera : M.resSuelo, lado = (t.x1 - t.x0) / R, fila = R + 1;
    const alto = new Float32Array(fila * fila), hueco = new Uint8Array(fila * fila);
    for (let iz = 0; iz <= R; iz++) for (let ix = 0; ix <= R; ix++) {
      const x = t.x0 + ix * lado, z = t.z0 + iz * lado, k = ix + iz * fila;
      alto[k] = CIUDAD.alturaSuelo(x, z);
      if (conTrinchera && CIUDAD.enTrinchera(x, z)) hueco[k] = 1;
    }
    return (t.rejilla = { divisiones: R, lado, alto, hueco, conTrinchera });
  }

  // los triángulos del suelo (sobre la trinchera no hay: el fondo es la calzada y los lados, sus muros). Cada celda se parte por la
  // diagonal que va de su esquina (ix, iz + 1) a la (ix + 1, iz), como PlaneGeometry de three.js: así el dibujo y la física coinciden
  function triangulos(t, alCrear) {
    const r = deTrozo(t), fila = r.divisiones + 1;
    for (let iz = 0; iz < r.divisiones; iz++) for (let ix = 0; ix < r.divisiones; ix++) {
      const a = ix + iz * fila, b = a + fila, c = b + 1, d = a + 1;
      for (const [p, q, s] of [[a, b, d], [b, c, d]]) if (!r.hueco[p] && !r.hueco[q] && !r.hueco[s]) alCrear(p, q, s);
    }
  }

  return { deTrozo, triangulos };
})();
