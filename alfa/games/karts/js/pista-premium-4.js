// Fans of Karts · EDICIÓN PREMIUM · MUNDO 4 (Selva, Distrito Hype, Castillo y la Torre del CEO): los trazados nuevos de la copa premium (pista-premium.js).
// Cada una lleva el paisaje, los adornos y los carteles de su pista normal; aquí van el trazado, los saltos, los atajos y dónde va cada cosa.
// Los números los sacó un generador a partir de los dibujos de los trazados: se pueden retocar a mano.
'use strict';

pistaPremium('selva', {
  lema: 'El bug más grande: la pista se muerde la cola. Cerrado como «funciona según lo previsto».',
  puntos: [[515, 892], [400, 880], [200, 880], [140, 760], [220, 640], [380, 640], [440, 520], [360, 400], [200, 380], [150, 250], [260, 140], [420, 170], [520, 300], [640, 420], [800, 400], [880, 280], [800, 150], [660, 170], [600, 300], [560, 520], [620, 700], [760, 700], [880, 780], [820, 900], [600, 900]],
  ancho: 62, margen: 24,
  tramos: [],
  atajos: [[3.99, 7.93, 22]],
  relieve: { arco: 'arcoSelva', arcos: [0.18, 0.5, 0.84], filas: [['helecho', 0.7, 0.73, 18, 8]], hitos: ['granSeta', 'granSeta'] },
  pinta(P) {
    turboEn(P, 0.5, 0);
    turboEn(P, 23.49, 0);
    turboEn(P, 14.66, 0);
    rampaEn(P, 11.28, 12); huecoEn(P, 11.52, 34);
    manchaEn(P, 2.28, 14, 12, 7, S_BARRO, ['#5a4028', '#6a4c30', '#4a3420'], 1); manchaEn(P, 6.67, -12, 12, 7, S_BARRO, ['#5a4028', '#6a4c30', '#4a3420'], 2); manchaEn(P, 10.8, 14, 12, 7, S_BARRO, ['#5a4028', '#6a4c30', '#4a3420'], 3); manchaEn(P, 15.25, -12, 12, 7, S_BARRO, ['#5a4028', '#6a4c30', '#4a3420'], 4); manchaEn(P, 18.76, 14, 12, 7, S_BARRO, ['#5a4028', '#6a4c30', '#4a3420'], 5); manchaEn(P, 22.79, -12, 12, 7, S_BARRO, ['#5a4028', '#6a4c30', '#4a3420'], 6);
  },
  cosas(P) {
    const l = [];
    regalosEn(P, 3.11); regalosEn(P, 12.09); regalosEn(P, 19.09);
    monedasPor(P, [[1.41, 5, 0], [5.89, 4, 0], [8.14, 5, -12], [10.37, 4, 0], [16.89, 4, -12], [20.81, 5, 12], [23.13, 4, 0]]);
    adornosPor(P, l, ['ceiba', 'helecho', 'seta', 'helecho', 'ceiba', 'seta'], 0.4, 24.6, 0.5, 10, 22, 33);
    movilEn(P, l, 'bicho', 7.06, 20, 3.78, 0.0, { r: 4.4, muerde: true }); movilEn(P, l, 'bicho', 13.49, 20, 4.2, 1.4, { r: 4.4, muerde: true }); movilEn(P, l, 'bicho', 21.84, 20, 4.62, 2.8, { r: 4.4, muerde: true });
    for (const [u, lado, per, f] of [[5.15, -10, 3.2, 0], [12.69, 10, 3.4, 0.5], [16.73, 0, 3.6, 0.25], [23.31, -8, 3.3, 0.7]]) caidaEn(P, l, 'coco', u, lado, per, f, { radio: 7 });
    cartelesPor(P, l, [[['BUGS', 'CONOCIDOS: 9.999'], 2.48, 24, '#22212c', '#5ef27a'], [['NO ES UN BUG', 'ES UNA FEATURE'], 6.04, -24, '#7c3aed', '#ffffff'], [['PARCHE', 'PREVISTO: NUNCA'], 9.49, 24, '#e63946', '#ffffff'], [['NO DAR DE', 'COMER AL BUG'], 12.69, -24, '#22212c', '#ffcb3d'], [['REPORTA', 'TU BUG'], 16.04, 24, '#2f4fae', '#ffffff'], [['¡MUERDEN!'], 19.1, -24, '#e63946', '#ffffff'], [['PREMIUM'], 22.46, 24, '#ffcb3d', '#22212c']]);
    return l;
  },
});

