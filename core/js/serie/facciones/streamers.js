// Fans Of · Facción Streamers: sus cartas, tamaños, roles y datos (las cifras de sus unidades las pone cada juego). Se añaden a los objetos de serie/config.js, que fija el orden de las claves.
'use strict';
Object.assign(CFG.cards, {
    // Streamers
    twitchking: { name: 'StreamKing', rarity: 'leader', rar: 'Líder', tag: 'En directo', desc: 'El rey del directo. Mientras siga en pie, los aliados que tiene cerca pegan un 30 % más.' },
    subswarm: { name: 'SubSwarm', rarity: 'common', rar: 'Común', tag: 'Salen 3', desc: 'Tres suscriptores con dedo de espuma. Frágiles, rápidos y muy entregados.' },
    hypebeast: { name: 'HypeBeast', rarity: 'common', rar: 'Común', tag: 'Rápido', desc: 'Fan con ropa de marca y hasta arriba de bebida energética. Pega rapidísimo.' },
    viralbot: { name: 'ViralBot', rarity: 'rare', rar: 'Rara', tag: 'Aturde', desc: 'Cámara voladora que graba clips: cada disparo aturde un instante al objetivo.' },
    snackmom: { name: 'SnackMom', rarity: 'rare', rar: 'Rara', tag: 'Cura aliados', desc: 'La madre del streamer va detrás de tus tropas y reparte bocadillos a las que tiene delante.' },
    hypetrain: { name: 'HypeTrain', rarity: 'rare', rar: 'Rara', tag: 'Rompe torres', desc: 'El tren del hype va directo a por los edificios. No hay quien lo pare.' },
    banhammer: { name: 'BanHammer', rarity: 'epic', rar: 'Épica', tag: 'Área · empuja', desc: 'El moderador. Aguanta muchísimo y cada martillazo golpea en área y aparta a los enemigos.' },
    hater: { name: "Hater", rarity: 'epic', rar: 'Épica', tag: 'Mata-sanadores', desc: "Escribe «ESTO ES MALÍSIMO» y salta a por el sanador o el tirador enemigo. A esos les hace el doble de daño.", gacha: true, fac: 'streamers' },
    sp_donaciones: { name: "Lluvia de donaciones", rarity: 'rare', rar: 'Rara', tag: 'Hechizo · daño', desc: "Caen monedas de los fans: 130 de daño en la zona, y cada enemigo al que da te devuelve 0,3 de CAOS (hasta 1,5).", gacha: true, fac: 'streamers' },
    sp_merienda: { name: "Pausa para merendar", rarity: 'rare', rar: 'Rara', tag: 'Hechizo · cura', desc: "La madre del streamer trae la merienda: cura 160 a tus tropas de la zona.", gacha: true, fac: 'streamers' },
    sp_baneo: { name: "Ban temporal", rarity: 'legendary', rar: 'Legendaria', tag: 'Hechizo · loco', desc: "El moderador banea a los enemigos de la zona: desaparecen 3 s y no pueden hacer nada.", gacha: true, fac: 'streamers' },
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
