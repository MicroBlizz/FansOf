// Fans of Rouflage · MAPA 7, EL HOTEL: el hotel de «cinco estrellas (de cincuenta)» de Microblizz. Habitaciones de moqueta lisa y la alfombra
// roja (FÁCILES), el mármol del vestíbulo (MEDIO), la moqueta de hexágonos de los pasillos, los baños de azulejo pequeño y la piscina
// (DIFÍCILES). Los becarios esperan en la consigna. Gracia propia (EVENTOS.carrito, en dibujo-hotel.js): cada poco el carrito de la limpieza
// recorre un pasillo entero con su lucecita y aparta a quien pille en medio.
'use strict';

const PLANO_HOTEL = `
##########################################
##########################################
##HHHHBB##HHHHBB##HHHHBB##HHHHBB##QQQQQQ##
##HHHHBB##HHHHBB##HHHHBB##HHHHBB##QQQQQQ##
##HHHHHH##HHHHHH##HHHHHH##HHHHHH##QQQQQQ##
##HHHHHH##HHHHHH##HHHHHH##HHHHHH##QQQQQQ##
##HHHHHH##HHHHHH##HHHHHH##HHHHHH##QQQQQQ##
###PP######PP######PP######PP#####QQQQQQ##
##PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP##
##PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP##
##PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP##
###PP######PP######PP######PP######PP#####
##HHHHHH##HHHHHH##HHHHHH##HHHHHH##HHHHHH##
##HHHHHH##HHHHHH##HHHHHH##HHHHHH##HHHHHH##
##HHHHHH##HHHHHH##HHHHHH##HHHHHH##HHHHHH##
##HHHHBB##HHHHBB##HHHHBB##HHHHBB##HHHHBB##
##HHHHBB##HHHHBB##HHHHBB##HHHHBB##HHHHBB##
#####PP######PP######PP######PP######PP###
##PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP##
##PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP##
##PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP##
############LLLL############LLLL##########
########LLLLLLLLLLLLLLAALLLLLLLLLLLLLLLL##
##VVVVV#LLLLLLLLLLLLLLAALLLLLLLLLLLLLLLL##
##VVVVV#LLLLLLLLLLLLLLAALLLLLLLLLLLLLLLL##
##VVVVVDLLLLLLLLLLLLLLAALLLLLLLLLLLLLLLL##
##VVVVVDLLLLLLLLLLLLLLAALLLLLLLLLLLLLLLL##
##VVVVV#LLLLLLLLLLLLLLAALLLLLLLLLLLLLLLL##
##VVVVV#LLLLLLLLLLLLLLAALLLLLLLLLLLLLLLL##
##########################################
`;

const HAB_ARRIBA = [80, 400, 720, 1040], HAB_ABAJO = [80, 400, 720, 1040, 1360];   // dónde empieza cada habitación (240 de ancho)

