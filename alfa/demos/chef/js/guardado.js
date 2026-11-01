// Fans of Chef · Guardado: el oro, el día de la campaña, el récord y los ajustes de sonido, en localStorage (SAVE_KEY, de js/ajustes.js).
'use strict';

const SAVE = {
  oro: 0,          // el oro ganado en la cantina (lo gastarán las mejoras)
  dia: 1,          // la jornada que toca
  recordDia: 0,    // la jornada más lejana a la que se ha llegado
  platos: 0,       // platos servidos en total
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
