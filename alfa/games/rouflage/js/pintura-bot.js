// Fans of Rouflage · LA PINTURA DE LA MÁQUINA Y EL CUARTEO: cómo se pinta un camaleón bot (como una persona: coge unos pocos colores con el
// cuentagotas, rellena, pinta las formas grandes a brochazos algo desplazados, se salta los detalles finos y remata mal los bordes) y cómo
// se cuartea la pintura de todos durante la caza (grietas que bajan el camuflaje poco a poco: quedarse quieto al 100 % no dura para siempre).
'use strict';

// el color del fondo en un punto del mundo
function _colorFondo(x, y) { const F = MAPA.px, k = (limita(Math.round(y), 0, ALTO - 1) * ANCHO + limita(Math.round(x), 0, ANCHO - 1)) * 4; return [F[k], F[k + 1], F[k + 2]]; }
// los colores que «cogería con el cuentagotas» una persona: los n que más suelo cubren detrás de la alubia (agrupados por parecido)
function _paletaBot(e, n) {
  const bx = Math.round(e.x) - PIE_X, by = Math.round(e.y) - PIE_Y, M = formaDe(e).mascara, votos = new Map();
  for (let j = 1; j < CAJA_H; j += 2) for (let i = 1; i < CAJA_W; i += 2) if (M[j * CAJA_W + i]) {
    const [r, g, b] = _colorFondo(bx + i, by + j), clave = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4), v = votos.get(clave) || { n: 0, r: 0, g: 0, b: 0 };
    v.n++; v.r += r; v.g += g; v.b += b; votos.set(clave, v);
  }
  const lista = [...votos.values()].sort((a, b) => b.n - a.n).map(v => ({ n: v.n, r: v.r / v.n, g: v.g / v.n, b: v.b / v.n }));
  const pal = [];
  for (const c of lista) { if (pal.length >= n) break; if (!pal.some(p => difColor(p.r, p.g, p.b, c.r, c.g, c.b) < 18)) pal.push(c); }   // colores casi iguales cuentan como uno
  return pal;
}
const _masCercano = (pal, r, g, b) => { let m = pal[0], md = 1e9; for (const p of pal) { const d = difColor(p.r, p.g, p.b, r, g, b); if (d < md) { md = d; m = p; } } return m; };

