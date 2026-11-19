// Fans Of · /gestion · TABLERO · dominio · VISTATABLERO: cómo se reparten las tareas en las columnas y cómo se filtran. Función pura: recibe tareas y
// un filtro ({ juego, responsable, persona, bandeja y yo (la caja de «Te toca» elegida y quién mira; revisar.js), texto, orden }), devuelve todas las columnas siempre (aunque vacías), con sus tareas ordenadas según `orden`
// (TABLERO.ORDENES; por defecto, prioridad, luego el orden dado y al final antigüedad). El texto se busca con TABLERO.coincide (buscar.js).
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
  return TABLERO.COLUMNAS.map(c => ({ id: c.id, titulo: c.titulo, tono: c.tono, ayuda: c.ayuda, tareas: tareas.filter(t => t.estado === c.id && pasa(t)).sort(antes) }));
};
// Los botones de arriba (Pepins, 18-11-2026, ADR 147): uno por columna y «Todas». `vista` es el id de la columna elegida o null (todas).
// Devuelve las columnas que se enseñan; si el id no es una columna, todas
TABLERO.columnasVisibles = (columnas, vista) => (columnas.some(c => c.id === vista) ? columnas.filter(c => c.id === vista) : columnas);
TABLERO.juegosDe = tareas => [...new Set(tareas.map(t => t.juego))].sort();
