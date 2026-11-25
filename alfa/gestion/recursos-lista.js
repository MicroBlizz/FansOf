// Fans Of · /gestion, pestaña RECURSOS: las reglas de la LISTA de fichas (dominio, sin página ni red): las salidas de una ficha, su estado (el que más pesa
// de sus salidas), la línea de resumen que enseña y si pasa los filtros de tipo, marca y tarea. Las marcas llegan ya mezcladas (RECURSOS_MARCAS.mezcla).
// Lo usa recursos.js. Guía: docs/guia/herramientas/galeria.md
'use strict';
const RECURSOS_LISTA = (() => {
  const M = typeof RECURSOS_MARCAS !== 'undefined' ? RECURSOS_MARCAS : require('./recursos-marcas.js');
  const D = typeof RECURSOS_DATOS !== 'undefined' ? RECURSOS_DATOS : require('./recursos-datos.js');
  const PESO = ['valido', 'relanzar', 'pendiente', 'sin-mirar'];   // lo que manda en un grupo, de más a menos

  // Las salidas de una ficha: las de un encargo o un grupo, o ella sola
  const salidasDe = f => f.salidas || [f.ruta];
  // El estado de una ficha: el de su salida, o en un grupo el que más pesa (algo que sirve, luego relanzar, en el aire, sin mirar; descartada si todas lo
  // están). Una ficha sin salidas (un encargo con la cadena rota) está sin mirar: así sale en la lista con su error
  function estado(f, marcas) {
    const salidas = salidasDe(f);
    if (!salidas.length) return 'sin-mirar';
    const c = M.cuentas(marcas, salidas);
    return PESO.find(k => c[k]) || 'invalido';
  }
  // La línea de debajo del nombre: la marca de su salida, o en un grupo cuántas hay de cada (o «N en el aire» si todas lo están)
  function resumen(f, marcas) {
    const salidas = salidasDe(f), c = M.cuentas(marcas, salidas);
    if (salidas.length === 1) return M.TEXTOS[M.estadoDe(marcas, salidas[0])];   // también un grupo de una sola propuesta
    const partes = [[c.valido, ' sirven'], [c.relanzar, ' a relanzar'], [c.invalido, ' descartadas'], [c['sin-mirar'], ' sin mirar']];
    return partes.filter(([n]) => n).map(([n, t]) => n + t).join(' · ') || salidas.length + ' en el aire';
  }
  // ¿Pasa los filtros? filtro: { tipo, estado, tarea } ('' = todo). Sin filtro de marca, todo menos lo descartado
  function pasa(f, filtro, marcas) {
    if (filtro.tipo && f.tipo !== filtro.tipo) return false;
    if (!D.deTarea(f, filtro.tarea)) return false;
    const e = estado(f, marcas);
    return filtro.estado ? e === filtro.estado : e !== 'invalido';
  }
  return Object.freeze({ salidasDe, estado, resumen, pasa });
})();
if (typeof module !== 'undefined') module.exports = RECURSOS_LISTA;   // en node (tests/gestion/recursos-lista.test.mjs) solo se carga
