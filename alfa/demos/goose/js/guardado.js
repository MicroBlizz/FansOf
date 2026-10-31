// Fans of Goose · Guardado: el récord, las monedas, las mejoras de la tienda y el sonido, en localStorage (clave SAVE_KEY).
'use strict';

const SAVE = {
  mejorCasilla: 0,   // la casilla más alta a la que se ha llegado
  mejorBajas: 0,     // más ocas eliminadas en una partida
  victorias: 0,
  partidas: 0,
  monedas: 0,
  mejoras: {},       // { vida: 2, fuerza: 1, ... } las de la tienda
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
  menuMus: 'nomuertos',   // la canción a la que vuelve el motor tras un jingle
};

function cargaGuarda() {
  try {
    const d = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
    for (const k in SAVE) if (k in d && k !== 'menuMus') SAVE[k] = d[k];
  } catch (e) { /* sin guardado: valores de fábrica */ }
}

function guarda() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch (e) { /* sin sitio: da igual */ }
  if (typeof CUENTA !== 'undefined' && CUENTA.cambio) try { CUENTA.cambio(); } catch (e) { /* sin cuenta */ }
}

const nivelMejora = id => SAVE.mejoras[id] || 0;
