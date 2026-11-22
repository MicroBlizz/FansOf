// Fans Of · PROMO · las REGLAS de qué juego nuestro enseña el anuncio propio (ADR 109), sin pantalla, red ni azar propio: las usa promo-juegos.js.
// Salen todos los juegos vivos menos aquel en el que se está, y más a menudo los más votados, por escalones: los 4 con más puntos pesan 3,
// los demás con algún punto pesan 2 y los que no tienen ninguno pesan 1 (así un prototipo recién llegado sigue saliendo).
// Los puntos son los de «Los más pedidos» de la portada (votos_destacados, ADR 103): { idDelJuego: { puntos, ultimo } }. Sin votos, todos pesan igual.
// También valida el catálogo de juegos (biblioteca/juegos.json, ADR 198): solo pasan los «vivo» bien formados; un registro malo se ignora y no tira el resto.
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
  // ---- el catálogo de juegos (ADR 198): son datos de fuera, así que se mira cada campo ----
  const ID = /^[a-z0-9-]+$/, CAPTURA = /^[a-z0-9-]+\.jpg$/;
  const esTexto = t => typeof t === 'string' && t.trim() !== '';
  const capturasBuenas = c => Array.isArray(c) && c.length > 0 && c.every(x => typeof x === 'string' && CAPTURA.test(x));
  const identidadBuena = j => esTexto(j.nombre) && typeof j.id === 'string' && ID.test(j.id);
  const marcasBuenas = j => typeof j.cartel === 'boolean' && typeof j.favorito === 'boolean';
  const vivoBueno = j => !!j && typeof j === 'object' && j.estado === 'vivo' && identidadBuena(j) && capturasBuenas(j.capturas) && marcasBuenas(j);
  const congela = j => Object.freeze({ id: j.id, nombre: j.nombre, capturas: Object.freeze([...j.capturas]), cartel: j.cartel, favorito: j.favorito });
  // los juegos vivos y bien formados, congelados y en el orden del catálogo (un id repetido cuenta una vez); si no es el catálogo, una lista vacía
  const catalogo = datos => {
    const lista = datos && typeof datos === 'object' && Array.isArray(datos.juegos) ? datos.juegos : [], vistos = new Set(), buenos = [];
    for (const j of lista) if (vivoBueno(j) && !vistos.has(j.id)) { vistos.add(j.id); buenos.push(congela(j)); }
    return Object.freeze(buenos);
  };
  return { PESOS, cabeza, pesos, elige, catalogo };
})();
if (typeof module !== 'undefined') module.exports = PROMO_REGLAS;
