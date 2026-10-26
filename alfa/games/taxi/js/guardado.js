// Fans Of Taxi · GUARDADO: lo que se recuerda en este navegador: dinero, récords de cada evento, sonido. Con cuenta, core la sube a la nube
// (CUENTA.cambio). Los volúmenes que pide el motor de sonido de core están abajo.
'use strict';
const TX_NUEVA = () => ({ v: 1, muted: false, musica: true, dinero: 0, records: {}, viajes: 0, derribos: 0 });
const SAVE = (() => {
  let s = null; try { s = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { s = null; }
  const n = TX_NUEVA();
  if (!s || typeof s !== 'object') return n;
  for (const k in n) if (s[k] === undefined) s[k] = n[k];
  return s;
})();
function txGuarda() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch (e) { /* sin almacenamiento: se juega igual */ } if (typeof CUENTA !== 'undefined') CUENTA.cambio(); }
function txRecord(clave, valor) { const antes = SAVE.records[clave] || 0; if (valor > antes) { SAVE.records[clave] = valor; txGuarda(); return true; } return false; }
// lo que pide el motor de sonido de core
function sonidoApagado() { return !!SAVE.muted; }
function volGeneral() { return SAVE.muted ? 0 : 1; }
function volMusica() { return SAVE.musica === false ? 0 : 0.5; }
function musicUpdate() { /* sin música propia todavía */ }
function enPartida() { return typeof EVENTOS !== 'undefined' && !!EVENTOS.activo; }
