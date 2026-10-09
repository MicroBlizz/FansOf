// Fans of Roguelite (prototipo) · Lo que no es la escena: el marcador (día, nivel, monedas y vida), el panel de abajo
// (lo que va pasando, las elecciones, las habilidades, el inicio y el final), el cartel de cada día y los botones.
// Todo dibujado en píxeles con la letra de letras.js; los toques se comprueban contra BOTONES.
'use strict';

const COL = { fondo: '#150b21', tray: '#26143c', trayHi: '#3e2363', tinta: '#fff6ea', tenue: '#cdb9ea', oro: '#ffcb3d', naranja: '#ff7a1a', naranjaO: '#b8380f', azul: '#5b4bd6', azulO: '#2e2380' };
const PANEL = { modo: 'titulo', titulo: '', texto: '', opciones: [], habs: [], cofre: false, t0: 0, elegida: -1 };
const LOG = [];
let BOTONES = [], MONEDERO = [170, 6], PULSA = null;
const PANEL_Y = ESC.Y + ESC.H;

const formatea = (s, v) => v ? s.replace(/\{(\w+)\}/g, (m, k) => (v[k] !== undefined ? v[k] : m)) : s;
function log(txt, v) { LOG.push({ txt: formatea(tr(txt), v), t0: RELOJ.t }); if (LOG.length > 14) LOG.shift(); }
function panelOpciones(titulo, texto, opciones) {
  Object.assign(PANEL, { modo: 'opciones', titulo, texto, opciones, t0: RELOJ.t, elegida: -1 });
  return esperaEleccion().then(i => { PANEL.modo = 'log'; return i; });
}
function panelHabilidad(habs, cofre) {
  Object.assign(PANEL, { modo: 'habilidad', habs, cofre, t0: RELOJ.t, elegida: -1 });
  return esperaEleccion().then(i => { PANEL.modo = 'log'; return i; });
}
function escoge(i) {
  if (PANEL.elegida >= 0) return;
  PANEL.elegida = i; sonido('elige');
  espera(0.2).then(() => elige(i)).catch(() => {});
}

/* ---------- piezas de dibujo ---------- */
function marco(ctx, x, y, w, h, fondo, borde = OL) {
  ctx.fillStyle = borde; ctx.fillRect(x + 1, y, w - 2, h); ctx.fillRect(x, y + 1, w, h - 2);
  ctx.fillStyle = fondo; ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
}
const pulsado = (x, y) => PULSA && PULSA.x === x && PULSA.y === y && performance.now() - PULSA.t < 140;
// un botón de canto grueso, como una tecla; devuelve cuánto se ha hundido
function botonPx(ctx, x, y, w, h, col, colO, f) {
  BOTONES.push({ x, y, w, h, f });
  const dy = pulsado(x, y) ? 2 : 0;
  marco(ctx, x, y + 2, w, h - 2, colO);
  marco(ctx, x, y + dy, w, h - 2, col);
  ctx.fillStyle = mezcla(col, '#ffffff', 0.35); ctx.fillRect(x + 2, y + dy + 1, w - 4, 1);
  return dy;
}
function iconoHab(ctx, id, x, y, tam = 22) {
  const r = RAREZA[HABILIDADES[id].rar];
  marco(ctx, x, y, tam, tam, r[2]);
  ctx.fillStyle = mezcla(r[2], '#ffffff', 0.18); ctx.fillRect(x + 1, y + 1, tam - 2, 1);
  pintaSpr(ctx, SPR.icono[id], x + tam / 2, y + tam / 2);
}
// letras que bailan (títulos)
function ondula(ctx, txt, cx, y, esc, c, c2, fase = 0, amp = 2) {
  const t = limpiaTexto(txt);
  let x = Math.round(cx - anchoTexto(t, esc) / 2), i = 0;
  for (const ch of t) { escribe(ctx, ch, x, y + Math.round(Math.sin(RELOJ.t * 5 + i * 0.7 + fase) * amp), { esc, c, c2 }); x += (anchoLetra(ch) + 1) * esc; i++; }
}

