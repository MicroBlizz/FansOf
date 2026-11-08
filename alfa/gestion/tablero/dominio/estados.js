// Fans Of · /gestion · TABLERO · dominio · ESTADOS: las columnas del tablero, las prioridades y quién puede ser responsable. Datos congelados:
// añadir una columna o una prioridad es añadir una línea aquí (y su check en el SQL del tablero, hoy servidor/120-tablero-refinamiento.sql), sin tocar las reglas.
// `sinRefinar`: las columnas de antes de estar lista (ideas y en refinamiento); de ahí Claude solo saca una tarea con la aprobación de una persona.
'use strict';
TABLERO.COLUMNAS = Object.freeze([
  Object.freeze({ id: 'idea', titulo: 'Ideas', sinRefinar: true }),
  Object.freeze({ id: 'refinando', titulo: 'En refinamiento', sinRefinar: true }),
  Object.freeze({ id: 'pendiente', titulo: 'Pendiente' }),
  Object.freeze({ id: 'en_curso', titulo: 'En curso' }),
  Object.freeze({ id: 'en_revision', titulo: 'En revisión' }),
  Object.freeze({ id: 'hecho', titulo: 'Hecho' }),
]);
TABLERO.PRIORIDADES = Object.freeze({ alta: 0, normal: 1, baja: 2 });   // el número es el peso al ordenar: cuanto menos, antes
TABLERO.RESPONSABLES = Object.freeze({ arkioner: 'Arkioner', pepins: 'Pepins', claude: 'Claude' });
TABLERO.esEstado = id => TABLERO.COLUMNAS.some(c => c.id === id);
// el nombre de una columna (el historial viejo puede traer ids que ya no son columnas: salen tal cual) y el de un responsable
TABLERO.tituloDe = id => (TABLERO.COLUMNAS.find(c => c.id === id) || { titulo: id }).titulo;
TABLERO.responsableTexto = t => TABLERO.RESPONSABLES[t.responsable] || 'Sin responsable';
TABLERO.sinRefinar = id => TABLERO.COLUMNAS.some(c => c.id === id && c.sinRefinar);
