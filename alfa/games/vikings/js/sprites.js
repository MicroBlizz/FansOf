// Fans of Vikings · SPRITES y pincel: carga los dibujos de img/ (pixel art hecho en Yoshi y pasado a píxel con
// herramientas/comfyui/vikings/sprites.py), las animaciones fotograma a fotograma de img/anim/ cuando existen (VK_FOTOS,
// js/fotos.js) y, si aún no, una animación por código que mueve el mismo dibujo píxel a píxel (respirar, andar, trabajar, atacar).
// El dibujo va a un lienzo pequeño (VK_ANCHO de ancho) que se amplía sin suavizar; los textos se pintan después, encima y a la
// resolución de la pantalla, con la letra de píxeles (Pixelify Sans), para que se lean nítidos.
'use strict';
const VK_IMG = {};
const VK_NOMBRES_IMG = ['crazybunny', 'madsquirrel', 'slyfox', 'meercat', 'becario', 'abogado', 'ejecutivo',
  'casa', 'huerto', 'cocina', 'herreria', 'almacen', 'autobus', 'cesped', 'agua', 'camino', 'zanahoria', 'pan', 'espada', 'escudo'];
for (const n of VK_NOMBRES_IMG) { const im = new Image(); im.src = 'img/' + n + '.png'; VK_IMG[n] = im; }
const vkLista = im => im && im.complete && im.naturalWidth > 0;

// fotogramas de animación: VK_FOTOS = { crazybunny: { reposo: 10, andar: 10, ... } } (js/fotos.js); se cargan si están
const VK_ANIM = {};
function vkCargaFotos() {
  if (typeof VK_FOTOS === 'undefined') return;
  for (const quien in VK_FOTOS) for (const anim in VK_FOTOS[quien]) {
    const lista = [];
    for (let i = 1; i <= VK_FOTOS[quien][anim]; i++) { const im = new Image(); im.src = `img/anim/${quien}-${anim}-${i}.png`; lista.push(im); }
    (VK_ANIM[quien] = VK_ANIM[quien] || {})[anim] = lista;
  }
}
vkCargaFotos();
function vkFoto(quien, anim, t, fps = 12) {
  const l = VK_ANIM[quien] && VK_ANIM[quien][anim];
  if (!l || !l.length) return null;
  const L = l.length, k = Math.floor(t * fps);
  let i = k % L;
  if (anim === 'atacar') i = Math.min(L - 1, Math.floor((t / 0.55) * L));          // el ataque, una vez y entero en lo que dura el golpe
  else if (anim === 'reposo' && L > 2) { const c = k % (2 * L - 2); i = c < L ? c : 2 * L - 2 - c; }   // respirar: ida y vuelta, sin salto
  const im = l[i];
  return vkLista(im) ? im : null;
}

