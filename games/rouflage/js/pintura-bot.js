// Fans of Rouflage · LA PINTURA DE LA MÁQUINA Y EL CUARTEO: cómo se pinta un camaleón bot (como una persona: copia el fondo a mano, descuadrado
// 1 o 2 píxeles y por franjas que no clavan el ancho) y cómo
// se cuartea la pintura de todos durante la caza (grietas que bajan el camuflaje poco a poco: quedarse quieto al 100 % no dura para siempre).
'use strict';

// el color del fondo en un punto del mundo
function _colorFondo(x, y) { const F = MAPA.px, k = (limita(Math.round(y), 0, ALTO - 1) * ANCHO + limita(Math.round(x), 0, ANCHO - 1)) * 4; return [F[k], F[k + 1], F[k + 2]]; }
// los colores que «cogería con el cuentagotas» una persona: los n que más suelo cubren detrás de la alubia (agrupados por parecido)
function _paletaBot(e, n) {
  const bx = Math.round(e.x) - PIE_X, by = Math.round(e.y) - PIE_Y, M = formaDe(e).mascara, votos = new Map();
  for (let j = 1; j < CAJA_H; j += 2) for (let i = 1; i < CAJA_W; i += 2) if (M[j * CAJA_W + i]) {
    const [r, g, b] = _colorFondo(bx + i, by + j), clave = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4), v = votos.get(clave) || { n: 0, r: 0, g: 0, b: 0 };
    v.n++; v.r += r; v.g += g; v.b += b; votos.set(clave, v);
  }
  const lista = [...votos.values()].sort((a, b) => b.n - a.n).map(v => ({ n: v.n, r: v.r / v.n, g: v.g / v.n, b: v.b / v.n }));
  const pal = [];
  for (const c of lista) { if (pal.length >= n) break; if (!pal.some(p => difColor(p.r, p.g, p.b, c.r, c.g, c.b) < 18)) pal.push(c); }   // colores casi iguales cuentan como uno
  return pal;
}

// lo que la alubia tiene detrás, a la escala del fondo: el suelo y la pared (MAPA.fondo, que no lleva muebles) y encima los muebles que
// quedan por detrás de ella (los de delante la tapan y no cuentan). Es lo que copian el bot y la pintura rápida: delante de una máquina
// de bebidas, se pinta de máquina de bebidas (como mide el camuflaje, que compara con el mundo con sus muebles: MAPA.px)
let _DETRAS = null;
function detrasDe(e) {
  const M = 8, w = CAJA_W + 2 * M, h = CAJA_H + 2 * M, bx = Math.round(e.x) - PIE_X - M, by = Math.round(e.y) - PIE_Y - M;
  if (!_DETRAS) _DETRAS = lienzo(w * ESC_FONDO, h * ESC_FONDO);
  const [cv, g] = _DETRAS;
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height);
  g.drawImage(MAPA.fondo, bx * ESC_FONDO, by * ESC_FONDO, w * ESC_FONDO, h * ESC_FONDO, 0, 0, w * ESC_FONDO, h * ESC_FONDO);
  g.scale(ESC_FONDO, ESC_FONDO); g.translate(-bx, -by);
  const R = { x0: bx, y0: by, x1: bx + w, y1: by + h };
  for (const m of MAPA.porY) if (m.y <= e.y && cruzan(m.dib, R)) pintaMueble(g, m);
  return { cv, bx, by };
}

