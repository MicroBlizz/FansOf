// Fans of Pop · NIVELES DUELO (Daniel, 30-10-2026: el pop-it en solitario le parecía demasiado fácil y eligió la mezcla): los
// niveles difíciles y los jefes del camino son un duelo Nim contra el rival del mundo (PP_RIVALES y ppNivelNim en niveles.js),
// sobre la forma de tablero del nivel. Por turnos, cada uno revienta las que quiera de UNA fila y pulsa ¡LISTO!; pierde quien
// revienta la última. Empieza quien tiene la posición ganadora (siempre tú, o el rival primero si la de salida es perdedora),
// así que con juego perfecto siempre se puede ganar. El rival juega perfecto (ppNimJugada de duelo.js) salvo cuando se
// despista (`fallo`). Estrellas: 3 sin errores, 2 con uno, 1 con más (un error = dejarle al rival una posición ganadora).
// Perder cuesta un corazón, como quedarse sin toques. Los amigos no actúan en los duelos.
'use strict';
// ¿gana quien mueve ahora? (Nim «pierde quien coge la última»): si todas las filas tienen 0 o 1, gana con un número par de filas;
// si no, gana si el XOR de las filas no es 0
function ppNimGana(filas) {
  const v = filas.filter(h => h > 0);
  if (!v.length) return true;
  if (!v.some(h => h > 1)) return v.length % 2 === 0;
  return v.reduce((a, h) => a ^ h, 0) !== 0;
}
function ppNimEmpieza(T) {
  const d = T.d;
  T.nim = { rival: d.nim.rival, fallo: d.nim.fallo, turno: 'yo', fila: null, esta: [], errores: 0, fin: null };
  if (!ppNimGana(ppFilasDuelo(T))) { T.nim.turno = 'rival'; setTimeout(() => ppNimRival(T), 1300); }
  ppNimBoton();
}
function ppNimToque(i) {
  const T = PP_P.T, N = T.nim;
  if (N.fin || N.turno !== 'yo' || i < 0 || !T.mask[i] || !T.up[i]) return;
  const fila = Math.floor(i / T.n);
  if (N.fila !== null && fila !== N.fila) { ppFlota(tr('¡Solo en la misma fila!'), 270, 240, '#ff6ec7'); play('ppDano'); return; }
  if (N.fila === null) N.antes = ppNimGana(ppFilasDuelo(T));   // ¿empezabas tu turno ganando?
  N.fila = fila; N.esta.push(i); ppMarcaDentro(true); ppLolaToque();
  T.up[i] = 0; T.pops++;
  ppFxToque(T, i, { pops: [i], grietas: [], subes: [], hecho: false });
  if (ppFilasDuelo(T).every(v => v === 0)) { ppNimFin(T, false); return; }   // has reventado la última
  ppNimBoton();
}
function ppNimListo() {
  const T = PP_P && PP_P.T, N = T && T.nim; if (!N || N.fin || N.turno !== 'yo' || !N.esta.length) return;
  // un error: empezabas ganando y le dejas al rival una posición en la que gana él
  if (N.antes && ppNimGana(ppFilasDuelo(T))) { N.errores++; if (N.errores === 1) ppFlota(tr('Hmm… eso le viene bien'), 270, 240, '#ff8a2a'); }
  N.turno = 'rival'; N.fila = null; N.esta = []; ppNimBoton();
  setTimeout(() => ppNimRival(T), 700);
}
function ppNimRival(T) {
  if (!PP_P || PP_P.T !== T || T.nim.fin || PP_PANT.actual !== 'sala') return;
  if (PP_PANT.pausa || !$pp('#pp-modal').hidden) { setTimeout(() => ppNimRival(T), 500); return; }
  const N = T.nim, [fila, cuantas] = ppNimJugada(ppFilasDuelo(T), N.fallo);
  const sitios = []; for (let x = 0; x < T.n; x++) { const i = fila * T.n + x; if (T.mask[i] && T.up[i]) sitios.push(i); }
  sitios.sort(() => Math.random() - 0.5);
  N.fila = fila; PP_FX.brilla.rival = 1;
  sitios.slice(0, cuantas).forEach((i, k) => setTimeout(() => {
    if (!PP_P || PP_P.T !== T || N.fin) return;
    T.up[i] = 0; T.pops++;
    ppFxToque(T, i, { pops: [i], grietas: [], subes: [], hecho: false });
    if (ppFilasDuelo(T).every(v => v === 0)) { ppNimFin(T, true); return; }   // el rival ha reventado la última: ganas
    if (k === cuantas - 1) setTimeout(() => { if (PP_P && PP_P.T === T && !N.fin) { N.turno = 'yo'; N.fila = null; ppNimBoton(); } }, 500);
  }, 380 * (k + 1)));
}
function ppNimFin(T, gano) {
  const N = T.nim; N.fin = gano ? 'gana' : 'pierde'; ppNimBoton();
  ppMarcaDentro(false);
  if (gano) { T.hecho = true; T.toques = 0; PP_P.salas++; setTimeout(() => { if (PP_P && PP_P.T === T) ppSalaHecha(); }, 900); return; }
  T.hecho = true;
  ppPierdeVida(); play('ppDano'); ppVibra([30, 40, 30]); ppFxDano(); ppGuardaCamino();
  setTimeout(() => {
    if (!PP_P || PP_P.T !== T) return;
    if (SAVE.vidas <= 0) { ppSinCorazones(); return; }
    const t = ppAbre(`<h2>${tr('¡{n} te ha ganado!', { n: tr(PP_SLIMES[N.rival].nombre) })}</h2><p class="pp-sub">${tr('Te ha tocado reventar la última burbuja. Pierdes un corazón; te quedan {n}.', { n: SAVE.vidas })}</p>`);
    t.appendChild(ppBoton(tr('¡OTRA VEZ!'), 'pp-btn', ppOtraVez));
    t.appendChild(ppBoton(tr('Al camino'), 'pp-btn2 pp-azul', ppAlCamino));
  }, 900);
}
// el botón ¡LISTO!: solo en tu turno y con algo reventado
function ppNimBoton() { const T = PP_P && PP_P.T, N = T && T.nim, b = $pp('#pp-listo'); if (b) b.hidden = !(N && !N.fin && N.turno === 'yo' && N.esta.length && PP_PANT.actual === 'sala'); }
/* ---------- dibujo ---------- */
// arriba: los corazones (los pinta el marcador), el rival con su nombre y de quién es el turno
function ppMarcadorNim(c, T, t) {
  const N = T.nim, br = PP_FX.brilla.rival || 0;
  ppSlimeRepuestoOImagen(c, N.rival, 470, 62 - br * 12, 30, t, 1);
  ppTexto(c, tr(PP_SLIMES[N.rival].nombre), 470, 106, 18, '#fff', 'center', '#3a3a6a');
  for (let k = 0; k < 3; k++) ppEstrella(c, 300 + k * 30, 52, 26, k < ppEstrellas(T));
  ppTexto(c, T.titulo || '', 270, 98, 30, '#ffd64a', 'center', '#7a4a8a');
  const txt = N.fin ? (N.fin === 'gana' ? tr('¡Ganas!') : tr('¡Gana {n}!', { n: tr(PP_SLIMES[N.rival].nombre) })) : N.turno === 'yo' ? tr('Tu turno') : tr('Piensa {n}…', { n: tr(PP_SLIMES[N.rival].nombre) });
  ppTexto(c, txt, 270, 134, 26, N.turno === 'yo' ? '#ffd64a' : '#fff', 'center', '#c43a84');
  ppTexto(c, tr('Una sola fila por turno · ¡pierde quien revienta la última!'), 270, 164, 18, '#7a4a8a', 'center', '#fff');
}
// la fila en la que se está jugando, marcada
function ppPintaFilaNim(c, T, t) {
  const N = T.nim; if (N.fila === null || N.fin) return;
  const g = ppGeom(T.n);
  c.save(); c.lineWidth = 6; c.strokeStyle = N.turno === 'yo' ? '#ffd64a' : '#8a8aa8'; c.globalAlpha = 0.6 + Math.sin(t * 6) * 0.3;
  c.beginPath(); c.roundRect(g.x - 6, g.y + N.fila * g.celda + 2, g.lado + 12, g.celda - 4, g.celda / 2); c.stroke(); c.restore();
}
