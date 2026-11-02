// Fans of Soccer · Reglas de los jugadores: tiro, súper tiro (por barra CRUNCH o por carrerilla), chilena, pase, órdenes a un
// compañero, barrida, empujón, vida y KO, y el movimiento (charcos de aceite incluidos). Sin DOM ni azar propio.
'use strict';
var SOCCER = globalThis.SOCCER || (globalThis.SOCCER = {});
(function (S) {
  const { dist, lim, metaX, sentido } = S.util, _ = S._;

  function soltar(e, j, vx, vy, vz, tiro) {
    const b = e.balon;
    Object.assign(b, { dueno: -1, vx, vy, vz, tiro, ultimo: j.id, ultimoTiro: (b.ultimoTiro || 0) + 1, libre: 0.35,
      x: j.x + j.mira * 0.8, y: j.y, z: Math.max(0.3, b.z), paseDe: -1 });
    j.espera = 0.35; j.carrera = 0;
  }

  // Tiro a puerta. Es súper si queda alguno en esta parte y el jugador tiene la carrerilla o su barra está llena.
  function chutar(e, j, rnd, aereo) {
    const aj = e.aj, eq = aj.equipos[j.eq], esSuper = S.puedeSuper(e, j);
    const objetivo = { x: metaX(aj, j.eq), y: aj.porteria.y1 + 1 + rnd() * (aj.porteria.y2 - aj.porteria.y1 - 2) };
    const v = esSuper ? aj.vel.superTiro : aj.vel.tiro, d = Math.max(1, dist(j, objetivo));
    if (esSuper) { if (j.cargado) j.cargado = false; else e.energia[j.eq] = 0; e.supers[j.eq]--; }
    const tipo = esSuper ? eq.super : 'normal';
    const vz = aereo ? -2 : esSuper ? 3 : 4 + rnd() * 4;
    soltar(e, j, (objetivo.x - j.x) / d * v, (objetivo.y - j.y) / d * v, vz, { eq: j.eq, tipo, t: 0, desde: j.id, objetivo });
    e.eventos.push({ tipo: esSuper ? 'super' : 'tiro', eq: j.eq, quien: j.id, clase: tipo, aereo: !!aereo });
  }

  // El compañero mejor colocado; si se da una dirección (el joystick), se prefiere el que está hacia allí.
  function mejorCompanero(e, j, mx, my) {
    let mejor = null, nota = -1e9;
    const m = Math.hypot(mx || 0, my || 0);
    for (const o of e.jugadores) {
      if (o.eq !== j.eq || o.id === j.id || o.puesto === 'portero' || o.mareo > 0) continue;
      const avance = (o.x - j.x) * sentido(j.eq), libre = Math.min(...e.jugadores.filter((r) => r.eq !== j.eq).map((r) => dist(r, o)));
      const haciaAlli = m > 0.3 ? ((o.x - j.x) * mx + (o.y - j.y) * my) / (m * Math.max(1, dist(o, j))) * 25 : 0;
      const n = avance * 0.6 + libre * 1.5 - dist(o, j) * 0.15 + haciaAlli;
      if (n > nota) { nota = n; mejor = o; }
    }
    return mejor;
  }
  S.mejorCompanero = mejorCompanero;

  function pasarA(e, j, o) {
    const aj = e.aj, d = Math.max(1, dist(j, o)), adel = { x: o.x + o.vx * 0.3, y: o.y + o.vy * 0.3 };
    soltar(e, j, (adel.x - j.x) / d * aj.vel.pase, (adel.y - j.y) / d * aj.vel.pase, d > 18 ? 5 : 1.5, null);
    e.balon.paseDe = j.id; e.balon.paseA = o.id;
    _.sumar(e, j.eq, aj.energia.pase);
    e.eventos.push({ tipo: 'pase', eq: j.eq, quien: j.id, a: o.id });
  }

  function lanzarse(e, j, mx, my, vel, dura, espera, clase) {
    const m = Math.hypot(mx, my), dx = m > 0.1 ? mx / m : j.mira, dy = m > 0.1 ? my / m : 0;
    j.vx = dx * vel; j.vy = dy * vel; j.espera = espera;
    if (clase === 'barrida') j.barrida = dura; else j.empujon = dura;
    if (Math.abs(dx) > 0.15) j.mira = Math.sign(dx);
    e.eventos.push({ tipo: clase, quien: j.id });
  }

  // Órdenes a un compañero que lleva el balón: «¡pásamela!» (pase) o «¡tira!» (tiro). Contesta si puede.
  function ordenar(e, j, accion, rnd) {
    const c = e.jugadores[e.balon.dueno], puede = c.mareo <= 0 && c.espera <= 0 && (accion === 'pase' || Math.abs(metaX(e.aj, c.eq) - c.x) < 45);
    e.eventos.push({ tipo: 'orden', quien: c.id, de: j.id, que: accion, ok: puede });
    if (!puede) return;
    if (accion === 'pase') pasarA(e, c, j); else chutar(e, c, rnd);
  }

  // Chilena o volea: el balón pasa por el aire cerca y se pulsa tiro.
  function rematar(e, j, rnd) {
    const b = e.balon, r = e.aj.remate;
    if (b.dueno >= 0 || b.z < r.zMin || b.z > r.zMax || dist(j, b) > r.alcance) return false;
    b.dueno = j.id; b.x = j.x; b.y = j.y;
    chutar(e, j, rnd, true);
    e.eventos.push({ tipo: 'chilena', quien: j.id });
    return true;
  }

  S.actuar = function (e, j, orden, rnd) {
    if (!orden || !orden.accion || j.mareo > 0 || j.barrida > 0 || j.empujon > 0 || j.espera > 0) return;
    const aj = e.aj, b = e.balon, tiene = b.dueno === j.id, a = orden.accion;
    if (tiene && a === 'tiro') return chutar(e, j, rnd);
    if (tiene && a === 'pase') { const o = mejorCompanero(e, j, orden.mx, orden.my); if (o) pasarA(e, j, o); return; }
    const companero = b.dueno >= 0 && e.jugadores[b.dueno].eq === j.eq;
    if (companero && orden.ordena && (a === 'pase' || a === 'tiro')) return ordenar(e, j, a, rnd);
    if (a === 'tiro' && rematar(e, j, rnd)) return;
    if (j.puesto === 'portero' || companero) return;
    if (a === 'barrida') lanzarse(e, j, orden.mx || 0, orden.my || 0, aj.vel.barrida, aj.barrida.dura * aj.campo.barridaLarga, aj.barrida.espera, 'barrida');
    else if (a === 'empujon') lanzarse(e, j, orden.mx || 0, orden.my || 0, aj.vel.empujon, aj.empujon.dura, aj.empujon.espera, 'empujon');
  };

  // ---------- vida, golpes y KO ----------
  _.danar = function (e, o, n, por) {
    if (o.puesto === 'portero' || o.ko > 0) return;
    o.vida = Math.max(0, o.vida - n); o.carrera = 0; o.cargado = false;
    if (o.vida > 0) return;
    o.ko = e.aj.ko; o.mareo = o.ko;
    e.eventos.push({ tipo: 'ko', quien: o.id, por });
  };

  function tumbar(e, o, j, mareo, dano, clase) {
    const b = e.balon, llevaba = b.dueno === o.id;
    o.mareo = Math.max(o.mareo, mareo);
    if (llevaba) Object.assign(b, { dueno: -1, vx: j.vx * 0.5, vy: j.vy * 0.5, vz: 4, libre: 0.15, tiro: null, paseDe: -1 });
    _.danar(e, o, dano, j.id);
    e.eventos.push({ tipo: 'derribo', quien: o.id, por: j.id, robo: llevaba, clase });
  }

  // Barrida: tumba a quien alcance. Empujón: tumba salvo que el otro tenga mucha más vida; en ese caso aguanta y nadie cae.
  _.golpes = function (e, j) {
    const aj = e.aj, barre = j.barrida > 0, empuja = j.empujon > 0;
    if (!barre && !empuja) return;
    for (const o of e.jugadores) {
      if (o.eq === j.eq || o.puesto === 'portero' || o.mareo > 0 || dist(o, j) > (barre ? aj.barrida.alcance : aj.empujon.alcance)) continue;
      if (barre) { tumbar(e, o, j, e.balon.dueno === o.id ? aj.barrida.mareo : aj.barrida.mareoSinBalon, aj.barrida.dano, 'barrida'); _.sumar(e, j.eq, aj.energia.barrida); continue; }
      j.empujon = 0;
      // empujón: tumba si no tienes mucha menos vida que el otro (margen a favor del que empuja); si no, rebota sin tirar a nadie
      if (j.vida + aj.empujon.margen >= o.vida) { tumbar(e, o, j, aj.empujon.mareo, aj.empujon.dano, 'empujon'); _.sumar(e, j.eq, aj.energia.empujon); }
      else e.eventos.push({ tipo: 'aguanta', quien: o.id, por: j.id });
      return;
    }
  };

  // ---------- movimiento ----------
  const enCharco = (e, j) => _.charcos(e).some((c) => Math.hypot(j.x - c[0], j.y - c[1]) < c[2]);
  // En un charco de aceite apenas se puede girar: se sigue patinando con la velocidad que se traía.
  function resbalar(e, j, orden) {
    const v = e.aj.vel.jugador, mx = orden ? orden.mx : 0, my = orden ? orden.my : 0;
    j.vx = j.vx * 0.94 + mx * v * 0.06; j.vy = j.vy * 0.94 + my * v * 0.06;
  }

  function andar(e, j, orden) {
    const aj = e.aj, mx = orden ? orden.mx : 0, my = orden ? orden.my : 0, m = Math.hypot(mx, my);
    const base = e.balon.dueno === j.id ? aj.vel.conBalon : j.puesto === 'portero' ? aj.vel.portero : aj.vel.jugador;
    const v = base * (orden && orden.velocidad ? orden.velocidad : 1), k = m > 1 ? 1 / m : 1;
    j.vx = mx * k * v; j.vy = my * k * v;
    if (Math.abs(mx) > 0.15) j.mira = Math.sign(mx);
  }

  // Carrerilla: metros con el balón sin que te toquen; al llegar a los del equipo, el siguiente tiro es súper.
  function carrerilla(e, j, dt) {
    if (e.balon.dueno !== j.id || j.cargado || e.supers[j.eq] <= 0 || j.puesto === 'portero') return;
    j.carrera += Math.hypot(j.vx, j.vy) * dt;
    if (j.carrera < e.aj.equipos[j.eq].pasos) return;
    j.cargado = true;
    e.eventos.push({ tipo: 'cargado', quien: j.id });
  }

  _.mover = function (e, j, orden, dt) {
    const aj = e.aj;
    if (j.mareo > 0) {                                  // tumbado; el portero que no para un súper tiro sale volando un momento
      if (j.vuelo > 0) { j.vuelo -= dt; j.x = lim(j.x + j.vx * dt, -2.5, aj.largo + 2.5); } else j.vx = j.vy = 0;
      return;
    }
    if (j.barrida > 0) { j.vx *= aj.campo.deslizar; j.vy *= aj.campo.deslizar; }
    else if (j.empujon > 0) { j.vx *= 0.9; j.vy *= 0.9; }
    else if (enCharco(e, j)) resbalar(e, j, orden);
    else andar(e, j, orden);
    const borde = e.balon.dueno === j.id ? 2 : -1;   // con el balón no se entra andando en la portería
    j.x = lim(j.x + j.vx * dt, borde, aj.largo - borde); j.y = lim(j.y + j.vy * dt, 0, aj.ancho);
    j.corre = Math.hypot(j.vx, j.vy) > 0.5 ? j.corre + dt * Math.hypot(j.vx, j.vy) : 0;
    carrerilla(e, j, dt);
  };
})(SOCCER);
