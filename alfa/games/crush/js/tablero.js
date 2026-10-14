// Fans of Crush · TABLERO: la lógica del Match-3, sin dibujar nada. Casillas, fichas, buscar combinaciones, crear especiales, activarlos,
// caer, rellenar, barajar y buscar jugadas. Lo que pasa se cuenta con avisos (crEv) que oyen la partida y los efectos.
// El tiempo lo lleva un reloj propio (crReloj) y las secuencias son corrutinas (function*): en el juego avanzan con cada fotograma
// y en el simulador de pruebas (herramientas) van de golpe, con la misma lógica.
'use strict';
const CR_TCAE = 0.055;   // lo que tarda una ficha en bajar una casilla
const CR_TCAMBIO = 0.15; // lo que tarda el intercambio de dos fichas
const CR_TPOP = 0.16;    // lo que tarda en desaparecer una ficha despedida

/* ---------- avisos: la lógica cuenta lo que pasa; la partida y los efectos lo oyen ---------- */
const CR_OYENTES = {};
function crOye(ev, fn) { (CR_OYENTES[ev] = CR_OYENTES[ev] || []).push(fn); }
function crEv(ev, ...a) { const l = CR_OYENTES[ev]; if (l) for (const fn of l) fn(...a); }

/* ---------- el reloj y las corrutinas ---------- */
const CR_RELOJ = { t: 0, cola: [] };
function crProgramar(dt, fn) { CR_RELOJ.cola.push({ t: CR_RELOJ.t + Math.max(0, dt), fn }); }
function crReloj(dt) {   // avanza el reloj y ejecuta, en orden, lo que ya toca (lo que se programe ahora mismo también, si toca)
  const fin = CR_RELOJ.t + dt;
  for (;;) {
    let i = -1, mejor = Infinity;
    for (let k = 0; k < CR_RELOJ.cola.length; k++) if (CR_RELOJ.cola[k].t <= fin && CR_RELOJ.cola[k].t < mejor) { mejor = CR_RELOJ.cola[k].t; i = k; }
    if (i < 0) break;
    const e = CR_RELOJ.cola.splice(i, 1)[0]; CR_RELOJ.t = Math.max(CR_RELOJ.t, e.t); e.fn();
  }
  CR_RELOJ.t = fin;
}
const crPendientes = () => CR_RELOJ.cola.length > 0;
function crRelojVacio() { CR_RELOJ.cola.length = 0; }
const CR_CORR = { gen: null, espera: 0 };
function crArranca(gen) { CR_CORR.gen = gen; CR_CORR.espera = 0; crSigue(0); }
function crSigue(dt) {   // un paso del juego: el reloj y la corrutina en marcha (cada yield dice cuántos segundos esperar)
  crReloj(dt);
  if (!CR_CORR.gen) return;
  CR_CORR.espera -= dt;
  while (CR_CORR.gen && CR_CORR.espera <= 0) {
    const r = CR_CORR.gen.next();
    if (r.done) { CR_CORR.gen = null; break; }
    CR_CORR.espera += r.value || 0;
  }
}
const crOcupado = () => !!CR_CORR.gen;
function crParaTodo() { CR_CORR.gen = null; crRelojVacio(); }
// el simulador: hace avanzar el tiempo a saltos hasta que no queda nada pendiente
function crSimula() {
  let vueltas = 0;
  while ((CR_CORR.gen || crPendientes()) && vueltas++ < 200000) {
    let dt = CR_CORR.gen ? Math.max(0, CR_CORR.espera) : Infinity;
    for (const e of CR_RELOJ.cola) dt = Math.min(dt, Math.max(0, e.t - CR_RELOJ.t));
    crSigue(dt === Infinity ? 0 : dt + 1e-9);
  }
}

/* ---------- el tablero ---------- */
let CR_ID = 1;
// una ficha: c color (0-5; -1 sin color) · t tipo: 'n' normal, 'h'/'v' cohete, 'b' dinamita, 'l' láser, 'e' becario
// x, y: su casilla · ox, oy, mt, dur: de dónde viene y cuánto lleva de camino (para dibujarla) · lo demás es animación
function crNuevaFicha(c, t = 'n') { return { id: CR_ID++, c, t, x: 0, y: 0, ox: 0, oy: 0, mt: 1, dur: CR_TCAE, bote: 0, nace: 0, muere: 0, brillo: 0 }; }
const CR_T = { w: 8, h: 8, ok: [], p: [], cinta: [], traba: [], boca: [], fondo: [], salida: [], gen: null, colores: 5 };
const crDentro = (x, y) => x >= 0 && y >= 0 && x < CR_T.w && y < CR_T.h && CR_T.ok[y][x];
function crPon(p, x, y) { CR_T.p[y][x] = p; if (p) { p.x = x; p.y = y; } }