defineMapa({
  id: 'hotel', nombre: 'El hotel', lema: 'Cinco estrellas (de cincuenta). Cuidado con el carrito de la limpieza.', ancho: 84, alto: 60,
  muro: '#3a1f24', canto: '#7a4a3a',
  espera: 'V1', plaza: [1000, 1040],
  evento: { tipo: 'carrito', carriles: [[380, 100, 1580], [780, 100, 1580]] },

  salas: salasDePlano(PLANO_HOTEL, {
    H: { nombre: 'Habitación', suelo: 'moquetaHab', pared: 'rayasHotel' },
    B: { nombre: 'Baño', suelo: 'banoAzulejo', pared: 'azulejo' },
    P: { nombre: 'Pasillo', suelo: 'moquetaHotel', pared: 'damasco' },
    Q: { nombre: 'La piscina', suelo: 'piscina', pared: 'azulejoBlanco' },
    L: { nombre: 'Vestíbulo', suelo: 'marmol', pared: 'maderaNoble' },
    A: { nombre: 'Alfombra roja', suelo: 'alfombraRoja', pared: 'maderaNoble' },
    V: { nombre: 'La consigna', suelo: 'moquetaGris', pared: 'bloque' },
  }),
  pasos: [{ id: 'p-consigna', x: 14, y: 50, w: 2, h: 4, suelo: 'marmol', pared: 'maderaNoble' }],
  puerta: { x: 280, y: 1000, w: 40, h: 80, estilo: 'madera' },

  muebles: listaMuebles(pon => {
    // las habitaciones de arriba (y 80..280): cama contra la pared, mesilla, váter en el baño y algo por el suelo
    HAB_ARRIBA.forEach((x0, i) => {
      pon('cama', x0 + 70, 200, { v: i }); pon('mesilla', x0 + 126, 150); pon('vater', x0 + 200, 150);
      pon(i % 2 ? 'maleta' : 'sillon', x0 + 200, 268, { v: i });
    });
    // las de abajo (y 480..680): la cama a la derecha de la puerta, el baño abajo a la derecha
    HAB_ABAJO.forEach((x0, i) => {
      pon('cama', x0 + 165, 560, { v: i + 2 }); pon('mesilla', x0 + 222, 520); pon('vater', x0 + 200, 670);
      pon(i % 2 ? 'sillon' : 'maleta', x0 + 40, 650, { v: i });
    });
    // la piscina (1360..1600 × 80..320): escalera y hamaca
    pon('escalera', 1440, 128); pon('banco', 1480, 316);
    // pasillo 1 (y 320..440) y pasillo 2 (720..840): cosas pegadas a las paredes; el centro es del carrito
    pon('planta', 260, 436); pon('planta', 1000, 436); pon('extintor', 620, 330); pon('papelera', 1300, 336); pon('carroMaletas', 1550, 436); pon('maleta', 900, 436, { v: 1 });
    pon('planta', 300, 738); pon('planta', 1100, 738); pon('extintor', 1500, 730); pon('maleta', 700, 838, { v: 2 }); pon('papelera', 160, 836);
    // el vestíbulo (320..1600 × 880..1160): recepción al fondo de la alfombra, piano, sillones y plantas
    pon('mostrador', 920, 916); pon('piano', 1450, 1090); pon('sillon', 500, 1010, { v: 0 }); pon('sillon', 560, 1010, { v: 1 }); pon('sillon', 1300, 970, { v: 1 });
    pon('planta', 340, 900); pon('planta', 1580, 900); pon('planta', 340, 1150); pon('planta', 1580, 1150); pon('carroMaletas', 1100, 1140); pon('maleta', 700, 1120, { v: 0 });
    // la consigna (80..280 × 920..1160)
    pon('escritorio', 180, 1010, { v: 0 }); pon('silla', 184, 1038); pon('banco', 180, 1150);
  }),

  carteles: [
    // dentro de las habitaciones: un cuadro en cada una
    ...HAB_ARRIBA.map((x0, i) => ({ t: 'cuadro', x: x0 + 90, y: 50, v: i })),
    ...HAB_ABAJO.map((x0, i) => ({ t: 'cuadro', x: x0 + 190, y: 460, v: i + 1 })),
    // pasillo 1: los números de las habitaciones de arriba y cuadros entre puertas
    ...HAB_ARRIBA.map((x0, i) => ({ t: 'numHab', x: x0 + 150, y: 300, n: 101 + i })),
    { t: 'cuadro', x: 380, y: 300, v: 2 }, { t: 'cuadro', x: 700, y: 300, v: 0 }, { t: 'cuadro', x: 1020, y: 300, v: 1 },
    // la piscina
    { t: 'rotulo', x: 1480, y: 50, w: 150, color: '#39d5e8', l1: 'PISCINA' },
    // pasillo 2: los números de las habitaciones de abajo
    ...HAB_ABAJO.map((x0, i) => ({ t: 'numHab', x: x0 + 90, y: 700, n: 201 + i })),
    // el vestíbulo
    { t: 'ascensor', x: 400, y: 862, piso: '13' }, { t: 'cuadro', x: 720, y: 860, v: 1 }, { t: 'rotulo', x: 920, y: 860, w: 140, color: '#e0b84a', l1: 'RECEPCIÓN' },
    { t: 'cuadro', x: 1060, y: 860, v: 0 }, { t: 'ascensor', x: 1330, y: 862, piso: '-1' }, { t: 'placa', x: 1490, y: 860, w: 190, l1: '5 ESTRELLAS (DE 50)' },
    // la consigna
    { t: 'rotulo', x: 180, y: 890, w: 140, color: '#ff4b5c', l1: 'SEGURIDAD' },
  ],
  pegatinas: [
    [300, 120, 'toalla'], [600, 140, 'toalla'], [1420, 300, 'toalla'], [1560, 300, 'charco'], [1590, 200, 'toalla'],
    [500, 380, 'cafe'], [1200, 410, 'papel'], [400, 790, 'papel'], [1350, 760, 'cafe'], [1150, 640, 'toalla'], [460, 640, 'bombon'],
    [1000, 1100, 'papel'], [620, 940, 'bombon'], [1250, 1100, 'cafe'],
  ],

  salidaCamaleones: [[1000, 1040], [940, 1060], [1060, 1060], [970, 1010], [1030, 1010], [1000, 1100]],
  salidaCazadores: [[140, 1080], [230, 1080]],
});
