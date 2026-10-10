// Fans of Roguelite · Los paisajes del Cementerio de juegos (luna verde, niebla, lápidas con epitafios de juegos cerrados y la
// Cripta que se acerca) y de la Torre de Microblizz (ciudad al atardecer y de noche, rascacielos con neones, acera, coches y la
// Torre, que cada vez lo tapa todo). Usan el motor de fondo.js.
'use strict';

/* ================= Cementerio de juegos ================= */
const LUZ_CEMENTERIO = [
  { cielo: ['#2a1b4e', '#3b2468', '#55307a', '#6e3a88', '#8a4a8a', '#a8608a', '#c88a8a'], tinte: '#6a4a9a', k: 0.18, sol: 'lunaVerde' },
  { cielo: ['#221640', '#30205a', '#40286a', '#55307a', '#6a3c80', '#7a4a7a', '#9a6a7a'], tinte: '#5a3a90', k: 0.24, sol: 'lunaVerde' },
  { cielo: ['#1a1236', '#261a4c', '#33205e', '#40286a', '#4a3070', '#563a6e', '#6a4a6e'], tinte: '#4a3a88', k: 0.3, sol: 'lunaVerde', noche: true },
  { cielo: ['#140e2c', '#1e1640', '#281c50', '#33205e', '#3a2866', '#45306a', '#5a3a6a'], tinte: '#3a2a78', k: 0.36, sol: 'lunaVerde', noche: true },
  { cielo: ['#100a24', '#181236', '#201844', '#281c50', '#30225a', '#3a2a60', '#4a3466'], tinte: '#2a2068', k: 0.42, sol: 'lunaVerde', noche: true },
  { cielo: ['#0a0618', '#120c26', '#1a1236', '#221640', '#2a1c4a', '#342456', '#5a2a5a'], tinte: '#24104a', k: 0.48, sol: 'roja', noche: true },
];
const EPITAFIOS = [['AQUÍ YACE', 'UN MMO'], ['CERRADO', 'POR RECORTES'], ['EL DLC', 'NUNCA LLEGÓ'], ['SERVIDORES', 'APAGADOS'], ['R.I.P.', 'VERSIÓN 1.0'], ['DESCANSE', 'EN PARCHE']];

