// Fans of Rumble · Progresión (3/5): el pack de bienvenida y las frases del chat y de las despedidas
'use strict';

/* ---------- v0.9.5: tienda, pase de batalla y sátira ---------- */
// La tienda es común (core/js/sistema/progreso.js); este juego le añade el pack de bienvenida
SHOP.starter = { gems: 600, gold: 5000, eur: 4.99 };   // v0.9.11: solo una vez; vale casi el doble que por separado
// frases de despedida al caer (humor)
const QUIPS = {
  microblizz: ['¿Me han despedido?', 'Me llevo la grapadora', '¿Y mi finiquito?', '¿Me puedo quedar la taza?', 'Me cambian por un robot más barato', 'Ocho años aquí y me echan por correo', 'Me faltaban 2 años para ser fijo', '¿Esto cuenta como vacaciones?', 'Error 404: trabajo no encontrado', 'Mi jefe dijo que éramos una familia', 'Dejo el juego a medias', 'El CEO se ha comprado otro yate'],
  corrupt: ['¡Por fin libre!', 'Microblizz me prometió fama', 'Mi contrato tenía letra pequeña', 'Gracias, necesitaba vacaciones', 'Dile a Microblizz que me voy', 'Volveré… en el DLC', '¡Que cierren otro juego, no a mí!'],
  // v0.9.13
  phony: ['¡Mi licencia ha caducado!', 'Me han dado de baja', 'Solo era un alquiler', 'Error: se requiere conexión', 'Vuelvo en la próxima suscripción', 'Me han borrado de la biblioteca', 'Contenido no disponible', 'Pagué 70 € por esto'],
  corruptPh: ['¡Por fin libre!', 'Phony me prometió fama', 'Mi contrato tenía letra pequeña', 'Gracias, necesitaba vacaciones', 'Dile a Phony que me voy', 'Volveré… en el remake', '¡Que suban el precio a otro!'],
  player: ['¡Ha sido el lag!', 'Nerfeadme esto', 'GG', 'Me han reportado', 'Vuelvo en 5 minutos', 'Era un plan', 'Respawn, por favor'],
};
// v0.9.13: en la campaña 2 el chat se queja de Phony (estas frases sustituyen a las de Microblizz)
const CHAT_PH = {
  start: ['¡Empieza! A ver si hoy alguien le gana a Phony', 'primer', 'hola desde el trabajo 👀', 'llego tarde, ¿qué me he perdido?', '¡vamos rebelión! #DevolvedLosDiscos'],
  idle: ['mi abuela tenía discos y era feliz', 'POV: eres un becario de Phony', 'el chat está más vivo que los servidores de Phony', 'yo solo vengo por la música', '¿dónde se compra el CAOS? ¿hace falta suscripción?', 'Phony ha subido otra vez la suscripción', 'nerf Phony', '¿esto es pay to win?', 'mod, banéalo', 'LOL', '¿quién va ganando?', 'pon música', '¿la PayStation lee discos? (no)', 'hype hype hype', '¿alguien ha leído los términos de la suscripción?', 'mi juego favorito ha desaparecido de la tienda 😭', 'Kappa', 'ese carril está solo', 'más discos, menos suscripciones', 'Phony ha borrado otra película de mi biblioteca', 'le di a comprar y era un alquiler', 'mi consola vieja sigue funcionando sin internet'],
  towerP: ['¡a por la siguiente!', 'una torre menos para Phony', '¡TORRE! 🔥', 'Phony: «esa torre era una exclusiva temporal»', 'F por la torre', 'clip it!!', 'eso le ha dolido a Phony en la cartera', 'torre cancelada, como mi suscripción'],
  towerE: ['eso ha dolido', 'bueno… quedan más torres', 'uff', 'skill issue', 'eso pasa por no pagar la suscripción', 'F', '¡defiende ese carril!', 'Phony lo celebra subiendo los precios'],
  boss: ['¿otra subida de precios?', 'el jefe cobra hasta por respirar', 'eso es pay to win', 'el jefe está chetado', 'nerf jefe ya'],
  stun: ['¡los ha desconectado a todos! 📵', 'servidores caídos, cómo no', 'Phony: «estamos en mantenimiento»', 'sin conexión, como siempre'],
  baseLowE: ['¡que se cae la sede! 🔥', '¡último empujón!', 'la sede está temblando', 'Phony ya prepara el comunicado'],
  enemyBig: ['¡cuidado, que viene {X}!', 'ojo con ese {X}', 'Phony saca a {X}, se viene lo gordo', '{X} en camino, ¡defiende!'],
  multikill: ['¡MULTIKILL! 🔥', '¡triple cancelación!', 'eso ha sido un reembolso, pero al revés', 'clip it, clip it', '¡qué limpieza!'],
  heal: ['¡la curandera está en todo!', 'curas gratis, sin suscripción', 'menos mal que hay curas', 'esa curación ha salvado la partida'],
  win: ['Phony va a subir la suscripción por envidia', 'el Presidente ha tirado su café', 'GG EZ', '¡VAMOOOS!', '#DevolvedLosDiscos', 'clip para TikTok', 'GG WP', '¡los discos vuelven!'],
  lose: ['mañana más', 'Phony: «lo arreglamos en la próxima suscripción»', 'GG', 'nerf Phony', 'la culpa es de los servidores', 'en la próxima sí', 'F en el chat', 'paga la suscripción (es broma)'],
};
// v0.9.8: el chat habla de tu facción, de la facción enemiga y de cada jefe
const CHAT_FAC = {
  animales: {
    idle: ['¿la ardilla tiene seguro médico?', 'el conejo da miedo, no sé si es de los buenos', 'BoomBeaver: héroe sin capa (ni futuro)', 'Rabia x5 = paz mundial', 'que alguien le quite el café a MadSquirrel', 'la MechaVaca es mi animal espiritual', 'SlyFox ha ido a por tabaco y no vuelve', '¿quién deja a un mapache tirar basura? ah, que es su trabajo', 'más zanahorias para CrazyBunny', 'Animales Locos > cualquier DLC', 'MeerCat cura mejor que mi médico de cabecera'],
    leader: ['¡CONEJO! ¡CONEJO!', 'CrazyBunny ha puesto los ojos en espiral', 'que salte, que salte'],
    towerP: ['¡el castor lo ha vuelto a hacer!', 'rabia nivel: torre derribada', 'esa torre era de madera de pino barato'],
    win: ['la granja le gana al capitalismo', 'zanahorias para todos 🥕', 'el mapache se lleva la basura de Microblizz'],
    lose: ['los animales vuelven a la madriguera 😢', 'el conejo necesita unas vacaciones'],
  },
  nomuertos: {
    idle: ['los zombis de las horas extra tienen mejor horario que yo', '¿Renacer cuenta como horas extra?', 'NecroLord, ¿quieres una bufanda?', 'huele a cripta desde aquí', 'la Banshee necesita un micro con menos ganancia', 'esto me recuerda a cierto rey con corona de pinchos 👀', 'morir y volver: el ciclo de vida de un parche', 'StitchBrute solo quiere abrazos (y torres)', 'esqueletos piratas > esqueletos normales', 'ningún no-muerto ha leído los términos y condiciones'],
    leader: ['¡se levanta el NecroLord!', 'ojo, que invoca', 'el rey de la cripta en directo'],
    towerP: ['torre enviada a la cripta ⚰️', 'RIP torre', 'esa torre no tiene Renacer'],
    win: ['ni la muerte para a estos', 'Microblizz enterrado (otra vez)', 'Renacer GOD'],
    lose: ['vuelta a la tumba… hasta la próxima', 'ni Renacer arregla esto'],
  },
  streamers: {
    idle: ['StreamKing, ¿me saludas?', 'SUB HYPE', 'cuidado, que el moderador es el BanHammer', 'la madre del streamer cura más que mi seguro', 'ese HypeBeast va con 3 bebidas energéticas', '¡que suene el Hype Train! 🚂', 'dono 5 € si tiras la torre', 'pon la cámara, que no se ve', 'ViralBot me está grabando sin permiso', 'más viewers = más daño, es ciencia'],
    leader: ['¡EN DIRECTO!', 'ha llegado el rey del streaming', 'StreamKing modo hype ON'],
    towerP: ['¡RAID A LA TORRE!', 'eso va directo a los destacados', 'clip, clip, CLIP'],
    win: ['récord de viewers', 'clip del año', 'el chat ha ganado esta partida'],
    lose: ['se ha caído el directo', 'el chat se va a otro canal 😢'],
  },
  heroes: {
    idle: ['¿Héroes no lo había cerrado Microblizz?', 'el Minotauro aún busca la salida de su laberinto', 'Medusa, unas gafas de sol, por favor', '¡TEAM FIGHT! ¡TEAM FIGHT!', 'los Hoplitas son el grupo de WhatsApp de la familia', 'ThunderGod lleva años pidiendo un parche', 'el querubín me ha enamorado de este juego', 'la ShieldMaiden aguanta más que mi portátil', 'héroes a nivel 5 sin pagar nada', 'esto es más épico que la última cinemática de Microblizz'],
    leader: ['¡HA LLEGADO EL CAMPEÓN!', 'EpicChampion, el carry de la partida', 'que empiece la team fight'],
    towerP: ['¡torre al Olimpo!', 'eso ha sido mitológico', 'XP para todos'],
    win: ['leyendas de verdad', 'los dioses vuelven a casa', 'MVP para todos'],
    lose: ['Microblizz vuelve a cerrar el Olimpo', 'necesitamos un parche urgente'],
  },
  ciber: {
    idle: ['los escudos son mi única defensa contra los lunes', 'HackerKid ha hackeado mi wifi', 'NeonSniper dispara desde la otra punta del mapa', 'en el Sector Neón hay más neón que gente', 'CyberNinja, teletranspórtate a mi trabajo', '¿los NanoBots pagan IVA?', 'esto me suena a un juego de 1998…', 'drones del cielo: envío urgente versión guerra', 'ese mecha tiene más RGB que mi PC', 'beep boop, GG'],
    leader: ['¡Orbital Drop!', 'CyberMarine en el campo: todos a cubierto', 'ese casco tiene wifi'],
    towerP: ['torre desconectada', '404: torre no encontrada', 'firewall atravesado'],
    win: ['sistema de Microblizz hackeado ✅', 'Ctrl+Alt+Victoria', 'firewall de Microblizz 0, rebelión 1'],
    lose: ['pantalla azul…', 'reiniciando la rebelión'],
  },
  memes: {
    idle: ['¿mutación gigante? mi suerte de siempre: normal', 'el RNG manda', 'Stonks 📈', 'such wow, very rumble', 'ChonkCat se ha sentado y no hay quien lo levante', 'TrollBot va ganando sin hacer nada', 'esto es un meme y aun así juega mejor que yo', 'el GifBlaster tiene más GIFs que mi grupo de amigos', 'MemeLord ha vuelto a sacar carta al azar', 'el perrito dice wow, y tiene razón'],
    leader: ['¡MEMELORD! ¡MEMELORD!', 'que saque carta, que saque carta', 'ha llegado el señor de los memes'],
    towerP: ['torre memeada', 'eso merece un GIF', 'stonks ↑'],
    win: ['GG, very victory, much wow', 'stonks para la rebelión 📈', 'Microblizz ha sido memeado'],
    lose: ['not stonks 📉', 'el RNG nos odia'],
  },
  // v0.9.13
  gamer: {
    idle: ['GG desde ya', 'los noobs juegan peor que yo, y mira que es difícil', 'la Recreativa tiene más vidas que yo', 'el Coleccionista tira sus discos… ¡los físicos! 💿', 'nadie corre más que la Speedrunner', 'el Modder arregla lo que Phony rompe', 'RageQuitter, respira hondo', 'Comunidad al máximo = +30 %', 'esto es mejor que cualquier torneo de pago', '¡insert coin!'],
    leader: ['¡PROGAMER! ¡PROGAMER!', 'ha entrado el campeón', 'a ver ese combo'],
    towerP: ['¡GG, torre!', 'speedrun de torre', 'esa torre era de un noob'],
    win: ['GG WP 🎮', 'la comunidad ha hablado', 'y ahora, devolvednos los discos'],
    lose: ['rage quit 😤', 'lag, seguro que es el lag'],
  },
  olvidados: {
    idle: ['¿os acordáis de ellos? yo tampoco', 'el RetroMarine lleva hombreras de 1998', 'TitánBeta: cancelado pero con ganas', 'los SwarmBugs dan un poco de asco, la verdad', 'ese coche tenía un juego increíble (que nunca salió)', 'el GhostAgent está aquí… creo', 'nostalgia nivel: torre que no te ve', 'el VikingoPerdido aún busca la salida del sótano', 'los juegos cancelados también tienen sentimientos', 'esto huele a cartucho viejo'],
    leader: ['¡VIKINGO! ¡VIKINGO!', 'muro de escudos en camino', 'el vikingo ha encontrado la salida'],
    towerP: ['la torre ni lo vio venir', '¿y ese quién era? ¡BUM!', 'nostalgia 1, torre 0'],
    win: ['los cancelados han vuelto', 'nadie se acordaba de ellos… hasta hoy', 'Microblizz, ¿a que ahora sí te acuerdas?'],
    lose: ['vuelta al sótano…', 'otra vez cancelados 😢'],
  },
  pop: {
    idle: ['¿esto es la secuela o el remake?', 'al Kaiju se le ve la cremallera', 'el HéroeDeSaldo vuela con una capa de cortina', 'Spoiler: gana la rebelión (o no)', 'los Extras cobran en bocadillos', 'el Detective ya sabe quién es el culpable: Phony', '¡ACCIÓN! 🎬', 'palomitas listas 🍿', 'esto pide una tercera parte', 'el DobleDeAcción se lleva todos los golpes'],
    leader: ['¡LA DIRECTORA! 🎬', '¡silencio, se rueda!', 'que grite ¡acción!'],
    towerP: ['¡corten! torre derribada', 'escena de acción de 10', 'esa torre era de cartón piedra'],
    win: ['¡y el premio es para…!', 'final feliz 🍿', 'la secuela será aún mejor'],
    lose: ['fracaso de taquilla 📉', 'directa al olvido de las plataformas'],
  },
};
