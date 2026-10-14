// Fans of Karts · TUTORIAL · LA MADRIGUERA: el circuito de prácticas de CrazyBunny, en el prado de los Animales Locos, junto a La
// Madriguera (la casa de Fans of Roguelite). Un ocho muy ancho y sin peligros, con un puente en medio (puente.js): aquí se aprende a jugar paso a
// paso (tutorial.js). No pertenece a ningún mundo (mundo 0): se entra desde el botón TUTORIAL.
'use strict';

PISTAS.push({
  id: 'tutorial', mundo: 0, nombre: 'La Madriguera', lema: 'El circuito de prácticas de CrazyBunny. Aquí no hay micropagos (todavía).', dificultad: 1, musica: 'animales', color: '#5cbf4a', polvo: '#c8a070',
  // un ocho: dos lazos que se cruzan en el centro del mapa
  puntos: Array.from({ length: 16 }, (_, i) => { const t = Math.PI / 4 + (i / 16) * TAU; return [Math.round(512 + 360 * Math.sin(t)), Math.round(512 + 262 * Math.sin(2 * t))]; }),
  ancho: 88, margen: 54, borde: 'muro',
  puente: { arriba: [12.3, 15.7], abajo: [5.2, 6.8], centro: 14, alto: 12, radio: 72 },      // el lazo de la vuelta pasa por encima del de ida
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
    turboEn(P, 0.6, 0); turboEn(P, 0.95, 0); turboEn(P, 8.6, 0); turboEn(P, 12.6, 0, 24);
    rampaEn(P, 4.6, 12); rampaEn(P, 11.0, 12);
  },
  cosas(P) {
    const l = [];
    regalosEn(P, 1.9, 5); regalosEn(P, 7.4, 5); regalosEn(P, 13.4, 5);
    monedasPor(P, [[1.2, 6, 0], [2.6, 5, 16], [3.6, 5, -16], [5.3, 5, 0], [7.9, 6, 0], [9.6, 5, 16], [10.4, 5, -16], [12.0, 5, 0], [14.6, 6, 0]]);
    adorno(P, l, 'madriguera', 0.15, 38); adorno(P, l, 'madriguera', 8.1, 40);
    adornosPor(P, l, ['zanahoria', 'zanahoria', 'vaca', 'seta', 'globos', 'helecho', 'vaca'], 0.6, 15.6, 0.45, 14, 34, 21);
    cartelesPor(P, l, [[['LA', 'MADRIGUERA'], 0.5, -26, '#5cbf4a', '#ffffff'], [['¡FLECHAS!', 'TURBO'], 0.75, 26, '#ff8a1f', '#ffffff'], [['REGALOS', 'AQUÍ'], 1.6, -26, '#ff5c8a', '#ffffff'],
      [['¡DERRAPA!'], 2.6, 30, '#ffcb3d', '#22212c'], [['RAMPA'], 4.3, -26, '#ffcb3d', '#22212c'], [['PASO', 'SUBTERRÁNEO'], 5.4, 30, '#22212c', '#ffcb3d'], [['PUENTE', 'DE TABLAS'], 12.9, 28, '#c98a4b', '#ffffff'],
      [['PROHIBIDO', 'MICROBLIZZ'], 9.0, -28, '#e63946', '#ffffff'], [['ZANAHORIAS', 'POR LA CARA'], 10.4, 28, '#ff8a1f', '#ffffff'], [['TUTORIAL', 'SIN ANUNCIOS'], 13.0, -26, '#22212c', '#5ef27a']]);
    return l;
  },
});
