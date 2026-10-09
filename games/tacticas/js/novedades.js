// Fans of Tácticas · Novedades: el informe de cada versión, la más nueva primero. La página de entrada (index.html de la raíz) lo lee.
// La versión que se publica se escribe en index.html (…?v=…); aquí, `v` dice a qué versión corresponde cada informe.
'use strict';
const NEWS = [
  { v: '0.1.3', real: ['<b>ESTADO FIJO, ESTILO FINAL FANTASY</b>: la vida, el turno y el CAOS de todos salen en una franja entre el campo de batalla y los botones (los enemigos arriba, tu grupo debajo), sin tapar a los personajes.', '<b>NOVEDADES ARREGLADAS</b>: ya se leen bien en el listado de juegos.'],
    joke: ['Microblizz ha colgado un marcador. Dice que lo de «tapar a los personajes» era arte moderno.'] },
  { v: '0.1.2', real: ['<b>MENÚ DEL TÍTULO</b>: ahora hay CAMPAÑA, NOVEDADES y OPCIONES desde la pantalla principal, y en Opciones sale la versión y un botón de novedades.'],
    joke: ['Microblizz ha descubierto que los juegos tienen menú. Ya ha pedido una carta de postres.'] },
  { v: '0.1.1', real: ['<b>VIDA, TURNO Y CAOS A LA VISTA</b>: en los combates, cada personaje (y cada enemigo) muestra bajo los pies su vida en número, su barra de turno y su CAOS, también con el menú abierto.',
      '<b>MÁS CAOS</b>: el ataque normal da 5 CAOS al héroe, y el Tajo épico del EpicChampion da 6 CAOS a todo el grupo.'],
    joke: ['Microblizz ha puesto números a todo. Dice que así los enemigos también saben cuánto les queda.'] },
];
