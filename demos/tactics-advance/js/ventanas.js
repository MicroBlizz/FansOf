// Fans of Tactics Advance (prototipo) · VENTANAS: marcos azules con bisel claro, barras de VIDA y CAOS, la manita, la flecha del turno,
// la ficha con retrato, los menús, el bocadillo y la tarjeta de la norma del día. Todo píxel a píxel a 240 × 160.
'use strict';

const VENT = { borde: '#0c1030', luz: '#f2f5ff', bisel: '#8fa6e6', brillo: '#9ab4f4', fondo: ['#5c84e2', '#4c72d4', '#3e60c2', '#324eac', '#283f96', '#1f3280'] };
const VENT_CACHE = new Map();
function ventanaLienzo(w, h, tono) {
  const k = w + 'x' + h + tono;
  if (VENT_CACHE.has(k)) return VENT_CACHE.get(k);
  const c = lienzoNuevo(w, h), g = c.getContext('2d');
  const F2 = tono === 'crema' ? ['#fff8ee', '#fff4e6', '#fdefdd', '#fbead6', '#f8e4ce', '#f5dfc6'] : tono === 'rojo' ? ['#e05c6a', '#d04a5c', '#bc3c50', '#a63046', '#90263c', '#7a1e32'] : tono === 'oscuro' ? ['#3a4466', '#323b5a', '#2a324e', '#232a44', '#1c223a', '#161b30'] : VENT.fondo;
  g.fillStyle = VENT.borde; g.fillRect(2, 0, w - 4, h); g.fillRect(0, 2, w, h - 4); g.fillRect(1, 1, w - 2, h - 2);
  g.fillStyle = VENT.luz; g.fillRect(2, 1, w - 4, h - 2); g.fillRect(1, 2, w - 2, h - 4);
  g.fillStyle = tono === 'crema' ? '#d8bfa0' : tono === 'rojo' ? '#f0a0a8' : VENT.bisel; g.fillRect(2, 2, w - 4, h - 4);
  for (let j = 3; j < h - 3; j++) for (let i = 3; i < w - 3; i++) {
    g.fillStyle = degradado(null, w, i, j, F2, (j - 3) / Math.max(1, h - 7)); g.fillRect(i, j, 1, 1);
  }
  g.fillStyle = tono === 'crema' ? '#ffffff' : tono === 'rojo' ? '#f4a0aa' : VENT.brillo; g.fillRect(3, 3, w - 6, 1);
  VENT_CACHE.set(k, c);
  return c;
}
function ventana(ctx, x, y, w, h, tono = 'azul') { ctx.drawImage(ventanaLienzo(w, h, tono), Math.round(x), Math.round(y)); }

// barra con borde oscuro, fondo y brillo arriba
function barra(ctx, x, y, w, frac, tipo) {
  const C = tipo === 'caos' ? ['#c46cff', '#ecc4ff', '#8a3ad8'] : frac > 0.5 ? ['#5cd65c', '#c8f8a8', '#2f9a3a'] : frac > 0.25 ? ['#f0c03a', '#fff0a0', '#c08a1a'] : ['#f0505a', '#ffb0b0', '#b0283a'];
  ctx.fillStyle = '#0c1030'; ctx.fillRect(x, y, w, 5);
  ctx.fillStyle = '#20264a'; ctx.fillRect(x + 1, y + 1, w - 2, 3);
  const n = Math.max(0, Math.round((w - 2) * frac));
  ctx.fillStyle = C[0]; ctx.fillRect(x + 1, y + 1, n, 3);
  ctx.fillStyle = C[1]; ctx.fillRect(x + 1, y + 1, n, 1);
  ctx.fillStyle = C[2]; ctx.fillRect(x + 1, y + 3, n, 1);
}

