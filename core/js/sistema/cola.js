// Fans Of · COLA SIN CONEXIÓN: lo que un juego tiene que mandar al servidor se apunta en una cola guardada en su partida y se manda en
// cuanto se puede, sin bloquear al jugador. Lo que falla por red se reintenta (al llamar a envia() y al volver la conexión); lo que el
// servidor rechaza para siempre se descarta. Core no sabe qué se manda: cada juego le pasa dónde guarda la cola, cómo se envía y qué
// errores no tienen arreglo. Guía: docs/guia/core/cola.md. Pruebas: tests/core/cola.test.mjs.
'use strict';
const COLA = (() => {
  // op: {
  //   lista()             el array guardado en la partida del juego (lo crea si no existe)
  //   guarda()            guarda la partida
  //   envia(cosa)         promesa: manda una al servidor (lanza si falla)
  //   definitivo(error)   true si ese error no se arregla reintentando: la cosa se descarta
  //   arregla?(cosa, error)  promesa opcional: true si ha arreglado la causa y se puede probar otra vez (una sola vez por cosa)
  // }
  function crea(op) {
    let enviando = null;
    async function mandaUna(cosa) {
      try { await op.envia(cosa); return 'hecha'; } catch (e) {
        if (!op.arregla) return op.definitivo(e) ? 'perdida' : 'espera';
        try {   // si arreglar falla (sin red, por ejemplo), cuenta su error
          if (!await op.arregla(cosa, e)) return op.definitivo(e) ? 'perdida' : 'espera';
          await op.envia(cosa); return 'hecha';
        } catch (e2) { return op.definitivo(e2) ? 'perdida' : 'espera'; }
      }
    }
    async function vacia() {
      const l = op.lista();
      while (l.length) {
        if (await mandaUna(l[0]) === 'espera') return false;   // sin red: se reintenta más tarde
        l.shift(); op.guarda();
      }
      return true;
    }
    // Manda lo pendiente; si ya se está mandando, espera a eso. Devuelve true si la cola ha quedado vacía.
    function envia() {
      if (!enviando) enviando = vacia().finally(() => { enviando = null; });
      return enviando;
    }
    function pon(cosa) { op.lista().push(cosa); op.guarda(); return envia(); }
    if (typeof window !== 'undefined' && window.addEventListener) window.addEventListener('online', () => { envia(); });
    return { pon, envia, get pendientes() { return op.lista().length; } };
  }
  return { crea };
})();
if (typeof module !== 'undefined') module.exports = COLA;
