// Fans Of · Facción Héroes: sus cartas, tamaños, roles y datos (las cifras de sus unidades las pone cada juego). Se añaden a los objetos de serie/config.js, que fija el orden de las claves.
'use strict';
Object.assign(CFG.cards, {
    // Héroes
    epicchampion:{ name: 'EpicChampion', cost: 5, count: 1, respawn: 12, rarity: 'leader', rar: 'Líder', tag: 'Team Fight', desc: 'Cada 8 s grita ¡Team Fight! y todos los aliados cercanos dan a la vez un golpe extra con +50 % de daño.' },
    cupidarcher: { name: 'CupidArcher',  cost: 2, count: 1, rarity: 'common', rar: 'Común', tag: 'A distancia', desc: 'Un querubín con arco que dispara flechas rápidas desde lejos.' },
    hoplite:     { name: 'Hoplites',     cost: 3, count: 3, rarity: 'common', rar: 'Común', tag: 'Lanzas · x3', desc: 'Tres soldados con escudo y lanza larga. Aguantan bien en grupo.' },
    shieldmaiden:{ name: 'ShieldMaiden', cost: 3, count: 1, rarity: 'rare',   rar: 'Rara',  tag: 'Blindada', desc: 'Valquiria con escudo: recibe un 35 % menos de daño. Perfecta para ir delante.' },
    thundergod:  { name: 'ThunderGod',   cost: 4, count: 1, rarity: 'rare',   rar: 'Rara',  tag: 'Rayo en cadena', desc: 'Dios del trueno: su rayo salta del objetivo a otros 2 enemigos cercanos.' },
    medusa:      { name: 'Medusa',       cost: 4, count: 1, rarity: 'rare',   rar: 'Rara',  tag: 'Petrifica', desc: 'Cada 8 s se baja las gafas de sol y petrifica a los enemigos cercanos.' },
    minotaur:    { name: 'Minotaur',     cost: 5, count: 1, rarity: 'epic',   rar: 'Épica', tag: 'Embestida', desc: 'Mole con hacha doble. Si llega corriendo, su primer golpe hace más del doble y aturde.' },
    arpia: { name: "Arpía", cost: 3, count: 1, rarity: 'epic', rar: 'Épica', tag: 'Mata-sanadores', desc: "Mitad pájaro y muy mal humor: vuela por encima de la pelea y cae sobre el sanador o el tirador enemigo. A esos les hace el doble de daño.", gacha: true, fac: 'heroes' },
    sp_rayo: { name: "Rayo divino", cost: 4, count: 1, rarity: 'rare', rar: 'Rara', tag: 'Hechizo · daño', desc: "Un dios enfadado lanza un rayo: 260 de daño en una zona pequeña.", gacha: true, fac: 'heroes', spell: { side: "foe", kind: "dmg", r: 55, amt: 260, bld: 0.4, fx: "bolt", col: "#ffe14d" } },
    sp_ambrosia: { name: "Ambrosía", cost: 4, count: 1, rarity: 'rare', rar: 'Rara', tag: 'Hechizo · cura', desc: "La bebida de los dioses: cura 200 a tus tropas de la zona.", gacha: true, fac: 'heroes', spell: { side: "ally", kind: "heal", r: 85, amt: 200, fx: "goblet", col: "#ffd166" } },
    sp_nerfeo: { name: "Nerfeo divino", cost: 3, count: 1, rarity: 'legendary', rar: 'Legendaria', tag: 'Hechizo · loco', desc: "Los dioses publican un parche: los enemigos de la zona encogen y pegan un 40 % menos durante 6 s.", gacha: true, fac: 'heroes', spell: { side: "foe", kind: "shrink", r: 85, t: 6, f: 0.6, fx: "arrow", col: "#63cfe0", label: "¡NERFEADO!" } },
});
Object.assign(TYPES, {
  epicchampion:{ top: 68, foot: '#a16207' },
  cupidarcher: { top: 42, foot: null, hover: true },
  hoplite:     { top: 40, foot: '#7a4a1a' },
  shieldmaiden:{ top: 50, foot: '#5b6787' },
  thundergod:  { top: 56, foot: null, hover: true },
  medusa:      { top: 50, foot: '#15803d' },
  minotaur:    { top: 60, foot: '#3b2a1e' },
  arpia: { top: 46, foot: null, hover: true },
});
Object.assign(ROLES, {
  epicchampion: 'tank', cupidarcher: 'ranged', hoplite: 'swarm', shieldmaiden: 'tank', thundergod: 'ranged', medusa: 'control',
  minotaur: 'tank', arpia: 'assassin', sp_rayo: 'spell', sp_ambrosia: 'spell', sp_nerfeo: 'spell',
});
Object.assign(FACTIONS, {
  heroes:    { name: 'Héroes', pname: 'Experiencia', leader: 'epicchampion', units: ['cupidarcher', 'hoplite', 'shieldmaiden', 'thundergod', 'medusa', 'minotaur'], skin: 'h', base: 'EL TEMPLO', passive: 'EXPERIENCIA', chip: 'NIVEL', pkey: 'xp', passiveText: 'Cada bot que despides da experiencia a todo tu ejército: cada 3 bajas subís de nivel, +5 % de vida y daño, hasta nivel 5.', banner: 'Cada 3 bajas, +5 % de vida y daño a todo tu ejército', trio: ['shieldmaiden', 'epicchampion', 'thundergod'], kind: 'hero', end: 'tu Templo', icon: 'star', trioH: [104, 156, 104] },
});
