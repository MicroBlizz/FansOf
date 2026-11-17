// Fans Of Paperwork · dominio · EQUIPO: quién rebusca dónde. El líder trabaja el archivador que le señale el jugador (o el primero lleno) y
// cada trabajador (los líderes de las facciones liberadas) se pone en su propio archivador y lo trabaja a la vez, hasta vaciarlo; entonces
// busca otro libre. El jugador puede mandar a un trabajador a otro archivador. Cada trabajador tiene su manía (AJ.manias): no leen igual.
// Los drones (plan de carrera o carta de recomendación) son trabajadores sin manía que solo llegan a la fila de arriba.
// El estado va en r.equipo: { objetivo (del líder, o -1), puestos: { k: { i, acum } } } con k = el índice de su facción en PW.FACCIONES
// (los drones, de DRON en adelante).
'use strict';
PW.equipo = (() => {
  const AJ = PW.AJ, M = AJ.manias, C = PW.curvas;
  const DRON = 100;   // el número del primer dron
  const nuevo = () => ({ objetivo: -1, puestos: {} });
  const esDron = k => k >= DRON;
  // quién trabaja ahora: los líderes liberados y los drones
  function plantilla(B) {
    const lista = [];
    for (let k = 1; k <= B.trabajadores; k++) lista.push(k);
    for (let d = 0; d < B.drones; d++) lista.push(DRON + d);
    return lista;
  }
  const lleno = (p, i) => !!(p.archivadores[i] && p.archivadores[i].vida > 0);
  const puesto = (e, k) => e.r.equipo.puestos[k] || (e.r.equipo.puestos[k] = { i: -1, acum: 0 });

  // la manía de cada facción: lo que cambia en su vistazo. Devuelve { lee (multiplica su lectura), B (otros bonos), sinDureza, vecino }
  const MANIAS = {
    streamers: e => ({ lee: e.r.tiempo - (e.r.ultimoToque === undefined ? -1e9 : e.r.ultimoToque) <= M.directoSeg ? M.directo : 1 }),
    nomuertos: (e, B, azar) => (azar() < M.renacer ? { B: { ...B, botin: B.botin * 2 } } : {}),
    heroes: (e, B) => ({ B: { ...B, xp: B.xp * M.heroe } }),
    ciber: () => ({ sinDureza: true }),
    memes: (e, B, azar) => ({ lee: azar() * M.rngMax }),
    olvidados: e => ({ lee: C.zonaDe(e.r.planta.n) >= PW.ZONAS.length - 1 ? M.nostalgia : 1 }),
    pop: () => ({ vecino: true }),
    microblizz: (e, B) => ({ B: { ...B, confidencial: B.confidencial + M.becarioSello } }),
  };
  const VELOCIDAD = { gamer: M.apm, microblizz: M.becarioVel };
  const fac = k => (esDron(k) ? 'dron' : PW.FACCIONES[k].fac);
  const velocidad = k => AJ.trabajador.vistazosSeg * (VELOCIDAD[fac(k)] || 1);

  // el archivador del líder: el señalado si sigue lleno; si no, el primero lleno (-1 si no queda)
  function delLider(e) {
    const p = e.r.planta, o = e.r.equipo.objetivo;
    return lleno(p, o) ? o : PW.planta.primerLleno(p);
  }
  // los archivadores que ya tiene alguien (el del líder y los de los demás trabajadores)
  function ocupados(e, menos) {
    const set = new Set([delLider(e)]);
    for (const k in e.r.equipo.puestos) if (+k !== menos) set.add(e.r.equipo.puestos[k].i);
    return set;
  }
  // el archivador del trabajador k: el suyo si sigue lleno; si no, el último libre (empiezan por el fondo, el líder por delante)
  function delTrabajador(e, k) {
    const p = e.r.planta, pu = puesto(e, k);
    if (lleno(p, pu.i)) return pu.i;
    const alcanza = esDron(k) ? i => i < AJ.planta.columnas : () => true;   // el dron solo llega a la fila de arriba
    const llenos = PW.planta.llenos(p).filter(alcanza), cogidos = ocupados(e, k), libres = llenos.filter(i => !cogidos.has(i));
    const elige = libres.length ? libres : llenos;
    pu.i = elige.length ? elige[elige.length - 1] : -1;
    return pu.i;
  }
  // un vistazo del trabajador k a su archivador, con su manía
  function vistazo(e, B, k, azar, sucesos) {
    const i = delTrabajador(e, k);
    if (i < 0) return;
    const m = MANIAS[fac(k)] ? MANIAS[fac(k)](e, B, azar) : {};
    const Bk = m.B || B, d = B.dano * B.trab * (m.lee === undefined ? 1 : m.lee), planta = e.r.planta;
    sucesos.push({ t: 'trabaja', i, quien: k });
    PW.rebuscar.rebusca(e, Bk, i, d, azar, sucesos, !!m.sinDureza);
    const al = (i + 1) % AJ.planta.columnas ? i + 1 : i - 1;
    if (m.vecino && planta === e.r.planta && lleno(planta, al)) PW.rebuscar.rebusca(e, Bk, al, d, azar, sucesos);
  }
  // todos los trabajadores avanzan dt segundos, cada uno a su ritmo
  function trabajan(e, B, dt, azar, sucesos) {
    for (const k of plantilla(B)) {
      const pu = puesto(e, k);
      pu.acum += dt * velocidad(k);
      while (pu.acum >= 1) { pu.acum -= 1; vistazo(e, B, k, azar, sucesos); }
    }
  }
  // el jugador señala un archivador al líder. Resultado: PW.ok(i) o 'sin-archivador'
  function apunta(e, i) {
    if (!lleno(e.r.planta, i)) return PW.error('sin-archivador', { i });
    e.r.equipo.objetivo = i;
    return PW.ok(i);
  }
  // el jugador manda al trabajador k al archivador i. Resultado: PW.ok(i), 'desconocido' (no hay ese trabajador), 'sin-archivador' o
  // 'no-alcanza' (un dron fuera de la fila de arriba)
  function manda(e, B, k, i) {
    if (!plantilla(B).includes(k)) return PW.error('desconocido', { k });
    if (!lleno(e.r.planta, i)) return PW.error('sin-archivador', { i });
    if (esDron(k) && i >= AJ.planta.columnas) return PW.error('no-alcanza', { i });
    puesto(e, k).i = i;
    return PW.ok(i);
  }
  // dónde está cada uno ahora, para pintarlo: [{ k, i }] (k = 0 el líder)
  function sitios(e, B) {
    const lista = [{ k: 0, i: delLider(e) }];
    // solo se mira: quien aún no tiene archivador (lo elige el motor al trabajar) no sale
    for (const k of plantilla(B)) { const pu = e.r.equipo.puestos[k]; lista.push({ k, i: pu && lleno(e.r.planta, pu.i) ? pu.i : -1 }); }
    return lista;
  }
  return { nuevo, delLider, delTrabajador, trabajan, apunta, manda, sitios, velocidad, plantilla, esDron, DRON };
})();
