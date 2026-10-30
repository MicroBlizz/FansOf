// Fans of Karts · EDICIÓN PREMIUM · MUNDO 1 (Oficinas, Playa, Microblizz-Land y Centro Comercial): los trazados nuevos de la copa premium (pista-premium.js).
// Cada una lleva el paisaje, los adornos y los carteles de su pista normal; aquí van el trazado, los saltos, los atajos y dónde va cada cosa.
// Los números los sacó un generador a partir de los dibujos de los trazados: se pueden retocar a mano.
'use strict';

pistaPremium('oficinas', {
  lema: 'Edición Premium: los mismos pasillos, ahora se cruzan. Recursos Humanos tiene preferencia.',
  puntos: [[165, 659], [170, 560], [215, 512], [350, 512], [512, 512], [680, 512], [810, 512], [855, 470], [855, 300], [855, 195], [810, 150], [600, 150], [555, 195], [512, 240], [512, 512], [512, 780], [470, 825], [400, 870], [215, 870], [170, 825]],
  ancho: 66, margen: 30,
  tramos: [],
  atajos: [[5.14, 7.83, 26]],
  relieve: { arco: 'arcoOficinas', arcos: [0.18, 0.5, 0.82], filas: [['archivador', 0.13, 0.23, 26, 12], ['fuente', 0.63, 0.73, 30, 12]], hitos: ['granPlanta', 'granPlanta'] },
  pinta(P) {
    turboEn(P, 0.5, 0);
    turboEn(P, 2.7, 0);
    turboEn(P, 13.22, 0);
    manchaEn(P, 2.74, 14, 9, 6, S_CHARCO, ['#7a4a26', '#8b5a30', '#5a3418'], 1); manchaEn(P, 5.31, -12, 9, 6, S_CHARCO, ['#7a4a26', '#8b5a30', '#5a3418'], 2); manchaEn(P, 9.03, 14, 9, 6, S_CHARCO, ['#7a4a26', '#8b5a30', '#5a3418'], 3); manchaEn(P, 13.19, -12, 9, 6, S_CHARCO, ['#7a4a26', '#8b5a30', '#5a3418'], 4); manchaEn(P, 14.69, 14, 9, 6, S_CHARCO, ['#7a4a26', '#8b5a30', '#5a3418'], 5); manchaEn(P, 18.18, -12, 9, 6, S_CHARCO, ['#7a4a26', '#8b5a30', '#5a3418'], 6);
  },
  cosas(P) {
    const l = [];
    regalosEn(P, 3.08); regalosEn(P, 10.05); regalosEn(P, 14.98);
    monedasPor(P, [[4.78, 4, 0], [6.97, 5, -12], [8.57, 4, 0], [10.56, 4, 12], [13.86, 4, -12], [14.73, 4, 0], [17.03, 5, 12], [18.74, 4, 0]]);
    adornosPor(P, l, ['planta', 'mesa', 'fuente', 'archivador', 'mesa', 'planta'], 0.4, 19.6, 0.5, 14, 24, 21);
    cartelesPor(P, l, [[['SOON™'], 2.84, 24, '#22212c', '#ffcb3d'], [['RRHH', '-->'], 4.47, -24, '#e63946', '#ffffff'], [['ERROR 37'], 7.14, 24, '#2f4fae', '#ffffff'], [['CAFÉ', '9,99 €'], 9.83, -24, '#7a4a26', '#ffe6d0'], [['REUNIÓN', 'INFINITA'], 13.23, 24, '#22212c', '#5ef2d0'], [['CIERRE', 'DE JUEGOS'], 13.96, -24, '#e63946', '#ffffff'], [['NO CORRER'], 15.46, 24, '#ffcb3d', '#22212c'], [['PREMIUM'], 18.04, -24, '#ffcb3d', '#22212c']]);
    return l;
  },
});

