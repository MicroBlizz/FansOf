// Fans of Rouflage (prototipo) · EL MAPA EN MARCHA: pinta el mundo (entero o un trozo, a cualquier tamaño), guarda el fondo que se ve
// y la «verdad» (el color de cada punto del mundo, para el cuentagotas y para medir el camuflaje), y responde a las preguntas del
// juego: ¿se puede pisar aquí?, ¿hasta dónde llega la luz?, ¿se ven estos dos?, ¿por dónde se va de aquí a allí?
'use strict';

const ESC_FONDO = 2;     // el fondo se guarda al doble de tamaño para que se vea nítido en el móvil
const MAPA = { id: '', fondo: null, px: null, dibujos: {}, libre: new Uint8Array(0), coste: new Uint8Array(0), porY: [] };
const TODO = { x0: 0, y0: 0, x1: 0, y1: 0 };
const cruzan = (a, R) => a.x0 < R.x1 && a.x0 + a.w > R.x0 && a.y0 < R.y1 && a.y0 + a.h > R.y0;

// pinta el suelo, los muros, las paredes y los carteles del trozo R (el lienzo ya está puesto en unidades del mundo)
function pintaMundo(c, R) {
  if (MAPA_ACT && MAPA_ACT.esc) { pintaMundoEsc(c, R); return; }      // un escenario de «Mi escenario» hecho mapa (mapa-escenario.js)
  c.save(); c.beginPath(); c.rect(R.x0, R.y0, R.x1 - R.x0, R.y1 - R.y0); c.clip();
  pintaMuro(c, R);
  for (const z of ZONAS) {
    if (z.px > R.x1 || z.px + z.pw < R.x0 || z.py > R.y1 || z.py + z.ph < R.y0) continue;
    c.save(); c.beginPath(); c.rect(z.px, z.py, z.pw, z.ph); c.clip(); SUELOS[z.suelo](c, z, R); pintaPatron(c, z, R); pintaLamparas(c, z); c.restore();
  }
  PEGATINAS.forEach(([x, y, t], i) => { if (x > R.x0 - 40 && x < R.x1 + 40 && y > R.y0 - 40 && y < R.y1 + 40) pintaPegatina(c, x, y, t, i); });
  for (const m of MUEBLES) if (cruzan(m.dib, R)) sombraMueble(c, m);
  pintaBordes(c, R);
  pintaCaras(c, R);
  for (const k of CARTELES) if (k.x > R.x0 - 140 && k.x < R.x1 + 140 && k.y > R.y0 - 40 && k.y < R.y1 + 40) pintaCartel(c, k);
  pintaGrano(c, R);
  c.restore();
}
// LOS PATRONES: los suelos fáciles (pensados para el móvil) llevan además un patrón regular y suave de dos tonos (franjas de cortacésped,
// losetas de moqueta, losas, baldosas): se copia con el cuadrado y un par de colores de la paleta, pero rellenarse con el cubo de un solo
// color ya no basta. Va alineado a la cuadrícula del mundo (dos salas seguidas del mismo suelo casan). `f` es cuánto cambia el tono alterno:
// más oscuro o, con `claro` (en los suelos oscuros, donde lo oscuro casi no se nota), más claro.
const PATRONES = {      // los lados, más pequeños que un colado (48 × 60): siempre pisa los dos tonos
  cesped: { tipo: 'franjas', lado: 24, f: 0.12 }, gravilla: { tipo: 'franjas', lado: 24, f: 0.12 }, alfombraRoja: { tipo: 'franjas', lado: 20, f: 0.12 },
  moquetaBk: { tipo: 'losetas', lado: 30, f: 0.1 }, moquetaGris: { tipo: 'losetas', lado: 30, f: 0.1 }, moquetaHab: { tipo: 'losetas', lado: 24, f: 0.1 },
  pasarela: { tipo: 'losetas', lado: 30, f: 0.1, claro: true }, acera: { tipo: 'losetas', lado: 30, f: 0.12 }, marmol: { tipo: 'losetas', lado: 30, f: 0.1 },
};
function pintaPatron(c, z, R) {
  const P = PATRONES[z.suelo]; if (!P) return;
  const T = P.lado, [i0, i1, j0, j1] = rango(z, R, T);
  c.fillStyle = P.claro ? `rgba(255,255,255,${P.f})` : `rgba(32,16,44,${P.f})`; c.beginPath();
  for (let j = j0; j < j1; j++) {
    if (P.tipo === 'franjas') { if (j & 1) c.rect(i0 * T, j * T, (i1 - i0) * T, T); continue; }      // franjas: una de cada dos filas
    for (let i = i0; i < i1; i++) if ((i + j) & 1) c.rect(i * T, j * T, T, T);      // losetas: al tresbolillo, como un damero
  }
  c.fill();
}
// EL GRANO Y LAS LÁMPARAS: ningún suelo ni pared es de un color plano del todo. Un grano fino (fibras de la moqueta, el poro del asfalto, el
// césped) por encima de todo, y en cada sala las lámparas del techo: charcos de luz tenue y las esquinas algo más oscuras. Así rellenarse de
// un solo color no da el 100 % ni en el suelo más liso: hay que copiar también las luces y las sombras. Todo con azar repetible (hash2).
const GRANO = { amp: 14, lado: 96, lienzo: null };      // amplitud del gris (de 128) y lado del mosaico, en unidades del mundo
function pintaGrano(c, R) {
  if (!GRANO.lienzo) {
    const [cv, g] = lienzo(GRANO.lado, GRANO.lado), d = g.createImageData(GRANO.lado, GRANO.lado);
    for (let j = 0; j < GRANO.lado; j++) for (let i = 0; i < GRANO.lado; i++) {
      const fino = hash2(i, j, 77) - 0.5, grueso = hash2(i >> 2, j >> 2, 78) - 0.5, v = 128 + (fino * 1.4 + grueso * 0.8) * GRANO.amp, k = (j * GRANO.lado + i) * 4;
      d.data[k] = d.data[k + 1] = d.data[k + 2] = limita(Math.round(v), 0, 255); d.data[k + 3] = 255;
    }
    g.putImageData(d, 0, 0); GRANO.lienzo = cv;
  }
  c.save(); c.globalCompositeOperation = 'soft-light'; c.fillStyle = c.createPattern(GRANO.lienzo, 'repeat');
  c.fillRect(R.x0, R.y0, R.x1 - R.x0, R.y1 - R.y0); c.restore();
}
function pintaLamparas(c, z) {
  const PASO = 170, s = (z.px * 7 + z.py * 13) | 0;
  c.save();
  // las esquinas de la sala, algo más oscuras: la luz no llega igual a todas partes
  const r = Math.hypot(z.pw, z.ph) / 2, g = c.createRadialGradient(z.px + z.pw / 2, z.py + z.ph / 2, r * 0.25, z.px + z.pw / 2, z.py + z.ph / 2, r);
  g.addColorStop(0, 'rgba(32,16,44,0)'); g.addColorStop(1, 'rgba(32,16,44,0.12)');
  c.fillStyle = g; c.fillRect(z.px, z.py, z.pw, z.ph);
  // los charcos de luz de las lámparas del techo, en una rejilla con un poco de vaivén
  c.globalCompositeOperation = 'soft-light';
  const nx = Math.max(1, Math.round(z.pw / PASO)), ny = Math.max(1, Math.round(z.ph / PASO));
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const x = z.px + z.pw * (i + 0.5) / nx + (hash2(i, j, s) - 0.5) * 30, y = z.py + z.ph * (j + 0.5) / ny + (hash2(i, j, s + 1) - 0.5) * 30, rad = 70 + hash2(i, j, s + 2) * 40;
    const l = c.createRadialGradient(x, y, 0, x, y, rad); l.addColorStop(0, 'rgba(255,255,255,0.4)'); l.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = l; c.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  c.restore();
}

