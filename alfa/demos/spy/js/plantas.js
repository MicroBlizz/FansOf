// Fans of Spy · LAS PLANTAS: los mapas del prototipo, solo datos. Cada planta es un mapa de texto (leyenda en dominio/planta.js),
// sus guardias (tipo, casilla, hacia dónde miran, ruta y `listo`: cuándo actúan por primera vez), sus cámaras (las direcciones
// por las que van girando) y su par de turnos para la nota. `guia` es el mazo preparado y el guion del tutorial (aplicacion/guia.js).
// x crece hacia la derecha e y hacia abajo; el agente entra por abajo (S) y la puerta (M) está arriba.
'use strict';
var SPY = globalThis.SPY || (globalThis.SPY = {});
SPY.PLANTAS = SPY.congela({
  // Planta 1, el parking (decisión 47 del diseño): enseña a moverse y a esconderse. 7 x 9 casillas.
  parking: {
    nombre: 'Planta 1 · Parking', par: 14,
    mapa: [
      '###M###',
      '......K',
      'CC..CC.',
      '.......',
      'CC..CX.',
      '.......',
      '..===GG',
      'C...CC.',
      '...S...',
    ],
    guardias: [
      { id: 'vigilante', tipo: 'vigilante', x: 5, y: 6, dir: 'O', listo: 2 },
      { id: 'becario', tipo: 'becario', x: 2, y: 3, dir: 'E', ruta: [[0, 3], [6, 3]], hacia: 1, listo: 2, patinete: true },
    ],
    camaras: [{ id: 'camara', x: 6, y: 1, dirs: ['O', 'S'], listo: 3 }],
  },
  // Misión de prueba: el mismo parking en el turno de noche, más grande y con todas las reglas. 9 x 12 casillas.
  // Abajo, la garita vigila el hueco de la derecha de la barrera; en medio, un Becario da vueltas a la manzana de coches y otro
  // recorre el pasillo de arriba; las dos cámaras miran a la vez la fila de la puerta y, después, los pasillos de los lados.
  prueba: {
    nombre: 'Misión de prueba · Turno de noche', par: 16,
    mapa: [
      '####M####',
      'K.......K',
      '.CC.P.CC.',
      '.........',
      '.CC.P.CX.',
      '.........',
      '.CC.C.CC.',
      '.........',
      'C.=GG=.CC',
      '.........',
      '.C.....C.',
      '....S....',
    ],
    guardias: [
      { id: 'vigilante', tipo: 'vigilante', x: 4, y: 8, dir: 'E', listo: 3 },
      { id: 'ronda', tipo: 'becario', x: 0, y: 5, dir: 'E', ruta: [[0, 5], [8, 5], [8, 7], [0, 7]], hacia: 1, ciclo: true, listo: 2, patinete: true },
      { id: 'pasillo', tipo: 'becario', x: 6, y: 3, dir: 'O', ruta: [[0, 3], [8, 3]], hacia: 0, listo: 1, patinete: true },
    ],
    camaras: [
      { id: 'camara-1', x: 0, y: 1, dirs: ['E', 'S'], listo: 3 },
      { id: 'camara-2', x: 8, y: 1, dirs: ['O', 'S'], listo: 3 },
    ],
  },
});
