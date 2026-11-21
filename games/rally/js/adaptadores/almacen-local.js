// Fans of Rally · adaptador · ALMACÉN LOCAL: los récords (piloto elegido, mejores vueltas con su fantasma y mejor campeonato) en el
// localStorage de este móvil, con la clave de AJUSTES.guardado (`for-rally-v1`). Un solo JSON. Sin almacenamiento (modo privado) o con
// el JSON roto se juega igual, sin guardar.
'use strict';
RA.creaAlmacenLocal = (clave, almacenamiento) => ({
  carga() {
    try { return JSON.parse(almacenamiento.getItem(clave)) || null; } catch (e) { return null; }   // sin almacenamiento o JSON roto: se empieza de cero
  },
  guarda(json) {
    try { almacenamiento.setItem(clave, JSON.stringify(json)); return true; } catch (e) { return false; }   // sin almacenamiento: se juega igual, sin guardar
  },
});
