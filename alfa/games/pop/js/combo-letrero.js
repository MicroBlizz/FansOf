// Fans of Pop · EL LETRERO KAWAII DE LOS COMBOS, EL DIBUJO (tarea 396; boceto elegido por Pepins el 26-11-2026). Siempre,
// cada paso de combo sale con uno de tres dibujos, por turnos: GOMITA (burbuja blandita que se aplasta y suelta corazones), NUBE
// (nubecita con estrellitas alrededor y, desde x5, un arcoíris detrás) y PEGATINA (chapa festoneada que gira, con una estrellita por paso y
// confeti). Todos con carita y mofletes, y más grandes cuanto más largo es el combo. El número lleva borde blanco y otro oscuro para que se
// lea sobre cualquier color. Sale junto a la burbuja del toque que lo hace (tuyo o del salto de un compañero), así que cambia de sitio en
// cada paso. Las cuentas (qué dibujo, color, tamaño y sitio) están en js/combo-letrero-reglas.js. Lo pinta ppPintaEfectos (js/pintar.js)
// con ppComboKawaii; con el flag cerrado sale el letrero de siempre.
'use strict';
const PP_TINTA_COMBO = '#6b2c4a';
// el número (o la palabra COMBO): borde blanco por fuera y tinta oscura dentro del borde, para que se lea sobre cualquier color
function ppComboNum(c, s, x, y, tam, relleno) {
  c.font = `700 ${Math.round(tam * PP_LETRA)}px ${PP_FUENTE}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  c.lineWidth = tam * 0.34; c.strokeStyle = '#fff'; c.strokeText(s, x, y);
  c.lineWidth = tam * 0.18; c.strokeStyle = PP_TINTA_COMBO; c.strokeText(s, x, y);
  c.fillStyle = relleno; c.fillText(s, x, y);
}
function ppComboCara(c, x, y, r) {
  c.fillStyle = PP_TINTA_COMBO; c.beginPath(); c.arc(x - r * 0.35, y, r * 0.11, 0, 7); c.arc(x + r * 0.35, y, r * 0.11, 0, 7); c.fill();
  c.strokeStyle = PP_TINTA_COMBO; c.lineWidth = Math.max(1.5, r * 0.08); c.beginPath(); c.arc(x, y + r * 0.08, r * 0.16, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke();
  c.fillStyle = 'rgba(255,120,160,.6)'; c.beginPath(); c.ellipse(x - r * 0.62, y + r * 0.2, r * 0.17, r * 0.1, 0, 0, 7); c.ellipse(x + r * 0.62, y + r * 0.2, r * 0.17, r * 0.1, 0, 0, 7); c.fill();
}
function ppComboCorazon(c, x, y, s, col) {
  c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.beginPath(); c.moveTo(0, 4);
  c.bezierCurveTo(-8, -3, -4, -9, 0, -4); c.bezierCurveTo(4, -9, 8, -3, 0, 4); c.fill(); c.restore();
}
function ppComboEstrella(c, x, y, r, col, giro) {
  c.save(); c.translate(x, y); c.rotate(giro); c.fillStyle = col; c.beginPath();
  for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4, rr = i % 2 ? r * 0.38 : r; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  c.fill(); c.restore();
}
// GOMITA: corazones que salen volando y una burbuja que se aplasta y rebota
function ppComboGomita(c, n, t, col, e) {
  for (let i = 0; i < 4 + n; i++) {
    const a = (i / (4 + n)) * 7 + n, d = 65 + t * 130 * (0.6 + (i % 3) * 0.2);
    c.globalAlpha = Math.max(0, 1 - t * 1.1); ppComboCorazon(c, Math.cos(a) * d, Math.sin(a) * d * 0.7, 1.3 + (i % 2) * 0.7, i % 2 ? '#ff8fc0' : col);
  }
  c.globalAlpha = 1;
  const w = Math.sin(Math.min(1, t / 0.5) * Math.PI * 3) * Math.max(0, 0.5 - t) * 0.5;
  c.save(); c.scale(e * (1 + w), e * (1 - w));
  c.fillStyle = col; c.strokeStyle = '#fff'; c.lineWidth = 8; c.beginPath(); c.ellipse(0, 8, 80, 75, 0, 0, 7); c.fill(); c.stroke();
  c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(-31, -34, 18, 10, -0.6, 0, 7); c.fill();
  ppComboNum(c, 'x' + n, 0, -8, 70, '#fff'); ppComboCara(c, 0, 47, 31); c.restore();
}
// NUBE: estrellitas que giran alrededor y, desde x5, un arcoíris detrás
function ppComboNube(c, n, t, col, e) {
  if (n >= PP_COMBO_LETRERO.ARCOIRIS) {
    c.save(); c.globalAlpha = 0.6;
    ['#ff9ec7', '#ffd64a', '#9de6a8', '#8fd3ff'].forEach((k, i) => { c.strokeStyle = k; c.lineWidth = 10; c.beginPath(); c.arc(0, 32, 153 - i * 12, Math.PI, 0); c.stroke(); });
    c.restore();
  }
  for (let i = 0; i < n + 3; i++) {
    const a = (i / (n + 3)) * Math.PI * 2 + t * 1.5, d = 120 + Math.sin(t * 8 + i) * 8;
    ppComboEstrella(c, Math.cos(a) * d, Math.sin(a) * d * 0.75, 7 + (i % 3) * 3, i % 2 ? '#ffd64a' : '#fff', t * 4 + i);
  }
  c.save(); c.translate(0, Math.sin(t * 6) * 4); c.scale(e, e);
  const r = 70, bolas = [[-1, 0.1, 0.55], [-0.45, -0.35, 0.65], [0.25, -0.4, 0.7], [0.9, 0, 0.6], [0.3, 0.3, 0.6], [-0.4, 0.3, 0.6]];
  for (const [relleno, borde] of [[col, 12], ['#fff', 0]]) {
    c.fillStyle = relleno; c.beginPath();
    for (const [x, y, k] of bolas) { c.moveTo(x * r + k * r + borde / 2, y * r); c.arc(x * r, y * r, k * r + borde / 2, 0, 7); }
    c.fill();
  }
  ppComboNum(c, 'x' + n, 0, -13, 65, col); ppComboCara(c, 0, 34, 29); c.restore();
}
// PEGATINA: confeti de burbujitas y una chapa festoneada que gira, con una estrellita por paso (hasta 8)
function ppComboPegatina(c, n, t, col, e) {
  const confeti = ['#8fd3ff', '#ff9ec7', '#ffd64a', '#9de6a8'];
  for (let i = 0; i < 10 + n * 2; i++) {
    const a = i * 2.4 + n, d = t * 180 * (0.5 + (i % 4) * 0.18);
    c.globalAlpha = Math.max(0, 1 - t * 1.1); c.fillStyle = confeti[i % 4]; c.beginPath(); c.arc(Math.cos(a) * d, Math.sin(a) * d, 4 + (i % 3) * 1.5, 0, 7); c.fill();
  }
  c.globalAlpha = 1;
  c.save(); c.scale(e, e); c.rotate(t * 1.2);
  for (const [relleno, fuera, dentro] of [['#fff', 91, 83], [col, 81, 74]]) {
    c.fillStyle = relleno; c.beginPath();
    for (let i = 0; i < 48; i++) { const a = (i / 48) * Math.PI * 2, rr = i % 2 ? dentro : fuera; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    c.fill();
  }
  const k = Math.min(8, n);
  for (let i = 0; i < k; i++) ppComboEstrella(c, Math.cos((i / k) * 7) * 61, Math.sin((i / k) * 7) * 61, 8, '#fff', 0);
  c.rotate(-t * 1.2); ppComboNum(c, 'x' + n, 0, -8, 65, '#fff'); ppComboCara(c, 0, 36, 29); c.restore();
}
const PP_COMBO_DIBUJOS = Object.freeze({ gomita: ppComboGomita, nube: ppComboNube, pegatina: ppComboPegatina });
// el letrero del paso n (lleva t s puesto) junto al punto (cx, cy) de la pantalla, dentro de `caja` = { arriba, abajo } (PP_COMBO_LETRERO.sitio).
// Lo usan los niveles (ppComboKawaii) y la racha de la raid entre todos (js/raid/adaptadores/efectos.js, tarea 448)
function ppComboJunto(c, n, t, cx, cy, caja) {
  const L = PP_COMBO_LETRERO, col = L.color(n), e = L.escala(n, t);
  if (L.alfa(t) <= 0) return;
  const [x, y] = L.sitio(cx, cy, n, caja);
  c.save(); c.globalAlpha = L.alfa(t); c.translate(x, y);
  PP_COMBO_DIBUJOS[L.estilo(n)](c, n, t, col, e);
  c.globalAlpha = L.alfa(t); const p = Math.min(1.25, e + 0.1);
  c.translate(0, -Math.min(105 * e, 110)); c.scale(p, p); ppComboNum(c, tr('COMBO'), 0, 0, 40, col);
  c.restore();
}
// el letrero entero, junto a la burbuja del toque (combo.i) del tablero de geometría g (ppGeom, js/pintar.js)
function ppComboKawaii(c, combo, g) {
  const { n, t, i } = combo;
  const [cx, cy] = i >= 0 && i < g.n * g.n ? ppCentro(g, i) : [NaN, NaN];
  ppComboJunto(c, n, t, cx, cy, { arriba: g.y - 22, abajo: g.y + g.lado - 90 });   // abajo: sin bajar hasta el equipo
}
