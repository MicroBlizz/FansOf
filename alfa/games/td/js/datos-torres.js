// Fans of TD · Datos de las torres: ajustes de la partida (TD), el modo contra la IA (VS), las torres de cada facción y sus pasivas
'use strict';
/* =========================================================
   Todo lo que se puede equilibrar vive aquí.
   Los nombres, el arte y los números base salen de core/js/serie/config.js:
   aquí solo se convierten en torres y oleadas.
   ========================================================= */
const TD = {
  startGold: 400,
  baseHp: 100,            // vida de La Madriguera: los enemigos que llegan la atacan hasta tirarla
  baseDmg: 22, baseCd: 0.7, // la base se defiende: dispara a los enemigos que la están golpeando
  foeHeal: 1,             // cuánto curan los enemigos sanadores respecto al original
  baseAtkCd: 1,           // cada enemigo pega a La Madriguera una vez por segundo
  sellBack: 0.6,          // al vender una torre recuperas el 60 % de lo invertido
  keepSel: 4,             // segundos que la carta sigue elegida después de poner una torre, para poner varias seguidas
  maxLevel: 3,            // hasta aquí se mejora con oro
  fuseMax: 5,             // los niveles 4 y 5 solo se consiguen fusionando dos torres iguales que se tocan
  upCost: [0, 0.8, 1.2],  // mejorar a nivel 2 cuesta el 80 % del precio; a nivel 3, el 120 %
  upDmg: 0.4,             // +40 % de daño por nivel
  upRange: 0.1,           // +10 % de alcance por nivel
  waveBonus: w => 35 + w * 6,
  earlyBonus: 0.5,        // llamar la oleada antes de tiempo: oro extra por cada segundo que te ahorras
  hpGrowth: 0.10,         // cada oleada, los enemigos tienen un 10 % más de vida
  foeHp: 0.85,            // los enemigos tienen el 85 % de la vida del original (aquí no pelean: solo andan)
  rage: { radius: 52, perAlly: 0.10, max: 5 },   // pasiva RABIA del original, ahora entre torres vecinas (las 8 casillas de alrededor)
};

// Modo VS: cada jugador defiende su campo y manda unidades al del rival.
const VS = {
  gold: 400,            // oro inicial de cada uno
  income: 20, tick: 10, // oro que recibes cada «tick» segundos
  sendCost: 22,         // oro por punto de «peso» de la unidad que envías
  incomeRate: 0.15,     // cada envío sube tu income en este % de lo que costó
  bounty: 0.4,          // las bajas dan menos oro que en campaña: aquí el oro viene del income
  steal: 1,             // la vida que tus unidades quitan a la base rival se suma a la tuya
  maxHp: 150,           // tope de vida robando
  hpDouble: 75,         // cada tantos segundos se dobla la vida de las unidades enviadas (para que la partida acabe)
  queue: 12,            // máximo de unidades esperando para salir hacia un campo
  gap: 0.45,            // segundos entre dos unidades enviadas
  upCost: [0, 3, 6],    // mejorar una unidad a nivel 2 cuesta 3 veces lo que cuesta enviarla; a nivel 3, 6 veces
  upHp: 0.6, upLeak: 0.5, // cada nivel: +60 % de vida y +50 % de daño a la base rival
  aiUp: 0.3,            // probabilidad de que el rival mejore una unidad en vez de enviarla
  aiGrace: 20,          // segundos que el rival tarda en mandarte la primera unidad
  aiDef: 0.6,           // el rival gasta este CAOS en defensa por cada 1 que gasta en unidades (enviar y mejorarlas)
  ai: { facil: 0.7, normal: 1, dificil: 1.35 },   // income del rival según la dificultad
};

