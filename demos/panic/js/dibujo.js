// Fans of Panic · Dibujo: ayudas para pintar en el canvas (cajas redondeadas, letra con borde, botones) y la lista de botones
// de cada fotograma. G es el pincel (lo crea js/principal.js). Todo se mide en el mundo de 360 de ancho.
'use strict';

let G = null;
const COL = { fondo: '#160a22', tinta: '#0d0516', rosa: '#ff5fa2', oro: '#ffd54a', cian: '#5ff2ff', verde: '#5fe88f', gris: '#5a5a66', panel: '#3a3444', blanco: '#fff8fc' };

function caja(x, y, w, h, r, fill, stroke, lw = 2) {
  G.beginPath();
  G.moveTo(x + r, y); G.arcTo(x + w, y, x + w, y + h, r); G.arcTo(x + w, y + h, x, y + h, r);
  G.arcTo(x, y + h, x, y, r); G.arcTo(x, y, x + w, y, r); G.closePath();
  if (fill) { G.fillStyle = fill; G.fill(); }
  if (stroke) { G.strokeStyle = stroke; G.lineWidth = lw; G.stroke(); }
}

// letra con borde (Baloo 2); alin: 'left' | 'center' | 'right'
function letra(txt, x, y, tam, color = COL.blanco, alin = 'center', borde = COL.tinta, lw = 4, peso = 800) {
  G.font = `${peso} ${tam}px "Baloo 2", system-ui, sans-serif`;
  G.textAlign = alin; G.textBaseline = 'middle'; G.lineJoin = 'round';
  if (borde && lw > 0) { G.lineWidth = lw; G.strokeStyle = borde; G.strokeText(txt, x, y); }
  G.fillStyle = color; G.fillText(txt, x, y);
}

// letra partida en líneas que quepan en un ancho
function parrafo(txt, x, y, w, tam, color = COL.blanco, alin = 'center', alto = tam * 1.25) {
  G.font = `700 ${tam}px "Baloo 2", system-ui, sans-serif`;
  const lineas = []; let fila = '';
  for (const p of txt.split(' ')) {
    const prueba = fila ? fila + ' ' + p : p;
    if (G.measureText(prueba).width > w && fila) { lineas.push(fila); fila = p; } else fila = prueba;
  }
  if (fila) lineas.push(fila);
  lineas.forEach((l, i) => letra(l, x, y + i * alto, tam, color, alin, COL.tinta, 3, 700));
  return lineas.length * alto;
}

function circulo(x, y, r, fill, stroke, lw = 2) {
  G.beginPath(); G.arc(x, y, r, 0, Math.PI * 2);
  if (fill) { G.fillStyle = fill; G.fill(); }
  if (stroke) { G.strokeStyle = stroke; G.lineWidth = lw; G.stroke(); }
}

const dentro = (r, px, py) => r && px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;

// ---------- botones de las pantallas ----------
// Cada fotograma se vacía la lista (js/pantalla.js) y cada botón dibujado se apunta con su acción; un toque (js/entrada.js)
// busca el último botón que esté debajo del dedo.
const UI = []; UI.enter = null; UI.atras = null;
const PLACA = { [COL.rosa]: 'boton', [COL.oro]: 'boton-oro', [COL.panel]: 'boton-gris', [COL.verde]: 'boton' };   // qué placa de Yoshi lleva cada color
function botonUI(txt, x, y, w, h, accion, col = COL.rosa, colTxt = COL.tinta, tam = 16) {
  const placa = sprite(PLACA[col] || 'boton-gris');
  if (placa) G.drawImage(placa, x, y, w, h + 4);
  else { caja(x, y + 4, w, h, 10, COL.tinta, null); caja(x, y, w, h, 10, col, COL.tinta, 2.5); }
  letra(txt, x + w / 2, y + h / 2 + 1, tam, colTxt, 'center', null, 0);
  UI.push({ x, y, w, h, accion });
  return { x, y, w, h };
}
function zonaUI(x, y, w, h, accion) { UI.push({ x, y, w, h, accion }); }
function toqueUI(px, py) {
  for (let i = UI.length - 1; i >= 0; i--) if (dentro(UI[i], px, py)) { SONIDO.boton(); UI[i].accion(); return true; }
  return false;
}

