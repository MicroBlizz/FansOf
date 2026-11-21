// Tiny Fans · aplicación · SESIÓN: la partida cargada (TN.Partida) y la única puerta para guardarla. La comparten los casos de uso de
// la expedición, del nido y del asalto: piden sesion.partida, hacen su acción y llaman a sesion.guarda(). Puerto que recibe:
//   almacen: { cargaPartida() → json | null, guardaPartida(json) }
// Sin partida, o con una que no vale, se empieza de cero (y `empezoDeCero` lo dice). Dueño: N1 (arquitectura).
'use strict';
TN.creaSesion = ({ almacen }) => {
  const guardada = almacen.cargaPartida();
  const r = guardada ? TN.Partida.desdeJson(guardada) : null;
  let partida = r && r.ok ? r.valor : TN.Partida.nueva();
  return {
    get partida() { return partida; },
    empezoDeCero: !(r && r.ok),
    descartada: r && !r.ok ? r : null,   // el error de la partida guardada que no se pudo cargar, si lo hubo
    guarda() { almacen.guardaPartida(partida.aJson()); },
    // cargar otra partida en vez de la actual (pruebas). Resultado: el de TN.Partida.desdeJson
    cargaDe(json) {
      const otra = TN.Partida.desdeJson(json);
      if (otra.ok) { partida = otra.valor; this.guarda(); }
      return otra;
    },
    reinicia() { partida = TN.Partida.nueva(); this.guarda(); },
  };
};
