// Fans of Basement · Arma (dominio): tu arma dispara sola, cada `cadencia` segundos, al enemigo (o jefe) más cercano que esté
// dentro del alcance. Cada arma dispara a su manera (ajustes.js, armas): la grapadora, una grapa (o varias en abanico con la
// Grapadora doble); el lanzaclips, tres clips en abanico; el taladro atraviesa a varios; el extintor explota y daña a todos los de
// alrededor; el ratón inalámbrico rebota de bicho en bicho. Y las de la 0.5.0: la cinta y el proyector frenan al bicho tocado, la
// impresora dispara en ráfaga, la trituradora es de cerca, el router dispara en círculo, el sello cae al momento en el sitio del
// blanco y la taza lanzacafé te devuelve café por cada bicho que tumba. Los ayudantes (tu mascota de oficina y los becarios rescatados) te
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

  // Una bala: lo que haga al chocar depende de su arma (atraviesa, area, rebotes, lento, cafe). `retraso` = espera pegada al
  // jugador antes de salir (las ráfagas).
  function bala(e, x, y, ang, dano, quien, arma, retraso) {
    const W = e.aj.arma, a = arma || {}, vel = W.velBala * (a.vel || 1);
    e.balas.push({ x, y, vx: Math.cos(ang) * vel, vy: Math.sin(ang) * vel, vida: W.vidaBala / (a.vel || 1), dano, quien, arma: a.id || 'grapadora',
      atraviesa: a.atraviesa || 1, area: a.area || 0, rebotes: (a.rebotes || 0) + (quien === 'jugador' ? e.stats.rebote || 0 : 0), tocados: [],
      lento: a.lento || null, cafe: a.cafe || 0, retraso: retraso || 0 });
  }

  // Hacia dónde sale cada una de las n balas: en abanico hacia el blanco o, el router, repartidas en círculo.
  A.angulos = function (a, ang, n) {
    if (a.circulo) return Array.from({ length: n }, (_, i) => ang + i * 2 * Math.PI / n);
    const abre = a.abanico || 0.14;
    return Array.from({ length: n }, (_, i) => ang + (i - (n - 1) / 2) * abre / Math.max(1, n / 3));
  };

  function disparaJugador(e, rnd) {
    const j = e.jugador, a = e.stats.arma || {}, en = A.objetivo(e, null, null, e.stats.alcance * (a.alcance || 1));
    if (!en) return false;
    const ang = Math.atan2(en.y - j.y, en.x - j.x);
    if (a.directo) explota(e, { x: en.x, y: en.y, area: a.area, dano: e.stats.dano }, rnd, a.id);
    else {
      const lista = A.angulos(a, ang, (a.balas || 1) * e.stats.multi);
      for (let k = 0; k < (a.rafaga || 1); k++) for (const g of lista) bala(e, j.x, j.y, g, e.stats.dano, 'jugador', a, k * (a.entre || 0));
    }
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

  // El extintor y el sello: daña a todo lo que esté en su área.
  function explota(e, b, rnd, arma) {
    const r2 = b.area * b.area, dentro = e.enemigos.filter((en) => (en.x - b.x) ** 2 + (en.y - b.y) ** 2 <= r2);
    for (const en of dentro) B.enemigos.herir(e, en, b.dano, rnd);
    if (e.jefe && (e.jefe.x - b.x) ** 2 + (e.jefe.y - b.y) ** 2 <= (b.area + e.jefe.radio) ** 2) B.jefes.herir(e, b.dano);
    e.eventos.push({ tipo: 'explosion', x: b.x, y: b.y, radio: b.area, arma: arma || b.arma });
  }

  // El ratón: salta al bicho más cercano que no haya tocado todavía.
  function rebota(e, b) {
    const sig = A.objetivo(e, b.x, b.y, 170, b.tocados);
    if (!sig) return false;
    const vel = Math.hypot(b.vx, b.vy), ang = Math.atan2(sig.y - b.y, sig.x - b.x);
    b.vx = Math.cos(ang) * vel; b.vy = Math.sin(ang) * vel; b.vida = e.aj.arma.vidaBala; b.rebotes--;
    return true;
  }

  // Lo que la bala deja en un bicho (no en el jefe): lo frena un rato y, si lo tumba, te devuelve café.
  function deja(e, b, en, muerto) {
    if (b.lento && !muerto) { en.lento = b.lento[0]; en.lentoT = b.lento[1]; }
    if (b.cafe && muerto) { e.cafe = Math.min(e.cafeMax, e.cafe + b.cafe); e.eventos.push({ tipo: 'cafeArma', x: en.x, y: en.y }); }
  }

  // Qué pasa cuando la bala toca a alguien. Devuelve true si la bala desaparece.
  function golpe(e, b, blanco, rnd) {
    if (b.area) { explota(e, b, rnd); return true; }
    b.tocados.push(idDe(e, blanco));
    const muerto = herir(e, blanco, b.dano, rnd);
    if (blanco !== e.jefe) deja(e, b, blanco, muerto);
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
    if (e.armaT === 0 && disparaJugador(e, rnd)) e.armaT = e.stats.cadencia;
    for (const a of e.ayudantes) ayudante(e, a, dt);
    for (let i = e.balas.length - 1; i >= 0; i--) {
      const b = e.balas[i];
      if (b.retraso > 0) { b.retraso -= dt; b.x = e.jugador.x; b.y = e.jugador.y; continue; }
      b.x += b.vx * dt; b.y += b.vy * dt; b.vida -= dt;
      const blanco = b.vida > 0 ? blancoEn(e, b) : null;
      if (b.vida <= 0 || (blanco && golpe(e, b, blanco, rnd))) e.balas.splice(i, 1);
    }
  };
})(BAS);
