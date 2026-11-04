// Fans of Air · Vuelo (dominio, sin DOM ni reloj): vectores 3D y cómo vuela el caza en la fase aérea, como el original. El caza
// tiene posición (x este, y altura, z norte, en metros) y tres ejes: f (hacia donde apunta el morro), u (su techo) y r (su ala
// derecha). La palanca a los lados lo alabea (y, inclinado, vira solo); arriba o abajo lo cabecea, así que se puede rizar el rizo y
// volar boca abajo. Sube y pierde velocidad, pica y la gana; arriba del todo o muy lento entra en pérdida (el morro cae); si toca
// el suelo, se estrella. camara() pasa un punto del mundo a lo que ve el piloto, para el dominio (fijar blancos) y la vista.
'use strict';
var AIR = globalThis.AIR || (globalThis.AIR = {});
(function (A) {
  const V3 = A.v3 = {
    suma: (a, b) => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }),
    resta: (a, b) => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }),
    escala: (a, k) => ({ x: a.x * k, y: a.y * k, z: a.z * k }),
    punto: (a, b) => a.x * b.x + a.y * b.y + a.z * b.z,
    cruz: (a, b) => ({ x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x }),
    largo: (a) => Math.hypot(a.x, a.y, a.z),
    unidad: (a) => { const n = Math.hypot(a.x, a.y, a.z) || 1; return { x: a.x / n, y: a.y / n, z: a.z / n }; },
    dist: (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z),
    copia: (a) => ({ x: a.x, y: a.y, z: a.z }),
  };
  // Lo más cerca que pasa el tramo a-b del punto p (para que una bala rápida no atraviese a un enemigo entre dos pasos).
  V3.distTramo = function (p, a, b) {
    const ab = V3.resta(b, a), n = V3.punto(ab, ab);
    const t = n ? Math.max(0, Math.min(1, V3.punto(V3.resta(p, a), ab) / n)) : 0;
    return V3.dist(p, V3.suma(a, V3.escala(ab, t)));
  };
  // Gira el vector unitario `dir` hacia `quiere` como mucho `max` radianes (lo que vira un enemigo o un misil en un paso).
  V3.girarHacia = function (dir, quiere, max) {
    const ang = Math.acos(Math.max(-1, Math.min(1, V3.punto(dir, quiere))));
    if (ang < 1e-4) return V3.copia(quiere);
    const t = Math.min(1, max / ang);
    return V3.unidad(V3.suma(V3.escala(dir, 1 - t), V3.escala(quiere, t)));
  };

  const VU = A.vuelo = {};
  const limita = (v, a, b) => Math.max(a, Math.min(b, v));

  VU.nuevo = (AJ, caza) => ({ pos: { x: 0, y: AJ.aire.vuelo.altInicio, z: 0 }, f: { x: 0, y: 0, z: 1 }, u: { x: 0, y: 1, z: 0 },
    r: { x: 1, y: 0, z: 0 }, vel: AJ.aire.vuelo.vel * caza.vel, avisoT: 0 });

  VU.alabeo = (j) => Math.atan2(-j.r.y, j.u.y);   // inclinación respecto al horizonte (positivo: ala derecha abajo)
  VU.rumbo = (j) => Math.atan2(j.f.x, j.f.z);     // hacia dónde apunta, visto desde arriba (0 = norte)
  VU.velocidad = (j) => V3.escala(j.f, j.vel);

  // Las tres rotaciones del caza: cabeceo (sobre el ala), alabeo (sobre el morro) y viraje (sobre la vertical del mundo).
  function cabecear(j, a) {
    const c = Math.cos(a), s = Math.sin(a), f = j.f, u = j.u;
    j.f = V3.suma(V3.escala(f, c), V3.escala(u, s)); j.u = V3.resta(V3.escala(u, c), V3.escala(f, s));
  }
  function alabear(j, a) {
    const c = Math.cos(a), s = Math.sin(a), r = j.r, u = j.u;
    j.r = V3.resta(V3.escala(r, c), V3.escala(u, s)); j.u = V3.suma(V3.escala(u, c), V3.escala(r, s));
  }
  function virar(j, a) {
    const c = Math.cos(a), s = Math.sin(a), g = (v) => ({ x: v.x * c + v.z * s, y: v.y, z: -v.x * s + v.z * c });
    j.f = g(j.f); j.u = g(j.u); j.r = g(j.r);
  }
  function ortonormal(j) { j.f = V3.unidad(j.f); j.r = V3.unidad(V3.cruz(j.u, j.f)); j.u = V3.cruz(j.f, j.r); }
  // El morro hacia el suelo, esté como esté el caza (en pérdida o arriba del todo).
  function caerMorro(j, a) { cabecear(j, -a * (j.u.y >= 0 ? 1 : -1)); }

  // Un paso de vuelo con la orden { mx, my } (−1..1; my > 0 = tirar de la palanca = morro arriba). Devuelve los avisos del paso.
  VU.paso = function (j, dt, o, AJ, caza) {
    const P = AJ.aire.vuelo, k = Math.sqrt(caza.vel), mx = limita(o.mx || 0, -1, 1), my = limita(o.my || 0, -1, 1);
    alabear(j, mx * P.alabeo * k * dt);
    if (Math.abs(mx) < 0.1) nivelar(j, P, dt);
    cabecear(j, my * P.cabeceo * k * dt);
    virar(j, -j.r.y * P.viraje * dt);   // inclinado, vira solo hacia el ala que baja
    acelerar(j, P, caza, dt);
    j.pos = V3.suma(j.pos, V3.escala(j.f, j.vel * dt));
    ortonormal(j);
    return limites(j, P, dt);
  };

  // Sin tocar los lados, el caza vuelve poco a poco a nivel (salvo boca abajo o muy inclinado: ahí manda el piloto).
  function nivelar(j, P, dt) { const a = VU.alabeo(j); if (Math.abs(a) < 1.2) alabear(j, -a * Math.min(1, P.nivelar * dt)); }

  function acelerar(j, P, caza, dt) {
    const crucero = P.vel * caza.vel;
    j.vel = limita(j.vel + (-j.f.y * P.gravedad + (crucero - j.vel) * 0.5) * dt, P.velMin * 0.8, P.velMax * caza.vel);
  }

  function limites(j, P, dt) {
    const avisos = [];
    j.avisoT -= dt;
    if (j.pos.y <= 0) { j.pos.y = 0; return ['estrellado']; }
    if (j.pos.y > P.altMax) { j.pos.y = P.altMax; caerMorro(j, P.perdida * dt); avisos.push('alturaMax'); }
    else if (j.vel < P.velMin) { caerMorro(j, P.perdida * dt); avisos.push('perdida'); }
    else if (j.pos.y < P.altAviso && j.f.y < 0) avisos.push('alturaBaja');
    if (!avisos.length || j.avisoT > 0) return [];
    j.avisoT = P.aviso;
    return avisos;
  }

  // El piloto automático entre fases: nivela las alas y baja suave hacia la base.
  VU.autopiloto = function (j, dt, AJ, caza) {
    const objetivo = j.pos.y > 250 ? -0.25 : 0;
    alabear(j, -VU.alabeo(j) * Math.min(1, 2 * dt));
    cabecear(j, (objetivo - j.f.y) * Math.min(1, 1.5 * dt) * (j.u.y >= 0 ? 1 : -1));
    j.vel = AJ.aire.vuelo.vel * caza.vel;
    j.pos = V3.suma(j.pos, V3.escala(j.f, j.vel * dt));
    j.pos.y = Math.max(150, j.pos.y);
    ortonormal(j);
  };

  // Un punto del mundo visto desde la cabina: x a la derecha, y hacia arriba, z hacia delante (z <= 0: detrás del piloto).
  VU.camara = function (j, p) {
    const d = V3.resta(p, j.pos);
    return { x: V3.punto(d, j.r), y: V3.punto(d, j.u), z: V3.punto(d, j.f) };
  };
})(AIR);
