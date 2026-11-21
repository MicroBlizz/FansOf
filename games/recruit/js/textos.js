// Fans of Recruit · TEXTOS: en el código todo va en español y pasa por tr(); su inglés está aquí abajo (EN).
// El idioma se elige como en Fans of Tactics Advance: ?idioma= de la dirección, luego el de la serie (`fansof-idioma`, el de
// Opciones) y, si no hay, el del navegador; lo que no sea español va en inglés. Para probar: ?idioma=en
'use strict';

const VERSION_RC = '0.1.5';   // la misma que el ?v= de index.html y la de js/novedades.js

// el inglés de cada frase (español → inglés); una frase nueva del juego lleva aquí su inglés
const EN = {
  // título, pausa, fin y opciones
  'MISIÓN 1: LA GRAN COMPRA': 'MISSION 1: THE BIG BUYOUT', 'MICROBLIZZ COMPRA ESTUDIOS PARA CERRARLOS. HOY, NO.': 'MICROBLIZZ BUYS STUDIOS TO SHUT THEM DOWN. NOT TODAY.',
  'TOCA PARA EMPEZAR': 'TAP TO START', 'PULSA ENTER PARA EMPEZAR': 'PRESS ENTER TO START', 'RÉCORD': 'HIGH SCORE',
  'PULGAR IZQUIERDO: MOVER Y APUNTAR / BOTONES A LA DERECHA': 'LEFT THUMB: MOVE AND AIM / BUTTONS ON THE RIGHT',
  'OPCIONES': 'OPTIONS', 'BIBLIOTECA': 'LIBRARY', 'PARODIA HECHA POR FANS: MICROBLIZZ NO EXISTE (POR SUERTE)': "A FAN-MADE PARODY: MICROBLIZZ ISN'T REAL (LUCKILY)",
  'CONTINUAR': 'CONTINUE', 'SALIR AL TÍTULO': 'QUIT TO TITLE', 'PAUSA': 'PAUSE', 'ABAJO + SALTO: BAJAR DE LA MECHAVACA': 'DOWN + JUMP: GET OFF THE MECHAVACA',
  '¡DESPEDIDO!': 'FIRED!', '¿HACES HORAS EXTRA?': 'WORKING OVERTIME?', 'TOCA PARA SEGUIR': 'TAP TO CONTINUE', 'PULSA ENTER PARA SEGUIR': 'PRESS ENTER TO CONTINUE',
  'SEGUIR CUESTA LA MITAD DE LOS PUNTOS (COMISIÓN DE MICROBLIZZ)': 'CONTINUING COSTS HALF YOUR POINTS (MICROBLIZZ FEE)',
  '¡MISIÓN CUMPLIDA!': 'MISSION COMPLETE!', 'PUNTOS': 'POINTS', 'FANS RESCATADOS': 'FANS RESCUED', 'TIEMPO': 'TIME', 'VIDAS': 'LIVES',
  'SIN HORAS EXTRA': 'NO OVERTIME', 'TOTAL': 'TOTAL', '¡NUEVO RÉCORD!': 'NEW HIGH SCORE!',
  'MIENTRAS TANTO, MICROBLIZZ YA HA COMPRADO OTRO ESTUDIO.': 'MEANWHILE, MICROBLIZZ HAS ALREADY BOUGHT ANOTHER STUDIO.',
  'CONTINUARÁ… HASTA LA PRÓXIMA REESTRUCTURACIÓN': 'TO BE CONTINUED… UNTIL THE NEXT RESTRUCTURING',
  'SONIDO': 'SOUND', 'MÚSICA': 'MUSIC', 'SÍ': 'ON', 'NO': 'OFF', 'CONTROLES DEL TECLADO': 'KEYBOARD CONTROLS', 'PANTALLA COMPLETA': 'FULL SCREEN',
  'YA ESTÁ INSTALADO': 'ALREADY INSTALLED', 'INSTALAR EN EL MÓVIL': 'INSTALL ON YOUR PHONE', 'BORRAR RÉCORD': 'CLEAR HIGH SCORE', 'VOLVER': 'BACK',
  'IDIOMA': 'LANGUAGE', 'TOCA PARA CERRAR': 'TAP TO CLOSE',
  'ESTE NAVEGADOR NO DEJA PONER LA PANTALLA COMPLETA.': "THIS BROWSER WON'T DO FULL SCREEN.",
  'RÉCORD BORRADO. COMO SI NUNCA HUBIERAS TRABAJADO AQUÍ.': 'HIGH SCORE CLEARED. AS IF YOU NEVER WORKED HERE.',
  'No se ha podido cargar. Recarga la página.': "Couldn't load. Reload the page.",
  // instalar la app (instalar.js)
  'Ya lo estás usando como app.': "You're already using it as an app.",
  'Ábrelo desde la web del juego para poder instalarlo.': "Open it from the game's website to install it.",
  'En iPhone, con Safari: toca Compartir (el cuadrado con la flecha) y luego «Añadir a pantalla de inicio».': 'On iPhone, in Safari: tap Share (the square with the arrow) and then "Add to Home Screen".',
  'En Android, con Chrome: toca el menú (los tres puntos, arriba a la derecha) y luego «Instalar aplicación». En el ordenador, el icono de instalar de la barra de direcciones.': 'On Android, in Chrome: tap the menu (the three dots, top right) and then "Install app". On a computer, use the install icon in the address bar.',
  // el aviso de girar el móvil (core: horizontal.js)
  'Toca para jugar en horizontal': 'Tap to play in landscape', 'o gira el móvil': 'or turn your phone',
  'Gira el móvil para jugar': 'Turn your phone to play', 'Si no cambia, quita el bloqueo de giro': 'If nothing changes, turn off rotation lock',
  // los controles del teclado
  'IZQUIERDA': 'LEFT', 'DERECHA': 'RIGHT', 'ARRIBA / APUNTAR': 'UP / AIM', 'ABAJO / AGACHARSE': 'DOWN / CROUCH', 'DISPARAR': 'SHOOT',
  'SALTAR': 'JUMP', 'ZANAHORIA BOMBA': 'CARROT BOMB', 'SALTO DEL CAOS': 'CHAOS JUMP',
  'FLECHA IZQ.': 'LEFT ARROW', 'FLECHA DER.': 'RIGHT ARROW', 'FLECHA ARR.': 'UP ARROW', 'FLECHA ABA.': 'DOWN ARROW', 'ESPACIO': 'SPACE',
  'MAYÚS': 'SHIFT', 'MAYÚS DER.': 'R SHIFT', 'CTRL DER.': 'R CTRL', 'BORRAR': 'BACKSPACE', 'NUM': 'NUM',
  'PULSA...': 'PRESS...', 'PONER LOS DE SERIE': 'RESET TO DEFAULTS',
  'PULSA LA TECLA NUEVA (ESC: DEJARLA COMO ESTABA)': 'PRESS THE NEW KEY (ESC: LEAVE IT AS IT WAS)',
  'ELIGE UNA CASILLA Y PULSA LA TECLA. RATÓN: CLIC DISPARA, CLIC DERECHO ZANAHORIA. MANDO DE CONSOLA: SE ENCHUFA Y VA.': 'PICK A SLOT AND PRESS THE KEY. MOUSE: CLICK SHOOTS, RIGHT-CLICK THROWS A CARROT. GAMEPAD: PLUG IT IN AND GO.',
  'CONTROLES DE SERIE: WASD O FLECHAS PARA MOVERTE, J O Z DISPARA, K O X SALTA, L O C LANZA LA ZANAHORIA, I O V EL CAOS.': 'DEFAULT CONTROLS: WASD OR ARROWS TO MOVE, J OR Z SHOOTS, K OR X JUMPS, L OR C THROWS THE CARROT, I OR V FOR CHAOS.',
  'MOVER': 'MOVE', 'O FLECHAS': 'OR ARROWS', ' O ': ' OR ', 'ZANAHORIA': 'CARROT', 'CAOS': 'CHAOS', '(CÁMBIALOS EN OPCIONES)': '(CHANGE THEM IN OPTIONS)',
  // la carga
  'CONVOCANDO UNA REUNIÓN...': 'CALLING A MEETING...', 'MIDIENDO LOS KPIS...': 'MEASURING THE KPIS...', 'COMPRANDO OTRO ESTUDIO...': 'BUYING ANOTHER STUDIO...',
  'ALINEANDO SINERGIAS...': 'ALIGNING SYNERGIES...', 'SIRVIENDO CAFÉ A LOS BECARIOS...': 'SERVING COFFEE TO THE INTERNS...',
  'CASI: FALTA LA FIRMA DE UN EJECUTIVO...': 'ALMOST: JUST NEEDS AN EXECUTIVE SIGNATURE...',
  // la partida: rótulos, avisos y bocadillos
  'MISIÓN 1': 'MISSION 1', 'LA GRAN COMPRA': 'THE BIG BUYOUT', '¡ADELANTE!': 'GO!', 'EN DIRECTO': 'LIVE',
  '¡CAOS LISTO!': 'CHAOS READY!', '¡CAOS LISTO! (V)': 'CHAOS READY! (V)', '¡CAOS A TOPE!': 'CHAOS MAXED OUT!', '¡SALTO DEL CAOS!': 'CHAOS JUMP!',
  '¡AQUÍ!': 'OVER HERE!', '¡SOCORRO!': 'HELP!', '¡GRACIAS!': 'THANKS!', '¡SUBE!': 'HOP ON!', '¡SUBE! (SALTO)': 'HOP ON! (JUMP)',
  '¡METRALLETA!': 'MACHINE GUN!', 'ZANAHORIAS +10': 'CARROTS +10', '¡CAFÉ! CAOS +3': 'COFFEE! CHAOS +3',
  '¡MECHAVACA!': 'MECHAVACA!', '¡LA VACA SIGUE PELEANDO!': 'THE COW FIGHTS ON!', '¡SE ACABÓ LA JORNADA!': "CLOCKING-OUT TIME!",
  '¡AVISO!': 'WARNING!', 'SE ACERCA EL JEFE DE DEPARTAMENTO': 'THE HEAD OF DEPARTMENT IS COMING', '¡ESTÁ ECHANDO HUMO!': "HE'S FUMING!",
  'DIRECTOR DE CIERRES': 'HEAD OF SHUTDOWNS', 'CANCELADO': 'CANCELLED',
  // los carteles de las oficinas
  'DÍAS SIN CANCELAR': 'DAYS WITHOUT CANCELLING', 'UN JUEGO:': 'A GAME:', 'SINERGIA': 'SYNERGY', 'NUESTROS VALORES': 'OUR VALUES',
  '1. COMPRAR': '1. BUY', '2. CERRAR': '2. CLOSE', '3. REPETIR': '3. REPEAT', 'SOLO EJECUTIVOS': 'EXECUTIVES ONLY',
  'COMPRAMOS TU JUEGO FAVORITO': 'WE BUY YOUR FAVOURITE GAME', '(PARA CERRARLO)': '(TO SHUT IT DOWN)', 'COMPRADO': 'BOUGHT', 'CERRADO': 'CLOSED',
  'TUS COSAS': 'YOUR STUFF', 'EN CONSTRUCCIÓN': 'UNDER CONSTRUCTION',
  // el chat del directo
  '¡dale, conejo!': 'go, bunny!', 'hoy cae Microblizz': 'Microblizz goes down today', 'abrígate, hijo': 'wrap up warm, sweetie',
  'primera vez aquí, ¿qué es esto?': 'first time here, what is this?',
  'yo solo traía el café': 'I was just bringing the coffee', 'F por el becario': 'F for the intern', 'era su primer día': 'it was his first day',
  'eso no lo cubre el seguro': "insurance won't cover that", 'productividad: -1': 'productivity: -1',
  'dron abajo': 'drone down', 'mis KPIs, noooo': 'my KPIs, noooo', 'la flecha siempre baja, qué raro': 'the line only goes down, weird',
  '¡FAN LIBRE!': 'FAN FREED!', '¡ese soy yo!': "that's me!", '+1 suscriptor': '+1 subscriber', 'esa cinta era de obra': 'that tape was from the building site',
  'METRALLETA GOD': 'MACHINE GUN GOD', 'ahora sí que sí': "now we're talking", 'eso está rotísimo': "that's sooo broken",
  'la vaca es OP, nerf pls': 'the cow is OP, nerf pls', 'MUUUUUUUU': 'MOOOOOOOO', '¿por qué es rosa? da igual': "why is it pink? doesn't matter",
  'NOOO, LA VACA': 'NOOO, THE COW', 'F en el chat': 'F in the chat', 'la vaca sigue, respeto': 'the cow keeps going, respect',
  'JAJAJA': 'LMAO', 'eso ha sido lag': 'that was lag', 'clip, clip, clip': 'clip, clip, clip', '¡ten cuidado!': 'be careful!',
  'CAOOOOS': 'CHAOOOOS', '¡¡SALTO DEL CAOS!!': 'CHAOS JUMP!!', 'me tiembla la pantalla': 'my screen is shaking', 'CLIP ESO': 'CLIP IT',
  'viene el de RRHH': "here comes HR", 'ese robot cerró mi juego': 'that robot shut down my game', 'SURVIVALBOT, NO': 'SURVIVALBOT, NO',
  'le queda poco': "he's almost done", 'está echando humo': "he's smoking", 'rendimiento a la baja': 'performance trending down',
  'CANCELADO, JAJAJA': 'CANCELLED, LMAO', 'GG': 'GG', 'justicia poética': 'poetic justice', 'que le den el finiquito': 'give him his severance pay',
  'F': 'F', 'horas extra sin pagar': 'unpaid overtime', 'se acabó el directo': 'stream over',
  '¿cuándo sale la misión 2?': 'when does mission 2 come out?', 'Microblizz, no compres esto': "Microblizz, don't buy this",
  'yo programé ese ascensor': 'I coded that elevator', 'saludos desde Albacete': 'greetings from Albacete', 'voy a 3 FPS y lo gozo': "running at 3 FPS and loving it",
  'ese cartel de sinergia…': 'that synergy poster…', 'hola, chat': 'hi, chat', '¿esto cuenta como prácticas?': 'does this count as an internship?',
  '¿has comido?': 'have you eaten?', 'necesito esa corona': 'I need that crown',
};
const IDIOMA_RC = (() => {   // la misma regla que core (idioma-eleccion.js): ?idioma=, el de la serie y si no el del navegador
  const pedido = () => { try { return new URLSearchParams(location.search).get('idioma') || localStorage.getItem('fansof-idioma') || ''; } catch (e) { return ''; /* sin dirección ni almacén (los tests en Node): decide el navegador */ } };
  const navegador = () => {   // el primero de los idiomas de la serie que tenga el navegador; si no tiene ninguno, inglés
    if (typeof navigator === 'undefined') return 'es';
    const lista = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'es'];
    const c = lista.map(l => String(l).slice(0, 2).toLowerCase()).find(l => ['es', 'en', 'pt', 'fr', 'de', 'it'].includes(l));
    return c || 'en';
  };
  return (pedido() || navegador()) === 'es' ? 'es' : 'en';
})();
if (typeof document !== 'undefined') document.documentElement.lang = IDIOMA_RC;
function tr(s) { return IDIOMA_RC === 'es' ? s : (EN[s] ?? s); }
// cambiar el idioma (desde Opciones): se guarda para toda la serie y se recarga con él en la dirección
function cambiaIdioma(i) {
  try { localStorage.setItem('fansof-idioma', i); } catch (e) { console.warn('No se ha podido guardar el idioma:', e); }
  const u = new URL(location.href); u.searchParams.set('idioma', i);   // en la dirección también: vale aunque no se pueda guardar
  location.href = u.href;
}
