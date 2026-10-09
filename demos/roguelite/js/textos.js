// Fans of Roguelite (prototipo) · Textos: se escriben en español en el código y aquí está su inglés.
// El idioma se elige como en los juegos: el de Opciones (`fansof-idioma`) o, si no hay, el del navegador. Para probar: ?idioma=en
'use strict';

const EN = {
  // pantallas y marcador
  'Fans of Roguelite': 'Fans of Roguelite', 'Fans of': 'Fans of', 'Roguelite': 'Roguelite', 'Prototipo': 'Prototype',
  'CrazyBunny camina solo hacia las oficinas de Microblizz. Tú eliges qué aprende por el camino.': 'CrazyBunny walks on his own to the Microblizz offices. You choose what he learns along the way.',
  'Empezar': 'Start', '6 días · 1 jefe · unos 2 minutos': '6 days · 1 boss · about 2 minutes',
  'Día {n}/{t}': 'Day {n}/{t}', 'Día {n}': 'Day {n}', 'Nv {n}': 'Lv {n}', 'ATQ': 'ATK', 'VIDA MÁX': 'MAX HP',
  'Otra vez': 'Again', 'Biblioteca': 'Library', 'Nivel {n} · {m} monedas': 'Level {n} · {m} coins',
  '¡SurvivalBot despedido!': 'SurvivalBot fired!', '¡Te han despedido!': "You're fired!",
  'Las oficinas de Microblizz, en el próximo prototipo.': 'The Microblizz offices, in the next prototype.',
  'Microblizz te agradece los servicios prestados.': 'Microblizz thanks you for your services.',
  'Elige una habilidad': 'Choose a skill', '¡Cofre! Elige una habilidad': 'Chest! Choose a skill',
  // rótulos de la escena
  '¡CRÍTICO!': 'CRITICAL!', '¡HUELGA!': 'STRIKE!', '¡JEFE!': 'BOSS!', '¡LLUVIA DE BELLOTAS!': 'ACORN RAIN!', '¡NIVEL {n}!': 'LEVEL {n}!',
  '¡RABIA!': 'RAGE!', '¡SE RASCA!': 'SCRATCHING!', 'CAFÉ': 'COFFEE',
  '¡CAOS!': 'CHAOS!', '¡Bellotaaas!': 'Acoooorns!', '¡Café gratis!': 'Free coffee!', '¿Firmamos?': 'Shall we sign?',
  // lo que va pasando
  'Día {n}: {t}.': 'Day {n}: {t}.', '{q}: {d}{n}': '{q}: {d}{n}', 'Aprendes {h}.': 'You learn {h}.', '+{n} monedas.': '+{n} coins.',
  'La CajaBotín ha soltado algo bueno: ¡habilidades raras!': 'The LootBox dropped something good: rare skills!',
  'Pulgas: se rasca y pierde el turno.': 'Fleas: it scratches and loses its turn.',
  'Te han despedido. Microblizz te agradece los servicios prestados.': "You're fired. Microblizz thanks you for your services.",
  '¡Chaos Jump!': 'Chaos Jump!', '¡Despido fulminante!': 'Instant layoff!', '¡Golpe crítico!': 'Critical hit!',
  '¡Huelga general! Ese golpe no cuenta.': "General strike! That hit doesn't count.", '¡Lluvia de bellotas!': 'Acorn rain!', '¡Rabia! Otro golpe.': 'Rage! Another hit.',
  '¡Subes a nivel {n}! Más vida y más ataque.': 'Level {n}! More health and more attack.',
  '¡SurvivalBot despedido! Las oficinas de Microblizz están a la vista… en el próximo prototipo.': 'SurvivalBot fired! The Microblizz offices are in sight… in the next prototype.',
  // rarezas
  'Común': 'Common', 'Poco común': 'Uncommon', 'Rara': 'Rare', 'Épica': 'Epic', 'Legendaria': 'Legendary',
  // habilidades
  'Zanahoria afilada': 'Sharpened carrot', '+5 de ataque.': '+5 attack.',
  'Pelusa extra': 'Extra fluff', '+30 de vida máxima y te curas 30.': '+30 max health and you heal 30.',
  'Rabia': 'Rage', 'Un 35 % de las veces pegas dos veces.': '35% of the time you hit twice.',
  'Botiquín del bosque': 'Forest first-aid kit', 'Te curas el 25 % del daño que haces.': 'You heal 25% of the damage you deal.',
  'Ojo en espiral': 'Spiral eye', '+25 % de golpes críticos (daño x2).': '+25% critical hits (x2 damage).',
  'Lluvia de bellotas': 'Acorn rain', 'Cada 3 turnos caen 3 bellotas de 7 de daño.': 'Every 3 turns, 3 acorns fall for 7 damage each.',
  'Pulgas': 'Fleas', 'El enemigo se rasca y pierde su primer turno.': 'The enemy scratches and loses its first turn.',
  'MadSquirrel': 'MadSquirrel', 'Una ardilla te sigue y muerde cada turno: 6 de daño.': 'A squirrel follows you and bites every turn: 6 damage.',
  'Huelga general': 'General strike', 'El primer golpe de cada combate no te hace nada.': 'The first hit of each fight does nothing to you.',
  'Chaos Jump': 'Chaos Jump', 'Cada 3 turnos saltas encima del enemigo: daño x3.': 'Every 3 turns you jump on the enemy: x3 damage.',
  // enemigos
  'Becario': 'Intern', 'StarBot': 'StarBot', 'CajaBotín': 'LootBox', 'SurvivalBot': 'SurvivalBot',
  'Un Becario de Microblizz te corta el paso con un café en la mano.': 'A Microblizz Intern blocks your way, coffee in hand.',
  '¿Esto cuenta como prácticas?': 'Does this count as an internship?', 'Por fin, vacaciones…': 'Finally, a holiday…',
  'Un StarBot baja del cielo. Te está grabando para un anuncio.': "A StarBot comes down from the sky. It's filming you for an ad.",
  'Escaneando… talento no rentable.': 'Scanning… unprofitable talent.', 'Error 404: dron no encontrado.': 'Error 404: drone not found.',
  'Una CajaBotín brillante en mitad del camino. Huele a trampa.': 'A shiny LootBox in the middle of the road. Smells like a trap.',
  '¡Ábreme! Solo 9,99 €.': 'Open me! Only €9.99.', 'Contenía… polvo.': 'It contained… dust.',
  'SurvivalBot vigila la puerta de las oficinas. Lleva corbata.': 'SurvivalBot guards the office door. It wears a tie.',
  'Tu puesto ha sido optimizado.': 'Your position has been optimized.', 'Error: no encuentro mi finiquito.': "Error: can't find my severance pay.",
  // los días
  'La compra': 'The buyout', 'Microblizz ha comprado el bosque. CrazyBunny sale de La Madriguera con su zanahoria.': 'Microblizz has bought the forest. CrazyBunny leaves The Burrow with his carrot.',
  'El café de Lola': "Lola's coffee", 'Lola': 'Lola',
  'Lola, despedida por Microblizz, ha montado un puesto de café en el camino. «Invita la casa. La casa soy yo.»': 'Lola, fired by Microblizz, has set up a coffee stand on the road. "On the house. I am the house."',
  'Café triple': 'Triple espresso', '+6 de ataque, pero te tiemblan las patas: -10 de vida.': '+6 attack, but your paws shake: -10 health.',
  'Café con leche': 'Latte', 'Te sientas un rato con Lola: te curas 50.': 'You sit with Lola for a while: you heal 50.',
  '«Vuelve cuando quieras. Bueno, cuando cierre Microblizz.»': '"Come back anytime. Well, when Microblizz closes."',
  '«Me despidieron por correo. Con faltas de ortografía.»': '"They fired me by email. With spelling mistakes."',
  'Drones de vigilancia': 'Surveillance drones', 'La letra pequeña': 'The fine print', 'Abogado': 'Lawyer',
  'Un abogado de Microblizz te ofrece un contrato. La letra pequeña es MUY pequeña.': 'A Microblizz lawyer offers you a contract. The fine print is VERY fine.',
  'Firmar': 'Sign', '+50 % de ataque, pero te quitan 30 de vida máxima.': '+50% attack, but you lose 30 max health.',
  'Leer la letra pequeña': 'Read the fine print', 'Pagan en «visibilidad». Te ríes tanto que te curas 30.': 'They pay in "exposure". You laugh so hard you heal 30.',
  '«Un placer hacer negocios. Sobre todo para mí.»': '"A pleasure doing business. Mostly for me."',
  '«Mi cliente lo lamenta mucho.»': '"My client is very sorry."', 'No lo lamenta.': "It isn't.",
  'Oferta especial': 'Special offer',
  // carteles del camino
  'MICROBLIZZ': 'MICROBLIZZ', 'TE QUIERE': 'LOVES YOU', 'JUGAR ES': 'PLAYING IS', 'TRABAJAR': 'WORKING',
  '¡OFERTA!': 'SALE!', 'CAJAS DE BOTÍN': 'LOOT BOXES', 'SE BUSCAN': 'NOW HIRING', 'BECARIOS': 'INTERNS',
  'TUS DATOS': 'YOUR DATA', 'NOS ENCANTAN': 'WE LOVE IT', 'PRÓXIMAMENTE': 'COMING SOON', 'MÁS ANUNCIOS': 'MORE ADS',
};

const IDIOMA_RL = (() => {
  let q = '';
  try { q = new URLSearchParams(location.search).get('idioma') || localStorage.getItem('fansof-idioma') || ''; } catch (e) { /* sin guardar */ }
  if (!q) for (const l of (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'es'])) { const c = String(l).slice(0, 2).toLowerCase(); if (c === 'es' || c === 'en') { q = c; break; } }
  return q === 'es' ? 'es' : 'en';
})();
document.documentElement.lang = IDIOMA_RL;
function tr(s) { return IDIOMA_RL === 'es' ? s : (EN[s] ?? s); }
