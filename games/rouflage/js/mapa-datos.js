// Fans of Rouflage · EL REGISTRO DE MAPAS: cada mapa (la estación de Microblizz, las Backrooms…) se describe en su archivo con
// listas sencillas (salas, pasos, muebles, carteles) y se apunta aquí con defineMapa(). cargaMapa(id) deja ese mapa como el actual:
// rellena las variables que usa todo el juego (SALAS, GRID, MUEBLES, PUERTA…) y calcula la rejilla (dónde se pisa) y las paredes
// de frente. Todo el mundo lee estas variables; solo cargaMapa() las cambia.
'use strict';

const CEL = 20;                           // una casilla de la cuadrícula, en píxeles
const VACIO = 0, SUELO = 1, CARA = 2;     // lo que hay en cada casilla: muro visto desde arriba, suelo o pared vista de frente
const ALTO_CARA = 3;                      // casillas de alto de la pared de frente (60: cabe una alubia entera delante)

const MAPAS = {}, ORDEN_MAPAS = [];
// un mapa: { id, nombre, lema, ancho, alto (en casillas), salas, pasos, muebles, carteles, pegatinas, epitafios, puerta,
//            salidaCamaleones, salidaCazadores, espera (sala donde esperan los cazadores), plaza (sala del paseo del título) }
function defineMapa(d) { MAPAS[d.id] = d; ORDEN_MAPAS.push(d.id); }

// lo que ve todo el juego del mapa actual (lo rellena cargaMapa)
let MAPA_ACT = null;
let MW = 84, MH = 60, ANCHO = MW * CEL, ALTO = MH * CEL;
let BARRERAS = [];      // Mi escenario: los tramos que cierran la sala de los becarios (barreras.js)
let SALAS = [], PASOS = [], ZONAS = [], GRID = new Uint8Array(MW * MH), ZONA_DE = new Int16Array(MW * MH), CARAS = [];
let MUEBLES = [], CARTELES = [], PEGATINAS = [], EPITAFIOS = [];
let SALIDA_CAMALEONES = [[0, 0]], SALIDA_CAZADORES = [[0, 0]];
// la barrera de la sala de espera de los cazadores: cerrada mientras los camaleones se pintan; `abierta` va de 0 a 1 al levantarse
const PUERTA = { x: 0, y: 0, w: 80, h: 80, cerrada: true, abierta: 0 };

const zona = id => ZONAS.find(z => z.id === id);
const salaEspera = () => zona(MAPA_ACT ? MAPA_ACT.espera : '');
const plazaTitulo = () => (!MAPA_ACT ? null : Array.isArray(MAPA_ACT.plaza) ? zonaEn(...MAPA_ACT.plaza) : zona(MAPA_ACT.plaza));   // la sala del paseo del título: por id o por un punto

// de un punto del mundo, qué hay en su casilla
const celdaEn = (x, y) => (x < 0 || y < 0 || x >= ANCHO || y >= ALTO ? VACIO : GRID[((y / CEL) | 0) * MW + ((x / CEL) | 0)]);
const zonaEn = (x, y) => (x < 0 || y < 0 || x >= ANCHO || y >= ALTO ? null : ZONAS[ZONA_DE[((y / CEL) | 0) * MW + ((x / CEL) | 0)]] || null);

