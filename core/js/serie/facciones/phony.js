// Fans Of · Facción Phony (solo rival): sus cartas, tamaños, roles y datos (las cifras de sus unidades las pone cada juego). Se añaden a los objetos de serie/config.js, que fija el orden de las claves.
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
