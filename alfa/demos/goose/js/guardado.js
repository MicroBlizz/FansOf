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
