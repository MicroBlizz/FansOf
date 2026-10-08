// Fans of Rumble · RETOS (3/3): los logros de este juego. Se añaden a RETOS, que se crea en retos.js
'use strict';
Object.assign(RETOS, {
  /* ---------- logros: más de 1.500, en familias por niveles (I, II, III…). Entre todos dan unas 25.000 gemas ----------
     fam(id, categoría, de dónde sale el progreso (una estadística o una función), metas, gemas de cada meta, nombre (o uno por nivel),
         texto de la meta, broma, ids de los logros de la 0.9.13 (para no perder lo cobrado) y pista (logros secretos)) */
  logros(famComun, veces) {
    const fam = (id, cat, src, goals, gems, name, txt, joke, al, hint) => { const f = famComun(id, cat, src, goals, gems, name, txt, joke, hint); f.al = al || {}; return f; };
    // -- Batallas
    fam('win', 'b', 'win', [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500], [20, 10, 15, 25, 100, 60, 70, 90, 120, 200],
      ['Primera victoria', 'Cogiendo carrerilla', 'Diez de diez', 'Veterano de la rebelión', 'Pesadilla de Microblizz', 'Cien veces no', 'Imparable', 'Leyenda de la rebelión', 'Mil victorias', 'El terror de los CEO'],
      g => veces(g, 'Gana tu primera partida.', 'Gana {n} partidas.'),
      ['Microblizz ya está nerviosa.', 'Microblizz convoca una reunión de crisis.', 'Microblizz contrata a un consultor.', 'Microblizz culpa a los becarios.', 'El CEO ya no duerme bien.', 'El CEO vende un yate.', 'El CEO vende el otro yate.', 'Microblizz pide un rescate.', 'Microblizz pone tu foto en la entrada.', 'Los CEO de todo el mundo tiemblan.'], { 1: 'win1', 50: 'win50' });
    fam('play', 'b', 'play', [1, 10, 25, 50, 100, 250, 500, 1000, 2500], [5, 5, 10, 15, 20, 30, 45, 60, 90], 'Fichando', g => veces(g, 'Juega tu primera partida.', 'Juega {n} partidas.'), 'Aquí sí cuentan tus horas.');
    fam('kill', 'b', 'kill', [50, 200, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000], [5, 10, 50, 30, 35, 45, 55, 70, 90, 120], 'Adiós, robots', g => `Derrota a ${fmt(g)} enemigos.`, 'Microblizz tendrá que comprar más.', { 500: 'kill500' });
    fam('tower', 'b', 'tower', [5, 30, 100, 250, 500, 1000, 2500], [5, 50, 30, 35, 45, 60, 90], 'Torres fuera', g => `Derriba ${fmt(g)} torres.`, 'Según Microblizz, sobraban.', { 30: 'tower30' });
    fam('base', 'b', 'base', [1, 10, 25, 50, 100, 250, 500], [10, 60, 30, 40, 50, 65, 90], 'Juego salvado', g => veces(g, 'Tira una base enemiga.', 'Tira {n} bases enemigas.'), 'Otro juego que no se cierra.', { 10: 'base10' });
    fam('flaw', 'b', 'flawless', [1, 10, 25, 50, 100, 250], [10, 60, 35, 45, 60, 90], 'Sin un rasguño', g => veces(g, 'Gana una partida sin perder ninguna torre.', 'Gana {n} partidas sin perder ninguna torre.'), 'Ni una torre para Microblizz.', { 10: 'flaw10' });
    fam('card', 'b', 'card', [50, 250, 1000, 2500, 5000, 10000, 25000], [5, 5, 10, 15, 25, 35, 50], 'Mazo caliente', g => `Juega ${fmt(g)} cartas.`, 'Cada carta, un becario menos.');
    fam('caos', 'b', 'caos', [100, 500, 2000, 5000, 10000, 25000, 50000, 100000], [5, 5, 10, 15, 20, 30, 40, 60], 'Agente del CAOS', g => `Gasta ${fmt(g)} de CAOS.`, 'El CAOS es gratis. De momento.');
    fam('quick', 'b', 'quick', [1, 10, 50, 100, 250, 500], [5, 5, 10, 15, 25, 40], 'Partida rápida', g => veces(g, 'Juega una partida rápida.', 'Juega {n} partidas rápidas.'), 'Rápida como un despido.');
    fam('campp', 'b', 'camp', [1, 10, 50, 100, 250, 500], [5, 5, 10, 15, 25, 40], 'Modo historia', g => veces(g, 'Juega una partida de la campaña.', 'Juega {n} partidas de la campaña.'), 'La historia que Microblizz quiere borrar.');
    fam('bossp', 'b', 'boss', [1, 5, 10, 25, 50, 100], [5, 5, 10, 15, 25, 40], 'Cita con el CEO', g => veces(g, 'Juega una partida del Modo Jefe.', 'Juega {n} partidas del Modo Jefe.'), 'Siempre tiene un hueco en la agenda para ti.');
    fam('boss', 'b', () => SAVE.bestBoss || 0, [1500, 4000, 6000, 8000, 10000, 12000], [15, 60, 40, 50, 60, 80], 'Golpe al bolsillo', g => `Haz ${fmt(g)} de daño en una partida del Modo Jefe.`, 'Le duele más que perder dinero.', { 4000: 'boss4k' });
    fam('bkill', 'b', 'bosskill', [1, 5, 10, 25, 50], [15, 20, 25, 40, 60], 'Despido del jefe', g => veces(g, 'Derrota a un jefe en el Modo Jefe.', 'Derrota a {n} jefes en el Modo Jefe.'), 'Recursos Humanos está en shock.');
    fam('bkall', 'b', () => WORLDS.filter((w, i) => ['n', 'h', 'm'].some(d => (SAVE.bossPay[i + d] || 0) & 8)).length, [3, 6, 9, 12], [20, 30, 40, 80], 'Cazajefes', g => g === 12 ? 'Derrota a los 12 jefes en el Modo Jefe.' : `Derrota a ${g} jefes distintos en el Modo Jefe.`, 'Los colecciona como cromos.');
    fam('bkmyth', 'b', () => WORLDS.filter((w, i) => (SAVE.bossPay[i + 'm'] || 0) & 8).length, [1, 3, 6, 12], [30, 50, 80, 150], 'Jefe de jefes', g => veces(g, 'Derrota a un jefe en Mítica (Modo Jefe).', 'Derrota a {n} jefes distintos en Mítica (Modo Jefe).'), 'Ni el consejo de administración se lo cree.');
    fam('lead', 'b', 'leader', [10, 50, 100, 250, 500, 1000], [5, 5, 10, 15, 25, 40], 'Líder de verdad', g => `Saca a tu líder ${fmt(g)} veces.`, 'Un jefe que sí baja al campo.');
    fam('wstreak', 'b', () => SAVE.stats.bestStreak || 0, [3, 5, 10, 15, 25], [10, 15, 30, 45, 80], 'En racha', g => `Gana ${g} partidas seguidas.`, 'Microblizz pide revisar la jugada.');
    // -- Facciones
    const FAC_ACH = { animales: ['Manada salvaje', 'La rabia también es una pasiva.'], nomuertos: ['Ejército eterno', 'Ni muertos trabajan ya para Microblizz.'], streamers: ['En directo', '¡Dale a la campanita!'], heroes: ['Leyenda viva', 'Los dioses vuelven a estar de buen humor.'], ciber: ['Alto voltaje', 'Firmware libre, por fin.'], memes: ['Viral', 'Este logro ya es un meme.'], gamer: ['GG', 'GG, Phony. GG.'], olvidados: ['Recordados', 'Por fin alguien se acuerda de ellos.'], pop: ['Taquillazo', 'Y sin remake.'] , creadores: ['Hecho a mano', 'Sin crunch y sin rendirse.'] };
    for (const f of FACTION_ORDER) {
      const F = FACTIONS[f], L = CFG.cards[F.leader].name, [nm, jk] = FAC_ACH[f], n0 = ACHF.length;
      fam('fw_' + f, 'f', 'fwin_' + f, [1, 10, 25, 50, 100, 250, 500], [5, 10, 15, 20, 25, 35, 50], nm, g => veces(g, `Gana una partida con ${F.name}.`, `Gana {n} partidas con ${F.name}.`), jk);
      fam('fl_' + f, 'f', () => facLvl(f), [14, 28, 42, 56, 70], [5, 10, 15, 20, 30], `Plantilla de ${F.name}`, g => g >= 70 ? `Sube las 7 cartas de ${F.name} a nivel 10.` : `Suma ${g} niveles entre las 7 cartas de ${F.name}.`, 'Aquí se asciende por méritos.');
      fam('fp_' + f, 'f', () => Math.round(idlePower(f) * 100), [120, 150, 200, 250, 300], [5, 10, 15, 20, 35], `Poder de ${L}`, g => `Sube el poder de ${L} a ${g} (nivel, habilidad y equipo).`, 'Se nota en las horas extra.');
      fam('fg_' + f, 'f', () => gearN(f), [1, 2, 3, 4], [5, 5, 5, 10], `${L} bien equipado`, g => g === 4 ? `Pon a ${L} una habilidad y sus 3 objetos.` : g === 1 ? `Equipa a ${L} con una habilidad o un objeto.` : `Equipa a ${L} con ${g} cosas (habilidad u objetos).`, 'Bien vestido para la reunión.');
      for (let i = n0; i < ACHF.length; i++) ACHF[i].fac = f;
    }
    fam('unlock', 'f', () => Math.max(SAVE.stats.unlock || 0, SAVE.unlocked.length - 1), [1, 2, 3, 4, 5, 6, 7, 8], [50, 20, 20, 20, 25, 25, 30, 50], 'La rebelión crece', g => g === 1 ? 'Libera una facción en la campaña.' : g === 8 ? 'Libera todas las facciones.' : `Libera ${g} facciones en la campaña.`, 'Se van de Microblizz sin avisar.', { 1: 'unlock1' });
    // -- Cartas: cada una tiene sus logros de jugarla y de subirla de nivel
    for (const f of FACTION_ORDER) for (const k of [FACTIONS[f].leader, ...FACTIONS[f].units]) {
      const nm = CFG.cards[k].name, jk = `Carta de ${FACTIONS[f].name}.`;
      fam('cp_' + k, 'c', 'play_' + k, [1, 10, 50, 100, 250, 500, 1000], [5, 5, 5, 5, 5, 10, 15], `Fan de ${nm}`, g => veces(g, `Juega a ${nm} por primera vez.`, `Juega a ${nm} {n} veces.`), jk);
      fam('cl_' + k, 'c', () => uSave(k).lvl, [2, 3, 5, 7, 10], [5, 5, 5, 5, 10], `Ascenso de ${nm}`, g => `Sube a ${nm} a nivel ${g}.`, g => (g === 10 ? 'Nivel máximo. Ni el CEO llega tan alto.' : jk));
      ACHF[ACHF.length - 1].fac = ACHF[ACHF.length - 2].fac = f;
    }
    for (const f of FACTION_ORDER) for (const k of FACTIONS[f].gacha || []) {   // v0.9.15: cartas del gashapón
      const nm = CFG.cards[k].name, jk = CFG.cards[k].spell ? 'Hechizo del gashapón de cartas.' : 'Mata-sanadores del gashapón de cartas.';
      fam('cp_' + k, 'c', 'play_' + k, [1, 10, 50, 100], [5, 5, 5, 10], `Fan de ${nm}`, g => veces(g, `Juega ${CFG.cards[k].spell ? 'el hechizo ' : 'a '}${nm} por primera vez.`, `Juega ${CFG.cards[k].spell ? 'el hechizo ' : 'a '}${nm} {n} veces.`), jk);
      fam('cl_' + k, 'c', () => uSave(k).lvl, [3, 6, 10], [5, 5, 10], `Ascenso de ${nm}`, g => `Sube ${CFG.cards[k].spell ? 'el hechizo ' : 'a '}${nm} a nivel ${g}.`, jk);
      ACHF[ACHF.length - 1].fac = ACHF[ACHF.length - 2].fac = f;
    }
    fam('lvl', 'c', 'lvlup', [1, 10, 25, 50, 100, 250, 500], [5, 10, 50, 50, 50, 65, 90], 'Subida de sueldo', g => veces(g, 'Sube de nivel una carta.', 'Sube {n} niveles a tus cartas.'), 'A ti sí te suben el sueldo.', { 25: 'lvl25' });
    // -- Campaña: estrellas de cada mundo en cada dificultad, estrellas totales y jefes
    const DIF_ACH = { f: [' (Fácil)', ' en Fácil', [3, 5, 5, 10], [5, 10, 20, 30, 50], 'Hasta un becario lo consigue.'], n: ['', '', [5, 5, 10, 15], [10, 20, 40, 60, 100], 'Cada estrella, un juego salvado.'], h: [' (Difícil)', ' en Difícil', [5, 10, 15, 20], [15, 30, 50, 80, 150], 'Microblizz pide refuerzos.'], x: [' (Heroica)', ' en Heroica', [8, 12, 18, 25], [18, 35, 60, 95, 175], 'La CPU tenía enchufe, y aun así.'], m: [' (Mítica)', ' en Mítica', [10, 15, 20, 30], [20, 40, 70, 110, 200], 'Ni la ruleta de la semana pudo contigo.'] };
    for (const d of ['f', 'n', 'h', 'x', 'm']) {   // v0.9.67: también Fácil (antes no tenía logros de estrellas)
      const [tag, en, gw, gs, jk] = DIF_ACH[d];
      WORLDS.forEach((Wd, wi) => fam(`w${wi + 1}${d}`, 'k', () => worldStars(wi, d), [3, 6, 9, 12], gw, `${Wd.name}${tag}`, g => g === 12 ? `Consigue las 12 estrellas del mundo ${wi + 1}${en}.` : `Consigue ${g} estrellas en el mundo ${wi + 1}${en}.`, jk));
      const tot = WORLDS.length * 12;
      fam('st_' + d, 'k', () => allStars(d), [10, 25, 50, 100, tot], gs, `Coleccionista de estrellas${tag}`, g => g === tot ? `Consigue todas las estrellas de la campaña${en}.` : `Consigue ${g} estrellas en la campaña${en}.`, jk);
    }
    fam('ceo', 'k', 'ceo', [1], [150], 'Compra cancelada', () => 'Gana al CEO de Microblizz.', 'El CEO tendrá que vender su yate.', { 1: 'ceo' });
    fam('olvido', 'k', 'olvido', [1], [80], 'Recuerdos recuperados', () => 'Libera a los Olvidados del sótano de Microblizz.', 'Por fin alguien se acuerda de ellos.', { 1: 'olvido' });
    fam('phony', 'k', 'phonyboss', [1], [150], 'Devolvednos los discos', () => 'Gana al Presidente de Phony.', 'Tu colección de discos está a salvo.', { 1: 'phony' });
    fam('iaboss', 'k', 'iaboss', [1], [200], 'Desconectada', () => 'Apaga a IAhorro (mundo 16).', 'Los juegos vuelven a tener alma.');   // v0.9.23
    fam('hard', 'k', 'hardboss', [1, 5, 12, 25, 50], [80, 50, 70, 90, 130], 'Esto ya es otra cosa', g => veces(g, 'Gana a un jefe en Difícil.', 'Gana a {n} jefes en Difícil.'), 'Microblizz pide refuerzos.', { 1: 'hard1' });
    fam('hero', 'k', 'heroboss', [1, 5, 12, 25, 50], [110, 65, 85, 110, 165], 'Heroicidades', g => veces(g, 'Gana a un jefe en Heroica.', 'Gana a {n} jefes en Heroica.'), 'Microblizz le dio ventaja a la CPU y ni con esas.');
    fam('myth', 'k', 'mythboss', [1, 5, 12, 25, 50], [150, 80, 100, 130, 200], 'Leyenda mítica', g => veces(g, 'Gana a un jefe en Mítica.', 'Gana a {n} jefes en Mítica.'), 'Ni la ruleta de Microblizz ha podido contigo.', { 1: 'myth1' });
    fam('rl', 'k', 'rlspin', [1, 5, 10, 25], [5, 10, 15, 25], 'La ruleta de la semana', g => veces(g, 'Gira la ruleta de la semana.', 'Gira {n} veces la ruleta de la semana.'), 'La casa siempre gana. O casi.');
    // -- Enemigos: cada bot de las empresas, cada facción corrompida y los líderes rivales
    const ENEMY_ACH = { becario: ['Sin becarios', 'Becarios', 'Trabajan gratis… y se nota.'], starbot: ['Estrellas fugaces', 'StarBots', 'Su valoración media: una estrella.'], fallen: ['Héroes caídos', 'FallenHeroes', 'Antes era tu héroe favorito.'], cajabotin: ['Cajas abiertas', 'CajaBotines', 'Dentro solo había otra caja.'], soportebot: ['Incidencia cerrada', 'SoporteBots', 'Su respuesta: «reinicia el juego».'], parchebot: ['Parcheado', 'Parches Día 1', 'Pesa 80 GB y no arregla nada.'],
      descargabot: ['Descarga cancelada', 'Descarga99', 'Se quedó en el 99 %.'], licenciabot: ['Licencia revocada', 'LicenciaBots', 'Ahora el juego es tuyo. De verdad.'], plusbot: ['Suscripción cancelada', 'PayPlus', 'Sin permanencia.'], cobradlc: ['DLC gratis', 'CobraDLC', 'El final del juego ya no se vende aparte.'], servidorbot: ['Servidor reiniciado', 'Servidores Caídos', 'Ha vuelto a caer. Por tu culpa.'], remasterbot: ['Mejor el original', 'Remasters 70 €', 'El de 2005 se veía mejor.'] };
    for (const k in ENEMY_ACH) { const [nm, pl, jk] = ENEMY_ACH[k]; fam('ek_' + k, 'e', 'ek_' + k, [10, 50, 100, 250, 500, 1000, 2500], [5, 5, 10, 10, 15, 25, 35], nm, g => `Derrota a ${fmt(g)} ${pl}.`, jk); }
    const CORR_ACH = { gamer: 'Gamers corrompidos', pop: 'personajes de Cultura Pop corrompidos' };
    for (const f of FACTION_ORDER) if (WORLDS.some(w => w.efac === f)) fam('ef_' + f, 'e', 'ekf_' + f, [25, 100, 250, 500, 1000], [5, 10, 15, 20, 30], `Rescate: ${FACTIONS[f].name}`, g => `Derrota a ${fmt(g)} ${CORR_ACH[f] || FACTIONS[f].name + ' corrompidos'}.`, 'No es nada personal: es para liberarlos.');
    fam('ef_microblizz', 'e', 'ekf_microblizz', [100, 500, 1000, 2500, 5000, 10000], [5, 10, 15, 25, 35, 50], 'Contra Microblizz', g => `Derrota a ${fmt(g)} enemigos de Microblizz.`, 'Despidos, pero al revés.');
    fam('ef_iahorro', 'e', 'ekf_iahorro', [100, 500, 1000, 2500, 5000], [5, 10, 15, 25, 40], 'Contra IAhorro', g => `Derrota a ${fmt(g)} bots de IAhorro.`, 'Ningún prompt sobrevive.');   // v0.9.23
    fam('ef_phony', 'e', 'ekf_phony', [100, 500, 1000, 2500, 5000, 10000], [5, 10, 15, 25, 35, 50], 'Contra Phony', g => `Derrota a ${fmt(g)} enemigos de Phony.`, 'Suscripción cancelada.');
    fam('elead', 'e', 'eleader', [1, 10, 25, 50, 100, 250], [5, 10, 15, 25, 40, 60], 'Cazalíderes', g => veces(g, 'Derrota a un líder enemigo.', 'Derrota a {n} líderes enemigos.'), 'Sin jefe, el equipo se toma el día libre.');
    // -- Gashapón y tesoro
    fam('pull', 'g', 'pull', [1, 10, 50, 100, 250, 500, 1000, 2500, 5000], [5, 5, 10, 50, 30, 35, 50, 70, 100], 'Adicto a las cápsulas', g => veces(g, 'Gira el gashapón por primera vez.', 'Gira {n} veces el gashapón.'), 'Microblizz te manda una postal.', { 100: 'pull100' });
    fam('x10', 'g', 'x10', [1, 10, 25, 50, 100], [10, 15, 25, 40, 60], 'De diez en diez', g => veces(g, 'Haz una tirada x10.', 'Haz {n} tiradas x10.'), 'Diez veces más ilusión.');
    fam('x50', 'g', 'x50', [1, 5, 10, 25, 50], [30, 40, 50, 70, 100], 'Modo ballena', g => veces(g, 'Haz una tirada x50.', 'Haz {n} tiradas x50.'), 'El CEO le ha puesto tu nombre a su yate.', { 1: 'x50' });
    fam('leg', 'g', 'leg', [1, 5, 10, 25, 50, 100], [10, 15, 25, 40, 60, 90], 'Suerte legendaria', g => veces(g, 'Consigue una legendaria en el gashapón.', 'Consigue {n} legendarias en el gashapón.'), 'Salen 3 de cada 100. Dicen.');
    fam('epic', 'g', 'epic', [1, 10, 25, 50, 100, 250], [5, 10, 15, 25, 35, 55], 'Épico', g => veces(g, 'Consigue una épica en el gashapón.', 'Consigue {n} épicas en el gashapón.'), 'Épico de verdad, no como el último parche.');
    fam('perfect', 'g', 'perfect', [1, 3, 5, 10, 25], [100, 40, 50, 70, 100], 'Perfeccionista', g => veces(g, 'Consigue una copia de calidad CEO (perfecta).', 'Consigue {n} copias de calidad CEO (perfecta).'), 'Sale una vez de cada cien.', { 1: 'perfect' });
    fam('scrap', 'g', 'scrap', [10, 50, 100, 250, 500, 1000, 2500], [5, 40, 25, 35, 45, 60, 90], 'Despido masivo', g => `Despide ${fmt(g)} copias en el inventario.`, 'Como Microblizz, pero con cosas.', { 50: 'scrap50' });
    fam('reroll', 'g', 'reroll', [1, 5, 25, 50, 100, 250], [5, 30, 25, 35, 50, 70], 'Segunda oportunidad', g => veces(g, 'Vuelve a tirar los números de una copia.', 'Vuelve a tirar los números de una copia {n} veces.'), 'Más oportunidades de las que da Microblizz.', { 5: 'reroll5' });
    const N_AB = Object.keys(ABILITIES).length, N_EQ = Object.keys(ITEMS).length;
    fam('ownab', 'g', () => ownCount('ab'), [5, 10, 15, 20, N_AB], [10, 20, 30, 45, 80], 'Coleccionista de habilidades', g => g === N_AB ? 'Consigue todas las habilidades.' : `Consigue ${g} habilidades distintas.`, 'Hazte con todas. Sin gastar. Bueno, casi.');
    fam('owneq', 'g', () => ownCount('eq'), [5, 10, 15, 20, N_EQ], [10, 20, 30, 45, 80], 'Coleccionista de objetos', g => g === N_EQ ? 'Consigue todos los objetos.' : `Consigue ${g} objetos distintos.`, 'Tu armario es más grande que la sede de Microblizz.');
    fam('owncd', 'g', () => Object.keys(SAVE.cards || {}).length, [1, 5, 10, 20, 36], [10, 15, 25, 40, 70], 'Coleccionista de cartas', g => g === 36 ? 'Consigue las 36 cartas del gashapón de cartas.' : veces(g, 'Consigue una carta del gashapón de cartas.', 'Consigue {n} cartas del gashapón de cartas.'), 'Hechizos, mata-sanadores y cero remordimientos.');
    fam('stars', 'g', () => Object.values(SAVE.cards || {}).reduce((a, c) => a + (c.st || 0), 0), [5, 25, 50, 100, 180], [10, 15, 25, 40, 70], 'Lluvia de estrellas', g => `Suma ${g} estrellas en tus cartas del gashapón.`, 'Cinco estrellas, como las reseñas compradas.');
    fam('goldb', 'g', () => SAVE.gold, [1000, 5000, 10000, 25000, 50000, 100000, 250000], [5, 10, 15, 20, 30, 45, 70], 'Hucha de oro', g => `Ten ${fmt(g)} de oro a la vez.`, 'El CEO quiere saber tu secreto.');
    fam('gemb', 'g', () => SAVE.gems, [500, 1000, 2500, 5000], [10, 15, 30, 50], 'Hucha de ballena', g => `Ten ${fmt(g)} gemas a la vez.`, g => (g === 2500 ? 'Justo lo que cuesta una tirada x50.' : 'Ahorrar también es un arte.'));
    // -- Constancia
    fam('days', 'd', 'days', [1, 3, 7, 14, 30, 60, 100, 150, 200, 365], [5, 10, 15, 20, 30, 40, 50, 60, 70, 100], 'Fichaje diario', g => veces(g, 'Juega un día.', 'Juega {n} días distintos.'), 'Más constante que los servidores de Phony.');
    fam('lstreak', 'd', () => (SAVE.login && SAVE.login.best) || 0, [3, 7], [15, 50], 'Fan de verdad', g => `Entra ${g} días seguidos.`, 'Microblizz no consigue echarte.', { 7: 'streak7' });
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
      ['comeback', 'comeback', 1, 50, 'Remontada épica', 'Gana una partida después de perder dos torres.', 'El CEO ya había abierto el champán.', 'Pista: nunca te rindas, aunque vayas perdiendo.'],
      ['onlylead', 'onlylead', 1, 40, 'Hombre orquesta', 'Gana una partida jugando solo a tu líder.', 'El resto del equipo estaba de vacaciones.', 'Pista: ¿quién necesita equipo?'],
      ['strike', 'strike', 1, 20, 'Huelga general', 'Termina una partida sin jugar ninguna carta.', 'Ni un becario trabajaría tan poco.', 'Pista: a veces lo mejor es no hacer nada.'],
      ['cheap', 'cheapwin', 1, 50, 'Bajo coste', 'Gana una partida gastando 30 de CAOS o menos.', 'Más rentable que Microblizz.', 'Pista: ganar sin gastar.'],
      ['spend', 'bigspend', 1, 30, 'Derroche', 'Gasta 100 de CAOS en una sola partida.', 'Microblizz quiere ficharte para finanzas.', 'Pista: el CAOS está para gastarlo.'],
      ['massacre', 'massacre', 1, 40, 'Despidos al revés', 'Derrota a 60 enemigos en una sola partida.', 'Recursos humanos no da abasto.', 'Pista: muchísimos enemigos en una sola partida.'],
      ['close', 'closecall', 1, 40, 'Por los pelos', 'Gana con tu base por debajo del 15 % de vida.', 'Ni el VAR lo tenía claro.', 'Pista: ganar cuando todo parecía perdido.'],
      ['fast', 'fastwin', 1, 50, 'Speedrun', 'Tira la base enemiga en menos de 100 segundos.', 'Más rápido que un despido.', 'Pista: el reloj es tu enemigo.'],
      ['time', 'hpwin', 1, 30, 'Hasta el último segundo', 'Gana por vida cuando se acaba el tiempo.', 'Se decidió en la foto finish.', 'Pista: se acaba el tiempo y vais empatados.'],
      ['tut', () => (SAVE.tut && SAVE.tut.done ? 1 : 0), 1, 20, 'Ya me lo sé', 'Termina la partida guiada.', 'Bienvenido a la rebelión.', 'Pista: lo primero es lo primero.'],
      ['howto', 'howto', 1, 20, 'Leer las instrucciones', 'Abre «Cómo se juega».', 'Nadie lo hace. Tú sí.', 'Pista: está en el menú principal.'],
      ['speed', 'speed2', 1, 20, 'Con prisa', 'Pon la partida a velocidad x2.', 'El tiempo es oro. Y el oro, de Microblizz.', 'Pista: hay un botón para ir más rápido.'],
      ['share', 'share', 1, 30, 'Fama mundial', 'Comparte el resultado de una partida.', 'Microblizz ha visto tu publicación.', 'Pista: presume de tus victorias.'],
      ['export', 'export', 1, 20, 'Copia de seguridad', 'Exporta tu progreso en Opciones.', 'Que no te lo cierren.', 'Pista: mira en Opciones.'],
      ['scrapp', 'scrapperf', 1, 60, 'Esto no se tira', 'Despide una copia de calidad CEO (perfecta).', '¿Seguro que no la querías?', 'Pista: despedir algo que no deberías.'],
      ['broke', 'broke', 1, 30, 'Sin blanca', 'Quédate con 0 gemas después de girar el gashapón.', 'Microblizz te quiere mucho.', 'Pista: gástalo todo.'],
      ['starter', () => (SAVE.starter ? 1 : 0), 1, 20, 'Cliente fiel', 'Consigue el pack de bienvenida de la tienda.', 'Gratis en esta versión. Shh.', 'Pista: algo de la tienda.'],
      ['prem', () => (SAVE.pass && SAVE.pass.prem ? 1 : 0), 1, 30, 'VIP', 'Activa el pase premium.', 'Gratis en esta versión. Que no se entere el CEO.', 'Pista: el pase tiene dos caminos.'],
      ['full', 'idlefull', 1, 30, 'Almacén lleno', 'Recoge las HORAS EXTRA con el almacén lleno (12 h).', 'Tu líder ya estaba durmiendo.', 'Pista: deja trabajar a tu líder mucho, mucho tiempo.'],
      ['swap', 'idleswap', 1, 20, 'Cambio de turno', 'Cambia de líder en las HORAS EXTRA.', 'Turno de día, turno de noche.', 'Pista: cualquiera puede hacer horas extra.'],
      ['mute', 'mute', 1, 20, 'Silencio, se juega', 'Quita el sonido.', 'Así no oyes al CEO.', 'Pista: ssshhh.'],
      ['lose', 'lose', 10, 30, 'Aprender a perder', 'Pierde 10 partidas.', 'Microblizz lo celebra con otro yate.', 'Pista: de los errores se aprende.'],
      ['easy', 'easywin', 10, 20, 'Becario eterno', 'Gana 10 partidas rápidas contra el Becario.', 'Por algo se empieza.', 'Pista: el rival más fácil.'],
      ['pause', 'pause', 10, 20, 'Pausa para el café', 'Pausa la partida 10 veces.', 'Un derecho básico. Menos en Microblizz.', 'Pista: tómate un respiro.'],
      ['news', 'news', 1, 20, 'Al día', 'Lee las novedades del juego.', 'Las notas de Microblizz son de broma. ¿O no?', 'Pista: el juego cambia; entérate.'],
    ];
    for (const [id, src, goal, gm, nm, txt, jk, hint] of SECRETS) fam('s_' + id, 's', src, [goal], [gm], nm, () => txt, jk, null, hint);
  },
});
