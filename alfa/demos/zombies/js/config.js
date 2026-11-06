// Fans of Zombies · CONFIGURACIÓN DE ESTE NAVEGADOR (adaptador): el nombre del juego para core, el sonido y la calidad (AJUSTES) y lo
// poco que se guarda (SAVE): la última ficha (animal y dificultad) y tus mejores marcas. Las partidas aún no se guardan (ver la
// ficha del juego, «Pendiente»). Se carga antes de lo común (NUCLEO.juego, en index.html).
'use strict';
const AJUSTES = { id: 'zombies', guardado: 'forzom-partida', mudo: false, sinMusica: false, calidad: 'auto' };
try { Object.assign(AJUSTES, JSON.parse(localStorage.getItem('forzom-ajustes') || '{}')); } catch (_) { /* sin guardar: se juega igual */ }
function guardaAjustes() { try { localStorage.setItem('forzom-ajustes', JSON.stringify({ mudo: AJUSTES.mudo, sinMusica: AJUSTES.sinMusica, calidad: AJUSTES.calidad })); } catch (_) { /* sin guardar: se juega igual */ } }

function partidaNueva() { return { v: 1, animal: 'bunny', dificultad: 'superviviente', partidas: 0, mejor: { min: 0, bajas: 0 } }; }
const SAVE = (() => { let s = null; try { s = JSON.parse(localStorage.getItem(AJUSTES.guardado) || 'null'); } catch (_) { s = null; } return s && s.v === 1 ? Object.assign(partidaNueva(), s) : partidaNueva(); })();
function guardaPartida() {
  try { localStorage.setItem(AJUSTES.guardado, JSON.stringify(SAVE)); } catch (_) { /* sin guardar: se juega igual */ }
  if (typeof CUENTA !== 'undefined') CUENTA.cambio();
}
// core pregunta si se está jugando (para no interrumpir con avisos de la cuenta)
window.enPartida = () => typeof JUEGO !== 'undefined' && !!JUEGO.e && !JUEGO.e.muerto;
