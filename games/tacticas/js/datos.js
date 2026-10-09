// Fans of Rumble: Tácticas · DATOS: héroes, técnicas, objetos, enemigos y mundos. Todo el balance está aquí.
'use strict';
const tr = s => s;   // el juego está en español; el motor de dibujo de Fans Of pide esta función

/* ---------- ritmo del combate ---------- */
const AJUSTES = {
  caosAtaque: 5,      // CAOS que gana el héroe con cada ataque normal
  atbBase: 20,        // lo que se llena la barra por segundo, más la velocidad de cada uno (100 = turno)
  atbVel: 1.6,        // cuánto suma cada punto de velocidad
  critico: 0.08,      // probabilidad de golpe crítico
  critMult: 1.6,
  defensa: 60,        // daño = poder × 2 × (defensa / (defensa + DEF del que recibe))
  crecer: 1.08,       // cada nivel multiplica vida, ataque, magia y defensa
  crecerCaos: 1.06,
  xpNivel: L => 20 + 15 * L,   // experiencia para pasar del nivel L al siguiente
  cafe: 30,           // lo que cuesta curar a todo el grupo en el mapa
  revivirGemas: 20,   // revivir al perder pagando gemas
};

/* ---------- héroes: los líderes de cada facción ---------- */
const HEROES = {
  bunny:        { fac: 'animales',  rol: 'Luchador',     hp: 420, mp: 40, atk: 30, def: 12, mag: 10, spd: 11, tec: ['saltoCaos', 'rabia'],          gemas: 0 },
  epicchampion: { fac: 'heroes',    rol: 'Caballero',    hp: 400, mp: 45, atk: 28, def: 16, mag: 14, spd: 9,  tec: ['tajoEpico', 'gritoHeroico'],   gemas: 0 },
  twitchking:   { fac: 'streamers', rol: 'Sanador',      hp: 300, mp: 70, atk: 18, def: 9,  mag: 24, spd: 10, tec: ['donacion', 'baneo'],           gemas: 0 },
  necrolord:    { fac: 'nomuertos', rol: 'Mago oscuro',  hp: 290, mp: 80, atk: 16, def: 8,  mag: 28, spd: 8,  tec: ['drenaje', 'levantar'],         gemas: 0 },
  cybermarine:  { fac: 'ciber',     rol: 'Artillero',    hp: 380, mp: 50, atk: 26, def: 14, mag: 16, spd: 9,  tec: ['rafaga', 'plasma'],            gemas: 150 },
  memelord:     { fac: 'memes',     rol: 'Comodín',      hp: 320, mp: 60, atk: 20, def: 10, mag: 24, spd: 10, tec: ['ruleta', 'stonks'],            gemas: 150 },
  progamer:     { fac: 'gamer',     rol: 'Velocista',    hp: 300, mp: 50, atk: 27, def: 9,  mag: 14, spd: 13, tec: ['combo', 'energetica'],        gemas: 250 },
  vikingo:      { fac: 'olvidados', rol: 'Defensor',     hp: 480, mp: 40, atk: 32, def: 14, mag: 8,  spd: 8,  tec: ['hachazo', 'provocar'],         gemas: 250 },
  directora:    { fac: 'pop',       rol: 'Controladora', hp: 310, mp: 70, atk: 18, def: 10, mag: 26, spd: 10, tec: ['corten', 'remake'],            gemas: 300 },
};
const HEROE_ORDEN = ['bunny', 'epicchampion', 'twitchking', 'necrolord', 'cybermarine', 'memelord', 'progamer', 'vikingo', 'directora'];

/* ---------- técnicas (gastan CAOS) ----------
   a: 'enemigo' | 'enemigos' | 'aliado' | 'grupo' | 'caido' | 'yo'
   st: la estadística que usa (atk o mag) · pow: multiplicador · golpes: veces que pega */
