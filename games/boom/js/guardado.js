// Fans of Boom · GUARDADO: lo poco que se recuerda en este navegador (sonido, tipo de control y la última partida preparada) y los
// volúmenes que pide el motor de sonido de core. Con cuenta, core la sube a la nube (CUENTA.cambio).
'use strict';
const BM_NUEVA = () => ({ v: 1, vol: 1, mus: 0.5, control: 'botones', ultima: null, puntos: 1000 });
const BM_VOL = VOLUMEN.crear({ musicaBase: 0.3 });   // la mezcla del juego: lo que suena la música con la barra a la mitad, por dos
const SAVE = (() => {
  let s = null; try { s = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { s = null; }
  const n = BM_NUEVA();
  if (!s || typeof s !== 'object') return n;
  for (const k in n) if (s[k] === undefined) s[k] = n[k];
  return BM_VOL.migra(s);
})();
function bmGuarda() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch (e) { /* sin almacenamiento: se juega igual */ } if (typeof CUENTA !== 'undefined') CUENTA.cambio(); }
// lo que pide el motor de sonido de core
function sonidoApagado() { return BM_VOL.apagado(SAVE); }
function volGeneral() { return BM_VOL.general(SAVE); }
function volMusica() { return BM_VOL.musica(SAVE); }
function musicUpdate() { /* de momento sin música propia */ }
