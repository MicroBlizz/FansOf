// Fans of Island · ARTE DE LA ESCENA: lo que no es paisaje ni personaje, en píxel art con contorno negro: el suelo (acuarela por dentro,
// canto de hierba), los bloques de plastelina, las plataformas y muros de ganchillo (barreras, puertas), las manchas de pintura, los
// brotes y el vapor de los poderes, la bandera, el decorado (árboles, setas, tulipanes), las zanahorias y los botones. Cada cosa se
// dibuja una vez al tamaño que pide el nivel y se guarda en IS_CACHE.
'use strict';
const IS_CACHE = {};
function isCacheado(clave, pinta) { let s = IS_CACHE[clave]; if (!s) s = IS_CACHE[clave] = pinta(); return s; }
const IS_BLOQUE_MAT = { '#f0a8a0': 'bloque', '#f0d8a0': 'bloqueA', '#a8c8f0': 'bloqueZ' };
const IS_TIERRA = ['#c8641c', '#e8862c', '#f6b23c'];

/* ---------- plataformas ---------- */
// el suelo: tierra de acuarela con bolas blancas, el canto de arriba con hierba y una línea oscura; cae en sombra hacia abajo
function isDibujaSuelo(p) {
  const w = Math.round(p.w), h = Math.round(p.h), c = lienzoNuevo(w + 2, h + 5), g = c.getContext('2d'), T = 4;   // T: filas de arriba para la hierba
  lavado(g, F.rr(1, T, w, h, 2), IS_TIERRA, p.id * 7 + 3, { sangra: 0, escala: 9, luzArriba: 0.25, canto: 1.4 });
  for (let k = 0; k < w / 9; k++) { const x = 4 + hash(k + p.id * 31) * (w - 8), y = T + 7 + hash(k + 50 + p.id) * (h - 10); ovaloPx(g, x, y, 1 + Math.floor(hash(k + 90) * 2), 1, '#fff6dc'); }
  g.fillStyle = '#5a8a2c'; g.fillRect(1, T, w, 3); g.fillStyle = '#8fc46f'; g.fillRect(1, T, w, 2);
  for (let x = 0; x < w; x += 3) if (hash(x + p.id) < 0.5) { g.fillStyle = '#5a8a2c'; g.fillRect(1 + x, T + 1, 1, 1); }
  g.fillStyle = '#1a1410'; g.fillRect(0, T - 1, w + 2, 1); g.fillRect(0, T - 1, 1, h + 2); g.fillRect(w + 1, T - 1, 1, h + 2);
  for (let x = 2; x < w - 2; x += 4) if (hash(x * 3 + p.id) < 0.55) { const a = 1 + Math.floor(hash(x + 7) * 3); g.fillStyle = '#1a1410'; g.fillRect(x, T - 1 - a, 3, a + 1); g.fillStyle = '#6fb04a'; g.fillRect(x + 1, T - a, 1, a); }   // matas de hierba
  return { c, ox: 1, oy: T };
}
// un bloque de plastelina con cantos redondos y huellas de dedos
function isDibujaBloque(p) {
  const w = Math.round(p.w), h = Math.round(p.h), M = MAT[IS_BLOQUE_MAT[p.color] || 'bloque'], q = new Pincel(w + 2, h + 2, 1, 1);
  const id = q.parte(F.rr(0, 0, w, h, Math.min(4, w / 3, h / 3)), M, { r: 3.5, sombra: 0 });
  q.tono(F.rr(2, 1, w - 4, Math.min(3, h / 4), 1), 1, id);
  for (let k = 0; k < (w * h) / 220; k++) q.tono(F.ov(4 + hash(k + p.id) * (w - 8), 4 + hash(k + 40 + p.id) * (h - 8), 2.4, 1.7), -1, id);
  const s = contornoNegro(q.lienzo()); return { c: s.c, ox: 2, oy: 2 };
}
// una plataforma de ganchillo: punto en diagonal, dos tonos
function isDibujaHilo(p) {
  const w = Math.round(p.w), h = Math.round(p.h), q = new Pincel(w + 2, h + 2, 1, 1);
  const id = q.parte(F.rr(0, 0, w, h, 3), MAT.hilo, { r: 2, sombra: 0 });
  q.tono(F.rr(0, 0, w, h, 3), -1, id, (i, j) => ((i + j) % 6) < 2);
  q.tono(F.rr(0, 0, w, h, 3), 1, id, (i, j) => ((i + j) % 6) === 3);
  const s = contornoNegro(q.lienzo()); return { c: s.c, ox: 2, oy: 2 };
}
// un muro de hilo: barrera (roja, la quema el fuego) o puerta (morada, la desteje el botón), tejido en zigzag con un nudo arriba
function isDibujaMuro(p) {
  const w = Math.round(p.w), h = Math.round(p.h), M = p.t === 'puerta' ? MAT.hiloM : MAT.hiloR, q = new Pincel(w + 6, h + 6, 3, 3);
  const id = q.parte(F.rr(0, 0, w, h, 3), M, { r: 2.5, sombra: 0 });
  q.tono(F.rr(0, 0, w, h, 3), -1, id, (i, j) => ((i + j) % 5) === 0 || ((i - j) % 5) === 0);
  q.tono(F.rr(0, 0, w, h, 3), 1, id, (i, j) => ((i + j) % 5) === 2 && ((i - j) % 5) === 2);
  q.parte(F.ov(w / 2, 0, w / 2 + 2, 3), M, { r: 2.5, sombra: 1 });
  if (p.t === 'puerta') q.parte(F.rr(-3, h * 0.45, w + 6, 5, 2), MAT.oro, { r: 2, sombra: 1 });   // el cerrojo dorado de la puerta
  const s = contornoNegro(q.lienzo()); return { c: s.c, ox: 4, oy: 4 };
}
// una mancha de pintura azul (la disuelve el agua): acuarela con goterones
function isDibujaMancha(p) {
  const w = Math.round(p.w), h = Math.round(p.h), c = lienzoNuevo(w + 12, h + 10), g = c.getContext('2d');
  lavado(g, F.un(F.ov(6 + w / 2, 4 + h / 2, w / 2 + 3, h / 2 + 2), F.ov(6 + w / 2 - 3, 6, w / 2 + 1, 5)), ['#3a4aa8', '#6a8af0', '#a8c0ff'], p.id * 5 + 1, { sangra: 3, escala: 7, canto: 1.4 });
  for (const [dx, l] of [[0.3, 7], [0.7, 4]]) { const x = 6 + Math.round(w * dx); g.fillStyle = '#4a60c0'; g.fillRect(x, h + 2, 2, l); g.fillStyle = '#6a8af0'; g.fillRect(x, h + 2 + l, 2, 2); }
  return { c, ox: 6, oy: 4 };
}
function isPintaPlataforma(c, p, camX, t) {
  const x = Math.round(p.x - camX), y = Math.round(p.y);
  if (p.t === 'brote') return isPintaBrote(c, p, camX, t);
  if (p.t === 'vapor') return isPintaVapor(c, p, camX, t);
  const clave = `${p.t}-${p.id}-${Math.round(p.w)}x${Math.round(p.h)}-${p.color || ''}`;
  const s = isCacheado(clave, () => (p.t === 'suelo' ? isDibujaSuelo(p) : p.t === 'bloque' ? isDibujaBloque(p) : p.t === 'hilo' ? isDibujaHilo(p) : p.t === 'mancha' ? isDibujaMancha(p) : isDibujaMuro(p)));
  if (p.quemando) {   // se quema, se desteje o se disuelve: se va borrando de arriba abajo con chispas o gotas
    const k = p.quemando / (p.t === 'mancha' ? IS_PODER_C.agua.disuelve : p.t === 'puerta' ? IS_PODER_C.fuego.quema * 2 : IS_PODER_C.fuego.quema), hq = Math.round(p.h * k);
    c.save(); c.beginPath(); c.rect(x - 4, y + p.h - hq - 2, p.w + 8, hq + 6); c.clip(); c.drawImage(s.c, x - s.ox, y - s.oy); c.restore();
    for (let i = 0; i < 6; i++) { const u = hash(i + Math.floor(t * 12)), fx = x + Math.round(u * p.w), fy = y + p.h - hq - 2 - Math.round(hash(i + 9 + Math.floor(t * 12)) * 8); c.fillStyle = p.t === 'mancha' ? '#9fd4ff' : p.t === 'puerta' ? MAT.hiloM.c[4] : i % 2 ? '#ffb13b' : '#ff6a2a'; c.fillRect(fx, fy, 2, 2); }
    return;
  }
  c.drawImage(s.c, x - s.ox, y - s.oy);
}
// el brote: un tallo que sube desde el suelo con hojas y la plataforma de hoja arriba; regado, echa flores y es más ancho
function isPintaBrote(c, p, camX, t) {
  const x = Math.round(p.x - camX), y = Math.round(p.y), alto = Math.round(p.y0 + p.h - p.y), cx = x + Math.round(p.w / 2);
  c.fillStyle = '#1a1410'; c.fillRect(cx - 3, y + 2, 6, alto); c.fillStyle = MAT.hoja.c[2]; c.fillRect(cx - 2, y + 2, 4, alto); c.fillStyle = MAT.hoja.c[4]; c.fillRect(cx - 1, y + 2, 1, alto);
  for (let k = 10; k < alto - 4; k += 11) { const lado = (k / 11) % 2 ? 1 : -1, ly = y + k; c.fillStyle = '#1a1410'; c.fillRect(cx + (lado > 0 ? 2 : -8), ly - 1, 7, 5); c.fillStyle = MAT.hoja.c[3]; c.fillRect(cx + (lado > 0 ? 3 : -7), ly, 5, 3); }
  const s = isCacheado(`brote-${Math.round(p.w)}-${p.regado !== undefined ? 'r' : ''}`, () => {
    const w = Math.round(p.w), q = new Pincel(w + 4, 16, 2, 14);
    q.parte(F.un(F.ov(w / 2, -6, w / 2, 6), F.ov(w * 0.25, -7, w * 0.22, 5), F.ov(w * 0.75, -7, w * 0.22, 5)), MAT.hoja, { r: 3, sombra: 0 });
    q.raya(w * 0.2, -6, w * 0.8, -6, null, -1);
    if (p.regado !== undefined) for (const u of [0.2, 0.5, 0.8]) { q.parte(F.ov(w * u, -11, 3, 3), MAT.tulipanR, { r: 2.5, sombra: 0 }); q.pxm(w * u, -11, MAT.oro, 5); }
    const ss = contornoNegro(q.lienzo()); return { c: ss.c, ox: 3, oy: 15 };
  });
  c.drawImage(s.c, x - s.ox, y - s.oy + 2);
}
// la nube de vapor del combo fuego + agua
function isPintaVapor(c, p, camX, t) {
  const x = Math.round(p.x - camX), y = Math.round(p.y), k = Math.floor(t * 4) % 2;
  for (const [u, r] of [[0.2, 7], [0.5, 9], [0.8, 7]]) { const cx = x + Math.round(p.w * u), cy = y + 6 + (k ? 1 : 0); circuloPx(c, cx, cy, r + 1, '#9fb8d0'); circuloPx(c, cx, cy, r, '#ffffff'); }
  c.fillStyle = '#dff3ff'; c.fillRect(x + 4, y + 4, p.w - 8, 2);
}

