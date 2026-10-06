// Fans Of · Facción Microblizz (solo rival): sus cartas, unidades, tamaños, roles y datos. Se añaden a los objetos de serie/config.js, que fija el orden de las claves.
'use strict';
Object.assign(CFG.enemyCards, {
    becario: { name: 'Becario',    cost: 2, count: 2 },
    starbot: { name: 'StarBot',    cost: 3, count: 1 },
    fallen:  { name: 'FallenHero', cost: 5, count: 1 },
    cajabotin:  { name: 'CajaBotín', cost: 3, count: 1 },
    soportebot: { name: 'SoporteBot', cost: 3, count: 1 },
    parchebot:  { name: 'Parche Día 1', cost: 4, count: 1 },
    // v0.9.15: hechizos de las empresas (los usa la CPU)
    sp_despido: { name: "Despido fulminante", cost: 3, count: 1, spell: { side: "foe", kind: "dmg", r: 70, amt: 170, bld: 0.3, fx: "letter", col: "#fff6ea", label: "¡DESPEDIDO!" } },
});
Object.assign(CFG.units, {
    becario:  { hp: 130, dmg: 13, cd: 1.0, range: 8,   speed: 44, r: 12, sight: 120 },
    starbot:  { hp: 170, dmg: 18, cd: 1.3, range: 105, speed: 36, r: 14, sight: 150, ranged: 'plasma' },
    fallen:   { hp: 800, dmg: 34, cd: 1.6, range: 10,  speed: 26, r: 21, sight: 170, buildings: true },
    cajabotin:  { hp: 320, dmg: 10, cd: 1.0, range: 8,  speed: 30, r: 15, sight: 120, eject: 'becario', ejectN: 3, ejectTxt: '¡BOTÍN!' },
    soportebot: { hp: 200, dmg: 8,  cd: 1.0, range: 8,  speed: 30, r: 13, sight: 110, healer: true, heal: 14, healCd: 1.8, healR: 95 },
    parchebot:  { hp: 760, dmg: 22, cd: 1.3, range: 10, speed: 28, r: 20, sight: 140, armor: 0.3 },
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