// la manita que señala (hecha a mano) y la flecha que bota sobre quien tiene el turno
const MANO = hazSello(['..kkkk....', '.kwwwwkkkk', 'kwwwwwwwwk', 'kwwwwwkkkk', 'kwwwwlk...', 'kwllwlk...', '.kllllk...', '..kkkk....'], { k: '#1c1028', w: '#ffffff', l: '#b8bede' });
const FLECHA = hazSello(['kkkkkkkkk', 'kyyyyyyyk', 'kYyyyyyYk', '.kYyyyYk.', '..kYyYk..', '...kYk...', '....k....'], { k: '#1c1028', y: '#fff27a', Y: '#e8a81e' });
const CARTA = hazSello(['kkkkkkkk.', 'kppppppk.', 'kpkkkkpk.', 'kppppppk.', 'kpkkkppk.', 'kppppppkk', 'kpprrppkr', 'kprRRrpkr', 'kpprrppk.', 'kkkkkkkk.'], { k: '#3a2418', p: '#fff4d8', r: '#e0303c', R: '#ff8a8a' });
const PATA = hazSello(['.k.k.', 'kpkpk', '.k.k.', '.kkk.', 'kpppk', 'kpppk', '.kkk.'], { k: '#7a2a4a', p: '#ffb3cf' });
function hazSello(filas, col) {
  const c = lienzoNuevo(filas[0].length, filas.length), g = c.getContext('2d');
  filas.forEach((f, j) => { for (let i = 0; i < f.length; i++) { const k = col[f[i]]; if (k) { g.fillStyle = k; g.fillRect(i, j, 1, 1); } } });
  return c;
}

