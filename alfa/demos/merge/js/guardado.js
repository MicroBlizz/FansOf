// Fans of Merge · la partida guardada: el récord, las piezas descubiertas (la colección), el sonido y si ya vio la ayuda,
// todo en un solo objeto (SAVE) que core sube a la nube (cuenta.js). Aquí están también los volúmenes que pide sonido.js.
'use strict';
const MG_NUEVA = () => ({ v: 1, record: 0, partidas: 0, coleccion: {}, muted: false, musica: true, ayuda: false });
const SAVE = (() => {
  let s = null; try { s = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { s = null; }
  const n = MG_NUEVA();
  if (!s || typeof s !== 'object') return n;
  for (const k in n) if (s[k] === undefined || s[k] === null) s[k] = n[k];
  return s;
})();
function mgGuarda() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch (e) { /* sin almacenamiento: se juega igual */ } if (typeof CUENTA !== 'undefined') CUENTA.cambio(); }
function mgBorraTodo() { const n = MG_NUEVA(); for (const k of Object.keys(SAVE)) delete SAVE[k]; Object.assign(SAVE, n); mgGuarda(); }
// lo que pide el motor de sonido de core
function sonidoApagado() { return !!SAVE.muted; }
function volGeneral() { return SAVE.muted ? 0 : 1; }
function volMusica() { return SAVE.musica === false ? 0 : 0.15; }
function musicUpdate() { /* la música la elige mgMusica (js/sonidos.js) */ }
// apunta una pieza nueva en la colección; devuelve true si es la primera vez que la ve
function mgDescubre(tipo) { if (SAVE.coleccion[tipo]) return false; SAVE.coleccion[tipo] = 1; return true; }
