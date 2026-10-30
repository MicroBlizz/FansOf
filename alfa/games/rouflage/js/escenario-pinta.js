// Fans of Rouflage · MI ESCENARIO (dibujo y datos): la pintura del jugador (una rejilla de celdas de r unidades sobre todo el mapa, con el
// índice de su color), los muebles (ordenados por su base, con los personajes) y los datos compactos para enseñárselo a otros.
// escenarioDatos() da un JSON de lo que tiene el jugador (< SALA.MAX_DATOS caracteres: si no cabe, la pintura baja de resolución) y
// escenarioPinta(c, datos, op) dibuja un TROZO del escenario de unos datos (quizá de otro jugador: la sala de espera, sala-escenario.js) en
// c, ya puesto en unidades del trozo (0..SALA.W × 0..SALA.H). El fondo del trozo va en caché: solo se rehace si cambian los datos o la escala.
// Los datos viejos (v 1: la sala pequeña de 520 × 540) se pasan solos al mapa grande: sus muebles y su pintura caen en la primera sala.
'use strict';
// SALA: el trozo que se enseña (y las medidas de la sala pequeña de antes, para pasar sus datos); el mapa entero mide ESC_W × ESC_H
const SALA = { W: 520, H: 540, X0: 20, Y0: 20, X1: 500, Y1: 520, PY: 100, MAX_MUEBLES: 80, PR: 2, MAX_DATOS: 5800 };
const ESC_W = 1680, ESC_H = 1200;
const ESC_A64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

/* ---------- la pintura ---------- */
function pinturaNueva(r = SALA.PR) { const w = Math.ceil(ESC_W / r), h = Math.ceil(ESC_H / r); return { r, w, h, pal: [], cel: new Uint8Array(w * h), ver: 0 }; }
function pinturaHay(p) { if (!p || !p.pal.length) return false; if (p._hayV !== p.ver) { p._hay = p.cel.some(v => v); p._hayV = p.ver; } return p._hay; }
// a texto: «r,w,h,colores,tiradas» (cada tirada: el índice y su largo en base 32 con continuación)
function pinturaCodifica(p) {
  const usados = new Map(), pal = [];
  for (let i = 0; i < p.cel.length; i++) { const v = p.cel[i]; if (v && !usados.has(v)) { usados.set(v, pal.length + 1); pal.push(p.pal[v - 1].slice(1)); } }
  if (!pal.length) return '';
  let s = '', i = 0;
  while (i < p.cel.length) {
    const v = p.cel[i]; let n = 1; while (i + n < p.cel.length && p.cel[i + n] === v) n++;
    s += ESC_A64[v ? usados.get(v) : 0]; let k = n - 1; while (k >= 32) { s += ESC_A64[(k & 31) | 32]; k >>= 5; } s += ESC_A64[k];
    i += n;
  }
  return [p.r, p.w, p.h, pal.join('.'), s].join(',');
}
function pinturaDecodifica(txt) {
  const q = String(txt || '').split(','); if (q.length < 5) return null;
  const r = +q[0], w = +q[1], h = +q[2]; if (!(r > 0 && w > 0 && h > 0 && w * h <= 1100000)) return null;
  const p = { r, w, h, pal: q[3].split('.').filter(x => /^[0-9a-f]{6}$/i.test(x)).map(x => '#' + x.toLowerCase()), cel: new Uint8Array(w * h), ver: 0 }, s = q[4];
  let i = 0, j = 0;
  while (j < s.length && i < p.cel.length) {
    const v = ESC_A64.indexOf(s[j++]); let n = 0, sh = 0, d;
    do { d = ESC_A64.indexOf(s[j++]); if (d < 0) return p; n |= (d & 31) << sh; sh += 5; } while (d & 32);
    p.cel.fill(v > p.pal.length ? 0 : v, i, Math.min(p.cel.length, i + n + 1)); i += n + 1;
  }
  return p;
}
// la misma pintura en otra rejilla del mapa (más fina o más gruesa), movida (dx, dy) unidades: cada celda nueva coge lo que más hay debajo
function pinturaRemuestra(p, r, dx = 0, dy = 0) {
  const q = pinturaNueva(r); q.pal = p.pal.slice();
  const cuenta = new Uint16Array(p.pal.length + 1);
  for (let j = 0; j < q.h; j++) for (let i = 0; i < q.w; i++) {
    const x0 = i * r - dx, y0 = j * r - dy;
    if (x0 + r <= 0 || y0 + r <= 0 || x0 >= p.w * p.r || y0 >= p.h * p.r) continue;
    const a0 = Math.max(0, Math.floor(x0 / p.r)), a1 = Math.max(a0 + 1, Math.floor((x0 + r) / p.r)), b0 = Math.max(0, Math.floor(y0 / p.r)), b1 = Math.max(b0 + 1, Math.floor((y0 + r) / p.r));
    cuenta.fill(0); let mejor = 0, mv = -1;
    for (let b = b0; b < b1 && b < p.h; b++) for (let a = a0; a < a1 && a < p.w; a++) cuenta[p.cel[b * p.w + a]]++;
    for (let v = 0; v < cuenta.length; v++) if (cuenta[v] > mv) { mv = cuenta[v]; mejor = v; }
    q.cel[j * q.w + i] = mejor;
  }
  return q;
}
// la pintura hecha imagen (un píxel por celda) y su silueta oscura (la sombrita de debajo)
function pinturaLienzo(p) {
  if (p._cv && p._ver === p.ver) return p._cv;
  if (!p._cv) [p._cv, p._g] = lienzo(p.w, p.h);
  const d = p._g.createImageData(p.w, p.h), cols = p.pal.map(hexRgb);
  for (let i = 0; i < p.cel.length; i++) { const v = p.cel[i]; if (!v) continue; const [r, g, b] = cols[v - 1], k = i * 4; d.data[k] = r; d.data[k + 1] = g; d.data[k + 2] = b; d.data[k + 3] = 255; }
  p._g.putImageData(d, 0, 0); p._ver = p.ver; return p._cv;
}
function pinturaSombra(p) {
  if (p._sombra && p._sver === p.ver) return p._sombra;
  if (!p._sombra) [p._sombra, p._sg] = lienzo(p.w, p.h);
  const g = p._sg; g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, p.w, p.h); g.drawImage(pinturaLienzo(p), 0, 0);
  g.globalCompositeOperation = 'source-in'; g.fillStyle = OL; g.fillRect(0, 0, p.w, p.h); g.globalCompositeOperation = 'source-over'; p._sver = p.ver;
  return p._sombra;
}

