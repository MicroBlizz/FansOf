// Fans of Tácticas · Novedades: el informe de cada versión, la más nueva primero. La página de entrada (index.html de la raíz) lo lee.
// La versión que se publica se escribe en index.html (…?v=…); aquí, `v` dice a qué versión corresponde cada informe.
'use strict';
const NEWS = [
  { v: '0.1.13', real: ['<b>MENÚS NUEVOS</b>: el título es ahora el despacho del CEO al atardecer, vivo, con rayos de sol, polvo flotando y tu grupo esperando en el suelo, y el logo brilla con rayos de luz detrás. El mapa, el grupo y la tienda muestran de fondo la maqueta del mundo en el que estás, con ventanas de marco dorado como las del combate, un camino de combates que se ilumina y un candado dibujado en los combates cerrados.'],
    joke: ['Microblizz ha redecorado los menús. La factura del interiorista la pagan los fans.'] },
  { v: '0.1.12', real: ['<b>ATAQUES ESPECTACULARES</b>: cada golpe suelta rayos de luz y el mundo se congela un instante en los golpes fuertes. Las 18 técnicas tienen su propia animación, con una entrada en grande del héroe: CrazyBunny salta fuera de la pantalla y cae en medio de los enemigos, EpicChampion corta con una media luna dorada, el Vikingo parte el suelo de un hachazo, StreamKing hace llover monedas, NecroLord roba almas, LaDirectora grita ¡CORTEN! y mucho más.', '<b>JEFES CON PRESENCIA</b>: los ataques fuertes de los jefes oscurecen la sala y caen como columnas de luz roja.'],
    joke: ['Microblizz ha cobrado un suplemento por cada rayo de luz. Los héroes han pagado con efectos especiales.'] },
  { v: '0.1.11', real: ['<b>COMBATES EN ESTILO MAQUETA</b>: cada mundo es ahora un decorado de píxeles con luz de verdad: el atardecer en el despacho del CEO, los fluorescentes de las oficinas, la luna del cementerio y los focos del plató. Rayos de luz, polvo flotando, brillos en los golpes y números más grandes. Los personajes son los de siempre, con sombra, reflejo en el suelo y contraluz.', '<b>INTERFAZ NUEVA</b>: arriba, la línea de TURNOS dice quién actúa ahora y quién después; abajo a la izquierda, las órdenes (al alcance del pulgar), y a la derecha, tu grupo con su vida, CAOS y barra de tiempo. Las técnicas, los objetos y los objetivos se abren encima del grupo.'],
    joke: ['Microblizz ha subastado el decorado del despacho como NFT. Lo ha comprado el propio CEO.'] },
  { v: '0.1.10', real: ['<b>MEJORAS POR DENTRO</b>: cambios en los sistemas comunes de la serie. No notarás nada… y eso es buena señal.'], joke: [] },
  { v: '0.1.9', real: ['<b>MEJORAS POR DENTRO</b>: cambios en los sistemas comunes de la serie. No notarás nada… y eso es buena señal.'], joke: [] },
  { v: '0.1.8', real: ['<b>MEJORAS POR DENTRO</b>: cambios en los sistemas comunes de la serie. No notarás nada… y eso es buena señal.'], joke: [] },
  { v: '0.1.7', real: ['<b>MEJORAS POR DENTRO</b>: cambios en los sistemas comunes de la serie. No notarás nada… y eso es buena señal.'], joke: [] },
  { v: '0.1.6', real: ['<b>MEJORAS POR DENTRO</b>: cambios en los sistemas comunes de la serie. No notarás nada… y eso es buena señal.'], joke: [] },
  { v: '0.1.5', real: ['<b>MEJORAS POR DENTRO</b>: cambios en los sistemas comunes de la serie. No notarás nada… y eso es buena señal.'],
    joke: ['Microblizz ha descubierto que puede vender frases hechas. Ha mandado a todo el departamento de marketing a buscar más.'] },
  { v: '0.1.4', real: ['<b>MEJORAS POR DENTRO</b>: cambios en los sistemas comunes de la serie. No notarás nada… y eso es buena señal.'],
    joke: ['Microblizz ha instalado interruptores para encender y apagar cosas desde su despacho. Aún no sabe cuál apaga las luces.'] },
  { v: '0.1.3', real: ['<b>ESTADO FIJO, ESTILO FINAL FANTASY</b>: la vida, el turno y el CAOS de todos salen en una franja entre el campo de batalla y los botones (los enemigos arriba, tu grupo debajo), sin tapar a los personajes.', '<b>NOVEDADES ARREGLADAS</b>: ya se leen bien en el listado de juegos.'],
    joke: ['Microblizz ha colgado un marcador. Dice que lo de «tapar a los personajes» era arte moderno.'] },
  { v: '0.1.2', real: ['<b>MENÚ DEL TÍTULO</b>: ahora hay CAMPAÑA, NOVEDADES y OPCIONES desde la pantalla principal, y en Opciones sale la versión y un botón de novedades.'],
    joke: ['Microblizz ha descubierto que los juegos tienen menú. Ya ha pedido una carta de postres.'] },
  { v: '0.1.1', real: ['<b>VIDA, TURNO Y CAOS A LA VISTA</b>: en los combates, cada personaje (y cada enemigo) muestra bajo los pies su vida en número, su barra de turno y su CAOS, también con el menú abierto.',
      '<b>MÁS CAOS</b>: el ataque normal da 5 CAOS al héroe, y el Tajo épico del EpicChampion da 6 CAOS a todo el grupo.'],
    joke: ['Microblizz ha puesto números a todo. Dice que así los enemigos también saben cuánto les queda.'] },
];
