// Fans Of · Prueba de PvP de Rumble: dos copias del juego en dos marcos, una red de mentira entre ellas (con retardo y desorden) y una partida por lockstep.
// Se lanza con: python herramientas/comprobar.py --pvp. Comprueba tres cosas: que las dos copias acaban con el mismo estado, que una caída del rival se nota (espera y abandono) y que una trampa se nota (huellas distintas).
async function pruebaPvp(raiz, duerme) {
  const salida = [], fallos = [], ap = (n, v) => salida.push([n, typeof v === 'string' ? v : JSON.stringify(v)]);
  const clon = x => JSON.parse(JSON.stringify(x));
  const espera = async (cond, ms, que) => { const t0 = Date.now(); while (!cond()) { if (Date.now() - t0 > ms) throw new Error('se acaba el tiempo: ' + que); await duerme(50); } };
  async function abre() {
    const f = document.createElement('iframe'); f.width = 540; f.height = 960; f.src = `${raiz}games/rumble/`; document.getElementById('marcos').appendChild(f);
    await new Promise(r => { f.onload = r; });
    const w = f.contentWindow; await espera(() => { try { return w.eval('READY === true'); } catch (e) { return false; } }, 30000, 'el juego no arranca');
    w.eval('window.__X = { get PVP() { return PVP; }, get G() { return G; }, get S() { return S; }, get SIM() { return SIM; }, get FACTIONS() { return FACTIONS; }, isLeader, cardDef, slotKey }');   // lo declarado con const/let no cuelga de window
    w.requestAnimationFrame = () => 0;   // el bucle de dibujo lo mueve esta prueba, a mano, para controlar los dos juegos
    return { f, w };
  }
  async function partida(nombre, o) {
    const A = await abre(), B = await abre(), a = A.w, b = B.w;
    const F = b.__X.FACTIONS.nomuertos, lvl = {}; for (const k of F.units.slice(0, 6).concat(F.leader)) lvl[k] = 3;
    const eqP = clon(a.pvpEquipo('estandar')), eqE = { fac: 'nomuertos', deck: F.units.slice(0, 6), lvl, stars: {}, ab: {}, equip: {}, modo: 'estandar' };
    const equipos = { p: eqP, e: eqE };
    let corta = false, enviados = 0;   // `corta`: la red deja de llevar lo de B a A
    const lat = () => 15 + Math.random() * 60;
    const redA = { enviar: m => { enviados++; setTimeout(() => b.pvpRecibir(clon(m)), lat()); } };
    const redB = { enviar: m => { enviados++; if (!corta) setTimeout(() => a.pvpRecibir(clon(m)), lat()); } };
    const base = { seed: 9001, tiempo: o.tiempo || 20, conservar: true, avisoMs: o.avisoMs, abandonoMs: o.abandonoMs };
    if (!a.pvpInicio(Object.assign({ seat: 'p', red: redA, equipos: clon(equipos) }, base))) throw new Error('A no empieza: ' + a.__X.PVP.error);
    if (!b.pvpInicio(Object.assign({ seat: 'e', red: redB, equipos: clon(equipos) }, base))) throw new Error('B no empieza: ' + b.__X.PVP.error);
    if (o.variar) {   // dos jugadores de verdad no tienen los mismos ajustes ni empiezan al mismo tiempo: nada de eso puede cambiar la partida
      a.eval("Object.assign(SAVE, { ahorro: true, noNums: true, blood: false, feed: false, noShake: true, chatOff: true, fps: true }); G.t += 7.31"); b.eval("Object.assign(SAVE, { ahorro: false, noNums: false, blood: true, feed: true, noShake: false, chatOff: false }); G.t += 0.77");
    }
    const t0 = Date.now(); let juega = 0;
    const reloj = setInterval(() => {
      for (const w of [a, b]) { try { w.frame(w.performance.now()); } catch (e) { fallos.push(nombre + ': error en el bucle: ' + (e && e.message)); } }
      if (o.cada && Date.now() - t0 > (juega + 1) * o.cada) {   // una jugada de cada lado cada `cada` ms
        juega++;
        for (const w of [a, b]) {   // los dos juegan como un jugador de verdad: con las coordenadas de lo que ven (el de arriba ve el campo reflejado)
          if (w.__X.G.state !== 'play' || w.__X.PVP.estado === 'desync') continue; const t = w.__X.PVP.seat, k = w.__X.slotKey(0);
          if (k && !w.__X.isLeader(k) && w.__X.S[t].chaos >= w.__X.cardDef(k).cost) w.tryPlayerDeploy(0, k, 120 + (juega * 37) % 300, 540);
        }
      }
      if (o.alMs && !o.hecho && Date.now() - t0 > o.alMs) { o.hecho = true; o.al({ a, b, corta: v => { corta = v; } }); }
    }, 16);
    try { await espera(o.hasta({ a, b }), o.limite || 90000, nombre); } catch (e) { throw new Error(`${e.message} · estados ${a.__X.PVP.estado}/${b.__X.PVP.estado} · ${a.__X.PVP.error} · ${b.__X.PVP.error} · ticks ${a.__X.SIM.tick}/${b.__X.SIM.tick} · juego ${a.__X.G.state}/${b.__X.G.state}`); } finally { clearInterval(reloj); }
    const r = { a: a.__X.PVP, b: b.__X.PVP, mensajes: enviados, ha: a.__X.PVP.hashes.slice(), hb: b.__X.PVP.hashes.slice() };
    r.estados = [a.__X.PVP.estado, b.__X.PVP.estado]; r.fin = [clon(a.__X.PVP.fin), clon(b.__X.PVP.fin)]; r.ganador = [a.__X.G.winner, b.__X.G.winner]; r.ticks = [a.__X.SIM.tick, b.__X.SIM.tick]; r.error = a.__X.PVP.error; r.jugadas = a.__X.SIM.log.map(c => c.team).join('');
    A.f.remove(); B.f.remove();
    return r;
  }
  // un servidor de mentira que habla el contrato de verdad (PLAN-CUENTAS.md, punto 9): cola, sala, un RPC por turno y cierre. Dos jugadores, sin trampas ni esperas
  function servidorFalso() {
    const S = { cola: null, sala: null, lados: { a: { items: [], huellas: {}, cierre: null }, b: { items: [], huellas: {}, cierre: null } }, llamadas: 0, desync: false, semilla: 777001 };
    const clon = x => JSON.parse(JSON.stringify(x));
    return { S, para(quien) {   // la función rpc de un jugador
      return async (nombre, a) => {
        if (nombre === 'pvp_jugar') { S.enCurso = S.enCurso || {}; if (S.enCurso[quien]) throw new Error('duplicate key value violates unique constraint "pvp_jugadas_pkey"'); S.enCurso[quien] = 1; }   /* como el de verdad: dos llamadas a la vez del mismo jugador chocan */
        try {
        S.llamadas++; const lat = +new URLSearchParams(location.search).get('lat') || 0; await new Promise(r => setTimeout(r, 5 + Math.random() * 30 + lat * (0.5 + Math.random())));   // ?lat=N: cada llamada tarda N ms de más (para probar con una red lenta)
        const lado = S.sala ? (S.sala.a === quien ? 'a' : 'b') : null;
        if (nombre === 'pvp_buscar') {
          if (!S.cola) { S.cola = { quien, mazo: a.p_mazo }; return { espera: true }; }
          if (S.cola.quien === quien) return { espera: true };
          S.sala = { id: 'sala1', a: S.cola.quien, b: quien, mazoA: S.cola.mazo, mazoB: a.p_mazo }; S.cola = null; return { sala: 'sala1' };
        }
        if (nombre === 'pvp_estado') {
          if (!S.sala) return { espera: true };
          const m = l => l.map(c => ({ c, n: 3, st: 0 }));
          return { sala: S.sala.id, juego: 'rumble', modo: 'estandar', semilla: S.semilla, lado: S.sala.a === quien ? 'a' : 'b', mazo_a: m(S.sala.mazoA), mazo_b: m(S.sala.mazoB), equipo_a: [], equipo_b: [] };
        }
        if (nombre === 'pvp_salir') { if (S.cola && S.cola.quien === quien) S.cola = null; return {}; }
        if (nombre === 'pvp_jugar') {
          const yo = S.lados[lado], otro = S.lados[lado === 'a' ? 'b' : 'a'];
          for (const it of a.p_jugadas) { if (JSON.stringify(it).length >= 200) throw new Error('demasiado_largo'); if (typeof it.t !== 'number') throw new Error('jugada_no_valida'); /* como el de verdad: cada jugada lleva su t */ yo.items.push({ s: yo.items.length + 1, d: clon(it) }); }
          if (a.p_tick_huella != null) { yo.huellas[a.p_tick_huella] = a.p_huella; if (otro.huellas[a.p_tick_huella] != null && otro.huellas[a.p_tick_huella] !== a.p_huella) S.desync = true; }
          return { rival: otro.items.filter(x => x.s > a.p_desde).map(clon), estado: 'jugando', desync: S.desync };
        }
        if (nombre === 'pvp_cerrar') {
          S.lados[lado].cierre = a.p_ganador; const otro = S.lados[lado === 'a' ? 'b' : 'a'];
          if (otro.cierre == null) return { estado: 'esperando' };
          return otro.cierre === a.p_ganador ? { estado: 'cerrada', gano: a.p_ganador === lado, puntos: 1000 + (a.p_ganador === lado ? 25 : -25) } : { estado: 'discutida' };
        }
        throw new Error('rpc_desconocido: ' + nombre);
        } finally { if (nombre === 'pvp_jugar') S.enCurso[quien] = 0; }
      };
    } };
  }
  async function partidaServidor(rendir) {
    const A = await abre(), B = await abre(), a = A.w, b = B.w, srv = servidorFalso();
    const prepara = (w, quien) => { w.eval("CUENTA.activa = true"); w.eval('window.__CU = CUENTA'); w.__CU.rpc = srv.para(quien); w.eval('PVP_SRV.cierreMs = 400'); };
    prepara(a, 'ana'); prepara(b, 'beto');
    const res = { a: {}, b: {} };
    for (const [w, k] of [[a, 'a'], [b, 'b']]) {
      w.eval('PVPNET').redes.servidor.buscar('estandar', w.pvpEquipo('estandar'), r => { res[k].r = r; w.pvpInicio({ seat: r.seat, seed: r.seed, equipos: r.equipos, red: r.red, conservar: true, tiempo: 20, alEstado: () => {}, retardo: +new URLSearchParams(location.search).get('d') || 2 }); w.__X.PVP.net = r; });
    }
    const t0 = Date.now(); let juega = 0;
    const reloj = setInterval(() => {
      for (const w of [a, b]) { try { w.frame(w.performance.now()); } catch (e) { fallos.push('servidor: error en el bucle: ' + (e && e.message)); } }
      if (Date.now() - t0 > (juega + 1) * 1500) { juega++; for (const w of [a, b]) { if (!w.__X || w.__X.G.state !== 'play') continue; const t = w.__X.PVP.seat, k = w.__X.slotKey(0); if (k && !w.__X.isLeader(k) && w.__X.S[t].chaos >= w.__X.cardDef(k).cost) w.tryPlayerDeploy(0, k, 120 + (juega * 37) % 300, 540); } }
    }, 16);
    for (const w of [a, b]) w.eval("window.__X = { get PVP() { return PVP; }, get G() { return G; }, get S() { return S; }, get SIM() { return SIM; }, isLeader, cardDef, slotKey }");
    if (rendir) {
      let traza;   // A se rinde a los 6 s de juego: B tiene que enterarse al momento (no esperar al abandono de 18 s)
      try {
        await espera(() => a.__X.G.state === 'play' && a.__X.SIM.tick > 300, 30000, 'empieza'); const t1 = Date.now(); traza = []; const mu = setInterval(() => traza.push(((Date.now() - t1) / 1000).toFixed(1) + ':' + b.__X.PVP.estado + '/' + b.__X.SIM.tick), 1000); a.__X.PVP.red.enviar({ t: 'rendir' }); traza.push('enviado cola=' + srv.S.lados.a.items.length);
        await espera(() => b.__X.PVP.estado === 'abandono', 8000, 'B se entera de la rendición'); const ms = Date.now() - t1;
        const r = { ms, motivo: b.__X.PVP.estado, ganador: 'B', seat: 'B' }; clearInterval(reloj); A.f.remove(); B.f.remove(); return r;
      } catch (e) { clearInterval(reloj); const d = w => `${w.__X.G.state}/${w.__X.PVP.estado}/tick ${w.__X.SIM.tick}/fallos ${w.__X.PVP.fallos}/${w.__X.PVP.ultimoError}`; throw new Error(e.message + ' · traza ' + (traza ? traza.join(' ') : '') + ' · A ' + d(a) + ' · B ' + d(b) + ' · srv items a:' + srv.S.lados.a.items.length + ' b:' + srv.S.lados.b.items.length + ' ' + JSON.stringify(srv.S.lados.a.items.slice(-2).map(x => x.d))); }
    }
    try { await espera(() => ['ending', 'end'].includes(a.__X.G.state) && ['ending', 'end'].includes(b.__X.G.state), 90000, 'partida con servidor'); } catch (e) { const d = w => { try { return `${w.__X.G.state}/${w.__X.PVP.estado}/${w.__X.PVP.on}/${w.__X.SIM.tick}/${w.__X.PVP.error}/toast:${w.document.getElementById("toast").textContent}`; } catch (x) { return 'sin __X'; } }; throw new Error(`${e.message} · A ${d(a)} · B ${d(b)} · llamadas ${srv.S.llamadas} · sala ${!!srv.S.sala} · res ${!!res.a.r}/${!!res.b.r}`); } finally { clearInterval(reloj); }
    const cierres = {};
    for (const [w, k] of [[a, 'a'], [b, 'b']]) w.__X.PVP.net.cerrar(w.__X.G.winner, w.__X.PVP.fin.h, r => { cierres[k] = r; });
    await espera(() => cierres.a && cierres.a.estado === 'cerrada' && cierres.b && cierres.b.estado === 'cerrada', 20000, 'cierre');
    const ha = a.__X.PVP.hashes, hb = b.__X.PVP.hashes, n = Math.min(ha.length, hb.length);
    const r = { n, iguales: ha.slice(0, n).every((x, i) => x[1] === hb[i][1]), estados: [a.__X.PVP.estado, b.__X.PVP.estado], seats: [res.a.r && res.a.r.seat, res.b.r && res.b.r.seat], cierres, esperas: a.__X.PVP.stats.n + ' (' + (a.__X.PVP.stats.ms / 1000).toFixed(1) + ' s) / ' + b.__X.PVP.stats.n + ' (' + (b.__X.PVP.stats.ms / 1000).toFixed(1) + ' s)', llamadas: srv.S.llamadas, desync: srv.S.desync, fin: [a.__X.PVP.fin, b.__X.PVP.fin] };
    A.f.remove(); B.f.remove();
    return r;
  }
  try {
    // 0) con el servidor (de mentira): se empareja, juega y cierra con puntos
    const sv = await partidaServidor();
    ap('0 · servidor simulado', `${sv.n} huellas, ${sv.llamadas} llamadas al servidor, lados ${sv.seats.join('/')}, estados ${sv.estados.join('/')}, esperas ${sv.esperas}, cierres ${JSON.stringify(sv.cierres)}`);
    if (sv.n < 20) fallos.push('servidor: se compararon muy pocas huellas'); if (!sv.iguales) fallos.push('servidor: las huellas no coinciden'); if (sv.desync) fallos.push('servidor: el servidor ha visto una desincronización');
    if ([...sv.seats].sort().join() !== 'e,p') fallos.push('servidor: los lados no son p/e: ' + sv.seats.join('/'));
    if (JSON.stringify(sv.fin[0]) !== JSON.stringify(sv.fin[1])) fallos.push('servidor: el final no coincide');
    if (!(sv.cierres.a && sv.cierres.a.puntos != null && sv.cierres.b && sv.cierres.b.puntos != null)) fallos.push('servidor: el cierre no da puntos a los dos');
    { const w = (await abre()).w, eq = w.pvpEquipoDeServidor([{ c: 'squirrel', n: 4, st: 1 }, { c: 'beaver', n: 2 }, { c: 'fox', n: 2 }, { c: 'meercat', n: 2 }, { c: 'junkcoon', n: 2 }, { c: 'mechavaca', n: 2 }, { c: 'bunny', n: 5 }], [{ s: 'ab_bunny', u: 'x', t: 'ab', o: 'cafeina', q: [0.5] }, { s: 'eq_head', u: 'y', t: 'eq', o: 'cuernos', q: [0.7] }]);
      const mal = w.pvpEquipoMal(eq); ap('0b · equipo del servidor', mal ? 'MAL: ' + mal : `${eq.fac}, ${eq.deck.length} cartas, habilidades ${Object.keys(eq.ab)}, objetos ${Object.keys(eq.equip)}`); if (mal || !eq.ab.bunny || !eq.equip.head) fallos.push('equipo del servidor mal convertido: ' + JSON.stringify(eq));
      const ida = w.eval('pvpAServidor')({ t: 'rendir' }), vuelta = w.eval('pvpDeServidor')(ida, 'e'); if (vuelta.t !== 'rendir' || JSON.stringify(ida).length >= 200) fallos.push('rendirse no viaja bien por el servidor: ' + JSON.stringify(ida)); }
    const rd = await partidaServidor(true);
    ap('0c · rendición por el servidor', `B se entera en ${rd.ms} ms: ${rd.motivo}, ganador ${rd.ganador}`);
    if (rd.motivo !== 'abandono') fallos.push('rendición: el rival no gana por abandono: ' + JSON.stringify(rd)); if (rd.ms > 3000) fallos.push('rendición: tarda demasiado en llegar (' + rd.ms + ' ms)');
    { const v = await partida('ajustes distintos', { tiempo: 20, cada: 1500, variar: true, hasta: ({ a, b }) => () => ['ending', 'end'].includes(a.__X.G.state) && ['ending', 'end'].includes(b.__X.G.state) });
      const n = Math.min(v.ha.length, v.hb.length), ig = v.ha.slice(0, n).every((x, i) => x[1] === v.hb[i][1]); ap('1b · ajustes y reloj distintos', `${n} huellas, iguales: ${ig}, estados ${v.estados.join('/')}, ${v.error}`); if (!ig || v.estados.some(e => e === 'desync' || e === 'error')) fallos.push('ajustes distintos: las partidas se separan (' + v.error + ')'); }
    // 1) una partida entera: mismas huellas en cada turno, mismo final
    const r = await partida('partida', { tiempo: 20, cada: 1500, hasta: ({ a, b }) => () => ['ending', 'end'].includes(a.__X.G.state) && ['ending', 'end'].includes(b.__X.G.state) });
    const n = Math.min(r.ha.length, r.hb.length), iguales = r.ha.slice(0, n).every((x, i) => x[1] === r.hb[i][1] && x[0] === r.hb[i][0]);
    ap('1 · partida', `${n} huellas comparadas, ${r.mensajes} mensajes, ganador ${r.ganador.join('/')}, ticks ${r.ticks.join('/')}, estados ${r.estados.join('/')}, jugadas aplicadas ${r.jugadas}`);
    if (!r.jugadas.includes('p') || !r.jugadas.includes('e')) fallos.push('partida: no se aplicaron jugadas de los dos lados: ' + r.jugadas);
    if (n < 20) fallos.push('partida: se compararon muy pocas huellas');
    if (!iguales) fallos.push('partida: las huellas de las dos copias no coinciden');
    if (r.estados.some(e => e === 'desync' || e === 'error')) fallos.push('partida: desincronización o error: ' + r.estados.join('/'));
    if (!r.fin[0] || JSON.stringify(r.fin[0]) !== JSON.stringify(r.fin[1])) fallos.push('partida: el final no coincide: ' + JSON.stringify(r.fin));
    if (r.ganador[0] !== r.ganador[1]) fallos.push('partida: no coincide el ganador');
    // 2) el rival se cae: A espera y luego da el abandono
    const c = await partida('caída', { tiempo: 60, cada: 1500, avisoMs: 800, abandonoMs: 3500, alMs: 9000, al: x => x.corta(true), hasta: ({ a }) => () => a.__X.PVP.estado === 'abandono', limite: 60000 });
    ap('2 · el rival se cae', `A llega a «${c.estados[0]}»`);
    if (c.estados[0] !== 'abandono') fallos.push('caída: A no detecta el abandono');
    // 3) trampa: B se da CAOS de más; las huellas dejan de coincidir y los dos lo notan
    const d = await partida('trampa', { tiempo: 60, cada: 1500, alMs: 7000, al: x => { x.b.__X.S.p.chaos += 7; }, hasta: ({ a, b }) => () => a.__X.PVP.estado === 'desync' && b.__X.PVP.estado === 'desync', limite: 60000 });
    ap('3 · trampa', `estados ${d.estados.join('/')}: ${d.error}`);
    if (!d.estados.every(e => e === 'desync')) fallos.push('trampa: no se detecta en los dos lados: ' + d.estados.join('/'));
  } catch (e) { fallos.push('la prueba se para: ' + (e && e.stack || e)); }
  ap('resultado', fallos.length ? 'FALLO: ' + fallos.join('; ') : 'PVP OK');
  return salida;
}
