// Fans of Rumble · Novedades: el informe de cada versión, la más nueva primero.
// real: lo nuevo de verdad · joke: las «notas» de Microblizz. La primera entrada es la que ve el jugador al abrir el juego después de actualizarse.
// La versión que se publica se escribe en index.html (…/core/js/nucleo.js?v=…); aquí, `v` dice a qué versión corresponde cada informe.
'use strict';
const NEWS = [
  { v: '0.9.55', real: [
      '<b>DOS DIFICULTADES NUEVAS EN LA CAMPAÑA</b>: ahora hay cinco, de la más fácil a la más dura: Fácil, Normal, Difícil, Heroica y Mítica.',
      '<b>FÁCIL</b>: rivales más flojos, sin hechizos ni equipo. Para practicar o subir tus cartas con calma. Premios a la mitad, y aquí no se liberan facciones.',
      '<b>HEROICA</b>: entre Difícil y Mítica. Rivales de nivel 8 a 11, buen equipo y la ruleta de la semana, pero solo gira la ventaja de la CPU: a ti no te castiga. Premios x2,5. Se abre al pasar cada mundo en Difícil, y ahora la Mítica se abre al pasarlo en Heroica (si ya tenías estrellas en Mítica, ese mundo sigue abierto).'],
    joke: ['Microblizz ha añadido un modo Fácil para los accionistas. Siguen perdiendo.'] },
  { v: '0.9.54', real: [
      '<b>JUEGO LIMPIO</b>: las recompensas, el gashapón y las compras se validan en nuestro servidor, y vigilamos las trampas. Quien las haga puede perder ventajas o su cuenta. Gracias por jugar limpio.'],
    joke: ['Microblizz también vigila a su plantilla. De momento sin éxito.'] },
  { v: '0.9.45', real: [
      '<b>AVISO IMPORTANTE</b>: abre el juego con conexión antes del <b>21 de octubre</b> para subir tu progreso actual (oro, gemas, objetos y niveles) a tu cuenta. Pasada esa fecha, una partida antigua que no se haya subido ya no podrá subirse: seguirá en tu aparato, pero tu cuenta empezará desde cero.'],
    joke: ['Microblizz recuerda que las fechas límite son como sus promesas: se acercan solas.'] },
  { v: '0.9.44', real: [
      '<b>TU ECONOMÍA EN LA NUBE</b>: con tu cuenta, despedir copias, volver a tirar sus números y subir de nivel las cartas también lo hace nuestro servidor, y tu oro y tus gemas quedan guardados en ella. Para hacerlo hace falta conexión.'],
    joke: ['Microblizz afirma que cuida mejor de tus recursos que de los suyos. Tampoco era difícil.'] },
  { v: '0.9.43', real: [
      '<b>CARTAS EN LA NUBE</b>: con tu cuenta, la máquina de cartas también la hace nuestro servidor, y tus cartas y estrellas quedan guardadas en ella. Para tirar hace falta conexión.'],
    joke: ['El servidor de Microblizz cuenta tus estrellas. Dice que las suyas ya las perdió.'] },
  { v: '0.9.42', real: [
      '<b>GASHAPÓN EN LA NUBE</b>: con tu cuenta, las tiradas de habilidades y equipo las hace nuestro servidor, así tus objetos quedan a salvo. Para tirar hace falta conexión.'],
    joke: ['Microblizz jura que el servidor no se queda con ninguna copia. Solo con las mejores.'] },
  { v: '0.9.40', real: [
      '<b>RECURSOS</b>: por dentro, el oro, las gemas y las entradas pasan ahora por un solo sitio. No cambia nada de lo que ves, pero prepara el guardado de tu cuenta en la nube y la futura tienda.'],
    joke: ['Microblizz asegura que ahora cuida mejor de tus recursos. De los suyos ya se encargaba su contable.'] },
  { v: '0.9.39', real: [
      '<b>MODO AHORRO</b> (en Opciones): para móviles sencillos. Dibuja con menos resolución, a 30 imágenes por segundo y con menos polvo y humo, así gasta menos batería y calienta menos.',
      '<b>CONTADOR DE FPS</b> (en Opciones): enseña arriba a la izquierda cuántas imágenes por segundo dibuja el juego. Verde, va fluido; amarillo, justo; rojo, a tirones.'],
    joke: ['Microblizz también tiene un modo ahorro: lo aplica a los sueldos.'] },
  { v: '0.9.38', real: [
      '<b>MODO PRUEBAS</b> (en Opciones): ahora lo da todo al máximo. Las cartas suben solas al nivel 10, tienes todas las habilidades y objetos con calidad perfecta y toda la campaña con 3 estrellas. Antes guarda una copia de tu partida: con QUITAR vuelves a ella tal como estaba.'],
    joke: ['Microblizz llama a esto «edición coleccionista». Los demás lo llamamos trampas.'] },
  { v: '0.9.37', real: [
      '<b>ARENA</b>: tu facción y tu mazo van juntos en una fila pequeña. FACCIÓN abre una lista compacta y MAZO abre el editor de la Colección; al guardar vuelves a la arena.'],
    joke: ['Microblizz ha encogido la fila de la facción. Dice que es para ahorrar píxeles.'] },
  { v: '0.9.36', real: [
      '<b>MAZO</b>: ahora se edita dentro de la Colección. EDITAR MAZO se despliega ahí mismo y GUARDAR lo pliega. El botón «Mazo» del menú principal se quitó.'],
    joke: ['Microblizz ha escondido el mazo dentro de la colección. Dicen que así ya no se pierde.'] },
  { v: '0.9.35', real: [
      '<b>ARENA</b> renovada: tu liga en grande con su escudo, tus copas y una barra hasta la siguiente liga. Los rivales salen en tarjetas con su dificultad, ves lo que ganas o pierdes, y la facción se cambia con un botón.',
      '<b>RACHA</b> de victorias y <b>REGALOS DEL CAMINO</b>: cada 100 copas de récord, una tirada gratis del gashapón.'],
    joke: ['En Microblizz las ligas se deciden por antigüedad. En la arena, de momento, no.'] },
  { v: '0.9.34', real: [
      '<b>MENÚ</b>: los iconos de abajo vuelven a tener color, ahora con una paleta que combina: coral, naranja, dorado y violeta.'],
    joke: ['El consultor de color de Microblizz ha cambiado de opinión. Ha vuelto a cobrar.'] },
  { v: '0.9.33', real: [
      '<b>MENÚ</b>: colores más ordenados. Naranja para jugar, violeta para los modos de juego y dorado para conseguir cosas (gashapón y tienda). Los iconos de abajo, todos en dorado.'],
    joke: ['Microblizz ha contratado a un consultor de color. Cobró por decir «menos colores».'] },
  { v: '0.9.32', real: [
      '<b>INGLÉS</b>: las descripciones de habilidades y objetos ya salen enteras en inglés (antes se quedaban trozos en español).'],
    joke: ['Microblizz ha despedido al becario de traducción. Lo ha sustituido otro becario.'] },
  { v: '0.9.31', real: [
      '<b>BIBLIOTECA</b>: un botón nuevo en el menú con todas las habilidades y objetos del juego. Ves de un vistazo cuáles tienes (y cuántas copias), cuáles te faltan y qué hace cada uno. Puedes filtrar por «Lo tengo» y «Me falta».'],
    joke: ['Microblizz ha catalogado todo lo que no te va a tocar en el gashapón. Es una lista larga.'] },
  { v: '0.9.30', real: [
      '<b>CUENTA</b>: tu progreso se guarda ahora también en la nube, sin que tengas que hacer nada. En Opciones → Cuenta puedes guardarlo con tu email (sin contraseña) para no perderlo y seguir jugando en otro móvil o PC.',
      'Si juegas en dos aparatos y las dos partidas cambian, el juego te pregunta con cuál sigues.'],
    joke: ['Microblizz guarda tu partida en «la nube». Por lo visto, la nube es el ordenador de otro.'] },
  { v: '0.9.29.1',
    real: ['<b>ARREGLADO</b>: al subir de nivel a tu líder (o a cualquier carta), en la partida seguía saliendo el nivel antiguo hasta que cerrabas el juego y volvías a entrar. Ahora se ve el nivel nuevo al momento.'],
    joke: ['Microblizz jura que tu líder siempre fue nivel 2 «en espíritu».'], },
  { v: '0.9.29',
    real: ['<b>IDIOMAS</b>: el juego está ahora en español y en inglés. Se elige solo según el idioma de tu navegador y puedes cambiarlo en Opciones (Idioma / Language).',
      'El inglés cubre los menús, las cartas, el chat de las partidas, las misiones y los logros. Si ves algo que sigue en español, ya lo sabemos.'],
    joke: ['Microblizz ha descubierto que existen más idiomas y quiere cobrarte la traducción.', 'Phony lo llama «localización premium». Tú, «por fin».'], },
  { v: '0.9.28',
    real: ['<b>HORAS EXTRA</b> (0.9.28): cada líder hace ahora su propio especial. NecroLord invoca esqueletos, CyberMarine llama a sus drones, el Vikingo levanta su muro de escudos… Antes todos saltaban como CrazyBunny.',
      '<b>¡YA HAY APP DE ANDROID!</b> (de prueba). En la app, el botón ATRÁS del móvil pausa la partida, cierra ventanas y vuelve al menú.',
      '<b>TU PERFIL</b>: Lola te pregunta cómo te llamas. Tu nombre sale en la Arena, en el chat de las partidas y en los mensajes de Lola.',
      'Toca tu avatar arriba a la izquierda del menú para ver tus números (Arena, copas, estrellas, logros…), cambiar el nombre o elegir avatar entre los líderes de tus facciones.',
      '<b>Golpes con más jugo</b> (0.9.24) y opción de <b>Temblor de pantalla SÍ/NO</b> en Opciones (0.9.25).'],
    joke: ['Microblizz quería cobrarte 9,99 € por cambiar de nombre. Lola dijo que no.', 'El chat ya sabe cómo te llamas. El CEO de Microblizz, también.', 'IAhorro ha intentado llamarse como tú. Le salió «Usuario_7714».'], },
];
