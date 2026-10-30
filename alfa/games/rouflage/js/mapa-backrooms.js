// Fans of Rouflage · MAPA 2, LAS BACKROOMS: la oficina que Microblizz alquiló y nunca usó. Un laberinto de pasillos amarillos que se
// repiten, moqueta húmeda y fluorescentes que zumban, y en algún rincón algo que no debería estar ahí (una piscina, un cumpleaños sin
// invitados, un sótano de cables). El dibujo está en dibujo-backrooms.js; la cuadrícula y el resto, en mapa-datos.js.
// El plano se escribe con letras: cada carácter son 2 × 2 casillas (40 px). Casi todo es moqueta amarilla (FÁCIL de copiar con un dedo:
// un solo color ya camufla mucho); las zonas DIFÍCILES son pequeñas y están apartadas: la piscina (P), el cumpleaños (F) y los cables (C).
'use strict';

const PLANO_BACKROOMS = `
##########################################
##########################################
##........##..............##............##
##........##..............##............##
##..####..##..####..####..##..#####.....##
##..####..##..####..####..##..#####.....##
##..####........##..##........#####..##.##
##..####........##..##...............##.##
##........##....##..##..PPPPPPP..##..##.##
##........##....##..##..PPPPPPP..##.....##
##..##....##....##......PPPPPPP..##..##.##
##..##....##....##..##..PPPPPPP..##..##.##
##..##..........##..##..PPPPPPP..##..##.##
##..##....##....##..##...........##..##.##
##..##....##....##..##...........##.....##
##........##........##..####..####..##..##
##..####..############..####..####..##..##
##..####.............................##.##
##..####..##..#####..##..FFFFFF..##..##.##
##........##..#####..##..FFFFFF..##.....##
##.........................FFFF..##..##.##
#########..##..####..####...............##
#########..##..####..####..#####..##....##
##VVVVVD...##..####..####..#####..##....##
##VVVVVD...##..................##.......##
##VVVVV#...##..CCCCCCC..OOOOOO.##..####.##
##VVVVV#...##..CCCCCCC..OOOOOO.##..####.##
##VVVVV#.......CCCCCCC..OOOOOO..........##
##VVVVV########CCCCCCC..OOOOOO############
##########################################
`;

