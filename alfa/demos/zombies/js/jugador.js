// Fans of Zombies · MOVERSE (dominio): andar, correr y agacharse (cada paso hace su ruido y deja huellas en la nieve), el aguante que
// gasta correr y se recupera al ir despacio, y cambiar de arma. Golpear, disparar y empujar están en js/combate.js.
// La entrada llega ya leída: { mx, mz (dirección, -1 a 1), corre, agacha, apunta (ángulo), ataca, empuja, arma }.
'use strict';
var ZOM = globalThis.ZOM || (globalThis.ZOM = {});
(function (Z) {
  Z.pasoJugador = function (AJ, e, dt, ent, mundo) {
    const J = e.jugador;
    if (J.duerme) return;
    if (ent.agacha) J.agacha = !J.agacha;
    if (ent.arma && AJ.armas[ent.arma]) {
      if (Z.lleva(J, ent.arma)) J.arma = ent.arma; else e.eventos.push({ tipo: 'noPuedes', codigo: 'sinArma' });
    }
    if (ent.apunta != null) J.a = ent.apunta;
    const m = Math.hypot(ent.mx, ent.mz);
    J.corre = !!ent.corre && m > 0 && !J.registra && J.aguante > 0 && !J.agotado;
    if (J.corre) J.agacha = false;
    if (m > 0) anda(AJ, e, dt, ent, m, mundo);
    pasoAguante(AJ, e, dt);
    J.tArma -= dt;
    if (J.registra) return;
    if (ent.empuja && J.tArma <= 0) Z.empuja(AJ, e, mundo);
    else if (ent.ataca && J.tArma <= 0) Z.ataca(AJ, e, mundo);
  };
  // el aguante: correr lo gasta; andando o quieto se recupera. A cero, «agotado» hasta recuperar un poco (no corres y golpeas peor)
  function pasoAguante(AJ, e, dt) {
    const G = AJ.aguante, J = e.jugador, gasta = G.correr * Z.correrRopa(AJ, J, Z.estacion(AJ, e.min));   // el chándal y el barro (js/equipo.js)
    J.aguante = Math.max(0, Math.min(G.max, J.aguante + (J.corre ? -gasta : G.recupera) * dt));
    if (J.aguante <= 0) J.agotado = true;
    else if (J.agotado && J.aguante >= G.salir) J.agotado = false;
  }
  function anda(AJ, e, dt, ent, m, mundo) {
    const J = e.jugador, P = AJ.jugador;
    if (J.registra) J.registra = null;                            // moverte corta el registro (y clavar tablas)
    if (J.clava) J.clava = null;
    if (J.desmonta) J.desmonta = null;
    const vel = (J.corre ? P.corre : J.agacha ? P.agacha : P.vel) * (J.A.vel || 1) * (J.sueno <= 0 ? 0.7 : 1) * Z.velMochila(AJ, J) * Z.velHeridas(AJ, J);   // la mochila de mudanza pesa; las piernas heridas, también
    const x0 = J.x, z0 = J.z;
    mundo.mueve(J, ent.mx / m * vel * dt, ent.mz / m * vel * dt, P.radio);
    J.andado += Z.dist(x0, z0, J.x, J.z);
    if (J.andado < P.pasoHuella) return;
    J.andado = 0;
    if (!J.agacha) Z.haceRuido(AJ, e, J.x, J.z, (J.corre ? AJ.ruido.correr : AJ.ruido.andar) * (J.A.ruido || 1) * Z.menos(AJ, J, 'sigilo', 'ruido') * Z.pasosEstacion(AJ, e) * Z.pasosRopa(AJ, J), 'jugador');
    else if (hayFanSinVerte(AJ, e)) Z.ganaXp(AJ, e, 'sigilo', 'paso');   // el sigilo se aprende agachado cerca de fans que no te han visto
    e.pasos = (e.pasos || 0) + 1;
    if (e.pasos % Z.cadaHuella(AJ, J)) return;                    // MadSquirrel y las botas de nieve dejan menos huellas
    if (!Z.estacion(AJ, e.min).huellas) return;                   // sin nieve no hay huellas (js/estaciones.js)
    e.huellas.push({ x: J.x, z: J.z, a: J.a, min: e.min });
    if (e.huellas.length > P.huellas) e.huellas.shift();
  }
  // ¿hay algún fan cerca (12 m) que todavía no va a por ti? (para practicar el sigilo)
  function hayFanSinVerte(AJ, e) { const J = e.jugador; return e.zombis.some((z) => z.vida > 0 && z.estado !== 'persigue' && Z.dist(z.x, z.z, J.x, J.z) < 12); }
})(ZOM);
