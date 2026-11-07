// Fans of Zombies · LOS COCHES (dominio): coches que se conducen. Cada uno tiene su llave (llavero: e.llaves), que se encuentra
// registrando su guantera o, a veces, en una casa (la de un coche cercano); gasolina, que se gasta al andar y se repone con un bidón (G);
// y daño: se abolla al chocar y al atropellar, y a 100 ya no arranca. Al conducir el motor hace mucho ruido y los fans que pillas salen
// despedidos. Si vas despacio te pueden morder por la ventanilla. Cifras en AJ.coches.
'use strict';
var ZOM = globalThis.ZOM || (globalThis.ZOM = {});
(function (Z) {
  const C = (AJ) => AJ.coches;
  Z.cocheDe = (e, id) => (e.coches || []).find((c) => c.id === id) || null;
  Z.nuevoCoche = function (AJ, e, op, azar) {
    const K = C(AJ), c = { id: op.id, x: op.x, z: op.z, a: op.a || 0, color: op.color || 0, v: 0, gas: Math.round(azar() * K.gasInicial * 100) / 100, dano: Math.round(azar() * K.danoInicial) };
    (e.coches || (e.coches = [])).push(c);
    return c;
  };
  // los coches de un trozo nuevo (sus coches aparcados pasan a conducibles)
  Z.ponCochesTrozo = function (AJ, e, P, azar) { P.coches.forEach((k, i) => Z.nuevoCoche(AJ, e, { id: P.clave + 'c' + i, x: k.x, z: k.z, a: k.giro + Math.PI / 2, color: k.color }, azar)); };
  // tras registrar: en la guantera de un coche puede estar su llave; en un armario o una cocina, la de algún coche cercano
  Z.buscaLlave = function (AJ, e, sitio, tipo, azar) {
    const K = C(AJ), ll = e.llaves || (e.llaves = {});
    if (sitio.startsWith('car:')) { const id = sitio.slice(4); if (!ll[id] && azar() < K.llaveGuantera) dalaLlave(e, id, 'guantera'); return; }
    if (!K.llaveEnCasa[tipo] || azar() >= K.llaveEnCasa[tipo]) return;
    const J = e.jugador, sin = (e.coches || []).filter((c) => !ll[c.id] && c.dano < 100 && Z.dist(c.x, c.z, J.x, J.z) < K.llaveRadio).sort((a, b) => Z.dist(a.x, a.z, J.x, J.z) - Z.dist(b.x, b.z, J.x, J.z));
    if (sin.length) dalaLlave(e, sin[0].id, 'casa');
  };
  function dalaLlave(e, id, donde) { e.llaves[id] = true; e.eventos.push({ tipo: 'llave', coche: id, donde }); }

  Z.subeCoche = function (AJ, e, id) {
    const c = Z.cocheDe(e, id), J = e.jugador;
    if (!c || Z.dist(c.x, c.z, J.x, J.z) > C(AJ).alcance) return Z.error('nadaCerca');
    if (!(e.llaves || {})[id]) return Z.error('sinLlave');
    if (c.dano >= 100) return Z.error('cocheRoto');
    J.conduce = id; J.agacha = false; J.registra = J.clava = J.desmonta = null; c.v = 0;
    e.eventos.push({ tipo: 'subeCoche', gas: c.gas });
    return Z.ok(c);
  };
  // bajar: te pones al lado del coche (a la izquierda; si no cabe, a la derecha o detrás)
  Z.bajaCoche = function (AJ, e, mundo) {
    const J = e.jugador, c = Z.cocheDe(e, J.conduce);
    if (!c) { J.conduce = null; return Z.error('nadaCerca'); }
    J.conduce = null; c.v = 0;
    for (const ang of [Math.PI / 2, -Math.PI / 2, Math.PI]) {
      const x = c.x + Math.sin(c.a + ang) * 2, z = c.z + Math.cos(c.a + ang) * 2;
      if (!mundo.choca || !mundo.choca(x, z, AJ.jugador.radio)) { J.x = x; J.z = z; break; }
    }
    e.eventos.push({ tipo: 'bajaCoche' });
    return Z.ok(c);
  };
  Z.reposta = function (AJ, e, id) {
    const c = Z.cocheDe(e, id), J = e.jugador;
    if (!c || Z.dist(c.x, c.z, J.x, J.z) > C(AJ).alcance) return Z.error('nadaCerca');
    if (c.gas >= 1) return Z.error('tanqueLleno');
    if (!Z.gastaLleva(J, 'gasolina', 1).ok) return Z.error('sinGasolina');
    c.gas = Math.min(1, c.gas + C(AJ).bidon);
    e.eventos.push({ tipo: 'reposta', gas: c.gas });
    return Z.ok(c.gas);
  };
  // cada fotograma al volante: acelerar (W), frenar o marcha atrás (S), girar (A/D); choques, atropellos, gasolina y ruido
  Z.pasoCoche = function (AJ, e, dt, ent, mundo, azar) {
    const J = e.jugador, c = Z.cocheDe(e, J.conduce), K = C(AJ);
    if (!c) { J.conduce = null; return; }
    const gas = c.gas > 0 && c.dano < 100 ? -ent.mz : 0;
    c.v += (gas * (gas > 0 ? K.acelera : K.frena) - c.v * K.roce) * dt;
    c.v = Math.max(-K.atras, Math.min(K.maxima, c.v));
    if (Math.abs(c.v) > 0.3) c.a -= ent.mx * K.giro * dt * Math.sign(c.v) * Math.min(1, Math.abs(c.v) / 4);
    const choca = mundo.mueve(c, Math.sin(c.a) * c.v * dt, Math.cos(c.a) * c.v * dt, K.radio);
    if (choca && Math.abs(c.v) > 2) { c.dano = Math.min(100, c.dano + Math.abs(c.v) * K.danoChoque); e.eventos.push({ tipo: 'choque', v: Math.abs(c.v) }); if (azar) Z.choqueHiere(AJ, e, Math.abs(c.v), azar); c.v *= -0.25; }   // un choque fuerte te rompe una pierna (js/heridas.js)
    c.gas = Math.max(0, c.gas - Math.abs(c.v) * dt * K.consumo);
    atropella(AJ, e, c);
    J.x = c.x; J.z = c.z; J.a = c.a;
    if ((c.tRuido = (c.tRuido || 0) - dt) <= 0) { c.tRuido = 0.5; Z.haceRuido(AJ, e, c.x, c.z, K.ruido + Math.abs(c.v) * K.ruidoVel, 'jugador'); }
  };
  function atropella(AJ, e, c) {
    const K = C(AJ), v = Math.abs(c.v);
    if (v < K.atropellaDesde) return;
    for (const zb of Z.vivos(e)) {
      if (Z.dist(zb.x, zb.z, c.x, c.z) > K.radio + zb.T.radio + 0.3) continue;
      Z.golpeaZombi(AJ, e, zb, v * K.atropello);
      const d = Z.dist(zb.x, zb.z, c.x, c.z) || 1; zb.x += (zb.x - c.x) / d * 1.5; zb.z += (zb.z - c.z) / d * 1.5; zb.derribado = zb.vida > 0; zb.aturdido = 1.2;
      c.dano = Math.min(100, c.dano + (zb.T.pesado ? 6 : 1.5)); c.v *= zb.T.pesado ? 0.4 : 0.85;
      e.eventos.push({ tipo: 'atropello', id: zb.id, x: zb.x, z: zb.z });
    }
  }
})(ZOM);
