// Fans of Air · Misión (dominio, sin DOM ni reloj ni azar propio): el estado de una misión en dos fases (aire y tierra), el escudo,
// los puntos, el combo de RABIA, la transición entre fases y el final (cumplida o fallida). Las reglas de cada fase están en
// aire.js y tierra.js; principal.js llama a paso() 60 veces por segundo y convierte e.eventos en efectos y sonidos.
'use strict';
var AIR = globalThis.AIR || (globalThis.AIR = {});
(function (A) {
  const TRANSICION = 2.6;   // segundos de «cielo despejado» antes de bajar a la base

  A.nuevaMision = function (AJ, { caza = 'bunny' } = {}) {
    const c = AJ.cazas.find((q) => q.id === caza) || AJ.cazas[0];
    return {
      aj: AJ, caza: c, fase: 'aire', t: 0, escudo: c.escudo, misiles: c.misiles, bombas: c.bombas, puntos: 0,
      derribos: 0, destruidos: 0, disparos: 0, aciertos: 0, combo: 0, comboT: 0, fin: null, finT: 0, transicionT: 0, eventos: [],
      ids: 1, aire: A.aire.nueva(AJ, c), tierra: null,
    };
  };

  // Un paso de la misión. orden = { mx, my (−1..1), fuego (mantener), especial (pulsación: misil o bomba) }; rnd = azar (0..1).
  A.paso = function (e, dt, orden, rnd) {
    e.eventos = [];
    if (e.fin) { e.finT += dt; return e; }
    e.t += dt;
    const o = orden || { mx: 0, my: 0, fuego: false, especial: false };
    if (e.fase === 'aire') A.aire.paso(e, dt, o, rnd);
    else if (e.fase === 'transicion') transicion(e, dt);
    else A.tierra.paso(e, dt, o, rnd);
    combo(e, dt);
    if (e.escudo <= 0) { e.escudo = 0; A.terminar(e, 'fallida'); }
    return e;
  };

  function transicion(e, dt) {
    e.transicionT -= dt;
    if (e.transicionT > 0) return;
    e.fase = 'tierra';
    e.tierra = A.tierra.nueva(e.aj, e.caza);
    e.eventos.push({ tipo: 'faseTierra' });
  }

  // La RABIA de CrazyBunny: los derribos seguidos (menos de 3 s entre uno y otro) aceleran la ametralladora.
  function combo(e, dt) {
    if (e.combo <= 0) return;
    e.comboT -= dt;
    if (e.comboT <= 0) { e.combo = 0; e.eventos.push({ tipo: 'comboFin' }); }
  }

  A.despejado = function (e) {   // el jefe del aire ha caído: pausa de «cielo despejado» y a la tierra
    e.fase = 'transicion'; e.transicionT = TRANSICION;
    e.eventos.push({ tipo: 'despejado' });
  };

  A.derribo = function (e, puntos) {
    e.derribos++; e.combo = Math.min(10, e.combo + 1); e.comboT = 3;
    A.sumar(e, puntos);
  };

  A.danar = function (e, cuanto, motivo) {
    if (e.fin) return;
    e.escudo = Math.max(0, e.escudo - cuanto);
    e.eventos.push({ tipo: 'dano', cuanto, motivo });
  };

  A.sumar = function (e, puntos) { e.puntos += puntos; };

  A.terminar = function (e, como) {
    if (e.fin) return;
    const P = e.aj.puntos, precision = e.disparos ? e.aciertos / e.disparos : 0;
    const bonus = como === 'cumplida' ? Math.round(e.escudo * P.escudoRestante + precision * P.precision) : 0;
    e.puntos += bonus;
    e.fin = como; e.finT = 0; e.bonus = bonus; e.precision = precision;
    e.eventos.push({ tipo: 'fin', como, puntos: e.puntos, bonus });
  };

  A.util = {
    limita: (v, min, max) => Math.max(min, Math.min(max, v)),
    dist: (a, b) => Math.hypot(a.x - b.x, a.y - b.y),
    // acercar v a objetivo con una respuesta suave (k por segundo)
    acerca: (v, objetivo, k, dt) => v + (objetivo - v) * Math.min(1, k * dt),
  };
})(AIR);
