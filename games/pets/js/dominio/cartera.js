// Fans Of Pets · dominio · CARTERA: los saldos de las dos monedas de la serie en Pets, Tickets restaurante (la ganada: solo sale de jugar) y
// Bonus (la comprada: con euros o cambiando Tickets, nunca al revés). Un agregado aparte de la partida: el dinero sobrevive a la criatura,
// a otro huevo y a reiniciar. Solo guarda enteros que no bajan de cero; los nombres, el ratio y el puente ganada → comprada son de core
// (MONEDAS, docs/core/MONEDAS.md): aquí solo se ingresa, se paga y se lee. Quién paga qué lo deciden los casos de uso.
'use strict';
PT.MONEDAS = ['ganada', 'comprada'];
PT.Cartera = class Cartera {
  #saldo = { ganada: 0, comprada: 0 };

  constructor(saldo) { if (saldo) this.#saldo = { ...saldo }; }

  static nueva() { return new Cartera(); }
  // Resultado: la cartera guardada, o 'cartera-invalida' (algo que no sea un entero de cero para arriba). Lo que falte, a cero
  static desdeJson(j) {
    if (!j || typeof j !== 'object') return PT.error('cartera-invalida');
    const saldo = {};
    for (const k of PT.MONEDAS) {
      const n = j[k] === undefined ? 0 : j[k];
      if (!Cartera.#cantidad(n, 0)) return PT.error('cartera-invalida', { moneda: k });
      saldo[k] = n;
    }
    return PT.ok(new Cartera(saldo));
  }
  static #cantidad(n, minimo) { return Number.isInteger(n) && n >= minimo; }

  aJson() { return { ...this.#saldo }; }
  saldo(cual) { return this.#saldo[cual] || 0; }

  // entra dinero (un premio, la nómina). Resultado: el saldo nuevo, o 'moneda-desconocida' / 'cantidad-invalida' (n entero de 1 para arriba)
  ingresa(cual, n) {
    if (!PT.MONEDAS.includes(cual)) return PT.error('moneda-desconocida', { moneda: cual });
    if (!Cartera.#cantidad(n, 1)) return PT.error('cantidad-invalida', { n });
    this.#saldo[cual] += n;
    return PT.ok(this.#saldo[cual]);
  }
  // sale dinero (una compra). Resultado: el saldo nuevo, o 'moneda-desconocida' / 'cantidad-invalida' / 'sin-saldo'
  paga(cual, n) {
    if (!PT.MONEDAS.includes(cual)) return PT.error('moneda-desconocida', { moneda: cual });
    if (!Cartera.#cantidad(n, 1)) return PT.error('cantidad-invalida', { n });
    if (this.#saldo[cual] < n) return PT.error('sin-saldo', { moneda: cual, falta: n - this.#saldo[cual] });
    this.#saldo[cual] -= n;
    return PT.ok(this.#saldo[cual]);
  }
  // deja el saldo en n: es la puerta que core (MONEDAS.escribir) usa al cambiar ganada por comprada. Resultado: ok, o los errores de arriba
  fija(cual, n) {
    if (!PT.MONEDAS.includes(cual)) return PT.error('moneda-desconocida', { moneda: cual });
    if (!Cartera.#cantidad(n, 0)) return PT.error('cantidad-invalida', { n });
    this.#saldo[cual] = n;
    return PT.ok(n);
  }
};
