// Fans of Pop · PARTIDA: el camino por los MUNDOS (js/niveles.js), nivel a nivel, y el MODO DIFÍCIL de cada mundo ya ganado.
// Los amigos (slimes) y lo que hacen (saltos al tablero, combos, premios), las estrellas de cada nivel, el paso de un mundo al
// siguiente y el guardado del camino para seguir otro día. Los corazones, las monedas y los cofres están en js/monedero.js.
// Se puede repetir cualquier nivel ya pasado para sacar más estrellas (los amigos solo se rescatan la primera vez).
// Las pantallas (pantallas.js) y el dibujo (pintar.js) leen de PP_P.
'use strict';
let PP_P = null;
function ppNuevaRuta() {
  PP_P = { v: 2, equipo: [], carga: {}, estrellas: 0, est: [], nivel: 0, dif: {}, estD: {}, salas: 0, T: null, tipo: null, rescatados: [], fin: null };
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
function ppSigueCamino() { if (!SAVE.run || SAVE.run.v !== 2) return false; PP_P = Object.assign({ T: null, dif: {}, estD: {} }, JSON.parse(JSON.stringify(SAVE.run))); return true; }
// --- el modo difícil: un mundo se abre en difícil al ganar a su jefe; PP_P.dif[m] = niveles difíciles pasados de ese mundo ---
const ppDifAbierto = m => PP_P.nivel >= ppInicioMundo(m) + PP_MUNDOS[m].niveles;
// en qué nivel (dentro del mundo, desde 0) va el camino de ese mundo y modo; PP_MUNDOS[m].niveles = todo pasado
const ppVaPor = (m, dif) => (dif ? PP_P.dif[m] || 0 : clamp(PP_P.nivel - ppInicioMundo(m), 0, PP_MUNDOS[m].niveles));
// el mundo en el que está el camino ahora
const ppMundoActual = () => ppMundoDe(Math.min(PP_P.nivel, PP_TOTAL_NIVELES - 1))[0];
// lo del equipo que cuenta al crear el tablero
function ppFx() {
  const fx = { pista: 0, equipo: PP_P ? PP_P.equipo : [] };
  for (const id of fx.equipo) if (PP_SLIMES[id].fx.pista) fx.pista += PP_SLIMES[id].fx.pista;
  return fx;
}
const ppEnEquipo = id => !!PP_P && PP_P.equipo.includes(id);
// entrar en un nivel (`g` global; sin nada, el siguiente del camino normal). Sin corazones no se entra.
function ppEntra(g = PP_P.nivel, dif = false) {
  if (g >= PP_TOTAL_NIVELES) return;
  if (ppVidas() <= 0) { ppVentanaSinCorazones(); return; }
  const base = ppNivel(g, dif), primera = !dif && g === PP_P.nivel;
  const d = primera || !base.amigos ? base : Object.assign({}, base, { amigos: 0 });   // repitiendo, ya no hay amigos atrapados
  PP_P.tipo = d.jefe ? 'jefe' : 'sala';
  const T = PP_P.T = ppNuevoTablero(d, ppFx());
  T.titulo = (d.jefe ? tr('¡Nivel jefe!') : tr('Nivel {n}', { n: g + 1 })) + (dif ? ' · ' + tr('Difícil') : '');
  if (d.nim) ppNimEmpieza(T);   // nivel difícil o jefe: duelo por turnos contra el rival del mundo (js/nimnivel.js)
  else {
    // la racha de victorias y Nubecita dan toques de margen al empezar (js/pase.js, PP_SLIMES)
    const extra = (SAVE.racha || 0) + (ppEnEquipo('nubecita') ? PP_SLIMES.nubecita.fx.extra : 0);
    if (extra && !d.tutorial) { T.limite += extra; T.extra = extra; }
  }
  PP_AYUDA.modo = null;
  const manita = !dif && d.mundo === 0 && d.l <= 2;   // en los dos primeros niveles la manita señala qué tocar
  if (manita) { T.mano = true; T.pista = [...T.sol][0]; }
  ppIrA('sala');
  ppFxEntraSala(T);
  ppBarraAyudas();
  if (T.extra) ppFlota(tr('+{n} toques de racha y amigos', { n: T.extra }), 270, 240, '#ff8a2a');
  ppAntesDeEmpezar(T);   // tras fallar este nivel, se ofrece +3 toques (js/potenciadores.js)
  if (T.pista !== null && !manita) ppFxHabilidad('lola');
  // lo que explica Lola: el principio de cada mundo, los primeros niveles, el primer difícil y el primer jefe
  if (!dif && d.mundo === 0 && d.l <= 3) ppTutorial('w1n' + d.l);
  if (!dif && d.mundo > 0 && d.l === 1) ppTutorial('w' + (d.mundo + 1) + 'n1');
  if (dif) ppTutorial('modoDificil');
  if (d.nim) ppTutorial('nimNivel');
  else if (d.dificil) ppTutorial('dificil');
  if (d.jefe) ppTutorial('jefe');
  if (PP_P.equipo.length) ppTutorial('amigo');
  if (SAVE.monedas > 0) ppTutorial('monedas');
}
// un toque del jugador en la burbuja i del nivel abierto
function ppToque(i) {
  const T = PP_P.T; if (!T || T.hecho || T.parado) return;
  if (T.nim) { ppNimToque(i); return; }
  if (PP_AYUDA.modo) { ppAplicaAyuda(i); return; }   // martillo o bomba
  const r = ppToca(T, i); if (!r) return;
  ppMarcaDentro(true);   // desde el primer toque, salir a medias cuesta un corazón
  ppLolaToque();
  ppFxToque(T, i, r);
  if (T.mano) { const s = [...T.sol]; T.pista = s.length ? s[0] : null; }   // la manita pasa a la siguiente
  if (r.libre) ppFlota(tr('¡Gratis!'), 270, 240, '#3a8ee6');
  const bueno = r.golpes >= 3;   // un toque que revienta (o resquebraja) 3 o más
  if (T.combo >= 2 && bueno) { ppFxCombo(T.combo); if (!SAVE.tuto.combo) ppTutorial('combo'); }
  ppTrasToque(T, i, r);
  if (T.hecho) return;
  // los combos
  if (T.combo > 0 && bueno) {
    if (ppEnEquipo('becario') && T.combo % PP_SLIMES.becario.fx.combo === 0) { T.gratis += PP_SLIMES.becario.fx.gratis; ppFxHabilidad('becario'); ppFlota(tr('Siguiente toque gratis'), 270, 275, '#3a8ee6'); play('ppPista'); }
    if (ppEnEquipo('lola') && T.combo % PP_SLIMES.lola.fx.combo === 0 && T.pista === null) { ppPista(T); if (T.pista !== null) { PP_FX.pista = 0.6; ppFxHabilidad('lola'); play('ppPista'); } }
  }
  // el premio gordo de la Caja de botín (antes de mirar si te has quedado sin toques: un +1 te puede salvar)
  if (ppEnEquipo('cofre') && r.pops.length >= 4) {
    ppFxHabilidad('cofre'); play('ppPremio');
    if (r.pops.length >= 5 && ppVidas() < PP_CFG.vida) { ppSumaVida(1); ppFxCura(1); ppFlota(tr('¡PREMIO GORDO!'), 270, 275, '#ff8a2a'); }
    else { T.limite++; ppFlota(tr('+1 toque'), 270, 275, '#ff8a2a'); }
  }
  // sin toques: ya no se puede tocar, pero se espera a los amigos que estén saltando (pueden acabarlo ellos); luego se ofrece
  // seguir (anuncio o perlas, js/tienda.js) o rendirse y perder el corazón
  if (T.toques >= T.limite && T.gratis === 0) { T.parado = true; setTimeout(() => { if (PP_P && PP_P.T === T && !T.hecho) ppOfreceSeguir(T); }, 800); }
}
// lo que pasa después de cualquier toque (del jugador o de un amigo): castigos, cargar a los que saltan y acabar el nivel
function ppTrasToque(T, i, r) {
  if (r.castigo) {
    for (let k = 0; k < r.castigo; k++) ppPierdeVida();
    play('ppDano'); ppVibra([30, 40, 30]); ppFxDano();
    if (SAVE.vidas <= 0) { T.hecho = true; ppMarcaDentro(false); setTimeout(() => ppSinCorazones(), 500); return; }
  }
  if (r.hecho) { PP_P.salas++; ppMarcaDentro(false); setTimeout(() => { if (PP_P && PP_P.T === T) ppSalaHecha(); }, 520); return; }
  // los que saltan se cargan con cada burbuja reventada (también las que revientan otros amigos: hay reacciones en cadena)
  PP_P.equipo.forEach((id, k) => {
    const fx = PP_SLIMES[id].fx; if (!fx.salta) return;
    PP_P.carga[id] = (PP_P.carga[id] || 0) + r.pops.length;
    if (PP_P.carga[id] >= fx.salta) { PP_P.carga[id] -= fx.salta; ppSaltaSlime(id, k, fx.golpes); }
  });
}
// un amigo salta desde su hueco del equipo y revienta gratis burbujas de la solución
function ppSaltaSlime(id, k, golpes) {
  const T = PP_P.T, pref = PP_SLIMES[id].fx.prefiere;
  // Copito y Medusita van antes a las de hielo o a las conchas que sigan arriba; los demás, a burbujas de la solución
  const suyas = pref && T.esp ? [...T.up.keys()].filter(i => T.up[i] && T.esp[i] === pref) : [];
  const objetivos = (suyas.length ? suyas : [...T.sol]).sort(() => Math.random() - 0.5).slice(0, golpes);
  if (!objetivos.length) return;
  ppFxHabilidad(id); play('ppSalto');
  objetivos.forEach((i, g) => {
    const dur = 0.5 + g * 0.18;
    ppFxVuelo(id, k, i, T.n, dur);
    setTimeout(() => {
      if (!PP_P || PP_P.T !== T || T.hecho) return;
      let j = i; if (!T.up[j] || (!suyas.includes(j) && !T.sol.has(j))) { const s = [...T.sol]; if (!s.length) return; j = s[0]; }   // si ya no hace falta esa, otra de la solución
      const r = ppToca(T, j, true); if (!r) return;
      ppFxToque(T, j, r); ppFxImpacto(T, j, id === 'ceo');
      if (T.mano) { const s = [...T.sol]; T.pista = s.length ? s[0] : null; }
      ppTrasToque(T, j, r);
    }, dur * 1000);
  });
}
function ppSalaHecha() {
  const T = PP_P.T, d = T.d, g = d.g; play('ppSala');
  T.estrellas = ppEstrellas(T);
  const est = d.dif ? PP_P.estD : PP_P.est, antes = est[g] || 0;
  est[g] = Math.max(antes, T.estrellas); PP_P.estrellas += Math.max(0, T.estrellas - antes);
  T.premio = ppPremioNivel((d.dif ? 'd' : '') + g, T.estrellas, d.jefe, d.dif ? 2 : 1);
  ppBorraFallos(d); ppBarraAyudas();
  const presos = Object.values(T.slimes);
  // el camino solo avanza si era el siguiente nivel (repitiendo uno ya pasado, no)
  let nuevo = false;
  if (d.dif) { if (d.l - 1 === (PP_P.dif[d.mundo] || 0)) { PP_P.dif[d.mundo] = d.l; nuevo = true; } }
  else if (g === PP_P.nivel) { PP_P.nivel++; nuevo = true; }
  ppGuardaCamino();
  if (nuevo) ppPremiosCandy(d, T.estrellas);   // racha, hucha y puntos del pase (js/pase.js y js/ofertas.js)
  if (nuevo && d.jefe && d.dif) { play('ppVictoria'); ppVentanaMundoNuevo(true); return; }
  if (nuevo && d.jefe) { play('ppVictoria'); ppVentanaMundoNuevo(false); return; }
  if (presos.length) { play('ppRescate'); ppVentanaRescate(presos); } else ppVentanaSalaHecha();
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
function ppSinToques() {
  ppMarcaDentro(false); ppPierdeVida(); ppApuntaFallo(PP_P.T.d); play('ppDano'); ppVibra([30, 40, 30]); ppFxDano(); ppGuardaCamino();
  if (SAVE.vidas <= 0) { setTimeout(() => ppSinCorazones(), 400); return; }
  ppVentanaSinToques();
}
// sin corazones: el camino no se pierde; se espera a que vuelvan o se llenan con monedas
function ppSinCorazones() { play('ppDerrota'); ppVentanaSinCorazones(); }
// repetir el nivel que se acaba de jugar
function ppOtraVez() { const d = PP_P.T && PP_P.T.d; ppCierra(); if (d) ppEntra(d.g, d.dif); else ppEntra(); }
// salir de un nivel a medias (pausa): si ya habías tocado, cuesta un corazón
function ppSalNivel() { const T = PP_P.T; if (T) { T.hecho = true; if (SAVE.dentro) { ppMarcaDentro(false); ppPierdeVida(); } } }
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
