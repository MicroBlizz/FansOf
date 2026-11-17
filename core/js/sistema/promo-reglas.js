// Fans Of · PROMO · las REGLAS de qué juego nuestro enseña el anuncio propio (ADR 109), sin pantalla, red ni azar propio: las usa promo-juegos.js.
// Salen todos los juegos vivos menos aquel en el que se está, y más a menudo los más votados, por escalones: los 4 con más puntos pesan 3,
// los demás con algún punto pesan 2 y los que no tienen ninguno pesan 1 (así un prototipo recién llegado sigue saliendo).
// Los puntos son los de «Los más pedidos» de la portada (votos_destacados, ADR 103): { idDelJuego: { puntos, ultimo } }. Sin votos, todos pesan igual.
'use strict';
const PROMO_REGLAS = (() => {
  const PESOS = Object.freeze({ cabeza: 3, votado: 2, resto: 1 }), CABEZA = 4;
  const puntos = (votos, id) => { const v = votos && votos[id]; return Math.max(0, Number(v && v.puntos) || 0); };
  const llegada = (votos, id) => { const v = votos && votos[id]; return Date.parse(v && v.ultimo) || 0; };
  // los ids que van en cabeza: los 4 con más puntos; si empatan, quien llegó más tarde a ellos y, si aún empatan, el primero de la lista (como en la portada)
  const cabeza = (ids, votos) => ids
    .map((id, orden) => ({ id, orden, p: puntos(votos, id), t: llegada(votos, id) }))
    .filter(x => x.p > 0)
    .sort((a, b) => b.p - a.p || b.t - a.t || a.orden - b.orden)
    .slice(0, CABEZA).map(x => x.id);
  // candidatos: [{ id, peso }] de todos menos el juego actual
  const pesos = (ids, votos, actual) => {
    const l = ids.filter(id => id !== actual), arriba = new Set(cabeza(l, votos));
    return l.map(id => ({ id, peso: arriba.has(id) ? PESOS.cabeza : puntos(votos, id) > 0 ? PESOS.votado : PESOS.resto }));
  };
  // el id que toca con ese número de azar (de 0 a 1, sin llegar a 1); null si no hay a quién enseñar
  const elige = (ids, votos, actual, azar) => {
    const l = pesos(ids, votos, actual), total = l.reduce((s, x) => s + x.peso, 0);
    if (!total) return null;
    let r = Math.min(Math.max(Number(azar) || 0, 0), 0.999999999) * total;
    for (const x of l) { if (r < x.peso) return x.id; r -= x.peso; }
    return l[l.length - 1].id;
  };
  return { PESOS, cabeza, pesos, elige };
})();
if (typeof module !== 'undefined') module.exports = PROMO_REGLAS;
