// Fans of Tactics Advance (prototipo) · TEXTOS: en el código y en la página van en español, y aquí está su inglés.
// El idioma se elige como en los juegos: el de Opciones (`fansof-idioma`) o, si no hay, el del navegador. Para probar: ?idioma=en
'use strict';

const EN = {
  // en la pantalla de la consola
  'Norma:': 'Rule:', 'Prohibido curarse': 'No healing', 'Prohibido descansar': 'No breaks',
  'TURNO {n}': 'TURN {n}', 'Turno de los Fans': "Fans' turn", 'Turno de Microblizz': "Microblizz's turn",
  'ANIMALES LOCOS': 'CRAZY ANIMALS', 'HEROES': 'HEROES', 'NO-MUERTOS': 'UNDEAD', 'MICROBLIZZ': 'MICROBLIZZ',
  'CrazyBunny': 'CrazyBunny', 'EpicChampion': 'EpicChampion', 'StarBot': 'StarBot',
  'Esqueleto en paro': 'Jobless Skeleton', 'Becario sin sueldo': 'Unpaid Intern',
  'Mover': 'Move', 'Atacar': 'Attack', 'Técnica': 'Skill', 'Esperar': 'Wait', 'Volver': 'Back', 'Fin del turno': 'End turn',
  'Salto caótico': 'Chaos Jump', 'Tajo épico': 'Epic Slash', '{n} CAOS': '{n} CHAOS',
  'VIDA': 'HP', 'CAOS': 'CHAOS', 'NV': 'LV', 'Fallo': 'Miss', 'ACIERTO {a}%  DAÑO {d}': 'HIT {a}%  DMG {d}',
  '¡Primero me despiden': 'First they fire me,', 'y ahora esto!': 'and now this?!',
  '¡Ni siquiera': "They don't even", 'me pagan!': 'pay me!',
  '¡Otra vez': 'Back on', 'al paro!': 'the dole!', '¡Por fin': 'Finally,', 'vacaciones!': 'a holiday!', 'Error 404:': 'Error 404:', 'sueldo': 'salary',
  '¡Victoria!': 'Victory!', 'Microblizz tendrá que': 'Microblizz will have', 'contratar más becarios.': 'to hire more interns.',
  '¡Te han despedido!': "You're fired!", 'Microblizz te agradece': 'Microblizz thanks you', 'los servicios prestados.': 'for your services.',
  'Otra vez': 'Again',
  // la pista
  'Pulsa «Otra vez» para jugar de nuevo.': 'Press "Again" to play once more.',
  'Le toca a Microblizz…': "Microblizz's move…",
  'Toca una casilla azul para moverte.': 'Tap a blue tile to move there.',
  'Toca un enemigo en la zona roja y vuelve a tocarlo para confirmar.': 'Tap an enemy in the red area, then tap it again to confirm.',
  'Elige qué hace: moverse, atacar, una técnica o esperar.': 'Choose what to do: move, attack, use a skill or wait.',
  'Toca a CrazyBunny o a EpicChampion para darle órdenes. Arrastra para mover la cámara.': 'Tap CrazyBunny or EpicChampion to give orders. Drag to move the camera.',
  // la página
  'Biblioteca': 'Library',
  'Prototipo jugable · una batalla': 'Playable prototype · one battle',
  'Combate táctico por casillas en pixel art de consola portátil. Mueve a CrazyBunny y a EpicChampion por el mapa y despide a los esbirros de Microblizz antes de que te despidan a ti.':
    'Tile-based tactics in handheld-console pixel art. Move CrazyBunny and EpicChampion across the map and fire the Microblizz minions before they fire you.',
  'Pantalla del juego: un mapa en diagonal con tus personajes y los de Microblizz': 'Game screen: a diagonal map with your characters and the Microblizz ones',
  '240 × 160 píxeles, como la consola': '240 × 160 pixels, like the console', 'Arrastra para mover la cámara': 'Drag to move the camera',
  'Escenario': 'Stage', 'Cementerio': 'Graveyard', 'Oficinas': 'Offices', 'Empezar de nuevo': 'Start over',
  'Cómo se juega': 'How to play',
  'Toca a uno de los tuyos y elige: Mover (casillas azules), Atacar o Técnica (zona roja). Toca dos veces al enemigo para confirmar.':
    'Tap one of your characters and choose: Move (blue tiles), Attack or Skill (red area). Tap the enemy twice to confirm.',
  'La altura importa': 'Height matters',
  'Desde más arriba aciertas más y pegas más fuerte. Los escalones muy altos no se suben de un salto.':
    'From higher up you hit more often and harder. Very tall steps can’t be climbed in one jump.',
  'Técnicas con CAOS': 'Skills with CHAOS',
  'Salto caótico de CrazyBunny (12 de CAOS, llega a 3 casillas) y Tajo épico de EpicChampion (10). Ganas CAOS cada turno y al golpear.':
    "CrazyBunny's Chaos Jump (12 CHAOS, reaches 3 tiles) and EpicChampion's Epic Slash (10). You gain CHAOS every turn and when you hit.",
  'La norma del día': 'Rule of the day',
  'En cada batalla, Microblizz impone una norma absurda. Hoy: prohibido curarse. Tampoco tenías con qué.':
    "In every battle, Microblizz imposes an absurd rule. Today: no healing. Not that you had anything to heal with.",
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
