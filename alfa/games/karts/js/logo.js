// Fans of Karts · EL LOGO del título: «FANS OF» pequeño y quieto, y «KARTS» (la bandera de meta) ondeando columna a columna: la ola crece
// hacia la derecha, que es el borde libre. Son imágenes sueltas; hasta que cargan las dos no se dibuja nada (LOGO.listo).
'use strict';

const LOGO = {
  listo: false,
  partes: [
    { src: 'img/logo-fansof.png', ancho: 104, y: 7, ola: false, img: null },
    { src: 'img/logo-karts.png', ancho: 168, y: 27, ola: true, img: null },
  ],
};
function cargaLogo() {
  if (LOGO.partes[0].img) return;
  let faltan = LOGO.partes.length;
  for (const p of LOGO.partes) {
    p.img = new Image();
    p.img.onload = () => { if (--faltan === 0) LOGO.listo = true; };
    p.img.src = p.src;
  }
}
// la ola de la columna c de n: más amplia cuanto más a la derecha, y se mueve con el reloj
const olaDelLogo = (c, n) => (0.4 + 1.6 * c / n) * Math.sin(c / n * 9.4 - RELOJ * 4);
// una parte del logo centrada en cx; y es el borde de arriba del logo entero
function pintaParteDelLogo(p, cx, y) {
  const im = p.img, n = p.ancho, h = Math.round(n * im.height / im.width), x0 = Math.round(cx - n / 2), y0 = y + p.y - 7;
  if (!p.ola) { lx.drawImage(im, x0, y0, n, h); return; }
  const sw = im.width / n;
  for (let c = 0; c < n; c++) lx.drawImage(im, c * sw, 0, sw, im.height, x0 + c, y0 + olaDelLogo(c, n), 1.02, h);
}
// dibuja el logo centrado en cx con su borde de arriba en y
function pintaLogo(cx, y) {
  cargaLogo();
  if (!LOGO.listo) return;
  for (const p of LOGO.partes) pintaParteDelLogo(p, cx, y);
}
