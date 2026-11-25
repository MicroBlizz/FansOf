// Fans of Asalto · DOMINIO · Lo que hacen fuera de las cifras del héroe los objetos de la tienda que llevan `efecto` (ajustes-objetos.js):
// en la partida (oro y esencia al ganar la oleada, invocar más barato, más comodines en el Altar y el gancho de la Brújula para las
// piedras de destino) y la lista de efectos que se lleva la batalla (la usa batalla-objetos.js). Puro: solo cuentas; el azar llega de fuera.
'use strict';
AS.objetos = (() => {
  // los efectos de los objetos comprados ([{ id, nivel }]) a su nivel: { carga: { v: 15, w: 0 }, oro: { v: 2, w: 0 }… }
  function efectos(datos, objetos) {
    const r = {};
    for (const o of (objetos || [])) {
      const d = datos.objetos[o.id];
      if (!d || !d.efecto) continue;
      const i = o.nivel - 1, antes = r[d.efecto] || { v: 0, w: 0 };
      r[d.efecto] = Object.freeze({ v: antes.v + d.v[i], w: antes.w + (d.w ? d.w[i] : 0) });
    }
    return Object.freeze(r);
  }
  const valor = (datos, objetos, k) => (efectos(datos, objetos)[k] || { v: 0 }).v;
  // el oro de más al ganar una oleada (Hucha rota)
  const oroAlGanar = (datos, objetos) => valor(datos, objetos, 'oro');
  // la esencia de más al ganar una oleada (Bolsa del avaro): 1 con su probabilidad. Sin el objeto no tira el dado
  function esenciaAlGanar(datos, objetos, azar) {
    const p = valor(datos, objetos, 'esencia');
    return p > 0 && azar() < p / 100 ? 1 : 0;
  }
  // lo que se rebaja invocar (Bastón del Altar): el Altar se encarga de que nunca cueste menos de 1
  const rebaja = (datos, objetos) => valor(datos, objetos, 'rebaja');
  // cuánto crece el peso de los comodines del Altar (Runa del comodín): 1.05 con un 5 %
  const comodines = (datos, objetos) => 1 + valor(datos, objetos, 'comodines') / 100;
  // el gancho de la Brújula del destino para las piedras: oleadas de plazo de más y la probabilidad (0 a 1) de que la piedra sea mejor
  function brujula(datos, objetos) {
    const e = efectos(datos, objetos).brujula;
    return Object.freeze({ plazo: e ? e.v : 0, mejor: e ? e.w / 100 : 0 });
  }
  return { efectos, oroAlGanar, esenciaAlGanar, rebaja, comodines, brujula };
})();