const TECNICAS = {
  saltoCaos:    { nombre: 'Salto caótico',  mp: 12, a: 'enemigos', st: 'atk', pow: 0.85, sfx: 'jump', fx: 'slam', desc: 'Salta encima de todos los enemigos.' },
  rabia:        { nombre: 'Rabia',          mp: 10, a: 'grupo', mejora: 'atk', turnos: 3, sfx: 'hype', desc: 'Todo el grupo pega más fuerte 3 turnos.' },
  tajoEpico:    { nombre: 'Tajo épico',     mp: 10, a: 'enemigo', st: 'atk', pow: 2.1, sfx: 'slam', fx: 'tajo', caosGrupo: 6, desc: 'Un golpe enorme a un enemigo. Inspira: todo el grupo gana 6 CAOS.' },
  gritoHeroico: { nombre: 'Grito heroico',  mp: 14, a: 'grupo', mejora: 'def', turnos: 3, sfx: 'horn', desc: 'El grupo recibe menos daño 3 turnos.' },
  donacion:     { nombre: 'Donación',       mp: 14, a: 'grupo', st: 'mag', cura: 1.4, sfx: 'heal', desc: 'Cura a todo el grupo.' },
  baneo:        { nombre: 'Baneo',          mp: 10, a: 'enemigo', st: 'mag', pow: 0.9, aturde: 0.75, sfx: 'zap', fx: 'rayo', desc: 'Daño y suele dejar al enemigo sin turno.' },
  drenaje:      { nombre: 'Drenaje',        mp: 10, a: 'enemigo', st: 'mag', pow: 1.6, roba: 0.5, sfx: 'wail', fx: 'alma', desc: 'Daño mágico y te curas la mitad.' },
  levantar:     { nombre: 'Levantar caídos', mp: 22, a: 'caido', revive: 0.5, sfx: 'revive', desc: 'Revive a un aliado con media vida.' },
  rafaga:       { nombre: 'Ráfaga',         mp: 16, a: 'enemigos', st: 'atk', pow: 0.6, golpes: 2, sfx: 'gun', fx: 'balas', desc: 'Dos ráfagas a todos los enemigos.' },
  plasma:       { nombre: 'Escudo plasma',  mp: 12, a: 'grupo', mejora: 'def', turnos: 2, cura: 0.6, st: 'mag', sfx: 'shield', desc: 'Escudo y una cura pequeña al grupo.' },
  ruleta:       { nombre: 'Ruleta RNG',     mp: 12, a: 'enemigos', ruleta: true, sfx: 'roll', desc: 'Puede pasar cualquier cosa. De verdad.' },
  stonks:       { nombre: 'Stonks',         mp: 8,  a: 'enemigo', st: 'mag', pow: 1.2, oro: 15, sfx: 'hype', fx: 'rayo', desc: 'Daño y ganas oro.' },
  combo:        { nombre: 'Combo x3',       mp: 12, a: 'enemigo', st: 'atk', pow: 0.8, golpes: 3, sfx: 'hit', fx: 'tajo', desc: 'Tres golpes rápidos.' },
  energetica:   { nombre: 'Energética',     mp: 14, a: 'grupo', mejora: 'prisa', turnos: 3, sfx: 'levelup', desc: 'El grupo se llena la barra más rápido.' },
  hachazo:      { nombre: 'Hachazo',        mp: 12, a: 'enemigo', st: 'atk', pow: 2.4, sfx: 'slam', fx: 'tajo', desc: 'Golpe brutal a un enemigo.' },
  provocar:     { nombre: 'Provocar',       mp: 8,  a: 'yo', mejora: 'provoca', turnos: 3, extra: 'def', sfx: 'horn', desc: 'Los enemigos le atacan a él, y aguanta más.' },
  corten:       { nombre: '¡Corten!',       mp: 20, a: 'enemigos', aturde: 0.5, sfx: 'clank', desc: 'Puede dejar sin turno a todos los enemigos.' },
  remake:       { nombre: 'Remake',         mp: 14, a: 'aliado', st: 'mag', cura: 2.6, limpia: true, sfx: 'heal', desc: 'Gran cura a un aliado y le quita males.' },
};

/* ---------- objetos ---------- */
const OBJETOS = {
  botiquin: { nombre: 'Botiquín',               a: 'aliado', curaFija: 250, precio: 40,  desc: 'Cura 250 de vida.' },
  bebida:   { nombre: 'Bebida energética',      a: 'aliado', caos: 40,      precio: 60,  desc: 'Devuelve 40 de CAOS.' },
  pizza:    { nombre: 'Pizza de oficina',       a: 'grupo',  curaFija: 180, precio: 120, desc: 'Cura 180 a todo el grupo.' },
  contrato: { nombre: 'Contrato de readmisión', a: 'caido',  revive: 0.5,   precio: 150, desc: 'Revive a un aliado con media vida.' },
};
const OBJETO_ORDEN = ['botiquin', 'bebida', 'pizza', 'contrato'];

