// Fans of Rouflage · MI ESCENARIO, LAS HERRAMIENTAS DE PAINT (pedidas por Daniel el 27-10-2026): PÍXEL (cuadraditos exactos de 1, 2 o 4 celdas, con
// rejilla al acercar), ESPRAY, LÍNEA, RECTÁNGULO y CÍRCULO (borde o relleno), ESTAMPAR (cuadros, rayas, diagonales y lunares, con pincel o
// rellenando), ESPEJO (lo que pintas sale también al otro lado de una raya) y REHACER. Todo escribe en la rejilla de la pintura de
// escenario-pinta.js, solo en suelo y paredes (escMascara). SELECCIONAR y el panel están en escenario-pincel3.js. Va después de escenario-pincel.js.
'use strict';

const PINCEL2 = { pixel: 0, forma: 'borde', patron: 'cuadros', patronTam: 1, patronCubo: false, rejilla: true, espejo: false, eje: 0, rehacer: [], a: null, b: null, spray: 0, ultCel: null };
const PIXELES_ESC = [1, 2, 4];              // el lado del píxel, en celdas de la pintura (SALA.PR unidades cada una)
const PATRON_TAM = [1, 2, 4];               // el tamaño del estampado, en celdas
const PATRONES_ESC = ['cuadros', 'rayasH', 'rayasV', 'diagonal', 'lunares'];
const FORMAS_PINCEL = ['linea', 'rect', 'elipse'];
Object.assign(ICONOS, {
  pixel: '<path d="M4 4h5v5H4zM9 9h5v5H9zM14 14h5v5h-5zM14 4h5v5h-5z" fill="currentColor" fill-opacity=".85"/><path d="M4 4h15v15H4z" stroke-dasharray="1.6 1.8"/>',
  espray: '<path d="M7 10h7v10.5H7z"/><path d="M8.5 10V7.5h4V10M10.5 7.5V5.5h-3"/><circle cx="17" cy="5" r="1" fill="currentColor"/><circle cx="20" cy="7.5" r="1" fill="currentColor"/><circle cx="17.5" cy="9.5" r="1" fill="currentColor"/><circle cx="20.5" cy="3" r="1" fill="currentColor"/>',
  patron: '<path d="M4 4h16v16H4z"/><path d="M4 4h4v4H4zM12 4h4v4h-4zM8 8h4v4H8zM16 8h4v4h-4zM4 12h4v4H4zM12 12h4v4h-4zM8 16h4v4H8zM16 16h4v4h-4z" fill="currentColor" stroke="none"/>',
  seleccion: '<path d="M4 4h16v16H4z" stroke-dasharray="3 2.4"/><path d="M12 8.5v7M8.5 12h7" stroke-width="2.6"/>',
  rehacer: '<path d="M16 5l4.5 4.5L16 14"/><path d="M20.5 9.5H10a5.5 5.5 0 0 0 0 11h3"/>',
  espejo: '<path d="M12 2.5v19" stroke-dasharray="2 2.2"/><path d="M9.5 7 3.5 12l6 5zM14.5 7l6 5-6 5z" fill="currentColor"/>',
  rejilla: '<path d="M4 4h16v16H4zM9.3 4v16M14.7 4v16M4 9.3h16M4 14.7h16"/>',
  copiar: '<path d="M8.5 8.5h11v11h-11z"/><path d="M15.5 8.5v-4h-11v11h4"/>',
  voltearV: '<path d="M3 12h18" stroke-dasharray="2 2.6"/><path d="M7 9 17 3.5V9zM7 15l10 5.5V15z" fill="currentColor"/>',
  borde: '<rect x="4.5" y="5.5" width="15" height="13" rx="1.5" stroke-width="3"/>',
  relleno: '<rect x="4.5" y="5.5" width="15" height="13" rx="1.5" fill="currentColor"/>',
});

