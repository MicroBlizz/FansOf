// Fans of Karts · MUNDO 1 · CENTRO COMERCIAL DE SKINS: tres plantas de tiendas que solo venden ropa para personajes. Suelo de mármol
// recién fregado (resbala), escaleras mecánicas que te llevan (o te echan para atrás) y carritos que nadie devuelve a su sitio.
'use strict';

PISTAS.push({
  id: 'centro', mundo: 1, nombre: 'Centro Comercial de Skins', lema: 'Oferta del −90 %. Solo hoy. Como ayer. Como mañana.', dificultad: 2, musica: 'boss8', color: '#c35cff',
  puntos: [[500, 160], [760, 160], [870, 230], [880, 390], [780, 450], [630, 450], [560, 530], [640, 610], [810, 610], [890, 700], [860, 850], [720, 890], [420, 890], [270, 860],
    [160, 760], [160, 600], [290, 520], [290, 390], [160, 310], [190, 180], [330, 150]],
  ancho: 66, margen: 36, borde: 'muro',
  tramos: [{ deU: 11.4, aU: 12.6, ancho: 58, suave: 0.03 }],
  lejos: ['#d8d0e8', '#ccc4de'],
  atajos: [[1.11, 5.04, 24]],
  tema: (() => {
    const [b1, b2, veta, junta, borde, k1, k2, mo1, mo2, mo3, v1, v2, v3, f1, f2] = C32('#e8e4f0', '#dcd6e8', '#c8c0d8', '#b8b0c8', '#ffffff', '#c35cff', '#2b2d3a', '#7a3a6a', '#82406f', '#6c3260', '#bdeaff', '#8fc8e8', '#ffffff', '#d8d0e8', '#ccc4de');
    return {
      pista: (x, y, m) => {
        if (m > -3) return borde;
        if ((x & 15) === 0 || (y & 15) === 0) return junta;
        const r = ruido((x + y) >> 2, (x - y) >> 3);
        return r < 0.06 ? veta : ((x >> 4) + (y >> 4)) & 1 ? b1 : b2;                         // mármol a cuadros con vetas
      },
      bordillo: (x, y, m, i) => ((i >> 1) & 1 ? k1 : k2),
      lento: (x, y) => (((x >> 2) + (y >> 2)) & 3 ? (ruido(x, y) < 0.5 ? mo1 : mo2) : mo3),            // moqueta de tienda cara
      muro: (x, y, m) => (m < 1.2 || m > 5.6 ? v2 : ((x + y) & 7) < 2 ? v3 : v1),             // los escaparates de cristal
      vacio: () => f1,
      fuera: (x, y) => (((x >> 4) + (y >> 4)) & 1 ? f1 : f2),
      atajo: (x, y) => ((x & 7) === 0 || (y & 7) === 0 ? veta : ((x >> 3) + (y >> 3)) & 1 ? mo1 : u32('#f4f4f8')),      // por dentro de la tienda
    };
  })(),
  cielo: {
    colores: ['#a898c8', '#c0b4dc', '#d8d0ec', '#f0ecf8'], niebla: '#e4dcf0', filas: 10, viento: 0, semilla: 61,
    atras(x, az) {     // la cúpula de cristal del techo
      for (let i = 0; i < 16; i++) { const a = i * 64; rectPx(x, a, 0, 2, 22, '#7a6a98'); rectPx(x, a + 4, 4, 56, 14, '#bfe6ff'); rectPx(x, a + 4, 4, 56, 2, '#e8f8ff'); rectPx(x, a + 31, 4, 2, 14, '#7a6a98'); }
      rectPx(x, 0, 21, CIELO_W, 2, '#7a6a98');
    },
    delante(x, az) {   // las tiendas del fondo con sus letreros de neón, dos plantas
      rectPx(x, 0, 24, CIELO_W, HZ - 24, '#efe8f6');
      const letreros = ['#ff3df0', '#22e3ff', '#ffcb3d', '#5ef27a', '#ff5c8a'];
      for (let p = 0; p < 2; p++) for (let i = 0; i < 20; i++) {
        const a = i * 51 + 3, y = 26 + p * 13, c = letreros[(i + p * 2) % letreros.length];
        rectPx(x, a, y, 46, 11, '#5a4a78'); rectPx(x, a + 2, y + 3, 42, 8, az() < 0.5 ? '#bfe6ff' : '#ffe8f4'); rectPx(x, a + 6, y + 1, 34, 2, c);
        for (let k = 0; k < 3; k++) rectPx(x, a + 6 + k * 13, y + 6, 4, 5, ['#8b5cf6', '#ff8a1f', '#22b8f0'][(i + k) % 3]);      // maniquíes en el escaparate
      }
      rectPx(x, 0, 38, CIELO_W, 1, '#c8c0d8'); rectPx(x, 0, HZ - 1, CIELO_W, 1, '#b8b0c8');
    },
  },
  pinta(P) {
    turboEn(P, 0.6, 0); turboEn(P, 9.1, 0); turboEn(P, 16.4, 0, 20);
    const fregado = ['#d0f0ff', '#a8dcf4', '#ffffff'], mec = ['#6a7390', '#3a4258', '#c3cbe0'];
    manchaEn(P, 2.4, 10, 9, 6, S_CHARCO, fregado, 1); manchaEn(P, 6.6, -10, 9, 6, S_CHARCO, fregado, 2); manchaEn(P, 12.9, 10, 9, 6, S_CHARCO, fregado, 3); manchaEn(P, 18.3, -10, 9, 6, S_CHARCO, fregado, 4);
    corrienteEn(P, 4.6, -14, 46, 24, 0, 46, mec); corrienteEn(P, 11.9, 14, 50, 22, 0, 52, mec);     // escaleras mecánicas a favor (por un lado)
    corrienteEn(P, 14.6, 14, 44, 24, 0, -38, mec);                                                    // y una que va al revés
  },
  cosas(P) {
    const l = [];
    regalosEn(P, 1.9); regalosEn(P, 7.9); regalosEn(P, 15.2);
    monedasPor(P, [[1.0, 5, 0], [3.3, 4, 12], [4.6, 4, -14], [6.0, 4, 0], [9.4, 5, 0], [11.9, 4, 14], [13.6, 4, -12], [17.2, 5, 0], [19.4, 4, 10]]);
    adornosPor(P, l, ['maniqui', 'banco', 'papelera', 'expositor', 'planta', 'maniqui'], 0.4, 20.6, 0.5, 12, 22, 3);
    for (const [u, lado, per, f] of [[7.2, -10, 3.4, 0], [7.6, 10, 3.4, 0.5], [13.4, 0, 3.8, 0.25], [19.0, -8, 3.6, 0.6]]) caidaEn(P, l, 'botin', u, lado, per, f, { radio: 8 });   // cajas de botín que caen de las estanterías
    movilEn(P, l, 'carrito', 3.6, 22, 4.6, 0); movilEn(P, l, 'carrito', 10.4, 20, 5.2, 2); movilEn(P, l, 'carrito', 17.6, 22, 4.2, 4);
    cartelesPor(P, l, [[['REBAJAS', '−90 %'], 0.8, 24, '#e63946', '#ffffff'], [['SUELO', 'MOJADO'], 2.9, -22, '#ffcb3d', '#22212c'], [['SKIN DORADA', '49,99 €'], 5.5, 22, '#22212c', '#ffcb3d'],
      [['SOLO HOY'], 8.6, -22, '#c35cff', '#ffffff'], [['ESCALERA', 'DE PAGO'], 11.2, -24, '#22212c', '#5ef2d0'], [['SIN', 'DEVOLUCIONES'], 14.0, -22, '#e63946', '#ffffff'],
      [['CAJA 1 DE 40', 'ABIERTA'], 17.0, 22, '#2f4fae', '#ffffff'], [['SOON™'], 19.8, -22, '#22212c', '#ffcb3d'], [['ATAJO POR', 'LA TIENDA'], 1.0, -22, '#c35cff', '#ffffff']]);
    return l;
  },
});
