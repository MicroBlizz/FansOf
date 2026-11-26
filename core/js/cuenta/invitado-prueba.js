// Fans Of · CUENTA · INVITADO DE PRUEBA (tarea 318, ADR 227): el interruptor del panel DEV «Ver como invitado». Encendido, CUENTA.invitado dice
// que sí aunque dentro haya una cuenta de verdad, para revisar en la alfa las ventanas de invitado («Primero, tu cuenta», guardar con email…),
// a las que una cuenta de invitado de verdad no llega (la alfa solo deja pasar a probadores). Lo que cambiaría la cuenta de verdad no se envía
// (cuenta.js lo para). Solo vale en la alfa y en el modo desarrollo, y dura hasta cerrar la pestaña (se guarda en sessionStorage).
// Sin DOM ni globales del navegador: el almacén y si está permitido entran por `crea`, así que se prueba en Node.
'use strict';
const CUENTA_INVITADO_PRUEBA = (() => {
  const CLAVE = 'fansof-invitado-prueba';
  // almacen: como sessionStorage (o null si no hay) · permitido: la alfa o el modo desarrollo
  function crea({ almacen, permitido }) {
    const lee = () => { try { return !!almacen && almacen.getItem(CLAVE) === '1'; } catch (e) { return false; /* sin almacenamiento: apagado */ } };
    const activo = () => !!permitido && lee();
    // enciende o apaga; devuelve si quedó guardado (fuera de la alfa y del modo desarrollo, o sin almacenamiento, no se guarda nada)
    function pon(encendido) {
      if (!permitido || !almacen) return false;
      try { if (encendido) almacen.setItem(CLAVE, '1'); else almacen.removeItem(CLAVE); return true; } catch (e) { return false; /* sin almacenamiento */ }
    }
    return Object.freeze({ activo, pon, permitido: !!permitido });
  }
  // el fallo con nombre que devuelven las acciones paradas (guardar o entrar con email o Google)
  const parada = mensaje => Object.assign(new Error(mensaje), { prueba: true });
  return Object.freeze({ CLAVE, crea, parada });
})();
if (typeof module !== 'undefined') module.exports = CUENTA_INVITADO_PRUEBA;
