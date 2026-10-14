// Fans of Karts · MUNDO 4 · SELVA DE LOS BUGS: aquí viven todos los bugs que Microblizz no ha arreglado, y ya son del tamaño de un
// kart. Camino de tierra entre árboles enormes, barro, setas, bichos gigantes que cruzan y un río que hay que saltar. Muy difícil.
'use strict';

PISTAS.push({
  id: 'selva', mundo: 4, nombre: 'Selva de los Bugs', lema: 'Cada bug sin arreglar acaba aquí. Y crecen. Y se reproducen.', dificultad: 3, musica: 'boss2', color: '#2f9a4a', polvo: '#6a5a3a',
  puntos: [[512, 890], [330, 880], [200, 800], [220, 660], [120, 560], [150, 400], [280, 330], [230, 190], [380, 120], [520, 200], [470, 340], [590, 430], [710, 350], [700, 210],
    [800, 120], [910, 220], [895, 390], [790, 490], [810, 620], [920, 690], [880, 830], [700, 890]],
  ancho: 62, margen: 30, borde: 'muro',
  tramos: [{ deU: 10.2, aU: 12.4, ancho: 54, suave: 0.03 }],
  lejos: ['#1a4a2a', '#184426'],
  atajos: [[6.11, 10.08, 22]],
  tema: (() => {
    const [t1, t2, t3, raiz, borde, k1, k2, h1, h2, h3, mu1, mu2, mu3, f1, f2, ag1, ag2] = C32('#8a6a44', '#80623e', '#94744c', '#5a4028', '#4a6a2a', '#c35cff', '#5ef27a', '#3a8a3a', '#348034', '#46a046', '#1f5a2a', '#2a6a32', '#174a22', '#1a4a2a', '#184426', '#3a8ab0', '#4a9ac0');
    const hierba = grano([h1, h1, h2, h3]);
    return {
      pista: (x, y, m) => {
        if (m > -2.5) return borde;
        if (Math.abs(Math.sin(x / 17) * 9 + Math.cos(y / 23) * 7) < 0.6 && ruido(x >> 3, y >> 3) < 0.35) return raiz;      // raíces que cruzan el camino
        return ruido(x >> 1, y >> 1) < 0.08 ? t3 : ruido(x, y) < 0.5 ? t1 : t2;
      },
      bordillo: (x, y, m, i) => ((i >> 1) & 1 ? k1 : k2),                                     // flores de colores chillones (bugs de textura)
      lento: (x, y) => hierba(x, y),
      muro: (x, y) => (ruido(x >> 2, y >> 2) < 0.3 ? mu3 : ruido(x >> 1, y >> 1) < 0.5 ? mu1 : mu2),    // la espesura
      vacio: (x, y) => (((x + y) >> 2) & 1 ? ag1 : ag2),                                         // el río
      fuera: (x, y) => (ruido(x >> 3, y >> 3) < 0.5 ? f1 : f2),
      atajo: (x, y) => (ruido(x >> 1, y >> 1) < 0.3 ? h2 : ruido(x, y) < 0.5 ? t2 : raiz),        // un sendero entre la maleza
    };
  })(),
  cielo: {
    colores: ['#6ab05a', '#8ac87a', '#b8e0a0', '#e8f8d0'], niebla: '#b0d8a0', filas: 13, viento: 1, semilla: 29,
    atras(x, az) {     // las copas de los árboles tapan casi todo el cielo
      for (let i = 0; i < 30; i++) elipsePx(x, az() * CIELO_W, az() * 14, 18 + az() * 20, 6 + az() * 6, i & 1 ? '#2f7a3a' : '#3a8a42');
      for (let i = 0; i < 20; i++) { const a = az() * CIELO_W; for (let j = 0; j < 20 + az() * 20; j++) rectPx(x, a + Math.sin(j / 4) * 2, j + 4, 1, 1, '#2a6a2a'); }      // lianas
    },
    delante(x, az) {   // troncos enormes, un templo con un bug gigante y helechos
      for (let i = 0; i < 14; i++) { const a = i * 73 + az() * 30, w = 6 + az() * 6; rectPx(x, a, 0, w, HZ, '#5a4630'); rectPx(x, a + 1, 0, 1, HZ, '#7a6448'); }
      rectPx(x, 600, HZ - 22, 46, 22, '#7a8a6a'); for (let k = 0; k < 4; k++) rectPx(x, 600 + k * 4, HZ - 26 - k * 4, 46 - k * 8, 4, '#8a9a7a');
      elipsePx(x, 623, HZ - 9, 9, 6, '#7a3aed'); rectPx(x, 615, HZ - 12, 3, 2, '#5ef27a'); rectPx(x, 628, HZ - 12, 3, 2, '#5ef27a');
      for (let i = 0; i < 50; i++) elipsePx(x, az() * CIELO_W, HZ - 2, 6 + az() * 8, 3 + az() * 3, i & 1 ? '#2f8a3a' : '#3fa04a');
    },
  },
  pinta(P) {
    turboEn(P, 0.5, 0); turboEn(P, 7.6, 0); turboEn(P, 13.5, 0); turboEn(P, 19.4, 0, 20);
    rampaEn(P, 15.4, 12); huecoEn(P, 15.65, 32);       // el río: se salta
    const barro = ['#5a4028', '#6a4c30', '#4a3420'], bug = ['#ff3df0', '#22e3ff', '#1c1028'];
    manchaEn(P, 2.4, 10, 12, 7, S_BARRO, barro, 1); manchaEn(P, 5.4, -10, 12, 7, S_BARRO, barro, 2); manchaEn(P, 11.0, 8, 11, 7, S_BARRO, barro, 3); manchaEn(P, 17.6, -10, 12, 7, S_BARRO, barro, 4);
    manchaEn(P, 3.8, -8, 8, 6, S_CHARCO, bug, 5); manchaEn(P, 9.2, 8, 8, 6, S_CHARCO, bug, 6); manchaEn(P, 20.4, 8, 8, 6, S_CHARCO, bug, 7);
  },
  cosas(P) {
    const l = [];
    regalosEn(P, 1.8); regalosEn(P, 8.6); regalosEn(P, 16.5);
    monedasPor(P, [[1.0, 5, 0], [3.1, 4, 10], [6.2, 4, -10], [7.9, 4, 0], [10.6, 4, 0], [12.4, 4, 10], [14.0, 4, -10], [15.58, 3, 0, 15], [18.6, 4, 0], [21.0, 5, 0]]);
    adornosPor(P, l, ['ceiba', 'helecho', 'seta', 'helecho', 'ceiba', 'seta'], 0.4, 21.6, 0.5, 10, 22, 10);
    for (const [u, a, p, f] of [[4.4, 20, 4.2, 0], [12.8, 18, 4.6, 1], [18.1, 20, 4, 3.5]]) movilEn(P, l, 'bicho', u, a, p, f, { r: 4.4, muerde: true });     // los bugs muerden
    for (const [u, lado, per, f] of [[2.0, -10, 3, 0], [2.3, 10, 3, 0.5], [14.2, 0, 3.4, 0.2], [19.0, -8, 3.2, 0.6]]) caidaEn(P, l, 'coco', u, lado, per, f, { radio: 7 });
    cartelesPor(P, l, [[['BUGS', 'CONOCIDOS: 9.999'], 0.8, 20, '#22212c', '#5ef27a'], [['NO ES UN BUG', 'ES UNA FEATURE'], 4.0, -20, '#7c3aed', '#ffffff'], [['PARCHE', 'PREVISTO: NUNCA'], 7.2, 20, '#e63946', '#ffffff'],
      [['¡SALTA!'], 15.15, 20, '#ffcb3d', '#22212c'], [['NO DAR DE', 'COMER AL BUG'], 12.0, -20, '#22212c', '#ffcb3d'], [['SOON™'], 17.2, -20, '#22212c', '#ffcb3d'], [['REPORTA', 'TU BUG'], 20.0, 20, '#2f4fae', '#ffffff'], [['¡MUERDEN!'], 4.1, 20, '#e63946', '#ffffff']]);
    return l;
  },
});
