// Fans Of · /gestion · TABLERO · dominio · REVISAR (tarea #161, ADR 160): lo que hace falta para revisar en un toque, sin pantalla ni red.
// - El enlace para probar una tarea en la alfa a partir de su juego (solo si el juego está en el catálogo de la biblioteca, ADR 198; la lista llega de fuera).
// - Los trozos de un texto con enlaces (texto suelto y direcciones https), para que la vista los haga pulsables.
// Cada caja lleva el color de la columna de donde salen sus tareas (tarea #163: colores tipo semáforo).
// - La bandeja «Te toca»: lo que espera a quien mira (por revisar, te preguntan, informes por aprobar).
// - Si quien mira puede dar por buena una tarea o pedir cambios (está en revisión y es suya).
'use strict';
TABLERO.ALFA = 'https://fansof.games/alfa/games/';
// Los juegos con página en la alfa son los del catálogo de la biblioteca (web/biblioteca/juegos.json, ADR 198), todos sea cual sea su estado: la alfa publica
// todas las carpetas de web/games. Aquí no hay red: el adaptador (repositorio-catalogo.js) pide el fichero y este dominio lo valida
const ID_JUEGO = /^[a-z0-9-]+$/;
// Los ids del catálogo ya leído (el JSON): ok con la lista congelada; un registro sin id válido se salta y no tira los demás (como el anuncio de core).
// Error `catalogo-roto` si no es un catálogo: sin lista o sin ningún id válido
TABLERO.juegosDelCatalogo = datos => {
  const lista = datos && Array.isArray(datos.juegos) ? datos.juegos : [];
  const ids = lista.map(j => (j && typeof j.id === 'string' ? j.id : '')).filter(id => ID_JUEGO.test(id));
  if (!ids.length) return TABLERO.error('catalogo-roto', { registros: lista.length });
  return TABLERO.ok(Object.freeze([...new Set(ids)]));
};
// La dirección del juego en la alfa, o null si no está entre los ids dados (core, web, gestion, general, una idea sin carpeta…; sin catálogo la lista va vacía)
TABLERO.enlaceAlfa = (juego, ids = []) => (ids.includes(juego) ? TABLERO.ALFA + juego + '/' : null);

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
  Object.freeze({ id: 'revisar', titulo: 'por revisar', columna: 'en_revision', tono: '#ef4444', es: (t, yo) => TABLERO.puedoRevisar(t, yo) }),
  Object.freeze({ id: 'preguntan', titulo: 'te preguntan', columna: 'en_curso', tono: '#3b82f6', es: (t, yo) => t.estado === 'en_curso' && meNombra(t, yo) }),
  Object.freeze({ id: 'informes', titulo: 'informes por aprobar', columna: null, tono: '#ff9f1c', es: (t, yo) => TABLERO.sinRefinar(t.estado) && t.informe === 'por_aprobar' && TABLERO.esDe(t, yo) }),
]);
TABLERO.bandejaDe = id => TABLERO.BANDEJAS.find(b => b.id === id) || null;
// ¿Está la tarea en esa bandeja para quien mira? Sin bandeja elegida, todas pasan
TABLERO.enBandeja = (t, id, yo) => { const b = TABLERO.bandejaDe(id); return !b || (!!yo && b.es(t, yo)); };
// Cuántas tareas hay en cada caja para quien mira: [{ id, titulo, columna, tono, cuantas }]. Sin saber quién mira (no hay sesión de persona), ninguna
TABLERO.bandeja = (tareas, yo) => (yo ? TABLERO.BANDEJAS.map(b => Object.freeze({ id: b.id, titulo: b.titulo, columna: b.columna, tono: b.tono, cuantas: tareas.filter(t => b.es(t, yo)).length })) : []);
