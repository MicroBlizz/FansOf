// Fans Of Paperwork · dominio · CURVAS: las fórmulas del juego, funciones puras de números (sin estado). Vida de los materiales, qué
// materiales salen en cada planta, costes que crecen, experiencia por nivel, Indemnización y la Trituradora. Las cifras, en PW.AJ.
'use strict';
PW.curvas = (() => {
  const AJ = PW.AJ;
  const NM = () => PW.MATERIALES.length;
  // coste de pasar del nivel n al n+1 de algo que crece base · factor^n
  const coste = (c, n) => Math.ceil(c.base * Math.pow(c.factor, n));
  // la esperanza de un multiplicador que sale con probabilidad p: p · multi + (1 − p)
  const esperanza = (p, multi) => Math.min(1, Math.max(0, p)) * multi + (1 - Math.min(1, Math.max(0, p)));

  // los dos materiales de la planta p (desde 1) y el reparto del segundo: [a, b, parteDeB]
  function materialesDe(p) {
    const P = AJ.planta, par = Math.floor((p - 1) / P.plantasPorPar);
    const a = Math.min(NM() - 2, par);
    const paso = par > NM() - 2 ? P.plantasPorPar - 1 : (p - 1) % P.plantasPorPar;
    return [a, a + 1, 0.15 + 0.2 * paso];
  }
  const zonaDe = p => Math.min(PW.ZONAS.length - 1, Math.floor((p - 1) / AJ.planta.plantasPorZona));
  // las plantas pasada la última zona siguen sin fin, cada una más dura
  const sinFin = p => Math.pow(AJ.planta.extraSinFin, Math.max(0, p - AJ.planta.plantasPorZona * PW.ZONAS.length));
  const vidaMaterial = (i, p) => AJ.material.vida0 * Math.pow(AJ.material.vidaBase, i) * sinFin(p);
  const valorPieza = i => AJ.material.valor0 * Math.pow(AJ.material.valorBase, i);
  const receta = i => AJ.material.receta0 + Math.floor(i / 2);   // materiales por pieza
  // daño base del pico con la mejora de daño en el nivel b: triangular
  const danoBase = b => ((b + 1) * (b + 2)) / 2;
  const xpParaSubir = n => Math.ceil(AJ.xp.base * Math.pow(AJ.xp.factor, n - 1));
  const topeNivel = nivelTrituradora => AJ.xp.topeBase + AJ.xp.topePorNivelTrituradora * nivelTrituradora;
  // lo que paga el Despido según el nivel: nada en el nivel 1 y crece exponencial desde ahí (no hay nivel mínimo: se puede en cuanto da algo)
  function indemnizacion(nivel) {
    const D = AJ.despido;
    return Math.max(0, Math.floor(D.base * (Math.pow(D.factor, nivel - D.desde) - Math.pow(D.factor, 1 - D.desde)) + 1e-9));
  }
  const vidaTrituradora = n => Math.round(AJ.trituradora.vida0 * Math.pow(AJ.trituradora.vidaBase, n));
  const armaduraTrituradora = n => Math.round(AJ.trituradora.armadura0 * Math.pow(AJ.trituradora.armaduraBase, n));
  // el rango del expediente de un material según los bloques rotos de ese material (0 a 3)
  const rangoExpediente = rotos => AJ.expediente.umbrales.filter(u => rotos >= u).length;

  return { coste, esperanza, materialesDe, zonaDe, vidaMaterial, valorPieza, receta, danoBase, xpParaSubir, topeNivel, indemnizacion,
    vidaTrituradora, armaduraTrituradora, rangoExpediente };
})();
