// Fans of Soccer · El balón: vuelo, botes, viento, recorrido propio de cada súper tiro, atropellos, porteros (paradas, despejes y
// salir volando), vallas, goles y quién se hace con él. Sin DOM ni azar propio.
'use strict';
var SOCCER = globalThis.SOCCER || (globalThis.SOCCER = {});
(function (S) {
  const { dist, lim, metaX, enArea } = S.util, _ = S._;
  // cuánto le cuesta al portero cada súper tiro (multiplica su probabilidad de pararlo)
  const DIFICIL = { zanahoria: 0.9, carga: 0.85, fantasma: 0.75, teletransporte: 0.7, factura: 0.5 };

  // ---------- recorrido de cada súper tiro ----------
  const RECORRIDO = {
    zanahoria(e, b, dt) { b.vy += Math.sin(b.tiro.t * 30) * 90 * dt; },                     // zigzag
    carga(e, b, dt) {                                                                        // se queda «cargando» en el aire y sale disparado
      const tr = b.tiro;
      if (!tr.cargo && tr.t > 0.18) { tr.cargo = 0.55; tr.v = [b.vx, b.vy]; b.vz = 0; e.eventos.push({ tipo: 'cargando' }); }
      if (tr.cargo > 0) { tr.cargo -= dt; b.vx = b.vy = 0; b.vz = 0; b.z = Math.max(b.z, 1.8); if (tr.cargo <= 0) { b.vx = tr.v[0] * 1.3; b.vy = tr.v[1] * 1.3; tr.cargo = -1; } }
    },
    fantasma(e, b) {                                                                         // sube muchísimo y cae en picado
      const tr = b.tiro, total = Math.abs(tr.objetivo.x - tr.x0), falta = Math.abs(tr.objetivo.x - b.x), p = lim(1 - falta / Math.max(1, total), 0, 1);
      b.z = 0.8 + 11 * Math.sin(Math.PI * p) * (p < 0.8 ? 1 : (1 - p) * 5); b.vz = 0;
    },
    teletransporte(e, b) {                                                                   // salta a trozos
      const tr = b.tiro;
      if (tr.t - (tr.salto || 0) < 0.16) return;
      tr.salto = tr.t; const k = 5.5 / Math.max(1, Math.hypot(b.vx, b.vy));
      b.x += b.vx * k; b.y += b.vy * k;
      e.eventos.push({ tipo: 'salto', x: b.x, y: b.y });
    },
    factura() { /* la vista dibuja dos balones falsos al lado: el portero no sabe cuál parar */ },
  };

  // El súper tiro tumba a los rivales de campo que se cruzan en su camino (menos el fantasma, que pasa por encima).
  function atropellos(e, b) {
    if (!b.tiro || b.tiro.tipo === 'normal' || b.tiro.tipo === 'fantasma' || b.z > 2.5) return;
    for (const o of e.jugadores) {
      if (o.eq === b.tiro.eq || o.puesto === 'portero' || o.mareo > 0 || dist(o, b) > 1.6) continue;
      o.mareo = 1.5; _.danar(e, o, e.aj.golpeSuper, b.tiro.desde);
      e.eventos.push({ tipo: 'atropello', quien: o.id });
    }
  }

  // ---------- porteros ----------
  function atrapar(e, b, j, clase) {
    if (dist(j, b) > 1.8) j.estira = 0.45;
    Object.assign(b, { dueno: j.id, vx: 0, vy: 0, vz: 0, z: 0, tiro: null, paseDe: -1 });
    j.espera = 0.9;
    e.eventos.push({ tipo: 'parada', quien: j.id, clase });
    return true;
  }
  // Despeje: el balón sale lejos del área y el portero se rehace enseguida (sin rechace fácil para rematar).
  function despejar(e, b, j) {
    const fuera = j.eq === 0 ? 1 : -1;
    j.estira = 0.45;
    Object.assign(b, { vx: fuera * 20, vy: (b.y < j.y ? -1 : 1) * 12, vz: 9, tiro: null, libre: 0.35, ultimo: j.id, paseDe: -1 });
    j.espera = 0.25;
    e.eventos.push({ tipo: 'parada', quien: j.id, despeje: true });
    return true;
  }
  // Súper tiro: lo para con su probabilidad; si falla, sale volando hacia dentro de la portería y el balón sigue.
  function contraSuper(e, b, j, rnd) {
    if (rnd() < e.aj.equipos[j.eq].parada * (DIFICIL[b.tiro.tipo] || 1)) return atrapar(e, b, j, 'super');
    j.estira = 0; j.mareo = 2.5; j.vuelo = 0.7; j.vx = b.vx * 0.3; j.vy = 0;
    e.eventos.push({ tipo: 'portero-ko', quien: j.id, clase: b.tiro.tipo });
    return false;
  }

  function porteroPara(e, b, rnd) {
    for (const j of e.jugadores) {
      if (j.puesto !== 'portero' || j.mareo > 0 || j.vio === b.ultimoTiro || !enArea(e.aj, j)) continue;   // con las manos, solo en su área
      if ((b.tiro && b.tiro.eq === j.eq) || (!b.tiro && b.ultimo >= 0 && e.jugadores[b.ultimo].eq === j.eq)) continue;
      const d = dist(j, b);
      if (d > 3.6 || b.z > 3.8) continue;
      j.vio = b.ultimoTiro;
      if (b.tiro && b.tiro.tipo !== 'normal') { if (contraSuper(e, b, j, rnd)) return true; continue; }
      if (d < 1.8 || !b.tiro) return atrapar(e, b, j, 'normal');
      if (rnd() < 0.55) return despejar(e, b, j);
    }
    return false;
  }

  function coger(e, b) {
    if (b.libre > 0 || b.z > 2.2) return;
    let mejor = null, d0 = e.aj.coger;
    for (const j of e.jugadores) {
      const d = dist(j, b);
      if (j.mareo > 0 || j.barrida > 0 || (j.espera > 0 && b.ultimo === j.id) || d > d0) continue;
      if (b.tiro && j.puesto !== 'portero' && b.tiro.tipo !== 'normal') continue;   // el súper tiro no se corta
      mejor = j; d0 = d;
    }
    if (!mejor) return;
    b.recibe = b.paseDe >= 0 && e.jugadores[b.paseDe].eq === mejor.eq ? b.paseDe : -1;   // quién se la pasó (para cambiar de jugador)
    Object.assign(b, { dueno: mejor.id, tiro: null, vz: 0, z: 0, paseDe: -1 });
    mejor.carrera = 0;
    e.eventos.push({ tipo: 'control', quien: mejor.id });
  }

  function gol(e, b) {
    const aj = e.aj, dentro = b.y > aj.porteria.y1 && b.y < aj.porteria.y2 && b.z < aj.porteria.alto;
    if (!dentro || (b.x > 0 && b.x < aj.largo)) return false;
    _.marcarGol(e, b.x >= aj.largo ? 0 : 1, b.tiro ? b.tiro.tipo : 'normal');
    Object.assign(b, { vx: 0, vy: 0, vz: 0, tiro: null });
    return true;
  }

  function paredes(e, b) {
    const aj = e.aj, choque = (v) => { e.eventos.push({ tipo: 'rebote' }); return lim(-v * aj.campo.rebote, -aj.vel.superTiro, aj.vel.superTiro); };
    if (b.x < 0 || b.x > aj.largo) { b.x = lim(b.x, 0, aj.largo); b.vx = choque(b.vx); if (b.tiro) b.tiro = null; }
    if (b.y < 0 || b.y > aj.ancho) { b.y = lim(b.y, 0, aj.ancho); b.vy = choque(b.vy); }
  }

  function vuelo(e, b, dt) {
    const aj = e.aj, tr = b.tiro;
    if (tr) { tr.t += dt; if (tr.x0 === undefined) tr.x0 = b.x; if (RECORRIDO[tr.tipo]) RECORRIDO[tr.tipo](e, b, dt); }
    b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt;
    const flota = tr && (tr.tipo === 'fantasma' || tr.cargo > 0);
    if (!flota) b.vz -= aj.gravedad * dt;
    if (b.z > 0.5) b.vy += _.viento(e) * dt;                                                 // viento del Ático
    if (b.z <= 0) { b.z = 0; b.vz = Math.abs(b.vz) > 3 ? -b.vz * aj.campo.bote : 0; b.vx *= aj.roce; b.vy *= aj.roce; }
    if (tr && !(tr.cargo > 0) && Math.hypot(b.vx, b.vy) < 12) b.tiro = null;
  }

  function balonPegado(e, b) {
    const j = e.jugadores[b.dueno];
    b.x = j.x + j.mira * 0.9; b.y = j.y + 0.2; b.z = 0; b.vx = j.vx; b.vy = j.vy;
  }

  _.balon = function (e, dt, rnd) {
    const b = e.balon;
    if (b.dueno >= 0 && e.jugadores[b.dueno].mareo > 0) b.dueno = -1;
    if (b.dueno >= 0) return balonPegado(e, b);
    b.libre = Math.max(0, b.libre - dt);
    vuelo(e, b, dt);
    atropellos(e, b);
    if (gol(e, b)) return;
    paredes(e, b);
    if (!porteroPara(e, b, rnd)) coger(e, b);
  };
})(SOCCER);
