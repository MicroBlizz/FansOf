// Fans of Island · dominio/medidas: las medidas del escenario (bloque, fondo, carril) y el ruido determinista que usan el nivel y el arte.
// Puro: el mismo (a, b, c) da siempre el mismo número.
'use strict';
IS.MEDIDAS = Object.freeze({ T: 32, D: 56, CARRIL: 30 });   // bloque de 32, suelo de 56 de fondo, los personajes van por el carril 30
IS.ruido = (a, b, c) => {   // número entre 0 y 1 siempre igual para los mismos a, b, c (detalles del escenario)
  let n = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663) ^ Math.imul(c | 0, 83492791)) >>> 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177); n ^= n >>> 16;
  return (n >>> 0) / 4294967296;
};
