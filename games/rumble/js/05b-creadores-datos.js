// Fans of Rumble · Campaña 3 «Fin de la partida»: IAhorro (la IA del ahorro… de sueldos) y la facción 10, Los Creadores
'use strict';
/* ---------- v0.9.23 ----------
   Microblizz y Phony se juntan y compran IAhorro, una IA que «hace juegos sola». Despiden a programadores,
   diseñadores y artistas, y sacan juegos idénticos cada cinco minutos. Los fans tienen que apagarla.
   · 4 mundos (13 a 16): La Granja de Prompts, El Almacén de Datos, El Estudio Vacío y El Núcleo de IAhorro.
   · IAhorro es la tercera empresa rival (como Microblizz y Phony). Su pasiva, ENTRENADA CON TU TRABAJO:
     cada 25 s copia la última unidad que has sacado y la pone de su lado (en gris, con el 70 % de fuerza).
   · Al ganar a IAhorro se unen Los Creadores (facción 10). Su pasiva, SIN CRUNCH: si una unidad pasa 3 s sin
     recibir daño, descansa y se cura un 2 % de su vida por segundo.
   Este archivo va justo después de 05-audio.js: añade datos a las tablas que ya existen. */

// ---- cartas y estadísticas
Object.assign(CFG.enemyCards, {
  promptbot:  { name: 'Becario Virtual', cost: 2, count: 3 },
  copiapega:  { name: 'Copiapega', cost: 3, count: 1 },
  alucinador: { name: 'Asistente Alucinado', cost: 3, count: 1 },
  dronia:     { name: 'Dron de Contenido', cost: 4, count: 1 },
  granjaserv: { name: 'Granja de Servidores', cost: 5, count: 1 },
  clonador:   { name: 'Clonador 3000', cost: 5, count: 1 },
  sp_sustituir: { name: 'Sustitución por IA', cost: 3, count: 1, spell: { side: 'foe', kind: 'dmg', r: 75, amt: 160, bld: 0.3, fx: 'letter', col: '#7df3ff', label: '¡SUSTITUIDO!' } },
});
Object.assign(CFG.cards, {
  indie:        { name: 'IndieDev', cost: 5, count: 1, respawn: 12, rarity: 'leader', rar: 'Líder', tag: '¡Hotfix!', desc: 'Hizo un juego entero ella sola, en su cuarto. Dispara líneas de código y cada 8 s lanza un ¡HOTFIX!: cura 70 a los aliados cercanos y les quita los aturdimientos. Si cae, vuelve a los 12 s.' },
  jam:          { name: 'Game Jam', cost: 2, count: 3, rarity: 'common', rar: 'Común', tag: 'Salen 3', desc: 'Tres creadores que han hecho un juego en 48 horas. Rápidos y con mucho café.' },
  tester:       { name: 'Tester de QA', cost: 3, count: 1, rarity: 'rare', rar: 'Rara', tag: 'Encuentra bugs', desc: 'Lo rompe todo antes que nadie: recibe un 30 % menos de daño y marca a lo que golpea (tu equipo le hace un 20 % más durante 4 s).' },
  pixelartista: { name: 'Pixelartista', cost: 3, count: 1, rarity: 'common', rar: 'Común', tag: 'A distancia', desc: 'Dibuja a mano, píxel a píxel. Lanza píxeles que salpican a los de alrededor.' },
  compositora:  { name: 'Compositora', cost: 3, count: 1, rarity: 'rare', rar: 'Rara', tag: 'Banda sonora', desc: 'Su música épica anima a los de alrededor: los aliados cercanos pegan un 20 % más.' },
  disenadora:   { name: 'Diseñadora de Niveles', cost: 4, count: 1, rarity: 'rare', rar: 'Rara', tag: '¡Rediseño!', desc: 'Cada 8 s rediseña el nivel bajo los pies del enemigo: aturde 1 s a los que tiene cerca.' },
  prototipo:    { name: 'El Prototipo', cost: 5, count: 1, rarity: 'epic', rar: 'Épica', tag: 'Tanque + jam', desc: 'Un robot gigante hecho con cinta americana y mucho cariño. Aguanta muchísimo y, cuando cae, salen 2 creadores de la Game Jam a por la segunda versión.' },
  freelance:    { name: 'Freelance', cost: 3, count: 1, rarity: 'epic', rar: 'Épica', tag: 'Mata-sanadores', desc: 'Trabaja por su cuenta y va directo al grano: salta a por el sanador o el tirador enemigo y les hace el doble de daño.', gacha: true, fac: 'creadores' },
  sp_portfolio: { name: 'Lluvia de portfolios', cost: 3, count: 1, rarity: 'rare', rar: 'Rara', tag: 'Hechizo · daño', desc: 'Llueven portfolios de gente despedida (y con mucho talento): 160 de daño en la zona. A los sanadores, un 50 % más.', gacha: true, fac: 'creadores', spell: { side: 'foe', kind: 'dmg', r: 80, amt: 160, bld: 0.35, fx: 'letter', col: '#ffe06a' } },
  sp_gamejam:   { name: '48 horas de Jam', cost: 3, count: 1, rarity: 'rare', rar: 'Rara', tag: 'Hechizo · cura', desc: 'Pizza, café y ganas: cura 110 a tus tropas de la zona y atacan un 30 % más rápido durante 5 s.', gacha: true, fac: 'creadores', spell: { side: 'ally', kind: 'heal', r: 85, amt: 110, haste: 5, fx: 'can', col: '#ff9a3c' } },
  sp_creditos:  { name: 'Créditos finales', cost: 4, count: 1, rarity: 'legendary', rar: 'Legendaria', tag: 'Hechizo · loco', desc: 'Salen los créditos con el nombre de toda la gente que hizo el juego. Los enemigos de la zona se quedan 3 s leyéndolos sin hacer nada.', gacha: true, fac: 'creadores', spell: { side: 'foe', kind: 'stun', r: 85, t: 3, sk: 'update', fx: 'bar', col: '#fff6ea', label: 'GRACIAS POR JUGAR' } },
});
Object.assign(CFG.units, {
  promptbot:  { hp: 100, dmg: 11, cd: 0.9, range: 6,   speed: 50, r: 10, sight: 110 },
  copiapega:  { hp: 220, dmg: 21, cd: 1.15, range: 105, speed: 36, r: 13, sight: 150, ranged: 'card' },
  alucinador: { hp: 210, dmg: 8,  cd: 1.0, range: 8,   speed: 30, r: 13, sight: 110, healer: true, heal: 15, healCd: 1.8, healR: 95 },
  dronia:     { hp: 480, dmg: 38, cd: 1.3, range: 8,   speed: 42, r: 15, sight: 140, buildings: true },
  granjaserv: { hp: 920, dmg: 24, cd: 1.3, range: 10,  speed: 25, r: 22, sight: 140, pulse: { cd: 9, r: 75, stun: 1, kind: 'daze', text: '¡ACTUALIZANDO!', color: 'rgba(125,243,255,.95)', tc: '#a5f3fc', sfx: 'womp' } },
  clonador:   { hp: 760, dmg: 28, cd: 1.3, range: 10,  speed: 28, r: 20, sight: 140, eject: 'promptbot', ejectN: 2, ejectTxt: '¡VERSIÓN 2.0!' },
  indie:        { hp: 560, dmg: 24, cd: 1.0, range: 95,  speed: 36, r: 18, sight: 150, ranged: 'bullet', hotfix: { cd: 8, r: 110, heal: 70 } },
  jam:          { hp: 88,  dmg: 11, cd: 0.85, range: 6,  speed: 52, r: 10, sight: 110 },
  tester:       { hp: 430, dmg: 17, cd: 1.1, range: 10,  speed: 34, r: 15, sight: 130, armor: 0.3, mark: { t: 4, f: 0.2 } },
  pixelartista: { hp: 190, dmg: 21, cd: 1.15, range: 110, speed: 36, r: 13, sight: 150, ranged: 'pixel', splash: 30 },
  compositora:  { hp: 230, dmg: 12, cd: 1.0, range: 90,  speed: 34, r: 13, sight: 140, ranged: 'heart', aura: { r: 100, mult: 1.2 } },
  disenadora:   { hp: 270, dmg: 18, cd: 1.15, range: 100, speed: 34, r: 13, sight: 150, ranged: 'bullet', pulse: { cd: 8, r: 80, stun: 1, kind: 'daze', text: '¡REDISEÑO!', color: 'rgba(255,203,61,.95)', tc: '#ffe06a', sfx: 'womp' } },
  prototipo:    { hp: 1000, dmg: 30, cd: 1.3, range: 10, speed: 26, r: 22, sight: 140, eject: 'jam', ejectN: 2, ejectTxt: '¡SEGUNDA ITERACIÓN!' },
  freelance:    { hp: 220, dmg: 22, cd: 1.0, range: 8,   speed: 48, r: 13, sight: 140, leap: { range: 250, cd: 9, mult: 2 } },
});
Object.assign(TYPES, {
  promptbot: { top: 36, foot: '#334155' }, copiapega: { top: 46, foot: '#1e293b' }, alucinador: { top: 42, foot: null, hover: true, jet: true },
  dronia: { top: 40, foot: null, hover: true, jet: true }, granjaserv: { top: 66, foot: '#0f172a' }, clonador: { top: 60, foot: '#1e293b' },
  indie: { top: 56, foot: '#1f2937' }, jam: { top: 34, foot: '#1f2937' }, tester: { top: 48, foot: '#1f2937' }, pixelartista: { top: 46, foot: '#1f2937' },
  compositora: { top: 48, foot: '#1f2937' }, disenadora: { top: 48, foot: '#1f2937' }, prototipo: { top: 66, foot: '#44403c' }, freelance: { top: 46, foot: '#1f2937' },
});
Object.assign(TOPS, { iahorro: 64, sp_sustituir: 46, sp_portfolio: 46, sp_gamejam: 46, sp_creditos: 46, i_tower: 90, i_base: 120, r_tower: 84, r_base: 104 });
Object.assign(ROLES, { promptbot: 'swarm', copiapega: 'ranged', alucinador: 'support', dronia: 'buster', granjaserv: 'tank', clonador: 'tank',
  indie: 'support', jam: 'swarm', tester: 'tank', pixelartista: 'ranged', compositora: 'support', disenadora: 'control', prototipo: 'tank', freelance: 'assassin',
  sp_sustituir: 'spell', sp_portfolio: 'spell', sp_gamejam: 'spell', sp_creditos: 'spell' });
