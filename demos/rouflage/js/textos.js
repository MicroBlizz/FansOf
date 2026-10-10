// Fans of Rouflage (prototipo) · TEXTOS: en el código y en la página van en español, y aquí está su inglés.
// El idioma se elige como en los demás juegos: el guardado (`fansof-idioma`) o, si no hay, el del navegador. Para probar: ?idioma=en
'use strict';

const EN = {
  // marcador y botones
  'CAMALEÓN': 'CHAMELEON', 'CAZADOR': 'HUNTER', 'Píntate': 'Paint yourself', 'Preparados': 'Get ready', 'Aguanta': 'Hold on', 'Encuéntralos': 'Find them',
  'CAMUFLAJE': 'CAMOUFLAGE', 'CARTAS': 'SLIPS', 'COLADOS': 'INTRUDERS', 'PINTAR': 'PAINT', 'CONGELAR': 'FREEZE', 'MOVERSE': 'MOVE', 'SILBAR': 'WHISTLE',
  '¡LISTO!': 'READY!', 'Que salgan ya': 'Let them out', 'Espacio': 'Space', 'TÚ': 'YOU', 'Tú': 'You', 'Becario {n}': 'Intern {n}', 'Becario': 'Intern',
  'Segundos para el próximo silbido obligatorio': 'Seconds until the next forced whistle',
  'Cartas de despido: fallar gasta una, acertar la devuelve': 'Pink slips: a miss costs one, a hit gives it back',
  // el taller de pintura
  'Toca el suelo para coger su color y pinta tu cuerpo con el dedo.': 'Tap the floor to pick up its colour, then paint your body with your finger.',
  'Color': 'Colour', 'Fino': 'Fine', 'Medio': 'Medium', 'Gordo': 'Thick', 'Rellenar': 'Fill', 'Deshacer': 'Undo', 'Calco': 'Trace', 'LISTO': 'DONE',
  'Cuentagotas: coge el color que toques (I)': 'Eyedropper: picks up the colour you tap (I)',
  'Pincel fino (1)': 'Fine brush (1)', 'Pincel medio (2)': 'Medium brush (2)', 'Pincel gordo (3)': 'Thick brush (3)',
  'Rellenar todo el cuerpo con el color (R)': 'Fill your whole body with the colour (R)', 'Deshacer (Z)': 'Undo (Z)',
  'Calco: ver el suelo a través de tu cuerpo (C)': 'Trace: see the floor through your body (C)',
  // pistas
  'Ve a donde quieras esconderte y toca PINTAR': 'Go where you want to hide and tap PAINT',
  'Toca CONGELAR para quedarte quieto y desaparecer': 'Tap FREEZE to hold still and vanish',
  'Congelado. Toca ¡LISTO! o retócate con PINTAR': 'Frozen. Tap READY! or touch up with PAINT',
  'Quieto. Si un becario pone «!», sal corriendo': 'Hold still. If an intern shows "!", run for it',
  'Arrastra para andar. Toca donde creas que hay un colado': 'Drag to walk. Tap where you think someone is hiding',
  'WASD para andar. Haz clic donde creas que hay un colado': 'WASD to walk. Click where you think someone is hiding',
  'Sin pintar se te ve mucho: toca PINTAR': 'Unpainted, you stand out: tap PAINT',
  '¡Te ha visto! Arrastra para salir corriendo': "You've been spotted! Drag to run for it",
  '¡Se te ve! Corre a otro sitio y toca CONGELAR': 'You can be seen! Run somewhere else and tap FREEZE',
  'Un becario sospecha de ti: quieto… o corre': 'An intern suspects you: hold still… or run',
  'Se te ve mucho: mejor píntate un poco más': 'You stand out a lot: better paint a bit more',
  'Regular: de lejos cuelas, de cerca no': "So-so: fine from afar, not up close",
  'Bien pintado. De cerca aún te la juegas': 'Nicely painted. Up close it is still a gamble',
  '¡Casi no se te ve!': 'You can barely be seen!',
  'Demasiado lejos: acércate más': 'Too far: get closer', 'Ahí no llegas: hay un muro en medio': "Can't reach: there's a wall in the way",
  // carteles y avisos de la partida
  '¡PÍNTATE!': 'PAINT YOURSELF!', 'Busca un sitio, cópiale los colores y congélate': 'Pick a spot, copy its colours and freeze',
  '¡QUE VIENEN!': 'HERE THEY COME!', '¡A BUSCAR!': 'GO FIND THEM!', 'Microblizz apaga las luces para ahorrar': 'Microblizz turns the lights off to save money',
  'Hay {n} colados. Toca donde creas que hay uno.': '{n} intruders are hiding. Tap where you think one is.',
  'Los becarios salen de Recursos Humanos': 'The interns are leaving Human Resources', 'Los colados ya están escondidos': 'The intruders are already hidden',
  'Silbido obligatorio en 5 segundos': 'Forced whistle in 5 seconds', '¡RECTA FINAL!': 'FINAL STRETCH!',
  'Los becarios reciben un chivatazo': 'The interns get a tip-off', 'Los colados silban más a menudo': 'The intruders whistle more often',
  'Has despedido a {b}': 'You fired {b}', '{a} te ha despedido': '{a} fired you', '{a} ha despedido a {b}': '{a} fired {b}',
  '{a} ha despedido a {b}. Despido improcedente.': '{a} fired {b}. Wrongful dismissal.', '{a} ha fallado. Despido improcedente.': '{a} missed. Wrongful dismissal.',
  '{a} se ha quedado sin cartas de despido': '{a} has run out of pink slips',
  'Has despedido a {b}. Despido improcedente.': 'You fired {b}. Wrongful dismissal.',
  'Ahí no había nadie. Despido improcedente: pierdes una carta.': 'Nobody was there. Wrongful dismissal: you lose a pink slip.',
  'un extintor': 'a fire extinguisher', 'una papelera': 'a bin', 'un cono': 'a traffic cone', 'el Empleado del Mes': 'the Employee of the Month',
  '¡Ay!': 'Eek!', '¡Uf!': 'Phew!', 'DESPEDIDO': 'FIRED',
  // el final
  '¡TE HAS LIBRADO!': 'YOU GOT AWAY!', '¡SIN CARTAS!': 'OUT OF SLIPS!', '¡DESPEDIDO!': "YOU'RE FIRED!", '¡TODOS DESPEDIDOS!': 'ALL FIRED!', 'SE TE HAN ESCAPADO': 'THEY GOT AWAY',
  'Se acaba el turno de noche y nadie te ha visto.': 'The night shift is over and nobody saw you.',
  'Los becarios se han quedado sin cartas de despido.': 'The interns ran out of pink slips.',
  'Y eso que ni siquiera trabajabas aquí.': "And you didn't even work here.",
  'Microblizz te felicita. El sueldo no te lo sube, claro.': 'Microblizz congratulates you. No raise, of course.',
  'Demasiados despidos improcedentes. Recursos Humanos quiere verte.': 'Too many wrongful dismissals. Human Resources wants a word.',
  'Se acabó tu turno y aún quedaban {n} colados.': 'Your shift is over and {n} intruders were still hiding.',
  'Camuflaje': 'Camouflage', 'Has aguantado': 'You lasted', 'Delante de sus narices': 'Right under their noses', 'Silbidos por gusto': 'Whistles for fun',
  'Compañeros en pie': 'Teammates still standing', 'Despedidos': 'Fired', 'Despidos improcedentes': 'Wrongful dismissals', 'Cartas que te quedan': 'Pink slips left',
  'Tiempo de sobra': 'Time to spare', 'PUNTOS': 'POINTS', 'OTRA VEZ': 'AGAIN', 'Ahora de cazador': 'Now as hunter', 'Ahora de camaleón': 'Now as chameleon', 'Menú': 'Menu',
  'No le han pillado': 'Never caught', 'Despedido': 'Fired', 'Dónde estaba cada uno': 'Where everyone was',
  // título, ayuda y pausa
  'El escondite con pintura': 'Hide-and-seek with paint',
  'Píntate como el suelo, congélate y que no te encuentren.': "Paint yourself like the floor, freeze and don't get found.",
  'Linterna en mano: encuentra a los cinco colados.': 'Flashlight in hand: find the five intruders.',
  'Cómo se juega': 'How to play', 'Biblioteca': 'Library', 'Sonido': 'Sound', 'Música': 'Music', 'Pausa': 'Pause', 'Fans of Rouflage': 'Fans of Rouflage',
  'Prototipo de la serie Fans Of. Es una parodia hecha por fans: Microblizz no existe (por suerte).': "A Fans Of series prototype. It's a fan-made parody: Microblizz doesn't exist (luckily).",
  'CÓMO SE JUEGA': 'HOW TO PLAY', 'De camaleón': 'As a chameleon', 'De cazador': 'As a hunter', 'ENTENDIDO': 'GOT IT',
  'Tienes <b>45 segundos</b>. Busca un sitio: un suelo con dibujo, una pared, detrás de una planta…': 'You have <b>45 seconds</b>. Pick a spot: a patterned floor, a wall, behind a plant…',
  'Toca <b>PINTAR</b>. Toca el suelo para coger su color y pinta tu cuerpo. Con <b>Calco</b> ves el suelo a través de ti.': 'Tap <b>PAINT</b>. Tap the floor to pick up its colour and paint your body. <b>Trace</b> lets you see the floor through yourself.',
  'Toca <b>CONGELAR</b>: desaparecen tu contorno, tu sombra y tus orejas. Solo queda la pintura.': 'Tap <b>FREEZE</b>: your outline, shadow and ears vanish. Only the paint is left.',
  'Aguanta hasta que acabe el turno. Cada cierto tiempo <b>silbarás</b> sin querer y los becarios irán a mirar.': "Hold on until the shift ends. Every so often you'll <b>whistle</b> without meaning to, and the interns will come and look.",
  'Hay <b>5 colados</b> pintados por la estación. Busca manchas raras: dibujos torcidos, colores que no casan.': "<b>5 intruders</b> are painted somewhere in the station. Look for odd patches: crooked patterns, colours that don't match.",
  '<b>Toca</b> donde creas que hay uno para despedirlo. Tiene que estar cerca y sin muros en medio.': '<b>Tap</b> where you think one is to fire them. They must be close, with no walls in between.',
  'Tienes <b>5 cartas de despido</b>. Fallar gasta una y te deja medio a oscuras; acertar te la devuelve.': 'You have <b>5 pink slips</b>. A miss costs one and dims your light; a hit gives it back.',
  'Los <b>silbidos</b> te dicen por dónde andan. Si alumbras a uno un buen rato, se pone nervioso y tiembla.': 'The <b>whistles</b> tell you roughly where they are. Shine your light on one for a while and it gets nervous and shakes.',
  'PAUSA': 'PAUSED', 'SEGUIR': 'RESUME', 'Empezar de nuevo': 'Start over', 'Salir al menú': 'Back to menu',
  // lo que pone en el mapa: carteles, lápidas y cajas
  'EMPLEADO DEL MES': 'EMPLOYEE OF THE MONTH', 'NADIE': 'NOBODY', 'TRABAJA MÁS': 'WORK MORE', 'COBRA MENOS': 'EARN LESS', 'CAFÉ LOLA': "LOLA'S CAFÉ",
  'HOY NO HAY': 'NO BREAKS', 'DESCANSO': 'TODAY', 'SONRÍE': 'SMILE', 'TE GRABAMOS': "YOU'RE ON CAMERA", 'LA NUBE': 'THE CLOUD', 'RR. HH.': 'H.R.', 'ALMACÉN': 'STORAGE',
  'RECURSOS HUMANOS': 'HUMAN RESOURCES', 'JUEGOS': 'CANCELLED', 'CANCELADOS': 'GAMES', 'AQUÍ YACEN TUS JUEGOS FAVORITOS': 'HERE LIE YOUR FAVOURITE GAMES',
  'SERVIDORES': 'SERVERS', 'APAGADOS': 'SHUT DOWN', 'EL DLC': 'THE DLC', 'NUNCA LLEGÓ': 'NEVER CAME',
  'AQUÍ YACE': 'HERE LIES', 'UN MMO': 'AN MMO', 'CERRADO': 'CLOSED DUE', 'POR RECORTES': 'TO CUTBACKS', 'R.I.P.': 'R.I.P.', 'VERSIÓN 1.0': 'VERSION 1.0',
  'DESCANSE': 'REST IN', 'EN PARCHE': 'PATCH', 'FALTABA': 'NEEDED', 'UN PASE': 'A PASS', 'MODO HISTORIA': 'STORY MODE',
};

const IDIOMA_RF = (() => {
  let q = '';
  try { q = new URLSearchParams(location.search).get('idioma') || localStorage.getItem('fansof-idioma') || ''; } catch (e) { /* sin guardar */ }
  if (!q) for (const l of (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'es'])) { const c = String(l).slice(0, 2).toLowerCase(); if (c === 'es' || c === 'en') { q = c; break; } }
  return q === 'es' ? 'es' : 'en';
})();
document.documentElement.lang = IDIOMA_RF;
function tr(s) { return IDIOMA_RF === 'es' ? s : (EN[s] ?? s); }

// la página: data-tr traduce el texto de un elemento; data-tr-html, su contenido con negritas; data-tr-aria y data-tr-title, sus descripciones
function traducePagina() {
  for (const el of document.querySelectorAll('[data-tr]')) el.textContent = tr(el.textContent.trim());
  for (const el of document.querySelectorAll('[data-tr-html]')) el.innerHTML = tr(el.innerHTML.trim());
  for (const el of document.querySelectorAll('[data-tr-aria]')) el.setAttribute('aria-label', tr(el.getAttribute('aria-label')));
  for (const el of document.querySelectorAll('[data-tr-title]')) el.setAttribute('title', tr(el.getAttribute('title')));
}