// arma el tablero a partir del dibujo del nivel: '.' casilla · '#' hueco · 't' casilla con cinta · 'i'/'I' StarBot congelado (1/2 capas)
// 'k' CajaBotín (3 capas) · 'e' becario · '1'-'6' una ficha fija de ese color (para el tutorial)
function crTableroNuevo(N) {
  const T = CR_T, filas = N.mapa; T.h = filas.length; T.w = filas[0].length; T.colores = N.colores || 5;
  T.ok = []; T.p = []; T.cinta = []; T.traba = [];
  for (let y = 0; y < T.h; y++) {
    T.ok.push([]); T.p.push([]); T.cinta.push([]); T.traba.push([]);
    for (let x = 0; x < T.w; x++) {
      const ch = filas[y][x];
      T.ok[y].push(ch !== '#'); T.p[y].push(null); T.cinta[y].push(ch === 't' ? 1 : 0);
      T.traba[y].push(ch === 'i' ? { t: 'hielo', vida: 1 } : ch === 'I' ? { t: 'hielo', vida: 2 } : ch === 'k' ? { t: 'caja', vida: 3 } : null);
    }
  }
  T.boca = []; T.fondo = []; T.salida = [];
  for (let x = 0; x < T.w; x++) {
    let a = -1, b = -1; for (let y = 0; y < T.h; y++) if (T.ok[y][x]) { if (a < 0) a = y; b = y; }
    T.boca.push(a); T.fondo.push(b); T.salida.push(!!(N.salidas && N.salidas.includes(x)));
  }
  crLlena(N);
}
const crColorAzar = () => Math.floor(Math.random() * CR_T.colores);
// llena las casillas vacías sin dejar 3 en raya, y repite hasta que haya al menos una jugada
function crLlena(N) {
  const T = CR_T;
  for (let intento = 0; intento < 80; intento++) {
    for (let y = 0; y < T.h; y++) for (let x = 0; x < T.w; x++) {
      if (!T.ok[y][x] || T.traba[y][x]) { crPon(null, x, y); continue; }
      const ch = N.mapa[y][x];
      if (ch === 'e') { crPon(crNuevaFicha(-1, 'e'), x, y); continue; }
      if (ch >= '1' && ch <= '6') { crPon(crNuevaFicha(+ch - 1), x, y); continue; }
      let c, vueltas = 0;
      do { c = crColorAzar(); vueltas++; } while (vueltas < 30 && ((x > 1 && crColor(x - 1, y) === c && crColor(x - 2, y) === c) || (y > 1 && crColor(x, y - 1) === c && crColor(x, y - 2) === c)));
      crPon(crNuevaFicha(c), x, y);
    }
    if (!crRachas().length && crJugadas(1).length) break;
  }
  for (let y = 0; y < T.h; y++) for (let x = 0; x < T.w; x++) { const p = T.p[y][x]; if (p) { p.ox = x; p.oy = y; p.mt = 1; } }
}

