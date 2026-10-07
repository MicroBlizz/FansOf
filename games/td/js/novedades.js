// Fans of TD · Novedades: el informe de cada versión, la más nueva primero.
// real: lo nuevo de verdad, en lenguaje llano · joke: una o dos notas de humor de Microblizz o Phony.
// La primera entrada es la que ve el jugador al abrir el juego después de actualizarse.
// La versión que se publica se escribe en index.html (…/core/js/nucleo.js?v=…); aquí, `v` dice a qué versión corresponde cada informe.
'use strict';
const NEWS = [
  { v: '0.13.21', real: [
      '<b>JUEGO LIMPIO</b>: las recompensas, el gashapón y las compras se validan en nuestro servidor, y vigilamos las trampas. Quien las haga puede perder ventajas o su cuenta. Gracias por jugar limpio.'],
    joke: ['Microblizz también vigila a su plantilla. De momento sin éxito.'] },
  { v: '0.13.18', real: [
      '<b>TU ECONOMÍA EN LA NUBE</b>: con tu cuenta, el gashapón, despedir copias, volver a tirar sus números y subir de nivel las cartas los hace nuestro servidor, y tu oro y tus gemas quedan guardados en ella. Para hacerlo hace falta conexión.'],
    joke: ['El servidor de Microblizz ya cuenta tu oro. Dice que le sobra tiempo desde que dejó de contar el suyo.'] },
  { v: '0.13.12', real: [
      '<b>AVISO IMPORTANTE</b>: abre el juego con conexión antes del <b>21 de octubre</b> para subir tu progreso actual (oro, gemas, objetos y niveles) a tu cuenta. Pasada esa fecha, una partida antigua que no se haya subido ya no podrá subirse: seguirá en tu aparato, pero tu cuenta empezará desde cero.'],
    joke: ['Microblizz recuerda que las fechas límite son como sus promesas: se acercan solas.'] },
  { v: '0.13.7', real: [
      '<b>RECURSOS</b>: por dentro, el oro, las gemas y las entradas pasan ahora por un solo sitio. No cambia nada de lo que ves, pero prepara el guardado de tu cuenta en la nube y la futura tienda.'],
    joke: ['Microblizz asegura que ahora cuida mejor de tus recursos. De los suyos ya se encargaba su contable.'] },
  { v: '0.13.6', real: [
      '<b>MODO PRUEBAS</b> (en Opciones): ahora lo da todo al máximo. Las cartas suben solas al nivel 10, tienes todas las habilidades y objetos con calidad perfecta y toda la campaña con 3 estrellas. Antes guarda una copia de tu partida: con QUITAR vuelves a ella tal como estaba.'],
    joke: ['Microblizz llama a esto «edición coleccionista». Los demás lo llamamos trampas.'] },
  { v: '0.13.4', real: [
      '<b>MENÚ</b>: los iconos de abajo vuelven a tener color, ahora con una paleta que combina: coral, naranja, dorado y violeta.'],
    joke: ['El consultor de color de Microblizz ha cambiado de opinión. Ha vuelto a cobrar.'] },
  { v: '0.13.3', real: [
      '<b>MENÚ</b>: colores más ordenados. Naranja para jugar, violeta para los modos de juego y dorado para conseguir cosas (gashapón y tienda). Los iconos de abajo, todos en dorado.'],
    joke: ['Microblizz ha contratado a un consultor de color. Cobró por decir «menos colores».'] },
  { v: '0.13.2', real: [
      '<b>INGLÉS</b>: las descripciones de habilidades y objetos ya salen enteras en inglés (antes se quedaban trozos en español).'],
    joke: ['Microblizz ha despedido al becario de traducción. Lo ha sustituido otro becario.'] },
  { v: '0.13.1', real: [
      '<b>BIBLIOTECA</b>: un botón nuevo en el menú con todas las habilidades y objetos del juego. Ves de un vistazo cuáles tienes (y cuántas copias), cuáles te faltan y qué hace cada uno. Puedes filtrar por «Lo tengo» y «Me falta».',
      '<b>ARREGLADO</b>: el botón Misiones no abría las misiones diarias.'],
    joke: ['Microblizz ha catalogado todo lo que no te va a tocar en el gashapón. Es una lista larga.'] },
  { v: '0.13.0', real: [
      '<b>CUENTA</b>: tu progreso se guarda ahora también en la nube, sin que tengas que hacer nada. En Opciones → Cuenta puedes guardarlo con tu email (sin contraseña) para no perderlo y seguir jugando en otro móvil o PC.',
      'Si juegas en dos aparatos y las dos partidas cambian, el juego te pregunta con cuál sigues.'],
    joke: ['Microblizz guarda tu partida en «la nube». Por lo visto, la nube es el ordenador de otro.'] },
  { v: '0.12.0', real: [
      '<b>IDIOMAS</b>: el juego está ahora en español y en inglés. Se elige solo según el idioma de tu navegador y puedes cambiarlo en Opciones (Idioma / Language).',
      'El inglés cubre los menús, las cartas, las torres, las misiones y los logros. Si ves algo que sigue en español, ya lo sabemos.'],
    joke: ['Microblizz ha descubierto que existen más idiomas y quiere cobrarte la traducción.', 'Phony lo llama «localización premium». Tú, «por fin».'] },
  { v: '0.11.0', real: [
      '<b>Los menús son ya los mismos que en Fans of Rumble</b>, con el mismo código: colección, inventario, gashapón, tienda, horas extra y sonido.',
      '<b>El equipo se comparte entre líderes</b>: una misma copia la pueden llevar varios a la vez. En la colección, «PONER ESTE EQUIPO A TODOS LOS LÍDERES» lo hace de un toque.',
      'En el gashapón de equipo, los <b>objetos de facción</b> salen más a menudo: la mitad de las veces que toca su rareza.',
      'Los menús suenan como en el Rumble y, después de ganar, vuelve la canción de menú que tengas elegida en Opciones.',
      'Despedir copias, volver a sortearlas y girar el gashapón cuentan ya para los logros.'],
    joke: ['Microblizz ha fusionado dos departamentos de menús en uno. Sobran becarios.', 'Phony lo llama «sinergia». Tú, «por fin».'] },
  { v: '0.10.0', real: [
      '<b>MISIONES</b>: cuatro diarias y cuatro semanales, con oro, gemas y puntos de pase. Colocar torres, superar oleadas, fusionar, ganar en el modo VS…',
      '<b>LOGROS</b>: más de 1.300, por niveles, y cada uno da gemas una sola vez. Los hay de batallas, de cada facción y cada carta, de campaña, de enemigos, de gashapón, de constancia… y secretos.',
      '<b>PASE DE BATALLA</b>: 30 niveles con pista gratis y pista Ejecutiva (de prueba: no se cobra nada). Jugar partidas y cobrar misiones da puntos.',
      '<b>PREMIO DIARIO</b> por entrar cada día: el séptimo, 10 tiradas gratis.',
      '<b>TU PERFIL</b>: Lola te pregunta cómo te llamas. Toca tu avatar arriba a la izquierda para ver tus números, cambiar el nombre o elegir avatar.',
      'El botón de sonido de la portada pasa a Opciones para dejar sitio al perfil.'],
    joke: ['Microblizz ha encontrado la forma de que vuelvas cada día: regalarte cosas. Le ha dolido.', 'El pase de batalla dura «hasta que Microblizz lo cierre». No han querido dar fecha.'] },
  { v: '0.9.6', real: [
      '<b>Los objetos, solo en el líder</b>, como en Fans of Rumble: arma, cabeza y accesorio son suyos, y las demás cartas llevan solo su habilidad. Lo que tuvieran puesto otras cartas ha vuelto a tu inventario.',
      'Las habilidades y los objetos ya no llevan la etiqueta de TORRE o UNIDAD: dicen lo que hacen y ya está. El <b>daño</b> vale para las dos cosas: la torre pega más y la unidad le quita más vida a la base rival.',
      'El modo sin conexión guarda el juego entero desde la primera visita.'],
    joke: ['Microblizz ha retirado el equipo a toda la plantilla menos al jefe. Dice que así «se simplifica».'] },
  { v: '0.9.5', real: [
      'Cambio interno: los números propios de Fans of TD (qué hace cada objeto y cada habilidad, y sus recompensas) están ahora en un archivo de ajustes aparte. No cambia nada al jugar.'],
    joke: ['Microblizz ha separado «sistemas» de «datos». A los becarios los ha dejado en «gastos».'] },
  { v: '0.9.4', real: [
      '<b>HORAS EXTRA</b>: cada líder hace ahora su propio especial. NecroLord invoca esqueletos, CyberMarine llama a sus drones, el Vikingo levanta su muro de escudos… Antes todos saltaban como CrazyBunny.',
      'En la portada, los tres personajes de tu facción salen subidos a su <b>peana de torre</b>.'],
    joke: ['Microblizz ha descubierto que sus empleados también tienen habilidades propias. Las ha puesto de pago.'] },
  { v: '0.9.3', real: [
      '<b>Dirección nueva</b>: el juego vive ahora en microblizz.github.io/FansOf. La dirección antigua te trae aquí sola.',
      'Si vienes de la antigua con progreso guardado, al llegar te pregunta si quieres <b>traértelo</b>.'],
    joke: ['Microblizz se ha mudado de oficina. Los despidos también se han mudado.'] },
  { v: '0.9.2', real: [
      '<b>El juego se llama Fans of TD</b>. La serie es «Fans Of»: el primero fue Fans of Rumble y este es su defensa de torres.',
      'Si lo tienes instalado como app, el nombre nuevo sale al reinstalarlo.'],
    joke: ['Microblizz ha registrado «Fans Of» en 40 países. Por si acaso.'] },
  { v: '0.9.1', real: [
      'Cambio interno: el juego se ha ordenado por dentro para compartir razas, cartas, objetos, menús y música con los próximos juegos de Fans of Rumble.',
      'Tu progreso se conserva. Si lo tenías <b>instalado como app</b> y no abre bien, desinstálalo y vuelve a instalarlo desde Opciones.'],
    joke: ['Microblizz llama a esto «sinergias». Normalmente después despide a alguien.'] },
  { v: '0.9.0', real: [
      '<b>Menús como los del original</b>: la portada, la campaña, la pantalla de antes de jugar, la pausa y el final de la partida tienen ahora su mismo aspecto.',
      '<b>Antes de jugar</b> eliges tu facción en una pantalla propia, con su pasiva. En el modo VS eliges ahí también el rival.',
      '<b>Cómo se juega</b>: un resumen en 8 pasos, en la portada.',
      'Arreglados colores que faltaban en algunos menús (los fondos de la cartera y de varias cajas salían transparentes).'],
    joke: ['Microblizz ha renovado los menús. Los precios, también.', 'Phony asegura que la pantalla de pausa es una función exclusiva.'] },
  { v: '0.8.1', real: [
      '<b>Poner varias torres seguidas</b>: al colocar una torre, su carta se queda elegida unos segundos. Toca otra casilla y pones otra igual, sin volver a la bandeja.',
      'Se suelta sola a los 4 segundos, si no te llega el CAOS para otra, o si tocas la carta o una torre ya puesta.'],
    joke: ['Microblizz estudia cobrar por cada toque que te ahorras.'] },
  { v: '0.8.0', real: [
      '<b>Opciones como las del original</b>: música del menú a elegir (la de cualquier raza o jefe), avisos encima o en una caja, chapas, sangre y chat.',
      '<b>Chat en directo</b>: los comentarios falsos del original, durante la partida. Se quita en Opciones.',
      '<b>Tutorial</b>: una partida guiada en el nivel 1-1 para quien empieza. Se puede repetir desde Opciones.'],
    joke: ['El chat pregunta dónde se compra el CAOS. Microblizz está tomando nota.', 'La sangre es opcional. Los despidos, no.'] },
  { v: '0.7.0', real: [
      '<b>Opciones</b>: volumen, música, números de daño, temblor de pantalla y modo pruebas. Están en el menú principal.',
      '<b>Instalar</b>: desde Opciones puedes instalar el juego como una app, a pantalla completa. Instalado también funciona sin conexión.',
      '<b>Pasar el progreso</b> a otro móvil o PC con un código, y empezar de cero si quieres.'],
    joke: ['Microblizz ha añadido un botón de opciones. La opción de no pagar sigue en desarrollo.', 'Phony recuerda que instalar el juego no te da la propiedad del juego.'] },
  { v: '0.6.1', real: [
      '<b>Arreglado el parpadeo de las cartas de torres</b>: durante la partida se apagaban y encendían solas varias veces por segundo. Ahora solo se apagan cuando no te llega el CAOS.'],
    joke: ['Microblizz aclara que el parpadeo era una función prémium de discoteca. Se retira por falta de suscriptores.'] },
  { v: '0.6.0', real: [
      '<b>Menús como los del original</b>: colección, inventario, gashapón con su máquina de cápsulas, tienda y horas extra tienen ahora su mismo aspecto.',
      '<b>Informe de parches</b>: esta ventana. Sale una vez con cada versión y puedes volver a verla en NOVEDADES.',
      '<b>Experiencia</b>: cada torre que pones y cada unidad que envías da XP a su carta. Para subirla de nivel hace falta XP y oro, como en el original.',
      '<b>Inventario</b>: todas tus copias con su calidad. Puedes bloquearlas, volver a sortear sus números o despedirlas (también en masa).',
      'El gashapón tiene tiradas <b>x1, x10 y x50</b>, con una épica segura por cada 10.',
      'Arreglado el parpadeo de los botones de la torre durante el combate.'],
    joke: ['Microblizz quería cobrar 0,99 € por leer estas notas. Al becario se le olvidó poner el botón de pagar.', 'El CEO ha preguntado por qué las torres no tienen contrato temporal.', 'Phony anuncia que la música subirá de tono para siempre. También el precio.'] },
  { v: '0.5.0', real: [
      '<b>Música del original</b>: un tema por raza, el de cada jefe y los de victoria y derrota. Después de sonar entera sigue subiendo de tono sin fin (paradoja de Shepard) para que no canse.'],
    joke: ['La música era gratis. Microblizz está investigando cómo ha podido pasar.'] },
  { v: '0.4.0', real: [
      '<b>Progreso</b>: oro y gemas, niveles de carta, habilidades, equipo, gashapón, tienda y horas extra.',
      'Cada carta es una <b>torre</b> y una <b>unidad</b> que comparten nivel, habilidad y equipo: casi todo mejora solo una de las dos.',
      '<b>Modo VS</b>: mejora tus unidades dentro de la partida, y el rival gasta más en mandarte las suyas. Lo de dentro de la partida ahora se llama <b>CAOS</b>.'],
    joke: ['Las horas extra no se pagan. Se «acumulan».'] },
  { v: '0.3.0', real: ['<b>Modo VS</b> contra un rival que lleva el juego: envía unidades, sube tu income y róbale vida a su base.', '<b>Fusiones</b>: dos torres iguales, del mismo nivel y pegadas se funden en una mejor.'], joke: ['El rival también es un becario. No se lo digas.'] },
  { v: '0.2.0', real: ['Las <b>9 razas</b> con sus torres y su pasiva, y los <b>12 mundos</b> de la campaña con sus jefes.'], joke: ['Doce mundos y ni un solo día de vacaciones.'] },
  { v: '0.1.0', real: ['Defensa de torres de <b>laberinto</b>: el campo es todo camino, lo cierras tú con torres y nunca del todo.'], joke: ['Microblizz ha patentado «andar en línea recta».'] },
];
