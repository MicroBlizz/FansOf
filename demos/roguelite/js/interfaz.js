// Fans of Roguelite · Lo que no es la escena: el marcador (día, nivel, experiencia, monedas, vida y escudo), los botones de la
// escena (casa, velocidad, sonido), el cartel de cada día y el panel de abajo mientras se juega (lo que va pasando con tus
// objetos y habilidades, y las elecciones). Los paneles de premios están en paneles.js y los del menú en menu.js.
// Todo dibujado en píxeles con la letra de letras.js; los toques se comprueban contra BOTONES.
'use strict';

const COL = { fondo: '#150b21', tray: '#26143c', trayHi: '#3e2363', tinta: '#fff6ea', tenue: '#cdb9ea', oro: '#ffcb3d', naranja: '#ff7a1a', naranjaO: '#b8380f', azul: '#5b4bd6', azulO: '#2e2380', verde: '#2f9e3a', verdeO: '#1d5a26', gris: '#4a3a5e', grisO: '#2a1f3a' };
const PANEL = { modo: 'inicio', titulo: '', texto: '', opciones: [], habs: [], cofre: false, t0: 0, elegida: -1 };
const LOG = [];
let BOTONES = [], MONEDERO = [170, 6], PULSA = null, SALIR = -1e9;
// las letras para explicar: la normal y la pequeña (si con la normal no cabe). Nada se corta nunca
const LETRAS = {
  n: { linea: LINEA, env: (s, w) => (s ? envuelve(s, w) : []), pinta: (ctx, s, x, y, c, borde) => escribe(ctx, s, x, y, { c, borde }) },
  m: { linea: 7, env: (s, w) => envuelveMini(s, w), pinta: (ctx, s, x, y, c) => escribeMini(ctx, s, x, y + 1, c) },
};
const CORTES = [];   // para las pruebas: lo que no ha cabido ni con la letra pequeña (tiene que quedarse vacío)
function corte(que) { const q = String(tr(que || '?')).slice(0, 50); if (!CORTES.includes(q) && CORTES.length < 40) CORTES.push(q); }
const PANEL_Y = ESC.Y + ESC.H;   // (si hay barra, todo lo de debajo va bajado BARRA.h)

const formatea = (s, v) => v ? s.replace(/\{(\w+)\}/g, (m, k) => (v[k] !== undefined ? v[k] : m)) : s;
function log(txt, v) { LOG.push({ txt: formatea(tr(txt), v), t0: RELOJ.t }); if (LOG.length > 60) LOG.shift(); }
function panelOpciones(titulo, texto, opciones) {
  Object.assign(PANEL, { modo: 'opciones', titulo, texto, opciones, t0: RELOJ.t, elegida: -1 });
  return esperaEleccion().then(i => { PANEL.modo = 'log'; return i; });
}
function escoge(i) {
  if (PANEL.elegida >= 0) return;
  if (PANEL.modo === 'opciones' && PANEL.opciones[i] && PANEL.opciones[i].no) { sonido('no'); return; }
  PANEL.elegida = i; sonido('elige');
  espera(0.2).then(() => elige(i)).catch(() => {});
}

/* ---------- descripciones ---------- */
// lo que hace una habilidad en el nivel n (total: para las que suman, lo que llevas en total)
function descHab(id, n, total) {
  const d = HABILIDADES[id]; n = Math.max(1, Math.min(NIVEL_MAX_HAB, n));
  if (Array.isArray(d.d)) return tr(d.d[n - 1]);
  return formatea(tr(d.d), { v: total && d.suma ? d.v.slice(0, n).reduce((a, b) => a + b, 0) : d.v[n - 1] });
}
const CAMPOS_OBJ = [['atq', '+{n} de ataque'], ['vida', '+{n} de vida máxima'], ['crit', '+{n} % de crítico'], ['def', '-{n} de daño recibido'], ['monedas', '+{n} % de monedas'], ['suerte', '+{n} % de suerte']];
const descObjeto = id => CAMPOS_OBJ.filter(([k]) => OBJETOS[id][k]).map(([k, t]) => formatea(tr(t), { n: OBJETOS[id][k] })).join(', ') + '.';

