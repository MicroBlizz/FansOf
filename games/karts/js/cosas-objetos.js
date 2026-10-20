// Fans of Karts · LOS MODELOS DE LOS OBJETOS NUEVOS (objetos-2.js): el martillo de baneo, la bellota de MadSquirrel, la ventana de spam,
// el router del lag, el ticket de reembolso, el bot de emparejamiento, el tren del hype, el móvil del influencer y la tarjeta de la
// microtransacción. La MechaVaca que cae es la del suelo (vacaSuelo, bichos.js).
'use strict';

Object.assign(COSAS, {
  martillo: { medio: 6, alto: 11, angs: 8, mats: { mango: { c: '#8b5530', s: '#4a2a18', l: '#c98a4b' }, cabeza: { c: '#e63946', s: '#8a1020', l: '#ff8fa0', brillo: true }, letra: { c: '#ffffff', plano: true }, cinta: '#ffcb3d' },
    piezas: [CONO([0, 0, 4.2], [0.6, 0.6, 4.2], 'mango', { g: [0, 0, 0] }), CAJA([0, 0, 1.6], [0.75, 0.75, 0.7], 'cinta', { parte: 2 }), CAJA([0, 0, 9], [4.6, 2, 2], 'cabeza', { parte: 3 }),
      PL([0, -2.06, 9], [2.6, 0.06, 0.9], 'letra')] },
  bellota: { medio: 3, alto: 7, angs: 8, mats: { fruto: { c: '#c98a4b', s: '#8b5530', l: '#e8b07a' }, gorro: { c: '#6e4628', s: '#3b2410', l: '#a0703a' }, rabo: '#3b2410' },
    piezas: [ESF([0, 0, 2.9], [2.3, 2.3, 2.8], 'fruto'), ESF([0, 0, 4.8], [2.6, 2.6, 1.3], 'gorro', { parte: 2 }), CONO([0, 0, 6.4], [0.3, 0.3, 0.6], 'rabo', { parte: 3 })] },
  spam: { medio: 5.4, alto: 9, angs: 8, mats: { marco: { c: '#f4f4f8', s: '#a8b0c8', l: '#ffffff' }, barra: { c: '#3a7de0', plano: true }, aviso: { c: '#ff3348', s: '#a01030', l: '#ff9aa6' }, texto: { c: '#2b2d3a', plano: true } },
    piezas: [CAJA([0, 0, 4.6], [4.6, 0.5, 3.6], 'marco'), PL([0, -0.56, 7.4], [4.6, 0.06, 0.8], 'barra'), ...[5.6, 4.4, 3.2].map(z => PL([-0.6, -0.56, z], [3.2, 0.06, 0.25], 'texto')),
      ESF([4.2, -0.4, 8.2], [1.4, 1, 1.4], 'aviso', { parte: 2 })] },
  lag: { medio: 5, alto: 9, angs: 8, mats: { caja: { c: '#2b2d3a', s: '#16151c', l: '#4a4e66' }, antena: '#4a4e66', luz: { c: '#ff3348', plano: true }, ok: { c: '#5ef27a', plano: true } },
    piezas: [CAJA([0, 0, 1.6], [4, 2.4, 1.2], 'caja'), ...[-2.6, 2.6].map(x => CONO([x, 1.4, 5.2], [0.35, 0.3, 3], 'antena', { g: [0, 0, x > 0 ? -12 : 12], parte: 2 })),
      ...[-2, -0.7, 0.6].map((x, i) => PL([x, -2.46, 1.8], [0.45, 0.06, 0.35], i === 2 ? 'luz' : 'ok'))] },
  reembolso: { medio: 4.6, alto: 9, angs: 8, mats: { papel: { c: '#fff6ea', s: '#d8c8b0', l: '#ffffff' }, tinta: { c: '#2b2d3a', plano: true }, verde: { c: '#5ef27a', s: '#2f8a1f', l: '#c8ffd0' } },
    piezas: [CAJA([0, 0, 4.6], [3, 0.3, 4.2], 'papel'), ...[7, 5.8, 4.6, 3.4].map((z, i) => PL([i === 3 ? 0.8 : -0.4, -0.34, z], [i === 3 ? 1.6 : 2.2, 0.06, 0.22], 'tinta')),
      CONO([0, -0.5, 1.6], [1.6, 1.6, 0.35], 'verde', { g: EJE_Y, parte: 2 })] },
  botmini: { medio: 3.6, alto: 7, angs: 8, mats: { cuerpo: { c: '#c3cbe0', s: '#6a7390', l: '#ffffff' }, ojo: { c: '#22e3ff', plano: true }, rueda: '#2b2d3a', antena: '#ff3348' },
    piezas: [CAJA([0, 0, 3.4], [2.4, 2, 2], 'cuerpo'), ...[-1, 1].map(s => CONO([s * 2.6, 0, 1.2], [1.1, 1.1, 0.5], 'rueda', { g: EJE_X, parte: 2 })), PL([-0.9, -2.06, 3.8], [0.5, 0.06, 0.5], 'ojo'),
      PL([0.9, -2.06, 3.8], [0.5, 0.06, 0.5], 'ojo'), CONO([0, 0, 6.2], [0.2, 0.2, 0.9], 'antena', { parte: 3 }), ESF([0, 0, 7.1], [0.5, 0.5, 0.5], 'antena', { parte: 3 })] },
  tren: { medio: 6, alto: 10, angs: 8, mats: { locomotora: { c: '#ff3df0', s: '#9b1a90', l: '#ffa8f6' }, negro: '#2b2d3a', oro: { c: '#ffcb3d', s: '#c9841a', l: '#fff3a0', brillo: true }, cristal: { c: '#9fe3ff', plano: true } },
    piezas: [CAJA([0, 0.6, 3.6], [2.6, 3.6, 2], 'locomotora'), CAJA([0, -2.2, 6.4], [2.4, 1.4, 1.6], 'locomotora', { parte: 2 }), CONO([0, 3.2, 7.2], [0.9, 1.2, 1.6], 'negro', { parte: 3 }),
      ...[-1, 1].flatMap(s => [CONO([s * 2.8, 2.4, 1.4], [1.3, 1.3, 0.5], 'negro', { g: EJE_X, parte: 4 }), CONO([s * 2.8, -1.6, 1.4], [1.3, 1.3, 0.5], 'negro', { g: EJE_X, parte: 4 })]),
      CAJA([0, 4.3, 2.4], [2.8, 0.4, 0.5], 'oro', { parte: 5 }), PL([0, -3.66, 6.6], [1.6, 0.06, 0.8], 'cristal')] },
  influencer: { medio: 4.6, alto: 10, angs: 8, mats: { movil: { c: '#2b2d3a', s: '#16151c', l: '#4a4e66' }, pantalla: { c: '#ff5c8a', plano: true }, aro: { c: '#fff3a0', s: '#ffcb3d', l: '#ffffff', brillo: true }, palo: '#9aa5ba' },
    piezas: [CONO([0, 0, 2.6], [0.3, 0.3, 2.6], 'palo'), CONO([0, 0, 7.2], [3.6, 3.6, 0.45], 'aro', { g: EJE_Y, parte: 2 }), CAJA([0, -0.4, 7.2], [1.4, 0.3, 2.4], 'movil', { parte: 3 }),
      PL([0, -0.75, 7.3], [1.1, 0.06, 2], 'pantalla')] },
  tarjeta: { medio: 5, alto: 8, angs: 8, mats: { plastico: { c: '#ffcb3d', s: '#c9841a', l: '#fff3a0', brillo: true }, banda: { c: '#2b2d3a', plano: true }, chip: { c: '#c3cbe0', plano: true }, logo: { c: '#e63946', plano: true } },
    piezas: [CAJA([0, 0, 4.2], [4.4, 0.3, 2.8], 'plastico', { g: [0, 0, 12] }), PL([0, -0.34, 5.6], [4.4, 0.06, 0.55], 'banda', { g: [0, 0, 12] }), PL([-2.4, -0.34, 3.8], [0.8, 0.06, 0.6], 'chip', { g: [0, 0, 12] }),
      PL([2.6, -0.34, 2.6], [0.9, 0.06, 0.5], 'logo', { g: [0, 0, 12] })] },
});
