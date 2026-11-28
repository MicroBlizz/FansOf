// Fans of Pop · RAID, el servidor de mentira compartido entre pestañas (adaptador, tarea 448): para `?raid=local` con dos pestañas del mismo
// navegador. Envuelve PP_RAID_SERVIDOR_LOCAL: antes de cada llamada lee el estado que dejó la última pestaña en el almacén y después lo guarda
// (cada llamada es síncrona de principio a fin, así dos pestañas no se pisan a mitad). Sin BroadcastChannel: las pestañas se enteran al sondear.
// · crea({ reloj, cfg, semilla, alfa, jefeVida, almacen, clave }) → { rpc, llama }. `almacen` = { getItem(clave), setItem(clave, texto) } (localStorage
//   en el navegador; un objeto de mentira en los tests); `clave` por defecto 'pp_raid_local'. Cuenta con unos 60 KB por la raid de la semana.
// · Si lo guardado no se puede leer (texto roto o con otra forma), se descarta y se empieza vacío. Si el almacén no deja guardar (lleno), la
//   llamada falla con Error('almacen_lleno'); si la llamada ya fallaba por su motivo, ese motivo manda.
// Depende de PP_RAID_SERVIDOR_LOCAL.
'use strict';
const PP_RAID_SERVIDOR_LOCAL_PESTANAS = (() => {
  const VACIO = Object.freeze({ version: 0, raids: {} });
  function crea({ almacen, clave = 'pp_raid_local', ...resto }) {
    const srv = PP_RAID_SERVIDOR_LOCAL.crea(resto);
    function recupera(texto) {
      if (!texto) return;
      try {
        srv.importa(JSON.parse(texto));
      } catch (e) {
        srv.importa({ ...VACIO, raids: {} });   // lo guardado no se lee: se descarta y se empieza vacío
      }
    }
    function guarda(antes) {
      const ahora = JSON.stringify(srv.exporta());
      if (ahora === antes) return null;
      try {
        almacen.setItem(clave, ahora);
        return null;
      } catch (e) {
        return new Error('almacen_lleno');
      }
    }
    function llama(nombre, args, usuario) {
      const antes = almacen.getItem(clave);
      recupera(antes);
      let resultado, fallo = null;
      try {
        resultado = srv.llama(nombre, args, usuario);
      } catch (e) {
        fallo = e;
      }
      const sinGuardar = guarda(antes);
      if (fallo || sinGuardar) throw fallo || sinGuardar;
      return resultado;
    }
    async function rpc(nombre, args, usuario) { return llama(nombre, args, usuario); }
    return Object.freeze({ rpc, llama });
  }
  return Object.freeze({ crea });
})();
if (typeof module !== 'undefined') module.exports = PP_RAID_SERVIDOR_LOCAL_PESTANAS;
