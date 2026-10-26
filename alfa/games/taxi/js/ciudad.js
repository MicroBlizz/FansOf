// Fans Of Taxi · CIUDAD: los datos de Bahía Microblizz (prototipo: el Centro y la Madriguera). Una rejilla de manzanas con calles entre
// ellas; cada manzana tiene su barrio, sus edificios (cajas) y, si es parque, sus árboles. De aquí salen los muros contra los que se choca,
// el grafo de cruces por el que van el tráfico y la policía, y el camino de puntos hasta un destino. Sin DOM ni three: se prueba con Node.
'use strict';
const CIUDAD = (() => {
  const C = TAXI.ciudad;
  const P = C.manzana + C.calle;        // de un cruce al siguiente
  const ancho = C.nx * P + C.calle, largo = C.nz * P + C.calle;   // la ciudad entera, con la circunvalación en los bordes
  const azar = mulberry32(C.semilla);
  const r = (a, b) => a + azar() * (b - a);

  // los barrios: por columna de manzanas. Izquierda la Madriguera (parques y casas bajas), el resto el Centro (oficinas altas)
  const BARRIOS = {
    madriguera: { nombre: 'La Madriguera', colores: [0x7ee04a, 0xffb347, 0xff9fd0, 0xffe58a, 0x9be7ff], altura: [4, 9], parque: 0.45, suelo: '#3c7a3a' },
    centro: { nombre: 'Centro', colores: [0x5a7fd6, 0x8a6fe0, 0x4fc3d9, 0x6a5a86, 0x3e6fb0, 0xc46ba8], altura: [12, 38], parque: 0.08, suelo: '#5b5668' },
  };
  const barrioDe = (i, j) => (i < 3 ? 'madriguera' : 'centro');

  // una manzana: su rectángulo de choque (sin las aceras), sus edificios y sus árboles
  const manzanas = [];
  for (let i = 0; i < C.nx; i++) for (let j = 0; j < C.nz; j++) {
    const x0 = C.calle + i * P, z0 = C.calle + j * P;   // fachada a fachada
    const b = barrioDe(i, j), B = BARRIOS[b];
    const centroCiudad = i === 3 && j === 3;
    const m = { i, j, barrio: b, x0, z0, x1: x0 + C.manzana, z1: z0 + C.manzana, parque: !centroCiudad && azar() < B.parque, edificios: [], arboles: [], torre: centroCiudad };
    m.muro = { x0: x0 + C.acera, z0: z0 + C.acera, x1: m.x1 - C.acera, z1: m.z1 - C.acera };   // la acera se pisa; el edificio no
    if (m.torre) {
      m.edificios.push({ x: x0 + C.manzana / 2, z: z0 + C.manzana / 2, w: 26, d: 26, h: 90, color: 0x1d3f8a });   // la Torre Microblizz
      m.edificios.push({ x: x0 + C.manzana / 2, z: z0 + C.manzana / 2, w: 40, d: 40, h: 8, color: 0x2e8bff });
    } else if (m.parque) {
      const n = 6 + (azar() * 6) | 0;
      for (let k = 0; k < n; k++) m.arboles.push({ x: r(m.muro.x0 + 2, m.muro.x1 - 2), z: r(m.muro.z0 + 2, m.muro.z1 - 2), radio: r(1.6, 2.6), alto: r(4, 7) });
    } else {
      // dos filas de edificios pegados a la calle, con un patio en medio
      const celdas = 3, lado = (C.manzana - 2 * C.acera) / celdas;
      for (let a = 0; a < celdas; a++) for (let c = 0; c < celdas; c++) {
        if (a === 1 && c === 1 && azar() < 0.6) continue;   // patio
        const w = lado * r(0.72, 0.96), d = lado * r(0.72, 0.96);
        m.edificios.push({ x: m.muro.x0 + lado * (a + 0.5), z: m.muro.z0 + lado * (c + 0.5), w, d, h: r(B.altura[0], B.altura[1]), color: pick(B.colores) });
      }
    }
    manzanas.push(m);
  }

  // el grafo de cruces: nodo (i, j) en el centro del cruce; aristas a los cuatro vecinos
  const NX = C.nx + 1, NZ = C.nz + 1;
  const nodoXZ = (i, j) => ({ x: C.calle / 2 + i * P, z: C.calle / 2 + j * P });
  const nodoId = (i, j) => j * NX + i;
  const nodos = [];
  for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) {
    const v = [];
    if (i > 0) v.push(nodoId(i - 1, j)); if (i < NX - 1) v.push(nodoId(i + 1, j));
    if (j > 0) v.push(nodoId(i, j - 1)); if (j < NZ - 1) v.push(nodoId(i, j + 1));
    nodos.push({ id: nodoId(i, j), i, j, ...nodoXZ(i, j), vecinos: v });
  }
  const nodoCercano = (x, z) => nodos[nodoId(clamp(Math.round((x - C.calle / 2) / P), 0, NX - 1), clamp(Math.round((z - C.calle / 2) / P), 0, NZ - 1))];
  // ¿está en calle? (fuera de los muros de las manzanas)
  function enCalle(x, z) {
    if (x < 0 || z < 0 || x > ancho || z > largo) return false;
    const i = Math.floor((x - C.calle) / P), j = Math.floor((z - C.calle) / P);
    const m = manzanas[i * C.nz + j]; if (!m) return true;
    return !(x > m.muro.x0 && x < m.muro.x1 && z > m.muro.z0 && z < m.muro.z1);
  }
  const manzanaEn = (x, z) => { const i = Math.floor((x - C.calle) / P), j = Math.floor((z - C.calle) / P); return (i >= 0 && j >= 0 && i < C.nx && j < C.nz) ? manzanas[i * C.nz + j] : null; };

  // camino más corto entre cruces (anchura primero: todas las aristas miden igual, más o menos)
  function camino(desde, hasta) {
    if (desde === hasta) return [desde];
    const prev = new Map([[desde, -1]]); const cola = [desde];
    while (cola.length) {
      const n = cola.shift();
      for (const v of nodos[n].vecinos) if (!prev.has(v)) { prev.set(v, n); if (v === hasta) { const c = [hasta]; let k = hasta; while ((k = prev.get(k)) >= 0) c.unshift(k); return c; } cola.push(v); }
    }
    return [desde];
  }
  // la posición del carril derecho yendo de un cruce a otro (para el tráfico), y el punto de la acera de una calle (para los pasajeros)
  function carril(a, b, lado = 1) {
    const dx = Math.sign(b.x - a.x), dz = Math.sign(b.z - a.z);
    return { ox: -dz * C.carril * lado, oz: dx * C.carril * lado };   // a la derecha del sentido de la marcha
  }
  function puntoAcera(azarFn = Math.random) {
    // un punto al borde de una manzana que no sea la torre, sobre la acera
    const m = manzanas[(azarFn() * manzanas.length) | 0];
    const lado = (azarFn() * 4) | 0, t = 0.15 + azarFn() * 0.7, s = C.acera * 0.45;
    const x = lado === 0 ? m.x0 + s : lado === 1 ? m.x1 - s : m.x0 + C.manzana * t;
    const z = lado === 2 ? m.z0 + s : lado === 3 ? m.z1 - s : m.z0 + C.manzana * t;
    const mira = lado === 0 ? -Math.PI / 2 : lado === 1 ? Math.PI / 2 : lado === 2 ? Math.PI : 0;   // hacia la calle
    return { x, z, mira, manzana: m };
  }

  // las rampas y los escondites del prototipo (parkings donde la poli no mira)
  const rampas = [
    { x: nodoXZ(3, 0).x + C.carril, z: nodoXZ(3, 0).z + P * 0.5, ang: 0, largo: 7, ancho: 4 },        // en el Centro, hacia +z
    { x: nodoXZ(1, 5).x, z: nodoXZ(1, 5).z + P * 0.5, ang: Math.PI, largo: 7, ancho: 5 },                // en la Madriguera, hacia -z
    { x: nodoXZ(0, 3).x + P * 0.5, z: nodoXZ(0, 3).z - C.carril, ang: Math.PI / 2, largo: 7, ancho: 4 },   // circunvalación oeste, hacia +x
  ];
  const escondites = manzanas.filter(m => m.parque).slice(0, 3).map(m => ({ x: m.x0 + C.manzana / 2, z: m.z0 + C.manzana / 2, radio: 12 }));

  // todo contra lo que se choca: muros de manzana (cajas) y árboles (círculos)
  const muros = manzanas.map(m => m.muro);
  const arboles = manzanas.flatMap(m => m.arboles);

  return { P, ancho, largo, BARRIOS, manzanas, nodos, NX, NZ, nodoId, nodoXZ, nodoCercano, enCalle, manzanaEn, camino, carril, puntoAcera, rampas, escondites, muros, arboles };
})();