/* ---------- el marcador de arriba ---------- */
function pintaHud(ctx) {
  const W = PAN.W;
  ctx.fillStyle = COL.fondo; ctx.fillRect(0, 0, W, ESC.Y);
  ctx.fillStyle = OL; ctx.fillRect(0, ESC.Y - 1, W, 1);
  if (!H || VIAJE.modo === 'titulo') {
    escribe(ctx, tr('Fans of Roguelite'), W / 2, 3, { alin: 'centro', c: COL.tenue });
    escribe(ctx, tr('Prototipo'), W / 2, 13, { alin: 'centro', c: COL.oro });
    return;
  }
  const dia = escribe(ctx, formatea(tr('Día {n}/{t}'), { n: VIAJE.dia + 1, t: DIAS.length }), 4, 3, { c: COL.oro });
  escribe(ctx, formatea(tr('Nv {n}'), { n: H.nivel }), 4 + dia + 8, 3, { c: COL.tenue });
  const m = String(H.monedas), mw = anchoTexto(m);
  escribe(ctx, m, W - 4, 3, { alin: 'der', c: COL.oro });
  pintaSpr(ctx, SPR.icono.moneda, W - 9 - mw, 6); MONEDERO = [W - 9 - mw, 6];
  pintaSpr(ctx, SPR.icono.corazon, 9, 17);
  const bx = 17, by = 14, bw = W - 17 - 44, bh = 7, k = Math.max(0, H.vida / H.vidaMax), kv = Math.max(0, Math.min(1, H.vidaVista / H.vidaMax));
  ctx.fillStyle = OL; ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
  ctx.fillStyle = '#3a1020'; ctx.fillRect(bx, by, bw, bh);
  if (kv > k) { ctx.fillStyle = '#fff6ea'; ctx.fillRect(bx, by, Math.round(bw * kv), bh); }
  const poca = k < 0.3 && Math.floor(RELOJ.t * 6) % 2;
  ctx.fillStyle = poca ? '#ff8a94' : '#ff3348'; ctx.fillRect(bx, by, Math.round(bw * k), bh);
  ctx.fillStyle = '#ff9aa4'; ctx.fillRect(bx, by, Math.round(bw * k), 2);
  ctx.fillStyle = '#c41a30'; ctx.fillRect(bx, by + bh - 1, Math.round(bw * k), 1);
  for (let v = 25; v < H.vidaMax; v += 25) { ctx.fillStyle = 'rgba(32,16,44,0.5)'; ctx.fillRect(bx + Math.round(bw * v / H.vidaMax), by + 2, 1, bh - 2); }
  escribe(ctx, `${Math.max(0, Math.ceil(H.vida))}/${H.vidaMax}`, W - 4, 14, { alin: 'der' });
}

/* ---------- lo que se pinta encima de la escena ---------- */
function pintaEscenaUI(ctx) {
  const W = PAN.W;
  if (VIAJE.modo === 'titulo') {
    escribe(ctx, tr('Fans of'), W / 2, ESC.Y + 12, { esc: 2, alin: 'centro' });
    ondula(ctx, tr('Roguelite'), W / 2, ESC.Y + 32, 3, COL.oro, COL.naranja);
  }
  const c = VIAJE.cartel;
  if (c) {
    const t = RELOJ.t - c.t0;
    if (t > 2.1) VIAJE.cartel = null;
    else {
      const entra_ = sale(Math.min(1, t / 0.3)), fuera = t > 1.75 ? entra((t - 1.75) / 0.35) : 0;
      const dx = Math.round((1 - entra_) * -W + fuera * W), y = ESC.Y + 34;
      ctx.fillStyle = OL; ctx.fillRect(dx, y - 2, W, 36);
      ctx.fillStyle = '#4b2580'; ctx.fillRect(dx, y, W, 32);
      ctx.fillStyle = '#7a2e93'; ctx.fillRect(dx, y, W, 2);
      ctx.fillStyle = '#2a1050'; ctx.fillRect(dx, y + 30, W, 2);
      ondula(ctx, formatea(tr('Día {n}'), { n: c.n }), W / 2 + dx, y + 2, 2, COL.oro, COL.naranja, 0, 1);
      escribe(ctx, tr(c.titulo), W / 2 + dx, y + 21, { alin: 'centro', c: COL.tinta });
    }
  }
  if (VIAJE.fundido > 0) rellenaTrama(ctx, 0, ESC.Y, W, ESC.H, Math.round(VIAJE.fundido * 16), COL.fondo);
  if (DESTELLO) rellenaTrama(ctx, 0, ESC.Y, W, ESC.H, DESTELLO.t > DESTELLO.dur / 2 ? 10 : 5, DESTELLO.color);
  // velocidad y sonido (arriba a la derecha de la escena)
  if (VIAJE.modo !== 'titulo') {
    const dy = botonPx(ctx, W - 40, ESC.Y + 4, 20, 13, RELOJ.vel > 1 ? COL.naranja : COL.trayHi, RELOJ.vel > 1 ? COL.naranjaO : OL, () => { RELOJ.vel = RELOJ.vel > 1 ? 1 : 2; sonido('toque'); });
    escribe(ctx, RELOJ.vel > 1 ? 'x2' : 'x1', W - 30, ESC.Y + 6 + dy, { alin: 'centro' });
  }
  const dy = botonPx(ctx, W - 17, ESC.Y + 4, 13, 13, COL.trayHi, OL, () => { sonidoInicia(); sonidoCambia(); sonido('toque'); });
  pintaSpr(ctx, SON.on ? SPR.icono.sonido : SPR.icono.mudo, W - 11, ESC.Y + 9 + dy);
}

