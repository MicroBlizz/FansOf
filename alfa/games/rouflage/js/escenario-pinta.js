// Fans of Rouflage · MI ESCENARIO (dibujo): la sala vacía de un escenario (el muro, la pared de frente con su papel y el suelo, con los mismos
// SUELOS y PAPELES de los mapas), la pintura del jugador encima y los muebles, ordenados por su base. Todo en unidades del mundo: la sala mide
// SALA.W × SALA.H y su interior (pared + suelo) va de SALA.X0,Y0 a SALA.X1,Y1; el suelo empieza en SALA.PY.
// Para otros (la sala de espera del anfitrión): escenarioDatos() da un JSON compacto (< 4 KB, la pintura en baja resolución) de lo que tiene
// el jugador, y escenarioPinta(c, datos, op) lo dibuja en c (ya puesto en unidades del mundo de la sala). Lo de dentro guarda en caché el fondo
// (sala + pintura) por escala: solo se rehace al cambiar algo. El editor está en escenario.js.
'use strict';
const SALA = { W: 520, H: 540, X0: 20, Y0: 20, X1: 500, Y1: 520, PY: 100, MAX_MUEBLES: 40, PR: 2, MAX_DATOS: 4000 };
const ESC_A64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

/* ---------- la sala vacía ---------- */
function escenarioPintaBase(c, id) {
  const E0 = ESCENARIOS[id] || ESCENARIOS.oficina, R = { x0: 0, y0: 0, x1: SALA.W, y1: SALA.H };
  const { X0, Y0, X1, Y1, PY } = SALA;
  c.save(); c.beginPath(); c.rect(0, 0, SALA.W, SALA.H); c.clip();
  c.fillStyle = E0.muro || COLOR_MURO; c.fillRect(0, 0, SALA.W, SALA.H);      // el muro visto desde arriba, con sus chapas
  c.strokeStyle = 'rgba(255,255,255,0.035)'; c.lineWidth = 2; c.beginPath();
  for (let x = 0; x <= SALA.W; x += 60) { c.moveTo(x, 0); c.lineTo(x, SALA.H); }
  for (let y = 0; y <= SALA.H; y += 60) { c.moveTo(0, y); c.lineTo(SALA.W, y); }
  c.stroke();
  c.fillStyle = OL; c.fillRect(X0 - 10, Y0 - 10, X1 - X0 + 20, Y1 - Y0 + 20);
  c.fillStyle = E0.canto || COLOR_CANTO; c.fillRect(X0 - 7, Y0 - 7, X1 - X0 + 14, Y1 - Y0 + 14);
  const z = { id: 'sala', nombre: '', suelo: E0.suelo, pared: E0.pared, px: X0, py: PY, pw: X1 - X0, ph: Y1 - PY, x: X0 / CEL, y: PY / CEL, w: (X1 - X0) / CEL, h: (Y1 - PY) / CEL };
  c.save(); c.beginPath(); c.rect(X0, PY, X1 - X0, Y1 - PY); c.clip();
  try { SUELOS[z.suelo](c, z, R); pintaPatron(c, z, R); pintaLamparas(c, z); } catch (e) { console.warn('[escenario]', e); }
  c.restore();
  const t = { zona: z, x0: X0, x1: X1, y0: Y0, y1: PY };
  c.save(); c.beginPath(); c.rect(X0, Y0, X1 - X0, PY - Y0); c.clip();
  try { PAPELES[z.pared](c, t); } catch (e) { console.warn('[escenario]', e); }
  if (E0.zumbido) for (const x of [110, 260, 410]) { forma(c, caja(x - 34, Y0 + 6, 68, 9, 3), '#fffbd8', 2.5); c.fillStyle = 'rgba(255,250,200,0.25)'; c.fillRect(x - 60, Y0 + 15, 120, 26); }   // los fluorescentes que zumban
  c.restore();
  c.restore();
}
// lo que va encima de la pintura: la sombra de la pared sobre el suelo, el contorno grueso, el grano y una luz suave
function escenarioPintaEncima(c) {
  const { X0, Y0, X1, Y1, PY } = SALA;
  const g = c.createLinearGradient(0, PY, 0, PY + 16); g.addColorStop(0, 'rgba(24,12,40,0.36)'); g.addColorStop(1, 'rgba(24,12,40,0)');
  c.fillStyle = g; c.fillRect(X0, PY, X1 - X0, 16);
  c.fillStyle = 'rgba(24,12,40,0.16)'; c.fillRect(X0, PY, 6, Y1 - PY); c.fillRect(X1 - 6, PY, 6, Y1 - PY);
  c.fillStyle = 'rgba(24,12,40,0.22)'; c.fillRect(X0, PY - 3, X1 - X0, 3);      // el rodapié
  c.save(); c.beginPath(); c.rect(X0, Y0, X1 - X0, Y1 - Y0); c.clip(); pintaGrano(c, { x0: X0, y0: Y0, x1: X1, y1: Y1 }); c.restore();
  c.strokeStyle = OL; c.lineWidth = 3; c.strokeRect(X0, Y0, X1 - X0, Y1 - Y0);
}
// el icono de un escenario (armario y editor): la sala en pequeño, de una caché
const _escIconos = {};
function escenarioIcono(c, w, id) {
  if (!_escIconos[id]) { const k = 256 / SALA.H, [cv, g] = lienzo(SALA.W * k, 256); g.scale(k, k); escenarioPintaBase(g, id); escenarioPintaEncima(g); _escIconos[id] = cv; }
  const s = (w - 6) / Math.max(SALA.W, SALA.H), dw = SALA.W * s, dh = SALA.H * s, x = (w - dw) / 2, y = (w - dh) / 2;
  c.save(); c.beginPath(); rrPathRF(c, x, y, dw, dh, w * 0.08); c.clip();
  c.drawImage(_escIconos[id], x, y, dw, dh); c.restore();
  c.lineWidth = Math.max(2, w * 0.04); c.strokeStyle = OL; c.beginPath(); rrPathRF(c, x, y, dw, dh, w * 0.08); c.stroke();
}

