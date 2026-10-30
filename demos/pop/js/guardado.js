// Fans of Pop · la partida guardada: el récord (salas superadas), las victorias, los slimes vistos, el sonido y, desde la fase 2,
// los corazones, las monedas, los huecos comprados y el récord de estrellas de cada nivel.
// El camino a medias se guarda en `run` (ppGuardaCamino en partida.js) y los tutoriales de Lola ya vistos en `tuto`.
'use strict';
const PP_NUEVA = () => ({ v: 1, record: 0, victorias: 0, partidas: 0, vistos: {}, estrellas: 0, muted: false, ayuda: false, tuto: {}, run: null, pixel: false,
  vidas: 5, vidaT: 0, monedas: 0, huecos: 0, mejor: {}, cofres: 0, dentro: false,
  perlas: 0, anuncioDia: '', anunciosHoy: 0,                                                    // fase 3: la moneda de pago y los anuncios del día (js/tienda.js)
  duelo: { gan: 0, per: 0, fallo: 0.45, dia: '', hoy: 0 },                                    // el duelo contra el CEO (js/duelo.js)
  memoria: { record: 0, partidas: 0, dia: '', hoy: 0 } });                                       // el modo Memoria (js/memoria.js): récord y mejor ronda de hoy                                   // fase 2: corazones, monedas, huecos y cofres (js/monedero.js)
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
function volMusica() { return SAVE.muted ? 0 : 0.15; }
function musicUpdate() { /* la música la elige ppMusica (js/sonidos.js) */ }
