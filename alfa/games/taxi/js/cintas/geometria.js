// Fans Of Taxi · CINTAS / geometría: cómo se corta y por dónde pasa cada tramo de carretera.
//
// Un tramo (arista del grafo) se recorre en «secciones»: cortes transversales cada 6 m como mucho, con la altura que pisa el coche.
// En sus extremos hay dos casos:
//   · Inglete: si en ese nudo solo sigue otro tramo y gira poco, los dos comparten la sección del nudo, inclinada por la bisectriz.
//     Así una curva hecha de tramos rectos no deja rendijas ni solapes.
//   · Corte: en un cruce (o un giro cerrado) el tramo se para en el borde de los demás; el hueco lo cubre el polígono del cruce.
'use strict';
CINTAS.geometria = (() => {
  const nodos = CIUDAD.nodos;
  const HOLGURA = 0.5;            // de la calzada al borde del cruce (y a las paredes)
  const GIRO_MAXIMO_INGLETE = 1.2;  // radianes: con más giro se corta y hace falta cruce
  const SEPARACION = 6;           // metros como mucho entre secciones

  // --- vecindad en el grafo
  const tramoEntre = new Map();
  for (const e of CIUDAD.aristas) { tramoEntre.set(e.a + ',' + e.b, e); tramoEntre.set(e.b + ',' + e.a, e); }

  const tramosDe = nodo => nodo.vecinos.map(v => tramoEntre.get(nodo.id + ',' + v)).filter(Boolean);
  const otroExtremo = (tramo, nodo) => nodos[tramo.a === nodo.id ? tramo.b : tramo.a];
  const esSubterraneo = tramo => tramo.tipo === 'tunel' || tramo.tipo === 'rampa';

  // dirección (unitaria, en el plano) con la que el tramo sale del nudo
  function direccionDesde(nodo, tramo) {
    const o = otroExtremo(tramo, nodo), dx = o.x - nodo.x, dz = o.z - nodo.z, largo = Math.hypot(dx, dz) || 1;
    return [dx / largo, dz / largo];
  }

  // cuánto gira la carretera al pasar por el nudo de un tramo al otro (0 = sigue recta)
  function giro(nodo, tramo, otro) {
    const [ax, az] = direccionDesde(nodo, tramo), [bx, bz] = direccionDesde(nodo, otro);
    return Math.PI - Math.acos(clamp(ax * bx + az * bz, -1, 1));
  }

  // --- cortes: metros que se quita el tramo en el nudo (0 = inglete)
  function corteEn(nodo, tramo) {
    const tramos = tramosDe(nodo);
    if (tramos.length < 2) return 0;
    if (tramos.length === 2) {
      const otro = tramos[0] === tramo ? tramos[1] : tramos[0];
      if (giro(nodo, tramo, otro) < GIRO_MAXIMO_INGLETE) return 0;
    }
    let corte = 0;
    for (const otro of tramos) if (otro !== tramo) corte = Math.max(corte, otro.ancho / 2 + HOLGURA);
    return corte;
  }

  const cortes = new Map();   // tramo → [corte en a, corte en b]
  for (const e of CIUDAD.aristas) cortes.set(e, [corteEn(nodos[e.a], e), corteEn(nodos[e.b], e)]);

  const corteDe = (tramo, nodo) => cortes.get(tramo)[tramo.a === nodo.id ? 0 : 1];
  const esCruce = nodo => tramosDe(nodo).some(tramo => corteDe(tramo, nodo) > 0);

  // --- el vector lateral de un tramo en uno de sus extremos (hacia la izquierda de a→b). En un inglete sigue la bisectriz y se
  // alarga para que el borde de la calzada conserve su anchura (1 / coseno del medio giro, con tope)
  function lateralEn(tramo, nodo, ux, uz) {
    const recto = [-uz, ux], tramos = tramosDe(nodo);
    if (tramos.length !== 2 || corteDe(tramo, nodo) > 0) return recto;
    const otro = tramos[0] === tramo ? tramos[1] : tramos[0];
    const [ox, oz] = direccionDesde(nodo, otro);
    const sigue = nodo.id === tramo.b ? [ox, oz] : [-ox, -oz];   // la marcha a→b continúa (o venía) por el otro tramo
    let tx = ux + sigue[0], tz = uz + sigue[1];
    const largo = Math.hypot(tx, tz) || 1; tx /= largo; tz /= largo;
    const coseno = Math.max(0.35, tx * ux + tz * uz);
    return [-tz / coseno, tx / coseno];
  }

  // --- las secciones de un tramo, de a a b. Cada una: x, z, y (calzada, la del coche), yCarcasa (la de paredes y techo: en un
  // corte vale la del nudo, para encajar con la sala del cruce), lateral [lx, lz], s (metros desde a) y la dirección ux, uz
  function secciones(tramo) {
    const a = nodos[tramo.a], b = nodos[tramo.b], largo = tramo.largo;
    const ux = (b.x - a.x) / largo, uz = (b.z - a.z) / largo, [corteA, corteB] = cortes.get(tramo);
    if (corteA + corteB >= largo - 0.5) return [];
    const pasos = Math.max(1, Math.ceil((largo - corteA - corteB) / SEPARACION));
    const lateralA = lateralEn(tramo, a, ux, uz), lateralB = lateralEn(tramo, b, ux, uz), recto = [-uz, ux];
    const lista = [];
    for (let i = 0; i <= pasos; i++) {
      const s = lerp(corteA, largo - corteB, i / pasos);
      lista.push({
        x: a.x + ux * s, z: a.z + uz * s,
        y: CIUDAD.alturaArista(tramo, s / largo),
        yCarcasa: CIUDAD.alturaArista(tramo, i / pasos),
        lateral: i === 0 ? lateralA : i === pasos ? lateralB : recto,
        s, ux, uz,
      });
    }
    return lista;
  }

  // un punto desplazado `d` metros hacia la izquierda de la sección (negativo: derecha), a la altura y
  const aLado = (seccion, d, y) => [seccion.x + seccion.lateral[0] * d, y, seccion.z + seccion.lateral[1] * d];
  // lo mismo, pero sobre la calzada del tramo (que junto a un cruce puede ir inclinada de lado), más `encima` metros
  function sobreCalzada(tramo, seccion, d, encima) {
    const x = seccion.x + seccion.lateral[0] * d, z = seccion.z + seccion.lateral[1] * d;
    return [x, CIUDAD.alturaTramo(tramo, x, z) + encima, z];
  }

  return { HOLGURA, tramosDe, otroExtremo, esSubterraneo, direccionDesde, corteDe, esCruce, secciones, aLado, sobreCalzada };
})();
