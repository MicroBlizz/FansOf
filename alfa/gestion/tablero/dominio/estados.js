// Fans Of · /gestion · TABLERO · dominio · ESTADOS: las columnas del tablero, las prioridades y quién puede ser responsable. Datos congelados:
// añadir una columna o una prioridad es añadir una línea aquí (y su check en el SQL del tablero, hoy servidor/120-tablero-refinamiento.sql), sin tocar las reglas.
// `sinRefinar`: las columnas de antes de estar lista (ideas y en refinamiento); de ahí Claude solo saca una tarea con la aprobación de una persona.
'use strict';
// `ayuda`: la frase que sale bajo el título de la columna; `tono`: su color (cabecera y marca de la tarjeta). Pepins, 16-11-2026, tarea #63
TABLERO.COLUMNAS = Object.freeze([
  Object.freeze({ id: 'idea', titulo: 'Ideas', sinRefinar: true, tono: '#22c55e', ayuda: 'Se nos ha ocurrido. Nadie la está haciendo.' }),
  Object.freeze({ id: 'refinando', titulo: 'En refinamiento', sinRefinar: true, tono: '#ff9f1c', ayuda: 'Estamos decidiendo cómo hacerla.' }),
  Object.freeze({ id: 'pendiente', titulo: 'Pendiente', tono: '#2ec4b6', ayuda: 'Aprobada, esperando a que alguien empiece.' }),
  Object.freeze({ id: 'en_curso', titulo: 'En curso', tono: '#3b82f6', ayuda: 'Alguien está trabajando en ella.' }),
  Object.freeze({ id: 'en_revision', titulo: 'En revisión', tono: '#ef4444', ayuda: 'Hecha y en la alfa. Pruébala y dale el visto bueno.' }),
  Object.freeze({ id: 'hecho', titulo: 'Hecho', tono: '#ffd23f', ayuda: 'Terminada y aprobada.' }),
]);
TABLERO.PRIORIDADES = Object.freeze({ alta: 0, normal: 1, baja: 2 });   // el número es el peso al ordenar: cuanto menos, antes
TABLERO.RESPONSABLES = Object.freeze({ arkioner: 'Arkioner', pepins: 'Pepins', claude: 'Claude' });
// Las personas que piden tareas y para las que trabaja Claude (ADR 136, SQL 148): `pedida_por` y `para` de una tarea
TABLERO.PERSONAS = Object.freeze({ arkioner: 'Arkioner', pepins: 'Pepins' });
TABLERO.esEstado = id => TABLERO.COLUMNAS.some(c => c.id === id);
// el nombre de una columna (el historial viejo puede traer ids que ya no son columnas: salen tal cual) y el de un responsable
TABLERO.tituloDe = id => (TABLERO.COLUMNAS.find(c => c.id === id) || { titulo: id }).titulo;
// Si la lleva Claude y se sabe para quién: «Claude para Pepins» (ADR 136)
TABLERO.responsableTexto = t => (t.responsable === 'claude' && TABLERO.PERSONAS[t.para] ? 'Claude para ' + TABLERO.PERSONAS[t.para]
  : TABLERO.RESPONSABLES[t.responsable] || 'Sin responsable');
// El estado del informe de refinado (ADR 137, SQL 152). Sin el campo (servidor anterior) no se sabe: la tarjeta dice lo de antes («con informe»)
TABLERO.INFORMES = Object.freeze({ falta: 'Falta informe', por_aprobar: 'Informe por aprobar', cambios: 'Informe con cambios', aprobado: 'Informe aprobado' });
TABLERO.informeTexto = t => TABLERO.INFORMES[t.informe] || (t.refinado ? 'con informe' : '');
TABLERO.pidioTexto = t => (TABLERO.PERSONAS[t.pedida_por] ? 'Pidió ' + TABLERO.PERSONAS[t.pedida_por] : '');
TABLERO.columna = id => TABLERO.COLUMNAS.find(c => c.id === id) || null;
TABLERO.sinRefinar = id => TABLERO.COLUMNAS.some(c => c.id === id && c.sinRefinar);
