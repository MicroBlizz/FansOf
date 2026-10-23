// Fans of Snakes · Partida: la serpiente avanza una casilla cada «paso» de reloj. Comer alarga y da puntos; pasar rozando
// tu propio cuerpo (¡Uy!) carga el Frenesí; chocar con la pared o contigo mismo acaba la partida, salvo en Frenesí, donde
// cruzarte es la Demolición (js/frenesi.js). Comer deprisa hace racha y carga más el Frenesí. Cada CARTAS_CADA manzanas,
// cartas (js/cartas.js). Los ítems «?» son las locuras (js/locuras.js).
'use strict';

const PASO_INICIAL = 0.36;     // segundos por casilla al empezar (despacito)
const PASO_MINIMO = 0.09;      // lo más deprisa que va (se llega hacia las 35 manzanas)
const PASO_POR_MANZANA = 0.0065;   // cuánto acelera cada manzana comida
const LARGO_INICIAL = 4;
const PUNTOS_MANZANA = 10;
const RACHA_CARGA = 0.035;     // carga de Frenesí extra por cada manzana de racha (hasta x6)
const RACHA_CASILLAS = 14;     // la racha sigue si la siguiente manzana llega antes de esas casillas de camino

const JUEGO = {
  modo: 'menu',       // 'menu' | 'juego' | 'cartas' | 'fin'
  serp: [],           // casillas [c, r], la cabeza la primera
  dir: [1, 0],        // hacia dónde va
  muros: new Set(),   // casillas de muro 'c,r' (js/muros.js)
  pend: [],           // giros pedidos por el dedo, en cola (máximo 2)
  manzanas: [], items: [],
  puntos: 0, mult: 1, acum: 0, t: 0, tFin: 0, uyT: 0,
  frenesi: 0, frenesiT: 0, frenesiDur: 0, frenesis: 0, monedasPartida: 0, cortes: 0, locuras: 0, comidas: 0,
  racha: 0, pasosRacha: 0, mejorRacha: 0,
  cartas: {}, oferta: [], cartasPend: false, tCartas: 0, cartasElegidas: 0,
  fin: { motivo: '', record: false },
};

