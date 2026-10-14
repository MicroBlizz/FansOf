// Fans of Dark · la IA de los monstruos: pasean por su sala, te cazan si te ven, avisan antes de pegar (se puede esquivar o parar el golpe),
// solo unos pocos atacan a la vez (los demás rodean) y se quedan aturdidos tras un parry.
'use strict';
function dkPasoMonstruo(e, dt) {
  const P = G.p, m = G.m, d = Math.hypot(P.x - e.x, P.y - e.y);
  e.t = Math.max(0, e.t - dt); e.golpeT = Math.max(0, e.golpeT - dt);
  if (e.aturdido > 0) { e.aturdido -= dt; e.avisoT = 0; return; }
  const veMe = P.efecto !== 'invisible' && d < e.vista && dkVista(m, e.x, e.y, P.x, P.y);
  if (veMe) { e.estado = 'caza'; e.ultimo = { x: P.x, y: P.y }; }
  else if (e.estado === 'caza' && (!e.ultimo || Math.hypot(e.ultimo.x - e.x, e.ultimo.y - e.y) < 0.5 || d > e.vista * 2)) e.estado = 'quieto';
  // el golpe avisado: cuando acaba el aviso pega, si sigues a su alcance
  if (e.avisoT > 0) {
    e.avisoT -= dt;
    if (e.avisoT <= 0) {
      const alcance = e.dist ? e.alc : e.alc + P.r + 0.2, a = Math.atan2(P.y - e.y, P.x - e.x);
      if (e.dist) G.proy.push({ x: e.x, y: e.y, vx: Math.cos(a) * 5, vy: Math.sin(a) * 5, t: e.alc / 5 + 0.2, dmg: e.dmg, mio: false, color: '#ff6b6b', de: e });
      else if (d <= alcance) dkDanoAlHeroe(e.dmg, false, e);
      e.ataqueT = 0.3; e.t = e.cd; G.fx.push({ tipo: 'ataca', e });
    }
    return;   // mientras avisa, no se mueve
  }
  if (e.estado === 'caza') {
    const o = veMe ? P : e.ultimo, a = Math.atan2(o.y - e.y, o.x - e.x); e.ang = a;
    const alcance = e.dist ? e.alc : e.alc + P.r;
    const atacando = G.mons.filter(x => x.viva && x !== e && x.avisoT > 0).length;
    if (veMe && d <= alcance && e.t <= 0 && atacando < DK_COMBATE.atacantes) {
      e.avisoT = e.jefe ? DK_COMBATE.avisoJefe : DK_COMBATE.aviso; G.fx.push({ tipo: 'aviso', e }); play('deny');
    } else if (veMe && d <= alcance) {
      if (e.dist && d < 2) dkMover(m, e, -Math.cos(a) * e.vel * 0.6 * dt, -Math.sin(a) * e.vel * 0.6 * dt, e.r);   // los tiradores guardan las distancias
      else if (!e.dist && e.t > 0) { const b = a + (e.lado || (e.lado = Math.random() < 0.5 ? 1 : -1)) * Math.PI / 2; dkMover(m, e, Math.cos(b) * e.vel * 0.5 * dt, Math.sin(b) * e.vel * 0.5 * dt, e.r); }   // rodea mientras espera su turno
    } else {
      const antes = { x: e.x, y: e.y };
      dkMover(m, e, Math.cos(a) * e.vel * dt, Math.sin(a) * e.vel * dt, e.r);
      if (Math.hypot(e.x - antes.x, e.y - antes.y) < e.vel * dt * 0.3) {   // atascado contra una pared: bordea
        const b = a + (e.lado || (e.lado = Math.random() < 0.5 ? 1 : -1)) * 1.3; dkMover(m, e, Math.cos(b) * e.vel * dt, Math.sin(b) * e.vel * dt, e.r);
      }
    }
    for (const o of G.mons) if (o !== e && o.viva) { const dd = Math.hypot(o.x - e.x, o.y - e.y); if (dd < e.r + o.r && dd > 0.001) { const f = (e.r + o.r - dd) * 0.5; dkMover(m, e, (e.x - o.x) / dd * f, (e.y - o.y) / dd * f, e.r); } }
  } else {   // de paseo por su sala
    e.paseo -= dt;
    if (e.paseo <= 0) { e.paseo = 1.5 + Math.random() * 3; e.destino = Math.random() < 0.5 ? null : { x: e.casa.x + 0.7 + Math.random() * (e.casa.w - 1.4), y: e.casa.y + 0.7 + Math.random() * (e.casa.h - 1.4) }; }
    if (e.destino) { const a = Math.atan2(e.destino.y - e.y, e.destino.x - e.x); e.ang = a; if (Math.hypot(e.destino.x - e.x, e.destino.y - e.y) > 0.2) dkMover(m, e, Math.cos(a) * e.vel * 0.4 * dt, Math.sin(a) * e.vel * 0.4 * dt, e.r); }
  }
}
