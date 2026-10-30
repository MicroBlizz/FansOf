// Fans of Karts · MUNDO 2 · DESIERTO DEL MUNDO ABIERTO: un mapa enorme y nada que hacer. Carretera de asfalto viejo entre dunas, arena
// que frena, dunas que te hacen saltar, rodadoras que cruzan y signos de interrogación que no llevan a ninguna parte. Dificultad media.
'use strict';

PISTAS.push({
  id: 'desierto', mundo: 2, nombre: 'Desierto del Mundo Abierto', lema: 'Cien kilómetros cuadrados de mapa. Contenido: tres cactus y un DLC.', dificultad: 2, musica: 'olvidados', color: '#e0a050', polvo: '#e8c48a',
  puntos: [[520, 120], [760, 130], [900, 250], [885, 420], [700, 475], [520, 430], [380, 490], [365, 630], [505, 705], [700, 655], [860, 705], [900, 845], [740, 910], [480, 900], [260, 905],
    [130, 785], [115, 560], [185, 380], [140, 240], [260, 140]],
  ancho: 76, margen: 46, borde: 'muro',
  tramos: [{ deU: 15.4, aU: 16.6, ancho: 64, suave: 0.03 }],
  lejos: ['#e8b870', '#e0b068'],
  atajos: [[8.45, 11.55, 26]],
  tema: (() => {
    const [as1, as2, grieta, raya, borde, k1, k2, a1, a2, a3, d1, d2, f1, f2, f3] = C32('#7a6a62', '#73635b', '#5a4a44', '#ffe14d', '#d8c8a8', '#ffffff', '#e63946', '#f2c88a', '#e8bc7c', '#f8d8a0', '#c88a50', '#b07a44', '#e8b870', '#e0b068', '#f0c480');
    const arena = grano([a1, a1, a2, a3]);
    return {
      pista: (x, y, m, i, lado, v) => {
        if (m > -3) return borde;
        if (m + v.ancho / 2 < 1.3 && ((i >> 1) & 1)) return raya;
        if (ruido(x >> 3, y >> 3) < 0.07 && ruido(x, y) < 0.5) return grieta;              // asfalto agrietado por el sol
        return ruido(x >> 1, y >> 1) < 0.5 ? as1 : as2;
      },
      bordillo: (x, y, m, i) => ((i >> 1) & 1 ? k1 : k2),
      lento: (x, y) => arena(x, y),
      muro: (x, y, m) => (m < 2 ? d2 : d1),                                                // la duna que hace de pared
      vacio: () => f1,
      fuera: (x, y) => (Math.sin(x / 23 + y / 41) > 0.85 ? f3 : ((x >> 5) + (y >> 5)) & 1 ? f1 : f2),
    };
  })(),
  cielo: {
    colores: ['#3a8ae0', '#68aaee', '#a8d0f4', '#fbe8c0'], niebla: '#f6dcb0', filas: 12, viento: 1, semilla: 73,
    atras(x, az) {
      elipsePx(x, 520, 16, 12, 12, '#fff3a0'); elipsePx(x, 520, 16, 9, 9, '#ffffff');
      for (let i = 0; i < 4; i++) nubePx(x, az() * CIELO_W, 8 + az() * 14, 10 + az() * 10, '#ffffff', '#d8e8f4');
      for (let i = 0; i < 5; i++) { const a = az() * CIELO_W, b = 12 + az() * 14; rectPx(x, a, b, 3, 1, '#3a2a2a'); rectPx(x, a - 2, b - 1, 2, 1, '#3a2a2a'); rectPx(x, a + 3, b - 1, 2, 1, '#3a2a2a'); }   // buitres
    },
    delante(x, az) {
      for (let i = 0; i < 10; i++) montePx(x, i * 110 + az() * 50, HZ, 60 + az() * 40, 8 + az() * 8, '#d8a060');
      for (let i = 0; i < 5; i++) { const a = i * 205 + 60 + az() * 40; rectPx(x, a, HZ - 26, 22, 26, '#b86a3a'); rectPx(x, a - 2, HZ - 28, 26, 3, '#c87a44'); rectPx(x, a + 4, HZ - 22, 3, 18, '#a05a30'); }   // mesetas
      for (let i = 0; i < 16; i++) { const a = az() * CIELO_W, h = 6 + az() * 6; rectPx(x, a, HZ - h, 2, h, '#3f8a4a'); rectPx(x, a - 2, HZ - h + 2, 2, 1, '#3f8a4a'); rectPx(x, a - 2, HZ - h, 1, 2, '#3f8a4a'); }
      // el espejismo: un cartel de DLC flotando en el horizonte
      rectPx(x, 800, HZ - 18, 30, 10, '#ffcb3d'); rectPx(x, 802, HZ - 16, 26, 6, '#22212c'); rectPx(x, 806, HZ - 14, 18, 2, '#ffcb3d');
    },
  },
  pinta(P) {
    turboEn(P, 0.5, 0); turboEn(P, 7.5, 0); turboEn(P, 13.4, 0); turboEn(P, 17.8, 0, 22);
    rampaEn(P, 3.3, 12); rampaEn(P, 11.3, 12);       // las dunas: saltas por encima
    const arena = ['#f2c88a', '#e8bc7c', '#d8a868'];
    manchaEn(P, 1.9, 16, 14, 8, S_BARRO, arena, 1); manchaEn(P, 4.9, -14, 14, 8, S_BARRO, arena, 2); manchaEn(P, 8.6, 16, 14, 8, S_BARRO, arena, 3);
    manchaEn(P, 12.4, -16, 14, 8, S_BARRO, arena, 4); manchaEn(P, 15.0, 14, 13, 8, S_BARRO, arena, 5); manchaEn(P, 18.9, -14, 14, 8, S_BARRO, arena, 6);
  },
  cosas(P) {
    const l = [];
    regalosEn(P, 2.4); regalosEn(P, 9.2); regalosEn(P, 15.8);
    monedasPor(P, [[1.0, 5, 0], [3.5, 3, 0, 16], [5.9, 4, 14], [7.0, 4, -14], [10.2, 5, 0], [11.5, 3, 0, 16], [13.9, 4, 14], [16.9, 5, -12], [19.1, 4, 0]]);
    adornosPor(P, l, ['cactus', 'cactus', 'roca', 'craneo', 'cactus', 'roca'], 0.4, 19.6, 0.6, 14, 30, 4);
    for (const [u, d] of [[2.9, -30], [6.4, 32], [9.8, -32], [14.4, 30], [18.4, -30]]) adorno(P, l, 'pregunta', u, d, { flota: 2, r: 0 });
    movilEn(P, l, 'rodadora', 4.3, 30, 4, 0, { r: 3 }); movilEn(P, l, 'rodadora', 8.1, 30, 3.6, 1); movilEn(P, l, 'rodadora', 14.6, 30, 4.4, 2.5); movilEn(P, l, 'rodadora', 17.3, 28, 3.8, 4);
    cartelesPor(P, l, [[['MAPA', '100 KM²'], 0.8, 28, '#22212c', '#ffcb3d'], [['NADA QUE', 'HACER: 99 KM'], 3.9, -28, '#b86a3a', '#ffffff'], [['MISIÓN', 'SECUNDARIA ?'], 6.9, 28, '#ffcb3d', '#22212c'],
      [['OASIS', '(DLC)'], 10.6, -28, '#22b8f0', '#ffffff'], [['GASOLINERA', 'CERRADA'], 13.1, 28, '#e63946', '#ffffff'], [['SOON™'], 16.3, -28, '#22212c', '#ffcb3d'], [['ESPEJISMO', 'PREMIUM'], 18.6, 28, '#22212c', '#5ef2d0'], [['ATAJO', '(SIN AGUA)'], 8.3, 30, '#b86a3a', '#ffffff']]);
    return l;
  },
});