function nuevaPartida() {
  const J = JUEGO, c0 = Math.floor(COLS / 2) - 2, r0 = Math.floor(ROWS / 2);
  J.serp = []; for (let i = 0; i < LARGO_INICIAL; i++) J.serp.push([c0 - i, r0]);
  J.dir = [1, 0]; J.pend = []; J.manzanas = []; J.items = []; J.muros = new Set(); J.monedasCobradas = 0;
  J.puntos = 0; J.mult = 1; J.acum = 0; J.t = 0; J.tFin = 0; J.uyT = 0;
  J.frenesi = 0; J.frenesiT = 0; J.frenesiDur = 0; J.frenesis = 0; J.monedasPartida = 0; J.cortes = 0; J.locuras = 0; J.comidas = 0;
  J.racha = 0; J.pasosRacha = 0; J.mejorRacha = 0;
  J.cartas = {}; J.oferta = []; J.cartasPend = true; J.tCartas = 0; J.cartasElegidas = 0; J.tVivo = 0;   // la primera carta, al empezar
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

const pasoActual = () => Math.max(PASO_MINIMO, PASO_INICIAL - JUEGO.comidas * PASO_POR_MANZANA) * (esFrenesi() ? 0.85 : 1) * factorVelocidad() * (locuraActiva('turbo') ? 0.55 : 1);

function avanzaJuego(dt) {
  const J = JUEGO; J.t += dt;
  avanzaEfectos(dt);
  if (J.modo === 'fin') { J.tFin += dt; return; }
  if (J.modo === 'cartas') { J.tCartas += dt; return; }
  if (PUBLI.activo) return;
  if (J.modo !== 'juego') return;
  J.tVivo += dt;
  if (J.uyT > 0) J.uyT -= dt;
  avanzaFrenesi(dt); avanzaLocuras(dt);
  if (PARTIDA.tipo === 'vs') avanzaVS(dt);
  if (J.cartasPend && !esFrenesi()) { abreCartas(); return; }   // en Frenesí espera a que acabe
  J.acum += dt;
  while (J.acum >= pasoActual() && J.modo === 'juego') { J.acum -= pasoActual(); mueve(); }
}

// un paso de reloj: la cabeza avanza una casilla
function mueve() {
  const J = JUEGO, S = J.serp;
  if (J.pend.length) J.dir = J.pend.shift();
  const h = S[0];
  let n = [h[0] + J.dir[0], h[1] + J.dir[1]];
  if (n[0] < 0 || n[0] >= COLS || n[1] < 0 || n[1] >= ROWS) {
    if (usaPortal()) {
      if (!nivel('gusano')) J.cartas.portal--;   // el Agujero de gusano no gasta
      n = [(n[0] + COLS) % COLS, (n[1] + ROWS) % ROWS]; chispa(cx(h[0]), cy(h[1]), '#b388ff', 6, 50); SONIDO.portal();
    }
    else if (nivel('escudo') && rebotaEscudo()) return;   // este paso no avanza: gira
    else { muere('pared'); return; }
  }
  if (esMuro(n)) {
    if (nivel('escudo') && rebotaEscudo()) return;
    muere('muro'); return;
  }
  const iCuerpo = S.findIndex(s => mismaCasilla(s, n));
  const iMan = J.manzanas.findIndex(m => mismaCasilla(m, n));
  const come = iMan >= 0;
  // la cola se mueve antes de mirar el choque: pisar la última casilla de la cola es legal (ya no está)
  if (!come) S.pop();
  if (iCuerpo >= 0 && iCuerpo < S.length) {
    if (esFrenesi()) demolicion(iCuerpo);
    else if (!atraviesaFantasma(n)) { muere('cola'); return; }
  }
  S.unshift(n);
  J.pasosRacha++;
  if (J.racha && J.pasosRacha > RACHA_CASILLAS) J.racha = 0;
  if (come) comeManzana(iMan, n);
  aplicaIman();
  const iItem = J.items.findIndex(it => it.c === n[0] && it.r === n[1]);
  if (iItem >= 0) cogeLocura(iItem);
  compruebaRoce(n);
  compruebaObjetivo();
  if (J.serp.length >= 15) mision('largo', J.serp.length, true);
}

// se come la manzana i (que está en la casilla m): puntos, racha, Frenesí, la siguiente manzana y, cada tanto, cartas
function comeManzana(i, m) {
  const J = JUEGO;
  J.manzanas.splice(i, 1); J.comidas++;
  J.racha = J.pasosRacha <= RACHA_CASILLAS || J.racha === 0 ? J.racha + 1 : 1; J.pasosRacha = 0;
  J.mejorRacha = Math.max(J.mejorRacha, J.racha);
  const pts = Math.round(PUNTOS_MANZANA * multPuntos()); J.puntos += pts;
  numero(cx(m[0]), cy(m[1]) - 6, '+' + pts, esFrenesi() ? '#ffd54a' : '#fff', esFrenesi() ? 11 : 9);
  chispa(cx(m[0]), cy(m[1]), esFrenesi() ? '#ffd54a' : '#ff4d4d', 8, 70);
  cargaFrenesi(CARGA_MANZANA + RACHA_CARGA * Math.min(6, J.racha - 1));
  mision('manzanas', 1); mision('racha', J.racha, true); ataqueRacha(J.racha);
  if (J.racha >= 2 && !esFrenesi()) { numero(cx(m[0]), cy(m[1]) + 7, tr('RACHA x{n}', { n: J.racha }), '#7fd7ff', 7 + Math.min(4, J.racha)); SONIDO.racha(J.racha); }
  if (esFrenesi()) SONIDO.come_oro(); else SONIDO.come();
  while (J.manzanas.length < manzanasEnTablero()) { const p = casillaLibre(); if (!p) break; J.manzanas.push(p); }
  if (J.comidas % CARTAS_CADA === 0) J.cartasPend = true;
  tutoAviso('racha', J.racha >= 2);
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

function muere(motivo) { acaba(false, motivo); }   // el reparto de lo ganado y lo de cada modo: js/modos.js
