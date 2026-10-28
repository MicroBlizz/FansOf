// Fans of Merge · PINTAR: el dibujo de la partida en el canvas. El fondo de pradera, el marcador, la pieza actual, la reserva,
// el Rayo zanahoria, el tablero con sus piezas (y las que rebotan antes de soltar), la lluvia, las chispas, los avisos y la portada.
// Medidas lógicas: 540 de ancho y entre 960 y 1170 de alto (MG_V.H), como los demás juegos verticales de la serie.
'use strict';
const MG_V = { sc: 1, dpr: 1, H: 960, cs: 82, bx: 24, by: 338 };
const MG_HUD = { botones: [] };
const MG_TAU = Math.PI * 2;
function mgMide() { MG_V.bx = (540 - MG_V.cs * MG_CFG.lado) / 2; MG_V.by = 324 + Math.round((MG_V.H - 960) * 0.4); }   // el tablero, debajo del marcador; si la pantalla es más alta, el hueco se reparte
const mgCx = x => MG_V.bx + (x + 0.5) * MG_V.cs, mgCy = y => MG_V.by + (y + 0.5) * MG_V.cs;
function mgCasillaEn(lx, ly) { const x = Math.floor((lx - MG_V.bx) / MG_V.cs), y = Math.floor((ly - MG_V.by) / MG_V.cs); return mgDentro(x, y) ? [x, y] : null; }
const mgK = () => MG_V.sc * MG_V.dpr;

const MG_FB = '"Baloo 2", system-ui, sans-serif';   // la letra de los textos pequeños (la grande es la de la serie, FONT_D)
function mgTexto(c, txt, x, y, tam, col = '#fff', alin = 'center', borde = OL, fuente = FONT_D) {
  c.font = `${fuente === MG_FB ? '800 ' : ''}${tam}px ${fuente}`; c.textAlign = alin; c.textBaseline = 'middle'; c.lineJoin = 'round';
  if (borde) { c.lineWidth = Math.max(3, tam * 0.2); c.strokeStyle = borde; c.strokeText(txt, x, y); }
  c.fillStyle = col; c.fillText(txt, x, y);
}
function mgPanel(c, x, y, w, h, r, fondo, borde = OL, grosor = 4) { c.beginPath(); rrPath(c, x, y, w, h, r); c.fillStyle = fondo; c.fill(); c.lineWidth = grosor; c.strokeStyle = borde; c.stroke(); }
function mgFondo(c) {
  const im = MG_IMG.FONDO;
  if (im) { const r = Math.max(540 / im.width, MG_V.H / im.height); c.drawImage(im, (540 - im.width * r) / 2, (MG_V.H - im.height * r) / 2, im.width * r, im.height * r); return; }
  const g = c.createLinearGradient(0, 0, 0, MG_V.H); g.addColorStop(0, '#9fe08a'); g.addColorStop(1, '#5aa84a');
  c.fillStyle = g; c.fillRect(0, 0, 540, MG_V.H);
  c.fillStyle = 'rgba(255,255,255,.12)'; for (let i = 0; i < 40; i++) { c.beginPath(); c.arc((i * 137) % 540, (i * 251) % MG_V.H, 6 + (i % 4) * 3, 0, MG_TAU); c.fill(); }
}
function mgBoton(id, x, y, w, h) { MG_HUD.botones.push({ id, x, y, w, h }); }
function mgBotonEn(lx, ly) { return MG_HUD.botones.find(b => lx >= b.x && lx <= b.x + b.w && ly >= b.y && ly <= b.y + b.h); }

