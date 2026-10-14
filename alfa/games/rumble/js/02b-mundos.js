// Fans of Rumble · Progresión (2/5): los mundos de las dos campañas y el Modo Jefe
'use strict';

// campaña 1 "La Rebelión de los Fans" (mundos 1-8) y campaña 2 "La Era Digital" (9-12): 4 niveles por mundo (el 4.º es el jefe)
const WORLDS = [
  { name: 'Oficinas de Microblizz', efac: 'microblizz', story: 'Microblizz, una empresa millonaria, ha comprado el estudio que hacía tus juegos favoritos. Lo primero: despedir a la gente y poner robots.', levels: [
    { name: 'La compra', elvl: 1, income: 0.6, deck: ['becario', 'starbot'] },
    { name: 'Cartas de despido', elvl: 1, income: 0.65, deck: ['becario', 'starbot', 'fallen'] },
    { name: 'Cierre del estudio', elvl: 1, income: 0.7, deck: ['becario', 'starbot', 'fallen', 'cajabotin'] },
    { name: 'SurvivalBot', elvl: 2, income: 0.75, boss: 'SurvivalBot', deck: ['becario', 'starbot', 'fallen', 'cajabotin'] }] },
  { name: 'Cementerio de juegos', efac: 'nomuertos', unlock: 'nomuertos', story: 'Aquí entierra Microblizz los juegos que cierra. Los No-Muertos trabajan para ellos… sin cobrar.', levels: [
    { name: 'Tumbas sin nombre', elvl: 2, income: 0.5 }, { name: 'Fosa de las horas extra', elvl: 2, income: 0.53 }, { name: 'Mausoleo de juegos cerrados', elvl: 3, income: 0.56 }, { name: 'NecroLord corrupto', elvl: 3, income: 0.55, boss: 'NecroLord corrupto' }] },
  { name: 'Plató Abandonado', efac: 'streamers', unlock: 'streamers', story: 'Un plató vacío. Microblizz compró el canal, echó al público y ahora solo pone anuncios.', levels: [
    { name: 'Directo sin audio', elvl: 3, income: 0.55 }, { name: 'Caída del chat', elvl: 3, income: 0.58 }, { name: 'Oleada de baneos', elvl: 4, income: 0.6 }, { name: 'StreamKing corrupto', elvl: 4, income: 0.6, boss: 'StreamKing corrupto' }] },
  { name: 'Olimpo Abandonado', efac: 'heroes', unlock: 'heroes', story: 'Desde que Microblizz compró a los dioses, nadie arregla su juego. Están de muy mal humor.', levels: [
    { name: 'Templo en obras', elvl: 4, income: 0.58 }, { name: 'Laberinto de quejas', elvl: 4, income: 0.6 }, { name: 'Monte olvidado', elvl: 5, income: 0.62 }, { name: 'EpicChampion corrupto', elvl: 5, income: 0.62, boss: 'EpicChampion corrupto' }] },
  { name: 'Sector Neón', efac: 'ciber', unlock: 'ciber', story: 'Una ciudad de neón que Microblizz compró entera. Ahora todo es de pago, hasta las farolas.', levels: [
    { name: 'Callejón de neón', elvl: 5, income: 0.6 }, { name: 'Red de drones', elvl: 5, income: 0.62 }, { name: 'Servidor central', elvl: 6, income: 0.65 }, { name: 'CyberMarine corrupto', elvl: 6, income: 0.64, boss: 'CyberMarine corrupto' }] },
  { name: 'El Foro Infinito', efac: 'memes', unlock: 'memes', story: 'El foro de los fans. Microblizz lo compró, borró las quejas y lo llenó de anuncios.', levels: [
    { name: 'Hilo infinito', elvl: 6, income: 0.62 }, { name: 'Borrado de quejas', elvl: 6, income: 0.65 }, { name: 'Lluvia de anuncios', elvl: 7, income: 0.68 }, { name: 'MemeLord corrupto', elvl: 7, income: 0.68, boss: 'MemeLord corrupto' }] },
  { name: 'Torre de Microblizz', efac: 'microblizz', story: 'La sede de la empresa. En el último piso, el CEO cuenta sus millones mientras decide qué juego cerrar.', levels: [
    { name: 'Recepción', elvl: 7, income: 0.8 }, { name: 'Planta de las cajas de botín', elvl: 8, income: 0.88 }, { name: 'Despacho de los despidos', elvl: 8, income: 0.95 }, { name: 'El CEO de Microblizz', elvl: 9, income: 1, boss: 'El CEO de Microblizz', baseHp: 2600 }] },
  // v0.9.13: epílogo de la campaña 1
  { name: 'El Sótano de Microblizz', efac: 'olvidados', unlock: 'olvidados', story: 'Con el CEO despedido, encuentras una puerta al sótano. Ahí guardaba Microblizz los juegos que canceló antes de que salieran. Llevan años a oscuras… y están muy enfadados.', levels: [
    { name: 'Cajas sin abrir', elvl: 8, income: 0.85 }, { name: 'Proyectos en pausa', elvl: 8, income: 0.88 }, { name: 'La sala de los cancelados', elvl: 9, income: 0.92 }, { name: 'VikingoPerdido corrupto', elvl: 9, income: 0.95, boss: 'VikingoPerdido corrupto' }] },
  // v0.9.13: Campaña 2 «La Era Digital», contra Phony y su PayStation (se abre al ganar al CEO)
  { camp: 2, openAfter: '7-4', name: 'Tiendas sin discos', efac: 'phony', story: 'Phony ha quitado el lector de discos de su consola, la PayStation, para ahorrarse millones. Ahora todo es digital, todo es de alquiler… y lo que compras te lo pueden borrar.', levels: [
    { name: 'La última tienda', elvl: 7, income: 0.75, deck: ['descargabot', 'licenciabot', 'plusbot'] },
    { name: 'Estanterías vacías', elvl: 7, income: 0.8, deck: ['descargabot', 'licenciabot', 'plusbot', 'cobradlc'] },
    { name: 'Devoluciones imposibles', elvl: 8, income: 0.85, deck: ['descargabot', 'licenciabot', 'plusbot', 'cobradlc', 'servidorbot'] },
    { name: 'PayStation sin lector', elvl: 8, income: 0.88, boss: 'PayStation sin lector' }] },
  { camp: 2, name: 'La LAN Party', efac: 'gamer', unlock: 'gamer', story: 'Phony ha comprado los servidores de la comunidad: ahora para jugar online hay que pagar. A los gamers les ha obligado a firmar contratos de exclusividad y ya no juegan por diversión.', levels: [
    { name: 'Mesas sin cables', elvl: 8, income: 0.82 }, { name: 'Torneo de pago', elvl: 8, income: 0.86 }, { name: 'Servidores cerrados', elvl: 9, income: 0.9 }, { name: 'ProGamer corrupto', elvl: 9, income: 0.92, boss: 'ProGamer corrupto' }] },
  { camp: 2, name: 'Estudios Phony', efac: 'pop', unlock: 'pop', story: 'Phony también tiene estudios de cine. Allí solo se ruedan secuelas, remakes y anuncios de la PayStation. Los de Cultura Pop están hartos de repetir la misma película.', levels: [
    { name: 'Rodaje del remake', elvl: 9, income: 0.85 }, { name: 'La secuela de la secuela', elvl: 9, income: 0.9 }, { name: 'Pase de prensa', elvl: 10, income: 0.94 }, { name: 'LaDirectora corrupta', elvl: 10, income: 0.96, boss: 'LaDirectora corrupta' }] },
  { camp: 2, name: 'Sede de Phony', efac: 'phony', story: 'La sede de Phony. En el último piso, el Presidente sube otra vez la suscripción mientras los fans protestan en la puerta. Es hora de recuperar los discos.', levels: [
    { name: 'Atención al cliente', elvl: 9, income: 0.92 }, { name: 'Departamento de precios', elvl: 10, income: 0.96 }, { name: 'Sala de licencias', elvl: 10, income: 1 }, { name: 'El Presidente de Phony', elvl: 10, income: 1.05, boss: 'El Presidente de Phony', baseHp: 2800 }] },
];
const CEO_WI = 6;   // el mundo del CEO de Microblizz (final de la campaña 1)
WORLDS.forEach((w, wi) => w.levels.forEach((l, li) => { l.id = `${wi + 1}-${li + 1}`; l.wi = wi; l.li = li; }));
// Modo Jefe: el CEO de Microblizz, sin torres, 3 minutos para hacerle todo el daño posible
const BOSS_MODE = { name: 'El CEO de Microblizz', hp: 12000, time: 240, income: 0.95, tiers: [[1500, 10], [4000, 25], [8000, 50]] };
// v0.9.15: los 12 jefes de la campaña (se abren al ganarles allí; el CEO, siempre), 3 dificultades y 4 minutos
const BOSS_HP = [5000, 6000, 7000, 8000, 9000, 10000, 12000, 12500, 11000, 12500, 13500, 14000];
const BOSS_ART = ['e_base', 'necrolord', 'twitchking', 'epicchampion', 'cybermarine', 'memelord', 'ceo', 'vikingo', 'y_base', 'progamer', 'directora', 'presi'];
const BOSS_SHORT = ['SurvivalBot', 'NecroLord', 'StreamKing', 'EpicChampion', 'CyberMarine', 'MemeLord', 'El CEO', 'Vikingo', 'PayStation', 'ProGamer', 'Directora', 'Presidente'];
const BDIFF = {
  n: { name: 'Normal', lvl: 0, inc: 1, hp: 1, elite: 1, pay: 1, cd: 14, stun: 2, think: [0.7, 1.3] },
  h: { name: 'Difícil', lvl: 2, inc: 1.2, hp: 1.5, elite: 1.1, pay: 2, gear: 'h', q: 0.6, cd: 12, stun: 2.3, think: [0.5, 1] },
  m: { name: 'Mítica', lvl: 4, inc: 1.4, hp: 2, elite: 1.25, pay: 3, gear: 'm', q: 1, cd: 10, stun: 2.6, think: [0.35, 0.8] },
};
const BOSS_TIERS = [0.25, 0.5, 0.75], BOSS_TGEMS = [5, 10, 15], BOSS_KGEMS = 20, BOSS_KGOLD = 150;   // gemas por llegar al 25/50/75 % y por derrotarlo (x2 en Difícil, x3 en Mítica)
const bossOf = wi => { const L = WORLDS[wi].levels[3]; return { wi, id: L.id, name: L.boss, efac: WORLDS[wi].efac, art: BOSS_ART[wi], short: BOSS_SHORT[wi], inc: Math.min(BOSS_MODE.income, L.income + 0.05) }; };
const bossHp = (wi, d) => Math.round(BOSS_HP[wi] * BDIFF[d || 'n'].hp);
const bossOpen = wi => wi === CEO_WI || !!SAVE.testAll || ['n', 'h', 'x', 'm'].some(d => starsD(WORLDS[wi].levels[3].id, d) > 0);

