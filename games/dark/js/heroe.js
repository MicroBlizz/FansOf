// Fans of Dark · lo que hace el héroe: moverse, esquivar (rueda invulnerable), bloquear (y el parry si es justo a tiempo), pegar,
// lanzar a distancia, su habilidad, la poción y abrir cofres. Abajo, las reglas del daño: el que recibe (esquiva, bloqueo, parry) y el que hace.
'use strict';
function dkPasoHeroe(dt, entrada) {
  const P = G.p, m = G.m;
  if (P.efectoT > 0) { P.efectoT -= dt; if (P.efectoT <= 0) { P.efecto = null; P.efectoT = 0; } }
  P.hab = Math.max(0, P.hab - dt); P.t = Math.max(0, P.t - dt); P.pocionT = Math.max(0, P.pocionT - dt); P.golpeT = Math.max(0, P.golpeT - dt);
  P.bloqueoT += dt; P.parryT += dt; P.sinAire = Math.max(0, P.sinAire - dt);
  if (P.municion < DK_COMBATE.municion) { P.municionT += dt; if (P.municionT >= DK_COMBATE.recarga) { P.municionT = 0; P.municion++; } }
  // el aguante vuelve solo (más despacio con la guardia alta)
  P.aguante = Math.min(DK_COMBATE.aguante, P.aguante + dt * (P.bloquea ? DK_COMBATE.regen * 0.3 : DK_COMBATE.regen));
  // bloquear: mientras se mantiene (y hay aguante). El instante en que se levanta la guardia es el que vale para el parry.
  const quiereBloquear = !!entrada.bloquea && P.sinAire <= 0 && P.esquivaT <= 0;
  if (quiereBloquear && !P.bloquea) P.bloqueoT = 0;
  P.bloquea = quiereBloquear;
  P.ang += entrada.giro;
  // esquivar: una rueda corta e invulnerable en la dirección del movimiento (o hacia delante)
  if (entrada.esquiva && P.esquivaT <= 0 && P.aguante >= DK_COMBATE.costeEsquiva) {
    P.aguante -= DK_COMBATE.costeEsquiva; P.esquivaT = DK_COMBATE.esquiva; P.bloquea = false;
    P.esquivaDir = (entrada.mx || entrada.my) ? Math.atan2(entrada.my, entrada.mx) + P.ang : P.ang;
    G.fx.push({ tipo: 'esquiva', x: P.x, y: P.y }); play('jump');
  }
  if (P.esquivaT > 0) {
    P.esquivaT -= dt; const v = P.vel * DK_COMBATE.velEsquiva;
    dkMover(m, P, Math.cos(P.esquivaDir) * v * dt, Math.sin(P.esquivaDir) * v * dt, P.r);
  } else if (entrada.mx || entrada.my) {   // moverse: la entrada es un vector (-1..1) relativo a la cámara (ang)
    const prisa = (P.efecto === 'frenesi' ? 2 : 1) * (P.bloquea ? 0.5 : 1);
    const l = Math.min(1, Math.hypot(entrada.mx, entrada.my)), a = Math.atan2(entrada.my, entrada.mx) + P.ang;
    dkMover(m, P, Math.cos(a) * P.vel * prisa * l * dt, Math.sin(a) * P.vel * prisa * l * dt, P.r);
  }
  if (entrada.ataca && !P.bloquea) dkAtacar();
  if (entrada.lanza && !P.bloquea) dkLanzar();
  if (entrada.habilidad) dkHabilidad();
  if (entrada.pocion) dkPocion();
  if (entrada.usa) dkUsar();
}
function dkObjetivoDelante(alc, arco) {
  const P = G.p; let mejor = null;
  for (const e of G.mons) {
    if (!e.viva) continue;
    const d = Math.hypot(e.x - P.x, e.y - P.y); if (d > alc + e.r) continue;
    const da = Math.abs(((Math.atan2(e.y - P.y, e.x - P.x) - P.ang + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
    if (da > arco / 2 && d > 0.9) continue;
    if (!mejor || d < mejor.d) mejor = { e, d };
  }
  return mejor ? mejor.e : null;
}
function dkAtacar() {
  const P = G.p; if (P.t > 0) return;
  P.t = P.cd / (P.efecto === 'frenesi' ? 2 : 1);
  let mult = 1;
  if (P.efecto === 'invisible') { mult = 3; P.efecto = null; P.efectoT = 0; }
  G.fx.push({ tipo: 'golpe', ang: P.ang });
  if (P.dist) {   // JunkCoon: una bolsa de basura hacia donde miras, con daño en área
    const e = dkObjetivoDelante(P.alc, 1.2), a = e ? Math.atan2(e.y - P.y, e.x - P.x) : P.ang;
    G.proy.push({ x: P.x, y: P.y, vx: Math.cos(a) * 9, vy: Math.sin(a) * 9, t: P.alc / 9, dmg: P.dmg * mult, mio: true, area: 1.1, color: '#8fe84a' });
    play('acorn'); return;
  }
  const e = dkObjetivoDelante(P.alc, P.arco);
  if (e) {   // el golpe alcanza al objetivo y a los que estén pegados a él
    for (const o of G.mons) if (o.viva && Math.hypot(o.x - P.x, o.y - P.y) <= P.alc + o.r && (o === e || Math.hypot(o.x - e.x, o.y - e.y) < 0.8)) dkDanoA(o, P.dmg * mult, P);
  } else play('hit');
}
// Lanzar algo a distancia (bellotas, zanahorias…): munición limitada que se recarga sola. Va hacia el enemigo que tengas delante, o recto.
function dkLanzar() {
  const P = G.p;
  if (P.municion <= 0) { dkAviso('Sin munición', 1); play('deny'); return; }
  P.municion--; P.municionT = 0;
  const e = dkObjetivoDelante(DK_COMBATE.alcLanzar, 1.0), a = e ? Math.atan2(e.y - P.y, e.x - P.x) : P.ang;
  G.proy.push({ x: P.x, y: P.y, vx: Math.cos(a) * 10, vy: Math.sin(a) * 10, t: DK_COMBATE.alcLanzar / 10, dmg: P.dmg * DK_COMBATE.danoLanzar, mio: true, color: '#ffb04f', empuja: true });
  G.fx.push({ tipo: 'golpe', ang: P.ang }); play('acorn');
}
function dkHabilidad() {
  const P = G.p, H = DK_HEROES[G.heroe]; if (P.hab > 0) return;
  P.hab = H.hab.cd;
  switch (G.heroe) {
    case 'bunny': {   // salta sobre el grupo más grande a la vista
      const vivos = G.mons.filter(e => e.viva && Math.hypot(e.x - P.x, e.y - P.y) < 8 && dkVista(G.m, P.x, P.y, e.x, e.y));
      if (!vivos.length) { P.hab = 1; dkAviso('No hay nadie a la vista'); return; }
      let mejor = vivos[0], n = 0;
      for (const e of vivos) { const c = vivos.filter(o => Math.hypot(o.x - e.x, o.y - e.y) < 1.6).length; if (c > n) { n = c; mejor = e; } }
      G.fx.push({ tipo: 'salto', de: { x: P.x, y: P.y }, a: { x: mejor.x, y: mejor.y } });
      P.x = mejor.x; P.y = mejor.y;
      for (const e of G.mons) if (e.viva && Math.hypot(e.x - P.x, e.y - P.y) < 1.6) dkDanoA(e, 50);
      G.fx.push({ tipo: 'explota', x: P.x, y: P.y, r: 1.6, color: '#ff8a1f' }); play('slam'); break; }
    case 'squirrel': P.efecto = 'frenesi'; P.efectoT = 4; play('jump'); break;
    case 'fox': P.efecto = 'invisible'; P.efectoT = 4; play('poof'); break;
    case 'beaver': { const a = P.ang; G.proy.push({ x: P.x, y: P.y, vx: Math.cos(a) * 7, vy: Math.sin(a) * 7, t: 0.6, dmg: 70, mio: true, area: 1.7, color: '#ff4d4d' }); play('deploy'); break; }
    case 'meercat': P.hp = Math.min(P.hpMax, P.hp + P.hpMax * 0.4); G.fx.push({ tipo: 'cura', x: P.x, y: P.y }); play('heal'); break;
    case 'junkcoon': {
      let e = null, d = 99; for (const o of G.mons) if (o.viva) { const dd = Math.hypot(o.x - P.x, o.y - P.y); if (dd < d && dd < 8) { d = dd; e = o; } }
      if (!e) { P.hab = 1; dkAviso('No hay nadie cerca'); return; }
      for (let i = 0; i < 3; i++) { const a = Math.atan2(e.y - P.y, e.x - P.x) + (i - 1) * 0.12; G.proy.push({ x: P.x, y: P.y, vx: Math.cos(a) * 8, vy: Math.sin(a) * 8, t: d / 8 + i * 0.08, dmg: P.dmg, mio: true, area: 1.1, color: '#8fe84a' }); }
      play('acorn'); break; }
    case 'mechavaca': P.efecto = 'blindaje'; P.efectoT = 5; play('clank'); break;
  }
}
function dkPocion() {
  const P = G.p; if (P.pociones <= 0 || P.pocionT > 0) { if (P.pociones <= 0) dkAviso('Sin pociones'); return; }
  P.pociones--; P.pocionT = DK_POCION.cd; P.hp = Math.min(P.hpMax, P.hp + P.hpMax * DK_POCION.cura); G.fx.push({ tipo: 'cura', x: P.x, y: P.y }); play('heal');
}
function dkUsar() {   // abrir el cofre que tengas delante
  const P = G.p, c = G.cofres.find(c => !c.abierto && Math.hypot(c.x - P.x, c.y - P.y) < 1.2);
  if (!c) return;
  c.abierto = true; play('deploy');
  const n = 1 + Math.floor(G.m.rng() * 2) + c.extra;
  for (let i = 0; i < n; i++) dkSoltar(c.x, c.y, dkObjetoAzar(G.m.rng, c.prof, c.extra));
}
function dkSoltar(x, y, o) {
  const a = G.m.rng() * 6.28, d = 0.3 + G.m.rng() * 0.5;
  let bx = x + Math.cos(a) * d, by = y + Math.sin(a) * d;
  if (!dkSuelo(G.m, Math.floor(bx), Math.floor(by))) { bx = x; by = y; }
  G.botines.push({ x: bx, y: by, o });
}
// ¿El atacante está delante del héroe (para que el bloqueo cuente)? Sin atacante conocido, se da por bueno.
function dkDeFrente(de) {
  if (!de) return true; const P = G.p;
  const da = Math.abs(((Math.atan2(de.y - P.y, de.x - P.x) - P.ang + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
  return da < 1.9;
}
// El daño que recibe el héroe: nada mientras rueda; con la guardia alta, un PARRY si acaba de levantarla (el enemigo se aturde y el
// siguiente golpe es crítico) y si no un tercio del daño a cambio de aguante (sin aguante se rompe la guardia). La niebla no se para.
function dkDanoAlHeroe(n, niebla = false, de = null) {
  const P = G.p; if (G.fin) return;
  if (!niebla && P.esquivaT > 0) { G.fx.push({ tipo: 'texto', x: P.x, y: P.y, txt: 'ESQUIVA', color: '#9ad7ff', alto: 1.6 }); return; }
  let d = Math.max(1, n - (niebla ? 0 : P.arm * 0.5));
  if (!niebla && P.bloquea && dkDeFrente(de)) {
    if (P.bloqueoT <= DK_COMBATE.parry) {
      P.critico = true; P.parryT = 0; P.aguante = Math.min(DK_COMBATE.aguante, P.aguante + 20);
      if (de) { de.aturdido = DK_COMBATE.aturdido; de.avisoT = 0; }
      G.fx.push({ tipo: 'parry', x: P.x, y: P.y }); G.fx.push({ tipo: 'texto', x: P.x, y: P.y, txt: '¡PARRY!', color: '#ffd34d', alto: 1.8 }); play('clank');
      return;
    }
    d *= DK_COMBATE.bloqueo; P.aguante -= DK_COMBATE.costeBloqueo; G.fx.push({ tipo: 'bloqueo', x: P.x, y: P.y });
    if (P.aguante <= 0) { P.aguante = 0; P.sinAire = 1.2; P.bloquea = false; G.fx.push({ tipo: 'texto', x: P.x, y: P.y, txt: 'GUARDIA ROTA', color: '#ff5b5b', alto: 1.8 }); play('deny'); }
    else play('clank');
  }
  if (P.efecto === 'blindaje') d *= 0.3;
  P.hp -= d; P.golpeT = 0.3; G.fx.push({ tipo: 'herido' });
  if (!niebla) play('hit');
  if (P.hp <= 0) { P.hp = 0; dkTerminar('muerto'); }
}
// Daño a un monstruo. Si viene del héroe (desde = P): gasta el crítico del parry (x2, x1.5 al jefe), lo empuja un poco y, si el golpe
// es fuerte, le corta el ataque que estaba avisando (al jefe nunca: sus golpes hay que esquivarlos o pararlos).
function dkDanoA(e, n, desde = null) {
  const P = G.p; let crit = false;
  if (desde === P && P.critico) { P.critico = false; crit = true; n *= e.jefe ? 1.5 : 2; }
  e.hp -= n; e.golpeT = 0.25; e.estado = 'caza';
  G.fx.push({ tipo: 'dano', x: e.x, y: e.y, n: Math.round(n), alto: e.alto, crit });
  if (desde) {
    const dd = Math.hypot(e.x - desde.x, e.y - desde.y) || 1, f = DK_COMBATE.empuje * (e.jefe ? 0.3 : 1) * (crit ? 1.6 : 1);
    dkMover(G.m, e, (e.x - desde.x) / dd * f, (e.y - desde.y) / dd * f, e.r);
    if (!e.jefe && (crit || n >= e.hpMax * 0.25)) e.avisoT = 0;
  }
  play(crit ? 'slam' : 'hit');
  if (e.hp <= 0) dkMuere(e);
}
function dkExplota(q) {
  G.fx.push({ tipo: 'explota', x: q.x, y: q.y, r: q.area, color: q.color }); play('boom');
  for (const e of G.mons) if (e.viva && Math.hypot(e.x - q.x, e.y - q.y) < q.area + e.r) dkDanoA(e, q.dmg);
}
function dkMuere(e) {
  e.viva = false; G.fx.push({ tipo: 'muere', x: e.x, y: e.y, k: e.k }); play('pop');
  const rng = G.m.rng, prof = Math.max(0, e.casa.prof);
  if (e.jefe) { for (let i = 0; i < 3; i++) dkSoltar(e.x, e.y, dkObjetoAzar(rng, 2, 2)); DKS.jefes[G.fac] = (DKS.jefes[G.fac] || 0) + 1; dkAviso('¡Jefe derrotado! ' + e.nombre + ' ha caído', 4); play('womp'); }
  else if (rng() < e.botin) dkSoltar(e.x, e.y, dkObjetoAzar(rng, prof, e.elite ? 1 : 0));
}

