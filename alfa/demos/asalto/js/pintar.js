// Fans of Asalto · PINTAR: la pantalla de juego en el lienzo de 540x960, todo en pixel art y sin suavizar. Arriba el marcador (piso,
// oro, gemas, corazones) y las clases del equipo; en medio la arena con la cuadrícula de los héroes; abajo la tienda, la batalla o el
// mapa de la mazmorra. Cada botón se apunta en AS_BOTONES al pintarlo, para saber qué se ha tocado.
'use strict';
const AS_V = { H: 960, sc: 1, dpr: 1 };
// Dos letras de píxeles hechas para tamaños pequeños: Tiny5 (10 píxeles) para lo pequeño y Jersey 10 (16 píxeles) para títulos y botones.
// Siempre a su tamaño natural, así cada trazo cae en un píxel entero.
const AS_FUENTE = '"Jersey 10", "Courier New", monospace', AS_FUENTE_PEQ = 'Tiny5, "Courier New", monospace';
function asFuenteDe(tam) { return tam <= 18 ? `10px ${AS_FUENTE_PEQ}` : tam <= 34 ? `16px ${AS_FUENTE}` : `32px ${AS_FUENTE}`; }
let AS_BOTONES = [];
const AS_COL = { tinta: '#20102c', panel: '#8f9be8', panel2: '#6c78d0', claro: '#c9d0ff', oscuro: '#3b3f8a', fondo: '#2b2d6b', rojo: '#e8433a', verde: '#5fb83a', naranja: '#f08a2a', oro: '#ffd23a' };
const AS_TIER = { 1: '#b8c0d8', 2: '#5fb0ff', 3: '#c46bff' };

