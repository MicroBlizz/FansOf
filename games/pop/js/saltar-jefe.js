// Fans of Pop · SALTAR AL JEFE (dominio; tarea #95, ADR 152): cuando te atascas en el jefe de un mundo, abres el mundo siguiente
// pagando perlas y el jefe se queda PENDIENTE, esperándote. Las reglas, en funciones puras y datos congelados (sin reloj, azar, SAVE,
// red ni dibujo): cuándo se ofrece, qué pasa al saltar, qué pasa al ganarle después, y cómo cambian el modo difícil y el mapa de un
// mundo con el jefe pendiente. El camino sigue siendo un solo número (PP_P.nivel); los pendientes son la lista de mundos con el jefe
// saltado (PP_P.pendientes). El precio y los fallos están en PP_CFG.saltarJefe (js/ajustes.js). Los errores son resultados con nombre:
// no_es_jefe, modo, no_toca, ultimo_mundo, pocos_fallos, ya_pendiente, no_pendiente y faltan_perlas.
'use strict';
const PP_SALTO = Object.freeze((() => {
  const ok = v => Object.freeze({ ok: true, ...v });
  const error = (e, mas = {}) => Object.freeze({ ok: false, error: e, ...mas });
  const natural = n => Number.isInteger(n) && n >= 0;
  // la lista tal como se guarda: mundos (enteros desde 0), sin repetir y en orden; lo que no vale se descarta
  const limpia = lista => Object.freeze([...new Set((Array.isArray(lista) ? lista : []).filter(natural))].sort((a, b) => a - b));
  const esPendiente = (lista, mundo) => limpia(lista).includes(mundo);
  // ¿sale el botón? Solo en el jefe del camino normal que toca (`g` = PP_P.nivel), nunca en el último mundo, y desde `cfg.fallos` fallos
  // en ese jefe (contando el que se acaba de perder). `nivel` es PP_P.nivel; `mundos`, cuántos mundos hay.
  function ofrece(nivel, { jefe, dif, g, mundo, fallos, mundos }, cfg) {
    if (!jefe) return error('no_es_jefe');
    if (dif) return error('modo');
    if (g !== nivel) return error('no_toca');
    if (mundo + 1 >= mundos) return error('ultimo_mundo');
    if (!(fallos >= cfg.fallos)) return error('pocos_fallos');
    return ok({ siguiente: mundo + 1, perlas: cfg.perlas });
  }
  // ¿llegan las perlas? Si no, cuántas faltan (para «Te faltan N perlas»)
  function paga(perlas, precio) {
    const tengo = natural(perlas) ? perlas : 0;
    return tengo >= precio ? ok({ quedan: tengo - precio }) : error('faltan_perlas', { faltan: precio - tengo });
  }
  // saltar: el camino ({ nivel, pendientes }) estaba en el jefe de `mundo`, que es el último nivel antes de `inicioSiguiente`; pasa al
  // primer nivel del mundo siguiente y el jefe queda pendiente
  function salta(camino, mundo, inicioSiguiente) {
    const lista = limpia(camino.pendientes);
    if (lista.includes(mundo)) return error('ya_pendiente');
    if (!natural(inicioSiguiente) || camino.nivel + 1 !== inicioSiguiente) return error('no_toca');
    return ok({ nivel: inicioSiguiente, pendientes: limpia([...lista, mundo]) });
  }
  // ganar al jefe pendiente de `mundo`: deja de estar pendiente (el camino no se mueve: ya iba por delante)
  function gana(pendientes, mundo) {
    const lista = limpia(pendientes);
    return lista.includes(mundo) ? ok({ pendientes: limpia(lista.filter(m => m !== mundo)) }) : error('no_pendiente');
  }
  // el modo difícil de un mundo: abierto si el camino ya pasó el mundo entero (`fin` = primer nivel del siguiente) y su jefe no espera
  const difAbierto = (nivel, fin, pendiente) => nivel >= fin && !pendiente;
  // por dónde va el camino normal en un mundo (de 0 a `niveles`, que es todo pasado): con el jefe pendiente, el jefe es el que toca
  const vaPor = (nivel, inicio, niveles, pendiente) => (pendiente ? niveles - 1 : Math.min(Math.max(nivel - inicio, 0), niveles));
  return { limpia, esPendiente, ofrece, paga, salta, gana, difAbierto, vaPor };
})());
if (typeof module !== 'undefined') module.exports = PP_SALTO;