// deja un mapa como el actual y lo construye entero. Cambiar de mapa borra lo que se guardaba del anterior (paleta, señuelos, dibujos)
function cargaMapa(id) {
  cargaDatosMapa(id); MAPA.id = MAPA_ACT.id;
  TODO.x1 = ANCHO; TODO.y1 = ALTO;
  MAPA.dibujos = {}; MAPA.libre = new Uint8Array(MW * MH); MAPA.coste = new Uint8Array(MW * MH);
  _g = new Float32Array(MW * MH); _de = new Int32Array(MW * MH); _visto = new Uint8Array(MW * MH);
  COSA_PUERTA.y = PUERTA.y + PUERTA.h - 2;
  preparaMuebles();
  if (typeof olvidaPaleta === 'function') olvidaPaleta();
  if (typeof olvidaSenuelos === 'function') olvidaSenuelos();
  construyeMapa();
}
function construyeMapa() {
  // 1) el fondo que se ve
  let c;
  [MAPA.fondo, c] = lienzo(ANCHO * ESC_FONDO, ALTO * ESC_FONDO);
  c.scale(ESC_FONDO, ESC_FONDO); pintaMundo(c, TODO);
  // 2) un dibujo por cada tipo de mueble, y lo que tapa (su alfa a tamaño real, para saber qué trozo de alubia esconde)
  MAPA.porY = MUEBLES.slice().sort((a, b) => a.y - b.y);
  for (const m of MUEBLES) {
    if (!MAPA.dibujos[m.clave]) {
      const [cv, g] = lienzo(m.dib.w * ESC_FONDO, m.dib.h * ESC_FONDO);
      g.scale(ESC_FONDO, ESC_FONDO); g.translate(m.ox, m.oy); if (m.f) g.scale(-1, 1); m.T.pinta(g, m);      // (m.f: volteado, en Mi escenario)
      const [, g1] = lienzo(m.dib.w, m.dib.h, true);
      g1.translate(m.ox, m.oy); if (m.f) g1.scale(-1, 1); m.T.pinta(g1, m);
      const d = g1.getImageData(0, 0, m.dib.w, m.dib.h).data, alfa = new Uint8Array(m.dib.w * m.dib.h);
      for (let i = 0; i < alfa.length; i++) alfa[i] = d[i * 4 + 3];
      MAPA.dibujos[m.clave] = { cv, alfa };
    }
    m.dibujo = MAPA.dibujos[m.clave];
  }
  // 3) la verdad: el mundo con todos sus muebles, a tamaño real
  const [, g] = lienzo(ANCHO, ALTO, true);
  pintaMundo(g, TODO);
  for (const m of MAPA.porY) pintaMueble(g, m);
  MAPA.px = g.getImageData(0, 0, ANCHO, ALTO).data;
  // 4) por dónde pueden andar los bots: suelo sin muebles; pegado a un obstáculo cuesta más, para que no vayan rozando
  for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) {
    const x0 = i * CEL, y0 = j * CEL;
    MAPA.libre[j * MW + i] = GRID[j * MW + i] === SUELO && !MUEBLES.some(m => m.pisa.x0 - 12 < x0 + CEL && m.pisa.x1 + 12 > x0 && m.pisa.y0 - 2 < y0 + CEL && m.pisa.y1 + 10 > y0) ? 1 : 0;
  }
  for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) {
    let junto = 0;
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= MW || b >= MH || !MAPA.libre[b * MW + a]) junto = 1; }
    MAPA.coste[j * MW + i] = junto ? 14 : 0;
  }
}

