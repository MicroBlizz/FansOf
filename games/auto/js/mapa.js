// Fans of Auto · EL BARRIO: el Distrito Beta Abierta es una cuadrícula de casillas de 16 píxeles. Las calles (dos carriles,
// uno por sentido) separan manzanas de 8 × 8 casillas con una acera alrededor y edificios con altura en medio. Aquí se monta
// el plano una sola vez (con semilla, así siempre sale el mismo barrio), se marca el carril de cada casilla de calle para el
// tráfico y se colocan los sitios con nombre: el Templo del Autoguardado, la Torre de Granizo Corp., el taller, etc.
'use strict';

const T = 16;                  // píxeles por casilla
const TIPO = { CALLE: 0, ACERA: 1, EDIFICIO: 2, HIERBA: 3, ARBOL: 4, SOLAR: 5 };   // SOLAR = asfalto por el que se puede ir (aparcamientos, taller)
const ZONA = { animales: 0, granizo: 1, extractores: 2 };
const ZONA_NOMBRE = ['Los Animales Locos', 'Granizo Corp.', 'Los Extractores'];
const ZONA_COLOR = ['#5cbf4a', '#4aa3df', '#e9c46a'];

// las calles: pares de columnas y de filas (la primera y la última cierran el barrio en un anillo)
const COLS = [0, 10, 20, 30, 40, 50], FILAS = [0, 10, 20, 30, 40];
const MAPA = { W: 52, H: 42, tipo: null, zona: null, edif: null, carril: null, edificios: [], telefonos: [], lugares: {}, arboles: [], cruces: [] };

// los estilos de fachada: tejado, pared y ventana (el GTA de la primera PlayStation era de día, colores lavados)
const ESTILOS = [
  { tejado: '#8a8378', pared: '#9a9183', ventana: '#3c4a5c' },
  { tejado: '#7d6f62', pared: '#9c8673', ventana: '#2e3e4e' },
  { tejado: '#6f7d6a', pared: '#8a9a82', ventana: '#2d3b48' },
  { tejado: '#8c7a7a', pared: '#a88c86', ventana: '#3a3a4e' },
  { tejado: '#6c6f7d', pared: '#8d93a6', ventana: '#2a3240' },
  { tejado: '#9a8c6a', pared: '#b8a884', ventana: '#3c4452' },
];

function enMapa(tx, ty) { return tx >= 0 && ty >= 0 && tx < MAPA.W && ty < MAPA.H; }
function tipoEn(tx, ty) { return enMapa(tx, ty) ? MAPA.tipo[ty * MAPA.W + tx] : TIPO.EDIFICIO; }
function zonaEn(tx, ty) { return enMapa(tx, ty) ? MAPA.zona[ty * MAPA.W + tx] : 0; }
// se puede pisar (a pie) / se puede pasar en coche
function pisable(tx, ty) { const t = tipoEn(tx, ty); return t !== TIPO.EDIFICIO && t !== TIPO.ARBOL; }
function solidoPx(x, y) { return !pisable(Math.floor(x / T), Math.floor(y / T)); }
function calleEn(tx, ty) { const t = tipoEn(tx, ty); return t === TIPO.CALLE || t === TIPO.SOLAR; }
function pon(tx, ty, t) { if (enMapa(tx, ty)) MAPA.tipo[ty * MAPA.W + tx] = t; }
function rellena(x, y, w, h, t) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) pon(i, j, t); }

// un edificio: casillas (x, y, w, h), altura en plantas y estilo; nombre y rótulo son para los sitios especiales
function edificio(x, y, w, h, alt, estilo, extra = {}) {
  const e = Object.assign({ x, y, w, h, alt, estilo, nombre: null, rotulo: null, tejado: null }, extra);
  e.id = MAPA.edificios.length;
  MAPA.edificios.push(e);
  rellena(x, y, w, h, TIPO.EDIFICIO);
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (enMapa(i, j)) MAPA.edif[j * MAPA.W + i] = e.id;
  return e;
}
function arbol(tx, ty) { pon(tx, ty, TIPO.ARBOL); MAPA.arboles.push({ x: tx * T + T / 2, y: ty * T + T / 2 }); }

