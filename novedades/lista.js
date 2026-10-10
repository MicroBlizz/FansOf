// Fans Of · NOVEDADES DE LA WEB: lo que enseña la ventana NOVEDADES de la librería (index.html de la raíz), que se abre
// cada vez que se carga la página y desde la pestaña Novedades del menú. Es una ventana corta, de un vistazo:
//   · JUEGOS NUEVOS: lo escribes aquí (`nuevos`): nombre, una sola frase, su carpeta y el id de su tarjeta en la librería.
//   · ACTUALIZACIONES: una línea por juego que sale sola del NEWS de cada juego (su versión y los títulos en negrita
//     de su último informe), así que se pone al día con cada despliegue. Las demos sin NEWS (como Terminal Shock)
//     se apuntan aquí, en `otros`, con una frase corta.
// Cuando publiques un juego o una demo nueva, o cambies una demo sin NEWS: pon arriba un boletín nuevo con `id` nuevo
// (la fecha basta). Solo se enseña el primero. Frases cortas: el detalle ya está en la tarjeta de cada juego.
// Cada frase nueva lleva su inglés en novedades/en.js.
'use strict';
const NOVEDADES_WEB = [
  {
    id: '2026-10-10',
    fecha: '10 de octubre de 2026',
    nuevos: [
      { nombre: 'FANS OF ROGUELITE', tarjeta: 'g-roguelite', enlace: 'demos/roguelite/', texto: 'Roguelite en pixel art, emitido en directo con su chat: 3 mundos de 40 días contra Microblizz.' },
      { nombre: 'FANS OF TACTICS ADVANCE', tarjeta: 'g-tactics-advance', enlace: 'demos/tactics-advance/', texto: 'Tácticas por casillas en pixel art de consola portátil, con tutorial de Lola.' },
      { nombre: 'FANS OF RUMBLE 3D', tarjeta: 'g-rumble-3d', enlace: 'demos/rumble-3d/', texto: 'El boceto en 3D: una misión corta contra SurvivalBot, con comentarista.' },
    ],
    otros: [
      { nombre: 'TERMINAL SHOCK', tarjeta: 'g-terminal-shock', texto: 'Demo más larga: 13 salas, Zoe y personajes estilo PS1.' },
    ],
  },
];
