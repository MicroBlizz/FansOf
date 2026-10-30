// Fans of Merge · las LOSETAS del camino de tierra, pintadas a mano como en Animal Crossing (no una forma recortada por código).
// De una losa grande de Yoshi (un cuadrado de tierra sobre hierba, img/losa.png) salen la tierra lisa del centro y los 4 bordes rectos,
// con la hierba, las flores y las piedrecitas pintadas comiéndose el borde. El contorno del camino es una sola línea que da la vuelta sin
// cortes: los tramos rectos llevan el borde pintado y cada curva, ese mismo borde doblado (mgBordeCurvo), así todo casa y enlaza suave.
// Dentro, unos detallitos de Yoshi repartidos al azar (mgDetalles). El dibujo en la partida y el camino de repuesto están en js/camino.js.
'use strict';
// Medidas, en partes del lado de la imagen (merge_losas.py deja el cuadrado de tierra en los 2/3 del centro):
// B = el borde de la losa (hierba, ondas y un poco de tierra); E = hasta dónde llega su esquina redonda (los lados se toman sin ella);
// O = cuánta tierra de más lleva cada pieza por dentro, que se funde con el centro; F = cuánta hierba se desvanece por fuera, para fundirse con el suelo;
// C = desde dónde se toma el centro liso.
// En partes de casilla: I = el margen de hierba que deja la tierra dentro de su casilla (como en Triple Town); S = cuánto más estrecho que la losa
// es el pasillo que la une con la vecina, por cada lado; A = lo ancho que se pinta el borde B; R = el radio más grande de una curva.
const MG_LOSA = { de: '', piezas: null, B: 0.2, E: 0.38, O: 0.06, F: 0.14, C: 0.34, I: 0.16, S: 0.15, A: 0.22, R: 0.24 };
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
  const A = MG_IMG.LOSA;
  if (!A) return false;
  if (MG_LOSA.de === A.src) return true;
  const L = MG_LOSA, w = A.width, b = w * L.B, o = w * L.O, f = w * L.F, e = w * L.E + o, lado = w - 2 * (e - o);   // lado = lo que queda de lado entre esquinas
  const cc = w * L.C, P = { c: mgLosaTrozo(A, cc, cc, w - 2 * cc, w - 2 * cc, [0, 0, 0, 0]) };   // el centro: tierra lisa, sin las manchas de cerca del borde (al voltearse formarían una flor en cada cruce)
  // los lados (sin sus esquinas): hierba por fuera, que se desvanece, y un poco de tierra por dentro, que se funde con el centro
  P.n = mgLosaTrozo(A, e - o, 0, lado, b + o, [0, 0, f, o]); P.s = mgLosaTrozo(A, e - o, w - b - o, lado, b + o, [0, 0, o, f]);
  P.o = mgLosaTrozo(A, 0, e - o, b + o, lado, [f, o, 0, 0]); P.e = mgLosaTrozo(A, w - b - o, e - o, b + o, lado, [o, f, 0, 0]);
  MG_LOSA.piezas = P; MG_LOSA.de = A.src;
  return true;
}
// Un borde pintado doblado en un cuarto de círculo de centro (cx, cy) y radio r, desde el punto t1 hasta el t2 (vistos desde el centro).
// Es el mismo borde de la losa (P.n), a tiras finas, así tiene el mismo trazo, color y grosor que los bordes rectos. fuera = true si la
// hierba queda por fuera de la curva (esquina de la tierra); false si queda por dentro (rincón, donde dos caminos se juntan en ángulo).
function mgBordeCurvo(c, cx, cy, r, t1, t2, fuera, sb, so) {
  const pz = MG_LOSA.piezas.n, grosor = sb + so, rr = pz.height / grosor;
  const a0 = Math.atan2(t1[1] - cy, t1[0] - cx); let a1 = Math.atan2(t2[1] - cy, t2[0] - cx);
  if (a1 - a0 > Math.PI) a1 -= 2 * Math.PI; if (a0 - a1 > Math.PI) a1 += 2 * Math.PI;
  const n = Math.max(6, Math.ceil(Math.abs(a1 - a0) * (r + sb) / 3)), paso = (a1 - a0) / n;
  const b0 = fuera ? 0 : Math.max(0, sb - r + 0.5), b1 = fuera ? Math.min(grosor, r + sb - 0.5) : grosor;   // lo que cabe sin cruzar el centro
  for (let i = 0; i < n; i++) {
    const ang = a0 + paso * (i + 0.5), er = [Math.cos(ang), Math.sin(ang)], et = [-er[1], er[0]];
    const ancho = Math.abs(paso) * (r + sb) * 1.2, u = (i * Math.abs(paso) * r * rr) % Math.max(1, pz.width - ancho * rr);
    // la tira: a lo largo de la curva (et) y de través (er): la hierba, por fuera o por dentro según la curva
    c.save();
    if (fuera) c.transform(et[0], et[1], -er[0], -er[1], cx + er[0] * (r + sb), cy + er[1] * (r + sb));
    else c.transform(et[0], et[1], er[0], er[1], cx + er[0] * (r - sb), cy + er[1] * (r - sb));
    c.drawImage(pz, u, b0 * rr, Math.max(1, ancho * rr), (b1 - b0) * rr, -ancho / 2, b0, ancho, b1 - b0);
    c.restore();
  }
}
// El patrón de tierra: el centro de la losa y sus tres reflejos, en un cuadro de 2x2 que se repite sin juntas
function mgTierraPatron(c, cs) {
  const P = MG_LOSA.piezas, k = mgK(), lado = Math.round(cs * k), clave = lado + '|' + MG_LOSA.de;
  if (MG_LOSA.patronDe !== clave) {
    const cv = document.createElement('canvas'); cv.width = cv.height = lado * 2; const g = cv.getContext('2d');
    for (const [vx, vy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) { g.save(); g.translate(lado * (vx < 0 ? 2 : 0), lado * (vy < 0 ? 2 : 0)); g.scale(vx, vy); g.drawImage(P.c, 0, 0, lado, lado); g.restore(); }
    MG_LOSA.patron = cv; MG_LOSA.patronDe = clave;
  }
  const pat = c.createPattern(MG_LOSA.patron, 'repeat');
  pat.setTransform(new DOMMatrix([1 / k, 0, 0, 1 / k, MG_V.bx, MG_V.by]));
  return pat;
}
// Pinta el camino con las losetas en el lienzo c (ya con la escala puesta). libre(x, y) dice si una casilla es del camino.
// Como en Triple Town, la tierra no llena la casilla: deja un margen de hierba (MG_LOSA.I) y solo llega al borde por donde sigue el camino,
// y por ahí con un pasillo más estrecho que la losa (le quita MG_LOSA.S por cada lado). Para eso cada casilla se parte en 5x5 trocitos
// (margen, hombro, medio, hombro, margen): los 3x3 del centro son la losa, siempre de tierra; el medio de un margen es el pasillo, de tierra
// si esa vecina es camino; las esquinas y los hombros de los márgenes son siempre hierba.
// Con los trocitos de tierra se saca el contorno entero del camino (una línea que da la vuelta sin cortes) y se redondea cada esquina con el
// radio más grande que cabe (la mitad del tramo recto más corto de los dos que llegan a ella): así las curvas enlazan suaves, también en
// el estrechamiento del pasillo. La tierra se rellena con esa forma; los tramos rectos llevan el borde pintado y las curvas, ese borde doblado.
function mgLosetasPinta(c, libre) {
  const L = MG_LOSA, P = L.piezas, cs = MG_V.cs, n = MG_CFG.lado, ins = cs * L.I;
  const esc = cs * L.A / L.B;   // px de pantalla por cada parte de imagen: el borde B se pinta de ancho A
  const sb = esc * L.B, so = esc * L.O, Rmax = cs * L.R;
  const sh = cs * L.S, off = [0, ins, ins + sh, cs - ins - sh, cs - ins, cs];
  const camino = (x, y) => x >= 0 && y >= 0 && x < n && y < n && libre(x, y);
  // ¿es tierra el trocito (i, j) de la casilla (x, y)? en coordenadas globales de trocito: gx = 5x + i
  const T = (gx, gy) => {
    const x = Math.floor(gx / 5), y = Math.floor(gy / 5), i = gx - 5 * x, j = gy - 5 * y;
    if (!camino(x, y)) return false;
    if (i >= 1 && i <= 3 && j >= 1 && j <= 3) return true;   // la losa
    if (i === 2 && (j === 0 || j === 4)) return camino(x, y + (j ? 1 : -1));   // el pasillo de arriba o abajo
    if (j === 2 && (i === 0 || i === 4)) return camino(x + (i ? 1 : -1), y);   // el de la izquierda o la derecha
    return false;
  };
  const PX = g => MG_V.bx + Math.floor(g / 5) * cs + off[((g % 5) + 5) % 5], PY = g => MG_V.by + Math.floor(g / 5) * cs + off[((g % 5) + 5) % 5];   // la esquina de un trocito, en px
  const celdas = []; for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (camino(x, y)) celdas.push([x, y]);
  const trozos = []; for (const [x, y] of celdas) for (let j = 0; j < 5; j++) for (let i = 0; i < 5; i++) if (T(5 * x + i, 5 * y + j)) trozos.push([5 * x + i, 5 * y + j]);
  // 1) las aristas del contorno, con la tierra a la derecha (y hacia abajo): de cada trocito, sus lados que dan a la hierba
  const sale = new Map(), clave = (a, b) => a + ',' + b;
  const arista = (x0, y0, x1, y1, nx, ny) => sale.set(clave(x0, y0), { x0, y0, x1, y1, nx, ny });
  for (const [gx, gy] of trozos) {
    if (!T(gx, gy - 1)) arista(gx, gy, gx + 1, gy, 0, -1);
    if (!T(gx + 1, gy)) arista(gx + 1, gy, gx + 1, gy + 1, 1, 0);
    if (!T(gx, gy + 1)) arista(gx + 1, gy + 1, gx, gy + 1, 0, 1);
    if (!T(gx - 1, gy)) arista(gx, gy + 1, gx, gy, -1, 0);
  }
  // 2) las vueltas: se siguen las aristas y se juntan las seguidas que van rectas en tramos
  const vueltas = [], vistas = new Set();
  for (const [k0] of sale) {
    if (vistas.has(k0)) continue;
    const tramos = []; let k = k0;
    while (!vistas.has(k) && sale.has(k)) {
      vistas.add(k); const e = sale.get(k), u = tramos[tramos.length - 1];
      if (u && u.nx === e.nx && u.ny === e.ny) { u.x1 = e.x1; u.y1 = e.y1; } else tramos.push({ ...e });
      k = clave(e.x1, e.y1);
    }
    const p = tramos[0], u = tramos[tramos.length - 1];
    if (tramos.length > 1 && p.nx === u.nx && p.ny === u.ny) { u.x1 = p.x1; u.y1 = p.y1; tramos.shift(); }   // la vuelta empezó a mitad de un tramo
    for (const t of tramos) { t.a = [PX(t.x0), PY(t.y0)]; t.b = [PX(t.x1), PY(t.y1)]; t.len = Math.hypot(t.b[0] - t.a[0], t.b[1] - t.a[1]); t.d = [(t.b[0] - t.a[0]) / t.len, (t.b[1] - t.a[1]) / t.len]; }
    // el radio de cada esquina (al final de cada tramo): el más grande que cabe sin comerse más de medio tramo
    tramos.forEach((t, i) => { const s = tramos[(i + 1) % tramos.length]; t.r = Math.min(Rmax, t.len / 2, s.len / 2); t.fuera = t.d[0] * s.d[1] - t.d[1] * s.d[0] > 0; });
    vueltas.push(tramos);
  }
  // 3) la tierra: la forma entera con las esquinas redondeadas (los huecos de hierba de dentro van al revés y quedan vacíos)
  const forma = () => {
    c.beginPath();
    for (const tr of vueltas) {
      const m = tr.length, ini = tr[m - 1];
      c.moveTo((tr[0].a[0] + tr[0].b[0]) / 2, (tr[0].a[1] + tr[0].b[1]) / 2);
      for (let i = 0; i < m; i++) { const t = tr[i], s = tr[(i + 1) % m]; c.arcTo(t.b[0], t.b[1], (s.a[0] + s.b[0]) / 2, (s.a[1] + s.b[1]) / 2, t.r); }
      c.closePath(); void ini;
    }
  };
  forma(); c.fillStyle = mgTierraPatron(c, cs); c.fill('nonzero');
  c.save(); forma(); c.clip('nonzero'); mgDetalles(c, celdas, trozos, g => PX(g), g => PX(g + 1), g => PY(g), g => PY(g + 1), cs); c.restore();
  // 4) los bordes rectos (cada tramo, sin lo que se lleva la curva de cada punta)
  const tira = (pz, horiz, a0, a1, q0, grosor, base) => {   // la tira pintada se repite en espejo desde la esquina del tablero: sin cortes
    const largo = horiz ? pz.width : pz.height, r = (horiz ? pz.height : pz.width) / grosor;
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
  for (const tr of vueltas) tr.forEach((t, i) => {
    const antes = tr[(i - 1 + tr.length) % tr.length].r, a = [t.a[0] + t.d[0] * antes, t.a[1] + t.d[1] * antes], b = [t.b[0] - t.d[0] * t.r, t.b[1] - t.d[1] * t.r];
    if (t.ny) { const x0 = Math.min(a[0], b[0]), x1 = Math.max(a[0], b[0]); tira(t.ny < 0 ? P.n : P.s, true, x0, x1, t.ny < 0 ? a[1] - sb : a[1] - so, sb + so, MG_V.bx); }
    else { const y0 = Math.min(a[1], b[1]), y1 = Math.max(a[1], b[1]); tira(t.nx < 0 ? P.o : P.e, false, y0, y1, t.nx < 0 ? a[0] - sb : a[0] - so, sb + so, MG_V.by); }
  });
  // 5) las curvas: el mismo borde, doblado
  for (const tr of vueltas) tr.forEach((t, i) => {
    const s = tr[(i + 1) % tr.length], r = t.r, t1 = [t.b[0] - t.d[0] * r, t.b[1] - t.d[1] * r], t2 = [t.b[0] + s.d[0] * r, t.b[1] + s.d[1] * r];
    const cx = t1[0] + (t.fuera ? -t.nx : t.nx) * r, cy = t1[1] + (t.fuera ? -t.ny : t.ny) * r;
    mgBordeCurvo(c, cx, cy, r, t1, t2, t.fuera, sb, so);
  });
}
// Los detallitos del interior del camino, pintados por Yoshi (MG_DETALLES en js/sprites.js): cada casilla lleva de 0 a 3, elegidos al azar
// con la semilla de la partida, sin repetir en la misma casilla, girados, volteados y de tamaños distintos, y alguno en los pasillos.
// Así ninguna casilla se parece a otra. Van debajo de los bordes, que los tapan si se salen un poco.
function mgDetalles(c, celdas, trozos, tx0, tx1, ty0, ty1, cs) {
  const listos = MG_DETALLES.filter(([d]) => MG_IMG['DET_' + d]); if (!listos.length) return;
  const sem = MG_P.semillaCamino || 1, k = mgK();
  const azar = (a, b, i) => { let n = (a * 374761393 + b * 668265263 + i * 2246822519 + sem * 1442695041) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };
  const pon = (d, tam, gira, x, y, r1, r2, r3) => {
    const t = cs * tam * (0.8 + r1 * 0.35), sp = mgSpriteListo('DET_' + d, Math.max(16, Math.round(t * k))); if (!sp) return;
    c.save(); c.translate(x, y); c.rotate(gira ? r2 * Math.PI * 2 : (r2 - 0.5) * 0.4); c.scale(r3 < 0.5 ? -1 : 1, 1);
    c.globalAlpha = d === 'huellas' ? 0.7 : 0.95; c.drawImage(sp, -t / 2, -t / 2, t, t); c.restore();
  };
  for (const [x, y] of celdas) {
    // la losa de la casilla (sus 3x3 trocitos del centro), con un poco de margen para que no pisen el borde
    const g0 = 5 * x + 1, h0 = 5 * y + 1, x0 = tx0(g0), x1 = tx1(g0 + 2), y0 = ty0(h0), y1 = ty1(h0 + 2), m = cs * 0.08;
    const cuantos = Math.floor(azar(x, y, 0) * 3.4), usados = new Set(), puestos = [];
    for (let i = 0; i < cuantos; i++) {
      let elegido = null;
      for (let prueba = 0; prueba < 6 && !elegido; prueba++) { const e = listos[Math.floor(azar(x, y, 10 + i * 7 + prueba) * listos.length)]; if (!usados.has(e[0])) elegido = e; }
      if (!elegido) continue;
      let px = 0, py = 0, ok = false;
      for (let prueba = 0; prueba < 8 && !ok; prueba++) {   // un sitio que no pise a otro detallito
        px = x0 + m + azar(x, y, 100 + i * 13 + prueba) * (x1 - x0 - 2 * m); py = y0 + m + azar(x, y, 200 + i * 13 + prueba) * (y1 - y0 - 2 * m);
        ok = puestos.every(([qx, qy]) => Math.hypot(qx - px, qy - py) > cs * 0.2);
      }
      if (!ok) continue;
      usados.add(elegido[0]); puestos.push([px, py]);
      pon(elegido[0], elegido[1], elegido[2], px, py, azar(x, y, 300 + i), azar(x, y, 400 + i), azar(x, y, 500 + i));
    }
  }
  // y, a veces, uno pequeño en un pasillo
  for (const [gx, gy] of trozos) {
    const i = gx % 5, j = gy % 5; if (!((i === 2 && j === 0) || (i === 0 && j === 2))) continue;   // un pasillo por unión (el de arriba y el de la izquierda)
    if (azar(gx, gy, 600) > 0.4) continue;
    const e = listos.filter(([d]) => ['guijarros', 'hoja', 'trebol', 'florecita', 'huellas'].includes(d)); if (!e.length) continue;
    const d = e[Math.floor(azar(gx, gy, 601) * e.length)], cx = j === 0 ? (tx0(gx) + tx1(gx)) / 2 : tx0(gx), cy = j === 0 ? ty0(gy) : (ty0(gy) + ty1(gy)) / 2;
    pon(d[0], d[1] * 0.8, d[2], cx, cy, azar(gx, gy, 602), azar(gx, gy, 603), azar(gx, gy, 604));
  }
}
// el camino entero, dibujado una vez en su propio lienzo (a la escala real k de la pantalla)
function mgLosetasLienzo(libre, k) {
  const cv = document.createElement('canvas'); cv.width = Math.ceil(540 * k); cv.height = Math.ceil(MG_V.H * k);
  const c = cv.getContext('2d'); c.setTransform(k, 0, 0, k, 0, 0); c.imageSmoothingQuality = 'high';
  mgLosetasPinta(c, libre);
  return cv;
}
