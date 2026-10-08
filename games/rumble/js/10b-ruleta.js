// Fans of Rumble · Ruleta de la semana: Mítica (tu castigo + ventaja de la CPU) y Heroica (solo la ventaja de la CPU)
'use strict';
/* =========================================================
   v0.9.12: ruleta de la Mítica. v0.9.55: la Heroica gira solo la ruleta de la CPU (con su propia semilla,
   así su ventaja no tiene por qué coincidir con la de la Mítica). Las dos cambian cada lunes y son iguales para todo el mundo.
   ========================================================= */
const MYTH_DEB = [
  { id: 'recorte', short: 'Recorte', name: 'Recorte de presupuesto', desc: 'tu CAOS se recarga un 30 % más lento.' },
  { id: 'lag', short: 'Lag', name: 'Lag', desc: 'tus unidades van un 20 % más lentas.' },
  { id: 'parche', short: 'Parche', name: 'Parche sorpresa', desc: 'tus unidades tienen un 20 % menos de vida.' },
  { id: 'carga', short: 'Carga', name: 'Pantalla de carga', desc: 'tus cartas tardan 1,5 segundos más en entrar.' },
  { id: 'vacaciones', short: 'Sin líder', name: 'Líder de vacaciones', desc: 'tu líder tarda el doble en volver.' },
  { id: 'carton', short: 'Cartón', name: 'Torres de cartón', desc: 'tus torres y tu base tienen un 35 % menos de vida.' },
  { id: 'sincaos', short: 'Sin CAOS', name: 'Sin presupuesto', desc: 'empiezas cada partida sin CAOS.' },
  { id: 'becarios', short: 'Becarios', name: 'Becarios en prácticas', desc: 'tus unidades hacen un 20 % menos de daño.' },
];
const MYTH_BUF = [
  { id: 'horas', short: 'Horas extra', name: 'Horas extra', desc: 'sus unidades atacan un 30 % más rápido.' },
  { id: 'inversion', short: 'Inversión', name: 'Inversión millonaria', desc: 'la CPU gana CAOS un 30 % más rápido.' },
  { id: 'blindaje', short: 'Blindaje', name: 'Torres blindadas', desc: 'sus torres y su sede tienen un 40 % más de vida.' },
  { id: 'robots', short: 'Robots', name: 'Robots nuevos', desc: 'sus unidades tienen un 25 % más de vida.' },
  { id: 'torretas', short: 'Torretas', name: 'Torretas turbo', desc: 'sus torres disparan un 40 % más rápido.' },
  { id: 'bonus', short: 'Bonus', name: 'Bonus de productividad', desc: 'sus unidades hacen un 25 % más de daño.' },
  { id: 'despidos', short: 'Despidos', name: 'Despidos rentables', desc: 'cada unidad tuya que cae le da 1 de CAOS.' },
  { id: 'turbo', short: 'Turbo', name: 'Turbo', desc: 'sus unidades van un 25 % más rápido.' },
];
const NO_DEB = { id: '', short: '', name: '', desc: '' };   // la Heroica no te castiga: así los `M.deb.id === …` no se cumplen nunca
function mythicWeek() { const sd = seedOf('mitica-' + weekStr()); return { deb: MYTH_DEB[sd % MYTH_DEB.length], buf: MYTH_BUF[Math.floor(sd / 8) % MYTH_BUF.length] }; }
function heroicWeek() { const sd = seedOf('heroica-' + weekStr()); return { deb: NO_DEB, buf: MYTH_BUF[sd % MYTH_BUF.length] }; }
const weekMods = d => (d === 'x' ? heroicWeek() : mythicWeek());
const rlSeenKey = d => (d === 'x' ? 'rlWeekX' : 'rlWeek');
const rlPending = d => (d === 'm' || d === 'x') && SAVE[rlSeenKey(d)] !== weekStr();
function modRows(M) {
  return (M.deb.id ? `<div class="mod-row bad"><b>TU CASTIGO</b>${M.deb.name}: ${M.deb.desc}</div>` : '') + `<div class="mod-row good"><b>VENTAJA DE LA CPU</b>${M.buf.name}: ${M.buf.desc}</div>`;
}
function modBoxHtml(d) {
  const M = weekMods(d);
  return `<div class="mod-box"><div class="mod-head ol">${d === 'x' ? 'ESTA SEMANA EN HEROICA' : 'ESTA SEMANA EN MÍTICA'}<small>cambia en ${untilStr(true)}</small></div>${modRows(M)}<button class="chip-btn" id="btn-rl-again">VER LA RULETA</button></div>`;
}
const RL = { phase: 'p', ang: 0, spin: null, wk: null, d: 'm' };
function openRoulette(d) {
  RL.d = d === 'x' ? 'x' : 'm'; RL.wk = weekMods(RL.d); RL.phase = RL.d === 'x' ? 'c' : 'p'; RL.ang = 0; RL.spin = null;
  rlPhaseUi(false); $('#scr-roulette').hidden = false; drawRoulette();
}
function rlPhaseUi(done) {
  const p = RL.phase === 'p', r = $('#rl-res'), hero = RL.d === 'x';
  const q = RL.d === 'q';   // v0.9.71: partida rápida CEO, una ruleta nueva en cada partida
  $('#rl-title').textContent = q ? (p ? 'TU CASTIGO EN ESTA PARTIDA' : 'LA VENTAJA DE LA CPU') : p ? 'TU CASTIGO DE LA SEMANA' : hero ? 'LA VENTAJA DE LA CPU EN HEROICA' : 'LA VENTAJA DE LA CPU';
  $('#rl-sub').textContent = q ? (p ? 'Modo CEO: la ruleta de Microblizz gira en cada partida. Primero, tu castigo.' : 'Y ahora, el regalo de Microblizz para la CPU. ¡Suerte!') : p ? 'La ruleta de Microblizz decide cómo te complica la Mítica esta semana. Cambia cada lunes.' : hero ? 'En Heroica no hay castigo para ti, pero Microblizz le hace un regalo a la CPU. Cambia cada lunes.' : 'Y ahora, el regalo de Microblizz para la CPU.';
  r.className = 'rl-res ' + (p ? 'bad' : 'good');
  if (done) { const x = p ? RL.wk.deb : RL.wk.buf; r.innerHTML = `<b class="ol">${x.name}</b>${x.desc.charAt(0).toUpperCase() + x.desc.slice(1)}`; } else r.innerHTML = '';
  $('#btn-rl').textContent = !done ? '¡GIRAR!' : p ? 'SIGUIENTE' : '¡A JUGAR!';
  $('#btn-rl').disabled = false; $('#btn-rl-skip').hidden = !!done && !p;
  $('#btn-rl-skip').textContent = q ? 'No jugar' : 'Saltar la animación';
}
function rlClose(jugar) {
  if (RL.d === 'q') { RL.spin = null; $('#scr-roulette').hidden = true; play('select'); const f = RL.alAcabar; RL.alAcabar = null; if (jugar === true && f) f(); return; }   // CEO: «¡A JUGAR!» empieza la partida; «No jugar», no
  RL.spin = null; $('#scr-roulette').hidden = true; const k = rlSeenKey(RL.d); if (SAVE[k] !== weekStr()) { SAVE[k] = weekStr(); saveGame(); } play('select'); if (!$('#scr-camp').hidden) buildCamp(); }
