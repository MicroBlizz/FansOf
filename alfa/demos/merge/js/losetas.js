// Fans of Merge · el CAMINO de tierra: LOSETAS pintadas a mano como en Animal Crossing (no una forma recortada por código), su camino de repuesto y su dibujo en la partida.
// De una losa grande (un cuadrado de tierra con las esquinas redondas sobre hierba, img/losa.png) salen el centro (tierra lisa), 4 lados y
// 4 esquinas redondas, con la hierba, las flores y las piedrecitas pintadas comiéndose el borde. De una isla (hierba redonda dentro de
// tierra, img/isla.png) salen los 4 rincones, donde dos caminos se juntan en ángulo.
// La tierra es algo más pequeña que la casilla (como en Triple Town) y solo se une con la vecina cuando las dos son camino; por cada lado
// que da a la hierba lleva su borde pintado y, en cada esquina de fuera, su esquina. Los bordes se repiten en espejo para no cortarse.
'use strict';
// Medidas, en partes del lado de la imagen (merge_losas.py deja el cuadrado de tierra, o el de hierba en la isla, en los 2/3 del centro):
// B = el borde de la losa (hierba, ondas y un poco de tierra); E = hasta dónde llega la esquina redonda contando desde el borde de la imagen;
// O = cuánta tierra de más lleva cada pieza por dentro, que se funde con el centro; F = cuánta hierba se desvanece por fuera, para fundirse con el suelo;
// IF = hasta dónde sale la esquina de la isla hacia la tierra; IR = hasta dónde entra en su hierba (su esquina redonda); C = desde dónde se toma el centro liso.
// En partes de casilla: I = el margen de hierba que deja la tierra dentro de su casilla (como en Triple Town); A = lo ancho que se pinta el borde B.
const MG_LOSA = { de: '', piezas: null, B: 0.2, E: 0.27, O: 0.06, F: 0.1, IF: 0.08, IR: 0.26, C: 0.27, I: 0.13, A: 0.24 };
// recorta una zona (x, y, w, h) de una imagen y la desvanece por los lados que se le digan: f = [izquierda, derecha, arriba, abajo], en px de la imagen
function mgLosaTrozo(im, x, y, w, h, f) {
  const cv = document.createElement('canvas'); cv.width = Math.max(1, Math.round(w)); cv.height = Math.max(1, Math.round(h));
  const c = cv.getContext('2d'); c.drawImage(im, x, y, w, h, 0, 0, cv.width, cv.height);
  c.globalCompositeOperation = 'destination-in';
  const tira = (L, horiz, f0, f1) => {
    if (!f0 && !f1) return;
    const g = horiz ? c.createLinearGradient(0, 0, L, 0) : c.createLinearGradient(0, 0, 0, L);
    g.addColorStop(0, f0 ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,1)'); g.addColorStop(Math.min(0.49, f0 / L), 'rgba(0,0,0,1)');
    g.addColorStop(Math.max(0.51, 1 - f1 / L), 'rgba(0,0,0,1)'); g.addColorStop(1, f1 ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,1)');
    c.fillStyle = g; c.fillRect(0, 0, cv.width, cv.height);
  };
  tira(cv.width, true, f[0], f[1]); tira(cv.height, false, f[2], f[3]);
  return cv;
}
function mgLosetasPrepara() {
  const A = MG_IMG.LOSA, I = MG_IMG.ISLA;
  if (!A || !I) return false;
  const clave = A.src + '|' + I.src; if (MG_LOSA.de === clave) return true;
  const L = MG_LOSA, w = A.width, b = w * L.B, m = w - 2 * b, o = w * L.O, f = w * L.F, e = w * L.E + o, lado = w - 2 * (e - o);   // lado = lo que queda de lado entre esquinas
  const cc = w * L.C, P = { c: mgLosaTrozo(A, cc, cc, w - 2 * cc, w - 2 * cc, [0, 0, 0, 0]) };   // el centro: tierra lisa, sin las manchas de cerca del borde (al voltearse formarían una flor en cada cruce)
  // los lados (sin sus esquinas): hierba por fuera, que se desvanece, y un poco de tierra por dentro, que se funde con el centro
  P.n = mgLosaTrozo(A, e - o, 0, lado, b + o, [0, 0, f, o]); P.s = mgLosaTrozo(A, e - o, w - b - o, lado, b + o, [0, 0, o, f]);
  P.o = mgLosaTrozo(A, 0, e - o, b + o, lado, [f, o, 0, 0]); P.e = mgLosaTrozo(A, w - b - o, e - o, b + o, lado, [o, f, 0, 0]);
  // las esquinas redondas, con su trozo de tierra, que tapan el pico cuadrado de la tierra de debajo
  P.no = mgLosaTrozo(A, 0, 0, e, e, [f, o, f, o]); P.ne = mgLosaTrozo(A, w - e, 0, e, e, [o, f, f, o]);
  P.so = mgLosaTrozo(A, 0, w - e, e, e, [f, o, o, f]); P.se = mgLosaTrozo(A, w - e, w - e, e, e, [o, f, o, f]);
  // la isla: su hierba redonda, dentro de la tierra, da los rincones donde dos caminos se juntan en ángulo
  const wi = I.width, t = wi / 6, fi = wi * L.IF, ri = wi * L.IR, fo = wi * L.F, oi = wi * L.O;
  P.ino = mgLosaTrozo(I, t - fi, t - fi, fi + ri, fi + ri, [oi, fo, oi, fo]); P.ine = mgLosaTrozo(I, wi - t - ri, t - fi, fi + ri, fi + ri, [fo, oi, oi, fo]);
  P.iso = mgLosaTrozo(I, t - fi, wi - t - ri, fi + ri, fi + ri, [oi, fo, fo, oi]); P.ise = mgLosaTrozo(I, wi - t - ri, wi - t - ri, fi + ri, fi + ri, [fo, oi, fo, oi]);
  MG_LOSA.piezas = P; MG_LOSA.de = clave; MG_LOSA.px = 1 / w;   // px: una unidad de imagen, en partes del lado
  return true;
}
// Pinta el camino con las losetas en el lienzo c (ya con la escala puesta). libre(x, y) dice si una casilla es del camino.
// Como en Triple Town, la tierra no llena la casilla: deja un margen de hierba (MG_LOSA.I) y solo llega al borde por donde sigue el camino.
// Para eso cada casilla se parte en 3x3 trocitos (margen, centro, margen): el del centro siempre es tierra, el de un lado si esa vecina
// es camino, y el de una esquina si las tres casillas de ese lado lo son. Los bordes pintados se ponen donde un trocito de tierra toca hierba,
// las esquinas redondas de la losa donde la hierba lo rodea por dos lados y las de la isla en los rincones.
function mgLosetasPinta(c, libre) {
  const L = MG_LOSA, P = L.piezas, cs = MG_V.cs, n = MG_CFG.lado, ins = cs * L.I;
  const esc = cs * L.A / L.B;   // px de pantalla por cada parte de imagen: el borde B se pinta de ancho A
  const sb = esc * L.B, so = esc * L.O, se = esc * L.E + so, sif = esc * L.IF, sir = esc * L.IR;
  const X = x => MG_V.bx + x * cs, Y = y => MG_V.by + y * cs, off = [0, ins, cs - ins, cs];
  const camino = (x, y) => x >= 0 && y >= 0 && x < n && y < n && libre(x, y);
  // ¿es tierra el trocito (i, j) de la casilla (x, y)? en coordenadas globales de trocito: gx = 3x + i
  const T = (gx, gy) => {
    const x = Math.floor(gx / 3), y = Math.floor(gy / 3), dx = gx - 3 * x - 1, dy = gy - 3 * y - 1;
    if (!camino(x, y)) return false;
    if (dx && dy) return camino(x + dx, y) && camino(x, y + dy) && camino(x + dx, y + dy);
    return !dx && !dy ? true : camino(x + dx, y + dy);
  };
  const tx0 = g => X(Math.floor(g / 3)) + off[g % 3], tx1 = g => X(Math.floor(g / 3)) + off[g % 3 + 1];
  const ty0 = g => Y(Math.floor(g / 3)) + off[g % 3], ty1 = g => Y(Math.floor(g / 3)) + off[g % 3 + 1];
  const pon = (pz, dx, dy, dw, dh, vx, vy) => { c.save(); c.translate(dx + dw / 2, dy + dh / 2); c.scale(vx, vy); c.drawImage(pz, -dw / 2, -dh / 2, dw, dh); c.restore(); };
  // un tramo de borde de a0 a a1: la tira pintada se repite en espejo (ida, vuelta, ida...) contando desde la esquina del tablero,
  // así un borde largo sigue sin cortes aunque lo pinten varios trocitos
  const tramo = (pz, horiz, a0, a1, q0, grosor, base) => {
    const largo = horiz ? pz.width : pz.height, r = (horiz ? pz.height : pz.width) / grosor;   // px de la tira por px de pantalla
    let a = a0;
    while (a < a1 - 0.01) {
      const u = (a - base) * r, k = Math.floor(u / largo + 1e-6), dentro = u - k * largo;
      const fin = Math.min(a1, a + (largo - dentro) / r), len = (fin - a) * r, s0 = k % 2 ? largo - dentro - len : dentro;
      c.save();
      if (horiz) { c.translate(k % 2 ? fin : a, q0); c.scale(k % 2 ? -1 : 1, 1); c.drawImage(pz, s0, 0, len, pz.height, 0, 0, fin - a + 0.6, grosor); }
      else { c.translate(q0, k % 2 ? fin : a); c.scale(1, k % 2 ? -1 : 1); c.drawImage(pz, 0, s0, pz.width, len, 0, 0, grosor, fin - a + 0.6); }
      c.restore(); a = fin;
    }
  };
  const celdas = []; for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (camino(x, y)) celdas.push([x, y]);
  const trozos = []; for (const [x, y] of celdas) for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) if (T(3 * x + i, 3 * y + j)) trozos.push([3 * x + i, 3 * y + j]);
  // la tierra: el centro de la losa, recortado a los trocitos de tierra (volteado en casillas alternas para que no se vea la junta)
  for (const [x, y] of celdas) {
    c.save(); c.beginPath();
    for (const [gx, gy] of trozos) if (Math.floor(gx / 3) === x && Math.floor(gy / 3) === y) c.rect(tx0(gx) - 0.5, ty0(gy) - 0.5, tx1(gx) - tx0(gx) + 1, ty1(gy) - ty0(gy) + 1);
    c.clip(); pon(P.c, X(x), Y(y), cs, cs, x % 2 ? -1 : 1, y % 2 ? -1 : 1); c.restore();
  }
  // los bordes que dan a la hierba
  for (const [gx, gy] of trozos) {
    const x0 = tx0(gx), x1 = tx1(gx), y0 = ty0(gy), y1 = ty1(gy);
    if (!T(gx, gy - 1)) tramo(P.n, true, x0, x1, y0 - sb, sb + so, MG_V.bx);
    if (!T(gx, gy + 1)) tramo(P.s, true, x0, x1, y1 - so, sb + so, MG_V.bx);
    if (!T(gx - 1, gy)) tramo(P.o, false, y0, y1, x0 - sb, sb + so, MG_V.by);
    if (!T(gx + 1, gy)) tramo(P.e, false, y0, y1, x1 - so, sb + so, MG_V.by);
  }
  for (const [gx, gy] of trozos) for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const a = T(gx + sx, gy), v = T(gx, gy + sy);
    if (!a && !v) {   // esquina de fuera: la redonda de la losa, encima del pico de la tierra
      pon(P[(sy < 0 ? 'n' : 's') + (sx < 0 ? 'o' : 'e')], sx < 0 ? tx0(gx) - sb : tx1(gx) + sb - se, sy < 0 ? ty0(gy) - sb : ty1(gy) + sb - se, se, se, 1, 1);
    } else if (a && v && !T(gx + sx, gy + sy)) {   // rincón: solo lo pinta el trocito que ve la hierba en diagonal, así sale una vez
      const cx = sx > 0 ? tx1(gx) : tx0(gx), cy = sy > 0 ? ty1(gy) : ty0(gy);   // el punto del rincón
      pon(P['i' + (sy > 0 ? 'n' : 's') + (sx > 0 ? 'o' : 'e')], sx > 0 ? cx - sif : cx - sir, sy > 0 ? cy - sif : cy - sir, sif + sir, sif + sir, 1, 1);
    }
  }
}
// el camino entero, dibujado una vez en su propio lienzo (a la escala real k de la pantalla)
function mgLosetasLienzo(libre, k) {
  const cv = document.createElement('canvas'); cv.width = Math.ceil(540 * k); cv.height = Math.ceil(MG_V.H * k);
  const c = cv.getContext('2d'); c.setTransform(k, 0, 0, k, 0, 0); c.imageSmoothingQuality = 'high';
  mgLosetasPinta(c, libre);
  return cv;
}

// ---- El camino de repuesto (si la losa aún no ha cargado) y el dibujo del camino en la partida ----
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
    const k = mgK(), clave = [k, MG_V.H, MG_CFG.lado, cs, [...P.camino].join(','), MG_IMG.TIERRA.src, losas, ['ADORNO1', 'ADORNO2', 'ADORNO3', 'ADORNO4', 'ADORNO5', 'ADORNO6'].filter(q => MG_IMG[q]).length].join('|');   // se rehace cuando llega un dibujo
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
