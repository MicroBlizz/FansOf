// Tiny Fans · dominio · VOLTIOS Y MEJORAS: la barra de voltios (10, 15, 20…), la oferta de 3 mejoras y sus niveles (hasta 3), que solo
// duran la expedición. Sorteo (P4): salen 3 al azar entre las que no están al máximo, y la que se quedó fuera sale seguro la vez
// siguiente. Puro: el azar se le pasa. Dueño: N3 (dominio de la expedición).
'use strict';
TN.Mejoras = class Mejoras {
  #r; #voltios = 0; #meta; #pendientes = 0; #niveles = {}; #oferta = null; #fuera = null;

  constructor(reglas) {
    this.#r = reglas;
    this.#meta = reglas.voltios.primera;
    for (const id of Object.keys(reglas.mejoras.lista)) this.#niveles[id] = 0;
  }
  static nuevas(reglas) { return new Mejoras(reglas); }

  get voltios() { return this.#voltios; }
  get meta() { return this.#meta; }
  get pendientes() { return this.#pendientes; }
  get oferta() { return this.#oferta ? this.#oferta.slice() : null; }
  get niveles() { return { ...this.#niveles }; }
  get cuantas() { return Object.values(this.#niveles).reduce((s, n) => s + n, 0); }
  #nivel(id) { return this.#niveles[id] || 0; }

  // LOS EFECTOS de lo elegido hasta ahora
  get grapas() { return 1 + this.#nivel('grapa-doble') * this.#r.mejoras.lista['grapa-doble'].grapas; }
  get dano() { return this.#r.arma.grapadora.dano + this.#nivel('punta-afilada') * this.#r.mejoras.lista['punta-afilada'].dano; }
  get velocidad() { return 1 + this.#nivel('cafe-cargado') * this.#r.mejoras.lista['cafe-cargado'].velocidad; }
  get dura() { return 1 + this.#nivel('pila-repuesto') * this.#r.mejoras.lista['pila-repuesto'].dura; }

  // suma voltios; cada vez que se llena la barra queda una mejora pendiente y la meta sube. Devuelve { tiene, meta }
  suma(v) {
    this.#voltios += v;
    while (this.#voltios >= this.#meta) {
      this.#voltios -= this.#meta;
      this.#meta += this.#r.voltios.masPorMejora;
      this.#pendientes += 1;
    }
    return { tiene: this.#voltios, meta: this.#meta };
  }

  // las que aún pueden subir
  get #abiertas() { return Object.keys(this.#niveles).filter(id => this.#niveles[id] < this.#r.mejoras.niveles); }

  // saca la oferta de una pendiente. Resultado: ok(oferta) o error('sin-pendientes' | 'ya-ofrecida' | 'todas-al-maximo')
  ofrece(azar) {
    if (this.#oferta) return TN.error('ya-ofrecida');
    if (!this.#pendientes) return TN.error('sin-pendientes');
    const abiertas = this.#abiertas;
    if (!abiertas.length) { this.#pendientes = 0; return TN.error('todas-al-maximo'); }
    const oferta = this.#fuera && abiertas.includes(this.#fuera) ? [this.#fuera] : [];
    const resto = abiertas.filter(id => !oferta.includes(id));
    while (oferta.length < this.#r.voltios.ofrece && resto.length) oferta.push(resto.splice(Math.floor(azar.uno() * resto.length), 1)[0]);
    this.#fuera = resto.length ? resto[Math.floor(azar.uno() * resto.length)] : null;
    this.#oferta = oferta;
    return TN.ok(oferta.slice());
  }

  // elige una de la oferta. Resultado: ok(nivel) o error('no-toca' | 'mejora-desconocida')
  elige(id) {
    if (!this.#oferta) return TN.error('no-toca');
    if (!this.#oferta.includes(id)) return TN.error('mejora-desconocida', { id });
    this.#niveles[id] += 1;
    this.#oferta = null;
    this.#pendientes -= 1;
    return TN.ok(this.#niveles[id]);
  }
};
