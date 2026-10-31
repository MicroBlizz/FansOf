// Fans Of Pets · adaptador · ALMACÉN LOCAL: la partida del prototipo en localStorage de este navegador, con la clave de AJUSTES.guardado
// (el plan la llevará al servidor con la hora del servidor; aún no). Un solo JSON: lo de la partida (PT.Partida.aJson) y, aparte, lo que
// guardan otros adaptadores en el mismo sobre (el desfase del reloj de DEV y el sonido apagado). Nada se comparte con otros juegos.
'use strict';
PT.creaAlmacenLocal = (clave, almacenamiento) => {
  const EXTRAS = ['desfase', 'muted'];   // lo que no es de la partida pero viaja en el mismo JSON

  function lee() {
    try { return JSON.parse(almacenamiento.getItem(clave)) || null; } catch (e) { return null; }   // sin almacenamiento o JSON roto: no hay partida
  }
  function escribe(json) {
    try { almacenamiento.setItem(clave, JSON.stringify(json)); } catch (e) { /* sin almacenamiento: se juega igual, sin guardar */ }
  }
  const extrasDe = j => Object.fromEntries(EXTRAS.filter(k => j && j[k] !== undefined).map(k => [k, j[k]]));

  return {
    cargaPartida: () => lee(),
    guardaPartida(json) { escribe({ ...json, ...extrasDe(lee()) }); },
    // los extras de otros adaptadores
    leeExtra(nombre) { const j = lee(); return j ? j[nombre] : undefined; },
    escribeExtra(nombre, valor) { escribe({ ...(lee() || {}), [nombre]: valor }); },
  };
};
