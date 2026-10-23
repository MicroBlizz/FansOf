// Fans of Snakes · Entrada: el dedo según el control elegido en Opciones (SAVE.control) y el teclado (flechas o WASD).
//   · Toques: tocar arriba, abajo, a la izquierda o a la derecha de la pantalla (las diagonales desde el centro del
//     tablero parten la pantalla en cuatro zonas). Responde al bajar el dedo.
//   · Palanca: la palanca redonda que sale donde pones el dedo (js/palanca.js).
//   · Deslizar: arrastrar el dedo hacia donde quieres girar; sin levantarlo se encadenan giros.
// El Espejo (js/locuras.js) da la vuelta a izquierda y derecha antes de pedir el giro.
'use strict';

const DESLIZ_MIN = 10;
const DEDO = { x: 0, y: 0, ox: 0, oy: 0, activo: false, movido: false, mando: false, t0: 0, ultima: 0 };   // t0: cuándo bajó (nitro); ultima: el toque anterior (salto)
const TOQUE = { dir: null, t: 0 };   // el último toque, para el destello de la zona

// la zona que toca el dedo con el control Toques
function zonaToque(x, y) {
  const dx = (x - (TAB.x0 + TAB.w / 2)) / TAB.w, dy = (y - (TAB.y0 + TAB.h / 2)) / TAB.h;
  return Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy) || 1];
}

function dedoBaja(x, y) {
  DEDO.x = DEDO.ox = x; DEDO.y = DEDO.oy = y; DEDO.activo = true; DEDO.movido = false; DEDO.mando = false;
  if (JUEGO.modo !== 'juego' || OPC.abierto || PUBLI.activo || y < TAB.y0) return;   // lo de arriba del tablero es el marcador
  DEDO.mando = true;
  // dos toques seguidos = salto (si tienes la carta). Con Toques, en la misma zona (dos giros rápidos distintos no saltan);
  // con Palanca y Deslizar, dos toques sin arrastrar
  const ahora = performance.now(), zona = SAVE.control === 'toques' ? zonaToque(x, y).join(',') : 'toque';
  if (ahora - DEDO.ultima < 300 && zona === DEDO.ultimaZona && (SAVE.control === 'toques' || DEDO.antesToque)) pideSalto();
  DEDO.ultima = ahora; DEDO.ultimaZona = zona; DEDO.t0 = ahora;
  if (SAVE.control === 'palanca') ponPalanca(x, y);
  else if (SAVE.control === 'toques') { const d = zonaToque(x, y); TOQUE.dir = d; TOQUE.t = 0.25; pideDir(espeja(d)); }
}

function dedoMueve(x, y) {
  if (!DEDO.activo) return;
  if (Math.hypot(x - DEDO.ox, y - DEDO.oy) > 6) DEDO.movido = true;
  if (!DEDO.mando || JUEGO.modo !== 'juego') return;
  if (SAVE.control === 'palanca') { muevePalanca(x, y); return; }
  if (SAVE.control === 'deslizar') {
    const dx = x - DEDO.x, dy = y - DEDO.y;
    if (Math.abs(dx) < DESLIZ_MIN && Math.abs(dy) < DESLIZ_MIN) return;
    pideDir(espeja(Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)]));
    DEDO.x = x; DEDO.y = y;   // se puede encadenar otro giro sin levantar el dedo
  }
}

function dedoSube(x, y) {
  if (!DEDO.activo) return;
  DEDO.activo = false;
  sueltaPalanca();
  DEDO.antesToque = !DEDO.movido;   // para el doble toque del salto
  if (DEDO.mando) return;          // era un giro, no un toque
  if (!DEDO.movido) toque(x, y);   // un toque sin arrastrar
}

// un toque fuera de la partida (o en el marcador): el anuncio de prueba, las Opciones, las cartas o los botones de la pantalla
function toque(x, y) {
  const J = JUEGO;
  if (PUBLI.activo) { toqueAnuncio(); return; }
  if (OPC.abierto) { toqueOpciones(x, y); return; }
  if (J.modo === 'cartas') { toqueCartas(x, y); return; }
  if (J.modo === 'fin' && J.tFin < 0.6) return;   // que no se pulse sin querer al morir
  toqueUI(x, y);
}

window.addEventListener('keydown', e => {
  const T = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0] };
  const d = T[e.key];
  audioInit();
  if (e.key === 'Escape' || e.key === 'p') { e.preventDefault(); if (OPC.abierto) cierraOpciones(); else if (JUEGO.modo === 'juego' || JUEGO.modo === 'menu') abreOpciones(); else if (UI.atras) UI.atras(); return; }
  if (OPC.abierto) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cierraOpciones(); } return; }
  if (JUEGO.modo === 'cartas') {
    if (d) e.preventDefault();
    if (['1', '2', '3'].includes(e.key) && JUEGO.tCartas > 0.4) eligeCarta(+e.key - 1);
    return;
  }
  if (d && JUEGO.modo === 'juego') { e.preventDefault(); pideDir(espeja(d)); return; }
  if (e.key === ' ' && JUEGO.modo === 'juego') { e.preventDefault(); pideSalto(); return; }
  if (e.key === 'Shift') { TECLA_NITRO = true; return; }
  if (e.key === ' ' || e.key === 'Enter') {   // el botón principal de la pantalla (lo marca cada pantalla en UI.enter)
    e.preventDefault();
    if (PUBLI.activo) toqueAnuncio(); else if (UI.enter && !(JUEGO.modo === 'fin' && JUEGO.tFin < 0.6)) { SONIDO.boton(); UI.enter(); }
  }
  if (e.key === 'Backspace' && UI.atras) { e.preventDefault(); UI.atras(); }
});

window.addEventListener('keyup', e => { if (e.key === 'Shift') TECLA_NITRO = false; });

// si te vas de la app (otra pestaña, una llamada, bloqueas el móvil), la partida se pausa sola con las Opciones abiertas
document.addEventListener('visibilitychange', () => { if (document.hidden && JUEGO.modo === 'juego' && !OPC.abierto) abreOpciones(); });
