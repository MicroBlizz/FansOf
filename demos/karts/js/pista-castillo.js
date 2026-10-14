// Fans of Karts · MUNDO 4 · CASTILLO DEL PARCHE 1.0: un castillo de fantasía en obras desde el lanzamiento. Adoquines entre murallas,
// andamios, caballeros que patrullan (y pinchan), una catapulta que tira piedras a la pista y el foso, que se salta por el puente roto.
'use strict';

PISTAS.push({
  id: 'castillo', mundo: 4, nombre: 'Castillo del Parche 1.0', lema: 'El castillo sale terminado en el parche 1.0. Lleva en el parche 0.9 desde 2019.', dificultad: 3, musica: 'heroes', color: '#8a7ab0', polvo: '#b8b0c8',
  puntos: [[520, 880], [320, 890], [170, 810], [150, 650], [280, 580], [260, 440], [130, 380], [150, 220], [300, 140], [460, 190], [540, 320], [680, 270], [720, 140], [880, 170],
    [910, 330], [800, 430], [650, 470], [580, 600], [720, 670], [880, 650], [920, 800], [760, 890]],
  ancho: 62, margen: 34, borde: 'muro',
  tramos: [{ deU: 4.2, aU: 5.8, ancho: 54, suave: 0.03 }, { deU: 15.6, aU: 17.2, ancho: 54, suave: 0.03 }],
  lejos: ['#4a6a3a', '#466436'],
  tema: (() => {
    const [a1, a2, a3, junta, borde, k1, k2, h1, h2, h3, m1, m2, m3, ag1, ag2, f1, f2] = C32('#a8a0b8', '#9c94ac', '#b4acc4', '#6a6478', '#5a5468', '#ffcb3d', '#8b5cf6', '#5a9a4a', '#529044', '#68a856', '#8a8298', '#7a7288', '#b0a8c0', '#3a7ab0', '#4a8ac0', '#4a6a3a', '#466436');
    const hierba = grano([h1, h1, h2, h3]);
    return {
      pista: (x, y, m) => {
        if (m > -2.5) return borde;
        const fila = y >> 3, cx = (x + (fila & 1) * 6) % 12;
        if ((y & 7) === 0 || cx === 0) return junta;                                           // adoquines
        return ruido((x + (fila & 1) * 6) / 12 | 0, fila) < 0.33 ? a3 : ruido(x, y) < 0.5 ? a1 : a2;
      },
      bordillo: (x, y, m, i) => ((i >> 1) & 1 ? k1 : k2),                                     // banderines del torneo
      lento: (x, y) => hierba(x, y),
      muro: (x, y, m) => { if (m < 1.5) return m3; const f = y >> 2; return ((y & 3) === 0 || ((x + (f & 1) * 4) & 7) === 0) ? m2 : m1; },    // muralla de piedra
      vacio: (x, y) => (((x + y) >> 3) & 1 ? ag1 : ag2),                                        // el foso
      fuera: (x, y) => (ruido(x >> 3, y >> 3) < 0.5 ? f1 : f2),
      atajo: (x, y) => (((x >> 2) + (y >> 2)) & 1 ? u32('#c8a070') : u32('#b89060')),           // el patio de arena del torneo
    };
  })(),
  cielo: {
    colores: ['#3a5ab0', '#6a8ad0', '#a8c0e8', '#f0e0d0'], niebla: '#d8d0e0', filas: 11, viento: 2, semilla: 53,
    atras(x, az) {
      for (let i = 0; i < 8; i++) nubePx(x, az() * CIELO_W, 8 + az() * 22, 14 + az() * 20, '#ffffff', '#c8d0e8');
      // un dragón a lo lejos (con casco de obra)
      rectPx(x, 820, 14, 14, 4, '#3a7a4a'); rectPx(x, 832, 12, 5, 3, '#3a7a4a'); rectPx(x, 822, 10, 6, 4, '#2f6a3a'); rectPx(x, 826, 8, 4, 2, '#2f6a3a'); rectPx(x, 833, 10, 4, 2, '#ffcb3d');
    },
    delante(x, az) {   // el castillo de fondo con grúas, torres a medio hacer y colinas
      for (let i = 0; i < 9; i++) montePx(x, i * 120 + az() * 50, HZ, 60 + az() * 40, 8 + az() * 8, '#5a8a4a');
      rectPx(x, 380, HZ - 24, 120, 24, '#8a8298'); for (let k = 0; k < 15; k++) rectPx(x, 380 + k * 8, HZ - 27, 4, 3, '#8a8298');
      for (const [t, h] of [[372, 40], [432, 48], [496, 34]]) { rectPx(x, t, HZ - h, 14, h, '#9c94ac'); montePx(x, t + 7, HZ - h, 9, 9, '#3a5ab0'); rectPx(x, t + 5, HZ - h + 8, 3, 5, '#1c1028'); }
      rectPx(x, 520, HZ - 52, 2, 52, '#ffcb3d'); rectPx(x, 500, HZ - 52, 40, 2, '#ffcb3d'); rectPx(x, 506, HZ - 50, 1, 10, '#4a4e66'); rectPx(x, 503, HZ - 40, 7, 4, '#a8a0b8');   // la grúa
      rectPx(x, 420, HZ - 30, 40, 6, '#ffcb3d'); rectPx(x, 424, HZ - 29, 32, 4, '#22212c');
      for (let i = 0; i < 20; i++) { const a = az() * CIELO_W; if (a > 360 && a < 550) continue; pinoPx(x, a, HZ, 5 + az() * 6, '#2f6a3a'); }
    },
  },
  atajos: [[17.39, 21.14, 26]],
  pinta(P) {
    turboEn(P, 0.5, 0); turboEn(P, 6.6, 0); turboEn(P, 10.9, 0); turboEn(P, 18.9, 0, 20);
    rampaEn(P, 13.45, 12); huecoEn(P, 13.68, 34);         // el puente levadizo, roto: se salta el foso
    const barro = ['#6a5a4a', '#7a6a58', '#5a4a3a'];
    manchaEn(P, 1.6, 10, 11, 7, S_BARRO, barro, 1); manchaEn(P, 8.6, -10, 11, 7, S_BARRO, barro, 2); manchaEn(P, 15.8, 8, 10, 7, S_BARRO, barro, 3); manchaEn(P, 20.2, -10, 11, 7, S_BARRO, barro, 4);
  },
  cosas(P) {
    const l = [];
    regalosEn(P, 1.9); regalosEn(P, 9.6); regalosEn(P, 16.6);
    monedasPor(P, [[1.0, 5, 0], [3.4, 4, 10], [6.0, 4, 0], [7.6, 4, -10], [11.6, 5, 0], [13.6, 3, 0, 15], [14.6, 4, 0], [17.8, 4, 10], [19.6, 4, -10], [21.2, 5, 0]]);
    adornosPor(P, l, ['torre', 'andamio', 'estandarte', 'andamio', 'estandarte', 'cono'], 0.4, 21.6, 0.55, 10, 22, 12);
    movilEn(P, l, 'caballero', 4.0, 18, 4.4, 0, { muerde: true, r: 3.2 }); movilEn(P, l, 'caballero', 9.0, 20, 5, 2, { muerde: true, r: 3.2 }); movilEn(P, l, 'caballero', 15.2, 18, 4.2, 1, { muerde: true, r: 3.2 }); movilEn(P, l, 'caballero', 19.0, 20, 4.8, 3, { muerde: true, r: 3.2 });
    // la catapulta del castillo tira piedras a la pista: la sombra avisa
    for (const [u, lado, per, f] of [[6.8, -10, 3.6, 0], [7.2, 12, 3.6, 0.5], [11.2, 0, 4.2, 0.2], [17.6, -8, 3.8, 0.7], [18.1, 10, 3.8, 0.2]]) caidaEn(P, l, 'pedrusco', u, lado, per, f, { radio: 9 });
    cartelesPor(P, l, [[['EN OBRAS', 'DESDE 2019'], 0.8, 20, '#ffcb3d', '#22212c'], [['ATAJO DEL', 'TORNEO'], 17.1, -22, '#8b5cf6', '#ffffff'], [['¡PIEDRAS!'], 6.5, 20, '#e63946', '#ffffff'],
      [['PARCHE 0.9', 'BETA'], 10.0, -20, '#22212c', '#ffcb3d'], [['¡SALTA!'], 13.2, 20, '#ffcb3d', '#22212c'], [['PUENTE', 'EN DLC'], 14.0, -22, '#e63946', '#ffffff'], [['SOON™'], 19.4, 20, '#22212c', '#ffcb3d']]);
    return l;
  },
});
