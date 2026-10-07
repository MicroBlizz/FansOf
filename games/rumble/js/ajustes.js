// Fans of Rumble · AJUSTES: lo que este juego le dice a los sistemas comunes de core/ antes de que se carguen.
// Lo que hace cada habilidad y cada objeto está en js/02a-objetos.js, junto al resto de sus datos.
'use strict';
const AJUSTES = {
  id: 'rumble',
  nombre: 'Fans of Rumble',
  // lo máximo que el servidor deja ganar por motivo (suma a los de core/js/sistema/economia.js); ver PLAN-CUENTAS.md, 15.13
  topes: {
    partida: { vez: { gold: 5000, gems: 200 }, dia: { gold: 300000, gems: 5000 }, calcula: 'camp' },   // en campaña el servidor calcula el premio (primer pase, estrellas, repetir…)
    idle: { vez: { gold: 200000, gems: 5000 }, dia: { gold: 1000000, gems: 20000 } },
    anuncio: { vez: { gold: 5000, gems: 200, tickets: 2 }, dia: { gold: 30000, gems: 1000, tickets: 30 } },
    arena: { vez: { tickets: 10 }, dia: { tickets: 40 } },
    bienvenida: { vez: { gold: 20000, gems: 2000 }, unica: true, fijo: 'starter' },
    tutorial: { vez: { tickets: 5 }, unica: true, fijo: { tickets: 3 } },
    'carta-repetida': { vez: { gems: 50 }, dia: { gems: 2000 } },
  },
  servidor: { gachapon: true, economia: true },   // lo que ya hace el servidor cuando hay cuenta (PLAN-CUENTAS.md, fase 2): el gashapón de habilidades y equipo
  guardado: 'for-save-1',   // la partida guardada de este juego: cada juego tiene la suya, con su oro, sus gemas y su inventario
  // economía propia (la común está en core/js/sistema/progreso.js: niveles, gashapón, despidos…)
  econ: {
    quick: { easy: 40, normal: 60, lose: 10 },                                     // oro en partida rápida
    dupGems: 15,                                                     // gashapón de cartas: una repetida sin estrellas que subir da gemas
    mission: [50, 10],
    cardOdds: { rare: 68, epic: 25, legendary: 7 },                  // v0.9.15: gashapón de cartas (hechizos y mata-sanadores)
    starStep: 0.05, maxStars: 5,                                     // cada estrella: +5 % (vida y daño, o fuerza del hechizo)
  },
};
