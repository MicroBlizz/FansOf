// Fans of Karts · MUNDO 1 · PLAYA DEL EARLY ACCESS: un paseo de tablas junto al mar, con castillos de arena «en desarrollo desde 2014»
// y sombrillas de alquiler a precio de DLC. Las olas mojan la pista y empujan hacia el agua, y los cangrejos cruzan cuando quieren. Fácil.
'use strict';

PISTAS.push({
  id: 'playa', invertida: true, mundo: 1, nombre: 'Playa del Early Access', lema: 'Sol, arena y un juego en acceso anticipado desde 2014. Las olas no se arreglan con un parche.', dificultad: 1, musica: 'animales', color: '#2fb0d8', polvo: '#e8d0a0',
  puntos: [[512, 140], [700, 135], [860, 190], [905, 320], [840, 440], [880, 560], [900, 700], [820, 840], [650, 885], [480, 845], [330, 885], [180, 830], [125, 690], [200, 560], [140, 420], [165, 270], [300, 165]],
  ancho: 74, margen: 42, borde: 'muro',
  tramos: [{ deU: 9.2, aU: 10.6, ancho: 62, suave: 0.03 }],      // el muelle estrecho
  lejos: ['#2a9fd0', '#2696c8'],
  voladores: [{ id: 'dirigible', s: 640, y: 12, vel: -5, tam: 0.3 }],
  tema: (() => {
    const [t1, t2, t3, junta, borde, k1, k2, a1, a2, a3, concha, v1, v2, m1, m2, m3] = C32('#c99a64', '#bd8e58', '#d4a670', '#8a6038', '#f4f4f8', '#ff5c8a', '#ffffff', '#f2d48a', '#ead09a', '#f8e0a8', '#ffffff', '#c98a4b', '#8b5530', '#2fb0d8', '#2aa2cc', '#5cc8e8');
    const arena = grano([a1, a1, a2, a3]);
    return {
      pista: (x, y, m, i) => {
        if (m > -3) return borde;
        if ((i & 1) === 0 && ruido(x >> 1, y >> 1) < 0.5 && (m & 7) === 0) return junta;       // los clavos de las tablas
        return ruido(x >> 2, y) < 0.15 ? t3 : (i & 1) ? t1 : t2;                               // tablas de madera, una de cada tono
      },
      bordillo: (x, y, m, i) => ((i >> 1) & 1 ? k1 : k2),                                       // la cuerda de boyas
      lento: (x, y) => (ruido(x, y) < 0.012 ? concha : arena(x, y)),
      muro: (x, y, m) => (((x + y) & 3) === 0 || m < 1.4 ? v2 : v1),                            // la valla de estacas
      vacio: () => m1,
      fuera: (x, y) => { const n = ruido(x >> 4, y >> 4); return y > 900 || x > 950 || x < 60 ? (ruido(x >> 2, y >> 1) < 0.2 ? m3 : n < 0.5 ? m1 : m2) : arena(x, y); },
    };
  })(),
  cielo: {
    colores: ['#3aa0e8', '#62b8f0', '#94d0f6', '#d8f0ff'], niebla: '#cdeaf8', filas: 9, viento: 3, semilla: 21,
    atras(x, az) {
      elipsePx(x, 300, 13, 10, 10, '#fff3a0'); elipsePx(x, 300, 13, 8, 8, '#ffffff');
      for (let i = 0; i < 10; i++) nubePx(x, az() * CIELO_W, 8 + az() * 26, 12 + az() * 20, '#ffffff', '#b8dcf4');
      for (let i = 0; i < 6; i++) { const a = az() * CIELO_W, b = 10 + az() * 20; rectPx(x, a, b, 2, 1, '#2a3a5a'); rectPx(x, a + 2, b - 1, 2, 1, '#2a3a5a'); rectPx(x, a + 4, b, 2, 1, '#2a3a5a'); }   // gaviotas
    },
    delante(x, az) {
      rectPx(x, 0, HZ - 12, CIELO_W, 12, '#2a9fd0'); rectPx(x, 0, HZ - 12, CIELO_W, 1, '#8fd8f4');
      for (let i = 0; i < 40; i++) rectPx(x, az() * CIELO_W, HZ - 11 + az() * 10, 3 + az() * 6, 1, '#7fd0f0');
      // un crucero de Microblizz y unas islas con palmeras
      rectPx(x, 610, HZ - 19, 50, 7, '#f4f4f8'); rectPx(x, 616, HZ - 23, 34, 4, '#f4f4f8'); rectPx(x, 622, HZ - 27, 18, 4, '#f4f4f8'); rectPx(x, 640, HZ - 33, 5, 6, '#e63946');
      for (let k = 0; k < 8; k++) rectPx(x, 614 + k * 6, HZ - 17, 3, 2, '#3a7de0');
      for (let i = 0; i < 6; i++) { const a = i * 170 + az() * 60; if (a > 590 && a < 680) continue; elipsePx(x, a, HZ - 12, 18 + az() * 10, 4, '#e8d098'); palmeraPx(x, a - 4 + az() * 8, HZ - 14, 10 + az() * 6, '#8a6038', '#2f8a3a'); }
    },
  },
  pinta(P) {
    turboEn(P, 0.55, 0); turboEn(P, 6.4, 0); turboEn(P, 12.9, 0, 20);
    rampaEn(P, 9.0, 10);        // el trampolín del muelle
    const mojada = ['#b8945e', '#a88450', '#d8c08a'], ola = ['#5cc8e8', '#ffffff', '#2fb0d8'];
    manchaEn(P, 2.6, 14, 12, 7, S_BARRO, mojada, 1); manchaEn(P, 7.6, -12, 12, 7, S_BARRO, mojada, 2); manchaEn(P, 11.4, 14, 12, 7, S_BARRO, mojada, 3); manchaEn(P, 15.3, -12, 12, 7, S_BARRO, mojada, 4);
    corrienteEn(P, 4.6, 0, 40, 60, 26, 0, ola); corrienteEn(P, 10.1, 0, 36, 52, -24, 0, ola); corrienteEn(P, 14.2, 0, 40, 60, 26, 0, ola);     // las olas que se meten en la pista
  },
  cosas(P) {
    const l = [];
    regalosEn(P, 2.0); regalosEn(P, 8.3); regalosEn(P, 13.6);
    monedasPor(P, [[1.1, 5, 0], [3.4, 4, 14], [5.4, 4, -12], [6.9, 5, 0], [9.6, 4, 0], [11.9, 4, -14], [13.0, 4, 12], [15.6, 5, 0]]);
    adornosPor(P, l, ['palmera', 'palmera', 'sombrilla', 'sombrilla', 'castillo', 'socorrista'], 0.4, 16.7, 0.55, 14, 26, 1);
    for (const [u, lado, per, f] of [[1.7, -12, 3.2, 0], [5.0, 12, 3.6, 0.4], [11.0, -10, 3.4, 0.7], [15.0, 12, 3.2, 0.2]]) caidaEn(P, l, 'balon', u, lado, per, f, { radio: 9, alto: 60 });   // balones de playa gigantes
    movilEn(P, l, 'cangrejo', 3.9, 26, 5.5, 0); movilEn(P, l, 'cangrejo', 8.9, 22, 6.2, 2); movilEn(P, l, 'cangrejo', 12.1, 26, 4.8, 4);
    cartelesPor(P, l, [[['ACCESO', 'ANTICIPADO'], 0.8, 26, '#22212c', '#ffcb3d'], [['HAMACA', '4,99 €/MIN'], 3.0, -24, '#2fb0d8', '#ffffff'],
      [['CASTILLO EN', 'DESARROLLO'], 5.9, 24, '#c99a64', '#22212c'], [['PROHIBIDO', 'EL BAÑO'], 8.0, -24, '#e63946', '#ffffff'],
      [['OLAS EN', 'VERSIÓN BETA'], 10.6, 26, '#22212c', '#5cc8e8'], [['SOON™'], 13.3, -24, '#22212c', '#ffcb3d'], [['CANGREJOS', 'NO REEMBOLS.'], 16.1, 24, '#ff5a3c', '#ffffff']]);
    return l;
  },
});
