// Fans of Snakes · Azar: lo que decide el juego (dónde sale la manzana, qué cartas y qué locuras) pasa por azar(). Normalmente es
// Math.random; en el Reto diario lleva una SEMILLA (la fecha) y sale la misma secuencia para todo el mundo. Los adornos (chispas,
// temblor) siguen con Math.random: no cambian la partida.
'use strict';

let SEMILLA = null;
function siembra(texto) {   // null = azar de verdad
  if (texto === null) { SEMILLA = null; return; }
  let h = 1779033703 ^ texto.length;
  for (let i = 0; i < texto.length; i++) { h = Math.imul(h ^ texto.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  SEMILLA = h >>> 0;
}
function azar() {
  if (SEMILLA === null) return Math.random();
  SEMILLA = (SEMILLA + 0x6D2B79F5) >>> 0;   // mulberry32
  let t = SEMILLA; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const azarEntero = n => Math.floor(azar() * n);

// el día de hoy en España (el del reto diario y las misiones), como '2026-10-23'
function hoy() {
  try { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); }
  catch (e) { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
}
