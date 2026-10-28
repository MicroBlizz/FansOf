// Fans of Merge · PINTAR: el dibujo de la partida en el canvas. La pradera ES el tablero: sin cuadrícula ni marco, las piezas
// están sobre la hierba y las casillas vacías son caminitos de tierra que se unen. Arriba, poca cosa: puntos, el objetivo,
// la pieza actual, la reserva y el Rayo zanahoria. Abajo, qué es la pieza actual y en qué se convierte.
// Medidas lógicas: 540 de ancho y entre 960 y 1170 de alto (MG_V.H), como los demás juegos verticales de la serie.
'use strict';
const MG_V = { sc: 1, dpr: 1, H: 960, cs: 86, bx: 12, by: 250 };
const MG_HUD = { botones: [] };
const MG_TAU = Math.PI * 2;
function mgMide() { MG_V.bx = (540 - MG_V.cs * MG_CFG.lado) / 2; MG_V.by = 246 + Math.round((MG_V.H - 960) * 0.45); }   // el tablero, debajo del marcador; si la pantalla es más alta, el hueco se reparte
const mgCx = x => MG_V.bx + (x + 0.5) * MG_V.cs, mgCy = y => MG_V.by + (y + 0.5) * MG_V.cs;
function mgCasillaEn(lx, ly) { const x = Math.floor((lx - MG_V.bx) / MG_V.cs), y = Math.floor((ly - MG_V.by) / MG_V.cs); return mgDentro(x, y) ? [x, y] : null; }
const mgK = () => MG_V.sc * MG_V.dpr;

const MG_FB = '"Baloo 2", system-ui, sans-serif';   // la letra de los textos pequeños (la grande es la de la serie, FONT_D)
function mgTexto(c, txt, x, y, tam, col = '#fff', alin = 'center', borde = OL, fuente = FONT_D) {
  c.font = `${fuente === MG_FB ? '800 ' : ''}${tam}px ${fuente}`; c.textAlign = alin; c.textBaseline = 'middle'; c.lineJoin = 'round';
  if (borde) { c.lineWidth = Math.max(3, tam * 0.2); c.strokeStyle = borde; c.strokeText(txt, x, y); }
  c.fillStyle = col; c.fillText(txt, x, y);
}
function mgPanel(c, x, y, w, h, r, fondo, borde = OL, grosor = 4) { c.beginPath(); rrPath(c, x, y, w, h, r); c.fillStyle = fondo; c.fill(); if (borde) { c.lineWidth = grosor; c.strokeStyle = borde; c.stroke(); } }
function mgFondo(c) {
  const im = MG_IMG.FONDO;
  if (im) { const r = Math.max(540 / im.width, MG_V.H / im.height); c.drawImage(im, (540 - im.width * r) / 2, (MG_V.H - im.height * r) / 2, im.width * r, im.height * r); return; }
  const g = c.createLinearGradient(0, 0, 0, MG_V.H); g.addColorStop(0, '#5f9e3f'); g.addColorStop(1, '#3f7a2c');
  c.fillStyle = g; c.fillRect(0, 0, 540, MG_V.H);
  c.fillStyle = 'rgba(200,255,150,.10)';   // briznas sueltas
  for (let i = 0; i < 90; i++) { const x = (i * 137) % 540, y = (i * 251) % MG_V.H; c.fillRect(x, y, 2, 6); c.fillRect(x + 4, y + 2, 2, 5); }
}
function mgBoton(id, x, y, w, h) { MG_HUD.botones.push({ id, x, y, w, h }); }
function mgBotonEn(lx, ly) { return MG_HUD.botones.find(b => lx >= b.x && lx <= b.x + b.w && ly >= b.y && ly <= b.y + b.h); }
const MG_PILDORA = 'rgba(28,40,18,.72)';

