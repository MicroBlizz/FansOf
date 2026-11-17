// Fans Of · HORIZONTAL: los juegos que se juegan con el móvil tumbado (ADR 133). Dice si la pantalla está de pie y, con un toque del
// jugador, pone la pantalla completa y la fija en horizontal: así se juega aunque el móvil tenga bloqueado el giro automático.
//   HORIZONTAL.crea({ ventana, documento, pantalla, traducir })  →  el mismo objeto (para las pruebas: el entorno de mentira)
//   HORIZONTAL.deCanto()      true si la pantalla está de pie (más alta que ancha, con un 10 % de margen)
//   HORIZONTAL.puedeFijar()   true si el navegador sabe poner pantalla completa y fijar el giro (Chrome de Android sí; el iPhone no)
//   HORIZONTAL.fijar(op)      promesa con el resultado, con nombre: 'fijada', 'ya-tumbada', 'sin-soporte' (no hay pantalla completa),
//                             'sin-pantalla-completa' (el navegador la ha negado) o 'sin-fijar' (pantalla completa, pero sin fijar el giro).
//                             Solo actúa con la pantalla de pie; con { siempre: true } también tumbada (para quitar la barra del navegador al jugar).
//   HORIZONTAL.enCompleta()   true si ya está a pantalla completa
//   HORIZONTAL.salir()        quita la pantalla completa (el botón de Opciones que la pone y la quita): 'salida' o 'no-estaba'
// fijar() solo se llama dentro de un toque o una tecla (el navegador no deja pedir la pantalla completa sin un gesto del jugador).
//   HORIZONTAL.lineas()       las frases del aviso ya traducidas: «toca para jugar en horizontal» si se puede fijar; si no, «gira el móvil»
//                             y que quite el bloqueo de giro. Cada juego las pinta a su manera (su inglés está en core/idioma/en-extra.js).
// Las frases pasan por el tr() del juego; un juego sin idioma (Beams, que no carga NUCLEO) las ve en español tal cual.
'use strict';
const HORIZONTAL = (() => {
  const MARGEN = 1.1;

  function crea({ ventana, documento, pantalla, traducir = (t) => t }) {
    const raiz = () => documento.documentElement;
    const deCanto = () => ventana.innerHeight > ventana.innerWidth * MARGEN;
    const sabeCompleta = () => !!(raiz() && (raiz().requestFullscreen || raiz().webkitRequestFullscreen));
    const sabeFijar = () => !!(pantalla && pantalla.orientation && typeof pantalla.orientation.lock === 'function');
    const puedeFijar = () => sabeCompleta() && sabeFijar();

    const enCompleta = () => !!(documento.fullscreenElement || documento.webkitFullscreenElement);

    async function completa() {
      if (enCompleta()) return true;
      const el = raiz(), pide = el.requestFullscreen || el.webkitRequestFullscreen;
      try { await pide.call(el, { navigationUI: 'hide' }); return true; }
      catch (err) { console.warn('HORIZONTAL: sin pantalla completa', err); return false; }
    }

    async function fijar({ siempre = false } = {}) {
      if (!deCanto() && (!siempre || enCompleta())) return 'ya-tumbada';   // tumbada y ya a pantalla completa: no hay nada que hacer
      if (!sabeCompleta()) return 'sin-soporte';
      if (!(await completa())) return 'sin-pantalla-completa';
      if (!sabeFijar()) return 'sin-fijar';   // a pantalla completa, pero este navegador no fija el giro
      try { await pantalla.orientation.lock('landscape'); return 'fijada'; }
      catch (err) { console.warn('HORIZONTAL: el navegador no fija el giro', err); return 'sin-fijar'; }
    }

    async function salir() {
      if (!enCompleta()) return 'no-estaba';
      const sal = documento.exitFullscreen || documento.webkitExitFullscreen;
      try { await sal.call(documento); return 'salida'; }
      catch (err) { console.warn('HORIZONTAL: no se quita la pantalla completa', err); return 'no-estaba'; }
    }

    // Se llama tr para que herramientas/idioma.py e idioma_claves.py encuentren las claves.
    const tr = traducir;
    const lineas = () => (puedeFijar() ? [tr('Toca para jugar en horizontal'), tr('o gira el móvil')]
      : [tr('Gira el móvil para jugar'), tr('Si no cambia, quita el bloqueo de giro')]);

    return Object.freeze({ deCanto, puedeFijar, fijar, enCompleta, salir, lineas });
  }

  // El tr() del juego se busca al pintar (puede cargarse después que este archivo); sin él, las frases salen en español.
  const delJuego = (t) => (typeof globalThis.tr === 'function' ? globalThis.tr(t) : t);
  const propio = typeof window === 'undefined' ? null : crea({ ventana: window, documento: document, pantalla: window.screen, traducir: delJuego });
  return Object.freeze({
    crea, MARGEN,
    deCanto: () => propio.deCanto(),
    puedeFijar: () => propio.puedeFijar(),
    fijar: (op) => propio.fijar(op),
    enCompleta: () => propio.enCompleta(),
    salir: () => propio.salir(),
    lineas: () => propio.lineas(),
  });
})();