Object.assign(SKINS, {
  i: { tower: [0, 80], base: [0, 104], shot: ['laser', 'eyelaser'], glow: { tower: [0, 80, 15, '34,227,255'], base: [0, 104, 30, '34,227,255'] }, chips: ['#1e293b', '#334155', '#22e3ff', '#e2e8f0'] },
  r: { tower: [0, 74], base: [0, 84], shot: ['pixel', 'pixel'], glow: { tower: [0, 74, 14, '255,154,60'] }, chips: ['#7c3aed', '#ff9a3c', '#fff6ea', '#22c55e'] },
});

// ---- facciones
FACTIONS.iahorro = { name: 'IAhorro', pname: 'Entrenada con tu trabajo', leader: null, units: ['promptbot', 'copiapega', 'alucinador', 'dronia', 'granjaserv', 'clonador'], skin: 'i', base: 'IAHORRO', passive: 'ENTRENADA CON TU TRABAJO', kind: 'enemy', end: 'el Núcleo de IAhorro', spells: ['sp_sustituir'] };
CORP.iahorro = 'IAhorro';
FACTIONS.creadores = { name: 'Los Creadores', los: 'los Creadores', corr: 'Creadores corrompidos', pname: 'Sin crunch', leader: 'indie', units: ['jam', 'tester', 'pixelartista', 'compositora', 'disenadora', 'prototipo'], skin: 'r', base: 'EL ESTUDIO INDIE', passive: 'SIN CRUNCH', chip: 'DESCANSO', pkey: 'nocrunch',
  passiveText: 'Aquí no se hace crunch: si una unidad pasa 3 s sin recibir daño, descansa y se cura un 2 % de su vida por segundo.', banner: 'Tras 3 s sin recibir daño, tus unidades descansan y se curan un 2 % por segundo', trio: ['tester', 'indie', 'prototipo'], kind: 'creadores', end: 'tu Estudio indie', icon: 'star', trioH: [100, 150, 132],
  gacha: ['freelance', 'sp_portfolio', 'sp_gamejam', 'sp_creditos'] };
