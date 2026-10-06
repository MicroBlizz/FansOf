// Fans Of · Facción Cultura Pop: sus cartas, unidades, tamaños, roles y datos. Se añaden a los objetos de serie/config.js, que fija el orden de las claves.
'use strict';
Object.assign(CFG.cards, {
    // Cultura Pop (v0.9.13)
    directora:   { name: 'LaDirectora',  cost: 5, count: 1, respawn: 12, rarity: 'leader', rar: 'Líder', tag: '¡Acción!', desc: 'Dirige la batalla con su megáfono. Cada 8 s grita ¡ACCIÓN! y sus aliados cercanos atacan un 40 % más rápido y corren más durante 4 s. Si cae, vuelve a los 12 s.' },
    extras:      { name: 'Extras',       cost: 2, count: 4, rarity: 'common', rar: 'Común', tag: 'Salen 4', desc: 'Cuatro extras con disfraz de cartón. Cobran poco y se caen enseguida, pero distraen a las torres.' },
    doble:       { name: 'DobleDeAcción', cost: 3, count: 1, rarity: 'common', rar: 'Común', tag: 'Acrobacias', desc: 'El doble que rueda las escenas peligrosas. Cada 5 s da un salto acrobático hasta su objetivo.' },
    detective:   { name: 'Detective',    cost: 3, count: 1, rarity: 'rare',   rar: 'Rara',  tag: 'Marca al enemigo', desc: 'Encuentra el punto débil: cada disparo marca al enemigo 4 s y todo tu equipo le hace un 25 % más de daño.' },
    heroe:       { name: 'HéroeDeSaldo', cost: 4, count: 1, rarity: 'rare',   rar: 'Rara',  tag: 'Vuela · blindado', desc: 'Superhéroe de película barata, con capa de cortina. Vuela y recibe un 30 % menos de daño.' },
    spoiler:     { name: 'Spoiler',      cost: 4, count: 1, rarity: 'rare',   rar: 'Rara',  tag: 'Aturde', desc: 'Grita el final de la película cada 7 s: los enemigos cercanos se quedan en shock 1,3 s. Entre grito y grito, tira periódicos.' },
    kaiju:       { name: 'KaijuDeGoma',  cost: 5, count: 1, rarity: 'epic',   rar: 'Épica', tag: 'Rompe torres · pisotón', desc: 'Un monstruo de película (es un actor con un disfraz de goma). Va a por los edificios y cada pisotón da también a los enemigos de alrededor.' },
    paparazzi: { name: "Paparazzi", cost: 3, count: 1, rarity: 'epic', rar: 'Épica', tag: 'Mata-sanadores', desc: "Salta a por el sanador o el tirador enemigo y lo deslumbra con el flash (1 s sin moverse). A esos les hace el doble de daño.", gacha: true, fac: 'pop' },
    sp_taquilla: { name: "Explosión de taquilla", cost: 4, count: 1, rarity: 'rare', rar: 'Rara', tag: 'Hechizo · daño', desc: "Una explosión de 200 millones de presupuesto: 170 de daño en una zona grande.", gacha: true, fac: 'pop', spell: { side: "foe", kind: "dmg", r: 95, amt: 170, bld: 0.35, fx: "boom", col: "#ff7a1a" } },
    sp_maquillaje: { name: "Maquillaje de rodaje", cost: 3, count: 1, rarity: 'rare', rar: 'Rara', tag: 'Hechizo · cura', desc: "Un retoque rápido antes de la toma: cura 160 a tus tropas de la zona.", gacha: true, fac: 'pop', spell: { side: "ally", kind: "heal", r: 90, amt: 160, fx: "brush", col: "#ff9ab8" } },
    sp_remake: { name: "Remake", cost: 4, count: 1, rarity: 'legendary', rar: 'Legendaria', tag: 'Hechizo · loco', desc: "El enemigo más fuerte de la zona sale en versión remake: más pequeño, con un 35 % menos de vida y pegando menos durante 10 s. Y más caro.", gacha: true, fac: 'pop', spell: { side: "foe", kind: "remake", r: 90, t: 10, f: 0.6, cut: 0.35, fx: "clap", col: "#ff9ab8", label: "REMAKE" } },
});
Object.assign(CFG.units, {
    // Cultura Pop (v0.9.13)
    directora:   { hp: 520, dmg: 22, cd: 1.1, range: 95,  speed: 34, r: 18, sight: 150, ranged: 'wave', action: { cd: 8, r: 110, t: 4 } },
    extras:      { hp: 70,  dmg: 9,  cd: 0.7, range: 6,   speed: 54, r: 9,  sight: 110 },
    doble:       { hp: 300, dmg: 22, cd: 0.8, range: 8,   speed: 46, r: 12, sight: 150, blink: { cd: 5, dist: 80, col: '#ffcb3d', ring: 'rgba(255,203,61,.9)', txt: '¡ACROBACIA!' } },
    detective:   { hp: 190, dmg: 18, cd: 1.1, range: 110, speed: 36, r: 12, sight: 150, ranged: 'bullet', mark: { t: 4, f: 0.25 } },
    heroe:       { hp: 520, dmg: 26, cd: 1.0, range: 8,   speed: 44, r: 14, sight: 140, armor: 0.3 },
    spoiler:     { hp: 230, dmg: 16, cd: 1.1, range: 80,  speed: 38, r: 13, sight: 140, ranged: 'paper', pulse: { cd: 7, r: 85, stun: 1.3, kind: 'daze', text: '¡SPOILER!', color: 'rgba(255,240,180,.95)', tc: '#ffe9a8', sfx: 'wail' } },
    kaiju:       { hp: 1100, dmg: 40, cd: 1.5, range: 12, speed: 25, r: 24, sight: 140, buildings: true, cleave: { r: 44, f: 0.6 } },
    paparazzi: { hp: 220, dmg: 22, cd: 1.0, range: 8, speed: 48, r: 13, sight: 140, flash: 1, leap: { range: 250, cd: 9, mult: 2 } },
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