/* ---------- los muebles ---------- */
// el dibujo de un mueble (tipo y variante), en caché por escala, con su caja de dibujo
const _escSprites = {};
function muebleSprite(t, v, k) {
  const T = TIPOS_MUEBLE[t], clave = t + ':' + v + ':' + k; if (_escSprites[clave]) return _escSprites[clave];
  const ox = T.w / 2 + 14, oy = (T.tope || T.d + T.h) + 6, [cv, g] = lienzo((ox * 2) * k, (oy + 8) * k);
  g.scale(k, k); g.translate(ox, oy); try { T.pinta(g, { t, v, x: 0, y: 0, T }); } catch (e) { console.warn('[escenario]', e); }
  return (_escSprites[clave] = { cv, ox, oy, w: ox * 2, h: oy + 8 });
}
// los muebles (y los personajes y el armario) que caen en el trozo R, de atrás adelante, en c ya en unidades del mundo.
// op: { k (escala de los dibujos), personajes: [{ x, y, pinta(c) }], sel (mueble marcado), pops: { índice: escala }, armario: f(c) }
function salaPintaCosas(c, sala, R, op = {}) {
  const k = op.k || 1, cosas = [];
  sala.muebles.forEach((m, i) => {
    const M = MUEBLES_SALA[m.id], T = M && TIPOS_MUEBLE[M.t]; if (!T) return;
    if (m.x + T.w / 2 + 20 < R.x0 || m.x - T.w / 2 - 20 > R.x1 || m.y + 20 < R.y0 || m.y - (T.tope || T.d + T.h) - 20 > R.y1) return;
    cosas.push({ y: m.y, m, T, M, i });
  });
  c.fillStyle = 'rgba(24,12,40,0.24)';
  for (const o of cosas) { c.beginPath(); rrPathRF(c, o.m.x - o.T.w / 2 - 3, o.m.y - o.T.d + 4, o.T.w + 6, o.T.d + 1, 7); c.fill(); }
  for (const p of op.personajes || []) cosas.push({ y: p.y, p });
  cosas.sort((a, b) => a.y - b.y);
  for (const o of cosas) {
    if (o.p) { o.p.pinta(c); continue; }
    const s = muebleSprite(o.M.t, (o.m.v || 0) % Math.max(1, o.M.vars), k);
    c.save(); c.translate(o.m.x, o.m.y); if (o.m.f) c.scale(-1, 1);
    const pop = op.pops && op.pops[o.i]; if (pop) c.scale(pop, 1 + (pop - 1) * 0.6);      // el «pop» al soltarlo
    if (o.m === op.sel) { c.shadowColor = '#ffcb3d'; c.shadowBlur = 14 * k; }
    c.drawImage(s.cv, -s.ox, -s.oy, s.w, s.h); c.restore();
  }
}
// las Backrooms: los fluorescentes parpadean de vez en cuando (sobre el trozo R)
function salaZumbido(c, sala, R, t) {
  if (!(ESCENARIOS[escBase(sala.id)] || {}).zumbido || t === undefined) return;
  const f = Math.sin(t * 31) > 0.6 && Math.sin(t * 1.7) > 0.8 ? 0.1 : 0.03 + Math.sin(t * 2.3) * 0.015;
  c.fillStyle = `rgba(255,236,140,${f})`; c.fillRect(R.x0, R.y0, R.x1 - R.x0, R.y1 - R.y0);
}