pistaPremium('hype', {
  lema: 'Dos autopistas que se cruzan. Como el tráiler y el juego: nunca coinciden.',
  puntos: [[443, 353], [512, 512], [684, 874], [844, 914], [914, 844], [874, 684], [512, 512], [150, 340], [110, 180], [180, 110], [340, 150]],
  ancho: 68, margen: 24,
  tramos: [],
  atajos: [[2.63, 5, 22]],
  relieve: { arco: 'arcoHype', arcos: [0.22, 0.5, 0.82], filas: [['farolaneon', 0.52, 0.62, 24, 10]], hitos: ['granHolograma', 'granHolograma'] },
  pinta(P) {
    turboEn(P, 0.5, 0);
    turboEn(P, 5.19, 0);
    turboEn(P, 10.45, 0);
    rampaEn(P, 1.41, 10); rampaEn(P, 1.6, 10);
    corrienteEn(P, 5.5, 0, 50, 30, 0, 50, ['#ff3df0', '#ffcb3d', '#22e3ff']);
    corrienteEn(P, 6.44, 0, 46, 30, 0, 50, ['#ff3df0', '#ffcb3d', '#22e3ff']);
    manchaEn(P, 1.13, 14, 9, 6, S_CHARCO, ['#3a2a5a', '#7a3aed', '#1c1028'], 1); manchaEn(P, 2.38, -12, 9, 6, S_CHARCO, ['#3a2a5a', '#7a3aed', '#1c1028'], 2); manchaEn(P, 5.29, 14, 9, 6, S_CHARCO, ['#3a2a5a', '#7a3aed', '#1c1028'], 3); manchaEn(P, 6.09, -12, 9, 6, S_CHARCO, ['#3a2a5a', '#7a3aed', '#1c1028'], 4); manchaEn(P, 7.29, 14, 9, 6, S_CHARCO, ['#3a2a5a', '#7a3aed', '#1c1028'], 5); manchaEn(P, 10.46, -12, 9, 6, S_CHARCO, ['#3a2a5a', '#7a3aed', '#1c1028'], 6);
  },
  cosas(P) {
    const l = [];
    regalosEn(P, 1.13); regalosEn(P, 5.32); regalosEn(P, 7.73);
    monedasPor(P, [[0.73, 5, 0], [1.98, 4, 0], [3.37, 5, -12], [5.5, 4, 12], [6.05, 5, 0], [6.6, 4, -12], [7.35, 4, 0], [9, 5, 12], [1.41, 1, 0], [1.6, 1, 0]]);
    adornosPor(P, l, ['farolaneon', 'holograma', 'arcade', 'farolaneon', 'papelera'], 0.4, 10.6, 0.5, 10, 20, 34);
    movilEn(P, l, 'coche', 2.6, 20, 3.6, 0.0, { r: 5.2, muerde: true }); movilEn(P, l, 'coche', 6, 20, 4, 1.4, { r: 5.2, muerde: true }); movilEn(P, l, 'coche', 9.03, 20, 4.4, 2.8, { r: 5.2, muerde: true });
    cartelesPor(P, l, [[['PREVENTA', 'YA'], 1.14, 24, '#ff3df0', '#ffffff'], [['GOTY 2031', '(PROMETIDO)'], 2.04, -24, '#22212c', '#ffcb3d'], [['TRÁILER', 'NO REPRESENT.'], 4.27, 24, '#22212c', '#22e3ff'], [['TREN DEL', 'HYPE'], 5.56, -24, '#ffcb3d', '#22212c'], [['DÍA 1:', 'PARCHE 80 GB'], 6.4, 24, '#e63946', '#ffffff'], [['RESERVA', 'Y REZA'], 7.56, -24, '#7c3aed', '#ffffff'], [['PREMIUM'], 9.2, 24, '#ffcb3d', '#22212c']]);
    return l;
  },
});

