// Fans of Pinball · adaptador · ALMACÉN LOCAL: la partida guardada en el localStorage de este móvil, con la clave de AJUSTES.guardado
// (`for-pinball-v1`), un solo JSON. Sin almacenamiento (modo privado) o con el JSON roto no hay partida guardada y se juega igual.
'use strict';
PB.creaAlmacenLocal = (clave, almacenamiento) => ({
  carga() {
    try { return JSON.parse(almacenamiento.getItem(clave)) || null; } catch (e) { return null; }   // sin almacenamiento o JSON roto: no hay partida
  },
  guarda(json) {
    try { almacenamiento.setItem(clave, JSON.stringify(json)); return true; } catch (e) { return false; }   // sin almacenamiento: se juega sin guardar
  },
});
