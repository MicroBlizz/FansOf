// Fans of Rouflage · MAPA 6, LA ZONA RESIDENCIAL: la calle de los adosados de los jefes de Microblizz, de noche. Aceras y asfalto (FÁCIL),
// pasos de cebra, jardincitos, la terraza del bar con sus baldosas (DIFÍCIL) y, en cada fachada, puertas de garaje lisas (la pared más fácil
// de copiar del juego). Los becarios esperan en un garaje. Gracia propia (EVENTOS.vecino, en dibujo-residencial.js): cada poco se enciende
// una ventana, el vecino se asoma y su luz delata a quien tenga debajo.
'use strict';

const PLANO_RESIDENCIAL = `
##########################################
##########################################
##SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS#
##SS######JJJ######JJJ######JJJ######SSSS#
##SS######JJJ######JJJ######JJJ######SSSS#
##SS######JJJ######JJJ######JJJ######SSSS#
##SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS#
##CCCCCCCCCCCCCCCCPPPPCCCCCCCCCCCCCCCCCCC#
##CCCCCCCCCCCCCCCCPPPPCCCCCCCCCCCCCCCCCCC#
##CCCCCCCCCCCCCCCCPPPPCCCCCCCCCCCCCCCCCCC#
##CCCCCCCCCCCCCCCCPPPPCCCCCCCCCCCCCCCCCCC#
##SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS#
##SS######JJJTTTTTTJJJ######JJJ######SSSS#
##SS######JJJTTTTTTJJJ######JJJ######SSSS#
##SS######JJJTTTTTTJJJ######JJJ######SSSS#
##SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS#
##CCCCCCCCCCCCCCCCCCCCCCCCCCCCPPPPCCCCCCC#
##CCCCCCCCCCCCCCCCCCCCCCCCCCCCPPPPCCCCCCC#
##CCCCCCCCCCCCCCCCCCCCCCCCCCCCPPPPCCCCCCC#
##CCCCCCCCCCCCCCCCCCCCCCCCCCCCPPPPCCCCCCC#
##SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS#
##SS######JJJ######JJJ######JJJ######SSSS#
##SS######JJJ######JJJ######JJJ######SSSS#
##SS######JJJ######JJJ######JJJ######SSSS#
########SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS#
##VVVVV#CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC#
##VVVVVDCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC#
##VVVVVDCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC#
##VVVVV#CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC#
##########################################
`;

// una casa de 120 de ancho en una fachada: puerta y ventana (tipo 0) o puerta de garaje (tipo 1); `y` es el centro de la fachada
function casa(lista, x, y, tipo, n) {
  if (tipo === 0) { lista.push({ t: 'puertaCasa', x: x + 28, y: y + 4, n, color: ['#8f6a3a', '#c8403a', '#2c5f8a', '#3f8a35'][n % 4] }, { t: 'ventanaCasa', x: x + 84, y: y - 6, cortina: ['#ff7ad8', '#f2c230', '#59e07a', '#9fd6e8'][n % 4] }); }
  else lista.push({ t: 'garaje', x: x + 60, y: y - 2, v: n });
}
const CARTELES_RES = [
  // la calle de arriba (pared 20..80): carteles entre ventanas de los pisos
  { t: 'placa', x: 300, y: 50, w: 230, l1: 'URBANIZACIÓN LOS JEFES' },
  { t: 'ventanaCasa', x: 520, y: 44, cortina: '#f2c230' }, { t: 'ventanaCasa', x: 680, y: 44, cortina: '#9fd6e8' },
  { t: 'poster', x: 860, y: 50, color: '#ff4b5c', l1: 'SE VENDE', l2: 'TU ALMA' },
  { t: 'ventanaCasa', x: 1040, y: 44, cortina: '#ff7ad8' }, { t: 'flecha', x: 1220, y: 50, color: '#f2c230', l1: 'BAR' },
  { t: 'ventanaCasa', x: 1400, y: 44, cortina: '#59e07a' }, { t: 'poster', x: 1540, y: 50, color: '#7cf0ff', l1: 'VECINOS', l2: 'VIGILANTES' },
];
// las tres filas de adosados: cada bloque de 240 son dos casas
[[210, [160, 520, 880, 1240]], [570, [160, 880, 1240]], [930, [160, 520, 880, 1240]]].forEach(([y, xs], f) => xs.forEach((x, i) => { casa(CARTELES_RES, x, y, (i + f) % 2, f * 4 + i * 2 + 1); casa(CARTELES_RES, x + 120, y, (i + f + 1) % 2, f * 4 + i * 2 + 2); }));

