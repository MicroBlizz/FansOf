// Fans of Snakes · Partida: la serpiente avanza una casilla cada «paso» de reloj. Comer alarga y da puntos; pasar rozando
// tu propio cuerpo (¡Uy!) carga el Frenesí; chocar con la pared o contigo mismo acaba la partida, salvo en Frenesí, donde
// cruzarte es la Demolición (js/frenesi.js). Los ítems «?» son las locuras (js/locuras.js).
'use strict';

const PASO_INICIAL = 0.32;     // segundos por casilla al empezar (despacito)
const PASO_MINIMO = 0.09;      // lo más deprisa que va (se llega hacia las 35 manzanas)
const PASO_POR_MANZANA = 0.0065;   // cuánto acelera cada manzana comida
const LARGO_INICIAL = 4;
const PUNTOS_MANZANA = 10;

const JUEGO = {
  modo: 'menu',       // 'menu' | 'juego' | 'fin'
  serp: [],           // casillas [c, r], la cabeza la primera
  dir: [1, 0],        // hacia dónde va
  pend: [],           // giros pedidos por el dedo, en cola (máximo 2)
  manzanas: [], items: [],
  puntos: 0, mult: 1, acum: 0, t: 0, tFin: 0, uyT: 0,
  frenesi: 0, frenesiT: 0, frenesis: 0, monedasPartida: 0, cortes: 0, locuras: 0, comidas: 0,
  fin: { motivo: '', record: false },
};

function nuevaPartida() {
  const J = JUEGO, c0 = Math.floor(COLS / 2) - 2, r0 = Math.floor(ROWS / 2);
  J.serp = []; for (let i = 0; i < LARGO_INICIAL; i++) J.serp.push([c0 - i, r0]);
  J.dir = [1, 0]; J.pend = []; J.manzanas = []; J.items = [];
  J.puntos = 0; J.mult = 1; J.acum = 0; J.t = 0; J.tFin = 0; J.uyT = 0;
  J.frenesi = 0; J.frenesiT = 0; J.frenesis = 0; J.monedasPartida = 0; J.cortes = 0; J.locuras = 0; J.comidas = 0;
  reiniciaLocuras();
  J.manzanas.push(casillaLibre());
  J.modo = 'juego';
}

// el dedo pide un giro: no vale darse la vuelta ni repetir el último pedido
function pideDir(d) {
  const J = JUEGO; if (J.modo !== 'juego') return;
  const ult = J.pend.length ? J.pend[J.pend.length - 1] : J.dir;
  if (d[0] === -ult[0] && d[1] === -ult[1]) return;
  if (d[0] === ult[0] && d[1] === ult[1]) return;
  if (J.pend.length < 2) { J.pend.push(d); SONIDO.gira(); }
}

const pasoActual = () => Math.max(PASO_MINIMO, PASO_INICIAL - JUEGO.comidas * PASO_POR_MANZANA) * (esFrenesi() ? 0.85 : 1);

function avanzaJuego(dt) {
  const J = JUEGO; J.t += dt;
  avanzaEfectos(dt);
  if (J.modo === 'fin') { J.tFin += dt; return; }
  if (J.modo !== 'juego') return;
  if (J.uyT > 0) J.uyT -= dt;
  avanzaFrenesi(dt); avanzaLocuras(dt);
  J.acum += dt;
  while (J.acum >= pasoActual() && J.modo === 'juego') { J.acum -= pasoActual(); mueve(); }
}

// un paso de reloj: la cabeza avanza una casilla
function mueve() {
  const J = JUEGO, S = J.serp;
  if (J.pend.length) J.dir = J.pend.shift();
  const h = S[0], n = [h[0] + J.dir[0], h[1] + J.dir[1]];
  if (n[0] < 0 || n[0] >= COLS || n[1] < 0 || n[1] >= ROWS) { muere('pared'); return; }
  const iCuerpo = S.findIndex(s => mismaCasilla(s, n));
  const iMan = J.manzanas.findIndex(m => mismaCasilla(m, n));
  const come = iMan >= 0;
  // la cola se mueve antes de mirar el choque: pisar la última casilla de la cola es legal (ya no está)
  if (!come) S.pop();
  if (iCuerpo >= 0 && iCuerpo < S.length) {
    if (esFrenesi()) demolicion(iCuerpo); else { muere('cola'); return; }
  }
  S.unshift(n);
  if (come) {
    J.manzanas.splice(iMan, 1); J.comidas++;
    const pts = PUNTOS_MANZANA * J.mult; J.puntos += pts;
    numero(cx(n[0]), cy(n[1]) - 6, '+' + pts, esFrenesi() ? '#ffd54a' : '#fff', esFrenesi() ? 11 : 9);
    chispa(cx(n[0]), cy(n[1]), esFrenesi() ? '#ffd54a' : '#ff4d4d', 8, 70);
    cargaFrenesi(CARGA_MANZANA);
    if (esFrenesi()) SONIDO.come_oro(); else SONIDO.come();
    if (J.manzanas.length === 0) { const p = casillaLibre(); if (p) J.manzanas.push(p); }
  }
  const iItem = J.items.findIndex(it => it.c === n[0] && it.r === n[1]);
  if (iItem >= 0) cogeLocura(iItem);
  compruebaRoce(n);
}

// ¡Uy!: la cabeza pasa pegada a su propio cuerpo (una casilla al lado, no la que acaba de dejar)
function compruebaRoce(n) {
  const J = JUEGO, S = J.serp, atras = S[1];
  let roces = 0;
  for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const v = [n[0] + d[0], n[1] + d[1]];
    if (atras && mismaCasilla(v, atras)) continue;
    for (let i = 2; i < S.length; i++) if (mismaCasilla(S[i], v)) { roces++; break; }
  }
  if (!roces || esFrenesi()) return;
  J.uyT = 0.25;
  cargaFrenesi(CARGA_UY * roces);
  if (Math.random() < 0.35) numero(cx(n[0]), cy(n[1]) - 7, tr('¡Uy!'), '#9cff6b', 7);
  chispa(cx(n[0]), cy(n[1]), '#9cff6b', 3, 40);
  SONIDO.uy();
}

function muere(motivo) {
  const J = JUEGO; J.modo = 'fin'; J.tFin = 0; J.frenesiT = 0; J.mult = 1;
  J.fin = { motivo, record: J.puntos > SAVE.record };
  if (J.fin.record) SAVE.record = J.puntos;
  SAVE.monedas += J.monedasPartida; SAVE.partidas++; guarda();
  const h = J.serp[0]; chispa(cx(h[0]), cy(h[1]), '#ff4d4d', 18, 90); tiembla(4, 0.4);
  SONIDO.muere();
}
