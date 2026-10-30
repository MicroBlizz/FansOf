// Fans of Pop · MEMORIA (fase 4 de la propuesta, 30-10-2026): el «Simón dice» del pop-it. Las burbujas se hunden en orden, cada
// una con su nota de caja de música, y hay que repetir la melodía tocándolas igual. Cada ronda añade una burbuja más y la
// melodía va un poco más deprisa. Un fallo acaba la partida.
// Se juega gratis (no gasta corazones) y guarda el récord (SAVE.memoria.record). Premio diario en monedas según la ronda a la que
// llegues (PP_CFG.memoria): cada día se cobra solo lo que mejora tu mejor ronda de HOY, así repetir no da monedas sin fin.
// La lista de récords con otras jugadoras llegará cuando haya servidor para ello.
// El reloj de la melodía avanza con el bucle (ppMemAvanza), no con setTimeout: así la pausa la congela de verdad.
'use strict';
let PP_MEM = null;   // { T, sec: [], paso, fase: 'mira' | 'toca' | 'bien' | 'fin', reloj, sigue, luces: {i: segundos}, brillos: {i: 0..1} }
// la nota de cada burbuja: de grave (arriba a la izquierda) a aguda (abajo a la derecha), en la pentatónica: siempre suena bonito
const ppMemNota = i => PP_NOTAS[Math.min(PP_NOTAS.length - 1, i)];
// cuánto tarda cada burbuja de la melodía en la ronda r (segundos): empieza tranquila y acelera hasta un mínimo
const ppMemPaso = r => Math.max(PP_CFG.memoria.pasoMin, PP_CFG.memoria.paso - (r - 1) * PP_CFG.memoria.acelera);
function ppNuevaMemoria() {
  const n = PP_CFG.memoria.lado, mask = new Uint8Array(n * n).fill(1), need = new Array(n * n).fill(1);
  const T = ppNuevoTablero({ g: 0, lado: n, mask, need, opt: [], limite: 99, amigos: 0, jefe: false }, { equipo: [] });
  PP_MEM = { T, sec: [], paso: 0, fase: 'bien', reloj: 0.9, sigue: 0, luces: {}, brillos: {} };
  ppIrA('memoria'); ppFxEntraSala(T);
  ppTutorial('memoria');
  ppMemRonda();
}
// una ronda nueva: una burbuja más (nunca la misma dos veces seguidas, que no se ve) y Lola la enseña
function ppMemRonda() {
  const M = PP_MEM, total = M.T.n * M.T.n;
  let i; do i = Math.floor(Math.random() * total); while (M.sec.length && i === M.sec[M.sec.length - 1]);
  M.sec.push(i); M.paso = 0; M.sigue = 0; M.fase = 'mira';
  M.reloj = M.sec.length === 1 ? 1.1 : 0.7;   // un respiro antes de empezar a enseñar
}
// una burbuja de la melodía: se hunde (pop), suena su nota y brilla; vuelve a subir sola al rato
function ppMemLuz(i, dur) {
  const M = PP_MEM, T = M.T;
  T.up[i] = 0; M.luces[i] = dur; M.brillos[i] = 1;
  PP_FX.celdas[i] = { t: 0, dir: 'pop', demora: 0 };
  ppCampana(ppMemNota(i), 0, 0.13, 0.55); ppPlop(PP_PENTA[i % PP_PENTA.length]);
  ppVibra(10);
  const [cx, cy] = ppCentro(ppGeom(T.n), i);
  for (let k = 0; k < 6; k++) { const a = rand(0, Math.PI * 2), v = rand(70, 200); PP_FX.parts.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, r: rand(3, 6), t: 0, vida: rand(0.3, 0.5), col: ppColorBurbuja(i, T.n, 10) }); }
}
// el reloj de la melodía (lo llama el bucle si no hay pausa)
function ppMemAvanza(dt) {
  const M = PP_MEM; if (!M) return;
  for (const k in M.brillos) M.brillos[k] = Math.max(0, M.brillos[k] - dt * 2.2);
  for (const k in M.luces) {
    M.luces[k] -= dt;
    if (M.luces[k] <= 0) { delete M.luces[k]; M.T.up[k] = 1; PP_FX.celdas[k] = { t: 0, dir: 'sube', demora: 0 }; }
  }
  if (M.fase === 'mira') {
    M.reloj -= dt; if (M.reloj > 0) return;
    const p = ppMemPaso(M.sec.length);
    if (M.sigue < M.sec.length) { ppMemLuz(M.sec[M.sigue], p * 0.6); M.sigue++; M.reloj = p; }
    else { M.fase = 'toca'; M.paso = 0; }
  } else if (M.fase === 'bien') {
    M.reloj -= dt; if (M.reloj <= 0 && M.sec.length) ppMemRonda();
  }
}
// tu toque: la siguiente de la melodía o se acaba
function ppMemToque(i) {
  const M = PP_MEM; if (!M || M.fase !== 'toca' || i < 0) return;
  ppLolaToque();
  if (i !== M.sec[M.paso]) { ppMemFin(i); return; }
  ppMemLuz(i, 0.22); M.paso++;
  if (M.paso === M.sec.length) {
    M.fase = 'bien'; M.reloj = 1.0;
    const [cx] = ppCentro(ppGeom(M.T.n), i);
    ppFlota(M.sec.length % 5 === 0 ? tr('¡Increíble!') : tr('¡Bien!'), cx > 270 ? 340 : 200, ppGeom(M.T.n).y - 30, '#ffd64a');
    setTimeout(() => { if (PP_MEM === M) play('ppSala'); }, 250);
  }
}
// un fallo: la burbuja buena parpadea para que veas cuál era, y sale el resultado
function ppMemFin(mala) {
  const M = PP_MEM; M.fase = 'fin';
  const buena = M.sec[M.paso];
  M.brillos[buena] = 1; M.falla = mala;
  PP_FX.temblor = Math.max(PP_FX.temblor, 0.5); ppVibra([30, 40, 30]);
  play('ppDano');
  const rondas = M.sec.length - 1, S = SAVE.memoria, C = PP_CFG.memoria;
  const nuevo = rondas > S.record;
  if (nuevo) S.record = rondas;
  S.partidas++;
  // el premio de hoy: solo lo que mejora tu mejor ronda del día, hasta el tope
  if (S.dia !== ppHoy()) { S.dia = ppHoy(); S.hoy = 0; }
  const cobra = r => Math.min(C.tope, r * C.porRonda);
  const monedas = Math.max(0, cobra(rondas) - cobra(S.hoy));
  if (rondas > S.hoy) S.hoy = rondas;
  SAVE.monedas += monedas;
  ppGuarda();
  setTimeout(() => {
    if (PP_MEM !== M) return;
    if (nuevo && rondas > 0) play('ppVictoria');
    const t = ppAbre(`<h2>${nuevo && rondas > 0 ? tr('¡Récord nuevo!') : tr('¡Uy, esa no era!')}</h2>
      <p class="pp-sub">${rondas === 1 ? tr('Has repetido 1 melodía.') : tr('Has repetido {n} melodías.', { n: rondas })}</p>
      ${monedas ? `<p class="pp-premio">+${ppMonedasHtml(monedas)}</p>` : cobra(S.hoy) >= C.tope ? `<p class="pp-sub">${tr('Hoy ya has ganado todas las monedas de Memoria. ¡Vuelve mañana!')}</p>` : rondas ? `<p class="pp-sub">${tr('Supera tu mejor ronda de hoy ({n}) para ganar más monedas.', { n: S.hoy })}</p>` : ''}
      <p class="pp-sub">${tr('Tu récord: {n}', { n: S.record })}</p>`);
    t.appendChild(ppBoton(tr('¡OTRA VEZ!'), 'pp-btn', () => { ppCierra(); ppNuevaMemoria(); }));
    t.appendChild(ppBoton(tr('Portada'), 'pp-btn2 pp-azul', () => { ppCierra(); ppSalMemoria(); }));
  }, 1300);
}
function ppSalMemoria() { PP_MEM = null; ppIrA('titulo'); }
/* ---------- dibujo ---------- */
function ppPintaMemoria(c, t) {
  const M = PP_MEM, T = M.T, g = ppGeom(T.n);
  c.save(); if (PP_FX.temblor > 0) c.translate(rand(-1, 1) * PP_FX.temblor * 5, rand(-1, 1) * PP_FX.temblor * 5);
  ppPintaFondo(c, 'fondo-pasteleria', t);
  // arriba: la ronda, el récord y qué toca hacer
  c.fillStyle = 'rgba(255,255,255,0.6)'; c.beginPath(); c.roundRect(20, 18, 500, 150, 24); c.fill();
  ppTitulo(c, tr('MEMORIA'), 270, 58, 44);
  ppTexto(c, tr('Ronda {n}', { n: M.sec.length }), 140, 120, 28, '#fff', 'center', '#c43a84');
  ppTexto(c, tr('Récord: {n}', { n: SAVE.memoria.record }), 400, 120, 28, '#fff', 'center', '#3a6ab8');
  // el halo de cada burbuja que suena (y la buena que parpadea al fallar)
  for (const k in M.brillos) {
    const b = M.brillos[k]; if (b <= 0.01) continue;
    const [cx, cy] = ppCentro(g, +k);
    c.save(); c.globalAlpha = b * 0.75; c.fillStyle = ppColorBurbuja(+k, T.n, 30);
    c.beginPath(); c.arc(cx, cy, g.celda * (0.5 + (1 - b) * 0.25), 0, Math.PI * 2); c.fill(); c.restore();
  }
  ppPintaTablero(c, T, t);
  if (M.fase === 'fin') {
    const parpa = Math.sin(t * 14) > 0;
    const [bx, by] = ppCentro(g, M.sec[M.paso]);
    c.save(); c.lineWidth = 7; c.strokeStyle = parpa ? '#ffd64a' : '#fff'; c.beginPath(); c.arc(bx, by, g.celda * 0.46, 0, Math.PI * 2); c.stroke(); c.restore();
  }
  // abajo: qué hacer ahora, y los puntitos de la melodía (cuántas llevas)
  const txt = M.fase === 'mira' ? tr('Mira y escucha…') : M.fase === 'toca' ? tr('¡Te toca! Repite la melodía') : M.fase === 'bien' ? tr('¡Muy bien!') : tr('¡Uy! Era esta');
  ppTexto(c, txt, 270, g.y + g.lado + 56, 30, M.fase === 'toca' ? '#ffd64a' : '#fff', 'center', '#c43a84');
  const n = M.sec.length, paso = Math.min(22, 440 / Math.max(1, n)), x0 = 270 - ((n - 1) * paso) / 2, y = g.y + g.lado + 100;
  for (let k = 0; k < n; k++) {
    const hecho = M.fase === 'toca' ? k < M.paso : M.fase === 'mira' ? k < M.sigue : M.fase === 'bien';
    c.beginPath(); c.arc(x0 + k * paso, y, Math.min(8, paso * 0.38), 0, Math.PI * 2);
    c.fillStyle = hecho ? '#ffd64a' : 'rgba(255,255,255,0.75)'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#c43a84'; c.stroke();
  }
  ppPintaEfectos(c, t);
  c.restore();
}
