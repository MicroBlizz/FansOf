// Fans of Goose · PIXEL: las formas que se dibujan con código (cajas, botones, barras, círculos, aros, arcos, líneas y degradados) salen
// en píxeles de verdad, sin suavizado: cada forma se pinta con rectángulos alineados a la rejilla de píxeles del canvas (o se guarda
// como un sprite de píxeles) para que nada parezca vectorial. Los dibujos grandes (charcos, latigazos, ondas, marcos) son de Yoshi.
'use strict';

const kPx = () => PAN.k;
const snap = v => Math.round(v * PAN.k) / PAN.k;   // a la rejilla de píxeles del canvas

// una caja con las esquinas redondeadas en escalera (en píxeles)
function cajaPixel(x, y, w, h, r, relleno, borde, grosor) {
  const k = kPx(), X = Math.round(x * k), Y = Math.round(y * k), W = Math.max(1, Math.round(w * k)), H = Math.max(1, Math.round(h * k));
  const R = Math.min(Math.round(r * k * 0.8), (W / 2) | 0, (H / 2) | 0), t = borde ? Math.max(1, Math.round((grosor || 1.5) * k * 0.55)) : 0;
  const forma = (x0, y0, w0, h0, rr, color) => {   // en píxeles del canvas; se pinta dividiendo por k (la cámara va a píxeles enteros)
    if (w0 <= 0 || h0 <= 0) return;
    G.fillStyle = color;
    G.fillRect(x0 / k, (y0 + rr) / k, w0 / k, (h0 - rr * 2) / k);
    for (let i = 0; i < rr; i++) {
      const d = rr - Math.round(Math.sqrt(rr * rr - (rr - i - 0.5) * (rr - i - 0.5)));
      G.fillRect((x0 + d) / k, (y0 + i) / k, (w0 - d * 2) / k, 1 / k); G.fillRect((x0 + d) / k, (y0 + h0 - 1 - i) / k, (w0 - d * 2) / k, 1 / k);
    }
  };
  if (!relleno) { if (t) { G.fillStyle = borde; G.fillRect((X + R) / k, Y / k, (W - R * 2) / k, t / k); G.fillRect((X + R) / k, (Y + H - t) / k, (W - R * 2) / k, t / k); G.fillRect(X / k, (Y + R) / k, t / k, (H - R * 2) / k); G.fillRect((X + W - t) / k, (Y + R) / k, t / k, (H - R * 2) / k); } return; }   // solo el marco
  if (t) forma(X, Y, W, H, R, borde);
  forma(X + t, Y + t, W - t * 2, H - t * 2, Math.max(0, R - t), relleno);
}

// círculos y elipses llenos, y aros: sprites de píxeles guardados por tamaño y color
const DISCOS = new Map();
function discoLienzo(rx, ry, color, grosor) {
  const k = kPx(), RX = Math.max(1, Math.round(rx * k)), RY = Math.max(1, Math.round(ry * k)), G2 = grosor ? Math.max(1, Math.round(grosor * k)) : 0;
  const clave = RX + '|' + RY + '|' + color + '|' + G2;
  let c = DISCOS.get(clave); if (c) return c;
  if (DISCOS.size > 500) DISCOS.clear();
  c = lienzo(RX * 2 + 1, RY * 2 + 1); const x = c.getContext('2d'); x.fillStyle = color;
  for (let j = 0; j <= RY * 2; j++) for (let i = 0; i <= RX * 2; i++) {
    const dx = (i - RX) / (RX + 0.5), dy = (j - RY) / (RY + 0.5), d = dx * dx + dy * dy;
    if (d > 1) continue;
    if (G2) { const ix = (i - RX) / Math.max(0.5, RX - G2 + 0.5), iy = (j - RY) / Math.max(0.5, RY - G2 + 0.5); if (ix * ix + iy * iy < 1) continue; }
    x.fillRect(i, j, 1, 1);
  }
  DISCOS.set(clave, c); return c;
}
function disco(x, y, rx, ry, color) { const c = discoLienzo(rx, ry, color, 0), k = kPx(); G.drawImage(c, snap(x) - (c.width - 1) / 2 / k, snap(y) - (c.height - 1) / 2 / k, c.width / k, c.height / k); }
function aro(x, y, r, grosor, color) { const c = discoLienzo(r, r, color, grosor), k = kPx(); G.drawImage(c, snap(x) - (c.width - 1) / 2 / k, snap(y) - (c.height - 1) / 2 / k, c.width / k, c.height / k); }

// un arco de aro (temporizadores): puntos de píxel a lo largo del círculo
function arcoPixel(x, y, r, a0, a1, grosor, color) {
  const k = kPx(), p = Math.max(1, Math.round(grosor * k)) / k, n = Math.ceil(Math.abs(a1 - a0) * r * k);
  G.fillStyle = color;
  for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; G.fillRect(snap(x + Math.cos(a) * r) - p / 2, snap(y + Math.sin(a) * r) - p / 2, p, p); }
}
// una línea de píxeles (cuerdas, rayos)
function lineaPixel(x0, y0, x1, y1, grosor, color) {
  const k = kPx(), p = Math.max(1, Math.round(grosor * k)) / k, n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * k);
  G.fillStyle = color;
  for (let i = 0; i <= n; i++) { const t = i / Math.max(1, n); G.fillRect(snap(x0 + (x1 - x0) * t) - p / 2, snap(y0 + (y1 - y0) * t) - p / 2, p, p); }
}
// un cuadrado de partícula alineado a la rejilla
function puntoPixel(x, y, s) { const k = kPx(), S = Math.max(1, Math.round(s * k)) / k; G.fillRect(snap(x) - S / 2, snap(y) - S / 2, S, S); }

