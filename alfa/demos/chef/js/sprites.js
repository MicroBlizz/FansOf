// Fans of Chef · SPRITES: el arte de Yoshi (los PNG de img/, generados en ComfyUI y preparados con herramientas/comfyui/chef_sprites.py)
// y, para lo que aún no tiene imagen, un dibujo por código con la misma paleta. Se pinta con pintaSpr(ctx, nombre, x, y, opciones):
// x, y son los PIES del sprite (el centro abajo). También las cajas y el texto en letra de píxel.
'use strict';

const PALETA = {
  K: '#1a1226', W: '#ffffff', w: '#e4def0',
  B: '#8b5a2b', b: '#5a3a1a', T: '#c89058', u: '#3a2410', U: '#241608',   // maderas y tierra del sótano
  S: '#8c7f74', s: '#5a4f47', t: '#b5a79a',                               // piedra: base, sombra, luz
  R: '#e8342a', r: '#ff8a7a', D: '#8b1e3f',                               // rojo tomate y oscuro
  O: '#ff8a1f', o: '#c75a0a', Y: '#ffd23f', y: '#c7901a', F: '#ff5a1f', f: '#ffd166',   // naranja, oro y fuego
  G: '#7be04a', g: '#3f9a2a', H: '#d8ff9a',                               // verdes de la gelatina
  N: '#2a2a3a', n: '#4a4a5e', Q: '#6ee7ff',
};

const IMG = {};
const IMG_LISTA = ['chef_abajo', 'chef_arriba', 'chef_lado', 'tomate', 'cebollon', 'gelatina', 'ing_tomate', 'ing_cebolla', 'ing_gelatina',
  'ico_cuchillo', 'ico_sarten', 'ico_corazon', 'cofre', 'antorcha', 'columna', 'barril', 'huesos', 'charco', 'escombros', 'verja',
  'sala_1', 'sala_2', 'sala_3', 'sala_4', 'sala_5', 'sala_6', 'sala_7', 'cantina'];
function cargaImagenes() {
  return Promise.all(IMG_LISTA.map(n => new Promise(res => {
    const im = new Image();
    im.onload = () => { IMG[n] = im; res(); };
    im.onerror = () => res();   // sin imagen: se dibuja por código
    im.src = 'img/' + n + '.png?v=' + (NUCLEO.version || '0');
  })));
}

