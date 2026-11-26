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
// los colores de las filas (paleta «Chuche», Pepins 20-11-2026, tarea #260: propia de Fans Of, sin lila): una fila de cada color
const PP_FILAS = [[345, 85, 70], [175, 70, 52], [48, 95, 60], [140, 60, 52], [25, 95, 62], [215, 80, 64]];
const PP_COLORES = ['rosa', 'cielo', 'amarillo', 'menta', 'melocoton', 'azul'];   // el mismo orden que PP_FILAS, para los dibujos de burbuja
const ppSpriteBurbuja = (i, n, arriba) => 'b-' + PP_COLORES[Math.floor(i / n) % PP_COLORES.length] + (arriba === 2 ? '-doble' : arriba ? '-arriba' : '-abajo');
// la doble (mundo 2) usa su dibujo con nata; si aún no está, la normal
const ppSpriteArriba = (i, n, up) => (up >= 2 && ppTieneImg(ppSpriteBurbuja(i, n, 2)) ? ppSpriteBurbuja(i, n, 2) : ppSpriteBurbuja(i, n, true));
// con el estilo del mundo (tarea #110, js/estilo-mundo.js) la burbuja de su mundo (el macaron en la Pastelería), si ya está cargada;
// la doble y lo que aún no tiene dibujo propio, la de siempre. `up` 0 = hundida.
function ppSpriteConEstilo(estilo, i, n, up) {
  const normal = up ? ppSpriteArriba(i, n, up) : ppSpriteBurbuja(i, n, false);
  if (!estilo || !estilo.burbuja || up >= 2) return normal;
  const k = ppSpriteDeEstilo(estilo, PP_COLORES[Math.floor(i / n) % PP_COLORES.length], up ? 'arriba' : 'abajo');
  return ppTieneImg(k) ? k : normal;
}
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
  if (noche === 2) ppRojo(c, t); else if (noche) ppNoche(c, t);   // difícil: de noche · pesadilla: en rojo
  // lo que flota por el fondo: unicornios, arcoíris, capibaras, animalitos y chuches (Yoshi) subiendo despacio y balanceándose,
  // y burbujitas entre medias. Cada uno con su velocidad, tamaño y vaivén; todo sale de t, sin estado.
  if (!PP_AHORRO.flotantes()) return;   // «Ahorro de batería»: el fondo, solo con su dibujo (js/ahorro-juego.js)
  const suyas = (PP_FLOTA_MUNDO[k] || []).filter(k2 => PP_IMG[k2]);   // las del mundo (js/sprites.js); si aún no hay, la mezcla
  const hay = suyas.length >= 3 ? suyas : PP_FLOTANTES.filter(k2 => PP_IMG[k2]);
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
function ppBurbuja(c, cx, cy, r, i, n, up, slime, pista, trampa, t, estilo = null) {
  const [sx, sy, h] = ppAnim(i, up), arriba = ppSpriteConEstilo(estilo, i, n, up || 1), abajo = ppSpriteConEstilo(estilo, i, n, 0);
  const col = ppColorBurbuja(i, n), oscuro = ppColorBurbuja(i, n, -28), claro = ppColorBurbuja(i, n, 22);
  c.save(); c.translate(cx, cy);
  if (h > 0.05) {
    // la cúpula: sombra, cuerpo con luz arriba a la izquierda, brillo
    const rr = r * (0.85 + 0.15 * h);
    c.save(); c.scale(sx, sy);
    if (ppTieneImg(arriba)) {
      ppDibujaEn(c, arriba, 0, -4 * h, rr * 2.3, true);
      if (up >= 2 && !ppTieneImg(ppSpriteBurbuja(i, n, 2))) { c.beginPath(); c.arc(0, -4 * h, rr * 1.02, 0, Math.PI * 2); c.lineWidth = 6; c.strokeStyle = '#fff'; c.stroke(); }   // repuesto de la doble: un aro blanco
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
  } else if (ppTieneImg(abajo)) {
    c.save(); c.scale(sx, 1);
    ppDibujaEn(c, abajo, 0, 0, r * 2.05, true);
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
  const d = ppSlimeDe(id), w = 1 + Math.sin(t * 4 + r) * 0.05;
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
  const g = ppGeom(T.n), r = g.celda * 0.4, estilo = ppEstiloDeTablero(T);
  const ent = PP_FX.entrada, esc = 1 - Math.pow(ent, 2) * 0.6;
  c.save(); c.translate(270, g.y + g.lado / 2); c.scale(esc, esc); c.translate(-270, -(g.y + g.lado / 2));
  // la base: la bandeja de silicona de Yoshi (estirada al tamaño del tablero) o, si aún no está, una pastel con borde grueso
  const bandeja = ppBandejaParaTablero(estilo, ppBandejaActual().id);   // 'comprada', 'material' (la galleta de la Pastelería) o null
  const M = PP_MEDIDOR;   // el medidor por partes del panel DEV (js/medidor-partes.js): apagado, pinta todo y no mide
  if (!M.pinta('bandeja')) { /* quitada en el medidor */ } else if ((T.mask && T.mask.some(v => !v)) || bandeja) ppBandeja(c, T, g, bandeja === 'material' ? estilo.material : null, !!(estilo && estilo.relieve));   // con forma, bonita o del mundo (js/bandeja.js)
  else if (PP_IMG.tablero) { c.imageSmoothingEnabled = PP_LISO; c.drawImage(PP_IMG.tablero, g.x - 34, g.y - 34, g.lado + 68, g.lado + 68); }
  else {
    c.beginPath(); c.roundRect(g.x - 14, g.y - 10 + 14, g.lado + 28, g.lado + 28, 36); c.fillStyle = '#c58ab8'; c.fill();
    c.beginPath(); c.roundRect(g.x - 14, g.y - 14, g.lado + 28, g.lado + 28, 36); c.fillStyle = T.tipo === 'jefe' ? '#ffe2b0' : '#e8d8ff'; c.fill(); c.lineWidth = 5; c.strokeStyle = '#7a4a8a'; c.stroke();
  }
  M.marca('bandeja');
  for (let i = 0; i < T.up.length && M.pinta('burbujas'); i++) {
    const [cx, cy] = ppCentro(g, i);
    if (T.mask && !T.mask[i]) continue;   // los huecos de la forma (corazón, flor…) no llevan burbuja
    ppBurbuja(c, cx, cy, r, i, T.n, T.up[i], T.slimes[i] || null, T.pista === i, T.trampas.has(i), t, estilo);
    if (estilo && estilo.burbuja) ppCaritaEnBurbuja(c, cx, cy, r, i, T, t, estilo.caritas);   // js/caritas.js
    if (T.up[i] && (T.up[i] === 3 || (T.esp && T.esp[i]))) ppEspecial(c, cx, cy, r, i, T, t);
  }
  M.marca('burbujas');
  if (M.pinta('arcoiris')) ppEscPinta(c, T, g, r, t);   // la burbuja brillante: sin T.esc (flag `companeros` cerrado) no pinta nada (js/escondidos-juego.js)
  M.marca('arcoiris');
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
// monedas y perlas, siempre a la vista mientras juegas (Daniel, 31-10-2026). Empieza en x; devuelve dónde acaba
// monedas y perlas seguidas, sin montarse (cada cifra ocupa lo que mide)
function ppPintaMonedero(c, x, y) {
  c.font = `700 ${Math.round(22 * PP_LETRA)}px ${PP_FUENTE}`;
  const m = String(SAVE.monedas || 0), p = String(SAVE.perlas || 0);
  ppMoneda(c, x + 12, y, 26); ppTexto(c, m, x + 28, y + 1, 22, '#fff', 'left', '#c98a12');
  const x2 = x + 28 + c.measureText(m).width + 18;
  ppPerla(c, x2 + 12, y, 26); ppTexto(c, p, x2 + 28, y + 1, 22, '#fff', 'left', '#c43a84');
}
/* ---------- partículas, saltos y textos flotantes ---------- */
function ppPintaEfectos(c, t) {
  for (let i = 0, paso = PP_AHORRO.pasoParticulas(); i < PP_FX.parts.length; i += paso) { const p = PP_FX.parts[i]; c.beginPath(); c.arc(p.x, p.y, p.r * (1 - p.t / p.vida), 0, Math.PI * 2); c.fillStyle = p.col; c.fill(); }
  for (const s of PP_FX.saltos) { const k = Math.min(1, s.t / 0.8), y = s.y - Math.sin(k * Math.PI) * 160 - k * 40; ppSlimeRepuestoOImagen(c, s.id, s.x, y, 34 + k * 16, t, 1); }
  for (const o of PP_FX.ondas) { const k = o.t / 0.45; c.beginPath(); c.arc(o.x, o.y, o.r * k, 0, Math.PI * 2); c.lineWidth = 10 * (1 - k); c.strokeStyle = `rgba(255,255,255,${1 - k})`; c.stroke(); }
  PP_ATAQUE_FX.pinta(c);   // estela, cositas y golpes de los ataques de los compañeros (flag 'ataques-companeros')
  // el slime volando del equipo al tablero: en arco, girando y estirado en el aire
  for (const v of PP_FX.vuelos) {
    if (v.ataque) { PP_ATAQUE_FX.pintaVuelo(c, v, t); continue; }
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
  for (const x of PP_FX.textos) ppPintaFlota(c, x);
}
// un texto que flota: sube 50 y se apaga; el grande (en los duelos) se parte en líneas para caber (tarea #129)
function ppPintaFlota(c, x) {
  const k = x.t / x.dura, y = x.y - k * 50;
  c.save(); c.globalAlpha = ppFlotaAlfa(k, x.grande);
  if (!x.grande) ppTexto(c, x.s, x.x, y, x.tam, x.col);
  else {
    c.font = `700 ${Math.round(x.tam * PP_LETRA)}px ${PP_FUENTE}`;
    const lineas = ppPartirLineas(x.s, PP_FLOTA.anchoDuelo, s => c.measureText(s).width), alto = x.tam * PP_LETRA * 1.15;
    lineas.forEach((l, j) => ppTexto(c, l, x.x, y + (j - (lineas.length - 1) / 2) * alto, x.tam, x.col));
  }
  c.restore();
}
// como ppTexto, pero si no cabe en `ancho` la letra encoge (tarea #129)
function ppTextoCabe(c, s, x, y, tam, ancho, col, borde) {
  c.font = `700 ${Math.round(tam * PP_LETRA)}px ${PP_FUENTE}`;
  const w = c.measureText(s).width;
  ppTexto(c, s, x, y, w > ancho ? Math.floor((tam * ancho) / w) : tam, col, 'center', borde);
}
/* ---------- la sala entera ---------- */
function ppPintaSala(c, t) {
  const P = PP_P, T = P.T, M = PP_MEDIDOR;
  c.save(); M.empieza();
  if (PP_FX.temblor > 0) c.translate(rand(-1, 1) * PP_FX.temblor * 7, rand(-1, 1) * PP_FX.temblor * 7);
  if (M.pinta('fondo')) ppPintaFondo(c, P.tipo === 'jefe' ? 'fondo-jefe' : T.d ? PP_MUNDOS[T.d.mundo].fondo : 'fondo-jardin', t, T.d ? T.d.dif || 0 : 0);
  M.marca('fondo'); c.save(); c.translate(0, ppFxBote()); ppPintaTablero(c, T, t); c.restore();   // el botecito de la bandeja al tocar (tarea #110)
  if (T.nim) ppPintaFilaNim(c, T, t);
  if (M.pinta('marcador')) ppPintaMarcador(c, t);
  M.marca('marcador');   // con la fila del duelo del nivel
  if (M.pinta('efectos')) ppPintaEfectos(c, t);
  M.marca('efectos');
  c.restore();
  if (PP_FX.dano > 0) { c.fillStyle = `rgba(255,40,60,${PP_FX.dano * 0.35})`; c.fillRect(0, 0, 540, PP_V.H); }
}
/* ---------- la portada: un pop-it de muestra que se revienta solo ---------- */
// Daniel (30-10-2026): además de reventarse solo, se puede tocar. Tu dedo hace pop (o vuelve a subir una reventada, como un
// pop-it de verdad) y, mientras juegas con él, el automático descansa un poco.
const PP_PORTADA = { T: null, prox: 0, esc: 0.62, cy: 0 };
const PP_PORTADA_ESC = 0.62, PP_PORTADA_CAMBIA = 14, PP_PORTADA_MEDIO = 260, PP_PORTADA_LOGO = 345;   // medio alto de la bandeja con su marco; el pie del logo
// Regla (dominio): dónde va el pop-it de la portada (su centro `cy` en el lienzo) y a qué escala. Va en `defecto` a la escala `base`
// si así no pisa la pastilla de debajo («Vas por el nivel X», que empieza en `tope`); si la pisaría (pantallas anchas, con el lienzo
// más bajo), encoge y se centra en el hueco entre el logo (`arriba`) y la pastilla (tarea #185). `medio`: su medio alto sin escalar.
function ppCajaPortada(base, defecto, medio, arriba, tope) {
  if (!(tope > arriba) || defecto + base * medio <= tope) return { cy: defecto, esc: base };
  const esc = Math.min(base, (tope - arriba) / (2 * medio));
  return { cy: tope - esc * medio, esc };
}
// el borde de arriba de la pastilla, en unidades del lienzo (0 si no se ve)
function ppTopePastilla() {
  const p = $pp('#pp-record'); if (!p || !p.offsetParent) return 0;
  return (p.getBoundingClientRect().top - PP_CV.getBoundingClientRect().top) / PP_V.sc;
}
// un pop-it de muestra con una forma al azar de las de los mundos (y alguna de las generales), sin repetir la anterior
function ppTableroPortada() {
  const todas = [];
  for (const F of PP_FORMAS_MUNDO) for (const n of [5, 6]) for (const f of F[n] || []) todas.push(f);
  for (const f of PP_FORMAS[5]) todas.push(f);
  let f; do f = todas[Math.floor(Math.random() * todas.length)]; while (todas.length > 1 && f === PP_PORTADA.forma);
  PP_PORTADA.forma = f;
  const n = f.length, mask = new Uint8Array(n * n), need = new Array(n * n).fill(0);
  f.forEach((fila, y) => [...fila].forEach((ch, x) => { if (ch === '#') { mask[y * n + x] = 1; need[y * n + x] = 1; } }));
  return ppNuevoTablero({ g: 0, lado: n, mask, need, opt: [], limite: 99, amigos: 0, jefe: false }, { equipo: [] });
}
// del punto tocado (coordenadas del lienzo) a la burbuja del pop-it de la portada; -1 si no hay
function ppPortadaCelda(lx, ly) {
  const T = PP_PORTADA.T; if (!T) return -1;
  const e = PP_PORTADA.esc, bx = (lx - 270) / e + 270, by = (ly - PP_PORTADA.cy) / e + ppGeom(3).y + 220;
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
  // Daniel (31-10-2026): «que el pop-it del menú no sea siempre el mismo»: cada vez sale una forma al azar (concha, cucurucho, flor…)
  // y cambia al vaciarse o cada PP_PORTADA_CAMBIA segundos
  PP_PORTADA.vida = (PP_PORTADA.vida || 0) + dt;
  if (!PP_PORTADA.T || ppResuelto(PP_PORTADA.T) || PP_PORTADA.vida > PP_PORTADA_CAMBIA) { PP_PORTADA.T = ppTableroPortada(); PP_PORTADA.vida = 0; ppFxEntraSala(PP_PORTADA.T); }
  PP_PORTADA.prox -= dt;
  if (PP_PORTADA.prox <= 0) { const T = PP_PORTADA.T, i = Math.floor(Math.random() * T.up.length); const r = ppToca(T, i); if (r) ppFxToque(T, i, r); T.hecho = false; T.toques = 0; PP_PORTADA.prox = rand(0.6, 1.2); }
  ppFxAvanza(dt);
  const { cy, esc } = ppCajaPortada(PP_PORTADA_ESC, PP_V.H * 0.46, PP_PORTADA_MEDIO, PP_PORTADA_LOGO, ppTopePastilla() - 8);
  PP_PORTADA.cy = cy; PP_PORTADA.esc = esc;   // también para los toques (ppPortadaCelda)
  c.save(); c.translate(270, cy); c.scale(esc, esc); c.translate(-270, -(ppGeom(3).y + 220)); ppPintaTablero(c, PP_PORTADA.T, t); ppPintaEfectos(c, t); c.restore();
  // «POP» es el logo de Yoshi con letras de pop-it (Daniel eligió la semilla 9, 30-10-2026); si aún no ha cargado, en letra
  const logo = PP_IMG['logo-pop'];
  if (logo) {
    const w = 330, h = w * logo.height / logo.width, bota = Math.sin(t * 2.2) * 4;
    ppTitulo(c, 'FANS OF', 270, 84, 56);
    c.save(); c.imageSmoothingEnabled = PP_LISO; c.translate(270, 208 + bota); c.rotate(Math.sin(t * 1.3) * 0.025);
    c.drawImage(logo, -w / 2, -h / 2, w, h); c.restore();
    ppTexto(c, tr('Haz pop, rescata, repite'), 270, 322, 28, '#fff', 'center', '#e0468f');
  } else {
    ppTitulo(c, 'FANS OF', 270, 110, 60);
    ppTitulo(c, 'POP', 270, 190, 110);
    ppTexto(c, tr('Haz pop, rescata, repite'), 270, 258, 28, '#fff', 'center', '#e0468f');
  }
}
