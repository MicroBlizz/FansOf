// Fans of Rouflage (prototipo) · LA PINTURA: los trazos y las figuras (línea, cuadrado, círculo) sobre la piel (nunca se salen de la silueta), el relleno, deshacer,
// y la medida del camuflaje: se compara, punto a punto, la piel con lo que la alubia tiene detrás en el mundo. Esa misma cifra sirve
// de marcador para el jugador y de «ojos» para los becarios que mandan los bots. Cómo se pinta un bot y el cuarteo están en pintura-bot.js.
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
// Dos medidas por punto: el COLOR (si se parece al fondo) y la CONTINUIDAD (si el dibujo del fondo sigue por el cuerpo: una raya que
// no sigue por donde debe, o un relleno liso sobre una textura, resta aunque el color medio coincida). Así el 100 % cuesta de verdad.
const VIS_MIN = 0;   // el camuflaje puede llegar al 100 %: solo entonces al cazador le brilla el contorno (ver dibujo.js), a partir del 99 % ya no
const CAMO_PERDON = 10, CAMO_CANTA = 50;        // diferencia de color que no se nota, y a partir de cuánta más canta del todo (dos tonos del mismo color son unos 70)
const BORDE_PERDON = 12, BORDE_CANTA = 48;     // lo mismo para el salto de luz entre un punto y el de al lado (la continuidad)
const _camoLumPiel = new Float32Array(CAJA_W * CAJA_H), _camoLumFondo = new Float32Array(CAJA_W * CAJA_H), _camoVisto = new Uint8Array(CAJA_W * CAJA_H), _camoFallo = new Float32Array(CAJA_W * CAJA_H);
function mideCamuflaje(e) {
  const bx = Math.round(e.x) - PIE_X, by = Math.round(e.y) - PIE_Y, d = e.pctx.getImageData(0, 0, PIEL_W, PIEL_H).data, F = MAPA.px;
  const delante = MUEBLES.filter(m => m.y > e.y && m.dib.x0 < bx + CAJA_W && m.dib.x0 + m.dib.w > bx && m.dib.y0 < by + CAJA_H && m.dib.y0 + m.dib.h > by);
  const { mascara: M, pixeles: N } = formaDe(e);
  let fallo = 0, vistos = 0;
  _camoVisto.fill(0);
  for (let j = 0; j < CAJA_H; j++) for (let i = 0; i < CAJA_W; i++) {
    const u = j * CAJA_W + i; if (!M[u]) continue;
    const wx = bx + i, wy = by + j;
    if (wx < 0 || wy < 0 || wx >= ANCHO || wy >= ALTO || (delante.length && tapado(wx, wy, delante))) continue;
    // el color medio de la piel en este punto (cada punto del mundo son 4 × 4 de piel; basta con mirar cuatro)
    let r = 0, g = 0, b = 0, n = 0;
    for (let q = 0; q < 4; q += 2) for (let p = 0; p < 4; p += 2) { const k = ((j * ESC_PIEL + q + 1) * PIEL_W + i * ESC_PIEL + p + 1) * 4; if (d[k + 3] > 127) { r += d[k]; g += d[k + 1]; b += d[k + 2]; n++; } }
    if (!n) continue;
    vistos++; _camoVisto[u] = 1;
    const k = (wy * ANCHO + wx) * 4, dif = difColor(r / n, g / n, b / n, F[k], F[k + 1], F[k + 2]);
    _camoFallo[u] = limita((dif - CAMO_PERDON) / CAMO_CANTA, 0, 1);
    _camoLumPiel[u] = (r * 0.3 + g * 0.59 + b * 0.11) / n; _camoLumFondo[u] = F[k] * 0.3 + F[k + 1] * 0.59 + F[k + 2] * 0.11;
  }
  // la continuidad: el salto de luz hacia la derecha y hacia abajo debe ser el mismo en la piel que en el fondo
  for (let j = 0; j < CAJA_H; j++) for (let i = 0; i < CAJA_W; i++) {
    const u = j * CAJA_W + i; if (!_camoVisto[u]) continue;
    let salto = 0, pares = 0;
    if (i + 1 < CAJA_W && _camoVisto[u + 1]) { salto += Math.abs((_camoLumPiel[u + 1] - _camoLumPiel[u]) - (_camoLumFondo[u + 1] - _camoLumFondo[u])); pares++; }
    if (j + 1 < CAJA_H && _camoVisto[u + CAJA_W]) { salto += Math.abs((_camoLumPiel[u + CAJA_W] - _camoLumPiel[u]) - (_camoLumFondo[u + CAJA_W] - _camoLumFondo[u])); pares++; }
    const borde = pares ? limita((salto / pares - BORDE_PERDON) / BORDE_CANTA, 0, 1) : 0;
    fallo += Math.min(1, _camoFallo[u] + borde * 0.6);
  }
  e.vis = Math.max(fallo / N, VIS_MIN);
  e.tapada = 1 - vistos / N;
  e.camo = Math.round(100 * (1 - e.vis));
  return e.camo;
}