/* ---------- buscar combinaciones ---------- */
function crColor(x, y) {
  if (!crDentro(x, y) || CR_T.traba[y][x]) return -1;
  const p = CR_T.p[y][x];
  return p && !p.muere && p.c >= 0 && p.t !== 'l' && p.t !== 'e' ? p.c : -1;
}
function crRachas() {   // todas las líneas de 3 o más del mismo color: { d: 'h'|'v', c, cel: [[x,y]…] }
  const T = CR_T, R = [];
  for (let y = 0; y < T.h; y++) for (let x = 0; x < T.w;) {
    const c = crColor(x, y); if (c < 0) { x++; continue; }
    let x2 = x + 1; while (x2 < T.w && crColor(x2, y) === c) x2++;
    if (x2 - x >= 3) R.push({ d: 'h', c, cel: Array.from({ length: x2 - x }, (_, i) => [x + i, y]) });
    x = x2;
  }
  for (let x = 0; x < T.w; x++) for (let y = 0; y < T.h;) {
    const c = crColor(x, y); if (c < 0) { y++; continue; }
    let y2 = y + 1; while (y2 < T.h && crColor(x, y2) === c) y2++;
    if (y2 - y >= 3) R.push({ d: 'v', c, cel: Array.from({ length: y2 - y }, (_, i) => [x, y + i]) });
    y = y2;
  }
  return R;
}
const crK = (x, y) => x + ',' + y;
function crGrupos(R) {   // junta las líneas que comparten casilla (una L o una T son un solo grupo)
  const padre = R.map((_, i) => i), raiz = i => (padre[i] === i ? i : (padre[i] = raiz(padre[i])));
  const dueno = {};
  R.forEach((r, i) => r.cel.forEach(([x, y]) => { const k = crK(x, y); if (dueno[k] !== undefined) padre[raiz(i)] = raiz(dueno[k]); else dueno[k] = i; }));
  const G = {};
  R.forEach((r, i) => { const g = (G[raiz(i)] = G[raiz(i)] || { rachas: [], cel: new Map(), c: r.c }); g.rachas.push(r); r.cel.forEach(([x, y]) => g.cel.set(crK(x, y), [x, y])); });
  return Object.values(G);
}
// qué especial sale de un grupo y dónde: 5 en línea → láser · L o T → dinamita · 4 → cohete
function crEspecialDe(g, mov) {
  const largo = Math.max(...g.rachas.map(r => r.cel.length)), hayH = g.rachas.some(r => r.d === 'h'), hayV = g.rachas.some(r => r.d === 'v');
  const t = largo >= 5 ? 'l' : hayH && hayV ? 'b' : largo === 4 ? '4' : null;
  if (!t) return null;
  const libre = ([x, y]) => { const p = CR_T.p[y][x]; return p && p.t === 'n'; };
  let pos = null;
  if (mov) for (const q of [mov.b, mov.a]) if (g.cel.has(crK(q[0], q[1])) && libre(q)) { pos = q; break; }
  if (!pos && t === 'b') { const h = g.rachas.filter(r => r.d === 'h').flatMap(r => r.cel.map(([x, y]) => crK(x, y))); for (const r of g.rachas) if (r.d === 'v') for (const q of r.cel) if (h.includes(crK(q[0], q[1])) && libre(q)) pos = q; }
  if (!pos) { const r = g.rachas.reduce((a, b) => (b.cel.length > a.cel.length ? b : a)), m = Math.floor((r.cel.length - 1) / 2); pos = [r.cel[m], r.cel[m + 1], ...r.cel].find(q => q && libre(q)) || null; }
  if (!pos) for (const q of g.cel.values()) if (libre(q)) { pos = q; break; }
  if (!pos) return null;
  let tipo = t;
  if (t === '4') { const larga = g.rachas.find(r => r.cel.length === 4); tipo = mov ? (mov.d === 'h' ? 'h' : 'v') : larga && larga.d === 'h' ? 'v' : 'h'; }
  return { t: tipo, pos };
}

