// Boceto 3D de Fans of Rumble · Textos: se escriben en español y aquí está su inglés.
// El idioma se elige como en los juegos: el de Opciones (`fansof-idioma`) o, si no hay, el del navegador. Para probar: ?idioma=en
'use strict';

const EN = {
  // pantalla de inicio
  'Boceto 3D': '3D sketch',
  'No es el juego de verdad: es una prueba para ver cómo quedaría Fans of Rumble en 3D.': "It's not the real game: it's a test to see how Fans of Rumble would look in 3D.",
  'Toca tu lado del campo para soltar una unidad.': 'Tap your side of the field to drop a unit.',
  'Pulsa +30 para ver si tu móvil aguanta muchos muñecos a la vez.': 'Press +30 to see if your phone can handle lots of characters at once.',
  'Sube el volumen: las unidades hablan.': 'Turn the volume up: the units talk.',
  'Toca para empezar': 'Tap to start',
  'Tu navegador no puede mostrar 3D (WebGL).': "Your browser can't show 3D (WebGL).",
  // botones y marcador
  'Cámara': 'Camera', 'Lejos': 'Far', 'Cerca': 'Close',
  'Voz': 'Voice', 'Inventada': 'Made-up', 'Del móvil': "Phone's", 'Sin voz': 'Off',
  'Calidad': 'Quality', 'Alta': 'High', 'Baja': 'Low',
  '+30 muñecos': '+30 units',
  'muñecos': 'units', 'muñeco': 'unit',
  'Muy fluido': 'Very smooth', 'Fluido': 'Smooth', 'Justo': 'Borderline', 'Lento': 'Slow',
  'Midiendo…': 'Measuring…',
  'Solo en tu lado del campo': 'Only on your side of the field',
  '¡Victoria!': 'Victory!', '¡Derrota!': 'Defeat!',
  'Otra vez en 4 s': 'Again in 4 s',
  'Líder': 'Leader', 'Común · x2': 'Common · x2', 'Curandera': 'Healer', 'Tanque': 'Tank',
  'Juego automático': 'Auto play',
  // lo que dicen las unidades
  '¡CAOS!': 'CHAOS!',
  '¡Zanahoria al poder!': 'Carrot power!',
  '¡Abran paso al rey!': 'Make way for the king!',
  '¡Salto, salto, SALTO!': 'Jump, jump, JUMP!',
  '¡Bellotaaas!': 'Acoooorns!',
  '¡Más rápida que un parche!': 'Faster than a patch!',
  '¡A morder tobillos!': 'Ankle-biting time!',
  'Hago horas extra gratis…': 'Unpaid overtime again…',
  '¿Esto cuenta como prácticas?': 'Does this count as an internship?',
  'Mi jefe me está mirando…': 'My boss is watching…',
  'Solo quería un café…': 'I just wanted a coffee…',
  'Por fin, vacaciones…': 'Finally, a holiday…',
  'Microblizz: «esa torre nos sobraba»': 'Microblizz: "we didn\'t need that tower anyway"',
  '¡Nuestra torre!': 'Our tower!',
  '¡Enfermera de guardia!': 'Nurse on duty!', '¿Quién necesita una tirita?': 'Who needs a plaster?',
  '¡Muuu! ¡Mecha listo!': 'Mooo! Mecha ready!', '¡Leche y acero!': 'Milk and steel!',
  '¡Muuu! ¡Aún no he terminado!': "Mooo! I'm not done yet!",
  '¡Congelados! Como vuestros sueldos.': 'Frozen! Just like your wages.', 'Actualización obligatoria: ¡quietos!': "Mandatory update: don't move!",
  // la misión
  'Jugar la misión': 'Play the mission', 'Modo libre (prueba +30)': 'Free mode (+30 test)', 'Modo libre': 'Free mode',
  'Una partida corta con historia: unos 3 minutos.': 'A short match with a story: about 3 minutes.',
  'Saltar': 'Skip', 'Toca para seguir': 'Tap to continue', 'Otra vez': 'Again', 'Música': 'Music', 'Sí': 'On', 'No': 'Off',
  'Derriba la sede de Microblizz': 'Bring down the Microblizz HQ', 'Derrota a SurvivalBot y tira la sede': 'Beat SurvivalBot and bring down the HQ',
  'Comentarista': 'Commentator', 'Oro': 'Gold', 'Te falta oro': 'Not enough gold', 'Solo un líder a la vez': 'Only one leader at a time',
  'La Madriguera sigue en pie y el juego sigue abierto.': 'The Burrow still stands and the game stays open.',
  'Microblizz ha cerrado el juego… por ahora.': 'Microblizz has shut the game down… for now.',
  'Curandera · 3': 'Healer · 3', 'Tanque · 5': 'Tank · 5', 'Líder · 4': 'Leader · 4', 'Común · x2 · 2': 'Common · x2 · 2',
  '¡Buenas noches y bienvenidos a Fans of Rumble 3D! Soy Paco Rumble.': "Good evening and welcome to Fans of Rumble 3D! I'm Paco Rumble.",
  'Microblizz ha comprado nuestro juego favorito… ¡para cerrarlo!': 'Microblizz has bought our favourite game… to shut it down!',
  '¡Ni hablar! Soy CrazyBunny y vengo a por su sede.': "No way! I'm CrazyBunny and I'm coming for their HQ.",
  '¡Y nosotras mordemos tobillos!': 'And we bite ankles!',
  'Yo os curo. Quedaos cerca de mí.': "I'll heal you. Stay close to me.",
  '¡Muuu! Yo aguanto lo que me echen.': 'Mooo! I can take anything you throw at me.',
  'Toca tu lado del campo para soltar cartas. ¡A por la sede de Microblizz!': 'Tap your side of the field to play cards. Go for the Microblizz HQ!',
  '¡Atención! ¡Se abren las puertas de la sede!': 'Attention! The HQ doors are opening!',
  '¡Soy SurvivalBot! Sobrevivo a todo… menos a las críticas.': "I'm SurvivalBot! I survive everything… except reviews.",
  'Vuestro juego queda… ¡CERRADO!': 'Your game is hereby… SHUT DOWN!',
  '¡Lo hemos conseguido! ¡El juego sigue abierto!': 'We did it! The game stays open!', '¡Victoria para los animales!': 'Victory for the animals!',
  '¡VICTORIA! ¡Qué partido, señoras y señores!': 'VICTORY! What a match, ladies and gentlemen!',
  'Microblizz se lleva la partida… por esta vez.': 'Microblizz takes the match… this time.',
  '¡Sale CrazyBunny! ¡Esto se pone loco!': "Here comes CrazyBunny! Things are getting crazy!", '¡El rey de los animales entra al campo!': 'The king of the animals takes the field!',
  '¡Dos ardillas! ¡Cuidado con los tobillos!': 'Two squirrels! Watch your ankles!', '¡Ardillas al ataque!': 'Squirrels, attack!',
  '¡Llega la enfermera! Dicen que cura hasta los lunes.': 'The nurse is here! They say she can even cure Mondays.', '¡MeerCat en el campo! Tiritas para todos.': 'MeerCat on the field! Plasters for everyone.',
  '¡Una vaca en un mecha! ¡Lo que hay que ver!': "A cow in a mecha! Now I've seen everything!", '¡Llega la MechaVaca! Eso pesa como tres becarios.': 'Here comes the MechaVaca! It weighs as much as three interns.',
  '¡SALTO DEL CAOS! ¡Qué barbaridad!': 'CHAOS JUMP! Unbelievable!', '¡Ha caído encima de todos!': 'She landed right on top of them!', '¡Menudo salto, señores!': 'What a jump, folks!',
  '¡Tiritas para todos!': 'Plasters for everyone!', '¡MeerCat al rescate!': 'MeerCat to the rescue!',
  '¡Ha reventado el mecha… y la vaca sigue peleando!': 'The mecha blew up… and the cow keeps fighting!',
  '¡Congelados! ¡Como los sueldos de Microblizz!': 'Frozen! Just like Microblizz wages!',
  '¡TORRE! ¡Una torre menos para Microblizz!': 'TOWER! One less tower for Microblizz!', '¡Se cae la torre! ¡Qué golpe!': 'The tower falls! What a hit!',
  '¡Ay! Han tirado una de nuestras torres.': 'Ouch! They took down one of our towers.',
  '¡SurvivalBot ha caído! ¡La sede está indefensa!': 'SurvivalBot is down! The HQ is defenceless!',
  'Otro becario que se va a casa.': 'Another intern heading home.', 'Ese becario no vuelve el lunes.': "That intern won't be back on Monday.",
  '¡Que se te sale el oro! ¡Gasta, gasta!': "Your gold is overflowing! Spend, spend!",
};

