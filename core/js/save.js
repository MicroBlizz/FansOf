// Fans Of · Guardado en el navegador. El sistema es común; la partida guardada es de cada juego (AJUSTES.guardado),
// así que el oro, las gemas, los niveles y el inventario de un juego no se mezclan con los de otro.
'use strict';
const SAVE_KEY = AJUSTES.guardado;
function loadSave() { try { const o = JSON.parse(localStorage.getItem(SAVE_KEY)); if (o && o.v === 1) return metaDefaults(o); } catch (e) { /* sin almacenamiento */ } return metaDefaults({ v: 1, stars: {}, muted: false }); }
let SAVE = loadSave();
function saveGame() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch (e) { /* el progreso vive en memoria */ } }
