// Fans of Rumble · Novedades: el informe de cada versión, la más nueva primero.
// real: lo nuevo de verdad · joke: las «notas» de Microblizz. La primera entrada es la que ve el jugador al abrir el juego después de actualizarse.
// La versión que se publica se escribe en index.html (…/core/js/nucleo.js?v=…); aquí, `v` dice a qué versión corresponde cada informe.
'use strict';
const NEWS = [
  { v: '0.9.99', real: ['<b>PVP: HÉROE EN LA MANO</b>: si tu rival sacaba el héroe de tu misma facción, tu carta de héroe salía como «en el campo» aunque el tuyo no estuviera. Arreglado.'],
    joke: ['Microblizz ha explicado que en PvP los héroes se parecen tanto que ni su propia botonera los distinguía.'] },
  { v: '0.9.98', real: ['<b>TODAS LAS FACCIONES EN EL PVP</b>: en la pantalla de PvP salen todas las facciones; las que aún no tienes desbloqueadas se ven en gris.'],
    joke: ['Microblizz ha puesto las facciones bloqueadas en gris para que dé más ganas de desbloquearlas. Funciona.'] },
  { v: '0.9.97', real: ['<b>PVP CON TU FACCIÓN</b>: en la pantalla de PvP ya puedes elegir cualquiera de las facciones que tengas desbloqueadas, no solo los Animales Locos.'],
    joke: ['Microblizz estaba convencido de que todas las facciones querían ser Animales Locos. Ha tenido que preguntar.'] },
  { v: '0.9.96', real: ['<b>PVP ABIERTO (EN PRUEBAS)</b>: ya puedes retar a otros jugadores en el modo Estándar. Está en pruebas: puede ir a tirones, y las puntuaciones son de la Temporada 0, que se borrará cuando todo vaya estable. Cada temporada se reiniciará. Necesitas vincular tu cuenta (Opciones → Cuenta). También: sin botón x2 en PvP, rendirse funciona y el retardo de red es más amplio.'],
    joke: ['Microblizz abre el PvP «en pruebas», que en lenguaje de empresa significa que los probadores sois vosotros.'] },
  { v: '0.9.95', real: ['<b>PVP EN OBRAS</b>: cerramos el PvP un rato para afinar la conexión con el servidor: las partidas iban a tirones. Volverá en cuanto vaya fino.'],
    joke: ['Microblizz ha puesto un cartel de «vuelvo en 5 minutos» en el PvP. Lleva 5 minutos desde hace tiempo.'] },
  { v: '0.9.94', real: ['<b>RENDIRSE EN PVP</b>: el botón ME RINDO no hacía nada contra otros jugadores; ahora pierdes y tu rival gana al momento.'],
    joke: ['Microblizz reconoce que el botón de rendirse se había rendido primero.'] },
  { v: '0.9.93', real: [
      '<b>LOLA EN EL SALÓN DE LA FAMA</b>: la primera vez que abres el RANKING, Lola te cuenta cómo funciona.',
      '<b>PVP MÁS ESTABLE</b>: si el móvil se atasca un momento, la partida ya no intenta recuperar el tiempo perdido de golpe. Y si tu rival tiene otra versión del juego, te avisa.',
      '<b>LOLA TE LO CUENTA</b>: la primera vez que abras el pase nuevo, el pase PvP o el armario, Lola te explica en dos frases cómo va. También si ya habías hecho el tutorial.'],
    joke: ['Lola ha intentado comprar el primer puesto del Salón. No la han dejado: el servidor no acepta sobornos. Microblizz está investigando cómo arreglarlo.', 'Microblizz ha obligado a Lola a explicar sus pases nuevos. Ha aceptado a cambio de un marco de cartón, que es lo que le dieron al despedirla.'] },
  { v: '0.9.92', real: [
      '<b>PVP SIN TIRONES</b>: las partidas contra otros jugadores iban a saltos; ahora la red tiene más margen (tus cartas salen una fracción de segundo más tarde, pero todo se mueve fluido).',
      '<b>ARMARIO Y PASE NUEVO</b>: marcos para tu avatar y títulos bajo tu nombre, que se ganan en los pases. Hay un pase de temporada nuevo (50 niveles, capítulos de La Gran Compra e hitos) y un pase PvP que sube al jugar partidas PvP. Son solo para lucirse: no dan ventaja.',
      '<b>SALÓN DE LA FAMA</b>: botón RANKING en el menú con la clasificación mundial (campaña y poder; las copas PvP, en obras).'],
    joke: ['Microblizz ha estrenado un armario para que los perdedores del PvP puedan perder con estilo. El salto a la 0.9.92 incluye muchas cosas del taller que no caben en una nota.'] },
  { v: '0.9.91', real: [
      '<b>LOLA TE ENSEÑA MÁS</b>: la partida guiada sigue después del gashapón. Ahora te lleva a la máquina de cartas, te ayuda a meter tu carta nueva en el mazo y te enseña las misiones, las horas extra y las opciones.',
      '<b>CONSEJOS EN CADA MODO</b>: la primera vez que abres la Arena, la Partida rápida, el Modo Jefe, el PvP, la Tienda y otras pantallas, Lola te cuenta en dos frases cómo va. Si no los quieres, toca «Sin consejos». Si ya habías hecho el tutorial, no te saldrán; los recuperas con TUTORIAL, en Opciones.',
      '<b>HABILIDADES MÁS JUSTAS</b>: DLC, Microtransacción, Clon, Rage Quit y Gigante ganaban casi todas las partidas, así que bajan. Y si una carta saca varias unidades, el efecto de DLC, Microtransacción, Clon y Rage Quit se reparte entre ellas.'],
    joke: ["Microblizz ha contratado a Lola como formadora de nuevos empleados. Sigue despedida, pero ahora también trabaja gratis."] },
  { v: '0.9.90', real: [
      '<b>LA IA SE DEFIENDE CON CABEZA</b>: cuando le atacas, responde con la unidad que mejor contrarresta la tuya (contra un tanque, asesinos o control; contra un enjambre, control o tiradores…).',
      '<b>ARREGLO: JEFES Y RIVALES QUE SE QUEDABAN QUIETOS</b>: los hechizos de la máquina ya no se le atascan en la mano, así que los jefes siguen sacando tropas hasta el final. Y en las fases con pocas cartas, la máquina puede repetir carta como antes.',
      '<b>FÁCIL, PERO NO TONTA</b>: en la partida rápida en Fácil la máquina piensa un poco más deprisa. Sigue siendo fácil de ganar, pero ya juega a tiempo.'],
    joke: ['Microblizz ha descubierto que su IA guardaba los hechizos en el bolsillo «por si acaso» y se olvidaba de jugar. La han mandado a un curso de productividad.'] },
  { v: '0.9.89', real: [
      '<b>PVP: ¡A POR EL RIVAL!</b> Ya puedes retar a otros jugadores en el modo Estándar (con tu mazo, niveles y estrellas; los objetos no cuentan) y subir en la clasificación. Necesitas vincular tu cuenta (Opciones → Cuenta). Si no aparece nadie en 30 s, puedes jugar contra la IA sin salir de la cola.',
      '<b>IA RIVAL MÁS LISTA</b>: la máquina juega con la misma mano de 4 cartas que tú, responde a lo que tienes en el campo, contraataca por el carril que acaba de defender y ya no desperdicia el CAOS casi lleno.'],
    joke: ['Microblizz ha puesto una arena donde los jugadores se pegan por internet y ha descubierto que, sorpresa, todos quieren ganar. Detrás: el campo igual para los dos, matemáticas iguales en todos los navegadores y muchas sesiones de rey de la pista.'] },
  { v: '0.9.82', real: [
      '<b>CAMPO IGUAL PARA LOS DOS</b>: tu sede y la del rival están ahora a la misma distancia del río (antes la suya estaba más cerca) y las zonas de los campos de jefe se reparten iguales arriba y abajo. Así es justo, también para el PvP que viene.'],
    joke: ['Microblizz ha medido el campo con una cinta métrica y ha descubierto que llevaba años jugando en cuesta. Y sí, la versión ha saltado de la 0.9.72 a la 0.9.82: en el taller pasaron muchas cosas con la puerta cerrada y el equipo de contabilidad se ha negado a contarlas.'] },
  { v: '0.9.72', real: [
      '<b>HECHIZOS DE VERDAD</b>: cada hechizo hace llover lo suyo (bellotas, monedas, pociones, relojes, latas…) y los gordos (el martillo del baneo, la espada del crítico, el sello de cancelado y la bomba) caen enteros y golpean. Ya no baja la carta como una bola.',
      '<b>ZONAS QUE BRILLAN</b>: las zonas del campo (hechizos, auras, el líder, la ralentización…) brillan con su color, como el cono de MeerCat. Sin rayas ni puntitos.',
      '<b>SANADORES MÁS LISTOS</b>: MeerCat y los demás sanadores ya no se van solos al puente. Si no hay tropas a las que curar, se ponen detrás de tus torres y las curan. Y prefieren cubrir a los que pelean cuerpo a cuerpo.',
      '<b>SIN HECHIZOS EN RÁFAGA</b>: la máquina ya no puede lanzar dos hechizos seguidos. Entre uno y otro espera 12 segundos, como tú con tu mano de cartas.'],
    joke: ['Microblizz ha despedido a la enfermera por curar torres sin permiso. Ha vuelto como autónoma.'] },
  { v: '0.9.71', real: [
      '<b>PARTIDA RÁPIDA «CEO»</b>: la dificultad más dura. La CPU juega 2 niveles por encima y antes de cada partida gira la ruleta de Microblizz: un castigo para ti y una ventaja para la CPU. Si ganas: 150 de oro y 15 gemas.',
      '<b>MODO JEFE RENOVADO</b>: el jefe sale en grande y con su aura. Cambia de jefe con las flechas y elige tu facción en una sola línea.',
      '<b>¡NUEVA FACCIÓN!</b>: en la campaña y antes de cada jefe se ve qué facción se une a ti si ganas, y al liberarla sale una celebración que no se cierra sola.',
      '<b>TODO EN ORDEN</b>: las facciones salen en dos filas de 5 en la colección, al elegir facción y en el perfil.',
      '<b>6 SEMANALES Y 7 NUEVAS</b>: ahora hay 6 misiones semanales (Empleado del mes y 5 más) y 7 misiones semanales nuevas para que no se repitan tanto. Esta semana se añade la que falta sin tocar las que ya tenías.',
      '<b>FACCIONES DESDE CERO</b>: cuando liberas una facción en la campaña, sus cartas empiezan a nivel 1. Te toca subirlas a ti.',
      '<b>CAMBIAR SEMANALES</b>: las semanales tienen su propio cupo de cambios con anuncio: 6 a la semana, para usarlos cuando quieras (aunque sea todos el domingo).'],
    joke: ['Microblizz ha ampliado la semana laboral a 6 misiones. El séptimo día descansa. Bueno, descansa el CEO.'] },
  { v: '0.9.69', real: [
      '<b>ENTRA CON GOOGLE</b>: ya puedes guardar tu progreso con tu cuenta de Google (Opciones → Cuenta). Ahora está en pruebas: escribe a fansofmicroblizz@gmail.com con tu correo de Google y te añadimos a mano.'],
    joke: ['Microblizz se compromete a abrir el acceso con Google a todo el mundo en menos de un año. Tiene la firma de un becario.'] },
  { v: '0.9.68', real: [
      '<b>MISIONES CON NOMBRE</b>: todas las misiones tienen ahora un título (Doble despido, ERE masivo, Pausa para el café…) y debajo lo que hay que hacer.',
      '<b>EMPLEADO DEL MES</b>: en las semanales hay una misión fija: sé Empleado del día 7 veces en la semana. Da un premio gordo.',
      '<b>SEMANALES MÁS LARGAS</b>: ahora hay 5 a la semana y están pensadas para durar varios días. También se pueden cambiar con un anuncio (menos la fija).'],
    joke: ['Recursos Humanos de Microblizz ha puesto nombre a cada tarea. El presupuesto para pagarlas todavía no ha llegado.'] },
  { v: '0.9.67', real: [
      '<b>MISIÓN «5 DIARIAS»</b>: cada día hay 6 misiones. La de «Completa 5 misiones diarias» va siempre la primera y da más premio. En la semana hay un reto: completarla 7 veces.',
      '<b>MISIONES DE LA ARENA</b>: jugar y ganar en la Arena cuenta para las misiones del día y de la semana.',
      '<b>LOGROS DE FÁCIL</b>: la campaña en Fácil también tiene logros por estrellas, como las demás dificultades.'],
    joke: ['Microblizz ha puesto una misión para que cumplas las demás. Es lo más parecido a un jefe que ha hecho en años.'] },
  { v: '0.9.63', real: [
      '<b>RAREZAS CON LOS COLORES DE SIEMPRE</b>: Común en gris, Poco común en verde, Rara en azul, Épica en lila y Legendaria en naranja (los líderes también). Lo que antes se llamaba Común ahora es Poco común.',
      '<b>MÁS ESCALONES</b>: las tropas de enjambre de cada facción (MadSquirrel, Noobs, Hoplites…) y lo más básico del gashapón (Cafeína, Piel dura, Puños de hierro, Espada de cartón piedra, Casco con cuernos y Taza del becario) pasan a Común. El 55 % que antes era todo Común ahora se reparte: 30 % Común y 25 % Poco común. Hitbox dudosa baja a Poco común, y el Imán de CAOS, los Auriculares y el Botón de pausa bajan a Épica.',
      '<b>LO LEGENDARIO BRILLA</b>: todo lo legendario lleva un destello que cruza la carta (en modo ahorro se apaga).',
      '<b>CALIDAD CON ESTRELLAS</b>: la calidad de cada copia se ve con estrellas, de ★ (Becario) a ★★★★★ (CEO), y la de CEO brilla. Así el color solo te dice la rareza.',
      '<b>MÍTICA (ROJA)</b>: en la Biblioteca ya asoman las primeras cartas míticas, tapadas. Llegarán como premio de eventos y torneos.'],
    joke: ['Microblizz ha pintado de rojo una rareza que todavía no existe. Ya están preparando el precio.'] },
  { v: '0.9.61', real: [
      '<b>GARANTÍAS CON BARRA</b>: en el Gashapón, cada garantía (épica, legendaria, calidad Director) ahora tiene su barra de progreso: ves cuánto llevas y cuánto te falta, y cuando estás cerca la barra se pone naranja y late.'],
    joke: ['Microblizz ha añadido una barrita de progreso. Casi seguro que no tiene nada que ver con que gastes más gemas.'] },
  { v: '0.9.60', real: [
      '<b>PROBABILIDADES MÁS CLARAS</b>: en el Gashapón, la letra pequeña de abajo ahora es una lista: una probabilidad por línea, y las garantías aparte.'],
    joke: ['Microblizz ha puesto las probabilidades en lista para que se lean mejor. Las malas, igual de pequeñas.'] },
  { v: '0.9.57', real: [
      '<b>PROBABILIDADES A LA VISTA</b>: la tienda tiene una sección con las probabilidades reales del gashapón, objeto por objeto.'],
    joke: ['Microblizz jura que los porcentajes siempre estuvieron a la vista. Debajo de la letra pequeña, eso sí.'] },
  { v: '0.9.56', real: [
      '<b>PRIVACIDAD Y CONDICIONES</b>: ya puedes leer cómo guardamos tu progreso y las reglas del juego, en Opciones → Cuenta y en la página de inicio.'],
    joke: ['Microblizz asegura que sus condiciones de uso son cortas. El departamento legal dice que es lo único corto que tiene.'] },
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
