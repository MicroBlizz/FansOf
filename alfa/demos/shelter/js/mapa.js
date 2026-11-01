// Fans of Shelter · EL MAPA: el refugio y su bosque, escrito a mano casilla a casilla (CAS píxeles cada una). Qué hay en cada casilla,
// por dónde se pasa, picar y talar, el bloque que se empuja, el interruptor que abre la puerta y el cofre de la zona secreta.
// Pintarlo está en js/suelo.js.
'use strict';

const CAS = 24;   // tamaño de una casilla en píxeles
// # cara de acantilado (sólida; la hierba de arriba es una meseta) · n e w bordes de meseta (norte, este, oeste; sólidos) · s escalera (se sube por ella)
// . hierba · ~ agua · _ tierra del refugio · T árbol · R roca · I mena de hierro · B bloque · S interruptor · D puerta
// M mesa de trabajo · H hoguera · C cofre · P donde empieza CrazyBunny
const MAPA_TXT = [
  '####################################',
  '#..T..T..R..e.........T....TT...TT.#',
  '#.T....T....e......T......T.......T#',
  '#...T..I....e..~~~.........R..I....#',
  '#..R...T....e~~~~~~.......T........#',
  '#.T.T.......e~~~~~~~~.T..........T.#',
  '#..S.....B..e.~~~~~~......####D#####',
  '######ss####...~~~.......#....I...R#',
  '######ss####..____.......#.R...I..##',
  '#...........__________...#.........#',
  '#..T.......___M____H__...#...C.....#',
  '#.T.......____________...#.........#',
  '#.....R...____P_______...#.I...R...#',
  '#..T.......__________....#.........#',
  '#............______......###########',
  '#.T....R..........T...T............#',
  '#....T..................wnnnssnnnnn#',
  '#...........T......R....w.I....R...#',
  '#..T...I...........T....w....I.....#',
  '#.......T....T..........w.R.....I..#',
  '#..R.........R......I...w....R.....#',
  '#T.....T............T...w..I.....R.#',
  '#.....R..........T......w......I...#',
  '####################################',
];

// MAPA.t[j][i]: la letra de la casilla ahora mismo (cambia al talar, picar, empujar o abrir)
const MAPA = { w: 0, h: 0, t: [], golpes: {}, puertaAbierta: false, cofreAbierto: false, inicio: { x: 0, y: 0 }, mesa: null, hoguera: null, construido: [] };

// alrededor del mapa dibujado a mano hay un anillo de bosque espeso (ARO casillas), siempre igual, para que haya terreno hacia todos los lados
const ARO = 9;
let MAPA_BASE = null;   // el mapa entero (el de arriba más el aro), listo
function construyeMapa() {
  if (MAPA_BASE) return MAPA_BASE;
  const w0 = MAPA_TXT[0].length, h0 = MAPA_TXT.length, w = w0 + ARO * 2 - 2, h = h0 + ARO * 2 - 2, filas = [];
  for (let j = 0; j < h; j++) {
    let f = '';
    for (let i = 0; i < w; i++) {
      const i0 = i - ARO + 1, j0 = j - ARO + 1;
      if (i0 >= 1 && i0 < w0 - 1 && j0 >= 1 && j0 < h0 - 1) { f += MAPA_TXT[j0][i0]; continue; }
      if (i === 0 || j === 0 || i === w - 1 || j === h - 1) { f += '#'; continue; }
      const r = hash2(i, j, 11), borde = Math.min(i, j, w - 1 - i, h - 1 - j);   // más espeso cuanto más fuera
      f += r < 0.22 + (borde < 3 ? 0.3 : 0) ? 'T' : r < 0.3 ? 'R' : r < 0.34 ? 'I' : '.';
    }
    filas.push(f);
  }
  MAPA_BASE = filas;
  return filas;
}

function mapaNuevo() {
  const base = construyeMapa();
  MAPA.h = base.length; MAPA.w = base[0].length;
  MAPA.t = base.map(f => f.split(''));
  MAPA.golpes = {}; MAPA.puertaAbierta = false; MAPA.cofreAbierto = false; MAPA.construido = []; MAPA.bajoBloque = '.'; MAPA.tiembla = null;
  for (let j = 0; j < MAPA.h; j++) for (let i = 0; i < MAPA.w; i++) {
    const c = MAPA.t[j][i];
    if (c === 'P') { MAPA.inicio = { x: (i + 0.5) * CAS, y: (j + 0.9) * CAS }; MAPA.t[j][i] = '_'; }
    if (c === 'M') MAPA.mesa = { i, j };
    if (c === 'H') MAPA.hoguera = { i, j };
  }
}

const casilla = (i, j) => (j < 0 || j >= MAPA.h || i < 0 || i >= MAPA.w) ? '#' : MAPA.t[j][i];
// ¿se puede andar por esta casilla? (la puerta abierta y el interruptor, sí; una trampa construida también)
function pasable(i, j) {
  const c = casilla(i, j);
  if (c === 'D') return MAPA.puertaAbierta;
  if (c !== '.' && c !== '_' && c !== 'S' && c !== 't' && c !== 's') return false;   // t = tocón · s = escalera
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
    else if (c === '.' && MAPA_BASE[j][i] === 'R') MAPA.t[j][i] = 'R';
    else if (c === '.' && MAPA_BASE[j][i] === 'I') MAPA.t[j][i] = 'I';
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
