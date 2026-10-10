// Fans of Roguelite · El chat falso del directo (como el de Fans of Rumble, que imita a Twitch): quién escribe (con su color
// y su insignia: mod, vip o sub) y qué dice según lo que pasa. {X} es un nombre (una habilidad, un objeto o un enemigo).
// Lola es la moderadora: la primera vez de cada cosa da el consejo de verdad (CONSEJOS, en datos-meta.js).
'use strict';

const CHAT_USUARIOS = [
  ['ConejoFan_88', '#ffb04f'], ['LagLord', '#63cfe0'], ['ExDeMicroblizz', '#7da8ff'], ['TioDelPase', '#ffe14d', 'sub'],
  ['DespedidoUnLunes', '#ff6b7a'], ['NerfEsto', '#d08cff'], ['GemaPerdida', '#ff8fd8', 'sub'], ['Ardilla_Rabiosa', '#ff9a3c', 'vip'],
  ['ClipItPls', '#9ef07a'], ['MamaDelStreamer', '#fda4af', 'vip'], ['Becario_42', '#a3e635'], ['ElCEO_Real', '#60a5fa'],
  ['ZorroSigiloso', '#fb923c'], ['ParcheDia1', '#c4b5fd'], ['CAOSenjoyer', '#e879f9', 'sub'], ['RoguelikeNoLite', '#ff8a94'],
  ['YoLoComproTodo', '#ffd36b', 'sub'], ['Zanahorio', '#7be04a'],
];
const CHAT_LOLA = ['Lola_Cafe', '#ffcb3d', 'mod'];

