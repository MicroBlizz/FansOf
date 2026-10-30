// Fans of Swipe · la partida guardada: el récord (piso más alto), las victorias, las reliquias descubiertas, el sonido y,
// si hay una subida a medias, la subida entera (se guarda después de CADA carta, así se puede cerrar la app cuando quieras).
'use strict';
const SW_NUEVA = () => ({ v: 1, record: 0, victorias: 0, partidas: 0, vistas: {}, muted: false, musica: true, ayuda: false, run: null,
  acto2: false, gemas: 0, atajoDia: '' });   // acto2: ya ganaste al CEO; gemas y atajoDia: js/monetiza.js
const SAVE = (() => {
  let s = null; try { s = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { s = null; }
  const n = SW_NUEVA();
  if (!s || typeof s !== 'object') return n;
  for (const k in n) if (s[k] === undefined) s[k] = n[k];
  return s;
})();
function swGuarda() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch (e) { /* sin almacenamiento: se juega igual */ } if (typeof CUENTA !== 'undefined') CUENTA.cambio(); }
function swBorraTodo() { const n = SW_NUEVA(); for (const k of Object.keys(SAVE)) delete SAVE[k]; Object.assign(SAVE, n); swGuarda(); }
// lo que pide el motor de sonido de core
function sonidoApagado() { return !!SAVE.muted; }
function volGeneral() { return SAVE.muted ? 0 : 1; }
function volMusica() { return SAVE.musica === false ? 0 : 0.15; }
function musicUpdate() { /* la música la elige swMusica (js/sonidos.js) */ }
