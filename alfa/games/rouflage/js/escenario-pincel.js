// Fans of Rouflage · MI ESCENARIO (el pincel): pintar el suelo y las paredes de tu escenario. Herramientas: pincel, goma, cubo (rellena lo
// del mismo color en ese suelo o esa pared, sin pasar a otro) y cuentagotas; cuatro grosores; deshacer y borrar todo. Colores: los de la
// paleta del juego y cualquier otro con el selector («color libre»), con los últimos usados a mano. La pintura es la rejilla de
// escenario-pinta.js (celdas de SALA.PR unidades sobre todo el mapa, con el índice de su color): se pinta directamente en ella, así lo que ves
// es lo que se guarda; el muro visto desde arriba no se pinta. Solo se rehacen las baldosas de debajo del pincel. Va después de escenario.js.
'use strict';
const PINCEL_ESC = { herr: 'pincel', radio: 1, color: '#ff4b5c', recientes: [], pasos: [], ultimo: null, pintando: false };
const RADIOS_ESC = [5, 10, 20, 38];
const COLORES_ESC = ['#fff6ea', '#cdb9ea', '#9aa3b5', '#5c606b', '#20102c', '#ff4b5c', '#ff6fb5', '#b45cff', '#3a2a5e', '#2e8bff', '#39d5e8', '#7ee04a',
  '#3c8f3d', '#ffcb3d', '#ff7a1a', '#d9a25b', '#8f6540', '#f1e6cc'];
const ESC_HERR = [['pincel', 'Pincel', 'pincel'], ['goma', 'Goma', 'goma'], ['cubo', 'Rellenar', 'cubo'], ['gota', 'Cuentagotas', 'gota']];