function caja(ctx, x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
function cajaMarco(ctx, x, y, w, h, fondo, borde = PALETA.K) { caja(ctx, x, y, w, h, borde); caja(ctx, x + 1, y + 1, w - 2, h - 2, fondo); }
function circulo(ctx, cx, cy, r, color) {
  ctx.fillStyle = color; cx = Math.round(cx); cy = Math.round(cy);
  for (let dy = -r; dy <= r; dy++) { const dx = Math.floor(Math.sqrt(Math.max(0, r * r - dy * dy))); ctx.fillRect(cx - dx, cy + dy, dx * 2 + 1, 1); }
}
function anillo(ctx, cx, cy, r, color) {
  ctx.fillStyle = color; cx = Math.round(cx); cy = Math.round(cy);
  for (let a = 0; a < 64; a++) ctx.fillRect(Math.round(cx + Math.cos(a / 64 * 6.283) * r), Math.round(cy + Math.sin(a / 64 * 6.283) * r), 1, 1);
}

// --- dibujos por código para lo que aún no ha pintado Yoshi (mismo tamaño que tendrá el sprite) ---
const DIBUJO = {
  tomate(ctx, x, y, o) {   // 20 × 24: una bola roja furiosa con hojas
    const sx = x - 10, sy = y - 24, m = o.mecha ? (Math.sin(o.t * 40) > 0 ? 1 : 0) : 0;
    circulo(ctx, x, sy + 15, 9, PALETA.K); circulo(ctx, x, sy + 15, 8, m ? PALETA.O : PALETA.R); circulo(ctx, x - 3, sy + 12, 2, PALETA.r);
    caja(ctx, x - 1, sy + 2, 2, 5, PALETA.g); caja(ctx, x - 5, sy + 5, 4, 2, PALETA.G); caja(ctx, x + 1, sy + 5, 4, 2, PALETA.G);
    caja(ctx, x - 5, sy + 12, 3, 1, PALETA.K); caja(ctx, x + 2, sy + 12, 3, 1, PALETA.K);   // cejas
    caja(ctx, x - 4, sy + 13, 2, 2, PALETA.W); caja(ctx, x + 2, sy + 13, 2, 2, PALETA.W); caja(ctx, x - 3, sy + 14, 1, 1, PALETA.K); caja(ctx, x + 3, sy + 14, 1, 1, PALETA.K);
    caja(ctx, x - 3, sy + 18, 6, 2, PALETA.D); caja(ctx, x - 2, sy + 18, 1, 1, PALETA.W); caja(ctx, x + 1, sy + 18, 1, 1, PALETA.W);
    void sx;
  },
  cebollon(ctx, x, y) {   // 28 × 34
    const sy = y - 34;
    circulo(ctx, x, sy + 20, 13, PALETA.K); circulo(ctx, x, sy + 20, 12, PALETA.y); circulo(ctx, x - 4, sy + 16, 4, PALETA.O);
    caja(ctx, x - 1, sy + 2, 2, 7, PALETA.g); caja(ctx, x - 4, sy + 1, 2, 6, PALETA.G); caja(ctx, x + 2, sy + 1, 2, 6, PALETA.G);
    caja(ctx, x - 7, sy + 16, 4, 1, PALETA.K); caja(ctx, x + 3, sy + 16, 4, 1, PALETA.K); caja(ctx, x - 6, sy + 17, 3, 3, PALETA.W); caja(ctx, x + 3, sy + 17, 3, 3, PALETA.W);
    caja(ctx, x - 5, sy + 18, 1, 1, PALETA.K); caja(ctx, x + 4, sy + 18, 1, 1, PALETA.K);
    caja(ctx, x - 5, sy + 23, 10, 4, PALETA.D); caja(ctx, x - 4, sy + 23, 2, 2, PALETA.W); caja(ctx, x + 2, sy + 23, 2, 2, PALETA.W);
    for (let i = -2; i <= 2; i++) caja(ctx, x + i * 4 - 1, sy + 31, 2, 3, PALETA.b);
  },
  gelatina(ctx, x, y, o) {   // 26 × 22
    const sy = y - 22, b = Math.sin(o.t * 6) * 1.5;
    circulo(ctx, x, sy + 13 - b, 12, PALETA.K); circulo(ctx, x, sy + 13 - b, 11, PALETA.G); circulo(ctx, x, sy + 15 - b, 5, PALETA.O); circulo(ctx, x, sy + 15 - b, 2, PALETA.f);
    circulo(ctx, x - 5, sy + 7 - b, 2, PALETA.H); caja(ctx, x - 12, sy + 20, 24, 2, PALETA.g);
  },
  chef_abajo(ctx, x, y) {   // 38 × 40, por si no carga la imagen
    const sy = y - 40;
    caja(ctx, x - 7, sy + 2, 14, 10, PALETA.W); caja(ctx, x - 5, sy + 12, 10, 8, '#f3c9a0'); caja(ctx, x - 5, sy + 12, 10, 2, PALETA.b);
    caja(ctx, x - 6, sy + 20, 12, 3, PALETA.R); caja(ctx, x - 7, sy + 23, 14, 10, PALETA.W); caja(ctx, x - 6, sy + 33, 5, 6, PALETA.N); caja(ctx, x + 1, sy + 33, 5, 6, PALETA.N);
    caja(ctx, x - 13, sy + 8, 3, 12, PALETA.t); caja(ctx, x + 9, sy + 14, 7, 7, PALETA.N);
  },
  columna(ctx, x, y) {   // 20 × 52: base, fuste y capitel de piedra
    caja(ctx, x - 10, y - 8, 20, 8, PALETA.K); caja(ctx, x - 9, y - 7, 18, 6, PALETA.S); caja(ctx, x - 9, y - 7, 18, 1, PALETA.t);
    caja(ctx, x - 7, y - 46, 14, 38, PALETA.K); caja(ctx, x - 6, y - 45, 12, 37, PALETA.S); caja(ctx, x - 6, y - 45, 3, 37, PALETA.t); caja(ctx, x + 3, y - 45, 3, 37, PALETA.s);
    caja(ctx, x - 10, y - 52, 20, 7, PALETA.K); caja(ctx, x - 9, y - 51, 18, 5, PALETA.S); caja(ctx, x - 9, y - 51, 18, 1, PALETA.t);
    for (let i = 0; i < 3; i++) caja(ctx, x - 4 + i * 4, y - 30 + i * 5, 1, 3, PALETA.s);
  },
  barril(ctx, x, y) {   // 18 × 22
    caja(ctx, x - 9, y - 21, 18, 21, PALETA.K); caja(ctx, x - 8, y - 20, 16, 19, PALETA.B); caja(ctx, x - 8, y - 20, 4, 19, PALETA.T); caja(ctx, x + 4, y - 20, 4, 19, PALETA.b);
    caja(ctx, x - 8, y - 17, 16, 2, PALETA.n); caja(ctx, x - 8, y - 6, 16, 2, PALETA.n); caja(ctx, x - 7, y - 21, 14, 1, PALETA.K);
  },
  huesos(ctx, x, y) { caja(ctx, x - 8, y - 6, 10, 2, PALETA.w); caja(ctx, x - 9, y - 7, 2, 4, PALETA.w); caja(ctx, x, y - 7, 2, 4, PALETA.w); circulo(ctx, x + 5, y - 6, 4, PALETA.K); circulo(ctx, x + 5, y - 6, 3, PALETA.w); caja(ctx, x + 4, y - 7, 1, 2, PALETA.K); caja(ctx, x + 6, y - 7, 1, 2, PALETA.K); caja(ctx, x - 3, y - 3, 6, 1, PALETA.x || '#c3bbd6'); },
  charco(ctx, x, y, o) { ctx.globalAlpha = 0.55; circulo(ctx, x, y - 6, 9, '#0d1a26'); circulo(ctx, x + 2, y - 5, 6, '#163048'); ctx.globalAlpha = 0.5 + Math.sin((o.t || 0) * 2 + x) * 0.15; caja(ctx, x - 3, y - 8, 4, 1, '#ffb866'); ctx.globalAlpha = 1; },
  escombros(ctx, x, y) { caja(ctx, x - 7, y - 4, 14, 3, PALETA.s); caja(ctx, x - 5, y - 6, 5, 3, PALETA.S); caja(ctx, x + 1, y - 7, 4, 4, PALETA.S); caja(ctx, x + 2, y - 7, 2, 1, PALETA.t); caja(ctx, x - 3, y - 6, 2, 1, PALETA.t); caja(ctx, x - 8, y - 2, 3, 1, PALETA.s); },
  verja(ctx, x, y) {   // 22 × 28: el arco de una celda con barrotes, en la cara del muro
    caja(ctx, x - 11, y - 28, 22, 28, PALETA.K); caja(ctx, x - 10, y - 27, 20, 26, '#120d0a');
    for (let i = -8; i <= 8; i += 4) caja(ctx, x + i, y - 26, 2, 25, PALETA.n); caja(ctx, x - 10, y - 18, 20, 2, PALETA.n); caja(ctx, x - 10, y - 8, 20, 2, PALETA.n);
    caja(ctx, x - 11, y - 28, 22, 1, PALETA.t);
  },
  cofre(ctx, x, y) { cajaMarco(ctx, x - 10, y - 16, 20, 16, PALETA.B); caja(ctx, x - 10, y - 10, 20, 1, PALETA.K); caja(ctx, x - 2, y - 11, 4, 4, PALETA.Y); caja(ctx, x - 8, y - 15, 16, 2, PALETA.T); },
  reja(ctx, x, y) { caja(ctx, x - 10, y - 10, 20, 20, PALETA.N); for (let i = 0; i < 4; i++) caja(ctx, x - 8, y - 8 + i * 5, 16, 2, PALETA.K); },
  antorcha(ctx, x, y, o) { caja(ctx, x - 1, y - 10, 3, 10, PALETA.b); const f = Math.sin(o.t * 14 + x) > 0; circulo(ctx, x, y - 12, 3, PALETA.F); circulo(ctx, x, y - 13 - (f ? 1 : 0), 2, PALETA.f); },
  montacargas(ctx, x, y, o) {   // la puerta de servicio del fondo: dos hojas de metal y una luz encima
    cajaMarco(ctx, x - 18, y - 36, 36, 36, PALETA.n); caja(ctx, x - 1, y - 34, 2, 32, PALETA.K);
    caja(ctx, x - 14, y - 30, 10, 2, PALETA.t); caja(ctx, x + 4, y - 30, 10, 2, PALETA.t);
    caja(ctx, x - 6, y - 40, 12, 4, PALETA.K); caja(ctx, x - 4, y - 39, 8, 2, o.listo ? PALETA.G : PALETA.Y);
  },
  ing(ctx, x, y, o) { const c = INGREDIENTES[o.que]; circulo(ctx, x, y - 5, 5, PALETA.K); circulo(ctx, x, y - 5, 4, c.color); caja(ctx, x - 2, y - 8, 2, 2, c.luz); },
  ico_corazon(ctx, x, y, o) { const c = o.vacio ? PALETA.n : PALETA.R; caja(ctx, x - 4, y - 8, 3, 3, c); caja(ctx, x + 1, y - 8, 3, 3, c); caja(ctx, x - 5, y - 6, 10, 3, c); caja(ctx, x - 3, y - 3, 6, 2, c); caja(ctx, x - 1, y - 1, 2, 1, c); if (!o.vacio) caja(ctx, x - 3, y - 7, 1, 1, PALETA.r); },
  ico_cuchillo(ctx, x, y) { caja(ctx, x - 1, y - 13, 3, 9, PALETA.t); caja(ctx, x - 1, y - 14, 2, 1, PALETA.W); caja(ctx, x - 2, y - 4, 5, 1, PALETA.y); caja(ctx, x - 1, y - 3, 3, 4, PALETA.b); },
  ico_sarten(ctx, x, y) { circulo(ctx, x - 2, y - 7, 5, PALETA.K); circulo(ctx, x - 2, y - 7, 4, PALETA.N); circulo(ctx, x - 2, y - 7, 2, PALETA.n); caja(ctx, x + 3, y - 8, 5, 2, PALETA.K); },
};

// pinta el sprite `nombre` con los pies en (x, y). o: { espejo, t, mecha, que, vacio, listo, alto }
function pintaSpr(ctx, nombre, x, y, o = {}) {
  const im = IMG[nombre];
  if (im) {
    const w = im.width, h = im.height;
    x = Math.round(x); y = Math.round(y);
    if (o.espejo) { ctx.save(); ctx.translate(x, 0); ctx.scale(-1, 1); ctx.drawImage(im, -Math.round(w / 2), y - h); ctx.restore(); }
    else ctx.drawImage(im, x - Math.round(w / 2), y - h);
    return true;
  }
  const d = DIBUJO[nombre] || (nombre.startsWith('ing_') ? DIBUJO.ing : null);
  if (d) { if (nombre.startsWith('ing_')) o = Object.assign({ que: nombre.slice(4) }, o); d(ctx, Math.round(x), Math.round(y), o); return true; }
  return false;
}
// tamaño (ancho, alto) del sprite, para las cajas de choque y el orden de pintado
function tamSpr(nombre, porDefecto) { const im = IMG[nombre]; return im ? [im.width, im.height] : porDefecto; }

function letra(ctx, txt, x, y, color = PALETA.W, alinea = 'left', tam = 8, borde = true) {
  ctx.font = tam + 'px "Press Start 2P", monospace'; ctx.textAlign = alinea; ctx.textBaseline = 'alphabetic';
  x = Math.round(x); y = Math.round(y);
  if (borde) { ctx.fillStyle = PALETA.K; ctx.fillText(txt, x + 1, y + 1); }
  ctx.fillStyle = color; ctx.fillText(txt, x, y);
}
// un texto que no cabe se encoge (queda algo borroso, pero se lee)
function letraCabe(ctx, txt, x, y, ancho, color, alinea = 'left', tam = 8) {
  ctx.font = tam + 'px "Press Start 2P", monospace';
  const w = ctx.measureText(txt).width;
  if (w <= ancho) { letra(ctx, txt, x, y, color, alinea, tam); return; }
  ctx.save(); const f = ancho / w; ctx.translate(Math.round(x), Math.round(y)); ctx.scale(f, 1); letra(ctx, txt, 0, 0, color, alinea, tam); ctx.restore();
}
// un panel de madera como los de la libreta de Daniel: tinta fuera, madera dentro, una línea de luz arriba
function marcoMadera(ctx, x, y, w, h) {
  x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
  caja(ctx, x, y, w, h, PALETA.K); caja(ctx, x + 1, y + 1, w - 2, h - 2, PALETA.b); caja(ctx, x + 2, y + 2, w - 4, h - 4, 'rgba(40,24,10,0.92)');
  caja(ctx, x + 2, y + 2, w - 4, 1, PALETA.B);
}
