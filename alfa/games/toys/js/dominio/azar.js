// Fans of Toys · dominio · AZAR: el dominio no tira dados por su cuenta. TY.azar(estado) da un generador que, con el mismo número de
// partida, repite siempre la misma serie; `estado()` devuelve por dónde va, para guardarlo en la partida y seguir después.
'use strict';
TY.azar = semilla => {
  let a = semilla >>> 0;
  const uno = () => {   // un número en [0, 1) (mulberry32)
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const elige = lista => lista[Math.floor(uno() * lista.length)];
  return {
    uno, elige,
    estado: () => a >>> 0,
    entre: (min, max) => min + uno() * (max - min),
    pasa: probabilidad => uno() < probabilidad,
    // `cuantos` elementos distintos de la lista, en orden de salida
    varios(lista, cuantos) {
      const resto = lista.slice(), salen = [];
      while (resto.length && salen.length < cuantos) salen.push(resto.splice(Math.floor(uno() * resto.length), 1)[0]);
      return salen;
    },
    // uno de una lista de { p }, según su probabilidad
    segun(lista) {
      let tirada = uno();
      for (const cosa of lista) { tirada -= cosa.p; if (tirada < 0) return cosa; }
      return lista[lista.length - 1];
    },
  };
};