// Torres de cada facción. key = carta del original (su arte y su nombre vienen de CFG.cards)
// kind: 'hit' (golpe al instante), 'shot' (proyectil), 'lob' (proyectil en arco con daño en área),
//       'stomp' (golpea a todos los que tiene alrededor), 'aura' (no ataca: mejora a las torres cercanas)
// extras de cada golpe: slow {f, t} · stun (s) · crit {every, mult, stun} · chain {n, r, f} (salta a otros enemigos) ·
//       splash (área del proyectil) · mark {t, f} (el enemigo recibe más daño) · first {mult, stun} (primer golpe a cada enemigo) ·
//       ramp {step, max} (cada golpe pega más) · fury {f, mult} (pega más si la base está tocada)
// habilidad con reloj (una por torre): jump · pulse {cd, r, stun, dmg, text} · volley {cd, n, dmg, shot, text} ·
//       teamFight {cd, r, mult} · action {cd, r, t, speed} · hack {cd, r, t} · viral {cd}
// aura: { speed } (las torres cercanas atacan más rápido) o { dmg } (pegan más)
// n: cuántos muñecos se dibujan en la peana (las cartas que en el original sacan varias unidades)
const TOWERS = {
  animales: {
    bunny:     { cost: 150, kind: 'hit',   dmg: 26, cd: 1.0, range: 85,  leader: true, jump: { cd: 8, range: 220, r: 72, dmg: 70, stun: 0.6 },
                 desc: 'Líder (solo uno). Pega fuerte y cada 8 s salta sobre el grupo más grande: daño en área y los deja aturdidos.' },
    squirrel:  { cost: 50, kind: 'shot',  dmg: 11, cd: 0.42, range: 105, shot: 'nut', n: 2,
                 desc: 'Dos ardillas que tiran bellotas a toda velocidad. Baratas y nunca paran.' },
    beaver:    { cost: 70, kind: 'lob',   dmg: 38, cd: 1.9, range: 115, splash: 48, shot: 'dyn',
                 desc: 'Lanza cartuchos de dinamita: daño en área, ideal para los grupos de becarios.' },
    fox:       { cost: 85, kind: 'hit',   dmg: 30, cd: 1.1, range: 95, crit: { every: 3, mult: 3 },
                 desc: 'Ataca desde las sombras: cada tercer golpe hace el triple. Perfecta contra los tanques.' },
    meercat:   { cost: 80, kind: 'aura',  dmg: 0,  cd: 1,   range: 95, aura: { speed: 0.3 },
                 desc: 'La enfermera no pega: las torres que tiene alrededor atacan un 30 % más rápido.' },
    junkcoon:  { cost: 110, kind: 'lob',   dmg: 34, cd: 1.5, range: 145, splash: 44, shot: 'trash', slow: { f: 0.6, t: 1.2 },
                 desc: 'Bolsas de basura desde muy lejos: daño en área y los enemigos pringados van más lentos.' },
    mechavaca: { cost: 160, kind: 'stomp', dmg: 46, cd: 1.4, range: 72, slow: { f: 0.5, t: 1 },
                 desc: 'Un mecha rosa con una vaca dentro. Cada pisotón golpea a todos los que tiene cerca y los frena.' },
  },
  nomuertos: {
    necrolord:   { cost: 150, kind: 'shot',  dmg: 32, cd: 1.2, range: 115, shot: 'shadow', leader: true, volley: { cd: 8, n: 2, dmg: 60, shot: 'skull', text: '¡ARRIBA, HUESOS!' },
                   desc: 'Líder (solo uno). Lanza rayos de sombra y cada 8 s levanta 2 esqueletos que se lanzan contra los enemigos.' },
    skeleton:    { cost: 45, kind: 'hit',   dmg: 10, cd: 0.4, range: 62, n: 3,
                   desc: 'Esqueletos piratas: pegan poco pero rapidísimo. Lo más barato para levantar muros.' },
    zombie:      { cost: 60, kind: 'hit',   dmg: 26, cd: 1.0, range: 66, n: 2,
                   desc: 'Programadores zombis. Lentos, pero cada mordisco duele.' },
    ghostmage:   { cost: 90, kind: 'shot',  dmg: 32, cd: 1.3, range: 125, shot: 'frost', slow: { f: 0.5, t: 1.2 },
                   desc: 'Rayos de escarcha desde lejos: cada impacto frena al enemigo.' },
    banshee:     { cost: 120, kind: 'shot',  dmg: 22, cd: 1.2, range: 95, shot: 'wave', splash: 36, pulse: { cd: 7, r: 95, stun: 1.2, text: '¡AAAAAH!', col: '230,220,255' },
                   desc: 'Sus ondas golpean en área y cada 7 s grita y aturde a todos los enemigos cercanos.' },
    skullknight: { cost: 100, kind: 'hit',   dmg: 44, cd: 1.2, range: 72, slow: { f: 0.5, t: 1.6 },
                   desc: 'Espada rúnica de hielo: golpes fuertes que dejan al enemigo a media velocidad.' },
    stitchbrute: { cost: 160, kind: 'stomp', dmg: 66, cd: 1.6, range: 80,
                   desc: 'Una mole cosida a trozos. Cada golpe revienta a todos los que tiene alrededor.' },
  },
  streamers: {
    twitchking:  { cost: 150, kind: 'hit',   dmg: 36, cd: 1.0, range: 80, leader: true, aura: { dmg: 0.3, r: 100 },
                   desc: 'Líder (solo uno). Pega fuerte y, mientras está en directo, las torres cercanas hacen un 30 % más de daño.' },
    subswarm:    { cost: 50, kind: 'hit',   dmg: 13, cd: 0.45, range: 64, n: 3,
                   desc: 'Tres suscriptores con dedo de espuma. Baratos, rápidos y muy entregados.' },
    hypebeast:   { cost: 75, kind: 'hit',   dmg: 22, cd: 0.5, range: 70,
                   desc: 'Hasta arriba de bebida energética: pega rapidísimo.' },
    viralbot:    { cost: 95, kind: 'shot',  dmg: 24, cd: 1.1, range: 120, shot: 'clip', stun: 0.4,
                   desc: 'Cámara voladora: cada clip que graba deja al enemigo aturdido un instante.' },
    snackmom:    { cost: 80, kind: 'aura',  dmg: 0,  cd: 1,   range: 95, aura: { speed: 0.3 },
                   desc: 'Reparte bocadillos: las torres que tiene alrededor atacan un 30 % más rápido.' },
    hypetrain:   { cost: 120, kind: 'hit',   dmg: 78, cd: 1.3, range: 75,
                   desc: 'El tren del hype: un golpe enorme a un solo enemigo. Ideal contra los grandes.' },
    banhammer:   { cost: 160, kind: 'stomp', dmg: 44, cd: 1.4, range: 76, stun: 0.3,
                   desc: 'El moderador: cada martillazo golpea a todos alrededor y los deja parados un momento.' },
  },
  heroes: {
    epicchampion:{ cost: 150, kind: 'hit',   dmg: 38, cd: 1.1, range: 82, leader: true, teamFight: { cd: 8, r: 110, mult: 1.5 },
                   desc: 'Líder (solo uno). Cada 8 s grita ¡Team Fight! y todas las torres cercanas dan a la vez un golpe extra con +50 % de daño.' },
    cupidarcher: { cost: 50, kind: 'shot',  dmg: 14, cd: 0.7, range: 125, shot: 'arrow',
                   desc: 'Un querubín con arco: flechas rápidas desde lejos. Barato y fiable.' },
    hoplite:     { cost: 65, kind: 'hit',   dmg: 15, cd: 0.5, range: 78, n: 3,
                   desc: 'Tres soldados con lanza larga: llegan más lejos que otras torres de cuerpo a cuerpo.' },
    shieldmaiden:{ cost: 80, kind: 'hit',   dmg: 26, cd: 1.1, range: 70, stun: 0.3,
                   desc: 'Golpea con el escudo: cada golpe deja al enemigo parado un instante.' },
    thundergod:  { cost: 120, kind: 'hit',   dmg: 32, cd: 1.5, range: 115, bolt: true, chain: { n: 2, r: 75, f: 0.7 },
                   desc: 'Su rayo salta del objetivo a otros 2 enemigos cercanos.' },
    medusa:      { cost: 120, kind: 'shot',  dmg: 22, cd: 1.2, range: 100, shot: 'venom', pulse: { cd: 8, r: 100, stun: 1.4, text: '¡MIRADA DE PIEDRA!', col: '200,215,190' },
                   desc: 'Escupe veneno y cada 8 s se baja las gafas de sol y petrifica a los enemigos cercanos.' },
    minotaur:    { cost: 160, kind: 'hit',   dmg: 62, cd: 1.4, range: 76, first: { mult: 2.2, stun: 0.8 },
                   desc: 'Embestida: su primer golpe a cada enemigo hace más del doble y lo aturde.' },
  },
  ciber: {
    cybermarine: { cost: 150, kind: 'shot',  dmg: 15, cd: 0.4, range: 115, shot: 'bullet', leader: true, volley: { cd: 9, n: 2, dmg: 65, shot: 'drone', text: '¡ORBITAL DROP!' },
                   desc: 'Líder (solo uno). Fusil rápido y cada 9 s le caen del cielo 2 drones que se estrellan contra los enemigos.' },
    nanobot:     { cost: 45, kind: 'hit',   dmg: 9, cd: 0.35, range: 62, n: 3,
                   desc: 'Robots diminutos que muerden sin parar. Lo más barato para levantar muros.' },
    cyberninja:  { cost: 80, kind: 'hit',   dmg: 26, cd: 0.75, range: 105,
                   desc: 'Se teletransporta para dar el golpe: cuerpo a cuerpo con mucho alcance.' },
    techdroid:   { cost: 80, kind: 'aura',  dmg: 0,  cd: 1,   range: 95, aura: { speed: 0.3 },
                   desc: 'Droide de soporte: las torres que tiene alrededor atacan un 30 % más rápido.' },
    hackerkid:   { cost: 100, kind: 'shot',  dmg: 16, cd: 1.0, range: 105, shot: 'code', hack: { cd: 8, r: 150, t: 2.5 },
                   desc: 'Cada 8 s hackea al enemigo más duro que tenga cerca y lo deja 2,5 s parado.' },
    neonsniper:  { cost: 130, kind: 'shot',  dmg: 92, cd: 2.4, range: 200, shot: 'snipe', pspeed: 900,
                   desc: 'Francotiradora: dispara despacio, pero desde lejísimos y con muchísimo daño.' },
    siegemech:   { cost: 160, kind: 'lob',   dmg: 52, cd: 2.0, range: 150, splash: 50, shot: 'shell',
                   desc: 'Mecha de asedio: cañonazos con daño en área desde muy lejos.' },
  },
  memes: {
    memelord:    { cost: 150, kind: 'shot',  dmg: 28, cd: 1.1, range: 105, shot: 'card', leader: true, viral: { cd: 7 },
                   desc: 'Líder (solo uno). Cada 7 s juega una carta al azar: bola de fuego, aturdir, CAOS o una jauría de perros.' },
    suchdog:     { cost: 50, kind: 'hit',   dmg: 16, cd: 0.5, range: 68, n: 2,
                   desc: 'Dos perros muy wow. Baratos y muerden rápido.' },
    gifblaster:  { cost: 70, kind: 'shot',  dmg: 10, cd: 0.3, range: 110, shot: 'gif',
                   desc: 'Dispara GIFs en bucle a toda velocidad. Poco daño por disparo, pero no para.' },
    synthcat:    { cost: 90, kind: 'lob',   dmg: 32, cd: 1.4, range: 115, splash: 40, shot: 'note',
                   desc: 'Un gato con teclado: sus notas explotan en área. Nadie sabe por qué.' },
    trollbot:    { cost: 100, kind: 'hit',   dmg: 16, cd: 1.0, range: 80, pulse: { cd: 5, r: 80, stun: 1.0, text: '¡U MAD?', col: '160,230,150' },
                   desc: 'Cada 5 s provoca a los enemigos cercanos, que se paran a discutir con él.' },
    stonks:      { cost: 120, kind: 'hit',   dmg: 22, cd: 1.0, range: 75, ramp: { step: 0.15, max: 10 },
                   desc: 'Cada golpe pega un 15 % más que el anterior (hasta +150 %) mientras tenga a quién pegar.' },
    chonkcat:    { cost: 160, kind: 'stomp', dmg: 36, cd: 1.4, range: 74, pulse: { cd: 6, r: 74, stun: 0.8, dmg: 45, text: '¡SE SIENTA!', col: '255,220,150' },
                   desc: 'Un gato enorme: golpea a todos alrededor y cada 6 s se sienta encima y los aturde.' },
  },
  gamer: {
    progamer:    { cost: 150, kind: 'hit',   dmg: 18, cd: 0.45, range: 80, leader: true, crit: { every: 4, mult: 3, stun: 0.6, text: '¡COMBO!' },
                   desc: 'Líder (solo uno). Ataca rapidísimo y cada 4.º golpe es un ¡COMBO!: triple de daño y aturde.' },
    noobs:       { cost: 45, kind: 'hit',   dmg: 10, cd: 0.5, range: 62, n: 3,
                   desc: 'Tres novatos con gorro de hélice. No saben jugar, pero son baratos y le ponen ganas.' },
    speedrunner: { cost: 75, kind: 'hit',   dmg: 21, cd: 0.4, range: 72,
                   desc: 'Nadie es más rápida: golpes sin parar.' },
    modder:      { cost: 80, kind: 'aura',  dmg: 0,  cd: 1,   range: 95, aura: { speed: 0.3 },
                   desc: 'Arregla el juego mejor que la empresa: las torres cercanas atacan un 30 % más rápido.' },
    coleccionista:{ cost: 110, kind: 'shot', dmg: 30, cd: 1.2, range: 120, shot: 'disc', chain: { n: 1, r: 80, f: 0.6 },
                   desc: 'Lanza sus juegos en disco: cada disco rebota a otro enemigo cercano.' },
    ragequitter: { cost: 110, kind: 'hit',   dmg: 28, cd: 1.0, range: 72, pulse: { cd: 9, r: 80, stun: 0, dmg: 110, text: '¡RAGE QUIT!', col: '255,90,90' },
                   desc: 'Cada 9 s se enfada, tira el mando y explota: 110 de daño a todos los que tiene cerca.' },
    recreativa:  { cost: 160, kind: 'stomp', dmg: 38, cd: 1.3, range: 76, volley: { cd: 8, n: 2, dmg: 45, shot: 'coin', text: '¡INSERT COIN!' },
                   desc: 'Una máquina arcade con piernas: golpea a todos alrededor y cada 8 s dispara 2 monedas.' },
  },
  olvidados: {
    vikingo:     { cost: 150, kind: 'hit',   dmg: 32, cd: 1.0, range: 80, leader: true, pulse: { cd: 8, r: 100, stun: 1.2, text: '¡MURO DE ESCUDOS!', col: '255,215,120' },
                   desc: 'Líder (solo uno). Cada 8 s levanta un muro de escudos que deja parados a los enemigos cercanos.' },
    swarmbug:    { cost: 45, kind: 'hit',   dmg: 8, cd: 0.3, range: 62, n: 3,
                   desc: 'Bichos de un juego que nunca salió. Baratísimos y con muchas ganas de morder.' },
    vikingsquad: { cost: 65, kind: 'hit',   dmg: 16, cd: 0.55, range: 70, n: 3,
                   desc: 'Tres vikingos con escudo y espada. Fiables en cualquier muro.' },
    retromarine: { cost: 85, kind: 'shot',  dmg: 11, cd: 0.32, range: 115, shot: 'bullet',
                   desc: 'Marine espacial de 1998: ráfagas rapidísimas desde lejos.' },
    ghostagent:  { cost: 130, kind: 'shot',  dmg: 84, cd: 2.4, range: 190, shot: 'snipe', pspeed: 900,
                   desc: 'Francotirador invisible: dispara despacio, desde muy lejos y con muchísimo daño.' },
    rockracer:   { cost: 110, kind: 'lob',   dmg: 42, cd: 1.4, range: 125, splash: 38, shot: 'missile',
                   desc: 'Un coche de carreras con lanzamisiles: daño en área.' },
    titanbeta:   { cost: 160, kind: 'stomp', dmg: 44, cd: 1.4, range: 78, fury: { f: 0.5, mult: 1.5 },
                   desc: 'Golpea a todos alrededor. Si tu base baja de la mitad de vida, se enfada y pega un 50 % más.' },
  },
  pop: {
    directora:   { cost: 150, kind: 'shot',  dmg: 26, cd: 1.1, range: 110, shot: 'wave', leader: true, action: { cd: 8, r: 110, t: 4, speed: 0.4 },
                   desc: 'Líder (solo uno). Cada 8 s grita ¡ACCIÓN! y las torres cercanas atacan un 40 % más rápido durante 4 s.' },
    extras:      { cost: 45, kind: 'hit',   dmg: 9, cd: 0.35, range: 62, n: 3,
                   desc: 'Extras con disfraz de cartón. Cobran poco: lo más barato para levantar muros.' },
    doble:       { cost: 80, kind: 'hit',   dmg: 26, cd: 0.75, range: 105,
                   desc: 'El doble de acción salta hasta el enemigo: cuerpo a cuerpo con mucho alcance.' },
    detective:   { cost: 95, kind: 'shot',  dmg: 20, cd: 1.1, range: 125, shot: 'bullet', mark: { t: 4, f: 0.25 },
                   desc: 'Encuentra el punto débil: cada disparo marca al enemigo 4 s y todas las torres le hacen un 25 % más de daño.' },
    heroe:       { cost: 100, kind: 'hit',   dmg: 32, cd: 0.9, range: 100,
                   desc: 'Superhéroe de película barata: vuela hasta el enemigo y pega fuerte.' },
    spoiler:     { cost: 120, kind: 'shot',  dmg: 20, cd: 1.1, range: 95, shot: 'paper', pulse: { cd: 7, r: 95, stun: 1.3, text: '¡SPOILER!', col: '255,240,180' },
                   desc: 'Tira periódicos y cada 7 s grita el final de la película: los enemigos cercanos se quedan en shock.' },
    kaiju:       { cost: 160, kind: 'stomp', dmg: 52, cd: 1.5, range: 82,
                   desc: 'Un monstruo de goma: cada pisotón golpea a todos los que tiene alrededor.' },
  },
};

