// Fans of Rouflage · MI ESCENARIO (el editor): tu sala, a pantalla completa. Abajo, la BANDEJA (escenario-bandeja.js) con sus pestañas:
// Muebles, Plantas, Decoración (arrastras la tarjeta al suelo, o la tocas y tocas el suelo), Escenario (la sala vacía) y Pintar
// (escenario-pincel.js). Al tocar un mueble puesto sale su burbuja (mover, voltear, color, quitar). Arriba, PASEAR: tu galleta, vestida con
// lo del armario, anda por la sala. Se guarda solo en SAVE.escenario ({ id, m: [[mueble, x, y, variante, volteado]], p: la pintura en texto});
// la nube ya sube SAVE. El dibujo es de escenario-pinta.js: el fondo va en caché y solo se repinta al cambiar algo.
'use strict';
const MIESC = { abierto: false, modo: 'decorar', tab: 'muebles', sala: null, sel: null, poner: null, drag: null, sucio: true, vista: { ox: 0, oy: 0, k: 1, dpr: 1 },
  yo: null, dest: null, teclas: new Set(), ropa: null, t: 0, ult: 0, puntero: null, avisoT: 0, pops: [], chispas: [] };
Object.assign(ICONOS, {
  mueble: '<path d="M7 3.5h10v8H7z"/><path d="M5 11.5h14v3H5zM6.5 14.5V21M17.5 14.5V21"/>',
  planta: '<path d="M12 21v-8"/><path d="M12 13c-5 0-7-3-7-8 4 0 7 2 7 8zM12 11c0-4 2-7 7-7 0 5-3 7-7 7z" fill="currentColor"/><path d="M8 21h8"/>',
  deco: '<path d="M12 3l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.4l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8z"/>',
  goma: '<path d="M14.5 4.5l5 5-9 9H6l-2.5-2.5z"/><path d="M9.5 9.5l5 5" /><path d="M10.5 18.5H20"/>',
  voltear: '<path d="M12 3v18" stroke-dasharray="2 2.6"/><path d="M9 7 3.5 17H9zM15 7l5.5 10H15z" fill="currentColor"/>',
  quitar: '<path d="M4.5 6.5h15M9.5 6.5V4h5v2.5"/><path d="M6.5 6.5l1 13.5h9l1-13.5M10 10v6.5M14 10v6.5"/>',
  paleta: '<path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.4 0 1.8-1 1.4-2-.5-1.3.3-2.5 1.7-2.5h2.2a3.2 3.2 0 0 0 3.2-3.2C20.5 7.6 16.7 3.5 12 3.5z"/><circle cx="8" cy="10" r="1.3" fill="currentColor"/><circle cx="12" cy="7.5" r="1.3" fill="currentColor"/><circle cx="16" cy="10" r="1.3" fill="currentColor"/>',
  escoba: '<path d="M19 3l-7 8"/><path d="M12.5 10.5l3 3-2 6.5c-3.5.3-7.5-1.4-10-4.5l5-4z"/><path d="M8 15.5l-2 2.5M11 17l-1.5 2.5"/>',
  bolsa: '<path d="M5 8h14l-1.2 12.5H6.2z"/><path d="M9 10.5V7a3 3 0 0 1 6 0v3.5"/>',
  sala: '<path d="M3.5 20.5V9l8.5-5.5L20.5 9v11.5z"/><path d="M9.5 20.5v-6h5v6"/>',
  hecho: '<path d="M5 12.5l4.5 4.5L19 7.5" stroke-width="3.2"/>',
});

