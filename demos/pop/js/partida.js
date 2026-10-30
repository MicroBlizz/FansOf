// Fans of Pop · PARTIDA: una ruta entera, de la primera sala al CEO. Los corazones, el equipo de slimes y sus pasivas,
// en qué fila de la ruta estás y la sala que hay abierta. Las pantallas (pantallas.js) y el dibujo (pintar.js) leen de PP_P.
'use strict';
let PP_P = null;
function ppNuevaRuta() {
  PP_P = { vida: PP_CFG.vida, vidaMax: PP_CFG.vida, equipo: [], fila: -1, nodo: 0, salas: 0, cafe: 0, T: null, tipo: null, rescatados: [], fin: null };
  SAVE.partidas++; ppGuarda();
}
// la suma de las pasivas del equipo
function ppFx() {
  const fx = { margen: 0, cafe: 0, pista: 0, fianza: 0, vidaMax: 0, equipo: PP_P ? PP_P.equipo : [] };
  for (const id of fx.equipo) for (const k in PP_SLIMES[id].fx) fx[k] += PP_SLIMES[id].fx[k];
  return fx;
}
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
}
// un toque del jugador en la burbuja i de la sala abierta
function ppToque(i) {
  const T = PP_P.T; if (!T || T.hecho) return;
  const r = ppToca(T, i); if (!r) return;
  ppFxToque(T, i, r);
  const fx = ppFx();
  if (fx.cafe && T.pops) { PP_P.cafe += r.pops.length; if (PP_P.cafe >= fx.cafe) { PP_P.cafe -= fx.cafe; if (PP_P.vida < PP_P.vidaMax) { PP_P.vida++; play('ppCura'); ppFxCura(1); } } }
  if (r.castigo) {
    PP_P.vida = Math.max(0, PP_P.vida - r.castigo); play('ppDano'); ppVibra([30, 40, 30]); ppFxDano();
    if (PP_P.vida <= 0) { ppTermina(false); return; }
  }
  if (r.hecho) { PP_P.salas++; setTimeout(() => ppSalaHecha(), 420); }
}
function ppSalaHecha() {
  const T = PP_P.T; play('ppSala');
  const presos = Object.values(T.slimes);
  if (PP_P.tipo === 'jefe') { ppTermina(true); return; }
  if (presos.length) { play('ppRescate'); ppVentanaRescate(presos); } else ppVentanaSalaHecha();
}
// un slime se une al equipo (si está lleno, `fuera` es el que se va)
function ppRecluta(id, fuera) {
  if (fuera) PP_P.equipo = PP_P.equipo.filter(k => k !== fuera);
  if (PP_P.equipo.length >= PP_CFG.equipo) return false;
  PP_P.equipo.push(id); PP_P.rescatados.push(id);
  SAVE.vistos[id] = true; ppGuarda();
  const fx = PP_SLIMES[id].fx;
  if (fx.vidaMax) { PP_P.vidaMax += fx.vidaMax; PP_P.vida = Math.min(PP_P.vidaMax, PP_P.vida + 1); }
  return true;
}
function ppTermina(victoria) {
  PP_P.fin = victoria ? 'victoria' : 'derrota';
  if (victoria) SAVE.victorias++;
  if (PP_P.salas > SAVE.record) SAVE.record = PP_P.salas;
  ppGuarda();
  play(victoria ? 'ppVictoria' : 'ppDerrota');
  setTimeout(() => ppVentanaFin(victoria), victoria ? 900 : 500);
}
