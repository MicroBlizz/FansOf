// Fans Of · Facción Ciberpunks: sus cartas, tamaños, roles y datos (las cifras de sus unidades las pone cada juego). Se añaden a los objetos de serie/config.js, que fija el orden de las claves.
'use strict';
Object.assign(CFG.cards, {
    // Ciberpunks
    cybermarine: { name: 'CyberMarine', rarity: 'leader', rar: 'Líder', tag: 'Orbital Drop', desc: 'Marine con armadura y fusil rápido. Cada 9 s le caen del cielo 2 drones de apoyo.' },
    nanobot: { name: 'NanoBots', rarity: 'basic', rar: 'Común', tag: 'Salen 4', desc: 'Cuatro robots diminutos y rápidos que rodean al enemigo.' },
    cyberninja: { name: 'CyberNinja', rarity: 'common', rar: 'Poco común', tag: 'Teletransporte', desc: 'Ninja con katana de neón: cada 5 s se teletransporta hacia su objetivo.' },
    techdroid: { name: 'TechDroid', rarity: 'rare', rar: 'Rara', tag: 'Repara', desc: 'Droide de soporte: va detrás de tus tropas y repara a las que tiene delante.' },
    hackerkid: { name: 'HackerKid', rarity: 'rare', rar: 'Rara', tag: 'Hackea torres', desc: 'Cada 8 s hackea la torre enemiga más cercana y la deja 3,5 s sin disparar.' },
    neonsniper: { name: 'NeonSniper', rarity: 'rare', rar: 'Rara', tag: 'Francotiradora', desc: 'Dispara muy despacio, pero desde muy lejos y con muchísimo daño.' },
    siegemech: { name: 'SiegeMech', rarity: 'epic', rar: 'Épica', tag: 'Artillería', desc: 'Mecha de asedio con cañón: daño en área desde lejos. Lento pero demoledor.' },
    dron: { name: "DronCazador", rarity: 'epic', rar: 'Épica', tag: 'Mata-sanadores', desc: "Dron de caza: vuela por encima de la pelea y se lanza a por el sanador o el tirador enemigo. A esos les hace el doble de daño.", gacha: true, fac: 'ciber' },
    sp_orbital: { name: "Ataque orbital", rarity: 'rare', rar: 'Rara', tag: 'Hechizo · daño', desc: "Un satélite marca la zona y, un segundo después, dispara: 240 de daño.", gacha: true, fac: 'ciber' },
    sp_nanobots: { name: "Parche de nanobots", rarity: 'rare', rar: 'Rara', tag: 'Hechizo · cura', desc: "Nanobots que reparan: curan 130 a tus tropas de la zona y les dan un escudo de 60.", gacha: true, fac: 'ciber' },
    sp_update: { name: "Actualización obligatoria", rarity: 'legendary', rar: 'Legendaria', tag: 'Hechizo · loco', desc: "Los enemigos de la zona se quedan «instalando la actualización 1 de 47»: no se mueven ni atacan durante 3 s.", gacha: true, fac: 'ciber' },
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
