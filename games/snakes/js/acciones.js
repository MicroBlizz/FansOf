// Fans of Snakes · Las cartas de ACCIÓN, las que se usan con el dedo (o solas), y sus fusiones:
//   · NITRO: mientras mantienes el dedo pulsado (con Palanca, un segundo dedo; en el PC, Mayúsculas), el doble de rápido y el
//     doble de puntos. Con COHETE (Nitro + Hyper-Dash), cada casilla con nitro carga el Frenesí.
//   · SALTO: tocar dos veces rápido (en el PC, Espacio) salta dos casillas de golpe: lo de en medio no cuenta (ni tu cola, ni un
//     muro, ni una manzana). Gasta un uso; con NINJA (Salto + Tiempo bala) no gasta, pero se recarga en 3 s.
//   · TIEMPO BALA: si el próximo paso te mata, el tiempo va a un 30 % durante 1,2 s para que te dé tiempo a girar. Gasta un uso.
//   · DIETA: cada 4 manzanas tu cola pierde 2 trozos por nivel (nunca menos de 4). Con MUDA (Dieta + Fantasma), morderte la cola
//     no te mata: se corta por ahí.
'use strict';

const NITRO_PULSA = 0.28;        // segundos con el dedo quieto para que cuente como «mantener»
const BALA_SEG = 1.2, BALA_LENTO = 0.3, NINJA_SEG = 3;
let TECLA_NITRO = false;

// ¿está pidiendo nitro?
function nitroPulsado() {
  if (TECLA_NITRO) return true;
  if (!DEDO.activo || !DEDO.mando) return false;
  if (SAVE.control === 'palanca') return DEDOS.size >= 2;
  return (performance.now() - DEDO.t0) / 1000 > NITRO_PULSA;
}

// lo que pasa cada fotograma; devuelve el tiempo de juego (más lento con el Tiempo bala)
function avanzaAcciones(dt) {
  const J = JUEGO;
  const antes = J.nitro;
  J.nitro = nivel('nitro') > 0 && nitroPulsado();
  if (J.nitro && !antes) { SONIDO.nitro(); }
  if (J.ninjaT > 0) J.ninjaT -= dt;
  if (J.saltoT > 0) J.saltoT -= dt;
  if (J.balaT > 0) { J.balaT -= dt; return dt * BALA_LENTO; }
  if (nivel('bala') > 0 && J.acum > pasoActual() * 0.45 && mortal(siguienteCasilla())) {
    J.balaT = BALA_SEG; J.cartas.bala--;
    const h = J.serp[0]; numero(cx(h[0]), cy(h[1]) - 10, tr('¡TIEMPO BALA!'), '#b2ebf2', 10); SONIDO.bala();
    return dt * BALA_LENTO;
  }
  return dt;
}

// la casilla a la que va a ir la cabeza en el próximo paso (con el giro pedido, si hay)
function siguienteCasilla() {
  const J = JUEGO, h = J.serp[0], d = J.pend.length ? J.pend[0] : J.dir, k = J.saltoPend && puedeSaltar() ? 2 : 1;
  return [h[0] + d[0] * k, h[1] + d[1] * k];
}
// ¿esa casilla mata? (contando con Portal, Escudo, Fantasma, Muda y el Frenesí)
function mortal(n) {
  const J = JUEGO;
  if (n[0] < 0 || n[0] >= COLS || n[1] < 0 || n[1] >= ROWS) return !usaPortal() && !nivel('escudo');
  if (esMuro(n)) return !nivel('escudo');
  const i = J.serp.findIndex(s => mismaCasilla(s, n));
  return i >= 0 && i < J.serp.length - 1 && !esFrenesi() && !nivel('muda') && !nivel('fantasma');
}

// ---------- el salto ----------
const puedeSaltar = () => nivel('ninja') ? JUEGO.ninjaT <= 0 : nivel('salto') > 0;
function pideSalto() { if (JUEGO.modo === 'juego' && puedeSaltar()) JUEGO.saltoPend = true; }
// lo llama mueve(): cuántas casillas avanza este paso (y gasta el salto)
function largoDelPaso() {
  const J = JUEGO;
  if (!J.saltoPend) return 1;
  J.saltoPend = false;
  if (!puedeSaltar()) return 1;
  if (nivel('ninja')) J.ninjaT = NINJA_SEG; else J.cartas.salto--;
  J.saltoT = 0.3;
  const h = J.serp[0]; chispa(cx(h[0]), cy(h[1]), '#40c4ff', 10, 70); SONIDO.salto();
  return 2;
}

// ---------- la dieta y la muda ----------
function aplicaDieta() {
  const J = JUEGO, n = nivel('dieta'); if (!n || J.comidas % 4 !== 0) return;
  for (let i = 0; i < n * 2 && J.serp.length > 4; i++) { const s = J.serp.pop(); chispa(cx(s[0]), cy(s[1]), '#c5e1a5', 3, 40); }
}
function cortaMuda(idx) {
  const cortadas = JUEGO.serp.splice(idx);
  for (const s of cortadas) chispa(cx(s[0]), cy(s[1]), '#aed581', 3, 50);
  const h = JUEGO.serp[0]; numero(cx(h[0]), cy(h[1]) - 8, tr('¡MUDA!'), '#aed581', 9); SONIDO.corte(cortadas.length);
}

// lo que se ve: la estela del nitro y el tinte azul del Tiempo bala
function pintaAcciones(W, H) {
  const J = JUEGO;
  if (J.nitro && J.modo === 'juego') {
    const c = J.serp[J.serp.length - 1];
    if (Math.random() < 0.7) PART.push({ x: cx(c[0]) + (Math.random() - 0.5) * 4, y: cy(c[1]) + (Math.random() - 0.5) * 4, vx: (Math.random() - 0.5) * 20, vy: (Math.random() - 0.5) * 20, t: 0, dur: 0.35, r: 2.4, col: Math.random() < 0.5 ? '#ff3d71' : '#ffd54a', g: 0, forma: 'punto' });
  }
  if (J.balaT > 0) {
    const a = Math.min(1, J.balaT * 3, (BALA_SEG - J.balaT) * 6) * 0.22;
    G.fillStyle = `rgba(120,220,255,${a})`; G.fillRect(TAB.x0, TAB.y0, TAB.w, TAB.h);
  }
  if (J.saltoT > 0) { const h = J.serp[0]; G.globalAlpha = J.saltoT / 0.3; circulo(cx(h[0]), cy(h[1]), TAB.c * (1.4 - J.saltoT), null, '#40c4ff', 2); G.globalAlpha = 1; }
}
