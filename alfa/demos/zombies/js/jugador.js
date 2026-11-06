// Fans of Zombies · MOVERSE Y PELEAR (dominio): andar, correr y agacharse (cada paso hace su ruido y deja huellas en la nieve),
// cambiar de arma y golpear o disparar. La escopeta tumba lo que tengas delante, pero se oye en medio distrito.
// La entrada llega ya leída: { mx, mz (dirección, -1 a 1), corre, agacha, apunta (ángulo), ataca, arma }.
'use strict';
var ZOM = globalThis.ZOM || (globalThis.ZOM = {});
(function (Z) {
  Z.pasoJugador = function (AJ, e, dt, ent, mundo) {
    const J = e.jugador;
    if (J.duerme) return;
    if (ent.agacha) J.agacha = !J.agacha;
    if (ent.arma && AJ.armas[ent.arma]) J.arma = ent.arma;
    if (ent.apunta != null) J.a = ent.apunta;
    const m = Math.hypot(ent.mx, ent.mz);
    J.corre = !!ent.corre && m > 0 && !J.registra;
    if (J.corre) J.agacha = false;
    if (m > 0) anda(AJ, e, dt, ent, m, mundo);
    J.tArma -= dt;
    if (ent.ataca && J.tArma <= 0 && !J.registra) Z.ataca(AJ, e, mundo);
  };
  function anda(AJ, e, dt, ent, m, mundo) {
    const J = e.jugador, P = AJ.jugador;
    if (J.registra) J.registra = null;                            // moverte corta el registro
    const vel = (J.corre ? P.corre : J.agacha ? P.agacha : P.vel) * (J.A.vel || 1) * (J.sueno <= 0 ? 0.7 : 1);
    const x0 = J.x, z0 = J.z;
    mundo.mueve(J, ent.mx / m * vel * dt, ent.mz / m * vel * dt, P.radio);
    J.andado += Z.dist(x0, z0, J.x, J.z);
    if (J.andado < P.pasoHuella) return;
    J.andado = 0;
    if (!J.agacha) Z.haceRuido(AJ, e, J.x, J.z, (J.corre ? AJ.ruido.correr : AJ.ruido.andar) * (J.A.ruido || 1), 'jugador');
    e.pasos = (e.pasos || 0) + 1;
    if ((J.A.huellas || 1) < 1 && e.pasos % 2) return;           // MadSquirrel deja la mitad de huellas
    e.huellas.push({ x: J.x, z: J.z, a: J.a, min: e.min });
    if (e.huellas.length > P.huellas) e.huellas.shift();
  }

  // golpear o disparar hacia donde miras: da a los zombis dentro del cono y del alcance que se vean
  Z.ataca = function (AJ, e, mundo) {
    const J = e.jugador, W = AJ.armas[J.arma];
    if (W.municion && !(J.mochila[W.municion] > 0)) { e.eventos.push({ tipo: 'sinMunicion' }); J.tArma = 0.4; return Z.error('sinMunicion'); }
    if (W.municion) J.mochila[W.municion]--;
    J.tArma = W.cadencia;
    Z.haceRuido(AJ, e, J.x, J.z, AJ.ruido[W.ruido] * (W.municion ? 1 : (J.A.ruido || 1)), 'jugador');
    const tocados = [];
    for (const zb of e.zombis) {
      if (zb.vida <= 0) continue;
      const d = Z.dist(J.x, J.z, zb.x, zb.z), ang = Math.abs(angulo(J.a, Math.atan2(zb.x - J.x, zb.z - J.z)));
      if (d > W.alcance + zb.T.radio || ang > W.cono || !mundo.seVe(J.x, J.z, zb.x, zb.z)) continue;
      tocados.push(zb); Z.golpeaZombi(AJ, e, zb, W.dano * (1 - 0.4 * d / W.alcance));
    }
    e.eventos.push({ tipo: 'ataque', arma: J.arma, tocados: tocados.map((z) => z.id) });
    return Z.ok(tocados.length);
  };
  const angulo = (a, b) => { let d = (b - a) % 6.2832; if (d > 3.1416) d -= 6.2832; if (d < -3.1416) d += 6.2832; return d; };
  Z.golpeaZombi = function (AJ, e, zb, dano) {
    zb.vida -= dano; zb.estado = 'persigue'; zb.olvida = AJ.ia.olvida;
    if (zb.vida > 0) return;
    e.stats.bajas++;
    e.eventos.push({ tipo: 'baja', id: zb.id, tipoZombi: zb.tipo, x: zb.x, z: zb.z });
    if (zb.T.botin) e.cuerpos.push({ id: 'cuerpo-' + zb.id, x: zb.x, z: zb.z });     // la ballena deja algo que registrar
  };
})(ZOM);
