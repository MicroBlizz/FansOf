// Fans Of · Facción Cultura Pop: sus cartas, tamaños, roles y datos (las cifras de sus unidades las pone cada juego). Se añaden a los objetos de serie/config.js, que fija el orden de las claves.
'use strict';
Object.assign(CFG.cards, {
    // Cultura Pop (v0.9.13)
    directora: { name: 'LaDirectora', rarity: 'leader', rar: 'Líder', tag: '¡Acción!', desc: 'Dirige la batalla con su megáfono. Cada 8 s grita ¡ACCIÓN! y sus aliados cercanos atacan un 40 % más rápido y corren más durante 4 s. Si cae, vuelve a los 12 s.' },
    extras: { name: 'Extras', rarity: 'common', rar: 'Poco común', tag: 'Salen 4', desc: 'Cuatro extras con disfraz de cartón. Cobran poco y se caen enseguida, pero distraen a las torres.' },
    doble: { name: 'DobleDeAcción', rarity: 'common', rar: 'Poco común', tag: 'Acrobacias', desc: 'El doble que rueda las escenas peligrosas. Cada 5 s da un salto acrobático hasta su objetivo.' },
    detective: { name: 'Detective', rarity: 'rare', rar: 'Rara', tag: 'Marca al enemigo', desc: 'Encuentra el punto débil: cada disparo marca al enemigo 4 s y todo tu equipo le hace un 25 % más de daño.' },
    heroe: { name: 'HéroeDeSaldo', rarity: 'rare', rar: 'Rara', tag: 'Vuela · blindado', desc: 'Superhéroe de película barata, con capa de cortina. Vuela y recibe un 30 % menos de daño.' },
    spoiler: { name: 'Spoiler', rarity: 'rare', rar: 'Rara', tag: 'Aturde', desc: 'Grita el final de la película cada 7 s: los enemigos cercanos se quedan en shock 1,3 s. Entre grito y grito, tira periódicos.' },
    kaiju: { name: 'KaijuDeGoma', rarity: 'epic', rar: 'Épica', tag: 'Rompe torres · pisotón', desc: 'Un monstruo de película (es un actor con un disfraz de goma). Va a por los edificios y cada pisotón da también a los enemigos de alrededor.' },
    paparazzi: { name: "Paparazzi", rarity: 'epic', rar: 'Épica', tag: 'Mata-sanadores', desc: "Salta a por el sanador o el tirador enemigo y lo deslumbra con el flash (1 s sin moverse). A esos les hace el doble de daño.", gacha: true, fac: 'pop' },
    sp_taquilla: { name: "Explosión de taquilla", rarity: 'rare', rar: 'Rara', tag: 'Hechizo · daño', desc: "Una explosión de 200 millones de presupuesto: 170 de daño en una zona grande.", gacha: true, fac: 'pop' },
    sp_maquillaje: { name: "Maquillaje de rodaje", rarity: 'rare', rar: 'Rara', tag: 'Hechizo · cura', desc: "Un retoque rápido antes de la toma: cura 160 a tus tropas de la zona.", gacha: true, fac: 'pop' },
    sp_remake: { name: "Remake", rarity: 'legendary', rar: 'Legendaria', tag: 'Hechizo · loco', desc: "El enemigo más fuerte de la zona sale en versión remake: más pequeño, con un 35 % menos de vida y pegando menos durante 10 s. Y más caro.", gacha: true, fac: 'pop' },
});
Object.assign(TYPES, {
  directora:   { top: 58, foot: '#3b2a1e' }, extras: { top: 32, foot: '#57534e' }, doble: { top: 42, foot: '#1f2937' }, detective: { top: 48, foot: '#3f2d20' },
  heroe:       { top: 50, foot: null, hover: true }, spoiler: { top: 46, foot: '#14532d' }, kaiju: { top: 64, foot: null },
  paparazzi: { top: 46, foot: "#1e3a8a" },
});
Object.assign(ROLES, {
  directora: 'support', extras: 'swarm', doble: 'assassin', detective: 'ranged', heroe: 'tank', spoiler: 'control',
  kaiju: 'buster', paparazzi: 'assassin', sp_taquilla: 'spell', sp_maquillaje: 'spell', sp_remake: 'spell',
});
Object.assign(FACTIONS, {
  pop:       { name: 'Cultura Pop', los: 'los de Cultura Pop', corr: 'Cultura Pop corrompida', pname: 'Secuela', leader: 'directora', units: ['extras', 'doble', 'detective', 'heroe', 'spoiler', 'kaiju'], skin: 'k', base: 'EL ESTUDIO', passive: 'SECUELA', pkey: 'sequel', passiveText: 'Toda buena película tiene secuela: cuando una de tus unidades cae, 3 de cada 10 veces vuelve en versión «2», más pequeña y con la mitad de vida.', banner: '3 de cada 10 unidades que caen vuelven en versión «2»', trio: ['heroe', 'directora', 'kaiju'], kind: 'pop', end: 'tu Estudio', icon: 'clap', trioH: [100, 150, 132] },
});