/* ---------- leer colores ---------- */
// el color más repetido alrededor de un punto del mundo (así un borde entre dos baldosas no da un color mezclado)
function cuentagotas(x, y) {
  x = limita(Math.round(x), 2, ANCHO - 3); y = limita(Math.round(y), 2, ALTO - 3);
  // el color exacto del punto tocado, si no es una mezcla de borde (tiene al menos dos vecinos de su mismo color): así se pueden coger
  // los detalles finos (rayas, letras, bordes de muebles), que antes perdían la votación contra el color de alrededor
  const k0 = (y * ANCHO + x) * 4, F = MAPA.px; let iguales = 0;
  for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
    if (!i && !j) continue;
    const q = ((y + j) * ANCHO + x + i) * 4; if (difColor(F[k0], F[k0 + 1], F[k0 + 2], F[q], F[q + 1], F[q + 2]) < 10) iguales++;
  }
  if (iguales >= 2) return rgbHex(F[k0], F[k0 + 1], F[k0 + 2]);
  const votos = new Map(); let mejor = null, max = 0;
  for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) {
    const k = ((y + j) * ANCHO + x + i) * 4, r = MAPA.px[k], g = MAPA.px[k + 1], b = MAPA.px[k + 2], clave = ((r >> 2) << 12) | ((g >> 2) << 6) | (b >> 2);
    const v = votos.get(clave) || { n: 0, r, g, b }; v.n += (i === 0 && j === 0 ? 1.5 : 1); votos.set(clave, v);
    if (v.n > max) { max = v.n; mejor = v; }
  }
  return rgbHex(mejor.r, mejor.g, mejor.b);
}
// ¿hay un mueble por delante (más cerca de la cámara que yPies) que tape este punto?
function tapado(x, y, delante) {
  for (const m of delante) {
    const i = x - m.dib.x0, j = y - m.dib.y0;
    if (i >= 0 && j >= 0 && i < m.dib.w && j < m.dib.h && m.dibujo.alfa[j * m.dib.w + i] > 110) return true;
  }
  return false;
}

