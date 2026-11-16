// Fans Of Paperwork · dominio · HITOS: al acumular Despidos se regala lo tedioso (PW.HITOS en datos.js): el castor que vuelca solo, la carta
// de despido firmada y un hueco más en la taquilla del sindicato. Un hito que regala un nodo del plan cuenta como si ese nodo estuviera comprado.
'use strict';
PW.hitos = (() => {
  const logrado = (e, h) => e.c.despidos >= h.despidos;
  // los hitos ya logrados
  const logrados = e => PW.HITOS.filter(h => logrado(e, h));
  // ¿se tiene el nodo del plan id, comprado o regalado por un hito?
  const tieneNodo = (e, id) => !!e.c.plan[id] || PW.HITOS.some(h => h.nodo === id && logrado(e, h));
  // el siguiente hito por lograr (o null)
  const siguiente = e => PW.HITOS.find(h => !logrado(e, h)) || null;
  return { logrados, tieneNodo, siguiente };
})();