/* ---------- pintar personajes ---------- */
// dibuja a un personaje con los pies en (x, y). anim: reposo | andar | trabajar | atacar | golpe | ko.
// t = tiempo de su animación; o = { blanco, alfa, avance } (avance: cuánto se lanza hacia delante al atacar, en píxeles, con signo)
function vkPersonaje(c, quien, x, y, anim, t, o = {}) {
  const base = VK_IMG[quien]; if (!vkLista(base)) return;
  let im = vkFoto(quien, anim === 'golpe' ? 'reposo' : anim, t) || base;
  let dx = 0, dy = 0;
  const usaFotos = im !== base;
  if (!usaFotos) {   // la animación por código: el mismo dibujo, movido píxel a píxel
    const f = Math.floor(t * 8);
    if (anim === 'reposo') dy = Math.floor(t * 2) % 2;
    else if (anim === 'andar') { dy = -(f % 2); dx = (f % 4 < 2) ? 0 : 1; }
    else if (anim === 'trabajar') dy = [0, 1, 2, 1][Math.floor(t * 5) % 4];
  }
  if (anim === 'atacar') dy -= Math.round(Math.sin(Math.min(1, t / 0.45) * Math.PI) * 3);
  if (o.avance) dy += Math.round(o.avance);
  if (anim === 'golpe') dx += (Math.floor(t * 30) % 2) ? 1 : -1;
  const w = im.naturalWidth, h = im.naturalHeight;
  c.save();
  if (o.alfa !== undefined) c.globalAlpha = o.alfa;
  // sombra de píxel bajo los pies
  c.fillStyle = 'rgba(20,40,10,0.35)';
  c.fillRect(Math.round(x - w * 0.32), Math.round(y - 2), Math.round(w * 0.64), 3);
  if (anim === 'ko') {   // tumbado: girar 90° es exacto en pixel art
    c.translate(Math.round(x), Math.round(y - w / 2));
    c.rotate(-Math.PI / 2);
    c.drawImage(im, -w / 2 | 0, -h / 2 | 0);
  } else {
    const px = Math.round(x - w / 2 + dx), py = Math.round(y - h + dy);
    c.drawImage(im, px, py);
    if (o.blanco) vkBlanco(c, im, px, py, o.blanco);
  }
  c.restore();
}
// el destello blanco al recibir un golpe: la silueta del dibujo en blanco
const VK_SILUETA = new Map();
function vkBlanco(c, im, x, y, alfa) {
  let s = VK_SILUETA.get(im);
  if (!s) {
    s = document.createElement('canvas'); s.width = im.naturalWidth; s.height = im.naturalHeight;
    const g = s.getContext('2d'); g.drawImage(im, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = '#fff'; g.fillRect(0, 0, s.width, s.height);
    VK_SILUETA.set(im, s);
  }
  c.save(); c.globalAlpha = Math.min(1, alfa); c.drawImage(s, x, y); c.restore();
}
function vkIcono(c, nombre, x, y) { const im = VK_IMG[nombre]; if (vkLista(im)) c.drawImage(im, Math.round(x - im.naturalWidth / 2), Math.round(y - im.naturalHeight / 2)); }

/* ---------- la interfaz de píxeles ---------- */
const VK_COL = { tinta: '#20142a', crema: '#fff4d6', madera: '#8a5a32', maderaClara: '#b9844f', naranja: '#ff8a2a', naranjaClaro: '#ffc07a',
  verde: '#4fb848', verdeClaro: '#9ee38a', azul: '#3f8fe0', azulClaro: '#9fd0ff', rojo: '#e8483f', rojoClaro: '#ff9e8e', oro: '#ffd34d', vida: '#5fd35a' };
// caja con contorno de 1 px y brillo arriba, como un panel de madera o un botón de juego retro
function vkCaja(c, x, y, w, h, fondo, claro) {
  x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
  c.fillStyle = VK_COL.tinta; c.fillRect(x + 1, y, w - 2, h); c.fillRect(x, y + 1, w, h - 2);
  c.fillStyle = fondo; c.fillRect(x + 1, y + 1, w - 2, h - 2);
  if (claro) { c.fillStyle = claro; c.fillRect(x + 2, y + 1, w - 4, 1); c.fillRect(x + 1, y + 2, 1, Math.max(0, h - 5)); }
  c.fillStyle = 'rgba(0,0,0,0.22)'; c.fillRect(x + 2, y + h - 2, w - 4, 1);
}
function vkBarra(c, x, y, w, h, frac, col) {
  vkCaja(c, x, y, w, h, '#3a2a30');
  const fw = Math.round((w - 2) * Math.max(0, Math.min(1, frac)));
  if (fw > 0) { c.fillStyle = col; c.fillRect(Math.round(x) + 1, Math.round(y) + 1, fw, Math.round(h) - 2); c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(Math.round(x) + 1, Math.round(y) + 1, fw, 1); }
}

// los textos: se apuntan mientras se pinta y se dibujan al final a la resolución de la pantalla
const VK_TXT = [];
function vkTexto(x, y, txt, o = {}) { VK_TXT.push({ x, y, txt: String(txt), tam: o.tam || 8, col: o.col || VK_COL.crema, al: o.al || 'left', borde: o.borde !== false, ancho: o.ancho || 0, negrita: o.negrita }); }
function vkPintaTextos(c, esc) {
  for (const t of VK_TXT) {
    const tam = Math.round(t.tam * esc);
    c.font = `${t.negrita ? 700 : 500} ${tam}px 'Pixelify Sans', monospace`;
    c.textAlign = t.al; c.textBaseline = 'middle';
    const lineas = t.ancho ? vkParte(c, t.txt, t.ancho * esc) : [t.txt];
    lineas.forEach((l, i) => {
      const x = t.x * esc, y = (t.y + i * t.tam * 1.15) * esc, g = Math.max(1, Math.round(esc * 0.75));
      if (t.borde) { c.fillStyle = VK_COL.tinta; for (const [a, b] of [[g, 0], [-g, 0], [0, g], [0, -g], [g, g], [-g, g], [g, -g], [-g, -g]]) c.fillText(l, x + a, y + b); }
      c.fillStyle = t.col; c.fillText(l, x, y);
    });
  }
  VK_TXT.length = 0;
}
function vkParte(c, txt, ancho) {
  const pal = txt.split(' '), out = []; let l = '';
  for (const p of pal) { const prueba = l ? l + ' ' + p : p; if (c.measureText(prueba).width > ancho && l) { out.push(l); l = p; } else l = prueba; }
  if (l) out.push(l);
  return out;
}

// botones de la pantalla: se apuntan al pintar y el toque los busca (la última capa pintada gana)
const VK_BOTONES = [];
function vkBoton(c, id, x, y, w, h, texto, o = {}) {
  const colores = { naranja: [VK_COL.naranja, VK_COL.naranjaClaro], verde: [VK_COL.verde, VK_COL.verdeClaro], azul: [VK_COL.azul, VK_COL.azulClaro],
    rojo: [VK_COL.rojo, VK_COL.rojoClaro], madera: [VK_COL.madera, VK_COL.maderaClara] };
  const [f, cl] = o.apagado ? ['#6b4a30', '#8a6440'] : colores[o.col || 'naranja'];
  const pulsado = VK_PULSA.id === id + ':' + JSON.stringify(o.dato);
  vkCaja(c, x, y + (pulsado ? 1 : 0), w, h, f, cl);
  if (!pulsado) { c.fillStyle = VK_COL.tinta; c.fillRect(Math.round(x) + 1, Math.round(y + h), Math.round(w) - 2, 1); }
  if (o.icono) vkIcono(c, o.icono, x + (texto ? 10 : w / 2), y + h / 2 + (pulsado ? 1 : 0));
  if (texto) vkTexto(x + w / 2 + (o.icono ? 6 : 0), y + h / 2 + (pulsado ? 1 : 0) + 0.5, texto, { tam: o.tam || 8, al: 'center', negrita: true, col: o.colTexto });
  VK_BOTONES.push({ id, x, y, w, h, dato: o.dato, apagado: !!o.apagado });
}
const VK_PULSA = { id: null };
function vkBotonEn(x, y) {
  for (let i = VK_BOTONES.length - 1; i >= 0; i--) { const b = VK_BOTONES[i]; if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return b; }
  return null;
}
// zonas que se pueden tocar sin dibujar botón (un edificio, un enemigo)
function vkZona(id, x, y, w, h, dato) { VK_BOTONES.push({ id, x, y, w, h, dato, zona: true }); }
