// Fans of Roguelite · Novedades: el informe de cada versión, la más nueva primero. La página de entrada (index.html de la raíz)
// lo lee; el juego no lo carga. La versión que sale en la Biblioteca es la del primer informe.
'use strict';
const NEWS = [
  { v: '0.5.4', real: ['<b>FUERA EL CHAT</b>: ya no tapa nada. Arriba queda una barra fina con EN DIRECTO, los espectadores, los botones y el mapa del camino, y el pixel art se ve entero.', '<b>CONSEJOS DE LOLA</b>: ahora salen abajo, en dorado, con lo que va pasando.'],
    joke: ['Microblizz ha despedido al chat. Dice que era «personal no esencial».'] },
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
