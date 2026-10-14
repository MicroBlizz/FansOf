// Fans of Crush · la partida guardada: niveles superados (estrellas y récord), oro, potenciadores, el maletín de estrellas, el sonido
// y los consejos ya vistos, todo en un solo objeto (SAVE) que core sube a la nube (cuenta.js). Aquí están también los volúmenes que pide sonido.js.
'use strict';
const CR_NUEVA = () => ({ v: 1, niveles: {}, oro: 0, potes: { martillo: 3, cafe: 1, mezcla: 2 }, maletin: 0, muted: false, musica: true, vistos: {} });
const SAVE = (() => {
  let s = null; try { s = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { s = null; }
  const n = CR_NUEVA();
  if (!s || typeof s !== 'object') return n;
  for (const k in n) if (s[k] === undefined || s[k] === null) s[k] = n[k];
  for (const k in n.potes) if (typeof s.potes[k] !== 'number') s.potes[k] = n.potes[k];
  return s;
})();
function crGuarda() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch (e) { /* sin almacenamiento: se juega igual */ } if (typeof CUENTA !== 'undefined') CUENTA.cambio(); }
function crBorraTodo() { const n = CR_NUEVA(); for (const k of Object.keys(SAVE)) delete SAVE[k]; Object.assign(SAVE, n); crGuarda(); }
// lo que pide el motor de sonido de core
function sonidoApagado() { return !!SAVE.muted; }
function volGeneral() { return SAVE.muted ? 0 : 1; }
function volMusica() { return SAVE.musica === false ? 0 : 0.3; }
function musicUpdate() { /* la música la elige crMusica (js/sonidos.js) */ }
// lo que se consulta a menudo
const crEstrellasDe = id => (SAVE.niveles[id] && SAVE.niveles[id].e) || 0;
const crEstrellasTotal = () => Object.values(SAVE.niveles).reduce((a, n) => a + (n.e || 0), 0);
const crAbierto = id => id === 1 || crEstrellasDe(id - 1) > 0;
function crSiguienteNivel() { for (const N of CR_NIVELES) if (!crEstrellasDe(N.id)) return N.id; return CR_NIVELES[CR_NIVELES.length - 1].id; }
const CR_MALETIN = 10;   // estrellas para abrir un maletín de bonus
