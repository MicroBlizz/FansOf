// Fans Of Taxi · CINTAS / trozo: todas las carreteras de un trozo del mundo (256 m), listas para dibujar.
// Cada trozo pone el pedazo de cada tramo que le cae encima (sección a sección, por su punto medio), y cada cruce lo pone el trozo de
// su nudo: así nada sale dos veces ni se pierde, y la física de un trozo tiene toda la calzada que lo cruza.
'use strict';
CINTAS.trozo = (() => {
  const G = CINTAS.geometria;

  function construir(trozo) {
    const listas = { calzada: new CINTAS.ListaTriangulos(), muros: new CINTAS.ListaTriangulos(), tunel: new CINTAS.ListaTriangulos() };
    const encima = (x, z) => x >= trozo.x0 && x < trozo.x1 && z >= trozo.z0 && z < trozo.z1;
    const dentro = n => encima(n.x, n.z);
    const cruces = new Set();
    for (const tramo of trozo.aristas) {
      CINTAS.tramo.construir(tramo, listas, encima);
      if (tramo.tipo === 'mirador' && dentro(CIUDAD.nodos[tramo.b])) CINTAS.cruce.explanada(CIUDAD.nodos[tramo.b], tramo.ancho / 2, listas.calzada);
      for (const id of [tramo.a, tramo.b]) {
        const nodo = CIUDAD.nodos[id];
        if (cruces.has(id) || !dentro(nodo) || !G.esCruce(nodo)) continue;
        cruces.add(id);
        CINTAS.cruce.construir(nodo, listas);
      }
    }
    for (const rampa of trozo.rampas) CINTAS.rampaSalto.construir(rampa, listas.muros);
    return listas;
  }

  return { construir };
})();
