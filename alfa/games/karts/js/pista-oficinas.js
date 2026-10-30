// Fans of Karts (prototipo) · PISTA 1 · OFICINAS DE MICROBLIZZ: la planta 37, donde se cierran juegos de 9 a 5. Fácil: pasillo ancho de
// baldosas entre moqueta (frena) y mamparas de cubículo, con charcos de café que hacen resbalar. Trazado propio.
'use strict';

PISTAS.push({
  id: 'oficinas', mundo: 1, nombre: 'Oficinas de Microblizz', lema: 'Planta 37. Aquí se cierran juegos de 9 a 5.', dificultad: 1, musica: 'boss0', color: '#3a7de0',
  puntos: [[512, 170], [760, 170], [880, 260], [890, 430], [760, 520], [720, 660], [840, 780], [760, 880], [540, 870], [400, 760], [260, 840], [140, 740], [150, 540], [260, 430], [200, 310], [290, 190]],
  ancho: 70, margen: 40, borde: 'muro',
  tramos: [
    { deU: 4.3, aU: 5.7, ancho: 58, suave: 0.03 },    // el pasillo estrecho de la fotocopiadora
    { deU: 11.3, aU: 12.1, margen: 14, suave: 0.05 }, // entre dos filas de cubículos: las mamparas, pegadas
  ],
  lejos: ['#2d5068', '#274860'],
  tema: (() => {
    const [b1, b2, junta, raya, borde, k1, k2, m1, m2, m3, mLin, mur, murS, f1, f2, f3] = C32('#dcd6c8', '#d0c9b8', '#b8b09e', '#ffcb3d', '#f4f4f8', '#ffcb3d', '#2b2d3a', '#3f7391', '#447b9a', '#3a6a86', '#5490ae', '#e8e4da', '#8a8fa3', '#2d5068', '#274860', '#33597a');
    const moqueta = grano([m1, m1, m2, m3]);
    return {
      pista: (x, y, m, i, lado, v) => {
        if (m > -3) return borde;                                                    // la raya blanca del borde
        if (m + v.ancho / 2 < 1.3 && ((i >> 1) & 1)) return raya;                    // la línea central, a trozos
        if ((x & 15) === 0 || (y & 15) === 0) return junta;                          // las juntas de las baldosas
        return ((x >> 4) + (y >> 4)) & 1 ? b1 : b2;
      },
      bordillo: (x, y, m, i) => ((i >> 1) & 1 ? k1 : k2),                            // cinta amarilla y negra
      lento: (x, y) => (((x + y) & 31) === 0 || ((x - y) & 31) === 0 ? mLin : moqueta(x, y)),   // moqueta de rombos
      muro: (x, y, m) => (m < 1.6 || m > 5.4 ? murS : mur),                          // la mampara, vista desde arriba
      vacio: () => f1,
      fuera: (x, y) => (((x >> 5) + (y >> 5)) & 1 ? (ruido(x, y) < 0.08 ? f3 : f1) : f2),
    };
  })(),
  cielo: {
    colores: ['#7f93b3', '#9db1cc', '#bccadd', '#d6e0ec'], niebla: '#c4cfdd', filas: 10, viento: 0, semilla: 37,
    // el techo: fluorescentes (alguno fundido) y conductos
    atras(x, az) {
      for (let i = 0; i < 16; i++) { const a = i * 64 + 14, on = az() > 0.18; rectPx(x, a, 6, 36, 3, on ? '#ffffff' : '#8fa0bb'); rectPx(x, a - 1, 9, 38, 1, '#6c7f9e'); if (on) rectPx(x, a + 4, 10, 28, 1, '#e8f1ff'); }
      for (let i = 0; i < 8; i++) rectPx(x, i * 128 + 70, 16, 3, 5, '#6c7f9e');
      rectPx(x, 0, 21, CIELO_W, 2, '#6c7f9e'); rectPx(x, 0, 23, CIELO_W, 1, '#8fa0bb');
    },
    // la pared del fondo: ventanales con la ciudad, columnas y una fila de cubículos con sus monitores
    delante(x, az) {
      rectPx(x, 0, 25, CIELO_W, HZ - 25, '#d9d4c7');
      for (let i = 0; i < 16; i++) {
        const a = i * 64 + 5;
        rectPx(x, a, 27, 54, 17, '#3a4258'); rectPx(x, a + 1, 28, 52, 15, '#8fd0ff'); rectPx(x, a + 1, 37, 52, 6, '#bfe6ff');
        for (let k = 0; k < 6; k++) { const w = 5 + ((az() * 6) | 0), h = 4 + ((az() * 10) | 0), bx = a + 2 + k * 8 + ((az() * 3) | 0); rectPx(x, bx, 43 - h, Math.min(w, a + 52 - bx), h, k & 1 ? '#5b7fae' : '#4a6a96'); if (h > 7) rectPx(x, bx + 1, 43 - h + 2, 1, 1, '#ffe14d'); }
        rectPx(x, a + 26, 27, 2, 17, '#3a4258');
        rectPx(x, a + 56, 25, 6, HZ - 25, '#b8b09e');
      }
      rectPx(x, 0, 44, CIELO_W, 1, '#8a8fa3');
      for (let i = 0; i < 43; i++) {
        const a = i * 24 + 2, h = 4 + ((az() * 3) | 0);
        rectPx(x, a, HZ - h, 20, h, '#6f8fae'); rectPx(x, a, HZ - h, 20, 1, '#a8c4de');
        if (az() > 0.35) { rectPx(x, a + 6, HZ - h - 4, 7, 4, '#2b2d3a'); rectPx(x, a + 7, HZ - h - 3, 5, 2, az() > 0.7 ? '#ff3348' : '#3a7de0'); }
        else if (az() > 0.5) { rectPx(x, a + 12, HZ - h - 3, 3, 3, '#3fae4a'); rectPx(x, a + 13, HZ - h - 5, 1, 2, '#3fae4a'); }
      }
    },
  },
  pinta(P) {
    turboEn(P, 0.62, 0); turboEn(P, 7.45, -14); turboEn(P, 14.55, 12);
    const cafe = ['#7a4a26', '#8b5a30', '#5a3418'];
    manchaEn(P, 2.55, -14, 9, 6, S_CHARCO, cafe, 1); manchaEn(P, 5.6, 8, 8, 6, S_CHARCO, cafe, 2); manchaEn(P, 8.5, 12, 10, 6, S_CHARCO, cafe, 3);
    manchaEn(P, 10.5, -10, 9, 6, S_CHARCO, cafe, 4); manchaEn(P, 13.45, 10, 8, 6, S_CHARCO, cafe, 5);
  },
  cosas(P) {
    const l = [];
    regalosEn(P, 2.2); regalosEn(P, 8.15); regalosEn(P, 12.5);
    monedasEn(P, 1.1, 5, 0); monedasEn(P, 3.3, 4, 14); monedasEn(P, 4.6, 4, 0); monedasEn(P, 6.3, 4, -14); monedasEn(P, 7.75, 4, 12);
    monedasEn(P, 9.2, 5, -12, 13, 5); monedasEn(P, 11.4, 5, 0); monedasEn(P, 13.2, 4, -14); monedasEn(P, 15.2, 4, 0);
    // por fuera de la pista: plantas en las esquinas, mesas, fuentes de agua y archivadores
    for (const [id, u, d] of [['planta', 1.9, 16], ['planta', 2.5, 20], ['mesa', 0.4, -22], ['mesa', 0.9, -22], ['fuente', 1.5, -18], ['archivador', 3.4, 20], ['mesa', 3.9, -24], ['planta', 4.6, 14],
      ['fuente', 5.4, -14], ['planta', 6.1, 18], ['mesa', 6.7, 24], ['archivador', 7.1, 18], ['mesa', 7.6, -24], ['mesa', 8.2, -24], ['planta', 8.9, 16], ['fuente', 9.5, -16], ['planta', 10.1, 16],
      ['archivador', 10.8, 20], ['planta', 12.6, 18], ['mesa', 13.1, 22], ['fuente', 13.6, -16], ['planta', 14.3, 18], ['mesa', 15.3, -22], ['mesa', 15.75, -22], ['archivador', 14.9, 18]]) adorno(P, l, id, u, d);
    cartelEn(P, l, ['SOON™'], 0.3, 26, '#22212c', '#ffcb3d');
    cartelEn(P, l, ['RRHH', '-->'], 2.9, 26, '#e63946', '#ffffff');
    cartelEn(P, l, ['ERROR 37'], 5.1, 20, '#2f4fae', '#ffffff');
    cartelEn(P, l, ['CAFÉ', '9,99 €'], 7.3, -26, '#7a4a26', '#ffe6d0');
    cartelEn(P, l, ['REUNIÓN', 'INFINITA'], 9.9, -26, '#22212c', '#5ef2d0');
    cartelEn(P, l, ['CIERRE', 'DE JUEGOS'], 12.9, -24, '#e63946', '#ffffff');
    cartelEn(P, l, ['NO CORRER'], 14.6, -24, '#ffcb3d', '#22212c');
    return l;
  },
});
