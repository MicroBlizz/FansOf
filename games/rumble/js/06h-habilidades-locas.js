// Fans of Rumble · Habilidades locas (octubre de 2026, tras el flag 'habilidades-nuevas'): lo que hacen en la partida. Su dibujo está en 07g-habilidades-locas-dibujo.js.
// Llamada del CEO, Modo Súper, Wallhack, Ragdoll, Lag, Modo Dios, Bullet Time, Lootbox humana, Spam de emotes, Ping 999, Clipping y Pay to Win.
// Todo lo que decide la partida usa el azar con semilla (srnd); lo visual, Math.random. Se engancha con una línea en: applyAbility (aplica), onLand (llega),
// tickExtras (tick), deathExtras (muere), hurt (golpe), acquire/targetable/separate (Clipping), updateGame (update) y resetMatch (reset).
'use strict';
const LOCAS = {
  manos: [], cuerpos: [], cajas: [], pings: [], cupulas: [], glitches: [], fantasmas: [],
  reset() { this.manos = []; this.cuerpos = []; this.cajas = []; this.pings = []; this.cupulas = []; this.glitches = []; this.fantasmas = []; },
  // desde applyAbility: v es el valor de la copia; sh, entre cuántas unidades se reparte (cartas de enjambre e invocaciones)
  aplica(u, id, v, sh) {
    u.loca = true;
    switch (id) {
      case 'ceo': u.abCeo = v / sh; break;
      case 'super': u.abSuper = v; break;
      case 'wallhack': u.abWallh = v; break;
      case 'ragdoll': u.abRag = v / sh; break;
      case 'lag': u.abLag = v / 100; u.lagHist = []; u.lagCd = 6; break;
      case 'dios': u.abDios = v; break;
      case 'bullet': u.abBullet = v; break;
      case 'lootbox': u.abLoot = v / 100; u.lootSh = sh; break;
      case 'emotes': u.abEmote = v; u.emoteT = 3; break;
      case 'ping': u.abPing = v / 100; break;
      case 'clipping': u.abClip = v; break;
      case 'p2w': u.abP2W = true; u.mDmg *= 1 + v / 100; break;
      default: u.loca = false;
    }
  },
  // desde onLand: lo que pasa al tocar el suelo
  llega(u) {
    if (u.abDios) { u.godT = u.abDios; addNum(u.x, u.y, topOf(u) + 26, 'GOD MODE', '#ffe14d', 15); flashAt(u.x, u.y, topOf(u) * 0.5, 70, '255,225,77', 0.35); play('crown'); }
    if (u.abClip) { u.clipT = u.abClip; u.target = null; u.retarget = 0; addNum(u.x, u.y, topOf(u) + 22, 'NOCLIP', '#7be04a', 14); play('blip'); }
    if (u.abWallh) u.whT = 0.8;
  },
  // desde tickExtras: cada tick de cada unidad (también las que no tienen habilidades locas, por la cámara lenta)
  tick(u, dt) {
    if (u.lentoT > 0) { u.lentoT -= dt; u.atkT += dt * 0.5; }   // Bullet Time: atacan a la mitad de ritmo (y andan a la mitad: slowT)
    if (!u.loca) return;
    if (u.godT > 0) u.godT -= dt;
    if (u.lagFx > 0) u.lagFx -= dt;
    if (u.p2wFx > 0) u.p2wFx -= dt;
    if (u.clipT > 0) { u.clipT -= dt; if (u.clipT <= 0) { u.target = null; u.retarget = 0; } }
    if (u.whT > 0) { u.whT -= dt; if (u.whT <= 0) this.wallhack(u); }
    if (u.superT > 0) { u.superT -= dt; if (u.superT <= 0) { u.mDmg /= 1.5; u.mSpeed /= 1.3; u.mCd /= 0.8; } }
    if (u.abSuper && !u.superUsado && u.hp < u.maxHp * 0.35) {   // Modo Súper: se transforma una vez
      u.superUsado = true; u.superT = u.abSuper; u.superIni = G.t; u.mDmg *= 1.5; u.mSpeed *= 1.3; u.mCd *= 0.8;
      addNum(u.x, u.y, topOf(u) + 28, '¡MODO SÚPER!', '#ffe14d', 17); flashAt(u.x, u.y, topOf(u) * 0.5, 110, '255,215,60', 0.45); ring(u.x, u.y, 6, 90, 'rgba(255,215,60,.95)', 0.45, 6); shake(5); play('hype');
      if (u.team === 'p') chatEv('ability', null, null, 0.5, 12);
    }
    if (u.abBullet && !u.bulletUsado && u.hp < u.maxHp * 0.4) {   // Bullet Time: una vez, con poca vida
      u.bulletUsado = true; const r = 110;
      for (const o of units) if (o.alive && o.team !== u.team && !o.immuneCC && dst(o, u) <= r) { o.slowT = Math.max(o.slowT, u.abBullet); o.lentoT = Math.max(o.lentoT || 0, u.abBullet); }
      this.cupulas.push({ x: u.x, y: u.y, r, t: 0, dur: u.abBullet }); addNum(u.x, u.y, topOf(u) + 26, 'BULLET TIME', '#9fd8ff', 15); play('womp');
    }
    if (u.abLag) {   // Lag: guarda dónde estaba y cada 6 s vuelve allí (2 s atrás) y se cura un poco
      u.lagAcc = (u.lagAcc || 0) + dt; if (u.lagAcc >= 0.25) { u.lagAcc = 0; u.lagHist.push([u.x, u.y]); if (u.lagHist.length > 8) u.lagHist.shift(); }
      u.lagCd -= dt;
      if (u.lagCd <= 0 && u.lagHist.length >= 8 && u.stunT <= 0) {
        u.lagCd = 6; const [x, y] = u.lagHist[0];
        this.fantasmas.push({ type: u.type, face: u.face, x: u.x, y: u.y, ms: u.mScale || 1, t: 0 });
        u.x = x; u.y = y; u.lagHist = []; u.lagFx = 0.5; u.target = null; u.retarget = 0;
        u.hp = Math.min(u.maxHp, u.hp + u.maxHp * u.abLag);
        addNum(u.x, u.y, topOf(u) + 22, '¡LAG!', '#ff4b5c', 15); play('blip');
      }
    }
    if (u.abEmote) {   // Spam de emotes: cada 7 s baila y los de alrededor se quedan mirando
      if (u.bailaT > 0) u.bailaT -= dt;
      u.emoteT -= dt;
      if (u.emoteT <= 0 && u.stunT <= 0) {
        const cerca = units.filter(o => o.alive && o.team !== u.team && o.deployT <= 0 && !o.immuneCC && !o.jump && dst(o, u) - o.r <= 80);
        if (!cerca.length) u.emoteT = 0.5;
        else { u.emoteT = 7; u.bailaT = 0.9; for (const o of cerca) { o.stunT = Math.max(o.stunT, u.abEmote); o.stunKind = 'emote'; o.emoteN = (o.id + SIM.tick) % 4; } addNum(u.x, u.y, topOf(u) + 24, '¡BAILE!', '#ff9be6', 14); play('laugh'); }
      }
    }
  },
  // Wallhack: avanza de golpe por su camino (con los mismos puentes que andando) hasta abWallh de distancia o hasta tener a tiro a su objetivo
  wallhack(u) {
    const t = u.target && u.target.alive ? u.target : laneStruct(u); if (!t) return;
    const ox = u.x, oy = u.y, sl = u.slowT; let queda = u.abWallh, n = 0; u.slowT = 0;
    while (queda > 1 && n++ < 500) { const px = u.x, py = u.y; moveToward(u, t.x, t.y, 0.02); const d = hyp(u.x - px, u.y - py); if (d < 0.05 || edgeDist(u, t) <= rangeOf(u)) break; queda -= d; }
    u.slowT = sl; u.runDist = 0; u.moving = false; u.target = null; u.retarget = 0;
    u.stealthT = Math.max(u.stealthT || 0, 1.5); u.abSurprise = u.abSurprise || 2;   // llega invisible y su primer golpe hace el doble
    this.glitches.push({ x0: ox, y0: oy, x1: u.x, y1: u.y, t: 0 }); addNum(u.x, u.y, topOf(u) + 22, 'WALLHACK', '#7be04a', 14); play('zap');
  },
  // desde deathExtras
  muere(t) {
    if (t.abCeo) { this.manos.push({ x: t.x, y: t.y, team: t.team, dmg: t.abCeo * (t.mLvl || 1), t: 0 }); addNum(t.x, t.y, topOf(t) + 26, '¡LLAMADA DEL CEO!', '#ffcb3d', 14); play('horn'); }
    if (t.abRag) {   // vuela hacia el enemigo más cercano (o hacia delante)
      let best = null, bd = 150; for (const o of units) if (o.alive && o.team !== t.team && o.deployT <= 0) { const d = dst(o, t); if (d < bd) { bd = d; best = o; } }
      const dir = bases[other(t.team)].y > t.y ? 1 : -1, x1 = best ? best.x : t.x, y1 = best ? best.y : t.y + dir * 70;
      this.cuerpos.push({ type: t.type, team: t.team, face: t.face, ms: t.mScale || 1, x0: t.x, y0: t.y, x1, y1, t: 0, dur: 0.55, dmg: t.abRag * (t.mLvl || 1) }); play('jump');
    }
    if (t.abLoot && srnd() < 1 / (t.lootSh || 1)) { this.cajas.push({ x: t.x, y: t.y, team: t.team, f: t.abLoot, t: 0, vida: 10 }); play('card'); }
  },
  // desde hurt: devuelve true si el golpe ya está resuelto (Modo Dios lo para; Ping 999 lo deja para luego)
  golpe(t, amount, src, style) {
    if (t.kind === 'unit' && t.godT > 0) { if (!t.godNumT || G.t - t.godNumT > 0.25) { t.godNumT = G.t; addNum(t.x + rand(-6, 6), t.y, topOf(t) * 0.75 + 6, '0', '#ffe14d', 17); } return true; }
    if (src && src.abPing && style !== 'ping') {
      this.pings.push({ o: t, src, dmg: amount * (1 + src.abPing), t: 0 });
      if (!src.pingNumT || G.t - src.pingNumT > 0.6) { src.pingNumT = G.t; addNum(t.x, t.y, topOf(t) + 24, '999 ms', '#7df3ff', 12); }
      return true;
    }
    if (src && src.abP2W && S && (style === 'hit' || style === 'crit' || style === 'rage')) {   // Pay to Win: cada golpe cuesta CAOS
      S[src.team].chaos = Math.max(0, S[src.team].chaos - 0.05); src.p2wFx = 0.35;
    }
    return false;
  },
  // desde updateGame: lo que hay suelto por el campo
  update(dt) {
    for (const m of this.manos) {   // la mano del CEO cae a los 0,75 s
      m.t += dt;
      if (!m.hecho && m.t >= 0.75) {
        m.hecho = true;
        for (const o of units) if (o.alive && o.team !== m.team && hyp(o.x - m.x, o.y - m.y) - o.r <= 70) { hurt(o, m.dmg, null, 'aoe'); if (o.alive && !o.immuneCC) { o.stunT = Math.max(o.stunT, 0.6); o.stunKind = 'daze'; } }
        ring(m.x, m.y, 10, 95, 'rgba(255,203,61,.95)', 0.5, 7); puff(m.x, m.y, 18, '#e9dcc0', 110, 10, true); flashAt(m.x, m.y, 10, 110, '255,240,200', 0.4);
        addNum(m.x, m.y, 70, '¡PLAF!', '#ffcb3d', 22); shake(10); play('slam'); play('boom');
      }
    }
    this.manos = this.manos.filter(m => m.t < 1.5);
    for (const b of this.cuerpos) {   // el ragdoll aterriza
      b.t += dt;
      if (!b.hecho && b.t >= b.dur) {
        b.hecho = true;
        for (const o of units) if (o.alive && o.team !== b.team && hyp(o.x - b.x1, o.y - b.y1) - o.r <= 45) { hurt(o, b.dmg, null, 'aoe'); if (o.alive && !o.immuneCC) { o.stunT = Math.max(o.stunT, 0.5); o.stunKind = 'daze'; } }
        puff(b.x1, b.y1, 12, '#e9dcc0', 80, 8, true); ring(b.x1, b.y1, 6, 55, 'rgba(255,255,255,.9)', 0.35, 5); addNum(b.x1, b.y1, 50, '¡PLOF!', '#ffffff', 18); shake(5); play('slam');
      }
    }
    this.cuerpos = this.cuerpos.filter(b => b.t < b.dur + 0.45);
    for (const c of this.cajas) {   // la lootbox: la coge el primer aliado que pasa
      c.t += dt; if (c.t < 0.5 || c.cogida) continue;
      for (const a of units) if (a.alive && a.team === c.team && a.deployT <= 0 && !a.jump && hyp(a.x - c.x, a.y - c.y) <= a.r + 14) { c.cogida = true; c.tc = c.t; this.premio(a, c); break; }
    }
    this.cajas = this.cajas.filter(c => (c.cogida ? c.t - c.tc < 0.8 : c.t < c.vida));
    for (const p of this.pings) { p.t += dt; if (p.t >= 1 && !p.hecho) { p.hecho = true; if (p.o.alive) hurt(p.o, p.dmg, p.src && p.src.alive ? p.src : null, 'ping'); } }
    this.pings = this.pings.filter(p => !p.hecho);
    for (const L of [this.cupulas, this.glitches, this.fantasmas]) for (const q of L) q.t += dt;
    this.cupulas = this.cupulas.filter(q => q.t < q.dur + 0.4); this.glitches = this.glitches.filter(q => q.t < 0.7); this.fantasmas = this.fantasmas.filter(q => q.t < 0.6);
  },
  premio(a, c) {   // la mejora de la lootbox, al azar con semilla
    const k = Math.floor(srnd() * 4), f = c.f; c.premio = k;
    if (k === 0) { a.hp = Math.min(a.maxHp, a.hp + a.maxHp * f * 1.2); addNum(a.x, a.y, topOf(a) + 26, '¡+VIDA!', '#8cf05a', 16); }
    else if (k === 1) { a.mDmg *= 1 + f * 0.8; addNum(a.x, a.y, topOf(a) + 26, '¡+DAÑO!', '#ff8a3d', 16); }
    else if (k === 2) { a.shieldMax = Math.max(a.shieldMax || 0, Math.round(a.maxHp * f)); a.shield = a.shieldMax; addNum(a.x, a.y, topOf(a) + 26, '¡ESCUDO!', '#7df3ff', 16); }
    else { a.mSpeed *= 1 + f * 0.6; a.mCd *= 1 - f * 0.4; addNum(a.x, a.y, topOf(a) + 26, '¡TURBO!', '#ffe14d', 16); }
    ring(c.x, c.y, 6, 60, 'rgba(255,203,61,.95)', 0.4, 5); play('crown');
  },
};
