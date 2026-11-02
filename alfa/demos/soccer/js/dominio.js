// Fans of Soccer · Dominio: las reglas del partido (balón, jugadores, barridas, tiros, súper tiros, paradas y goles).
// Sin reloj, sin azar propio (se le pasa rnd), sin DOM: paso(e, dt, ordenes, rnd) avanza el partido y deja en e.eventos lo que pasó.
'use strict';
var SOCCER = globalThis.SOCCER || (globalThis.SOCCER = {});
(function (S) {
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const lim = (v, a, b) => Math.max(a, Math.min(b, v));
  const metaX = (aj, eq) => (eq === 0 ? aj.largo : 0);          // la portería a la que ataca cada equipo
  const sentido = (eq) => (eq === 0 ? 1 : -1);

  function sitio(aj, eq, puesto, adelante) {
    const p = aj.puestos[puesto], f = p[0] + (puesto === 'portero' ? 0 : adelante);
    return { x: eq === 0 ? aj.largo * f : aj.largo * (1 - f), y: aj.ancho * p[1] };
  }

  function nuevoJugador(aj, eq, i, def) {
    const s = sitio(aj, eq, def[2], 0);
    return { id: eq * 4 + i, eq, sprite: def[0], nombre: def[1], puesto: def[2], x: s.x, y: s.y, vx: 0, vy: 0,
      mira: sentido(eq), mareo: 0, barrida: 0, espera: 0, corre: 0 };
  }

  S.nuevoPartido = function (aj) {
    const jugadores = [];
    aj.equipos.forEach((eq, n) => eq.jugadores.forEach((d, i) => jugadores.push(nuevoJugador(aj, n, i, d))));
    const e = { aj, t: aj.duracion, marcador: [0, 0], jugadores, energia: [0, 0], eventos: [], fin: false, pausa: 0,
      balon: { x: aj.largo / 2, y: aj.ancho / 2, z: 0, vx: 0, vy: 0, vz: 0, dueno: -1, tiro: null, ultimo: -1, libre: 0 } };
    S.saque(e, 0);
    return e;
  };

  // Saque de centro: todos a su sitio y el balón para el delantero del equipo que saca.
  S.saque = function (e, eq) {
    const aj = e.aj;
    e.jugadores.forEach((j) => { const s = sitio(aj, j.eq, j.puesto, 0); Object.assign(j, { x: s.x, y: s.y, vx: 0, vy: 0, mareo: 0, barrida: 0 }); });
    const b = e.balon, saca = e.jugadores.find((j) => j.eq === eq && j.puesto === 'delantero');
    Object.assign(b, { x: aj.largo / 2, y: aj.ancho / 2, z: 0, vx: 0, vy: 0, vz: 0, tiro: null, dueno: saca.id, libre: 0 });
    saca.x = b.x - sentido(eq) * 1.2; saca.y = b.y;
  };

  S.equipoConBalon = (e) => (e.balon.dueno < 0 ? -1 : e.jugadores[e.balon.dueno].eq);
  S.lleno = (e, eq) => e.energia[eq] >= e.aj.energia.max;

  function sumar(e, eq, n) { e.energia[eq] = Math.min(e.aj.energia.max, e.energia[eq] + n); }

  // ---------- acciones ----------
  function soltar(e, j, vx, vy, vz, tiro) {
    const b = e.balon;
    Object.assign(b, { dueno: -1, vx, vy, vz, tiro, ultimo: j.id, ultimoTiro: (b.ultimoTiro || 0) + 1, libre: 0.35, x: j.x + j.mira * 0.8, y: j.y, z: 0.3 });
    j.espera = 0.35;
  }

  function chutar(e, j, rnd) {
    const aj = e.aj, objetivo = { x: metaX(aj, j.eq), y: aj.porteria.y1 + 1 + rnd() * (aj.porteria.y2 - aj.porteria.y1 - 2) };
    const superTiro = S.lleno(e, j.eq) && j.puesto !== 'portero';
    const v = superTiro ? aj.vel.superTiro : aj.vel.tiro, d = Math.max(1, dist(j, objetivo));
    if (superTiro) e.energia[j.eq] = 0;
    const tipo = superTiro ? aj.equipos[j.eq].super : 'normal';
    soltar(e, j, (objetivo.x - j.x) / d * v, (objetivo.y - j.y) / d * v, superTiro ? 3 : 4 + rnd() * 4, { eq: j.eq, tipo, t: 0 });
    e.eventos.push({ tipo: superTiro ? 'super' : 'tiro', eq: j.eq, quien: j.id, clase: tipo });
  }

  function mejorCompanero(e, j) {
    let mejor = null, nota = -1e9;
    for (const o of e.jugadores) {
      if (o.eq !== j.eq || o.id === j.id || o.puesto === 'portero' || o.mareo > 0) continue;
      const avance = (o.x - j.x) * sentido(j.eq), libre = Math.min(...e.jugadores.filter((r) => r.eq !== j.eq).map((r) => dist(r, o)));
      const n = avance * 0.6 + libre * 1.5 - dist(o, j) * 0.15;
      if (n > nota) { nota = n; mejor = o; }
    }
    return mejor;
  }

  function pasar(e, j) {
    const o = mejorCompanero(e, j);
    if (!o) return;
    const aj = e.aj, d = Math.max(1, dist(j, o)), adel = { x: o.x + o.vx * 0.3, y: o.y + o.vy * 0.3 };
    soltar(e, j, (adel.x - j.x) / d * aj.vel.pase, (adel.y - j.y) / d * aj.vel.pase, d > 18 ? 5 : 1.5, null);
    sumar(e, j.eq, aj.energia.pase);
    e.eventos.push({ tipo: 'pase', eq: j.eq, quien: j.id, a: o.id });
  }

  function barrer(e, j, mx, my) {
    const aj = e.aj, m = Math.hypot(mx, my) || 1;
    const dx = Math.hypot(mx, my) > 0.1 ? mx / m : j.mira, dy = Math.hypot(mx, my) > 0.1 ? my / m : 0;
    j.vx = dx * aj.vel.barrida; j.vy = dy * aj.vel.barrida; j.barrida = aj.barrida.dura; j.espera = aj.barrida.espera;
    e.eventos.push({ tipo: 'barrida', quien: j.id });
  }

  S.actuar = function (e, j, orden, rnd) {
    if (!orden || !orden.accion || j.mareo > 0 || j.barrida > 0 || j.espera > 0) return;
    const tiene = e.balon.dueno === j.id;
    if (tiene && orden.accion === 'tiro') chutar(e, j, rnd);
    else if (tiene && orden.accion === 'pase') pasar(e, j);
    else if (!tiene && orden.accion === 'barrida' && j.puesto !== 'portero') barrer(e, j, orden.mx || 0, orden.my || 0);
  };

  // ---------- movimiento ----------
  function mover(e, j, orden, dt) {
    const aj = e.aj;
    if (j.mareo > 0) { j.vx = j.vy = 0; return; }
    if (j.barrida > 0) { j.vx *= 0.93; j.vy *= 0.93; }
    else {
      const mx = orden ? orden.mx : 0, my = orden ? orden.my : 0, m = Math.hypot(mx, my);
      const v = e.balon.dueno === j.id ? aj.vel.conBalon : j.puesto === 'portero' ? aj.vel.portero : aj.vel.jugador, k = m > 1 ? 1 / m : 1;
      j.vx = mx * k * v; j.vy = my * k * v;
      if (Math.abs(mx) > 0.15) j.mira = Math.sign(mx);
    }
    const borde = e.balon.dueno === j.id ? 2 : -1;   // con el balón no se entra andando en la portería
    j.x = lim(j.x + j.vx * dt, borde, aj.largo - borde); j.y = lim(j.y + j.vy * dt, 0, aj.ancho);
    j.corre = Math.hypot(j.vx, j.vy) > 0.5 ? j.corre + dt * Math.hypot(j.vx, j.vy) : 0;
  }

  function golpeBarrida(e, j) {
    const aj = e.aj;
    for (const o of e.jugadores) {
      if (o.eq === j.eq || o.puesto === 'portero' || o.mareo > 0 || dist(o, j) > aj.barrida.alcance) continue;   // al portero solo lo tumba un súper tiro
      const llevaba = e.balon.dueno === o.id;
      o.mareo = llevaba ? aj.barrida.mareo : aj.barrida.mareoSinBalon;
      if (llevaba) { const b = e.balon; Object.assign(b, { dueno: -1, vx: j.vx * 0.5, vy: j.vy * 0.5, vz: 4, libre: 0.15, tiro: null }); }
      sumar(e, j.eq, aj.energia.barrida);
      e.eventos.push({ tipo: 'derribo', quien: o.id, por: j.id, robo: llevaba });
    }
  }

  // ---------- balón ----------
  // El portero para lo que le llega cerca; lo que pasa al límite de su alcance a veces lo despeja y a veces se le cuela.
  function porteroPara(e, b, rnd) {
    for (const j of e.jugadores) {
      if (j.puesto !== 'portero' || j.mareo > 0 || j.vio === b.ultimoTiro) continue;
      if ((b.tiro && b.tiro.eq === j.eq) || (!b.tiro && b.ultimo >= 0 && e.jugadores[b.ultimo].eq === j.eq)) continue;
      const d = dist(j, b);
      if (d > 3.6 || b.z > 3.8) continue;
      if (b.tiro && b.tiro.tipo !== 'normal') { j.mareo = 2.5; e.eventos.push({ tipo: 'portero-ko', quien: j.id }); continue; }
      j.vio = b.ultimoTiro;
      if (d < 1.8 || !b.tiro) return atrapar(e, b, j);
      if (rnd() < 0.55) return despejar(e, b, j);
    }
    return false;
  }
  function atrapar(e, b, j) {
    Object.assign(b, { dueno: j.id, vx: 0, vy: 0, vz: 0, z: 0, tiro: null });
    j.espera = 0.9;
    e.eventos.push({ tipo: 'parada', quien: j.id });
    return true;
  }
  function despejar(e, b, j) {
    Object.assign(b, { vx: -b.vx * 0.35, vy: b.vy * 0.5 + (b.y < j.y ? -8 : 8), vz: 6, tiro: null, libre: 0.3, ultimo: j.id });
    e.eventos.push({ tipo: 'parada', quien: j.id, despeje: true });
    return true;
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
    if (b.dueno >= 0 && b.dueno !== mejor.id) return;
    Object.assign(b, { dueno: mejor.id, tiro: null, vz: 0, z: 0 });
  }

  function gol(e, b) {
    const aj = e.aj, dentro = b.y > aj.porteria.y1 && b.y < aj.porteria.y2 && b.z < aj.porteria.alto;
    if (!dentro || (b.x > 0 && b.x < aj.largo)) return false;
    const marca = b.x >= aj.largo ? 0 : 1;
    e.marcador[marca]++;
    e.eventos.push({ tipo: 'gol', eq: marca, clase: b.tiro ? b.tiro.tipo : 'normal' });
    e.pausa = 2.2; e.saca = 1 - marca;
    Object.assign(b, { vx: 0, vy: 0, vz: 0, tiro: null });
    return true;
  }

  function paredes(e, b) {
    const aj = e.aj, choque = (v) => { e.eventos.push({ tipo: 'rebote' }); return -v * aj.rebote; };
    if (b.x < 0 || b.x > aj.largo) { b.x = lim(b.x, 0, aj.largo); b.vx = choque(b.vx); if (b.tiro) b.tiro = null; }
    if (b.y < 0 || b.y > aj.ancho) { b.y = lim(b.y, 0, aj.ancho); b.vy = choque(b.vy); }
  }

  function balonLibre(e, b, dt, rnd) {
    const aj = e.aj;
    b.libre = Math.max(0, b.libre - dt);
    if (b.tiro) b.tiro.t += dt;
    if (b.tiro && b.tiro.tipo === 'zanahoria') b.vy += Math.sin(b.tiro.t * 30) * 90 * dt;   // zigzag del súper de los Animales
    b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt;
    b.vz -= aj.gravedad * dt;
    if (b.z <= 0) { b.z = 0; b.vz = Math.abs(b.vz) > 3 ? -b.vz * 0.45 : 0; b.vx *= aj.roce; b.vy *= aj.roce; }
    if (b.tiro && Math.hypot(b.vx, b.vy) < 12) b.tiro = null;
    if (gol(e, b)) return;
    paredes(e, b);
    if (!porteroPara(e, b, rnd)) coger(e, b);
  }

  function balonPegado(e, b) {
    const j = e.jugadores[b.dueno];
    b.x = j.x + j.mira * 0.9; b.y = j.y + 0.2; b.z = 0; b.vx = j.vx; b.vy = j.vy;
  }

  function relojes(e, dt) {
    for (const j of e.jugadores) {
      j.mareo = Math.max(0, j.mareo - dt); j.espera = Math.max(0, j.espera - dt);
      if (j.barrida > 0) j.barrida = Math.max(0, j.barrida - dt);
    }
    e.energia[0] = Math.min(e.aj.energia.max, e.energia[0] + e.aj.energia.porSegundo * dt);
    e.energia[1] = Math.min(e.aj.energia.max, e.energia[1] + e.aj.energia.porSegundo * dt);
  }

  // Un paso de simulación. ordenes[id] = { mx, my, accion }.
  S.paso = function (e, dt, ordenes, rnd) {
    e.eventos.length = 0;
    if (e.fin) return;
    if (e.pausa > 0) { e.pausa -= dt; if (e.pausa <= 0) S.saque(e, e.saca); return; }
    e.t = Math.max(0, e.t - dt);
    if (e.t <= 0) { e.fin = true; e.eventos.push({ tipo: 'fin' }); return; }
    relojes(e, dt);
    for (const j of e.jugadores) { S.actuar(e, j, ordenes[j.id], rnd); mover(e, j, ordenes[j.id], dt); if (j.barrida > 0) golpeBarrida(e, j); }
    const b = e.balon;
    if (b.dueno >= 0 && e.jugadores[b.dueno].mareo > 0) b.dueno = -1;
    if (b.dueno >= 0) balonPegado(e, b); else balonLibre(e, b, dt, rnd);
  };

  S.util = { dist, lim, metaX, sentido, sitio };
})(SOCCER);
