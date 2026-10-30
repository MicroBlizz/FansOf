// Fans of Karts · EDICIÓN PREMIUM · MUNDO 2 (Desierto, Cementerio, Minas y Estadio): los trazados nuevos de la copa premium (pista-premium.js).
// Cada una lleva el paisaje, los adornos y los carteles de su pista normal; aquí van el trazado, los saltos, los atajos y dónde va cada cosa.
// Los números los sacó un generador a partir de los dibujos de los trazados: se pueden retocar a mano.
'use strict';

pistaPremium('desierto', {
  lema: 'La recta más larga del juego. Microblizz la llama «contenido».',
  puntos: [[492, 705], [597, 597], [894, 300], [915, 180], [816, 109], [689, 95], [668, 215], [533, 236], [512, 371], [385, 385], [364, 519], [229, 540], [208, 675], [81, 703], [95, 830], [187, 908], [300, 894]],
  ancho: 76, margen: 44,
  tramos: [],
  atajos: [[2.65, 5.92, 26]],
  relieve: { arco: 'arcoDesierto', arcos: [0.18, 0.42, 0.85], filas: [], hitos: ['granCactus', 'granCraneo', 'granCactus'] },
  pinta(P) {
    turboEn(P, 0.5, 0);
    turboEn(P, 16.3, 0);
    turboEn(P, 1.28, 0);
    rampaEn(P, 7.5, 10); rampaEn(P, 8.74, 10); rampaEn(P, 9.94, 10); rampaEn(P, 11.13, 10); rampaEn(P, 12.33, 10); rampaEn(P, 13.58, 10);
    manchaEn(P, 1.22, 14, 14, 8, S_BARRO, ['#f2c88a', '#e8bc7c', '#d8a868'], 1); manchaEn(P, 2.88, -12, 14, 8, S_BARRO, ['#f2c88a', '#e8bc7c', '#d8a868'], 2); manchaEn(P, 6.33, 14, 14, 8, S_BARRO, ['#f2c88a', '#e8bc7c', '#d8a868'], 3); manchaEn(P, 6.51, -12, 14, 8, S_BARRO, ['#f2c88a', '#e8bc7c', '#d8a868'], 4); manchaEn(P, 14.66, 14, 14, 8, S_BARRO, ['#f2c88a', '#e8bc7c', '#d8a868'], 5); manchaEn(P, 16.15, -12, 14, 8, S_BARRO, ['#f2c88a', '#e8bc7c', '#d8a868'], 6);
  },
  cosas(P) {
    const l = [];
    regalosEn(P, 1.41); regalosEn(P, 6.33); regalosEn(P, 14.79);
    monedasPor(P, [[0.89, 5, 0], [2.29, 4, 0], [4.14, 5, -12], [16.3, 4, 0], [7.5, 1, 0], [8.74, 1, 0], [9.94, 1, 0], [11.13, 1, 0], [12.33, 1, 0], [13.58, 1, 0]]);
    adornosPor(P, l, ['cactus', 'cactus', 'roca', 'craneo', 'cactus', 'roca'], 0.4, 16.6, 0.6, 14, 30, 25);
    movilEn(P, l, 'rodadora', 3.19, 30, 3.6, 0.0, { r: 3 }); movilEn(P, l, 'rodadora', 6.22, 30, 4, 1.4, { r: 3 }); movilEn(P, l, 'rodadora', 15.55, 30, 4.4, 2.8, { r: 3 });
    cartelesPor(P, l, [[['MAPA', '100 KM²'], 1.26, 24, '#22212c', '#ffcb3d'], [['NADA QUE', 'HACER: 99 KM'], 2.4, -24, '#b86a3a', '#ffffff'], [['MISIÓN', 'SECUNDARIA ?'], 5.21, 24, '#ffcb3d', '#22212c'], [['OASIS', '(DLC)'], 6.37, -24, '#22b8f0', '#ffffff'], [['GASOLINERA', 'CERRADA'], 14.76, 24, '#e63946', '#ffffff'], [['ESPEJISMO', 'PREMIUM'], 14.81, -24, '#22212c', '#5ef2d0'], [['PREMIUM'], 16.03, 24, '#ffcb3d', '#22212c']]);
    return l;
  },
});

