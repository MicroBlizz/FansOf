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

// Un bot se pinta solo, como lo haría una persona con maña de 0 a 1: COPIA el fondo que tiene detrás, pero a mano. La mano se va: todo el cuerpo
// queda descuadrado 1 o 2 píxeles, y va por franjas (como quien pinta de arriba abajo) que cada una se desvía un poco más y sale algo más ancha o más
// estrecha, así las baldosas y las rayas no clavan el ancho. Con poca maña, más descuadre, franjas más torcidas y un tono algo cambiado (pintura de bote).
function pintaBot(e, mana) {
  mana = limita(mana, 0, 1);
  const bx = Math.round(e.x) - PIE_X, by = Math.round(e.y) - PIE_Y, pal = _paletaBot(e, 1);
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
    c.drawImage(MAPA.fondo, (bx + dx) * ESC_FONDO, (by + y + dy) * ESC_FONDO, CAJA_W / ancho * ESC_FONDO, alto / altoF * ESC_FONDO, 0, y, CAJA_W, alto);
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
  const meta = 80 + Math.floor(Math.random() * 18);
  let mana = 0.95; pintaBot(e, mana);
  for (let n = 0; n < 8 && e.camo > meta && mana > 0.1; n++) { mana -= 0.12; pintaBot(e, mana); }
  return e.camo;
}

// ---------- EL CUARTEO ----------
// Durante la caza la pintura se seca y se cuartea: cada CUARTEO.cada segundos a cada colado congelado le sale una grieta (una línea fina de un tono
// más oscuro que su piel) y el camuflaje baja poco a poco (del 100 % a unos 85 % en dos minutos). Moverse a retocarse lo arregla (a riesgo de que te vean).
// Las grietas salen de la semilla del ente y del número de grieta: en el PvP todos los navegadores dibujan las mismas sin mandar nada por la red.
const CUARTEO = { cada: 5, grietas: 1, desde: 6 };      // cada cuánto, cuántas grietas cada vez, y a partir de qué segundo de caza empieza
function cuartea(e) {
  const c = e.pctx, M = formaDe(e).mascara, n = e.grietas = (e.grietas || 0) + 1;
  c.save(); c.globalCompositeOperation = 'source-atop'; c.scale(ESC_PIEL, ESC_PIEL); c.lineCap = 'round'; c.lineJoin = 'round';
  for (let g = 0; g < CUARTEO.grietas; g++) {
    const s = n * 7 + g, sem = e.slot >= 0 ? e.slot + 1 : Math.round(e.semilla * 1000), az = k => hash2(sem, s, k);      // en el PvP la semilla es la plaza: igual en todos los navegadores
    let x = 4 + az(1) * (CAJA_W - 8), y = 4 + az(2) * (CAJA_H - 8), t = 0;
    while (!M[Math.floor(y) * CAJA_W + Math.floor(x)] && ++t < 12) { x = 4 + az(10 + t) * (CAJA_W - 8); y = 4 + az(30 + t) * (CAJA_H - 8); }
    const d = c.getImageData(Math.floor(x * ESC_PIEL), Math.floor(y * ESC_PIEL), 1, 1).data, osc = d[0] * 0.3 + d[1] * 0.59 + d[2] * 0.11 < 90 ? 1.7 : 0.62;      // el tono de la grieta: la piel de ahí, más oscura (más clara si la piel es oscura)
    c.strokeStyle = rgbHex(d[0] * osc + (osc > 1 ? 30 : 0), d[1] * osc + (osc > 1 ? 30 : 0), d[2] * osc + (osc > 1 ? 30 : 0)); c.lineWidth = 0.7;
    c.beginPath(); c.moveTo(x, y);
    let a = az(3) * TAU;
    for (let k = 0; k < 3; k++) { a += (az(4 + k) - 0.5) * 1.6; const l = 1.5 + az(8 + k) * 2; x += Math.cos(a) * l; y += Math.sin(a) * l; c.lineTo(x, y); }
    c.stroke();
  }
  c.restore();
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
