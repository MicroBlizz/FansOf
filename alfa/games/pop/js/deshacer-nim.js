// Fans of Pop · DESHACER TRAS PERDER UN DUELO (dominio; tarea #95, Pepins 18-11-2026): «Deshacer y seguir» devolvía al principio de tu
// último turno, y si allí ya ibas perdiendo pagabas para volver a perder. Ahora vuelve al ÚLTIMO turno tuyo desde el que aún se podía ganar.
// Siempre hay uno: o empezabas tú con la posición ganadora, o empezó el rival desde una perdedora, y cualquier jugada suya desde ahí te deja
// una ganadora. Funciones puras: sin SAVE, reloj, azar ni dibujo. `gana(filas)` es la regla del Nim que usa el duelo (ppNimGana, js/nimnivel.js).
'use strict';
const PP_DESHACER = Object.freeze((() => {
  // cuántas burbujas arriba hay en cada fila de una foto del tablero (`up` y `mask` en orden de filas, `n` por fila)
  function filas(up, mask, n) {
    const f = new Array(n).fill(0);
    for (let i = 0; i < up.length; i++) if (mask[i] && up[i]) f[Math.floor(i / n)]++;
    return f;
  }
  // el índice de la última foto desde la que se gana, o -1 si no hay ninguna (no debería pasar, ver arriba)
  function buena(fotos, mask, n, gana) {
    for (let k = (fotos || []).length - 1; k >= 0; k--) if (gana(filas(fotos[k].up, mask, n))) return k;
    return -1;
  }
  return { filas, buena };
})());
if (typeof module !== 'undefined') module.exports = PP_DESHACER;
