// Fans of Pop · CORTINILLA (dibujo y manejo): la cortinilla de los niveles con duelo, jefes y difíciles (ADR 098), pintada en el lienzo
// encima de la sala. Estilo cozy del boceto A que eligió Pepins (16-11-2026, tarea #71): velo rosa sobre el fondo del mundo, cinta con el
// título, Lola («Tú») y el rival sobre cojines con su nombre, el VS dentro de una burbuja y la regla en la tarjeta «Así se gana».
// Mientras sale, el nivel espera (tutorial, ayudita y primer turno del rival); solo el botón ¡A JUGAR! la quita (ADR 100).
// Lo que decide cuándo sale y cómo avanza está en cortinilla.js (puro).
'use strict';
const PP_CORT = { activa: false, t: 0, rival: 'ceo', tipo: 'jefe', golpe: false, salida: null, alTerminar: null };
const ppCortActiva = () => PP_CORT.activa && (PP_PANT.actual === 'sala' || PP_PANT.actual === 'duelo');   // si saliste del nivel a medias, ya no cuenta
function ppCortEmpieza(d, alTerminar) {
  Object.assign(PP_CORT, { activa: true, t: 0, rival: PP_CORTINILLA.rivalDe(d), tipo: PP_CORTINILLA.tipoDe(d), golpe: false, salida: null, alTerminar });
  ppLolaAparca();   // si Lola estaba hablando, se calla y vuelve al pulsar ¡A JUGAR! (ppEmpiezaNivel)
  ppCortBoton();
  ppSintonia('popCortinilla');   // la presentación: suena una vez (js/cancion-cortinilla.js)
}
// el botón es de DOM (con el estilo de los de Pop): sale cuando acaban las viñetas y se oculta al pulsarlo o al irse la cortinilla
function ppCortBoton() { const b = $pp('#pp-cort-jugar'); if (b) b.hidden = !(PP_CORT.activa && PP_CORT.salida === null && PP_CORTINILLA.puedePulsar(PP_CORT.t)); }
function ppCortPulsa() {
  if (!ppCortActiva() || PP_CORT.salida !== null || !PP_CORTINILLA.puedePulsar(PP_CORT.t)) return;
  PP_CORT.salida = 0; play('select'); ppCortBoton();
}
// entrar en otro nivel apaga la cortinilla que quedara abierta sin su callback
const ppCortCancela = () => { PP_CORT.activa = false; PP_CORT.alTerminar = null; ppCortBoton(); ppSintoniaCorta('popCortinilla'); };
function ppCortTermina() {
  if (!PP_CORT.activa) return;
  PP_CORT.activa = false; ppCortBoton(); ppSintoniaCorta('popCortinilla');   // al quitarse, vuelve la música del nivel (ppMusicaBucle)
  const sigue = PP_CORT.alTerminar; PP_CORT.alTerminar = null;
  if (sigue) sigue();
}
function ppCortAvanza(dt) {
  if (!PP_CORT.activa) return;
  PP_CORT.t += dt; if (PP_CORT.salida !== null) PP_CORT.salida += dt;
  ppCortBoton();
  if (PP_CORTINILLA.fotograma(PP_CORT.t).golpe && !PP_CORT.golpe) { PP_CORT.golpe = true; ppBoing(0.5); ppVibra(25); }
  if (PP_CORTINILLA.terminada(PP_CORT.salida)) ppCortTermina();
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
// la regla en tres filas: su número, unas burbujas de Yoshi de muestra y el texto
const PP_CORT_PASOS = [
  { texto: 'Haz pop en las que quieras de una fila', color: '#ff8a2a', burbujas: ['b-menta-abajo', 'b-menta-abajo', 'b-menta-arriba'] },
  { texto: 'Pulsa ¡LISTO! y le toca a tu rival', color: '#4aa8f0', burbujas: ['b-cielo-arriba', 'b-cielo-arriba', 'b-cielo-arriba'] },
  { texto: 'Quien haga pop en la última, pierde', color: '#ff6eb5', burbujas: ['b-rosa-arriba'] },
];
const PP_CORT_FLOTA = [{ k: 'f-estrellita', x: 52, y: 196, l: 52 }, { k: 'f-corazon', x: 488, y: 186, l: 48 }, { k: 'f-nube', x: 474, y: 436, l: 66 }];
const PP_CORT_ROSA = '#c43a84';
// una caja redondeada con relleno, borde y sombra de golosina (como las ventanas de Pop)
function ppCortCaja(c, x, y, w, h, r, relleno, borde, sombra) {
  c.fillStyle = sombra; c.beginPath(); c.roundRect(x, y + 7, w, h, r); c.fill();
  c.fillStyle = relleno; c.strokeStyle = borde; c.lineWidth = 5; c.beginPath(); c.roundRect(x, y, w, h, r); c.fill(); c.stroke();
}
function ppCortBurbuja(c, k, x, y, lado) {
  if (ppDibujaEn(c, k, x, y, lado)) return;
  c.fillStyle = '#ffb3d9'; c.beginPath(); c.arc(x, y, lado / 2, 0, Math.PI * 2); c.fill();
}
function ppCortCinta(c, a) {
  if (a <= 0.01) return;
  c.save(); c.globalAlpha = a; c.translate(0, -(1 - a) * 160);
  const g = c.createLinearGradient(0, 92, 0, 162); g.addColorStop(0, '#ffb3d9'); g.addColorStop(1, '#ff6eb5');
  ppCortCaja(c, 105, 92, 330, 70, 22, g, '#fff', PP_CORT_ROSA);
  ppTexto(c, tr(PP_CORT.tipo === 'jefe' ? '¡NIVEL JEFE!' : '¡DUELO!'), 270, 128, 50, '#fff', 'center', PP_CORT_ROSA);
  c.restore();
}
// cada uno en su cojín, con su nombre debajo: entra deslizándose desde su lado y luego respira despacito
function ppCortFigura(c, id, nombre, x, lado, a, t) {
  c.save(); c.globalAlpha = a; c.translate(x + lado * (1 - a) * 320, 0);
  c.fillStyle = '#ffb3d9'; c.beginPath(); c.ellipse(0, 366, 95, 26, 0, 0, Math.PI * 2); c.fill();
  const g = c.createRadialGradient(0, 356, 10, 0, 360, 95); g.addColorStop(0, '#fff'); g.addColorStop(1, '#ffd6ea');
  c.fillStyle = g; c.beginPath(); c.ellipse(0, 360, 95, 26, 0, 0, Math.PI * 2); c.fill();
  ppSlimeRepuestoOImagen(c, id, 0, 272 + Math.sin(t * 2.4 + lado) * 4, 78, t, 1);
  c.fillStyle = '#fff'; c.strokeStyle = '#ff9ccf'; c.lineWidth = 4; c.beginPath(); c.roundRect(-95, 394, 190, 40, 20); c.fill(); c.stroke();
  ppTexto(c, nombre, 0, 415, 30, '#2a1a3a', 'center', '#fff');
  c.restore();
}
function ppCortVs(c, escala) {
  if (escala <= 0.01) return;
  c.save(); c.translate(270, 262); c.scale(escala, escala);
  ppCortBurbuja(c, 'b-rosa-arriba', 0, 0, 112);
  ppTexto(c, 'VS', 0, 2, 58, '#fff', 'center', PP_CORT_ROSA);
  c.restore();
}
function ppCortFlotantes(c, a, t) {
  if (a <= 0.01) return;
  c.save(); c.globalAlpha = a * 0.95;
  PP_CORT_FLOTA.forEach((f, i) => ppCortBurbuja(c, f.k, f.x, f.y + Math.sin(t * 1.6 + i * 2) * 6, f.l));
  c.restore();
}
function ppCortFila(c, p, y, a) {
  if (a <= 0.01) return;
  c.save(); c.globalAlpha = a; c.translate((1 - a) * 60, 0);
  c.fillStyle = p.color; c.beginPath(); c.arc(82, y, 22, 0, Math.PI * 2); c.fill();
  ppTexto(c, String(PP_CORT_PASOS.indexOf(p) + 1), 82, y + 1, 34, '#fff', 'center', p.color);
  p.burbujas.forEach((k, i) => ppCortBurbuja(c, k, 133 + i * 31, y, 31));
  c.font = `600 ${Math.round(30 * PP_LETRA)}px ${PP_FUENTE}`;
  const lineas = ppEnvuelve(c, tr(p.texto), 470 - 228);
  lineas.forEach((l, i) => ppTexto(c, l, 228, y + (i - (lineas.length - 1) / 2) * 27, 30, '#2a1a3a', 'left', '#fff8fc'));
  c.restore();
}
// la tarjeta «Así se gana» con las tres filas, que van entrando una a una
function ppCortTarjeta(c, y, f) {
  if (f.figuras <= 0.01) return;
  c.save(); c.globalAlpha = f.figuras; c.translate(0, (1 - f.figuras) * 80);
  ppCortCaja(c, 34, y, 472, 340, 30, '#fff8fc', '#ff9ccf', 'rgba(196,58,132,0.3)');
  ppTexto(c, tr('Así se gana'), 270, y + 48, 38, '#e0468f', 'center', '#fff');
  c.restore();
  PP_CORT_PASOS.forEach((p, i) => ppCortFila(c, p, y + 118 + i * 86, f.pasos[i] * f.figuras));
}
function ppPintaCortinilla(c, t) {
  if (!PP_CORT.activa) return;
  const f = PP_CORTINILLA.fotograma(PP_CORT.t, PP_CORT.salida), H = PP_V.H;
  c.fillStyle = `rgba(255,232,243,${0.93 * f.panel})`; c.fillRect(0, 0, 540, H);   // el velo rosa: el fondo del mundo se intuye detrás
  ppCortFlotantes(c, f.figuras, t);
  ppCortCinta(c, f.etiqueta);
  ppCortFigura(c, 'lola', tr('Tú'), 125, -1, f.figuras, t);
  ppCortFigura(c, PP_CORT.rival, tr(PP_SLIMES[PP_CORT.rival].nombre), 415, 1, f.figuras, t);
  ppCortVs(c, f.vs);
  ppCortTarjeta(c, Math.max(470, Math.round(H * 0.49)), f);
}
