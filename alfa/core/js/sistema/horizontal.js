// Fans Of · HORIZONTAL: los juegos que se juegan con el móvil tumbado (ADR 133). Dice si la pantalla está de pie y, con un toque del
// jugador, pone la pantalla completa y la fija en horizontal: así se juega aunque el móvil tenga bloqueado el giro automático.
//   HORIZONTAL.crea({ ventana, documento, pantalla })  →  { deCanto(), puedeFijar(), fijar(), lineas() }   (para las pruebas: el entorno de mentira)
//   HORIZONTAL.deCanto()      true si la pantalla está de pie (más alta que ancha, con un 10 % de margen)
//   HORIZONTAL.puedeFijar()   true si el navegador sabe poner pantalla completa y fijar el giro (Chrome de Android sí; el iPhone no)
//   HORIZONTAL.fijar()        promesa con el resultado, con nombre: 'fijada', 'ya-tumbada', 'sin-soporte', 'sin-pantalla-completa' o 'sin-fijar'
// fijar() solo se llama dentro de un toque o una tecla (el navegador no deja pedir la pantalla completa sin un gesto del jugador).
//   HORIZONTAL.lineas()       las frases del aviso ya traducidas: «toca para jugar en horizontal» si se puede fijar; si no, «gira el móvil»
//                             y que quite el bloqueo de giro. Cada juego las pinta a su manera (su inglés está en core/idioma/en-extra.js).
'use strict';
const HORIZONTAL = (() => {
  const MARGEN = 1.1;

  function crea({ ventana, documento, pantalla }) {
    const raiz = () => documento.documentElement;
    const deCanto = () => ventana.innerHeight > ventana.innerWidth * MARGEN;
    const sabeCompleta = () => !!(raiz() && (raiz().requestFullscreen || raiz().webkitRequestFullscreen));
    const sabeFijar = () => !!(pantalla && pantalla.orientation && typeof pantalla.orientation.lock === 'function');
    const puedeFijar = () => sabeCompleta() && sabeFijar();

    async function completa() {
      if (documento.fullscreenElement || documento.webkitFullscreenElement) return true;
      const el = raiz(), pide = el.requestFullscreen || el.webkitRequestFullscreen;
      try { await pide.call(el, { navigationUI: 'hide' }); return true; }
      catch (err) { console.warn('HORIZONTAL: sin pantalla completa', err); return false; }
    }

    async function fijar() {
      if (!deCanto()) return 'ya-tumbada';
      if (!puedeFijar()) return 'sin-soporte';
      if (!(await completa())) return 'sin-pantalla-completa';
      try { await pantalla.orientation.lock('landscape'); return 'fijada'; }
      catch (err) { console.warn('HORIZONTAL: el navegador no fija el giro', err); return 'sin-fijar'; }
    }

    const lineas = () => (puedeFijar() ? [tr('Toca para jugar en horizontal'), tr('o gira el móvil')]
      : [tr('Gira el móvil para jugar'), tr('Si no cambia, quita el bloqueo de giro')]);

    return Object.freeze({ deCanto, puedeFijar, fijar, lineas });
  }

  const propio = typeof window === 'undefined' ? null : crea({ ventana: window, documento: document, pantalla: window.screen });
  return Object.freeze({
    crea, MARGEN,
    deCanto: () => propio.deCanto(),
    puedeFijar: () => propio.puedeFijar(),
    fijar: () => propio.fijar(),
    lineas: () => propio.lineas(),
  });
})();
