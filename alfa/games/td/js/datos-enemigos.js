// Fans of TD · Datos de los enemigos: los de cada oleada, sus rasgos, los mundos (en el orden de la historia del original) y la regla de los niveles
'use strict';

// Enemigos. hp y speed se toman de CFG.units; aquí va lo propio de la defensa de torres.
// gold: oro al tumbarlo · leak: daño que hace a tu base cada vez que la golpea · cost: lo que «pesa» en una oleada.
// Los de Microblizz van a mano; el resto (las unidades de cada raza corrompida y los bots de Phony) se calculan solos más abajo.
const FOES = {
  becario:    { gold: 7,  leak: 1, cost: 1 },
  starbot:    { gold: 10,  leak: 1, cost: 1.6 },
  soportebot: { gold: 12, leak: 1, cost: 2.4 },
  cajabotin:  { gold: 14, leak: 2, cost: 2.8, eject: 'becario', ejectN: 3 },
  fallen:     { gold: 28, leak: 4, cost: 5.5 },
  parchebot:  { gold: 30, leak: 3, cost: 6 },
  drone:      { name: 'Dron' },
  // Jefes: uno por mundo, en la última oleada del 4.º nivel. Usan el arte del original, más grande.
  // despido: deja sin atacar a la torre más cercana · summon: saca refuerzos a su lado
  survivalbot:  { gold: 200, leak: 20, art: 'fallen', name: 'SurvivalBot', hp: 6000, speed: 18, r: 30, scale: 1.65, boss: true, despido: { cd: 7, range: 170, t: 2.5, text: '¡DESPEDIDO!' } },
  b_necrolord:  { gold: 220, leak: 20, art: 'necrolord', name: 'NecroLord corrupto', hp: 5200, speed: 18, r: 30, scale: 1.6, boss: true, summon: { cd: 7, k: 'skeleton', n: 3, text: '¡ARRIBA, HUESOS!' } },
  b_twitchking: { gold: 240, leak: 20, art: 'twitchking', name: 'StreamKing corrupto', hp: 6400, speed: 20, r: 30, scale: 1.6, boss: true, despido: { cd: 6, range: 170, t: 2.5, text: '¡BANEADO!' }, summon: { cd: 10, k: 'subswarm', n: 3, text: '¡SUSCRIPTORES!' } },
  b_epicchampion: { gold: 260, leak: 20, art: 'epicchampion', name: 'EpicChampion corrupto', hp: 6200, speed: 18, r: 30, scale: 1.6, armor: 0.25, boss: true, despido: { cd: 6, range: 170, t: 3, text: '¡NERFEADO!' } },
  b_cybermarine: { gold: 280, leak: 20, art: 'cybermarine', name: 'CyberMarine corrupto', hp: 6200, speed: 18, r: 30, scale: 1.6, boss: true, summon: { cd: 8, k: 'drone', n: 2, text: '¡ORBITAL DROP!' }, despido: { cd: 9, range: 190, t: 3, text: '¡HACKEADA!' } },
  b_memelord:   { gold: 300, leak: 20, art: 'memelord', name: 'MemeLord corrupto', hp: 7000, speed: 19, r: 30, scale: 1.6, boss: true, summon: { cd: 8, k: 'suchdog', n: 2, text: '¡MUCH WOW!' }, despido: { cd: 7, range: 170, t: 2.5, text: '¡TROLEADA!' } },
  b_ceo:        { gold: 400, leak: 25, art: 'ceo', name: 'El CEO de Microblizz', hp: 9000, speed: 17, r: 30, scale: 1.5, boss: true, despido: { cd: 4.5, range: 190, t: 3, text: '¡DESPEDIDO!' }, summon: { cd: 9, k: 'becario', n: 4, text: '¡MÁS BECARIOS!' } },
  b_vikingo:    { gold: 320, leak: 20, art: 'vikingo', name: 'VikingoPerdido corrupto', hp: 6600, speed: 18, r: 30, scale: 1.6, armor: 0.35, boss: true, despido: { cd: 7, range: 170, t: 2.5, text: '¡OLVIDADA!' } },
  b_paystation: { gold: 340, leak: 20, art: 'y_base', name: 'PayStation sin lector', hp: 8500, speed: 16, r: 34, scale: 0.55, top: 90, boss: true, summon: { cd: 7, k: 'descargabot', n: 3, text: '¡DESCARGANDO!' } },
  b_progamer:   { gold: 360, leak: 20, art: 'progamer', name: 'ProGamer corrupto', hp: 6400, speed: 26, r: 30, scale: 1.6, boss: true, despido: { cd: 5, range: 170, t: 2, text: '¡COMBO!' } },
  b_directora:  { gold: 380, leak: 20, art: 'directora', name: 'LaDirectora corrupta', hp: 6800, speed: 18, r: 30, scale: 1.6, boss: true, summon: { cd: 7, k: 'extras', n: 4, text: '¡ACCIÓN!' }, despido: { cd: 9, range: 170, t: 2.5, text: '¡CORTEN!' } },
  b_presi:      { gold: 500, leak: 25, art: 'presi', name: 'El Presidente de Phony', hp: 10000, speed: 17, r: 30, scale: 1.5, boss: true, despido: { cd: 4.5, range: 190, t: 3, text: '¡COBRADA!' }, summon: { cd: 8, k: 'descargabot', n: 4, text: '¡SUSCRIPCIÓN!' } },
};
// el resto de unidades del original también pueden ser enemigos: su peso sale de la vida que tienen y de lo que corren
for (const k in CFG.units) {
  const U = CFG.units[k], F = FOES[k] || (FOES[k] = {}); if (F.cost != null) continue;
  F.cost = Math.max(0.7, Math.round((U.hp / (1 - (U.armor || 0)) / 150 * Math.max(1, U.speed / 45) + (U.healer ? 1 : 0) + (U.eject ? 0.6 : 0)) * 10) / 10);   // los rápidos pesan más
  F.gold = Math.round(4 + F.cost * 4.3); F.leak = F.cost < 2 ? 1 : F.cost < 3.5 ? 2 : F.cost < 5 ? 3 : 4;
  if (U.eject) { F.eject = U.eject; F.ejectN = U.ejectN; }
}
const foeHp = k => FOES[k].hp || CFG.units[k].hp * TD.foeHp;
const foeSpeed = k => FOES[k].speed || CFG.units[k].speed;
const foeName = k => FOES[k].name || cardDef(k).name;

