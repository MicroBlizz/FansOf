// Fans of Asalto · DOMINIO · Leer una partida guardada: repasa lo que viene del almacén (números, Altar, contadores, misiones,
// reliquias) y devuelve los valores ya limpios, o un error; la partida (partida.js) solo los coloca. También da los contadores de una
// partida nueva y arregla la máquina y la dificultad que se le piden. Puro.
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
  // los valores de una partida guardada, limpios: AS.ok({ n, oro, vidas… }) o AS.error('partida-invalida')
  function lee(datos, j) {
    if (!num(j.n, 1) || !num(j.oro, 0) || !num(j.vidas, 1) || !num(j.sigId, 1)) return AS.error('partida-invalida');
    const misiones = AS.misiones.valida(datos, j.misiones), altar = altarValido(datos, j.altar), tiradas = ent(j.tiradas);
    return AS.ok({ n: ent(j.n), oro: ent(j.oro), vidas: ent(j.vidas), plumas: ent(j.plumas), sigId: ent(j.sigId), tiradas, gratis: !!j.gratis, empujones: ent(j.empujones),
      estallidos: ent(j.estallidos), altar, vivo: tiradas > 0 || (!!j.vivo && !!altar), cuenta: cuentaDe(j), racha: ent(j.racha), fallos: ent(j.fallos), misiones, escalones: escalonesDe(misiones, j),
      esencia: ent(j.esencia), reliquias: (j.reliquias || []).filter(r => datos.reliquias[r]) });
  }
  return { CUENTA, altarValido, maquina, dificultad, lee };
})();
