// Fans Of · CUENTA · composición de los roles (ADR 097): el único sitio que conoce a todos. Junta el dominio, los casos de uso y los adaptadores
// con la cuenta de este navegador (CUENTA, que ya está cargada) y lo deja en CUENTA_ROLES.sesion, que es lo que devuelve CUENTA.roles.
// Quien necesite un rol pregunta ahí (CUENTA.roles.tiene('alfa')) y, si quiere ponerlo al día, CUENTA.roles.refrescar([...]). El único que aún llama por su
// cuenta a tiene_rol es proximamente.js, que la tarea #47 borra casi entero (ADR 097).
'use strict';
CUENTA_ROLES.compon = ({ cuenta, almacen, reloj = Date, publicar }) => CUENTA_ROLES.casos({
  sesion: { activa: () => !!cuenta.activa, usuario: () => cuenta.usuario, invitado: () => cuenta.invitado },
  servidor: CUENTA_ROLES.servidorSupabase(cuenta.rpc),
  almacen: CUENTA_ROLES.almacenLocal(almacen),
  reloj: { ahora: () => reloj.now() },
  publicar,
});
CUENTA_ROLES.sesion = CUENTA_ROLES.compon({
  cuenta: CUENTA,
  almacen: () => localStorage,
  publicar: () => fire('roles'),   // el aviso de siempre de core (utiles.js): quien quiera enterarse, hook('roles', ...)
});
