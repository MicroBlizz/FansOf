// Fans of Jump · Los dibujos 3D (pelo, corona, capita, troncos, árboles…): fotos del estudio 3D (herramientas/estudio-jump)
// juntas en una lámina (img/atlas.webp, con su lista en atlas.js). Se pintan con su punto de apoyo en (x, y) y a la escala
// «tam»: cuántas medidas del mundo mide una unidad del modelo 3D.
'use strict';

const LAMINA = new Image();
let laminaLista = false;
function cargaLamina() {
  return new Promise(ok => {
    LAMINA.onload = () => { laminaLista = true; ok(); };
    LAMINA.onerror = () => ok();
    LAMINA.src = ATLAS.src + '?v=' + (typeof VERSION !== 'undefined' ? VERSION : '0');
  });
}
// pinta el dibujo «nombre» apoyado en (x, y), girado «ang» y estirado (sx, sy) desde el apoyo
function sprite(nombre, x, y, tam, ang = 0, sx = 1, sy = 1, alfa = 1) {
  const c = ATLAS.cuadros[nombre];
  if (!c || !laminaLista) return;
  const k = tam / ATLAS.unidadX;
  const antes = G.globalAlpha;
  G.globalAlpha = antes * alfa;
  aqui(x, y, ang, sx * k, sy * k, () => G.drawImage(LAMINA, c[0], c[1], c[2], c[3], -c[4], -c[5], c[2], c[3]));
  G.globalAlpha = antes;
}
// lo alto (en medidas del mundo, hacia arriba de la pantalla) de «u» unidades del modelo a esa escala
const altoModelo = (u, tam) => u * ATLAS.unidadY * tam / ATLAS.unidadX;

// el mismo dibujo teñido de un color (el pelaje o la capa): se multiplica el blanco por el color y se guarda hecho
const TINTES = new Map();
function teñido(nombre, color) {
  const clave = nombre + color;
  let c = TINTES.get(clave);
  if (c) return c;
  const q = ATLAS.cuadros[nombre];
  c = document.createElement('canvas'); c.width = q[2]; c.height = q[3];
  const g = c.getContext('2d');
  g.drawImage(LAMINA, q[0], q[1], q[2], q[3], 0, 0, q[2], q[3]);
  g.globalCompositeOperation = 'multiply'; g.fillStyle = color; g.fillRect(0, 0, q[2], q[3]);
  g.globalCompositeOperation = 'destination-in'; g.drawImage(LAMINA, q[0], q[1], q[2], q[3], 0, 0, q[2], q[3]);
  TINTES.set(clave, c);
  return c;
}
function spriteTeñido(nombre, color, x, y, tam, ang = 0, sx = 1, sy = 1) {
  if (!color || color === '#ffffff') return sprite(nombre, x, y, tam, ang, sx, sy);
  const q = ATLAS.cuadros[nombre];
  if (!q || !laminaLista) return;
  const k = tam / ATLAS.unidadX, c = teñido(nombre, color);
  aqui(x, y, ang, sx * k, sy * k, () => G.drawImage(c, -q[4], -q[5]));
}
// CrazyBunny por capas: el cuerpo (con el color del pelaje), la capa (con el suyo) y el oro (corona, ribete y broche)
function spriteConejo(cuadro, x, y, tam, ang = 0, sx = 1, sy = 1, pelo = GUARDA.pelaje, capa = GUARDA.capa) {
  spriteTeñido(cuadro + '_cuerpo', pelo, x, y, tam, ang, sx, sy);
  spriteTeñido(cuadro + '_capa', capa || '#ff7a1a', x, y, tam, ang, sx, sy);
  sprite(cuadro + '_oro', x, y, tam, ang, sx, sy);
}
// el dibujo entero, encajado y centrado en un recuadro (para fichas y tarjetas): cabe siempre, sin salirse ni quedarse caído
function spriteEnCaja(nombre, x, y, w, h, margen = 2) {
  const c = ATLAS.cuadros[nombre];
  if (!c || !laminaLista) return;
  const k = Math.min((w - margen * 2) / c[2], (h - margen * 2) / c[3]), dw = c[2] * k, dh = c[3] * k;
  G.drawImage(LAMINA, c[0], c[1], c[2], c[3], x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}
// la zanahoria de los marcadores y los precios: la de frente, en diagonal, centrada en (x, y) y de «s» de alto como mucho
const iconoZana = (x, y, s) => spriteEnCaja('zanahoria_icono', x - s / 2, y - s / 2, s, s, 0);