defineMapa({
  id: 'residencial', nombre: 'La urbanización', lema: 'Adosados, coches aparcados y un vecino que lo ve todo.', ancho: 84, alto: 60,
  muro: '#4a3a3a', canto: '#8a6a5a',
  espera: 'V1', plaza: [800, 360],
  evento: { tipo: 'vecino' },

  salas: salasDePlano(PLANO_RESIDENCIAL, {
    S: { nombre: 'Acera', suelo: 'acera', pared: 'fachada' },
    C: { nombre: 'Calle', suelo: 'calle', pared: 'fachada' },
    P: { nombre: 'Paso de cebra', suelo: 'cebra', pared: 'fachada' },
    J: { nombre: 'Jardincito', suelo: 'cesped', pared: 'fachada' },
    T: { nombre: 'La terraza del bar', suelo: 'terraza', pared: 'fachada' },
    V: { nombre: 'El garaje', suelo: 'hormigon', pared: 'bloque' },
  }),
  pasos: [{ id: 'p-garaje', x: 14, y: 52, w: 2, h: 4, suelo: 'calle', pared: 'bloque' }],
  puerta: { x: 280, y: 1040, w: 40, h: 80, estilo: 'madera' },

  muebles: listaMuebles(pon => {
    // coches aparcados en las tres calles (280..440, 640..800 y 1000..1160)
    [[300, 330], [1300, 330], [560, 430], [1000, 430], [1500, 430]].forEach(([x, y], i) => pon('coche', x, y, { v: i, arriba: y < 400 }));
    [[200, 690], [1400, 690], [460, 790], [900, 790], [1560, 790]].forEach(([x, y], i) => pon('coche', x, y, { v: i + 3, arriba: y < 750 }));
    [[700, 1050], [1200, 1050], [500, 1150], [1000, 1150], [1500, 1150]].forEach(([x, y], i) => pon('coche', x, y, { v: i + 1, arriba: y < 1100 }));
    // farolas, buzones y cubos por las aceras
    for (const x of [120, 760, 1420]) { pon('farola', x, 278); pon('farola', x, 998); }
    for (const x of [420, 1060, 1560]) pon('farola', x, 638);
    pon('buzon', 440, 270); pon('buzon', 1160, 270); pon('buzon', 800, 990); pon('cubo', 1540, 272, { v: 0 }); pon('cubo', 1570, 276, { v: 1 }); pon('cubo', 120, 632, { v: 0 }); pon('cubo', 1540, 992, { v: 1 });
    pon('papelera', 980, 272); pon('papelera', 380, 632); pon('papelera', 1260, 992);
    // los jardincitos: plantas y gnomos
    for (const [x, y] of [[460, 200], [820, 200], [1180, 200], [460, 560], [1180, 560], [820, 920], [1180, 920]]) pon('planta', x, y);
    pon('gnomo', 420, 160); pon('gnomo', 1150, 520); pon('gnomo', 440, 880); pon('arbol', 1560, 180, { v: 1 }); pon('arbol', 1560, 900, { v: 2 });
    // la terraza del bar (520..760 × 480..600)
    pon('mesaBar', 580, 560); pon('mesaBar', 700, 560); pon('planta', 530, 500); pon('planta', 750, 500);
    // el garaje de los becarios (80..280 × 1000..1160)
    pon('caja', 100, 1030, { v: 1 }); pon('bidon', 250, 1030, { v: 2 }); pon('carretilla', 180, 1150); pon('estanteria', 180, 1016);
  }),

  carteles: CARTELES_RES,
  pegatinas: [
    [680, 360, 'rodada'], [1100, 720, 'rodada'], [900, 1100, 'rodada'], [1240, 380, 'charco'], [300, 760, 'charco'], [1400, 1120, 'charco'],
    [600, 260, 'hojas'], [1300, 620, 'hojas'], [700, 980, 'hojas'], [1100, 260, 'papel'], [360, 1000, 'cafe'], [1500, 620, 'papel'],
  ],

  salidaCamaleones: [[800, 360], [740, 380], [860, 380], [770, 330], [830, 330], [800, 400]],
  salidaCazadores: [[140, 1100], [230, 1100]],
});
