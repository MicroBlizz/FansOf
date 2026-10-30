// Fans of Karts (prototipo) · PISTA 2 · CEMENTERIO DE JUEGOS: donde descansan los juegos que Microblizz compró y cerró. De noche, con
// camino de tierra entre lápidas, verja de hierro, barro que frena y fantasmas mirando. Dificultad media: más larga y con horquillas.
// Trazado propio.
'use strict';

PISTAS.push({
  id: 'cementerio', invertida: true, mundo: 2, nombre: 'Cementerio de juegos', lema: 'Aquí descansan los juegos que Microblizz compró. Conduce con respeto. O no.', dificultad: 2, musica: 'boss6', color: '#3b2457', polvo: '#8a7a6a',
  puntos: [[440, 154], [560, 150], [790, 190], [890, 320], [850, 470], [700, 500], [600, 420], [480, 400], [420, 520], [520, 640], [700, 660], [860, 720], [880, 850], [740, 900],
    [520, 880], [330, 890], [170, 830], [140, 660], [230, 520], [150, 380], [160, 240], [300, 160]],
  ancho: 62, margen: 36, borde: 'muro',
  tramos: [
    { deU: 5.4, aU: 7.6, ancho: 52, suave: 0.03 },      // el paso estrecho entre los panteones
    { deU: 13.3, aU: 15.6, ancho: 74, suave: 0.03 },    // la avenida de los juegos cancelados
  ],
  lejos: ['#1f403a', '#1b3833'],
  tema: (() => {
    const [t1, t2, t3, piedra, borde, k1, k2, h1, h2, h3, mata, v1, v2, f1, f2, f3] = C32('#7c6c86', '#73637c', '#87778f', '#a898ac', '#5a4a66', '#e8e2d0', '#4a3f66', '#2f5f52', '#2a574a', '#356858', '#5a9a72', '#2a2438', '#6e6890', '#1f403a', '#1b3833', '#2a5248');
    const tierra = grano([t1, t1, t2, t3]), hierba = grano([h1, h1, h2, h3]);
    return {
      pista: (x, y, m, i, lado, v) => {
        if (m > -2.5) return borde;                                                  // el borde del camino, más oscuro
        if (m + v.ancho / 2 < 1.6 && (i & 3) === 0) return piedra;                   // piedras claras por el centro
        return ruido(x >> 1, y >> 1) < 0.06 ? piedra : tierra(x, y);
      },
      bordillo: (x, y, m, i) => ((i & 1) ? k1 : k2),                                 // huesos y piedras
      lento: (x, y) => (ruido(x, y) < 0.035 ? mata : hierba(x >> 1, y >> 1)),
      muro: (x, y, m) => (((x + y) & 7) === 0 || m < 1.5 ? v2 : v1),                 // la verja de hierro
      vacio: () => f2,
      fuera: (x, y) => (ruido(x >> 2, y >> 2) < 0.1 ? f3 : ((x >> 5) + (y >> 5)) & 1 ? f1 : f2),
    };
  })(),
  cielo: {
    colores: ['#150d2c', '#231545', '#38235f', '#553a78'], niebla: '#4a5f72', filas: 13, viento: 2, semilla: 13,
    // noche: estrellas, la luna y nubes finas
    atras(x, az) {
      for (let i = 0; i < 150; i++) rectPx(x, az() * CIELO_W, az() * 34, 1, 1, az() > 0.75 ? '#ffffff' : '#a898d8');
      elipsePx(x, 250, 15, 11, 11, '#e8e2ff'); elipsePx(x, 247, 12, 3, 3, '#c9c0ee'); elipsePx(x, 254, 19, 2, 2, '#c9c0ee'); elipsePx(x, 244, 20, 1, 1, '#c9c0ee');
      elipsePx(x, 760, 22, 5, 5, '#8fe8d0');      // la «luna verde»: el fuego fatuo gigante
      for (let i = 0; i < 9; i++) { const cx = az() * CIELO_W, cy = 8 + az() * 26; rectPx(x, cx, cy, 30 + az() * 50, 1, '#4a3270'); rectPx(x, cx + 8, cy + 1, 20 + az() * 30, 1, '#4a3270'); }
    },
    // delante: colinas, árboles secos, cruces, un panteón y la verja
    delante(x, az) {
      const negro = '#120b24', casi = '#1c1338';
      for (let i = 0; i < 9; i++) montePx(x, i * 120 + az() * 60, HZ, 70 + az() * 50, 9 + az() * 9, casi);
      for (let i = 0; i < 20; i++) {
        const a = i * 51 + az() * 24, t = az();
        if (t < 0.38) {          // árbol seco
          const h = 16 + az() * 12; rectPx(x, a, HZ - h, 2, h, negro);
          for (let k = 0; k < 5; k++) { rectPx(x, a - 1 - k, HZ - h + 3 + k * 0.6 - k, 1, 2, negro); rectPx(x, a + 2 + k, HZ - h + 6 - k * 1.2, 1, 2, negro); }
          rectPx(x, a - 6, HZ - h - 2, 1, 3, negro); rectPx(x, a + 7, HZ - h - 1, 1, 4, negro);
        } else if (t < 0.62) { rectPx(x, a, HZ - 10, 2, 10, negro); rectPx(x, a - 3, HZ - 8, 8, 2, negro); }       // cruz
        else if (t < 0.86) { rectPx(x, a, HZ - 6, 6, 6, negro); rectPx(x, a + 1, HZ - 8, 4, 2, negro); }           // lápida
        else {                   // panteón con una luz dentro
          rectPx(x, a, HZ - 14, 18, 14, negro); montePx(x, a + 9, HZ - 14, 11, 6, negro); rectPx(x, a + 8, HZ - 23, 2, 4, negro); rectPx(x, a + 6, HZ - 21, 6, 1, negro);
          rectPx(x, a + 7, HZ - 8, 4, 8, '#5ef2d0'); rectPx(x, a + 8, HZ - 7, 2, 7, '#d8fff4');
        }
      }
      for (let i = 0; i < CIELO_W; i += 4) rectPx(x, i, HZ - 4, 1, 4, negro);
      rectPx(x, 0, HZ - 3, CIELO_W, 1, negro);
    },
  },
  pinta(P) {
    turboEn(P, 0.5, 0); turboEn(P, 9.45, 10); turboEn(P, 14.3, -16); turboEn(P, 19.5, 0, 20);
    const barro = ['#4a3626', '#5a4430', '#3a2a1c'];
    manchaEn(P, 2.4, 12, 12, 7, S_BARRO, barro, 1); manchaEn(P, 4.5, -10, 11, 7, S_BARRO, barro, 2); manchaEn(P, 8.4, 10, 10, 7, S_BARRO, barro, 3);
    manchaEn(P, 11.4, -12, 12, 8, S_BARRO, barro, 4); manchaEn(P, 15.5, 16, 13, 8, S_BARRO, barro, 5); manchaEn(P, 17.5, -10, 11, 7, S_BARRO, barro, 6); manchaEn(P, 20.4, 10, 10, 7, S_BARRO, barro, 7);
  },
  cosas(P) {
    const l = [];
    regalosEn(P, 1.55); regalosEn(P, 9.9); regalosEn(P, 16.5);
    monedasEn(P, 0.9, 5, 0); monedasEn(P, 2.8, 4, -12); monedasEn(P, 4.1, 4, 12); monedasEn(P, 5.8, 5, 0); monedasEn(P, 7.5, 4, -10); monedasEn(P, 8.9, 4, -12);
    monedasEn(P, 10.6, 4, 12); monedasEn(P, 12.3, 4, -12); monedasEn(P, 13.6, 6, 14, 14, -4); monedasEn(P, 15.2, 4, -10); monedasEn(P, 17.9, 4, 12); monedasEn(P, 19.1, 4, -10); monedasEn(P, 20.8, 4, 0);
    for (const [id, u, d, o] of [['lapida', 0.3, 14], ['lapida', 0.6, 20], ['cruz', 0.3, -16], ['arbol', 1.2, -22], ['farol', 1.5, 12], ['lapida', 2.1, -16], ['fantasma', 2.6, 20, { flota: 4, r: 0 }], ['arbol', 3.2, 22],
      ['lapida', 3.6, -14], ['cruz', 4.2, 16], ['farol', 4.8, -12], ['lapida', 5.6, 10], ['lapida', 6.0, -10], ['cruz', 6.5, 10], ['lapida', 7.0, -10], ['arbol', 7.8, 20], ['fantasma', 8.3, -18, { flota: 4, r: 0 }],
      ['lapida', 8.8, 16], ['farol', 9.4, -12], ['cruz', 10.2, 14], ['lapida', 10.7, -16], ['arbol', 11.5, 22], ['lapida', 12.1, 14], ['farol', 12.8, 12], ['lapida', 13.5, -18], ['cruz', 13.9, -18], ['lapida', 14.3, 18],
      ['lapida', 14.7, -18], ['fantasma', 15.1, 22, { flota: 4, r: 0 }], ['arbol', 15.9, -22], ['lapida', 16.4, 16], ['farol', 16.9, 12], ['cruz', 17.6, 16], ['arbol', 18.3, -20], ['lapida', 18.8, 14], ['lapida', 19.6, -14],
      ['farol', 20.2, 12], ['cruz', 20.7, -14], ['lapida', 21.3, 16], ['arbol', 21.6, -22]]) adorno(P, l, id, u, d, o);
    cartelEn(P, l, ['AQUÍ YACE', 'TU JUEGO'], 0.75, -24, '#2a2438', '#e8e2d0');
    cartelEn(P, l, ['RIP'], 3.0, -22, '#2a2438', '#5ef2d0');
    cartelEn(P, l, ['SECUELA', 'CANCELADA'], 7.3, 18, '#e63946', '#ffffff');
    cartelEn(P, l, ['SERVIDORES', 'APAGADOS'], 11.0, 24, '#2a2438', '#ff8a1f');
    cartelEn(P, l, ['SOON™'], 13.2, 24, '#22212c', '#ffcb3d');
    cartelEn(P, l, ['NO PISAR', 'LOS JUEGOS'], 17.2, -24, '#2a2438', '#e8e2d0');
    cartelEn(P, l, ['RIP'], 19.9, 22, '#2a2438', '#5ef2d0');
    return l;
  },
});