/* ---------- piezas de dibujo ---------- */
function marco(ctx, x, y, w, h, fondo, borde = OL) {
  ctx.fillStyle = borde; ctx.fillRect(x + 1, y, w - 2, h); ctx.fillRect(x, y + 1, w, h - 2);
  ctx.fillStyle = fondo; ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
}
let DESPL = 0;   // cuánto está bajada la escena por la barra (para los toques)
const pulsado = (x, y) => PULSA && PULSA.x === x && PULSA.y === y + DESPL && performance.now() - PULSA.t < 140;
// un botón de canto grueso, como una tecla; devuelve cuánto se ha hundido
function botonPx(ctx, x, y, w, h, col, colO, f) {
  BOTONES.push({ x, y, w, h, f });
  const dy = pulsado(x, y) ? 2 : 0;
  marco(ctx, x, y + 2, w, h - 2, colO);
  marco(ctx, x, y + dy, w, h - 2, col);
  ctx.fillStyle = mezcla(col, '#ffffff', 0.35); ctx.fillRect(x + 2, y + dy + 1, w - 4, 1);
  return dy;
}
// botón con su texto centrado
function botonTxt(ctx, x, y, w, h, txt, col, colO, f, c = COL.tinta) {
  const dy = botonPx(ctx, x, y, w, h, col, colO, f);
  escribe(ctx, txt, x + w / 2, y + Math.round((h - 2) / 2) - 4 + dy, { alin: 'centro', c });
}
// icono de habilidad u objeto en su marco del color de la rareza; nivel: puntitos dorados abajo
function iconoCosa(ctx, id, x, y, tam = 22, nivel = 0) {
  const r = RAREZA[(HABILIDADES[id] || OBJETOS[id]).rar];
  marco(ctx, x, y, tam, tam, r[2]);
  ctx.fillStyle = mezcla(r[2], '#ffffff', 0.18); ctx.fillRect(x + 1, y + 1, tam - 2, 1);
  pintaSpr(ctx, SPR.icono[id], x + tam / 2, y + tam / 2);
  for (let i = 0; i < nivel; i++) { const px = x + Math.round(tam / 2) - nivel * 2 + i * 4; ctx.fillStyle = OL; ctx.fillRect(px - 1, y + tam - 4, 4, 4); ctx.fillStyle = COL.oro; ctx.fillRect(px, y + tam - 3, 2, 2); }
}
function huecoVacio(ctx, hueco, x, y, tam) {
  marco(ctx, x, y, tam, tam, '#1c0f2e', '#3a2058');
  pintaSpr(ctx, SPR.icono['h_' + hueco], x + tam / 2, y + tam / 2);
}
// letras que bailan (títulos)
function ondula(ctx, txt, cx, y, esc, c, c2, fase = 0, amp = 2) {
  const t = limpiaTexto(txt);
  let x = Math.round(cx - anchoTexto(t, esc) / 2), i = 0;
  for (const ch of t) { escribe(ctx, ch, x, y + Math.round(Math.sin(RELOJ.t * 5 + i * 0.7 + fase) * amp), { esc, c, c2 }); x += (anchoLetra(ch) + 1) * esc; i++; }
}
// monedas con su icono (alineadas a la derecha en x)
function monedasEn(ctx, n, x, y, c = COL.oro) {
  const m = String(n), w = anchoTexto(m);
  escribe(ctx, m, x, y, { alin: 'der', c });
  pintaSpr(ctx, SPR.icono.moneda, x - w - 5, y + 3);
  return w + 10;
}

