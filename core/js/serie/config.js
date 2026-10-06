// Fans of Rumble · Balance: vida, daño, costes de CAOS y demás números de cada carta, facción y torre
'use strict';
/* =========================================================
   CONFIG: every balance number lives here
   ========================================================= */
const W = 540, H = 960, RES = 3, BG_RES = 2;

const CFG = {
  // pasivas de facción
  // mazo: 1 líder + 6 unidades
  cards: {   // las claves, en su orden, van vacías; cada facción pone las suyas (serie/facciones/)
    bunny: null, squirrel: null, beaver: null, fox: null, meercat: null, junkcoon: null, mechavaca: null, necrolord: null,
    skeleton: null, zombie: null, ghostmage: null, banshee: null, skullknight: null, twitchking: null, subswarm: null,
    hypebeast: null, viralbot: null, snackmom: null, hypetrain: null, banhammer: null, epicchampion: null, cupidarcher: null,
    hoplite: null, shieldmaiden: null, thundergod: null, medusa: null, minotaur: null, cybermarine: null, nanobot: null,
    cyberninja: null, techdroid: null, hackerkid: null, neonsniper: null, siegemech: null, memelord: null, suchdog: null,
    gifblaster: null, synthcat: null, trollbot: null, stonks: null, chonkcat: null, stitchbrute: null, progamer: null, noobs: null,
    speedrunner: null, modder: null, coleccionista: null, ragequitter: null, recreativa: null, vikingo: null, swarmbug: null,
    vikingsquad: null, retromarine: null, ghostagent: null, rockracer: null, titanbeta: null, directora: null, extras: null,
    doble: null, detective: null, heroe: null, spoiler: null, kaiju: null, huron: null, sombra: null, hater: null, arpia: null,
    dron: null, clickbait: null, campero: null, espia: null, paparazzi: null, sp_bellotas: null, sp_botiquin: null, sp_pulgas: null,
    sp_lapidas: null, sp_formol: null, sp_eternas: null, sp_donaciones: null, sp_merienda: null, sp_baneo: null, sp_rayo: null,
    sp_ambrosia: null, sp_nerfeo: null, sp_orbital: null, sp_nanobots: null, sp_update: null, sp_gatos: null, sp_likes: null,
    sp_confusion: null, sp_critico: null, sp_crunch: null, sp_review: null, sp_energetica: null, sp_ping: null, sp_cartuchos: null,
    sp_parchefan: null, sp_cancelado: null, sp_taquilla: null, sp_maquillaje: null, sp_remake: null,
  },
  enemyCards: {   // las claves, en su orden, van vacías; cada facción pone las suyas (serie/facciones/)
    becario: null, starbot: null, fallen: null, cajabotin: null, soportebot: null, parchebot: null, descargabot: null,
    licenciabot: null, plusbot: null, cobradlc: null, servidorbot: null, remasterbot: null, sp_despido: null, sp_cobro: null,
  },
  units: {   // las claves, en su orden, van vacías; cada juego pone las cifras de las suyas
    squirrel: null, fox: null, bunny: null, beaver: null, meercat: null, junkcoon: null, mechavaca: null, vaca: null, necrolord: null,
    skeleton: null, zombie: null, ghostmage: null, banshee: null, twitchking: null, subswarm: null, hypebeast: null, viralbot: null,
    snackmom: null, hypetrain: null, banhammer: null, epicchampion: null, cupidarcher: null, hoplite: null, shieldmaiden: null,
    thundergod: null, medusa: null, minotaur: null, cybermarine: null, drone: null, nanobot: null, cyberninja: null, techdroid: null,
    hackerkid: null, neonsniper: null, siegemech: null, memelord: null, suchdog: null, gifblaster: null, synthcat: null,
    trollbot: null, stonks: null, chonkcat: null, skullknight: null, stitchbrute: null, becario: null, starbot: null, fallen: null,
    cajabotin: null, soportebot: null, parchebot: null, progamer: null, noobs: null, speedrunner: null, modder: null,
    coleccionista: null, ragequitter: null, recreativa: null, vikingo: null, swarmbug: null, vikingsquad: null, retromarine: null,
    ghostagent: null, rockracer: null, titanbeta: null, directora: null, extras: null, doble: null, detective: null, heroe: null,
    spoiler: null, kaiju: null, descargabot: null, licenciabot: null, plusbot: null, cobradlc: null, servidorbot: null,
    remasterbot: null, huron: null, sombra: null, hater: null, arpia: null, dron: null, clickbait: null, campero: null, espia: null,
    paparazzi: null,
  },
};

