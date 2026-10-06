// Fans Of · Facción Comunidad Gamer: sus cartas, unidades, tamaños, roles y datos. Se añaden a los objetos de serie/config.js, que fija el orden de las claves.
'use strict';
Object.assign(CFG.cards, {
    // Comunidad Gamer (v0.9.13)
    progamer:    { name: 'ProGamer',     cost: 5, count: 1, respawn: 12, rarity: 'leader', rar: 'Líder', tag: 'Combo', desc: 'Campeón de torneos con un teclado como espada. Ataca rapidísimo y cada 4.º golpe es un ¡COMBO!: triple de daño y aturde. Si cae, vuelve a los 12 s.' },
    noobs:       { name: 'Noobs',        cost: 2, count: 3, rarity: 'common', rar: 'Común', tag: 'Salen 3', desc: 'Tres novatos con gorro de hélice. No saben jugar, pero le ponen muchas ganas.' },
    speedrunner: { name: 'Speedrunner',  cost: 3, count: 1, rarity: 'common', rar: 'Común', tag: 'Rompe torres', desc: 'Se salta a los enemigos (como en sus partidas) y corre directa a por las torres. Nadie corre más que ella.' },
    modder:      { name: 'Modder',       cost: 3, count: 1, rarity: 'rare',   rar: 'Rara',  tag: 'Repara', desc: 'Arregla el juego mejor que la empresa: va detrás de tus tropas y repara a las que tiene delante.' },
    coleccionista:{ name: 'Coleccionista', cost: 4, count: 1, rarity: 'rare', rar: 'Rara',  tag: 'Disco que rebota', desc: 'Lanza sus juegos en disco (los físicos, los de verdad). Cada disco rebota a otro enemigo cercano.' },
    ragequitter: { name: 'RageQuitter',  cost: 4, count: 1, rarity: 'rare',   rar: 'Rara',  tag: 'Explota al caer', desc: 'Pierde y se enfada. Al caer, tira el mando y explota: 100 de daño a los enemigos de alrededor.' },
    recreativa:  { name: 'Recreativa',   cost: 5, count: 1, rarity: 'epic',   rar: 'Épica', tag: 'Tanque + noobs', desc: 'Una máquina arcade con piernas. Aguanta muchísimo y, cuando cae, salen 2 noobs a seguir jugando.' },
    campero: { name: "Campero", cost: 3, count: 1, rarity: 'epic', rar: 'Épica', tag: 'Mata-sanadores', desc: "Sale escondido en un arbusto y, cuando ve a un sanador o a un tirador, salta a por él. A esos les hace el doble de daño.", gacha: true, fac: 'gamer' },
    sp_critico: { name: "Golpe crítico", cost: 4, count: 1, rarity: 'rare', rar: 'Rara', tag: 'Hechizo · daño', desc: "¡CRÍTICO! Un golpe enorme en una zona pequeña: 300 de daño.", gacha: true, fac: 'gamer', spell: { side: "foe", kind: "dmg", r: 45, amt: 300, bld: 0.45, fx: "sword", col: "#ff4b5c" } },
    sp_review: { name: "Review bombing", cost: 3, count: 1, rarity: 'epic', rar: 'Épica', tag: 'Hechizo · loco', desc: "La comunidad llena la tienda de reseñas de 1 estrella: las torres y la sede del rival en la zona reciben un 40 % más de daño durante 8 s.", gacha: true, fac: 'gamer', spell: { side: "foe", kind: "review", r: 80, t: 8, amp: 0.4, fx: "letter", col: "#ffcb3d", label: "★☆☆☆☆" } },
    sp_energetica: { name: "Bebida energética", cost: 3, count: 1, rarity: 'rare', rar: 'Rara', tag: 'Hechizo · cura', desc: "Una lata para todos: cura 120 a tus tropas de la zona y atacan un 30 % más rápido durante 5 s.", gacha: true, fac: 'gamer', spell: { side: "ally", kind: "heal", r: 85, amt: 120, haste: 5, fx: "can", col: "#7be04a" } },
    sp_ping: { name: "Ping de 999", cost: 3, count: 1, rarity: 'legendary', rar: 'Legendaria', tag: 'Hechizo · loco', desc: "Lag horrible: los enemigos de la zona dan un salto hacia atrás y se quedan congelados 1 s.", gacha: true, fac: 'gamer', spell: { side: "foe", kind: "knock", r: 85, d: 80, t: 1, fx: "wifi", col: "#ff4b5c", label: "LAG" } },
});
Object.assign(CFG.units, {
    // Comunidad Gamer (v0.9.13)
    progamer:    { hp: 560, dmg: 17, cd: 0.7, range: 10,  speed: 38, r: 18, sight: 150, combo: { n: 4, mult: 3, stun: 0.6 } },
    noobs:       { hp: 90,  dmg: 11, cd: 0.9, range: 6,   speed: 48, r: 10, sight: 110 },
    speedrunner: { hp: 230, dmg: 28, cd: 0.8, range: 8,   speed: 70, r: 12, sight: 140, buildings: true },
    modder:      { hp: 200, dmg: 8,  cd: 1.0, range: 8,   speed: 30, r: 13, sight: 110, healer: true, heal: 15, healCd: 1.7, healR: 95 },
    coleccionista:{ hp: 210, dmg: 24, cd: 1.25, range: 110, speed: 36, r: 13, sight: 150, ranged: 'disc', bounce: 0.6 },
    ragequitter: { hp: 480, dmg: 24, cd: 1.0, range: 8,   speed: 40, r: 15, sight: 130, deathBlast: { r: 70, dmg: 100, txt: '¡RAGE QUIT!', rgb: '255,90,90', c1: '#ff6b6b', c2: '#ffd0d0', tc: '#ff8a8a' } },
    recreativa:  { hp: 950, dmg: 26, cd: 1.3, range: 10,  speed: 26, r: 22, sight: 140, eject: 'noobs', ejectN: 2, ejectTxt: '¡INSERT COIN!' },
    campero: { hp: 250, dmg: 24, cd: 1.0, range: 8, speed: 44, r: 14, sight: 140, stealth: 4, leap: { range: 250, cd: 9, mult: 2 } },
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
