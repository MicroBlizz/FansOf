// Fans Of · Facción No-Muertos: sus cartas, tamaños, roles y datos (las cifras de sus unidades las pone cada juego). Se añaden a los objetos de serie/config.js, que fija el orden de las claves.
'use strict';
Object.assign(CFG.cards, {
    // No-Muertos
    necrolord: { name: 'NecroLord', rarity: 'leader', rar: 'Líder', tag: 'Invoca', desc: 'Lanza rayos de sombra y cada 8 s levanta 2 esqueletos a su lado. Si cae del todo, vuelve a los 12 s.' },
    skeleton: { name: 'SkeletonCrew', rarity: 'basic', rar: 'Común', tag: 'Salen 4', desc: 'Cuatro esqueletos piratas, frágiles y muy rápidos. Rodean al enemigo y distraen a las torres.' },
    zombie: { name: 'CrunchZombie', rarity: 'common', rar: 'Poco común', tag: 'Lentos · x3', desc: 'Tres programadores convertidos en zombis por trabajar meses sin parar. Lentos pero duros, y no se quejan.' },
    ghostmage: { name: 'GhostMage', rarity: 'rare', rar: 'Rara', tag: 'A distancia', desc: 'Mago fantasma que lanza rayos de escarcha desde lejos. Cada impacto frena al enemigo.' },
    banshee: { name: 'Banshee', rarity: 'rare', rar: 'Rara', tag: 'Grito aturde', desc: 'Grita cada 7 s y aturde a los enemigos cercanos. Entre grito y grito, lanza ondas que golpean en área.' },
    skullknight: { name: 'SkullKnight', rarity: 'rare', rar: 'Rara', tag: 'Ralentiza', desc: 'Caballero esqueleto con espada rúnica de hielo: cada golpe frena al enemigo.' },
    stitchbrute: { name: 'StitchBrute', rarity: 'epic', rar: 'Épica', tag: 'Tanque tóxico', desc: 'Una mole cosida a trozos que va directa a por las torres. Aguanta muchísimo y, al morir, revienta en una nube tóxica.' },
    sombra: { name: "Sombra", rarity: 'epic', rar: 'Épica', tag: 'Mata-sanadores', desc: "Una sombra sin cara: se desliza por encima de la pelea y cae junto al sanador o al tirador enemigo. A esos les hace el doble de daño.", gacha: true, fac: 'nomuertos' },
    sp_lapidas: { name: "Lluvia de lápidas", rarity: 'rare', rar: 'Rara', tag: 'Hechizo · daño', desc: "Caen lápidas del cielo: 170 de daño y un pequeño aturdimiento a los enemigos de la zona.", gacha: true, fac: 'nomuertos' },
    sp_formol: { name: "Poción de formol", rarity: 'rare', rar: 'Rara', tag: 'Hechizo · cura', desc: "Conserva a tus tropas como nuevas: cura 150 a las de la zona.", gacha: true, fac: 'nomuertos' },
    sp_eternas: { name: "Horas extra eternas", rarity: 'legendary', rar: 'Legendaria', tag: 'Hechizo · loco', desc: "Los enemigos de la zona se arrastran como zombis: andan y atacan a la mitad de velocidad durante 6 s.", gacha: true, fac: 'nomuertos' },
    sp_crunch: { name: "Crunch", rarity: 'epic', rar: 'Épica', tag: 'Hechizo · loco', desc: "Semana de crunch: tus tropas de la zona atacan el doble de rápido durante 6 s… pero se van quemando (pierden un 4 % de vida por segundo).", gacha: true, fac: 'nomuertos' },
});
Object.assign(TYPES, {
  necrolord:   { top: 64, foot: '#2a1840' },
  skeleton:    { top: 28, foot: '#efeadf' },
  zombie:      { top: 36, foot: '#5b4a3a' },
  ghostmage:   { top: 52, foot: null, hover: true },
  banshee:     { top: 46, foot: null, hover: true },
  skullknight: { top: 56, foot: '#2f3a5c' },
  stitchbrute: { top: 52, foot: '#6f8a62' },
  sombra: { top: 46, foot: null, hover: true },
});
Object.assign(ROLES, {
  necrolord: 'support', skeleton: 'swarm', zombie: 'swarm', ghostmage: 'ranged', banshee: 'control', skullknight: 'tank',
  stitchbrute: 'tank', sombra: 'assassin', sp_lapidas: 'spell', sp_formol: 'spell', sp_eternas: 'spell', sp_crunch: 'spell',
});
Object.assign(FACTIONS, {
  nomuertos: { name: 'No-Muertos', pname: 'Renacer', leader: 'necrolord', units: ['skeleton', 'zombie', 'ghostmage', 'banshee', 'skullknight', 'stitchbrute'], skin: 'u', base: 'LA CRIPTA', passive: 'RENACER', pkey: 'revive', passiveText: 'Cada no-muerto revive una vez, con el 60 % de su vida, poco después de caer. Los esqueletos invocados no.', banner: 'Cada no-muerto revive una vez con el 60 % de su vida', trio: ['ghostmage', 'necrolord', 'skullknight'], kind: 'undead', end: 'tu Cripta', icon: 'soul', trioH: [96, 158, 104] },
});
