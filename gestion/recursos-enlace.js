// Fans Of · /gestion, pestaña RECURSOS: el ENLACE DIRECTO (tarea #338, ADR 211; dominio, sin página ni red). La dirección lleva el juego (&rjuego=) y una
// &ver= por cada salida abierta para comparar; un enlace así elige ese juego y, ya leída la rama, abre esas salidas con su ficha. Lo usa recursos.js con
// lo que lee GESTION_ENLACE (enlace.js) de `location.search`. Guía: docs/guia/herramientas/galeria.md
'use strict';
const RECURSOS_ENLACE = (() => {
  const TOPE = 12;                          // salidas que abre un enlace como mucho
  const JUEGO = /^[a-z0-9]{1,40}$/;         // como los juegos de la lista (RECURSOS_DATOS.juegos)
  const SALIDA = /^salida\/[^\0]{1,300}$/;  // solo rutas de salida/: lo demás no está en la lista
  // Lo que pide el enlace ({ juego, ver }), o null si no es de Recursos. p: lo que da GESTION_ENLACE.lee. Lo raro se queda fuera; sin repetir
  function pedido(p) {
    if (!p || p.seccion !== 'recursos' || p.juego) return null;
    const juego = p.valores('rjuego').find(j => JUEGO.test(j)) || '';
    const ver = [...new Set(p.valores('ver').filter(s => SALIDA.test(s)))].slice(0, TOPE);
    return Object.freeze({ juego, ver: Object.freeze(ver) });
  }
  // Lo abierto después de aplicar el pedido: las salidas que pide que siguen en la rama, cada una con la primera ficha que la tiene, detrás de lo que ya
  // estaba abierto y sin repetir. Si el pedido es de otro juego (el suyo ya no está), no abre nada. salidasDe(f): las salidas de una ficha
  function abre(pide, juego, fichas, abiertos, salidasDe) {
    if (!pide || (pide.juego && pide.juego !== juego)) return abiertos;
    const nuevos = [...abiertos];
    for (const salida of pide.ver) {
      const ficha = fichas.find(f => salidasDe(f).includes(salida));
      if (ficha && !nuevos.some(a => a.salida === salida)) nuevos.push({ salida, ficha });
    }
    return nuevos;
  }
  // Lo que va en la dirección ([clave, valor]): lo pedido mientras no se ha abierto, y después el juego y lo abierto
  function parametros(pide, juego, abiertos) {
    if (pide) return [['rjuego', pide.juego || juego], ...pide.ver.map(s => ['ver', s])];
    return [['rjuego', juego], ...abiertos.map(a => ['ver', a.salida])];
  }
  return Object.freeze({ TOPE, pedido, abre, parametros });
})();
if (typeof module !== 'undefined') module.exports = RECURSOS_ENLACE;   // en node (tests/gestion/recursos-enlace.test.mjs) solo se carga
