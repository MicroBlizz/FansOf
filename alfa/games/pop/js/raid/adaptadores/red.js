// Fans of Pop · RAID, la red (adaptador, tarea 448, ADR 243): habla con las funciones del servidor (servidor/205-pop-raid.sql y 208-pop-raid-objetos.sql) por puertos, sin
// globales ni DOM ni reloj. Cada función devuelve SIEMPRE un resultado, nunca lanza: { ok: true, datos } o { ok: false, error } con
//   'sin_cuenta' (no hay sesión: ni se llama al servidor), un motivo que el servidor da (raid_acabada, sin_toques, toques_no_valen, nada_que_cobrar...)
//   o 'sin_red' (cualquier otro fallo: se puede reintentar).
// · estado(raid, trozos, versiones): la raid y los trozos pedidos cuya versión no es la tuya (versiones: 0 si aún no tienes ese trozo).
// · tocar(raid, toques, golpes, trozos, versiones): una tanda de toques [[x, y], ...] y de golpes al jefe; devuelve además las reventadas.
// · jugar(raid, toques, golpes, objetos, trozos, versiones): lo mismo con OBJETOS (['bomba', x, y], ['martillo', x, y], ['martillo'] al jefe,
//   ['toques3']). Si el servidor no los admite (tope_objetos, sin_jefe) NO es un error de red: llega en datos.motivo y no ha cambiado nada.
// · cobrar(raid): el premio de una raid acabada (una sola vez). · prueba(): rehace la raid 'prueba' (solo cuentas con rol alfa).
// `raid` null = la de esta semana. Puertos: rpc(nombre, args) (como CUENTA.rpc) y hay() (¿hay cuenta?).
'use strict';
const PP_RAID_RED = (() => {
  const MOTIVOS = ['sin_sesion', 'sin_rol_alfa', 'raid_no_existe', 'raid_acabada', 'raid_sin_acabar', 'toques_no_valen', 'sin_toques',
    'trozos_no_valen', 'nada_que_cobrar', 'sin_monedero', 'cobro_caducado', 'almacen_lleno'];
  const CONOCIDOS = new RegExp(MOTIVOS.join('|'));
  const error = motivo => Object.freeze({ ok: false, error: motivo });
  function motivoDe(e) {
    const m = String(e && (e.message || e)).match(CONOCIDOS);
    if (!m) return 'sin_red';
    return m[0] === 'sin_sesion' ? 'sin_cuenta' : m[0];
  }
  const versionesDe = v => (v || []).map(x => x || 0);

  function crea({ rpc, hay }) {
    async function llama(nombre, args) {
      if (!hay()) return error('sin_cuenta');
      try {
        return Object.freeze({ ok: true, datos: (await rpc(nombre, args)) || {} });
      } catch (e) { return error(motivoDe(e)); }
    }
    const estado = (raid, trozos, versiones) =>
      llama('pop_raid_estado', { p_raid: raid ?? null, p_trozos: trozos || [], p_versiones: versionesDe(versiones) });
    const tocar = (raid, toques, golpes, trozos, versiones) =>
      llama('pop_raid_tocar', { p_raid: raid ?? null, p_toques: toques || [], p_golpes: golpes || 0, p_trozos: trozos || [], p_versiones: versionesDe(versiones) });
    const jugar = (raid, toques, golpes, objetos, trozos, versiones) =>
      llama('pop_raid_jugar', { p_raid: raid ?? null, p_toques: toques || [], p_golpes: golpes || 0, p_objetos: objetos || [], p_trozos: trozos || [], p_versiones: versionesDe(versiones) });
    const cobrar = raid => llama('pop_raid_cobrar', { p_raid: raid ?? null });
    const prueba = () => llama('pop_raid_prueba', {});
    return Object.freeze({ estado, tocar, jugar, cobrar, prueba });
  }
  return Object.freeze({ crea, motivoDe });
})();
if (typeof module !== 'undefined') module.exports = PP_RAID_RED;
