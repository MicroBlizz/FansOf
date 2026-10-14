// Fans of Dark · la interfaz en píxel art: los marcos de piedra y los botones (imágenes de 9 trozos para border-image, que el CSS usa
// por variables --m-…), la pared de fondo de los menús, el logo dibujado a píxel y la escena animada del título (los animales con dos antorchas).
'use strict';
const PXU_O = '#0a0610';   // el contorno de la interfaz

// un marco de n×n píxeles hecho de anillos: [arriba, abajo, izquierda, derecha] por cada píxel hacia dentro, y el relleno
function pxuMarco(n, anillos, relleno, extra) {
  const [c, x] = pxLienzo(n, n);
  x.fillStyle = relleno; x.fillRect(0, 0, n, n);
  anillos.forEach(([ar, ab, iz, de], i) => {
    x.fillStyle = ar; x.fillRect(i, i, n - 2 * i, 1); x.fillStyle = ab; x.fillRect(i, n - 1 - i, n - 2 * i, 1);
    x.fillStyle = iz; x.fillRect(i, i + 1, 1, n - 2 * i - 2); x.fillStyle = de; x.fillRect(n - 1 - i, i + 1, 1, n - 2 * i - 2);
  });
  for (const [px, py] of [[0, 0], [n - 1, 0], [0, n - 1], [n - 1, n - 1]]) x.clearRect(px, py, 1, 1);   // esquinas mordidas
  if (extra) extra(x, n);
  return c.toDataURL();
}
const pxuC = h => pxCss(pxHex(h)), pxuT = (h, f) => pxCss(pxTono(pxHex(h), f));
// el panel grande: piedra con bisel y cuatro remaches (24×24, se corta a 8)
function pxuPanel(piedra = '#4a3d66', fondo = '#1a1228') {
  const l = pxuT(piedra, 0.3), s = pxuT(piedra, -0.4), p = pxuC(piedra);
  return pxuMarco(24, [[PXU_O, PXU_O, PXU_O, PXU_O], [l, s, l, s], [p, s, p, p], [p, p, p, p], [s, l, s, l], [PXU_O, PXU_O, PXU_O, PXU_O]], fondo, x => {
    for (const [rx, ry] of [[2, 2], [19, 2], [2, 19], [19, 19]]) { x.fillStyle = PXU_O; x.fillRect(rx, ry, 3, 3); x.fillStyle = '#b8b0cc'; x.fillRect(rx, ry, 2, 2); x.fillStyle = '#fff'; x.fillRect(rx, ry, 1, 1); }
  });
}
// un hueco hundido (12×12, se corta a 4): sombra arriba a la izquierda y luz abajo a la derecha
function pxuRanura(borde = PXU_O, fondo = '#140c20') {
  return pxuMarco(12, [[borde, borde, borde, borde], ['#05030a', '#3a2f52', '#05030a', '#3a2f52'], ['#0e0818', fondo, '#0e0818', fondo]], fondo);
}
function pxuElegido() {   // el hueco elegido: marco dorado
  return pxuMarco(12, [[PXU_O, PXU_O, PXU_O, PXU_O], ['#fff3a0', '#b8862a', '#fff3a0', '#b8862a'], ['#ffd34d', '#ffd34d', '#ffd34d', '#ffd34d'], ['#5a3a10', '#2a1f3a', '#5a3a10', '#2a1f3a']], '#2a1f3a');
}
// un botón (12×12, se corta a 4): bisel claro arriba y labio oscuro abajo; pulsado, sin labio
function pxuBoton(color, pulsado) {
  const l = pxuT(color, 0.45), m = pxuC(color), s = pxuT(color, -0.35), ss = pxuT(color, -0.6);
  return pxuMarco(12, [[PXU_O, PXU_O, PXU_O, PXU_O], [l, ss, l, s], [m, s, m, m]], m, x => {
    if (pulsado) { x.fillStyle = ss; x.fillRect(1, 1, 10, 1); x.fillStyle = m; x.fillRect(1, 9, 10, 2); x.fillRect(10, 2, 1, 8); return; }
    x.fillStyle = s; x.fillRect(2, 9, 8, 1); x.fillStyle = l; x.fillRect(2, 2, 2, 1);   // el labio y un brillo
  });
}
const PXU_BOTONES = { naranja: '#ff9a2e', violeta: '#8a4fd0', gris: '#3a3050', rojo: '#b8323a', verde: '#2f8a3e', azul: '#2f62b8', oro: '#c8962a', marron: '#8a5a2a', cian: '#2a7a9a' };

