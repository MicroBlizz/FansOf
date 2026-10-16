// Fans of Island · la partida guardada: niveles superados y el sonido, en un solo objeto (SAVE) que core sube a la nube (cuenta.js).
// Aquí están también los volúmenes que pide el motor de sonido de core.
'use strict';
const IS_NUEVA = () => ({ v: 1, niveles: {}, muted: false, musica: true });
const SAVE = (() => {
  let s = null; try { s = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { s = null; }
  const n = IS_NUEVA();
  if (!s || typeof s !== 'object') return n;
  for (const k in n) if (s[k] === undefined || s[k] === null) s[k] = n[k];
  return s;
})();
function isGuarda() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch (e) { /* sin almacenamiento: se juega igual */ } if (typeof CUENTA !== 'undefined') CUENTA.cambio(); }
function isBorraTodo() { const n = IS_NUEVA(); for (const k of Object.keys(SAVE)) delete SAVE[k]; Object.assign(SAVE, n); isGuarda(); }
function isNivelSuperado(id, seg, zanahorias = 0) {   // guarda la mejor marca de tiempo y la mayor cosecha de zanahorias pequeñas
  const r = SAVE.niveles[id] || { t: Infinity, z: 0 }; SAVE.niveles[id] = { t: Math.min(r.t, Math.round(seg * 10) / 10), z: Math.max(r.z || 0, zanahorias) }; isGuarda();
}
// lo que pide el motor de sonido de core
function sonidoApagado() { return !!SAVE.muted; }
function volGeneral() { return SAVE.muted ? 0 : 1; }
function volMusica() { return SAVE.musica === false ? 0 : 0.15; }
function musicUpdate() { /* la elige principal.js (isMusica) según la pantalla */ }
// la canción que debe sonar: la de la serie que toque (core/js/serie/canciones.js). Las cortas (win) suenan una vez
let IS_MUSICA = null;
function isMusica(n) { const T = n && TRACKS[n]; IS_MUSICA = T && T.once ? null : n; if (typeof AC !== 'undefined' && AC && M.bus) musicSet(n); }
function isVigilaMusica() { if (typeof AC === 'undefined' || !AC || !M.bus || (M.trk && M.trk.once)) return; if (M.name !== IS_MUSICA) musicSet(IS_MUSICA); }
