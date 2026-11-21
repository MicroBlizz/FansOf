// Fans of Island · CRAZYBUNNY: andar con inercia, saltar (más alto cuanto más se mantiene), flotar con las orejas, el margen al borde
// (coyote) y al pulsar antes de tiempo (buffer), el empujón al recibir un golpe y volver a tierra firme si cae al mar.
'use strict';
function giraHacia(o, dt) {
  const obj = o.mira > 0 ? GIRO_DER : GIRO_IZQ;
  o.giro += (obj - o.giro) * Math.min(1, dt * 14);
}
function saltoJugador(enSuelo, dt) {
  J.coyote = enSuelo ? 0.1 : J.coyote - dt;     // un pelín de margen para saltar justo al borde
  if (ent.buffer > 0) ent.buffer -= dt;          // y si pulsas un pelín antes de tocar el suelo, también salta
  if (ent.buffer > 0 && J.coyote > 0) { J.vz = V_SALTO; J.coyote = 0; ent.buffer = 0; J.flota = 0; J.cortado = false; play('jump'); }
  if (!ent.salto && J.vz > 0 && !J.cortado) { J.vz *= 0.45; J.cortado = true; }   // salto corto si sueltas pronto
}
function andaJugador(enSuelo, dt) {
  J.empuje -= dt;
  if (J.empuje > 0) return;
  if (ent.dir) {
    J.vx += ent.dir * (enSuelo ? 1100 : 800) * dt;
    J.vx = Math.max(-V_MAX, Math.min(V_MAX, J.vx)); J.mira = ent.dir;
  } else {
    const f = (enSuelo ? 1500 : 500) * dt;
    J.vx = Math.abs(J.vx) <= f ? 0 : J.vx - Math.sign(J.vx) * f;
  }
}
function pasoJugador(dt) {
  leeControles();
  const s = sueloDe(J, R_J), enSuelo = J.z <= s + 0.01 && J.vz <= 0;
  saltoJugador(enSuelo, dt);
  andaJugador(enSuelo, dt);
  if (mueveX(J, J.vx * dt, R_J)) J.vx = 0;
  const flotando = ent.salto && J.vz < 0 && J.flota < 0.9;
  if (flotando) { J.flota += dt; J.vz = Math.max(J.vz, -55); }
  J.flotando = flotando;
  const r = cae(J, dt, flotando ? 0.2 : 1, R_J);
  if (r === 'aterriza') { J.aterriza = 0.12; J.flota = 0; }
  J.aterriza -= dt; J.inv -= dt;
  J.anda = (r === 'suelo' && Math.abs(J.vx) > 20) ? J.anda + dt : 0;
  if (r === 'suelo' && arribaCol(Math.floor(J.x / T)) === J.z) J.salvo = { x: J.x, z: J.z };
  giraHacia(J, dt);
  if (J.z < MAR - 50) {
    daño();
    if (J.vidas > 0) { J.x = J.salvo.x; J.z = J.salvo.z; J.vz = 0; J.vx = 0; }
  }
}
function poseJugador() {
  if (J.inv > 1.1) return 'herido';
  if (J.vz > 0) return 'salto';
  if (J.flotando) return 'flota';
  if (J.vz < 0) return 'cae';
  if (J.aterriza > 0) return 'aterriza';
  if (J.anda > 0) return Math.floor(J.anda / 0.12) % 2 ? 'paso1' : 'paso2';
  return 'reposo';
}
function rebota() {   // tras pisar a alguien: más alto si se mantiene el salto
  J.vz = ent.salto ? 470 : 360; J.flota = 0; J.cortado = !ent.salto; play('pop');
}
function golpeado(dx) {
  daño(); J.vz = 260; J.vx = (Math.sign(dx) || 1) * 180; J.empuje = 0.3; J.cortado = true;
}
