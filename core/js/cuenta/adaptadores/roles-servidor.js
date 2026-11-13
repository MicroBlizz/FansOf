// Fans Of · CUENTA · adaptador del puerto «servidor» de los roles: pregunta a Supabase con la función mis_roles (servidor/128-mis-roles.sql), UNA sola
// llamada que devuelve todos los roles de la cuenta. Si no responde o contesta algo que no es una lista, lanza: el caso de uso lo traduce a «sin respuesta».
// No sabe qué hace nadie con el resultado.
'use strict';
CUENTA_ROLES.servidorSupabase = rpc => ({
  // nombres: roles que interesan → los que la cuenta sí tiene (el servidor da todos; aquí solo se filtran)
  async cuales(nombres) {
    if (nombres.length === 0) return [];
    const tenidos = await rpc('mis_roles', {});
    if (!Array.isArray(tenidos)) throw new Error('mis_roles no ha devuelto una lista');
    return nombres.filter(n => tenidos.includes(n));
  },
});
