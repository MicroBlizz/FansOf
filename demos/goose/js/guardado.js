// Fans of Goose · Guardado: el récord, las monedas, las mejoras de la tienda y el sonido, en localStorage (clave SAVE_KEY).
// Desde la 0.10.0 las mejoras de combate son DE CADA PERSONAJE (SAVE.mejorasPers, las marcadas con propia: true en CFG.tienda) y
// las demás valen para todos (SAVE.mejoras). SAVE.v es la versión del guardado: una partida de una versión anterior se descarta
// (31-10-2026, Daniel: «resetea todo, es alfa»), salvo las opciones de sonido y el personaje elegido.
'use strict';

const SAVE_V = 2;   // súbelo para reiniciar a todos los jugadores (se quedan solo las opciones)
const SAVE = {
  v: SAVE_V,
  mejorCasilla: 0,   // la casilla más alta a la que se ha llegado
  mejorBajas: 0,     // más ocas eliminadas en una partida
  victorias: 0,
  partidas: 0,
  monedas: 0,
  mejoras: {},       // { codicia: 2, retiro: 1, ... } las de la tienda que valen para todos
  mejorasPers: {},   // { rojo: { vida: 3, fuerza: 1 }, verde: {...} } las propias de cada personaje
  musica: 1, efectos: 1,
  vibrar: 1,
  personaje: 'rojo',   // el elegido en el selector (js/personajes.js)
  noche: 1, nocheMax: 1,   // la Escalera de Noches (js/noches.js): la elegida y la más alta abierta
  desafios: {}, ganadoCon: [], peligros: 0,   // los desafíos cumplidos y con qué personajes has ganado (js/desafios.js)
  diario: null,   // el Tablero del día: { dia, mejor, casilla, intentos }
  aspecto: null,
  activo: {},        // el nivel puesto de la Maldición y la Horda (js/maldicion.js)
  autoElegir: 1,     // la Elección automática encendida (si se ha comprado)   // capas y farolillos comprados y puestos (js/aspecto.js)
  huevos: 0, sinAnuncios: 0, compras: null,   // los huevos de oro, «Sin anuncios» y lo comprado con euros (js/monetiza.js)
  pase: null,      // el Camino de la Oca de esta temporada (js/pase.js)
  tuto: {},        // las lecciones de la Oca Parca ya vistas (js/tutorial.js)
  menuMus: 'nomuertos',   // la canción a la que vuelve el motor tras un jingle
};

function cargaGuarda() {
  try {
    const d = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
    const vieja = Object.keys(d).length && (d.v || 1) < SAVE_V;   // un guardado de antes del reinicio: solo se quedan las opciones
    for (const k in SAVE) if (k in d && k !== 'menuMus' && k !== 'v' && (!vieja || k === 'musica' || k === 'efectos' || k === 'vibrar' || k === 'personaje')) SAVE[k] = d[k];
  } catch (e) { /* sin guardado: valores de fábrica */ }
}

function guarda() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch (e) { /* sin sitio: da igual */ }
  if (typeof CUENTA !== 'undefined' && CUENTA.cambio) try { CUENTA.cambio(); } catch (e) { /* sin cuenta */ }
}

// el nivel de una mejora de la tienda: las propias se miran en el personaje de la partida (o el elegido en el selector)
const mejoraPropia = id => CFG.tienda.some(m => m.id === id && m.propia);
const persMejoras = () => (typeof JUEGO !== 'undefined' && JUEGO.pers && JUEGO.pers.id) || SAVE.personaje || 'rojo';
const mejorasDe = pid => SAVE.mejorasPers[pid] || (SAVE.mejorasPers[pid] = {});
const nivelMejora = (id, pid) => (mejoraPropia(id) ? mejorasDe(pid || persMejoras())[id] : SAVE.mejoras[id]) || 0;   // pid: la tienda mira al personaje que enseña
function ponMejora(id, n, pid) { if (mejoraPropia(id)) mejorasDe(pid || persMejoras())[id] = n; else SAVE.mejoras[id] = n; }
