// Fans Of Taxi · CARRETERAS: lo que hay fuera de las ciudades: los enlaces rectos entre ciudades (el triángulo), las tres carreteras de
// montaña en zigzag que suben desde cada ciudad a su mirador, la vuelta de la cima que une los tres miradores, el río que baja de la
// montaña al mar entre dos ciudades (con un puente donde lo cruza una carretera) y los árboles y rocas del campo. Recibe de CIUDAD
// las funciones de crear nodos y aristas. Sin DOM ni three.
'use strict';
const CARRETERAS = (() => {
  const M = TAXI.mundo, MO = M.montaña;
  const angulo = (x, z) => Math.atan2(z - MO.z, x - MO.x);

  // --- el río: una polilínea desde cerca de la cima hasta el borde sur del mundo, serpenteando; ancho creciente; cauce que solo baja
  function rio() {
    const puntos = [];
    for (let z = MO.z + 200; z <= M.largo + 40; z += 40) {
      const t = (z - MO.z - 200) / (M.largo - MO.z - 200);
      puntos.push({ x: MO.x + 70 * Math.sin((z - MO.z) / 130) + 40 * Math.sin((z - MO.z) / 47), z, ancho: lerp(18, 46, t) });
    }
    let h = Infinity;
    for (const p of puntos) { h = Math.min(h, TERRENO.natural(p.x, p.z) - 5); p.y = h; }
    puntos[puntos.length - 1].y = Math.min(puntos[puntos.length - 1].y, M.nivelMar - 1);
    for (let i = puntos.length - 2; i >= 0; i--) if (puntos[i].y < puntos[i + 1].y) puntos[i].y = puntos[i + 1].y;   // nunca sube cauce abajo
    return puntos;
  }
  // distancia de un punto a la polilínea del río y la altura del cauce ahí
  function cauce(puntos, x, z) {
    let mejor = { d: Infinity, y: 0, ancho: 0 };
    for (let i = 0; i < puntos.length - 1; i++) {
      const a = puntos[i], b = puntos[i + 1];
      if (Math.abs(z - (a.z + b.z) / 2) > 60) continue;
      const dx = b.x - a.x, dz = b.z - a.z, L2 = dx * dx + dz * dz, t = clamp(((x - a.x) * dx + (z - a.z) * dz) / L2, 0, 1);
      const d = Math.hypot(x - a.x - dx * t, z - a.z - dz * t);
      if (d < mejor.d) mejor = { d, y: lerp(a.y, b.y, t), ancho: lerp(a.ancho, b.ancho, t) };
    }
    return mejor;
  }

  // --- los enlaces: de una esquina de una ciudad a una esquina de otra, rectos, lejos de la montaña
  function enlaces(ciudades, g) {
    const lista = [];
    for (let a = 0; a < ciudades.length; a++) for (let b = a + 1; b < ciudades.length; b++) {
      const A = ciudades[a], B = ciudades[b];
      let mejor = null;
      for (const ca of A.esquinas) for (const cb of B.esquinas) {
        const dx = cb.x - ca.x, dz = cb.z - ca.z, L = Math.hypot(dx, dz);
        const dM = Math.abs((MO.x - ca.x) * dz - (MO.z - ca.z) * dx) / L;   // distancia del centro de la montaña a la recta
        if (dM < MO.radio + 140) continue;   // la S se acerca hasta 60 m más
        if (!mejor || L < mejor.L) mejor = { ca, cb, L };
      }
      if (!mejor) continue;
      // sale de cada esquina en perpendicular (hacia fuera de la ciudad), y entre medias hace una S suave
      const salida = (c, C) => { const dx = c.x - C.cx, dz = c.z - C.cz, d = Math.hypot(dx, dz); return g.nodo(c.x + dx / d * 70, c.z + dz / d * 70, { tipo: 'enlace' }); };
      const sa = salida(mejor.ca, A), sb = salida(mejor.cb, B);
      const L = Math.hypot(sb.x - sa.x, sb.z - sa.z), ux = (sb.x - sa.x) / L, uz = (sb.z - sa.z) / L, n = Math.max(2, Math.round(L / 50)), cadena = [mejor.ca, sa];
      const amp = Math.min(60, L * 0.08) * ((a + b) % 2 ? -1 : 1);
      for (let k = 1; k < n; k++) { const t = k / n, s = amp * Math.sin(t * Math.PI * 2) * Math.sin(t * Math.PI); cadena.push(g.nodo(lerp(sa.x, sb.x, t) - uz * s, lerp(sa.z, sb.z, t) + ux * s, { tipo: 'enlace' })); }
      cadena.push(sb, mejor.cb);
      suaviza(cadena, 2);
      for (let k = 0; k < cadena.length - 1; k++) g.une(cadena[k], cadena[k + 1], M.anchoEnlace, 'enlace');
      lista.push(cadena);
    }
    return lista;
  }
  // alisa las alturas de una cadena (los extremos se quedan)
  function suaviza(cadena, veces) {
    for (let v = 0; v < veces; v++) { const y = cadena.map(n => n.y); for (let k = 1; k < cadena.length - 1; k++) cadena[k].y = (y[k - 1] + y[k] * 2 + y[k + 1]) / 4; }
  }

  // --- la montaña: desde el nodo de circunvalación más cercano al pie, un zigzag hasta la vuelta de la cima; en lo alto, los miradores
  function montaña(ciudades, g) {
    const subidas = [], miradores = [], Z = MO;
    const anguloCima = [];
    for (const c of ciudades) {
      const pie = { x: Z.x + c.dir[0] * Z.radio, z: Z.z + c.dir[1] * Z.radio };
      let S = null; for (const n of c.anillo) if (!S || Math.hypot(n.x - pie.x, n.z - pie.z) < Math.hypot(S.x - pie.x, S.z - pie.z)) S = n;
      // primero recto hacia la montaña hasta un radio que deja fuera toda la ciudad (el círculo se mete en las esquinas); luego el zigzag
      const rS = Math.hypot(S.x - Z.x, S.z - Z.z), r0 = Math.min(rS - 30, TERRENO.fuera(c, Z.x, Z.z) - 25), ux = (S.x - Z.x) / rS, uz = (S.z - Z.z) / rS;
      const a0 = angulo(S.x, S.z);
      const recto = rS - r0;
      const punto = t => { const a = a0 + Z.zigzag * Math.sin(2 * Math.PI * Z.legs * t), r = lerp(r0, Z.cima, t); return { x: Z.x + Math.cos(a) * r, z: Z.z + Math.sin(a) * r }; };
      // nodos cada `paso` metros de recorrido
      const cadena = [S]; let prev = { x: S.x, z: S.z }, acum = 0, total = 0;
      const puntos = [];
      for (let s = Z.paso; s < recto - Z.paso * 0.5; s += Z.paso) puntos.push({ x: Z.x + ux * (rS - s), z: Z.z + uz * (rS - s), s });
      total = recto; prev = punto(0);
      for (let t = 0.0005; t <= 1; t += 0.0005) { const p = punto(Math.min(1, t)); const d = Math.hypot(p.x - prev.x, p.z - prev.z); acum += d; total += d; prev = p; if (acum >= Z.paso) { acum = 0; puntos.push({ ...p, s: total }); } }
      const fin = punto(1); puntos.push({ ...fin, s: total });
      for (const p of puntos) cadena.push(g.nodo(p.x, p.z, { tipo: 'montaña', s: p.s }));
      const yFin = Z.cimaAlto;
      for (const n of cadena) if (n.s !== undefined) n.y = lerp(S.y, yFin, n.s / total);   // la altura sube con el recorrido: pendiente constante
      for (let k = 0; k < cadena.length - 1; k++) g.une(cadena[k], cadena[k + 1], M.anchoMontaña, 'montaña');
      const cima = cadena[cadena.length - 1]; cima.tipo = 'cima';
      anguloCima.push({ a: angulo(cima.x, cima.z), n: cima, ciudad: c });
      subidas.push(cadena);
    }
    // la vuelta de la cima: nodos repartidos más los finales de las subidas, unidos en orden de ángulo
    const vuelta = anguloCima.map(q => ({ a: q.a, n: q.n }));
    for (let k = 0; k < 24; k++) { const a = -Math.PI + (k + 0.5) * Math.PI * 2 / 24; if (vuelta.some(q => Math.abs(q.a - a) < 0.2)) continue; vuelta.push({ a, n: g.nodo(Z.x + Math.cos(a) * Z.cima, Z.z + Math.sin(a) * Z.cima, { tipo: 'cima' }) }); }
    vuelta.sort((p, q) => p.a - q.a);
    for (const q of vuelta) q.n.y = Z.cimaAlto;
    for (let k = 0; k < vuelta.length; k++) g.une(vuelta[k].n, vuelta[(k + 1) % vuelta.length].n, M.anchoMontaña, 'cima');
    // los miradores: una terraza hacia fuera desde cada final de subida, mirando a su ciudad
    for (const q of anguloCima) {
      const r = Z.cima + Z.mirador + 8, x = Z.x + Math.cos(q.a) * r, z = Z.z + Math.sin(q.a) * r;
      const m = g.nodo(x, z, { tipo: 'mirador' }); m.y = Z.cimaAlto; g.une(q.n, m, Z.mirador * 2, 'mirador');
      miradores.push({ x, z, y: Z.cimaAlto, radio: Z.mirador, nodo: m, ciudad: q.ciudad, nombre: 'Mirador de ' + q.ciudad.nombre, ang: q.a });
    }
    return { subidas, vuelta: vuelta.map(q => q.n), miradores };
  }

  // --- árboles (pinos) y rocas fuera de las ciudades, por celdas, lejos de las carreteras y del río
  function campo(azar, distCarretera, enRio) {
    const O = M.objetos, lista = [];
    for (let x = O.celda / 2; x < M.ancho; x += O.celda) for (let z = O.celda / 2; z < M.largo; z += O.celda) {
      if (TERRENO.ciudadEn(x, z) || TERRENO.tierra(x, z) < 0.6) continue;
      const n = (azar() * (O.porCelda + 1)) | 0;
      for (let k = 0; k < n; k++) {
        const px = x + (azar() - 0.5) * O.celda, pz = z + (azar() - 0.5) * O.celda;
        if (TERRENO.tierra(px, pz) < 0.6 || distCarretera(px, pz) < O.lejosDeCarretera || enRio(px, pz) || TERRENO.ciudadEn(px, pz)) continue;
        const h = TERRENO.natural(px, pz);
        if (h > M.nieve + 10) continue;
        if (h > M.roca - 20 && azar() < 0.7) lista.push({ tipo: 'roca', x: px, z: pz, radio: lerp(1.8, 4.2, azar()), alto: lerp(2, 5, azar()) });
        else lista.push({ tipo: 'pino', x: px, z: pz, radio: lerp(1.6, 2.6, azar()), alto: lerp(6, 11, azar()) });
      }
    }
    return lista;
  }
  return { rio, cauce, enlaces, montaña, campo, suaviza };
})();
