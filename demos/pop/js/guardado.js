// Fans of Pop · la partida guardada: el récord (salas superadas), las victorias, los slimes vistos y el sonido.
// La ruta a medias no se guarda todavía (una ruta dura 10 minutos; de momento, se empieza de cero al volver).
'use strict';
const PP_NUEVA = () => ({ v: 1, record: 0, victorias: 0, partidas: 0, vistos: {}, muted: false, ayuda: false });
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
function volMusica() { return 0; }
function musicUpdate() { /* sin música en el prototipo */ }
