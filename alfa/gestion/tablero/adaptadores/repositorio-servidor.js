// Fans Of · /gestion · TABLERO · adaptador · REPOSITORIOSERVIDOR: el puerto `repositorio` del tablero con Supabase. Usa el `rpc` y el token de la
// página de /gestion (que le pasa principal.js) y la función gestion_tareas de servidor/117-tablero.sql.
'use strict';
TABLERO.repositorioServidor = ({ rpc, leerToken }) => ({
  async lista() { return (await rpc('gestion_tareas', { p_token: leerToken() })).tareas || []; },
});
