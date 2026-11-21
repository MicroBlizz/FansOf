// Fans Of · /gestion · TABLERO · dominio · BUSCAR: la búsqueda del tablero mientras se escribe. Sin tildes ni mayúsculas, por palabras: una tarea
// pasa si TODAS las palabras buscadas salen en su título, descripción, criterio, informe de refinado, juego o responsable; «#12» es el número exacto.
// Un número solo («104» o «#104») busca esa tarea esté donde esté: TABLERO.reparte se salta entonces los demás filtros (Arkioner, 18-11-2026).
// Las tareas parecidas a una nueva (para no duplicar) las busca el servidor (_tarea_parecidas), que ve también las hechas antiguas.
'use strict';
TABLERO.normaliza = texto => String(texto == null ? '' : texto).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
TABLERO.palabras = consulta => TABLERO.normaliza(consulta).split(/\s+/).filter(Boolean);
TABLERO.coincide = (t, consulta) => {
  const buscadas = TABLERO.palabras(consulta);
  if (!buscadas.length) return true;
  const texto = TABLERO.normaliza([t.titulo, t.descripcion, t.criterio, t.refinado, t.juego, TABLERO.responsableTexto(t), TABLERO.pidioTexto(t)].join(' '));
  return buscadas.every(p => (/^#\d+$/.test(p) ? p === '#' + t.id : texto.includes(p)));
};
// El número de tarea si lo buscado es solo un número («104», «#104»); si no, null
TABLERO.idBuscado = consulta => { const m = /^\s*#?(\d+)\s*$/.exec(String(consulta == null ? '' : consulta)); return m ? Number(m[1]) : null; };