/* ---------- el marcador de arriba ---------- */
function pintaHud(ctx) {
  const W = PAN.W;
  ctx.fillStyle = COL.fondo; ctx.fillRect(0, 0, W, ESC.Y);
  ctx.fillStyle = OL; ctx.fillRect(0, ESC.Y - 1, W, 1);
  if (!H || VIAJE.modo === 'menu') {
    escribe(ctx, tr('La Madriguera'), 4, 3, { c: COL.oro });
    monedasEn(ctx, GUARDA.monedas, W - 4, 3); MONEDERO = [W - 9 - anchoTexto(String(GUARDA.monedas)), 6];
    escribe(ctx, tr('Fans of Roguelite'), W / 2, 14, { alin: 'centro', c: COL.tenue });
    return;
  }
  const dia = escribe(ctx, formatea(tr('Día {n}/{t}'), { n: VIAJE.dia, t: MUNDOS[VIAJE.mundo].dias }), 4, 3, { c: COL.oro });
  escribe(ctx, formatea(tr('Nv {n}'), { n: H.nivel }), 4 + dia + 8, 3, { c: COL.tenue });
  monedasEn(ctx, H.monedas, W - 4, 3); MONEDERO = [W - 9 - anchoTexto(String(H.monedas)), 6];
  pintaSpr(ctx, SPR.icono.corazon, 9, 16);
  const bx = 17, by = 13, bw = W - 17 - 44, bh = 7, k = Math.max(0, H.vida / H.vidaMax), kv = Math.max(0, Math.min(1, H.vidaVista / H.vidaMax));
  ctx.fillStyle = OL; ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
  ctx.fillStyle = '#3a1020'; ctx.fillRect(bx, by, bw, bh);
  if (kv > k) { ctx.fillStyle = '#fff6ea'; ctx.fillRect(bx, by, Math.round(bw * kv), bh); }
  const poca = k < 0.3 && Math.floor(RELOJ.t * 6) % 2;
  ctx.fillStyle = poca ? '#ff8a94' : '#ff3348'; ctx.fillRect(bx, by, Math.round(bw * k), bh);
  ctx.fillStyle = '#ff9aa4'; ctx.fillRect(bx, by, Math.round(bw * k), 2);
  ctx.fillStyle = '#c41a30'; ctx.fillRect(bx, by + bh - 1, Math.round(bw * k), 1);
  const esc = COMBATE.c && COMBATE.c.escudo > 0 ? COMBATE.c.escudo : 0;
  if (esc) { const ew = Math.max(2, Math.round(bw * Math.min(1, esc / H.vidaMax))), ex = Math.min(bx + bw - ew, bx + Math.round(bw * k)); ctx.fillStyle = '#5aaeff'; ctx.fillRect(ex, by, ew, bh); ctx.fillStyle = '#c8e4ff'; ctx.fillRect(ex, by, ew, 2); }
  for (let v = 25; v < H.vidaMax; v += 25) { ctx.fillStyle = 'rgba(32,16,44,0.5)'; ctx.fillRect(bx + Math.round(bw * v / H.vidaMax), by + 2, 1, bh - 2); }
  escribe(ctx, `${Math.max(0, Math.ceil(H.vida))}/${H.vidaMax}`, W - 4, 13, { alin: 'der' });
  // la experiencia: una barrita azul debajo
  const kx = Math.min(1, H.xp / xpPara(H.nivel));
  ctx.fillStyle = OL; ctx.fillRect(bx - 1, 22, bw + 2, 4);
  ctx.fillStyle = '#1a1a40'; ctx.fillRect(bx, 23, bw, 2);
  ctx.fillStyle = '#5aaeff'; ctx.fillRect(bx, 23, Math.round(bw * kx), 2);
  ctx.fillStyle = '#c8e4ff'; ctx.fillRect(bx, 23, Math.round(bw * kx), 1);
}

