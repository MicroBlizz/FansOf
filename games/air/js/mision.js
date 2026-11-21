// Fans of Air · Misión (dominio, sin DOM ni reloj ni azar propio): el estado de una misión en dos fases (aire y tierra), el escudo,
// el combustible, los puntos, el combo de RABIA, la transición (piloto automático) y el final (cumplida o fallida, y por qué). Las reglas de cada fase están en
// aire.js y tierra.js; principal.js llama a paso() 60 veces por segundo y convierte e.eventos en efectos y sonidos.
'use strict';
var AIR = globalThis.AIR || (globalThis.AIR = {});
(function (A) {
  const TRANSICION = 2.6;   // segundos de «cielo despejado» antes de bajar a la base

  A.nuevaMision = function (AJ, { caza = 'bunny' } = {}) {
    const c = AJ.cazas.find((q) => q.id === caza) || AJ.cazas[0];
    return {
      aj: AJ, caza: c, fase: 'aire', t: 0, escudo: c.escudo, misiles: c.misiles, bombas: c.bombas, puntos: 0, combustible: AJ.combustible.max, finMotivo: null,
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
    gastar(e, dt);
    if (e.escudo <= 0) { e.escudo = 0; A.terminar(e, 'fallida', 'derribado'); }
    return e;
  };

  // El combustible baja con cada segundo de vuelo; avisa cuando queda poco y, si se acaba, la misión falla.
  function gastar(e, dt) {
    const C = e.aj.combustible, antes = e.combustible;
    e.combustible = Math.max(0, e.combustible - dt);
    if (antes > C.aviso && e.combustible <= C.aviso) e.eventos.push({ tipo: 'combustibleBajo' });
    if (e.combustible <= 0) A.terminar(e, 'fallida', 'combustible');
  }

  function transicion(e, dt) {
    A.aire.autopiloto(e, dt);
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

  A.terminar = function (e, como, motivo) {
    if (e.fin) return;
    e.finMotivo = motivo || null;
    const P = e.aj.puntos, precision = e.disparos ? e.aciertos / e.disparos : 0;
    const bonus = como === 'cumplida' ? Math.round(e.escudo * P.escudoRestante + precision * P.precision) : 0;
    e.puntos += bonus;
    e.fin = como; e.finT = 0; e.bonus = bonus; e.precision = precision;
    e.eventos.push({ tipo: 'fin', como, motivo: e.finMotivo, puntos: e.puntos, bonus });
  };

  A.util = {
    limita: (v, min, max) => Math.max(min, Math.min(max, v)),
    dist: (a, b) => Math.hypot(a.x - b.x, a.y - b.y),
    // acercar v a objetivo con una respuesta suave (k por segundo)
    acerca: (v, objetivo, k, dt) => v + (objetivo - v) * Math.min(1, k * dt),
  };
})(AIR);
