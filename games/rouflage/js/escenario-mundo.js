// Fans of Rouflage · MI ESCENARIO (el mundo): tu escenario es un mapa del tamaño de los del juego, hecho de su forma (FORMAS_ESC) con el
// suelo y las paredes del escenario elegido (ESCENARIOS). escMundo(id) lo construye una vez: las salas, la rejilla (muro, suelo o pared de
// frente, como cargaDatosMapa) y los tramos de pared. Aquí también se pinta: el muro, los suelos y las paredes («crudo»), y encima de la
// pintura del jugador los bordes y el grano («remate»), con los mismos SUELOS y PAPELES que los mapas. Para que vaya fluido, el fondo va en
// BALDOSAS en caché (ESC_MUNDO.TILE unidades, a la escala de la pantalla): solo se rehace la baldosa que cambia (al pintar, la de debajo del
// pincel) y, mientras se hace una nueva, se ve la vista general en pequeño. No toca las variables del mapa de jugar (GRID, ZONAS…).
'use strict';
const ESC_MUNDO = { TILE: 256, MAX_PX: 11e6, PRESUPUESTO: 7 };
const _escMundos = {};
function escMundo(id) {
  if (typeof id === 'string' && id.startsWith('lienzo')) return _escMundos[id] || (_escMundos[id] = lzMundo(id));      // el LIENZO: la forma la dibuja el jugador (escenario-obra.js)
  id = ESCENARIOS[id] ? id : 'oficina';
  if (_escMundos[id]) return _escMundos[id];
  const E0 = ESCENARIOS[id], F = FORMAS_ESC[E0.forma] || FORMAS_ESC.oficina, b = E0.b || [E0.suelo, E0.pared], cc = E0.c || b;
  return (_escMundos[id] = escConstruye(id, E0, F, F.plano, { A: { nombre: '', suelo: E0.suelo, pared: E0.pared }, B: { nombre: '', suelo: b[0], pared: b[1] }, C: { nombre: '', suelo: cc[0], pared: cc[1] } }));
}
// un mundo a partir de su plano (letras de 2 × 2 casillas) y de qué suelo y pared lleva cada letra
function escConstruye(id, E0, F, plano, letras) {
  const filas = plano.split('\n').filter(f => f.length), MW = filas[0].length * 2, MH = filas.length * 2;
  const zonas = salasDePlano(plano, letras, 2);
  for (const z of zonas) { z.px = z.x * CEL; z.py = z.y * CEL; z.pw = z.w * CEL; z.ph = z.h * CEL; }
  const grid = new Uint8Array(MW * MH), zonaDe = new Int16Array(MW * MH).fill(-1);
  zonas.forEach((z, i) => { for (let y = z.y; y < z.y + z.h; y++) for (let x = z.x; x < z.x + z.w; x++) { grid[y * MW + x] = SUELO; zonaDe[y * MW + x] = i; } });
  for (let y = 1; y < MH; y++) for (let x = 0; x < MW; x++) {      // la pared de frente encima de cada suelo que acaba por arriba
    if (grid[y * MW + x] !== SUELO || grid[(y - 1) * MW + x] === SUELO) continue;
    for (let k = 1; k <= ALTO_CARA && y - k >= 0; k++) { const j = (y - k) * MW + x; if (grid[j] !== VACIO) break; grid[j] = CARA; zonaDe[j] = zonaDe[y * MW + x]; }
  }
  const caras = []; let tramo = null;
  for (let y = 1; y < MH; y++) for (let x = 0; x <= MW; x++) {
    const base = x < MW && grid[y * MW + x] === SUELO && grid[(y - 1) * MW + x] === CARA;
    let alto = 0; if (base) while (alto < ALTO_CARA && grid[(y - 1 - alto) * MW + x] === CARA) alto++;
    const z = base ? zonaDe[y * MW + x] : -1;
    if (tramo && (!base || tramo.zi !== z || tramo.alto !== alto)) { tramo.x1 = x * CEL; caras.push(tramo); tramo = null; }
    if (base && !tramo) tramo = { zi: z, zona: zonas[z], alto, x0: x * CEL, y0: (y - alto) * CEL, y1: y * CEL };
  }
  return { id, E0, F, MW, MH, W: MW * CEL, H: MH * CEL, grid, zonaDe, zonas, caras, muro: E0.muro || COLOR_MURO, canto: E0.canto || COLOR_CANTO,
    armario: { x: F.armario[0], y: F.armario[1], armario: true }, salida: F.salida, origen: ESC_ORIGEN };
}
const escTipoEn = (M, x, y) => (x < 0 || y < 0 || x >= M.W || y >= M.H ? VACIO : M.grid[((y / CEL) | 0) * M.MW + ((x / CEL) | 0)]);
// ¿es suelo todo el rectángulo?
function escSueloCaja(M, x0, y0, x1, y1) {
  const i0 = Math.floor(x0 / CEL), i1 = Math.floor((x1 - 0.01) / CEL), j0 = Math.floor(y0 / CEL), j1 = Math.floor((y1 - 0.01) / CEL);
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) if (i < 0 || j < 0 || i >= M.MW || j >= M.MH || M.grid[j * M.MW + i] !== SUELO) return false;
  return true;
}

