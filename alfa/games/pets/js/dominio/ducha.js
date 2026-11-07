// Fans Of Pets · dominio · DUCHA: el minijuego de frotar con espuma y aclarar (docs/pets/cuidados-minijuegos.md). El cuerpo se divide en zonas;
// cada una acumula espuma (de 0 a 1) al frotarla. Con la fracción pedida de zonas cubiertas se pasa a aclarar, y el agua quita la espuma hasta
// que todo queda limpio. Fases: 'frotar', 'aclarar' y 'limpia'. Solo reglas, sin pantalla ni reloj: quien juega dice cuánto frota o aclara.
// Resultados con nombre: 'zona-desconocida', 'cantidad-invalida', 'fase-incorrecta'.
'use strict';
PT.Ducha = class Ducha {
  #espuma = {};
  #cubierta;
  #limpia;
  #fase = 'frotar';

  constructor(zonas, cubierta, limpia) {
    for (const z of zonas) this.#espuma[z] = 0;
    this.#cubierta = cubierta;
    this.#limpia = limpia;
  }

  // zonas: nombres (al menos una); cubierta: fracción de zonas llenas para aclarar (de 0 a 1, sin el 0); limpia: espuma que ya cuenta como limpio (de 0 a 1)
  // Resultado: la ducha, o 'ducha-invalida'
  static nueva(zonas, { cubierta, limpia }) {
    const bien = Array.isArray(zonas) && zonas.length > 0 && new Set(zonas).size === zonas.length && cubierta > 0 && cubierta <= 1 && limpia >= 0 && limpia < 1;
    return bien ? PT.ok(new Ducha(zonas, cubierta, limpia)) : PT.error('ducha-invalida');
  }

  get fase() { return this.#fase; }
  get terminada() { return this.#fase === 'limpia'; }
  get zonas() { return Object.keys(this.#espuma); }
  espuma(zona) { return this.#espuma[zona] ?? 0; }

  #comprueba(zona, cantidad, fase) {
    if (!(zona in this.#espuma)) return PT.error('zona-desconocida', { zona });
    if (!(cantidad > 0) || !Number.isFinite(cantidad)) return PT.error('cantidad-invalida', { cantidad });
    return this.#fase === fase ? null : PT.error('fase-incorrecta', { fase: this.#fase });
  }
  // se frota una zona: suma espuma hasta 1. Resultado: la espuma de la zona, o 'fase-incorrecta' (ya se aclara)
  frota(zona, cantidad) {
    const mal = this.#comprueba(zona, cantidad, 'frotar');
    if (mal) return mal;
    this.#espuma[zona] = Math.min(1, this.#espuma[zona] + cantidad);
    if (this.#cubiertas() >= Math.ceil(this.zonas.length * this.#cubierta)) this.#fase = 'aclarar';
    return PT.ok(this.#espuma[zona]);
  }
  #cubiertas() { return this.zonas.filter(z => this.#espuma[z] >= 1).length; }
  // el agua cae sobre una zona: quita espuma. Resultado: la espuma que queda, o 'fase-incorrecta' (aún no hay que aclarar)
  aclara(zona, cantidad) {
    const mal = this.#comprueba(zona, cantidad, 'aclarar');
    if (mal) return mal;
    this.#espuma[zona] = Math.max(0, this.#espuma[zona] - cantidad);
    if (this.#espuma[zona] <= this.#limpia) this.#espuma[zona] = 0;
    if (this.zonas.every(z => this.#espuma[z] === 0)) this.#fase = 'limpia';
    return PT.ok(this.#espuma[zona]);
  }
};
