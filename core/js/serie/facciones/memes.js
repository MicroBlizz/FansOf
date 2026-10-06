// Fans Of · Facción Memes: sus cartas, tamaños, roles y datos (las cifras de sus unidades las pone cada juego). Se añaden a los objetos de serie/config.js, que fija el orden de las claves.
'use strict';
Object.assign(CFG.cards, {
    // Memes
    memelord: { name: 'MemeLord', rarity: 'leader', rar: 'Líder', tag: 'Carta viral', desc: 'Cada 7 s juega una carta al azar: curación, aturdir, bola de fuego o invocar perros.' },
    suchdog: { name: 'SuchDog', rarity: 'common', rar: 'Común', tag: 'Rápidos · x2', desc: 'Dos perros muy wow. Corren mucho y muerden más.' },
    gifblaster: { name: 'GifBlaster', rarity: 'common', rar: 'Común', tag: 'Ráfagas', desc: 'Dispara GIFs en bucle a toda velocidad. Poco daño por disparo, pero no para.' },
    synthcat: { name: 'SynthCat', rarity: 'rare', rar: 'Rara', tag: 'Daño en área', desc: 'Un gato con teclado: sus notas explotan en área. Nadie sabe por qué.' },
    trollbot: { name: 'TrollBot', rarity: 'rare', rar: 'Rara', tag: 'Provoca', desc: 'Obliga a los enemigos y torres cercanos a atacarle a él. Aguanta y se ríe.' },
    stonks: { name: 'Stonks', rarity: 'rare', rar: 'Rara', tag: 'Rompe torres', desc: 'Ejecutivo que solo ataca edificios: cada golpe pega un 15 % más que el anterior.' },
    chonkcat: { name: 'ChonkCat', rarity: 'epic', rar: 'Épica', tag: 'Aplasta', desc: 'Un gato enorme. Cada 6 s se sienta encima de los enemigos cercanos y los aturde.' },
    clickbait: { name: "Clickbait", rarity: 'epic', rar: 'Épica', tag: 'Mata-sanadores', desc: "«¡NO VAS A CREER A QUIÉN ATACA!»: salta a por el sanador o el tirador enemigo. A esos les hace el doble de daño.", gacha: true, fac: 'memes' },
    sp_gatos: { name: "Lluvia de gatos", rarity: 'rare', rar: 'Rara', tag: 'Hechizo · daño', desc: "Llueven gatos (enfadados): 120 de daño en una zona grande y, a veces, cae uno gordo que hace el doble.", gacha: true, fac: 'memes' },
    sp_likes: { name: "Like masivo", rarity: 'rare', rar: 'Rara', tag: 'Hechizo · cura', desc: "Mil likes de golpe: curan 140 a tus tropas de una zona grande.", gacha: true, fac: 'memes' },
    sp_confusion: { name: "Confusión", rarity: 'legendary', rar: 'Legendaria', tag: 'Hechizo · loco', desc: "Nadie entiende el meme: los enemigos de la zona se pelean entre ellos durante 3 s.", gacha: true, fac: 'memes' },
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
