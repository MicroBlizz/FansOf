// Fans of Karts · EDICIÓN PREMIUM · MUNDO 3 (Picos Congelados, Fosa del Lag, Volcán y la Nube): los trazados nuevos de la copa premium (pista-premium.js).
// Cada una lleva el paisaje, los adornos y los carteles de su pista normal; aquí van el trazado, los saltos, los atajos y dónde va cada cosa.
// Los números los sacó un generador a partir de los dibujos de los trazados: se pueden retocar a mano.
'use strict';

pistaPremium('nieve', {
  lema: 'Bajada con trampolines y telesilla. El forfait cuesta lo que un juego completo.',
  puntos: [[439, 115], [300, 120], [190, 200], [160, 310], [200, 430], [380, 480], [560, 540], [540, 650], [300, 700], [150, 760], [190, 880], [380, 895], [600, 895], [880, 890], [910, 700], [910, 300], [880, 120], [620, 120]],
  ancho: 66, margen: 36,
  tramos: [{ deU: 11.09, aU: 12.41, ancho: 76, tipo: 'hielo', suave: 0.03 }],
  atajos: [[5.42, 7.97, 24]],
  relieve: { arco: 'arcoNieve', arcos: [0.18, 0.49, 0.82], filas: [['pino', 0.71, 0.81, 22, 12]], hitos: ['granMuneco', 'granPino', 'granMuneco'] },
  pinta(P) {
    turboEn(P, 0.5, 0);
    turboEn(P, 13.56, 0);
    turboEn(P, 16.49, 0);
    rampaEn(P, 6.38, 10); rampaEn(P, 7.28, 10); rampaEn(P, 7.89, 10); rampaEn(P, 8.74, 10);
    for (let u = 11.09; u < 12.41; u += 0.12) sello(P, x => { const p = enVia(P, P.f(u)); enPunto(x, p, x => { x.fillStyle = '#fff'; x.fillRect(-7, -p.ancho / 2 + 2, 14, p.ancho - 4); }); }, { tipo: S_HIELO, solo: t => t === S_PISTA, en: enVia(P, P.f(u)), r: 60 });
    hieloEn(P, 2.33, 14, 13, 8, ['#a8dcf4', '#c4ecff', '#ffffff'], 1); hieloEn(P, 5.51, -12, 13, 8, ['#a8dcf4', '#c4ecff', '#ffffff'], 2); hieloEn(P, 9.7, 14, 13, 8, ['#a8dcf4', '#c4ecff', '#ffffff'], 3); hieloEn(P, 12.52, -12, 13, 8, ['#a8dcf4', '#c4ecff', '#ffffff'], 4); hieloEn(P, 14.39, 14, 13, 8, ['#a8dcf4', '#c4ecff', '#ffffff'], 5); hieloEn(P, 16.55, -12, 13, 8, ['#a8dcf4', '#c4ecff', '#ffffff'], 6);
  },
  cosas(P) {
    const l = [];
    regalosEn(P, 3.21); regalosEn(P, 10); regalosEn(P, 14.66);
    monedasPor(P, [[1.26, 5, 0], [5.42, 4, 0], [10.73, 4, 12], [13.32, 4, -12], [14.43, 4, 0], [15.42, 5, 12], [16.75, 4, 0], [6.38, 1, 0], [7.28, 1, 0], [7.89, 1, 0], [8.74, 1, 0]]);
    adornosPor(P, l, ['pino', 'pino', 'muneco', 'bloquehielo', 'pino'], 0.4, 17.6, 0.5, 12, 26, 29);
    movilEn(P, l, 'pinguino', 5.35, 26, 5.4, 0.0); movilEn(P, l, 'pinguino', 12.63, 26, 6, 1.4); movilEn(P, l, 'pinguino', 16.09, 26, 6.6, 2.8);
    for (const [u, lado, per, f] of [[4.94, -10, 3.2, 0], [10.81, 10, 3.4, 0.5], [13.21, 0, 3.6, 0.25], [16.89, -8, 3.3, 0.7]]) caidaEn(P, l, 'carambano', u, lado, per, f, { radio: 8, alto: 76 });
    cartelesPor(P, l, [[['JUEGO', 'CONGELADO'], 2.54, 24, '#2f4fae', '#ffffff'], [['SERVIDORES', 'A -40 °C'], 5.52, -24, '#22212c', '#22e3ff'], [['HIELO', 'INCLUIDO'], 9.69, 24, '#22e3ff', '#22212c'], [['LAGO EN', 'MANTENIMIENTO'], 10.92, -24, '#e63946', '#ffffff'], [['PATINA', 'BAJO TU RIESGO'], 12.83, 24, '#22212c', '#ffcb3d'], [['DESHIELO:', 'Q4 2031'], 14.56, -24, '#2f4fae', '#ffffff'], [['PREMIUM'], 16.39, 24, '#ffcb3d', '#22212c']]);
    return l;
  },
});