/* ---------- despedir fichas, golpear casillas y activar especiales ---------- */
// ola: número de oleada en esta jugada (para los puntos) · causa: 'raya', 'golpe' o 'especial'
const CR_JUGADA = { ola: 1 };
function crDespide(x, y, causa) {
  const T = CR_T, p = T.p[y][x];
  if (!p || p.muere || p.t === 'e') return false;
  p.muere = 1e-6;
  if (T.cinta[y][x]) { T.cinta[y][x] = 0; crEv('cinta', x, y); }
  crEv('despide', p, x, y, causa);
  if (p.t === 'h' || p.t === 'v' || p.t === 'b' || p.t === 'l') crActiva(x, y, p);
  return true;
}
function crDanaTraba(x, y, causa) {
  const tb = CR_T.traba[y][x]; if (!tb) return;
  if (tb.golpe === CR_JUGADA.n && causa === 'vecino') return;   // un vecino solo la golpea una vez por oleada
  tb.golpe = CR_JUGADA.n; tb.vida--;
  crEv('traba', x, y, tb);
  if (tb.vida <= 0) { CR_T.traba[y][x] = null; crEv('rompe', x, y, tb.t); }
}
function crGolpea(x, y, fuente) {   // una explosión, un cohete o un láser llega a esta casilla
  if (!crDentro(x, y)) return;
  if (CR_T.traba[y][x]) { crDanaTraba(x, y, 'golpe'); return; }
  if (CR_T.cinta[y][x] && !CR_T.p[y][x]) { CR_T.cinta[y][x] = 0; crEv('cinta', x, y); }
  crEv('golpe', x, y, fuente);
  crDespide(x, y, 'especial');
}
function crGolpes(lista, fuente) {   // lista de [x, y, retraso]: cada casilla se golpea una sola vez (con el retraso más corto)
  const m = new Map();
  for (const [x, y, d] of lista) { if (!crDentro(x, y)) continue; const k = crK(x, y); if (!m.has(k) || m.get(k)[2] > d) m.set(k, [x, y, d]); }
  for (const [x, y, d] of m.values()) crProgramar(d, () => crGolpea(x, y, fuente));
}
function crMasComun() {
  const n = new Array(6).fill(0); let mejor = 0;
  for (let y = 0; y < CR_T.h; y++) for (let x = 0; x < CR_T.w; x++) { const c = crColor(x, y); if (c >= 0) n[c]++; }
  for (let c = 1; c < 6; c++) if (n[c] > n[mejor]) mejor = c;
  return mejor;
}
function crActiva(x, y, p, color) {
  const T = CR_T;
  if (p.t === 'h' || p.t === 'v') {
    crEv('cohete', x, y, p.t, p.c);
    const largo = Math.max(T.w, T.h), L = [];
    for (let k = 1; k < largo; k++) for (const s of [-1, 1]) L.push(p.t === 'h' ? [x + s * k, y, k * 0.035] : [x, y + s * k, k * 0.035]);
    crGolpes(L, 'cohete');
  } else if (p.t === 'b') {
    crEv('dinamita', x, y, p.c, 2);
    const L = []; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (Math.abs(dx) + Math.abs(dy) <= 2 && (dx || dy)) L.push([x + dx, y + dy, 0.1]);
    crGolpes(L, 'dinamita');
  } else if (p.t === 'l') {
    const c = color === undefined ? crMasComun() : color, blancos = [];
    for (let yy = 0; yy < T.h; yy++) for (let xx = 0; xx < T.w; xx++) if (crColor(xx, yy) === c) blancos.push([xx, yy]);
    crEv('laser', x, y, c, blancos);
    blancos.forEach(([bx, by], i) => crProgramar(0.12 + i * 0.03, () => crGolpea(bx, by, 'laser')));
  }
}
// dos especiales juntos (o el láser con cualquier ficha): el centro es la casilla adonde se arrastró la ficha
function crCombo(a, b, x, y) {
  const T = CR_T, es = t => t === 'h' || t === 'v' || t === 'b';
  const quita = q => { q.muere = 1e-6; if (T.cinta[q.y][q.x]) { T.cinta[q.y][q.x] = 0; crEv('cinta', q.x, q.y); } crEv('despide', q, q.x, q.y, 'combo'); };
  if (a.t === 'l' && b.t === 'l') {
    quita(a); quita(b); crEv('combo', 'll', x, y);
    const L = []; for (let yy = 0; yy < T.h; yy++) for (let xx = 0; xx < T.w; xx++) L.push([xx, yy, 0.25 + Math.hypot(xx - x, yy - y) * 0.06]);
    crGolpes(L, 'todo');
    return true;
  }
  if (a.t === 'l' || b.t === 'l') {
    const L = a.t === 'l' ? a : b, o = a.t === 'l' ? b : a;
    if (o.t === 'e') return false;
    quita(L);
    if (o.t === 'n') { crEv('combo', 'l', L.x, L.y); crActiva(L.x, L.y, { t: 'l' }, o.c); return true; }
    // láser + cohete o dinamita: todas las de ese color se convierten y estallan una detrás de otra
    const lista = [];
    for (let yy = 0; yy < T.h; yy++) for (let xx = 0; xx < T.w; xx++) if (crColor(xx, yy) === o.c) lista.push(T.p[yy][xx]);
    crEv('combo', o.t === 'b' ? 'lb' : 'lh', L.x, L.y, o.c, lista.map(q => [q.x, q.y]));
    lista.forEach((q, i) => { crProgramar(0.15 + i * 0.04, () => { if (q.muere) return; q.t = o.t === 'b' ? 'b' : Math.random() < 0.5 ? 'h' : 'v'; crEv('convierte', q); }); });
    lista.forEach((q, i) => crProgramar(0.15 + lista.length * 0.04 + 0.35 + i * 0.09, () => { if (!q.muere && T.p[q.y][q.x] === q) crDespide(q.x, q.y, 'especial'); }));
    return true;
  }
  if (es(a.t) && es(b.t)) {
    quita(a); quita(b);
    const bombas = (a.t === 'b') + (b.t === 'b');
    const L = [], largo = Math.max(T.w, T.h);
    if (bombas === 2) {
      crEv('combo', 'bb', x, y);
      for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) if (dx * dx + dy * dy <= 10) L.push([x + dx, y + dy, 0.12 + Math.hypot(dx, dy) * 0.03]);
      crGolpes(L, 'dinamita');
    } else if (bombas === 1) {
      crEv('combo', 'hb', x, y);
      for (let k = 0; k < largo; k++) for (const s of [-1, 1]) for (let d = -1; d <= 1; d++) L.push([x + s * k, y + d, 0.05 + k * 0.035], [x + d, y + s * k, 0.05 + k * 0.035]);
      crGolpes(L, 'cohete');
    } else {
      crEv('combo', 'hh', x, y);
      for (let k = 0; k < largo; k++) for (const s of [-1, 1]) L.push([x + s * k, y, k * 0.035], [x, y + s * k, k * 0.035]);
      crGolpes(L, 'cohete');
    }
    return true;
  }
  return false;
}

