// Fans Of · Facción Phony (solo rival): sus cartas, unidades, tamaños, roles y datos. Se añaden a los objetos de serie/config.js, que fija el orden de las claves.
'use strict';
Object.assign(CFG.enemyCards, {
    // Phony (v0.9.13)
    descargabot: { name: 'Descarga99', cost: 2, count: 3 },
    licenciabot: { name: 'LicenciaBot', cost: 3, count: 1 },
    plusbot:     { name: 'PayPlus', cost: 3, count: 1 },
    cobradlc:    { name: 'CobraDLC', cost: 4, count: 1 },
    servidorbot: { name: 'Servidor Caído', cost: 5, count: 1 },
    remasterbot: { name: 'Remaster 70 €', cost: 5, count: 1 },
    sp_cobro: { name: "Cobro automático", cost: 3, count: 1, spell: { side: "foe", kind: "dmg", r: 80, amt: 150, bld: 0.3, steal: 0.5, fx: "card9", col: "#ffcb3d", label: "-9,99 €" } },
});
Object.assign(CFG.units, {
    // Phony (v0.9.13)
    descargabot: { hp: 110, dmg: 12, cd: 0.9, range: 6,   speed: 50, r: 11, sight: 110 },
    licenciabot: { hp: 230, dmg: 22, cd: 1.2, range: 105, speed: 36, r: 13, sight: 150, ranged: 'contract', life: 22 },
    plusbot:     { hp: 210, dmg: 8,  cd: 1.0, range: 8,   speed: 30, r: 13, sight: 110, healer: true, heal: 15, healCd: 1.8, healR: 95 },
    cobradlc:    { hp: 520, dmg: 40, cd: 1.3, range: 8,   speed: 40, r: 16, sight: 140, buildings: true, steal: 0.4 },
    servidorbot: { hp: 900, dmg: 24, cd: 1.3, range: 10,  speed: 26, r: 21, sight: 140, pulse: { cd: 9, r: 75, stun: 1, kind: 'daze', text: '¡SIN CONEXIÓN!', color: 'rgba(120,170,255,.95)', tc: '#a9c8ff', sfx: 'womp' } },
    remasterbot: { hp: 700, dmg: 30, cd: 1.3, range: 10,  speed: 30, r: 20, sight: 140, remaster: 0.5 },
});
Object.assign(TYPES, {
  descargabot: { top: 40, foot: '#94a3b8' }, licenciabot: { top: 45, foot: '#172554' }, plusbot: { top: 40, foot: null, hover: true, jet: true },
  cobradlc:    { top: 50, foot: '#334155' }, servidorbot: { top: 64, foot: '#111827' }, remasterbot: { top: 60, foot: '#4b5563' },
});
Object.assign(ROLES, {
  descargabot: 'swarm', licenciabot: 'ranged', plusbot: 'support', cobradlc: 'buster', servidorbot: 'tank', remasterbot: 'tank',
  sp_cobro: 'spell',
});
// v0.9.13: Phony y su PayStation, la empresa rival de la campaña 2 (quitó los discos para ahorrar millones)
FACTIONS.phony = { name: 'Phony', pname: 'Suscripción', leader: null, units: ['descargabot', 'licenciabot', 'plusbot', 'cobradlc', 'servidorbot', 'remasterbot'], skin: 'y', base: 'PAYSTATION', passive: 'SUSCRIPCIÓN OBLIGATORIA', kind: 'enemy', end: 'la Sede de Phony' };
