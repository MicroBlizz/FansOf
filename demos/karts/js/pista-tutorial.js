// Fans of Karts · TUTORIAL · LA MADRIGUERA: el circuito de prácticas de CrazyBunny, en el prado de los Animales Locos, junto a La
// Madriguera (la casa de Fans of Roguelite). Un ocho alto y torcido (dos lazos y dos rectas largas que se cruzan, para probar objetos), todo a ras de suelo: en el cruce se puede chocar (puente.js): aquí se aprende a jugar paso a
// paso (tutorial.js). No pertenece a ningún mundo (mundo 0): se entra desde el botón TUTORIAL.
'use strict';

PISTAS.push({
  id: 'tutorial', mundo: 0, nombre: 'La Madriguera', lema: 'El circuito de prácticas de CrazyBunny. Aquí no hay micropagos (todavía).', dificultad: 1, musica: 'animales', color: '#5cbf4a', polvo: '#c8a070',
  // un ocho alto y torcido: sale bajando por la recta de la derecha, da la vuelta al lazo de abajo, sube por la recta larga en diagonal
  // (a ras de suelo) hasta el lazo de arriba y vuelve a la salida. Las dos rectas se cruzan en el centro (en u 1,54 y u 9,5)
  puntos: [[620, 349], [560, 425], [542, 571], [530, 698], [560, 833], [656, 915], [764, 879], [797, 782], [746, 680], [644, 583], [446, 420], [326, 334], [230, 247],
    [242, 155], [350, 109], [488, 117], [602, 165], [653, 257]],
  ancho: 88, margen: 54, borde: 'muro',
  lejos: ['#4aa83a', '#46a036'],
  tema: (() => {
    const [t1, t2, t3, raya, borde, k1, k2, h1, h2, h3, flor1, flor2, v1, v2, f1, f2, surco] = C32('#c8a070', '#bc9466', '#d4ac7c', '#ff8a1f', '#f4f4f8', '#ff8a1f', '#ffffff', '#5cbf4a', '#52b444', '#68c856', '#ff5c8a', '#ffe14d', '#c98a4b', '#8b5530', '#4aa83a', '#46a036', '#8a6038');
    const prado = grano([h1, h1, h2, h3]);
    return {
      pista: (x, y, m, i, lado, v) => {
        if (m > -3) return borde;
        if (m + v.ancho / 2 < 1.6 && ((i >> 1) & 1)) return raya;                              // rayas de color zanahoria
        return ruido(x >> 1, y >> 1) < 0.08 ? t3 : ruido(x, y) < 0.5 ? t1 : t2;               // camino de tierra
      },
      bordillo: (x, y, m, i) => ((i >> 1) & 1 ? k1 : k2),
      lento: (x, y) => { const r = ruido(x, y); return r < 0.012 ? flor1 : r > 0.988 ? flor2 : prado(x >> 1, y >> 1); },
      muro: (x, y, m) => (((x + y) & 3) === 0 || m < 1.4 ? v2 : v1),                         // valla de madera
      vacio: () => f1,
      fuera: (x, y) => ((y >> 3) % 3 === 0 ? surco : ((x >> 5) + (y >> 5)) & 1 ? f1 : f2),   // huertos de zanahorias
    };
  })(),
  cielo: {
    colores: ['#4a9be6', '#78b8f0', '#b0d8f8', '#e8f8ff'], niebla: '#cfe8f0', filas: 10, viento: 3, semilla: 5,
    atras(x, az) {
      elipsePx(x, 200, 12, 9, 9, '#fff3a0'); elipsePx(x, 200, 12, 7, 7, '#ffffff');
      for (let i = 0; i < 12; i++) nubePx(x, az() * CIELO_W, 8 + az() * 24, 12 + az() * 18, '#ffffff', '#c8dcf4');
    },
    delante(x, az) {   // colinas verdes, el bosque de Fans of Roguelite y molinos
      for (let i = 0; i < 12; i++) montePx(x, i * 90 + az() * 40, HZ, 50 + az() * 30, 8 + az() * 10, i & 1 ? '#3f9a3a' : '#4aa83a');
      for (let i = 0; i < 40; i++) pinoPx(x, az() * CIELO_W, HZ, 5 + az() * 8, '#2f7a3a');
      for (const a of [140, 620]) { rectPx(x, a, HZ - 22, 4, 22, '#f4f4f8'); for (let k = 0; k < 4; k++) rectPx(x, a + 2 + Math.cos(k * 1.57 + 0.5) * 6, HZ - 22 + Math.sin(k * 1.57 + 0.5) * 6, 2, 2, '#c98a4b'); }
      for (let i = 0; i < 30; i++) { const a = az() * CIELO_W; rectPx(x, a, HZ - 2, 2, 2, '#ff8a1f'); rectPx(x, a, HZ - 4, 2, 2, '#3fae4a'); }
    },
  },
  voladores: [{ id: 'globoconejo', s: 800, y: 12, vel: -4, tam: 0.34 }],
  pinta(P) {
    turboEn(P, 2.7, 0); turboEn(P, 3.05, 0); turboEn(P, 11, 0); turboEn(P, 16.2, 0, 24);
    rampaEn(P, 3.8, 12); rampaEn(P, 11.6, 12);
  },
  cosas(P) {
    const l = [];
    regalosEn(P, 2.4, 5); regalosEn(P, 8.4, 5); regalosEn(P, 12.3, 5); regalosEn(P, 15.6, 5);      // en las rectas largas: hay sitio para probar lo que toque
    monedasPor(P, [[3.3, 6, 0], [4.6, 5, 16], [6, 5, -16], [7.4, 5, 0], [10.6, 6, 0], [12.9, 5, 16], [14, 5, -16], [17, 6, 0]]);
    adorno(P, l, 'madriguera', 5.9, 44); adorno(P, l, 'madriguera', 13.6, 44);
    const bichos = ['zanahoria', 'zanahoria', 'vaca', 'seta', 'globos', 'helecho', 'vaca'];      // lejos del cruce, que allí estorbarían a la otra recta
    adornosPor(P, l, bichos, 2.6, 8.6, 0.45, 14, 34, 21); adornosPor(P, l, bichos, 10.5, 17.9, 0.45, 14, 34, 22);
    cartelesPor(P, l, [[['LA', 'MADRIGUERA'], 17.9, -26, '#5cbf4a', '#ffffff'], [['CRUCE', 'PELIGROSO'], 0.4, 30, '#22212c', '#ffcb3d'], [['¡FLECHAS!', 'TURBO'], 2.5, 26, '#ff8a1f', '#ffffff'],
      [['REGALOS', 'AQUÍ'], 2.2, -26, '#ff5c8a', '#ffffff'], [['RAMPA'], 3.6, -26, '#ffcb3d', '#22212c'], [['¡DERRAPA!'], 4.6, 30, '#ffcb3d', '#22212c'], [['PELIGRO', 'CHOQUES'], 8.6, 28, '#e63946', '#ffffff'],
      [['PROHIBIDO', 'MICROBLIZZ'], 10.8, -28, '#e63946', '#ffffff'], [['ZANAHORIAS', 'POR LA CARA'], 13, 28, '#ff8a1f', '#ffffff'], [['TUTORIAL', 'SIN ANUNCIOS'], 15.2, -26, '#22212c', '#5ef27a']]);
    return l;
  },
});
