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
  try {
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