/* ---------- arriba: puntos, objetivo, pieza actual, reserva y rayo ---------- */
function mgPintaMarcador(c, t) {
  const P = MG_P, k = mgK();
  // puntos y objetivo
  mgPanel(c, 120, 10, 300, 52, 18, MG_PILDORA, null);
  mgTexto(c, fmt(P.pts), 270, 37, 36, '#fff6c8', 'center', null);
  const O = mgObjetivo(), ok = O.de ? clamp((P.pts - O.desde) / (O.de - O.desde), 0, 1) : 1;
  mgPanel(c, 120, 68, 300, 34, 14, MG_PILDORA, null);
  mgTexto(c, O.de ? tr('Consigue {n} puntos', { n: fmt(O.de) }) : tr('¡Todos los objetivos!'), 232, 86, 15, '#fff', 'center', null, MG_FB);
  mgPanel(c, 350, 76, 60, 18, 9, 'rgba(255,255,255,.18)', null); if (ok > 0.25) mgPanel(c, 350, 76, 60 * ok, 18, 9, '#9be35a', null);
  mgTexto(c, Math.floor(ok * 100) + '%', 380, 86, 12, '#fff', 'center', 'rgba(0,0,0,.5)', MG_FB);
  // pausa (rueda dentada)
  mgPanel(c, 466, 12, 62, 62, 18, '#ff9a3c', OL, 4);
  c.save(); c.translate(497, 43); c.fillStyle = '#fff'; c.strokeStyle = OL; c.lineWidth = 3;
  [-9, 9].forEach(d => { c.beginPath(); rrPath(c, d - 5, -14, 10, 28, 3); c.fill(); c.stroke(); }); c.restore();
  mgBoton('pausa', 466, 12, 62, 62);
  // la pieza actual (también va con el dedo por el tablero)
  const fila = 116;
  mgPanel(c, 12, fila, 100, 112, 20, 'rgba(255,248,230,.94)', OL, 3);
  mgTexto(c, tr('AHORA'), 62, fila + 15, 14, '#c96a1e', 'center', null);
  mgDibujaPieza(c, P.actual, 62, fila + 66 + Math.sin(t * 3) * 2, 82, k);
  let x = 122;
  if (mgTiene('lince')) {
    mgPanel(c, x, fila + 18, 70, 94, 16, 'rgba(255,248,230,.8)', OL, 3);
    mgTexto(c, tr('LUEGO'), x + 35, fila + 32, 12, '#3fa89c', 'center', null);
    mgDibujaPieza(c, P.cola, x + 35, fila + 72, 58, k); x += 80;
  }
  P.reserva.forEach((r, i) => {
    mgPanel(c, x, fila + 18, 76, 94, 16, r ? 'rgba(220,245,255,.96)' : 'rgba(220,245,255,.7)', OL, 3);
    mgTexto(c, tr('RESERVA'), x + 38, fila + 32, 12, '#2e7fb8', 'center', null);
    if (r) mgDibujaPieza(c, r, x + 38, fila + 72, 60, k);
    if (P.reservaEspera > 0) { mgPanel(c, x, fila + 18, 76, 94, 16, 'rgba(20,30,10,.45)', null); mgTexto(c, String(P.reservaEspera), x + 38, fila + 70, 34, '#fff'); }
    else { c.setLineDash([5, 5]); c.beginPath(); c.arc(x + 38, fila + 70, 20, 0, MG_TAU); c.strokeStyle = 'rgba(46,127,184,.55)'; c.lineWidth = 3; c.stroke(); c.setLineDash([]); }
    mgBoton('reserva' + i, x, fila + 18, 76, 94); x += 86;
  });
  // el Rayo zanahoria: se llena con las fusiones
  const bx = 486, by = fila + 52, R = 38, listo = P.cargas > 0;
  c.beginPath(); c.arc(bx, by, R, 0, MG_TAU); c.fillStyle = listo ? '#ffb02e' : 'rgba(255,248,230,.85)'; c.fill(); c.lineWidth = 4; c.strokeStyle = OL; c.stroke();
  c.beginPath(); c.arc(bx, by, R - 7, -Math.PI / 2, -Math.PI / 2 + MG_TAU * (P.carga / MG_CFG.cargaHabilidad)); c.strokeStyle = '#ff6a2b'; c.lineWidth = 6; c.lineCap = 'round'; c.stroke(); c.lineCap = 'butt';
  mgRayoIcono(c, bx, by, listo ? 1 : 0.45, P.modo === 'rayo' ? Math.sin(t * 10) * 0.15 : 0);
  if (P.cargas) { c.beginPath(); c.arc(bx + 27, by - 27, 13, 0, MG_TAU); c.fillStyle = '#ff4f6d'; c.fill(); c.lineWidth = 3; c.strokeStyle = OL; c.stroke(); mgTexto(c, String(P.cargas), bx + 27, by - 26, 16, '#fff', 'center', null); }
  mgTexto(c, tr('RAYO'), bx, by + R + 10, 13, '#fff', 'center', OL);
  mgBoton('rayo', bx - R, by - R, R * 2, R * 2 + 16);
  if (P.tirachinas > 0) {
    const tx = 382, ty = fila + 30;
    mgPanel(c, tx, ty, 58, 58, 16, P.modo === 'tirachinas' ? '#ffd84a' : '#ff8a3d', OL, 3);
    mgTirachinasIcono(c, tx + 29, ty + 29);
    mgTexto(c, tr('TIRACHINAS'), tx + 29, ty + 70, 11, '#fff', 'center', OL);
    mgBoton('tirachinas', tx, ty, 58, 76);
  }
}
function mgRayoIcono(c, x, y, alfa, giro) {
  c.save(); c.translate(x, y); c.rotate(-0.5 + giro); c.globalAlpha = alfa; c.lineJoin = 'round'; c.lineWidth = 3.5; c.strokeStyle = OL;
  c.beginPath(); c.moveTo(-6, -16); c.quadraticCurveTo(10, -4, 3, 20); c.quadraticCurveTo(-12, 0, -6, -16); c.fillStyle = '#ff7b2e'; c.fill(); c.stroke();
  c.beginPath(); c.moveTo(-6, -16); c.lineTo(-13, -26); c.moveTo(-6, -16); c.lineTo(-2, -27); c.moveTo(-6, -16); c.lineTo(4, -24); c.strokeStyle = '#3fae3a'; c.lineWidth = 4; c.stroke();
  c.restore();
}
function mgTirachinasIcono(c, x, y) {
  c.save(); c.translate(x, y); c.lineCap = 'round'; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(0, 18); c.lineTo(0, 2); c.lineTo(-11, -14); c.moveTo(0, 2); c.lineTo(11, -14); c.strokeStyle = OL; c.lineWidth = 9; c.stroke(); c.strokeStyle = '#a8673a'; c.lineWidth = 5; c.stroke();
  c.beginPath(); c.moveTo(-11, -14); c.quadraticCurveTo(0, -2, 11, -14); c.strokeStyle = '#fff'; c.lineWidth = 2.5; c.stroke();
  c.restore();
}

