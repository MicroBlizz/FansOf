// Tiny Fans · dominio · GIGANTE: el zapato. Recibe sus pisadas ya sorteadas [{ t, x, z, pasada }] y en cada paso dice qué pasa: la
// sombra que avisa (aviso + las décimas de gracia antes del pisotón, sin decirlo), el pisotón y cuándo se va. Si alcanza al becario lo
// dice alcanza() (el borde de la sombra no hace daño); el daño y el lanzamiento los aplica el becario. Nunca pisa el nido: lo asegura
// el sorteo (TN.mundo). Puro. Dueño: N3 (dominio de la expedición).
'use strict';
TN.Gigante = class Gigante {
  #pisadas;

  constructor(pisadas) { this.#pisadas = pisadas.map((p, i) => ({ id: i + 1, t: p.t, x: p.x, z: p.z, pasada: p.pasada || 0, avisada: false, pisada: false })); }
  static nuevo(reglas, pasadas) { return new Gigante(pasadas || []); }

  // ¿hay alguna sombra en el suelo? (la oferta de mejora espera a que pase)
  get hayAviso() { return this.#pisadas.some(p => p.avisada && !p.pisada); }
  // las sombras que hay en el suelo: [{ id, x, z, radio, falta }] (falta: segundos hasta el pisotón, con la gracia incluida)
  sombras(reglas, t) {
    return this.#pisadas.filter(p => p.avisada && !p.pisada).map(p => ({ id: p.id, x: p.x, z: p.z, radio: reglas.gigante.radio, falta: Math.max(0, p.t - t) }));
  }

  // lo que pasa a los t segundos: [{ que: 'aviso' | 'pisa' | 'se-va', x, z }]
  paso(reglas, t) {
    const g = reglas.gigante, fuera = [];
    for (const p of this.#pisadas) {
      if (!p.avisada && t >= p.t - g.aviso - g.gracia.segundos) { p.avisada = true; fuera.push({ que: 'aviso', x: p.x, z: p.z }); }
      if (!p.pisada && t >= p.t) {
        p.pisada = true;
        fuera.push({ que: 'pisa', x: p.x, z: p.z });
        if (this.#ultimaDe(p)) fuera.push({ que: 'se-va', x: p.x, z: p.z });
      }
    }
    return fuera;
  }
  #ultimaDe(p) { return this.#pisadas.every(o => o.pasada !== p.pasada || o.pisada); }

  // ¿el pisotón en (cx, cz) alcanza a quien está en (x, z)? El borde de la sombra no hace daño
  static alcanza(reglas, cx, cz, x, z) {
    const g = reglas.gigante;
    return Math.hypot(x - cx, z - cz) < g.radio * (1 - g.gracia.borde);
  }
};
