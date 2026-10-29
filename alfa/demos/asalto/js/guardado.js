// Fans of Asalto · La partida guardada (SAVE, core la sube a la nube): las plumas (la moneda de fuera de la partida), el equipo puesto
// y la mochila, los contadores de los logros y cuáles se han cobrado, las zonas terminadas, el mejor nivel, el sonido y los consejos
// vistos. La partida en curso NO se guarda: cada bajada a la mazmorra empieza de cero.
'use strict';
const AS_NUEVA = () => ({ v: 2, plumas: 0, mejor: 0, partidas: 0, equipo: {}, mochila: [], zonas: [], logros: {},
  stats: { oroTotal: 0, enemigos: 0, jefes: 0, maxEquipo: 0, maxClase: {}, zonas: [] }, consejos: {}, muted: false, musica: true });
const SAVE = (() => {
  let s = null; try { s = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { s = null; }
  const n = AS_NUEVA();
  if (!s || typeof s !== 'object') return n;
  if (s.gemas && !s.plumas) s.plumas = s.gemas;   // la partida de la versión anterior llamaba gemas a las plumas
  for (const k in n) if (s[k] === undefined || s[k] === null) s[k] = n[k];
  for (const k in n.stats) if (s.stats[k] === undefined) s.stats[k] = n.stats[k];
  return s;
})();
function asGuarda() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch (e) { /* sin almacenamiento: se juega igual */ } if (typeof CUENTA !== 'undefined') CUENTA.cambio(); }
function asBorraTodo() { const n = AS_NUEVA(); for (const k of Object.keys(SAVE)) delete SAVE[k]; Object.assign(SAVE, n); asGuarda(); }
// lo que pide el motor de sonido de core
function sonidoApagado() { return !!SAVE.muted; }
function volGeneral() { return SAVE.muted ? 0 : 1; }
function volMusica() { return SAVE.musica === false ? 0 : 0.15; }
function musicUpdate() { /* la música la elige asMusica (js/sonidos.js) */ }

/* ---------- el equipo: objetos, estadísticas y plumas ---------- */
let AS_OBJ_ID = 0;
// un objeto nuevo al azar para un hueco (o cualquiera), de una rareza (0 normal, 1 raro, 2 épico)
function asObjetoNuevo(rareza, hueco) {
  const E = AS_EQUIPO, h = hueco || pick(E.huecos), stat = pick(E.porHueco[h]), r = E.rarezas[rareza], v = r.valor;
  return { id: 'o' + Date.now().toString(36) + (AS_OBJ_ID++), hueco: h, stat, valor: v[0] + Math.floor(Math.random() * (v[1] - v[0] + 1)), rareza, nivel: 0 };
}
// la suma de lo puesto: { vida: 5, ataque: 2, … } en %
function asStatsEquipo() {
  const s = {}; for (const k in AS_EQUIPO.stats) s[k] = 0;
  for (const h of AS_EQUIPO.huecos) { const o = SAVE.equipo[h]; if (o) s[o.stat] += o.valor + o.nivel; }
  return s;
}
function asPonerObjeto(o) {
  const antes = SAVE.equipo[o.hueco];
  SAVE.mochila = SAVE.mochila.filter(x => x.id !== o.id);
  if (antes) SAVE.mochila.push(antes);
  SAVE.equipo[o.hueco] = o; asGuarda();
}
function asQuitarObjeto(hueco) {
  const o = SAVE.equipo[hueco]; if (!o) return false;
  if (SAVE.mochila.length >= AS_EQUIPO.mochila) return false;
  delete SAVE.equipo[hueco]; SAVE.mochila.push(o); asGuarda(); return true;
}
function asDesencantar(o) {
  SAVE.mochila = SAVE.mochila.filter(x => x.id !== o.id);
  for (const h of AS_EQUIPO.huecos) if (SAVE.equipo[h] && SAVE.equipo[h].id === o.id) delete SAVE.equipo[h];
  SAVE.plumas += AS_EQUIPO.desencantar(o.rareza); asGuarda();
}
// mete objetos en la mochila; los que no caben se deshacen en plumas. Devuelve cuántos no cupieron.
function asGuardaObjetos(lista) {
  let fuera = 0;
  for (const o of lista) { if (SAVE.mochila.length < AS_EQUIPO.mochila) SAVE.mochila.push(o); else { SAVE.plumas += AS_EQUIPO.desencantar(o.rareza); fuera++; } }
  asGuarda(); return fuera;
}
// los logros que se pueden cobrar ahora
function asLogrosPendientes() { return AS_LOGROS.filter(l => !SAVE.logros[l.id] && l.cond(SAVE.stats)); }
function asApuntaStat(k, v) { SAVE.stats[k] = (SAVE.stats[k] || 0) + v; }
