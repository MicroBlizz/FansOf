// Fans of Asalto · PINTAR: la pantalla de juego en el lienzo de 540x960 (pintado a la mitad y ampliado entero), todo en pixel art.
// Arriba el marcador (nivel, oro, plumas) y las clases del equipo; en medio la arena (el 60 % de la pantalla) con la cuadrícula de los
// héroes, los puntos rojos de los enemigos, las flechas para elegir sala, el altar o el cofre; abajo la tienda, la batalla, el mapa o
// la escena del cofre. Cada botón se apunta en AS_BOTONES al pintarlo, para saber qué se ha tocado.
'use strict';
const AS_V = { H: 960, sc: 1, dpr: 1 };
// La letra de píxeles Jersey 10, siempre a su tamaño natural (16, o 32 en lo grande): así cada trazo cae en un píxel entero y se lee en el móvil.
// Siempre a su tamaño natural, así cada trazo cae en un píxel entero.
const AS_FUENTE = '"Jersey 10", "Courier New", monospace';
function asFuenteDe(tam) { return tam <= 34 ? `16px ${AS_FUENTE}` : `32px ${AS_FUENTE}`; }   // la de 10 no se leía en el móvil: todo va como mínimo a 16
let AS_BOTONES = [];
// colores claros, como el juego de referencia: paneles azul celeste con borde azul oscuro, fondo azul, luchar rojo, mejorar rosa, refrescar verde
const AS_COL = { tinta: '#2a3570', panel: '#a9bdf2', panel2: '#7f93e0', claro: '#dbe6ff', oscuro: '#55659e', fondo: '#4c56a8', rojo: '#e8503c', rosa: '#ff6a8a', verde: '#5bc44a', naranja: '#f08a2a', oro: '#ffd23a', gris: '#5a628f' };

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
  c.fillStyle = AS_COL.fondo; c.fillRect(0, 0, 540, AS_ARENA.y);
  asPanel(c, 4, 4, 532, 42, AS_COL.panel);
  asTexto(c, tr('NIVEL {n}', { n: P.nivel }), 14, 25, 18, '#fff', 'left');
  asIcono(c, 'moneda', 150, 25, 20); asTexto(c, String(P.oro), 166, 25, 20, AS_COL.oro, 'left');
  asIcono(c, 'pluma', 236, 25, 20); asTexto(c, String(P.plumas), 252, 25, 20, '#ffe9a0', 'left');
  asBoton(c, 'pausa', 492, 6, 40, 38, AS_COL.panel2, '', 0, false, (x, y) => { c.fillStyle = '#fff'; c.fillRect(x + 12, y + 10, 6, 18); c.fillRect(x + 22, y + 10, 6, 18); });
  if (P.estado === 'batalla') asBoton(c, 'vel', 436, 6, 52, 38, P.vel > 1 ? AS_COL.naranja : AS_COL.panel2, 'x' + P.vel, 18);
  else asBoton(c, 'equipo', 436, 6, 52, 38, AS_COL.panel2, '', 0, false, (x, y) => asIcono(c, 'equipo-casco', x + 26, y + 19, 24));
  // las clases del equipo: icono, «tengo / hacen falta» y nivel
  const { cuenta, act } = asSinergias(P.equipo);
  let x = 6;
  for (const k in AS_CLASES) {
    if (!cuenta[k]) continue;
    const cl = AS_CLASES[k], on = !!act[k], nivel = act[k] || 0, meta = cl.umbral[Math.min(cl.umbral.length - 1, nivel)];
    asPanel(c, x, 50, 44, 42, on ? cl.col : AS_COL.gris);
    asIcono(c, 'clase-' + k, x + 22, 65, 22);
    asTexto(c, cuenta[k] + '/' + meta, x + 22, 83, 14, on ? '#fff' : '#c8cbe0');
    AS_BOTONES.push({ id: 'clase-' + k, x, y: 50, w: 44, h: 42 });
    x += 48;
  }
  if (x === 6) asTexto(c, tr('Compra héroes en la tienda'), 270, 71, 16, '#dbe6ff');
}