/* ---------- la sala del jugador ---------- */
const escTiene = (cat, id) => { const it = arItem(cat, id); return !!it && arTiene(cat, it); };
function escenarioActual() { const s = SAVE.escenario; return s && ESCENARIOS[s.id] && escTiene('escenarios', s.id) ? s.id : 'oficina'; }
// lo de dentro (para dibujar y editar), hecho de SAVE.escenario una vez por apertura; lo que ya no es tuyo no sale
function escenarioSala() {
  if (MIESC.sala) return MIESC.sala;
  const s = SAVE.escenario || {}, d = salaDeDatos({ e: escenarioActual(), m: s.m || [] }) || { id: 'oficina', muebles: [] };
  d.muebles = d.muebles.filter(m => escTiene('muebles', m.id));
  let p = null; try { p = s.p ? pinturaDecodifica(s.p) : null; } catch (_) { p = null; }
  d.pint = !p ? pinturaNueva() : p.r === SALA.PR ? p : pinturaRemuestra(p, SALA.PR);
  return (MIESC.sala = d);
}
function escGuarda() {
  const sala = escenarioSala();
  let p = pinturaCodifica(sala.pint); if (p.length > 30000) p = pinturaCodifica(pinturaRemuestra(sala.pint, 4));      // la partida no engorda: como mucho ~30 KB de pintura
  SAVE.escenario = { id: sala.id, m: sala.muebles.map(m => [m.id, Math.round(m.x), Math.round(m.y), m.v || 0, m.f ? 1 : 0]), p };
  guardaPartida();
}

