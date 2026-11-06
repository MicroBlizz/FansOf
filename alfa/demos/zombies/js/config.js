// Fans of Zombies · CONFIGURACIÓN DE ESTE NAVEGADOR (adaptador): el nombre del juego para core, el sonido (AJUSTES), lo que se guarda en
// la nube con la cuenta (SAVE: la última ficha y tus mejores marcas) y la partida en curso, que va aparte en este navegador
// ('forzom-mundo', ver js/guardado.js) porque pesa más. Se carga antes de lo común (NUCLEO.juego, en index.html).
'use strict';
const AJUSTES = { id: 'zombies', guardado: 'forzom-partida', mudo: false, sinMusica: false, calidad: 'auto' };
try { Object.assign(AJUSTES, JSON.parse(localStorage.getItem('forzom-ajustes') || '{}')); } catch (_) { /* sin guardar: se juega igual */ }
function guardaAjustes() { try { localStorage.setItem('forzom-ajustes', JSON.stringify({ mudo: AJUSTES.mudo, sinMusica: AJUSTES.sinMusica, calidad: AJUSTES.calidad })); } catch (_) { /* sin guardar: se juega igual */ } }

function partidaNueva() { return { v: 1, animal: 'bunny', dificultad: 'superviviente', partidas: 0, mejor: { min: 0, bajas: 0 }, tutoHecho: false }; }
const SAVE = (() => { let s = null; try { s = JSON.parse(localStorage.getItem(AJUSTES.guardado) || 'null'); } catch (_) { s = null; } return s && s.v === 1 ? Object.assign(partidaNueva(), s) : partidaNueva(); })();
function guardaPartida() {
  try { localStorage.setItem(AJUSTES.guardado, JSON.stringify(SAVE)); } catch (_) { /* sin guardar: se juega igual */ }
  if (typeof CUENTA !== 'undefined') CUENTA.cambio();
}
// la partida en curso: leer, guardar y borrar (al morir)
const CLAVE_MUNDO = 'forzom-mundo';
function leeMundo() { try { return JSON.parse(localStorage.getItem(CLAVE_MUNDO) || 'null'); } catch (_) { return null; } }
function guardaMundo(e) { try { localStorage.setItem(CLAVE_MUNDO, JSON.stringify(ZOM.serializa(e))); return true; } catch (_) { return false; } }
function borraMundo() { try { localStorage.removeItem(CLAVE_MUNDO); } catch (_) { /* nada que borrar */ } }
// core pregunta si se está jugando (para no interrumpir con avisos de la cuenta)
window.enPartida = () => typeof JUEGO !== 'undefined' && !!JUEGO.e && !JUEGO.e.muerto;