pistaPremium('fosa', {
  lema: 'El cable de internet, enredado. Por eso tu partida se corta a la mitad.',
  puntos: [[910, 512], [860, 296], [740, 296], [660, 512], [600, 730], [512, 781], [424, 730], [364, 512], [284, 296], [164, 296], [114, 512], [164, 730], [284, 730], [364, 512], [424, 288], [512, 245], [600, 288], [660, 512], [740, 730], [860, 730]],
  ancho: 66, margen: 28,
  tramos: [],
  atajos: [[3.49, 6.51, 22]],
  relieve: { arco: 'arcoFosa', arcos: [0.18, 0.5, 0.82], filas: [['alga', 0.81, 0.86, 18, 10], ['coral', 0.31, 0.36, 22, 10]], hitos: ['granAncla', 'granCofre'] },
  pinta(P) {
    turboEn(P, 0.5, 0);
    turboEn(P, 2.21, 0);
    turboEn(P, 12.23, 0);
    corrienteEn(P, 5.03, 0, 46, 62, 30, 0, ['#2a6aa0', '#5aa0d0', '#1a4a80']);
    corrienteEn(P, 10.03, 0, 46, 62, -30, 0, ['#2a6aa0', '#5aa0d0', '#1a4a80']);
    corrienteEn(P, 14.68, 0, 46, 62, 28, 0, ['#2a6aa0', '#5aa0d0', '#1a4a80']);
    manchaEn(P, 2.37, 14, 9, 6, S_CHARCO, ['#2b2d3a', '#4a3a5a', '#1c1028'], 1); manchaEn(P, 5.2, -12, 9, 6, S_CHARCO, ['#2b2d3a', '#4a3a5a', '#1c1028'], 2); manchaEn(P, 9, 14, 9, 6, S_CHARCO, ['#2b2d3a', '#4a3a5a', '#1c1028'], 3); manchaEn(P, 10.93, -12, 9, 6, S_CHARCO, ['#2b2d3a', '#4a3a5a', '#1c1028'], 4); manchaEn(P, 15.03, 14, 9, 6, S_CHARCO, ['#2b2d3a', '#4a3a5a', '#1c1028'], 5); manchaEn(P, 19, -12, 9, 6, S_CHARCO, ['#2b2d3a', '#4a3a5a', '#1c1028'], 6);
  },
  cosas(P) {
    const l = [];
    regalosEn(P, 2.47); regalosEn(P, 9.2); regalosEn(P, 16.04);
    monedasPor(P, [[0.83, 5, 0], [4.2, 4, 0], [6.59, 5, -12], [9.86, 4, 12], [13.12, 4, -12], [15.17, 4, 0], [17.04, 5, 12]]);
    adornosPor(P, l, ['alga', 'coral', 'alga', 'ancla', 'cofre', 'burbujas', 'coral'], 0.4, 19.6, 0.5, 10, 18, 30);
    movilEn(P, l, 'tiburon', 5.72, 24, 3.24, 0.0, { muerde: true, r: 4 }); movilEn(P, l, 'tiburon', 10.79, 24, 3.6, 1.4, { muerde: true, r: 4 }); movilEn(P, l, 'tiburon', 17.45, 24, 3.96, 2.8, { muerde: true, r: 4 });
    movilEn(P, l, 'medusa', 7.4, 22, 5.04, 0.0, { flota: 5, r: 3 }); movilEn(P, l, 'medusa', 13.66, 22, 5.6, 1.4, { flota: 5, r: 3 });
    cartelesPor(P, l, [[['PING: 900'], 2.39, 24, '#e63946', '#ffffff'], [['CABLE DE', 'INTERNET'], 4.39, -24, '#22212c', '#ffcb3d'], [['NO MORDER', 'EL CABLE'], 7.43, 24, '#ffcb3d', '#22212c'], [['CORRIENTE', 'DE PAGO'], 10.03, -24, '#2f4fae', '#ffffff'], [['MICROBLIZZ', 'TITANIC II'], 12.62, 24, '#e63946', '#ffffff'], [['LAG', 'INCLUIDO'], 15.69, -24, '#22212c', '#5ef2d0'], [['PREMIUM'], 17.53, 24, '#ffcb3d', '#22212c']]);
    return l;
  },
});