/* ---------- escribir celdas (con la máscara, el espejo y las baldosas por rehacer) ---------- */
const _escSuc = { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 };
// la celda espejo de i (la raya del espejo va entre dos celdas: PINCEL2.eje es la celda de su derecha)
const escEspejoI = i => 2 * PINCEL2.eje - 1 - i;
function escPonCel(i, j, v, sinEspejo) {
  const p = escenarioSala().pint, masc = escMascara();
  if (i >= 0 && j >= 0 && i < p.w && j < p.h && masc[j * p.w + i]) {
    p.cel[j * p.w + i] = v;
    if (i < _escSuc.x0) _escSuc.x0 = i; if (i > _escSuc.x1) _escSuc.x1 = i; if (j < _escSuc.y0) _escSuc.y0 = j; if (j > _escSuc.y1) _escSuc.y1 = j;
  }
  if (PINCEL2.espejo && !sinEspejo) { const k = escEspejoI(i); if (k !== i) escPonCel(k, j, v, true); }
}
// las baldosas de lo que se ha tocado se rehacen (y la pintura cambia de versión)
function escSucioFin() {
  if (_escSuc.x1 < 0) return;
  const p = escenarioSala().pint, r = p.r;
  p.ver++; escTilesSucias(escenarioSala(), _escSuc.x0 * r - 8, _escSuc.y0 * r - 8, (_escSuc.x1 + 1) * r + 8, (_escSuc.y1 + 1) * r + 8);
  _escSuc.x0 = _escSuc.y0 = 1e9; _escSuc.x1 = _escSuc.y1 = -1e9; MIESC.sucio = true;
}

/* ---------- REHACER ---------- */
function escRehace() {
  const d = PINCEL2.rehacer.pop(), p = escenarioSala().pint; if (!d) { play('deny'); return; }
  PINCEL_ESC.pasos.push(p.cel.slice()); p.cel.set(d); p.ver++; play('tick'); escGuarda(); escTodoSucio(); escPincelRefresca();
}

