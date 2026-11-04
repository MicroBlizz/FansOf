// Fans Of Karts · dominio · MARCHA (segunda tanda, ADR 048 opción B): cuánto puede correr y cuánto agarra un kart según lo que pisa, el turbo, los golpes
// y la física de la pista. Cambia el kart en su sitio y lo que no es suyo le llega por `puertos`: aj (cifras), azar() (0 a 1), suena(k, nombre),
// tipoDeSuelo(sup) (el nombre del suelo), empujaCorriente(k, dt), daTurbo(k, t, f, patada), soplaViento(k, fuerza, dt) y fisicaPista().
'use strict';
KD.marcha = (() => {
  // lo que hace cada suelo con la marcha: T = { vmax, agarre } se modifica; turbo = si llevaba turbo al empezar el paso
  const EFECTO_SUELO = Object.freeze({
    lento: (k, T, turbo, dt, P) => { T.vmax *= turbo ? 0.82 : P.aj.lento; },
    barro: (k, T, turbo, dt, P) => { T.vmax *= turbo ? 0.78 : P.aj.barro; T.agarre = 5; },
    charco: (k, T, turbo, dt, P) => { if (k.tResbala <= 0 && k.v > 35 && k.tInmune <= 0) { k.tResbala = 0.7; k.giroRes = P.azar() < 0.5 ? -1 : 1; k.derrape = 0; P.suena(k, 'resbala'); } },
    atajo: (k, T, turbo) => { T.vmax *= turbo ? 0.96 : 0.6; },                         // el atajo es terreno malo: sin turbo no compensa tanto
    hielo: (k, T, turbo) => { T.agarre = turbo ? 2.4 : 1.5; },                         // en el hielo el kart va adonde quiere él
    corriente: (k, T, turbo, dt, P) => P.empujaCorriente(k, dt),
    turbo: (k, T, turbo, dt, P) => { if (k.tTurbo < 0.6) P.daTurbo(k, 0.95, P.aj.turbo, true); },
    rampa: (k, T, turbo, dt, P) => { if (k.v > 12) { k.vz = P.aj.rampa; k.z = 0.01; k.botado = false; k.v = Math.max(k.v, 108); k.tTurbo = Math.max(k.tTurbo, 0.5); k.fTurbo = 1.2; P.suena(k, 'jump'); } },
  });
  // la física de cada pista (hielo, agua, asfalto mojado, viento…) cambia agarre y velocidad; el viento solo empuja en el suelo
  function conLaPista(k, T, enSuelo, dt, P) {
    const F = P.fisicaPista();
    if (!F) return;
    T.agarre *= F.agarre || 1; T.vmax *= F.vel || 1;
    if (F.viento && enSuelo) P.soplaViento(k, F.viento, dt);
  }
  return Object.freeze({
    // T = { vmax, agarre }: lo que puede correr y lo que agarra en este paso
    limites(k, sup, turbo, enSuelo, dt, P) {
      const T = { vmax: k.vmax * (1 + P.aj.moneda * k.monedas), agarre: 9.5 };
      if (k.ia) T.vmax *= k.ia.factor;
      if (k.tNerf > 0) T.vmax *= 0.74;
      if (k.tCola > 0) T.vmax *= 0.4;
      const efecto = EFECTO_SUELO[P.tipoDeSuelo(sup)];
      if (efecto) efecto(k, T, turbo, dt, P);
      if (turbo) T.vmax *= k.fTurbo;
      if (k.tResbala > 0) { T.agarre = 1.2; k.ang += k.giroRes * 1.5 * dt; }
      conLaPista(k, T, enSuelo, dt, P);
      return T;
    },
  });
})();
