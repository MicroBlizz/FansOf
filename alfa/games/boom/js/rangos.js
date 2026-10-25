// Fans of Boom · RANGOS: de Pollito a CEO. Los puntos se ganan y se pierden jugando contra la IA con rango y se guardan en este aparato.
// Subir de rango es solo prestigio por ahora (más adelante abre móviles y mapas). Sin DOM.
'use strict';
const RANGO = (() => {
  const R = BOOM.rangos;
  const puntos = () => (typeof SAVE.puntos === 'number' ? SAVE.puntos : R.inicial);
  const indice = p => { let k = 0; R.lista.forEach(([, d], i) => { if (p >= d) k = i; }); return k; };
  const nombre = p => R.lista[indice(p)][0];
  const nivelIA = () => { const k = indice(puntos()); let n = 0; for (const [desde, niv] of R.nivelIA) if (k >= desde) n = niv; return n; };
  // aplica el resultado de una partida con rango; devuelve { delta, antes, despues, subio } para enseñarlo
  function aplica(gano, nivel) {
    const antes = puntos(), f = R.dificultad[nivel] || 1, delta = gano ? Math.round(R.gana * f) : -Math.round(R.pierde / f);
    SAVE.puntos = Math.max(0, antes + delta); bmGuarda();
    return { delta: SAVE.puntos - antes, antes, despues: SAVE.puntos, subio: indice(SAVE.puntos) > indice(antes) };
  }
  // cuántos puntos faltan para el siguiente rango (0 si ya es el último)
  const falta = p => { const k = indice(p); return k + 1 < R.lista.length ? R.lista[k + 1][1] - p : 0; };
  return { puntos, indice, nombre, nivelIA, aplica, falta };
})();
