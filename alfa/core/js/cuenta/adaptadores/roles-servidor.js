// Fans Of · CUENTA · adaptador del puerto «servidor» de los roles: pregunta a Supabase con la función tiene_rol (servidor/34-alfa-roles.sql), una
// pregunta por rol y todas a la vez. Si una no responde, lanza: el caso de uso lo traduce a «sin respuesta». No sabe qué hace nadie con el resultado.
'use strict';
CUENTA_ROLES.servidorSupabase = rpc => ({
  // nombres: roles a preguntar → los que la cuenta sí tiene (el servidor solo contesta true cuando es cierto)
  async cuales(nombres) {
    const respuestas = await Promise.all(nombres.map(n => rpc('tiene_rol', { p_rol: n })));
    return nombres.filter((n, i) => respuestas[i] === true);
  },
});
