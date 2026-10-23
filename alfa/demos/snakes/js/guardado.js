// Fans of Snakes · Guardado: el récord, las monedas, el sonido y el control elegido, en localStorage (clave SAVE_KEY, de js/ajustes.js).
'use strict';

const SAVE = {
  record: 0,       // mejor puntuación
  monedas: 0,      // las que da la Demolición (todavía no se gastan en nada)
  partidas: 0,
  musica: 1,       // 0 o 1
  efectos: 1,      // 0 o 1
  control: 'toques',   // cómo se gira con el dedo: 'toques' | 'palanca' | 'deslizar' (se elige en Opciones)
  menuMus: 'menu', // la canción a la que vuelve el motor de la serie al acabar una corta (ganar o perder)
};

function cargaGuarda() {
  try {
    const d = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
    for (const k in SAVE) if (k in d && k !== 'menuMus') SAVE[k] = d[k];
  } catch (e) { /* sin guardado: valores de fábrica */ }
}

function guarda() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch (e) { /* almacenamiento lleno o bloqueado */ }
}
