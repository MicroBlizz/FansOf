// Fans of Snakes · Cartas: cada CARTAS_CADA manzanas la partida se para y eliges una de tres mejoras (si estás en Frenesí,
// espera a que acabe). Se acumulan: cada carta sube de nivel hasta su máximo. Fantasma y Escudo son cargas que se gastan.
// Aquí están las cartas y lo que hacen; cómo se ven está en js/cartas-pantalla.js. js/partida.js y js/frenesi.js preguntan
// por ellas con nivel('nombre') y las funciones de abajo.
'use strict';

const CARTAS_CADA = 5;   // cada cuántas manzanas sale la elección

const CARTAS = {
  iman:     { nombre: 'IMÁN', max: 3, col: '#ff5a5a', texto: n => tr('Come manzanas a {n} de distancia', { n }) },
  fantasma: { nombre: 'FANTASMA', max: 9, col: '#cfe8ff', texto: () => tr('Atraviesa tu cola una vez') },
  dash:     { nombre: 'HYPER-DASH', max: 3, col: '#ffd54a', texto: () => tr('+30 % de puntos y +12 % de velocidad') },
  portal:   { nombre: 'PORTAL', max: 1, col: '#b388ff', texto: () => tr('Las paredes te llevan al otro lado') },
  doble:    { nombre: 'BUFFET', max: 2, col: '#ff8a3d', texto: () => tr('Una manzana más en el tablero') },
  reloj:    { nombre: 'PRÓRROGA', max: 3, col: '#7fd7ff', texto: () => tr('El Frenesí dura 3 s más') },
  pila:     { nombre: 'TURBOCARGA', max: 3, col: '#9cff6b', texto: () => tr('La barra de Frenesí carga un 50 % más') },
  escudo:   { nombre: 'ESCUDO', max: 9, col: '#3ddc84', texto: () => tr('Rebota una vez en la pared') },
};

const nivel = k => JUEGO.cartas[k] || 0;

// lo que piden la partida y el Frenesí
const multPuntos = () => JUEGO.mult * Math.pow(1.3, nivel('dash'));
const factorVelocidad = () => 1 / (1 + 0.12 * nivel('dash'));
const segundosFrenesi = () => FRENESI_SEG + 3 * nivel('reloj');
const factorCarga = () => 1 + 0.5 * nivel('pila');
const manzanasEnTablero = () => 1 + nivel('doble');

// tres cartas distintas que no estén al máximo
function ofertaCartas() {
  const libres = Object.keys(CARTAS).filter(k => nivel(k) < CARTAS[k].max);
  for (let i = libres.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [libres[i], libres[j]] = [libres[j], libres[i]]; }
  return libres.slice(0, 3);
}

function abreCartas() {
  const J = JUEGO; J.cartasPend = false;
  const oferta = ofertaCartas(); if (!oferta.length) return;
  J.oferta = oferta; J.modo = 'cartas'; J.tCartas = 0;
  sueltaPalanca(); J.pend = [];
  SONIDO.cartas();
}

function eligeCarta(i) {
  const J = JUEGO, k = J.oferta[i]; if (!k) return;
  J.cartas[k] = nivel(k) + 1; J.cartasElegidas++;
  if (k === 'doble') while (J.manzanas.length < manzanasEnTablero()) { const p = casillaLibre(); if (!p) break; J.manzanas.push(p); }
  J.modo = 'juego'; J.oferta = []; J.pend = [];
  J.acum = -0.45;   // un respiro antes de que vuelva a moverse
  const h = J.serp[0]; numero(cx(h[0]), cy(h[1]) - 10, tr(CARTAS[k].nombre), CARTAS[k].col, 11);
  chispa(cx(h[0]), cy(h[1]), CARTAS[k].col, 14, 80);
  SONIDO.elige();
}

// el Imán: las manzanas cerca de la cabeza se las come sin tocarlas (con su chispa volando hacia la boca)
function aplicaIman() {
  const r = nivel('iman'); if (!r) return;
  const J = JUEGO, h = J.serp[0];
  for (let i = J.manzanas.length - 1; i >= 0; i--) {
    const m = J.manzanas[i], d = Math.abs(m[0] - h[0]) + Math.abs(m[1] - h[1]);
    if (d > 0 && d <= r) {
      J.serp.push(J.serp[J.serp.length - 1].slice());   // crece igual que si la hubiera pisado
      chispa(cx(m[0]), cy(m[1]), '#ff5a5a', 5, 40);
      comeManzana(i, m);
    }
  }
}

// el Escudo: al chocar con la pared gasta una carga y gira hacia un lado libre en vez de morir
function rebotaEscudo() {
  const J = JUEGO, h = J.serp[0], d = J.dir;
  const libre = n => n[0] >= 0 && n[0] < COLS && n[1] >= 0 && n[1] < ROWS && !J.serp.some(s => mismaCasilla(s, n));
  const lados = [[d[1], d[0]], [-d[1], -d[0]]].filter(l => libre([h[0] + l[0], h[1] + l[1]]));
  if (!lados.length) return false;
  J.cartas.escudo--; J.dir = lados[Math.floor(Math.random() * lados.length)]; J.pend = [];
  chispa(cx(h[0]), cy(h[1]), '#3ddc84', 14, 90); tiembla(2.5, 0.2);
  numero(cx(h[0]), cy(h[1]) - 8, tr('¡Escudo!'), '#3ddc84', 9);
  SONIDO.escudo();
  return true;
}

// el Fantasma: al morderte gasta una carga y atraviesa
function atraviesaFantasma(n) {
  const J = JUEGO; if (!nivel('fantasma')) return false;
  J.cartas.fantasma--;
  chispa(cx(n[0]), cy(n[1]), '#cfe8ff', 12, 60);
  numero(cx(n[0]), cy(n[1]) - 8, tr('¡Fantasma!'), '#cfe8ff', 9);
  SONIDO.fantasma();
  return true;
}