/* ---------- el marcador de arriba ---------- */
function mgPintaMarcador(c, t) {
  const P = MG_P, k = mgK();
  mgPanel(c, 16, 14, 330, 92, 22, 'rgba(255,248,230,.94)');
  mgTexto(c, tr('PUNTOS'), 36, 38, 18, '#c96a1e', 'left', null);
  mgTexto(c, fmt(P.pts), 36, 76, 40, '#ff8a2a', 'left');
  mgTexto(c, tr('Récord: {n}', { n: fmt(Math.max(SAVE.record, P.pts)) }), 330, 38, 16, '#7a5a3a', 'right', null, MG_FB);
  // pausa
  mgPanel(c, 446, 18, 78, 78, 24, '#ff9a3c'); c.fillStyle = '#fff'; c.strokeStyle = OL; c.lineWidth = 3;
  [-11, 11].forEach(d => { c.beginPath(); rrPath(c, 485 + d - 6, 40, 12, 34, 4); c.fill(); c.stroke(); });
  mgBoton('pausa', 446, 18, 78, 78);
  // la pieza actual, en su plato
  const px = 96, py = 214;
  mgPanel(c, 16, 122, 160, 186, 26, 'rgba(255,248,230,.94)');
  mgTexto(c, tr('AHORA'), px, 142, 18, '#c96a1e', 'center', null);
  c.beginPath(); c.ellipse(px, py + 52, 58, 16, 0, 0, MG_TAU); c.fillStyle = 'rgba(70,40,20,.18)'; c.fill();
  const bote = Math.sin(t * 3) * 3;
  mgDibujaPieza(c, P.actual, px, py + bote, 124, k);
  mgTexto(c, tr(MG_PIEZAS[P.actual].nombre), px, 290, 17, '#5a3a20', 'center', null);
  mgBoton('actual', 16, 122, 160, 186);
  // la que viene después (Vista de lince)
  let rx = 196;
  if (mgTiene('lince')) {
    mgPanel(c, rx, 150, 74, 110, 18, 'rgba(255,248,230,.8)', OL, 3);
    mgTexto(c, tr('LUEGO'), rx + 37, 166, 14, '#3fa89c', 'center', null);
    mgDibujaPieza(c, P.cola, rx + 37, 212, 62, k);
    rx += 88;
  }
  // la reserva
  P.reserva.forEach((r, i) => {
    const x = rx + i * 88;
    mgPanel(c, x, 150, 78, 110, 18, r ? 'rgba(220,245,255,.95)' : 'rgba(220,245,255,.6)', OL, 3);
    mgTexto(c, tr('RESERVA'), x + 39, 166, 13, '#2e7fb8', 'center', null);
    if (r) mgDibujaPieza(c, r, x + 39, 214, 64, k);
    else { c.setLineDash([6, 6]); c.beginPath(); c.arc(x + 39, 214, 24, 0, MG_TAU); c.strokeStyle = 'rgba(46,127,184,.5)'; c.lineWidth = 3; c.stroke(); c.setLineDash([]); }
    mgBoton('reserva' + i, x, 150, 78, 110);
  });
  mgTexto(c, tr('Toca para cambiar'), rx + P.reserva.length * 44 - 5, 280, 13, '#fff', 'center', 'rgba(32,16,44,.55)', MG_FB);
  // el Rayo zanahoria: un botón redondo que se llena con las fusiones
  const bx = 470, byy = 186, R = 44, listo = P.cargas > 0;
  c.beginPath(); c.arc(bx, byy, R, 0, MG_TAU); c.fillStyle = listo ? '#ffb02e' : 'rgba(255,248,230,.8)'; c.fill(); c.lineWidth = 4; c.strokeStyle = OL; c.stroke();
  c.beginPath(); c.arc(bx, byy, R - 7, -Math.PI / 2, -Math.PI / 2 + MG_TAU * (P.carga / MG_CFG.cargaHabilidad)); c.strokeStyle = '#ff6a2b'; c.lineWidth = 7; c.lineCap = 'round'; c.stroke(); c.lineCap = 'butt';
  mgRayoIcono(c, bx, byy, listo ? 1 : 0.45, P.modo === 'rayo' ? Math.sin(t * 10) * 0.15 : 0);
  if (P.cargas) { c.beginPath(); c.arc(bx + 32, byy - 32, 15, 0, MG_TAU); c.fillStyle = '#ff4f6d'; c.fill(); c.lineWidth = 3; c.strokeStyle = OL; c.stroke(); mgTexto(c, String(P.cargas), bx + 32, byy - 31, 18, '#fff', 'center', null); }
  mgTexto(c, tr('RAYO'), bx, byy + R + 14, 15, '#fff', 'center', OL);
  mgBoton('rayo', bx - R, byy - R, R * 2, R * 2 + 20);
  if (P.tirachinas > 0 || mgTiene('tirachinas')) {
    const usado = P.tirachinas <= 0;
    mgPanel(c, 420, 262, 100, 40, 14, usado ? 'rgba(255,248,230,.5)' : (P.modo === 'tirachinas' ? '#ffd84a' : '#ff8a3d'), OL, 3);
    mgTexto(c, tr('TIRACHINAS'), 470, 283, 14, usado ? '#9a8a7a' : '#fff', 'center', usado ? null : OL);
    if (!usado) mgBoton('tirachinas', 420, 262, 100, 40);
  }
}
function mgRayoIcono(c, x, y, alfa, giro) {
  c.save(); c.translate(x, y); c.rotate(-0.5 + giro); c.globalAlpha = alfa; c.lineJoin = 'round'; c.lineWidth = 3.5; c.strokeStyle = OL;
  c.beginPath(); c.moveTo(-6, -18); c.quadraticCurveTo(10, -4, 3, 22); c.quadraticCurveTo(-12, 0, -6, -18); c.fillStyle = '#ff7b2e'; c.fill(); c.stroke();   // la zanahoria
  c.beginPath(); c.moveTo(-6, -18); c.lineTo(-14, -28); c.moveTo(-6, -18); c.lineTo(-2, -30); c.moveTo(-6, -18); c.lineTo(4, -26); c.strokeStyle = '#3fae3a'; c.lineWidth = 4; c.stroke();
  c.restore();
}

