// Fans of Basement · Rankings (adaptador, servidor/115-basement-ranking.sql y 116-basement-retos.sql): el del Legacy (la planta más
// honda del Código Legacy de 2004 de cada cuenta), el del DESAFÍO DEL DÍA y el del EVENTO DE LA SEMANA (la mejor bajada de cada
// cuenta en esa clave). Las marcas se suben al terminar la bajada, con la cuenta de invitado de core, sin pedir nada; si no hay red,
// al arrancar o al volver la conexión. Aquí también salen las claves del día y de la semana (hora de España), porque llevan reloj.
// La pantalla está en retos-ui.js (pestaña RANKING de la ventana de misiones). En el ranking solo sale tu apodo y tu marca.
'use strict';
const BAS_RANKING = { tab: 'legacy', datos: {}, cargando: false, error: false };
const basHayRanking = () => typeof CUENTA !== 'undefined' && CUENTA.activa;
const LEGACY = 25;

// las claves: 'd-AAAA-MM-DD' (hoy) y 's-AAAA-MM-DD' (el lunes de esta semana), en hora de España
const basDiaEspana = (d) => (d || new Date()).toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });
function basClaveDia() { return 'd-' + basDiaEspana(); }
function basClaveSemana() {
  const [a, m, d] = basDiaEspana().split('-').map(Number), f = new Date(Date.UTC(a, m - 1, d)), atras = (f.getUTCDay() + 6) % 7;
  return 's-' + new Date(Date.UTC(a, m - 1, d - atras)).toISOString().slice(0, 10);
}
// la temporada del pase: bloques de 4 semanas desde el lunes 2 de noviembre de 2026 ('t-' y el lunes en que empieza)
function basClaveTemporada() {
  const [a, m, d] = basDiaEspana().split('-').map(Number), hoy = Date.UTC(a, m - 1, d), base = Date.UTC(2026, 10, 2), dia = 86400000;
  return 't-' + new Date(base + Math.floor((hoy - base) / (28 * dia)) * 28 * dia).toISOString().slice(0, 10);
}
const basClaveDe = (tab) => (tab === 'hoy' ? basClaveDia() : tab === 'semana' ? basClaveSemana() : null);

// ---------- Legacy ----------
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
    .then(() => { m.subida = true; basGuarda(); BAS_RANKING.datos.legacy = null; })
    .catch((e) => { if (/marca_imposible/.test(String(e && (e.message || e)))) { m.subida = true; basGuarda(); } else console.warn('Basement: no se sube la marca', e); });
}

// ---------- desafío y evento ----------
// tras una bajada de un modo: la mejor de esa clave se apunta (SAVE.retosModo) y se sube
function basRetoBajada(clave, r) {
  const antes = (SAVE.retosModo || {})[clave];
  if (antes && (antes.planta > r.planta || (antes.planta === r.planta && antes.bajas >= r.bajas))) return;
  const quedan = Object.entries(SAVE.retosModo || {}).filter(([k]) => k === basClaveDia() || k === basClaveSemana());   // solo las de ahora
  SAVE.retosModo = { ...Object.fromEntries(quedan), [clave]: { planta: r.planta, bajas: r.bajas, segundos: Math.max(1, r.segundos || 1), subida: false } };
  basGuarda();
  basSubeReto(clave);
}
function basSubeReto(clave) {
  const m = (SAVE.retosModo || {})[clave];
  if (!basHayRanking() || !m || m.subida) return;
  CUENTA.rpc('basement_reto_marca', { p_clave: clave, p_planta: m.planta, p_bajas: m.bajas, p_segundos: m.segundos })
    .then(() => { m.subida = true; basGuarda(); BAS_RANKING.datos[clave[0] === 'd' ? 'hoy' : 'semana'] = null; })
    .catch((e) => { if (/marca_imposible|clave_no_vale/.test(String(e && (e.message || e)))) { m.subida = true; basGuarda(); } else console.warn('Basement: no se sube el reto', e); });
}

// al arrancar (y al volver la red): lo que quedó sin subir
function basSubePendiente() { basSubeMarca(); for (const k of Object.keys(SAVE.retosModo || {})) basSubeReto(k); }
window.addEventListener('online', () => setTimeout(basSubePendiente, 1500));
window.addEventListener('load', () => setTimeout(basSubePendiente, 4000));

// tab = 'legacy' | 'hoy' | 'semana'
function basCargaRanking(tab) {
  const t = tab || BAS_RANKING.tab;
  if (!basHayRanking() || BAS_RANKING.cargando) return;
  Object.assign(BAS_RANKING, { tab: t, cargando: true, error: false });
  (t === 'legacy' ? CUENTA.rpc('basement_ranking', {}) : CUENTA.rpc('basement_reto_ranking', { p_clave: basClaveDe(t) }))
    .then((d) => { BAS_RANKING.datos[t] = d || { lista: [], yo: null, total: 0 }; })
    .catch((e) => { BAS_RANKING.error = true; console.warn('Basement: no se carga el ranking', e); })
    .finally(() => { BAS_RANKING.cargando = false; });
}