// la Cripta a lo lejos: columnas, tejado en pico y la puerta verde que brilla más cada noche
function criptaDe(fase, ti, hz) {
  const h = [30, 36, 44, 54, 66, 80][fase], w = Math.round(h * 1.1), lejos = 0.5 - fase * 0.08;
  const piedra = mezcla(ti('#6e6e86'), hz, lejos), luz = mezcla(ti('#9a9ab4'), hz, lejos), borde = mezcla('#1a1426', hz, lejos * 0.7);
  const c = lienzoNuevo(w + 4, h + 4), g = c.getContext('2d'), x0 = 2, y0 = Math.round(h * 0.32) + 2, hb = h - y0 + 2;
  for (let y = 0; y < y0; y++) { const half = Math.round((y / y0) * (w / 2)); g.fillStyle = y === 0 ? borde : piedra; g.fillRect(x0 + w / 2 - half - 1, y + 2, half * 2 + 2, 1); g.fillStyle = borde; g.fillRect(x0 + w / 2 - half - 1, y + 2, 1, 1); g.fillRect(x0 + w / 2 + half, y + 2, 1, 1); }
  g.fillStyle = borde; g.fillRect(x0 - 1, y0, w + 2, hb + 1);
  g.fillStyle = piedra; g.fillRect(x0, y0 + 1, w, hb - 1);
  const cols = Math.max(3, Math.round(w / 9));
  for (let i = 0; i < cols; i++) { const cx = x0 + 2 + Math.round(i * (w - 6) / (cols - 1)); g.fillStyle = luz; g.fillRect(cx, y0 + 3, 2, hb - 4); g.fillStyle = borde; g.fillRect(cx + 2, y0 + 3, 1, hb - 4); }
  const pw = Math.max(5, Math.round(w * 0.22)), ph = Math.round(hb * 0.62), px = x0 + Math.round(w / 2 - pw / 2);
  g.fillStyle = borde; g.fillRect(px - 1, y0 + hb - ph - 1, pw + 2, ph + 1);
  g.fillStyle = fase >= 3 ? '#7cffb0' : mezcla('#5ef2d0', hz, lejos); g.fillRect(px, y0 + hb - ph, pw, ph);
  g.fillStyle = fase >= 3 ? '#d8ffe8' : mezcla('#bfffe8', hz, lejos); g.fillRect(px + 1, y0 + hb - ph + 1, Math.max(1, pw - 3), 2);
  c.punta = [x0 + Math.round(w / 2), 2];
  return c;
}
function arbolMuertoEn(g, x, base, alto, color, s) {
  const rama = (x0, y0, ang, largo, n) => {
    if (n <= 0 || largo < 2) return;
    const x1 = x0 + Math.cos(ang) * largo, y1 = y0 + Math.sin(ang) * largo, pasos = Math.ceil(largo);
    g.fillStyle = color;
    for (let k = 0; k <= pasos; k++) g.fillRect(Math.round(x0 + (x1 - x0) * k / pasos), Math.round(y0 + (y1 - y0) * k / pasos), n > 2 ? 2 : 1, 1);
    rama(x1, y1, ang - 0.5 - hash(n, s) * 0.3, largo * 0.65, n - 1);
    rama(x1, y1, ang + 0.4 + hash(n, s + 1) * 0.3, largo * 0.6, n - 1);
  };
  rama(x, base, -Math.PI / 2 + (hash(s, 3) - 0.5) * 0.4, alto * 0.45, 4);
}
function colinasCementerio(fase, ti, hz) {
  const w = 384, h = 64, c = lienzoNuevo(w, h), g = c.getContext('2d');
  const hb = x => 30 + 8 * Math.sin((x / w) * Math.PI * 4 + 1) + 4 * Math.sin((x / w) * Math.PI * 12);
  const hf = x => 18 + 6 * Math.sin((x / w) * Math.PI * 6 + 2.5) + 3 * Math.sin((x / w) * Math.PI * 16);
  const atras = mezcla(ti('#3a3458'), hz, 0.3), atrasL = mezcla(ti('#5a5480'), hz, 0.3), delante = mezcla(ti('#2e3a3a'), hz, 0.1), delanteL = mezcla(ti('#4a6a5a'), hz, 0.1);
  const pinta = (f, base, alto) => { for (let x = 0; x < w; x++) { const top = h - Math.round(f(x)); g.fillStyle = alto; g.fillRect(x, top, 1, 1); g.fillStyle = base; g.fillRect(x, top + 1, 1, h - top); } };
  pinta(hb, atras, atrasL);
  for (let i = 0; i < 6; i++) { const x = Math.floor((i / 6) * w + hash(i, 4, fase) * 40); for (const off of [-w, 0, w]) arbolMuertoEn(g, x + off, h - Math.round(hb(x)) + 1, 26, mezcla(ti('#2a2238'), hz, 0.2), i); }
  pinta(hf, delante, delanteL);
  const piedra = mezcla(ti('#7a7a92'), hz, 0.12), piedraS = mezcla(ti('#4a4a60'), hz, 0.12);
  for (let i = 0; i < 22; i++) {
    const x = Math.floor((i / 22) * w + hash(i, 5, fase) * 12), y = h - Math.round(hf(x)) + 2, cruz = hash(i, 6) > 0.7;
    for (const off of [-w, 0, w]) {
      const X = x + off;
      g.fillStyle = OL;
      if (cruz) { g.fillRect(X - 1, y - 9, 3, 10); g.fillRect(X - 3, y - 7, 7, 3); g.fillStyle = piedra; g.fillRect(X, y - 8, 1, 8); g.fillRect(X - 2, y - 6, 5, 1); }
      else { g.fillRect(X - 3, y - 7, 7, 8); g.fillRect(X - 2, y - 8, 5, 1); g.fillStyle = piedra; g.fillRect(X - 2, y - 7, 5, 7); g.fillRect(X - 1, y - 7, 3, 1); g.fillStyle = piedraS; g.fillRect(X + 2, y - 6, 1, 6); }
    }
  }
  return c;
}
function sueloCementerio(ti) {
  const C = { hb: ti('#4a6a52'), hs: ti('#2e4438'), hl: ti('#7a9a7a'), cam: ti('#6a5a6a'), camS: ti('#4a3e4e'), camL: ti('#8a7a8a'), hueso: ti('#efeadf'),
    tierra: ti('#3a2e3a'), tierraS: ti('#2a2030'), tierraL: ti('#4e3e4e') };
  return imagen(64, ESC.Y + ESC.H - (SUELO - 10), (x, y) => {
    const v = hash(x, y, 5), bl = Math.floor(hash(x, 0, 19) * 4);
    if (y < 4) return y >= 4 - bl && (x % 4) === 1 ? (y === 4 - bl ? C.hl : C.hb) : null;
    if (y < 8) return y === 4 ? C.hl : y === 7 && BAYER[y & 3][x & 3] < 8 ? C.hs : C.hb;
    if (y < 24) {
      if (y === 8 || (y === 9 && BAYER[1][x & 3] < 8)) return C.camS;
      if ((y === 15 || y === 20) && hash(x >> 2, y) > 0.35) return C.camS;
      if (hash(x >> 2, y >> 1, 23) > 0.985) return C.hueso;
      if (hash(x >> 1, y >> 1, 7) > 0.96) return (y & 1) ? C.camS : C.camL;
      return C.cam;
    }
    if (y < 28) return y === 24 ? C.hl : y === 27 ? C.hs : C.hb;
    if (y === 28) return C.tierraS;
    if (y === 34 && v > 0.3) return C.tierraL;
    if (hash(x >> 1, y >> 1, 31) > 0.97) return C.hueso;
    return BAYER[y & 3][x & 3] < 3 ? C.tierraS : C.tierra;
  });
}
function propCementerio(tipo, v, T) {
  const piedra = pal(T('#8a8aa0'), T('#5a5a70'), T('#b8b8d0'), '#22222e'), hierro = pal(T('#3a3448'), T('#221e2c'), T('#5a5470'), '#0e0a14');
  let s;
  if (tipo === 'lapida') { s = hazProp(14, 16, 7, 15, p => { p.parte(F.un(F.rr(-4, -11, 8, 11, 1), F.ov(0, -11, 4, 3)), piedra, { sombra: 2 }); p.plano(F.re(-2, -9, 4, 1), '#4a4a60'); p.plano(F.re(-2, -7, 3, 1), '#4a4a60'); if (v % 2) p.plano(F.tr(2, -6, 0, -3, 0.5), '#4a4a60'); }); s.bajo = true; }
  if (tipo === 'cruz') s = hazProp(14, 20, 7, 19, p => { p.parte(F.un(F.re(-1, -16, 2.4, 16), F.re(-4.5, -12, 9.4, 2.4)), pal(T('#6b4a2e'), T('#4a3020'), T('#8f6a46'), '#1a0e06'), { sombra: 0 }); });
  if (tipo === 'verja') s = hazProp(30, 18, 15, 17, p => { p.parte(F.un(F.re(-13, -10, 26, 1.4), F.re(-13, -4, 26, 1.4)), hierro, { sombra: 0 }); for (let x = -12; x <= 12; x += 4) p.parte(F.un(F.re(x - 0.6, -14, 1.4, 14), F.pol(x - 1.6, -14, x + 1.6, -14, x + 0.1, -16.5)), hierro, { sombra: 0 }); });
  if (tipo === 'arbolMuerto') s = hazProp(40, 44, 20, 43, p => { p.parte(F.un(F.tr(0, 0, -1, -22, 2.4, 1.4), F.tr(-1, -14, -9, -26, 1.2, 0.5), F.tr(-1, -20, 7, -32, 1.2, 0.5), F.tr(-1, -22, -3, -36, 1, 0.4), F.tr(3, -26, 10, -28, 0.8, 0.4)), pal(T('#4a3a40'), T('#2e2228'), T('#6a5a60'), '#120a0e'), { sombra: 1 }); if (v % 3 === 0) { p.parte(F.ov(-8, -25, 2.2, 2), pal(T('#ff8a1f'), T('#c45a12'), T('#ffcb3d'), '#4a1a06'), { sombra: 0 }); } });
  if (tipo === 'farolillo') { s = hazProp(12, 30, 6, 29, p => { p.parte(F.re(-0.8, -22, 1.6, 22), hierro, { sombra: 0 }); p.parte(F.rr(-3, -27, 6, 6, 1), hierro, { sombra: 0 }); p.plano(F.re(-2, -26, 4, 4), '#7cffb0'); }); s.luz = [0, -24]; s.colorLuz = '#7cffb0'; }
  if (tipo === 'calabaza') { s = hazProp(14, 12, 7, 11, p => { p.parte(F.ov(0, -4, 5.5, 4), pal('#ff8a1f', '#c45a12', '#ffcb3d', '#4a1a06'), { sombra: 1 }); p.plano(F.un(F.pol(-3, -5, -1, -5, -2, -7), F.pol(1, -5, 3, -5, 2, -7), F.re(-2, -3, 4, 1)), '#fff3a0'); p.parte(F.re(-0.6, -9, 1.4, 2), PAL_P.hierba, { sombra: 0 }); }); s.bajo = true; s.luz = [0, -4]; s.colorLuz = '#ffcb3d'; }
  if (tipo === 'huesos') { s = hazProp(16, 8, 8, 7, p => { p.parte(F.un(F.tr(-5, -1, 4, -2, 0.9), F.ov(-5.5, -1, 1.4, 1.4), F.ov(4.6, -2, 1.4, 1.4)), PAL_N.hueso, { sombra: 0 }); p.parte(F.ov(1, -3, 2.6, 2.4), PAL_N.hueso, { sombra: 0 }); p.px(0.4, -3.4, OL); p.px(2, -3.4, OL); }); s.bajo = true; }
  if (tipo === 'epitafio') {
    const [l1, l2] = EPITAFIOS[v % EPITAFIOS.length].map(tr), ancho = Math.max(anchoTexto(l1), anchoTexto(l2)) + 10, w = ancho + 8;
    s = hazProp(w, 44, Math.floor(w / 2), 43, p => {
      p.parte(F.un(F.re(-ancho / 2, -26, ancho, 26), F.ov(0, -26, ancho / 2, 8)), piedra, { sombra: 2, luz: 2 });
      letreroRecto(p, l1, 0, -24, '#2a2a3a'); letreroRecto(p, l2, 0, -15, '#2a2a3a');
      for (const x of [-ancho / 2 + 2, ancho / 2 - 3]) p.plano(F.tr(x, 0, x + 1, -3, 0.6), T('#4a6a52'));
    });
  }
  return s;
}
ESTILO.cementerio = {
  luces: LUZ_CEMENTERIO, grande: 'epitafio', sombra: ['#4a3e4e', '#3a2e3a'],
  tipos: [['lapida', 28], ['cruz', 14], ['verja', 12], ['arbolMuerto', 10], ['farolillo', 12], ['calabaza', 8], ['huesos', 8], ['epitafio', 8]],
  capas(f) {
    f.montes = montesDe(f, '#3a2e58', '#5a4e80', '#24183e', 2);
    f.hito = criptaDe(f.fase, f.ti, f.hz); f.colinas = colinasCementerio(f.fase, f.ti, f.hz); f.suelo = sueloCementerio(f.ti);
    f.nubes = [0, 1, 2].map(i => nubeDe(i, f.L, f.ti));
  },
  prop: propCementerio,
  hito(ctx, mx, t, W) {
    const T = FONDO.hito, tx = Math.round(W * 0.74 - FONDO.fase * 5 - T.width / 2 - mx * 0.015), ty = SUELO - 30 - T.height;
    ctx.drawImage(T, tx, ty);
  },
  // niebla a ras de suelo (por detrás de las cosas del camino) y fuegos fatuos (por delante)
  tras(ctx, mx, t, W) {
    const off = mx * 0.5 + t * 5;
    for (let x = 0; x < W; x += 2) {
      const h = Math.round(5 + 3 * Math.sin((x + off) / 19) + 2 * Math.sin((x + off * 0.7) / 7));
      rellenaTrama(ctx, x, SUELO - 12 - h, 2, h, 3, '#c8b8e8'); rellenaTrama(ctx, x, SUELO - 12 - Math.max(1, h - 4), 2, Math.max(1, h - 4), 2, '#ffffff');
    }
  },
  ambiente(ctx, mx, t, W) {
    for (let k = 0; k < 5; k++) { const x = Math.round(((hash(k, 1, 77) * 400 - mx * 0.5 - t * 4) % (W + 40) + W + 40) % (W + 40) - 20), y = Math.round(SUELO - 30 - hash(k, 2, 77) * 30 + Math.sin(t * 2 + k) * 3); ctx.fillStyle = '#5ef2d0'; ctx.fillRect(x, y, 2, 2); ctx.fillStyle = '#d8ffe8'; ctx.fillRect(x, y, 1, 1); }
  },
};