FACTION_ORDER.push('creadores');
FAC_BAL.creadores = { hp: 1.16, dmg: 1.13 };
CFG.passives.iahorro = { name: 'ENTRENADA CON TU TRABAJO', every: 25, power: 0.7 };
CFG.passives.creadores = { name: 'SIN CRUNCH', after: 3, regen: 0.02 };
THEMES.creadores = { grad: ['#6fb45a', '#76bc60', '#62a84e'], greens: ['#4f9a3f', '#62ac4c', '#8fd06a', '#438a35', '#a2dc7c'], hedge: ['#3f8a35', '#5fae4a'], cap: '#ff9a3c', capDot: '#fff6ea', title: ['#62ac4c', '#8fd06a'] };

// ---- objeto de facción
ITEMS.taza_indie = { name: 'Taza «Sin crunch»', slot: 'acc', rar: 'legendary', fac: 'creadores', st: [18, 1.2], desc: '+{0} % de daño y se cura un {1} % de su vida cada segundo. Pone «Me voy a mi hora».' };
FAC_ITEM.creadores = 'taza_indie';

// ---- campaña 3: 4 mundos
WORLDS.push(
  { camp: 3, openAfter: '12-4', name: 'La Granja de Prompts', efac: 'iahorro', story: 'Microblizz y Phony se han juntado para comprar IAhorro, la IA del ahorro… de sueldos. Han despedido a todo el estudio: ahora unas pantallas escriben juegos solas, uno cada cinco minutos, y todos son iguales.', levels: [
    { name: 'Puestos vacíos', elvl: 9, income: 0.86, deck: ['promptbot', 'copiapega', 'alucinador'] },
    { name: 'Juegos en serie', elvl: 9, income: 0.9, deck: ['promptbot', 'copiapega', 'alucinador', 'dronia'] },
    { name: 'El prompt definitivo', elvl: 9, income: 0.93, deck: ['promptbot', 'copiapega', 'alucinador', 'dronia', 'granjaserv'] },
    { name: 'Generador de Clones', elvl: 10, income: 0.95, boss: 'Generador de Clones' }] },
  { camp: 3, name: 'El Almacén de Datos', efac: 'ciber', story: 'IAhorro se entrena con todo lo que encuentra… sin pedir permiso. Ha obligado a los Ciberpunks a vigilar sus servidores, llenos de juegos copiados.', levels: [
    { name: 'Pasillo de servidores', elvl: 9, income: 0.86 }, { name: 'Datos sin permiso', elvl: 9, income: 0.9 }, { name: 'La sala fría', elvl: 10, income: 0.93 }, { name: 'CyberMarine entrenado', elvl: 10, income: 0.96, boss: 'CyberMarine entrenado' }] },
  { camp: 3, name: 'El Estudio Vacío', efac: 'streamers', story: 'Sillas vacías y arte con seis dedos. IAhorro ha cambiado a los streamers por copias generadas: todas con la misma cara, la misma voz y el mismo chiste.', levels: [
    { name: 'Arte con seis dedos', elvl: 9, income: 0.88 }, { name: 'Doblaje sintético', elvl: 10, income: 0.92 }, { name: 'Directo de nadie', elvl: 10, income: 0.95 }, { name: 'StreamKing generado', elvl: 10, income: 0.98, boss: 'StreamKing generado' }] },
  { camp: 3, name: 'El Núcleo de IAhorro', efac: 'iahorro', unlock: 'creadores', story: 'El corazón de IAhorro. Cuanto más juegos copia, más grande se hace. Los programadores, diseñadores y artistas despedidos esperan fuera: si la apagas, se unen a ti.', levels: [
    { name: 'Centro de datos', elvl: 10, income: 0.95 }, { name: 'Sala de entrenamiento', elvl: 10, income: 0.98 }, { name: 'El último prompt', elvl: 10, income: 1 }, { name: 'IAhorro', elvl: 10, income: 1.05, boss: 'IAhorro' }] },
);
WORLDS.forEach((w, wi) => w.levels.forEach((l, li) => { l.id = `${wi + 1}-${li + 1}`; l.wi = wi; l.li = li; }));
const IA_FIRST = 12, IA_FINAL = 15;   // mundos de la campaña 3 (empezando por 0)
BOSS_HP.push(13000, 13500, 14000, 15000);
BOSS_ART.push('i_base', 'cybermarine', 'twitchking', 'iahorro');
BOSS_SHORT.push('Clones', 'CyberMarine 2', 'StreamKing IA', 'IAhorro');