pistaPremium('castillo', {
  lema: 'Ahora con almenas. El puente levadizo sigue en el DLC.',
  puntos: [[894, 346], [870, 170], [640, 170], [620, 300], [400, 300], [380, 170], [150, 170], [150, 330], [150, 850], [380, 850], [400, 720], [620, 720], [640, 850], [870, 850]],
  ancho: 62, margen: 32,
  tramos: [],
  atajos: [[11.12, 13.25, 24]],
  relieve: { arco: 'arcoCastillo', arcos: [0.18, 0.5, 0.82], filas: [], hitos: ['granTorre', 'granTorre'] },
  pinta(P) {
    turboEn(P, 0.5, 0);
    turboEn(P, 13.2, 0);
    turboEn(P, 7.1, 0);
    rampaEn(P, 7.3, 12); huecoEn(P, 7.38, 34);
    manchaEn(P, 1.5, 14, 11, 7, S_BARRO, ['#6a5a4a', '#7a6a58', '#5a4a3a'], 1); manchaEn(P, 4.52, -12, 11, 7, S_BARRO, ['#6a5a4a', '#7a6a58', '#5a4a3a'], 2); manchaEn(P, 7.17, 14, 11, 7, S_BARRO, ['#6a5a4a', '#7a6a58', '#5a4a3a'], 3); manchaEn(P, 8.48, -12, 11, 7, S_BARRO, ['#6a5a4a', '#7a6a58', '#5a4a3a'], 4); manchaEn(P, 11.41, 14, 11, 7, S_BARRO, ['#6a5a4a', '#7a6a58', '#5a4a3a'], 5); manchaEn(P, 13.43, -12, 11, 7, S_BARRO, ['#6a5a4a', '#7a6a58', '#5a4a3a'], 6);
  },
  cosas(P) {
    const l = [];
    regalosEn(P, 1.93); regalosEn(P, 7.55); regalosEn(P, 12.07);
    monedasPor(P, [[0.91, 5, 0], [3.89, 4, 0], [5.56, 5, -12], [7.05, 4, 0], [8.38, 5, 0], [9.99, 4, -12], [11.51, 4, 0], [12.9, 5, 12], [13.53, 4, 0]]);
    adornosPor(P, l, ['torre', 'andamio', 'estandarte', 'andamio', 'estandarte', 'cono'], 0.4, 13.6, 0.55, 10, 22, 35);
    movilEn(P, l, 'caballero', 4.88, 18, 3.96, 0.0, { muerde: true, r: 3.2 }); movilEn(P, l, 'caballero', 8.28, 18, 4.4, 1.4, { muerde: true, r: 3.2 }); movilEn(P, l, 'caballero', 13.2, 18, 4.84, 2.8, { muerde: true, r: 3.2 });
    for (const [u, lado, per, f] of [[3.5, -10, 3.2, 0], [7.68, 10, 3.4, 0.5], [9.85, 0, 3.6, 0.25], [13.6, -8, 3.3, 0.7]]) caidaEn(P, l, 'pedrusco', u, lado, per, f, { radio: 9 });
    cartelesPor(P, l, [[['EN OBRAS', 'DESDE 2019'], 1.76, 24, '#ffcb3d', '#22212c'], [['ATAJO DEL', 'TORNEO'], 4.76, -24, '#8b5cf6', '#ffffff'], [['¡PIEDRAS!'], 7.18, 24, '#e63946', '#ffffff'], [['PARCHE 0.9', 'BETA'], 8.39, -24, '#22212c', '#ffcb3d'], [['PUENTE', 'EN DLC'], 11.05, 24, '#e63946', '#ffffff'], [['PREMIUM'], 13.28, -24, '#ffcb3d', '#22212c']]);
    return l;
  },
});

