// Fans Of Paperwork · adaptador · ALMACÉN LOCAL: la partida en localStorage de este navegador, con la clave de AJUSTES.guardado. Un solo JSON:
// lo de la partida (PW.partida.aJson y la hora de guardado) y, aparte, los extras de otros adaptadores en el mismo sobre (los logros y el
// sonido apagado). Nada se comparte con otros juegos. Un guardado que no se entiende se aparta en <clave>-ilegible.
'use strict';
PW.creaAlmacenLocal = (clave, almacenamiento) => {
  const EXTRAS = ['retos', 'muted'];   // lo que no es de la partida pero viaja en el mismo JSON

  function lee(k = clave) {
    try { return JSON.parse(almacenamiento.getItem(k)) || null; } catch (e) { return null; }   // sin almacenamiento o JSON roto: no hay partida
  }
  function escribe(json, k = clave) {
    try { almacenamiento.setItem(k, JSON.stringify(json)); } catch (e) { /* sin almacenamiento: se juega igual, sin guardar */ }
  }
  // los extras se leen una vez y se tienen en memoria; la partida, la última que se guardó (así guardar no relee todo)
  const inicial = lee(), extras = Object.fromEntries(EXTRAS.filter(k => inicial && inicial[k] !== undefined).map(k => [k, inicial[k]]));
  let partida = inicial && inicial.r ? inicial : null;

  return {
    cargaPartida: () => partida,
    guardaPartida(json) { partida = json; escribe({ ...json, ...extras }); },
    leeExtra: nombre => extras[nombre],
    escribeExtra(nombre, valor) { extras[nombre] = valor; escribe({ ...(partida || {}), ...extras }); },
    // un guardado que no se pudo leer se aparta con otra clave antes de empezar de nuevo
    guardaCopia(json) { escribe(json, clave + '-ilegible'); },
  };
};