// ---- frases
QUIPS.iahorro = ['Error 404: alma no encontrada', 'He sido entrenado para esto', 'Como modelo de lenguaje, me rindo', 'Regenerando respuesta…', 'Mi contexto se ha llenado', 'Esto no estaba en mis datos', 'Prompt rechazado', 'Volveré en la versión 5'];
QUIPS.corruptIa = ['¡Por fin libre!', 'Ya no tengo que copiar a nadie', 'Vuelvo a tener mi cara', '¿Dónde está mi personalidad?', 'IAhorro me prometió «eficiencia»', '¡Me desconecto!'];
QUIPS_FAC.creadores = ['¡Me voy a mi hora!', 'Esto lo hice a mano', 'Guardé la partida', 'Nos vemos en la secuela (si hay presupuesto)'];
QUIPS_CORRUPT.creadores = ['¡Por fin libre!', '¡Vuelvo a crear!'];
CHAT_FAC.creadores = {
  idle: ['estos sí que hacen juegos con cariño', 'la IndieDev hizo su juego en su cuarto, respeto', 'el Tester ya ha encontrado 47 bugs', 'la Compositora tiene banda sonora hasta para ir al baño', 'el Prototipo va con cinta americana y fe', 'sin crunch y siguen ganando, ¿veis?'],
  leader: ['¡HOTFIX! ¡HOTFIX!', 'la IndieDev ha salido con su café', 'parche del día 0, por fin uno bueno'],
  towerP: ['torre rediseñada', 'esa torre la ha hecho una IA, se nota', 'bug encontrado: la torre ya no existe'],
  win: ['¡los creadores vuelven!', 'hecho a mano > hecho en serie', 'créditos finales con nombres de verdad'],
};
CHAT_VS.iahorro = ['IAhorro: «puedo hacer tu juego en 5 segundos». Y se nota', 'esos bots son todos iguales', 'el Asistente Alucinado acaba de inventarse una regla', '«entrenado con tu trabajo» = copiado', 'IAhorro ha despedido a 300 personas para ahorrar en café'];
CHAT_USERS_FAC.creadores = [['DevEnPijama', '#ff9a3c'], ['PixelYCafé', '#fde68a']];
const CHAT_IA = {
  start: ['¡Empieza! Hoy apagamos a IAhorro', 'primer', 'hola desde el trabajo (que aún tengo) 👀', '¡vamos rebelión! #HechoAMano'],
  idle: ['mi juego favorito lo hizo gente, no un servidor', 'POV: eres un prompt de IAhorro', 'IAhorro ha generado 40 juegos mientras escribía esto', '¿soy yo o todos los bots son iguales?', 'yo solo vengo por la música (que la ha compuesto alguien)', 'IAhorro: «he leído todos los juegos». Sin pagar ninguno'],
  towerP: ['¡a por la siguiente!', 'una torre menos para IAhorro', '¡TORRE! 🔥', 'IAhorro: «esa torre era un error de redondeo»', 'servidor apagado 🔌'],
  towerE: ['eso ha dolido', 'uff', 'IAhorro lo celebra despidiendo a alguien más', '¡defiende ese carril!'],
  stun: ['¡los ha dejado actualizando! ⏳', 'actualización obligatoria, cómo no', 'IAhorro: «estamos mejorando el modelo»'],
  baseLowE: ['¡que se apaga! 🔌', '¡último empujón!', 'IAhorro ya está redactando el comunicado (con IA)'],
  enemyBig: ['¡cuidado, que viene {X}!', 'IAhorro saca a {X}, se viene lo gordo', '{X} en camino, ¡defiende!'],
  win: ['¡IAhorro desconectada!', 'GG EZ', '¡VAMOOOS!', '#HechoAMano', 'los creadores vuelven a casa', 'GG WP'],
  lose: ['mañana más', 'IAhorro: «he generado tu derrota en 0,3 s»', 'GG', 'nerf IAhorro', 'la próxima sí'],
  sub: ['¡te ha copiado la carta! 😡', 'entrenada con tu trabajo, literal', 'eso era mío', 'IAhorro copiando en directo'],
};
const HEADLINES_IA = {
  win: ['IAhorro pierde {c} torres: «es un problema de los datos de entrenamiento»', '{L} apaga a IAhorro con un juego hecho a mano', 'IAhorro promete «mejorar el modelo» tras perder contra gente de verdad'],
  lose: ['IAhorro gana y genera 300 notas de prensa celebrándolo', '{F} cae ante IAhorro, que ya ha copiado la partida', 'IAhorro gana: «ha sido muy eficiente»'],
  unlock: ['{U} vuelven a crear: «nadie hace esto como nosotros»', '{U} se unen a la rebelión y prometen no hacer crunch'],
};
const BOSS_QUOTE_IA = { 12: '«He generado 4.000 juegos esta mañana. Todos iguales. Todos tuyos.»', 13: '«IAhorro me ha entrenado con tus partidas. Sé lo que vas a hacer.»', 14: '«Soy el streamer perfecto: nunca me canso, nunca me quejo, nunca existo.»', 15: '«¿Para qué pagar a 300 personas si me tenéis a mí? Ahorro del 100 %.»' };
CHAT_BOSS.push(
  ['el Generador de Clones ha copiado hasta el chat', 'todos esos juegos son el mismo juego'],
  ['el CyberMarine entrenado juega igual que tú… porque te ha copiado', 'ese CyberMarine tiene seis dedos'],
  ['el StreamKing generado tiene 3 millones de seguidores bots', 'su voz es de un robot leyendo un guion'],
  ['¡IAhorro en persona!', 'IAhorro está generando su propio discurso de victoria', 'apágala, apágala', 'cuidado, que ha aprendido a copiar los hechizos'],
);