// Lo que tiene de especial cada ejército enemigo (la pasiva de su raza, vuelta contra ti)
const ETRAITS = {
  animales:   { txt: 'Sin trucos: solo muerden.' },   // solo salen como enemigos en el modo VS
  microblizz: { txt: 'Robots de oficina. Sin trucos… salvo los del jefe.' },
  nomuertos:  { hpFrac: 0.6, delay: 1.1, txt: 'RENACER: cada enemigo se levanta una vez con el 60 % de su vida.' },
  streamers:  { speed: 1.2, txt: 'HYPE: todos corren un 20 % más.' },
  heroes:     { growth: 0.03, txt: 'EXPERIENCIA: se hacen más duros con cada oleada.' },
  ciber:      { frac: 0.25, delay: 3, regen: 0.5, txt: 'ESCUDOS: llevan un escudo del 25 % que se recarga si pasan 3 s sin recibir daño.' },
  memes:      { txt: 'RNG: cada enemigo sale con una mutación al azar (gigante, turbo, de cristal o normal).' },
  olvidados:  { fog: 2, txt: 'NOSTALGIA: tus torres tardan 2 s en acordarse de cada enemigo antes de dispararle.' },
  gamer:      { txt: 'COMUNIDAD: juntos son más fuertes, todos tienen mucha más vida.' },
  pop:        { chance: 0.3, hp: 0.5, scale: 0.82, txt: 'SECUELA: 3 de cada 10 enemigos vuelven en versión «2», con la mitad de vida.' },
  phony:      { steal: 2, txt: 'SUSCRIPCIÓN: cada golpe a tu base te quita además 2 de CAOS.' },
};