const pedido = (() => {
  try {
    const q = new URLSearchParams(location.search).get('idioma');
    return q || localStorage.getItem('fansof-idioma') || '';
  } catch (e) { return ''; }
})();

export const IDIOMA = pedido || ((navigator.language || 'es').toLowerCase().startsWith('es') ? 'es' : 'en');

export function tr(s) { return IDIOMA === 'es' ? s : (EN[s] ?? s); }

// traduce los textos de la página marcados con data-t (el texto de dentro es el español)
export function traducirPagina() {
  document.documentElement.lang = IDIOMA;
  for (const el of document.querySelectorAll('[data-t]')) el.textContent = tr(el.textContent.trim());
}

// lo que dice cada unidad, según el momento
export const FRASES = {
  bunny: { sale: ['¡CAOS!', '¡Zanahoria al poder!', '¡Abran paso al rey!', '¡Salto, salto, SALTO!'], salto: ['¡CAOS!'] },
  squirrel: { sale: ['¡Bellotaaas!', '¡Más rápida que un parche!', '¡A morder tobillos!'] },
  becario: { sale: ['Hago horas extra gratis…', '¿Esto cuenta como prácticas?', 'Mi jefe me está mirando…', 'Solo quería un café…'], cae: ['Por fin, vacaciones…'] },
  meercat: { sale: ['¡Enfermera de guardia!', '¿Quién necesita una tirita?'] },
  mechavaca: { sale: ['¡Muuu! ¡Mecha listo!', '¡Leche y acero!'] },
  survivalbot: { congela: ['¡Congelados! Como vuestros sueldos.', 'Actualización obligatoria: ¡quietos!'] },
};

