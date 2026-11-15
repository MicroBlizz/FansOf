// Fans Of Paperwork · dominio · BONOS: junta en un solo objeto todo lo que mejora al jugador (útiles, mejoras de documento, facciones
// liberadas, Recuerdos, plan de carrera y objetos en uso) y lo convierte en las cifras que usa el resto: lectura, vistazos por segundo,
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
    PW.CARRERA.forEach(n => { if (e.c.plan[n.id]) suma(acc, n.bono, 1); });
    PW.OBJETOS.forEach(o => { if ((e.r.activos[o.id] || 0) > 0) suma(acc, o.bono, 1); });
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
    };
  }
  // las cifras finales a partir de las fuentes
  function calcula(e) {
    const f = fuentes(e), b = k => f[k] || 0;   // b(k): lo que suman las fuentes en k (0 si nada)
    return {
      ...deUtiles(e.r, b),
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
      trabajadores: liberadas(e) - 1,
      trab: AJ.trabajador.parteDelLider * (1 + b('trab')),
      correos: b('correosDobles') ? 2 : 1,
      medidor: 1 + b('medidor'),
      horasExtra: AJ.horasExtra.parte + b('horasExtra'),
      topeDocumento: AJ.mejoraDocumento.max + b('topeDocumento'),
    };
  }
  // la dureza que le queda al documento m (en la planta p) con los guantes y la herramienta de su zona
  const dureza = (B, m, p = 1) => C.dureza(m, p) * B.guantes * B.herramientas[C.zonaDeDocumento(m)];

  return { calcula, liberadas, dureza };
})();
