// Fans Of Pets · AJUSTES: el nombre del juego para core y TODAS las cifras del prototipo (huevo, bebé, necesidades, sueño, horario de vida,
// modos de ritmo, tope de ausencia y efecto de cada cuidado). Se carga antes de lo común. Calibrar Pets es tocar solo este archivo.
// Prototipo tras el modo dev (NUCLEO.desarrollo): de la entrevista al ascenso a jefe. Diseño: docs/pets/PLAN.md y docs/pets/diseno.md.
'use strict';
const AJUSTES = {
  // sin `id` a propósito: así la cuenta de core queda apagada y la partida del prototipo vive solo en este navegador.
  // Cuando el progreso vaya al servidor (lo dice el plan), aquí irá id: 'pets'.
  id: '',
  nombre: 'Fans Of Pets',
  guardado: 'for-pets-v1',      // la clave de la partida en este navegador
  sinFeedback: true,            // la pestaña de feedback de core necesita cuenta: en el prototipo no sale
  // las dos monedas de la serie (core/js/sistema/monedas.js, docs/core/MONEDAS.md) con los nombres de Pets: Tickets restaurante = la ganada
  // (logros, la nómina del día), Bonus = la comprada (euros, o cambiando Tickets; nunca al revés). Los saldos viven en la cartera del
  // dominio (PT.Cartera) y core los lee y escribe por los casos de uso. El ratio se calibra con lo que da un día (docs/pets/diseno.md)
  monedas: {
    ganada: { id: 'tickets', nombre: 'Tickets restaurante', nombre_en: 'Meal tickets', icono: () => '' },
    comprada: { id: 'bonus', nombre: 'Bonus', nombre_en: 'Bonus', icono: () => '' },
    ratio: 25, cambio: 25,
    leer: cual => (typeof PT !== 'undefined' && PT.casos ? PT.casos.cartera.saldo(cual) : 0),
    escribir: (cual, n) => { if (typeof PT !== 'undefined' && PT.casos) PT.casos.fijaSaldo(cual, n); },
  },
};
const PETS = {
  // los mata-sanadores de cada facción (docs/pets/evoluciones.md, tabla «Criaturas por facción»): la clave de su carta en core/js/serie/facciones/
  mataSanadores: { animales: 'huron', nomuertos: 'sombra', streamers: 'hater', heroes: 'arpia', ciber: 'dron', memes: 'clickbait', gamer: 'campero', olvidados: 'espia', pop: 'paparazzi' },
  huevos: 3,                    // los huevos misteriosos que salen tras la entrevista (de facciones distintas, para que se distingan por el color)
  huevoHoras: 2,                // lo que tarda en eclosionar, en todos los modos
  // las etapas de la criatura, en orden; después del adulto viene el ascenso a jefe
  etapas: ['bebe', 'nino', 'adolescente', 'adulto'],
  // los modos de ritmo: cuántas horas bien cuidada dura cada etapa (el calendario de docs/pets/diseno.md) y cuánto más deprisa bajan las necesidades
  ritmos: {
    rapido: { horas: { bebe: 6, nino: 12, adolescente: 18, adulto: 36 }, gasto: 1.5 },
    medio: { horas: { bebe: 24, nino: 36, adolescente: 36, adulto: 72 }, gasto: 1 },
    largo: { horas: { bebe: 48, nino: 72, adolescente: 72, adulto: 144 }, gasto: 0.8 },
  },
  ritmoPorDefecto: 'medio',
  // horario de vida, en minutos desde las 0:00; el jugador lo cambia (de media en media hora)
  horario: { despierta: 9 * 60, acuesta: 22 * 60, minDespierta: 8 * 60, minDuerme: 6 * 60, paso: 30 },
  // el paso del tiempo: se calcula al abrir, minuto a minuto, con un tope para no castigar las ausencias largas
  tiempo: { paso: 1, topeHoras: 10, cadaSegundos: 5 },
  // las necesidades van de 0 (fatal) a 100 (perfecta). Al nacer empiezan así:
  nacer: { hambre: 70, sed: 70, sueno: 80, limpieza: 90, diversion: 80 },
  // cuánto baja cada una por hora, despierta y dormida (dormida, el sueño se recupera: número positivo). La diversión no baja en el bebé: se estrena en el niño
  gastoDespierta: { hambre: 6, sed: 7, sueno: 5, limpieza: 4, diversion: 0 },
  gastoDormida: { hambre: 0.75, sed: 1, sueno: -14, limpieza: 0.5, diversion: 0 },
  sueloDormida: 20,             // dormida, ninguna necesidad baja de aquí: la noche no la deja en rojo (Arkioner, 1-11-2026)
  // si se acuesta con hambre, sed o sucia (por debajo de esto), duerme mal: recupera menos sueño y se levanta con más hambre
  nocheMala: { umbral: 35, sueno: 0.5, hambre: 2 },
  siestaHasta: 95,              // de día, si la mandas a dormir, se despierta sola al llegar a este sueño
  noche: { rato: 30, suenoMax: 35 },   // despertada de noche: minutos que aguanta despierta y el sueño con el que se levanta (como mucho)
  // el bebé solo crece mientras ninguna necesidad visible está por debajo de esto (descuidada, deja de crecer; dormir sí cuenta)
  crecerMinimo: 15,
  triste: 25,                   // por debajo, pone cara triste
  llena: 95,                    // por encima, no quiere más de eso
  // lo que hace cada cuidado (la primera clave es la necesidad que mira para decir «no quiere más»)
  cuidados: {
    comer: { hambre: 35 }, beber: { sed: 40 }, banar: { limpieza: 70 },
    dientes: { limpieza: 15 }, cara: { limpieza: 15 }, bano: { limpieza: 10 },   // el aseo, desde el niño
    chuche: { diversion: 15, hambre: 10 },                                         // las chucherías, desde el niño
    jugar: { diversion: 40 },                                                      // un minijuego
  },
  // qué necesidades se ven en cada etapa (el diseño estrena la diversión en el niño) y qué cuidados hay en cada una
  visibles: {
    bebe: ['hambre', 'sed', 'sueno', 'limpieza'],
    nino: ['hambre', 'sed', 'sueno', 'limpieza', 'diversion'],
    adolescente: ['hambre', 'sed', 'sueno', 'limpieza', 'diversion'],
    adulto: ['hambre', 'sed', 'sueno', 'limpieza', 'diversion'],
  },
  desbloquea: {
    bebe: ['comer', 'beber', 'banar', 'jugar'],
    nino: ['comer', 'beber', 'banar', 'dientes', 'cara', 'bano', 'chuche', 'jugar'],
    adolescente: ['comer', 'beber', 'banar', 'dientes', 'cara', 'bano', 'chuche', 'jugar'],
    adulto: ['comer', 'beber', 'banar', 'dientes', 'cara', 'bano', 'chuche', 'jugar'],
  },
  // los minijuegos de cada etapa (docs/pets/minijuegos.md): se abren tal cual (sus demos) y de momento cuentan como jugados al abrirlos
  minijuegos: {
    bebe: [{ id: 'pop', nombre: 'Fans of Pop', ruta: '../../demos/pop/' }],
    nino: [{ id: 'merge', nombre: 'Fans of Merge', ruta: '../../demos/merge/' }, { id: 'swipe', nombre: 'Fans of Swipe', ruta: '../../demos/swipe/' }],
    adolescente: [{ id: 'snakes', nombre: 'Fans of Snakes', ruta: '../../demos/snakes/' }],
    adulto: [{ id: 'jump', nombre: 'Fans of Jump', ruta: '../jump/' }, { id: 'crush', nombre: 'Fans of Crush', ruta: '../crush/' }, { id: 'goose', nombre: 'Fans of Goose', ruta: '../../demos/goose/' }, { id: 'boom', nombre: 'Fans of Boom', ruta: '../boom/' }],
  },
  jugadasDia: 6,                // minijuegos que cuentan al día
  // las chucherías: cuántas al día sin empacho; con empacho (horas) no quiere comida de verdad y duerme peor
  chuches: { topeDia: 3, empachoHoras: 3, suenoEmpacho: 0.5 },
  // el día de la criatura se cierra al acostarse. Un día es bueno si ha estado descuidada (una necesidad visible por debajo de crecerMinimo)
  // menos de esta parte de sus minutos despierta; está «al mínimo» si alguna visible está a 0
  dia: { buenoHasta: 0.2, alMinimoDesde: 0.8 },
  // el ascenso: al acabar el adulto con al menos esta parte de días buenos; la rama según el estilo (docs/pets/evoluciones.md)
  ascenso: { diasBuenos: 0.7, gamberroHasta: 0.85, siestasDesde: 0.7, ramas: ['operaciones', 'creativo', 'personas', 'gamberro', 'siesta'] },
  // la dimisión (docs/pets/diseno.md): días seguidos al mínimo hasta la carta, días de preaviso y contraofertas por etapa
  dimision: { diasSeguidos: 3, preavisoDias: 2, contraofertas: 2, repone: 40 },
  // la nómina del día (docs/pets/diseno.md, «La nómina del día»), en Tickets restaurante: de un día al mínimo a uno perfecto. Se calibra en la alfa
  nomina: { minimo: 10, maximo: 50 },
  // los premios de los logros por tipo (docs/pets/logros.md, «Premios»), en Tickets; los grandes dan además algo de Bonus
  premios: { empezar: 50, cuidado: 100, rama: 100, modo: 200, criatura: 150, faccion: 500, especial: 300, grande: 1000, bonusGrande: 5 },
  // el tamaño en pantalla de cada etapa (radio del dibujo) y del jefe
  tamano: { bebe: 115, nino: 125, adolescente: 135, adulto: 145, jefe: 150 },
  // el dibujo kawaii (arte.js): cuántos segundos se ve la pose de un cuidado y de qué tamaño son los píxeles de la mampara de la ducha
  poseSegundos: 2.4,
  // la mampara, en fracciones del dibujo de la ducha (de debajo de la alcachofa a los pies, sin tapar el patito) y el tamaño de sus píxeles
  // delante: el trozo del dibujo que va por delante del cristal, sin pixelar (el patito)
  mampara: { x: 0.17, y: 0.2, w: 0.62, h: 0.73, pixel: 7, delante: { x: 0.69, y: 0.74, w: 0.19, h: 0.18 } },   // sobre las plantillas, el cristal sale de las anclas (arte.js)
  // los dibujos van todos con el mismo encuadre (640 px, la criatura del mismo tamaño en cada pose): cuánto mide el lienzo respecto al radio
  // del bebé y a qué altura del lienzo están los pies, para apoyarlo en el suelo
  arte: { lienzo: 3.54, pies: 0.875 },
  // la cara viva (animacion.js): cada cuánto parpadea y cuánto dura (segundos, un rango al azar), cada cuánto bosteza cuando tiene sueño,
  // y por debajo de qué hambre o diversión pide con ojos de cachorrito
  // y cuánto dura, a qué ritmo mastica al comer y con cuánto sueño (0-100) empieza a bostezar
  animacion: { parpadeoCada: [2.5, 5.5], parpadeoDura: 0.13, bostezoCada: [6, 12], bostezoDura: 1.3, mascaCada: 0.22, bostezaConSueno: 35, pideDesde: 30 },
};
