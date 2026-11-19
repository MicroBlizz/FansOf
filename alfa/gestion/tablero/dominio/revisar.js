// Fans Of · /gestion · TABLERO · dominio · REVISAR (tarea #161, ADR 160): lo que hace falta para revisar en un toque, sin pantalla ni red.
// - El enlace para probar una tarea en la alfa a partir de su juego (solo si el juego tiene página en web/games; un test compara la lista con las carpetas).
// - Los trozos de un texto con enlaces (texto suelto y direcciones https), para que la vista los haga pulsables.
// - La bandeja «Te toca»: lo que espera a quien mira (por revisar, te preguntan, informes por aprobar).
// - Si quien mira puede dar por buena una tarea o pedir cambios (está en revisión y es suya).
'use strict';
TABLERO.ALFA = 'https://fansof.games/alfa/games/';
// Los juegos con página propia en web/games (tests/gestion/tablero/revisar.test.mjs avisa si alguien añade o quita una carpeta y no la apunta aquí)
TABLERO.JUEGOS_WEB = Object.freeze(['air', 'asalto', 'auto', 'basement', 'beams', 'boom', 'chef', 'cooking', 'crush', 'dark', 'decks', 'dungeons', 'goose', 'island',
  'jump', 'karts', 'kingdom', 'merge', 'nova', 'panic', 'paperwork', 'pets', 'pop', 'ratkov', 'recruit', 'roguelite', 'rouflage', 'rumble-3d', 'rumble-clasico',
  'rumble-v2', 'rumble', 'shelter', 'skate', 'snakes', 'soccer', 'spy', 'survivors', 'swipe', 'tacticas', 'tactics-advance', 'taxi', 'td', 'terminal-shock',
  'vikings', 'wings', 'zombies']);
// La dirección del juego en la alfa, o null si la tarea no es de un juego con página (core, web, gestion, general, una idea sin carpeta…)
TABLERO.enlaceAlfa = juego => (TABLERO.JUEGOS_WEB.includes(juego) ? TABLERO.ALFA + juego + '/' : null);

// Un texto partido en trozos { texto } y { url } (solo https, sin el punto o la coma que la cierre), en orden: la vista escapa cada uno y enlaza las url
const URL_EN_TEXTO = /https:\/\/[^\s<>"']+[^\s<>"'.,;:!?)\]]/g;
TABLERO.trozosConEnlaces = texto => {
  const s = String(texto || ''), trozos = [];
  let desde = 0;
  for (const m of s.matchAll(URL_EN_TEXTO)) {
    if (m.index > desde) trozos.push(Object.freeze({ texto: s.slice(desde, m.index) }));
    trozos.push(Object.freeze({ url: m[0] }));
    desde = m.index + m[0].length;
  }
  if (desde < s.length) trozos.push(Object.freeze({ texto: s.slice(desde) }));
  return Object.freeze(trozos);
};

// ¿Puede quien mira dar por buena la tarea o pedir cambios desde los botones? Solo en revisión y si es suya (TABLERO.esDe, ADR 136): lo de la otra
// persona sigue teniendo el desplegable de mover, para no cerrarle nada sin querer
TABLERO.puedoRevisar = (t, yo) => !!yo && t.estado === 'en_revision' && TABLERO.esDe(t, yo);
// ¿Le preguntan algo a quien mira? En curso, con «esperando» que nombra a esa persona (la skill tablero escribe «Pepins: ¿qué color?»)
const meNombra = (t, yo) => !!t.esperando && TABLERO.normaliza(t.esperando).includes(TABLERO.normaliza(TABLERO.nombreDe(yo)));
// Las tres cajas de la bandeja, con la columna que enseñan al pulsarlas (null: «Todas», porque un informe puede estar en ideas o en refinamiento)
TABLERO.BANDEJAS = Object.freeze([
  Object.freeze({ id: 'revisar', titulo: 'por revisar', columna: 'en_revision', tono: '#56ccf2', es: (t, yo) => TABLERO.puedoRevisar(t, yo) }),
  Object.freeze({ id: 'preguntan', titulo: 'te preguntan', columna: 'en_curso', tono: '#f2c94c', es: (t, yo) => t.estado === 'en_curso' && meNombra(t, yo) }),
  Object.freeze({ id: 'informes', titulo: 'informes por aprobar', columna: null, tono: '#f2994a', es: (t, yo) => TABLERO.sinRefinar(t.estado) && t.informe === 'por_aprobar' && TABLERO.esDe(t, yo) }),
]);
TABLERO.bandejaDe = id => TABLERO.BANDEJAS.find(b => b.id === id) || null;
// ¿Está la tarea en esa bandeja para quien mira? Sin bandeja elegida, todas pasan
TABLERO.enBandeja = (t, id, yo) => { const b = TABLERO.bandejaDe(id); return !b || (!!yo && b.es(t, yo)); };
// Cuántas tareas hay en cada caja para quien mira: [{ id, titulo, columna, tono, cuantas }]. Sin saber quién mira (no hay sesión de persona), ninguna
TABLERO.bandeja = (tareas, yo) => (yo ? TABLERO.BANDEJAS.map(b => Object.freeze({ id: b.id, titulo: b.titulo, columna: b.columna, tono: b.tono, cuantas: tareas.filter(t => b.es(t, yo)).length })) : []);
