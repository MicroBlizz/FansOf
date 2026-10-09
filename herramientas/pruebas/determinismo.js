// Fans Of · Prueba de determinismo de Rumble: juega la misma partida dos veces (misma semilla, mismas jugadas) y compara la huella del estado cada segundo.
// Se añade al final de rumble.js (lo hace comparar.js con ?auto=rumble&det=1) y cambia lo que se ejecuta; se lanza con: python herramientas/comprobar.py --determinismo
PRUEBA.pasos = async function (T) {
  const SEGUNDOS = +new URLSearchParams(parent.location.search).get('seg') || 90, JUGADAS = [300, 900, 1500, 2100, 2700, 3300, 3900, 4500];   // ticks en los que el jugador echa la primera carta de su mano
  // juega una partida de SEGUNDOS: las jugadas del jugador entran por simCmd (la mano y el CAOS los decide la simulación) o, si se da `registro`, se repiten tal cual se aplicaron
  const juega = (semilla, azar, nombre, prepara, o = {}) => {
    T.semilla(azar);   // el Math.random de la página es distinto en cada partida: si la simulación lo usara, las huellas saldrían distintas
    prepara(); G.seedNext = semilla; G.autoplay = !o.sinIA; startMatch(); T.avanza(4200);
    if (G.state !== 'play') throw new Error('la partida no ha empezado: ' + G.state);
    SIM.delay = o.retardo || 0;
    if (o.registro) SIM.cmds = o.registro.map(c => Object.assign({}, c, { t: c.t + (o.desplaza || 0) }));
    const huellas = [];
    for (let i = 1; i <= SEGUNDOS * 60; i++) {
      if (!o.registro && JUGADAS.includes(i)) { const k = S.p.hand[0]; if (k) simCmd({ team: 'p', slot: 0, key: k, x: 150 + (i % 7) * 40, y: 620 }); }
      simStep(SIM_DT);
      if (i % 60 === 0) huellas.push(simHash());
    }
    T.apunta(nombre, huellas.join(' '));
    SIM.delay = 0;
    return { huellas, registro: SIM.log.slice() };
  };
  const rapida = () => { setFaction('animales'); G.diff = 'normal'; G.diffCfg = CFG.diff.normal; G.prep = { mode: 'quick' }; setupMatch('quick'); };
  const campana = () => { setFaction('animales'); campDiff = 'n'; G.prep = { mode: 'camp', lvl: findLevel('2-4'), cd: 'n' }; setupMatch('camp', findLevel('2-4'), 'n'); };   // jefe con campo especial (zonas y caídas)
  const memes = () => { setFaction('memes'); G.diff = 'normal'; G.diffCfg = CFG.diff.normal; G.prep = { mode: 'quick' }; setupMatch('quick'); };
  T.paso('determinismo');
  const fallos = [];
  for (const [nombre, prepara] of [['rápida', rapida], ['campaña con jefe', campana], ['memes', memes]]) {
    const A = juega(777, 11, nombre + ' · partida 1', prepara), B = juega(777, 22, nombre + ' · partida 2', prepara), C = juega(778, 11, nombre + ' · otra semilla', prepara);
    const a = A.huellas, b = B.huellas, c = C.huellas;
    const igual = a.join() === b.join(), difiere = a[a.length - 1] !== c[c.length - 1];
    if (!igual) { const i = a.findIndex((h, j) => h !== b[j]); fallos.push(`${nombre}: las dos partidas se separan en el segundo ${i + 1}`); }
    if (!difiere) fallos.push(`${nombre}: otra semilla da la misma partida (la semilla no se usa)`);
    T.apunta(nombre, igual && difiere ? 'IGUALES con la misma semilla y distintas con otra' : 'FALLO');
    // las jugadas: una partida con retardo de 3 ticks y sin IA para el jugador; su registro, repetido, da la misma partida; movido un tick, otra distinta
    const J = juega(777, 33, nombre + ' · jugadas', prepara, { sinIA: true, retardo: 3 });
    const R = juega(777, 44, nombre + ' · repetida desde el registro', prepara, { sinIA: true, registro: J.registro });
    const D = juega(777, 55, nombre + ' · registro movido un tick', prepara, { sinIA: true, registro: J.registro, desplaza: 1 });
    if (!J.registro.length) fallos.push(`${nombre}: no se aplicó ninguna jugada`);
    if (J.huellas.join() !== R.huellas.join()) fallos.push(`${nombre}: repetir el registro de jugadas no da la misma partida`);
    if (J.huellas.join() === D.huellas.join()) fallos.push(`${nombre}: mover las jugadas un tick no cambia nada (no se aplican en su tick)`);
    T.apunta(nombre + ' · jugadas', `${J.registro.length} jugadas; repetición ${J.huellas.join() === R.huellas.join() ? 'IGUAL' : 'DISTINTA'}; movida ${J.huellas.join() === D.huellas.join() ? 'IGUAL' : 'DISTINTA'}`);
  }
  // PvP: los dos lados salen de su equipo (mazo, niveles, estrellas, habilidad y objeto), con mano propia y jugadas de los dos; la partida no puede depender del SAVE de nadie
  const equipo = (fac, lvl, extra = {}) => {
    const F = FACTIONS[fac], deck = F.units.slice(0, 6), l = {}; for (const k of deck.concat(F.leader)) l[k] = lvl;
    return Object.assign({ fac, deck, lvl: l, stars: { [deck[0]]: 2 }, ab: { [F.leader]: { k: 'ab', id: 'cafeina', q: [0.75] } }, equip: { head: { k: 'eq', id: 'cuernos', q: [0.5] } } }, extra);
  };
  const pvp = (pvpDatos, azar, nombre, o = {}) => {
    T.semilla(azar); PVP.terreno = o.terreno; setFaction('animales'); G.prep = { mode: 'pvp' }; setupMatch('pvp', null, null, pvpDatos); G.seedNext = 4242; G.autoplay = false; startMatch(); T.avanza(4200);
    if (G.state !== 'play') throw new Error('el PvP no ha empezado: ' + G.state);
    if (o.registro) SIM.cmds = o.registro.map(c => Object.assign({}, c));
    const huellas = [];
    for (let i = 1; i <= (o.seg || SEGUNDOS) * 60; i++) {
      if (!o.registro && i % 300 === 0) for (const t of ['p', 'e']) { const k = S[t].hand[0]; if (k && !isLeader(k)) simCmd({ team: t, slot: 0, key: k, x: 130 + (i % 9) * 35, y: t === 'p' ? 620 : 300 }); }
      simStep(SIM_DT);
      if (i % 60 === 0) huellas.push(simHash());
    }
    T.apunta(nombre, huellas.join(' '));
    return { huellas, registro: SIM.log.slice() };
  };
  {
    const base = () => ({ p: equipo('animales', 4), e: equipo('nomuertos', 6) });
    const A = pvp(base(), 11, 'pvp · partida 1');
    const mio = JSON.stringify(SAVE);   // el SAVE de quien juega se desordena a propósito: no debe cambiar nada
    for (const k in SAVE.units) SAVE.units[k].lvl = 12; SAVE.equip = { animales: { weapon: 'x1', head: 'x2' } }; SAVE.abEquip = {}; SAVE.cards = {}; SAVE.decks = { animales: ['bunny'] };
    const B = pvp(base(), 22, 'pvp · otro SAVE');
    Object.assign(SAVE, JSON.parse(mio));
    const C = pvp({ p: equipo('animales', 5), e: equipo('nomuertos', 6) }, 33, 'pvp · otro nivel');
    const D = pvp(base(), 44, 'pvp · desde el registro', { registro: A.registro });
    const hay = A.registro.some(c => c.team === 'p') && A.registro.some(c => c.team === 'e');
    if (!hay) fallos.push('pvp: no se aplicaron jugadas de los dos lados');
    if (A.huellas.join() !== B.huellas.join()) fallos.push('pvp: la partida depende del SAVE del jugador');
    if (A.huellas.join() === C.huellas.join()) fallos.push('pvp: el nivel de las cartas no cambia la partida');
    if (A.huellas.join() !== D.huellas.join()) fallos.push('pvp: repetir el registro de los dos lados no da la misma partida');
    // los 13 campos (el normal y los 12 de jefe, con sus zonas, peajes y cosas que caen): cada uno, dos veces, con las dos copias iguales
    for (const k of ['', ...Object.keys(TERRAINS)]) {
      const X = pvp(base(), 51, 'pvp · campo ' + (k || 'normal') + ' · 1', { terreno: k, seg: 25 }), Y = pvp(base(), 62, 'pvp · campo ' + (k || 'normal') + ' · 2', { terreno: k, seg: 25 });
      if (X.huellas.join() !== Y.huellas.join()) fallos.push('pvp: el campo «' + (k || 'normal') + '» no es determinista');
    }
    // todos los ejércitos (con sus pasivas: hype, RNG, experiencia, escudos, secuelas…): cada uno contra el siguiente, dos veces, con las dos copias iguales
    const facs = FACTION_ORDER.filter(x => FACTIONS[x].leader && FACTIONS[x].units);
    for (let i = 0; i < facs.length; i++) {
      const par = () => ({ p: equipo(facs[i], 5), e: equipo(facs[(i + 1) % facs.length], 5) });
      const X = pvp(par(), 71, 'pvp · ejército ' + facs[i] + ' · 1', { terreno: '', seg: 25 }), Y = pvp(par(), 82, 'pvp · ejército ' + facs[i] + ' · 2', { terreno: '', seg: 25 });
      if (X.huellas.join() !== Y.huellas.join()) fallos.push('pvp: el ejército «' + facs[i] + '» contra «' + facs[(i + 1) % facs.length] + '» no es determinista');
    }
    PVP.terreno = undefined;
    { const vistos = new Set(); for (let s = 1; s <= 60; s++) { G.seedNext = s; vistos.add(pvpTerreno() || 'normal'); } if (vistos.size < 10) fallos.push('pvp: el campo al azar repite demasiado (' + vistos.size + ' distintos en 60 semillas)'); }
    T.apunta('pvp', fallos.some(x => x.startsWith('pvp')) ? 'FALLO' : `${A.registro.length} jugadas de los dos lados; no depende del SAVE; el equipo cambia la partida; el registro la repite`);
  }
  T.apunta('resultado', fallos.length ? 'FALLO: ' + fallos.join('; ') : 'DETERMINISTA');
};