pistaPremium('cementerio', {
  lema: 'Una cruz gigante para todos los juegos cancelados este año. Hubo que hacerla grande.',
  puntos: [[382, 140], [382, 382], [140, 382], [140, 642], [382, 642], [382, 884], [642, 884], [642, 642], [884, 642], [884, 382], [642, 382], [642, 140], [512, 140]],
  ancho: 62, margen: 36,
  tramos: [],
  atajos: [[6.23, 7.76, 24], [3.25, 4.79, 24]],
  relieve: { arco: 'arcoCementerio', arcos: [0.18, 0.5, 0.82], filas: [], hitos: ['granLapida', 'granLapida'] },
  pinta(P) {
    turboEn(P, 0.5, 0);
    turboEn(P, 1.99, 0);
    turboEn(P, 7.99, 0);
    manchaEn(P, 1.12, 14, 12, 7, S_BARRO, ['#4a3626', '#5a4430', '#3a2a1c'], 1); manchaEn(P, 3.07, -12, 12, 7, S_BARRO, ['#4a3626', '#5a4430', '#3a2a1c'], 2); manchaEn(P, 5.1, 14, 12, 7, S_BARRO, ['#4a3626', '#5a4430', '#3a2a1c'], 3); manchaEn(P, 7.06, -12, 12, 7, S_BARRO, ['#4a3626', '#5a4430', '#3a2a1c'], 4); manchaEn(P, 9.01, 14, 12, 7, S_BARRO, ['#4a3626', '#5a4430', '#3a2a1c'], 5); manchaEn(P, 11.11, -12, 12, 7, S_BARRO, ['#4a3626', '#5a4430', '#3a2a1c'], 6);
  },
  cosas(P) {
    const l = [];
    regalosEn(P, 1.49); regalosEn(P, 5.44); regalosEn(P, 9.38);
    monedasPor(P, [[0.62, 5, 0], [2.74, 4, 0], [3.8, 5, -12], [4.89, 4, 0], [5.9, 4, 12], [6.97, 5, 0], [8.06, 4, -12], [9.06, 4, 0], [10.15, 5, 12], [11.44, 4, 0]]);
    adornosPor(P, l, ['lapida', 'lapida', 'cruz', 'arbol', 'farol', 'lapida'], 0.4, 12.6, 0.42, 12, 22, 26);
    movilEn(P, l, 'fantasma', 3.26, 22, 4.32, 0.0, { flota: 4, r: 0 }); movilEn(P, l, 'fantasma', 6.88, 22, 4.8, 1.4, { flota: 4, r: 0 }); movilEn(P, l, 'fantasma', 10.62, 22, 5.28, 2.8, { flota: 4, r: 0 });
    cartelesPor(P, l, [[['AQUÍ YACE', 'TU JUEGO'], 1.21, 24, '#2a2438', '#e8e2d0'], [['RIP'], 2.8, -24, '#2a2438', '#5ef2d0'], [['SECUELA', 'CANCELADA'], 4.44, 24, '#e63946', '#ffffff'], [['SERVIDORES', 'APAGADOS'], 6.01, -24, '#2a2438', '#ff8a1f'], [['NO PISAR', 'LOS JUEGOS'], 7.67, 24, '#2a2438', '#e8e2d0'], [['RIP'], 9.24, -24, '#2a2438', '#5ef2d0'], [['PREMIUM'], 10.91, 24, '#ffcb3d', '#22212c']]);
    return l;
  },
});

