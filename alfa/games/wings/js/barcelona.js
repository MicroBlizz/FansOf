// Fans of Wings · El plano de Barcelona (dominio, sin dibujo ni DOM): el trozo de ciudad del boceto de la tarea #99 (Eixample con la
// Sagrada Família, Glòries, Poblenou, la Vila Olímpica y la costa con el Port Olímpic), a tamaño real y en metros. Trabaja en
// coordenadas «de plano»: a a lo largo de la costa (hacia el Besòs) y b del monte hacia el mar, con la Torre Glòries en (0, 0); la
// trama de Cerdà va alineada con esos ejes (girada 45 grados respecto al norte). Los sitios salen de sus coordenadas reales
// (docs/guia/juegos/wings/BARCELONA.md dice de dónde) y las alturas de los barrios son aproximadas. aDibujo() lo pasa al mundo.
'use strict';
var WINGS = globalThis.WINGS || (globalThis.WINGS = {});
(function (A) {
  // La referencia es la Torre Glòries. Metros por grado a la latitud de Barcelona (41,4 grados).
  const REF = Object.freeze({ lat: 41.40333, lon: 2.18944 }), M_LAT = 111050, M_LON = 83502, R2 = Math.SQRT1_2;
  const aPlano = (lat, lon) => {
    const x = (lon - REF.lon) * M_LON, y = (lat - REF.lat) * M_LAT;   // x este, y norte
    return Object.freeze({ a: (x + y) * R2, b: (x - y) * R2 });
  };

  // Los sitios con sus coordenadas reales (grados) y su altura (metros).
  const SITIOS = Object.freeze({
    torreGlories: { lat: 41.40333, lon: 2.18944, alto: 144 },
    sagrada: { lat: 41.40363, lon: 2.174356, alto: 172.5 },
    arts: { lat: 41.38667, lon: 2.19611, alto: 154 },
    mapfre: { lat: 41.38778, lon: 2.19750, alto: 154 },
    glories: { lat: 41.401958, lon: 2.186117 },      // la plaza
    verdaguer: { lat: 41.399139, lon: 2.16992 },     // Diagonal con Passeig de Sant Joan
    sagrera: { lat: 41.4229333, lon: 2.1869139 },    // la Meridiana en La Sagrera
    tibidabo: { lat: 41.4225, lon: 2.11861, alto: 512 },                       // la cima de Collserola
    torreCollserola: { lat: 41.41722, lon: 2.11417, alto: 288, base: 445 },    // sobre el turó de Vilana
    montjuic: { lat: 41.36342, lon: 2.16617, alto: 173 },                      // el castillo, en la cima
  });
  const P = Object.fromEntries(Object.entries(SITIOS).map(([k, s]) => [k, aPlano(s.lat, s.lon)]));

  // La trama: manzanas de 113,3 m con calles de 20 m (paso 133,3) y chaflanes de 15 m. Calle de la Marina en a = −820 y Gran Via
  // en b = −180; así la manzana (0, 0) es la de la Sagrada Família.
  const PASO = 400 / 3, CALLE = 20, MANZANA = PASO - CALLE, CHAFLAN = 15, MARINA = -820, GRAN_VIA = -180;
  const centro = (i, k) => ({ a: MARINA - PASO / 2 + i * PASO, b: GRAN_VIA - 5 * PASO - PASO / 2 + k * PASO });
  const TRAMA = Object.freeze({ i0: -9, i1: 15, k0: -6, k1: 18 });   // las manzanas del trozo

  // Las avenidas: rectas que pasan por Glòries con la dirección que dan los sitios reales; ancho total en metros.
  const dir = (p, q) => { const da = q.a - p.a, db = q.b - p.b, l = Math.hypot(da, db); return { a: da / l, b: db / l }; };
  const AVENIDAS = Object.freeze([
    { nombre: 'Diagonal', p: P.glories, d: dir(P.verdaguer, P.glories), ancho: 50 },
    { nombre: 'Meridiana', p: P.glories, d: dir(P.glories, P.sagrera), ancho: 50 },
    { nombre: 'Gran Via', p: { a: 0, b: GRAN_VIA }, d: { a: 1, b: 0 }, ancho: 24 },
  ]);
  const distRecta = (av, a, b) => Math.abs((a - av.p.a) * av.d.b - (b - av.p.b) * av.d.a);
  const enAvenida = (a, b, margen) => AVENIDAS.find((av) => distRecta(av, a, b) < av.ancho / 2 + (margen || 0)) || null;

  // La costa: playa recta (b de 1740 a 1790) con espigones cada 380 m y el Port Olímpic sobresaliendo delante de las dos torres.
  const COSTA = Object.freeze({ paseo: 1680, playa: 1740, mar: 1790, puerto: { a0: -720, a1: -300, b1: 2140 }, espigon: { cada: 380, largo: 130, ancho: 18 } });
  const RONDA = 1600;   // la Ronda del Litoral: entre las últimas manzanas y el paseo

  // Zonas aproximadas: el Eixample monte arriba de Gran Via (y al sur del Fort Pienc), Poblenou al otro lado, la Vila Olímpica y la
  // Ciutadella junto al mar, las plazas que no llevan edificios (Gaudí y Sagrada Família, a los lados del templo) y Glòries.
  const CIUTADELLA = { a0: -1612, a1: -1012, b0: 843, b1: 1323 };
  function zona(i, k) {
    const c = centro(i, k);
    if (i === 0 && k === 0) return 'templo';
    if ((i === 1 || i === -1) && k === 0) return 'plaza';
    if (Math.hypot(c.a - P.glories.a, c.b - P.glories.b) < 170) return 'plaza';
    if (c.b + MANZANA / 2 > RONDA) return 'ronda';
    if (c.a > CIUTADELLA.a0 && c.a < CIUTADELLA.a1 && c.b > CIUTADELLA.b0 && c.b < CIUTADELLA.b1) return 'parque';
    if (c.a > -1000 && c.a < -250 && c.b > 1050) return 'vila';
    if (c.b < GRAN_VIA || (c.a < -1150 && c.b < 450)) return 'eixample';
    return 'poblenou';
  }

  // Azar fijo por manzana (siempre sale la misma ciudad).
  function azar(i, k, s) {
    let h = Math.imul(i + 1000, 73856093) ^ Math.imul(k + 1000, 19349663) ^ Math.imul(s + 7, 83492791);
    return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
  }

  const PISO = 3.4;
  // Alto de un edificio por zona: plantas al azar (de min a max) más el remate.
  const PLANTAS = { eixample: [6, 8], vila: [6, 9], poblenou: [3, 6] };
  const alto = (z, rnd) => { const [lo, hi] = PLANTAS[z]; return (lo + Math.floor(rnd() * (hi - lo + 1))) * PISO + 1.2; };

  // La esquina de una manzana con su chaflán: un cuadrado de lado `fondo` sin el pico de fuera (cinco puntos).
  function esquina(c, sa, sb, fondo) {
    const H = MANZANA / 2, oa = c.a + sa * H, ob = c.b + sb * H, ia = oa - sa * fondo, ib = ob - sb * fondo, L = CHAFLAN * R2;
    return [[ia, ib], [oa, ib], [oa, ob - sb * L], [oa - sa * L, ob], [ia, ob]];
  }
  const rect = (a0, b0, a1, b1) => [[a0, b0], [a1, b0], [a1, b1], [a0, b1]];
  // Un lado de la manzana entre sus dos esquinas, partido en solares de 12 a 24 m.
  function lado(c, eje, s, fondo, rnd, fuera) {
    const H = MANZANA / 2, desde = -H + fondo, hasta = H - fondo, out = [];
    for (let p = desde; p < hasta - 1;) {
      const w = Math.min(hasta - p, 12 + rnd() * 12), q = hasta - (p + w) < 8 ? hasta : p + w;
      const borde = s * H, dentro = s * (H - fondo);
      out.push(eje === 'a' ? rect(c.a + p, c.b + Math.min(borde, dentro), c.a + q, c.b + Math.max(borde, dentro))
        : rect(c.a + Math.min(borde, dentro), c.b + p, c.a + Math.max(borde, dentro), c.b + q));
      p = q;
    }
    return out.filter((pts) => !fuera(pts));
  }
  const media = (pts) => pts.reduce((m, p) => [m[0] + p[0] / pts.length, m[1] + p[1] / pts.length], [0, 0]);

  // Lo que se quita: solares encima de una avenida, de la Torre Glòries o del puerto.
  function fuera(pts) {
    const [a, b] = media(pts);
    return !!enAvenida(a, b, 9) || Math.hypot(a - P.torreGlories.a, b - P.torreGlories.b) < 45;
  }

  // Los edificios de una manzana: { pts (polígono convexo en a, b), alto, tipo: piso | nave | torre | patio, color 0..7 }.
  function edificios(i, k) {
    const z = zona(i, k), c = centro(i, k), rnd = azar(i, k, 1), out = [];
    if (z === 'templo' || z === 'plaza' || z === 'parque' || z === 'ronda') return out;
    const pon = (pts, h, tipo) => { if (!fuera(pts)) out.push({ pts, alto: h, tipo, color: Math.floor(rnd() * 8) }); };
    if (z === 'poblenou' && rnd() < 0.35) {   // una nave industrial que ocupa casi toda la manzana
      const H = MANZANA / 2 - 3;
      pon(rect(c.a - H, c.b - H, c.a + H, c.b + H), 7 + rnd() * 6, 'nave');
      return out;
    }
    const fondo = z === 'vila' ? 18 : 24;
    for (const [sa, sb] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) pon(esquina(c, sa, sb, fondo), alto(z, rnd), 'piso');
    for (const [eje, s] of [['a', 1], ['a', -1], ['b', 1], ['b', -1]]) for (const pts of lado(c, eje, s, fondo, rnd, fuera)) out.push({ pts, alto: alto(z, rnd), tipo: 'piso', color: Math.floor(rnd() * 8) });
    const hueco = MANZANA / 2 - fondo - 4;
    if (z === 'poblenou' && rnd() < 0.3) pon(rect(c.a - 15, c.b - 15, c.a + 15, c.b + 15), 40 + Math.floor(rnd() * 14) * PISO, 'torre');   // las torres del 22@
    else if (z === 'eixample' && rnd() < 0.55) pon(rect(c.a - hueco, c.b - hueco, c.a + hueco, c.b + hueco), 4.5, 'patio');   // los bajos del interior
    return out;
  }

  // Lo lejano (sin solares, un bloque por manzana): la trama sigue hasta el pie de Collserola y a los dos lados del trozo.
  const TRAMA_LEJOS = Object.freeze({ i0: -20, i1: 28, k0: -30, k1: 18 });
  const enTrozo = (i, k) => i >= TRAMA.i0 && i <= TRAMA.i1 && k >= TRAMA.k0 && k <= TRAMA.k1;
  // Los cerros, en terrazas: la sierra de Collserola (una fila paralela a la costa con el Tibidabo como cima) y Montjuïc.
  // Las alturas de los cerros de la sierra que no son el Tibidabo son aproximadas.
  function cerros() {
    const lista = [{ nombre: 'montjuic', a: P.montjuic.a, b: P.montjuic.b, radio: 1000, alto: SITIOS.montjuic.alto }];
    for (let a = -8200; a <= 3400; a += 700) {
      const r = azar(Math.round(a / 700), 99, 3);
      lista.push({ nombre: 'collserola', a: a + r() * 200, b: P.tibidabo.b + 200 - r() * 500, radio: 700 + r() * 300, alto: 300 + r() * 160 });
    }
    lista.push({ nombre: 'tibidabo', a: P.tibidabo.a, b: P.tibidabo.b, radio: 950, alto: SITIOS.tibidabo.alto });
    lista.push({ nombre: 'vilana', a: P.torreCollserola.a, b: P.torreCollserola.b, radio: 600, alto: SITIOS.torreCollserola.base });
    return lista;
  }
  const CERROS = Object.freeze(cerros());
  // ¿Lleva bloque de ciudad esta manzana lejana? No si está en el trozo, en el mar, bajo un cerro o encima de una avenida.
  function hayLejos(i, k) {
    if (enTrozo(i, k)) return false;
    const c = centro(i, k);
    if (c.b + MANZANA / 2 > RONDA || c.b < P.tibidabo.b + 1300 || enAvenida(c.a, c.b, 30)) return false;
    return !CERROS.some((q) => Math.hypot(c.a - q.a, c.b - q.b) < q.radio + 40);
  }

  // Del plano al mundo: el caza empieza (en el origen del dominio) en el mar, delante del Port Olímpic, mirando a la ciudad (norte).
  const SALIDA = Object.freeze({ a: -500, b: 2700 });
  const aDibujo = (a, b) => [a - SALIDA.a, b - SALIDA.b];   // [x, z] de dibujo (la z de dibujo es el sur)
  const aDominio = (a, b) => ({ x: a - SALIDA.a, z: SALIDA.b - b });

  A.barcelona = Object.freeze({ REF, SITIOS, P, aPlano, PASO, CALLE, MANZANA, CHAFLAN, MARINA, GRAN_VIA, TRAMA, centro, AVENIDAS, enAvenida,
    COSTA, RONDA, CIUTADELLA, zona, edificios, media, PISO, TRAMA_LEJOS, enTrozo, CERROS, hayLejos, SALIDA, aDibujo, aDominio });
})(WINGS);
