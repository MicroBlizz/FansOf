// Fans of Snakes · Tutorial: en la primera partida de Infinito salen consejos cortos en el momento justo (al empezar, la primera
// racha, el primer «?» y el primer Frenesí), un consejo cada vez y cada uno una sola vez. Las cartas ya se explican solas en su
// ventana. Después de esa primera partida no vuelve a salir (SAVE.tutorial).
'use strict';

const TUTO = { activo: false, visto: {}, txt: '', t: 0 };
const CONSEJOS = {
  inicio: 'Come manzanas para crecer. ¡No choques con nada!',
  racha: '¡Racha! Comer seguido llena la barra de Frenesí',
  item: 'Ese «?» es una locura: cógelo si te atreves',
  frenesi: '¡FRENESÍ! Ahora cruzar tu cola la corta: cada trozo es una moneda',
};

function empiezaTutorial() { TUTO.activo = !SAVE.tutorial && PARTIDA.tipo === 'infinito'; TUTO.visto = {}; TUTO.t = 0; TUTO.txt = ''; if (TUTO.activo) tutoAviso('inicio', true); }
function tutoAviso(clave, si) {
  if (!TUTO.activo || !si || TUTO.visto[clave]) return;
  TUTO.visto[clave] = true; TUTO.txt = CONSEJOS[clave]; TUTO.t = 4.5;
}
function terminaTutorial() { if (TUTO.activo) { SAVE.tutorial = 1; TUTO.activo = false; TUTO.t = 0; } }

function pintaTutorial(W, dt) {
  if (TUTO.t <= 0 || JUEGO.modo !== 'juego') return;
  TUTO.t -= dt;
  const a = Math.min(1, TUTO.t * 2, (4.5 - TUTO.t) * 4), y = TAB.y0 + 8;
  G.save(); G.globalAlpha = a;
  G.font = '800 8px "Baloo 2", system-ui, sans-serif';
  const ls = lineas(tr(TUTO.txt), W - 50), h = 8 + ls.length * 10;
  caja(16, y, W - 32, h, 6, '#fff8d6', '#06110a', 1.5);
  ls.forEach((l, i) => letra(l, W / 2, y + 9 + i * 10, 8, '#3a2a06', 'center', null, 0));
  G.restore();
}
