// Fans of Island · la partida guardada (SAVE): por ahora solo el silencio, que core sube a la nube (cuenta.js).
// Aquí están también los volúmenes que pide el motor de sonido de core (core/js/sistema/sonido.js).
'use strict';
const SAVE = (() => {
  let s = null; try { s = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { s = null; }
  return (s && typeof s === 'object') ? Object.assign({ v: 1, muted: false }, s) : { v: 1, muted: false };
})();
function isGuarda() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch (e) { /* sin almacenamiento: se juega igual */ }
  if (typeof CUENTA !== 'undefined') CUENTA.cambio();
}
// lo que pide el motor de sonido de core
function sonidoApagado() { return !!SAVE.muted; }
function volGeneral() { return SAVE.muted ? 0 : 0.8; }
function volMusica() { return 0.6; }
function musicUpdate() { /* la canción la elige principal.js al empezar y al acabar */ }
