// Fans of Asalto · DOMINIO · Las cuentas sueltas de la partida, sin estado: los pesos de las runas del Altar con las mejoras y las
// reliquias, qué héroe llega con una línea de cada clase y con qué rareza, cuántas vidas cuesta una oleada y qué premios deja. Las usa partida.js.
'use strict';
AS.reglas = (() => {
  // mods de una partida a partir de las mejoras permanentes compradas ({ corazon: 2, bolsa: 1… })
  // y de las rarezas abiertas fuera (rarezas: cuántas hay abiertas por encima de Común, de 0 a 4)
  function mods(datos, mejoras, rarezas) {
    const m = mejoras || {}, n = k => Math.max(0, Math.min((datos.mejoras[k].coste || []).length, m[k] || 0));
    const abiertas = Math.max(0, Math.min(datos.rarezas.length - 1, Math.floor(rarezas) || 0));
    return Object.freeze({ vidas: n('corazon'), abiertos: datos.campo.abiertos + n('hueco'), oro: 3 * n('bolsa'), rarezas: abiertas, runa: n('runa'), empujones: n('palanca'), veterano: n('veterano') });
  }
  // los pesos de las runas: más comodines con la mejora «Runa tallada» y el doble con la reliquia «Runa comodín»
  function pesos(datos, m, reliquias) {
    const p = { ...datos.altar.pesos };
    p.comodin = (p.comodin + (m.runa || 0)) * (reliquias.includes('comodin') ? 2 : 1);
    return p;
  }
  // el héroe que llega con una línea de esa clase: entre los de la clase, según lo escaso que sea. La línea de comodines trae uno de
  // los muy escasos. Sin clase (el héroe con el que se empieza la partida): uno habitual cualquiera.
  function heroeDe(datos, clase, m, azar) {
    const tabla = {};
    if (!clase) return azar.elige(Object.keys(datos.heroes).filter(t => datos.heroes[t].escasez === 0));
    for (const tipo in datos.heroes) {
      const d = datos.heroes[tipo];
      const vale = clase === AS.altar.COMODIN ? d.escasez === 2 : d.clases.includes(clase);
      if (vale) tabla[tipo] = datos.altar.escasez[d.escasez];
    }
    return azar.pesos(tabla);
  }
  // las cifras propias con las que llega un héroe: vida y daño, cada una a su aire, de 1 % en 1 % dentro del margen
  function cifrasDe(datos, azar) {
    const m = datos.niveles.margen, una = () => 1 + (azar.entero(2 * m + 1) - m) / 100;
    return { vida: una(), dano: una() };
  }
  // la probabilidad de cada rareza con las que hay abiertas: [0.7, 0.2…] (las de candado, 0). Suman 1. La usa también el panel de suerte
  function probRarezas(datos, m) {
    const pesos = datos.rarezas.map((r, i) => (i <= (m.rarezas || 0) ? r.peso : 0)), total = pesos.reduce((a, b) => a + b, 0);
    return pesos.map(p => p / total);
  }
  // la rareza con la que llega un héroe (su número en datos.rarezas). Con todo cerrado, Común sin tirar el dado
  function rarezaDe(datos, m, azar) {
    if (!(m.rarezas > 0)) return 0;
    const tabla = {};
    probRarezas(datos, m).forEach((p, i) => { if (p > 0) tabla[i] = p; });
    return Number(azar.pesos(tabla));
  }
  // los empujones de cada oleada: los del Altar, más o menos los de la máquina elegida, las mejoras y la reliquia
  const empujones = (datos, m, reliquias, maquina) => Math.max(0, datos.altar.empujones + ((datos.maquinas[maquina] || {}).empujones || 0)) + (m.empujones || 0) + (reliquias.includes('palanca') ? 1 : 0);
  const estallidos = (datos, maquina) => (datos.maquinas[maquina] || {}).estallidos || 0;
  // las plumas con la dificultad: las de la oleada y las de los premios (cofre y jefe) se multiplican
  const plumasDe = (datos, dif, n) => Math.round(n * (datos.dificultades[dif] || datos.dificultades[0]).plumas);
  const premiosDe = (datos, dif, lista) => lista.map(p => (p.plumas ? { ...p, plumas: plumasDe(datos, dif, p.plumas) } : p));
  // las vidas que cuesta una oleada. Perder una normal cuesta una vida justa (y se repite); ganarla, una por enemigo que cruza, con un
  // tope. En las de élite y jefe no hay tope (y perderlas acaba la partida)
  function vidasPerdidas(datos, tipo, res) {
    const P = datos.partida, n = res.cruzados + (res.gano ? 0 : P.vidasPorPerder);
    if (tipo === 'normal' && !res.gano) return P.vidasPorPerder;
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
  // el héroe que llega del Altar. llegada: { clase (sin clase, el del arranque: Común), nivel, dorado, piedra (sube su rareza) };
  // primero: si es el primero de la partida (le suma la mejora «veterano»); id: lo pone la partida
  function heroeNuevo(datos, m, reliquias, primero, id, llegada, azar) {
    const { clase, dorado, piedra } = llegada;
    let niv = llegada.nivel;
    if (!dorado && primero) niv += m.veterano;
    if (!dorado && reliquias.includes('eco') && azar() < 0.25) niv += 1;
    const tipo = heroeDe(datos, clase, m, azar), base = clase ? rarezaDe(datos, m, azar) : 0;
    const rareza = piedra ? AS.piedras.rareza(datos, m.rarezas, base, piedra) : base;
    return AS.heroe.conCifras(datos, AS.heroe.crea(datos, id, tipo, niv, dorado, rareza).valor, cifrasDe(datos, azar)).valor;
  }
  return { mods, pesos, heroeDe, cifrasDe, heroeNuevo, probRarezas, rarezaDe, empujones, estallidos, plumasDe, premiosDe, vidasPerdidas, premios, tresReliquias, oroDeGanar, interes };
})();