/* ---------- el tablero: caminos de tierra, piezas, previsión ---------- */
function mgPintaCaminos(c, t) {
  const P = MG_P, cs = MG_V.cs, n = MG_CFG.lado, B = P.B, r = cs * 0.38, E = P.evento;
  const libre = (x, y) => mgDentro(x, y) && !B[y][x];
  const forma = (pad) => {   // cada casilla libre es una mancha redonda, unida a las libres de al lado
    c.beginPath();
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      if (!libre(x, y)) continue;
      const cx = mgCx(x), cy = mgCy(y);
      rrPath(c, cx - r - pad, cy - r - pad, (r + pad) * 2, (r + pad) * 2, r * 0.55 + pad);
      if (libre(x + 1, y)) c.rect(cx, cy - r * 0.7 - pad, cs, (r * 0.7 + pad) * 2);
      if (libre(x, y + 1)) c.rect(cx - r * 0.7 - pad, cy, (r * 0.7 + pad) * 2, cs);
    }
  };
  forma(3); c.fillStyle = 'rgba(70,60,20,.45)'; c.fill('nonzero');
  forma(0); c.fillStyle = '#c9b46e'; c.fill('nonzero');
  // piedrecitas del camino (fijas por casilla)
  c.fillStyle = 'rgba(120,100,50,.35)';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (libre(x, y)) for (let i = 0; i < 3; i++) { const s = (x * 7 + y * 13 + i * 5) % 11; c.beginPath(); c.arc(mgCx(x) - r * 0.6 + s * 4.5, mgCy(y) - r * 0.5 + ((s * 3 + i * 17) % 22) * 2.4, 2 + (s % 2), 0, MG_TAU); c.fill(); }
  if (E && E.casillas.size) {   // las casillas mojadas: un charco azul con gotas y su x2
    for (const k of E.casillas) {
      const x = k % 8, y = (k / 8) | 0, cx = mgCx(x), cy = mgCy(y);
      c.beginPath(); c.ellipse(cx, cy + cs * 0.2, cs * 0.44, cs * 0.22, 0, 0, MG_TAU); c.fillStyle = 'rgba(110,190,255,.55)'; c.fill();
      c.fillStyle = 'rgba(220,240,255,.85)';
      for (let i = 0; i < 3; i++) { const gy = (t * 70 + i * 29) % (cs * 0.8); c.beginPath(); c.ellipse(cx - cs * 0.3 + i * cs * 0.3, cy - cs * 0.45 + gy, 2.2, 6, 0, 0, MG_TAU); c.fill(); }
      mgTexto(c, 'x2', cx + cs * 0.32, cy - cs * 0.34, 15, '#bfe6ff', 'center', OL);
    }
  }
}
// la mejor casilla para una pista (solo en los primeros turnos): la que más junta
function mgPista() {
  const P = MG_P; let mejor = null, v = 0;
  for (const [x, y] of mgVacias(P.B)) { const p = mgPrevision(P.B, x, y, P.actual); if (p && p.celdas.length > v) { v = p.celdas.length; mejor = [x, y]; } }
  return mejor;
}
function mgPintaTablero(c, t) {
  const P = MG_P, V = MG_V, cs = V.cs, n = MG_CFG.lado, k = mgK();
  const tx = MG_FX.temblor > 0 ? (Math.random() - 0.5) * 6 : 0, ty = MG_FX.temblor > 0 ? (Math.random() - 0.5) * 6 : 0;
  c.save(); c.translate(tx, ty);
  mgPintaCaminos(c, t);
  mgPintaConejos(c, t);
  // la casilla elegida: recuadro oscuro, como el dedo encima
  let prev = null;
  if (P.sel && P.estado === 'jugando' && !P.modo) {
    prev = mgPrevision(P.B, P.sel[0], P.sel[1], P.actual);
    const [x, y] = P.sel; c.beginPath(); rrPath(c, V.bx + x * cs + 3, V.by + y * cs + 3, cs - 6, cs - 6, 16);
    c.fillStyle = 'rgba(20,30,10,.28)'; c.fill(); c.lineWidth = 4; c.strokeStyle = 'rgba(20,20,10,.85)'; c.stroke();
  }
  const rebota = new Set(prev ? prev.celdas.map(([x, y]) => y * 8 + x) : []);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {   // fila a fila: las de abajo tapan a las de arriba
    const p = P.B[y][x]; if (!p) continue;
    const A = mgAnimDe(p); if (A && A.oculta) continue;
    let cx = mgCx(x), cy = mgCy(y), sc = 1;
    if (A && A.mueve) { cx = lerp(mgCx(A.fx), cx, A.e); cy = lerp(mgCy(A.fy), cy, A.e) + A.dy * cs; }
    else if (A) { cy += A.dy * cs; sc = A.sc; }
    if (rebota.has(y * 8 + x)) cy -= Math.abs(Math.sin(t * 9)) * 9;
    if (p.t === 'zorro' || p.t === 'cuervo') cy += Math.sin(t * 4 + p.id) * 2;
    c.beginPath(); c.ellipse(cx, mgCy(y) + cs * 0.34, cs * 0.32 * sc, cs * 0.09, 0, 0, MG_TAU); c.fillStyle = 'rgba(20,40,10,.3)'; c.fill();
    if (P.modo) { c.beginPath(); c.arc(cx, cy, cs * 0.46, 0, MG_TAU); c.strokeStyle = `rgba(255,${P.modo === 'rayo' ? 120 : 200},40,${0.5 + Math.sin(t * 8) * 0.4})`; c.lineWidth = 4; c.stroke(); }
    mgDibujaPieza(c, p.t, cx, cy, cs * 1.04 * sc, k, p.s);
    if (p.t === 'cofre') mgTexto(c, tr('¡Ábreme!'), cx, cy - cs * 0.46 + Math.sin(t * 5) * 2, 12, '#fff', 'center', OL);
  }
  if (P.sel && prev) {   // la pieza, en la casilla, a punto de soltarla
    const [x, y] = P.sel, sube = Math.sin(t * 5) * 3;
    mgDibujaPieza(c, prev.real, mgCx(x), mgCy(y) - 6 + sube, cs * 0.98, k);
    if (prev.final !== prev.real) { const w = 120; mgPanel(c, mgCx(x) - w / 2, mgCy(y) - cs * 0.82, w, 24, 12, '#fff8e6', OL, 3); mgTexto(c, '→ ' + tr(MG_PIEZAS[prev.final].nombre), mgCx(x), mgCy(y) - cs * 0.82 + 12, 12, '#c96a1e', 'center', null, MG_FB); }
  }
  if (!P.sel && !P.modo && P.turno < 5 && P.estado === 'jugando') {   // pista de los primeros turnos: una flecha que salta
    const q = mgPista(); if (q) mgFlecha(c, mgCx(q[0]), mgCy(q[1]) - cs * 0.55 - Math.abs(Math.sin(t * 4)) * 10);
  }
  for (const f of MG_FX.fantasmas) {   // las que vuelan a juntarse
    if (MG_FX.t < f.t0) { mgDibujaPieza(c, f.tipo, mgCx(f.fx), mgCy(f.fy), cs, k, f.s); continue; }
    const e = clamp((MG_FX.t - f.t0) / f.dur, 0, 1) ** 2;
    mgDibujaPieza(c, f.tipo, lerp(mgCx(f.fx), mgCx(f.tx), e), lerp(mgCy(f.fy), mgCy(f.ty), e), cs * (1 - e * 0.4), k, f.s);
  }
  for (const p of MG_FX.parts) { c.globalAlpha = clamp(1 - (MG_FX.t - p.t0) / p.vida, 0, 1); c.beginPath(); c.arc(mgCx(p.x), mgCy(p.y), p.r * cs, 0, MG_TAU); c.fillStyle = p.col; c.fill(); }
  c.globalAlpha = 1;
  const RL = MG_FX.relampago;
  if (RL && MG_FX.t - RL.t0 < 0.35) {   // el relámpago de la tormenta
    const cx = mgCx(RL.x), cy = mgCy(RL.y); c.globalAlpha = 1 - (MG_FX.t - RL.t0) / 0.35;
    c.beginPath(); c.moveTo(cx + 20, cy - 260); c.lineTo(cx - 10, cy - 150); c.lineTo(cx + 14, cy - 140); c.lineTo(cx - 16, cy - 30); c.lineTo(cx + 6, cy - 34); c.lineTo(cx, cy);
    c.strokeStyle = '#fff6a0'; c.lineWidth = 7; c.stroke(); c.strokeStyle = '#ffffff'; c.lineWidth = 3; c.stroke(); c.globalAlpha = 1;
  }
  for (const x of MG_FX.textos) { const e = MG_FX.t - x.t0; if (e < 0) continue; c.globalAlpha = clamp(1.4 - e * 1.3, 0, 1); mgTexto(c, x.txt, mgCx(x.x), mgCy(x.y) - 20 - e * 50, 22, '#fff6c8'); }
  c.globalAlpha = 1;
  c.restore();
}
function mgFlecha(c, x, y) {
  c.save(); c.translate(x, y); c.beginPath();
  c.moveTo(0, 16); c.lineTo(-18, -4); c.lineTo(-8, -4); c.lineTo(-8, -22); c.lineTo(8, -22); c.lineTo(8, -4); c.lineTo(18, -4); c.closePath();
  c.fillStyle = '#ffd23a'; c.fill(); c.lineWidth = 4; c.lineJoin = 'round'; c.strokeStyle = OL; c.stroke(); c.restore();
}

