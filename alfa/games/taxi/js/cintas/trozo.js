// Fans Of Taxi · CINTAS / trozo: todas las carreteras de un trozo del mundo (256 m), listas para dibujar.
// Cada tramo lo construye el trozo de su primer nudo, y cada cruce el trozo de su nudo: así nada sale dos veces ni se pierde.
'use strict';
CINTAS.trozo = (() => {
  const G = CINTAS.geometria;

  function construir(trozo) {
    const listas = { calzada: new CINTAS.ListaTriangulos(), muros: new CINTAS.ListaTriangulos(), tunel: new CINTAS.ListaTriangulos() };
    const dentro = n => n.x >= trozo.x0 && n.x < trozo.x1 && n.z >= trozo.z0 && n.z < trozo.z1;
    const cruces = new Set();
    for (const tramo of trozo.aristas) {
      const a = CIUDAD.nodos[tramo.a];
      if (dentro(a)) {
        CINTAS.tramo.construir(tramo, listas);
        if (tramo.tipo === 'mirador') CINTAS.cruce.explanada(CIUDAD.nodos[tramo.b], tramo.ancho / 2, listas.calzada);
      }
      for (const id of [tramo.a, tramo.b]) {
        const nodo = CIUDAD.nodos[id];
        if (cruces.has(id) || !dentro(nodo) || !G.esCruce(nodo)) continue;
        cruces.add(id);
        CINTAS.cruce.construir(nodo, listas);
      }
    }
    return listas;
  }

  return { construir };
})();
