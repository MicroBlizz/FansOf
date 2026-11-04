// Fans of Shelter · EL MAPA: el claro del refugio y su bosque, en vertical para el móvil, escrito a mano casilla a casilla (CAS píxeles cada
// una). Qué hay en cada casilla, por dónde se pasa, picar y talar, el bloque que se empuja, el interruptor que abre la puerta del claro
// secreto y su cofre. Pintarlo (suelo con Wang tiles y las cosas encima) está en js/suelo.js.
'use strict';

const CAS = 32;   // tamaño de una casilla en píxeles (las losas de suelo de img/wang_*.png miden esto)
// # bosque de pinos (sólido) · . hierba · _ tierra del claro · ~ agua (sólida) · T árbol · R roca · I mena de hierro
// B bloque · S interruptor · D puerta del claro secreto · C cofre · M mesa de trabajo · H hoguera · X el refugio (x: sus lados, sólidos)
// P donde empieza CrazyBunny
const MAPA_TXT = [
  '###############',
  '#..T..R..#..C.#',
  '#.~~~....#....#',
  '#~~~~~.T.#.I..#',
  '#.~~~....###D##',
  '#..I...T......#',
  '#.T.....S...B.#',
  '#.....R.......#',
  '#..T.........T#',
  '#....______...#',
  '#...________..#',
  '#..__xXx_M___.#',
  '#..__________.#',
  '#..___H__P___.#',
  '#...________..#',
  '#.T..______.R.#',
  '#.......T.....#',
  '#..R.......I..#',
  '#.T...T.......#',
  '#......R...T..#',
  '#..I.......~~.#',
  '#...T....~~~~.#',
  '#.R.....T.~~..#',
  '#....T.....R..#',
  '#.T......I....#',
  '###############',
];

// MAPA.t[j][i]: la letra de la casilla ahora mismo (cambia al talar, picar, empujar o abrir)
const MAPA = { w: 0, h: 0, t: [], golpes: {}, puertaAbierta: false, cofreAbierto: false, inicio: { x: 0, y: 0 }, mesa: null, hoguera: null, refugio: null, construido: [] };

function mapaNuevo() {
  MAPA.h = MAPA_TXT.length; MAPA.w = MAPA_TXT[0].length;
  MAPA.t = MAPA_TXT.map(f => f.split(''));
  MAPA.golpes = {}; MAPA.puertaAbierta = false; MAPA.cofreAbierto = false; MAPA.construido = []; MAPA.bajoBloque = '.'; MAPA.tiembla = null;
  for (let j = 0; j < MAPA.h; j++) for (let i = 0; i < MAPA.w; i++) {
    const c = MAPA.t[j][i];
    if (c === 'P') { MAPA.inicio = { x: (i + 0.5) * CAS, y: (j + 0.9) * CAS }; MAPA.t[j][i] = '_'; }
    if (c === 'M') MAPA.mesa = { i, j };
    if (c === 'X') MAPA.refugio = { i, j };
    if (c === 'H') MAPA.hoguera = { i, j };
  }
}

// el terreno del suelo de cada casilla (para las losas): 'tierra' bajo lo del claro, 'agua' en el lago, 'hierba' en el resto
const TIERRA = new Set(['_', 'M', 'H', 'X', 'x', 'P']);
const terreno = (i, j) => { const c = MAPA_TXT[j] && MAPA_TXT[j][i]; return c === '~' ? 'agua' : TIERRA.has(c) ? 'tierra' : 'hierba'; };

