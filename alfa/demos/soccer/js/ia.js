// Fans of Soccer · IA: decide las órdenes de los jugadores que no lleva la persona (porteros, compañeros y el rival).
// Sigue la estrategia de cada equipo (pasan o regatean, presionan o marcan, portero quieto o sube) y su nivel (0 a 1).
// Devuelve órdenes { mx, my, accion, velocidad } que luego aplica el dominio; el azar llega de fuera (rnd).
'use strict';
var SOCCER = globalThis.SOCCER || (globalThis.SOCCER = {});
(function (S) {
  const { dist, lim, metaX, sitio } = S.util;
  const hacia = (j, p, frena = 0.6) => { const dx = p.x - j.x, dy = p.y - j.y, d = Math.hypot(dx, dy); return d < frena ? { mx: 0, my: 0 } : { mx: dx / d, my: dy / d }; };
  const nivel = (e, eq) => e.aj.equipos[eq].nivel;
  const ritmo = (e, eq) => 0.9 + 0.2 * nivel(e, eq);

  function portero(e, j) {
    const aj = e.aj, b = e.balon, est = e.estrategia[j.eq], base = sitio(aj, j.eq, 'portero', 0);
    if (b.dueno === j.id) return j.espera > 0 ? { mx: 0, my: 0 } : { mx: 0, my: 0, accion: 'pase' };
    if (est.porteroSube && S.equipoConBalon(e) === j.eq) return hacia(j, sitio(aj, j.eq, 'defensa', 0.02), 1);
    const cerca = Math.abs(b.x - base.x) < 9 && b.dueno < 0 && !b.tiro;
    const viene = b.tiro && b.tiro.eq !== j.eq && Math.abs(b.vx) > 1;
    const yObjetivo = viene ? b.y + b.vy * ((base.x - b.x) / b.vx) : b.y;   // donde cruzará la línea de gol
    const p = cerca ? b : { x: base.x, y: lim(yObjetivo, aj.porteria.y1 + 1, aj.porteria.y2 - 1) };
    return hacia(j, p, 0.3);
  }

  function conBalon(e, j, rnd) {
    const aj = e.aj, est = e.estrategia[j.eq], meta = { x: metaX(aj, j.eq), y: aj.ancho / 2 + (rnd() - 0.5) * 6 };
    const rivalCerca = e.jugadores.some((o) => o.eq !== j.eq && o.mareo <= 0 && dist(o, j) < aj.ia.presion);
    const lejos = Math.abs(meta.x - j.x), aTiro = lejos < aj.ia.distTiro;
    const quiereSuper = S.puedeSuper(e, j) && rnd() < 0.3 + nivel(e, j.eq) * 0.7;
    let accion = null;
    if (aTiro && (quiereSuper || lejos < 9 || rnd() < 0.05 + nivel(e, j.eq) * 0.05)) accion = 'tiro';
    else if (rivalCerca && rnd() < (est.pasan ? 0.16 : 0.05)) accion = 'pase';
    // regate: si hay alguien delante, se abre un poco hacia el lado libre
    const o = hacia(j, meta), esquiva = rivalCerca ? (j.y < aj.ancho / 2 ? 0.6 : -0.6) : 0;
    return { mx: o.mx, my: o.my + esquiva, accion, velocidad: ritmo(e, j.eq) };
  }

  // Ir a por el balón: si el que lo lleva está a tiro, barrida; si le sacas vida y el equipo es bueno, empujón.
  function perseguir(e, j, rnd) {
    const b = e.balon, portador = b.dueno >= 0 ? e.jugadores[b.dueno] : null;
    const aTiro = portador && portador.eq !== j.eq && portador.puesto !== 'portero' && dist(j, portador) < 3.2 && j.espera <= 0;
    if (aTiro && rnd() < 0.15 + nivel(e, j.eq) * 0.25) {
      const accion = j.vida > portador.vida && rnd() < nivel(e, j.eq) ? 'empujon' : 'barrida';
      return { mx: portador.x - j.x, my: portador.y - j.y, accion };
    }
    const o = hacia(j, { x: b.x + b.vx * 0.25, y: b.y + b.vy * 0.25 }, 0.2);
    o.velocidad = ritmo(e, j.eq);
    return o;
  }

  function colocarse(e, j) {
    const aj = e.aj, b = e.balon, tiene = S.equipoConBalon(e);
    const adelante = tiene === j.eq ? 0.18 : tiene < 0 ? 0.06 : -0.08;   // más arriba si atacamos
    const s = sitio(aj, j.eq, j.puesto, adelante);
    s.x = lim(s.x + (b.x - aj.largo / 2) * 0.45, 4, aj.largo - 4);
    s.y = lim(s.y + (b.y - aj.ancho / 2) * 0.3, 3, aj.ancho - 3);
    return hacia(j, s, 1);
  }

  // Remate de cabeza o chilena si el balón pasa por el aire cerca.
  function puedeRematar(e, j) {
    const b = e.balon, r = e.aj.remate;
    return b.dueno < 0 && b.z > r.zMin && b.z < r.zMax && dist(j, b) < r.alcance && Math.abs(metaX(e.aj, j.eq) - j.x) < 35;
  }

  // Quiénes van a por el balón de cada equipo: el más cercano y, si el equipo presiona, también el segundo.
  function perseguidores(e, eq) {
    const lista = e.jugadores.filter((j) => j.eq === eq && j.puesto !== 'portero' && j.mareo <= 0).sort((a, b) => dist(a, e.balon) - dist(b, e.balon));
    return lista.slice(0, e.estrategia[eq].presionan ? 2 : 1);
  }

  function campo(e, j, persiguen, rnd) {
    const b = e.balon;
    if (b.dueno === j.id) return conBalon(e, j, rnd);
    if (puedeRematar(e, j) && rnd() < 0.5) return { mx: 0, my: 0, accion: 'tiro' };
    if (persiguen[j.eq].includes(j) && S.equipoConBalon(e) !== j.eq) return perseguir(e, j, rnd);
    return colocarse(e, j);
  }

  // Órdenes para todos menos `controlado` (el id del jugador de la persona, o -1 si juega la máquina sola).
  S.ordenesIA = function (e, controlado, rnd) {
    const ord = {}, persiguen = [perseguidores(e, 0), perseguidores(e, 1)];
    for (const j of e.jugadores) {
      if (j.id === controlado || j.mareo > 0) continue;
      ord[j.id] = j.puesto === 'portero' ? portero(e, j) : campo(e, j, persiguen, rnd);
    }
    return ord;
  };

  // Qué jugador lleva la persona: el suyo de siempre (estilo Nintendo World Cup), salvo que le hayan pasado el balón a otro,
  // que esté tumbado o que el balón lo tenga un compañero lejos de él: entonces pasa al que lo tiene o al más cercano.
  S.elegirControlado = function (e, eq, actual) {
    const b = e.balon, act = e.jugadores[actual], dueno = b.dueno >= 0 ? e.jugadores[b.dueno] : null;
    if (dueno && dueno.eq === eq && dueno.puesto !== 'portero' && (b.recibe === actual || !act || dist(act, b) > 25)) return dueno.id;
    if (act && act.eq === eq && act.mareo <= 0 && act.puesto !== 'portero') {
      if (dueno && dueno.eq === eq) return actual;                      // un compañero lo lleva: le das órdenes
      if (act.barrida > 0 || act.empujon > 0) return actual;
      const cerca = perseguidores(e, eq)[0];
      return cerca && dist(cerca, b) + 4 < dist(act, b) ? cerca.id : actual;
    }
    const cerca = perseguidores(e, eq)[0];
    return cerca ? cerca.id : actual;
  };
})(SOCCER);
