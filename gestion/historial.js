// Fans Of · /gestion · HISTORIAL (tarea #322, Pepins; ADR 201): las reglas del botón de atrás del navegador (y del móvil) dentro de /gestion. El historial
// solo guarda DÓNDE estás: { gestion: { grupo, juego, seccion, capa } }. Cambiar de grupo, pestaña o juego con un toque añade una entrada; abrir con un toque
// una tarea o un formulario del Tablero añade UNA entrada «capa» encima de la de su pestaña. Atrás cierra lo abierto, luego vuelve a la pestaña anterior y,
// cuando ya no queda nada de /gestion, sale a la página de antes. Nunca se reabre nada desde el historial. Funciones puras, sin `history` ni `window`:
// eso lo hace historial-navegador.js (GESTION_HISTORIAL_NAVEGADOR). Guía: docs/gestion/LEEME.md.
'use strict';
const GESTION_HISTORIAL = (() => {
  const texto = v => (typeof v === 'string' && v ? v : null);
  // Dónde se está, limpio y congelado. capa: la entrada se añadió al abrir algo encima (debajo está la misma pestaña sin nada)
  const vista = v => Object.freeze({ grupo: texto(v.grupo) || 'tablero', juego: texto(v.juego), seccion: texto(v.seccion), capa: v.capa === true });
  // Lo que guarda una entrada del historial (history.state), o null si no es de /gestion
  const leer = estado => (estado && estado.gestion && typeof estado.gestion === 'object' ? vista(estado.gestion) : null);
  // Lo que se guarda en la entrada (un objeto nuevo y sencillo: el navegador lo copia)
  const entrada = v => ({ gestion: { grupo: v.grupo, juego: v.juego, seccion: v.seccion, capa: v.capa } });
  const mismoSitio = (a, b) => a.grupo === b.grupo && a.juego === b.juego && a.seccion === b.seccion;
  const sinCapa = v => vista({ ...v, capa: false });

  // Qué hacer al cambiar de grupo, pestaña o juego con un toque. actual: lo que dice la entrada de arriba (o null); sitio: { grupo, juego, seccion }.
  // { accion: 'nada' | 'empuja' | 'reemplaza', estado }: otro sitio → una entrada nueva; el mismo → nada; sin entrada de /gestion → se reemplaza
  function decide(actual, sitio) {
    const n = sinCapa(sitio);
    if (!actual) return { accion: 'reemplaza', estado: n };
    return mismoSitio(actual, n) ? { accion: 'nada', estado: actual } : { accion: 'empuja', estado: n };
  }
  // La entrada «capa» que se añade al abrir algo, o null si ya hay una (o no hay entrada de /gestion)
  const conCapa = actual => (actual && !actual.capa ? vista({ ...actual, capa: true }) : null);
  // Lo que hay que escribir en la entrada de arriba (replaceState) para que diga dónde se está, sin capa; o null si ya lo dice. Al arrancar y al salir
  function corrige(actual, sitio) {
    const n = sinCapa(sitio);
    return actual && !actual.capa && mismoSitio(actual, n) ? null : n;
  }

  return Object.freeze({ leer, entrada, mismoSitio, sinCapa, decide, conCapa, corrige });
})();
