// Fans of Jump · La partida guardada: récords, zanahorias, partidas, lo comprado en el puesto de Lola, lo visto, las órdenes de
// Microblizz y los ajustes, todo en un solo objeto (SAVE) que core sube a la nube (cuenta.js). En el código del juego se llama
// GUARDA (es el mismo objeto). La clave es AJUSTES.guardado (SAVE_KEY, la pone core/js/sistema/ligero.js).
'use strict';
const JUMP_NUEVA = () => ({ mejor: 0, mejorM: 0, zanas: 0, partidas: 0, rescatados: 0, pelaje: '#ffffff', capa: '#ff7a1a', tengo: {}, kit: {}, visto: {}, misiones: null, nivelMision: {}, efectos: 1, musica: 0.6, suave: false, menuMus: 'animales', tuto: false, anuncios: null, vibra: true, estela: 'arcoiris', reto: null, fantasma: null, name: '', marcaSubida: 0, mejorSeg: 0, piel: 'madera', finales: 0, ayuda: 0, regalo: null });
const SAVE = (() => {
  let s = null; try { s = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { s = null; }
  const n = JUMP_NUEVA();
  if (!s || typeof s !== 'object') return n;
  if (s.tuto === undefined && s.partidas > 0) s.tuto = true;   // quien ya jugaba antes del tutorial no lo ve solo
  for (const k in n) if (s[k] === undefined || s[k] === null) s[k] = n[k];
  return s;
})();
const GUARDA = SAVE;
function cargaGuarda() { /* ya está cargada (SAVE) */ }
function salvaGuarda() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch (e) { /* modo privado: no se guarda */ }
  if (typeof CUENTA !== 'undefined') CUENTA.cambio();
}
