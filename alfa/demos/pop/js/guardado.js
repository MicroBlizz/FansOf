// Fans of Pop · la partida guardada: el récord (salas superadas), las victorias, los slimes vistos y el sonido.
// El camino a medias se guarda en `run` (ppGuardaCamino en partida.js) y los tutoriales de Lola ya vistos en `tuto`.
'use strict';
const PP_NUEVA = () => ({ v: 1, record: 0, victorias: 0, partidas: 0, vistos: {}, estrellas: 0, muted: false, ayuda: false, tuto: {}, run: null, pixel: false });
const SAVE = (() => {
  let s = null; try { s = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { s = null; }
  const n = PP_NUEVA();
  if (!s || typeof s !== 'object') return n;
  for (const k in n) if (s[k] === undefined) s[k] = n[k];
  return s;
})();
function ppGuarda() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch (e) { /* sin almacenamiento: se juega igual */ } if (typeof CUENTA !== 'undefined') CUENTA.cambio(); }
// lo que pide el motor de sonido de core
function sonidoApagado() { return !!SAVE.muted; }
function volGeneral() { return SAVE.muted ? 0 : 1; }
function volMusica() { return SAVE.muted ? 0 : 0.15; }
function musicUpdate() { /* la música la elige ppMusica (js/sonidos.js) */ }
