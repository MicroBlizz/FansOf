// Fans Of · Facción Phony (solo rival): sus cartas, tamaños, roles y datos (las cifras de sus unidades las pone cada juego). Se añaden a los objetos de serie/config.js, que fija el orden de las claves.
'use strict';
Object.assign(CFG.enemyCards, {
    // Phony (v0.9.13)
    descargabot: { name: 'Descarga99' },
    licenciabot: { name: 'LicenciaBot' },
    plusbot: { name: 'PayPlus' },
    cobradlc: { name: 'CobraDLC' },
    servidorbot: { name: 'Servidor Caído' },
    remasterbot: { name: 'Remaster 70 €' },
    sp_cobro: { name: "Cobro automático" },
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
