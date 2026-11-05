// Fans of Basement · Las capas del aspecto del becario (solo pantalla, datos): cada pieza es un dibujo en píxel (filas de letras
// como en sprites.js) colocado sobre la rejilla del dibujo del becario (56×64, img/becario.png). Hay piezas del cargo (corbata,
// gafas, traje, maletín, corona), del equipo (auriculares, teclado a la espalda y silla, del color de su rareza), de la formación
// (termo o cafetera en lugar del vaso, mochila, pósits y medallas) y el arma en la mano libre (MANO, que también sirve de icono
// de las armas nuevas). Son provisionales: cuando Yoshi haga el arte, cada pieza se cambia por su PNG sin tocar el juego.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  // x, y = dónde va su esquina en la rejilla del becario; detras = se pinta antes que él; borra = tapa el vaso de café.
  const P = (x, y, filas, pal, mas) => ({ x, y, filas, pal, ...mas });
  const ancho = (f, n) => (f + '.'.repeat(n)).slice(0, n);
  const traje = ['SSSSSSSSWWWWSSSSSSSSSS', 'SSSSSSSSWWWWSSSSSSSSSS', 'SSSSSSSlWWWWlSSSSSSSSS', 'SSSSSSlSWWWWSlSSSSSSSS',
    'SSSSSSSSWWWWSSSSSSSSSS', 'SSSSSSSSWWWWSSSSSSSSSS', 'SSSSSSSSSWWSSSSSSSSSSS', 'SSSSSSSSSSSSSSSSSSSSSS', 'SSSSSSSSSSSSSSSSSSSSSS',
    'SSSSSSSSSSSBSSSSSSSSSS', 'SSSSSSSSSSSSSSSSSSSSSS', 'SSSSSSSSSSSBSSSSSSSSSS'].concat(Array(8).fill('SSSSSSSSSSSSSSSSSSSSSS'));

  const CAPA = B.capasAspecto = {
    corbata: (c) => P(25, 33, ['.TT.', '.TT.', 'TTTT', '.TT.', '.TT.', 'TTTT', 'TTTT', '.TT.'], { T: c }),
    traje: (c) => P(14, 33, traje, { S: c, l: '#00000055', W: '#ffffff', B: '#ffe14a' }),
    manga: (c) => P(6, 35, ['..SSSSSS', '.SSSSSSS', 'SSSSSSSS', 'SSSSSSSS', 'SSSSSSS.', 'SSSSSS..', 'SSSSS...', 'WWWW....'], { S: c, W: '#ffffff' }),
    mangaD: (c) => P(36, 33, ['SSSSSS..', 'SSSSSSS.', 'SSSSSSSS', '.SSSSSSS', '..SSSSSS', '...SSSWW'], { S: c, W: '#ffffff' }),
    gafas: () => P(14, 14, ['KKKKKKKKKKKKKKKKKKKKKKKK', 'KLLLLLLK........KLLLLLLK', 'KLLLLLLK........KLLLLLLK', '.KKKKKK..........KKKKKK.'], { K: '#161616', L: '#a8e8ff' }),
    gafasSol: () => P(14, 14, ['KKKKKKKKKKKKKKKKKKKKKKKK', 'KWKKKKKK........KWKKKKKK', 'KKKKKKKK........KKKKKKKK', '.KKKKKK..........KKKKKK.'], { K: '#161616', W: '#ffffff' }),
    corona: () => P(16, -9, ['Y.....Y.....Y', 'YY...YYY...YY', 'YYY.YYYYY.YYY', 'YYYYYYYYYYYYY', 'YRYYYBYBYYYRY', 'YYYYYYYYYYYYY'], { Y: '#ffd23a', R: '#e5322d', B: '#3b8de0' }),
    maletin: () => P(43, 44, ['..KKKK..', '..K..K..', 'MMMMMMMM', 'MMMMMMMM', 'MMMYYMMM', 'MMMMMMMM', 'MMMMMMMM'], { K: '#161616', M: '#6b3a1e', Y: '#ffd23a' }),
    // ---- equipo ----
    auriculares: (c) => P(-1, -3, [
      ancho('.....' + 'B'.repeat(33), 46), ancho('...BB' + '.'.repeat(35) + 'BB', 46), ancho('..B' + '.'.repeat(39) + 'B', 46),
      ancho('.B' + '.'.repeat(41) + 'B', 46), ancho('.B' + '.'.repeat(41) + 'B', 46)].concat(Array(6).fill(ancho('B' + '.'.repeat(43) + 'B', 46)), [
      'CCCC.......................................CCC', 'CCCCC......................................CCC', 'CCdCC......................................CdC', 'CCdCC......................................CdC',
      'CCdCC......................................CdC', 'CCdCC......................................CdC', 'CCCCC......................................CCC', 'CCCC.......................................CCC']), { B: '#2b2b35', C: c, d: '#ffffff' }),
    teclado: (c) => P(41, -10, Array(10).fill(['KKKKKKKK', 'KwKwKwKK']).flat().concat(['KKKKKKKK', 'KCCCCCCK', 'KKKKKKKK']), { K: '#3a3f4f', w: '#dfe6f0', C: c }, { detras: true }),
    silla: (c, trono) => {
      const fila = (b) => ancho(b.repeat(48), 48), resp = 'RRCCRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRCCRR';
      const alto = (trono ? Array(16).fill(ancho('..RRRCCRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRCCRRR', 48)) : []).concat(Array(24).fill(resp));
      const base = ['......................KKKK......................', '......................KKKK......................',
        '....KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK....', '...WWW..............WWWWWW.............WWW.....', '...WWW..............WWWWWW.............WWW.....'];
      return P(1, trono ? 6 : 22, alto.concat(Array(10).fill(fila('.')), base), { R: trono ? '#2b2b35' : '#4a4f5f', C: c, K: '#7a8090', W: '#161616' }, { detras: true });
    },
    // ---- formación ----
    termo: () => P(43, 22, ['..KKKKK..', '.SSSSSSS.', '.SSSSSSS.', '.SWSSSSS.', '.SWSSSSS.', '.SSSSSSS.', '.SSRRRSS.', '.SSSSSSS.', '.SSSSSSS.', '.SSSSSSS.', '.SSSSSSS.', '..SSSSS..'],
      { K: '#161616', S: '#9aa4b4', W: '#ffffff', R: '#e5322d' }, { borra: true }),
    cafetera: () => P(42, 22, ['...KKKKK.....', '..KKKKKKK....', '.GGGGGGGGG...', '.GCCCCCCCGKK.', '.GCCCCCCCG..K', '.GCCCCCCCG..K', '.GCCCCCCCG..K', '.GCCCCCCCGKK.', '.GGGGGGGGG...', '..KKKKKKK....', '.KKKKKKKKK...'],
      { K: '#161616', G: '#bfe9ff', C: '#6b3a1e' }, { borra: true }),
    mochila: (grande) => P(grande ? -2 : 1, grande ? 24 : 30, Array(grande ? 30 : 22).fill(grande ? 'MMMMMMMMMMMM' : 'MMMMMMMMM').map((f, i) => (i === 6 ? f.replace(/M/g, 'm') : f)),
      { M: grande ? '#c98f3d' : '#8a5a24', m: '#5a3a14' }, { detras: true }),
    postits: () => P(8, 1, ['YYY...............PPP...', 'YYY.......GGG......PPP..', 'YYY.......GGG.......PPP.', '..........GGG...........'], { Y: '#ffe14a', P: '#ff9fb0', G: '#8fe07a' }),
    medallas: () => P(16, 46, ['R..B..Y', 'Y..W..R', 'Y..W..R'], { R: '#e5322d', B: '#3b8de0', Y: '#ffd23a', W: '#ffffff' }),
  };

  // El arma en la mano libre (la izquierda del dibujo: la del vaso no se toca), con la punta hacia fuera.
  B.manoArma = {
    grapadora: P(-14, 41, ['..RRRRRRRRRRRRRR.', '.RRRRRRRRRRRRRRRR', 'RRRRRRRRRRRRRRRRr', '.rrrrrrrrrrrrrrrr', '...KKKKKKKKKKKK..', 'SSSSSSSSSSSSSSSSS', 'SSSSSSSSSSSSSSSSS'], { R: '#e5322d', r: '#a8201c', K: '#161616', S: '#b8c4d6' }),
    clips: P(-17, 38, ['.........YYYYYY...', '.........YSSSSY...', '.........YYYYYY...', 'SSSSSSSSSSSSSSSSSS', 'KSSSSSSSSSSSSSSSSS', 'SSSSSSSSSSSSSSSSSS', 'ssssssssssssssssss', '............GGG...', '............GGG...', '............GGG...', '............GGG...'], { S: '#c8d2e0', s: '#8a96aa', K: '#161616', Y: '#ffd23a', G: '#3a3f4f' }),
    taladro: P(-19, 38, ['........YYYYYYYYYY', '........YYYYYYYYYY', 'GGGGGGGGYYYYYYYYYY', 'GgGgGgGGYYYYYYYYYY', 'GGGGGGGGYYYYYYYYYY', '........YYYYYYYYYY', '............KKKK..', '............KKKK..', '............KKKK..', '...........YYYYYY.', '...........YYYYYY.'], { Y: '#ffc21a', G: '#9aa4b4', g: '#5a6478', K: '#161616' }),
    extintor: P(-9, 30, ['...KKKKKK..', '..KK...K...', '.K...RRRR..', 'K...RRRRRR.', 'K..RRRRRRRR', '...RRRRRRRR', '...RWWWWWWR', '...RWKKKKWR', '...RWWWWWWR'].concat(Array(9).fill('...RRRRRRRR'), ['....RRRRRR.']), { K: '#161616', R: '#e5322d', W: '#ffffff' }),
    raton: P(-15, 39, ['.....WWWWWWW.......', '...WWWWKWWWWW......', '..WWWWWKWWWWWW.....', '.WWWWWWKWWWWWWW....', '.WWWWWWWWWWWWWWLLL.', '.WWWWWWWWWWWWWW...L', '.WWWWWWWWWWWWWW...L', '..WWWWWWWWWWWW....L', '...WWWWWWWWWW......', '.....WWWWWW........'], { W: '#eef2f8', K: '#161616', L: '#ff3b2d' }),
    cinta: P(-12, 39, ['....TTTTTT....', '..TTttttttTT..', '.TTt......tTT.', '.Tt........tT.', '.Tt........tT.', '.TTt......tTT.', 'GGTTttttttTTGG', 'GGGGGGGGGGGGGG', 'GGGGGGGGGGGGGG'], { T: '#e8d9a8', t: '#bfa96a', G: '#5a6478' }),
    perforadora: P(-12, 42, ['..KKKKKKKKKKK.', '.KKKKKKKKKKKKK', '...SS.....SS..', 'SSSSSSSSSSSSSS', 'SSsSSSSSSSsSSS', 'SSSSSSSSSSSSSS'], { K: '#3a3f4f', S: '#9aa4b4', s: '#161616' }),
    abrecartas: P(-15, 45, ['.SSSSSSSSSSSSYYYYYY', 'SSSSSSSSSSSSSYyYyYY', '.sssssssssssSYYYYYY'], { S: '#e0e6ee', s: '#9aa4b4', Y: '#ffd23a', y: '#c8901a' }),
    boli: P(-13, 45, ['..BBBBBBCBBBBWWKK', 'SSBBBBBBBBBBBWWKK', '..BBBBBBBBBBBWWKK'], { B: '#3b5bdb', C: '#c8d2e0', W: '#ffffff', K: '#3a3f4f', S: '#c8d2e0' }),
    impresora: P(-15, 40, ['....SSSSSSSSSS', '....SKKKKKKKKS', 'WWWWSSSSSSSSSS', 'WggWSSSSSSGSSS', 'WWWWSSSSSSSSSS', '....SSSSSSSSSS', '....dddddddddd'], { S: '#d0d8e4', K: '#3a3f4f', W: '#ffffff', g: '#9fb0c8', G: '#5fe05f', d: '#8a97ab' }),
    trituradora: P(-15, 40, ['..SSSSSSSSSSSS', '..SKKKKKKKKKKS', 'WWSSSSSSSSSSSS', 'W.SSSSSSRSSSSS', 'WWSSSSSSSSSSSS', '.W.SSSSSSSSSSS', 'W.W.ddddddddd.'], { S: '#6a7080', K: '#22242c', W: '#ffffff', R: '#ff3b2d', d: '#3a3f4f' }),
    router: P(-12, 40, ['.K......K.....', '.K......K.....', '.K......K.....', 'KKKKKKKKKKKKKK', 'KGKGKGKKKKKKKK', 'KKKKKKKKKKKKKK'], { K: '#4a4f5f', G: '#5fe05f' }),
    laser: P(-15, 45, ['......KKKKKKSKKK', 'R.R.RRKKKKKKSKKK', '......KKKKKKSKKK'], { R: '#ff3b2d', K: '#4a4f5f', S: '#c8d2e0' }),
    sello: P(-8, 38, ['....MMMM....', '...MMMMMM...', '....MMMM....', '.....MM.....', '.....MM.....', 'MMMMMMMMMMMM', 'RRRRRRRRRRRR'], { M: '#8a5a24', R: '#e5322d' }),
    proyector: P(-16, 41, ['Y.....SSSSSSSSS', 'YY..LLSSSSSSSSS', 'YYYLLLSSSKKSSSS', 'YY..LLSSSSSSSSS', 'Y.....SSSSSSSSS', '.......d.....d.'], { Y: '#fff3a0', L: '#3b8de0', S: '#d0d8e4', K: '#3a3f4f', d: '#5a6070' }),
    taza: P(-12, 39, ['.CC..........', 'C..C.WWWWWW..', '.C..WCCCCCCW.', '....WWWWWWWWW', '....WWWWWWW.W', '....WWWWWWWWW', '....WWWWWWW..', '.....WWWWW...'], { C: '#6b3a1e', W: '#ffd23a' }),
    industrial: P(-15, 41, ['..KKKKKKKKKKKKKKKK.', '.KKKKYKKYKKYKKKKKKK', 'KKKKKKKKKKKKKKKKKKk', '.kkkkkkkkkkkkkkkkkk', '...RRRRRRRRRRRRRR..', 'SSSSSSSSSSSSSSSSSSS', 'SSSSSSSSSSSSSSSSSSS'], { K: '#4a4f5f', k: '#22242c', Y: '#ffd23a', R: '#e5322d', S: '#9aa4b4' }),
  };

  // Las piezas del cargo, de Becario a CEO (AJ.rangos).
  const GRIS = '#5a6070', NEGRO = '#22242c', BLANCO = '#e8ecf2', ROJA = '#e5322d', AZUL = '#3b5bdb', ORO = '#ffd23a';
  const vestido = (c, corbata) => [CAPA.manga(c), CAPA.mangaD(c), CAPA.traje(c), CAPA.corbata(corbata)];
  B.cargoAspecto = [
    () => [],
    () => [CAPA.corbata(ROJA)],
    () => [CAPA.corbata(AZUL), CAPA.gafas()],
    () => [...vestido(GRIS, ROJA), CAPA.gafas()],
    () => vestido(NEGRO, ORO),
    () => [...vestido(NEGRO, ROJA), CAPA.gafasSol(), CAPA.maletin()],
    () => [...vestido(BLANCO, ORO), CAPA.gafasSol(), CAPA.corona()],
  ];
})(BAS);
