// Fans of Rouflage · MAPA 5, LOS JARDINES: los jardines de la sede de Microblizz, de noche. Setos que hacen de muro, césped (FÁCIL),
// caminos de gravilla, parterres de flores y un estanque con fuente (DIFÍCILES). Los becarios esperan en la caseta del jardinero.
// Gracia propia (EVENTOS.aspersores, en dibujo-jardines.js): cada poco se encienden dos aspersores y lavan la pintura a quien pillan.
'use strict';

const PLANO_JARDINES = `
##########################################
##########################################
##GGGGGGGGCCGGGGGGGGGGGGGGCCGGGGGGGGGGGG##
##GGGGGGGGCCGGGGGGGGGGGGGGCCGGGGGGGGGGGG##
##GG####GGCCGG####FFFF####CCGG######GGGG##
##GG####GGCCGG####FFFF####CCGG######GGGG##
##GGGGGGGGCCGGGGGGFFFFGGGGCCGGGGGGGGGGGG##
##CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC##
##CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC##
##GGGGGGGGGGGG####GGGGGGGG####GGGGGGGGGG##
##GG####GGGGGG####GGEEEEGG####GGGG####GG##
##GG####GGCCGGGGGGGGEEEEGGGGGGGGGG####GG##
##GGGGGGGGCCGGGGGGGGEEEEGGGGGGGGGGCCGGGG##
##GGGGGGGGCCGG####GGEEEEGG####GGGGCCGGGG##
##FFFFGGGGCCGG####GGGGGGGG####GGGGCCFFFF##
##FFFFGGGGCCGGGGGGGGGGGGGGGGGGGGGGCCFFFF##
##GGGGGGGGCCCCCCCCCCCCCCCCCCCCCCCCCCGGGG##
##GGGGGGGGCCCCCCCCCCCCCCCCCCCCCCCCCCGGGG##
##GG####GGGGGG####GGGGGGGG####GGGG####GG##
##GG####GGGGGG####GGGGGGGG####GGGG####GG##
##GGGGGGGGGGGGGGGGGGFFFFFFGGGGGGGGGGGGGG##
##GGGGCCCCCCCCCCCCCCFFFFFFCCCCCCCCCCGGGG##
########GGGGGGGGGGGGGGGGGGGGGGGGGGCCGGGG##
##VVVVV#CCGG####GG####GG####GG####CCGGGG##
##VVVVVDCCGG####GG####GG####GG####CCGGGG##
##VVVVVDCCGGGGGGGGGGGGGGGGGGGGGGGGCCGGGG##
##VVVVV#CCGGGGGGGGGGGGGGGGGGGGGGGGCCGGGG##
##VVVVV#CCCCCCCCCCCCCCCCCCCCCCCCCCCCGGGG##
##VVVVV#GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG##
##########################################
`;

defineMapa({
  id: 'jardines', nombre: 'Los jardines', lema: 'Setos, césped y aspersores traicioneros.', ancho: 84, alto: 60,
  musica: { taller: 'rfJdTaller', caza: 'rfJdCaza', recta: 'rfJdRecta' },      // sus temas (musica-mapas.js)
  muro: '#2f5a2a', canto: '#4f8a3e',
  espera: 'V1', plaza: [800, 320],
  evento: { tipo: 'aspersores' },

  salas: salasDePlano(PLANO_JARDINES, {
    G: { nombre: 'Césped', suelo: 'cesped', pared: 'seto' },
    C: { nombre: 'Camino', suelo: 'gravilla', pared: 'seto' },
    F: { nombre: 'Parterre', suelo: 'flores', pared: 'seto' },
    E: { nombre: 'El estanque', suelo: 'estanque', pared: 'seto' },
    V: { nombre: 'Caseta del jardinero', suelo: 'tablas', pared: 'valla' },
  }),
  pasos: [{ id: 'p-caseta', x: 14, y: 48, w: 2, h: 4, suelo: 'gravilla', pared: 'valla' }],
  puerta: { x: 280, y: 960, w: 40, h: 80, estilo: 'madera' },

  muebles: listaMuebles(pon => {
    // la fuente en medio del estanque (800..960 × 400..560)
    pon('fuenteJardin', 880, 500);
    // árboles por el césped
    [[150, 150], [1500, 160], [560, 420], [1240, 420], [150, 760], [1520, 780], [700, 1130], [1200, 1130], [1500, 1000]].forEach(([x, y], i) => pon('arbol', x, y, { v: i }));
    // farolas en los cruces de los caminos
    for (const [x, y] of [[360, 290], [1100, 290], [360, 650], [1100, 650], [220, 870], [1420, 870], [700, 1070], [1200, 1070]]) pon('farola', x, y);
    // los aspersores, repartidos por el césped (los enciende el evento)
    for (const [x, y] of [[260, 300], [1340, 300], [640, 380], [1140, 560], [300, 720], [1360, 720], [560, 820], [1100, 820], [880, 1120], [1500, 520]]) pon('aspersor', x, y);
    // bancos, gnomos y trastos
    pon('banco', 620, 180); pon('banco', 1060, 180); pon('banco', 700, 620); pon('banco', 1060, 620); pon('banco', 880, 1150);
    pon('gnomo', 180, 420); pon('gnomo', 1480, 440); pon('gnomo', 1300, 1120); pon('gnomo', 480, 1130); pon('papelera', 340, 330); pon('papelera', 1120, 330); pon('carretilla', 1540, 1130);
    // la caseta del jardinero (80..280 × 920..1160)
    pon('estanteria', 180, 1150); pon('caja', 100, 1120, { v: 1 }); pon('bidon', 250, 1120, { v: 1 }); pon('cono', 120, 1030);
  }),

  carteles: [
    // el seto del fondo (pared 20..80)
    { t: 'placa', x: 300, y: 50, w: 250, l1: 'JARDINES MICROBLIZZ · HORARIO: NUNCA' },
    { t: 'poster', x: 700, y: 50, color: '#59e07a', l1: 'NO PISAR', l2: 'EL CÉSPED' },
    { t: 'flecha', x: 1000, y: 50, color: '#f2c230', l1: 'LABERINTO' },
    { t: 'poster', x: 1340, y: 50, color: '#7cf0ff', l1: 'CUIDADO', l2: 'ASPERSORES' },
    // bajo los setos de la segunda fila (pared 180..240)
    { t: 'poster', x: 240, y: 210, color: '#ff7ad8', l1: 'FLORES', l2: 'DE PLÁSTICO' },
    { t: 'poster', x: 1300, y: 210, color: '#cdb9ea', l1: 'ESTATUA', l2: 'EN OBRAS' },
  ],
  pegatinas: [
    [500, 260, 'hojas'], [1240, 260, 'hojas'], [700, 540, 'hojas'], [1180, 1000, 'hojas'], [420, 1020, 'hojas'], [1500, 640, 'hojas'],
    [240, 560, 'topo'], [1380, 560, 'topo'], [900, 1000, 'topo'],
    [600, 320, 'papel'], [1000, 1100, 'papel'], [160, 1010, 'cafe'],
  ],

  salidaCamaleones: [[800, 320], [740, 340], [860, 340], [770, 290], [830, 290], [800, 360]],
  salidaCazadores: [[140, 1080], [230, 1080]],
});
