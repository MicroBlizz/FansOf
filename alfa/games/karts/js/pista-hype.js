// Fans of Karts · MUNDO 4 · DISTRITO HYPE: la ciudad de neón donde todo es anuncio de un juego que sale roto. Asfalto mojado de noche,
// rascacielos con pantallas, hologramas, tráfico que cruza, charcos que reflejan el neón y flechas de hype por todas partes. Muy difícil.
'use strict';

PISTAS.push({
  id: 'hype', invertida: true, mundo: 4, nombre: 'Distrito Hype', lema: 'El tráiler era mejor que el juego. Siempre lo es.', dificultad: 3, musica: 'ciber', color: '#ff3df0',
  puntos: [[500, 150], [700, 150], [860, 150], [900, 300], [780, 380], [640, 380], [560, 470], [640, 560], [860, 560], [900, 700], [860, 860], [640, 880], [500, 780], [360, 880],
    [160, 860], [130, 700], [260, 620], [260, 480], [130, 420], [130, 250], [260, 150]],
  ancho: 68, margen: 30, borde: 'muro',
  tramos: [{ deU: 5.4, aU: 7.6, ancho: 58, suave: 0.03 }, { deU: 16.2, aU: 18.4, ancho: 58, suave: 0.03 }],
  lejos: ['#140a28', '#120824'],
  voladores: [{ id: 'dirigible', s: 300, y: 10, vel: 6, tam: 0.32 }],
  atajos: [[12.13, 15.77, 22]],
  tema: (() => {
    const [as1, as2, refl, raya, borde, k1, k2, ac1, ac2, v1, v2, v3, f1, f2, ven] = C32('#2a2440', '#26203a', '#5a3a8a', '#ffe14d', '#ff3df0', '#ff3df0', '#22e3ff', '#4a4458', '#423c50', '#1c1f2a', '#22e3ff', '#ff3df0', '#140a28', '#1a1030', '#ffcb3d');
    return {
      pista: (x, y, m, i, lado, v) => {
        if (m > -2.5) return borde;
        if (m + v.ancho / 2 < 1.3 && ((i >> 1) & 1)) return raya;
        if (ruido(x >> 3, y >> 3) < 0.12 && ruido(x, y >> 1) < 0.4) return refl;          // charcos con el neón reflejado
        return ruido(x >> 1, y >> 1) < 0.5 ? as1 : as2;
      },
      bordillo: (x, y, m, i) => ((i >> 1) & 1 ? k1 : k2),
      lento: (x, y) => ((x & 7) === 0 || (y & 7) === 0 ? ac2 : ac1),                          // la acera
      muro: (x, y, m, i) => (m < 1.2 ? (i & 1 ? v2 : v3) : v1),                                // barrera con luces
      vacio: () => f1,
      fuera: (x, y) => (((x >> 4) + (y >> 4)) & 1 ? f1 : ruido(x >> 2, y >> 2) < 0.15 ? ven : f2),   // tejados con ventanas
      atajo: (x, y) => ((x & 15) === 0 ? refl : ruido(x >> 1, y >> 1) < 0.5 ? ac1 : ac2),          // el callejón
    };
  })(),
  cielo: {
    colores: ['#0a0418', '#1a0a30', '#3a1050', '#7a2070'], niebla: '#4a1a5a', filas: 12, viento: 2, semilla: 77,
    atras(x, az) {
      for (let i = 0; i < 60; i++) rectPx(x, az() * CIELO_W, az() * 26, 1, 1, '#c8a8ff');
      for (let i = 0; i < 4; i++) { const a = i * 256 + az() * 80, b = 8 + az() * 10; rectPx(x, a, b, 24, 6, '#22212c'); rectPx(x, a + 1, b + 1, 22, 4, i & 1 ? '#22e3ff' : '#ff3df0'); rectPx(x, a + 11, b + 6, 2, 3, '#22212c'); }   // dirigibles con anuncios
    },
    delante(x, az) {   // rascacielos con pantallas de anuncios
      for (let i = 0; i < 40; i++) { const a = i * 26 + az() * 10, w = 14 + az() * 12, h = 16 + az() * 28; edificioPx(x, a, HZ, w, h, i & 1 ? '#1c1430' : '#241a3a', az() < 0.5 ? '#ffcb3d' : '#22e3ff', az, 0.35);
        if (az() < 0.35) { rectPx(x, a + 2, HZ - h + 3, w - 4, 6, ['#ff3df0', '#22e3ff', '#5ef27a', '#ffcb3d'][(az() * 4) | 0]); rectPx(x, a + 4, HZ - h + 5, w - 8, 2, '#1c1028'); } }
    },
  },
  pinta(P) {
    turboEn(P, 0.5, 0); turboEn(P, 4.4, -12); turboEn(P, 8.3, 12); turboEn(P, 12.6, 0); turboEn(P, 15.4, 0); turboEn(P, 19.5, 0, 20);
    const aceite = ['#3a2a5a', '#7a3aed', '#1c1028'], hype = ['#ff3df0', '#ffcb3d', '#22e3ff'];
    manchaEn(P, 2.4, 10, 9, 6, S_CHARCO, aceite, 1); manchaEn(P, 6.6, -10, 9, 6, S_CHARCO, aceite, 2); manchaEn(P, 11.2, 10, 9, 6, S_CHARCO, aceite, 3); manchaEn(P, 17.2, -8, 9, 6, S_CHARCO, aceite, 4);
    rampaEn(P, 2.6, 10); rampaEn(P, 18.6, 10);
    corrienteEn(P, 10.0, 0, 50, 30, 0, 50, hype); corrienteEn(P, 13.9, 0, 46, 30, 0, 50, hype);      // el tren del hype: te lleva sin que te enteres
  },
  cosas(P) {
    const l = [];
    regalosEn(P, 1.9); regalosEn(P, 9.3); regalosEn(P, 16.0);
    monedasPor(P, [[1.0, 5, 0], [3.3, 4, 12], [5.6, 4, 0], [7.4, 4, -12], [10.4, 4, 0], [12.0, 5, 0], [14.6, 4, 10], [18.0, 4, 0], [20.2, 4, 0]]);
    adornosPor(P, l, ['farolaneon', 'holograma', 'arcade', 'farolaneon', 'papelera'], 0.4, 20.6, 0.5, 10, 20, 11);
    for (const [u, a, p, f] of [[4.0, 22, 4, 0], [6.0, 18, 3.4, 2], [11.6, 22, 4.4, 1], [17.4, 18, 3.6, 3.4]]) movilEn(P, l, 'coche', u, a, p, f, { r: 5.2, muerde: true });   // tráfico: atropella
    cartelesPor(P, l, [[['PREVENTA', 'YA'], 0.8, 22, '#ff3df0', '#ffffff'], [['GOTY 2031', '(PROMETIDO)'], 3.9, -20, '#22212c', '#ffcb3d'], [['TRÁILER', 'NO REPRESENT.'], 6.9, 20, '#22212c', '#22e3ff'],
      [['TREN DEL', 'HYPE'], 9.6, -22, '#ffcb3d', '#22212c'], [['DÍA 1:', 'PARCHE 80 GB'], 13.0, 22, '#e63946', '#ffffff'], [['SOON™'], 16.6, -20, '#22212c', '#ffcb3d'], [['RESERVA', 'Y REZA'], 19.2, 22, '#7c3aed', '#ffffff'], [['CALLEJÓN'], 12.0, -22, '#22212c', '#22e3ff']]);
    return l;
  },
});