// el índice de un color en la paleta de la pintura (si se llena, se quitan los que ya no se usan; si aún así no cabe, el más parecido)
function escIndiceColor(hex) {
  const p = escenarioSala().pint; hex = hex.toLowerCase();
  let i = p.pal.indexOf(hex); if (i >= 0) return i + 1;
  if (p.pal.length >= 63) {
    const usa = new Uint8Array(64); for (const v of p.cel) usa[v] = 1;
    const mapa = new Uint8Array(64), pal = []; for (let v = 1; v <= p.pal.length; v++) if (usa[v]) { pal.push(p.pal[v - 1]); mapa[v] = pal.length; }
    for (let j = 0; j < p.cel.length; j++) p.cel[j] = mapa[p.cel[j]];
    p.pal = pal; p.ver++;
  }
  if (p.pal.length < 63) { p.pal.push(hex); return p.pal.length; }
  const [r, g, b] = hexRgb(hex); let mejor = 1, md = 1e9;
  p.pal.forEach((h, k) => { const [r2, g2, b2] = hexRgb(h), d = difColor(r, g, b, r2, g2, b2); if (d < md) { md = d; mejor = k + 1; } });
  return mejor;
}
const escCelda = q => { const p = escenarioSala().pint; return [Math.floor(q.x / p.r), Math.floor(q.y / p.r)]; };
// de qué es cada celda de la pintura: 0 muro (no se pinta) o 1 + el índice de su zona (suelo) o 300 + él (pared de frente)
function escMascara() {
  const sala = escenarioSala(), M = escMundo(sala.id), p = sala.pint;
  if (sala._masc && sala._mascM === M.id && sala._mascR === p.r) return sala._masc;
  const m = new Uint16Array(p.w * p.h), suelo = M.zonas.map(zo => M.zonas.findIndex(o => o.suelo === zo.suelo)), pared = M.zonas.map(zo => M.zonas.findIndex(o => o.pared === zo.pared));
  for (let j = 0; j < p.h; j++) for (let i = 0; i < p.w; i++) {
    const x = (i + 0.5) * p.r, y = (j + 0.5) * p.r, t = escTipoEn(M, x, y); if (t === VACIO) continue;
    const z = M.zonaDe[((y / CEL) | 0) * M.MW + ((x / CEL) | 0)];
    m[j * p.w + i] = (t === CARA ? 300 + (pared[z] || 0) : 1 + (suelo[z] || 0));      // el mismo suelo (o papel) cuenta como una sola zona
  }
  sala._masc = m; sala._mascM = M.id; sala._mascR = p.r; return m;
}
function escTodoSucio() { const s = escenarioSala(); escTilesSucias(s, -1e4, -1e4, 1e5, 1e5); MIESC.sucio = true; }
function escGuardaPaso() { const p = escenarioSala().pint; PINCEL_ESC.pasos.push(p.cel.slice()); if (PINCEL_ESC.pasos.length > 20) PINCEL_ESC.pasos.shift(); }
function escDeshace() { const d = PINCEL_ESC.pasos.pop(), p = escenarioSala().pint; if (!d) { play('deny'); return; } p.cel.set(d); p.ver++; play('tick'); escGuarda(); escTodoSucio(); }
function escBorraTodo() { const p = escenarioSala().pint; if (!p.cel.some(v => v)) return; escGuardaPaso(); p.cel.fill(0); p.ver++; play('pop'); escGuarda(); escTodoSucio(); escAviso(tr('Pintura borrada (puedes deshacerlo)')); }
// un toque redondo del pincel (o de la goma) en la rejilla, solo en suelo y paredes
function escSello(q, v) {
  const p = escenarioSala().pint, R = RADIOS_ESC[PINCEL_ESC.radio], rc = R / p.r, ci = q.x / p.r, cj = q.y / p.r, masc = escMascara();
  for (let j = Math.max(0, Math.floor(cj - rc)); j <= Math.min(p.h - 1, Math.ceil(cj + rc)); j++)
    for (let i = Math.max(0, Math.floor(ci - rc)); i <= Math.min(p.w - 1, Math.ceil(ci + rc)); i++)
      if ((i + 0.5 - ci) ** 2 + (j + 0.5 - cj) ** 2 <= rc * rc && masc[j * p.w + i]) p.cel[j * p.w + i] = v;
  p.ver++; escTilesSucias(escenarioSala(), q.x - R - 8, q.y - R - 8, q.x + R + 8, q.y + R + 8);
}
function escTrazo(a, b, v) {
  const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / Math.max(1, RADIOS_ESC[PINCEL_ESC.radio] * 0.4)));
  for (let k = 1; k <= n; k++) escSello({ x: a.x + (b.x - a.x) * k / n, y: a.y + (b.y - a.y) * k / n }, v);
}
// el cubo: rellena lo que toca del mismo color, sin pasar de un suelo a otro distinto ni de la pared al suelo (ni al revés)
function escRellena(q, v) {
  const p = escenarioSala().pint, [i0, j0] = escCelda(q); if (i0 < 0 || j0 < 0 || i0 >= p.w || j0 >= p.h) return;
  const masc = escMascara(), k0 = j0 * p.w + i0, zona = masc[k0], de = p.cel[k0];
  if (de === v || !zona) return;
  const igual = k => p.cel[k] === de && masc[k] === zona;
  const pila = [k0]; p.cel[k0] = v;
  while (pila.length) {
    const k = pila.pop(), i = k % p.w, j = (k - i) / p.w;
    if (i > 0 && igual(k - 1)) { p.cel[k - 1] = v; pila.push(k - 1); }
    if (i < p.w - 1 && igual(k + 1)) { p.cel[k + 1] = v; pila.push(k + 1); }
    if (j > 0 && igual(k - p.w)) { p.cel[k - p.w] = v; pila.push(k - p.w); }
    if (j < p.h - 1 && igual(k + p.w)) { p.cel[k + p.w] = v; pila.push(k + p.w); }
  }
  p.ver++; escTodoSucio();
}
// el cuentagotas: el color pintado o, si no hay, el de la sala debajo
function escCogeColor(q) {
  const sala = escenarioSala(), p = sala.pint, [i, j] = escCelda(q), v = i >= 0 && j >= 0 && i < p.w && j < p.h ? p.cel[j * p.w + i] : 0;
  if (v) return p.pal[v - 1];
  const [, g] = lienzo(1, 1, true); g.translate(-Math.round(q.x), -Math.round(q.y));      // el color del escenario debajo: un píxel suyo
  escPintaCrudo(g, escMundo(sala.id), { x0: Math.round(q.x) - 1, y0: Math.round(q.y) - 1, x1: Math.round(q.x) + 2, y1: Math.round(q.y) + 2 });
  const d = g.getImageData(0, 0, 1, 1).data;
  return rgbHex(d[0], d[1], d[2]);
}
const escDentro = q => escTipoEn(escMundoAct(), q.x, q.y) !== VACIO;
function escPincelAbajo(q) {
  if (!escDentro(q)) return;
  const h = PINCEL_ESC.herr;
  if (h === 'gota') { const c = escCogeColor(q); if (c) { escPonColor(c); PINCEL_ESC.herr = 'pincel'; escPincelRefresca(); play('select'); } return; }
  escGuardaPaso();
  if (h === 'cubo') { escRellena(q, escIndiceColor(PINCEL_ESC.color)); play('pop'); escGuarda(); MIESC.sucio = true; return; }
  PINCEL_ESC.pintando = true; PINCEL_ESC.ultimo = q; escSello(q, h === 'goma' ? 0 : escIndiceColor(PINCEL_ESC.color)); MIESC.sucio = true;
}
function escPincelMueve(q) {
  if (!PINCEL_ESC.pintando) return;
  escTrazo(PINCEL_ESC.ultimo, q, PINCEL_ESC.herr === 'goma' ? 0 : escIndiceColor(PINCEL_ESC.color)); PINCEL_ESC.ultimo = q;
}
function escPincelArriba() { if (!PINCEL_ESC.pintando) return; PINCEL_ESC.pintando = false; escGuarda(); }
// el trazo que se empezaba con un dedo, fuera (al poner el segundo dedo para el zoom)
function escPincelCancela() {
  if (!PINCEL_ESC.pintando) return; PINCEL_ESC.pintando = false;
  const d = PINCEL_ESC.pasos.pop(), p = escenarioSala().pint; if (d) { p.cel.set(d); p.ver++; escTodoSucio(); }
}
function escPintaCursor(c, q) {
  if (!escDentro(q) || PINCEL_ESC.herr === 'cubo' || PINCEL_ESC.herr === 'gota') return;
  const r = RADIOS_ESC[PINCEL_ESC.radio];
  c.lineWidth = 2.5; c.strokeStyle = OL; c.beginPath(); c.arc(q.x, q.y, r, 0, TAU); c.stroke();
  c.lineWidth = 1.2; c.strokeStyle = PINCEL_ESC.herr === 'goma' ? '#fff6ea' : PINCEL_ESC.color; c.beginPath(); c.arc(q.x, q.y, r, 0, TAU); c.stroke();
}
function escPonColor(hex) {
  hex = hex.toLowerCase(); PINCEL_ESC.color = hex; if (PINCEL_ESC.herr === 'goma' || PINCEL_ESC.herr === 'gota') PINCEL_ESC.herr = 'pincel';
  if (!COLORES_ESC.includes(hex)) { const r = PINCEL_ESC.recientes; const i = r.indexOf(hex); if (i >= 0) r.splice(i, 1); r.unshift(hex); r.length = Math.min(r.length, 6); }
  escPincelRefresca();
}
// el panel: herramientas, grosores, deshacer y borrar todo; luego los colores
function escPincelRefresca() {
  const fila = E('esc-herr'); fila.innerHTML = '';
  const boton = (clase, titulo, dentro, activo, alTocar) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'esc-h ' + clase + (activo ? ' activa' : ''); b.title = titulo; b.setAttribute('aria-label', titulo);
    dentro(b); b.onclick = alTocar; fila.appendChild(b); return b;
  };
  for (const [id, n, ic] of ESC_HERR) boton('', tr(n), b => { b.innerHTML = '<i></i><small></small>'; ponIcono(b.firstChild, ic); b.lastChild.textContent = tr(n); }, PINCEL_ESC.herr === id, () => { PINCEL_ESC.herr = id; play('select'); escPincelRefresca(); });
  RADIOS_ESC.forEach((r, i) => boton('grosor', tr('Grosor {n}', { n: i + 1 }), b => { const d = document.createElement('span'); d.style.width = d.style.height = (5 + i * 5) + 'px'; b.appendChild(d); }, PINCEL_ESC.radio === i, () => { PINCEL_ESC.radio = i; if (PINCEL_ESC.herr === 'cubo' || PINCEL_ESC.herr === 'gota') PINCEL_ESC.herr = 'pincel'; play('select'); escPincelRefresca(); }));
  boton('', tr('Deshacer'), b => { b.innerHTML = '<i></i><small></small>'; ponIcono(b.firstChild, 'deshacer'); b.lastChild.textContent = tr('Deshacer'); }, false, escDeshace);
  boton('malo', tr('Borrar todo'), b => { b.innerHTML = '<i></i><small></small>'; ponIcono(b.firstChild, 'escoba'); b.lastChild.textContent = tr('Borrar todo'); }, false, escBorraTodo);
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
function preparaPincelEsc() { /* el panel se rehace al entrar en PINTAR (escPincelRefresca) */ }
