// Fans Of · /gestion · TABLERO · dominio · VISTATABLERO: cómo se reparten las tareas en las columnas y cómo se filtran. Función pura: recibe tareas y
// un filtro ({ juego, responsable, texto }), devuelve todas las columnas siempre (aunque vacías), con sus tareas ordenadas por prioridad, luego por el
// orden dado y al final por antigüedad. El texto se busca con TABLERO.coincide (buscar.js).
'use strict';
TABLERO.reparte = (tareas, filtro = {}) => {
  const pasa = t => (!filtro.juego || t.juego === filtro.juego) && (!filtro.responsable || t.responsable === filtro.responsable) && TABLERO.coincide(t, filtro.texto);
  const antes = (a, b) => (TABLERO.PRIORIDADES[a.prioridad] - TABLERO.PRIORIDADES[b.prioridad]) || (a.orden - b.orden) || (a.id - b.id);
  return TABLERO.COLUMNAS.map(c => ({ id: c.id, titulo: c.titulo, tareas: tareas.filter(t => t.estado === c.id && pasa(t)).sort(antes) }));
};
TABLERO.juegosDe = tareas => [...new Set(tareas.map(t => t.juego))].sort();
