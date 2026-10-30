// Fans of Rouflage · MAPA 7, EL HOTEL: el hotel de «cinco estrellas (de cincuenta)» de Microblizz. Habitaciones de moqueta lisa y la alfombra
// roja (FÁCILES), el mármol del vestíbulo (MEDIO), la moqueta de hexágonos del pasillo, los baños de azulejo pequeño y la piscina
// (DIFÍCILES). Los becarios esperan en la consigna. Las paredes entre pasillo y habitaciones son de dos filas (se ven de frente enteras).
// Gracia propia (EVENTOS.carrito, en dibujo-hotel.js): cada poco el carrito de la limpieza recorre el pasillo con su lucecita y aparta a
// quien pille en medio.
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
###PP######PP######PP######PP#####QQQQQQ##
##PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP##
##PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP##
##PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP##
###PP######PP###PP##PP#####PP###PP##PP####
###PP######PP###PP##PP#####PP###PP##PP####
##HHHHHH##HHHHH#PP#HHHHH##HHHHH#PP#HHHHH##
##HHHHHH##HHHHH#PP#HHHHH##HHHHH#PP#HHHHH##
##HHHHHH##HHHHH#PP#HHHHH##HHHHH#PP#HHHHH##
##HHHHBB##HHHBB#PP#HHHBB##HHHBB#PP#HHHBB##
##HHHHBB##HHHBB#PP#HHHBB##HHHBB#PP#HHHBB##
################PP##############PP########
################PP##############PP########
########LLLLLLLLLLLLLLLLAALLLLLLLLLLLLLL##
##VVVVV#LLLLLLLLLLLLLLLLAALLLLLLLLLLLLLL##
##VVVVV#LLLLLLLLLLLLLLLLAALLLLLLLLLLLLLL##
##VVVVV#LLLLLLLLLLLLLLLLAALLLLLLLLLLLLLL##
##VVVVVDLLLLLLLLLLLLLLLLAALLLLLLLLLLLLLL##
##VVVVVDLLLLLLLLLLLLLLLLAALLLLLLLLLLLLLL##
##VVVVV#LLLLLLLLLLLLLLLLAALLLLLLLLLLLLLL##
##VVVVV#LLLLLLLLLLLLLLLLAALLLLLLLLLLLLLL##
##########################################
`;

// dónde empieza y acaba cada habitación, en píxeles (las de abajo son más estrechas para dejar sitio a los dos pasillos que bajan)
const HAB_ARRIBA = [[80, 320], [400, 640], [720, 960], [1040, 1280]];
const HAB_ABAJO = [[80, 320], [400, 600], [760, 960], [1040, 1240], [1400, 1600]];

defineMapa({
  id: 'hotel', nombre: 'El hotel', lema: 'Cinco estrellas (de cincuenta). Cuidado con el carrito de la limpieza.', ancho: 84, alto: 60,
  musica: { taller: 'rfHtTaller', caza: 'rfHtCaza', recta: 'rfHtRecta' },      // sus temas (musica-mapas.js)
  muro: '#3a1f24', canto: '#7a4a3a',
  espera: 'V1', plaza: [1000, 1060],
  evento: { tipo: 'carrito', carriles: [[420, 100, 1580]] },

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
    HAB_ARRIBA.forEach(([x0], i) => {
      pon('cama', x0 + 70, 200, { v: i }); pon('mesilla', x0 + 126, 150); pon('vater', x0 + 200, 150);
      pon(i % 2 ? 'maleta' : 'sillon', x0 + 200, 268, { v: i });
    });
    // las de abajo (y 560..760): puerta arriba a la izquierda, cama a su derecha, baño abajo a la derecha
    HAB_ABAJO.forEach(([x0, x1], i) => {
      const ancha = x1 - x0 >= 240;
      pon('cama', x0 + (ancha ? 165 : 140), 640, { v: i + 2 }); pon('mesilla', ancha ? x0 + 222 : x1 - 12, 600); pon('vater', x1 - 40, 750);
      pon(i % 2 ? 'sillon' : 'maleta', x0 + 40, 730, { v: i });
    });
    // la piscina (1360..1600 × 80..360): escalera y hamaca
    pon('escalera', 1440, 128); pon('banco', 1480, 356);
    // el pasillo (y 360..480): cosas pegadas a las paredes; el centro es del carrito
    pon('planta', 260, 476); pon('planta', 1000, 476); pon('extintor', 620, 370); pon('papelera', 1300, 376); pon('carroMaletas', 1560, 476); pon('maleta', 900, 476, { v: 1 });
    // el vestíbulo (320..1600 × 840..1160): la recepción al final de la alfombra, piano, sillones y plantas
    pon('mostrador', 1000, 960); pon('piano', 1450, 1100); pon('sillon', 480, 1000, { v: 0 }); pon('sillon', 540, 1000, { v: 1 }); pon('sillon', 1300, 1010, { v: 1 });
    pon('planta', 340, 872); pon('planta', 1580, 872); pon('planta', 340, 1150); pon('planta', 1580, 1150); pon('carroMaletas', 1160, 1140); pon('maleta', 700, 1120, { v: 0 });
    // la consigna (80..280 × 880..1160)
    pon('escritorio', 180, 1010, { v: 0 }); pon('silla', 184, 1038); pon('banco', 180, 1150);
  }),

  carteles: [
    // dentro de las habitaciones: un cuadro en cada una
    ...HAB_ARRIBA.map(([x0], i) => ({ t: 'cuadro', x: x0 + 90, y: 50, v: i })),
    ...HAB_ABAJO.map(([x0, x1], i) => ({ t: 'cuadro', x: x1 - 50, y: 530, v: i + 1 })),
    // el pasillo (pared 300..360): los números de las habitaciones de arriba y cuadros entre puertas
    ...HAB_ARRIBA.map(([x0], i) => ({ t: 'numHab', x: x0 + 150, y: 330, n: 101 + i })),
    { t: 'cuadro', x: 380, y: 330, v: 2 }, { t: 'cuadro', x: 700, y: 330, v: 0 }, { t: 'cuadro', x: 1020, y: 330, v: 1 },
    // la piscina
    { t: 'rotulo', x: 1480, y: 50, w: 150, color: '#39d5e8', l1: 'PISCINA' },
    // el vestíbulo (pared 780..840)
    { t: 'ascensor', x: 420, y: 812, piso: '13' }, { t: 'cuadro', x: 560, y: 808, v: 1 }, { t: 'cuadro', x: 820, y: 808, v: 2 },
    { t: 'rotulo', x: 1000, y: 806, w: 160, color: '#e0b84a', l1: 'RECEPCIÓN' }, { t: 'cuadro', x: 1180, y: 808, v: 0 },
    { t: 'ascensor', x: 1420, y: 812, piso: '-1' }, { t: 'placa', x: 1525, y: 808, w: 140, l1: '5 ESTRELLAS (DE 50)' },
    // la consigna (pared 820..880)
    { t: 'rotulo', x: 180, y: 850, w: 140, color: '#ff4b5c', l1: 'SEGURIDAD' },
  ],
  pegatinas: [
    [300, 120, 'toalla'], [600, 140, 'toalla'], [1420, 340, 'toalla'], [1580, 340, 'charco'], [1590, 200, 'toalla'],
    [500, 420, 'cafe'], [1200, 450, 'papel'], [680, 700, 'papel'], [1320, 760, 'cafe'], [1150, 700, 'toalla'], [460, 700, 'bombon'],
    [1000, 1100, 'papel'], [620, 940, 'bombon'], [1250, 1100, 'cafe'],
  ],

  salidaCamaleones: [[1000, 1060], [940, 1080], [1060, 1080], [970, 1030], [1030, 1030], [1000, 1120]],
  salidaCazadores: [[140, 1080], [230, 1080]],
});
