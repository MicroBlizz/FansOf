// Fans of Soccer · IA: decide las órdenes de los jugadores que no lleva la persona (porteros, compañeros y todo Microblizz).
// Devuelve órdenes { mx, my, accion } que luego aplica el dominio; el azar llega de fuera (rnd).
'use strict';
var SOCCER = globalThis.SOCCER || (globalThis.SOCCER = {});
(function (S) {
  const { dist, lim, metaX, sentido, sitio } = S.util;
  const hacia = (j, p, frena = 0.6) => { const dx = p.x - j.x, dy = p.y - j.y, d = Math.hypot(dx, dy); return d < frena ? { mx: 0, my: 0 } : { mx: dx / d, my: dy / d }; };

  function portero(e, j) {
    const aj = e.aj, b = e.balon, base = sitio(aj, j.eq, 'portero', 0);
    if (b.dueno === j.id) return j.espera > 0 ? { mx: 0, my: 0 } : { mx: 0, my: 0, accion: 'pase' };
    const cerca = Math.abs(b.x - base.x) < 9 && b.dueno < 0 && !b.tiro;
    const viene = b.tiro && b.tiro.eq !== j.eq && Math.abs(b.vx) > 1;
    const yObjetivo = viene ? b.y + b.vy * ((base.x - b.x) / b.vx) : b.y;   // donde cruzará la línea de gol
    const p = cerca ? b : { x: base.x, y: lim(yObjetivo, aj.porteria.y1 + 1, aj.porteria.y2 - 1) };
    return hacia(j, p, 0.3);
  }

  function conBalon(e, j, rnd) {
    const aj = e.aj, meta = { x: metaX(aj, j.eq), y: aj.ancho / 2 + (rnd() - 0.5) * 6 };
    const rivalCerca = e.jugadores.some((o) => o.eq !== j.eq && o.mareo <= 0 && dist(o, j) < aj.ia.presion);
    const aTiro = Math.abs(meta.x - j.x) < aj.ia.distTiro;
    let accion = null;
    if (aTiro && (rnd() < 0.08 || S.lleno(e, j.eq) || Math.abs(meta.x - j.x) < 9)) accion = 'tiro';
    else if (rivalCerca && rnd() < 0.12) accion = 'pase';
    // regate: si hay alguien delante, se abre un poco hacia el lado libre
    const o = hacia(j, meta), esquiva = rivalCerca ? (j.y < aj.ancho / 2 ? 0.6 : -0.6) : 0;
    return { mx: o.mx, my: o.my + esquiva, accion };
  }

  function sinBalon(e, j, persigue) {
    const aj = e.aj, b = e.balon, tiene = S.equipoConBalon(e);
    if (persigue) {
      const portador = b.dueno >= 0 ? e.jugadores[b.dueno] : null;
      const barre = portador && portador.eq !== j.eq && dist(j, portador) < 3.2 && j.espera <= 0;
      const o = hacia(j, { x: b.x + b.vx * 0.25, y: b.y + b.vy * 0.25 }, 0.2);
      return barre ? { mx: portador.x - j.x, my: portador.y - j.y, accion: 'barrida' } : o;
    }
    // los demás se colocan según dónde esté el balón: más arriba si atacamos
    const adelante = tiene === j.eq ? 0.18 : tiene < 0 ? 0.06 : -0.08;
    const s = sitio(aj, j.eq, j.puesto, adelante);
    s.x = lim(s.x + (b.x - aj.largo / 2) * 0.45, 4, aj.largo - 4);
    s.y = lim(s.y + (b.y - aj.ancho / 2) * 0.3, 3, aj.ancho - 3);
    return hacia(j, s, 1);
  }

  function perseguidor(e, eq) {
    let mejor = null, d0 = 1e9;
    for (const j of e.jugadores) {
      if (j.eq !== eq || j.puesto === 'portero' || j.mareo > 0) continue;
      const d = dist(j, e.balon);
      if (d < d0) { d0 = d; mejor = j; }
    }
    return mejor;
  }

  // Órdenes para todos menos `controlado` (el id del jugador de la persona, o -1 si juega la máquina sola).
  S.ordenesIA = function (e, controlado, rnd) {
    const ord = {}, b = e.balon, persiguen = [perseguidor(e, 0), perseguidor(e, 1)];
    for (const j of e.jugadores) {
      if (j.id === controlado) continue;
      if (j.puesto === 'portero') ord[j.id] = portero(e, j);
      else if (b.dueno === j.id) ord[j.id] = conBalon(e, j, rnd);
      else ord[j.id] = sinBalon(e, j, persiguen[j.eq] === j && S.equipoConBalon(e) !== j.eq);
    }
    return ord;
  };

  // Qué jugador lleva la persona: el que tiene el balón o el de campo más cerca de él.
  S.elegirControlado = function (e, eq, actual) {
    const b = e.balon;
    if (b.dueno >= 0 && e.jugadores[b.dueno].eq === eq && e.jugadores[b.dueno].puesto !== 'portero') return b.dueno;
    const cerca = perseguidor(e, eq), act = e.jugadores[actual];
    if (!cerca) return actual;
    if (act && act.eq === eq && act.mareo <= 0 && (act.barrida > 0 || dist(act, b) < dist(cerca, b) + 3)) return actual;
    return cerca ? cerca.id : actual;
  };
  S.sentido = sentido;
})(SOCCER);