// TEXTO DE PÍXELES: cada texto se dibuja una vez a su tamaño real (en píxeles del lienzo pequeño), se le quitan los grises del
// suavizado (o color o nada) y se le pone el contorno oscuro de 1 píxel; después se guarda y se pega tal cual. Así las letras son
// tan nítidas como los dibujos.
const AS_TXT = new Map(), AS_RGB = new Map();
function asRGB(col) {
  let v = AS_RGB.get(col); if (v) return v;
  const g = document.createElement('canvas').getContext('2d'); g.canvas.width = g.canvas.height = 1; g.fillStyle = col; g.fillRect(0, 0, 1, 1);
  v = g.getImageData(0, 0, 1, 1).data; AS_RGB.set(col, v); return v;
}
function asTextoImg(txt, tam, col, borde) {
  const clave = txt + '|' + tam + '|' + col + '|' + borde;
  let e = AS_TXT.get(clave); if (e) return e;
  if (AS_TXT.size > 700) AS_TXT.clear();
  const fuente = asFuenteDe(tam), px = parseInt(fuente, 10), b = borde ? (px >= 30 ? 2 : 1) : 0, pad = b + 1;
  const cv = document.createElement('canvas'), g = cv.getContext('2d');
  g.font = fuente; g.textRendering = 'optimizeSpeed';
  const w = Math.ceil(g.measureText(txt).width) + pad * 2, h = Math.ceil(px * 1.3) + pad * 2;
  cv.width = Math.max(1, w); cv.height = h;
  g.font = fuente; g.textRendering = 'optimizeSpeed'; g.textBaseline = 'middle'; g.fillStyle = '#000';
  g.fillText(txt, pad, Math.round(h / 2));
  const d = g.getImageData(0, 0, cv.width, h), a = d.data, W = cv.width, m = new Uint8Array(W * h);
  for (let i = 0; i < W * h; i++) m[i] = a[i * 4 + 3] >= 100 ? 1 : 0;
  const c1 = asRGB(col), c2 = asRGB(AS_COL.tinta);
  for (let y = 0; y < h; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x, o = i * 4;
    let rgb = null;
    if (m[i]) rgb = c1;
    else if (b) {
      for (let dy = -b; dy <= b && !rgb; dy++) for (let dx = -b; dx <= b; dx++) {
        const xx = x + dx, yy = y + dy;
        if (xx >= 0 && yy >= 0 && xx < W && yy < h && m[yy * W + xx]) { rgb = c2; break; }
      }
    }
    if (rgb) { a[o] = rgb[0]; a[o + 1] = rgb[1]; a[o + 2] = rgb[2]; a[o + 3] = 255; } else a[o + 3] = 0;
  }
  g.putImageData(d, 0, 0);
  e = { cv, w: W, h, pad }; AS_TXT.set(clave, e); return e;
}
function asTexto(c, txt, x, y, tam, col, al, sinBorde) {
  const e = asTextoImg(String(txt), tam, col || '#fff', !sinBorde), W = e.w * 2, H = e.h * 2;
  al = al || 'center';
  let x0 = al === 'center' ? x - W / 2 : al === 'right' ? x - W + e.pad * 2 : x - e.pad * 2;
  const y0 = y - H / 2;
  c.imageSmoothingEnabled = false;
  c.drawImage(e.cv, Math.round(x0 / 2) * 2, Math.round(y0 / 2) * 2, W, H);
}
// Una línea gruesa hecha de cuadrados de píxeles (los pasillos del mapa y las flechas): sin bordes suavizados.
function asLineaPix(c, x1, y1, x2, y2, grosor, col) {
  c.fillStyle = col;
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) / 2));
  for (let i = 0; i <= n; i++) { const x = x1 + (x2 - x1) * i / n, y = y1 + (y2 - y1) * i / n; c.fillRect(x - grosor / 2, y - grosor / 2, grosor, grosor); }
}
// Una elipse de píxeles, rellena o solo el borde (grosor), por filas.
function asElipsePix(c, cx, cy, rx, ry, col, grosor) {
  if (rx < 2 || ry < 2) return;
  c.fillStyle = col;
  for (let dy = -ry; dy <= ry; dy += 2) {
    const hw = rx * Math.sqrt(Math.max(0, 1 - (dy / ry) * (dy / ry)));
    if (!grosor) { c.fillRect(cx - hw, cy + dy, hw * 2, 2); continue; }
    const ri = Math.max(0, ry - grosor), xi = rx - grosor, hi = Math.abs(dy) < ri ? xi * Math.sqrt(Math.max(0, 1 - (dy / ri) * (dy / ri))) : 0;
    c.fillRect(cx - hw, cy + dy, hw - hi, 2); c.fillRect(cx + hi, cy + dy, hw - hi, 2);
  }
}
// un panel de pixel art: borde oscuro de 3, luz arriba y sombra abajo
function asPanel(c, x, y, w, h, col, luz) {
  const p = v => Math.round(v / 2) * 2;   // todo en píxeles enteros del lienzo pequeño (2 unidades = 1 píxel)
  x = p(x); y = p(y); w = p(w); h = p(h);
  c.fillStyle = AS_COL.tinta; c.fillRect(x, y + 2, w, h - 4); c.fillRect(x + 2, y, w - 4, h);
  c.fillStyle = col || AS_COL.panel; c.fillRect(x + 2, y + 2, w - 4, h - 4);
  c.fillStyle = luz || 'rgba(255,255,255,0.35)'; c.fillRect(x + 2, y + 2, w - 4, 2);
  c.fillStyle = 'rgba(0,0,0,0.22)'; c.fillRect(x + 2, y + h - 4, w - 4, 2);
}
function asBoton(c, id, x, y, w, h, col, txt, tam, apagado, extra) {
  const pulsado = AS_TOQUE.boton === id;
  asPanel(c, x, y + (pulsado ? 3 : 0), w, h - (pulsado ? 3 : 0), apagado ? '#7a7f99' : col);
  if (!pulsado) { c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(x + 3, y + h, w - 6, 3); }
  if (txt) asTexto(c, txt, x + w / 2 + (extra ? 14 : 0), y + h / 2 + (pulsado ? 2 : 0), tam || 22, apagado ? '#d8d8e0' : '#fff');
  if (extra) extra(x, y + (pulsado ? 3 : 0));
  AS_BOTONES.push({ id, x, y, w, h });
}
function asBotonEn(x, y) { for (let i = AS_BOTONES.length - 1; i >= 0; i--) { const b = AS_BOTONES[i]; if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return b; } return null; }

