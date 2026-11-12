// Fans of Pop · CORTINILLA (dibujo y manejo): la cortinilla D de los niveles con duelo, jefes y difíciles (ADR 098), cara a cara con el rival y la regla en tres
// viñetas, pintada en el lienzo encima de la sala. Mientras sale, el nivel espera (tutorial, ayudita y primer turno del rival);
// un toque la salta. Lo que decide cuándo sale y cómo avanza está en cortinilla.js (puro).
'use strict';
const PP_CORT = { activa: false, t: 0, rival: 'ceo', tipo: 'jefe', golpe: false, alTerminar: null };
const ppCortActiva = () => PP_CORT.activa && (PP_PANT.actual === 'sala' || PP_PANT.actual === 'duelo');   // si saliste del nivel a medias, ya no cuenta
function ppCortEmpieza(d, alTerminar) {
  Object.assign(PP_CORT, { activa: true, t: 0, rival: PP_CORTINILLA.rivalDe(d), tipo: PP_CORTINILLA.tipoDe(d), golpe: false, alTerminar });
}
// entrar en otro nivel apaga la cortinilla que quedara abierta sin su callback
const ppCortCancela = () => { PP_CORT.activa = false; PP_CORT.alTerminar = null; };
function ppCortTermina() {
  if (!PP_CORT.activa) return;
  PP_CORT.activa = false;
  const sigue = PP_CORT.alTerminar; PP_CORT.alTerminar = null;
  if (sigue) sigue();
}
function ppCortAvanza(dt) {
  if (!PP_CORT.activa) return;
  PP_CORT.t += dt;
  if (PP_CORTINILLA.fotograma(PP_CORT.t).golpe && !PP_CORT.golpe) { PP_CORT.golpe = true; ppBoing(0.5); ppVibra(25); }
  if (PP_CORTINILLA.terminada(PP_CORT.t)) ppCortTermina();
}
// parte un texto en líneas que quepan en `ancho`
function ppEnvuelve(c, s, ancho) {
  const lineas = []; let linea = '';
  for (const p of s.split(' ')) {
    const prueba = linea ? linea + ' ' + p : p;
    if (linea && c.measureText(prueba).width > ancho) { lineas.push(linea); linea = p; } else linea = prueba;
  }
  if (linea) lineas.push(linea);
  return lineas;
}
// las tres viñetas: una fila de burbujas (con las que reviento marcadas) o el cartel de ¡PIERDE!
const PP_CORT_PASOS = [
  { texto: 'Revientas las que quieras de una fila', burbujas: ['p', 'p', 'u', 'u'] },
  { texto: 'Pulsas ¡LISTO! y le toca a tu rival', burbujas: ['x', 'x', 'u', 'u'] },
  { texto: 'Pierde quien revienta la última', pierde: true },
];
const PP_CORT_COLOR = { p: '#ff8a2a', u: '#ff7ec0', x: '#4b3a74' };
function ppCortViñeta(c, p, x, y, w, h, a) {
  c.save(); c.globalAlpha = a; c.translate((1 - a) * 60, 0);
  c.fillStyle = '#1d1630'; c.strokeStyle = '#fff'; c.lineWidth = 5; c.beginPath(); c.roundRect(x, y, w, h, 22); c.fill(); c.stroke();
  if (p.pierde) {
    c.fillStyle = '#e8422f'; c.beginPath(); c.roundRect(x + 14, y + h / 2 - 26, 112, 52, 14); c.fill();
    ppTexto(c, tr('¡PIERDE!'), x + 70, y + h / 2 + 1, 26, '#fff', 'center', '#7a1a10');
  } else {
    p.burbujas.forEach((k, i) => { const bx = x + 32 + i * 28, by = y + h / 2; c.fillStyle = PP_CORT_COLOR[k]; c.beginPath(); c.arc(bx, by, 12, 0, Math.PI * 2); c.fill(); });
  }
  c.font = `700 ${Math.round(28 * PP_LETRA)}px ${PP_FUENTE}`;
  const lineas = ppEnvuelve(c, tr(p.texto), w - 180);
  lineas.forEach((l, i) => ppTexto(c, l, x + 150, y + h / 2 + (i - (lineas.length - 1) / 2) * 30, 28, '#fff', 'left', '#1d1630'));
  c.restore();
}
// una figura que entra deslizándose desde su lado: el rival (a la derecha) o tú (la burbuja, a la izquierda)
function ppCortFigura(c, rival, esRival, x, y, a, t) {
  c.save(); c.globalAlpha = a; c.translate(x + (esRival ? 1 : -1) * (1 - a) * 320, y);
  if (esRival) ppSlimeRepuestoOImagen(c, rival, 0, 0, 78, t, 1);
  else {
    const g = c.createRadialGradient(-22, -22, 6, 0, 0, 74); g.addColorStop(0, '#fff'); g.addColorStop(0.4, '#ffb3d9'); g.addColorStop(1, '#ff6fb5');
    c.fillStyle = g; c.strokeStyle = '#fff'; c.lineWidth = 7; c.beginPath(); c.arc(0, 0, 70, 0, Math.PI * 2); c.fill(); c.stroke();
  }
  c.restore();
}
function ppPintaCortinilla(c, t) {
  if (!PP_CORT.activa) return;
  const f = PP_CORTINILLA.fotograma(PP_CORT.t), H = PP_V.H, yFig = H * 0.3;
  c.save();
  c.fillStyle = `rgba(18,10,36,${0.45 * f.panel})`; c.fillRect(0, 0, 540, H);
  c.translate(0, -(1 - f.panel) * H);
  c.fillStyle = '#ff8a2a'; c.beginPath(); c.moveTo(0, 0); c.lineTo(330, 0); c.lineTo(210, H); c.lineTo(0, H); c.fill();
  c.fillStyle = '#2a1747'; c.beginPath(); c.moveTo(330, 0); c.lineTo(540, 0); c.lineTo(540, H); c.lineTo(210, H); c.fill();
  c.restore();
  ppTexto(c, tr(PP_CORT.tipo === 'jefe' ? '¡NIVEL JEFE!' : '¡DUELO!'), 270, H * 0.1, 64, `rgba(42,23,71,${f.etiqueta})`, 'center', `rgba(255,255,255,${f.etiqueta})`);
  ppCortFigura(c, PP_CORT.rival, false, 130, yFig, f.figuras, t);
  ppCortFigura(c, PP_CORT.rival, true, 410, yFig, f.figuras, t);
  if (f.vs > 0.01) { c.save(); c.translate(270, yFig + 20); c.scale(f.vs, f.vs); ppTexto(c, 'VS', 0, 0, 120, '#fff', 'center', '#2a1747'); c.restore(); }
  PP_CORT_PASOS.forEach((p, i) => { if (f.pasos[i] > 0.01) ppCortViñeta(c, p, 24, H * 0.5 + i * 116, 492, 104, f.pasos[i]); });
  ppTexto(c, tr('Toca para saltar'), 270, H - 30, 22, '#fff', 'center', '#2a1747');
}
