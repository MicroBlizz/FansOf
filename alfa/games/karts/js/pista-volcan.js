// Fans of Karts · MUNDO 3 · VOLCÁN DEL CRUNCH: la semana 47 de horas extra. Un camino de roca negra sobre ríos de lava (quien se sale,
// se cae dentro), ordenadores ardiendo, fumarolas, piedras que se mueven y pocas barandillas: las pusieron en el presupuesto del año que viene.
'use strict';

PISTAS.push({
  id: 'volcan', mundo: 3, nombre: 'Volcán del Crunch', lema: 'Semana 47 de horas extra. El volcán es lo único que echa humo menos que el equipo.', dificultad: 3, musica: 'boss3', color: '#e8501a', polvo: '#6a5a5a',
  puntos: [[480, 900], [290, 880], [150, 780], [160, 620], [290, 560], [300, 420], [170, 350], [160, 200], [300, 120], [470, 170], [520, 320], [640, 380], [740, 300], [790, 180],
    [880, 150], [935, 260], [930, 420], [820, 520], [860, 680], [900, 820], [720, 900]],
  ancho: 66, margen: 22, borde: 'vacio',
  tramos: [
    { deU: 2.4, aU: 4.6, borde: 'muro', suave: 0.004 },       // las curvas de la izquierda, con barandilla
    { deU: 9.6, aU: 12.4, borde: 'muro', suave: 0.004 },
    { deU: 16.8, aU: 18.2, borde: 'muro', suave: 0.004 },
  ],
  lejos: ['#c0300a', '#b02a08'],
  atajos: [[5.34, 9.06, 20, 'puente']],
  tema: (() => {
    const [r1, r2, r3, grieta, borde, k1, k2, c1, c2, mu1, mu2, l1, l2, l3, l4] = C32('#3a3038', '#342a32', '#443a42', '#ff7a1a', '#7a6a72', '#ffcb3d', '#2b2d3a', '#5a4a52', '#524248', '#6a5a62', '#8a7a82', '#ff5a0a', '#ff8a1a', '#ffd23a', '#c0300a');
    const lava = (x, y) => { const n = ruidoSuave(x, y, 22) * 0.7 + ruidoSuave(x + 99, y + 7, 9) * 0.3; return n > 0.68 ? l3 : n > 0.55 ? l2 : n > 0.3 ? l1 : l4; };
    return {
      pista: (x, y, m) => {
        if (m > -2.5) return borde;
        if (ruido(x >> 2, y >> 2) < 0.05 && ruido(x, y) < 0.6) return grieta;            // grietas con lava debajo
        return ruido(x >> 1, y >> 1) < 0.1 ? r3 : ruido(x, y) < 0.5 ? r1 : r2;
      },
      bordillo: (x, y, m, i) => ((i >> 1) & 1 ? k1 : k2),
      lento: (x, y) => (ruido(x, y) < 0.5 ? c1 : c2),                                       // ceniza
      muro: (x, y, m) => (m < 2 || m > 5 ? mu1 : mu2),
      vacio: lava, fuera: lava,
      puente: (x, y, d, a) => ((a | 0) % 5 === 0 ? u32('#2b2d3a') : u32('#7d889e')),     // una pasarela de rejilla metálica
    };
  })(),
  cielo: {
    colores: ['#1a0a10', '#3a1018', '#7a2a1a', '#d0601a'], niebla: '#8a3a1a', filas: 12, viento: 3, semilla: 47,
    atras(x, az) {     // humo y ceniza que cae
      for (let i = 0; i < 12; i++) nubePx(x, az() * CIELO_W, 6 + az() * 22, 16 + az() * 22, '#3a2a30', '#2a1a20');
      for (let i = 0; i < 90; i++) rectPx(x, az() * CIELO_W, az() * HZ, 1, 1, az() < 0.3 ? '#ffcb3d' : '#6a5a5a');
    },
    delante(x, az) {   // el volcán en erupción y la oficina de Microblizz en llamas
      montePx(x, 300, HZ, 120, 40, '#2a1a20'); rectPx(x, 290, HZ - 41, 20, 3, '#ff7a1a'); for (let k = 0; k < 14; k++) rectPx(x, 296 + Math.sin(k) * 6, HZ - 41 - k * 1.5, 3, 2, k < 6 ? '#ffd23a' : '#ff5a0a');
      for (let k = 0; k < 6; k++) rectPx(x, 300 - k * 4 - az() * 3, HZ - 38 + k * 6, 3, 6, '#ff5a0a');
      for (let i = 0; i < 9; i++) montePx(x, 520 + i * 60 + az() * 30, HZ, 40 + az() * 20, 10 + az() * 10, '#3a2028');
      rectPx(x, 760, HZ - 22, 40, 22, '#4a3a42'); for (let k = 0; k < 4; k++) for (let j = 0; j < 3; j++) rectPx(x, 764 + k * 9, HZ - 19 + j * 6, 5, 3, az() < 0.6 ? '#ff7a1a' : '#ffd23a');
      for (let k = 0; k < 8; k++) rectPx(x, 768 + k * 4, HZ - 26 - (k & 1) * 4, 3, 5, '#ff5a0a');
    },
  },
  pinta(P) {
    turboEn(P, 0.5, 0); turboEn(P, 6.6, 0); turboEn(P, 13.6, 0); turboEn(P, 19.4, 0, 20);
    rampaEn(P, 15.25, 12); huecoEn(P, 15.5, 34);      // el salto sobre el río de lava
    const ceniza = ['#5a4a52', '#6a5a62', '#4a3a42'];
    manchaEn(P, 1.6, 12, 11, 7, S_BARRO, ceniza, 1); manchaEn(P, 5.4, -10, 11, 7, S_BARRO, ceniza, 2); manchaEn(P, 9.0, 12, 11, 7, S_BARRO, ceniza, 3); manchaEn(P, 17.4, -10, 11, 7, S_BARRO, ceniza, 4);
  },
  cosas(P) {
    const l = [];
    regalosEn(P, 2.0); regalosEn(P, 8.4); regalosEn(P, 16.4);
    monedasPor(P, [[1.0, 5, 0], [3.4, 4, -10], [4.6, 4, 10], [7.4, 5, 0], [10.4, 4, 10], [12.0, 4, -10], [15.42, 3, 0, 16], [16.5, 4, 0], [18.6, 4, -10], [20.2, 4, 0]]);
    adornosPor(P, l, ['rocalava', 'fumarola', 'pcfuego', 'rocalava'], 0.4, 20.6, 0.6, 8, 16, 9);
    for (const [u, a, p, f] of [[3.9, 22, 4.6, 0], [10.9, 20, 5, 2], [17.4, 22, 4.4, 4]]) movilEn(P, l, 'rocalava', u, a, p, f, { r: 4.6 });
    for (const [u, lado, per, f] of [[1.2, -10, 2.8, 0], [1.6, 10, 2.8, 0.5], [12.6, 0, 3.2, 0.3], [16.4, -8, 3, 0.1], [19.2, 10, 3, 0.6]]) caidaEn(P, l, 'bomba', u, lado, per, f, { radio: 9, alto: 80 });   // bombas de lava
    cartelesPor(P, l, [[['SEMANA 47', 'DE CRUNCH'], 0.8, 18, '#22212c', '#ff7a1a'], [['NO HAY', 'BARANDILLA'], 3.2, -20, '#e63946', '#ffffff'], [['HORAS', 'EXTRA: SÍ'], 6.2, 18, '#22212c', '#ffcb3d'],
      [['PAGADAS: NO'], 9.4, -18, '#e63946', '#ffffff'], [['¡SALTA!'], 15.0, 18, '#ffcb3d', '#22212c'], [['SOON™'], 17.0, -18, '#22212c', '#ffcb3d'], [['FECHA DE', 'SALIDA: AYER'], 19.9, 18, '#22212c', '#ff7a1a'], [['PASARELA', 'SIN SEGURO'], 5.2, -18, '#ffcb3d', '#22212c']]);
    return l;
  },
});