/* ---------- una oleada: despedir las líneas y crear los especiales ---------- */
function crAplicaGrupos(G, mov) {
  const T = CR_T, nuevos = [];
  for (const g of G) {
    const esp = crEspecialDe(g, mov);
    const dano = new Set();
    for (const [x, y] of g.cel.values()) {
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = crK(x + dx, y + dy); if (!dano.has(k) && crDentro(x + dx, y + dy) && T.traba[y + dy][x + dx]) { dano.add(k); crDanaTraba(x + dx, y + dy, 'vecino'); } }
      if (esp && esp.pos[0] === x && esp.pos[1] === y) continue;
      crDespide(x, y, 'raya');
    }
    crEv('raya', g, esp);
    if (esp) {
      const [x, y] = esp.pos, p = T.p[y][x];
      if (T.cinta[y][x]) { T.cinta[y][x] = 0; crEv('cinta', x, y); }
      nuevos.push({ p, t: esp.t, x, y, cel: [...g.cel.values()] });
    }
  }
  for (const n of nuevos) { n.p.t = n.t; if (n.t === 'l') n.p.c = -1; n.p.nace = 1; crEv('especial', n.p, n.x, n.y, n.cel); }
}
function crRetiraMuertos() {
  const T = CR_T; let n = 0;
  for (let y = 0; y < T.h; y++) for (let x = 0; x < T.w; x++) { const p = T.p[y][x]; if (p && p.muere) { T.p[y][x] = null; n++; } }
  return n;
}

