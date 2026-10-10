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
  // presentación y título
  'Arkioner y Pepins presentan': 'Arkioner and Pepins present',
  'Microblizz, una empresa millonaria, ha comprado tus juegos favoritos.': 'Microblizz, a billion-dollar company, has bought your favourite games.',
  'Ahora los cierra uno a uno y despide a todo el mundo. Hasta a Lola, la del café.': 'Now it shuts them down one by one and fires everyone. Even Lola, from the coffee stand.',
  'Pero los fans no se rinden. CrazyBunny y EpicChampion van a plantarle cara…': "But the fans won't give up. CrazyBunny and EpicChampion are going to stand up to it…",
  '…por turnos. Casilla a casilla.': '…turn by turn. Tile by tile.',
  'Saltar': 'Skip', 'Toca para empezar': 'Tap to start', 'Tutorial': 'Tutorial', 'NUEVO': 'NEW', 'Ver la presentación': 'Watch the intro',
  // el tutorial (Lola)
  'LOLA - DESPEDIDA POR MICROBLIZZ': 'LOLA - FIRED BY MICROBLIZZ', '¡Vale!': 'OK!',
  '¡Hola! Soy Lola. Microblizz me despidió del puesto de café, así que ahora te enseño a pelear por turnos.': "Hi! I'm Lola. Microblizz fired me from the coffee stand, so now I teach you turn-based fighting.",
  'Este es CrazyBunny. Tócalo para darle órdenes.': 'This is CrazyBunny. Tap him to give him orders.',
  'Elige Mover. Las casillas azules son los sitios a los que puede ir.': 'Choose Move. The blue tiles are the places he can go.',
  'Toca la casilla que parpadea: al lado del esqueleto y más alta que la suya.': "Tap the flashing tile: next to the skeleton and higher than his.",
  'Ahora elige Atacar. Desde más arriba aciertas más y pegas más fuerte.': 'Now choose Attack. From higher up you hit more often and harder.',
  'Toca al esqueleto una vez para ver el acierto y el daño. Tócalo otra vez para atacar.': 'Tap the skeleton once to see the hit chance and damage. Tap it again to attack.',
  'Cuando todos los tuyos han actuado, le toca a Microblizz. Paciencia: los esqueletos no cobran, pero pegan.': "Once all your team has acted, it's Microblizz's turn. Patience: skeletons don't get paid, but they do hit.",
  'Para el zoom, pellizca con dos dedos, usa la rueda o los botones + y −. Arrastrando mueves la cámara.': 'To zoom, pinch with two fingers, use the wheel or the + and − buttons. Drag to move the camera.',
  'Golpeando y en cada turno se gana CAOS. Toca a CrazyBunny y elige Técnica: el Salto caótico.': 'You gain CHAOS every turn and when you hit. Tap CrazyBunny and choose Skill: the Chaos Jump.',
  'El Salto caótico llega a 3 casillas y pega casi el doble. ¡Aplasta a ese esqueleto!': 'The Chaos Jump reaches 3 tiles and hits almost twice as hard. Squash that skeleton!',
  '¡Despedido! Así se hace. Ya sabes mover, atacar y usar técnicas. Ahora, a por Microblizz.': "Fired! That's how it's done. You can move, attack and use skills. Now go get Microblizz.",
  'Tutorial completado': 'Tutorial complete', 'Lola vuelve a su café. Microblizz no sabe lo que le espera.': "Lola goes back to her coffee. Microblizz has no idea what's coming.",
  'Jugar una batalla': 'Play a battle',
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
