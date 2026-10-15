// Fans of Ratkov · CURARSE CON MINIJUEGO (opcional). Al usar una venda o un botiquín sale un panelito arriba (no tapa los mandos: puedes
// seguir andando). Si no lo tocas, la cura tarda lo de siempre; si lo haces bien, va más rápido y cura más.
// - VENDAR: da vueltas con el dedo (o el ratón) alrededor de la herida: dos vueltas y queda vendada (+5 de vida, «vendaje perfecto»).
// - COSER (botiquín): tres pasos (desinfectar, coser y tapar): toca cuando la marca pase por la zona verde. Cada acierto acorta la cura;
//   los tres, «cura de manual»: un 25 % más de vida.
// Si te dan mientras te curas, se corta (como siempre) y se te escapa la venda.
'use strict';
const CURA = { el: null, cv: null, g: null, u: null, t: 0 };
const PASOS_COSER = ['DESINFECTAR', 'COSER', 'TAPAR'];
function preparaCura() {
  if (CURA.el) return;
  const d = document.createElement('div'); d.id = 'm-cura'; d.hidden = true;
  d.innerHTML = '<canvas width="96" height="96"></canvas><b></b><small></small>';
  el('hud').appendChild(d); CURA.el = d; CURA.cv = d.querySelector('canvas'); CURA.g = CURA.cv.getContext('2d'); CURA.g.imageSmoothingEnabled = false;
  const punto = e => { const r = CURA.cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 96, (e.clientY - r.top) / r.height * 96]; };
  CURA.cv.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); try { CURA.cv.setPointerCapture(e.pointerId); } catch (x) { /* sin captura */ } const m = CURA.u && CURA.u.mini; if (!m) return;
    if (m.tipo === 'venda') { const [x, y] = punto(e); m.prev = Math.atan2(y - 48, x - 48); m.dedo = true; } else tocaCoser(); });
  CURA.cv.addEventListener('pointermove', e => { const m = CURA.u && CURA.u.mini; if (!m || m.tipo !== 'venda' || !m.dedo) return; e.preventDefault();
    const [x, y] = punto(e); if (Math.hypot(x - 48, y - 48) < 8) return;   // en el mismo centro no cuenta
    const a = Math.atan2(y - 48, x - 48); let d = a - m.prev; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; m.prev = a;
    m.giro += d; if (Math.abs(m.giro) >= m.necesita * 2 * Math.PI && !m.hecho) { m.hecho = true; CURA.u.perfecto = true; CURA.u.t = 0; play('cura'); vibra(30); } });
  for (const ev of ['pointerup', 'pointercancel']) CURA.cv.addEventListener(ev, () => { const m = CURA.u && CURA.u.mini; if (m) m.dedo = false; });
}
// lo llama usaObjeto al empezar a usar algo: solo la venda y el botiquín llevan minijuego
function empiezaCura(u) {
  preparaCura();
  if (u.id === 'venda') u.mini = { tipo: 'venda', giro: 0, prev: 0, necesita: 2, dedo: false };
  else if (u.id === 'botiquin') u.mini = { tipo: 'botiquin', paso: 0, marca: 0, dir: 1, zona: entre(0.25, 0.75), aciertos: 0, flash: 0, ok: false };
}
function tocaCoser() {
  const u = CURA.u, m = u && u.mini; if (!m || m.paso >= 3) return;
  const bien = Math.abs(m.marca - m.zona) <= 0.11;
  if (bien) { m.aciertos++; u.t = Math.max(0, u.t - u.max * 0.22); play('select'); vibra(20); } else { play('metal'); vibra([40, 30, 40]); }
  m.flash = 0.35; m.ok = bien; m.paso++; m.zona = entre(0.2, 0.8); m.dir = -m.dir;
  if (m.paso >= 3) { if (m.aciertos === 3) { u.perfecto = true; u.t = Math.min(u.t, 0.15); } }
}
// cada fotograma: el panel sigue a lo que estés usando
function avanzaCura(dt) {
  const u = JUG && JUG.uso, m = u && u.mini;
  if (!m) {
    if (CURA.u && CURA.u.mini && !CURA.u.terminado && CURA.u.mini.tipo === 'venda' && JUG && JUG.vivo && CURA.u.t > 0) avisa(tr('Se te ha escapado la venda.'), 'malo');
    CURA.u = null; if (CURA.el && !CURA.el.hidden) CURA.el.hidden = true; return;
  }
  if (CURA.u !== u) { CURA.u = u; CURA.el.hidden = false; }
  CURA.t += dt;
  const g = CURA.g; g.clearRect(0, 0, 96, 96);
  if (m.tipo === 'venda') {
    // el brazo con la herida y la venda que se va enrollando
    g.fillStyle = '#c99a70'; g.fillRect(30, 0, 36, 96); g.fillStyle = '#b08058'; g.fillRect(30, 0, 4, 96); g.fillRect(62, 0, 4, 96);
    g.fillStyle = '#8a1a1a'; g.fillRect(40, 40, 16, 14); g.fillStyle = '#d8303a'; g.fillRect(42, 42, 12, 10); if (Math.sin(CURA.t * 8) > 0) { g.fillStyle = '#d8303a'; g.fillRect(46, 54, 3, 6 + (CURA.t * 20) % 10); }
    const f = Math.min(1, Math.abs(m.giro) / (m.necesita * 2 * Math.PI));
    g.fillStyle = '#f0ece4'; for (let i = 0; i < Math.floor(f * 8); i++) { g.fillRect(28, 22 + i * 7, 40, 5); g.fillStyle = i % 2 ? '#f0ece4' : '#e0dcd2'; }
    g.strokeStyle = 'rgba(255,203,61,0.85)'; g.lineWidth = 3; g.beginPath(); g.arc(48, 48, 40, -Math.PI / 2, -Math.PI / 2 + f * 2 * Math.PI); g.stroke();
    CURA.el.querySelector('b').textContent = m.hecho ? tr('¡VENDAJE PERFECTO!') : tr('VENDAR');
    CURA.el.querySelector('small').textContent = m.hecho ? '' : tr('Da vueltas con el dedo o el ratón alrededor de la herida.');
  } else {
    // coser: una barra con la zona verde y la marca que va y viene
    if (m.paso < 3) { m.marca += m.dir * dt * 1.25; if (m.marca > 1) { m.marca = 1; m.dir = -1; } if (m.marca < 0) { m.marca = 0; m.dir = 1; } }
    m.flash = Math.max(0, m.flash - dt);
    g.fillStyle = '#1a2026'; g.fillRect(4, 40, 88, 16); g.fillStyle = '#2f6a2a'; g.fillRect(4 + (m.zona - 0.11) * 88, 40, 0.22 * 88, 16);
    g.fillStyle = m.flash > 0 ? (m.ok ? '#7ee04a' : '#ff4b5c') : '#ffcb3d'; g.fillRect(4 + m.marca * 88 - 2, 34, 4, 28);
    for (let i = 0; i < 3; i++) { g.fillStyle = i < m.paso ? '#7ee04a' : '#3a444c'; g.fillRect(22 + i * 22, 70, 14, 14); }
    g.fillStyle = '#d8303a'; g.fillRect(40, 8, 16, 18); g.fillStyle = '#fff'; g.fillRect(46, 10, 4, 14); g.fillRect(41, 15, 14, 4);
    CURA.el.querySelector('b').textContent = m.paso >= 3 ? (m.aciertos === 3 ? tr('¡CURA DE MANUAL!') : tr('CURANDO…')) : tr(PASOS_COSER[m.paso]);
    CURA.el.querySelector('small').textContent = m.paso >= 3 ? '' : tr('Toca cuando la marca pase por lo verde.');
  }
}
