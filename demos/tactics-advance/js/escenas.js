// Fans of Tactics Advance (prototipo) · ESCENARIOS: el Cementerio de juegos y las Oficinas de Microblizz (suelos, decorados, enemigos, cielo).
'use strict';

const ESCENAS = {
  cementerio: {
    nombre: 'Cementerio',
    suelo: { g: 'hierba', d: 'tierra', s: 'losa' }, lado: { g: 'roca', d: 'roca', s: 'muro' }, agua: 'agua',
    flores: true, musgo: true,
    props: [[0, 0, 'arbol'], [3, 0, 'tumba'], [1, 3, 'cruz'], [0, 2, 'tumba'], [7, 7, 'cripta'], [9, 5, 'arbolMuerto'],
            [5, 1, 'farol'], [7, 3, 'arbusto'], [5, 8, 'arbusto'], [8, 8, 'tumba'], [2, 1, 'farol'], [7, 0, 'arbolMuerto']],
    enemigo: 'esqueleto', nombreE: 'Esqueleto en paro', claseE: 'NO-MUERTOS',
    norma: 'Prohibido curarse', queja: ['¡Primero me despiden', 'y ahora esto!'],
    luciernagas: true,
  },
  oficinas: {
    nombre: 'Oficinas',
    suelo: { g: 'moqueta', d: 'baldosa', s: 'marmol' }, lado: { g: 'pared', d: 'pared', s: 'pared' }, agua: 'foso',
    flores: false, musgo: false,
    props: [[0, 0, 'planta'], [3, 0, 'mesa'], [1, 3, 'fuente'], [0, 2, 'archivador'], [7, 7, 'mesa'], [9, 5, 'planta'],
            [5, 1, 'cajas'], [7, 3, 'planta'], [5, 8, 'cajas'], [8, 8, 'archivador'], [2, 1, 'mesa'], [7, 0, 'cajas']],
    enemigo: 'becario', nombreE: 'Becario sin sueldo', claseE: 'MICROBLIZZ',
    norma: 'Prohibido descansar', queja: ['¡Ni siquiera', 'me pagan!'],
    luciernagas: false,
  },
};
