// Fans of Panic · Galería: las ilustraciones destapadas, mundo a mundo. Con 3 estrellas se ven a pantalla completa (marco dorado);
// con menos, pequeñas; las que faltan salen tapadas con su panel. Al tocar una abierta se ve en grande.
'use strict';

const GAL = { mundo: 0, grande: null, lienzo: null };

function pintaGaleria(W, H) {
  if (GAL.grande) { pintaGrande(W, H); return; }
  const m = ORDEN_MUNDOS[GAL.mundo], M = MUNDOS[m], t = JUEGO.t;
  G.fillStyle = M.fondo; G.fillRect(0, 0, W, H);
  botonUI('<', 8, 12, 40, 40, () => alMenu('menu'), COL.panel, COL.blanco, 18); UI.atras = () => alMenu('menu');
  letra(tr('GALERÍA'), W / 2, 32, 24, COL.oro);
  if (GAL.mundo > 0) botonUI('<', 14, 70, 36, 44, () => { GAL.mundo--; }, COL.panel, COL.blanco, 20);
  if (GAL.mundo < ORDEN_MUNDOS.length - 1) botonUI('>', W - 50, 70, 36, 44, () => { GAL.mundo++; }, COL.panel, COL.blanco, 20);
  letra(tr(M.nombre), W / 2, 84, 24, M.claro); letra(M.chica, W / 2, 106, 13, COL.blanco);
  const w = 96, h = 128;
  M.niveles.forEach((nv, i) => {
    const n = i + 1, x = 24 + (i % 3) * 108, y = 140 + Math.floor(i / 3) * 160, g = SAVE.galeria[idNivel(m, n)] || 0;
    caja(x - 3, y - 3, w + 6, h + 6, 6, g === 2 ? COL.oro : COL.tinta, COL.tinta, 2);
    if (g) { pintaMini(m, n, x, y, w, h); zonaUI(x, y, w, h, () => abreGrande(m, n)); }
    else pintaPanel(x, y, w, h, t);
    letra(nv.final ? tr('JEFE') : String(n), x + w / 2, y + h + 14, 12, COL.blanco);
  });
  const abiertas = Object.keys(SAVE.galeria).length, total = ORDEN_MUNDOS.length * 5;
  letra(tr('{a} de {b} destapadas', { a: abiertas, b: total }), W / 2, H - 30, 13, COL.gris);
}

// una miniatura: la imagen de Yoshi si hay, si no el cartel provisional
function pintaMini(m, n, x, y, w, h) {
  const im = imagenNivel(m, n);
  if (im) { const esc = Math.max(w / im.width, h / im.height), iw = im.width * esc, ih = im.height * esc; G.save(); G.beginPath(); G.rect(x, y, w, h); G.clip(); G.drawImage(im, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih); G.restore(); return; }
  G.save(); G.translate(x, y); pintaCartelProvisional(G, MUNDOS[m], n, w, h); G.restore();
}

function abreGrande(m, n) { GAL.grande = { m, n }; }

function pintaGrande(W, H) {
  const { m, n } = GAL.grande, M = MUNDOS[m];
  G.fillStyle = COL.tinta; G.fillRect(0, 0, W, H);
  const w = W - 40, h = Math.min(H - 120, w * 4 / 3);
  pintaMini(m, n, 20, 60, w, h);
  letra(`${M.chica} · ${tr(M.nombre)} ${n}`, W / 2, 34, 16, COL.blanco);
  const cierra = () => { GAL.grande = null; };
  botonUI(tr('CERRAR'), W / 2 - 80, H - 50, 160, 38, cierra, COL.rosa, COL.tinta, 15); UI.atras = cierra; UI.enter = cierra;
}
