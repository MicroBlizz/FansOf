// Fans Of Sótano · AJUSTES: todas las cifras del juego en un sitio (economía, curvas, tiempos). Las fija la simulación de ritmo
// (tests/sotano/integracion/ritmo.test.mjs): si cambias una, vuelve a pasarla. Qué es cada cosa: docs/sotano/PLAN.md.
'use strict';
// lo que core pide a todo juego (core/js/sistema/ligero.js): sin `id` a propósito, así la cuenta de core queda apagada y la partida del
// prototipo vive solo en este navegador
const AJUSTES = { id: '', nombre: 'Fans Of Sótano', guardado: 'for-sotano-v1', sinFeedback: true };
SO.AJ = {
  version: '0.1.0',
  planta: { columnas: 6, filas: 4, limpia: 0.7, plantasPorPar: 4, plantasPorZona: 16, extraSinFin: 1.15 },
  material: { vida0: 10, vidaBase: 2.5, valor0: 1, valorBase: 2.4, receta0: 2 },
  pico: { golpesSeg: 1.2, critBase: 0.05, critMulti: 2, superMulti: 3, toqueMulti: 1 },
  // mejoras del pico, pagadas con oro: coste = base · factor^nivel
  picoMejoras: {
    dano: { base: 4, factor: 1.13, max: 400 },
    velocidad: { base: 60, factor: 1.55, max: 15, paso: 0.08 },
    radio: { base: 150, factor: 1.7, max: 10, paso: 0.06 },
  },
  // la mejora de cada material, pagada con piezas de ese material
  mejoraMaterial: { base: 4, factor: 1.18, max: 25 },
  xp: { base: 10, factor: 1.16, topeBase: 30, topePorNivelTrituradora: 5 },
  dinamita: { recarga: 60, multi: 8 },
  especiales: { dorada: 0.04, doradaMulti: 3, arcoiris: 0, arcoirisMulti: 10, multiRoca: 0.04, multiRocaMulti: 3 },
  reciclado: { x2: 0.05, x3: 0 },
  trituradora: { niveles: 10, vida0: 150000, vidaBase: 3.2, armadura0: 2, armaduraBase: 2.6, intento: 30, espera: 1200, premioOro: 200 },
  despido: { nivelMinimo: 20, base: 12, factor: 1.084, desde: 10 },
  recuerdo: { base: 8, factor: 1.6, max: 20 },
  expediente: { umbrales: [40, 400, 4000], vida: [1, 0.9, 0.8, 0.65], premio: [1, 1.1, 1.2, 1.35] },
  ayudante: { parteDelPico: 0.3, golpesSeg: 0.8 },
  cofre: { medidor: 120, guardaMax: 10, duracion: 60 },
  correo: { cadaMin: 35, cadaExtra: 30, vuelo: 7, premioSegundos: 25, cofre: 0.2 },
  sindicato: { cada: 600, guardaMax: 3, premioSegundos: 90 },
  horasExtra: { parte: 0.25, topeHoras: 12 },
  carreraPuntos: { porNivelTrituradora: 1, cadaNiveles: 10 },
};