// pone todas las imágenes de la interfaz como variables del CSS (--m-panel, --m-btn-rojo, --m-btn-rojo-p, --pared…)
function pxuEstilos() {
  const r = document.documentElement.style, u = s => `url("${s}")`;
  r.setProperty('--m-panel', u(pxuPanel()));
  r.setProperty('--m-ranura', u(pxuRanura()));
  r.setProperty('--m-elegido', u(pxuElegido()));
  for (const k in PXU_BOTONES) { r.setProperty('--m-btn-' + k, u(pxuBoton(PXU_BOTONES[k], false))); r.setProperty('--m-btn-' + k + '-p', u(pxuBoton(PXU_BOTONES[k], true))); }
  const [c, x] = pxLienzo(64, 64); x.putImageData(pxPared('piedra', '#2c2440', '#3e2a66', 3), 0, 0);
  r.setProperty('--pared', u(c.toDataURL()));
}

/* ---------- el logo: «FANS OF» y «DARK» con letra de píxel, contorno y sombra ---------- */
function pxuLogo() {
  const W = 120, H = 52, [c, x] = pxLienzo(W, H);
  x.textAlign = 'center'; x.textBaseline = 'top';
  x.font = '8px "Press Start 2P"'; x.fillStyle = '#fff'; x.fillText('FANS OF', W / 2, 4);
  x.font = '24px "Press Start 2P"'; x.fillText('DARK', W / 2, 16);
  const img = x.getImageData(0, 0, W, H), d = img.data, lleno = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) lleno[i] = d[i * 4 + 3] > 110 ? 1 : 0;
  const out = x.createImageData(W, H), o = out.data, pon = (i, col) => { o[i * 4] = col[0]; o[i * 4 + 1] = col[1]; o[i * 4 + 2] = col[2]; o[i * 4 + 3] = 255; };
  const sombra = [59, 29, 90], borde = [20, 10, 28], blanco = [[255, 255, 255], [214, 204, 236]], morado = [[232, 210, 255], [192, 132, 252], [138, 79, 208], [90, 40, 150]];
  for (let y = 0; y < H; y++) for (let xx = 0; xx < W; xx++) {   // la sombra, dos píxeles abajo
    const i = y * W + xx; if (y >= 2 && lleno[i - 2 * W] && !lleno[i]) pon(i, sombra);
  }
  for (let y = 0; y < H; y++) for (let xx = 0; xx < W; xx++) {   // el contorno
    const i = y * W + xx; if (lleno[i]) continue;
    let cerca = false; for (let dy = -1; dy <= 1 && !cerca; dy++) for (let dx = -1; dx <= 1; dx++) { const yy = y + dy, xs = xx + dx; if (yy >= 0 && yy < H && xs >= 0 && xs < W && lleno[yy * W + xs]) { cerca = true; break; } }
    if (cerca) pon(i, borde);
  }
  for (let y = 0; y < H; y++) for (let xx = 0; xx < W; xx++) {   // las letras: blanco arriba, el morado de Dark por bandas
    const i = y * W + xx; if (!lleno[i]) continue;
    if (y < 14) pon(i, blanco[y < 8 ? 0 : 1]);
    else pon(i, morado[Math.min(3, Math.floor((y - 16) / 6))]);
  }
  x.putImageData(out, 0, 0);
  return c;
}