pistaPremium('minas', {
  lema: 'Bajar, subir, bajar. El grind de verdad, ahora con ascensor de pago.',
  puntos: [[900, 455], [900, 210], [860, 125], [790, 110], [745, 180], [740, 500], [740, 680], [700, 770], [640, 795], [580, 770], [540, 680], [540, 400], [540, 250], [500, 160], [440, 140], [380, 160], [340, 250], [340, 500], [340, 680], [300, 770], [220, 795], [150, 830], [180, 905], [400, 915], [700, 915], [860, 905], [900, 860], [900, 500]],
  ancho: 60, margen: 22,
  tramos: [],
  relieve: { arco: 'arcoMinas', arcos: [0.18, 0.5, 0.87], filas: [], hitos: ['granGema', 'granGema'] },
  pinta(P) {
    turboEn(P, 0.5, 0);
    turboEn(P, 26.13, 0);
    turboEn(P, 22.52, 0);
    turboEn(P, 4.19, 0);
    rampaEn(P, 23.12, 10); rampaEn(P, 23.53, 10); rampaEn(P, 23.94, 10);
    manchaEn(P, 2.32, 14, 8, 6, S_CHARCO, ['#3a3a48', '#2a2a38', '#5a5a70'], 1); manchaEn(P, 6.29, -12, 8, 6, S_CHARCO, ['#3a3a48', '#2a2a38', '#5a5a70'], 2); manchaEn(P, 11.56, 14, 8, 6, S_CHARCO, ['#3a3a48', '#2a2a38', '#5a5a70'], 3); manchaEn(P, 17.13, -12, 8, 6, S_CHARCO, ['#3a3a48', '#2a2a38', '#5a5a70'], 4); manchaEn(P, 22.6, 14, 8, 6, S_CHARCO, ['#3a3a48', '#2a2a38', '#5a5a70'], 5); manchaEn(P, 26.19, -12, 8, 6, S_CHARCO, ['#3a3a48', '#2a2a38', '#5a5a70'], 6);
  },
  cosas(P) {
    const l = [];
    regalosEn(P, 3.78); regalosEn(P, 12.56); regalosEn(P, 22.49);
    monedasPor(P, [[0.83, 5, 0], [5.51, 4, 0], [9.34, 5, -12], [11.07, 4, 0], [14.81, 4, 12], [16.98, 5, 0], [19.84, 4, -12], [26.36, 4, 0], [23.12, 1, 0], [23.53, 1, 0], [23.94, 1, 0]]);
    adornosPor(P, l, ['viga', 'gema', 'dinamita', 'viga', 'gema'], 0.4, 27.6, 0.55, 8, 16, 27);
    movilEn(P, l, 'vagoneta', 6.9, 18, 3.24, 0.0, { r: 4.2 }); movilEn(P, l, 'vagoneta', 16.85, 18, 3.6, 1.4, { r: 4.2 }); movilEn(P, l, 'vagoneta', 25.04, 18, 3.96, 2.8, { r: 4.2 });
    for (const [u, lado, per, f] of [[4.95, -10, 3.2, 0], [15.28, 10, 3.4, 0.5], [19.55, 0, 3.6, 0.25], [26.47, -8, 3.3, 0.7]]) caidaEn(P, l, 'pedrusco', u, lado, per, f, { radio: 9 });
    cartelesPor(P, l, [[['NIVEL 1', 'DE 500'], 2.25, 24, '#22212c', '#ffcb3d'], [['XP X 0,01'], 5.06, -24, '#22212c', '#5ef27a'], [['MINA DEL', 'PASE DE BATALLA'], 9.73, 24, '#7c3aed', '#ffffff'], [['FARMEO', 'OBLIGATORIO'], 12.2, -24, '#22212c', '#ffcb3d'], [['ORO PARA', 'EL CEO'], 16.66, 24, '#e63946', '#ffffff'], [['¡DERRUMBES!'], 20.35, -24, '#ffcb3d', '#22212c'], [['TÚNEL', 'VIEJO'], 22.52, 24, '#22212c', '#ffcb3d'], [['PREMIUM'], 26.15, -24, '#ffcb3d', '#22212c']]);
    return l;
  },
});