// la ficha de un personaje: retrato, nombre, clase, nivel, VIDA y CAOS
function ficha(ctx, x, y, d) {
  ventana(ctx, x, y, 120, 50);
  ctx.fillStyle = '#0c1030'; ctx.fillRect(x + 5, y + 5, 42, 40);
  for (let j = 0; j < 38; j++) { ctx.fillStyle = degradado(null, 0, 0, j, ['#ffe2b0', '#f8b890', '#d88aa0', '#9a6aa8'], j / 37); ctx.fillRect(x + 6, y + 6 + j, 40, 1); }
  for (let j = 0; j < 38; j++) for (let i = 0; i < 40; i++) if (((i + j) & 3) === 0 && j > 24) { ctx.fillStyle = '#b07ab0'; ctx.fillRect(x + 6 + i, y + 6 + j, 1, 1); }
  ctx.save(); ctx.beginPath(); ctx.rect(x + 6, y + 6, 40, 38); ctx.clip();
  ctx.drawImage(d.retrato, x + 4, y + 5);
  ctx.restore();
  ctx.drawImage(PATA, x + 51, y + 6);
  escribe(ctx, d.nombre, x + 58, y + 5);
  escribeMini(ctx, d.clase, x + 51, y + 16, '#b8cdf8');
  const nv = tr('NV') + d.nivel, wn = anchoMini(nv) + 4;
  ctx.fillStyle = '#0c1030'; ctx.fillRect(x + 6, y + 36, wn + 2, 9);
  ctx.fillStyle = '#2a3a8a'; ctx.fillRect(x + 7, y + 37, wn, 7);
  escribeMini(ctx, nv, x + 9, y + 38, '#ffe27a');
  escribeMini(ctx, tr('VIDA'), x + 51, y + 24, '#ffe27a');
  escribeMini(ctx, d.vida + '/' + d.vidaMax, x + 115, y + 24, '#ffffff', null, 'der');
  barra(ctx, x + 51, y + 30, 64, (d.vidaVista ?? d.vida) / d.vidaMax, 'vida');
  escribeMini(ctx, tr('CAOS'), x + 51, y + 37, '#ffe27a');
  escribeMini(ctx, d.caos + '/' + d.caosMax, x + 115, y + 37, '#ffffff', null, 'der');
  barra(ctx, x + 51, y + 43, 64, d.caos / d.caosMax, 'caos');
}
// la ficha pequeña (enemigos y los aliados sin retrato grande): x es el borde derecho, o d.izq el izquierdo; d.abajo la apoya abajo.
// Con d.caosMax lleva también CAOS y con d.extra una línea más (acierto y daño)
function fichaObjetivo(ctx, x, y, d) {
  const w = Math.max(100, 40 + anchoTexto(d.nombre)), h = 38 + (d.caosMax ? 8 : 0) + (d.extra ? 8 : 0);
  x = d.izq != null ? d.izq : x - w;
  if (d.abajo != null) y = d.abajo - h;
  ventana(ctx, x, y, w, h, d.tono || 'rojo');
  ctx.fillStyle = '#0c1030'; ctx.fillRect(x + 5, y + 5, 24, 28);
  ctx.fillStyle = d.tono === 'azul' ? '#2a3a6a' : '#3a2a4a'; ctx.fillRect(x + 6, y + 6, 22, 26);
  ctx.fillStyle = d.tono === 'azul' ? '#36508a' : '#4c3660'; ctx.fillRect(x + 6, y + 20, 22, 12);
  ctx.save(); ctx.beginPath(); ctx.rect(x + 6, y + 6, 22, 26); ctx.clip();
  ctx.drawImage(d.retrato.c, x + 17 - d.retrato.ox, y + 40 - d.retrato.oy);
  ctx.restore();
  escribe(ctx, d.nombre, x + 33, y + 5);
  escribeMini(ctx, d.clase, x + 33, y + 15, d.tono === 'azul' ? '#b8cdf8' : '#ffd0d6');
  escribeMini(ctx, tr('VIDA'), x + 33, y + 22, '#ffe27a');
  escribeMini(ctx, d.vida + '/' + d.vidaMax, x + w - 5, y + 22, '#ffffff', null, 'der');
  barra(ctx, x + 33, y + 28, w - 38, d.vidaVista / d.vidaMax, 'vida');
  let yy = y + 35;
  if (d.caosMax) {
    escribeMini(ctx, tr('CAOS'), x + 33, yy, '#ffe27a');
    escribeMini(ctx, d.caos + '/' + d.caosMax, x + w - 5, yy, '#ffffff', null, 'der');
    barra(ctx, x + 33, yy + 6, w - 38, d.caos / d.caosMax, 'caos'); yy += 8;
  }
  if (d.extra) escribeMini(ctx, d.extra, x + 6, yy + 2, '#ffffff', '#101438');
}
// menú de órdenes; activo = índice de la manita; apagado = se ve detrás de un submenú
function menu(ctx, x, y, items, activo, t, apagado) {
  const w = 12 + Math.max(...items.map(s => anchoTexto(s))) + 10, h = 8 + items.length * 11;
  ventana(ctx, x - w, y, w, h);
  items.forEach((s, i) => escribe(ctx, s, x - w + 15, y + 6 + i * 11, apagado && i !== activo ? '#8ea2dc' : i === activo || activo < 0 ? '#ffffff' : '#d8e2ff'));
  if (!apagado && activo >= 0) ctx.drawImage(MANO, x - w + 2 + (Math.floor(t * 4) % 2), y + 5 + activo * 11);
  return w;
}
function submenu(ctx, x, y, items, activo, t) {
  const nombres = Math.max(...items.map(([s]) => anchoTexto(s))), costes = Math.max(0, ...items.map(([, c]) => (c ? anchoMini(c) : 0)));
  const w = 15 + nombres + (costes ? 10 + costes : 0) + 8, h = 8 + items.length * 11;
  ventana(ctx, x - w, y, w, h);
  items.forEach(([s, coste], i) => {
    escribe(ctx, s, x - w + 15, y + 6 + i * 11, i === activo ? '#ffffff' : '#c4d2ff');
    if (coste) { escribeMini(ctx, coste, x - 6, y + 7 + i * 11, '#e8b8ff', '#101438', 'der'); }
  });
  ctx.drawImage(MANO, x - w + 2 + (Math.floor(t * 4) % 2), y + 5 + activo * 11);
}
// tarjeta de la norma del día
function norma(ctx, x, y, texto) {
  const rotulo = tr('Norma:'), w = 16 + anchoTexto(rotulo) + 4 + anchoTexto(texto) + 8;
  ventana(ctx, x, y, w, 17, 'oscuro');
  ctx.drawImage(CARTA, x + 4, y + 3);
  escribe(ctx, rotulo, x + 16, y + 5, '#ffe27a');
  escribe(ctx, texto, x + 16 + anchoTexto(rotulo) + 4, y + 5);
}
// bocadillo con piquito hacia (px, py)
function bocadillo(ctx, x, y, lineas, px, py) {
  const w = 12 + Math.max(...lineas.map(s => anchoTexto(s))), h = 8 + lineas.length * 10;
  const pico = Math.max(x + 8, Math.min(x + w - 10, px));
  ctx.fillStyle = '#0c1030';
  for (let k = 0; k < 6; k++) ctx.fillRect(pico - 3 + Math.floor(k / 2), y + h - 1 + k, 7 - k, 1);
  ctx.fillStyle = '#f2f5ff';
  for (let k = 0; k < 4; k++) ctx.fillRect(pico - 2 + Math.floor(k / 2), y + h - 2 + k, 5 - k, 1);
  ventana(ctx, x, y, w, h, 'oscuro');
  ctx.fillStyle = '#2a324e'; ctx.fillRect(pico - 1, y + h - 3, 3, 2);
  lineas.forEach((s, i) => escribe(ctx, s, x + 6, y + 5 + i * 10));
}
