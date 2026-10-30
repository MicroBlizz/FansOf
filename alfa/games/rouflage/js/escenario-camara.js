// Fans of Rouflage · MI ESCENARIO (la cámara y los dedos): la cámara mira a un punto del mapa con un zoom (MIESC.cam); al pasear sigue a tu
// galleta, como en la partida. Al pasear, un dedo arrastrado lleva la galleta con una palanca (escenario-palanca.js); si no, un dedo en el suelo arrastra la vista (o el mueble que tocas, o pinta en PINTAR); dos dedos (o la rueda, o
// los botones + y −) hacen zoom; tocar sin arrastrar va andando (PASEAR), suelta el mueble marcado o abre el armario. Al llevar un mueble
// cerca del borde, la vista se mueve sola. Va después de escenario.js.
'use strict';
MIESC.toques = new Map(); MIESC.area = { x0: 0, y0: 0, x1: 320, y1: 480 }; MIESC.pinza = null; MIESC.ptCli = null;
function escAjusta() {
  if (!MIESC.abierto) return;
  const cv = E('esc-lienzo'), W = window.innerWidth, H = window.innerHeight, dpr = Math.min(2, typeof dprGraficos === 'function' ? dprGraficos() : (window.devicePixelRatio || 1));
  cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  const paseo = E('p-escenario').classList.contains('paseando');      // al pasear no hay bandeja: todo el mapa
  const pr = E('esc-panel').getBoundingClientRect(), lado = !paseo && pr.left > W / 2;      // la bandeja abajo (móvil) o a la derecha (pantalla ancha)
  const arriba = E('esc-arriba').getBoundingClientRect().bottom + 4, abajo = paseo ? H : lado ? H : pr.top, der = lado ? pr.left : W;
  MIESC.area = { x0: 0, y0: arriba, x1: der, y1: abajo }; Object.assign(MIESC.vista, { dpr, lado });
  const z = E('esc-zoom'), hueco = abajo - arriba - 16;      // + − y centrar: en columna; si no caben (apaisado bajo), en fila, y si tampoco, más pequeños
  z.classList.toggle('fila', hueco < 3 * 44 + 2 * 7); z.classList.toggle('mini', hueco < 44);
  z.style.right = (W - der + 10) + 'px'; z.style.bottom = (H - abajo + (hueco < 44 ? 6 : 12)) + 'px';
  MIESC.sucio = true;
}
// el zoom de partida (se ven unas 520 unidades a lo ancho en el móvil) y los topes: de ver casi todo el mapa a ver muy de cerca
function escZoomBase() { const a = MIESC.area, w = a.x1 - a.x0, h = a.y1 - a.y0; return limita(Math.min(w / 520, h / 440), 0.6, 1.25); }
function escZoomTopes() { const a = MIESC.area, M = escMundoAct(); return [Math.max(0.18, Math.min((a.x1 - a.x0) / M.W, (a.y1 - a.y0) / M.H) * 0.92), MIESC.modo === 'pintar' ? 7 : 3]; }      // al pintar, mucho más cerca (el píxel a píxel)
function escVista() {
  const a = MIESC.area, c = MIESC.cam, v = MIESC.vista, k = c.z || escZoomBase(), d = v.dpr || 1;
  v.k = k; v.ox = Math.round(((a.x0 + a.x1) / 2 - c.x * k) * d) / d; v.oy = Math.round(((a.y0 + a.y1) / 2 - c.y * k) * d) / d;
  return v;
}
// de la pantalla al mundo
function escAMundo(e) { const v = escVista(); return { x: (e.clientX - v.ox) / v.k, y: (e.clientY - v.oy) / v.k }; }
// sin enseñar mucho más allá del mapa
function escCamLimita() {
  const a = MIESC.area, c = MIESC.cam, M = escMundoAct(), [z0, z1] = escZoomTopes(); c.z = limita(c.z || escZoomBase(), z0, z1);
  const hw = (a.x1 - a.x0) / 2 / c.z, hh = (a.y1 - a.y0) / 2 / c.z, m = 50;
  c.x = hw * 2 >= M.W + m * 2 ? M.W / 2 : limita(c.x, hw - m, M.W - hw + m);
  c.y = hh * 2 >= M.H + m * 2 ? M.H / 2 : limita(c.y, hh - m, M.H - hh + m);
}
function escCamaraAvanza(dt) {
  const c = MIESC.cam, x = c.x, y = c.y, z = c.z, yo = MIESC.yo;
  if (!c.z) c.z = escZoomBase();
  if (MIESC.modo === 'pasear' && c.sigue && yo) { const k = Math.min(1, dt * 6); c.x += (yo.x - c.x) * k; c.y += (yo.y - 30 - c.y) * k; }
  if (MIESC.modo !== 'pasear') {      // las flechas mueven la vista
    const K = MIESC.teclas, v = 620 * dt / c.z;
    if (K.has('ArrowLeft') || K.has('a')) c.x -= v; if (K.has('ArrowRight') || K.has('d')) c.x += v; if (K.has('ArrowUp') || K.has('w')) c.y -= v; if (K.has('ArrowDown') || K.has('s')) c.y += v;
  }
  const lleva = MIESC.drag || (MIESC.arrastra && MIESC.arrastra.ya), p = MIESC.ptCli, a = MIESC.area;
  if (lleva && p && p.x >= a.x0 && p.x <= a.x1 && p.y >= a.y0 && p.y <= a.y1) {      // un mueble cerca del borde: la vista va hacia allí
    const B = 46, v = 520 * dt / c.z;
    const vx = p.x < a.x0 + B ? -1 : p.x > a.x1 - B ? 1 : 0, vy = p.y < a.y0 + B ? -1 : !MIESC.arrastra && p.y > a.y1 - B ? 1 : 0;
    if (vx || vy) {
      c.x += vx * v; c.y += vy * v; c.sigue = false; escCamLimita();
      const q = escAMundo({ clientX: p.x, clientY: p.y - (MIESC.arrastra && MIESC.arrastra.toque ? 36 : 0) });
      if (MIESC.drag) escArrastra(q); else MIESC.puntero = q;
    }
  }
  escCamLimita();
  return c.x !== x || c.y !== y || c.z !== z;
}
// zoom con el punto (sx, sy) de la pantalla quieto
function escZoom(f, sx, sy) {
  const a = MIESC.area, c = MIESC.cam; if (sx === undefined) { sx = (a.x0 + a.x1) / 2; sy = (a.y0 + a.y1) / 2; }
  const w = escAMundo({ clientX: sx, clientY: sy }), [z0, z1] = escZoomTopes();
  c.z = limita((c.z || escZoomBase()) * f, z0, z1);
  c.x = w.x - (sx - (a.x0 + a.x1) / 2) / c.z; c.y = w.y - (sy - (a.y0 + a.y1) / 2) / c.z;
  if (MIESC.modo !== 'pasear') c.sigue = false;
  escCamLimita(); MIESC.sucio = true;
}
function escCentra() { const yo = MIESC.yo; if (!yo) return; Object.assign(MIESC.cam, { x: yo.x, y: yo.y - 30, sigue: true }); escCamLimita(); MIESC.sucio = true; play('tick'); }