// Los 12 mundos de la historia del original, con sus niveles y su jefe (el 4.º nivel de cada mundo).
const WORLDS_TD = [
  { name: 'Oficinas de Microblizz', efac: 'microblizz', boss: 'survivalbot', story: 'Microblizz, una empresa millonaria, ha comprado el estudio que hacía tus juegos favoritos. Lo primero: despedir a la gente y poner robots.',
    levels: ['La compra', 'Cartas de despido', 'Cierre del estudio', 'SurvivalBot'] },
  { name: 'Cementerio de juegos', efac: 'nomuertos', boss: 'b_necrolord', story: 'Aquí entierra Microblizz los juegos que cierra. Los No-Muertos trabajan para ellos… sin cobrar.',
    levels: ['Tumbas sin nombre', 'Fosa de las horas extra', 'Mausoleo de juegos cerrados', 'NecroLord corrupto'] },
  { name: 'Plató Abandonado', efac: 'streamers', boss: 'b_twitchking', story: 'Un plató vacío. Microblizz compró el canal, echó al público y ahora solo pone anuncios.',
    levels: ['Directo sin audio', 'Caída del chat', 'Oleada de baneos', 'StreamKing corrupto'] },
  { name: 'Olimpo Abandonado', efac: 'heroes', boss: 'b_epicchampion', story: 'Desde que Microblizz compró a los dioses, nadie arregla su juego. Están de muy mal humor.',
    levels: ['Templo en obras', 'Laberinto de quejas', 'Monte olvidado', 'EpicChampion corrupto'] },
  { name: 'Sector Neón', efac: 'ciber', boss: 'b_cybermarine', story: 'Una ciudad de neón que Microblizz compró entera. Ahora todo es de pago, hasta las farolas.',
    levels: ['Callejón de neón', 'Red de drones', 'Servidor central', 'CyberMarine corrupto'] },
  { name: 'El Foro Infinito', efac: 'memes', boss: 'b_memelord', story: 'El foro de los fans. Microblizz lo compró, borró las quejas y lo llenó de anuncios.',
    levels: ['Hilo infinito', 'Borrado de quejas', 'Lluvia de anuncios', 'MemeLord corrupto'] },
  { name: 'Torre de Microblizz', efac: 'microblizz', boss: 'b_ceo', story: 'La sede de la empresa. En el último piso, el CEO cuenta sus millones mientras decide qué juego cerrar.',
    levels: ['Recepción', 'Planta de las cajas de botín', 'Despacho de los despidos', 'El CEO de Microblizz'] },
  { name: 'El Sótano de Microblizz', efac: 'olvidados', boss: 'b_vikingo', story: 'Con el CEO despedido, encuentras una puerta al sótano. Ahí guardaba Microblizz los juegos que canceló antes de que salieran. Llevan años a oscuras… y están muy enfadados.',
    levels: ['Cajas sin abrir', 'Proyectos en pausa', 'La sala de los cancelados', 'VikingoPerdido corrupto'] },
  { name: 'Tiendas sin discos', efac: 'phony', boss: 'b_paystation', story: 'Phony ha quitado el lector de discos de su consola, la PayStation. Ahora todo es digital, todo es de alquiler… y lo que compras te lo pueden borrar.',
    levels: ['La última tienda', 'Estanterías vacías', 'Devoluciones imposibles', 'PayStation sin lector'] },
  { name: 'La LAN Party', efac: 'gamer', boss: 'b_progamer', story: 'Phony ha comprado los servidores de la comunidad: ahora para jugar online hay que pagar, y los gamers ya no juegan por diversión.',
    levels: ['Mesas sin cables', 'Torneo de pago', 'Servidores cerrados', 'ProGamer corrupto'] },
  { name: 'Estudios Phony', efac: 'pop', boss: 'b_directora', story: 'En los estudios de Phony solo se ruedan secuelas, remakes y anuncios de la PayStation. Los de Cultura Pop están hartos de repetir la misma película.',
    levels: ['Rodaje del remake', 'La secuela de la secuela', 'Pase de prensa', 'LaDirectora corrupta'] },
  { name: 'Sede de Phony', efac: 'phony', boss: 'b_presi', story: 'En el último piso, el Presidente sube otra vez la suscripción mientras los fans protestan en la puerta. Es hora de recuperar los discos.',
    levels: ['Atención al cliente', 'Departamento de precios', 'Sala de licencias', 'El Presidente de Phony'] },
];
// Cada nivel sale de una regla: más oleadas, más tipos de enemigo y un poco más de vida según avanzas.
// deck: las 6 unidades del ejército enemigo, de la más floja a la más dura (en las primeras oleadas solo salen las flojas).
// gold: oro con el que empiezas (algo más en cada mundo) · hp: vida de los enemigos al empezar · growth: cuánto crece esa vida en cada oleada · bud: cuántos enemigos trae cada oleada
const LEVEL_RULE = { waves: [8, 10, 12, 12], kinds: [3, 4, 6, 6], hpWorld: 0.04, hpLevel: 0.05, growth: TD.hpGrowth, growthWorld: 0.02, budWorld: 0.04, budLevel: 0.05, goldWorld: 25 };
WORLDS_TD.forEach((w, wi) => {
  const R = LEVEL_RULE, units = FACTIONS[w.efac].units.slice().sort((a, b) => FOES[a].cost - FOES[b].cost), bal = FAC_BAL[w.efac] ? Math.min(1.15, Math.sqrt(FAC_BAL[w.efac].hp)) : 1;
  w.levels = w.levels.map((name, li) => ({ name, id: `${wi + 1}-${li + 1}`, wi, li, efac: w.efac,
    waves: R.waves[li] + (wi > 0 && li < 2 ? 2 : 0), hp: Math.round((1 + wi * R.hpWorld + li * R.hpLevel) * bal * 100) / 100,
    gold: TD.startGold + wi * R.goldWorld, growth: R.growth + wi * R.growthWorld + (ETRAITS[w.efac].growth || 0), bud: 1 + wi * R.budWorld + li * R.budLevel,
    deck: units.slice(0, wi === 0 && li === 0 ? 2 : R.kinds[li]), boss: li === 3 ? w.boss : null }));
});

// Campo: una explanada de tierra tan ancha como la pantalla, dividida en casillas. Los enemigos salen de la sede de Microblizz
// (arriba) y buscan siempre el camino más corto hasta La Madriguera (abajo). Cada torre ocupa una casilla: con ellas formas
// el laberinto, pero nunca se puede cerrar el paso del todo.
const GRID = { cols: 15, rows: 15, cell: 36, x0: 0, y0: 180, gate: 1 };   // gate: casillas a cada lado del centro que forman la entrada y la salida
const TOWER_R = 17;        // radio de la peana de una torre