/* ---------- abrir, cerrar y el bucle ---------- */
function abreEscenario(conMueble) {
  MIESC.sala = null; escenarioSala(); MIESC.abierto = true; MIESC.sel = null; MIESC.poner = null; MIESC.drag = null; MIESC.dest = null;
  MIESC.ropa = ropaDe(); MIESC.yo = { x: (SALA.X0 + SALA.X1) / 2, y: SALA.Y1 - 40, dir: 1, anda: 0 };
  pantalla('p-escenario'); escModo(MIESC.modo === 'pasear' ? 'decorar' : MIESC.modo, true); musica('rfTitulo');
  if (conMueble) { const it = arItem('muebles', conMueble); if (it) { MIESC.tab = MUEBLES_SALA[it.id].g; escModo('decorar', true); MIESC.poner = it; escAviso(tr('Toca el suelo para ponerlo')); escBandeja(); } }
  cancelAnimationFrame(MIESC.raf); MIESC.ult = performance.now(); MIESC.raf = requestAnimationFrame(escBucle);
}
function cierraEscenario() { MIESC.abierto = false; cancelAnimationFrame(MIESC.raf); E('esc-burbuja').hidden = true; play('select'); irTitulo(); }
const escenarioAbierto = () => MIESC.abierto;
function escAjusta() {
  if (!MIESC.abierto) return;
  const cv = E('esc-lienzo'), W = window.innerWidth, H = window.innerHeight, dpr = Math.min(2, typeof dprGraficos === 'function' ? dprGraficos() : (window.devicePixelRatio || 1));
  cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  const pr = E('esc-panel').getBoundingClientRect(), lado = pr.left > W / 2;      // la bandeja abajo (móvil) o a la derecha (pantalla ancha)
  const arriba = E('esc-arriba').getBoundingClientRect().bottom + 6, abajo = lado ? H - 10 : pr.top - 8, ancho = lado ? pr.left - 12 : W - 12;
  const ah = Math.max(120, abajo - arriba), k = Math.min(ancho / SALA.W, ah / SALA.H);
  Object.assign(MIESC.vista, { k, dpr, lado, ox: 6 + (ancho - SALA.W * k) / 2, oy: arriba + (ah - SALA.H * k) / 2 });
  MIESC.sucio = true;
}
function escBucle(ahora) {
  if (!MIESC.abierto) return;
  const dt = Math.min(0.05, (ahora - MIESC.ult) / 1000 || 0); MIESC.ult = ahora; MIESC.t += dt;
  MIESC.pops = MIESC.pops.filter(p => MIESC.t - p.t0 < 0.35);
  for (const q of MIESC.chispas) { q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 260 * dt; q.vida -= dt; }
  MIESC.chispas = MIESC.chispas.filter(q => q.vida > 0);
  const anima = MIESC.modo === 'pasear' || MIESC.pops.length || MIESC.chispas.length || (ESCENARIOS[escenarioSala().id] || {}).zumbido;
  if (MIESC.modo === 'pasear') escAnda(dt);
  if (MIESC.sucio || anima) { escDibuja(); MIESC.sucio = false; }
  if (MIESC.avisoT && ahora > MIESC.avisoT) { MIESC.avisoT = 0; E('esc-aviso').classList.remove('ve'); }
  MIESC.raf = requestAnimationFrame(escBucle);
}
// ¿cabe aquí? Dentro del suelo y sin pisar a otro mueble (el que se mueve no cuenta)
function escCabe(m) {
  const T = TIPOS_MUEBLE[MUEBLES_SALA[m.id].t];
  return !escenarioSala().muebles.some(o => {
    if (o === m || o === MIESC.drag?.m) return false;
    const U = TIPOS_MUEBLE[MUEBLES_SALA[o.id].t];
    return m.x - T.w / 2 < o.x + U.w / 2 - 2 && m.x + T.w / 2 > o.x - U.w / 2 + 2 && m.y - T.d < o.y - 2 && m.y > o.y - U.d + 2;
  });
}
// la rejilla suave y la huella (verde si cabe, roja si no) del mueble que estás colocando
function escPintaHuella(c, m, cabe) {
  const T = TIPOS_MUEBLE[MUEBLES_SALA[m.id].t], gx = Math.round(m.x / CEL) * CEL, gy = Math.round(m.y / CEL) * CEL;
  c.save(); c.beginPath(); c.rect(SALA.X0, SALA.PY, SALA.X1 - SALA.X0, SALA.Y1 - SALA.PY); c.clip();
  const gr = c.createRadialGradient(m.x, m.y - T.d / 2, 10, m.x, m.y - T.d / 2, 110); gr.addColorStop(0, 'rgba(255,246,234,0.35)'); gr.addColorStop(1, 'rgba(255,246,234,0)');
  c.strokeStyle = gr; c.lineWidth = 1.2; c.beginPath();
  for (let x = gx - 120; x <= gx + 120; x += CEL) { c.moveTo(x, gy - 120); c.lineTo(x, gy + 120); }
  for (let y = gy - 120; y <= gy + 120; y += CEL) { c.moveTo(gx - 120, y); c.lineTo(gx + 120, y); }
  c.stroke(); c.restore();
  c.fillStyle = cabe ? 'rgba(126,224,74,0.35)' : 'rgba(255,75,92,0.4)'; c.strokeStyle = cabe ? '#7ee04a' : '#ff4b5c'; c.lineWidth = 2.5;
  c.beginPath(); rrPathRF(c, m.x - T.w / 2 - 3, m.y - T.d, T.w + 6, T.d + 4, 6); c.fill(); c.stroke();
}
function escDibuja() {
  const cv = E('esc-lienzo'), c = cv.getContext('2d'), { k, dpr, ox, oy } = MIESC.vista, sala = escenarioSala();
  c.setTransform(1, 0, 0, 1, 0, 0);
  const g = c.createRadialGradient(cv.width / 2, cv.height * 0.4, 0, cv.width / 2, cv.height * 0.4, Math.max(cv.width, cv.height) * 0.7);
  g.addColorStop(0, '#24304c'); g.addColorStop(1, '#0b0f1c'); c.fillStyle = g; c.fillRect(0, 0, cv.width, cv.height);
  c.setTransform(dpr * k, 0, 0, dpr * k, dpr * ox, dpr * oy);
  c.fillStyle = 'rgba(0,0,0,0.35)'; c.beginPath(); rrPathRF(c, 6, 10, SALA.W, SALA.H, 14); c.fill();      // la sala flota un poco sobre el fondo
  const pers = MIESC.modo === 'pasear' && MIESC.yo ? [{ y: MIESC.yo.y, pinta: escPintaYo }] : [];
  const kc = Math.max(0.25, Math.min(3, Math.round(k * dpr * 4) / 4)), d = MIESC.drag;
  if (d && d.movido) escPintaHuella(c, d.m, escCabe(d.m));
  const pops = {}; for (const p of MIESC.pops) { const q = (MIESC.t - p.t0) / 0.35; pops[sala.muebles.indexOf(p.m)] = 1 + Math.sin(q * Math.PI) * 0.22 * (1 - q); }
  salaPinta(c, sala, { k: kc, personajes: pers, sel: MIESC.modo === 'decorar' ? MIESC.sel : null, t: MIESC.t, pops });
  escPintaChispas(c);
  const pt = MIESC.puntero;
  if (MIESC.modo === 'decorar' && MIESC.poner && pt && escEnSuelo(pt)) {      // el mueble que vas a poner, en fantasma con su huella
    const M = MUEBLES_SALA[MIESC.poner.id], s = muebleSprite(M.t, 0, kc), m = escLimita({ id: MIESC.poner.id, x: pt.x, y: pt.y });
    escPintaHuella(c, m, escCabe(m));
    c.globalAlpha = 0.7; c.drawImage(s.cv, m.x - s.ox, m.y - s.oy, s.w, s.h); c.globalAlpha = 1;
  }
  if (MIESC.modo === 'pintar' && pt && typeof escPintaCursor === 'function') escPintaCursor(c, pt);
  if (MIESC.modo === 'pasear' && MIESC.dest) { c.strokeStyle = 'rgba(255,246,234,0.8)'; c.lineWidth = 2.5; c.beginPath(); c.ellipse(MIESC.dest.x, MIESC.dest.y, 11, 5, 0, 0, TAU); c.stroke(); }
  escColocaBurbuja();
}
// las chispas al poner un mueble (estrellitas de colores) o el polvo al quitarlo
function escChispas(m, polvo) {
  const T = TIPOS_MUEBLE[MUEBLES_SALA[m.id].t], cy = m.y - Math.min(30, (T.d + T.h) / 2);
  for (let i = 0; i < (polvo ? 9 : 12); i++) {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * (polvo ? 3 : 2.6), v = (polvo ? 50 : 120) + Math.random() * 90;
    MIESC.chispas.push({ x: m.x + (Math.random() - 0.5) * T.w * 0.6, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (polvo ? 0 : 40), vida: 0.5 + Math.random() * 0.35, max: 0.85,
      col: polvo ? '#cdb9ea' : ['#ffcb3d', '#ff6fb5', '#39d5e8', '#7ee04a', '#fff6ea'][i % 5], r: polvo ? 5 + Math.random() * 4 : 3 + Math.random() * 2.5, polvo });
  }
}
function escPintaChispas(c) {
  for (const q of MIESC.chispas) {
    c.globalAlpha = Math.min(1, q.vida / 0.3);
    if (q.polvo) { c.fillStyle = q.col; c.beginPath(); c.arc(q.x, q.y, q.r * (1.6 - q.vida), 0, TAU); c.fill(); continue; }
    c.beginPath(); starPath(c, q.x, q.y, q.r * 1.7, q.r * 0.75); c.fillStyle = q.col; c.fill(); c.lineWidth = 1.4; c.strokeStyle = OL; c.stroke();
  }
  c.globalAlpha = 1;
}
function escAviso(txt) { const a = E('esc-aviso'); a.textContent = txt; a.classList.add('ve'); MIESC.avisoT = performance.now() + 2600; }

