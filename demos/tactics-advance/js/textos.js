// Fans of Tactics Advance (prototipo) · TEXTOS: en el código y en la página van en español, y aquí está su inglés.
// El idioma se elige como en los juegos: el de Opciones (`fansof-idioma`) o, si no hay, el del navegador. Para probar: ?idioma=en
'use strict';

const EN = {
  // en la pantalla de la consola
  'Norma:': 'Rule:', 'Prohibido curarse': 'No healing', 'Prohibido descansar': 'No breaks',
  'TURNO {n}': 'TURN {n}', 'Turno de {q}': "{q}'s turn",
  'ANIMALES LOCOS': 'CRAZY ANIMALS', 'NO-MUERTOS': 'UNDEAD', 'MICROBLIZZ': 'MICROBLIZZ',
  'Esqueleto en paro': 'Jobless Skeleton', 'Becario sin sueldo': 'Unpaid Intern',
  'Mover': 'Move', 'Actuar': 'Act', 'Esperar': 'Wait', 'Estado': 'Status',
  'Golpe': 'Attack', 'Salto caótico': 'Chaos Jump', '{n} CAOS': '{n} CHAOS',
  'VIDA': 'HP', 'CAOS': 'CHAOS', 'NV': 'LV',
  '¡Primero me despiden': 'First they fire me,', 'y ahora esto!': 'and now this?!',
  '¡Ni siquiera': "They don't even", 'me pagan!': 'pay me!',
  // la página
  'Biblioteca': 'Library',
  'Prototipo · un turno de muestra': 'Prototype · a sample turn',
  'Combate táctico por casillas en pixel art de consola portátil: CrazyBunny y EpicChampion contra los esqueletos en paro del Cementerio de juegos y los becarios de Microblizz.':
    'Tile-based tactics in handheld-console pixel art: CrazyBunny and EpicChampion against the jobless skeletons of the Game Graveyard and the Microblizz interns.',
  'Demo animada: CrazyBunny se mueve por un mapa en diagonal y hace un Salto caótico sobre un esqueleto':
    'Animated demo: CrazyBunny moves across a diagonal map and does a Chaos Jump on a skeleton',
  '240 × 160 píxeles, como la consola': '240 × 160 pixels, like the console', 'Un turno que se repite': 'One turn on a loop',
  'Escenario': 'Stage', 'Cementerio': 'Graveyard', 'Oficinas': 'Offices', 'Pausa': 'Pause', 'Seguir': 'Resume', 'Momento': 'Timeline',
  'Mapa con alturas': 'A map with heights',
  'Casillas en diagonal con escalones, agua y decorados. Cada uno se mueve por turnos, casilla a casilla.':
    'Diagonal tiles with steps, water and scenery. Everyone moves in turns, tile by tile.',
  'La norma del día': 'Rule of the day',
  'En cada batalla, Microblizz impone una norma absurda. Hoy: prohibido curarse.':
    'In every battle, Microblizz imposes an absurd rule. Today: no healing.',
  'La técnica de CrazyBunny: gasta 12 de CAOS, salta muy alto y aplasta al enemigo desde arriba.':
    "CrazyBunny's move: it spends 12 CHAOS, jumps sky-high and flattens the enemy from above.",
  'Pronto, jugable': 'Playable soon',
  'Este prototipo enseña el aspecto y el ritmo de un turno. Lo siguiente: que lo juegues tú.':
    'This prototype shows the look and pace of one turn. Next up: you play it.',
  '© 2026 Arkioner y Pepins · MicroBlizz · Todos los derechos reservados': '© 2026 Arkioner and Pepins · MicroBlizz · All rights reserved',
};

const IDIOMA_TA = (() => {
  let q = '';
  try { q = new URLSearchParams(location.search).get('idioma') || localStorage.getItem('fansof-idioma') || ''; } catch (e) { /* sin guardar */ }
  if (!q) for (const l of (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'es'])) { const c = String(l).slice(0, 2).toLowerCase(); if (c === 'es' || c === 'en') { q = c; break; } }
  return q === 'es' ? 'es' : 'en';
})();
document.documentElement.lang = IDIOMA_TA;
function tr(s) { return IDIOMA_TA === 'es' ? s : (EN[s] ?? s); }

// la página: cada elemento con data-tr se traduce entero; data-tr-aria traduce su descripción para lectores de pantalla
function traducePagina() {
  for (const el of document.querySelectorAll('[data-tr]')) el.textContent = tr(el.textContent.trim());
  for (const el of document.querySelectorAll('[data-tr-aria]')) el.setAttribute('aria-label', tr(el.getAttribute('aria-label')));
  for (const a of document.querySelectorAll('[data-idioma]')) {
    a.setAttribute('aria-current', a.dataset.idioma === IDIOMA_TA ? 'true' : 'false');
    a.addEventListener('click', e => { e.preventDefault(); try { localStorage.setItem('fansof-idioma', a.dataset.idioma); } catch (_) { /* sin guardar */ } location.href = location.pathname; });
  }
}
