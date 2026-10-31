// Fans Of Pets · AJUSTES: el nombre del juego para core y TODAS las cifras del prototipo (huevo, bebé, necesidades, sueño, horario de vida,
// modos de ritmo, tope de ausencia y efecto de cada cuidado). Se carga antes de lo común. Calibrar Pets es tocar solo este archivo.
// Prototipo tras el modo dev (NUCLEO.desarrollo): llega hasta el bebé. Diseño: docs/pets/PLAN.md y docs/pets/diseno.md.
'use strict';
const AJUSTES = {
  // sin `id` a propósito: así la cuenta de core queda apagada y la partida del prototipo vive solo en este navegador.
  // Cuando el progreso vaya al servidor (lo dice el plan), aquí irá id: 'pets'.
  id: '',
  nombre: 'Fans Of Pets',
  guardado: 'for-pets-v1',      // la clave de la partida en este navegador
  sinFeedback: true,            // la pestaña de feedback de core necesita cuenta: en el prototipo no sale
};
const PETS = {
  // los mata-sanadores de cada facción (docs/pets/evoluciones.md, tabla «Criaturas por facción»): la clave de su carta en core/js/serie/facciones/
  mataSanadores: { animales: 'huron', nomuertos: 'sombra', streamers: 'hater', heroes: 'arpia', ciber: 'dron', memes: 'clickbait', gamer: 'campero', olvidados: 'espia', pop: 'paparazzi' },
  huevos: 3,                    // los huevos misteriosos que salen tras la entrevista (de facciones distintas, para que se distingan por el color)
  huevoHoras: 2,                // lo que tarda en eclosionar, en todos los modos
  // los modos de ritmo: cuánto dura el bebé (horas que tiene que pasar bien cuidado) y cuánto más deprisa bajan las necesidades
  ritmos: {
    rapido: { bebeHoras: 6, gasto: 1.5 },
    medio: { bebeHoras: 24, gasto: 1 },
    largo: { bebeHoras: 48, gasto: 0.8 },
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
  gastoDormida: { hambre: 1.5, sed: 2, sueno: -14, limpieza: 1, diversion: 0 },
  // si se acuesta con hambre, sed o sucia (por debajo de esto), duerme mal: recupera menos sueño y se levanta con más hambre
  nocheMala: { umbral: 35, sueno: 0.5, hambre: 2 },
  siestaHasta: 95,              // de día, si la mandas a dormir, se despierta sola al llegar a este sueño
  noche: { rato: 30, suenoMax: 35 },   // despertada de noche: minutos que aguanta despierta y el sueño con el que se levanta (como mucho)
  // el bebé solo crece mientras ninguna necesidad visible está por debajo de esto (descuidada, deja de crecer; dormir sí cuenta)
  crecerMinimo: 15,
  triste: 25,                   // por debajo, pone cara triste
  llena: 95,                    // por encima, no quiere más de eso
  // lo que hace cada cuidado
  cuidados: { comer: { hambre: 35 }, beber: { sed: 40 }, banar: { limpieza: 70 } },
  // qué necesidades se ven en cada etapa (el diseño estrena la diversión en el niño)
  visibles: { bebe: ['hambre', 'sed', 'sueno', 'limpieza'] },
  // el dibujo kawaii (arte.js): cuántos segundos se ve la pose de un cuidado y de qué tamaño son los píxeles de la mampara de la ducha
  poseSegundos: 2.4,
  // la mampara, en fracciones del dibujo de la ducha (de debajo de la alcachofa a los pies, sin tapar el patito) y el tamaño de sus píxeles
  // delante: el trozo del dibujo que va por delante del cristal, sin pixelar (el patito)
  mampara: { x: 0.17, y: 0.2, w: 0.62, h: 0.73, pixel: 7, delante: { x: 0.69, y: 0.74, w: 0.19, h: 0.18 } },
  // los dibujos van todos con el mismo encuadre (640 px, la criatura del mismo tamaño en cada pose): cuánto mide el lienzo respecto al radio
  // del bebé y a qué altura del lienzo están los pies, para apoyarlo en el suelo
  arte: { lienzo: 3.54, pies: 0.875 },
};
