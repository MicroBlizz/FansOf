// Tiny Fans · dominio · NIDO · REJILLA: las casillas (6x6 en el nido propio, 8x8 en el abandonado) y qué pieza hay en cada una.
// Solo guarda y consulta: las reglas (pagar, tope, camino) son del nido. Puro. Dueño: N3 (reglas).
'use strict';
TN.Rejilla = class Rejilla {
  #columnas; #filas; #casillas = new Map();

  constructor(columnas, filas) { this.#columnas = columnas; this.#filas = filas; }
  static nueva(columnas, filas) { return new Rejilla(columnas, filas); }

  get columnas() { return this.#columnas; }
  get filas() { return this.#filas; }
  dentro(col, fila) { return Number.isInteger(col) && Number.isInteger(fila) && col >= 0 && fila >= 0 && col < this.#columnas && fila < this.#filas; }
  #clave(col, fila) { return col + ',' + fila; }
  // la pieza de esa casilla ({ pieza, col, fila, …datos }, en copia) o null
  en(col, fila) {
    const p = this.#casillas.get(this.#clave(col, fila));
    return p ? { ...p } : null;
  }
  pon(col, fila, pieza, datos = {}) { this.#casillas.set(this.#clave(col, fila), { ...datos, pieza, col, fila }); }
  quita(col, fila) { this.#casillas.delete(this.#clave(col, fila)); }
  // todas las piezas, por filas y columnas: [{ pieza, col, fila, … }]
  get piezas() {
    return [...this.#casillas.values()].map(p => ({ ...p })).sort((a, b) => a.fila - b.fila || a.col - b.col);
  }
  copia() {
    const r = new Rejilla(this.#columnas, this.#filas);
    for (const p of this.#casillas.values()) r.#casillas.set(this.#clave(p.col, p.fila), { ...p });
    return r;
  }
};
