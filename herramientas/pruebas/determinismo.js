// Fans Of · Prueba de determinismo de Rumble: juega la misma partida dos veces (misma semilla, mismas jugadas) y compara la huella del estado cada segundo.
// Se añade al final de rumble.js (lo hace comparar.js con ?auto=rumble&det=1) y cambia lo que se ejecuta; se lanza con: python herramientas/comprobar.py --determinismo
PRUEBA.pasos = async function (T) {
  const SEGUNDOS = +new URLSearchParams(parent.location.search).get('seg') || 90, JUGADAS = [300, 900, 1500, 2100, 2700, 3300, 3900, 4500];   // ticks en los que el jugador echa la primera carta de su mano
  const juega = (semilla, azar, nombre, prepara) => {
    T.semilla(azar);   // el Math.random de la página es distinto en cada partida: si la simulación lo usara, las huellas saldrían distintas
    prepara(); G.seedNext = semilla; G.autoplay = true; startMatch(); T.avanza(4200);
    if (G.state !== 'play') throw new Error('la partida no ha empezado: ' + G.state);
    const huellas = [];
    for (let i = 1; i <= SEGUNDOS * 60; i++) {
      if (JUGADAS.includes(i)) { const k = S.p.hand[0], c = cardDef(k); if (c && S.p.chaos >= c.cost && canDeploy('p', k)) doDeploy('p', k, 150 + (i % 7) * 40, 620); }
      simStep(SIM_DT);
      if (i % 60 === 0) huellas.push(simHash());
    }
    T.apunta(nombre, huellas.join(' '));
    return huellas;
  };
  const rapida = () => { setFaction('animales'); G.diff = 'normal'; G.diffCfg = CFG.diff.normal; G.prep = { mode: 'quick' }; setupMatch('quick'); };
  const campana = () => { setFaction('animales'); campDiff = 'n'; G.prep = { mode: 'camp', lvl: findLevel('2-4'), cd: 'n' }; setupMatch('camp', findLevel('2-4'), 'n'); };   // jefe con campo especial (zonas y caídas)
  const memes = () => { setFaction('memes'); G.diff = 'normal'; G.diffCfg = CFG.diff.normal; G.prep = { mode: 'quick' }; setupMatch('quick'); };
  T.paso('determinismo');
  const fallos = [];
  for (const [nombre, prepara] of [['rápida', rapida], ['campaña con jefe', campana], ['memes', memes]]) {
    const a = juega(777, 11, nombre + ' · partida 1', prepara), b = juega(777, 22, nombre + ' · partida 2', prepara), c = juega(778, 11, nombre + ' · otra semilla', prepara);
    const igual = a.join() === b.join(), difiere = a[a.length - 1] !== c[c.length - 1];
    if (!igual) { const i = a.findIndex((h, j) => h !== b[j]); fallos.push(`${nombre}: las dos partidas se separan en el segundo ${i + 1}`); }
    if (!difiere) fallos.push(`${nombre}: otra semilla da la misma partida (la semilla no se usa)`);
    T.apunta(nombre, igual && difiere ? 'IGUALES con la misma semilla y distintas con otra' : 'FALLO');
  }
  T.apunta('resultado', fallos.length ? 'FALLO: ' + fallos.join('; ') : 'DETERMINISTA');
};
