// Fans Of · /gestion · TABLERO · adaptador · REPOSITORIOSERVIDOR: el puerto `repositorio` del tablero con Supabase. Usa el `rpc` y el token de la
// página de /gestion (que le pasa principal.js) y las funciones gestion_tareas, gestion_tarea_guardar y gestion_tarea_mover (servidor/117-tablero.sql) y gestion_tarea_parecidas (servidor/120); las reacciones, gestion_tarea_reacciones y gestion_tarea_reaccionar (servidor/155).
'use strict';
TABLERO.repositorioServidor = ({ rpc, leerToken }) => ({
  async lista() { return (await rpc('gestion_tareas', { p_token: leerToken() })).tareas || []; },
  guardar(tarea) { return rpc('gestion_tarea_guardar', { p_token: leerToken(), p_tarea: tarea }); },
  mover(id, estado, nota) { return rpc('gestion_tarea_mover', { p_token: leerToken(), p_id: id, p_estado: estado, p_nota: nota }); },
  informe(id, accion, nota, texto) { return rpc('gestion_tarea_informe', { p_token: leerToken(), p_id: id, p_accion: accion, p_nota: nota, p_texto: texto }); },   // servidor/152
  reacciones() { return rpc('gestion_tarea_reacciones', { p_token: leerToken() }); },   // servidor/155: { quien, reacciones: [{ tarea, quien, reaccion, cuando }] }
  reaccionar(id, reaccion) { return rpc('gestion_tarea_reaccionar', { p_token: leerToken(), p_id: id, p_reaccion: reaccion }); },
  parecidas(texto, excluir) { return rpc('gestion_tarea_parecidas', { p_token: leerToken(), p_texto: texto, p_excluir: excluir }); },
});
