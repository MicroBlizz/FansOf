// Fans of Snakes · Locuras: los ítems locos («?») que salen en el tablero de vez en cuando. Al cogerlos la partida sigue
// tal cual (misma serpiente, misma casilla, mismos puntos), pero durante unos segundos el juego se ve o se controla
// de otra manera. Una locura nueva se añade a LOCURAS y, si pinta distinto, se consulta con locuraActiva('nombre').
'use strict';

const LOCURAS = {
  retro:  { dur: 8, aviso: 'MODO RETRO', color: '#b9c9a0' },   // blanco y negro de píxeles gordos, como el móvil de 1999
  espejo: { dur: 6, aviso: 'ESPEJO', color: '#7fd7ff' },       // izquierda es derecha y derecha es izquierda
};
const RETRO = { fondo: '#8a9a72', tinta: '#1a2214' };   // los dos únicos colores del modo retro

const ITEM_CADA = 11;        // segundos entre un ítem y el siguiente (si no hay ninguno en el tablero)
const ITEM_VIVE = 9;         // cuánto espera un ítem antes de desaparecer

const LOCURA = { tipo: null, t: 0, dur: 0, proximo: ITEM_CADA };

const locuraActiva = tipo => LOCURA.tipo === tipo && LOCURA.t > 0;
const esRetro = () => locuraActiva('retro');

// cada fotograma: cuenta atrás de la locura en marcha y aparición de ítems nuevos
function avanzaLocuras(dt) {
  if (LOCURA.t > 0) { LOCURA.t -= dt; if (LOCURA.t <= 0) { LOCURA.t = 0; LOCURA.tipo = null; SONIDO.locura_fin(); } }
  for (let i = JUEGO.items.length - 1; i >= 0; i--) { const it = JUEGO.items[i]; it.vive -= dt; if (it.vive <= 0) JUEGO.items.splice(i, 1); }
  if (JUEGO.items.length === 0 && LOCURA.t <= 0) {
    LOCURA.proximo -= dt;
    if (LOCURA.proximo <= 0) {
      const p = casillaLibre(); if (!p) return;
      const tipos = Object.keys(LOCURAS), tipo = tipos[Math.floor(Math.random() * tipos.length)];
      JUEGO.items.push({ c: p[0], r: p[1], tipo, vive: ITEM_VIVE });
      LOCURA.proximo = ITEM_CADA;
    }
  }
}

// la cabeza ha pisado el ítem i
function cogeLocura(i) {
  const it = JUEGO.items.splice(i, 1)[0], L = LOCURAS[it.tipo];
  LOCURA.tipo = it.tipo; LOCURA.t = L.dur; LOCURA.dur = L.dur;
  JUEGO.locuras++;
  numero(100, TAB.y0 + 60, tr(L.aviso), L.color, 16);
  chispa(cx(it.c), cy(it.r), L.color, 16, 90); tiembla(2, 0.25);
  SONIDO.locura(it.tipo);
}

// el Espejo cambia izquierda por derecha en lo que pide el dedo (js/entrada.js lo pasa por aquí)
const espeja = d => locuraActiva('espejo') ? [-d[0], d[1]] : d;

// la franja de abajo con la locura en marcha y su cuenta atrás
function pintaLocura(W, H) {
  if (LOCURA.t <= 0) return;
  const L = LOCURAS[LOCURA.tipo], retro = esRetro(), y = H - 14, w = 120, x = (W - w) / 2, k = LOCURA.t / LOCURA.dur;
  if (retro) {
    letraMono(tr(L.aviso) + ' ' + Math.ceil(LOCURA.t), W / 2, y - 7, 7, RETRO.tinta);
    G.fillStyle = RETRO.tinta; G.fillRect(x, y, w, 4); G.fillStyle = RETRO.fondo; G.fillRect(x + 1, y + 1, w - 2, 2); G.fillStyle = RETRO.tinta; G.fillRect(x + 1, y + 1, (w - 2) * k, 2);
    return;
  }
  letra(tr(L.aviso), W / 2, y - 7, 8, L.color, 'center', '#06110a', 2.5);
  caja(x, y, w, 4, 2, '#06110a', null); G.fillStyle = L.color; G.fillRect(x + 1, y + 1, (w - 2) * k, 2);
}

function reiniciaLocuras() { LOCURA.tipo = null; LOCURA.t = 0; LOCURA.proximo = ITEM_CADA; }
