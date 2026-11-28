// Fans of Pop · EL DIBUJO DEL PERFIL DE JUGADOR (tarea #41, ADR 130): el panel que se ve en «Mi perfil» y en el VS de los duelos (fondo,
// marco, personaje, frase, nombre, título y pegatinas) y las muestras pequeñas de cada cosa del catálogo para la pantalla de elegir.
// Los adornos de los marcos y lo que acompaña a las entradas son dibujos de Yoshi (`img` en js/perfil-catalogo.js; si aún no han llegado, el
// repuesto dibujado por código). Los efectos de pop siguen por código hasta la tarea #110.
// Solo dibuja: no sabe de perlas ni de servidor. Recibe un perfil ya limpio (PP_PERFIL.limpia) y el catálogo (PP_MI.cat).
'use strict';
const PP_PF_TINTA = '#7a3a7a';
/* ---------- adornos de los marcos y de los efectos ---------- */
const PP_PF_ADORNOS = {
  flor(c, s, col) { for (let k = 0; k < 5; k++) { const a = k * Math.PI * 2 / 5; c.fillStyle = col; c.beginPath(); c.arc(Math.cos(a) * s * 0.3, Math.sin(a) * s * 0.3, s * 0.22, 0, Math.PI * 2); c.fill(); } c.fillStyle = '#ffe36e'; c.beginPath(); c.arc(0, 0, s * 0.17, 0, Math.PI * 2); c.fill(); },
  corazon(c, s, col) { c.fillStyle = col; c.beginPath(); c.moveTo(0, s * 0.42); c.bezierCurveTo(-s * 0.7, -s * 0.1, -s * 0.3, -s * 0.6, 0, -s * 0.22); c.bezierCurveTo(s * 0.3, -s * 0.6, s * 0.7, -s * 0.1, 0, s * 0.42); c.fill(); },
  estrella(c, s, col) { c.fillStyle = col; c.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? s * 0.22 : s * 0.5; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); },
  punto(c, s, col) { c.fillStyle = col; c.beginPath(); c.arc(0, 0, s * 0.3, 0, Math.PI * 2); c.fill(); },
  perla(c, s) { const g = c.createRadialGradient(-s * 0.12, -s * 0.12, s * 0.05, 0, 0, s * 0.4); g.addColorStop(0, '#fff'); g.addColorStop(1, '#f3b8e6'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, s * 0.36, 0, Math.PI * 2); c.fill(); },
  arcoiris(c, s) { ['#ff8a8a', '#ffd166', '#7be0a0', '#7ec8ff'].forEach((col, k) => { c.strokeStyle = col; c.lineWidth = s * 0.11; c.beginPath(); c.arc(0, s * 0.2, s * (0.46 - k * 0.11), Math.PI, 0); c.stroke(); }); },
};
function ppPfAdorno(c, tipo, x, y, s, col) {
  const f = PP_PF_ADORNOS[tipo]; if (!f) return;
  c.save(); c.translate(x, y); f(c, s, col); c.restore();
}
/* ---------- el marco ---------- */
// el borde con los colores del marco (de arriba abajo) y sus adornos en las esquinas y a media altura
function ppPfMarco(c, marco, x, y, w, h, r, grosor) {
  const cols = (marco && marco.colores) || ['#ffffff', '#ffd1ec'], g = c.createLinearGradient(x, y, x + w, y + h);
  cols.forEach((col, k) => g.addColorStop(cols.length > 1 ? k / (cols.length - 1) : 0, col));
  c.save();
  c.lineWidth = grosor + 4; c.strokeStyle = '#c43a84'; c.beginPath(); c.roundRect(x, y, w, h, r); c.stroke();
  c.lineWidth = grosor; c.strokeStyle = g; c.beginPath(); c.roundRect(x, y, w, h, r); c.stroke();
  if (marco && marco.adorno) {
    const s = grosor * 2.6, col = cols[cols.length - 1], m = grosor * 0.4;
    for (const [ax, ay] of [[x + m, y + m], [x + w - m, y + m], [x + m, y + h - m], [x + w - m, y + h - m], [x, y + h / 2], [x + w, y + h / 2]]) {
      if (marco.img && ppDibujaEn(c, marco.img, ax, ay, s * 1.15, true)) continue;   // el adorno de Yoshi
      c.fillStyle = '#fff'; c.beginPath(); c.arc(ax, ay, s * 0.52, 0, Math.PI * 2); c.fill();
      ppPfAdorno(c, marco.adorno, ax, ay, s, col);
    }
  }
  c.restore();
}
/* ---------- el fondo ---------- */
// la imagen del mundo recortada para llenar la caja (o un degradado rosa si aún no ha llegado)
function ppPfFondo(c, k, x, y, w, h) {
  const im = PP_IMG[k];
  if (!im) { const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#ffe3f1'); g.addColorStop(1, '#ffb3d9'); c.fillStyle = g; c.fillRect(x, y, w, h); return; }
  const esc = Math.max(w / im.width, h / im.height), sw = w / esc, sh = h / esc;
  c.imageSmoothingEnabled = true;
  c.drawImage(im, (im.width - sw) / 2, (im.height - sh) * 0.62, sw, sh, x, y, w, h);
}
/* ---------- el panel entero ---------- */
function ppPfBocadillo(c, texto, cx, y, ancho, tam) {
  c.font = `700 ${Math.round(tam * PP_LETRA)}px ${PP_FUENTE}`;
  const lineas = ppEnvuelve(c, texto, ancho - 24).slice(0, 2), alto = lineas.length * tam * 0.9 + 16;
  const w = Math.min(ancho, Math.max(...lineas.map(l => c.measureText(l).width)) + 28);
  c.fillStyle = '#fff'; c.strokeStyle = '#ff9ccf'; c.lineWidth = 3;
  c.beginPath(); c.roundRect(cx - w / 2, y, w, alto, 14); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(cx - 8, y + alto - 1); c.lineTo(cx, y + alto + 10); c.lineTo(cx + 8, y + alto - 1); c.fill();
  lineas.forEach((l, k) => ppTexto(c, l, cx, y + 8 + tam * 0.45 + k * tam * 0.9, tam, PP_PF_TINTA, 'center', '#fff'));
  return alto + 10;
}
function ppPfPlaca(c, nombre, titulo, cx, y, ancho, tam) {
  c.fillStyle = 'rgba(255,255,255,0.94)'; c.strokeStyle = '#ff9ccf'; c.lineWidth = 3;
  c.beginPath(); c.roundRect(cx - ancho / 2, y, ancho, tam * 2.25, 14); c.fill(); c.stroke();
  let n = String(nombre); c.font = `700 ${Math.round(tam * PP_LETRA)}px ${PP_FUENTE}`;
  while (n.length > 3 && c.measureText(n).width > ancho - 20) n = n.slice(0, -2) + '…';
  ppTexto(c, n, cx, y + tam * 0.7, tam, '#2a1a3a', 'center', '#fff');
  ppTexto(c, titulo, cx, y + tam * 1.62, tam * 0.72, '#c43a84', 'center', '#fff');
}
// `P`: el perfil (ids), `cat`: el catálogo, `t`: el reloj de la animación. La caja es (x, y, w, h), más alta que ancha.
function ppPerfilPanel(c, P, cat, nombre, x, y, w, h, t = 0) {
  const de = (tipo, id) => PP_PERFIL.busca(cat, tipo, id) || {}, r = 22, g = Math.max(6, Math.round(w * 0.04));
  c.save();
  c.beginPath(); c.roundRect(x, y, w, h, r); c.clip();
  ppPfFondo(c, de('fondo', P.fondo).img, x, y, w, h);
  c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(x, y, w, h);
  c.restore();
  const cx = x + w / 2, tam = Math.max(16, w * 0.12), alto = ppPfBocadillo(c, tr(de('frase', P.frase).texto || ''), cx, y + g + 8, w - g * 2 - 12, tam);
  const placaY = y + h - g - tam * 2.25 - 8, hueco = placaY - (y + g + 8 + alto), radio = Math.min(w * 0.3, hueco * 0.36);
  const py = y + g + 8 + alto + hueco * 0.46 + Math.sin(t * 2.4) * 3;
  c.fillStyle = 'rgba(255,255,255,0.75)'; c.beginPath(); c.ellipse(cx, py + radio * 0.98, radio * 0.95, radio * 0.26, 0, 0, Math.PI * 2); c.fill();
  ppSlimeRepuestoOImagen(c, P.personaje, cx, py, radio, t, 1);
  const peg = P.pegatinas || [], lado = Math.min(w * 0.17, 40);
  peg.forEach((id, k) => ppDibujaEn(c, de('pegatina', id).img, cx + (k - (peg.length - 1) / 2) * (lado + 4), placaY - lado * 0.56, lado, true));
  ppPfPlaca(c, nombre, tr(de('titulo', P.titulo).texto || ''), cx, placaY, w - g * 2 - 12, tam);
  ppPfMarco(c, de('marco', P.marco), x, y, w, h, r, g);
}
/* ---------- las muestras del catálogo (un lienzo cuadrado por cosa) ---------- */
// dónde va el dibujo de cada entrada en su muestra: [x, y, lado] en partes del lienzo (Lola está en 0.56, 0.54)
const PP_PF_ENTRADA_MUESTRA = Object.freeze({ nube: [0.56, 0.8, 0.62], salto: [0.56, 0.8, 0.42], giro: [0.56, 0.54, 0.8] });
function ppPfMuestraEntrada(c, d, L) {
  const [x, y, l] = PP_PF_ENTRADA_MUESTRA[d.id] || [0.5, 0.5, 0.5];
  ppDibujaEn(c, d.img, L * x, L * y, L * l, true);
}
const PP_PF_MUESTRAS = {
  personaje: (c, d, L) => ppSlimeRepuestoOImagen(c, d.id, L / 2, L / 2, L * 0.4, 0, 1),
  pegatina: (c, d, L) => { ppDibujaEn(c, d.img, L / 2, L / 2, L * 0.86, true); },
  marco: (c, d, L) => { c.fillStyle = '#fff5fb'; c.beginPath(); c.roundRect(L * 0.14, L * 0.14, L * 0.72, L * 0.72, 10); c.fill(); ppPfMarco(c, d, L * 0.14, L * 0.14, L * 0.72, L * 0.72, 10, L * 0.09); },
  fondo: (c, d, L) => { c.save(); c.beginPath(); c.roundRect(4, 4, L - 8, L - 8, 12); c.clip(); ppPfFondo(c, d.img, 4, 4, L - 8, L - 8); c.restore(); },
  // el efecto de pop: un anillo y las cositas que saltan al hacer pop
  efecto(c, d, L) {
    const col = d.color || '#ff9ccf', forma = { corazones: 'corazon', estrellas: 'estrella', confeti: 'punto', burbujitas: 'perla' }[d.id];
    c.strokeStyle = col; c.lineWidth = L * 0.06; c.beginPath(); c.arc(L / 2, L / 2, L * 0.17, 0, Math.PI * 2); c.stroke();
    for (let k = 0; k < 8; k++) {
      const a = k * Math.PI / 4 + 0.3, x = L / 2 + Math.cos(a) * L * 0.34, y = L / 2 + Math.sin(a) * L * 0.34;
      if (forma) ppPfAdorno(c, forma, x, y, L * 0.2, d.id === 'confeti' ? ['#7ec8ff', '#ffd166', '#ff8cc6', '#7be0a0'][k % 4] : col);
      else { c.strokeStyle = col; c.lineWidth = L * 0.045; c.lineCap = 'round'; c.beginPath(); c.moveTo(L / 2 + Math.cos(a) * L * 0.27, L / 2 + Math.sin(a) * L * 0.27); c.lineTo(x, y); c.stroke(); }
    }
  },
  // la entrada: Lola llegando de esa manera
  entrada(c, d, L) {
    c.strokeStyle = '#ff8cc6'; c.lineWidth = L * 0.05; c.lineCap = 'round'; c.setLineDash([L * 0.02, L * 0.1]);
    c.beginPath();
    if (d.id === 'salto') { c.moveTo(L * 0.1, L * 0.78); c.quadraticCurveTo(L * 0.3, L * 0.02, L * 0.56, L * 0.5); }
    else if (d.id === 'giro') c.arc(L * 0.56, L * 0.54, L * 0.36, Math.PI * 0.9, Math.PI * 2.3);
    else if (d.id !== 'nube') { c.moveTo(L * 0.06, L * 0.6); c.lineTo(L * 0.3, L * 0.6); }
    c.stroke(); c.setLineDash([]);
    if (d.img && PP_IMG[d.img]) ppPfMuestraEntrada(c, d, L);   // el dibujo de Yoshi: la nube debajo, el polvo al caer, las estrellitas al girar
    else if (d.id === 'nube') { c.fillStyle = '#fff'; c.strokeStyle = '#9fdcff'; c.lineWidth = 3; for (const [x, y, r] of [[0.36, 0.8, 0.13], [0.56, 0.84, 0.16], [0.74, 0.8, 0.12]]) { c.beginPath(); c.arc(L * x, L * y, L * r, 0, Math.PI * 2); c.fill(); c.stroke(); } }
    ppSlimeRepuestoOImagen(c, 'lola', L * 0.56, L * 0.54, L * 0.25, 0, 1);
  },
};
// un lienzo con la muestra de una cosa; null si esa cosa es solo texto (frases y títulos)
function ppPerfilMuestra(tipo, d, lado = 84) {
  const f = PP_PF_MUESTRAS[tipo]; if (!f) return null;
  const cv = document.createElement('canvas'), px = Math.min(2, window.devicePixelRatio || 1);
  cv.width = lado * px; cv.height = lado * px; cv.style.width = lado + 'px'; cv.style.height = lado + 'px';
  const c = cv.getContext('2d'); c.scale(px, px);
  f(c, d, lado);
  return cv;
}
