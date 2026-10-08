// Fans Of · Facción Animales Locos: sus cartas, tamaños, roles y datos (las cifras de sus unidades las pone cada juego). Se añaden a los objetos de serie/config.js, que fija el orden de las claves.
'use strict';
Object.assign(CFG.cards, {
    bunny: { name: 'CrazyBunny', rarity: 'leader', rar: 'Líder', tag: 'Chaos Jump', desc: 'Salta sobre el grupo enemigo más grande y hace 50 de daño en área cada 8 s. Si cae, vuelve a los 12 s.' },
    squirrel: { name: 'MadSquirrel', rarity: 'common', rar: 'Poco común', tag: 'Rápidas · x2', desc: 'Salen dos. Rápidas y frágiles: perfectas para distraer a las torres.' },
    beaver: { name: 'BoomBeaver', rarity: 'common', rar: 'Poco común', tag: 'Kamikaze', desc: 'Corre a la torre más cercana con dinamita y explota: 180 al edificio. Él no sobrevive, claro.' },
    fox: { name: 'SlyFox', rarity: 'rare', rar: 'Rara', tag: 'Invisible · x3', desc: 'Invisible hasta que ataca. Su primer golpe hace el triple y, si mata, vuelve a desaparecer.' },
    meercat: { name: 'MeerCat', rarity: 'rare', rar: 'Rara', tag: 'Cura aliados', desc: 'Enfermera con alas de ángel. Va detrás de tus tropas y cura a las que tiene delante. Casi no pega.' },
    junkcoon: { name: 'JunkCoon', rarity: 'rare', rar: 'Rara', tag: 'Daño en área', desc: 'Lanza bolsas de basura explosivas desde lejos. Ideal contra grupos de becarios.' },
    mechavaca: { name: 'MechaVaca', rarity: 'epic', rar: 'Épica', tag: 'Tanque + vaca', desc: 'Una vaca en un mecha rosa. Aguanta muchísimo y, cuando el mecha revienta, la vaca sale y sigue peleando.' },
    // v0.9.15: gashapón de cartas: un mata-sanadores y 3 hechizos por facción
    huron: { name: "HurónNinja", rarity: 'epic', rar: 'Épica', tag: 'Mata-sanadores', desc: "Ninja del bosque: salta por encima de la primera línea y cae junto al sanador o al tirador enemigo. A esos les hace el doble de daño.", gacha: true, fac: 'animales' },
    sp_bellotas: { name: "Lluvia de bellotas", rarity: 'rare', rar: 'Rara', tag: 'Hechizo · daño', desc: "Una tormenta de bellotas cae sobre la zona: 150 de daño a los enemigos (y un poco a los edificios).", gacha: true, fac: 'animales' },
    sp_botiquin: { name: "Botiquín del bosque", rarity: 'rare', rar: 'Rara', tag: 'Hechizo · cura', desc: "Tiritas, hojas y mucho cariño: cura 170 a tus tropas de la zona.", gacha: true, fac: 'animales' },
    sp_pulgas: { name: "Pulgas", rarity: 'legendary', rar: 'Legendaria', tag: 'Hechizo · loco', desc: "Una plaga de pulgas: los enemigos de la zona se rascan sin parar y no pueden atacar durante 4 s.", gacha: true, fac: 'animales' },
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
