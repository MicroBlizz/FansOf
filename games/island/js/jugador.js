// Fans of Island · CRAZYBUNNY, el adaptador: lleva los mandos (ent) al dominio (dominio/jugador.js) y hace lo que el dominio avisa con
// eventos: el sonido del salto, el marcador, la vibración y el final al perder la última vida.
'use strict';
function efectosDaño() {
  actualizaHud(); play('womp');
  try { if (navigator.vibrate) navigator.vibrate(30); } catch (e) { /* sin vibración: se juega igual */ }
  if (J.vidas <= 0) acaba(false);
}
function pasoJugador(dt) {
  leeControles();
  for (const e of IS.Jugador.paso(J, ent, dt, IS.fisica)) {
    if (e === 'salto') play('jump');
    else if (e === 'daño') efectosDaño();
  }
}
const poseJugador = () => IS.Jugador.pose(J);
function rebota() { IS.Jugador.rebota(J, ent.salto); play('pop'); }   // tras pisar a alguien
function golpeado(dx) { if (IS.Jugador.golpeado(J, dx)) efectosDaño(); }
