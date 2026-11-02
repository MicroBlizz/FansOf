// Fans of Shelter · Guardado: el récord de noches aguantadas, las partidas jugadas y los ajustes de sonido, en localStorage (SAVE_KEY, de js/ajustes.js).
'use strict';

const SAVE = {
  record: 0,       // más noches aguantadas en una partida
  bajasRecord: 0,  // más enemigos derrotados en una partida
  refugio: 1,      // el nivel de la madriguera (js/refugio.js): se queda entre partidas
  partidas: 0,
  musica: 1,       // 0 o 1
  efectos: 1,      // 0 o 1
};

function cargaGuarda() {
  try {
    const d = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
    for (const k in SAVE) if (k in d) SAVE[k] = d[k];
  } catch (e) { /* sin guardado: valores de fábrica */ }
}

function guarda() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch (e) { /* almacenamiento lleno o bloqueado */ }
  if (typeof CUENTA !== 'undefined' && CUENTA.cambio) CUENTA.cambio();
}