function creaMapa() {
  const az = Azar(20261015);
  const n = MAPA.W * MAPA.H;
  MAPA.tipo = new Uint8Array(n).fill(TIPO.ACERA);
  MAPA.zona = new Uint8Array(n);
  MAPA.edif = new Int16Array(n).fill(-1);
  MAPA.carril = new Int8Array(n * 2);   // (dx, dy) del carril de cada casilla de calle; (0,0) en los cruces
  // las zonas de cada banda: oeste los Animales Locos, nordeste Granizo, sudeste los Extractores
  for (let y = 0; y < MAPA.H; y++) for (let x = 0; x < MAPA.W; x++) MAPA.zona[y * MAPA.W + x] = x < 21 ? ZONA.animales : (y < 21 ? ZONA.granizo : ZONA.extractores);
  // calles
  for (const c of COLS) rellena(c, 0, 2, MAPA.H, TIPO.CALLE);
  for (const f of FILAS) rellena(0, f, MAPA.W, 2, TIPO.CALLE);
  // carriles (se conduce por la derecha): columna oeste baja, este sube; fila norte va al oeste, sur al este
  for (let y = 0; y < MAPA.H; y++) for (let x = 0; x < MAPA.W; x++) {
    if (tipoEn(x, y) !== TIPO.CALLE) continue;
    const enCol = COLS.some(c => x === c || x === c + 1), enFila = FILAS.some(f => y === f || y === f + 1);
    let dx = 0, dy = 0;
    if (enCol && !enFila) dy = COLS.includes(x) ? 1 : -1;
    else if (enFila && !enCol) dx = FILAS.includes(y) ? -1 : 1;
    MAPA.carril[(y * MAPA.W + x) * 2] = dx; MAPA.carril[(y * MAPA.W + x) * 2 + 1] = dy;
  }
  // los cruces (origen de cada cuadrado de 2 × 2) y sus salidas
  for (const c of COLS) for (const f of FILAS) {
    const sal = [];
    if (tipoEn(c + 1, f - 1) === TIPO.CALLE) sal.push({ d: [0, -1], x: c + 1, y: f - 1 });   // norte: carril este, hacia arriba
    if (tipoEn(c, f + 2) === TIPO.CALLE) sal.push({ d: [0, 1], x: c, y: f + 2 });           // sur: carril oeste, hacia abajo
    if (tipoEn(c + 2, f + 1) === TIPO.CALLE) sal.push({ d: [1, 0], x: c + 2, y: f + 1 });   // este: carril sur
    if (tipoEn(c - 1, f) === TIPO.CALLE) sal.push({ d: [-1, 0], x: c - 1, y: f });          // oeste: carril norte
    MAPA.cruces.push({ x: c, y: f, salidas: sal });
  }
  // manzanas: (bx, by) de 0..4 × 0..3; el interior construible va de (COLS[bx]+3, FILAS[by]+3) y mide 6 × 6
  const manzana = (bx, by) => ({ x: COLS[bx] + 3, y: FILAS[by] + 3, w: 6, h: 6 });
  const estilo = () => az.entero(0, ESTILOS.length - 1);
  // sitios con nombre
  const sitios = {};
  // (0,1) Parque Gashapón: hierba y árboles
  { const m = manzana(0, 1); rellena(m.x - 1, m.y - 1, 8, 8, TIPO.HIERBA); for (let i = 0; i < 9; i++) arbol(m.x + az.entero(0, 5), m.y + az.entero(0, 5)); MAPA.lugares.parque = { x: (m.x + 3) * T, y: (m.y + 3) * T, nombre: 'Parque Gashapón' }; }
  // (1,2) Templo del Autoguardado: edificio 4 × 4 con hierba alrededor; se guarda en la puerta de abajo
  { const m = manzana(1, 2); rellena(m.x - 1, m.y - 1, 8, 8, TIPO.HIERBA); edificio(m.x + 1, m.y, 4, 4, 3, 5, { nombre: 'Templo del Autoguardado', rotulo: 'TEMPLO', tejado: 'templo' }); MAPA.lugares.templo = { x: (m.x + 3) * T, y: (m.y + 5) * T, nombre: 'Templo del Autoguardado', r: 14 }; }
  // (2,0) Torre de Granizo Corp.: la más alta
  { const m = manzana(2, 0); edificio(m.x, m.y, 6, 6, 7, 4, { nombre: 'Torre Granizo Corp.', rotulo: 'GRANIZO', tejado: 'granizo' }); MAPA.lugares.torre = { x: (m.x + 3) * T, y: (m.y + 6.5) * T, nombre: 'Torre Granizo Corp.', r: 16 }; }
  // (4,0) Comisaría de los Moderadores: blanca, baja; aquí vuelves si te banean
  { const m = manzana(4, 0); edificio(m.x, m.y + 1, 6, 4, 2, 0, { nombre: 'Comisaría de Moderadores', rotulo: 'MODS', tejado: 'comisaria' }); MAPA.lugares.comisaria = { x: (m.x + 3) * T, y: (m.y + 6.5) * T, nombre: 'Comisaría' }; }
  // (2,2) Taller de Pintura Día Uno: un edificio bajo con un patio de asfalto al que se entra en coche
  { const m = manzana(2, 2); rellena(m.x - 1, m.y - 1, 8, 8, TIPO.SOLAR); edificio(m.x, m.y, 6, 2, 1, 3, { nombre: 'Taller Pintura Día Uno', rotulo: 'PINTURA', tejado: 'taller' }); MAPA.lugares.taller = { x: (m.x + 3) * T, y: (m.y + 4) * T, nombre: 'Taller Pintura Día Uno', r: 22 }; }
  // (4,3) Punto de Extracción: una explanada con una marca
  { const m = manzana(4, 3); rellena(m.x - 1, m.y - 1, 8, 8, TIPO.SOLAR); MAPA.lugares.extraccion = { x: (m.x + 3) * T, y: (m.y + 3) * T, nombre: 'Punto de Extracción', r: 24 }; }
  // (3,1) Centro comercial Cajas de Botín: ancho y bajo
  { const m = manzana(3, 1); edificio(m.x, m.y, 6, 5, 2, 1, { nombre: 'Cajas de Botín', rotulo: 'CAJAS DE BOTÍN', tejado: 'cajas' }); MAPA.lugares.cajas = { x: (m.x + 3) * T, y: (m.y + 6.5) * T, nombre: 'Cajas de Botín', r: 16 }; }
  // (1,0) y (3,2): aparcamientos
  for (const [bx, by] of [[1, 0], [3, 2]]) { const m = manzana(bx, by); rellena(m.x - 1, m.y - 1, 8, 8, TIPO.SOLAR); MAPA.lugares['aparcamiento' + bx] = { x: (m.x + 3) * T, y: (m.y + 3) * T }; }
  // (0,3) Guarida de los Animales Locos: la heladería
  { const m = manzana(0, 3); edificio(m.x, m.y + 1, 6, 4, 2, 2, { nombre: 'Heladería Animal', rotulo: 'HELADOS', tejado: 'helados' }); MAPA.lugares.heladeria = { x: (m.x + 3) * T, y: (m.y + 6.5) * T, nombre: 'Heladería Animal', r: 16 }; }
  // el resto: edificios al azar
  const usados = new Set(['0,1', '1,2', '2,0', '4,0', '2,2', '4,3', '3,1', '1,0', '3,2', '0,3']);
  for (let by = 0; by < 4; by++) for (let bx = 0; bx < 5; bx++) {
    if (usados.has(bx + ',' + by)) continue;
    const m = manzana(bx, by), forma = az.entero(0, 3);
    if (forma === 0) edificio(m.x, m.y, 6, 6, az.entero(2, 5), estilo());
    else if (forma === 1) { edificio(m.x, m.y, 6, 3, az.entero(1, 4), estilo()); edificio(m.x, m.y + 3, 6, 3, az.entero(1, 4), estilo()); }
    else if (forma === 2) { edificio(m.x, m.y, 3, 6, az.entero(1, 4), estilo()); edificio(m.x + 3, m.y, 3, 6, az.entero(2, 5), estilo()); }
    else { for (const [i, j] of [[0, 0], [3, 0], [0, 3], [3, 3]]) edificio(m.x + i, m.y + j, 3, 3, az.entero(1, 4), estilo()); }
  }
  // los rótulos de broma en los tejados de algunos edificios normales
  const bromas = ['PARCHE DÍA UNO', 'ACCESO ANTICIPADO', 'PASE DE BATALLA', 'REMASTER', 'BETA ABIERTA', 'DLC'];
  for (const e of MAPA.edificios) if (!e.nombre && e.w >= 6 && az() < 0.6) e.rotulo = az.elige(bromas);
  // teléfonos de misión (en la acera, uno por banda)
  MAPA.telefonos = [
    { banda: ZONA.animales, x: 12 * T + 8, y: 12 * T + 8 },
    { banda: ZONA.granizo, x: 29 * T + 8, y: 12 * T + 8 },
    { banda: ZONA.extractores, x: 39 * T + 8, y: 32 * T + 8 },
  ];
  // objetos por el suelo (vida, dinero, sobornos) en aceras
  MAPA.objetos = [];
  const tipos = ['vida', 'dinero', 'soborno', 'dinero', 'vida', 'dinero', 'soborno', 'dinero', 'vida', 'dinero'];
  let k = 0;
  for (let by = 0; by < 4; by++) for (let bx = 0; bx < 5; bx++) {
    if (az() < 0.5) { const m = manzana(bx, by); MAPA.objetos.push({ tipo: tipos[k++ % tipos.length], x: (m.x - 1) * T + 8 + az.entero(0, 5) * T, y: (m.y - 1) * T + 8 }); }
  }
  MAPA.semilla = az.semilla();
}
