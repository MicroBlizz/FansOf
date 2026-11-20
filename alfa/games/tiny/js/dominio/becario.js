// Tiny Fans · dominio · BECARIO: el becario y su batería (gasto por tiempo, batería roja, golpes, pilas, frenado por la tela y el río,
// lanzado por el pisotón). Puro: sin reloj ni pantalla; el paso de tiempo (dt) se le pasa. Dueño: N3 (dominio de la expedición).
'use strict';
TN.Becario = class Becario {
  #x; #z; #bateria; #max; #tela = 0; #telaFreno = 1;

  constructor(x, z, bateria, max) { this.#x = x; this.#z = z; this.#bateria = bateria; this.#max = max; }

  // nace en el nido (o donde se diga) con la batería llena (o la que se diga)
  static nuevo(reglas, x = reglas.mapa.nido.x, z = reglas.mapa.nido.z, bateria = reglas.becario.bateria) {
    return new Becario(x, z, Math.min(bateria, reglas.becario.bateria), reglas.becario.bateria);
  }

  get x() { return this.#x; }
  get z() { return this.#z; }
  get bateria() { return this.#bateria; }
  get max() { return this.#max; }
  get enTela() { return this.#tela > 0; }
  get cayo() { return this.#bateria <= 0; }

  // anda con el mando { mx, mz } (largo de 0 a 1) durante dt segundos; factor: lo que suman las mejoras; freno: el del suelo (río)
  anda(reglas, mx, mz, dt, factor = 1, freno = 1) {
    const largo = Math.hypot(mx, mz), k = largo > 1 ? 1 / largo : 1;
    const v = reglas.becario.velocidad * factor * freno * (this.#tela > 0 ? this.#telaFreno : 1) * dt;
    this.#tela = Math.max(0, this.#tela - dt);
    if (!largo) return;
    this.#pon(TN.mapa.mueve(reglas, this.#x, this.#z, this.#x + mx * k * v, this.#z + mz * k * v, reglas.becario.radio));
  }
  // otra forma de moverse (el asalto, con sus propios muebles): quien llama ya ha calculado dónde queda
  ponEn(p) { this.#pon(p); }
  #pon(p) { this.#x = p.x; this.#z = p.z; }

  // gasto por tiempo: dura = cuánto más dura la batería (mejoras); por debajo de la roja cuenta menos, sin decirlo
  gasta(reglas, dt, dura = 1) {
    const roja = reglas.becario.bateriaRoja;
    const g = reglas.becario.gastoPorSegundo * dt / dura * (this.#bateria < roja.desde ? roja.gasto : 1);
    this.#bateria = Math.max(0, this.#bateria - g);
  }
  // un golpe: devuelve la batería que queda
  golpe(dano) {
    this.#bateria = Math.max(0, this.#bateria - dano);
    return this.#bateria;
  }
  recarga(n) {
    this.#bateria = Math.min(this.#max, this.#bateria + n);
    return this.#bateria;
  }
  // la tela de la araña frena (freno) durante unos segundos
  pisaTela(segundos, freno) {
    this.#tela = segundos;
    this.#telaFreno = freno;
  }
  // el pisotón del zapato: quita lo suyo (nunca tumba de un golpe con más de noTumbaConMasDe) y lanza lejos del centro (cx, cz)
  pisoton(reglas, cx, cz) {
    const g = reglas.gigante;
    const queda = this.#bateria - g.dano;
    this.#bateria = this.#bateria > g.noTumbaConMasDe ? Math.max(1, queda) : Math.max(0, queda);
    const dx = this.#x - cx, dz = this.#z - cz, d = Math.hypot(dx, dz);
    const ux = d > 1e-6 ? dx / d : 1, uz = d > 1e-6 ? dz / d : 0;
    this.#pon(TN.mapa.mueve(reglas, this.#x, this.#z, this.#x + ux * g.lanza, this.#z + uz * g.lanza, reglas.becario.radio));
    return this.#bateria;
  }
};
