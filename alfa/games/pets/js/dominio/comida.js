// Fans Of Pets · dominio · COMIDA: el minijuego de darle de comer con la cuchara (docs/pets/cuidados-minijuegos.md). Un bol con una ración de
// bocados y una cuchara que se llena en el bol y se vacía en la boca. Solo reglas: no sabe de pantalla, gestos ni del cuidado (eso es del caso
// de uso). Resultados con nombre: 'bol-vacio', 'ya-llena', 'cuchara-vacia'.
'use strict';
PT.Comida = class Comida {
  #total;
  #quedan;
  #llena = false;

  constructor(total) { this.#total = total; this.#quedan = total; }

  // Resultado: la comida, o 'bocados-invalidos' (la ración es un entero de 1 para arriba)
  static nueva(bocados) {
    return Number.isInteger(bocados) && bocados >= 1 ? PT.ok(new Comida(bocados)) : PT.error('bocados-invalidos', { bocados });
  }

  get quedan() { return this.#quedan; }
  get nivelBol() { return this.#quedan / this.#total; }   // 1 lleno, 0 vacío
  get cucharaLlena() { return this.#llena; }
  get terminada() { return this.#quedan === 0 && !this.#llena; }

  // la cuchara toca la comida del bol. Resultado: ok, 'bol-vacio' o 'ya-llena'
  llenaCuchara() {
    if (this.#llena) return PT.error('ya-llena');
    if (this.#quedan === 0) return PT.error('bol-vacio');
    this.#llena = true;
    return PT.ok(true);
  }
  // la cuchara llena llega a la boca. Resultado: { quedan, termina } o 'cuchara-vacia'
  daBocado() {
    if (!this.#llena) return PT.error('cuchara-vacia');
    this.#llena = false;
    this.#quedan--;
    return PT.ok({ quedan: this.#quedan, termina: this.#quedan === 0 });
  }
};