/* ---------- el panel de abajo ---------- */
function pintaPanel(ctx) {
  const W = PAN.W, y0 = PANEL_Y, h = PAN.H - y0;
  ctx.fillStyle = OL; ctx.fillRect(0, y0, W, h);
  marco(ctx, 2, y0 + 2, W - 4, h - 4, COL.tray, '#3a2058');
  ctx.fillStyle = COL.trayHi; ctx.fillRect(4, y0 + 3, W - 8, 1);
  if (PANEL.modo === 'titulo') return panelTitulo(ctx, W, y0, h);
  if (PANEL.modo === 'opciones') return panelElige(ctx, W, y0, h);
  if (PANEL.modo === 'habilidad') return panelHabs(ctx, W, y0, h);
  if (PANEL.modo === 'fin') return panelFin(ctx, W, y0, h);
  panelLog(ctx, W, y0, h);
}

function panelTitulo(ctx, W, y0, h) {
  let y = y0 + 10;
  for (const l of envuelve(tr('CrazyBunny camina solo hacia las oficinas de Microblizz. Tú eliges qué aprende por el camino.'), W - 24)) { escribe(ctx, l, W / 2, y, { alin: 'centro', c: COL.tenue }); y += LINEA; }
  y = Math.max(y + 8, y0 + h / 2 - 16);
  const bw = Math.min(W - 40, 130), bx = Math.round(W / 2 - bw / 2);
  const dy = botonPx(ctx, bx, y, bw, 30, COL.naranja, COL.naranjaO, () => { sonidoInicia(); sonido('elige'); partida(); });
  ondula(ctx, tr('Empezar'), W / 2, y + 8 + dy, 2, COL.tinta, '#ffe0c0', 0, 1);
  escribe(ctx, tr('6 días · 1 jefe · unos 2 minutos'), W / 2, PAN.H - 16, { alin: 'centro', c: COL.tenue });
}

function filaHabs(ctx, x, y) {
  const ids = Object.keys(H.habs);
  ids.forEach((id, i) => {
    const bx = x + i * 24;
    BOTONES.push({ x: bx, y, w: 22, h: 22, f: () => { const hb = HABILIDADES[id]; log('{q}: {d}{n}', { q: tr(hb.n), d: tr(hb.d), n: '' }); sonido('toque'); } });
    iconoHab(ctx, id, bx, y);
    if (H.habs[id] > 1) escribe(ctx, 'x' + H.habs[id], bx + 21, y + 15, { alin: 'der', c: COL.oro });
  });
  return ids.length;
}