$('#btn-rl').addEventListener('click', () => {
  if (RL.spin) return;
  if (!$('#rl-res').innerHTML) { rlSpin(); return; }
  if (RL.phase === 'p') { RL.phase = 'c'; RL.ang = 0; rlPhaseUi(false); drawRoulette(); play('select'); return; }
  rlClose(true);
});
$('#btn-rl-skip').addEventListener('click', () => rlClose(false));
function rlSpin() {
  if (RL.d !== 'q') stat('rlspin', 1);   // el logro es de la ruleta de la Mítica
  const list = RL.phase === 'p' ? MYTH_DEB : MYTH_BUF, TAU = Math.PI * 2, seg = TAU / list.length;
  const idx = list.indexOf(RL.phase === 'p' ? RL.wk.deb : RL.wk.buf), want = -(idx * seg + seg / 2);
  const from = RL.ang, to = from + ((((want - from) % TAU) + TAU) % TAU) + TAU * (REDUCED ? 1 : 5);
  RL.spin = { from, to, t0: performance.now(), dur: REDUCED ? 900 : 3800, last: Math.floor(from / seg) };
  $('#btn-rl').disabled = true; audioInit(); play('roll');
  requestAnimationFrame(rlFrame);
}
function rlFrame(now) {
  const sp = RL.spin; if (!sp || $('#scr-roulette').hidden) { RL.spin = null; return; }
  const k = Math.min(1, (now - sp.t0) / sp.dur), e = 1 - Math.pow(1 - k, 3), seg = Math.PI * 2 / (RL.phase === 'p' ? MYTH_DEB : MYTH_BUF).length;
  RL.ang = sp.from + (sp.to - sp.from) * e;
  const cur = Math.floor(RL.ang / seg); if (cur !== sp.last) { sp.last = cur; play('tick'); }
  drawRoulette();
  if (k < 1) { requestAnimationFrame(rlFrame); return; }
  RL.spin = null; rlPhaseUi(true); play(RL.phase === 'p' ? 'sad' : 'womp');
}
function drawRoulette() {
  const cv = $('#rl-cv'), R2 = 2, SZ = 300; if (cv.width !== SZ * R2) { cv.width = SZ * R2; cv.height = SZ * R2; }
  const c = cv.getContext('2d'); c.setTransform(R2, 0, 0, R2, 0, 0); c.clearRect(0, 0, SZ, SZ);
  const p = RL.phase === 'p', list = p ? MYTH_DEB : MYTH_BUF, n = list.length, seg = Math.PI * 2 / n, cx = 150, cy = 158, r = 124;
  const cols = p ? ['#ff6b6b', '#b0213a'] : RL.d === 'x' ? ['#ff9a3d', '#a8551a'] : ['#4f8dff', '#1d3f8a'];
  c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.arc(cx, cy + 6, r + 10, 0, Math.PI * 2); c.fill();
  c.fillStyle = OL; c.beginPath(); c.arc(cx, cy, r + 10, 0, Math.PI * 2); c.fill();
  c.fillStyle = p ? '#ffcb3d' : RL.d === 'x' ? '#ffd9a8' : '#9fd0ff'; c.beginPath(); c.arc(cx, cy, r + 6, 0, Math.PI * 2); c.fill();
  for (let i = 0; i < n; i++) {
    const a0 = -Math.PI / 2 + RL.ang + i * seg;
    c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, r, a0, a0 + seg); c.closePath(); c.fillStyle = cols[i % 2]; c.fill(); c.lineWidth = 2.5; c.strokeStyle = OL; c.stroke();
    c.save(); c.translate(cx, cy); c.rotate(a0 + seg / 2); c.textAlign = 'right'; c.textBaseline = 'middle';
    const txt = tr(list[i].short);
    let fs = 16; c.font = `${fs}px ${FONT_D}`; while (c.measureText(txt).width > r - 44 && fs > 9) { fs -= 1; c.font = `${fs}px ${FONT_D}`; }
    c.lineJoin = 'round'; c.lineWidth = 4; c.strokeStyle = OL; c.strokeText(txt, r - 10, 1); c.fillStyle = '#fff6ea'; c.fillText(txt, r - 10, 1); c.restore();
  }
  for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8, on = RL.spin ? (Math.floor(performance.now() / 120) + i) % 2 === 0 : i % 2 === 0; c.beginPath(); c.arc(cx + Math.cos(a) * (r + 6), cy + Math.sin(a) * (r + 6), 3, 0, Math.PI * 2); c.fillStyle = on ? '#fff6ea' : '#7a5310'; c.fill(); }
  c.beginPath(); c.arc(cx, cy, 24, 0, Math.PI * 2); c.fillStyle = '#ffcb3d'; c.fill(); c.lineWidth = 4; c.strokeStyle = OL; c.stroke();
  c.font = `11px ${FONT_D}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = OL; c.fillText(p ? tr('TÚ') : 'CPU', cx, cy + 1);
  c.beginPath(); c.moveTo(cx - 15, cy - r - 20); c.lineTo(cx + 15, cy - r - 20); c.lineTo(cx, cy - r + 8); c.closePath(); c.fillStyle = '#fff6ea'; c.fill(); c.lineWidth = 3.5; c.strokeStyle = OL; c.stroke();
}
