// Fans of Rouflage · MAPA 4, LAS CLOACAS: por debajo de la estación. Pasarelas de hormigón (FÁCIL) a los lados de los canales de agua verde
// (se puede meter uno, pero copiar el agua es MUY DIFÍCIL), cámaras de ladrillo (MEDIO), tuberías gordas y ratas de Ratkov. Los becarios
// esperan en la sala de bombas. Evento: cada poco sube la niebla y acorta las linternas a la mitad.
'use strict';

const PLANO_CLOACAS = `
##########################################
##########################################
##PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP##
##PPWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWPP##
##PPWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWPP##
##PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP##
##PP######PP######PPWWPP######PP######PP##
##PP######PP######PPWWPP######PP######PP##
##PP##TTTTTTTT##PPPPWWPPPP##TTTTTTTT##PP##
##PP##TTTTTTTT##PPPPWWPPPP##TTTTTTTT##PP##
##PP##TTTTTTTT##PP##WW##PP##TTTTTTTT##PP##
##PP##TTTTTTTT##PP##WW##PP##TTTTTTTT##PP##
##PPPPPPPPPPPPPPPP##WW##PPPPPPPPPPPPPPPP##
##PPPPPPPPPPPPPPPP##WW##PPPPPPPPPPPPPPPP##
##WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW##
##WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW##
##PPPPPPPPPPPPPPPP##WW##PPPPPPPPPPPPPPPP##
##PPPPPPPPPPPPPPPP##WW##PPPPPPPPPPPPPPPP##
##PP##TTTTTTTT##PP##WW##PP##TTTTTTTT##PP##
##PP##TTTTTTTT##PP##WW##PP##TTTTTTTT##PP##
##PP##TTTTTTTT##PPPPWWPPPP##TTTTTTTT##PP##
##PP##TTTTTTTT##PPPPWWPPPP##TTTTTTTT##PP##
##########PP######PPWWPP######PP######PP##
##########PP######PPWWPP######PP######PP##
##VVVVV#PPPPPPPPPPPPWWPPPPPPPPPPPPPPPPPP##
##VVVVVDPPPPPPPPPPPPWWPPPPPPPPPPPPPPPPPP##
##VVVVVDPPPPPPPPPPPPWWPPPPPPPPPPPPPPPPPP##
##VVVVV#PPPPPPPPPPPPWWPPPPPPPPPPPPPPPPPP##
##VVVVV#PPPPPPPPPPPPWWPPPPPPPPPPPPPPPPPP##
##########################################
`;

defineMapa({
  id: 'cloacas', nombre: 'Las cloacas', lema: 'Canales de agua verde, ratas y niebla. Huele a Ratkov.', ancho: 84, alto: 60,
  muro: '#2b2320', canto: '#5a3a30',
  espera: 'V1', plaza: [600, 1000],
  evento: { tipo: 'niebla' },

  salas: salasDePlano(PLANO_CLOACAS, {
    P: { nombre: 'Pasarela', suelo: 'pasarela', pared: 'ladrillo' },
    W: { nombre: 'El canal', suelo: 'aguaVerde', pared: 'ladrillo' },
    T: { nombre: 'Cámara de ladrillo', suelo: 'ladrilloSuelo', pared: 'ladrillo' },
    V: { nombre: 'Sala de bombas', suelo: 'rejilla', pared: 'tuberias' },
  }),
  pasos: [{ id: 'p-bombas', x: 14, y: 50, w: 2, h: 4, suelo: 'pasarela', pared: 'ladrillo' }],
  puerta: { x: 280, y: 1000, w: 40, h: 80, estilo: 'madera' },

  muebles: listaMuebles(pon => {
    // tubos en las paredes de los pasillos de arriba y de abajo
    for (const x of [300, 700, 1100, 1400]) pon('tubo', x, 100);
    for (const x of [500, 900, 1300]) pon('tubo', x, 980);
    // las cámaras de ladrillo: bidones, cajas, una carretilla y tubos
    pon('bidon', 300, 440, { v: 2 }); pon('bidon', 330, 448, { v: 0 }); pon('caja', 460, 460, { v: 1 }); pon('tubo', 380, 340);
    pon('bidon', 1180, 440, { v: 1 }); pon('carretilla', 1300, 460); pon('tubo', 1240, 340);
    pon('caja', 300, 840, { v: 2 }); pon('bidon', 440, 830, { v: 0 }); pon('tubo', 380, 740);
    pon('bidon', 1300, 840, { v: 2 }); pon('caja', 1160, 850, { v: 0 }); pon('tubo', 1260, 740);
    // por las pasarelas
    pon('cono', 100, 560); pon('cono', 1570, 680); pon('extintor', 720, 1000); pon('papelera', 1080, 1130); pon('bidon', 1600, 1120, { v: 1 });
    // la sala de bombas (80..280 × 960..1160)
    pon('bomba', 130, 990); pon('bomba', 230, 990); pon('banco', 180, 1130); pon('bidon', 100, 1100, { v: 2 });
  }),

  carteles: [
    { t: 'placa', x: 500, y: 50, w: 230, l1: 'COLECTOR SUR · MICROBLIZZ' },
    { t: 'poster', x: 1000, y: 50, color: '#7ee04a', l1: 'AGUA', l2: 'NO POTABLE' },
    { t: 'poster', x: 1300, y: 50, color: '#ff4b5c', l1: 'PROHIBIDO', l2: 'BAÑARSE' },
    { t: 'flecha', x: 800, y: 290, color: '#59e07a', l1: 'SUPERFICIE' },
    { t: 'poster', x: 600, y: 290, color: '#f2c230', l1: 'CUIDADO', l2: 'RATAS' },
    { t: 'poster', x: 1100, y: 690, color: '#cdb9ea', l1: 'AQUÍ VIVIÓ', l2: 'UN BECARIO' },
    { t: 'rotulo', x: 180, y: 930, w: 150, color: '#39d5e8', l1: 'BOMBAS' },
  ],
  pegatinas: [
    [200, 250, 'rata'], [1500, 250, 'rata'], [700, 530, 'rata'], [1000, 1060, 'rata'], [400, 1130, 'rata'], [1450, 920, 'rata'],
    [260, 110, 'charco'], [1200, 500, 'charco'], [600, 1050, 'charco'], [1000, 240, 'charco'], [1500, 1090, 'charco'],
    [500, 250, 'moho'], [1350, 530, 'moho'], [800, 1120, 'moho'], [160, 1060, 'moho'],
    [900, 120, 'grieta'], [300, 540, 'grieta'], [1400, 1140, 'grieta'], [1250, 240, 'huellas'], [600, 920, 'huellas'],
  ],

  salidaCamaleones: [[840, 1000], [780, 1020], [900, 1020], [810, 970], [870, 970], [840, 1060]],
  salidaCazadores: [[130, 1100], [220, 1100]],
});