/* ---------- los datos ---------- */
// sala = { id, muebles: [{ id, x, y, v, f }], pint, ver }. Los datos: { v: 2, e: escenario, m: [[mueble, x, y, variante, volteado]], p: pintura }
function salaDeDatos(d) {
  if (!d || typeof d !== 'object') return null;
  let id = ESCENARIOS[d.e] ? d.e : ESCENARIOS[d.id] ? d.id : 'oficina';
  if (id === 'lienzo') id = lzDeDatos(d.lz);      // un lienzo: su forma viene en d.lz (escenario-obra.js)
  const M = escMundo(id), viejo = d.v !== 2;
  const dx = viejo ? M.origen[0] - SALA.X0 : 0, dy = viejo ? M.origen[1] - SALA.PY : 0, muebles = [];
  for (const q of Array.isArray(d.m) ? d.m.slice(0, SALA.MAX_MUEBLES) : []) {
    if (!Array.isArray(q) || !MUEBLES_SALA[q[0]]) continue;
    muebles.push({ id: q[0], x: limita((+q[1] || 0) + dx, 0, M.W), y: limita((+q[2] || 0) + dy, 0, M.H), v: (+q[3] | 0) % 8, f: q[4] ? 1 : 0 });
  }
  let pint = null;
  try { const t = escPinturaTexto(d); pint = t ? pinturaDecodifica(t) : null; } catch (_) { pint = null; }      // comprimida (pz) o como antes (p): escenario-comprime.js
  if (pint && viejo) pint = pinturaRemuestra(pint, SALA.PR, dx + SALA.X0, dy + SALA.Y0);      // la sala pequeña empezaba en (X0, Y0)
  else if (pint && (pint.w !== Math.ceil(ESC_W / pint.r) || pint.h !== Math.ceil(ESC_H / pint.r))) pint = null;
  const sala = { id, muebles, pint, ver: 0, peg: typeof pegDeDatos === 'function' ? pegDeDatos(d.g) : [] };      // (las pegatinas: escenario-pegatinas.js)
  if (viejo) escRecoloca(sala);
  return sala;
}
function salaADatos(sala, maxBytes = SALA.MAX_DATOS) {
  const d = { v: 2, e: escBase(sala.id), m: sala.muebles.slice(0, SALA.MAX_MUEBLES).map(m => [m.id, Math.round(m.x), Math.round(m.y), m.v || 0, m.f ? 1 : 0]) };
  if (escBase(sala.id) === 'lienzo' && ESC_LZ[sala.id]) d.lz = lzCodifica(ESC_LZ[sala.id]);
  if (sala.peg && sala.peg.length) d.g = pegADatos(sala.peg);      // las pegatinas      // la forma del lienzo viaja con él
  if (pinturaHay(sala.pint)) for (const r of [SALA.PR, 3, 4, 5, 6, 8, 10, 12, 15, 20, 24, 30, 40, 60]) {      // con todo su detalle si cabe (comprimida: escenario-comprime.js)
    const t = pinturaCodifica(r === sala.pint.r ? sala.pint : pinturaRemuestra(sala.pint, r)), z = escComprime(t);
    if (z && z.length < t.length) { d.pz = z; delete d.p; } else { d.p = t; delete d.pz; }
    if (JSON.stringify(d).length <= maxBytes) break;
  }
  if (JSON.stringify(d).length > maxBytes) { delete d.p; delete d.pz; }
  return d;
}
// ¿cabe este mueble aquí? Su base entera en el suelo, sin pisar a otro mueble ni al armario (el que se mueve no cuenta)
function escCabeEn(sala, m, sin) {
  const M = escMundo(sala.id), T = TIPOS_MUEBLE[MUEBLES_SALA[m.id].t], x0 = m.x - T.w / 2, x1 = m.x + T.w / 2, y0 = m.y - T.d, y1 = m.y;
  if (!escSueloCaja(M, x0 + 2, y0 + 2, x1 - 2, y1)) return false;
  const a = M.armario; if (x0 < a.x + 30 && x1 > a.x - 30 && y0 < a.y + 4 && y1 > a.y - 24) return false;
  return !sala.muebles.some(o => {
    if (o === m || o === sin) return false;
    const U = TIPOS_MUEBLE[MUEBLES_SALA[o.id].t];
    return x0 < o.x + U.w / 2 - 2 && x1 > o.x - U.w / 2 + 2 && y0 < o.y - 2 && y1 > o.y - U.d + 2;
  });
}
// el hueco libre más cercano a (x, y) para el mueble m (en espiral, de 20 en 20 unidades), o null
function escHueco(sala, m, x, y, max = 900) {
  const q = Object.assign({}, m);
  for (let r = 0; r <= max; r += 20) {
    const n = r ? Math.max(6, Math.round(TAU * r / 20)) : 1;
    for (let k = 0; k < n; k++) { const a = k / n * TAU; q.x = Math.round(x + Math.cos(a) * r); q.y = Math.round(y + Math.sin(a) * r * 0.8); if (escCabeEn(sala, q, m)) return [q.x, q.y]; }
  }
  return null;
}
// los muebles que no caben donde están (al pasar los datos viejos o cambiar de forma) se van al hueco libre más cercano
function escRecoloca(sala) {
  let movidos = 0;
  for (const m of sala.muebles) {
    if (escCabeEn(sala, m)) continue;
    const h = escHueco(sala, m, m.x, m.y); if (h) { [m.x, m.y] = h; movidos++; }
  }
  if (movidos) sala.ver = (sala.ver || 0) + 1;
  return movidos;
}
// lo que tiene el jugador, en compacto (< SALA.MAX_DATOS caracteres); se recalcula solo si algo ha cambiado
const _escDatos = { clave: '', d: null };
function escenarioDatos() {
  const s = escenarioSala(), clave = [s.id, s.ver, s.pint ? s.pint.ver : 0, s.muebles.length, s.muebles.map(m => m.x + ',' + m.y + ',' + (m.v || 0) + (m.f ? 'f' : '')).join(';'), JSON.stringify(s.peg || [])].join('|');
  if (_escDatos.clave !== clave) { _escDatos.clave = clave; _escDatos.d = salaADatos(s); }
  return JSON.parse(JSON.stringify(_escDatos.d));
}
// el trozo de SALA.W × SALA.H donde más muebles hay (lo que se enseña si no se dice otro centro)
function salaCentro(sala) {
  if (sala._centro) return sala._centro;
  const M = escMundo(sala.id); let mejor = [M.origen[0] + SALA.W / 2 - 20, M.origen[1] + SALA.H / 2 - 100], mv = 0;
  for (let y = SALA.H / 2; y <= M.H - SALA.H / 2; y += 60) for (let x = SALA.W / 2; x <= M.W - SALA.W / 2; x += 60) {
    let n = 0; for (const m of sala.muebles) if (Math.abs(m.x - x) < SALA.W / 2 - 30 && Math.abs(m.y - y) < SALA.H / 2 - 30) n++;
    if (n > mv) { mv = n; mejor = [x, y]; }
  }
  return (sala._centro = { x: mejor[0], y: mejor[1] });
}
const _escMemo = { txt: null, sala: null };
// pinta un trozo del escenario de unos datos (de escenarioDatos, quizá de otro jugador) en c, ya puesto en unidades del trozo (0..SALA.W × 0..SALA.H).
// op: { k: escala de la caché (píxeles por unidad; si no, la de c), personajes: [{ x, y, pinta(c) }] (en unidades del trozo; se ordenan con los
// muebles), t: segundos (animación), centro: { x, y } del mapa que cae en el centro del trozo (si no, donde más muebles hay) }
function escenarioPinta(c, datos, op = {}) {
  const txt = typeof datos === 'string' ? datos : JSON.stringify(datos);
  if (_escMemo.txt !== txt) { _escMemo.txt = txt; try { _escMemo.sala = salaDeDatos(typeof datos === 'string' ? JSON.parse(datos) : datos); } catch (_) { _escMemo.sala = null; } }
  const sala = _escMemo.sala; if (!sala) return;
  const M = escMundo(sala.id), ce = op.centro || salaCentro(sala), k = op.k || Math.max(0.25, Math.min(3, Math.round(Math.abs(c.getTransform().a) * 4) / 4));
  const x0 = Math.round(limita(ce.x - SALA.W / 2, 0, M.W - SALA.W)), y0 = Math.round(limita(ce.y - SALA.H / 2, 0, M.H - SALA.H)), R = { x0, y0, x1: x0 + SALA.W, y1: y0 + SALA.H };
  const f = sala._trozo || (sala._trozo = {}), clave = [x0, y0, k, sala.pint ? sala.pint.ver : 0].join(':');
  if (f.clave !== clave) {
    if (!f.cv || f.k !== k) [f.cv, f.g] = lienzo(SALA.W * k, SALA.H * k);
    const g = f.g; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, f.cv.width, f.cv.height); g.scale(k, k); g.translate(-x0, -y0);
    escPintaTrozo(g, M, R, sala.pint, k); f.clave = clave; f.k = k;
  }
  c.drawImage(f.cv, 0, 0, SALA.W, SALA.H);
  c.save(); c.translate(-x0, -y0);
  const pers = (op.personajes || []).map(p => ({ x: p.x + x0, y: p.y + y0, pinta(g) { g.save(); g.translate(x0, y0); p.pinta(g); g.restore(); } }));
  pers.push({ y: M.armario.y, pinta: g => escPintaArmario(g, M.armario, op.t || 0, false) });
  salaPintaCosas(c, sala, R, { k, personajes: pers });
  salaZumbido(c, sala, R, op.t);
  c.restore();
}
// el icono de un escenario (armario y bandeja): la primera sala vacía, de una caché
const _escIconos = {};
function escenarioIcono(c, w, id) {
  if (!_escIconos[id]) {
    const M = escMundo(id), k = 256 / SALA.H, [cv, g] = lienzo(SALA.W * k, 256), x0 = M.origen[0] - SALA.X0, y0 = M.origen[1] - SALA.PY;
    g.scale(k, k); g.translate(-x0, -y0); escPintaTrozo(g, M, { x0, y0, x1: x0 + SALA.W, y1: y0 + SALA.H }, null, k); _escIconos[id] = cv;
  }
  const s = (w - 6) / Math.max(SALA.W, SALA.H), dw = SALA.W * s, dh = SALA.H * s, x = (w - dw) / 2, y = (w - dh) / 2;
  c.save(); c.beginPath(); rrPathRF(c, x, y, dw, dh, w * 0.08); c.clip();
  c.drawImage(_escIconos[id], x, y, dw, dh); c.restore();
  c.lineWidth = Math.max(2, w * 0.04); c.strokeStyle = OL; c.beginPath(); rrPathRF(c, x, y, dw, dh, w * 0.08); c.stroke();
}
// el armario de tu escenario (los pies en a.x, a.y): ahí te cambias de ropa
function escPintaArmario(c, a, t, cerca) {
  const { shape, rr, poly, line, dot } = ARD;
  c.save(); c.translate(a.x, a.y);
  shape(c, ARD.el(0, 1, 30, 7), 'rgba(20,10,40,.3)', 0);
  shape(c, rr(-26, -74, 52, 74, 3), '#b98a4f', 2.6);                      // el mueble
  shape(c, rr(-30, -78, 60, 7, 2), '#9a6a33', 2.2);                        // la cornisa
  shape(c, rr(-23, -70, 22, 64, 2), '#c99a62', 2); shape(c, rr(1, -70, 22, 64, 2), '#c99a62', 2);   // las dos puertas
  for (const x of [-12, 12]) for (let k = -64; k < -10; k += 6) line(c, [x - 8, k, x + 8, k], 'rgba(90,50,10,.25)', 1.2);   // la veta
  dot(c, -4, -38, 2.4, OL); dot(c, 4, -38, 2.4, OL); dot(c, -4, -38, 1.4, '#ffcb3d'); dot(c, 4, -38, 1.4, '#ffcb3d');   // los tiradores
  shape(c, poly(-24, -80, -6, -92, 6, -92, 24, -80), '#ff4b5c', 2);        // un gorro de fiesta encima, para que se vea qué es
  rotulo(c, tr('ARMARIO'), 0, -104 + Math.sin(t * 2) * 1.5, 9, cerca ? '#ffcb3d' : '#fff6ea', OL, LETRA_UI);
  c.restore();
}