/* ---------- pisar ---------- */
const MEDIO_PIE = 13, FONDO_PIE = 10;   // la caja de los pies: lo que choca con muros y muebles
function chocaCaja(x0, y0, x1, y1) {
  const i0 = Math.floor(x0 / CEL), i1 = Math.floor((x1 - 0.01) / CEL), j0 = Math.floor(y0 / CEL), j1 = Math.floor((y1 - 0.01) / CEL);
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) if (i < 0 || j < 0 || i >= MW || j >= MH || GRID[j * MW + i] !== SUELO) return true;
  if (PUERTA.cerrada && x0 < PUERTA.x + PUERTA.w && x1 > PUERTA.x && y0 < PUERTA.y + PUERTA.h && y1 > PUERTA.y) return true;
  if (barreraCerrada() && enBarreraCaja(x0, y0, x1, y1)) return true;      // Mi escenario (barreras.js)
  if (portazoCaja(x0, y0, x1, y1)) return true;      // la puerta cerrada de un portazo de fantasma (fantasma-efectos.js)
  for (const m of MUEBLES) if (x0 < m.pisa.x1 && x1 > m.pisa.x0 && y0 < m.pisa.y1 && y1 > m.pisa.y0) return true;
  return false;
}
const cabe = (x, y) => !chocaCaja(x - MEDIO_PIE, y - FONDO_PIE, x + MEDIO_PIE, y);
// mueve a alguien lo que se pueda: primero a lo ancho y luego a lo alto, así resbala por las paredes en vez de pararse
function mueve(e, dx, dy) {
  let movido = false;
  for (let n = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 6)), k = 0; k < n; k++) {
    if (dx && cabe(e.x + dx / n, e.y)) { e.x += dx / n; movido = true; }
    if (dy && cabe(e.x, e.y + dy / n)) { e.y += dy / n; movido = true; }
  }
  return movido;
}

