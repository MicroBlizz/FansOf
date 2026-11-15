// Fans Of Mining · dominio · BONOS: junta en un solo objeto todo lo que mejora al jugador (mejoras de material, facciones liberadas,
// Recuerdos, plan de carrera, expedientes y objetos en uso) y lo convierte en las cifras que usa el resto: daño, golpes por segundo,
// probabilidades y multiplicadores. Cada fuente suma sus bonos por clave; las claves se suman entre fuentes (+10 % y +15 % = +25 %).
'use strict';
MN.bonos = (() => {
  const AJ = MN.AJ, C = MN.curvas;
  const suma = (acc, bono, veces) => { for (const k in bono) acc[k] = (acc[k] || 0) + bono[k] * veces; };

  // e = estado de la partida (ver dominio/partida.js): { r: recorrido, c: carrera }
  function fuentes(e) {
    const acc = {};
    MN.MATERIALES.forEach((m, i) => suma(acc, m.bono, e.r.mejorasMat[i] || 0));
    MN.FACCIONES.slice(0, liberadas(e)).forEach(f => suma(acc, f.bono, 1));
    MN.RECUERDOS.forEach(r => suma(acc, r.bono, e.c.recuerdos[r.id] || 0));
    MN.CARRERA.forEach(n => { if (e.c.plan[n.id]) suma(acc, n.bono, 1); });
    MN.OBJETOS.forEach(o => { if ((e.r.activos[o.id] || 0) > 0) suma(acc, o.bono, 1); });
    return acc;
  }
  const liberadas = e => Math.min(MN.FACCIONES.length, 1 + e.c.trituradora.nivel);

  // las cifras finales a partir de las fuentes
  function calcula(e) {
    const f = fuentes(e), b = k => f[k] || 0, P = e.r.pico, AP = AJ.picoMejoras;   // b(k): lo que suman las fuentes en k (0 si nada)
    const multiDano = (1 + b('dano'));
    const vel = (1 + P.velocidad * AP.velocidad.paso + b('vel'));
    return {
      dano: C.danoBase(P.dano) * multiDano,
      golpesSeg: AJ.pico.golpesSeg * vel,
      radio: P.radio * AP.radio.paso,
      crit: AJ.pico.critBase + b('crit'),
      superCrit: b('superCrit'),
      x2: AJ.reciclado.x2 + b('x2'),
      x3: AJ.reciclado.x3 + b('x3'),
      precio: 1 + b('precio'),
      coste: Math.max(0.3, 1 - b('coste')),
      xp: (1 + b('xp')),
      dinamita: AJ.dinamita.multi * (1 + b('dinamita')),
      recargaDinamita: AJ.dinamita.recarga,
      autoDinamita: b('autoDinamita') > 0,
      dorada: AJ.especiales.dorada + b('dorada'),
      arcoiris: AJ.especiales.arcoiris + b('arcoiris'),
      multiRoca: AJ.especiales.multiRoca + b('multiRoca'),
      botin: 1 + b('botin'),
      indemn: 1 + b('indemn'),
      trit: 1 + b('trit'),
      espera: Math.max(0.3, 1 - b('espera')),
      ayudantes: liberadas(e) - 1,
      ayud: AJ.ayudante.parteDelPico * (1 + b('ayud')),
      correos: b('correosDobles') ? 2 : 1,
      medidor: 1 + b('medidor'),
      horasExtra: AJ.horasExtra.parte + b('horasExtra'),
      topeMaterial: AJ.mejoraMaterial.max + b('topeMaterial'),
    };
  }
  // golpe medio con críticos encadenados (para la Trituradora y la simulación): el súper solo sale si sale el crítico
  function golpeMedio(B) {
    const c = Math.min(1, B.crit), s = Math.min(1, B.superCrit), M = AJ.pico;
    return B.dano * ((1 - c) + c * (1 - s) * M.critMulti + c * s * M.critMulti * M.superMulti);
  }

  return { calcula, liberadas, golpeMedio };
})();
