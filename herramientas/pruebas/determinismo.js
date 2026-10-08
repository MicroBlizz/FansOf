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
  T.apunta('resultado', fallos.length ? 'FALLO: ' + fallos.join('; ') : 'DETERMINISTA');
};
