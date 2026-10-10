// Fans of Tactics Advance (prototipo) · FONDOS: el cielo de cada escenario, pintado una vez con tramas de consola (atardecer con mar de
// nubes para el Cementerio, ciudad de noche para las Oficinas), más lo que se mueve: nubes, estrellas, luciérnagas y luces.
'use strict';

const FW = 360, FH = 240, HORIZONTE = 112;

function lienzoNuevo(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function degradado(d, w, x, y, bandas, t) {
  const f = t * (bandas.length - 1), i = Math.floor(f), r = f - i;
  return bandas[Math.min(bandas.length - 1, i + (r > bayer(x, y) ? 1 : 0))];
}
function pintaPixeles(c, fn) {
  const w = c.width, h = c.height, g = c.getContext('2d'), img = g.getImageData(0, 0, w, h), d = new Uint32Array(img.data.buffer);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const col = fn(x, y); if (col) d[y * w + x] = rgba(col); }
  g.putImageData(img, 0, 0);
}

/* ---------- Cementerio: atardecer sobre un mar de nubes ---------- */
const CIELO_TARDE = ['#140e30', '#1c1440', '#281a52', '#3a2262', '#552a70', '#763478', '#9c4078', '#c25074', '#e0686c', '#f2886a', '#fcac74', '#ffcc88'];
const NUBES_TARDE = ['#ffe6c8', '#fbc4a4', '#e89a98', '#c47390', '#965486', '#683c74', '#432a5c'];
function fondoAtardecer() {
  const c = lienzoNuevo(FW, FH), sol = { x: 250, y: HORIZONTE - 4, r: 17 };
  pintaPixeles(c, (x, y) => {
    if (y <= HORIZONTE + 6) {
      let col = degradado(null, FW, x, y, CIELO_TARDE, Math.min(1, y / (HORIZONTE + 6)));
      const dx = x - sol.x, dy = y - sol.y, d = Math.sqrt(dx * dx + dy * dy);
      if (d < sol.r + 10 && d >= sol.r) { if (bayer(x, y) < 0.35 * (1 - (d - sol.r) / 10)) col = '#ffd6a0'; }
      if (d < sol.r) col = d < sol.r - 3 ? (dy > 3 && (dy % 4 === 0) ? '#ffb478' : '#fff0c8') : '#ffd890';
      if (y < 60 && hash(x, y, 77) < 0.012) col = hash(x, y, 78) < 0.5 ? '#ffffff' : '#c8b8ff';
      // nubes alargadas del cielo
      const n = Math.sin(x * 0.045 + Math.sin(y * 0.3) * 0.6) + ruido(x / 26, y / 3, 41) * 1.6;
      if (y > 50 && y < 96 && n > 1.6) col = n > 2 ? '#f6a08a' : '#c86a84';
      return col;
    }
    // el mar de nubes
    const yy = y - HORIZONTE, b = ruido(x / 18, yy / 7, 5) * 0.8 + ruido(x / 7, yy / 4, 6) * 0.35 + Math.sin(x * 0.07) * 0.12;
    const v = yy / 30 + (0.7 - b) * 0.9 + (bayer(x, y) - 0.5) * 0.22;
    return NUBES_TARDE[Math.max(0, Math.min(NUBES_TARDE.length - 1, Math.floor(v * 3)))];
  });
  // ruinas lejanas sobre las nubes (siluetas)
  const g = c.getContext('2d');
  g.fillStyle = '#3e2858';
  const silueta = [[40, 14, 22], [52, 6, 34], [58, 8, 18], [70, 10, 26], [300, 10, 20], [312, 5, 30], [318, 9, 14]];
  for (const [x, w, h] of silueta) { g.fillRect(x, HORIZONTE - h + 4, w, h); g.fillRect(x + Math.floor(w / 2) - 1, HORIZONTE - h - 3, 2, 4); }
  g.fillRect(30, HORIZONTE + 1, 60, 4); g.fillRect(292, HORIZONTE + 1, 44, 4);
  g.fillStyle = '#ffcf7a'; g.fillRect(55, HORIZONTE - 20, 1, 2); g.fillRect(313, HORIZONTE - 16, 1, 2);
  return c;
}
// banda de nubes que pasa despacio por delante del horizonte
function nubesSueltas() {
  const c = lienzoNuevo(FW * 2, 40);
  pintaPixeles(c, (x, y) => {
    const n = ruido(x / 20, y / 5, 61) + ruido(x / 9, y / 3, 62) * 0.4 - Math.abs(y - 20) / 22;
    if (n < 0.78) return null;
    return n > 1.05 ? '#ffe2c4' : n > 0.92 ? '#f4b49c' : '#d0889a';
  });
  return c;
}

