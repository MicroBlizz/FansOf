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
  'Le toca a Microblizz…': "Microblizz's move…", 'Elige una casilla azul': 'Pick a blue tile', 'Toca dos veces al objetivo': 'Tap the target twice',
  'Elige una orden': 'Pick an order', 'Toca a uno de los tuyos': 'Tap one of your team',
  // menús
  'FANS OF': 'FANS OF', 'Jugar': 'Play', 'Cómo se juega': 'How to play', 'Opciones': 'Options', 'Biblioteca': 'Library',
  'Elige la batalla': 'Choose a battle', 'Cementerio de juegos': 'Game Graveyard', 'Oficinas de Microblizz': 'Microblizz Offices',
  'Toca a CrazyBunny o a EpicChampion y elige: Mover, Atacar, Técnica o Esperar.': 'Tap CrazyBunny or EpicChampion and choose: Move, Attack, Skill or Wait.',
  'Para atacar, toca al enemigo una vez para ver el acierto y otra para confirmar.': 'To attack, tap the enemy once to see the hit chance and again to confirm.',
  'Desde más alto aciertas más y pegas más fuerte. Las técnicas gastan CAOS.': 'From higher up you hit more often and harder. Skills spend CHAOS.',
  'Zoom: pellizca con dos dedos, usa la rueda o los botones + y −. Arrastra para mover la cámara.': 'Zoom: pinch with two fingers, use the wheel or the + and − buttons. Drag to move the camera.',
  'Idioma: Español': 'Language: English', 'Pantalla completa': 'Full screen',
  'Pausa': 'Pause', 'Seguir': 'Resume', 'Empezar de nuevo': 'Start over', 'Cambiar de batalla': 'Change battle', 'Menú principal': 'Main menu',
  'Microblizz tendrá que contratar más becarios.': 'Microblizz will have to hire more interns.',
  'Microblizz te agradece los servicios prestados.': 'Microblizz thanks you for your services.',
  'Fans of Tactics Advance': 'Fans of Tactics Advance',
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
