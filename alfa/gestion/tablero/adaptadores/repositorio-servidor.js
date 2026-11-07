// Fans Of · /gestion · TABLERO · adaptador · REPOSITORIOSERVIDOR: el puerto `repositorio` del tablero con Supabase. Usa el `rpc` y el token de la
// página de /gestion (que le pasa principal.js) y las funciones gestion_tareas, gestion_tarea_guardar y gestion_tarea_mover de servidor/117-tablero.sql.
'use strict';
TABLERO.repositorioServidor = ({ rpc, leerToken }) => ({
  async lista() { return (await rpc('gestion_tareas', { p_token: leerToken() })).tareas || []; },
  guardar(tarea) { return rpc('gestion_tarea_guardar', { p_token: leerToken(), p_tarea: tarea }); },
  mover(id, estado, nota) { return rpc('gestion_tarea_mover', { p_token: leerToken(), p_id: id, p_estado: estado, p_nota: nota }); },
});