pistaPremium('playa', {
  lema: 'Ahora en forma de ocho. Las olas siguen sin parche.',
  puntos: [[886, 655], [902, 520], [872, 343], [788, 270], [661, 343], [512, 520], [363, 697], [236, 770], [152, 697], [122, 520], [152, 343], [236, 270], [363, 343], [512, 520], [661, 697], [788, 770], [872, 697]],
  ancho: 70, margen: 40,
  tramos: [],
  relieve: { arco: 'arcoPlaya', arcos: [0.22, 0.5, 0.82], filas: [['palmera', 0.26, 0.34, 30, 14]], hitos: ['granCastillo', 'granPalmera', 'granCastillo'] },
  pinta(P) {
    turboEn(P, 0.5, 0);
    turboEn(P, 12.17, 0);
    turboEn(P, 4.18, 0);
    rampaEn(P, 1.85, 10); rampaEn(P, 2.54, 10); rampaEn(P, 3.24, 10);
    corrienteEn(P, 6.99, 0, 40, 60, 26, 0, ['#5cc8e8', '#ffffff', '#2fb0d8']);
    corrienteEn(P, 10.07, 0, 40, 60, -26, 0, ['#5cc8e8', '#ffffff', '#2fb0d8']);
    manchaEn(P, 1.06, 14, 12, 7, S_BARRO, ['#b8945e', '#a88450', '#d8c08a'], 1); manchaEn(P, 4.47, -12, 12, 7, S_BARRO, ['#b8945e', '#a88450', '#d8c08a'], 2); manchaEn(P, 6.63, 14, 12, 7, S_BARRO, ['#b8945e', '#a88450', '#d8c08a'], 3); manchaEn(P, 9.07, -12, 12, 7, S_BARRO, ['#b8945e', '#a88450', '#d8c08a'], 4); manchaEn(P, 12.41, 14, 12, 7, S_BARRO, ['#b8945e', '#a88450', '#d8c08a'], 5); manchaEn(P, 14.53, -12, 12, 7, S_BARRO, ['#b8945e', '#a88450', '#d8c08a'], 6);
  },
  cosas(P) {
    const l = [];
    regalosEn(P, 0.96); regalosEn(P, 7.22); regalosEn(P, 12.76);
    monedasPor(P, [[4.13, 4, 0], [5.16, 5, -12], [6.3, 4, 0], [8.09, 4, 12], [11.11, 4, -12], [12.45, 4, 0], [13.49, 5, 12], [14.8, 4, 0], [1.85, 1, 0], [2.54, 1, 0], [3.24, 1, 0]]);
    adornosPor(P, l, ['palmera', 'palmera', 'sombrilla', 'sombrilla', 'castillo', 'socorrista'], 0.4, 16.6, 0.55, 14, 26, 22);
    movilEn(P, l, 'cangrejo', 4.65, 24, 4.95, 0.0); movilEn(P, l, 'cangrejo', 8.84, 24, 5.5, 1.4); movilEn(P, l, 'cangrejo', 13.93, 24, 6.05, 2.8);
    for (const [u, lado, per, f] of [[4.04, -10, 3.2, 0], [8.24, 10, 3.4, 0.5], [11, 0, 3.6, 0.25], [14.98, -8, 3.3, 0.7]]) caidaEn(P, l, 'balon', u, lado, per, f, { radio: 9, alto: 60 });
    cartelesPor(P, l, [[['ACCESO', 'ANTICIPADO'], 0.98, 24, '#22212c', '#ffcb3d'], [['HAMACA', '4,99 €/MIN'], 4.19, -24, '#2fb0d8', '#ffffff'], [['CASTILLO EN', 'DESARROLLO'], 5.77, 24, '#c99a64', '#22212c'], [['PROHIBIDO', 'EL BAÑO'], 8.24, -24, '#e63946', '#ffffff'], [['OLAS EN', 'VERSIÓN BETA'], 10.68, 24, '#22212c', '#5cc8e8'], [['CANGREJOS', 'NO REEMBOLS.'], 12.63, -24, '#ff5a3c', '#ffffff'], [['PREMIUM'], 14.31, 24, '#ffcb3d', '#22212c']]);
    return l;
  },
});

