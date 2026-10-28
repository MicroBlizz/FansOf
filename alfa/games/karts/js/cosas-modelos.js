// Fans of Karts (prototipo) · LOS MODELOS DE LAS COSAS: los adornos de las pistas (plantas, mesas, lápidas, servidores…), lo que se
// recoge (monedas de oro, regalos y cápsulas de gashapon) y los objetos (el Nerf, el Parche, el cono de mantenimiento…). Se montan con las mismas
// piezas que los karts (modelos.js) y se les hace la foto igual, así todo tiene el mismo aspecto. Lo que se ve de frente es la cara -y.
// Los carteles con letras son aparte: un tablón pintado con la letra de píxeles (cartelDe).
'use strict';

const PL = (c, r, m, x = {}) => BLOQUE(c, r, m, { parte: 90, ...x });   // un detalle plano pegado a una cara (no hace línea con su pieza)
const COSAS = {
  // ---------- oficinas ----------
  planta: { medio: 5.5, alto: 13.5, mats: { maceta: '#c8643c', hoja: { c: '#3fae4a', s: '#1f6b3a', l: '#8be06a' }, tierra: '#5a3a2a' },
    piezas: [CONO([0, 0, 2], [2.2, 2.9, 2], 'maceta'), CONO([0, 0, 4.1], [2.6, 2.6, 0.2], 'tierra'), ESF([0, 0, 8.6], [3.6, 3.4, 4.2], 'hoja'), ESF([-2.9, 0, 6.6], [2.4, 2.2, 2.6], 'hoja'), ESF([2.8, -0.4, 7.2], [2.5, 2.2, 2.8], 'hoja')] },
  mesa: { medio: 7.5, alto: 12.5, mats: { madera: '#c98a4b', metal: '#7d889e', negro: '#2b2d3a', pantalla: { c: '#3a7de0', plano: true }, error: { c: '#ffffff', plano: true }, papel: '#f4f4f8' },
    piezas: [BLOQUE([0, 0, 5], [6.5, 3.6, 0.5], 'madera'), BLOQUE([-5.4, 0, 2.3], [0.5, 3, 2.3], 'metal'), BLOQUE([5.4, 0, 2.3], [0.5, 3, 2.3], 'metal'),
      BLOQUE([1, 0.6, 9], [3.3, 0.45, 2.5], 'negro', { parte: 3 }), PL([1, 0.1, 9], [2.8, 0.1, 2], 'pantalla'), PL([1, -0.05, 9.4], [1.7, 0.1, 0.3], 'error'), PL([1, -0.05, 8.4], [1.1, 0.1, 0.25], 'error'),
      BLOQUE([1, 0.6, 6.1], [0.6, 0.5, 0.7], 'negro', { parte: 3 }), BLOQUE([-3.8, -1, 5.9], [1.5, 1.9, 0.35], 'papel')] },
  fuente: { medio: 3.6, alto: 15, mats: { cuerpo: '#e8f1ff', agua: { c: '#4fc3ff', s: '#1f7fd0', l: '#bdeaff', brillo: true }, gris: '#7d889e', rojo: { c: '#ff3348', plano: true }, azul: { c: '#3a7de0', plano: true } },
    piezas: [BLOQUE([0, 0, 4.4], [2.4, 2.2, 4.4], 'cuerpo'), PL([-0.9, -2.25, 6.3], [0.45, 0.1, 0.45], 'rojo'), PL([0.9, -2.25, 6.3], [0.45, 0.1, 0.45], 'azul'), BLOQUE([0, -2.2, 4.4], [1.5, 0.5, 0.25], 'gris'),
      CONO([0, 0, 11.3], [2.1, 1.7, 2.5], 'agua', { parte: 2 }), CONO([0, 0, 14], [0.9, 0.9, 0.35], 'gris', { parte: 2 })] },
  archivador: { medio: 4, alto: 13.5, mats: { gris: { c: '#8f9bb3', s: '#5a6378', l: '#c3cbe0' }, oscuro: { c: '#3a4258', plano: true }, tirador: { c: '#e8f1ff', plano: true }, caja: '#c98a4b' },
    piezas: [BLOQUE([0, 0, 5.6], [3.1, 2.6, 5.6], 'gris'), ...[2.2, 5.6, 9].flatMap(z => [PL([0, -2.62, z], [2.6, 0.1, 1.35], 'oscuro'), PL([0, -2.75, z + 0.5], [0.9, 0.1, 0.22], 'tirador')]),
      BLOQUE([0.4, 0, 12.3], [2.2, 1.8, 1.1], 'caja', { parte: 2 })] },
  // ---------- cementerio ----------
  lapida: { medio: 4.2, alto: 10.5, mats: { piedra: { c: '#8d86a8', s: '#4a4368', l: '#c9c4e0' }, marca: { c: '#3a3356', plano: true }, musgo: '#4f9a5a' },
    piezas: [BLOQUE([0, 0, 3.6], [3.2, 1.1, 3.6], 'piedra'), CONO([0, 0, 7.2], [3.2, 3.2, 1.1], 'piedra', { g: EJE_Y }),
      PL([0, -1.15, 6.6], [0.42, 0.1, 1.9], 'marca'), PL([0, -1.15, 7.3], [1.3, 0.1, 0.42], 'marca'), PL([0, -1.15, 2.6], [2, 0.1, 0.3], 'marca'), PL([0, -1.15, 1.5], [1.4, 0.1, 0.3], 'marca'),
      ESF([-2.6, -0.6, 0.6], [1.6, 1.1, 0.9], 'musgo', { parte: 2 })] },
  cruz: { medio: 4.2, alto: 13.5, mats: { piedra: { c: '#a39cc0', s: '#55507a', l: '#dcd8f0' }, musgo: '#4f9a5a' },
    piezas: [BLOQUE([0, 0, 6.2], [0.95, 0.95, 6.2], 'piedra'), BLOQUE([0, 0, 8.6], [3.3, 0.95, 0.95], 'piedra'), ESF([0, -0.2, 0.7], [2.6, 1.6, 1], 'musgo', { parte: 2 })] },
  arbol: { medio: 8, alto: 21.5, mats: { tronco: { c: '#5a4a6e', s: '#2a2040', l: '#8a7aa0' } },
    piezas: [CONO([0, 0, 6.5], [1.9, 1, 6.5], 'tronco'), CONO([2.9, 0, 13.6], [0.8, 0.3, 4], 'tronco', { g: [0, 0, 42] }), CONO([-2.6, 0, 12.4], [0.8, 0.3, 3.6], 'tronco', { g: [0, 0, -50] }),
      CONO([0.3, 0, 16.2], [0.8, 0.25, 3.8], 'tronco', { g: [0, 0, -8] }), CONO([5.2, 0, 17.6], [0.4, 0.15, 2.2], 'tronco', { g: [0, 0, -20] }), CONO([-5.1, 0, 15.6], [0.4, 0.15, 2.2], 'tronco', { g: [0, 0, 16] })] },
  farol: { medio: 3, alto: 19, mats: { hierro: { c: '#3a3356', s: '#1c1028', l: '#6e6890' }, fuego: { c: '#5ef2d0', plano: true }, luz: { c: '#d8fff4', plano: true } },
    piezas: [CONO([0, 0, 0.5], [1.6, 1.2, 0.5], 'hierro'), CONO([0, 0, 7], [0.5, 0.5, 6.5], 'hierro'), BLOQUE([0, 0, 13.6], [1.5, 1.5, 0.3], 'hierro'), ESF([0, 0, 15.3], [1.25, 1.25, 1.6], 'fuego', { parte: 2 }),
      ESF([0, -0.6, 15.1], [0.55, 0.55, 0.8], 'luz', { parte: 2 }), CONO([0, 0, 17.6], [1.9, 0.3, 0.8], 'hierro', { parte: 3 })] },
  fantasma: { medio: 4, alto: 11.5, mats: { sabana: { c: '#eafcff', s: '#8fd0e0', l: '#ffffff' }, ojo: { c: '#1c1028', plano: true } },
    piezas: [ESF([0, 0, 6.5], [3.2, 2.8, 3.6], 'sabana'), CONO([0, 0, 3], [3.2, 3.2, 1.6], 'sabana'), ...[-2.2, 0, 2.2].map(x => ESF([x, 0, 1.3], [1.1, 1.6, 1], 'sabana')),
      ESF([-1.2, -2.6, 7.2], [0.6, 0.3, 0.9], 'ojo', { parte: 2 }), ESF([1.2, -2.6, 7.2], [0.6, 0.3, 0.9], 'ojo', { parte: 2 }), ESF([0, -2.75, 5.3], [0.7, 0.3, 0.55], 'ojo', { parte: 2 })] },
  // ---------- la nube ----------
  rack: { medio: 4.6, alto: 17, mats: { caja: { c: '#3a4258', s: '#1f2437', l: '#6a7390' }, frente: { c: '#1c2133', plano: true }, verde: { c: '#5ef27a', plano: true }, rojo: { c: '#ff3348', plano: true }, cian: { c: '#22e3ff', plano: true } },
    piezas: [BLOQUE([0, 0, 8], [3.6, 2.6, 8], 'caja'), PL([0, -2.62, 8], [3, 0.1, 7.2], 'frente'),
      ...[2.2, 4.6, 7, 9.4, 11.8, 14.2].flatMap((z, i) => [PL([-1.9, -2.75, z], [0.5, 0.1, 0.4], i % 3 === 1 ? 'rojo' : 'verde'), PL([-0.5, -2.75, z], [0.5, 0.1, 0.4], 'cian'), PL([1.6, -2.75, z], [1, 0.1, 0.22], 'caja')])] },
  nube: { medio: 9, alto: 8.5, mats: { nube: { c: '#ffffff', s: '#a8d4f5', l: '#ffffff' } },
    piezas: [ESF([0, 0, 4.2], [5.2, 3, 4], 'nube', { parte: 1 }), ESF([-4.6, 0, 2.8], [3.6, 2.6, 2.7], 'nube', { parte: 1 }), ESF([4.8, 0, 3], [3.8, 2.6, 2.9], 'nube', { parte: 1 })] },
  antena: { medio: 5.5, alto: 15, mats: { metal: { c: '#c3cbe0', s: '#6a7390', l: '#ffffff', brillo: true }, rojo: { c: '#ff3348', plano: true }, oscuro: '#3a4258' },
    piezas: [CONO([0, 0, 0.6], [2.2, 1.6, 0.6], 'oscuro'), CONO([0, 0, 5], [0.5, 0.5, 4.6], 'oscuro'), ESF([0.4, 0.6, 10.4], [4.6, 1.5, 4.2], 'metal', { g: [0, -24, 0], parte: 2 }),
      CONO([0.2, -1.6, 10.8], [0.25, 0.25, 2], 'oscuro', { g: [0, 66, 0], parte: 3 }), ESF([0.2, -3.5, 11.6], [0.65, 0.65, 0.65], 'rojo', { parte: 3 })] },
  // ---------- lo que se recoge ----------
  moneda: { medio: 3.4, alto: 7.5, angs: 8, mats: { oro: { c: '#ffcb3d', s: '#c9841a', l: '#fff3a0', brillo: true }, marca: { c: '#c9841a', plano: true } },
    piezas: [CONO([0, 0, 3.8], [2.8, 2.8, 0.55], 'oro', { g: EJE_Y }), BLOQUE([0, -0.6, 3.8], [0.45, 0.06, 1.5], 'marca', { parte: 2 }), BLOQUE([0, 0.6, 3.8], [0.45, 0.06, 1.5], 'marca', { parte: 2 })] },
  // ---------- los objetos ----------
  hotfix: { medio: 5.2, alto: 8.5, angs: 8, mats: { tirita: { c: '#f1c9a0', s: '#c08a66', l: '#ffe6d0' }, gasa: { c: '#fff6ea', plano: true }, punto: { c: '#c08a66', plano: true } },
    piezas: [BLOQUE([0, 0, 4.2], [4.4, 0.7, 1.7], 'tirita', { g: [0, 0, 24] }), BLOQUE([0, 0, 4.2], [1.5, 0.82, 1.5], 'gasa', { g: [0, 0, 24], parte: 2 })] },
  pase: { medio: 5.2, alto: 8.5, angs: 8, mats: { oro: { c: '#ffcb3d', s: '#c9841a', l: '#fff3a0', brillo: true }, morado: { c: '#7c3aed', plano: true }, blanco: { c: '#ffffff', plano: true } },
    piezas: [BLOQUE([0, 0, 4.2], [4.4, 0.5, 2.5], 'oro', { g: [0, 0, -10] }), BLOQUE([-2.6, 0, 4.6], [0.7, 0.62, 2.5], 'morado', { g: [0, 0, -10], parte: 2 }), BLOQUE([1, 0, 4], [1.5, 0.62, 0.45], 'blanco', { g: [0, 0, -10], parte: 2 })] },
  nerf: { medio: 3.8, alto: 9.5, angs: 8, mats: { rojo: { c: '#ff3348', s: '#a01030', l: '#ff9aa6' } },
    piezas: [CONO([0, 0, 2.6], [0.2, 3.1, 1.9], 'rojo'), BLOQUE([0, 0, 6.3], [1.25, 1.25, 1.9], 'rojo')] },
  parche: { medio: 4, alto: 8, angs: 8, mats: { disco: { c: '#2f4fae', s: '#16255c', l: '#6f8fe8' }, blanco: { c: '#f4f4f8', plano: true }, metal: { c: '#c3cbe0', plano: true }, raya: { c: '#2f4fae', plano: true } },
    piezas: [BLOQUE([0, 0, 3.6], [3, 0.55, 3], 'disco'), ...[-1, 1].flatMap(s => [PL([0, 0.62 * s, 4.7], [2, 0.06, 1.4], 'blanco'), PL([0, 0.7 * s, 5], [1.4, 0.06, 0.16], 'raya'), PL([0, 0.7 * s, 4.3], [1.4, 0.06, 0.16], 'raya'), PL([0.3, 0.62 * s, 1.6], [1.3, 0.06, 0.85], 'metal')])] },
  botin: { medio: 5, alto: 8.5, angs: 8, mats: { madera: { c: '#8b5530', s: '#4a2a18', l: '#c98a4b' }, oro: { c: '#ffcb3d', s: '#c9841a', l: '#fff3a0', brillo: true }, negro: { c: '#1c1028', plano: true } },
    piezas: [BLOQUE([0, 0, 2.3], [3.9, 2.5, 2.3], 'madera'), CONO([0, 0, 4.6], [2.5, 2.5, 3.9], 'madera', { g: EJE_X }), ...[-2.6, 2.6].map(x => CONO([x, 0, 4.6], [2.62, 2.62, 0.4], 'oro', { g: EJE_X, parte: 2 })),
      BLOQUE([0, 0, 4.3], [4.02, 2.62, 0.3], 'oro', { parte: 2 }), ...[-1, 1].map(s => BLOQUE([0, 2.7 * s, 4.2], [0.75, 0.2, 0.9], 'oro', { parte: 3 }))] },
  cono: { medio: 3.6, alto: 8.5, mats: { naranja: { c: '#ff7a1a', s: '#b0400a', l: '#ffb45c' }, blanco: '#f4f4f8', base: '#2b2d3a' },
    piezas: [BLOQUE([0, 0, 0.4], [2.9, 2.9, 0.4], 'base'), CONO([0, 0, 4.2], [2.3, 0.5, 3.6], 'naranja'), CONO([0, 0, 4.4], [1.75, 1.3, 0.7], 'blanco', { parte: 2 })] },
  reloj: { medio: 3.4, alto: 9, angs: 8, mats: { madera: { c: '#8b5530', s: '#4a2a18', l: '#c98a4b' }, cristal: { c: '#bdeaff', s: '#6fb0e0', l: '#ffffff', brillo: true }, arena: { c: '#ffcb3d', plano: true } },
    piezas: [CONO([0, 0, 0.4], [2.5, 2.5, 0.4], 'madera'), CONO([0, 0, 8], [2.5, 2.5, 0.4], 'madera'), CONO([0, 0, 2.5], [2.1, 0.35, 1.7], 'cristal', { parte: 2 }), CONO([0, 0, 5.9], [0.35, 2.1, 1.7], 'cristal', { parte: 2 }),
      CONO([0, 0, 1.6], [1.75, 1, 0.75], 'arena', { parte: 3 })] },
  spray: { medio: 2.8, alto: 9.5, mats: { bote: { c: '#9aa0ad', s: '#5a6070', l: '#d4d8e0', brillo: true }, tapa: '#6a7080', etiqueta: { c: '#7d8494', plano: true } },
    piezas: [CONO([0, 0, 3.4], [2, 2, 3.4], 'bote'), CONO([0, 0, 7.3], [2, 1, 0.5], 'bote'), CONO([0, 0, 8.3], [0.7, 0.7, 0.6], 'tapa', { parte: 2 }), PL([0, -2.02, 3.4], [1.3, 0.08, 1.6], 'etiqueta')] },
  // ---------- la meta y el dron que te devuelve a la pista ----------
  arco: { medio: 47, alto: 27, mats: { metal: { c: '#c3cbe0', s: '#6a7390', l: '#ffffff' }, pancarta: '#f4f4f8', negro: { c: '#22212c', plano: true }, rojo: '#e63946' },
    piezas: [CONO([-43, 0, 11], [1.6, 1.6, 11], 'metal'), CONO([43, 0, 11], [1.6, 1.6, 11], 'metal'), BLOQUE([-43, 0, 0.6], [3, 3, 0.6], 'rojo', { parte: 2 }), BLOQUE([43, 0, 0.6], [3, 3, 0.6], 'rojo', { parte: 2 }),
      BLOQUE([0, 0, 21.5], [45, 0.8, 3.6], 'pancarta', { parte: 3 }),
      ...Array.from({ length: 30 }, (_, i) => PL([-43.5 + i * 3, -0.85, (i & 1) ? 23.3 : 19.7], [1.5, 0.1, 1.8], 'negro')),
      ...Array.from({ length: 30 }, (_, i) => PL([-43.5 + i * 3, 0.85, (i & 1) ? 23.3 : 19.7], [1.5, 0.1, 1.8], 'negro'))] },
  dron: { medio: 7, alto: 7, bajo: 1, mats: { cuerpo: { c: '#e8f1ff', s: '#8f9bb3', l: '#ffffff' }, helice: { c: '#3a4258', plano: true }, ojo: { c: '#22e3ff', plano: true }, pinza: '#7d889e' },
    piezas: [ESF([0, 0, 3.6], [3.2, 2.6, 1.9], 'cuerpo'), ESF([0, -2.3, 3.8], [1.1, 0.5, 0.9], 'ojo', { parte: 2 }), ...[-5, 5].flatMap(x => [CONO([x, 0, 5.2], [1.8, 1.8, 0.14], 'helice', { parte: 3 }), BLOQUE([x * 0.7, 0, 4.6], [1.6, 0.3, 0.3], 'pinza', { parte: 4 })]),
      CONO([-1.2, 0, 1.2], [0.25, 0.25, 1.2], 'pinza', { parte: 4 }), CONO([1.2, 0, 1.2], [0.25, 0.25, 1.2], 'pinza', { parte: 4 })] },
};
// los regalos que dan objeto (los envuelve Microblizz: el contenido puede no coincidir con la caja), en tres colores de papel y de cinta
[['#ff5c8a', '#a8195a', '#ffb3cf', '#ffe14d', '#c9941a'], ['#22b8f0', '#0e6a9a', '#a8ecff', '#ff5c8a', '#a8195a'], ['#8b5cf6', '#4a2a9a', '#c9b3ff', '#5ef27a', '#1f9a4a']].forEach(([c, s, l, cinta, cintaS], i) => {
  COSAS['regalo' + i] = { medio: 4.8, alto: 10, mats: { papel: { c, s, l }, cinta: { c: cinta, s: cintaS }, cintaP: { c: cinta, plano: true } },
    piezas: [BLOQUE([0, 0, 3], [3.4, 3.4, 3], 'papel'), BLOQUE([0, 0, 6.5], [3.8, 3.8, 0.6], 'papel', { parte: 2 }),
      PL([0, -3.44, 3], [0.7, 0.08, 3], 'cintaP'), PL([0, -3.84, 6.5], [0.7, 0.08, 0.6], 'cintaP'),                                   // la cinta, por delante
      BLOQUE([0, 0, 7.14], [0.7, 3.8, 0.06], 'cinta', { parte: 3 }), BLOQUE([0, 0, 7.14], [3.8, 0.7, 0.06], 'cinta', { parte: 3 }),          // y en cruz por encima
      ESF([-1.7, 0, 8.3], [1.7, 0.85, 1.05], 'cinta', { g: [0, 0, 26], parte: 4 }), ESF([1.7, 0, 8.3], [1.7, 0.85, 1.05], 'cinta', { g: [0, 0, -26], parte: 4 }),   // el lazo
      ESF([0, -0.2, 7.8], [0.7, 0.7, 0.7], 'cinta', { parte: 4 })] };
});
// y las cápsulas de gashapon, por si se prefieren a los regalos (Opciones → Objetos): cúpula transparente con una zanahoria de premio
// dentro y media bola de color por abajo. Sin banda negra ni botón: son de máquina de bolas, no las de ningún otro juego.
[['#ff5c8a', '#a8195a', '#ffb3cf'], ['#22b8f0', '#0e6a9a', '#a8ecff'], ['#8b5cf6', '#4a2a9a', '#c9b3ff']].forEach(([c, s, l], i) => {
  COSAS['gashapon' + i] = { medio: 4.4, alto: 9, mats: { base: { c, s, l }, borde: { c: l, s: c }, cristal: { c: '#c6e8fb', s: '#8fbde0', l: '#eaf7ff', brillo: true }, naranja: { c: '#ff8a1f', plano: true }, verde: { c: '#3fae4a', plano: true } },
    piezas: [ESF([0, 0, 4.6], [3.5, 3.5, 3.5], 'cristal'), ESF([0, 0, 3.6], [3.45, 3.45, 2.7], 'base', { parte: 2 }), CONO([0, 0, 4.15], [3.66, 3.66, 0.3], 'borde', { parte: 2 }),
      CONO([0, -3.42, 6.5], [0.1, 1.05, 1.3], 'naranja', { parte: 90 }), PL([0, -3, 8.05], [0.55, 0.1, 0.36], 'verde')] };      // la zanahoria, pegada por delante
});

