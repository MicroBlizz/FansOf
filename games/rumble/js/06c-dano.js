// Fans of Rumble · Combate (3/5): daño, muertes, proyectiles y su vuelo
'use strict';

function hurt(t, amount, src, style = 'hit') {
  if (!t || !t.alive) return;
  if (t.kind === 'struct' && t.reviewUntil > G.t) amount *= 1 + (t.reviewAmp || 0.4);   // v0.9.20: Review bombing
  if (t.kind === 'unit') t.hitAt = G.t;   // v0.9.23: para la pasiva SIN CRUNCH
  if (src && src.kind === 'unit') for (const c of units) if (c.abCute && c.alive && c.team !== src.team && dist(c, src) <= 75) { amount *= 1 - c.abCute; break; }   // orejas de gato
  if (t.kind === 'unit') {
    if (t.jump) return;
    if (t.invulnT > 0) { if (Math.random() < 0.25) addNum(t.x, t.y, topOf(t) + 12, 'PAUSA', '#7df3ff', 12); return; }
    if (t.abDodge && src && Math.random() < t.abDodge) { addNum(t.x + rand(-6, 6), t.y, topOf(t) + 12, '¡ESQUIVA!', '#7df3ff', 13); return; }
    if (t.markT > 0) amount *= 1 + (t.markF || 0);   // marcado por el Detective
    if (t.d.armor) amount *= 1 - t.d.armor;
    if (t.abArmor) amount *= 1 - t.abArmor;
    t.shT = 0;
    if (t.bshield > 0) {   // v0.9.13: barrera dorada del muro de escudos (VikingoPerdido)
      const ab = Math.min(t.bshield, amount); t.bshield -= ab; amount -= ab; t.hitT = 0.12;
      if (ab >= 1) addNum(t.x + rand(-7, 7), t.y, topOf(t) * 0.75 + 10, Math.round(ab), '#ffe08a', 13);
      if (t.bshield <= 0.01) { t.bshield = 0; t.bshT = 0; ring(t.x, t.y, 6, t.r * 2.4, 'rgba(255,203,61,.95)', 0.3, 4); sparks(t.x, t.y, topOf(t) * 0.5, 6, '#ffe08a'); play('shield'); }
      if (amount < 0.5) { sparks(t.x, t.y, topOf(t) * 0.45, 2, '#ffe08a'); return; }
    }
    if (t.shield > 0) {   // Escudos de plasma: absorben primero
      const ab = Math.min(t.shield, amount); t.shield -= ab; amount -= ab; t.hitT = 0.12;
      if (ab >= 1) addNum(t.x + rand(-7, 7), t.y, topOf(t) * 0.75 + 10, Math.round(ab), '#7df3ff', 13);
      if (t.shield <= 0.01) { t.shield = 0; ring(t.x, t.y, 6, t.r * 2.4, 'rgba(34,227,255,.95)', 0.3, 4); sparks(t.x, t.y, topOf(t) * 0.5, 6, '#7df3ff'); play('shield'); }
      if (amount < 0.5) { sparks(t.x, t.y, topOf(t) * 0.45, 2, '#7df3ff'); return; }
    }
  }
  if (t.kind === 'unit' && t.abPause && !t.pauseUsed && t.hp - amount <= t.maxHp * 0.2) {   // Botón de pausa
    t.pauseUsed = true; t.invulnT = t.abPause; addNum(t.x, t.y, topOf(t) + 24, '¡PAUSA!', '#7df3ff', 16); ring(t.x, t.y, 6, t.r * 3, 'rgba(125,243,255,.95)', 0.4, 5); play('shield');
    if (t.team === 'p') chatEv('ability', null, null, 0.5, 15);
    return;
  }
  amount = Math.round(amount);
  if (G.mode === 'boss' && t === bases.e) S.p.bossDmg += Math.min(amount, Math.max(0, t.hp));
  if (G.mode === 'sandbox' && t.team === 'e') sbDamage(amount);   // v0.9.20: contador de daño
  t.hp -= amount; t.hitT = 0.12;
  if (t.kind === 'unit' && src && src.x !== undefined) { const kd = Math.hypot(t.x - src.x, t.y - src.y) || 1; t.kbX = (t.x - src.x) / kd; t.kbY = (t.y - src.y) / kd; t.kbT = 0.18; }   // v0.9.24: retroceso visual
  if (src && src.abVamp && src.alive && src.kind === 'unit') { const hv = Math.min(src.maxHp - src.hp, amount * src.abVamp); src.hp += hv; if (hv >= 2 && Math.random() < 0.45) addNum(src.x + rand(-5, 5), src.y, topOf(src) * 0.75 + 8, '+' + Math.round(hv), '#8cf05a', 13); }
  const col = style === 'crit' ? '#ffd23f' : style === 'aoe' ? '#f3a6ff' : style === 'boss' ? '#ff6b7a' : style === 'rage' ? '#ff8a3d' : '#ffffff';
  addNum(t.x + rand(-7, 7), t.y, topOf(t) * 0.75 + 6, amount, col, style === 'crit' ? 22 : style === 'rage' ? 16 : t.kind === 'struct' ? 14 : 15);
  sparks(t.x, t.y, topOf(t) * 0.45, style === 'hit' ? 3 : 6, t.team === 'e' ? '#bfe9ff' : '#ffe7a8');
  if (SAVE.blood && t.kind === 'unit') for (let i = 0; i < (style === 'hit' ? 3 : 5); i++)   // v0.9.19: Opciones → sangre: una niebla roja pequeña que se va (sin charcos)
    parts.push({ type: 'dust', x: t.x + rand(-5, 5), y: t.y + rand(-2, 2), z: topOf(t) * rand(0.35, 0.65), vx: rand(-22, 22), vy: 0, vz: rand(4, 16), g: 0, life: rand(0.35, 0.55), max: 0.55, size: rand(2.6, 4.2), color: 'rgba(200,16,32,.75)' });
  if (!t.fxT || G.t - t.fxT > 0.07) { t.fxT = G.t; const big = style === 'crit'; impact(t.x + rand(-4, 4), t.y, topOf(t) * 0.5 + rand(-4, 4), big ? 23 : style === 'aoe' ? 15 : t.kind === 'struct' ? 15 : 14, big ? '#ffd23f' : t.team === 'e' ? '#d8f1ff' : '#fff0c2'); hitLines(t.x, t.y, topOf(t) * 0.5, big ? 8 : 5, big ? '#ffd23f' : '#ffffff', big); if (big) flashAt(t.x, t.y, topOf(t) * 0.5, 36, '255,210,63', 0.25); }
  play(t.kind === 'unit' && t.team === 'e' ? 'clank' : 'hit');
  if (t.kind === 'struct') shake(style === 'aoe' ? 5 : 1.2);
  if (t.kind === 'struct' && t.role === 'base' && !t.lowSaid && t.hp > 0 && t.hp < t.maxHp * 0.35) { t.lowSaid = true; chatEv(t.team === 'e' ? 'baseLowE' : 'baseLowP', null, null, 1, 0); }
  if (t.hp <= 0) kill(t, src);
}
function kill(t, src) {
  t.alive = false; t.hp = 0;
  if (t.kind === 'unit') {
    deathFx(t, src);
    // Renacer (No-Muertos): revive una vez, salvo los invocados
    const nm = facOf(t.team) === 'nomuertos';
    const live = G.state === 'play' || G.state === 'ending';
    const willRevive = (nm || t.abRevive || t.d.remaster) && !t.revived && !t.summon && live;
    if (willRevive) {
      const rm = !nm && !t.abRevive;   // v0.9.13: Remaster 70 € vuelve una vez (el mismo juego, otra vez a precio completo)
      revives.push({ team: t.team, type: t.type, x: t.x, y: t.y, face: t.face, t: CFG.passives.nomuertos.delay, frac: nm ? CFG.passives.nomuertos.hpFrac : rm ? t.d.remaster : t.abRevive, txt: rm ? '¡REMASTER!' : null, col: rm ? '#ffcb3d' : null, rgb: rm ? '255,203,61' : null });
      if (rm) { addNum(t.x, t.y, topOf(t) + 20, 'VUELVE A 70 €', '#ffcb3d', 13); if (t.team === 'e') chatEv('remaster', null, null, 0.7, 10); }
      else parts.push({ type: 'grave', x: t.x, y: t.y, z: 0, life: CFG.passives.nomuertos.delay + 0.3, max: CFG.passives.nomuertos.delay + 0.3 });
    }
    // v0.9.13: Secuela (Cultura Pop): 3 de cada 10 vuelven en versión «2»
    const PP = CFG.passives.pop, seq = !willRevive && facOf(t.team) === 'pop' && !t.sequel && !t.summon && !t.isClone && live && Math.random() < PP.chance;
    if (seq) {
      revives.push({ team: t.team, type: t.type, x: t.x, y: t.y, face: t.face, t: 0.9, frac: 1, seq: true, txt: '¡SECUELA!', col: '#ff9ab8', rgb: '255,154,184' });
      parts.push({ type: 'clapper', x: t.x, y: t.y, z: topOf(t) * 0.6 + 14, life: 1.1, max: 1.1 });
    }
    deathExtras(t, src);
    if (t.d.deathBlast) {
      const B = t.d.deathBlast, rgb = B.rgb || '123,224,74';
      for (const o of units) if (o.alive && o.team !== t.team && Math.hypot(o.x - t.x, o.y - t.y) - o.r <= B.r) hurt(o, B.dmg * (t.mLvl || 1), null, 'aoe');
      ring(t.x, t.y, 10, B.r * 1.3, `rgba(${rgb},.9)`, 0.55, 7); puff(t.x, t.y, 16, B.c1 || '#7be04a', 80, 10, false, 14); puff(t.x, t.y, 8, B.c2 || '#c6a4c9', 50, 8, false, 20);
      addNum(t.x, t.y, 64, B.txt || '¡NUBE TÓXICA!', B.tc || '#9cf06a', 16); flashAt(t.x, t.y, 14, 90, rgb, 0.4); shake(6); play('trash');
      if (B.txt && t.team === 'p') chatEv('ability', null, null, 0.4, 12);
    }
    if (isLeader(t.type) && !willRevive && !seq) { const sec = Math.round(CFG.cards[t.type].respawn * (t.respawnM || 1) * (t.team === 'p' ? G.pRespawnM || 1 : 1)); S[t.team].leaderCd = sec; if (t.team === 'p') toast(`${CFG.cards[t.type].name} ha caído. Vuelve en ${sec} s`); }
    if (t.abClone && !t.isClone && (G.state === 'play' || G.state === 'ending')) {   // Clon viral
      for (const ox of [-12, 12]) { const c = spawnUnit(t.team, t.type, clamp(t.x + ox, 24, W - 24), t.y); c.isClone = true; c.summon = true; c.abClone = 0; c.labelT = 0; c.mScale *= 0.7; c.r *= 0.7; c.maxHp = Math.max(1, Math.round(c.maxHp * t.abClone)); c.hp = c.maxHp; c.deployT = c.deployMax = 0.3; c.rising = true; }
      addNum(t.x, t.y, topOf(t) + 20, '¡CLON VIRAL!', '#ffe14d', 15); play('pop');
    }
    if (src && src.alive && src.kind === 'unit' && src.d.restealth) src.stealthT = src.d.restealth;   // SlyFox y GhostAgent vuelven a desaparecer
    if (facOf(t.team) === 'microblizz' && G.state === 'play' && CFG.enemyCards[t.type]) {
      const card = CFG.enemyCards[t.type]; const refund = (card.cost / card.count) * CFG.passives.e.refund;
      S[t.team].chaos = Math.min(CFG.chaosMax, S[t.team].chaos + refund);
      addNum(t.x, t.y, TYPES[t.type].top + 34, '+' + String(Math.round(refund * 10) / 10).replace('.', ',') + ' CAOS', '#8fc2ff', 11);
      if (!G.layoffShown) { G.layoffShown = true; banner('DESPIDOS RENTABLES', 'Pasiva de Microblizz: cada bot despedido le devuelve CAOS', 'enemy'); }
    }
    if (t.d.eject) {
      const n = t.d.ejectN || 1;
      for (let i = 0; i < n; i++) { const v = spawnUnit(t.team, t.d.eject, clamp(t.x + (n > 1 ? (i - (n - 1) / 2) * 18 : 0), 24, W - 24), t.y); v.deployT = v.deployMax = 0.35; v.face = t.face; v.labelT = 0; v.summon = true; }
      addNum(t.x, t.y, 70, t.d.ejectTxt || '¡EYECCIÓN!', '#ff8fc8', 18); play('eject');
    }
    if (G.state === 'play' && !t.summon && G.t >= (G.quipT || 0) && Math.random() < (t.team === 'p' ? 0.12 : 0.4)) {   // frase de despedida
      const pool = t.team === 'p' ? QUIPS.player.concat(QUIPS_FAC[G.faction] || []) : isCorp(facOf(t.team)) ? QUIPS[facOf(t.team)] : (ownerOf() === 'phony' ? QUIPS.corruptPh : ownerOf() === 'iahorro' ? QUIPS.corruptIa : QUIPS.corrupt).concat(QUIPS_CORRUPT[facOf(t.team)] || []);
      parts.push({ type: 'quip', x: clamp(t.x, 70, W - 70), y: t.y, z: topOf(t) + 24, vz: 9, txt: pick(pool), life: 3.3, max: 3.3 }); G.quipT = G.t + 3.2;
    }
    S[other(t.team)].kills++; if (G.state === 'play') passiveKill(other(t.team));
    if (t.team === 'e' && !t.summon) { const sp = S.p; sp.kb = sp.kb || {}; sp.kb[t.type] = (sp.kb[t.type] || 0) + 1; if (isLeader(t.type)) sp.kl = (sp.kl || 0) + 1; }   // v0.9.14: para los logros
    if (t.team === 'e' && G.state === 'play') { chatSt.kq = (chatSt.kq || []).filter(x => G.t - x < 2.5); chatSt.kq.push(G.t); if (chatSt.kq.length >= 3) { chatSt.kq = []; chatEv('multikill', null, null, 1, 10); } }
    if (isLeader(t.type) && !willRevive && !seq) chatEv(t.team === 'p' ? 'leaderDown' : 'eLeaderDown', CFG.cards[t.type].name, null, 0.85, 8);
    return;
  }
  structDeathFx(t);
  if (G.state !== 'play') return;
  const winner = other(t.team);
  if (t.role === 'base') { S[winner].crowns = 3; endMatch(winner, 'base'); return; }
  S[winner].crowns++;
  if (winner === 'p') { if (facOf('e') === 'streamers') { S.e.hype = 0; S.e.hypeLvl = 0; } banner('¡TORRE DERRIBADA!', 'Microblizz dice que esa torre le sobraba', 'player'); play('crown'); chatBurst(S.p.crowns === S.e.crowns && S.e.crowns > 0 ? 'comeback' : 'towerP', 2); }
  else {
    const lostHype = facOf('p') === 'streamers' && S.p.hype > 0; if (lostHype) { S.p.hype = 0; S.p.hypeLvl = 0; }
    chatBurst('towerE', 2);
    banner('TE HAN TIRADO UNA TORRE', lostHype ? 'El chat se va: tu HYPE vuelve a 0' : 'Protege ese carril con más unidades', 'enemy'); play('sad');
  }
}
// Hype (Streamers) y Experiencia (Héroes) suben con cada bot despedido
function passiveKill(team) {
  const f = facOf(team), St = S[team], mine = team === 'p';
  if (f === 'streamers') {
    const P = CFG.passives.streamers; St.hype++;
    const lvl = Math.min(P.max, Math.floor(St.hype / P.per));
    if (lvl > St.hypeLvl) {
      St.hypeLvl = lvl; if (mine) { banner('HYPE ' + lvl, `El chat está que arde: tu equipo ataca un ${lvl * 5} % más rápido`, 'stream'); play('hype'); }
      for (const u of units) if (u.alive && u.team === team) ring(u.x, u.y, 4, u.r * 2.4, 'rgba(192,132,252,.95)', 0.45, 4);
    }
  } else if (f === 'heroes') {
    const P = CFG.passives.heroes; St.xp++;
    const lvl = Math.min(P.max, Math.floor(St.xp / P.per));
    if (lvl > St.xpLvl) {
      St.xpLvl = lvl;
      for (const u of units) if (u.alive && u.team === team) { const old = u.maxHp; u.maxHp = Math.round(u.hpBase * (1 + lvl * P.step)); u.hp += u.maxHp - old; ring(u.x, u.y, 4, u.r * 2.4, 'rgba(255,203,61,.95)', 0.45, 4); }
      if (mine) { banner('¡NIVEL ' + lvl + '!', `Tu ejército sube de nivel: +${lvl * 5} % de vida y daño`, 'hero'); play('levelup'); }
    }
  }
}
// proyectiles: velocidad, parábola (lob), sonido, chispa y aro de impacto
const PROJ = {
  acorn: { v: 300, lob: 0.12, sfx: 'acorn' }, carrot: { v: 280, lob: 0.12, sfx: 'carrot' }, trash: { v: 250, lob: 0.25, sfx: 'carrot' }, soulfire: { v: 290, lob: 0.12, sfx: 'carrot', spark: '#7dffb8' },
  laser: { v: 720, sfx: 'laser', spark: '#33e0ff' }, eyelaser: { v: 640, sfx: 'eyelaser' }, plasma: { v: 360, sfx: 'plasma', spark: '#a98bff' }, shadow: { v: 380, sfx: 'plasma', spark: '#b27dff' }, frost: { v: 400, sfx: 'plasma', spark: '#bff6ff' }, wave: { v: 300, sfx: 'plasma', spark: '#e6dcff', ring: 'rgba(230,220,255,.9)' },
  heart: { v: 330, sfx: 'pop', spark: '#ff8fd0' }, bolt: { v: 640, sfx: 'zap', spark: '#ffe14d' }, neon: { v: 700, sfx: 'laser', spark: '#ff3df0' }, meme: { v: 300, lob: 0.08, sfx: 'pop', spark: '#ffe14d' },
  clip: { v: 420, sfx: 'pop', spark: '#ffffff' }, bullet: { v: 820, sfx: 'gun', spark: '#ffe66b' }, snipe: { v: 1300, sfx: 'snipe', spark: '#ff3df0' }, code: { v: 380, sfx: 'gun', spark: '#7be04a' },
  venom: { v: 360, sfx: 'plasma', spark: '#7be04a' }, arrow: { v: 520, sfx: 'acorn', spark: '#ff8fd0' }, card: { v: 400, sfx: 'card', spark: '#ffffff' }, gif: { v: 460, sfx: 'pop', spark: '#ffe14d' },
  shell: { v: 260, lob: 0.3, sfx: 'carrot', ring: 'rgba(255,170,60,.95)' }, note: { v: 300, sfx: 'note', spark: '#ff8fd0', ring: 'rgba(255,143,208,.9)' }, fireball: { v: 300, lob: 0.15, sfx: 'card', ring: 'rgba(255,120,40,.95)' },
  // v0.9.13
  pixel: { v: 420, sfx: 'blip', spark: '#ff9a3c' }, payray: { v: 680, sfx: 'laser', spark: '#ffcb3d' }, popcorn: { v: 300, lob: 0.15, sfx: 'pop', spark: '#fff7e0' }, rgb: { v: 720, sfx: 'laser', spark: '#22e3ff' },
  missile: { v: 360, sfx: 'missile', spark: '#ffb347' }, disc: { v: 430, sfx: 'pop', spark: '#e5e7eb' }, contract: { v: 380, sfx: 'card', spark: '#ffffff' }, paper: { v: 360, sfx: 'card', spark: '#f5f0e1' },
};
function shoot(src, tgt, kind, dmg, style = 'hit') {
  const sx = src.x + (src.kind === 'unit' ? src.face * 12 * (src.mScale || 1) : src.muzzleX), sy = src.y;
  const sz = src.kind === 'struct' ? src.muzzleZ : topOf(src) * 0.5;
  const d = Math.hypot(tgt.x - sx, tgt.y - sy); const P = PROJ[kind];
  const pr = { kind, x: sx, y: sy, z: sz, sx, sy, sz, tgt, tx: tgt.x, ty: tgt.y, t: 0, dur: Math.max(0.1, d / P.v), dmg, team: src.team, src, arc: P.lob ? 30 + d * P.lob : 0, splash: src.kind === 'unit' ? src.d.splash || 0 : 0, style };
  projs.push(pr); play(P.sfx); return pr;
}
function bounceShot(p) {
  const from = p.tgt; let best = null, bd = 95;
  for (const o of units) if (o !== from && o.team !== p.team && targetable(o)) { const d = dist(o, from); if (d < bd) { bd = d; best = o; } }
  if (!best) return;
  const sz = topOf(from) * 0.45;
  projs.push({ kind: p.kind, x: from.x, y: from.y, z: sz, sx: from.x, sy: from.y, sz, tgt: best, tx: best.x, ty: best.y, t: 0, dur: Math.max(0.08, bd / PROJ[p.kind].v), dmg: p.dmg * p.src.d.bounce, team: p.team, src: p.src, arc: 0, splash: 0, style: 'aoe', bounced: true });
}
function updateProjs(dt) {
  for (const p of projs) {
    p.t += dt; if (p.tgt.alive) { p.tx = p.tgt.x; p.ty = p.tgt.y; }
    const k = Math.min(1, p.t / p.dur); const tz = p.tgt.alive ? topOf(p.tgt) * 0.45 : 6;
    p.x = lerp(p.sx, p.tx, k); p.y = lerp(p.sy, p.ty, k); p.z = lerp(p.sz, tz, k) + Math.sin(Math.PI * k) * p.arc;
    if (k >= 1) {
      p.done = true;
      const P = PROJ[p.kind];
      if (p.splash) {
        for (const o of units) if (o.alive && o.team !== p.team && Math.hypot(o.x - p.x, o.y - p.y) - o.r <= p.splash) hurt(o, p.dmg, p.src, 'aoe');
        if (p.tgt.kind === 'struct' && p.tgt.alive) hurt(p.tgt, p.dmg, p.src, 'aoe');
        ring(p.x, p.y, 6, p.splash, P.ring || 'rgba(255,170,60,.9)', 0.35, 5);
        if (p.kind === 'note') { for (let i = 0; i < 3; i++) parts.push({ type: 'note', x: p.x + rand(-14, 14), y: p.y, z: rand(8, 20), vx: 0, vy: 0, vz: 30, g: 0, life: 0.7, max: 0.7, col: pick(['#ff8fd0', '#22e3ff', '#ffe14d']) }); play('note'); }
        else if (p.kind === 'wave') sparks(p.x, p.y, 8, 5, '#e6dcff');
        else { puff(p.x, p.y, 8, p.kind === 'fireball' ? '#ff8a1f' : '#ffb347', 60, 7, false, 6); if (p.kind === 'trash') chips(p.x, p.y, 6, 6, ['#2a2e3a', '#7be04a', '#c9cbd3', '#ffcb3d'], 'chip', 3.5); else sparks(p.x, p.y, 8, 8, '#ffd34d'); play('trash'); }
        continue;
      }
      if (p.tgt.alive && p.tgt.kind === 'unit' && p.src && p.src.d) {
        const sl = p.src.d.slow || p.src.abSlow; if (sl && !p.tgt.immuneCC) p.tgt.slowT = sl.t;
        if (p.src.d.stunOnHit) { p.tgt.stunT = Math.max(p.tgt.stunT, p.src.d.stunOnHit); p.tgt.stunKind = 'daze'; }
        if (p.src.d.mark) { if (!(p.tgt.markT > 0)) addNum(p.tgt.x, p.tgt.y, topOf(p.tgt) + 18, '¡PISTA!', '#ffe14d', 12); p.tgt.markT = p.src.d.mark.t; p.tgt.markF = p.src.d.mark.f; }
      }
      if (p.tgt.alive) { hurt(p.tgt, p.dmg, p.src, p.style); if (p.src && p.src.abChain && p.src.kind === 'unit') chainOne(p.src, p.tgt, p.dmg * p.src.abChain); }
      if (p.src && p.src.d && p.src.d.bounce && !p.bounced && p.tgt.kind === 'unit') bounceShot(p);   // v0.9.13: el disco del Coleccionista rebota
      if (p.src && p.src.abSplash && p.src.kind === 'unit') confetti(p.src, p.tgt, p.dmg * p.src.abSplash);
      if (p.kind === 'acorn' || p.kind === 'carrot') chips(p.x, p.y, p.z, 3, p.kind === 'acorn' ? ['#9a6a33', '#5b3a1c'] : ['#ff8a1f', '#5cc23a'], 'chip', 3);
      else sparks(p.x, p.y, p.z, 4, P.spark || '#ff3348');
    }
  }
  projs = projs.filter(p => !p.done);
}