// ---- música: un tema para Los Creadores y uno para cada jefe nuevo
(() => {
  const mk = d => { d.sc = SCALES[d.scale]; d.L = d.lead.seq.map(mseq); d.B = d.bass ? mseq(d.bass.seq) : []; d.A = d.arp ? d.arp.seq.split(' ') : null; return d; };
  Object.assign(TRACKS, {
    // Los Creadores: chiptune alegre, hecho a mano
    creadores: mk({ bpm: 128, tonic: 50, scale: 'maj', prog: [0, 3, 4, 0], dv: 1,
      pad: { wave: 'triangle', vol: 0.14, lp: 1800, att: 0.04 },
      bass: { wave: 'square', vol: 0.36, lp: 900, seq: 'r . o . r . o . f . o . r . o .' },
      drums: { k: 'x...x...x...x...', s: '....x.......x...', h: '..x...x...x...xx' },
      arp: { wave: 'square', vol: 0.07, lp: 3200, oct: 14, gate: 0.35, seq: '0 1 2 1 0 1 2 3 0 1 2 1 0 2 1 0' },
      lead: { wave: 'square', vol: 0.19, gate: 0.6, lp: 3800, oct: 7, up: 7, seq: [
        '4 . 5 . 7 - 4 . 9 . 7 . 5 . 4 .', '3 . 4 . 5 - 3 . 7 . 5 . 4 . 3 .', '4 . 5 . 7 - 9 . 11 . 9 . 7 . 5 .', '7 - - . 5 . 4 . 2 . 4 . 0 - - .'] } }),
    // Generador de Clones: el mismo compás repetido hasta el infinito
    boss12: mk({ bpm: 132, tonic: 45, scale: 'min', prog: [0, 0, 0, 5], dv: 1, crash: true,
      pad: { wave: 'sawtooth', vol: 0.16, lp: 1000, att: 0.08 },
      bass: { wave: 'square', vol: 0.45, lp: 600, oct: 0, seq: 'r . r . r . r . r . r . r . r .' },
      drums: { k: 'x...x...x...x...', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' },
      arp: { wave: 'square', vol: 0.08, lp: 2600, oct: 14, gate: 0.3, seq: '0 1 2 0 1 2 0 1 2 0 1 2 0 1 2 3' },
      lead: { wave: 'square', vol: 0.18, gate: 0.5, lp: 2600, oct: 7, up: 0, seq: [
        '0 . 2 . 4 . 2 . 0 . 2 . 4 . 2 .', '0 . 2 . 4 . 2 . 0 . 2 . 4 . 2 .', '0 . 2 . 4 . 2 . 0 . 2 . 4 . 2 .', '5 . 4 . 2 . 4 . 5 . 7 - - . . .'] } }),
    // CyberMarine entrenado: darksynth con ruido de datos
    boss13: mk({ bpm: 120, tonic: 43, scale: 'phr', prog: [0, 1, 0, 6], dv: 1, crash: true,
      pad: { wave: 'sawtooth', vol: 0.2, lp: 800, att: 0.1 },
      bass: { wave: 'sawtooth', vol: 0.5, lp: 520, oct: 0, seq: 'r r . r r . r . r r . r . r o .' },
      drums: { k: 'x..x..x...x..x..', s: '....x.......x...', h: 'xxx.xxx.xxx.xxx.' },
      lead: { wave: 'sawtooth', vol: 0.2, det: 10, lp: 2400, gate: 0.8, oct: 7, up: 7, seq: [
        '0 . . 1 . . 3 . 4 - - . 3 . 1 .', '0 . . 1 . . 5 . 4 - - . 3 . 1 .', '7 . . 6 . . 4 . 3 - - . 1 . 0 .', '? . ? . ? . ? . 0 - - - - - - .'] } }),
    // StreamKing generado: pop de directo con la voz robótica (melodía plana)
    boss14: mk({ bpm: 126, tonic: 47, scale: 'min', prog: [0, 5, 3, 4], dv: 1, crash: true,
      pad: { wave: 'square', vol: 0.12, lp: 1500, att: 0.05 },
      bass: { wave: 'sawtooth', vol: 0.42, lp: 650, seq: '. . r . . . r . . . r . . . r .' },
      drums: { k: 'x...x...x...x...', c: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' },
      lead: { wave: 'square', vol: 0.18, gate: 0.9, lp: 2200, oct: 7, up: 0, seq: [
        '4 . 4 . 4 . 4 . 4 . 4 . 2 . 4 .', '4 . 4 . 4 . 4 . 5 . 4 . 2 . 0 .', '4 . 4 . 4 . 4 . 4 . 4 . 7 . 4 .', '5 . 4 . 2 . 0 . 2 - - . . . . .'] } }),
    // IAhorro: épica fría, cada vez más rápida
    boss15: mk({ bpm: 148, tonic: 46, scale: 'hmin', prog: [0, 5, 3, 4], seven: true, dv: 1, crash: true,
      pad: { wave: 'sawtooth', vol: 0.2, lp: 1000, att: 0.06 },
      bass: { wave: 'sawtooth', vol: 0.5, lp: 650, oct: 0, seq: 'r . r r . r r . r . r r . r o .' },
      drums: { k: 'x.x.x.x.x.x.x.x.', s: '....x.......x..x', h: 'xxxxxxxxxxxxxxxx' },
      arp: { wave: 'triangle', vol: 0.08, lp: 3000, oct: 14, gate: 0.4, seq: '0 1 2 3 2 1 0 1 0 1 2 3 2 1 0 3' },
      lead: { wave: 'sawtooth', vol: 0.21, det: 12, lp: 2800, gate: 0.85, oct: 7, up: 7, seq: [
        '0 . 2 . 4 . 6 - - . 4 . 2 . 0 .', '1 . 3 . 5 . 7 - - . 5 . 3 . 1 .', '4 . 6 . 7 . 9 - - . 7 . 6 . 4 .', '6 . 4 . 2 . 1 - - . 0 . 1 . 0 .'] } }),
  });
})();