// Un bot se pinta solo, como lo haría una persona con maña de 0 a 1: COPIA el fondo que tiene detrás, pero a mano. La mano se va: todo el cuerpo
// queda descuadrado 1 o 2 píxeles, y va por franjas (como quien pinta de arriba abajo) que cada una se desvía un poco más y sale algo más ancha o más
// estrecha, así las baldosas y las rayas no clavan el ancho. Con poca maña, más descuadre, franjas más torcidas y un tono algo cambiado (pintura de bote).
function pintaBot(e, mana) {
  mana = limita(mana, 0, 1);
  const bx = Math.round(e.x) - PIE_X, by = Math.round(e.y) - PIE_Y, pal = _paletaBot(e, 1), D = detrasDe(e);
  if (!pal.length) return mideCamuflaje(e);
  rellena(e, rgbHex(pal[0].r, pal[0].g, pal[0].b));      // de base el color que más hay (por si alguna franja deja un hueco)
  const vaiven = 0.5 + (1 - mana) * 2.2;                  // cuánto se le va la mano, en píxeles del mundo
  let dx = rand(-vaiven, vaiven), dy = rand(-vaiven, vaiven);
  const c = e.pctx;
  c.save(); c.globalCompositeOperation = 'source-atop'; c.scale(ESC_PIEL, ESC_PIEL); c.imageSmoothingEnabled = false;
  for (let y = 0; y < CAJA_H;) {
    const alto = Math.min(CAJA_H - y, 5 + Math.round(rand(0, 7)));
    dx = limita(dx + rand(-vaiven, vaiven) * 0.6, -vaiven * 2, vaiven * 2); dy = limita(dy + rand(-vaiven, vaiven) * 0.35, -vaiven * 2, vaiven * 2);
    const ancho = 1 + rand(-1, 1) * (1 - mana) * 0.09, altoF = 1 + rand(-1, 1) * (1 - mana) * 0.09;      // esta franja sale algo más ancha o estrecha
    c.drawImage(D.cv, (bx + dx - D.bx) * ESC_FONDO, (by + y + dy - D.by) * ESC_FONDO, CAJA_W / ancho * ESC_FONDO, alto / altoF * ESC_FONDO, 0, y, CAJA_W, alto);
    y += alto;
  }
  const tono = (1 - mana) * 0.05; if (tono > 0.005) { c.fillStyle = Math.random() < 0.5 ? `rgba(255,255,255,${tono})` : `rgba(32,16,44,${tono})`; c.fillRect(0, 0, CAJA_W, CAJA_H); }
  c.restore();
  return mideCamuflaje(e);
}
// una pasada de pincel fino copiando el fondo tal cual (lo que hace una persona con paciencia y el calco puesto)
function afinaBot(e, parte = 1) {
  const bx = Math.round(e.x) - PIE_X, by = Math.round(e.y) - PIE_Y, F = MAPA.px, M = formaDe(e).mascara, c = e.pctx;
  c.save(); c.globalCompositeOperation = 'source-atop'; c.scale(ESC_PIEL, ESC_PIEL);
  for (let y = 0; y < CAJA_H; y += 2) for (let x = 0; x < CAJA_W; x += 2) {
    if (!(M[y * CAJA_W + x] || M[y * CAJA_W + x + 1] || M[(y + 1) * CAJA_W + x] || M[(y + 1) * CAJA_W + x + 1]) || (parte < 1 && Math.random() > parte)) continue;   // también los bordes de la silueta
    const wx = limita(bx + x + 1, 0, ANCHO - 1), wy = limita(by + y + 1, 0, ALTO - 1), k = (wy * ANCHO + wx) * 4;
    c.fillStyle = rgbHex(F[k], F[k + 1], F[k + 2]); c.fillRect(x, y, 2.4, 2.4);
  }
  c.restore(); mideCamuflaje(e);
}
// La tirada de dados de la máquina: cada vez que va a pintarse saca una meta entre 80 y 97 (nunca 100) y se pinta con la maña que haga falta
// para quedarse por debajo: si le sale mejor, repite con la mano más suelta (más descuadre). Si el fondo es tan difícil que no llega, se queda como le salga.
function pintaBotDados(e) {
  const R = REGLAS, t = R.botPintaMana > 0 && e.bot ? R.botPintaMana * limita(e.bot.mana + rand(-0.1, 0.1), 0, 1) + (1 - R.botPintaMana) * Math.random() : Math.random();
  const meta = R.botPintaMin + Math.floor(t * (R.botPintaMax - R.botPintaMin));
  let mana = 0.95; pintaBot(e, mana);
  for (let n = 0; n < 8 && e.camo > meta && mana > 0.1; n++) { mana -= 0.12; pintaBot(e, mana); }
  return e.camo;
}
// la pintura rápida (el botón del taller): como un bot con maña y, si sale por encima de REGLAS.rapidaMeta, con la mano más suelta
function pintaRapida(e) {
  pintaBot(e, 0.8);
  for (let m = 0.68; m > 0.1 && e.camo > REGLAS.rapidaMeta; m -= 0.12) pintaBot(e, m);
  return tapaHasta(e, REGLAS.rapidaMeta);
}
// si un camuflaje aún sale mejor de la cuenta: manos de color liso (el del suelo de debajo) por encima, cada vez más tapadoras, como quien pinta deprisa
function tapaHasta(e, meta) {
  if (e.camo <= meta) return e.camo;
  const color = cuentagotas(e.x, e.y - 20), c = e.pctx;
  for (let n = 0; n < 12 && e.camo > meta; n++) {
    c.save(); c.globalCompositeOperation = 'source-atop'; c.globalAlpha = 0.15; c.fillStyle = color; c.fillRect(0, 0, PIEL_W, PIEL_H); c.restore();
    mideCamuflaje(e);
  }
  return e.camo;
}