/* ---------- abajo: la pieza actual, qué hace y en qué se convierte ---------- */
function mgPintaAbajo(c, t) {
  const P = MG_P, y0 = MG_V.by + MG_V.cs * MG_CFG.lado + 14, k = mgK(), tipo = P.actual;
  mgPanel(c, 12, y0, 516, 66, 18, MG_PILDORA, null);
  let linea;
  if (P.modo === 'rayo') linea = tr('Toca la pieza que quieras quitar con el rayo.');
  else if (P.modo === 'tirachinas') linea = tr('Toca la pieza que quieras quitar con el tirachinas.');
  else linea = tr(mgDescripcion(tipo));
  mgTexto(c, tr(MG_PIEZAS[tipo].nombre) + ':', 26, y0 + 20, 17, '#fff6c8', 'left', null);
  mgTexto(c, linea, 26, y0 + 46, 15, '#fff', 'left', null, MG_FB);
  const sig = MG_PIEZAS[tipo].sig;
  if (sig && !P.modo) {   // 3 iguales -> la siguiente, con dibujos pequeños
    c.font = `17px ${FONT_D}`; let x = 26 + c.measureText(tr(MG_PIEZAS[tipo].nombre) + ':').width + 16;
    for (let i = 0; i < 3; i++) { mgDibujaPieza(c, tipo, x + 14, y0 + 19, 30, k); x += 26; }
    mgTexto(c, '→', x + 12, y0 + 20, 18, '#fff6c8', 'center', null); mgDibujaPieza(c, sig, x + 40, y0 + 18, 34, k);
  }
  const E = P.evento;
  if (E && !P.modo) mgTexto(c, tr('{e}: {n} turnos', { e: tr(E.nombre), n: E.quedan }), 514, y0 + 20, 14, '#9fd4ff', 'right', null, MG_FB);
  if (P.cartas.length) { const C = MG_CARTAS.find(x => x.id === P.cartas[0]); mgTexto(c, tr('Carta: {n}', { n: tr(C.nombre) }), 270, y0 + 92, 15, '#fff', 'center', OL); }
}
function mgDescripcion(tipo) {
  const T = mgTipoDe(tipo);
  if (T === 'zorro') return 'Anda por los caminos. Enciérralo y se dormirá.';
  if (T === 'cuervo') return 'Salta a cualquier hueco. Solo se duerme si no queda sitio.';
  if (T === 'semilla') return 'Se convierte en lo que mejor te venga.';
  if (T === 'topo') return 'Toca una pieza del tablero para quitarla.';
  if (MG_P.sel) return 'Toca otra vez para plantar.';
  if (MG_P.turno < 4) return 'Toca una casilla para verla; tócala otra vez para plantar.';
  return 'Junta tres que se toquen y crecerá.';
}
function mgPintaAvisos(c) {
  const a = MG_FX.avisos.find(x => MG_FX.t >= x.t0);
  if (a) { const e = MG_FX.t - a.t0, s = e < 0.2 ? e / 0.2 : 1; c.globalAlpha = clamp(2 - e, 0, 1); c.save(); c.translate(270, MG_V.by - 6); c.scale(s, s); mgTexto(c, a.txt, 0, 0, 28, '#ffe14d'); c.restore(); c.globalAlpha = 1; }
  const K = MG_FX.cartel;
  if (K) {
    const e = MG_FX.t - K.t0, s = e < 0.25 ? 0.6 + e * 1.6 : 1, cy = MG_V.by + MG_V.cs * 3;
    c.globalAlpha = clamp(2.6 - e, 0, 1); c.save(); c.translate(270, cy); c.scale(s, s);
    mgPanel(c, -200, -66, 400, 132, 28, '#fff8e6', OL, 5);
    mgTexto(c, K.nombre, 0, -24, 36, '#4fa8ff');
    mgTexto(c, K.texto, 0, 26, 18, '#5a3a20', 'center', null, MG_FB);
    c.restore(); c.globalAlpha = 1;
  }
}
function mgPintaPartida(c, t, dt) {
  MG_HUD.botones.length = 0;
  mgFondo(c);
  mgPintaTablero(c, t);
  mgPintaMarcador(c, t);
  mgPintaAbajo(c, t);
  mgPintaAvisos(c);
  mgConejosAvanza(dt);
}