/* ---------- la pintura: una rejilla de celdas de r unidades con el índice de su color (0 = sin pintar) ---------- */
function pinturaNueva(r = SALA.PR) { const w = Math.ceil((SALA.X1 - SALA.X0) / r), h = Math.ceil((SALA.Y1 - SALA.Y0) / r); return { r, w, h, pal: [], cel: new Uint8Array(w * h), ver: 0 }; }
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
  const r = +q[0], w = +q[1], h = +q[2]; if (!(r > 0 && w > 0 && h > 0 && w * h <= 400000)) return null;
  const p = { r, w, h, pal: q[3].split('.').filter(x => /^[0-9a-f]{6}$/i.test(x)).map(x => '#' + x.toLowerCase()), cel: new Uint8Array(w * h), ver: 0 }, s = q[4];
  let i = 0, j = 0;
  while (j < s.length && i < p.cel.length) {
    const v = ESC_A64.indexOf(s[j++]); let n = 0, sh = 0, d;
    do { d = ESC_A64.indexOf(s[j++]); if (d < 0) return p; n |= (d & 31) << sh; sh += 5; } while (d & 32);
    p.cel.fill(v > p.pal.length ? 0 : v, i, Math.min(p.cel.length, i + n + 1)); i += n + 1;
  }
  return p;
}
// la misma pintura en otra rejilla (más fina o más gruesa): cada celda nueva coge lo que más hay debajo
function pinturaRemuestra(p, r) {
  const q = pinturaNueva(r); q.pal = p.pal.slice();
  const cuenta = new Uint16Array(p.pal.length + 1);
  for (let j = 0; j < q.h; j++) for (let i = 0; i < q.w; i++) {
    const a0 = Math.floor(i * r / p.r), a1 = Math.max(a0 + 1, Math.floor((i + 1) * r / p.r)), b0 = Math.floor(j * r / p.r), b1 = Math.max(b0 + 1, Math.floor((j + 1) * r / p.r));
    cuenta.fill(0); let mejor = 0, mv = -1;
    for (let b = b0; b < b1 && b < p.h; b++) for (let a = a0; a < a1 && a < p.w; a++) cuenta[p.cel[b * p.w + a]]++;
    for (let v = 0; v < cuenta.length; v++) if (cuenta[v] > mv) { mv = cuenta[v]; mejor = v; }
    q.cel[j * q.w + i] = mejor;
  }
  return q;
}
// la pintura hecha imagen (un lienzo de w × h píxeles, uno por celda)
function pinturaLienzo(p) {
  if (p._cv && p._ver === p.ver) return p._cv;
  if (!p._cv) [p._cv, p._g] = lienzo(p.w, p.h);
  const d = p._g.createImageData(p.w, p.h), cols = p.pal.map(hexRgb);
  for (let i = 0; i < p.cel.length; i++) { const v = p.cel[i]; if (!v) continue; const [r, g, b] = cols[v - 1], k = i * 4; d.data[k] = r; d.data[k + 1] = g; d.data[k + 2] = b; d.data[k + 3] = 255; }
  p._g.putImageData(d, 0, 0); p._ver = p.ver; return p._cv;
}

