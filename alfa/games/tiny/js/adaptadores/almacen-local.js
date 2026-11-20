// Tiny Fans · adaptador · ALMACÉN LOCAL: la partida del prototipo en el localStorage de este móvil, con la clave de AJUSTES.guardado
// (`for-tiny-v1`). Un solo JSON: el de TN.Partida.aJson(). Sin servidor ni cuentas; nada se comparte con otros juegos.
// Sin almacenamiento (modo privado) o con el JSON roto no hay partida y se juega igual, sin guardar. Dueño: N1 (arquitectura).
'use strict';
TN.creaAlmacenLocal = (clave, almacenamiento) => ({
  cargaPartida() {
    try { return JSON.parse(almacenamiento.getItem(clave)) || null; } catch (e) { return null; }   // sin almacenamiento o JSON roto: no hay partida
  },
  guardaPartida(json) {
    try { almacenamiento.setItem(clave, JSON.stringify(json)); return true; } catch (e) { return false; }   // sin almacenamiento: se juega igual, sin guardar
  },
  borra() {
    try { almacenamiento.removeItem(clave); } catch (e) { /* sin almacenamiento: no hay nada que borrar */ }
  },
});
