// Fans Of Paperwork · adaptador · ALMACÉN LOCAL: la partida en localStorage de este navegador, con la clave de AJUSTES.guardado. Un solo JSON:
// lo de la partida (PW.partida.aJson y la hora de guardado) y, aparte, los extras de otros adaptadores en el mismo sobre (los logros y el
// sonido apagado). Nada se comparte con otros juegos. Un guardado que no se entiende se aparta en <clave>-ilegible.
// almacenamiento puede ser null (navegador con el guardado bloqueado): se juega igual, sin guardar. Cada fallo de lectura o de escritura se
// cuenta una vez a alFallar(motivo, error): 'sin-almacenamiento', 'ilegible' o 'no-guarda'.
'use strict';
PW.creaAlmacenLocal = (clave, almacenamiento, alFallar = () => {}) => {
  const EXTRAS = ['retos', 'muted'];   // lo que no es de la partida pero viaja en el mismo JSON
  const avisados = {};
  function falla(motivo, error) {
    if (avisados[motivo]) return;
    avisados[motivo] = true;
    alFallar(motivo, error);
  }
  function lee(k = clave) {
    if (!almacenamiento) { falla('sin-almacenamiento'); return null; }
    let texto = null;
    try {
      texto = almacenamiento.getItem(k);
      return JSON.parse(texto) || null;
    } catch (error) {
      // un JSON roto no se pisa sin más: se aparta tal cual antes de empezar de nuevo
      if (typeof texto === 'string') escribeTexto(texto, clave + '-ilegible');
      falla('ilegible', error);
      return null;
    }
  }
  function escribeTexto(texto, k) {
    if (!almacenamiento) return;
    try { almacenamiento.setItem(k, texto); } catch (error) { falla('no-guarda', error); }
  }
  const escribe = (json, k = clave) => escribeTexto(JSON.stringify(json), k);
  // los extras se leen una vez y se tienen en memoria; la partida, la última que se guardó (así guardar no relee todo)
  const inicial = lee(), deOtraVersion = !!inicial && inicial.v !== PW.AJ.version;
  // de otra versión la partida empieza de cero, y con ella los retos y logros (el sonido apagado sí se respeta)
  const extras = Object.fromEntries(EXTRAS.filter(k => inicial && inicial[k] !== undefined && !(deOtraVersion && k === 'retos')).map(k => [k, inicial[k]]));
  let partida = inicial && inicial.r ? inicial : null;

  return {
    cargaPartida: () => partida,
    guardaPartida(json) { partida = json; escribe({ ...json, ...extras }); },
    leeExtra: nombre => extras[nombre],
    escribeExtra(nombre, valor) { extras[nombre] = valor; escribe({ ...(partida || {}), ...extras }); },
    // deja el extra apuntado para el próximo guardado, sin escribir ahora (lo que cambia muchas veces por segundo, como los retos)
    apuntaExtra(nombre, valor) { extras[nombre] = valor; },
    // un guardado que no se pudo leer se aparta con otra clave antes de empezar de nuevo
    guardaCopia(json) { escribe(json, clave + '-ilegible'); },
  };
};
