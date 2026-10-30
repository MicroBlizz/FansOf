// Fans of Rumble · Progresión (4/5): lo que comenta el chat del rival y de los jefes, las frases de cada carta y los titulares
'use strict';

// lo que comenta el chat de la facción enemiga (Microblizz o las corrompidas)
const CHAT_VS = {
  microblizz: ['los becarios de Microblizz trabajan gratis', 'SurvivalBot, ¿quién te ha diseñado?', 'esos servidores gastan más luz que mi pueblo', 'Microblizz despide gente para pagar el yate del CEO', '¿la CajaBotín da algo bueno? (no)', 'el Parche Día 1 pesa 80 GB', 'SoporteBot: «¿ha probado a apagar y encender?»'],
  nomuertos: ['¡libéralos!', 'Microblizz les hace trabajar hasta muertos (literal)', 'ojos rojos = ahora son de Microblizz', 'Microblizz les cobra el alquiler de la tumba'],
  streamers: ['¡libéralos!', 'esos streamers corrompidos solo hacen directos de anuncios', 'el StreamKing corrupto: «usa mi código de descuento»', 'el chat de ese lado son todo bots'],
  heroes: ['¡libéralos!', 'Microblizz compró a los dioses y dejó de arreglar su juego', 'el Minotauro corrupto se ha perdido en su propio laberinto', 'esa Medusa petrifica con cartas de despido'],
  ciber: ['¡libéralos!', 'Microblizz les ha metido anuncios en el cerebro', 'ese HackerKid ahora trabaja para la empresa', 'la NeonSniper corrupta cobra por disparo'],
  memes: ['¡libéralos!', 'los Memes corrompidos ya no hacen gracia: son anuncios', 'el Stonks corrupto solo sube para el CEO', 'MemeLord corrupto: «este meme es de pago»'],
  // v0.9.13: la comunidad gamer, harta de Phony
  phony: ['¿dónde está mi disco? 😡', 'pagué 80 € por un juego que ya no existe', 'Phony: «el futuro es digital». El futuro es alquilar', 'devolvednos el formato físico', 'sin lector no hay segunda mano ni préstamos', 'mi juego ha desaparecido de la biblioteca de un día para otro', '#DevolvedLosDiscos', 'otra subida de la suscripción…', '¿pagar para jugar online? ¿otra vez?', 'el mando cuesta más que la consola', 'Phony se ahorra millones y nos sube los precios', 'mi colección de discos vale más que toda su consola', 'la caja de mi juego viene vacía, solo trae un código'],
  olvidados: ['¡libéralos!', 'Microblizz los canceló y los encerró en el sótano', 'esos juegos nunca llegaron a salir 😢', 'un MMO entero cancelado… y ahí está, enfadado'],
  gamer: ['¡libéralos!', 'Phony les obliga a jugar con contrato de exclusividad', 'esos gamers ahora pagan por jugar online', 'el ProGamer corrupto ya no saluda al chat'],
  pop: ['¡libéralos!', 'Phony solo les deja rodar remakes', 'todo son secuelas desde que llegó Phony', 'esa película la he visto mil veces'],
};
// frases para cada jefe de mundo (0 = SurvivalBot … 6 = el CEO, que también es el del Modo Jefe)
const CHAT_BOSS = [
  ['SurvivalBot sobrevive a todo menos a las críticas', 'congelar unidades: la única actualización de SurvivalBot en 5 años'],
  ['el NecroLord corrupto despide a los muertos… otra vez', 'eso de congelar es muy de rey exánime'],
  ['StreamKing corrupto banea a todo el chat', 'ese jefe tiene 3 viewers y son bots'],
  ['EpicChampion corrupto: ahora cobra por pelear', 'el campeón se ha vendido a Microblizz'],
  ['CyberMarine corrupto lleva anuncios en el casco', 'drones de Microblizz con anuncios'],
  ['MemeLord corrupto solo publica memes de empresa', 'el meme del jefe lleva marca de agua'],
  ['el CEO ha venido a cerrar otro juego', 'el CEO cobra más que todo el estudio junto', 'el CEO se ha comprado otro yate con tus gemas', 'esta música me suena del ascensor…'],
  // v0.9.13: mundo 8 y campaña 2
  ['el VikingoPerdido lleva años sin ver la luz', 'ese vikingo se perdió en 1995 y sigue buscando la salida', 'el muro de escudos del jefe es de la beta, seguro que tiene bugs', '¿cuántos juegos guardaba Microblizz en este sótano?'],
  ['una consola sin lector, qué gran invento', 'la PayStation te cobra hasta por mirarla', 'mi consola vieja leía discos y era más feliz', 'la PayStation sin lector cuesta 600 € y no lee nada', '¿y ahora mis discos dónde los meto?'],
  ['el ProGamer corrupto solo juega si le pagan', 'patrocinado por Phony, qué tristeza', 'antes jugaba por diversión 😢', 'lleva el logo de Phony hasta en la frente', 'combo patrocinado por Phony 🙄'],
  ['LaDirectora corrupta solo rueda remakes', 'otra secuela que nadie ha pedido', 'esta película ya la he visto… tres veces', 'LaDirectora corrupta: «¡acción!… y cobrad la entrada»', 'una secuela más y me voy al cine de verdad'],
  ['el Presidente de Phony ha subido la suscripción en directo', '¡devuélvenos los discos!', 'el Presidente cobra hasta el aire que respiras', 'esta música suena a anuncio de consola', 'el Presidente acaba de anunciar la PayStation 7 (sin botones)', '¡que alguien le devuelva los discos a la gente!'],
];
// v0.9.12: frases sobre cada carta cuando la juegas
const CHAT_UNIT = {
  // v0.9.15: mata-sanadores
  huron: ["¡el hurón ninja va a por la enfermera!", "nadie ha visto saltar así a un hurón", "ese hurón ha visto demasiadas pelis"],
  sombra: ["la sombra va directa al sanador 👻", "¿dónde está la sombra? ah, detrás de tu curandera", "ni la sombra cobra en Microblizz"],
  hater: ["ha llegado el hater: BUUUU", "el hater no ha visto el juego pero opina", "ese hater va a por la curandera"],
  arpia: ["¡la arpía viene del cielo!", "la arpía tiene peor humor que el CEO", "ojo con la arpía, va a por el sanador"],
  dron: ["dron cazador en el aire 🚁", "ese dron tiene orden de búsqueda", "el dron ha fichado al sanador"],
  clickbait: ["NO VAS A CREER LO QUE HACE ESTE MEME", "el clickbait ha funcionado, he hecho clic", "número 7: ataca al sanador"],
  campero: ["¡CAMPERO! ¡reportadlo!", "ese arbusto se ha movido", "el campero lleva 20 minutos ahí"],
  espia: ["el espía de un juego que nunca salió", "misión: el sanador. Estado: cancelada… o no", "ese espía lleva gafas de sol de noche"],
  paparazzi: ["¡FLASH! el paparazzi ha pillado al sanador", "el paparazzi no respeta a nadie", "exclusiva: el sanador, sin maquillaje"],
  squirrel: ['¡ardillas con café!', 'dos ardillas, cero paciencia', 'esas ardillas van más rápido que mi wifi'],
  beaver: ['el castor va directo a la torre 💣', 'ese castor no tiene seguro de vida', 'dinamita y ningún plan B'],
  fox: ['el zorro ya ha desaparecido 👀', '¿dónde está el zorro? ¿alguien lo ve?', 'ojo, que el zorro pega x3'],
  meercat: ['llega la enfermera 🩹', 'MeerCat cura gratis, no como el seguro de Microblizz', 'la suricata trae tiritas para todos'],
  junkcoon: ['el mapache ha traído su contenedor', 'reciclaje ofensivo', 'JunkCoon tira basura… a Microblizz'],
  mechavaca: ['¡MECHAVACA! 🐄🤖', 'muuuuu-robot', 'la MechaVaca no frena ni en las curvas'],
  skeleton: ['cuatro esqueletos y ningún contrato', 'huesos baratos, mucho daño', 'esqueletos en fila, como en la oficina'],
  zombie: ['zombis lentos pero cobran horas extra', 'CrunchZombie: el crunch hecho persona', 'tres zombis = un lunes por la mañana'],
  ghostmage: ['un fantasma con varita, lo normal', 'dispara desde lejos, como los jefes por correo'],
  banshee: ['que grite la Banshee 😱', 'Banshee: el despertador de Microblizz'],
  skullknight: ['ese caballero frena a cualquiera', 'caballero sin cabeza (pero con calavera)'],
  stitchbrute: ['StitchBrute viene a dar abrazos tóxicos', 'cosido a mano y con mal olor'],
  subswarm: ['¡llegan los subs!', 'tres subs y un sueño'],
  hypebeast: ['HypeBeast va a toda pastilla', 'ese va con tres bebidas energéticas'],
  viralbot: ['ViralBot va a hacerse viral (aturdiendo)', 'cuidado, que lo graba todo'],
  snackmom: ['SnackMom trae bocatas para todos 🥪', 'la madre del streamer cura mejor que nadie'],
  hypetrain: ['¡CHU CHUUU! a la torre 🚂', 'ese tren no para en ninguna estación'],
  banhammer: ['¡BANEO MASIVO!', 'BanHammer: el moderador que todos temen'],
  cupidarcher: ['flechas de amor (y de daño) 💘', 'Cupido ha venido con mala leche'],
  hoplite: ['hoplitas en formación', 'tres lanzas, cero miedo'],
  shieldmaiden: ['ese escudo es más duro que un lunes', 'ShieldMaiden aguanta lo que le echen'],
  thundergod: ['¡rayo en cadena! ⚡', 'ThunderGod ha venido sin paraguas'],
  medusa: ['no la miréis a los ojos 🐍', 'Medusa: la jefa de personal de los dioses'],
  minotaur: ['el Minotauro viene embistiendo', 'ese toro no entiende de laberintos'],
  nanobot: ['cuatro NanoBots, mil problemas', 'bichitos de metal en camino'],
  cyberninja: ['el ninja se teletransporta; el wifi, no', 'ninja con lag cero'],
  techdroid: ['llega el técnico, y sin cita previa', 'TechDroid lo arregla todo menos mi vida'],
  hackerkid: ['HackerKid va a hackear las torres 💻', 'ese niño ha borrado el servidor de Microblizz'],
  neonsniper: ['francotiradora fluorescente', 'NeonSniper apunta desde casa'],
  siegemech: ['¡artillería pesada! 💥', 'SiegeMech viene a demoler'],
  suchdog: ['such dog, very rápido, wow 🐕', 'dos perritos con ganas'],
  gifblaster: ['ráfaga de gifs en camino', 'GifBlaster dispara en bucle'],
  synthcat: ['gato con sintetizador, lo que faltaba 🎹', 'SynthCat pincha música y daño'],
  trollbot: ['TrollBot va a provocar a todos 😈', 'no le hagáis caso al TrollBot (imposible)'],
  stonks: ['STONKS 📈', 'cuanto más pega, más sube'],
  chonkcat: ['ChonkCat se va a sentar encima de alguien', 'gato gordo, problemas gordos'],
  // v0.9.13
  noobs: ['¡noobs al ataque!', 'tres noobs y ningún plan', 'gorros de hélice en formación'],
  speedrunner: ['¡speedrun! ⏱️', 'se ha saltado medio mapa', 'récord mundial en camino'],
  modder: ['el Modder trae el parche que Phony no hizo', 'arreglos gratis, como debe ser'],
  coleccionista: ['¡discos físicos! 💿', 'el Coleccionista no presta sus juegos: los lanza'],
  ragequitter: ['ojo, que ese explota', 'RageQuitter a punto de tirar el mando'],
  recreativa: ['¡una recreativa con piernas! 🕹️', 'insert coin, insert coin'],
  swarmbug: ['¡bichos! 🐜', 'cuatro bichos con mucha hambre'],
  vikingsquad: ['¡vikingos perdidos!', 'tres vikingos y una brújula rota'],
  retromarine: ['ese marine es de otra década', 'hombreras XXL en camino'],
  ghostagent: ['¿alguien ve al GhostAgent? yo no 👀', 'francotirador invisible, qué miedo'],
  rockracer: ['¡brum, brum! 🏎️', 'ese coche va directo a las torres'],
  titanbeta: ['¡TITÁN! cuidado cuando se enfade', 'un gigante en beta, ¿qué puede salir mal?'],
  extras: ['cuatro extras con espadas de cartón', 'los extras cobran en bocadillos'],
  doble: ['el doble hace todas las escenas peligrosas', '¡acrobacia!'],
  detective: ['el Detective busca pistas 🔍', 'elemental, querido chat'],
  heroe: ['¡HéroeDeSaldo al rescate! (2x1)', 'superhéroe de oferta'],
  spoiler: ['¡no me digas el final!', 'el Spoiler va a destrozar la película'],
  kaiju: ['¡KAIJU! 🦖 (se le ve la cremallera)', 'monstruo de goma en camino'],
};
// nombres del chat según tu facción (se mezclan con los de siempre)
const CHAT_USERS_FAC = {
  animales: [['ArdillaConCafé', '#ff9a3c'], ['ZanahoriaLover', '#ffb04f']], nomuertos: [['LichDeGuardia', '#5ef2a0'], ['Huesitos_99', '#e5e7eb']],
  streamers: [['SubDesde2016', '#c084fc'], ['ModVoluntario', '#22d3ee']], heroes: [['HoplitaDeLunes', '#fcd34d'], ['ZeusSinParche', '#ffe14d']],
  ciber: [['Neo_Neon', '#22e3ff'], ['Root_Admin', '#a3ff7a']], memes: [['DogeFan', '#e8a04a'], ['StonksMaster', '#4ade80']],
  gamer: [['GG_WP_99', '#4ade80'], ['NoobEterno', '#86efac']], olvidados: [['Nostalgico_95', '#ecc98f'], ['CartuchoPerdido', '#d6a96a']], pop: [['PalomitasXL', '#ff9ab8'], ['CinefiloDeSofa', '#fda4af']],
};
// despedidas propias de cada facción (las tuyas y las corrompidas)
const QUIPS_FAC = {
  animales: ['¡Mis bellotas!', 'Decidle a la madriguera que la quiero', 'Era un plan… de ardilla'],
  nomuertos: ['Vuelvo enseguida (literal)', 'Otra vez a la tumba', 'Ya estaba muerto, no cuenta'],
  streamers: ['¡Se me ha caído el directo!', 'Nos vemos en el próximo stream', 'Dadle a like antes de que me vaya'],
  heroes: ['¡Por el Olimpo!', 'Los héroes no mueren, los cierra Microblizz', 'Esto lo arregla un parche'],
  ciber: ['Error crítico del sistema', 'Reiniciando…', 'Batería al 0 %'],
  memes: ['F', 'Me ha tocado la mutación mala', 'Not stonks'],
  gamer: ['GG', 'Me voy, que tengo lag', 'Era mi última vida'],
  olvidados: ['Otra vez al olvido…', 'Nadie se acordará de mí', 'Cancelado de nuevo'],
  pop: ['¡Corten!', 'Volveré en la secuela', 'Eso no estaba en el guion'],
};
const QUIPS_CORRUPT = {
  nomuertos: ['¡Por fin descanso en paz!', 'Microblizz no paga ni a los muertos'],
  streamers: ['¡Por fin sin patrocinadores!', 'Fin del directo patrocinado'],
  heroes: ['¡Libre de Microblizz!', 'Me voy a hacer mi propio juego'],
  ciber: ['Firmware de Microblizz desinstalado', 'Sistema liberado'],
  memes: ['Ya puedo volver a hacer gracia', 'Este meme ya es libre'],
  gamer: ['¡Adiós al contrato de exclusividad!', 'Por fin juego por diversión'],
  olvidados: ['¡Por fin fuera del sótano!', 'Gracias por acordaros de mí'],
  pop: ['¡Se acabaron los remakes!', 'Por fin una película original'],
};
// titulares de broma para compartir
const HEADLINES = {
  win: ['Microblizz pierde {c} torres y el CEO llora en su yate', '{L} humilla a Microblizz; la empresa despide a alguien para compensar', 'Microblizz dice que perder «estaba en el plan»', 'Un jugador gana a Microblizz sin comprar ningún pack. Escándalo', 'Microblizz pierde y cierra otro juego para animarse'],
  lose: ['Microblizz gana una partida y lo celebra subiendo el precio del pase', '{F} cae ante Microblizz: «el problema es que no compraste el pack»', 'Microblizz despide a sus bots tras ganar, por si acaso', 'Microblizz gana y el CEO se compra otro yate'],
  unlock: ['{U} se escapan de Microblizz y piden su finiquito', '{U} dejan Microblizz y se unen a la rebelión'],
  boss: ['{B} recibe {S} de daño y dice que no le ha dolido', '{B} aguanta {S} de daño escondido detrás de su montaña de dinero', '{B} recibe {S} de daño y pide un aumento de sueldo'],
};
const HEADLINES_PH = {
  win: ['Phony pierde {c} torres y sube la suscripción para compensar', '{L} humilla a Phony; la empresa culpa a los discos', 'Phony dice que perder «es una experiencia digital exclusiva»', 'Un jugador gana a Phony sin pagar la suscripción. Escándalo'],
  lose: ['Phony gana una partida y lo celebra subiendo los precios', '{F} cae ante Phony: «el problema es que no tenías suscripción»', 'Phony gana y borra la partida de tu biblioteca, por si acaso'],
  unlock: ['{U} se escapan de Phony y exigen sus discos', '{U} rompen su contrato con Phony y se unen a la rebelión'],
};
const GAME_URL = 'jdanielhl1984-commits.github.io/fans-of-rumble';