// Un bot se pinta solo, como lo haría una persona con maña de 0 a 1: con poca, coge 3 colores, le sale desplazado y torcido y deja los bordes
// sin rematar; con mucha, 7 colores, brocha fina y casi en su sitio. Nunca pinta un color que no esté detrás de él.
function pintaBot(e, mana) {
  mana = limita(mana, 0, 1);
  const bx = Math.round(e.x) - PIE_X, by = Math.round(e.y) - PIE_Y, M = formaDe(e).mascara;
  const pal = _paletaBot(e, 3 + Math.round(mana * 4));
  if (!pal.length) return mideCamuflaje(e);
  rellena(e, rgbHex(pal[0].r, pal[0].g, pal[0].b));
  // lo que se le va la mano: unos píxeles de desplazamiento, un poco de giro y un tono algo cambiado (la pintura del bote no es la de la pantalla)
  const torcido = (1 - mana) * 5, dx = rand(-torcido, torcido), dy = rand(-torcido, torcido), giro = rand(-1, 1) * (1 - mana) * 0.14, tono = rand(-1, 1) * (1 - mana) * 14;
  const radio = entre(4.2, 2.2, mana), paso = radio * 0.9, orilla = Math.round((1 - mana) * 3), cos = Math.cos(giro), sin = Math.sin(giro), cx = CAJA_W / 2, cy = CAJA_H / 2;
  const c = e.pctx;
  c.save(); c.globalCompositeOperation = 'source-atop'; c.scale(ESC_PIEL, ESC_PIEL); c.lineCap = 'round';
  for (let y = 1; y < CAJA_H; y += paso) for (let x = 1; x < CAJA_W; x += paso) {
    const px = x + rand(-0.3, 0.3) * paso, py = y + rand(-0.3, 0.3) * paso, ix = Math.round(px), iy = Math.round(py);
    if (ix < 0 || iy < 0 || ix >= CAJA_W || iy >= CAJA_H || !M[iy * CAJA_W + ix]) continue;
    // cerca del borde de la silueta los torpes no pintan (se queda el color de base): el remate es lo que peor se les da
    if (orilla && (ix < orilla || iy < orilla || ix + orilla >= CAJA_W || iy + orilla >= CAJA_H || !M[iy * CAJA_W + ix - orilla] || !M[iy * CAJA_W + ix + orilla] || !M[(iy - orilla) * CAJA_W + ix] || !M[(iy + orilla) * CAJA_W + ix])) continue;
    // mira el fondo en el punto girado y desplazado, y lo pinta con el color de su paleta que más se le parezca
    const rx = cx + (px - cx) * cos - (py - cy) * sin + dx, ry = cy + (px - cx) * sin + (py - cy) * cos + dy;
    const [r, g, b] = _colorFondo(bx + rx, by + ry), p = _masCercano(pal, r, g, b);
    if (p === pal[0]) continue;      // ya es el color de base
    c.strokeStyle = rgbHex(p.r + tono, p.g + tono, p.b + tono * 0.8); c.lineWidth = radio * rand(0.8, 1.2);
    const a = rand(0, TAU), l = radio * rand(0.4, 0.9);      // un brochazo corto en vez de un punto
    c.beginPath(); c.moveTo(px - Math.cos(a) * l, py - Math.sin(a) * l); c.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); c.stroke();
  }
  c.restore();
  // los que tienen maña repasan después a pincel fino parte del cuerpo (como una persona con paciencia y el calco puesto): con 1, casi todo
  if (mana > 0.5) afinaBot(e, (mana - 0.5) * 1.7);
  return mideCamuflaje(e);
}
// una pasada de pincel fino copiando el fondo tal cual (lo que hace una persona con paciencia y el calco puesto)
function afinaBot(e, parte = 1) {
  const bx = Math.round(e.x) - PIE_X, by = Math.round(e.y) - PIE_Y, F = MAPA.px, M = formaDe(e).mascara, c = e.pctx;
  c.save(); c.globalCompositeOperation = 'source-atop'; c.scale(ESC_PIEL, ESC_PIEL);
  for (let y = 0; y < CAJA_H; y += 2) for (let x = 0; x < CAJA_W; x += 2) {
    if (!(M[y * CAJA_W + x] || M[y * CAJA_W + x + 1] || M[(y + 1) * CAJA_W + x] || M[(y + 1) * CAJA_W + x + 1]) || (parte < 1 && Math.random() > parte)) continue;   // también los bordes de la silueta
    const wx = limita(bx + x + 1, 0, ANCHO - 1), wy = limita(by + y + 1, 0, ALTO - 1), k = (wy * ANCHO + wx) * 4;
    c.fillStyle = rgbHex(F[k], F[k + 1], F[k + 2]); c.fillRect(x, y, 2.4, 2.4);
  }
  c.restore(); mideCamuflaje(e);
}
// se le estropea un poco: brochazos del tono equivocado (un color del fondo, pero más claro u oscuro de la cuenta) en sitios al azar. Nada de colores que no estén detrás
function ensuciaBot(e, manchas) {
  const bx = Math.round(e.x) - PIE_X, by = Math.round(e.y) - PIE_Y, c = e.pctx, M = formaDe(e).mascara;
  c.save(); c.globalCompositeOperation = 'source-atop'; c.scale(ESC_PIEL, ESC_PIEL); c.lineCap = 'round';
  for (let k = 0; k < manchas; k++) {
    let x, y, t = 0; do { x = rand(2, CAJA_W - 2); y = rand(2, CAJA_H - 2); } while (!M[Math.floor(y) * CAJA_W + Math.floor(x)] && ++t < 40);
    const [r, g, b] = _colorFondo(bx + x + rand(-6, 6), by + y + rand(-6, 6)), tono = rand(22, 40) * (Math.random() < 0.5 ? -1 : 1), a = rand(0, TAU), l = rand(2, 5);
    c.strokeStyle = rgbHex(r + tono, g + tono, b + tono * 0.8); c.lineWidth = rand(2, 3.6);
    c.beginPath(); c.moveTo(x - Math.cos(a) * l, y - Math.sin(a) * l); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke();
  }
  c.restore();
}
// La tirada de dados de la máquina: cada vez que va a pintarse saca una meta entre 80 y 99 (nunca 100) y se pinta lo bien que pueda; si le sale mejor que la meta,
// se le estropea con brochazos del tono equivocado hasta quedar en ella. Si el fondo es tan difícil que no llega a 80, repasa a pincel fino y se queda como le salga.
function pintaBotDados(e) {
  const meta = 80 + Math.floor(Math.random() * 20);
  pintaBot(e, 0.95);
  if (e.camo < 80) afinaBot(e);
  for (let n = 0; n < 24 && e.camo > meta; n++) { ensuciaBot(e, 1 + Math.floor((e.camo - meta) / 3)); mideCamuflaje(e); }
  return e.camo;
}

