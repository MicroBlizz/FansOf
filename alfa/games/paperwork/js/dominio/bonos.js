// Fans Of Paperwork · dominio · BONOS: junta en un solo objeto todo lo que mejora al jugador (útiles, mejoras de documento, facciones
// liberadas, Recuerdos, méritos, plan de carrera y objetos en uso) y lo convierte en las cifras que usa el resto: lectura, vistazos por segundo,
// dureza que quitan los guantes y las herramientas, probabilidades y multiplicadores. Cada fuente suma sus bonos por clave; las claves se
// suman entre fuentes (+10 % y +15 % = +25 %).
'use strict';
PW.bonos = (() => {
  const AJ = PW.AJ, C = PW.curvas;
  const suma = (acc, bono, veces) => { for (const k in bono) acc[k] = (acc[k] || 0) + bono[k] * veces; };

  // e = estado de la partida (ver dominio/partida.js): { r: recorrido, c: carrera }
  function fuentes(e) {
    const acc = {};
    PW.DOCUMENTOS.forEach((m, i) => suma(acc, m.bono, e.r.mejorasDoc[i] || 0));
    PW.FACCIONES.slice(0, liberadas(e)).forEach(f => suma(acc, f.bono, 1));
    PW.RECUERDOS.forEach(r => suma(acc, r.bono, e.c.recuerdos[r.id] || 0));
    PW.CARRERA.forEach(n => { if (PW.hitos.tieneNodo(e, n.id)) suma(acc, n.bono, 1); });   // comprado o regalado por un hito
    PW.hitos.logrados(e).forEach(h => { if (!h.nodo) suma(acc, h.bono, 1); });
    PW.MERITOS.forEach(m => suma(acc, m.bono, e.c.meritos[m.id] || 0));
    PW.OBJETOS.forEach(o => { if ((e.r.activos[o.id] || 0) > 0) suma(acc, o.bono, 1); });
    suma(acc, e.r.bonoCarta, 1);   // lo que dé la carta de recomendación de este turno
    return acc;
  }
  const liberadas = e => Math.min(PW.FACCIONES.length, 1 + e.c.trituradora.nivel);

  // lo que sale de los útiles y las herramientas del recorrido
  function deUtiles(r, b) {
    const U = r.utiles, AU = AJ.utiles;
    return {
      dano: C.danoBase(U.gafas) * (1 + b('dano')),
      vistazosSeg: AJ.lider.vistazosSeg * (1 + U.cafe * AU.cafe.paso + b('vel')),
      carrito: U.carrito * AU.carrito.paso,
      guantes: Math.pow(AU.guantes.paso, U.guantes),                               // por cuánto se multiplica toda dureza
      herramientas: r.herramientas.map(n => Math.pow(AJ.herramienta.paso, n)),     // y la de los documentos de cada zona
      mojado: Math.min(1, AJ.mojado.parte + U.fundas * AU.fundas.paso),            // a cuánto se vende el papel mojado de la última zona
    };
  }
  // las cifras finales a partir de las fuentes
  function calcula(e) {
    const f = fuentes(e), b = k => f[k] || 0;   // b(k): lo que suman las fuentes en k (0 si nada)
    return {
      ...deUtiles(e.r, b),
      entrada: Math.max(AJ.entrada.minimo, 1 - b('entrada')),   // por cuánto se multiplica lo que pide cada planta para encontrar su entrada
      confidencial: AJ.sellos.confidencial + b('confidencial'),
      altoSecreto: b('altoSecreto'),
      x2: AJ.clasificado.x2 + b('x2'),
      x3: AJ.clasificado.x3 + b('x3'),
      precio: 1 + b('precio'),
      coste: Math.max(0.3, 1 - b('coste')),
      xp: (1 + b('xp')),
      estanteria: AJ.estanteria.multi * (1 + b('estanteria')),
      recargaEstanteria: AJ.estanteria.recarga,
      autoEstanteria: b('autoEstanteria') > 0,
      jefe: AJ.especiales.jefe + b('jefe'),
      ceo: AJ.especiales.ceo + b('ceo'),
      repleto: AJ.especiales.repleto + b('repleto'),
      botin: 1 + b('botin'),
      indemn: 1 + b('indemn'),
      trit: 1 + b('trit'),
      espera: Math.max(0.3, 1 - b('espera')),
      abierto: PW.desbloqueos.abiertos(e),
      trabajadores: liberadas(e) - 1,
      drones: b('drones') + (e.r.temporales || 0),
      trab: AJ.trabajador.parteDelLider * (1 + b('trab')),
      correos: b('correosDobles') ? 2 : 1,
      medidor: 1 + b('medidor'),
      horasExtra: AJ.horasExtra.parte + b('horasExtra'),
      topeDocumento: AJ.mejoraDocumento.max + b('topeDocumento'),
      sindicatoCada: Math.max(AJ.sindicato.cadaMin, AJ.sindicato.cada - b('sindicatoCada')),
      sindicatoMax: AJ.sindicato.guardaMax + b('sindicatoMax'),
      grapasPaquete: b('grapasPaquete'),
    };
  }
  // la dureza que le queda al documento m (en la planta p) con los guantes y la herramienta de su zona
  const dureza = (B, m, p = 1) => C.dureza(m, p) * B.guantes * B.herramientas[C.zonaDeDocumento(m)];

  // por cuánto se multiplica el precio de venta del documento m: el de la última zona está mojado
  // cuántos documentos sueltos de m hacen un expediente (la receta, con lo que la abarate el manual)
  const recetaDe = (B, m) => Math.max(1, Math.round(C.receta(m) * B.coste));
  const precioDe = (B, m) => B.precio * (C.zonaDeDocumento(m) === PW.ZONAS.length - 1 ? B.mojado : 1);

  return { calcula, liberadas, dureza, precioDe, recetaDe };
})();
