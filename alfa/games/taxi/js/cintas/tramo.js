// Fans Of Taxi · CINTAS / tramo: todo lo que lleva un tramo de carretera, sección a sección.
//   · Calzada: la cinta de asfalto. En superficie, un bordillo que baja a cada lado (tapa el borde con el terreno).
//   · Rayas: discontinua amarilla en las calles anchas, continua blanca en las avenidas.
//   · Rampa (trinchera): a cada lado un muro en U (cara de dentro, remate y cara de fuera) que asoma un poco sobre el terreno, y
//     por fuera una franja de suelo que tapa el borde del terreno (que se recorta sobre la trinchera).
//   · Túnel: paredes y techo, a la altura de la carcasa (encaja con la sala de los cruces).
'use strict';
CINTAS.tramo = (() => {
  const { colores: C, medidas: M } = CINTAS.estilo;
  const G = CINTAS.geometria;
  const natural = (seccion, d) => CIUDAD.natural(seccion.x + seccion.lateral[0] * d, seccion.z + seccion.lateral[1] * d);

  function calzada(a, b, mitad, lista, conBordillo) {
    const y = s => s.y + M.sobreSuelo;
    lista.cuadrilatero(G.aLado(a, -mitad, y(a)), G.aLado(b, -mitad, y(b)), G.aLado(b, mitad, y(b)), G.aLado(a, mitad, y(a)), C.asfalto);
    if (!conBordillo) return;
    for (const lado of [-1, 1]) {
      const d = lado * mitad;
      lista.cuadrilatero(G.aLado(a, d, y(a)), G.aLado(a, d, a.y - M.bordillo), G.aLado(b, d, b.y - M.bordillo), G.aLado(b, d, y(b)), C.bordillo);
    }
  }

  function murosTrinchera(a, b, mitad, lista) {
    for (const lado of [-1, 1]) {
      const dentro = lado * (mitad + G.HOLGURA), fuera = lado * (mitad + G.HOLGURA + M.grosorMuro);
      const franja = lado * (mitad + G.HOLGURA + M.grosorMuro + M.franjaFuera);
      const remate = s => Math.max(s.y + M.alturaPretil, natural(s, fuera) + M.alturaPretil);
      const [ra, rb] = [remate(a), remate(b)];
      const [na, nb] = [natural(a, fuera), natural(b, fuera)];
      const [fa, fb] = [natural(a, franja), natural(b, franja)];
      lista.cuadrilatero(G.aLado(a, dentro, a.y - 1), G.aLado(b, dentro, b.y - 1), G.aLado(b, dentro, rb), G.aLado(a, dentro, ra), C.muro);
      lista.cuadrilatero(G.aLado(a, dentro, ra), G.aLado(b, dentro, rb), G.aLado(b, fuera, rb), G.aLado(a, fuera, ra), C.remate);
      lista.cuadrilatero(G.aLado(a, fuera, ra), G.aLado(b, fuera, rb), G.aLado(b, fuera, nb - 1), G.aLado(a, fuera, na - 1), C.muro);
      lista.cuadrilatero(G.aLado(a, fuera, na + 0.05), G.aLado(b, fuera, nb + 0.05), G.aLado(b, franja, fb + 0.05), G.aLado(a, franja, fa + 0.05), C.remate);
    }
  }

  function carcasaTunel(a, b, mitad, lista) {
    const d = mitad + G.HOLGURA, techoA = a.yCarcasa + M.techoTunel, techoB = b.yCarcasa + M.techoTunel;
    for (const lado of [-1, 1]) {
      const p = lado * d;
      lista.cuadrilatero(G.aLado(a, p, a.yCarcasa - M.bajoTunel), G.aLado(b, p, b.yCarcasa - M.bajoTunel), G.aLado(b, p, techoB), G.aLado(a, p, techoA), C.tunel);
    }
    lista.cuadrilatero(G.aLado(a, -d, techoA), G.aLado(b, -d, techoB), G.aLado(b, d, techoB), G.aLado(a, d, techoA), C.tunel);
  }

  function rayas(tramo, secciones, lista) {
    if (tramo.tipo === 'mirador') return;
    const a = CIUDAD.nodos[tramo.a], b = CIUDAD.nodos[tramo.b];
    const { ux, uz } = secciones[0], desde = secciones[0].s, hasta = secciones[secciones.length - 1].s;
    const punto = (s, d) => [a.x + ux * s - uz * d, lerp(a.y, b.y, s / tramo.largo) + M.rayaSobreSuelo, a.z + uz * s + ux * d];
    const banda = (s0, s1, ancho, color) => lista.cuadrilatero(punto(s0, -ancho / 2), punto(s1, -ancho / 2), punto(s1, ancho / 2), punto(s0, ancho / 2), color);
    if (tramo.tipo === 'avenida') { banda(desde, hasta, M.anchoRayaBlanca, C.rayaBlanca); return; }
    if (tramo.ancho < 11) return;
    for (let s = desde + M.largoRaya / 2; s + M.largoRaya < hasta; s += M.cadaRaya) banda(s, s + M.largoRaya, M.anchoRayaAmarilla, C.rayaAmarilla);
  }

  // construye el tramo en las listas { calzada, muros, tunel }
  function construir(tramo, listas) {
    const secciones = G.secciones(tramo);
    if (secciones.length < 2) return;
    const mitad = tramo.ancho / 2, enSuperficie = !G.esSubterraneo(tramo);
    for (let i = 0; i < secciones.length - 1; i++) {
      const a = secciones[i], b = secciones[i + 1];
      calzada(a, b, mitad, listas.calzada, enSuperficie);
      if (tramo.tipo === 'rampa') murosTrinchera(a, b, mitad, listas.muros);
      if (tramo.tipo === 'tunel') carcasaTunel(a, b, mitad, listas.tunel);
    }
    rayas(tramo, secciones, listas.calzada);
  }

  return { construir };
})();