/* ---------- enemigos ----------
   acc: lo que pueden hacer, con su peso (cuanto más alto, más a menudo)
   t: 'golpe' (a uno) · 'todos' · 'curar' (a un aliado) · 'robar' (oro) · 'bajar' (ataque del grupo) · 'aturdir' · 'llamar' (invoca) · 'drenar' */
const ENEMIGOS = {
  // Microblizz
  becario:    { hp: 80,   atk: 16, def: 4,  spd: 9,  xp: 6,  oro: 8,  acc: [{ t: 'golpe', n: 'Grapadora', pow: 1, p: 3 }, { t: 'golpe', n: 'Café derramado', pow: 1.3, p: 1 }] },
  starbot:    { hp: 100,  atk: 20, def: 6,  spd: 11, xp: 8,  oro: 10, acc: [{ t: 'golpe', n: 'Láser', pow: 1, p: 3, sfx: 'laser' }] },
  fallen:     { hp: 140,  atk: 26, def: 6,  spd: 7,  xp: 10, oro: 12, acc: [{ t: 'golpe', n: 'Carta de despido', pow: 1.4, p: 2, sfx: 'despido' }, { t: 'golpe', n: 'Empujón', pow: 0.9, p: 2 }] },
  cajabotin:  { hp: 160,  atk: 14, def: 12, spd: 8,  xp: 12, oro: 25, acc: [{ t: 'robar', n: 'Cobro sorpresa', pow: 0.8, p: 2, sfx: 'despido' }, { t: 'golpe', n: 'Tapazo', pow: 1, p: 2 }] },
  soportebot: { hp: 110,  atk: 10, def: 8,  spd: 10, xp: 10, oro: 12, acc: [{ t: 'curar', n: 'Parche de soporte', pow: 1.8, p: 2, sfx: 'heal' }, { t: 'golpe', n: 'Ticket cerrado', pow: 1, p: 1 }] },
  parchebot:  { hp: 260,  atk: 22, def: 18, spd: 6,  xp: 18, oro: 20, acc: [{ t: 'todos', n: 'Actualización obligatoria', pow: 0.6, p: 1, sfx: 'zap' }, { t: 'golpe', n: 'Parche pesado', pow: 1.1, p: 2 }] },
  // No-Muertos corrompidos
  skeleton:   { hp: 120,  atk: 24, def: 6,  spd: 11, xp: 10, oro: 12, corrupto: true, acc: [{ t: 'golpe', n: 'Huesazo', pow: 1, p: 1 }] },
  zombie:     { hp: 190,  atk: 26, def: 8,  spd: 6,  xp: 12, oro: 12, corrupto: true, acc: [{ t: 'drenar', n: 'Mordisco', pow: 1.1, p: 2 }, { t: 'golpe', n: 'Abrazo', pow: 0.9, p: 1 }] },
  ghostmage:  { hp: 130,  atk: 22, def: 6,  spd: 9,  xp: 14, oro: 14, corrupto: true, acc: [{ t: 'todos', n: 'Niebla helada', pow: 0.7, p: 2, sfx: 'wail' }, { t: 'golpe', n: 'Toque fantasma', pow: 1, p: 1 }] },
  banshee:    { hp: 140,  atk: 22, def: 6,  spd: 10, xp: 14, oro: 14, corrupto: true, acc: [{ t: 'bajar', n: 'Grito triste', p: 1, sfx: 'wail' }, { t: 'golpe', n: 'Chillido', pow: 1, p: 2 }] },
  skullknight:{ hp: 280,  atk: 32, def: 16, spd: 7,  xp: 22, oro: 24, corrupto: true, acc: [{ t: 'golpe', n: 'Espadazo', pow: 1.3, p: 2, sfx: 'slam' }, { t: 'golpe', n: 'Golpe de escudo', pow: 0.9, p: 1 }] },
  // Streamers corrompidos
  subswarm:   { hp: 100,  atk: 24, def: 4,  spd: 14, xp: 12, oro: 14, corrupto: true, acc: [{ t: 'golpe', n: 'Spam', pow: 0.9, p: 1, sfx: 'blip' }] },
  hypebeast:  { hp: 170,  atk: 32, def: 8,  spd: 10, xp: 16, oro: 18, corrupto: true, acc: [{ t: 'golpe', n: 'Hype', pow: 1.2, p: 1, sfx: 'hype' }] },
  viralbot:   { hp: 160,  atk: 28, def: 8,  spd: 10, xp: 16, oro: 18, corrupto: true, acc: [{ t: 'todos', n: 'Contenido viral', pow: 0.7, p: 2, sfx: 'zap' }, { t: 'golpe', n: 'Notificación', pow: 1, p: 1 }] },
  snackmom:   { hp: 150,  atk: 18, def: 8,  spd: 9,  xp: 14, oro: 16, corrupto: true, acc: [{ t: 'curar', n: 'Merienda', pow: 2, p: 2, sfx: 'heal' }, { t: 'golpe', n: 'Zapatillazo', pow: 1.1, p: 1 }] },
  hypetrain:  { hp: 320,  atk: 34, def: 12, spd: 7,  xp: 24, oro: 26, corrupto: true, acc: [{ t: 'todos', n: 'Tren del hype', pow: 0.9, p: 1, sfx: 'horn' }, { t: 'golpe', n: 'Atropello', pow: 1.2, p: 1 }] },
  banhammer:  { hp: 280,  atk: 40, def: 14, spd: 6,  xp: 24, oro: 26, corrupto: true, acc: [{ t: 'aturdir', n: 'Martillo de baneo', pow: 1, p: 1, sfx: 'slam' }, { t: 'golpe', n: 'Martillazo', pow: 1.3, p: 2, sfx: 'slam' }] },
  // jefes
  e_base:     { nombre: 'SurvivalBot', jefe: true, esc: 1.1, hp: 1400, atk: 30, def: 14, spd: 7, xp: 60, oro: 120, gemas: 10, acc: [
    { t: 'golpe', n: 'Láser de los ojos', pow: 1.3, p: 3, sfx: 'eyelaser' }, { t: 'todos', n: 'Despido masivo', pow: 0.8, p: 2, sfx: 'boom' }, { t: 'llamar', n: 'Contratar becarios', que: 'becario', p: 1, sfx: 'summon' }] },
  necrolord:  { nombre: 'NecroLord corrupto', jefe: true, esc: 1.55, corrupto: true, hp: 2000, atk: 36, def: 14, spd: 8, xp: 90, oro: 160, gemas: 15, acc: [
    { t: 'drenar', n: 'Drenaje de almas', pow: 1.3, p: 3, sfx: 'wail' }, { t: 'todos', n: 'Lluvia de lápidas', pow: 0.85, p: 2, sfx: 'boom' }, { t: 'llamar', n: 'Levantar esqueleto', que: 'skeleton', p: 1, sfx: 'summon' }] },
  twitchking: { nombre: 'StreamKing corrupto', jefe: true, esc: 1.5, corrupto: true, hp: 2600, atk: 42, def: 16, spd: 9, xp: 120, oro: 200, gemas: 20, acc: [
    { t: 'aturdir', n: 'Baneo permanente', pow: 0.9, p: 2, sfx: 'zap' }, { t: 'todos', n: 'Raid', pow: 0.9, p: 2, sfx: 'horn' }, { t: 'curar', n: 'Donación de bots', pow: 3, p: 1, sfx: 'heal', yo: true }] },
  ceo:        { nombre: 'El CEO', jefe: true, esc: 1.95, hp: 3400, atk: 48, def: 20, spd: 10, xp: 200, oro: 400, gemas: 40, acc: [
    { t: 'todos', n: 'Despido masivo', pow: 1, p: 3, sfx: 'boom' }, { t: 'bajar', n: 'Recortes', p: 1, sfx: 'despido' }, { t: 'curar', n: 'Bonus de directivo', pow: 3, p: 1, sfx: 'levelup', yo: true },
    { t: 'llamar', n: 'Llamar a seguridad', que: 'fallen', p: 1, sfx: 'summon' }] },
};