/* ---------- en medio: la arena ---------- */
function asPintaSuelo(c, img, dy) {
  // el dibujo de Yoshi va a su tamaño (cada píxel suyo = 2 unidades = 1 píxel del lienzo pequeño): la parte de arriba (la orilla) arriba,
  // la de abajo abajo y, si la arena es más alta que el dibujo, el centro se repite en medio
  const A = AS_ARENA, im = AS_IMG[img];
  c.imageSmoothingEnabled = false;
  if (!im) { c.fillStyle = '#e2b268'; c.fillRect(0, A.y, 540, A.h); return; }
  const H = im.height, y0 = A.y + (dy || 0);
  if (img === 'pasillo') { for (let y = y0; y < A.y + A.h; y += H * 2) c.drawImage(im, 0, y, 540, H * 2); return; }   // se repite entero
  if (H * 2 >= A.h) { c.drawImage(im, 0, y0, 540, H * 2); return; }
  const arr = Math.floor(H * 0.55), aba = Math.floor(H * 0.3), med = H - arr - aba;
  c.drawImage(im, 0, 0, im.width, arr, 0, y0, 540, arr * 2);
  let y = y0 + arr * 2;
  const fin = A.y + A.h - aba * 2;
  while (y < fin) { const t = Math.min(med, (fin - y) / 2); c.drawImage(im, 0, arr, im.width, t, 0, y, 540, t * 2); y += t * 2; }
  c.drawImage(im, 0, H - aba, im.width, aba, 0, fin, 540, aba * 2);
}
function asPintaFlecha(c, x, y, dir, t) {
  const b = Math.round(Math.sin(t * 7) * 3) * 2, L = 36, k = AS_COL.tinta;
  c.save(); c.translate(x, y); if (dir === 'arr') c.rotate(-Math.PI / 2); else if (dir === 'aba') c.rotate(Math.PI / 2);
  c.translate(b, 0);
  c.fillStyle = k; c.fillRect(-L / 2 - 2, -8, L - 10, 16); for (let i = 0; i < 9; i++) c.fillRect(L / 2 - 12 - 2 + i * 2, -18 + i * 2, 4, 36 - i * 4);
  c.fillStyle = '#5fd0ff'; c.fillRect(-L / 2, -6, L - 12, 12); for (let i = 0; i < 7; i++) c.fillRect(L / 2 - 12 + i * 2, -14 + i * 2, 2, 28 - i * 4);
  c.restore();
}
function asPintaArena(c, t) {
  const A = AS_ARENA, P = AS_P, Z = asZona();
  c.save(); c.beginPath(); c.rect(0, A.y, 540, A.h); c.clip();
  const jefe = P.nodo && P.nodo.tipo === 'jefe' && P.estado !== 'camino';
  // el pasillo: el suelo se desplaza y el grupo anda en fila
  if (P.estado === 'camino') {
    const k = P.camino.t / P.camino.dura, img = AS_IMG.pasillo ? 'pasillo' : Z.arena;
    asPintaSuelo(c, img, -Math.round(((k * 900) % 300) / 2) * 2 - 300);
    P.equipo.forEach((h, i) => { const y = A.y + 140 + i * 24 + Math.sin(k * Math.PI) * 0; const x = 270 - 12 + ((i % 3) - 1) * 26; asPintaMuneco(c, { tipo: h.tipo, anim: 'andar', tAnim: t + i * 0.2, lado: 'heroe', id: i }, x, y, t); });
    c.restore(); return;
  }
  asPintaSuelo(c, jefe && AS_IMG['arena2-jefe'] ? 'arena2-jefe' : Z.arena);
  const quieto = P.estado !== 'batalla';
  if (quieto) {
    if (P.estado === 'tienda' || AS_DRAG.h) {   // la cuadrícula: crucecitas, como en la arena de verdad
      for (let col = 0; col < AS_COLS; col++) for (let f = 0; f < AS_FILAS; f++) {
        const [x, y] = asCelda(col, f), sel = AS_DRAG.h && AS_DRAG.celda && AS_DRAG.celda[0] === col && AS_DRAG.celda[1] === f;
        c.fillStyle = sel ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.45)';
        c.fillRect(x - 8, y - 2, 16, 4); c.fillRect(x - 2, y - 8, 4, 16);
        if (sel) { c.fillStyle = 'rgba(255,160,80,0.35)'; c.fillRect(x - 20, y - 50, 40, 60); }
      }
    }
    const quietos = P.equipo.map(h => {
      const arr = AS_DRAG.h === h && AS_DRAG.mov ? [AS_DRAG.x, AS_DRAG.y + 14] : asCelda(h.celda[0], h.celda[1]);
      return { u: { tipo: h.tipo, anim: 'reposo', tAnim: t, lado: 'heroe', id: h.celda[0] * 9 + h.celda[1], destello: h.brillo > 0.6 ? 0.1 : 0 }, x: arr[0], y: arr[1], h };
    });
    // los enemigos que vienen: puntos rojos (y el jefe, una calavera grande)
    if (P.estado === 'tienda') for (const e of P.proxima || []) {
      const [x, y] = e.pos;
      if (e.jefe) { const r = 22 + Math.round(Math.sin(t * 5) * 2) * 2; asElipsePix(c, x, y - 10, r, r, 'rgba(255,60,60,0.5)', 4); asIcono(c, 'sala-jefe', x, y - 10, 30); }
      else { asElipsePix(c, x, y - 4, 10, 10, 'rgba(255,60,60,0.35)'); asElipsePix(c, x, y - 4, 10, 10, 'rgba(255,60,60,0.9)', 2); }
    }
    for (const q of quietos.sort((a, b) => a.y - b.y)) asPintaMuneco(c, q.u, q.x, q.y, t);
    for (const q of quietos) if (q.h.brillo > 0) { q.h.brillo = Math.max(0, q.h.brillo - 0.03); c.globalAlpha = q.h.brillo; c.fillStyle = '#fff'; for (let i = 0; i < 6; i++) { const a = t * 4 + i; c.fillRect(Math.round(q.x + Math.cos(a) * 18), Math.round(q.y - 12 + Math.sin(a) * 18), 4, 4); } c.globalAlpha = 1; }
    // el cofre que sale del agujero, o el altar
    if (P.estado === 'cofre' && P.cofre) {
      const k = Math.min(1, P.cofre.t / 0.8), x = 400, y = A.y + A.h / 2;
      asIcono(c, 'agujero', x, y - 4, 44);
      if (k > 0.3 && asHay('cofre')) { const d = AS_TIRAS.cofre, fi = P.cofre.abierto ? d.f.length - 1 : 0, sube = Math.round((1 - Math.min(1, (k - 0.3) / 0.7)) * 30 / 2) * 2; c.imageSmoothingEnabled = false; c.drawImage(AS_IMG.cofre, fi * d.w, 0, d.w, d.h, x - d.w, y - d.h * 2 + sube, d.w * 2, d.h * 2); }
    }
    if (P.estado === 'altar' && P.altar) { const k = Math.min(1, P.altar.t / 0.6); const x = 400, y = A.y + A.h / 2; asIcono(c, 'altar', x, y - 10 + Math.round((1 - k) * 20 / 2) * 2, 48); }
    // las flechas para elegir sala
    for (const s of asSalidas()) {
      const pos = s.flecha === 'arr' ? [270, A.y + 36] : s.flecha === 'aba' ? [270, A.y + A.h - 36] : [500, A.y + A.h / 2];
      asPintaFlecha(c, pos[0], pos[1], s.flecha, t);
      AS_BOTONES.push({ id: 'ir-' + s.flecha, x: pos[0] - 40, y: pos[1] - 40, w: 80, h: 80, nodo: s.nodo });
    }
    c.restore(); return;
  }
  if (!AS_B) { c.restore(); return; }
  const B = AS_B;
  for (const p of B.parts) if (p.onda) { c.globalAlpha = 1 - p.t / p.vida; const k = 0.5 + p.t / p.vida; asElipsePix(c, p.x, p.y, p.onda * k, p.onda * 0.45 * k, p.col, 4); c.globalAlpha = 1; }
  for (const u of [...B.u].sort((a, b) => a.y - b.y)) asPintaMuneco(c, u, u.x, u.y, t);
  // barras de vida (y de escudo)
  for (const u of B.u) {
    if (u.muerta) continue;
    const hh = asAlto(u), w = Math.round(24 * Math.min(1.6, u.escala) / 2) * 2, x = Math.round((u.x - w / 2) / 2) * 2, y = Math.round((u.y - hh - 8) / 2) * 2;
    c.fillStyle = AS_COL.tinta; c.fillRect(x - 2, y - 2, w + 4, 8);
    c.fillStyle = '#5a2030'; c.fillRect(x, y, w, 4);
    c.fillStyle = u.lado === 'heroe' ? '#5fd84a' : '#ff5a4a'; c.fillRect(x, y, Math.max(0, Math.round(w * u.vida / u.max / 2) * 2), 4);
    if (u.escudo > 0) { c.fillStyle = '#9fd4ff'; c.fillRect(x, y - 4, Math.min(w, Math.round(w * u.escudo / u.max / 2) * 2), 2); }
  }
  for (const r of B.rayos) { c.globalAlpha = 1 - r.t / 0.25; asLineaPix(c, r.x1, r.y1, r.x2, r.y2, 6, '#fff7b0'); asLineaPix(c, r.x1, r.y1, r.x2, r.y2, 2, '#ffd23a'); c.globalAlpha = 1; }
  for (const p of B.proy) {
    if (p.t < 0) continue;
    if (p.tipo === 'flecha' || p.tipo === 'dardo') { const a = Math.atan2(p.ob.y - 14 - p.y, p.ob.x - p.x), ca = Math.cos(a), sa = Math.sin(a); asLineaPix(c, p.x - ca * 8, p.y - sa * 8, p.x + ca * 6, p.y + sa * 6, 4, AS_COL.tinta); asLineaPix(c, p.x - ca * 8, p.y - sa * 8, p.x + ca * 4, p.y + sa * 4, 2, p.tipo === 'dardo' ? '#b56bff' : '#c88a4a'); }
    else if (p.tipo === 'bomba') { c.fillStyle = AS_COL.tinta; c.fillRect(Math.round(p.x) - 6, Math.round(p.y) - 6, 12, 12); c.fillStyle = '#3a3a48'; c.fillRect(Math.round(p.x) - 4, Math.round(p.y) - 4, 8, 8); c.fillStyle = '#ffd23a'; c.fillRect(Math.round(p.x) + 2, Math.round(p.y) - 8, 2, 2); }
    else { const col = p.tipo === 'sombra' ? '#b56bff' : p.de.lado === 'enemigo' ? '#ff5050' : '#ffa030'; c.fillStyle = AS_COL.tinta; c.fillRect(Math.round(p.x) - 6, Math.round(p.y) - 6, 12, 12); c.fillStyle = col; c.fillRect(Math.round(p.x) - 4, Math.round(p.y) - 4, 8, 8); c.fillStyle = '#fff'; c.fillRect(Math.round(p.x) - 2, Math.round(p.y) - 2, 2, 2); }
  }
  for (const p of B.parts) if (!p.onda) { c.globalAlpha = 1 - p.t / p.vida; if (p.moneda) asIcono(c, 'moneda', p.x, p.y, 12); else { c.fillStyle = p.col; c.fillRect(Math.round(p.x / 2) * 2, Math.round(p.y / 2) * 2, Math.max(2, Math.round(p.l / 2) * 2), Math.max(2, Math.round(p.l / 2) * 2)); } }
  c.globalAlpha = 1;
  for (const n of B.nums) { c.globalAlpha = n.t > 0.6 ? (0.9 - n.t) / 0.3 : 1; asTexto(c, n.txt, n.x, n.y - (n.t < 0.12 ? (0.12 - n.t) * 60 : 0), n.grande ? 22 : 16, n.col); }
  c.globalAlpha = 1;
  // el oro que va cayendo
  if (AS_P.oroBatalla) asTexto(c, '+' + AS_P.oroBatalla, 470, A.y + A.h - 40, 20, AS_COL.oro);
  if (B.t > 40 && !B.fin) asTexto(c, tr('¡MUERTE SÚBITA!'), 270, A.y + 70 + Math.round(Math.sin(t * 6) * 2) * 2, 22, '#ff6a5a');
  if (B.t < 1.2) { c.globalAlpha = Math.min(1, (1.2 - B.t) * 3); asPanel(c, 150, A.y + 230, 240, 50, AS_COL.panel); asTexto(c, AS_P.nodo.tipo === 'jefe' ? tr('¡EL JEFE!') : tr('¡A LUCHAR!'), 270, A.y + 255, 26); c.globalAlpha = 1; }
  c.restore();
}