/* ---------- la sala entera ---------- */
// sala = { id, muebles: [{ id, x, y, v, f }], pint } (lo de dentro; los datos compactos se pasan con salaDeDatos)
// el fondo (sala vacía + pintura + lo de encima) en caché a la escala k (píxeles por unidad)
function salaFondo(sala, k) {
  const ca = sala._fondo || (sala._fondo = {}), pv = sala.pint ? sala.pint.ver : -1;
  if (ca.cv && ca.k === k && ca.id === sala.id && ca.pv === pv && ca.pint === sala.pint) return ca.cv;
  if (!ca.base || ca.bk !== k || ca.id !== sala.id) { const [b, g] = lienzo(SALA.W * k, SALA.H * k); g.scale(k, k); escenarioPintaBase(g, sala.id); ca.base = b; ca.bk = k; }
  if (!ca.cv || ca.k !== k) [ca.cv, ca.g] = lienzo(SALA.W * k, SALA.H * k);
  const g = ca.g; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, ca.cv.width, ca.cv.height); g.drawImage(ca.base, 0, 0); g.scale(k, k);
  if (sala.pint && sala.pint.pal.length) {      // la pintura con cuerpo: una sombrita debajo y un pelín de transparencia, para que se note el suelo por debajo
    const p = sala.pint, img = pinturaLienzo(p), pw = p.w * p.r, ph = p.h * p.r;
    if (!p._sombra || p._sver !== p.ver) { if (!p._sombra) [p._sombra, p._sg] = lienzo(p.w, p.h); p._sg.clearRect(0, 0, p.w, p.h); p._sg.globalCompositeOperation = 'source-over'; p._sg.drawImage(img, 0, 0); p._sg.globalCompositeOperation = 'source-in'; p._sg.fillStyle = OL; p._sg.fillRect(0, 0, p.w, p.h); p._sver = p.ver; }
    g.save(); g.beginPath(); g.rect(SALA.X0, SALA.Y0, SALA.X1 - SALA.X0, SALA.Y1 - SALA.Y0); g.clip();
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; if ('filter' in g) g.filter = 'blur(' + (0.9 * k).toFixed(2) + 'px)';      // los bordes de la rejilla, suavizados (donde no hay filtro, salen con escalones)
    g.globalAlpha = 0.28; g.drawImage(p._sombra, SALA.X0 + 1.2, SALA.Y0 + 2, pw, ph);
    g.globalAlpha = 0.94; g.drawImage(img, SALA.X0, SALA.Y0, pw, ph);
    g.globalAlpha = 0.1; g.globalCompositeOperation = 'lighter'; g.drawImage(img, SALA.X0 - 0.8, SALA.Y0 - 1, pw, ph);      // un brillo arriba a la izquierda, como pintura fresca
    g.restore();
  }
  escenarioPintaEncima(g);
  Object.assign(ca, { k, id: sala.id, pv, pint: sala.pint });
  return ca.cv;
}
// el dibujo de un mueble (tipo y variante), en caché por escala, con su caja de dibujo
const _escSprites = {};
function muebleSprite(t, v, k) {
  const T = TIPOS_MUEBLE[t], clave = t + ':' + v + ':' + k; if (_escSprites[clave]) return _escSprites[clave];
  const ox = T.w / 2 + 14, oy = (T.tope || T.d + T.h) + 6, [cv, g] = lienzo((ox * 2) * k, (oy + 8) * k);
  g.scale(k, k); g.translate(ox, oy); try { T.pinta(g, { t, v, x: 0, y: 0, T }); } catch (e) { console.warn('[escenario]', e); }
  return (_escSprites[clave] = { cv, ox, oy, w: ox * 2, h: oy + 8 });
}
// pinta la sala en c (ya en unidades de la sala). op: { k (escala de la caché; por defecto la de c), personajes: [{ x, y, pinta(c) }], sel (mueble marcado), t, pops: { índice: escala } }
function salaPinta(c, sala, op = {}) {
  const k = op.k || Math.max(0.25, Math.min(3, Math.round(Math.abs(c.getTransform().a) * 4) / 4));
  c.drawImage(salaFondo(sala, k), 0, 0, SALA.W, SALA.H);
  const cosas = [];
  sala.muebles.forEach((m, i) => { const M = MUEBLES_SALA[m.id]; if (M && TIPOS_MUEBLE[M.t]) cosas.push({ y: m.y, m, T: TIPOS_MUEBLE[M.t], M, i }); });
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
  const E0 = ESCENARIOS[sala.id];
  if (E0 && E0.zumbido && op.t !== undefined) {      // las Backrooms: los fluorescentes parpadean de vez en cuando
    const f = Math.sin(op.t * 31) > 0.6 && Math.sin(op.t * 1.7) > 0.8 ? 0.1 : 0.03 + Math.sin(op.t * 2.3) * 0.015;
    c.fillStyle = `rgba(255,236,140,${f})`; c.fillRect(SALA.X0, SALA.Y0, SALA.X1 - SALA.X0, SALA.Y1 - SALA.Y0);
  }
}

