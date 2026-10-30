// Fans of Pop · DUELO contra el CEO (fase 3 de la propuesta, 30-10-2026): el juego de verdad del pop-it, por turnos (es el «Nim»
// de los matemáticos, versión «pierde quien coge la última»). En tu turno revientas las burbujas que quieras, pero todas de la MISMA
// fila, y pulsas ¡LISTO!; luego le toca al CEO. Pierde quien revienta la última burbuja.
// El CEO sabe la jugada perfecta, pero se equivoca a veces: empieza fallando mucho y, cada vez que le ganas, falla menos
// (SAVE.duelo.fallo, entre PP_CFG.duelo.fallo[0] y [1]). Cada victoria da monedas, las 5 primeras del día. No gasta corazones.
// Más adelante (fase 7) será PvP contra otras jugadoras, con el CEO de reserva si no hay nadie en línea.
'use strict';
let PP_DUELO = null;   // { T, turno: 'yo' | 'ceo', fila, esta: [], fin: null | 'gana' | 'pierde', ultimo }
// un tablero de 6 filas de largos al azar (de 1 a 6), centradas: el arcoíris del pop-it
function ppNuevoDuelo() {
  const n = 6, mask = new Uint8Array(n * n), need = new Array(n * n).fill(0);
  for (let y = 0; y < n; y++) {
    const largo = 1 + Math.floor(Math.random() * n), x0 = Math.floor((n - largo) / 2);
    for (let x = x0; x < x0 + largo; x++) { mask[y * n + x] = 1; need[y * n + x] = 1; }
  }
  const T = ppNuevoTablero({ g: 0, lado: n, mask, need, opt: [], limite: 99, amigos: 0, jefe: true }, { equipo: [] });
  PP_DUELO = { T, turno: Math.random() < 0.5 ? 'yo' : 'ceo', fila: null, esta: [], fin: null };
  ppIrA('duelo'); ppFxEntraSala(T); ppDueloBoton();
  ppTutorial('duelo');
  if (PP_DUELO.turno === 'ceo') setTimeout(ppTurnoCeo, 1100);
}
// cuántas burbujas levantadas quedan en cada fila
const ppFilasDuelo = T => { const f = new Array(T.n).fill(0); for (let i = 0; i < T.up.length; i++) if (T.mask[i] && T.up[i]) f[Math.floor(i / T.n)]++; return f; };
// revienta UNA burbuja del duelo (de quien sea); devuelve true si era la última (y quien la revienta pierde)
function ppDueloRevienta(i) {
  const T = PP_DUELO.T; T.up[i] = 0; T.pops++;
  ppFxToque(T, i, { pops: [i], grietas: [], subes: [], hecho: false });
  return ppFilasDuelo(T).every(v => v === 0);
}
// toque de la jugadora
function ppDueloToque(i) {
  const D = PP_DUELO; if (!D || D.fin || D.turno !== 'yo' || i < 0 || !D.T.mask[i] || !D.T.up[i]) return;
  const fila = Math.floor(i / D.T.n);
  if (D.fila !== null && fila !== D.fila) { ppFlota(tr('¡Solo en la misma fila!'), 270, 240, '#ff6ec7'); play('ppDano'); return; }
  D.fila = fila; D.esta.push(i); ppLolaToque();
  if (ppDueloRevienta(i)) { ppDueloFin('pierde'); return; }
  ppDueloBoton();
}
function ppDueloListo() {
  const D = PP_DUELO; if (!D || D.fin || D.turno !== 'yo' || !D.esta.length) return;
  D.turno = 'ceo'; D.fila = null; D.esta = []; ppDueloBoton();
  setTimeout(ppTurnoCeo, 700);
}
// la jugada perfecta del Nim «pierde quien coge la última» (o una al azar, si el CEO se despista): [fila, cuántas]
function ppNimJugada(filas, fallo) {
  const vivas = filas.map((h, k) => [h, k]).filter(([h]) => h > 0);
  if (Math.random() < fallo) { const [h, k] = vivas[Math.floor(Math.random() * vivas.length)]; return [k, 1 + Math.floor(Math.random() * Math.min(h, 3))]; }
  const grandes = vivas.filter(([h]) => h > 1), unos = vivas.filter(([h]) => h === 1).length;
  if (grandes.length === 0) return [vivas[0][1], 1];                         // solo quedan filas de una: se coge una
  if (grandes.length === 1) { const [h, k] = grandes[0]; return [k, unos % 2 ? h : h - 1]; }   // deja un número impar de filas de una
  const x = vivas.reduce((a, [h]) => a ^ h, 0);
  if (x) for (const [h, k] of vivas) if ((h ^ x) < h) return [k, h - (h ^ x)];
  const [h, k] = vivas.reduce((a, b) => (b[0] > a[0] ? b : a)); return [k, 1];   // va perdiendo: coge una y espera un fallo
}
function ppTurnoCeo() {
  const D = PP_DUELO; if (!D || D.fin || PP_PANT.actual !== 'duelo') return;
  if (PP_PANT.pausa) { setTimeout(ppTurnoCeo, 500); return; }
  const T = D.T, [fila, cuantas] = ppNimJugada(ppFilasDuelo(T), SAVE.duelo.fallo);
  const sitios = []; for (let x = 0; x < T.n; x++) { const i = fila * T.n + x; if (T.mask[i] && T.up[i]) sitios.push(i); }
  sitios.sort(() => Math.random() - 0.5);
  D.fila = fila; ppFxHabilidad('ceo');
  sitios.slice(0, cuantas).forEach((i, k) => setTimeout(() => {
    if (PP_DUELO !== D || D.fin) return;
    if (ppDueloRevienta(i)) { ppDueloFin('gana'); return; }
    if (k === cuantas - 1) setTimeout(() => { if (PP_DUELO === D && !D.fin) { D.turno = 'yo'; D.fila = null; ppDueloBoton(); } }, 500);
  }, 380 * (k + 1)));
}
function ppDueloFin(res) {
  const D = PP_DUELO; D.fin = res; ppDueloBoton();
  const S = SAVE.duelo, [mucho, poco] = PP_CFG.duelo.fallo;
  if (S.dia !== ppHoy()) { S.dia = ppHoy(); S.hoy = 0; }
  let monedas = 0;
  if (res === 'gana') { S.gan++; S.fallo = Math.max(poco, S.fallo - PP_CFG.duelo.paso); if (S.hoy < PP_CFG.duelo.premiosDia) { S.hoy++; monedas = PP_CFG.duelo.premio; SAVE.monedas += monedas; } }
  else { S.per++; S.fallo = Math.min(mucho, S.fallo + PP_CFG.duelo.paso / 2); }
  ppGuarda();
  play(res === 'gana' ? 'ppVictoria' : 'ppDerrota');
  setTimeout(() => {
    const t = ppAbre(`<h2>${res === 'gana' ? tr('¡Has ganado al CEO!') : tr('El CEO gana esta vez')}</h2>
      <p class="pp-sub">${res === 'gana' ? tr('Le has dejado la última burbuja. Dice que el pop-it estaba amañado.') : tr('Te ha tocado reventar la última burbuja. Se ríe como un villano de oficina.')}</p>
      ${monedas ? `<p class="pp-premio">+${ppMonedasHtml(monedas)}</p>` : res === 'gana' ? `<p class="pp-sub">${tr('Hoy ya has ganado todas las monedas del duelo. ¡Vuelve mañana!')}</p>` : ''}
      <p class="pp-sub">${tr('Victorias: {g} · Derrotas: {p}', { g: S.gan, p: S.per })}</p>`);
    t.appendChild(ppBoton(tr('¡OTRO DUELO!'), 'pp-btn', () => { ppCierra(); ppNuevoDuelo(); }));
    t.appendChild(ppBoton(tr('Portada'), 'pp-btn2 pp-azul', () => { ppCierra(); ppSalDuelo(); }));
  }, 900);
}
function ppSalDuelo() { PP_DUELO = null; ppDueloBoton(); ppIrA('titulo'); }
// el botón ¡LISTO! (HTML, debajo del tablero): solo en tu turno y con algo reventado
function ppDueloBoton() { const b = $pp('#pp-listo'); if (b) b.hidden = !(PP_DUELO && !PP_DUELO.fin && PP_DUELO.turno === 'yo' && PP_DUELO.esta.length); }
/* ---------- dibujo ---------- */
function ppPintaDuelo(c, t) {
  const D = PP_DUELO, T = D.T, g = ppGeom(T.n);
  c.save(); if (PP_FX.temblor > 0) c.translate(rand(-1, 1) * PP_FX.temblor * 5, rand(-1, 1) * PP_FX.temblor * 5);
  ppPintaFondo(c, 'fondo-jefe', t);
  // arriba: tú contra el CEO, y de quién es el turno
  c.fillStyle = 'rgba(255,255,255,0.6)'; c.beginPath(); c.roundRect(20, 18, 500, 150, 24); c.fill();
  const br = PP_FX.brilla.ceo || 0;
  ppSlimeRepuestoOImagen(c, 'ceo', 420, 88 - br * 12, 46, t, 1);
  ppSlimeRepuestoOImagen(c, 'lola', 140, 88, 40, t, 1);
  ppTexto(c, tr('Tú'), 140, 146, 26, '#fff', 'center', '#c43a84');
  ppTexto(c, tr('El CEO'), 420, 146, 26, '#fff', 'center', '#3a3a6a');
  ppTitulo(c, tr('DUELO'), 270, 58, 44);
  const txt = D.fin ? (D.fin === 'gana' ? tr('¡Ganas!') : tr('¡Gana el CEO!')) : D.turno === 'yo' ? tr('Tu turno') : tr('Piensa el CEO…');
  ppTexto(c, txt, 270, 118, 32, D.turno === 'yo' ? '#ffd64a' : '#fff', 'center', '#7a4a8a');
  ppPintaTablero(c, T, t);
  // la fila en la que estás jugando, marcada
  if (D.fila !== null && !D.fin) {
    c.save(); c.lineWidth = 6; c.strokeStyle = D.turno === 'yo' ? '#ffd64a' : '#8a8aa8'; c.globalAlpha = 0.6 + Math.sin(t * 6) * 0.3;
    c.beginPath(); c.roundRect(g.x - 6, g.y + D.fila * g.celda + 2, g.lado + 12, g.celda - 4, g.celda / 2); c.stroke(); c.restore();
  }
  ppTexto(c, tr('Revienta en una sola fila. ¡Pierde quien revienta la última!'), 270, g.y + g.lado + 52, 22, '#fff', 'center', '#c43a84');
  ppPintaEfectos(c, t);
  c.restore();
}
