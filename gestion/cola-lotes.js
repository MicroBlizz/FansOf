// Fans Of · /gestion, pestaña COLA: cómo se enseñan los lotes de Yoshi (N imágenes en un run de «Generar recurso»). La etiqueta «imagen ×20» de la lista, cuántos recursos son los ya terminados
// (un lote cuenta como sus variantes) y la línea del resumen que compara el tiempo real por imagen con las dos estimaciones (por unidades y por megapíxeles; la cuenta está en cola-medida.js, compararLotes).
// Funciones puras que usa cola.js; los datos salen de cola-datos.js. Guía: docs/guia/herramientas/cola-actions.md.
'use strict';
const COLA_LOTES = (() => {
  /** «imagen ×20» (o «video ×3») para un trabajo que es un lote; '' si no lo es. */
  const etiqueta = t => t.variantes > 1 ? (t.tipo || 'imagen') + ' ×' + t.variantes : '';
  /** Cuántos recursos son los terminados: un lote cuenta como sus variantes (`n`; los guardados antes de los lotes, 1). */
  const cuenta = recursos => recursos.reduce((a, r) => a + (r.n || 1), 0);
  /** La línea del resumen: «Imagen en lote (últimos 5 lotes): real 21 s por imagen · estimado 24 s por unidades · 19 s por megapíxeles (el «~M min» del título va redondeado hacia arriba)». `fmt`: segundos a texto. '' si no hay lotes medidos. */
  function linea(c, fmt) {
    if (!c) return '';
    const cuantos = c.n === 1 ? 'último lote' : 'últimos ' + c.n + ' lotes';
    const mp = c.megapixeles === null ? 'sin dato por megapíxeles' : fmt(c.megapixeles) + ' por megapíxeles (el «~M min» del título va redondeado hacia arriba)';
    return `<div class="meta">Imagen en lote (${cuantos}): real <b>${fmt(c.real)}</b> por imagen · estimado ${fmt(c.unidades)} por unidades · ${mp}</div>`;
  }
  return { etiqueta, cuenta, linea };
})();