/* ---------- los datos compactos (para enseñárselo a otros) ---------- */
// { v: 1, e: escenario, m: [[mueble, x, y, variante, volteado]], p: pintura en texto (baja resolución) }
function salaDeDatos(d) {
  if (!d || typeof d !== 'object') return null;
  const id = ESCENARIOS[d.e] ? d.e : 'oficina', muebles = [];
  for (const q of Array.isArray(d.m) ? d.m.slice(0, SALA.MAX_MUEBLES) : []) {
    if (!Array.isArray(q) || !MUEBLES_SALA[q[0]]) continue;
    muebles.push({ id: q[0], x: limita(+q[1] || 0, SALA.X0, SALA.X1), y: limita(+q[2] || 0, SALA.PY, SALA.Y1), v: (+q[3] | 0) % 8, f: q[4] ? 1 : 0 });
  }
  return { id, muebles, pint: d.p ? pinturaDecodifica(d.p) : null };
}
function salaADatos(sala, maxBytes = SALA.MAX_DATOS) {
  const d = { v: 1, e: sala.id, m: sala.muebles.slice(0, SALA.MAX_MUEBLES).map(m => [m.id, Math.round(m.x), Math.round(m.y), m.v || 0, m.f ? 1 : 0]) };
  const hay = sala.pint && sala.pint.cel.some(v => v);
  if (hay) for (const r of [8, 10, 12, 15, 20, 30, 40]) {
    d.p = pinturaCodifica(r === sala.pint.r ? sala.pint : pinturaRemuestra(sala.pint, r));
    if (JSON.stringify(d).length <= maxBytes) break;
  }
  if (JSON.stringify(d).length > maxBytes) delete d.p;
  return d;
}
const _escMemo = { txt: null, sala: null };
// lo que tiene el jugador, en compacto (< 4 KB)
function escenarioDatos() { return salaADatos(escenarioSala()); }
// pinta el escenario de unos datos (de escenarioDatos, quizá de otro jugador) en c, ya puesto en unidades de la sala (0..SALA.W × 0..SALA.H).
// op: { k: escala de la caché (píxeles por unidad; si no, la de c), personajes: [{ x, y, pinta(c) }] (se ordenan con los muebles), t: segundos (animación) }
function escenarioPinta(c, datos, op = {}) {
  const txt = typeof datos === 'string' ? datos : JSON.stringify(datos);
  if (_escMemo.txt !== txt) { _escMemo.txt = txt; try { _escMemo.sala = salaDeDatos(typeof datos === 'string' ? JSON.parse(datos) : datos); } catch (_) { _escMemo.sala = null; } }
  if (_escMemo.sala) salaPinta(c, _escMemo.sala, op);
}
