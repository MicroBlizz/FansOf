// Fans of Karts · MUNDO 3 · PICOS CONGELADOS: los servidores de Microblizz se enfriaron tanto que se congeló el juego entero. Carretera
// nevada entre muros de nieve, placas de hielo donde el kart patina, un lago helado y pingüinos que cruzan sin prisa. Difícil.
'use strict';

PISTAS.push({
  id: 'nieve', mundo: 3, nombre: 'Picos Congelados', lema: 'El juego está congelado hasta nuevo aviso. Literalmente.', dificultad: 3, musica: 'boss9', color: '#8fd0f5', polvo: '#ffffff',
  puntos: [[520, 890], [340, 895], [180, 825], [125, 660], [220, 545], [155, 400], [195, 240], [340, 135], [520, 150], [590, 270], [540, 400], [430, 470], [480, 610], [650, 640],
    [740, 570], [750, 410], [790, 250], [890, 240], [935, 420], [900, 620], [870, 790], [720, 885]],
  ancho: 66, margen: 36, borde: 'muro',
  tramos: [{ deU: 10.2, aU: 13.4, ancho: 78, tipo: 'hielo', suave: 0.03 }],       // el lago helado: más ancho, y todo hielo
  lejos: ['#e8f4ff', '#dceeff'],
  atajos: [[14.12, 17.89, 24]],
  tema: (() => {
    const [n1, n2, n3, rodada, borde, k1, k2, l1, l2, h1, h2, h3, m1, m2, f1, f2] = C32('#e8f0fa', '#dce8f6', '#f4f8ff', '#c4d4e8', '#8fa8c8', '#e63946', '#ffffff', '#f4f8ff', '#e4eef8', '#a8dcf4', '#c4ecff', '#88c8ec', '#ffffff', '#d0e4f6', '#e8f4ff', '#dceeff');
    return {
      pista: (x, y, m, i, lado, v) => {
        if (m > -2.5) return borde;
        if (v.tipo === 'hielo') return ((x * 3 + y) & 31) < 2 ? h3 : ruido(x >> 3, y >> 3) < 0.5 ? h1 : h2;       // el lago: hielo azul con grietas
        const c = Math.abs(m + v.ancho / 2 - v.ancho * 0.25);
        if (c < 2.2 || Math.abs(m + v.ancho * 0.25) < 2.2) return rodada;                                         // las rodadas en la nieve
        return ruido(x >> 1, y >> 1) < 0.1 ? n3 : ruido(x, y) < 0.5 ? n1 : n2;
      },
      bordillo: (x, y, m, i) => ((i >> 1) & 1 ? k1 : k2),                                       // estacas rojas y blancas
      lento: (x, y) => (ruido(x, y) < 0.5 ? l1 : l2),                                          // nieve honda
      muro: (x, y, m) => (m < 1.5 ? m2 : ruido(x >> 1, y >> 1) < 0.3 ? m2 : m1),             // el muro de nieve
      vacio: () => f1,
      fuera: (x, y) => (ruido(x >> 3, y >> 3) < 0.06 ? u32('#2f7a5a') : ((x >> 5) + (y >> 5)) & 1 ? f1 : f2),
      atajo: (x, y) => (((x * 2 + y) & 15) < 2 ? rodada : ruido(x, y) < 0.5 ? l1 : l2),      // nieve honda con huellas
    };
  })(),
  cielo: {
    colores: ['#6a8ac0', '#8aa8d4', '#b4cce8', '#e8f2fc'], niebla: '#e4eefa', filas: 13, viento: 2, semilla: 17,
    atras(x, az) {
      for (let i = 0; i < 160; i++) rectPx(x, az() * CIELO_W, az() * HZ, 1, 1, '#ffffff');          // copos
      for (let i = 0; i < 6; i++) nubePx(x, az() * CIELO_W, 6 + az() * 14, 14 + az() * 16, '#f4f8ff', '#c4d4e8');
    },
    delante(x, az) {   // montañas nevadas, pinos y un servidor congelado en la cima
      for (let i = 0; i < 8; i++) { const a = i * 128 + az() * 50, w = 50 + az() * 30, h = 22 + az() * 12; montePx(x, a, HZ, w, h, '#7a90b8'); montePx(x, a, HZ - h * 0.55, w * 0.45, h * 0.45, '#ffffff'); }
      rectPx(x, 300, 8, 10, 12, '#3a4258'); for (let j = 0; j < 4; j++) rectPx(x, 302, 10 + j * 3, 6, 1, '#22e3ff'); rectPx(x, 298, 6, 14, 3, '#ffffff');
      for (let i = 0; i < 36; i++) pinoPx(x, az() * CIELO_W, HZ, 6 + az() * 8, '#2f7a5a', '#ffffff');
    },
  },
  pinta(P) {
    turboEn(P, 0.5, 0); turboEn(P, 7.4, 0); turboEn(P, 15.6, 0); turboEn(P, 19.3, 0, 20);
    rampaEn(P, 6.6, 10); rampaEn(P, 18.8, 10);       // rampas de nieve
    const hielo = ['#a8dcf4', '#c4ecff', '#ffffff'];
    hieloEn(P, 2.4, 12, 13, 8, hielo, 1); hieloEn(P, 5.2, -12, 13, 8, hielo, 2); hieloEn(P, 8.6, 10, 12, 8, hielo, 3);
    hieloEn(P, 14.6, -12, 13, 8, hielo, 4); hieloEn(P, 17.3, 12, 12, 8, hielo, 5); hieloEn(P, 20.6, -10, 12, 8, hielo, 6);
    // el lago helado entero resbala
    for (let u = 10.3; u < 13.4; u += 0.12) sello(P, x => { const p = enVia(P, P.f(u)); enPunto(x, p, x => { x.fillStyle = '#fff'; x.fillRect(-7, -p.ancho / 2 + 2, 14, p.ancho - 4); }); }, { tipo: S_HIELO, solo: t => t === S_PISTA, en: enVia(P, P.f(u)), r: 60 });
  },
  cosas(P) {
    const l = [];
    regalosEn(P, 1.8); regalosEn(P, 9.4); regalosEn(P, 16.2);
    monedasPor(P, [[1.0, 5, 0], [3.3, 4, -12], [6.2, 4, 12], [8.0, 4, 0], [11.0, 5, 0], [12.6, 4, 14], [14.0, 4, 0], [17.9, 5, 0], [20.0, 4, 10]]);
    adornosPor(P, l, ['pino', 'pino', 'muneco', 'bloquehielo', 'pino'], 0.4, 21.6, 0.5, 12, 26, 7);
    for (const [u, lado, per, f] of [[3.0, -12, 3, 0], [3.3, 10, 3, 0.5], [8.0, 0, 3.4, 0.2], [15.1, -10, 3.2, 0.7], [20.0, 10, 3.2, 0.3]]) caidaEn(P, l, 'carambano', u, lado, per, f, { radio: 8, alto: 76 });   // témpanos
    movilEn(P, l, 'pinguino', 4.1, 26, 6, 0); movilEn(P, l, 'pinguino', 11.8, 30, 7, 1.5); movilEn(P, l, 'pinguino', 12.6, 30, 6.4, 3); movilEn(P, l, 'pinguino', 18.4, 24, 5.6, 4);
    cartelesPor(P, l, [[['JUEGO', 'CONGELADO'], 0.8, 24, '#2f4fae', '#ffffff'], [['SERVIDORES', 'A -40 °C'], 3.6, -24, '#22212c', '#22e3ff'], [['HIELO', 'INCLUIDO'], 6.6, 24, '#22e3ff', '#22212c'],
      [['LAGO EN', 'MANTENIMIENTO'], 10.0, -28, '#e63946', '#ffffff'], [['PATINA', 'BAJO TU RIESGO'], 13.8, 26, '#22212c', '#ffcb3d'], [['SOON™'], 17.0, -24, '#22212c', '#ffcb3d'], [['DESHIELO:', 'Q4 2031'], 20.3, 24, '#2f4fae', '#ffffff'], [['¡TÉMPANOS!'], 2.6, -24, '#22e3ff', '#22212c']]);
    return l;
  },
});
