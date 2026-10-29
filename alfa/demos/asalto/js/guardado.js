// Fans of Asalto · La partida guardada: el mejor piso, las gemas, las partidas, el sonido y los consejos ya vistos, todo en un objeto
// (SAVE) que core sube a la nube (cuenta.js). La partida en curso NO se guarda: cada bajada a la mazmorra empieza de cero.
'use strict';
const AS_NUEVA = () => ({ v: 1, gemas: 0, mejor: 0, partidas: 0, victorias: 0, consejos: {}, muted: false, musica: true });
const SAVE = (() => {
  let s = null; try { s = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { s = null; }
  const n = AS_NUEVA();
  if (!s || typeof s !== 'object') return n;
  for (const k in n) if (s[k] === undefined || s[k] === null) s[k] = n[k];
  return s;
})();
function asGuarda() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch (e) { /* sin almacenamiento: se juega igual */ } if (typeof CUENTA !== 'undefined') CUENTA.cambio(); }
function asBorraTodo() { const n = AS_NUEVA(); for (const k of Object.keys(SAVE)) delete SAVE[k]; Object.assign(SAVE, n); asGuarda(); }
// lo que pide el motor de sonido de core
function sonidoApagado() { return !!SAVE.muted; }
function volGeneral() { return SAVE.muted ? 0 : 1; }
function volMusica() { return SAVE.musica === false ? 0 : 0.15; }
function musicUpdate() { /* la música la elige asMusica (js/sonidos.js) */ }
