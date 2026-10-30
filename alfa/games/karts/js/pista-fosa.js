// Fans of Karts · MUNDO 3 · FOSA DEL LAG: en el fondo del mar, por donde pasan los cables de internet que muerde todo bicho viviente.
// Arena entre paredes de coral, algas, medusas que cruzan flotando, corrientes que te arrastran y el barco hundido de Microblizz. Difícil.
'use strict';

PISTAS.push({
  id: 'fosa', invertida: true, mundo: 3, nombre: 'Fosa del Lag', lema: 'Aquí abajo pasan los cables de internet. Por eso tu ping es de 900.', dificultad: 3, musica: 'nomuertos', color: '#1a4a8a', polvo: '#a8c8e0',
  puntos: [[500, 880], [300, 890], [160, 800], [130, 640], [250, 580], [380, 610], [480, 520], [430, 380], [270, 400], [140, 320], [180, 170], [360, 130], [520, 200], [640, 140],
    [820, 150], [900, 280], [820, 400], [700, 420], [640, 540], [760, 640], [900, 640], [920, 800], [780, 890]],
  ancho: 66, margen: 34, borde: 'muro',
  tramos: [{ deU: 6.2, aU: 7.8, ancho: 56, suave: 0.03 }],
  lejos: ['#0e2a50', '#0c264a'],
  atajos: [[7.23, 11.04, 24]],
  tema: (() => {
    const [a1, a2, a3, cable, cableL, borde, k1, k2, s1, s2, c1, c2, c3, f1, f2, f3] = C32('#c8b890', '#bcac84', '#d8c8a0', '#2b2d3a', '#ffcb3d', '#7a6a50', '#ff6fae', '#ffcb3d', '#3a8a6a', '#347e60', '#ff6fae', '#ff9a3c', '#c35cff', '#0e2a50', '#123260', '#0a2244');
    return {
      pista: (x, y, m, i, lado, v) => {
        if (m > -2.5) return borde;
        const c = Math.abs(m + v.ancho / 2 - 9);
        if (c < 1.6) return (i & 3) === 0 ? cableL : cable;                                // el cable de internet, con su lucecita
        if (Math.sin(x / 9 + Math.sin(y / 13) * 2) > 0.9) return a3;                         // ondas en la arena
        return ruido(x >> 1, y >> 1) < 0.5 ? a1 : a2;
      },
      bordillo: (x, y, m, i) => ((i >> 1) & 1 ? k1 : k2),
      lento: (x, y) => (ruido(x >> 1, y >> 1) < 0.5 ? s1 : s2),                                // praderas de algas
      muro: (x, y) => [c1, c2, c3][(ruido(x >> 2, y >> 2) * 3) | 0],                          // la pared de coral
      vacio: () => f1,
      fuera: (x, y) => (ruido(x >> 3, y >> 3) < 0.2 ? f3 : ((x >> 5) + (y >> 5)) & 1 ? f1 : f2),
      atajo: (x, y) => ((y & 7) === 0 ? u32('#3a2a2a') : ((x >> 3) & 1 ? u32('#6a4a3a') : u32('#5a3e30'))),     // la cubierta del barco hundido
    };
  })(),
  cielo: {
    colores: ['#041838', '#0a2a5a', '#14447a', '#2a6a9a'], niebla: '#1e5a88', filas: 16, viento: 1, semilla: 41,
    atras(x, az) {     // la luz que entra desde la superficie y burbujas
      for (let i = 0; i < 10; i++) { const a = az() * CIELO_W; for (let k = 0; k < 30; k++) rectPx(x, a + k * 0.6, k, 4 + k * 0.1, 1, '#2a5a8a'); }
      for (let i = 0; i < 60; i++) { const a = az() * CIELO_W, b = az() * HZ; rectPx(x, a, b, 1, 1, '#a8d8f4'); }
      rectPx(x, 0, 0, CIELO_W, 2, '#3a7ab0');
    },
    delante(x, az) {   // el barco hundido de Microblizz, rocas y algas
      for (let i = 0; i < 10; i++) montePx(x, i * 110 + az() * 40, HZ, 50 + az() * 30, 10 + az() * 8, '#0a2244');
      rectPx(x, 520, HZ - 16, 90, 12, '#3a2a2a'); montePx(x, 520, HZ - 4, 10, 12, '#3a2a2a'); rectPx(x, 545, HZ - 34, 4, 20, '#4a3a3a'); rectPx(x, 580, HZ - 28, 3, 14, '#4a3a3a');
      rectPx(x, 534, HZ - 13, 60, 3, '#e63946'); for (let k = 0; k < 6; k++) rectPx(x, 530 + k * 12, HZ - 9, 4, 3, '#0a2244');
      for (let i = 0; i < 40; i++) { const a = az() * CIELO_W, h = 6 + az() * 12; for (let j = 0; j < h; j++) rectPx(x, a + Math.round(Math.sin(j * 0.6) * 1.2), HZ - j, 2, 1, '#2a7a5a'); }
    },
  },
  pinta(P) {
    turboEn(P, 0.5, 0); turboEn(P, 9.6, 0); turboEn(P, 16.3, 0, 20);
    const ag = ['#2a6aa0', '#5aa0d0', '#1a4a80'];
    corrienteEn(P, 3.4, 0, 46, 62, 30, 0, ag); corrienteEn(P, 8.9, 0, 44, 58, -30, 0, ag); corrienteEn(P, 12.6, 0, 50, 62, 28, 0, ag); corrienteEn(P, 17.6, 0, 44, 60, -30, 0, ag); corrienteEn(P, 21.0, 0, 46, 62, 28, 0, ag);
    const pulpo = ['#2b2d3a', '#4a3a5a', '#1c1028'];      // tinta de calamar: resbala
    manchaEn(P, 5.4, 10, 9, 6, S_CHARCO, pulpo, 1); manchaEn(P, 14.5, -10, 9, 6, S_CHARCO, pulpo, 2); manchaEn(P, 19.4, 10, 9, 6, S_CHARCO, pulpo, 3);
  },
  cosas(P) {
    const l = [], aire = { r: 3.4 };
    regalosEn(P, 2.1); regalosEn(P, 10.4); regalosEn(P, 18.6);
    monedasPor(P, [[1.0, 5, 0], [4.4, 4, 10], [6.6, 4, 0], [7.9, 4, -10], [11.4, 5, 0], [13.8, 4, 10], [15.3, 4, -10], [19.9, 4, 0], [22.0, 4, 0]]);
    adornosPor(P, l, ['alga', 'coral', 'alga', 'ancla', 'cofre', 'burbujas', 'coral'], 0.4, 22.6, 0.5, 10, 22, 8, aire);
    movilEn(P, l, 'tiburon', 2.8, 24, 3.6, 0, { muerde: true, r: 4 }); movilEn(P, l, 'tiburon', 13.2, 24, 3.2, 1.4, { muerde: true, r: 4 }); movilEn(P, l, 'tiburon', 19.0, 22, 3.8, 2.6, { muerde: true, r: 4 });
    movilEn(P, l, 'medusa', 4.0, 24, 5.6, 0, { flota: 5, r: 3 }); movilEn(P, l, 'medusa', 9.6, 22, 6.4, 1.6, { flota: 6, r: 3 }); movilEn(P, l, 'medusa', 14.0, 24, 5.2, 3.1, { flota: 5, r: 3 }); movilEn(P, l, 'medusa', 20.2, 22, 6, 4.4, { flota: 6, r: 3 });
    cartelesPor(P, l, [[['PING: 900'], 0.8, 22, '#e63946', '#ffffff'], [['CABLE DE', 'INTERNET'], 3.9, -22, '#22212c', '#ffcb3d'], [['NO MORDER', 'EL CABLE'], 7.3, 22, '#ffcb3d', '#22212c'],
      [['CORRIENTE', 'DE PAGO'], 11.9, -22, '#2f4fae', '#ffffff'], [['MICROBLIZZ', 'TITANIC II'], 15.0, 22, '#e63946', '#ffffff'], [['SOON™'], 18.0, -22, '#22212c', '#ffcb3d'], [['LAG', 'INCLUIDO'], 21.5, 22, '#22212c', '#5ef2d0'], [['¡TIBURONES!'], 2.4, -22, '#e63946', '#ffffff']]);
    return l;
  },
});