/* ---------- el tablero ---------- */
function mgPintaTablero(c, t) {
  const P = MG_P, V = MG_V, cs = V.cs, n = MG_CFG.lado, k = mgK();
  const tx = MG_FX.temblor > 0 ? (Math.random() - 0.5) * 6 : 0, ty = MG_FX.temblor > 0 ? (Math.random() - 0.5) * 6 : 0;
  c.save(); c.translate(tx, ty);
  mgPanel(c, V.bx - 10, V.by - 10, cs * n + 20, cs * n + 20, 26, 'rgba(92,70,40,.55)', OL, 5);
  const E = P.evento;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    c.beginPath(); rrPath(c, V.bx + x * cs + 3, V.by + y * cs + 3, cs - 6, cs - 6, 14);
    c.fillStyle = (x + y) % 2 ? 'rgba(160,226,120,.92)' : 'rgba(140,212,100,.92)';
    if (E && E.id === 'lluvia' && E.casillas.has(y * 8 + x)) c.fillStyle = 'rgba(120,196,240,.95)';
    if (P.sel && P.sel[0] === x && P.sel[1] === y) c.fillStyle = 'rgba(255,240,170,.98)';
    c.fill();
    if (E && E.id === 'lluvia' && E.casillas.has(y * 8 + x)) {   // gotas y el x2
      c.fillStyle = 'rgba(255,255,255,.75)';
      for (let i = 0; i < 3; i++) { const gy = ((t * 60 + i * 27) % (cs - 10)); c.beginPath(); c.ellipse(V.bx + x * cs + 14 + i * 26, V.by + y * cs + 6 + gy, 2.5, 6, 0, 0, MG_TAU); c.fill(); }
      mgTexto(c, 'x2', V.bx + x * cs + cs - 18, V.by + y * cs + 16, 16, '#2e7fb8', 'center', '#fff');
    }
  }
  // la previsión: la pieza a medio poner y las que se juntarían, rebotando
  let prev = null;
  if (P.sel && P.estado === 'jugando' && !P.modo) prev = mgPrevision(P.B, P.sel[0], P.sel[1], P.actual);
  const rebota = new Set(prev ? prev.celdas.map(([x, y]) => y * 8 + x) : []);
  // las piezas, fila a fila (las de abajo tapan a las de arriba)
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const p = P.B[y][x]; if (!p) continue;
    const A = mgAnimDe(p); if (A && A.oculta) continue;
    let cx = mgCx(x), cy = mgCy(y), sc = 1;
    if (A && A.mueve) { cx = lerp(mgCx(A.fx), cx, A.e); cy = lerp(mgCy(A.fy), cy, A.e) + A.dy * cs; }
    else if (A) { cy += A.dy * cs; sc = A.sc; }
    if (rebota.has(y * 8 + x)) cy -= Math.abs(Math.sin(t * 9)) * 8;
    if (p.t === 'zorro' || p.t === 'cuervo') cy += Math.sin(t * 4 + p.id) * 2;
    c.beginPath(); c.ellipse(cx, mgCy(y) + cs * 0.32, cs * 0.3 * sc, cs * 0.09, 0, 0, MG_TAU); c.fillStyle = 'rgba(40,60,20,.22)'; c.fill();
    if (P.modo && p) { c.beginPath(); c.arc(cx, cy, cs * 0.46, 0, MG_TAU); c.strokeStyle = `rgba(255,${P.modo === 'rayo' ? 120 : 200},40,${0.5 + Math.sin(t * 8) * 0.4})`; c.lineWidth = 4; c.stroke(); }
    mgDibujaPieza(c, p.t, cx, cy, cs * 1.02 * sc, k, p.s);
    if (p.t === 'cofre') { mgTexto(c, tr('¡Ábreme!'), cx, cy - cs * 0.44 + Math.sin(t * 5) * 2, 13, '#fff', 'center', OL); }
  }
  if (P.sel && prev) {   // la pieza fantasma en la casilla elegida
    const [x, y] = P.sel; c.globalAlpha = 0.55 + Math.sin(t * 6) * 0.2;
    mgDibujaPieza(c, prev.real, mgCx(x), mgCy(y) - 4, cs * 0.96, k);
    c.globalAlpha = 1;
    if (prev.final !== prev.real) { mgPanel(c, mgCx(x) - 44, mgCy(y) - cs * 0.72, 88, 26, 12, '#fff8e6', OL, 3); mgTexto(c, '→ ' + tr(MG_PIEZAS[prev.final].nombre), mgCx(x), mgCy(y) - cs * 0.72 + 13, 12, '#c96a1e', 'center', null, MG_FB); }
  }
  // las que vuelan a juntarse
  for (const f of MG_FX.fantasmas) {
    const k2 = clamp((MG_FX.t - f.t0) / f.dur, 0, 1); if (MG_FX.t < f.t0) { mgDibujaPieza(c, f.tipo, mgCx(f.fx), mgCy(f.fy), cs, k, f.s); continue; }
    const e = k2 * k2;
    mgDibujaPieza(c, f.tipo, lerp(mgCx(f.fx), mgCx(f.tx), e), lerp(mgCy(f.fy), mgCy(f.ty), e), cs * (1 - e * 0.4), k, f.s);
  }
  for (const p of MG_FX.parts) { c.globalAlpha = clamp(1 - (MG_FX.t - p.t0) / p.vida, 0, 1); c.beginPath(); c.arc(mgCx(p.x), mgCy(p.y), p.r * cs, 0, MG_TAU); c.fillStyle = p.col; c.fill(); }
  c.globalAlpha = 1;
  for (const x of MG_FX.textos) { const e = MG_FX.t - x.t0; if (e < 0) continue; c.globalAlpha = clamp(1.4 - e * 1.3, 0, 1); mgTexto(c, x.txt, mgCx(x.x), mgCy(x.y) - 20 - e * 50, 24, '#ffe14d'); }
  c.globalAlpha = 1;
  c.restore();
}
/* ---------- abajo: el evento, la carta y una ayuda ---------- */
function mgPintaAbajo(c, t) {
  const P = MG_P, y0 = MG_V.by + MG_V.cs * MG_CFG.lado + 22;
  let linea = '';
  if (P.modo === 'rayo') linea = tr('Toca la pieza que quieras quitar con el rayo.');
  else if (P.modo === 'tirachinas') linea = tr('Toca la pieza que quieras quitar con el tirachinas.');
  else if (mgTipoDe(P.actual) === 'topo') linea = tr('El topo quita una pieza: toca una casilla ocupada.');
  else if (P.sel) linea = tr('Toca otra vez para plantar.');
  else if (P.turno < 4) linea = tr('Toca una casilla para ver qué pasa; tócala otra vez para plantar.');
  else if (P.evento) linea = tr('{e}: {t} ({n} turnos)', { e: tr(P.evento.nombre), t: tr(P.evento.texto), n: P.evento.quedan });
  if (linea) { c.font = '800 17px "Baloo 2", sans-serif'; const w = Math.min(520, c.measureText(linea).width + 34); mgPanel(c, 270 - w / 2, y0, w, 38, 18, 'rgba(255,248,230,.94)', OL, 3); mgTexto(c, linea, 270, y0 + 20, 17, '#5a3a20', 'center', null, MG_FB); }
  if (P.cartas.length) { const C = MG_CARTAS.find(x => x.id === P.cartas[0]); mgTexto(c, tr('Carta: {n}', { n: tr(C.nombre) }), 270, y0 + 64, 16, '#fff', 'center', OL); }
}
function mgPintaAvisos(c) {
  const a = MG_FX.avisos.find(x => MG_FX.t >= x.t0);
  if (a) { const e = MG_FX.t - a.t0, s = e < 0.2 ? e / 0.2 : 1; c.globalAlpha = clamp(2 - e, 0, 1); c.save(); c.translate(270, MG_V.by - 26); c.scale(s, s); mgTexto(c, a.txt, 0, 0, 30, '#ffe14d'); c.restore(); c.globalAlpha = 1; }
  const K = MG_FX.cartel;
  if (K) {
    const e = MG_FX.t - K.t0, s = e < 0.25 ? 0.6 + e * 1.6 : 1, al = clamp(2.6 - e, 0, 1), cy = MG_V.by + MG_V.cs * 3;
    c.globalAlpha = al; c.save(); c.translate(270, cy); c.scale(s, s);
    mgPanel(c, -200, -70, 400, 140, 28, '#fff8e6', OL, 5);
    mgTexto(c, K.nombre, 0, -26, 38, '#4fa8ff');
    mgTexto(c, K.texto, 0, 28, 19, '#5a3a20', 'center', null, MG_FB);
    c.restore(); c.globalAlpha = 1;
  }
}
function mgPintaPartida(c, t) {
  MG_HUD.botones.length = 0;
  mgFondo(c);
  mgPintaMarcador(c, t);
  mgPintaTablero(c, t);
  mgPintaAbajo(c, t);
  mgPintaAvisos(c);
}
/* ---------- la portada ---------- */
const MG_LLUVIA = Array.from({ length: 10 }, (_, i) => ({ t: MG_CADENA[i % 8], x: (i * 97) % 540, y: (i * 173) % 960, v: 30 + (i * 37) % 40, r: i * 1.7 }));
function mgPintaPortada(c, t, dt) {
  mgFondo(c);
  c.fillStyle = 'rgba(255,248,230,.25)'; c.fillRect(0, 0, 540, MG_V.H);
  for (const L of MG_LLUVIA) { L.y += L.v * dt; L.r += dt; if (L.y > MG_V.H + 60) { L.y = -60; L.x = Math.random() * 540; } c.save(); c.globalAlpha = 0.8; c.translate(L.x, L.y); c.rotate(Math.sin(L.r) * 0.25); mgDibujaPieza(c, L.t, 0, 0, 74, mgK()); c.restore(); }
  const y0 = MG_V.H * 0.2 + Math.sin(t * 1.6) * 4;
  c.save(); c.translate(270, y0); c.rotate(-0.04);
  mgTexto(c, 'FANS OF', 0, -50, 44, '#ffffff'); mgTexto(c, 'MERGE', 0, 22, 108, '#ff8a2a');
  c.restore();
  const by = MG_V.H * 0.55, salto = Math.abs(Math.sin(t * 2.4)) * 14;
  c.beginPath(); c.ellipse(270, by + 100, 80 - salto, 16, 0, 0, MG_TAU); c.fillStyle = 'rgba(40,60,20,.25)'; c.fill();
  if (MG_IMG.BUNNY) mgDibujaPieza(c, 'BUNNY', 270, by - salto, 260, mgK());
  else mgDibujaPieza(c, 'madriguera', 270, by - salto, 220, mgK());
}
