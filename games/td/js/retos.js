// Fans of TD · RETOS de este juego: sus misiones, sus logros y lo que enseña su perfil.
// El sistema (cómo se cuentan, se cobran y se pintan) es común y está en core/js/retos.js; aquí solo van los datos y
// los avisos de lo que pasa en la partida. Para añadir una misión o un logro basta con escribirlo aquí.
'use strict';
/* ---------- lo que pasa en una partida ----------
   Durante la partida solo se apunta (cuenta); al acabar se pasa todo de una vez a misiones y logros (cierraRetos).
   Nombres de lo que se cuenta: torre (torre colocada), play_<carta>, leader (líder colocado), kill, ekf_<facción enemiga>,
   mejora, fusion, envio (unidad enviada en VS), caos (CAOS gastado), wave (oleadas superadas). */
function cuenta(ev, n) { if (G.vs && G.vsCur === 'ai') return; const R = G.rt || (G.rt = {}); R[ev] = (R[ev] || 0) + (n == null ? 1 : n); }
// win: si has ganado · o: { vs, jefe, estrellas (nuevas), vida, camino }
function cierraRetos(win, o) {
  const R = G.rt || {}, fac = G.fac; G.rt = {};
  for (const ev in R) missionEvent(ev, R[ev]);
  missionEvent('play', 1); missionEvent(o.vs ? 'vs' : 'camp', 1);
  const h = new Date().getHours(); if (h < 5) stat('night', 1);
  if ((R.kill || 0) >= 500) stat('massacre', 1);
  if ((R.caos || 0) >= 6000) stat('bigspend', 1);
  if ((o.camino || 0) >= 60) stat('laberinto', 1);
  if (!win) { stat('lose', 1); SAVE.stats.streak = 0; return; }
  missionEvent('win', 1); missionEvent('facwin', 1, fac); stat('fwin_' + fac, 1);
  if (o.vs) missionEvent('vswin', 1);
  if (o.jefe) missionEvent('bosskill', 1);
  if (o.estrellas) missionEvent('star', o.estrellas);
  if (o.vida >= TD.baseHp) missionEvent('flawless', 1);
  if (o.vida < TD.baseHp * 0.15) stat('closecall', 1);
  SAVE.stats.streak = (SAVE.stats.streak || 0) + 1; SAVE.stats.bestStreak = Math.max(SAVE.stats.bestStreak || 0, SAVE.stats.streak);
}
const estrellasMundo = wi => WORLDS_TD[wi].levels.reduce((a, l) => a + starsOf(l.id), 0);
const estrellasTotal = () => WORLDS_TD.reduce((a, w, wi) => a + estrellasMundo(wi), 0);

