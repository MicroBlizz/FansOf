// Fans of Rouflage · MI ESCENARIO, SELECCIONAR Y EL PANEL DEL PINCEL (27-10-2026). SELECCIONAR: arrastras para marcar un trozo de la pintura; luego
// lo arrastras para moverlo, y en la fila de abajo salen COPIAR (deja una copia y sigues con otra), VOLTEAR de lado o de arriba abajo, BORRAR y
// LISTO. Lo seleccionado lleva sus colores en hexadecimal (la paleta de la pintura puede cambiar mientras tanto); lo que no tiene pintura es
// transparente. EL PANEL: la fila de herramientas, la de opciones de la herramienta (grosor, tamaño del píxel, borde o relleno, estampado…) con
// ESPEJO, DESHACER, REHACER y BORRAR TODO, y los colores. Va después de escenario-pincel2.js.
'use strict';

const SEL_ESC = { s: null, marca: null, mover: null };      // s: { i0, j0, w, h, dat, pal, dx, dy, alzada, cv }

/* ---------- seleccionar ---------- */
function escSelCaptura(i0, j0, w, h) {
  const p = escenarioSala().pint, dat = new Uint8Array(w * h), pal = [], mapa = new Map();
  let hay = false;
  for (let b = 0; b < h; b++) for (let a = 0; a < w; a++) {
    const i = i0 + a, j = j0 + b; if (i < 0 || j < 0 || i >= p.w || j >= p.h) continue;
    const v = p.cel[j * p.w + i]; if (!v) continue;
    if (!mapa.has(v)) { pal.push(p.pal[v - 1]); mapa.set(v, pal.length); }
    dat[b * w + a] = mapa.get(v); hay = true;
  }
  return hay ? { i0, j0, w, h, dat, pal, dx: 0, dy: 0, alzada: false, cv: null } : null;
}
// el dibujo de lo seleccionado (1 píxel por celda), para enseñarlo mientras flota
function escSelLienzo(s) {
  if (s.cv) return s.cv;
  const [cv, g] = lienzo(s.w, s.h, true), img = g.createImageData(s.w, s.h), rgb = s.pal.map(hexRgb);
  for (let k = 0; k < s.dat.length; k++) { const v = s.dat[k]; if (!v) continue; const [r, gg, b] = rgb[v - 1]; img.data.set([r, gg, b, 255], k * 4); }
  g.putImageData(img, 0, 0); s.cv = cv; return cv;
}
// levantar lo seleccionado: lo de debajo se queda sin pintura (salvo al copiar)
function escSelAlza(copia) {
  const s = SEL_ESC.s; if (!s || s.alzada) return;
  escGuardaPaso(); s.alzada = true;
  if (!copia) { for (let b = 0; b < s.h; b++) for (let a = 0; a < s.w; a++) if (s.dat[b * s.w + a]) escPonCel(s.i0 + a, s.j0 + b, 0, true); escSucioFin(); }
}
// dejar lo seleccionado donde está ahora
function escSelEstampa() {
  const s = SEL_ESC.s; if (!s || !s.alzada) return;
  const idx = s.pal.map(h => escIndiceColor(h));
  for (let b = 0; b < s.h; b++) for (let a = 0; a < s.w; a++) { const v = s.dat[b * s.w + a]; if (v) escPonCel(s.i0 + s.dx + a, s.j0 + s.dy + b, idx[v - 1], true); }
  escSucioFin();
}
function escSelSuelta() {
  const s = SEL_ESC.s;
  if (s && s.alzada) { escSelEstampa(); escGuarda(); play('pop'); }
  SEL_ESC.s = null; SEL_ESC.mover = null; SEL_ESC.marca = null;
  MIESC.sucio = true; if (PINCEL_ESC.herr === 'sel') escPincelRefresca();
}
const escSelOlvida = () => { SEL_ESC.s = null; SEL_ESC.mover = null; SEL_ESC.marca = null; };
function escSelDentro(c) { const s = SEL_ESC.s; return s && c[0] >= s.i0 + s.dx && c[0] < s.i0 + s.dx + s.w && c[1] >= s.j0 + s.dy && c[1] < s.j0 + s.dy + s.h; }
function escSelAbajo(q) {
  const c = escCelda(q);
  if (SEL_ESC.s && escSelDentro(c)) { escSelAlza(); SEL_ESC.mover = { c, dx: SEL_ESC.s.dx, dy: SEL_ESC.s.dy }; return true; }
  if (SEL_ESC.s) escSelSuelta();
  SEL_ESC.marca = { a: c, b: c }; return true;
}
function escSelMueve(q) {
  const c = escCelda(q);
  if (SEL_ESC.mover) { const m = SEL_ESC.mover, s = SEL_ESC.s; s.dx = m.dx + c[0] - m.c[0]; s.dy = m.dy + c[1] - m.c[1]; MIESC.sucio = true; }
  else if (SEL_ESC.marca) { SEL_ESC.marca.b = c; MIESC.sucio = true; }
  return true;
}
function escSelArriba() {
  if (SEL_ESC.mover) { SEL_ESC.mover = null; return true; }
  const m = SEL_ESC.marca; SEL_ESC.marca = null; if (!m) return true;
  const i0 = Math.min(m.a[0], m.b[0]), j0 = Math.min(m.a[1], m.b[1]), w = Math.abs(m.b[0] - m.a[0]) + 1, h = Math.abs(m.b[1] - m.a[1]) + 1;
  if (w < 2 && h < 2) return true;
  SEL_ESC.s = escSelCaptura(i0, j0, w, h);
  if (!SEL_ESC.s) { play('deny'); escAviso(tr('Ahí no hay pintura que seleccionar')); }
  else { play('select'); escAviso(tr('Arrastra lo seleccionado para moverlo')); }
  escPincelRefresca(); MIESC.sucio = true; return true;
}
function escSelCancela() { SEL_ESC.marca = null; if (SEL_ESC.mover && SEL_ESC.s) { SEL_ESC.s.dx = SEL_ESC.mover.dx; SEL_ESC.s.dy = SEL_ESC.mover.dy; } SEL_ESC.mover = null; }
// las acciones de la fila de opciones
function escSelAccion(que) {
  const s = SEL_ESC.s; if (!s) return;
  if (que === 'copiar') { if (s.alzada) escSelEstampa(); else escSelAlza(true); s.dx += 6; s.dy += 6; escGuarda(); escAviso(tr('Copia hecha: arrastra para ponerla en otro sitio')); }
  else if (que === 'voltear' || que === 'voltearV') {
    escSelAlza(); const d = new Uint8Array(s.dat.length);
    for (let b = 0; b < s.h; b++) for (let a = 0; a < s.w; a++) d[b * s.w + a] = que === 'voltear' ? s.dat[b * s.w + (s.w - 1 - a)] : s.dat[(s.h - 1 - b) * s.w + a];
    s.dat = d; s.cv = null;
  }
  else if (que === 'borrar') {
    if (!s.alzada) escSelAlza();
    escSelOlvida(); escGuarda(); play('tick'); escPincelRefresca(); MIESC.sucio = true; return;
  }
  else if (que === 'listo') { escSelSuelta(); return; }
  play('pop'); MIESC.sucio = true;
}
function escSelPinta(c) {
  const k = MIESC.vista.k || 1, r = escenarioSala().pint.r, t = MIESC.t || 0, raya = (x, y, w, h) => {
    c.save(); c.lineWidth = 3 / k; c.strokeStyle = OL; c.strokeRect(x, y, w, h);
    c.setLineDash([6 / k, 5 / k]); c.lineDashOffset = -t * 30 / k; c.lineWidth = 1.6 / k; c.strokeStyle = '#ffcb3d'; c.strokeRect(x, y, w, h); c.restore();
  };
  const s = SEL_ESC.s;
  if (s) {
    const x = (s.i0 + s.dx) * r, y = (s.j0 + s.dy) * r;
    if (s.alzada) { c.save(); c.imageSmoothingEnabled = false; c.globalAlpha = 0.95; c.drawImage(escSelLienzo(s), x, y, s.w * r, s.h * r); c.restore(); }
    raya(x, y, s.w * r, s.h * r); MIESC.sucio = true;      // la raya se mueve (hormiguitas)
  }
  const m = SEL_ESC.marca;
  if (m) { const i0 = Math.min(m.a[0], m.b[0]), j0 = Math.min(m.a[1], m.b[1]); raya(i0 * r, j0 * r, (Math.abs(m.b[0] - m.a[0]) + 1) * r, (Math.abs(m.b[1] - m.a[1]) + 1) * r); }
}