// degradados en bandas (como en las consolas de 16 bits), en vertical o en anillos
function bandasVerticales(x, y, w, h, colores) { const n = colores.length, bh = h / n; colores.forEach((c, i) => { x.fillStyle = c; x.fillRect(0, y + Math.floor(i * bh), w, Math.ceil(bh) + 1); }); }
function mezcla(a, b, t) { const pa = a.match(/\w\w/g).map(h => parseInt(h, 16)), pb = b.match(/\w\w/g).map(h => parseInt(h, 16)); return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join(''); }
// un brillo redondo en anillos de píxeles: el centro más fuerte
function brilloLienzo(r, color, alfa) {
  const clave = 'b' + r + color + alfa; let c = DISCOS.get(clave); if (c) return c;
  const k = kPx(), R = Math.max(2, Math.round(r * k)); c = lienzo(R * 2, R * 2); const x = c.getContext('2d');
  for (let j = 0; j < R * 2; j++) for (let i = 0; i < R * 2; i++) {
    const d = Math.hypot(i - R + 0.5, j - R + 0.5) / R; if (d >= 1) continue;
    const banda = Math.floor((1 - d) * 4) / 4; if (!banda) continue;
    x.globalAlpha = alfa * banda; x.fillStyle = color; x.fillRect(i, j, 1, 1);
  }
  DISCOS.set(clave, c); return c;
}
function brillo(x, y, r, color, alfa) { const c = brilloLienzo(r, color, alfa), k = kPx(); G.drawImage(c, snap(x) - c.width / 2 / k, snap(y) - c.height / 2 / k, c.width / k, c.height / k); }
// un disco de píxeles sobre otro lienzo (la oscuridad de las Catacumbas)
function discoEn(ctx, x, y, r, alfa) { const c = discoLienzo(r, r, '#000', 0), k = kPx(); ctx.globalAlpha = alfa; ctx.drawImage(c, Math.round(x * k) / k - (c.width - 1) / 2 / k, Math.round(y * k) / k - (c.height - 1) / 2 / k, c.width / k, c.height / k); ctx.globalAlpha = 1; }
// los rectángulos del canvas, siempre a la rejilla de píxeles (así ningún borde sale suavizado)
function pixelaContexto(ctx) {
  const fr = ctx.fillRect.bind(ctx);
  ctx.fillRect = (x, y, w, h) => { const k = PAN.k, x0 = Math.round(x * k) / k, y0 = Math.round(y * k) / k; fr(x0, y0, Math.max(1 / k, Math.round((x + w) * k) / k - x0), Math.max(1 / k, Math.round((y + h) * k) / k - y0)); };
  ctx.strokeRect = (x, y, w, h) => { const t = Math.max(1 / PAN.k, ctx.lineWidth), c = ctx.fillStyle; ctx.fillStyle = ctx.strokeStyle; ctx.fillRect(x, y, w, t); ctx.fillRect(x, y + h - t, w, t); ctx.fillRect(x, y, t, h); ctx.fillRect(x + w - t, y, t, h); ctx.fillStyle = c; };
}
// un panel de madera con esquinas de hierro (img/ui-panel.png de Yoshi) estirado en nueve trozos sin deformar las esquinas;
// si falta el dibujo, una caja de píxeles
function panelMadera(x, y, w, h, relleno = '#2a1610', borde = '#6e4426') {
  const im = IMG['ui-panel']; if (!im) { caja(x, y, w, h, 7, relleno, borde, 1.5); return; }
  const k = PAN.k, c = 12, cu = c / k, X = snap(x), Y = snap(y), Wd = snap(w), Hd = snap(h), iw = im.width, ih = im.height;
  const pieza = (sx, sy, sw, sh, dx, dy, dw, dh) => { if (dw > 0 && dh > 0) G.drawImage(im, sx, sy, sw, sh, dx, dy, dw, dh); };
  pieza(0, 0, c, c, X, Y, cu, cu); pieza(iw - c, 0, c, c, X + Wd - cu, Y, cu, cu); pieza(0, ih - c, c, c, X, Y + Hd - cu, cu, cu); pieza(iw - c, ih - c, c, c, X + Wd - cu, Y + Hd - cu, cu, cu);
  pieza(c, 0, iw - c * 2, c, X + cu, Y, Wd - cu * 2, cu); pieza(c, ih - c, iw - c * 2, c, X + cu, Y + Hd - cu, Wd - cu * 2, cu);
  pieza(0, c, c, ih - c * 2, X, Y + cu, cu, Hd - cu * 2); pieza(iw - c, c, c, ih - c * 2, X + Wd - cu, Y + cu, cu, Hd - cu * 2);
  pieza(c, c, iw - c * 2, ih - c * 2, X + cu, Y + cu, Wd - cu * 2, Hd - cu * 2);
}
