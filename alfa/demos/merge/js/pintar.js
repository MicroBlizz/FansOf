// Fans of Merge · PINTAR: el dibujo de la partida en el canvas. La pradera ES el tablero: sin cuadrícula ni marco, las piezas
// están sobre la hierba y las casillas vacías son caminitos de tierra que se unen. Arriba, poca cosa: puntos, el objetivo,
// la pieza actual, la reserva y el Rayo zanahoria. Abajo, qué es la pieza actual y en qué se convierte.
// Medidas lógicas: 540 de ancho y entre 960 y 1170 de alto (MG_V.H), como los demás juegos verticales de la serie.
'use strict';
const MG_V = { sc: 1, dpr: 1, H: 960, cs: 86, bx: 12, by: 250 };
const MG_HUD = { botones: [] };
const MG_TAU = Math.PI * 2;
function mgMide() { MG_V.cs = Math.min(104, Math.floor(516 / MG_CFG.lado)); MG_V.bx = (540 - MG_V.cs * MG_CFG.lado) / 2; MG_V.by = 246 + Math.round((MG_V.H - 960) * 0.45); }   // el tablero, debajo del marcador; si la pantalla es más alta, el hueco se reparte
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
function mgFondo(c, portada) {   // la portada usa la ilustración del prado; la partida, la textura lisa (no compite con las piezas)
  const S = MG_IMG.SUELO;
  if (S && !(portada && MG_IMG.FONDO)) {   // la textura pintada del prado, repetida
    if (!MG_V.patron || MG_V.patronDe !== S) { MG_V.patron = c.createPattern(S, 'repeat'); MG_V.patronDe = S; }
    c.save(); c.scale(0.5, 0.5); c.fillStyle = MG_V.patron; c.fillRect(0, 0, 1080, MG_V.H * 2); c.restore(); return;
  }
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
  if (!mgImg(c, 'TABLON', 124, 4, 292, 64)) mgPanel(c, 130, 10, 280, 52, 18, MG_PILDORA, null);
  mgTexto(c, fmt(P.pts), 270, 37, 36, '#fff6c8', 'center', null);
  if (P.nivel) mgPintaTurnos(c, t);
  if (P.racha >= 2) {   // la racha: una llama con su multiplicador, que late
    const e = MG_FX.t - MG_FX.racha, s = 1 + Math.max(0, 0.4 - e) + Math.sin(t * 8) * 0.04, m = mgMultRacha();
    c.save(); c.translate(436, 38); c.scale(s * 0.72, s * 0.72);
    c.beginPath(); c.moveTo(0, -30); c.quadraticCurveTo(26, -4, 16, 18); c.quadraticCurveTo(0, 30, -16, 18); c.quadraticCurveTo(-26, -4, 0, -30);
    c.fillStyle = m >= 2 ? '#ff4f2e' : '#ff8a2a'; c.fill(); c.lineWidth = 3.5; c.strokeStyle = OL; c.stroke();
    mgTexto(c, 'x' + fmtV(m), 0, 6, 17, '#fff', 'center', OL); c.restore();
  }
  if (P.nivel) { mgPintaObjNivel(c, t); mgEtiqueta(c, tr('Nivel {n}', { n: P.nivel.id }), 270, 66, 11); }
  else {
  const O = mgObjetivo(), ok = O.de ? clamp((P.pts - O.desde) / (O.de - O.desde), 0, 1) : 1;
  if (!mgImg(c, 'TABLON', 114, 64, 312, 42)) mgPanel(c, 120, 68, 300, 34, 14, MG_PILDORA, null);
  mgTexto(c, O.de ? tr('Consigue {n} puntos', { n: fmt(O.de) }) : tr('¡Todos los objetivos!'), 232, 86, 15, '#fff', 'center', null, MG_FB);
  mgPanel(c, 350, 76, 60, 18, 9, 'rgba(255,255,255,.18)', null); if (ok > 0.25) mgPanel(c, 350, 76, 60 * ok, 18, 9, '#9be35a', null);
  mgTexto(c, Math.floor(ok * 100) + '%', 380, 86, 12, '#fff', 'center', 'rgba(0,0,0,.5)', MG_FB);
  }
  // pausa (rueda dentada)
  if (mgImg(c, 'BOTON', 462, 8, 70, 70)) { /* el botón pintado ya lleva su símbolo de pausa */ } else {
  mgPanel(c, 466, 12, 62, 62, 18, '#ff9a3c', OL, 4);
  c.save(); c.translate(497, 43); c.fillStyle = '#fff'; c.strokeStyle = OL; c.lineWidth = 3;
  [-9, 9].forEach(d => { c.beginPath(); rrPath(c, d - 5, -14, 10, 28, 3); c.fill(); c.stroke(); }); c.restore(); }
  mgBoton('pausa', 466, 12, 62, 62);
  // la pieza actual (también va con el dedo por el tablero)
  const fila = 116;
  if (!mgImg(c, 'MARCO', 8, fila - 4, 108, 120)) mgPanel(c, 12, fila, 100, 112, 20, 'rgba(255,248,230,.94)', OL, 3);
  mgEtiqueta(c, tr('AHORA'), 62, fila - 2, 14);
  mgDibujaPieza(c, P.actual, 62, fila + 66 + Math.sin(t * 3) * 2, 82, k);
  let x = 122;
  if (mgTiene('lince')) {
    if (!mgImg(c, 'MARCO', x - 3, fila + 15, 76, 100)) mgPanel(c, x, fila + 18, 70, 94, 16, 'rgba(255,248,230,.8)', OL, 3);
    mgEtiqueta(c, tr('LUEGO'), x + 35, fila + 15, 12);
    mgDibujaPieza(c, P.cola, x + 35, fila + 72, 58, k); x += 80;
  }
  P.reserva.forEach((r, i) => {
    if (!mgImg(c, 'MARCO', x - 3, fila + 15, 82, 100)) mgPanel(c, x, fila + 18, 76, 94, 16, r ? 'rgba(220,245,255,.96)' : 'rgba(220,245,255,.7)', OL, 3);
    mgEtiqueta(c, tr('RESERVA'), x + 38, fila + 15, 12);
    if (r) mgDibujaPieza(c, r, x + 38, fila + 72, 60, k);
    if (P.reservaEspera > 0) { mgPanel(c, x + 6, fila + 26, 70, 82, 12, 'rgba(20,30,10,.45)', null); mgTexto(c, String(P.reservaEspera), x + 38, fila + 70, 34, '#fff'); }
    mgBoton('reserva' + i, x, fila + 18, 76, 94); x += 86;
  });
  // el Rayo zanahoria: se llena con las fusiones
  const bx = 486, by = fila + 52, R = 38, listo = P.cargas > 0;
  c.beginPath(); c.arc(bx, by, R, 0, MG_TAU); c.fillStyle = listo ? '#ffb02e' : 'rgba(255,248,230,.85)'; c.fill(); c.lineWidth = 4; c.strokeStyle = OL; c.stroke();
  c.beginPath(); c.arc(bx, by, R - 7, -Math.PI / 2, -Math.PI / 2 + MG_TAU * (P.carga / MG_CFG.cargaHabilidad)); c.strokeStyle = '#ff6a2b'; c.lineWidth = 6; c.lineCap = 'round'; c.stroke(); c.lineCap = 'butt';
  if (MG_IMG.RAYO) { c.globalAlpha = listo ? 1 : 0.5; const g = P.modo === 'rayo' ? 1 + Math.sin(t * 10) * 0.08 : 1; mgImg(c, 'RAYO', bx - 30 * g, by - 30 * g, 60 * g, 60 * g); c.globalAlpha = 1; }
  else mgRayoIcono(c, bx, by, listo ? 1 : 0.45, P.modo === 'rayo' ? Math.sin(t * 10) * 0.15 : 0);
  if (P.cargas) { c.beginPath(); c.arc(bx + 27, by - 27, 13, 0, MG_TAU); c.fillStyle = '#ff4f6d'; c.fill(); c.lineWidth = 3; c.strokeStyle = OL; c.stroke(); mgTexto(c, String(P.cargas), bx + 27, by - 26, 16, '#fff', 'center', null); }
  mgEtiqueta(c, tr('RAYO'), bx, by + R + 8, 12);
  mgBoton('rayo', bx - R, by - R, R * 2, R * 2 + 16);
  if (P.tirachinas > 0) {
    const tx = 382, ty = fila + 30;
    mgPanel(c, tx, ty, 58, 58, 16, P.modo === 'tirachinas' ? '#ffd84a' : '#ff8a3d', OL, 3);
    if (!mgImg(c, 'TIRACHINAS', tx + 4, ty + 4, 50, 50)) mgTirachinasIcono(c, tx + 29, ty + 29);
    mgEtiqueta(c, tr('TIRACHINAS'), tx + 29, ty + 66, 10);
    mgBoton('tirachinas', tx, ty, 58, 76);
  }
}
// el rótulo de un marco: una tablilla de madera pintada centrada sobre el borde de arriba, con la letra blanca bordeada
function mgEtiqueta(c, txt, cx, cy, tam) {
  c.font = `${tam}px ${FONT_D}`; const w = c.measureText(txt).width + 22, h = tam + 12;
  if (!mgImg(c, 'TABLON', cx - w / 2, cy - h / 2, w, h)) mgPanel(c, cx - w / 2, cy - h / 2, w, h, 8, '#9a6a3c', OL, 2);
  mgTexto(c, txt, cx, cy + 1, tam, '#fff', 'center', OL);
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
// Ruido suave (value noise) con semilla: devuelve una función (x, y) → 0..1 que cambia despacio. Sirve para que el borde del camino ondule.
function mgRuido(semilla) {
  const h = (x, y) => { let n = (x * 374761393 + y * 668265263 + semilla * 1442695041) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };
  const sm = t => t * t * (3 - 2 * t);
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), fx = sm(x - xi), fy = sm(y - yi);
    const a = h(xi, yi), b = h(xi + 1, yi), c = h(xi, yi + 1), d = h(xi + 1, yi + 1);
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  };
}
// El dibujo del camino, hecho una vez por partida: cada casilla es un cuadrado de tierra pintada que solo redondea las esquinas
// que dan a la hierba; donde se toca con otra casilla del camino, sigue recto y se une. Hundido, con el borde difuso y una sombra por dentro.
function mgCaminoLienzo(libre, k) {
  const cs = MG_V.cs, n = MG_CFG.lado, W = Math.ceil(540 * k), H = Math.ceil(MG_V.H * k), r = cs * 0.24;
  const forma = (c, pad) => {
    c.beginPath();
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      if (!libre(x, y)) continue;
      const L = libre(x - 1, y), R = libre(x + 1, y), U = libre(x, y - 1), D = libre(x, y + 1), une = 1;   // hacia otra casilla del camino se pasa un poco: sin costura
      const x0 = MG_V.bx + x * cs - (L ? une : pad), y0 = MG_V.by + y * cs - (U ? une : pad), x1 = MG_V.bx + (x + 1) * cs + (R ? une : pad), y1 = MG_V.by + (y + 1) * cs + (D ? une : pad);
      const ri = (a, b) => (a || b ? 0 : r + pad);   // la esquina solo se redondea si no sigue el camino por ninguno de sus dos lados
      const tl = ri(L, U), tr = ri(R, U), br = ri(R, D), bl = ri(L, D);
      c.moveTo(x0 + tl, y0); c.lineTo(x1 - tr, y0); c.arcTo(x1, y0, x1, y0 + tr, tr); c.lineTo(x1, y1 - br); c.arcTo(x1, y1, x1 - br, y1, br);
      c.lineTo(x0 + bl, y1); c.arcTo(x0, y1, x0, y1 - bl, bl); c.lineTo(x0, y0 + tl); c.arcTo(x0, y0, x0 + tl, y0, tl); c.closePath();
    }
  };
  const capa = () => { const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const x = cv.getContext('2d'); x.setTransform(k, 0, 0, k, 0, 0); return [cv, x]; };
  const bl = px => `blur(${Math.max(1, Math.round(px * k))}px)`;
  // como en los juegos de este tipo: el camino es orgánico (todas las esquinas redondas, también las de dentro), un poco hundido,
  // con el borde difuso y una sombra suave por dentro, para que se funda con la hierba.
  // La forma: los cuadrados de las casillas, difuminados y vueltos a cortar por la mitad: así se redondea todo por igual.
  const [masc, m] = capa(); m.filter = bl(cs * 0.2); forma(m, cs * 0.02); m.fillStyle = '#000'; m.fill('nonzero');
  const d = m.getImageData(0, 0, W, H), a = d.data;
  const [borde, bo] = capa(); const db = bo.createImageData(W, H), ab = db.data;   // el contorno: la misma forma un poco más ancha, en marrón
  // el corte no es a la misma altura en todas partes: un ruido suave lo mueve, y el borde sale ondulado e irregular, como tierra pisada
  const ruido = mgRuido(MG_P.semillaCamino || 1), esc = 1 / (cs * k);
  for (let i = 3, p = 0; i < a.length; i += 4, p++) {
    ab[i - 3] = 107; ab[i - 2] = 69; ab[i - 1] = 35;
    if (a[i] === 0) continue;
    if (a[i] === 255) { ab[i] = 255; continue; }
    const px = (p % W) * esc, py = ((p / W) | 0) * esc;
    const corte = 0.45 + (ruido(px * 1.8, py * 1.8) - 0.5) * 0.55 + (ruido(px * 6, py * 6) - 0.5) * 0.22;
    const al = a[i] / 255, ve = (al - corte + 0.075) / 0.05;
    ab[i] = ve <= 0 ? 0 : ve >= 1 ? 255 : Math.round(ve * ve * (3 - 2 * ve) * 255);
    const v = (al - corte) / 0.05; a[i] = v <= 0 ? 0 : v >= 1 ? 255 : Math.round(v * v * (3 - 2 * v) * 255);
  }
  m.putImageData(d, 0, 0); bo.putImageData(db, 0, 0);
  const [lienzo, c] = capa(); c.setTransform(1, 0, 0, 1, 0, 0);
  c.filter = bl(cs * 0.05); c.globalAlpha = 0.18; c.drawImage(masc, 0, 0); c.globalAlpha = 1; c.filter = 'none';   // la hierba se oscurece un poco junto al camino
  const [tierra, t] = capa();
  t.fillStyle = t.createPattern(MG_IMG.TIERRA, 'repeat'); t.fillRect(0, 0, 540, MG_V.H);
  t.fillStyle = 'rgba(150,125,70,.10)'; t.fillRect(0, 0, 540, MG_V.H);   // tierra pisada, cálida
  t.setTransform(1, 0, 0, 1, 0, 0);
  const [sombra, so] = capa(); so.setTransform(1, 0, 0, 1, 0, 0);   // la sombra de dentro: más fuerte arriba y a la izquierda, como un hueco
  so.fillStyle = 'rgba(80,58,25,.40)'; so.fillRect(0, 0, W, H);
  so.globalCompositeOperation = 'destination-out'; so.filter = bl(cs * 0.08); so.drawImage(masc, cs * 0.03 * k, cs * 0.045 * k);
  t.drawImage(sombra, 0, 0);
  t.globalCompositeOperation = 'destination-in'; t.drawImage(masc, 0, 0);
  c.globalAlpha = 0.85; c.drawImage(borde, 0, 0); c.globalAlpha = 1;   // contorno marrón, como el de los dibujos
  c.drawImage(tierra, 0, 0);
  // los adornos pintados por Yoshi a lo largo del borde (matitas, piedrecitas, florecillas): siempre en los mismos sitios en la partida
  const adornos = ['ADORNO1', 'ADORNO2', 'ADORNO3', 'ADORNO4', 'ADORNO5', 'ADORNO6'].filter(q => MG_IMG[q]);
  if (adornos.length) {
    c.setTransform(k, 0, 0, k, 0, 0);
    const azar = mgRuido((MG_P.semillaCamino || 1) + 7);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      if (!libre(x, y)) continue;
      [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(([dx, dy], lado) => {
        if (libre(x + dx, y + dy)) return;   // solo donde el camino da a la hierba
        const z = azar(x * 3.7 + lado * 1.3, y * 2.9 + lado), cuantos = z < 0.35 ? 0 : z < 0.8 ? 1 : 2;
        for (let i = 0; i < cuantos; i++) {
          const u = azar(x * 5.1 + i * 2.3 + lado, y * 4.3 + i), q = adornos[Math.floor(azar(x * 7 + i, y * 9 + lado) * adornos.length * 0.999)];
          const along = (u - 0.5) * cs * 0.7, l = cs * (0.2 + azar(x + i * 3, y * 2 + lado) * 0.1);
          const cx = mgCx(x) + (dx ? dx * cs * 0.44 : along), cy = mgCy(y) + (dy ? dy * cs * 0.44 : along);
          mgImg(c, q, cx - l / 2, cy - l / 2, l, l);
        }
      });
    }
  }
  return lienzo;
}
function mgPintaCaminos(c, t) {
  const P = MG_P, cs = MG_V.cs, n = MG_CFG.lado, B = P.B, r = cs * 0.38, E = P.evento;
  const libre = (x, y) => mgDentro(x, y) && P.camino.has(y * 8 + x);   // el camino es fijo en cada partida: no cambia al poner piezas
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
  if (MG_IMG.TIERRA) {   // el camino, como en los juegos de este tipo: una casilla de tierra por hueco, y las que se tocan se unen
    const k = mgK(), clave = [k, MG_V.H, MG_CFG.lado, cs, [...P.camino].join(','), MG_IMG.TIERRA.src, ['ADORNO1', 'ADORNO2', 'ADORNO3', 'ADORNO4', 'ADORNO5', 'ADORNO6'].filter(q => MG_IMG[q]).length].join('|');   // se rehace cuando llega un adorno
    if (MG_V.caminoClave !== clave) { MG_V.caminoLienzo = mgCaminoLienzo(libre, k); MG_V.caminoClave = clave; }
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(MG_V.caminoLienzo, 0, 0); c.restore();
  } else {
  forma(3); c.fillStyle = 'rgba(70,60,20,.45)'; c.fill('nonzero');
  forma(0); c.fillStyle = '#c9b46e'; c.fill('nonzero');
  // piedrecitas del camino (fijas por casilla)
  c.fillStyle = 'rgba(120,100,50,.35)';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (libre(x, y)) for (let i = 0; i < 3; i++) { const s = (x * 7 + y * 13 + i * 5) % 11; c.beginPath(); c.arc(mgCx(x) - r * 0.6 + s * 4.5, mgCy(y) - r * 0.5 + ((s * 3 + i * 17) % 22) * 2.4, 2 + (s % 2), 0, MG_TAU); c.fill(); }
  }
  if (E && E.casillas.size) {   // las casillas mojadas: un charco azul con gotas y su x2
    for (const k of E.casillas) {
      const x = k % 8, y = (k / 8) | 0, cx = mgCx(x), cy = mgCy(y);
      if (!mgImg(c, 'CHARCO', cx - cs * 0.48, cy - cs * 0.2, cs * 0.96, cs * 0.6)) { c.beginPath(); c.ellipse(cx, cy + cs * 0.2, cs * 0.44, cs * 0.22, 0, 0, MG_TAU); c.fillStyle = 'rgba(110,190,255,.55)'; c.fill(); }
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
    c.beginPath(); c.ellipse(cx, mgCy(y) + cs * 0.34, cs * 0.32 * sc, cs * 0.09, 0, 0, MG_TAU); c.fillStyle = 'rgba(20,40,10,.3)'; c.fill();
    if (P.modo) { c.beginPath(); c.arc(cx, cy, cs * 0.46, 0, MG_TAU); c.strokeStyle = `rgba(255,${P.modo === 'rayo' ? 120 : 200},40,${0.5 + Math.sin(t * 8) * 0.4})`; c.lineWidth = 4; c.stroke(); }
    if (!A) sc *= 1 + Math.sin(t * 2.2 + p.id * 1.7) * 0.025;   // respiran un poco: el tablero está vivo
    if (p.t === 'zorro' || p.t === 'cuervo') mgPintaBicho(c, p, A, cx, cy, cs * 1.04, t);
    else mgDibujaPieza(c, p.t, cx, cy, cs * 1.04 * sc, k, p.s);
    if (p.t === 'cofre') mgEtiqueta(c, tr('¡Ábreme!'), cx, cy - cs * 0.5 + Math.sin(t * 5) * 2, 11);
  }
  if (P.sel && prev) {   // la pieza, en la casilla, a punto de soltarla
    const [x, y] = P.sel, sube = Math.sin(t * 5) * 3;
    mgDibujaPieza(c, prev.real, mgCx(x), mgCy(y) - 6 + sube, cs * 0.98, k);
    if (prev.final !== prev.real) { const w = 120; mgPanel(c, mgCx(x) - w / 2, mgCy(y) - cs * 0.82, w, 24, 12, '#fff8e6', OL, 3); mgTexto(c, '→ ' + tr(MG_PIEZAS[prev.final].nombre), mgCx(x), mgCy(y) - cs * 0.82 + 12, 12, '#c96a1e', 'center', null, MG_FB); }
  }
  const G = mgPaso();
  if (G && G.c && !P.sel) mgFlecha(c, mgCx(G.c[0]), mgCy(G.c[1]) - cs * 0.55 - Math.abs(Math.sin(t * 4)) * 10);
  else if (!G && !P.sel && !P.modo && P.turno < 5 && P.estado === 'jugando' && (!P.nivel || P.nivel.id <= 4)) {   // pista de los primeros turnos: una flecha que salta
    const q = mgPista(); if (q) mgFlecha(c, mgCx(q[0]), mgCy(q[1]) - cs * 0.55 - Math.abs(Math.sin(t * 4)) * 10);
  }
  for (const f of MG_FX.fantasmas) {   // las que vuelan a juntarse
    if (MG_FX.t < f.t0) { mgDibujaPieza(c, f.tipo, mgCx(f.fx), mgCy(f.fy), cs, k, f.s); continue; }
    const e = clamp((MG_FX.t - f.t0) / f.dur, 0, 1) ** 2;
    mgDibujaPieza(c, f.tipo, lerp(mgCx(f.fx), mgCx(f.tx), e), lerp(mgCy(f.fy), mgCy(f.ty), e), cs * (1 - e * 0.4), k, f.s);
  }
  for (const p of MG_FX.parts) {   // chispas y hojas pintadas (o puntos de color mientras no llegan)
    c.globalAlpha = clamp(1 - (MG_FX.t - p.t0) / p.vida, 0, 1);
    const k = p.r > 0.08 ? 'HOJA' : 'CHISPA', l = p.r * cs * 3.2;
    if (!mgImg(c, k, mgCx(p.x) - l / 2, mgCy(p.y) - l / 2, l, l)) { c.beginPath(); c.arc(mgCx(p.x), mgCy(p.y), p.r * cs, 0, MG_TAU); c.fillStyle = p.col; c.fill(); }
  }
  c.globalAlpha = 1;
  for (const o of MG_FX.ondas) {   // el anillo de luz de cada fusión
    const e = (MG_FX.t - o.t0) / 0.5; if (e < 0) continue;
    c.globalAlpha = 1 - e; const l = cs * (0.6 + e * (1.4 + o.grande * 0.5));
    if (!mgImg(c, 'CHISPA', mgCx(o.x) - l / 2, mgCy(o.y) - l / 2, l, l)) { c.beginPath(); c.arc(mgCx(o.x), mgCy(o.y), l / 2, 0, MG_TAU); c.strokeStyle = o.col; c.lineWidth = 8 * (1 - e) + 2; c.stroke(); }
  }
  c.globalAlpha = 1;
  const RL = MG_FX.relampago;
  if (RL && MG_FX.t - RL.t0 < 0.35) {   // el relámpago de la tormenta
    const cx = mgCx(RL.x), cy = mgCy(RL.y); c.globalAlpha = 1 - (MG_FX.t - RL.t0) / 0.35;
    if (mgImg(c, 'RELAMPAGO', cx - 50, cy - 270, 100, 280)) { c.globalAlpha = 1; } else {
    c.beginPath(); c.moveTo(cx + 20, cy - 260); c.lineTo(cx - 10, cy - 150); c.lineTo(cx + 14, cy - 140); c.lineTo(cx - 16, cy - 30); c.lineTo(cx + 6, cy - 34); c.lineTo(cx, cy);
    c.strokeStyle = '#fff6a0'; c.lineWidth = 7; c.stroke(); c.strokeStyle = '#ffffff'; c.lineWidth = 3; c.stroke(); c.globalAlpha = 1; }
  }
  for (const x of MG_FX.textos) { const e = MG_FX.t - x.t0; if (e < 0) continue; c.globalAlpha = clamp(1.4 - e * 1.3, 0, 1); mgTexto(c, x.txt, mgCx(x.x), mgCy(x.y) - 20 - e * 50, 22, '#fff6c8'); }
  c.globalAlpha = 1;
  c.restore();
}
function mgFlecha(c, x, y) {
  if (mgImg(c, 'FLECHA', x - 26, y - 30, 52, 52)) return;
  c.save(); c.translate(x, y); c.beginPath();
  c.moveTo(0, 16); c.lineTo(-18, -4); c.lineTo(-8, -4); c.lineTo(-8, -22); c.lineTo(8, -22); c.lineTo(8, -4); c.lineTo(18, -4); c.closePath();
  c.fillStyle = '#ffd23a'; c.fill(); c.lineWidth = 4; c.lineJoin = 'round'; c.strokeStyle = OL; c.stroke(); c.restore();
}

/* ---------- abajo: la pieza actual, qué hace y en qué se convierte ---------- */
function mgPintaAbajo(c, t) {
  const P = MG_P, y0 = MG_V.by + MG_V.cs * MG_CFG.lado + 14, k = mgK(), tipo = P.actual;
  if (!mgImg(c, 'TABLON', 6, y0 - 6, 528, 78)) mgPanel(c, 12, y0, 516, 66, 18, MG_PILDORA, null);
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
  if (P.cartas.length) { const C = MG_CARTAS.find(x => x.id === P.cartas[0]); mgEtiqueta(c, tr('Carta: {n}', { n: tr(C.nombre) }), 270, y0 + 90, 14); }
}
function mgDescripcion(tipo) {
  const T = mgTipoDe(tipo);
  if (T === 'zorro') return 'Solo anda por el camino de tierra. Tápale el paso y se dormirá.';
  if (T === 'cuervo') return 'Salta a cualquier hueco. Solo se duerme si no queda sitio.';
  if (T === 'semilla') return 'Se convierte en lo que mejor te venga.';
  if (T === 'topo') return 'Toca una pieza del tablero para quitarla.';
  if (MG_P.sel) return 'Suelta para plantar aquí. Arrastra para cambiar de casilla.';
  if (MG_P.turno < 4) return 'Toca una casilla para plantar. Mantén y arrastra para ver antes qué pasa.';
  return 'Junta tres que se toquen. Sobre el camino, +50 % de puntos.';
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
function mgPintaEstreno(c, t) {
  const S = MG_FX.estreno; if (!S) return;
  const e = MG_FX.t - S.t0, al = clamp(e < 0.2 ? e / 0.2 : (2.2 - e) / 0.4, 0, 1), cy = MG_V.by + MG_V.cs * 2.6;
  c.globalAlpha = al * 0.55; c.fillStyle = '#10200a'; c.fillRect(0, 0, 540, MG_V.H); c.globalAlpha = al;
  c.save(); c.translate(270, cy); c.rotate(t * 0.6);   // rayos de luz que giran
  for (let i = 0; i < 12; i++) { c.rotate(MG_TAU / 12); c.beginPath(); c.moveTo(0, 0); c.lineTo(-26, -260); c.lineTo(26, -260); c.closePath(); c.fillStyle = i % 2 ? 'rgba(255,230,120,.35)' : 'rgba(255,255,255,.18)'; c.fill(); }
  c.restore();
  const s = e < 0.35 ? 0.3 + (e / 0.35) * 0.85 : 1.15 - Math.min(0.15, (e - 0.35) * 0.6);
  mgDibujaPieza(c, S.tipo, 270, cy + Math.sin(t * 3) * 4, 230 * s, mgK(), true);
  mgTexto(c, tr('¡NUEVA PIEZA!'), 270, cy - 150, 34, '#ffe14d');
  mgTexto(c, tr(MG_PIEZAS[S.tipo].nombre), 270, cy + 140, 40, '#fff');
  c.globalAlpha = 1;
}
function mgPintaPartida(c, t, dt) {
  MG_HUD.botones.length = 0;
  mgFondo(c);
  mgPintaTablero(c, t);
  mgPintaMarcador(c, t);
  mgPintaAbajo(c, t);
  mgPintaAvisos(c);
  mgPintaGuion(c, t);
  mgPintaEstreno(c, t);
  mgConejosAvanza(dt);
}
