// Fans of Auto · TEXTOS: en el código todo va en español y pasa por tr(); su inglés está aquí abajo (EN).
// El idioma se elige como en Fans of Tactics Advance: ?idioma= de la dirección, luego el de la serie (`fansof-idioma`, el de
// Opciones) y, si no hay, el del navegador; lo que no sea español va en inglés. Para probar: ?idioma=en
'use strict';

const VERSION_AUTO = '0.3.1';   // la misma que el ?v= de index.html y la de js/novedades.js

// el inglés de cada frase (español → inglés); una frase nueva del juego lleva aquí su inglés; los huecos {asi} se quedan igual
const EN = {
  // título, menús y opciones
  'FANS OF AUTO': 'FANS OF AUTO', 'DISTRITO BETA ABIERTA · DEMO': 'OPEN BETA DISTRICT · DEMO',
  'Continuar': 'Continue', 'Nueva partida': 'New game', 'Jugar': 'Play', 'Opciones': 'Options', 'PAUSA': 'PAUSE',
  'Volver al título': 'Back to title', 'OPCIONES': 'OPTIONS', 'Sí': 'On', 'No': 'Off', 'Sonido': 'Sound', 'Música': 'Music',
  'Pantalla completa': 'Full screen', 'Gráficos': 'Graphics', 'Bajos (móvil flojo)': 'Low (potato phone)', 'Normales': 'Normal',
  'Mandos al conducir': 'Driving controls', 'Palanca': 'Stick', 'Botones': 'Buttons',
  'Tamaño de los mandos táctiles': 'Touch controls size', 'Pequeños': 'Small', 'Grandes': 'Large',
  'Mandos en pantalla con ratón': 'On-screen controls with mouse', 'Teclas del ordenador': 'Keyboard keys', 'Volver': 'Back',
  'Idioma': 'Language',
  'TECLAS: elige una y pulsa la nueva': 'KEYS: pick one and press the new key', '¿Cuál?': 'Which?', 'Teclas de serie': 'Default keys',
  'Arriba / acelerar': 'Up / accelerate', 'Abajo / frenar': 'Down / brake', 'Izquierda': 'Left', 'Derecha': 'Right',
  'Disparar / freno de mano': 'Shoot / handbrake', 'Entrar o salir del coche': 'Get in or out of the car', 'Claxon': 'Horn', 'Pausa': 'Pause',
  'ESPACIO': 'SPACE', 'ENTRAR': 'ENTER', 'MAYÚS': 'SHIFT', 'MAYÚS D': 'R SHIFT', 'RETROCESO': 'BACKSPACE', 'NUM': 'NUM',
  'Palanca para andar · ENTRAR sube al coche · al volante: < > y GAS': 'Stick to walk · ENTER gets in a car · driving: < > and GAS',
  'Mover:': 'Move:', 'coche ·': 'car ·', 'disparar o freno de mano': 'shoot or handbrake',
  'FIN DEL ACCESO ANTICIPADO': 'EARLY ACCESS IS OVER', 'Cargar la partida guardada': 'Load saved game',
  'Te han cancelado para siempre.': "You've been cancelled for good.", 'Dinero final:': 'Final cash:',
  'No se ha podido cargar. Recarga la página.': "Couldn't load. Reload the page.",
  // la carga
  'ASFALTANDO EL DISTRITO...': 'PAVING THE DISTRICT...', 'APARCANDO EN DOBLE FILA...': 'DOUBLE PARKING...',
  'CONTRATANDO MODERADORES...': 'HIRING MODERATORS...', 'PONIENDO PEAJES...': 'ADDING TOLLS...',
  'DIBUJANDO LOS TEJADOS...': 'DRAWING THE ROOFS...', 'CASI: FALTA EL PARCHE DEL DÍA UNO...': 'ALMOST: JUST THE DAY ONE PATCH LEFT...',
  // los mandos táctiles
  'GAS': 'GAS', 'FRENO': 'BRAKE', 'SALIR': 'EXIT', 'PI': 'HONK', 'TIRO': 'FIRE',
  // el barrio: bandas, sitios y rótulos de los tejados
  'Los Animales Locos': 'The Crazy Animals', 'Granizo Corp.': 'Granizo Corp.', 'Los Extractores': 'The Extractors',
  'Templo del Autoguardado': 'Temple of Autosave', 'Taller Pintura Día Uno': 'Day One Paint Shop',
  'TEMPLO': 'TEMPLE', 'GRANIZO': 'GRANIZO', 'MODS': 'MODS', 'PINTURA': 'PAINT', 'CAJAS DE BOTÍN': 'LOOT BOXES', 'HELADOS': 'ICE CREAM',
  'PARCHE DÍA UNO': 'DAY ONE PATCH', 'ACCESO ANTICIPADO': 'EARLY ACCESS', 'PASE DE BATALLA': 'BATTLE PASS', 'REMASTER': 'REMASTER',
  'BETA ABIERTA': 'OPEN BETA', 'DLC': 'DLC',
  // mensajes de la partida
  'Distrito Beta Abierta. Roba un coche: nadie te va a decir que no.': "Open Beta District. Steal a car: nobody's going to say no.",
  'Los Moderadores te buscan.': 'The Moderators are after you.',
  '¡Barrera de Moderadores más adelante!': 'Moderator roadblock ahead!',
  'Rodeado: los Moderadores te sacan del coche.': 'Boxed in: the Moderators drag you out of the car.',
  '{banda} han mandado un coche a por ti.': '{banda} sent a car after you.',
  'Pintura nueva: los Moderadores ya no reconocen el coche.': "Fresh paint: the Moderators don't recognise the car any more.",
  'Taller Pintura Día Uno: 1.000 por pintar. No fiamos.': 'Day One Paint Shop: 1,000 a paint job. No credit.',
  'CANCELADO': 'CANCELLED', 'Te han cancelado.': "You've been cancelled.",
  'BANEADO': 'BANNED', 'Los Moderadores te han baneado.': 'The Moderators banned you.',
  'RACHA x': 'STREAK x',
  'Vida al máximo. Microblizz te la cobrará luego.': 'Full health. Microblizz will bill you later.',
  'Soborno: los Moderadores miran para otro lado.': 'Bribe: the Moderators look the other way.',
  // lo que grita la gente
  '¡PIIII!': 'BEEEEP!', '¡VAMOS, QUE ES PARA HOY!': "COME ON, I DON'T HAVE ALL DAY!", '¡ESTO NO ES UNA BETA!': 'THIS IS NOT A BETA!',
  '¡OIGA!': 'HEY!', '¡MI SEGURO NO CUBRE ESTO!': "MY INSURANCE DOESN'T COVER THIS!",
  '¡TE VAS A ENTERAR!': "YOU'RE GONNA GET IT!", '¡ESE COCHE ERA DE ESTRENO!': 'THAT CAR WAS BRAND NEW!', '¡TE DENUNCIO EN LOS FOROS!': "I'M REPORTING YOU ON THE FORUMS!",
  '¡SOCORRO!': 'HELP!', '¡YO NO HE VISTO NADA!': "I DIDN'T SEE ANYTHING!", '¡MAMÁ!': 'MOMMY!',
  '¡REINICIADO!': 'REBOOTED!', '¡PARCHE APLICADO!': 'PATCH APPLIED!', '¡OTRA VIDA, COMO EN LOS JUEGOS!': 'EXTRA LIFE, JUST LIKE IN GAMES!', '¡RESPAWN!': 'RESPAWN!',
  '¡APAGADO!': 'FIRE OUT!', '¡SIN DAÑOS EN LA PARTIDA GUARDADA!': 'NO DAMAGE TO THE SAVE FILE!',
  '¡ALTO! ¡INFRACCIÓN DE LAS NORMAS!': 'STOP! RULES VIOLATION!', '¡QUEDAS BANEADO!': "YOU'RE BANNED!", '¡TICKET DE SOPORTE ABIERTO!': 'SUPPORT TICKET OPENED!',
  '¡ES ÉL!': "IT'S HIM!", '¡A POR EL CONEJO!': 'GET THE BUNNY!', '¡NOS DEBE RESPETO!': 'HE OWES US RESPECT!',
  '¡TOMA!': 'TAKE THAT!', '¡DEVUÉLVEMELO!': 'GIVE IT BACK!', '¡ESE ES MI COCHE!': "THAT'S MY CAR!", '¡BAJA DE AHÍ!': 'GET OUT OF THERE!',
  '¡MI PASE DE BATALLA!': 'MY BATTLE PASS!', '¡SOCORRO, UN JUGADOR!': 'HELP, A PLAYER!', '¡NO ESTOY EN LA BETA!': "I'M NOT IN THE BETA!",
  '¡LLAMAD A UN MODERADOR!': 'CALL A MODERATOR!', '¡ESTO NO VENÍA EN EL PARCHE!': "THIS WASN'T IN THE PATCH NOTES!",
  '¡QUIERO UN REEMBOLSO!': 'I WANT A REFUND!', '¡AAAH!': 'AAAH!', '¡ME DESUSCRIBO!': "I'M UNSUBSCRIBING!",
  // el templo y las cabinas
  'ACEPTAR': 'ACCEPT', 'COLGAR': 'HANG UP', 'DONAR Y GUARDAR': 'DONATE AND SAVE', 'IRSE': 'LEAVE',
  'Templo del Autoguardado: guardar la partida cuesta un donativo de 5.000. «Sin donativo no hay guardado.»': 'Temple of Autosave: saving your game costs a 5,000 donation. "No donation, no save."',
  'Templo del Autoguardado: «¡Sin donativo no hay guardado!» Vuelve con 5.000.': 'Temple of Autosave: "No donation, no save!" Come back with 5,000.',
  'Partida guardada. El donativo no es deducible.': 'Game saved. The donation is not tax deductible.',
  // las misiones
  'Entrega Bestial': 'Beastly Delivery',
  '«¡Eh, conejo! La furgoneta de helados de la Heladería Animal lleva un cargamento de caos congelado. Llévala al Parque Gashapón antes de que se derrita. Y sin frenar por los peatones, que eso lo hace Microblizz.»': '"Hey, bunny! The Animal Ice Cream Parlour van is carrying a load of frozen chaos. Get it to Gashapon Park before it melts. And don\'t brake for pedestrians, that\'s Microblizz\'s job."',
  'Coge la furgoneta de helados de la Heladería Animal.': 'Grab the ice cream van at the Animal Ice Cream Parlour.',
  'Lleva la furgoneta al Parque Gashapón.': 'Drive the van to Gashapon Park.',
  'Parche del Día Uno': 'Day One Patch',
  '«Granizo Corp. le habla. El remaster sale hoy y, como siempre, no funciona. Recoja el parche del día uno en la puerta de la Torre y llévelo a Cajas de Botín antes de que salgan las críticas. Si llega tarde, lo llamaremos «contenido futuro».»': '"This is Granizo Corp. The remaster launches today and, as usual, it doesn\'t work. Pick up the day one patch at the Tower door and take it to Loot Boxes before the reviews come out. If you\'re late, we\'ll call it "future content"."',
  'Recoge el parche en la puerta de la Torre Granizo Corp.': 'Pick up the patch at the Granizo Corp. Tower door.',
  'Entrega el parche en Cajas de Botín.': 'Deliver the patch to Loot Boxes.',
  'Punto de Extracción': 'Extraction Point',
  '«Pssst. Hay una mochila con botín en el aparcamiento del sur. Cógela y llégate al Punto de Extracción. Aviso: en cuanto la toques, los Moderadores lo sabrán. Siempre lo saben.»': '"Psst. There\'s a backpack full of loot in the south car park. Grab it and make it to the Extraction Point. Heads up: the moment you touch it, the Moderators will know. They always know."',
  'Coge la mochila del aparcamiento del sur.': 'Grab the backpack in the south car park.',
  'Llega al Punto de Extracción con la mochila.': 'Reach the Extraction Point with the backpack.',
  'MISIÓN CUMPLIDA': 'MISSION COMPLETE', 'MISIÓN FALLIDA': 'MISSION FAILED',
  'Se acabó el tiempo.': "Time's up.", 'El coche de la misión ha quedado para chatarra.': 'The mission car is scrap metal now.',
  'Has hecho los tres recados de la demo. El resto del barrio, en la próxima versión.': "You've done the demo's three jobs. The rest of the district comes in the next version.",
  'Respeto de {banda} arriba. El multiplicador también.': 'Respect with {banda} is up. So is the multiplier.',
  '{banda} no lo olvidará.': "{banda} won't forget this.",
};
const IDIOMA_AUTO = (() => {   // la misma regla que core (idioma-eleccion.js): ?idioma=, el de la serie y si no el del navegador
  const pedido = () => { try { return new URLSearchParams(location.search).get('idioma') || localStorage.getItem('fansof-idioma') || ''; } catch (e) { return ''; /* sin dirección ni almacén (los tests en Node): decide el navegador */ } };
  const navegador = () => {   // el primero de los idiomas de la serie que tenga el navegador; si no tiene ninguno, inglés
    if (typeof navigator === 'undefined') return 'es';
    const lista = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'es'];
    const c = lista.map(l => String(l).slice(0, 2).toLowerCase()).find(l => ['es', 'en', 'pt', 'fr', 'de', 'it'].includes(l));
    return c || 'en';
  };
  return (pedido() || navegador()) === 'es' ? 'es' : 'en';
})();
if (typeof document !== 'undefined') document.documentElement.lang = IDIOMA_AUTO;
// tr('Hola, {nombre}', { nombre }) cambia cada {hueco} por su valor después de traducir (el hueco se queda igual en el inglés)
function tr(s, huecos) {
  const t = IDIOMA_AUTO === 'es' ? s : (EN[s] ?? s);
  return huecos ? t.replace(/\{(\w+)\}/g, (m, k) => (k in huecos ? String(huecos[k]) : m)) : t;
}
// cambiar el idioma (desde Opciones): se guarda para toda la serie y se recarga con él en la dirección
function cambiaIdioma(i) {
  try { localStorage.setItem('fansof-idioma', i); } catch (e) { console.warn('No se ha podido guardar el idioma:', e); }
  const u = new URL(location.href); u.searchParams.set('idioma', i);   // en la dirección también: vale aunque no se pueda guardar
  location.href = u.href;
}
const TINTA = '#0e1016';   // lo más oscuro del juego: el contorno de las letras y los iconos
