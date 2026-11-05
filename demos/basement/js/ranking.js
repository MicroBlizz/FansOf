// Fans of Basement · Ranking del Legacy (adaptador, servidor/115-basement-ranking.sql): la planta más honda del Código Legacy de
// 2004 de cada cuenta. Tu marca se sube al terminar una bajada que llega al Legacy (desde la planta 25) con récord, con la cuenta
// de invitado de core, sin pedir nada; si no hay red, al arrancar o al volver la conexión. La pantalla está en retos-ui.js
// (pestaña RANKING de la ventana de misiones). En el ranking solo sale tu apodo y tu planta.
'use strict';
const BAS_RANKING = { datos: null, cargando: false, error: false };
const basHayRanking = () => typeof CUENTA !== 'undefined' && CUENTA.activa;
const LEGACY = 25;

// tras una bajada: si llegó al Legacy y es tu mejor marca, se apunta y se sube
function basRankingBajada(r) {
  if (!(r.planta >= LEGACY) || r.planta <= (SAVE.marca && SAVE.marca.planta || 0)) return;
  SAVE.marca = { planta: r.planta, inicio: r.inicio || 0, segundos: Math.max(1, r.segundos || 1), subida: false };
  basGuarda();
  basSubeMarca();
}
function basSubeMarca() {
  const m = SAVE.marca;
  if (!basHayRanking() || !m || m.subida) return;
  CUENTA.rpc('basement_marca', { p_planta: m.planta, p_inicio: m.inicio, p_segundos: m.segundos })
    .then(() => { m.subida = true; basGuarda(); BAS_RANKING.datos = null; })
    .catch((e) => { if (/marca_imposible/.test(String(e && (e.message || e)))) { m.subida = true; basGuarda(); } else console.warn('Basement: no se sube la marca', e); });
}
window.addEventListener('online', () => setTimeout(basSubeMarca, 1500));
window.addEventListener('load', () => setTimeout(basSubeMarca, 4000));   // al arrancar, lo que quedó sin subir

function basCargaRanking() {
  if (!basHayRanking() || BAS_RANKING.cargando) return;
  Object.assign(BAS_RANKING, { cargando: true, error: false });
  CUENTA.rpc('basement_ranking', {})
    .then((d) => { BAS_RANKING.datos = d || { lista: [], yo: null, total: 0 }; })
    .catch((e) => { BAS_RANKING.error = true; console.warn('Basement: no se carga el ranking', e); })
    .finally(() => { BAS_RANKING.cargando = false; });
}
