// Fans of Spy · DOMINIO · La partida de una planta: crearla, jugar una carta por su efecto, gastar una carta para andar y acabar
// el turno. La partida es un objeto de datos sencillo (se puede copiar con JSON para rebobinar el tutorial o guardarla). Cada
// operación valida antes de tocar nada, devuelve SPY.ok({ eventos }) o SPY.error('codigo') y deja en p.eventos, en orden, todo lo
// que ha pasado para que la pantalla lo anime. El contexto `c` = { aj, planta, p, azar } se hace con SPY.partida.contexto.
'use strict';
var SPY = globalThis.SPY || (globalThis.SPY = {});
(function (S) {
  const R = S.rejilla, G = S.guardias, C = S.cartas, T = S.turnos;
  const ev = (c, t, datos) => { c.p.eventos.push({ t, ...datos }); };

  function guardiaNuevo(aj, d) {
    const ruta = d.ruta ? d.ruta.map((r) => ({ x: r[0], y: r[1] })) : null, dir = R.NOMBRES[d.dir];
    return { id: d.id, tipo: d.tipo, x: d.x, y: d.y, dir, estado: 'tranquilo', vida: aj.guardias[d.tipo].vida, listo: d.listo,
      ruta, iRuta: ruta ? d.hacia || 0 : 0, sentido: 1, ciclo: !!d.ciclo, puesto: { x: d.x, y: d.y, dir },
      objetivo: null, mirar: 0, bebe: 0, vuelta: null, escondido: false, visto: false };
  }
  const camaraNueva = (d) => ({ id: d.id, x: d.x, y: d.y, dirs: d.dirs.map((n) => R.NOMBRES[n]), i: 0, listo: d.listo });

  const contexto = (aj, plantas, p, azar) => ({ aj, planta: S.planta.de(plantas, p.nivel), p, azar });

  // Una partida nueva en la planta `id`. opc: { azar (obligatorio), agente, mazo (lista de cartas), barajar (false = en su orden), mano }.
  function nueva(aj, plantas, id, opc) {
    const agente = opc.agente || 'bunny', A = aj.agentes[agente], mazo = opc.mazo || aj.mazos[agente];
    if (!plantas[id]) return S.error('sin-planta');
    if (!A || !mazo) return S.error('sin-agente');
    if (mazo.some((carta) => !aj.cartas[carta])) return S.error('carta-desconocida');
    const planta = S.planta.de(plantas, id), d = planta.datos;
    const p = {
      nivel: id,
      agente: { id: agente, x: planta.salida.x, y: planta.salida.y, dir: 0, vida: A.vida, vidaMax: A.vida, oculto: false },
      guardias: (d.guardias || []).map((g) => guardiaNuevo(aj, g)),
      camaras: (d.camaras || []).map(camaraNueva),
      objetos: [], secretos: planta.secretos.map((s) => ({ x: s.x, y: s.y, hecho: false })),
      baraja: S.baraja.nueva(mazo, opc.barajar === false ? null : opc.azar),
      reloj: 0, turno: { n: 1, gasto: 0, jugadas: 0 }, plano: 0,
      alerta: { activa: false, turnos: 0, visto: null },
      cuenta: { turnos: 0, alertas: 0, derribos: 0, escondidos: 0, cuerposVistos: 0, cartas: 0, secretos: 0 },
      fin: null, eventos: [],
    };
    S.baraja.roba(p.baraja, opc.mano || aj.turno.manoInicial, aj.turno.mano, opc.azar);
    return S.ok(p);
  }

  // ¿Se puede jugar ahora la carta del hueco `i`? null o el código de por qué no.
  function previo(c, i) {
    if (c.p.fin) return 'fin';
    if (!c.p.baraja.mano[i]) return 'sin-carta';
    if (c.p.turno.jugadas >= c.aj.turno.cartas) return 'tope-cartas';
    return null;
  }

  // Lo que se puede hacer con la carta del hueco `i`, para que la pantalla lo enseñe antes de jugarla: su coste para este agente,
  // si vale por su efecto (y con qué objetivos) y a dónde se puede andar gastándola.
  function opciones(c, i) {
    const mal = previo(c, i), id = c.p.baraja.mano[i];
    if (!id) return S.error(mal);
    const carta = C.carta(c.aj, id), efecto = C.EFECTOS[id], no = mal || efecto.puede(c);
    const objetivos = no ? { clase: 'nada', lista: [] } : efecto.objetivos(c, carta);
    const vacio = !no && objetivos.clase !== 'nada' && !objetivos.lista.length;
    return S.ok({
      id, carta, coste: C.coste(c.aj, c.p.agente, id), puede: no || (vacio ? 'sin-objetivo' : null), objetivos,
      andar: { coste: c.aj.turno.andar.coste, puede: mal, objetivos: mal ? { clase: 'celdas', lista: [] } : C.destinos(c, c.aj.turno.andar.pasos) },
    });
  }

  // Tras una carta: cuenta la jugada y mira si el agente ha llegado a la puerta.
  function cierra(c, coste) {
    const p = c.p;
    p.turno.gasto += coste; p.turno.jugadas++; p.cuenta.cartas++;
    if (R.igual(p.agente, c.planta.meta)) { p.cuenta.turnos++; T.termina(c, 'meta'); }
    return S.ok({ eventos: p.eventos });
  }

  // Juega la carta del hueco `i` por su efecto, sobre `objetivo` ({ x, y } o { id } de un guardia) si lo pide.
  function juega(c, i, objetivo) {
    const r = opciones(c, i);
    if (!r.ok) return r;
    const o = r.valor;
    if (o.puede) return S.error(o.puede);
    if (!C.vale(o.objetivos, objetivo)) return S.error('objetivo');
    c.p.eventos = [];
    S.baraja.gasta(c.p.baraja, i);
    ev(c, 'carta', { id: o.id, coste: o.coste, hueco: i });
    C.EFECTOS[o.id].aplica(c, o.carta, objetivo);
    return cierra(c, o.coste);
  }

  // Gasta la carta del hueco `i` para andar hasta `destino` (cualquier carta vale: 3 casillas por 1 de coste, con un poco de ruido).
  function anda(c, i, destino) {
    const r = opciones(c, i);
    if (!r.ok) return r;
    const o = r.valor, A = c.aj.turno.andar;
    if (o.andar.puede) return S.error(o.andar.puede);
    if (!C.vale(o.andar.objetivos, destino)) return S.error('objetivo');
    c.p.eventos = [];
    S.baraja.gasta(c.p.baraja, i);
    ev(c, 'carta', { id: o.id, coste: A.coste, hueco: i, andar: true });
    C.mueve(c, destino, A.pasos, A.ruido, 'andar');
    return cierra(c, A.coste);
  }

  // La cuenta atrás de la alerta: baja cada turno que el agente acaba sin que nadie lo vea; si lo ven, vuelve a empezar.
  function cuentaAtras(c) {
    const al = c.p.alerta;
    if (!al.activa) return;
    if (G.vistoAhora(c)) { al.turnos = c.aj.alerta.turnos; return; }
    al.turnos--;
    ev(c, 'cuenta', { turnos: al.turnos });
    if (al.turnos <= 0) G.calma(c);
  }

  // Empieza el turno del agente: roba (si hay que rebarajar, ya empieza con ese coste encima).
  function empieza(c) {
    const p = c.p;
    p.turno = { n: p.turno.n + 1, gasto: 0, jugadas: 0 };
    if (p.plano > 0) p.plano--;
    ev(c, 'turno', { n: p.turno.n });
    C.roba(c, c.aj.turno.roba);
  }

  // Acaba el turno del agente: pasa el tiempo de lo que ha gastado y actúan los demás. Sin cartas jugadas es «esperar».
  function acaba(c) {
    const p = c.p;
    if (p.fin) return S.error('fin');
    p.eventos = [];
    const espera = !p.turno.jugadas && !p.turno.gasto, coste = espera ? 0 : Math.max(c.aj.turno.minimo, p.turno.gasto);
    p.cuenta.turnos++;
    ev(c, 'pasa', { coste, espera });
    cuentaAtras(c);
    p.reloj = T.corre(c, p.reloj + coste, espera);
    if (!p.fin) empieza(c);
    return S.ok({ eventos: p.eventos });
  }

  S.partida = Object.freeze({ nueva, contexto, opciones, juega, anda, acaba });
})(SPY);
