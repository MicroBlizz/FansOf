// Fans of Pop · MEMORIA (fase 4 de la propuesta, 30-10-2026): el «Simón dice» del pop-it. Las burbujas se hunden en orden, cada
// una con su nota, y hay que repetir la melodía tocándolas igual. Cada ronda añade una burbuja más y la melodía va un poco más
// deprisa. Un fallo acaba la partida.
// Tarea #141 (fase 1, ADR 215): antes de jugar se elige el MUNDO (su fondo, su estilo y su instrumento: js/memoria-elige.js) y la
// DIFICULTAD (Fácil, Normal o Difícil); el tablero CRECE con las rondas (3x3, 4x4 y la forma del mundo). Las reglas puras están en
// js/memoria-reglas.js (PP_MEM_R) y los instrumentos en js/memoria-instrumentos.js.
// Se juega gratis (no gasta corazones) y guarda el récord de cada dificultad (Normal en SAVE.memoria.record, el de la clasificación;
// Fácil y Difícil en SAVE.memoria.records). Premio diario en monedas según la ronda a la que llegues (PP_CFG.memoria): cada día se
// cobra solo lo que mejora tu mejor ronda de HOY, así repetir no da monedas sin fin.
// El reloj de la melodía avanza con el bucle (ppMemAvanza), no con setTimeout: así la pausa la congela de verdad.
'use strict';
let PP_MEM = null;   // { T, mundo, aj (ajustes de la dificultad), sec: [], paso, fase: 'mira' | 'toca' | 'bien' | 'fin', reloj, sigue, espera, luces: {i: segundos}, brillos: {i: 0..1} }
// la nota de la burbuja i del tablero T: de grave (arriba a la izquierda) a aguda (abajo a la derecha), en la pentatónica
const ppMemNota = (T, i) => PP_MEM_R.nota(PP_MEM_R.puesto(T.mask, i), T.mask.reduce((a, v) => a + v, 0));
// el tablero de la ronda r en el mundo m (con su estilo: T.d.mundo)
function ppMemTablero(m, r) {
  const C = PP_CFG.memoria, { lado, mask } = PP_MEM_R.mascara(PP_MEM_R.formaDe(C, PP_FORMAS, PP_FORMAS_MUNDO, m, r));
  return ppNuevoTablero({ g: 0, mundo: m, lado, mask, need: mask.slice(), opt: [], limite: 99, amigos: 0, jefe: false }, { equipo: [] });
}
function ppNuevaMemoria(mundo = SAVE.memoria.mundo || 0, dif = SAVE.memoria.dif) {
  const T = ppMemTablero(mundo, 1);
  PP_MEM = { T, mundo, aj: PP_MEM_R.ajustesDe(PP_CFG.memoria, dif), sec: [], paso: 0, fase: 'bien', reloj: 0.9, sigue: 0, espera: 0, luces: {}, brillos: {} };
  ppIrA('memoria'); ppFxEntraSala(T);
  ppTutorial('memoria');
  ppMemRonda();
}
// una ronda nueva: si toca, el tablero crece (la melodía pasa a las burbujas del mismo sitio); luego una burbuja más (nunca la
// misma dos veces seguidas, que no se ve) y Lola la enseña
function ppMemRonda() {
  const M = PP_MEM, r = M.sec.length + 1;
  let respiro = M.sec.length ? 0.7 : 1.1;   // un respiro antes de empezar a enseñar
  if (M.sec.length && PP_MEM_R.crece(PP_CFG.memoria, r)) { ppMemCrece(r); respiro = 1.6; }
  const libres = [...M.T.mask.keys()].filter(i => M.T.mask[i] && i !== M.sec[M.sec.length - 1]);
  M.sec.push(libres[Math.floor(Math.random() * libres.length)]); M.paso = 0; M.sigue = 0; M.fase = 'mira';
  M.reloj = respiro;
}
// el tablero crece: uno nuevo, la melodía en su sitio y un aviso
function ppMemCrece(r) {
  const M = PP_MEM, viejo = M.T.n;
  M.T = ppMemTablero(M.mundo, r); M.luces = {}; M.brillos = {};
  M.sec = PP_MEM_R.traduce(M.sec, viejo, M.T.mask, M.T.n);
  ppFxEntraSala(M.T); play('ppSala');
  ppFlota(tr('¡El tablero crece!'), 270, ppGeom(M.T.n).y - 30, '#ffd64a');
}
// una burbuja de la melodía: suena su nota con el instrumento del mundo y, si `ver`, se hunde (pop) y brilla; vuelve a subir sola
function ppMemLuz(i, dur, ver = true) {
  const M = PP_MEM, T = M.T;
  ppInstrumento(PP_MEM_R.instrumento(PP_CFG.memoria, M.mundo), ppMemNota(T, i), 0.13);
  if (!ver) return;   // Difícil: la melodía solo se oye
  ppPlop(PP_PENTA[i % PP_PENTA.length]);
  T.up[i] = 0; M.luces[i] = dur; M.brillos[i] = 1;
  PP_FX.celdas[i] = { t: 0, dir: 'pop', demora: 0 };
  ppVibra(10);
  const [cx, cy] = ppCentro(ppGeom(T.n), i);
  for (let k = 0; k < 6; k++) { const a = rand(0, Math.PI * 2), v = rand(70, 200); PP_FX.parts.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, r: rand(3, 6), t: 0, vida: rand(0.3, 0.5), col: ppColorBurbuja(i, T.n, 10) }); }
}
// las luces y los brillos se apagan con el tiempo
function ppMemApaga(M, dt) {
  for (const k in M.brillos) M.brillos[k] = Math.max(0, M.brillos[k] - dt * 2.2);
  for (const k in M.luces) {
    M.luces[k] -= dt;
    if (M.luces[k] <= 0) { delete M.luces[k]; M.T.up[k] = 1; PP_FX.celdas[k] = { t: 0, dir: 'sube', demora: 0 }; }
  }
}
// el reloj de la melodía (lo llama el bucle si no hay pausa)
function ppMemAvanza(dt) {
  const M = PP_MEM; if (!M) return;
  ppMemApaga(M, dt);
  if (M.fase === 'mira') ppMemEnsena(M, dt);
  else if (M.fase === 'toca') ppMemDuda(M, dt);
  else if (M.fase === 'bien') { M.reloj -= dt; if (M.reloj <= 0 && M.sec.length) ppMemRonda(); }
}
// Lola enseña la melodía, una burbuja cada paso
function ppMemEnsena(M, dt) {
  M.reloj -= dt; if (M.reloj > 0) return;
  const p = PP_MEM_R.paso(PP_CFG.memoria, M.aj.id, M.sec.length);
  if (M.sigue < M.sec.length) { ppMemLuz(M.sec[M.sigue], p * 0.6, M.aj.luces); M.sigue++; M.reloj = p; }
  else { M.fase = 'toca'; M.paso = 0; M.espera = 0; }
}
// Fácil: si dudas demasiado, la buena brilla un momento
function ppMemDuda(M, dt) {
  M.espera += dt;
  if (PP_MEM_R.tocaPista(M.aj, M.espera)) { M.brillos[M.sec[M.paso]] = 1; M.espera = 0; }
}
// tu toque: la siguiente de la melodía o se acaba
function ppMemToque(i) {
  const M = PP_MEM; if (!M || M.fase !== 'toca' || i < 0 || !M.T.mask[i]) return;
  ppLolaToque(); M.espera = 0;
  if (i !== M.sec[M.paso]) { ppMemFin(i); return; }
  ppMemLuz(i, 0.22); M.paso++;
  if (M.paso === M.sec.length) {
    M.fase = 'bien'; M.reloj = 1.0;
    const [cx] = ppCentro(ppGeom(M.T.n), i);
    ppFlota(M.sec.length % 5 === 0 ? tr('¡Increíble!') : tr('¡Bien!'), cx > 270 ? 340 : 200, ppGeom(M.T.n).y - 30, '#ffd64a');
    setTimeout(() => { if (PP_MEM === M) play('ppSala'); }, 250);
  }
}
// el récord de la dificultad y las monedas de hoy al acabar con `rondas`
function ppMemCobra(M, rondas) {
  const S = SAVE.memoria, C = PP_CFG.memoria, r = PP_MEM_R.conRecord(S, M.aj.id, rondas);
  Object.assign(S, r.cambios);
  S.partidas++;
  // el premio de hoy: solo lo que mejora tu mejor ronda del día, hasta el tope
  if (S.dia !== ppHoy()) { S.dia = ppHoy(); S.hoy = 0; }
  const cobra = n => Math.min(C.tope, n * C.porRonda);
  const monedas = Math.max(0, cobra(rondas) - cobra(S.hoy));
  if (rondas > S.hoy) S.hoy = rondas;
  SAVE.monedas += monedas;
  ppGuarda(); ppSubeMarcas();
  return { nuevo: r.nuevo, monedas, lleno: cobra(S.hoy) >= C.tope };
}
// un fallo: la burbuja buena parpadea para que veas cuál era, y sale el resultado
function ppMemFin(mala) {
  const M = PP_MEM; M.fase = 'fin';
  M.brillos[M.sec[M.paso]] = 1; M.falla = mala;
  PP_FX.temblor = Math.max(PP_FX.temblor, 0.5); ppVibra([30, 40, 30]);
  play('ppDano');
  const rondas = M.sec.length - 1, cobro = ppMemCobra(M, rondas);
  setTimeout(() => { if (PP_MEM === M) ppMemResultado(M, rondas, cobro); }, 1300);
}
// la ventana del resultado
function ppMemResultado(M, rondas, { nuevo, monedas, lleno }) {
  const S = SAVE.memoria, record = nuevo && rondas > 0;
  if (record) play('ppVictoria');
  const premio = monedas ? `<p class="pp-premio">+${ppMonedasHtml(monedas)}</p>`
    : lleno ? `<p class="pp-sub">${tr('Hoy ya tienes todas las monedas de Memoria. ¡Vuelve mañana!')}</p>`
      : rondas ? `<p class="pp-sub">${tr('Supera tu mejor ronda de hoy ({n}) para ganar más monedas.', { n: S.hoy })}</p>` : '';
  const t = ppAbre(`<h2>${record ? tr('¡Récord nuevo!') : tr('¡Uy, esa no era!')}</h2>
    <p class="pp-sub">${rondas === 1 ? tr('Has repetido 1 melodía.') : tr('Has repetido {n} melodías.', { n: rondas })}</p>
    ${premio}
    <p class="pp-sub">${tr('Tu récord en {dif}: {n}', { dif: tr(PP_MEM_DIF_NOMBRE[M.aj.id]), n: PP_MEM_R.recordDe(S, M.aj.id) })}</p>`);
  t.appendChild(ppBoton(tr('¡OTRA VEZ!'), 'pp-btn', () => { ppCierra(); ppNuevaMemoria(M.mundo, M.aj.id); }));
  t.appendChild(ppBoton(tr('Cambiar tablero'), 'pp-btn2 pp-sec', () => { ppCierra(); ppEligeMemoria(); }));
  t.appendChild(ppBoton(tr('Portada'), 'pp-btn2 pp-azul', () => { ppCierra(); ppSalMemoria(); }));
}
function ppSalMemoria() { PP_MEM = null; ppIrA('titulo'); }
/* ---------- dibujo ---------- */
function ppPintaMemoria(c, t) {
  const M = PP_MEM, T = M.T, g = ppGeom(T.n);
  c.save(); if (PP_FX.temblor > 0) c.translate(rand(-1, 1) * PP_FX.temblor * 5, rand(-1, 1) * PP_FX.temblor * 5);
  ppPintaFondo(c, PP_MUNDOS[M.mundo].fondo, t);
  // arriba: la ronda, el récord de esta dificultad y qué toca hacer
  c.fillStyle = 'rgba(255,255,255,0.6)'; c.beginPath(); c.roundRect(20, 18, 500, 150, 24); c.fill();
  ppTitulo(c, tr('MEMORIA'), 270, 66, 44);
  ppPintaMonedero(c, 28, 32);   // arriba a la izquierda: a la derecha va el botón de pausa
  ppTexto(c, tr('Ronda {n}', { n: M.sec.length }), 140, 126, 28, '#fff', 'center', '#c43a84');
  ppTexto(c, tr('Récord: {n}', { n: PP_MEM_R.recordDe(SAVE.memoria, M.aj.id) }), 400, 126, 28, '#fff', 'center', '#3a6ab8');
  ppMemPintaBrillos(c, M, g);
  ppPintaTablero(c, T, t);
  if (M.fase === 'fin') {
    const parpa = Math.sin(t * 14) > 0;
    const [bx, by] = ppCentro(g, M.sec[M.paso]);
    c.save(); c.lineWidth = 7; c.strokeStyle = parpa ? '#ffd64a' : '#fff'; c.beginPath(); c.arc(bx, by, g.celda * 0.46, 0, Math.PI * 2); c.stroke(); c.restore();
  }
  ppMemPintaPie(c, M, g);
  ppPintaEfectos(c, t);
  c.restore();
}
// el halo de cada burbuja que suena (y la buena que parpadea al fallar o como pista)
function ppMemPintaBrillos(c, M, g) {
  for (const k in M.brillos) {
    const b = M.brillos[k]; if (b <= 0.01) continue;
    const [cx, cy] = ppCentro(g, +k);
    c.save(); c.globalAlpha = b * 0.75; c.fillStyle = ppColorBurbuja(+k, M.T.n, 30);
    c.beginPath(); c.arc(cx, cy, g.celda * (0.5 + (1 - b) * 0.25), 0, Math.PI * 2); c.fill(); c.restore();
  }
}
// abajo: qué hacer ahora, y los puntitos de la melodía (cuántas llevas)
function ppMemPintaPie(c, M, g) {
  const txt = { mira: M.aj.luces ? tr('Mira y escucha…') : tr('Escucha bien…'), toca: tr('¡Te toca! Repite la melodía'), bien: tr('¡Muy bien!') }[M.fase] || tr('¡Uy! Era esta');
  ppTexto(c, txt, 270, g.y + g.lado + 56, 30, M.fase === 'toca' ? '#ffd64a' : '#fff', 'center', '#c43a84');
  const n = M.sec.length, paso = Math.min(22, 440 / Math.max(1, n)), x0 = 270 - ((n - 1) * paso) / 2, y = g.y + g.lado + 100;
  for (let k = 0; k < n; k++) {
    const hecho = M.fase === 'toca' ? k < M.paso : M.fase === 'mira' ? k < M.sigue : M.fase === 'bien';
    c.beginPath(); c.arc(x0 + k * paso, y, Math.min(8, paso * 0.38), 0, Math.PI * 2);
    c.fillStyle = hecho ? '#ffd64a' : 'rgba(255,255,255,0.75)'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#c43a84'; c.stroke();
  }
}