// ---------- EL CUARTEO ----------
// Durante la caza la pintura se seca y se cuartea: cada CUARTEO.cada segundos a cada colado congelado le sale una grieta (una línea fina de un tono
// más oscuro que su piel) y el camuflaje baja poco a poco (del 100 % a unos 85 % en dos minutos). Moverse a retocarse lo arregla (a riesgo de que te vean).
// Las grietas salen de la semilla del ente y del número de grieta: en el PvP todos los navegadores dibujan las mismas sin mandar nada por la red.
const CUARTEO = { cada: 5, grietas: 1, desde: 6 };      // cada cuánto, cuántas grietas cada vez, y a partir de qué segundo de caza empieza
function cuartea(e) {
  const c = e.pctx, M = formaDe(e).mascara, n = e.grietas = (e.grietas || 0) + 1;
  c.save(); c.globalCompositeOperation = 'source-atop'; c.scale(ESC_PIEL, ESC_PIEL); c.lineCap = 'round'; c.lineJoin = 'round';
  for (let g = 0; g < CUARTEO.grietas; g++) {
    const s = n * 7 + g, sem = e.slot >= 0 ? e.slot + 1 : Math.round(e.semilla * 1000), az = k => hash2(sem, s, k);      // en el PvP la semilla es la plaza: igual en todos los navegadores
    let x = 4 + az(1) * (CAJA_W - 8), y = 4 + az(2) * (CAJA_H - 8), t = 0;
    while (!M[Math.floor(y) * CAJA_W + Math.floor(x)] && ++t < 12) { x = 4 + az(10 + t) * (CAJA_W - 8); y = 4 + az(30 + t) * (CAJA_H - 8); }
    const d = c.getImageData(Math.floor(x * ESC_PIEL), Math.floor(y * ESC_PIEL), 1, 1).data, osc = d[0] * 0.3 + d[1] * 0.59 + d[2] * 0.11 < 90 ? 1.7 : 0.62;      // el tono de la grieta: la piel de ahí, más oscura (más clara si la piel es oscura)
    c.strokeStyle = rgbHex(d[0] * osc + (osc > 1 ? 30 : 0), d[1] * osc + (osc > 1 ? 30 : 0), d[2] * osc + (osc > 1 ? 30 : 0)); c.lineWidth = 0.7;
    c.beginPath(); c.moveTo(x, y);
    let a = az(3) * TAU;
    for (let k = 0; k < 3; k++) { a += (az(4 + k) - 0.5) * 1.6; const l = 1.5 + az(8 + k) * 2; x += Math.cos(a) * l; y += Math.sin(a) * l; c.lineTo(x, y); }
    c.stroke();
  }
  c.restore();
}
// cada fotograma de la caza: a quien lleva este navegador (o a todos, si no hay red) le va saliendo su grieta; en el PvP los remotos también, con la misma semilla
function cuarteoAvanza(dt) {
  if (J.fase !== 'caza') return;
  const t = J.tFase; if (t < CUARTEO.desde) return;
  const n = Math.floor((t - CUARTEO.desde) / CUARTEO.cada) + 1;
  for (const k of J.camaleones) {
    if (k.fuera || !k.congelado || !k.pintado) continue;
    if ((k.grietas || 0) >= n) continue;
    cuartea(k);
    if (k === J.yo || k.bot || !J.pvp || (J.pvp && RFP.soyHost)) mideCamuflaje(k); else k.camo = Math.max(0, k.camo - 1);
    if (k === J.yo) { refrescaHud(); tutoDi('cam-grieta'); }
  }
}