/* ---------- ver ---------- */
// hasta dónde llega un rayo desde (x, y) en la dirección (dx, dy) antes de dar con algo que no sea suelo (como mucho, max).
// RAYO.cara dice si lo que ha tocado es una pared de frente (a esa la luz sí la ilumina).
const RAYO = { cara: false };
// `hol`: los últimos píxeles del rayo no cuentan para los muebles (quien se esconde pegado a uno no queda tapado por él)
function rayo(x, y, dx, dy, max, hol = 0) {
  const t = rayoMapa(x, y, dx, dy, max), m = rayoMueble(x, y, dx, dy, t);
  if (m < t - hol) { RAYO.cara = false; return m; }
  return t;
}
// los muebles (lo que no se puede cruzar andando) también paran la luz y la vista: el rayo se corta donde entra en la caja de su base.
// Los PEQUEÑOS no (un cono, una papelera, un extintor, una silla…: base de 400 o menos y no muy altos): la linterna pasa por encima y no dejan
// sombras enormes detrás (pedido por Daniel el 26-10-2026). Los altos y finos (farolas, pilares, árboles) sí siguen tapando
const _chico = {};
const muebleChico = t => (t in _chico ? _chico[t] : (_chico[t] = !!(TIPOS_MUEBLE[t] && TIPOS_MUEBLE[t].w * TIPOS_MUEBLE[t].d <= 400 && TIPOS_MUEBLE[t].h < 60)));
function rayoMueble(x, y, dx, dy, max) {
  let mejor = max;
  for (const m of MUEBLES) {
    const q = m.pisa; if (!q || muebleChico(m.t)) continue;
    if (x > q.x0 && x < q.x1 && y > q.y0 && y < q.y1) continue;   // quien está dentro de la caja (pegado al mueble) no se tapa a sí mismo
    let t0 = 0, t1 = mejor;
    if (dx) { const a = (q.x0 - x) / dx, b = (q.x1 - x) / dx; t0 = Math.max(t0, Math.min(a, b)); t1 = Math.min(t1, Math.max(a, b)); } else if (x <= q.x0 || x >= q.x1) continue;
    if (dy) { const a = (q.y0 - y) / dy, b = (q.y1 - y) / dy; t0 = Math.max(t0, Math.min(a, b)); t1 = Math.min(t1, Math.max(a, b)); } else if (y <= q.y0 || y >= q.y1) continue;
    if (t0 < t1 && t0 < mejor) mejor = t0;
  }
  return mejor;
}
function rayoMapa(x, y, dx, dy, max) {
  let i = Math.floor(x / CEL), j = Math.floor(y / CEL);
  const si = dx > 0 ? 1 : -1, sj = dy > 0 ? 1 : -1, tdx = dx ? Math.abs(CEL / dx) : Infinity, tdy = dy ? Math.abs(CEL / dy) : Infinity;
  let tx = dx ? (dx > 0 ? (i + 1) * CEL - x : x - i * CEL) / Math.abs(dx) : Infinity, ty = dy ? (dy > 0 ? (j + 1) * CEL - y : y - j * CEL) / Math.abs(dy) : Infinity;
  RAYO.cara = false;
  for (;;) {
    let t;
    if (tx < ty) { t = tx; tx += tdx; i += si; } else { t = ty; ty += tdy; j += sj; }
    if (t >= max) return max;
    const g = i < 0 || j < 0 || i >= MW || j >= MH ? VACIO : GRID[j * MW + i];
    if (g !== SUELO) { RAYO.cara = g === CARA; return t; }
    if (PUERTA.cerrada && i >= 16 && i < 20 && j >= 35 && j < 39) return t;
    if (BARRERAS.length && barreraCerrada() && enBarreraCelda(i, j)) return t;
    if (portazoCelda(i, j)) return t;
  }
}
function seVen(ax, ay, bx, by) {
  const d = lejos(ax, ay, bx, by); if (d < 1) return true;
  return rayo(ax, ay, (bx - ax) / d, (by - ay) / d, d, 10) >= d - 0.5;
}