pistaPremium('estadio', {
  lema: 'Un óvalo de verdad: todo a la izquierda. El premio se paga en criptomonedas de Microblizz.',
  puntos: [[443, 188], [260, 190], [140, 280], [120, 512], [140, 740], [260, 830], [400, 830], [460, 760], [560, 760], [620, 830], [760, 830], [880, 740], [900, 512], [880, 280], [760, 190], [512, 190]],
  ancho: 70, margen: 34,
  tramos: [],
  atajos: [[5.84, 9.04, 26]],
  relieve: { arco: 'arcoEstadio', arcos: [0.18, 0.52, 0.82], filas: [['foco', 0.7, 0.76, 40, 14], ['altavoz', 0.19, 0.25, 26, 10]], hitos: ['granCopa'] },
  pinta(P) {
    turboEn(P, 0.5, 0);
    turboEn(P, 2.46, 0);
    turboEn(P, 11.54, 0);
    turboEn(P, 14.43, 0);
    rampaEn(P, 5.65, 10); rampaEn(P, 7.13, 10);
    manchaEn(P, 1.34, 14, 9, 6, S_CHARCO, ['#5ef27a', '#c0ff60', '#2f9a4a'], 1); manchaEn(P, 3.42, -12, 9, 6, S_CHARCO, ['#5ef27a', '#c0ff60', '#2f9a4a'], 2); manchaEn(P, 4.71, 14, 9, 6, S_CHARCO, ['#5ef27a', '#c0ff60', '#2f9a4a'], 3); manchaEn(P, 10.02, -12, 9, 6, S_CHARCO, ['#5ef27a', '#c0ff60', '#2f9a4a'], 4); manchaEn(P, 12.22, 14, 9, 6, S_CHARCO, ['#5ef27a', '#c0ff60', '#2f9a4a'], 5); manchaEn(P, 14.38, -12, 9, 6, S_CHARCO, ['#5ef27a', '#c0ff60', '#2f9a4a'], 6);
  },
  cosas(P) {
    const l = [];
    regalosEn(P, 1.85); regalosEn(P, 8.79); regalosEn(P, 12.56);
    monedasPor(P, [[0.71, 5, 0], [3.09, 4, 0], [4.14, 5, -12], [9.89, 5, 0], [11.27, 4, -12], [12.27, 4, 0], [13.38, 5, 12], [14.54, 4, 0], [5.65, 1, 0], [7.13, 1, 0]]);
    adornosPor(P, l, ['foco', 'altavoz', 'camaratv', 'copa', 'altavoz'], 0.4, 15.6, 0.6, 12, 22, 28);
    movilEn(P, l, 'camaratv', 3.59, 20, 4.14, 0.0); movilEn(P, l, 'camaratv', 9.75, 20, 4.6, 1.4); movilEn(P, l, 'camaratv', 14.01, 20, 5.06, 2.8);
    for (const [u, lado, per, f] of [[2.79, -10, 3.2, 0], [8.67, 10, 3.4, 0.5], [11.2, 0, 3.6, 0.25], [14.64, -8, 3.3, 0.7]]) caidaEn(P, l, 'balon', u, lado, per, f, { radio: 9, alto: 64 });
    cartelesPor(P, l, [[['GRAN FINAL'], 1.65, 24, '#22212c', '#22e3ff'], [['PATROCINA:', 'MICROBLIZZ'], 3.53, -24, '#e63946', '#ffffff'], [['CHICANE', 'ENERGY+'], 4.64, 24, '#5ef27a', '#22212c'], [['PREMIO: XP', 'NO CANJEABLE'], 9.9, -24, '#22212c', '#ffcb3d'], [['PING: 999'], 12.05, 24, '#e63946', '#ffffff'], [['PREMIUM'], 14.13, -24, '#ffcb3d', '#22212c']]);
    return l;
  },
});
