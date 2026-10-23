// Fans of Snakes · Cartas: cada CARTAS_CADA manzanas la partida se para y eliges una de tres mejoras (si estás en Frenesí,
// espera a que acabe), y una al empezar cada partida (con el Portal siempre entre las tres). Se acumulan: cada carta sube de
// nivel hasta su máximo; las de `cargas` (Portal, Fantasma y Escudo) suman usos que se gastan. Con dos cartas concretas
// sale su FUSIÓN (siempre la primera de la oferta), una carta más fuerte: por ejemplo Portal + Escudo = Portal infinito.
// Aquí están las cartas y lo que hacen; cómo se ven está en js/cartas-pantalla.js. js/partida.js y js/frenesi.js preguntan
// por ellas con nivel('nombre') y las funciones de abajo.
'use strict';

const CARTAS_CADA = 5;   // cada cuántas manzanas sale la elección

const CARTAS = {
  iman:     { nombre: 'IMÁN', max: 3, col: '#ff5a5a', texto: n => tr('Come manzanas a {n} de distancia', { n }) },
  fantasma: { nombre: 'FANTASMA', max: 99, cargas: 1, col: '#cfe8ff', texto: () => tr('Atraviesa tu cola una vez') },
  dash:     { nombre: 'HYPER-DASH', max: 3, col: '#ffd54a', texto: () => tr('+30 % de puntos y +12 % de velocidad') },
  portal:   { nombre: 'PORTAL', max: 99, cargas: 10, col: '#b388ff', texto: () => tr('10 veces: las paredes te llevan al otro lado') },
  doble:    { nombre: 'BUFFET', max: 2, col: '#ff8a3d', texto: () => tr('Una manzana más en el tablero') },
  reloj:    { nombre: 'PRÓRROGA', max: 3, col: '#7fd7ff', texto: () => tr('El Frenesí dura 3 s más') },
  pila:     { nombre: 'TURBOCARGA', max: 3, col: '#9cff6b', texto: () => tr('La barra de Frenesí carga un 50 % más') },
  escudo:   { nombre: 'ESCUDO', max: 99, cargas: 1, col: '#3ddc84', texto: () => tr('Rebota una vez en la pared') },
  // las de acción (js/acciones.js): se usan con el dedo
  nitro:    { nombre: 'NITRO', max: 1, col: '#ff3d71', texto: () => tr('Mantén pulsado: el doble de rápido y de puntos'), consejo: 'NITRO: mantén el dedo pulsado (con Palanca, pon un segundo dedo; en el PC, Mayúsculas)' },
  salto:    { nombre: 'SALTO', max: 99, cargas: 3, col: '#40c4ff', texto: () => tr('Toca dos veces: saltas por encima'), consejo: 'SALTO: toca dos veces rápido y saltas por encima de lo que tengas delante (en el PC, Espacio)' },
  bala:     { nombre: 'TIEMPO BALA', max: 99, cargas: 2, col: '#b2ebf2', texto: () => tr('Si vas a chocar, el tiempo se frena') },
  dieta:    { nombre: 'DIETA', max: 2, col: '#c5e1a5', texto: n => tr('Cada 4 manzanas, tu cola pierde {n} trozos', { n: n * 2 }) },
  // las fusiones: salen cuando tienes las dos cartas de `fusion`
  gusano:   { nombre: 'AGUJERO DE GUSANO', max: 1, fusion: ['portal', 'escudo'], col: '#e040fb', texto: () => tr('Portal infinito: las paredes ya no te matan') },
  aspiradora: { nombre: 'ASPIRADORA', max: 1, fusion: ['iman', 'doble'], col: '#ff7043', texto: () => tr('Te comes las manzanas a 4 casillas') },
  tormenta: { nombre: 'TORMENTA', max: 1, fusion: ['reloj', 'pila'], col: '#40c4ff', texto: () => tr('Al acabar el Frenesí, la barra se queda a la mitad') },
  ninja:    { nombre: 'NINJA', max: 1, fusion: ['salto', 'bala'], col: '#26c6da', texto: () => tr('Saltos sin límite: se recargan cada 3 s') },
  cohete:   { nombre: 'COHETE', max: 1, fusion: ['nitro', 'dash'], col: '#ff6e40', texto: () => tr('Con el nitro, el Frenesí se carga solo') },
  muda:     { nombre: 'MUDA', max: 1, fusion: ['dieta', 'fantasma'], col: '#aed581', texto: () => tr('Tu cola ya no te mata: al morderla, se corta') },
};

