// Fans of Panic · Entrada: el dedo y el teclado. En el nivel se juega DESLIZANDO: arrastra hacia donde quieres que vaya el cúter
// (sin levantar el dedo se encadenan giros) y un toque sin arrastrar lo para. Fuera del nivel, un toque pulsa los botones de la pantalla.
'use strict';

const DESLIZ_MIN = 14;
const DEDO = { x: 0, y: 0, ox: 0, oy: 0, activo: false, movido: false, mando: false };

function dedoBaja(x, y) {
  DEDO.x = DEDO.ox = x; DEDO.y = DEDO.oy = y; DEDO.activo = true; DEDO.movido = false; DEDO.mando = false;
  if (JUEGO.modo !== 'juego' || OPC.abierto) return;
  if (y < TAB.y0) return;   // lo de arriba del panel es el marcador (la pausa)
  DEDO.mando = true;
}

function dedoMueve(x, y) {
  if (!DEDO.activo) return;
  if (Math.hypot(x - DEDO.ox, y - DEDO.oy) > 8) DEDO.movido = true;
  if (!DEDO.mando || JUEGO.modo !== 'juego') return;
  const dx = x - DEDO.x, dy = y - DEDO.y;
  if (Math.abs(dx) < DESLIZ_MIN && Math.abs(dy) < DESLIZ_MIN) return;
  pideDir(espeja(Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)]));
  DEDO.x = x; DEDO.y = y;
}

function dedoSube(x, y) {
  if (!DEDO.activo) return;
  DEDO.activo = false;
  if (DEDO.mando) { if (!DEDO.movido) paraCursor(); return; }
  if (!DEDO.movido) toque(x, y);
}

function toque(x, y) {
  const J = JUEGO;
  if (OPC.abierto) { toqueOpciones(x, y); return; }
  if (J.modo === 'fin' && J.tFin < 0.6) return;   // que no se pulse sin querer al morir
  toqueUI(x, y);
}

const TECLAS = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0] };

// Escape o P: pausa, cerrar las opciones o atrás
function teclaEscape() {
  if (OPC.abierto) cierraOpciones();
  else if (JUEGO.modo === 'juego' || JUEGO.modo === 'menu') abreOpciones();
  else if (UI.atras) UI.atras();
}

// Espacio o Enter: parar el cúter en el nivel, o el botón principal de la pantalla
function teclaEnter() {
  if (JUEGO.modo === 'juego') { paraCursor(); return; }
  if (UI.enter && !(JUEGO.modo === 'fin' && JUEGO.tFin < 0.6)) { SONIDO.boton(); UI.enter(); }
}

window.addEventListener('keydown', e => {
  const d = TECLAS[e.key];
  audioInit();
  if (e.key === 'Escape' || e.key === 'p') { e.preventDefault(); teclaEscape(); return; }
  if (OPC.abierto) { if (e.key === 'Enter') { e.preventDefault(); cierraOpciones(); } return; }
  if (d && JUEGO.modo === 'juego') { e.preventDefault(); pideDir(espeja(d)); return; }
  if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); teclaEnter(); return; }
  if (e.key === 'Backspace' && UI.atras) { e.preventDefault(); UI.atras(); }
});

// si te vas de la app, el nivel se pausa solo
document.addEventListener('visibilitychange', () => { if (document.hidden && JUEGO.modo === 'juego' && !OPC.abierto) abreOpciones(); });