/* ---------- tocar la sala ---------- */
function escAMundo(e) { const v = MIESC.vista; return { x: (e.clientX - v.ox) / v.k, y: (e.clientY - v.oy) / v.k }; }
const escEnSuelo = p => p.x >= SALA.X0 && p.x <= SALA.X1 && p.y >= SALA.PY - 10 && p.y <= SALA.Y1 + 10;
// el mueble dentro del suelo (su base siempre en el suelo; de alto puede tapar la pared)
function escLimita(m) {
  const T = TIPOS_MUEBLE[MUEBLES_SALA[m.id].t];
  m.x = limita(m.x, SALA.X0 + T.w / 2 + 2, SALA.X1 - T.w / 2 - 2); m.y = limita(m.y, SALA.PY + Math.min(T.d, 24) + 2, SALA.Y1 - 2); return m;
}
function escMuebleEn(p) {
  const lista = escenarioSala().muebles.slice().sort((a, b) => b.y - a.y);
  return lista.find(m => { const T = TIPOS_MUEBLE[MUEBLES_SALA[m.id].t]; return p.x > m.x - T.w / 2 - 6 && p.x < m.x + T.w / 2 + 6 && p.y > m.y - (T.tope || T.d + T.h) - 6 && p.y < m.y + 8; }) || null;
}
// pone un mueble nuevo (si cabe): con su «pop» y marcado
function escPon(it, p) {
  const sala = escenarioSala();
  if (sala.muebles.length >= SALA.MAX_MUEBLES) { play('deny'); escAviso(tr('Ya no caben más muebles: quita alguno')); return null; }
  const m = escLimita({ id: it.id, x: p.x, y: p.y, v: 0, f: 0 });
  if (!escCabe(m)) { play('deny'); escAviso(tr('Ahí no cabe: busca un hueco libre')); return null; }
  sala.muebles.push(m); MIESC.pops.push({ m, t0: MIESC.t }); escChispas(m); MIESC.sel = m; play('pop'); escGuarda(); escBandeja(); MIESC.sucio = true;
  return m;
}
function escEmpiezaArrastre(m, p) { MIESC.sel = m; MIESC.drag = { m, dx: m.x - p.x, dy: m.y - p.y, x0: m.x, y0: m.y, movido: false }; E('esc-burbuja').hidden = true; }
function escAbajo(e) {
  const p = escAMundo(e); MIESC.puntero = p; MIESC.sucio = true;
  try { E('esc-lienzo').setPointerCapture(e.pointerId); } catch (_) { /* sin captura */ }
  if (MIESC.modo === 'pintar') { escPincelAbajo(p); return; }
  if (MIESC.modo === 'pasear') { if (escEnSuelo(p)) MIESC.dest = { x: limita(p.x, SALA.X0 + 14, SALA.X1 - 14), y: limita(p.y, SALA.PY + 8, SALA.Y1 - 4) }; return; }
  if (MIESC.poner) { if (escEnSuelo(p) && escPon(MIESC.poner, p)) MIESC.poner = null; escBandeja(); return; }
  const m = escMuebleEn(p);
  if (m) { escEmpiezaArrastre(m, p); play('tick'); } else MIESC.sel = null;
}
function escMueve(e) {
  const p = escAMundo(e); MIESC.puntero = p;
  if (MIESC.modo === 'pintar') { escPincelMueve(p); MIESC.sucio = true; return; }
  const d = MIESC.drag;
  if (d) { const nx = p.x + d.dx, ny = p.y + d.dy; if (d.movido || Math.hypot(nx - d.x0, ny - d.y0) > 4) { d.m.x = nx; d.m.y = ny; escLimita(d.m); d.movido = true; } }
  if (d || MIESC.poner) MIESC.sucio = true;
}
function escArriba(e) {
  if (MIESC.modo === 'pintar') escPincelArriba();
  const d = MIESC.drag;
  if (d && d.movido) {
    if (escCabe(d.m)) { MIESC.pops.push({ m: d.m, t0: MIESC.t }); escChispas(d.m); play('pop'); escGuarda(); }
    else { d.m.x = d.x0; d.m.y = d.y0; play('deny'); escAviso(tr('Ahí no cabe: busca un hueco libre')); }
  }
  MIESC.drag = null; if (e && e.pointerType !== 'mouse') MIESC.puntero = null; MIESC.sucio = true;
}