// lo que dice Paco Rumble, el comentarista, según lo que pasa en la misión
export const NARRADOR = {
  llega_bunny: ['¡Sale CrazyBunny! ¡Esto se pone loco!', '¡El rey de los animales entra al campo!'],
  llega_squirrel: ['¡Dos ardillas! ¡Cuidado con los tobillos!', '¡Ardillas al ataque!'],
  llega_meercat: ['¡Llega la enfermera! Dicen que cura hasta los lunes.', '¡MeerCat en el campo! Tiritas para todos.'],
  llega_mechavaca: ['¡Una vaca en un mecha! ¡Lo que hay que ver!', '¡Llega la MechaVaca! Eso pesa como tres becarios.'],
  salto: ['¡SALTO DEL CAOS! ¡Qué barbaridad!', '¡Ha caído encima de todos!', '¡Menudo salto, señores!'],
  cura: ['¡Tiritas para todos!', '¡MeerCat al rescate!'],
  vaca: ['¡Ha reventado el mecha… y la vaca sigue peleando!'],
  congela: ['¡Congelados! ¡Como los sueldos de Microblizz!'],
  torreSuya: ['¡TORRE! ¡Una torre menos para Microblizz!', '¡Se cae la torre! ¡Qué golpe!'],
  torreNuestra: ['¡Ay! Han tirado una de nuestras torres.'],
  jefeCae: ['¡SurvivalBot ha caído! ¡La sede está indefensa!'],
  becario: ['Otro becario que se va a casa.', 'Ese becario no vuelve el lunes.'],
  oro: ['¡Que se te sale el oro! ¡Gasta, gasta!'],
};
