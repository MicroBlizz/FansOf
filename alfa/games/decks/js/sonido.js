// Fans Of Decks · SONIDO: volumen guardado en este navegador y qué canción suena en cada momento. El motor y las canciones son de core
// (core/js/sistema/sonido.js y core/js/serie/canciones.js): aquí solo los ganchos que pide y la elección de canción.
'use strict';
const DC_SON_CLAVE = 'decks-sonido';
const DC_SON = (() => {   // la música empieza al 50 % (lo guardado manda)
  let s = null; try { s = JSON.parse(localStorage.getItem(DC_SON_CLAVE) || 'null'); } catch (e) { s = null; }
  return Object.assign({ mudo: false, vol: 0.8, mus: 0.5 }, s || {});
})();
function dcSonGuarda() { try { localStorage.setItem(DC_SON_CLAVE, JSON.stringify(DC_SON)); } catch (e) { /* sin almacenamiento: vale hasta cerrar la pestaña */ } applyVolume(); }
function sonidoApagado() { return DC_SON.mudo; }
function volGeneral() { return DC_SON.mudo ? 0 : 0.55 * DC_SON.vol; }
function volMusica() { return 0.7 * DC_SON.mus; }

// Menús y agenda: la del menú. En una reunión: la de la facción del líder; con un jefe o un minijefe en la sala, la de jefe.
function dcMusicaDeseada() {
  const C = DCC.C, sala = document.getElementById('dc-combate');
  if (!C || !sala || sala.hidden) return 'menu';
  if (C.rivales.some(r => r.hp > 0 && DC_RIVALES[r.id] && (DC_RIVALES[r.id].jefe || DC_RIVALES[r.id].mini))) return 'boss';
  const L = DCP.run && DC_LIDERES[DCP.run.lider];
  return L && TRACKS[L.faccion] ? L.faccion : 'animales';
}
let dcMusicaQue = null;
setInterval(() => {
  if (!AC || !M.bus) return;   // hasta el primer toque no hay audio; se vuelve a intentar
  const q = dcMusicaDeseada(); if (q === dcMusicaQue) return;
  dcMusicaQue = q; musicSet(q);
}, 250);