/* ---------- pasear ---------- */
function escLibre(x, y) {
  if (x < SALA.X0 + 12 || x > SALA.X1 - 12 || y < SALA.PY + 6 || y > SALA.Y1 - 3) return false;
  return !escenarioSala().muebles.some(m => { const T = TIPOS_MUEBLE[MUEBLES_SALA[m.id].t]; return x > m.x - T.w / 2 - 9 && x < m.x + T.w / 2 + 9 && y > m.y - T.d - 2 && y < m.y + 5; });
}
function escAnda(dt) {
  const yo = MIESC.yo; if (!yo) return;
  let vx = 0, vy = 0; const K = MIESC.teclas;
  if (K.has('ArrowLeft') || K.has('a')) vx--; if (K.has('ArrowRight') || K.has('d')) vx++; if (K.has('ArrowUp') || K.has('w')) vy--; if (K.has('ArrowDown') || K.has('s')) vy++;
  if (vx || vy) MIESC.dest = null;
  else if (MIESC.dest) { const dx = MIESC.dest.x - yo.x, dy = MIESC.dest.y - yo.y, d = Math.hypot(dx, dy); if (d < 4) MIESC.dest = null; else { vx = dx / d; vy = dy / d; } }
  const l = Math.hypot(vx, vy);
  if (!l) { yo.anda = Math.max(0, yo.anda - dt * 6); return; }
  const v = 150 * dt / l, nx = yo.x + vx * v, ny = yo.y + vy * v;
  if (escLibre(nx, ny)) { yo.x = nx; yo.y = ny; } else if (escLibre(nx, yo.y)) yo.x = nx; else if (escLibre(yo.x, ny)) yo.y = ny; else MIESC.dest = null;
  if (Math.abs(vx) > 0.2) yo.dir = vx > 0 ? 1 : -1;
  yo.anda = Math.min(1, yo.anda + dt * 6); yo.paso = (yo.paso || 0) + dt * 11;
}
function escPintaYo(c) {
  const yo = MIESC.yo, bote = Math.abs(Math.sin(yo.paso || 0)) * 4 * yo.anda, respira = 1 + Math.sin(MIESC.t * 2.4) * 0.012;
  c.save(); c.translate(yo.x, yo.y); c.fillStyle = 'rgba(20,10,40,0.25)'; c.beginPath(); c.ellipse(0, 1, 16, 4.5, 0, 0, TAU); c.fill();
  c.translate(0, -bote); c.rotate(Math.sin((yo.paso || 0)) * 0.06 * yo.anda); c.scale(yo.dir, respira);
  ARD.vestida(c, 0, 0, Object.assign({ esc: 1 }, MIESC.ropa || {})); c.restore();
}

