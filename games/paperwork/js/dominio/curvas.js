// Fans Of Paperwork · dominio · CURVAS: las fórmulas del juego, funciones puras de números (sin estado). Vida de los documentos, qué
// documentos salen en cada planta, costes que crecen, experiencia por nivel, Indemnización y la Trituradora. Las cifras, en PW.AJ.
'use strict';
PW.curvas = (() => {
  const AJ = PW.AJ;
  const NM = () => PW.DOCUMENTOS.length;
  // coste de pasar del nivel n al n+1 de algo que crece base · factor^n
  const coste = (c, n) => Math.ceil(c.base * Math.pow(c.factor, n));
  // la esperanza de un multiplicador que sale con probabilidad p: p · multi + (1 − p)
  const esperanza = (p, multi) => Math.min(1, Math.max(0, p)) * multi + (1 - Math.min(1, Math.max(0, p)));

  // los dos documentos de la planta p (desde 1) y el reparto del segundo: [a, b, parteDeB]
  function documentosDe(p) {
    const P = AJ.planta, par = Math.floor((p - 1) / P.plantasPorPar);
    const a = Math.min(NM() - 2, par);
    const paso = par > NM() - 2 ? P.plantasPorPar - 1 : (p - 1) % P.plantasPorPar;
    return [a, a + 1, 0.15 + 0.2 * paso];
  }
  const zonaDe = p => Math.min(PW.ZONAS.length - 1, Math.floor((p - 1) / AJ.planta.plantasPorZona));
  // las plantas pasada la última zona siguen sin fin, cada una más dura
  const sinFin = p => Math.pow(AJ.planta.extraSinFin, Math.max(0, p - AJ.planta.plantasPorZona * PW.ZONAS.length));
  const vidaDocumento = (i, p) => AJ.documento.vida0 * Math.pow(AJ.documento.vidaBase, i) * sinFin(p);
  const valorExpediente = i => AJ.documento.valor0 * Math.pow(AJ.documento.valorBase, i);
  const receta = i => AJ.documento.receta0 + Math.floor(i / 2);   // documentos por expediente
  // lectura base del líder con las gafas en el nivel b: triangular
  const danoBase = b => ((b + 1) * (b + 2)) / 2;
  const xpParaSubir = n => Math.ceil(AJ.xp.base * Math.pow(AJ.xp.factor, n - 1));
  const topeNivel = nivelTrituradora => AJ.xp.topeBase + AJ.xp.topePorNivelTrituradora * nivelTrituradora;
  // lo que paga el Despido según el nivel: nada en el nivel 1 y crece exponencial desde ahí (no hay nivel mínimo: se puede en cuanto da algo)
  function indemnizacion(nivel) {
    const D = AJ.despido;
    return Math.max(0, Math.floor(D.base * (Math.pow(D.factor, nivel - D.desde) - Math.pow(D.factor, 1 - D.desde)) + 1e-9));
  }
  const capacidadTrituradora = n => Math.round(AJ.trituradora.capacidad0 * Math.pow(AJ.trituradora.capacidadBase, n));
  const tragaderasTrituradora = n => Math.round(AJ.trituradora.tragaderas0 * Math.pow(AJ.trituradora.tragaderasBase, n));
  // la dureza del papel del documento i en la planta p: lo que resta a cada vistazo (los primeros tipos no tienen)
  const dureza = (i, p = 1) => (i >= AJ.dureza.desde ? AJ.dureza.base0 * Math.pow(AJ.dureza.base, i - AJ.dureza.desde) * sinFin(p) : 0);
  // lo que queda de un vistazo de d tras la dureza: nunca menos de AJ.dureza.minimo de d
  const trasDureza = (d, du) => Math.max(d * AJ.dureza.minimo, d - du);
  // la zona a la que pertenece el documento i (los documentos se reparten a partes iguales entre las zonas)
  const zonaDeDocumento = i => Math.min(PW.ZONAS.length - 1, Math.floor(i / Math.ceil(NM() / PW.ZONAS.length)));
  // archivadores que pide la planta p para encontrar la entrada a la siguiente (sin bonos)
  const entrada = p => Math.ceil(AJ.entrada.base * (1 + AJ.entrada.porPlanta * (p - 1)));
  // el rango del especialidad de un documento según los archivadores vaciados de ese documento (0 a 3)
  const rangoEspecialidad = vaciados => AJ.especialidad.umbrales.filter(u => vaciados >= u).length;

  return { entrada, coste, esperanza, documentosDe, zonaDe, vidaDocumento, valorExpediente, receta, danoBase, xpParaSubir, topeNivel, indemnizacion,
    capacidadTrituradora, tragaderasTrituradora, rangoEspecialidad,
    dureza, trasDureza, zonaDeDocumento };
})();
