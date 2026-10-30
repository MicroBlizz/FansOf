// Fans of Karts (prototipo) · PISTA 3 · LA NUBE DE MICROBLIZZ: donde viven tus partidas guardadas. Una autopista de cristal entre nubes,
// casi sin barandillas (como su soporte técnico): quien se sale, cae. Con un salto sobre un hueco, flechas de turbo y «bugs» en el suelo
// que hacen resbalar. La difícil. Trazado propio.
'use strict';

// nubes vistas desde arriba: un ruido suave (se mezclan los valores de las esquinas de cada casilla)
function ruidoSuave(x, y, celda) {
  const cx = Math.floor(x / celda), cy = Math.floor(y / celda), fx = suave(x / celda - cx), fy = suave(y / celda - cy);
  return entre(entre(ruido(cx, cy), ruido(cx + 1, cy), fx), entre(ruido(cx, cy + 1), ruido(cx + 1, cy + 1), fx), fy);
}
PISTAS.push({
  id: 'nube', invertida: true, mundo: 3, nombre: 'La Nube de Microblizz', lema: 'Tus partidas guardadas viven aquí arriba. Sin barandillas, como su soporte técnico.', dificultad: 3, musica: 'boss5', color: '#4a9be6',
  puntos: [[560, 892], [420, 890], [230, 840], [130, 700], [150, 540], [280, 450], [300, 310], [190, 220], [230, 110], [400, 100], [520, 190], [500, 340], [560, 470], [700, 480],
    [760, 360], [700, 220], [790, 120], [900, 200], [910, 400], [880, 600], [800, 740], [690, 870]],
  ancho: 66, margen: 5, borde: 'vacio',
  tramos: [
    { deU: 4.6, aU: 7.4, borde: 'muro', suave: 0.004 },       // las eses de la izquierda, con barandilla
    { deU: 11.6, aU: 15.4, borde: 'muro', suave: 0.004 },     // el bucle de dentro, también
    { deU: 20.2, aU: 21.6, borde: 'muro', suave: 0.004 },     // y la última curva antes de meta
  ],
  lejos: ['#58aee8', '#5db3ec'],
  tema: (() => {
    const [p1, p2, reja, raya, borde, k1, k2, r1, r2, c1, c2, c3, n1, n2] = C32('#d6f1ff', '#c4e9ff', '#8fd0f5', '#22c3ff', '#ffffff', '#ff5cf0', '#ffffff', '#6a7390', '#c3cbe0', '#58aee8', '#4fa5e2', '#63b8ee', '#ffffff', '#d8f0ff');
    const cielo = (x, y) => {
      const n = ruidoSuave(x, y, 46) * 0.65 + ruidoSuave(x + 300, y + 170, 19) * 0.35;
      return n > 0.6 ? n1 : n > 0.545 ? n2 : ((x >> 5) + (y >> 5)) & 1 ? c1 : (ruido(x >> 3, y >> 3) < 0.5 ? c2 : c3);
    };
    return {
      pista: (x, y, m, i, lado, v) => {
        if (m > -3) return borde;
        if (m + v.ancho / 2 < 1.4 && ((i >> 1) & 1)) return raya;
        if ((x & 15) === 0 || (y & 15) === 0) return reja;
        return ((x >> 4) + (y >> 4)) & 1 ? p1 : p2;
      },
      bordillo: (x, y, m, i) => ((i >> 1) & 1 ? k1 : k2),       // luces de neón
      lento: (x, y, m, i) => ((i >> 1) & 1 ? k1 : k2),
      muro: (x, y, m) => (m < 2 || m > 5 ? r1 : r2),            // la barandilla
      vacio: cielo, fuera: cielo,
    };
  })(),
  cielo: {
    colores: ['#2f7fd6', '#4a9be6', '#7fc1f5', '#c8e9ff'], niebla: '#bfe3ff', filas: 9, viento: 5, semilla: 99,
    // detrás: el sol y nubes grandes que se mueven con el viento
    atras(x, az) {
      elipsePx(x, 620, 14, 9, 9, '#fff3a0'); elipsePx(x, 620, 14, 7, 7, '#ffffff');
      for (let i = 0; i < 14; i++) nubePx(x, az() * CIELO_W, 10 + az() * 34, 14 + az() * 26, '#ffffff', '#a8d4f5');
    },
    // delante: islas de nube con torres de servidores (y sus lucecitas) y alguna antena
    delante(x, az) {
      for (let i = 0; i < 9; i++) {
        const cx = i * 114 + az() * 50, base = HZ - 2 - az() * 5, w = 22 + az() * 18;
        for (let k = 0; k < 3; k++) {
          const tx = cx - w * 0.5 + k * w * 0.36 + az() * 4, th = 9 + az() * 13;
          rectPx(x, tx, base - 4 - th, 7, th, '#3a4258'); rectPx(x, tx, base - 4 - th, 7, 1, '#6a7390');
          for (let j = 2; j < th - 2; j += 3) { rectPx(x, tx + 1, base - 4 - th + j, 1, 1, az() > 0.3 ? '#5ef27a' : '#ff3348'); rectPx(x, tx + 3, base - 4 - th + j, 3, 1, '#22e3ff'); }
        }
        if (az() > 0.5) { rectPx(x, cx + w * 0.55, base - 16, 1, 12, '#3a4258'); rectPx(x, cx + w * 0.55 - 2, base - 17, 5, 2, '#c3cbe0'); rectPx(x, cx + w * 0.55, base - 19, 1, 1, '#ff3348'); }
        nubePx(x, cx, base, w, '#ffffff', '#a8d4f5');
      }
    },
  },
  pinta(P) {
    turboEn(P, 0.45, 0); turboEn(P, 8.5, 0); turboEn(P, 18.55, 0); turboEn(P, 12.6, 0, 20);
    rampaEn(P, P.def.invertida ? 17.74 : 17.3, 12); huecoEn(P, 17.52, 34);      // la rampa, siempre antes del hueco
    // bugs: baldosas rotas de colores chillones; quien las pisa, resbala
    const bug = ['#ff3df0', '#22e3ff', '#1c1028'];
    manchaEn(P, 1.6, -10, 8, 6, S_CHARCO, bug, 1); manchaEn(P, 5.9, 8, 8, 6, S_CHARCO, bug, 2); manchaEn(P, 9.6, -8, 8, 6, S_CHARCO, bug, 3); manchaEn(P, 13.3, 8, 8, 6, S_CHARCO, bug, 4); manchaEn(P, 19.5, -10, 8, 6, S_CHARCO, bug, 5);
  },
  cosas(P) {
    const l = [], aire = { r: 0, flota: 2 };
    regalosEn(P, 2.4); regalosEn(P, 10.5); regalosEn(P, 16.45);
    monedasEn(P, 0.9, 5, 0); monedasEn(P, 3.2, 4, 0); monedasEn(P, 4.6, 4, 10); monedasEn(P, 6.3, 4, -10); monedasEn(P, 7.6, 4, 0); monedasEn(P, 8.9, 5, 0); monedasEn(P, 11.2, 4, 10);
    monedasEn(P, 12.5, 4, -10); monedasEn(P, 14.2, 4, 10); monedasEn(P, 15.6, 4, 0); monedasEn(P, 17.62, 3, 0, 15); monedasEn(P, 18.9, 5, 0); monedasEn(P, 20.5, 4, 8);
    for (const [id, u, d] of [['rack', 0.2, 14], ['rack', 0.2, -14], ['nube', 1.0, 18], ['antena', 1.8, -14], ['nube', 2.6, 20], ['rack', 3.4, 14], ['nube', 4.2, -20], ['rack', 5.2, -16], ['antena', 6.0, 16], ['nube', 6.9, -18],
      ['rack', 7.6, 14], ['nube', 8.3, 20], ['rack', 8.8, -14], ['antena', 9.5, 14], ['nube', 10.3, 20], ['rack', 11.0, -14], ['nube', 12.1, 20], ['antena', 12.9, -16], ['rack', 13.7, 16], ['nube', 14.6, -20],
      ['rack', 15.5, 16], ['antena', 16.2, 14], ['nube', 16.9, 20], ['rack', 17.2, -14], ['rack', 17.2, 14], ['nube', 17.6, 22], ['nube', 17.6, -22], ['nube', 18.6, 20], ['rack', 19.3, -14], ['antena', 20.0, 14], ['nube', 20.9, -20], ['rack', 21.5, 14]]) adorno(P, l, id, u, d, aire);
    cartelEn(P, l, ['SIN', 'BARANDILLA'], 0.75, 18, '#22212c', '#ff5cf0');
    cartelEn(P, l, ['COPIA DE', 'SEGURIDAD: NO'], 3.8, -18, '#2f4fae', '#ffffff');
    cartelEn(P, l, ['SUBIENDO', 'TUS DATOS'], 8.1, -18, '#22212c', '#22e3ff');
    cartelEn(P, l, ['ESPACIO', 'LLENO'], 10.0, -18, '#e63946', '#ffffff');
    cartelEn(P, l, ['SOON™'], 14.9, 18, '#22212c', '#ffcb3d');
    cartelEn(P, l, ['CAÍDA', 'GRATIS'], 17.05, 20, '#ffcb3d', '#22212c');
    cartelEn(P, l, ['ERROR 37'], 19.8, 18, '#2f4fae', '#ffffff');
    return l;
  },
});
