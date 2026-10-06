// Fans Of · Facción Memes: sus cartas, unidades, tamaños, roles y datos. Se añaden a los objetos de serie/config.js, que fija el orden de las claves.
'use strict';
Object.assign(CFG.cards, {
    // Memes
    memelord:    { name: 'MemeLord',     cost: 5, count: 1, respawn: 12, rarity: 'leader', rar: 'Líder', tag: 'Carta viral', desc: 'Cada 7 s juega una carta al azar: curación, aturdir, bola de fuego o invocar perros.' },
    suchdog:     { name: 'SuchDog',      cost: 2, count: 2, rarity: 'common', rar: 'Común', tag: 'Rápidos · x2', desc: 'Dos perros muy wow. Corren mucho y muerden más.' },
    gifblaster:  { name: 'GifBlaster',   cost: 3, count: 1, rarity: 'common', rar: 'Común', tag: 'Ráfagas', desc: 'Dispara GIFs en bucle a toda velocidad. Poco daño por disparo, pero no para.' },
    synthcat:    { name: 'SynthCat',     cost: 3, count: 1, rarity: 'rare',   rar: 'Rara',  tag: 'Daño en área', desc: 'Un gato con teclado: sus notas explotan en área. Nadie sabe por qué.' },
    trollbot:    { name: 'TrollBot',     cost: 4, count: 1, rarity: 'rare',   rar: 'Rara',  tag: 'Provoca', desc: 'Obliga a los enemigos y torres cercanos a atacarle a él. Aguanta y se ríe.' },
    stonks:      { name: 'Stonks',       cost: 4, count: 1, rarity: 'rare',   rar: 'Rara',  tag: 'Rompe torres', desc: 'Ejecutivo que solo ataca edificios: cada golpe pega un 15 % más que el anterior.' },
    chonkcat:    { name: 'ChonkCat',     cost: 5, count: 1, rarity: 'epic',   rar: 'Épica', tag: 'Aplasta', desc: 'Un gato enorme. Cada 6 s se sienta encima de los enemigos cercanos y los aturde.' },
    clickbait: { name: "Clickbait", cost: 3, count: 1, rarity: 'epic', rar: 'Épica', tag: 'Mata-sanadores', desc: "«¡NO VAS A CREER A QUIÉN ATACA!»: salta a por el sanador o el tirador enemigo. A esos les hace el doble de daño.", gacha: true, fac: 'memes' },
    sp_gatos: { name: "Lluvia de gatos", cost: 3, count: 1, rarity: 'rare', rar: 'Rara', tag: 'Hechizo · daño', desc: "Llueven gatos (enfadados): 120 de daño en una zona grande y, a veces, cae uno gordo que hace el doble.", gacha: true, fac: 'memes', spell: { side: "foe", kind: "dmg", r: 95, amt: 120, bld: 0.3, crit: 0.25, fx: "cat", col: "#ffb04f" } },
    sp_likes: { name: "Like masivo", cost: 3, count: 1, rarity: 'rare', rar: 'Rara', tag: 'Hechizo · cura', desc: "Mil likes de golpe: curan 140 a tus tropas de una zona grande.", gacha: true, fac: 'memes', spell: { side: "ally", kind: "heal", r: 100, amt: 140, fx: "heart", col: "#ff5fa8" } },
    sp_confusion: { name: "Confusión", cost: 4, count: 1, rarity: 'legendary', rar: 'Legendaria', tag: 'Hechizo · loco', desc: "Nadie entiende el meme: los enemigos de la zona se pelean entre ellos durante 3 s.", gacha: true, fac: 'memes', spell: { side: "foe", kind: "confuse", r: 80, t: 3, fx: "swirl", col: "#ff3df0", label: "¿EH?" } },
});
Object.assign(CFG.units, {
    // Memes
    memelord:    { hp: 540, dmg: 24, cd: 1.2, range: 90,  speed: 34, r: 18, sight: 150, ranged: 'card', viral: { cd: 7 } },
    suchdog:     { hp: 150, dmg: 16, cd: 0.8, range: 8,   speed: 56, r: 11, sight: 120 },
    gifblaster:  { hp: 200, dmg: 11, cd: 0.45, range: 100, speed: 44, r: 12, sight: 140, ranged: 'gif' },
    synthcat:    { hp: 210, dmg: 24, cd: 1.4, range: 100, speed: 36, r: 13, sight: 140, ranged: 'note', splash: 36 },
    trollbot:    { hp: 680, dmg: 16, cd: 1.0, range: 8,   speed: 34, r: 16, sight: 130, taunt: { r: 110 } },
    stonks:      { hp: 460, dmg: 30, cd: 1.1, range: 8,   speed: 40, r: 14, sight: 140, buildings: true, stonks: { step: 0.15, max: 10 } },
    chonkcat:    { hp: 1100, dmg: 26, cd: 1.4, range: 10, speed: 26, r: 23, sight: 140, pulse: { cd: 6, r: 55, stun: 0.6, dmg: 30, kind: 'daze', text: '¡SE SIENTA!', color: 'rgba(255,220,150,.95)', tc: '#ffd28a', sfx: 'slam' } },
    clickbait: { hp: 220, dmg: 25, cd: 0.95, range: 8, speed: 48, r: 14, sight: 140, leap: { range: 250, cd: 9, mult: 2 } },
});
Object.assign(TYPES, {
  memelord:    { top: 60, foot: '#27272a' },
  suchdog:     { top: 36, foot: '#e8a04a' },
  gifblaster:  { top: 44, foot: '#f5f5f5' },
  synthcat:    { top: 40, foot: '#f59e0b' },
  trollbot:    { top: 56, foot: '#4b5563' },
  stonks:      { top: 52, foot: '#111827' },
  chonkcat:    { top: 54, foot: null },
  clickbait: { top: 44, foot: "#1f2937" },
});
Object.assign(ROLES, {
  memelord: 'support', suchdog: 'swarm', gifblaster: 'ranged', synthcat: 'ranged', trollbot: 'tank', stonks: 'buster',
  chonkcat: 'tank', clickbait: 'assassin', sp_gatos: 'spell', sp_likes: 'spell', sp_confusion: 'spell',
});
Object.assign(FACTIONS, {
  memes:     { name: 'Memes', pname: 'RNG', leader: 'memelord', units: ['suchdog', 'gifblaster', 'synthcat', 'trollbot', 'stonks', 'chonkcat'], skin: 'm', base: 'EL FORO', passive: 'RNG', pkey: 'rng', passiveText: 'Cada unidad sale con una mutación al azar: gigante, turbo, de cristal o normal. Nunca sabes lo que va a salir.', banner: 'Cada unidad sale con una mutación al azar', trio: ['suchdog', 'memelord', 'trollbot'], kind: 'meme', end: 'tu Foro', icon: 'dice', trioH: [74, 150, 104] },
});