/* ---------- arriba: marcador y clases ---------- */
function asPintaMarcador(c) {
  const P = AS_P;
  c.fillStyle = AS_COL.fondo; c.fillRect(0, 0, 540, 108);
  asPanel(c, 4, 4, 532, 46, AS_COL.panel);
  asTexto(c, tr('PISO {n}', { n: (P.piso + 1) + '-' + (P.nodo ? P.nodo.c + 1 : 1) }), 14, 28, 20, '#fff', 'left');
  asIcono(c, 'moneda', 164, 27, 22); asTexto(c, String(P.oro), 182, 28, 22, AS_COL.oro, 'left');
  asIcono(c, 'gema', 244, 27, 22); asTexto(c, String(P.gemas), 262, 28, 22, '#9fd4ff', 'left');
  for (let i = 0; i < AS_CFG.corazones; i++) { c.globalAlpha = i < P.corazones ? 1 : 0.25; asIcono(c, 'corazon', 318 + i * 26, 27, 20); }
  c.globalAlpha = 1;
  asBoton(c, 'pausa', 488, 8, 42, 38, AS_COL.panel2, '', 0, false, (x, y) => { c.fillStyle = '#fff'; c.fillRect(x + 14, y + 10, 5, 16); c.fillRect(x + 23, y + 10, 5, 16); });
  if (P.estado === 'batalla') asBoton(c, 'vel', 432, 8, 52, 38, P.vel > 1 ? AS_COL.naranja : AS_COL.panel2, 'x' + P.vel, 20);
  // las clases del equipo: icono, nivel y «tengo / hacen falta»
  const { cuenta, act } = asSinergias(P.equipo);
  let x = 6;
  for (const k in AS_CLASES) {
    if (!cuenta[k]) continue;
    const cl = AS_CLASES[k], on = !!act[k], meta = cl.umbral[Math.min(cl.umbral.length - 1, act[k] || 0)];
    asPanel(c, x, 56, 46, 48, on ? cl.col : '#55597f');
    asIcono(c, 'clase-' + k, x + 23, 74, 24);
    asTexto(c, cuenta[k] + '/' + meta, x + 23, 96, 13, on ? '#fff' : '#c8cbe0');
    AS_BOTONES.push({ id: 'clase-' + k, x, y: 56, w: 46, h: 48 });
    x += 50;
  }
  if (x === 6) asTexto(c, tr('Compra héroes en la tienda'), 270, 80, 16, '#c9d0ff');
}

