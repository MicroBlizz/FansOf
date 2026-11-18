// Fans of Spy · DOMINIO · La baraja del agente: el mazo (boca abajo), la mano y el descarte. Robar hasta el tope de la mano;
// si el mazo se acaba, el descarte se baraja y vuelve a ser el mazo (quien llama cobra el coste de rebarajar). El azar se le pasa.
'use strict';
var SPY = globalThis.SPY || (globalThis.SPY = {});
(function (S) {
  // Una copia barajada (Fisher-Yates) con el azar que se pasa: una función que da un número de 0 a 1.
  function barajar(lista, azar) {
    const b = lista.slice();
    for (let i = b.length - 1; i > 0; i--) {
      const j = Math.floor(azar() * (i + 1));
      [b[i], b[j]] = [b[j], b[i]];
    }
    return b;
  }

  // Una baraja nueva. Con `azar` sale barajada; sin él, en el orden dado (la mano preparada del tutorial).
  const nueva = (cartas, azar) => ({ mazo: azar ? barajar(cartas, azar) : cartas.slice(), mano: [], descarte: [] });

  // Roba hasta `n` cartas sin pasar de `tope` en la mano. Devuelve las robadas y cuántas veces hubo que rebarajar.
  function roba(b, n, tope, azar) {
    const robadas = [];
    let rebarajadas = 0;
    for (let i = 0; i < n && b.mano.length < tope; i++) {
      if (!b.mazo.length) {
        if (!b.descarte.length) break;
        b.mazo = barajar(b.descarte, azar); b.descarte = []; rebarajadas++;
      }
      const carta = b.mazo.shift();
      b.mano.push(carta); robadas.push(carta);
    }
    return { robadas, rebarajadas };
  }

  // Saca de la mano la carta del hueco `i` y la deja en el descarte. Devuelve su id (o undefined si no hay carta ahí).
  function gasta(b, i) {
    if (!Number.isInteger(i) || i < 0 || i >= b.mano.length) return undefined;
    const [carta] = b.mano.splice(i, 1);
    b.descarte.push(carta);
    return carta;
  }

  S.baraja = Object.freeze({ barajar, nueva, roba, gasta });
})(SPY);
