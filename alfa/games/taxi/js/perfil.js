// Fans Of Taxi · PERFIL: a qué altura va la calzada en cada punto de cada tramo. Dominio puro (sin DOM ni three), se prueba en Node.
//
// Cómo se atan los tramos sin pliegues ni escalones:
//   · Cada CRUCE (tres calles o más) tiene un PLANO: pasa por el nudo con la inclinación que mejor encaja con las pendientes de todas
//     sus calles (mínimos cuadrados). Puede bajar con la calle (una bajada que se bifurca) o inclinarse de lado. Junto al cruce, cada
//     calle va sobre ese plano (también de lado a lado), así todas se encuentran en la boca a la misma altura.
//   · En los nudos de paso (dos tramos, una curva) la pendiente sigue continua: la media de la que trae y la que lleva.
//   · Entre un extremo y otro, la altura pasa del uno al otro con una curva suave (sin quiebros en las juntas).
// Los túneles y las trincheras tienen cruces horizontales: sus paredes y techos son horizontales.
'use strict';
const PERFIL = (() => {
  const LLANO_ANTES = 4;            // metros sobre el plano del cruce más allá de su borde
  const CUESTA_MINIMA = 0.4;        // la transición ocupa al menos esta parte del tramo
  const PENDIENTE_MAXIMA_CRUCE = 0.12;

  const suave = u => u * u * (3 - 2 * u);
  const esSubterraneo = e => e.tipo === 'tunel' || e.tipo === 'rampa';

  function crear(nodos, aristas) {
    const tramosDe = new Map(nodos.map(n => [n.id, []]));
    for (const e of aristas) { tramosDe.get(e.a).push(e); tramosDe.get(e.b).push(e); }
    const otro = (e, n) => nodos[e.a === n.id ? e.b : e.a];
    const pendienteHacia = (e, n) => (otro(e, n).y - n.y) / e.largo;   // subiendo desde n por e
    const esCruce = n => tramosDe.get(n.id).length >= 3;

    // la inclinación (gx, gz) del plano de un cruce: la que mejor explica la pendiente con la que sale cada calle
    function planoDe(n) {
      const tramos = tramosDe.get(n.id);
      if (tramos.some(esSubterraneo)) return [0, 0];
      let xx = 0, xz = 0, zz = 0, bx = 0, bz = 0;
      for (const e of tramos) {
        const o = otro(e, n), dx = (o.x - n.x) / e.largo, dz = (o.z - n.z) / e.largo, p = pendienteHacia(e, n);
        xx += dx * dx; xz += dx * dz; zz += dz * dz; bx += dx * p; bz += dz * p;
      }
      const det = xx * zz - xz * xz;
      if (Math.abs(det) < 1e-6) return [0, 0];
      let gx = (bx * zz - bz * xz) / det, gz = (xx * bz - xz * bx) / det;
      const g = Math.hypot(gx, gz);
      if (g > PENDIENTE_MAXIMA_CRUCE) { gx *= PENDIENTE_MAXIMA_CRUCE / g; gz *= PENDIENTE_MAXIMA_CRUCE / g; }
      return [gx, gz];
    }

    // la pendiente con la que el tramo e sale del nudo de paso n (continua con la del otro tramo)
    function pendienteDePaso(n, e) {
      const tramos = tramosDe.get(n.id), propia = pendienteHacia(e, n);
      if (tramos.length !== 2) return propia;
      const siguiente = tramos[0] === e ? tramos[1] : tramos[0];
      return (propia - pendienteHacia(siguiente, n)) / 2;
    }

    // cuántos metros de cada tramo van sobre el plano de su cruce
    function llanoEn(n, e) {
      if (!esCruce(n)) return 0;
      let mitad = 0;
      for (const o of tramosDe.get(n.id)) if (o !== e) mitad = Math.max(mitad, o.ancho / 2);
      return mitad + LLANO_ANTES;
    }

    for (const n of nodos) n.plano = esCruce(n) ? planoDe(n) : null;
    for (const e of aristas) {
      let la = llanoEn(nodos[e.a], e), lb = llanoEn(nodos[e.b], e);
      const sobra = la + lb - e.largo * (1 - CUESTA_MINIMA);
      if (sobra > 0) { const k = (la + lb - sobra) / (la + lb); la *= k; lb *= k; }
      e.perfil = { llanoA: la, llanoB: lb, pendienteA: pendienteDePaso(nodos[e.a], e), pendienteB: pendienteDePaso(nodos[e.b], e) };
    }

    // la altura del plano de un cruce en (x, z) (horizontal si el nudo no es un cruce)
    function enPlano(n, x, z) {
      const [gx, gz] = n.plano || [0, 0];
      return n.y + gx * (x - n.x) + gz * (z - n.z);
    }
    // la altura que da un extremo del tramo en el punto (x, z), a s metros de ese extremo
    function desdeExtremo(n, pendiente, x, z, s) {
      return n.plano ? enPlano(n, x, z) : n.y + pendiente * s;
    }

    // la altura de la calzada del tramo e en el punto (x, z) (puede estar a un lado del eje o en la boca del cruce)
    function alturaEn(e, x, z) {
      const a = nodos[e.a], b = nodos[e.b], L = e.largo, p = e.perfil;
      const s = clamp(((x - a.x) * (b.x - a.x) + (z - a.z) * (b.z - a.z)) / L, 0, L);
      const ya = desdeExtremo(a, p.pendienteA, x, z, s), yb = desdeExtremo(b, p.pendienteB, x, z, L - s);
      const u = clamp((s - p.llanoA) / Math.max(0.01, L - p.llanoA - p.llanoB), 0, 1);
      return lerp(ya, yb, suave(u));
    }
    // la altura en el eje del tramo, a la fracción t (0 en a, 1 en b)
    function alturaCentro(e, t) {
      const a = nodos[e.a], b = nodos[e.b];
      return alturaEn(e, lerp(a.x, b.x, t), lerp(a.z, b.z, t));
    }

    return { alturaEn, alturaCentro, enPlano };
  }

  return { crear };
})();