/* ---------- lo que se pinta encima de la escena ---------- */
function pintaEscenaUI(ctx) {
  const W = PAN.W;
  if (VIAJE.modo === 'menu') pintaMenuEscena(ctx);
  const c = VIAJE.cartel;
  if (c) {
    const t = RELOJ.t - c.t0;
    const dura = c.cap ? 3.6 : 3.0;
    if (t > dura) VIAJE.cartel = null;
    else {
      const entra_ = sale(Math.min(1, t / 0.3)), fuera = t > dura - 0.35 ? entra((t - dura + 0.35) / 0.35) : 0;
      const dx = Math.round((1 - entra_) * -W + fuera * W), y = ESC.Y + Math.max(34, ESC.corte + 14), [c1, c2, c3] = c.jefe ? ['#801a2a', '#c43a4a', '#4a0a14'] : ['#4b2580', '#7a2e93', '#2a1050'];
      ctx.fillStyle = OL; ctx.fillRect(dx, y - 2, W, 36);
      ctx.fillStyle = c1; ctx.fillRect(dx, y, W, 32);
      ctx.fillStyle = c2; ctx.fillRect(dx, y, W, 2);
      ctx.fillStyle = c3; ctx.fillRect(dx, y + 30, W, 2);
      ondula(ctx, formatea(tr('Día {n}'), { n: c.n }), W / 2 + dx, y + 2, 2, COL.oro, COL.naranja, 0, 1);
      escribe(ctx, tr(c.titulo), W / 2 + dx, y + 21, { alin: 'centro', c: COL.tinta });
      if (c.cap) {   // al empezar capítulo, una franja dorada debajo con su nombre
        ctx.fillStyle = OL; ctx.fillRect(dx, y + 34, W, 14); ctx.fillStyle = '#b8860b'; ctx.fillRect(dx, y + 35, W, 12); ctx.fillStyle = '#ffcb3d'; ctx.fillRect(dx, y + 35, W, 1);
        escribe(ctx, formatea(tr('Capítulo {n}: {c}'), { n: c.cap.n, c: tr(c.cap.nombre) }), W / 2 + dx, y + 37, { alin: 'centro', c: '#fff6ea' });
      }
    }
  }
  if (VIAJE.fundido > 0) rellenaTrama(ctx, 0, ESC.Y, W, ESC.H, Math.round(VIAJE.fundido * 16), COL.fondo);
  if (DESTELLO) rellenaTrama(ctx, 0, ESC.Y, W, ESC.H, DESTELLO.t > DESTELLO.dur / 2 ? 10 : 5, DESTELLO.color);
  if (VIAJE.glitch > RELOJ.t) pintaGlitch(ctx);
  if (!BARRA.h) pintaControles(ctx, ESC.Y + 4, null);
}
// la barra del directo: casa, EN DIRECTO, velocidad y sonido en la fila y0; el mapa del camino en ym; el chat en yc
function pintaControles(ctx, y0, yc) {
  const W = PAN.W;
  if (VIAJE.modo === 'juego') {
    const armado = performance.now() - SALIR < 2500;
    const dy = botonPx(ctx, 4, y0, 15, 13, armado ? '#c43a4a' : COL.trayHi, armado ? '#6a1020' : OL, () => {
      sonido('toque');
      if (performance.now() - SALIR < 2500) { SALIR = 0; volverMadriguera(); } else { SALIR = performance.now(); }
    });
    pintaSpr(ctx, SPR.icono.casa, 11, y0 + 5 + dy);
    if (armado) escribe(ctx, tr('¿Salir? Toca otra vez'), 22, y0 + 3, { c: '#ffb0b8' });
    else pintaDirecto(ctx, 22, y0 + 1);
    if (yc) pintaChatEscena(ctx, yc, BARRA.lineas);
  }
  if (VIAJE.modo !== 'menu') {
    const dy = botonPx(ctx, W - 40, y0, 20, 13, RELOJ.vel > 1 ? COL.naranja : COL.trayHi, RELOJ.vel > 1 ? COL.naranjaO : OL, () => { RELOJ.vel = RELOJ.vel > 1 ? 1 : 2; GUARDA.vel = RELOJ.vel; guarda(); sonido('toque'); });
    escribe(ctx, RELOJ.vel > 1 ? 'x2' : 'x1', W - 30, y0 + 2 + dy, { alin: 'centro' });
  }
  const dy = botonPx(ctx, W - 17, y0, 13, 13, COL.trayHi, OL, () => { sonidoInicia(); sonidoCambia(); sonido('toque'); });
  pintaSpr(ctx, SON.on ? SPR.icono.sonido : SPR.icono.mudo, W - 11, y0 + 5 + dy);
}
// en pantallas altas, todo eso va en su propia barra entre la vida y la escena, para que la escena se vea entera
const BARRA = { h: 0, chat: false, lineas: 2 };
function pintaBarra(ctx) {
  const W = PAN.W, y = ESC.Y;
  ctx.fillStyle = COL.fondo; ctx.fillRect(0, y, W, BARRA.h);
  if (BARRA.chat) { ctx.fillStyle = '#1c0f2e'; ctx.fillRect(0, y + 17, W, BARRA.h - 17); }
  ctx.fillStyle = OL; ctx.fillRect(0, y + BARRA.h - 1, W, 1);
  pintaControles(ctx, y + 2, BARRA.chat ? y + 19 : null);
}

