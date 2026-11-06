// Fans of Zombies · PELEAR (dominio): golpear o disparar hacia donde miras y empujar. Cada golpe gasta aguante (agotado, pegas más flojo
// y más despacio), echa al zombi hacia atrás y lo deja aturdido un momento; el empujón no hace daño ni ruido, pero lo tumba en el suelo.
// La escopeta tumba lo que tengas delante, pero se oye en medio distrito. Lo que pasa va a e.eventos (ataque, empujon, baja).
'use strict';
var ZOM = globalThis.ZOM || (globalThis.ZOM = {});
(function (Z) {
  const angulo = (a, b) => { let d = (b - a) % 6.2832; if (d > 3.1416) d -= 6.2832; if (d < -3.1416) d += 6.2832; return d; };
  // los zombis vivos dentro del cono (alcance y ángulo) que se ven desde donde estás
  function enCono(e, alcance, cono, mundo) {
    const J = e.jugador, out = [];
    for (const zb of e.zombis) {
      if (zb.vida <= 0) continue;
      const d = Z.dist(J.x, J.z, zb.x, zb.z), ang = Math.abs(angulo(J.a, Math.atan2(zb.x - J.x, zb.z - J.z)));
      if (d <= alcance + zb.T.radio && ang <= cono && mundo.seVe(J.x, J.z, zb.x, zb.z)) out.push({ zb, d });
    }
    return out;
  }
  // aparta al zombi desde ti y lo deja quieto (aturde segundos; derriba = tumbado en el suelo)
  function aparta(e, zb, metros, aturde, derriba, mundo) {
    const J = e.jugador, d = Z.dist(J.x, J.z, zb.x, zb.z) || 1;
    mundo.mueve(zb, (zb.x - J.x) / d * metros, (zb.z - J.z) / d * metros, zb.T.radio);
    zb.aturdido = Math.max(zb.aturdido || 0, aturde * (zb.T.pesado ? 0.5 : 1));
    if (derriba && !zb.T.pesado) zb.derribado = true;
  }

  Z.ataca = function (AJ, e, mundo) {
    const J = e.jugador, W = AJ.armas[J.arma], G = AJ.aguante, cansado = J.agotado ? G.agotado : { dano: 1, cadencia: 1 };
    if (!Z.tiene(J.mochila, J.arma)) { e.eventos.push({ tipo: 'noPuedes', codigo: 'sinArma' }); J.tArma = 0.4; return Z.error('sinArma'); }
    if (W.municion && !Z.gasta(J.mochila, W.municion, 1).ok) { e.eventos.push({ tipo: 'sinMunicion' }); J.tArma = 0.4; return Z.error('sinMunicion'); }
    J.tArma = W.cadencia * cansado.cadencia;
    J.aguante = Math.max(0, J.aguante - W.aguante);
    if (J.aguante <= 0) J.agotado = true;
    Z.haceRuido(AJ, e, J.x, J.z, AJ.ruido[W.ruido] * (W.municion ? 1 : (J.A.ruido || 1)), 'jugador');
    const tocados = enCono(e, W.alcance, W.cono, mundo);
    for (const { zb, d } of tocados) {
      Z.golpeaZombi(AJ, e, zb, W.dano * cansado.dano * (1 - 0.4 * d / W.alcance));
      if (zb.vida > 0) aparta(e, zb, W.retroceso, W.aturde, false, mundo);
    }
    e.eventos.push({ tipo: 'ataque', arma: J.arma, tocados: tocados.map((t) => ({ id: t.zb.id, x: t.zb.x, z: t.zb.z })) });
    return Z.ok(tocados.length);
  };

  Z.empuja = function (AJ, e, mundo) {
    const J = e.jugador, P = AJ.empujon;
    J.tArma = P.cadencia * (J.agotado ? AJ.aguante.agotado.cadencia : 1);
    J.aguante = Math.max(0, J.aguante - P.aguante);
    if (J.aguante <= 0) J.agotado = true;
    Z.haceRuido(AJ, e, J.x, J.z, P.ruido, 'jugador');
    const tocados = enCono(e, P.alcance, P.cono, mundo);
    for (const { zb } of tocados) { aparta(e, zb, P.retroceso, P.derriba, true, mundo); zb.estado = 'persigue'; zb.olvida = AJ.ia.olvida; }
    e.eventos.push({ tipo: 'empujon', tocados: tocados.map((t) => t.zb.id) });
    return Z.ok(tocados.length);
  };

  Z.golpeaZombi = function (AJ, e, zb, dano) {
    zb.vida -= dano; zb.estado = 'persigue'; zb.olvida = AJ.ia.olvida;
    if (zb.vida > 0) return;
    zb.derribado = false;
    e.stats.bajas++;
    e.eventos.push({ tipo: 'baja', id: zb.id, tipoZombi: zb.tipo, x: zb.x, z: zb.z });
    if (zb.T.botin) e.cuerpos.push({ id: 'cuerpo-' + zb.id, x: zb.x, z: zb.z });     // la ballena deja algo que registrar
  };
})(ZOM);
