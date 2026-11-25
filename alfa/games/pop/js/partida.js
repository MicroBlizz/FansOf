// Fans of Pop · PARTIDA: el camino por los MUNDOS (js/niveles.js), nivel a nivel, y el MODO DIFÍCIL de cada mundo ya ganado.
// Los amigos (slimes) y lo que hacen (saltos al tablero, combos, premios), las estrellas de cada nivel, el paso de un mundo al
// siguiente y el guardado del camino para seguir otro día. Los corazones, las monedas y los cofres están en js/monedero.js.
// Se puede repetir cualquier nivel ya pasado para sacar más estrellas (los amigos solo se rescatan la primera vez).
// Las pantallas (pantallas.js) y el dibujo (pintar.js) leen de PP_P.
'use strict';
let PP_P = null;
function ppNuevaRuta() {
  PP_P = { v: 2, equipo: [], carga: {}, estrellas: 0, est: [], nivel: 0, pendientes: [], dif: {}, estD: {}, pes: {}, estP: {}, salas: 0, T: null, tipo: null, rescatados: [], fin: null };
  SAVE.partidas++; ppGuardaCamino();
}
// el camino se guarda entero (sin el tablero abierto) cada vez que cambia: al volver, se sigue en el mismo nivel
function ppGuardaCamino() {
  if (!PP_P) return;
  const { T, ...resto } = PP_P;
  SAVE.run = PP_P.fin ? null : JSON.parse(JSON.stringify(resto));
  ppGuarda();
}
// los caminos de antes de los mundos (sin v: 2) no valen: se empieza de nuevo
function ppSigueCamino() { if (!SAVE.run || SAVE.run.v !== 2) return false; PP_P = Object.assign({ T: null, dif: {}, estD: {}, pes: {}, estP: {}, pendientes: [] }, JSON.parse(JSON.stringify(SAVE.run))); return true; }
// --- el jefe PENDIENTE (tarea #95, js/saltar-jefe.js): PP_P.pendientes = mundos cuyo jefe se saltó pagando perlas; el camino ya va por delante ---
const ppPendiente = m => PP_SALTO.esPendiente(PP_P.pendientes, m);
// --- el modo difícil: un mundo se abre en difícil al ganar a su jefe; PP_P.dif[m] = niveles difíciles pasados de ese mundo ---
const ppDifAbierto = m => PP_SALTO.difAbierto(PP_P.nivel, ppInicioMundo(m) + PP_MUNDOS[m].niveles, ppPendiente(m));
// en qué nivel (dentro del mundo, desde 0) va el camino de ese mundo y modo; PP_MUNDOS[m].niveles = todo pasado (con el jefe pendiente, el jefe)
const ppVaPor = (m, dif) => (dif === 2 ? (PP_P.pes || {})[m] || 0 : dif ? PP_P.dif[m] || 0 : PP_SALTO.vaPor(PP_P.nivel, ppInicioMundo(m), PP_MUNDOS[m].niveles, ppPendiente(m)));
// la PESADILLA de un mundo se abre al ganar su difícil entero (js/niveles.js, ppNivelPesadilla)
const ppPesAbierta = m => (PP_P.dif[m] || 0) >= PP_MUNDOS[m].niveles;
const ppEstDe = dif => (dif === 2 ? (PP_P.estP = PP_P.estP || {}) : dif ? PP_P.estD : PP_P.est);   // el récord de estrellas de ese modo
// el mundo en el que está el camino ahora
const ppMundoActual = () => ppMundoDe(Math.min(PP_P.nivel, PP_TOTAL_NIVELES - 1))[0];
// el equipo que ayuda en el nivel `d`: con el flag `companeros` cerrado, el del camino en todos los niveles (como siempre; cada
// habilidad mira luego si actúa en pesadilla o en duelos); abierto, el de su modo (js/coleccion-juego.js, tarea #142)
const ppEquipoNivel = d => (ppCompanerosActivo() ? ppEquipoDe(ppModoDeNivel(d)) : PP_P ? PP_P.equipo : []);
// lo del equipo que cuenta al crear el tablero del nivel `d` (`equipo`: los del camino, que no salen atrapados)
function ppFx(d) {
  const fx = { pista: 0, equipo: PP_P ? PP_P.equipo : [] };
  for (const id of ppEquipoNivel(d)) if (ppFxDe(id).pista) fx.pista += ppFxDe(id).pista;
  if (ppCompanerosActivo()) {   // atrapados: los de rescate que aún no tienes (tarea #142); en el hueco de copia, uno que ya tienes (PP_RESCATES)
    fx.atrapables = PP_COLE.atrapables(ppCole());
    fx.copia = PP_COLE.deCofre(ppCole(), ppAzar(7919 + d.g)) || null;
  }
  return fx;
}
// ¿está en el equipo que ayuda en el nivel que se juega ahora?
const ppEnEquipo = id => !!PP_P && ppEquipoNivel(PP_P.T && PP_P.T.d).includes(id);
// entrar en un nivel (`g` global; sin nada, el siguiente del camino normal). Sin corazones no se entra.
function ppEntra(g = PP_P.nivel, dif = false) {
  if (g >= PP_TOTAL_NIVELES) return;
  if (ppVidas() <= 0) { ppVentanaSinCorazones(); return; }
  const base = ppNivel(g, dif), primera = !dif && g === PP_P.nivel;
  const d = primera || !base.amigos ? base : Object.assign({}, base, { amigos: 0 });   // repitiendo, ya no hay amigos atrapados
  ppEntraEn(d, ppTituloNivel(d, g, dif));
}
// entra en el tablero del nivel `d` (el de un nivel del camino o el del duelo por un compañero escondido, js/escondidos-duelo.js)
function ppEntraEn(d, titulo) {
  const dif = d.dif;
  ppCortCancela();
  PP_P.tipo = d.jefe ? 'jefe' : 'sala';
  // en PESADILLA los amigos descansan (Daniel, 31-10-2026: «con los ayudantes es muy fácil»): ni pista de Lola, ni saltos, ni toques extra
  const T = PP_P.T = ppNuevoTablero(d, d.lo ? { pista: 0, equipo: PP_P.equipo } : ppFx(d));
  T.titulo = titulo;
  ppEscEntra(T, d);   // flag `companeros`: a veces una burbuja brilla y trae un compañero escondido (js/escondidos-juego.js)
  if (d.nim) ppNimEmpieza(T);   // nivel difícil o jefe: duelo por turnos contra el rival del mundo (js/nimnivel.js)
  else ppMargenAlEmpezar(T, d);
  ppHabEntraNivel(T, d);   // lo que hacen al empezar los compañeros de Niveles y de Pesadilla (flag `companeros`, js/habilidades-*.js)
  PP_AYUDA.modo = null;
  const manita = !dif && !d.nim && d.mundo === 0 && d.l <= 2;   // en los dos primeros niveles la manita señala qué tocar
  if (manita) { T.mano = true; T.pista = [...T.sol][0]; }
  ppCortinillaSi(T, d, dif, manita);   // antes de pintar la sala: así ni Lola ni las ayudas se adelantan a la cortinilla
  ppIrA('sala');
  ppFxEntraSala(T);
  ppBarraAyudas();
  if (d.lo && ppHabDescansan()) ppFlota(tr('En Pesadilla tus amigos descansan'), 270, 240, '#ff8a8a');
  if (T.extra) ppFlota(tr('+{n} toques extra', { n: T.extra }), 270, 240, '#ff8a2a');
  if (!PP_CORTINILLA.salePara(d)) ppEmpiezaNivel(T, d, dif, manita);
}
const ppTituloNivel = (d, g, dif) => (d.jefe ? tr('¡Nivel jefe!') : tr('Nivel {n}', { n: g + 1 })) + (dif === 2 ? ' · ' + tr('Pesadilla') : dif ? ' · ' + tr('Difícil') : '');
// la racha de victorias y Nubecita dan toques de margen al empezar un nivel de pop-it (js/pase.js, PP_SLIMES); en pesadilla, no
// la racha, nunca por encima del tope de hoy (una partida vieja puede guardar 3 de cuando el tope era 3: tarea #353)
const ppRachaToques = () => Math.min(SAVE.racha || 0, PP_CFG.racha.max);
function ppMargenAlEmpezar(T, d) {
  const extra = ppRachaToques() + (ppEnEquipo('nubecita') ? ppFxDe('nubecita').extra : 0);
  if (extra && !d.tutorial && !d.lo) { T.limite += extra; T.extra = extra; }
}
// un nivel con duelo abre con su cortinilla (ADR 098): el nivel espera a que se pulse su botón ¡A JUGAR! (ADR 100)
function ppCortinillaSi(T, d, dif, manita) {
  if (PP_CORTINILLA.salePara(d)) ppCortEmpieza(d, () => ppEmpiezaNivel(T, d, dif, manita));
}
// lo que pasa al empezar de verdad un nivel (tras la cortinilla del jefe, si la hay)
function ppEmpiezaNivel(T, d, dif, manita) {
  if (!PP_P || PP_P.T !== T) return;   // saliste del nivel durante la cortinilla
  ppBarraAyudas();   // las ayudas esperaban a que se quitara la cortinilla
  ppAntesDeEmpezar(T);   // tras fallar este nivel, se ofrece +3 toques (js/potenciadores.js)
  if (T.pista !== null && !manita) { ppFxHabilidad('lola'); PP_ATAQUE_FX.luce('lola'); }   // luce: su ataque, solo se ve (js/ataques-fx.js)
  ppTutorialesCamino(d, dif);
  ppTutorialesNivel(d);
  if (T.nim && T.nim.turno === 'espera') ppHabNimPrevia(T);   // Pellizco y Saque de los compañeros de duelo (js/habilidades-duelo.js)
  if (!PP_LOLA.actual && PP_LOLA.cola.length) ppLolaSiguiente();   // lo que esperó a la cortinilla
  ppLolaMomento();   // si no ha dicho nada, uno de los consejos que esperaban (js/lola.js)
}
// lo que explica Lola: el principio de cada mundo, los primeros niveles, el primer difícil y la primera pesadilla
function ppTutorialesCamino(d, dif) {
  if (!dif && d.mundo === 0 && d.l <= 3) ppTutorial('w1n' + d.l);
  if (!dif && d.mundo > 0 && d.l === 1) ppTutorial('w' + (d.mundo + 1) + 'n1');
  if (dif === 2) ppTutorial('modoPesadilla'); else if (dif) ppTutorial('modoDificil');
  if (dif === 2 && ppHabDescansan()) ppTutorial('despedidos');
}
// y según el nivel: el primer duelo, el primer jefe, el equipo y las monedas
function ppTutorialesNivel(d) {
  if (d.nim) ppTutorial('nimNivel'); if (d.nim) ppTutorial('trucoNim');
  else if (d.dificil) ppTutorial('dificil');
  if (d.jefe) ppTutorial('jefe');
  if (PP_P.equipo.length) ppTutorial('amigo');
  ppExplicaTutorial(d);   // flag `companeros`: tocar el equipo explica lo que hace (js/equipo-explica.js)
  if (SAVE.monedas > 0) ppTutorial('monedas');
}
// un toque del jugador en la burbuja i del nivel abierto
function ppToque(i) {
  const T = PP_P.T; if (!T || T.hecho || T.parado) return;
  T.tocado = true;   // desde aquí Lola no habla hasta que acabe el nivel (js/lola.js)
  if (T.nim) { ppNimToque(i); return; }
  if (ppEscAntesDeToque(T, i)) return;   // la burbuja arcoíris de un compañero nuevo: se abre la ventana de su duelo (js/escondidos-juego.js)
  if (ppHabAntesDeToque(T, i)) return;   // Volteo de Pesadilla y la foto para Marcha atrás (js/habilidades-pesadilla.js)
  if (PP_AYUDA.modo) { ppAplicaAyuda(i); return; }   // martillo o bomba
  const r = ppToca(T, i); if (!r) return;
  ppMarcaDentro(true);   // desde el primer toque, salir a medias cuesta un corazón
  ppLolaToque();
  ppFxToque(T, i, r);
  ppManitaSigue(T);
  if (r.libre) ppFlota(tr('¡Gratis!'), 270, 240, '#3a8ee6');
  const bueno = r.golpes >= 3;   // un toque que revienta (o resquebraja) 3 o más
  if (T.combo >= 2 && bueno) { ppFxCombo(T.combo); if (!SAVE.tuto.combo) ppTutorial('combo'); }
  ppTrasToque(T, i, r);
  if (T.hecho) return;
  if (T.combo > 0 && bueno && !T.lo) ppCombosEquipo(T);
  ppPremioGordo(T, r);   // antes de mirar si te has quedado sin toques: un +1 te puede salvar
  ppHabTrasToque(T);   // Buen comienzo y las marcas de más de Lola y la Linterna (js/habilidades-niveles.js)
  ppMiraSinToques(T);
}
// sin toques: ya no se puede tocar, pero se espera a los amigos que estén saltando (pueden acabarlo ellos); luego se ofrece
// seguir (anuncio o perlas, js/tienda.js) o rendirse y perder el corazón. Antes, Al rescate da sus toques (una vez por nivel)
function ppMiraSinToques(T) {
  if (T.toques < T.limite || T.gratis !== 0 || ppHabRescata(T)) return;
  T.parado = true; setTimeout(() => { if (PP_P && PP_P.T === T && !T.hecho) ppSinToquesOSeguir(T); }, 800);
}
// la manita de los primeros niveles pasa a la siguiente de la solución
function ppManitaSigue(T) { if (T.mano) { const s = [...T.sol]; T.pista = s.length ? s[0] : null; } }
// los combos: Horas extra (el siguiente toque gratis) y el Chivatazo de Lola (una de la solución)
function ppCombosEquipo(T) {
  const becario = ppFxDe('becario'), lola = ppFxDe('lola');
  if (ppEnEquipo('becario') && T.combo % becario.combo === 0) { T.gratis += becario.gratis; ppFxHabilidad('becario'); PP_ATAQUE_FX.luce('becario'); ppFlota(tr('Siguiente toque gratis'), 270, 275, '#3a8ee6'); play('ppPista'); }
  if (ppEnEquipo('lola') && T.combo % lola.combo === 0 && T.pista === null) { ppPista(T); if (T.pista !== null) { PP_FX.pista = 0.6; ppFxHabilidad('lola'); PP_ATAQUE_FX.luce('lola'); play('ppPista'); } }
}
// el premio gordo de la Caja de botín: un toque de 4 da +1 toque; uno de 5, +1 corazón (si falta alguno y hoy no ha dado ya 3: tarea #236)
// (con estrellas, el corazón desde 4 pops y uno más al día: js/coleccion.js, tarea #294)
function ppPremioGordo(T, r) {
  const fx = ppFxDe('cofre'), da = PP_HAB.premio(r.pops.length, PP_CFG.cofrePops, fx.premioAntes);
  if (!ppEnEquipo('cofre') || !da || T.lo) return;
  ppFxHabilidad('cofre'); play('ppPremio');
  const vida = da === 'vida' && ppCofreDaVida(PP_HAB.extra(fx.premio));
  PP_ATAQUE_FX.luce('cofre', vida ? 'corazones' : 'toques');   // solo se ve: a los corazones o a los toques (js/ataques-fx.js)
  if (vida) { SAVE.cofreHoy++; ppSumaVida(1); ppFxCura(1); ppFlota(tr('¡PREMIO DOBLE!'), 270, 275, '#ff8a2a'); }
  else { T.limite++; ppFlota(ppTextoMasToque(PP_SLIMES.cofre.nombre), 270, 275, '#ff8a2a'); }   // con su motivo (tarea #182)
}
// lo que pasa después de cualquier toque (del jugador o de un amigo): castigos, cargar a los que saltan y acabar el nivel
function ppTrasToque(T, i, r) {
  ppEscTrasToque(T, r);   // flag `companeros`: la primera acción decide qué pasa con la burbuja arcoíris (js/escondidos-juego.js)
  if (r.castigo) {
    for (let k = 0; k < r.castigo; k++) ppPierdeVida();
    play('ppDano'); ppVibra([30, 40, 30]); ppFxDano();
    if (SAVE.vidas <= 0) { T.hecho = true; ppMarcaDentro(false); setTimeout(() => ppSinCorazones(), 500); return; }
  }
  if (r.hecho) { PP_P.salas++; ppMarcaDentro(false); ppFxConfeti(T); setTimeout(() => { if (PP_P && PP_P.T === T) ppFiestaToques(T, ppSalaHecha); }, 520); return; }   // la fiesta de toques sobrantes, antes de la victoria (js/victoria-fiesta.js)
  // los que saltan se cargan con cada burbuja reventada (también las que revientan otros amigos: hay reacciones en cadena)
  if (T.lo) return;   // en pesadilla los amigos no saltan
  ppEquipoNivel(T.d).forEach((id, k) => {
    const fx = ppFxDe(id); if (!fx.salta) return;
    PP_P.carga[id] = (PP_P.carga[id] || 0) + r.pops.length;
    if (PP_P.carga[id] >= fx.salta) { PP_P.carga[id] -= fx.salta; ppSaltaSlime(id, k, fx.golpes); }
  });
}
// un amigo salta desde su hueco del equipo y revienta gratis burbujas de la solución
function ppSaltaSlime(id, k, golpes) {
  const T = PP_P.T, pref = ppFxDe(id).prefiere;
  // Copito y Medusita van antes a las de hielo o a las conchas que sigan arriba; los demás, a burbujas de la solución
  const suyas = pref && T.esp ? [...T.up.keys()].filter(i => T.up[i] && T.esp[i] === pref) : [];
  const objetivos = (suyas.length ? suyas : [...T.sol]).sort(() => Math.random() - 0.5).slice(0, golpes);
  if (!objetivos.length) return;
  ppFxHabilidad(id); PP_ATAQUE_FX.suena(id);   // el sonido de su ataque (js/ataques-fx.js; con el flag cerrado, ppSalto)
  objetivos.forEach((i, g) => {
    const dur = 0.5 + g * 0.18;
    ppFxVuelo(id, k, i, T.n, dur);
    setTimeout(() => {
      if (!PP_P || PP_P.T !== T || T.hecho) return;
      let j = i; if (!T.up[j] || (!suyas.includes(j) && !T.sol.has(j))) { const s = [...T.sol]; if (!s.length) return; j = s[0]; }   // si ya no hace falta esa, otra de la solución
      const r = ppToca(T, j, true); if (!r) return;
      ppFxToque(T, j, r); PP_ATAQUE_FX.golpe(T, j, id);
      ppManitaSigue(T);
      ppTrasToque(T, j, r);
    }, dur * 1000);
  });
}
// el camino solo avanza si era el siguiente nivel (repitiendo uno ya pasado, no). `saltado`: era un jefe pendiente, que se saltó con
// perlas (tarea #95, js/saltar-jefe-juego.js): cuenta como nuevo, pero el camino ya iba por delante
function ppAvanzaCamino(d, g) {
  if (d.dif === 2) { PP_P.pes = PP_P.pes || {}; if (d.l - 1 !== (PP_P.pes[d.mundo] || 0)) return { nuevo: false }; PP_P.pes[d.mundo] = d.l; return { nuevo: true }; }
  if (d.dif) { if (d.l - 1 !== (PP_P.dif[d.mundo] || 0)) return { nuevo: false }; PP_P.dif[d.mundo] = d.l; return { nuevo: true }; }
  if (g === PP_P.nivel) { PP_P.nivel++; return { nuevo: true }; }
  if (d.jefe && ppGanaPendiente(d.mundo)) return { nuevo: true, saltado: true };
  return { nuevo: false };
}
function ppSalaHecha() {
  const T = PP_P.T, d = T.d, g = d.g; play('ppSala');
  T.estrellas = ppEstrellas(T);
  const est = ppEstDe(d.dif), antes = est[g] || 0;
  est[g] = Math.max(antes, T.estrellas); PP_P.estrellas += Math.max(0, T.estrellas - antes);
  T.premio = ppPremioNivel(ppPrefijo(d.dif) + g, T.estrellas, d.jefe, d.dif === 2 ? 3 : d.dif ? 2 : 1);   // difícil, el doble; pesadilla, el triple
  ppFiestaAlPremio(T);   // las monedas de los toques sobrantes (js/victoria-fiesta.js)
  ppHabAlGanar(T);   // Limpieza y Hucha: monedas de más (js/habilidades-niveles.js)
  T.intento = ((SAVE.fallos || {})[ppClaveNivel(d)] || 0) + 1;   // para la pantalla de victoria (js/pantalla-victoria.js)
  ppBorraFallos(d); ppBarraAyudas(); setTimeout(ppSubeMarcas, 1500);   // estrellas al ranking mundial (js/ranking.js)
  const presos = Object.values(T.slimes);
  const { nuevo, saltado } = ppAvanzaCamino(d, g);
  ppGuardaCamino();
  ppPrimerosAlGanar();   // con el flag cerrado, la partida nueva pasa a vieja (js/primeros-pasos-juego.js)
  T.feria = ppFeriaGana(T.estrellas, d.jefe, ppHabTickets(T));   // tickets de la Feria del finde: toda victoria, nueva o repetida (js/feria-pantalla.js); el Feriante, uno más
  T.pase = ppPaseGana(nuevo, T.estrellas, T.feria ? T.feria.n : 0);   // flag 'pase-nuevo': puntos por toda victoria y sus tickets (js/pase-nuevo.js)
  T.antes = { racha: SAVE.racha || 0, hucha: SAVE.hucha || 0, nuevo };   // la pantalla de victoria enseña lo que suman la racha y la hucha
  if (nuevo) ppPremiosCandy(d, T.estrellas);   // racha, hucha y puntos del pase (js/pase.js y js/ofertas.js)
  ppViasAlGanar(T, nuevo, presos);   // flag `companeros`: rescate, cofre, jefe y duelos dan compañeros (js/companeros-vias.js)
  if (nuevo && d.jefe && d.dif) { play('ppVictoria'); ppVentanaMundoNuevo(d.dif); return; }
  if (nuevo && d.jefe) { play('ppVictoria'); ppVentanaMundoNuevo(false, saltado); return; }
  if (!presos.length) { ppVentanaSalaHecha(); return; }
  play('ppRescate');
  if (T.rescates) ppVentanaRescateCole(T.rescates); else ppVentanaRescate(presos);   // con el flag, ya están en la colección
}
// un amigo se une al equipo (si está lleno, `fuera` es el que se va)
function ppRecluta(id, fuera) {
  if (fuera) { PP_P.equipo = PP_P.equipo.filter(k => k !== fuera); delete PP_P.carga[fuera]; }
  if (PP_P.equipo.length >= ppHuecos()) return false;
  PP_P.equipo.push(id); PP_P.rescatados.push(id); PP_P.carga[id] = 0;
  SAVE.vistos[id] = true; ppGuardaCamino();
  return true;
}
// sin toques y quedan burbujas: se pierde un corazón (vuelven solos, uno cada 30 minutos) y se repite el nivel
// sin toques: en los niveles gratis se repite sin más; si no, se ofrece seguir (anuncio o perlas, js/tienda.js)
function ppSinToquesOSeguir(T) { if (ppPrimerosGratis()) { T.hecho = true; ppSinToques(); } else ppOfreceSeguir(T); }
function ppSinToques() {
  if (ppPrimerosGratis()) { ppMarcaDentro(false); play('ppDano'); ppVentanaSinToquesGratis(); return; }   // niveles 1 a 3 de una partida nueva (tarea #140)
  PP_P.T.rachaAntes = SAVE.racha || 0;   // para decir en «¡Casi!» si se ha perdido la racha (js/pantalla-victoria.js)
  ppMarcaDentro(false); ppPierdeVida(ppHabSalvaRacha()); ppApuntaFallo(PP_P.T.d); play('ppDano'); ppVibra([30, 40, 30]); ppFxDano(); ppGuardaCamino();   // ppHabSalvaRacha: Racha a salvo (js/habilidades-niveles.js)
  if (SAVE.vidas <= 0) { setTimeout(() => ppSinCorazones(), 400); return; }
  ppVentanaSinToques();
}
// sin corazones: el camino no se pierde; se espera a que vuelvan o se llenan con monedas
function ppSinCorazones() { play('ppDerrota'); ppVentanaSinCorazones(); }
// repetir el nivel que se acaba de jugar
function ppOtraVez() { const d = PP_P.T && PP_P.T.d; ppCierra(); if (d) ppEntra(d.g, d.dif); else ppEntra(); }
// salir de un nivel a medias (pausa): si ya habías tocado, cuesta un corazón
function ppSalNivel() { const T = PP_P.T; if (T) { ppEscDueloSale(T); T.hecho = true; if (SAVE.dentro) { ppMarcaDentro(false); if (!ppPrimerosGratis()) ppPierdeVida(); } } }
function ppTermina(victoria) {
  PP_P.fin = victoria ? 'victoria' : 'derrota';
  if (victoria) SAVE.victorias++;
  if (PP_P.salas > SAVE.record) SAVE.record = PP_P.salas;
  if (PP_P.estrellas > (SAVE.estrellas || 0)) SAVE.estrellas = PP_P.estrellas;
  ppGuardaCamino();
  play(victoria ? 'ppVictoria' : 'ppDerrota');
  ppSintonia(victoria ? 'win' : 'lose');
  setTimeout(() => ppVentanaFin(victoria), victoria ? 900 : 500);
}
