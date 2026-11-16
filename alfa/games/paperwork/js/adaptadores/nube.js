// Fans Of Paperwork · adaptador · NUBE: lo que pide la cuenta de core (core/js/sistema/cuenta.js) para guardar la partida en la nube (ADR 125).
// Core sube y compara la partida por su nombre global `SAVE` y, en un juego ligero, enseña las diferencias con `resumenPartida(s)`. Aquí `SAVE`
// es el sobre que guarda el almacén (la partida con sus extras, tal cual está en localStorage) y el resumen sale de PW.RESUMEN_NUBE.
// avisaCambio() se llama tras cada guardado: core sube 10 s después del primer cambio pendiente (llamarlo en cada guardado lo retrasaría siempre).
'use strict';
PW.creaNube = (almacen, cuenta, global = window) => {
  Object.defineProperty(global, 'SAVE', { get: () => almacen.sobre(), configurable: true });
  global.resumenPartida = s => PW.RESUMEN_NUBE.map(r => [r.nombre, Number(r.de(s || {})) || 0]);
  const avisaCambio = () => { if (cuenta && cuenta.activa && !cuenta.pendiente) cuenta.cambio(); };
  return { avisaCambio };
};