// ---------- EL DESGASTE DE LA PINTURA ----------
// Durante la caza la pintura se seca y se va estropeando, muy poco a poco: cada CUARTEO.cada segundos, a cada colado congelado unos puñados de píxeles
// de su piel le cambian de tono apenas (más claros, más oscuros, un pelín de otro matiz), en manchas suaves. Del 100 % a unos 85 % en dos minutos.
// Moverse a retocarse lo arregla (a riesgo de que te vean). Todo sale de la semilla del ente y del número de paso: en el PvP todos los navegadores
// dibujan lo mismo sin mandar nada por la red.
const CUARTEO = { cada: 2, grietas: 1, desde: 6 };      // cada cuánto, cuántos puñados cada vez, y a partir de qué segundo de caza empieza
// cambia de tono los píxeles de la piel dentro de `manchas` círculos suaves (radio en píxeles de caja); az(k) es el azar de cada decisión
function desgasta(e, az, manchas, radio, fuerza) {
  const c = e.pctx, M = formaDe(e).mascara, W = CAJA_W * ESC_PIEL, H = CAJA_H * ESC_PIEL, im = c.getImageData(0, 0, W, H), d = im.data;
  for (let m = 0; m < manchas; m++) {
    let x = 4 + az(m * 9 + 1) * (CAJA_W - 8), y = 4 + az(m * 9 + 2) * (CAJA_H - 8), t = 0;
    while (!M[Math.floor(y) * CAJA_W + Math.floor(x)] && ++t < 12) { x = 4 + az(m * 9 + 100 + t) * (CAJA_W - 8); y = 4 + az(m * 9 + 200 + t) * (CAJA_H - 8); }
    const r = radio * (0.7 + az(m * 9 + 3) * 0.6) * ESC_PIEL, cx = x * ESC_PIEL, cy = y * ESC_PIEL;
    const luz = (az(m * 9 + 4) - 0.5) * 2 * fuerza, tr_ = (az(m * 9 + 5) - 0.5) * fuerza * 0.4, tg = (az(m * 9 + 6) - 0.5) * fuerza * 0.4, tb = (az(m * 9 + 7) - 0.5) * fuerza * 0.4;
    for (let py = Math.max(0, Math.floor(cy - r)); py < Math.min(H, cy + r); py++) for (let px = Math.max(0, Math.floor(cx - r)); px < Math.min(W, cx + r); px++) {
      const q = (py * W + px) * 4; if (d[q + 3] < 200) continue;
      const dd = Math.hypot(px - cx, py - cy) / r; if (dd >= 1) continue;
      const k = (1 - dd) * (1 - dd) * (0.8 + 0.4 * az(1e4 + py * W + px));      // suave en el borde y con el grano de cada píxel
      d[q] = Math.max(0, Math.min(255, d[q] + (luz + tr_) * k)); d[q + 1] = Math.max(0, Math.min(255, d[q + 1] + (luz + tg) * k)); d[q + 2] = Math.max(0, Math.min(255, d[q + 2] + (luz + tb) * k));
    }
  }
  c.putImageData(im, 0, 0);
}
function cuartea(e) {
  const n = e.grietas = (e.grietas || 0) + 1, sem = e.slot >= 0 ? e.slot + 1 : Math.round(e.semilla * 1000);      // en el PvP la semilla es la plaza
  desgasta(e, k => hash2(sem, n * 7, k), 4 * CUARTEO.grietas, 5, 11);
}
// el agua se lleva la pintura: ablanda los tonos con manchas más grandes y, aquí y allá, arrastra un trocito de piel hacia abajo (un churrete que se va aclarando)
function arrastraAbajo(e, goteos, az) {
  const c = e.pctx, M = formaDe(e).mascara, W = CAJA_W * ESC_PIEL, H = CAJA_H * ESC_PIEL, im = c.getImageData(0, 0, W, H), d = im.data;
  for (let g = 0; g < goteos; g++) {
    const x0 = Math.floor((3 + az(g * 5 + 1) * (CAJA_W - 6)) * ESC_PIEL), y0 = Math.floor((3 + az(g * 5 + 2) * (CAJA_H * 0.6)) * ESC_PIEL);
    const ancho = 2 + Math.floor(az(g * 5 + 3) * 4), largo = Math.floor((4 + az(g * 5 + 4) * 9) * ESC_PIEL / 2);
    for (let px = x0; px < Math.min(W, x0 + ancho); px++) {
      const o = (y0 * W + px) * 4; if (d[o + 3] < 200) continue;
      const r0 = d[o], g0 = d[o + 1], b0 = d[o + 2];
      for (let l = 1; l <= largo; l++) {
        const py = y0 + l; if (py >= H) break;
        const q = (py * W + px) * 4; if (d[q + 3] < 200) break;
        const a = 0.55 * (1 - l / largo);      // el churrete se aclara según baja
        d[q] += (r0 - d[q]) * a; d[q + 1] += (g0 - d[q + 1]) * a; d[q + 2] += (b0 - d[q + 2]) * a;
      }
    }
  }
  c.putImageData(im, 0, 0);
}
// cada fotograma de la caza: a quien lleva este navegador (o a todos, si no hay red) le va saliendo su grieta; en el PvP los remotos también, con la misma semilla
function cuarteoAvanza(dt) {
  if (J.fase !== 'caza') return;
  const t = J.tFase; if (t < CUARTEO.desde) return;
  const n = Math.floor((t - CUARTEO.desde) / CUARTEO.cada) + 1;
  for (const k of J.camaleones) {
    if (k.fuera || !k.congelado || !k.pintado) continue;
    if ((k.grietas || 0) >= n) continue;
    cuartea(k);
    if (k === J.yo || k.bot || !J.pvp || (J.pvp && RFP.soyHost)) mideCamuflaje(k); else k.camo = Math.max(0, k.camo - 1);
    if (k === J.yo) { refrescaHud(); tutoDi('cam-grieta'); }
  }
}
