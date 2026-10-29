// Fans Of Taxi · CIRCUITO DE PRUEBAS (?mapa=pruebas, solo en desarrollo y en la alfa): un mapa pequeño con un ejemplo de cada tipo
// de carretera, todos conectados, para probarlos sin recorrer la ciudad. Cada ESTACIÓN tiene su número, un punto de reaparición y
// un botón en el menú para ir a ella (pruebas-menu.js).
//
// El terreno: llano, con una colina suave (las cuestas) y una alta (el túnel, las horquillas y el mirador), y mar alrededor.
// Las carreteras se describen con puntos con nombre; la altura de cada nudo es la del terreno salvo en el túnel y su trinchera.
'use strict';
FUENTES.pruebas = (() => {
  const ANCHO = 1536, LARGO = 1024, BASE = 3, PROFUNDO = -8, TRAMOS_TRINCHERA = 6;
  const ANCHOS = { calle: 12, anillo: 16, montaña: 11, rampa: 12, tunel: 12 };

  // --- el terreno
  const COLINA_SUAVE = { x: 330, z: 330, radio: 300, alto: 24 };
  const COLINA_ALTA = { x: 1100, z: 330, radio: 200, alto: 42 };
  const campana = u => (u >= 1 ? 0 : (1 + Math.cos(Math.PI * u)) / 2);
  const colina = (c, x, z) => c.alto * campana(Math.hypot(x - c.x, z - c.z) / c.radio);
  const natural = (x, z) => BASE + colina(COLINA_SUAVE, x, z) + colina(COLINA_ALTA, x, z);
  const tierra = (x, z) => clamp((Math.min(x, z, ANCHO - x, LARGO - z) - 20) / 40, 0, 1);
  const terreno = { natural, tierra, ciudadEn: () => null, ciudades: [] };

  // --- las estaciones: número, nombre, dónde se reaparece y hacia dónde se mira
  const estaciones = [
    { numero: 1, nombre: 'Cruce plano', x: 200, z: 795, hacia: [200, 860] },
    { numero: 2, nombre: 'Bajada que se bifurca', x: 330, z: 400, hacia: [330, 520] },
    { numero: 3, nombre: 'Salida en mitad de una rampa', x: 390, z: 330, hacia: [480, 330] },
    { numero: 4, nombre: 'Curva con salida', x: 690, z: 860, hacia: [760, 860] },
    { numero: 5, nombre: 'Horquillas y mirador', x: 1040, z: 720, hacia: [1170, 520] },
    { numero: 6, nombre: 'Túnel con cruce', x: 825, z: 330, hacia: [880, 330] },
    { numero: 7, nombre: 'Rampa de salto y puente', x: 230, z: 860, hacia: [420, 860] },
  ];

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

    return { ciudades: [], rio, enlaces: [], monte: { subidas: [zig], vuelta: [], miradores } };
  }

  // se empieza en la estación 1
  const salida = () => ({ x: estaciones[0].x, z: estaciones[0].z, ang: anguloDe(estaciones[0]) });
  const anguloDe = e => Math.atan2(e.hacia[0] - e.x, e.hacia[1] - e.z);
  for (const e of estaciones) e.ang = anguloDe(e);

  return { nombre: 'pruebas', ancho: ANCHO, largo: LARGO, terreno, estaciones, construir, campo: () => [], salida };
})();