/* ---------- caminos (A* sobre las casillas libres) ---------- */
const celdaLibre = (i, j) => i >= 0 && j >= 0 && i < MW && j < MH && MAPA.libre[j * MW + i] === 1 && !(PUERTA.cerrada && i >= 16 && i < 20 && j >= 35 && j < 39) && !(BARRERAS.length && barreraCerrada() && enBarreraCelda(i, j)) && !portazoCelda(i, j);
// la casilla libre más cercana a un punto
function casillaCerca(x, y) {
  const i0 = limita(Math.floor(x / CEL), 0, MW - 1), j0 = limita(Math.floor(y / CEL), 0, MH - 1);
  if (celdaLibre(i0, j0)) return [i0, j0];
  for (let r = 1; r < 12; r++) { let mejor = null, md = 1e9;
    for (let j = j0 - r; j <= j0 + r; j++) for (let i = i0 - r; i <= i0 + r; i++) if (celdaLibre(i, j)) { const d = lejos(x, y, i * CEL + 10, j * CEL + 10); if (d < md) { md = d; mejor = [i, j]; } }
    if (mejor) return mejor; }
  return null;
}
// ¿se puede ir andando en línea recta de un punto a otro? (con un par de píxeles de holgura, para no rozar las esquinas)
function pasoLibre(ax, ay, bx, by) {
  const d = lejos(ax, ay, bx, by), n = Math.ceil(d / 4);
  for (let k = 1; k <= n; k++) { const t = k / n, x = ax + (bx - ax) * t, y = ay + (by - ay) * t; if (chocaCaja(x - MEDIO_PIE - 2, y - FONDO_PIE - 2, x + MEDIO_PIE + 2, y + 2)) return false; }
  return true;
}
let _g = new Float32Array(0), _de = new Int32Array(0), _visto = new Uint8Array(0);   // (al tamaño del mapa: los hace cargaMapa)
function buscaCamino(ax, ay, bx, by) {
  const a = casillaCerca(ax, ay), b = casillaCerca(bx, by); if (!a || !b) return null;
  const ini = a[1] * MW + a[0], fin = b[1] * MW + b[0];
  _g.fill(Infinity); _visto.fill(0); _g[ini] = 0; _de[ini] = -1;
  const abiertos = [ini], f = new Map([[ini, 0]]);
  while (abiertos.length) {
    let mi = 0; for (let k = 1; k < abiertos.length; k++) if (f.get(abiertos[k]) < f.get(abiertos[mi])) mi = k;
    const n = abiertos[mi]; abiertos[mi] = abiertos[abiertos.length - 1]; abiertos.pop();
    if (n === fin) break;
    if (_visto[n]) continue; _visto[n] = 1;
    const i = n % MW, j = (n / MW) | 0;
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
      if (!di && !dj) continue;
      const ni = i + di, nj = j + dj; if (!celdaLibre(ni, nj)) continue;
      if (di && dj && (!celdaLibre(i + di, j) || !celdaLibre(i, j + dj))) continue;   // sin cortar esquinas
      const m = nj * MW + ni, g = _g[n] + (di && dj ? 14 : 10) + MAPA.coste[m];
      if (g < _g[m]) { _g[m] = g; _de[m] = n; f.set(m, g + 10 * Math.max(Math.abs(ni - b[0]), Math.abs(nj - b[1]))); abiertos.push(m); }
    }
  }
  if (_g[fin] === Infinity) return null;
  const pts = [[bx, by]];
  for (let n = fin; n !== -1; n = _de[n]) pts.push([(n % MW) * CEL + 10, ((n / MW) | 0) * CEL + 14]);
  pts.reverse();
  // se quitan los puntos de en medio cuando se puede ir recto
  const camino = []; let desde = [ax, ay], k = 0;
  while (k < pts.length) {
    let lejosK = k;
    for (let q = Math.min(pts.length - 1, k + 14); q > k; q--) if (pasoLibre(desde[0], desde[1], pts[q][0], pts[q][1])) { lejosK = q; break; }
    camino.push(pts[lejosK]); desde = pts[lejosK]; k = lejosK + 1;
  }
  return camino;
}

/* ---------- sitios ---------- */
// un punto al azar donde cabe una alubia: dentro de una sala (no en un paso), lejos de los puntos de `lejosDe`
function sitioLibre({ sala = null, lejosDe = [], min = 70, pared = false, intentos = 400 } = {}) {
  for (let n = 0; n < intentos; n++) {
    const z = sala || pick(SALAS);
    let x = Math.round(z.px + 16 + Math.random() * (z.pw - 32)), y = Math.round(z.py + 12 + Math.random() * (z.ph - 14));
    if (pared) y = z.py + FONDO_PIE + 1 + ((Math.random() * 3) | 0);          // pegado a la pared de arriba
    if (!cabe(x, y) || celdaEn(x, y - 5) !== SUELO || !celdaLibre(Math.floor(x / CEL), Math.floor((y - 5) / CEL))) continue;
    if (pared && celdaEn(x, y - FONDO_PIE - 14) !== CARA) continue;
    if (lejosDe.some(p => lejos(p[0], p[1], x, y) < min)) continue;
    // no en la boca de una puerta
    if (PASOS.some(p => x > p.px - 46 && x < p.px + p.pw + 46 && y > p.py - 46 && y < p.py + p.ph + 56)) continue;
    return [x, y];
  }
  return null;
}
const salaDe = (x, y) => { const z = zonaEn(x, y - 5); return z && !z.paso ? z : null; };