/* ---------- mundos (nombres e historias de la campaña de Fans of Rumble) ---------- */
const MUNDOS = [
  { nombre: 'Oficinas de Microblizz', fondo: 'oficina', musica: 'boss0', historia: 'Microblizz, una empresa millonaria, ha comprado el estudio que hacía tus juegos favoritos. Lo primero: despedir a la gente y poner robots.', niveles: [
    { nombre: 'La compra', e: ['becario', 'becario', 'starbot'] },
    { nombre: 'Cartas de despido', e: ['becario', 'fallen', 'starbot'] },
    { nombre: 'Cierre del estudio', e: ['soportebot', 'cajabotin', 'fallen'] },
    { nombre: 'SurvivalBot', e: ['becario', 'e_base', 'becario'], jefe: true }] },
  { nombre: 'Cementerio de juegos', fondo: 'cementerio', musica: 'boss1', historia: 'Aquí entierra Microblizz los juegos que cierra. Los No-Muertos trabajan para ellos… sin cobrar.', niveles: [
    { nombre: 'Tumbas sin nombre', e: ['skeleton', 'zombie', 'skeleton'] },
    { nombre: 'Fosa de las horas extra', e: ['ghostmage', 'zombie', 'banshee'] },
    { nombre: 'Mausoleo de juegos cerrados', e: ['banshee', 'skullknight', 'ghostmage'] },
    { nombre: 'NecroLord corrupto', e: ['skeleton', 'necrolord', 'skeleton'], jefe: true }] },
  { nombre: 'Plató Abandonado', fondo: 'plato', musica: 'boss2', historia: 'Un plató vacío. Microblizz compró el canal, echó al público y ahora solo pone anuncios.', niveles: [
    { nombre: 'Directo sin audio', e: ['subswarm', 'hypebeast', 'subswarm'] },
    { nombre: 'Caída del chat', e: ['viralbot', 'snackmom', 'hypebeast'] },
    { nombre: 'Oleada de baneos', e: ['viralbot', 'banhammer', 'hypetrain'] },
    { nombre: 'StreamKing corrupto', e: ['subswarm', 'twitchking', 'snackmom'], jefe: true }] },
  { nombre: 'Sede de Microblizz', fondo: 'sede', musica: 'boss6', historia: 'La planta 99. Aquí se decide qué juego se cierra cada lunes. El CEO te está esperando… en su sillón de masaje.', niveles: [
    { nombre: 'Recepción', e: ['parchebot', 'soportebot', 'starbot'] },
    { nombre: 'Sala de juntas', e: ['fallen', 'cajabotin', 'parchebot', 'soportebot'] },
    { nombre: 'El despacho del CEO', e: ['becario', 'ceo', 'becario'], jefe: true }] },
];

