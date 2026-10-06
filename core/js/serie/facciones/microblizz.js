// Fans Of · Facción Microblizz (solo rival): sus cartas, tamaños, roles y datos (las cifras de sus unidades las pone cada juego). Se añaden a los objetos de serie/config.js, que fija el orden de las claves.
'use strict';
Object.assign(CFG.enemyCards, {
    becario: { name: 'Becario' },
    starbot: { name: 'StarBot' },
    fallen: { name: 'FallenHero' },
    cajabotin: { name: 'CajaBotín' },
    soportebot: { name: 'SoporteBot' },
    parchebot: { name: 'Parche Día 1' },
    // v0.9.15: hechizos de las empresas (los usa la CPU)
    sp_despido: { name: "Despido fulminante" },
});
Object.assign(TYPES, {
  becario:  { top: 34, foot: '#5b6578' },
  starbot:  { top: 44, foot: null, hover: true, jet: true },
  fallen:   { top: 52, foot: '#5b6787' },
  cajabotin:  { top: 40, foot: '#5b6578' },
  soportebot: { top: 46, foot: null, hover: true, jet: true },
  parchebot:  { top: 56, foot: '#5b6578' },
});
Object.assign(ROLES, {
  becario: 'swarm', starbot: 'ranged', fallen: 'buster', cajabotin: 'tank', soportebot: 'support', parchebot: 'tank',
  sp_despido: 'spell',
});
// Microblizz: solo rival (no tiene líder: su jefe es SurvivalBot, encima de la sede)
FACTIONS.microblizz = { name: 'Microblizz', pname: 'Despidos rentables', leader: null, units: ['becario', 'starbot', 'fallen', 'cajabotin', 'soportebot', 'parchebot'], skin: 'e', base: 'SURVIVALBOT', passive: 'DESPIDOS RENTABLES', kind: 'enemy', end: 'la Sede de Microblizz' };