/* ---------- Oficinas: la ciudad de noche, vista desde lo alto de la torre ---------- */
const CIELO_NOCHE = ['#04060e', '#080c1c', '#0e1430', '#141c40', '#1c284e', '#26365e', '#30446c'];
function fondoNoche() {
  const c = lienzoNuevo(FW, FH);
  pintaPixeles(c, (x, y) => {
    let col = degradado(null, FW, x, y, CIELO_NOCHE, Math.min(1, y / (HORIZONTE + 30)));
    if (y < 80 && hash(x, y, 91) < 0.01) col = hash(x, y, 92) < 0.6 ? '#ffffff' : '#9cc4ff';
    return col;
  });
  const g = c.getContext('2d');
  // luna
  g.fillStyle = '#f4f0d8'; for (let dy = -9; dy <= 9; dy++) { const dx = Math.floor(Math.sqrt(81 - dy * dy)); g.fillRect(60 - dx, 34 + dy, dx * 2 + 1, 1); }
  g.fillStyle = '#d8d2b4'; g.fillRect(56, 30, 3, 2); g.fillRect(63, 37, 2, 2); g.fillRect(58, 39, 2, 1);
  // edificios: tres capas, cada vez más cerca y más oscuras
  const capas = [['#1a2546', '#3a5a8a', 0.18, HORIZONTE + 10, 14, 30], ['#121a34', '#ffd86a', 0.28, HORIZONTE + 34, 20, 44], ['#0a0f20', '#ffe9a8', 0.36, HORIZONTE + 70, 28, 60]];
  capas.forEach(([col, luz, prob, base, minW, maxH], k) => {
    let x = -4;
    while (x < FW) {
      const w = minW + Math.floor(hash(x, k, 1) * 14), h = 12 + Math.floor(hash(x, k, 2) * maxH);
      g.fillStyle = col; g.fillRect(x, base - h, w, FH - base + h);
      for (let yy = base - h + 3; yy < FH; yy += 4) for (let xx = x + 2; xx < x + w - 2; xx += 3)
        if (hash(xx, yy, k + 5) < prob) { g.fillStyle = hash(xx, yy, 9) < 0.15 ? '#7ad8ff' : luz; g.fillRect(xx, yy, 2 - (k === 0 ? 1 : 0), 2); }
      x += w + 1 + Math.floor(hash(x, k, 3) * 3);
    }
  });
  // la torre de Microblizz con su letrero rojo
  g.fillStyle = '#0c1226'; g.fillRect(268, 40, 40, FH);
  g.fillStyle = '#16203e'; g.fillRect(270, 44, 2, FH);
  g.fillStyle = '#0c1226'; g.fillRect(286, 26, 3, 16);
  for (let yy = 60; yy < FH; yy += 5) for (let xx = 274; xx < 304; xx += 4) if (hash(xx, yy, 33) < 0.4) { g.fillStyle = '#ffd86a'; g.fillRect(xx, yy, 2, 2); }
  return c;
}

/* ---------- lo que se mueve ---------- */
const LUCES = Array.from({ length: 16 }, (_, k) => ({ x: hash(k, 1) * 300, y: hash(k, 2) * 200, f: hash(k, 3) * 6.28, v: 0.4 + hash(k, 4) * 0.6 }));
function pintaLuciernagas(ctx, t, ox, oy) {
  for (const L of LUCES) {
    const x = Math.round((L.x + Math.sin(t * L.v + L.f) * 14 + t * 3) % 300 + ox - 30), y = Math.round(L.y + Math.cos(t * L.v * 1.3 + L.f) * 8 + oy);
    const brillo = (Math.sin(t * 2.2 + L.f * 3) + 1) / 2;
    if (brillo < 0.25) continue;
    ctx.globalAlpha = 0.35 * brillo; ctx.fillStyle = '#e8ff8a';
    ctx.fillRect(x - 1, y, 3, 1); ctx.fillRect(x, y - 1, 1, 3);
    ctx.globalAlpha = 1; ctx.fillStyle = brillo > 0.7 ? '#ffffe0' : '#d8f070'; ctx.fillRect(x, y, 1, 1);
  }
  ctx.globalAlpha = 1;
}
function pintaLetrero(ctx, t, x, y) {
  // MICROBLIZZ en la torre: se enciende letra a letra
  const on = Math.floor(t * 3) % 14;
  escribeMini(ctx, 'MICROBLIZZ', x, y, on < 11 ? '#ff4a5a' : '#7a1c2a');
  if (on < 11) { ctx.globalAlpha = 0.25; ctx.fillStyle = '#ff4a5a'; ctx.fillRect(x - 2, y - 2, 43, 9); ctx.globalAlpha = 1; }
}
