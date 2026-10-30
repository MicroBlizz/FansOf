// Fans of Merge · el CAMINO en la partida (mgPintaCaminos: losetas de js/losetas.js, charcos de la lluvia) y su camino de repuesto
// (mgCaminoLienzo: una forma recortada por código con la textura de tierra, mientras la losa de Yoshi no ha cargado).
'use strict';
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
    const losas = mgLosetasPrepara();   // con las losetas pintadas por Yoshi (js/losetas.js); si aún no están, la forma recortada de abajo
    const k = mgK(), clave = [k, MG_V.H, MG_CFG.lado, cs, [...P.camino].join(','), MG_IMG.TIERRA.src, losas, ['ADORNO1', 'ADORNO2', 'ADORNO3', 'ADORNO4', 'ADORNO5', 'ADORNO6'].filter(q => MG_IMG[q]).length, MG_DETALLES.filter(([d]) => MG_IMG['DET_' + d]).length, P.semillaCamino, !!MG_IMG.ADOQUIN].join('|');   // se rehace cuando llega un dibujo
    if (MG_V.caminoClave !== clave) { MG_V.caminoLienzo = losas ? mgLosetasLienzo(libre, k) : mgCaminoLienzo(libre, k); MG_V.caminoClave = clave; }
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