pistaPremium('torre', {
  lema: 'Subes planta a planta hasta el CEO. Bajas en un segundo, como tu sueldo.',
  puntos: [[371, 887], [160, 880], [160, 680], [360, 680], [360, 480], [560, 480], [560, 280], [760, 280], [760, 120], [880, 120], [880, 400], [880, 880], [500, 880]],
  ancho: 64, margen: 6,
  tramos: [{ deU: 0.48, aU: 1.54, margen: 10, suave: 0.02 }, { deU: 1.5, aU: 2.53, margen: 10, suave: 0.02 }, { deU: 2.46, aU: 3.54, margen: 10, suave: 0.02 }, { deU: 3.47, aU: 4.51, margen: 10, suave: 0.02 }, { deU: 4.48, aU: 5.52, margen: 10, suave: 0.02 }, { deU: 5.49, aU: 6.54, margen: 10, suave: 0.02 }, { deU: 6.5, aU: 7.68, margen: 10, suave: 0.02 }, { deU: 7.39, aU: 9.32, margen: 10, suave: 0.02 }, { deU: 10.79, aU: 11.33, margen: 10, suave: 0.02 }],
  atajos: [[4.06, 5.92, 22, 'puente']],
  relieve: { arco: 'arcoTorre', arcos: [0.18, 0.5, 0.82], filas: [], hitos: ['granEstatua'] },
  pinta(P) {
    turboEn(P, 0.5, 0);
    turboEn(P, 9.36, 0);
    turboEn(P, 1.71, 0);
    rampaEn(P, 10.28, 12); huecoEn(P, 10.36, 34);
    rampaEn(P, 9.76, 12); huecoEn(P, 9.9, 34);
    manchaEn(P, 1.28, 14, 9, 6, S_CHARCO, ['#ffffff', '#e8ecf4', '#c3cbe0'], 1); manchaEn(P, 3.71, -12, 9, 6, S_CHARCO, ['#ffffff', '#e8ecf4', '#c3cbe0'], 2); manchaEn(P, 6.15, 14, 9, 6, S_CHARCO, ['#ffffff', '#e8ecf4', '#c3cbe0'], 3); manchaEn(P, 9.09, -12, 9, 6, S_CHARCO, ['#ffffff', '#e8ecf4', '#c3cbe0'], 4); manchaEn(P, 10.51, 14, 9, 6, S_CHARCO, ['#ffffff', '#e8ecf4', '#c3cbe0'], 5); manchaEn(P, 11.67, -12, 9, 6, S_CHARCO, ['#ffffff', '#e8ecf4', '#c3cbe0'], 6);
  },
  cosas(P) {
    const l = [];
    regalosEn(P, 1.71); regalosEn(P, 6.59); regalosEn(P, 10.69);
    monedasPor(P, [[0.71, 5, 0], [3.28, 4, 0], [4.58, 5, -12], [5.88, 4, 0], [7.23, 4, 12], [9.01, 5, 0], [10.53, 4, 0], [11.1, 5, 12], [11.79, 4, 0]]);
    adornosPor(P, l, ['clima', 'antena', 'clima', 'saco', 'estatua'], 0.4, 12.6, 0.7, 4, 6, 36, { r: 3.4 });
    movilEn(P, l, 'robot', 3.93, 20, 3.42, 0.0, { muerde: true, r: 3.2 }); movilEn(P, l, 'robot', 8.84, 20, 3.8, 1.4, { muerde: true, r: 3.2 }); movilEn(P, l, 'robot', 11.4, 20, 4.18, 2.8, { muerde: true, r: 3.2 });
    for (const [u, lado, per, f] of [[2.89, -10, 3.2, 0], [7.42, 10, 3.4, 0.5], [10.13, 0, 3.6, 0.25], [11.86, -8, 3.3, 0.7]]) caidaEn(P, l, 'saco', u, lado, per, f, { radio: 8 });
    cartelesPor(P, l, [[['PLANTA 100'], 1.55, 24, '#e63946', '#ffffff'], [['BONUS', 'ANUAL'], 3.85, -24, '#ffcb3d', '#22212c'], [['DESPIDOS', 'AQUÍ'], 6.17, 24, '#22212c', '#ff5c8a'], [['PASARELA', 'VIP'], 9.01, -24, '#ffcb3d', '#22212c'], [['TU DESPIDO', 'TE ESPERA'], 10.52, 24, '#e63946', '#ffffff'], [['PREMIUM'], 11.49, -24, '#ffcb3d', '#22212c']]);
    return l;
  },
});
