// Fans of Pop · PINTAR: todo lo que va en el lienzo (540 de ancho, PP_V.H de alto). El tablero de silicona con sus burbujas
// (dibujadas a mano para poder aplastarlas), los slimes dentro, el marcador de arriba (corazones, toques y equipo),
// el mapa de la ruta y la portada. Los dibujos de Yoshi se usan si están (sprites.js); si no, el repuesto pintado.
'use strict';
const PP_V = { H: 960, sc: 1, dpr: 1 };
const PP_FUENTE = "'Jersey 10', monospace";
/* ---------- geometría del tablero ---------- */
function ppGeom(n) { const lado = 440, x = 50, y = Math.round(PP_V.H / 2 - lado / 2 - 40); return { n, x, y, lado, celda: lado / n }; }
function ppCentro(g, i) { const x = i % g.n, y = (i - x) / g.n; return [g.x + (x + 0.5) * g.celda, g.y + (y + 0.5) * g.celda]; }
function ppCeldaEn(g, lx, ly) { if (lx < g.x || ly < g.y || lx >= g.x + g.lado || ly >= g.y + g.lado) return -1; return Math.floor((ly - g.y) / g.celda) * g.n + Math.floor((lx - g.x) / g.celda); }
// los colores del juguete: una fila de cada color
const PP_FILAS = [[345, 85, 70], [25, 95, 62], [52, 95, 60], [130, 65, 55], [195, 85, 58], [270, 70, 68]];
function ppColorBurbuja(i, n, luz = 0) { const [h, s, l] = PP_FILAS[Math.floor(i / n) % PP_FILAS.length]; return `hsl(${h} ${s}% ${Math.min(96, l + luz)}%)`; }
/* ---------- texto ---------- */
function ppTexto(c, s, x, y, tam, col = '#fff', alinea = 'center', borde = '#1a1030') {
  c.font = `${tam}px ${PP_FUENTE}`; c.textAlign = alinea; c.textBaseline = 'middle';
  c.lineJoin = 'round'; c.lineWidth = Math.max(3, tam / 8); c.strokeStyle = borde; c.strokeText(s, x, y);
  c.fillStyle = col; c.fillText(s, x, y);
}
function ppTitulo(c, s, x, y, tam) { c.save(); ppTexto(c, s, x + 4, y + 6, tam, '#1a1030', 'center', '#1a1030'); ppTexto(c, s, x, y, tam, '#ffd64a'); c.restore(); }
/* ---------- fondo ---------- */
function ppPintaFondo(c, k, t) {
  const im = PP_IMG[k];
  if (im) { c.imageSmoothingEnabled = false; c.drawImage(im, 0, 0, 540, PP_V.H); }
  else {
    const gr = c.createLinearGradient(0, 0, 0, PP_V.H); gr.addColorStop(0, k === 'fondo-jefe' ? '#2a1a1a' : '#1a1040'); gr.addColorStop(1, k === 'fondo-jefe' ? '#0d0808' : '#0b0620');
    c.fillStyle = gr; c.fillRect(0, 0, 540, PP_V.H);
  }
  // burbujitas flotando siempre, encima del fondo
  c.save(); c.globalAlpha = 0.18;
  for (let k2 = 0; k2 < 14; k2++) { const y = (PP_V.H + 40 - ((t * (18 + k2 * 4) + k2 * 173) % (PP_V.H + 80))), x = (k2 * 97 + Math.sin(t + k2) * 20) % 540; c.beginPath(); c.arc(x, y, 6 + (k2 % 4) * 4, 0, Math.PI * 2); c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke(); }
  c.restore();
}
/* ---------- una burbuja ---------- */
function ppBurbuja(c, cx, cy, r, i, n, up, slime, pista, trampa, t) {
  const [sx, sy, h] = ppAnim(i, up);
  const col = ppColorBurbuja(i, n), oscuro = ppColorBurbuja(i, n, -28), claro = ppColorBurbuja(i, n, 22);
  c.save(); c.translate(cx, cy);
  if (h > 0.05) {
    // la cúpula: sombra, cuerpo con luz arriba a la izquierda, brillo
    const rr = r * (0.85 + 0.15 * h);
    c.save(); c.scale(sx, sy);
    c.beginPath(); c.ellipse(4 * h, 6 * h, rr, rr * 0.95, 0, 0, Math.PI * 2); c.fillStyle = 'rgba(0,0,0,0.35)'; c.fill();
    const gr = c.createRadialGradient(-rr * 0.35, -rr * 0.4, rr * 0.1, 0, 0, rr); gr.addColorStop(0, claro); gr.addColorStop(0.75, col); gr.addColorStop(1, oscuro);
    c.beginPath(); c.arc(0, -4 * h, rr, 0, Math.PI * 2); c.fillStyle = gr; c.fill(); c.lineWidth = 3; c.strokeStyle = '#1a1030'; c.stroke();
    if (slime) ppSlimeRepuestoOImagen(c, slime, 0, -4 * h + rr * 0.12, rr * 0.62, t, 1);
    c.beginPath(); c.ellipse(-rr * 0.38, -4 * h - rr * 0.45, rr * 0.22, rr * 0.13, -0.6, 0, Math.PI * 2); c.fillStyle = 'rgba(255,255,255,0.75)'; c.fill();
    c.restore();
  } else {
    // el cráter: hundida, con la luz al revés
    const rr = r * 0.88;
    c.save(); c.scale(sx, 1);
    const gr = c.createRadialGradient(rr * 0.3, rr * 0.35, rr * 0.1, 0, 0, rr); gr.addColorStop(0, col); gr.addColorStop(0.8, oscuro); gr.addColorStop(1, 'rgba(0,0,0,0.5)');
    c.beginPath(); c.arc(0, 0, rr, 0, Math.PI * 2); c.fillStyle = gr; c.fill(); c.lineWidth = 3; c.strokeStyle = '#1a1030'; c.stroke();
    c.beginPath(); c.ellipse(rr * 0.3, rr * 0.4, rr * 0.25, rr * 0.12, 0.5, 0, Math.PI * 2); c.fillStyle = 'rgba(255,255,255,0.35)'; c.fill();
    if (slime) ppSlimeRepuestoOImagen(c, slime, 0, rr * 0.25, rr * 0.5, t, 0.55, 0.55);
    c.restore();
  }
  if (trampa && h > 0.05) { ppTexto(c, '!', 0, -6, 34, '#ff4a4a'); }
  if (pista) { const p = 0.5 + 0.5 * Math.sin(t * 7); c.beginPath(); c.arc(0, -2, r * (0.95 + 0.1 * p), 0, Math.PI * 2); c.lineWidth = 5; c.strokeStyle = `rgba(255,214,74,${0.5 + 0.5 * p})`; c.stroke(); }
  c.restore();
}
// el slime de Yoshi si está; si no, la gelatina pintada. `aplastado` < 1 lo achata (cuando su burbuja está reventada)
function ppSlimeRepuestoOImagen(c, id, cx, cy, r, t, alpha = 1, aplastado = 1) {
  c.save(); c.globalAlpha = alpha; c.translate(cx, cy); c.scale(1 + (1 - aplastado) * 0.6, aplastado);
  if (!ppDibujaEn(c, 'sl-' + id, 0, 0, r * 2.1)) ppSlimeRepuesto(c, id, 0, 0, r, t, 1);
  c.restore();
}
function ppSlimeRepuesto(c, id, cx, cy, r, t, alpha) {
  const d = PP_SLIMES[id], w = 1 + Math.sin(t * 4 + r) * 0.05;
  c.save(); c.globalAlpha = alpha; c.translate(cx, cy); c.scale(w, 2 - w);
  c.beginPath(); c.moveTo(-r, r * 0.55); c.quadraticCurveTo(-r * 1.05, -r * 0.6, 0, -r * 0.8); c.quadraticCurveTo(r * 1.05, -r * 0.6, r, r * 0.55); c.quadraticCurveTo(0, r * 0.95, -r, r * 0.55);
  c.fillStyle = d.color; c.fill(); c.lineWidth = 3; c.strokeStyle = '#1a1030'; c.stroke();
  c.beginPath(); c.ellipse(-r * 0.35, -r * 0.35, r * 0.2, r * 0.1, -0.5, 0, Math.PI * 2); c.fillStyle = 'rgba(255,255,255,0.8)'; c.fill();
  // ojos
  for (const s of [-1, 1]) { c.beginPath(); c.arc(s * r * 0.32, 0, r * 0.14, 0, Math.PI * 2); c.fillStyle = '#1a1030'; c.fill(); c.beginPath(); c.arc(s * r * 0.32 - 2, -2, r * 0.05, 0, Math.PI * 2); c.fillStyle = '#fff'; c.fill(); }
  c.beginPath(); c.arc(0, r * 0.25, r * 0.18, 0.2, Math.PI - 0.2); c.lineWidth = 2.5; c.strokeStyle = '#1a1030'; c.stroke();
  // el detalle de cada personaje
  c.lineWidth = 3; c.strokeStyle = '#1a1030';
  if (d.pinta === 'orejas') for (const s of [-1, 1]) { c.beginPath(); c.ellipse(s * r * 0.4, -r * 1.1, r * 0.16, r * 0.5, s * 0.15, 0, Math.PI * 2); c.fillStyle = d.color; c.fill(); c.stroke(); c.beginPath(); c.ellipse(s * r * 0.4, -r * 1.1, r * 0.07, r * 0.33, s * 0.15, 0, Math.PI * 2); c.fillStyle = '#ffb3c6'; c.fill(); }
  if (d.pinta === 'antena') { c.beginPath(); c.moveTo(0, -r * 0.8); c.lineTo(0, -r * 1.2); c.stroke(); c.beginPath(); c.arc(0, -r * 1.3, r * 0.14, 0, Math.PI * 2); c.fillStyle = '#ff5a5a'; c.fill(); c.stroke(); }
  if (d.pinta === 'pelo') { c.beginPath(); c.moveTo(-r * 0.9, -r * 0.5); c.quadraticCurveTo(-r * 0.3, -r * 1.5, r * 0.7, -r * 1.05); c.quadraticCurveTo(r * 0.2, -r * 0.9, -r * 0.2, -r * 0.75); c.closePath(); c.fillStyle = '#ff7a2a'; c.fill(); c.stroke(); }
  if (d.pinta === 'dientes') { c.fillStyle = '#fff'; for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(k * r * 0.18 - r * 0.08, r * 0.28); c.lineTo(k * r * 0.18 + r * 0.08, r * 0.28); c.lineTo(k * r * 0.18, r * 0.5); c.closePath(); c.fill(); c.stroke(); } }
  if (d.pinta === 'corbata') { c.beginPath(); c.moveTo(0, r * 0.15); c.lineTo(r * 0.12, r * 0.3); c.lineTo(0, r * 0.75); c.lineTo(-r * 0.12, r * 0.3); c.closePath(); c.fillStyle = '#ffd64a'; c.fill(); c.stroke(); }
  c.restore();
}
/* ---------- el tablero de silicona ---------- */
function ppPintaTablero(c, T, t) {
  const g = ppGeom(T.n), r = g.celda * 0.4;
  const ent = PP_FX.entrada, esc = 1 - Math.pow(ent, 2) * 0.6;
  c.save(); c.translate(270, g.y + g.lado / 2); c.scale(esc, esc); c.translate(-270, -(g.y + g.lado / 2));
  // la base: silicona redondeada con borde grueso y una segunda capa por debajo
  c.beginPath(); c.roundRect(g.x - 14, g.y - 10 + 14, g.lado + 28, g.lado + 28, 36); c.fillStyle = '#1a1030'; c.fill();
  c.beginPath(); c.roundRect(g.x - 14, g.y - 14, g.lado + 28, g.lado + 28, 36); c.fillStyle = T.tipo === 'jefe' ? '#3a2434' : '#2e2a5a'; c.fill(); c.lineWidth = 5; c.strokeStyle = '#1a1030'; c.stroke();
  for (let i = 0; i < T.up.length; i++) {
    const [cx, cy] = ppCentro(g, i);
    ppBurbuja(c, cx, cy, r, i, T.n, T.up[i], T.slimes[i] || null, T.pista === i, T.trampas.has(i), t);
  }
  c.restore();
}
/* ---------- marcador ---------- */
function ppCorazon(c, x, y, s, lleno) {
  if (ppDibujaEn(c, 'i-vida', x, y, s)) { if (!lleno) { c.save(); c.globalAlpha = 0.6; c.fillStyle = '#1a1030'; c.fillRect(x - s / 2, y - s / 2, s, s); c.restore(); } return; }
  c.save(); c.translate(x, y + s * 0.1); c.beginPath(); c.moveTo(0, s * 0.4); c.bezierCurveTo(-s * 0.7, -s * 0.1, -s * 0.3, -s * 0.6, 0, -s * 0.25); c.bezierCurveTo(s * 0.3, -s * 0.6, s * 0.7, -s * 0.1, 0, s * 0.4);
  c.fillStyle = lleno ? '#ff4a6a' : '#3a2a44'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#1a1030'; c.stroke(); c.restore();
}
function ppPintaMarcador(c, t) {
  const P = PP_P;
  // corazones
  const dano = PP_FX.dano;
  for (let i = 0; i < P.vidaMax; i++) { const s = 34 + (i === P.vida && dano > 0 ? dano * 10 : 0); ppCorazon(c, 44 + i * 40, 52, s, i < P.vida); }
  // toques de la sala
  if (P.T) {
    const T = P.T, quedan = T.limite - T.toques, col = quedan < 0 ? '#ff5a5a' : quedan <= 1 ? '#ffd64a' : '#fff';
    ppTexto(c, tr('Toques'), 496, 36, 22, '#cfc8ff', 'right');
    ppTexto(c, `${T.toques} / ${T.limite}`, 496, 66, 40, col, 'right');
    ppTexto(c, tr(PP_CFG.salas[T.tipo].titulo), 270, 118, 30, '#ffd64a');
    if (quedan < 0) ppTexto(c, tr('Cada toque de más te quita un corazón'), 270, 150, 20, '#ff9a9a');
    else if (T.tipo === 'jefe') ppTexto(c, tr('Las burbujas con ! son trampa: no las toques tú'), 270, 150, 20, '#ff9a9a');
  }
  // el equipo, abajo
  const g = P.T ? ppGeom(P.T.n) : ppGeom(3), y0 = g.y + g.lado + 60;
  ppTexto(c, tr('Tu equipo'), 270, y0 - 2, 24, '#cfc8ff');
  for (let k = 0; k < PP_CFG.equipo; k++) {
    const x = 270 + (k - 1.5) * 110, id = P.equipo[k];
    c.beginPath(); c.roundRect(x - 44, y0 + 18, 88, 88, 18); c.fillStyle = id ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)'; c.fill(); c.lineWidth = 3; c.strokeStyle = id ? '#ffd64a' : 'rgba(255,255,255,0.2)'; c.stroke();
    if (id) { ppSlimeRepuestoOImagen(c, id, x, y0 + 62, 30, t, 1); ppTexto(c, tr(PP_SLIMES[id].pasiva), x, y0 + 124, 20, '#fff'); }
  }
}
/* ---------- partículas, saltos y textos flotantes ---------- */
function ppPintaEfectos(c, t) {
  for (const p of PP_FX.parts) { c.beginPath(); c.arc(p.x, p.y, p.r * (1 - p.t / p.vida), 0, Math.PI * 2); c.fillStyle = p.col; c.fill(); }
  for (const s of PP_FX.saltos) { const k = Math.min(1, s.t / 0.8), y = s.y - Math.sin(k * Math.PI) * 160 - k * 40; ppSlimeRepuestoOImagen(c, s.id, s.x, y, 34 + k * 16, t, 1); }
  for (const x of PP_FX.textos) { c.save(); c.globalAlpha = 1 - x.t; ppTexto(c, x.s, x.x, x.y - x.t * 50, 34, x.col); c.restore(); }
}
/* ---------- la sala entera ---------- */
function ppPintaSala(c, t) {
  const P = PP_P, T = P.T;
  c.save();
  if (PP_FX.temblor > 0) c.translate(rand(-1, 1) * PP_FX.temblor * 7, rand(-1, 1) * PP_FX.temblor * 7);
  ppPintaFondo(c, P.tipo === 'jefe' ? 'fondo-jefe' : 'fondo-cueva', t);
  ppPintaTablero(c, T, t);
  ppPintaMarcador(c, t);
  ppPintaEfectos(c, t);
  c.restore();
  if (PP_FX.dano > 0) { c.fillStyle = `rgba(255,40,60,${PP_FX.dano * 0.35})`; c.fillRect(0, 0, 540, PP_V.H); }
}
/* ---------- el mapa de la ruta ---------- */
const PP_NODO = { sala: { icono: 'n-sala', col: '#ff6ec7', letra: 'S' }, sala2: { icono: 'n-sala', col: '#ff8a2a', letra: 'G' }, elite: { icono: 'n-elite', col: '#ff4a4a', letra: 'E' }, descanso: { icono: 'n-descanso', col: '#7bff7b', letra: 'Z' }, jefe: { icono: 'n-jefe', col: '#ffd64a', letra: 'J' } };
function ppNodoPos(f, i, total) { const y = PP_V.H - 230 - f * ((PP_V.H - 430) / (PP_CFG.ruta.length - 1)); return [270 + (i - (total - 1) / 2) * 150, y]; }
let PP_NODOS_MAPA = [];
function ppPintaMapa(c, t) {
  ppPintaFondo(c, 'fondo-cueva', t);
  ppTitulo(c, tr('LA RUTA'), 270, 70, 54);
  ppTexto(c, tr('Elige la siguiente sala'), 270, 120, 26, '#cfc8ff');
  PP_NODOS_MAPA = [];
  const R = PP_CFG.ruta, sig = PP_P.fila + 1;
  // caminos
  c.lineWidth = 6; c.strokeStyle = 'rgba(255,255,255,0.25)'; c.setLineDash([10, 10]);
  for (let f = 0; f < R.length - 1; f++) for (let i = 0; i < R[f].length; i++) for (let j = 0; j < R[f + 1].length; j++) { const [x1, y1] = ppNodoPos(f, i, R[f].length), [x2, y2] = ppNodoPos(f + 1, j, R[f + 1].length); c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); }
  c.setLineDash([]);
  for (let f = 0; f < R.length; f++) for (let i = 0; i < R[f].length; i++) {
    const tipo = R[f][i], d = PP_NODO[tipo], [x, y] = ppNodoPos(f, i, R[f].length);
    const hecho = f < sig && !(f === PP_P.fila && i !== PP_P.nodo), aqui = f === PP_P.fila && i === PP_P.nodo, abierto = f === sig;
    const p = abierto ? 0.5 + 0.5 * Math.sin(t * 5) : 0, r = (tipo === 'jefe' ? 44 : 34) + p * 5;
    c.save(); if (f < sig && !aqui) c.globalAlpha = 0.45;
    c.beginPath(); c.arc(x, y + 6, r, 0, Math.PI * 2); c.fillStyle = '#1a1030'; c.fill();
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = abierto || aqui ? d.col : '#3a3060'; c.fill(); c.lineWidth = 4; c.strokeStyle = abierto ? '#fff' : '#1a1030'; c.stroke();
    if (!ppDibujaEn(c, d.icono, x, y, r * 1.3)) ppTexto(c, d.letra, x, y + 2, r, '#fff');
    c.restore();
    if (aqui) ppTexto(c, tr('Estás aquí'), x, y + r + 22, 20, '#ffd64a');
    if (abierto) PP_NODOS_MAPA.push({ x, y, r: r + 14, i });
  }
  // los corazones y el equipo también se ven en el mapa
  for (let i = 0; i < PP_P.vidaMax; i++) ppCorazon(c, 44 + i * 40, PP_V.H - 100, 34, i < PP_P.vida);
  PP_P.equipo.forEach((id, k) => ppSlimeRepuestoOImagen(c, id, 500 - k * 56, PP_V.H - 100, 22, t, 1));
}
/* ---------- la portada: un pop-it de muestra que se revienta solo ---------- */
const PP_PORTADA = { T: null, prox: 0 };
function ppPintaPortada(c, t, dt) {
  ppPintaFondo(c, 'fondo-cueva', t);
  if (!PP_PORTADA.T) { PP_PORTADA.T = ppNuevoTablero('sala', { equipo: [] }); PP_PORTADA.T.tipo = 'sala'; ppFxEntraSala(PP_PORTADA.T); }
  PP_PORTADA.prox -= dt;
  if (PP_PORTADA.prox <= 0) { const T = PP_PORTADA.T, i = Math.floor(Math.random() * T.up.length); const r = ppToca(T, i); if (r) ppFxToque(T, i, r); T.hecho = false; PP_PORTADA.prox = rand(0.5, 1.1); }
  ppFxAvanza(dt);
  c.save(); c.translate(270, PP_V.H * 0.46); c.scale(0.62, 0.62); c.translate(-270, -(ppGeom(3).y + 220)); ppPintaTablero(c, PP_PORTADA.T, t); ppPintaEfectos(c, t); c.restore();
  ppTitulo(c, 'FANS OF', 270, 110, 60);
  ppTitulo(c, 'POP', 270, 190, 110);
  ppTexto(c, tr('Revienta, rescata, repite'), 270, 258, 26, '#fff6d8');
}