/* ---------- los dedos en el lienzo ---------- */
function escPinzaDatos() { const [a, b] = [...MIESC.toques.values()]; return { d: Math.max(20, Math.hypot(a.x - b.x, a.y - b.y)), x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; }
function escPinzaEmpieza() {
  for (const t of MIESC.toques.values()) {      // lo que hacía el primer dedo se deshace
    if (t.pinta) { escPincelCancela(); t.pinta = false; }
    if (t.obra) { obraCancela(); t.obra = false; }
    if (t.mueble && MIESC.drag) { const d = MIESC.drag; d.m.x = d.x0; d.m.y = d.y0; MIESC.drag = null; t.mueble = false; }
    t.pan = false; t.palanca = false;
  }
  if (MIESC.palanca) escPalancaSuelta();
  const q = escPinzaDatos(); MIESC.pinza = { d0: q.d, z0: MIESC.cam.z || escZoomBase(), w: escAMundo({ clientX: q.x, clientY: q.y }) };
  MIESC.puntero = null; MIESC.sucio = true;
}
function escPinzaMueve() {
  const q = escPinzaDatos(), P = MIESC.pinza, a = MIESC.area, c = MIESC.cam, [z0, z1] = escZoomTopes();
  c.z = limita(P.z0 * q.d / P.d0, z0, z1);
  c.x = P.w.x - (q.x - (a.x0 + a.x1) / 2) / c.z; c.y = P.w.y - (q.y - (a.y0 + a.y1) / 2) / c.z;
  c.sigue = false; escCamLimita(); MIESC.sucio = true;
}
function escAbajo(e) {
  try { E('esc-lienzo').setPointerCapture(e.pointerId); } catch (_) { /* sin captura */ }
  MIESC.toques.set(e.pointerId, { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, movido: false });
  MIESC.ptCli = { x: e.clientX, y: e.clientY };
  if (MIESC.toques.size === 2) { escPinzaEmpieza(); return; }
  if (MIESC.toques.size > 2) return;
  const t = MIESC.toques.get(e.pointerId), p = escAMundo(e); MIESC.puntero = p; MIESC.sucio = true;
  if (e.button === 1 || e.button === 2) { t.pan = true; t.movido = true; return; }      // la rueda o el botón derecho: siempre mueven la vista
  if (MIESC.modo === 'pintar') { t.pinta = true; escPincelAbajo(p); return; }
  if (MIESC.modo === 'obra') { t.obra = true; obraAbajo(p); return; }      // CONSTRUIR (escenario-obra.js)
  if (MIESC.modo === 'pegar') { t.pan = true; t.pegar = true; return; }      // PEGATINAS: al soltar sin arrastrar se pega (escenario-pegatinas.js)
  if (MIESC.modo === 'decorar') { const m = escMuebleEn(p); if (m) { escEmpiezaArrastre(m, p); if (e.pointerType !== 'mouse') MIESC.drag.levanta = 34 / (MIESC.cam.z || 1); t.mueble = true; play('tick'); return; } }
  if (MIESC.modo === 'pasear') { t.palanca = true; return; }      // PASEAR: arrastrar lleva la galleta (escenario-palanca.js)
  t.pan = true;
}
function escMueve(e) {
  const t = MIESC.toques.get(e.pointerId), p = escAMundo(e);
  MIESC.ptCli = { x: e.clientX, y: e.clientY };
  if (!t) { if (e.pointerType === 'mouse') { MIESC.puntero = p; if (MIESC.modo === 'pintar') MIESC.sucio = true; } return; }
  const dx = e.clientX - t.x, dy = e.clientY - t.y; t.x = e.clientX; t.y = e.clientY;
  if (MIESC.pinza) { escPinzaMueve(); return; }
  MIESC.puntero = p;
  if (t.pinta) { escPincelMueve(p); MIESC.sucio = true; return; }
  if (t.obra) { obraMueve(p); return; }
  if (t.mueble) { escArrastra(p); return; }
  if (t.palanca) { if (!t.movido && Math.hypot(e.clientX - t.x0, e.clientY - t.y0) < 10) return; t.movido = true; escPalancaMueve(t, e.clientX, e.clientY); return; }
  if (t.pan) {
    if (!t.movido && Math.hypot(e.clientX - t.x0, e.clientY - t.y0) < 9) return;
    t.movido = true;
    const c = MIESC.cam; c.x -= dx / c.z; c.y -= dy / c.z; c.sigue = false; escCamLimita(); MIESC.sucio = true;
  }
}
function escArriba(e) {
  const t = MIESC.toques.get(e.pointerId); MIESC.toques.delete(e.pointerId);
  if (MIESC.pinza) {
    if (MIESC.toques.size < 2) { MIESC.pinza = null; for (const q of MIESC.toques.values()) { q.pan = true; q.movido = true; } }
    return;
  }
  if (!t) return;
  if (t.pinta) escPincelArriba();
  if (t.obra) obraArriba();
  if (t.mueble) escSuelta();
  if (t.palanca && MIESC.palanca) escPalancaSuelta();
  if (t.pegar && !t.movido && e.type === 'pointerup') { pegToca(escAMundo(e)); MIESC.sucio = true; return; }
  if ((t.pan || t.palanca) && !t.movido && e.type === 'pointerup') escToca(escAMundo(e));
  if (e.pointerType !== 'mouse') MIESC.puntero = null;
  MIESC.sucio = true;
}
// tocar sin arrastrar: el armario se abre (en PASEAR, vas andando hasta él); al pasear, vas andando; al decorar, se suelta el marcado
function escToca(p) {
  if (escEnArmario(p)) {
    if (MIESC.modo !== 'pasear' || MIESC.cerca) escAbreArmario();
    else { const a = escMundoAct().armario; escVaA(a.x, a.y + 34, true); }
    return;
  }
  if (MIESC.modo === 'pasear') { escVaA(p.x, p.y); return; }
  if (MIESC.modo === 'decorar' && MIESC.sel) { MIESC.sel = null; play('tick'); }
}

function preparaCamaraEsc() {
  const cv = E('esc-lienzo');
  cv.addEventListener('pointerdown', escAbajo); cv.addEventListener('pointermove', escMueve);
  cv.addEventListener('pointerup', escArriba); cv.addEventListener('pointercancel', escArriba);
  cv.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' && !MIESC.toques.size && !MIESC.arrastra) { MIESC.puntero = null; MIESC.sucio = true; } });
  cv.addEventListener('contextmenu', e => e.preventDefault());
  cv.addEventListener('wheel', e => { e.preventDefault(); escZoom(Math.exp(-limita(e.deltaY, -120, 120) * 0.0022), e.clientX, e.clientY); }, { passive: false });
  E('b-esc-mas').onclick = () => { play('tick'); escZoom(1.3); };
  E('b-esc-menos').onclick = () => { play('tick'); escZoom(1 / 1.3); };
  E('b-esc-yo').onclick = escCentra;
  window.addEventListener('resize', () => { escAjusta(); escCamLimita(); });
  window.addEventListener('keydown', e => {
    if (!MIESC.abierto || e.target.tagName === 'INPUT') return; const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (/^(Arrow|[wasd]$)/.test(k)) { MIESC.teclas.add(k); e.preventDefault(); }
    else if (k === '+' || k === '=') escZoom(1.2);
    else if (k === '-') escZoom(1 / 1.2);
    else if (MIESC.modo === 'pintar' && (e.ctrlKey || e.metaKey) && k === 'z') { escDeshace(); e.preventDefault(); }
    else if (k === 'Escape' && MIESC.sel) { MIESC.sel = null; MIESC.sucio = true; }
    else if ((k === 'Delete' || k === 'Backspace') && MIESC.sel) escAccionSel('quitar');
  });
  window.addEventListener('keyup', e => { const k = e.key.length === 1 ? e.key.toLowerCase() : e.key; MIESC.teclas.delete(k); });
}