const TYPES = {   // las claves, en su orden, van vacías; cada facción pone las suyas (serie/facciones/)
  squirrel: null, fox: null, bunny: null, beaver: null, meercat: null, junkcoon: null, mechavaca: null, vaca: null, becario: null,
  starbot: null, necrolord: null, skeleton: null, zombie: null, ghostmage: null, banshee: null, skullknight: null, stitchbrute: null,
  twitchking: null, subswarm: null, hypebeast: null, viralbot: null, snackmom: null, hypetrain: null, banhammer: null,
  epicchampion: null, cupidarcher: null, hoplite: null, shieldmaiden: null, thundergod: null, medusa: null, minotaur: null,
  cybermarine: null, drone: null, nanobot: null, cyberninja: null, techdroid: null, hackerkid: null, neonsniper: null,
  siegemech: null, memelord: null, suchdog: null, gifblaster: null, synthcat: null, trollbot: null, stonks: null, chonkcat: null,
  fallen: null, cajabotin: null, soportebot: null, parchebot: null, progamer: null, noobs: null, speedrunner: null, modder: null,
  coleccionista: null, ragequitter: null, recreativa: null, vikingo: null, swarmbug: null, vikingsquad: null, retromarine: null,
  ghostagent: null, rockracer: null, titanbeta: null, directora: null, extras: null, doble: null, detective: null, heroe: null,
  spoiler: null, kaiju: null, descargabot: null, licenciabot: null, plusbot: null, cobradlc: null, servidorbot: null,
  remasterbot: null, huron: null, sombra: null, hater: null, arpia: null, dron: null, clickbait: null, campero: null, espia: null,
  paparazzi: null,
};
const TOPS = { ceo: 64, presi: 64, sp_crunch: 46, sp_review: 46, sp_bellotas: 46, sp_botiquin: 46, sp_pulgas: 46, sp_lapidas: 46, sp_formol: 46, sp_eternas: 46, sp_donaciones: 46, sp_merienda: 46, sp_baneo: 46, sp_rayo: 46, sp_ambrosia: 46, sp_nerfeo: 46, sp_orbital: 46, sp_nanobots: 46, sp_update: 46, sp_gatos: 46, sp_likes: 46, sp_confusion: 46, sp_critico: 46, sp_energetica: 46, sp_ping: 46, sp_cartuchos: 46, sp_parchefan: 46, sp_cancelado: 46, sp_taquilla: 46, sp_maquillaje: 46, sp_remake: 46, sp_despido: 46, sp_cobro: 46, p_tower: 86, p_base: 106, e_tower: 88, e_base: 140, u_tower: 84, u_base: 110, s_tower: 88, s_base: 104, h_tower: 106, h_base: 112, c_tower: 78, c_base: 102, m_tower: 90, m_base: 112, o_tower: 88, o_base: 104, y_tower: 92, y_base: 124, k_tower: 80, k_base: 108, g_tower: 82, g_base: 102 };
// por piel de edificio: [boca de disparo x, altura] y proyectil [torre, base]
const SKINS = {
  p: { tower: [0, 68], base: [0, 70], shot: ['acorn', 'carrot'], chips: ['#8b5530', '#d39a5f', '#ff7a1a'] },
  u: { tower: [0, 66], base: [0, 80], shot: ['soulfire', 'soulfire'], glow: { tower: [0, 68, 22, '94,242,160'], base: [0, 22, 30, '94,242,160'] }, chips: ['#6b6a7d', '#efeadf', '#5ef2a0'] },
  e: { tower: [-8, 76], base: [-9, 121], shot: ['laser', 'eyelaser'], chips: ['#26314d', '#3c4b72', '#33e0ff', '#c3cbe0'] },
  s: { tower: [0, 70], base: [0, 86], shot: ['heart', 'heart'], glow: { tower: [0, 70, 24, '255,220,255'] }, chips: ['#6d28d9', '#a855f7', '#22e3ff', '#f472b6'] },
  h: { tower: [0, 94], base: [0, 100], shot: ['bolt', 'bolt'], glow: { tower: [0, 97, 24, '255,190,70'], base: [0, 28, 26, '255,190,70'] }, chips: ['#f5f3ee', '#cfcac0', '#ffcb3d'] },
  c: { tower: [30, 58], base: [0, 74], shot: ['neon', 'neon'], glow: { tower: [-3.4, 55, 14, '34,227,255'], base: [0, 52, 30, '255,61,240'] }, chips: ['#4b5563', '#1f2937', '#22e3ff', '#ff3df0'] },
  m: { tower: [0, 64], base: [0, 95], shot: ['meme', 'meme'], chips: ['#e7dcc4', '#ffe14d', '#c4b5fd', '#fda4af'] },
  // v0.9.13
  o: { tower: [0, 78], base: [0, 62], shot: ['pixel', 'pixel'], glow: { tower: [0, 78, 15, '255,154,60'] }, chips: ['#b45309', '#7c3aed', '#0e7490', '#d6cfc0'] },
  y: { tower: [5, 80], base: [0, 98], shot: ['payray', 'payray'], glow: { tower: [5, 80, 15, '255,203,61'] }, chips: ['#334155', '#111827', '#ffcb3d', '#94a3b8'] },
  k: { tower: [9, 71], base: [0, 64], shot: ['popcorn', 'popcorn'], glow: { tower: [9.4, 71.4, 18, '255,240,170'], base: [27, 44, 12, '255,60,60'] }, chips: ['#e7dcc4', '#fde68a', '#dc2626', '#1f2937'] },
  g: { tower: [0, 77], base: [0, 71], shot: ['rgb', 'rgb'], glow: { tower: [0, 77, 13, '34,227,255'], base: [0, 71, 28, '124,58,237'] }, chips: ['#111827', '#22e3ff', '#ff3df0', '#7be04a'] },
};
// facciones jugables: líder fijo + 6 unidades + pasiva
const FACTIONS = {   // las nueve jugables, en su orden; Microblizz y Phony se añaden en su archivo
  animales: null, streamers: null, heroes: null, ciber: null, memes: null, gamer: null, olvidados: null, pop: null, nomuertos: null,
};
const FACTION_ORDER = ['animales', 'nomuertos', 'streamers', 'heroes', 'ciber', 'memes', 'gamer', 'olvidados', 'pop'];   // v0.9.13: la Comunidad Gamer es la facción 7
// v0.9.15: cartas del gashapón de cada facción (mata-sanadores, hechizo de daño, de cura y uno loco)
const CORP = { microblizz: 'Microblizz', phony: 'Phony' };   // las dos empresas malvadas (no son facciones corrompidas)
const isCorp = f => !!CORP[f];
const losOf = f => FACTIONS[f].los || 'los ' + FACTIONS[f].name;   // «los Olvidados», «los Gamers», «los de Cultura Pop»
const capFirst = t => t.charAt(0).toUpperCase() + t.slice(1);
const ROLES = {   // las claves, en su orden, van vacías; cada facción pone las suyas (serie/facciones/)
  twitchking: null, subswarm: null, hypebeast: null, viralbot: null, snackmom: null, hypetrain: null, banhammer: null,
  epicchampion: null, cupidarcher: null, hoplite: null, shieldmaiden: null, thundergod: null, medusa: null, minotaur: null,
  cybermarine: null, nanobot: null, cyberninja: null, techdroid: null, hackerkid: null, neonsniper: null, siegemech: null,
  memelord: null, suchdog: null, gifblaster: null, synthcat: null, trollbot: null, stonks: null, chonkcat: null, becario: null,
  starbot: null, fallen: null, cajabotin: null, soportebot: null, parchebot: null, bunny: null, squirrel: null, beaver: null,
  fox: null, meercat: null, junkcoon: null, mechavaca: null, necrolord: null, skeleton: null, zombie: null, ghostmage: null,
  banshee: null, skullknight: null, stitchbrute: null, progamer: null, noobs: null, speedrunner: null, modder: null,
  coleccionista: null, ragequitter: null, recreativa: null, vikingo: null, swarmbug: null, vikingsquad: null, retromarine: null,
  ghostagent: null, rockracer: null, titanbeta: null, directora: null, extras: null, doble: null, detective: null, heroe: null,
  spoiler: null, kaiju: null, descargabot: null, licenciabot: null, plusbot: null, cobradlc: null, servidorbot: null,
  remasterbot: null, huron: null, sombra: null, hater: null, arpia: null, dron: null, clickbait: null, campero: null, espia: null,
  paparazzi: null, sp_bellotas: null, sp_botiquin: null, sp_pulgas: null, sp_lapidas: null, sp_formol: null, sp_eternas: null,
  sp_donaciones: null, sp_merienda: null, sp_baneo: null, sp_rayo: null, sp_ambrosia: null, sp_nerfeo: null, sp_orbital: null,
  sp_nanobots: null, sp_update: null, sp_gatos: null, sp_likes: null, sp_confusion: null, sp_critico: null, sp_crunch: null,
  sp_review: null, sp_energetica: null, sp_ping: null, sp_cartuchos: null, sp_parchefan: null, sp_cancelado: null, sp_taquilla: null,
  sp_maquillaje: null, sp_remake: null, sp_despido: null, sp_cobro: null,
};
const isLeader = k => !!CFG.cards[k] && CFG.cards[k].rarity === 'leader';
const cardDef = k => CFG.cards[k] || CFG.enemyCards[k];
// invocaciones que no son carta: suben de nivel con su carta "madre"
const SUMMON_PARENT = { drone: 'cybermarine', vaca: 'mechavaca' };