// el bug de Microblizz: franjas de colores que tiemblan sobre la escena
function pintaGlitch(ctx) {
  const W = PAN.W;
  for (let i = 0; i < 9; i++) {
    const y = ESC.Y + Math.floor(Math.random() * ESC.H), h = 1 + Math.floor(Math.random() * 6), dx = Math.floor(Math.random() * 16) - 8;
    ctx.drawImage(ctx.canvas, 0, y, W, h, dx, y, W, h);
    if (Math.random() < 0.4) { ctx.fillStyle = ['#33e0ff', '#ff3348', '#7be04a', '#ff7aa8'][i % 4]; ctx.fillRect(Math.floor(Math.random() * W), y, 6 + Math.floor(Math.random() * 30), 1); }
  }
}

/* ---------- el panel de abajo ---------- */
function pintaPanel(ctx) {
  const W = PAN.W, y0 = PANEL_Y, h = PAN.H - y0;
  ctx.fillStyle = OL; ctx.fillRect(0, y0, W, h);
  marco(ctx, 2, y0 + 2, W - 4, h - 4, COL.tray, '#3a2058');
  ctx.fillStyle = COL.trayHi; ctx.fillRect(4, y0 + 3, W - 8, 1);
  const f = { opciones: panelElige, habilidad: panelHabs, objeto: panelObj, fin: panelFin, log: panelLog }[PANEL.modo];
  if (!f) return pintaPanelMenu(ctx, W, y0, h);
  const yFin = f(ctx, W, y0, h);
  PANEL.yFin = yFin; PANEL.hueco = PAN.H;   // hasta dónde llega lo pintado y el sitio que había (para las pruebas)
}

// tus objetos y habilidades en fila (tocar uno lo explica abajo); devuelve el alto usado
function filaCosas(ctx, x0, y, W, tam = 20, maxFilas = 2) {
  const paso = tam + 1, ids = Object.keys(H.habs);
  HUECOS.forEach((k, i) => {
    const bx = x0 + i * paso, id = H.objs[k];
    if (id) { BOTONES.push({ x: bx, y, w: tam, h: tam, f: () => { log('{q}: {d}', { q: tr(OBJETOS[id].n), d: descObjeto(id) }); sonido('toque'); } }); iconoCosa(ctx, id, bx, y, tam); }
    else huecoVacio(ctx, k, bx, y, tam);
  });
  const cabe1 = Math.floor((W - 6 - (x0 + 3 * paso + 5)) / paso), cabe = Math.floor((W - 6 - x0) / paso);
  let filas = 1, x = x0 + 3 * paso + 5, yy = y, n = 0, puestos = 0;
  for (const id of ids) {
    if (n >= (filas === 1 ? cabe1 : cabe)) { if (filas >= maxFilas) break; filas++; x = x0; yy += paso; n = 0; }
    const bx = x, by = yy;
    BOTONES.push({ x: bx, y: by, w: tam, h: tam, f: () => { const nv = H.habs[id]; log('{q} (Nv {n}): {d}', { q: tr(HABILIDADES[id].n), n: nv, d: descHab(id, nv, true) }); sonido('toque'); } });
    iconoCosa(ctx, id, bx, by, tam, H.habs[id]);
    x += paso; n++; puestos++;
  }
  if (puestos < ids.length) escribe(ctx, '+' + (ids.length - puestos), W - 8, yy + tam - 8, { alin: 'der', c: COL.oro });
  return (yy - y) + tam + 4;
}

// el chat del directo, con tus objetos y habilidades encima
function panelLog(ctx, W, y0) {
  let y = y0 + 6;
  if (H) y += filaCosas(ctx, 6, y, W);
  pintaChat(ctx, W, y, PAN.H - 5);
}