/* ---------- PÍXEL: un cuadradito exacto, alineado a su rejilla ---------- */
const escPixelLado = () => PIXELES_ESC[PINCEL2.pixel];
function escPixelEn(q) { const n = escPixelLado(), r = escenarioSala().pint.r; return [Math.floor(q.x / r / n), Math.floor(q.y / r / n)]; }
function escPixelBloque(bi, bj, v) { const n = escPixelLado(); for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) escPonCel(bi * n + i, bj * n + j, v); }
// de un bloque al siguiente sin dejar huecos (Bresenham en la rejilla de bloques)
function escPixelLinea(a, b, v) {
  let [x0, y0] = a; const [x1, y1] = b, dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy;
  for (let n = 0; n < 4000; n++) { escPixelBloque(x0, y0, v); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
}

/* ---------- ESPRAY: gotitas sueltas dentro del círculo del grosor ---------- */
function escSpray(q, v) {
  const p = escenarioSala().pint, R = RADIOS_ESC[PINCEL_ESC.radio], n = Math.ceil(4 + R * 0.5);
  for (let k = 0; k < n; k++) {
    const a = Math.random() * TAU, d = R * Math.sqrt(Math.random());
    escPonCel(Math.floor((q.x + Math.cos(a) * d) / p.r), Math.floor((q.y + Math.sin(a) * d) / p.r), v);
  }
  escSucioFin();
}

/* ---------- FORMAS: rectángulo y círculo (óvalo), con borde del grosor elegido o rellenos ---------- */
function escForma(a, b, tipo, v) {
  if (tipo === 'linea') { escTrazo(a, b, v); return; }      // la línea es un trazo del pincel de punta a punta (con su espejo: escSello)
  const p = escenarioSala().pint, r = p.r, x0 = Math.min(a.x, b.x), x1 = Math.max(a.x, b.x), y0 = Math.min(a.y, b.y), y1 = Math.max(a.y, b.y);
  if (x1 - x0 < r && y1 - y0 < r) return;
  const t = PINCEL2.forma === 'relleno' ? 1e9 : Math.max(r, RADIOS_ESC[PINCEL_ESC.radio]), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, rx = Math.max(r / 2, (x1 - x0) / 2), ry = Math.max(r / 2, (y1 - y0) / 2);
  for (let j = Math.floor(y0 / r); j <= Math.ceil(y1 / r); j++) for (let i = Math.floor(x0 / r); i <= Math.ceil(x1 / r); i++) {
    const x = (i + 0.5) * r, y = (j + 0.5) * r; let dentro, hueco;
    if (tipo === 'rect') { dentro = x >= x0 && x <= x1 && y >= y0 && y <= y1; hueco = x > x0 + t && x < x1 - t && y > y0 + t && y < y1 - t; }
    else { dentro = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1; hueco = rx > t && ry > t && ((x - cx) / (rx - t)) ** 2 + ((y - cy) / (ry - t)) ** 2 < 1; }
    if (dentro && !hueco) escPonCel(i, j, v);
  }
  escSucioFin();
}

/* ---------- ESTAMPAR: el dibujo del estampado decide qué celdas se pintan (las demás se quedan como estaban) ---------- */
function escPatronSi(i, j, patron = PINCEL2.patron, s = PATRON_TAM[PINCEL2.patronTam]) {
  const a = Math.floor(i / s), b = Math.floor(j / s);
  if (patron === 'cuadros') return ((a + b) & 1) === 0;
  if (patron === 'rayasH') return (b & 1) === 0;
  if (patron === 'rayasV') return (a & 1) === 0;
  if (patron === 'diagonal') return (Math.floor((i + j) / s) & 1) === 0;
  const u = (((i % (2 * s)) + 2 * s) % (2 * s)) - s + 0.5, w = (((j % (2 * s)) + 2 * s) % (2 * s)) - s + 0.5;      // lunares
  return u * u + w * w <= (s * 0.72) ** 2;
}
function escPatronSello(q, v) {
  const p = escenarioSala().pint, R = RADIOS_ESC[PINCEL_ESC.radio], rc = R / p.r, ci = q.x / p.r, cj = q.y / p.r;
  for (let j = Math.floor(cj - rc); j <= Math.ceil(cj + rc); j++) for (let i = Math.floor(ci - rc); i <= Math.ceil(ci + rc); i++)
    if ((i + 0.5 - ci) ** 2 + (j + 0.5 - cj) ** 2 <= rc * rc && escPatronSi(i, j)) escPonCel(i, j, v);
  escSucioFin();
}
function escPatronTrazo(a, b, v) {
  const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / Math.max(1, RADIOS_ESC[PINCEL_ESC.radio] * 0.4)));
  for (let k = 1; k <= n; k++) escPatronSello({ x: a.x + (b.x - a.x) * k / n, y: a.y + (b.y - a.y) * k / n }, v);
}
// el cubo con estampado: la zona que rellenaría el cubo, pero solo las celdas del dibujo
function escPatronRellena(q, v) {
  const p = escenarioSala().pint, [i0, j0] = escCelda(q); if (i0 < 0 || j0 < 0 || i0 >= p.w || j0 >= p.h) return;
  const masc = escMascara(), k0 = j0 * p.w + i0, zona = masc[k0], de = p.cel[k0]; if (!zona) return;
  const visto = new Uint8Array(p.w * p.h), pila = [k0], lista = []; visto[k0] = 1;
  while (pila.length) {
    const k = pila.pop(), i = k % p.w, j = (k - i) / p.w; lista.push(k);
    for (const n of [i > 0 ? k - 1 : -1, i < p.w - 1 ? k + 1 : -1, j > 0 ? k - p.w : -1, j < p.h - 1 ? k + p.w : -1])
      if (n >= 0 && !visto[n] && p.cel[n] === de && masc[n] === zona) { visto[n] = 1; pila.push(n); }
  }
  for (const k of lista) { const i = k % p.w, j = (k - i) / p.w; if (escPatronSi(i, j)) escPonCel(i, j, v); }
  escSucioFin();
}

