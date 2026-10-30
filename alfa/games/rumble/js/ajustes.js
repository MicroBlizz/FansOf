// Fans of Rumble · AJUSTES: lo que este juego le dice a los sistemas comunes de core/ antes de que se carguen.
// Lo que hace cada habilidad y cada objeto está en js/02a-objetos.js, junto al resto de sus datos.
'use strict';
const AJUSTES = {
  id: 'rumble',
  nombre: 'Fans of Rumble',
  // lo máximo que el servidor deja ganar por motivo (suma a los de core/js/sistema/economia.js); ver PLAN-CUENTAS.md, 15.13
  topes: {
    partida: { vez: { gold: 5000, gems: 100 }, dia: { gold: 300000, gems: 1000 }, calcula: ['camp', 'otro'] },   // en campaña el servidor calcula el premio (primer pase, estrellas, repetir…); en las demás partidas cuenta la xp del pase
    idle: { vez: { gold: 200000, gems: 5000 }, dia: { gold: 1000000, gems: 20000 }, calcula: 'horas-anuncio' },
    anuncio: { vez: { gold: 5000, gems: 50, tickets: 2 }, dia: { gold: 30000, gems: 300, tickets: 30 }, calcula: ['anuncio', 'turbo'] },
    arena: { vez: { tickets: 10 }, dia: { tickets: 40 } },
    bienvenida: { vez: { gold: 20000, gems: 2000 }, unica: true, fijo: 'starter' },
    tutorial: { vez: { tickets: 5 }, unica: true, fijo: { tickets: 3 } },
    'carta-repetida': { vez: { gold: 500 }, dia: { gold: 20000 } },
  },
  servidor: { gachapon: true, economia: true },
  // las dos monedas (PLAN-MONEDAS.md, core/js/sistema/monedas.js): oro = la ganada (paga el gashapón), gemas = la comprada (pase, cosméticos y ventajas; con dinero real o cambiando mucho oro; nunca al revés).
  // 1 gema «vale» 10 de oro (los packs de antes valían 100 gemas o 1000 de oro por 0,99 €): la tirada pasa de 50 gemas a 500 de oro. La fila `monedas` de flags lo ajusta sin publicar.
  monedas: { ratio: 15, cambio: 40, pasePct: { pase: 29, pasepvp: 100 } },   // la tirada cuesta 750 de oro; cambiar oro por gemas, 40 de oro por gema; pasePct: qué % de lo convertido (oro y tiradas de la pista de pago) se da en gemas, para que la pista devuelva justo el precio del pase (487 de 500; el PvP da 264 de 300 al 100 %). La fila `monedas` de flags lo afina sin publicar   // lo que ya hace el servidor cuando hay cuenta (PLAN-CUENTAS.md, fase 2): el gashapón de habilidades y equipo
  guardado: 'for-save-1',   // la partida guardada de este juego: cada juego tiene la suya, con su oro, sus gemas y su inventario
  // economía propia (la común está en core/js/sistema/progreso.js: niveles, gashapón, despidos…)
  econ: {
    quick: { easy: 40, normal: 60, ceo: 250, lose: 10 },           // oro en partida rápida (octubre de 2026: ganar al CEO da 250 de oro y ya no da gemas)
    dupGems: 0, dupGold: 100,                                        // gashapón de cartas: una repetida sin estrellas que subir da 100 de oro (antes 15 gemas)
    logrosGemas: 1 / 3,                                              // octubre de 2026: los logros dan un tercio de las gemas de antes (eran la fuente más grande con diferencia)
    mission: [50, 0],
    // octubre de 2026: menos legendarias en habilidades y objetos (antes salía 1 de cada 23 tiradas contando las garantías; ahora ~1 de cada 51)
    odds: { basic: 30, common: 25, rare: 31.5, epic: 12, legendary: 1.5 }, pityLegObj: 90, legSegura: false,
    cardOdds: { rare: 68, epic: 25, legendary: 7 },                  // v0.9.15: gashapón de cartas (hechizos y mata-sanadores)
    starStep: 0.05, maxStars: 5,                                     // cada estrella: +5 % (vida y daño, o fuerza del hechizo)
  },
};
