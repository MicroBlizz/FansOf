// Fans of Snakes · Frenesí: la barra se carga rozando tu propia cola (¡Uy!) y, menos, comiendo. Llena, explota:
// FRENESI_SEG segundos de neón, música acelerada, manzanas doradas que valen x10 y la Demolición: cruzar tu propio
// cuerpo ya no mata, lo corta, y cada casilla cortada es una moneda.
'use strict';

const FRENESI_SEG = 10;        // cuánto dura
const CARGA_UY = 0.1;          // cuánto llena cada roce
const CARGA_MANZANA = 0.07;    // y cada manzana (más si vas de racha: js/partida.js)
const MULT_FRENESI = 10;       // las manzanas valen esto durante el Frenesí
const PUNTOS_CORTE = 5;        // puntos por casilla cortada (además de la moneda), por el multiplicador

const esFrenesi = () => JUEGO.frenesiT > 0;

function cargaFrenesi(cuanto) {
  if (esFrenesi()) return;
  JUEGO.frenesi = Math.min(1, JUEGO.frenesi + cuanto * factorCarga());
  if (JUEGO.frenesi >= 1) activaFrenesi();
}

function activaFrenesi() {
  JUEGO.frenesiT = JUEGO.frenesiDur = segundosFrenesi(); JUEGO.frenesi = 0; JUEGO.mult = MULT_FRENESI;
  JUEGO.frenesis++; mision('frenesi', 1); ataqueFrenesi(); tutoAviso('frenesi', true);
  for (let i = 0; i < 3; i++) { const p = casillaLibre(); if (p) JUEGO.manzanas.push(p); }   // lluvia de manzanas doradas
  const h = JUEGO.serp[0]; chispa(cx(h[0]), cy(h[1]), '#ffd54a', 24, 110); tiembla(3, 0.35);
  numero(100, TAB.y0 + 60, tr('¡FRENESÍ!'), '#ffd54a', 18);
  SONIDO.frenesi();
}

function avanzaFrenesi(dt) {
  if (!esFrenesi()) return;
  JUEGO.frenesiT -= dt;
  if (JUEGO.frenesiT <= 0) {
    JUEGO.frenesiT = 0; JUEGO.mult = 1;
    if (nivel('tormenta')) JUEGO.frenesi = 0.5;   // la fusión Tormenta
    while (JUEGO.manzanas.length > manzanasEnTablero()) JUEGO.manzanas.pop();   // se quedan las de siempre
    SONIDO.fin_frenesi();
  }
}

// la cabeza ha pisado la casilla idx de su propio cuerpo durante el Frenesí: lo que hay desde ahí hasta la cola, fuera
function demolicion(idx) {
  const S = JUEGO.serp, cortadas = S.splice(idx);   // quita idx..final (idx >= 1 siempre)
  const n = cortadas.length;
  for (const s of cortadas) { monedaVuela(cx(s[0]), cy(s[1])); chispa(cx(s[0]), cy(s[1]), '#ff8a3d', 3, 50); }
  JUEGO.monedasPartida += n; JUEGO.cortes++; mision('trozos', n); ataqueCorte(n);
  const pts = Math.round(n * PUNTOS_CORTE * multPuntos()); JUEGO.puntos += pts;
  const h = S[0]; numero(cx(h[0]), cy(h[1]) - 8, '+' + pts, '#ffd54a', 11);
  numero(cx(h[0]), cy(h[1]) + 6, tr('¡{n} monedas!', { n }), '#fff2b0', 8);
  tiembla(2 + Math.min(4, n * 0.2), 0.25); SONIDO.corte(n);
}

// la barra del marcador (la pinta js/pantalla.js con esto)
function pintaBarraFrenesi(x, y, w, h, retro) {
  if (retro) {
    G.fillStyle = RETRO.tinta; G.fillRect(x, y, w, h);
    G.fillStyle = RETRO.fondo; G.fillRect(x + 1, y + 1, w - 2, h - 2);
    G.fillStyle = RETRO.tinta; G.fillRect(x + 1, y + 1, (w - 2) * JUEGO.frenesi, h - 2);
    return;
  }
  caja(x, y, w, h, 2, '#17331f', '#06110a', 1);
  if (esFrenesi()) {   // en Frenesí la barra es la cuenta atrás, en arcoíris
    const k = JUEGO.frenesiT / (JUEGO.frenesiDur || FRENESI_SEG);
    G.fillStyle = arcoiris(0, JUEGO.t * 2, 60); G.fillRect(x + 1, y + 1, (w - 2) * k, h - 2);
  } else {
    const k = JUEGO.frenesi, lleno = k > 0.8 && Math.sin(JUEGO.t * 12) > 0;
    G.fillStyle = lleno ? '#ffd54a' : k > 0.5 ? '#9cff6b' : '#3ddc84'; G.fillRect(x + 1, y + 1, (w - 2) * k, h - 2);
  }
  G.strokeStyle = '#06110a'; G.lineWidth = 0.8; G.beginPath();   // las rayitas
  for (let i = 1; i < 10; i++) { G.moveTo(x + (w * i) / 10, y); G.lineTo(x + (w * i) / 10, y + h); }
  G.stroke();
}
