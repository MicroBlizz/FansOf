// Fans of Pop · PARTIDA: una ruta entera, de la primera sala al CEO. Los corazones, el equipo de slimes y lo que hacen
// (saltos al tablero, combos, premios), en qué fila de la ruta estás y la sala que hay abierta. Las pantallas (pantallas.js)
// y el dibujo (pintar.js) leen de PP_P.
'use strict';
let PP_P = null;
function ppNuevaRuta() {
  PP_P = { vida: PP_CFG.vida, vidaMax: PP_CFG.vida, equipo: [], carga: {}, estrellas: 0, fila: -1, nodo: 0, salas: 0, T: null, tipo: null, rescatados: [], fin: null };
  SAVE.partidas++; ppGuarda();
}
// la suma de lo que hace el equipo (para crear el tablero)
function ppFx() {
  const fx = { pista: 0, equipo: PP_P ? PP_P.equipo : [] };
  for (const id of fx.equipo) if (PP_SLIMES[id].fx.pista) fx.pista += PP_SLIMES[id].fx.pista;
  return fx;
}
const ppEnEquipo = id => !!PP_P && PP_P.equipo.includes(id);
const ppFilaActual = () => PP_CFG.ruta[PP_P.fila + 1] || null;   // la fila que toca elegir
// entrar en el nodo `idx` de la fila siguiente
function ppEntra(idx) {
  const fila = ppFilaActual(); if (!fila) return;
  PP_P.fila++; PP_P.nodo = idx; PP_P.tipo = fila[idx];
  if (PP_P.tipo === 'descanso') {
    const cura = PP_CFG.salas.descanso.cura; PP_P.vida = Math.min(PP_P.vidaMax, PP_P.vida + cura);
    play('ppCura'); ppFxCura(cura);
    ppVentanaDescanso(cura);
    return;
  }
  PP_P.T = ppNuevoTablero(PP_P.tipo, ppFx());
  ppIrA('sala');
  ppFxEntraSala(PP_P.T);
  if (PP_P.T.pista !== null) ppFxHabilidad('lola');
}
// un toque del jugador en la burbuja i de la sala abierta
function ppToque(i) {
  const T = PP_P.T; if (!T || T.hecho) return;
  const r = ppToca(T, i); if (!r) return;
  ppFxToque(T, i, r);
  if (r.libre) ppFlota(tr('¡Gratis!'), 270, 240, '#7fc4ff');
  if (T.combo >= 2 && r.pops.length > r.subes.length) ppFxCombo(T.combo);
  ppTrasToque(T, i, r);
  if (T.hecho) return;
  // los combos
  if (T.combo > 0 && r.pops.length > r.subes.length) {
    if (ppEnEquipo('becario') && T.combo % PP_SLIMES.becario.fx.combo === 0) { T.gratis += PP_SLIMES.becario.fx.gratis; ppFxHabilidad('becario'); ppFlota(tr('Siguiente toque gratis'), 270, 275, '#7fc4ff'); play('ppPista'); }
    if (ppEnEquipo('lola') && T.combo % PP_SLIMES.lola.fx.combo === 0 && T.pista === null) { ppPista(T); if (T.pista !== null) { PP_FX.pista = 0.6; ppFxHabilidad('lola'); play('ppPista'); } }
  }
  // el premio gordo de la Caja de botín
  if (ppEnEquipo('cofre') && r.pops.length >= 4) {
    ppFxHabilidad('cofre'); play('ppPremio');
    if (r.pops.length >= 5 && PP_P.vida < PP_P.vidaMax) { PP_P.vida++; ppFxCura(1); ppFlota(tr('¡PREMIO GORDO!'), 270, 275, '#ffd64a'); }
    else { T.limite++; ppFlota(tr('+1 toque'), 270, 275, '#ffd64a'); }
  }
}
// lo que pasa después de cualquier toque (del jugador o de un slime): castigos, cargar a los slimes que saltan y acabar la sala
function ppTrasToque(T, i, r) {
  if (r.castigo) {
    PP_P.vida = Math.max(0, PP_P.vida - r.castigo); play('ppDano'); ppVibra([30, 40, 30]); ppFxDano();
    if (PP_P.vida <= 0) { T.hecho = true; ppTermina(false); return; }
  }
  if (r.hecho) { PP_P.salas++; setTimeout(() => ppSalaHecha(), 520); return; }
  // los que saltan se cargan con cada burbuja reventada (también las que revientan otros slimes: hay reacciones en cadena)
  PP_P.equipo.forEach((id, k) => {
    const fx = PP_SLIMES[id].fx; if (!fx.salta) return;
    PP_P.carga[id] = (PP_P.carga[id] || 0) + r.pops.length;
    if (PP_P.carga[id] >= fx.salta) { PP_P.carga[id] -= fx.salta; ppSaltaSlime(id, k, fx.golpes); }
  });
}
// un slime salta desde su hueco del equipo y revienta gratis burbujas de la solución
function ppSaltaSlime(id, k, golpes) {
  const T = PP_P.T, objetivos = [...T.sol].sort(() => Math.random() - 0.5).slice(0, golpes);
  if (!objetivos.length) return;
  ppFxHabilidad(id); play('ppSalto');
  objetivos.forEach((i, g) => {
    const dur = 0.5 + g * 0.18;
    ppFxVuelo(id, k, i, T.n, dur);
    setTimeout(() => {
      if (PP_P.T !== T || T.hecho) return;
      let j = i; if (!T.sol.has(j)) { const s = [...T.sol]; if (!s.length) return; j = s[0]; }   // si ya no hace falta esa, otra de la solución
      const r = ppToca(T, j, true); if (!r) return;
      ppFxToque(T, j, r); ppFxImpacto(T, j, id === 'ceo');
      ppTrasToque(T, j, r);
    }, dur * 1000);
  });
}
function ppSalaHecha() {
  const T = PP_P.T; play('ppSala');
  T.estrellas = ppEstrellas(T); PP_P.estrellas += T.estrellas;
  const presos = Object.values(T.slimes);
  if (PP_P.tipo === 'jefe') { ppTermina(true); return; }
  ppMusicaRuta();
  if (presos.length) { play('ppRescate'); ppVentanaRescate(presos); } else ppVentanaSalaHecha();
}
// un slime se une al equipo (si está lleno, `fuera` es el que se va)
function ppRecluta(id, fuera) {
  if (fuera) { PP_P.equipo = PP_P.equipo.filter(k => k !== fuera); delete PP_P.carga[fuera]; }
  if (PP_P.equipo.length >= PP_CFG.equipo) return false;
  PP_P.equipo.push(id); PP_P.rescatados.push(id); PP_P.carga[id] = 0;
  SAVE.vistos[id] = true; ppGuarda();
  return true;
}
function ppTermina(victoria) {
  PP_P.fin = victoria ? 'victoria' : 'derrota';
  if (victoria) SAVE.victorias++;
  if (PP_P.salas > SAVE.record) SAVE.record = PP_P.salas;
  if (PP_P.estrellas > (SAVE.estrellas || 0)) SAVE.estrellas = PP_P.estrellas;
  ppGuarda();
  play(victoria ? 'ppVictoria' : 'ppDerrota');
  ppSintonia(victoria ? 'win' : 'lose');
  setTimeout(() => ppVentanaFin(victoria), victoria ? 900 : 500);
}