// Pasiva de cada raza, adaptada a la defensa de torres (el nombre es el del original)
const PASSIVES = {
  animales:  { txt: 'Cada torre pega un 10 % más por cada torre aliada en las casillas de alrededor, hasta +50 %.' },
  nomuertos: { txt: 'Los no-muertos siempre vuelven: al vender una torre recuperas todo el CAOS, así que puedes rehacer el laberinto gratis.' },
  streamers: { per: 10, step: 0.05, max: 5, txt: 'Cada 10 bajas, todas tus torres atacan un 5 % más rápido (hasta +25 %).' },
  heroes:    { per: 12, step: 0.05, max: 5, txt: 'Cada 12 bajas subes de nivel: +5 % de daño a todas tus torres (hasta nivel 5).' },
  ciber:     { amt: 25, delay: 3, regen: 6, txt: 'Tu base lleva un escudo de plasma de 25 que se recarga si pasa 3 s sin recibir daño.' },
  memes:     { muts: { giant: { dmg: 1.25, scale: 1.18 }, turbo: { cd: 0.75 }, glass: { dmg: 1.6, range: 0.8 }, normal: {} },
               txt: 'Cada torre sale con una mutación al azar: gigante (+25 % de daño), turbo (ataca más rápido), de cristal (+60 % de daño, menos alcance) o normal.' },
  gamer:     { step: 0.05, max: 6, txt: 'Todas tus torres pegan un 5 % más por cada tipo distinto de torre que tengas en el campo (hasta +30 %).' },
  olvidados: { mult: 2, txt: 'Nadie se acuerda de ellos: el primer golpe de cada torre a cada enemigo hace el doble de daño.' },
  pop:       { chance: 0.3, mult: 0.5, txt: 'Toda buena película tiene secuela: 3 de cada 10 ataques se repiten enseguida con la mitad de daño.' },
};

