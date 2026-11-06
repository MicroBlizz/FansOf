// Fans of Zombies · LOS FANS ZOMBIFICADOS (dominio): el ruido (cada cosa que suena tiene un radio y quien lo oye va hacia allí) y lo
// que piensa cada zombi: deambula, sigue huellas en la nieve, va al último ruido, te persigue si te ve y te muerde si te alcanza.
// Cada tipo tiene lo suyo: el streamer grita y avisa a los demás, el speedrunner esprinta y descansa, el bot hace siempre la misma
// ruta. Los lejanos «duermen» (no se calculan). El mundo (choques y vista) llega de fuera: mundo.mueve y mundo.seVe.
'use strict';
var ZOM = globalThis.ZOM || (globalThis.ZOM = {});
(function (Z) {
  Z.nuevoZombi = function (AJ, e, tipo, x, z, azar) {
    const T = AJ.zombis[tipo];
    if (!T) return Z.error('tipoDesconocido', { tipo });
    const zb = { id: ++e.ultimoId, tipo, T, x, z, a: azar() * 6.28, vida: T.vida, estado: 'vaga', obj: null, tPensar: 0, tMordisco: 0, tSprint: 0, descansa: 0, olvida: 0 };
    if (T.ruta) zb.ruta = [{ x, z }, { x: x + (azar() - 0.5) * 30, z: z + (azar() - 0.5) * 30 }];
    e.zombis.push(zb);
    return Z.ok(zb);
  };

  // un ruido en (x, z) con radio r: los zombis que lo oyen van hacia allí (quien = 'jugador' | 'alarma' | 'zombi')
  Z.haceRuido = function (AJ, e, x, z, r, quien, dura) {
    e.ruidos.push({ x, z, r, quien, t: dura || AJ.ruido.dura, max: dura || AJ.ruido.dura });
    const p = Z.parcheDe(AJ, e), oido = (p && p.oido) || 1;
    for (const zb of e.zombis) {
      if (zb.vida <= 0 || zb.estado === 'persigue') continue;
      if (Z.dist(zb.x, zb.z, x, z) <= r * zb.T.oido * oido) { zb.estado = 'oye'; zb.obj = { x, z }; zb.olvida = AJ.ia.olvida; }
    }
  };
  Z.pasoRuidos = (e, dt) => { e.ruidos = e.ruidos.filter((r) => (r.t -= dt) > 0); };

  // ¿te ve este zombi? (más lejos de día y si vas de pie)
  function teVe(AJ, e, zb, d, mundo) {
    const J = e.jugador, noche = Z.esNoche(AJ, e.min) ? AJ.mundo.vistaNoche : 1;
    const vista = zb.T.vista * noche * (J.agacha ? 0.55 : 1) * (J.duerme ? 0.4 : 1);
    return d < vista && mundo.seVe(zb.x, zb.z, J.x, J.z);
  }
  // decide el estado y hacia dónde va
  function piensa(AJ, e, zb, d, mundo, azar) {
    const J = e.jugador;
    if (teVe(AJ, e, zb, d, mundo)) {
      if (zb.estado !== 'persigue' && zb.T.grita) { Z.haceRuido(AJ, e, zb.x, zb.z, AJ.ruido.grito, 'zombi'); e.eventos.push({ tipo: 'grito', id: zb.id }); }
      zb.estado = 'persigue'; zb.obj = { x: J.x, z: J.z }; zb.olvida = AJ.ia.olvida; return;
    }
    if (zb.estado === 'persigue') zb.estado = 'oye';            // te ha perdido: va a donde te vio por última vez
    if (zb.estado === 'oye' && zb.olvida > 0) return;
    zb.estado = 'vaga';
    const h = huellaCerca(AJ, e, zb);
    if (h) { zb.estado = 'huella'; zb.obj = h; return; }
    if (zb.ruta) { const r = zb.ruta[0]; if (Z.dist(zb.x, zb.z, r.x, r.z) < 1.5) zb.ruta.push(zb.ruta.shift()); zb.obj = zb.ruta[0]; return; }
    if (!zb.obj || azar() < 0.02) zb.obj = { x: zb.x + (azar() - 0.5) * AJ.ia.deambula * 2, z: zb.z + (azar() - 0.5) * AJ.ia.deambula * 2 };
  }
  // la huella más nueva cerca del zombi (las sigue hacia delante, hacia ti)
  function huellaCerca(AJ, e, zb) {
    let mejor = null;
    for (const h of e.huellas) if (e.min - h.min < AJ.jugador.vidaHuella && Z.dist(zb.x, zb.z, h.x, h.z) < AJ.ia.huella && (!mejor || h.min > mejor.min)) mejor = h;
    if (!mejor) return null;
    const i = e.huellas.indexOf(mejor), sig = e.huellas[i + 1];
    return sig ? { x: sig.x, z: sig.z } : { x: e.jugador.x, z: e.jugador.z };
  }
  // la velocidad de un zombi ahora (el speedrunner esprinta un rato y se para a mirar su tiempo)
  function velDe(AJ, e, zb, dt) {
    const p = Z.parcheDe(AJ, e), T = zb.T;
    let v = zb.estado === 'persigue' ? T.persigue : T.vel;
    if (T.sprint && zb.estado === 'persigue') {
      if (zb.descansa > 0) { zb.descansa -= dt; v = 0; } else if ((zb.tSprint += dt) > T.sprint) { zb.tSprint = 0; zb.descansa = T.descanso; }
    }
    if (p && p.velNoche && Z.esNoche(AJ, e.min)) v *= p.velNoche;
    if (p && p.lag && Math.sin(e.min * 0.7 + zb.id) > 0.6) v = 0;
    return v;
  }

  Z.pasoZombis = function (AJ, e, dt, mundo, azar) {
    const J = e.jugador, rej = Z.rejilla(e.zombis, AJ.ia.celda);
    for (const zb of e.zombis) {
      if (zb.vida <= 0) continue;
      const d = Z.dist(zb.x, zb.z, J.x, J.z);
      if (d > AJ.ia.duerme && zb.estado === 'vaga') continue;
      zb.olvida -= dt; zb.tMordisco -= dt;
      if (zb.aturdido > 0) { zb.aturdido -= dt; if (zb.aturdido <= 0) zb.derribado = false; continue; }   // aturdido o en el suelo: ni anda ni muerde
      if ((zb.tPensar -= dt) <= 0) { zb.tPensar = 0.25 + azar() * 0.15; piensa(AJ, e, zb, d, mundo, azar); }
      if (zb.estado === 'persigue') zb.obj = { x: J.x, z: J.z };
      if (zb.hueco && zb.estado !== 'vaga') { if (Z.pasoHuecoZombi(AJ, e, zb, dt, mundo)) continue; const p = zb.hueco && mundo.posHueco(zb.hueco); if (p) zb.obj = { x: p.x, z: p.z }; }
      Z.pasoCruce(zb, dt);
      if (d < AJ.ia.alcanceMordisco + zb.T.radio && zb.estado === 'persigue') { muerde(AJ, e, zb, azar); continue; }
      mueveZombi(AJ, e, zb, rej, velDe(AJ, e, zb, dt) * dt, mundo);
    }
  };
  function mueveZombi(AJ, e, zb, rej, paso, mundo) {
    if (!zb.obj || paso <= 0) return;
    const dx = zb.obj.x - zb.x, dz = zb.obj.z - zb.z, d = Math.hypot(dx, dz);
    if (d < 0.3) { if (zb.estado === 'oye' && !zb.hueco && !zb.cruza) zb.olvida = 0; return; }
    let mx = dx / d, mz = dz / d;
    const f = sigueFlujo(e, zb, mundo);                         // persiguiéndote: rodea casas y vallas por el campo de flujo
    if (f) { mx = f.x; mz = f.z; }
    for (const o of Z.vecinos(rej, zb.x, zb.z)) {             // no se apilan: se apartan un poco de los de al lado
      const od = Z.dist(zb.x, zb.z, o.x, o.z);
      if (o !== zb && o.vida > 0 && od < AJ.ia.separa && od > 0) { mx += (zb.x - o.x) / od * 0.6; mz += (zb.z - o.z) / od * 0.6; }
    }
    const m = Math.hypot(mx, mz) || 1;
    zb.a = Math.atan2(mx, mz);
    const choca = mundo.mueve(zb, mx / m * paso, mz / m * paso, zb.T.radio);
    if (choca && zb.estado !== 'vaga' && !zb.hueco && !zb.cruza) Z.buscaHueco(AJ, e, zb, mundo);   // una pared por medio: a por la puerta o ventana más cercana
  }
  // el campo de flujo (si el mundo lo da) cuando te persigue o va a donde estás, sin un hueco entre manos y no pegado a ti
  function sigueFlujo(e, zb, mundo) {
    if (!mundo.flujo || zb.hueco || zb.cruza) return null;
    const J = e.jugador, aTi = zb.estado === 'persigue' || (zb.estado === 'oye' && zb.obj && Z.dist(zb.obj.x, zb.obj.z, J.x, J.z) < 4);
    if (!aTi || Z.dist(zb.x, zb.z, J.x, J.z) < 1.6) return null;
    return mundo.flujo(zb.x, zb.z);
  }
  function muerde(AJ, e, zb, azar) {
    zb.a = Math.atan2(e.jugador.x - zb.x, e.jugador.z - zb.z);
    if (zb.tMordisco > 0) return;
    zb.tMordisco = AJ.ia.mordisco;
    const J = e.jugador;
    if (J.duerme) J.duerme = false;
    Z.dana(e, zb.T.dano * e.dif.dano, 'mordisco', zb.tipo);
    if (J.infeccion <= 0 && azar() < AJ.ia.infeccion * (J.A.infeccion || 1)) { J.infeccion = 1; e.eventos.push({ tipo: 'infectado' }); }
    e.eventos.push({ tipo: 'mordisco', id: zb.id });
  }
})(ZOM);
