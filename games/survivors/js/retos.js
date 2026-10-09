// Fans of Survivors · RETOS de este juego: sus misiones, sus logros y lo que enseña su perfil.
// El sistema (cómo se cuentan, se cobran y se pintan) es común y está en core/js/retos.js; aquí solo van los datos y
// lo que pasa al acabar una partida. Para añadir una misión o un logro basta con escribirlo aquí.
'use strict';
/* ---------- al acabar una partida se pasa todo de una vez a misiones y logros ----------
   Nombres de lo que se cuenta: play, win, kill, minuto (minutos aguantados), nivel (subidas de nivel en partida), cofre,
   bosskill (SurvivalBot despedido), arma_<id> (partidas usando esa arma), elite (gordos despedidos). */
function cierraRetos(win, o) {
  missionEvent('play', 1); missionEvent('kill', o.kills); missionEvent('minuto', Math.floor(o.t / 60)); missionEvent('nivel', o.nivel - 1);
  if (o.cofres) missionEvent('cofre', o.cofres);
  if (o.elites) missionEvent('elite', o.elites);
  for (const a of o.armas) stat('arma_' + a, 1);
  stat('fac_' + o.fac, 1);
  SAVE.stats.best_t = Math.max(SAVE.stats.best_t || 0, Math.floor(o.t));
  SAVE.stats.best_k = Math.max(SAVE.stats.best_k || 0, o.kills); SAVE.stats.best_n = Math.max(SAVE.stats.best_n || 0, o.nivel);
  const h = new Date().getHours(); if (h < 5) stat('night', 1);
  if (o.kills >= 1500) stat('massacre', 1);
  if (o.armas.length >= SV.maxArmas) stat('arsenal', 1);
  if (!win) { stat('lose', 1); SAVE.stats.streak = 0; achScan(); return; }
  missionEvent('win', 1); missionEvent('bosskill', 1); missionEvent('facwin', 1, o.fac); stat('facwin_' + o.fac, 1);
  if (o.vida < 0.15) stat('closecall', 1);
  SAVE.stats.streak = (SAVE.stats.streak || 0) + 1; SAVE.stats.bestStreak = Math.max(SAVE.stats.bestStreak || 0, SAVE.stats.streak);
  achScan();
}
const mmss = t => Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0');

