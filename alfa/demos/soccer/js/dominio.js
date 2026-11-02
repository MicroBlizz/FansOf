// Fans of Soccer · Dominio: el partido (equipos, campo, saques, partes, descanso, gol de oro, clima y el paso de simulación).
// Las acciones de los jugadores están en reglas.js y el balón en balon.js. Sin reloj, sin azar propio (se le pasa rnd), sin DOM:
// paso(e, dt, ordenes, rnd) avanza el partido y deja en e.eventos lo que pasó.
'use strict';
var SOCCER = globalThis.SOCCER || (globalThis.SOCCER = {});
(function (S) {
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const lim = (v, a, b) => Math.max(a, Math.min(b, v));
  const metaX = (aj, eq) => (eq === 0 ? aj.largo : 0);          // la portería a la que ataca cada lado (el 0 ataca a la derecha)
  const sentido = (eq) => (eq === 0 ? 1 : -1);
  const _ = S._ = {};                                             // lo que comparten dominio, reglas y balón

  function sitio(aj, eq, puesto, adelante) {
    const p = aj.puestos[puesto], f = p[0] + (puesto === 'portero' ? 0 : adelante);
    return { x: eq === 0 ? aj.largo * f : aj.largo * (1 - f), y: aj.ancho * p[1] };
  }
  S.util = { dist, lim, metaX, sentido, sitio };

  function nuevoJugador(aj, eq, i, def) {
    const s = sitio(aj, eq, def[2], 0), vida = aj.equipos[eq].vida;
    return { id: eq * 4 + i, eq, sprite: def[0], nombre: def[1], puesto: def[2], x: s.x, y: s.y, vx: 0, vy: 0,
      mira: sentido(eq), mareo: 0, ko: 0, barrida: 0, empujon: 0, espera: 0, corre: 0, vida, vidaMax: vida, carrera: 0, cargado: false };
  }

  // Ajustes de un partido: el campo (ancho, portería centrada) y los dos equipos que juegan (el 0 a la izquierda).
  S.ajustesDePartido = function (base, opc) {
    const idCampo = (opc && opc.campo) || 'atico', c = base.campos[idCampo];
    if (!c) throw new Error('Soccer: campo desconocido ' + idCampo);
    const ids = (opc && opc.equipos) || ['animales', 'microblizz'];
    const equipos = ids.map((id) => base.equipos.find((q) => q.id === id));
    if (equipos.some((q) => !q) || ids[0] === ids[1]) throw new Error('Soccer: equipos no válidos ' + ids.join(','));
    const m = c.ancho / 2;
    return Object.freeze(Object.assign({}, base, { ancho: c.ancho, equipos: Object.freeze(equipos),
      campo: Object.freeze(Object.assign({ id: idCampo }, c)),
      porteria: Object.freeze(Object.assign({}, base.porteria, { y1: m - base.porteria.medio, y2: m + base.porteria.medio })) }));
  };
  S.ajustesDeCampo = (base, idCampo) => S.ajustesDePartido(base, { campo: idCampo });

  const ESTRATEGIA = Object.freeze({ pasan: true, presionan: true, porteroSube: false });

  S.nuevoPartido = function (base, opc) {
    if (typeof opc === 'string') opc = { campo: opc };
    const aj = S.ajustesDePartido(base, opc), jugadores = [];
    aj.equipos.forEach((eq, n) => eq.jugadores.forEach((d, i) => jugadores.push(nuevoJugador(aj, n, i, d))));
    const e = { aj, t: aj.parte, parte: 1, oro: false, descanso: false, marcador: [0, 0], jugadores, energia: [0, 0],
      supers: [aj.supersPorParte, aj.supersPorParte], eventos: [], fin: false, pausa: 0, saca: 0, saqueParte: 0,
      estrategia: [Object.assign({}, ESTRATEGIA, opc && opc.estrategia), Object.assign({}, ESTRATEGIA)],
      clima: { tipo: null, t: 0, proximo: aj.clima.cada, fuerza: 1 },
      balon: { x: aj.largo / 2, y: aj.ancho / 2, z: 0, vx: 0, vy: 0, vz: 0, dueno: -1, tiro: null, ultimo: -1, libre: 0, paseDe: -1 } };
    S.saque(e, 0);
    return e;
  };

  // Saque de centro: todos a su sitio y el balón para el delantero del equipo que saca. El KO se respeta (siguen tumbados).
  S.saque = function (e, eq) {
    const aj = e.aj;
    e.jugadores.forEach((j) => { const s = sitio(aj, j.eq, j.puesto, 0); Object.assign(j, { x: s.x, y: s.y, vx: 0, vy: 0, barrida: 0, empujon: 0, carrera: 0, cargado: false }); if (!j.ko) j.mareo = 0; });
    const b = e.balon, saca = e.jugadores.find((j) => j.eq === eq && j.puesto === 'delantero' && !j.ko) || e.jugadores.find((j) => j.eq === eq && j.puesto === 'portero');
    Object.assign(b, { x: aj.largo / 2, y: aj.ancho / 2, z: 0, vx: 0, vy: 0, vz: 0, tiro: null, dueno: saca.id, libre: 0, paseDe: -1 });
    saca.x = b.x - sentido(eq) * 1.2; saca.y = b.y;
  };

  S.equipoConBalon = (e) => (e.balon.dueno < 0 ? -1 : e.jugadores[e.balon.dueno].eq);
  S.lleno = (e, eq) => e.energia[eq] >= e.aj.energia.max;
  S.puedeSuper = (e, j) => e.supers[j.eq] > 0 && j.puesto !== 'portero' && (j.cargado || S.lleno(e, j.eq));
  _.sumar = (e, eq, n) => { e.energia[eq] = Math.min(e.aj.energia.max, e.energia[eq] + n); };

  // ---------- tiempo: partes, descanso, gol de oro ----------
  function finDeTiempo(e) {
    if (e.oro || e.parte >= e.aj.partes) {
      if (e.marcador[0] === e.marcador[1] && !e.oro) { e.oro = true; e.t = e.aj.oro; e.eventos.push({ tipo: 'oro' }); return; }
      e.fin = true; e.eventos.push({ tipo: 'fin' });
      return;
    }
    e.descanso = true; e.eventos.push({ tipo: 'descanso' });
  }

  // Tras el descanso: se recupera la vida y los súper tiros, y saca el otro equipo.
  S.reanudar = function (e) {
    if (!e.descanso) return;
    e.descanso = false; e.parte++; e.t = e.aj.parte; e.supers = [e.aj.supersPorParte, e.aj.supersPorParte];
    for (const j of e.jugadores) { j.vida = j.vidaMax; j.ko = 0; j.mareo = 0; }
    e.saqueParte = 1 - e.saqueParte;
    S.saque(e, e.saqueParte);
  };

  // ---------- clima: de vez en cuando algo cambia en el campo ----------
  function clima(e, dt, rnd) {
    const c = e.clima, aj = e.aj;
    if (c.tipo) { c.t -= dt; if (c.t <= 0) { e.eventos.push({ tipo: 'clima-fin', clima: c.tipo }); c.tipo = null; } return; }
    c.proximo -= dt;
    if (c.proximo > 0) return;
    c.proximo = aj.clima.cada * (0.7 + rnd() * 0.6);
    c.tipo = aj.campo.clima; c.t = aj.clima.dura; c.fuerza = rnd() < 0.5 ? -1 : 1;
    if (c.tipo === 'aceite') c.charco = [15 + rnd() * 70, 6 + rnd() * (aj.ancho - 12), 4.5];
    e.eventos.push({ tipo: 'clima', clima: c.tipo });
  }
  _.charcos = (e) => (e.clima.tipo === 'aceite' && e.clima.charco ? e.aj.campo.charcos.concat([e.clima.charco]) : e.aj.campo.charcos);
  _.viento = (e) => e.aj.campo.viento * (e.clima.tipo === 'racha' ? 3.5 * e.clima.fuerza : Math.sin(e.t * 0.4));

  function relojes(e, dt) {
    for (const j of e.jugadores) {
      if (j.ko > 0) { j.ko = Math.max(0, j.ko - dt); if (!j.ko) { j.vida = j.vidaMax; j.mareo = 0; e.eventos.push({ tipo: 'vuelve', quien: j.id }); } }
      j.mareo = j.ko > 0 ? j.ko : Math.max(0, j.mareo - dt); j.espera = Math.max(0, j.espera - dt);
      if (j.barrida > 0) j.barrida = Math.max(0, j.barrida - dt);
      if (j.empujon > 0) j.empujon = Math.max(0, j.empujon - dt);
    }
    for (const eq of [0, 1]) e.energia[eq] = Math.min(e.aj.energia.max, e.energia[eq] + e.aj.energia.porSegundo * dt);
  }

  // Un paso de simulación. ordenes[id] = { mx, my, accion } (accion: 'tiro' | 'pase' | 'barrida' | 'empujon').
  S.paso = function (e, dt, ordenes, rnd) {
    e.eventos.length = 0;
    if (e.fin || e.descanso) return;
    if (e.pausa > 0) { e.pausa -= dt; if (e.pausa <= 0) { if (e.fin) return; S.saque(e, e.saca); } return; }
    e.t = Math.max(0, e.t - dt);
    if (e.t <= 0) { finDeTiempo(e); return; }
    relojes(e, dt);
    clima(e, dt, rnd);
    for (const j of e.jugadores) { S.actuar(e, j, ordenes[j.id], rnd); _.mover(e, j, ordenes[j.id], dt); _.golpes(e, j); }
    _.balon(e, dt, rnd);
  };

  // Gol: lo apunta, y en el gol de oro acaba el partido.
  _.marcarGol = function (e, marca, clase) {
    e.marcador[marca]++;
    e.eventos.push({ tipo: 'gol', eq: marca, clase });
    e.pausa = 2.6; e.saca = 1 - marca;
    if (e.oro) { e.fin = true; e.eventos.push({ tipo: 'fin' }); }
  };
})(SOCCER);
