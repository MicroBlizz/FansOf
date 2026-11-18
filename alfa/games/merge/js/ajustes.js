// Fans of Merge · AJUSTES: el nombre de la demo para core, la clave de su partida y TODA la calibración del juego
// (las piezas y su cadena, los puntos, cuánto sale cada pieza, las cartas de habilidad y los eventos). Se carga antes de lo común.
'use strict';
const AJUSTES = {
  id: 'merge',                 // para core: la partida en la nube lleva este nombre
  guardado: 'fansof-merge',    // la clave de la partida en este navegador (récord, colección y sonido)
};

// Las piezas. sig = en qué se convierten 3 iguales (null = no se juntan). pts = puntos al crearla. tipo: 'pieza' normal, 'zorro' y
// 'cuervo' se mueven, 'semilla' es el comodín, 'topo' quita una pieza, 'cofre' se abre tocándolo.
const MG_PIEZAS = {
  brote:      { nombre: 'Brote',           sig: 'zanahoria', pts: 5,     col: '#8fdc5a' },
  zanahoria:  { nombre: 'Zanahoria',       sig: 'huerto',    pts: 20,    col: '#ff9a3c' },
  huerto:     { nombre: 'Huerto',          sig: 'casita',    pts: 100,   col: '#c98a4b' },
  casita:     { nombre: 'Casita',          sig: 'madriguera', pts: 400,  col: '#e8b56a' },
  madriguera: { nombre: 'Madriguera',      sig: 'torre',     pts: 1500,  col: '#7fbf5f' },
  torre:      { nombre: 'Torre zanahoria', sig: 'palacio',   pts: 5000,  col: '#ff7b2e' },
  palacio:    { nombre: 'Palacio',         sig: 'flotante',  pts: 20000, col: '#ffd34d' },
  flotante:   { nombre: 'Palacio flotante', sig: null,       pts: 80000, col: '#7fd8ff' },
  dormido:    { nombre: 'Zorro dormido',   sig: 'cueva',     pts: 0,     col: '#d9774a' },
  cueva:      { nombre: 'Cueva',           sig: 'cofre',     pts: 800,   col: '#8d8a7e' },
  piedra:     { nombre: 'Piedra',          sig: 'roca',      pts: 0,     col: '#a7a9ad' },
  roca:       { nombre: 'Roca',            sig: 'cofre',     pts: 600,   col: '#7d8087' },
  cofre:      { nombre: 'Cofre',           sig: null,        pts: 3000,  col: '#ffc531', tipo: 'cofre' },
  zorro:      { nombre: 'Zorro',           sig: null,        pts: 0,     col: '#ff6a2b', tipo: 'zorro' },
  cuervo:     { nombre: 'Cuervo',          sig: null,        pts: 0,     col: '#40405a', tipo: 'cuervo' },
  semilla:    { nombre: 'Semilla mágica',  sig: null,        pts: 0,     col: '#ff7ad9', tipo: 'semilla' },
  topo:       { nombre: 'Topo',            sig: null,        pts: 0,     col: '#b0784f', tipo: 'topo' },
};
// La cadena principal, en orden (para la colección y para saber qué vale más)
const MG_CADENA = ['brote', 'zanahoria', 'huerto', 'casita', 'madriguera', 'torre', 'palacio', 'flotante'];

const MG_CFG = {
  lado: 6,              // casillas por lado
  minimo: 3,            // cuántas iguales hacen falta para juntarlas
  superDesde: 4,        // con tantas o más sale la versión dorada, que vale el doble
  // cuánto sale cada pieza (pesos: no hace falta que sumen 100)
  pesos: { brote: 60, zanahoria: 15, zorro: 13, cuervo: 2, semilla: 3, topo: 3, huerto: 2.4, casita: 0.6 },
  cofre: [1500, 4000],  // puntos al abrir un cofre (entre estos dos)
  cargaHabilidad: 10,   // fusiones para ganar una carga del Rayo zanahoria
  cargasMax: 2,
  eventoCada: 14,       // cada cuántos turnos llega un evento
  eventoDura: 3,        // cuántos turnos dura
  lluviaCasillas: 4,    // casillas mojadas (x2) en la lluvia y la tormenta
  camino: 1.5,          // multiplicador de puntos de lo que se crea sobre el camino de tierra
  reservaEspera: 2,     // turnos que hay que esperar tras usar la reserva (con la carta Mercader, 0)
};

// Las cartas de habilidad: al empezar salen 3 al azar y el jugador se queda con una.
const MG_CARTAS = [
  { id: 'tirachinas', nombre: 'Tirachinas', texto: 'Una vez por partida: quita la pieza que quieras.', col: '#ff8a3d' },
  { id: 'encantador', nombre: 'Encantador', texto: 'Los zorros y cuervos solo se mueven un turno de cada dos.', col: '#4fb8ff' },
  { id: 'bolsillo',   nombre: 'Bolsillo doble', texto: 'Dos huecos de reserva en vez de uno.', col: '#59c96b' },
  { id: 'abono',      nombre: 'Abono', texto: 'Cada 12 turnos te llega una semilla mágica.', col: '#ff6fb1' },
  { id: 'espanta',    nombre: 'Espantapájaros', texto: 'No salen cuervos.', col: '#e6b52e' },
  { id: 'cosecha',    nombre: 'Gran cosecha', texto: '+25 % de puntos en todas las fusiones.', col: '#ffb02e' },
  { id: 'mercader',   nombre: 'Mercader', texto: 'Usa la reserva sin esperar turnos.', col: '#3fb07a' },
  { id: 'lince',      nombre: 'Vista de lince', texto: 'Ves también la pieza que viene después.', col: '#3fd1c4' },
];

// Los eventos del tablero: cada MG_CFG.eventoCada turnos llega uno al azar.
const MG_EVENTOS = [
  { id: 'lluvia', nombre: 'Lluvia', texto: 'Las casillas mojadas dan el doble de puntos.' },
  { id: 'tormenta', nombre: 'Tormenta', texto: 'Casillas x2 y un relámpago por turno sobre una pieza pequeña.' },
  { id: 'siesta', nombre: 'Siesta', texto: 'Los zorros y cuervos no se mueven.' },
  { id: 'regalo', nombre: 'Regalo de CrazyBunny', texto: 'Tu próxima pieza es una semilla mágica.' },
];
