// Fans of Asalto · DOMINIO · Leer una partida guardada: repasa lo que viene del almacén (números, Altar, contadores, misiones,
// reliquias, premios por cobrar, equipo, piedras y anuncios) y devuelve los valores ya limpios, o un error; la partida (partida.js) solo
// los coloca. También da los contadores de una partida nueva y arregla la máquina y la dificultad que se le piden. Puro.
'use strict';
AS.guardado = (() => {
  const CUENTA = () => ({ lineas: 0, invocados: 0, ascensos: 0, dorados: 0, nivelMax: 1, bajas: 0, oroGanado: 0, oleadasGanadas: 0, jefes: 0,
    tiradas: 0, dobles: 0, rachaMax: 0, absorbidos: 0, limpias: 0, esencia: 0, piedras: 0, estallidos: 0 });
  const num = (v, min) => Number.isFinite(v) && v >= min;
  const ent = (v, min = 0) => (num(v, min) ? Math.floor(v) : min);
  // el Altar guardado vale si son 3 columnas de 5 runas conocidas; si no, se empieza sin tirada
  function altarValido(datos, a) {
    const vale = Array.isArray(a) && a.length === 3 && a.every(c => Array.isArray(c) && c.length === 5 && c.every(r => r === AS.altar.COMODIN || datos.clases[r]));
    return vale ? Object.freeze(a.map(c => Object.freeze(c.slice()))) : null;
  }
  function cuentaDe(j) {
    const c = CUENTA();
    for (const k in c) if (num(j.cuenta && j.cuenta[k], 0)) c[k] = Math.floor(j.cuenta[k]);
    return c;
  }
  function escalonesDe(misiones, j) {
    const e = {};
    for (const id of misiones) if (num(j.escalones && j.escalones[id], 0)) e[id] = Math.floor(j.escalones[id]);
    return e;
  }
  // la máquina y la dificultad que se piden, o las de siempre si no existen (el modo sin fin va en la primera dificultad)
  const maquina = (datos, id) => (datos.maquinas[id] ? id : 'altar');
  const dificultad = (datos, n, sinFin) => (!sinFin && datos.dificultades[n] ? n : 0);
  // los premios por cobrar de una oleada ganada (tarea #314). Un premio solo vale si es de una forma conocida y dentro de lo que da el juego:
  // la reliquia, con sus opciones que existen y no se tienen ya; el cofre, con oro y plumas dentro de sus topes; el botín del jefe, con sus
  // cifras de siempre. Lo que no vale se DESCARTA (se pierde ese premio, pero nunca se repite la oleada ni se cobra de más). Máximo uno de cada tipo
  const unicos = l => [...new Set(Array.isArray(l) ? l : [])];
  const tope = (v, max) => Math.min(ent(v), max);
  const PREMIO = {
    reliquia: (d, p, c) => { const opciones = unicos(p.opciones).filter(r => d.reliquias[r] && !c.reliquias.includes(r)).slice(0, 3); return opciones.length ? { tipo: 'reliquia', opciones } : null; },
    cofre: (d, p, c) => ({ tipo: 'cofre', oro: tope(p.oro, d.partida.oroCofre[1]), plumas: tope(p.plumas, AS.reglas.plumasDe(d, c.dif, d.partida.plumasCofre[1])) }),
    jefe: (d, p, c) => ({ tipo: 'jefe', oro: d.partida.oroJefe, plumas: AS.reglas.plumasDe(d, c.dif, d.partida.plumasJefe), objetos: d.partida.objetosJefe, jefe: typeof p.jefe === 'string' ? p.jefe : null }),
  };
  function premiosDe(datos, lista, ctx) {
    const hechos = {};
    for (const p of Array.isArray(lista) ? lista : []) {
      const hace = p && Object.keys(PREMIO).includes(p.tipo) && !hechos[p.tipo] && PREMIO[p.tipo];
      const v = hace && hace(datos, p, ctx);
      if (v) hechos[p.tipo] = v;
    }
    return Object.values(hechos);
  }
  // los valores de una partida guardada, limpios: AS.ok({ n, oro, vidas, equipo, piedras, anuncios… }) o un error ('partida-invalida' o
  // el del equipo). abiertos: los huecos del campo abiertos con las mejoras de la partida
  function lee(datos, j, abiertos) {
    if (!num(j.n, 1) || !num(j.oro, 0) || !num(j.vidas, 1) || !num(j.sigId, 1)) return AS.error('partida-invalida');
    const eq = AS.equipo.deJSON(datos, { ...j.equipo, abiertos });
    return eq.ok ? AS.ok({ ...valores(datos, j), equipo: eq.valor, piedras: AS.piedras.deJSON(datos, j.piedras), anuncios: AS.anuncios.deJSON(j.anuncios) }) : eq;
  }
  function valores(datos, j) {
    const misiones = AS.misiones.valida(datos, j.misiones), altar = altarValido(datos, j.altar), tiradas = ent(j.tiradas);
    const reliquias = (j.reliquias || []).filter(r => datos.reliquias[r]);
    return { n: ent(j.n), oro: ent(j.oro), vidas: ent(j.vidas), plumas: ent(j.plumas), sigId: ent(j.sigId), tiradas, gratis: !!j.gratis, empujones: ent(j.empujones),
      estallidos: ent(j.estallidos), altar, vivo: tiradas > 0 || (!!j.vivo && !!altar), cuenta: cuentaDe(j), racha: ent(j.racha), fallos: ent(j.fallos), misiones, escalones: escalonesDe(misiones, j),
      esencia: ent(j.esencia), reliquias, premios: j.fase === 'premio' ? premiosDe(datos, j.premios, { reliquias, dif: dificultad(datos, j.dificultad, j.sinFin) }) : [] };
  }
  return { CUENTA, altarValido, maquina, dificultad, premiosDe, lee };
})();