/* ---------- la bandera de meta ---------- */
function isPintaMeta(c, m, camX, t) {
  const x = Math.round(m.x - camX), y = Math.round(m.bandera), h = m.h - m.bandera, k = Math.floor(t * 4) % 2;
  const s = isCacheado('meta-' + k, () => {
    const q = new Pincel(40, h + 4, 4, h + 2);
    q.parte(F.rr(-1.5, -h, 3, h, 1), MAT.madera, { r: 1.2, sombra: 0 });
    q.parte(F.ov(0, -h, 3, 3), MAT.oro, { r: 2.5, sombra: 0 });
    const ond = k ? 2 : -2;
    q.parte(F.pol(2, -h + 4, 28, -h + 10 + ond, 24, -h + 18, 30, -h + 26 + ond, 2, -h + 30), MAT.bandera, { r: 2.5, sombra: 0 });
    q.parte(F.tr(14, -h + 20, 14, -h + 12, 3, 1.5), MAT.zDorada, { r: 1.5, sombra: 0 }); q.parte(F.tr(13, -h + 11, 11, -h + 8, 1, 0.5), MAT.hoja, { r: 1, sombra: 0 });
    const ss = contornoNegro(q.lienzo()); return { c: ss.c, ox: 5, oy: h + 3 };
  });
  c.drawImage(s.c, x - s.ox + 2, y + h - s.oy);
}

