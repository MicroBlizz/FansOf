// Fans of Rouflage · MAPA 3, EL PARKING: el sótano -2 de Microblizz. Asfalto casi liso (FÁCIL), coches aparcados para esconderse detrás,
// columnas numeradas, la rampa de rayas y la zona de aceite (DIFÍCILES). Los becarios esperan en la caseta del vigilante, tras la barrera.
// Gracia propia (EVENTOS.faros, en dibujo-parking.js): cada poco, un coche enciende los faros de golpe y alumbra un pasillo entero.
'use strict';

const PLANO_PARKING = `
##########################################
##########################################
##..................................RRRR##
##..................................RRRR##
##..................................RRRR##
##..................................RRRR##
##..................................RRRR##
##..................................RRRR##
##..................................RRRR##
##..................................RRRR##
##..................................RRRR##
##..................................RRRR##
##..................................RRRR##
##..................................RRRR##
##......................................##
##......................................##
##......................................##
##......................................##
##......................................##
##......................................##
##..............AAAAAAAA................##
##..............AAAAAAAA................##
##..............AAAAAAAA................##
##VVVVV#........AAAAAAAA................##
##VVVVVD........AAAAAAAA................##
##VVVVVD................................##
##VVVVV#................................##
##VVVVV#................................##
##VVVVV#................................##
##########################################
`;

defineMapa({
  id: 'parking', nombre: 'El parking', lema: 'Sótano -2. Escóndete entre los coches.', ancho: 84, alto: 60,
  muro: '#2b2d36', canto: '#595d6a',
  espera: 'V1', plaza: [600, 790],
  evento: { tipo: 'faros' },

  salas: salasDePlano(PLANO_PARKING, {
    '.': { nombre: 'Parking', suelo: 'asfalto', pared: 'hormigonP' },
    R: { nombre: 'La rampa', suelo: 'rampa', pared: 'hormigonP' },
    A: { nombre: 'Zona de aceite', suelo: 'aceite', pared: 'hormigonP' },
    V: { nombre: 'La caseta', suelo: 'baldosin', pared: 'cristal' },
  }),
  pasos: [{ id: 'p-caseta', x: 14, y: 48, w: 2, h: 4, suelo: 'asfalto', pared: 'hormigonP' }],
  puerta: { x: 280, y: 960, w: 40, h: 80, estilo: 'barrera' },

  muebles: listaMuebles(pon => {
    // las columnas: en rejilla, cada 240 × 240
    let n = 0;
    for (const y of [360, 600, 840]) for (const x of [280, 520, 760, 1000, 1240]) pon('columna', x, y, { v: n++ });
    // dos filas de coches mirando a la cámara (arriba) y dos de espaldas (abajo), con hueco para pasar entre ellos
    [[160, 220], [400, 220], [640, 220], [880, 220], [1120, 220], [1360, 220]].forEach(([x, y], i) => pon('coche', x, y, { v: i }));
    [[160, 470], [400, 470], [880, 470], [1120, 470], [1360, 470]].forEach(([x, y], i) => pon('coche', x, y, { v: i + 2, arriba: true }));
    [[640, 720], [880, 720], [1360, 720], [160, 720]].forEach(([x, y], i) => pon('coche', x, y, { v: i + 4 }));
    [[520, 1120], [1000, 1120], [1240, 1120], [1480, 1120]].forEach(([x, y], i) => pon('coche', x, y, { v: i + 1, arriba: true }));
    // trastos
    pon('cono', 420, 330); pon('cono', 1300, 560); pon('cono', 740, 1000); pon('bidon', 1580, 120, { v: 2 }); pon('bidon', 1610, 150, { v: 0 });
    pon('extintor', 300, 96); pon('extintor', 1100, 96); pon('parquimetro', 700, 100); pon('carretilla', 1560, 980); pon('caja', 1600, 1120, { v: 1 });
    // la caseta (80..280 × 920..1160)
    pon('escritorio', 180, 1000, { v: 0 }); pon('silla', 184, 1028); pon('papelera', 90, 1140); pon('expendedora', 110, 942, { v: 1 });
  }),

  carteles: [
    // la pared del fondo (20..80)
    { t: 'rotulo', x: 200, y: 50, w: 150, color: '#f2c230', l1: 'PLANTA -2' },
    { t: 'flecha', x: 500, y: 50, color: '#59e07a', l1: 'SALIDA', izq: true }, { t: 'flecha', x: 610, y: 50, color: '#ff4b5c', l1: 'ENTRADA', izq: true },
    { t: 'placa', x: 900, y: 50, w: 250, l1: 'MICROBLIZZ NO SE HACE RESPONSABLE DE NADA' },
    { t: 'poster', x: 1260, y: 50, color: '#7cf0ff', l1: 'TARIFA', l2: '1 ALMA / HORA' },
    { t: 'poster', x: 1500, y: 50, color: '#ff7ad8', l1: 'APARQUE', l2: 'SU FUTURO' },
    // la caseta (pared 880..920)
    { t: 'rotulo', x: 180, y: 900, w: 130, color: '#ff4b5c', l1: 'VIGILANCIA' },
  ],
  pegatinas: [
    // las líneas de las plazas, debajo de cada coche, y flechas y rodadas por el asfalto
    [160, 220, 'plaza'], [400, 220, 'plaza'], [640, 220, 'plaza'], [880, 220, 'plaza'], [1120, 220, 'plaza'], [1360, 220, 'plaza'],
    [160, 470, 'plaza'], [400, 470, 'plaza'], [640, 470, 'plaza'], [880, 470, 'plaza'], [1120, 470, 'plaza'], [1360, 470, 'plaza'],
    [640, 720, 'plaza'], [880, 720, 'plaza'], [1360, 720, 'plaza'], [160, 720, 'plaza'], [400, 720, 'plaza'], [1120, 720, 'plaza'],
    [520, 1120, 'plaza'], [1000, 1120, 'plaza'], [1240, 1120, 'plaza'], [1480, 1120, 'plaza'], [760, 1120, 'plaza'],
    [640, 580, 'flechaSuelo'], [1240, 300, 'flechaSuelo'], [880, 900, 'flechaSuelo'], [400, 900, 'flechaSuelo'],
    [700, 300, 'rodada'], [1000, 560, 'rodada'], [500, 820, 'rodada'], [1300, 1020, 'rodada'],
    [900, 660, 'papel'], [1500, 340, 'cafe'], [360, 1040, 'papel'],
  ],

  salidaCamaleones: [[600, 790], [560, 814], [640, 814], [580, 762], [620, 762], [600, 838]],
  salidaCazadores: [[140, 1080], [230, 1080]],
});
