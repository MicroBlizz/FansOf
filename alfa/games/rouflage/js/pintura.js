// Fans of Rouflage (prototipo) · LA PINTURA: los trazos y las figuras (línea, cuadrado, círculo) sobre la piel (nunca se salen de la silueta), el relleno, deshacer,
// y la medida del camuflaje: se compara, punto a punto, la piel con lo que la alubia tiene detrás en el mundo. Esa misma cifra sirve
// de marcador para el jugador y de «ojos» para los becarios que mandan los bots. También está aquí cómo se pinta un bot.
'use strict';

const PIEL_W = CAJA_W * ESC_PIEL, PIEL_H = CAJA_H * ESC_PIEL;

// un trazo de pincel entre dos puntos de la caja de la alubia (en unidades del mundo, con el origen en la esquina de la caja)
function trazo(e, x0, y0, x1, y1, radio, color, cabezal) {
  const c = e.pctx;
  c.save(); c.globalCompositeOperation = 'source-atop'; c.scale(ESC_PIEL, ESC_PIEL);
  if (cabezal === 'cuadrado') {      // cabezal cuadrado: un cuadrado sin girar que se arrastra de un punto a otro
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / Math.max(0.4, radio * 0.5)));
    c.fillStyle = color;
    for (let k = 0; k <= n; k++) c.fillRect(x0 + (x1 - x0) * k / n - radio, y0 + (y1 - y0) * k / n - radio, radio * 2, radio * 2);
    c.restore(); return;
  }
  c.strokeStyle = color; c.lineWidth = radio * 2; c.lineCap = 'round'; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1 + 0.01, y1 + 0.01); c.stroke();
  c.restore();
}
// una figura entre dos puntos de la caja: línea (con el grosor del pincel), cuadrado o círculo (rellenos, dentro del rectángulo)
function trazaFigura(c, tipo, x0, y0, x1, y1) {
  c.beginPath();
  if (tipo === 'linea') { c.moveTo(x0, y0); c.lineTo(x1 + 0.01, y1 + 0.01); }
  else if (tipo === 'cuadro') c.rect(Math.min(x0, x1), Math.min(y0, y1), Math.abs(x1 - x0), Math.abs(y1 - y0));
  else c.ellipse((x0 + x1) / 2, (y0 + y1) / 2, Math.abs(x1 - x0) / 2 + 0.01, Math.abs(y1 - y0) / 2 + 0.01, 0, 0, TAU);
}
function figura(e, tipo, x0, y0, x1, y1, radio, color, cabezal) {
  const c = e.pctx;
  c.save(); c.globalCompositeOperation = 'source-atop'; c.scale(ESC_PIEL, ESC_PIEL);
  trazaFigura(c, tipo, x0, y0, x1, y1);
  if (tipo === 'linea') { c.strokeStyle = color; c.lineWidth = radio * 2; c.lineCap = cabezal === 'cuadrado' ? 'square' : 'round'; c.stroke(); } else { c.fillStyle = color; c.fill(); }
  c.restore();
}
function rellena(e, color) {
  const c = e.pctx;
  c.save(); c.globalCompositeOperation = 'source-atop'; c.fillStyle = color; c.fillRect(0, 0, PIEL_W, PIEL_H); c.restore();
}
// antes de cada trazo se guarda cómo estaba la piel, para poder deshacer (hasta 12 pasos)
function guardaPaso(e) { e.pasos.push(e.pctx.getImageData(0, 0, PIEL_W, PIEL_H)); if (e.pasos.length > 12) e.pasos.shift(); }
function deshace(e) { const d = e.pasos.pop(); if (d) e.pctx.putImageData(d, 0, 0); return !!d; }

// Mide el camuflaje de una alubia donde está ahora. Deja en ella:
//   camo  0 a 100: lo que ve el jugador en su medidor
//   vis   0 a 1: lo que «canta» (0 = no se distingue del fondo, 1 = no se parece en nada)
// Lo que queda tapado por un mueble que está delante no cuenta: no se ve.
const VIS_MIN = 0.1;   // lo que «canta» como mínimo un camaleón (su camuflaje no pasa del 90 %)
function mideCamuflaje(e) {
  const bx = Math.round(e.x) - PIE_X, by = Math.round(e.y) - PIE_Y, d = e.pctx.getImageData(0, 0, PIEL_W, PIEL_H).data, F = MAPA.px;
  const delante = MUEBLES.filter(m => m.y > e.y && m.dib.x0 < bx + CAJA_W && m.dib.x0 + m.dib.w > bx && m.dib.y0 < by + CAJA_H && m.dib.y0 + m.dib.h > by);
  const { mascara: M, pixeles: N } = formaDe(e);
  let fallo = 0, vistos = 0;
  for (let j = 0; j < CAJA_H; j++) for (let i = 0; i < CAJA_W; i++) {
    if (!M[j * CAJA_W + i]) continue;
    const wx = bx + i, wy = by + j;
    if (wx < 0 || wy < 0 || wx >= ANCHO || wy >= ALTO || (delante.length && tapado(wx, wy, delante))) continue;
    vistos++;
    // el color medio de la piel en este punto (cada punto del mundo son 4 × 4 de piel; basta con mirar cuatro)
    let r = 0, g = 0, b = 0, n = 0;
    for (let q = 0; q < 4; q += 2) for (let p = 0; p < 4; p += 2) { const k = ((j * ESC_PIEL + q + 1) * PIEL_W + i * ESC_PIEL + p + 1) * 4; if (d[k + 3] > 127) { r += d[k]; g += d[k + 1]; b += d[k + 2]; n++; } }
    if (!n) continue;
    const k = (wy * ANCHO + wx) * 4, dif = difColor(r / n, g / n, b / n, F[k], F[k + 1], F[k + 2]);
    fallo += limita((dif - 14) / 50, 0, 1);   // hasta 14 no se nota; de 64 en adelante canta del todo (dos tonos del mismo color ya son unos 70)
  }
  e.vis = Math.max(fallo / N, VIS_MIN);      // ni el mejor camuflaje es perfecto: queda la sombra del contorno
  e.tapada = 1 - vistos / N;
  e.camo = Math.round(100 * (1 - e.vis));
  return e.camo;
}

