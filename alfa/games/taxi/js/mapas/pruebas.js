// Fans Of Taxi · CIRCUITO DE PRUEBAS (?mapa=pruebas, solo en desarrollo y en la alfa): un mapa pequeño con un ejemplo de cada tipo
// de carretera, todos conectados, para probarlos sin recorrer la ciudad. Cada ESTACIÓN tiene su número, un punto de reaparición y
// un botón en el menú para ir a ella (pruebas-menu.js).
//
// El terreno: llano, con una colina suave (las cuestas), una alta (el túnel, las horquillas y el mirador) y una ladera al este (la
// calle que la rodea sin inclinarse de lado), y mar alrededor. Las carreteras se describen con puntos con nombre; la altura de cada
// nudo es la del terreno salvo en el túnel y su trinchera. Al este, las piezas de la ciudad nueva (docs/taxi/CIUDAD-NUEVA.md):
// rotondas, plazas, el cruce en A y la calle en ladera; cada una con su estación.
'use strict';
FUENTES.pruebas = (() => {
  const ANCHO = 2176, LARGO = 1024, BASE = 3, PROFUNDO = -8, TRAMOS_TRINCHERA = 6;
  const ANCHOS = { calle: 12, anillo: 16, montaña: 11, rampa: 12, tunel: 12 };

  // --- el terreno
  const COLINA_SUAVE = { x: 330, z: 330, radio: 300, alto: 24 };
  const COLINA_ALTA = { x: 1100, z: 330, radio: 200, alto: 42 };
  const LADERA = { x: 1900, z: 200, radio: 150, alto: 60 };   // a 110 m del centro, unos 25° de pendiente
  const campana = u => (u >= 1 ? 0 : (1 + Math.cos(Math.PI * u)) / 2);
  const colina = (c, x, z) => c.alto * campana(Math.hypot(x - c.x, z - c.z) / c.radio);
  const natural = (x, z) => BASE + colina(COLINA_SUAVE, x, z) + colina(COLINA_ALTA, x, z) + colina(LADERA, x, z);
  const tierra = (x, z) => clamp((Math.min(x, z, ANCHO - x, LARGO - z) - 20) / 40, 0, 1);
  const terreno = { natural, tierra, ciudadEn: () => null, ciudades: [] };

  // --- las estaciones: número, nombre, dónde se reaparece y hacia dónde se mira
  // (las pruebas largas tienen una a cada lado; `y` solo hace falta bajo tierra, para elegir el túnel y no el suelo de encima)
  const estaciones = [
    { nombre: 'Cruce plano', x: 200, z: 795, hacia: [200, 860] },
    { nombre: 'Bajada que se bifurca', x: 330, z: 400, hacia: [330, 520] },
    { nombre: 'Bifurcación desde abajo', x: 420, z: 760, hacia: [420, 650] },
    { nombre: 'Salida en mitad de una rampa', x: 390, z: 330, hacia: [480, 330] },
    { nombre: 'Rampa desde abajo', x: 620, z: 330, hacia: [480, 330] },
    { nombre: 'Curva con salida', x: 690, z: 860, hacia: [760, 860] },
    { nombre: 'Curva desde el norte', x: 775, z: 580, hacia: [760, 660] },
    { nombre: 'Horquillas y mirador', x: 1040, z: 720, hacia: [1170, 520] },
    { nombre: 'Mirador hacia abajo', x: 1112, z: 361, hacia: [1050, 375] },
    { nombre: 'Túnel con cruce', x: 825, z: 330, hacia: [880, 330] },
    { nombre: 'Túnel desde el este', x: 1340, z: 376, hacia: [1330, 330] },
    { nombre: 'Túnel desde el norte', x: 1040, z: 71, hacia: [1100, 50] },
    { nombre: 'Cruce bajo tierra', x: 1100, z: 280, y: PROFUNDO, hacia: [1100, 330] },
    { nombre: 'Rampa de salto y puente', x: 230, z: 860, hacia: [420, 860] },
    { nombre: 'Puente y salto desde el este', x: 620, z: 860, hacia: [420, 860] },
    { nombre: 'Rotonda grande', x: 1610, z: 560, hacia: [1660, 560] },
    { nombre: 'Rotonda pequeña', x: 1684, z: 438, hacia: [1660, 316] },
    { nombre: 'Cruce en A', x: 1630, z: 300, hacia: [1580, 300] },
    { nombre: 'Cruce en A desde arriba', x: 1612, z: 170, hacia: [1500, 100] },
    { nombre: 'Plaza redonda', x: 1770, z: 560, hacia: [1855, 560] },
    { nombre: 'Plaza cuadrada', x: 1700, z: 630, hacia: [1700, 715] },
    { nombre: 'Calle en ladera', x: 1750, z: 286, hacia: [1805, 255] },
    { nombre: 'Calle en ladera desde el este', x: 2050, z: 286, hacia: [1995, 255] },
  ];
  estaciones.forEach((e, i) => { e.numero = i + 1; });

  function construir(g) {
    const nombrados = {};
    // un nudo con nombre (se crea una vez); `y` fija la altura (túnel y trinchera)
    const nudo = (nombre, x, z, extra = {}) => nombrados[nombre] || (nombrados[nombre] = g.nodo(x, z, extra));
    const une = (a, b, tipo, extra = {}) => { g.une(a, b, extra.ancho || ANCHOS[tipo], tipo); Object.assign(g.aristas[g.aristas.length - 1], extra); };
    const cadena = (lista, tipo) => { for (let i = 0; i < lista.length - 1; i++) une(lista[i], lista[i + 1], tipo); return lista; };

    // 1 · cruce plano, con brazos al oeste y al sur
    const C1 = nudo('C1', 200, 860), N1 = nudo('N1', 200, 770);
    une(C1, nudo('W1', 110, 860), 'calle'); une(C1, nudo('S1', 200, 950), 'calle'); une(C1, N1, 'calle');

    // 2 · bajada desde lo alto de la colina suave que se bifurca en dos
    const cima = nudo('cima', 330, 330), F = nudo('F', 330, 520);
    une(cima, F, 'calle');
    const L = nudo('L', 240, 650), R = nudo('R', 420, 650);
    une(F, L, 'calle'); une(F, R, 'calle'); une(L, N1, 'calle');

    // 7 · la recta del sur: rampa de salto y puente sobre el río; 4 · curva de media vuelta con una salida en su mitad
    const P1 = nudo('P1', 420, 860), P2 = nudo('P2', 640, 860);
    une(C1, P1, 'anillo', { salto: true }); une(R, P1, 'calle'); une(P1, P2, 'anillo');
    const curva = [nudo('K0', 760, 860)];
    for (let k = 1; k <= 8; k++) { const a = Math.PI / 2 - (k * Math.PI) / 8; curva.push(nudo('K' + k, 760 + Math.cos(a) * 100, 760 + Math.sin(a) * 100)); }
    une(P2, curva[0], 'anillo'); cadena(curva, 'anillo');
    const salida = cadena([curva[4], nudo('S4a', 1000, 780), nudo('S4b', 1200, 720), nudo('S4c', 1380, 560)], 'calle');

    // 3 · rampa que baja de la cima hacia el este, con una salida en su mitad
    const X3 = nudo('X3', 480, 330), E3 = nudo('E3', 650, 330);
    une(cima, X3, 'calle'); une(X3, E3, 'calle');
    const norte = cadena([X3, nudo('X3a', 560, 230), nudo('X3b', 700, 180), nudo('X3c', 900, 120)], 'calle');

    // 6 · túnel bajo la colina alta, de oeste a este, con un cruce bajo tierra y un ramal al norte; cada boca es una trinchera
    const J6 = nudo('J6', 800, 330);
    une(E3, J6, 'calle'); une(curva[8], nudo('K9', 790, 500), 'anillo'); une(nombrados.K9, J6, 'anillo');
    const trinchera = (prefijo, arriba, boca) => {   // de arriba (en la calle) a la boca (al fondo); devuelve la boca
      const tramo = [arriba];
      for (let k = 1; k <= TRAMOS_TRINCHERA; k++) {
        const t = k / TRAMOS_TRINCHERA, x = lerp(arriba.x, boca[0], t), z = lerp(arriba.z, boca[1], t);
        tramo.push(nudo(prefijo + k, x, z, { tipo: 'rampa', y: lerp(arriba.y, PROFUNDO, t), boca: k === TRAMOS_TRINCHERA }));
      }
      cadena(tramo, 'rampa');
      return tramo[tramo.length - 1];
    };
    const tunel = () => ({ tipo: 'tunel', y: PROFUNDO });
    const T6o = nudo('T6o', 870, 330, { tipo: 'rampa', y: natural(870, 330) });
    const T6e = nudo('T6e', 1330, 330, { tipo: 'rampa', y: natural(1330, 330) });
    const T6n = nudo('T6n', 1100, 50, { tipo: 'rampa', y: natural(1100, 50) });
    une(J6, T6o, 'calle'); une(T6e, salida[salida.length - 1], 'calle'); une(T6n, norte[norte.length - 1], 'calle');
    const bocaO = trinchera('BO', T6o, [970, 330]), bocaE = trinchera('BE', T6e, [1230, 330]), bocaN = trinchera('BN', T6n, [1100, 150]);
    const X6 = nudo('X6', 1100, 330, tunel());
    cadena([bocaO, nudo('U1', 1035, 330, tunel()), X6, nudo('U2', 1165, 330, tunel()), bocaE], 'tunel');
    cadena([X6, nudo('U3', 1100, 235, tunel()), bocaN], 'tunel');

    // 5 · horquillas por la cara sur de la colina alta hasta un mirador en lo alto (sale de la salida de la curva)
    const zig = cadena([salida[1], nudo('Z1', 1170, 520), nudo('Z2', 1030, 470), nudo('Z3', 1165, 420), nudo('Z4', 1050, 375)], 'montaña');
    const alto = natural(1115, 360), M = nudo('M', 1115, 360, { tipo: 'mirador', y: alto });
    une(zig[zig.length - 1], M, 'mirador', { ancho: 28 });
    const miradores = [{ x: M.x, z: M.z, y: alto, radio: 14, nodo: M, ciudad: null, nombre: 'Mirador de Pruebas', ang: -Math.PI / 2 }];

    // el río que pasa bajo la recta del sur
    const rio = [];
    for (let z = 600; z <= LARGO + 40; z += 40) rio.push({ x: 530 + 12 * Math.sin(z / 70), z, ancho: 24, y: BASE - 5 });

    piezasDelEste(nudo, une, cadena, nombrados.S4c);
    return { ciudades: [], rio, enlaces: [], monte: { subidas: [zig], vuelta: [], miradores } };
  }

  // --- las piezas de la ciudad nueva, al este. Rotondas y plazas redondas son un anillo de tramos rectos (girando poco en cada nudo,
  // así van en inglete); cada calle que llega se une a un nudo del anillo, que pasa a ser un cruce
  const RONDA = {
    grande: { x: 1700, z: 560, radio: 40, lados: 12, ancho: 14 },
    pequeña: { x: 1660, z: 300, radio: 16, lados: 8, ancho: 9 },
    plaza: { x: 1900, z: 560, radio: 45, lados: 12, ancho: 12 },
  };
  const PLAZA_CUADRADA = { x: 1700, z: 760, lado: 90 };
  const RADIO_LADERA = 110;   // la calle que rodea la ladera va a esta distancia de su centro: siempre a la misma altura

  // el anillo; devuelve sus nudos por rumbo: e (este), s (sur, +z), o (oeste), n (norte)
  function anillo(prefijo, r, nudo, une) {
    const lista = [];
    for (let k = 0; k < r.lados; k++) { const a = (k / r.lados) * Math.PI * 2; lista.push(nudo(prefijo + k, r.x + Math.cos(a) * r.radio, r.z + Math.sin(a) * r.radio)); }
    lista.forEach((n, k) => une(n, lista[(k + 1) % lista.length], 'calle', { ancho: r.ancho }));
    const cuarto = r.lados / 4;
    return { e: lista[0], s: lista[cuarto], o: lista[2 * cuarto], n: lista[3 * cuarto] };
  }

  function piezasDelEste(nudo, une, cadena, S4c) {
    const grande = anillo('RG', RONDA.grande, nudo, une), pequeña = anillo('RP', RONDA.pequeña, nudo, une), plaza = anillo('PR', RONDA.plaza, nudo, une);

    // la recta que llega del circuito, y la rotonda grande con sus cuatro salidas
    const G0 = nudo('G0', 1600, 560);
    une(S4c, G0, 'calle'); une(G0, grande.o, 'calle');
    une(grande.n, pequeña.s, 'calle');
    une(grande.e, plaza.o, 'calle');

    // la plaza cuadrada: cuatro esquinas (giran 90°, así que son cruces) y el lado norte partido en dos para la calle que llega en T
    const { x, z, lado } = PLAZA_CUADRADA, m = lado / 2;
    const NO = nudo('QNO', x - m, z - m), NE = nudo('QNE', x + m, z - m), SE = nudo('QSE', x + m, z + m), SO = nudo('QSO', x - m, z + m);
    const QN = nudo('QN', x, z - m), QE = nudo('QE', x + m, z);
    cadena([NO, QN, NE, QE, SE, SO, NO], 'calle');
    une(grande.s, QN, 'calle');
    cadena([G0, nudo('G1', 1570, 680), SO], 'calle');

    // de la plaza redonda: al sur, una diagonal hasta la plaza cuadrada; al este, una calle que vuelve por el sur hasta su esquina
    cadena([plaza.s, nudo('PS', 1900, 700), QE], 'calle');
    const PE = nudo('PE', 2010, 560);
    une(plaza.e, PE, 'calle');
    cadena([PE, nudo('PE1', 2010, 800), nudo('PE2', 1880, 880), SE], 'calle');

    // el cruce en A: dos calles que se juntan en ángulo agudo (unos 28°) en la salida oeste de la rotonda pequeña, con un travesaño
    // entre ellas y sus pies unidos por arriba, hasta la salida norte de la rotonda
    const vertice = nudo('AV', 1580, 300), pie1 = nudo('AP1', 1420, 150), pie2 = nudo('AP2', 1500, 100);
    const medio = (p, q, nombre) => nudo(nombre, (p.x + q.x) / 2, (p.z + q.z) / 2);
    const A1 = medio(vertice, pie1, 'AM1'), A2 = medio(vertice, pie2, 'AM2');
    une(pequeña.o, vertice, 'calle');
    cadena([vertice, A1, pie1], 'calle'); cadena([vertice, A2, pie2], 'calle'); une(A1, A2, 'calle');
    cadena([pie1, pie2, nudo('N7', 1660, 200), pequeña.n], 'calle');

    // la calle en ladera: un arco a RADIO_LADERA del centro de la colina por su cara sur (de 150° a 30°), sin cuesta ni inclinación de
    // lado; sus dos extremos bajan en línea recta, ladera abajo (la única cuesta, a lo largo, ~11 %)
    const arco = [];
    for (let k = 0; k <= 8; k++) {
      const a = ((150 - k * 15) * Math.PI) / 180;
      arco.push(nudo('LA' + k, LADERA.x + Math.cos(a) * RADIO_LADERA, LADERA.z + Math.sin(a) * RADIO_LADERA));
    }
    cadena(arco, 'calle');
    const pie = (a, nombre) => nudo(nombre, LADERA.x + Math.cos(a) * 200, LADERA.z + Math.sin(a) * 200);
    cadena([pequeña.e, pie((150 * Math.PI) / 180, 'LO'), arco[0]], 'calle');
    cadena([arco[arco.length - 1], pie((30 * Math.PI) / 180, 'LE'), nudo('LE1', 2060, 450), PE], 'calle');
  }

  // árboles y rocas: en las isletas de las rotondas y en los parques de las plazas (una roca grande hace de monumento)
  function campo() {
    const lista = [], pino = (x, z) => lista.push({ tipo: 'pino', x, z, radio: 2, alto: 8 }), roca = (x, z, radio, alto) => lista.push({ tipo: 'roca', x, z, radio, alto });
    const corona = (c, r, n, fase = 0) => { for (let k = 0; k < n; k++) { const a = fase + (k / n) * Math.PI * 2; pino(c.x + Math.cos(a) * r, c.z + Math.sin(a) * r); } };
    roca(RONDA.grande.x, RONDA.grande.z, 4, 6); corona(RONDA.grande, 18, 6, 0.3);
    pino(RONDA.pequeña.x, RONDA.pequeña.z);
    roca(RONDA.plaza.x, RONDA.plaza.z, 3, 5); corona(RONDA.plaza, 22, 8, 0.2);
    for (const dx of [-22, 22]) for (const dz of [-22, 22]) pino(PLAZA_CUADRADA.x + dx, PLAZA_CUADRADA.z + dz);
    roca(PLAZA_CUADRADA.x, PLAZA_CUADRADA.z, 3, 4);
    return lista;
  }

  // se empieza en la estación 1
  const salida = () => ({ x: estaciones[0].x, z: estaciones[0].z, ang: anguloDe(estaciones[0]) });
  const anguloDe = e => Math.atan2(e.hacia[0] - e.x, e.hacia[1] - e.z);
  for (const e of estaciones) e.ang = anguloDe(e);

  return { nombre: 'pruebas', ancho: ANCHO, largo: LARGO, terreno, estaciones, construir, campo, salida };
})();
