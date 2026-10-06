// Fans of Rumble · AJUSTES: lo que este juego le dice a los sistemas comunes de core/ antes de que se carguen.
// Lo que hace cada habilidad y cada objeto está en js/02a-objetos.js, junto al resto de sus datos.
'use strict';
const AJUSTES = {
  id: 'rumble',
  nombre: 'Fans of Rumble',
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
