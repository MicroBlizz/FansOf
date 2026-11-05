// Fans of Basement · Arma (dominio): tu arma dispara sola, cada `cadencia` segundos, al enemigo (o jefe) más cercano que esté
// dentro del alcance. Cada arma dispara a su manera (ajustes.js, armas): la grapadora, una grapa (o varias en abanico con la
// Grapadora doble); el lanzaclips, tres clips en abanico; el taladro atraviesa a varios; el extintor explota y daña a todos los de
// alrededor; el ratón inalámbrico rebota de bicho en bicho. Los ayudantes (tu mascota de oficina y los becarios rescatados) te
// siguen y disparan grapas normales, cada uno con su daño, cadencia y alcance; el Dron de pizza, además, suelta tazas de café.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  const A = B.arma = {};
  const SITIOS = [{ x: -28, y: -24 }, { x: 28, y: -22 }, { x: -32, y: 20 }, { x: 32, y: 20 }];

  // El blanco más cercano a (x, y) dentro de `alcance` (distancias al cuadrado, sin raíz). Cuenta el jefe. `menos` = ids a saltar.
  A.objetivo = function (e, x, y, alcance, menos) {
    const px = x == null ? e.jugador.x : x, py = y == null ? e.jugador.y : y;
    let mejor = null, md = (alcance || e.stats.alcance) ** 2;
    const mira = (b, id) => { if (menos && menos.includes(id)) return; const d = (b.x - px) ** 2 + (b.y - py) ** 2; if (d < md) { md = d; mejor = b; } };
    for (const en of e.enemigos) mira(en, en.id);
    if (e.jefe) mira(e.jefe, 'jefe');
    return mejor;
  };
  const idDe = (e, b) => (b === e.jefe ? 'jefe' : b.id);

  A.nuevoAyudante = function (e, tipo, datos, desde) {
    const j = e.jugador, sitio = SITIOS[e.ayudantes.length % SITIOS.length], o = desde || { x: j.x + sitio.x, y: j.y + sitio.y };
    e.ayudantes.push({ tipo, id: datos.id || tipo, x: o.x, y: o.y, off: sitio, dano: datos.dano, cadencia: datos.cadencia,
      alcance: datos.alcance, t: 0.5, cafeCada: datos.cafeCada || 0, cafeT: datos.cafeCada || 0 });
  };

  // Una bala: lo que haga al chocar depende de su arma (atraviesa, area, rebotes).
  function bala(e, x, y, ang, dano, quien, arma) {
    const W = e.aj.arma, a = arma || {}, vel = W.velBala * (a.vel || 1);
    e.balas.push({ x, y, vx: Math.cos(ang) * vel, vy: Math.sin(ang) * vel, vida: W.vidaBala / (a.vel || 1), dano, quien, arma: a.id || 'grapadora',
      atraviesa: a.atraviesa || 1, area: a.area || 0, rebotes: (a.rebotes || 0) + (quien === 'jugador' ? e.stats.rebote || 0 : 0), tocados: [] });
  }

  function disparaJugador(e) {
    const j = e.jugador, en = A.objetivo(e);
    if (!en) return false;
    const a = e.stats.arma || {}, ang = Math.atan2(en.y - j.y, en.x - j.x), n = (a.balas || 1) * e.stats.multi, abre = a.abanico || 0.14;
    for (let i = 0; i < n; i++) bala(e, j.x, j.y, ang + (i - (n - 1) / 2) * abre / Math.max(1, n / 3), e.stats.dano, 'jugador', a);
    j.mira = en.x >= j.x ? 1 : -1;
    e.eventos.push({ tipo: 'disparo', x: j.x, y: j.y, ang, arma: a.id || 'grapadora' });
    return true;
  }

  // Cada ayudante se va colocando a su sitio junto al jugador y dispara cuando le toca.
  function ayudante(e, a, dt) {
    const j = e.jugador, k = Math.min(1, dt * 5);
    a.x += (j.x + a.off.x - a.x) * k; a.y += (j.y + a.off.y - a.y) * k;
    a.t -= dt;
    if (a.t <= 0) {
      const en = A.objetivo(e, a.x, a.y, a.alcance);
      if (en) { bala(e, a.x, a.y, Math.atan2(en.y - a.y, en.x - a.x), a.dano, a.tipo); a.t = a.cadencia; }
    }
    if (!a.cafeCada) return;
    a.cafeT -= dt;
    if (a.cafeT <= 0) { a.cafeT = a.cafeCada; B.enemigos.soltar(e, 'cafe', a.x, a.y + 10); e.eventos.push({ tipo: 'dronCafe', x: a.x, y: a.y }); }
  }

  const herir = (e, blanco, dano, rnd) => (blanco === e.jefe ? B.jefes.herir(e, dano) : B.enemigos.herir(e, blanco, dano, rnd));

  // El extintor: daña a todo lo que esté en su área.
  function explota(e, b, rnd) {
    const r2 = b.area * b.area, dentro = e.enemigos.filter((en) => (en.x - b.x) ** 2 + (en.y - b.y) ** 2 <= r2);
    for (const en of dentro) B.enemigos.herir(e, en, b.dano, rnd);
    if (e.jefe && (e.jefe.x - b.x) ** 2 + (e.jefe.y - b.y) ** 2 <= (b.area + e.jefe.radio) ** 2) B.jefes.herir(e, b.dano);
    e.eventos.push({ tipo: 'explosion', x: b.x, y: b.y, radio: b.area });
  }

  // El ratón: salta al bicho más cercano que no haya tocado todavía.
  function rebota(e, b) {
    const sig = A.objetivo(e, b.x, b.y, 170, b.tocados);
    if (!sig) return false;
    const vel = Math.hypot(b.vx, b.vy), ang = Math.atan2(sig.y - b.y, sig.x - b.x);
    b.vx = Math.cos(ang) * vel; b.vy = Math.sin(ang) * vel; b.vida = e.aj.arma.vidaBala; b.rebotes--;
    return true;
  }

  // Qué pasa cuando la bala toca a alguien. Devuelve true si la bala desaparece.
  function golpe(e, b, blanco, rnd) {
    if (b.area) { explota(e, b, rnd); return true; }
    b.tocados.push(idDe(e, blanco));
    herir(e, blanco, b.dano, rnd);
    if (b.rebotes > 0 && rebota(e, b)) return false;
    b.atraviesa--;
    return b.atraviesa <= 0;
  }

  function blancoEn(e, b) {
    const r = e.aj.arma.radioBala, jf = e.jefe;
    if (jf && !b.tocados.includes('jefe') && (jf.x - b.x) ** 2 + (jf.y - b.y) ** 2 <= (jf.radio + r) ** 2) return jf;
    return e.enemigos.find((en) => !b.tocados.includes(en.id) && (en.x - b.x) ** 2 + (en.y - b.y) ** 2 <= (en.radio + r) ** 2) || null;
  }

  A.paso = function (e, dt, rnd) {
    e.armaT = Math.max(0, e.armaT - dt);
    if (e.armaT === 0 && disparaJugador(e)) e.armaT = e.stats.cadencia;
    for (const a of e.ayudantes) ayudante(e, a, dt);
    for (let i = e.balas.length - 1; i >= 0; i--) {
      const b = e.balas[i];
      b.x += b.vx * dt; b.y += b.vy * dt; b.vida -= dt;
      const blanco = b.vida > 0 ? blancoEn(e, b) : null;
      if (b.vida <= 0 || (blanco && golpe(e, b, blanco, rnd))) e.balas.splice(i, 1);
    }
  };
})(BAS);
