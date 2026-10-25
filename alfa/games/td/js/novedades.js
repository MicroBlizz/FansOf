// Fans of TD · Novedades: el informe de cada versión, la más nueva primero.
// real: lo nuevo de verdad, en lenguaje llano · joke: una o dos notas de humor de Microblizz o Phony.
// La primera entrada es la que ve el jugador al abrir el juego después de actualizarse.
// La versión que se publica se escribe en index.html (…/core/js/nucleo.js?v=…); aquí, `v` dice a qué versión corresponde cada informe.
'use strict';
const NEWS = [
  { v: '0.13.84', real: ["<b>MEJORAS POR DENTRO</b>: los sistemas comunes de la serie se preparan para las compras dentro de la app de Android."], joke: ["Microblizz ha construido una torre nueva: la de cobrar. Phony dice que no dispara a nadie."] },
  { v: '0.13.83', real: ["<b>SONIDO ARREGLADO</b>: con el volumen de los efectos a cero ya no se rompe el toque de los botones."], joke: ["Microblizz ha callado las torres y Phony ha pedido que al menos disparen con educación."] },
  { v: '0.13.82', real: ["<b>MEJORAS POR DENTRO</b>: los sistemas comunes de la serie se preparan para jugar con amigos en salas."], joke: ["Microblizz está levantando salas para jugar con amigos y Phony ya ha puesto una torre en la entrada."] },
  { v: '0.13.81', real: ["<b>MEJORAS POR DENTRO</b>: los avisos de errores y de rendimiento respetan ahora el interruptor de datos anónimos de Opciones."], joke: ["Microblizz ha puesto una verja a los informes de las torres y Phony ha tirado la llave a la zanja."] },
  { v: '0.13.80', real: ["<b>MEJORAS POR DENTRO</b>: los sistemas comunes de la serie ya hablan más idiomas (portugués, francés, alemán e italiano; de momento los estrena Fans of Rouflage)."], joke: ["Microblizz ha puesto carteles en cuatro idiomas en la torre y Phony los ha usado de escudo."] },
  { v: '0.13.79', real: ["<b>MEJORAS POR DENTRO</b>: limpieza de traducciones en los sistemas comunes de la serie y ajustes en el botón de jugar de la web."], joke: ["Microblizz ha limpiado las ruinas de textos y Phony ha puesto una torre sobre una errata."] },
  { v: '0.13.78', real: ["<b>MEJORAS POR DENTRO</b>: en la app de Android el acceso con Google vuelve ya a la app, y todos los juegos van a pantalla completa."], joke: ["Microblizz ha despejado el campo de las torres y Phony ha puesto una torre en la barra de estado."] },
  { v: '0.13.77', real: ["<b>MEJORAS POR DENTRO</b>: los sistemas comunes de la serie siguen mejorando (la web puede abrir cada juego por fases y tener una beta para probadores)."], joke: ["Microblizz ha puesto una cinta de obra junto a las torres y Phony la ha defendido con uñas y dientes."] },
  { v: '0.13.76', real: ["<b>MEJORAS POR DENTRO</b>: en Opciones hay un interruptor nuevo, «Datos de partida anónimos», para ayudarnos a mejorar los juegos sin tu nombre, sin email y sin cuenta (lo puedes apagar cuando quieras). Y la promo de otros juegos de la serie dice si es un prototipo o una demo."],
    joke: ["Microblizz ha puesto una torre nueva que solo cuenta cosas. Phony le pregunta cada mañana cuántos días le quedan de vacaciones."] },
  { v: '0.13.75', real: ["<b>MEJORAS POR DENTRO</b>: los sistemas comunes de la serie siguen mejorando (la promo de otros juegos de la serie ocupa ahora toda la pantalla, con el fondo difuminado y el nombre del juego abajo)."], joke: ["Microblizz ha tapado el camino con un anuncio enorme y los enemigos han tenido que dar la vuelta."] },
  { v: '0.13.74', real: ["<b>MEJORAS POR DENTRO</b>: los sistemas comunes de la serie siguen mejorando (la promo de otros juegos de la serie enseña ahora sus capturas, una tras otra)."], joke: ["Microblizz ha colgado fotos de otros juegos en las torres y los enemigos ya hacen cola para verlas."] },
  { v: '0.13.73', real: ["<b>MEJORAS POR DENTRO</b>: los sistemas comunes de la serie siguen mejorando (los huecos de anuncio enseñan ahora otros juegos de Fans Of)."], joke: ["Microblizz ha puesto carteles de otros juegos junto a las torres y Phony ha intentado defender uno."] },
  { v: '0.13.72', real: ["<b>COMPRAS MÁS SEGURAS</b>: si juegas como invitado, antes de pagar con euros te pedimos que marques que lo sabes: sin cuenta (email o Google) podrías perder lo comprado. Además, mejoras por dentro en los sistemas de la serie."], joke: ["Microblizz ha puesto una casilla de «estoy avisado» en cada torre. Phony pregunta si la de vigilancia cuenta doble."] },
  { v: '0.13.71', real: ["<b>AJUSTES DE ECONOMÍA</b>: hemos ajustado las recompensas y los precios de las tiendas para mantener una economía sana en el juego. No es definitivo: seguimos trabajando en ello."], joke: ["Microblizz ha ajustado la paga de las torres y Phony ha pedido un adelanto de nómina."] },
  { v: '0.13.70', real: ["<b>TIENDA CON DOS MONEDAS AFINADA</b>: el cambio de oro por gemas y las compras de la tienda quedan igual que en Rumble, y la tienda ya no dice «sin conexión» cuando el servidor contesta con un error."], joke: ["Microblizz ha repasado la tienda de las torres y Phony ha intentado comprar una torre con el cambio de las gemas."] },
  { v: '0.13.69', real: ["<b>MEJORAS POR DENTRO</b>: la tienda de dos monedas ya está preparada en este juego, aunque todavía no se abre."], joke: ["Microblizz ha dejado la caja de dos monedas lista y Phony ya ha pedido que la abran el viernes, que es cuando cobra."] },
  { v: '0.13.68', real: ["<b>MEJORAS POR DENTRO</b>: los sistemas comunes de la serie siguen mejorando (nueva base de dos monedas para las tiendas, que de momento no se nota)."], joke: ["Microblizz ha puesto dos monedas en la tienda de las torres. Phony dice que la que no se ve es la que se gasta más rápido."] },
  { v: '0.13.67', real: ["<b>ANÁLISIS ANÓNIMO, SOLO SI TÚ QUIERES</b>: la serie estrena un aviso para medir cuánta gente juega y qué se usa más, y así hacer mejores juegos. Hasta que pulses «Aceptar» no se carga nada de Google ni se guarda ninguna cookie, y puedes decir que no."], joke: ["Microblizz cuenta cuántas torres aguantan la oleada. Phony asegura que las suyas aguantan, pero en otra dimensión."] },
  { v: '0.13.66', real: ["<b>MEJORAS POR DENTRO</b>: los sistemas comunes de la serie siguen mejorando."], joke: ["Microblizz ha repasado las torres por dentro. Phony dice que ahora disparan con más ganas."] },
  { v: '0.13.65', real: ["<b>FEEDBACK CON ESTRELLAS</b>: la pestaña de feedback pide ahora una nota de 1 a 5 y alguna pregunta corta sobre el último cambio. Y por dentro, los sistemas comunes siguen mejorando."], joke: ["Microblizz ha contado tus estrellas dos veces para asegurarse. Phony las cuenta aparte, en su cuenta."] },
  { v: '0.13.64', real: ["<b>UN SOLO NOMBRE PARA TODA LA SERIE</b>: tu cuenta de Fans Of tiene ahora un único nombre público en todos los juegos, y lo cambias desde «Mi cuenta», donde además ves si tienes el pase de caos ilimitado. Y por dentro, los sistemas comunes miden mejor cómo corre cada juego."], joke: ["Microblizz ha puesto tu nombre en la torre. Phony dice que las torres no leen, pero lo agradecen."] },
  { v: '0.13.63', real: ["<b>VERSIÓN EN EL FEEDBACK</b>: la pestaña de feedback muestra ahora la versión del juego en la que estás, y se guarda con tu mensaje para poder revisarlo después."], joke: ["Microblizz ha puesto la edad del juego en la pestaña. Phony pregunta si también enseña la suya."] },
  { v: '0.13.62', real: ["<b>SESIÓN MÁS ROBUSTA</b>: si tu sesión de Google caducaba, el feedback, la partida en la nube y los votos fallaban sin decir por qué. Ahora se avisa y puedes entrar otra vez. Y ya no se pelean dos pestañas por renovarla."], joke: ["Microblizz ha renovado tu sesión sin avisar. Phony pregunta si también renueva las suyas."] },
  { v: '0.13.61', real: ["<b>ENTRAR CON GOOGLE, MÁS FÁCIL</b>: ahora hay un solo botón, «Continuar con Google», que sirve tanto para crear la cuenta como para entrar en la que ya tenías. Y si la ventana de cuenta te tapaba la confirmación, ya no pasa."], joke: ["Microblizz ha fundido dos botones de Google en uno. Phony pregunta si el otro se ha ido de vacaciones."] },
  { v: '0.13.60', real: ["<b>CAOS PRIMORDIAL</b>: el contador tiene ahora una barra que se va llenando hasta el siguiente punto, y los números siempre salen enteros. El botón de ver un anuncio es más pequeño."], joke: ["Phony ha instalado una barra de carga junto a la torre. Las torres no cargan nada, pero hacen bulto."] },
  { v: '0.13.59', real: ["<b>FEEDBACK</b>: una pestañita para contarnos una idea, un fallo o tu opinión, con la versión del juego. Si quieres, nos dejas permiso para escribirte por email."], joke: ["Phony ha instalado un buzón de ideas junto a la torre. Dice que las ideas buenas también necesitan defensa."] },
  { v: '0.13.58', real: ["<b>TIRADAS GRATIS</b>: en el gashapón tienes una tirada x1 gratis cada 3 horas y, cada domingo, una x10 gratis (reclámala ese día o caduca). Con cuenta atrás para que no se te pase."], joke: ["Phony ha contado las tiradas gratis tres veces. Dice que le salen menos que a Microblizz."] },
  { v: '0.13.57', real: ["<b>MEJORAS POR DENTRO</b>: cambios en los sistemas comunes de la serie. No notarás nada… y eso es buena señal."], joke: ["Microblizz ha repintado las torres del mismo gris de siempre. Lo llama «rediseño»."] },
  { v: '0.13.56', real: ['<b>MEJORAS POR DENTRO</b>: cambios en los sistemas comunes de la serie. No notarás nada… y eso es buena señal.'], joke: ['Phony ha reforzado las torres por dentro y ha cobrado una cuota de mantenimiento a los cimientos.'] },
  { v: '0.13.55', real: ['<b>MEJORAS POR DENTRO</b>: cambios en los sistemas comunes de la serie. No notarás nada… y eso es buena señal.'], joke: [] },
  { v: '0.13.54', real: ['<b>MEJORAS POR DENTRO</b>: cambios en los sistemas comunes de la serie. No notarás nada… y eso es buena señal.'], joke: [] },
  { v: '0.13.53', real: ['<b>MEJORAS POR DENTRO</b>: cambios en los sistemas comunes de la serie. No notarás nada… y eso es buena señal.'], joke: [] },
  { v: '0.13.52', real: ['<b>MEJORAS POR DENTRO</b>: cambios en los sistemas comunes de la serie. No notarás nada… y eso es buena señal.'], joke: [] },
  { v: '0.13.51', real: ['<b>MEJORAS POR DENTRO</b>: cambios en los sistemas comunes de la serie. No notarás nada… y eso es buena señal.'], joke: [] },
  { v: '0.13.50', real: ['<b>MEJORAS POR DENTRO</b>: cambios en los sistemas comunes de la serie. No notarás nada… y eso es buena señal.'], joke: [] },
  { v: '0.13.49', real: ['<b>MEJORAS POR DENTRO</b>: cambios en los sistemas comunes de la serie. No notarás nada… y eso es buena señal.'], joke: [] },
  { v: '0.13.48', real: ['<b>MEJORAS POR DENTRO</b>: cambios en los sistemas comunes de la serie. No notarás nada… y eso es buena señal.'], joke: [] },
  { v: '0.13.47', real: ['<b>MEJORAS POR DENTRO</b>: cambios en los sistemas comunes de la serie. No notarás nada… y eso es buena señal.'], joke: [] },
  { v: '0.13.46', real: ['<b>MEJORAS POR DENTRO</b>: cambios en los sistemas comunes de la serie. No notarás nada… y eso es buena señal.'], joke: [] },
  { v: '0.13.45', real: ['<b>MINIATURAS NUEVAS</b>: cada habilidad y cada objeto tiene ahora su propio dibujo, en lugar de dos letras o del mismo icono para todos. El fondo lleva el color de su rareza, y las Épicas y Legendarias brillan con rayos de luz. Las verás en la Biblioteca, el inventario y el gashapón.'], joke: ['Microblizz ha encargado 75 dibujos nuevos. Al ilustrador le ha pagado en «visibilidad».'] },
  { v: '0.13.44', real: ['<b>MEJORAS POR DENTRO</b>: cambios en los sistemas comunes de la serie. No notarás nada… y eso es buena señal.'], joke: [] },
  { v: '0.13.43', real: ['<b>MEJORAS POR DENTRO</b>: cambios en los sistemas comunes de la serie. No notarás nada… y eso es buena señal.'], joke: [] },
  { v: '0.13.42', real: ['<b>MEJORAS POR DENTRO</b>: cambios en los sistemas comunes de la serie. No notarás nada… y eso es buena señal.'], joke: [] },
  { v: '0.13.41', real: ['<b>MEJORAS POR DENTRO</b>: el pase ya sabe dar frases y emoticonos, que estrenan los Animales Locos en Fans of Rumble. Aquí no cambia nada… de momento.'],
    joke: ['Microblizz ha descubierto que puede vender frases hechas. Ha mandado a todo el departamento de marketing a buscar más.'] },
  { v: '0.13.40', real: ['<b>MEJORAS POR DENTRO</b>: cambios en los sistemas comunes de la serie. No notarás nada… y eso es buena señal.'],
    joke: ['Microblizz ha instalado interruptores para encender y apagar cosas desde su despacho. Aún no sabe cuál apaga las luces.'] },
  { v: '0.13.39', real: ['<b>PVP VUELVE A SU NOMBRE</b>: en español vuelve a decir PvP. Los «ingresos» se quedan.'],
    joke: ['Phony sigue sin entender qué es un ingreso. Microblizz tampoco.'] },
  { v: '0.13.38', real: ['<b>MENOS TECNICISMOS</b>: en español, «income» pasa a llamarse «ingresos» y el PvP, JcJ.'],
    joke: ['Phony pide que los ingresos se queden en su cuenta. Microblizz dice que eso es otro juego.'] },
  { v: '0.13.37', real: ['<b>MÁS TEXTOS EN INGLÉS</b>: hemos repasado y traducido textos que se habían quedado sin traducir.'],
    joke: ['Microblizz ha descubierto que el inglés también existe. Está muy orgulloso.'] },
  { v: '0.13.36', real: ['<b>INICIAR SESIÓN, MÁS FÁCIL</b>: el menú tiene un botón «Iniciar sesión / crear cuenta» para guardar tu progreso con Google o con tu email.'],
    joke: ['Microblizz ha puesto un cartel de «Entrada» en la puerta. Antes había que adivinar dónde estaba.'] },
  { v: '0.13.35', real: [
      '<b>PASE CON ASPECTO NUEVO</b>: el pase tiene un diseño renovado y pasa a funcionar como en Rumble.'],
    joke: ['Microblizz ha pintado el pase de otro color y lo llama «rediseño».'] },
  { v: '0.13.34', real: [
      '<b>SESIÓN MÁS ESTABLE</b>: arreglado el error «invalid refresh token» que a veces te sacaba de la cuenta.'],
    joke: ['Microblizz asegura que la sesión ahora es de las que no se cae. Ya lo dijo del puente.'] },
  { v: '0.13.33', real: [
      '<b>ENTRA CON GOOGLE</b>: ya puedes guardar tu progreso con tu cuenta de Google (Opciones → Cuenta). Ahora está en pruebas: escribe a fansofmicroblizz@gmail.com con tu correo de Google y te añadimos a mano.'],
    joke: ['Microblizz se compromete a abrir el acceso con Google a todo el mundo en menos de un año. Tiene la firma de un becario.'] },
  { v: '0.13.24', real: [
      '<b>PROBABILIDADES A LA VISTA</b>: la tienda tiene una sección con las probabilidades reales del gashapón, objeto por objeto.'],
    joke: ['Microblizz jura que los porcentajes siempre estuvieron a la vista. Debajo de la letra pequeña, eso sí.'] },
  { v: '0.13.23', real: [
      '<b>PRIVACIDAD Y CONDICIONES</b>: ya puedes leer cómo guardamos tu progreso y las reglas del juego, en Opciones → Cuenta y en la página de inicio.'],
    joke: ['Microblizz asegura que sus condiciones de uso son cortas. El departamento legal dice que es lo único corto que tiene.'] },
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
