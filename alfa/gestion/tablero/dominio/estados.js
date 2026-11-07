// Fans Of · /gestion · TABLERO · dominio · ESTADOS: las columnas del tablero, las prioridades y quién puede ser responsable. Datos congelados:
// añadir una columna o una prioridad es añadir una línea aquí (y su check en servidor/117-tablero.sql), sin tocar las reglas.
'use strict';
TABLERO.COLUMNAS = Object.freeze([
  Object.freeze({ id: 'por_refinar', titulo: 'Por refinar' }),
  Object.freeze({ id: 'pendiente', titulo: 'Pendiente' }),
  Object.freeze({ id: 'en_curso', titulo: 'En curso' }),
  Object.freeze({ id: 'en_revision', titulo: 'En revisión' }),
  Object.freeze({ id: 'hecho', titulo: 'Hecho' }),
]);
TABLERO.PRIORIDADES = Object.freeze({ alta: 0, normal: 1, baja: 2 });   // el número es el peso al ordenar: cuanto menos, antes
TABLERO.RESPONSABLES = Object.freeze({ arkioner: 'Arkioner', pepins: 'Pepins', claude: 'Claude' });
TABLERO.esEstado = id => TABLERO.COLUMNAS.some(c => c.id === id);
