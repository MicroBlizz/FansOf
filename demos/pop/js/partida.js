// Fans of Pop · PARTIDA: el camino por los MUNDOS (js/niveles.js), nivel a nivel. Los corazones (se pierde uno al quedarte sin
// toques), los amigos (slimes) y lo que hacen (saltos al tablero, combos, premios), las estrellas de cada nivel, el paso de un
// mundo al siguiente y el guardado del camino para seguir otro día.
// Las pantallas (pantallas.js) y el dibujo (pintar.js) leen de PP_P.
'use strict';
let PP_P = null;
function ppNuevaRuta() {
  PP_P = { v: 2, vida: PP_CFG.vida, vidaMax: PP_CFG.vida, equipo: [], carga: {}, estrellas: 0, est: [], nivel: 0, salas: 0, T: null, tipo: null, rescatados: [], fin: null };
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
function ppSigueCamino() { if (!SAVE.run || SAVE.run.v !== 2) return false; PP_P = Object.assign({ T: null }, JSON.parse(JSON.stringify(SAVE.run))); return true; }
// lo del equipo que cuenta al crear el tablero
function ppFx() {
  const fx = { pista: 0, equipo: PP_P ? PP_P.equipo : [] };
  for (const id of fx.equipo) if (PP_SLIMES[id].fx.pista) fx.pista += PP_SLIMES[id].fx.pista;
  return fx;
}
const ppEnEquipo = id => !!PP_P && PP_P.equipo.includes(id);
const ppNivelActual = () => (PP_P.nivel < PP_TOTAL_NIVELES ? ppNivel(PP_P.nivel) : null);
// entrar en el nivel que toca
function ppEntra() {
  const d = ppNivelActual(); if (!d) return;
  PP_P.tipo = d.jefe ? 'jefe' : 'sala';
  const T = PP_P.T = ppNuevoTablero(d, ppFx());
  T.titulo = d.jefe ? tr('¡Nivel jefe!') : tr('Nivel {n}', { n: PP_P.nivel + 1 });
  const manita = d.mundo === 0 && d.l <= 2;   // en los dos primeros niveles la manita señala qué tocar
  if (manita) { T.mano = true; T.pista = [...T.sol][0]; }
  ppIrA('sala');
  ppFxEntraSala(T);
  if (T.pista !== null && !manita) ppFxHabilidad('lola');
  // lo que explica Lola: el principio de cada mundo, los primeros niveles, el primer difícil y el primer jefe
  if (d.mundo === 0 && d.l <= 3) ppTutorial('w1n' + d.l);
  if (d.mundo === 1 && d.l === 1) ppTutorial('w2n1');
  if (d.dificil) ppTutorial('dificil');
  if (d.jefe) ppTutorial('jefe');
  if (PP_P.equipo.length) ppTutorial('amigo');
}
// un toque del jugador en la burbuja i del nivel abierto
function ppToque(i) {
  const T = PP_P.T; if (!T || T.hecho || T.parado) return;
  const r = ppToca(T, i); if (!r) return;
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
    if (r.pops.length >= 5 && PP_P.vida < PP_P.vidaMax) { PP_P.vida++; ppFxCura(1); ppFlota(tr('¡PREMIO GORDO!'), 270, 275, '#ff8a2a'); }
    else { T.limite++; ppFlota(tr('+1 toque'), 270, 275, '#ff8a2a'); }
  }
  // sin toques: ya no se puede tocar, pero se espera a los amigos que estén saltando (pueden acabarlo ellos)
  if (T.toques >= T.limite && T.gratis === 0) { T.parado = true; setTimeout(() => { if (PP_P && PP_P.T === T && !T.hecho) { T.hecho = true; ppSinToques(); } }, 800); }
}
// lo que pasa después de cualquier toque (del jugador o de un amigo): castigos, cargar a los que saltan y acabar el nivel
function ppTrasToque(T, i, r) {
  if (r.castigo) {
    PP_P.vida = Math.max(0, PP_P.vida - r.castigo); play('ppDano'); ppVibra([30, 40, 30]); ppFxDano();
    if (PP_P.vida <= 0) { T.hecho = true; setTimeout(() => ppSinCorazones(), 500); return; }
  }
  if (r.hecho) { PP_P.salas++; setTimeout(() => { if (PP_P && PP_P.T === T) ppSalaHecha(); }, 520); return; }
  // los que saltan se cargan con cada burbuja reventada (también las que revientan otros amigos: hay reacciones en cadena)
  PP_P.equipo.forEach((id, k) => {
    const fx = PP_SLIMES[id].fx; if (!fx.salta) return;
    PP_P.carga[id] = (PP_P.carga[id] || 0) + r.pops.length;
    if (PP_P.carga[id] >= fx.salta) { PP_P.carga[id] -= fx.salta; ppSaltaSlime(id, k, fx.golpes); }
  });
}
// un amigo salta desde su hueco del equipo y revienta gratis burbujas de la solución
function ppSaltaSlime(id, k, golpes) {
  const T = PP_P.T, objetivos = [...T.sol].sort(() => Math.random() - 0.5).slice(0, golpes);
  if (!objetivos.length) return;
  ppFxHabilidad(id); play('ppSalto');
  objetivos.forEach((i, g) => {
    const dur = 0.5 + g * 0.18;
    ppFxVuelo(id, k, i, T.n, dur);
    setTimeout(() => {
      if (!PP_P || PP_P.T !== T || T.hecho) return;
      let j = i; if (!T.sol.has(j)) { const s = [...T.sol]; if (!s.length) return; j = s[0]; }   // si ya no hace falta esa, otra de la solución
      const r = ppToca(T, j, true); if (!r) return;
      ppFxToque(T, j, r); ppFxImpacto(T, j, id === 'ceo');
      if (T.mano) { const s = [...T.sol]; T.pista = s.length ? s[0] : null; }
      ppTrasToque(T, j, r);
    }, dur * 1000);
  });
}
function ppSalaHecha() {
  const T = PP_P.T; play('ppSala');
  T.estrellas = ppEstrellas(T);
  const antes = PP_P.est[PP_P.nivel] || 0;
  PP_P.est[PP_P.nivel] = Math.max(antes, T.estrellas); PP_P.estrellas += Math.max(0, T.estrellas - antes);
  const presos = Object.values(T.slimes);
  const eraJefe = T.d.jefe;
  PP_P.nivel++; ppGuardaCamino();
  if (eraJefe && PP_P.nivel >= PP_TOTAL_NIVELES) { ppTermina(true); return; }   // el último jefe: de momento, el final
  if (eraJefe) { play('ppVictoria'); ppVentanaMundoNuevo(); return; }
  if (presos.length) { play('ppRescate'); ppVentanaRescate(presos); } else ppVentanaSalaHecha();
}
// un amigo se une al equipo (si está lleno, `fuera` es el que se va)
function ppRecluta(id, fuera) {
  if (fuera) { PP_P.equipo = PP_P.equipo.filter(k => k !== fuera); delete PP_P.carga[fuera]; }
  if (PP_P.equipo.length >= PP_CFG.equipo) return false;
  PP_P.equipo.push(id); PP_P.rescatados.push(id); PP_P.carga[id] = 0;
  SAVE.vistos[id] = true; ppGuardaCamino();
  return true;
}
// sin toques y quedan burbujas: se pierde un corazón y se repite el nivel (las vidas que se recargan llegan en la fase 2)
function ppSinToques() {
  PP_P.vida = Math.max(0, PP_P.vida - 1); play('ppDano'); ppVibra([30, 40, 30]); ppFxDano(); ppGuardaCamino();
  if (PP_P.vida <= 0) { setTimeout(() => ppSinCorazones(), 400); return; }
  ppVentanaSinToques();
}
// sin corazones: de momento, así que no se pierde el camino; se sigue en el mismo nivel con unos pocos corazones
function ppSinCorazones() { play('ppDerrota'); ppVentanaSinCorazones(); }
function ppSigueConCorazones() { PP_P.vida = Math.min(PP_P.vidaMax, PP_CFG.vidaSeguir); ppGuardaCamino(); ppEntra(); }
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
