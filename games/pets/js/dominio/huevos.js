// Fans Of Pets · dominio · HUEVOS: el azar con semilla y la elección de los huevos misteriosos. Puro: la semilla decide, así que
// los mismos huevos salen siempre para la misma semilla (y no hace falta guardar las respuestas de la entrevista).
'use strict';
PT.huevos = {
  // FNV-1a de 32 bits: de un texto, un número que sirve de semilla
  hash(texto) {
    let h = 2166136261;
    for (let i = 0; i < texto.length; i++) {
      h ^= texto.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  },

  // mulberry32: devuelve una función que da números entre 0 y 1, siempre los mismos para la misma semilla
  azar(semilla) {
    let a = semilla >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  },

  // n criaturas de facciones distintas, al azar con la semilla. criaturas: [{ id, fac }]; facciones: el orden de las facciones
  elige(semilla, criaturas, facciones, n) {
    const r = PT.huevos.azar(semilla), facs = facciones.slice(), out = [];
    for (let i = facs.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [facs[i], facs[j]] = [facs[j], facs[i]];
    }
    for (const fac of facs.slice(0, n)) {
      const de = criaturas.filter(c => c.fac === fac);
      out.push(de[Math.floor(r() * de.length)].id);
    }
    return out;
  },
};
