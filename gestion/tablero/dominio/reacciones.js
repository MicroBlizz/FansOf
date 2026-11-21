// Fans Of · /gestion · TABLERO · dominio · REACCIONES (tarea #124, ADR 149): los doce iconos con los que Arkioner y Pepins reaccionan a una tarea, como en
// WhatsApp, y cómo se juntan las reacciones que da el servidor (SQL 155) con las tareas. Cada persona tiene como mucho una por tarea. Funciones puras.
'use strict';
// El orden es el de la barrita (dos filas de seis). Los mismos ids que acepta el servidor (servidor/155-tablero-reacciones.sql)
TABLERO.REACCIONES = Object.freeze([
  ['vale', 'Vale'], ['urge', 'Urge'], ['lo_miro', 'Lo miro'], ['duda', 'Duda'], ['me_rio', 'Me río'], ['no', 'No'],
  ['ideaza', 'Ideaza'], ['chapuza', 'Chapuza'], ['esto_peta', 'Esto peta'], ['a_tope', 'A tope'], ['sin_prisa', 'Sin prisa'], ['fiesta', 'Fiesta'],
].map(([id, texto]) => Object.freeze({ id, texto })));
TABLERO.esReaccion = id => TABLERO.REACCIONES.some(r => r.id === id);
TABLERO.textoReaccion = id => (TABLERO.REACCIONES.find(r => r.id === id) || { texto: id }).texto;
// El nombre de quien reaccionó: el servidor guarda la persona del tablero ('arkioner', 'pepins'); otro usuario sale tal cual
TABLERO.nombreDe = quien => TABLERO.PERSONAS[quien] || String(quien || '');

// Las reacciones de una tarea, limpias y en orden de llegada: { quien, reaccion, cuando, mia } (mia: la puso quien está mirando). Lo mal formado se deja fuera
TABLERO.limpiaReacciones = (lista, yo) => Object.freeze((Array.isArray(lista) ? lista : [])
  .filter(r => r && typeof r.quien === 'string' && r.quien !== '' && TABLERO.esReaccion(r.reaccion))
  .map(r => Object.freeze({ quien: r.quien, reaccion: r.reaccion, cuando: r.cuando || null, mia: !!yo && r.quien === yo })));
// Las tareas (json) con sus reacciones dentro (`reacciones`), a partir de la lista de todas ({ tarea, quien, reaccion, cuando })
TABLERO.conReacciones = (tareas, lista, yo) => {
  const de = new Map();
  (Array.isArray(lista) ? lista : []).forEach(r => { if (r && Number.isInteger(r.tarea)) de.set(r.tarea, [...(de.get(r.tarea) || []), r]); });
  return tareas.map(t => ({ ...t, reacciones: TABLERO.limpiaReacciones(de.get(t.id), yo) }));
};
// La reacción que tiene puesta quien mira (para marcarla en la barrita), o null
TABLERO.miReaccion = t => ((t.reacciones || []).find(r => r.mia) || { reaccion: null }).reaccion;