/* ---------- el panel ---------- */
// la fila de opciones va justo debajo de la de herramientas (se crea la primera vez)
function escOpcFila() {
  let f = E('esc-opc');
  if (!f) { f = document.createElement('div'); f.id = 'esc-opc'; f.className = 'esc-herr esc-opc'; E('esc-herr').after(f); }
  return f;
}
function escBoton(fila, clase, titulo, dentro, activo, alTocar) {
  const b = document.createElement('button'); b.type = 'button'; b.className = 'esc-h ' + clase + (activo ? ' activa' : ''); b.title = titulo; b.setAttribute('aria-label', titulo);
  dentro(b); b.onclick = alTocar; fila.appendChild(b); return b;
}
const escConIcono = (ic, n) => b => { b.innerHTML = '<i></i><small></small>'; ponIcono(b.firstChild, ic); b.lastChild.textContent = n; };
// el dibujito de un estampado en su botón
function escPatronMuestra(b, patron) {
  const [cv, g] = lienzo(24, 24, true); g.fillStyle = '#1d2536'; g.fillRect(0, 0, 24, 24); g.fillStyle = PINCEL_ESC.color;
  for (let j = 0; j < 12; j++) for (let i = 0; i < 12; i++) if (escPatronSi(i, j, patron, 2)) g.fillRect(i * 2, j * 2, 2, 2);
  cv.className = 'esc-muestra'; b.appendChild(cv);
}
function escPincelHerr(id) {
  if (PINCEL_ESC.herr === 'sel' && id !== 'sel') escSelSuelta();
  PINCEL_ESC.herr = id; play('select'); escPincelRefresca();
  const pista = { pixel: 'Toca o arrastra para pintar cuadraditos. Acércate con dos dedos para ver la rejilla', espray: 'Mantén el dedo para echar más pintura',
    linea: 'Arrastra de un punto a otro', rect: 'Arrastra de una esquina a la otra', elipse: 'Arrastra para dibujar el círculo', patron: 'Elige un estampado y pinta encima',
    sel: 'Arrastra para elegir un trozo de tu pintura' }[id];
  if (pista) escAviso(tr(pista));
}
function escPincelRefresca() {
  const fila = E('esc-herr'); if (!fila) return; fila.innerHTML = '';
  for (const [id, n, ic] of ESC_HERR) escBoton(fila, '', tr(n), escConIcono(ic, tr(n)), PINCEL_ESC.herr === id, () => escPincelHerr(id));
  const h = PINCEL_ESC.herr, opc = escOpcFila(); opc.innerHTML = '';
  const sep = () => { const s = document.createElement('i'); s.className = 'esc-sep'; opc.appendChild(s); };      // una rayita entre grupos
  const grosores = () => RADIOS_ESC.forEach((r, i) => escBoton(opc, 'grosor', tr('Grosor {n}', { n: i + 1 }), b => { const d = document.createElement('span'); d.style.width = d.style.height = (5 + i * 5) + 'px'; b.appendChild(d); }, PINCEL_ESC.radio === i, () => { PINCEL_ESC.radio = i; play('select'); escPincelRefresca(); }));
  if (['pincel', 'goma', 'espray', 'linea'].includes(h)) grosores();
  if (h === 'pixel') {
    PIXELES_ESC.forEach((n, i) => escBoton(opc, 'grosor cuadro', tr('Píxel {n}', { n: i + 1 }), b => { const d = document.createElement('span'); d.style.width = d.style.height = (4 + i * 5) + 'px'; b.appendChild(d); }, PINCEL2.pixel === i, () => { PINCEL2.pixel = i; play('select'); escPincelRefresca(); MIESC.sucio = true; }));
    sep();
    escBoton(opc, '', tr('Rejilla'), escConIcono('rejilla', tr('Rejilla')), PINCEL2.rejilla, () => { PINCEL2.rejilla = !PINCEL2.rejilla; play('select'); escPincelRefresca(); MIESC.sucio = true; });
  }
  if (h === 'rect' || h === 'elipse') {
    for (const [f, n] of [['borde', 'Borde'], ['relleno', 'Relleno']]) escBoton(opc, '', tr(n), escConIcono(f, tr(n)), PINCEL2.forma === f, () => { PINCEL2.forma = f; play('select'); escPincelRefresca(); });
    if (PINCEL2.forma === 'borde') { sep(); grosores(); }
  }
  if (h === 'patron') {
    for (const p of PATRONES_ESC) escBoton(opc, 'muestra', tr({ cuadros: 'Cuadros', rayasH: 'Rayas', rayasV: 'Barras', diagonal: 'Diagonal', lunares: 'Lunares' }[p]), b => escPatronMuestra(b, p), PINCEL2.patron === p, () => { PINCEL2.patron = p; play('select'); escPincelRefresca(); });
    sep();
    PATRON_TAM.forEach((n, i) => escBoton(opc, 'grosor cuadro', tr('Tamaño {n}', { n: i + 1 }), b => { const d = document.createElement('span'); d.style.width = d.style.height = (4 + i * 5) + 'px'; b.appendChild(d); }, PINCEL2.patronTam === i, () => { PINCEL2.patronTam = i; play('select'); escPincelRefresca(); }));
    sep();
    escBoton(opc, '', tr('Rellenar'), escConIcono('cubo', tr('Rellenar')), PINCEL2.patronCubo, () => { PINCEL2.patronCubo = !PINCEL2.patronCubo; play('select'); escPincelRefresca(); });
    if (!PINCEL2.patronCubo) grosores();
  }
  if (h === 'sel' && SEL_ESC.s)
    for (const [q, n, ic] of [['copiar', 'Copiar', 'copiar'], ['voltear', 'Voltear', 'voltear'], ['voltearV', 'Darle la vuelta', 'voltearV'], ['borrar', 'Borrar', 'quitar'], ['listo', 'Listo', 'hecho']])
      escBoton(opc, q === 'borrar' ? 'malo' : q === 'listo' ? 'activa' : '', tr(n), escConIcono(ic, tr(n)), false, () => { escSelAccion(q); escPincelRefresca(); });
  if (opc.children.length) sep();
  escBoton(opc, '', tr('Espejo'), escConIcono('espejo', tr('Espejo')), PINCEL2.espejo, escEspejoCambia);
  escBoton(opc, '', tr('Deshacer'), escConIcono('deshacer', tr('Deshacer')), false, escDeshace);
  escBoton(opc, '', tr('Rehacer'), escConIcono('rehacer', tr('Rehacer')), false, escRehace);
  escBoton(opc, 'malo', tr('Borrar todo'), escConIcono('escoba', tr('Borrar todo')), false, escBorraTodo);
  escPincelColores();
}
function escPincelColores() {
  const cols = E('esc-colores'); cols.innerHTML = '';
  const libre = document.createElement('label'); libre.className = 'esc-libre'; libre.title = tr('Color libre: el que quieras');
  libre.innerHTML = '<input type="color"><i></i><small></small>'; libre.querySelector('input').value = PINCEL_ESC.color; libre.querySelector('i').style.background = PINCEL_ESC.color; libre.querySelector('small').textContent = tr('Color libre');
  libre.querySelector('input').addEventListener('input', e => { PINCEL_ESC.color = e.target.value.toLowerCase(); libre.querySelector('i').style.background = PINCEL_ESC.color; if (PINCEL_ESC.herr === 'goma' || PINCEL_ESC.herr === 'gota') PINCEL_ESC.herr = 'pincel'; });
  libre.querySelector('input').addEventListener('change', e => escPonColor(e.target.value));
  cols.appendChild(libre);
  for (const h of [...PINCEL_ESC.recientes, ...COLORES_ESC]) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'esc-col' + (h === PINCEL_ESC.color && PINCEL_ESC.herr !== 'goma' ? ' activa' : ''); b.style.background = h; b.setAttribute('aria-label', h);
    b.onclick = () => { play('tick'); escPonColor(h); }; cols.appendChild(b);
  }
}