function panelLog(ctx, W, y0, h) {
  let y = y0 + 7;
  if (H && filaHabs(ctx, 7, y)) y += 26;
  const ancho = W - 22, cabe = Math.floor((PAN.H - 6 - y) / LINEA), lineas = [];
  for (let i = LOG.length - 1; i >= 0 && lineas.length < cabe; i--) {
    const e = LOG[i], ls = envuelve(e.txt, ancho);
    for (let j = ls.length - 1; j >= 0 && lineas.length < cabe; j--) lineas.unshift({ l: ls[j], e, primera: j === 0, antes: ls.slice(0, j).join(' ').length + (j ? 1 : 0) });
  }
  const ult = LOG[LOG.length - 1];
  for (const { l, e, primera, antes } of lineas) {
    const nueva = e === ult, vis = nueva ? Math.floor((RELOJ.t - e.t0) * 70) - antes : undefined;
    if (primera) escribe(ctx, '>', 7, y, { c: nueva ? COL.oro : '#6a4a9a' });
    if (vis === undefined || vis > 0) escribe(ctx, l, 15, y, { c: nueva ? COL.tinta : COL.tenue, hasta: vis });
    y += LINEA;
  }
}

function panelElige(ctx, W, y0, h) {
  const t = RELOJ.t - PANEL.t0;
  let y = y0 + 8;
  escribe(ctx, tr(PANEL.titulo), W / 2, y, { alin: 'centro', c: COL.oro }); y += LINEA + 3;
  const cajas = PANEL.opciones.map(o => envuelve(tr(o.d), W - 30));
  const altoBotones = cajas.reduce((s, ls) => s + 18 + ls.length * LINEA, 0) + 6;
  const texto = envuelve(tr(PANEL.texto), W - 16), sitio = Math.floor((PAN.H - 6 - altoBotones - y) / LINEA);
  for (const l of texto.slice(0, Math.max(1, sitio))) { escribe(ctx, l, 8, y, { c: COL.tinta }); y += LINEA; }
  y += 4;
  PANEL.opciones.forEach((o, i) => {
    const ls = cajas[i], bh = 18 + ls.length * LINEA, k = sale(Math.max(0, Math.min(1, (t - i * 0.1) / 0.28)));
    const x = 6 + Math.round((1 - k) * W), col = i ? COL.azul : COL.naranja, colO = i ? COL.azulO : COL.naranjaO;
    const elegida = PANEL.elegida === i, otra = PANEL.elegida >= 0 && !elegida;
    const dy = botonPx(ctx, x, y, W - 12, bh, otra ? COL.trayHi : elegida ? mezcla(col, '#ffffff', 0.3) : col, colO, () => escoge(i));
    escribe(ctx, tr(o.n), x + 7, y + 4 + dy, { c: COL.tinta });
    escribe(ctx, String(i + 1), x + W - 20, y + 4 + dy, { c: mezcla(col, '#ffffff', 0.5), alin: 'der' });
    ls.forEach((l, j) => escribe(ctx, l, x + 7, y + 14 + j * LINEA + dy, { c: '#ffe8d8', borde: mezcla(colO, OL, 0.4) }));
    y += bh + 4;
  });
}

