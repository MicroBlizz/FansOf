// Fans Of · LA PORTADA · buscar, filtrar por etiqueta y ordenar los juegos del catálogo (tarea #277, ADR 188). Regla pura: sin pantalla, reloj ni almacenamiento.
// La usa biblioteca/portada-catalogo.js. Un juego es { id, nombre, etiquetas: [..], favorito, orden, textos: [..] }:
//   orden  → su puesto en la página (desempata siempre);
//   textos → lo que se puede buscar además del nombre y las etiquetas (p. ej. lo mismo traducido al idioma de la pantalla).
// Órdenes (MODOS): «nuevos» (fecha de la última versión, novedades/fechas.json; sin fecha, al final), «nombre» (A-Z sin el «Fans of» del principio),
// «votados» (puntos de votos_destacados(); a igual puntos, quien llegó más tarde a ellos, como LOS MÁS PEDIDOS; sin puntos, al final) y «favoritos» (los favoritos arriba y luego el resto, cada parte en el orden de la página).
'use strict';
const CATALOGO = (() => {
  const MODOS = ['nuevos', 'nombre', 'votados', 'favoritos'];
  // minúsculas y sin tildes, para que «puzle» encuentre «Puzle» y «accion» encuentre «Acción»
  const plano = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  const sinFansOf = n => plano(n).replace(/^fans of\s+/, '');
  const buscable = j => [j.nombre, ...(j.etiquetas || []), ...(j.textos || [])].map(plano).join(' | ');

  // texto: lo escrito en el buscador (todas sus palabras tienen que salir); etiqueta: la etiqueta elegida ('' = todas)
  function filtrar(juegos, { texto = '', etiqueta = '' } = {}) {
    const palabras = plano(texto).split(/\s+/).filter(Boolean), et = plano(etiqueta);
    return juegos.filter(j => (!et || (j.etiquetas || []).some(x => plano(x) === et))
      && palabras.every(p => buscable(j).includes(p)));
  }

  const porOrden = (a, b) => a.orden - b.orden;
  const COMPARA = {
    nuevos: ({ fechas }) => (a, b) => String((fechas && fechas[b.id]) || '').localeCompare(String((fechas && fechas[a.id]) || '')) || porOrden(a, b),
    nombre: () => (a, b) => sinFansOf(a.nombre).localeCompare(sinFansOf(b.nombre), 'es') || porOrden(a, b),
    votados: ({ votos }) => {
      const v = j => (votos && votos[j.id]) || {}, p = j => Number(v(j).puntos) || 0, llegada = j => Date.parse(v(j).ultimo) || 0;
      return (a, b) => p(b) - p(a) || llegada(b) - llegada(a) || porOrden(a, b);   // el mismo desempate que LOS MÁS PEDIDOS (grupos.js)
    },
    favoritos: () => (a, b) => (!!b.favorito - !!a.favorito) || porOrden(a, b),
  };
  // modo: uno de MODOS (otro cualquiera, «nuevos»); datos: { fechas: { id: 'AAAA-MM-DD…' }, votos: { id: { puntos } } }. Devuelve una lista nueva.
  const ordenar = (juegos, modo, datos = {}) => [...juegos].sort((COMPARA[modo] || COMPARA.nuevos)(datos));
  const modoValido = m => (MODOS.includes(m) ? m : 'nuevos');

  // las etiquetas para los botones de filtrar: las que más juegos tienen (al menos 2), y a igual número, la que sale antes en la página
  function etiquetasFrecuentes(juegos, cuantas = 8) {
    const cuenta = new Map();
    [...juegos].sort(porOrden).forEach(j => (j.etiquetas || []).forEach(x => cuenta.set(x, (cuenta.get(x) || 0) + 1)));
    return [...cuenta].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).slice(0, cuantas).map(([x]) => x);
  }
  // NUESTROS FAVORITOS (la fila de arriba de la biblioteca): solo los favoritos, en el orden de la página
  const favoritos = juegos => juegos.filter(j => j.favorito).sort(porOrden);
  return { MODOS, filtrar, ordenar, modoValido, etiquetasFrecuentes, favoritos };
})();
