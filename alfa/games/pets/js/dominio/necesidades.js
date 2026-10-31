// Fans Of Pets · dominio · NECESIDADES: hambre, sed, sueño, limpieza y diversión, cada una entre 0 (fatal) y 100 (perfecta).
// Es un value object: no cambia; cada cuidado o minuto de vida devuelve otras Necesidades. Nunca puede tener un valor fuera de 0..100.
'use strict';
PT.Necesidades = class Necesidades {
  static CLAVES = ['hambre', 'sed', 'sueno', 'limpieza', 'diversion'];
  #v;

  constructor(valores) {
    this.#v = Object.freeze({ ...valores });
    Object.freeze(this);
  }

  // Resultado: las Necesidades, o 'necesidad-invalida' si falta una, no es un número o se sale de 0..100
  static crear(valores) {
    if (!valores || typeof valores !== 'object') return PT.error('necesidad-invalida');
    const v = {};
    for (const k of Necesidades.CLAVES) {
      const n = valores[k];
      if (typeof n !== 'number' || !Number.isFinite(n) || n < 0 || n > 100) return PT.error('necesidad-invalida', { clave: k });
      v[k] = n;
    }
    return PT.ok(new Necesidades(v));
  }

  de(clave) { return this.#v[clave]; }

  // otras Necesidades con una sumada (o restada), sin salirse de 0..100
  con(clave, delta) {
    const n = this.#v[clave] + delta;
    return new Necesidades({ ...this.#v, [clave]: n < 0 ? 0 : n > 100 ? 100 : n });
  }

  // otras Necesidades restando a cada una lo que diga gasto (por clave; negativo recupera)
  gasta(gasto) {
    let out = this;
    for (const k in gasto) out = out.con(k, -gasto[k]);
    return out;
  }

  // ¿todas las claves dadas están en minimo o más?
  todasAlMenos(claves, minimo) { return claves.every(k => this.#v[k] >= minimo); }

  // ¿alguna de las claves dadas está por debajo de umbral?
  algunaPorDebajo(claves, umbral) { return claves.some(k => this.#v[k] < umbral); }

  aJson() { return { ...this.#v }; }
};
