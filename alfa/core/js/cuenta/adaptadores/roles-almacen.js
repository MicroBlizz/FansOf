// Fans Of · CUENTA · adaptador del puerto «almacén» de los roles: el veredicto se guarda en este navegador (localStorage), en una sola clave.
// Un almacenamiento bloqueado o con basura no rompe nada: leer da null y guardar dice false (el caso de uso sigue sin recordar).
'use strict';
// obtener() da el almacenamiento (localStorage); puede lanzar, porque ya leerlo falla si el navegador lo bloquea
CUENTA_ROLES.almacenLocal = (obtener, clave = 'fansof-roles') => ({
  leer() { try { return JSON.parse(obtener().getItem(clave) || 'null'); } catch (e) { return null; } },
  // datos null borra lo guardado
  guardar(datos) {
    try {
      if (datos === null) obtener().removeItem(clave); else obtener().setItem(clave, JSON.stringify(datos));
      return true;
    } catch (e) { return false; }
  },
});