const nivel = k => JUEGO.cartas[k] || 0;

// lo que piden la partida y el Frenesí
const multPuntos = () => JUEGO.mult * Math.pow(1.3, nivel('dash')) * (locuraActiva('turbo') ? 2 : 1) * (JUEGO.nitro ? 2 : 1);
const factorVelocidad = () => 1 / (1 + 0.12 * nivel('dash'));
const segundosFrenesi = () => FRENESI_SEG + 3 * nivel('reloj');
const factorCarga = () => 1 + 0.5 * nivel('pila');
const manzanasEnTablero = () => 1 + nivel('doble');

const usaPortal = () => nivel('gusano') > 0 || nivel('portal') > 0;
const radioIman = () => nivel('aspiradora') ? 4 : nivel('iman');
const fusionLista = k => CARTAS[k].fusion && !nivel(k) && CARTAS[k].fusion.every(r => nivel(r) > 0);

// tres cartas distintas que no estén al máximo; una fusión disponible va siempre la primera; en la primera de la partida,
// el Portal siempre está (es la que más gusta al empezar)
function ofertaCartas() {
  const libres = Object.keys(CARTAS).filter(k => !CARTAS[k].fusion && nivel(k) < CARTAS[k].max && !(k === 'portal' && nivel('gusano')));
  for (let i = libres.length - 1; i > 0; i--) { const j = azarEntero(i + 1); [libres[i], libres[j]] = [libres[j], libres[i]]; }
  const fusiones = Object.keys(CARTAS).filter(fusionLista);
  let oferta = [...fusiones.slice(0, 1), ...libres];
  if (JUEGO.cartasElegidas === 0) oferta = ['portal', ...libres.filter(k => k !== 'portal')];
  return oferta.slice(0, 3);
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
  J.cartas[k] = nivel(k) + (CARTAS[k].cargas || 1); J.cartasElegidas++;
  if (CARTAS[k].fusion) { SONIDO.frenesi(); tiembla(3, 0.3); }
  if (CARTAS[k].consejo && nivel(k) === (CARTAS[k].cargas || 1)) consejo(CARTAS[k].consejo);   // la primera vez, cómo se usa
  if (k === 'doble') while (J.manzanas.length < manzanasEnTablero()) { const p = casillaLibre(); if (!p) break; J.manzanas.push(p); }
  J.modo = 'juego'; J.oferta = []; J.pend = [];
  J.acum = -0.45;   // un respiro antes de que vuelva a moverse
  const h = J.serp[0]; numero(cx(h[0]), cy(h[1]) - 10, tr(CARTAS[k].nombre), CARTAS[k].col, 11);
  chispa(cx(h[0]), cy(h[1]), CARTAS[k].col, 14, 80);
  SONIDO.elige();
}

// el Imán: las manzanas cerca de la cabeza se las come sin tocarlas (con su chispa volando hacia la boca)
function aplicaIman() {
  const r = radioIman(); if (!r) return;
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
  const libre = n => n[0] >= 0 && n[0] < COLS && n[1] >= 0 && n[1] < ROWS && !esMuro(n) && !J.serp.some(s => mismaCasilla(s, n));
  const lados = [[d[1], d[0]], [-d[1], -d[0]]].filter(l => libre([h[0] + l[0], h[1] + l[1]]));
  if (!lados.length) return false;
  J.cartas.escudo--; J.dir = lados[azarEntero(lados.length)]; J.pend = [];
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
