// Fans of Asalto · DOMINIO · El azar que se le da al dominio: nunca tira de Math.random por su cuenta. AS.creaAzar(semilla) devuelve una
// función que da números de 0 a 1 (sin llegar a 1), siempre los mismos para la misma semilla, con atajos: entero, entre, elige, baraja
// y pesos (elegir una clave de una tabla { clave: peso }). Con una semilla fija, una partida entera se repite igual en los tests.
'use strict';
AS.creaAzar = semilla => {
  let a = (semilla >>> 0) || 1;
  const azar = () => {   // mulberry32
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  azar.entero = n => Math.floor(azar() * n);
  azar.entre = (min, max) => min + azar() * (max - min);
  azar.elige = lista => lista[azar.entero(lista.length)];
  azar.baraja = lista => { const l = lista.slice(); for (let i = l.length - 1; i > 0; i--) { const j = azar.entero(i + 1); [l[i], l[j]] = [l[j], l[i]]; } return l; };
  azar.pesos = tabla => {
    const claves = Object.keys(tabla).filter(k => tabla[k] > 0);
    let r = azar() * claves.reduce((s, k) => s + tabla[k], 0);
    for (const k of claves) { r -= tabla[k]; if (r < 0) return k; }
    return claves[claves.length - 1];
  };
  return azar;
};
