// Fans of Basement · Arma (dominio): la grapadora automática dispara sola, cada `cadencia` segundos, al enemigo (o jefe) más
// cercano que esté dentro del alcance; con la Grapadora doble salen varias grapas en abanico. Los ayudantes (tu mascota de
// oficina y los becarios rescatados) te siguen y disparan igual, cada uno con su daño, cadencia y alcance; el Dron de pizza,
// además, suelta una taza de café cada cierto tiempo. Las grapas vuelan en línea recta y hieren al primero que tocan.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  const A = B.arma = {};
  const SITIOS = [{ x: -28, y: -24 }, { x: 28, y: -22 }, { x: -32, y: 20 }, { x: 32, y: 20 }];

  // El blanco más cercano a (x, y) dentro de `alcance` (distancias al cuadrado, sin raíz). Cuenta el jefe.
  A.objetivo = function (e, x, y, alcance) {
    const px = x == null ? e.jugador.x : x, py = y == null ? e.jugador.y : y;
    let mejor = null, md = (alcance || e.stats.alcance) ** 2;
    const mira = (b) => { const d = (b.x - px) ** 2 + (b.y - py) ** 2; if (d < md) { md = d; mejor = b; } };
    for (const en of e.enemigos) mira(en);
    if (e.jefe) mira(e.jefe);
    return mejor;
  };

  A.nuevoAyudante = function (e, tipo, datos, desde) {
    const j = e.jugador, sitio = SITIOS[e.ayudantes.length % SITIOS.length], o = desde || { x: j.x + sitio.x, y: j.y + sitio.y };
    e.ayudantes.push({ tipo, id: datos.id || tipo, x: o.x, y: o.y, off: sitio, dano: datos.dano, cadencia: datos.cadencia,
      alcance: datos.alcance, t: 0.5, cafeCada: datos.cafeCada || 0, cafeT: datos.cafeCada || 0 });
  };

  function grapa(e, x, y, ang, dano, quien) {
    const W = e.aj.arma;
    e.balas.push({ x, y, vx: Math.cos(ang) * W.velBala, vy: Math.sin(ang) * W.velBala, vida: W.vidaBala, dano, quien });
  }

  function disparaJugador(e) {
    const j = e.jugador, en = A.objetivo(e);
    if (!en) return false;
    const ang = Math.atan2(en.y - j.y, en.x - j.x), n = e.stats.multi;
    for (let i = 0; i < n; i++) grapa(e, j.x, j.y, ang + (i - (n - 1) / 2) * 0.14, e.stats.dano, 'jugador');
    j.mira = en.x >= j.x ? 1 : -1;
    e.eventos.push({ tipo: 'disparo', x: j.x, y: j.y, ang });
    return true;
  }

  // Cada ayudante se va colocando a su sitio junto al jugador y dispara cuando le toca.
  function ayudante(e, a, dt) {
    const j = e.jugador, k = Math.min(1, dt * 5);
    a.x += (j.x + a.off.x - a.x) * k; a.y += (j.y + a.off.y - a.y) * k;
    a.t -= dt;
    if (a.t <= 0) {
      const en = A.objetivo(e, a.x, a.y, a.alcance);
      if (en) { grapa(e, a.x, a.y, Math.atan2(en.y - a.y, en.x - a.x), a.dano, a.tipo); a.t = a.cadencia; }
    }
    if (!a.cafeCada) return;
    a.cafeT -= dt;
    if (a.cafeT <= 0) { a.cafeT = a.cafeCada; B.enemigos.soltar(e, 'cafe', a.x, a.y + 10); e.eventos.push({ tipo: 'dronCafe', x: a.x, y: a.y }); }
  }

  function choca(e, b, rnd) {
    const r = e.aj.arma.radioBala, jf = e.jefe;
    if (jf && (jf.x - b.x) ** 2 + (jf.y - b.y) ** 2 <= (jf.radio + r) ** 2) { B.jefes.herir(e, b.dano); return true; }
    for (const en of e.enemigos) {
      const rr = en.radio + r;
      if ((en.x - b.x) ** 2 + (en.y - b.y) ** 2 <= rr * rr) { B.enemigos.herir(e, en, b.dano, rnd); return true; }
    }
    return false;
  }

  A.paso = function (e, dt, rnd) {
    e.armaT = Math.max(0, e.armaT - dt);
    if (e.armaT === 0 && disparaJugador(e)) e.armaT = e.stats.cadencia;
    for (const a of e.ayudantes) ayudante(e, a, dt);
    for (let i = e.balas.length - 1; i >= 0; i--) {
      const b = e.balas[i];
      b.x += b.vx * dt; b.y += b.vy * dt; b.vida -= dt;
      if (b.vida <= 0 || choca(e, b, rnd)) e.balas.splice(i, 1);
    }
  };
})(BAS);
