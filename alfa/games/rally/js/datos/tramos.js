// Fans of Rally · datos · TRAMOS: los tres circuitos del campeonato, en el orden en que se corren. Cada uno trae los puntos por los que
// pasa la carretera (se unen con una curva suave en dominio/pista.js), su ancho, el suelo de cada trozo (desde qué parte de la vuelta),
// el tiempo que da (en vueltas de referencia, ver dominio/carrera.js), los colores del paisaje, qué adornos salen a los lados y su música.
'use strict';
RA.TRAMOS = RA.congela([
  {
    id: 'desierto', nombre: 'Desierto', lema: 'Tierra suelta y rectas largas. Derrapa con alegría.',
    ancho: 104,
    puntos: [[600, 260], [1150, 220], [1700, 300], [1960, 560], [1860, 860], [1520, 960], [1560, 1240], [1880, 1420], [1820, 1760],
      [1420, 1900], [980, 1800], [760, 1500], [460, 1620], [220, 1380], [300, 980], [560, 760], [360, 500]],
    suelos: [[0, 'asfalto'], [0.06, 'tierra'], [0.55, 'asfalto'], [0.62, 'tierra']],
    tiempo: { inicial: 0.62, porControl: 0.36 },
    paisaje: { fuera: '#e2b46a', fuera2: '#d29f55', fuera3: '#f0c886', borde: '#c98f45' },
    adornos: ['cactus', 'roca', 'palmera'], densidad: 0.55,
    musica: 'raDesierto',
  },
  {
    id: 'bosque', nombre: 'Bosque', lema: 'Barro, curvas cerradas y árboles muy cerca.',
    ancho: 90,
    puntos: [[500, 300], [900, 260], [1180, 420], [1460, 300], [1760, 420], [1720, 760], [1420, 860], [1600, 1120], [1880, 1240],
      [1820, 1600], [1460, 1700], [1180, 1500], [900, 1680], [560, 1720], [300, 1500], [420, 1180], [700, 1040], [520, 760], [260, 560]],
    suelos: [[0, 'asfalto'], [0.1, 'tierra'], [0.3, 'barro'], [0.45, 'tierra'], [0.7, 'barro'], [0.82, 'asfalto']],
    tiempo: { inicial: 0.62, porControl: 0.37 },
    paisaje: { fuera: '#3f8f35', fuera2: '#2f7428', fuera3: '#58a844', borde: '#5b4a2a' },
    adornos: ['arbol', 'arbol', 'tronco', 'roca'], densidad: 0.7,
    musica: 'animales',
  },
  {
    id: 'montana', nombre: 'Montaña', lema: 'Asfalto y nieve. Las horquillas no perdonan.',
    ancho: 84,
    puntos: [[400, 280], [820, 240], [1060, 460], [880, 700], [1160, 860], [1520, 700], [1840, 820], [1880, 1180], [1580, 1300],
      [1360, 1560], [1700, 1760], [1500, 1980], [1060, 1900], [900, 1600], [620, 1820], [300, 1640], [420, 1260], [220, 1000], [460, 760], [240, 500]],
    suelos: [[0, 'asfalto'], [0.22, 'nieve'], [0.48, 'asfalto'], [0.66, 'nieve'], [0.88, 'asfalto']],
    tiempo: { inicial: 0.64, porControl: 0.38 },
    paisaje: { fuera: '#f2f7ff', fuera2: '#dde7f4', fuera3: '#ffffff', borde: '#7488a8' },
    adornos: ['pinoNevado', 'pinoNevado', 'rocaNieve'], densidad: 0.6,
    musica: 'raMontana',
  },
]);
// los colores de cada suelo de la carretera (el grano se pone al pintarla)
RA.COLOR_SUELO = RA.congela({
  asfalto: ['#3a3a42', '#55555f', '#2a2a30'],
  tierra: ['#b9783e', '#cf9256', '#9a5f2c'],
  barro: ['#6b4a2c', '#7f5a37', '#4f351e'],
  nieve: ['#b9c9de', '#cbd8ea', '#9fb2cc'],   // nieve pisada: más oscura que la de fuera para que se vea el camino
});
