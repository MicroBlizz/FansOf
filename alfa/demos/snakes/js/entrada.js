// Fans of Snakes · Entrada: el dedo (deslizar para girar, tocar para empezar) y el teclado (flechas o WASD) en el PC.
// El Espejo (js/locuras.js) da la vuelta a izquierda y derecha antes de pedir el giro.
'use strict';

const DESLIZ_MIN = 10;   // cuánto hay que arrastrar (en el mundo) para que cuente como deslizar
const DEDO = { x: 0, y: 0, activo: false, deslizo: false };

function dedoBaja(x, y) { DEDO.x = x; DEDO.y = y; DEDO.activo = true; DEDO.deslizo = false; }

function dedoMueve(x, y) {
  if (!DEDO.activo || DEDO.deslizo) return;
  const dx = x - DEDO.x, dy = y - DEDO.y;
  if (Math.abs(dx) < DESLIZ_MIN && Math.abs(dy) < DESLIZ_MIN) return;
  DEDO.deslizo = true;
  const d = Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)];
  pideDir(espeja(d));
  DEDO.x = x; DEDO.y = y; DEDO.deslizo = false;   // se puede encadenar otro giro sin levantar el dedo
}

function dedoSube(x, y) {
  if (!DEDO.activo) return;
  DEDO.activo = false;
  if (DEDO.deslizo) return;
  toque(x, y);   // un toque sin arrastrar
}

// un toque: en la portada y al acabar, empieza; en la partida, los botones del marcador
function toque(x, y) {
  const J = JUEGO;
  if (J.modo === 'menu') { SONIDO.boton(); nuevaPartida(); return; }
  if (J.modo === 'fin') { if (J.tFin > 0.8) { SONIDO.boton(); nuevaPartida(); } return; }
  if (dentro(BOTONES.sonido, x, y)) { SAVE.musica = SAVE.musica ? 0 : 1; SAVE.efectos = SAVE.musica; guarda(); applyVolume(); SONIDO.boton(); }
}

window.addEventListener('keydown', e => {
  const T = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0] };
  const d = T[e.key];
  if (d) { audioInit(); e.preventDefault(); if (JUEGO.modo === 'juego') pideDir(espeja(d)); else toque(0, 0); return; }
  if (e.key === ' ' || e.key === 'Enter') { audioInit(); e.preventDefault(); toque(0, 0); }
});
