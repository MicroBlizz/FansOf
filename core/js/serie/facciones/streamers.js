// Fans Of · Facción Streamers: sus cartas, unidades, tamaños, roles y datos. Se añaden a los objetos de serie/config.js, que fija el orden de las claves.
'use strict';
Object.assign(CFG.cards, {
    // Streamers
    twitchking:  { name: 'StreamKing',   cost: 5, count: 1, respawn: 12, rarity: 'leader', rar: 'Líder', tag: 'En directo', desc: 'El rey del directo. Mientras siga en pie, los aliados que tiene cerca pegan un 30 % más.' },
    subswarm:    { name: 'SubSwarm',     cost: 2, count: 3, rarity: 'common', rar: 'Común', tag: 'Salen 3', desc: 'Tres suscriptores con dedo de espuma. Frágiles, rápidos y muy entregados.' },
    hypebeast:   { name: 'HypeBeast',    cost: 3, count: 1, rarity: 'common', rar: 'Común', tag: 'Rápido', desc: 'Fan con ropa de marca y hasta arriba de bebida energética. Pega rapidísimo.' },
    viralbot:    { name: 'ViralBot',     cost: 3, count: 1, rarity: 'rare',   rar: 'Rara',  tag: 'Aturde', desc: 'Cámara voladora que graba clips: cada disparo aturde un instante al objetivo.' },
    snackmom:    { name: 'SnackMom',     cost: 3, count: 1, rarity: 'rare',   rar: 'Rara',  tag: 'Cura aliados', desc: 'La madre del streamer va detrás de tus tropas y reparte bocadillos a las que tiene delante.' },
    hypetrain:   { name: 'HypeTrain',    cost: 4, count: 1, rarity: 'rare',   rar: 'Rara',  tag: 'Rompe torres', desc: 'El tren del hype va directo a por los edificios. No hay quien lo pare.' },
    banhammer:   { name: 'BanHammer',    cost: 5, count: 1, rarity: 'epic',   rar: 'Épica', tag: 'Área · empuja', desc: 'El moderador. Aguanta muchísimo y cada martillazo golpea en área y aparta a los enemigos.' },
    hater: { name: "Hater", cost: 3, count: 1, rarity: 'epic', rar: 'Épica', tag: 'Mata-sanadores', desc: "Escribe «ESTO ES MALÍSIMO» y salta a por el sanador o el tirador enemigo. A esos les hace el doble de daño.", gacha: true, fac: 'streamers' },
    sp_donaciones: { name: "Lluvia de donaciones", cost: 3, count: 1, rarity: 'rare', rar: 'Rara', tag: 'Hechizo · daño', desc: "Caen monedas de los fans: 130 de daño en la zona, y cada enemigo al que da te devuelve 0,3 de CAOS (hasta 1,5).", gacha: true, fac: 'streamers', spell: { side: "foe", kind: "dmg", r: 85, amt: 130, bld: 0.3, gain: 0.3, fx: "coin", col: "#ffcb3d" } },
    sp_merienda: { name: "Pausa para merendar", cost: 3, count: 1, rarity: 'rare', rar: 'Rara', tag: 'Hechizo · cura', desc: "La madre del streamer trae la merienda: cura 160 a tus tropas de la zona.", gacha: true, fac: 'streamers', spell: { side: "ally", kind: "heal", r: 90, amt: 160, fx: "sandwich", col: "#ffb04f" } },
    sp_baneo: { name: "Ban temporal", cost: 4, count: 1, rarity: 'legendary', rar: 'Legendaria', tag: 'Hechizo · loco', desc: "El moderador banea a los enemigos de la zona: desaparecen 3 s y no pueden hacer nada.", gacha: true, fac: 'streamers', spell: { side: "foe", kind: "ban", r: 75, t: 3, fx: "hammer", col: "#a855f7", label: "BANEADO" } },
});
Object.assign(CFG.units, {
    // Streamers
    twitchking:  { hp: 600, dmg: 30, cd: 1.1, range: 10,  speed: 36, r: 19, sight: 150, aura: { r: 110, mult: 1.3 } },
    subswarm:    { hp: 110, dmg: 14, cd: 0.8, range: 6,   speed: 54, r: 9,  sight: 110 },
    hypebeast:   { hp: 360, dmg: 22, cd: 0.65, range: 8,   speed: 54, r: 12, sight: 130 },
    viralbot:    { hp: 190, dmg: 20, cd: 1.1, range: 110, speed: 38, r: 13, sight: 150, ranged: 'clip', stunOnHit: 0.4 },
    snackmom:    { hp: 220, dmg: 8,  cd: 1.0, range: 8,   speed: 30, r: 13, sight: 110, healer: true, heal: 16, healCd: 1.7, healR: 95 },
    hypetrain:   { hp: 580, dmg: 50, cd: 1.3, range: 8,   speed: 48, r: 18, sight: 140, buildings: true },
    banhammer:   { hp: 1000, dmg: 32, cd: 1.4, range: 12,  speed: 26, r: 21, sight: 140, knock: 22, cleave: { r: 38, f: 0.7 } },
    hater: { hp: 240, dmg: 24, cd: 0.95, range: 8, speed: 48, r: 13, sight: 140, leap: { range: 250, cd: 9, mult: 2 } },
});
Object.assign(TYPES, {
  twitchking:  { top: 63, foot: '#2b2d3a' },
  subswarm:    { top: 34, foot: '#f5f5f5' },
  hypebeast:   { top: 40, foot: '#f5f5f5' },
  viralbot:    { top: 44, foot: null, hover: true, jet: true },
  snackmom:    { top: 46, foot: '#f472b6' },
  hypetrain:   { top: 56, foot: null },
  banhammer:   { top: 66, foot: '#14532d' },
  hater: { top: 50, foot: "#334155" },
});
Object.assign(ROLES, {
  twitchking: 'tank', subswarm: 'swarm', hypebeast: 'assassin', viralbot: 'ranged', snackmom: 'support', hypetrain: 'buster',
  banhammer: 'tank', hater: 'assassin', sp_donaciones: 'spell', sp_merienda: 'spell', sp_baneo: 'spell',
});
Object.assign(FACTIONS, {
  streamers: { name: 'Streamers', pname: 'Hype', leader: 'twitchking', units: ['subswarm', 'hypebeast', 'viralbot', 'snackmom', 'hypetrain', 'banhammer'], skin: 's', base: 'EL PLATÓ', passive: 'HYPE', pkey: 'hype', passiveText: 'Cada bot que despides suma espectadores al chat. Cada 3, todo tu equipo ataca un 5 % más rápido (hasta +25 %). Si pierdes una torre, el chat se va.', banner: 'Cada 3 bajas, tu equipo ataca un 5 % más rápido (hasta +25 %)', trio: ['hypebeast', 'twitchking', 'viralbot'], kind: 'stream', end: 'tu Plató', icon: 'chat', trioH: [84, 150, 92] },
});
