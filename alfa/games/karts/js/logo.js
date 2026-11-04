// Fans of Karts · EL LOGO del título: la imagen del logo (img/logo.png) ondeando como una bandera, columna a columna: la ola crece hacia la derecha,
// que es el borde libre. Es la única imagen suelta de la pantalla; hasta que carga no se dibuja nada (LOGO.listo).
'use strict';

const LOGO = { img: null, listo: false, ancho: 156 };
function cargaLogo() {
  if (LOGO.img) return;
  LOGO.img = new Image();
  LOGO.img.onload = () => { LOGO.listo = true; };
  LOGO.img.src = 'img/logo.png';
}
// la ola de la columna c de n: más amplia cuanto más a la derecha, y se mueve con el reloj
const olaDelLogo = (c, n) => (0.4 + 1.6 * c / n) * Math.sin(c / n * 9.4 - RELOJ * 4);
// dibuja el logo centrado en cx con su borde de arriba en y
function pintaLogo(cx, y) {
  cargaLogo();
  if (!LOGO.listo) return;
  const im = LOGO.img, n = LOGO.ancho, h = Math.round(n * im.height / im.width), x0 = Math.round(cx - n / 2), sw = im.width / n;
  for (let c = 0; c < n; c++) lx.drawImage(im, c * sw, 0, sw, im.height, x0 + c, y + olaDelLogo(c, n), 1.02, h);
}
