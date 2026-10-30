// Fans of Ratkov · LA MOCHILA TETRIS EN PANTALLA: pinta cuadrículas (la mochila, la riñonera, un contenedor) y casillas sueltas
// (los bolsillos) y deja arrastrar las piezas con el dedo o el ratón de una a otra. La pieza va un poco por encima del dedo para que se
// vea dónde cae; las casillas se ponen verdes si cabe y rojas si no. Se gira tocando dos veces, con el botón GIRAR mientras arrastras
// o con la tecla R. Tocar una pieza la elige (la ventana enseña qué es y qué puedes hacer con ella).
// Cada ventana describe sus «sitios» y llama a REJ.monta(); cuando algo cambia, REJ avisa con alCambiar() para que la ventana se repinte.
'use strict';
const REJ = { sitios: [], C: 40, arr: null, sel: null, op: {}, toque: { o: null, t: 0 } };
const EL_PIEZA = new WeakMap(); // el elemento de cada pieza en pantalla (fuera del objeto, para que no se guarde en la partida)

/* ---------- lo que se puede hacer con cada sitio ---------- */
// sitio = { id, raiz, lista, dim } (cuadrícula) o { id, raiz, lista, i } (una casilla suelta de la lista, los bolsillos)
const esCasilla = s => s.i != null;
function piezasDe(s) {
  if (esCasilla(s)) { const o = s.lista[s.i]; return o ? [o] : []; }
  return s.lista.filter(o => o && o.gx != null);
}
const posDe = (s, o) => (esCasilla(s) ? [0, 0, 0] : [o.gx, o.gy, o.gr || 0]);
function puedeEn(s, o, rot, x, y) {
  if (s.acepta && !s.acepta(o)) return false;
  if (esCasilla(s)) return x === 0 && y === 0 && celdasDe(o.id) === 1 && (!s.lista[s.i] || s.lista[s.i] === o);
  return cabeEn(s.lista, s.dim, o.id, rot, x, y, o);
}
function quitaDe(s, o) {
  if (esCasilla(s)) { s.lista[s.i] = null; return; }
  const k = s.lista.indexOf(o); if (k >= 0) s.lista.splice(k, 1); if (s.alQuitar) s.alQuitar(o, k);
}
function ponEn(s, o, rot, x, y) {
  if (esCasilla(s)) { sinSitio(o); s.lista[s.i] = o; return; }
  o.gx = x; o.gy = y; o.gr = rot; if (s.alPoner) s.alPoner(o); else s.lista.push(o);
}
const sitioDeId = id => REJ.sitios.find(s => s.id === id);
function sitioDePieza(o) { return REJ.sitios.find(s => piezasDe(s).includes(o)); }

/* ---------- montar y pintar ---------- */
function montaRejillas(sitios, op = {}) {
  REJ.sitios = sitios.filter(s => s.raiz); REJ.op = op; REJ.C = op.C || REJ.C;
  if (REJ.sel && !REJ.sitios.some(s => piezasDe(s).includes(REJ.sel))) REJ.sel = null;
  for (const s of REJ.sitios) {
    const d = esCasilla(s) ? { w: 1, h: 1 } : s.dim, C = REJ.C;
    s.raiz.classList.add('rej'); s.raiz.classList.toggle('bolsillo-rej', esCasilla(s));
    s.raiz.style.width = d.w * C + 'px'; s.raiz.style.height = d.h * C + 'px'; s.raiz.style.setProperty('--c', C + 'px');
    s.raiz.innerHTML = '';
    for (const o of piezasDe(s)) s.raiz.appendChild(elPieza(s, o));
    if (!s.raiz.dataset.rejMontada) { s.raiz.dataset.rejMontada = '1'; enganchaRejilla(s.raiz); }
    s.raiz.dataset.rej = s.id;
  }
}
function elPieza(s, o) {
  const [x, y, rot] = posDe(s, o), f = formaDe(o.id, rot), C = REJ.C, e = document.createElement('div');
  const oculta = s.oculto && s.oculto(o);
  e.className = 'pieza' + (o === REJ.sel ? ' sel' : '') + (oculta ? ' oculta' : '');
  Object.assign(e.style, { left: x * C + 'px', top: y * C + 'px', width: f.w * C + 'px', height: f.h * C + 'px' });
  if (oculta) { for (const [a, b] of f.c) { const q = document.createElement('i'); Object.assign(q.style, { left: a * C + 'px', top: b * C + 'px', width: C + 'px', height: C + 'px' }); e.appendChild(q); } return e; }
  const cv = lienzoPieza(o.id, rot), img = document.createElement('canvas'); img.width = cv.width; img.height = cv.height; img.getContext('2d').drawImage(cv, 0, 0); e.appendChild(img);
  if (o.n > 1) { const n = document.createElement('b'); n.textContent = o.n; e.appendChild(n); }
  else if (ARMAS[o.id]) { const n = document.createElement('b'); n.textContent = (o.bal || 0) + '/' + statsArma(o).carg; e.appendChild(n); }
  if (o.fir) { const m = document.createElement('u'); e.appendChild(m); }
  EL_PIEZA.set(o, e); return e;
}
const repintaRejillas = () => { if (REJ.op.alCambiar) REJ.op.alCambiar(); };