pistaPremium('parque', {
  lema: 'Nueva montaña rusa con rizo. El seguro de vida se vende aparte.',
  puntos: [[300, 880], [700, 880], [860, 820], [880, 640], [860, 520], [700, 470], [560, 420], [470, 280], [520, 120], [680, 90], [800, 180], [760, 330], [560, 420], [380, 470], [200, 520], [140, 680], [170, 830]],
  ancho: 66, margen: 24,
  tramos: [],
  puente: { arriba: [10.72, 13.23], abajo: [5, 6.95], centro: 11.97, alto: 12, radio: 70 },
  relieve: { arco: 'arcoParque', arcos: [0.18, 0.5, 0.82], filas: [], hitos: ['granTiovivo', 'granTiovivo'] },
  pinta(P) {
    turboEn(P, 0.5, 0);
    turboEn(P, 11.5, 0);
    turboEn(P, 13.23, 0);
    rampaEn(P, 0.44, 10); rampaEn(P, 0.61, 10); rampaEn(P, 0.78, 10); rampaEn(P, 0.96, 10);
    manchaEn(P, 1.47, 14, 9, 6, S_CHARCO, ['#ffd0ea', '#ff9ad0', '#ffffff'], 1); manchaEn(P, 3.24, -12, 9, 6, S_CHARCO, ['#ffd0ea', '#ff9ad0', '#ffffff'], 2); manchaEn(P, 6.69, 14, 9, 6, S_CHARCO, ['#ffd0ea', '#ff9ad0', '#ffffff'], 3); manchaEn(P, 9.65, -12, 9, 6, S_CHARCO, ['#ffd0ea', '#ff9ad0', '#ffffff'], 4); manchaEn(P, 12.6, 14, 9, 6, S_CHARCO, ['#ffd0ea', '#ff9ad0', '#ffffff'], 5); manchaEn(P, 15.24, -12, 9, 6, S_CHARCO, ['#ffd0ea', '#ff9ad0', '#ffffff'], 6);
  },
  cosas(P) {
    const l = [];
    regalosEn(P, 1.58); regalosEn(P, 7.13); regalosEn(P, 12.9);
    monedasPor(P, [[2.68, 4, 0], [4.52, 5, -12], [7.85, 4, 12], [9.51, 5, 0], [11.16, 4, -12], [13.92, 5, 12], [15.53, 4, 0], [0.44, 1, 0], [0.61, 1, 0], [0.78, 1, 0], [0.96, 1, 0]]);
    adornosPor(P, l, ['globos', 'puesto', 'tiovivo', 'globos', 'puesto', 'planta'], 0.4, 16.6, 0.62, 14, 24, 23);
    movilEn(P, l, 'taza', 3.61, 22, 4.68, 0.0); movilEn(P, l, 'taza', 9.35, 22, 5.2, 1.4); movilEn(P, l, 'taza', 14.59, 22, 5.72, 2.8);
    cartelesPor(P, l, [[['BIENVENIDO A', 'MICROBLIZZ-LAND'], 1.49, 24, '#ff5c8a', '#ffffff'], [['FICHAS', '1.200 X 99 €'], 2.77, -24, '#22212c', '#ffcb3d'], [['COLA: 3 H'], 5.16, 24, '#22212c', '#ff5c8a'], [['PROHIBIDO', 'DIVERTIRSE GRATIS'], 8.03, -24, '#e63946', '#ffffff'], [['FAST PASS', 'PREMIUM'], 10.61, 24, '#ffcb3d', '#22212c'], [['SALIDA POR', 'LA TIENDA'], 12.71, -24, '#7c3aed', '#ffffff'], [['PREMIUM'], 15, 24, '#ffcb3d', '#22212c']]);
    return l;
  },
});

