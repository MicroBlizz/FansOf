// Fans Of · TIENDA DE GEMAS (reglas): lo que se compra con la moneda comprada, a precio fijo y sin azar (ADR 050, docs/core/TIENDA-GEMAS.md).
// Puro: sin reloj, azar, SAVE ni DOM; quien llama pasa el día de hoy, el saldo y lo que ya tiene. El servidor hace las mismas cuentas
// (servidor/112-tienda-gemas.sql) y es quien cobra: esto solo sirve para pintar la tienda y no mandar compras que no pueden salir.
// T es AJUSTES.tiendaFija del juego: { articulos: { id: { tipo, precio, … } }, escaparate: { inicio, n, q, precios: { rar: gemas }, lista: [{ k, id }] } }.
'use strict';
const TIENDA_FIJA = {};
TIENDA_FIJA.reglas = (() => {
  const ok = valor => ({ ok: true, valor }), error = e => ({ ok: false, error: e });
  const SEMANA = 7 * 86400000;
  const dia = s => (typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) ? Date.parse(s + 'T00:00:00Z') : NaN);
  // la semana del escaparate: semanas enteras desde el lunes `inicio` hasta `hoy` (los dos 'AAAA-MM-DD', día de Madrid); null si aún no ha empezado
  function semana(inicio, hoy) { const a = dia(inicio), b = dia(hoy); return a >= 0 && b >= a ? Math.floor((b - a) / SEMANA) : null; }
  // lo que hay en el escaparate la semana k: la lista se recorre en orden, n cada semana, y vuelve a empezar
  function escaparate(E, k) {
    const L = (E && Array.isArray(E.lista) && E.lista) || [];
    if (!L.length || !Number.isInteger(k) || k < 0) return [];
    const n = Math.min(E.n || 3, L.length);
    return Array.from({ length: n }, (_, i) => L[(k * n + i) % L.length]);
  }
  // la clave con la que el servidor apunta la compra (tabla reclamos): para siempre, o una vez por semana y objeto en el escaparate
  const clave = (id, k) => (k == null ? 'fijo:' + id : 'esc:' + k + ':' + id);
  const idEsc = x => 'esc:' + x.k + ':' + x.id;   // el id de un hueco del escaparate en la tienda
  // el artículo que se quiere comprar, con su precio y su clave; c.hoy y c.rareza(k, id) solo hacen falta en el escaparate
  function busca(T, id, c) {
    if (!T || typeof id !== 'string') return error('no_existe');
    if (!id.startsWith('esc:')) {
      const a = T.articulos && T.articulos[id];
      return a && a.precio > 0 ? ok({ articulo: a, precio: a.precio, clave: clave(id), semana: null }) : error('no_existe');
    }
    const E = T.escaparate, k = semana(E && E.inicio, c.hoy);
    const a = escaparate(E, k).find(x => idEsc(x) === id);
    if (!a) return error('no_esta');
    const precio = E.precios && E.precios[c.rareza(a.k, a.id)];
    return precio > 0 ? ok({ articulo: a, precio, clave: clave(a.k + ':' + a.id, k), semana: k }) : error('no_existe');
  }
  // ¿se puede comprar? c: { gemas, tiene(clave), hoy, rareza(k, id) }. Errores con nombre: no_existe, no_esta, ya_lo_tienes, agotado, faltan_gemas
  function comprar(T, id, c) {
    const r = busca(T, id, c); if (!r.ok) return r;
    if (c.tiene(r.valor.clave)) return error(r.valor.semana == null ? 'ya_lo_tienes' : 'agotado');
    if (!(c.gemas >= r.valor.precio)) return error('faltan_gemas');
    return r;
  }
  return { semana, escaparate, clave, idEsc, busca, comprar };
})();
if (typeof module !== 'undefined') module.exports = TIENDA_FIJA;
