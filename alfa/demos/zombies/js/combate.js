// Fans of Zombies · PELEAR (dominio): golpear o disparar hacia donde miras y empujar. Las armas se gastan con cada golpe y se rompen;
// la pistola y el cuchillo dan solo al más cercano, y el cuchillo tumba de un golpe por la espalda a quien no te ha visto. Cada golpe gasta aguante (agotado, pegas más flojo
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
    if (!Z.lleva(J, J.arma)) { e.eventos.push({ tipo: 'noPuedes', codigo: 'sinArma' }); J.tArma = 0.4; return Z.error('sinArma'); }
    if (W.municion && !Z.gastaLleva(J, W.municion, 1).ok) { e.eventos.push({ tipo: 'sinMunicion' }); J.tArma = 0.4; return Z.error('sinMunicion'); }
    J.tArma = W.cadencia * cansado.cadencia;
    const hab = W.municion ? 'disparo' : 'pelea', fuerza = W.dano * cansado.dano * Z.mas(AJ, J, hab, 'dano') * (W.municion ? 1 : Z.golpeHeridas(AJ, J));   // brazo herido: pegas más flojo
    J.aguante = Math.max(0, J.aguante - W.aguante * Z.menos(AJ, J, 'pelea', 'aguante'));
    if (J.aguante <= 0) J.agotado = true;
    Z.haceRuido(AJ, e, J.x, J.z, AJ.ruido[W.ruido] * (W.municion ? 1 : (J.A.ruido || 1)), 'jugador');
    let tocados = enCono(e, W.alcance, W.municion ? W.cono * Z.temblor(AJ, J) : W.cono, mundo);   // con dolor, la puntería tiembla
    if (W.uno) tocados = tocados.sort((a, b) => a.d - b.d).slice(0, 1);
    let despide = false;
    for (const { zb, d } of tocados) {
      const espalda = W.espalda && porLaEspalda(J, zb);
      despide = despide || espalda;
      Z.golpeaZombi(AJ, e, zb, espalda ? zb.vida : fuerza * (1 - 0.4 * d / W.alcance));
      if (zb.vida > 0) aparta(e, zb, W.retroceso, W.aturde, false, mundo);
    }
    e.eventos.push({ tipo: 'ataque', arma: J.arma, despide, tocados: tocados.map((t) => ({ id: t.zb.id, x: t.zb.x, z: t.zb.z })) });
    if (W.municion || tocados.length) desgasta(AJ, e);
    aprende(AJ, e, hab, tocados.length, despide);
    return Z.ok(tocados.length);
  };
  // lo que se aprende de un golpe: pelea o disparo por cada fan tocado, y sigilo si lo despides por la espalda
  function aprende(AJ, e, hab, tocados, despide) {
    if (tocados) Z.ganaXp(AJ, e, hab, hab === 'disparo' ? 'disparo' : 'golpe', tocados);
    if (despide) Z.ganaXp(AJ, e, 'sigilo', 'despide');
  }
  // por la espalda: un fan que no te ha visto y te da la espalda
  function porLaEspalda(J, zb) { return zb.estado !== 'persigue' && Math.abs(angulo(zb.a, Math.atan2(J.x - zb.x, J.z - zb.z))) > 1.9; }
  // cada golpe que da (o disparo) gasta el arma; a cero se rompe y coges la siguiente que tengas
  function desgasta(AJ, e) {
    const J = e.jugador, a = Z.armaLleva(J, J.arma), p = a && a.p;
    if (!p || p.dur == null || --p.dur > 0) return;
    a.m.piezas = a.m.piezas.filter((q) => q !== p);
    e.eventos.push({ tipo: 'armaRota', arma: J.arma });
    if (!Z.lleva(J, J.arma)) J.arma = Z.siguienteArma(AJ, J) || J.arma;
  }
  Z.siguienteArma = (AJ, J) => Object.keys(AJ.armas).find((id) => Z.lleva(J, id)) || null;

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
    if (zb.T.jefe) Z.jefeVencido(e, zb);
    e.eventos.push({ tipo: 'baja', id: zb.id, tipoZombi: zb.tipo, x: zb.x, z: zb.z });
    if (zb.T.botin) e.cuerpos.push({ id: 'cuerpo-' + zb.id, x: zb.x, z: zb.z });     // la ballena deja algo que registrar
  };
  // el apuntado del móvil (ADR 081): el fan vivo más cercano de tu planta a menos de dMax, o null
  Z.blancoCerca = function (e, dMax) {
    const J = e.jugador, planta = e.planta || 0;
    let mejor = null, d = dMax;
    for (const z of e.zombis) {
      const dz = z.vida > 0 && (z.planta || 0) === planta ? Z.dist(z.x, z.z, J.x, J.z) : Infinity;
      if (dz < d) { d = dz; mejor = z; }
    }
    return mejor;
  };
})(ZOM);
