// Fans Of Mining · dominio · PLANTA: una planta del sótano, una rejilla de columnas × filas bloques. Se crea con su número, el azar que
// le pasan (una función que da números de 0 a 1) y los bonos; cada bloque es un material con su vida. Golpear quita vida; un bloque a
// cero se rompe y suelta su botín. La planta está limpia al romper la parte AJ.planta.limpia de sus bloques.
'use strict';
MN.planta = (() => {
  const AJ = MN.AJ, C = MN.curvas;
  const total = () => AJ.planta.columnas * AJ.planta.filas;

  // las plantas especiales se encadenan: solo una planta dorada puede pasar a arcoíris (B.arcoiris es la parte de las doradas)
  function especialDe(azar, B) {
    if (azar() >= B.dorada) return 'normal';
    return azar() < B.arcoiris ? 'arcoiris' : 'dorada';
  }
  // expedientes: { indice de material: rotos de toda la vida }; su rango baja la vida del bloque
  function bloqueDe(n, azar, expedientes) {
    const [a, b, parteB] = C.materialesDe(n);
    const m = azar() < parteB ? b : a;
    const rango = C.rangoExpediente(expedientes[m] || 0);
    const vida = Math.max(1, Math.round(C.vidaMaterial(m, n) * AJ.expediente.vida[rango]));
    return { m, vida, max: vida };
  }
  function crea(n, azar, B, expedientes) {
    const bloques = [];
    for (let i = 0; i < total(); i++) bloques.push(bloqueDe(n, azar, expedientes));
    return { n, bloques, rotos: 0, especial: especialDe(azar, B) };
  }
  const objetivo = () => Math.ceil(total() * AJ.planta.limpia);
  const limpia = p => p.rotos >= objetivo();
  // el primer bloque vivo (el que pica el líder), o -1
  const primerVivo = p => p.bloques.findIndex(b => b && b.vida > 0);
  const vivos = p => p.bloques.reduce((acc, b, i) => (b && b.vida > 0 ? acc.concat(i) : acc), []);

  // golpea el bloque i con d de daño. Resultado: MN.ok({ roto, m }) o MN.error('sin-bloque')
  function golpea(p, i, d) {
    const b = p.bloques[i];
    if (!b || b.vida <= 0) return MN.error('sin-bloque', { i });
    b.vida = Math.max(0, b.vida - d);
    if (b.vida > 0) return MN.ok({ roto: false, m: b.m, i });
    p.rotos++;
    return MN.ok({ roto: true, m: b.m, i });
  }
  // multiplicador del botín de la planta
  const multiPlanta = p => (p.especial === 'arcoiris' ? AJ.especiales.arcoirisMulti : p.especial === 'dorada' ? AJ.especiales.doradaMulti : 1);

  return { crea, golpea, limpia, primerVivo, vivos, objetivo, multiPlanta, total };
})();
