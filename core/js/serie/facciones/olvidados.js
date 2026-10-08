// Fans Of · Facción Olvidados: sus cartas, tamaños, roles y datos (las cifras de sus unidades las pone cada juego). Se añaden a los objetos de serie/config.js, que fija el orden de las claves.
'use strict';
Object.assign(CFG.cards, {
    // Olvidados (v0.9.13)
    vikingo: { name: 'VikingoPerdido', rarity: 'leader', rar: 'Líder', tag: 'Muro de escudos', desc: 'Lleva años perdido en el sótano. Cada 8 s levanta un muro de escudos: él y sus aliados cercanos reciben una barrera dorada que para 80 de daño. Si cae, vuelve a los 12 s.' },
    swarmbug: { name: 'SwarmBugs', rarity: 'common', rar: 'Poco común', tag: 'Salen 4', desc: 'Cuatro bichos de un juego de estrategia que nunca salió. Rapidísimos y con muchas ganas de morder.' },
    vikingsquad: { name: 'Vikingos', rarity: 'common', rar: 'Poco común', tag: 'Salen 3', desc: 'Tres vikingos que se perdieron en un juego cancelado. Con escudo y espada, aguantan bien en grupo.' },
    retromarine: { name: 'RetroMarine', rarity: 'rare', rar: 'Rara', tag: 'Ráfagas', desc: 'Marine espacial de 1998 con hombreras enormes. Dispara ráfagas rapidísimas desde lejos.' },
    ghostagent: { name: 'GhostAgent', rarity: 'rare', rar: 'Rara', tag: 'Invisible · francotirador', desc: 'Agente de un juego que se canceló en secreto. Sale invisible y su primer disparo hace el doble. Si derriba a alguien, vuelve a desaparecer.' },
    rockracer: { name: 'RockRacer', rarity: 'rare', rar: 'Rara', tag: 'Rompe torres', desc: 'Un coche de carreras con lanzamisiles. Corre muchísimo y solo dispara a los edificios.' },
    titanbeta: { name: 'TitánBeta', rarity: 'epic', rar: 'Épica', tag: 'Furia', desc: 'Un gigante de un juego que se quedó en la beta. Con menos de la mitad de vida se enfada: pega un 50 % más y anda más rápido.' },
    espia: { name: "EspíaCancelado", rarity: 'epic', rar: 'Épica', tag: 'Mata-sanadores', desc: "Protagonista de un juego de espías que nunca salió: salta por encima de la pelea y cae junto al sanador o al tirador enemigo. A esos les hace el doble de daño.", gacha: true, fac: 'olvidados' },
    sp_cartuchos: { name: "Lluvia de cartuchos", rarity: 'rare', rar: 'Rara', tag: 'Hechizo · daño', desc: "Caen cartuchos de juegos olvidados: 150 de daño en la zona.", gacha: true, fac: 'olvidados' },
    sp_parchefan: { name: "Parche de la comunidad", rarity: 'rare', rar: 'Rara', tag: 'Hechizo · cura', desc: "Los fans arreglan lo que la empresa abandonó: cura 160 a tus tropas de la zona.", gacha: true, fac: 'olvidados' },
    sp_cancelado: { name: "Juego cancelado", rarity: 'legendary', rar: 'Legendaria', tag: 'Hechizo · loco', desc: "Los enemigos de la zona se quedan en gris, como un juego cancelado: no hacen nada durante 3 s.", gacha: true, fac: 'olvidados' },
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
