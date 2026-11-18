// Fans of Panic · Guardado: fichas, estrellas por nivel, galería destapada, vidas y ajustes, en localStorage (clave SAVE_KEY, de js/ajustes.js).
'use strict';

const SAVE = {
  fichas: 0,         // la moneda del juego: llaves, seguir tras perder, potenciadores
  estrellas: {},     // por nivel: { 'playa-1': 3, ... }
  galeria: {},       // ilustraciones destapadas: { 'playa-1': 1 } (1 = con menos de 3 estrellas, 2 = a pantalla completa)
  llaves: ['playa'], // mundos abiertos
  vidas: 5, vidaT: 0,// corazones y cuándo (ms) toca el siguiente
  musica: 1, efectos: 1,
  vibra: 1,
  tutorial: 0,       // 1 cuando ya se ha jugado el primer nivel con consejos
  partidas: 0,
  record: 0,         // mejor puntuación de un nivel
};

function cargaGuarda() {
  try {
    const d = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
    for (const k in SAVE) if (k in d) SAVE[k] = d[k];
  } catch (e) { /* sin guardado: valores de fábrica */ }
  recuperaVidas();
}

function guarda() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch (e) { /* almacenamiento lleno o bloqueado */ }
  if (typeof CUENTA !== 'undefined') CUENTA.cambio();   // la partida en la nube (core)
}

// los corazones vuelven solos, uno cada AJUSTES.vidaCada segundos
function recuperaVidas() {
  const ahora = Date.now();
  if (SAVE.vidas >= AJUSTES.vidas) { SAVE.vidaT = 0; return; }
  if (!SAVE.vidaT) { SAVE.vidaT = ahora + AJUSTES.vidaCada * 1000; return; }
  while (SAVE.vidas < AJUSTES.vidas && SAVE.vidaT <= ahora) { SAVE.vidas++; SAVE.vidaT += AJUSTES.vidaCada * 1000; }
  if (SAVE.vidas >= AJUSTES.vidas) SAVE.vidaT = 0;
}

function gastaVida() {
  recuperaVidas();
  if (SAVE.vidas <= 0) return false;
  if (SAVE.vidas === AJUSTES.vidas) SAVE.vidaT = Date.now() + AJUSTES.vidaCada * 1000;
  SAVE.vidas--; guarda();
  return true;
}

// segundos hasta el siguiente corazón (0 si están todos)
function segundosVida() { recuperaVidas(); return SAVE.vidaT ? Math.max(0, Math.ceil((SAVE.vidaT - Date.now()) / 1000)) : 0; }

const idNivel = (mundo, n) => `${mundo}-${n}`;
const estrellasDe = (mundo, n) => SAVE.estrellas[idNivel(mundo, n)] || 0;
const estrellasMundo = m => MUNDOS[m].niveles.reduce((s, _, i) => s + estrellasDe(m, i + 1), 0);
