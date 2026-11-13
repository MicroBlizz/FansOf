// Fans Of · qué hay de nuevo desde la última visita: la regla de la ventana NOVEDADES, sin pantalla ni almacenamiento (ADR 101). La usa novedades/ventana.js.
'use strict';
const LO_NUEVO = (() => {
  // antes y ahora son { b: id del boletín, v: { idJuego: versión } }. Devuelve los ids que cambiaron ('boletin' si hay uno nuevo)
  // o null si no hay memoria de una visita anterior: en la primera visita no hay «desde la última vez» que contar.
  function cambios(antes, ahora) {
    if (!antes) return null;
    const ids = Object.keys(ahora.v).filter(id => antes.v && antes.v[id] !== ahora.v[id]);
    if (ahora.b && ahora.b !== antes.b) ids.push('boletin');
    return ids;
  }
  return { cambios };
})();
