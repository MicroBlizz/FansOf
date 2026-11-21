// Fans of Pinball · AJUSTES · CRIATURAS: las criaturas que hacen de bola (Animales Locos), su poder con las cifras de cada nivel (1 a 5)
// y lo que cuesta subirlas con fichas (PROTOTIPO.md, «Las tres criaturas» y «Mejoras permanentes»). Listas por nivel: [n1, n2, n3, n4, n5].
'use strict';
AJUSTES.criaturas = PB.congela({
  equipo: ['crazybunny', 'boombeaver', 'slyfox'],   // (espec.) el equipo inicial; la primera sale de bola
  lista: {
    crazybunny: {
      nombre: 'CrazyBunny', poder: 'salto', texto: 'Cada pocos golpes da un bote y aplasta lo de alrededor',
      cada: [10, 10, 8, 8, 6],  // (espec. 10 y 8 en el nivel 3; partida el 5) golpes entre saltos
      dano: 20, radio: 22.5,    // (espec.) 20 en un círculo de 1/4 de mesa de ancho
    },
    boombeaver: {
      nombre: 'BoomBeaver', poder: 'dinamita', texto: 'Tras un golpe fuerte de pala, lo siguiente que toca explota',
      dano: 30, radio: [16, 16, 22, 22, 28],   // (espec. 30; partida los radios) área pequeña, mayor en los niveles 3 y 5
    },
    slyfox: {
      nombre: 'SlyFox', poder: 'emboscada', texto: 'Si pasa un rato sin tocar nada, su siguiente golpe hace el triple',
      espera: [2, 2, 1.5, 1.5, 1],   // (espec. 2 y 1,5; partida el 5) segundos sin tocar nada para esconderse
      multiplicador: 3,         // (espec.)
    },
    junkcoon: {
      nombre: 'JunkCoon', poder: 'basura', texto: 'Cada pocos golpes suelta una bolsa de basura que explota',
      cada: [6, 6, 5, 5, 4],    // (espec. 6 y 5; partida el 5)
      dano: 25, radio: 20,      // (espec. 25; partida el radio)
      caida: 0.6,               // (partida) segundos que cae la bolsa antes de explotar
    },
  },
});
AJUSTES.progreso = PB.congela({
  nivelMaximo: 5,               // (espec.)
  danoPorNivel: 2,              // (espec.) 10, 12, 14, 16, 18
  coste: { 2: 300, 3: 600, 4: 1000, 5: 1600 },   // (espec.) fichas para llegar a cada nivel
});
