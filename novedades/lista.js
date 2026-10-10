// Fans Of · NOVEDADES DE LA WEB: el boletín de la librería. Sale en la ventana NOVEDADES, que se abre cada vez que se carga
// la página de la raíz y desde la pestaña Novedades del menú.
// La ventana tiene dos partes:
//   · LO ÚLTIMO: este boletín, escrito a mano. Aquí van los juegos y demos nuevos y lo que no tiene informe propio (las demos sin NEWS).
//   · PARCHES DE CADA JUEGO: sale sola de los js/novedades.js (NEWS) de cada juego, así que se pone al día con cada despliegue.
//
// Cómo añadir un boletín (al desplegar algo que el jugador note): copia el primero, ponlo ARRIBA del todo con un `id` nuevo
// (la fecha basta) y escribe lo publicado desde el boletín anterior.
//   · juegos:   un bloque por juego: nombre, versión (de… a…), el id de su tarjeta en la librería y la lista de lo nuevo.
//   · joke:     las «notas» de Microblizz, como en los juegos.
// La ventana enseña el primero entero y los dos anteriores debajo. Cada frase nueva lleva su inglés en novedades/en.js.
// No reescribas los boletines pasados.
'use strict';
const NOVEDADES_WEB = [
  {
    id: '2026-10-10',
    fecha: '10 de octubre de 2026',
    titulo: 'Lo publicado en las últimas 24 horas',
    juegos: [
      { nombre: 'FANS OF RUMBLE', ver: '0.9.105 → 0.9.115', tarjeta: 'g-rumble', real: [
        '<b>12 HABILIDADES LOCAS</b> en el gashapón, cada una con su animación en batalla: la Llamada del CEO, el Modo Dios, el Bullet Time, el Pay to Win…',
        '<b>MINIATURAS NUEVAS</b>: cada habilidad y cada objeto tiene su propio dibujo, y las Épicas y Legendarias brillan.',
        '<b>RIVALES CON CABEZA</b>: la máquina juega con tácticas según la dificultad, también en la partida rápida y en el entrenamiento.',
        '<b>LA ARENA, TODA JUNTA</b>: una sola puerta con dos pestañas, CONTRA JUGADORES (copas y ligas) y ENTRENAMIENTO (contra la CPU).',
        '<b>MÍTICA SEMANAL</b>: las estrellas vuelven a 0 cada lunes, cada semana se cobra oro y gemas y los 10 primeros se llevan un título.',
        '<b>FRASES Y EMOTICONOS</b> durante la partida, sin escribir. Se ganan en los dos pases y se eligen en el Armario.',
        '<b>13 LOGROS NUEVOS</b>, tu puesto en la clasificación en el menú y, en el PvP, tu rival ve tu avatar, tu marco y tu título.',
        '<b>CARTAS A LA ESPERA</b>: si te falta CAOS, la carta se queda reservada y sale sola en cuanto llega.'] },
      { nombre: 'FANS OF SURVIVORS', ver: '0.1.16 → 0.1.29', tarjeta: 'g-survivors', real: [
        '<b>8 FACCIONES NUEVAS</b> jugables, con 8 armas cada una. Se abren aguantando minutos en total.',
        '<b>CADA LÍDER CON SU ARMA</b>: espadazos en abanico, manos que salen del suelo, una torreta, un hacha bumerán…',
        '<b>COFRES DE ESPECTÁCULO</b>: de 1 a 3 mejoras, 777 de tragaperras, suspense, sustos y, con mucha suerte, 5 mejoras de golpe.',
        '<b>MINI JEFES Y BICHOS SHINY</b>: un mini jefe cada 2 minutos y bichos brillantes que sueltan cofre.',
        '<b>CAJAS ROMPIBLES</b> en el mapa, que dan oro y, rara vez, un objeto.'] },
      { nombre: 'FANS OF RUMBLE: TÁCTICAS', ver: '0.1.1 → 0.1.13', tarjeta: 'g-tacticas', real: [
        '<b>COMBATES EN ESTILO MAQUETA</b>: 4 mundos en píxeles con luz de verdad e interfaz nueva con línea de turnos.',
        '<b>ATAQUES ESPECTACULARES</b>: las 18 técnicas y los ataques de los jefes tienen su propia animación.',
        '<b>MENÚS NUEVOS</b>: el título es el despacho del CEO al atardecer, y el mapa, el grupo y la tienda llevan ventanas de marco dorado.',
        '<b>MENÚ DEL TÍTULO</b> con campaña, novedades y opciones, y el CAOS de cada personaje siempre a la vista.'] },
      { nombre: 'FANS OF TD Y FANS OF SKATE', ver: 'TD 0.13.46 · Skate 0.1.7', tarjeta: 'g-td', real: [
        '<b>MINIATURAS NUEVAS</b> de habilidades y objetos en el TD, más textos traducidos al inglés y mejoras por dentro en los dos.'] },
      { nombre: 'PROTOTIPOS NUEVOS EN LA BIBLIOTECA', ver: '', tarjeta: 'g-roguelite', real: [
        '<b>FANS OF ROGUELITE</b> (hasta la 0.4): La Madriguera, 3 mundos de 40 días divididos en capítulos, mapa del camino, raids, un comerciante misterioso y el chat del directo.',
        '<b>FANS OF RUMBLE 3D</b>: el boceto en 3D con su primera misión, comentarista, MeerCat, MechaVaca y la música del juego.',
        '<b>FANS OF TACTICS ADVANCE</b>: tácticas por casillas en pixel art de consola portátil. Ya es jugable (2 contra 4), con presentación, pantalla de título y tutorial con Lola.'] },
      { nombre: 'TERMINAL SHOCK (DEMO)', ver: '', tarjeta: 'g-terminal-shock', real: [
        '<b>DEMO LARGA</b>: 13 salas, Zoe y un final con el Núcleo Albright.',
        '<b>PERSONAJES ESTILO PS1</b>: el protagonista con su uniforme de enfermero, animación natural y ambiente más oscuro.',
        '<b>PUERTAS DETALLADAS</b>, cámaras que ya no pierden al personaje y música ambiental.'] },
    ],
    joke: ['Microblizz ha leído este boletín entero. Pide que el próximo sea más corto y que cueste 4,99 €.'],
  },
];