function preparaEscenario() {
  PANTALLAS.push('p-escenario');
  E('b-escenario').onclick = () => { play('select'); abreEscenario(); };
  E('b-esc-volver').onclick = cierraEscenario;
  E('b-esc-pasear').onclick = () => escModo(MIESC.modo === 'pasear' ? 'decorar' : 'pasear');
  const cv = E('esc-lienzo');
  cv.addEventListener('pointerdown', escAbajo); cv.addEventListener('pointermove', escMueve);
  cv.addEventListener('pointerup', escArriba); cv.addEventListener('pointercancel', escArriba);
  cv.addEventListener('pointerleave', () => { if (!MIESC.drag && !MIESC.arrastra) { MIESC.puntero = null; MIESC.sucio = true; } });
  window.addEventListener('resize', escAjusta);
  window.addEventListener('keydown', e => {
    if (!MIESC.abierto) return; const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (MIESC.modo === 'pasear' && /^(Arrow|[wasd]$)/.test(k)) { MIESC.teclas.add(k); e.preventDefault(); }
    else if (MIESC.modo === 'pintar' && (e.ctrlKey || e.metaKey) && k === 'z') { escDeshace(); e.preventDefault(); }
    else if (k === 'Escape' && (MIESC.sel || MIESC.poner)) { MIESC.sel = null; MIESC.poner = null; escBandeja(); MIESC.sucio = true; }
    else if ((k === 'Delete' || k === 'Backspace') && MIESC.sel) escAccionSel('quitar');
  });
  window.addEventListener('keyup', e => { const k = e.key.length === 1 ? e.key.toLowerCase() : e.key; MIESC.teclas.delete(k); });
  preparaBandejaEsc(); preparaPincelEsc();
}