/* ---------- en medio: la arena ---------- */
function asPintaArena(c, t) {
  const A = AS_ARENA, im = AS_IMG.arena;
  c.imageSmoothingEnabled = false;
  if (im) c.drawImage(im, 0, 46, 270, A.h / 2, 0, A.y, 540, A.h);
  else { c.fillStyle = '#e2b268'; c.fillRect(0, A.y, 540, A.h); }
  const P = AS_P, tienda = P.estado === 'tienda' || P.estado === 'mapa' || P.estado === 'sala';
  if (tienda) {
    // la cuadrícula de los héroes: crucecitas como en la arena de verdad
    for (let col = 0; col < AS_COLS; col++) for (let f = 0; f < AS_FILAS; f++) {
      const [x, y] = asCelda('heroe', col, f), libre = !P.equipo.some(h => h.celda[0] === col && h.celda[1] === f);
      c.fillStyle = AS_DRAG.h && AS_DRAG.celda && AS_DRAG.celda[0] === col && AS_DRAG.celda[1] === f ? 'rgba(255,255,255,0.55)' : libre ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.12)';
      c.fillRect(x - 26, y - 4, 52, 6); c.fillRect(x - 3, y - 46, 6, 52);
    }
    const quietos = P.equipo.map(h => {
      const arr = AS_DRAG.h === h && AS_DRAG.mov ? [AS_DRAG.x, AS_DRAG.y + 24] : asCelda('heroe', h.celda[0], h.celda[1]);
      return { u: { tipo: h.tipo, anim: 'reposo', tAnim: t, lado: 'heroe', id: h.celda[0] * 7 + h.celda[1], destello: h.brillo > 0.6 ? 0.1 : 0 }, x: arr[0], y: arr[1], h };
    });
    const ene = (P.proxima || []).map((e, i) => { const [x, y] = asCelda('enemigo', e.celda[0], e.celda[1]); return { u: { tipo: e.tipo, anim: 'reposo', tAnim: t, lado: 'enemigo', id: i + 20, escala: e.escala, alfa: P.estado === 'tienda' ? 0.85 : 0 }, x, y }; });
    for (const q of [...quietos, ...ene].sort((a, b) => a.y - b.y)) asPintaMuneco(c, q.u, q.x, q.y, t);
    for (const q of quietos) {
      const hh = asAltoMuneco(q.h.tipo);
      if (q.h.nivel > 1) asTexto(c, tr('NV {n}', { n: q.h.nivel }), q.x, q.y - hh - 8, 13, '#ffe27a');
      if (q.h.brillo > 0) { q.h.brillo = Math.max(0, q.h.brillo - 0.03); c.globalAlpha = q.h.brillo; c.fillStyle = '#fff'; for (let i = 0; i < 6; i++) { const a = t * 4 + i; c.fillRect(Math.round(q.x + Math.cos(a) * 26), Math.round(q.y - hh / 2 + Math.sin(a) * 26), 4, 4); } c.globalAlpha = 1; }
    }
    return;
  }
  if (!AS_B) return;
  const B = AS_B;
  for (const p of B.parts) if (p.onda) { c.globalAlpha = 1 - p.t / p.vida; const k = 0.5 + p.t / p.vida; asElipsePix(c, p.x, p.y, p.onda * k, p.onda * 0.45 * k, p.col, 4); c.globalAlpha = 1; }
  for (const u of [...B.u].sort((a, b) => a.y - b.y)) asPintaMuneco(c, u, u.x, u.y, t);
  // barras de vida (y de escudo)
  for (const u of B.u) {
    if (u.muerta) continue;
    const hh = asAltoMuneco(u.tipo, u.escala), w = Math.round(34 * Math.min(1.6, u.escala)), x = Math.round(u.x - w / 2), y = Math.round(u.y - hh - 8);
    c.fillStyle = AS_COL.tinta; c.fillRect(x - 2, y - 2, w + 4, 8);
    c.fillStyle = '#5a2030'; c.fillRect(x, y, w, 4);
    c.fillStyle = u.lado === 'heroe' ? '#5fd84a' : '#ff5a4a'; c.fillRect(x, y, Math.max(0, Math.round(w * u.vida / u.max)), 4);
    if (u.escudo > 0) { c.fillStyle = '#9fd4ff'; c.fillRect(x, y - 3, Math.min(w, Math.round(w * u.escudo / u.max)), 2); }
    if (u.nivel > 1) asTexto(c, String(u.nivel), x - 8, y + 2, 11, '#ffe27a');
  }
  for (const p of B.proy) {
    if (p.tipo === 'flecha') { const a = Math.atan2(p.ob.y - 20 - p.y, p.ob.x - p.x), ca = Math.cos(a), sa = Math.sin(a); asLineaPix(c, p.x - ca * 10, p.y - sa * 10, p.x + ca * 8, p.y + sa * 8, 4, AS_COL.tinta); asLineaPix(c, p.x - ca * 10, p.y - sa * 10, p.x + ca * 6, p.y + sa * 6, 2, '#c88a4a'); c.fillStyle = '#e8e8f0'; c.fillRect(p.x + ca * 8 - 2, p.y + sa * 8 - 2, 4, 4); }
    else if (p.tipo === 'bomba') { c.fillStyle = AS_COL.tinta; c.fillRect(Math.round(p.x) - 6, Math.round(p.y) - 6, 12, 12); c.fillStyle = '#3a3a48'; c.fillRect(Math.round(p.x) - 4, Math.round(p.y) - 4, 8, 8); c.fillStyle = '#ffd23a'; c.fillRect(Math.round(p.x) + 2, Math.round(p.y) - 9, 3, 3); }
    else { const col = p.de.tipo === 'heroe-suricata' ? '#fff2a0' : p.de.lado === 'enemigo' ? '#ff5050' : '#ffa030'; c.fillStyle = AS_COL.tinta; c.fillRect(Math.round(p.x) - 6, Math.round(p.y) - 6, 12, 12); c.fillStyle = col; c.fillRect(Math.round(p.x) - 4, Math.round(p.y) - 4, 8, 8); c.fillStyle = '#fff'; c.fillRect(Math.round(p.x) - 2, Math.round(p.y) - 2, 3, 3); }
  }
  for (const p of B.parts) if (!p.onda) { c.globalAlpha = 1 - p.t / p.vida; c.fillStyle = p.col; c.fillRect(Math.round(p.x), Math.round(p.y), p.l, p.l); }
  c.globalAlpha = 1;
  for (const n of B.nums) { c.globalAlpha = n.t > 0.6 ? (0.9 - n.t) / 0.3 : 1; asTexto(c, n.txt, n.x, n.y - (n.t < 0.12 ? (0.12 - n.t) * 60 : 0), n.grande ? 22 : 16, n.col); }
  c.globalAlpha = 1;
  if (B.t > 40 && !B.fin) asTexto(c, tr('¡MUERTE SÚBITA!'), 270, AS_ARENA.y + 86 + Math.round(Math.sin(t * 6) * 2) * 2, 22, '#ff6a5a');
  if (B.t < 1.2) { c.globalAlpha = Math.min(1, (1.2 - B.t) * 3); asPanel(c, 150, AS_ARENA.y + 200, 240, 54, AS_COL.panel); asTexto(c, AS_P.nodo.tipo === 'jefe' ? tr('¡EL JEFE!') : tr('¡A LUCHAR!'), 270, AS_ARENA.y + 227, 26); c.globalAlpha = 1; }
}

