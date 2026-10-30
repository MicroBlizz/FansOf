// Fans of Karts · MUNDO 2 · MINAS DEL GRIND: aquí se farmea el oro con el que Microblizz paga sus yates. Túneles estrechos de roca,
// carriles, vigas de madera, gemas en las paredes, vagonetas que cruzan sin mirar y un pozo que hay que saltar. Dificultad media.
'use strict';

PISTAS.push({
  id: 'minas', mundo: 2, nombre: 'Minas del Grind', lema: 'Nivel 1 de 500. Cada vuelta da 0,01 % de experiencia.', dificultad: 2, musica: 'boss7', color: '#6a4a3a', polvo: '#8a7060',
  puntos: [[480, 130], [700, 120], [880, 180], [905, 330], [770, 390], [610, 340], [465, 370], [440, 490], [610, 530], [840, 535], [910, 640], [860, 775], [700, 810], [560, 730], [420, 770],
    [380, 895], [220, 905], [115, 785], [155, 625], [255, 520], [175, 400], [150, 250], [280, 150]],
  ancho: 60, margen: 24, borde: 'muro',
  tramos: [{ deU: 12.5, aU: 14.5, ancho: 52, suave: 0.03 }],
  lejos: ['#2a1e1a', '#261a16'],
  atajos: [[8.91, 12.69, 22]],
  tema: (() => {
    const [t1, t2, t3, riel, traviesa, borde, k1, k2, g1, g2, r1, r2, r3, oro, f1, f2] = C32('#6a5a50', '#62534a', '#73635a', '#a8b0c0', '#6e4628', '#4a3a34', '#ffcb3d', '#2b2d3a', '#4a3e38', '#42363a', '#3a2e2a', '#2e2420', '#54443e', '#ffcb3d', '#2a1e1a', '#241a16');
    const grava = grano([g1, g1, g2]);
    return {
      pista: (x, y, m, i, lado, v) => {
        if (m > -2.5) return borde;
        const c = m + v.ancho / 2;
        if (c > 7 && c < 9) return riel;                                                    // los carriles de las vagonetas, a un lado
        if (c > 5 && c < 11 && (i & 1) === 0) return traviesa;
        return ruido(x >> 1, y >> 1) < 0.08 ? t3 : ruido(x, y) < 0.5 ? t1 : t2;
      },
      bordillo: (x, y, m, i) => ((i >> 1) & 1 ? k1 : k2),
      lento: (x, y) => grava(x, y),
      muro: (x, y, m) => (ruido(x >> 1, y >> 1) < 0.03 ? oro : m < 1.6 ? r3 : ruido(x >> 2, y >> 2) < 0.5 ? r1 : r2),     // roca con vetas de oro
      vacio: () => f1,
      fuera: (x, y) => (ruido(x >> 3, y >> 3) < 0.5 ? f1 : f2),
      atajo: (x, y) => ((y + x) % 9 === 0 ? traviesa : grava(x, y)),        // el túnel viejo, sin asfaltar
    };
  })(),
  cielo: {
    colores: ['#120c0a', '#1c1410', '#2a1e18', '#3a2a20'], niebla: '#3a2a22', filas: 14, viento: 0, semilla: 81,
    atras(x, az) {     // el techo de la cueva: estalactitas y lámparas colgando
      for (let i = 0; i < 70; i++) { const a = az() * CIELO_W, h = 3 + az() * 12; rectPx(x, a, 0, 3, h, '#2a1e18'); rectPx(x, a + 1, h, 1, 2, '#2a1e18'); }
      for (let i = 0; i < 12; i++) { const a = i * 85 + az() * 30, h = 8 + az() * 10; rectPx(x, a, 0, 1, h, '#5a4a40'); rectPx(x, a - 1, h, 3, 2, '#ffcb3d'); rectPx(x, a - 3, h + 2, 7, 1, '#7a5a20'); }
    },
    delante(x, az) {   // la pared del fondo: vigas, carriles que se pierden y vetas de gemas
      rectPx(x, 0, 24, CIELO_W, HZ - 24, '#2e221c');
      for (let i = 0; i < 60; i++) rectPx(x, az() * CIELO_W, 26 + az() * 22, 2, 1, ['#22e3ff', '#c35cff', '#ffcb3d'][i % 3]);
      for (let i = 0; i < 12; i++) { const a = i * 86 + 10; rectPx(x, a, 22, 4, HZ - 22, '#6e4628'); rectPx(x, a + 30, 22, 4, HZ - 22, '#6e4628'); rectPx(x, a - 2, 20, 38, 4, '#8b5530'); rectPx(x, a + 6, 28, 22, HZ - 28, '#140e0c'); }
      rectPx(x, 0, HZ - 3, CIELO_W, 1, '#a8b0c0');
    },
  },
  pinta(P) {
    turboEn(P, 0.5, 0); turboEn(P, 8.4, -8); turboEn(P, 17.2, 0, 20);
    rampaEn(P, 4.75, 10); huecoEn(P, 4.98, 26);      // el pozo de la mina: o saltas, o bajas a por más oro
    const charco = ['#3a3a48', '#2a2a38', '#5a5a70'];
    manchaEn(P, 2.5, 10, 8, 6, S_CHARCO, charco, 1); manchaEn(P, 10.6, -8, 8, 6, S_CHARCO, charco, 2); manchaEn(P, 15.4, 8, 8, 6, S_CHARCO, charco, 3); manchaEn(P, 20.3, -8, 8, 6, S_CHARCO, charco, 4);
  },
  cosas(P) {
    const l = [];
    regalosEn(P, 1.9); regalosEn(P, 9.6); regalosEn(P, 16.4);
    monedasPor(P, [[1.0, 5, 0], [3.3, 4, 0], [5.1, 3, 0, 15], [6.9, 4, 10], [8.9, 4, -10], [11.4, 5, 0], [13.6, 4, 0], [15.0, 4, 10], [18.6, 5, -8], [21.4, 4, 0]]);
    adornosPor(P, l, ['viga', 'gema', 'dinamita', 'viga', 'gema'], 0.4, 22.6, 0.55, 8, 16, 5);
    for (const [u, lado, per, f] of [[2.0, -6, 3, 0], [2.3, 8, 3, 0.5], [7.0, 0, 3.4, 0.3], [15.9, -8, 3.2, 0.1], [16.3, 8, 3.2, 0.6], [20.9, 0, 3.6, 0.4]]) caidaEn(P, l, 'pedrusco', u, lado, per, f, { radio: 9 });   // derrumbes
    movilEn(P, l, 'vagoneta', 3.2, 20, 3.4, 0, { r: 4.2 }); movilEn(P, l, 'vagoneta', 7.8, 18, 3.8, 2); movilEn(P, l, 'vagoneta', 12.2, 16, 3.2, 1, { r: 4.2 }); movilEn(P, l, 'vagoneta', 19.6, 18, 3.6, 3);
    cartelesPor(P, l, [[['NIVEL 1', 'DE 500'], 0.8, 18, '#22212c', '#ffcb3d'], [['¡SALTA!'], 4.4, -16, '#e63946', '#ffffff'], [['XP X 0,01'], 7.4, 16, '#22212c', '#5ef27a'],
      [['MINA DEL', 'PASE DE BATALLA'], 10.9, -16, '#7c3aed', '#ffffff'], [['FARMEO', 'OBLIGATORIO'], 14.0, 16, '#22212c', '#ffcb3d'], [['SOON™'], 18.0, -16, '#22212c', '#ffcb3d'], [['ORO PARA', 'EL CEO'], 21.0, 16, '#e63946', '#ffffff'], [['¡DERRUMBES!'], 1.6, 16, '#ffcb3d', '#22212c'], [['TÚNEL', 'VIEJO'], 8.7, -16, '#22212c', '#ffcb3d']]);
    return l;
  },
});
