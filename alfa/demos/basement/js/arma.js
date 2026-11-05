// Fans of Basement · Arma (dominio): la grapadora automática dispara sola, cada `cadencia` segundos, al enemigo más cercano
// que esté dentro del alcance. Las grapas vuelan en línea recta y hieren al primero que tocan.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  const A = B.arma = {};

  // El más cercano dentro del alcance (distancias al cuadrado, sin raíz).
  A.objetivo = function (e) {
    const j = e.jugador, r2 = e.aj.arma.alcance ** 2;
    let mejor = null, md = r2;
    for (const en of e.enemigos) {
      const d = (en.x - j.x) ** 2 + (en.y - j.y) ** 2;
      if (d < md) { md = d; mejor = en; }
    }
    return mejor;
  };

  function disparar(e, en) {
    const W = e.aj.arma, j = e.jugador, dx = en.x - j.x, dy = en.y - j.y, m = Math.hypot(dx, dy) || 1;
    e.balas.push({ x: j.x, y: j.y, vx: dx / m * W.velBala, vy: dy / m * W.velBala, vida: W.vidaBala, dano: e.stats.dano });
    j.mira = dx >= 0 ? 1 : -1;
    e.eventos.push({ tipo: 'disparo', x: j.x, y: j.y, ang: Math.atan2(dy, dx) });
  }

  function choca(e, b, rnd) {
    const r = e.aj.arma.radioBala;
    for (const en of e.enemigos) {
      const rr = en.radio + r;
      if ((en.x - b.x) ** 2 + (en.y - b.y) ** 2 <= rr * rr) { B.enemigos.herir(e, en, b.dano, rnd); return true; }
    }
    return false;
  }

  A.paso = function (e, dt, rnd) {
    e.armaT = Math.max(0, e.armaT - dt);
    if (e.armaT === 0) {
      const en = A.objetivo(e);
      if (en) { disparar(e, en); e.armaT = e.aj.arma.cadencia; }
    }
    for (let i = e.balas.length - 1; i >= 0; i--) {
      const b = e.balas[i];
      b.x += b.vx * dt; b.y += b.vy * dt; b.vida -= dt;
      if (b.vida <= 0 || choca(e, b, rnd)) e.balas.splice(i, 1);
    }
  };
})(BAS);