const RETOS = {
  categorias: [['all', 'Todos'], ['b', 'Batallas'], ['c', 'Cartas'], ['g', 'Gashapón'], ['d', 'Constancia'], ['s', 'Secretos']],
  /* ---------- misiones diarias: cada día salen 4 de esta lista ---------- */
  diarias: [
    { id: 'play3', txt: 'Juega 3 partidas', goal: 3, ev: 'play' },
    { id: 'kill500', txt: 'Despide a 500 robots', goal: 500, ev: 'kill' },
    { id: 'kill1500', txt: 'Despide a 1.500 robots', goal: 1500, ev: 'kill' },
    { id: 'min10', txt: 'Aguanta 10 minutos en total', goal: 10, ev: 'minuto' },
    { id: 'min5', txt: 'Aguanta 5 minutos en total', goal: 5, ev: 'minuto' },
    { id: 'nivel30', txt: 'Sube 30 niveles en tus partidas', goal: 30, ev: 'nivel' },
    { id: 'cofre1', txt: 'Abre un Cofre de botín', goal: 1, ev: 'cofre' },
    { id: 'elite2', txt: 'Despide a 2 enemigos gigantes', goal: 2, ev: 'elite' },
    { id: 'win1', txt: 'Despide a SurvivalBot', goal: 1, ev: 'win' },
    { id: 'pull1', txt: 'Gira una vez el gashapón', goal: 1, ev: 'pull' },
    { id: 'lvl1', txt: 'Sube de nivel una carta', goal: 1, ev: 'lvlup' },
    { id: 'gift', txt: 'Recoge el regalo diario de la tienda', goal: 1, ev: 'gift' },
  ],
  /* ---------- misiones semanales: cada lunes salen 4 de esta lista ---------- */
  semanales: [
    { id: 'wplay', txt: 'Juega 20 partidas', goal: 20, ev: 'play' },
    { id: 'wkill', txt: 'Despide a 10.000 robots', goal: 10000, ev: 'kill' },
    { id: 'wmin', txt: 'Aguanta 60 minutos en total', goal: 60, ev: 'minuto' },
    { id: 'wwin', txt: 'Despide a SurvivalBot 3 veces', goal: 3, ev: 'win' },
    { id: 'wcofre', txt: 'Abre 8 Cofres de botín', goal: 8, ev: 'cofre' },
    { id: 'wnivel', txt: 'Sube 200 niveles en tus partidas', goal: 200, ev: 'nivel' },
    { id: 'wpull', txt: 'Gira 10 veces el gashapón', goal: 10, ev: 'pull' },
    { id: 'wlvl', txt: 'Sube 5 niveles a tus cartas', goal: 5, ev: 'lvlup' },
  ],
  /* ---------- perfil ---------- */
  perfil() {
    const S = SAVE.stats;
    return { sub: `Récord: ${mmss(S.best_t || 0)} · Pase nivel ${passLevel()}`, celdas: [
      ['RÉCORD', mmss(S.best_t || 0), 'aguantado'],
      ['SURVIVALBOT', fmt(S.win || 0), 'veces despedido'],
      ['PARTIDAS', fmt(S.play || 0), 'jugadas'],
      ['ROBOTS', fmt(S.kill || 0), 'despedidos'], celdaLogros(), celdaRacha()] };
  },
  avatares: () => ['animales'],
  /* ---------- logros: fam(id, categoría, de dónde sale, metas, gemas, nombre, texto, broma, pista si es secreto) ---------- */
  logros(fam, veces) {
    const ownCount = k => new Set(SAVE.inv.filter(it => it.k === k).map(it => it.id)).size;
    // -- Batallas
    fam('play', 'b', 'play', [1, 10, 25, 50, 100, 250, 500, 1000], [5, 5, 10, 15, 20, 30, 45, 60], 'Fichando', g => veces(g, 'Juega tu primera partida.', 'Juega {n} partidas.'), 'Aquí sí cuentan tus horas.');
    fam('win', 'b', 'win', [1, 5, 10, 25, 50, 100, 250], [30, 15, 20, 30, 50, 70, 100], ['Robot despedido', 'Ya es costumbre', 'Diez cartas de despido', 'Recursos Humanos te teme', 'El CEO cambia de robot', 'Cien despidos', 'Leyenda del despido'],
      g => veces(g, 'Despide a SurvivalBot.', 'Despide a SurvivalBot {n} veces.'), 'Microblizz ya busca otro robot.');
    fam('kill', 'b', 'kill', [500, 2500, 10000, 25000, 50000, 100000, 250000, 500000, 1000000], [5, 10, 15, 25, 35, 45, 60, 80, 120], 'Adiós, robots', g => `Despide a ${fmt(g)} robots.`, 'Microblizz tendrá que comprar más.');
    fam('minuto', 'b', 'minuto', [10, 60, 180, 600, 1500, 3000], [5, 10, 20, 30, 45, 70], 'Horas de oficina', g => `Aguanta ${fmt(g)} minutos en total.`, 'Sin fichar la salida.');
    fam('besta', 'b', () => Math.floor((SAVE.stats.best_t || 0) / 60), [1, 3, 5, 7, 10], [5, 10, 15, 20, 30], 'Superviviente', g => `Aguanta ${g} minutos en una partida.`, 'Más que un becario en Microblizz.');
    fam('nivel', 'b', () => SAVE.stats.best_n || 0, [10, 20, 30, 40, 50], [5, 10, 15, 25, 40], 'Ascenso exprés', g => `Llega al nivel ${g} en una partida.`, 'Un ascenso por minuto. En Microblizz, uno por década.');
    fam('cofre', 'b', 'cofre', [1, 10, 50, 100, 250], [10, 15, 25, 40, 60], 'Sin microtransacciones', g => veces(g, 'Abre un Cofre de botín.', 'Abre {n} Cofres de botín.'), 'Gratis. Que no se entere el CEO.');
    fam('elite', 'b', 'elite', [1, 10, 50, 100, 250], [10, 15, 25, 40, 60], 'Cuanto más grandes…', g => veces(g, 'Despide a un enemigo gigante.', 'Despide a {n} enemigos gigantes.'), '…más fuerte es el finiquito.');
    fam('wstreak', 'b', () => SAVE.stats.bestStreak || 0, [2, 3, 5, 10], [10, 15, 30, 60], 'En racha', g => `Despide a SurvivalBot ${g} veces seguidas.`, 'Microblizz pide revisar la jugada.');
    // -- Cartas: cada arma tiene su logro de usarla y cada carta el de subirla de nivel
    const F = FACTIONS.animales;
    for (const a in ARMAS) {
      if (armaDeFac(a) !== 'animales') continue;
      const nm = ARMAS[a].nombre;
      fam('ar_' + a, 'c', 'arma_' + a, [1, 10, 50, 100, 250], [5, 5, 10, 15, 25], `Fan de ${nm}`, g => veces(g, `Juega una partida con ${nm}.`, `Juega {n} partidas con ${nm}.`), 'Carta de Animales Locos.');
    }
    // -- Las otras facciones: jugar y ganar con cada una
    for (const f of Object.keys(DESBLOQUEO)) {
      const nm = FACTIONS[f].name;
      fam('fp_' + f, 'c', 'fac_' + f, [1, 10, 50], [5, 10, 25], `Fan de ${nm}`, g => veces(g, `Juega una partida con ${nm}.`, `Juega {n} partidas con ${nm}.`), 'Una facción más para sobrevivir.');
      fam('fw_' + f, 'c', 'facwin_' + f, [1, 5], [10, 25], `Campeón de ${nm}`, g => veces(g, `Gana una partida con ${nm}.`, `Gana {n} partidas con ${nm}.`), 'SurvivalBot no esperaba refuerzos.');
    }
    for (const k of [F.leader, ...F.units]) {
      const nm = CFG.cards[k].name;
      fam('cl_' + k, 'c', () => uSave(k).lvl, [2, 3, 5, 7, 10], [5, 5, 5, 5, 10], `Ascenso de ${nm}`, g => `Sube a ${nm} a nivel ${g}.`, g => (g === 10 ? 'Nivel máximo. Ni el CEO llega tan alto.' : 'Carta de Animales Locos.'));
    }
    fam('lvl', 'c', 'lvlup', [1, 10, 25, 50], [5, 10, 25, 50], 'Subida de sueldo', g => veces(g, 'Sube de nivel una carta.', 'Sube {n} niveles a tus cartas.'), 'A ti sí te suben el sueldo.');
    // -- Gashapón
    fam('pull', 'g', 'pull', [1, 10, 50, 100, 250, 500, 1000], [5, 5, 10, 30, 30, 50, 70], 'Adicto a las cápsulas', g => veces(g, 'Gira el gashapón por primera vez.', 'Gira {n} veces el gashapón.'), 'Microblizz te manda una postal.');
    fam('leg', 'g', 'leg', [1, 5, 10, 25], [10, 15, 25, 40], 'Suerte legendaria', g => veces(g, 'Consigue una legendaria en el gashapón.', 'Consigue {n} legendarias en el gashapón.'), 'Salen 3 de cada 100. Dicen.');
    const N_AB = Object.keys(ABILITIES).length, N_EQ = Object.keys(ITEMS).length;
    fam('ownab', 'g', () => ownCount('ab'), [5, 10, 15, N_AB], [10, 20, 30, 80], 'Coleccionista de habilidades', g => g === N_AB ? 'Consigue todas las habilidades.' : `Consigue ${g} habilidades distintas.`, 'Hazte con todas.');
    fam('owneq', 'g', () => ownCount('eq'), [5, 10, 20, N_EQ], [10, 20, 45, 80], 'Coleccionista de objetos', g => g === N_EQ ? 'Consigue todos los objetos.' : `Consigue ${g} objetos distintos.`, 'Tu armario es más grande que la sede de Microblizz.');
    fam('goldb', 'g', () => SAVE.gold, [1000, 5000, 25000, 100000], [5, 10, 20, 45], 'Hucha de oro', g => `Ten ${fmt(g)} de oro a la vez.`, 'El CEO quiere saber tu secreto.');
    // -- Constancia
    fam('days', 'd', 'days', [1, 3, 7, 14, 30, 60, 100], [5, 10, 15, 20, 30, 40, 50], 'Fichaje diario', g => veces(g, 'Juega un día.', 'Juega {n} días distintos.'), 'Más constante que los servidores de Microblizz.');
    fam('daily', 'd', 'dailydone', [1, 10, 25, 50, 100], [5, 10, 15, 20, 30], 'Misión cumplida', g => veces(g, 'Completa una misión diaria.', 'Completa {n} misiones diarias.'), 'Más productivo que un consejo de dirección.');
    fam('passl', 'd', () => passLevel(), [1, 5, 10, 20, 30], [5, 10, 15, 25, 50], 'Pase de batalla', g => `Llega al nivel ${g} del pase de batalla.`, 'Dura hasta que Microblizz lo cierre.');
    fam('idle', 'd', 'idle', [1, 10, 50, 100], [10, 15, 25, 40], 'Horas extra', g => veces(g, 'Recoge lo que gana tu líder en HORAS EXTRA.', 'Recoge {n} veces las HORAS EXTRA.'), 'Aquí las horas extra sí se pagan.');
    // -- Secretos
    const SECRETS = [
      ['night', 'night', 1, 40, 'Turno de noche', 'Juega una partida entre las 0:00 y las 5:00.', 'Microblizz también te vigila de noche.', 'Pista: hay horas en las que hasta Microblizz duerme.'],
      ['massacre', 'massacre', 1, 40, 'Despidos al revés', 'Despide a 1.500 robots en una sola partida.', 'Recursos humanos no da abasto.', 'Pista: muchísimos robots en una sola partida.'],
      ['arsenal', 'arsenal', 1, 30, 'Arsenal completo', 'Llena los 6 huecos de arma en una partida.', 'Seis cartas, cero contratos.', 'Pista: más armas, más caos.'],
      ['close', 'closecall', 1, 40, 'Por los pelos', 'Despide a SurvivalBot con menos del 15 % de vida.', 'Ni el VAR lo tenía claro.', 'Pista: ganar cuando todo parecía perdido.'],
      ['howto', 'howto', 1, 20, 'Leer las instrucciones', 'Abre «Cómo se juega».', 'Nadie lo hace. Tú sí.', 'Pista: está en el menú principal.'],
      ['mute', 'mute', 1, 20, 'Silencio, se juega', 'Quita el sonido.', 'Así no oyes al CEO.', 'Pista: ssshhh.'],
      ['lose', 'lose', 10, 30, 'Aprender a perder', 'Pierde 10 partidas.', 'Microblizz lo celebra con otro yate.', 'Pista: de los errores se aprende.'],
      ['pause', 'pause', 10, 20, 'Pausa para el café', 'Pausa la partida 10 veces.', 'Un derecho básico. Menos en Microblizz.', 'Pista: tómate un respiro.'],
      ['news', 'news', 1, 20, 'Al día', 'Lee las novedades del juego.', 'Las notas de Microblizz son de broma. ¿O no?', 'Pista: el juego cambia; entérate.'],
    ];
    for (const [id, src, goal, gm, nm, txt, jk, hint] of SECRETS) fam('s_' + id, 's', src, [goal], [gm], nm, () => txt, jk, hint);
  },
};
