// Fans Of · Facción Animales Locos: sus cartas, unidades, tamaños, roles y datos. Se añaden a los objetos de serie/config.js, que fija el orden de las claves.
'use strict';
Object.assign(CFG.cards, {
    bunny:     { name: 'CrazyBunny',  cost: 5, count: 1, respawn: 12, rarity: 'leader', rar: 'Líder', tag: 'Chaos Jump', desc: 'Salta sobre el grupo enemigo más grande y hace 50 de daño en área cada 8 s. Si cae, vuelve a los 12 s.' },
    squirrel:  { name: 'MadSquirrel', cost: 2, count: 2, rarity: 'common', rar: 'Común', tag: 'Rápidas · x2', desc: 'Salen dos. Rápidas y frágiles: perfectas para distraer a las torres.' },
    beaver:    { name: 'BoomBeaver',  cost: 2, count: 1, rarity: 'common', rar: 'Común', tag: 'Kamikaze', desc: 'Corre a la torre más cercana con dinamita y explota: 180 al edificio. Él no sobrevive, claro.' },
    fox:       { name: 'SlyFox',      cost: 3, count: 1, rarity: 'rare',   rar: 'Rara',  tag: 'Invisible · x3', desc: 'Invisible hasta que ataca. Su primer golpe hace el triple y, si mata, vuelve a desaparecer.' },
    meercat:   { name: 'MeerCat',     cost: 3, count: 1, rarity: 'rare',   rar: 'Rara',  tag: 'Cura aliados', desc: 'Enfermera con alas de ángel. Va detrás de tus tropas y cura a las que tiene delante. Casi no pega.' },
    junkcoon:  { name: 'JunkCoon',    cost: 4, count: 1, rarity: 'rare',   rar: 'Rara',  tag: 'Daño en área', desc: 'Lanza bolsas de basura explosivas desde lejos. Ideal contra grupos de becarios.' },
    mechavaca: { name: 'MechaVaca',   cost: 5, count: 1, rarity: 'epic',   rar: 'Épica', tag: 'Tanque + vaca', desc: 'Una vaca en un mecha rosa. Aguanta muchísimo y, cuando el mecha revienta, la vaca sale y sigue peleando.' },
    // v0.9.15: gashapón de cartas: un mata-sanadores y 3 hechizos por facción
    huron: { name: "HurónNinja", cost: 3, count: 1, rarity: 'epic', rar: 'Épica', tag: 'Mata-sanadores', desc: "Ninja del bosque: salta por encima de la primera línea y cae junto al sanador o al tirador enemigo. A esos les hace el doble de daño.", gacha: true, fac: 'animales' },
    sp_bellotas: { name: "Lluvia de bellotas", cost: 3, count: 1, rarity: 'rare', rar: 'Rara', tag: 'Hechizo · daño', desc: "Una tormenta de bellotas cae sobre la zona: 150 de daño a los enemigos (y un poco a los edificios).", gacha: true, fac: 'animales', spell: { side: "foe", kind: "dmg", r: 80, amt: 150, bld: 0.35, fx: "acorn", col: "#c0742e" } },
    sp_botiquin: { name: "Botiquín del bosque", cost: 3, count: 1, rarity: 'rare', rar: 'Rara', tag: 'Hechizo · cura', desc: "Tiritas, hojas y mucho cariño: cura 170 a tus tropas de la zona.", gacha: true, fac: 'animales', spell: { side: "ally", kind: "heal", r: 90, amt: 170, fx: "leaf", col: "#7be04a" } },
    sp_pulgas: { name: "Pulgas", cost: 3, count: 1, rarity: 'legendary', rar: 'Legendaria', tag: 'Hechizo · loco', desc: "Una plaga de pulgas: los enemigos de la zona se rascan sin parar y no pueden atacar durante 4 s.", gacha: true, fac: 'animales', spell: { side: "foe", kind: "disarm", r: 85, t: 4, fx: "flea", col: "#8b5530", label: "¡QUÉ PICOR!" } },
});
Object.assign(CFG.units, {
    squirrel: { hp: 150, dmg: 15, cd: 0.9, range: 8,   speed: 52, r: 12, sight: 120 },
    fox:      { hp: 200, dmg: 18, cd: 1.2, range: 8,   speed: 42, r: 14, sight: 130, stealth: 8, surprise: 3, restealth: 3 },
    bunny:    { hp: 500, dmg: 25, cd: 1.1, range: 10,  speed: 36, r: 20, sight: 150, jumpCd: 8, jumpDmg: 50, jumpR: 72, jumpRange: 210 },
    beaver:   { hp: 100, dmg: 180, cd: 1, range: 6,  speed: 58, r: 12, sight: 140, buildings: true, kamikaze: true, splash: 50, splashDmg: 60 },
    meercat:  { hp: 190, dmg: 8,  cd: 1.0, range: 8,   speed: 32, r: 12, sight: 110, healer: true, heal: 14, healCd: 1.7, healR: 95 },
    junkcoon: { hp: 240, dmg: 26, cd: 1.7, range: 115, speed: 36, r: 14, sight: 150, ranged: 'trash', splash: 42 },
    mechavaca:{ hp: 950, dmg: 24, cd: 1.3, range: 10,  speed: 26, r: 22, sight: 140, eject: 'vaca' },
    vaca:     { hp: 160, dmg: 12, cd: 0.9, range: 8,   speed: 46, r: 12, sight: 120 },
    // v0.9.15: mata-sanadores (saltan por encima de la primera línea a por el sanador o el tirador)
    huron: { hp: 230, dmg: 24, cd: 0.9, range: 8, speed: 50, r: 13, sight: 140, leap: { range: 250, cd: 9, mult: 2 } },
});
Object.assign(TYPES, {
  squirrel: { top: 40, foot: '#7a3414' },
  fox:      { top: 44, foot: '#2b1622' },
  bunny:    { top: 66, foot: '#efe8ff' },
  beaver:   { top: 40, foot: '#5a3a20', spark: [3.2, -23] },
  meercat:  { top: 44, foot: '#b48a58' },
  junkcoon: { top: 44, foot: '#3b3d47' },
  mechavaca:{ top: 54, foot: '#b84f86' },
  vaca:     { top: 34, foot: '#efe8ff' },
  // v0.9.15: mata-sanadores
  huron: { top: 42, foot: "#5a3a20" },
});
Object.assign(ROLES, {
  bunny: 'tank', squirrel: 'swarm', beaver: 'buster', fox: 'assassin', meercat: 'support', junkcoon: 'ranged', mechavaca: 'tank',
  huron: 'assassin', sp_bellotas: 'spell', sp_botiquin: 'spell', sp_pulgas: 'spell',
});
Object.assign(FACTIONS, {
  animales: { name: 'Animales Locos', pname: 'Rabia', leader: 'bunny', units: ['squirrel', 'beaver', 'fox', 'meercat', 'junkcoon', 'mechavaca'], skin: 'p', base: 'LA MADRIGUERA', passive: 'RABIA', pkey: 'rage', passiveText: 'Cada animal pega un 10 % más por cada aliado que tenga cerca, hasta +50 %. Cuanto más juntos, más locos.', banner: 'Tus animales pegan +10 % por cada aliado cerca, hasta +50 %', trio: ['squirrel', 'bunny', 'fox'], kind: 'player', end: 'tu Madriguera', icon: 'flame', trioH: [82, 158, 100] },
});