// La tirada de dados de la máquina: cada vez que va a pintarse saca una meta entre 80 y 99 (nunca 100) y se pinta lo bien que pueda; si le sale mejor que la meta, se estropea un poco
// con manchas de otro tono hasta quedar en ella. Si el fondo es tan difícil que no llega a la meta, se queda como le salga.
function pintaBotDados(e) {
  const meta = 80 + Math.floor(Math.random() * 20);
  pintaBot(e, 0.95);
  if (e.camo < 80) afinaBot(e);      // una pasada de pincel fino si el fondo se le ha resistido
  for (let n = 0; n < 24 && e.camo > meta; n++) { ensuciaBot(e, 1 + Math.floor((e.camo - meta) / 3)); mideCamuflaje(e); }
  return e.camo;
}
function afinaBot(e) {
  const bx = Math.round(e.x) - PIE_X, by = Math.round(e.y) - PIE_Y, F = MAPA.px, M = formaDe(e).mascara, c = e.pctx;
  c.save(); c.globalCompositeOperation = 'source-atop'; c.scale(ESC_PIEL, ESC_PIEL);
  for (let y = 0; y < CAJA_H; y += 2) for (let x = 0; x < CAJA_W; x += 2) {
    if (!M[y * CAJA_W + x]) continue;
    const wx = limita(bx + x + 1, 0, ANCHO - 1), wy = limita(by + y + 1, 0, ALTO - 1), k = (wy * ANCHO + wx) * 4;
    c.fillStyle = rgbHex(F[k], F[k + 1], F[k + 2]); c.fillRect(x, y, 2.4, 2.4);
  }
  c.restore(); mideCamuflaje(e);
}
function ensuciaBot(e, manchas) {
  const c = e.pctx, M = formaDe(e).mascara;
  c.save(); c.globalCompositeOperation = 'source-atop'; c.scale(ESC_PIEL, ESC_PIEL);
  for (let k = 0; k < manchas; k++) {
    let x, y, t = 0; do { x = rand(2, CAJA_W - 2); y = rand(2, CAJA_H - 2); } while (!M[Math.floor(y) * CAJA_W + Math.floor(x)] && ++t < 40);
    c.fillStyle = rgbHex(rand(40, 230), rand(40, 230), rand(40, 230)); c.beginPath(); c.arc(x, y, rand(2.2, 4.5), 0, TAU); c.fill();
  }
  c.restore();
}
// Un bot se pinta solo: mira el fondo que tiene detrás y lo copia a pinceladas redondas. Con poca maña (0) usa un pincel gordo,
// le sale torcido, con los colores algo cambiados y se deja trozos; con mucha (1), pinceladas finas y casi en su sitio.
function pintaBot(e, mana) {
  const bx = Math.round(e.x) - PIE_X, by = Math.round(e.y) - PIE_Y, F = MAPA.px;
  const colorEn = (x, y) => { const k = (limita(Math.round(y), 0, ALTO - 1) * ANCHO + limita(Math.round(x), 0, ANCHO - 1)) * 4; return [F[k], F[k + 1], F[k + 2]]; };
  // de base, el color que más se repite detrás (los más torpes ni eso: se quedan con trozos en blanco)
  const votos = new Map(), M = formaDe(e).mascara; let base = null, max = 0;
  for (let j = 2; j < CAJA_H; j += 3) for (let i = 2; i < CAJA_W; i += 3) if (M[j * CAJA_W + i]) {
    const [r, g, b] = colorEn(bx + i, by + j), clave = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3), v = votos.get(clave) || { n: 0, r, g, b };
    v.n++; votos.set(clave, v); if (v.n > max) { max = v.n; base = v; }
  }
  rellena(e, mana < 0.3 ? BLANCO_PIEL : rgbHex(base.r, base.g, base.b));
  const torcido = (1 - mana) * 6.5, dx = rand(-torcido, torcido), dy = rand(-torcido, torcido);
  const radio = entre(7.5, 2.7, mana), paso = radio * 1.1, tinte = (1 - mana) * 30, salta = (1 - mana) * 0.22;
  const c = e.pctx;
  c.save(); c.globalCompositeOperation = 'source-atop'; c.scale(ESC_PIEL, ESC_PIEL);
  for (let y = 1; y < CAJA_H; y += paso) for (let x = 1; x < CAJA_W; x += paso) {
    if (Math.random() < salta) continue;
    const px = x + rand(-0.35, 0.35) * paso, py = y + rand(-0.35, 0.35) * paso, [r, g, b] = colorEn(bx + px + dx, by + py + dy), t = rand(-tinte, tinte);
    c.fillStyle = rgbHex(r + t, g + t, b + t * 0.8); c.beginPath(); c.arc(px, py, radio * rand(0.9, 1.2), 0, TAU); c.fill();
  }
  c.restore();
  return mideCamuflaje(e);
}