/* ---------- caer y rellenar ---------- */
const crLibre = (x, y) => crDentro(x, y) && !CR_T.p[y][x] && !CR_T.traba[y][x];
function crAlimentada(x, y) {   // ¿le llegará algo a esta casilla vacía desde arriba (una ficha o la boca de la columna)?
  for (let yy = y - 1; ; yy--) {
    if (yy < CR_T.boca[x]) return true;
    if (!CR_T.ok[yy][x] || CR_T.traba[yy][x]) return false;
    if (CR_T.p[yy][x]) return true;
  }
}
function crMueve(p, x0, y0, x1, y1, dur = CR_TCAE) {
  const T = CR_T; T.p[y0][x0] = null; T.p[y1][x1] = p;
  p.ox = crVisX(p); p.oy = crVisY(p); p.x = x1; p.y = y1; p.mt = 0; p.dur = dur;
}
const crSuave = k => k;   // al caer, a velocidad constante
function crVisX(p) { return p.mt >= 1 ? p.x : p.ox + (p.x - p.ox) * crSuave(p.mt); }
function crVisY(p) { return p.mt >= 1 ? p.y : p.oy + (p.y - p.oy) * crSuave(p.mt); }
let CR_LADO = false;
const CR_CAYENDO = new Set();
function crPasoCaida() {
  const T = CR_T, ya = new Set(); let movio = false;
  for (let y = T.h - 2; y >= 0; y--) for (let x = 0; x < T.w; x++) {
    const p = T.p[y][x]; if (!p || T.traba[y][x] || !T.ok[y][x]) continue;
    if (crLibre(x, y + 1)) { crMueve(p, x, y, x, y + 1); ya.add(p); movio = true; }
  }
  CR_LADO = !CR_LADO;
  for (let y = T.h - 1; y >= 1; y--) for (let x = 0; x < T.w; x++) {
    if (!crLibre(x, y) || crAlimentada(x, y)) continue;
    for (const dx of CR_LADO ? [-1, 1] : [1, -1]) {
      const sx = x + dx, sy = y - 1; if (!crDentro(sx, sy)) continue;
      const p = T.p[sy][sx]; if (!p || ya.has(p) || T.traba[sy][sx] || crLibre(sx, sy + 1)) continue;
      crMueve(p, sx, sy, x, y); ya.add(p); movio = true; break;
    }
  }
  for (let x = 0; x < T.w; x++) {
    const y = T.boca[x]; if (y < 0 || !crLibre(x, y)) continue;
    const p = T.gen ? T.gen(x) : crNuevaFicha(crColorAzar());
    T.p[y][x] = p; p.x = x; p.y = y; p.ox = x; p.oy = y - 1; p.mt = 0; p.dur = CR_TCAE; ya.add(p); movio = true;
  }
  for (const p of CR_CAYENDO) if (!ya.has(p)) { CR_CAYENDO.delete(p); p.bote = 1; crEv('aterriza', p); }
  for (const p of ya) CR_CAYENDO.add(p);
  return movio;
}
function* crCaer() {
  while (crPasoCaida()) yield CR_TCAE;
  for (const p of CR_CAYENDO) { p.bote = 1; crEv('aterriza', p); }
  CR_CAYENDO.clear();
}
// becarios que han llegado abajo del todo en una columna con SALIDA
function crRescata() {
  const T = CR_T; let n = 0;
  for (let x = 0; x < T.w; x++) {
    const y = T.fondo[x]; if (y < 0 || !T.salida[x]) continue;
    const p = T.p[y][x]; if (p && p.t === 'e' && !p.muere) { p.muere = 1e-6; crEv('rescate', p, x, y); n++; }
  }
  return n;
}

/* ---------- jugadas posibles, pista y barajar ---------- */
function crHayRachaEn(x, y) {
  const c = crColor(x, y); if (c < 0) return 0;
  let a = x, b = x; while (crColor(a - 1, y) === c) a--; while (crColor(b + 1, y) === c) b++;
  let d = y, e = y; while (crColor(x, d - 1) === c) d--; while (crColor(x, e + 1) === c) e++;
  const h = b - a + 1, v = e - d + 1;
  return (h >= 3 ? h : 0) + (v >= 3 ? v : 0);
}
const crMovible = (x, y) => crDentro(x, y) && !CR_T.traba[y][x] && CR_T.p[y][x] && !CR_T.p[y][x].muere;
// las jugadas que hacen algo: { a, b, valor } (valor: más o menos cuántas fichas se van; sirve para la pista y el simulador)
function crJugadas(max = 999) {
  const T = CR_T, out = [], esp = t => t === 'h' || t === 'v' || t === 'b';
  for (let y = 0; y < T.h; y++) for (let x = 0; x < T.w; x++) for (const [dx, dy] of [[1, 0], [0, 1]]) {
    const x2 = x + dx, y2 = y + dy;
    if (!crMovible(x, y) || !crMovible(x2, y2)) continue;
    const A = T.p[y][x], B = T.p[y2][x2];
    let valor = 0;
    if (A.t === 'l' || B.t === 'l') { if (A.t === 'e' || B.t === 'e') continue; valor = A.t === 'l' && B.t === 'l' ? 60 : 12 + (esp(A.t) || esp(B.t) ? 14 : 0); }
    else if (esp(A.t) && esp(B.t)) valor = 18;
    else {
      T.p[y][x] = B; T.p[y2][x2] = A;
      const v1 = crHayRachaEn(x, y), v2 = crHayRachaEn(x2, y2);
      T.p[y][x] = A; T.p[y2][x2] = B;
      if (!v1 && !v2) continue;
      valor = v1 + v2 + (v1 >= 4 || v2 >= 4 ? 4 : 0) + (v1 >= 5 || v2 >= 5 ? 6 : 0);
    }
    out.push({ a: [x, y], b: [x2, y2], valor });
    if (out.length >= max) return out;
  }
  return out;
}
function crBaraja() {   // «reestructuración de plantilla»: mezcla las fichas (los becarios se quedan) hasta que no haya 3 en raya y sí jugadas
  const T = CR_T, sitios = [], fichas = [];
  for (let y = 0; y < T.h; y++) for (let x = 0; x < T.w; x++) { const p = T.p[y][x]; if (p && !T.traba[y][x] && p.t !== 'e') { sitios.push([x, y]); fichas.push(p); } }
  for (let intento = 0; intento < 120; intento++) {
    shuffle(fichas);
    if (intento > 60) for (const p of fichas) if (p.t === 'n') p.c = crColorAzar();
    sitios.forEach(([x, y], i) => { T.p[y][x] = fichas[i]; });
    if (!crRachas().length && crJugadas(1).length) break;
  }
  sitios.forEach(([x, y], i) => { const p = fichas[i]; p.ox = crVisX(p); p.oy = crVisY(p); p.x = x; p.y = y; p.mt = 0; p.dur = 0.45; });
}