/* ---------- pintar el mundo vacío (c ya en unidades del mundo; R, el trozo) ---------- */
function _escRango(M, R) { return [Math.max(0, Math.floor(R.x0 / CEL) - 1), Math.min(M.MW - 1, Math.ceil(R.x1 / CEL)), Math.max(0, Math.floor(R.y0 / CEL) - 1), Math.min(M.MH - 1, Math.ceil(R.y1 / CEL))]; }
function escPintaCrudo(c, M, R) {
  c.save(); c.beginPath(); c.rect(R.x0, R.y0, R.x1 - R.x0, R.y1 - R.y0); c.clip();
  c.fillStyle = M.muro; c.fillRect(R.x0, R.y0, R.x1 - R.x0, R.y1 - R.y0);      // el muro visto desde arriba, con sus chapas
  c.strokeStyle = 'rgba(255,255,255,0.035)'; c.lineWidth = 2; c.beginPath();
  for (let x = Math.floor(R.x0 / 60) * 60; x <= R.x1; x += 60) { c.moveTo(x, R.y0); c.lineTo(x, R.y1); }
  for (let y = Math.floor(R.y0 / 60) * 60; y <= R.y1; y += 60) { c.moveTo(R.x0, y); c.lineTo(R.x1, y); }
  c.stroke();
  const [i0, i1, j0, j1] = _escRango(M, R);
  for (const [crece, color] of [[10, OL], [7, M.canto]]) {
    c.fillStyle = color;
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) if (M.grid[j * M.MW + i] !== VACIO) c.fillRect(i * CEL - crece, j * CEL - crece, CEL + crece * 2, CEL + crece * 2);
  }
  for (const z of M.zonas) {
    if (z.px > R.x1 || z.px + z.pw < R.x0 || z.py > R.y1 || z.py + z.ph < R.y0) continue;
    c.save(); c.beginPath(); c.rect(z.px, z.py, z.pw, z.ph); c.clip();
    try { SUELOS[z.suelo](c, z, R); pintaPatron(c, z, R); pintaLamparas(c, z); } catch (e) { console.warn('[escenario]', e); }
    c.restore();
  }
  for (const t of M.caras) {
    if (t.x1 < R.x0 || t.x0 > R.x1 || t.y1 < R.y0 || t.y0 > R.y1) continue;
    c.save(); c.beginPath(); c.rect(t.x0, t.y0, t.x1 - t.x0, t.y1 - t.y0); c.clip();
    try { PAPELES[t.zona.pared](c, t); } catch (e) { console.warn('[escenario]', e); }
    if (M.E0.zumbido && t.y1 - t.y0 >= 60) for (let x = Math.ceil(t.x0 / 200) * 200 + 100; x < t.x1 - 40; x += 200) { forma(c, caja(x - 30, t.y0 + 5, 60, 8, 3), '#fffbd8', 2.2); c.fillStyle = 'rgba(255,250,200,0.22)'; c.fillRect(x - 50, t.y0 + 13, 100, 20); }   // los fluorescentes que zumban
    c.restore();
  }
  c.restore();
}
// lo que va encima de la pintura: la sombra de la pared en el suelo, el contorno grueso y el grano
function escPintaRemate(c, M, R) {
  c.save(); c.beginPath(); c.rect(R.x0, R.y0, R.x1 - R.x0, R.y1 - R.y0); c.clip();
  const [i0, i1, j0, j1] = _escRango(M, R), en = (i, j) => (i < 0 || j < 0 || i >= M.MW || j >= M.MH ? VACIO : M.grid[j * M.MW + i]);
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
    if (en(i, j) !== SUELO) continue;
    const x = i * CEL, y = j * CEL;
    if (en(i, j - 1) === CARA) { const g = c.createLinearGradient(0, y, 0, y + 14); g.addColorStop(0, 'rgba(24,12,40,0.36)'); g.addColorStop(1, 'rgba(24,12,40,0)'); c.fillStyle = g; c.fillRect(x, y, CEL, 14); }
    c.fillStyle = 'rgba(24,12,40,0.16)';
    if (en(i - 1, j) !== SUELO) c.fillRect(x, y, 5, CEL);
    if (en(i + 1, j) !== SUELO) c.fillRect(x + CEL - 5, y, 5, CEL);
  }
  c.strokeStyle = OL; c.lineWidth = 3; c.lineCap = 'square'; c.beginPath();
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
    const t = en(i, j); if (t === VACIO) continue;
    const x = i * CEL, y = j * CEL;
    if (en(i - 1, j) === VACIO) { c.moveTo(x, y); c.lineTo(x, y + CEL); }
    if (en(i + 1, j) === VACIO) { c.moveTo(x + CEL, y); c.lineTo(x + CEL, y + CEL); }
    if (en(i, j + 1) === VACIO) { c.moveTo(x, y + CEL); c.lineTo(x + CEL, y + CEL); }
    if (en(i, j - 1) === VACIO) { c.moveTo(x, y); c.lineTo(x + CEL, y); }
    if (t === CARA && en(i - 1, j) === SUELO) { c.moveTo(x, y); c.lineTo(x, y + CEL); }
    if (t === CARA && en(i + 1, j) === SUELO) { c.moveTo(x + CEL, y); c.lineTo(x + CEL, y + CEL); }
  }
  c.stroke(); c.lineCap = 'butt';
  pintaGrano(c, R);
  c.restore();
}
// la pintura del jugador en el trozo R: solo donde hay suelo o pared, con una sombrita debajo, los bordes suavizados y un brillo
function escPintaPintura(c, M, R, p, ks) {
  if (!p || !p.pal.length) return;
  const r = p.r, i0 = Math.max(0, Math.floor(R.x0 / r) - 2), i1 = Math.min(p.w, Math.ceil(R.x1 / r) + 2), j0 = Math.max(0, Math.floor(R.y0 / r) - 2), j1 = Math.min(p.h, Math.ceil(R.y1 / r) + 2);
  if (i1 <= i0 || j1 <= j0) return;
  if (!pinturaHay(p)) return;
  let hay = false; for (let j = j0; j < j1 && !hay; j++) for (let i = i0; i < i1; i++) if (p.cel[j * p.w + i]) { hay = true; break; }
  if (!hay) return;
  const img = pinturaLienzo(p), sombra = pinturaSombra(p), sw = i1 - i0, sh = j1 - j0, dx = i0 * r, dy = j0 * r, dw = sw * r, dh = sh * r;
  c.save(); c.beginPath();
  const [a0, a1, b0, b1] = _escRango(M, R);
  for (let j = b0; j <= b1; j++) { let i = a0; while (i <= a1) { if (M.grid[j * M.MW + i] === VACIO) { i++; continue; } const s = i; while (i <= a1 && M.grid[j * M.MW + i] !== VACIO) i++; c.rect(s * CEL, j * CEL, (i - s) * CEL, CEL); } }
  c.clip();
  c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high'; if ('filter' in c) c.filter = 'blur(' + (0.45 * r * ks).toFixed(2) + 'px)';
  c.globalAlpha = 0.28; c.drawImage(sombra, i0, j0, sw, sh, dx + 1.2, dy + 2, dw, dh);
  c.globalAlpha = 0.94; c.drawImage(img, i0, j0, sw, sh, dx, dy, dw, dh);
  c.globalAlpha = 0.1; c.globalCompositeOperation = 'lighter'; c.drawImage(img, i0, j0, sw, sh, dx - 0.8, dy - 1, dw, dh);
  c.restore();
}
// un trozo entero (crudo + pintura + remate) en g, ya en unidades del mundo; con `crudo` (un lienzo del trozo ya hecho) no se rehace
function escPintaTrozo(g, M, R, p, ks, crudo) {
  if (crudo) g.drawImage(crudo, R.x0, R.y0, R.x1 - R.x0, R.y1 - R.y0); else escPintaCrudo(g, M, R);
  escPintaPintura(g, M, R, p, ks); escPintaRemate(g, M, R);
}

