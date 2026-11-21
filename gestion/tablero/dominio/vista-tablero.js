// Fans Of · /gestion · TABLERO · dominio · VISTATABLERO: cómo se reparten las tareas en las columnas y cómo se filtran. Función pura: recibe tareas y
// un filtro ({ juego, responsable, persona, bandeja y yo (la caja de «Te toca» elegida y quién mira; revisar.js), texto, orden }), devuelve todas las columnas siempre (aunque vacías), con sus tareas ordenadas según `orden`
// (TABLERO.ORDENES; por defecto, prioridad, luego el orden dado y al final antigüedad; en Hecho, la última cambiada primero). El texto se busca con TABLERO.coincide (buscar.js).
// TABLERO.recorta deja cada columna en sus 10 primeras tarjetas (tarea #301) salvo las desplegadas o con algún filtro puesto.
'use strict';
// Filtro «Persona» (ADR 154): las tareas de las que esa persona es responsable y las que pidió y aún no tienen responsable
TABLERO.esDe = (t, persona) => (TABLERO.responsableDe(t) || t.pedida_por) === persona;
// «Ordenar por» (Pepins, 18-11-2026, ADR 147): por prioridad (alta arriba; luego el orden a mano y la más antigua), las más nuevas primero o lo último
// cambiado primero (sin fecha, al final). Un orden que no existe ordena por prioridad
TABLERO.ORDENES = Object.freeze({
  prioridad: (a, b) => (TABLERO.PRIORIDADES[a.prioridad] - TABLERO.PRIORIDADES[b.prioridad]) || (a.orden - b.orden) || (a.id - b.id),
  nuevas: (a, b) => b.id - a.id,
  cambio: (a, b) => String(b.actualizado || '').localeCompare(String(a.actualizado || '')) || (b.id - a.id),
});
TABLERO.TEXTO_ORDEN = Object.freeze({ prioridad: 'Prioridad', nuevas: 'Más nuevas', cambio: 'Último cambio' });
// Un número solo en la búsqueda (TABLERO.idBuscado) enseña esa tarea en su columna aunque los otros filtros la escondieran
TABLERO.reparte = (tareas, filtro = {}) => {
  const id = TABLERO.idBuscado(filtro.texto);
  const pasa = id !== null ? t => t.id === id : t => (!filtro.juego || t.juego === filtro.juego) && (!filtro.responsable || TABLERO.responsableDe(t) === filtro.responsable)
    && (!filtro.persona || TABLERO.esDe(t, filtro.persona)) && TABLERO.enBandeja(t, filtro.bandeja, filtro.yo) && TABLERO.coincide(t, filtro.texto);
  const antes = TABLERO.ORDENES[filtro.orden] || TABLERO.ORDENES.prioridad;
  return TABLERO.COLUMNAS.map(c => ({ id: c.id, titulo: c.titulo, tono: c.tono, ayuda: c.ayuda, tareas: tareas.filter(t => t.estado === c.id && pasa(t)).sort(TABLERO.ordenDe(c.id, filtro.orden, antes)) }));
};
// En Hecho (tarea #301, Pepins) la prioridad ya no dice nada: con el orden por defecto, las terminadas más recientes primero (fecha de su último cambio,
// `actualizado`, que el servidor pone al moverla). Si se elige otro orden en «Ordenar por», manda ese
TABLERO.ordenDe = (columna, orden, antes) => (columna === 'hecho' && (!TABLERO.ORDENES[orden] || orden === 'prioridad') ? TABLERO.ORDENES.cambio : antes);
// Tope por columna (tarea #301, Pepins, 21-11-2026): cada columna enseña como mucho TABLERO.TOPE tarjetas, en su orden, y debajo «Ver las N más».
// Con un filtro puesto (búsqueda, juego, responsable, persona o una caja de «Te toca») se ven todas las que coinciden
TABLERO.TOPE = 10;
TABLERO.filtrando = (filtro = {}) => !!(String(filtro.texto || '').trim() || filtro.juego || filtro.responsable || filtro.persona || filtro.bandeja);
// Devuelve las columnas con `vistas` (las tarjetas que se pintan), `mas` (cuántas quedan escondidas: «Ver las N más») y `menos` (desplegada y con más del
// tope: «Ver menos»). `tareas` sigue entera, para los recuentos y el mapa del móvil. `desplegadas`: los ids de las columnas que se han abierto (Set o lista)
TABLERO.recorta = (columnas, filtro = {}, desplegadas = []) => {
  const todas = TABLERO.filtrando(filtro), abiertas = new Set(desplegadas);
  return columnas.map(c => {
    const sobran = todas ? 0 : Math.max(0, c.tareas.length - TABLERO.TOPE), menos = sobran > 0 && abiertas.has(c.id);
    return Object.freeze({ ...c, vistas: sobran && !menos ? c.tareas.slice(0, TABLERO.TOPE) : c.tareas, mas: menos ? 0 : sobran, menos });
  });
};
// Los botones de arriba (Pepins, 18-11-2026, ADR 147): uno por columna y «Todas». `vista` es el id de la columna elegida o null (todas).
// Devuelve las columnas que se enseñan; si el id no es una columna, todas
TABLERO.columnasVisibles = (columnas, vista) => (columnas.some(c => c.id === vista) ? columnas.filter(c => c.id === vista) : columnas);
TABLERO.juegosDe = tareas => [...new Set(tareas.map(t => t.juego))].sort();