const CHAT_FRASES = {
  inicio: ['¡empieza el directo!', 'primer', 'hola desde el trabajo', '¡vamos conejo!', 'hoy sí llegamos al jefe', 'llego tarde, ¿qué me he perdido?', 'saludos a mi madre'],
  idle: ['nerf conejo', '¿esto es pay to win?', 'el chat está más vivo que los servidores de Microblizz', 'yo solo vengo por la música', 'mi abuela juega mejor', 'POV: eres un becario de Microblizz', 'clip it', '¿alguien más ve esto en el trabajo?', 'el conejo juega solo y aun así juega mejor que yo', 'hype hype hype', 'xD', '¿cuánto le queda al jefe?', 'mod, banéalo', 'LOL', 'esto es mejor que la tele'],
  critico: ['¡CRÍTICO!', 'clip it, clip it', 'eso ha dolido hasta a mí', 'POG', 'menudo zanahorazo', 'eso le ha bajado el sueldo'],
  chaos: ['¡CHAOS JUMP!', 'ha saltado hasta la luna', 'el suelo ha temblado en mi casa', 'CAOS CAOS CAOS'],
  castor: ['¡BOOM!', 'el castor ha cobrado su finiquito', 'BoomBeaver no falla nunca', 'boom boom boom'],
  ardilla: ['¡LA ARDILLA!', 'MadSquirrel en el directo', 'bellotas para todos', 'la ardilla pega más que el conejo'],
  esquiva: ['¡qué reflejos!', 'matrix', 'ni lo ha visto venir', 'esquiva de profesional'],
  huelga: ['¡HUELGA GENERAL!', 'ese golpe no cuenta: está en huelga', 'solidaridad', 'hoy no se ficha'],
  pocaVida: ['¡CÚRATE!', 'que se muere, que se muere', 'aguanta, conejo', 'ahí va el finiquito', 'F en el chat… todavía no', 'nervios'],
  elite: ['¡ojo, que brilla!', 'élite = objeto gratis', 'ese pega fuerte, cuidado', '¿por qué brilla? ¿es premium?'],
  mini: ['¡MINI JEFE!', '¡{X}! se viene lo gordo', 'tranquilos, solo es un mini jefe', '{X} me da más miedo que mi jefe'],
  jefe: ['¡JEFE!', '¡{X}! este es el bueno', 'todo o nada', 'si gana esto lo subo a TikTok', 'que alguien avise a Lola', 'me tiemblan las manos y no estoy jugando'],
  gana: ['ez', '¡a la calle!', '¡despedido!', 'GG', 'otro más a la cola del paro', 'adiós, adiós'],
  ganaJefe: ['¡GG!', '¡VAMOOOS!', 'clip para TikTok', 'Microblizz dirá que lo tenía planeado', 'el CEO ha tirado el café', '¡QUÉ PARTIDA!'],
  revive: ['¡SE LEVANTA!', 'ni muerto se rinde', 'el contrato indefinido existe, chat', 'muuuu', 'resurrección de domingo'],
  derrota: ['F', 'F en el chat', 'mañana más', 'la culpa es del lag', 'Microblizz: «esto lo arreglamos en el próximo parche»', 'GG, aun así', 'otra, otra'],
  victoria: ['¡GG WP!', '¡LEYENDA!', 'Microblizz va a cerrar este juego por envidia', 'clip para TikTok', '¡VAMOOOS!', 'el mejor directo de la historia'],
  consejoHab: ['coge {X}, está rotísima', '{X} o nada', 'ni se te ocurra coger {X}', 'mi madre siempre coge {X}', 'el meta es {X}, confiad', 'yo cogería {X}', '{X} es para novatos (yo la cojo siempre)'],
  legendaria: ['¡¡HAY UNA LEGENDARIA!!', '¡{X}! ¡cógela ya!', 'naranja = legendaria, chat', 'si no coges {X} me doy de baja'],
  elige: ['buena elección', '¿en serio {X}?', '{X}, el clásico', 'build de {X}, me gusta', 'no era la que yo quería, pero vale'],
  objeto: ['¡{X}!', 'equípalo ya', 'véndelo, confía', 'eso vale una pasta', 'qué estilo', '{X} le queda genial'],
  tienda: ['¡LOLA!', 'compra el bocadillo', 'ahorra para La Madriguera', 'apoya al pequeño comercio', 'Lola, ¿me fías?'],
  cofre: ['¡COFRE!', 'que sea legendaria, que sea legendaria', 'ojo, que puede morder', 'loot loot loot'],
  ruleta: ['¡que salga el premio gordo!', 'que salga la cuota jajaja', 'la ruleta está trucada', 'gira, gira, gira'],
  cuotaRuleta: ['jajaja la cuota', 'Microblizz siempre gana', 'F por las monedas', 'te lo dije'],
  gordo: ['¡¡PREMIO GORDO!!', '¡millonario!', 'invita a algo', 'esto no es legal'],
  gashapon: ['¡gira a lo grande!', 'que salga algo naranja', 'el gashapón es una tragaperras con ropa bonita', 'ese plástico no se recicla'],
  hoguera: ['¡huelga!', 'qué calentito', 'yo también estoy en huelga', 'afila, afila'],
  pase: ['NO LO COMPRES', 'cómpralo, confía', 'pay to win', 'yo lo compré y ahora vivo en La Madriguera', 'la cuota es para siempre, chat'],
  cuota: ['la cuota del pase ya cobra', 'te lo dije', 'Premium = menos vida. Qué gran trato'],
  monedas: ['¡monedas!', 'cógelas todas', 'el camión de Microblizz pierde más que gana', 'ka-ching'],
  capitulo: ['¡CAPÍTULO SUPERADO!', 'GG, a por el siguiente', 'yo me voy a cenar, ahora vuelvo', 'esto se pone serio', 'clip del capítulo'],
  raid: ['¡RAID!', 'hola, venimos de la raid', 'qué directo más bonito', 'os dejamos monedas', 'RAID RAID RAID'],
  misterioso: ['ese es FallenHero, ¿no?', 'cómprale algo, pobrecito', 'a mí me vendió una espada de cartón', 'precios de héroe caído'],
  bug: ['¿qué ha pasado con la pantalla?', 'BUG BUG BUG', 'Microblizz: «es una característica»', 'mi pantalla está bien, ¿no?', 'reportado (mentira)'],
  encuentro: ['¿qué hará?', 'elige la primera', 'la segunda, siempre la segunda', 'esto es una trampa'],
};
// lo que se comenta en cada mundo mientras se camina
const CHAT_MUNDO = [
  ['huele a café de máquina', 'en esta oficina hasta los becarios tienen becarios', '¿ese cartel dice que les encantan mis datos?', 'trabajé aquí. No preguntéis', 'la torre de Microblizz se ve desde aquí'],
  ['aquí está enterrado mi juego favorito', 'F por todos los juegos cerrados', '¿eso era una lápida o un servidor?', 'da miedito', 'los zombis hacen más horas que yo'],
  ['el ascensor sigue roto', 'desde aquí se ve el yate del CEO', 'el cartel dice «tu opinión nos da igual» jajaja', 'estamos cerca del CEO, lo noto', 'esta ciudad es toda de Microblizz'],
];
// cuántos espectadores trae cada cosa
const ESPECTA = { critico: 3, chaos: 8, castor: 6, ganaJefe: 40, revive: 15, gordo: 20, legendaria: 6, victoria: 120, ardilla: 10 };