/* ---------- las baldosas en caché (el editor) ---------- */
// sala._fondo = { ks, tiles: Map('i:j' → { cv, crudo, listo, uso }), px, vista (el mapa entero en pequeño) }
function escFondo(sala) { return sala._fondo || (sala._fondo = { ks: 0, tiles: new Map(), px: 0, uso: 0, vista: null, vistaId: '' }); }
// la escala de las baldosas para s píxeles por unidad: un escalón por encima (nítido) y no más de 3
const escKs = s => { for (const k of [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3]) if (k >= s * 0.92) return k; return 3; };
function escTilesSucias(sala, x0, y0, x1, y1) {
  const f = escFondo(sala), T = ESC_MUNDO.TILE;
  for (const [k, t] of f.tiles) { const [i, j] = k.split(':').map(Number); if (i * T < x1 && (i + 1) * T > x0 && j * T < y1 && (j + 1) * T > y0) t.listo = false; }
}
function escTilesFuera(sala) { const f = escFondo(sala); f.tiles.clear(); f.px = 0; f.vista = null; }
function escVistaGeneral(sala, M) {
  const f = escFondo(sala), pv = sala.pint ? sala.pint.ver : 0;
  if (f.vista && f.vistaId === M.id && (f.vistaPv === pv || performance.now() - f.vistaT < 2000)) return f.vista;      // la pintura nueva llega a la vista general como mucho cada 2 s
  const k = 0.25, [cv, g] = f.vista && f.vistaId === M.id ? [f.vista, f.vista.getContext('2d')] : lienzo(M.W * k, M.H * k);
  if (!f.vistaCrudo || f.vistaId !== M.id) { const [cc, gc] = lienzo(M.W * k, M.H * k); gc.scale(k, k); escPintaCrudo(gc, M, { x0: 0, y0: 0, x1: M.W, y1: M.H }); f.vistaCrudo = cc; }
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); g.scale(k, k);
  escPintaTrozo(g, M, { x0: 0, y0: 0, x1: M.W, y1: M.H }, sala.pint, k, f.vistaCrudo);
  f.vista = cv; f.vistaId = M.id; f.vistaPv = pv; f.vistaT = performance.now(); return cv;
}
function _escHazTile(sala, M, t, i, j, ks) {
  const T = ESC_MUNDO.TILE, R = { x0: i * T, y0: j * T, x1: (i + 1) * T, y1: (j + 1) * T }, n = Math.ceil(T * ks), f = escFondo(sala);
  if (!t.cv) { [t.cv, t.g] = lienzo(n, n); f.px += n * n; }
  const conPintura = pinturaHay(sala.pint);
  if (conPintura && !t.crudo) { const [cc, gc] = lienzo(n, n); gc.scale(ks, ks); gc.translate(-R.x0, -R.y0); escPintaCrudo(gc, M, R); t.crudo = cc; f.px += n * n; }
  const g = t.g; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, n, n); g.scale(ks, ks); g.translate(-R.x0, -R.y0);
  escPintaTrozo(g, M, R, sala.pint, ks, t.crudo);
  t.listo = true;
}
// pinta el fondo visible en c (sin transformar, en píxeles): v = { s (píxeles por unidad), ox, oy (dónde cae el 0,0 del mundo), w, h }
function escPintaFondo(c, sala, M, v) {
  const f = escFondo(sala), ks = escKs(v.s), T = ESC_MUNDO.TILE;
  if (f.ks !== ks || f.id !== M.id) { escTilesFuera(sala); f.ks = ks; f.id = M.id; }
  const x0 = Math.max(0, -v.ox / v.s), y0 = Math.max(0, -v.oy / v.s), x1 = Math.min(M.W, (v.w - v.ox) / v.s), y1 = Math.min(M.H, (v.h - v.oy) / v.s);
  const i0 = Math.floor(x0 / T), i1 = Math.ceil(x1 / T), j0 = Math.floor(y0 / T), j1 = Math.ceil(y1 / T), t0 = performance.now();
  let faltan = 0, hechas = 0; f.uso++;
  const orden = [];
  for (let j = j0; j < j1; j++) for (let i = i0; i < i1; i++) orden.push([i, j, Math.hypot((i + 0.5) * T - (x0 + x1) / 2, (j + 0.5) * T - (y0 + y1) / 2)]);
  orden.sort((a, b) => a[2] - b[2]);      // primero las del centro
  for (const [i, j] of orden) {
    const clave = i + ':' + j; let t = f.tiles.get(clave);
    if (!t || !t.listo) {      // por hacer (o rehacer): mientras quede tiempo en este fotograma (al menos una); si no, la vieja o la vista general
      if (!hechas || performance.now() - t0 < ESC_MUNDO.PRESUPUESTO) { if (!t) { t = { listo: false }; f.tiles.set(clave, t); } _escHazTile(sala, M, t, i, j, ks); hechas++; }
      else faltan++;
    }
    const dx0 = Math.round(v.ox + i * T * v.s), dy0 = Math.round(v.oy + j * T * v.s), dx1 = Math.round(v.ox + Math.min(M.W, (i + 1) * T) * v.s), dy1 = Math.round(v.oy + Math.min(M.H, (j + 1) * T) * v.s);
    if (t && t.cv) { t.uso = f.uso; const sw = (Math.min(M.W, (i + 1) * T) - i * T) * ks, sh = (Math.min(M.H, (j + 1) * T) - j * T) * ks; c.drawImage(t.cv, 0, 0, sw, sh, dx0, dy0, dx1 - dx0, dy1 - dy0); }
    else { const vg = escVistaGeneral(sala, M), k = 0.25; c.drawImage(vg, i * T * k, j * T * k, (Math.min(M.W, (i + 1) * T) - i * T) * k, (Math.min(M.H, (j + 1) * T) - j * T) * k, dx0, dy0, dx1 - dx0, dy1 - dy0); }
  }
  if (f.px > ESC_MUNDO.MAX_PX) {      // demasiadas en memoria: fuera las que hace más que no se ven
    const lista = [...f.tiles.entries()].sort((a, b) => (a[1].uso || 0) - (b[1].uso || 0));
    for (const [k, t] of lista) { if (f.px <= ESC_MUNDO.MAX_PX * 0.7 || t.uso === f.uso) break; f.px -= (t.cv ? t.cv.width * t.cv.height : 0) + (t.crudo ? t.crudo.width * t.crudo.height : 0); f.tiles.delete(k); }
  }
  return faltan;
}