/* ---------- el ESPEJO: la raya va donde miras al encenderlo ---------- */
function escEspejoCambia() {
  PINCEL2.espejo = !PINCEL2.espejo;
  if (PINCEL2.espejo) { const r = escenarioSala().pint.r; PINCEL2.eje = Math.round(MIESC.cam.x / r); escAviso(tr('Espejo: lo que pintas sale también al otro lado de la raya')); }
  play('select'); MIESC.sucio = true; escPincelRefresca();
}
const escEspejoX = () => PINCEL2.eje * escenarioSala().pint.r;

/* ---------- los dedos: las herramientas nuevas (devuelven true si el toque era suyo) ---------- */
const escHerrNueva = h => ['pixel', 'espray', 'patron'].includes(h) || FORMAS_PINCEL.includes(h);
function escPincel2Abajo(q) {
  const h = PINCEL_ESC.herr; if (h === 'sel') return escSelAbajo(q);
  if (!escHerrNueva(h)) return false;
  const v = escIndiceColor(PINCEL_ESC.color);
  if (FORMAS_PINCEL.includes(h)) { PINCEL2.a = q; PINCEL2.b = q; PINCEL_ESC.pintando = true; return true; }      // la forma se pinta al soltar
  if (!escDentro(q)) return true;
  escGuardaPaso(); PINCEL_ESC.pintando = true; PINCEL_ESC.ultimo = q;
  if (h === 'pixel') { PINCEL2.ultCel = escPixelEn(q); escPixelBloque(...PINCEL2.ultCel, v); escSucioFin(); }
  else if (h === 'espray') { escSpray(q, v); clearInterval(PINCEL2.spray); PINCEL2.spray = setInterval(() => { if (PINCEL_ESC.pintando && PINCEL_ESC.ultimo) escSpray(PINCEL_ESC.ultimo, escIndiceColor(PINCEL_ESC.color)); }, 45); }
  else if (h === 'patron') { if (PINCEL2.patronCubo) { escPatronRellena(q, v); PINCEL_ESC.pintando = false; play('pop'); escGuarda(); } else escPatronSello(q, v); }
  return true;
}
function escPincel2Mueve(q) {
  const h = PINCEL_ESC.herr; if (h === 'sel') return escSelMueve(q);
  if (!escHerrNueva(h)) return false;
  if (!PINCEL_ESC.pintando) return true;
  const v = escIndiceColor(PINCEL_ESC.color);
  if (FORMAS_PINCEL.includes(h)) PINCEL2.b = q;
  else if (h === 'pixel') { const c = escPixelEn(q); if (c[0] !== PINCEL2.ultCel[0] || c[1] !== PINCEL2.ultCel[1]) { escPixelLinea(PINCEL2.ultCel, c, v); escSucioFin(); PINCEL2.ultCel = c; } }
  else if (h === 'espray') escSpray(q, v);
  else if (h === 'patron') escPatronTrazo(PINCEL_ESC.ultimo, q, v);
  PINCEL_ESC.ultimo = q; return true;
}
function escPincel2Arriba() {
  const h = PINCEL_ESC.herr; if (h === 'sel') return escSelArriba();
  if (!escHerrNueva(h)) return false;
  clearInterval(PINCEL2.spray);
  if (!PINCEL_ESC.pintando) return true;
  PINCEL_ESC.pintando = false;
  if (FORMAS_PINCEL.includes(h) && PINCEL2.a) {
    const a = PINCEL2.a, b = PINCEL2.b; PINCEL2.a = PINCEL2.b = null;
    if (Math.hypot(b.x - a.x, b.y - a.y) < 3) { escAviso(tr('Arrastra el dedo para dibujar la forma')); return true; }
    escGuardaPaso(); escForma(a, b, h, escIndiceColor(PINCEL_ESC.color)); play('pop');
  }
  escGuarda(); return true;
}
function escPincel2Cancela() {
  const h = PINCEL_ESC.herr; clearInterval(PINCEL2.spray);
  if (h === 'sel') { escSelCancela(); return true; }
  if (FORMAS_PINCEL.includes(h)) { PINCEL2.a = PINCEL2.b = null; PINCEL_ESC.pintando = false; return true; }
  return false;
}

