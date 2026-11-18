// Fans of Roguelite · Lo que se guarda en el móvil (localStorage): las monedas de La Madriguera, las mejoras compradas, los
// mundos abiertos, los récords, los niveles de despido, los retos cumplidos, lo que ya has visto (para la colección), los
// consejos de Lola ya leídos y la partida a medias, para poder continuarla.
// Cada juego de la serie guarda lo suyo: esto no toca las partidas de Fans of Rumble ni de los demás.
'use strict';

const CLAVE_GUARDA = 'fansof-roguelite';
const GUARDA_NUEVA = () => ({ monedas: 0, mejoras: {}, abierto: 0, record: [0, 0, 0], victorias: [0, 0, 0], partidas: 0, vistos: { h: [], o: [], e: [] }, consejos: {}, chatOff: false, vel: 1, run: null,
  nivelMax: [1, 1, 1], nivelElegido: 1, ganadoNivel: [0, 0, 0], retos: {}, zanas: 0 });   // ganadoNivel: el nivel de despido más alto ganado en cada mundo (0 = ninguno)   // nivel de despido abierto por mundo y el elegido, retos cumplidos y Zanahorazos en total
const GUARDA = GUARDA_NUEVA();

function cargaGuarda() {
  try {
    const d = JSON.parse(localStorage.getItem(CLAVE_GUARDA) || 'null');
    if (d && typeof d === 'object') {
      Object.assign(GUARDA, GUARDA_NUEVA(), d);
      GUARDA.vistos = Object.assign({ h: [], o: [], e: [] }, d.vistos || {});
      GUARDA.consejos = Object.assign({}, d.consejos || {});
      GUARDA.retos = Object.assign({}, d.retos || {});
      GUARDA.nivelMax = [0, 1, 2].map(i => Math.max(1, (d.nivelMax || [])[i] || 1));
      // partidas guardadas de antes: si ganaste un mundo, cuenta como ganado el nivel anterior al que tienes abierto
      GUARDA.ganadoNivel = [0, 1, 2].map(i => (d.ganadoNivel || [])[i] || ((GUARDA.victorias[i] || 0) > 0 ? Math.max(1, GUARDA.nivelMax[i] - 1) : 0));
    }
  } catch (e) { /* sin guardar: se juega igual */ }
}
function guarda() { try { localStorage.setItem(CLAVE_GUARDA, JSON.stringify(GUARDA)); } catch (e) { /* sin guardar */ } }
function marcaVisto(tipo, id) { const l = GUARDA.vistos[tipo]; if (l && !l.includes(id)) { l.push(id); guarda(); } }
function borraTodo() { Object.assign(GUARDA, GUARDA_NUEVA()); guarda(); }
