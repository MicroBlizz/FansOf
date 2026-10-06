// Fans Of · Facción Olvidados: sus cartas, unidades, tamaños, roles y datos. Se añaden a los objetos de serie/config.js, que fija el orden de las claves.
'use strict';
Object.assign(CFG.cards, {
    // Olvidados (v0.9.13)
    vikingo:     { name: 'VikingoPerdido', cost: 5, count: 1, respawn: 12, rarity: 'leader', rar: 'Líder', tag: 'Muro de escudos', desc: 'Lleva años perdido en el sótano. Cada 8 s levanta un muro de escudos: él y sus aliados cercanos reciben una barrera dorada que para 80 de daño. Si cae, vuelve a los 12 s.' },
    swarmbug:    { name: 'SwarmBugs',    cost: 2, count: 4, rarity: 'common', rar: 'Común', tag: 'Salen 4', desc: 'Cuatro bichos de un juego de estrategia que nunca salió. Rapidísimos y con muchas ganas de morder.' },
    vikingsquad: { name: 'Vikingos',     cost: 3, count: 3, rarity: 'common', rar: 'Común', tag: 'Salen 3', desc: 'Tres vikingos que se perdieron en un juego cancelado. Con escudo y espada, aguantan bien en grupo.' },
    retromarine: { name: 'RetroMarine',  cost: 3, count: 1, rarity: 'rare',   rar: 'Rara',  tag: 'Ráfagas', desc: 'Marine espacial de 1998 con hombreras enormes. Dispara ráfagas rapidísimas desde lejos.' },
    ghostagent:  { name: 'GhostAgent',   cost: 4, count: 1, rarity: 'rare',   rar: 'Rara',  tag: 'Invisible · francotirador', desc: 'Agente de un juego que se canceló en secreto. Sale invisible y su primer disparo hace el doble. Si derriba a alguien, vuelve a desaparecer.' },
    rockracer:   { name: 'RockRacer',    cost: 4, count: 1, rarity: 'rare',   rar: 'Rara',  tag: 'Rompe torres', desc: 'Un coche de carreras con lanzamisiles. Corre muchísimo y solo dispara a los edificios.' },
    titanbeta:   { name: 'TitánBeta',    cost: 5, count: 1, rarity: 'epic',   rar: 'Épica', tag: 'Furia', desc: 'Un gigante de un juego que se quedó en la beta. Con menos de la mitad de vida se enfada: pega un 50 % más y anda más rápido.' },
    espia: { name: "EspíaCancelado", cost: 3, count: 1, rarity: 'epic', rar: 'Épica', tag: 'Mata-sanadores', desc: "Protagonista de un juego de espías que nunca salió: salta por encima de la pelea y cae junto al sanador o al tirador enemigo. A esos les hace el doble de daño.", gacha: true, fac: 'olvidados' },
    sp_cartuchos: { name: "Lluvia de cartuchos", cost: 3, count: 1, rarity: 'rare', rar: 'Rara', tag: 'Hechizo · daño', desc: "Caen cartuchos de juegos olvidados: 150 de daño en la zona.", gacha: true, fac: 'olvidados', spell: { side: "foe", kind: "dmg", r: 80, amt: 150, bld: 0.35, fx: "cart", col: "#a16207" } },
    sp_parchefan: { name: "Parche de la comunidad", cost: 3, count: 1, rarity: 'rare', rar: 'Rara', tag: 'Hechizo · cura', desc: "Los fans arreglan lo que la empresa abandonó: cura 160 a tus tropas de la zona.", gacha: true, fac: 'olvidados', spell: { side: "ally", kind: "heal", r: 90, amt: 160, fx: "patch", col: "#fde68a" } },
    sp_cancelado: { name: "Juego cancelado", cost: 4, count: 1, rarity: 'legendary', rar: 'Legendaria', tag: 'Hechizo · loco', desc: "Los enemigos de la zona se quedan en gris, como un juego cancelado: no hacen nada durante 3 s.", gacha: true, fac: 'olvidados', spell: { side: "foe", kind: "stun", r: 80, t: 3, sk: "stone", fx: "stamp", col: "#9aa3a0", label: "CANCELADO" } },
});
Object.assign(CFG.units, {
    // Olvidados (v0.9.13)
    vikingo:     { hp: 620, dmg: 26, cd: 1.1, range: 10,  speed: 34, r: 19, sight: 150, shieldUp: { cd: 8, r: 100, amt: 80, t: 6 } },
    swarmbug:    { hp: 65,  dmg: 10, cd: 0.6, range: 6,   speed: 60, r: 8,  sight: 110 },
    vikingsquad: { hp: 170, dmg: 15, cd: 1.0, range: 10,  speed: 38, r: 11, sight: 120 },
    retromarine: { hp: 230, dmg: 9,  cd: 0.4, range: 100, speed: 36, r: 13, sight: 150, ranged: 'bullet' },
    ghostagent:  { hp: 170, dmg: 62, cd: 2.4, range: 165, speed: 36, r: 12, sight: 190, ranged: 'snipe', stealth: 8, surprise: 2, restealth: 3 },
    rockracer:   { hp: 420, dmg: 36, cd: 1.3, range: 95,  speed: 56, r: 16, sight: 150, buildings: true, ranged: 'missile' },
    titanbeta:   { hp: 1150, dmg: 34, cd: 1.4, range: 12, speed: 26, r: 23, sight: 140, fury: { f: 0.5, mult: 1.5, spd: 1.3 } },
    espia: { hp: 220, dmg: 26, cd: 0.95, range: 8, speed: 48, r: 13, sight: 140, leap: { range: 250, cd: 9, mult: 2 } },
});
Object.assign(TYPES, {
  vikingo:     { top: 62, foot: '#5a3a20' }, swarmbug: { top: 22, foot: null }, vikingsquad: { top: 38, foot: '#5a3a20' }, retromarine: { top: 50, foot: '#365314' },
  ghostagent:  { top: 46, foot: '#1f2937' }, rockracer: { top: 28, foot: null }, titanbeta: { top: 66, foot: '#44403c' },
  espia: { top: 49, foot: "#1f2937" },
});
Object.assign(ROLES, {
  vikingo: 'tank', swarmbug: 'swarm', vikingsquad: 'swarm', retromarine: 'ranged', ghostagent: 'assassin', rockracer: 'buster',
  titanbeta: 'tank', espia: 'assassin', sp_cartuchos: 'spell', sp_parchefan: 'spell', sp_cancelado: 'spell',
});
Object.assign(FACTIONS, {
  olvidados: { name: 'Olvidados', pname: 'Nostalgia', leader: 'vikingo', units: ['swarmbug', 'vikingsquad', 'retromarine', 'ghostagent', 'rockracer', 'titanbeta'], skin: 'o', base: 'EL ALMACÉN', passive: 'NOSTALGIA', pkey: 'nostalgia', passiveText: 'Nadie se acuerda de ellos: las torres y la base enemigas no les disparan hasta que llevan 3 s a su alcance.', banner: 'Las torres enemigas tardan 3 s en acordarse de cada unidad tuya', trio: ['retromarine', 'vikingo', 'titanbeta'], kind: 'olv', end: 'tu Almacén', icon: 'box', trioH: [96, 150, 124] },
});