/* ---------- lo que se ve encima: la forma que dibujas, la rejilla del píxel, el espejo ---------- */
// lo que se ve del mapa ahora mismo (en unidades)
function escVisible() { const a = MIESC.area, v = escVista(); return { x0: (a.x0 - v.ox) / v.k, y0: (a.y0 - v.oy) / v.k, x1: (a.x1 - v.ox) / v.k, y1: (a.y1 - v.oy) / v.k }; }
function escPintaEncima2(c, q) {
  const k = MIESC.vista.k || 1, h = PINCEL_ESC.herr, R = escVisible();
  if (PINCEL2.espejo) {      // la raya del espejo
    const x = escEspejoX(); c.save(); c.setLineDash([8 / k, 6 / k]); c.lineWidth = 3 / k; c.strokeStyle = OL; c.beginPath(); c.moveTo(x, R.y0); c.lineTo(x, R.y1); c.stroke();
    c.lineWidth = 1.5 / k; c.strokeStyle = '#39d5e8'; c.stroke(); c.restore();
  }
  if (h === 'pixel') {
    const r = escenarioSala().pint.r, n = escPixelLado(), L = r * n;
    if (PINCEL2.rejilla && L * k >= 6) {      // la rejilla, solo si los cuadraditos se ven grandes
      c.save(); c.lineWidth = 1 / k; c.strokeStyle = 'rgba(255,246,234,0.28)'; c.beginPath();
      for (let x = Math.floor(R.x0 / L) * L; x <= R.x1; x += L) { c.moveTo(x, R.y0); c.lineTo(x, R.y1); }
      for (let y = Math.floor(R.y0 / L) * L; y <= R.y1; y += L) { c.moveTo(R.x0, y); c.lineTo(R.x1, y); }
      c.stroke(); c.restore();
    }
    if (q && escDentro(q)) { const [bi, bj] = escPixelEn(q); c.lineWidth = 2 / k; c.strokeStyle = OL; c.strokeRect(bi * L, bj * L, L, L); c.lineWidth = 1 / k; c.strokeStyle = PINCEL_ESC.color; c.strokeRect(bi * L, bj * L, L, L); }
  }
  if (FORMAS_PINCEL.includes(h) && PINCEL2.a && PINCEL2.b) {
    const a = PINCEL2.a, b = PINCEL2.b, dibuja = (a, b) => {
      c.beginPath();
      if (h === 'linea') { c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); }
      else if (h === 'rect') c.rect(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.abs(b.x - a.x), Math.abs(b.y - a.y));
      else c.ellipse((a.x + b.x) / 2, (a.y + b.y) / 2, Math.abs(b.x - a.x) / 2 + 0.01, Math.abs(b.y - a.y) / 2 + 0.01, 0, 0, TAU);
      if (h !== 'linea' && PINCEL2.forma === 'relleno') { c.fillStyle = PINCEL_ESC.color; c.fill(); } else { c.lineWidth = h === 'linea' ? RADIOS_ESC[PINCEL_ESC.radio] * 2 : Math.max(2, RADIOS_ESC[PINCEL_ESC.radio]); c.strokeStyle = PINCEL_ESC.color; c.lineCap = 'round'; c.stroke(); }
    };
    c.save(); c.globalAlpha = 0.7; dibuja(a, b);
    if (PINCEL2.espejo) { const X = escEspejoX(); dibuja({ x: 2 * X - a.x, y: a.y }, { x: 2 * X - b.x, y: b.y }); }
    c.restore();
  }
  if (h === 'sel') escSelPinta(c);
}