const BASE_COSA = 3;      // píxeles por unidad del tamaño mayor de una cosa
const FIG_COSAS = {};
function figCosa(id) {
  if (!FIG_COSAS[id]) { const d = COSAS[id]; FIG_COSAS[id] = new Figura({ medio: d.medio, alto: d.alto, bajo: d.bajo === undefined ? 1.2 : d.bajo, angs: d.angs || 1, incl: 20, piezas: d.piezas, mats: d.mats }); }
  return FIG_COSAS[id];
}
// el dibujito de un objeto para el marcador (unos 16 píxeles)
const ICONOS = {};
function iconoDe(id) {
  if (!ICONOS[id]) { const f = figCosa(id), t = f.tira(15 / (2 * f.def.medio)); ICONOS[id] = { c: t.c, w: t.w, h: t.h, ax: t.ax, ay: t.ay }; }
  return ICONOS[id];
}

// ---------- carteles: un tablón con letras de píxeles sobre un poste. Se pinta una vez a tamaño grande y se encoge con la distancia ----------
const BASE_CARTEL = 1.3;  // píxeles por unidad
const CARTELES = new Map();
function cartelDe(lineasTxt, fondo = '#22212c', tinta = '#ffcb3d', marco = '#f4f4f8') {
  const k = lineasTxt.join('|') + fondo + tinta;
  if (CARTELES.has(k)) return CARTELES.get(k);
  const w = Math.max(...lineasTxt.map(l => anchoTextoPx(l))) + 10, hTabla = lineasTxt.length * 10 + 7, poste = 14, [c, x] = lienzo(w, hTabla + poste);
  x.fillStyle = '#4a4e66'; x.fillRect((w >> 1) - 1, hTabla - 1, 3, poste + 1);
  x.fillStyle = '#1c1028'; x.fillRect((w >> 1) - 2, hTabla, 1, poste); x.fillRect((w >> 1) + 2, hTabla, 1, poste);
  x.fillStyle = '#1c1028'; x.fillRect(0, 0, w, hTabla);
  x.fillStyle = marco; x.fillRect(1, 1, w - 2, hTabla - 2);
  x.fillStyle = fondo; x.fillRect(2, 2, w - 4, hTabla - 4);
  lineasTxt.forEach((l, i) => escribePx(x, l, w >> 1, 5 + i * 10, tinta, null, 'centro'));      // los carteles son dibujo del mundo: letra de píxeles
  const s = { c, w, h: hTabla + poste };
  CARTELES.set(k, s);
  return s;
}