/* ================= Torre de Microblizz (la ciudad) ================= */
const LUZ_CIUDAD = [
  { cielo: ['#3a2a7a', '#5a3a9a', '#8a4aa8', '#c45aa0', '#f07a8a', '#ffa070', '#ffd070'], tinte: '#ff8a70', k: 0.12, sol: 'ocasoCiudad' },
  { cielo: ['#2a2070', '#40288a', '#6a3a9a', '#9a4a9a', '#d05a8a', '#f08070', '#ffb070'], tinte: '#e06a80', k: 0.16, sol: 'ocasoBajo' },
  { cielo: ['#1e1860', '#2e2278', '#4a2c8a', '#6e388e', '#9a4488', '#c45a7a', '#e8806a'], tinte: '#8a4a9a', k: 0.22, sol: 'luna', noche: true },
  { cielo: ['#141050', '#1e1866', '#2c2078', '#40287e', '#583080', '#74387a', '#9a4a6a'], tinte: '#5a3a9a', k: 0.28, sol: 'luna', noche: true },
  { cielo: ['#0c0a3a', '#141050', '#1c1662', '#261c70', '#322276', '#40287a', '#5a3270'], tinte: '#3a2a80', k: 0.34, sol: 'nada', noche: true },
  { cielo: ['#06051e', '#0c0a30', '#120e42', '#1a1450', '#22185a', '#2e1e64', '#4a2050'], tinte: '#2a1a60', k: 0.4, sol: 'roja', noche: true },
];
const ANUNCIOS = [['MICROBLIZZ+', 'CON ANUNCIOS'], ['NUEVO PASE', 'PREMIUM'], ['COMPRA YA', 'PAGA SIEMPRE'], ['TU OPINIÓN', 'NOS DA IGUAL'], ['CAJAS DE BOTÍN', '-0 %'], ['TRABAJA MÁS', 'COBRA MENOS']];
const NEONES = ['MB', 'XP', '24H', '$$$', 'GG', 'LOL'];
function edificios(w, h, f, lejos, ventanas, neon) {
  const c = lienzoNuevo(w, h), g = c.getContext('2d'), noche = f.L.noche;
  let x = 0, i = 0;
  while (x < w) {
    const bw = 14 + Math.floor(hash(i, 1, lejos * 10) * 18), bh = Math.round(h * (0.35 + hash(i, 2, lejos * 10) * 0.6));
    const base = mezcla(f.ti(['#3a3a6a', '#4a3a5a', '#2e4a6a', '#5a3a4a'][i % 4]), f.hz, lejos), borde = mezcla('#120e22', f.hz, lejos * 0.6), luz = mezcla(base, '#ffffff', 0.15);
    g.fillStyle = borde; g.fillRect(x, h - bh - 1, bw, bh + 1);
    g.fillStyle = base; g.fillRect(x + 1, h - bh, bw - 2, bh);
    g.fillStyle = luz; g.fillRect(x + 1, h - bh, 1, bh);
    if (hash(i, 3) > 0.6) { g.fillStyle = borde; g.fillRect(x + Math.floor(bw / 2), h - bh - 5, 1, 5); }
    for (let y = h - bh + 3; y < h - 2; y += ventanas) for (let k = x + 3; k < x + bw - 3; k += 3) {
      const v = hash(k, y, i), on = v < (noche ? 0.55 : 0.18);
      g.fillStyle = on ? (v < 0.1 ? '#7cf0ff' : '#ffe08a') : mezcla('#1a1a3a', f.hz, lejos); g.fillRect(k, y, 1 + (ventanas > 3 ? 1 : 0), 1 + (ventanas > 3 ? 1 : 0));
    }
    if (neon && noche && hash(i, 4) > 0.45 && bw > 18) {
      const txt = NEONES[i % NEONES.length], tw = anchoTexto(txt) + 4, ny = h - bh + 4;
      g.fillStyle = OL; g.fillRect(x + Math.floor((bw - tw) / 2), ny, tw, 11);
      const t = lienzoTexto(txt, i % 2 ? '#ff7ad8' : '#7cf0ff', 1, null); g.drawImage(t, x + Math.floor((bw - tw) / 2) + 2 - t.ox, ny + 2 - t.oy);
    }
    x += bw; i++;
  }
  return c;
}
// la Torre de Microblizz: cada vez más cerca y más alta (la última noche llega hasta arriba del cielo)
function torreGrande(fase, ti, hz) {
  const h = [52, 60, 68, 76, 84, 94][fase], w = 34 + fase * 6, noche = fase >= 2;
  const cuerpo = ti('#1d2a5e'), luz = ti('#3a5aa8'), borde = '#0a0e24';
  const c = lienzoNuevo(w + 6, h + 12), g = c.getContext('2d'), x0 = 3, y0 = 12;
  g.fillStyle = borde; g.fillRect(x0 - 1, y0 - 1, w + 2, h + 1); g.fillStyle = cuerpo; g.fillRect(x0, y0, w, h);
  g.fillStyle = luz; g.fillRect(x0, y0, 3, h);
  g.fillStyle = borde; g.fillRect(x0 + Math.floor(w / 2), 0, 1, y0);
  for (let y = y0 + 14; y < y0 + h - 2; y += 4) for (let x = x0 + 4; x < x0 + w - 3; x += 3) { const v = hash(x, y, 9); g.fillStyle = v < (noche ? 0.6 : 0.25) ? '#ffe08a' : '#16306b'; g.fillRect(x, y, 2, 2); }
  g.fillStyle = '#0f1d44'; g.fillRect(x0 + 2, y0 + 2, w - 4, 10);
  const txt = w >= 62 ? 'MICROBLIZZ' : 'MB', t = lienzoTexto(txt, noche ? '#ff5a6a' : '#e8f1ff', 1, null);
  g.drawImage(t, Math.round(x0 + w / 2 - anchoTexto(txt) / 2) - t.ox, y0 + 4 - t.oy);
  c.punta = [x0 + Math.floor(w / 2), 0];
  return c;
}
function sueloCiudad(ti) {
  const C = { muro: ti('#4a4a6a'), muroS: ti('#2e2e48'), acera: ti('#a8a8bc'), aceraS: ti('#7a7a90'), aceraL: ti('#c8c8d8'), bordillo: ti('#5a5a70'), bordilloL: ti('#8a8aa0'), asfalto: ti('#2a2a3a'), asfaltoL: ti('#3a3a4e'), raya: ti('#ffcb3d') };
  return imagen(64, ESC.Y + ESC.H - (SUELO - 10), (x, y) => {
    if (y < 6) return y === 5 ? C.muroS : (x % 16 === 0 ? C.muroS : C.muro);
    if (y < 24) { if (y === 6) return C.aceraS; if (x % 16 === 0 || (y - 6) % 9 === 0) return C.aceraS; if ((x % 16 === 1 || (y - 6) % 9 === 1) && hash(x, y) > 0.3) return C.aceraL; return hash(x >> 1, y >> 1, 41) > 0.97 ? C.aceraS : C.acera; }
    if (y < 28) return y === 24 ? C.bordilloL : C.bordillo;
    if (y === 34 && (x % 32) < 14) return C.raya;
    return BAYER[y & 3][x & 3] < 2 ? C.asfaltoL : C.asfalto;
  });
}
function propCiudad(tipo, v, T) {
  const hierro = pal(T('#3a4258'), T('#232838'), T('#5b6680'), '#10131f');
  let s;
  if (tipo === 'farolaCiudad') { s = hazProp(16, 40, 4, 39, p => { p.parte(F.re(-1, -32, 2, 32), hierro, { sombra: 0 }); p.parte(F.tr(0, -32, 7, -35, 0.9), hierro, { sombra: 0 }); p.parte(F.rr(5, -36, 6, 3, 1), hierro, { sombra: 0 }); p.plano(F.re(6, -33.5, 4, 1.4), FONDO.L.noche ? '#fff3a0' : T('#c8f0ff')); }); s.luz = [8, -31]; }
  if (tipo === 'papelera') { s = hazProp(12, 14, 6, 13, p => { p.parte(F.rr(-4, -11, 8, 11, 1), pal(T('#2f8a5a'), T('#1d5a40'), T('#5cc27a'), '#0a2a1a'), { sombra: 1 }); p.parte(F.rr(-4.6, -12, 9.2, 2, 1), hierro, { sombra: 0 }); }); s.bajo = true; }
  if (tipo === 'boca') { s = hazProp(10, 14, 5, 13, p => { p.parte(F.un(F.rr(-3, -10, 6, 10, 1.5), F.re(-4.5, -7, 9, 2)), PAL_P.rojo, { sombra: 1 }); p.parte(F.ov(0, -10.5, 2.4, 1.4), PAL_P.rojo, { sombra: 0 }); }); s.bajo = true; }
  if (tipo === 'maceta') { s = hazProp(20, 20, 10, 19, p => { p.parte(F.rr(-6, -7, 12, 7, 1), pal(T('#a8a8bc'), T('#7a7a90'), T('#c8c8d8'), '#3a3a4e'), { sombra: 1 }); p.parte(F.un(F.ov(0, -12, 6, 5), F.ov(-4, -9, 3.6, 3), F.ov(4, -9, 3.6, 3)), pal(T('#4cb04a'), T('#2e7a3a'), T('#8fe060'), '#1d4a26'), { sombra: 2 }); }); s.bajo = true; }
  if (tipo === 'banco') s = hazProp(26, 14, 13, 13, p => { p.parte(F.un(F.re(-11, -6, 22, 2), F.re(-11, -11, 22, 2)), pal(T('#c8874a'), T('#8f5428'), T('#e8b07a'), '#4a2a14'), { sombra: 0 }); for (const x of [-9, 8]) p.parte(F.re(x, -6, 1.6, 6), hierro, { sombra: 0 }); });
  if (tipo === 'cono') { s = hazProp(10, 12, 5, 11, p => { p.parte(F.pol(-3.5, 0, 3.5, 0, 0.6, -9, -0.6, -9), pal('#ff8a1f', '#c45a12', '#ffcb3d', '#4a1a06'), { sombra: 1 }); p.plano(F.re(-2, -5, 4, 1.4), '#fff6ea'); }); s.bajo = true; }
  if (tipo === 'pantalla') {
    const [l1, l2] = ANUNCIOS[v % ANUNCIOS.length].map(tr), ancho = Math.max(anchoTexto(l1), anchoTexto(l2)) + 10, w = ancho + 8;
    s = hazProp(w, 44, Math.floor(w / 2), 43, p => {
      p.parte(F.re(-1, -16, 2, 16), hierro, { sombra: 0 });
      p.parte(F.re(-ancho / 2, -38, ancho, 23), hierro, { sombra: 1 });
      p.plano(F.re(-ancho / 2 + 2, -36, ancho - 4, 19), '#14102a');
      letreroRecto(p, l1, 0, -33, '#7cf0ff'); letreroRecto(p, l2, 0, -25, '#ff7ad8');
    });
  }
  return s;
}
ESTILO.ciudad = {
  luces: LUZ_CIUDAD, grande: 'pantalla', sombra: ['#7a7a90', '#5a5a70'],
  tipos: [['farolaCiudad', 16], ['papelera', 14], ['boca', 10], ['maceta', 14], ['banco', 12], ['cono', 8], ['pantalla', 14]],
  capas(f) {
    f.montes = edificios(256, 48, f, 0.45, 3, false);
    f.colinas = edificios(384, 64, f, 0.12, 4, true);
    f.hito = torreGrande(f.fase, f.ti, f.hz); f.suelo = sueloCiudad(f.ti);
    f.nubes = f.L.noche ? null : [0, 1, 2].map(i => nubeDe(i, f.L, f.ti));
  },
  prop: propCiudad,
  hito(ctx, mx, t, W) {
    const T = FONDO.hito, tx = Math.round(W * 0.66 - T.width / 2 - mx * 0.01), ty = SUELO - 30 - T.height;
    if (FONDO.fase === 5) focos(ctx, tx + T.punta[0], ty + 14, t, W);
    ctx.drawImage(T, tx, ty);
    if (Math.sin(t * 4) > 0) { ctx.fillStyle = '#ff3348'; ctx.fillRect(tx + T.punta[0] - 1, ty, 3, 2); }
  },
  // un coche pasa de vez en cuando por la carretera
  ambiente(ctx, mx, t, W) {
    const ciclo = 7, k = (t % ciclo) / ciclo; if (k > 0.35) return;
    const x = Math.round(W + 20 - k / 0.35 * (W + 60)), y = ESC.Y + ESC.H - 9, col = ['#e63946', '#2e8bff', '#ffcb3d'][Math.floor(t / ciclo) % 3];
    ctx.fillStyle = OL; ctx.fillRect(x - 1, y - 5, 24, 7); ctx.fillRect(x + 4, y - 9, 13, 5);
    ctx.fillStyle = col; ctx.fillRect(x, y - 4, 22, 4); ctx.fillRect(x + 5, y - 8, 11, 4);
    ctx.fillStyle = '#c8f0ff'; ctx.fillRect(x + 6, y - 7, 4, 2); ctx.fillRect(x + 11, y - 7, 4, 2);
    ctx.fillStyle = '#fff3a0'; ctx.fillRect(x, y - 3, 1, 1);
    ctx.fillStyle = OL; for (const rx of [4, 17]) { ctx.fillRect(x + rx - 2, y, 5, 3); }
  },
};