const RETOS = {
  /* ---------- misiones diarias: cada día salen 4 de esta lista ---------- */
  diarias: [
    { id: 'win2', txt: 'Gana 2 partidas', goal: 2, ev: 'win' },
    { id: 'play3', txt: 'Juega 3 partidas', goal: 3, ev: 'play' },
    { id: 'torres25', txt: 'Coloca 25 torres', goal: 25, ev: 'torre' },
    { id: 'kills300', txt: 'Derrota a 300 enemigos', goal: 300, ev: 'kill' },
    { id: 'olas20', txt: 'Supera 20 oleadas', goal: 20, ev: 'wave' },
    { id: 'stars3', txt: 'Consigue 3 estrellas en la campaña', goal: 3, ev: 'star' },
    { id: 'vs1', txt: 'Juega una partida del modo VS', goal: 1, ev: 'vs' },
    { id: 'envio10', txt: 'Envía 10 unidades en el modo VS', goal: 10, ev: 'envio' },
    { id: 'pull1', txt: 'Gira una vez el gashapón', goal: 1, ev: 'pull' },
    { id: 'lvl1', txt: 'Sube de nivel una carta', goal: 1, ev: 'lvlup' },
    { id: 'leader3', txt: 'Coloca a tu líder 3 veces', goal: 3, ev: 'leader' },
    { id: 'flawless', txt: 'Gana sin que toquen tu base', goal: 1, ev: 'flawless' },
    { id: 'camp2', txt: 'Juega 2 partidas de la campaña', goal: 2, ev: 'camp' },
    { id: 'caos3000', txt: 'Gasta 3.000 de CAOS', goal: 3000, ev: 'caos' },
    { id: 'fusion2', txt: 'Fusiona 2 torres', goal: 2, ev: 'fusion' },
    { id: 'mejora5', txt: 'Mejora 5 torres', goal: 5, ev: 'mejora' },
    { id: 'facwin', txt: 'Gana una partida con {F}', goal: 1, ev: 'facwin' },
    { id: 'gift', txt: 'Recoge el regalo diario de la tienda', goal: 1, ev: 'gift' },
  ],
  /* ---------- misiones semanales: cada lunes salen 4 de esta lista ---------- */
  semanales: [
    { id: 'wwin', txt: 'Gana 15 partidas', goal: 15, ev: 'win' },
    { id: 'wkill', txt: 'Derrota a 3.000 enemigos', goal: 3000, ev: 'kill' },
    { id: 'wtorre', txt: 'Coloca 250 torres', goal: 250, ev: 'torre' },
    { id: 'wola', txt: 'Supera 150 oleadas', goal: 150, ev: 'wave' },
    { id: 'wstar', txt: 'Consigue 12 estrellas en la campaña', goal: 12, ev: 'star' },
    { id: 'wvs', txt: 'Gana 3 partidas del modo VS', goal: 3, ev: 'vswin' },
    { id: 'wfus', txt: 'Fusiona 15 torres', goal: 15, ev: 'fusion' },
    { id: 'wlvl', txt: 'Sube 5 niveles a tus cartas', goal: 5, ev: 'lvlup' },
    { id: 'wpull', txt: 'Gira 5 veces el gashapón', goal: 5, ev: 'pull' },
    { id: 'wdaily', txt: 'Completa 12 misiones diarias', goal: 12, ev: 'dailydone' },
    { id: 'wflaw', txt: 'Gana 5 partidas sin que toquen tu base', goal: 5, ev: 'flawless' },
  ],

  /* ---------- perfil: la línea de debajo del nombre y las casillas de números ---------- */
  perfil() {
    const S = SAVE.stats, st = estrellasTotal(), max = WORLDS_TD.length * 12, vw = S.vswin || 0, vl = (S.vs || 0) - vw;
    return { sub: `Campaña: ${st} ★ · Pase nivel ${passLevel()}`, celdas: [
      ['CAMPAÑA', `${st} / ${max} ★`, 'estrellas'],
      ['MODO VS', `${vw} - ${Math.max(0, vl)}`, 'ganadas - perdidas'],
      ['TORRES', fmt(S.torre || 0), 'colocadas'],
      ['ENEMIGOS', fmt(S.kill || 0), 'despedidos'], celdaLogros(), celdaRacha()] };
  },

  /* ---------- logros: fam(id, categoría, de dónde sale, metas, gemas, nombre, texto, broma, pista si es secreto) ---------- */
  logros(fam, veces) {
    const facLvl = f => [FACTIONS[f].leader, ...FACTIONS[f].units].reduce((a, k) => a + uSave(k).lvl, 0);
    const gearN = f => { const k = FACTIONS[f].leader, E = SAVE.equip[k] || {}; let n = invGet(SAVE.abEquip[k]) ? 1 : 0; for (const sl in SLOTS) if (invGet(E[sl])) n++; return n; };
    const ownCount = k => new Set(SAVE.inv.filter(it => it.k === k).map(it => it.id)).size;
    // -- Batallas
    fam('win', 'b', 'win', [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500], [20, 10, 15, 25, 100, 60, 70, 90, 120, 200],
      ['Primera victoria', 'Cogiendo carrerilla', 'Diez de diez', 'Veterano de la rebelión', 'Pesadilla de Microblizz', 'Cien veces no', 'Imparable', 'Leyenda de la rebelión', 'Mil victorias', 'El terror de los CEO'],
      g => veces(g, 'Gana tu primera partida.', 'Gana {n} partidas.'),
      ['Microblizz ya está nerviosa.', 'Microblizz convoca una reunión de crisis.', 'Microblizz contrata a un consultor.', 'Microblizz culpa a los becarios.', 'El CEO ya no duerme bien.', 'El CEO vende un yate.', 'El CEO vende el otro yate.', 'Microblizz pide un rescate.', 'Microblizz pone tu foto en la entrada.', 'Los CEO de todo el mundo tiemblan.']);
    fam('play', 'b', 'play', [1, 10, 25, 50, 100, 250, 500, 1000, 2500], [5, 5, 10, 15, 20, 30, 45, 60, 90], 'Fichando', g => veces(g, 'Juega tu primera partida.', 'Juega {n} partidas.'), 'Aquí sí cuentan tus horas.');
    fam('kill', 'b', 'kill', [100, 500, 2000, 5000, 10000, 25000, 50000, 100000, 250000, 500000], [5, 10, 50, 30, 35, 45, 55, 70, 90, 120], 'Adiós, robots', g => `Derrota a ${fmt(g)} enemigos.`, 'Microblizz tendrá que comprar más.');
    fam('torre', 'b', 'torre', [10, 50, 200, 500, 1000, 2500, 5000, 10000], [5, 10, 20, 30, 40, 55, 70, 100], 'Arquitecto del caos', g => `Coloca ${fmt(g)} torres.`, 'Sin licencia de obras.');
    fam('wave', 'b', 'wave', [10, 50, 200, 500, 1000, 2500, 5000], [5, 10, 20, 30, 45, 60, 90], 'Ni una oleada más', g => `Supera ${fmt(g)} oleadas.`, 'Microblizz ya no sabe a quién mandar.');
    fam('flaw', 'b', 'flawless', [1, 10, 25, 50, 100, 250], [10, 60, 35, 45, 60, 90], 'Sin un rasguño', g => veces(g, 'Gana una partida sin que toquen tu base.', 'Gana {n} partidas sin que toquen tu base.'), 'Ni un becario llegó a la puerta.');
    fam('caos', 'b', 'caos', [1000, 5000, 20000, 50000, 100000, 250000, 500000, 1000000], [5, 5, 10, 15, 20, 30, 40, 60], 'Agente del CAOS', g => `Gasta ${fmt(g)} de CAOS.`, 'El CAOS es gratis. De momento.');
    fam('mejora', 'b', 'mejora', [5, 25, 100, 250, 500, 1000], [5, 10, 15, 25, 35, 50], 'Formación continua', g => `Mejora ${fmt(g)} torres en las partidas.`, 'En Microblizz eso se paga aparte.');
    fam('fusion', 'b', 'fusion', [1, 10, 50, 100, 250, 500], [10, 10, 20, 30, 45, 70], 'Fusión de departamentos', g => veces(g, 'Fusiona dos torres.', 'Fusiona torres {n} veces.'), 'Dos hacen el trabajo de una. Pero mejor.');
    fam('lead', 'b', 'leader', [5, 25, 50, 100, 250, 500], [5, 5, 10, 15, 25, 40], 'Líder de verdad', g => `Coloca a tu líder ${fmt(g)} veces.`, 'Un jefe que sí baja al campo.');
    fam('campp', 'b', 'camp', [1, 10, 50, 100, 250, 500], [5, 5, 10, 15, 25, 40], 'Modo historia', g => veces(g, 'Juega una partida de la campaña.', 'Juega {n} partidas de la campaña.'), 'La historia que Microblizz quiere borrar.');
    fam('vsp', 'b', 'vs', [1, 10, 50, 100, 250, 500], [5, 5, 10, 15, 25, 40], 'Cara a cara', g => veces(g, 'Juega una partida del modo VS.', 'Juega {n} partidas del modo VS.'), 'El rival también es un becario.');
    fam('vswin', 'b', 'vswin', [1, 5, 10, 25, 50, 100, 250], [10, 10, 15, 25, 40, 60, 90], 'El que ríe el último', g => veces(g, 'Gana una partida del modo VS.', 'Gana {n} partidas del modo VS.'), 'Su base era de alquiler.');
    fam('envio', 'b', 'envio', [10, 100, 500, 1000, 2500, 5000], [5, 10, 20, 30, 45, 70], 'Envío urgente', g => `Envía ${fmt(g)} unidades en el modo VS.`, 'Sin gastos de envío.');
    fam('bkill', 'b', 'bosskill', [1, 5, 12, 25, 50, 100], [15, 20, 40, 40, 60, 90], 'Despido del jefe', g => veces(g, 'Gana un nivel de jefe.', 'Gana {n} niveles de jefe.'), 'Recursos Humanos está en shock.');
    fam('wstreak', 'b', () => SAVE.stats.bestStreak || 0, [3, 5, 10, 15, 25], [10, 15, 30, 45, 80], 'En racha', g => `Gana ${g} partidas seguidas.`, 'Microblizz pide revisar la jugada.');
    // -- Facciones
    const FAC_ACH = { animales: ['Manada salvaje', 'La rabia también es una pasiva.'], nomuertos: ['Ejército eterno', 'Ni muertos trabajan ya para Microblizz.'], streamers: ['En directo', '¡Dale a la campanita!'], heroes: ['Leyenda viva', 'Los dioses vuelven a estar de buen humor.'], ciber: ['Alto voltaje', 'Firmware libre, por fin.'], memes: ['Viral', 'Este logro ya es un meme.'], gamer: ['GG', 'GG, Phony. GG.'], olvidados: ['Recordados', 'Por fin alguien se acuerda de ellos.'], pop: ['Taquillazo', 'Y sin remake.'] };
    for (const f of FACTION_ORDER.filter(f => TOWERS[f])) {
      const F = FACTIONS[f], L = CFG.cards[F.leader].name, [nm, jk] = FAC_ACH[f] || [F.name, ''];
      fam('fw_' + f, 'f', 'fwin_' + f, [1, 10, 25, 50, 100, 250, 500], [5, 10, 15, 20, 25, 35, 50], nm, g => veces(g, `Gana una partida con ${F.name}.`, `Gana {n} partidas con ${F.name}.`), jk);
      fam('fl_' + f, 'f', () => facLvl(f), [14, 28, 42, 56, 70], [5, 10, 15, 20, 30], `Plantilla de ${F.name}`, g => g >= 70 ? `Sube las 7 cartas de ${F.name} a nivel 10.` : `Suma ${g} niveles entre las 7 cartas de ${F.name}.`, 'Aquí se asciende por méritos.');
      fam('fp_' + f, 'f', () => Math.round(idlePower(f) * 100), [120, 150, 200, 250, 300], [5, 10, 15, 20, 35], `Poder de ${L}`, g => `Sube el poder de ${L} a ${g} (nivel, habilidad y equipo).`, 'Se nota en las horas extra.');
      fam('fg_' + f, 'f', () => gearN(f), [1, 2, 3, 4], [5, 5, 5, 10], `${L} bien equipado`, g => g === 4 ? `Pon a ${L} una habilidad y sus 3 objetos.` : g === 1 ? `Equipa a ${L} con una habilidad o un objeto.` : `Equipa a ${L} con ${g} cosas (habilidad u objetos).`, 'Bien vestido para la reunión.');
    }
    // -- Cartas: cada una tiene sus logros de colocarla y de subirla de nivel
    for (const f of FACTION_ORDER.filter(f => TOWERS[f])) for (const k of [FACTIONS[f].leader, ...FACTIONS[f].units]) {
      const nm = CFG.cards[k].name, jk = `Carta de ${FACTIONS[f].name}.`;
      fam('cp_' + k, 'c', 'play_' + k, [1, 10, 50, 100, 250, 500, 1000], [5, 5, 5, 5, 5, 10, 15], `Fan de ${nm}`, g => veces(g, `Coloca a ${nm} por primera vez.`, `Coloca a ${nm} {n} veces.`), jk);
      fam('cl_' + k, 'c', () => uSave(k).lvl, [2, 3, 5, 7, 10], [5, 5, 5, 5, 10], `Ascenso de ${nm}`, g => `Sube a ${nm} a nivel ${g}.`, g => (g === 10 ? 'Nivel máximo. Ni el CEO llega tan alto.' : jk));
    }
    fam('lvl', 'c', 'lvlup', [1, 10, 25, 50, 100, 250, 500], [5, 10, 50, 50, 50, 65, 90], 'Subida de sueldo', g => veces(g, 'Sube de nivel una carta.', 'Sube {n} niveles a tus cartas.'), 'A ti sí te suben el sueldo.');
    // -- Campaña: estrellas de cada mundo, estrellas totales y los dos grandes jefes
    WORLDS_TD.forEach((Wd, wi) => fam('w' + (wi + 1), 'k', () => estrellasMundo(wi), [3, 6, 9, 12], [5, 5, 10, 15], Wd.name, g => g === 12 ? `Consigue las 12 estrellas del mundo ${wi + 1}.` : `Consigue ${g} estrellas en el mundo ${wi + 1}.`, 'Cada estrella, un juego salvado.'));
    const tot = WORLDS_TD.length * 12;
    fam('st', 'k', estrellasTotal, [10, 25, 50, 100, tot], [10, 20, 40, 60, 100], 'Coleccionista de estrellas', g => g === tot ? 'Consigue todas las estrellas de la campaña.' : `Consigue ${g} estrellas en la campaña.`, 'Cada estrella, un juego salvado.');
    fam('ceo', 'k', () => (starsOf('7-4') ? 1 : 0), [1], [150], 'Compra cancelada', () => 'Gana al CEO de Microblizz (nivel 7-4).', 'El CEO tendrá que vender su yate.');
    fam('olvido', 'k', () => (starsOf('8-4') ? 1 : 0), [1], [80], 'Recuerdos recuperados', () => 'Libera a los Olvidados del sótano de Microblizz (nivel 8-4).', 'Por fin alguien se acuerda de ellos.');
    fam('phony', 'k', () => (starsOf('12-4') ? 1 : 0), [1], [150], 'Devolvednos los discos', () => 'Gana al Presidente de Phony (nivel 12-4).', 'Tu colección de discos está a salvo.');
    // -- Enemigos: cada ejército que te ataca
    for (const e of [...new Set(WORLDS_TD.map(w => w.efac))]) {
      const corp = CORP[e], nm = corp ? 'Contra ' + corp : 'Rescate: ' + FACTIONS[e].name, quien = corp ? 'enemigos de ' + corp : FACTIONS[e].corr || FACTIONS[e].name + ' corrompidos';
      fam('ef_' + e, 'e', 'ekf_' + e, corp ? [100, 500, 1000, 2500, 5000, 10000] : [25, 100, 250, 500, 1000], corp ? [5, 10, 15, 25, 35, 50] : [5, 10, 15, 20, 30], nm, g => `Derrota a ${fmt(g)} ${quien}.`, corp ? 'Despidos, pero al revés.' : 'No es nada personal: es para liberarlos.');
    }
    // -- Gashapón y tesoro
    fam('pull', 'g', 'pull', [1, 10, 50, 100, 250, 500, 1000, 2500, 5000], [5, 5, 10, 50, 30, 35, 50, 70, 100], 'Adicto a las cápsulas', g => veces(g, 'Gira el gashapón por primera vez.', 'Gira {n} veces el gashapón.'), 'Microblizz te manda una postal.');
    fam('x10', 'g', 'x10', [1, 10, 25, 50, 100], [10, 15, 25, 40, 60], 'De diez en diez', g => veces(g, 'Haz una tirada x10.', 'Haz {n} tiradas x10.'), 'Diez veces más ilusión.');
    fam('x50', 'g', 'x50', [1, 5, 10, 25, 50], [30, 40, 50, 70, 100], 'Modo ballena', g => veces(g, 'Haz una tirada x50.', 'Haz {n} tiradas x50.'), 'El CEO le ha puesto tu nombre a su yate.');
    fam('leg', 'g', 'leg', [1, 5, 10, 25, 50, 100], [10, 15, 25, 40, 60, 90], 'Suerte legendaria', g => veces(g, 'Consigue una legendaria en el gashapón.', 'Consigue {n} legendarias en el gashapón.'), 'Salen 3 de cada 100. Dicen.');
    fam('epic', 'g', 'epic', [1, 10, 25, 50, 100, 250], [5, 10, 15, 25, 35, 55], 'Épico', g => veces(g, 'Consigue una épica en el gashapón.', 'Consigue {n} épicas en el gashapón.'), 'Épico de verdad, no como el último parche.');
    fam('perfect', 'g', 'perfect', [1, 3, 5, 10, 25], [100, 40, 50, 70, 100], 'Perfeccionista', g => veces(g, 'Consigue una copia de calidad CEO (perfecta).', 'Consigue {n} copias de calidad CEO (perfecta).'), 'Sale una vez de cada cien.');
    fam('scrap', 'g', 'scrap', [10, 50, 100, 250, 500, 1000, 2500], [5, 40, 25, 35, 45, 60, 90], 'Despido masivo', g => `Despide ${fmt(g)} copias en el inventario.`, 'Como Microblizz, pero con cosas.');
    fam('reroll', 'g', 'reroll', [1, 5, 25, 50, 100, 250], [5, 30, 25, 35, 50, 70], 'Segunda oportunidad', g => veces(g, 'Vuelve a tirar los números de una copia.', 'Vuelve a tirar los números de una copia {n} veces.'), 'Más oportunidades de las que da Microblizz.');
    const N_AB = Object.keys(ABILITIES).length, N_EQ = Object.keys(ITEMS).length;
    fam('ownab', 'g', () => ownCount('ab'), [5, 10, 15, N_AB], [10, 20, 30, 80], 'Coleccionista de habilidades', g => g === N_AB ? 'Consigue todas las habilidades.' : `Consigue ${g} habilidades distintas.`, 'Hazte con todas. Sin gastar. Bueno, casi.');
    fam('owneq', 'g', () => ownCount('eq'), [5, 10, 15, 20, N_EQ], [10, 20, 30, 45, 80], 'Coleccionista de objetos', g => g === N_EQ ? 'Consigue todos los objetos.' : `Consigue ${g} objetos distintos.`, 'Tu armario es más grande que la sede de Microblizz.');
    fam('goldb', 'g', () => SAVE.gold, [1000, 5000, 10000, 25000, 50000, 100000, 250000], [5, 10, 15, 20, 30, 45, 70], 'Hucha de oro', g => `Ten ${fmt(g)} de oro a la vez.`, 'El CEO quiere saber tu secreto.');
    fam('gemb', 'g', () => SAVE.gems, [500, 1000, 2500, 5000], [10, 15, 30, 50], 'Hucha de ballena', g => `Ten ${fmt(g)} gemas a la vez.`, g => (g === 2500 ? 'Justo lo que cuesta una tirada x50.' : 'Ahorrar también es un arte.'));
    // -- Constancia
    fam('days', 'd', 'days', [1, 3, 7, 14, 30, 60, 100, 150, 200, 365], [5, 10, 15, 20, 30, 40, 50, 60, 70, 100], 'Fichaje diario', g => veces(g, 'Juega un día.', 'Juega {n} días distintos.'), 'Más constante que los servidores de Phony.');
    fam('lstreak', 'd', () => (SAVE.login && SAVE.login.best) || 0, [3, 7], [15, 50], 'Fan de verdad', g => `Entra ${g} días seguidos.`, 'Microblizz no consigue echarte.');
    fam('daily', 'd', 'dailydone', [1, 10, 25, 50, 100, 250, 500, 1000], [5, 10, 15, 20, 30, 40, 60, 80], 'Misión cumplida', g => veces(g, 'Completa una misión diaria.', 'Completa {n} misiones diarias.'), 'Más productivo que un consejo de dirección.');
    fam('weekly', 'd', 'weekdone', [1, 5, 10, 25, 50, 100], [10, 15, 25, 40, 60, 100], 'Semana completa', g => veces(g, 'Completa una misión semanal.', 'Completa {n} misiones semanales.'), 'Te has ganado el fin de semana.');
    fam('passl', 'd', () => passLevel(), [1, 5, 10, 15, 20, 25, 30], [5, 10, 15, 20, 25, 30, 50], 'Pase de batalla', g => `Llega al nivel ${g} del pase de batalla.`, 'Dura hasta que Microblizz lo cierre.');
    fam('gift', 'd', 'gift', [1, 7, 30, 100, 365], [5, 10, 20, 40, 80], 'Regalo de la casa', g => veces(g, 'Recoge el regalo diario de la tienda.', 'Recoge {n} veces el regalo diario de la tienda.'), 'Lo único gratis de la tienda.');
    fam('login', 'd', 'login', [1, 7, 30, 100, 365], [5, 10, 20, 40, 80], 'Premio diario', g => veces(g, 'Cobra el premio diario.', 'Cobra {n} premios diarios.'), 'Microblizz te premia para que no te vayas.');
    fam('idle', 'd', 'idle', [1, 10, 50, 100, 250, 500], [10, 15, 25, 40, 60, 90], 'Horas extra', g => veces(g, 'Recoge lo que gana tu líder en HORAS EXTRA.', 'Recoge {n} veces las HORAS EXTRA.'), 'Aquí las horas extra sí se pagan.');
    fam('idleh', 'd', 'idleh', [12, 50, 100, 250, 500, 1000, 2500], [10, 15, 20, 30, 40, 60, 100], 'Jornada interminable', g => `Cobra ${fmt(g)} horas en las HORAS EXTRA.`, 'Tu líder pide vacaciones.');
    fam('idleg', 'd', 'idleg', [1000, 10000, 50000, 100000, 500000], [10, 20, 35, 55, 100], 'Sueldo extra', g => `Gana ${fmt(g)} de oro en las HORAS EXTRA.`, 'Mejor pagado que en Microblizz.');
    fam('idlei', 'd', 'idlei', [1, 5, 10, 25, 50], [10, 20, 30, 50, 80], 'Objetos perdidos', g => veces(g, 'Tu líder encuentra un objeto en las HORAS EXTRA.', 'Tu líder encuentra {n} objetos en las HORAS EXTRA.'), 'Nadie sabe de dónde los saca.');
    // -- Secretos: no se sabe qué piden hasta que se consiguen (solo hay una pista)
    const SECRETS = [
      ['night', 'night', 1, 40, 'Turno de noche', 'Juega una partida entre las 0:00 y las 5:00.', 'Microblizz también te vigila de noche.', 'Pista: hay horas en las que hasta Microblizz duerme.'],
      ['laberinto', 'laberinto', 1, 50, 'El Minotauro aprueba', 'Acaba una partida con un camino de 60 casillas o más.', 'Los becarios piden un mapa.', 'Pista: que den muchas, muchas vueltas.'],
      ['spend', 'bigspend', 1, 30, 'Derroche', 'Gasta 6.000 de CAOS en una sola partida.', 'Microblizz quiere ficharte para finanzas.', 'Pista: el CAOS está para gastarlo.'],
      ['massacre', 'massacre', 1, 40, 'Despidos al revés', 'Derrota a 500 enemigos en una sola partida.', 'Recursos humanos no da abasto.', 'Pista: muchísimos enemigos en una sola partida.'],
      ['close', 'closecall', 1, 40, 'Por los pelos', 'Gana con tu base por debajo del 15 % de vida.', 'Ni el VAR lo tenía claro.', 'Pista: ganar cuando todo parecía perdido.'],
      ['nivel5', 'nivel5', 1, 40, 'Fusión total', 'Lleva una torre al nivel 5 a base de fusiones.', 'Cinco becarios en un solo cuerpo.', 'Pista: fusiona, fusiona y vuelve a fusionar.'],
      ['tut', () => (SAVE.tut && SAVE.tut.done ? 1 : 0), 1, 20, 'Ya me lo sé', 'Termina la partida guiada.', 'Bienvenido a la rebelión.', 'Pista: lo primero es lo primero.'],
      ['howto', 'howto', 1, 20, 'Leer las instrucciones', 'Abre «Cómo se juega».', 'Nadie lo hace. Tú sí.', 'Pista: está en el menú principal.'],
      ['speed', 'speed2', 1, 20, 'Con prisa', 'Pon la partida a velocidad x2.', 'El tiempo es oro. Y el oro, de Microblizz.', 'Pista: hay un botón para ir más rápido.'],
      ['export', 'export', 1, 20, 'Copia de seguridad', 'Exporta tu progreso en Opciones.', 'Que no te lo cierren.', 'Pista: mira en Opciones.'],
      ['scrapp', 'scrapperf', 1, 60, 'Esto no se tira', 'Despide una copia de calidad CEO (perfecta).', '¿Seguro que no la querías?', 'Pista: despedir algo que no deberías.'],
      ['broke', 'broke', 1, 30, 'Sin blanca', 'Quédate con 0 gemas después de girar el gashapón.', 'Microblizz te quiere mucho.', 'Pista: gástalo todo.'],
      ['prem', () => (SAVE.pass && SAVE.pass.prem ? 1 : 0), 1, 30, 'VIP', 'Activa el pase premium.', 'Gratis en esta versión. Que no se entere el CEO.', 'Pista: el pase tiene dos caminos.'],
      ['full', 'idlefull', 1, 30, 'Almacén lleno', 'Recoge las HORAS EXTRA con el almacén lleno (12 h).', 'Tu líder ya estaba durmiendo.', 'Pista: deja trabajar a tu líder mucho, mucho tiempo.'],
      ['swap', 'idleswap', 1, 20, 'Cambio de turno', 'Cambia de líder en las HORAS EXTRA.', 'Turno de día, turno de noche.', 'Pista: cualquiera puede hacer horas extra.'],
      ['mute', 'mute', 1, 20, 'Silencio, se juega', 'Quita el sonido.', 'Así no oyes al CEO.', 'Pista: ssshhh.'],
      ['lose', 'lose', 10, 30, 'Aprender a perder', 'Pierde 10 partidas.', 'Microblizz lo celebra con otro yate.', 'Pista: de los errores se aprende.'],
      ['pause', 'pause', 10, 20, 'Pausa para el café', 'Pausa la partida 10 veces.', 'Un derecho básico. Menos en Microblizz.', 'Pista: tómate un respiro.'],
      ['news', 'news', 1, 20, 'Al día', 'Lee las novedades del juego.', 'Las notas de Microblizz son de broma. ¿O no?', 'Pista: el juego cambia; entérate.'],
    ];
    for (const [id, src, goal, gm, nm, txt, jk, hint] of SECRETS) fam('s_' + id, 's', src, [goal], [gm], nm, () => txt, jk, hint);
  },
};