/* ---------- abajo: tienda, batalla, mapa o la escena del cofre ---------- */
let AS_Y = 690;   // dónde empieza el panel de abajo (lo pone asAjusta: siempre 270 antes del final)
function asPintaTienda(c, t) {
  const P = AS_P, Y = AS_Y;
  c.fillStyle = AS_COL.fondo; c.fillRect(0, Y, 540, AS_V.H - Y);
  asPanel(c, 6, Y + 4, 150, 40, AS_COL.panel2); asIcono(c, 'tienda', 28, Y + 24, 22); asTexto(c, tr('NV {n} TIENDA', { n: P.nivelTienda }), 92, Y + 25, 16);
  asBoton(c, 'lucha', 170, Y - 4, 200, 50, AS_COL.rojo, P.nodo.tipo === 'jefe' ? tr('¡AL JEFE!') : tr('¡LUCHA!'), 26);
  asPanel(c, 384, Y + 4, 150, 40, AS_COL.panel2); asIcono(c, 'moneda', 412, Y + 24, 20); asTexto(c, String(P.oro), 430, Y + 25, 20, AS_COL.oro, 'left');
  // las 5 cartas
  for (let i = 0; i < AS_TIENDA.huecos; i++) {
    const x = 8 + i * 106, y = Y + 54, w = 100, h = 138, tipo = P.oferta[i];
    if (!tipo) { asPanel(c, x, y, w, h, AS_COL.gris); asTexto(c, tr('VENDIDO'), x + w / 2, y + h / 2, 14, '#9aa2d0'); continue; }
    const d = AS_HEROES[tipo], no = asPorQueNo(i);
    asBoton(c, 'carta' + i, x, y, w, h, no ? '#8a93c0' : AS_COL.claro);
    asRetrato(c, tipo, x + w / 2, y + 56, 76);
    d.clases.forEach((k, j) => { asPanel(c, x + 4 + j * 24, y + 4, 24, 24, AS_CLASES[k].col); asIcono(c, 'clase-' + k, x + 16 + j * 24, y + 16, 16); });
    asTexto(c, tr(d.corto), x + w / 2, y + 100, 14, AS_COL.tinta, 'center', true);
    asIcono(c, 'moneda', x + 30, y + 122, 16); asTexto(c, String(d.precio), x + 44, y + 122, 20, P.oro >= d.precio ? AS_COL.tinta : '#c03030', 'left', true);
  }
  const cm = asCosteMejora(), max = P.nivelTienda >= AS_TIENDA.nivelMax;
  asBoton(c, 'mejorar', 8, Y + 204, 256, 50, AS_COL.rosa, max ? tr('AL MÁXIMO') : tr('MEJORAR'), 20, max || P.oro < cm, max ? null : (x, y) => { asIcono(c, 'moneda', x + 26, y + 25, 20); asTexto(c, String(cm), x + 44, y + 25, 20, AS_COL.oro, 'left'); });
  asBoton(c, 'refrescar', 276, Y + 204, 256, 50, AS_COL.verde, tr('REFRESCAR'), 20, P.oro < AS_TIENDA.refrescar, (x, y) => { asIcono(c, 'moneda', x + 26, y + 25, 20); asTexto(c, String(AS_TIENDA.refrescar), x + 44, y + 25, 20, AS_COL.oro, 'left'); });
  if (AS_DRAG.h && AS_DRAG.mov) { c.globalAlpha = 0.3 + Math.sin(t * 8) * 0.1; c.fillStyle = AS_COL.rojo; c.fillRect(0, Y, 540, AS_V.H - Y); c.globalAlpha = 1; asTexto(c, tr('Suéltalo aquí para venderlo por {n} de oro', { n: asPrecioVenta(AS_DRAG.h) }), 270, Y + 130, 18, '#fff'); }
}
function asPintaPanelBatalla(c, t) {
  const Y = AS_Y;
  c.fillStyle = AS_COL.fondo; c.fillRect(0, Y, 540, AS_V.H - Y);
  asIcono(c, 'sala-combate', 270, Y + 100 + Math.round(Math.sin(t * 6) * 2) * 2, 90);
  asPanel(c, 170, Y + 170, 200, 40, AS_COL.panel2); asTexto(c, tr('LUCHANDO'), 270, Y + 190, 18);
  const vivos = AS_B ? asVivos('enemigo').length : 0;
  asTexto(c, tr('Quedan {n} enemigos', { n: vivos }), 270, Y + 236, 16, '#dbe6ff');
}
// el mapa: las columnas cerca de donde estás (3 a la izquierda, 4 a la derecha), pasillos grises
function asPintaMapa(c, t) {
  const P = AS_P, Y = AS_Y, Z = asZona();
  c.fillStyle = AS_COL.fondo; c.fillRect(0, Y, 540, AS_V.H - Y);
  asPanel(c, 6, Y + 6, 528, 258, AS_COL.panel);
  asTexto(c, tr('{z} · NIVEL {n} DE {m}', { z: tr(Z.nombre), n: P.nivel, m: Z.niveles }), 270, Y + 26, 16, AS_COL.tinta, 'center', true);
  const c0 = clamp(P.nodo.c - 2, 0, Math.max(0, P.mapa.length - 7)), paso = 76;
  const pos = n => [40 + (n.c - c0) * paso, Y + 150 + (n.i - (n.n - 1) / 2) * 60];
  c.save(); c.beginPath(); c.rect(8, Y + 40, 524, 220); c.clip();
  for (const col of P.mapa) for (const n of col) { if (n.c < c0 - 1 || n.c > c0 + 7) continue; for (const j of n.sig) { const [x1, y1] = pos(n), [x2, y2] = pos(P.mapa[n.c + 1][j]); asLineaPix(c, x1, y1, x2, y2, 12, '#7a85b8'); if (n === P.nodo && asSalidas().some(s => s.nodo === P.mapa[n.c + 1][j])) for (let k = 0; k < 3; k++) { const q = 0.3 + k * 0.2 + (t * 0.5 % 0.2); asTexto(c, '›', lerp(x1, x2, q), lerp(y1, y2, q), 16, '#fff'); } } }
  for (const col of P.mapa) for (const n of col) {
    if (n.c < c0 - 1 || n.c > c0 + 7) continue;
    const [x, y] = pos(n), aqui = n === P.nodo, L = n.tipo === 'jefe' ? 52 : 44;
    asPanel(c, x - L / 2, y - L / 2, L, L, aqui ? AS_COL.verde : n.hecho ? '#9aa3c8' : n.tipo === 'vacia' ? '#5a628f' : '#6a739f');
    if (n.tipo === 'cofre' && asHay('cofre')) asRetrato(c, 'cofre', x, y, L - 14);
    else if (n.tipo === 'combate') asIcono(c, 'sala-combate', x, y, L - 12);
    else if (n.tipo === 'altar') asIcono(c, 'sala-reliquia', x, y, L - 12);
    else if (n.tipo === 'jefe') asIcono(c, 'sala-jefe', x, y, L - 12);
    if (aqui) { const b = Math.round(Math.sin(t * 5) * 2) * 2; asRetrato(c, P.equipo.length ? P.equipo[0].tipo : 'heroe-bunny', x, y - L / 2 - 14 + b, 30); }
  }
  c.restore();
}
// la escena del cofre: un bosque con el cofre, abrir o doble con anuncio
function asPintaCofre(c, t) {
  const P = AS_P, Y = AS_Y, C = P.cofre;
  c.imageSmoothingEnabled = false;
  if (AS_IMG['bosque-cofre']) { const im = AS_IMG['bosque-cofre'], h = Math.round(im.height * 540 / im.width); c.drawImage(im, 0, Y, 540, Math.max(h, 200)); c.fillStyle = AS_COL.fondo; c.fillRect(0, Y + Math.max(h, 200), 540, 300); }
  else { c.fillStyle = '#2f4a3a'; c.fillRect(0, Y, 540, AS_V.H - Y); c.fillStyle = '#4a8a4a'; c.fillRect(0, Y + 150, 540, AS_V.H - Y - 150); }
  if (asHay('cofre')) {
    const d = AS_TIRAS.cofre, fi = C.abierto ? Math.min(d.f.length - 1, Math.floor(C.tAbre * 6)) : 0, k = 3;
    if (C.abierto) { c.globalAlpha = 0.35 + Math.sin(t * 6) * 0.1; c.fillStyle = '#ffe27a'; c.fillRect(270 - 40, Y, 80, 170); c.globalAlpha = 1; }
    c.drawImage(AS_IMG.cofre, fi * d.w, 0, d.w, d.h, 270 - d.w * k / 2, Y + 168 - d.h * k, d.w * k, d.h * k);
    if (C.abierto) for (let i = 0; i < 10; i++) { const a = C.tAbre * 3 + i; asIcono(c, 'moneda', 270 + Math.cos(a) * (60 + i * 8), Y + 120 - (C.tAbre * 90 + i * 17) % 120, 14); }
  }
  if (C.abierto) { asIcono(c, 'pluma', 200, Y + 206, 22); asTexto(c, '+' + C.plumasDadas, 216, Y + 206, 22, '#ffe9a0', 'left'); asIcono(c, 'moneda', 300, Y + 206, 22); asTexto(c, '+' + C.oroDado, 316, Y + 206, 22, AS_COL.oro, 'left'); asBoton(c, 'cofre-sigue', 170, Y + 226, 200, 40, AS_COL.panel2, tr('SEGUIR'), 18); }
  else if (C.t > 0.8) { asBoton(c, 'cofre-abrir', 40, Y + 212, 220, 48, AS_COL.rojo, tr('ABRIR'), 22); asBoton(c, 'cofre-doble', 280, Y + 212, 220, 48, AS_COL.verde, tr('DOBLE'), 22, false, (x, y) => asIcono(c, 'anuncio', x + 30, y + 24, 22)); }
}
function asPintaPartida(c, t) {
  AS_BOTONES = [];
  asPintaMarcador(c);
  asPintaArena(c, t);
  const e = AS_P.estado;
  if (e === 'tienda') asPintaTienda(c, t);
  else if (e === 'batalla') asPintaPanelBatalla(c, t);
  else if (e === 'cofre') asPintaCofre(c, t);
  else asPintaMapa(c, t);
  asPintaAvisos(c);
}
// los avisos cortos que suben en medio de la arena (grande = cartel que se queda más)
const AS_AVISOS = [];
function asAviso(txt, bien, grande) { AS_AVISOS.push({ txt, bien, grande, t: 0 }); if (AS_AVISOS.length > 3) AS_AVISOS.shift(); }
function asPintaAvisos(c) {
  AS_AVISOS.forEach((a, i) => {
    a.t += 1 / 60;
    const al = a.t < 1.8 ? 1 : Math.max(0, 1 - (a.t - 1.8) * 3), y = AS_ARENA.y + 60 + i * 40;
    c.globalAlpha = al; const w = Math.min(520, asTextoImg(a.txt, a.grande ? 26 : 16, '#fff', true).w * 2 + 30);
    asPanel(c, 270 - w / 2, y - (a.grande ? 24 : 17), w, a.grande ? 48 : 34, a.grande ? AS_COL.rojo : a.bien ? '#4f9a3a' : '#9a3a4a'); asTexto(c, a.txt, 270, y, a.grande ? 26 : 16);
  });
  c.globalAlpha = 1;
  while (AS_AVISOS.length && AS_AVISOS[0].t > 2.2) AS_AVISOS.shift();
}
