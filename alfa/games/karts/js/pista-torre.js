// Fans of Karts · MUNDO 4 · LA TORRE DEL CEO: la gran final, en las azoteas del rascacielos de Microblizz. Se corre por tejados sin
// barandilla, se salta de edificio en edificio, los robots de seguridad dan calambre, llueven sacos del Bonus Anual y el helicóptero
// del CEO vigila. Quien se cae, se cae de verdad (el dron lo sube, y te lo cobra). La más difícil.
'use strict';

PISTAS.push({
  id: 'torre', invertida: true, mundo: 4, nombre: 'La Torre del CEO', lema: 'Planta 100. El CEO te espera en el helipuerto con tu despido impreso en papel de oro.', dificultad: 3, musica: 'boss', color: '#e63946',
  puntos: [[500, 900], [300, 880], [160, 780], [140, 610], [240, 500], [180, 370], [200, 210], [360, 130], [540, 170], [600, 300], [500, 420], [560, 560], [700, 600], [800, 480],
    [760, 330], [700, 200], [820, 120], [930, 230], [900, 420], [920, 600], [880, 780], [720, 880]],
  ancho: 64, margen: 6, borde: 'vacio',
  tramos: [
    { deU: 3.3, aU: 6.4, borde: 'muro', suave: 0.004 },
    { deU: 9.7, aU: 10.9, borde: 'muro', suave: 0.004 },       // donde se aterriza del primer salto, que ya es curva
    { deU: 12.2, aU: 14.6, borde: 'muro', suave: 0.004 },
    { deU: 17.2, aU: 18.05, borde: 'muro', suave: 0.004 },     // la curva antes del segundo salto
    { deU: 20.4, aU: 21.8, borde: 'muro', suave: 0.004 },
  ],
  lejos: ['#3a4a7a', '#364676'],
  tema: (() => {
    const [t1, t2, raya, junta, borde, k1, k2, r1, r2, c1, c2, c3, v1, v2, v3, oro] = C32('#5a6078', '#545a72', '#ffcb3d', '#454a60', '#e8ecf4', '#e63946', '#ffffff', '#6a7390', '#c3cbe0', '#2a3a6a', '#3a4a7a', '#8a9ac8', '#1a2240', '#22305a', '#ffe14d', '#ffcb3d');
    const ciudad = (x, y) => { const b = ((x >> 4) * 7 + (y >> 4) * 13) & 7; return b < 2 ? v1 : ((x & 15) > 2 && (y & 15) > 2 && ((x + y) & 3) === 0) ? (ruido(x >> 2, y >> 2) < 0.35 ? v3 : c3) : b < 5 ? c1 : c2; };
    return {
      pista: (x, y, m, i, lado, v) => {
        if (m > -3) return borde;
        if (m + v.ancho / 2 < 1.3 && ((i >> 1) & 1)) return raya;
        if ((x & 31) === 0 || (y & 31) === 0) return junta;
        return ruido(x >> 1, y >> 1) < 0.5 ? t1 : t2;                                          // tejado de hormigón
      },
      bordillo: (x, y, m, i) => ((i >> 1) & 1 ? k1 : k2),
      lento: (x, y, m, i) => ((i >> 1) & 1 ? k1 : k2),
      muro: (x, y, m) => (m < 2 || m > 5 ? r1 : r2),
      vacio: ciudad, fuera: ciudad,                                                              // la ciudad, cien plantas más abajo
      puente: (x, y, d, a) => ((a | 0) & 3 ? oro : u32('#c9841a')),                               // una pasarela de oro (cómo no)
    };
  })(),
  cielo: {
    colores: ['#1a1040', '#3a2060', '#8a3a6a', '#f08a5a'], niebla: '#b05a6a', filas: 10, viento: 4, semilla: 66,
    atras(x, az) {     // atardecer, nubes rosas y el logo de Microblizz en el cielo
      elipsePx(x, 512, 30, 14, 14, '#ffcb7a'); elipsePx(x, 512, 30, 11, 11, '#fff0c0');
      for (let i = 0; i < 10; i++) nubePx(x, az() * CIELO_W, 10 + az() * 24, 14 + az() * 20, '#f8b0c0', '#c87090');
      rectPx(x, 150, 6, 50, 9, '#e63946'); rectPx(x, 153, 8, 44, 5, '#ffffff'); for (let k = 0; k < 7; k++) rectPx(x, 155 + k * 6, 9, 4, 3, '#e63946');
    },
    delante(x, az) {   // rascacielos de alrededor, más bajos que la torre
      for (let i = 0; i < 46; i++) { const a = i * 23 + az() * 8, w = 12 + az() * 12, h = 10 + az() * 22; edificioPx(x, a, HZ, w, h, i & 1 ? '#2a2a50' : '#32325a', '#ffcb7a', az, 0.3); if (az() < 0.2) { rectPx(x, a + w / 2, HZ - h - 6, 1, 6, '#6a7390'); rectPx(x, a + w / 2, HZ - h - 7, 1, 1, '#ff3348'); } }
    },
  },
  voladores: [{ id: 'helicoptero', s: 200, y: 22, vel: 14, tam: 0.42 }],
  atajos: [[13.42, 17.07, 22, 'puente']],
  pinta(P) {
    turboEn(P, 0.5, 0); turboEn(P, 7.6, 0); turboEn(P, 11.6, 0); turboEn(P, 16.9, 0, 20);
    rampaEn(P, P.def.invertida ? 9.75 : 9.25, 12); huecoEn(P, 9.5, 34);        // de una azotea a otra
    rampaEn(P, P.def.invertida ? 18.75 : 18.25, 12); huecoEn(P, 18.5, 34);
    const papeles = ['#ffffff', '#e8ecf4', '#c3cbe0'];        // despidos impresos: resbalan
    manchaEn(P, 2.6, 10, 9, 6, S_CHARCO, papeles, 1); manchaEn(P, 6.9, -10, 9, 6, S_CHARCO, papeles, 2); manchaEn(P, 13.4, 8, 9, 6, S_CHARCO, papeles, 3); manchaEn(P, 20.6, -8, 9, 6, S_CHARCO, papeles, 4);
  },
  cosas(P) {
    const l = [], aire = { r: 3.4 };
    regalosEn(P, 1.8); regalosEn(P, 8.2); regalosEn(P, 15.2);
    monedasPor(P, [[1.0, 5, 0], [3.4, 4, 0], [5.5, 4, 10], [7.0, 4, -10], [9.42, 3, 0, 15], [11.0, 4, 0], [13.0, 4, 10], [17.4, 4, 0], [18.42, 3, 0, 15], [20.0, 4, -10], [21.4, 5, 0]]);
    adornosPor(P, l, ['clima', 'antena', 'clima', 'saco', 'estatua'], 0.4, 21.6, 0.7, 4, 6, 13, aire);
    movilEn(P, l, 'robot', 3.9, 20, 3.8, 0, { muerde: true, r: 3.2 }); movilEn(P, l, 'robot', 7.9, 18, 4.4, 2, { muerde: true, r: 3.2 }); movilEn(P, l, 'robot', 12.6, 20, 3.6, 1, { muerde: true, r: 3.2 }); movilEn(P, l, 'robot', 19.6, 18, 4.2, 3, { muerde: true, r: 3.2 });
    for (const [u, lado, per, f] of [[2.0, -10, 3.4, 0], [2.4, 12, 3.4, 0.5], [11.8, 0, 4, 0.3], [16.6, -8, 3.6, 0.1], [20.9, 10, 3.6, 0.6]]) caidaEn(P, l, 'saco', u, lado, per, f, { radio: 8 });
    cartelesPor(P, l, [[['PLANTA 100'], 0.8, 16, '#e63946', '#ffffff'], [['BONUS', 'ANUAL'], 2.9, -16, '#ffcb3d', '#22212c'], [['¡SALTA!'], 9.0, 16, '#ffcb3d', '#22212c'],
      [['DESPIDOS', 'AQUÍ'], 12.0, -16, '#22212c', '#ff5c8a'], [['PASARELA', 'VIP'], 13.2, -16, '#ffcb3d', '#22212c'], [['¡SALTA!'], 18.0, 16, '#ffcb3d', '#22212c'], [['TU DESPIDO', 'TE ESPERA'], 20.3, -16, '#e63946', '#ffffff']]);
    return l;
  },
});