defineMapa({
  id: 'backrooms', nombre: 'Las Backrooms', lema: 'Pasillos amarillos que se repiten. No hay salida.', ancho: 84, alto: 60,
  muro: '#3a2f10', canto: '#6b561e',      // los muros vistos desde arriba: madera vieja y oscura, no la chapa de la estación
  espera: 'V1', plaza: [400, 500],
  musica: { taller: 'rfBkTaller', caza: 'rfBkCaza', recta: 'rfBkRecta' },      // sus temas (musica.js)

  salas: salasDePlano(PLANO_BACKROOMS, {
    '.': { nombre: 'Pasillo amarillo', suelo: 'moquetaBk', pared: 'amarillo' },
    P: { nombre: 'La piscina', suelo: 'piscina', pared: 'azulejoBlanco' },
    F: { nombre: 'El cumpleaños', suelo: 'confeti', pared: 'banderines' },
    C: { nombre: 'Sótano de cables', suelo: 'cables', pared: 'tuberias' },
    O: { nombre: 'La oficina vacía', suelo: 'moquetaGris', pared: 'tabique' },
    V: { nombre: 'El vestíbulo', suelo: 'linoleo', pared: 'amarillo' },
  }),
  // el único paso con puerta: la D del plano, la salida del vestíbulo (moqueta, sin el umbral de chapa de la estación)
  pasos: [{ id: 'p-vest', x: 14, y: 44, w: 2, h: 4, suelo: 'moquetaBk', pared: 'amarillo' }],
  puerta: { x: 280, y: 880, w: 40, h: 80, estilo: 'madera' },

  muebles: listaMuebles(pon => {
    // el pasillo de arriba: tres pilares en la parte derecha, un fluorescente caído y poco más
    pon('pilar', 1200, 150); pon('pilar', 1360, 150); pon('pilar', 1520, 150); pon('fluorescente', 200, 150); pon('papelera', 500, 94); pon('cono', 620, 150);
    // el centro del laberinto
    pon('fluorescente', 360, 668); pon('silla', 1300, 540); pon('fluorescente', 1480, 300); pon('cono', 300, 1000); pon('silla', 160, 300); pon('caja', 1520, 1120, { v: 1 });
    // la piscina (960..1240 × 320..520): flotadores y un banco en el borde
    pon('flotador', 1120, 480, { v: 0 }); pon('flotador', 1000, 360, { v: 1 }); pon('cono', 1210, 500);
    // el cumpleaños (1000..1240 × 720..840): la mesa de la tarta y los globos
    pon('tarta', 1120, 790); pon('globos', 1020, 780, { v: 0 }); pon('globos', 1220, 760, { v: 2 }); pon('caja', 1210, 830, { v: 2 });
    // el pasillo largo de abajo
    pon('fluorescente', 700, 876); pon('planta', 1560, 1110); pon('cono', 1000, 880); pon('papelera', 1360, 900);
    // el vestíbulo (80..280 × 880..1120): la sala de espera de los becarios
    pon('expendedora', 100, 902, { v: 1 }); pon('banco', 130, 1110); pon('banco', 230, 1110); pon('planta', 100, 1010);
    // el sótano de cables (600..880 × 1000..1160)
    pon('bobina', 650, 1060); pon('bobina', 840, 1140); pon('caja', 760, 1140, { v: 1 }); pon('cono', 700, 1020); pon('extintor', 620, 1010);
    // la oficina vacía (960..1200 × 1000..1160)
    pon('escritorio', 1060, 1080, { v: 1 }); pon('silla', 1064, 1108); pon('separador', 1120, 1040); pon('papelera', 1180, 1150); pon('fotocopiadora', 1000, 1026);
  }),

  carteles: [
    // el pasillo de arriba (pared 20..80)
    { t: 'poster', x: 240, y: 50, color: '#ff4b5c', l1: 'NO HAY SALIDA', l2: 'EN SERIO' },
    { t: 'flecha', x: 600, y: 50, color: '#59e07a', l1: 'SALIDA', izq: true }, { t: 'flecha', x: 710, y: 50, color: '#59e07a', l1: 'SALIDA' },
    { t: 'placa', x: 900, y: 50, w: 230, l1: 'OFICINA ALQUILADA EN 2019. SIN USAR' },
    { t: 'poster', x: 1260, y: 50, color: '#f2dc5a', l1: 'NIVEL 0', l2: 'DE 999' },
    { t: 'reloj', x: 1540, y: 48 },
    // debajo de los bloques de arriba (pared 180..240)
    { t: 'poster', x: 480, y: 210, color: '#7cf0ff', l1: 'LLEVAS AQUÍ', l2: '3 DÍAS' },
    { t: 'rotulo', x: 1300, y: 250, w: 150, color: '#39d5e8', l1: 'PISCINA' },
    // la pared sobre el pasillo largo del medio (640..680)
    { t: 'poster', x: 600, y: 660, color: '#f2c230', l1: 'ZONA', l2: 'HÚMEDA' },
    { t: 'poster', x: 800, y: 660, color: '#cdb9ea', l1: 'EL SILENCIO', l2: 'TE OYE' },
    { t: 'flecha', x: 1480, y: 660, color: '#59e07a', l1: 'SALIDA', izq: true },
    // el vestíbulo (pared 840..880)
    { t: 'rotulo', x: 200, y: 860, w: 120, color: '#ff4b5c', l1: 'VESTÍBULO' },
  ],
  pegatinas: [
    [300, 300, 'charco'], [900, 420, 'charco'], [1500, 620, 'charco'], [600, 900, 'charco'], [1300, 1000, 'charco'], [400, 700, 'charco'],
    [160, 620, 'moho'], [1000, 180, 'moho'], [1560, 350, 'moho'], [1000, 1000, 'moho'],
    [500, 320, 'huellas'], [1200, 900, 'huellas'], [760, 580, 'huellas'], [1400, 140, 'huellas'],
    [1100, 1080, 'papel'], [700, 460, 'papel'], [150, 1000, 'cafe'], [1060, 760, 'vela'], [1180, 740, 'vela'],
  ],

  salidaCamaleones: [[400, 508], [340, 508], [460, 508], [520, 508], [300, 508], [580, 508]],
  salidaCazadores: [[150, 1040], [220, 1040]],
});