// una estrella de cinco puntas, llena o vacía (sprite de Yoshi si está; si no, dibujada)
function estrella(x, y, r, llena = true) {
  if (sprite('estrella')) { G.globalAlpha = llena ? 1 : 0.25; pintaSprite('estrella', x, y, r * 2.2); G.globalAlpha = 1; return; }
  G.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; G.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  G.closePath(); G.fillStyle = llena ? COL.oro : '#2a2235'; G.fill(); G.strokeStyle = COL.tinta; G.lineWidth = Math.max(1, r * 0.22); G.lineJoin = 'round'; G.stroke();
}

// una ficha (la moneda del juego)
function ficha(x, y, r) {
  if (sprite('ficha')) { pintaSprite('ficha', x, y, r * 2.2); return; }
  circulo(x, y + 1.5, r, COL.tinta, null); circulo(x, y, r, COL.rosa, COL.tinta, Math.max(1, r * 0.18));
  letra('P', x, y + 1, r * 1.3, COL.blanco, 'center', COL.tinta, r * 0.3);
}

// un corazón (las vidas)
function corazon(x, y, r, lleno = true) {
  if (sprite('corazon')) { G.globalAlpha = lleno ? 1 : 0.25; pintaSprite('corazon', x, y, r * 2.2); G.globalAlpha = 1; return; }
  G.beginPath();
  G.moveTo(x, y + r);
  G.bezierCurveTo(x - r * 1.4, y - r * 0.2, x - r * 0.7, y - r * 1.1, x, y - r * 0.4);
  G.bezierCurveTo(x + r * 0.7, y - r * 1.1, x + r * 1.4, y - r * 0.2, x, y + r);
  G.closePath(); G.fillStyle = lleno ? '#ff4d6d' : '#2a2235'; G.fill(); G.strokeStyle = COL.tinta; G.lineWidth = Math.max(1, r * 0.25); G.lineJoin = 'round'; G.stroke();
}

// ---------- con los dibujos de Yoshi (js/sprites.js) ----------
// una palabra pintada (img/palabra-<nombre>.png); si no está, el texto con letra
function palabra(nombre, txt, x, y, alto, col = COL.blanco) {
  if (sprite('palabra-' + nombre)) { pintaSprite('palabra-' + nombre, x, y, alto); return; }
  letra(txt, x, y, alto * 0.8, col);
}

// un número con los dígitos pintados (img/numeros.png: los diez en fila, del 0 al 9); si no está, con letra
function numero(n, x, y, alto, col = COL.blanco, alin = 'center') {
  const im = sprite('numeros'), s = String(n);
  if (!im) { letra(s, x, y, alto * 0.9, col, alin); return; }
  const dw = im.width / 10, w = alto * dw / im.height, x0 = alin === 'center' ? x - s.length * w / 2 : alin === 'right' ? x - s.length * w : x;
  for (let i = 0; i < s.length; i++) { const d = +s[i]; if (d >= 0) G.drawImage(im, d * dw, 0, dw, im.height, x0 + i * w, y - alto / 2, w, alto); }
}

// una barra de progreso (img/barra-vacia.png y barra-llena.png); si no están, cajas
function barra(x, y, w, h, parte, colLleno) {
  if (sprite('barra-vacia') && sprite('barra-llena')) {
    const v = sprite('barra-vacia'); G.drawImage(v, x, y, w, h);
    G.save(); G.beginPath(); G.rect(x, y, w * Math.min(1, parte), h); G.clip(); G.drawImage(sprite('barra-llena'), x, y, w, h); G.restore();
    return;
  }
  caja(x, y, w, h, h / 2, 'rgba(13,5,22,.8)', null);
  caja(x + 1, y + 1, (w - 2) * Math.min(1, parte), h - 2, h / 2 - 1, colLleno, null);
}