/* ---------- el decorado: árboles, setas y tulipanes (d.s = escala) ---------- */
function isDibujaDecor(d) {
  const s = d.s || 1, q = new Pincel(Math.round(70 * s) + 4, Math.round(80 * s) + 4, Math.round(35 * s) + 2, Math.round(80 * s) + 2, { sx: s, sy: s });
  if (d.t === 'arbol') {
    q.parte(F.tr(0, -2, 0, -36, 5, 3.6), MAT.madera, { r: 3, sombra: 0 }); q.raya(-1, -10, -1, -26, null, -1);
    const copa = F.fun(5, F.ov(0, -52, 22, 18), F.ov(-14, -44, 13, 11), F.ov(15, -46, 12, 10), F.ov(2, -66, 12, 9));
    const id = q.parte(copa, MAT.hoja, { r: 6, sombra: 1 });
    q.tono(F.ov(-6, -60, 12, 7), 1, id); q.tono(F.ov(6, -40, 16, 7), -1, id);
    for (const [fx, fy] of [[-12, -50], [8, -58], [16, -42], [-2, -46]]) { q.pxm(fx, fy, MAT.tulipanR, 4); q.pxm(fx + 1, fy, MAT.tulipanR, 3); }
  } else if (d.t === 'seta') {
    q.parte(F.rr(-5, -14, 10, 13, 3), MAT.crema, { r: 2.5, sombra: 0 });
    const id = q.parte(F.un(F.ov(0, -16, 15, 7), F.ov(0, -19, 11, 7)), MAT.seta, { r: 4, sombra: 1 });
    for (const [fx, fy] of [[-7, -17], [4, -21], [8, -15]]) { q.plano(F.ov(fx, fy, 2.2, 1.6), '#ffffff'); }
    q.tono(F.ov(0, -12, 15, 3), -1, id);
  } else if (d.t === 'flor') {
    const M = d.color === 'rosa' ? MAT.tulipanR : MAT.tulipan;
    q.parte(F.tr(0, -2, 0, -12, 1), MAT.hoja, { r: 1, sombra: 0 }); q.parte(F.tr(0, -7, -4, -10, 1, 0.5), MAT.hoja, { r: 1, sombra: 0 });
    q.parte(F.pol(-5.5, -11, -7, -21, -3, -16.5, 0, -22, 3, -16.5, 7, -21, 5.5, -11), M, { r: 3, sombra: 1 });
    q.tono(F.pol(-5.5, -11, 5.5, -11, 4, -14.5, -4, -14.5), -1);
  }
  const ss = contornoNegro(q.lienzo()); return { c: ss.c, ox: ss.ox, oy: ss.oy };
}
function isPintaDecor(c, d, camX, t) {
  const s = isCacheado(`decor-${d.t}-${d.s || 1}-${d.color || ''}`, () => isDibujaDecor(d));
  c.drawImage(s.c, Math.round(d.x - camX) - s.ox, Math.round(d.y) - s.oy);
}

