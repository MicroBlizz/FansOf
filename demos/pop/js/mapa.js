// Fans of Pop · MAPA: el camino de un mundo (como los juegos de niveles: una carretera que serpentea con un nivel en cada
// burbuja). Arriba, el mundo con flechas para ir a los ya abiertos y, si su jefe está ganado, el interruptor NORMAL/DIFÍCIL
// (el difícil se pinta de noche). Abajo, los corazones con el reloj del siguiente, las estrellas, las monedas y el equipo.
// Se arrastra para ver los niveles pasados; tocar uno ya pasado lo repite (para sacar más estrellas).
'use strict';
const PP_MAPA = { cam: null, obj: 0, m: null, dif: false, toque: null };
const PP_PASO = 128;   // distancia entre niveles
let PP_NODOS_MAPA = [], PP_BOTONES_MAPA = [];
function ppNivelPos(i) { return [270 + Math.sin(i * 1.15) * 140, PP_V.H * 0.64 - (i - PP_MAPA.cam) * PP_PASO]; }
function ppMapaVer(m, dif) { PP_MAPA.m = m; PP_MAPA.dif = !!dif; PP_MAPA.cam = null; }
// la manita que señala: dibujo de Yoshi (img/i-mano.png, Daniel eligió la semilla 11): manita kawaii con el ÍNDICE hacia
// abajo, el pulgar al lado y el puño rosa. La punta del índice está en la columna 16 de 22 de la fila de abajo: se coloca
// para que caiga justo en el centro del objetivo y pulsa arriba y abajo. Si aún no está, una flechita.
const PP_MANO_PUNTA = 16.5 / 22;
function ppMano(c, x, y, t) {
  const b = Math.abs(Math.sin(t * 5)) * 16, im = PP_IMG['i-mano'];
  c.save(); c.imageSmoothingEnabled = PP_LISO;
  if (im) { const s = PP_LISO ? 66 / im.width : 3, w = im.width * s, h = im.height * s; c.drawImage(im, Math.round(x - w * PP_MANO_PUNTA), Math.round(y - h - b + 3), w, h); }
  else { c.translate(x, y - b); c.beginPath(); c.moveTo(0, 0); c.lineTo(16, -28); c.lineTo(-16, -28); c.closePath(); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#7a3a7a'; c.stroke(); }
  c.restore();
}
// el fondo de NOCHE del modo difícil: el mismo dibujo, oscurecido a azul noche y con estrellitas que parpadean
function ppNoche(c, t) {
  c.save();
  c.globalCompositeOperation = 'multiply'; c.fillStyle = '#5a64c8'; c.fillRect(0, 0, 540, PP_V.H);
  c.globalCompositeOperation = 'source-over'; c.fillStyle = 'rgba(16,20,64,0.32)'; c.fillRect(0, 0, 540, PP_V.H);
  for (let k = 0; k < 28; k++) {
    const x = (k * 157) % 530 + 5, y = (k * 241) % (PP_V.H * 0.8), a = 0.35 + 0.65 * Math.abs(Math.sin(t * 1.6 + k * 2.3)), s = 3 + (k % 3) * 2;
    c.globalAlpha = a; c.fillStyle = k % 4 ? '#fff6c8' : '#ffd1ec';
    c.beginPath(); c.moveTo(x, y - s * 2); c.quadraticCurveTo(x, y, x + s * 2, y); c.quadraticCurveTo(x, y, x, y + s * 2); c.quadraticCurveTo(x, y, x - s * 2, y); c.quadraticCurveTo(x, y, x, y - s * 2); c.fill();
  }
  c.restore();
}
// una moneda en el lienzo (dibujo de Yoshi; si aún no está, una bolita dorada)
function ppMoneda(c, x, y, s) {
  if (ppDibujaEn(c, 'i-moneda', x, y, PP_LISO ? s * 1.25 : s, true)) return;
  c.beginPath(); c.arc(x, y, s * 0.42, 0, Math.PI * 2); c.fillStyle = '#ffd64a'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#c98a12'; c.stroke();
}
// una perla (la moneda de pago); si aún no está el dibujo, una bolita rosa nacarada
function ppPerla(c, x, y, s) {
  if (ppDibujaEn(c, 'i-perla', x, y, PP_LISO ? s * 1.25 : s, true)) return;
  c.beginPath(); c.arc(x, y, s * 0.4, 0, Math.PI * 2); c.fillStyle = '#ffd1ec'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#c43a84'; c.stroke();
  c.beginPath(); c.arc(x - s * 0.12, y - s * 0.12, s * 0.1, 0, Math.PI * 2); c.fillStyle = '#fff'; c.fill();
}
// un botón redondo de caramelo con una flecha (dibujada, sin emojis)
function ppFlecha(c, x, y, dir) {
  c.save(); c.translate(x, y);
  c.beginPath(); c.arc(0, 0, 26, 0, Math.PI * 2); c.fillStyle = '#ff9ccf'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#c43a84'; c.stroke();
  c.beginPath(); c.moveTo(-8 * dir, -12); c.lineTo(10 * dir, 0); c.lineTo(-8 * dir, 12); c.closePath(); c.fillStyle = '#fff'; c.fill();
  c.restore();
}
function ppPintaMapa(c, t) {
  const P = PP_P, actual = ppMundoActual();
  if (PP_MAPA.m === null || PP_MAPA.m > actual) ppMapaVer(actual, false);
  if (PP_MAPA.dif && !ppDifAbierto(PP_MAPA.m)) PP_MAPA.dif = false;
  const m = PP_MAPA.m, dif = PP_MAPA.dif, M = PP_MUNDOS[m], inicio = ppInicioMundo(m), N = M.niveles, va = ppVaPor(m, dif);
  const est = dif ? P.estD : P.est;
  if (PP_MAPA.cam === null) { PP_MAPA.cam = Math.max(0, Math.min(va, N - 1) - 1); PP_MAPA.obj = Math.min(va, N - 1); }
  PP_MAPA.cam += (PP_MAPA.obj - PP_MAPA.cam) * (PP_MAPA.toque ? 0.5 : 0.08);   // la cámara sube sola hasta el nivel que toca
  ppPintaFondo(c, M.fondo, t, dif);
  // la carretera: borde rosa, centro blanco y puntitos de colores
  c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
  const tramo = (ancho, color, dash) => { c.beginPath(); c.setLineDash(dash || []); for (let i = 0; i < N; i++) { const [x, y] = ppNivelPos(i); if (i) c.lineTo(x, y); else c.moveTo(x, y); } c.lineWidth = ancho; c.strokeStyle = color; c.stroke(); };
  tramo(46, dif ? '#8a8ff0' : '#ff9ccf'); tramo(34, '#fffaf2'); tramo(8, dif ? '#c8ccff' : '#ffd1ec', [2, 22]);
  c.restore();
  PP_NODOS_MAPA = []; PP_BOTONES_MAPA = [];
  for (let i = N - 1; i >= 0; i--) {
    const [x, y] = ppNivelPos(i); if (y < -90 || y > PP_V.H + 90) continue;
    const g = inicio + i, hecho = i < va, aqui = i === va, jefe = ppEsJefe(g), dificil = ppEsDificil(g);
    const late = aqui ? 1 + Math.sin(t * 5) * 0.06 : 1, r = (jefe ? 60 : 46) * late;
    c.save(); if (i > va) c.globalAlpha = 0.6;
    if (aqui) { c.beginPath(); c.arc(x, y, r + 14 + Math.sin(t * 5) * 4, 0, Math.PI * 2); c.fillStyle = 'rgba(255,255,255,0.7)'; c.fill(); }
    const col = jefe ? 'amarillo' : PP_COLORES[i % PP_COLORES.length], sp = 'b-' + col + (hecho ? '-abajo' : '-arriba');
    if (!ppDibujaEn(c, sp, x, y, r * 2.3, true)) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = ppColorBurbuja(i % 6, 1); c.fill(); c.lineWidth = 4; c.strokeStyle = '#7a4a8a'; c.stroke(); }
    if (jefe) ppSlimeRepuestoOImagen(c, 'ceo', x, y - 4, 30, t, 1);
    else ppTexto(c, String(g + 1), x, y + 2, 46, '#fff', 'center', dificil || dif ? '#3a3a9a' : '#7a4a8a');
    c.restore();
    // debajo: las estrellas ganadas, o lo que hay en el nivel
    if (hecho) for (let k = 0; k < 3; k++) ppEstrella(c, x - 30 + k * 30, y + r + 10, 26, k < (est[g] || 0));
    else if (jefe) ppTexto(c, tr('¡JEFE!'), x, y + r + 12, 26, '#ff8a2a', 'center', '#fff');
    else if (!dif && M.amigos.includes(i + 1)) ppTexto(c, tr('¡Amigo!'), x, y + r + 12, 22, '#ff6ec7', 'center', '#fff');
    else if (dificil) ppTexto(c, tr('Difícil'), x, y + r + 12, 22, '#c43a84', 'center', '#fff');
    if (aqui) ppMano(c, x, y, t);
    if (i <= va) PP_NODOS_MAPA.push({ x, y, r: r + 26, g, dif });
  }
  // arriba: el mundo, con flechas a los otros mundos abiertos, y el interruptor normal / difícil
  c.fillStyle = 'rgba(255,255,255,0.6)'; c.beginPath(); c.roundRect(20, 18, 500, 96, 24); c.fill();
  ppTitulo(c, tr('Mundo {n}', { n: m + 1 }), 270, 52, 40);
  ppTexto(c, tr(M.nombre) + (dif ? ' · ' + tr('Difícil') : ''), 270, 92, 28, '#fff', 'center', dif ? '#3a3a9a' : '#c43a84');
  if (m > 0) { ppFlecha(c, 58, 66, -1); PP_BOTONES_MAPA.push({ x: 58, y: 66, r: 40, f: () => ppMapaVer(m - 1, false) }); }
  if (m < actual) { ppFlecha(c, 482, 66, 1); PP_BOTONES_MAPA.push({ x: 482, y: 66, r: 40, f: () => ppMapaVer(m + 1, false) }); }
  if (ppDifAbierto(m)) {
    const y = 148;
    c.fillStyle = 'rgba(255,255,255,0.75)'; c.beginPath(); c.roundRect(110, y - 26, 320, 52, 26); c.fill();
    c.fillStyle = dif ? '#4a54c8' : '#ff6eb5'; c.beginPath(); c.roundRect(dif ? 270 : 114, y - 22, 156, 44, 22); c.fill();
    ppTexto(c, tr('NORMAL'), 192, y + 1, 26, dif ? '#c43a84' : '#fff', 'center', dif ? '#fff' : '#c43a84');
    ppTexto(c, tr('DIFÍCIL'), 348, y + 1, 26, dif ? '#fff' : '#4a54c8', 'center', dif ? '#2a2a7a' : '#fff');
    PP_BOTONES_MAPA.push({ x: 192, y, r: 60, f: () => { if (dif) ppMapaVer(m, false); } }, { x: 348, y, r: 60, f: () => { if (!dif) ppMapaVer(m, true); } });
  }
  // abajo: corazones (con el reloj del siguiente), estrellas, monedas y el equipo
  const yb = PP_V.H - 176;
  c.fillStyle = 'rgba(255,255,255,0.6)'; c.beginPath(); c.roundRect(20, yb, 500, 136, 24); c.fill();
  const vidas = ppVidas();
  for (let i = 0; i < PP_CFG.vida; i++) ppCorazon(c, 50 + i * 38, yb + 32, 32, i < vidas);
  if (vidas < PP_CFG.vida) ppTexto(c, tr('+1 en {t}', { t: ppReloj(ppFaltaVida()) }), 34, yb + 64, 22, '#fff', 'left', '#c43a84');
  ppEstrella(c, 262, yb + 32, 34, true); ppTexto(c, String(P.estrellas), 280, yb + 34, 28, '#fff', 'left', '#7a4a8a');
  ppMoneda(c, 340, yb + 32, 34); ppTexto(c, String(SAVE.monedas), 358, yb + 34, 28, '#fff', 'left', '#c98a12');
  // las perlas, con un «+» que abre la tienda
  ppPerla(c, 432, yb + 32, 34); ppTexto(c, String(SAVE.perlas || 0), 450, yb + 34, 28, '#fff', 'left', '#c43a84');
  c.beginPath(); c.arc(500, yb + 20, 13, 0, Math.PI * 2); c.fillStyle = '#4fc964'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#26924a'; c.stroke();
  c.fillStyle = '#fff'; c.fillRect(494, yb + 18, 12, 4); c.fillRect(498, yb + 14, 4, 12);
  PP_BOTONES_MAPA.push({ x: 450, y: yb + 30, r: 52, f: ppTienda });
  const nh = ppHuecos();
  for (let k = 0; k < nh; k++) {
    const x = 270 + (k - (nh - 1) / 2) * 62, y = yb + 100, id = P.equipo[k];
    c.beginPath(); c.arc(x, y, 26, 0, Math.PI * 2); c.fillStyle = id ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.35)'; c.fill(); c.lineWidth = 3; c.strokeStyle = id ? '#ff6ec7' : 'rgba(122,74,138,0.3)'; c.stroke();
    if (id) ppSlimeRepuestoOImagen(c, id, x, y - 2, 20, t, 1);
  }
}
/* ---------- tocar y arrastrar el mapa ---------- */
function ppMapaAbajo(lx, ly) { PP_MAPA.toque = { x: lx, y: ly, y0: ly, obj0: PP_MAPA.obj, movido: false }; }
function ppMapaMueve(lx, ly) {
  const q = PP_MAPA.toque; if (!q) return;
  if (Math.abs(ly - q.y0) > 14) q.movido = true;
  if (q.movido && PP_MAPA.m !== null) PP_MAPA.obj = clamp(q.obj0 + (ly - q.y0) / PP_PASO, 0, PP_MUNDOS[PP_MAPA.m].niveles - 1);   // bajar el dedo enseña los de más arriba
}
function ppMapaArriba() {
  const q = PP_MAPA.toque; PP_MAPA.toque = null;
  if (!q || q.movido) return;
  for (const b of PP_BOTONES_MAPA) if (Math.hypot(q.x - b.x, q.y - b.y) <= b.r) { play('select'); b.f(); return; }
  for (const nd of PP_NODOS_MAPA) if (Math.hypot(q.x - nd.x, q.y - nd.y) <= nd.r) { play('ppNodo'); ppEntra(nd.g, nd.dif); return; }
}