pistaPremium('centro', {
  lema: 'Tres plantas de escaleras mecánicas. La salida está en la tienda de regalos.',
  puntos: [[110, 600], [120, 800], [200, 880], [320, 870], [300, 780], [420, 710], [700, 710], [820, 700], [880, 610], [780, 530], [460, 530], [340, 510], [300, 420], [400, 350], [700, 350], [820, 340], [880, 250], [780, 170], [500, 170], [160, 170], [110, 250]],
  ancho: 66, margen: 34,
  tramos: [],
  relieve: { arco: 'arcoCentro', arcos: [0.18, 0.5, 0.82], filas: [['expositor', 0.75, 0.84, 22, 10]], hitos: ['granManiqui', 'granManiqui'] },
  pinta(P) {
    turboEn(P, 0.5, 0);
    turboEn(P, 17.38, 0);
    turboEn(P, 1.85, 0);
    corrienteEn(P, 9.71, 0, 50, 26, 0, 48, ['#6a7390', '#3a4258', '#c3cbe0']);
    corrienteEn(P, 13.77, 0, 50, 26, 0, 48, ['#6a7390', '#3a4258', '#c3cbe0']);
    corrienteEn(P, 5.79, 0, 44, 26, 0, -36, ['#6a7390', '#3a4258', '#c3cbe0']);
    manchaEn(P, 2.16, 14, 9, 6, S_CHARCO, ['#d0f0ff', '#a8dcf4', '#ffffff'], 1); manchaEn(P, 5.99, -12, 9, 6, S_CHARCO, ['#d0f0ff', '#a8dcf4', '#ffffff'], 2); manchaEn(P, 9.77, 14, 9, 6, S_CHARCO, ['#d0f0ff', '#a8dcf4', '#ffffff'], 3); manchaEn(P, 13.64, -12, 9, 6, S_CHARCO, ['#d0f0ff', '#a8dcf4', '#ffffff'], 4); manchaEn(P, 17.51, 14, 9, 6, S_CHARCO, ['#d0f0ff', '#a8dcf4', '#ffffff'], 5); manchaEn(P, 20.09, -12, 9, 6, S_CHARCO, ['#d0f0ff', '#a8dcf4', '#ffffff'], 6);
  },
  cosas(P) {
    const l = [];
    regalosEn(P, 3.1); regalosEn(P, 10.32); regalosEn(P, 17.91);
    monedasPor(P, [[0.94, 5, 0], [5.6, 4, 0], [7.86, 5, -12], [9.56, 4, 0], [11.65, 4, 12], [13.55, 5, 0], [15.66, 4, -12], [17.56, 4, 0], [18.61, 5, 12], [20.25, 4, 0]]);
    adornosPor(P, l, ['maniqui', 'banco', 'papelera', 'expositor', 'planta', 'maniqui'], 0.4, 20.6, 0.5, 12, 22, 24);
    movilEn(P, l, 'carrito', 6.44, 22, 4.14, 0.0); movilEn(P, l, 'carrito', 13.45, 22, 4.6, 1.4); movilEn(P, l, 'carrito', 19.1, 22, 5.06, 2.8);
    for (const [u, lado, per, f] of [[5.25, -10, 3.2, 0], [12.01, 10, 3.4, 0.5], [15.46, 0, 3.6, 0.25], [20.35, -8, 3.3, 0.7]]) caidaEn(P, l, 'botin', u, lado, per, f, { radio: 8 });
    cartelesPor(P, l, [[['REBAJAS', '−90 %'], 2.13, 24, '#e63946', '#ffffff'], [['SUELO', 'MOJADO'], 5.34, -24, '#ffcb3d', '#22212c'], [['SKIN DORADA', '49,99 €'], 8.15, 24, '#22212c', '#ffcb3d'], [['SOLO HOY'], 10.06, -24, '#c35cff', '#ffffff'], [['ESCALERA', 'DE PAGO'], 13.31, 24, '#22212c', '#5ef2d0'], [['SIN', 'DEVOLUCIONES'], 16, -24, '#e63946', '#ffffff'], [['BLOQUE 1 DE 40', 'ABIERTA'], 18.08, 24, '#2f4fae', '#ffffff'], [['PREMIUM'], 20.05, -24, '#ffcb3d', '#22212c']]);
    return l;
  },
});
