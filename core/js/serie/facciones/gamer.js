// Fans Of · Facción Comunidad Gamer: sus cartas, tamaños, roles y datos (las cifras de sus unidades las pone cada juego). Se añaden a los objetos de serie/config.js, que fija el orden de las claves.
'use strict';
Object.assign(CFG.cards, {
    // Comunidad Gamer (v0.9.13)
    progamer: { name: 'ProGamer', rarity: 'leader', rar: 'Líder', tag: 'Combo', desc: 'Campeón de torneos con un teclado como espada. Ataca rapidísimo y cada 4.º golpe es un ¡COMBO!: triple de daño y aturde. Si cae, vuelve a los 12 s.' },
    noobs: { name: 'Noobs', rarity: 'basic', rar: 'Común', tag: 'Salen 3', desc: 'Tres novatos con gorro de hélice. No saben jugar, pero le ponen muchas ganas.' },
    speedrunner: { name: 'Speedrunner', rarity: 'common', rar: 'Poco común', tag: 'Rompe torres', desc: 'Se salta a los enemigos (como en sus partidas) y corre directa a por las torres. Nadie corre más que ella.' },
    modder: { name: 'Modder', rarity: 'rare', rar: 'Rara', tag: 'Repara', desc: 'Arregla el juego mejor que la empresa: va detrás de tus tropas y repara a las que tiene delante.' },
    coleccionista: { name: 'Coleccionista', rarity: 'rare', rar: 'Rara', tag: 'Disco que rebota', desc: 'Lanza sus juegos en disco (los físicos, los de verdad). Cada disco rebota a otro enemigo cercano.' },
    ragequitter: { name: 'RageQuitter', rarity: 'rare', rar: 'Rara', tag: 'Explota al caer', desc: 'Pierde y se enfada. Al caer, tira el mando y explota: 100 de daño a los enemigos de alrededor.' },
    recreativa: { name: 'Recreativa', rarity: 'epic', rar: 'Épica', tag: 'Tanque + noobs', desc: 'Una máquina arcade con piernas. Aguanta muchísimo y, cuando cae, salen 2 noobs a seguir jugando.' },
    campero: { name: "Campero", rarity: 'epic', rar: 'Épica', tag: 'Mata-sanadores', desc: "Sale escondido en un arbusto y, cuando ve a un sanador o a un tirador, salta a por él. A esos les hace el doble de daño.", gacha: true, fac: 'gamer' },
    sp_critico: { name: "Golpe crítico", rarity: 'rare', rar: 'Rara', tag: 'Hechizo · daño', desc: "¡CRÍTICO! Un golpe enorme en una zona pequeña: 300 de daño.", gacha: true, fac: 'gamer' },
    sp_review: { name: "Review bombing", rarity: 'epic', rar: 'Épica', tag: 'Hechizo · loco', desc: "La comunidad llena la tienda de reseñas de 1 estrella: las torres y la sede del rival en la zona reciben un 40 % más de daño durante 8 s.", gacha: true, fac: 'gamer' },
    sp_energetica: { name: "Bebida energética", rarity: 'rare', rar: 'Rara', tag: 'Hechizo · cura', desc: "Una lata para todos: cura 120 a tus tropas de la zona y atacan un 30 % más rápido durante 5 s.", gacha: true, fac: 'gamer' },
    sp_ping: { name: "Ping de 999", rarity: 'legendary', rar: 'Legendaria', tag: 'Hechizo · loco', desc: "Lag horrible: los enemigos de la zona dan un salto hacia atrás y se quedan congelados 1 s.", gacha: true, fac: 'gamer' },
});
Object.assign(TYPES, {
  progamer:    { top: 58, foot: '#1f2937' }, noobs: { top: 34, foot: '#1f2937' }, speedrunner: { top: 42, foot: '#f5f5f5' }, modder: { top: 46, foot: '#1f2937' },
  coleccionista: { top: 46, foot: '#1f2937' }, ragequitter: { top: 52, foot: '#1f2937' }, recreativa: { top: 68, foot: '#1f2937' },
  campero: { top: 46, foot: "#3f6212" },
});
Object.assign(ROLES, {
  progamer: 'tank', noobs: 'swarm', speedrunner: 'buster', modder: 'support', coleccionista: 'ranged', ragequitter: 'assassin',
  recreativa: 'tank', campero: 'assassin', sp_critico: 'spell', sp_review: 'spell', sp_energetica: 'spell', sp_ping: 'spell',
});
Object.assign(FACTIONS, {
  gamer:     { name: 'Comunidad Gamer', los: 'los Gamers', corr: 'Gamers corrompidos', pname: 'Comunidad', leader: 'progamer', units: ['noobs', 'speedrunner', 'modder', 'coleccionista', 'ragequitter', 'recreativa'], skin: 'g', base: 'LA LAN PARTY', passive: 'COMUNIDAD', chip: 'EQUIPO', pkey: 'community', passiveText: 'Juntos son más fuertes: todo tu equipo pega un 5 % más por cada tipo distinto de unidad que tengas en el campo, hasta +30 %.', banner: '+5 % de daño por cada tipo distinto de unidad en el campo (hasta +30 %)', trio: ['speedrunner', 'progamer', 'recreativa'], kind: 'gamer', end: 'tu LAN Party', icon: 'pad', trioH: [92, 150, 132] },
});