/* ---------- por dónde se anda (pasear) ---------- */
// la rejilla de casillas libres para los pies (suelo sin muebles ni armario); se rehace al mover un mueble
function escLibres(sala, M) {
  if (sala._libre && sala._libreV === sala.ver && sala._libreM === M.id) return sala._libre;
  const L = new Uint8Array(M.MW * M.MH), cajas = escCajas(sala, M);
  for (let j = 0; j < M.MH; j++) for (let i = 0; i < M.MW; i++) {
    if (M.grid[j * M.MW + i] !== SUELO) continue;
    const x0 = i * CEL, y0 = j * CEL;
    L[j * M.MW + i] = cajas.some(q => q.x0 - 10 < x0 + CEL && q.x1 + 10 > x0 && q.y0 - 2 < y0 + CEL && q.y1 + 8 > y0) ? 0 : 1;
  }
  sala._libre = L; sala._libreV = sala.ver; sala._libreM = M.id; return L;
}
// las cajas que no se pisan: la base de cada mueble y la del armario
function escCajas(sala, M) {
  if (sala._cajas && sala._cajasV === sala.ver && sala._cajasM === M.id) return sala._cajas;
  const l = sala.muebles.map(m => { const T = TIPOS_MUEBLE[MUEBLES_SALA[m.id].t]; return { x0: m.x - T.w / 2, x1: m.x + T.w / 2, y0: m.y - T.d, y1: m.y, m }; });
  const a = M.armario; l.push({ x0: a.x - 28, x1: a.x + 28, y0: a.y - 22, y1: a.y + 2, armario: true });
  return l;
}
// un camino de casillas libres de a hasta b (o hasta la libre más cercana a b), ya en puntos del mundo y sin vueltas
function escCamino(sala, M, ax, ay, bx, by) {
  const L = escLibres(sala, M), W = M.MW, n = W * M.MH, id = (x, y) => limita((y / CEL) | 0, 0, M.MH - 1) * W + limita((x / CEL) | 0, 0, W - 1);
  let fin = id(bx, by);
  if (!L[fin]) {      // el destino no se pisa: la casilla libre más cercana
    let mejor = -1, md = 1e9; const fi = fin % W, fj = (fin - fi) / W;
    for (let j = Math.max(0, fj - 8); j <= Math.min(M.MH - 1, fj + 8); j++) for (let i = Math.max(0, fi - 8); i <= Math.min(W - 1, fi + 8); i++) { const d = (i - fi) ** 2 + (j - fj) ** 2; if (L[j * W + i] && d < md) { md = d; mejor = j * W + i; } }
    if (mejor < 0) return null; fin = mejor; bx = (fin % W + 0.5) * CEL; by = (Math.floor(fin / W) + 0.7) * CEL;
  }
  const ini = id(ax, ay), de = new Int32Array(n).fill(-1), cola = new Int32Array(n); let a = 0, z = 0;
  de[ini] = ini; cola[z++] = ini;
  while (a < z) {
    const k = cola[a++]; if (k === fin) break;
    const i = k % W;
    for (const q of [i > 0 ? k - 1 : -1, i < W - 1 ? k + 1 : -1, k - W, k + W]) if (q >= 0 && q < n && de[q] < 0 && L[q]) { de[q] = k; cola[z++] = q; }
  }
  if (de[fin] < 0) return null;
  const pasos = []; for (let k = fin; k !== ini; k = de[k]) pasos.push([(k % W + 0.5) * CEL, (Math.floor(k / W) + 0.7) * CEL]);
  pasos.reverse(); if (pasos.length) pasos[pasos.length - 1] = [bx, by];
  const lisos = []; let px = ax, py = ay;      // sin vueltas: se salta los puntos que se ven en línea recta
  for (let k = 0; k < pasos.length; k++) {
    let lej = k; while (lej + 1 < pasos.length && escRecto(sala, M, px, py, pasos[lej + 1][0], pasos[lej + 1][1])) lej++;
    lisos.push(pasos[lej]); [px, py] = pasos[lej]; k = lej;
  }
  return lisos;
}
function escRecto(sala, M, ax, ay, bx, by) {
  const d = Math.hypot(bx - ax, by - ay), n = Math.ceil(d / 8);
  for (let k = 1; k <= n; k++) if (!escLibre(sala, M, ax + (bx - ax) * k / n, ay + (by - ay) * k / n)) return false;
  return true;
}
// ¿caben aquí unos pies?
function escLibre(sala, M, x, y) {
  if (!escSueloCaja(M, x - 12, y - 8, x + 12, y)) return false;
  return !escCajas(sala, M).some(q => x + 9 > q.x0 && x - 9 < q.x1 && y > q.y0 - 2 && y - 6 < q.y1);
}
