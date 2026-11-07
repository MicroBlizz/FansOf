// Fans of Zombies · LOS COCHES (dominio): coches que se conducen. Cada uno tiene su llave (llavero: e.llaves), que se encuentra
// registrando su guantera o, a veces, en una casa (la de un coche cercano); gasolina, que se gasta al andar y se repone con un bidón (G);
// y piezas que se gastan al chocar y al atropellar (js/coches-piezas.js). Al conducir el motor hace mucho ruido y los fans que pillas salen
// despedidos. Si vas despacio (o sin cristales) te pueden morder por la ventanilla; de noche, los faros atraen a los de delante. Cifras en AJ.coches.
'use strict';
var ZOM = globalThis.ZOM || (globalThis.ZOM = {});
(function (Z) {
  const C = (AJ) => AJ.coches;
  Z.cocheDe = (e, id) => (e.coches || []).find((c) => c.id === id) || null;
  Z.nuevoCoche = function (AJ, e, op, azar) {
    const K = C(AJ), c = { id: op.id, x: op.x, z: op.z, a: op.a || 0, color: op.color || 0, v: 0, gas: Math.round(azar() * K.gasInicial * 100) / 100, piezas: Z.nuevasPiezas(AJ, azar), faros: false };   // las piezas: js/coches-piezas.js
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
    const J = e.jugador, sin = (e.coches || []).filter((c) => !ll[c.id] && Z.cocheVivo(AJ, c) && Z.dist(c.x, c.z, J.x, J.z) < K.llaveRadio).sort((a, b) => Z.dist(a.x, a.z, J.x, J.z) - Z.dist(b.x, b.z, J.x, J.z));
    if (sin.length) dalaLlave(e, sin[0].id, 'casa');
  };
  function dalaLlave(e, id, donde) { e.llaves[id] = true; e.eventos.push({ tipo: 'llave', coche: id, donde }); }

  Z.subeCoche = function (AJ, e, id, azar) {
    const c = Z.cocheDe(e, id), J = e.jugador;
    if (!c || Z.dist(c.x, c.z, J.x, J.z) > C(AJ).alcance) return Z.error('nadaCerca');
    if (!(e.llaves || {})[id]) return Z.error('sinLlave');
    const arranca = Z.arranca(AJ, c, azar);              // batería, motor y ruedas (js/coches-piezas.js)
    if (!arranca.ok) return arranca;
    J.conduce = id; J.agacha = false; J.registra = J.clava = J.desmonta = null; c.v = 0;
    e.eventos.push({ tipo: 'subeCoche', gas: c.gas });
    return Z.ok(c);
  };
  // bajar: te pones al lado del coche (a la izquierda; si no cabe, a la derecha o detrás)
  Z.bajaCoche = function (AJ, e, mundo) {
    const J = e.jugador, c = Z.cocheDe(e, J.conduce);
    if (!c) { J.conduce = null; return Z.error('nadaCerca'); }
    J.conduce = null; c.v = 0; c.faros = false;              // al bajar se apagan los faros
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
  Z.pasoCoche = function (AJ, e, dt, ent, mundo, azar, horas) {
    const J = e.jugador, c = Z.cocheDe(e, J.conduce), K = C(AJ);
    if (!c) { J.conduce = null; return; }
    const D = Z.conduccion(AJ, c), gas = c.gas > 0 && Z.cocheVivo(AJ, c) ? -ent.mz : 0;   // lo que dejan las piezas (js/coches-piezas.js)
    c.v += (gas * (gas > 0 ? K.acelera : K.frena * D.frena) - c.v * K.roce) * dt;
    c.v = Math.max(-K.atras, Math.min(K.maxima * D.maxima, c.v));
    if (Math.abs(c.v) > 0.3) c.a -= ent.mx * K.giro * D.giro * dt * Math.sign(c.v) * Math.min(1, Math.abs(c.v) / 4);
    const choca = mundo.mueve(c, Math.sin(c.a) * c.v * dt, Math.cos(c.a) * c.v * dt, K.radio);
    if (choca && Math.abs(c.v) > 2) choque(AJ, e, c, azar);
    c.gas = Math.max(0, c.gas - Math.abs(c.v) * dt * K.consumo);
    Z.pasoBateria(AJ, c, horas || 0);
    atropella(AJ, e, c);
    if (c.faros && (c.tFaros = (c.tFaros || 0) - dt) <= 0) { c.tFaros = 1; farosAtraen(AJ, e, c); }
    J.x = c.x; J.z = c.z; J.a = c.a;
    if ((c.tRuido = (c.tRuido || 0) - dt) <= 0) { c.tRuido = 0.5; Z.haceRuido(AJ, e, c.x, c.z, K.ruido + Math.abs(c.v) * K.ruidoVel, 'jugador'); }
  };
  // un choque: gasta piezas y, si es fuerte, te rompe una pierna (js/heridas.js)
  function choque(AJ, e, c, azar) {
    const v = Math.abs(c.v);
    Z.gastaPiezas(AJ, c, v * C(AJ).danoChoque, azar);
    e.eventos.push({ tipo: 'choque', v });
    if (azar) Z.choqueHiere(AJ, e, v, azar);
    c.v *= -0.25;
  }
  // de noche, los fans tranquilos que quedan delante de los faros los ven y van hacia el coche
  function farosAtraen(AJ, e, c) {
    const P = C(AJ).piezas;
    if (!Z.esNoche(AJ, e.min)) return;
    for (const zb of Z.vivos(e)) {
      const d = Z.dist(zb.x, zb.z, c.x, c.z), ang = Math.abs(((Math.atan2(zb.x - c.x, zb.z - c.z) - c.a) % 6.2832 + 9.4248) % 6.2832 - 3.1416);
      if (zb.estado === 'vaga' && d < P.farosAlcance && ang < P.farosCono) { zb.estado = 'oye'; zb.obj = { x: c.x, z: c.z }; zb.olvida = AJ.ia.olvida; }
    }
  }
  function atropella(AJ, e, c) {
    const K = C(AJ), v = Math.abs(c.v);
    if (v < K.atropellaDesde) return;
    for (const zb of Z.vivos(e)) {
      if (Z.dist(zb.x, zb.z, c.x, c.z) > K.radio + zb.T.radio + 0.3) continue;
      Z.golpeaZombi(AJ, e, zb, v * K.atropello);
      const d = Z.dist(zb.x, zb.z, c.x, c.z) || 1; zb.x += (zb.x - c.x) / d * 1.5; zb.z += (zb.z - c.z) / d * 1.5; zb.derribado = zb.vida > 0; zb.aturdido = 1.2;
      Z.gastaPiezas(AJ, c, zb.T.pesado ? 6 : 1.5, null); c.v *= zb.T.pesado ? 0.4 : 0.85;
      e.eventos.push({ tipo: 'atropello', id: zb.id, x: zb.x, z: zb.z });
    }
  }
})(ZOM);
