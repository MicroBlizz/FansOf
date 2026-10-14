// Fans of Roguelite · Novedades: el informe de cada versión, la más nueva primero. La página de entrada (index.html de la raíz)
// lo lee; el juego no lo carga. La versión que sale en la Biblioteca es la del primer informe.
'use strict';
const NEWS = [
  { v: '0.6.6', real: ['<b>ELIGE MUNDO, MÁS CLARO</b>: cada mundo dice en qué nivel de despido lo vas a jugar y si ya lo has superado en ese nivel. La corona solo sale si lo has ganado en ese despido, y ya no tapa el nombre.'],
    joke: ['Microblizz repartía coronas a quien no había ganado nada. Como sus premios anuales.'] },
  { v: '0.6.5', real: ['<b>EL SOL, ENTERO</b>: en los móviles justos, el sol y la luna ya no se cortan por arriba: el cielo baja lo que haga falta.'],
    joke: ['Microblizz quería cobrar el sol entero como contenido premium.'] },
  { v: '0.6.4', real: ['<b>SUELO BAJO LOS PIES</b>: en los móviles más justos, CrazyBunny ya no pisa el borde de la escena. Para hacer sitio se recorta cielo, no suelo.'],
    joke: ['Microblizz había vendido el suelo. Lo hemos recuperado.'] },
  { v: '0.6.3', real: ['<b>MENOS TEMBLORES</b>: los golpes ya no sacuden tanto la pantalla: el temblor es la mitad de fuerte, casi solo de lado y dura menos. Se acabó el mareo.'],
    joke: ['Microblizz dice que el temblor era «inmersión». Era un mareo.'] },
  { v: '0.6.2', real: ['<b>LA ESCENA YA NO SE MUEVE</b>: al elegir habilidad, objeto o en la tienda, el mundo se quedaba subiendo y bajando y mareaba. Ahora la escena está quieta y es el panel el que sube por encima.'],
    joke: ['Microblizz dice que el mareo era «inmersión». Lo hemos quitado igual.'] },
  { v: '0.6.1', real: [
      '<b>TUTORIAL</b>: la primera vez, el juego se para y te señala con una flecha el mapa, la casita (tócala dos veces para volver a La Madriguera cuando quieras, con la partida guardada), la barra del Zanahorazo y el nivel de despido.',
      '<b>NIVEL DE DESPIDO A LA VISTA</b>: sale siempre arriba, junto a tu nivel, y al empezar la partida. En Jugar se ve claro cuál eliges.',
      '<b>BOCADILLOS MÁS CORTOS</b>: los enemigos hablan menos rato, se callan al primer golpe y ya no tapan su vida.'],
    joke: ['Microblizz quería cobrar el tutorial como DLC. Lola lo ha regalado.'] },
  { v: '0.6.0', real: [
      '<b>TIRA EL DADO</b>: ahora cada día lo empiezas tú. Toca la pantalla, sale 1, 2 o 3 y CrazyBunny avanza esas casillas del mapa: lo que haya en la casilla es lo que te pasa. Al final de cada capítulo siempre se para. ¿No te gusta la tirada? Con la Pata de conejo (en Mejoras) o el Dado de Lola puedes repetirla.',
      '<b>ZANAHORAZO</b>: la barra naranja del marcador se llena pegando y recibiendo. Cuando brille, toca la pantalla en un combate: golpe x3 (x6 si es crítico). Si la guardas, llega llena al jefe.',
      '<b>COMBOS</b>: 14 parejas de habilidades que juntas dan un extra, con su nombre (Erizo blindado, Vampiro loco, Café doble…). Al elegir, las que hacen combo con las tuyas llevan la etiqueta COMBO.',
      '<b>NIVELES DE DESPIDO</b>: al ganar un mundo se abre el nivel siguiente, con enemigos más duros y más monedas. Se elige en Jugar.',
      '<b>RETOS</b>: 16 retos de una vez (ganar sin un rasguño, 10 Zanahorazos, el premio gordo…) con monedas para La Madriguera. Su página está en el menú.',
      '<b>MENOS ESPERAS</b>: el camino, las paradas y los premios van más ligeros: una partida dura la mitad y tú decides el doble.'],
    joke: ['Microblizz ha intentado patentar el dado. El dado ha dicho que no.'] },
  { v: '0.5.5', real: [
      '<b>TODO SE LEE ENTERO</b>: ningún texto se corta. Al elegir habilidad, objeto o en la tienda, la escena sube un poco para dejar sitio y, si aun así no cabe, la explicación sale en letra pequeña.',
      '<b>TIEMPO PARA LEER</b>: a x1 los textos duran más. Las frases del chat salen de una en una, y los bocadillos, los carteles del día y los rótulos se quedan más rato.',
      '<b>MAPA NUEVO, ARRIBA DEL TODO</b>: los 10 días del capítulo con su dibujito (combate, tienda, cofre, jefe…) y el conejo encima del día de hoy.',
      '<b>EL CHAT, EN TODOS LOS MÓVILES</b>: sale siempre, y una frase larga ya no se corta: se lee en dos partes.',
      '<b>SIEMPRE LA ÚLTIMA VERSIÓN</b>: el móvil ya no se queda con la versión vieja guardada.'],
    joke: ['Microblizz quería cobrar por cada letra que se leía entera. Hemos dicho que no.'] },
  { v: '0.5.4', real: ['<b>EL CHAT, EN SU SITIO</b>: va en su propia franja de la barra de arriba, nunca encima del juego ni del cartel del día, también en los móviles más bajitos. En pantallas muy pequeñas se esconde para dejar sitio.', '<b>CONSEJOS DE LOLA</b>: ahora salen abajo, en dorado, con lo que va pasando.'],
    joke: ['Microblizz ha puesto el chat en una franja. Dice que es su «zona de bajos salarios».'] },
  { v: '0.5.3', real: ['<b>ESCENA LIMPIA</b>: EN DIRECTO, los botones, el mapa del camino y el chat van en su propia barra, debajo de la vida. El pixel art se ve entero.', '<b>CHAT MÁS PEQUEÑO</b>: solo las 2 últimas frases, con letra pequeña.'],
    joke: ['Microblizz quería poner anuncios en la barra nueva. No le hemos dejado.'] },
  { v: '0.5.2', real: ['<b>ICONO NUEVO</b>: CrazyBunny de frente, con su ojo en espiral y la corona, y encima las letras FoR bien gordas y en 3D.'], joke: [] },
  { v: '0.5.1', real: ['<b>ICONO PROPIO</b>: al instalarlo en el móvil, el juego tiene su icono en pixel art: la cara de CrazyBunny con su corona y las letras FoR.'],
    joke: ['Microblizz ha pedido el icono para su tienda. Le hemos dicho que la corona es nuestra.'] },
  { v: '0.5.0', real: [
      '<b>INSTÁLALO EN EL MÓVIL</b>: en Opciones, «Instalar en el móvil». Se abre como una app y funciona sin internet.',
      '<b>CHAT EN SU SITIO</b>: los mensajes del directo salen ahora sobre la escena, debajo de la vida, como en los directos de verdad, y se van solos. Abajo solo queda lo que va pasando, y las elecciones ya no se llenan de frases.'],
    joke: ['Microblizz quería cobrar por instalarlo. Le hemos dicho que ya cobra por respirar.'] },
  { v: '0.4.0', real: [
      '<b>CAPÍTULOS</b>: cada mundo se divide en 4 capítulos de 10 días, cada uno con su nombre. Al acabar uno hay fiesta, monedas y un descanso, y puedes volver a La Madriguera con la partida guardada.',
      '<b>MAPA DEL CAMINO</b>: arriba ves los 40 días, los capítulos, dónde vas y lo que viene: tiendas, cofres, élites, el mini jefe y el jefe.',
      '<b>MÁS SORPRESAS</b>: raids en el directo que traen regalos, un comerciante misterioso (FallenHero vende su equipo épico) y bugs de Microblizz que rompen la pantalla y hacen cosas raras.'],
    joke: ['Microblizz dice que los bugs son «contenido sorpresa». Los va a cobrar como DLC.'] },
  { v: '0.3.0', real: [
      '<b>LA MADRIGUERA</b>: menú de inicio con Jugar, Continuar, Mejoras para siempre, Colección y Opciones.',
      '<b>3 MUNDOS DE 40 DÍAS</b>: Oficinas de Microblizz, Cementerio de juegos y Torre de Microblizz, con 15 enemigos, mini jefes y jefes. El paisaje va de la mañana a la noche del jefe.',
      '<b>TODO LO DE UN ROGUELITE</b>: 23 habilidades de 3 niveles, 15 objetos, la tienda de Lola, cofres, ruleta, gashapón, hoguera de la huelga, encuentros y el Pase Premium.',
      '<b>EN DIRECTO</b>: la partida se emite con su chat tipo Twitch, que comenta y da consejos. Lola es la moderadora.'],
    joke: ['Microblizz ha comprado el chat. Ahora cada mensaje cuesta 0,99 €.'] },
  { v: '0.2.0', real: ['<b>CRAZYBUNNY DE PERFIL</b>, girado un poquito, y más monedas y partículas.'], joke: [] },
  { v: '0.1.0', real: ['<b>PRIMER PROTOTIPO</b>: 6 días y un jefe para ver el estilo del pixel art.'], joke: [] },
];