/* ---------- las zanahorias: las de poder (cada una de su color) y las pequeñas ---------- */
function isDibujaZanahoria(M, grande) {
  const q = grande ? new Pincel(16, 22, 8, 21) : new Pincel(10, 13, 5, 12);
  if (grande) {
    q.parte(F.tr(0, -4, 0, -12, 2.8, 1.2), M, { r: 2.4, sombra: 1 });
    q.raya(-1.6, -9, 0.4, -9, null, -1); q.raya(-0.6, -6.4, 1.2, -6.4, null, -1); q.pxm(-1.2, -11, M, 5);
    q.parte(F.tr(-0.4, -12.4, -3, -17, 1.2, 0.6), MAT.hoja, { r: 1, sombra: 0 }); q.parte(F.tr(0.6, -12.4, 3.2, -17.2, 1.2, 0.6), MAT.hoja, { r: 1, sombra: 0 }); q.parte(F.tr(0, -12.4, 0.4, -18, 1.1, 0.6), MAT.hoja, { r: 1, sombra: 0 });
  } else {
    q.parte(F.tr(0, -2.4, 0, -7, 1.9, 0.9), M, { r: 1.5, sombra: 0 }); q.pxm(-0.8, -6, M, 5);
    q.parte(F.tr(-0.2, -7.4, -1.8, -10, 1, 0.5), MAT.hoja, { r: 1, sombra: 0 }); q.parte(F.tr(0.4, -7.4, 2, -10, 1, 0.5), MAT.hoja, { r: 1, sombra: 0 });
  }
  return contornoNegro(q.lienzo());
}
function isPintaZanahoria(c, z, camX, t) {
  const M = MAT['z' + z.t[0].toUpperCase() + z.t.slice(1)] || MAT.capa, s = isCacheado('zana-' + z.t, () => isDibujaZanahoria(M, true));
  pintaSpr(c, s, Math.round(z.x - camX + z.w / 2), Math.round(z.y + z.h + Math.sin(t * 3 + z.fase) * 2));
}
function isPintaPequena(c, z, camX, t) {
  const s = isCacheado('zana-peq', () => isDibujaZanahoria(MAT.capa, false));
  pintaSpr(c, s, Math.round(z.x - camX + z.w / 2), Math.round(z.y + z.h + Math.sin(t * 4 + z.fase) * 1.5));
}

/* ---------- el botón que desteje una puerta ---------- */
function isPintaInterruptor(c, b, camX, t) {
  const s = isCacheado('boton-' + (b.pulsado ? 'ok' : 'no'), () => {
    const q = new Pincel(b.w + 10, b.h + 10, 5, b.h + 8), hund = b.pulsado ? 4 : 0;
    q.parte(F.rr(-2, -4, b.w + 4, 4, 1.5), MAT.madera, { r: 1.5, sombra: 0 });
    q.parte(F.rr(0, -b.h - 4 + hund, b.w, b.h, 3), b.pulsado ? MAT.botonOk : MAT.boton, { r: 3, sombra: 1 });
    q.tono(F.rr(3, -b.h - 3 + hund, b.w - 6, 2, 1), 1);
    const ss = contornoNegro(q.lienzo()); return { c: ss.c, ox: ss.ox, oy: ss.oy };
  });
  c.drawImage(s.c, Math.round(b.x - camX) - s.ox, Math.round(b.y + b.h) - s.oy);
}
