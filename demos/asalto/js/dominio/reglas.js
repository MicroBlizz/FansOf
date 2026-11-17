// Fans of Asalto · DOMINIO · Las cuentas sueltas de la partida, sin estado: los pesos de las runas del Altar con las mejoras y las
// reliquias, qué héroe llega con una línea de cada clase, cuántas vidas cuesta una oleada y qué premios deja. Las usa partida.js.
'use strict';
AS.reglas = (() => {
  // mods de una partida a partir de las mejoras permanentes compradas ({ corazon: 2, bolsa: 1… })
  function mods(datos, mejoras) {
    const m = mejoras || {}, n = k => Math.max(0, Math.min((datos.mejoras[k].coste || []).length, m[k] || 0));
    return Object.freeze({ vidas: n('corazon'), abiertos: datos.campo.abiertos + n('hueco'), oro: 3 * n('bolsa'), llamada: n('llamada'), runa: n('runa'), empujones: n('palanca'), veterano: n('veterano') });
  }
  // los pesos de las runas: más comodines con la mejora «Runa tallada» y el doble con la reliquia «Runa comodín»
  function pesos(datos, m, reliquias) {
    const p = { ...datos.altar.pesos };
    p.comodin = (p.comodin + (m.runa || 0)) * (reliquias.includes('comodin') ? 2 : 1);
    return p;
  }
  // el héroe que llega con una línea de esa clase: entre los de la clase, según su rareza. La línea de comodines trae un épico.
  // Sin clase (el héroe con el que se empieza la partida): uno común cualquiera.
  function heroeDe(datos, clase, m, azar) {
    const tabla = {};
    if (!clase) return azar.elige(Object.keys(datos.heroes).filter(t => datos.heroes[t].rareza === 0));
    for (const tipo in datos.heroes) {
      const d = datos.heroes[tipo];
      const vale = clase === AS.altar.COMODIN ? d.rareza === 2 : d.clases.includes(clase);
      if (vale) tabla[tipo] = datos.altar.rareza[d.rareza] * (d.rareza > 0 ? 1 + 0.25 * (m.llamada || 0) : 1);
    }
    return azar.pesos(tabla);
  }
  const empujones = (datos, m, reliquias) => datos.altar.empujones + (m.empujones || 0) + (reliquias.includes('palanca') ? 1 : 0);
  // las vidas que cuesta una oleada: una por enemigo que cruza y las de perderla; en una normal hay un tope
  function vidasPerdidas(datos, tipo, res) {
    const P = datos.partida, n = res.cruzados + (res.gano ? 0 : P.vidasPorPerder);
    return tipo === 'normal' ? Math.min(P.topeVidasOleada, n) : n;
  }
  const entero = (azar, [a, b]) => a + azar.entero(b - a + 1);
  // los premios que deja una oleada GANADA: [{ tipo: 'cofre' | 'reliquia' | 'jefe', … }]
  function premios(datos, oleada, reliquias, azar) {
    const P = datos.partida, lista = [];
    if (oleada.tipo === 'elite') lista.push({ tipo: 'cofre', oro: entero(azar, P.oroCofre), plumas: entero(azar, P.plumasCofre) });
    if (oleada.tipo === 'jefe') lista.push({ tipo: 'jefe', oro: P.oroJefe, plumas: P.plumasJefe, objetos: P.objetosJefe, jefe: oleada.jefe });
    if (oleada.tipo !== 'jefe' && oleada.n % P.reliquiaCada === 0) { const r = tresReliquias(datos, reliquias, azar); if (r.length) lista.push({ tipo: 'reliquia', opciones: r }); }
    return lista;
  }
  const tresReliquias = (datos, reliquias, azar) => azar.baraja(Object.keys(datos.reliquias).filter(k => !reliquias.includes(k))).slice(0, 3);
  // el oro de ganar la oleada
  function oroDeGanar(datos, oleada, reliquias) {
    const P = datos.partida;
    return P.oroOleada(oleada.n) + (oleada.tipo === 'elite' ? P.oroElite : 0) + (reliquias.includes('hucha') ? 3 : 0);
  }
  const interes = (reliquias, oro) => (reliquias.includes('interes') ? Math.min(5, Math.floor(oro / 5)) : 0);
  return { mods, pesos, heroeDe, empujones, vidasPerdidas, premios, tresReliquias, oroDeGanar, interes };
})();
