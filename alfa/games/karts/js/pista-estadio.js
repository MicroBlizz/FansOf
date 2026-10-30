// Fans of Karts · MUNDO 2 · ESTADIO DE ESPORTS: la gran final de un torneo patrocinado por diecisiete bebidas energéticas. Pista de
// colores con gradas llenas, pantallas gigantes, focos, cámaras de televisión que cruzan y una chicane con nombre de patrocinador.
'use strict';

PISTAS.push({
  id: 'estadio', invertida: true, mundo: 2, nombre: 'Estadio de eSports', lema: 'La gran final. Premio: un millón de puntos de experiencia (no canjeables).', dificultad: 2, musica: 'boss10', color: '#22b8f0',
  puntos: [[512, 175], [760, 175], [885, 260], [905, 420], [860, 560], [885, 720], [800, 855], [620, 885], [500, 800], [380, 880], [220, 865], [130, 720], [140, 560], [230, 470], [160, 370], [160, 260], [300, 175]],
  ancho: 70, margen: 34, borde: 'muro',
  tramos: [{ deU: 7.4, aU: 9.6, ancho: 60, suave: 0.03 }, { deU: 12.4, aU: 14.4, ancho: 62, suave: 0.03 }],
  lejos: ['#1c2a4a', '#1a2644'],
  voladores: [{ id: 'dirigible', s: 500, y: 12, vel: 6, tam: 0.34 }],
  tema: (() => {
    const [p1, p2, raya, borde, k1, k2, h1, h2, h3, logo, v1, v2, v3, f1, f2] = C32('#3a4a8a', '#364684', '#ffffff', '#22e3ff', '#ff3df0', '#22e3ff', '#3fae4a', '#38a242', '#48b852', '#ffffff', '#1c1f2a', '#ffcb3d', '#22e3ff', '#1c2a4a', '#22325a');
    const cesped = (x, y) => ((y >> 4) & 1 ? h1 : h2);                                          // césped cortado a rayas
    return {
      pista: (x, y, m, i, lado, v) => {
        if (m > -3) return borde;
        if (m + v.ancho / 2 < 1.3) return raya;
        return ruido(x >> 1, y >> 1) < 0.5 ? p1 : p2;
      },
      bordillo: (x, y, m, i) => ((i >> 1) & 1 ? k1 : k2),
      lento: (x, y) => (ruido(x >> 3, y >> 3) < 0.03 ? logo : cesped(x, y)),
      muro: (x, y, m, i) => (m < 1.2 || m > 5.6 ? v1 : (i >> 2) & 1 ? v2 : v3),               // vallas publicitarias de colores
      vacio: () => f1,
      fuera: (x, y) => ((((x >> 3) + (y >> 3)) & 1) && ruido(x >> 3, y >> 3) < 0.6 ? f2 : f1),  // las gradas, llenas de gente
    };
  })(),
  cielo: {
    colores: ['#0a0e20', '#141c3a', '#202c54', '#34407a'], niebla: '#2a3666', filas: 11, viento: 0, semilla: 91,
    atras(x, az) {     // noche con focos y el marcador gigante
      for (let i = 0; i < 80; i++) rectPx(x, az() * CIELO_W, az() * 30, 1, 1, '#4a5a9a');
      for (let i = 0; i < 8; i++) { const a = i * 128 + 40; for (let k = 0; k < 14; k++) rectPx(x, a - k, 6 + k * 2, 3 + k * 0.4, 2, k < 3 ? '#fff9d0' : '#3a4a80'); }
      rectPx(x, 380, 4, 120, 18, '#1c1f2a'); rectPx(x, 382, 6, 116, 14, '#22e3ff'); rectPx(x, 386, 9, 30, 8, '#1c1f2a'); rectPx(x, 464, 9, 30, 8, '#1c1f2a'); rectPx(x, 428, 11, 24, 4, '#ff3df0');
    },
    delante(x, az) {   // las gradas: filas de gente de colores, con carteles y pantallas
      for (let f = 0; f < 6; f++) { const y = 26 + f * 4; rectPx(x, 0, y, CIELO_W, 4, f & 1 ? '#2a3666' : '#24305a'); for (let i = 0; i < 300; i++) if (az() < 0.85) rectPx(x, i * 3.4 + (f & 1) * 1.7, y, 2, 2, ['#ff5c8a', '#ffcb3d', '#22e3ff', '#f4f4f8', '#5ef27a', '#c35cff'][(az() * 6) | 0]); }
      for (let i = 0; i < 9; i++) { const a = i * 114 + 30; rectPx(x, a, 20, 26, 12, '#1c1f2a'); rectPx(x, a + 2, 22, 22, 8, ['#ff3df0', '#22e3ff', '#ffcb3d'][i % 3]); }
      rectPx(x, 0, HZ - 3, CIELO_W, 3, '#1c1f2a');
    },
  },
  pinta(P) {
    turboEn(P, 0.55, 0); turboEn(P, 4.3, 0); turboEn(P, 10.6, 0); turboEn(P, 15.3, 0, 20);
    rampaEn(P, 1.6, 10); rampaEn(P, 6.2, 10);       // el escenario de la ceremonia: se salta por encima
    const bebida = ['#5ef27a', '#c0ff60', '#2f9a4a'];
    manchaEn(P, 2.6, 12, 9, 6, S_CHARCO, bebida, 1); manchaEn(P, 6.1, -12, 9, 6, S_CHARCO, bebida, 2); manchaEn(P, 11.6, 10, 9, 6, S_CHARCO, bebida, 3); manchaEn(P, 14.8, -10, 9, 6, S_CHARCO, bebida, 4);
  },
  cosas(P) {
    const l = [];
    regalosEn(P, 1.9); regalosEn(P, 7.1); regalosEn(P, 12.1);
    monedasPor(P, [[0.9, 5, 0], [3.0, 4, 12], [5.2, 4, -12], [8.4, 4, 0], [9.9, 4, 10], [11.2, 4, -10], [13.4, 4, 0], [15.8, 5, 0]]);
    adornosPor(P, l, ['foco', 'altavoz', 'camaratv', 'copa', 'altavoz'], 0.4, 16.6, 0.6, 12, 22, 6);
    for (const [u, lado, per, f] of [[2.4, -12, 3.2, 0], [5.0, 12, 3.2, 0.5], [11.0, 0, 3.6, 0.2], [14.4, -10, 3.4, 0.7]]) caidaEn(P, l, 'balon', u, lado, per, f, { radio: 9, alto: 64 });   // los balones del descanso
    movilEn(P, l, 'camaratv', 3.8, 22, 4.8, 0); movilEn(P, l, 'camaratv', 9.0, 20, 4.2, 2); movilEn(P, l, 'camaratv', 13.9, 20, 5, 4);
    cartelesPor(P, l, [[['GRAN FINAL'], 0.8, 24, '#22212c', '#22e3ff'], [['PATROCINA:', 'MICROBLIZZ'], 2.8, -22, '#e63946', '#ffffff'], [['CHICANE', 'ENERGY+'], 8.0, 22, '#5ef27a', '#22212c'],
      [['PREMIO: XP', 'NO CANJEABLE'], 10.0, -22, '#22212c', '#ffcb3d'], [['PING: 999'], 12.8, 22, '#e63946', '#ffffff'], [['SOON™'], 15.0, -22, '#22212c', '#ffcb3d']]);
    return l;
  },
});