const casilla = (i, j) => (j < 0 || j >= MAPA.h || i < 0 || i >= MAPA.w) ? '#' : MAPA.t[j][i];
// ¿se puede andar por esta casilla? (la puerta abierta y el interruptor, sí; una trampa construida también)
function pasable(i, j) {
  const c = casilla(i, j);
  if (c === 'D') return MAPA.puertaAbierta;
  if (c !== '.' && c !== '_' && c !== 'S' && c !== 't') return false;   // t = tocón
  for (const o of MAPA.construido) if (o.tipo === 'torreta' && o.i === i && o.j === j) return false;   // las torretas estorban; las trampas no
  return true;
}
// ¿un rectángulo (en píxeles) toca alguna casilla sólida?
function choca(x, y, w, h) {
  const i0 = Math.floor(x / CAS), j0 = Math.floor(y / CAS), i1 = Math.floor((x + w - 0.01) / CAS), j1 = Math.floor((y + h - 0.01) / CAS);
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) if (!pasable(i, j)) return true;
  return false;
}
// mueve un rectángulo (x, y, w, h) con el desplazamiento (dx, dy), parando contra lo sólido eje a eje. Devuelve la posición nueva.
function mueveChocando(x, y, w, h, dx, dy) {
  if (dx && !choca(x + dx, y, w, h)) x += dx;
  if (dy && !choca(x, y + dy, w, h)) y += dy;
  return [x, y];
}

// LOS RECURSOS: golpes que aguanta cada cosa y qué suelta
const RECURSO = {
  T: { golpes: 3, da: { madera: 2 }, queda: 't' },
  R: { golpes: 3, da: { piedra: 2 }, queda: '.' },
  I: { golpes: 4, da: { hierro: 2, piedra: 1 }, queda: '.' },
};
// un golpe a la casilla (i, j). Devuelve lo que suelta ({ madera: 2 }) cuando cae, o null si todavía aguanta / no es un recurso
function golpea(i, j) {
  const c = casilla(i, j), r = RECURSO[c]; if (!r) return null;
  const k = i + ',' + j;
  MAPA.golpes[k] = (MAPA.golpes[k] || 0) + 1;
  if (MAPA.golpes[k] < r.golpes) return null;
  delete MAPA.golpes[k]; MAPA.t[j][i] = r.queda;
  return r.da;
}
// empuja el bloque de (i, j) hacia (di, dj). Devuelve true si se ha movido
function empuja(i, j, di, dj) {
  if (casilla(i, j) !== 'B') return false;
  if (MAPA.bajoBloque === 'S') return false;   // ya está sobre el interruptor: se queda ahí, como en Zelda
  const i2 = i + di, j2 = j + dj, c = casilla(i2, j2);
  if (c !== '.' && c !== '_' && c !== 'S' && c !== 't') return false;
  if (MAPA.construido.some(o => o.i === i2 && o.j === j2)) return false;
  MAPA.t[j][i] = MAPA.bajoBloque || '.'; MAPA.bajoBloque = c; MAPA.t[j2][i2] = 'B';
  if (c === 'S' && !MAPA.puertaAbierta) { MAPA.puertaAbierta = true; MAPA.interruptorPisado = true; return 'puerta'; }
  return true;
}
// al amanecer vuelve parte del bosque: cada tocón y cada hueco de roca tiene una probabilidad de regresar
function rebrota(prob) {
  for (let j = 1; j < MAPA.h - 1; j++) for (let i = 1; i < MAPA.w - 1; i++) {
    const c = MAPA.t[j][i], k = i + ',' + j;
    if (Math.random() > prob) continue;
    if (c === 't') MAPA.t[j][i] = 'T';
    else if (c === '.' && MAPA_TXT[j][i] === 'R' && Math.random() < 0.5) MAPA.t[j][i] = 'R';
    else if (c === '.' && MAPA_TXT[j][i] === 'I') MAPA.t[j][i] = 'I';
    delete MAPA.golpes[k];
  }
}
// casillas de hierba libres a cierta distancia del refugio (para que salgan los enemigos)
function casillaLibreLejos(px, py, minDist) {
  for (let n = 0; n < 60; n++) {
    const i = 1 + Math.floor(Math.random() * (MAPA.w - 2)), j = 1 + Math.floor(Math.random() * (MAPA.h - 2));
    if (!pasable(i, j)) continue;
    const x = (i + 0.5) * CAS, y = (j + 0.5) * CAS;
    if (Math.hypot(x - px, y - py) >= minDist) return [x, y];
  }
  return [CAS * 2, CAS * 2];
}