pistaPremium('volcan', {
  lema: 'Cinco puntas, cinco fechas de salida. No se cumplió ninguna.',
  puntos: [[246, 356], [132, 398], [274, 599], [277, 846], [512, 772], [747, 846], [750, 599], [892, 398], [659, 320], [512, 122], [365, 320]],
  ancho: 66, margen: 22,
  tramos: [{ deU: 0.12, aU: 1.4, margen: 20, suave: 0.02 }, { deU: 1.69, aU: 2.33, margen: 20, suave: 0.02 }, { deU: 2.56, aU: 3.45, margen: 20, suave: 0.02 }, { deU: 3.67, aU: 4.34, margen: 20, suave: 0.02 }, { deU: 4.56, aU: 5.45, margen: 20, suave: 0.02 }, { deU: 5.67, aU: 6.34, margen: 20, suave: 0.02 }, { deU: 6.56, aU: 7.45, margen: 20, suave: 0.02 }, { deU: 7.64, aU: 8.34, margen: 20, suave: 0.02 }, { deU: 8.56, aU: 9.45, margen: 20, suave: 0.02 }, { deU: 9.71, aU: 10.81, margen: 20, suave: 0.02 }],
  atajos: [[4.01, 5.91, 20, 'puente']],
  relieve: { arco: 'arcoVolcan', arcos: [0.14, 0.5, 0.82], filas: [], hitos: ['granFumarola', 'granFumarola'] },
  pinta(P) {
    turboEn(P, 0.5, 0);
    turboEn(P, 2.49, 0);
    turboEn(P, 6.5, 0);
    rampaEn(P, 2.23, 12); huecoEn(P, 2.39, 34);
    rampaEn(P, 8.17, 12); huecoEn(P, 8.33, 34);
    manchaEn(P, 1.38, 14, 11, 7, S_BARRO, ['#5a4a52', '#6a5a62', '#4a3a42'], 1); manchaEn(P, 3.04, -12, 11, 7, S_BARRO, ['#5a4a52', '#6a5a62', '#4a3a42'], 2); manchaEn(P, 4.69, 14, 11, 7, S_BARRO, ['#5a4a52', '#6a5a62', '#4a3a42'], 3); manchaEn(P, 6.34, -12, 11, 7, S_BARRO, ['#5a4a52', '#6a5a62', '#4a3a42'], 4); manchaEn(P, 7.94, 14, 11, 7, S_BARRO, ['#5a4a52', '#6a5a62', '#4a3a42'], 5); manchaEn(P, 9.65, -12, 11, 7, S_BARRO, ['#5a4a52', '#6a5a62', '#4a3a42'], 6);
  },
  cosas(P) {
    const l = [];
    regalosEn(P, 1.69); regalosEn(P, 4.99); regalosEn(P, 8.66);
    monedasPor(P, [[0.96, 5, 0], [2.75, 4, 0], [3.63, 5, -12], [4.51, 4, 0], [5.39, 4, 12], [6.27, 5, 0], [7.16, 4, -12], [8.92, 5, 12], [9.8, 4, 0]]);
    adornosPor(P, l, ['rocalava', 'fumarola', 'pcfuego', 'rocalava'], 0.4, 10.6, 0.6, 8, 16, 31);
    movilEn(P, l, 'rocalava', 3.19, 20, 4.14, 0.0, { r: 4.6 }); movilEn(P, l, 'rocalava', 6.19, 20, 4.6, 1.4, { r: 4.6 }); movilEn(P, l, 'rocalava', 9.3, 20, 5.06, 2.8, { r: 4.6 });
    for (const [u, lado, per, f] of [[2.73, -10, 3.2, 0], [5.49, 10, 3.4, 0.5], [7.1, 0, 3.6, 0.25], [9.9, -8, 3.3, 0.7]]) caidaEn(P, l, 'bomba', u, lado, per, f, { radio: 9, alto: 80 });
    cartelesPor(P, l, [[['SEMANA 47', 'DE CRUNCH'], 1.46, 24, '#22212c', '#ff7a1a'], [['NO HAY', 'BARANDILLA'], 2.81, -24, '#e63946', '#ffffff'], [['HORAS', 'EXTRA: SÍ'], 4.15, 24, '#22212c', '#ffcb3d'], [['PAGADAS: NO'], 5.49, -24, '#e63946', '#ffffff'], [['FECHA DE', 'SALIDA: AYER'], 6.84, 24, '#22212c', '#ff7a1a'], [['PASARELA', 'SIN SEGURO'], 7.89, -24, '#ffcb3d', '#22212c'], [['PREMIUM'], 9.53, 24, '#ffcb3d', '#22212c']]);
    return l;
  },
});

