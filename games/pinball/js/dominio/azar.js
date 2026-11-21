// Fans of Pinball · dominio · AZAR: el dominio no tira dados por su cuenta. PB.azar(semilla) da un generador que, con la misma semilla,
// repite siempre la misma serie: así una partida se puede repetir en un test o con un robot. La semilla la pone quien crea la partida.
'use strict';
PB.azar = semilla => {
  let a = semilla >>> 0;
  // un número en [0, 1) (mulberry32)
  const uno = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    uno,
    entre: (min, max) => min + uno() * (max - min),                    // un número en [min, max)
    entero: (min, max) => min + Math.floor(uno() * (max - min + 1)),   // un entero de min a max, los dos incluidos
    elige: lista => lista[Math.floor(uno() * lista.length)],
    pasa: probabilidad => uno() < probabilidad,
  };
};