/* ---------- MONETIZACIÓN ----------
   Precios y productos en un solo sitio. En el prototipo las compras y los anuncios son simulados;
   para publicar, solo hay que conectar pagar() y verAnuncio() de juego.js con Google Play / App Store y AdMob. */
const TIENDA = {
  gemas: [
    { id: 'gemas_s', nombre: 'Puñado de gemas', gemas: 80,   extra: 0,   precio: '0,99 €' },
    { id: 'gemas_m', nombre: 'Bolsa de gemas',  gemas: 450,  extra: 50,  precio: '4,99 €', destacado: 'MÁS VENDIDO' },
    { id: 'gemas_l', nombre: 'Cofre de gemas',  gemas: 1000, extra: 200, precio: '9,99 €' },
    { id: 'gemas_xl', nombre: 'Caja fuerte del CEO', gemas: 2200, extra: 600, precio: '19,99 €', destacado: 'MEJOR VALOR' },
  ],
  ofertas: [
    { id: 'pack_inicio', nombre: 'Pack de inicio', precio: '2,99 €', unaVez: true, desc: '300 gemas, 5 botiquines, 2 contratos y MemeLord desbloqueado.', da: { gemas: 300, items: { botiquin: 5, contrato: 2 }, heroe: 'memelord' } },
    { id: 'sin_anuncios', nombre: 'Sin anuncios', precio: '3,99 €', unaVez: true, desc: 'Las recompensas de los anuncios se cobran al momento, sin verlos.', da: { sinAnuncios: true } },
    { id: 'pase', nombre: 'Pase de temporada', precio: '4,99 €', unaVez: true, desc: 'Doble de oro en todos los combates, para siempre.', da: { pase: true } },
  ],
  anunciosDia: 3,          // anuncios con premio al día en la tienda
  gemasAnuncio: 15,
  diario: [ { oro: 50 }, { oro: 80 }, { gemas: 10 }, { items: { botiquin: 2 } }, { oro: 150 }, { items: { contrato: 1 } }, { gemas: 40 } ],
};
