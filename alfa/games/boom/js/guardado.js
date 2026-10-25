// Fans of Boom · GUARDADO: lo poco que se recuerda en este navegador (sonido, tipo de control y la última partida preparada) y los
// volúmenes que pide el motor de sonido de core. De momento no se sube a la nube: la fase 0 es solo jugar en el aparato.
'use strict';
const BM_NUEVA = () => ({ v: 1, muted: false, musica: true, control: 'botones', ultima: null, puntos: 1000 });
const SAVE = (() => {
  let s = null; try { s = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { s = null; }
  const n = BM_NUEVA();
  if (!s || typeof s !== 'object') return n;
  for (const k in n) if (s[k] === undefined) s[k] = n[k];
  return s;
})();
function bmGuarda() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch (e) { /* sin almacenamiento: se juega igual */ } }
// lo que pide el motor de sonido de core
function sonidoApagado() { return !!SAVE.muted; }
function volGeneral() { return SAVE.muted ? 0 : 1; }
function volMusica() { return SAVE.musica === false ? 0 : 0.15; }
function musicUpdate() { /* de momento sin música propia */ }
