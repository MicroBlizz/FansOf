// Fans Of Nova · NV.Cartas: las reglas de las fusiones de armas (qué parejas se pueden fusionar y qué queda al hacerlo), sin textos ni pesos.
// Las cartas en sí (títulos, pesos, sorteo) están en cartas.js.
'use strict';
NV.Cartas = (() => {
  // Mixta: el portador de una con la carga de la otra (de cargas distintas). Doble: dos del mismo portador y la misma carga.
  function encaja(a, b, f) {
    if (f.tipo === 'doble') return a.portador === f.portador && b.portador === f.portador && a.carga === f.carga;
    return a.portador === f.portador && b.carga === f.carga && a.carga !== b.carga;
  }
  // Todas las fusiones posibles con las armas activas, como [a, b, fusion], en el orden de siempre. Un arma ya fusionada no vuelve a fusionarse.
  function fusiones(act, tabla) {
    const out = [];
    for (const a of act) for (const b of act) {
      if (a === b || a.fusion || b.fusion) continue;
      for (const f of tabla) if (encaja(a, b, f)) out.push([a, b, f]);
    }
    return out;
  }
  // Fusionar: `b` sale de la nave y `a` se queda con la fusión, el mejor nivel de los dos y el tamaño mayor
  function fusiona(armas, a, b, f) {
    armas.splice(armas.indexOf(b), 1);
    a.fusion = f; a.portador = f.portador; a.carga = f.carga; a.nivel = Math.max(a.nivel, b.nivel);
    if (b.tam === 'L' || (b.tam === 'M' && a.tam === 'S')) a.tam = b.tam;
  }
  return { encaja, fusiones, fusiona };
})();
