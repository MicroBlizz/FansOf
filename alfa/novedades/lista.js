// Fans Of · NOVEDADES DE LA WEB: lo que enseña la ventana NOVEDADES de la librería (index.html de la raíz), que se abre
// cada vez que se carga la página y desde la pestaña Novedades del menú. Es una ventana corta, de un vistazo:
//   · JUEGOS NUEVOS: lo escribes aquí (`nuevos`): nombre, una sola frase, su carpeta y el id de su tarjeta en la librería.
//   · ACTUALIZACIONES: una línea por juego que sale sola del NEWS de cada juego (su versión y los títulos en negrita
//     de su último informe), así que se pone al día con cada despliegue. Cada juego y cada demo de la librería tiene su
//     js/novedades.js (NEWS); una demo nueva sin él se puede apuntar aquí, en `otros`, con una frase corta.
// Cuando publiques un juego o una demo nueva, o cambies una demo sin NEWS: pon arriba un boletín nuevo con `id` nuevo
// (la fecha basta). Solo se enseña el primero. Frases cortas: el detalle ya está en la tarjeta de cada juego.
// Cada frase nueva lleva su inglés en novedades/en.js.
'use strict';
const NOVEDADES_WEB = [
  {
    id: '2026-10-21b',
    fecha: '21 de octubre de 2026',
    nuevos: [
      { nombre: 'FANS OF SNAKES', tarjeta: 'g-snakes', enlace: 'demos/snakes/', texto: 'Demo nueva: la serpiente de siempre con Frenesí. Roza tu cola para cargarlo y córtatela por monedas; los «?» son locuras.' },
    ],
    otros: [],
  },
  {
    id: '2026-10-21a',
    fecha: '21 de octubre de 2026',
    nuevos: [
      { nombre: 'FANS OF AUTO', tarjeta: 'g-auto', enlace: 'demos/auto/', texto: 'Demo nueva: el barrio visto desde arriba como en la primera PlayStation. Roba coches, huye de los Moderadores y haz los recados de las tres bandas.' },
    ],
    otros: [],
  },
  {
    id: '2026-10-20c',
    fecha: '20 de octubre de 2026',
    nuevos: [
      { nombre: 'FANS OF BEAMS', tarjeta: 'g-beams', enlace: 'demos/beams/', texto: 'Demo nueva: el matamarcianos espacial de la serie. Captura naves de Microblizz y conviértelas en tu escolta, tu escudo o tu super rayo.' },
    ],
    otros: [],
  },
  {
    id: '2026-10-20b',
    fecha: '20 de octubre de 2026',
    nuevos: [
      { nombre: 'FANS OF KARTS', tarjeta: 'g-karts', enlace: 'games/karts/', texto: 'Ya es un juego: 16 pistas, modo copa, PvP de hasta 8 y salas con amigos.' },
      { nombre: 'FANS OF JUMP', tarjeta: 'g-jump', enlace: 'games/jump/', texto: 'El prólogo de los Animales Locos: salta con CrazyBunny de tronco en tronco y rescata a su pandilla de la ola de barro de Microblizz.' },
    ],
    otros: [],
  },
  {
    id: '2026-10-18a',
    fecha: '18 de octubre de 2026',
    nuevos: [
      { nombre: 'FANS OF DECKS', tarjeta: 'g-decks', enlace: 'games/decks/', texto: 'El constructor de mazos de la serie, en fase alfa: sobrevive a la semana en Microblizz a golpe de carta. Cuéntanos qué te parece.' },
    ],
    otros: [],
  },
  {
    id: '2026-10-15a',
    fecha: '15 de octubre de 2026',
    nuevos: [
      { nombre: 'FANS OF NOVA', tarjeta: 'g-nova', enlace: 'games/nova/', texto: 'El juego espacial de la serie: una nave que crece comiendo chatarra, cartas y armas que se fusionan.' },
    ],
    otros: [],
  },
  {
    id: '2026-10-14c',
    fecha: '14 de octubre de 2026',
    nuevos: [
      { nombre: 'FANS OF RATKOV', tarjeta: 'g-ratkov', enlace: 'games/ratkov/', texto: 'Deja de ser prototipo y pasa a juego: mochila Tetris, sigilo con abrecartas y cada animal con lo suyo.' },
    ],
    otros: [],
  },
  {
    id: '2026-10-14b',
    fecha: '14 de octubre de 2026',
    nuevos: [
      { nombre: 'FANS OF RATKOV', tarjeta: 'g-ratkov', enlace: 'games/ratkov/', texto: 'Shooter de extracción en la ciudad nevada de Microblizz: entra, registra, monta anomalías y sal antes de la ventisca.' },
    ],
    otros: [],
  },
  {
    id: '2026-10-14a',
    fecha: '14 de octubre de 2026',
    nuevos: [
      { nombre: 'FANS OF DARK', tarjeta: 'g-dark', enlace: 'games/dark/', texto: "Rehecho como un shooter de los 90: primera persona, píxel gordo y una antorcha contra la oscuridad." },
    ],
    otros: [],
  },
  {
    id: '2026-10-13b',
    fecha: '13 de octubre de 2026',
    nuevos: [
      { nombre: 'FANS OF DUNGEONS', tarjeta: 'g-dungeons', enlace: 'demos/dungeons/', texto: 'Roguelike por turnos: sube la Torre de Microblizz con CrazyBunny, CyberMarine o NecroLord. Pixel art nuevo de 32 bits.' },
    ],
    otros: [],
  },
  {
    id: '2026-10-13a',
    fecha: '13 de octubre de 2026',
    nuevos: [
      { nombre: 'FANS OF ROUFLAGE', tarjeta: 'g-rouflage', enlace: 'games/rouflage/', texto: 'Ya es un juego: PvP en salas de 10, granadas y señuelos para esconderte mejor.' },
    ],
    otros: [],
  },
  {
    id: '2026-10-11f',
    fecha: '11 de octubre de 2026',
    nuevos: [
      { nombre: 'FANS OF RECRUIT', tarjeta: 'g-recruit', enlace: 'demos/recruit/', texto: 'Corre y dispara como en las recreativas: CrazyBunny, la MechaVaca y SurvivalBot en pixel art.' },
    ],
    otros: [],
  },
  {
    id: '2026-10-11e',
    fecha: '11 de octubre de 2026',
    nuevos: [
      { nombre: 'FANS OF ISLAND', tarjeta: 'g-island', enlace: 'games/island/', texto: 'Plataformas cooperativo con CrazyBunny y zanahorias de poder. Prototipo en preparación: aún no se juega.' },
    ],
    otros: [],
  },
  {
    id: '2026-10-11d',
    fecha: '11 de octubre de 2026',
    nuevos: [
      { nombre: 'FANS OF RECRUIT', tarjeta: 'g-recruit', enlace: 'demos/recruit/', texto: 'Corre y dispara como en las recreativas: CrazyBunny, la MechaVaca y SurvivalBot en pixel art.' },
      { nombre: 'FANS OF CRUSH', tarjeta: 'g-crush', enlace: 'games/crush/', texto: 'Tres en raya con los Animales Locos: sube la Escalera Corporativa de Microblizz y despide al jefe de RRHH.' },
      { nombre: 'FANS OF DARK', tarjeta: 'g-dark', enlace: 'games/dark/', texto: 'Mazmorras en 3D: baja con un Animal Loco, llena la mochila y sal por un portal antes de que la niebla te alcance.' },
      { nombre: 'FANS OF KARTS', tarjeta: 'g-karts', enlace: 'games/karts/', texto: 'Carreras de karts en pixel art de consola portátil: 3 pistas, 6 pilotos y objetos con mala idea.' },
      { nombre: 'FANS OF ROUFLAGE', tarjeta: 'g-rouflage', enlace: 'games/rouflage/', texto: 'El escondite con pintura: píntate como el suelo y que los becarios no te despidan.' },
      { nombre: 'FANS OF ROGUELITE', tarjeta: 'g-roguelite', enlace: 'demos/roguelite/', texto: 'Roguelite en pixel art, emitido en directo con su chat: 3 mundos de 40 días contra Microblizz.' },
      { nombre: 'FANS OF TACTICS ADVANCE', tarjeta: 'g-tactics-advance', enlace: 'demos/tactics-advance/', texto: 'Tácticas por casillas en pixel art de consola portátil, con tutorial de Lola.' },
      { nombre: 'FANS OF RUMBLE 3D', tarjeta: 'g-rumble-3d', enlace: 'demos/rumble-3d/', texto: 'El boceto en 3D: una misión corta contra SurvivalBot, con comentarista.' },
    ],
    otros: [
      { nombre: 'TERMINAL SHOCK', tarjeta: 'g-terminal-shock', texto: 'Demo más larga: 13 salas, Zoe y personajes estilo PS1.' },
    ],
  },
  {
    id: '2026-10-11c',
    fecha: '11 de octubre de 2026',
    nuevos: [
      { nombre: 'FANS OF CRUSH', tarjeta: 'g-crush', enlace: 'games/crush/', texto: 'Tres en raya con los Animales Locos: sube la Escalera Corporativa de Microblizz y despide al jefe de RRHH.' },
      { nombre: 'FANS OF DARK', tarjeta: 'g-dark', enlace: 'games/dark/', texto: 'Mazmorras en 3D: baja con un Animal Loco, llena la mochila y sal por un portal antes de que la niebla te alcance.' },
      { nombre: 'FANS OF KARTS', tarjeta: 'g-karts', enlace: 'games/karts/', texto: 'Carreras de karts en pixel art de consola portátil: 3 pistas, 6 pilotos y objetos con mala idea.' },
      { nombre: 'FANS OF ROUFLAGE', tarjeta: 'g-rouflage', enlace: 'games/rouflage/', texto: 'El escondite con pintura: píntate como el suelo y que los becarios no te despidan.' },
      { nombre: 'FANS OF ROGUELITE', tarjeta: 'g-roguelite', enlace: 'demos/roguelite/', texto: 'Roguelite en pixel art, emitido en directo con su chat: 3 mundos de 40 días contra Microblizz.' },
      { nombre: 'FANS OF TACTICS ADVANCE', tarjeta: 'g-tactics-advance', enlace: 'demos/tactics-advance/', texto: 'Tácticas por casillas en pixel art de consola portátil, con tutorial de Lola.' },
      { nombre: 'FANS OF RUMBLE 3D', tarjeta: 'g-rumble-3d', enlace: 'demos/rumble-3d/', texto: 'El boceto en 3D: una misión corta contra SurvivalBot, con comentarista.' },
    ],
    otros: [
      { nombre: 'TERMINAL SHOCK', tarjeta: 'g-terminal-shock', texto: 'Demo más larga: 13 salas, Zoe y personajes estilo PS1.' },
    ],
  },
  {
    id: '2026-10-11b',
    fecha: '11 de octubre de 2026',
    nuevos: [
      { nombre: 'FANS OF DARK', tarjeta: 'g-dark', enlace: 'games/dark/', texto: 'Mazmorras en 3D: baja con un Animal Loco, llena la mochila y sal por un portal antes de que la niebla te alcance.' },
      { nombre: 'FANS OF KARTS', tarjeta: 'g-karts', enlace: 'games/karts/', texto: 'Carreras de karts en pixel art de consola portátil: 3 pistas, 6 pilotos y objetos con mala idea.' },
      { nombre: 'FANS OF ROUFLAGE', tarjeta: 'g-rouflage', enlace: 'games/rouflage/', texto: 'El escondite con pintura: píntate como el suelo y que los becarios no te despidan.' },
      { nombre: 'FANS OF ROGUELITE', tarjeta: 'g-roguelite', enlace: 'demos/roguelite/', texto: 'Roguelite en pixel art, emitido en directo con su chat: 3 mundos de 40 días contra Microblizz.' },
      { nombre: 'FANS OF TACTICS ADVANCE', tarjeta: 'g-tactics-advance', enlace: 'demos/tactics-advance/', texto: 'Tácticas por casillas en pixel art de consola portátil, con tutorial de Lola.' },
      { nombre: 'FANS OF RUMBLE 3D', tarjeta: 'g-rumble-3d', enlace: 'demos/rumble-3d/', texto: 'El boceto en 3D: una misión corta contra SurvivalBot, con comentarista.' },
    ],
    otros: [
      { nombre: 'TERMINAL SHOCK', tarjeta: 'g-terminal-shock', texto: 'Demo más larga: 13 salas, Zoe y personajes estilo PS1.' },
    ],
  },
  {
    id: '2026-10-10-b',
    fecha: '10 de octubre de 2026',
    nuevos: [
      { nombre: 'FANS OF ROUFLAGE', tarjeta: 'g-rouflage', enlace: 'games/rouflage/', texto: 'El escondite con pintura: píntate como el suelo y que los becarios no te despidan.' },
      { nombre: 'FANS OF ROGUELITE', tarjeta: 'g-roguelite', enlace: 'demos/roguelite/', texto: 'Roguelite en pixel art, emitido en directo con su chat: 3 mundos de 40 días contra Microblizz.' },
      { nombre: 'FANS OF TACTICS ADVANCE', tarjeta: 'g-tactics-advance', enlace: 'demos/tactics-advance/', texto: 'Tácticas por casillas en pixel art de consola portátil, con tutorial de Lola.' },
      { nombre: 'FANS OF RUMBLE 3D', tarjeta: 'g-rumble-3d', enlace: 'demos/rumble-3d/', texto: 'El boceto en 3D: una misión corta contra SurvivalBot, con comentarista.' },
    ],
    otros: [
      { nombre: 'TERMINAL SHOCK', tarjeta: 'g-terminal-shock', texto: 'Demo más larga: 13 salas, Zoe y personajes estilo PS1.' },
    ],
  },
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