// deja un mapa como el actual: copia sus listas y calcula la rejilla y las paredes de frente
function cargaDatosMapa(id) {
  const d = MAPAS[id] || MAPAS[ORDEN_MAPAS[0]]; MAPA_ACT = d;
  MW = d.ancho; MH = d.alto; ANCHO = MW * CEL; ALTO = MH * CEL;
  SALAS = d.salas.map(s => ({ ...s })); PASOS = d.pasos.map(p => ({ suelo: 'umbral', pared: 'marco', ...p, paso: true }));
  ZONAS = [...SALAS, ...PASOS];
  for (const z of ZONAS) { z.px = z.x * CEL; z.py = z.y * CEL; z.pw = z.w * CEL; z.ph = z.h * CEL; }
  MUEBLES = d.muebles.map(m => ({ ...m })); CARTELES = d.carteles; PEGATINAS = d.pegatinas || []; EPITAFIOS = d.epitafios || [];
  SALIDA_CAMALEONES = d.salidaCamaleones; SALIDA_CAZADORES = d.salidaCazadores;
  BARRERAS = (d.barreras || []).map(b => ({ ...b }));
  Object.assign(PUERTA, { estilo: 'barrera' }, d.puerta, { cerrada: true, abierta: 0 });

  // la rejilla: qué hay en cada casilla y de qué zona es
  GRID = new Uint8Array(MW * MH); ZONA_DE = new Int16Array(MW * MH).fill(-1);      // (Int16: un escenario dibujado por el jugador puede tener más de 127 trozos)
  ZONAS.forEach((z, i) => { for (let y = z.y; y < z.y + z.h; y++) for (let x = z.x; x < z.x + z.w; x++) { GRID[y * MW + x] = SUELO; ZONA_DE[y * MW + x] = i; } });
  // encima de cada suelo que acaba por arriba, la pared de frente (hasta 3 casillas de muro)
  for (let y = 1; y < MH; y++) for (let x = 0; x < MW; x++) {
    if (GRID[y * MW + x] !== SUELO || GRID[(y - 1) * MW + x] === SUELO) continue;
    for (let k = 1; k <= ALTO_CARA && y - k >= 0; k++) { const j = (y - k) * MW + x; if (GRID[j] !== VACIO) break; GRID[j] = CARA; ZONA_DE[j] = ZONA_DE[y * MW + x]; }
  }
  // las paredes de frente, agrupadas en tramos seguidos de la misma zona y altura: { zona, x0, x1, y0, y1 } en píxeles
  CARAS = [];
  let tramo = null;
  for (let y = 1; y < MH; y++) {
    for (let x = 0; x <= MW; x++) {
      const base = x < MW && GRID[y * MW + x] === SUELO && GRID[(y - 1) * MW + x] === CARA;
      let alto = 0; if (base) while (alto < ALTO_CARA && GRID[(y - 1 - alto) * MW + x] === CARA) alto++;
      const z = base ? ZONA_DE[y * MW + x] : -1;
      if (tramo && (!base || tramo.zi !== z || tramo.alto !== alto)) { tramo.x1 = x * CEL; CARAS.push(tramo); tramo = null; }
      if (base && !tramo) tramo = { zi: z, zona: ZONAS[z], alto, x0: x * CEL, y0: (y - alto) * CEL, y1: y * CEL };
    }
  }
}

// un mapa dibujado con letras: cada carácter es un cuadrado de `lado` casillas y cada letra dice qué sala es (`letras`: letra → { nombre,
// suelo, pared }); el espacio y # son muro. Sale la lista de salas en rectángulos (el mayor que quepa cada vez), con ids seguidos.
function salasDePlano(plano, letras, lado = 2) {
  const filas = plano.split('\n').filter(f => f.length), H = filas.length, W = Math.max(...filas.map(f => f.length));
  const en = (i, j) => (i < 0 || j < 0 || i >= W || j >= H ? '#' : filas[j][i] || '#'), hecho = new Uint8Array(W * H), salas = [];
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const L = en(i, j); if (L === '#' || L === ' ' || hecho[j * W + i] || !letras[L]) continue;
    let w = 1; while (en(i + w, j) === L && !hecho[j * W + i + w]) w++;
    let h = 1; while (j + h < H && [...Array(w).keys()].every(k => en(i + k, j + h) === L && !hecho[(j + h) * W + i + k])) h++;
    for (let b = 0; b < h; b++) for (let a = 0; a < w; a++) hecho[(j + b) * W + i + a] = 1;
    const n = salas.filter(s => s.letra === L).length + 1, d = letras[L];
    salas.push({ id: L + n, letra: L, nombre: d.nombre, x: i * lado, y: j * lado, w: w * lado, h: h * lado, suelo: d.suelo, pared: d.pared });
  }
  return salas;
}

// la lista de muebles de un mapa, escrita cómoda: pon('mesa', x, y, { v: 1 }) con x el centro e y la base (lo más cercano a la cámara)
function listaMuebles(f) { const lista = []; f((t, x, y, extra) => lista.push({ t, x, y, ...extra })); return lista; }
