// Fans of Cooking · GUARDADO: lo que se recuerda en este navegador: estrellas y mejor puntuación por nivel, cocineros elegidos, modo, sonido.
// Con cuenta, core la sube a la nube (CUENTA.cambio). Los volúmenes que pide el motor de sonido de core están abajo.
'use strict';
const CK_NUEVA = () => ({ v: 1, muted: false, musica: true, niveles: {}, cocineros: ['bunny', 'skeleton'], modo: 'solo', nombres: ['', ''], visto: false });
const SAVE = (() => {
  let s = null; try { s = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { s = null; }
  const n = CK_NUEVA();
  if (!s || typeof s !== 'object') return n;
  for (const k in n) if (s[k] === undefined) s[k] = n[k];
  return s;
})();
function ckGuarda() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch (e) { /* sin almacenamiento: se juega igual */ } if (typeof CUENTA !== 'undefined') CUENTA.cambio(); }
// estrellas de un nivel, del rango entero y de toda la campaña
const estrellasDe = id => (SAVE.niveles[id] && SAVE.niveles[id].e) || 0;
const estrellasRango = ri => RANGOS[ri].niveles.reduce((s, n) => s + estrellasDe(n.id), 0);
const estrellasTotal = () => RANGOS.reduce((s, r, i) => s + estrellasRango(i), 0);
// un nivel se abre con una estrella en el anterior; un rango nuevo, con al menos la mitad de las estrellas del anterior
function nivelAbierto(n) {
  if (n.ni > 0) return estrellasDe(RANGOS[n.ri].niveles[n.ni - 1].id) > 0;
  if (n.ri === 0) return true;
  const ant = RANGOS[n.ri - 1]; return estrellasRango(n.ri - 1) >= Math.ceil(ant.niveles.length * 3 / 2) || (typeof NUCLEO !== 'undefined' && NUCLEO.desarrollo && SAVE.todo);
}
const cocineroAbierto = c => estrellasTotal() >= c.estrellas;
function apuntaResultado(id, puntos, estrellas) {
  const r = SAVE.niveles[id] || { e: 0, p: 0 }; const nuevo = estrellas > r.e; r.e = Math.max(r.e, estrellas); r.p = Math.max(r.p, puntos); SAVE.niveles[id] = r; ckGuarda(); return nuevo;
}
// lo que pide el motor de sonido de core
function sonidoApagado() { return !!SAVE.muted; }
function volGeneral() { return SAVE.muted ? 0 : 1; }
function volMusica() { return SAVE.musica === false ? 0 : 0.5; }
function musicUpdate() { /* la música la pone cada pantalla con musicSet */ }
