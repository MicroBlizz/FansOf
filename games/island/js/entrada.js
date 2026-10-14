// Fans of Island · ENTRADA: lo que pulsa cada jugador en este fotograma (teclado y mandos táctiles), ya resumido en izquierda, derecha,
// salto y acción. «Pulsa» vale solo el fotograma en que se aprieta. Jugador 1: flechas + espacio (o K) y L (o Mayús). Jugador 2: WASD + F.
// Si solo juega una persona, los dos juegos de teclas mueven al jugador 1.
'use strict';
const isEntradaNueva = () => ({ izq: 0, der: 0, salto: 0, accion: 0, saltoPulsa: 0, accionPulsa: 0 });
const IS_IN = [isEntradaNueva(), isEntradaNueva()];
const IS_TECLAS = {
  ArrowLeft: [0, 'izq'], ArrowRight: [0, 'der'], ArrowUp: [0, 'salto'], Space: [0, 'salto'], KeyK: [0, 'salto'], KeyL: [0, 'accion'], ShiftLeft: [0, 'accion'], ShiftRight: [0, 'accion'], ArrowDown: [0, 'accion'],
  KeyA: [1, 'izq'], KeyD: [1, 'der'], KeyW: [1, 'salto'], KeyF: [1, 'accion'], KeyS: [1, 'accion'],
};
const IS_ENTRADA = { humanos: 1, pausa: null };   // pausa: qué hacer con Escape o P
function isEntradaDestino(j) { return IS_ENTRADA.humanos === 1 ? 0 : j; }
function isEntradaPon(j, k, v) {
  const e = IS_IN[isEntradaDestino(j)];
  if (v && !e[k] && (k === 'salto' || k === 'accion')) e[k + 'Pulsa'] = 1;
  e[k] = v ? 1 : 0;
}
function isEntradaTecla(ev, abajo) {
  if (ev.target && /INPUT|TEXTAREA|SELECT/.test(ev.target.tagName)) return;
  if (abajo && !ev.repeat && (ev.code === 'Escape' || ev.code === 'KeyP') && IS_ENTRADA.pausa) { IS_ENTRADA.pausa(); ev.preventDefault(); return; }
  const t = IS_TECLAS[ev.code]; if (!t) return;
  if (!ev.repeat || !abajo) isEntradaPon(t[0], t[1], abajo);
  ev.preventDefault();
}
function isEntradaSuelta() { for (const e of IS_IN) { e.izq = e.der = e.salto = e.accion = e.saltoPulsa = e.accionPulsa = 0; } }
function isEntradaFin() { for (const e of IS_IN) e.saltoPulsa = e.accionPulsa = 0; }   // al acabar el fotograma, las pulsaciones ya se han visto
function isEntradaArranca() {
  window.addEventListener('keydown', e => isEntradaTecla(e, true));
  window.addEventListener('keyup', e => isEntradaTecla(e, false));
  window.addEventListener('blur', isEntradaSuelta);
  for (const b of document.querySelectorAll('#is-mandos button')) {   // mandos táctiles: siempre del jugador 1
    const k = b.dataset.m, pon = v => e => { e.preventDefault(); isEntradaPon(0, k, v); };
    b.addEventListener('pointerdown', pon(1)); b.addEventListener('pointerup', pon(0)); b.addEventListener('pointercancel', pon(0)); b.addEventListener('pointerleave', pon(0));
    b.addEventListener('contextmenu', e => e.preventDefault());
  }
}
