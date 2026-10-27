// Fans Of Taxi · CINTAS / cruce: el polígono que une los tramos cortados en un nudo.
//
// Alrededor del nudo, en orden de ángulo, cada tramo aporta su «boca» (sus dos esquinas donde se cortó) y, entre un tramo y el
// siguiente, la esquina donde se cruzan sus bordes. Ese polígono se rellena en abanico desde el nudo. En superficie lleva bordillo
// por los lados que no son boca; en un cruce de túneles es además una sala: paredes en esos lados y techo con la misma forma.
'use strict';
CINTAS.cruce = (() => {
  const { colores: C, medidas: M } = CINTAS.estilo;
  const G = CINTAS.geometria;
  const DISTANCIA_MAXIMA_ESQUINA = 40;

  // las bocas de los tramos del nudo, en orden de ángulo: { tramo, dx, dz, derecha, izquierda } (izquierda mirando hacia fuera)
  function bocas(nodo) {
    return G.tramosDe(nodo)
      .map(tramo => {
        const [dx, dz] = G.direccionDesde(nodo, tramo), corte = G.corteDe(tramo, nodo), mitad = tramo.ancho / 2;
        const y = lerp(nodo.y, G.otroExtremo(tramo, nodo).y, corte / tramo.largo);
        const cx = nodo.x + dx * corte, cz = nodo.z + dz * corte;
        return { tramo, dx, dz, angulo: Math.atan2(dz, dx), derecha: [cx + dz * mitad, y, cz - dx * mitad], izquierda: [cx - dz * mitad, y, cz + dx * mitad] };
      })
      .sort((p, q) => p.angulo - q.angulo);
  }

  // dónde se cruzan el borde izquierdo de la boca p y el derecho de la siguiente q (null si van casi paralelos o muy lejos)
  function esquina(nodo, p, q) {
    const denominador = p.dx * q.dz - p.dz * q.dx;
    if (Math.abs(denominador) < 0.15) return null;
    const qx = q.derecha[0] - p.izquierda[0], qz = q.derecha[2] - p.izquierda[2], t = (qx * q.dz - qz * q.dx) / denominador;
    const x = p.izquierda[0] + p.dx * t, z = p.izquierda[2] + p.dz * t;
    return Math.hypot(x - nodo.x, z - nodo.z) < DISTANCIA_MAXIMA_ESQUINA ? [x, nodo.y, z] : null;
  }

  // el contorno del cruce: [{ punto, esBoca }], donde esBoca marca que del punto al siguiente se entra en un tramo
  function contorno(nodo) {
    const lista = bocas(nodo), puntos = [];
    lista.forEach((p, i) => {
      puntos.push({ punto: p.derecha, esBoca: true }, { punto: p.izquierda, esBoca: false });
      const q = lista[(i + 1) % lista.length];
      const e = lista.length > 1 ? esquina(nodo, p, q) : null;
      if (e) puntos.push({ punto: e, esBoca: false });
    });
    return puntos;
  }

  const subir = (p, dy) => [p[0], p[1] + dy, p[2]];
  const aAltura = (p, y) => [p[0], y, p[2]];

  function construir(nodo, listas) {
    const puntos = contorno(nodo);
    if (puntos.length < 3) return;
    const tramos = G.tramosDe(nodo), enSuperficie = tramos.every(t => !G.esSubterraneo(t)), esTunel = tramos.some(t => t.tipo === 'tunel');
    const centro = [nodo.x, nodo.y + M.sobreSuelo, nodo.z], techo = nodo.y + M.techoTunel;
    puntos.forEach((p, i) => {
      const q = puntos[(i + 1) % puntos.length];
      listas.calzada.triangulo(centro, subir(q.punto, M.sobreSuelo), subir(p.punto, M.sobreSuelo), C.asfalto);
      if (esTunel) listas.tunel.triangulo([nodo.x, techo, nodo.z], aAltura(p.punto, techo), aAltura(q.punto, techo), C.tunel);
      if (p.esBoca) return;
      if (enSuperficie) listas.calzada.cuadrilatero(subir(p.punto, M.sobreSuelo), subir(p.punto, -M.bordillo), subir(q.punto, -M.bordillo), subir(q.punto, M.sobreSuelo), C.bordillo);
      if (esTunel) listas.tunel.cuadrilatero(aAltura(p.punto, nodo.y - M.bajoTunel), aAltura(q.punto, nodo.y - M.bajoTunel), aAltura(q.punto, techo), aAltura(p.punto, techo), C.tunel);
    });
  }

  // la explanada redonda de un mirador
  function explanada(nodo, radio, lista) {
    const y = nodo.y + M.sobreSuelo + 0.01, centro = [nodo.x, y, nodo.z], lados = 16;
    for (let i = 0; i < lados; i++) {
      const a0 = (i / lados) * Math.PI * 2, a1 = ((i + 1) / lados) * Math.PI * 2;
      lista.triangulo(centro, [nodo.x + Math.cos(a1) * radio, y, nodo.z + Math.sin(a1) * radio], [nodo.x + Math.cos(a0) * radio, y, nodo.z + Math.sin(a0) * radio], C.mirador);
    }
  }

  return { construir, explanada };
})();
