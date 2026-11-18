// Fans of Spy · DOMINIO · Las cartas: qué hace cada una. Cada efecto es una entrada de la tabla EFECTOS con tres funciones:
// puede(c) -> null si se puede jugar o el código de por qué no; objetivos(c, carta) -> { clase: 'celdas' | 'guardias' | 'nada', lista };
// y aplica(c, carta, objetivo). Los datos de cada carta (coste, ruido, pasos…) están en js/ajustes.js. Todo se hace con cartas:
// moverse, esconderse, distraer, derribar y esconder a un guardia. `c` es el contexto { aj, planta, p, azar }.
'use strict';
var SPY = globalThis.SPY || (globalThis.SPY = {});
(function (S) {
  const R = S.rejilla, V = S.vision, G = S.guardias;
  const ATENTOS = ['tranquilo', 'vuelve', 'sospecha', 'mira'], DESCUIDADOS = ['tranquilo', 'vuelve', 'cafe'];
  const ev = (c, t, datos) => { c.p.eventos.push({ t, ...datos }); };
  const NADA = Object.freeze({ clase: 'nada', lista: Object.freeze([]) });
  const enPie = (g) => g.estado !== 'derribado';
  const guardia = (c, id) => c.p.guardias.find((g) => g.id === id);
  const pegados = (c, vale) => c.p.guardias.filter((g) => R.manh(g, c.p.agente) === 1 && vale(g)).map((g) => ({ id: g.id, x: g.x, y: g.y }));

  // Por dónde puede andar el agente: suelo, sin guardias en pie (por encima de uno derribado sí pasa).
  const pisable = (c) => (x, y) => c.planta.pisaAgente(x, y) && !c.p.guardias.some((g) => enPie(g) && g.x === x && g.y === y);
  function destinos(c, pasos) {
    const lista = [];
    for (const d of R.alcance(pisable(c), c.p.agente, pasos).values()) if (d.d > 0) lista.push({ x: d.x, y: d.y, d: d.d });
    return { clase: 'celdas', lista };
  }

  // Un secreto de la planta (el cochazo del CEO): cuenta si el agente llega a su lado sin que haya saltado ninguna alerta.
  function secretos(c) {
    const p = c.p;
    for (const s of p.secretos) {
      if (s.hecho || p.cuenta.alertas > 0 || R.manh(s, p.agente) !== 1) continue;
      s.hecho = true; p.cuenta.secretos++;
      ev(c, 'secreto', { x: s.x, y: s.y });
    }
  }

  // El agente anda hasta `destino` casilla a casilla. En cada una se mira si lo ven; al final, el ruido que haga.
  function mueve(c, destino, pasos, radio, modo) {
    const p = c.p, a = p.agente, camino = R.camino(R.alcance(pisable(c), a, pasos), destino);
    if (a.oculto) { a.oculto = false; ev(c, 'sale', {}); }
    const e = { t: 'mueve', quien: 'agente', modo, camino: [] };
    p.eventos.push(e);
    for (const paso of camino) {
      a.dir = R.dirHacia(a, paso, a.dir); a.x = paso.x; a.y = paso.y;
      e.camino.push({ x: a.x, y: a.y, dir: a.dir });
      G.trasPasoDelAgente(c);
      secretos(c);
    }
    if (radio > 0) G.ruido(c, a, radio);
  }

  function derriba(c, g) {
    g.estado = 'derribado'; g.objetivo = null;
    c.p.cuenta.derribos++;
    ev(c, 'derriba', { quien: g.id });
  }

  // Roba cartas; si hay que rebarajar, se cobra en el coste del turno.
  function roba(c, n) {
    const r = S.baraja.roba(c.p.baraja, n, c.aj.turno.mano, c.azar);
    if (r.rebarajadas) { c.p.turno.gasto += r.rebarajadas * c.aj.turno.rebarajar; ev(c, 'rebaraja', { coste: r.rebarajadas * c.aj.turno.rebarajar }); }
    if (r.robadas.length) ev(c, 'roba', { cartas: r.robadas });
    return r;
  }

  const mover = { puede: () => null, objetivos: (c, carta) => destinos(c, carta.pasos), aplica: (c, carta, o) => mueve(c, o, carta.pasos, carta.ruido, carta.id) };
  const haySolidoAlLado = (c) => R.RECTAS.some((r) => c.planta.solida(c.p.agente.x + R.DIRS[r].x, c.p.agente.y + R.DIRS[r].y));
  const libreParaCafe = (c, x, y) => '.S'.includes(c.planta.tipo(x, y)) && !c.p.guardias.some((g) => g.x === x && g.y === y) && !c.p.objetos.some((o) => o.x === x && o.y === y);

  const EFECTOS = {
    carrera: mover,
    puntillas: mover,
    caja: {
      puede: (c) => (c.p.agente.oculto ? 'ya-escondido' : G.vistoAhora(c) ? 'te-ven' : null),
      objetivos: () => NADA,
      aplica(c) { c.p.agente.oculto = 'caja'; ev(c, 'caja', {}); },
    },
    golpe: {
      puede: (c) => (!haySolidoAlLado(c) ? 'sin-pared' : c.p.guardias.some((g) => ATENTOS.includes(g.estado)) ? null : 'sin-guardias'),
      objetivos: () => NADA,
      aplica(c) {
        const a = c.p.agente, cerca = c.p.guardias.filter((g) => ATENTOS.includes(g.estado)).sort((g, h) => R.manh(g, a) - R.manh(h, a))[0];
        ev(c, 'toc', { x: a.x, y: a.y, quien: cerca.id });
        G.sospecha(c, cerca, a);
      },
    },
    cafe: {
      puede: () => null,
      objetivos(c) {
        const a = c.p.agente, lista = R.RECTAS.map((r) => ({ x: a.x + R.DIRS[r].x, y: a.y + R.DIRS[r].y })).filter((o) => libreParaCafe(c, o.x, o.y));
        return { clase: 'celdas', lista };
      },
      aplica(c, carta, o) { c.p.objetos.push({ tipo: 'cafe', x: o.x, y: o.y }); ev(c, 'deja', { tipo: 'cafe', x: o.x, y: o.y }); },
    },
    grapadora: {
      puede: () => null,
      objetivos: (c) => ({ clase: 'guardias', lista: pegados(c, (g) => DESCUIDADOS.includes(g.estado) && !(G.activo(g) && V.ve(c.planta, G.ojos(c.aj, g), c.p.agente))) }),
      aplica: (c, carta, o) => derriba(c, guardia(c, o.id)),
    },
    zanahoriazo: {
      puede: () => null,
      objetivos: (c) => ({ clase: 'guardias', lista: pegados(c, enPie) }),
      aplica(c, carta, o) { derriba(c, guardia(c, o.id)); G.ruido(c, c.p.agente, carta.ruido); },
    },
    lanzapelotas: {
      puede: () => null,
      objetivos(c, carta) {
        const a = c.p.agente, a_tiro = (g) => enPie(g) && R.recta(a, g) <= carta.alcance + 0.01 && R.lineaLibre(a, g, c.planta.opaca);
        return { clase: 'guardias', lista: c.p.guardias.filter(a_tiro).map((g) => ({ id: g.id, x: g.x, y: g.y })) };
      },
      aplica(c, carta, o) {
        const g = guardia(c, o.id);
        g.vida -= carta.dano;
        ev(c, 'disparo', { quien: g.id, dano: carta.dano });
        if (g.vida <= 0) derriba(c, g); else G.alarma(c, g.id);
        G.ruido(c, c.p.agente, carta.ruido);
      },
    },
    maquina: {
      puede: (c) => (c.p.agente.vida >= c.p.agente.vidaMax ? 'vida-llena' : null),
      objetivos: () => NADA,
      aplica(c, carta) { const a = c.p.agente; a.vida = Math.min(a.vidaMax, a.vida + carta.cura); ev(c, 'cura', { vida: a.vida }); },
    },
    descanso: {
      puede: () => null,
      objetivos: () => NADA,
      aplica(c, carta) { c.p.turno.gasto = Math.max(0, c.p.turno.gasto - carta.resta); ev(c, 'descanso', { gasto: c.p.turno.gasto }); },
    },
    agenda: { puede: () => null, objetivos: () => NADA, aplica: (c, carta) => { roba(c, carta.roba); } },
    plano: { puede: () => null, objetivos: () => NADA, aplica(c, carta) { c.p.plano = carta.turnos; ev(c, 'plano', { turnos: carta.turnos }); } },
    carro: {
      puede: () => null,
      objetivos: (c) => ({ clase: 'guardias', lista: pegados(c, (g) => g.estado === 'derribado' && !g.escondido) }),
      aplica(c, carta, o) { guardia(c, o.id).escondido = true; c.p.cuenta.escondidos++; ev(c, 'esconde', { quien: o.id }); },
    },
  };

  // Lo que cuesta una carta a este agente: las de su especialidad, 1 menos.
  function coste(aj, agente, id) {
    const carta = aj.cartas[id], rebaja = carta.cuerpo && aj.agentes[agente.id].descuento === 'cuerpo' ? 1 : 0;
    return Math.max(0, carta.coste - rebaja);
  }

  // ¿El objetivo elegido es uno de los que admite la carta?
  function vale(objetivos, o) {
    if (objetivos.clase === 'nada') return true;
    if (!o) return false;
    return objetivos.lista.some((x) => (objetivos.clase === 'guardias' ? x.id === o.id : x.x === o.x && x.y === o.y));
  }

  S.cartas = Object.freeze({
    EFECTOS, coste, vale, roba, destinos, mueve,
    carta: (aj, id) => ({ id, ...aj.cartas[id] }),
  });
})(SPY);