/* ---------- el dedo ---------- */
function celdaBajo(raiz, cx, cy) { const r = raiz.getBoundingClientRect(); return [Math.floor((cx - r.left - 2) / REJ.C), Math.floor((cy - r.top - 2) / REJ.C)]; }
const subeDedo = e => (e.pointerType === 'touch' ? Math.round(REJ.C * 1.1) : 0);
function enganchaRejilla(raiz) {
  raiz.addEventListener('pointerdown', e => {
    const s = sitioDeId(raiz.dataset.rej); if (!s || REJ.arr) return;
    const [x, y] = celdaBajo(raiz, e.clientX, e.clientY);
    const o = esCasilla(s) ? s.lista[s.i] : piezaEn(s.lista, x, y);
    if (!o || (s.oculto && s.oculto(o))) { if (REJ.sel) { REJ.sel = null; if (REJ.op.alElegir) REJ.op.alElegir(null); repintaRejillas(); } return; }
    e.preventDefault(); e.stopPropagation(); raiz.setPointerCapture(e.pointerId);
    const r = EL_PIEZA.get(o).getBoundingClientRect();
    REJ.arr = { o, s, id: e.pointerId, x0: e.clientX, y0: e.clientY, dx: e.clientX - r.left, dy: e.clientY - r.top, va: false, rot: posDe(s, o)[2], destino: null, sube: subeDedo(e), raiz };
  });
  raiz.addEventListener('pointermove', e => {
    const A = REJ.arr; if (!A || e.pointerId !== A.id) return;
    if (!A.va && Math.hypot(e.clientX - A.x0, e.clientY - A.y0) < 8) return;
    if (!A.va) { A.va = true; REJ.sel = A.o; A.el = EL_PIEZA.get(A.o); flota().appendChild(A.el); A.el.classList.add('vuela'); el('b-girar-flota').hidden = false; if (REJ.op.alElegir) REJ.op.alElegir(A.o, A.s); }
    A.ex = e.clientX; A.ey = e.clientY; colocaFlotante();
  });
  const fin = e => { const A = REJ.arr; if (!A || e.pointerId !== A.id) return; sueltaPieza(e.type === 'pointercancel'); };
  raiz.addEventListener('pointerup', fin); raiz.addEventListener('pointercancel', fin);
}
function flota() { let f = el('flota'); if (!f) { f = document.createElement('div'); f.id = 'flota'; document.body.appendChild(f); } return f; }
function colocaFlotante() {
  const A = REJ.arr, C = REJ.C, f = formaDe(A.o.id, A.rot);
  const left = A.ex - A.dx, top = A.ey - A.dy - A.sube;
  Object.assign(A.el.style, { left: left + 'px', top: top + 'px', width: f.w * C + 'px', height: f.h * C + 'px' });
  document.querySelectorAll('.sombra-rej').forEach(n => n.remove()); A.destino = null;
  for (const s of REJ.sitios) {
    const r = s.raiz.getBoundingClientRect(), d = esCasilla(s) ? { w: 1, h: 1 } : s.dim;
    const x = Math.round((left - r.left - 2) / C), y = Math.round((top - r.top - 2) / C);
    if (x + f.w <= 0 || y + f.h <= 0 || x >= d.w || y >= d.h) continue;
    if (esCasilla(s) && (x !== 0 || y !== 0)) continue;
    // soltar encima de un montón igual lo junta
    const otra = esCasilla(s) ? s.lista[s.i] : piezaEn(s.lista, x + f.c[0][0], y + f.c[0][1]);
    const junta = otra && otra !== A.o && apilable(otra) && juntables(otra, A.o) && otra.n < OBJ[otra.id].max;
    const si = junta || puedeEn(s, A.o, A.rot, x, y); A.destino = { s, x, y, si, junta: junta ? otra : null };
    for (const [a, b] of f.c) {
      const gx = x + a, gy = y + b; if (gx < 0 || gy < 0 || gx >= d.w || gy >= d.h) continue;
      const n = document.createElement('i'); n.className = 'sombra-rej ' + (si ? 'si' : 'no');
      Object.assign(n.style, { left: gx * C + 'px', top: gy * C + 'px', width: C + 'px', height: C + 'px' }); s.raiz.appendChild(n);
    }
    break;
  }
}
function sueltaPieza(cancela) {
  const A = REJ.arr; REJ.arr = null; el('b-girar-flota').hidden = true;
  document.querySelectorAll('.sombra-rej').forEach(n => n.remove());
  if (!A.va) {
    // un toque: elige; dos toques seguidos: gira donde está
    const ahora = performance.now();
    if (REJ.toque.o === A.o && ahora - REJ.toque.t < 340) { REJ.toque = { o: null, t: 0 }; giraEnSitio(A.o); return; }
    REJ.toque = { o: A.o, t: ahora }; REJ.sel = A.o; if (REJ.op.alElegir) REJ.op.alElegir(A.o, A.s); repintaRejillas(); return;
  }
  A.el.remove();
  const D = A.destino;
  if (!cancela && D && D.si) {
    if (D.junta) {
      const m = Math.min(OBJ[D.junta.id].max - D.junta.n, A.o.n); D.junta.n += m; A.o.n -= m;
      if (A.o.n <= 0) quitaDe(A.s, A.o);
    } else {
      const [x0, y0, r0] = posDe(A.s, A.o);
      quitaDe(A.s, A.o);
      if (puedeEn(D.s, A.o, A.rot, D.x, D.y)) ponEn(D.s, A.o, A.rot, D.x, D.y); else ponEn(A.s, A.o, r0, x0, y0);
    }
    if (REJ.op.alMover) REJ.op.alMover(A.o, A.s, D.s);
    play('select');
  } else if (D && !D.si) { avisa(tr(pick(NO_CABE)), 'malo'); play('deny'); }
  repintaRejillas();
}
const NO_CABE = ['No cabe. Microblizz recomienda la mochila Premium.', 'No cabe. Prueba a girarlo.', 'Ahí no entra. Ni con calzador.'];
function giraEnSitio(o) {
  const s = sitioDePieza(o); if (!s || esCasilla(s)) return;
  const rot = ((o.gr || 0) + 1) % 4;
  for (const [dx, dy] of [[0, 0], [-1, 0], [0, -1], [-1, -1], [1, 0], [0, 1], [-2, 0], [0, -2]]) if (cabeEn(s.lista, s.dim, o.id, rot, o.gx + dx, o.gy + dy, o)) { o.gr = rot; o.gx += dx; o.gy += dy; play('select'); repintaRejillas(); return; }
  avisa(tr('Girado no cabe ahí. Muévelo a un hueco más grande.'), 'malo'); play('deny');
}
function giraVolando() {
  const A = REJ.arr; if (!A || !A.va) return;
  const antes = formaDe(A.o.id, A.rot); A.rot = (A.rot + 1) % 4; const f = formaDe(A.o.id, A.rot), C = REJ.C;
  const fx = A.dx / (antes.w * C), fy = A.dy / (antes.h * C); A.dx = (1 - fy) * f.w * C; A.dy = fx * f.h * C;
  const cv = lienzoPieza(A.o.id, A.rot), c = A.el.querySelector('canvas'); if (c) { c.width = cv.width; c.height = cv.height; c.getContext('2d').drawImage(cv, 0, 0); }
  colocaFlotante();
}
// el tamaño de casilla que cabe en una ventana de «ancho» píxeles para «columnas» casillas
const casillaPara = (ancho, columnas) => Math.max(26, Math.min(52, Math.floor(ancho / columnas)));

window.addEventListener('keydown', e => {
  if (e.code !== 'KeyR' || !REJ.sitios.length) return;
  if (REJ.arr && REJ.arr.va) { giraVolando(); e.stopImmediatePropagation(); e.preventDefault(); }
  else if (REJ.sel && EL_PIEZA.get(REJ.sel) && document.body.contains(EL_PIEZA.get(REJ.sel))) { giraEnSitio(REJ.sel); e.stopImmediatePropagation(); e.preventDefault(); }
}, true);
(function () {
  const b = document.getElementById('b-girar-flota');
  if (b) b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); giraVolando(); });
})();