pistaPremium('nube', {
  lema: 'Saltos entre nubes. Tus datos ya los dimos por perdidos.',
  puntos: [[512, 98], [581, 134], [626, 208], [664, 257], [727, 264], [815, 265], [882, 305], [884, 381], [841, 456], [815, 512], [841, 568], [884, 643], [882, 719], [815, 759], [727, 760], [664, 767], [626, 816], [581, 890], [512, 926], [443, 890], [398, 816], [360, 767], [297, 760], [209, 759], [142, 719], [140, 643], [183, 568], [209, 512], [183, 456], [140, 381], [142, 305], [209, 265], [297, 264], [361, 257], [398, 208], [443, 134]],
  ancho: 66, margen: 5,
  tramos: [{ deU: 35.4, aU: 1.74, margen: 20, suave: 0.02 }, { deU: 1.56, aU: 4.4, margen: 20, suave: 0.02 }, { deU: 4.31, aU: 7.71, margen: 20, suave: 0.02 }, { deU: 7.61, aU: 10.39, margen: 20, suave: 0.02 }, { deU: 10.3, aU: 13.7, margen: 20, suave: 0.02 }, { deU: 13.61, aU: 16.44, margen: 20, suave: 0.02 }, { deU: 16.26, aU: 19.75, margen: 20, suave: 0.02 }, { deU: 19.56, aU: 22.4, margen: 20, suave: 0.02 }, { deU: 22.31, aU: 25.71, margen: 20, suave: 0.02 }, { deU: 25.62, aU: 28.39, margen: 20, suave: 0.02 }, { deU: 28.3, aU: 31.7, margen: 20, suave: 0.02 }, { deU: 31.61, aU: 34.44, margen: 20, suave: 0.02 }, { deU: 34.26, aU: 0.6, margen: 20, suave: 0.02 }],
  relieve: { arco: 'arcoNube', arcos: [0.18, 0.5, 0.82], filas: [], hitos: ['granRack', 'granRack'] },
  pinta(P) {
    turboEn(P, 0.5, 0);
    turboEn(P, 12.95, 0);
    turboEn(P, 24.8, 0);
    rampaEn(P, 8.36, 12); huecoEn(P, 9, 34);
    rampaEn(P, 20.44, 12); huecoEn(P, 21.08, 34);
    rampaEn(P, 32.51, 12); huecoEn(P, 33.13, 34);
    manchaEn(P, 3.29, 14, 8, 6, S_CHARCO, ['#ff3df0', '#22e3ff', '#1c1028'], 1); manchaEn(P, 10.01, -12, 8, 6, S_CHARCO, ['#ff3df0', '#22e3ff', '#1c1028'], 2); manchaEn(P, 15.14, 14, 8, 6, S_CHARCO, ['#ff3df0', '#22e3ff', '#1c1028'], 3); manchaEn(P, 22.08, -12, 8, 6, S_CHARCO, ['#ff3df0', '#22e3ff', '#1c1028'], 4); manchaEn(P, 27, 14, 8, 6, S_CHARCO, ['#ff3df0', '#22e3ff', '#1c1028'], 5); manchaEn(P, 34.17, -12, 8, 6, S_CHARCO, ['#ff3df0', '#22e3ff', '#1c1028'], 6);
  },
  cosas(P) {
    const l = [];
    regalosEn(P, 4.42); regalosEn(P, 16.33); regalosEn(P, 28.24);
    monedasPor(P, [[1.67, 5, 0], [11.35, 5, -12], [14.37, 4, 0], [17.66, 4, 12], [23.95, 4, -12], [27.18, 4, 0], [30.33, 5, 12]]);
    adornosPor(P, l, ['rack', 'nube', 'antena', 'nube', 'rack'], 0.4, 35.6, 0.55, 14, 20, 32, { r: 0, flota: 2 });
    cartelesPor(P, l, [[['SIN', 'BARANDILLA'], 3.6, 24, '#22212c', '#ff5cf0'], [['COPIA DE', 'SEGURIDAD: NO'], 7.56, -24, '#2f4fae', '#ffffff'], [['SUBIENDO', 'TUS DATOS'], 13.14, 24, '#22212c', '#22e3ff'], [['ESPACIO', 'LLENO'], 18, -24, '#e63946', '#ffffff'], [['CAÍDA', 'GRATIS'], 22.87, 24, '#ffcb3d', '#22212c'], [['ERROR 37'], 27.82, -24, '#2f4fae', '#ffffff'], [['PREMIUM'], 31.55, 24, '#ffcb3d', '#22212c']]);
    return l;
  },
});
