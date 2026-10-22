// Fans of Snakes · Palanca virtual: al poner el dedo en cualquier parte de la pantalla sale una palanca redonda justo debajo.
// Al arrastrar, la bolita sigue al dedo y la serpiente gira hacia donde apunta (arriba, abajo, izquierda o derecha, el eje
// que más pese). Si el dedo se aleja más que el borde, la palanca lo sigue: así se puede encadenar giros sin levantarlo.
// El Espejo (js/locuras.js) da la vuelta a izquierda y derecha.
'use strict';

const PALANCA_R = 26;        // radio del aro (en el mundo de 200 de ancho)
const PALANCA_MUERTA = 7;    // lo que hay que mover el dedo antes de que cuente como giro
const PALANCA = { on: false, x0: 0, y0: 0, x: 0, y: 0, dir: null };

function ponPalanca(x, y) { PALANCA.on = true; PALANCA.x0 = x; PALANCA.y0 = y; PALANCA.x = x; PALANCA.y = y; PALANCA.dir = null; }

function muevePalanca(x, y) {
  if (!PALANCA.on) return;
  let dx = x - PALANCA.x0, dy = y - PALANCA.y0;
  const d = Math.hypot(dx, dy);
  if (d > PALANCA_R) {   // el aro se arrastra detrás del dedo
    PALANCA.x0 = x - dx / d * PALANCA_R; PALANCA.y0 = y - dy / d * PALANCA_R;
    dx = x - PALANCA.x0; dy = y - PALANCA.y0;
  }
  PALANCA.x = x; PALANCA.y = y;
  if (Math.hypot(dx, dy) < PALANCA_MUERTA) return;
  const dir = Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)];
  if (PALANCA.dir && PALANCA.dir[0] === dir[0] && PALANCA.dir[1] === dir[1]) return;
  PALANCA.dir = dir;
  pideDir(espeja(dir));
}

function sueltaPalanca() { PALANCA.on = false; PALANCA.dir = null; }

function pintaPalanca(retro) {
  if (!PALANCA.on) return;
  const { x0, y0 } = PALANCA, dx = PALANCA.x - x0, dy = PALANCA.y - y0, d = Math.hypot(dx, dy), k = d > PALANCA_R ? PALANCA_R / d : 1;
  const bx = x0 + dx * k, by = y0 + dy * k;
  if (retro) {
    G.strokeStyle = RETRO.tinta; G.lineWidth = 2; G.beginPath(); G.arc(x0, y0, PALANCA_R, 0, Math.PI * 2); G.stroke();
    G.fillStyle = RETRO.tinta; G.fillRect(bx - 7, by - 7, 14, 14);
    return;
  }
  G.globalAlpha = 0.35; circulo(x0, y0, PALANCA_R, '#06110a', null); G.globalAlpha = 1;
  circulo(x0, y0, PALANCA_R, null, '#9cff6b', 2);
  // las cuatro marcas de dirección; la que manda, encendida
  for (const [mx, my] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
    const on = PALANCA.dir && PALANCA.dir[0] === mx && PALANCA.dir[1] === my;
    circulo(x0 + mx * (PALANCA_R - 5), y0 + my * (PALANCA_R - 5), on ? 2.6 : 1.6, on ? '#ffd54a' : '#9cff6b', null);
  }
  circulo(bx, by, 11, '#3ddc84', '#06110a', 2);
  circulo(bx - 3, by - 3, 3.5, '#9cff6b', null);
}