function panelHabs(ctx, W, y0, h) {
  const t = RELOJ.t - PANEL.t0;
  let y = y0 + 8;
  ondula(ctx, tr(PANEL.cofre ? '¡Cofre! Elige una habilidad' : 'Elige una habilidad'), W / 2, y, 1, COL.oro, COL.naranja, 0, 1);
  y += LINEA + 4;
  const lineas = Math.min(3, Math.max(...PANEL.habs.map(id => envuelve(tr(HABILIDADES[id].d), W - 48).length)));
  const fh = Math.min(16 + lineas * LINEA, Math.floor((PAN.H - 8 - y) / 3) - 3);
  PANEL.habs.forEach((id, i) => {
    const hb = HABILIDADES[id], r = RAREZA[hb.rar], k = sale(Math.max(0, Math.min(1, (t - i * 0.1) / 0.3)));
    const x = 6 + Math.round((1 - k) * W), w = W - 12, elegida = PANEL.elegida === i, otra = PANEL.elegida >= 0 && !elegida;
    BOTONES.push({ x, y, w, h: fh, f: () => escoge(i) });
    const dy = pulsado(x, y) ? 1 : 0;
    marco(ctx, x, y + dy, w, fh, otra ? COL.trayHi : elegida ? mezcla(r[2], '#ffffff', 0.25) : '#1c0f2e', elegida ? '#ffffff' : r[1]);
    ctx.fillStyle = r[2]; ctx.fillRect(x + 1, y + dy + 1, w - 2, 1);
    iconoHab(ctx, id, x + 4, y + dy + Math.round((fh - 22) / 2));
    escribe(ctx, tr(hb.n), x + 31, y + dy + 4, { c: r[1] });
    if (anchoTexto(tr(hb.n)) + anchoTexto(tr(r[0])) + 10 < w - 35) escribe(ctx, tr(r[0]), x + w - 4, y + dy + 4, { c: mezcla(r[1], '#26143c', 0.35), alin: 'der' });
    envuelve(tr(hb.d), w - 36).slice(0, Math.max(1, Math.floor((fh - 14) / LINEA))).forEach((l, j) => escribe(ctx, l, x + 31, y + dy + 14 + j * LINEA, { c: COL.tinta }));
    if (hb.rar === 'legendary' || hb.rar === 'epic') { const p = ((t * 0.7 + i * 0.3) % 1) * (w + fh) | 0, px = p < w ? x + p : x + w - 1, py = p < w ? y + dy : y + dy + (p - w); ctx.fillStyle = '#ffffff'; ctx.fillRect(px, py, 2, 1); ctx.fillRect(px, py, 1, 2); }
    y += fh + 3;
  });
}

function panelFin(ctx, W, y0, h) {
  const f = VIAJE.fin, gana = f && f.gana;
  let y = y0 + 8;
  for (const l of envuelve(tr(gana ? '¡SurvivalBot despedido!' : '¡Te han despedido!'), W - 16, 2)) { ondula(ctx, l, W / 2, y, 2, gana ? COL.oro : '#ff8a94', gana ? COL.naranja : '#ff3348', 0, 1); y += 18; }
  y += 2;
  for (const l of envuelve(tr(gana ? 'Las oficinas de Microblizz, en el próximo prototipo.' : 'Microblizz te agradece los servicios prestados.'), W - 20)) { escribe(ctx, l, W / 2, y, { alin: 'centro', c: COL.tenue }); y += LINEA; }
  y += 3;
  escribe(ctx, formatea(tr('Nivel {n} · {m} monedas'), { n: H.nivel, m: H.monedas }), W / 2, y, { alin: 'centro' }); y += LINEA + 3;
  const n = Object.keys(H.habs).length;
  if (n) { filaHabs(ctx, Math.round(W / 2 - (n * 24 - 2) / 2), y); y += 26; }
  const by = Math.max(y + 2, PAN.H - 34), bw = Math.floor((W - 18) / 2);
  let dy = botonPx(ctx, 6, by, bw, 26, COL.naranja, COL.naranjaO, () => { sonido('elige'); partida(); });
  escribe(ctx, tr('Otra vez'), 6 + bw / 2, by + 8 + dy, { alin: 'centro' });
  dy = botonPx(ctx, W - 6 - bw, by, bw, 26, COL.azul, COL.azulO, () => { sonido('elige'); location.href = '../../#biblioteca'; });
  escribe(ctx, tr('Biblioteca'), W - 6 - bw / 2, by + 8 + dy, { alin: 'centro' });
}

// un toque en la pantalla (x, y en píxeles del juego)
function toque(x, y) {
  for (let i = BOTONES.length - 1; i >= 0; i--) {
    const b = BOTONES[i];
    if (x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h) { PULSA = { x: b.x, y: b.y, t: performance.now() }; b.f(); return; }
  }
}
// teclado: 1, 2 y 3 eligen; Intro empieza o vuelve a empezar
function tecla(k) {
  if ((PANEL.modo === 'opciones' || PANEL.modo === 'habilidad') && /^[1-3]$/.test(k)) { const i = +k - 1; if (i < (PANEL.modo === 'opciones' ? PANEL.opciones : PANEL.habs).length) escoge(i); }
  if (k === 'Enter' && (PANEL.modo === 'titulo' || PANEL.modo === 'fin')) { sonidoInicia(); sonido('elige'); partida(); }
}
