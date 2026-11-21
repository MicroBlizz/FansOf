// Fans of Island · adaptadores/guardado: la partida guardada (SAVE): por ahora solo el silencio, que core sube a la nube (cuenta.js).
// Core pide por su nombre SAVE y los cuatro ganchos del motor de sonido (core/js/sistema/sonido.js): son las únicas globales propias del
// juego, además de IS y AJUSTES. Lo demás cuelga de IS.Guardado: silenciado(), alternaSilencio() y guarda().
'use strict';
const SAVE = (() => {
  let s = null; try { s = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { s = null; }
  return (s && typeof s === 'object') ? Object.assign({ v: 1, muted: false }, s) : { v: 1, muted: false };
})();
// lo que pide el motor de sonido de core
function sonidoApagado() { return !!SAVE.muted; }
function volGeneral() { return SAVE.muted ? 0 : 0.8; }
function volMusica() { return 0.6; }
function musicUpdate() { /* la canción la elige el arranque (principal.js) al empezar y al acabar */ }
{
  function guarda() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch (e) { /* sin almacenamiento: se juega igual */ }
    if (typeof CUENTA !== 'undefined') CUENTA.cambio();
  }
  const silenciado = () => !!SAVE.muted;
  const alternaSilencio = () => { SAVE.muted = !SAVE.muted; guarda(); };
  IS.Guardado = Object.freeze({ silenciado, alternaSilencio, guarda });
}
