// Fans Of · Facción Ciberpunks: sus cartas, unidades, tamaños, roles y datos. Se añaden a los objetos de serie/config.js, que fija el orden de las claves.
'use strict';
Object.assign(CFG.cards, {
    // Ciberpunks
    cybermarine: { name: 'CyberMarine',  cost: 5, count: 1, respawn: 12, rarity: 'leader', rar: 'Líder', tag: 'Orbital Drop', desc: 'Marine con armadura y fusil rápido. Cada 9 s le caen del cielo 2 drones de apoyo.' },
    nanobot:     { name: 'NanoBots',     cost: 2, count: 4, rarity: 'common', rar: 'Común', tag: 'Salen 4', desc: 'Cuatro robots diminutos y rápidos que rodean al enemigo.' },
    cyberninja:  { name: 'CyberNinja',   cost: 3, count: 1, rarity: 'common', rar: 'Común', tag: 'Teletransporte', desc: 'Ninja con katana de neón: cada 5 s se teletransporta hacia su objetivo.' },
    techdroid:   { name: 'TechDroid',    cost: 3, count: 1, rarity: 'rare',   rar: 'Rara',  tag: 'Repara', desc: 'Droide de soporte: va detrás de tus tropas y repara a las que tiene delante.' },
    hackerkid:   { name: 'HackerKid',    cost: 3, count: 1, rarity: 'rare',   rar: 'Rara',  tag: 'Hackea torres', desc: 'Cada 8 s hackea la torre enemiga más cercana y la deja 3,5 s sin disparar.' },
    neonsniper:  { name: 'NeonSniper',   cost: 4, count: 1, rarity: 'rare',   rar: 'Rara',  tag: 'Francotiradora', desc: 'Dispara muy despacio, pero desde muy lejos y con muchísimo daño.' },
    siegemech:   { name: 'SiegeMech',    cost: 5, count: 1, rarity: 'epic',   rar: 'Épica', tag: 'Artillería', desc: 'Mecha de asedio con cañón: daño en área desde lejos. Lento pero demoledor.' },
    dron: { name: "DronCazador", cost: 3, count: 1, rarity: 'epic', rar: 'Épica', tag: 'Mata-sanadores', desc: "Dron de caza: vuela por encima de la pelea y se lanza a por el sanador o el tirador enemigo. A esos les hace el doble de daño.", gacha: true, fac: 'ciber' },
    sp_orbital: { name: "Ataque orbital", cost: 4, count: 1, rarity: 'rare', rar: 'Rara', tag: 'Hechizo · daño', desc: "Un satélite marca la zona y, un segundo después, dispara: 240 de daño.", gacha: true, fac: 'ciber', spell: { side: "foe", kind: "dmg", r: 65, amt: 240, bld: 0.5, delay: 1.2, fx: "laser", col: "#22e3ff" } },
    sp_nanobots: { name: "Parche de nanobots", cost: 3, count: 1, rarity: 'rare', rar: 'Rara', tag: 'Hechizo · cura', desc: "Nanobots que reparan: curan 130 a tus tropas de la zona y les dan un escudo de 60.", gacha: true, fac: 'ciber', spell: { side: "ally", kind: "heal", r: 85, amt: 130, shield: 60, fx: "chip", col: "#7df3ff" } },
    sp_update: { name: "Actualización obligatoria", cost: 4, count: 1, rarity: 'legendary', rar: 'Legendaria', tag: 'Hechizo · loco', desc: "Los enemigos de la zona se quedan «instalando la actualización 1 de 47»: no se mueven ni atacan durante 3 s.", gacha: true, fac: 'ciber', spell: { side: "foe", kind: "stun", r: 80, t: 3, sk: "update", fx: "bar", col: "#22e3ff", label: "INSTALANDO 1/47…" } },
});
Object.assign(CFG.units, {
    // Ciberpunks
    cybermarine: { hp: 560, dmg: 13, cd: 0.45, range: 100, speed: 34, r: 19, sight: 150, ranged: 'bullet', summon: 'drone', summonN: 2, summonCd: 9, summonDrop: true },
    drone:       { hp: 80,  dmg: 8,  cd: 0.6, range: 90,  speed: 50, r: 8,  sight: 140, ranged: 'bullet' },
    nanobot:     { hp: 70,  dmg: 9,  cd: 0.7, range: 6,   speed: 56, r: 8,  sight: 110 },
    cyberninja:  { hp: 280, dmg: 24, cd: 0.8, range: 8,   speed: 46, r: 12, sight: 150, blink: { cd: 5, dist: 80 } },
    techdroid:   { hp: 200, dmg: 8,  cd: 1.0, range: 8,   speed: 30, r: 13, sight: 110, healer: true, heal: 14, healCd: 1.7, healR: 95 },
    hackerkid:   { hp: 150, dmg: 12, cd: 1.0, range: 90,  speed: 40, r: 11, sight: 140, ranged: 'code', hack: { cd: 8, r: 170, t: 3.5 } },
    neonsniper:  { hp: 150, dmg: 60, cd: 2.4, range: 170, speed: 34, r: 12, sight: 190, ranged: 'snipe' },
    siegemech:   { hp: 820, dmg: 38, cd: 2.0, range: 120, speed: 24, r: 22, sight: 150, ranged: 'shell', splash: 45 },
    dron: { hp: 190, dmg: 24, cd: 0.8, range: 8, speed: 54, r: 12, sight: 140, leap: { range: 250, cd: 9, mult: 2 } },
});
Object.assign(TYPES, {
  cybermarine: { top: 62, foot: '#1f2937' },
  drone:       { top: 24, foot: null, hover: true, jet: true },
  nanobot:     { top: 24, foot: '#4b5563' },
  cyberninja:  { top: 42, foot: '#111827' },
  techdroid:   { top: 40, foot: null, hover: true, jet: true },
  hackerkid:   { top: 38, foot: '#111827' },
  neonsniper:  { top: 42, foot: '#1f2937' },
  siegemech:   { top: 60, foot: '#1f2937' },
  dron: { top: 40, foot: null, hover: true },
});
Object.assign(ROLES, {
  cybermarine: 'support', nanobot: 'swarm', cyberninja: 'assassin', techdroid: 'support', hackerkid: 'control',
  neonsniper: 'ranged', siegemech: 'tank', dron: 'assassin', sp_orbital: 'spell', sp_nanobots: 'spell', sp_update: 'spell',
});
Object.assign(FACTIONS, {
  ciber:     { name: 'Ciberpunks', pname: 'Escudos', leader: 'cybermarine', units: ['nanobot', 'cyberninja', 'techdroid', 'hackerkid', 'neonsniper', 'siegemech'], skin: 'c', base: 'EL BÚNKER', passive: 'ESCUDOS', pkey: 'shield', passiveText: 'Cada unidad lleva un escudo de plasma del 25 % de su vida que se recarga si pasa 3 s sin recibir daño.', banner: 'Escudo de plasma del 25 % que se recarga a los 3 s sin daño', trio: ['cyberninja', 'cybermarine', 'neonsniper'], kind: 'ciber', end: 'tu Búnker', icon: 'shield', trioH: [92, 150, 92] },
});