// elegir entre opciones (encuentros, tienda, ruleta…); o.precio pinta las monedas y o.no la apaga
function panelElige(ctx, W, y0) {
  const t = RELOJ.t - PANEL.t0, L = medidaElige(W);
  let y = y0 + 8;
  escribe(ctx, tr(PANEL.titulo), W / 2, y, { alin: 'centro', c: COL.oro }); y += LINEA + 3;
  for (const l of L.texto) { L.ft.pinta(ctx, l, 8, y, COL.tinta); y += L.ft.linea; }
  y += 3;
  PANEL.opciones.forEach((o, i) => {
    const bh = L.altos[i], k = sale(Math.max(0, Math.min(1, (t - i * 0.1) / 0.28)));
    const x = 6 + Math.round((1 - k) * W), base = [[COL.naranja, COL.naranjaO], [COL.azul, COL.azulO], [COL.verde, COL.verdeO], [COL.gris, COL.grisO]][i % 4];
    const [col, colO] = o.no ? [COL.gris, COL.grisO] : base;
    const elegida = PANEL.elegida === i, otra = PANEL.elegida >= 0 && !elegida;
    const dy = botonPx(ctx, x, y, W - 12, bh, otra ? COL.trayHi : elegida ? mezcla(col, '#ffffff', 0.3) : col, colO, () => escoge(i));
    L.nombres[i].forEach((l, j) => escribe(ctx, l, x + 7, y + 4 + j * LINEA + dy, { c: o.no ? '#9a8ab0' : COL.tinta }));
    if (o.precio) monedasEn(ctx, o.precio, x + W - 20, y + 4 + dy, o.no ? '#ff8a94' : COL.oro);
    else escribe(ctx, String(i + 1), x + W - 20, y + 4 + dy, { c: mezcla(col, '#ffffff', 0.5), alin: 'der' });
    const yd = y + 13 + (L.nombres[i].length - 1) * LINEA;
    L.cajas[i].forEach((l, j) => L.fd.pinta(ctx, l, x + 7, yd + j * L.fd.linea + dy, o.no ? '#b8a8c8' : '#ffe8d8', mezcla(colO, OL, 0.4)));
    y += bh + 3;
  });
  return y;
}
// cómo se reparte: todo con la letra normal si cabe; si no, el texto de arriba y luego las explicaciones en pequeño.
// «ideal» = lo que ocuparía con la letra normal (para pedir sitio a la escena)
function medidaElige(W, ideal) {
  const nombres = PANEL.opciones.map(o => envuelve(tr(o.n), W - 30 - (o.precio ? anchoTexto(String(o.precio)) + 14 : 10)));
  const prueba = (ft, fd) => {
    const texto = ft.env(tr(PANEL.texto), W - 16), cajas = PANEL.opciones.map(o => fd.env(tr(o.d || ''), W - 30));
    const altos = cajas.map((ls, i) => 13 + (nombres[i].length - 1) * LINEA + ls.length * fd.linea + (ls.length ? 3 : 1));
    return { ft, fd, texto, cajas, nombres, altos, alto: 8 + LINEA + 3 + texto.length * ft.linea + 3 + altos.reduce((s, h) => s + h + 3, 0) + 3 };
  };
  const N = LETRAS.n, P = LETRAS.m;
  if (ideal) return prueba(N, N);
  return eligeMedida([() => prueba(N, N), () => prueba(P, N), () => prueba(P, P)], PANEL.titulo);
}
// la primera manera de repartir que cabe en el panel (y, si ninguna, la última y se apunta para las pruebas)
function eligeMedida(maneras, que) {
  const sitio = PAN.H - PANEL_Y;
  let m;
  for (const f of maneras) { m = f(); if (m.alto <= sitio) return m; }
  corte(que);
  return m;
}

// un toque en la pantalla (x, y en píxeles del juego)
function toque(x, y) {
  for (let i = BOTONES.length - 1; i >= 0; i--) {
    const b = BOTONES[i];
    if (x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h) { PULSA = { x: b.x, y: b.y, t: performance.now() }; b.f(); return; }
  }
}
// teclado: 1, 2, 3 y 4 eligen
function tecla(k) {
  const lista = PANEL.modo === 'opciones' ? PANEL.opciones : PANEL.modo === 'habilidad' ? PANEL.habs : PANEL.modo === 'objeto' ? [0, 1] : null;
  if (lista && /^[1-4]$/.test(k) && +k <= lista.length) escoge(+k - 1);
}
