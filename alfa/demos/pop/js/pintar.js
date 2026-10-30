// Fans of Pop · PINTAR: todo lo que va en el lienzo (540 de ancho, PP_V.H de alto). La bandeja de silicona y sus burbujas
// (dibujos de Yoshi: img/tablero.png y img/b-<color>-arriba|abajo.png, que aquí se aplastan y estiran), los slimes dentro, el marcador de arriba (corazones, toques y equipo),
// y la portada (el mapa está en js/mapa.js). Los dibujos de Yoshi se usan si están (sprites.js); si no, el repuesto pintado.
'use strict';
const PP_V = { H: 960, sc: 1, dpr: 1 };
const PP_FUENTE = "'Fredoka', 'Arial Rounded MT Bold', sans-serif";   // redondita y gordita (kawaii); Google Fonts
const PP_LETRA = 0.74;   // Fredoka es más ancha que la letra pixelada de antes: todos los tamaños se multiplican por esto
/* ---------- geometría del tablero ---------- */
function ppGeom(n) { const lado = 440, x = 50, y = Math.round(PP_V.H / 2 - lado / 2 - 40); return { n, x, y, lado, celda: lado / n }; }
function ppCentro(g, i) { const x = i % g.n, y = (i - x) / g.n; return [g.x + (x + 0.5) * g.celda, g.y + (y + 0.5) * g.celda]; }
function ppCeldaEn(g, lx, ly) { if (lx < g.x || ly < g.y || lx >= g.x + g.lado || ly >= g.y + g.lado) return -1; return Math.floor((ly - g.y) / g.celda) * g.n + Math.floor((lx - g.x) / g.celda); }
// los colores del juguete: una fila de cada color
const PP_FILAS = [[345, 85, 70], [25, 95, 62], [52, 95, 60], [130, 65, 55], [195, 85, 58], [270, 70, 68]];
const PP_COLORES = ['rosa', 'melocoton', 'amarillo', 'menta', 'cielo', 'lila'];   // el mismo orden, para los dibujos de Yoshi
const ppSpriteBurbuja = (i, n, arriba) => 'b-' + PP_COLORES[Math.floor(i / n) % PP_COLORES.length] + (arriba === 2 ? '-doble' : arriba ? '-arriba' : '-abajo');
// la doble (mundo 2) usa su dibujo con nata; si aún no está, la normal
const ppSpriteArriba = (i, n, up) => (up === 2 && ppTieneImg(ppSpriteBurbuja(i, n, 2)) ? ppSpriteBurbuja(i, n, 2) : ppSpriteBurbuja(i, n, true));
function ppColorBurbuja(i, n, luz = 0) { const [h, s, l] = PP_FILAS[Math.floor(i / n) % PP_FILAS.length]; return `hsl(${h} ${s}% ${Math.min(96, l + luz)}%)`; }
/* ---------- texto ---------- */
function ppTexto(c, s, x, y, tam, col = '#fff', alinea = 'center', borde = '#7a3a7a') {
  tam = Math.round(tam * PP_LETRA);
  c.font = `700 ${tam}px ${PP_FUENTE}`; c.textAlign = alinea; c.textBaseline = 'middle';
  c.lineJoin = 'round'; c.lineWidth = Math.max(4, tam / 5); c.strokeStyle = borde; c.strokeText(s, x, y);
  c.fillStyle = col; c.fillText(s, x, y);
}
function ppTitulo(c, s, x, y, tam) { c.save(); ppTexto(c, s, x + 4, y + 6, tam, '#c84a9a', 'center', '#c84a9a'); ppTexto(c, s, x, y, tam, '#ffd64a', 'center', '#7a4a8a'); c.restore(); }
/* ---------- fondo ---------- */
// `noche`: el modo difícil (el mismo fondo, oscurecido: ppNoche en mapa.js)
function ppPintaFondo(c, k, t, noche = false) {
  const im = PP_IMG[k];
  if (im) { c.imageSmoothingEnabled = PP_LISO; c.drawImage(im, 0, 0, 540, PP_V.H); }
  else {
    const gr = c.createLinearGradient(0, 0, 0, PP_V.H); gr.addColorStop(0, k === 'fondo-jefe' ? '#ffe3a8' : '#ffd1ec'); gr.addColorStop(1, k === 'fondo-jefe' ? '#ffb8d0' : '#c8f0ff');
    c.fillStyle = gr; c.fillRect(0, 0, 540, PP_V.H);
  }
  if (noche) ppNoche(c, t);
  // lo que flota por el fondo: unicornios, arcoíris, capibaras, animalitos y chuches (Yoshi) subiendo despacio y balanceándose,
  // y burbujitas entre medias. Cada uno con su velocidad, tamaño y vaivén; todo sale de t, sin estado.
  const hay = PP_FLOTANTES.filter(k2 => PP_IMG[k2]);
  for (let k2 = 0; k2 < 12; k2++) {
    const vel = 14 + (k2 * 7) % 17, alto = PP_V.H + 160, y = alto - 80 - ((t * vel + k2 * 211) % alto);
    const x = ((k2 * 131) % 500) + 20 + Math.sin(t * 0.6 + k2 * 1.7) * 26;
    if (hay.length) {
      const sp = hay[k2 % hay.length], tam = 64 + (k2 % 3) * 22;
      c.save(); c.globalAlpha = 0.85; c.translate(x, y); c.rotate(Math.sin(t * 0.9 + k2) * 0.18);
      ppDibujaEn(c, sp, 0, 0, tam, true); c.restore();
    } else { c.save(); c.globalAlpha = 0.5; c.beginPath(); c.arc(x, y, 8 + (k2 % 4) * 5, 0, Math.PI * 2); c.strokeStyle = '#fff'; c.lineWidth = 3; c.stroke(); c.restore(); }
  }
  c.save(); c.globalAlpha = 0.55;
  for (let k2 = 0; k2 < 10; k2++) { const y = (PP_V.H + 40 - ((t * (24 + k2 * 5) + k2 * 173) % (PP_V.H + 80))), x = (k2 * 97 + Math.sin(t + k2) * 20) % 540; c.beginPath(); c.arc(x, y, 5 + (k2 % 4) * 3, 0, Math.PI * 2); c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke(); }
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
    if (ppTieneImg(ppSpriteArriba(i, n, up))) {
      ppDibujaEn(c, ppSpriteArriba(i, n, up), 0, -4 * h, rr * 2.3, true);
      if (up === 2 && !ppTieneImg(ppSpriteBurbuja(i, n, 2))) { c.beginPath(); c.arc(0, -4 * h, rr * 1.02, 0, Math.PI * 2); c.lineWidth = 6; c.strokeStyle = '#fff'; c.stroke(); }   // repuesto de la doble: un aro blanco
      if (slime) ppSlimeRepuestoOImagen(c, slime, 0, -4 * h + rr * 0.05, rr * 0.6, t, 1);
      c.restore();
    } else {
    c.beginPath(); c.ellipse(4 * h, 6 * h, rr, rr * 0.95, 0, 0, Math.PI * 2); c.fillStyle = 'rgba(0,0,0,0.35)'; c.fill();
    const gr = c.createRadialGradient(-rr * 0.35, -rr * 0.4, rr * 0.1, 0, 0, rr); gr.addColorStop(0, claro); gr.addColorStop(0.75, col); gr.addColorStop(1, oscuro);
    c.beginPath(); c.arc(0, -4 * h, rr, 0, Math.PI * 2); c.fillStyle = gr; c.fill(); c.lineWidth = 3; c.strokeStyle = '#1a1030'; c.stroke();
    if (slime) ppSlimeRepuestoOImagen(c, slime, 0, -4 * h + rr * 0.12, rr * 0.62, t, 1);
    c.beginPath(); c.ellipse(-rr * 0.38, -4 * h - rr * 0.45, rr * 0.22, rr * 0.13, -0.6, 0, Math.PI * 2); c.fillStyle = 'rgba(255,255,255,0.75)'; c.fill();
    c.restore();
    }
  } else if (ppTieneImg(ppSpriteBurbuja(i, n, false))) {
    c.save(); c.scale(sx, 1);
    ppDibujaEn(c, ppSpriteBurbuja(i, n, false), 0, 0, r * 2.05, true);
    if (slime) ppSlimeRepuestoOImagen(c, slime, 0, r * 0.2, r * 0.5, t, 0.6, 0.55);
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
  // la base: la bandeja de silicona de Yoshi (estirada al tamaño del tablero) o, si aún no está, una pastel con borde grueso
  if (PP_IMG.tablero) { c.imageSmoothingEnabled = PP_LISO; c.drawImage(PP_IMG.tablero, g.x - 34, g.y - 34, g.lado + 68, g.lado + 68); }
  else {
    c.beginPath(); c.roundRect(g.x - 14, g.y - 10 + 14, g.lado + 28, g.lado + 28, 36); c.fillStyle = '#c58ab8'; c.fill();
    c.beginPath(); c.roundRect(g.x - 14, g.y - 14, g.lado + 28, g.lado + 28, 36); c.fillStyle = T.tipo === 'jefe' ? '#ffe2b0' : '#e8d8ff'; c.fill(); c.lineWidth = 5; c.strokeStyle = '#7a4a8a'; c.stroke();
  }
  for (let i = 0; i < T.up.length; i++) {
    const [cx, cy] = ppCentro(g, i);
    if (T.mask && !T.mask[i]) continue;   // los huecos de la forma (corazón, flor…) no llevan burbuja
    ppBurbuja(c, cx, cy, r, i, T.n, T.up[i], T.slimes[i] || null, T.pista === i, T.trampas.has(i), t);
  }
  if (T.mano && T.pista !== null) { const [mx, my] = ppCentro(g, T.pista); ppMano(c, mx, my, t); }
  c.restore();
}
/* ---------- estrellas ---------- */
function ppEstrella(c, x, y, s, llena) {
  if (PP_IMG['i-estrella']) { c.save(); if (!llena) c.globalAlpha = 0.3; ppDibujaEn(c, 'i-estrella', x, y, s, true); c.restore(); return; }
  c.save(); c.translate(x, y); c.beginPath();
  for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? s * 0.22 : s * 0.5; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
  c.closePath(); c.fillStyle = llena ? '#ffd64a' : 'rgba(255,255,255,0.6)'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#7a4a8a'; c.stroke(); c.restore();
}
/* ---------- marcador ---------- */
function ppCorazon(c, x, y, s, lleno) {
  if (PP_IMG['i-vida']) { c.save(); if (!lleno) c.globalAlpha = 0.28; ppDibujaEn(c, 'i-vida', x, y, PP_LISO ? s * 1.3 : s, true); c.restore(); return; }   // el liso trae aire alrededor
  c.save(); c.translate(x, y + s * 0.1); c.beginPath(); c.moveTo(0, s * 0.4); c.bezierCurveTo(-s * 0.7, -s * 0.1, -s * 0.3, -s * 0.6, 0, -s * 0.25); c.bezierCurveTo(s * 0.3, -s * 0.6, s * 0.7, -s * 0.1, 0, s * 0.4);
  c.fillStyle = lleno ? '#ff4a6a' : '#3a2a44'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#1a1030'; c.stroke(); c.restore();
}
function ppPintaMarcador(c, t) {
  const P = PP_P;
  c.fillStyle = 'rgba(255,255,255,0.55)'; c.beginPath(); c.roundRect(20, 18, 500, 150, 24); c.fill();
  // corazones
  const dano = PP_FX.dano;
  const vidas = ppVidas();
  for (let i = 0; i < PP_CFG.vida; i++) { const s = 34 + (i === vidas && dano > 0 ? dano * 10 : 0); ppCorazon(c, 44 + i * 40, 52, s, i < vidas); }
  // toques de la sala
  if (P.T) {
    const T = P.T, quedan = T.limite - T.toques, col = quedan < 0 ? '#ff5a5a' : quedan <= 1 ? '#ffd64a' : '#fff';
    ppTexto(c, tr('Toques'), 496, 36, 22, '#ffe6f4', 'right');
    ppTexto(c, `${T.toques} / ${T.limite}`, 496, 66, 40, col, 'right');
    const est = ppEstrellas(T); for (let k = 0; k < 3; k++) ppEstrella(c, 432 + k * 30, 104, 28, k < est);
    ppTexto(c, T.titulo || '', 270, 118, 34, '#ffd64a', 'center', '#7a4a8a');
    if (T.d && T.d.jefe) ppTexto(c, tr('¡Pocos toques de sobra!'), 270, 150, 22, '#ff8a2a', 'center', '#fff');
    else if (T.d && T.d.dificil) ppTexto(c, tr('¡Nivel difícil!'), 270, 150, 22, '#ff6ec7', 'center', '#fff');
  }
  // el equipo, abajo: cada hueco con su slime, su pasiva y una barra de lo que le falta para actuar
  const n = P.T ? P.T.n : 3, g = ppGeom(n), y0 = g.y + g.lado + 60;
  c.fillStyle = 'rgba(255,255,255,0.55)'; c.beginPath(); c.roundRect(20, y0 - 22, 500, 178, 24); c.fill();
  ppTexto(c, tr('Tu equipo'), 270, y0 - 2, 24, '#ffe6f4');
  const esc = ppEscalaEquipo();
  for (let k = 0; k < ppHuecos(); k++) {
    const [x, y] = ppHuecoEquipo(k, n), id = P.equipo[k], br = id ? PP_FX.brilla[id] || 0 : 0;
    c.save(); c.translate(x, y); c.scale(esc * (1 + br * 0.25), esc * (1 + br * 0.25));
    c.beginPath(); c.roundRect(-44, -44, 88, 88, 18); c.fillStyle = br ? `rgba(255,214,74,${0.3 + br * 0.5})` : id ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.35)'; c.fill(); c.lineWidth = 3; c.strokeStyle = id ? '#ff6ec7' : 'rgba(122,74,138,0.35)'; c.stroke();
    if (id && !PP_FX.vuelos.some(v => v.id === id)) ppSlimeRepuestoOImagen(c, id, 0, -4 - br * 14, 30, t, 1);
    c.restore();
    if (!id) continue;
    const nom = tr(PP_SLIMES[id].pasiva); c.font = `700 ${Math.round(19 * PP_LETRA)}px ${PP_FUENTE}`; const w = c.measureText(nom).width;
    const cabe = 100 * esc; ppTexto(c, nom, x, y + 62, w > cabe ? Math.floor(19 * cabe / w) : 19, '#fff');   // los nombres largos encogen para no pisar al vecino
    const fx = PP_SLIMES[id].fx, T = P.T;
    const parte = fx.salta ? (P.carga[id] || 0) / fx.salta : fx.combo && T ? (T.combo % fx.combo) / fx.combo : null;
    if (parte !== null) {
      c.fillStyle = '#1a1030'; c.beginPath(); c.roundRect(x - 36, y + 32, 72, 10, 5); c.fill();
      c.fillStyle = fx.salta ? '#ff6ec7' : '#5be7ff'; c.beginPath(); c.roundRect(x - 36, y + 32, Math.max(10, 72 * parte), 10, 5); c.fill();
    }
  }
}
// el centro del hueco k del equipo (para pintarlo y para que el slime salga volando desde ahí)
// con huecos comprados (5 o 6) se juntan y encogen un poco para caber
const ppEscalaEquipo = () => Math.min(1, 470 / ppHuecos() / 110);
function ppHuecoEquipo(k, n) { const g = ppGeom(n), y0 = g.y + g.lado + 60, nh = ppHuecos(); return [270 + (k - (nh - 1) / 2) * 110 * ppEscalaEquipo(), y0 + 62]; }
/* ---------- partículas, saltos y textos flotantes ---------- */
function ppPintaEfectos(c, t) {
  for (const p of PP_FX.parts) { c.beginPath(); c.arc(p.x, p.y, p.r * (1 - p.t / p.vida), 0, Math.PI * 2); c.fillStyle = p.col; c.fill(); }
  for (const s of PP_FX.saltos) { const k = Math.min(1, s.t / 0.8), y = s.y - Math.sin(k * Math.PI) * 160 - k * 40; ppSlimeRepuestoOImagen(c, s.id, s.x, y, 34 + k * 16, t, 1); }
  for (const o of PP_FX.ondas) { const k = o.t / 0.45; c.beginPath(); c.arc(o.x, o.y, o.r * k, 0, Math.PI * 2); c.lineWidth = 10 * (1 - k); c.strokeStyle = `rgba(255,255,255,${1 - k})`; c.stroke(); }
  // el slime volando del equipo al tablero: en arco, girando y estirado en el aire
  for (const v of PP_FX.vuelos) {
    const k = Math.min(1, v.t / v.dur), x = v.x0 + (v.x1 - v.x0) * k, y = v.y0 + (v.y1 - v.y0) * k - Math.sin(k * Math.PI) * 220;
    c.save(); c.translate(x, y); c.rotate(k * Math.PI * 2); ppSlimeRepuestoOImagen(c, v.id, 0, 0, 34 + Math.sin(k * Math.PI) * 14, t, 1); c.restore();
    for (let e = 1; e <= 4; e++) { const kk = Math.max(0, k - e * 0.05), xx = v.x0 + (v.x1 - v.x0) * kk, yy = v.y0 + (v.y1 - v.y0) * kk - Math.sin(kk * Math.PI) * 220; c.beginPath(); c.arc(xx, yy, 8 - e * 1.5, 0, Math.PI * 2); c.fillStyle = `rgba(255,255,255,${0.5 - e * 0.1})`; c.fill(); }
  }
  // el letrero de COMBO: aparece de golpe, crece con el número y se va
  if (PP_FX.combo) {
    const { n, t: ct } = PP_FX.combo, e = ct < 0.12 ? ct / 0.12 * 1.3 : 1.3 - Math.min(0.3, (ct - 0.12) * 1.5), a = ct > 0.8 ? 1 - (ct - 0.8) / 0.3 : 1;
    const g = PP_P && PP_P.T ? ppGeom(PP_P.T.n) : ppGeom(3);
    c.save(); c.globalAlpha = Math.max(0, a); c.translate(270, g.y - 22); c.scale(e, e); c.rotate(Math.sin(ct * 20) * 0.04);
    ppTexto(c, 'COMBO x' + n, 0, 0, 36 + Math.min(5, n) * 4, ['#5be7ff', '#9dff6e', '#ffd64a', '#ff8a2a', '#ff6ec7'][Math.min(4, n - 2)]);
    c.restore();
  }
  for (const x of PP_FX.textos) { c.save(); c.globalAlpha = 1 - x.t; ppTexto(c, x.s, x.x, x.y - x.t * 50, 34, x.col); c.restore(); }
}
/* ---------- la sala entera ---------- */
function ppPintaSala(c, t) {
  const P = PP_P, T = P.T;
  c.save();
  if (PP_FX.temblor > 0) c.translate(rand(-1, 1) * PP_FX.temblor * 7, rand(-1, 1) * PP_FX.temblor * 7);
  ppPintaFondo(c, P.tipo === 'jefe' ? 'fondo-jefe' : T.d ? PP_MUNDOS[T.d.mundo].fondo : 'fondo-jardin', t, !!(T.d && T.d.dif));
  ppPintaTablero(c, T, t);
  ppPintaMarcador(c, t);
  ppPintaEfectos(c, t);
  c.restore();
  if (PP_FX.dano > 0) { c.fillStyle = `rgba(255,40,60,${PP_FX.dano * 0.35})`; c.fillRect(0, 0, 540, PP_V.H); }
}
/* ---------- la portada: un pop-it de muestra que se revienta solo ---------- */
// Daniel (30-10-2026): además de reventarse solo, se puede tocar. Tu dedo hace pop (o vuelve a subir una reventada, como un
// pop-it de verdad) y, mientras juegas con él, el automático descansa un poco.
const PP_PORTADA = { T: null, prox: 0 };
const PP_PORTADA_ESC = 0.62;
// del punto tocado (coordenadas del lienzo) a la burbuja del pop-it de la portada; -1 si no hay
function ppPortadaCelda(lx, ly) {
  const T = PP_PORTADA.T; if (!T) return -1;
  const bx = (lx - 270) / PP_PORTADA_ESC + 270, by = (ly - PP_V.H * 0.46) / PP_PORTADA_ESC + ppGeom(3).y + 220;
  const i = ppCeldaEn(ppGeom(T.n), bx, by);
  return i >= 0 && T.mask[i] ? i : -1;
}
function ppPortadaToque(lx, ly) {
  const T = PP_PORTADA.T, i = ppPortadaCelda(lx, ly); if (i < 0) return;
  const arriba = T.up[i] > 0;
  T.up[i] = arriba ? 0 : 1;
  ppFxToque(T, i, { pops: arriba ? [i] : [], subes: arriba ? [] : [i], grietas: [], hecho: false });
  PP_PORTADA.prox = 3.5;   // el automático espera mientras juegas
}
function ppPintaPortada(c, t, dt) {
  ppPintaFondo(c, 'fondo-jardin', t);
  if (!PP_PORTADA.T || ppResuelto(PP_PORTADA.T)) { PP_PORTADA.T = ppNuevoTablero(ppNivel(1), { equipo: [] }); ppFxEntraSala(PP_PORTADA.T); }   // se vuelve a llenar al vaciarse
  PP_PORTADA.prox -= dt;
  if (PP_PORTADA.prox <= 0) { const T = PP_PORTADA.T, i = Math.floor(Math.random() * T.up.length); const r = ppToca(T, i); if (r) ppFxToque(T, i, r); T.hecho = false; T.toques = 0; PP_PORTADA.prox = rand(0.6, 1.2); }
  ppFxAvanza(dt);
  c.save(); c.translate(270, PP_V.H * 0.46); c.scale(PP_PORTADA_ESC, PP_PORTADA_ESC); c.translate(-270, -(ppGeom(3).y + 220)); ppPintaTablero(c, PP_PORTADA.T, t); ppPintaEfectos(c, t); c.restore();
  ppTitulo(c, 'FANS OF', 270, 110, 60);
  ppTitulo(c, 'POP', 270, 190, 110);
  ppTexto(c, tr('Revienta, rescata, repite'), 270, 258, 28, '#fff', 'center', '#e0468f');
}