/* ---------- una jugada entera: intercambio, oleadas, caídas y rescates ---------- */
function* crResuelve(mov) {
  let ola = 0;
  for (;;) {
    const G = crGrupos(crRachas());
    if (G.length) {
      ola++; CR_JUGADA.ola = ola; CR_JUGADA.n = (CR_JUGADA.n || 0) + 1;
      crEv('ola', ola);
      crAplicaGrupos(G, ola === 1 ? mov : null);
    } else if (!crPendientes() && !crHayMuertos()) {
      if (crRescata()) { yield CR_TPOP + 0.12; crRetiraMuertos(); yield* crCaer(); continue; }
      return ola;
    }
    while (crPendientes()) yield 0.03;
    yield CR_TPOP;
    crRetiraMuertos();
    yield* crCaer();
    if (crRescata()) { yield CR_TPOP + 0.12; crRetiraMuertos(); yield* crCaer(); }
  }
}
function crHayMuertos() { for (let y = 0; y < CR_T.h; y++) for (let x = 0; x < CR_T.w; x++) { const p = CR_T.p[y][x]; if (p && p.muere) return true; } return false; }
// mueve la ficha de (ax,ay) a (bx,by). Devuelve (en r.vale) si la jugada valía; si no, las fichas vuelven a su sitio
function* crJugada(ax, ay, bx, by, r = {}) {
  const T = CR_T, A = T.p[ay][ax], B = T.p[by][bx];
  r.vale = false;
  if (!A || !B || A.muere || B.muere || T.traba[ay][ax] || T.traba[by][bx]) return;
  crMueve(A, ax, ay, bx, by, CR_TCAMBIO); T.p[ay][ax] = B; B.ox = crVisX(B); B.oy = crVisY(B); B.x = ax; B.y = ay; B.mt = 0; B.dur = CR_TCAMBIO;
  crEv('cambio', A, B);
  yield CR_TCAMBIO;
  CR_JUGADA.ola = 1; CR_JUGADA.n = (CR_JUGADA.n || 0) + 1;
  const esp = t => t === 'h' || t === 'v' || t === 'b';
  if (A.t === 'l' || B.t === 'l' || (esp(A.t) && esp(B.t))) {
    if (crCombo(A, B, bx, by)) { r.vale = true; crEv('vale'); yield* crResuelve(null); return; }
  }
  if (crHayRachaEn(bx, by) || crHayRachaEn(ax, ay)) { r.vale = true; crEv('vale'); yield* crResuelve({ a: [ax, ay], b: [bx, by], d: ay === by ? 'h' : 'v' }); return; }
  crEv('no-vale', A, B);
  crMueve(A, bx, by, ax, ay, CR_TCAMBIO); T.p[by][bx] = B; B.ox = crVisX(B); B.oy = crVisY(B); B.x = bx; B.y = by; B.mt = 0; B.dur = CR_TCAMBIO;
  yield CR_TCAMBIO;
}
// el martillo: despide una ficha (o le quita una capa a una traba) sin gastar movimiento
function* crMartillo(x, y) {
  CR_JUGADA.ola = 1; CR_JUGADA.n = (CR_JUGADA.n || 0) + 1;
  crEv('martillo', x, y);
  yield 0.18;
  if (CR_T.traba[y][x]) crDanaTraba(x, y, 'golpe');
  else { const p = CR_T.p[y][x]; if (p && p.t === 'e') return; crGolpea(x, y, 'martillo'); }
  yield* crResuelve(null);
}