/* ---------- la escena del título: los siete animales en la cripta, entre dos antorchas que tiemblan ---------- */
const PXU_ESC = { W: 200, H: 84, base: null, t: 0, id: 0 };
function pxuEscenaBase() {
  const { W, H } = PXU_ESC, [c, x] = pxLienzo(W, H);
  const pared = pxPared('piedra', '#3a3256', '#5a3f8a', 11), suelo = pxSuelo('losas', '#2e2840', '#5a3f8a');
  const [pc, px] = pxLienzo(64, 64); px.putImageData(pared, 0, 0);
  const [sc, sx] = pxLienzo(64, 64); sx.putImageData(suelo, 0, 0);
  for (let i = 0; i < W; i += 64) { x.drawImage(pc, i, 0, 64, 64); x.drawImage(pc, i, 64 - 64 + 6, 64, 64); }
  for (let i = 0; i < W; i += 32) x.drawImage(sc, 0, 0, 64, 32, i, 66, 32, 18);   // el suelo, aplastado (se ve de lado)
  x.fillStyle = PXU_O; x.fillRect(0, 65, W, 1);
  PXU_ESC.base = x.getImageData(0, 0, W, H);
}
function pxuEscena(cv) {
  if (!cv) return;
  const { W, H } = PXU_ESC; if (!PXU_ESC.base) pxuEscenaBase();
  cv.width = W; cv.height = H; const x = cv.getContext('2d'); x.imageSmoothingEnabled = false;
  const t = PXU_ESC.t += 1, fl = [1 + Math.sin(t * 1.7) * 0.06 + Math.sin(t * 4.1) * 0.04, 1 + Math.sin(t * 2.3 + 1) * 0.06 + Math.sin(t * 3.7) * 0.04];
  const luces = [[18, 22, 84 * fl[0]], [182, 22, 84 * fl[1]], [100, 62, 60]];
  const img = new ImageData(new Uint8ClampedArray(PXU_ESC.base.data), W, H), d = img.data;
  for (let y = 0; y < H; y++) for (let xx = 0; xx < W; xx += 2) {   // la luz, por parejas de píxeles (píxel gordo también en la luz)
    let l = 0.1; for (const [lx, ly, r] of luces) { const dd = Math.hypot(xx - lx, (y - ly) * 1.2) / r; if (dd < 1) l += (1 - dd) * (1 - dd) * 1.8; }
    const lc = Math.min(1.6, Math.round(l * 8) / 8), cal = [1.15, 0.85, 0.7];
    for (let k = 0; k < 2; k++) { const i = (y * W + xx + k) * 4; d[i] = Math.min(255, d[i] * lc * cal[0]); d[i + 1] = Math.min(255, d[i + 1] * lc * cal[1]); d[i + 2] = Math.min(255, d[i + 2] * lc * cal[2]); }
  }
  x.putImageData(img, 0, 0);
  DK_ORDEN_HEROES.forEach((k, i) => {   // los animales, de pie en el suelo, con una sombra
    const p = pxPersonaje(k, 64); if (!p) return;
    const h = Math.round(40 * DK_HEROES[k].alto / 1.9 + 8), w = Math.round(h * p.w / p.h), cx = 40 + i * 20 + (i % 2 ? 0 : 0), pie = 74 + (i % 2) * 4;
    x.fillStyle = '#0a061088'; x.fillRect(cx - Math.round(w * 0.35), pie - 1, Math.round(w * 0.7), 2);
    x.drawImage(rtLienzoDe(p), cx - Math.round(w / 2), pie - h, w, h);
  });
  const v = x.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, W * 0.62); v.addColorStop(0, '#0a061000'); v.addColorStop(1, '#0a0610bb');   // viñeta
  x.fillStyle = v; x.fillRect(0, 0, W, H);
  for (const [i, ax] of [[0, 18], [1, 182]]) { const a = pxAntorcha((Math.floor(t / 2) + i) % 3, '#ffb02a'); x.drawImage(rtLienzoDe(a), ax - 5, 12); }   // las antorchas, encima de la viñeta: brillan
}
// anima la escena mientras se vea la pantalla del título
function pxuEscenaAnima(cv, activa) {
  clearInterval(PXU_ESC.id); if (!activa) return;
  pxuEscena(cv); PXU_ESC.id = setInterval(() => pxuEscena(cv), 140);
}
