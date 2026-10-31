// Fans Of Taxi · CINTAS / tramo: todo lo que lleva un tramo de carretera, sección a sección.
//   · Calzada: la cinta de asfalto. En superficie, un bordillo que baja a cada lado (tapa el borde con el terreno).
//   · Rayas: discontinua amarilla en las calles anchas, continua blanca en las avenidas.
//   · Rampa (trinchera): a cada lado un muro en U (cara de dentro, remate y cara de fuera) que asoma un poco sobre el terreno, y
//     por fuera una franja de suelo que tapa el borde del terreno (que se recorta sobre la trinchera).
//   · Túnel: paredes y techo, a la altura de la carcasa (encaja con la sala de los cruces).
//   · Viaducto (rampa elevada, azotea): un pretil a cada lado y, salvo sobre un edificio, una falda que baja hasta el terreno. Donde
//     el viaducto se acaba, o sigue por un tramo más estrecho, un pretil de través cierra lo que queda al aire.
'use strict';
CINTAS.tramo = (() => {
  const { colores: C, medidas: M } = CINTAS.estilo;
  const G = CINTAS.geometria;
  const natural = (seccion, d) => CIUDAD.natural(seccion.x + seccion.lateral[0] * d, seccion.z + seccion.lateral[1] * d);

  // La calzada entre dos secciones es un cuadrilátero de lado a lado. Si es plano basta con dos triángulos; pero donde la calzada se
  // tuerce (pasa del plano inclinado de un cruce o una horquilla a su propia cuesta) dos triángulos grandes dejarían un pliegue en la
  // diagonal, y con una calle ancha eso son escalones de palmo: ahí se parte en casillas de CASILLA metros que siguen la altura real.
  const ALABEO_MAX = 0.02;   // metros que puede separarse un triángulo de la calzada de verdad
  const CASILLA = 2;
  const entre = (a, b, t) => ({ x: lerp(a.x, b.x, t), z: lerp(a.z, b.z, t), lateral: [lerp(a.lateral[0], b.lateral[0], t), lerp(a.lateral[1], b.lateral[1], t)] });
  function alabeo(tramo, a, b, mitad) {
    const y = (s, d) => G.sobreCalzada(tramo, s, d, 0)[1];
    const [aa, ab, ba, bb] = [y(a, -mitad), y(a, mitad), y(b, -mitad), y(b, mitad)];
    const centro = y(entre(a, b, 0.5), 0);
    return Math.max(Math.abs(aa + bb - ab - ba) / 2, Math.abs(centro - (aa + ab + ba + bb) / 4));
  }
  function calzada(tramo, a, b, mitad, lista, conBordillo) {
    const punto = (s, d, encima) => G.sobreCalzada(tramo, s, d, encima);
    const plano = alabeo(tramo, a, b, mitad) <= ALABEO_MAX;
    const largo = Math.hypot(b.x - a.x, b.z - a.z), filas = plano ? 1 : Math.ceil(largo / CASILLA), tiras = plano ? 1 : Math.ceil(2 * mitad / CASILLA);
    for (let i = 0; i < filas; i++) {
      const s0 = filas === 1 ? a : entre(a, b, i / filas), s1 = filas === 1 ? b : entre(a, b, (i + 1) / filas);
      for (let k = 0; k < tiras; k++) {
        const d0 = lerp(-mitad, mitad, k / tiras), d1 = lerp(-mitad, mitad, (k + 1) / tiras);
        lista.cuadrilatero(punto(s0, d0, M.sobreSuelo), punto(s1, d0, M.sobreSuelo), punto(s1, d1, M.sobreSuelo), punto(s0, d1, M.sobreSuelo), C.asfalto);
      }
    }
    if (!conBordillo) return;
    for (const lado of [-1, 1]) {
      const d = lado * mitad;
      lista.cuadrilatero(punto(a, d, M.sobreSuelo), punto(a, d, -M.bordillo), punto(b, d, -M.bordillo), punto(b, d, M.sobreSuelo), C.bordillo);
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

  // los dos lados de un viaducto: el pretil y su falda hasta el terreno (si va sobre un edificio, la fachada ya hace de falda)
  function ladosViaducto(tramo, a, b, mitad, lista) {
    const d = mitad + G.HOLGURA / 2, arriba = M.pretilViaducto;
    for (const lado of [-1, 1]) {
      const pa = lado * d, abajoA = tramo.azotea ? a.y - 0.5 : natural(a, pa) - 1, abajoB = tramo.azotea ? b.y - 0.5 : natural(b, pa) - 1;
      lista.cuadrilatero(G.aLado(a, pa, abajoA), G.aLado(b, pa, abajoB), G.aLado(b, pa, b.y + arriba), G.aLado(a, pa, a.y + arriba), C.muro);
    }
  }
  // el pretil de través en un extremo del viaducto: entero si es un final, a los lados si sigue un tramo más estrecho
  function remates(tramo, secciones, lista, dentro) {
    const mitad = tramo.ancho / 2 + G.HOLGURA / 2;
    for (const [seccion, nodo] of [[secciones[0], CIUDAD.nodos[tramo.a]], [secciones[secciones.length - 1], CIUDAD.nodos[tramo.b]]]) {
      if (G.corteDe(tramo, nodo) > 0 || !dentro(seccion.x, seccion.z)) continue;   // en un cruce lo cierra el cruce
      const otros = G.tramosDe(nodo).filter(o => o !== tramo), hueco = otros.length ? Math.max(...otros.map(o => o.ancho / 2 + G.HOLGURA / 2)) : 0;
      if (hueco >= mitad) continue;
      const pared = (d0, d1) => lista.cuadrilatero(G.aLado(seccion, d0, seccion.y - 0.5), G.aLado(seccion, d1, seccion.y - 0.5), G.aLado(seccion, d1, seccion.y + M.pretilViaducto), G.aLado(seccion, d0, seccion.y + M.pretilViaducto), C.muro);
      if (hueco === 0) pared(-mitad, mitad);
      else { pared(-mitad, -hueco); pared(hueco, mitad); }
    }
  }

  function rayas(tramo, secciones, lista, dentro) {
    if (tramo.tipo === 'mirador') return;
    const a = CIUDAD.nodos[tramo.a];
    const { ux, uz } = secciones[0], desde = secciones[0].s, hasta = secciones[secciones.length - 1].s;
    const punto = (s, d) => {
      const x = a.x + ux * s - uz * d, z = a.z + uz * s + ux * d;
      return [x, CIUDAD.alturaTramo(tramo, x, z) + M.rayaSobreSuelo, z];
    };
    const banda = (s0, s1, ancho, color) => dentro(a.x + ux * (s0 + s1) / 2, a.z + uz * (s0 + s1) / 2) && lista.cuadrilatero(punto(s0, -ancho / 2), punto(s1, -ancho / 2), punto(s1, ancho / 2), punto(s0, ancho / 2), color);
    if (tramo.tipo === 'avenida') { for (let i = 0; i + 1 < secciones.length; i++) banda(secciones[i].s, secciones[i + 1].s, M.anchoRayaBlanca, C.rayaBlanca); return; }
    if (tramo.ancho < 11) return;
    for (let s = desde + M.largoRaya / 2; s + M.largoRaya < hasta; s += M.cadaRaya) banda(s, s + M.largoRaya, M.anchoRayaAmarilla, C.rayaAmarilla);
  }

  // construye el tramo en las listas { calzada, muros, tunel }. Solo lo que cae dentro(x, z) (por defecto, todo): un tramo largo
  // cruza varios trozos y cada trozo pone el pedazo que le cae encima. Si lo pusiera entero el trozo de su primer nudo, lejos de
  // ese nudo la física (que solo monta los trozos cercanos al coche) se quedaría sin calzada y el coche pisaría el terreno.
  function construir(tramo, listas, dentro = () => true) {
    const secciones = G.secciones(tramo);
    if (secciones.length < 2) return;
    const mitad = tramo.ancho / 2, enSuperficie = !G.esSubterraneo(tramo);
    for (let i = 0; i < secciones.length - 1; i++) {
      const a = secciones[i], b = secciones[i + 1];
      if (!dentro((a.x + b.x) / 2, (a.z + b.z) / 2)) continue;
      calzada(tramo, a, b, mitad, listas.calzada, enSuperficie);
      if (tramo.tipo === 'rampa') murosTrinchera(a, b, mitad, listas.muros);
      if (tramo.tipo === 'tunel') carcasaTunel(a, b, mitad, listas.tunel);
      if (tramo.tipo === 'viaducto') ladosViaducto(tramo, a, b, mitad, listas.muros);
    }
    if (tramo.tipo === 'viaducto') remates(tramo, secciones, listas.muros, dentro);
    rayas(tramo, secciones, listas.calzada, dentro);
  }

  return { construir };
})();