/* ---------- abajo: tienda, batalla o mapa ---------- */
function asPintaTienda(c, t) {
  const P = AS_P, Y = 604;
  c.fillStyle = AS_COL.fondo; c.fillRect(0, Y, 540, AS_V.H - Y);
  asPanel(c, 8, Y + 6, 150, 40, AS_COL.panel2); asTexto(c, tr('TIENDA NV {n}', { n: P.nivelTienda }), 83, Y + 26, 16);
  asPanel(c, 382, Y + 6, 150, 40, AS_COL.panel2); asTexto(c, tr('EQUIPO {a}/{b}', { a: P.equipo.length, b: asCapacidad() }), 457, Y + 26, 16);
  asBoton(c, 'lucha', 172, Y, 196, 52, AS_COL.rojo, P.nodo.tipo === 'jefe' ? tr('¡AL JEFE!') : tr('¡LUCHA!'), 26);
  // las 5 cartas
  for (let i = 0; i < AS_TIENDA.huecos; i++) {
    const x = 8 + i * 106, y = Y + 66, w = 100, h = 150, tipo = P.oferta[i];
    if (!tipo) { asPanel(c, x, y, w, h, '#4a4f8a'); asTexto(c, tr('VENDIDO'), x + w / 2, y + h / 2, 14, '#8a8fc0'); continue; }
    const d = AS_HEROES[tipo], ya = asEnEquipo(tipo), no = asPorQueNo(i);
    asBoton(c, 'carta' + i, x, y, w, h, no === 'oro' || no === 'lleno' || no === 'max' ? '#6a6f9a' : AS_COL.claro);
    c.fillStyle = AS_TIER[d.tier]; c.fillRect(x + 6, y + 6, w - 12, 4);
    asRetrato(c, tipo, x + w / 2, y + 58, 84);
    d.clases.forEach((k, j) => { asPanel(c, x + 6 + j * 26, y + 8, 26, 26, AS_CLASES[k].col); asIcono(c, 'clase-' + k, x + 19 + j * 26, y + 21, 18); });
    asTexto(c, tr(d.nombre), x + w / 2, y + 106, 13, '#fff');
    asIcono(c, 'moneda', x + 34, y + 130, 18); asTexto(c, String(d.tier), x + 52, y + 131, 20, AS_P.oro >= d.tier ? AS_COL.oro : '#ff8a7a', 'left');
    if (ya) { asPanel(c, x + w - 44, y + 116, 40, 26, AS_COL.verde); asTexto(c, '+' + (ya.nivel + 1), x + w - 24, y + 129, 14); }
  }
  const cm = asCosteMejora(), max = P.nivelTienda >= Object.keys(AS_TIENDA.prob).length;
  asBoton(c, 'mejorar', 8, Y + 232, 256, 58, AS_COL.naranja, max ? tr('TIENDA AL MÁXIMO') : tr('MEJORAR'), 20, max || P.oro < cm, max ? null : (x, y) => { asIcono(c, 'moneda', x + 28, y + 29, 20); asTexto(c, String(cm), x + 48, y + 30, 20, AS_COL.oro, 'left'); });
  asBoton(c, 'refrescar', 276, Y + 232, 256, 58, AS_COL.verde, tr('REFRESCAR'), 20, P.oro < AS_TIENDA.refrescar, (x, y) => { asIcono(c, 'moneda', x + 28, y + 29, 20); asTexto(c, String(AS_TIENDA.refrescar), x + 48, y + 30, 20, AS_COL.oro, 'left'); });
  asTexto(c, AS_DRAG.h && AS_DRAG.mov ? tr('Suéltalo aquí para venderlo por {n} de oro', { n: asPrecioVenta(AS_DRAG.h) }) : tr('Arrastra a tus héroes para colocarlos'), 270, Y + 318, 15, AS_DRAG.h && AS_DRAG.mov ? '#ffcf5a' : '#9aa2e0');
  if (AS_DRAG.h && AS_DRAG.mov) { c.globalAlpha = 0.25 + Math.sin(t * 8) * 0.1; c.fillStyle = AS_COL.rojo; c.fillRect(0, Y, 540, AS_V.H - Y); c.globalAlpha = 1; }
}
function asPintaPanelBatalla(c, t) {
  const Y = 604;
  c.fillStyle = AS_COL.fondo; c.fillRect(0, Y, 540, AS_V.H - Y);
  asIcono(c, 'sala-combate', 270, Y + 120 + Math.sin(t * 6) * 4, 100);
  asPanel(c, 170, Y + 200, 200, 44, AS_COL.panel2); asTexto(c, tr('LUCHANDO'), 270, Y + 222, 20);
  const vivos = AS_B ? asVivos('enemigo').length : 0;
  asTexto(c, tr('Quedan {n} enemigos', { n: vivos }), 270, Y + 280, 16, '#c9d0ff');
}
function asPosNodo(n) {
  const C = AS_MAPA.columnas, x = 54 + n.c * (432 / (C - 1)), y = 790 + (n.i - (n.n - 1) / 2) * 92;
  return [Math.round(x), Math.round(y)];
}
function asPintaMapa(c, t) {
  const P = AS_P, Y = 604;
  c.fillStyle = AS_COL.fondo; c.fillRect(0, Y, 540, AS_V.H - Y);
  asPanel(c, 6, Y + 8, 528, 340, '#7f8ee0');
  asTexto(c, tr('{z} · PISO {n}', { z: tr(AS_ZONAS[P.zona].nombre), n: P.piso + 1 }), 270, Y + 34, 18);
  // pasillos
  for (const col of P.mapa) for (const n of col) for (const j of n.sig) {
    const [x1, y1] = asPosNodo(n), [x2, y2] = asPosNodo(P.mapa[n.c + 1][j]);
    asLineaPix(c, x1, y1, x2, y2, 12, AS_COL.tinta);
    asLineaPix(c, x1, y1, x2, y2, 6, n === P.nodo && n.hecho ? '#ffe27a' : '#4a4f8a');
  }
  // salas
  for (const col of P.mapa) for (const n of col) {
    const [x, y] = asPosNodo(n), aqui = n === P.nodo, puede = asPuedeIr(n), L = n.tipo === 'jefe' ? 66 : 54;
    const late = puede ? Math.sin(t * 6) * 3 : 0;
    asPanel(c, x - L / 2 - late, y - L / 2 - late, L + late * 2, L + late * 2, aqui ? AS_COL.verde : puede ? '#ffcf5a' : n.hecho ? '#5a5f90' : '#3b3f6a');
    if (n.tipo === 'cofre' && asHay('cofre')) asRetrato(c, 'cofre', x, y, L - 16);
    else asIcono(c, 'sala-' + (n.tipo === 'cofre' ? 'reliquia' : n.tipo), x, y, L - 14);
    if (aqui) { const b = Math.round(Math.sin(t * 5) * 3); asRetrato(c, 'heroe-bunny', x, y - L / 2 - 20 + b, 40); }
    if (puede) AS_BOTONES.push({ id: 'nodo' + n.c + '-' + n.i, x: x - L / 2 - 6, y: y - L / 2 - 6, w: L + 12, h: L + 12, nodo: n });
  }
  asTexto(c, tr('Elige por dónde seguir'), 270, Y + 326, 15, '#e8ecff');
}
function asPintaPartida(c, t) {
  AS_BOTONES = [];
  asPintaMarcador(c);
  asPintaArena(c, t);
  const e = AS_P.estado;
  if (e === 'tienda') asPintaTienda(c, t);
  else if (e === 'batalla') asPintaPanelBatalla(c, t);
  else asPintaMapa(c, t);
  asPintaAvisos(c);
}
// los avisos cortos que suben en medio de la arena
const AS_AVISOS = [];
function asAviso(txt, bien) { AS_AVISOS.push({ txt, bien, t: 0 }); if (AS_AVISOS.length > 3) AS_AVISOS.shift(); }
function asPintaAvisos(c) {
  AS_AVISOS.forEach((a, i) => {
    a.t += 1 / 60;
    const al = a.t < 1.8 ? 1 : Math.max(0, 1 - (a.t - 1.8) * 3), y = AS_ARENA.y + 70 + i * 40;
    c.globalAlpha = al; const w = Math.min(520, asTextoImg(a.txt, 16, '#fff', true).w * 2 + 30);
    asPanel(c, 270 - w / 2, y - 17, w, 34, a.bien ? '#4f9a3a' : '#9a3a4a'); asTexto(c, a.txt, 270, y, 16);
  });
  c.globalAlpha = 1;
  while (AS_AVISOS.length && AS_AVISOS[0].t > 2.2) AS_AVISOS.shift();
}
